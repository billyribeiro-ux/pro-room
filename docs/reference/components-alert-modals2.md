# Alert Modals — Simpler Trading reference (Angular 17 snapshots)

Extracted from rendered Angular 17 DOM (`files/file28.html`, `file25.html`,
`file26.html`, `file29.html`). Angular cruft stripped: `_nghost*`,
`_ngcontent*`, `ng-star-inserted`, `ng-reflect-*`, empty `<!---->`. Real
`class` / `id` / `role` / `aria-*` retained.

All four share the Bootstrap modal shell:
`.modal.fade > .modal-dialog > .modal-content > {.modal-header, .modal-body,
.modal-footer}`. Header has an `<h5>` title plus a
`button.btn-close.btn-close-white[data-bs-dismiss="modal"]`.

---

## 1. `app-alerts-advanced-search` → `AdvancedSearchModal.svelte`

Source: `files/file28.html` (~409 lines, the full version). Dialog is the
**default** width (`.modal-dialog`, no `-xl`).

### Simplified tree

```
.modal#alerts-advanced-search-modal[role=dialog][aria-labelledby=alerts-advanced-search-modal][aria-hidden=true]
  .modal-dialog[role=document]
    .modal-content
      .modal-header
        h5  "Alerts Advanced Search"
          button.btn.btn-info.btn-sm.mx-1   → <i.fas.fa-sync-alt> "Rooms"   (refresh-rooms action, lives INSIDE the title)
        button.btn-close.btn-close-white[data-bs-dismiss=modal][aria-label=Close]
      .modal-body
        .d-flex.align-items-center.justify-content-between.flex-wrap.mb-2        (row 1: dropdowns + search input)
          .d-flex.align-items-center.justify-content-between.flex-wrap
            .dropdown.dropdown-trader-select.mx-1                                 (Bootstrap dropdown — NOT a <select>)
              button#selectTraderDropdown.btn.btn-light.dropdown-toggle[data-bs-toggle=dropdown][data-bs-auto-close=outside][aria-expanded=false]
                span "--Select Traders--"
              ul.dropdown-menu.w-100
                li > a.dropdown-item   "Allison"
                li > a.dropdown-item   "Big Bad Voodoo Daddy"
                ... (20 trader items, see list below)
            .dropdown.dropdown-room-select.mx-1
              button#selectRoomDropdown.btn.btn-light.dropdown-toggle[data-bs-toggle=dropdown][data-bs-auto-close=outside]
                span "--Select Rooms--"
              ul.dropdown-menu.w-100
                li > a.dropdown-item   "Showcase Room"
                li > a.dropdown-item   "Mastering The Trade"
                li > a.dropdown-item   "Tr3ndy Trading"
          input#search-term-input[name=search-term-input][type=search]
                [placeholder="Type your search term"][aria-label="Type your search term"]
                [aria-describedby=search-term-addon].form-control
        .d-flex.align-items-center.justify-content-between.flex-wrap.mb-2        (row 2: checkboxes + date pickers)
          div
            .form-check.m-1
              input#checkNonTradeAlert[type=checkbox].form-check-input
              label[for=checkNonTradeAlert].form-check-label  "Non Trade Alert"
            .form-check.m-1
              input#checkArchives[type=checkbox].form-check-input
              label[for=checkArchives].form-check-label  "Also search archives?"
          .d-flex.align-items-center.flex-wrap.date-input-container
            .d-flex.align-items-center.flex-wrap.m-1
              label[for=startDateInput].form-label.m-0.me-1  "Start Date:"
              input#startDateInput[type=datetime-local].form-control
            .d-flex.align-items-center.flex-wrap.m-1
              label[for=endDateInput].form-label.m-0.me-1  "End Date:"
              input#endDateInput[type=datetime-local].form-control
        .w-100                                                                    (results area)
          .mt-4.pt-4.text-center  "No logs to display. Please, change the input fields."
      .modal-footer.d-flex.align-items-center.justify-content-end
        div
          button.btn.btn-primary.m-2.align-self-end   → <i.fas.fa-search> "Search"
          button.btn.btn-secondary.m-2.align-self-end[data-bs-dismiss=modal]  "Close"
```

### Field / control inventory

| Control | id | Type | Notes |
|---|---|---|---|
| Refresh rooms | — | `button.btn-info.btn-sm` | inside `<h5>` title; `fa-sync-alt` icon, label "Rooms" |
| Select Traders | `selectTraderDropdown` | Bootstrap dropdown (multi-select) | `data-bs-auto-close="outside"` (stays open for multi-pick); placeholder span `--Select Traders--`; `.dropdown-menu.w-100` of `li > a.dropdown-item` |
| Select Rooms | `selectRoomDropdown` | Bootstrap dropdown (multi-select) | same pattern; placeholder `--Select Rooms--` |
| Search term | `search-term-input` | `input[type=search]` | placeholder "Type your search term"; `aria-describedby=search-term-addon` |
| Non Trade Alert | `checkNonTradeAlert` | `input[type=checkbox]` | label "Non Trade Alert" |
| Also search archives? | `checkArchives` | `input[type=checkbox]` | label "Also search archives?" |
| Start Date | `startDateInput` | `input[type=datetime-local]` | label "Start Date:" |
| End Date | `endDateInput` | `input[type=datetime-local]` | label "End Date:" |
| Search | — | `button.btn-primary` | `fa-search` icon |
| Close | — | `button.btn-secondary[data-bs-dismiss]` | footer |

