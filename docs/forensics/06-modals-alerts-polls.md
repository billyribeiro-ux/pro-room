# Forensic Dossier 06 — Alert & Poll Modals

Scope: `PostAlertModal`, `AlertFilterModal`, `AdvancedSearchModal`, `ScheduledAlertsModal`,
`AlertLogsModal`, `AlertSendReportModal` (in `web/src/lib/components/modals/`) plus
`PollModal` + `AlertQaModal` (in `web/src/lib/components/`).

Method: read each component + its trigger host; rendered every modal live with `open={true}`
via a temporary scratch route (`web/src/routes/_forensic_a/`, now DELETED) and measured with
Playwright; grepped the reference captures
(`docs/reference/captures/proroom-ultra-admin-room.json`,
`proroom-full-presenter.json`) for hard DOM/CSS evidence. Every FA5 glyph was validated against
`web/node_modules/@fortawesome/fontawesome-free/css/all.min.css`.

Standing facts:
- Shared wrapper `web/src/lib/components/Modal.svelte`: panel `max-width: 440px`,
  `border-radius: 8px`, bg `var(--bg-elev-2)` (=#103d5c dark theme), border `1px var(--border)`.
  Measured live: `w=440 h=auto, bg=rgb(16,61,92), radius=8px, border=1px rgb(26,79,116)`.
- Reference modals are **Bootstrap** (`modal fade` / `modal-dialog` / `modal-content` /
  `modal-header` / `modal-title` / `modal-body` / `modal-footer`), all `visible:false` in the
  static capture (click-triggered → bodies/fields mostly absent → EVIDENCE GAP for field-level
  pixels on most). The poll-create modal is a bespoke Angular widget (`pollModalHolder` +
  `#sendpoll`), NOT a Bootstrap modal.
- All FA5 glyphs used across these 8 modals VALIDATE in FA5 Free 5.8.1:
  `font, link, image, smile, video, upload, paper-plane, filter, sync, bell, search, clock,
  times, trash-alt, plus, users, check-circle, envelope-open, info-circle`. No invalid glyphs.

---

## 1. PostAlertModal

- **File**: `web/src/lib/components/modals/PostAlertModal.svelte`
- **Trigger & reachability**: `web/src/lib/components/AlertFeed.svelte:333`
  (`<PostAlertModal open={postAlertOpen} …/>`), opened at `AlertFeed.svelte:160`
  (`onclick={() => (postAlertOpen = true)}`, the `plus-circle` button, rendered only `{#if canPost}`).
  AlertFeed is mounted via `AlertsChatDock.svelte:103` → room page `+page.svelte:503`.
  **REACHABLE** for users with `can_post_alert`.
- **Structure** (measured `w=440 h=467`): title "Post Alert". Body = a 5-tab tablist
  (Text Alert `fa-font`, Text Url `fa-link`, Image `fa-image`, GIF `fa-smile` regular,
  Video `fa-video`) + per-tab field(s) (textarea / url+text / image url+upload / gif url / video url).
  Footer = 5 checkboxes (Keep alert window open? / Post on X? (tweet) / Don't send to push
  notification? / Non-trade alert? (Different Sound) / Add Legal Disclosure?) + primary
  "Post Alert" button (`fa-paper-plane`).
- **FA5 glyph validity**: all OK — `font, link, image, smile (regular), video, upload,
  paper-plane`.
- **Form-field id gaps** (DevTools "no id/name" warning): textarea `:193`; checkboxes `:242,
  :245, :248, :251, :254`. (6 fields, all 6 missing both id & name — measured.) The `<input
  type=file>` `:216` is also id/name-less. None are inside a labelled `for=` association beyond
  the wrapping `<label>`.
- **Runes/check compliance**: clean — `$props`, `$state`, `$derived` used correctly; no legacy
  syntax. `roomId = page.params.id` read at module top (`:16`) is fine for the room route but is
  read off-room as `undefined` (only used on submit, no crash).
- **Behaviour / dead controls**: tabs switch panes (live). Upload posts to
  `/api/rooms/:id/files` (`:81`). Post builds symbol from first `$cashtag` (fallback "ALERT"),
  side `nta`/`buy` from the non-trade flag, persists `post_to_x`/`no_push`; opens an X intent tab
  when "Post on X?" is set (`:97`). All controls live. Note: our composer derives a fake
  symbol/side from free text because the backend is symbol+side+note — the reference is free-form.
- **Capture evidence**: HARD.
  - `inventory.modalsInDom`: `{class:"modal fade", title:"Post Alert"}` (+ `modal-dialog /
    modal-content / modal-header / modal-title / modal-body / modal-footer`). ours title="Post Alert"
    **MATCHES** ref title="Post Alert".
  - Reference tabs (`controls`): `Text Alert` (`#nav-text`), `Text Url` (`#nav-url`),
    **`Image / GIF / Video`** (`#nav-img`) — i.e. **ref=3 tabs vs ours=5 tabs**
    (we split Image/GIF/Video into three). DIVERGENCE.
  - Checkbox labels (Keep open / Post on X / etc.): **EVIDENCE GAP** — modal hidden in capture,
    body not serialized. Our 5 checkboxes are plausible but unverified against the live ref.
- **Screenshot**: `docs/forensics/shots/06-PostAlertModal.png`
- **Prioritized fixes**:
  1. `PostAlertModal.svelte:157-186` — collapse the Image / GIF / Video tabs into a SINGLE tab
     labelled "Image / GIF / Video" (`#nav-img`) to match `ref=3 tabs`. Keep the three field
     variants inside one pane (sub-toggle or auto-detect by URL), removing the separate `gif`/`video`
     `Tab` union members. (Structural, not pixel — confirmed by `controls` capture.)
  2. `PostAlertModal.svelte:193,216,242,245,248,251,254` — add `id`/`name` to the textarea, file
     input and 5 checkboxes (e.g. `id="pa-text" name="text"`, `id="pa-keepopen"
     name="keep_open"` …) to clear the DevTools form-field warning.

---

## 2. AlertFilterModal

- **File**: `web/src/lib/components/modals/AlertFilterModal.svelte`
- **Trigger & reachability**: `AlertFeed.svelte:331` (`<AlertFilterModal open={filterOpen} …/>`),
  opened at `AlertFeed.svelte:184` from the gear → "Filter alerts" dropdown item
  (`filterOpen = true`). **REACHABLE** (gear menu is always rendered in the Alerts header).
  Note `SettingsModal.svelte:24,364` references it as a future integration point but does not
  open it.
- **Structure** (measured `w=440 h=312`): title "Filter out alerts". Body = one checkbox
  "Only show alerts from these people" + a dim placeholder list (`fa-filter` icon, "No people
  selected yet."). Footer = single primary "Done" button.
- **FA5 glyph validity**: `fa-filter` OK.
- **Form-field id gaps**: 1 checkbox `:16` missing id/name (measured).
- **Runes/check compliance**: clean — minimal `$state(false)` toggle.
- **Behaviour / dead controls**: the checkbox only dims/undims the empty list (`class:dim`);
  there is NO people source, NO selection, NO filter applied to the feed. "Done" just calls
  `onClose`. **Effectively a non-functional placeholder.**
- **Capture evidence**: HARD (partial).
  - `inventory.modalsInDom` (full-presenter): modal title **"Filter out alerts"** — ours title
    "Filter out alerts" **MATCHES**.
  - The TRIGGER in the ref is a `btn btn-primary btn-sm mt-4 ml-4` with text "Filter out alerts"
    and icon `fas fa-filter me-1` (capture `controls`). Ours is a gear-menu item, not a primary
    button — placement DIVERGENCE (but reachability OK).
  - Body fields (the people picker): **EVIDENCE GAP** (modal hidden).
- **Screenshot**: `docs/forensics/shots/06-AlertFilterModal.png`
- **Prioritized fixes**:
  1. `AlertFilterModal.svelte:16` — add `id="filter-only-people" name="only_people"` to the checkbox.
  2. Behaviour: the people list is inert (`:20-25`). Wire a real `present`/followed-users source +
     selection so the filter actually applies, OR keep as a documented placeholder. (Not a pixel fix;
     ref body is an EVIDENCE GAP.)

---

## 3. AdvancedSearchModal

- **File**: `web/src/lib/components/modals/AdvancedSearchModal.svelte`
- **Trigger & reachability**: `AlertFeed.svelte:330` (`<AdvancedSearchModal open={searchOpen} …/>`),
  opened at `AlertFeed.svelte:163` (the `search` icon button in the Alerts header,
  `searchOpen = true`). **REACHABLE** (always rendered).
- **Structure** (measured `w=440 h=403`): title "Alerts Advanced Search". Form (`id` via
  `$props.id()`) = Search term text input; two checkboxes (Non Trade Alert / Also search
  archives?); a 2-col grid Start Date / End Date (`datetime-local`); a 2-col grid Traders /
  Rooms selects (`--Select Traders--` / `--Select Rooms--`). Footer = ghost "Close" + primary
  "Search" (`fa-search`, `type=submit form={formId}`).
- **FA5 glyph validity**: `fa-search` OK.
- **Form-field id gaps**: the text input, both dates and both selects HAVE proper `id` + `for=`
  (`:66-114`). The 2 checkboxes `:77, :81` are missing id/name (measured 2 gaps).
- **Runes/check compliance**: clean. Good pattern — `$props.id()` namespaced ids, real
  `<label for=…>` on every text/date/select field, `onsubmit` with `e.preventDefault()`.
- **Behaviour / dead controls**: `onSearch` callback is OPTIONAL and NOT supplied by AlertFeed
  (`:330` passes only `open`/`onClose`). So "Search" assembles criteria and calls `onSearch?.()`
  → **no-op / dead** in the live app (no results panel, no wiring). `traders`/`rooms` default to
  `[]`, so both selects only show the placeholder.
- **Capture evidence**: **EVIDENCE GAP** — no "Advanced Search" modal title found in
  `modalsInDom`; not present in the static captures (click-triggered and likely never opened in
  the capture session). The reference Alerts header does have a search affordance, but the modal
  internals are unverified.
- **Screenshot**: `docs/forensics/shots/06-AdvancedSearchModal.png`
- **Prioritized fixes**:
  1. `AdvancedSearchModal.svelte:77,81` — add `id`/`name` to the two checkboxes
     (`id="{formId}-nontrade"`, `id="{formId}-archives"`).
  2. Behaviour: pass a real `onSearch` from `AlertFeed.svelte:330` (and feed `traders`/`rooms`)
     so Search isn't dead. (Not a pixel match; ref is an EVIDENCE GAP.)

---

## 4. ScheduledAlertsModal

- **File**: `web/src/lib/components/modals/ScheduledAlertsModal.svelte`
- **Trigger & reachability**: `AlertFeed.svelte:332`
  (`<ScheduledAlertsModal open={scheduledOpen} …/>`), opened at `AlertFeed.svelte:191` from the
  gear → "Scheduled alerts" dropdown item. **REACHABLE**.
- **Structure** (measured `w=440 h=442`): title "Manage Scheduled Alerts". Form = "Alert" text
  input + "Send at" `datetime-local` + primary "Schedule" button (`fa-paper-plane`); then a
  "SCHEDULED" section title and an empty state (`fa-clock`, "No scheduled alerts yet.") or a list
  with per-item delete (`fa-times`).
- **FA5 glyph validity**: `fa-paper-plane`, `fa-clock`, `fa-times` all OK.
- **Form-field id gaps**: NONE — text input `:62` and date `:73` both carry `id` + `for=` via
  `$props.id()` (measured 0 gaps). Cleanest of the set.
- **Runes/check compliance**: clean — `$derived(canSchedule)`, namespaced ids, `onsubmit`
  guarded by `canSchedule`.
- **Behaviour / dead controls**: `onSchedule`/`onDelete` are OPTIONAL and NOT supplied by
  AlertFeed (`:332` passes only `open`/`onClose`). So scheduling/deleting are **no-ops** in the
  live app, and `scheduled` defaults to `[]` (always empty). "Close" works.
- **Capture evidence**: HARD.
  - `inventory.modalsInDom` (full-presenter): `{class:"modal fade text-white",
    title:"Manage Scheduled Alerts"}` + `{class:"modal-dialog modal-xl", …}`. ours title
    "Manage Scheduled Alerts" **MATCHES** ref exactly. Reference dialog is **`modal-xl`** (extra
    large) while ours is the shared 440px wrapper → **width DIVERGENCE** (ours=440 vs
    ref=modal-xl, ~1140px at the Bootstrap xl breakpoint).
  - Field-level body: EVIDENCE GAP (hidden modal).
- **Screenshot**: `docs/forensics/shots/06-ScheduledAlertsModal.png`
- **Prioritized fixes**:
  1. Width: the reference is `modal-xl`. The shared `Modal.svelte` is hard-capped at 440px
     (`Modal.svelte:89`). To match, either add an optional `size`/`maxWidth` prop to
     `Modal.svelte` and pass an xl width here, or wrap this modal's body in a wider layout. (HARD
     evidence: `modal-dialog modal-xl`.) DO NOT implement — flagged.
  2. Behaviour: wire `onSchedule`/`onDelete` + a real `scheduled` list from
     `AlertFeed.svelte:332`. (Currently dead.)

---

## 5. AlertLogsModal

- **File**: `web/src/lib/components/modals/AlertLogsModal.svelte`
- **Trigger & reachability**: `RoomSidebar.svelte:242`
  (`<AlertLogsModal open={alertLogsOpen} …/>`), opened from BOTH
  `RoomSidebar.svelte:114` ("Archives" item) AND `:122` ("Alert Logs" sub-item) — both set
  `alertLogsOpen = true`. RoomSidebar is mounted at room `+page.svelte:358`. **REACHABLE**.
  (Note "Archives" and "Alert Logs" open the SAME modal — likely a bug; ref treats them as
  distinct dropdown entries.)
- **Structure** (measured `w=440 h=249`): title "Alert Logs". Body = a disabled "Reload Log
  List" toolbar button (`fa-sync`) + empty state (`fa-bell`, "No logs yet."). No form fields.
- **FA5 glyph validity**: `fa-sync`, `fa-bell` OK.
- **Form-field id gaps**: NONE (0 inputs).
- **Runes/check compliance**: clean. `logs` is a const empty array — never populated.
- **Behaviour / dead controls**: "Reload Log List" is `disabled` (explicitly inert, comment
  `:11` "No backend yet — the list is always empty. The header action is inert."). Whole modal is
  a placeholder.
- **Capture evidence**: HARD (partial).
  - `inventory.menus` (admin capture): a `nav-item dropdown` with items
    `["Archives","Alert Logs","Chat Logs","Transcript History"]` — ours mirrors this dropdown
    (RoomSidebar). `inventory.modalsInDom` also lists title "Alert Logs". ours title="Alert Logs"
    **MATCHES**.
  - Body/log-row layout: EVIDENCE GAP (hidden modal).
- **Screenshot**: `docs/forensics/shots/06-AlertLogsModal.png`
- **Prioritized fixes**:
  1. `RoomSidebar.svelte:114` — "Archives" should NOT open the Alert Logs modal (it points at
     the same `alertLogsOpen`). Give Archives its own target or behaviour. (Behaviour bug, not pixel.)
  2. Wire a real log source + enable "Reload Log List" (`AlertLogsModal.svelte:17` is `disabled`).
     Placeholder until then — ref body is an EVIDENCE GAP.

---

## 6. AlertSendReportModal

- **File**: `web/src/lib/components/modals/AlertSendReportModal.svelte`
- **Trigger & reachability**: `AlertFeed.svelte:334`
  (`<AlertSendReportModal open={reportAlert !== null} alertId={reportAlert?.id} …/>`), opened at
  `AlertFeed.svelte:243` from the per-row ⋮ menu → "Delivery report" item (`reportAlert = a`),
  rendered only `{#if canPost}`. **REACHABLE** for posters (row menu → Delivery report).
- **Structure** (measured `w=440 h=475`): title `Alert Sent Report. AlertID: <id>` (derived,
  em-dash fallback). Body = a summary line (`fa-paper-plane`) + a 2-col stat grid (Recipients
  `fa-users` / Delivered `fa-check-circle` / Push sent `fa-bell` / Opened `fa-envelope-open`) +
  a placeholder note (`fa-info-circle`, "Showing placeholder figures…"). Footer = ghost "Close".
- **FA5 glyph validity**: `paper-plane, users, check-circle, bell, envelope-open, info-circle`
  all OK.
- **Form-field id gaps**: NONE (0 inputs).
- **Runes/check compliance**: clean — `$derived(title)`, `$derived(formatted)`. Stats default to
  zeros (`placeholderStats`).
- **Behaviour / dead controls**: read-only. Stats are hard-coded zeros (`:22`, comment "real
  send-report payload … wired in later"). "Close" works. Fully placeholder data.
- **Capture evidence**: **EVIDENCE GAP** — no "Alert Sent Report" title found in `modalsInDom`;
  not in the static captures (click-triggered, not opened in capture). Title format
  "Alert Sent Report. AlertID: <id>" is from our own code comment, not verified against the live ref.
- **Screenshot**: `docs/forensics/shots/06-AlertSendReportModal.png`
- **Prioritized fixes**:
  1. Wire real delivery stats from the alert-delivery API (`AlertSendReportModal.svelte:22`
     placeholder). No id/name or glyph issues. Title/layout match unverifiable → EVIDENCE GAP.

---

## 7. PollModal

- **File**: `web/src/lib/components/PollModal.svelte`
- **Trigger & reachability**: bound at room `+page.svelte:394-398`
  (`<PollModal open={showCreatePoll} …/>`). `showCreatePoll` is declared at `+page.svelte:56`
  and is set to `false` only (`:56`, `:396`). **NO code path ever sets `showCreatePoll = true`.**
  The in-code comment `+page.svelte:430-431` claims "New poll … lives in the Alerts section
  (header + bottom)", but AlertFeed's header/bottom contain NO poll-create trigger (verified full
  file), and `RoomTopNav`'s stageActions snippet (`+page.svelte:432+`) renders only
  Share/Camera/Mic — NO "New poll" button despite the `.nav-controls` comment listing it.
  **→ PollModal is ORPHANED / DEAD: unreachable in the live app.**
- **Structure** (measured `w=440 h=432`): title "Create a poll". Form = Question text input
  (`maxlength=280`); a "OPTIONS" fieldset with 2+ keyed option rows (text input + trash
  `fa-trash-alt` remove) and an "Add option" dashed button (`fa-plus`, max 10); an "Anonymous
  poll" checkbox. Footer = ghost "Cancel" + primary "Send" (`fa-paper-plane`).
- **FA5 glyph validity**: `trash-alt, plus, paper-plane` all OK.
- **Form-field id gaps**: question input HAS `id` (`:108` `$props.id()`). The 2 option text
  inputs `:122` (use `aria-label` but NO id/name) and the Anonymous checkbox `:154` are missing
  id/name (measured 3 gaps).
- **Runes/check compliance**: clean — keyed `{#each … (option.key)}`, `$effect` resets on `open`
  only, `$derived`-free but correct. Good.
- **Behaviour / dead controls**: validates via `validatePollCreate`, POSTs `createPoll(roomId,…)`
  with `{question, options, anonymous}`; on success calls `onCreated` (→ `upsertPoll`). All
  controls live — BUT the modal can never be opened (see trigger). The displayed-poll widget is a
  SEPARATE component (`PollPanel.svelte`), so polls still render via the SSE feed; only
  *creating* one from the UI is impossible.
- **Capture evidence**: HARD — the reference create-poll modal differs substantially.
  - `inventory.modalsInDom`: `{class:"pollModalHolder", title:"1 Enter your poll question:"}`
    — a bespoke widget, NOT a Bootstrap modal. **ours title "Create a poll" vs
    ref title "1 Enter your poll question:"** (numbered step heading). DIVERGENCE.
  - Container CSS (`stylesheets`): `.pollModalHolder { position:fixed; left:50%; top:50%;
    z-index:501; border:1px solid rgb(133,133,133); border-radius:4px;
    background-color:rgb(30,30,30) (#1e1e1e); width:580px; height:553px; font-size:14px;
    box-shadow: rgba(0,0,0,.5) 0 4px 20px; padding:10px; }`. **ours w=440 radius=8 bg=#103d5c vs
    ref w=580 h=553 radius=4 bg=#1e1e1e** — DIVERGENCE on width, height, radius, background.
  - Inner form id is **`#sendpoll`** with `#sendpoll h3 { font-size:20px }`; tab strip
    `.nav-tabs`; checkbox container `.anonymous-poll-container { margin:8px 0 8px 20px }` with
    `.form-check-input` (20×20 round). So the ref DOES have an Anonymous toggle (matches ours
    semantically) but as a styled `.form-check-input`.
  - Footer (`controls`): **"Save To Canned"** (`btn btn-outline-light pull-right`, icon
    `fa fa-floppy-o`) + **"Send Poll"** (`btn btn-success centered float-right`) + a
    `btn-close btn-close-white` (aria-label "Close"). **ours footer "Cancel"/"Send" vs
    ref footer "Save To Canned"/"Send Poll"** — we are MISSING the "Save To Canned" button and
    our send label says "Send" not "Send Poll".
  - NOTE: `fa fa-floppy-o` is **FA4** and is NOT in FA5 Free (validated MISS). The FA5 equivalent
    is `fa-save` (validated OK) — use `<Icon name="save"/>` if matching this button.
- **Screenshot**: `docs/forensics/shots/06-PollModal.png`
- **Prioritized fixes** (HIGH — biggest divergence + dead trigger):
  1. **Reachability**: add a live "New poll" trigger that sets `+page.svelte:56`
     `showCreatePoll = true`. Reference put it adjacent to poll affordances; the orphan + the
     misleading comment at `+page.svelte:430-431` must be reconciled. (DEAD control — top priority.)
  2. `PollModal.svelte:97` — title `"Create a poll"` → reference `"Enter your poll question:"`
     (numbered "1 …" heading; ours has no step numbers).
  3. `PollModal.svelte:89-95` footer — add a "Save To Canned" button
     (`<Icon name="save"/>`, FA5 equiv of ref's FA4 `fa-floppy-o`) and rename "Send" → "Send Poll".
  4. Container size/style: ref `width:580px; height:553px; border-radius:4px;
     background:#1e1e1e` vs our shared `Modal` (440 / 8px / #103d5c). Needs a size/style override
     on `Modal.svelte` or a bespoke holder.
  5. `PollModal.svelte:122,154` — add `id`/`name` to the option inputs and the Anonymous checkbox.

---

## 8. AlertQaModal

- **File**: `web/src/lib/components/AlertQaModal.svelte`
- **Trigger & reachability**: `AlertFeed.svelte:324` (`<AlertQaModal alert={qaAlert} …/>`),
  opened at `AlertFeed.svelte:278` (`openQa(a)` → `qaAlert = a`) from the per-row Q&A badge
  button. That badge is rendered ONLY `{#if (a.question_count ?? 0) > 0 || a.answered}`
  (`AlertFeed.svelte:277`) — i.e. it appears only on alerts that ALREADY have ≥1 question or are
  answered. **CONDITIONALLY REACHABLE**: there is NO "ask a question" entry point on a fresh
  alert (0 questions, not answered), so a member cannot start a new thread from the feed — only
  view/extend existing ones. (Not its own Bootstrap `Modal`; it's a bespoke `.dialog`/`.backdrop`.)
- **Structure** (measured `w=544 h=auto, radius=12px`): title `Q&A — {alert.symbol}`. Body =
  status / questions list (author, stamp, parsed body with `.ticker`/links; answered block with
  `fa-check-circle` "Answer" tag; admin "Answer & resolve" inline composer). Bottom composer =
  textarea + primary "Send" (`fa-paper-plane`). Close = `fa-times`.
- **FA5 glyph validity**: `check-circle, paper-plane, times` OK.
- **Form-field id gaps**: the composer textarea `:222` and the answer textarea `:185` are missing
  id/name (measured — 1 visible at a time; 2 total in source).
- **Runes/check compliance**: clean — `$effect` reads only `alert?.id` (guarded against
  re-fetch on typing), keyed `{#each}`, valibot validation. Uses its OWN dialog markup (not the
  shared `Modal.svelte`), so its panel is 544px/12px radius — INCONSISTENT with the other 7
  modals (440px/8px) but that's an internal-consistency note, not a ref divergence.
- **Behaviour / dead controls**: Send posts a question (live); admin "Answer & resolve" gated on
  `canPostAlert` fetched from `/api/rooms/:id` (`:62`). All controls live. Escape closes
  (`svelte:window`).
- **Capture evidence**: HARD (title only).
  - `inventory.modalsInDom`: `{class:"fade modal", title:"Q&A for Alert:"}` (+ `modal-dialog /
    modal-content`). **ours title "Q&A — SPX" vs ref title "Q&A for Alert:"** — the ref is a
    Bootstrap modal whose title is "Q&A for Alert: <id>"; ours uses an em-dash + symbol.
    DIVERGENCE in title wording AND wrapper (ref=Bootstrap modal vs ours=bespoke dialog).
  - Body thread layout: EVIDENCE GAP (hidden modal).
- **Screenshot**: `docs/forensics/shots/06-AlertQaModal.png` (renders fully; "Bad Request"
  banner is just the off-room API fetch failing — expected, confirms the loading/error state).
- **Prioritized fixes**:
  1. `AlertQaModal.svelte:138` — title `Q&A — {alert.symbol}` → align to reference
     `Q&A for Alert: …` wording (ref hard evidence).
  2. Reachability: add an "ask" entry point for alerts with 0 questions (the badge at
     `AlertFeed.svelte:277` only shows when `question_count>0 || answered`), so the composer is
     reachable on fresh alerts.
  3. `AlertQaModal.svelte:185,222` — add `id`/`name` to both textareas.
  4. Consistency (optional): ref is a Bootstrap modal; ours is a bespoke 544px/12px dialog vs the
     440px/8px shared wrapper — consider routing through `Modal.svelte`.

---

## Consolidated fix list (prioritized)

### A. Reachability / dead controls (functional, highest impact)
1. **PollModal is ORPHANED** — `room +page.svelte:56` `showCreatePoll` is never set `true`; the
   "New poll" comment at `+page.svelte:430-431` is wrong (no such trigger in AlertFeed header/bottom
   or RoomTopNav stageActions). Add a real trigger.
2. **AlertQaModal** — composer unreachable on alerts with 0 questions (`AlertFeed.svelte:277` badge
   gate). Add an "ask" entry point.
3. **AlertLogsModal** — "Archives" and "Alert Logs" both open the SAME modal
   (`RoomSidebar.svelte:114` & `:122`). Separate them.
4. **AdvancedSearchModal / ScheduledAlertsModal / AlertFilterModal** — `onSearch` / `onSchedule` /
   `onDelete` / filter selection are never supplied by AlertFeed (`:330,:331,:332`) → Search,
   Schedule, Delete, and the people filter are all no-ops. Wire them or document as placeholders.
5. **AlertLogsModal** "Reload Log List" (`:17`) and **AlertSendReportModal** stats (`:22`) are
   hard-coded placeholders — wire to backend.

### B. Reference structural divergences (HARD capture evidence)
6. **PostAlertModal** tabs: ours=5 (text/url/image/gif/video) vs **ref=3** (Text Alert / Text Url /
   "Image / GIF / Video"). Collapse to 3 → `PostAlertModal.svelte:157-186`.
7. **PollModal** vs ref `pollModalHolder`/`#sendpoll`:
   - title `"Create a poll"` → `"Enter your poll question:"` (numbered) — `:97`.
   - footer: ADD "Save To Canned" (`<Icon name="save"/>`; ref FA4 `fa-floppy-o` → FA5 `fa-save`)
     and rename "Send" → "Send Poll" — `:89-95`.
   - container: ref `width:580px height:553px border-radius:4px background:#1e1e1e` vs ours
     `440 / 8px / #103d5c`.
8. **ScheduledAlertsModal** width: ref `modal-dialog modal-xl` (~1140px) vs ours 440px shared
   wrapper. Needs a size override on `Modal.svelte:89`.
9. **AlertQaModal** title: `"Q&A — SPX"` → ref `"Q&A for Alert: …"` — `:138`. Ref is a Bootstrap
   modal; ours is a bespoke 544px/12px dialog.
10. **AlertFilterModal** trigger placement: ref is a `btn btn-primary btn-sm` "Filter out alerts"
    (icon `fas fa-filter`), ours is a gear-menu item.

### C. Form-field id/name hygiene (DevTools warnings — measured live)
| Modal | File:line (missing id/name) |
|---|---|
| PostAlertModal | `:193` textarea; `:216` file input; `:242,:245,:248,:251,:254` checkboxes |
| AlertFilterModal | `:16` checkbox |
| AdvancedSearchModal | `:77,:81` checkboxes (text/date/selects already OK) |
| PollModal | `:122` option inputs (×2); `:154` Anonymous checkbox (question input OK) |
| AlertQaModal | `:185` answer textarea; `:222` composer textarea |
| ScheduledAlertsModal | none (clean) |
| AlertLogsModal | none (no inputs) |
| AlertSendReportModal | none (no inputs) |

### D. FA5 glyph validity
All glyphs used by these 8 modals VALIDATE in FA5 Free 5.8.1. The ONLY invalid glyph is in the
*reference* poll footer (`fa fa-floppy-o`, FA4) — if we add "Save To Canned", use FA5 `fa-save`.

### E. Runes / `pnpm run check`
No runes violations spotted in any of the 8 components (correct `$props`/`$state`/`$derived`/
`$effect`/`$props.id()` usage, keyed `{#each}`). No changes implemented (per mandate). Scratch
route `web/src/routes/_forensic_a/` and scratch script were created for measurement and DELETED.
