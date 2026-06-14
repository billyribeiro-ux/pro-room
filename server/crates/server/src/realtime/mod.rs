//! The realtime hub: per-room fan-out that works across multiple server
//! instances.
//!
//! Each instance keeps an in-process `broadcast` channel per active room for its
//! locally connected WebSocket clients. Publishing goes to Redis Pub/Sub; a
//! single background dispatcher subscribes to all room channels and relays each
//! message into the matching local broadcast channel. Because publishes always
//! round-trip through Redis, local and remote clients receive events uniformly.

pub mod event;

use crate::cache::Cache;
use anyhow::Context as _;
use domain::RoomId;
use fred::prelude::*;
use fred::types::Message;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::sync::broadcast;

/// Capacity of each room's in-process broadcast channel. Slow consumers that lag
/// past this lose messages (and the WS layer closes them).
const CHANNEL_CAPACITY: usize = 256;

const CHANNEL_PREFIX: &str = "proom:room:";
const CHANNEL_PATTERN: &str = "proom:room:*";

#[derive(Clone)]
pub struct RealtimeHub {
    rooms: Arc<Mutex<HashMap<RoomId, broadcast::Sender<String>>>>,
    cache: Cache,
}

impl RealtimeHub {
    pub fn new(cache: Cache) -> Self {
        Self {
            rooms: Arc::new(Mutex::new(HashMap::new())),
            cache,
        }
    }

    /// Spawn the Redis→local dispatcher. Must be called once at startup.
    pub async fn start(&self) -> anyhow::Result<()> {
        let subscriber = self.cache.subscriber().await?;
        subscriber
            .psubscribe(CHANNEL_PATTERN)
            .await
            .context("psubscribe room pattern")?;

        let rooms = self.rooms.clone();
        let mut rx = subscriber.message_rx();
        tokio::spawn(async move {
            // Keep the subscriber alive for the lifetime of the task.
            let _subscriber = subscriber;
            loop {
                match rx.recv().await {
                    Ok(message) => dispatch(&rooms, &message),
                    Err(broadcast::error::RecvError::Lagged(n)) => {
                        tracing::warn!(lagged = n, "realtime dispatcher lagged");
                    }
                    Err(broadcast::error::RecvError::Closed) => break,
                }
            }
            tracing::warn!("realtime dispatcher stopped");
        });
        Ok(())
    }

    /// Subscribe to a room's local broadcast channel, creating it if needed.
    pub fn subscribe(&self, room: RoomId) -> broadcast::Receiver<String> {
        self.local_sender(room).subscribe()
    }

    /// Publish an event to a room (fanned out via Redis to all instances).
    pub async fn publish(&self, room: RoomId, payload: &str) -> anyhow::Result<()> {
        let channel = format!("{CHANNEL_PREFIX}{room}");
        self.cache.publish(&channel, payload).await
    }

    fn local_sender(&self, room: RoomId) -> broadcast::Sender<String> {
        let mut rooms = self.rooms.lock().expect("hub mutex poisoned");
        rooms
            .entry(room)
            .or_insert_with(|| broadcast::channel(CHANNEL_CAPACITY).0)
            .clone()
    }
}

fn dispatch(rooms: &Arc<Mutex<HashMap<RoomId, broadcast::Sender<String>>>>, message: &Message) {
    let Some(room) = room_from_channel(&message.channel) else {
        return;
    };
    let Some(payload) = message.value.as_string() else {
        return;
    };
    // Only deliver to rooms that have local subscribers; if none, drop.
    let sender = {
        let rooms = rooms.lock().expect("hub mutex poisoned");
        rooms.get(&room).cloned()
    };
    if let Some(sender) = sender {
        // Err means no active receivers; that's fine.
        let _ = sender.send(payload);
    }
}

fn room_from_channel(channel: &str) -> Option<RoomId> {
    let suffix = channel.strip_prefix(CHANNEL_PREFIX)?;
    suffix.parse::<uuid::Uuid>().ok().map(RoomId::from_uuid)
}
