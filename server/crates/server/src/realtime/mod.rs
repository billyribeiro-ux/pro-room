//! The realtime hub: per-room fan-out that works across multiple server
//! instances.
//!
//! Each instance keeps an in-process `broadcast` channel per active room for its
//! locally connected WebSocket clients. Publishing goes to Redis Pub/Sub; a
//! single background dispatcher subscribes to all room channels and relays each
//! message into the matching local broadcast channel. Because publishes always
//! round-trip through Redis, local and remote clients receive events uniformly.
//!
//! ## Per-user targeted delivery (private messages)
//!
//! Room fan-out reaches every client in a room, which is wrong for 1:1 private
//! messages — those must reach only the two participants. A parallel path exists
//! for that: a per-`(room, user)` Redis channel `proom:pmuser:{room}:{user}` with
//! its own in-process broadcast map. [`RealtimeHub::publish_to_user`] writes there
//! (Redis fan-out, so a recipient connected to a *different* instance is still
//! reached), and each WebSocket subscribes to its own `(room, user)` channel via
//! [`RealtimeHub::subscribe_user`]. A single dispatcher psubscribes to both
//! patterns and routes each message into the matching room or user channel. No
//! payload published with `publish_to_user` ever touches the room channel, so the
//! rest of the room never sees a private message.

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

/// Per-user (private-message) channel prefix and pattern. The channel name is
/// `proom:pmuser:{room}:{user}` — both ids are plain UUIDs, so `room_user_from_channel`
/// splits on the single `:` that separates them after this prefix.
const USER_CHANNEL_PREFIX: &str = "proom:pmuser:";
const USER_CHANNEL_PATTERN: &str = "proom:pmuser:*";

/// Shared map of room-wide local broadcast senders, keyed by room.
type RoomChannels = Arc<Mutex<HashMap<RoomId, broadcast::Sender<String>>>>;

/// Shared map of per-user (private-message) local broadcast senders, keyed by the
/// `(room, user)` pair so a private payload can never land on a room-wide channel.
type UserChannels = Arc<Mutex<HashMap<(RoomId, UserId), broadcast::Sender<String>>>>;

/// One live WebSocket connection registered with the hub. `id` is a process-wide
/// monotonic counter, so a higher `id` means a newer connection — that's how
/// "keep each user's most recent session" is decided. `close` is signalled to ask
/// that one socket's read loop to shut down (kick-duplicates / force-kick).
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

/// In-memory registry of live local WebSocket connections, used to drop duplicate
/// sessions, force-close a kicked user, and ref-count presence. Pure in-process
/// state (no I/O), so it is unit-testable in isolation from the Redis-backed
/// [`Cache`]. Local to this instance — cross-instance dedup is out of scope.
#[derive(Default)]
struct ConnRegistry {
    conns: Mutex<HashMap<RoomId, Vec<Conn>>>,
    next_id: AtomicU64,
}

impl ConnRegistry {
    fn register(&self, room: RoomId, user: UserId) -> ConnHandle {
        let id = self.next_id.fetch_add(1, Ordering::Relaxed);
        let close = Arc::new(Notify::new());
        let mut conns = self.conns.lock().expect("hub conns mutex poisoned");
        conns.entry(room).or_default().push(Conn {
            id,
            user,
            close: close.clone(),
        });
        ConnHandle { id, close }
    }

