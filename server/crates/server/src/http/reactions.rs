//! Emoji reaction endpoints and the presenter "media-for-all" broadcast.
//!
//! Reactions: any room member who can post a chat message may toggle a reaction
//! on a message or alert — gated on [`Action::PostMessage`], the same capability
//! the authz engine uses for chat (mirrors how poll voting is gated). Listing is
//! gated on [`Action::ReadMessage`], the room-member read capability. Every query
//! is scoped by room and the target is validated to exist in the room (404
//! otherwise).
//!
//! Media-for-all: broadcasting a SoundCloud/YouTube URL, a direct MP3/video file
//! URL, or stopping is a presenter capability — gated on [`Action::PublishScreen`],
//! the same admin-in-a-live-room gate the authz engine uses for screen sharing.
//! SoundCloud/YouTube URLs are host-allowlisted; `mp3`/`video` accept any host
//! (direct file links). The broadcast is ephemeral (no persistence): a `media` WS
//! event is fanned out to the room and nothing is stored.

use crate::auth::session::CurrentUser;
use crate::authorization::RoomContext;
use crate::db;
use crate::db::reactions::ToggleOutcome;
use crate::error::{AppError, AppResult};
use crate::realtime::event::{MediaBroadcast, MediaKind, RoomEvent};
use crate::state::AppState;
use axum::Json;
use axum::Router;
use axum::extract::{Path, Query, State};
use axum::routing::post;
use domain::entities::{ReactionSummary, ReactionTargetKind};
use domain::{Action, RoomId};
use serde::Deserialize;
use std::str::FromStr as _;
use uuid::Uuid;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/rooms/{id}/reactions", post(toggle).get(list))
        .route("/api/rooms/{id}/media-for-all", post(media_for_all))
}

/// Max length of an emoji token. A grapheme cluster (e.g. a flag or skin-tone
/// sequence) can be a handful of code points; 32 bytes is generous while still
/// rejecting a pasted essay.
const MAX_EMOJI_LEN: usize = 32;

/// Validate that `target_kind` is one of the two known kinds, returning a typed
/// [`ReactionTargetKind`]. A `BadRequest` is surfaced for anything else.
fn parse_target_kind(raw: &str) -> AppResult<ReactionTargetKind> {
    ReactionTargetKind::from_str(raw)
        .map_err(|_| AppError::BadRequest("invalid target_kind".into()))
}

#[derive(Deserialize)]
struct ToggleReactionBody {
    target_kind: String,
    target_id: Uuid,
    emoji: String,
}

/// POST `/api/rooms/{id}/reactions` — toggle the caller's reaction on a target.
/// Adds the reaction if absent, removes it if present, and returns the fresh
/// aggregated summary. Broadcasts a `reaction` WS event to the room.
async fn toggle(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    Json(payload): Json<ToggleReactionBody>,
) -> AppResult<Json<ReactionSummary>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    // RBAC: reacting is open to any member who can chat — same gate as messages
    // and poll voting (`Action::PostMessage`).
    ctx.ensure(&state, Action::PostMessage).await?;

    if !state
        .cache
        .rate_limit(&format!("reaction:{id}:{}", user.user_id), 60, 60)
        .await?
    {
        return Err(AppError::RateLimited);
    }

    let target_kind = parse_target_kind(&payload.target_kind)?;

    let emoji = payload.emoji.trim();
    if emoji.is_empty() {
        return Err(AppError::BadRequest("emoji is required".into()));
    }
    if emoji.len() > MAX_EMOJI_LEN {
        return Err(AppError::BadRequest("emoji is too long".into()));
    }

    // 404 if the target message/alert does not exist in this room.
    if !db::reactions::target_in_room(&state.db, id, target_kind, payload.target_id).await? {
        return Err(AppError::NotFound);
    }

    let outcome = db::reactions::toggle(
        &state.db,
        id,
        target_kind,
        payload.target_id,
        user.user_id,
        emoji,
    )
    .await?;
    let summary = match outcome {
        ToggleOutcome::Added(summary) | ToggleOutcome::Removed(summary) => summary,
    };

    let event = RoomEvent::Reaction {
        reaction: summary.clone(),
    };
    let _ = state.hub.publish(id, &event.to_json()).await;
    Ok(Json(summary))
}

#[derive(Deserialize)]
struct ListReactionsQuery {
    target_kind: String,
    target_id: Uuid,
}

/// GET `/api/rooms/{id}/reactions?target_kind=&target_id=` — the aggregated
/// reactions for one target, with `mine` computed for the caller.
async fn list(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    Query(query): Query<ListReactionsQuery>,
) -> AppResult<Json<ReactionSummary>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    // RBAC: reading reactions mirrors message reads — open to room members.
    ctx.ensure(&state, Action::ReadMessage).await?;

    let target_kind = parse_target_kind(&query.target_kind)?;

    // 404 if the target message/alert does not exist in this room.
    if !db::reactions::target_in_room(&state.db, id, target_kind, query.target_id).await? {
        return Err(AppError::NotFound);
    }

    let summary =
        db::reactions::list_for(&state.db, id, target_kind, query.target_id, user.user_id).await?;
    Ok(Json(summary))
}

