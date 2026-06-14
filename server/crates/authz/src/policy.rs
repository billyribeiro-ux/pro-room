//! Attribute-based policies: the fine-grained constraints applied *after* the
//! RBAC gate has confirmed the role could, in principle, perform the action.
//!
//! Each policy inspects concrete attributes — room status, ownership, the
//! subject's membership — to decide whether the action is permitted right now.

use domain::authz::{RoomResource, RoomStatus};
use domain::entities::RoomVisibility;
use domain::{Action, Context, Decision, Resource, Role, Subject};

/// Evaluate the ABAC policy for `action`. Assumes RBAC has already passed.
#[must_use]
pub fn evaluate(subject: &Subject, action: Action, resource: &Resource, ctx: &Context) -> Decision {
    match action {
        Action::PostAlert => post_alert(subject, resource, ctx),
        Action::PublishScreen => publish_screen(subject, resource, ctx),
        Action::ReadAlert | Action::ReadMessage | Action::SubscribeScreen | Action::JoinRoom => {
            room_access(subject, resource, ctx)
        }
        Action::PostMessage => post_message(subject, resource, ctx),
        Action::ManageRoom => manage_room(subject, resource),
        Action::ManageMembers => manage_members(subject, resource),
        // Account-wide; RBAC (super-admin only) already settled it.
        Action::ManageUsers => Decision::Allow,
    }
}

/// Super admins bypass per-room membership and status checks.
fn is_super(subject: &Subject) -> bool {
    subject.global_role == Role::SuperAdmin
}

fn require_room(resource: &Resource) -> Result<&RoomResource, Decision> {
    match resource {
        Resource::Room(room) => Ok(room),
        _ => Err(Decision::deny("policy: expected a room resource")),
    }
}

// Posting alerts and publishing screen are presenter actions. RBAC has already
// restricted them to admins and super admins (members lack AlertCreate /
// ScreenPublish), so any caller reaching this policy is at least an admin. They
// may present whether or not the room is currently live — gating the people who
// start the broadcast on `live` is a chicken-and-egg. Super admins additionally
// bypass room membership.
fn post_alert(subject: &Subject, resource: &Resource, ctx: &Context) -> Decision {
    present_action(subject, resource, ctx)
}

fn publish_screen(subject: &Subject, resource: &Resource, ctx: &Context) -> Decision {
    present_action(subject, resource, ctx)
}

/// Shared gate for the presenter actions (post alert, publish screen): an
/// admin/super-admin (already enforced by RBAC) may act regardless of live
/// status; a non-super admin must be a member of the room.
fn present_action(subject: &Subject, resource: &Resource, ctx: &Context) -> Decision {
    if !matches!(resource, Resource::Room(_)) {
        return Decision::deny("policy: expected a room resource");
    }
    if is_super(subject) || ctx.is_room_member {
        return Decision::Allow;
    }
    Decision::deny("policy: not a member of the room")
}

/// Read/subscribe/join: super admins always; otherwise members, plus anyone in
/// a public room — as long as the room is not closed.
fn room_access(subject: &Subject, resource: &Resource, ctx: &Context) -> Decision {
    if is_super(subject) {
        return Decision::Allow;
    }
    let permitted = match resource {
        Resource::Room(room) => room.status != RoomStatus::Closed && has_room_access(room, ctx),
        Resource::Alert(_) | Resource::Message(_) => ctx.is_room_member,
        _ => false,
    };
    if permitted {
        Decision::Allow
    } else {
        Decision::deny("policy: not a member of the room")
    }
}

/// Posting chat: super admins, room members, or anyone in a public room.
fn post_message(subject: &Subject, resource: &Resource, ctx: &Context) -> Decision {
    if is_super(subject) {
        return Decision::Allow;
    }
    let permitted = match resource {
        Resource::Room(room) => has_room_access(room, ctx),
        _ => ctx.is_room_member,
    };
    if permitted {
        Decision::Allow
    } else {
        Decision::deny("policy: not a member of the room")
    }
}

/// A non-admin may access a room if they are a member or the room is public.
fn has_room_access(room: &RoomResource, ctx: &Context) -> bool {
    ctx.is_room_member || room.visibility == RoomVisibility::Public
}

fn manage_room(subject: &Subject, resource: &Resource) -> Decision {
    let room = match require_room(resource) {
        Ok(room) => room,
        Err(d) => return d,
    };
    if is_super(subject) || room.owner_id == subject.user_id {
        Decision::Allow
    } else {
        Decision::deny("policy: only the room owner or a super admin may manage it")
    }
}

fn manage_members(subject: &Subject, resource: &Resource) -> Decision {
    // Reuse the room-management constraint: owner or super admin.
    manage_room(subject, resource)
}

