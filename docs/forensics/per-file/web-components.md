# Per-file, doc-grounded Svelte 5 audit — `web/src/lib/components/`

**Area:** web-components · **Repo:** `/home/user/pro-room` · **Date:** 2026-06-21 · **Mode:** READ-ONLY (no source modified)

## Method & environment

- **Svelte:** 5.56.1. **Runes mode:** FORCED on for every non-`node_modules` file (`web/vite.config.ts` → `sveltekit({ compilerOptions: { runes: ({filename}) => filename includes node_modules ? undefined : true } })`). So all 29 files are runes-mode components.
- **TS:** `web/tsconfig.json` has `strict: true`, `checkJs: true`, `allowJs: true`, `moduleResolution: "bundler"`.
- **Async/await-runes experimental flag:** NOT enabled (no `experimental.async`, no `await` compilerOption). Therefore every `mcp__svelte__svelte-autofixer` run used **`async: false`**, `desired_svelte_version: 5`, and `filename` = the component file name.
- For every file: (1) full Read; (2) `svelte-autofixer` with the settings above, recording `issues[]` verbatim; (3) governing docs pulled via `mcp__svelte__get-documentation` and cited by exact section path; (4) audit against the pulled doc text.

**Autofixer note that applies to ALL files:** `svelte-autofixer` returned **`issues: []` for every one of the 29 files** (zero blocking issues). It additionally emitted advisory *suggestions* (not `issues[]`): most commonly "stateful variable assigned inside an `$effect` — consider `$derived`", "function called inside an `$effect`", and "`bind:this` could be an attachment". Per the pulled `svelte/$effect` doc ("When not to use `$effect`"), these suggestions are heuristic and several are false positives (e.g. `bind:this` targets are not in-effect assignments; effects doing feature-detection / network / DOM writes are legitimate escape-hatch uses, not the state-syncing anti-pattern). Where a suggestion corresponds to a real smell it is recorded as a finding below; otherwise it is noted as a suppressed/false-positive suggestion in the file's `svelte-autofixer` line.

**Severity key:** C = correctness/security broken at runtime · H = likely bug, real a11y barrier, or resource leak · M = reactivity/maintainability smell that can bite · L = minor · NIT = style.

**Cross-cutting facts (corroborated by grep + every subagent):**
- The ONLY `{@html}` in the entire component set is `NotesPanel.svelte:230` (`{@html sanitize(selected.body)}`, DOMPurify, browser-guarded). `MessageBody.svelte` and `ToastContainer.svelte` explicitly render user content as escaped text and document that they avoid `{@html}`. **No raw/unsanitized `{@html}` XSS surface anywhere.**
- **No legacy `<slot>`, no `on:` event directives, no `export let`** anywhere — the codebase is fully migrated to runes + event attributes + `{@render}`/snippet props.
- All dynamic `{#each}` blocks key on stable ids (`a.id`, `m.id`, `q.id`, `b.id`, `u.user_id`, `f.id`, `c.key`, `option.id`, `publisher.id`, `t.id`). Index keys (`(i)`/`(si)`) appear only over immutable parsed-text segment arrays (safe) — except where flagged in MessageBody/PollModal.

---

## File reports

### `/home/user/pro-room/web/src/lib/components/AlertFeed.svelte`
- **LOC:** 882 · **Purpose:** Alerts feed panel — alert list with row menus, Q&A, reactions, and a post-alert composer.
- **Doc sections pulled:** svelte/$effect, svelte/$derived, svelte/compiler-warnings, svelte/@html, svelte/each
- **svelte-autofixer:** `issues: []` (suggestions only: `shouldThrottle`/`tick` called inside `$effect`; `bind:this` → attachment; "Found a mutable instance of the built-in Map class. Use SvelteMap instead. at line 63, column 15")
- **Findings:**
  - **[M]** AlertFeed.svelte:96-105 — svelte/$effect ("When not to use $effect") — autoscroll via `$effect.pre` reading `visibleAlerts.length` then `tick().then(scroll)` is the canonical documented pattern; correct, not state-sync. *Fix: none.*
  - **[L]** AlertFeed.svelte:383 — svelte/compiler-warnings (a11y) — posted-alert image has `alt=""` (decorative) but is user content; SR users get no signal an image exists. *Fix: generic `alt="Alert attachment"`.*
  - **[L]** AlertFeed.svelte:94,101-103 — svelte/$effect (Understanding dependencies) — `stickNext` is a plain non-reactive `let` read in the effect and in `submit()`; works via effect-tick timing but is fragile. *Fix: acceptable; gate via `$state`+`untrack` if churn appears.*
  - **[NIT]** AlertFeed.svelte:74-79 — svelte/$derived — `$derived.by` builds a plain `Map` (autofixer suggests `SvelteMap`); false positive — the Map is fully reconstructed each run and never reactively mutated. *Fix: none.*

### `/home/user/pro-room/web/src/lib/components/AlertQaModal.svelte`
- **LOC:** 600 · **Purpose:** Modal showing an alert's Q&A thread — list/answer/resolve questions, ask new ones.
- **Doc sections pulled:** svelte/$effect, svelte/compiler-warnings, svelte/@html, svelte/each
- **svelte-autofixer:** `issues: []` (suggestion only: `loadThread` called inside `$effect`)
- **Findings:**
  - **[H]** AlertQaModal.svelte:144-150 — svelte/compiler-warnings (a11y_click_events_have_key_events / a11y_no_static_element_interactions) — backdrop `<div role="presentation" onclick=close>` is click-to-dismiss with no keyboard equivalent on the element; mitigated by a `svelte:window` Escape handler (line 140) so close IS keyboard-reachable. *Fix: keep the window Escape; document the ignore. Acceptable.*
  - **[M]** AlertQaModal.svelte:58-61 — svelte/$effect ("When not to use $effect" / Understanding dependencies) — `$effect` fires the thread fetch on `alert?.id` change; legitimate network side-effect, correctly narrowed to `alert?.id` so composer typing won't refetch; async writes occur after `await` (untracked), no loop. *Fix: none.*
  - **[L]** AlertQaModal.svelte:19 — svelte/typescript — `page.params.id as string` unchecked cast; fine given the `[id]` route. *Fix: none.*
  - **[NIT]** AlertQaModal.svelte:195,208 — svelte/each — inner `{#each parseMessage(...) as seg, si (si)}` index-keys, safe because segments are immutable parsed text (never reordered/spliced). *Fix: none.*

