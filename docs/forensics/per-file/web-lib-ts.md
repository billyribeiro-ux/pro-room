# Forensic Audit — `web-lib-ts` (reactive core `.svelte.ts` + framework-agnostic lib `.ts`)

Repo: `/home/user/pro-room` · Area: `web/src/lib/**` · Mode: READ-ONLY, doc-grounded.
Tooling: `mcp__svelte__svelte-autofixer` (desired_svelte_version: 5) on every `.svelte.ts`;
docs via `mcp__svelte__get-documentation`. 33 files (16 `.svelte.ts`, 17 `.ts` incl. 1-line barrel).

## Doc sections pulled (verbatim text cited inline below)

- **`svelte/svelte-js-files`** — "These behave like any other `.js` or `.ts` module, except that you can use runes… (though note that you **cannot export reassigned state**)."
- **`svelte/$state`** — "Passing state across modules… you can only _export_ that state if it's not directly reassigned." Two allowed options: export a non-reassigned object (`export const counter = $state({count:0})`) **or** don't directly export it (export getter/function). Also `$state.raw` ("cannot be mutated; it can only be _reassigned_… improve performance with large arrays and objects you weren't planning to mutate"). Classes: "Class instances are not proxied. Instead, you can use `$state` in class fields."
- **`svelte/$derived`** — "The expression inside `$derived(...)` should be free of side-effects." "Use `$derived.by`" for non-expression computeds. "avoid using [`$effect`] to synchronise state."
- **`svelte/$effect`** — teardown function "run[s] immediately before the effect re-runs… [and] when the component is destroyed"; "They only run in the browser, not during server-side rendering"; "values read _asynchronously_ — after an `await` or inside a `setTimeout` — will not be tracked."
- **`svelte/svelte-reactivity`** — `SvelteSet`/`SvelteMap`/`SvelteDate`: "A reactive version of the built-in Set/Map/Date… Reading contents… will cause it to be re-evaluated… when [it] is updated." (Relevant only when the collection is read reactively.)
- **`svelte/typescript`** — "Features that require the TypeScript compiler to output actual code are not supported. This includes… using `private`, `protected` or `public` modifiers in constructor functions together with initializers." (Relevant to `api.ts`/`realtime.svelte.ts` constructor-parameter properties under Svelte tooling.)
- **`kit/$env-dynamic-public`** — "This module _can_ be imported into client-side code… **Only** variables that begin with `PUBLIC_`… are included."

## KEY RULE verification (illegal reassigned-state exports)

Grep `export\s+let\s+\w+\s*=\s*\$state` across `web/src/lib`: **0 matches.** Every reactive
module uses a doc-compliant pattern — a non-reassigned exported object (`export const x =
$state({...})`) or a class instance whose `$state` lives in **class fields** (reassigning a
class _field_, e.g. `this.users = …`, is legal; only an exported reassigned top-level `let`
is forbidden). **No illegal reassigned-state exports anywhere in the area.**

---

## Per-file blocks — `.svelte.ts`

### `web/src/lib/dialog.svelte.ts` · 140 LOC
Purpose: promise-based confirm/prompt dialog primitive; `export const dialog = $state({current})`, resolvers kept as plain module `let` (non-reactive, deliberate).
Autofixer: `{"issues":[],"suggestions":[]}` — clean.
Findings: none. Correctly keeps function resolvers OUT of `$state` (doc: storing a function in a state proxy would proxy it needlessly); `dialog` is a non-reassigned object per `$state` "Passing state across modules."

