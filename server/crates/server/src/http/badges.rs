//! Badge registry endpoints: a PUBLIC read of the registry (so any client can
//! render a message author's badges) plus admin-only writes (create/delete a
//! badge, assign/unassign to a user). Account-wide, gated on
//! [`Action::ManageBadges`] (admin+, reusing the `RoomManage` capability).

use crate::auth::session::CurrentUser;
use crate::authorization::ensure_system_action;
use crate::db;
use crate::db::badges::Badge;
use crate::error::{AppError, AppResult};
use crate::state::AppState;
use axum::Json;
use axum::Router;
use axum::extract::{Path, State};
use axum::routing::{get, post};
use domain::{Action, UserId};
use serde::Deserialize;
use uuid::Uuid;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/badges", get(list).post(create))
        .route("/api/badges/{id}", axum::routing::delete(remove))
        .route("/api/badges/{id}/assign", post(assign))
        .route(
            "/api/badges/{id}/assign/{user_id}",
            axum::routing::delete(unassign),
        )
}

/// Public: the full badge registry (clients resolve author badges against it /
/// render the badges carried inline on each message).
async fn list(State(state): State<AppState>) -> AppResult<Json<Vec<Badge>>> {
    Ok(Json(db::badges::list(&state.db).await?))
}

#[derive(Deserialize)]
struct CreateBadgeBody {
    slug: String,
    label: String,
    image_url: Option<String>,
    bg_color: Option<String>,
    text_color: Option<String>,
    position: Option<i32>,
}

/// Admin: create a registry badge.
async fn create(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Json(body): Json<CreateBadgeBody>,
) -> AppResult<Json<Badge>> {
    ensure_system_action(&state, &user, Action::ManageBadges).await?;

    let slug = body.slug.trim();
    let label = body.label.trim();
    if slug.is_empty() || label.is_empty() {
        return Err(AppError::BadRequest("slug and label are required".into()));
    }
    if slug.len() > 40 || label.len() > 40 {
        return Err(AppError::BadRequest(
            "slug and label must be 40 characters or fewer".into(),
        ));
    }
    let image_url = body.image_url.as_deref().map(str::trim).filter(|s| !s.is_empty());
    let badge = db::badges::create(
        &state.db,
        slug,
        label,
        image_url,
        body.bg_color.as_deref().unwrap_or("#45a2ff"),
        body.text_color.as_deref().unwrap_or("#ffffff"),
        body.position.unwrap_or(0),
        user.user_id,
    )
    .await
    .map_err(|e| {
        // A duplicate slug is a 409, not a 500.
        if e.to_string().contains("badges_slug_key") {
            AppError::Conflict("a badge with that slug already exists".into())
        } else {
            AppError::Internal(e)
        }
    })?;
    Ok(Json(badge))
}

/// Admin: delete a registry badge (cascades to assignments).
async fn remove(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    ensure_system_action(&state, &user, Action::ManageBadges).await?;
    if !db::badges::delete(&state.db, id).await? {
        return Err(AppError::NotFound);
    }
    Ok(Json(serde_json::json!({ "ok": true })))
}

#[derive(Deserialize)]
struct AssignBody {
    user_id: UserId,
}

/// Admin: assign a badge to a user.
async fn assign(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<Uuid>,
    Json(body): Json<AssignBody>,
) -> AppResult<Json<serde_json::Value>> {
    ensure_system_action(&state, &user, Action::ManageBadges).await?;
    // The recipient must be a real user.
    db::users::find_by_id(&state.db, body.user_id)
        .await?
        .ok_or(AppError::NotFound)?;
    db::badges::assign(&state.db, body.user_id, id, user.user_id).await?;
    Ok(Json(serde_json::json!({ "ok": true })))
}

/// Admin: remove a badge assignment from a user.
async fn unassign(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path((id, user_id)): Path<(Uuid, UserId)>,
) -> AppResult<Json<serde_json::Value>> {
    ensure_system_action(&state, &user, Action::ManageBadges).await?;
    db::badges::unassign(&state.db, user_id, id).await?;
    Ok(Json(serde_json::json!({ "ok": true })))
}
