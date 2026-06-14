//! Emoji reaction repository. A reaction is owned by a room and targets either a
//! chat message or a trade alert. The read model ([`ReactionSummary`]) aggregates
//! a target's reactions into per-emoji tallies, marking which the requesting user
//! owns.
//!
//! Like the polls and questions repositories, these queries use the runtime
//! `sqlx::query_as` API rather than the compile-time `query!` macros: the `.sqlx`
//! offline cache is generated against a live database that is not available here,
//! so a freshly added macro query would fail to compile offline. The runtime API
//! needs no cache and is type-checked by the `FromRow` impls below.

use anyhow::Context as _;
use domain::entities::{ReactionSummary, ReactionTally, ReactionTargetKind};
use domain::{RoomId, UserId};
use sqlx::PgPool;
use uuid::Uuid;

/// One aggregated emoji tally for a target. `count` is `bigint` (`count(*)`)
/// decoded as `i64`, then narrowed to the domain's `i32` (counts are small).
/// `mine` is computed by the query via a `bool_or` over the reacting user.
#[derive(sqlx::FromRow)]
struct TallyRow {
    emoji: String,
    count: i64,
    mine: bool,
}

impl From<TallyRow> for ReactionTally {
    fn from(row: TallyRow) -> Self {
        Self {
            emoji: row.emoji,
            // Per-emoji reaction counts are small; clamp defensively rather than
            // risk a panic on the (impossible) overflow path.
            count: i32::try_from(row.count).unwrap_or(i32::MAX),
            mine: row.mine,
        }
    }
}

/// Outcome of toggling a reaction. Both variants carry the up-to-date summary;
/// the variant tells the caller which way the toggle went (e.g. for metrics or
/// optimistic-UI reconciliation).
pub enum ToggleOutcome {
    /// The reaction was added (it was previously absent).
    Added(ReactionSummary),
    /// The reaction was removed (it was previously present).
    Removed(ReactionSummary),
}

/// Whether the reaction's target exists and belongs to the given room. The
/// table probed depends on `target_kind`, so a `'message'` reaction is validated
/// against `messages` and an `'alert'` reaction against `alerts`. Guards against
/// reacting to a target in another room (or one that does not exist).
pub async fn target_in_room(
    pool: &PgPool,
    room_id: RoomId,
    target_kind: ReactionTargetKind,
    target_id: Uuid,
) -> anyhow::Result<bool> {
    let sql = match target_kind {
        ReactionTargetKind::Message => "SELECT id FROM messages WHERE id = $1 AND room_id = $2",
        ReactionTargetKind::Alert => "SELECT id FROM alerts WHERE id = $1 AND room_id = $2",
    };
    let exists: Option<(Uuid,)> = sqlx::query_as(sql)
        .bind(target_id)
        .bind(room_id.as_uuid())
        .fetch_optional(pool)
        .await
        .context("check reaction target in room")?;
    Ok(exists.is_some())
}

/// Aggregate the reactions on one target into per-emoji tallies, marking which
/// emojis `viewer` reacted with. Ordered by descending count then emoji so the
/// most-used reactions lead; ties are alphabetised for a stable order.
pub async fn list_for(
    pool: &PgPool,
    room_id: RoomId,
    target_kind: ReactionTargetKind,
    target_id: Uuid,
    viewer: UserId,
) -> anyhow::Result<ReactionSummary> {
    let rows: Vec<TallyRow> = sqlx::query_as(
        "SELECT emoji, \
                count(*) AS count, \
                bool_or(user_id = $4) AS mine \
         FROM message_reactions \
         WHERE target_kind = $1 AND target_id = $2 AND room_id = $3 \
         GROUP BY emoji \
         ORDER BY count(*) DESC, emoji ASC",
    )
    .bind(target_kind.as_str())
    .bind(target_id)
    .bind(room_id.as_uuid())
    .bind(viewer.as_uuid())
    .fetch_all(pool)
    .await
    .context("aggregate reactions for target")?;

    Ok(ReactionSummary {
        room_id,
        target_kind,
        target_id,
        reactions: rows.into_iter().map(Into::into).collect(),
    })
}

/// Toggle a user's reaction on a target: remove the exact `(target, user, emoji)`
/// row if it exists, otherwise add it. Returns the up-to-date summary alongside
/// which way the toggle went.
///
/// The delete-or-insert is done in a single transaction so a concurrent toggle by
/// the same user can't interleave between the probe and the write. The
/// `UNIQUE(target_kind, target_id, user_id, emoji)` constraint backs the insert's
/// `ON CONFLICT DO NOTHING`, so even without the transaction a double-add can
/// never create two rows.
pub async fn toggle(
    pool: &PgPool,
    room_id: RoomId,
    target_kind: ReactionTargetKind,
    target_id: Uuid,
    user_id: UserId,
    emoji: &str,
) -> anyhow::Result<ToggleOutcome> {
    let mut tx = pool.begin().await.context("begin toggle reaction tx")?;

    // Try to remove the user's existing reaction first; RETURNING tells us
    // whether a row was present.
    let removed: Option<(Uuid,)> = sqlx::query_as(
        "DELETE FROM message_reactions \
         WHERE target_kind = $1 AND target_id = $2 AND room_id = $3 \
               AND user_id = $4 AND emoji = $5 \
         RETURNING id",
    )
    .bind(target_kind.as_str())
    .bind(target_id)
    .bind(room_id.as_uuid())
    .bind(user_id.as_uuid())
    .bind(emoji)
    .fetch_optional(&mut *tx)
    .await
    .context("delete existing reaction")?;

    let added = removed.is_none();
    if added {
        // No prior reaction: insert one. ON CONFLICT DO NOTHING keeps this
        // idempotent against a racing insert of the same tuple.
        sqlx::query(
            "INSERT INTO message_reactions (room_id, target_kind, target_id, user_id, emoji) \
             VALUES ($1, $2, $3, $4, $5) \
             ON CONFLICT (target_kind, target_id, user_id, emoji) DO NOTHING",
        )
        .bind(room_id.as_uuid())
        .bind(target_kind.as_str())
        .bind(target_id)
        .bind(user_id.as_uuid())
        .bind(emoji)
        .execute(&mut *tx)
        .await
        .context("insert reaction")?;
    }

    tx.commit().await.context("commit toggle reaction tx")?;

    // Re-aggregate so the response and the WS broadcast carry fresh tallies.
    let summary = list_for(pool, room_id, target_kind, target_id, user_id).await?;
    if added {
        Ok(ToggleOutcome::Added(summary))
    } else {
        Ok(ToggleOutcome::Removed(summary))
    }
}
