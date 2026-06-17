//! Private (1:1) message endpoints.
//!
//! A private message is room-scoped but addressed to exactly one other user. The
//! durable history lives in `private_messages`; the live delivery is the
//! privacy-critical part — see [`crate::realtime::RealtimeHub::publish_to_user`].
//! A `PrivateMessage` event is sent ONLY to the sender and the recipient via
//! their per-user channels; it is never published on the room-wide channel.
//!
//! RBAC mapping (cite-the-rule):
//! - `POST   /api/rooms/{id}/pm`           → [`Action::SendPrivateMessage`]
//! - `GET    /api/rooms/{id}/pm/threads`   → [`Action::SendPrivateMessage`]
//! - `GET    /api/rooms/{id}/pm/{peer_id}` → [`Action::SendPrivateMessage`]
//!
//! Reads reuse `SendPrivateMessage` deliberately: anyone permitted to send a PM
//! in the room may read their own threads. The privileged "read everyone's PMs"
//! capability is [`Action::ReadAllPrivateMessages`] and lives on the admin route
//! in `http::admin`.

use crate::auth::session::CurrentUser;
use crate::authorization::RoomContext;
use crate::db;
use crate::db::private_messages::{PrivateMessageView, PrivateThreadSummary};
use crate::error::{AppError, AppResult};
use crate::realtime::event::RoomEvent;
use crate::state::AppState;
use axum::Json;
use axum::Router;
use axum::extract::{Path, State};
use axum::routing::{get, post};
use domain::{Action, RoomId, UserId};
use serde::Deserialize;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/rooms/{id}/pm", post(send))
        .route("/api/rooms/{id}/pm/threads", get(list_threads))
        .route("/api/rooms/{id}/pm/{peer_id}", get(thread))
}

/// Newest-first cap on a returned thread / inbox read.
const MAX_PM: i64 = 100;
const MAX_BODY_LEN: usize = 2000;

#[derive(Deserialize)]
struct SendPmBody {
    recipient_id: UserId,
    body: String,
}

/// Send a 1:1 private message. RBAC: [`Action::SendPrivateMessage`] (members may
/// send within a room they can access; the ABAC layer enforces room access).
///
/// Privacy: after persisting, the `PrivateMessage` event is delivered ONLY to the
/// sender and recipient via [`crate::realtime::RealtimeHub::publish_to_user`] —
/// never on the room-wide channel.
async fn send(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    Json(payload): Json<SendPmBody>,
) -> AppResult<Json<PrivateMessageView>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::SendPrivateMessage).await?;

    if !state
        .cache
        .rate_limit(&format!("pm:{id}:{}", user.user_id), 60, 60)
        .await?
    {
        return Err(AppError::RateLimited);
    }

    let recipient = payload.recipient_id;
    // Mirror the DB CHECK (`pm_not_self`): a self-addressed PM is a 400, not a
    // constraint error surfaced as a 500.
    if recipient == user.user_id {
        return Err(AppError::BadRequest(
            "cannot send a private message to yourself".into(),
        ));
    }

    let body = payload.body.trim();
    if body.is_empty() {
        return Err(AppError::BadRequest("message body is required".into()));
    }
    if body.len() > MAX_BODY_LEN {
        return Err(AppError::BadRequest("message is too long".into()));
    }

    // The recipient must be a real user (→ 404 if absent). `effective_role`'s LEFT
    // JOIN returns Some for ANY existing user, so it proves existence only.
    db::members::effective_role(&state.db, id, recipient)
        .await?
        .ok_or(AppError::NotFound)?;
    // Existence isn't access: also require the recipient to be IN this room — a
    // member, or anyone if the room is public. Without this, a PM could be addressed
    // to a user who isn't a participant of a PRIVATE room.
    let recipient_has_access = ctx.room.visibility == domain::entities::RoomVisibility::Public
        || db::members::get(&state.db, id, recipient).await?.is_some();
    if !recipient_has_access {
        return Err(AppError::Forbidden("recipient is not in this room"));
    }

    let message =
        db::private_messages::create(&state.db, id, user.user_id, recipient, body).await?;

    // Targeted delivery: only the two participants' sockets receive this frame.
    // Publishing to both channels (not just the recipient) means the sender's
    // other tabs/devices also see the sent message live.
    let event = RoomEvent::PrivateMessage {
        message: message.clone(),
    };
    let json = event.to_json();
    let _ = state.hub.publish_to_user(id, recipient, &json).await;
    let _ = state.hub.publish_to_user(id, user.user_id, &json).await;

    Ok(Json(message))
}

/// List the caller's PM conversations in this room (one summary per peer), newest
/// active first. RBAC: [`Action::SendPrivateMessage`] — a PM participant may list
/// their own inbox.
async fn list_threads(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
) -> AppResult<Json<Vec<PrivateThreadSummary>>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::SendPrivateMessage).await?;
    Ok(Json(
        db::private_messages::threads_for(&state.db, id, user.user_id).await?,
    ))
}

/// Read the thread between the caller and `peer_id` in this room, newest-first.
/// RBAC: [`Action::SendPrivateMessage`] — the query is scoped to the caller's own
/// pair, so a member only ever sees their own conversation, never another user's.
async fn thread(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path((id, peer_id)): Path<(RoomId, UserId)>,
) -> AppResult<Json<Vec<PrivateMessageView>>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::SendPrivateMessage).await?;
    Ok(Json(
        db::private_messages::thread(&state.db, id, user.user_id, peer_id, MAX_PM).await?,
    ))
}
