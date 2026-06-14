//! Passwordless magic-link sign-in.

use crate::auth::{account, mailer};
use crate::crypto;
use crate::db;
use crate::error::{AppError, AppResult};
use crate::state::AppState;
use domain::UserId;
use time::{Duration, OffsetDateTime};

/// How long a magic link remains valid.
const TTL_MINUTES: i64 = 15;

/// Issue a magic link for `email`: store the token hash and deliver the link.
/// Always succeeds for any well-formed email so the endpoint does not reveal
/// which addresses have accounts.
pub async fn request(state: &AppState, email: &str) -> AppResult<()> {
    let token = crypto::generate_token();
    let expires_at = OffsetDateTime::now_utc() + Duration::minutes(TTL_MINUTES);
    db::magic::create(&state.db, email, &token.hash, expires_at).await?;

    let link = format!(
        "{}/auth/magic?token={}",
        state.config.public_web_url.trim_end_matches('/'),
        token.secret
    );
    mailer::send_magic_link(&state.config, email, &link);
    Ok(())
}

/// Verify a magic-link token, provisioning the account if needed, and return the
/// user to start a session for.
pub async fn verify(state: &AppState, token_secret: &str) -> AppResult<UserId> {
    let hash = crypto::hash_token(token_secret);
    let email = db::magic::consume(&state.db, &hash)
        .await?
        .ok_or(AppError::BadRequest("invalid or expired link".into()))?;

    let display_name = email.split('@').next().unwrap_or("trader").to_owned();
    let user = account::find_or_create_by_email(state, &email, &display_name).await?;
    db::identities::link(&state.db, user.id, "magic", &email).await?;
    Ok(user.id)
}
