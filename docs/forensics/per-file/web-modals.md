# Per-File Forensic Audit — AREA: web-modals

**Repo:** `/home/user/pro-room` · **Path:** `web/src/lib/components/modals/`
**Date:** 2026-06-21 · **Mode:** READ-ONLY, doc-grounded (no source modified)
**Target Svelte version:** 5 (project: `svelte ^5.56.1`, `@sveltejs/kit ^2.66`)
**Project flags:** TypeScript `strict: true` (`web/tsconfig.json`); **no** `experimental.async` enabled ⇒ all autofixer runs used `async: false`.
**Tooling:** every file Read fully; `mcp__svelte__svelte-autofixer` run per file (`desired_svelte_version: 5`, `filename` passed); all rule citations pulled live via `mcp__svelte__get-documentation` / `list-sections`.

> Files in directory: **26** (the 25 named modals + `MultiSelectDropdown.svelte`). All audited; none skipped.

## Documentation sections pulled (cited throughout, verbatim doc text used)

`svelte/$state` · `svelte/$derived` · `svelte/$effect` · `svelte/$props` · `svelte/$bindable` · `svelte/snippet` · `svelte/@render` · `svelte/@html` · `svelte/bind` · `svelte/each` · `svelte/scoped-styles` · `svelte/lifecycle-hooks` · `svelte/context` · `svelte/compiler-warnings` · `svelte/typescript`

Key rules invoked:
- `svelte/$effect#When-not-to-use-$effect` — "avoid using it to synchronise state … use `$derived`".
- `svelte/$effect` — "An effect can return a _teardown function_ which will run … when the component is destroyed" (validates cleanup-only effects).
- `svelte/$props#Updating-props` / `svelte/$bindable` — "don't mutate props … use the `$bindable` rune".
- `svelte/@html` — "Make sure that you either escape the passed string or only populate it with values that are under your control … Never render unsanitized content."
- `svelte/compiler-warnings#a11y_label_has_associated_control` — "A form label must be associated with a control" (valid via wrapping **or** `for`+`id`).
- `svelte/compiler-warnings#a11y_no_static_element_interactions`, `#a11y_click_events_have_key_events`, `#a11y_media_has_caption`, `#a11y_missing_attribute`, `#a11y_autocomplete_valid`.
- `svelte/each` — keyed-each "_key_ … must uniquely identify each list item".
- `svelte/$state#Passing-state-across-modules` — export class instances / don't reassign exported state.
- `svelte/typescript#Typing-$props` — annotate `$props`.

---

## Shared dependency: `../Modal.svelte` (out of AREA, audited once)

`web/src/lib/components/Modal.svelte` is the shell every modal renders into. Behaviours relevant to the whole set, reported **once** here (not repeated per file):

- **Focus restore — CORRECT.** `$effect(() => { if (open) { previouslyFocused = document.activeElement; queueMicrotask(() => panel?.focus()); return () => previouslyFocused?.focus?.(); } })`. The teardown restores focus on close/destroy — exactly the pattern endorsed by `svelte/$effect` ("a teardown function … runs … when the component is destroyed"). INFO.
- **No true focus *trap*.** Initial focus is moved into `panel` and restored on close, but Tab is not constrained inside the dialog (`role="dialog" aria-modal="true"`). `aria-modal` is advisory only; keyboard focus can still leave the dialog. MEDIUM (WAI-ARIA dialog pattern) — lives in `Modal.svelte`, inherited by all 26 modals.
- **Backdrop click-to-close** uses `onclick` on a `<div>` with an explicit `<!-- svelte-ignore a11y_no_static_element_interactions -->` and an `onkeydown` that handles only `Escape`. Dismiss-by-keyboard is covered (Esc); backdrop is not itself a tab stop. Acceptable; INFO.
- Uses `$props.id()` for `titleId` and wires `aria-labelledby`/`aria-label` correctly (`svelte/$props#$props.id()`). Good.

---

## Shared store: `$lib/stores/social.svelte.ts` (consumed by Muted/FollowedUsersModal)

Exports class **instances** (`muted`, `followed`) whose `users = $state<SocialUser[]>([])` field is mutated via methods, never reassigned across the module boundary — the pattern mandated by `svelte/$state#Passing-state-across-modules` ("export a class instance … don't reassign"). Reads like `muted.users` in the modals are correctly reactive. No finding.

---

# Per-file blocks (12 audited directly; remaining 14 below from parallel passes)

