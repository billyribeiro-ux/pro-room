//! Admin moderation commands. Each endpoint is RBAC-gated through
//! [`RoomContext::ensure`] (so the decision is audited and a denial returns
//! `403`) and broadcasts a [`RoomEvent`] over the room's WebSocket so every
//! connected client reacts live.
//!
//! RBAC mapping (cite-the-rule):
//! - kick               → [`Action::ManageMembers`]
//! - kick-duplicates    → [`Action::ManageMembers`]
//! - mute-all           → [`Action::ManageRoom`]
//! - clear-chat         → [`Action::ManageRoom`]
//! - lock               → [`Action::ManageRoom`]
//! - lock-screen        → [`Action::ManageRoom`]
//! - delete message     → [`Action::ManageRoom`]
//! - delete alert       → [`Action::ManageRoom`]
//! - read all PMs       → [`Action::ReadAllPrivateMessages`]

use crate::auth::session::CurrentUser;
use crate::authorization::RoomContext;
use crate::db;
use crate::db::private_messages::PrivateMessageView;
use crate::error::{AppError, AppResult};
use crate::realtime::event::RoomEvent;
use crate::state::AppState;
use axum::Json;
use axum::Router;
use axum::extract::{Path, State};
use axum::routing::{delete, get, post};
use domain::{Action, AlertId, MessageId, Role, RoomId, UserId};
use serde::Deserialize;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/rooms/{id}/admin/kick", post(kick))
        .route(
            "/api/rooms/{id}/admin/kick-duplicates",
            post(kick_duplicates),
        )
        .route("/api/rooms/{id}/admin/mute-all", post(mute_all))
        .route("/api/rooms/{id}/admin/clear-chat", post(clear_chat))
        .route("/api/rooms/{id}/admin/lock", post(lock))
        .route("/api/rooms/{id}/admin/lock-screen", post(lock_screen))
        .route(
            "/api/rooms/{id}/messages/{message_id}",
            delete(delete_message),
        )
        .route("/api/rooms/{id}/alerts/{alert_id}", delete(delete_alert))
        .route("/api/rooms/{id}/admin/pm/{peer_id}", get(all_user_pm))
}

/// Newest-first cap on the admin "all PMs for a peer" read.
const MAX_ADMIN_PM: i64 = 200;

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
    // Defense in depth: force-close the kicked user's live sockets server-side so
    // they are dropped even if their client ignores the `kicked` event below.
    let _ = state.hub.close_user(id, target);

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

/// Kick all duplicate WebSocket sessions: for each connected user, keep their
/// newest connection and signal the older ones to close. RBAC:
/// [`Action::ManageMembers`].
///
/// Backed by the hub's per-connection registry:
/// [`crate::realtime::RealtimeHub::kick_duplicates`] fires each duplicate socket's
/// close signal, and `room_socket` selects on it to
/// shut down (then refreshes presence via its normal cleanup). Scope note: the
/// registry is per-instance, so duplicates living on a *different* server instance
/// are not closed — acceptable, since duplicate tabs are a single-client concern
/// and a true multi-instance dedup would mean broadcasting a control event for
/// every instance to run this locally.
async fn kick_duplicates(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
) -> AppResult<Json<serde_json::Value>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ManageMembers).await?;

    let kicked = state.hub.kick_duplicates(id);
    tracing::info!(room_id = %id, actor_id = %user.user_id, kicked, "kicked duplicate sessions");
    Ok(Json(serde_json::json!({ "ok": true, "kicked": kicked })))
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

#[derive(Deserialize)]
struct LockScreenBody {
    locked: bool,
}

/// Lock or unlock the live screen for non-admins. Ephemeral — like `mute-all`,
/// there is no table; the truth lives in the broadcast. Clients hide/freeze the
/// presenter's screen surface for non-admins while `locked` is `true`. Broadcasts
/// `screen_locked`. RBAC: [`Action::ManageRoom`].
async fn lock_screen(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    Json(body): Json<LockScreenBody>,
) -> AppResult<Json<serde_json::Value>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ManageRoom).await?;

    let event = RoomEvent::ScreenLocked {
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

/// Read every private message in the room involving `peer_id` (sent or received),
/// newest-first — the admin moderation view of a user's PMs. RBAC:
/// [`Action::ReadAllPrivateMessages`] (admins / super admins only; the ABAC layer
/// additionally requires a non-super admin to be a member of the room). Ordinary
/// members can never reach this — `SendPrivateMessage` only lets them read their
/// own pair via `http::private_messages::thread`.
async fn all_user_pm(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path((id, peer_id)): Path<(RoomId, UserId)>,
) -> AppResult<Json<Vec<PrivateMessageView>>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ReadAllPrivateMessages).await?;
    Ok(Json(
        db::private_messages::all_for_peer(&state.db, id, peer_id, MAX_ADMIN_PM).await?,
    ))
}

/// Whether `role` may join a locked room. Admins and super admins always may;
/// members may not. Used by the WS join gate.
#[must_use]
pub const fn may_enter_locked(role: Role) -> bool {
    role.is_admin()
}