### `/home/user/pro-room/web/src/lib/components/AlertsChatDock.svelte`
- **LOC:** 271 · **Purpose:** Two-pane dock composing AlertFeed over ChatPanel with a draggable horizontal splitter and persisted fraction.
- **Doc sections pulled:** svelte/$effect, svelte/$state, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []` (suggestions only: function/`String` called inside `$effect`)
- **Findings:**
  - **[H]** AlertsChatDock.svelte:97-113 — svelte/$effect (teardown) / listener leak — `startHeightDrag` adds `window` `pointermove`/`pointerup` listeners, removed only inside the `up` handler. If the component unmounts mid-drag, `up` never fires → both listeners leak. No `$effect`/`onDestroy` teardown. *Fix: register drag listeners inside an `$effect` keyed on `dragging` (teardown removes them), or use `setPointerCapture`.*
  - **[M]** AlertsChatDock.svelte:84-90 — svelte/$state — `columnEl` is a plain `let` set by an attachment, read only imperatively in a pointer handler; non-reactivity harmless. *Fix: optional `$state` for consistency.*
  - **[M]** AlertsChatDock.svelte:92-95 — svelte/$effect ("When not to use $effect") — persisting `alertsFraction` to localStorage in an `$effect` is a valid side effect, not state-sync. *Fix: none.*
  - **[L]** AlertsChatDock.svelte:136-145 — svelte/compiler-warnings (a11y_no_noninteractive_element_interactions) — splitter `<div role="separator" onpointerdown ondblclick>` has no `tabindex`/arrow-key resize; resize is mouse-only. *Fix: add `tabindex="0"` + arrow-key `onkeydown` to nudge fraction.*

### `/home/user/pro-room/web/src/lib/components/Badges.svelte`
- **LOC:** 93 · **Purpose:** Inline badge cluster (custom badges, Trial/New pills, tenure stars) after a username.
- **Doc sections pulled:** svelte/$derived, svelte/$props, svelte/each, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []`
- **Findings:** **None.** `$derived` for `hasAny` correct; `{#each data.badges as b (b.id)}` keyed; badge images carry `alt={b.label}`; props typed and read-only.

### `/home/user/pro-room/web/src/lib/components/CaptionsOverlay.svelte`
- **LOC:** 191 · **Purpose:** Caption bar overlay — Web Speech recognition for presenter, broadcast captions for viewers.
- **Doc sections pulled:** svelte/$effect, svelte/$derived, svelte/$state, svelte/transition, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []` (suggestions: `supported`/`interimText` assigned inside `$effect`; `onCaption` called inside `$effect`)
- **Findings:**
  - **[M]** CaptionsOverlay.svelte:45-113 — svelte/$effect ("When not to use $effect") — effect assigns `$state` (`supported` from `window.SpeechRecognition` feature-detection; `interimText` from async recognizer callbacks). Neither is derivable from other state → legitimate escape-hatch (third-party API). Teardown nulls handlers, calls `recognition.stop()`, resets `interimText`. *Fix: none.*
  - **[L]** CaptionsOverlay.svelte:185-190 — svelte/transition — `@media (prefers-reduced-motion)` sets CSS `transition: none`, but the fade is a Svelte JS transition (`transition:fade`, WAAPI/inline-style driven), so the CSS property does NOT disable it. *Fix: guard reduced-motion in JS (`matchMedia(...)` → `duration: 0`).*
  - **[L]** CaptionsOverlay.svelte:67-81 — svelte/$effect (Understanding dependencies) — `onCaption?.(trimmed)` invoked from async `onresult` callback (untracked, read fresh). *Fix: none.*
  - **[L]** CaptionsOverlay.svelte:124 — svelte/compiler-warnings (a11y satisfied) — caption bar `role="status" aria-live="polite"` correct for live captions. *Fix: none.*

### `/home/user/pro-room/web/src/lib/components/ChatPanel.svelte`
- **LOC:** 1022 · **Purpose:** Chat panel — channel tabs, message list with row menus/reactions, auto-growing composer with emoji/image affordances.
- **Doc sections pulled:** svelte/$effect, svelte/$derived, svelte/$state, svelte/@html, svelte/each, svelte/compiler-warnings, svelte/scoped-styles
- **svelte-autofixer:** `issues: []` (suggestions only: `shouldThrottle`/`tick` in `$effect`; three `bind:this` → attachment notes)
- **Findings:**
  - **[H]** ChatPanel.svelte:415-417 / 833-845 — svelte/compiler-warnings (a11y_no_static_element_interactions) — `.username` `<span>` has `cursor: pointer` ("name opens user info") but NO `onclick`/role — a misleading affordance (looks clickable, isn't). *Fix: remove `cursor: pointer`, or make it a `<button>`/add `role`+`onclick`+`onkeydown`.*
  - **[M]** ChatPanel.svelte:100-113 — svelte/$effect ("When not to use $effect") — autoscroll via `$effect.pre` matches the doc's canonical chat example; `stickNext` plain non-reactive `let` is intentional. *Fix: none.*
  - **[L]** ChatPanel.svelte:287-300 — svelte/$effect (teardown) — `dismissEmoji` attachment adds `document` keydown/pointerdown listeners and returns cleanup removing them; attachment teardown runs on unmount, no leak. *Fix: none.*
  - **[L]** ChatPanel.svelte:410 — svelte/compiler-warnings (a11y) — avatar `<img alt="" />` decorative-marked; acceptable (initials fallback + adjacent name convey identity). *Fix: optional author-name alt.*
  - **[NIT]** ChatPanel.svelte:719-722 — svelte/scoped-styles — `.messages.small-images :global(.body img)` correctly uses `:global` to reach child `MessageBody`'s scoped `<img>`. *Fix: none.*

### `/home/user/pro-room/web/src/lib/components/ConnectionOverlay.svelte`
- **LOC:** 117 · **Purpose:** Fixed top banner showing "Reconnecting…" while the socket is down + a transient "Connected" toast on recovery.
- **Doc sections pulled:** svelte/$effect, svelte/$derived, svelte/$state, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []` (suggestions only: `showConnected` assigned inside `$effect` / `setTimeout` + `clearTimeout` called inside `$effect`)
- **Findings:**
  - **[M]** ConnectionOverlay.svelte:29-41 — svelte/$effect ("When not to use $effect" / Understanding dependencies) — edge-detector effect uses a **module-scoped** `let prev` to dodge the dependency graph. The timer is a real side effect (defensible), but `prev` is module-level → shared across all instances / stale on re-init. *Fix: make `prev` a component-local `let`, or model the toast with `{#key}`/transition.*
  - **[L]** ConnectionOverlay.svelte:15 — svelte/$derived — `down` correctly `$derived`. *Fix: none.*
  - **[NIT]** ConnectionOverlay.svelte:44/46/52 — svelte/compiler-warnings (a11y) — outer `aria-live="polite"` wrapper plus inner `role="status"` (implicit polite live region) double-announces. *Fix: drop one.*

