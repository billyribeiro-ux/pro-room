//! Session repository. Sessions are looked up by the SHA-256 hash of the opaque
//! cookie token and are valid only while unexpired and unrevoked.

use crate::auth::session::SessionUser;
use anyhow::Context as _;
use domain::{Role, SessionId, UserId};
use time::OffsetDateTime;

pub async fn create(
    pool: &sqlx::PgPool,
    user_id: UserId,
    token_hash: &str,
    expires_at: OffsetDateTime,
    user_agent: Option<&str>,
    ip: Option<&str>,
) -> anyhow::Result<SessionId> {
    let row = sqlx::query!(
        r#"
        INSERT INTO sessions (user_id, token_hash, expires_at, user_agent, ip)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        "#,
        user_id.as_uuid(),
        token_hash,
        expires_at,
        user_agent,
        ip,
    )
    .fetch_one(pool)
    .await
    .context("insert session")?;
    Ok(SessionId::from_uuid(row.id))
}

/// Resolve a valid session to its user (joined), or `None` if the session is
/// missing, expired, revoked, or the user is suspended.
pub async fn resolve(pool: &sqlx::PgPool, token_hash: &str) -> anyhow::Result<Option<SessionUser>> {
    let row = sqlx::query!(
        r#"
        SELECT u.id, u.email, u.display_name,
               u.global_role::text AS "global_role!",
               u.status::text AS "status!"
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = $1
          AND s.revoked_at IS NULL
          AND s.expires_at > now()
        "#,
        token_hash,
    )
    .fetch_optional(pool)
    .await
    .context("resolve session")?;

    let Some(row) = row else {
        return Ok(None);
    };
    if row.status != "active" {
        return Ok(None);
    }
    let global_role: Role = row.global_role.parse().context("parse role")?;
    Ok(Some(SessionUser {
        user_id: UserId::from_uuid(row.id),
        email: row.email,
        display_name: row.display_name,
        global_role,
    }))
}

pub async fn revoke(pool: &sqlx::PgPool, token_hash: &str) -> anyhow::Result<()> {
    let _ = sqlx::query!(
        "UPDATE sessions SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL",
        token_hash,
    )
    .execute(pool)
    .await
    .context("revoke session")?;
    Ok(())
}

/// Revoke ALL of a user's active sessions (e.g. after a password change) so any
/// other logged-in session for that account stops authenticating. Runtime query
/// (no .sqlx cache needed for the bare UPDATE). NOTE: callers must also drop the
/// Redis session cache for the affected token hashes (see
/// [`crate::auth::session::revoke_all_for_user`]) — a cached session keeps
/// resolving even after this row is revoked.
pub async fn revoke_all_for_user(pool: &sqlx::PgPool, user_id: UserId) -> anyhow::Result<()> {
    sqlx::query("UPDATE sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL")
        .bind(user_id.as_uuid())
        .execute(pool)
        .await
        .context("revoke all sessions for user")?;
    Ok(())
}

/// Token hashes of a user's currently-valid sessions — used to evict their cached
/// entries when revoking all of them.
pub async fn active_token_hashes(
    pool: &sqlx::PgPool,
    user_id: UserId,
) -> anyhow::Result<Vec<String>> {
    let rows: Vec<String> = sqlx::query_scalar(
        "SELECT token_hash FROM sessions \
         WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > now()",
    )
    .bind(user_id.as_uuid())
    .fetch_all(pool)
    .await
    .context("list active session hashes")?;
    Ok(rows)
}
