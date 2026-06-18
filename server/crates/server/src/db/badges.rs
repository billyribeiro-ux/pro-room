//! Badge registry + per-user assignment, and the resolver that attaches an
//! author's badges (plus the derived trial/new/tenure indicators) to chat
//! messages and alerts — mirroring the reference's per-message badge data.
//!
//! Runtime queries throughout (no `query!` macro), so the offline `.sqlx` cache
//! does not need regenerating for these.

use anyhow::Context as _;
use domain::UserId;
use serde::Serialize;
use sqlx::PgPool;
use std::collections::HashMap;
use uuid::Uuid;

/// A badge in the admin-defined registry. Rendered as an `<img>` when `image_url`
/// is set, otherwise a coloured text pill (`label` on `bg_color`/`text_color`).
#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct Badge {
    pub id: Uuid,
    pub slug: String,
    pub label: String,
    pub image_url: Option<String>,
    pub bg_color: String,
    pub text_color: String,
    pub position: i32,
}

/// The badge data attached to a message/alert author: the assigned custom badges
/// plus the reference's derived indicators (Trial / New / tenure stars). Flattened
/// into the message/alert view + the live event so the client renders them inline.
#[derive(Debug, Clone, Serialize, Default)]
pub struct AuthorBadges {
    pub badges: Vec<Badge>,
    /// Free-trial member — the reference's red "Trial" pill.
    pub is_trial: bool,
    /// Joined within the last 14 days — the reference's "New" pill.
    pub is_new: bool,
    /// Whole years since the account was created — the reference's tenure stars;
    /// `None`/0 hides the stars.
    pub years: Option<i32>,
}

/// The full badge registry, ordered for display.
pub async fn list(pool: &PgPool) -> anyhow::Result<Vec<Badge>> {
    sqlx::query_as::<_, Badge>(
        "SELECT id, slug, label, image_url, bg_color, text_color, position \
         FROM badges ORDER BY position, label",
    )
    .fetch_all(pool)
    .await
    .context("list badges")
}

#[allow(clippy::too_many_arguments)]
pub async fn create(
    pool: &PgPool,
    slug: &str,
    label: &str,
    image_url: Option<&str>,
    bg_color: &str,
    text_color: &str,
    position: i32,
    created_by: UserId,
) -> anyhow::Result<Badge> {
    sqlx::query_as::<_, Badge>(
        "INSERT INTO badges (slug, label, image_url, bg_color, text_color, position, created_by) \
         VALUES ($1, $2, $3, $4, $5, $6, $7) \
         RETURNING id, slug, label, image_url, bg_color, text_color, position",
    )
    .bind(slug)
    .bind(label)
    .bind(image_url)
    .bind(bg_color)
    .bind(text_color)
    .bind(position)
    .bind(created_by.as_uuid())
    .fetch_one(pool)
    .await
    .context("create badge")
}

/// Delete a badge from the registry (cascades to assignments). Returns whether a
/// row was removed.
pub async fn delete(pool: &PgPool, id: Uuid) -> anyhow::Result<bool> {
    let affected = sqlx::query("DELETE FROM badges WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await
        .context("delete badge")?
        .rows_affected();
    Ok(affected == 1)
}

/// Assign a badge to a user (idempotent).
pub async fn assign(
    pool: &PgPool,
    user_id: UserId,
    badge_id: Uuid,
    assigned_by: UserId,
) -> anyhow::Result<()> {
    sqlx::query(
        "INSERT INTO user_badges (user_id, badge_id, assigned_by) VALUES ($1, $2, $3) \
         ON CONFLICT (user_id, badge_id) DO NOTHING",
    )
    .bind(user_id.as_uuid())
    .bind(badge_id)
    .bind(assigned_by.as_uuid())
    .execute(pool)
    .await
    .context("assign badge")?;
    Ok(())
}

/// Remove a badge assignment from a user.
pub async fn unassign(pool: &PgPool, user_id: UserId, badge_id: Uuid) -> anyhow::Result<()> {
    sqlx::query("DELETE FROM user_badges WHERE user_id = $1 AND badge_id = $2")
        .bind(user_id.as_uuid())
        .bind(badge_id)
        .execute(pool)
        .await
        .context("unassign badge")?;
    Ok(())
}

#[derive(sqlx::FromRow)]
struct AssignedRow {
    user_id: Uuid,
    id: Uuid,
    slug: String,
    label: String,
    image_url: Option<String>,
    bg_color: String,
    text_color: String,
    position: i32,
}

#[derive(sqlx::FromRow)]
struct FlagRow {
    id: Uuid,
    is_trial: bool,
    created_at: time::OffsetDateTime,
}

/// Resolve the badge data for a set of authors in TWO queries (assignments +
/// flags), returning a map keyed by user id. Authors with no badges/flags simply
/// map to a default (empty) entry. Used by the message/alert list views.
pub async fn for_authors(
    pool: &PgPool,
    user_ids: &[UserId],
) -> anyhow::Result<HashMap<UserId, AuthorBadges>> {
    let mut out: HashMap<UserId, AuthorBadges> = HashMap::new();
    if user_ids.is_empty() {
        return Ok(out);
    }
    let ids: Vec<Uuid> = user_ids.iter().map(UserId::as_uuid).collect();

    // Assigned custom badges (ordered).
    let assigned: Vec<AssignedRow> = sqlx::query_as(
        "SELECT ub.user_id, b.id, b.slug, b.label, b.image_url, b.bg_color, b.text_color, b.position \
         FROM user_badges ub JOIN badges b ON b.id = ub.badge_id \
         WHERE ub.user_id = ANY($1) ORDER BY b.position, b.label",
    )
    .bind(&ids)
    .fetch_all(pool)
    .await
    .context("load assigned badges")?;
    for r in assigned {
        out.entry(UserId::from_uuid(r.user_id))
            .or_default()
            .badges
            .push(Badge {
                id: r.id,
                slug: r.slug,
                label: r.label,
                image_url: r.image_url,
                bg_color: r.bg_color,
                text_color: r.text_color,
                position: r.position,
            });
    }

    // Derived flags from each user row.
    let flags: Vec<FlagRow> =
        sqlx::query_as("SELECT id, is_trial, created_at FROM users WHERE id = ANY($1)")
            .bind(&ids)
            .fetch_all(pool)
            .await
            .context("load user badge flags")?;
    let now = time::OffsetDateTime::now_utc();
    for r in flags {
        let age_days = (now - r.created_at).whole_days().max(0);
        let entry = out.entry(UserId::from_uuid(r.id)).or_default();
        entry.is_trial = r.is_trial;
        entry.is_new = age_days < 14;
        let years = i32::try_from(age_days / 365).unwrap_or(0);
        entry.years = if years > 0 { Some(years) } else { None };
    }

    Ok(out)
}

/// Resolve the badge data for a single author (used when broadcasting a freshly
/// created message/alert over the realtime channel).
pub async fn for_author(pool: &PgPool, user_id: UserId) -> anyhow::Result<AuthorBadges> {
    Ok(for_authors(pool, &[user_id])
        .await?
        .remove(&user_id)
        .unwrap_or_default())
}
