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

/// Revoke EVERY session for a user across BOTH stores (Postgres rows + the Redis
/// session cache), e.g. after a password change. Evicting the cache is essential:
/// [`resolve`] checks the cache before Postgres, so a cached entry would keep
/// authenticating after the row is revoked.
pub async fn revoke_all_for_user(state: &AppState, user_id: UserId) -> Result<(), AppError> {
    let hashes = db::sessions::active_token_hashes(&state.db, user_id).await?;
    db::sessions::revoke_all_for_user(&state.db, user_id).await?;
    for hash in &hashes {
        let _ = state.cache.drop_session(hash).await;
    }
    Ok(())
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
        if let Some(cookie) = jar.get(COOKIE_NAME)
            && let Some(user) = resolve(state, cookie.value()).await?
        {
            return Ok(Self(user));
        }

        // DEV-ONLY auth bypass. Gated behind `AUTH_DEV_BYPASS` (default off, see
        // `Config::auth_dev_bypass`). When there is no valid session AND the flag
        // is set, resolve a synthetic super-admin so QA can hit every endpoint
        // without logging in. This branch is unreachable in production because
        // the flag stays unset. NEVER SHIP ENABLED.
        // Compile-time fence: `cfg!(debug_assertions)` is a constant `false` in a
        // release build, so this branch is dead-code-eliminated from production
        // binaries — the bypass cannot run there even if the flag were set (and
        // `Config::from_env` refuses to start a release build with it enabled).
        if cfg!(debug_assertions) && state.config.auth_dev_bypass {
            return Ok(Self(dev_bypass_user(state).await?));
        }

        Err(AppError::Unauthorized)
    }
}

/// DEV-ONLY: build the synthetic caller used by the `AUTH_DEV_BYPASS` testing
/// affordance. Resolves a real highest-privilege user row so any FK-referencing
/// write (membership upserts, audit rows) stays valid, then forces the global
/// role to the most privileged value so every RBAC capability check passes.
/// Errors loudly (`401`) if the database has no admin/super-admin to borrow.
async fn dev_bypass_user(state: &AppState) -> Result<SessionUser, AppError> {
    let user = db::users::find_highest_privilege(&state.db)
        .await?
        .ok_or(AppError::Unauthorized)?;
    tracing::warn!(
        user_id = %user.id,
        "AUTH_DEV_BYPASS active: serving request as synthetic super-admin (dev-only)"
    );
    Ok(SessionUser {
        user_id: user.id,
        email: user.email,
        display_name: user.display_name,
        // Force the highest role regardless of the borrowed row's actual role so
        // all role-gated capabilities resolve to allow.
        global_role: Role::SuperAdmin,
    })
}