### `/home/user/pro-room/web/src/lib/components/DialogHost.svelte`
- **LOC:** 142 · **Purpose:** Renders the active confirm/prompt dialog from the shared `dialog` store via `Modal`, resolving the dialog promise on confirm/submit/dismiss.
- **Doc sections pulled:** svelte/$derived, svelte/$state, svelte/$props, svelte/compiler-warnings, svelte/bind
- **svelte-autofixer:** `issues: []`
- **Findings:**
  - **[M]** DialogHost.svelte:20-25,73 — svelte/$state / svelte/$effect — `seedAndFocus` is an `{@attach}` factory that writes `inputValue = initial` as a side effect during attachment; relies on `{#key request}` (line 56) remount to re-seed. Works, but seeding-from-attach is state-sync-adjacent and silently breaks if the keyed remount is removed. *Fix: seed via a `$derived`-backed initializer or function binding.*
  - **[L]** DialogHost.svelte:56 — svelte/key — keying on the whole `request` object remounts Modal+input on any new identity (discards focus/IME). Intended. *Fix: key on a stable request id if churn matters.*
  - **[L]** DialogHost.svelte:35-40 — svelte/compiler-warnings (a11y) — Enter submits but no Escape-to-dismiss on the input (relies on Cancel/Modal). *Fix: handle `Escape` → `dismissDialog()`.*
  - **Note:** `request.message` rendered as text, not `{@html}` — no XSS.

### `/home/user/pro-room/web/src/lib/components/FilesPanel.svelte`
- **LOC:** 510 · **Purpose:** Room file browser — list/filter by category, credentialed upload, credentialed blob download, delete-with-confirm.
- **Doc sections pulled:** svelte/$state, svelte/$derived, svelte/$props, svelte/bind, svelte/compiler-warnings, svelte/lifecycle-hooks
- **svelte-autofixer:** `issues: []` (suggestion only: `bind:this` could be an attachment/action)
- **Findings:**
  - **[M]** FilesPanel.svelte:80-110 (`onUpload`) — svelte/bind ("`<input bind:files>`") — reads `e.currentTarget.files?.[0]` and manually resets `input.value=''` instead of the documented `bind:files`. Works. *Fix: optional — `bind:files` + reset via `new DataTransfer().files`.*
  - **[NIT]** FilesPanel.svelte:155/159 — svelte/compiler-warnings (a11y) — `role="tablist"`/`role="tab"` present but no `role="tabpanel"`/`aria-controls` wiring; incomplete tab semantics. *Fix: add `aria-controls` + `tabpanel`, or drop tab roles.*
  - **[L]** FilesPanel.svelte:27,196 (`fileInput`) — svelte/bind (bind:this) — used only to call `.click()`; typed `HTMLInputElement | null`, read in handler. Correct. *Fix: optional attachment.*
  - **[L]** FilesPanel.svelte:61-78 (`download`) — behavioral — `catch {}` swallows the error then `window.open` fallback. Not a Svelte-rule issue. *Fix: surface the error.*
  - **Note:** `{#each CATEGORIES as c (c.key)}` and `{#each shown as f (f.id)}` keyed correctly; `<img alt={f.filename}>` present.

