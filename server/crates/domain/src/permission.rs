//! Capabilities granted by roles (the RBAC half of authorization). Permissions
//! are coarse "can this role ever do X" flags; finer constraints (room state,
//! ownership) are layered on top by the ABAC policies in the `authz` crate.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Permission {
    /// Post trade alerts into a room.
    AlertCreate,
    /// Read trade alerts in a room.
    AlertRead,
    /// Publish a screen-share / audio track into a room.
    ScreenPublish,
    /// Subscribe to (view/listen to) tracks in a room.
    ScreenSubscribe,
    /// Post chat messages.
    MessageCreate,
    /// Read chat messages.
    MessageRead,
    /// Create / update / delete rooms and manage their settings.
    RoomManage,
    /// Add / remove members and set their per-room roles.
    MemberManage,
    /// Manage users globally (create, deactivate, assign global roles).
    UserManage,
}

impl Permission {
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::AlertCreate => "alert.create",
            Self::AlertRead => "alert.read",
            Self::ScreenPublish => "screen.publish",
            Self::ScreenSubscribe => "screen.subscribe",
            Self::MessageCreate => "message.create",
            Self::MessageRead => "message.read",
            Self::RoomManage => "room.manage",
            Self::MemberManage => "member.manage",
            Self::UserManage => "user.manage",
        }
    }
}

impl std::fmt::Display for Permission {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.as_str())
    }
}
