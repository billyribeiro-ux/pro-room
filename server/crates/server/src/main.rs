//! `ProTradingRoom` backend: an Axum service that owns identity, authorization
//! (RBAC + ABAC), room/alert/chat CRUD, `LiveKit` token minting, and the realtime
//! hub. Postgres is the source of truth; Redis is cache + pub/sub bus.

mod auth;
mod authorization;
mod cache;
mod config;
mod crypto;
mod db;
mod error;
mod geo;
mod http;
mod livekit;
mod realtime;
mod state;
mod util;

use crate::cache::Cache;
use crate::config::Config;
use crate::realtime::RealtimeHub;
use crate::state::AppState;
use anyhow::Context as _;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    init_tracing();

    // Install the pure-Rust *ring* provider as rustls's process-wide default
    // crypto provider. reqwest is built with `rustls-no-provider`, so it relies
    // on this being set before the first HTTPS client is constructed (OAuth
    // token exchange + geo lookups). Chosen over aws-lc-rs to keep the build
    // free of native cmake/clang dependencies.
    rustls::crypto::ring::default_provider()
        .install_default()
        .expect("install ring as the default rustls CryptoProvider");

    let config = Config::from_env().context("loading configuration")?;
    let bind_addr = config.bind_addr.clone();

    tokio::fs::create_dir_all(&config.uploads_dir)
        .await
        .with_context(|| format!("creating uploads dir {}", config.uploads_dir))?;

    let db = db::connect(&config.database_url).await?;
    let cache = Cache::connect(&config.redis_url).await?;

    let hub = RealtimeHub::new(cache.clone());
    hub.start().await.context("starting realtime hub")?;

    let geo = geo::GeoResolver::new();

    let state = AppState::new(config, db, cache, hub, geo);
    let app = http::router(state);

    let listener = tokio::net::TcpListener::bind(&bind_addr)
        .await
        .with_context(|| format!("binding {bind_addr}"))?;
    tracing::info!(%bind_addr, "pro-room server listening");
    // `into_make_service_with_connect_info` makes the peer `SocketAddr` available
    // to handlers via `ConnectInfo` — used as the fallback client-IP source when
    // no forwarding header is present (direct connections in local/dev).
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<std::net::SocketAddr>(),
    )
    .await
    .context("server error")?;
    Ok(())
}

fn init_tracing() {
    use tracing_subscriber::{EnvFilter, fmt};
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info,sqlx=warn,tower_http=info"));
    fmt().with_env_filter(filter).init();
}
