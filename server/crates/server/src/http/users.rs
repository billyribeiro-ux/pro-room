//! User administration. Gated on the account-wide `ManageUsers` capability,
//! which only `super_admin` holds.

use crate::auth::session::CurrentUser;
use crate::authorization::ensure_system_action;
use crate::db;
use crate::error::AppResult;
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
        .route("/api/users", get(list))
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
