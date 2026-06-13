//! Trade alert repository.

use anyhow::Context as _;
use domain::entities::Alert;
use domain::{AlertId, RoomId, UserId};
use serde::Serialize;
use sqlx::PgPool;

/// A trade alert joined with its author's display name, for listing.
#[derive(Serialize)]
pub struct AlertView {
    pub id: AlertId,
    pub room_id: RoomId,
    pub author_id: UserId,
    pub symbol: String,
    pub side: String,
    pub note: Option<String>,
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: time::OffsetDateTime,
    pub author_name: String,
}

pub async fn create(
    pool: &PgPool,
    room_id: RoomId,
    author_id: UserId,
    symbol: &str,
    side: &str,
    note: Option<&str>,
) -> anyhow::Result<Alert> {
    let row = sqlx::query!(
        r#"
        INSERT INTO alerts (room_id, author_id, symbol, side, note)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, room_id, author_id, symbol, side, note, created_at
        "#,
        room_id.as_uuid(),
        author_id.as_uuid(),
        symbol,
        side,
        note,
    )
    .fetch_one(pool)
    .await
    .context("insert alert")?;
    Ok(Alert {
        id: AlertId::from_uuid(row.id),
        room_id: RoomId::from_uuid(row.room_id),
        author_id: UserId::from_uuid(row.author_id),
        symbol: row.symbol,
        side: row.side,
        note: row.note,
        created_at: row.created_at,
    })
}

pub async fn list_recent(
    pool: &PgPool,
    room_id: RoomId,
    limit: i64,
) -> anyhow::Result<Vec<AlertView>> {
    let rows = sqlx::query!(
        r#"
        SELECT a.id, a.room_id, a.author_id, a.symbol, a.side, a.note, a.created_at,
               u.display_name AS author_name
        FROM alerts a
        JOIN users u ON u.id = a.author_id
        WHERE a.room_id = $1
        ORDER BY a.created_at DESC LIMIT $2
        "#,
        room_id.as_uuid(),
        limit,
    )
    .fetch_all(pool)
    .await
    .context("list alerts")?;
    Ok(rows
        .into_iter()
        .map(|row| AlertView {
            id: AlertId::from_uuid(row.id),
            room_id: RoomId::from_uuid(row.room_id),
            author_id: UserId::from_uuid(row.author_id),
            symbol: row.symbol,
            side: row.side,
            note: row.note,
            created_at: row.created_at,
            author_name: row.author_name,
        })
        .collect())
}
