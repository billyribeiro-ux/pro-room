# ProTradingRoom Backend — Forensic Engineering Audit

**Date:** 2026-06-21
**Auditor role:** Distinguished Principal Backend Engineer (L7++), forensic evidence-based review
**Scope:** `server/` Rust workspace (`domain`, `authz`, `server` crates) + `server/migrations/`
**Method:** Real toolchain run (build / clippy / test / fmt / cargo-audit) + file-by-file read + docs/RustSec cross-reference. Read-only — no source files modified.
**Toolchain:** `rustc 1.94.1 (e408947bf 2026-03-25)`, `cargo 1.94.1`, edition 2024, resolver 3.

---

## 1. Header Metrics

| Metric | Value | Evidence |
|---|---|---|
| Crates | 3 (`domain`, `authz`, `server`) | `server/Cargo.toml` workspace members |
| Rust source files | 66 | `find crates -name '*.rs' \| wc -l` |
| Total LOC (Rust) | 9,679 | `wc -l` (domain 701, authz 539, server 8,439) |
| Functions (`fn`) | ~390 | `grep -rE '\bfn '` |
| Migrations | 13 (0001–0013) | `server/migrations/` |
| **Build** (`SQLX_OFFLINE=true cargo build --all-targets`) | **PASS, exit 0** | warm build finished, 0 errors |
| **Clippy** (`--all-targets --all-features -- -D warnings`; workspace `clippy::all` + `clippy::pedantic`) | **PASS — 0 warnings, 0 errors, exit 0** | full from-scratch run, `Finished` in 1m12s |
| **Tests** (`cargo test --all`) | **25 passed / 0 failed** (authz 11, domain 3, server 11; doc-tests 0) | per-crate runs captured |
| **fmt** (`cargo fmt --all -- --check`) | **DRIFT, exit 1 — 4 blocks** | auth.rs:120, auth.rs:173, badges.rs:62, users.rs:62 |
| **cargo-audit** | **1 vulnerability** (RUSTSEC-2023-0071, `rsa 0.9.10`, medium 5.9) | installed + run; see HIGH/LOW notes |
| Dependency duplicates | several transitive (sha2 0.10/0.11, rand 0.8/0.9/0.10, getrandom 0.2/0.3/0.4, hashbrown 0.16/0.17) | `cargo tree --duplicates` — all transitive, none direct |

**Offline-mode limitation:** there is no live Postgres/Redis in this environment. `.sqlx/` holds **35** cached query JSONs (one per `query!` macro; the runtime `query_as` modules deliberately have none). Spot-checks confirm cached text matches code, but `cargo sqlx prepare --check` and `EXPLAIN` plans could not be run — index/seq-scan claims in §Migrations are from DDL + query text, not query plans.

---

## 2. Findings — Severity-Ranked

Severity key: **CRITICAL** (exploitable now / data loss), **HIGH** (latent serious risk or correctness bug), **MEDIUM** (should fix), **LOW** (minor), **NIT** (style/polish).

