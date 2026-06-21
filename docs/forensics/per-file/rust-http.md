# Forensic Audit — AREA `rust-http`

Repo: `/home/user/pro-room` · Scope: `server/crates/server/src/http/*.rs` (17 files, 3183 LOC)
Mode: **READ-ONLY**, doc-grounded. **No source modified.**

## Tooling note

There is **no Rust MCP server** in this environment. Authoritative docs were pulled
live from **docs.rs via WebFetch** (axum / axum-extra / tower-http / Rust API
Guidelines) and combined with **live cargo** and ripgrep over the tree. Workspace
`clippy` is **already 0/0** and **25 tests pass** — cited as an established baseline
(no targeted clippy was needed; no specific lint was chased).

## Cross-cutting facts established (shared infra, read in full)

- **Auth extractor** `CurrentUser` (`auth/session.rs`) implements `FromRequestParts`,
  yields **401** when no valid session — *axum docs: "axum enforces this by requiring
  the last extractor implements FromRequest and all others implement
  FromRequestParts."* `CurrentUser` is parts-only, so it composes before body
  extractors in every handler. Contains a **dev-only `AUTH_DEV_BYPASS`** branch
  (default off, logs a `warn!`, gated on `state.config.auth_dev_bypass`) — documented
  "NEVER SHIP ENABLED"; not reachable in prod config. Noted, not a finding.
- **Authz gate** `RoomContext::ensure` / `ensure_system_action` (`authorization.rs`)
  is the fail-closed path: it calls the **pure, deny-by-default** `authz::authorize`
  (RBAC capability ∧ ABAC policy), **audits** every decision, and maps `Deny` → **403**
  (`decision_to_result`). This is the IDOR/authz backbone — every room-scoped resource
  is also re-scoped by `room_id` in its DB query.
- **Error mapping** (`error.rs`): single `AppError` → status map; `Internal` cause is
  logged via `tracing::error!`, never leaked. `sqlx::Error::RowNotFound` → **404**.
  Consistent across all handlers.
- **Body limits**: docs.rs (`axum::extract`) — *"For security reasons, Bytes will, by
  default, not accept bodies larger than 2MB. This also applies to … String, Json, and
  Form."* and (`Multipart`) *"by default, Multipart limits the request body size to
  2MB."* **No `DefaultBodyLimit` / `RequestBodyLimitLayer` override exists anywhere in
  the crate** (grep: 0 matches). See M1.
- **mod.rs layering**: `TraceLayer` + `CorsLayer`, `with_state`. **No `CatchPanicLayer`**
  (grep: 0 matches) — docs.rs `tower_http::catch_panic`: *"Catch panics and convert them
  into 500 Internal Server responses."* See L1. **No panic/unwrap/expect in any handler**
  (grep over `http/`: 0 matches), so a panic-to-abort is only a defense-in-depth gap.
- `ConnectInfo<SocketAddr>` is correctly provided via
  `into_make_service_with_connect_info` (`main.rs:66`).

---

## Per-file blocks

### mod.rs · 77 LOC · router assembly, CORS + tracing layers
**Docs pulled:** axum `Router` (`merge`, `route`, `layer`, `with_state`); tower-http
`cors::CorsLayer`, `catch_panic::CatchPanicLayer`, `trace::TraceLayer`.
**Findings:**
- **M1 · mod.rs:51 / (whole crate) · request body size cap** — No `DefaultBodyLimit`
  layer is configured. axum applies a **2 MB** default to `Json`/`Multipart`. Effect is
  twofold: (a) `files.rs` advertises a **25 MB** upload cap (`MAX_UPLOAD_BYTES`) that is
  **unreachable** — a >2 MB upload is rejected framework-side (413) before
  `read_file_part` runs, so the handler cap is partly dead code and the product feature
  silently caps at 2 MB; (b) `branding.rs` 2 MB logo cap collides exactly with the
  default and works only by luck of multipart envelope overhead. **Fix (doc-grounded):**
  set an explicit policy — `DefaultBodyLimit::disable()` (or `::max(N)`) on the upload
  routes via `RequestBodyLimitLayer`, sized to match `MAX_UPLOAD_BYTES`, and keep a
  small default on JSON routes. (Decide intent: 2 MB or 25 MB — today they disagree.)
