//! Authentication endpoints: password register/login/logout, the current-user
//! view, magic-link request/verify, and the OAuth start/callback dance.

use crate::auth::oauth::Provider;
use crate::auth::session::{CurrentUser, SessionUser};
use crate::auth::{account, magic, oauth, session};
use crate::crypto;
use crate::db;
use crate::error::{AppError, AppResult};
use crate::state::AppState;
use crate::util;
use axum::Json;
use axum::Router;
use axum::extract::{ConnectInfo, Path, Query, State};
use axum::http::HeaderMap;
use axum::response::Redirect;
use axum::routing::{get, post};
use axum_extra::extract::cookie::CookieJar;
use domain::entities::User;
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/auth/register", post(register))
        .route("/api/auth/login", post(login))
        .route("/api/auth/logout", post(logout))
        .route("/api/auth/me", get(me).patch(update_me))
        .route("/api/auth/password", post(change_password))
        .route("/api/auth/magic/request", post(magic_request))
        .route("/api/auth/magic/verify", get(magic_verify))
        .route("/api/auth/oauth/{provider}/start", get(oauth_start))
        .route("/api/auth/oauth/{provider}/callback", get(oauth_callback))
}

#[derive(Deserialize)]
struct RegisterBody {
    email: String,
    password: String,
    display_name: String,
}

#[derive(Deserialize)]
struct LoginBody {
    email: String,
    password: String,
}

#[derive(Serialize)]
struct MeResponse {
    user: PublicUser,
    permissions: Vec<String>,
}

#[derive(Serialize)]
struct PublicUser {
    id: domain::UserId,
    email: String,
    display_name: String,
    global_role: domain::Role,
}

fn me_response(user: &SessionUser) -> MeResponse {
    MeResponse {
        user: PublicUser {
            id: user.user_id,
            email: user.email.clone(),
            display_name: user.display_name.clone(),
            global_role: user.global_role,
        },
        permissions: authz::rbac::permissions_for(user.global_role)
            .into_iter()
            .map(|p| p.as_str().to_owned())
            .collect(),
    }
}

fn session_user(user: User) -> SessionUser {
    SessionUser {
        user_id: user.id,
        email: user.email,
        display_name: user.display_name,
        global_role: user.global_role,
    }
}

async fn register(
    State(state): State<AppState>,
    jar: CookieJar,
    headers: HeaderMap,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    Json(body): Json<RegisterBody>,
) -> AppResult<(CookieJar, Json<MeResponse>)> {
    let email = normalize_email(&body.email)?;
    if body.password.len() < 8 {
        return Err(AppError::BadRequest(
            "password must be at least 8 characters".into(),
        ));
    }
    let display_name = body.display_name.trim();
    if display_name.is_empty() {
        return Err(AppError::BadRequest("display name is required".into()));
    }

    if db::users::find_by_email(&state.db, &email).await?.is_some() {
        return Err(AppError::Conflict("email already registered".into()));
    }

    let role = account::bootstrap_role(&state).await?;
    // Argon2 is ~10-40ms of pure CPU; run it on a blocking thread so it doesn't
    // park a Tokio async worker (which would stall every other in-flight request).
    let password = body.password.clone();
    let hash = tokio::task::spawn_blocking(move || crypto::hash_password(&password))
        .await
        .map_err(|e| AppError::Internal(anyhow::Error::new(e)))??;
    let user = db::users::create(&state.db, &email, display_name, Some(&hash), role).await?;
    db::identities::link(&state.db, user.id, "password", &email).await?;

    let session_user = session_user(user);
    let ip = util::client_ip(&headers, Some(peer));
    let cookie =
        session::issue(&state, session_user.user_id, user_agent(&headers), ip.as_deref()).await?;
    Ok((jar.add(cookie), Json(me_response(&session_user))))
}

