# file2.html modal extraction (Simpler Trading / ProTradingRoom — Angular 17 snapshot)

Clean DOM extraction of 7 modal/overlay components from
`/Users/billyribeiro/Desktop/pro-room/pro-room/files/file2.html`.
Angular cruft (`_nghost*`, `_ngcontent*`, `ng-star-inserted`,
`ng-reflect-*`, empty `<!---->`) stripped. Real tags, `class`, `id`,
`role`, `aria-*` preserved. Icons are FontAwesome (`fa fa-*`,
`fas/far fa-*`).

---

## 1. `<app-poll-modal>` (lines 18528–18759)

A **floating panel** (not a Bootstrap `.modal`) with a custom titlebar
that has minimize / maximize / close window controls. Body is a
two-tab interface: "Create New Poll" and "Pre-Canned Polls".

### Markup tree

```
div#pollModalCompHolder.pollModalHolder
  div#pollPanelTitlebar.poll-panel-titlebar
    span.poll-panel-title            "Polls"
    div.poll-panel-controls
      button.poll-panel-btn          title="Minimize"  > i.fa.fa-window-minimize
      button.poll-panel-btn          title="Maximize"  > i.fa.fa-window-maximize
      button.poll-panel-btn.poll-panel-btn-close  aria-label="Close" title="Close" > i.fa.fa-times
  div.poll-panel-body (style="display:block")
    div.row
      ul#nav-tab.nav.nav-tabs  role="tablist"
        li.nav-item > a#sendpolltab.nav-link.active  data-bs-target="#sendpoll"  "Create New Poll"
        li.nav-item > a.nav-link              data-bs-target="#savedPolls" "Pre-Canned Polls"
      div.tab-content.w-100.p-2
        div#sendpoll.tab-pane.active  role="tabpanel"
          div.p-2
            h3 > span.label.label-warning "1"  + "Enter your poll question:"
            input#pollQuestionTxt.form-control  type=text
                placeholder="Main poll question (i.e. Where do you think the market is going?)"
            hr
            h3 > span.label.label-warning "2"  + "Add Choices/Answers:"
            div.input-group
              input#pollChoiceTxt.form-control  type=text
                  placeholder="Enter a choice (i.e. Up, Down, Sideways)"
              span.input-group-btn > button.btn.btn-outline-light
                  i.fa.fa-plus-circle + "Add Choice"
            ol            (dynamic list of added choices — empty in snapshot)
            hr
            h3 > span.label.label-warning "3"  + "When done editing, Send your poll"
            div.anonymous-poll-container
              input#anonymous-poll.form-check-input  type=checkbox  name="anonymous-poll" title="Anonymous Poll"
              label[for=anonymous-poll].form-check-label
                  "Anonymous Poll (Does not show the voting name/email, just results)"
            div.poll-panel-footer
              button.btn.btn-outline-light.pull-right  > i.fa.fa-floppy-o + "Save To Canned"
              button.btn.btn-success.centered.float-right  "Send Poll"
        div#savedPolls.tab-pane  role="tabpanel"
          p  "You can store polls you use often here. Just type the poll on the create poll tab and press \"save\""
          ul.list-group  (dynamic saved polls — empty in snapshot)
```

### Form fields & controls

| Control | id / name | Type | Label / text |
|---|---|---|---|
| Poll question | `pollQuestionTxt` | text input | "Enter your poll question:" |
| Choice entry | `pollChoiceTxt` | text input | "Add Choices/Answers:" |
| Add Choice | — | button | "Add Choice" (fa-plus-circle) |
| Anonymous toggle | `anonymous-poll` | checkbox | "Anonymous Poll (Does not show the voting name/email, just results)" |
| Save To Canned | — | button | fa-floppy-o |
| Send Poll | — | button (btn-success) | "Send Poll" |
| Titlebar | — | 3 window buttons | Minimize / Maximize / Close |

### pro-room counterpart → `PollModal.svelte` / `PollPanel.svelte`

### Notable differences
- **Two-tab layout**: "Create New Poll" + "Pre-Canned Polls" (saved/canned
  polls library). Confirm both tabs exist in our PollPanel.
- **Windowed chrome**: minimize / maximize / close (a draggable floating
  panel, not a centered overlay). Our PollModal should support the
  panel/dock chrome rather than a plain modal if we want parity.
- **Numbered step labels** (1/2/3 `label-warning` badges) guide the flow.
- **"Save To Canned"** button persists a poll template — separate action
  from "Send Poll".
