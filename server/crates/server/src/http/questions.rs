//! Alert Q&A endpoints. Any room member who can post messages may ask a
//! question against an alert; answering/resolving is restricted to users who
//! can post alerts (admins) — the same capability the authz engine gates
//! [`Action::PostAlert`] on. Reading mirrors alert reads.

use crate::auth::session::CurrentUser;
use crate::authorization::RoomContext;
use crate::db;
use crate::error::{AppError, AppResult};
use crate::state::AppState;
use axum::Json;
use axum::Router;
use axum::extract::{Path, State};
use axum::routing::{get, post};
use domain::entities::Question;
use domain::{Action, AlertId, QuestionId, RoomId};
use serde::Deserialize;

pub fn router() -> Router<AppState> {
    Router::new()
        .route(
            "/api/rooms/{id}/alerts/{alert_id}/questions",
            get(list).post(create),
        )
        .route(
            "/api/rooms/{id}/questions/{question_id}/resolve",
            post(resolve),
        )
}

const MAX_BODY_LEN: usize = 2000;
const MAX_ANSWER_LEN: usize = 4000;

#[derive(Deserialize)]
struct CreateQuestionBody {
    body: String,
}

async fn create(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path((id, alert_id)): Path<(RoomId, AlertId)>,
    Json(payload): Json<CreateQuestionBody>,
) -> AppResult<Json<Question>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::PostMessage).await?;

    if !state
        .cache
        .rate_limit(&format!("question:{id}:{}", user.user_id), 30, 60)
        .await?
    {
        return Err(AppError::RateLimited);
    }

    // 404 if the alert does not exist in this room.
    if !db::questions::alert_in_room(&state.db, id, alert_id).await? {
        return Err(AppError::NotFound);
    }

    let body = payload.body.trim();
    if body.is_empty() {
        return Err(AppError::BadRequest("question body is required".into()));
    }
    if body.len() > MAX_BODY_LEN {
        return Err(AppError::BadRequest("question is too long".into()));
    }

    let question = db::questions::create(&state.db, id, alert_id, user.user_id, body).await?;
    Ok(Json(question))
}

async fn list(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path((id, alert_id)): Path<(RoomId, AlertId)>,
) -> AppResult<Json<Vec<Question>>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ReadAlert).await?;

    // 404 if the alert does not exist in this room.
    if !db::questions::alert_in_room(&state.db, id, alert_id).await? {
        return Err(AppError::NotFound);
    }

    Ok(Json(
        db::questions::list_for_alert(&state.db, id, alert_id).await?,
    ))
}

#[derive(Deserialize)]
struct ResolveQuestionBody {
    answer: String,
}

async fn resolve(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path((id, question_id)): Path<(RoomId, QuestionId)>,
    Json(payload): Json<ResolveQuestionBody>,
) -> AppResult<Json<Question>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    // Answering/resolving is an admin capability: same gate as posting alerts.
    ctx.ensure(&state, Action::PostAlert).await?;

    let answer = payload.answer.trim();
    if answer.is_empty() {
        return Err(AppError::BadRequest("answer is required".into()));
    }
    if answer.len() > MAX_ANSWER_LEN {
        return Err(AppError::BadRequest("answer is too long".into()));
    }

    let question = db::questions::resolve(&state.db, id, question_id, user.user_id, answer)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(question))
}
