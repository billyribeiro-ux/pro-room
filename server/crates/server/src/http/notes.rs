//! Per-room note endpoints. Notes are titled documents that admins manage and
//! members read. Reading is gated on [`Action::JoinRoom`]; all mutations require
//! [`Action::ManageRoom`].

use crate::auth::session::CurrentUser;
use crate::authorization::RoomContext;
use crate::db;
use crate::error::{AppError, AppResult};
use crate::state::AppState;
use axum::Json;
use axum::Router;
use axum::extract::{Path, State};
use axum::routing::get;
use domain::entities::Note;
use domain::{Action, NoteId, RoomId};
use serde::Deserialize;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/rooms/{id}/notes", get(list).post(create))
        .route(
            "/api/rooms/{id}/notes/{note_id}",
            axum::routing::patch(update).delete(remove),
        )
}

const MAX_TITLE_LEN: usize = 200;

async fn list(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
) -> AppResult<Json<Vec<Note>>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::JoinRoom).await?;
    Ok(Json(db::notes::list(&state.db, id).await?))
}

#[derive(Deserialize)]
struct CreateNoteBody {
    title: String,
    body: Option<String>,
}

async fn create(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    Json(payload): Json<CreateNoteBody>,
) -> AppResult<Json<Note>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ManageRoom).await?;

    let title = payload.title.trim();
    if title.is_empty() {
        return Err(AppError::BadRequest("note title is required".into()));
    }
    if title.len() > MAX_TITLE_LEN {
        return Err(AppError::BadRequest("note title is too long".into()));
    }
    let body = payload.body.as_deref().unwrap_or("");

    let note = db::notes::create(&state.db, id, user.user_id, title, body).await?;
    Ok(Json(note))
}

#[derive(Deserialize)]
struct UpdateNoteBody {
    title: Option<String>,
    body: Option<String>,
    position: Option<i32>,
}

async fn update(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path((id, note_id)): Path<(RoomId, NoteId)>,
    Json(payload): Json<UpdateNoteBody>,
) -> AppResult<Json<Note>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ManageRoom).await?;

    // 404 if the note does not belong to this room.
    if db::notes::get(&state.db, id, note_id).await?.is_none() {
        return Err(AppError::NotFound);
    }

    let title = match payload.title.as_deref().map(str::trim) {
        Some("") => {
            return Err(AppError::BadRequest("note title cannot be empty".into()));
        }
        Some(t) if t.len() > MAX_TITLE_LEN => {
            return Err(AppError::BadRequest("note title is too long".into()));
        }
        other => other,
    };

    let note = db::notes::update(
        &state.db,
        id,
        note_id,
        title,
        payload.body.as_deref(),
        payload.position,
    )
    .await?
    .ok_or(AppError::NotFound)?;
    Ok(Json(note))
}

async fn remove(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path((id, note_id)): Path<(RoomId, NoteId)>,
) -> AppResult<Json<serde_json::Value>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    ctx.ensure(&state, Action::ManageRoom).await?;

    if !db::notes::delete(&state.db, id, note_id).await? {
        return Err(AppError::NotFound);
    }
    Ok(Json(serde_json::json!({ "ok": true })))
}