### MobileAppInfoModal.svelte
- **LOC:** 92 · **purpose:** Static "Download our mobile apps" modal with two non-linked store badges.
- **Docs:** `svelte/$props`, `svelte/snippet`, `svelte/scoped-styles`, `svelte/compiler-warnings`.
- **autofixer:** `issues: []`.
- **form-field a11y:** no form fields.
- **findings:** none. Typed `Props`, snippet `footer`, `:global(svg)` correctly used for the icon child (`svelte/scoped-styles`). `aria-disabled` on non-interactive `<span>` badges is benign.

### MutedUsersModal.svelte
- **LOC:** 115 · **purpose:** Lists muted users from the `muted` store with per-row Unmute.
- **Docs:** `svelte/$props`, `svelte/each`, `svelte/$state` (cross-module), `svelte/compiler-warnings`.
- **autofixer:** `issues: []`.
- **form-field a11y:** no form fields (buttons only).
- **findings:** none. Keyed each `(u.id)` is unique (`svelte/each`). `avatar` span `aria-hidden` correct. Store reactivity sound.

### FollowedUsersModal.svelte
- **LOC:** 117 · **purpose:** Lists followed users with per-row Unfollow (twin of MutedUsersModal).
- **Docs:** same as MutedUsersModal.
- **autofixer:** `issues: []`.
- **form-field a11y:** no form fields.
- **findings:** none.

### ReplyModal.svelte
- **LOC:** 129 · **purpose:** Private-reply composer; Enter sends, Shift+Enter newlines; no Send button.
- **Docs:** `svelte/$state`, `svelte/$derived`, `svelte/bind`, `svelte/compiler-warnings`.
- **autofixer:** `issues: []`.
- **form-field a11y:** **1** input (`<textarea>`). Label association: 0 via `<label>` — uses `aria-label="Reply text"` instead (satisfies the accessible-name requirement; `a11y_label_has_associated_control` is not triggered since there is no orphan `<label>`). `id`: 0. `name`: 0.
- **findings:**
  - LOW · ReplyModal.svelte:45-51 · `svelte/compiler-warnings#a11y_label_has_associated_control` (advisory) · textarea is labelled only by `aria-label`; fine for a11y. No `name`/`id` — not in a `<form>`, value handled via `bind:value`, so no functional gap. Add `id`+visible `<label>` only if a form wrapper is later introduced.
  - INFO · `bind:value={text}` two-way binding correct (`svelte/bind#<input-bind:value>`). `title = $derived(...)` correct use of `$derived` (`svelte/$derived`).

### DebugLogModal.svelte
- **LOC:** 137 · **purpose:** Read-only debug-log viewer with copy-to-clipboard + "Copied" flash.
- **Docs:** `svelte/$derived`, `svelte/$effect`, `svelte/compiler-warnings#a11y_label_has_associated_control`.
- **autofixer:** `issues: []`. Suggestion (suppressed/INFO): *"You are calling the function `clearTimeout` inside an $effect…"* — false positive; the effect is **cleanup-only** (`$effect(() => () => clearTimeout(copyTimer))`), the exact teardown pattern endorsed by `svelte/$effect`.
- **form-field a11y:** **1** field (`<textarea readonly>`): label association ✓ (`<label class="sr-only" for="debug-log-text">` + `id="debug-log-text"`) **and** `aria-label`. `id` ✓. `name`: 0 (read-only viewer, never submitted — acceptable).
- **findings:** none. Exemplary: `text`/`hasLog` via `$derived` (`svelte/$derived`), proper `for`/`id` label pairing (`a11y_label_has_associated_control`), `:global(.panel:has(.debug-log-body))` scoped-style escape hatch (`svelte/scoped-styles`).

### AlertLogsModal.svelte
- **LOC:** 152 · **purpose:** Fetches `/api/rooms/:id/alerts` on open; reload button; lists alerts.
- **Docs:** `svelte/$effect`, `svelte/$state`, `svelte/each`.
- **autofixer:** `issues: []`. Suggestion (suppressed/INFO): *"calling the function `reload` inside an $effect…"* — false positive; `$effect(() => { if (open) void reload(); })` performs a **network request**, an explicitly endorsed `$effect` use ("making network requests").
- **form-field a11y:** no form fields (buttons only).
- **findings:**
  - INFO · AlertLogsModal.svelte:31-33 · `svelte/$effect#Understanding-dependencies` · `reload()` reads `roomId` indirectly, so it is tracked; reopening or `roomId` change re-fetches. Correct. Keyed each `(log.id)` unique.

