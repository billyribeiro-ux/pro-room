//! Shared application state, cloned into every request handler. All fields are
//! cheap to clone (pools and handles are internally reference-counted).

use crate::cache::Cache;
use crate::config::Config;
use crate::realtime::RealtimeHub;
use sqlx::PgPool;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub db: PgPool,
    pub cache: Cache,
    pub hub: RealtimeHub,
}

impl AppState {
    pub fn new(config: Config, db: PgPool, cache: Cache, hub: RealtimeHub) -> Self {
        Self {
            config: Arc::new(config),
            db,
            cache,
            hub,
        }
    }
}