async fn login(
    State(state): State<AppState>,
    jar: CookieJar,
    headers: HeaderMap,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    Json(body): Json<LoginBody>,
) -> AppResult<(CookieJar, Json<MeResponse>)> {
    let email = normalize_email(&body.email)?;

    if !state
        .cache
        .rate_limit(&format!("login:{email}"), 10, 60)
        .await?
    {
        return Err(AppError::RateLimited);
    }

    let record = db::users::find_by_email(&state.db, &email)
        .await?
        .ok_or(AppError::Unauthorized)?;
    let hash = record.password_hash.clone().ok_or(AppError::Unauthorized)?;
    // Verify off the async worker — Argon2 verification is CPU-bound (~10-40ms).
    let password = body.password.clone();
    let ok = tokio::task::spawn_blocking(move || crypto::verify_password(&password, &hash))
        .await
        .map_err(|e| AppError::Internal(anyhow::Error::new(e)))??;
    if !ok {
        return Err(AppError::Unauthorized);
    }

    let session_user = session_user(record.user);
    let ip = util::client_ip(&headers, Some(peer));
    let cookie =
        session::issue(&state, session_user.user_id, user_agent(&headers), ip.as_deref()).await?;
    Ok((jar.add(cookie), Json(me_response(&session_user))))
}

async fn logout(
    State(state): State<AppState>,
    jar: CookieJar,
) -> AppResult<(CookieJar, Json<serde_json::Value>)> {
    let cookie = session::revoke(&state, &jar).await?;
    Ok((jar.add(cookie), Json(serde_json::json!({ "ok": true }))))
}

async fn me(CurrentUser(user): CurrentUser) -> Json<MeResponse> {
    Json(me_response(&user))
}

#[derive(Deserialize)]
struct UpdateMeBody {
    display_name: String,
}

/// Update the caller's OWN display name (reference "Edit my Info"). Self-scoped via
/// `CurrentUser` — a user may only edit their own profile, so no RBAC policy beyond
/// authentication is required. Returns the refreshed `me` view.
async fn update_me(
    State(state): State<AppState>,
    CurrentUser(mut user): CurrentUser,
    Json(body): Json<UpdateMeBody>,
) -> AppResult<Json<MeResponse>> {
    let name = body.display_name.trim();
    // Validate server-side (never trust the client): alphanumeric, >= 3 chars
    // (reference "Username can only contain letters and numbers").
    if name.len() < 3 || !name.chars().all(|c| c.is_ascii_alphanumeric()) {
        return Err(AppError::BadRequest(
            "Display name must be at least 3 letters or numbers (no spaces).".into(),
        ));
    }
    db::users::set_display_name(&state.db, user.user_id, name).await?;
    user.display_name = name.to_owned();
    Ok(Json(me_response(&user)))
}

#[derive(Deserialize)]
struct ChangePasswordBody {
    current_password: String,
    new_password: String,
}

/// Change the caller's OWN password. Self-scoped via `CurrentUser`. The CURRENT
/// password is re-verified before the new one is set, so a hijacked session can't
/// silently re-key the account. Argon2 hash + verify run on a blocking thread.
async fn change_password(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Json(body): Json<ChangePasswordBody>,
) -> AppResult<Json<serde_json::Value>> {
    // Throttle: re-verifying the current password is a brute-force surface even
    // for an authenticated caller.
    if !state
        .cache
        .rate_limit(&format!("changepw:{}", user.user_id.as_uuid()), 10, 60)
        .await?
    {
        return Err(AppError::RateLimited);
    }
    if body.new_password.len() < 8 {
        return Err(AppError::BadRequest(
            "password must be at least 8 characters".into(),
        ));
    }
    let record = db::users::find_by_email(&state.db, &user.email)
        .await?
        .ok_or(AppError::Unauthorized)?;
    let hash = record
        .password_hash
        .clone()
        .ok_or_else(|| AppError::BadRequest("this account has no password set".into()))?;
    let current = body.current_password.clone();
    let ok = tokio::task::spawn_blocking(move || crypto::verify_password(&current, &hash))
        .await
        .map_err(|e| AppError::Internal(anyhow::Error::new(e)))??;
    if !ok {
        return Err(AppError::Unauthorized);
    }
    let new = body.new_password.clone();
    let new_hash = tokio::task::spawn_blocking(move || crypto::hash_password(&new))
        .await
        .map_err(|e| AppError::Internal(anyhow::Error::new(e)))??;
    db::users::set_password_hash(&state.db, user.user_id, &new_hash).await?;
    Ok(Json(serde_json::json!({ "ok": true })))
}