### `web/src/lib/livekit.svelte.ts` · 574 LOC
Purpose: wraps LiveKit `Room`, exposes reactive publisher/connection/speaker state; module-level lifecycle serialization to close the duplicate-identity window.
Autofixer: `{"issues":[],"suggestions":["Found a mutable instance of the built-in Set class. Use SvelteSet instead. at line 39, column 14"]}`.
Findings:
- **INFO** · `livekit.svelte.ts:117` (`#audioEls = new Set<HTMLMediaElement>()`) · doc `svelte/reactivity` (SvelteSet) · The autofixer suggests `SvelteSet`. **Non-applicable here**: per the doc, SvelteSet matters only when "reading contents… will cause it to be re-evaluated" — i.e. iterated in a reactive context. `#audioEls` is a private bookkeeping Set of DOM `<audio>` nodes, only ever iterated imperatively (volume/mute fan-out, teardown). No template/derived reads it, so a reactive Set buys nothing. Fix: keep plain `Set` (intentional). Recording verbatim per protocol; not a defect.
- **LOW** · `livekit.svelte.ts:88-104` · doc `$state` Classes · `$state` class fields are correct; instance is **not** exported as a singleton (callers `new ScreenShareRoom()`), so no cross-module reassigned-export risk. No action.
- Cleanup/leaks audited: `#teardown` (491-523) detaches every `#audioEls` element (`pause`/`srcObject=null`/`remove`) and clears the Set — addresses the documented "skipping incoming track after Room disconnected" leak. `RoomEvent` imported here is LiveKit's, distinct from `./types` `RoomEvent` (different module, no collision). Good.

### `web/src/lib/privateChat.svelte.ts` · 110 LOC
Purpose: cross-cutting 1:1 PM state + API; `export const privateChat = $state({...})`; `roomId`/`selfId` plain non-reactive module vars (correct — set once, not rendered).
Autofixer: `{"issues":[],"suggestions":[]}` — clean.
Findings: none. `privateChat` is a non-reassigned exported object (doc-compliant). De-dup by id in `receivePrivate`.

### `web/src/lib/realtime.svelte.ts` · 99 LOC
Purpose: per-room WebSocket manager (`RoomSocket`); `connected = $state(false)` class field; heartbeat interval + backoff reconnect.
Autofixer (verbatim, as-written): `{"issues":["Cannot read properties of undefined (reading 'text') at line undefined, column undefined"],...}`. **Tool artifact**, not a Svelte defect: re-running the same logic with the TS `private`-constructor-parameter properties rewritten to explicit fields returns `{"issues":[],"suggestions":[]}`. Root cause matches doc `svelte/typescript`: "using `private`/`protected`/`public` modifiers in constructor functions together with initializers" is a non-type-only TS feature the Acorn-based parser chokes on. The runtime build is fine (Vite preprocess handles it), but the finding stands as a portability note.
Findings:
- **LOW** · `realtime.svelte.ts:18-25` · doc `svelte/typescript` ("`private` … modifiers in constructor functions … are not supported" by the Svelte parser) · The `constructor(private roomId, private onEvent, private onReconnect?)` parameter-properties trip the autofixer (and would trip any raw-Svelte-compiler path). Fix: declare fields explicitly + assign in the body to stay within type-only TS. Cosmetic under Vite.
- **LOW** · `realtime.svelte.ts:78-85` (`#scheduleReconnect`) · doc `$effect` (timer cleanup analogy) · The reconnect `setTimeout` is not stored/cleared; `close()` can't cancel a pending reconnect timer. It IS guarded (`if (!this.#closed) this.#connect()`), so no reconnect fires after close — harmless, but the timer leaks until it fires. Fix: store the handle and `clearTimeout` in `close()`. Heartbeat interval is correctly tracked/cleared (`#stopHeartbeat`).

### `web/src/lib/sound.svelte.ts` · 170 LOC
Purpose: DND-aware synthesized WebAudio notification tones; lazy shared `AudioContext`; reads `dnd`/`prefs` stores to gate playback.
Autofixer: `{"issues":[],"suggestions":[]}` — clean.
Findings:
- **INFO** · `sound.svelte.ts:99` (`let ctx: AudioContext | null = null`) · This is a plain module `let`, **not** `$state`, so the "cannot export reassigned state" rule does not apply (it is never exported). Reassignment is fine. SSR-guarded via `browser` (doc `$effect`: effects/audio "only run in the browser"). Per-play oscillator/gain nodes are disconnected on `onended` (no node leak). Good.

### `web/src/lib/stores/alertFilter.svelte.ts` · 112 LOC
Purpose: per-device alert allow/block filter; `export const alertFilter = $state({filtered, showAlertsFrom, open})`, localStorage-backed.
Autofixer: `{"issues":[],"suggestions":[]}` — clean.
Findings:
- **INFO** · `:69,77,83` reassign `alertFilter.filtered` (a property of the exported object), which is legal — doc `$state`: "since we're updating `counter.count` rather than `counter`, Svelte doesn't wrap it in `$.state`." `browser`-guarded localStorage R/W with try/catch. Good.

