# Forensic Integration / DevOps / Supply-Chain Audit — `pro-room`

- **Date:** 2026-06-21
- **Auditor role:** Distinguished Principal / Staff Platform Engineer (integration seam only)
- **Scope:** The end-to-end glue between `web/` (SvelteKit/TS) and `server/` (Rust/Axum): wire-contract (HTTP/JSON + WebSocket + session cookie), DevOps/config/reproducibility, security & secret hygiene, docs accuracy, 15-year maintainability. **NOT** in scope: internal app logic of either app (covered by the two app-specific auditors).
- **Method:** Read-only. Every assertion is backed by a `file:line`, command output, or a doc reference. No source files were modified.
- **Branch audited:** `claude/sleepy-hypatia-zriciq` · Remote `billyribeiro-ux/pro-room`.

---

## 1. Metrics / Summary Table

| Dimension | Result |
| --- | --- |
| WS event variants (server `RoomEvent`) | 16 (`realtime/event.rs:12-88`) |
| WS event cases handled by web | 16/16 (`web/src/routes/rooms/[id]/+page.svelte:251-361`) — **complete** |
| REST domains cross-checked thoroughly | 8 (alerts, messages, private_messages, badges, branding, files, notes, questions) + spot (auth/me, rooms detail, polls, reactions, livekit token) |
| Field-name mismatches found | **0** |
| Casing mismatches (snake vs camel) | **0** |
| Enum-value mismatches | **0** |
| Type mismatches (Option↔nullable etc.) | **0 hard bugs**; 5 intentional required-vs-optional asymmetries; 1 `i64→number` precision edge |
| Money fields end-to-end | **None exist** — no price/amount/money column in any migration; the only `BIGINT` is `file.size_bytes` |
| Auth cookie contract | Consistent (`proom_session`, httpOnly, SameSite=Lax, Secure-on-https) ↔ web `credentials:'include'` |
| CORS | `allow_credentials(true)` + explicit origin list (not wildcard) — correct |
| Env-var documentation coverage | server 19/19 documented; web 7/7 documented — **complete** |
| `.env.example` correctness | **2 wrong port defaults** (DB 5432, Redis 6379) vs compose (5433/6380) — fresh copy fails to connect |
| CI/CD | **ABSENT** — no `.github/workflows/`, no app Dockerfile |
| Committed secrets / private keys | None real. Only labelled dev LiveKit key pair + weak dev DB password |
| GitHub secret-scanning (MCP) | **Unavailable** — "Repository does not have GitHub Advanced Security enabled" |
| `.sqlx` offline cache | Safe — SQL + type metadata only, no secrets (spot-checked) |
| LICENSE file | **MISSING** (Cargo declares `license = "MIT"`, no `LICENSE` on disk) |
| CONTRIBUTING / runbook | **MISSING** |
| Node pin drift | `.nvmrc` 24.16.0 vs installed v22.22.2 |
| Rust toolchain pin | `channel = "stable"` (floating, not pinned to 1.94) |
| `docs/` size | **111 MB** (mostly visual-evidence PNGs) |
| Integration tests across the seam | **None** (e2e is web-only Playwright; no contract test) |

---

## 2. Severity-Ranked Findings

CRITICAL = data loss / breach / total outage. HIGH = breaks the seam, a security gap, or a missing mandated gate. MEDIUM = correctness/repro/maintainability with a workaround. LOW/NIT = polish.

