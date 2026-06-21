# ProTradingRoom — Master Forensic E2E Audit & Dependency-Currency Report

**Date:** 2026-06-21 · **Branch:** `claude/sleepy-hypatia-zriciq`
**Scope:** entire repository — `web/` (SvelteKit 2 / Svelte 5 runes / TS strict) and
`server/` (Rust 2024 / Axum / SQLx / Redis / LiveKit), plus the integration seam,
DevOps, and supply chain.

## Method (hard evidence only)
Three Opus 4.8 sub-agents ran **in parallel** (frontend / backend / integration),
each gathering ground-truth from the **real toolchain** (not opinion): `pnpm check`,
`eslint`, `vite build`, `vitest`, `playwright --list`; `cargo build`,
`cargo clippy -D warnings`, `cargo test`, `cargo fmt --check`, `cargo audit`. Svelte
claims were checked against the **Svelte MCP** docs + `svelte-autofixer`; Rust/crate
claims against **docs.rs**. Every finding cites `file:line` + the command output or doc
section that proves it. Full detail lives in the four companion reports:

- `docs/forensics/audit-frontend-2026-06-21.md`
- `docs/forensics/audit-backend-2026-06-21.md`
- `docs/forensics/audit-integration-2026-06-21.md`
- `docs/forensics/upgrade-web-2026-06-21.md`

## Toolchain ground-truth (exact)

| Gate | Result |
| --- | --- |
| `pnpm run check` (svelte-check) | **0 errors / 2 warnings** (pre-existing unused-CSS `:global` false positives) |
| `pnpm run build` (vite, adapter-vercel) | **PASS** |
| `pnpm run lint` (prettier) | **PASS** (was 12 files drifted → reformatted) |
| `pnpm run lint` (eslint) | 9 problems — **6 doc-confirmed false positives** (Svelte 5 effect-dep idiom), 3 lint-hygiene nits; **net real defects: 0** |
| `vitest --run` | harness wired, **0 tests exist** |
| `playwright --list` | 25 tests / 4 files compile & enumerate (require live infra; not run) |
| `cargo build --all-targets` | **PASS** |
| `cargo clippy --all-targets --all-features -- -D warnings` (workspace `all`+`pedantic`) | **PASS — 0/0** |
| `cargo test --all` | **25 passed / 0 failed** (authz 11 · domain 3 · server 11) |
| `cargo fmt --all -- --check` | **FAIL — 4 drift blocks** (auth.rs:120/173, badges.rs:62, users.rs:62) |
| `cargo audit` | 1 advisory — RUSTSEC-2023-0071 (`rsa`, **unreachable**: HS256-only) |

## Overall verdict
**This is a genuinely high-quality, enterprise-grade codebase. 0 CRITICAL defects
repo-wide.** The hardest things to get right are already right: the wire contract is
**100% consistent** (16 WS event variants + 13 REST domains, **0 mismatches**),
authorization is **fail-closed with zero gaps**, authentication is **textbook**, and
both sides build clean under the strictest gates. The findings below are
hardening/maintainability improvements, not fires.

### Findings tally (all areas)
| Area | CRIT | HIGH | MED | LOW | NIT |
| --- | --- | --- | --- | --- | --- |
| Frontend | 0 | 3 | 6 | 8 | 6 |
| Backend | 0 | 2 | 8 | 4 | 3 |
| Integration | 0 | 2 | 7 | 3 | 3 |

## What is already excellent (evidence-backed)
- **Security AuthN/AuthZ (backend):** Argon2id on `spawn_blocking`; login pays the
  Argon2 cost even for unknown accounts (no enumeration oracle); 256-bit session
  tokens hashed-at-rest; full PKCE + CSRF OAuth with relative-only redirects; session
  revoke evicts **both** Postgres and Redis. The authz engine is a pure, total,
  deny-by-default function with compiler-enforced exhaustive RBAC/ABAC — a sweep of
  all 13 handler files found **every** sensitive route correctly gated, **no IDOR**.
- **No injection surface:** 100% parameterized SQL (even runtime `query_as` binds);
  no path traversal (UUID storage names); no SSRF in geo (private ranges blocked
  pre-call, both timeouts set).
