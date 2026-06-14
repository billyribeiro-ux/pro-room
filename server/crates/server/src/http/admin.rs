//! Admin moderation commands. Each endpoint is RBAC-gated through
//! [`RoomContext::ensure`] (so the decision is audited and a denial returns
//! `403`) and broadcasts a [`RoomEvent`] over the room's WebSocket so every
//! connected client reacts live.
//!
//! RBAC mapping (cite-the-rule):
//! - kick               → [`Action::ManageMembers`]
//! - mute-all           → [`Action::ManageRoom`]
//! - clear-chat         → [`Action::ManageRoom`]
//! - lock               → [`Action::ManageRoom`]
//! - delete message     → [`Action::ManageRoom`]
//! - delete alert       → [`Action::ManageRoom`]

use crate::auth::session::CurrentUser;
use crate::authorization::RoomContext;
use crate::db;
use crate::error::{AppError, AppResult};
use crate::realtime::event::RoomEvent;
use crate::state::AppState;
use axum::Json;
use axum::Router;
use axum::extract::{Path, State};
use axum::routing::{delete, post};
use domain::{Action, AlertId, MessageId, Role, RoomId, UserId};
use serde::Deserialize;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/rooms/{id}/admin/kick", post(kick))
        .route("/api/rooms/{id}/admin/mute-all", post(mute_all))
        .route("/api/rooms/{id}/admin/clear-chat", post(clear_chat))
        .route("/api/rooms/{id}/admin/lock", post(lock))
        .route(
            "/api/rooms/{id}/messages/{message_id}",
            delete(delete_message),
        )
        .route("/api/rooms/{id}/alerts/{alert_id}", delete(delete_alert))
}

/// An "ok" acknowledgement body shared by the commands that have no richer
/// payload to return. The broadcast WS event carries the live state; the HTTP
/// response just confirms the action landed.
fn ok() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "ok": true }))
}

#[derive(Deserialize)]
struct KickBody {
    user_id: UserId,
    /// Optional reason shown to the kicked user; forwarded verbatim in the event.
    #[serde(default)]
    message: Option<String>,
}

/// Kick a user from the room: drop their membership and presence, then broadcast
/// a `kicked` event so their client leaves. RBAC: [`Action::ManageMembers`].
///
/// Refuses to kick yourself (`400`) or any user whose effective role is admin /
/// super admin (`403`) — moderation acts downward only.
async fn kick(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    Json(body): Json<KickBody>,
) -> AppResult<Json<serde_json::Value>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ManageMembers).await?;

    let target = body.user_id;
    if target == user.user_id {
        return Err(AppError::BadRequest("you cannot kick yourself".into()));
    }

    // Resolve the target's effective role; 404 if the user doesn't exist. An
    // admin or super admin cannot be kicked — moderation only acts downward.
    let role = db::members::effective_role(&state.db, id, target)
        .await?
        .ok_or(AppError::NotFound)?;
    if role.is_admin() {
        return Err(AppError::Forbidden("cannot kick an admin"));
    }

    // Remove membership (no-op if they had none) and presence, then notify.
    db::members::remove_if_present(&state.db, id, target).await?;
    let _ = state.cache.presence_remove(id, target).await;
    let _ = state.cache.presence_remove_ip(id, target).await;

    let message = body.message.and_then(|m| {
        let trimmed = m.trim();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed.to_owned())
        }
    });
    let event = RoomEvent::Kicked {
        user_id: target,
        message,
    };
    let _ = state.hub.publish(id, &event.to_json()).await;
    Ok(ok())
}

#[derive(Deserialize)]
struct MuteAllBody {
    muted: bool,
}

/// Toggle "mute all non-admins". Ephemeral — there is no table; the truth lives
/// in the broadcast. Non-admin clients disable their composer while `muted`.
/// RBAC: [`Action::ManageRoom`].
async fn mute_all(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    Json(body): Json<MuteAllBody>,
) -> AppResult<Json<serde_json::Value>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ManageRoom).await?;

    let event = RoomEvent::MuteAll { muted: body.muted };
    let _ = state.hub.publish(id, &event.to_json()).await;
    Ok(ok())
}

/// Delete every chat message in the room (both channels) and broadcast
/// `chat_cleared`. RBAC: [`Action::ManageRoom`].
async fn clear_chat(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
) -> AppResult<Json<serde_json::Value>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ManageRoom).await?;

    db::messages::clear_room(&state.db, id).await?;
    let event = RoomEvent::ChatCleared {};
    let _ = state.hub.publish(id, &event.to_json()).await;
    Ok(ok())
}

#[derive(Deserialize)]
struct LockBody {
    locked: bool,
}

/// Lock or unlock the room. While locked, the WebSocket join path rejects
/// non-admins (admins/super-admins always pass). Broadcasts `room_locked`.
/// RBAC: [`Action::ManageRoom`].
async fn lock(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    Json(body): Json<LockBody>,
) -> AppResult<Json<serde_json::Value>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ManageRoom).await?;

    db::rooms::set_locked(&state.db, id, body.locked).await?;
    let event = RoomEvent::RoomLocked {
        locked: body.locked,
    };
    let _ = state.hub.publish(id, &event.to_json()).await;
    Ok(ok())
}

/// Delete a single chat message (admin moderation) and broadcast
/// `message_deleted`. RBAC: [`Action::ManageRoom`] — an admin may delete any
/// author's message. A `404` is returned when the message is not in this room.
async fn delete_message(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path((id, message_id)): Path<(RoomId, MessageId)>,
) -> AppResult<Json<serde_json::Value>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ManageRoom).await?;

    if !db::messages::delete_one(&state.db, id, message_id).await? {
        return Err(AppError::NotFound);
    }
    let event = RoomEvent::MessageDeleted { id: message_id };
    let _ = state.hub.publish(id, &event.to_json()).await;
    Ok(ok())
}

/// Delete a single alert (admin moderation) and broadcast `alert_deleted`.
/// RBAC: [`Action::ManageRoom`]. A `404` is returned when the alert is not in
/// this room.
async fn delete_alert(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path((id, alert_id)): Path<(RoomId, AlertId)>,
) -> AppResult<Json<serde_json::Value>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ManageRoom).await?;

    if !db::alerts::delete_one(&state.db, id, alert_id).await? {
        return Err(AppError::NotFound);
    }
    let event = RoomEvent::AlertDeleted { id: alert_id };
    let _ = state.hub.publish(id, &event.to_json()).await;
    Ok(ok())
}

/// Whether `role` may join a locked room. Admins and super admins always may;
/// members may not. Used by the WS join gate.
#[must_use]
pub const fn may_enter_locked(role: Role) -> bool {
    role.is_admin()
}