| ID | Sev | Location | Finding | Evidence | Recommended fix |
|---|---|---|---|---|---|
| F-01 | **HIGH** | `crates/server/src/auth/session.rs:121-128`, `config.rs:95` | `AUTH_DEV_BYPASS` env flag serves **every unauthenticated request as super-admin**. Gated only by a runtime env var + `tracing::warn!`; no compile-time (`#[cfg(debug_assertions)]`) guard and no startup refusal when bypass+https. If ever set in prod, total auth bypass. | `if state.config.auth_dev_bypass { return Ok(Self(dev_bypass_user(state).await?)); }` (session.rs:126) | Add `#[cfg(debug_assertions)]` around the branch, OR have `Config::from_env` hard-error when `auth_dev_bypass && public_api_url starts_with https`. |
| F-02 | **HIGH** | `crates/server/src/http/rooms.rs:116-125` | Room creation is **not atomic**: `db::rooms::create` then a separate `db::members::upsert` (owner→member), both on `&state.db`. If the upsert fails, an orphan room exists whose owner is not in `room_members` (and `rooms.owner_id` is RESTRICT, blocking clean delete). | two sequential `.await?` on the pool, no `begin()` | Wrap both writes in one `pool.begin()` … `tx.commit()`. |
| F-03 | **MEDIUM** | `crates/server/src/http/auth.rs:109-119` | User registration is **not atomic**: `db::users::create` then a separate `db::identities::link`. If link fails, a `users` row persists with no identity → an un-loginnable orphan. | sequential pool calls | Single transaction across user insert + identity link. |
| F-04 | **MEDIUM** | `crates/server/src/auth/oauth.rs:263-268` | OAuth `http_client()` builds a reqwest client with **no `.timeout()` / `.connect_timeout()`** — unlike `geo.rs:56-60`, which sets both and cites a CLAUDE.md "hard rule" that every external client must. Token-exchange / profile fetch can hang indefinitely, tying up the request. | `reqwest::Client::builder().user_agent("pro-room-server").build()` — no timeouts | Add `.timeout(...)` + `.connect_timeout(...)` to match `geo.rs`. |
| F-05 | **MEDIUM** | `crates/server/src/http/mod.rs:49-50` | `tower-http`'s `catch-panic` feature is **enabled in Cargo.toml but `CatchPanicLayer` is never layered**. A panic in a handler drops the connection (no clean 500). The feature is dead weight and the resilience it implies is absent. | router only adds `TraceLayer` + `CorsLayer`; `grep CatchPanic` → no matches | Add `.layer(CatchPanicLayer::new())` (outermost) so panics map to 500. |
| F-06 | **MEDIUM** | `crates/server/src/main.rs:55-60` | **No graceful shutdown.** `axum::serve(...).await` runs until the process is killed; no `.with_graceful_shutdown(signal)`. On rolling restart / SIGTERM, in-flight requests and all WebSockets are dropped abruptly. | no `with_graceful_shutdown` / `shutdown` anywhere (grep → no matches) | Wire `axum::serve(...).with_graceful_shutdown(shutdown_signal())` listening on ctrl-c + SIGTERM. |
| F-07 | **MEDIUM** | `crates/server/src/http/files.rs:198` | `download` reads the entire file into memory (`tokio::fs::read`) before responding — up to 25 MB per request (the upload cap). Concurrent downloads multiply this; a memory-pressure DoS vector. | `let bytes = tokio::fs::read(&path).await...; Body::from(bytes)` | Stream the file: `tokio_util::io::ReaderStream` over `tokio::fs::File` → `Body::from_stream`. |
| F-08 | **MEDIUM** | `crates/server/src/http/ws.rs:119-125` | Inbound WS frames have **no application-level size/rate cap**. Each Text/Ping triggers a Redis `presence_touch`; a client can spam frames to amplify Redis writes. (Axum's default 64 MB frame limit is the only bound.) | inbound arm calls `presence_touch` per message, payload discarded | Debounce presence on inbound (e.g. touch at most every N s/conn) and/or cap inbound message rate. |
| F-09 | **MEDIUM** | `server/migrations/0002,0006,0007` | Missing indexes on FK columns used in JOIN / WHERE / cascade deletes: `messages.author_id`, `alerts.author_id`, `polls.author_id`, `polls.room_id`, `questions.author_id`, `poll_votes.user_id`, `room_members.user_id`. The user-delete cascade (`db/users.rs:296-299`) deletes by these unindexed columns → seq scans as tables grow. | only `(room_id, created_at)` composite indexes exist; PK `(room_id,user_id)` can't serve `user_id`-only lookups | Add btree indexes on each FK column used in a WHERE/JOIN. |
| F-10 | **MEDIUM** | `crates/server/src/db/polls.rs:160-177` | **N+1**: `list_active` loads N polls, then runs one `option_results` query **per poll**. (Contrast: messages/alerts correctly batch badges via `= ANY($1)`.) | `for poll_row in poll_rows { let options = option_results(pool, entity.id).await?; ... }` | Single query with `option_id = ANY(...)` / one GROUP BY join, then group in Rust. |
| F-11 | **LOW** | `Cargo.lock` → `rsa 0.9.10` | RUSTSEC-2023-0071 (Marvin timing attack). **No fixed upgrade exists.** Reached only via `jsonwebtoken`'s `rust_crypto` feature (RSA algos). The app signs **HS256 only** (`livekit.rs:64`), so **no RSA private-key op ever runs** → not reachable. cargo-audit still reports it. | `cargo tree -i rsa` → `rsa ← jsonwebtoken ← server`; `livekit.rs` uses `Algorithm::HS256` | Track upstream; optionally drop unused JWT RSA features if jsonwebtoken exposes a knob. Add a documented `cargo-audit` ignore with rationale. |
| F-12 | **LOW** | `crates/server/src/cache/ratelimit.rs:19-26` | Fixed-window limiter sets TTL only on `count==1`. A crash between `INCR` and `EXPIRE` leaves a key with no TTL (a permanently-blocking bucket). Also a minor TOCTOU between incr/expire. | `if count == 1 { ... expire ... }` | Use `SET key 1 EX win NX` + `INCR`, or a Lua script, to make incr+expiry atomic. |
| F-13 | **LOW** | `crates/server/src/http/alerts.rs:54-63` | No max-length validation on alert `symbol`/`side`/`note` (trimmed but unbounded). Large `note` text can bloat rows / broadcast payloads. | only `is_empty()` checks; no length cap | Cap lengths (e.g. symbol ≤ 16, side ≤ 8, note ≤ 1000). |
| F-14 | **LOW** | `crates/server/src/http/reactions.rs:235-238` | `validate_direct_media_url` (mp3/video) allows **any host** including internal IPs / `169.254.169.254`. The **server never fetches** it (clients do), so it's not server-side SSRF, but it can point clients at internal/abusive URLs. | "Deliberately does NOT run the allowed-hosts test" | Block non-global hosts (reuse `geo::is_global`) even for direct links, or document the client-side trust boundary. |
| F-15 | **NIT** | `crates/server/src/authorization.rs:118` | ABAC deny reasons (`"policy: not a member of the room"`) are surfaced verbatim to clients via `AppError::Forbidden(reason)`. Minor policy-internals disclosure (reasons are `&'static`, never user data). | `Decision::Deny { reason } => Err(AppError::Forbidden(reason))` | Optional: map to a generic "forbidden" for clients, keep the reason in the audit log only. |
| F-16 | **NIT** | fmt drift (4 blocks) | `cargo fmt --all -- --check` fails. | auth.rs:120, auth.rs:173, badges.rs:62, users.rs:62 | Run `cargo fmt --all`; add a CI fmt gate. |
| F-17 | **NIT** | `crates/server/src/authorization.rs:83-93` | `ensure()` writes an `audit_log` row on **every** authorization check, including allows — a DB write per room action (write amplification / latency). Failure is logged, not propagated (correct), but it is a per-request cost. | `audit(...)` called unconditionally in `ensure` | Consider auditing denials always, allows by sampling/config, or async-batched writes. |

**Counts:** CRITICAL 0 · HIGH 2 · MEDIUM 8 · LOW 4 · NIT 3 → **17 findings**.

---

## 3. What Is Already Excellent (evidence-backed credit)

- **Clippy-clean under `pedantic` with `-D warnings`** (0/0). Few production Rust codebases pass `clippy::pedantic` as a hard gate. Evidence: full from-scratch run, exit 0.
- **No dangerous panics in any request path.** Every non-test `unwrap`/`expect` is either a `std::sync::Mutex` poison-guard held with **no `.await`** inside (realtime/mod.rs 8×, geo.rs 2×) or a parse of a **compile-time constant** (`oauth.rs:103` parses a hardcoded URL). Zero `panic!`/`unreachable!`/`todo!` in handlers. Evidence: full grep + manual classification.
- **AuthN crypto is textbook.** Argon2id with per-password OS-RNG salt (`crypto.rs:15-21`); 256-bit opaque tokens, only SHA-256 hashes stored (`crypto.rs:42-57`); **all Argon2 work on `spawn_blocking`** (auth.rs 106/159/258/265 — no Tokio worker starvation); **login pays Argon2 cost even for unknown accounts** → no user-enumeration timing oracle (auth.rs:154-169); password length cap (1024) as a CPU-DoS guard; magic-link request never reveals account existence.
- **Session lifecycle is correct.** Cookie `http_only` + `SameSite::Lax` + `Secure` (derived from https scheme) + path `/` (session.rs:79-90). `change_password` re-verifies current password and `revoke_all_for_user` evicts **both** Postgres rows and the Redis cache before re-issuing (session.rs:56-63) — closes the cached-session-after-revoke hole, with a comment explaining exactly why.
- **OAuth is full PKCE + CSRF.** S256 challenge, random verifier, server-side `state` stored with 10-min expiry and single-use `consume`, provider-name match, server-derived redirect_uri (no open redirect via that path) (oauth.rs:82-140). The final browser redirect only accepts **relative** `redirect_to` (`auth.rs:369`), closing open-redirect.
- **File handling has no path traversal.** On-disk name is always a **server-generated UUID** (`files.rs:114`), never client-derived; `sanitize_filename` strips Content-Disposition injection chars; inline uploads restricted to images; best-effort byte cleanup on failed insert.
- **SSRF defense in geo.rs is exemplary.** `is_global()` blocks private/loopback/link-local/ULA/unspecified **before any network call** (geo.rs:160-179), both timeouts set, fully tested (v4 + v6). Media-URL validation allow-lists youtube/soundcloud hosts (reactions.rs:216-228).
- **Authorization model is genuinely strong.** `authz::authorize` is pure/total/deny-by-default (lib.rs); RBAC + ABAC mappings are compiler-enforced exhaustive `match`es (rbac.rs, policy.rs); **a full subagent sweep of all 13 handler files found zero authz gaps** — every mutating/sensitive handler enforces the correct-tier `Action` before the write, no IDOR (every path-id op is room-scoped in SQL; PM reads scoped to the caller's pair). Super-admin precedence, owner-or-super for room management, last-super-admin lockout guards, kick-acts-downward-only.
- **`domain` purity holds.** `lib.rs` declares no I/O / no async; deps are only serde/uuid/time/thiserror (no sqlx/tokio). `Role` has correct privilege `Ord` and round-tripping wire format.
- **Realtime hub is the standout module.** Cross-instance fan-out via Redis pub/sub; a **privacy-critical** separation of room-wide vs per-user PM channels with a dedicated test that the parsers never cross-contaminate; ref-counted presence (last-socket-clears); kick-duplicates keeps newest per user; dedicated subscriber connection (correct fred usage). 5 of the 11 server tests cover it.
- **SQL is 100% parameterized.** No `format!`-built SQL anywhere; even runtime `query_as` strings are `&'static` literals with `.bind()` params (sqlx 0.9 `SqlSafeStr` bound enforces this). No injection surface.
- **Error architecture is clean.** Single `AppError` with stable codes, status mapping, internal causes logged-not-leaked (`error.rs`); `thiserror` at boundaries, `anyhow` for opaque internals; `From<sqlx::Error>` maps RowNotFound→404.

---

## 4. Per-Area Notes

### Errors (`error.rs`)
Idiomatic: `AppResult<T>`, `AppError` enum with `parts()` → (status, stable code, message), `IntoResponse` logs `Internal` cause via `tracing::error!` and returns a generic body. `thiserror` for the typed variants, `#[from] anyhow::Error` for the internal catch-all. `From<sqlx::Error>` treats `RowNotFound` as 404, everything else as Internal. No leakage of causes to clients. Strong.

### AuthZ (`authz` crate, `domain/authz.rs`, `authorization.rs`)
Correct and fail-closed. RBAC tiers (rbac.rs:53-78): Member = read alerts, subscribe screen, create/read messages, send PM; Admin adds alert create, screen publish, read-all PMs, room/member manage; SuperAdmin = all. ABAC (policy.rs): presenter actions allow admin+ regardless of live (member must belong, super bypasses membership); room management is owner-or-super; closed rooms read-only. `authorization.rs` bridges to DB, audits every decision, maps deny→403. The "exhaustively tested" claim is **substantially true at the `authorize` level** (11-case matrix in lib.rs) but **policy.rs has 0 direct unit tests** — coverage of e.g. `read_all_private_messages` with a `PrivateMessage` resource and the `require_room` error arms is indirect. Recommend adding policy-level tests for completeness.

### AuthN / Crypto (`auth/*.rs`, `crypto.rs`)
See §3 credit. Residual risks: F-01 (dev bypass), F-04 (OAuth client timeouts). Token comparison is by SHA-256 hash DB-lookup (not constant-time at SQL), which is acceptable because the looked-up value is a 256-bit random secret, not a low-entropy credential.

### SQL / Injection (`db/*.rs`)
100% parameterized; no dynamic SQL. Transactions used where they matter (`polls::create`, `reactions::toggle`, `users::delete` all `begin()`/`commit()`), but **register and room-create are non-atomic** (F-02, F-03). One N+1 (F-10). Pool is minimally configured: `max_connections(10)` only, all other `PgPoolOptions` at defaults (`db/mod.rs:31-36`) — consider `acquire_timeout`, `idle_timeout`, `max_lifetime`.

### Concurrency / Async
Clean. No `std::fs` in async, no `block_in_place`, no lock held across `.await` (the only `std::sync::Mutex` guards in geo.rs/realtime are sync-scoped). All Argon2 on `spawn_blocking` (5×). Broadcast backpressure handled (lagged frames dropped, slow WS closed). Residual: F-07 (download buffering), F-08 (WS inbound cap), and the realtime dispatcher is a single `tokio::spawn` with no restart-on-exit (logs "dispatcher stopped" and ends — a Redis subscriber drop would silently stop all fan-out; consider supervising/respawning).

### DB / Migrations (0001–0013)
FKs, cascades (CASCADE for child content, RESTRICT for authored records, SET NULL for soft authorship), NOT NULL, and UNIQUE (email, session/magic token hashes, slugs, provider+subject, vote/reaction uniqueness) are well-designed. **No floating-point or money columns exist** (chat/alert app, not payments) — the "money must be i64" requirement is moot; file size / vote / reaction counts are correctly `bigint`/`count(*)→i64`, positions `int→i32`. Gaps: missing FK-column indexes (F-09); `0009` adds nullable booleans where `NOT NULL DEFAULT false` would match the rest.

### LiveKit (`livekit.rs`)
Correct and minimal. HS256 JWT minted directly (no SDK), grants derived from authz: `can_publish` comes from the upstream `Grant` (only admins/super who pass `PublishScreen` get it — verified at `rooms.rs:350` `ctx.allows(PublishScreen)`), `can_subscribe: true`, `room_join: true`, 6h TTL with `nbf`/`exp`, secret from config. No secret logging.

### Config / Observability (`config.rs`, `main.rs`)
Fail-fast: `SESSION_SECRET` required + length-validated (≥32), `DATABASE_URL` required, `SESSION_TTL_HOURS` parse-validated; optional feature groups (LiveKit/OAuth/SMTP) all-or-nothing. `truthy()` is strict (`1`/`true` only). Tracing via `EnvFilter` with sane default. Gaps: **no graceful shutdown** (F-06), **`catch_panic` enabled-but-unused** (F-05), `panic=abort` not set (default unwind — acceptable, and arguably preferable for per-task isolation, but pairs poorly with the unused catch-panic). No `[profile.release]` tuning section.

---

## 5. Toolchain Evidence (verbatim summary)

```
build:   SQLX_OFFLINE=true cargo build --all-targets         → Finished, exit 0
clippy:  SQLX_OFFLINE=true cargo clippy --all-targets \
         --all-features -- -D warnings                        → Finished (1m12s), exit 0, ZERO warnings
test:    cargo test --all                                     → authz 11 / domain 3 / server 11 = 25 passed, 0 failed
fmt:     cargo fmt --all -- --check                           → exit 1, 4 drift blocks
audit:   cargo audit                                          → 1 vulnerability (RUSTSEC-2023-0071, rsa 0.9.10, medium 5.9, no fix)
tree -i: cargo tree -i rsa                                    → rsa ← jsonwebtoken ← server (HS256 only; RSA path unreachable)
```

---

## 6. Verdict

This backend is **high enterprise quality and genuinely maintainable-for-15-years** Rust: it passes a `clippy::pedantic -D warnings` hard gate clean, carries zero dangerous panics in request paths, has textbook AuthN crypto, a pure/tested RBAC+ABAC engine enforced without gaps across every handler, parameterized SQL throughout, and an unusually well-engineered realtime hub. No CRITICAL issues were found.

The gap between "excellent" and "flawless" is small and concrete: **harden `AUTH_DEV_BYPASS` (F-01)** and **make register + room-create atomic (F-02/F-03)** are the two that matter most; the rest are robustness polish (OAuth timeouts, catch-panic + graceful shutdown wiring, download streaming, FK indexes, the one N+1, fmt). Address F-01 through F-06 and this is a reference-grade service.
