//! Trade alert repository.
//!
//! These queries use the runtime `sqlx::query_as` API (with `FromRow` structs)
//! rather than the compile-time `query!` macros: the offline `.sqlx` cache is
//! generated against a live database not available here, so a query referencing
//! the freshly added `post_to_x` / `no_push` columns (migration 0009) would fail
//! to compile offline. The runtime API needs no cache and is checked by the
//! `FromRow` impls below. (Same rationale as the polls/reactions repos.)

use anyhow::Context as _;
use domain::entities::Alert;
use domain::{AlertId, RoomId, UserId};
use serde::Serialize;
use sqlx::PgPool;
use uuid::Uuid;

/// Row shape for inserting/returning a bare alert.
#[derive(sqlx::FromRow)]
struct AlertRow {
    id: Uuid,
    room_id: Uuid,
    author_id: Uuid,
    symbol: String,
    side: String,
    note: Option<String>,
    created_at: time::OffsetDateTime,
    post_to_x: Option<bool>,
    no_push: Option<bool>,
}

impl From<AlertRow> for Alert {
    fn from(row: AlertRow) -> Self {
        Self {
            id: AlertId::from_uuid(row.id),
            room_id: RoomId::from_uuid(row.room_id),
            author_id: UserId::from_uuid(row.author_id),
            symbol: row.symbol,
            side: row.side,
            note: row.note,
            created_at: row.created_at,
            post_to_x: row.post_to_x,
            no_push: row.no_push,
        }
    }
}

/// A trade alert joined with its author's display name, for listing. The domain
/// id newtypes don't implement `sqlx::Decode`, so listing decodes into the
/// `Uuid`-typed [`AlertViewRow`] below and maps into this view.
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
    pub post_to_x: Option<bool>,
    pub no_push: Option<bool>,
    pub author_name: String,
}

/// `Uuid`-typed decode target for [`list_recent`], mapped into [`AlertView`].
#[derive(sqlx::FromRow)]
struct AlertViewRow {
    id: Uuid,
    room_id: Uuid,
    author_id: Uuid,
    symbol: String,
    side: String,
    note: Option<String>,
    created_at: time::OffsetDateTime,
    post_to_x: Option<bool>,
    no_push: Option<bool>,
    author_name: String,
}

impl From<AlertViewRow> for AlertView {
    fn from(row: AlertViewRow) -> Self {
        Self {
            id: AlertId::from_uuid(row.id),
            room_id: RoomId::from_uuid(row.room_id),
            author_id: UserId::from_uuid(row.author_id),
            symbol: row.symbol,
            side: row.side,
            note: row.note,
            created_at: row.created_at,
            post_to_x: row.post_to_x,
            no_push: row.no_push,
            author_name: row.author_name,
        }
    }
}

#[allow(clippy::too_many_arguments)]
pub async fn create(
    pool: &PgPool,
    room_id: RoomId,
    author_id: UserId,
    symbol: &str,
    side: &str,
    note: Option<&str>,
    post_to_x: bool,
    no_push: bool,
) -> anyhow::Result<Alert> {
    let row: AlertRow = sqlx::query_as(
        "INSERT INTO alerts (room_id, author_id, symbol, side, note, post_to_x, no_push) \
         VALUES ($1, $2, $3, $4, $5, $6, $7) \
         RETURNING id, room_id, author_id, symbol, side, note, created_at, post_to_x, no_push",
    )
    .bind(room_id.as_uuid())
    .bind(author_id.as_uuid())
    .bind(symbol)
    .bind(side)
    .bind(note)
    .bind(post_to_x)
    .bind(no_push)
    .fetch_one(pool)
    .await
    .context("insert alert")?;
    Ok(row.into())
}

/// Delete a single alert, scoped to its room. Returns `true` if a row was
/// deleted, `false` if no alert with that id exists in the room (so the handler
/// can map a miss to `404`). Room-scoping prevents deleting another room's alert
/// by guessing its id. Uses the runtime API to match this module's convention.
pub async fn delete_one(pool: &PgPool, room_id: RoomId, alert_id: AlertId) -> anyhow::Result<bool> {
    let affected = sqlx::query("DELETE FROM alerts WHERE id = $1 AND room_id = $2")
        .bind(alert_id.as_uuid())
        .bind(room_id.as_uuid())
        .execute(pool)
        .await
        .context("delete alert")?
        .rows_affected();
    Ok(affected > 0)
}

pub async fn list_recent(
    pool: &PgPool,
    room_id: RoomId,
    limit: i64,
) -> anyhow::Result<Vec<AlertView>> {
    let rows: Vec<AlertViewRow> = sqlx::query_as(
        "SELECT a.id, a.room_id, a.author_id, a.symbol, a.side, a.note, a.created_at, \
                a.post_to_x, a.no_push, u.display_name AS author_name \
         FROM alerts a \
         JOIN users u ON u.id = a.author_id \
         WHERE a.room_id = $1 \
         ORDER BY a.created_at DESC LIMIT $2",
    )
    .bind(room_id.as_uuid())
    .bind(limit)
    .fetch_all(pool)
    .await
    .context("list alerts")?;
    Ok(rows.into_iter().map(Into::into).collect())
}