#[derive(Deserialize)]
struct MagicRequestBody {
    email: String,
}

async fn magic_request(
    State(state): State<AppState>,
    Json(body): Json<MagicRequestBody>,
) -> AppResult<Json<serde_json::Value>> {
    let email = normalize_email(&body.email)?;
    if !state
        .cache
        .rate_limit(&format!("magic:{email}"), 3, 300)
        .await?
    {
        return Err(AppError::RateLimited);
    }
    magic::request(&state, &email).await?;
    // Do not reveal whether the address exists.
    Ok(Json(serde_json::json!({ "ok": true })))
}

#[derive(Deserialize)]
struct MagicVerifyQuery {
    token: String,
}

async fn magic_verify(
    State(state): State<AppState>,
    jar: CookieJar,
    headers: HeaderMap,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    Query(query): Query<MagicVerifyQuery>,
) -> AppResult<(CookieJar, Json<MeResponse>)> {
    let user_id = magic::verify(&state, &query.token).await?;
    let user = db::users::find_by_id(&state.db, user_id)
        .await?
        .ok_or(AppError::Unauthorized)?;
    let session_user = session_user(user);
    let ip = util::client_ip(&headers, Some(peer));
    let cookie = session::issue(&state, user_id, user_agent(&headers), ip.as_deref()).await?;
    Ok((jar.add(cookie), Json(me_response(&session_user))))
}

#[derive(Deserialize)]
struct OAuthStartQuery {
    redirect_to: Option<String>,
}

async fn oauth_start(
    State(state): State<AppState>,
    Path(provider): Path<String>,
    Query(query): Query<OAuthStartQuery>,
) -> AppResult<Redirect> {
    let provider = Provider::parse(&provider)?;
    let url = oauth::start(&state, provider, query.redirect_to.as_deref()).await?;
    Ok(Redirect::to(&url))
}

#[derive(Deserialize)]
struct OAuthCallbackQuery {
    code: Option<String>,
    state: Option<String>,
    error: Option<String>,
}

async fn oauth_callback(
    State(state): State<AppState>,
    jar: CookieJar,
    headers: HeaderMap,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    Path(provider): Path<String>,
    Query(query): Query<OAuthCallbackQuery>,
) -> AppResult<(CookieJar, Redirect)> {
    let provider = Provider::parse(&provider)?;
    if let Some(err) = query.error {
        return Err(AppError::BadRequest(format!("oauth error: {err}")));
    }
    let code = query
        .code
        .ok_or(AppError::BadRequest("missing code".into()))?;
    let returned_state = query
        .state
        .ok_or(AppError::BadRequest("missing state".into()))?;

    let (user_id, redirect_to) = oauth::callback(&state, provider, &code, &returned_state).await?;
    let ip = util::client_ip(&headers, Some(peer));
    let cookie = session::issue(&state, user_id, user_agent(&headers), ip.as_deref()).await?;

    let web = state.config.public_web_url.trim_end_matches('/');
    let target = redirect_to
        .filter(|r| r.starts_with('/'))
        .map_or_else(|| format!("{web}/rooms"), |r| format!("{web}{r}"));
    Ok((jar.add(cookie), Redirect::to(&target)))
}

pub(crate) fn normalize_email(raw: &str) -> AppResult<String> {
    let email = raw.trim().to_lowercase();
    if email.len() < 3 || !email.contains('@') {
        return Err(AppError::BadRequest("invalid email".into()));
    }
    Ok(email)
}

fn user_agent(headers: &HeaderMap) -> Option<&str> {
    headers
        .get(axum::http::header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
}
