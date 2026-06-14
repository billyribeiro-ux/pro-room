//! Events broadcast to a room's connected clients over WebSocket. These are
//! serialized to JSON both for Redis fan-out and for delivery to browsers.

use domain::UserId;
use domain::entities::{Alert, Message, PollDetail, ReactionSummary};
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
    /// Reactions on a message or alert changed; carries the target and the full
    /// up-to-date tally list so clients can replace that target's reactions in
    /// place. The `mine` flag in each tally is computed for the actor who toggled
    /// and is not authoritative for other recipients — clients key off
    /// `target_kind`/`target_id` and use their own local `mine` state.
    Reaction { reaction: ReactionSummary },
    /// The presenter broadcast (or stopped) a media-for-all stream to the room.
    /// Ephemeral: not persisted, so members joining later won't see it until the
    /// next broadcast.
    Media(MediaBroadcast),
}

/// The payload of a [`RoomEvent::Media`] event: the kind of media and, unless
/// stopping, the URL to play. Serialized flat into the event object alongside
/// `"type": "media"`.
#[derive(Debug, Clone, Serialize)]
pub struct MediaBroadcast {
    pub kind: MediaKind,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
}

/// Which media-for-all action the presenter took.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum MediaKind {
    Soundcloud,
    Youtube,
    Stop,
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
