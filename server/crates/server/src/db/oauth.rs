//! Transient OAuth authorization-code state (CSRF token + PKCE verifier).

use anyhow::Context as _;
use time::OffsetDateTime;

pub async fn save(
    pool: &sqlx::PgPool,
    state: &str,
    provider: &str,
    pkce_verifier: &str,
    redirect_to: Option<&str>,
    expires_at: OffsetDateTime,
) -> anyhow::Result<()> {
    sqlx::query!(
        r#"
        INSERT INTO oauth_states (state, provider, pkce_verifier, redirect_to, expires_at)
        VALUES ($1, $2::text::identity_provider, $3, $4, $5)
        "#,
        state,
        provider,
        pkce_verifier,
        redirect_to,
        expires_at,
    )
    .execute(pool)
    .await
    .context("save oauth state")?;
    Ok(())
}

pub struct OAuthState {
    pub provider: String,
    pub pkce_verifier: String,
    pub redirect_to: Option<String>,
}

/// Atomically consume the stored state for a callback.
pub async fn consume(pool: &sqlx::PgPool, state: &str) -> anyhow::Result<Option<OAuthState>> {
    let row = sqlx::query!(
        r#"
        DELETE FROM oauth_states
        WHERE state = $1 AND expires_at > now()
        RETURNING provider::text AS "provider!", pkce_verifier, redirect_to
        "#,
        state,
    )
    .fetch_optional(pool)
    .await
    .context("consume oauth state")?;
    Ok(row.map(|r| OAuthState {
        provider: r.provider,
        pkce_verifier: r.pkce_verifier,
        redirect_to: r.redirect_to,
    }))
}