- **Zero dangerous panics in handlers:** every prod `unwrap`/`expect` is a sync
  mutex-poison guard or a compile-time-constant parse.
- **Frontend safety:** exactly one `{@html}` in the tree (DOMPurify-sanitized);
  rich-text `innerHTML` also sanitized; every `target="_blank"` carries
  `rel="noopener noreferrer"`; **zero legacy Svelte 4 patterns**; canonical
  `$effect.pre` autoscroll; HMR-safe LiveKit lifecycle with proper teardown.
- **Realtime hub:** cross-instance Redis fan-out with a privacy-critical room-vs-PM
  channel split, tested against cross-contamination; ref-counted presence.
- **Auth/CORS seam:** cookie `proom_session` (httpOnly, SameSite=Lax,
  https-conditional Secure) ↔ web `credentials:'include'`; CORS uses explicit
  origins + `allow_credentials(true)` (no wildcard).

## Top consolidated findings (full lists in the companion reports)

### HIGH
- **B-H1 `auth/session.rs:126`** — `AUTH_DEV_BYPASS` serves any unauthenticated
  request as super-admin, guarded only by an env flag + warn log. Add a
  `cfg(debug_assertions)` / startup refusal so it is impossible to enable in a
  release build.
- **B-H2 `http/rooms.rs:116`** — room create is non-atomic (insert + owner-membership
  on the pool, no transaction) → orphan room on partial failure. Wrap in a `tx`.
- **F-H1 `modals/SettingsModal.svelte`** — 33/34 form controls lack `id`/`<label for>`
  (the DevTools "form field needs id/name" gap). a11y + autofill.
- **F-H2 `api.ts:42`** — server responses are unvalidated `as T` casts; valibot
  validates **input** only. A schema-validate-on-read boundary would harden the client.
- **F-H3 `vite.config.ts:26`** — unit-test harness is wired but **0 tests exist**;
  `message.ts` is written "to be unit-tested" yet untested.
- **I-H1 (repo root)** — **No CI/CD** (`.github/workflows/` absent). Nothing enforces
  the clippy/svelte-check gates the project mandates. Biggest 15-year risk.
- **I-H2 `server/.env.example:12,15`** — DB/Redis ports (5432/6379) don't match
  `compose.yaml` (5433/6380); a fresh clone can't connect.

### Notable MEDIUM
- **B** registration non-atomic (`http/auth.rs:109`); OAuth reqwest client has no
  timeout (`auth/oauth.rs:263`); `catch-panic` feature enabled but `CatchPanicLayer`
  never layered (`http/mod.rs:49`); no graceful shutdown (`main.rs`); file download
  buffers whole file into memory (`http/files.rs:198`); no WS inbound size/rate cap
  (`http/ws.rs:119`); missing FK-column indexes (migrations 0002/0006/0007); poll
  `list_active` N+1 (`db/polls.rs:160`).
- **F** base `Modal.svelte` has focus-in/restore but **no focus trap** (~30 modals);
  reconnect `setTimeout` handle not cancelable (`realtime.svelte.ts:78`);
  `localStorage` not `browser`-guarded + untyped `JSON.parse`
  (`stores/social|alertFilter|prefs`, `youtube-list`).
- **I** no app Dockerfile / no `[profile.release]`; committed dev LiveKit keypair +
  weak `proroom` DB password (labelled dev); **no LICENSE file** despite `Cargo.toml`
  MIT; stale README ("Phosphor icons" — app uses Font Awesome); `docs/` ~111 MB of
  visual-evidence PNGs.

---

## Dependency currency (requirement: latest stable as of 2026-06-21, evidence-based)

### Web (`web/package.json`) — all bumped to latest, **gates re-proven green**
| Package | Before | After |
| --- | --- | --- |
| @fortawesome/fontawesome-free | 5.8.1 | **7.2.0** (user-approved major) |
| @sveltejs/kit | 2.65.0 | 2.66.0 |
| eslint | 10.4.1 | 10.5.0 |
| @playwright/test | 1.60.0 | 1.61.0 |
| vitest | 4.1.8 | 4.1.9 |
| @sveltejs/adapter-vercel | 6.3.3 | 6.3.4 |
| @tailwindcss/vite · tailwindcss | 4.3.0 | 4.3.1 |
| dompurify | 3.4.10 | 3.4.11 |
| prettier-plugin-svelte | 4.1.0 | 4.1.1 |
| typescript-eslint | 8.61.0 | 8.61.1 |

