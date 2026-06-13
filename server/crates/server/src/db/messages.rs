//! Chat message repository.

use anyhow::Context as _;
use domain::entities::Message;
use domain::{MessageId, RoomId, UserId};
use sqlx::PgPool;

pub async fn create(
    pool: &PgPool,
    room_id: RoomId,
    author_id: UserId,
    body: &str,
) -> anyhow::Result<Message> {
    let row = sqlx::query!(
        r#"
        INSERT INTO messages (room_id, author_id, body)
        VALUES ($1, $2, $3)
        RETURNING id, room_id, author_id, body, created_at
        "#,
        room_id.as_uuid(),
        author_id.as_uuid(),
        body,
    )
    .fetch_one(pool)
    .await
    .context("insert message")?;
    Ok(Message {
        id: MessageId::from_uuid(row.id),
        room_id: RoomId::from_uuid(row.room_id),
        author_id: UserId::from_uuid(row.author_id),
        body: row.body,
        created_at: row.created_at,
    })
}

pub async fn list_recent(
    pool: &PgPool,
    room_id: RoomId,
    limit: i64,
) -> anyhow::Result<Vec<Message>> {
    let rows = sqlx::query!(
        r#"
        SELECT id, room_id, author_id, body, created_at
        FROM messages WHERE room_id = $1
        ORDER BY created_at DESC LIMIT $2
        "#,
        room_id.as_uuid(),
        limit,
    )
    .fetch_all(pool)
    .await
    .context("list messages")?;
    Ok(rows
        .into_iter()
        .map(|row| Message {
            id: MessageId::from_uuid(row.id),
            room_id: RoomId::from_uuid(row.room_id),
            author_id: UserId::from_uuid(row.author_id),
            body: row.body,
            created_at: row.created_at,
        })
        .collect())
}
