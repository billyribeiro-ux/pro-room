//! Room CRUD, membership management, live toggle, and `LiveKit` token minting.

use crate::auth::session::CurrentUser;
use crate::authorization::RoomContext;
use crate::db;
use crate::error::{AppError, AppResult};
use crate::realtime::event::RoomEvent;
use crate::state::AppState;
use crate::{livekit, util};
use axum::Json;
use axum::Router;
use axum::extract::{Path, State};
use axum::routing::{get, post};
use domain::entities::{Room, RoomVisibility};
use domain::{Action, Role, RoomId};
use serde::{Deserialize, Serialize};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/rooms", get(list).post(create))
        .route("/api/rooms/{id}", get(detail).patch(update).delete(remove))
        .route("/api/rooms/{id}/live", post(set_live))
        .route(
            "/api/rooms/{id}/members",
            get(list_members).post(add_member),
        )
        .route(
            "/api/rooms/{id}/members/{user_id}",
            axum::routing::delete(remove_member),
        )
        .route("/api/rooms/{id}/livekit-token", post(livekit_token))
}

/// Per-room capabilities for the caller, sent to the UI to decide which
/// controls to show. A flat set of booleans is the natural wire shape here.
#[derive(Serialize)]
#[allow(clippy::struct_excessive_bools)]
struct RoomCapabilities {
    can_manage_room: bool,
    can_manage_members: bool,
    can_post_alert: bool,
    can_publish_screen: bool,
    can_post_message: bool,
}

#[derive(Serialize)]
struct RoomDetail {
    room: Room,
    your_role: Option<Role>,
    is_member: bool,
    capabilities: RoomCapabilities,
}

fn detail_from(ctx: &RoomContext) -> RoomDetail {
    RoomDetail {
        room: ctx.room.clone(),
        your_role: ctx.membership.as_ref().map(|m| m.role),
        is_member: ctx.membership.is_some(),
        capabilities: RoomCapabilities {
            can_manage_room: ctx.allows(Action::ManageRoom),
            can_manage_members: ctx.allows(Action::ManageMembers),
            can_post_alert: ctx.allows(Action::PostAlert),
            can_publish_screen: ctx.allows(Action::PublishScreen),
            can_post_message: ctx.allows(Action::PostMessage),
        },
    }
}

async fn list(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
) -> AppResult<Json<Vec<Room>>> {
    let all = user.global_role == Role::SuperAdmin;
    let rooms = db::rooms::list_visible(&state.db, user.user_id, all).await?;
    Ok(Json(rooms))
}

#[derive(Deserialize)]
struct CreateRoomBody {
    name: String,
    slug: Option<String>,
    visibility: Option<RoomVisibility>,
}

async fn create(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Json(body): Json<CreateRoomBody>,
) -> AppResult<Json<RoomDetail>> {
    // Only administrators may create rooms.
    if !user.global_role.is_admin() {
        return Err(AppError::Forbidden("only admins may create rooms"));
    }
    let name = body.name.trim();
    if name.is_empty() {
        return Err(AppError::BadRequest("room name is required".into()));
    }
    let slug = util::slugify(body.slug.as_deref().unwrap_or(name));
    if slug.is_empty() {
        return Err(AppError::BadRequest("could not derive a slug".into()));
    }
    if db::rooms::find_by_slug(&state.db, &slug).await?.is_some() {
        return Err(AppError::Conflict(
            "a room with that slug already exists".into(),
        ));
    }

    let visibility = body.visibility.unwrap_or(RoomVisibility::Private);
    let room = db::rooms::create(&state.db, &slug, name, user.user_id, visibility).await?;
    // The creator joins their own room with their global role.
    db::members::upsert(
        &state.db,
        room.id,
        user.user_id,
        user.global_role,
        &serde_json::json!({}),
    )
    .await?;

    let ctx = RoomContext::load(&state, &user, room.id).await?;
    Ok(Json(detail_from(&ctx)))
}