- Choices are added one-at-a-time via an input-group + Add Choice button,
  rendered into an `<ol>` (each presumably removable — list empty here).

---

## 2. `<app-alert-logs-modal>` (lines 82158–82268)

Standard Bootstrap modal listing alert-log entries (one per session/day).

### Markup tree

```
div#alerts-logs-modal.modal.fade  role="dialog" aria-labelledby="alerts-logs-modal" aria-hidden="true"
  div.modal-dialog  role="document"
    div.modal-content
      div.modal-header
        h5  "Alerts Logs"
        button.btn-close.btn-close-white  data-bs-dismiss="modal" aria-label="Close"
      div.modal-body
        button.btn.btn-primary.my-2  "Reload Log List"
        div.list-group
          div.list-group-item.list-group-item-action          (repeated per log)
            div > strong.fw-bold  "Oct 22, 2023"
            div > strong.fw-bold "By:" + i "admin@protradingroom.com"
          ... (e.g. "Oct 15, 2023")
      div.modal-footer.text-center
        button.btn.btn-secondary  data-bs-dismiss="modal"  "Close"
```

### Controls

| Control | Type | Text |
|---|---|---|
| Reload Log List | button (btn-primary) | "Reload Log List" |
| Log entry | clickable list-group-item | date (bold) + "By: <email>" |
| Close (header) | btn-close | — |
| Close (footer) | button | "Close" |

### pro-room counterpart → `AlertLogsModal.svelte` (exists at `web/src/lib/components/modals/AlertLogsModal.svelte`)

### Notable differences
- Each log row shows **date + author email** ("By: admin@…"). Confirm our
  list renders the author, not just the date.
- A **"Reload Log List"** action re-fetches. Clicking a row presumably
  loads that log's detail (the giant chat-logs modal handles the detail
  view).

---

## 3. `<app-alert-qa-modal>` (lines 82516–82688)

Bootstrap modal (`data-backdrop="static"`, `data-keyboard="false"`) showing
the alert being discussed, the list of questions, and a chat-style
composer in the footer.

### Markup tree

```
div#alertQAModal.fade.modal  data-backdrop="static" data-keyboard="false" aria-labelledby="alertQALabel"
  div.modal-dialog
    div.modal-content
      div.modal-header.align-items-start
        div.flex-fill
          h5#alertQALabel.modal-title  "Q&A for Alert:"
          div.admin-alert.mt-2                       (the alert being Q&A'd)
            div.avatar > img  (gravatar)
            span.created-at                          (timestamp)
            strong.username                          (author)
            div.msg-left.text-formated.preText       (alert message body)
        button.btn-close.btn-close-white  data-bs-dismiss="modal" aria-label="Close"
      div.modal-body
        div.my-2  "There are no questions."          (empty state; otherwise Q list)
      div.modal-footer.flex-nowrap
        div#textAreaHolder.textSendDiv.flex-fill
          textarea#textAreaQATxt.txt-area.form-control  name="txt-area" rows=1
              placeholder="Type your question here..."
          div.textAreaBtnsCol
            span.textAreaBtns > i.far.fa-smile     (tooltip "Add Emojis")
            span.textAreaBtns > i.fas.fa-image     (tooltip "Upload an Image")
```

### Form fields & controls

| Control | id / name | Type | Label / text |
|---|---|---|---|
| Question composer | `textAreaQATxt` / `txt-area` | textarea (rows=1) | placeholder "Type your question here..." |
| Emoji picker | — | icon button | far fa-smile, tooltip "Add Emojis" |
| Image upload | — | icon button | fas fa-image, tooltip "Upload an Image" |
| Close | — | btn-close | — |

### pro-room counterpart → `AlertQaModal.svelte`

### Notable differences
- Header **embeds the source alert** (avatar, username, timestamp, formatted
  body) — the Q&A is rendered in context of the alert.
- Empty state copy: **"There are no questions."**
- Composer has **emoji picker + image upload** affordances (no visible
  explicit "Send" button — send is likely Enter-to-submit). Our
  AlertQaModal currently uses ask/list/resolve; confirm it surfaces the
  alert context block and the emoji/image composer buttons.
- `static` backdrop + no keyboard-escape close (force interaction).

---

## 4. `<app-screenshare-preview>` (lines 82806–82884)

NOT a modal — a **draggable + resizable floating card** showing the local
screen-share preview (`<video>`), with jQuery-UI resize handles on all 8
edges/corners.

### Markup tree