### `web/src/lib/stores/auth.svelte.ts` · 51 LOC
Purpose: global auth (`AuthStore` class, `me`/`loading` `$state` fields); `export const auth = new AuthStore()`.
Autofixer: `{"issues":[],"suggestions":[]}` — clean.
Findings: none. Exported singleton is a **stable object** (class instance) per doc `$state` Classes; `$state` in class fields. `can()`/`user` getter read `this.me` reactively.

### `web/src/lib/stores/brand.svelte.ts` · 53 LOC
Purpose: reactive brand (name/logo); `export const brand = $state({...})`, seeded from bundled defaults, overridden by `loadBrand()`.
Autofixer: `{"issues":[],"suggestions":[]}` — clean.
Findings:
- **LOW** · `brand.svelte.ts:49` · doc `svelte/typescript` (unvalidated cast) · `applyBranding((await res.json()) as BrandingResponse)` casts the `/api/branding` body without runtime validation; a malformed payload yields `undefined` name/logo. Mitigated by `?.trim() || DEFAULT` fallbacks, so non-fatal. `loadBrand` is `browser`-guarded and silent-on-failure (defaults render). Good SSR posture.

### `web/src/lib/stores/dnd.svelte.ts` · 123 LOC
Purpose: per-channel Do-Not-Disturb flags; `export const dnd = $state<DndFlags>(loadAll())`, per-flag localStorage.
Autofixer: `{"issues":[],"suggestions":[]}` — clean.
Findings: none. `setDnd` validates the key against `DND_KEYS` before write; `browser`-guarded; non-reassigned exported object (doc-compliant).

### `web/src/lib/stores/layout.svelte.ts` · 81 LOC
Purpose: room layout prefs (`position`, `pmLogsRight`); `export const layout = $state({...})`, localStorage with `isPosition` type-guard validation.
Autofixer: `{"issues":[],"suggestions":[]}` — clean.
Findings: none. Exemplary: validates persisted strings via type guard before trusting them; `browser`-guarded R/W.

### `web/src/lib/stores/prefs.svelte.ts` · 127 LOC
Purpose: per-device general prefs; `export const prefs = $state<Prefs>(loadAll())`, generic `setPref<K>`.
Autofixer: `{"issues":[],"suggestions":[]}` — clean.
Findings:
- **INFO** · `prefs.svelte.ts:105` · `// @ts-expect-error index write` in `loadAll` is a contained, commented index-write; type-sound by construction (K iterates each key). Acceptable. Non-reassigned exported object; `browser`-guarded.

### `web/src/lib/stores/sessionLog.svelte.ts` · 40 LOC
Purpose: in-memory ring buffer (900 lines) of client lifecycle events; `export const sessionLog = $state({entries})`.
Autofixer (verbatim): `{"issues":[],"suggestions":["Found a mutable instance of the built-in Date class. Use SvelteDate instead. at line 6, column 30"],"require_another_tool_call_after_fixing":true}`.
Findings:
- **INFO** · `sessionLog.svelte.ts:28` (`new Date().toLocaleTimeString()`) · doc `svelte/reactivity` (SvelteDate) · The autofixer suggests `SvelteDate`. **Non-applicable**: per the doc, SvelteDate matters only when "reading the date… in an effect or derived… will cause it to be re-evaluated." Here `new Date()` is a transient used once to format a timestamp string, never stored or read reactively. Plain `Date` is correct. Recorded verbatim per protocol; not a defect.
- Good: ring cap enforced (`shift` past 900); in-place push/shift on the exported proxy (doc-compliant — mutation, not reassignment); `clearLog` reassigns the `.entries` property (legal).

### `web/src/lib/stores/social.svelte.ts` · 65 LOC
Purpose: per-device muted/followed user lists; `UserList` class with `users = $state<SocialUser[]>([])`; `export const muted/followed = new UserList(...)`.
Autofixer: `{"issues":[],"suggestions":[]}` — clean.
Findings:
- **INFO** · `social.svelte.ts:52,59` reassign `this.users` (a class field) — legal per doc `$state` Classes. localStorage guarded by `typeof localStorage === 'undefined'` (works, though `browser` from `$app/environment` is the house idiom used elsewhere — minor inconsistency, not a bug). Validates parsed array shape on load.