- **L1 · mod.rs:49-50 · no catch-panic layer** — A handler panic aborts the connection
  with no response. Handlers are panic-free today (grep clean), so low severity. **Fix:**
  add `tower_http::catch_panic::CatchPanicLayer::new()` as the outermost layer for
  defense in depth.
- **INFO · mod.rs:58-77 · CORS** — `allow_credentials(true)` is paired with an **explicit
  parsed origin list** (`allow_origin(origins)`), not `Any`, and explicit methods/headers
  — this is the safe combination (the dangerous `Any` + credentials pairing, which
  tower-http panics on, is avoided). `filter_map(parse().ok())` silently drops malformed
  configured origins — acceptable (config-time, not request-time). No finding.

### auth.rs · 425 LOC · register/login/logout, me, password, magic-link, OAuth
**Docs pulled:** axum `extract::{State,Path,Query,Json,ConnectInfo}`, `response::Redirect`;
axum-extra `extract::cookie::CookieJar`; Rust API Guidelines (error type).
**Authz-gate per route:** `register`/`login`/`logout`/`magic_*`/`oauth_*` are
**unauthenticated by design** (entry points). `me`/`update_me`/`change_password` are
**self-scoped via `CurrentUser`** (no IDOR surface — caller only ever touches own row).
**Findings:**
- **GOOD · login:152-172** — Constant-work Argon2: verifies real hash or hashes a
  throwaway on unknown account, on `spawn_blocking`; uniform `Unauthorized`. Closes the
  user-enumeration timing oracle. Rate-limited (`login:{email}`, 10/60). Password length
  capped (≤1024) before verify to bound CPU.
- **GOOD · change_password:232-276** — Re-verifies current password, then
  `revoke_all_for_user` across Postgres **and** Redis, then re-issues. Rate-limited.
- **INFO · oauth_callback:367-371 · open-redirect guard** — `redirect_to` is accepted
  only when it `starts_with('/')` and is concatenated onto the trusted `public_web_url`;
  external redirects are not honored. Correct. magic_request returns uniform `ok` (no
  address disclosure). No finding.
- No panics; `spawn_blocking` join errors map to `Internal`. Clean.

### admin.rs · 294 LOC · moderation commands (kick, mute, lock, delete msg/alert, read all PMs)
**Docs pulled:** axum `extract::{Path,State,Json}`, routing `delete/get/post`.
**Authz-gate per route:** **all gated** — kick/kick-duplicates → `ManageMembers`;
mute-all/clear-chat/lock/lock-screen/delete-message/delete-alert → `ManageRoom`;
all-user-pm → `ReadAllPrivateMessages`. Every route loads `RoomContext` then `ensure(...)`.
**Findings:**
- **GOOD · kick:82-94** — Refuses self-kick (400) and refuses to kick an admin/super
  (403, "moderation acts downward only"); also force-closes target sockets server-side.
- **GOOD · delete_message/delete_alert/all_user_pm** — Every DB op is **room-scoped**
  (`(room_id, message_id)` etc.) and returns 404 when the target isn't in the room — no
  cross-room IDOR. `all_user_pm` capped at `MAX_ADMIN_PM = 200`.
- No findings.

### alerts.rs · 103 LOC · trade-alert post/list
**Docs pulled:** axum `extract::{Path,State,Json}`.
**Authz-gate:** create → `PostAlert` (admin-in-room); list → `ReadAlert` (member).
**Findings:** create is rate-limited (`alert:{id}:{user}`, 30/60); inputs trimmed,
symbol/side required; list capped at 100. No findings.

### badges.rs · 131 LOC · badge registry (public read + admin writes)
**Docs pulled:** axum `extract::{Path,State,Json}`.
**Authz-gate:** `list` is **intentionally public** (no `CurrentUser`) — read-only badge
registry, no PII. `create`/`remove`/`assign`/`unassign` → `ManageBadges` via
`ensure_system_action`. `assign` validates recipient exists (404). Duplicate-slug → 409.
**Findings:** none. (Public read is documented and benign.)

### branding.rs · 214 LOC · brand name + logo (public read + admin writes)
**Docs pulled:** axum `extract::Multipart`, `body::Body`, `response::IntoResponse`,
`http::header`; Multipart 2MB default.
**Authz-gate:** `read`/`serve_logo` **public** (login page needs them, no PII).
`update_name`/`upload_logo`/`reset_logo` → `ManageBranding`.
**Findings:**
- **GOOD · read_logo_part:125-154** — Content-type allowlist (`image/`), 2 MB cap, server
  generates storage UUID; replaced/failed writes are cleaned up. Logo served via `<img>`
  content-type only.
