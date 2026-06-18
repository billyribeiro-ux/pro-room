//! The vocabulary of authorization decisions: who (`Subject`) wants to do what
//! (`Action`) to which thing (`Resource`) under what circumstances (`Context`),
//! and the resulting `Decision`. The actual policy logic lives in the `authz`
//! crate; these are the shared nouns and verbs.

use crate::entities::RoomVisibility;
use crate::{Role, RoomId, UserId};

/// The actor requesting an action, resolved from the authenticated session.
///
/// `global_role` is the user's account-wide role; `room_role` is their role
/// within the specific room the action targets (if any). ABAC attributes are
/// free-form key/value pairs attached to a room membership.
#[derive(Debug, Clone)]
pub struct Subject {
    pub user_id: UserId,
    pub global_role: Role,
    pub room_role: Option<Role>,
    pub room_id: Option<RoomId>,
    pub attributes: Vec<(String, String)>,
}

impl Subject {
    /// The effective role for a room: the per-room role if present, otherwise
    /// the global role. A super admin is always effectively a super admin.
    #[must_use]
    pub fn effective_role(&self) -> Role {
        if self.global_role == Role::SuperAdmin {
            return Role::SuperAdmin;
        }
        self.room_role.unwrap_or(self.global_role)
    }

    #[must_use]
    pub fn attribute(&self, key: &str) -> Option<&str> {
        self.attributes
            .iter()
            .find(|(k, _)| k == key)
            .map(|(_, v)| v.as_str())
    }
}

/// What the subject is trying to do.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Action {
    PostAlert,
    ReadAlert,
    PublishScreen,
    SubscribeScreen,
    PostMessage,
    ReadMessage,
    /// Send a 1:1 private message to another user in a room.
    SendPrivateMessage,
    /// Read every private message involving a given peer in a room (admin
    /// moderation: the manage-room tier).
    ReadAllPrivateMessages,
    JoinRoom,
    /// Create a new room. Account-wide (no room exists yet), admin+; distinct from
    /// `ManageRoom`, whose policy requires a concrete room resource.
    CreateRoom,
    ManageRoom,
    ManageMembers,
    ManageUsers,
    /// Edit the account-wide branding (app name + logo). Account-wide (no room
    /// resource); admin+, reusing the `RoomManage` capability like `CreateRoom`.
    ManageBranding,
    /// Manage the account-wide badge registry + assign badges to users.
    /// Account-wide; admin+, reusing `RoomManage` like `ManageBranding`.
    ManageBadges,
}

/// The thing being acted upon, carrying the attributes ABAC policies inspect.
#[derive(Debug, Clone)]
pub enum Resource {
    Room(RoomResource),
    Alert(RoomId),
    Message(RoomId),
    /// A 1:1 private message exchanged within the given room.
    PrivateMessage(RoomId),
    User(UserId),
    /// Account-wide actions not scoped to a single object (e.g. user listing).
    System,
}

/// Attributes of a room that policies evaluate against.
#[derive(Debug, Clone)]
pub struct RoomResource {
    pub room_id: RoomId,
    pub owner_id: UserId,
    pub status: RoomStatus,
    pub visibility: RoomVisibility,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RoomStatus {
    /// The room is live; alerts and screen sharing are permitted.
    Live,
    /// The room exists but is not currently broadcasting.
    Idle,
    /// The room is archived/closed; only reads are permitted.
    Closed,
}

/// Environmental context for a decision (separate from the resource itself).
#[derive(Debug, Clone, Default)]
pub struct Context {
    /// Whether the subject is currently a member of the target room.
    pub is_room_member: bool,
}

/// The outcome of an authorization check. Carries a reason for the audit log.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Decision {
    Allow,
    Deny { reason: &'static str },
}

impl Decision {
    #[must_use]
    pub const fn is_allowed(&self) -> bool {
        matches!(self, Self::Allow)
    }

    #[must_use]
    pub const fn deny(reason: &'static str) -> Self {
        Self::Deny { reason }
    }
}
