//! Fixed-window rate limiting using atomic Redis counters. The first hit in a
//! window sets the key's expiry; subsequent hits increment it. Coarse but
//! effective for protecting login, alert posting, and magic-link requests.

use super::Cache;
use anyhow::Context as _;
use fred::prelude::*;
use fred::types::ExpireOptions;

impl Cache {
    /// Record a hit against `bucket` and report whether it is still within
    /// `limit` over `window_seconds`. Returns `true` while allowed.
    pub async fn rate_limit(
        &self,
        bucket: &str,
        limit: u64,
        window_seconds: i64,
    ) -> anyhow::Result<bool> {
        let key = format!("proom:rl:{bucket}");
        let count: i64 = self.client().incr(&key).await.context("redis incr")?;
        // Assert the TTL with NX (sets it only when the key currently has none).
        // On the first hit this bounds the window; on later hits it is a no-op —
        // EXCEPT when a previous EXPIRE was lost (e.g. the process died between the
        // INCR and the EXPIRE). Without this, that key would carry no TTL and wedge
        // the bucket at/over the limit forever, self-DoSing the user; NX heals it on
        // the next hit while preserving fixed-window semantics.
        let _: bool = self
            .client()
            .expire(&key, window_seconds, Some(ExpireOptions::NX))
            .await
            .context("redis expire")?;
        let count = u64::try_from(count.max(0)).unwrap_or(u64::MAX);
        Ok(count <= limit)
    }
}
