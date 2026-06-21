# Per-File Forensic Audit — Master Index (2026-06-21)

**Repo:** `billyribeiro-ux/pro-room` · branch `claude/sleepy-hypatia-zriciq`
**Method:** 8 parallel **Opus 4.8** sub-agents, one explicit file list each, **every source file audited end-to-end** against documentation **physically pulled per file**:

- **Svelte/SvelteKit** — `mcp__svelte__svelte-autofixer` run on **every** `.svelte`/`.svelte.ts` file (result recorded verbatim) + `mcp__svelte__get-documentation` / `list-sections` pulled and the exact section path cited per finding.
- **Rust** — there is **no Rust MCP server** in this environment (verified twice; only `svelte`, `github`, `Linear`, `Google_Drive` are wired). Authoritative crate docs were pulled from **docs.rs via WebFetch** per crate/file, paired with the live `cargo`/`clippy 1.94.1` ground truth (workspace clippy `--all-targets --all-features -D warnings` = **0/0**, 25 tests pass).

> This index aggregates the eight area reports in this directory. Each contains a dedicated per-file block (path · LOC · purpose · docs pulled · autofixer/docs.rs evidence · findings).

## Coverage & per-area results

| Area | Files | autofixer issues | C | H | M | L | Report |
|---|---|---|---|---|---|---|---|
| Frontend — components | 29 | **0 / 29** | 0 | 6 | 21 | 35 | `web-components.md` |
| Frontend — modals | 26 | 1 / 26¹ | 0 | 0 | 2 | ~8 | `web-modals.md` |
| Frontend — lib (`.svelte.ts`+`.ts`) | 33 | 1 / 33² | 0 | 0 | 2 | 9 | `web-lib-ts.md` |
| Frontend — routes/app/e2e | 17 | **0 / 9³** | 0 | 2 | 11 | 28 | `web-routes.md` |
| Backend — domain/authz/auth/crypto | 17 | n/a | 0 | 1 | 4 | 11 | `rust-core-security.md` |
| Backend — db + 13 migrations | 19+13 | n/a | 0 | 1 | 4 | 5 | `rust-db.md` |
| Backend — http handlers | 17 | n/a | 0 | 0 | 2 | 3 | `rust-http.md` |
| Backend — realtime/cache/infra | 13 | n/a | 0 | 4 | 7 | 14 | `rust-realtime-infra.md` |
| **TOTAL** | **~184 file-units** | **2 non-blocking** | **0** | **14** | **53** | **113** | — |

¹ UserInfoModal: 2× `css_unused_selector` — an isolated-compile artifact of a `:global(...) > .local-class` selector targeting slotted snippet content; harmless at runtime.
² realtime.svelte.ts: an autofixer parser artifact on TS `private` constructor-parameter properties; not a reactivity defect.
³ 9 route `.svelte` files all returned `issues: []`; the other 8 are `.ts`/`.css`/`.html`/e2e (no autofixer).

**Headline:** **0 CRITICAL** across all ~184 file-units. `svelte-autofixer` returned `issues: []` for **every** component and route file; the only two non-empty results are documented isolated-compile artifacts. SQL is **100% parameterized**; all 3 DB transactions correct; every HTTP route authz-gated and fail-closed (0 IDOR). No raw/unsanitized `{@html}` anywhere.

## Consolidated HIGH findings (actionable, doc-grounded)

