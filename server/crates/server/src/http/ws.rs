//! Per-room WebSocket: delivers live alerts, chat, presence, and live-state
//! changes to connected clients. Authorization happens before the upgrade; the
//! socket itself is receive-mostly (clients send only heartbeats).

use crate::auth::session::CurrentUser;
use crate::authorization::RoomContext;
use crate::error::{AppError, AppResult};
use crate::http::admin;
use crate::realtime::event::{PresentUser, RoomEvent};
use crate::state::AppState;
use crate::util;
use axum::Router;
use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::extract::{ConnectInfo, Path, State};
use axum::http::HeaderMap;
use axum::response::Response;
use axum::routing::get;
use domain::{Action, Role, RoomId, UserId};
use futures_util::{SinkExt, StreamExt};
use std::net::SocketAddr;

pub fn router() -> Router<AppState> {
    Router::new().route("/api/rooms/{id}/ws", get(upgrade))
}

async fn upgrade(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    ws: WebSocketUpgrade,
) -> AppResult<Response> {
    // Enforce room access before upgrading; a denial returns a normal HTTP error.
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::SubscribeScreen).await?;

    // Locked-room join gate: while a room is locked, only admins / super admins
    // may (re)join. Non-admins are rejected here, before the socket upgrades, so
    // an admin's lock command actually keeps members out. The caller's effective
    // role mirrors `Subject::effective_role`: super admin always wins, else the
    // per-room membership role, else the global role.
    if ctx.room.locked {
        let role = if user.global_role == Role::SuperAdmin {
            Role::SuperAdmin
        } else {
            ctx.membership.as_ref().map_or(user.global_role, |m| m.role)
        };
        if !admin::may_enter_locked(role) {
            return Err(AppError::Forbidden("room is locked"));
        }
    }

    // Capture the client IP from the upgrade request (proxy-forwarded header
    // preferred, direct peer as fallback). It is stored on the presence entry
    // for the admin view only — never broadcast to room members.
    let ip = util::client_ip(&headers, Some(peer));
    let user_id = user.user_id;
    Ok(ws.on_upgrade(move |socket| room_socket(state, socket, id, user_id, ip)))
}

async fn room_socket(
    state: AppState,
    socket: WebSocket,
    room: RoomId,
    user: UserId,
    ip: Option<String>,
) {
    let (mut sink, mut stream) = socket.split();
    let mut rx = state.hub.subscribe(room);

    // Announce presence on join, and record the client IP for the admin view.
    let _ = state.cache.presence_touch(room, user).await;
    if let Some(ip) = ip.as_deref() {
        let _ = state.cache.presence_set_ip(room, user, ip).await;
    }
    publish_presence(&state, room).await;

    loop {
        tokio::select! {
            // Fan-out from Redis → this client.
            event = rx.recv() => match event {
                Ok(payload) => {
                    if sink.send(Message::Text(payload.into())).await.is_err() {
                        break;
                    }
                }
                Err(tokio::sync::broadcast::error::RecvError::Lagged(_)) => {}
                Err(tokio::sync::broadcast::error::RecvError::Closed) => break,
            },
            // Inbound from this client: heartbeats refresh presence; close ends.
            inbound = stream.next() => match inbound {
                Some(Ok(Message::Text(_) | Message::Ping(_))) => {
                    let _ = state.cache.presence_touch(room, user).await;
                }
                Some(Ok(Message::Close(_)) | Err(_)) | None => break,
                Some(Ok(_)) => {}
            },
        }
    }

    // Departure: drop presence (and the recorded IP) and notify the room.
    let _ = state.cache.presence_remove(room, user).await;
    let _ = state.cache.presence_remove_ip(room, user).await;
    publish_presence(&state, room).await;
}

/// Compute the room's present users (with display names) and broadcast them.
async fn publish_presence(state: &AppState, room: RoomId) {
    let ids = match state.cache.presence_list(room).await {
        Ok(ids) => ids,
        Err(err) => {
            tracing::warn!(error = ?err, "presence list failed");
            return;
        }
    };
    let uuids: Vec<uuid::Uuid> = ids.iter().map(domain::UserId::as_uuid).collect();
    let names = crate::db::users::display_names(&state.db, &uuids)
        .await
        .unwrap_or_default();
    let users = names
        .into_iter()
        .map(|(user_id, display_name)| PresentUser {
            user_id,
            display_name,
        })
        .collect();
    let _ = state
        .hub
        .publish(room, &RoomEvent::Presence { users }.to_json())
        .await;
}
