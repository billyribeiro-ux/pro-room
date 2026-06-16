//! Private (1:1) message repository.
//!
//! A private message is room-scoped but addressed from one user to exactly one
//! other. The realtime layer delivers it only to those two participants; this
//! repository is the durable thread history behind that live path.
//!
//! Every function uses the runtime `query_as` API rather than the `query!`
//! macro: the offline `.sqlx` cache is generated against a live database not
//! available at build time here, so the `users` name-join columns below would
//! fail a macro's compile-time check (same reason `messages.rs::list_recent`
//! and the `members`/`polls`/`reactions` repos use `query_as`).

use anyhow::Context as _;
use domain::{RoomId, UserId};
use serde::Serialize;
use sqlx::PgPool;
use uuid::Uuid;

/// A private message joined with both participants' display names, for the wire
/// (live event payload and thread listings). `created_at` serializes as RFC 3339
/// to match `MessageView`.
#[derive(Debug, Clone, Serialize)]
pub struct PrivateMessageView {
    pub id: Uuid,
    pub room_id: Uuid,
    pub sender_id: Uuid,
    pub recipient_id: Uuid,
    pub body: String,
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: time::OffsetDateTime,
    pub sender_name: String,
    pub recipient_name: String,
}

/// Row shape for the participant-name join used by every read below.
#[derive(sqlx::FromRow)]
struct PrivateMessageRow {
    id: Uuid,
    room_id: Uuid,
    sender_id: Uuid,
    recipient_id: Uuid,
    body: String,
    created_at: time::OffsetDateTime,
    sender_name: String,
    recipient_name: String,
}

impl From<PrivateMessageRow> for PrivateMessageView {
    fn from(r: PrivateMessageRow) -> Self {
        Self {
            id: r.id,
            room_id: r.room_id,
            sender_id: r.sender_id,
            recipient_id: r.recipient_id,
            body: r.body,
            created_at: r.created_at,
            sender_name: r.sender_name,
            recipient_name: r.recipient_name,
        }
    }
}

/// A per-peer inbox summary: the other participant plus the most recent message
/// in that thread, for rendering a PM conversation list.
#[derive(Debug, Clone, Serialize)]
pub struct PrivateThreadSummary {
    pub peer_id: Uuid,
    pub peer_name: String,
    pub last_body: String,
    #[serde(with = "time::serde::rfc3339")]
    pub last_at: time::OffsetDateTime,
}

#[derive(sqlx::FromRow)]
struct ThreadSummaryRow {
    peer_id: Uuid,
    peer_name: String,
    last_body: String,
    last_at: time::OffsetDateTime,
}

/// Insert a private message and return it joined with both display names.
pub async fn create(
    pool: &PgPool,
    room_id: RoomId,
    sender_id: UserId,
    recipient_id: UserId,
    body: &str,
) -> anyhow::Result<PrivateMessageView> {
    // Insert in a CTE, then join the participant names in the outer query so the
    // returned row matches the read shape exactly (single round-trip).
    let sql = "WITH inserted AS ( \
                   INSERT INTO private_messages (room_id, sender_id, recipient_id, body) \
                   VALUES ($1, $2, $3, $4) \
                   RETURNING id, room_id, sender_id, recipient_id, body, created_at \
               ) \
               SELECT pm.id, pm.room_id, pm.sender_id, pm.recipient_id, pm.body, \
                      pm.created_at, \
                      us.display_name AS sender_name, \
                      ur.display_name AS recipient_name \
               FROM inserted pm \
               JOIN users us ON us.id = pm.sender_id \
               JOIN users ur ON ur.id = pm.recipient_id";
    let row: PrivateMessageRow = sqlx::query_as(sql)
        .bind(room_id.as_uuid())
        .bind(sender_id.as_uuid())
        .bind(recipient_id.as_uuid())
        .bind(body)
        .fetch_one(pool)
        .await
        .context("insert private message")?;
    Ok(row.into())
}

