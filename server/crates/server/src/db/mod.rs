//! `PostgreSQL` persistence: the connection pool, migrations, and repositories.
//!
//! Repositories are thin functions over `sqlx`. Postgres enums are read as text
//! (`column::text`) and parsed into domain types, which keeps the `domain` crate
//! free of any persistence dependency.

pub mod alerts;
pub mod audit;
pub mod files;
pub mod identities;
pub mod magic;
pub mod members;
pub mod messages;
pub mod notes;
pub mod oauth;
pub mod polls;
pub mod private_messages;
pub mod questions;
pub mod reactions;
pub mod rooms;
pub mod sessions;
pub mod users;

use anyhow::Context as _;
use sqlx::PgPool;
use sqlx::postgres::PgPoolOptions;

/// Connect to Postgres and run pending migrations.
pub async fn connect(database_url: &str) -> anyhow::Result<PgPool> {
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(database_url)
        .await
        .context("failed to connect to postgres")?;
    sqlx::migrate!("../../migrations")
        .run(&pool)
        .await
        .context("failed to run migrations")?;
    Ok(pool)
}
