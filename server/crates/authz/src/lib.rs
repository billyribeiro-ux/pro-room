//! The authorization engine: a pure function combining a coarse RBAC capability
//! gate with fine-grained ABAC policies.
//!
//! Design goals:
//! - **Pure and total.** `authorize` has no I/O; every caller resolves the
//!   `Subject`, `Resource`, and `Context` up front. This makes the entire
//!   policy surface exhaustively unit-testable (see the test matrix below).
//! - **Deny by default.** Every path that is not explicitly allowed denies with
//!   a stable reason string suitable for the audit log.
//! - **Two layers.** RBAC answers "could a holder of this role *ever* do this?"
//!   ABAC answers "given this specific room/ownership/state, may they do it
//!   *now*?". Both must pass.

pub mod policy;
pub mod rbac;

use domain::{Action, Context, Decision, Resource, Subject};

/// Authorize `subject` to perform `action` on `resource` within `ctx`.
///
/// Returns [`Decision::Allow`] only when both the RBAC capability check and the
/// ABAC policy for the action succeed; otherwise [`Decision::Deny`] with a
/// reason.
#[must_use]
pub fn authorize(
    subject: &Subject,
    action: Action,
    resource: &Resource,
    ctx: &Context,
) -> Decision {
    // Layer 1 (RBAC): does the subject's effective role carry the capability
    // this action requires at all?
    let required = rbac::required_permission(action);
    if !rbac::role_has(subject.effective_role(), required) {
        return Decision::deny("rbac: role lacks required permission");
    }

    // Layer 2 (ABAC): are the resource- and context-specific constraints met?
    policy::evaluate(subject, action, resource, ctx)
}

#[cfg(test)]
mod tests {
    use super::*;
    use domain::authz::{RoomResource, RoomStatus};
    use domain::{Role, RoomId, UserId};

    fn room(owner: UserId, status: RoomStatus) -> RoomResource {
        RoomResource {
            room_id: RoomId::from_uuid(uuid_const(1)),
            owner_id: owner,
            status,
        }
    }

    // Deterministic UUIDs for tests without pulling in the `uuid` crate's RNG.
    fn uuid_const(n: u8) -> uuid::Uuid {
        let mut bytes = [0u8; 16];
        bytes[15] = n;
        uuid::Uuid::from_bytes(bytes)
    }

    fn subject(global: Role, room_role: Option<Role>, member: bool) -> (Subject, Context) {
        let s = Subject {
            user_id: UserId::from_uuid(uuid_const(9)),
            global_role: global,
            room_role,
            room_id: Some(RoomId::from_uuid(uuid_const(1))),
            attributes: vec![],
        };
        let ctx = Context {
            is_room_member: member,
        };
        (s, ctx)
    }

    #[test]
    fn only_admins_post_alerts_and_only_when_live() {
        let owner = UserId::from_uuid(uuid_const(2));
        let live = Resource::Room(room(owner, RoomStatus::Live));

        // Member: denied by RBAC.
        let (m, ctx) = subject(Role::Member, Some(Role::Member), true);
        assert!(!authorize(&m, Action::PostAlert, &live, &ctx).is_allowed());

        // Admin in a live room they belong to: allowed.
        let (a, ctx) = subject(Role::Member, Some(Role::Admin), true);
        assert!(authorize(&a, Action::PostAlert, &live, &ctx).is_allowed());

        // Admin but room is idle: denied by ABAC.
        let idle = Resource::Room(room(owner, RoomStatus::Idle));
        assert!(!authorize(&a, Action::PostAlert, &idle, &ctx).is_allowed());

        // Super admin always allowed in a live room.
        let (sa, ctx) = subject(Role::SuperAdmin, None, true);
        assert!(authorize(&sa, Action::PostAlert, &live, &ctx).is_allowed());
    }

    #[test]
    fn publishing_screen_requires_admin_membership_and_live_room() {
        let owner = UserId::from_uuid(uuid_const(2));
        let live = Resource::Room(room(owner, RoomStatus::Live));

        // Admin who is not a member of the room: denied.
        let (a, ctx) = subject(Role::Member, Some(Role::Admin), false);
        assert!(!authorize(&a, Action::PublishScreen, &live, &ctx).is_allowed());

        // Admin member of a live room: allowed (multiple admins can each share).
        let (a, ctx) = subject(Role::Member, Some(Role::Admin), true);
        assert!(authorize(&a, Action::PublishScreen, &live, &ctx).is_allowed());

        // Member: denied by RBAC regardless of membership.
        let (m, ctx) = subject(Role::Member, Some(Role::Member), true);
        assert!(!authorize(&m, Action::PublishScreen, &live, &ctx).is_allowed());
    }

    #[test]
    fn members_can_subscribe_and_chat_in_rooms_they_belong_to() {
        let owner = UserId::from_uuid(uuid_const(2));
        let live = Resource::Room(room(owner, RoomStatus::Live));
        let (m, ctx) = subject(Role::Member, Some(Role::Member), true);

        assert!(authorize(&m, Action::SubscribeScreen, &live, &ctx).is_allowed());
        assert!(
            authorize(
                &m,
                Action::ReadAlert,
                &Resource::Alert(live_room_id()),
                &ctx
            )
            .is_allowed()
        );
        assert!(
            authorize(
                &m,
                Action::PostMessage,
                &Resource::Message(live_room_id()),
                &ctx
            )
            .is_allowed()
        );

        // Non-member cannot subscribe.
        let (m, ctx) = subject(Role::Member, None, false);
        assert!(!authorize(&m, Action::SubscribeScreen, &live, &ctx).is_allowed());
    }

    #[test]
    fn user_management_is_super_admin_only() {
        let sys = Resource::System;
        for (role, allowed) in [
            (Role::Member, false),
            (Role::Admin, false),
            (Role::SuperAdmin, true),
        ] {
            let (s, ctx) = subject(role, None, false);
            assert_eq!(
                authorize(&s, Action::ManageUsers, &sys, &ctx).is_allowed(),
                allowed,
                "role {role:?} managing users"
            );
        }
    }

    #[test]
    fn room_management_limited_to_owner_admin_or_super_admin() {
        let owner = UserId::from_uuid(uuid_const(2));
        let stranger = UserId::from_uuid(uuid_const(3));
        let res = Resource::Room(room(owner, RoomStatus::Idle));

        // Admin who owns the room: allowed.
        let mut s = Subject {
            user_id: owner,
            global_role: Role::Admin,
            room_role: Some(Role::Admin),
            room_id: Some(RoomId::from_uuid(uuid_const(1))),
            attributes: vec![],
        };
        let ctx = Context {
            is_room_member: true,
        };
        assert!(authorize(&s, Action::ManageRoom, &res, &ctx).is_allowed());

        // Admin who does not own the room: denied.
        s.user_id = stranger;
        assert!(!authorize(&s, Action::ManageRoom, &res, &ctx).is_allowed());

        // Super admin: allowed even though not the owner.
        s.global_role = Role::SuperAdmin;
        assert!(authorize(&s, Action::ManageRoom, &res, &ctx).is_allowed());
    }

    fn live_room_id() -> RoomId {
        RoomId::from_uuid(uuid_const(1))
    }
}