### `web/src/lib/stores/theme.svelte.ts` · 329 LOC
Purpose: runtime color theme (`ThemeStore` class), tokens/fontSize/mode `$state` fields, valibot-validated, applies inline custom props to `document.documentElement`.
Autofixer: `{"issues":[],"suggestions":[]}` — clean.
Findings:
- **INFO** · `theme.svelte.ts:219,277,305,313` reassign `this.tokens` (class field) — legal. `apply()`/`applyMode()` guard on `typeof document === 'undefined'` / `browser`. `loadOverrides`/`loadFontSize`/`loadMode` validate persisted values with valibot (`parseHexColor`/`parseFontSizePx`) before trusting localStorage — **strongest runtime-validation posture in the area** and exactly what doc `$state` warns about for untrusted input. No `$effect` used to sync — `apply()` is called imperatively from setters (doc `$effect`: "avoid using it to synchronise state" — correctly avoided).

### `web/src/lib/stores/toast.svelte.ts` · 38 LOC
Purpose: ephemeral toasts; `export const toasts = $state<Toast[]>([])`, auto-dismiss `setTimeout`.
Autofixer: `{"issues":[],"suggestions":[]}` — clean.
Findings:
- **INFO** · `toast.svelte.ts:35` · secure-context guard on `crypto.randomUUID` with a time+random fallback — avoids the documented throw on plain-HTTP LAN origins. `browser`-guarded. Non-reassigned exported array. Good.

### `web/src/lib/stores/visibility.svelte.ts` · 34 LOC
Purpose: tab-visibility + throttle gate; module-private `const vis = $state({hidden})`, exported via `tabHidden()`/`shouldThrottle()` functions.
Autofixer: `{"issues":[],"suggestions":[]}` — clean.
Findings:
- **INFO** · `visibility.svelte.ts:16-21` · doc `$state` "don't directly export it" pattern — state is module-private, exposed through functions (the second allowed cross-module pattern). The single `visibilitychange` listener is installed once at import under `browser` and lives for the app lifetime (intentional global tracker — no teardown needed). Correct SSR guard.

---

## Per-file blocks — plain `.ts` (framework-agnostic unless noted)

### `web/src/lib/admin.ts` · 43 LOC
Purpose: admin moderation API wrappers (kick/mute/clear/lock/delete). Framework-agnostic TS over `api`.
Findings:
- **LOW** · `admin.ts:8-43` · All functions return `Promise<unknown>` — callers get no typed result. Acceptable for fire-and-forget moderation POSTs (effects arrive via WS), but `unknown` discards any response shape. Fix: type the few that return a body, or document the void contract. No runtime-safety issue.

### `web/src/lib/alertText.ts` · 13 LOC
Purpose: one-line alert body formatter `"SYMBOL side note"`. Pure framework-agnostic TS.
Findings: none. Total, null-safe (`side?`/`note?` optional), no I/O.

### `web/src/lib/api.ts` · 50 LOC
Purpose: fetch wrapper + `ApiError`; `api.get/post/patch/delete`. Framework-agnostic TS (imports only `./config`).
Findings:
- **MEDIUM** · `api.ts:42` (`return (await res.json()) as T`) and `:41` (`return undefined as T`) · doc `svelte/typescript` (unvalidated `as` casts) · **Every** successful response is an **unchecked `as T` cast** — no runtime validation despite valibot being the project's validation lib (`schemas.ts`). A backend contract drift or malformed JSON propagates a wrongly-typed object silently into stores (e.g. `auth.me`, poll/reaction summaries). This is the area's principal type-safety gap. Fix: thread a valibot schema (or a validator callback) through `request<T>` for untrusted boundaries, or at minimum validate the highest-trust payloads (auth/me, room detail). Note: `schemas.ts` validates _form/localStorage_ input but is **not** wired to API responses.
- **MEDIUM** · `api.ts:24` · `body === undefined` controls both header and serialization — a deliberate `null`/`0`/`""` body would set no `Content-Type` and skip JSON. Minor edge; current callers always pass objects or nothing. Note only.
- **LOW** · `api.ts:32` (`as ErrorBody`) · error body cast is unchecked, but fully `?.`-guarded with status-text fallback — safe.
- Good: `credentials: 'include'`, 204 → `undefined`, `ApiError` carries machine code + status.

