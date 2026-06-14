//! Room membership repository, including the per-room role and ABAC attributes.

use anyhow::Context as _;
use domain::{Role, RoomId, UserId};
use serde::Serialize;
use sqlx::PgPool;
use uuid::Uuid;

/// The authorization-relevant facts about a (room, user) pair.
pub struct Membership {
    pub role: Role,
    pub attributes: Vec<(String, String)>,
}

/// A membership joined with the member's public profile, for listing.
#[derive(Serialize)]
pub struct MemberView {
    pub user_id: UserId,
    pub email: String,
    pub display_name: String,
    pub role: Role,
    #[serde(with = "time::serde::rfc3339")]
    pub joined_at: time::OffsetDateTime,
}

pub async fn upsert(
    pool: &PgPool,
    room_id: RoomId,
    user_id: UserId,
    role: Role,
    attributes: &serde_json::Value,
) -> anyhow::Result<()> {
    sqlx::query!(
        r#"
        INSERT INTO room_members (room_id, user_id, role, attributes)
        VALUES ($1, $2, $3::text::user_role, $4)
        ON CONFLICT (room_id, user_id)
        DO UPDATE SET role = EXCLUDED.role, attributes = EXCLUDED.attributes
        "#,
        room_id.as_uuid(),
        user_id.as_uuid(),
        role.as_str(),
        attributes,
    )
    .execute(pool)
    .await
    .context("upsert member")?;
    Ok(())
}

pub async fn remove(pool: &PgPool, room_id: RoomId, user_id: UserId) -> anyhow::Result<()> {
    let affected = sqlx::query!(
        "DELETE FROM room_members WHERE room_id = $1 AND user_id = $2",
        room_id.as_uuid(),
        user_id.as_uuid(),
    )
    .execute(pool)
    .await
    .context("remove member")?
    .rows_affected();
    anyhow::ensure!(affected == 1, "membership not found");
    Ok(())
}

/// Fetch the authorization facts for a (room, user) pair, if a membership exists.
pub async fn get(
    pool: &PgPool,
    room_id: RoomId,
    user_id: UserId,
) -> anyhow::Result<Option<Membership>> {
    let row = sqlx::query!(
        r#"SELECT role::text AS "role!", attributes FROM room_members
           WHERE room_id = $1 AND user_id = $2"#,
        room_id.as_uuid(),
        user_id.as_uuid(),
    )
    .fetch_optional(pool)
    .await
    .context("get membership")?;

    row.map(|r| {
        let attributes = match r.attributes {
            serde_json::Value::Object(map) => map
                .into_iter()
                .filter_map(|(k, v)| v.as_str().map(|s| (k, s.to_owned())))
                .collect(),
            _ => Vec::new(),
        };
        Ok(Membership {
            role: r.role.parse().context("parse role")?,
            attributes,
        })
    })
    .transpose()
}

pub async fn list(pool: &PgPool, room_id: RoomId) -> anyhow::Result<Vec<MemberView>> {
    let rows = sqlx::query!(
        r#"
        SELECT m.user_id, u.email, u.display_name, m.role::text AS "role!", m.joined_at
        FROM room_members m
        JOIN users u ON u.id = m.user_id
        WHERE m.room_id = $1
        ORDER BY m.joined_at
        "#,
        room_id.as_uuid(),
    )
    .fetch_all(pool)
    .await
    .context("list members")?;

    rows.into_iter()
        .map(|r| {
            Ok(MemberView {
                user_id: UserId::from_uuid(r.user_id),
                email: r.email,
                display_name: r.display_name,
                role: r.role.parse().context("parse role")?,
                joined_at: r.joined_at,
            })
        })
        .collect()
}

/// Display name plus effective role for one present user, for the admin presence
/// roster. Uses the runtime `query_as` API (like the polls/reactions repos): the
/// offline `.sqlx` cache is generated against a live database not available here,
/// so a freshly added `query!` macro would fail to compile offline.
#[derive(sqlx::FromRow)]
struct RosterRow {
    id: Uuid,
    display_name: String,
    /// The user's account-wide role (always present).
    global_role: String,
    /// The per-room role from `room_members`, or NULL if the present user is not
    /// an explicit member (e.g. a super admin viewing any room).
    room_role: Option<String>,
}

/// A present user's identity and effective role, for the admin presence view.
pub struct RosterEntry {
    pub user_id: UserId,
    pub display_name: String,
    pub role: Role,
}

/// Resolve display name + effective role for a set of present user IDs in a room.
/// The effective role mirrors `Subject::effective_role`: a super admin is always
/// super admin; otherwise the per-room role wins, falling back to the global
/// role when the user has no membership row.
pub async fn present_roster(
    pool: &PgPool,
    room_id: RoomId,
    user_ids: &[Uuid],
) -> anyhow::Result<Vec<RosterEntry>> {
    if user_ids.is_empty() {
        return Ok(Vec::new());
    }
    let rows: Vec<RosterRow> = sqlx::query_as(
        "SELECT u.id, \
                u.display_name, \
                u.global_role::text AS global_role, \
                m.role::text AS room_role \
         FROM users u \
         LEFT JOIN room_members m ON m.user_id = u.id AND m.room_id = $2 \
         WHERE u.id = ANY($1)",
    )
    .bind(user_ids)
    .bind(room_id.as_uuid())
    .fetch_all(pool)
    .await
    .context("load present roster")?;

    rows.into_iter()
        .map(|r| {
            let global_role: Role = r.global_role.parse().context("parse global role")?;
            let room_role = r
                .room_role
                .map(|s| s.parse::<Role>())
                .transpose()
                .context("parse room role")?;
            let role = if global_role == Role::SuperAdmin {
                Role::SuperAdmin
            } else {
                room_role.unwrap_or(global_role)
            };
            Ok(RosterEntry {
                user_id: UserId::from_uuid(r.id),
                display_name: r.display_name,
                role,
            })
        })
        .collect()
}
