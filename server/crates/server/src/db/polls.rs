//! Live poll repository. A poll is owned by a room; it has 2..10 options and
//! at most one vote per user. The read model ([`PollDetail`]) aggregates each
//! poll with its options and per-option vote tallies.
//!
//! Like the questions repository, these queries use the runtime
//! `sqlx::query_as` API rather than the compile-time `query!` macros: the
//! `.sqlx` offline cache is generated against a live database that is not
//! available here, so a freshly added macro query would fail to compile
//! offline. The runtime API needs no cache and is type-checked by the `FromRow`
//! impls below.

use anyhow::Context as _;
use domain::entities::{Poll, PollDetail, PollOptionResult};
use domain::{PollId, PollOptionId, RoomId, UserId};
use sqlx::PgPool;

/// Flat projection of a `polls` row, decoded by `sqlx` and lifted into the
/// strongly-typed domain [`Poll`].
#[derive(sqlx::FromRow)]
struct PollRow {
    id: uuid::Uuid,
    room_id: uuid::Uuid,
    author_id: uuid::Uuid,
    question: String,
    anonymous: bool,
    status: String,
    created_at: time::OffsetDateTime,
}

impl From<PollRow> for Poll {
    fn from(row: PollRow) -> Self {
        Self {
            id: PollId::from_uuid(row.id),
            room_id: RoomId::from_uuid(row.room_id),
            author_id: UserId::from_uuid(row.author_id),
            question: row.question,
            anonymous: row.anonymous,
            status: row.status,
            created_at: row.created_at,
        }
    }
}

/// One option row joined with its vote tally. `votes` is `bigint` (`count(*)`)
/// decoded as `i64`.
#[derive(sqlx::FromRow)]
struct OptionResultRow {
    id: uuid::Uuid,
    label: String,
    position: i32,
    votes: i64,
}

impl From<OptionResultRow> for PollOptionResult {
    fn from(row: OptionResultRow) -> Self {
        Self {
            id: PollOptionId::from_uuid(row.id),
            label: row.label,
            position: row.position,
            votes: row.votes,
        }
    }
}

/// Whether a poll exists, belongs to the given room, and is currently `open`.
async fn poll_status_in_room(
    pool: &PgPool,
    room_id: RoomId,
    poll_id: PollId,
) -> anyhow::Result<Option<String>> {
    let row: Option<(String,)> =
        sqlx::query_as("SELECT status FROM polls WHERE id = $1 AND room_id = $2")
            .bind(poll_id.as_uuid())
            .bind(room_id.as_uuid())
            .fetch_optional(pool)
            .await
            .context("check poll in room")?;
    Ok(row.map(|(status,)| status))
}

/// Load the options + per-option vote tallies for a poll, oldest position
/// first. A `LEFT JOIN` keeps options with zero votes (tally 0).
async fn option_results(pool: &PgPool, poll_id: PollId) -> anyhow::Result<Vec<PollOptionResult>> {
    let rows: Vec<OptionResultRow> = sqlx::query_as(
        "SELECT o.id, o.label, o.position, count(v.id) AS votes \
         FROM poll_options o \
         LEFT JOIN poll_votes v ON v.option_id = o.id \
         WHERE o.poll_id = $1 \
         GROUP BY o.id, o.label, o.position \
         ORDER BY o.position ASC",
    )
    .bind(poll_id.as_uuid())
    .fetch_all(pool)
    .await
    .context("load poll option results")?;
    Ok(rows.into_iter().map(Into::into).collect())
}

/// Assemble a [`PollDetail`] from a poll row and its option tallies.
fn assemble_detail(poll: Poll, options: Vec<PollOptionResult>) -> PollDetail {
    let total_votes: i64 = options.iter().map(|o| o.votes).sum();
    PollDetail {
        id: poll.id,
        room_id: poll.room_id,
        author_id: poll.author_id,
        question: poll.question,
        anonymous: poll.anonymous,
        status: poll.status,
        created_at: poll.created_at,
        options,
        total_votes,
    }
}

/// Create a poll with its options in one transaction. `options` are inserted in
/// slice order; their `position` is the index. Returns the assembled detail
/// (all tallies zero).
pub async fn create(
    pool: &PgPool,
    room_id: RoomId,
    author_id: UserId,
    question: &str,
    options: &[String],
    anonymous: bool,
) -> anyhow::Result<PollDetail> {
    let mut tx = pool.begin().await.context("begin create poll tx")?;

    let poll_row: PollRow = sqlx::query_as(
        "INSERT INTO polls (room_id, author_id, question, anonymous) \
         VALUES ($1, $2, $3, $4) \
         RETURNING id, room_id, author_id, question, anonymous, status, created_at",
    )
    .bind(room_id.as_uuid())
    .bind(author_id.as_uuid())
    .bind(question)
    .bind(anonymous)
    .fetch_one(&mut *tx)
    .await
    .context("insert poll")?;

    for (position, label) in options.iter().enumerate() {
        let position = i32::try_from(position).context("poll option position overflow")?;
        sqlx::query("INSERT INTO poll_options (poll_id, label, position) VALUES ($1, $2, $3)")
            .bind(poll_row.id)
            .bind(label)
            .bind(position)
            .execute(&mut *tx)
            .await
            .context("insert poll option")?;
    }

    tx.commit().await.context("commit create poll tx")?;

    let entity: Poll = poll_row.into();
    let options = option_results(pool, entity.id).await?;
    Ok(assemble_detail(entity, options))
}