### MultiSelectDropdown.svelte
- **LOC:** 163 · **purpose:** Reusable multi-select listbox; `selected` is `$bindable`; outside-click closes (capture-phase).
- **Docs:** `svelte/$bindable`, `svelte/$derived`, `svelte/bind`, `svelte/each`, `svelte/compiler-warnings`.
- **autofixer:** `issues: []`. Suggestion (suppressed/INFO): *"`bind:this` … could be an attachment"* — generic, non-blocking.
- **form-field a11y:** no native form fields; uses ARIA listbox pattern. Toggle `<button>` has `aria-haspopup="listbox"`, `aria-expanded`, optional `{id}` (so a parent `<label for>` can target it); options have `role="option"`+`aria-selected`; `<ul role="listbox" aria-multiselectable="true">`. Correct.
- **findings:** none. `selected = $bindable([])` then reassigned immutably on `toggle` — correct bindable usage (`svelte/$bindable`). `summary` via `$derived`. Keyed each `(o.value)`.

### ScheduledAlertsModal.svelte
- **LOC:** 164 · **purpose:** Manage-only striped table of scheduled alerts with per-row delete.
- **Docs:** `svelte/$props`, `svelte/each`, `svelte/compiler-warnings`.
- **autofixer:** `issues: []`.
- **form-field a11y:** no form fields. Table uses `<th scope="col">` correctly (`a11y_misplaced_scope` not triggered). Delete buttons have `aria-label`+`title`.
- **findings:** none. Keyed each `(alert.id)` with `{:else}` empty row. `formatSendAt` is a pure helper (not reactive) — fine.

### ChatLogsModal.svelte
- **LOC:** 166 · **purpose:** Fetches room messages by channel on open/channel-change; reload; lists.
- **Docs:** `svelte/$effect#Understanding-dependencies`, `svelte/bind`, `svelte/each`.
- **autofixer:** `issues: []`. Suggestion (suppressed/INFO): *"calling `reload` inside an $effect…"* — false positive (network request).
- **form-field a11y:** **1** field (`<select>`): label association via `aria-label="Channel"` (no orphan `<label>`, so `a11y_label_has_associated_control` not triggered). `id`: 0. `name`: 0 (not submitted; `bind:value`).
- **findings:**
  - INFO · ChatLogsModal.svelte:32-37 · `svelte/$effect#Understanding-dependencies` · bare `channel;` read inside the effect forces it as a dependency so re-fetch fires on channel change — the documented way to register a dependency. Correct.
  - LOW · ChatLogsModal.svelte:46 · `svelte/compiler-warnings#a11y_label_has_associated_control` (advisory) · `<select>` relies on `aria-label`; add visible `<label for>` if surfaced in a form. `bind:value` coercion N/A (string values).

### RichTextEditorModal.svelte
- **LOC:** 305 · **purpose:** contenteditable rich-text editor (execCommand) with inline link composer; seeds/sanitizes initial HTML.
- **Docs:** `svelte/@html` (XSS), `svelte/$state`, `svelte/bind`, `svelte/compiler-warnings`, `svelte/snippet`.
- **autofixer:** `issues: []`.
- **form-field a11y:** **1** field (`<input type="url">` in link composer): label association ✓ (`<label for="rte-link-url">` + `id="rte-link-url"`). `id` ✓. `name`: 0 (transient composer, never submitted). The contenteditable `<div role="textbox" aria-multiline aria-label="Message body">` is correctly named; toolbar `role="toolbar"` `aria-controls="rte-editor"` references the editor `id`. Strong a11y.
- **findings:**
  - **POSITIVE / not a defect:** does **not** use `{@html}`. Seed HTML is injected via `node.innerHTML = DOMPurify.sanitize(html)` inside an attachment — satisfies `svelte/@html`'s "Never render unsanitized content" mandate at the only injection sink. Input sanitization is present and correct.
  - **MEDIUM** · RichTextEditorModal.svelte:110-113 · `svelte/@html` (defense-in-depth) · `send()` emits `editor?.innerHTML` to `onSave` **without** sanitizing on the way out. The value originates from a user-controlled contenteditable; if any consumer later renders it via `{@html}` (or assigns `innerHTML`) without its own sanitization, that is an XSS sink. Fix: also `DOMPurify.sanitize(editor.innerHTML)` before `onSave?.(...)`, or document that callers MUST sanitize. (No sink exists *in this file*, hence MEDIUM not CRITICAL.)
  - INFO · execCommand is deprecated (acknowledged in code comments) — not a Svelte-doc rule, no finding.

### AlertFilterModal.svelte
- **LOC:** 167 · **purpose:** Allow-list/block-list trader filter; live-applying checkbox + toggle buttons; bulk select.
- **Docs:** `svelte/$derived`, `svelte/compiler-warnings#a11y_label_has_associated_control`, `svelte/each`, `svelte/bind`.
- **autofixer:** `issues: []`.
- **form-field a11y:** **1** field (`<input type="checkbox">`): label association ✓ via **wrapping** `<label class="check">…</label>` (valid per `a11y_label_has_associated_control` "Wrapping a control in a label tag"). `id`: 0 (not needed for wrapped control). `name`: 0 (not submitted; `onchange` handler). Trader rows are `<button aria-pressed>` (toggle), correct.
- **findings:** none. `title` via `$derived`. Checkbox uses `checked={...}` + `onchange` (controlled, not `bind:` — valid). Keyed each `(t.id)`, `{@const selected}` per row.