#[derive(Deserialize)]
struct MediaForAllBody {
    /// `"soundcloud"`, `"youtube"`, `"mp3"`, `"video"`, or `"stop"`.
    kind: String,
    /// Required (and validated) unless `kind == "stop"`.
    #[serde(default)]
    url: Option<String>,
}

/// Parse and validate the media kind + URL. For `stop`, the URL is ignored. For
/// `soundcloud`/`youtube`, the URL must be an `http(s)` URL whose host matches the
/// expected provider domain. For `mp3`/`video`, the URL must be an `http(s)` URL
/// with a host but may point at ANY host (these are direct file links, not a
/// fixed provider).
fn parse_media(body: &MediaForAllBody) -> AppResult<MediaBroadcast> {
    match body.kind.as_str() {
        "stop" => Ok(MediaBroadcast {
            kind: MediaKind::Stop,
            url: None,
        }),
        "soundcloud" => Ok(MediaBroadcast {
            kind: MediaKind::Soundcloud,
            url: Some(validate_media_url(
                body.url.as_deref(),
                &["soundcloud.com"],
            )?),
        }),
        "youtube" => Ok(MediaBroadcast {
            kind: MediaKind::Youtube,
            url: Some(validate_media_url(
                body.url.as_deref(),
                &["youtube.com", "youtu.be"],
            )?),
        }),
        "mp3" => Ok(MediaBroadcast {
            kind: MediaKind::Mp3,
            url: Some(validate_direct_media_url(body.url.as_deref())?),
        }),
        "video" => Ok(MediaBroadcast {
            kind: MediaKind::Video,
            url: Some(validate_direct_media_url(body.url.as_deref())?),
        }),
        _ => Err(AppError::BadRequest("invalid media kind".into())),
    }
}

/// Ensure `raw` is present, is a valid `http(s)` URL with a host, and return the
/// parsed URL together with its lowercased host. Shared by both the host-allowlist
/// validator and the any-host (direct file) validator so the scheme/host checks
/// can't drift apart.
fn parse_http_url_with_host(raw: Option<&str>) -> AppResult<(url::Url, String)> {
    let raw = raw
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .ok_or_else(|| AppError::BadRequest("url is required".into()))?;

    let parsed =
        url::Url::parse(raw).map_err(|_| AppError::BadRequest("url is not a valid URL".into()))?;
    if !matches!(parsed.scheme(), "http" | "https") {
        return Err(AppError::BadRequest("url must be http(s)".into()));
    }
    let host = parsed
        .host_str()
        .ok_or_else(|| AppError::BadRequest("url is missing a host".into()))?
        .to_ascii_lowercase();
    Ok((parsed, host))
}

/// Ensure `raw` is present, is a valid `http(s)` URL, and that its host is (or is
/// a subdomain of) one of `allowed_hosts`. Returns the normalized URL string.
fn validate_media_url(raw: Option<&str>, allowed_hosts: &[&str]) -> AppResult<String> {
    let (parsed, host) = parse_http_url_with_host(raw)?;
    // Accept the bare host or any subdomain of an allowed host (e.g.
    // `www.youtube.com`, `m.soundcloud.com`).
    let host_ok = allowed_hosts
        .iter()
        .any(|allowed| host == *allowed || host.ends_with(&format!(".{allowed}")));
    if !host_ok {
        return Err(AppError::BadRequest(
            "url host is not an allowed provider".into(),
        ));
    }
    Ok(parsed.to_string())
}

/// Ensure `raw` is present and is a valid `http(s)` URL with a host, but allow
/// ANY host. Used for `mp3`/`video` direct file links, which are not tied to a
/// fixed provider. Returns the normalized URL string. Deliberately does NOT run
/// the allowed-hosts test that [`validate_media_url`] applies.
fn validate_direct_media_url(raw: Option<&str>) -> AppResult<String> {
    let (parsed, _host) = parse_http_url_with_host(raw)?;
    Ok(parsed.to_string())
}

/// POST `/api/rooms/{id}/media-for-all` — presenter broadcasts (or stops) a media
/// stream to the whole room. Ephemeral: only a `media` WS event is fanned out.
async fn media_for_all(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Path(id): Path<RoomId>,
    Json(payload): Json<MediaForAllBody>,
) -> AppResult<Json<MediaBroadcast>> {
    let ctx = RoomContext::load(&state, &user, id).await?;
    // RBAC: broadcasting media to the room is a presenter capability — same gate
    // as publishing a screen share (`Action::PublishScreen`: admin/super-admin,
    // member of the room, room live).
    ctx.ensure(&state, Action::PublishScreen).await?;

    let media = parse_media(&payload)?;

    let event = RoomEvent::Media(media.clone());
    let _ = state.hub.publish(id, &event.to_json()).await;
    Ok(Json(media))
}