Trader dropdown items (20, in DOM order): Allison · Big Bad Voodoo Daddy ·
Bruce Marshall · Chris Brecher · Danielle Shay · Heather · Henry · JC ·
Kody Ashmore · Lorna St. George · Melissa Beegle · Mirza Catic · Omer Krdzic
· RH · Sam · ST_Neil · Taylor · TG Watkins · Trendy Jon · CML Alert Bot.
Room dropdown items (3): Showcase Room · Mastering The Trade · Tr3ndy Trading.
Note: there is **no visible "select all"** node in this snapshot — the two
trailing `<!---->` comments after the last `<li>` are where Angular would
inject conditional rows (likely a divider / select-all when populated), but
none rendered. Both menus use `data-bs-auto-close="outside"`, the Bootstrap
idiom for multi-select dropdowns.

Empty/results state: a single centered line `No logs to display. Please,
change the input fields.` inside `.w-100`. Trailing `<!---->` markers show
where the populated results list mounts.

---

## 2. `app-scheduled-alerts-modal` → `ScheduledAlertsModal.svelte`

Source: `files/file25.html`. Dialog is **extra-large** (`.modal-dialog.modal-xl`),
content carries `.text-white`.

### Simplified tree

```
.modal.fade.text-white#scheduledAlertsModal[aria-labelledby=scheduledAlertsModalLabel][aria-hidden=true]
  .modal-dialog.modal-xl
    .modal-content
      .modal-header
        h5#scheduledAlertsModalLabel.modal-title  "Manage Scheduled Alerts"
        button.btn-close.btn-close-white[data-bs-dismiss=modal]
      .modal-body
        table.table.table-striped.text-white.w-100
          thead > tr
            th[scope=col] "Date / Time"
            th[scope=col] "Sender"
            th[scope=col] "Alert"
            th[scope=col] "Repeat"
            th[scope=col] "Actions"
          tbody
            <!---->                  (empty — rows inject here; no empty-state text rendered)
      .modal-footer
        button.btn.btn-primary[data-bs-dismiss=modal]  "Close"
```

### Table shape

5 columns: **Date / Time · Sender · Alert · Repeat · Actions**. Striped
(`.table-striped`), white text, full width. The snapshot's `<tbody>` is
empty (single `<!---->`); there is **no rendered empty-state message** —
the table renders headers with no body rows. Row actions live in the
Actions column but are not present in this empty snapshot (Edit/Delete
inferred from the column name + Simpler conventions). Footer = single
primary **Close** button (note: primary, not secondary).

---

## 3. `app-alert-send-report-modal` → NEW `AlertSendReportModal.svelte`

Source: `files/file26.html`. Default-width dialog. Captured in its
**loading** state (the report content has not resolved yet).

### Simplified tree

```
.modal.fade#alert-send-report-modal[role=dialog][aria-labelledby=alert-send-report-modal][aria-hidden=true]
  .modal-dialog[role=document]
    .modal-content
      .modal-header
        h5  "Alert Sent Report. AlertID:"            (the alert id is appended after the colon at runtime)
        button.btn-close.btn-close-white[data-bs-dismiss=modal]
      .modal-body
        .text-center.my-4
          h5 > <i.ml-2.fas.fa-spinner.fa-spin> "Loading..."
        <!----><!----><!----><!---->                 (4 conditional blocks: the resolved report sections mount here)
      .modal-footer.text-center
        button.btn.btn-secondary[data-bs-dismiss=modal]  "Close"
```

### Layout (loading + inferred resolved sections)

- **Title**: `Alert Sent Report. AlertID: <id>` — the AlertID is
  concatenated onto the title string.
- **Loading state** (what the snapshot shows): centered `<h5>` with a
  spinning `fa-spinner` and the text "Loading...".
- **Resolved state**: four `<!---->` placeholders in `.modal-body`
  correspond to four conditional report sections that mount once the
  send-report API resolves. Based on the modal's name and Simpler's
  send-report UI, these are the delivery summary (total sent), the
  delivery-stats / pie chart (delivered vs failed vs pending), and the
  per-recipient / per-channel breakdown. **None of these are present in
  this snapshot** — only the count (4) and their mount order are known.
- **Footer**: centered, single secondary **Close** button.

This is a read-only report modal — no form controls at all.

---

