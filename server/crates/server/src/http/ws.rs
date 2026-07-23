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
    // The poster's display name — carried into the socket task so a `typing` frame
    // can fan out `RoomEvent::Typing { user_id, display_name }` (P1-2 ·
    // IMPLEMENTATION-PLAN.md) without a per-keystroke DB lookup.
    let display_name = user.display_name.clone();
    // The socket is receive-mostly (clients send only tiny heartbeats), so cap
    // inbound message/frame size hard — this bounds the work an abusive client can
    // force per frame (each inbound message drives a Redis presence write) and
    // replaces axum's permissive 64 MiB / 16 MiB defaults. Outbound payloads are
    // unaffected (a large server message is simply fragmented on the wire).
    Ok(ws
        .max_message_size(64 * 1024)
        .max_frame_size(64 * 1024)
        .on_upgrade(move |socket| room_socket(state, socket, id, user_id, display_name, ip)))
}

async fn room_socket(
    state: AppState,
    socket: WebSocket,
    room: RoomId,
    user: UserId,
    display_name: String,
    ip: Option<String>,
) {
    let (mut sink, mut stream) = socket.split();
    let mut rx = state.hub.subscribe(room);
    // Private-message channel for THIS connection's (room, user): only payloads
    // targeted at this user via `publish_to_user` arrive here. The room-wide `rx`
    // above never carries a `PrivateMessage` frame, so the privacy boundary is the
    // separation of these two receivers.
    let mut pm_rx = state.hub.subscribe_user(room, user);

    // Register this connection so kick-duplicates can target it and so presence
    // is ref-counted (closing one of a user's tabs must not drop their presence).
    let conn = state.hub.register(room, user);
    let conn_id = conn.id;
    let close = conn.close;
    let closed = close.notified();
    tokio::pin!(closed);

    // Announce presence on join, and record the client IP for the admin view.
    let _ = state.cache.presence_touch(room, user).await;
    if let Some(ip) = ip.as_deref() {
        let _ = state.cache.presence_set_ip(room, user, ip).await;
    }
    publish_presence(&state, room).await;

    loop {
        tokio::select! {
            // Kicked as a duplicate session: shut this socket down.
            () = &mut closed => break,
            // Room-wide fan-out from Redis → this client.
            event = rx.recv() => match event {
                Ok(payload) => {
                    if sink.send(Message::Text(payload.into())).await.is_err() {
                        break;
                    }
                }
                Err(tokio::sync::broadcast::error::RecvError::Lagged(_)) => {}
                Err(tokio::sync::broadcast::error::RecvError::Closed) => break,
            },
            // Per-user (private-message) fan-out → only this user's sockets. A
            // `PrivateMessage` reaches the sender and recipient exclusively through
            // this arm; no other room member's socket subscribes to this channel.
            event = pm_rx.recv() => match event {
                Ok(payload) => {
                    if sink.send(Message::Text(payload.into())).await.is_err() {
                        break;
                    }
                }
                Err(tokio::sync::broadcast::error::RecvError::Lagged(_)) => {}
                Err(tokio::sync::broadcast::error::RecvError::Closed) => break,
            },
            // Inbound from this client: heartbeats refresh presence; a `typing`
            // frame additionally fans out a `RoomEvent::Typing` (P1-2); close ends.
            inbound = stream.next() => match inbound {
                Some(Ok(Message::Text(text))) => {
                    // Every inbound text frame is also a heartbeat.
                    let _ = state.cache.presence_touch(room, user).await;
                    // The typing signal is the exact frame `{"type":"typing"}` (the
                    // client throttles to >=2s; we keep it minimal and don't parse
                    // arbitrary JSON per keystroke). Any other text keeps the
                    // heartbeat-only behavior. Server-side rate-limit to >=1/sec per
                    // user so a misbehaving client can't spam the room broadcast;
                    // over the limit we silently drop the fan-out (the frame still
                    // counted as a heartbeat above).
                    if is_typing_frame(&text)
                        && state
                            .cache
                            .rate_limit(&format!("typing:{room}:{user}"), 1, 1)
                            .await
                            .unwrap_or(true)
                    {
                        let event = RoomEvent::Typing {
                            user_id: user,
                            display_name: display_name.clone(),
                        };
                        let _ = state.hub.publish(room, &event.to_json()).await;
                    }
                }
                Some(Ok(Message::Ping(_))) => {
                    let _ = state.cache.presence_touch(room, user).await;
                }
                Some(Ok(Message::Close(_)) | Err(_)) | None => break,
                Some(Ok(_)) => {}
            },
        }
    }

    // Departure: deregister this connection. Only clear presence when it was the
    // user's last local socket — a user with another open tab stays present.
    if state.hub.unregister(room, conn_id) {
        let _ = state.cache.presence_remove(room, user).await;
        let _ = state.cache.presence_remove_ip(room, user).await;
        publish_presence(&state, room).await;
    }
}

/// Whether an inbound text frame is the typing signal `{"type":"typing"}` (P1-2 ·
/// IMPLEMENTATION-PLAN.md). Parsed as JSON (tolerating whitespace/extra keys) so a
/// value-typed match is robust; a non-JSON or non-typing frame returns `false` and
/// the caller treats it as a plain heartbeat. Cheap: frames are size-capped at 64
/// KiB by the upgrade and this only runs on inbound text.
fn is_typing_frame(text: &str) -> bool {
    serde_json::from_str::<serde_json::Value>(text)
        .ok()
        .and_then(|v| {
            v.get("type")
                .and_then(serde_json::Value::as_str)
                .map(str::to_owned)
        })
        .as_deref()
        == Some("typing")
}

/// Compute the room's present users — enriched with the reference roster fields
/// (Gravatar avatar, presenter flag, badge cluster) — and broadcast them.
async fn publish_presence(state: &AppState, room: RoomId) {
    let ids = match state.cache.presence_list(room).await {
        Ok(ids) => ids,
        Err(err) => {
            tracing::warn!(error = ?err, "presence list failed");
            return;
        }
    };
    let uuids: Vec<uuid::Uuid> = ids.iter().map(domain::UserId::as_uuid).collect();
    // Effective role + email (for Gravatar) per present user.
    let roster = crate::db::members::present_roster(&state.db, room, &uuids)
        .await
        .unwrap_or_default();
    // Badge cluster per present user — the SAME resolution used for message/alert
    // authors, so the roster shows the identical badge icons.
    let user_ids: Vec<domain::UserId> = roster.iter().map(|r| r.user_id).collect();
    let mut badges = crate::db::badges::for_authors(&state.db, &user_ids)
        .await
        .unwrap_or_default();
    let users = roster
        .into_iter()
        .map(|r| {
            let author_badges = badges.remove(&r.user_id).unwrap_or_default();
            PresentUser {
                avatar_url: crate::util::gravatar_url(&r.email),
                is_presenter: r.role != domain::Role::Member,
                author_badges,
                user_id: r.user_id,
                display_name: r.display_name,
            }
        })
        .collect();
    let _ = state
        .hub
        .publish(room, &RoomEvent::Presence { users }.to_json())
        .await;
}
