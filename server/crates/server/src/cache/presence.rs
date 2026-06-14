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

/// Companion hash holding the client IP for each present connection, kept
/// separate from the timestamp hash so heartbeats (which carry no IP) never
/// clobber it. Admin-only data — never included in the public presence
/// broadcast. Set on WS connect, cleared on disconnect, and TTL-bounded so an
/// abandoned room's IPs eventually disappear even if a disconnect is missed.
fn ip_key(room: RoomId) -> String {
    format!("proom:presence:ip:{room}")
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

    /// Record the client IP for a present user. Called once on WS connect (not on
    /// heartbeats), kept in a hash separate from the timestamps. Best-effort: the
    /// caller ignores errors so a Redis hiccup never fails the connection.
    pub async fn presence_set_ip(
        &self,
        room: RoomId,
        user: UserId,
        ip: &str,
    ) -> anyhow::Result<()> {
        let _: () = self
            .client()
            .hset(ip_key(room), (user.to_string(), ip))
            .await
            .context("redis hset presence ip")?;
        // Mirror the timestamp hash's lifetime bound so abandoned rooms' IPs
        // eventually expire even if a disconnect is missed.
        let _: bool = self
            .client()
            .expire(ip_key(room), STALE_AFTER * 4, None)
            .await
            .context("redis expire presence ip")?;
        Ok(())
    }

    /// Drop a user's recorded IP on disconnect.
    pub async fn presence_remove_ip(&self, room: RoomId, user: UserId) -> anyhow::Result<()> {
        let _: i64 = self
            .client()
            .hdel(ip_key(room), user.to_string())
            .await
            .context("redis hdel presence ip")?;
        Ok(())
    }

    /// Fetch the recorded IP for every present user in a room as a
    /// `user_id -> ip` map. Used only by the admin presence endpoint.
    pub async fn presence_ips(&self, room: RoomId) -> anyhow::Result<HashMap<UserId, String>> {
        let entries: HashMap<String, String> = self
            .client()
            .hgetall(ip_key(room))
            .await
            .context("redis hgetall presence ip")?;
        Ok(entries
            .into_iter()
            .filter_map(|(field, ip)| {
                field
                    .parse::<uuid::Uuid>()
                    .ok()
                    .map(|uuid| (UserId::from_uuid(uuid), ip))
            })
            .collect())
    }
}