| ID | Sev | Location | Finding | Evidence | Fix |
| --- | --- | --- | --- | --- | --- |
| **I-01** | **HIGH** | repo root | **No CI/CD.** No `.github/workflows/`. The brief mandates svelte-check + clippy gates; nothing enforces them. Over a 15-year horizon, regressions to the wire contract land unchecked. | `ls .github/workflows` → absent (DevOps agent sweep). `web/package.json:11-17` defines `check`/`lint`/`test` but no runner invokes them. | Add a GH Actions workflow: `cargo clippy --all -- -D warnings`, `cargo test`, `svelte-check`, `eslint`, `vitest`, `cargo sqlx prepare --check`. Gate merges. |
| **I-02** | **HIGH** | `server/.env.example:12,15` | **`.env.example` DB/Redis ports don't match compose.** Example `DATABASE_URL=...localhost:5432` and `REDIS_URL=...localhost:6379`, but compose publishes Postgres on host **5433** and Redis on **6380**. A dev copying the example per the README quickstart cannot connect. | `server/.env.example:12` (`5432`), `:15` (`6379`); `compose.yaml:13` (`"5433:5432"`), `:28` (`"6380:6379"`). The compose comment at `compose.yaml:11-12` claims the env "matches". | Change example to `5433`/`6380`, or change compose to publish `5432`/`6379`. Pick one and make all three (env, compose, README) agree. |
| **I-03** | **MEDIUM** | repo root | **No app Dockerfile / production image** for either `web` or `server`. Only infra images run in compose; the apps themselves have no reproducible container build. Deploy target is inferred Vercel (`@sveltejs/adapter-vercel`) for web; server has no documented prod packaging. | No `Dockerfile*` found anywhere outside `node_modules`. `web/package.json:22` adapter-vercel; `server/Cargo.toml` has **no** `[profile.release]`. | Add multi-stage Dockerfiles; add a tuned `[profile.release]` (lto, `opt-level`, `strip`) for the server. |
| **I-04** | **MEDIUM** | `server/.env.example:39-40`, `livekit.yaml:30` | **Working LiveKit dev key pair committed** (`devkey` / `proom_local_livekit_dev_secret_0123456789`). Clearly labelled dev-only, but a real working pair in the repo invites reuse in a shared/exposed deployment. Weak Postgres password `proroom` likewise (`compose.yaml:8`). | `server/.env.example:39-40`; `livekit.yaml:30`; `compose.yaml:7-9`. | Acceptable for local dev; document loudly that prod MUST override via env. Consider generating a random dev secret at first `compose up` instead of committing one. |
| **I-05** | **MEDIUM** | repo root | **No LICENSE file** although `server/Cargo.toml:9` declares `license = "MIT"`. License metadata without the text is legally incomplete for a 15-year asset. | `ls LICENSE*` → none; `server/Cargo.toml` `[workspace.package] license = "MIT"`. | Add a top-level `LICENSE` (MIT) matching the Cargo declaration. |
| **I-06** | **MEDIUM** | `README.md:15` | **Stale doc: README claims "Phosphor icons"** but the app uses **Font Awesome 5 Free 5.8.1**. A future maintainer chasing an icon bug is misled. | `README.md:15` ("Phosphor icons") vs `Icon.svelte:1-30` (`<i class="fas fa-…">`), `web/package.json:46` (`@fortawesome/fontawesome-free": "5.8.1"`), and the brief `docs/NEW-SESSION-BRIEF.md:43-44,66` ("Font Awesome 5 Free 5.8.1"). No Phosphor dependency exists. | Replace "Phosphor icons" with "Font Awesome 5 Free 5.8.1" in README. |
| **I-07** | **MEDIUM** | repo root | **Repo bloat: `docs/` is 111 MB**, dominated by `docs/reference/visual-evidence*/` PNG capture dumps. These are forensic reverse-engineering artifacts, not living source; they balloon clone size for 15 years. | `du -sh docs` → 111M; `find docs` shows hundreds of `*.html.png` fragments under `visual-evidence-deep/`. | Move bulky binary captures out of the main tree (git-lfs, a separate `pro-room-reference` repo, or an archived release asset). Keep the `*.md` analyses + `report.md` artifacts. |
| **I-08** | **MEDIUM** | `.nvmrc` / `rust-toolchain.toml` | **Pin drift / floating pins.** `.nvmrc` pins Node 24.16.0 but the audit host runs v22.22.2; `rust-toolchain.toml` uses `channel = "stable"` (floating) while the workspace claims `rust-version = "1.94"`. Floating + drift undermines reproducibility. | `.nvmrc` → `24.16.0`; `node --version` → `v22.22.2`; `server/rust-toolchain.toml` `channel = "stable"`; `server/Cargo.toml` `rust-version = "1.94"`. | Pin `rust-toolchain.toml` to `channel = "1.94"` (or the validated version). Ensure CI uses the `.nvmrc` Node. |
| **I-09** | **MEDIUM** | `web/package.json:20,29,39,41,42` | **Bleeding-edge major versions.** eslint `^10`, typescript `^6`, vite `^8`, vitest `^4`, `@sveltejs/vite-plugin-svelte ^7`, svelte `^5.56`. Several are ahead of mainstream stable; `^` ranges allow silent minor/patch drift with no lockfile gate in CI. | `web/package.json:20-42`. `pnpm-lock.yaml` exists (good) but I-01 means nothing verifies installs. | Keep the lockfile authoritative; add `--frozen-lockfile` installs in CI; schedule periodic dependency review. |
| **I-10** | **LOW** | `domain/src/entities.rs:198` ↔ `web/src/lib/types.ts:142` | **`File.size_bytes` is `i64`/`BIGINT` → JS `number`.** Values > 2^53 lose precision. Practically safe (25 MB upload cap, `http/files.rs:25`), but the clamp `i64::try_from(...).unwrap_or(i64::MAX)` (`http/files.rs:121`) could in theory emit `9223372036854775807`, not round-trippable as a JS number. Same class: `PollDetail.total_votes`, `PollOptionResult.votes` (`entities.rs:267,283`). | `entities.rs:198` (`size_bytes: i64`); `types.ts:142` (`size_bytes: number`). | Document the contract; if any count could realistically exceed 2^53 in future, serialize as string. No action needed today. |
| **I-11** | **LOW** | `compose.yaml:43-55` | **LiveKit service has no healthcheck** (Postgres and Redis do). Compose `depends_on` can't gate on LiveKit readiness. | `compose.yaml:16-20` (pg healthcheck), `:31-35` (redis), LiveKit block `:43-55` has none. | Add a LiveKit healthcheck (HTTP `/` on the RTC port) for parity. |
| **I-12** | **LOW** | `compose.yaml:5,23` | **Images pinned to floating major tags, not digests.** `postgres:16-alpine`, `redis:7-alpine` move under you; only `livekit/livekit-server:v1.13.1` is fully pinned. | `compose.yaml:5` (`postgres:16-alpine`), `:23` (`redis:7-alpine`), `:47` (`livekit/livekit-server:v1.13.1`). | For long-lived reproducibility, pin by digest (`@sha256:…`). |
| **I-13** | **NIT** | `stores/brand.svelte.ts:22-25` & `BrandingModal.svelte:16-19` | **`BrandingResponse` interface declared twice**, identical shape. Both agree with server `BrandingView` (`http/branding.rs:39-45`) today; future drift risk. | duplicate interfaces at both locations. | Export one shared interface; import in both. |
| **I-14** | **NIT** | repo root | **No CONTRIBUTING, no runbook/observability doc.** For a 15-year horizon, onboarding + ops knowledge lives only in the brief. | no `CONTRIBUTING*`; README "Development" is the only ops guidance. | Add CONTRIBUTING + a short runbook (migrations, env, deploy, on-call). |
| **I-15** | **NIT** | repo root | **No cross-seam integration/contract test.** Web e2e (`web/e2e/*.e2e.ts`) is browser-only; nothing asserts the Rust JSON shape matches the TS types. The only safety net is hand-maintained parallel type declarations. | `web/e2e/` Playwright specs; no shared schema/codegen. | Generate TS types from Rust (e.g. `ts-rs`/`schemars`) or add a contract test that hits the live API and validates against valibot schemas. |

