//! Redis-backed cache and message bus (via `fred`), sized for the room being
//! under load. Redis is always a cache/bus here — never the source of truth, so
//! every value stored is either reconstructible from Postgres or inherently
//! ephemeral (presence, rate-limit counters).

pub mod presence;
pub mod ratelimit;
pub mod session_cache;

use anyhow::Context as _;
use fred::clients::SubscriberClient;
use fred::prelude::*;

/// A connected Redis client plus the URL (used to spin up a dedicated
/// subscriber connection for pub/sub).
#[derive(Clone)]
pub struct Cache {
    client: Client,
    url: String,
}

impl Cache {
    /// Connect and wait for the initial connection to be established.
    pub async fn connect(url: &str) -> anyhow::Result<Self> {
        let config = Config::from_url(url).context("invalid REDIS_URL")?;
        let client = Builder::from_config(config)
            .build()
            .context("failed to build redis client")?;
        // `init` spawns the connection task; the handle keeps running if dropped.
        client.init().await.context("failed to connect to redis")?;
        Ok(Self {
            client,
            url: url.to_owned(),
        })
    }

    #[must_use]
    pub fn client(&self) -> &Client {
        &self.client
    }

    /// Publish a message on a channel; returns the number of subscribers reached.
    pub async fn publish(&self, channel: &str, payload: &str) -> anyhow::Result<()> {
        let _: i64 = self
            .client
            .publish(channel, payload)
            .await
            .context("redis publish failed")?;
        Ok(())
    }

    /// Build and connect a dedicated subscriber client for pub/sub. Subscribers
    /// must use their own connection, separate from command traffic.
    pub async fn subscriber(&self) -> anyhow::Result<SubscriberClient> {
        let config = Config::from_url(&self.url).context("invalid REDIS_URL")?;
        let sub = Builder::from_config(config)
            .build_subscriber_client()
            .context("failed to build subscriber client")?;
        sub.init().await.context("failed to connect subscriber")?;
        Ok(sub)
    }
}
