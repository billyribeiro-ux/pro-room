//! Server-side sessions: issuing the cookie, resolving the current user (cache
//! first, then Postgres), and the `CurrentUser` request extractor.

use crate::crypto;
use crate::error::AppError;
use crate::state::AppState;
use crate::{config::Config, db};
use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use axum_extra::extract::cookie::{Cookie, CookieJar, SameSite};
use domain::{Role, UserId};
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

/// Name of the session cookie. Plain (not `__Host-`) so it also works over http
/// during local development; attributes below still lock it down in production.
pub const COOKIE_NAME: &str = "proom_session";

/// The authenticated user as resolved from a session. Cached in Redis (hence
/// `Serialize`/`Deserialize`) to avoid a Postgres hit on every request.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionUser {
    pub user_id: UserId,
    pub email: String,
    pub display_name: String,
    pub global_role: Role,
}

/// Create a session for `user_id` and return the cookie to set on the response.
pub async fn issue(
    state: &AppState,
    user_id: UserId,
    user_agent: Option<&str>,
    ip: Option<&str>,
) -> Result<Cookie<'static>, AppError> {
    let token = crypto::generate_token();
    let expires_at = OffsetDateTime::now_utc() + state.config.session_ttl;
    db::sessions::create(&state.db, user_id, &token.hash, expires_at, user_agent, ip).await?;
    Ok(build_cookie(token.secret, &state.config))
}

/// Revoke the current session (if any) and return a cookie that clears it.
pub async fn revoke(state: &AppState, jar: &CookieJar) -> Result<Cookie<'static>, AppError> {
    if let Some(secret) = jar.get(COOKIE_NAME).map(|c| c.value().to_owned()) {
        let hash = crypto::hash_token(&secret);
        db::sessions::revoke(&state.db, &hash).await?;
        let _ = state.cache.drop_session(&hash).await;
    }
    Ok(clear_cookie(&state.config))
}

/// Resolve a session token to its user, consulting the cache before Postgres and
/// populating the cache on a miss.
pub async fn resolve(state: &AppState, secret: &str) -> Result<Option<SessionUser>, AppError> {
    let hash = crypto::hash_token(secret);
    if let Ok(Some(cached)) = state.cache.get_session(&hash).await {
        return Ok(Some(cached));
    }
    let Some(user) = db::sessions::resolve(&state.db, &hash).await? else {
        return Ok(None);
    };
    let _ = state.cache.put_session(&hash, &user).await;
    Ok(Some(user))
}

fn build_cookie(secret: String, config: &Config) -> Cookie<'static> {
    let secure = config.public_web_url.starts_with("https");
    Cookie::build((COOKIE_NAME, secret))
        .http_only(true)
        .same_site(SameSite::Lax)
        .secure(secure)
        .path("/")
        .max_age(time::Duration::seconds(
            i64::try_from(config.session_ttl.as_secs()).unwrap_or(i64::MAX),
        ))
        .build()
}

fn clear_cookie(config: &Config) -> Cookie<'static> {
    let secure = config.public_web_url.starts_with("https");
    Cookie::build((COOKIE_NAME, ""))
        .http_only(true)
        .same_site(SameSite::Lax)
        .secure(secure)
        .path("/")
        .max_age(time::Duration::ZERO)
        .build()
}

/// Extractor for endpoints that require authentication. Yields `401` when no
/// valid session is present.
pub struct CurrentUser(pub SessionUser);

impl FromRequestParts<AppState> for CurrentUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let jar = CookieJar::from_headers(&parts.headers);
        let secret = jar.get(COOKIE_NAME).ok_or(AppError::Unauthorized)?.value();
        let user = resolve(state, secret)
            .await?
            .ok_or(AppError::Unauthorized)?;
        Ok(Self(user))
    }
}