```
div#screenshareLocalPreviewHolder.card.webcamsHolderScreen.ui-draggable.ui-draggable-handle.ui-resizable
  div.card-body
    h5.card-title.m-0
      div.dropdown (ngbDropdown)
        button#dropdownBasic1.dropdown-toggle.btn.btn-outline-dark   (source/quality menu — empty)
        div.dropdown-menu  aria-labelledby="dropdownBasic1"
      span.float-right.p-2 > i.fas.fa-times              (close preview)
    video#webcamScreenLocalPreview.webcamPreviewScreen  autoplay
  div.ui-resizable-handle.ui-resizable-n  (… e, s, w, ne, se, sw, nw — 8 handles)
```

### Controls

| Control | id | Type | Purpose |
|---|---|---|---|
| Source dropdown | `dropdownBasic1` | dropdown toggle | choose share source/quality |
| Close | — | icon (fas fa-times) | stop/hide preview |
| Video | `webcamScreenLocalPreview` | `<video autoplay>` | live screen preview |
| Resize handles | — | 8 jQuery-UI handles | n/e/s/w/ne/se/sw/nw |

### pro-room counterpart → `ScreenStage.svelte` / `WebcamHolder.svelte`

### Notable differences
- It is **draggable and resizable** (jQuery-UI `ui-draggable` +
  `ui-resizable` with 8 handles). In Svelte we'd implement drag/resize
  ourselves (or via an action) on `WebcamHolder`.
- Has a **dropdown menu** in the card title (likely screen-source / quality
  picker) and a **close (×)** in the top-right.
- Self-contained `card` chrome — mirror in WebcamHolder's floating variant.

---

## 5. `<app-alert-send-report-modal>` (lines 83087–83150) — NEW component

Simple Bootstrap modal showing delivery/send report for a given alert.
Snapshot shows only the loading state.

### Markup tree

```
div#alert-send-report-modal.modal.fade  role="dialog" aria-labelledby="alert-send-report-modal"
  div.modal-dialog  role="document"
    div.modal-content
      div.modal-header
        h5  "Alert Sent Report. AlertID:"
        button.btn-close.btn-close-white  data-bs-dismiss="modal" aria-label="Close"
      div.modal-body
        div.text-center.my-4
          h5 > i.fas.fa-spinner.fa-spin + "Loading..."     (report content renders here)
      div.modal-footer.text-center
        button.btn.btn-secondary  data-bs-dismiss="modal"  "Close"
```

### Controls

| Control | Type | Text |
|---|---|---|
| Close (header) | btn-close | — |
| Close (footer) | button | "Close" |

### pro-room counterpart → NEW `AlertSendReportModal.svelte` (does not yet exist)

### Notable differences
- Title carries the **AlertID** ("Alert Sent Report. AlertID: <id>").
- Body is **async-loaded** (spinner shown in snapshot); the real content is
  a delivery report (who the alert was sent to / push/email status). The 4
  empty `<!---->` siblings after the loader are the resolved-state branches.
- No form fields — read-only report + Close.

---

## 6. `<app-alerts-advanced-search>` (lines 83219–83685)

Large Bootstrap modal for searching the alert archive by trader, room,
term, flags, and date range. Header has a "Rooms" refresh button.

### Markup tree

```
div#alerts-advanced-search-modal.modal.fade  role="dialog" aria-labelledby="alerts-advanced-search-modal"
  div.modal-dialog
    div.modal-content
      div.modal-header
        h5  "Alerts Advanced Search"
          button.btn.btn-info.btn-sm.mx-1 > i.fas.fa-sync-alt + "Rooms"   (refresh rooms list)
        button.btn-close.btn-close-white  data-bs-dismiss="modal"
      div.modal-body
        div (row 1: selectors + search term)
          div (left group)
            div.dropdown.dropdown-trader-select
              button#selectTraderDropdown.btn.btn-light.dropdown-toggle  data-bs-auto-close="outside"
                  span "--Select Traders--"
              ul.dropdown-menu.w-100
                li > a.dropdown-item  "Allison" / "Big Bad Voodoo Daddy" / "Bruce Marshall" /
                    "Chris Brecher" / "Danielle Shay" / "Heather" / "Henry" / "JC" /
                    "Kody Ashmore" / "Lorna St. George" / "Melissa Beegle" / "Mirza Catic" /
                    "Omer Krdzic" / "RH" / "Sam" / "ST_Neil" / "Taylor" / "TG Watkins" /
                    "Trendy Jon" / "CML Alert Bot"
            div.dropdown.dropdown-room-select
              button#selectRoomDropdown.btn.btn-light.dropdown-toggle  data-bs-auto-close="outside"
                  span "--Select Rooms--"
              ul.dropdown-menu.w-100
                li > a.dropdown-item  "Showcase Room" / "Mastering The Trade" / "Tr3ndy Trading"
          input#search-term-input.form-control  type=search name="search-term-input"
              placeholder="Type your search term"  aria-describedby="search-term-addon"
        div (row 2: flags + dates)
          div
            div.form-check > input#checkNonTradeAlert[checkbox] + label "Non Trade Alert"
            div.form-check > input#checkArchives[checkbox] + label "Also search archives?"
          div.date-input-container
            div > label[for=startDateInput] "Start Date:" + input#startDateInput  type=datetime-local
            div > label[for=endDateInput]   "End Date:"   + input#endDateInput    type=datetime-local
        div.w-100
          div.mt-4.pt-4.text-center  "No logs to display. Please, change the input fields."   (results area)
      div.modal-footer.d-flex.justify-content-end
        button.btn.btn-primary > i.fas.fa-search + "Search"
        button.btn.btn-secondary  data-bs-dismiss="modal"  "Close"
```

