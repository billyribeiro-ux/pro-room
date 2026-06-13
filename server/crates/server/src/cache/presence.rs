//! Per-room presence. Stored as a Redis hash `room -> {user_id: last_seen_unix}`
//! shared across all server instances. Entries older than [`STALE_AFTER`] are
//! considered gone and pruned lazily on read.

use super::Cache;
use anyhow::Context as _;
use domain::{RoomId, UserId};
use fred::prelude::*;
use std::collections::HashMap;
use time::OffsetDateTime;

/// A member is considered present if seen within this many seconds. Clients
/// heartbeat more frequently than this.
const STALE_AFTER: i64 = 30;

fn key(room: RoomId) -> String {
    format!("proom:presence:{room}")
}

impl Cache {
    /// Mark a user present in a room (used for both join and heartbeat).
    pub async fn presence_touch(&self, room: RoomId, user: UserId) -> anyhow::Result<()> {
        let now = OffsetDateTime::now_utc().unix_timestamp();
        let _: () = self
            .client()
            .hset(key(room), (user.to_string(), now))
            .await
            .context("redis hset presence")?;
        // Bound the key's lifetime so abandoned rooms eventually disappear.
        let _: bool = self
            .client()
            .expire(key(room), STALE_AFTER * 4, None)
            .await
            .context("redis expire presence")?;
        Ok(())
    }

    /// Remove a user from a room's presence.
    pub async fn presence_remove(&self, room: RoomId, user: UserId) -> anyhow::Result<()> {
        let _: i64 = self
            .client()
            .hdel(key(room), user.to_string())
            .await
            .context("redis hdel presence")?;
        Ok(())
    }

    /// List the users currently present in a room, pruning stale entries.
    pub async fn presence_list(&self, room: RoomId) -> anyhow::Result<Vec<UserId>> {
        let entries: HashMap<String, i64> = self
            .client()
            .hgetall(key(room))
            .await
            .context("redis hgetall presence")?;
        let cutoff = OffsetDateTime::now_utc().unix_timestamp() - STALE_AFTER;

        let mut present = Vec::new();
        let mut stale = Vec::new();
        for (field, seen) in entries {
            let Ok(uuid) = field.parse::<uuid::Uuid>() else {
                continue;
            };
            if seen >= cutoff {
                present.push(UserId::from_uuid(uuid));
            } else {
                stale.push(field);
            }
        }
        if !stale.is_empty() {
            let _: i64 = self
                .client()
                .hdel(key(room), stale)
                .await
                .context("redis hdel stale presence")?;
        }
        Ok(present)
    }
}
