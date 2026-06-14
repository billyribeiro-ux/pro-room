//! Room repository.
//!
//! The SELECT/INSERT…RETURNING queries here use the runtime `sqlx::query_as`
//! API (with a `FromRow` row struct) rather than the compile-time `query!`
//! macros: the offline `.sqlx` cache is generated against a live database not
//! available here, so a query referencing the freshly added `locked` column
//! (migration 0010) would fail to compile offline. The runtime API needs no
//! cache and is checked by the `FromRow` impl below. (Same rationale as the
//! alerts/polls/reactions repos.) Every query string is a `&'static str`
//! literal (sqlx 0.9 requires `SqlSafeStr`); the mutations that do not read
//! `locked` (`update`, `set_live`, `delete`) stay on `query!`.

use anyhow::Context as _;
use domain::entities::{Room, RoomVisibility};
use domain::{RoomId, UserId};
use sqlx::PgPool;
use uuid::Uuid;

/// `Uuid`/`text`-typed decode target for room rows, mapped into [`Room`]. The
/// `visibility` enum column is cast to `text` in the query and parsed here.
#[derive(sqlx::FromRow)]
struct RoomRow {
    id: Uuid,
    slug: String,
    name: String,
    owner_id: Uuid,
    visibility: String,
    is_live: bool,
    locked: bool,
    created_at: time::OffsetDateTime,
}

impl TryFrom<RoomRow> for Room {
    type Error = anyhow::Error;

    fn try_from(row: RoomRow) -> anyhow::Result<Self> {
        Ok(Self {
            id: RoomId::from_uuid(row.id),
            slug: row.slug,
            name: row.name,
            owner_id: UserId::from_uuid(row.owner_id),
            visibility: row.visibility.parse().context("parse visibility")?,
            is_live: row.is_live,
            locked: row.locked,
            created_at: row.created_at,
        })
    }
}

pub async fn create(
    pool: &PgPool,
    slug: &str,
    name: &str,
    owner_id: UserId,
    visibility: RoomVisibility,
) -> anyhow::Result<Room> {
    let row: RoomRow = sqlx::query_as(
        "INSERT INTO rooms (slug, name, owner_id, visibility) \
         VALUES ($1, $2, $3, $4::text::room_visibility) \
         RETURNING id, slug, name, owner_id, visibility::text AS visibility, \
                   is_live, locked, created_at",
    )
    .bind(slug)
    .bind(name)
    .bind(owner_id.as_uuid())
    .bind(visibility.as_str())
    .fetch_one(pool)
    .await
    .context("insert room")?;
    row.try_into()
}

pub async fn find_by_id(pool: &PgPool, id: RoomId) -> anyhow::Result<Option<Room>> {
    let row: Option<RoomRow> = sqlx::query_as(
        "SELECT id, slug, name, owner_id, visibility::text AS visibility, \
                is_live, locked, created_at \
         FROM rooms WHERE id = $1",
    )
    .bind(id.as_uuid())
    .fetch_optional(pool)
    .await
    .context("find room by id")?;
    row.map(Room::try_from).transpose()
}

pub async fn find_by_slug(pool: &PgPool, slug: &str) -> anyhow::Result<Option<Room>> {
    let row: Option<RoomRow> = sqlx::query_as(
        "SELECT id, slug, name, owner_id, visibility::text AS visibility, \
                is_live, locked, created_at \
         FROM rooms WHERE slug = $1",
    )
    .bind(slug)
    .fetch_optional(pool)
    .await
    .context("find room by slug")?;
    row.map(Room::try_from).transpose()
}

/// List rooms visible to a user: any public room, plus private rooms they are a
/// member of, plus any room they own. Super admins see everything (pass
/// `all = true`).
pub async fn list_visible(pool: &PgPool, user_id: UserId, all: bool) -> anyhow::Result<Vec<Room>> {
    let rows: Vec<RoomRow> = sqlx::query_as(
        "SELECT r.id, r.slug, r.name, r.owner_id, r.visibility::text AS visibility, \
                r.is_live, r.locked, r.created_at \
         FROM rooms r \
         WHERE $2 \
            OR r.visibility = 'public' \
            OR r.owner_id = $1 \
            OR EXISTS (SELECT 1 FROM room_members m WHERE m.room_id = r.id AND m.user_id = $1) \
         ORDER BY r.created_at DESC",
    )
    .bind(user_id.as_uuid())
    .bind(all)
    .fetch_all(pool)
    .await
    .context("list rooms")?;
    rows.into_iter().map(Room::try_from).collect()
}

pub async fn update(
    pool: &PgPool,
    id: RoomId,
    name: &str,
    visibility: RoomVisibility,
) -> anyhow::Result<()> {
    let affected = sqlx::query!(
        "UPDATE rooms SET name = $2, visibility = $3::text::room_visibility, updated_at = now() WHERE id = $1",
        id.as_uuid(),
        name,
        visibility.as_str(),
    )
    .execute(pool)
    .await
    .context("update room")?
    .rows_affected();
    anyhow::ensure!(affected == 1, "room not found");
    Ok(())
}

pub async fn set_live(pool: &PgPool, id: RoomId, is_live: bool) -> anyhow::Result<()> {
    let affected = sqlx::query!(
        "UPDATE rooms SET is_live = $2, updated_at = now() WHERE id = $1",
        id.as_uuid(),
        is_live,
    )
    .execute(pool)
    .await
    .context("set room live")?
    .rows_affected();
    anyhow::ensure!(affected == 1, "room not found");
    Ok(())
}

/// Toggle the admin moderation lock. The `locked` column is referenced in the
/// query text, so this uses the runtime API (no `.sqlx` cache entry exists for
/// it offline). The query string is a `&'static str` literal.
pub async fn set_locked(pool: &PgPool, id: RoomId, locked: bool) -> anyhow::Result<()> {
    let affected = sqlx::query("UPDATE rooms SET locked = $2, updated_at = now() WHERE id = $1")
        .bind(id.as_uuid())
        .bind(locked)
        .execute(pool)
        .await
        .context("set room locked")?
        .rows_affected();
    anyhow::ensure!(affected == 1, "room not found");
    Ok(())
}

pub async fn delete(pool: &PgPool, id: RoomId) -> anyhow::Result<()> {
    let affected = sqlx::query!("DELETE FROM rooms WHERE id = $1", id.as_uuid())
        .execute(pool)
        .await
        .context("delete room")?
        .rows_affected();
    anyhow::ensure!(affected == 1, "room not found");
    Ok(())
}
