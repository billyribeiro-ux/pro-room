//! Bridges the pure `authz` engine to the database: it resolves the concrete
//! `Subject`, `Resource`, and `Context` for a request, evaluates decisions,
//! records them in the audit log, and converts a denial into `403`.
//!
//! Handlers obtain a [`RoomContext`] (which can answer multiple capability
//! questions about the same room without re-querying) or call
//! [`ensure_system_action`] for account-wide actions.

use crate::auth::session::SessionUser;
use crate::db;
use crate::db::members::Membership;
use crate::error::{AppError, AppResult};
use crate::state::AppState;
use domain::authz::{RoomResource, RoomStatus};
use domain::entities::Room;
use domain::{Action, Context, Decision, Resource, RoomId, Subject};

/// Everything needed to authorize any room-scoped action for one caller, loaded
/// once. Reused to both enforce an action and to compute the caller's full
/// capability set for the UI.
pub struct RoomContext {
    pub room: Room,
    pub membership: Option<Membership>,
    subject: Subject,
    resource: Resource,
    ctx: Context,
}

impl RoomContext {
    /// Load the room (404 if missing) and the caller's membership.
    pub async fn load(state: &AppState, user: &SessionUser, room_id: RoomId) -> AppResult<Self> {
        let room = db::rooms::find_by_id(&state.db, room_id)
            .await?
            .ok_or(AppError::NotFound)?;
        let membership = db::members::get(&state.db, room_id, user.user_id).await?;

        let subject = Subject {
            user_id: user.user_id,
            global_role: user.global_role,
            room_role: membership.as_ref().map(|m| m.role),
            room_id: Some(room_id),
            attributes: membership
                .as_ref()
                .map(|m| m.attributes.clone())
                .unwrap_or_default(),
        };
        let resource = Resource::Room(RoomResource {
            room_id,
            owner_id: room.owner_id,
            status: if room.is_live {
                RoomStatus::Live
            } else {
                RoomStatus::Idle
            },
            visibility: room.visibility,
        });
        let ctx = Context {
            is_room_member: membership.is_some(),
        };
        Ok(Self {
            room,
            membership,
            subject,
            resource,
            ctx,
        })
    }

    /// Non-failing capability check (no audit), for computing what the UI should
    /// show.
    #[must_use]
    pub fn allows(&self, action: Action) -> bool {
        authz::authorize(&self.subject, action, &self.resource, &self.ctx).is_allowed()
    }

    /// Enforce an action: audit the decision and return `403` if denied.
    pub async fn ensure(&self, state: &AppState, action: Action) -> AppResult<()> {
        let decision = authz::authorize(&self.subject, action, &self.resource, &self.ctx);
        audit(
            state,
            Some(self.subject.user_id),
            action,
            &format!("room:{}", self.room.id),
            &decision,
        )
        .await;
        decision_to_result(&decision)
    }
}

/// Authorize an account-wide action (e.g. user management).
pub async fn ensure_system_action(
    state: &AppState,
    user: &SessionUser,
    action: Action,
) -> AppResult<()> {
    let subject = Subject {
        user_id: user.user_id,
        global_role: user.global_role,
        room_role: None,
        room_id: None,
        attributes: Vec::new(),
    };
    let decision = authz::authorize(&subject, action, &Resource::System, &Context::default());
    audit(state, Some(user.user_id), action, "system", &decision).await;
    decision_to_result(&decision)
}

fn decision_to_result(decision: &Decision) -> AppResult<()> {
    match decision {
        Decision::Allow => Ok(()),
        Decision::Deny { reason } => Err(AppError::Forbidden(reason)),
    }
}

async fn audit(
    state: &AppState,
    actor: Option<domain::UserId>,
    action: Action,
    resource: &str,
    decision: &Decision,
) {
    let (verdict, reason) = match decision {
        Decision::Allow => ("allow", None),
        Decision::Deny { reason } => ("deny", Some(*reason)),
    };
    let entry = db::audit::AuditEntry {
        actor_id: actor,
        action: action_name(action),
        resource,
        decision: verdict,
        reason,
    };
    if let Err(err) = db::audit::record(&state.db, entry).await {
        tracing::warn!(error = ?err, "failed to write audit log");
    }
}

const fn action_name(action: Action) -> &'static str {
    match action {
        Action::PostAlert => "post_alert",
        Action::ReadAlert => "read_alert",
        Action::PublishScreen => "publish_screen",
        Action::SubscribeScreen => "subscribe_screen",
        Action::PostMessage => "post_message",
        Action::ReadMessage => "read_message",
        Action::SendPrivateMessage => "send_private_message",
        Action::ReadAllPrivateMessages => "read_all_private_messages",
        Action::JoinRoom => "join_room",
        Action::ManageRoom => "manage_room",
        Action::ManageMembers => "manage_members",
        Action::ManageUsers => "manage_users",
    }
}
