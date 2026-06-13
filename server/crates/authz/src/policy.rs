//! Attribute-based policies: the fine-grained constraints applied *after* the
//! RBAC gate has confirmed the role could, in principle, perform the action.
//!
//! Each policy inspects concrete attributes — room status, ownership, the
//! subject's membership — to decide whether the action is permitted right now.

use domain::authz::{RoomResource, RoomStatus};
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

fn post_alert(subject: &Subject, resource: &Resource, ctx: &Context) -> Decision {
    let room = match require_room(resource) {
        Ok(room) => room,
        Err(d) => return d,
    };
    if is_super(subject) {
        return live_or_deny(room);
    }
    if !ctx.is_room_member {
        return Decision::deny("policy: not a member of the room");
    }
    live_or_deny(room)
}

fn publish_screen(subject: &Subject, resource: &Resource, ctx: &Context) -> Decision {
    let room = match require_room(resource) {
        Ok(room) => room,
        Err(d) => return d,
    };
    if is_super(subject) {
        return live_or_deny(room);
    }
    if !ctx.is_room_member {
        return Decision::deny("policy: not a member of the room");
    }
    live_or_deny(room)
}

/// Read/subscribe/join: any member (or super admin) may, as long as the room is
/// not closed.
fn room_access(subject: &Subject, resource: &Resource, ctx: &Context) -> Decision {
    if is_super(subject) {
        return Decision::Allow;
    }
    let permitted_member = match resource {
        Resource::Room(room) => room.status != RoomStatus::Closed && ctx.is_room_member,
        Resource::Alert(_) | Resource::Message(_) => ctx.is_room_member,
        _ => false,
    };
    if permitted_member {
        Decision::Allow
    } else {
        Decision::deny("policy: not a member of the room")
    }
}

fn post_message(subject: &Subject, _resource: &Resource, ctx: &Context) -> Decision {
    if is_super(subject) || ctx.is_room_member {
        Decision::Allow
    } else {
        Decision::deny("policy: not a member of the room")
    }
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

fn live_or_deny(room: &RoomResource) -> Decision {
    if room.status == RoomStatus::Live {
        Decision::Allow
    } else {
        Decision::deny("policy: room is not live")
    }
}