| # | Area | `file:line` | Finding |
|---|---|---|---|
| H1 | realtime | `realtime/mod.rs` (`cache/mod.rs` builder) | fred subscriber never calls `manage_subscriptions()` → after **any** Redis reconnect, pub/sub channels are never re-subscribed and **realtime (chat/alerts/presence) dies for the process lifetime**. docs.rs `SubscriberClient`. |
| H2 | realtime | `config.rs` | Secret-bearing config derives `#[derive(Debug)]` with no redaction → secrets can hit logs. |
| H3 | realtime | `main.rs:55-60` | No `tokio::signal` graceful shutdown → SIGTERM/redeploy hard-kills in-flight requests + all WebSockets. |
| H4 | realtime | `realtime/mod.rs` | Dispatcher task has no supervision on `Closed` (compounds H1). |
| H5 | core-sec | `auth/session.rs:126` | `AUTH_DEV_BYPASS` (synthetic super-admin) has no `cfg(debug_assertions)`/startup-refusal fence — a single prod env var disables auth. |
| H6 | db | `db/polls.rs:160-177` | `list_active` N+1: one option-tally query per poll (perf, not correctness/security). |
| H7-8 | components | `AlertsChatDock.svelte`, `PollModal.svelte` | Drag `window` listeners leak if the panel unmounts mid-drag (no teardown on the drag effect). |
| H9 | components | `Modal.svelte` | `aria-modal` dialog has focus restore but **no focus trap** (Tab escapes); inherited by ~30 modals. |
| H10 | components | `ChatPanel.svelte` | `.username` has `cursor:pointer` with no handler/role — misleading affordance. |
| H11 | components | `AlertQaModal.svelte` | Backdrop click-to-close on a static element w/o key handler (window-Escape mitigates). |
| H12-13 | routes | `+layout.svelte:42-51`, `admin/users/+page.svelte:12` | `ssr=false` SPA ⇒ all auth/authz is **client-side advisory UI**; real enforcement must (and does) live in the Rust API. By-design, but document the trust boundary. |

## Highest-value MEDIUMs (new in this pass, beyond the first audit)

- `http/files.rs` + `http/mod.rs` — axum's `Multipart`/`Json` default **2 MB** body limit makes the advertised **25 MB** upload cap unreachable (no `DefaultBodyLimit` anywhere). docs.rs `axum::extract`.
- `http/ws.rs` — WS inbound uncapped (defaults 64 MiB message / 16 MiB frame); each frame triggers a Redis presence write.
- `routes/rooms/[id]/+page.svelte:51` — `const roomId = page.params.id` read **once** → stale on same-route `/rooms/A→/rooms/B` nav (WS/LiveKit never re-target). Fix: `$derived(page.params.id)` or `{#key}`. docs: `kit/state-management`.
- `lib/api.ts:42` — every server response is an unchecked `as T`; valibot exists in `schemas.ts` but isn't wired into the response boundary.
- `modals/RichTextEditorModal.svelte:110` — contenteditable HTML emitted to `onSave` **unsanitized** (no in-file `{@html}` sink, hence MED).
- `db/users.rs` `::text` enum cast + un-indexed `room_members.user_id` / `messages.channel` join columns.
- `cache/ratelimit.rs` INCR/EXPIRE race → a TTL-less wedged bucket can self-DoS a user.
- `auth/oauth.rs:263` — OAuth `reqwest` client has no `.timeout()` (geo.rs sets both) → can hang.

## What is already excellent (evidence-backed)

- **AuthZ:** pure, total, fail-closed RBAC+ABAC engine; compiler-enforced exhaustive matches; a full sweep of all 13 handler files found every sensitive route gated — **0 IDOR**.
- **AuthN:** Argon2id (defaults meet OWASP) on `spawn_blocking`; login pays hash cost for unknown accounts (no enumeration oracle); 256-bit tokens hashed at rest; full PKCE+CSRF OAuth with relative-only redirect; atomic single-use magic links.
- **Data:** 100% parameterized SQL (the lone `format!` builds an error string); all transactions `begin`+`commit`; money concept is `i64` end-to-end (the one BIGINT, `files.size_bytes`, is `i64`).
- **Svelte 5:** zero legacy patterns (`export let`/`$:`/`on:`/`<slot>`) anywhere; every store obeys "no exported reassigned `$state`"; canonical `$effect.pre` autoscroll; the only `{@html}` (NotesPanel) is DOMPurify-sanitized.
- **Realtime:** cross-instance Redis fan-out with a privacy-critical room-vs-PM channel split (tested against cross-contamination).

## Caveats (cannot be verified in this headless environment)
- **FA7 visual fidelity** — all **103** referenced glyphs verified *present* in FA7-free, but FA7 redrew some icons. Run `web/scripts/pixel-diff.mjs` in a browser before merge.
- **Playwright e2e** (25 tests) compile/enumerate but need live backend + browser + LiveKit infra to run.
- **Live DB queries** — `.sqlx` offline data validates compile-time; no live Postgres was available to execute against.