### Form fields & controls

| Control | id / name | Type | Label / text |
|---|---|---|---|
| Refresh rooms | — | button | "Rooms" (fa-sync-alt) |
| Trader filter | `selectTraderDropdown` | multi-select dropdown | "--Select Traders--" (20 traders) |
| Room filter | `selectRoomDropdown` | multi-select dropdown | "--Select Rooms--" (3 rooms) |
| Search term | `search-term-input` | search input | placeholder "Type your search term" |
| Non Trade Alert | `checkNonTradeAlert` | checkbox | "Non Trade Alert" |
| Search archives | `checkArchives` | checkbox | "Also search archives?" |
| Start Date | `startDateInput` | datetime-local | "Start Date:" |
| End Date | `endDateInput` | datetime-local | "End Date:" |
| Search | — | button (btn-primary) | "Search" (fa-search) |
| Close | — | button | "Close" |

### pro-room counterpart → `AdvancedSearchModal.svelte` (exists at `web/src/lib/components/modals/AdvancedSearchModal.svelte`)

### Notable differences
- **Two multi-select dropdowns** (traders, rooms) with `data-bs-auto-close="outside"`
  (checkbox-style multi-select that stays open). Trader/room lists are
  dynamic; the snapshot enumerates 20 traders and 3 rooms.
- **Two filter checkboxes**: "Non Trade Alert" and "Also search archives?".
- **datetime-local** start/end date pickers (date + time, not date-only).
- Header has an inline **"Rooms" refresh** button (re-fetch room list).
- Empty results copy: "No logs to display. Please, change the input fields."

---

## 7. `<app-alert-filter-modal>` (lines 83686–83762)

Small Bootstrap modal to filter the live alert feed to a chosen set of
people (an allowlist).

### Markup tree

```
div#alert-filter-modal.modal.fade  role="dialog" aria-labelledby="alert-filter-modal"
  div.modal-dialog
    div.modal-content
      div.modal-header
        h5  "Filter out alerts from the following:"
        button.btn-close.btn-close-white  data-bs-dismiss="modal"
      div.modal-body.pt-1
        div.form-check
          input#show-alerts[checkbox] + label[for=show-alerts] "Only show alerts from these people:"
        p  "List is empty."          (people list / allowlist — empty in snapshot)
      div.modal-footer.d-flex.justify-content-between
        button.btn.btn-secondary  data-bs-dismiss="modal"  "Close"
```

### Form fields & controls

| Control | id | Type | Label / text |
|---|---|---|---|
| Show-only toggle | `show-alerts` | checkbox | "Only show alerts from these people:" |
| People list | — | dynamic list | "List is empty." when none |
| Close | — | button | "Close" |

### pro-room counterpart → `AlertFilterModal.svelte` (exists at `web/src/lib/components/modals/AlertFilterModal.svelte`)

### Notable differences
- Title text is split/dynamic: "Filter out … alerts from the following:"
  (the two empty `<!---->` between "out" and "alerts" are an ngIf branch —
  likely toggles between "Filter out" vs "Only show" wording).
- The **`show-alerts` checkbox flips the mode** between allowlist
  ("Only show alerts from these people") and blocklist ("Filter out").
- People list renders when populated; empty state is "List is empty."
- Footer is `justify-content-between` (an Apply/Save button likely sits on
  the left when the list is non-empty — only Close present in snapshot).