**Severity counts:** CRITICAL **0** · HIGH **2** · MEDIUM **7** · LOW **3** · NIT **3** → **15 findings**.

---

## 3. Wire-Contract Matrix

Casing convention (verified): the server's serialized view structs carry already-`snake_case` field names with default serde (no `rename_all` except domain enums, which are `#[serde(rename_all="snake_case")]`). The web declares `snake_case` TS interfaces to match. All `*Id` newtypes are `#[serde(transparent)]` over `Uuid` → JSON string → TS `string`. All timestamps use `#[serde(with="time::serde::rfc3339")]` → string → TS `string`.

### 3a. WebSocket events (`RoomEvent`)

Server `realtime/event.rs:12-88` is `#[serde(tag="type", rename_all="snake_case")]`. The `Media(MediaBroadcast)` newtype variant **flattens** under internal tagging (verified empirically: a standalone serde repro emitted `{"type":"media","kind":"youtube","url":"u"}` and `{"type":"media","kind":"stop"}` for the `None` url; `ChatCleared{}` → `{"type":"chat_cleared"}`).

| Server variant (`event.rs`) | Wire `type` | Web variant (`types.ts`) | Match? | Evidence |
| --- | --- | --- | --- | --- |
| `Alert{alert,author_name,author_badges}` | `alert` | `{type:'alert';alert;author_name;author_badges?}` | ✅ | event.rs:15 ↔ types.ts:205 |
| `Chat{message,author_name,author_role,author_badges}` | `chat` | `{type:'chat';message;author_name;author_role;author_badges?}` | ✅ | event.rs:24 ↔ types.ts:206-212 |
| `Caption{speaker_name,text}` | `caption` | `{type:'caption';speaker_name;text}` | ✅ | event.rs:33 ↔ types.ts:214 |
| `Presence{users}` | `presence` | `{type:'presence';users:PresentUser[]}` | ✅ | event.rs:35 ↔ types.ts:215 |
| `Live{is_live}` | `live` | `{type:'live';is_live}` | ✅ | event.rs:37 ↔ types.ts:216 |
| `Poll{poll}` | `poll` | `{type:'poll';poll:PollDetail}` | ✅ | event.rs:39 ↔ types.ts:217 |
| `Reaction{reaction}` | `reaction` | `{type:'reaction';reaction:ReactionSummary}` | ✅ | event.rs:45 ↔ types.ts:218 |
| `Media(MediaBroadcast{kind,url?})` | `media` | `{type:'media';kind:MediaKind;url?}` | ✅ (flattened) | event.rs:49,93-98 ↔ types.ts:219 (empirically verified flat) |
| `Kicked{user_id,message?}` | `kicked` | `{type:'kicked';user_id;message?}` | ✅ | event.rs:54 ↔ types.ts:221 |
| `MuteAll{muted}` | `mute_all` | `{type:'mute_all';muted}` | ✅ | event.rs:62 ↔ types.ts:222 |
| `ChatCleared{}` | `chat_cleared` | `{type:'chat_cleared'}` | ✅ (`{}` emits no extra keys) | event.rs:65 ↔ types.ts:223 |
| `RoomLocked{locked}` | `room_locked` | `{type:'room_locked';locked}` | ✅ | event.rs:69 ↔ types.ts:224 |
| `ScreenLocked{locked}` | `screen_locked` | `{type:'screen_locked';locked}` | ✅ | event.rs:73 ↔ types.ts:226 |
| `MessageDeleted{id}` | `message_deleted` | `{type:'message_deleted';id}` | ✅ | event.rs:76 ↔ types.ts:227 |
| `AlertDeleted{id}` | `alert_deleted` | `{type:'alert_deleted';id}` | ✅ | event.rs:79 ↔ types.ts:228 |
| `PrivateMessage{message}` | `private_message` | `{type:'private_message';message:PrivateMessageView}` | ✅ | event.rs:87 ↔ types.ts:213 |