**FontAwesome 5→7:** all **104** distinct glyph names used by `<Icon>` (static +
every traced dynamic source) verified present in FA7 free `all.min.css` by per-glyph
grep → **0 remaps, 0 Pro-only blockers** (FA7 preserved all FA5 aliases). `.fas/.far/.fab`
short classes and the import path still valid.
⚠️ **Caveat:** glyph *existence* is grep-proven, but *visual fidelity* to the
protradingroom.com reference is **not** verifiable headlessly — run
`web/scripts/pixel-diff.mjs` in a browser before merge (FA7 redrew some glyphs).

**Documented exceptions (evidence-based):**
- `.nvmrc` stays **24.16.0** — latest **LTS** (Krypton); Node 26 is "Current", not LTS.
- `@types/node` stays **^24** (resolves 24.13.2) — it must track the Node 24 LTS
  runtime major, not 26.0.0, or it advertises APIs Node 24 doesn't have.

### Rust (`server/`) — latest stable, **clippy `-D warnings` + 25 tests green**
| Crate | Before | After |
| --- | --- | --- |
| tower-http | 0.6.11 | **0.7.0** |
| reqwest | 0.12.x | **0.13.4** (`rustls-no-provider` + ring provider) |
| time / getrandom / h2 / bytes / log / webpki-roots / syn | — | refreshed to latest in-range via `cargo update` |

**reqwest 0.13 migration (decision: "most up to date for maintainability + efficiency"):**
0.13 removed `rustls-tls` and now defaults to the **aws-lc-rs** provider (native
cmake/clang). To stay latest **and** preserve this repo's deliberate no-native-deps
architecture, we use `rustls-no-provider` and install the pure-Rust **ring** provider
as the process-wide default in `main.rs`. Root certs are handled by reqwest 0.13's
built-in `rustls-platform-verifier`. (reqwest 0.13 also feature-gated
`RequestBuilder::form()` behind a new `form` feature — added.) Note: reqwest 0.13.4
still pulls `tower-http 0.6` transitively, so a second 0.6.11 copy coexists with our
direct 0.7.0 — a harmless, out-of-our-control transitive, not a true dedup.
⚠️ **Caveat:** the live TLS handshake (OAuth/geo HTTPS) can't be exercised headlessly;
build/clippy/test are green and aws-lc-rs is confirmed absent from the dep graph.

**Documented exception:** `argon2` held at **0.5.3** — latest is `0.6.0-rc.8`, a
**pre-release**; never ship an RC for password hashing.

---

## Recommended remediation roadmap (prioritised; not yet applied)
The audit is read-only; dependency currency is applied + verified. Suggested order to
reach "best-in-class, 15-year-maintainable", done **one surface at a time with
verification** per the repo's own method:

1. **CI/CD (I-H1)** — add `.github/workflows` running the exact mandated gates
   (`cargo clippy -D warnings`, `cargo test`, `cargo fmt --check`, `pnpm check`,
   `pnpm lint`, `pnpm build`). This protects every other invariant below.
2. **Auth hardening (B-H1)** — compile-out `AUTH_DEV_BYPASS` in release builds.
3. **Atomicity (B-H2 + reg)** — wrap room-create and registration in transactions.
4. **Config truth (I-H2)** — fix `.env.example` ports; add `LICENSE`; correct README icons.
5. **Robustness** — layer `CatchPanicLayer`; add OAuth client timeout; graceful
   shutdown; WS inbound caps; stream file downloads; FK indexes; poll N+1.
6. **Frontend** — modal focus trap; response-schema validation boundary; form-field
   ids; first real unit tests; `browser`-guard localStorage stores.
7. **Hygiene** — `cargo fmt`; resolve eslint lint-disable nits; consider moving the
   ~111 MB visual-evidence dump to Git LFS or a separate artifacts repo.

> All findings are backed by `file:line` evidence in the companion reports. None block
> shipping today; all improve resilience and maintainability for the long horizon.