async fn detail(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
) -> AppResult<Json<RoomDetail>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::JoinRoom).await?;
    Ok(Json(detail_from(&ctx)))
}

#[derive(Deserialize)]
struct UpdateRoomBody {
    name: String,
    visibility: RoomVisibility,
}

async fn update(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    Json(body): Json<UpdateRoomBody>,
) -> AppResult<Json<RoomDetail>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ManageRoom).await?;
    let name = body.name.trim();
    if name.is_empty() {
        return Err(AppError::BadRequest("room name is required".into()));
    }
    db::rooms::update(&state.db, id, name, body.visibility).await?;
    let ctx = RoomContext::load(&state, &user, id).await?;
    Ok(Json(detail_from(&ctx)))
}

async fn remove(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
) -> AppResult<Json<serde_json::Value>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ManageRoom).await?;
    db::rooms::delete(&state.db, id).await?;
    Ok(Json(serde_json::json!({ "ok": true })))
}

#[derive(Deserialize)]
struct SetLiveBody {
    is_live: bool,
}

async fn set_live(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    Json(body): Json<SetLiveBody>,
) -> AppResult<Json<RoomDetail>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ManageRoom).await?;
    db::rooms::set_live(&state.db, id, body.is_live).await?;
    let _ = state
        .hub
        .publish(
            id,
            &RoomEvent::Live {
                is_live: body.is_live,
            }
            .to_json(),
        )
        .await;
    let ctx = RoomContext::load(&state, &user, id).await?;
    Ok(Json(detail_from(&ctx)))
}

async fn list_members(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
) -> AppResult<Json<Vec<db::members::MemberView>>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ManageMembers).await?;
    Ok(Json(db::members::list(&state.db, id).await?))
}

#[derive(Deserialize)]
struct AddMemberBody {
    email: String,
    role: Role,
    #[serde(default)]
    attributes: serde_json::Value,
}

async fn add_member(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    Json(body): Json<AddMemberBody>,
) -> AppResult<Json<Vec<db::members::MemberView>>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ManageMembers).await?;

    let email = body.email.trim().to_lowercase();
    let target = db::users::find_by_email(&state.db, &email)
        .await?
        .ok_or_else(|| AppError::BadRequest("no user with that email".into()))?;
    let attributes = if body.attributes.is_object() {
        body.attributes
    } else {
        serde_json::json!({})
    };
    db::members::upsert(&state.db, id, target.user.id, body.role, &attributes).await?;
    Ok(Json(db::members::list(&state.db, id).await?))
}

async fn remove_member(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path((id, target)): Path<(RoomId, domain::UserId)>,
) -> AppResult<Json<serde_json::Value>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ManageMembers).await?;
    db::members::remove(&state.db, id, target).await?;
    Ok(Json(serde_json::json!({ "ok": true })))
}

#[derive(Serialize)]
struct LiveKitTokenResponse {
    url: String,
    token: String,
    can_publish: bool,
}

async fn livekit_token(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
) -> AppResult<Json<LiveKitTokenResponse>> {
    let livekit_cfg = state
        .config
        .livekit
        .as_ref()
        .ok_or(AppError::Disabled("livekit is not configured"))?;

    let ctx = RoomContext::load(&state, &user, id).await?;
    // Must at least be allowed to join/subscribe.
    ctx.ensure(&state, Action::SubscribeScreen).await?;
    // Publishing is granted only if the publish policy also allows it.
    let can_publish = ctx.allows(Action::PublishScreen);

    let grant = livekit::Grant {
        identity: user.user_id.to_string(),
        display_name: user.display_name.clone(),
        room: id.to_string(),
        can_publish,
    };
    let token = livekit::mint(livekit_cfg, &grant)?;
    Ok(Json(LiveKitTokenResponse {
        url: livekit_cfg.url.clone(),
        token,
        can_publish,
    }))
}
