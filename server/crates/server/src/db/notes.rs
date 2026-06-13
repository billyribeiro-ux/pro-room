//! Note repository. Notes are titled documents scoped to a room, ordered by
//! `position` (lower = earlier).

use anyhow::Context as _;
use domain::entities::Note;
use domain::{NoteId, RoomId, UserId};
use sqlx::PgPool;

fn map_note(
    id: uuid::Uuid,
    room_id: uuid::Uuid,
    title: String,
    body: String,
    position: i32,
    created_at: time::OffsetDateTime,
    updated_at: time::OffsetDateTime,
) -> Note {
    Note {
        id: NoteId::from_uuid(id),
        room_id: RoomId::from_uuid(room_id),
        title,
        body,
        position,
        created_at,
        updated_at,
    }
}

pub async fn list(pool: &PgPool, room_id: RoomId) -> anyhow::Result<Vec<Note>> {
    let rows = sqlx::query!(
        r#"
        SELECT id, room_id, title, body, position, created_at, updated_at
        FROM notes
        WHERE room_id = $1
        ORDER BY position ASC, created_at ASC
        "#,
        room_id.as_uuid(),
    )
    .fetch_all(pool)
    .await
    .context("list notes")?;
    Ok(rows
        .into_iter()
        .map(|r| {
            map_note(
                r.id,
                r.room_id,
                r.title,
                r.body,
                r.position,
                r.created_at,
                r.updated_at,
            )
        })
        .collect())
}

pub async fn get(pool: &PgPool, room_id: RoomId, note_id: NoteId) -> anyhow::Result<Option<Note>> {
    let row = sqlx::query!(
        r#"
        SELECT id, room_id, title, body, position, created_at, updated_at
        FROM notes
        WHERE room_id = $1 AND id = $2
        "#,
        room_id.as_uuid(),
        note_id.as_uuid(),
    )
    .fetch_optional(pool)
    .await
    .context("get note")?;
    Ok(row.map(|r| {
        map_note(
            r.id,
            r.room_id,
            r.title,
            r.body,
            r.position,
            r.created_at,
            r.updated_at,
        )
    }))
}

pub async fn create(
    pool: &PgPool,
    room_id: RoomId,
    created_by: UserId,
    title: &str,
    body: &str,
) -> anyhow::Result<Note> {
    let row = sqlx::query!(
        r#"
        INSERT INTO notes (room_id, created_by, title, body, position)
        VALUES (
            $1, $2, $3, $4,
            (SELECT COALESCE(MAX(position), -1) + 1 FROM notes WHERE room_id = $1)
        )
        RETURNING id, room_id, title, body, position, created_at, updated_at
        "#,
        room_id.as_uuid(),
        created_by.as_uuid(),
        title,
        body,
    )
    .fetch_one(pool)
    .await
    .context("insert note")?;
    Ok(map_note(
        row.id,
        row.room_id,
        row.title,
        row.body,
        row.position,
        row.created_at,
        row.updated_at,
    ))
}

pub async fn update(
    pool: &PgPool,
    room_id: RoomId,
    note_id: NoteId,
    title: Option<&str>,
    body: Option<&str>,
    position: Option<i32>,
) -> anyhow::Result<Option<Note>> {
    let row = sqlx::query!(
        r#"
        UPDATE notes
        SET title = COALESCE($3, title),
            body = COALESCE($4, body),
            position = COALESCE($5, position),
            updated_at = now()
        WHERE room_id = $1 AND id = $2
        RETURNING id, room_id, title, body, position, created_at, updated_at
        "#,
        room_id.as_uuid(),
        note_id.as_uuid(),
        title,
        body,
        position,
    )
    .fetch_optional(pool)
    .await
    .context("update note")?;
    Ok(row.map(|r| {
        map_note(
            r.id,
            r.room_id,
            r.title,
            r.body,
            r.position,
            r.created_at,
            r.updated_at,
        )
    }))
}

pub async fn delete(pool: &PgPool, room_id: RoomId, note_id: NoteId) -> anyhow::Result<bool> {
    let affected = sqlx::query!(
        "DELETE FROM notes WHERE room_id = $1 AND id = $2",
        room_id.as_uuid(),
        note_id.as_uuid(),
    )
    .execute(pool)
    .await
    .context("delete note")?
    .rows_affected();
    Ok(affected == 1)
}