`MediaKind` enum: Rust `#[serde(rename_all="snake_case")]` → `soundcloud/youtube/mp3/video/stop` (`event.rs:101-111`) ↔ TS `MediaKind` (`types.ts:171`). ✅ All 16 variants are dispatched in `+page.svelte:251-361` — **complete coverage, zero unhandled variants, zero unknown variants.**

### 3b. REST DTOs (verbatim from deep field-by-field sweep)

| Domain | Server type (file) | Web type (file) | Verdict |
| --- | --- | --- | --- |
| auth /me | `MeResponse{user:PublicUser,permissions:Vec<String>}` (`http/auth.rs:50-61`) | `Me{user,permissions:string[]}` + `PublicUser` (`types.ts:9-19`) | ✅ all fields match |
| rooms detail | `RoomDetail{room,your_role:Option<Role>,is_member,viewer_id,capabilities}` + `RoomCapabilities` (5 bools) (`http/rooms.rs:39-55`) | `RoomDetail`+`RoomCapabilities` (`types.ts:40-55`) | ✅ all fields match |
| alerts | `AlertView` (`db/alerts.rs:51-67`); create returns domain `Alert` (`entities.rs:118-129`) | `Alert` (`types.ts:88-102`) | ✅ names/types; `author_name`/`author_badges` optional-on-create (intentional) |
| messages | `MessageView` (`db/messages.rs:13-30`); create returns domain `Message` (`entities.rs:131-141`) | `Message` (`types.ts:104-118`) | ✅; `author_name/role/badges` optional-on-create (intentional). `channel` only ever `main`/`off_topic` (`http/messages.rs:26-32`) ↔ `ChatChannel` |
| private_messages | `PrivateMessageView` (`db/private_messages.rs:22-33`), `PrivateThreadSummary` (`:65-72`) | `PrivateMessageView`, `PrivateThreadSummary` (`types.ts:185-202`) | ✅ fully aligned, all required both sides |
| badges | `Badge` (`db/badges.rs:17-26`), `AuthorBadges` (`:31-41`) | `Badge`, `AuthorBadges` (`types.ts:69-86`) | ✅ |
| branding | `BrandingView{name:Option,logo_url:Option}` (`http/branding.rs:39-45`) | `BrandingResponse` (`stores/brand.svelte.ts:22-25`, dup in `BrandingModal.svelte:16-19`) | ✅ (see NIT I-13) |
| files | domain `File` (`entities.rs:192-203`) | `RoomFile` (`types.ts:137-146`) | ✅; `size_bytes:i64→number` (see I-10) |
| notes | domain `Note` (`entities.rs:342-353`) | `Note` (`types.ts:125-133`) | ✅ |
| questions | domain `Question` (`entities.rs:216-232`) | `Question` (`web/src/lib/qa.ts:12-25`) | ✅ |
| polls | `PollDetail`+`PollOptionResult` (`entities.rs:262-284`) | `PollDetail`+`PollOptionResult` (`web/src/lib/poll.ts:13-34`) | ✅; `votes`/`total_votes` `i64→number` (I-10 class) |
| reactions | `ReactionSummary`+`ReactionTally` (`entities.rs:320-337`), `target_kind` `message`/`alert` | `ReactionSummary`+`ReactionTally` (`types.ts:154-166`) | ✅; `count:i32→number` safe |
| livekit token | `LiveKitTokenResponse{url,token,can_publish}` (`http/rooms.rs:328-333`) | `LiveKitToken{url,token,can_publish}` (`types.ts:148-152`) | ✅ |