/// List the active (open) polls in a room, newest first, each with its tallies.
pub async fn list_active(pool: &PgPool, room_id: RoomId) -> anyhow::Result<Vec<PollDetail>> {
    let poll_rows: Vec<PollRow> = sqlx::query_as(
        "SELECT id, room_id, author_id, question, anonymous, status, created_at \
         FROM polls \
         WHERE room_id = $1 AND status = 'open' \
         ORDER BY created_at DESC",
    )
    .bind(room_id.as_uuid())
    .fetch_all(pool)
    .await
    .context("list active polls")?;

    let mut details = Vec::with_capacity(poll_rows.len());
    for poll_row in poll_rows {
        let entity: Poll = poll_row.into();
        let options = option_results(pool, entity.id).await?;
        details.push(assemble_detail(entity, options));
    }
    Ok(details)
}

/// Load one poll's detail, scoped by room. Returns `None` if the poll does not
/// exist in this room.
pub async fn get_detail(
    pool: &PgPool,
    room_id: RoomId,
    poll_id: PollId,
) -> anyhow::Result<Option<PollDetail>> {
    let poll_row: Option<PollRow> = sqlx::query_as(
        "SELECT id, room_id, author_id, question, anonymous, status, created_at \
         FROM polls \
         WHERE id = $1 AND room_id = $2",
    )
    .bind(poll_id.as_uuid())
    .bind(room_id.as_uuid())
    .fetch_optional(pool)
    .await
    .context("load poll")?;

    let Some(poll_row) = poll_row else {
        return Ok(None);
    };
    let entity: Poll = poll_row.into();
    let options = option_results(pool, entity.id).await?;
    Ok(Some(assemble_detail(entity, options)))
}

/// Outcome of attempting to cast a vote.
pub enum VoteOutcome {
    /// Vote recorded; the up-to-date detail is returned.
    Recorded(PollDetail),
    /// No such poll in this room.
    NotFound,
    /// The poll is closed; voting is rejected.
    Closed,
    /// The option does not belong to this poll.
    InvalidOption,
}

/// Cast (or change) a user's vote, atomically and one-per-user.
///
/// The single `INSERT ... ON CONFLICT (poll_id, user_id) DO UPDATE` relies on
/// the `UNIQUE(poll_id, user_id)` constraint: there is no read-then-write, so
/// concurrent votes by the same user cannot double-insert. We validate that the
/// poll exists in the room, is `open`, and that the option belongs to the poll
/// before writing.
pub async fn vote(
    pool: &PgPool,
    room_id: RoomId,
    poll_id: PollId,
    option_id: PollOptionId,
    user_id: UserId,
) -> anyhow::Result<VoteOutcome> {
    let Some(status) = poll_status_in_room(pool, room_id, poll_id).await? else {
        return Ok(VoteOutcome::NotFound);
    };
    if status != "open" {
        return Ok(VoteOutcome::Closed);
    }

    // Verify the option belongs to this poll. This also guards against voting
    // for an option from a different poll.
    let option_ok: Option<(uuid::Uuid,)> =
        sqlx::query_as("SELECT id FROM poll_options WHERE id = $1 AND poll_id = $2")
            .bind(option_id.as_uuid())
            .bind(poll_id.as_uuid())
            .fetch_optional(pool)
            .await
            .context("check option belongs to poll")?;
    if option_ok.is_none() {
        return Ok(VoteOutcome::InvalidOption);
    }

    // Atomic, idempotent upsert GUARDED on the poll still being open. The
    // `WHERE EXISTS (... status='open')` re-checks the status in the SAME
    // statement as the write, closing the TOCTOU window between the status read
    // above and this insert: if a concurrent close landed in that window the
    // SELECT yields no row, 0 rows are affected, and we report Closed rather than
    // recording a vote on a just-closed poll. (One row per (poll,user); changing
    // the vote updates the existing row instead of inserting a second.)
    let affected = sqlx::query(
        "INSERT INTO poll_votes (poll_id, option_id, user_id) \
         SELECT $1, $2, $3 \
         WHERE EXISTS (SELECT 1 FROM polls WHERE id = $1 AND room_id = $4 AND status = 'open') \
         ON CONFLICT (poll_id, user_id) \
         DO UPDATE SET option_id = EXCLUDED.option_id, created_at = now()",
    )
    .bind(poll_id.as_uuid())
    .bind(option_id.as_uuid())
    .bind(user_id.as_uuid())
    .bind(room_id.as_uuid())
    .execute(pool)
    .await
    .context("upsert poll vote")?
    .rows_affected();

    if affected == 0 {
        // The poll was closed between the status check and the insert.
        return Ok(VoteOutcome::Closed);
    }

    // Re-read the detail so callers (and the WS broadcast) see fresh tallies.
    match get_detail(pool, room_id, poll_id).await? {
        Some(detail) => Ok(VoteOutcome::Recorded(detail)),
        None => Ok(VoteOutcome::NotFound),
    }
}

/// Close a poll, scoped by room. Returns the updated detail, or `None` if no
/// such poll exists in the room. Idempotent: closing an already-closed poll is
/// a no-op that still returns the detail.
pub async fn close(
    pool: &PgPool,
    room_id: RoomId,
    poll_id: PollId,
) -> anyhow::Result<Option<PollDetail>> {
    let updated: Option<(uuid::Uuid,)> = sqlx::query_as(
        "UPDATE polls SET status = 'closed' WHERE id = $1 AND room_id = $2 RETURNING id",
    )
    .bind(poll_id.as_uuid())
    .bind(room_id.as_uuid())
    .fetch_optional(pool)
    .await
    .context("close poll")?;

    if updated.is_none() {
        return Ok(None);
    }
    get_detail(pool, room_id, poll_id).await
}
