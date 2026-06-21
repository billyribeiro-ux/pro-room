# ProTradingRoom — Frontend Forensic Audit

**Repository:** `/home/user/pro-room` · **Scope:** `web/` (SvelteKit 2 · Svelte 5 forced-runes · TS strict · Tailwind v4 · LiveKit · valibot · DOMPurify)
**Date:** 2026-06-21 · **Commit:** `0819f9d` (Merge PR #12) · **Method:** read-only, evidence-based (toolchain output + `file:line` + Svelte official docs/MCP)

---

## 1. Metrics (ground truth)

| Metric | Value | Evidence |
|---|---|---|
| Files in `web/src` | 101 | `find src -type f \| wc -l` |
| `.svelte` components | 64 | `find src e2e -name '*.svelte' \| wc -l` |
| `.svelte.ts` rune modules | 16 | `find src -name '*.svelte.ts'` |
| Other `.ts` modules | 22 | `find src e2e -name '*.ts' ! -name '*.svelte.ts'` |
| LOC (src+e2e, svelte+ts) | 22,474 | `wc -l` over all source |
| **svelte-check** | **0 errors / 2 warnings** | `pnpm run check` → `COMPLETED 597 FILES 0 ERRORS 2 WARNINGS 1 FILES_WITH_PROBLEMS` |
| **eslint** | **9 errors / 0 warnings** (exit 1) | `pnpm exec eslint .` → `✖ 9 problems (9 errors, 0 warnings)` |
| **prettier --check** | **FAIL — 12 files unformatted** (exit 1) | `pnpm run lint` → "Code style issues found in 12 files" |
| **build** | **PASS** | `pnpm run build` → `✓ built in 10.46s`, adapter-vercel `✔ done` |
| **vitest** | **FAIL — no test files** (exit 1) | `pnpm run test:unit -- --run` → "No test files found, exiting with code 1" |
| **playwright** | **25 tests / 4 files compile & enumerate** (exit 0); require live infra | `pnpm exec playwright test --list` → "Total: 25 tests in 4 files" |
| TypeScript `strict` | on | `tsconfig.json` extends `.svelte-kit/tsconfig.json` (strict) |

> The project's hard gate (`pnpm run check`) is **green for errors** (0) with only 2 cosmetic unused-CSS warnings. The `lint` gate (prettier+eslint) currently **fails**. The unit-test gate **fails because no tests exist** (harness is configured but empty).

### Findings count by severity

| Severity | Count |
|---|---|
| CRITICAL | 0 |
| HIGH | 3 |
| MEDIUM | 6 |
| LOW | 8 |
| NIT | 6 |

No CRITICAL security or correctness defects were found. The codebase is well above average enterprise quality; the open items are an a11y form-labelling debt, a CI-gate hygiene gap (prettier/eslint/no-tests), and a systemic "API responses are cast, not validated" contract gap.

---

## 2. Toolchain raw evidence

### svelte-check (0 errors, 2 warnings)
```
WARNING src/lib/components/modals/UserInfoModal.svelte 125:2 "Unused CSS selector
  ':global(.panel:has(.user-info-body)) :global(.foot) > .action'"
WARNING src/lib/components/modals/UserInfoModal.svelte 126:2 "Unused CSS selector
  ':global(.panel:has(.user-info-body)) :global(.foot) > .close-btn'"
COMPLETED 597 FILES 0 ERRORS 2 WARNINGS 1 FILES_WITH_PROBLEMS
```

### eslint (9 errors)
```
AlertFeed.svelte           75:15  prefer-svelte-reactivity (Map → SvelteMap)
AlertFeed.svelte           97:3   no-unused-expressions
ChatPanel.svelte          102:3   no-unused-expressions
MessageBody.svelte         37:340 svelte/no-navigation-without-resolve
modals/AllUserPmModal.svelte 44:4 no-unused-expressions
modals/ChatLogsModal.svelte  34:4 no-unused-expressions
livekit.svelte.ts         117:14 prefer-svelte-reactivity (Set → SvelteSet)
livekit.svelte.ts         135:4  no-this-alias
stores/sessionLog.svelte.ts 28:30 prefer-svelte-reactivity (Date → SvelteDate)
```

### prettier --check (12 files)
```
e2e/features.e2e.ts, e2e/screen-share.e2e.ts, src/lib/alertText.ts,
components/Badges.svelte, components/CaptionsOverlay.svelte, components/MessageBody.svelte,
modals/BadgesModal.svelte, modals/BrandingModal.svelte, modals/ConnectivityCheckModal.svelte,
modals/SettingsModal.svelte, realtime.svelte.ts, sound.svelte.ts
```

### vitest
```
No test files found, exiting with code 1
include: src/**/*.{test,spec}.{js,ts}   (vite.config.ts:26 — configured but empty)
```

### playwright (static enumeration only — NOT run against a backend)
25 tests across `e2e/proroom.e2e.ts` (13), `e2e/features.e2e.ts` (8), `e2e/av-lifecycle.e2e.ts` (2), `e2e/screen-share.e2e.ts` (1). All compile and enumerate (`--list` exit 0). They require a live Rust backend + browser/LiveKit infra and were **not executed**; no pass/fail is claimed.

---

## 3. Severity-ranked findings

| ID | Sev | file:line | Finding | Evidence | Idiomatic fix |
|---|---|---|---|---|---|
| **F1** | HIGH | `modals/SettingsModal.svelte` (34 controls) | **33 of 34 form controls lack an `id`** → no `<label for>` association; only `settings-text-size` (l.192) has one. This is the DevTools "form field needs id/name" gap the brief flagged. | `grep -cE '<input\|<select\|<textarea'` = 34; `grep -cE 'id='` on inputs = 0 (only 5 ids in file, all on tab/panel containers). `name=` = 26 (radios are named for grouping; checkboxes/the rest are not). | Add a unique `id` to every control and pair each `<label for>`. Batch by section: `id="settings-chat-popup"` etc. |
| **F2** | HIGH | `api.ts:42` (+ all callers) | **API responses are unvalidated `as T` casts.** valibot exists (`schemas.ts`) but is used ONLY for form/localStorage input — never for server payloads. A malformed/hostile API response is trusted blind. `auth.svelte.ts:25`, `admin/users:16`, `NotesPanel:35`, etc. all `api.get<X>() as X`. | `api.ts:42` `return (await res.json()) as T;`. `schemas.ts:4` self-describes scope as "form fields, persisted localStorage". No `v.parse` on any `api.*` result anywhere. | Add valibot schemas for core DTOs (`Me`, `User`, `RoomDetail`, `AlertItem`…) and `v.parse` inside `request()` or at each boundary; type the API surface from the schemas. |
| **F3** | HIGH | `package.json:15` / `vite.config.ts:26` | **Unit-test harness is wired but there are zero tests.** `pnpm test:unit` exits 1. `message.ts` is explicitly written "framework-free so it can be unit-tested in isolation" (`message.ts:6`) yet untested — its regex tokenizer is the XSS-avoidance keystone. | `vitest … No test files found, exiting with code 1`. `message.ts:6` comment. | Add `*.spec.ts` for `message.ts` (parseMessage/isQuestion/format*), `schemas.ts` validators, `alertText.ts`. Makes `pnpm test` green and pins the security-relevant parser. |
| **F4** | MED | `components/Modal.svelte:23-39` | **Base modal has focus-in + focus-restore but NO focus trap.** Tab can move focus out of the open dialog to the background. ~30 modals inherit this. | `Modal.svelte:27` `queueMicrotask(() => panel?.focus())`; `:28-30` restore on close; Escape at `:34-39`. No keydown Tab-cycle handling. WCAG 2.4.3 / dialog pattern expects a trap. | Add a Tab/Shift+Tab cycle within `.panel` (query focusables, wrap first↔last), or use the platform `<dialog>` element / a small focus-trap action. |
| **F5** | MED | `realtime.svelte.ts:78` | **`#scheduleReconnect` setTimeout handle is not stored**, so `close()` can't cancel a pending reconnect timer. The `#closed` guard (l.79) prevents an actual reconnect, so it's safe but the timer still fires (minor leak / wasted wake). | `realtime.svelte.ts:78-80` bare `setTimeout(...)`; `close()` (l.32-38) clears only the heartbeat. | Store the id in a `#reconnectTimer` field and `clearTimeout` it in `close()`. |
| **F6** | MED | `modals/PostAlertModal.svelte:291-304` | **5 footer checkboxes lack `id`/`name`** (the 7 main fields are correctly id'd+named, l.184-281). | Sub-agent read confirmed 7/12 fields have id+name; the 5 footer checkboxes have neither. | Add `id`+`name`+`<label for>` to each of the 5 checkboxes. |
| **F7** | MED | `stores/social.svelte.ts:17,19,38` | localStorage read/write **not guarded by `$app/environment` `browser`** (uses ad-hoc `typeof localStorage === 'undefined'`), and `#persist()` `setItem` (l.38) has no guard; untyped `JSON.parse` with only shallow filter (l.19-20). Same untyped-parse pattern in `alertFilter.svelte.ts:23`, `prefs.svelte.ts:96`, `youtube-list.ts:22`. | `social.svelte.ts:17` `if (typeof localStorage === 'undefined') return [];`; `:38` unguarded `localStorage.setItem`. | Import `browser`; guard reads/writes uniformly; validate parsed JSON with a valibot schema before trusting it. |
| **F8** | MED | `modals/ReplyModal.svelte:45` | Reply `<textarea>` has no `id`/`name` (a11y label gap, same class as F1). | Sub-agent read of ReplyModal. | Add `id="reply-text"` + `name` + `<label for>`. |
| **F9** | MED | `routes/+layout.svelte:42-51` | **Auth route guard is a client `$effect` redirect, not a SvelteKit `load` guard.** Acceptable for an `ssr=false` cookie-auth SPA (no server to guard on), but protected components can briefly mount before redirect; real authz is server-side (Rust API). Worth documenting as an architectural choice, not a bug. | `+layout.ts:4` `ssr=false`; `+layout.svelte:42` `$effect` reads `page.url.pathname`+`auth.user`, calls `goto(resolve('/login'))`. `{#if booted}` gate (l.62) hides content until session resolves. | Keep, but document; optionally render a guarded shell that never mounts protected children until `auth.user` is known (already largely true via `booted`). |
| **F10** | LOW | `eslint` — `no-unused-expressions` ×4 (`AlertFeed.svelte:97`, `ChatPanel.svelte:102`, `AllUserPmModal.svelte:44`, `ChatLogsModal.svelte:34`) | These bare expressions (`visibleAlerts.length;`, `channel;`) are the **documented Svelte 5 dependency-registration idiom**, NOT defects. They make an `$effect`/`$effect.pre` depend on a value. The lint rule is a false positive here. | Svelte `$effect` docs: "reference `messages` array length so that this code re-runs whenever it changes." **Autofixer confirms `issues: []`** on the AlertFeed `$effect.pre` pattern. | Don't "fix" the code. Scope-disable `@typescript-eslint/no-unused-expressions` for these intentional reads (per-line disable or a small override), or write them as `void visibleAlerts.length;`. |
| **F11** | LOW | `eslint` — `prefer-svelte-reactivity` ×3 (`AlertFeed.svelte:75`, `livekit.svelte.ts:117`, `sessionLog.svelte.ts:28`) | Each flagged `Map`/`Set`/`Date` is **local/imperative, not read reactively in a template**, so `SvelteMap`/`SvelteSet`/`SvelteDate` are unnecessary (the rule is conservative). `AlertFeed:75` Map is inside a `$derived.by` (recreated each run). `livekit:117 #audioEls` is driven imperatively. `sessionLog:28` is a one-shot `new Date()` for a timestamp string. Note the room page (`+page.svelte:124`) handles the identical case correctly with a justified `eslint-disable`. | eslint output; reads of each site. | Add per-line `// eslint-disable-next-line svelte/prefer-svelte-reactivity` with the same rationale comment already used at `rooms/[id]/+page.svelte:124`, to drive eslint to 0. |
| **F12** | LOW | `livekit.svelte.ts:135` | `no-this-alias` — `if (activeInstance && activeInstance !== this)` reads as aliasing. It's actually a module-level singleton compare for HMR-safe LiveKit teardown, which is legitimate. | eslint `no-this-alias`; `livekit.svelte.ts:124-137` lifecycle. | Capture `const self = this` is not even needed; refactor the comparison or disable the rule for the line with a comment. |
| **F13** | LOW | `modals/UserInfoModal.svelte:40-42` | **Dead button:** the "@Mention" footer button has `aria-label` but **no `onclick`** (the other 4 footer buttons all have handlers). | `UserInfoModal.svelte:40` `<button … aria-label="Mention this user">` — no `onclick`; l.43-76 all have handlers. | Wire it to the chat composer mention, or remove it. |
| **F14** | LOW | `modals/ReplyModal.svelte:54-59`, `components/AlertQaModal.svelte:262-267` | **Dead buttons:** emoji/image tool buttons in the reply/QA composers have no `onclick` (placeholders). | Sub-agent reads of both composers. | Wire or remove. |
| **F15** | LOW | `modals/UserInfoModal.svelte:125-126` | The 2 svelte-check unused-CSS warnings: `:global(.foot) > .action` / `> .close-btn` style a footer that is rendered INTO `Modal.svelte`'s `{@render footer()}`, so static analysis can't see the match across the component boundary. Runtime-correct but fragile (cross-component `:global` styling). | svelte-check warnings; `UserInfoModal.svelte:40-76` footer buttons; `Modal.svelte:79-82` `{@render footer()}`. | Move footer-button layout styling into `Modal.svelte` (where `.foot` lives), or expose a CSS custom-property/variant prop instead of reaching in with `:global`. |
| **F16** | LOW | `modals/AddUserModal.svelte`, `BadgesModal.svelte` (×2) | Use `onMount` to load on first open instead of an `$effect(() => { if (open) load() })`. Works, but won't reload on a later re-open and is less idiomatic in runes mode. | Sub-agent reads. | Prefer `$effect` keyed on `open` for open-driven loads. |
| **F17** | LOW | `modals/EditProfileModal.svelte:104` | `aria-readonly="true"` on an input that should just use the native `readonly` attribute. | Sub-agent read. | Use `readonly`; drop `aria-readonly`. |
| **F18** | NIT | `lint` gate | 12 files fail `prettier --check`, breaking the `lint` script before eslint even runs. Pure formatting. | prettier output. | `pnpm format` (prettier --write). |
| **F19** | NIT | `components/MessageBody.svelte:37` | One `svelte/no-navigation-without-resolve` error remains while sibling sinks are suppressed — the per-line `eslint-disable` appears mis-positioned for the image-link `<a>` on the long line 37. The link itself is safe (external URL, `rel="noopener noreferrer"`). | eslint `MessageBody.svelte:37:340`; the disable comment at `:33` covers the first `<a>` but not the image `<a>` later on the same logical block. | Add the disable directly before the image `<a>` (or split the line). |
| **F20** | NIT | bundle | **FontAwesome 5 full CSS** + 5 `@fontsource/open-sans` weights imported globally (`+layout.svelte:5-11`) inflate the layout CSS chunk to **133.6 kB (45.9 kB gzip)** — the largest asset. | build output: `_layout…css 133.61 kB │ gzip: 45.86 kB`; `+layout.svelte:5-11`. | Subset FontAwesome to used icons (or switch to per-icon SVG imports via `Icon.svelte`); drop unused font weights. |
| **F21** | NIT | `stores/toast.svelte.ts:37` | Auto-dismiss `setTimeout` id isn't stored; an early manual dismiss leaves the timer to fire (harmless no-op via `findIndex` guard) but is wasteful. | `toast.svelte.ts:37`. | Store the timeout id on the toast; `clearTimeout` in `dismissToast`. |
| **F22** | NIT | `components/MediaPlayer.svelte:87` | SoundCloud iframe builds `src` from presenter-broadcast `media.url` via `encodeURIComponent` with no origin allowlist. Not an XSS sink (URL param inside `w.soundcloud.com/player`); worst case is a broken embed. | `MediaPlayer.svelte:87`. | Optionally validate the URL host before embedding. |
| **F23** | NIT | scoped CSS | `:global(svg), :global(i)` color overrides repeated across many components (e.g. `admin/users:100`, `MediaPlayer:245`). Minor duplication. | grep of `:global(svg)`. | Centralize an icon-color utility/token. |

---

## 4. What is already excellent (evidence-backed)

- **XSS posture is genuinely strong.** Only **one** `{@html}` in the entire `web/src` tree — `NotesPanel.svelte:230` — and it is `DOMPurify.sanitize`d, `browser`-guarded, with a justifying comment (`:26-31`). The second HTML sink, `RichTextEditorModal.svelte:40` `node.innerHTML = DOMPurify.sanitize(html)`, is also sanitized. Chat/alert bodies never use `{@html}` at all — `message.ts` + `MessageBody.svelte` segment-parse text and render each node as plain text/elements (`message.ts:4`, `MessageBody.svelte:23`). Toast alert bodies are plain `{t.body}` text, explicitly NOT `{@html}` (`ToastContainer.svelte:19-20`).
- **Every `target="_blank"` carries `rel="noopener noreferrer"`** — verified across `MessageBody`, `AlertQaModal`, `PollPanel`, `PostAlertModal`, `FilesPanel` (which also passes the `noopener` window feature). No reverse-tabnabbing surface.
- **No open-redirect.** Magic-link (`auth/magic/+page.svelte:19`) `encodeURIComponent`s the token and always `goto(resolve('/rooms'))` — destination is hardcoded, not derived from user input. OAuth start (`login/+page.svelte:44`) uses a fixed `redirect_to=/rooms`.
- **Zero legacy Svelte 4 patterns.** No `export let`, no `$:`, no `on:` directives, no `<slot>`, no `createEventDispatcher`, no `$$props`/`$$restProps` anywhere in `src`. Composition uses `Snippet`/`{@render}` (`Modal.svelte:9-15,60,76,81`). This is true forced-runes-mode discipline.
- **`Modal.svelte` accessibility (minus the trap):** `role="dialog"` + `aria-modal="true"` + conditional `aria-labelledby`/`aria-label` (`:49-52`), focus save+restore via `$effect` teardown (`:23-32`), Escape with `stopPropagation` (`:34-39`), backdrop-click close. Snippet-based, themed via CSS custom-property remap in one place (`:111-119`).
- **Canonical Svelte 5 chat-autoscroll** in `AlertFeed.svelte:95-105` and `ChatPanel.svelte:100-109`: `$effect.pre` + measure-before-DOM-update + `tick().then(scrollTo)` + near-bottom guard + a deliberately non-reactive `stickNext` one-shot. This matches the official `$effect.pre` autoscroll example exactly; the **Svelte autofixer returns `issues: []`** for this pattern.
- **`MediaPlayer.svelte`:** YouTube embeds are id-validated (`youtubeId` only ever builds `youtube.com/embed/<id>`), the volume `$effect` is the legitimate imperative-DOM escape hatch (autofixer `issues: []`), `<track kind="captions" />` added for the a11y rule, layout reserved to avoid CLS. The comment at `:22-27` correctly anticipates and rebuts a false autofixer flag.
- **LiveKit lifecycle (`livekit.svelte.ts:124-137`):** HMR-safe, serialized connect/teardown that reclaims a same-identity Room from a stale instance before connecting — sophisticated and correct for a hot-reloading dev loop and remounts.
- **Room teardown:** `rooms/[id]/+page.svelte:466-468` `onDestroy` closes the WebSocket and disconnects LiveKit; the leave handler (`:349-350`) does the same. No socket/track leak.
- **`api.ts`:** clean typed `ApiError(status, code, message)`, `credentials: 'include'`, 204 handling, no `any` leaks. `realtime.svelte.ts` RoomSocket: heartbeat interval is stored and cleared (`#startHeartbeat`/`#stopHeartbeat`), exponential backoff with cap, reconnect-resync hook. `message.ts` parser maintains a documented concatenation invariant and trims trailing punctuation out of auto-links.
- **`dialog.svelte.ts:59-60`** keeps promise resolvers OUT of `$state` with an exemplary comment; `prefs`/`dnd`/`theme` stores validate values through valibot before persisting (`theme.svelte.ts:274-290`).

---

## 5. Per-area notes

### Runes correctness
Idiomatic throughout. `$derived`/`$derived.by` used for all computed values (e.g. `rooms/[id]/+page.svelte:132-188`, `AlertFeed.svelte:70-81`); `$effect` is reserved for genuine side-effects (DOM writes, toasts, subscriptions, autoscroll) — no "effect-as-derived" anti-patterns were found. Non-reactive guard `let`s (`stickNext`, `lastShownError`, `myReactions`) are deliberately plain to avoid self-triggering effects, each documented. The only rune-adjacent noise is the 7 eslint errors, of which **6 are false positives** (F10, F11) authoritatively confirmed by the Svelte autofixer returning `issues: []` and by the official `$effect` docs, and 1 (F12) is a legitimate singleton pattern. Net real rune defects: **0**.

### SvelteKit architecture
SPA by design: `+layout.ts:4` `ssr=false` (cookie auth against a cross-origin Rust API — server can't see the session). No `load` functions fetch data (all data flows through `$lib/api` in components/`onMount`), which is internally consistent with `ssr=false`. Route guarding is the client `$effect` in `+layout.svelte` (F9) plus per-page permission checks (`admin/users:12,53`, room capability gates). `app.d.ts`, generated `$types`, and `resolve()`/`goto` usage are correct. adapter-vercel builds cleanly. This is a coherent, defensible SPA architecture; the one caveat is that all authorization is enforced server-side and the client guards are UX, not security.

### TypeScript & data contracts
`strict` on; no `any` leaks observed; `unknown` used correctly in `api.ts`. The **one systemic gap is F2**: valibot validates user INPUT but never API OUTPUT — every `api.get<T>` is an unchecked cast. For a 15-year-maintainable contract, the server DTOs should be schema-derived and parsed at the boundary. `@ts-expect-error` appears exactly once (`prefs.svelte.ts:105`) with a sound justification.

### Security
No CRITICAL findings. Single sanitized `{@html}`, sanitized rich-text `innerHTML`, universal `rel="noopener noreferrer"`, no open-redirect, id-validated YouTube embeds, plain-text toasts. Tokens/sessions live in HTTP cookies (`credentials: 'include'`), not in `localStorage` (localStorage holds only per-device prefs/filters/social lists). The residual items are NITs (F22 soundcloud host allowlist, F19 a misplaced lint-disable on an already-safe link).

### Accessibility
This is the **largest real debt**. The dominant issue is **F1** — SettingsModal has 34 form controls and only 1 `id` (33 with no label association), exactly the DevTools "form field needs id/name" gap the brief predicted; PostAlertModal adds 5 (F6) and ReplyModal 1 (F8). The base modal lacks a focus **trap** (F4). Positives: dialog ARIA roles, Escape/focus-restore, `aria-pressed` toggles, captions track, `role="status"`/`aria-live` toasts and connection banners, and tablist/tabpanel wiring in SettingsModal/PostAlertModal headers are all correct. eslint reported **0 a11y warnings** (the a11y rules pass) — the id/name gap is a labelling/association issue eslint's svelte a11y set doesn't flag, which is why it needs the manual audit.

### Performance
Large lists (`AlertFeed`, `ChatPanel`) are keyed (`{#each … (id)}` / `(i)`), autoscroll is throttled while the tab is hidden (`shouldThrottle()` via `visibility.svelte.ts`), and `$derived` filtering avoids redundant recompute. LiveKit uses `adaptiveStream`+`dynacast` (`livekit.svelte.ts:141`) and tears down tracks on leave. The main perf lever is **bundle weight (F20)**: the global FontAwesome-5 full stylesheet + 5 Open-Sans weights dominate the CSS payload (133.6 kB / 45.9 kB gzip layout chunk). Subsetting would materially cut first-paint CSS. No unnecessary reactivity or N² render patterns were found.

---

## 6. Recommended remediation order
1. **F18** `pnpm format` and **F10/F11/F12/F19** lint-disable the false positives → green `lint` gate, eslint to 0 (mechanical, no behavior change).
2. **F1/F6/F8** add `id`/`name`/`<label for>` to all form controls → closes the headline a11y/DevTools gap. **F4** add a focus trap to `Modal.svelte`.
3. **F3** add vitest specs for `message.ts`/`schemas.ts`/`alertText.ts` → green `test` gate + pins the XSS-avoidance parser.
4. **F2** introduce valibot schemas for API DTOs and parse at the boundary → hardens the data contract for the long haul.
5. **F5/F7/F13/F14/F20** the remaining cleanups (reconnect-timer handle, localStorage guards, dead buttons, bundle subsetting).

---
*Read-only audit. No source files were modified. Builds/tests were run, creating `node_modules`/`.svelte-kit` only.*
