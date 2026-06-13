//! A short-TTL cache of resolved sessions so most authenticated requests avoid a
//! Postgres round-trip. Postgres remains authoritative: on a cache miss we read
//! the database; on logout/revocation we delete the cache entry.

use super::Cache;
use crate::auth::session::SessionUser;
use anyhow::Context as _;
use fred::prelude::*;

/// How long a resolved session stays cached. Kept short so role/status changes
/// and revocations take effect quickly.
const TTL_SECONDS: i64 = 60;

fn key(token_hash: &str) -> String {
    format!("proom:session:{token_hash}")
}

impl Cache {
    pub async fn get_session(&self, token_hash: &str) -> anyhow::Result<Option<SessionUser>> {
        let raw: Option<String> = self
            .client()
            .get(key(token_hash))
            .await
            .context("redis get session")?;
        match raw {
            Some(json) => Ok(serde_json::from_str(&json).ok()),
            None => Ok(None),
        }
    }

    pub async fn put_session(&self, token_hash: &str, user: &SessionUser) -> anyhow::Result<()> {
        let json = serde_json::to_string(user).context("serialize session user")?;
        let _: () = self
            .client()
            .set(
                key(token_hash),
                json,
                Some(Expiration::EX(TTL_SECONDS)),
                None,
                false,
            )
            .await
            .context("redis set session")?;
        Ok(())
    }

    pub async fn drop_session(&self, token_hash: &str) -> anyhow::Result<()> {
        let _: i64 = self
            .client()
            .del(key(token_hash))
            .await
            .context("redis del session")?;
        Ok(())
    }
}
