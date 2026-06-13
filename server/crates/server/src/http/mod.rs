//! HTTP surface: router assembly, middleware (CORS, tracing), and route modules.

pub mod alerts;
pub mod auth;
pub mod files;
pub mod messages;
pub mod notes;
pub mod rooms;
pub mod users;
pub mod ws;

use crate::state::AppState;
use axum::Router;
use axum::http::{HeaderValue, Method, header};
use axum::routing::get;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

/// Build the full application router.
pub fn router(state: AppState) -> Router {
    let cors = build_cors(&state);

    Router::new()
        .route("/health", get(health))
        .merge(auth::router())
        .merge(rooms::router())
        .merge(alerts::router())
        .merge(files::router())
        .merge(messages::router())
        .merge(notes::router())
        .merge(users::router())
        .merge(ws::router())
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(state)
}

async fn health() -> &'static str {
    "ok"
}

fn build_cors(state: &AppState) -> CorsLayer {
    let origins: Vec<HeaderValue> = state
        .config
        .cors_origins
        .iter()
        .filter_map(|o| o.parse().ok())
        .collect();

    CorsLayer::new()
        .allow_origin(origins)
        .allow_credentials(true)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PATCH,
            Method::PUT,
            Method::DELETE,
        ])
        .allow_headers([header::CONTENT_TYPE, header::ACCEPT])
}
