//! Trade alert endpoints. Posting is restricted by the authz engine to admins/
//! super admins in a live room; reads are open to members.

use crate::auth::session::CurrentUser;
use crate::authorization::RoomContext;
use crate::db;
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

    let alert = db::alerts::create(&state.db, id, user.user_id, &symbol, &side, note).await?;
    let event = RoomEvent::Alert {
        alert: alert.clone(),
        author_name: user.display_name.clone(),
    };
    let _ = state.hub.publish(id, &event.to_json()).await;
    Ok(Json(alert))
}

async fn list(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
) -> AppResult<Json<Vec<Alert>>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ReadAlert).await?;
    Ok(Json(
        db::alerts::list_recent(&state.db, id, MAX_ALERTS).await?,
    ))
}