    /// Returns `true` when `conn_id` was the user's last local connection in the
    /// room (the caller uses that to decide whether to clear presence).
    fn unregister(&self, room: RoomId, conn_id: u64) -> bool {
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

    /// Signal every duplicate connection (all but each user's newest) to close.
    /// Returns how many were signalled.
    fn kick_duplicates(&self, room: RoomId) -> usize {
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

    /// Signal every connection for `user` to close. Returns how many were
    /// signalled. Used when an admin kicks a user — server-side defense in depth.
    fn close_user(&self, room: RoomId, user: UserId) -> usize {
        let conns = self.conns.lock().expect("hub conns mutex poisoned");
        let Some(list) = conns.get(&room) else {
            return 0;
        };
        let mut signalled = 0;
        for c in list {
            if c.user == user {
                c.close.notify_one();
                signalled += 1;
            }
        }
        signalled
    }
}

#[derive(Clone)]
pub struct RealtimeHub {
    rooms: RoomChannels,
    /// Per-`(room, user)` in-process broadcast channels for private-message
    /// delivery. Separate from `rooms` so a private payload can never be routed
    /// onto a room-wide channel.
    user_rooms: UserChannels,
    registry: Arc<ConnRegistry>,
    cache: Cache,
}

impl RealtimeHub {
    pub fn new(cache: Cache) -> Self {
        Self {
            rooms: Arc::new(Mutex::new(HashMap::new())),
            user_rooms: Arc::new(Mutex::new(HashMap::new())),
            registry: Arc::new(ConnRegistry::default()),
            cache,
        }
    }

    /// Spawn the Redis→local dispatcher. Must be called once at startup. It
    /// subscribes to both the room-wide pattern and the per-user (private-message)
    /// pattern, routing each message into the matching local channel.
    pub async fn start(&self) -> anyhow::Result<()> {
        let subscriber = self.cache.subscriber().await?;
        // Spawn fred's managed-subscription task BEFORE (p)subscribing so it tracks
        // these patterns and automatically replays them whenever the connection
        // drops and the reconnect policy restores it. Without this the dispatcher
        // task survives a Redis blip but the subscriber comes back subscribed to
        // nothing, silently starving realtime (chat/alerts/presence) for the rest
        // of the process lifetime.
        let resubscribe = subscriber.manage_subscriptions();
        subscriber
            .psubscribe(CHANNEL_PATTERN)
            .await
            .context("psubscribe room pattern")?;
        subscriber
            .psubscribe(USER_CHANNEL_PATTERN)
            .await
            .context("psubscribe user pattern")?;

        let rooms = self.rooms.clone();
        let user_rooms = self.user_rooms.clone();
        let mut rx = subscriber.message_rx();
        tokio::spawn(async move {
            // Keep the subscriber and its managed-resubscribe task alive for the
            // lifetime of the dispatcher.
            let _subscriber = subscriber;
            let _resubscribe = resubscribe;
            loop {
                match rx.recv().await {
                    Ok(message) => dispatch(&rooms, &user_rooms, &message),
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

    /// Subscribe to a single `(room, user)` private-message channel, creating it
    /// if needed. Each WebSocket subscribes to its own pair so it receives only
    /// payloads targeted at that user.
    pub fn subscribe_user(&self, room: RoomId, user: UserId) -> broadcast::Receiver<String> {
        self.user_local_sender(room, user).subscribe()
    }

    /// Publish a payload to exactly one user in a room (the private-message path).
    /// Fanned out via Redis so a recipient connected to a *different* instance is
    /// still reached — this must not rely on the in-memory [`ConnRegistry`], which
    /// is local to this instance and would silently drop cross-instance recipients.
    ///
    /// PRIVACY-CRITICAL: the channel is `proom:pmuser:{room}:{user}`, which the
    /// dispatcher routes only into that user's local channel. It never touches the
    /// room-wide channel, so no other room member can receive this payload.
    pub async fn publish_to_user(
        &self,
        room: RoomId,
        user: UserId,
        payload: &str,
    ) -> anyhow::Result<()> {
        let channel = format!("{USER_CHANNEL_PREFIX}{room}:{user}");
        self.cache.publish(&channel, payload).await
    }

    /// Register a connection for `user` in `room`. The returned [`ConnHandle`]
    /// carries the connection id (pass it to [`Self::unregister`] on disconnect)
    /// and the `close` signal the socket must `select!` on so it can be shut down.
    pub fn register(&self, room: RoomId, user: UserId) -> ConnHandle {
        self.registry.register(room, user)
    }

    /// Deregister a connection. Returns `true` when it was the user's **last**
    /// local connection in the room — the caller uses that to decide whether to
    /// clear presence (a user with another open tab stays present).
    pub fn unregister(&self, room: RoomId, conn_id: u64) -> bool {
        self.registry.unregister(room, conn_id)
    }

    /// Signal every duplicate connection in `room` (all but each user's newest)
    /// to close. Returns how many were signalled. The closed sockets run their own
    /// cleanup (deregister + presence refresh) when their read loop exits.
    pub fn kick_duplicates(&self, room: RoomId) -> usize {
        self.registry.kick_duplicates(room)
    }

    /// Force every connection for `user` in `room` to close. Returns how many were
    /// signalled. Used when an admin kicks a user, so the server drops them even if
    /// their client ignores the `kicked` event.
    pub fn close_user(&self, room: RoomId, user: UserId) -> usize {
        self.registry.close_user(room, user)
    }

    fn local_sender(&self, room: RoomId) -> broadcast::Sender<String> {
        let mut rooms = self.rooms.lock().expect("hub mutex poisoned");
        rooms
            .entry(room)
            .or_insert_with(|| broadcast::channel(CHANNEL_CAPACITY).0)
            .clone()
    }

    fn user_local_sender(&self, room: RoomId, user: UserId) -> broadcast::Sender<String> {
        let mut user_rooms = self.user_rooms.lock().expect("hub user mutex poisoned");
        user_rooms
            .entry((room, user))
            .or_insert_with(|| broadcast::channel(CHANNEL_CAPACITY).0)
            .clone()
    }
}

fn dispatch(rooms: &RoomChannels, user_rooms: &UserChannels, message: &Message) {
    let Some(payload) = message.value.as_string() else {
        return;
    };
    // Per-user (private-message) channels are checked first: their prefix is a
    // strict superset shape of the room prefix only by coincidence of the
    // `proom:` namespace, so we match the more specific `pmuser:` form before the
    // room form. A user payload routes ONLY into that user's local channel.
    if let Some((room, user)) = room_user_from_channel(&message.channel) {
        let sender = {
            let user_rooms = user_rooms.lock().expect("hub user mutex poisoned");
            user_rooms.get(&(room, user)).cloned()
        };
        if let Some(sender) = sender {
            // Err means no active receivers; that's fine.
            let _ = sender.send(payload);
        }
        return;
    }

    let Some(room) = room_from_channel(&message.channel) else {
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

/// Parse a `proom:pmuser:{room}:{user}` channel into its `(room, user)` pair.
/// Returns `None` for any other channel shape (e.g. the room-wide channel).
fn room_user_from_channel(channel: &str) -> Option<(RoomId, UserId)> {
    let suffix = channel.strip_prefix(USER_CHANNEL_PREFIX)?;
    let (room, user) = suffix.split_once(':')?;
    let room = room.parse::<uuid::Uuid>().ok().map(RoomId::from_uuid)?;
    let user = user.parse::<uuid::Uuid>().ok().map(UserId::from_uuid)?;
    Some((room, user))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    fn room() -> RoomId {
        RoomId::from_uuid(uuid::Uuid::new_v4())
    }
    fn user() -> UserId {
        UserId::from_uuid(uuid::Uuid::new_v4())
    }

    #[test]
    fn channel_parsers_do_not_cross_contaminate() {
        let r = room();
        let u = user();
        let room_ch = format!("{CHANNEL_PREFIX}{r}");
        let user_ch = format!("{USER_CHANNEL_PREFIX}{r}:{u}");

        // The room-wide channel never parses as a per-user channel (so a room
        // payload can't be misrouted into one user's private stream)…
        assert_eq!(room_from_channel(&room_ch), Some(r));
        assert_eq!(room_user_from_channel(&room_ch), None);

        // …and the per-user channel never parses as a room channel (so a private
        // payload can't be fanned out room-wide).
        assert_eq!(room_user_from_channel(&user_ch), Some((r, u)));
        assert_eq!(room_from_channel(&user_ch), None);
    }

    /// A connection's close signal fires iff its `notified()` resolves promptly
    /// (`notify_one` leaves a stored permit when there is no waiter yet).
    async fn was_signalled(h: &ConnHandle) -> bool {
        tokio::time::timeout(Duration::from_millis(50), h.close.notified())
            .await
            .is_ok()
    }

    #[test]
    fn register_assigns_monotonic_ids() {
        let reg = ConnRegistry::default();
        let rid = room();
        let first = reg.register(rid, user());
        let second = reg.register(rid, user());
        assert!(
            second.id > first.id,
            "newer connection must get a higher id"
        );
    }

    #[test]
    fn unregister_reports_last_local_connection() {
        let reg = ConnRegistry::default();
        let rid = room();
        let uid = user();
        let first = reg.register(rid, uid);
        let second = reg.register(rid, uid);
        // The user still has `second` after dropping `first`.
        assert!(
            !reg.unregister(rid, first.id),
            "not the user's last connection"
        );
        // Now `second` is the last.
        assert!(reg.unregister(rid, second.id), "the user's last connection");
        // Unknown id on an empty room reports last.
        assert!(reg.unregister(rid, 999));
    }

    #[tokio::test]
    async fn kick_duplicates_keeps_newest_per_user() {
        let reg = ConnRegistry::default();
        let rid = room();
        let uid = user();
        let other = user();
        let oldest = reg.register(rid, uid);
        let middle = reg.register(rid, uid);
        let newest = reg.register(rid, uid);
        let other_conn = reg.register(rid, other); // sole connection for `other`

        assert_eq!(
            reg.kick_duplicates(rid),
            2,
            "two older sessions of the user"
        );
        assert!(was_signalled(&oldest).await, "oldest session closed");
        assert!(was_signalled(&middle).await, "middle session closed");
        assert!(!was_signalled(&newest).await, "newest session kept");
        assert!(!was_signalled(&other_conn).await, "other user untouched");
    }

    #[tokio::test]
    async fn close_user_signals_all_of_that_users_connections() {
        let reg = ConnRegistry::default();
        let rid = room();
        let uid = user();
        let other = user();
        let first = reg.register(rid, uid);
        let second = reg.register(rid, uid);
        let keep = reg.register(rid, other);

        assert_eq!(reg.close_user(rid, uid), 2);
        assert!(was_signalled(&first).await);
        assert!(was_signalled(&second).await);
        assert!(!was_signalled(&keep).await, "other user is unaffected");
    }
}
