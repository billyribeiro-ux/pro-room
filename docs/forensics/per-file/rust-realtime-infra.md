# Forensic audit — rust-realtime-infra

READ-ONLY, doc-grounded audit. Repo `/home/user/pro-room`, crate `server/crates/server`.

**Tooling note:** No Rust MCP server is available in this environment. Authoritative
references are **docs.rs pages fetched live via WebFetch** (quoted per file below) plus
**live cargo** (`cargo 1.94.1`). I modified no source.

**Established baseline (re-verified live):** `cargo clippy --bin server` → `Finished`,
**exit 0, 0 warnings**. Workspace’s 25 tests pass (cited as given). Targeted clippy was
run only to confirm the baseline, per instructions.

Severity legend: **CRIT** / **HIGH** / **MED** / **LOW** / **NIT**.

---

## realtime/event.rs
- **LOC** 126 · **purpose** `RoomEvent` enum (the WS/Redis JSON wire form) + `to_json`.
- **DOCS.RS PULLED** serde derive (tagged enums) — internally-tagged `#[serde(tag="type")]`.
- **Findings**
  - LOW · event.rs:80-87 · *privacy-by-convention* · `PrivateMessage` lives in the same
    `RoomEvent` enum as room-wide variants; isolation is enforced only by the doc comment +
    the caller choosing `publish_to_user`. The type system does not prevent passing a
    `PrivateMessage` to `RealtimeHub::publish`. Fix (optional): a distinct `UserEvent` type
    for the per-user path so the compiler enforces the boundary. The runtime channel split
    (mod.rs) is correct; this is defense-in-depth.
  - NIT · event.rs:123-124 · *API-guidelines C-GETTER/infallible* · `to_json` swallows a
    serialize error into `"{}"`. Acceptable for plain-data shapes (documented), but a
    `tracing::warn!` on the impossible branch would surface a future regression.

## realtime/mod.rs
- **LOC** 447 · **purpose** the realtime hub: per-room + per-user in-process `broadcast`
  fan-out, Redis psubscribe dispatcher, in-memory `ConnRegistry` (dedup / kick / presence
  ref-count).
- **DOCS.RS PULLED**
  - `fred::clients::SubscriberClient` — *“`manage_subscriptions()` … spawns a background
    task that will automatically re-subscribe to any channels or channel patterns used by
    the client”* after disconnects; also `resubscribe_all()`. `message_rx()` yields
    `message.value` / `message.channel`.
  - `tokio::sync::broadcast` — *“If a value is sent when the channel is at capacity, the
    oldest value … is released … receiver … will return `RecvError::Lagged`.”*
  - `std::sync::Mutex` vs tokio (see below): std Mutex must not be held across `.await`.
