//! File repository. Files belong to a room and store metadata only; the bytes
//! live on local disk under the configured uploads directory, keyed by
//! `storage_name`. The `download_url` is computed for the client view.

use anyhow::Context as _;
use domain::entities::{File, FileCategory};
use domain::{FileId, RoomId, UserId};
use sqlx::PgPool;
use std::str::FromStr as _;

fn map_file(
    id: uuid::Uuid,
    room_id: uuid::Uuid,
    filename: String,
    content_type: String,
    size_bytes: i64,
    category: &str,
    created_at: time::OffsetDateTime,
) -> File {
    let room_id = RoomId::from_uuid(room_id);
    let id = FileId::from_uuid(id);
    File {
        id,
        room_id,
        filename,
        content_type,
        size_bytes,
        category: FileCategory::from_str(category).unwrap_or(FileCategory::File),
        created_at,
        download_url: File::download_url(room_id, id),
    }
}

pub async fn list(
    pool: &PgPool,
    room_id: RoomId,
    category: Option<FileCategory>,
) -> anyhow::Result<Vec<File>> {
    let category = category.map(|c| c.as_str().to_owned());
    let rows = sqlx::query!(
        r#"
        SELECT id, room_id, filename, content_type, size_bytes, category, created_at
        FROM files
        WHERE room_id = $1 AND ($2::text IS NULL OR category = $2)
        ORDER BY created_at DESC
        "#,
        room_id.as_uuid(),
        category,
    )
    .fetch_all(pool)
    .await
    .context("list files")?;
    Ok(rows
        .into_iter()
        .map(|r| {
            map_file(
                r.id,
                r.room_id,
                r.filename,
                r.content_type,
                r.size_bytes,
                &r.category,
                r.created_at,
            )
        })
        .collect())
}

/// Fetch a file's metadata together with its on-disk `storage_name`, so a
/// handler can stream the bytes. Returns the public view plus the storage key.
pub async fn get_with_storage(
    pool: &PgPool,
    room_id: RoomId,
    file_id: FileId,
) -> anyhow::Result<Option<(File, String)>> {
    let row = sqlx::query!(
        r#"
        SELECT id, room_id, filename, content_type, size_bytes, category, storage_name, created_at
        FROM files
        WHERE room_id = $1 AND id = $2
        "#,
        room_id.as_uuid(),
        file_id.as_uuid(),
    )
    .fetch_optional(pool)
    .await
    .context("get file with storage")?;
    Ok(row.map(|r| {
        let file = map_file(
            r.id,
            r.room_id,
            r.filename,
            r.content_type,
            r.size_bytes,
            &r.category,
            r.created_at,
        );
        (file, r.storage_name)
    }))
}

#[allow(clippy::too_many_arguments)]
pub async fn create(
    pool: &PgPool,
    room_id: RoomId,
    uploaded_by: UserId,
    filename: &str,
    content_type: &str,
    size_bytes: i64,
    category: FileCategory,
    storage_name: &str,
) -> anyhow::Result<File> {
    let row = sqlx::query!(
        r#"
        INSERT INTO files
            (room_id, uploaded_by, filename, content_type, size_bytes, category, storage_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, room_id, filename, content_type, size_bytes, category, created_at
        "#,
        room_id.as_uuid(),
        uploaded_by.as_uuid(),
        filename,
        content_type,
        size_bytes,
        category.as_str(),
        storage_name,
    )
    .fetch_one(pool)
    .await
    .context("insert file")?;
    Ok(map_file(
        row.id,
        row.room_id,
        row.filename,
        row.content_type,
        row.size_bytes,
        &row.category,
        row.created_at,
    ))
}

/// Delete a file row, returning its `storage_name` so the caller can unlink the
/// on-disk bytes. `None` if no such file exists in the room.
pub async fn delete(
    pool: &PgPool,
    room_id: RoomId,
    file_id: FileId,
) -> anyhow::Result<Option<String>> {
    let row = sqlx::query!(
        r#"
        DELETE FROM files
        WHERE room_id = $1 AND id = $2
        RETURNING storage_name
        "#,
        room_id.as_uuid(),
        file_id.as_uuid(),
    )
    .fetch_optional(pool)
    .await
    .context("delete file")?;
    Ok(row.map(|r| r.storage_name))
}
