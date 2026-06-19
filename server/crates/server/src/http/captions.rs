//! Live closed-captions: the presenter POSTs finalized caption phrases, which are
//! broadcast room-wide as an ephemeral [`RoomEvent::Caption`]. Presenter-gated on
//! [`Action::PublishScreen`] (the same gate as screen-sharing) so only a presenter
//! can caption the room. Nothing is persisted.

use crate::auth::session::CurrentUser;
use crate::authorization::RoomContext;
use crate::error::AppResult;
use crate::realtime::event::RoomEvent;
use crate::state::AppState;
use axum::Json;
use axum::Router;
use axum::extract::{Path, State};
use axum::routing::post;
use domain::{Action, RoomId};
use serde::Deserialize;

/// Cap on a single caption phrase, so a runaway recognizer can't flood the room.
const MAX_CAPTION_LEN: usize = 500;

pub fn router() -> Router<AppState> {
    Router::new().route("/api/rooms/{id}/captions", post(post_caption))
}

#[derive(Deserialize)]
struct CaptionBody {
    text: String,
}

async fn post_caption(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    Json(body): Json<CaptionBody>,
) -> AppResult<Json<serde_json::Value>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::PublishScreen).await?;

    let text = body.text.trim();
    if text.is_empty() {
        return Ok(Json(serde_json::json!({ "ok": true })));
    }
    // Truncate (char-safe) rather than reject, so a long phrase still captions.
    let text: String = text.chars().take(MAX_CAPTION_LEN).collect();

    let event = RoomEvent::Caption {
        speaker_name: user.display_name.clone(),
        text,
    };
    let _ = state.hub.publish(id, &event.to_json()).await;
    Ok(Json(serde_json::json!({ "ok": true })))
}
