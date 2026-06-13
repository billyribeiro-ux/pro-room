//! Chat message endpoints. Any room member may post and read.

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
use domain::entities::Message;
use domain::{Action, RoomId};
use serde::Deserialize;

pub fn router() -> Router<AppState> {
    Router::new().route("/api/rooms/{id}/messages", get(list).post(create))
}

const MAX_MESSAGES: i64 = 100;
const MAX_BODY_LEN: usize = 2000;

#[derive(Deserialize)]
struct CreateMessageBody {
    body: String,
}

async fn create(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    Json(payload): Json<CreateMessageBody>,
) -> AppResult<Json<Message>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::PostMessage).await?;

    if !state
        .cache
        .rate_limit(&format!("msg:{id}:{}", user.user_id), 60, 60)
        .await?
    {
        return Err(AppError::RateLimited);
    }

    let body = payload.body.trim();
    if body.is_empty() {
        return Err(AppError::BadRequest("message body is required".into()));
    }
    if body.len() > MAX_BODY_LEN {
        return Err(AppError::BadRequest("message is too long".into()));
    }

    let message = db::messages::create(&state.db, id, user.user_id, body).await?;
    let event = RoomEvent::Chat {
        message: message.clone(),
        author_name: user.display_name.clone(),
    };
    let _ = state.hub.publish(id, &event.to_json()).await;
    Ok(Json(message))
}

async fn list(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
) -> AppResult<Json<Vec<Message>>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ReadMessage).await?;
    Ok(Json(
        db::messages::list_recent(&state.db, id, MAX_MESSAGES).await?,
    ))
}