### `/home/user/pro-room/web/src/lib/components/Icon.svelte`
- **LOC:** 34 · **Purpose:** Font Awesome `<i>` wrapper — derives `fas`/`far`/`fab` prefix, applies size/title/aria-hidden, decorative by default.
- **Doc sections pulled:** svelte/$derived, svelte/$props, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []`
- **Findings:**
  - **[L]** Icon.svelte:23 — svelte/$props ("Type safety") — `name: string` only; a typo'd glyph renders empty with no compile guard. *Fix: optional string-literal union for known glyphs.*
  - **[NIT]** Icon.svelte:31-33 — svelte/compiler-warnings (a11y) — correctly toggles `role="img"`+`aria-label` when titled, `aria-hidden="true"` when decorative — idiomatic. *Fix: none.*

### `/home/user/pro-room/web/src/lib/components/MainStage.svelte`
- **LOC:** 256 · **Purpose:** Main room panel with Screens/Notes/Files tab bar (locked to Screens for non-admins on screen-lock), captions overlay, floating webcam holder.
- **Doc sections pulled:** svelte/$derived, svelte/$state, svelte/$props, svelte/compiler-warnings, svelte/each
- **svelte-autofixer:** `issues: []`
- **Findings:**
  - **[L]** MainStage.svelte:69 — svelte/$derived / svelte/$effect ("When not to use $effect") — `activeTab = $derived(locked ? 'screens' : tab)` correctly uses `$derived` so the lock can't fight user clicks — exemplary. *Fix: none.*
  - **[NIT]** MainStage.svelte:79-92 — svelte/compiler-warnings (a11y) — `role="tablist"`/`role="tab"`+`aria-selected` but no `tabpanel`/`aria-controls` on `.panel`. *Fix: add `aria-controls`/`tabpanel`.*
  - **[NIT]** MainStage.svelte:97 — svelte/compiler-warnings (a11y_hidden) — inert placeholder `<button hidden tabindex="-1" aria-hidden="true">` is intentional DOM-parity scaffolding. *Fix: none.*
  - **Note:** `{#each TABS as t (t.id)}` keyed; `.panel > *`/`.webcam-overlay` use `:global()` correctly for child-component targeting.

### `/home/user/pro-room/web/src/lib/components/MediaPlayer.svelte`
- **LOC:** 260 · **Purpose:** Shared media player — SoundCloud/YouTube iframes or native `<audio>`/`<video>` for direct files, with a background-volume slider.
- **Doc sections pulled:** svelte/$effect, svelte/$derived, svelte/$state, svelte/$props, svelte/bind, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []` (suggestions: `mediaEl` "assigned inside an $effect" [false positive — it's `bind:this`]; two `bind:this` → attachment notes)
- **Findings:**
  - **[M]** MediaPlayer.svelte:20,28-32 — svelte/bind ("`<audio>`/`<video>` volume") — uses `bind:this={mediaEl}` + a manual `$effect` writing `mediaEl.volume = volume/100`, reimplementing the built-in media `volume` binding. Legitimate DOM-manipulation escape hatch, not a bug. *Fix: `bind:volume` (function binding) drops `mediaEl` and the effect.*
  - **[L]** MediaPlayer.svelte:139-146 (`<audio>`) / 151-163 (`<video>`) — svelte/compiler-warnings (a11y_media_has_caption) — rule governs `<video>` only; the `<video>` correctly includes `<track kind="captions" />` (empty track is the documented escape); `<audio>` is exempt. Compliant. *Fix: none.*
  - **[L]** MediaPlayer.svelte:84-100 — svelte/$derived — `embedSrc`/`isDirect` correctly use `$derived`/`$derived.by`. *Fix: none.*
  - **[L]** MediaPlayer.svelte:87 — svelte/@html (XSS-adjacent) — no `{@html}`; SoundCloud URL built with `encodeURIComponent`; YouTube id regex-extracted. `media.url` flows into media/iframe `src` with no explicit http(s) allowlist. *Fix: optionally validate scheme.*
  - **[NIT]** MediaPlayer.svelte:15,168,172 — svelte/$props (`$props.id()`) — used for stable `for`/`id` label association — idiomatic. *Fix: none.*

### `/home/user/pro-room/web/src/lib/components/MembersPanel.svelte`
- **LOC:** 304 · **Purpose:** Admin drawer listing/adding/removing room members + online-presence (IP/geo) section.
- **Doc sections pulled:** svelte/$state, svelte/$props, svelte/$effect, svelte/each, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []`
- **Findings:**
  - **[M]** MembersPanel.svelte:59 — svelte/$effect / svelte/lifecycle-hooks — `onMount(load)` runs an async fetch with no abort/teardown; assigns to state after the drawer may unmount. Low risk. *Fix: `AbortController` + bail in cleanup if hardened.*
  - **[L]** MembersPanel.svelte:62-63 — svelte/compiler-warnings (a11y_click_events_have_key_events) — overlay close-on-click warning is svelte-ignored but Escape-to-close is genuinely absent (unlike Modal). *Fix: add `onkeydown` Escape, or reuse Modal.*
  - **[NIT]** MembersPanel.svelte:101-106 — svelte/$state — `bind:value={role}` (typed `Role`); options are fixed literals, no runtime guard. *Fix: none required.*

### `/home/user/pro-room/web/src/lib/components/MessageBody.svelte`
- **LOC:** 110 · **Purpose:** Safe, segment-parsed colored renderer for a chat message body (tickers/mentions/links/images/GIFs) — deliberately avoids `{@html}`.
- **Doc sections pulled:** svelte/each, svelte/$state, svelte/$props, svelte/@html, svelte/scoped-styles, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []`
- **Findings:**
  - **[M]** MessageBody.svelte:30 — svelte/each ("Keyed each blocks") — `{#each parseMessage(text) as seg, i (i)}` index-keys a list re-derived from `text`; on edit, index keys patch-in-place and can reuse a `<span class="ticker">` as an `<a>` (type mismatch). Also `parseMessage` re-runs every render (inline call, not `$derived`). *Fix: content-stable key `` `${i}:${seg.kind}:${seg.value}` `` and `const segments = $derived(parseMessage(text))`.*
  - **[L]** MessageBody.svelte:46 — svelte/compiler-warnings (a11y) — inline `<img alt="">` is decorative-marked but the image is posted content; hidden from SR. *Fix: `alt="posted image"` or derive from filename.*
  - **[NIT]** MessageBody.svelte:16 — svelte/$state ("Built-in classes") — `SvelteSet` used correctly; `shownGifs` never reset on `text` change (harmless, hrefs unique). *Fix: none.*

### `/home/user/pro-room/web/src/lib/components/Modal.svelte`
- **LOC:** 179 · **Purpose:** Reusable accessible dialog (backdrop, `role=dialog`, focus capture/restore, Escape, snippet header/children/footer).
- **Doc sections pulled:** svelte/$effect, svelte/$props, svelte/$state, svelte/snippet, svelte/@render, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []` (suggestions: `queueMicrotask`/function in `$effect` [false positive — effect only reads `open`, no state writes]; `bind:this` → attachment)
- **Findings:**
  - **[H]** Modal.svelte:23-32 — svelte/$effect + a11y — `aria-modal="true"` set, focus moved in once and restored on close, but **no focus trap** → Tab escapes to background content; also no background-scroll lock. *Fix: trap Tab within `panel`, or use native `<dialog>` + `showModal()` (the autofixer-suggested attachment can encapsulate this).*
  - **[M]** Modal.svelte:23-32 — svelte/$effect ("Understanding dependencies") — depends only on `open`; `queueMicrotask(() => panel?.focus())` reads `panel` async (untracked) — relies on microtask ordering if `open` is true at mount. *Fix: gate focus on `panel` binding, or use `autofocus`/attachment.*
  - **[L]** Modal.svelte:44 — svelte/compiler-warnings (a11y_click_events_have_key_events) — backdrop `onclick` + `onkeydown` (Escape) satisfies the warning; inner-panel Escape is harmless redundancy. *Fix: none.*

### `/home/user/pro-room/web/src/lib/components/Nav.svelte`
- **LOC:** 110 · **Purpose:** Top nav bar — brand, role-gated links, user identity, logout.
- **Doc sections pulled:** svelte/$props, svelte/$state, svelte/$effect, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []`
- **Findings:** **None.**

### `/home/user/pro-room/web/src/lib/components/NotesPanel.svelte`
- **LOC:** 405 · **Purpose:** Room notes tab — list/create/rename/delete/reorder/download notes; render selected body as sanitized `{@html}`.
- **Doc sections pulled:** svelte/@html, svelte/scoped-styles, svelte/global-styles, svelte/$derived, svelte/$effect, svelte/$state, svelte/each, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []`
- **Findings:**
  - **[M]** NotesPanel.svelte:230 — svelte/@html ("Never render unsanitized content") — `{@html sanitize(selected.body)}` is DOMPurify-sanitized client-side (SSR returns `''` → blank until hydration, acceptable defense). DOMPurify **defaults** still allow e.g. `<a href>` / inline styles. *Fix: pin an explicit DOMPurify allow-list config rather than defaults.*
  - **[L]** NotesPanel.svelte:360-388 — svelte/@html ("Styling") / svelte/scoped-styles — `.rendered :global(p|a|ul|…)` correctly used so scoped styles reach `{@html}` content (right pattern, avoids css_unused_selector). *Fix: none.*
  - **[L]** NotesPanel.svelte:23-24 — svelte/$derived — `selected`/`selectedIndex` correctly `$derived` (no `$effect` state-sync). *Fix: none.*
  - **[NIT]** NotesPanel.svelte:172-176 — svelte/each — tabs keyed by `n.id`; `i === 0` "home" icon ties to array order which `reorder` mutates server-side then reloads — consistent. *Fix: none.*

### `/home/user/pro-room/web/src/lib/components/PollModal.svelte`
- **LOC:** 617 · **Purpose:** Draggable floating poll-creation panel — create/canned tabs, choice builder, localStorage canned store, drag/minimize/maximize chrome.
- **Doc sections pulled:** svelte/$effect, svelte/$derived, svelte/$state, svelte/$props, svelte/each, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []` (suggestions: every form field "assigned inside an $effect — consider $derived"; `loadCanned` in `$effect`)
- **Findings:**
  - **[H]** PollModal.svelte:150-160 — svelte/$effect (listener cleanup) — `onTitlePointerDown` adds `window` `pointermove`/`pointerup`, removed only in the `up` handler → leaks if the panel closes mid-drag. No component-level teardown. *Fix: register/cleanup drag listeners in an `$effect` teardown / `onDestroy`, or `setPointerCapture`.*
  - **[M]** PollModal.svelte:65-79 — svelte/$effect ("When not to use $effect") — resets ~11 `$state` vars inside `$effect(() => { if (open) {...} })`; the flagged anti-pattern (reads `open`, writes unrelated state, order-sensitive, re-runs on `open` toggle). *Fix: trigger the reset from the open call site, or `{#key open}` remount the panel.*
  - **[M]** PollModal.svelte:264,309 — svelte/each ("Keyed each blocks") — `{#each choices as choice, i (i)}` and `{#each canned as c, i (i)}` index-key lists that support mid-list removal (`filter`) → stale trailing text/`aria-label` on removal. *Fix: key by stable identity (add an id).*
  - **[L]** PollModal.svelte:19 — svelte/typescript — `page.params.id as string` cast; `undefined as string` if rendered off-route. *Fix: guard/derive from typed param.*
  - **[L]** PollModal.svelte:173 — svelte/compiler-warnings (a11y_no_static_element_interactions) — titlebar `<div onpointerdown>` ignored; drag is mouse/touch-only (chrome handle). *Fix: none required.*

### `/home/user/pro-room/web/src/lib/components/PollPanel.svelte`
- **LOC:** 305 · **Purpose:** Renders a poll with per-option vote bars, vote/close actions, parsed (ticker/link) question and labels.
- **Doc sections pulled:** svelte/$state, svelte/$derived, svelte/$effect, svelte/$props, svelte/bind, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []`
- **Findings:**
  - **[L]** PollPanel.svelte:48,63 — svelte/$props ("Updating props") — `poll = updated` reassigns a non-bindable prop (permitted temporary override); the parent's authoritative copy syncs via `onChange?.(updated)`. If the parent re-renders with the old `poll`, the local reassignment is clobbered. No correctness bug (parent owns the copy). *Fix: optional — hold an overridable `$derived(poll)` for self-contained optimistic state.*
  - **[NIT]** PollPanel.svelte:16 — svelte/typescript — `page.params.id as string` cast; tolerated given the documented route guarantee. *Fix: none.*
  - **Note:** no `{@html}` (uses `parseMessage`); external links carry `rel="noopener noreferrer"`; controls are real `<button>`; `{#each ... (option.id)}` keyed.

### `/home/user/pro-room/web/src/lib/components/PresenceBar.svelte`
- **LOC:** 46 · **Purpose:** Compact presence indicator — user count and name chips.
- **Doc sections pulled:** svelte/$props, svelte/$state, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []`
- **Findings:** **None.** Read-only `users` prop, `{#each users (u.user_id)}` keyed, no effects, no interactive elements, no `{@html}`.

### `/home/user/pro-room/web/src/lib/components/PrivateChat.svelte`
- **LOC:** 289 · **Purpose:** Floating 1:1 private-chat panel — autoscroll-on-new-message, auto-growing composer, Enter-to-send.
- **Doc sections pulled:** svelte/$effect, svelte/$derived, svelte/bind, svelte/$props, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []` (suggestions: `tick` called in `$effect` ×3; two `bind:this` → attachment — the `$effect.pre` matches the documented autoscroll pattern, no state-sync)
- **Findings:**
  - **[L]** PrivateChat.svelte:27-34 — svelte/$effect (`$effect.pre`) — correct documented autoscroll (track `messages.length`, `tick().then(scroll)`); not state-sync. *Fix: none.*
  - **[NIT]** PrivateChat.svelte:98-105 — svelte/bind (bind:this) — `textareaEl`/`listEl` for imperative height/scroll — legitimate. *Fix: none.*
  - **Note:** bubbles render `{m.body}` as text (no XSS); `{#each (m.id)}` keyed; controls have `aria-label`; no manual listeners.

### `/home/user/pro-room/web/src/lib/components/ReactionBar.svelte`
- **LOC:** 225 · **Purpose:** Emoji reaction pills + an add-reaction popover picker, dismissable on Escape/outside-click.
- **Doc sections pulled:** svelte/$state, svelte/$props, svelte/compiler-warnings, svelte/bind
- **svelte-autofixer:** `issues: []`
- **Findings:** **None.** Outside-click/Escape listeners live in an `{@attach dismissable}` whose teardown (lines 71-74) removes both — no leak. `{#each (r.emoji)}`/`{#each (emoji)}` keyed; `role="menu"`/`menuitem`/`aria-haspopup`/`aria-expanded`/`aria-label` present; real `<button>`s; no `{@html}`.

### `/home/user/pro-room/web/src/lib/components/RecPreview.svelte`
- **LOC:** 395 · **Purpose:** Client-side screen recorder (getDisplayMedia → MediaRecorder) with live preview, timer, download/save-to-room.
- **Doc sections pulled:** svelte/$effect, svelte/$state, svelte/bind, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []` (suggestions: `videoEl` "assigned inside an $effect" [false positive — effect writes `videoEl.srcObject`, not the ref]; `bind:this` → attachment)
- **Findings:**
  - **[M]** RecPreview.svelte:34-36 — svelte/$effect ("Understanding dependencies") — effect `videoEl.srcObject = recording ? stream : null` reads `stream`, but `stream` is a plain `let` (line 29), NOT `$state` → untracked. Only re-runs on `videoEl`/`recording`. Works incidentally because `recording` flips after `stream` is set in `start()`. *Fix: make `stream` `$state`, or set `srcObject` imperatively in `start()`.*
  - **[L]** RecPreview.svelte:29-32,38-47 — svelte/$effect (teardown) — `stream`/`recorder`/`timer` torn down via `stopTracks()` (from `stop()`/`close()`/error), not on unmount; if destroyed mid-recording without `close()`, MediaStream tracks + `setInterval` leak. *Fix: add `$effect(() => () => stopTracks())` or `onDestroy(stopTracks)`.*
  - **[M]** RecPreview.svelte:173 — svelte/compiler-warnings (a11y_media_has_caption) — `<video>` has no captions track; exempt because `muted`. Awareness only. *Fix: none while `muted`.*
  - **Note:** `URL.createObjectURL`/`revokeObjectURL` balanced (lines 92-99); controls have `aria-label`/`title`.

### `/home/user/pro-room/web/src/lib/components/RoomSidebar.svelte`
- **LOC:** 705 · **Purpose:** Room nav rail — capability-gated modal launchers (settings/logs/admin/branding) + present-users roster.
- **Doc sections pulled:** svelte/$state, svelte/$derived, svelte/$props, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []`
- **Findings:**
  - **[L]** RoomSidebar.svelte:78 — svelte/compiler-warnings (a11y_hidden / general a11y) — `aria-hidden={!open}` hides the collapsed rail from AT, but contained `<button>`s stay in the tab order (only CSS width:0/overflow:hidden collapses) → keyboard users tab into hidden controls. *Fix: `inert={!open}` on the `<aside>`, or only render contents when `open`.*
  - **[NIT]** RoomSidebar.svelte:68-71 — svelte/$derived — `canManageBranding`/`canManageUsers` correctly `$derived(auth.can(...))`. *Fix: none.*
  - **Note:** roster `{#each present (u.user_id)}` keyed with `{:else}`; menu items are real `<button>` with `aria-label`/`title`; no `{@html}`/listeners/timers.

### `/home/user/pro-room/web/src/lib/components/RoomTopNav.svelte`
- **LOC:** 639 · **Purpose:** Fixed room top nav — brand, talking/REC indicators, presenter-action snippet slot, volume/sound-options dropdown.
- **Doc sections pulled:** svelte/$state, svelte/$props, svelte/bind, svelte/basic-markup, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []`
- **Findings:**
  - **[NIT]** RoomTopNav.svelte:107 — svelte/basic-markup (a11y) — `<img alt={brand.name}>`; if `brand.name` is empty the logo is unlabeled. *Fix: `alt={brand.name || 'Logo'}`.*
  - **[NIT]** RoomTopNav.svelte:59-61 — svelte/$state — `volume`/`muted` are write-only mirrors pushed to callbacks with no inbound prop; intentional one-way contract. *Fix: none.*
  - **Note:** `actions` rendered via `{@render actions()}` (no legacy slots); `Props` interface, no `any`; dnd/pref via `setDnd`/`setPref`.

### `/home/user/pro-room/web/src/lib/components/ScreenStage.svelte`
- **LOC:** 460 · **Purpose:** Screen-share stage — per-publisher tab strip + a single pan/zoom/snapshot/fullscreen video surface bound to a LiveKit track.
- **Doc sections pulled:** svelte/$effect, svelte/$derived, svelte/$state, svelte/bind, svelte/key, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []` (suggestions: `zoom`/`panX`/`panY` assigned inside `$effect`; `bind:this` → attachment ×2)
- **Findings:**
  - **[M]** ScreenStage.svelte:68-73 — svelte/$effect ("When not to use $effect") — effect resets `zoom/panX/panY` on `active?.identity` change; the discouraged write-state-in-effect pattern AND redundant — the surface is already wrapped in `{#key active.identity}` (line 190) which recreates the subtree. *Fix: drop the effect; let `{#key}` re-create fresh state (move zoom/pan state inside the keyed block).*
  - **[L]** ScreenStage.svelte:50 — svelte/bind (bind:this) — `videoEl` bound only for `snapshot()`; read in handler, correct. *Fix: optional — capture via the existing `track()` attachment.*
  - **[NIT]** ScreenStage.svelte:215 — svelte/compiler-warnings (a11y_media_has_caption) — `<video>` exempt via `muted`. *Fix: none while `muted`.*
  - **Note:** `active` is `$derived`; the `{@attach}` dblclick and `track()` both return teardown (no leak); pan uses non-reactive refs correctly; `a11y_no_static_element_interactions` ignored with justification.

### `/home/user/pro-room/web/src/lib/components/Split.svelte`
- **LOC:** 213 · **Purpose:** Two-pane resizable splitter — keyboard/pointer-operable `role="separator"` gutter + optional edge-collapse.
- **Doc sections pulled:** svelte/$effect, svelte/$derived, svelte/$state, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []` (suggestions: `split`/`dragging` assigned inside `$effect`; `positionToPercent` in `$effect`; `bind:this` → attachment)
- **Findings:**
  - **[L]** Split.svelte:40 — svelte/$state — `let split = $state(untrack(() => clamp(initial)))`; `untrack` is a no-op (state initializers aren't reactive contexts). Harmless. *Fix: `let split = $state(clamp(initial));`.*
  - **[NIT]** Split.svelte:42 — svelte/bind (bind:this) — `container` for `getBoundingClientRect()`; read in handler, correct. *Fix: optional.*
  - **Note:** drag effect teardown removes all three `document` listeners (no leak), attached only while `dragging` — idiomatic; `clampMin`/`isHorizontal` are `$derived`; `separator` role + `aria-valuemin/max/now` + `tabindex="0"` + keyboard handler is the correct splitter pattern; two a11y warnings ignored with justification.

### `/home/user/pro-room/web/src/lib/components/ToastContainer.svelte`
- **LOC:** 68 · **Purpose:** Fixed top-right toast stack from the `toasts` `$state` store; click-to-dismiss with fade in/out.
- **Doc sections pulled:** svelte/transition, svelte/in-and-out, svelte/each, svelte/@html, svelte/$state, svelte/compiler-warnings
- **svelte-autofixer:** `issues: []`
- **Findings:**
  - **[L]** ToastContainer.svelte:9 — svelte/compiler-warnings (a11y) — `role="status"` already implies `aria-live="polite"`, so the explicit `aria-live` is redundant; container is `pointer-events: none` with real `<button>` toasts (good). *Fix: optional — drop redundant `aria-live`.*
  - **Note:** `{#each toasts as t (t.id)}` keyed by stable id so `out:fade` animates the correct leaving node; body is `{t.body}` escaped text (explicitly NOT `{@html}`); auto-dismiss `setTimeout` lives in the store, so no cleanup obligation here.

### `/home/user/pro-room/web/src/lib/components/WebcamHolder.svelte`
- **LOC:** 272 · **Purpose:** Draggable webcam tile strip — each tile attaches a presenter's `MediaStreamTrack` to a `<video>` via `srcObject`, with per-id drag offsets and a local-only close button.
- **Doc sections pulled:** svelte/$state, svelte/$props, svelte/bind, svelte/each, svelte/compiler-warnings, svelte/@html (confirmed unused)
- **svelte-autofixer:** `issues: []`
- **Findings:**
  - **[M]** WebcamHolder.svelte:64-79 — svelte/$effect / attachments — `attachTrack` builds `new MediaStream([track])`, sets `video.srcObject`, teardown nulls `srcObject` and re-runs on `track` change; correctly does NOT `.stop()` tracks (publisher owns them). Allocates a new wrapper per run but teardown prevents leak. *Fix: none required.*
  - **[NIT]** WebcamHolder.svelte:106 — svelte/compiler-warnings (a11y_media_has_caption) — `<video>` exempt via `muted`. *Fix: none while `muted`.*
  - **[NIT]** WebcamHolder.svelte:45-46 — svelte/$state — `onPointerMove` early-returns on `dragId === null`; `dragId` read in handler (not tracking context) — correct; `offsets` reassigned immutably. *Fix: none.*
  - **Note:** `{#each publishers as publisher (publisher.id)}` keyed; drag refs are non-reactive locals read only in handlers; `onClose?.(publisher.id)` avoids mutating the non-bindable prop; close `<button>` has `aria-label`/`title`.

---

## Summary table

| File | Autofixer issues | C | H | M | L | NIT | Top finding |
|------|-----------------|---|---|---|---|-----|-------------|
| AlertFeed.svelte | [] | 0 | 0 | 1 | 2 | 1 | autoscroll `$effect.pre` correct; decorative `alt=""` on user image (L) |
| AlertQaModal.svelte | [] | 0 | 1 | 1 | 1 | 1 | backdrop click-close, no key handler on element (window-Escape mitigates) (H) |
| AlertsChatDock.svelte | [] | 0 | 1 | 2 | 1 | 0 | drag `pointermove`/`pointerup` window listeners leak on mid-drag unmount (H) |
| Badges.svelte | [] | 0 | 0 | 0 | 0 | 0 | clean |
| CaptionsOverlay.svelte | [] | 0 | 0 | 1 | 3 | 0 | `prefers-reduced-motion` CSS can't disable Svelte JS `transition:fade` (L) |
| ChatPanel.svelte | [] | 0 | 1 | 1 | 2 | 1 | `.username` `cursor:pointer` with no handler/role — misleading affordance (H) |
| ConnectionOverlay.svelte | [] | 0 | 0 | 1 | 1 | 1 | module-level `let prev` edge-detector shared across instances (M) |
| DialogHost.svelte | [] | 0 | 0 | 1 | 2 | 0 | state seeded from `{@attach}`, relies on `{#key}` remount (M) |
| FilesPanel.svelte | [] | 0 | 0 | 1 | 2 | 1 | manual file read instead of `bind:files` (M); incomplete tab ARIA (NIT) |
| Icon.svelte | [] | 0 | 0 | 0 | 1 | 1 | open `name: string` glyph type, no compile guard (L) |
| MainStage.svelte | [] | 0 | 0 | 0 | 1 | 2 | exemplary `$derived` lock; incomplete tab ARIA (NIT) |
| MediaPlayer.svelte | [] | 0 | 0 | 1 | 3 | 1 | reimplements built-in `<audio/video>` volume binding via `bind:this`+`$effect` (M) |
| MembersPanel.svelte | [] | 0 | 0 | 1 | 1 | 1 | `onMount` async fetch, no abort on unmount (M) |
| MessageBody.svelte | [] | 0 | 0 | 1 | 1 | 1 | index-keyed `{#each}` over re-parsed text can mismatch node types (M) |
| Modal.svelte | [] | 0 | 1 | 1 | 1 | 0 | `aria-modal` with no focus trap — Tab escapes to background (H) |
| Nav.svelte | [] | 0 | 0 | 0 | 0 | 0 | clean |
| NotesPanel.svelte | [] | 0 | 0 | 1 | 2 | 1 | `{@html sanitize()}` uses DOMPurify defaults — pin allow-list (M) |
| PollModal.svelte | [] | 0 | 1 | 2 | 2 | 0 | drag `window` listeners leak if panel closes mid-drag (H) |
| PollPanel.svelte | [] | 0 | 0 | 0 | 1 | 1 | non-bindable prop reassign, parent owns copy — safe (L) |
| PresenceBar.svelte | [] | 0 | 0 | 0 | 0 | 0 | clean |
| PrivateChat.svelte | [] | 0 | 0 | 0 | 1 | 1 | documented `$effect.pre` autoscroll — correct (L) |
| ReactionBar.svelte | [] | 0 | 0 | 0 | 0 | 0 | clean (attachment teardown removes listeners) |
| RecPreview.svelte | [] | 0 | 0 | 2 | 1 | 0 | non-reactive `stream` in `$effect`; no unmount cleanup for stream/interval (M) |
| RoomSidebar.svelte | [] | 0 | 0 | 0 | 1 | 1 | `aria-hidden` collapsed rail keeps buttons tabbable — use `inert` (L) |
| RoomTopNav.svelte | [] | 0 | 0 | 0 | 0 | 2 | logo `alt` empty if `brand.name` empty (NIT) |
| ScreenStage.svelte | [] | 0 | 0 | 1 | 1 | 1 | state-writing `$effect` redundant with surrounding `{#key}` (M) |
| Split.svelte | [] | 0 | 0 | 0 | 1 | 1 | needless `untrack` in `$state` initializer — no-op (L) |
| ToastContainer.svelte | [] | 0 | 0 | 0 | 1 | 0 | redundant `aria-live` alongside `role="status"` (L) |
| WebcamHolder.svelte | [] | 0 | 0 | 1 | 0 | 2 | per-run `new MediaStream` wrapper; teardown nulls `srcObject` — sound (M) |
| **TOTALS** | **0 / 29 non-empty** | **0** | **6** | **21** | **35** | **22** | — |

### Totals by severity
- **C (correctness/security):** 0
- **H (likely bug / a11y barrier / leak):** 6 — AlertQaModal (backdrop), AlertsChatDock (drag-listener leak), ChatPanel (misleading `.username` affordance), Modal (no focus trap), PollModal (drag-listener leak). *(AlertQaModal's is mitigated by a window-Escape handler.)*
- **M:** 21 · **L:** 35 · **NIT:** 22
- **Files where `svelte-autofixer` returned non-empty `issues[]`: 0 of 29.** (Every run returned `issues: []`; all other autofixer output was advisory suggestions, several false positives.)

### Highest-priority remediations
1. **Listener leaks (H):** `AlertsChatDock.svelte:97-113` and `PollModal.svelte:150-160` add `window` pointer listeners removed only on `pointerup` → leak if the component unmounts mid-drag. Per `svelte/$effect` teardown semantics, register the drag listeners inside an `$effect` (keyed on `dragging`) whose teardown removes them, or use `setPointerCapture`.
2. **`Modal.svelte` (H):** `aria-modal="true"` with no focus trap or scroll lock — Tab escapes to background. Use native `<dialog>`+`showModal()` or trap Tab in `panel`.
3. **`ChatPanel.svelte` (H):** `.username` has `cursor: pointer` but no `onclick`/role (a11y_no_static_element_interactions) — make it a real `<button>` or drop the affordance.
4. **`NotesPanel.svelte` (M, only `{@html}` in the area):** pin an explicit DOMPurify allow-list config rather than relying on defaults.
5. **`$effect`-vs-`$derived` smells (M):** `ScreenStage` (state reset redundant with `{#key}`), `PollModal` (multi-var form reset in effect), `ConnectionOverlay` (module-level `let prev`). Replace with `{#key}` remounts / call-site triggers / component-local untracked vars.
6. **Index-keyed `{#each}` over mutable lists (M):** `MessageBody:30` (re-parsed text) and `PollModal:264,309` (removable choices/canned) — key by stable identity.
