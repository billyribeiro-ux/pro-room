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
use domain::{RoomId, UserId};
use fred::prelude::*;
use fred::types::Message;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use tokio::sync::{Notify, broadcast};

/// Capacity of each room's in-process broadcast channel. Slow consumers that lag
/// past this lose messages (and the WS layer closes them).
const CHANNEL_CAPACITY: usize = 256;

const CHANNEL_PREFIX: &str = "proom:room:";
const CHANNEL_PATTERN: &str = "proom:room:*";

/// One live WebSocket connection registered with the hub. `id` is a process-wide
/// monotonic counter, so a higher `id` means a newer connection — that's how
/// "keep each user's most recent session" is decided. `close` is signalled to ask
/// that one socket's read loop to shut down (used by kick-duplicates).
struct Conn {
    id: u64,
    user: UserId,
    close: Arc<Notify>,
}

/// Handle returned to a WS task when it registers: its connection `id` (used to
/// deregister on disconnect) and the `close` signal it must select on.
pub struct ConnHandle {
    pub id: u64,
    pub close: Arc<Notify>,
}

#[derive(Clone)]
pub struct RealtimeHub {
    rooms: Arc<Mutex<HashMap<RoomId, broadcast::Sender<String>>>>,
    /// Per-room registry of live local connections, used to drop duplicate
    /// sessions and to ref-count presence (only the user's last local socket
    /// clears presence on disconnect). Local to this instance — cross-instance
    /// duplicates are not closed (acceptable: dedup is a single-instance concern).
    conns: Arc<Mutex<HashMap<RoomId, Vec<Conn>>>>,
    /// Monotonic source of connection ids (also encodes recency).
    next_conn_id: Arc<AtomicU64>,
    cache: Cache,
}

impl RealtimeHub {
    pub fn new(cache: Cache) -> Self {
        Self {
            rooms: Arc::new(Mutex::new(HashMap::new())),
            conns: Arc::new(Mutex::new(HashMap::new())),
            next_conn_id: Arc::new(AtomicU64::new(0)),
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

    /// Register a connection for `user` in `room`. The returned [`ConnHandle`]
    /// carries the connection id (pass it to [`Self::unregister`] on disconnect)
    /// and the `close` signal the socket must `select!` on so kick-duplicates can
    /// shut it down.
    pub fn register(&self, room: RoomId, user: UserId) -> ConnHandle {
        let id = self.next_conn_id.fetch_add(1, Ordering::Relaxed);
        let close = Arc::new(Notify::new());
        let mut conns = self.conns.lock().expect("hub conns mutex poisoned");
        conns.entry(room).or_default().push(Conn {
            id,
            user,
            close: close.clone(),
        });
        ConnHandle { id, close }
    }

    /// Deregister a connection. Returns `true` when it was the user's **last**
    /// local connection in the room — the caller uses that to decide whether to
    /// clear presence (a user with another open tab stays present).
    pub fn unregister(&self, room: RoomId, conn_id: u64) -> bool {
        let mut conns = self.conns.lock().expect("hub conns mutex poisoned");
        let Some(list) = conns.get_mut(&room) else {
            return true;
        };
        let user = list.iter().find(|c| c.id == conn_id).map(|c| c.user);
        list.retain(|c| c.id != conn_id);
        let was_last = match user {
            Some(u) => !list.iter().any(|c| c.user == u),
            None => true,
        };
        if list.is_empty() {
            conns.remove(&room);
        }
        was_last
    }

    /// Signal every duplicate connection in `room` (all but each user's newest)
    /// to close. Returns how many were signalled. The closed sockets run their
    /// own cleanup (deregister + presence refresh) when their read loop exits.
    pub fn kick_duplicates(&self, room: RoomId) -> usize {
        let conns = self.conns.lock().expect("hub conns mutex poisoned");
        let Some(list) = conns.get(&room) else {
            return 0;
        };
        // The newest (highest id) connection per user is the keeper.
        let mut newest: HashMap<UserId, u64> = HashMap::new();
        for c in list {
            let e = newest.entry(c.user).or_insert(c.id);
            if c.id > *e {
                *e = c.id;
            }
        }
        let mut signalled = 0;
        for c in list {
            if newest.get(&c.user).copied() != Some(c.id) {
                c.close.notify_one();
                signalled += 1;
            }
        }
        signalled
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
