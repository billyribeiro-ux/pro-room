//! Events broadcast to a room's connected clients over WebSocket. These are
//! serialized to JSON both for Redis fan-out and for delivery to browsers.

use domain::UserId;
use domain::entities::{Alert, Message, PollDetail};
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum RoomEvent {
    /// A new trade alert was posted.
    Alert { alert: Alert, author_name: String },
    /// A new chat message was posted.
    Chat {
        message: Message,
        author_name: String,
    },
    /// The set of present users changed.
    Presence { users: Vec<PresentUser> },
    /// The room's live/broadcasting state changed.
    Live { is_live: bool },
    /// A poll was created, voted on, or closed; carries the up-to-date detail.
    Poll { poll: PollDetail },
}

#[derive(Debug, Clone, Serialize)]
pub struct PresentUser {
    pub user_id: UserId,
    pub display_name: String,
}

impl RoomEvent {
    /// Serialize to the JSON wire form. Infallible in practice (the shapes are
    /// plain data); falls back to an empty object on the impossible error.
    #[must_use]
    pub fn to_json(&self) -> String {
        serde_json::to_string(self).unwrap_or_else(|_| "{}".to_owned())
    }
}
