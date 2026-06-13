//! Chat message repository.

use anyhow::Context as _;
use domain::entities::Message;
use domain::{MessageId, RoomId, UserId};
use serde::Serialize;
use sqlx::PgPool;

/// A chat message joined with its author's display name, for listing.
#[derive(Serialize)]
pub struct MessageView {
    pub id: MessageId,
    pub room_id: RoomId,
    pub author_id: UserId,
    pub body: String,
    pub channel: String,
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: time::OffsetDateTime,
    pub author_name: String,
}

pub async fn create(
    pool: &PgPool,
    room_id: RoomId,
    author_id: UserId,
    body: &str,
    channel: &str,
) -> anyhow::Result<Message> {
    let row = sqlx::query!(
        r#"
        INSERT INTO messages (room_id, author_id, body, channel)
        VALUES ($1, $2, $3, $4)
        RETURNING id, room_id, author_id, body, channel, created_at
        "#,
        room_id.as_uuid(),
        author_id.as_uuid(),
        body,
        channel,
    )
    .fetch_one(pool)
    .await
    .context("insert message")?;
    Ok(Message {
        id: MessageId::from_uuid(row.id),
        room_id: RoomId::from_uuid(row.room_id),
        author_id: UserId::from_uuid(row.author_id),
        body: row.body,
        channel: row.channel,
        created_at: row.created_at,
    })
}

pub async fn list_recent(
    pool: &PgPool,
    room_id: RoomId,
    channel: &str,
    limit: i64,
) -> anyhow::Result<Vec<MessageView>> {
    let rows = sqlx::query!(
        r#"
        SELECT m.id, m.room_id, m.author_id, m.body, m.channel, m.created_at,
               u.display_name AS author_name
        FROM messages m
        JOIN users u ON u.id = m.author_id
        WHERE m.room_id = $1 AND m.channel = $2
        ORDER BY m.created_at DESC LIMIT $3
        "#,
        room_id.as_uuid(),
        channel,
        limit,
    )
    .fetch_all(pool)
    .await
    .context("list messages")?;
    Ok(rows
        .into_iter()
        .map(|row| MessageView {
            id: MessageId::from_uuid(row.id),
            room_id: RoomId::from_uuid(row.room_id),
            author_id: UserId::from_uuid(row.author_id),
            body: row.body,
            channel: row.channel,
            created_at: row.created_at,
            author_name: row.author_name,
        })
        .collect())
}