- **Tied to M1** — `MAX_LOGO_BYTES = 2 MB` exactly equals axum's default; works but is
  coincidental, not explicit. Folded into M1.
- **INFO · serve_logo:111** — `Cache-Control: public, max-age=300` with `?v=` cache-bust.
  Fine. No finding.

### captions.rs · 52 LOC · presenter live captions (ephemeral broadcast)
**Docs pulled:** axum `extract::{Path,State,Json}`.
**Authz-gate:** `post_caption` → `PublishScreen` (presenter). Caption truncated
char-safe to 500. Nothing persisted. No findings.

### files.rs · 249 LOC · per-room file drive + inline image upload + download
**Docs pulled:** axum `extract::Multipart` (must be **last** extractor — satisfied:
`multipart`/`Multipart` is the final arg in `upload`/`upload_inline`), `Field::bytes`,
`body::Body`, `response::IntoResponse`; Multipart 2MB default.
**Authz-gate per route:** list/download → `JoinRoom`; upload/remove → `ManageRoom`;
upload_inline → `PostMessage`. All room-scoped; `get_with_storage`/`delete` are
`(room_id, file_id)` scoped → 404 cross-room. No IDOR.
**Findings:**
- **M1 (primary) · files.rs:25,94 · 25 MB cap vs 2 MB default** — `MAX_UPLOAD_BYTES =
  25 MB` checked at `field.bytes()` length, but axum's **2 MB default body limit** rejects
  the request first (413), so uploads >2 MB fail before the handler and the 25 MB cap is
  effectively unreachable. **Fix:** add an explicit `DefaultBodyLimit::max(MAX_UPLOAD_BYTES
  + envelope)` / `RequestBodyLimitLayer` on the file-upload routes so the framework and
  handler caps agree.
- **L2 · files.rs:90-101 · whole-field buffering (streaming vs buffering)** — `field.bytes()`
  buffers the **entire** field into memory (`Vec<u8>`), then `store` writes it to disk in
  one `tokio::fs::write`. Per-request memory = full file size (up to the intended 25 MB).
  Acceptable at 25 MB with the cap enforced, but not streaming. **Fix (optional):** stream
  `field.chunk()` to disk with a running byte counter to bound peak memory; the size cap
  must then be enforced incrementally. Low because the cap (once M1 is fixed) bounds it.
