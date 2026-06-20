//! User administration. Gated on the account-wide `ManageUsers` capability,
//! which only `super_admin` holds.

use crate::auth::session::CurrentUser;
use crate::authorization::ensure_system_action;
use crate::crypto;
use crate::db;
use crate::error::{AppError, AppResult};
use crate::state::AppState;
use axum::Json;
use axum::Router;
use axum::extract::{Path, State};
use axum::routing::{get, patch};
use domain::entities::{User, UserStatus};
use domain::{Action, Role, UserId};
use serde::Deserialize;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/users", get(list).post(create))
        .route("/api/users/{id}/role", patch(set_role))
        .route("/api/users/{id}/status", patch(set_status))
}

async fn list(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
) -> AppResult<Json<Vec<User>>> {
    ensure_system_action(&state, &user, Action::ManageUsers).await?;
    Ok(Json(db::users::list(&state.db).await?))
}

#[derive(Deserialize)]
struct CreateUserBody {
    email: String,
    display_name: String,
    password: String,
    role: Role,
}

/// Create a user with a chosen role + password — the super-admin "Add User" action.
/// Gated on `ManageUsers` (`super_admin` only). Mirrors register's validation +
/// argon2 hashing, but does NOT issue a session (the admin is provisioning an
/// account, not logging in as it). The new user signs in with this password and can
/// change it via `POST /api/auth/password`.
async fn create(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Json(body): Json<CreateUserBody>,
) -> AppResult<Json<User>> {
    ensure_system_action(&state, &user, Action::ManageUsers).await?;

    let email = super::auth::normalize_email(&body.email)?;
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
    // Argon2 is CPU-bound (~10-40ms); hash off the async worker.
    let password = body.password.clone();
    let hash = tokio::task::spawn_blocking(move || crypto::hash_password(&password))
        .await
        .map_err(|e| AppError::Internal(anyhow::Error::new(e)))??;
    let new_user =
        db::users::create(&state.db, &email, display_name, Some(&hash), body.role).await?;
    db::identities::link(&state.db, new_user.id, "password", &email).await?;
    Ok(Json(new_user))
}

#[derive(Deserialize)]
struct SetRoleBody {
    role: Role,
}

async fn set_role(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<UserId>,
    Json(body): Json<SetRoleBody>,
) -> AppResult<Json<serde_json::Value>> {
    ensure_system_action(&state, &user, Action::ManageUsers).await?;
    db::users::set_role(&state.db, id, body.role).await?;
    Ok(Json(serde_json::json!({ "ok": true })))
}

#[derive(Deserialize)]
struct SetStatusBody {
    status: UserStatus,
}

async fn set_status(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<UserId>,
    Json(body): Json<SetStatusBody>,
) -> AppResult<Json<serde_json::Value>> {
    ensure_system_action(&state, &user, Action::ManageUsers).await?;
    db::users::set_status(&state.db, id, body.status).await?;
    Ok(Json(serde_json::json!({ "ok": true })))
}
