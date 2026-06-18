//! Events broadcast to a room's connected clients over WebSocket. These are
//! serialized to JSON both for Redis fan-out and for delivery to browsers.

use crate::db::badges::AuthorBadges;
use crate::db::private_messages::PrivateMessageView;
use domain::entities::{Alert, Message, PollDetail, ReactionSummary};
use domain::{AlertId, MessageId, Role, UserId};
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum RoomEvent {
    /// A new trade alert was posted. `author_badges` carries the poster's badges +
    /// trial/new/tenure indicators so the live row renders them inline.
    Alert {
        alert: Alert,
        author_name: String,
        author_badges: AuthorBadges,
    },
    /// A new chat message was posted. `author_role` is the poster's effective
    /// room role so clients can style admin/super-admin messages distinctly
    /// without a follow-up lookup. `author_badges` carries the badge data for the
    /// live row.
    Chat {
        message: Message,
        author_name: String,
        author_role: Role,
        author_badges: AuthorBadges,
    },
    /// A live closed-caption phrase from the presenter. Ephemeral (not persisted):
    /// members joining later won't see past captions. Clients render it in the
    /// stage caption bar when their captions overlay is on.
    Caption { speaker_name: String, text: String },
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
    /// An admin kicked a user from the room. The named user has been removed from
    /// membership and presence server-side; on receiving this every client checks
    /// whether `user_id` is itself and, if so, leaves the room (showing the
    /// optional `message`). Other clients use it to drop that user from rosters.
    Kicked {
        user_id: UserId,
        #[serde(skip_serializing_if = "Option::is_none")]
        message: Option<String>,
    },
    /// An admin toggled "mute all non-admins". Ephemeral (no DB state): non-admin
    /// clients disable their chat composer while `muted` is `true`. Admins ignore
    /// it. Members joining later won't see it until the next toggle.
    MuteAll { muted: bool },
    /// An admin cleared the room's chat. Every client empties its local chat
    /// history for both channels.
    ChatCleared {},
    /// An admin locked or unlocked the room. While `locked` is `true`, the join
    /// path rejects non-admins; existing non-admin connections are left in place.
    /// Clients surface a locked indicator.
    RoomLocked { locked: bool },
    /// An admin locked or unlocked the live screen. Ephemeral (no DB state): while
    /// `locked` is `true`, clients hide/freeze the presenter's screen surface for
    /// non-admins. Members joining later won't see it until the next toggle.
    ScreenLocked { locked: bool },
    /// An admin deleted a single chat message. Clients remove the message with
    /// this `id` from their local history.
    MessageDeleted { id: MessageId },
    /// An admin deleted a single alert. Clients remove the alert with this `id`
    /// from their local feed.
    AlertDeleted { id: AlertId },
    /// A 1:1 private message was sent. PRIVACY-CRITICAL: this variant is **never**
    /// delivered via [`crate::realtime::RealtimeHub::publish`] (the room-wide
    /// channel that fans out to every client). It is delivered **only** via the
    /// per-user targeted path
    /// ([`crate::realtime::RealtimeHub::publish_to_user`]) to the sender and the
    /// recipient. Sending it on the room channel would leak the message to the
    /// whole room — do not do that.
    PrivateMessage { message: PrivateMessageView },
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
    /// A direct MP3 file URL (any host). Serializes to `"mp3"`.
    Mp3,
    /// A direct video file URL (any host). Serializes to `"video"`.
    Video,
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
