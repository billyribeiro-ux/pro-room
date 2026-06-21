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

<!-- BATCH-A-PLACEHOLDER -->

<!-- BATCH-B-PLACEHOLDER -->

<!-- SUMMARY-PLACEHOLDER -->