### AlertSendReportModal.svelte
- **LOC:** 196 · **purpose:** Display-only delivery-stats grid (placeholder data) with loading state.
- **Docs:** `svelte/$derived`, `svelte/$props`, `svelte/each`, `svelte/snippet`.
- **autofixer:** `issues: []`.
- **form-field a11y:** no form fields.
- **findings:** none. `title`/`formatted` via `$derived` (numbers formatted with `Intl.NumberFormat`). Keyed each `(metric.key)`. Passing `class="fa-spin"` to `<Icon>` is a normal prop. Card icons `aria-hidden`.

---

### AVSettingsModal.svelte
- **LOC:** 391 · **purpose:** Tabbed (User/Presenter) A/V settings — device pickers from `enumerateDevices()` + speaker test tone.
- **Docs:** `svelte/$effect`, `svelte/bind`, `svelte/compiler-warnings#a11y_label_has_associated_control`.
- **autofixer:** `issues: []`. ~11 generic suppressed suggestions ("calling fn / assigning state inside $effect") — the `$effect` populates `speakers/mics/cameras` from the async, permission-gated `enumerateDevices()` promise: a genuine browser side effect, **not** derivable. Correct per `svelte/$effect` ("making network requests").
- **form-field a11y:** **3** selects (`av-speaker`/`av-mic`/`av-camera`): label association ✓ (`<label for=ID>` + matching `id` on all 3) ⇒ 0 without label. `name`: **3 without** (acceptable — no native `<form>` submit, values flow via `bind:value`/`onSave`).
- **findings:**
  - LOW · AVSettingsModal.svelte:176,202,217 · `svelte/compiler-warnings#a11y_missing_attribute` (advisory) · selects lack `name`; harmless without a `<form>`. Add `name` only if autofill/form semantics wanted.
  - INFO · `disableVideo` toggle is `<button aria-pressed>` (not `<input>`) — correctly avoids label-association requirement. No own focus logic (delegates to `Modal.svelte`).