- **Findings**
  - **HIGH** · mod.rs:181-209 · *fred resubscription on reconnect* · `start()` calls
    `psubscribe` once but never calls **`manage_subscriptions()`**. Per the SubscriberClient
    docs, automatic re-subscription on reconnect is **opt-in** via that method. After any
    Redis connection drop/failover, fred reconnects but the client is **no longer subscribed
    to `proom:room:*` / `proom:pmuser:*`** — the dispatcher’s `rx.recv()` keeps returning
    `Ok` of nothing and the hub silently stops delivering all realtime events (alerts, chat,
    presence, PMs) cluster-wide until restart. Fix: call
    `subscriber.manage_subscriptions()` before/after the `psubscribe` calls (fred’s documented
    pattern), or re-issue `psubscribe` on the reconnect event.
  - **MED** · mod.rs:194-208 · *dispatcher has no resubscribe/health on `Closed`* · on
    `RecvError::Closed` the task `break`s and logs `"realtime dispatcher stopped"` — the hub
    is then permanently dead with no restart/supervision. Combined with the HIGH above, a
    single transient Redis event can wedge realtime for the process lifetime. Fix: supervise
    (respawn `start`) or loop with backoff.
  - LOW · mod.rs:308,323 · *broadcast send-with-no-receivers* · `let _ = sender.send(payload)`
    discards `SendError` when 0 receivers — intended and documented (“Err means no active
    receivers; that's fine”). Correct; noted for completeness.
  - **PASS — std Mutex across await:** every `rooms` / `user_rooms` / `conns.lock()` guard is
    scoped (e.g. `local_sender` returns a clone; `dispatch` clones the sender inside a block
    then drops the guard before `.send`). No guard is held across an `.await`, matching the
    tokio guidance *“virtually never leads to correct concurrent code … can easily lead to
    deadlocks.”* Using `std::sync::Mutex` here is the **preferred** choice per the same docs
    (data, not IO). Good.
  - **PASS — room vs PM channel isolation:** `dispatch` matches the more-specific
    `pmuser:` form first; `room_user_from_channel` / `room_from_channel` are mutually
    exclusive and covered by `channel_parsers_do_not_cross_contaminate`. The privacy
    boundary (PM never on room channel) holds at runtime.
  - NIT · mod.rs:284-290 · *user_rooms unbounded growth* · `user_local_sender` inserts a
    `(room,user)` sender on first PM subscribe but nothing prunes the map when the last
    receiver drops (unlike `rooms`, which also never prunes). Long-lived process → slow map
    growth proportional to distinct `(room,user)` seen. Low impact (one `Sender` each); worth
    a cleanup on `unregister` if rooms churn.

## cache/mod.rs
- **LOC** 62 · **purpose** `Cache`: fred `Client` wrapper + dedicated `SubscriberClient`
  factory; `publish`.
- **DOCS.RS PULLED** `fred` `Builder::from_config` / `build_subscriber_client` / `init`;
  SubscriberClient must use its own connection (matches the doc-comment rationale).
- **Findings**
  - LOW · mod.rs:54-61 · *subscriber resubscription belongs here too* · `subscriber()` builds
    a fresh `SubscriberClient` but does not enable `manage_subscriptions`; this is the root of
    the realtime/mod.rs HIGH. Either enable it here at build time or document that the caller
    must. Cross-reference the HIGH finding.
  - NIT · mod.rs:43-50 · *publish drops subscriber count* · `publish` returns `()` and
    discards the `i64` reach count; presence/PM correctness doesn’t need it, but logging 0
    reach could surface a fan-out outage. Optional.

## cache/presence.rs
- **LOC** 140 · **purpose** Redis-hash presence (`room → {user: last_seen}`) + companion IP
  hash; lazy stale-prune on read; TTL-bounded.
- **DOCS.RS PULLED** fred hash ops `hset`/`hdel`/`hgetall`/`expire`; `time::OffsetDateTime`.
- **Findings**
  - **MED** · presence.rs:31-45 · *touch / expire TTL race vs ref-counting* · `presence_touch`
    issues `hset` then a **separate** `expire(key, STALE_AFTER*4)`. The two are not atomic; if
    the process dies between them the hash has no TTL until the next successful touch. More
    importantly the cleanup model is **last-writer / lazy**: presence is ref-counted in-process
    (ws.rs `unregister` → `presence_remove` only on last local socket) but Redis presence is a
    single shared hash keyed by user with **no per-connection ref-count**. Two tabs of the same
    user on **two different instances**: instance A’s disconnect calls `presence_remove(user)`
    and wipes the user even though instance B still has them present (until B’s next heartbeat
    re-adds them ≤30s later — a visible flap). Fix: store a count or per-conn member, or rely
    solely on the staleness sweep and make `presence_remove` a no-op for multi-instance. At
    minimum, document the flap. (Single-instance is correct — ws.rs ref-counts locally.)
  - LOW · presence.rs:48-55 · *cross-instance remove is unconditional* · `presence_remove`
    `hdel`s the user regardless of other instances; see MED. Lazy stale-prune (list, lines
    64-85) is the real safety net and is correct (`seen >= cutoff`).
  - **PASS — IP hash isolation:** IPs kept in a separate `ip_key` hash, never in the public
    presence broadcast (confirmed: ws.rs `publish_presence` sends only ids+names; `presence_ips`
    is admin-only). Matches the doc comment. Good. TTL mirrors the timestamp hash.

## cache/ratelimit.rs
- **LOC** 30 · **purpose** fixed-window limiter: `incr` then set `expire` on first hit.
- **DOCS.RS PULLED** fred `incr` / `expire` (atomic single-key counter semantics).
- **Findings**
  - **MED** · ratelimit.rs:19-26 · *first-hit TTL race → permanent key on crash* · `incr`
    and `expire` are two round-trips. If the key is created (`count == 1`) but the process
    dies / the `expire` call fails before it lands, the counter has **no TTL** and the bucket
    is wedged forever (every later request sees `count > limit` and is rate-limited
    indefinitely). This is the classic INCR/EXPIRE race the Redis docs warn about. Fix: a
    `SET key 1 EX window NX` + `INCR` Lua script, or `incr` then *always* `expire` (idempotent
    refresh, turning it into a sliding-ish window), accepting the minor semantic change. Note
    the `expire` result `bool` is already captured but a failure only surfaces via `?`, not on
    the `count>1` path. Callers (auth login `10/60`, magic `3/300`, msg/alert/poll/reaction)
    are all login/abuse-protection paths, so a wedged bucket is a self-inflicted DoS on a real
    user/email.
  - LOW · ratelimit.rs:27-28 · *off-by-window on `expire` failure* · when `expire` returns
    `false` (key vanished between incr and expire) the window silently resets; acceptable but
    untracked. `u64::try_from(...).unwrap_or(u64::MAX)` clamp is correct and panic-free.

## cache/session_cache.rs
- **LOC** 55 · **purpose** 60s TTL cache of resolved `SessionUser` (Postgres authoritative).
- **DOCS.RS PULLED** fred `get`/`set` with `Expiration::EX`; `del`.
- **Findings**
  - LOW · session_cache.rs:25-28 · *silent deserialize drop on schema drift* · `get_session`
    maps a malformed/old-schema cached JSON to `None` via `from_str(&json).ok()` — falls back
    to DB (correct, fail-safe) but logs nothing, so a `SessionUser` shape change that
    invalidates every cache entry would be invisible (just a quiet Postgres load spike). A
    `tracing::debug!` on the `Err` arm would help. Security posture is sound: short TTL (60s,
    documented for fast revocation), `drop_session` on logout, Postgres remains source of
    truth. Good.

## livekit.rs
- **LOC** 69 · **purpose** mint HS256 LiveKit JWT with a video grant derived from authz.
- **DOCS.RS PULLED** `jsonwebtoken::encode(&Header, &claims, &EncodingKey) -> Result<String>`,
  *“create a JWT using HS256”*, `EncodingKey::from_secret(secret.as_ref())` (HMAC bytes).
- **Findings**
  - **PASS — grant derivation matches authz:** `mint`’s `can_publish` comes straight from the
    caller (`http/rooms.rs:350` `ctx.allows(Action::PublishScreen)` after
    `ensure(SubscribeScreen)`), exactly mirroring the doc comment “Only super_admin/admin who
    passed the publish check.” `can_subscribe`/`room_join` true for all who pass
    `SubscribeScreen`. Correct and least-privilege.
  - LOW · livekit.rs:13,47-62 · *no clock-skew leeway on `nbf`* · `nbf = now`, `exp = now+6h`.
    HS256 + `nbf`/`exp` present (good — many verifiers reject tokens lacking `exp`). With
    `nbf` exactly `now`, a LiveKit server whose clock is a few seconds behind could reject a
    just-minted token. Minor; consider `nbf = now - 5`.
  - LOW · livekit.rs:66 · *secret handling* · `api_secret.as_bytes()` into `from_secret` is the
    documented HMAC path — correct. Secret is never logged here. Note `LiveKitConfig` derives
    `Debug` (config.rs:33) and contains `api_secret` — see config.rs HIGH on redaction.
  - NIT · livekit.rs:13 · 6h TTL is long for a short-lived token; the comment says
    “short-lived.” Defensible (avoids reconnect churn) but worth aligning comment vs value.

## config.rs
- **LOC** 160 · **purpose** env-driven `Config` load with fail-fast validation.
- **DOCS.RS PULLED** Rust API Guidelines (C-VALIDATE fail-fast; secret-in-Debug anti-pattern);
  `thiserror` for typed errors.
- **Findings**
  - **HIGH** · config.rs:5,33-50 · *secrets in `Debug` (redaction)* · `Config`,
    `LiveKitConfig`, `OAuthProviderConfig`, `SmtpConfig` all `#[derive(Debug)]` and hold
    `session_secret`, `api_secret`, `client_secret`, smtp `url` (often `smtp://user:pass@…`).
    Any `tracing`/`panic`/`{:?}` of `Config` or these structs **leaks every secret in plain
    text** to logs. API-guideline / security anti-pattern. Fix: manual `Debug` impls that
    print `"<redacted>"` for secret fields (or a `Redacted` newtype). No call site currently
    `{:?}`-prints `Config`, but the derive is a loaded gun.
  - **MED** · config.rs:90 · *fail-fast gap on REDIS_URL* · `DATABASE_URL` and `SESSION_SECRET`
    are `req()` (fail-fast, good — and secret length-validated, lines 64-69). `REDIS_URL`
    silently **defaults to `redis://localhost:6379`** in prod if unset. Realtime + cache +
    rate-limit all depend on Redis; a missing var in prod yields a server that boots and then
    fails every Redis op against localhost. Per fail-fast guidance, prod-critical infra URLs
    should be `req()` (or validated as non-default outside dev). At minimum document the
    deliberate default.
  - LOW · config.rs:94-95 · *AUTH_DEV_BYPASS* · `truthy("AUTH_DEV_BYPASS")` correctly defaults
    off and the doc comment is emphatic. Good. Consider a hard refuse-to-start if
    `auth_dev_bypass && bind_addr` is non-loopback, to make “never ship enabled” enforced, not
    just documented.
  - **PASS — typed errors / partial-group:** `ConfigError::{Missing,Invalid}` are precise;
    `optional_group` correctly disables a feature when a *required* member is absent rather
    than half-configuring it (livekit all-or-nothing). `req` rejects empty/whitespace. Solid.

## state.rs
- **LOC** 36 · **purpose** `AppState` cloned into handlers; all fields cheaply clonable.
- **DOCS.RS PULLED** `std::sync::Arc`; sqlx `PgPool` (internally `Arc`).
- **Findings**
  - **PASS** · `config: Arc<Config>`; `PgPool`, `Cache`, `RealtimeHub`, `GeoResolver` are all
    `Clone` over internal `Arc`s. `#[derive(Clone)]` is correct and cheap, matching the doc
    comment. No locks, no I/O. Clean.

## util.rs
- **LOC** 58 · **purpose** `client_ip` (XFF/X-Real-IP/peer) + `slugify`.
- **DOCS.RS PULLED** axum `HeaderMap`; `HeaderValue::to_str`.
- **Findings**
  - **MED** · util.rs:13-28 · *XFF spoofing / trust* · `client_ip` takes the **leftmost**
    `X-Forwarded-For` token unconditionally. Correct **only** if a trusted proxy always
    overwrites/appends XFF. If the service is ever reachable directly (or the proxy doesn’t
    strip client-supplied XFF), a client can spoof its IP — which here feeds **rate-limit
    buckets** indirectly? (Checked: rate-limit keys use `user_id`/`email`, not IP — so no
    limiter bypass.) The spoofable IP feeds presence-IP (admin view) and geo. Impact is
    admin-view accuracy / geo, not authz. Fix: document the trusted-proxy assumption or take
    the right-most untrusted hop. Acceptable given current usage; flag for when IP-based
    limiting is added.
  - **PASS** · the leftmost-non-empty parse, X-Real-IP fallback, and `ConnectInfo` peer
    fallback match the documented proxy topology (Vercel/Railway). `slugify` is covered by a
    unit test and is allocation-bounded.

## main.rs
- **LOC** 78 · **purpose** process entry: tracing, rustls provider, config, DB/Redis, hub,
  `axum::serve`.
- **DOCS.RS PULLED**
  - `tokio::signal` — `ctrl_c()` *“Completes when a ‘ctrl-c’ notification is sent”*; unix
    `SignalKind::terminate()` for SIGTERM; recommended pattern: *await the signal, then run
    shutdown logic*.
  - `tracing_subscriber` `EnvFilter`/`fmt().with_env_filter().init()`.
- **Findings**
  - **HIGH** · main.rs:64-69 · *no graceful shutdown* · `axum::serve(...).await` is used with
    **no** `.with_graceful_shutdown(...)`. There is no `tokio::signal::ctrl_c()` /
    `SignalKind::terminate()` await anywhere (confirmed: no `signal` import in the crate). On
    SIGTERM (the normal container/Railway stop signal) the process is hard-killed:
    in-flight HTTP requests are cut, WebSocket sockets die without running their departure
    cleanup (ws.rs:131-135 `presence_remove`), so presence rows linger until the 30s/120s
    stale sweep, and any not-yet-flushed work is lost. Fix per the pulled docs: build a
    `shutdown` future selecting on `ctrl_c()` and unix `terminate()`, pass it to
    `axum::serve(...).with_graceful_shutdown(shutdown)`, and (ideally) signal the hub
    dispatcher + drain WS tasks. This is the file’s headline gap and matches the task’s “main.rs
    has none” hypothesis.
  - LOW · main.rs:35-37 · *rustls provider `.expect`* · panicking at startup if the default
    provider can’t install is acceptable (fail-fast, before serving). Fine.
  - LOW · main.rs:73-78 · *tracing coverage* · `init_tracing` sets a sane default
    (`info,sqlx=warn,tower_http=info`). No JSON/structured layer and no `ErrorLayer` for span
    traces; adequate for now. Server-listening + internal-error logging exist; per-request
    spans rely on `tower_http` (not shown here) — verify trace middleware is mounted in
    `http::router`.

## error.rs
- **LOC** 108 · **purpose** unified `AppError` → HTTP/JSON; internal causes logged not leaked.
- **DOCS.RS PULLED** axum `IntoResponse`/`Response`; `thiserror`; `#[from] anyhow::Error`.
- **Findings**
  - **PASS — leak boundary:** `Internal(_)` returns a generic `"internal server error"` body
    and logs the cause via `tracing::error!(error = ?cause)` only (error.rs:64-68, 87-89).
    Client never sees the internal string. `From<sqlx::Error>` maps `RowNotFound → NotFound`,
    everything else → `Internal`. Stable machine codes. Idiomatic and correct.
  - LOW · error.rs:88 · *only `Internal` is logged* · 4xx variants (`BadRequest`, `Forbidden`,
    `RateLimited`, …) are never traced. Fine for noise, but a `debug`/`warn` on
    `Unauthorized`/`Forbidden` aids abuse investigation. Optional.

## geo.rs
- **LOC** 228 · **purpose** best-effort IP→“City, Country” via ip-api.com, in-proc cached,
  with an SSRF/private-IP guard.
- **DOCS.RS PULLED**
  - `reqwest::ClientBuilder` — `timeout()` *“total request timeout … from connecting until
    the response body has finished”*; `connect_timeout()` default `None`; **redirect default
    *“follow redirects up to a maximum of 10”*** via `redirect()`/`Policy`.
  - `std::net::Ipv4Addr` — `is_private` = RFC1918 (`10/8`,`172.16/12`,`192.168/16`);
    `is_shared` (CGNAT `100.64.0.0/10`, RFC 6598) and `is_global` are **nightly-only**, so the
    hand-rolled `is_global` is justified on stable.
- **Findings**
  - **MED** · geo.rs:56-66 + 95-96 · *SSRF: redirects bypass the IP guard* · `is_global` is
    checked on the **caller-supplied IP**, then the request goes to
    `http://ip-api.com/json/{addr}`. The reqwest client uses the **default redirect policy
    (up to 10 hops)** — confirmed no `.redirect(Policy::none())`. If ip-api (or a spoofed
    `Host`/DNS) responds with a 3xx to an internal address, reqwest will follow it server-side,
    re-introducing the SSRF the `is_global` gate was meant to prevent. The target host is fixed
    and the input IP is validated, so exploitability is low, but the guard is incomplete. Fix:
    `.redirect(reqwest::redirect::Policy::none())` for a fixed-endpoint geo client. (Also: the
    endpoint is plaintext **http://** — no TLS — so a network MITM can forge the geo response;
    low impact as the result is non-authoritative.)
  - **LOW** · geo.rs:160-179 · *`is_global` misses CGNAT + reserved blocks* · the hand-rolled
    IPv4 check omits **shared/CGNAT `100.64.0.0/10`** (RFC 6598; nightly `is_shared`),
    `192.0.0.0/24`, `192.0.2.0/24`/`198.51.100.0/24`/`203.0.113.0/24` (TEST-NETs),
    `198.18.0.0/15` (benchmarking), and `240.0.0.0/4` (reserved). A `100.64.x.x` (common
    behind carrier NAT) would be sent to the third-party API — a minor internal-range leak,
    contradicting the module’s “never leak an internal address” promise. Fix: add a
    `100.64.0.0/10` check (mask `& 0xFFC0_0000 == 0x6440_0000`) and optionally TEST-NET/
    benchmarking. IPv6 ULA/link-local prefix checks (lines 173-176) are correct given the
    nightly-only stable methods. Tests at lines 186-209 are good but don’t cover CGNAT.
  - **PASS — timeouts:** both `.timeout(3s)` and `.connect_timeout(3s)` set (geo.rs:58-59),
    satisfying the cited reqwest docs and the stated CLAUDE.md hard rule. `unwrap_or_default()`
    fallback client is benign.
  - **PASS — cache + lock discipline:** the `Mutex<HashMap>` guard is dropped before the
    `.await` to ip-api (`cached`/`cache_set` are self-contained, geo.rs:121-135) — no std
    lock held across await, matching tokio’s guidance. `Option<Option<String>>` (negative
    caching) is intentional and `#[allow]`-annotated. Failure → `None`, never errors the
    request (matches doc comment). Good.

---

## Summary table

| File | LOC | CRIT | HIGH | MED | LOW | NIT |
|---|---|---|---|---|---|---|
| realtime/event.rs | 126 | 0 | 0 | 0 | 1 | 1 |
| realtime/mod.rs | 447 | 0 | 1 | 1 | 1 | 1 |
| cache/mod.rs | 62 | 0 | 0 | 0 | 1 | 1 |
| cache/presence.rs | 140 | 0 | 0 | 1 | 1 | 0 |
| cache/ratelimit.rs | 30 | 0 | 0 | 1 | 1 | 0 |
| cache/session_cache.rs | 55 | 0 | 0 | 0 | 1 | 0 |
| livekit.rs | 69 | 0 | 0 | 0 | 2 | 1 |
| config.rs | 160 | 0 | 1 | 1 | 1 | 0 |
| state.rs | 36 | 0 | 0 | 0 | 0 | 0 |
| util.rs | 58 | 0 | 0 | 1 | 0 | 0 |
| main.rs | 78 | 0 | 1 | 0 | 2 | 0 |
| error.rs | 108 | 0 | 0 | 0 | 1 | 0 |
| geo.rs | 228 | 0 | 0 | 1 | 1 | 0 |
| **Totals** | **1597** | **0** | **4** | **7** | **14** | **5** |

## Top fixes (by leverage)
1. **mod.rs HIGH** — call fred `manage_subscriptions()` (or re-`psubscribe` on reconnect):
   without it, one Redis blip permanently kills all realtime delivery. Pair with dispatcher
   supervision (mod.rs MED).
2. **main.rs HIGH** — add `axum::serve(...).with_graceful_shutdown(...)` selecting
   `tokio::signal::ctrl_c()` + unix `SignalKind::terminate()`; drain WS / run presence cleanup.
3. **config.rs HIGH** — manual redacting `Debug` for all secret-bearing config structs.
4. **ratelimit.rs MED** — make INCR+EXPIRE atomic (Lua `SET NX EX` or always-`expire`) to
   avoid TTL-less wedged buckets DoSing real users.
5. **geo.rs MED + LOW** — `redirect(Policy::none())` and add CGNAT/`100.64.0.0/10` to
   `is_global` to close the SSRF/internal-leak gaps.

## Cross-cutting PASS notes
- Clippy **0/0** (re-verified live, exit 0); 25 tests pass (given).
- No `std::sync::Mutex` guard is held across any `.await` in the audited set (hub, geo) —
  matches tokio’s documented rule.
- Room-vs-PM channel isolation is sound at runtime (dispatcher + parser tests).
- LiveKit grant derivation matches the authz decision (`ctx.allows(PublishScreen)`),
  least-privilege, with `exp`/`nbf` present.
- No blocking calls in async paths; no obvious `spawn_blocking` needs (all I/O is async fred/
  reqwest/sqlx).

Report path: `/home/user/pro-room/docs/forensics/per-file/rust-realtime-infra.md`
