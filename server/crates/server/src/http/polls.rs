//! Live poll endpoints. Creating and closing a poll is an admin capability
//! gated on [`Action::PostAlert`] (mirrors alert posting); voting is gated on
//! [`Action::PostMessage`] (any member who can chat may vote); listing is gated
//! on [`Action::ReadAlert`] (mirrors alert reads). Every query is scoped by
//! room, and a 404 is returned when a poll is not in the room.

use crate::auth::session::CurrentUser;
use crate::authorization::RoomContext;
use crate::db;
use crate::db::polls::VoteOutcome;
use crate::error::{AppError, AppResult};
use crate::realtime::event::RoomEvent;
use crate::state::AppState;
use axum::Json;
use axum::Router;
use axum::extract::{Path, State};
use axum::routing::{get, post};
use domain::entities::PollDetail;
use domain::{Action, PollId, PollOptionId, RoomId};
use serde::Deserialize;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/rooms/{id}/polls", get(list).post(create))
        .route("/api/rooms/{id}/polls/{poll_id}/vote", post(vote))
        .route("/api/rooms/{id}/polls/{poll_id}/close", post(close))
}

// Kept in lock-step with the frontend `schemas.ts` poll limits (question 280,
// option 80) so the form and the API agree on what's valid.
const MAX_QUESTION_LEN: usize = 280;
const MAX_OPTION_LEN: usize = 80;
const MIN_OPTIONS: usize = 2;
const MAX_OPTIONS: usize = 10;

#[derive(Deserialize)]
struct CreatePollBody {
    question: String,
    options: Vec<String>,
    #[serde(default)]
    anonymous: bool,
}

async fn create(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    Json(payload): Json<CreatePollBody>,
) -> AppResult<Json<PollDetail>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    // RBAC: posting a poll is an admin capability — same gate as posting alerts.
    ctx.ensure(&state, Action::PostAlert).await?;

    if !state
        .cache
        .rate_limit(&format!("poll:{id}:{}", user.user_id), 30, 60)
        .await?
    {
        return Err(AppError::RateLimited);
    }

    let question = payload.question.trim();
    if question.is_empty() {
        return Err(AppError::BadRequest("question is required".into()));
    }
    if question.len() > MAX_QUESTION_LEN {
        return Err(AppError::BadRequest("question is too long".into()));
    }

    // Trim, drop empties, and reject anything outside 2..=10 non-empty options.
    let options: Vec<String> = payload
        .options
        .iter()
        .map(|o| o.trim().to_owned())
        .filter(|o| !o.is_empty())
        .collect();
    if options.len() < MIN_OPTIONS {
        return Err(AppError::BadRequest(
            "at least two non-empty options are required".into(),
        ));
    }
    if options.len() > MAX_OPTIONS {
        return Err(AppError::BadRequest("too many options".into()));
    }
    if options.iter().any(|o| o.len() > MAX_OPTION_LEN) {
        return Err(AppError::BadRequest("an option is too long".into()));
    }

    let detail = db::polls::create(
        &state.db,
        id,
        user.user_id,
        question,
        &options,
        payload.anonymous,
    )
    .await?;

    let event = RoomEvent::Poll {
        poll: detail.clone(),
    };
    let _ = state.hub.publish(id, &event.to_json()).await;
    Ok(Json(detail))
}

async fn list(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
) -> AppResult<Json<Vec<PollDetail>>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    // RBAC: reading polls mirrors alert reads — open to room members.
    ctx.ensure(&state, Action::ReadAlert).await?;
    Ok(Json(db::polls::list_active(&state.db, id).await?))
}

#[derive(Deserialize)]
struct VoteBody {
    option_id: PollOptionId,
}

async fn vote(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path((id, poll_id)): Path<(RoomId, PollId)>,
    Json(payload): Json<VoteBody>,
) -> AppResult<Json<PollDetail>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    // RBAC: voting is open to any member who can chat — same gate as messages.
    ctx.ensure(&state, Action::PostMessage).await?;

    let outcome = db::polls::vote(&state.db, id, poll_id, payload.option_id, user.user_id).await?;
    let detail = match outcome {
        VoteOutcome::Recorded(detail) => detail,
        VoteOutcome::NotFound => return Err(AppError::NotFound),
        VoteOutcome::Closed => return Err(AppError::Conflict("poll is closed".into())),
        VoteOutcome::InvalidOption => {
            return Err(AppError::BadRequest(
                "option does not belong to poll".into(),
            ));
        }
    };

    let event = RoomEvent::Poll {
        poll: detail.clone(),
    };
    let _ = state.hub.publish(id, &event.to_json()).await;
    Ok(Json(detail))
}

async fn close(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path((id, poll_id)): Path<(RoomId, PollId)>,
) -> AppResult<Json<PollDetail>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    // RBAC: closing a poll is an admin capability — same gate as posting alerts.
    ctx.ensure(&state, Action::PostAlert).await?;

    let detail = db::polls::close(&state.db, id, poll_id)
        .await?
        .ok_or(AppError::NotFound)?;

    let event = RoomEvent::Poll {
        poll: detail.clone(),
    };
    let _ = state.hub.publish(id, &event.to_json()).await;
    Ok(Json(detail))
}