- **GOOD · sanitize_filename:239-249 + download:202-205** — Client filename is stripped of
  `"` `\` `/` and control chars before interpolation into `Content-Disposition`, blocking
  header/filename injection. On-disk name is always a server UUID (`store:114`), never
  client-derived — no path traversal. `upload_inline` additionally enforces
  `FileCategory::Image`.

### messages.rs · 100 LOC · chat post/list
**Docs pulled:** axum `extract::{Path,Query,State,Json}`.
**Authz-gate:** create → `PostMessage`; list → `ReadMessage`. Rate-limited (60/60).
Channel allowlisted (`main`/`off_topic`), body trimmed + ≤2000, list capped 100. No findings.

### notes.rs · 123 LOC · per-room notes
**Docs pulled:** axum `extract::{Path,State,Json}`.
**Authz-gate:** list → `JoinRoom`; create/update/remove → `ManageRoom`. update/remove are
`(room_id, note_id)` scoped with explicit 404 (`get` membership check before update) — no
cross-room IDOR. Title required + ≤200. No findings.

### polls.rs · 169 LOC · poll create/list/vote/close
**Docs pulled:** axum `extract::{Path,State,Json}`.
**Authz-gate:** create/close → `PostAlert` (admin); vote → `PostMessage` (member);
list → `ReadAlert`. create rate-limited (30/60). Option count 2..=10, lengths bounded.
`vote`/`close` are `(room_id, poll_id)` scoped; `VoteOutcome` maps NotFound→404,
Closed→409, InvalidOption→400. Clean error→status mapping. No findings.

### private_messages.rs · 148 LOC · 1:1 PM send/list/read
**Docs pulled:** axum `extract::{Path,State,Json}`.
**Authz-gate:** send/list_threads/thread → `SendPrivateMessage`. Reads are scoped to the
caller's own pair (`thread(... user.user_id, peer_id ...)`) so a member can never read
another user's conversation — privileged "read all" lives in admin.rs only.
**Findings:**
- **GOOD · send:76-102 · IDOR/access hardening** — rejects self-PM (400, mirrors DB CHECK);
  requires recipient to **exist** (404) **and** to have room access (member, or any user if
  room is Public) else **403** — prevents PMs into a private room to a non-participant.
  Rate-limited (60/60), body ≤2000. Delivery is per-user channel only (privacy boundary
  documented). No findings.

### questions.rs · 118 LOC · alert Q&A
**Docs pulled:** axum `extract::{Path,State,Json}`.
**Authz-gate:** create → `PostMessage`; list → `ReadAlert`; resolve → `PostAlert` (admin).
`alert_in_room`/room-scoped queries → 404 cross-room. create rate-limited (30/60), bodies
bounded (2000 / 4000). No findings.

### reactions.rs · 259 LOC · emoji reactions + presenter media-for-all
**Docs pulled:** axum `extract::{Path,Query,State,Json}`; `url::Url` parsing.
**Authz-gate:** toggle → `PostMessage`; list → `ReadMessage`; media_for_all →
`PublishScreen` (presenter). `target_in_room` → 404 cross-room. toggle rate-limited (60/60),
emoji ≤32 bytes.
**Findings:**
- **INFO · reactions.rs:235-238 · media-for-all `mp3`/`video` any-host** —
  `validate_direct_media_url` deliberately allows **any** http(s) host (soundcloud/youtube
  are allowlisted; mp3/video are not). The URL is only **broadcast to clients** as a WS
  event — the **server never fetches it**, so this is not server-side SSRF. Residual risk is
  client-side (presenter can push an arbitrary media URL to the room, but that requires the
  presenter capability). Scheme is restricted to http(s) and a host is required. Documented
  behavior; noted, not a defect.

### rooms.rs · 364 LOC · room CRUD, members, live toggle, presence, LiveKit token
**Docs pulled:** axum `extract::{Path,State,Json}`, `Router`.
**Authz-gate per route:** list → `CurrentUser` + DB visibility filter (`list_visible`,
super-admin sees all); create → `ensure_system_action(CreateRoom)`; detail → `JoinRoom`
(+ locked-room re-gate); update/remove/set_live → `ManageRoom`;
list_members/add_member/remove_member → `ManageMembers`; **list_presence → `ManageMembers`**;
livekit_token → `SubscribeScreen` (publish flag gated on `PublishScreen`).
**Findings:**
- **GOOD · list_presence:285-326 · sensitive-data gating** — Client **IP + geolocation** are
  returned only on this `ManageMembers`-gated route and are explicitly never in the public
  presence WS broadcast (ws.rs:90 publishes names only). No leak of PII to members.
- **GOOD · create:100** — Routed through the **audited** `ensure_system_action(CreateRoom)`
  rather than a bare role check (comment notes this previously bypassed the convention).
  Slug conflict → 409.
- **GOOD · detail:143-152** — Locked-room parity with the WS gate so a locked-out non-admin
  gets a clean 403 instead of a 200 + silent socket-403 reconnect loop.
- No findings.

### users.rs · 195 LOC · user administration (super-admin)
**Docs pulled:** axum `extract::{Path,State,Json}`, routing `delete/get/patch`.
**Authz-gate per route:** list/create/delete_user/set_role/set_status → all
`ensure_system_action(ManageUsers)` (super-admin only).
**Findings:**
- **GOOD · last-super-admin & self-lockout guards** — `delete_user:118` blocks deleting your
  own account; `set_role:144-151` and `set_status:177-184` block demoting/suspending the
  **last active super-admin** (would lock everyone out of user management). Each privileged
  mutation writes a target-identifying `audit_user` row. create mirrors register validation
  + Argon2 on `spawn_blocking`, duplicate → 409. No findings.

### ws.rs · 162 LOC · per-room WebSocket (alerts/chat/presence fan-out)
**Docs pulled:** axum `extract::ws::{WebSocketUpgrade, WebSocket, Message}` — config methods
**quoted from docs.rs**: `max_message_size` *"defaults to 64 megabytes"*, `max_frame_size`
*"defaults to 16 megabytes"*, `max_write_buffer_size` *"The default value is unlimited"*,
`on_failed_upgrade` *"By default any errors will be silently ignored."*
**Authz-gate:** `upgrade` gates on `SubscribeScreen` **before** `on_upgrade` (correct —
denial returns a normal HTTP error pre-upgrade), plus a locked-room admin-only re-gate.
**Findings:**
- **M2 · ws.rs:32,59 · inbound frame size not capped** — `WebSocketUpgrade` is used with
  **all defaults**: `max_message_size` **64 MiB**, `max_frame_size` **16 MiB**. The socket is
  "receive-mostly" (clients send only heartbeats), and inbound `Text`/`Ping` payloads are
  **discarded** (ws.rs:120 ignores content) — but a malicious client can still force the
  server to buffer up to 64 MiB per inbound message. **Fix (doc-grounded):** chain
  `ws.max_message_size(small).max_frame_size(small)` (e.g. a few KiB — heartbeats are tiny)
  on the `WebSocketUpgrade` before `on_upgrade`.
- **L3 · ws.rs:118-125 · no inbound heartbeat rate limit** — Each inbound `Text`/`Ping`
  triggers `presence_touch` (a Redis write). A client spamming heartbeats causes unbounded
  Redis write load on that connection. Low (single-connection, cheap op). **Fix (optional):**
  debounce `presence_touch` (e.g. at most once / N seconds per connection).
- **GOOD · lifecycle/cleanup:79-135** — Connection is `register`ed; on every exit path
  (duplicate-kick `closed`, broadcast `Closed`, peer `Close`/`Err`/`None`, send error) the
  loop breaks and `unregister` runs; presence is **ref-counted** so closing one of a user's
  tabs does not drop presence, and IP/presence are cleared only on the user's last local
  socket. `Lagged` is tolerated, `Closed` breaks. No panics. Clean lifecycle.
- **INFO** — `on_failed_upgrade` is left default (errors silently ignored); acceptable but
  could log. Not a defect.

---

## Summary table

| File | LOC | Authz gating | Severity findings |
|---|---|---|---|
| mod.rs | 77 | n/a (assembly) | **M1** (body limit), **L1** (no catch-panic) |
| auth.rs | 425 | entry + self-scoped | none (multiple GOOD) |
| admin.rs | 294 | all gated (Manage*) | none |
| alerts.rs | 103 | PostAlert / ReadAlert | none |
| badges.rs | 131 | public read + ManageBadges | none |
| branding.rs | 214 | public read + ManageBranding | (ties to M1) |
| captions.rs | 52 | PublishScreen | none |
| files.rs | 249 | Join/Manage/PostMessage | **M1** (primary), **L2** (buffering) |
| messages.rs | 100 | Post/ReadMessage | none |
| notes.rs | 123 | Join / ManageRoom | none |
| polls.rs | 169 | PostAlert / PostMessage / ReadAlert | none |
| private_messages.rs | 148 | SendPrivateMessage (self-scoped) | none (GOOD IDOR guard) |
| questions.rs | 118 | Post/Read/PostAlert | none |
| reactions.rs | 259 | Post/Read/PublishScreen | **INFO** (any-host media URL) |
| rooms.rs | 364 | per-route Manage*/System | none (GOOD presence gating) |
| users.rs | 195 | ManageUsers (super-admin) | none (GOOD lockout guards) |
| ws.rs | 162 | SubscribeScreen + lock gate | **M2** (frame cap), **L3** (hb rate) |

## Severity totals

| Severity | Count | Items |
|---|---|---|
| High | 0 | — |
| Medium | 2 | M1 (body-limit mismatch: 25 MB cap unreachable under 2 MB default), M2 (WS inbound frame cap = 64 MiB default) |
| Low | 3 | L1 (no CatchPanicLayer), L2 (full-field buffering in upload), L3 (no heartbeat rate-limit) |
| Info | 2 | reactions any-host media URL (client-broadcast only, no server fetch), ws on_failed_upgrade default |

**No High findings.** Every mutating/sensitive route is authz-gated and fail-closed via
`RoomContext::ensure` / `ensure_system_action` (deny-by-default + audited). No IDOR (all
room-scoped queries + 404 on cross-room), no panics/unwraps in handlers, consistent
error→status mapping, header/redirect injection defended (filename sanitize, `/`-only
OAuth redirect). The two Medium items are **request-size policy gaps** (HTTP `Json`/
`Multipart` default 2 MB collides with the 25 MB upload intent; WS inbound 64 MiB default
uncapped), both fixable with explicit `DefaultBodyLimit` / `max_message_size` calls.
