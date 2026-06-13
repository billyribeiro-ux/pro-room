//! Trade alert repository.

use anyhow::Context as _;
use domain::entities::Alert;
use domain::{AlertId, RoomId, UserId};
use sqlx::PgPool;

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

pub async fn list_recent(pool: &PgPool, room_id: RoomId, limit: i64) -> anyhow::Result<Vec<Alert>> {
    let rows = sqlx::query!(
        r#"
        SELECT id, room_id, author_id, symbol, side, note, created_at
        FROM alerts WHERE room_id = $1
        ORDER BY created_at DESC LIMIT $2
        "#,
        room_id.as_uuid(),
        limit,
    )
    .fetch_all(pool)
    .await
    .context("list alerts")?;
    Ok(rows
        .into_iter()
        .map(|row| Alert {
            id: AlertId::from_uuid(row.id),
            room_id: RoomId::from_uuid(row.room_id),
            author_id: UserId::from_uuid(row.author_id),
            symbol: row.symbol,
            side: row.side,
            note: row.note,
            created_at: row.created_at,
        })
        .collect())
}
