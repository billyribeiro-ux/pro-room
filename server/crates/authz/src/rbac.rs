//! Role-based access control: the static mapping from roles to the capabilities
//! they hold, and from actions to the capability they require.
//!
//! This is deliberately a hand-written, exhaustive `match` rather than a
//! data-driven table so that adding an `Action` or `Permission` fails to
//! compile until its mapping is supplied — the compiler enforces completeness.

use domain::{Action, Permission, Role};

/// The single permission an action requires from the RBAC layer.
// `JoinRoom` and `SubscribeScreen` deliberately map to the same capability but
// are kept as distinct arms: they are semantically different actions and may
// diverge later (e.g. a join-only capability).
#[allow(clippy::match_same_arms)]
#[must_use]
pub const fn required_permission(action: Action) -> Permission {
    match action {
        Action::PostAlert => Permission::AlertCreate,
        Action::ReadAlert => Permission::AlertRead,
        Action::PublishScreen => Permission::ScreenPublish,
        Action::SubscribeScreen => Permission::ScreenSubscribe,
        Action::PostMessage => Permission::MessageCreate,
        Action::ReadMessage => Permission::MessageRead,
        Action::SendPrivateMessage => Permission::PrivateMessageSend,
        Action::ReadAllPrivateMessages => Permission::PrivateMessageReadAll,
        Action::JoinRoom => Permission::ScreenSubscribe,
        Action::ManageRoom => Permission::RoomManage,
        Action::ManageMembers => Permission::MemberManage,
        Action::ManageUsers => Permission::UserManage,
    }
}

/// Whether a role holds a permission. Higher roles inherit everything lower
/// roles can do, plus their own additions.
#[must_use]
pub const fn role_has(role: Role, permission: Permission) -> bool {
    match role {
        Role::Member => member_has(permission),
        Role::Admin => admin_has(permission),
        // Super admin holds every capability.
        Role::SuperAdmin => true,
    }
}

const fn member_has(permission: Permission) -> bool {
    // Members may send 1:1 private messages within a room (v1). The ABAC layer
    // still gates this on room access (membership or a public room).
    matches!(
        permission,
        Permission::AlertRead
            | Permission::ScreenSubscribe
            | Permission::MessageCreate
            | Permission::MessageRead
            | Permission::PrivateMessageSend
    )
}

const fn admin_has(permission: Permission) -> bool {
    // Admins add alert posting, screen publishing, room/member management, and
    // reading every private message (moderation) on top of a member's caps.
    member_has(permission)
        || matches!(
            permission,
            Permission::AlertCreate
                | Permission::ScreenPublish
                | Permission::PrivateMessageReadAll
                | Permission::RoomManage
                | Permission::MemberManage
        )
}

/// All permissions a role holds — useful for surfacing a capability set to the
/// frontend so the UI can hide controls the user cannot use.
#[must_use]
pub fn permissions_for(role: Role) -> Vec<Permission> {
    [
        Permission::AlertCreate,
        Permission::AlertRead,
        Permission::ScreenPublish,
        Permission::ScreenSubscribe,
        Permission::MessageCreate,
        Permission::MessageRead,
        Permission::PrivateMessageSend,
        Permission::PrivateMessageReadAll,
        Permission::RoomManage,
        Permission::MemberManage,
        Permission::UserManage,
    ]
    .into_iter()
    .filter(|&p| role_has(role, p))
    .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn members_cannot_post_alerts_or_publish() {
        assert!(!role_has(Role::Member, Permission::AlertCreate));
        assert!(!role_has(Role::Member, Permission::ScreenPublish));
        assert!(!role_has(Role::Member, Permission::UserManage));
    }

    #[test]
    fn admins_post_alerts_and_publish_but_not_manage_users() {
        assert!(role_has(Role::Admin, Permission::AlertCreate));
        assert!(role_has(Role::Admin, Permission::ScreenPublish));
        assert!(!role_has(Role::Admin, Permission::UserManage));
    }

    #[test]
    fn super_admin_holds_everything() {
        assert_eq!(permissions_for(Role::SuperAdmin).len(), 11);
    }

    #[test]
    fn members_send_pms_but_cannot_read_all() {
        // v1: members may send 1:1 PMs; only admins/super admins may read all.
        assert!(role_has(Role::Member, Permission::PrivateMessageSend));
        assert!(!role_has(Role::Member, Permission::PrivateMessageReadAll));
        assert!(role_has(Role::Admin, Permission::PrivateMessageReadAll));
    }
}