/// The thread between two users in a room (either direction), newest-first.
pub async fn thread(
    pool: &PgPool,
    room_id: RoomId,
    user_a: UserId,
    user_b: UserId,
    limit: i64,
) -> anyhow::Result<Vec<PrivateMessageView>> {
    // Full literal SQL: this sqlx version's `query_as` requires a `&'static str`
    // (the `SqlSafeStr` bound), so the shared SELECT prefix is written inline
    // rather than interpolated from a `const`.
    let rows: Vec<PrivateMessageRow> = sqlx::query_as(
        "SELECT pm.id, pm.room_id, pm.sender_id, pm.recipient_id, pm.body, \
                pm.created_at, \
                us.display_name AS sender_name, \
                ur.display_name AS recipient_name \
         FROM private_messages pm \
         JOIN users us ON us.id = pm.sender_id \
         JOIN users ur ON ur.id = pm.recipient_id \
         WHERE pm.room_id = $1 \
           AND ( (pm.sender_id = $2 AND pm.recipient_id = $3) \
              OR (pm.sender_id = $3 AND pm.recipient_id = $2) ) \
         ORDER BY pm.created_at DESC LIMIT $4",
    )
    .bind(room_id.as_uuid())
    .bind(user_a.as_uuid())
    .bind(user_b.as_uuid())
    .bind(limit)
    .fetch_all(pool)
    .await
    .context("load private message thread")?;
    Ok(rows.into_iter().map(Into::into).collect())
}

/// Per-peer inbox summaries for `user`: one row per distinct conversation
/// partner, carrying the latest message in that thread, newest conversation
/// first. The peer is "the other participant", computed per row.
pub async fn threads_for(
    pool: &PgPool,
    room_id: RoomId,
    user: UserId,
) -> anyhow::Result<Vec<PrivateThreadSummary>> {
    // `peer` is whichever participant is not the caller. DISTINCT ON keeps only
    // the newest message per peer (ordered DESC within each peer), then the outer
    // ORDER BY surfaces the most recently active conversations first.
    let sql = "SELECT t.peer_id, u.display_name AS peer_name, t.body AS last_body, \
                      t.created_at AS last_at \
               FROM ( \
                   SELECT DISTINCT ON (peer) \
                          CASE WHEN pm.sender_id = $2 THEN pm.recipient_id \
                               ELSE pm.sender_id END AS peer, \
                          (CASE WHEN pm.sender_id = $2 THEN pm.recipient_id \
                                ELSE pm.sender_id END) AS peer_id, \
                          pm.body, pm.created_at \
                   FROM private_messages pm \
                   WHERE pm.room_id = $1 \
                     AND (pm.sender_id = $2 OR pm.recipient_id = $2) \
                   ORDER BY peer, pm.created_at DESC \
               ) t \
               JOIN users u ON u.id = t.peer_id \
               ORDER BY t.created_at DESC";
    let rows: Vec<ThreadSummaryRow> = sqlx::query_as(sql)
        .bind(room_id.as_uuid())
        .bind(user.as_uuid())
        .fetch_all(pool)
        .await
        .context("load private message inbox")?;
    Ok(rows
        .into_iter()
        .map(|r| PrivateThreadSummary {
            peer_id: r.peer_id,
            peer_name: r.peer_name,
            last_body: r.last_body,
            last_at: r.last_at,
        })
        .collect())
}

/// Every private message in a room where `peer` is sender or recipient,
/// newest-first. Backs the admin "all PMs for a user" moderation read.
pub async fn all_for_peer(
    pool: &PgPool,
    room_id: RoomId,
    peer: UserId,
    limit: i64,
) -> anyhow::Result<Vec<PrivateMessageView>> {
    let rows: Vec<PrivateMessageRow> = sqlx::query_as(
        "SELECT pm.id, pm.room_id, pm.sender_id, pm.recipient_id, pm.body, \
                pm.created_at, \
                us.display_name AS sender_name, \
                ur.display_name AS recipient_name \
         FROM private_messages pm \
         JOIN users us ON us.id = pm.sender_id \
         JOIN users ur ON ur.id = pm.recipient_id \
         WHERE pm.room_id = $1 \
           AND (pm.sender_id = $2 OR pm.recipient_id = $2) \
         ORDER BY pm.created_at DESC LIMIT $3",
    )
    .bind(room_id.as_uuid())
    .bind(peer.as_uuid())
    .bind(limit)
    .fetch_all(pool)
    .await
    .context("load all private messages for peer")?;
    Ok(rows.into_iter().map(Into::into).collect())
}