**Required-vs-optional asymmetries (intentional, not bugs):** POST `/alerts` and POST `/messages` return the bare domain struct (no author enrichment), so `author_name`/`author_role`/`author_badges` are correctly modelled `?`-optional in TS, while the list endpoints / WS events return the enriched `*View` with those fields always present. `entities.rs:118-141` (bare) vs `db/alerts.rs:63-66`, `db/messages.rs:22-29` (enriched).

### 3c. Money trace

**There is no money field in the system.** Every migration was scanned: the only `BIGINT` is `size_bytes` (`migrations/0005_files.sql:6`). Trade alerts (`migrations`/`entities.rs:118-129`) carry `symbol`, `side`, `note` (free text) — no price/qty/amount. So the "money is i64 end-to-end" mandate resolves to: **no money to lose precision on**; the only i64-on-the-wire concern is the file-size edge in I-10. This should be stated explicitly so a future "add P&L / position size" feature consciously chooses `i64`/`BIGINT` (cents) and never `f64`.

### 3d. Auth cookie + CORS contract

| Property | Server | Web | Match? |
| --- | --- | --- | --- |
| Cookie name | `proom_session` (`auth/session.rs:17`) | sent automatically via `credentials:'include'` (`api.ts:23`) | ✅ |
| httpOnly | `.http_only(true)` (`session.rs:82`) | n/a (browser-managed) | ✅ |
| SameSite | `Lax` (`session.rs:83`) | cross-origin same-site (localhost:5173 ↔ :8080) works under Lax for top-level nav + `include` | ✅ |
| Secure | `https`-conditional (`session.rs:80,93`) | http in dev | ✅ |
| CORS origins | explicit list, not `*` (`http/mod.rs:58-77`) | `PUBLIC_API_URL` (`config.ts:4`) | ✅ |
| CORS credentials | `allow_credentials(true)` (`http/mod.rs:68`) | `credentials:'include'` (`api.ts:23`) | ✅ — and origins are explicit, so the browser's "no wildcard with credentials" rule is satisfied |