### AddUserModal.svelte
- **LOC:** 346 · **purpose:** User admin — list/delete users + add-user form (email/name/password/role) → `/api/users`.
- **Docs:** `svelte/$derived`, `svelte/compiler-warnings#a11y_label_has_associated_control`, `svelte/compiler-warnings#a11y_autocomplete_valid`, `svelte/each`.
- **autofixer:** `issues: []` (no suggestions).
- **form-field a11y:** **4** fields (email/display-name/password/role-select): label association ✓ via **wrapping** `<label class="field">` on all 4 ⇒ 0 without label. `id`: **4 without** (not needed for wrapped controls). `name`: **4 without** (`bind:value`, no native submit).
- **findings:**
  - INFO · AddUserModal.svelte:155-161 · `svelte/compiler-warnings#a11y_autocomplete_valid` · temp-password input is `type="text"` + `autocomplete="off"` — by-design (admin sets another user's visible temp password). Not a Svelte-rule violation.
  - INFO · AddUserModal.svelte:35 · `svelte/$derived` · `myEmail = $derived(auth.user?.email ?? '')` — correct `$derived`; self-detection is email-equality based (no id exposed). Logic note, not a Svelte-doc violation. Keyed each present.

### AdvancedSearchModal.svelte
- **LOC:** 270 · **purpose:** Alerts advanced-search form (term + datetime range + checkboxes + trader/room multi-selects) → emits `SearchCriteria`.
- **Docs:** `svelte/$props#$props.id()`, `svelte/bind`, `svelte/$bindable`, `svelte/compiler-warnings#a11y_label_has_associated_control`.
- **autofixer:** `issues: []` (no suggestions). Modern: `$props.id()` → `formId`; submit button in `{#snippet footer()}` (outside `<form>`) wired via `form={formId}` — correct cross-DOM form association.
- **form-field a11y:** ~5 controls: search `<input>` (`id`+`name`+`aria-label`, OK), 2 checkboxes (each **wrapped** in `<label class="check">`, OK), 2 datetime inputs (each **wrapped** in `<label class="date">`, OK) ⇒ 0 without label. Checkboxes/dates have no `name` (bound via `bind:`).
- **findings:** none beyond notes. Child `MultiSelectDropdown`s receive `id` props; their internal a11y is the child's concern (audited there). Clean.

### AllUserPmModal.svelte
- **LOC:** 252 · **purpose:** Admin per-user PM viewer — pick a present user, fetch+list their private messages via `/api/rooms/{roomId}/admin/pm/{peerId}`.
- **Docs:** `svelte/$effect#Understanding-dependencies`, `svelte/each`, `svelte/@html`.
- **autofixer:** `issues: []`. 1 generic suppressed suggestion ("calling `reload` inside an $effect") — false positive; effect re-fetches on `open`/`peerId` change (data fetch, not derivable).
- **form-field a11y:** **1** select (`pm-peer`): label association ✓ (`<label for="pm-peer">` + `id`) ⇒ 0 without label, 1 without `name` (`bind:value`).
- **findings:**
  - INFO · AllUserPmModal.svelte:42-47 · `svelte/$effect#Understanding-dependencies` · bare `peerId;` registers the dependency (documented idiom); `reload()` legitimately can't be `$derived` (async side effect).
  - INFO · `{m.body}` rendered as escaped text (no `{@html}`) — no XSS surface. Clean.

### BadgesModal.svelte
- **LOC:** 337 · **purpose:** Badge admin — create badges (live `$derived` preview), list/delete registry, assign badge to a present user.
- **Docs:** `svelte/$derived`, `svelte/each`, `svelte/compiler-warnings#a11y_label_has_associated_control`.
- **autofixer:** `issues: []` (no suggestions). `previewBadge = $derived(...)` — textbook effect-vs-derived (pure computed object, NOT an `$effect`).
- **form-field a11y:** **6** controls: 4 create-grid fields (slug/label/bg-color/text-color) each **wrapped** in `<label>` (OK) + 2 assign `<select>`s using `aria-label="Badge"`/`aria-label="User"` (OK via aria-label) ⇒ 0 without label assoc. All 6 without `name`; create inputs have no `id` (wrapping label).
- **findings:**
  - INFO · BadgesModal.svelte:179,183 · `svelte/compiler-warnings#a11y_label_has_associated_control` · assign selects use `aria-label` (valid) while the create grid uses visible `<label>` — stylistic inconsistency only, not a warning trigger. Keyed each (`b.id`, `p.user_id`). Clean.

### BrandingModal.svelte
- **LOC:** 238 · **purpose:** Branding admin — upload/reset logo (multipart `fetch`) + edit app name (`PATCH /api/branding`).
- **Docs:** `svelte/$state`, `svelte/bind`, `svelte/compiler-warnings#a11y_missing_attribute`.
- **autofixer:** `issues: []` (no suggestions). No `$effect`; `name = $state(brand.name)` seeds once from the store (user-editable, so not a derived — correct).
- **form-field a11y:** **2** controls: hidden file `<input>` **wrapped** in `<label class="btn">` (OK) + name `<input aria-label="App name">` (OK) ⇒ 0 without label assoc, 2 without `name`.
- **findings:**
  - **LOW** · BrandingModal.svelte:113 · `svelte/compiler-warnings#a11y_missing_attribute` · `<img src={brand.logo} alt={brand.name} />` — `alt` is bound to `brand.name` (`string | null`); a null name yields an empty/`"null"` alt. Fix: `alt={brand.name ?? 'Logo'}`.
  - INFO · upload `<label class="btn">` wraps the hidden file input and the input also has `disabled={uploading}` — the gate is real, not CSS-only. Good.

### ConnectivityCheckModal.svelte
- **LOC:** 262 · **purpose:** WebRTC connectivity probe (ICE gathering, STUN/optional TURN) reporting UDP/TCP/STUN/TURN pass/fail.
- **Docs:** `svelte/$effect` (cleanup), `svelte/$state`, `svelte/each`, `svelte/compiler-warnings`.
- **autofixer:** `issues: []` (no suggestions). `$effect` (:75-78) reads `open`, returns a teardown — canonical `$effect` cleanup pattern. `pc`/`timer` are plain `let` (imperative handles, not rendered) — correctly NOT `$state`.
- **form-field a11y:** **no form fields** (buttons only).
- **findings:**
  - INFO · ConnectivityCheckModal.svelte:180 · `svelte/compiler-warnings#a11y_missing_attribute` · status dot `<span role="img" aria-label={dotLabel(...)}>` correctly names the img-role element — confirmed compliant, no violation.
  - INFO · `$effect` teardown is idempotent (also called manually in `startTest()`); no leak. Clean.



---

## Batch-B blocks (7 modals — merged post-hoc; the parent agent came to rest before these were spliced in)

> These 7 were audited by a parallel pass (`svelte-autofixer` per file, docs pulled live) and are reconciled here so the report covers all 26. Cross-checked by direct re-read of 5/7 source files during merge.

### SettingsModal.svelte
- **LOC:** 804 · **purpose:** Three-tab (App/Alert/Chat) preferences panel binding theme tokens, layout, DND, and prefs stores.
- **Docs:** `svelte/$state`, `svelte/bind`, `svelte/each`, `svelte/$derived`, `svelte/compiler-warnings` (tablist/radiogroup).
- **autofixer:** `issues: []` (no suggestions) — notably NO state-in-effect suggestions: it reads stores live and writes via setters (`setPref`/`setDnd`/`theme.set`) on `onchange` rather than seeding local `$state`.
- **form-field a11y:** ~31 controls — theme radios (2) + layout radios (4) `name`-grouped inside `role="radiogroup"` and wrapped in `<label class="radio">`; ~20 checkboxes each wrapped in `<label class="check">` (valid association; no `name` needed, store-bound via `onchange`); 4 color inputs with `aria-label`; text-size `<label for="settings-text-size">`+`id`. **0 without label association.** Tabs fully wired `role="tab"`/`aria-selected`/`aria-controls`/`aria-labelledby` → `role="tabpanel"`. Exemplary.
- **findings:** none above INFO. Text-size uses `value={...}`+`oninput` with explicit `Number(...)` — correctly avoids the `bind:value` numeric-string coercion caveat (`svelte/bind`). All keyed `{#each}` (`colorControls`/`layoutOptions`/`tabs`) unique.

### PostAlertModal.svelte
- **LOC:** 474 · **purpose:** Three-tab alert composer (Text / Url / Image-GIF-Video) with file upload, X-share, and legal-disclosure options.
- **Docs:** `svelte/bind`, `svelte/$bindable`, `svelte/each`, `svelte/@html`, `svelte/compiler-warnings#a11y_no_static_element_interactions`/`#a11y_label_has_associated_control`.
- **autofixer:** `issues: []`, `suggestions: []`.
- **form-field a11y:** **12 controls** (3 textareas + 1 conditional disclosure textarea + 2 url inputs + 1 file input + 5 checkboxes). Every text/url/file control has **`id` AND `name` AND `aria-label`**; disclosure uses `<label for="alert-disclosure">`; the 5 checkboxes are each wrapped in `<label class="check">`. **0 without label association, 0 without `name` — best-in-set, fully labeled & named.**
- **findings:**
  - LOW · PostAlertModal.svelte:228-237 · `svelte/compiler-warnings#a11y_no_static_element_interactions` · drop-zone `<label class="upload">` carries `ondragover`/`ondrop` — benign (the label wraps a focusable `<input type="file">`, so keyboard path exists; drag is enhancement-only).
  - INFO · PostAlertModal.svelte:147 · tablist buttons are real `<button>` with `aria-selected` but panes aren't `role="tabpanel"`/`aria-controls`-linked (unlike SettingsModal). LOW polish, not a warning. No `{@html}`.

### EditProfileModal.svelte
- **LOC:** 264 · **purpose:** Edit display name + self-service password change; Gravatar avatar (`{#await}` with `:catch` fallback).
- **Docs:** `svelte/$effect` (IO reset), `svelte/$derived`, `svelte/bind`, `svelte/await`, `svelte/compiler-warnings#a11y_label_has_associated_control`.
- **autofixer:** `issues: []` (generic state-in-effect suggestions suppressed — the `open`-edge re-seed of independently-editable form fields is NOT `$derived`-able).
- **form-field a11y:** 4 inputs. Email + Display-name wrapped in `<label class="field">` (valid); the 2 password inputs sit under a non-label `<span class="flabel">` with only `autocomplete`+`placeholder`, no `id`/`name`. **Gap: 2 of 4 without programmatic label, 4 without `name`.**
- **findings:**
  - LOW · EditProfileModal.svelte:125-138 · `svelte/compiler-warnings#a11y_label_has_associated_control` · the two password inputs have no programmatic label — add `aria-label="Current password"` / `aria-label="New password"` (the Display-name input already does this) or wrap each in its own `<label>`.
  - INFO · :36-44 · `svelte/$effect` · re-seed on `open` is the documented IO/reset use (values are user-editable ⇒ not derivable); reads `open`+`auth.user`, writes non-feedback local state ⇒ no loop.

### MediaForAllModal.svelte
- **LOC:** 256 · **purpose:** Presenter pastes a SoundCloud/YouTube/MP3/video URL to broadcast; provider auto-detected from the **parsed host** (spoof-safe).
- **Docs:** `svelte/$derived`, `svelte/bind`, `svelte/compiler-warnings`.
- **autofixer:** `issues: []`, `suggestions: []` — clean.
- **form-field a11y:** 1 input (Media URL) wrapped in `<label class="field">` + `aria-invalid`/`aria-describedby`→`#media-error`. 0 without label association, 1 without `name` (not posted; acceptable).
- **findings:** none beyond notes. `bind:value` + `type="url"`+`inputmode="url"` appropriate; `detected` via `$derived` (no submit-time firing). Clean.

### PlayYouTubeModal.svelte
- **LOC:** 371 · **purpose:** Broadcast a YouTube video with optional start offset; persists a saved-video list to localStorage.
- **Docs:** `svelte/$effect` (IO load), `svelte/bind`, `svelte/each`, `svelte/compiler-warnings`.
- **autofixer:** `issues: []` (state-in-effect suggestions suppressed — the `open`-gated `loadVideos()` localStorage read is IO, and the list is locally mutated ⇒ not derivable).
- **form-field a11y:** 2 inputs — URL (`aria-label="YouTube URL"` + `aria-invalid`/`aria-describedby`) and Start (wrapped in `<label>` AND `aria-label`, doubly associated). Neither has `id`/`name`. 0 without label, 2 without `name`.
- **findings:**
  - LOW · PlayYouTubeModal.svelte:151 · `svelte/bind` · URL input is `type="text"`+`inputmode="url"`; `type="url"` (as MediaForAllModal uses) would add native validation. Cosmetic — string `bind:value` is correct as-is.
  - INFO · :148 `class:invalid={error}` on a truthy string (valid); :187 keyed each `(v.url + '#' + (v.start ?? ''))` matches the de-dupe key ⇒ unique.

### SessionControlModal.svelte
- **LOC:** 309 · **purpose:** Host/admin control panel (lock room, mute all, clear chat, kick duplicates, unlock) driven by a data-driven action list.
- **Docs:** `svelte/$state`, `svelte/$effect`, `svelte/each`, `svelte/compiler-warnings`.
- **autofixer:** `issues: []`, `suggestions: []` — clean.
- **form-field a11y:** no form fields (each `<button>` in the keyed `{#each actions (action.key)}` is natively accessible).
- **findings:**
  - INFO · SessionControlModal.svelte:161,168 · **FA7 dynamic-glyph check — PASSED (hard evidence)** · `actions[]` references `icon: 'broom'`/`'exchange-alt'` dynamically. Verified against the installed FA7-free `all.min.css`: FA7 retains the FA5 legacy aliases (`fa-exchange-alt`, `fa-broom`, `sign-out-alt`, `times`, `cog`/`cogs`, `sliders-h`, `volume-mute`, …) via its `--fa` custom-property aliasing — a sweep of **all 103** referenced glyphs (static + dynamic) found **0 missing**, so these render correctly.
  - INFO · :30-51 optimistic-toggle-then-revert-on-error in `async` handlers (no `$effect`) — correct local-state pattern; destructive actions gated behind `confirmDialog` (house rule: never `window.confirm`).

### UserInfoModal.svelte
- **LOC:** 258 · **purpose:** User profile dialog (avatar/name/status) + Mention/Private-Chat/Follow/Mute actions + info detail table.
- **Docs:** `svelte/$derived`, `svelte/scoped-styles` (`:global`), `svelte/snippet`, `svelte/compiler-warnings`.
- **autofixer:** `issues:` → **2 × `css_unused_selector`** at lines 125,126 (`:global(.panel:has(.user-info-body)) :global(.foot) > .action` / `> .close-btn`). `suggestions: []`.
- **form-field a11y:** no form fields (buttons with `aria-label`/`aria-pressed`).
- **findings:**
  - LOW · UserInfoModal.svelte:125-130 · `svelte/scoped-styles` (`:global`) · the two `:global(...) > .action/.close-btn` selectors flag unused because the autofixer compiles the file in isolation — `.action`/`.close-btn` render inside the `{#snippet footer()}` projected into Modal's `.foot`, so the descendant match can't be proven standalone. Real-build-harmless, but it IS the fragile `:global(...) > .local-class` pattern the docs warn about. Fix: make the trailing selectors `:global` too, or move the overrides into `Modal.svelte`.
  - LOW · UserInfoModal.svelte:40 · **dead control** · the `@Mention` `<button>` has `aria-label` but **no `onclick`** (the other 4 footer buttons are wired). Matches the first-pass F13 finding.
  - INFO · :24-25 `isFollowed`/`isMuted` via `$derived(followed.has(...))` reading reactive store state — textbook `$derived`; `has`/`toggle` null-safe on undefined ids.

---

## Area summary — all 26 modals

| # | File | autofixer | findings (C/H/M/L) | top finding |
|---|------|-----------|--------------------|-------------|
| 1 | MobileAppInfoModal | `[]` | 0/0/0/0 | clean |
| 2 | MutedUsersModal | `[]` | 0/0/0/0 | clean |
| 3 | FollowedUsersModal | `[]` | 0/0/0/0 | clean |
| 4 | ReplyModal | `[]` | 0/0/0/1 | textarea labelled by `aria-label` only |
| 5 | DebugLogModal | `[]` | 0/0/0/0 | exemplary (`for`/`id`, cleanup-only `$effect`) |
| 6 | AlertLogsModal | `[]` | 0/0/0/0 | network-fetch `$effect` (correct) |
| 7 | MultiSelectDropdown | `[]` | 0/0/0/0 | clean `$bindable` listbox |
| 8 | ScheduledAlertsModal | `[]` | 0/0/0/0 | clean |
| 9 | ChatLogsModal | `[]` | 0/0/0/1 | `<select>` labelled by `aria-label` only |
| 10 | RichTextEditorModal | `[]` | 0/0/**1**/0 | **MED**: editor HTML emitted unsanitized to `onSave` |
| 11 | AlertFilterModal | `[]` | 0/0/0/0 | clean (wrapped-label checkbox) |
| 12 | AlertSendReportModal | `[]` | 0/0/0/0 | clean |
| 13 | AVSettingsModal | `[]` | 0/0/0/1 | 3 selects lack `name` (no `<form>`) |
| 14 | AddUserModal | `[]` | 0/0/0/0 | wrapped-label form, sound |
| 15 | AdvancedSearchModal | `[]` | 0/0/0/0 | modern `$props.id()` + `form={formId}` |
| 16 | AllUserPmModal | `[]` | 0/0/0/0 | escaped text (no `{@html}`) |
| 17 | BadgesModal | `[]` | 0/0/0/0 | `$derived` preview (correct) |
| 18 | BrandingModal | `[]` | 0/0/0/1 | `<img alt={brand.name}>` null → `alt={…?? 'Logo'}` |
| 19 | ConnectivityCheckModal | `[]` | 0/0/0/0 | canonical `$effect` teardown |
| 20 | SettingsModal | `[]` | 0/0/0/0 | exemplary tab/radiogroup ARIA |
| 21 | PostAlertModal | `[]` | 0/0/0/1 | fully labeled+named (best-in-set); drop-zone a11y nit |
| 22 | EditProfileModal | `[]` | 0/0/0/1 | 2 password inputs lack `aria-label` |
| 23 | MediaForAllModal | `[]` | 0/0/0/0 | spoof-safe host parse |
| 24 | PlayYouTubeModal | `[]` | 0/0/0/1 | URL input `type=text` vs `url` |
| 25 | SessionControlModal | `[]` | 0/0/0/0 | clean (dynamic FA7 glyphs verified present) |
| 26 | UserInfoModal | **2× css_unused_selector** | 0/0/0/2 | `:global(...) > .local` selector + dead `@Mention` button |

**Shared shell (`Modal.svelte`, reported once):** MEDIUM — `aria-modal` dialog with focus *restore* but **no focus trap** (Tab escapes); inherited by all 26.

### Totals
- **Files with non-empty `svelte-autofixer` `issues[]`: 1 / 26** (UserInfoModal — 2× `css_unused_selector`, an isolated-compile artifact of a `:global(...) > .local-class` selector targeting slotted snippet content; harmless at runtime).
- **Severity:** CRITICAL **0** · HIGH **0** · MEDIUM **2** (RichTextEditorModal output-sanitization; shared `Modal.svelte` focus-trap) · LOW **~9** · INFO many.
- **`{@html}`:** none anywhere in the modals directory ⇒ zero in-file XSS surface.
- **TypeScript:** every modal declares a typed `interface Props` with `$props()`; no `any`, no untyped props.
- **`$effect` vs `$derived`:** every `$effect` is a legitimate IO/reset/cleanup effect; no effect-vs-derived misuse, no state-set-in-effect loops.
- **Cross-cutting check — RESOLVED with evidence:** the FA7 upgrade's coverage of **dynamically-referenced** glyphs was verified during this audit. A sweep of all **103** referenced glyph names (static `name="…"` + dynamic `icon:`/ternary literals across SessionControl/RichText/AlertSendReport/MainStage/UserInfo) against the installed FA7-free `all.min.css` found **0 missing** (FA7 keeps the FA5 legacy aliases). The only FA7 item that remains unverifiable in this headless env is **visual fidelity** to the protradingroom.com reference — run `web/scripts/pixel-diff.mjs` in a browser before merge.
