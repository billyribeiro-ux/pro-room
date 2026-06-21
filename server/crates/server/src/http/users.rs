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
use axum::routing::{delete, get, patch};
use domain::entities::{User, UserStatus};
use domain::{Action, Role, UserId};
use serde::Deserialize;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/users", get(list).post(create))
        .route("/api/users/{id}", delete(delete_user))
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
    super::auth::validate_password(&body.password)?;
    let display_name = super::auth::validate_display_name(&body.display_name)?;
    if db::users::find_by_email(&state.db, &email).await?.is_some() {
        return Err(AppError::Conflict("email already registered".into()));
    }
    // Argon2 is CPU-bound (~10-40ms); hash off the async worker.
    let password = body.password.clone();
    let hash = tokio::task::spawn_blocking(move || crypto::hash_password(&password))
        .await
        .map_err(|e| AppError::Internal(anyhow::Error::new(e)))??;
    let new_user =
        match db::users::create(&state.db, &email, &display_name, Some(&hash), body.role).await {
            Ok(u) => u,
            // A racing duplicate (unique-violation) resolves to 409, not a generic 500.
            Err(e) => {
                if db::users::find_by_email(&state.db, &email).await?.is_some() {
                    return Err(AppError::Conflict("email already registered".into()));
                }
                return Err(e.into());
            }
        };
    db::identities::link(&state.db, new_user.id, "password", &email).await?;
    audit_user(
        &state,
        user.user_id,
        new_user.id,
        "user.create",
        &format!("role={}", body.role.as_str()),
    )
    .await;
    Ok(Json(new_user))
}

/// Append a per-action audit row identifying the TARGET user + the change.
/// `ensure_system_action` already audits the authorization DECISION against the
/// generic "system" resource; this records WHO was created/promoted/suspended —
/// the whole point of the log for privileged user management. Best-effort: a
/// failed audit write is logged, not fatal (the mutation already committed).
async fn audit_user(state: &AppState, actor: UserId, target: UserId, action: &str, detail: &str) {
    let resource = format!("user:{}", target.as_uuid());
    let entry = db::audit::AuditEntry {
        actor_id: Some(actor),
        action,
        resource: &resource,
        decision: "allow",
        reason: Some(detail),
    };
    if let Err(e) = db::audit::record(&state.db, entry).await {
        tracing::warn!(error = ?e, action, "failed to write user-action audit");
    }
}

/// Hard-delete a user (remove a test account). Gated on `ManageUsers`
/// (`super_admin` only). Cascades the user's authored content (see
/// `db::users::delete`). Guards against deleting your OWN account (instant
/// self-lockout). 404 when no such user.
async fn delete_user(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<UserId>,
) -> AppResult<Json<serde_json::Value>> {
    ensure_system_action(&state, &user, Action::ManageUsers).await?;
    if id == user.user_id {
        return Err(AppError::BadRequest(
            "you can't delete your own account".into(),
        ));
    }
    if !db::users::delete(&state.db, id).await? {
        return Err(AppError::NotFound);
    }
    audit_user(&state, user.user_id, id, "user.delete", "").await;
    Ok(Json(serde_json::json!({ "ok": true })))
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
    // Don't demote the LAST active super-admin (would lock everyone out of user
    // management). Check-then-act is fine here — only super-admins reach this.
    if body.role != Role::SuperAdmin
        && matches!(db::users::find_by_id(&state.db, id).await?, Some(u) if u.global_role == Role::SuperAdmin)
        && db::users::count_active_super_admins(&state.db).await? <= 1
    {
        return Err(AppError::BadRequest(
            "can't change the role of the last super admin".into(),
        ));
    }
    db::users::set_role(&state.db, id, body.role).await?;
    audit_user(
        &state,
        user.user_id,
        id,
        "user.set_role",
        &format!("role={}", body.role.as_str()),
    )
    .await;
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
    // Don't suspend the LAST active super-admin (would lock everyone out).
    if body.status != UserStatus::Active
        && matches!(db::users::find_by_id(&state.db, id).await?, Some(u) if u.global_role == Role::SuperAdmin)
        && db::users::count_active_super_admins(&state.db).await? <= 1
    {
        return Err(AppError::BadRequest(
            "can't suspend the last super admin".into(),
        ));
    }
    db::users::set_status(&state.db, id, body.status).await?;
    audit_user(
        &state,
        user.user_id,
        id,
        "user.set_status",
        &format!("status={}", body.status.as_str()),
    )
    .await;
    Ok(Json(serde_json::json!({ "ok": true })))
}