### `web/src/lib/avatar.ts` · 21 LOC
Purpose: Gravatar URL via SHA-256 (Web Crypto). Framework-agnostic TS.
Findings: none. Guards `crypto.subtle` (undefined on insecure origin) → returns mystery-person URL instead of throwing. Correct async hashing.

### `web/src/lib/brand.ts` · 18 LOC · (SvelteKit-coupled)
Purpose: brand defaults from env. Doc: `kit/$env-dynamic-public`.
Findings: none. Uses `$env/dynamic/public` with `PUBLIC_BRAND_*` prefix — doc-compliant ("Only variables that begin with `PUBLIC_` are included"); safe `.trim() || default`.

### `web/src/lib/config.ts` · 17 LOC · (SvelteKit-coupled)
Purpose: API/WS URLs + GIPHY key from env. Doc: `kit/$env-dynamic-public`.
Findings:
- **INFO** · `config.ts:7` · `WS_URL = API_URL.replace(/^http/, 'ws')` correctly maps `http→ws`/`https→wss` (anchored `^http`). `env.PUBLIC_*` doc-compliant; sensible `?? localhost` fallbacks. `GIPHY_KEY` public by design (see giphy.ts finding).

### `web/src/lib/giphy.ts` · 81 LOC
Purpose: GIPHY search client for the GIF picker. Framework-agnostic TS.
Findings:
- **LOW** · `giphy.ts:60` · `api_key` is placed in the request URL query string. This is GIPHY's documented web-key model (client-side, public by design — the file says so, and `PUBLIC_` prefix already exposes it to the client), so it is **not a secret leak**. Note only: URL keys land in logs/referrers; rotate/scope via the GIPHY dashboard as the comment advises.
- **LOW** · `giphy.ts:65` (`as { data?: GiphyItem[] }`) · unchecked cast, but every downstream read is `?.`-guarded with `?? ''`/`?? 0` and `.filter(url.length>0)` — safe degradation. Throws on HTTP failure (CLAUDE.md "never swallow"). Good.

### `web/src/lib/index.ts` · 1 LOC
Purpose: `$lib` barrel placeholder (comment only). Findings: none.

### `web/src/lib/media.ts` · 24 LOC
Purpose: presenter media-for-all broadcast helper. Framework-agnostic TS over `api`.
Findings: none. Typed `Promise<MediaBroadcast>`; conditional `{kind,url}` vs `{kind}` body.

### `web/src/lib/message.ts` · 191 LOC
Purpose: pure DOM-free message-body segment parser (text/ticker/mention/link/image) + timestamp formatters. Framework-agnostic, unit-testable.
Findings:
- **INFO** · `message.ts` · No `{@html}` anywhere — segments carry `value` whose concatenation equals the input (invariant stated and upheld), so callers render safely (project hard rule). URL-over-ticker/mention overlap resolution is correct (claimed-range checks). Date formatters return raw input on unparseable stamps (no `Invalid Date` leak). Strong module.

### `web/src/lib/poll.ts` · 64 LOC
Purpose: poll wire types + 4 API helpers; exports `PollDetail`/`PollEvent`. Framework-agnostic TS.
Findings:
- **LOW** · `poll.ts:47-63` · returns are typed (`Promise<PollDetail>`) but rely on `api.ts`'s unchecked `as T` (see api.ts MEDIUM) — no runtime check that the body matches `PollDetail`. Same root cause; listed once at `api.ts`.

### `web/src/lib/qa.ts` · 44 LOC
Purpose: Q&A wire types + 3 API helpers. Framework-agnostic TS.
Findings: none beyond the shared `api.ts` `as T` note. Types mirror the documented Rust serde shape.

### `web/src/lib/reactions.ts` · 35 LOC
Purpose: reaction toggle/list API helpers. Framework-agnostic TS.
Findings:
- **INFO** · `reactions.ts:33` · `encodeURIComponent(targetId)` on the query param (good) but `targetKind` (a typed union) is interpolated unencoded — safe since it's a fixed enum. No action.