---

## 4. Secret-Scan & Supply-Chain Result

- **GitHub secret-scanning MCP (`mcp__github__run_secret_scanning`)** on `billyribeiro-ux/pro-room`: **NOT available** — returned `Repository does not have GitHub Advanced Security enabled`. No managed secret-scanning is running on this repo (a HIGH-adjacent gap if this were a public/production repo; recommend enabling GHAS secret scanning + push protection, or a `gitleaks` CI step).
- **Manual scan:** No `BEGIN PRIVATE KEY`/`BEGIN RSA`, no AWS `AKIA…`, no JWT blobs, no real `.env` tracked or in git history (`git log --all -- '*.env'` empty). Only secret-ish tracked files: `server/.env.example`, `web/.env.example`, `script-results/audit/theme-tokens.json` (benign). The only committed real-looking secrets are the **labelled dev** LiveKit pair (I-04).
- **`.gitignore`** correctly excludes `.env`/`.env.*` (allowlisting `.env.example`), `/server/target`, `node_modules/`, `/web/build`, `/web/.svelte-kit`, `*.rdb`, `server/uploads/`.
- **`.sqlx` offline cache** (35 files): spot-checked — contains only `db_name`, SQL `query` text, column/parameter type metadata, and a hash. **No secrets, no connection strings.** Safe to commit.

---

## 5. What Is Already Excellent (evidence-backed)

1. **The wire contract is genuinely tight.** Across 16 WS variants and 13 REST domains: **zero** field-name, casing, or enum-value mismatches. The web hand-maintains TS interfaces that track the Rust shapes faithfully (full matrix §3).
2. **Complete WS event coverage** — the web `+page.svelte:251-361` switch handles all 16 server variants with no dead/missing cases.
3. **Serde edge handled correctly.** The internally-tagged `Media(MediaBroadcast)` newtype flattens to a flat `{type,kind,url?}` (empirically verified) exactly as the TS union expects — an easy thing to get wrong, gotten right.
4. **Privacy boundary by construction.** `PrivateMessage` is delivered only via the per-user channel (`http/ws.rs:75,109-117`), never the room broadcast — enforced by two separate receivers, not by a runtime filter.
5. **Cookie + CORS are textbook-correct for credentialed cross-origin:** httpOnly, SameSite=Lax, https-conditional Secure, explicit (non-wildcard) origins with `allow_credentials(true)`, cookie-only auth (no token in JS, no Authorization header to CORS-expose).
6. **Env-var documentation is complete** — every var the code reads (server 19, web 7) is documented in the corresponding `.env.example`; no undocumented and no stale vars (aside from the port-default bug I-02).
7. **`AUTH_DEV_BYPASS` is fenced** — default off, only opt-in via truthy value, logs a `tracing::warn!` on every bypassed request (`auth/session.rs:121-155`, `config.rs:130-137`).
8. **Money precision is a non-issue by design** — no float money anywhere; counts that touch `i64` (`votes`, `total_votes`) are bounded by reality and the only real `BIGINT` (`size_bytes`) is gated by a 25 MB upload cap.
9. **`.sqlx` offline cache committed** — enables reproducible builds without a live DB, and is secret-free.
10. **Infra images are version-tagged, not `:latest`,** with Postgres/Redis healthchecks and named persistent volumes (`compose.yaml`).

---

## 6. Top Recommendations (priority order)

1. **Add CI** (clippy `-D warnings`, cargo test, svelte-check, eslint, vitest, `sqlx prepare --check`, `--frozen-lockfile`) — closes I-01 and would have caught I-02 and I-06 automatically.
2. **Fix the `.env.example` ports** (I-02) so the README quickstart works.
3. **Add app Dockerfiles + a `[profile.release]`** and pin the Rust toolchain (I-03, I-08).
4. **Add LICENSE + CONTRIBUTING + a contract test / type-codegen across the seam** (I-05, I-14, I-15).
5. **Relocate the 111 MB visual-evidence dump** out of the main tree and **fix the README icon claim** (I-07, I-06).

---

*End of report. Read-only audit — no source files were modified.*
