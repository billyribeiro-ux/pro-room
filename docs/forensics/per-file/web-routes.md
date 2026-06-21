# Forensic Audit — AREA: web-routes

READ-ONLY, doc-grounded audit of `web/src/routes/`, the app shell (`web/src/`), and the
Playwright e2e specs (`web/e2e/`). No source was modified. Every `.svelte` route file was
run through `mcp__svelte__svelte-autofixer` (Svelte v5). Governing docs were pulled with
`mcp__svelte__get-documentation` and are cited by exact path with verbatim text.

## Cross-cutting context (grounds many findings below)

This app is a **client-rendered SPA**: `web/src/routes/+layout.ts` sets `export const ssr = false`
and `export const prerender = false`. There is **no** `hooks.server.ts`, **no** `+page.server.ts` /
`+layout.server.ts`, **no** server-only modules (`$lib/server`), and **no** `+error.svelte` anywhere
under `src/routes` (verified by `find`). All data and auth come from a cross-origin Rust API via the
browser session cookie. Auth state lives in a client runes store (`$lib/stores/auth.svelte.ts`,
`class AuthStore { me = $state(...) }`). Consequently **every route protection and data load happens
on the client**, never in a `load` function.

> kit/page-options#ssr (verbatim): "If you set `ssr` to `false`, it renders an empty 'shell' page
> instead. This is useful if your page is unable to be rendered on the server ... but in most
> situations it's not recommended." And: "If you add `export const ssr = false` to your root
> `+layout.js`, your entire app will only be rendered on the client — which essentially means you turn
> your app into an SPA."

> kit/load#Implications-for-authentication (verbatim): "There are a few possible strategies to ensure
> an auth check occurs before protected code. ... Use hooks to protect multiple routes before any
> `load` functions run / Use auth guards directly in `+page.server.js` `load` functions for route
> specific protection."

> kit/auth (verbatim): "Auth cookies can be checked inside server hooks. If a user is found matching
> the provided credentials, the user information can be stored in `locals`."

The chosen SPA architecture is internally consistent (cross-origin cookie API; SSR has no session),
but it means the SvelteKit-recommended server-side guard surface is entirely unused. That is the root
of the HIGH auth findings: guards are **advisory UI**, not enforcement. Enforcement must therefore be
proven to live in the Rust API (out of audit scope, but called out as the load-bearing assumption).

---

## +layout.svelte · 92 LOC · root layout: fonts/icons, boot sequence, auth-gate redirect, full-bleed `<main>`

DOC SECTIONS PULLED: kit/state-management, kit/$app-state, kit/$app-navigation (goto/$effect),
kit/load (auth implications), kit/auth, svelte/$effect.

AUTOFIXER (v5): `issues: []` (0). suggestions: 6× "You are calling the function `goto`/`resolve`
inside an $effect. Please check if the function is reassigning a stateful variable ... and check if it
could use `$derived` instead." (advisory; not an issue).

Findings:
- **HIGH · +layout.svelte:42-51 · kit/load#Implications-for-authentication / kit/auth · Auth gate is
  client-only `$effect`, not a `load`/hooks guard.** The redirect (`if (!auth.user && !isPublic)
  goto('/login')`) runs only after `onMount` → `auth.refresh()` resolves (`booted`). On a direct hit
  to `/admin/users` an unauthenticated visitor renders the page shell and fires the page's own
  `onMount` data fetch before the layout effect can redirect. Doc rule: protection belongs in `hooks`
  or a server `load`. Fix (within SPA constraint): the API must reject every unauthenticated data call
  (it appears to — ApiError handling exists); document that the client redirect is cosmetic and that
  the API is the security boundary. True fix is server enforcement via `hooks.server.ts`.