### `web/src/lib/schemas.ts` · 119 LOC
Purpose: valibot validation schemas (hex color, font size, Q&A/poll bodies) + `validatePollCreate`/`firstIssue`/`parseHexColor`/`parseFontSizePx`. Framework-agnostic TS.
Findings:
- **INFO** · `schemas.ts` · Correct valibot idiom (`v.pipe`/`v.safeParse`); caps mirror server limits (2000/4000/280/80) — good contract parity. **Gap (cross-file):** these validators guard form + localStorage input (used by `theme.svelte.ts`) but are **not** applied to API responses in `api.ts` (see api.ts MEDIUM). Strong module; under-deployed.

### `web/src/lib/types.ts` · 228 LOC
Purpose: wire types mirroring Rust JSON (User/Room/Message/Alert/RoomEvent discriminated union, etc.). Framework-agnostic TS.
Findings:
- **INFO** · `types.ts:204-228` · `RoomEvent` is a well-formed discriminated union (`type` discriminant) — enables exhaustive switch handling at the WS consumer. This is the type that `realtime.svelte.ts:61` casts WS frames to via unchecked `as RoomEvent` (validation gap noted there). Types-only file; no runtime surface.

### `web/src/lib/youtube-list.ts` · 36 LOC
Purpose: per-room saved-YouTube list in localStorage. Framework-agnostic TS.
Findings:
- **LOW** · `youtube-list.ts:23` · `JSON.parse` result validated with `Array.isArray` + per-item `typeof x.url === 'string'` (good), but the cast keeps `start`/`label` untyped from storage. Minor; URL is the load-bearing field and is checked. `typeof localStorage === 'undefined'` SSR guard (works; house idiom is `browser`).

---

## Summary

### Autofixer results (16 `.svelte.ts` files)
| File | issues | suggestions |
|---|---|---|
| dialog.svelte.ts | none | none |
| livekit.svelte.ts | none | SvelteSet (non-applicable) |
| privateChat.svelte.ts | none | none |
| realtime.svelte.ts | 1 (tool artifact — TS param-props) | none |
| sound.svelte.ts | none | none |
| stores/alertFilter.svelte.ts | none | none |
| stores/auth.svelte.ts | none | none |
| stores/brand.svelte.ts | none | none |
| stores/dnd.svelte.ts | none | none |
| stores/layout.svelte.ts | none | none |
| stores/prefs.svelte.ts | none | none |
| stores/sessionLog.svelte.ts | none | SvelteDate (non-applicable) |
| stores/social.svelte.ts | none | none |
| stores/theme.svelte.ts | none | none |
| stores/toast.svelte.ts | none | none |
| stores/visibility.svelte.ts | none | none |

**Files with autofixer issues: 1** (`realtime.svelte.ts` — a parser artifact from TS `private` constructor-parameter properties, doc `svelte/typescript`; not a Svelte reactivity defect, runtime build unaffected).
**Files with autofixer suggestions: 2** (`livekit.svelte.ts` SvelteSet, `sessionLog.svelte.ts` SvelteDate — both verbatim, both non-applicable: the collections/dates are never read in a reactive/derived/effect context, so the reactive built-ins would add cost for no benefit).

### KEY RULE
**0 illegal reassigned-state exports** across the area. Every store uses a doc-compliant pattern (non-reassigned exported object, exported class instance, or module-private state behind getters/functions).

### Findings by severity
| Severity | Count | Notable |
|---|---|---|
| MEDIUM | 2 | `api.ts` unchecked `as T` on all responses (no runtime validation); `api.ts` body/header coupling edge |
| LOW | 9 | `realtime` TS param-props + uncancelled reconnect timer; `brand`/`giphy`/`poll`/`youtube-list`/`admin` unvalidated casts/contracts; giphy URL key (public by design) |
| INFO | 14 | doc-confirmed correct patterns + 2 non-applicable autofixer suggestions |

### Top recommendation
Wire `valibot` (already present in `schemas.ts`) into `api.ts`'s `request<T>` for untrusted
response boundaries (at least auth/me, room detail, and the WS `RoomEvent` frames in
`realtime.svelte.ts`). That single change closes the only MEDIUM (and several LOW) findings —
the reactive-store layer itself is doc-clean.