## 4. `app-alert-filter-modal` → `AlertFilterModal.svelte`

Source: `files/file29.html`. Default-width dialog.

### Simplified tree

```
.modal.fade#alert-filter-modal[role=dialog][aria-labelledby=alert-filter-modal][aria-hidden=true]
  .modal-dialog[role=document]
    .modal-content
      .modal-header
        h5  "Filter out alerts from the following:"
            (two <!----> between "Filter out" and "alerts…" → a dynamic word, e.g. allow/block mode, injects here)
        button.btn-close.btn-close-white[data-bs-dismiss=modal]
      .modal-body.pt-1
        .form-check.m-2
          input#show-alerts[type=checkbox][value=""].form-check-input
          label[for=show-alerts].form-check-label  "Only show alerts from these people:"
        p  "List is empty."                          (empty state)
        <!----><!---->                               (people list rows inject here)
      .modal-footer.d-flex.align-items-center.justify-content-between
        button.btn.btn-secondary[data-bs-dismiss=modal]  "Close"
        <!---->                                       (a second footer button — e.g. Save/Add — conditionally renders here)
```

### Controls

| Control | id | Type | Notes |
|---|---|---|---|
| Allow/blocklist toggle | `show-alerts` | `input[type=checkbox]` | label "Only show alerts from these people:" — when checked, the list becomes an **allowlist** (only these), unchecked = **blocklist** (the title "Filter out … alerts from the following"). The two `<!---->` in the title swap a mode word. |

- **People list**: rendered as `<p>List is empty.</p>` when empty;
  populated rows mount at the trailing `<!---->` markers (one per person).
- **Footer**: `justify-content-between` with a secondary **Close** on the
  left and a trailing `<!---->` on the right for a conditional second
  button (likely Save/Add-person).

---

## Divergences from current pro-room implementations

### AdvancedSearchModal.svelte
1. **Trader/Room pickers are `<select multiple>` in pro-room, Bootstrap
   dropdowns (`button.dropdown-toggle` + `ul.dropdown-menu` of
   `a.dropdown-item`) in the original.** Original placeholders are
   `--Select Traders--` / `--Select Rooms--` with `data-bs-auto-close="outside"`
   multi-pick behavior; pro-room uses native multi-selects with size=3.
2. **Missing the "Rooms" refresh button inside the title** (`fa-sync-alt`,
   `btn-info.btn-sm`) — pro-room title is plain text.
3. **Checkbox labels differ**: pro-room "Non-Trade Alert" / "Include
   archives" vs original "Non Trade Alert" / "Also search archives?".
4. **Search term**: pro-room `input[type=text]` placeholder
   "e.g. $SPX, breakout, trim"; original `input[type=search]` placeholder
   "Type your search term".
5. **Date labels**: pro-room "Start"/"End" vs original "Start Date:"/"End Date:".
6. **Layout**: original is 2 flex rows (dropdowns+search on row 1,
   checks+dates on row 2); pro-room is a vertical stack with 2-col grids.
7. **Footer**: original has both **Search** (primary) and **Close**
   (secondary); pro-room footer has only Search (Close comes from the
   shared Modal). Empty-results copy differs: original "No logs to display.
   Please, change the input fields." vs pro-room "No results." / hint.

### ScheduledAlertsModal.svelte
1. **Title**: original "Manage Scheduled Alerts" vs pro-room "Scheduled Alerts".
2. **Dialog width**: original is `modal-xl`; pro-room Modal is default width.
3. **Column header label**: original "Date / Time" (spaced) vs pro-room "Date/Time".
4. **Empty state**: original renders the table headers with an **empty
   `<tbody>` and no message**; pro-room shows a ClockIcon + "No scheduled
   alerts." card and hides the table. (pro-room's UX is arguably better;
   flagged as a deliberate divergence.)
5. Row Edit/Delete actions match the inferred original intent — OK.

### AlertFilterModal.svelte
1. **Title**: original "Filter out alerts from the following:" (with a
   dynamic mode word slot) vs pro-room "Filter out alerts".
2. **Checkbox label**: original "Only show alerts from these people:"
   (trailing colon) vs pro-room "Only show alerts from these people".
3. **Empty state**: original is a plain `<p>List is empty.</p>`; pro-room
   shows a FunnelSimpleIcon empty card with list dimming.
4. **Footer**: original `justify-content-between` with Close + a conditional
   second button; pro-room has a single "Done" button.

### AlertSendReportModal.svelte (NEW — not yet built)
- Must be created. Read-only report modal, default width. Title
  `Alert Sent Report. AlertID: <id>`. Loading state = centered spinner +
  "Loading...". Resolved state = 4 sections (delivery summary, delivery-stats
  pie chart, recipient/channel breakdown) — exact internal markup NOT in the
  snapshot, so build from the inferred section list and confirm against a
  populated capture before wiring real data. Footer = centered secondary Close.