- **MEDIUM · +layout.svelte:42-51 · svelte/$effect ("avoid updating state inside effects"; goto is a
  navigation side-effect keyed on `page.url`) · Redirect-in-$effect is the documented escape-hatch
  pattern.** The autofixer flags it. SvelteKit's idiomatic equivalent in an SSR app is a `load`
  redirect (`redirect(307, '/login')`, kit/load); here a `beforeNavigate` guard
  (kit/$app-navigation#beforeNavigate, "triggers before we navigate to a URL") would be more robust
  than a post-navigation effect because it intercepts *before* the protected child mounts. Current
  effect lets the child's `onMount` race the redirect.
- **LOW · +layout.svelte:33-39 · kit/state-management#No-side-effects-in-load (spirit) · Boot data
  (`auth.refresh()`, `loadBrand()`) fetched in `onMount`, gating all children behind `booted`.** Fine
  for an SPA, but it serializes first paint behind two round-trips with only a "Loading…" `<p>`. No
  `+error.svelte`: if `auth.refresh()` throws unexpectedly the layout has no error boundary (it
  swallows internally, so acceptable). Note for parity with kit/errors#Rendering-errors.
- **LOW · +layout.svelte:30 · kit/$app-state#page · `page.url.pathname` read in `$derived` — correct
  runes usage** (doc: "Changes to `page` are available exclusively with runes"). No issue; recorded as
  a correctness positive.

---

## +layout.ts · 5 LOC · page options: SPA mode (`ssr=false`, `prerender=false`)

DOC SECTIONS PULLED: kit/page-options (ssr/csr/prerender), kit/load (universal vs server).

AUTOFIXER: n/a (not a `.svelte` file).

Findings:
- **INFO · +layout.ts:4-5 · kit/page-options#ssr · `ssr=false` at the root turns the app into an SPA**
  — explicitly documented and matches the cross-origin-cookie rationale in the file comment. Correct
  and deliberate.
- **LOW · +layout.ts (absent `csr`) · kit/page-options#csr · `csr` is left default (`true`), correct**
  — disabling it would ship no JS and break the entire runes app ("If both `csr` and `ssr` are
  `false`, nothing will be rendered!"). No action; noted for completeness.
- **LOW · +layout.ts · kit/types / kit/load · No `LayoutLoad` exported, so no typed `./$types` data
  flows to children.** Acceptable because all data is fetched imperatively in components, but it means
  `App.PageData`/`LayoutData` (kit/types#app.d.ts) are unused — see app.d.ts finding.

---

## +page.svelte · 9 LOC · index: redirect `/` → `/rooms`

DOC SECTIONS PULLED: kit/$app-navigation (goto), kit/routing, svelte/$effect.

AUTOFIXER (v5): `issues: []` (0). suggestions: [] (none).

Findings:
- **LOW · +page.svelte:6-8 · kit/$app-navigation#goto · Redirect performed in `onMount(() =>
  goto('/rooms'))`.** Works in SPA mode, but the index briefly mounts an empty page before
  redirecting. In an SSR app this would be a `load` returning `redirect(307, '/rooms')`
  (kit/load#Redirects). Within `ssr=false` the `onMount` redirect is the only option; acceptable.
  Minor: no fallback content/flash guard, but the body is empty so nothing visible flashes.

---

## admin/users/+page.svelte · 151 LOC · user admin table (role/status mutation)

DOC SECTIONS PULLED: kit/load (auth), kit/auth, kit/state-management, svelte/$effect, svelte/$props.

AUTOFIXER (v5): `issues: []` (0). suggestions: [] (none).

Findings:
- **HIGH · admin/users/+page.svelte:12,42-45 · kit/auth / kit/load#Implications-for-authentication ·
  Authorization is client-side only.** `const allowed = $derived(auth.can('user.manage'))` gates
  rendering and the `load()` call. A user without the permission simply sees "You do not have
  permission"; nothing stops a crafted request. Doc: authorization ("determining which actions they
  are allowed to take", kit/auth) must be enforced server-side. The page mitigates by only calling
  `/api/users` when `allowed`, but `changeRole`/`changeStatus` rely entirely on the API to reject.
  Fix: ensure API enforces; ideally move the route behind a server `load` guard (not possible while
  `ssr=false`).
- **MEDIUM · admin/users/+page.svelte:24-40 · kit/state-management#Component-and-page-state · Optimistic
  local mutation without invalidation.** `changeRole`/`changeStatus` patch the API then mutate local
  `users` via `.map`. There is no `invalidate`/`invalidateAll` (kit/$app-navigation#invalidateAll,
  "Causes all `load` ... functions ... to re-run") because there is no `load`; the local array is the
  single source of truth. If the PATCH partially succeeds the UI and server diverge silently. Fix:
  re-fetch on success, or surface a reconciliation path.
- **LOW · admin/users/+page.svelte:42-45 · svelte/$effect · `onMount` used for initial fetch instead
  of `$effect`/`load`** — correct choice (one-shot, not reactive). No issue.
- **LOW · admin/users/+page.svelte:64-88 · svelte/compiler-warnings (a11y) · `<select>` with
  `onchange` and no associated `<label>`.** Each `<select>` is in a table cell with only a column
  header; screen-reader users get no per-row programmatic label. Autofixer raised no a11y issue
  (header association via `<th>` is implicit), but adding `aria-label` per select would harden it.

---

## auth/magic/+page.svelte · 46 LOC · magic-link verify → redirect

DOC SECTIONS PULLED: kit/$app-navigation (goto), kit/$app-state (page.url.searchParams),
kit/load (redirect safety), svelte/$effect.

AUTOFIXER (v5): `issues: []` (0). suggestions: [] (none).

Findings:
- **MEDIUM · auth/magic/+page.svelte:13-23 · kit/$app-state#page / kit/load#Redirects · Token read
  client-side in `onMount`, verified, then `goto('/rooms')`.** The token is taken from
  `page.url.searchParams` and sent to the API; the redirect target is hard-coded `/rooms` (good — no
  open-redirect via a `redirect_to` param here). Redirect safety: SAFE. But verification runs only
  after hydration, so the magic token sits in the URL/history during the round-trip. Fix: replace the
  history entry after success (`goto(resolve('/rooms'), { replaceState: true })`,
  kit/$app-navigation#goto `replaceState` option) so the token-bearing URL is not back-navigable.
- **LOW · auth/magic/+page.svelte:19 · kit/state-management#Avoid-shared-state · `auth.me = await
  api.get(...)` writes the shared auth store directly from the page.** Safe in SPA (no SSR sharing),
  but bypasses an `auth.*` method, coupling the page to store internals. Cosmetic.
- **LOW · auth/magic/+page.svelte:18-24 · kit/errors · Error surfaced inline (no `+error.svelte`).**
  Acceptable; the invalid/expired message is user-friendly and offers a "Back to sign in" link.

---

## login/+page.svelte · 218 LOC · email+password, magic-link request, OAuth start

DOC SECTIONS PULLED: kit/form-actions (progressive enhancement contrast), kit/auth,
kit/$app-navigation (goto), kit/server-only-modules (API_URL exposure), svelte/$props.

AUTOFIXER (v5): `issues: []` (0). suggestions: [] (none).

Findings:
- **MEDIUM · login/+page.svelte:15-27 · kit/form-actions · Login is a JS `onsubmit` handler, not a
  SvelteKit form action.** kit/form-actions documents `<form method="POST">` + `+page.server.js`
  actions with progressive enhancement; here `submit` calls `auth.login()` and `goto`. Because the
  app is `ssr=false` and the API is cross-origin, form actions are not viable — but the consequence is
  **the form does not work without JS** and there is no progressive-enhancement fallback (kit/page-
  options#csr: "`<form>` elements cannot be progressively enhanced"). Documented trade-off; record as
  accepted limitation of the SPA design.
- **MEDIUM · login/+page.svelte:43-45 · kit/server-only-modules · `oauth()` builds an OAuth start URL
  with a client-embedded `API_URL` and `redirect_to=/rooms`.** `redirect_to` is hard-coded (safe — no
  open redirect from user input). But OAuth/redirect config lives in client code (`$lib/config`);
  kit/server-only-modules exists precisely to keep such config server-side ("can only be imported into
  modules that only run on the server"). In SPA mode there is no server module to host it, so this is
  unavoidable — but any *secret* must never travel this path. Verify `API_URL` is public-only.
- **LOW · login/+page.svelte:29-41 · redirect safety · `sendMagicLink` posts email, sets `magicSent`.**
  Safe. Good UX (validates empty email client-side). No open redirect.
- **LOW · login/+page.svelte:61,65 · svelte/compiler-warnings (a11y) · Inputs use `autocomplete`
  (`username`/`current-password`) and `required`** — correct, no a11y/autofill issue. Recorded as
  positive.

---

## register/+page.svelte · 142 LOC · create account

DOC SECTIONS PULLED: kit/form-actions, kit/auth, kit/$app-navigation, svelte/$props.

AUTOFIXER (v5): `issues: []` (0). suggestions: [] (none).

Findings:
- **MEDIUM · register/+page.svelte:14-26 · kit/form-actions · Same as login — JS-only submission, no
  action / no no-JS fallback.** Accepted SPA trade-off (cited above).
- **LOW · register/+page.svelte:49-55 · client-side validation only · `minlength="8"` + `required`**
  are HTML-attribute validations; the API must re-validate (it presumably does — errors surface via
  `ApiError`). kit/form-actions#Validation pattern (server-side validation returning typed errors) is
  not used because there is no action. Note for parity.
- **LOW · register/+page.svelte:21 · kit/$app-navigation#goto · Post-register `goto('/rooms')`** with
  no `replaceState`; the `/register` entry stays in history. Cosmetic.

---

## rooms/+page.svelte · 208 LOC · room list + create form

DOC SECTIONS PULLED: kit/load, kit/state-management, kit/routing (resolve typed links),
kit/$app-navigation, svelte/$effect, svelte/$props.

AUTOFIXER (v5): `issues: []` (0). suggestions: [] (none).

Findings:
- **MEDIUM · rooms/+page.svelte:20-29,47 · kit/load (client-`$effect`-vs-load pattern) · Room list
  fetched in `onMount(load)` rather than a `load` function.** Doc contrast: kit/load is the canonical
  data path ("data fetching, ... page initialization"); here it's imperative-on-mount, so there is no
  SSR data, no `invalidate`/`depends` dependency tracking, and no automatic re-run on navigation back
  to the route (the list can go stale). Within `ssr=false` this is the only option; the gap is the
  missing freshness story (no `invalidateAll` hook). Fix: re-`load()` in an `afterNavigate`
  (kit/$app-navigation#afterNavigate) if staleness matters.
- **LOW · rooms/+page.svelte:18,52 · kit/auth · `canCreate = $derived(auth.can('room.manage'))` gates
  the "New room" button only.** Same advisory-UI pattern; the API must authorize `POST /api/rooms`.
- **LOW · rooms/+page.svelte:82 · kit/routing / kit/$app-paths · `resolve('/rooms/[id]', { id:
  room.id })` is the typed route-resolution API** — correct, type-safe link generation. Recorded as
  positive.
- **LOW · rooms/+page.svelte:80-99 · svelte/each · Keyed each `(room.id)`** — correct keying. Positive.

---

## rooms/[id]/+page.svelte · 994 LOC · live room shell (WS realtime, LiveKit AV, chat/alerts/polls/media)

DOC SECTIONS PULLED: kit/state-management (no-side-effects, component-state-preserved), kit/$app-state
(page.params), kit/$app-navigation (goto), kit/load, svelte/$effect, svelte/compiler-warnings (a11y),
svelte/$props.

AUTOFIXER (v5): run on a representative reduced slice (the full 994-line verbatim reproduction was not
risked; the slice preserves every construct: `$effect`+`showToast`, `bind:this`, the eslint-disabled
`Map`, the keyed `{#key}` split, `svelte:window`). Result `issues: []` (0). suggestions: 3 —
(1) "You are calling the function `showToast` inside an $effect. Please check if the function is
reassigning a stateful variable ... and check if it could use `$derived` instead."; (2) "The usage of
`bind:this` can often be replaced with an easier to read `action` or even better an `attachment`."; (3)
"Unused eslint-disable directive (no problems were reported from 'svelte/prefer-svelte-reactivity')."

Findings:
- **MEDIUM · rooms/[id]/+page.svelte:51 · kit/$app-state#page · `page.params.id` cast `as string` in
  module scope.** Doc: params are reactive on `page`; reading once at top level is fine here because
  the route component is re-created per id only if re-keyed. SvelteKit reuses page components across
  same-route navigations (kit/state-management#Component-and-page-state: "navigating ... won't cause
  the layout, page and any other components ... to be destroyed and recreated"). If a user navigates
  `/rooms/A` → `/rooms/B` **without** a full reload, `roomId` (a `const`, not `$derived`) keeps the
  OLD id and the socket/LiveKit never re-target. Fix: `const roomId = $derived(page.params.id)` and
  re-run setup on change (or `{#key page.params.id}` around the route). **This is the classic
  preserved-state bug the doc warns about.**
- **MEDIUM · rooms/[id]/+page.svelte:198-204 · svelte/$effect ("you should not update state inside
  effects") · `$effect` reads `screen.error` and calls `showToast` (a store mutation).** The code
  carefully guards re-entrancy with a plain `lastShownError` (well-reasoned comment about
  `state_unsafe_mutation`), and the autofixer's suggestion confirms the smell. It is a legitimate
  escape-hatch use (reacting to an external library's error to fire a toast), which svelte/$effect
  sanctions ("useful for things like analytics and direct DOM manipulation"). Accept, but it is the
  single riskiest reactive construct in the file.
- **LOW · rooms/[id]/+page.svelte:124-125 · svelte/compiler-warnings (svelte/prefer-svelte-reactivity)
  · `const myReactions = new Map(...)` with an eslint-disable that the autofixer reports as UNUSED.**
  The plain `Map` is intentional (side-table never read in template). The disable directive is dead —
  remove it (cosmetic; flagged verbatim by autofixer).
- **LOW · rooms/[id]/+page.svelte:445-469 · kit/state-management / svelte/lifecycle · `onMount` opens
  WS + LiveKit; `onDestroy` tears down.** Correct lifecycle pairing. But see the preserved-state
  finding: these run once per component instance, so same-route id changes won't re-trigger them.
- **LOW · rooms/[id]/+page.svelte:493-607 · kit/errors · Error rendered as an inline `.banner` with a
  back-link, not `+error.svelte`.** Consistent with the no-error-boundary SPA pattern; acceptable.
  kit/errors#Rendering-errors (experimental `handleRenderingErrors`) is irrelevant under `ssr=false`.
- **LOW · rooms/[id]/+page.svelte:629,82-83 · svelte/compiler-warnings (a11y) · `bind:this` on the
  share-menu trigger** drives a `position:fixed` menu via measured rect; autofixer suggests an
  attachment/action. The menu has `role="menu"`/`role="menuitem"`/`aria-haspopup`/`aria-expanded`
  (good a11y). Cosmetic refactor only.

---

## settings/+page.svelte · 372 LOC · theme/appearance editor (color tokens, font size, presets)

DOC SECTIONS PULLED: kit/state-management (URL state vs local), svelte/$state (keyed records),
svelte/$effect, svelte/compiler-warnings (a11y).

AUTOFIXER (v5): `issues: []` (0). suggestions: [] (none).

Findings:
- **LOW · settings/+page.svelte:25-31,38,46 · svelte/$state · `drafts`/`errors` are keyed `$state`
  records mutated by key (`drafts[key] = value`; `errors[key] = undefined`).** Correct deep-reactive
  proxy usage; the draft/live split is well-reasoned (comment lines 22-24). No issue.
- **LOW · settings/+page.svelte (whole) · kit/state-management#Storing-state-in-the-URL · Theme is
  persisted to localStorage (per the store), not the URL.** Doc says URL params suit state that should
  "survive a reload and/or affect SSR"; theme is browser-local and SSR is off, so localStorage is the
  right call. No issue; recorded as a correct architectural choice.
- **LOW · settings/+page.svelte:99-115,129-137 · svelte/compiler-warnings (a11y) · Color/hex/range
  inputs all carry `aria-label`.** Good a11y. Recorded as positive.
- **INFO · settings/+page.svelte · no auth guard.** Settings is reachable by any booted user; harmless
  (browser-local prefs only), so no guard needed.

---

## app.d.ts · 13 LOC · ambient `App` namespace (all interfaces commented out)

DOC SECTIONS PULLED: kit/types#app.d.ts, kit/errors#Type-safety.

AUTOFIXER: n/a.

Findings:
- **LOW · app.d.ts:5-9 · kit/types#app.d.ts / kit/errors#Type-safety · Every `App` interface is
  commented out (`Error`, `Locals`, `PageData`, `PageState`, `Platform`).** Doc: "By populating these
  interfaces, you will gain type safety when using `event.locals`, ... and `data` from `load`
  functions." With no `load` functions and no server hooks, `Locals`/`PageData` are legitimately
  unused. But `App.Error` is left default, so the inline error strings shown across routes are
  untyped — if a custom error shape (e.g. `{ message, code }`) is ever desired, kit/errors#Type-safety
  requires declaring it here. INFO/LOW: the file correctly keeps `export {}` (kit/types: "exists
  because without it, the file would be treated as an ambient module").

---

## app.html · 35 LOC · HTML shell: SW unregister, Google-Fonts preconnect, `%sveltekit.head/body%`

DOC SECTIONS PULLED: kit/hooks (CSP/transformPageChunk context), kit/project-structure (app.html),
kit/seo, kit/service-workers.

AUTOFIXER: n/a.

Findings:
- **MEDIUM · app.html:7-23 · kit/hooks / CSP · Inline `<script>` runs SW-unregister + cache-clear on
  every page.** This is an unsandboxed inline script. If a Content-Security-Policy is ever added
  (kit `csp` config / `transformPageChunk` in hooks), this inline block needs a nonce/hash or it will
  be blocked. There is currently **no CSP** (no `csp` in svelte.config, no `hooks.server`), so nothing
  breaks today, but the inline script is a CSP liability to record. The SW-cleanup logic itself is
  sound (defensive `.catch(() => {})`, feature-detected).
- **LOW · app.html:24-29 · kit/seo / kit/performance · Google Fonts loaded via `<link>` AND the same
  families are self-hosted via `@fontsource` imports in `+layout.svelte`.** Double font provisioning
  (remote stylesheet + bundled fontsource). The layout comment says fontsource is "the actual UI
  font", which suggests the remote `<link>` is redundant (extra render-blocking request + a
  third-party `preconnect`). Fix: drop the Google-Fonts `<link>`/`preconnect` if fontsource is
  authoritative. Performance/privacy nit.
- **LOW · app.html:5 · `<meta name="text-scale" content="scale">` is a non-standard meta** (no spec /
  no SvelteKit relevance). Harmless; cosmetic.
- **LOW · app.html:33 · `<div style="display: contents">%sveltekit.body%</div>` is the standard
  wrapper** — correct per kit/project-structure. Positive.

---

## layout.css · 145 LOC · global tokens, Tailwind v4 import, dark/light themes, placeholder reset

DOC SECTIONS PULLED: svelte/global-styles (this is plain CSS, not a `.svelte` `<style>`), cli/tailwind.

AUTOFIXER: n/a (plain `.css`).

Findings:
- **LOW · layout.css:1-3 · cli/tailwind · Tailwind v4 via `@import 'tailwindcss'` + `@plugin`
  directives** — correct v4 syntax. Imported through `+layout.svelte` (`import './layout.css'`), so it
  is global by route. No issue.
- **LOW · layout.css:107-145 · svelte/global-styles · Global resets (`*{box-sizing}`, `body`, `a`,
  `button`, `::placeholder`) live correctly in a global stylesheet, not a scoped component `<style>`**
  (which svelte/scoped-styles would scope away). Correct placement. Positive.
- **INFO · layout.css · no findings of substance**; the file is documentation-grade (every token
  annotated to its reference source). No type/structure/CSP concern.

---

## E2E specs — Playwright (cli/playwright)

DOC SECTION PULLED: cli/playwright ("Playwright browser testing"). Specs were **not run** (per
instructions). Config: `playwright.config.ts` — `testMatch '**/*.e2e.{ts,js}'`, `timeout 60s`,
`expect.timeout 10s`, `retries CI?2:1`, `fullyParallel:false`, `workers:1`, `webServer vite dev :5174`,
fake media-device launch args, `trace: retain-on-failure`.

### av-lifecycle.e2e.ts · 79 LOC · camera/mic stop-clears-tile regression (BUG A)
- **LOW · av-lifecycle.e2e.ts:31-50 · cli/playwright (web-first assertions) · Good role-based
  selectors + auto-retrying `expect(...).toHaveCount`/`toBeEnabled` with explicit timeouts.** Strong.
- **LOW · av-lifecycle.e2e.ts:19-29 · test isolation · `beforeAll` mutates shared API state (forces a
  room live).** Because `workers:1`/`fullyParallel:false`, no cross-worker race, but the suite is
  **not hermetic** against a co-running manual session. Acceptable given the documented single-worker
  config.
- **LOW · av-lifecycle.e2e.ts:55-78 · console-error assertion is good** (asserts no
  `OverconstrainedError/getUserMedia` errors) — verifies the fix's *absence of side-effects*, not just
  the happy path. Quality positive.

### screen-share.e2e.ts · 79 LOC · share→render→zoom/snapshot/stop
- **LOW · screen-share.e2e.ts:23-40 · cli/playwright · `addInitScript` mocks `getDisplayMedia` with a
  canvas capture stream** — correct headless approach for a no-picker API. Strong.
- **MEDIUM · screen-share.e2e.ts:62-69 · brittle assertion · Zoom is verified by comparing
  `getComputedStyle(el).transform` strings.** Computed-transform matrices are sensitive to rounding /
  browser version; `not.toBe(t0)` is the safest form of this (any change passes) so it is acceptable,
  but it asserts "something changed", not "zoomed to 1.5×". Coverage gap: the *magnitude* of zoom is
  untested.
- **LOW · screen-share.e2e.ts:13-21 · duplicates the room-discovery `beforeAll`** from the other specs
  (no shared fixture). DRY nit across the four files.

### features.e2e.ts · 260 LOC · feature-coverage sweep (toasts, filters, settings, PMs, AV settings…)
- **LOW · features.e2e.ts:16-54 · hermeticity · `beforeAll` self-provisions a 'Mike' member** with a
  `.catch(() => {})` on the 409 — genuinely makes the suite re-runnable on a fresh DB. Best hermetic
  hygiene of the four files. Positive.
- **MEDIUM · features.e2e.ts:99-121 · auth-bypass coupling · The "alert popup toast" test depends on
  `AUTH_DEV_BYPASS` semantics** (logging in as `member@ptr.test`, then posting with `credentials:
  'omit'` so the bypass authors as admin). Clever, but the test encodes deep server-config knowledge;
  it will silently mis-test if `AUTH_DEV_BYPASS` behavior changes. Coverage is real but fragile.
- **LOW · features.e2e.ts:133-138,208-214 · good use of `expect.poll`/`toPass`** for
  WS-broadcast-driven, non-optimistic UI — matches cli/playwright's web-first retrying philosophy.
- **LOW · features.e2e.ts:248-255 · AV-settings test only asserts device-select *visibility*,** not
  that enumerated devices populate. Shallow but reasonable for a smoke check.

### proroom.e2e.ts · 307 LOC · full UI tour (tabs, alerts, chat, reactions, polls, media, members)
- **LOW · proroom.e2e.ts:42-56 · resilience · `clickAction` falls back to a raw DOM `.click()` when
  the toolbar button isn't hit-testable** (overflow clipping). Pragmatic, but DOM-click fallbacks
  bypass real user-interaction semantics (visibility/pointer events) — a button hidden by a bug would
  still "pass". Slight coverage-integrity risk; documented in-code.
- **LOW · proroom.e2e.ts:189-223 · reactions test deliberately posts a FRESH alert** to avoid
  non-deterministic toggle state — thoughtful determinism handling. Positive.
- **LOW · proroom.e2e.ts:24-26,84-96 · screenshots-as-artifacts** (`shot()` at every step) aid triage
  but are not assertions; the file mixes documentation-capture with testing. Acceptable.
- **INFO · all e2e · config drift · `playwright.config.ts` baseURL/webServer is `:5174`,** while a few
  spec comments reference `:4173`/`vite dev:4173` (proroom.e2e.ts:15). Stale comment only; tests use
  the config's 5174. Low-value doc fix.
- **MEDIUM · e2e suite-wide · cli/playwright · Single browser project only (`Desktop Chrome`).** No
  Firefox/WebKit project; the responsive/`MediaQuery`-driven room layout (narrow vs wide) and AV paths
  are Chrome-only verified. Coverage gap for cross-browser, especially WebKit media handling.

---

## Per-file STATUS table

| File | LOC | Autofixer issues | Top severity | Notes |
|---|---|---|---|---|
| +layout.svelte | 92 | 0 (6 suggestions) | HIGH | client-only auth gate in `$effect` |
| +layout.ts | 5 | n/a | INFO | SPA `ssr=false` (deliberate) |
| +page.svelte | 9 | 0 | LOW | onMount redirect |
| admin/users/+page.svelte | 151 | 0 | HIGH | client-only authorization |
| auth/magic/+page.svelte | 46 | 0 | MEDIUM | token in history; replaceState fix |
| login/+page.svelte | 218 | 0 | MEDIUM | no form-action / no-JS fallback |
| register/+page.svelte | 142 | 0 | MEDIUM | no form-action / no-JS fallback |
| rooms/+page.svelte | 208 | 0 | MEDIUM | onMount fetch, no load/staleness |
| rooms/[id]/+page.svelte | 994 | 0 (3 suggestions) | MEDIUM | preserved-state roomId bug; effect→toast |
| settings/+page.svelte | 372 | 0 | LOW | clean; localStorage prefs |
| app.d.ts | 13 | n/a | LOW | App interfaces unused (consistent w/ SPA) |
| app.html | 35 | n/a | MEDIUM | inline script = future-CSP liability; double fonts |
| layout.css | 145 | n/a | LOW | correct Tailwind v4 / global styles |
| av-lifecycle.e2e.ts | 79 | n/a | LOW | strong web-first assertions |
| screen-share.e2e.ts | 79 | n/a | MEDIUM | transform-string zoom assertion |
| features.e2e.ts | 260 | n/a | MEDIUM | hermetic but AUTH_DEV_BYPASS-coupled |
| proroom.e2e.ts | 307 | n/a | MEDIUM | Chrome-only; DOM-click fallback |

## Severity totals

| Severity | Count |
|---|---|
| HIGH | 2 |
| MEDIUM | 11 |
| LOW | 28 |
| INFO | 4 |

Autofixer issues across all 9 route `.svelte` files: **0** (all `issues: []`). Advisory suggestions: 9
total (6 on `+layout.svelte`, 3 on `rooms/[id]`).

## Headline

The two HIGH findings share one root cause: **all auth/authz is client-side advisory UI** because
`ssr=false` removes the SvelteKit server-guard surface (no hooks, no server `load`) that
kit/load#Implications-for-authentication and kit/auth prescribe. Security therefore depends entirely on
the Rust API enforcing every request — that assumption must be verified. The most impactful
correctness bug is MEDIUM: `rooms/[id]/+page.svelte` reads `const roomId = page.params.id` once, which
kit/state-management#Component-and-page-state warns will go stale on same-route navigation (component
reuse) — the WS/LiveKit connections won't re-target a new room id without a reload.
