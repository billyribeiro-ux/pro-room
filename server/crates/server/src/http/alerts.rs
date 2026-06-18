//! Trade alert endpoints. Posting is restricted by the authz engine to admins/
//! super admins in a live room; reads are open to members.

use crate::auth::session::CurrentUser;
use crate::authorization::RoomContext;
use crate::db;
use crate::db::alerts::AlertView;
use crate::error::{AppError, AppResult};
use crate::realtime::event::RoomEvent;
use crate::state::AppState;
use axum::Json;
use axum::Router;
use axum::extract::{Path, State};
use axum::routing::get;
use domain::entities::Alert;
use domain::{Action, RoomId};
use serde::Deserialize;

pub fn router() -> Router<AppState> {
    Router::new().route("/api/rooms/{id}/alerts", get(list).post(create))
}

const MAX_ALERTS: i64 = 100;

#[derive(Deserialize)]
struct CreateAlertBody {
    symbol: String,
    side: String,
    note: Option<String>,
    /// Whether to also tweet this alert. Stored as intent; X delivery not wired.
    post_to_x: Option<bool>,
    /// Whether to suppress the push notification. Stored as intent; push
    /// delivery not wired.
    no_push: Option<bool>,
}

async fn create(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    Json(body): Json<CreateAlertBody>,
) -> AppResult<Json<Alert>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::PostAlert).await?;

    if !state
        .cache
        .rate_limit(&format!("alert:{id}:{}", user.user_id), 30, 60)
        .await?
    {
        return Err(AppError::RateLimited);
    }

    let symbol = body.symbol.trim().to_uppercase();
    let side = body.side.trim().to_lowercase();
    if symbol.is_empty() || side.is_empty() {
        return Err(AppError::BadRequest("symbol and side are required".into()));
    }
    let note = body
        .note
        .as_deref()
        .map(str::trim)
        .filter(|s| !s.is_empty());

    // Delivery-intent flags from the Post Alert modal. Default to false when the
    // client omits them (older clients / non-trade announcements).
    // TODO: wire X/push delivery — for now the flags are only persisted so the
    // author's intent is captured.
    let post_to_x = body.post_to_x.unwrap_or(false);
    let no_push = body.no_push.unwrap_or(false);

    let alert = db::alerts::create(
        &state.db,
        id,
        user.user_id,
        &symbol,
        &side,
        note,
        post_to_x,
        no_push,
    )
    .await?;
    let author_badges = db::badges::for_author(&state.db, user.user_id).await?;
    let event = RoomEvent::Alert {
        alert: alert.clone(),
        author_name: user.display_name.clone(),
        author_badges,
    };
    let _ = state.hub.publish(id, &event.to_json()).await;
    Ok(Json(alert))
}

async fn list(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
) -> AppResult<Json<Vec<AlertView>>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ReadAlert).await?;
    Ok(Json(
        db::alerts::list_recent(&state.db, id, MAX_ALERTS).await?,
    ))
}
