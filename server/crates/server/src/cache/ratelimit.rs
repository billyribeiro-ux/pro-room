//! Fixed-window rate limiting using atomic Redis counters. The first hit in a
//! window sets the key's expiry; subsequent hits increment it. Coarse but
//! effective for protecting login, alert posting, and magic-link requests.

use super::Cache;
use anyhow::Context as _;
use fred::prelude::*;

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
        if count == 1 {
            let _: bool = self
                .client()
                .expire(&key, window_seconds, None)
                .await
                .context("redis expire")?;
        }
        let count = u64::try_from(count.max(0)).unwrap_or(u64::MAX);
        Ok(count <= limit)
    }
}
