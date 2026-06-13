//! Per-room WebSocket: delivers live alerts, chat, presence, and live-state
//! changes to connected clients. Authorization happens before the upgrade; the
//! socket itself is receive-mostly (clients send only heartbeats).

use crate::auth::session::CurrentUser;
use crate::authorization::RoomContext;
use crate::error::AppResult;
use crate::realtime::event::{PresentUser, RoomEvent};
use crate::state::AppState;
use axum::Router;
use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::extract::{Path, State};
use axum::response::Response;
use axum::routing::get;
use domain::{Action, RoomId, UserId};
use futures_util::{SinkExt, StreamExt};

pub fn router() -> Router<AppState> {
    Router::new().route("/api/rooms/{id}/ws", get(upgrade))
}

async fn upgrade(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    ws: WebSocketUpgrade,
) -> AppResult<Response> {
    // Enforce room access before upgrading; a denial returns a normal HTTP error.
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::SubscribeScreen).await?;

    let user_id = user.user_id;
    Ok(ws.on_upgrade(move |socket| room_socket(state, socket, id, user_id)))
}

async fn room_socket(state: AppState, socket: WebSocket, room: RoomId, user: UserId) {
    let (mut sink, mut stream) = socket.split();
    let mut rx = state.hub.subscribe(room);

    // Announce presence on join.
    let _ = state.cache.presence_touch(room, user).await;
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

    // Departure: drop presence and notify the room.
    let _ = state.cache.presence_remove(room, user).await;
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
