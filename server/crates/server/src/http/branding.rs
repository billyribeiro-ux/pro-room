//! Application branding: a PUBLIC read of the current brand (name + logo URL) so
//! even the login page can render it, plus admin-only writes (set name,
//! upload/replace logo, reset logo).
//!
//! Branding is account-wide (`Resource::System`) and every write is gated on
//! [`Action::ManageBranding`] (admin+, reusing the `RoomManage` capability). The
//! logo bytes live on local disk under the uploads dir like every other upload;
//! the `branding` row holds only the storage key + content type.

use crate::auth::session::CurrentUser;
use crate::authorization::ensure_system_action;
use crate::db;
use crate::error::{AppError, AppResult};
use crate::state::AppState;
use axum::Json;
use axum::Router;
use axum::body::Body;
use axum::extract::{Multipart, State};
use axum::http::header;
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use domain::Action;
use serde::{Deserialize, Serialize};

/// 2 MB cap on a brand logo — generous for an SVG/PNG, far below the 25 MB file cap.
const MAX_LOGO_BYTES: usize = 2 * 1024 * 1024;
/// Cap on the brand display name (characters).
const MAX_NAME_LEN: usize = 60;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/branding", get(read).patch(update_name))
        .route(
            "/api/branding/logo",
            get(serve_logo).post(upload_logo).delete(reset_logo),
        )
}

#[derive(Serialize)]
struct BrandingView {
    /// The configured name, or null ⇒ the client uses its bundled default.
    name: Option<String>,
    /// A servable logo URL (with a cache-busting version), or null ⇒ default logo.
    logo_url: Option<String>,
}

fn view(b: &db::branding::Branding) -> BrandingView {
    // Version the URL by updated_at so a replaced logo is refetched past any cache.
    let logo_url = b
        .logo_storage_name
        .as_ref()
        .map(|_| format!("/api/branding/logo?v={}", b.updated_at.unix_timestamp()));
    BrandingView {
        name: b.name.clone(),
        logo_url,
    }
}

/// Public: read the current branding (name + logo URL).
async fn read(State(state): State<AppState>) -> AppResult<Json<BrandingView>> {
    let branding = db::branding::get(&state.db).await?;
    Ok(Json(view(&branding)))
}

#[derive(Deserialize)]
struct UpdateNameBody {
    /// New name; null or blank clears it back to the default.
    name: Option<String>,
}

/// Admin: set (or clear) the brand display name.
async fn update_name(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    Json(body): Json<UpdateNameBody>,
) -> AppResult<Json<BrandingView>> {
    ensure_system_action(&state, &user, Action::ManageBranding).await?;

    let name = body
        .name
        .as_deref()
        .map(str::trim)
        .filter(|s| !s.is_empty());
    if let Some(n) = name
        && n.chars().count() > MAX_NAME_LEN
    {
        return Err(AppError::BadRequest("brand name is too long".into()));
    }
    db::branding::set_name(&state.db, name, user.user_id).await?;
    let branding = db::branding::get(&state.db).await?;
    Ok(Json(view(&branding)))
}

/// Public: serve the current logo bytes (loaded via `<img>`, so even an SVG can't
/// execute script). 404 when no logo is set ⇒ the client shows its default.
async fn serve_logo(State(state): State<AppState>) -> AppResult<Response> {
    let branding = db::branding::get(&state.db).await?;
    let storage_name = branding.logo_storage_name.ok_or(AppError::NotFound)?;
    let content_type = branding
        .logo_content_type
        .unwrap_or_else(|| "application/octet-stream".to_owned());

    let path = std::path::Path::new(&state.config.uploads_dir).join(&storage_name);
    let bytes = tokio::fs::read(&path).await.map_err(|e| {
        AppError::Internal(anyhow::Error::new(e).context("reading brand logo from disk"))
    })?;
    Ok((
        [
            (header::CONTENT_TYPE, content_type),
            // Safe to cache: the read endpoint's ?v= query busts it on every change.
            (header::CACHE_CONTROL, "public, max-age=300".to_owned()),
        ],
        Body::from(bytes),
    )
        .into_response())
}

/// One image field read from a multipart body, enforcing the logo size cap and
/// rejecting non-image content. The on-disk name is generated server-side.
struct LogoPart {
    content_type: String,
    bytes: Vec<u8>,
}

async fn read_logo_part(mut multipart: Multipart) -> AppResult<LogoPart> {
    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| AppError::BadRequest(format!("invalid multipart body: {e}")))?
    {
        if field.name() != Some("file") {
            continue;
        }
        let content_type = field
            .content_type()
            .unwrap_or("application/octet-stream")
            .to_owned();
        if !content_type.starts_with("image/") {
            return Err(AppError::BadRequest("logo must be an image".into()));
        }
        let bytes = field
            .bytes()
            .await
            .map_err(|e| AppError::BadRequest(format!("failed to read upload: {e}")))?;
        if bytes.len() > MAX_LOGO_BYTES {
            return Err(AppError::PayloadTooLarge("logo exceeds 2 MB limit".into()));
        }
        return Ok(LogoPart {
            content_type,
            bytes: bytes.to_vec(),
        });
    }
    Err(AppError::BadRequest("missing `file` field".into()))
}

/// Admin: upload/replace the brand logo. Writes the bytes to disk, repoints the
/// branding row, then unlinks the previously stored logo (best effort).
async fn upload_logo(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
    multipart: Multipart,
) -> AppResult<Json<BrandingView>> {
    ensure_system_action(&state, &user, Action::ManageBranding).await?;

    let part = read_logo_part(multipart).await?;

    // Capture the prior storage key first so we can clean it up after the swap.
    let prior = db::branding::get(&state.db).await?.logo_storage_name;

    let storage_name = uuid::Uuid::new_v4().to_string();
    let path = std::path::Path::new(&state.config.uploads_dir).join(&storage_name);
    tokio::fs::write(&path, &part.bytes)
        .await
        .map_err(|e| AppError::Internal(anyhow::Error::new(e).context("writing logo to disk")))?;

    if let Err(err) =
        db::branding::set_logo(&state.db, &storage_name, &part.content_type, user.user_id).await
    {
        // Roll back the orphaned bytes if the row update failed.
        let _ = tokio::fs::remove_file(&path).await;
        return Err(err.into());
    }

    // Best-effort removal of the replaced file (its row no longer references it).
    if let Some(old) = prior {
        let old_path = std::path::Path::new(&state.config.uploads_dir).join(&old);
        if let Err(err) = tokio::fs::remove_file(&old_path).await {
            tracing::warn!(error = ?err, %old, "failed to unlink replaced brand logo");
        }
    }

    let branding = db::branding::get(&state.db).await?;
    Ok(Json(view(&branding)))
}

/// Admin: clear the logo, reverting to the bundled default.
async fn reset_logo(
    State(state): State<AppState>,
    CurrentUser(user): CurrentUser,
) -> AppResult<Json<BrandingView>> {
    ensure_system_action(&state, &user, Action::ManageBranding).await?;

    let prior = db::branding::get(&state.db).await?.logo_storage_name;
    db::branding::clear_logo(&state.db, user.user_id).await?;
    if let Some(old) = prior {
        let old_path = std::path::Path::new(&state.config.uploads_dir).join(&old);
        if let Err(err) = tokio::fs::remove_file(&old_path).await {
            tracing::warn!(error = ?err, %old, "failed to unlink reset brand logo");
        }
    }

    let branding = db::branding::get(&state.db).await?;
    Ok(Json(view(&branding)))
}
