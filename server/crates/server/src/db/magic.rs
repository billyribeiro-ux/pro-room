//! Magic-link token repository: single-use, short-TTL tokens keyed by hash.

use anyhow::Context as _;
use time::OffsetDateTime;

pub async fn create(
    pool: &sqlx::PgPool,
    email: &str,
    token_hash: &str,
    expires_at: OffsetDateTime,
) -> anyhow::Result<()> {
    sqlx::query!(
        r#"
        INSERT INTO magic_link_tokens (email, token_hash, expires_at)
        VALUES ($1, $2, $3)
        "#,
        email,
        token_hash,
        expires_at,
    )
    .execute(pool)
    .await
    .context("insert magic token")?;
    Ok(())
}

/// Atomically consume a magic-link token, returning the associated email if the
/// token is valid (exists, unexpired, unconsumed).
pub async fn consume(pool: &sqlx::PgPool, token_hash: &str) -> anyhow::Result<Option<String>> {
    let row = sqlx::query!(
        r#"
        UPDATE magic_link_tokens
        SET consumed_at = now()
        WHERE token_hash = $1
          AND consumed_at IS NULL
          AND expires_at > now()
        RETURNING email
        "#,
        token_hash,
    )
    .fetch_optional(pool)
    .await
    .context("consume magic token")?;
    Ok(row.map(|r| r.email))
}
