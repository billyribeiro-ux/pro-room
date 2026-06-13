//! Persistent entities. These mirror database rows but carry no persistence
//! logic themselves (repositories in the `server` crate own the SQL).

use crate::{AlertId, MessageId, Role, RoomId, UserId};
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
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,
}
