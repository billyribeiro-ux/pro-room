//! Persistent entities. These mirror database rows but carry no persistence
//! logic themselves (repositories in the `server` crate own the SQL).

use crate::{
    AlertId, FileId, MessageId, NoteId, PollId, PollOptionId, QuestionId, Role, RoomId, UserId,
};
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

/// Error returned when parsing a string into a domain enum fails.
#[derive(Debug, thiserror::Error)]
#[error("invalid value: {0}")]
pub struct ParseError(pub String);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum UserStatus {
    Active,
    Suspended,
}

impl UserStatus {
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Active => "active",
            Self::Suspended => "suspended",
        }
    }
}

impl std::str::FromStr for UserStatus {
    type Err = ParseError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "active" => Ok(Self::Active),
            "suspended" => Ok(Self::Suspended),
            other => Err(ParseError(other.to_owned())),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct User {
    pub id: UserId,
    pub email: String,
    pub display_name: String,
    pub global_role: Role,
    pub status: UserStatus,
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RoomVisibility {
    /// Any authenticated user may join.
    Public,
    /// Only explicit members may join.
    Private,
}

impl RoomVisibility {
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Public => "public",
            Self::Private => "private",
        }
    }
}

impl std::str::FromStr for RoomVisibility {
    type Err = ParseError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "public" => Ok(Self::Public),
            "private" => Ok(Self::Private),
            other => Err(ParseError(other.to_owned())),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct Room {
    pub id: RoomId,
    pub slug: String,
    pub name: String,
    pub owner_id: UserId,
    pub visibility: RoomVisibility,
    pub is_live: bool,
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,
}

#[derive(Debug, Clone, Serialize)]
pub struct RoomMember {
    pub room_id: RoomId,
    pub user_id: UserId,
    pub role: Role,
    #[serde(with = "time::serde::rfc3339")]
    pub joined_at: OffsetDateTime,
}

/// A trade alert. `side` is intentionally free-form (e.g. "buy", "sell",
/// "watch") so the room owner is not boxed into a fixed taxonomy.
#[derive(Debug, Clone, Serialize)]
pub struct Alert {
    pub id: AlertId,
    pub room_id: RoomId,
    pub author_id: UserId,
    pub symbol: String,
    pub side: String,
    pub note: Option<String>,
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,
}

#[derive(Debug, Clone, Serialize)]
pub struct Message {
    pub id: MessageId,
    pub room_id: RoomId,
    pub author_id: UserId,
    pub body: String,
    /// The chat channel this message belongs to: `"main"` or `"off_topic"`.
    pub channel: String,
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,
}

/// The kind of an uploaded file, derived from its content type. Drives how the
/// frontend groups files into Files / Images / Sounds drawers.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FileCategory {
    File,
    Image,
    Sound,
}

impl FileCategory {
    /// Derive the category from a MIME type: `image/*` → image, `audio/*` →
    /// sound, anything else → file.
    #[must_use]
    pub fn from_content_type(content_type: &str) -> Self {
        if content_type.starts_with("image/") {
            Self::Image
        } else if content_type.starts_with("audio/") {
            Self::Sound
        } else {
            Self::File
        }
    }

    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::File => "file",
            Self::Image => "image",
            Self::Sound => "sound",
        }
    }
}

impl std::str::FromStr for FileCategory {
    type Err = ParseError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "file" => Ok(Self::File),
            "image" => Ok(Self::Image),
            "sound" => Ok(Self::Sound),
            other => Err(ParseError(other.to_owned())),
        }
    }
}

/// A file uploaded to a room's drive. Bytes live on local disk under the
/// configured uploads directory; this is the metadata view, with a computed
/// `download_url` for clients.
#[derive(Debug, Clone, Serialize)]
pub struct File {
    pub id: FileId,
    pub room_id: RoomId,
    pub filename: String,
    pub content_type: String,
    pub size_bytes: i64,
    pub category: FileCategory,
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,
    pub download_url: String,
}

impl File {
    #[must_use]
    pub fn download_url(room_id: RoomId, file_id: FileId) -> String {
        format!("/api/rooms/{room_id}/files/{file_id}/download")
    }
}

/// A question asked against a trade alert (the Alert Q&A thread). Members post
/// `body`; an admin later sets `answer`/`answered_by`/`answered_at` and flips
/// `resolved`. Scoped to both the alert and its room.
#[derive(Debug, Clone, Serialize)]
pub struct Question {
    pub id: QuestionId,
    pub alert_id: AlertId,
    pub room_id: RoomId,
    pub author_id: UserId,
    pub body: String,
    pub answer: Option<String>,
    pub answered_by: Option<UserId>,
    pub resolved: bool,
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339::option")]
    pub answered_at: Option<OffsetDateTime>,
}

/// A live poll posted to a room. Members vote (one vote each, changeable while
/// the poll is `open`); the author (an admin) closes it. `anonymous` only
/// affects how the frontend presents voters — vote counts are always returned.
/// `status` is `"open"` or `"closed"`.
#[derive(Debug, Clone, Serialize)]
pub struct Poll {
    pub id: PollId,
    pub room_id: RoomId,
    pub author_id: UserId,
    pub question: String,
    pub anonymous: bool,
    pub status: String,
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,
}

/// A single selectable option on a poll. `position` orders options within a
/// poll (lower = earlier).
#[derive(Debug, Clone, Serialize)]
pub struct PollOption {
    pub id: PollOptionId,
    pub poll_id: PollId,
    pub label: String,
    pub position: i32,
}

/// An option together with its current vote tally. `votes` is `i64` to match
/// Postgres `count(*)` (`bigint`) and to never overflow on a popular poll.
#[derive(Debug, Clone, Serialize)]
pub struct PollOptionResult {
    pub id: PollOptionId,
    pub label: String,
    pub position: i32,
    pub votes: i64,
}

/// A poll aggregated with its options and per-option vote tallies. This is the
/// read model returned by every poll endpoint and broadcast over WebSocket.
#[derive(Debug, Clone, Serialize)]
pub struct PollDetail {
    pub id: PollId,
    pub room_id: RoomId,
    pub author_id: UserId,
    pub question: String,
    pub anonymous: bool,
    pub status: String,
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,
    pub options: Vec<PollOptionResult>,
    pub total_votes: i64,
}

/// A named, titled rich-text document scoped to a room. The `body` is plain
/// text/markdown; the frontend renders it. `position` orders notes within a
/// room (lower = earlier).
#[derive(Debug, Clone, Serialize)]
pub struct Note {
    pub id: NoteId,
    pub room_id: RoomId,
    pub title: String,
    pub body: String,
    pub position: i32,
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub updated_at: OffsetDateTime,
}
