//! Room repository.

use anyhow::Context as _;
use domain::entities::{Room, RoomVisibility};
use domain::{RoomId, UserId};
use sqlx::PgPool;

fn map_room(
    id: uuid::Uuid,
    slug: String,
    name: String,
    owner_id: uuid::Uuid,
    visibility: &str,
    is_live: bool,
    created_at: time::OffsetDateTime,
) -> anyhow::Result<Room> {
    Ok(Room {
        id: RoomId::from_uuid(id),
        slug,
        name,
        owner_id: UserId::from_uuid(owner_id),
        visibility: visibility.parse().context("parse visibility")?,
        is_live,
        created_at,
    })
}

pub async fn create(
    pool: &PgPool,
    slug: &str,
    name: &str,
    owner_id: UserId,
    visibility: RoomVisibility,
) -> anyhow::Result<Room> {
    let row = sqlx::query!(
        r#"
        INSERT INTO rooms (slug, name, owner_id, visibility)
        VALUES ($1, $2, $3, $4::text::room_visibility)
        RETURNING id, slug, name, owner_id, visibility::text AS "visibility!", is_live, created_at
        "#,
        slug,
        name,
        owner_id.as_uuid(),
        visibility.as_str(),
    )
    .fetch_one(pool)
    .await
    .context("insert room")?;
    map_room(
        row.id,
        row.slug,
        row.name,
        row.owner_id,
        &row.visibility,
        row.is_live,
        row.created_at,
    )
}

pub async fn find_by_id(pool: &PgPool, id: RoomId) -> anyhow::Result<Option<Room>> {
    let row = sqlx::query!(
        r#"SELECT id, slug, name, owner_id, visibility::text AS "visibility!", is_live, created_at
           FROM rooms WHERE id = $1"#,
        id.as_uuid(),
    )
    .fetch_optional(pool)
    .await
    .context("find room by id")?;
    row.map(|r| {
        map_room(
            r.id,
            r.slug,
            r.name,
            r.owner_id,
            &r.visibility,
            r.is_live,
            r.created_at,
        )
    })
    .transpose()
}

pub async fn find_by_slug(pool: &PgPool, slug: &str) -> anyhow::Result<Option<Room>> {
    let row = sqlx::query!(
        r#"SELECT id, slug, name, owner_id, visibility::text AS "visibility!", is_live, created_at
           FROM rooms WHERE slug = $1"#,
        slug,
    )
    .fetch_optional(pool)
    .await
    .context("find room by slug")?;
    row.map(|r| {
        map_room(
            r.id,
            r.slug,
            r.name,
            r.owner_id,
            &r.visibility,
            r.is_live,
            r.created_at,
        )
    })
    .transpose()
}

/// List rooms visible to a user: any public room, plus private rooms they are a
/// member of, plus any room they own. Super admins see everything (pass
/// `all = true`).
pub async fn list_visible(pool: &PgPool, user_id: UserId, all: bool) -> anyhow::Result<Vec<Room>> {
    let rows = sqlx::query!(
        r#"
        SELECT r.id, r.slug, r.name, r.owner_id,
               r.visibility::text AS "visibility!", r.is_live, r.created_at
        FROM rooms r
        WHERE $2
           OR r.visibility = 'public'
           OR r.owner_id = $1
           OR EXISTS (SELECT 1 FROM room_members m WHERE m.room_id = r.id AND m.user_id = $1)
        ORDER BY r.created_at DESC
        "#,
        user_id.as_uuid(),
        all,
    )
    .fetch_all(pool)
    .await
    .context("list rooms")?;
    rows.into_iter()
        .map(|r| {
            map_room(
                r.id,
                r.slug,
                r.name,
                r.owner_id,
                &r.visibility,
                r.is_live,
                r.created_at,
            )
        })
        .collect()
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

pub async fn delete(pool: &PgPool, id: RoomId) -> anyhow::Result<()> {
    let affected = sqlx::query!("DELETE FROM rooms WHERE id = $1", id.as_uuid())
        .execute(pool)
        .await
        .context("delete room")?
        .rows_affected();
    anyhow::ensure!(affected == 1, "room not found");
    Ok(())
}
