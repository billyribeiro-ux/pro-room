# Simpler Trading alert/poll components — extracted DOM reference

Source snapshots are Angular 17 rendered HTML (`files/file12.html`,
`file13.html`, `file15.html`). All Angular cruft stripped
(`_nghost*`, `_ngcontent*`, `ng-star-inserted`, `ng-reflect-*`,
empty `<!---->`). Tags / `class` / `id` / `role` / `aria` preserved.
Styling is Bootstrap 5 (`modal`, `nav-tabs`, `form-control`,
`btn`, `input-group`) plus Font Awesome icons.

---

## 1. `app-post-alert-modal` (file12.html) — the real alert composer

A Bootstrap modal (`#alert-modal .modal.fade`, `role="dialog"`,
`aria-labelledby="post-alert"`) → `.modal-dialog` → `.modal-content`.

### Simplified tree

```
.modal#alert-modal[role=dialog]
└ .modal-dialog[role=document]
  └ .modal-content
    ├ .modal-header
    │  ├ h5#post-alert.modal-title  "Post Alert"
    │  └ button.btn-close.btn-close-white[data-bs-dismiss=modal aria-label=Close]
    ├ .modal-body
    │  ├ nav > #nav-tab.nav.nav-tabs[role=tablist]
    │  │   ├ a#nav-tab-text [href=#nav-text, .active]   "Text Alert"
    │  │   ├ a#nav-tab-url  [href=#nav-url]             "Text Url"
    │  │   └ a#nav-tab-img  [href=#nav-img]             "Image / GIF / Video"
    │  └ #nav-tabContent.tab-content
    │     ├ #nav-text  .tab-pane.fade.show.active
    │     │   └ .form-group.mb-3.mt-3
    │     │       textarea.form-control[rows=10, placeholder="Alert Text..."]
    │     ├ #nav-url   .tab-pane.fade
    │     │   ├ .input-group  (prepend <span#addon-url><i.fas.fa-link>)
    │     │   │   input[type=url, placeholder="Link / URL to send to users"]
    │     │   └ .form-group
    │     │       textarea.form-control[rows=2, placeholder="Alert Text..."]
    │     └ #nav-img   .tab-pane.fade
    │         ├ .input-group  (prepend <span#addon-img><i.fas.fa-link>)
    │         │   input[type=url, placeholder="Image or Video Link to show"]
    │         ├ "OR..."
    │         │   label.upload-area[for=fuploadAlert]
    │         │     input#fuploadAlert[type=file, multiple, accept="image/*", hidden]
    │         │     i.fas.fa-file-upload.fa-2x  "Click to select images to upload"
    │         ├ #filedragAlert.filedragMD  "or drop an image here"
    │         ├ #fileListAlert.fileList.text-center   (thumbnails go here)
    │         ├ .clearfix
    │         └ .form-group
    │             textarea.form-control[rows=2, placeholder="Alert Text..."]
    └ .modal-footer
       └ .row.w-100
         ├ .col-12  (checkbox column)
         │   .form-check  input#keepOpenChk          "Keep alert window open?"
         │   .form-check  input#postOnXChk           "Post on X? (tweet)"
         │   .form-check  input#alert-push-label     "Don't send to push notification?"
         │   .form-check  input#alert-non-trade-label "Non-trade alert? (Different Sound)"
         │   .form-check  input#alert-legal-disclosure-label "Add Legal Disclosure?"
         └ .text-right
             button.btn.btn-success   "Post Alert"
```

### Form fields & controls

How alert TYPE is chosen: **3 Bootstrap tabs**, not a select. The
active tab IS the alert type:
- **Text Alert** → single `textarea[rows=10]` only.
- **Text Url** → `input[type=url]` (icon-prepended) + `textarea[rows=2]` note.
- **Image / GIF / Video** → `input[type=url]` (image/video link) **OR**
  a hidden file input (`#fuploadAlert`, `multiple`, `accept=image/*`)
  fronted by a clickable `.upload-area` label, a drop zone
  (`#filedragAlert`), a thumbnail list (`#fileListAlert`), + a
  `textarea[rows=2]` note.

Footer checkboxes (all `.form-check-input`, persistent across tabs):
1. `keepOpenChk` — Keep alert window open?
2. `postOnXChk` — Post on X? (tweet)
3. `alert-push-label` — Don't send to push notification?
4. `alert-non-trade-label` — Non-trade alert? (Different Sound)
5. `alert-legal-disclosure-label` — Add Legal Disclosure?

Send: single `button.btn.btn-success` "Post Alert".

> Note: there is **no symbol / side / ticker / scheduling field** in
> this snapshot — the composer is a free-form note + link/image, and
> the type is the tab. (Ticker styling happens at render time, not
> via a dedicated input. Scheduling lives in a separate
> scheduled-alerts modal, not here.)

---

## 2. `app-poll-modal` (file13.html) — the real poll creator

Not a Bootstrap modal — a **draggable windowed panel**
(`#pollModalCompHolder.pollModalHolder`) with its own titlebar chrome.

### Simplified tree

```
app-poll-modal#pollModalCompHolder.pollModalHolder
├ #pollPanelTitlebar.poll-panel-titlebar
│  ├ span.poll-panel-title  "Polls"
│  └ .poll-panel-controls
│     ├ button.poll-panel-btn[title=Minimize]  i.fa.fa-window-minimize
│     ├ button.poll-panel-btn[title=Maximize]  i.fa.fa-window-maximize
│     └ button.poll-panel-btn.poll-panel-btn-close[title=Close aria-label=Close] i.fa.fa-times
└ .poll-panel-body
   └ .row
     ├ #nav-tab.nav.nav-tabs[role=tablist]
     │   ├ li.nav-item a#sendpolltab[.active, target=#sendpoll]  "Create New Poll"
     │   └ li.nav-item a[target=#savedPolls]                     "Pre-Canned Polls"
     └ .tab-content.w-100.p-2
        ├ #sendpoll .tab-pane.active
        │  └ .p-2
        │     ├ h3  <span.label.label-warning>1</span> "Enter your poll question:"
        │     ├ input#pollQuestionTxt[type=text, placeholder="Main poll question..."]
        │     ├ hr
        │     ├ h3  <span.label.label-warning>2</span> "Add Choices/Answers:"
        │     ├ .input-group
        │     │   input#pollChoiceTxt[type=text, placeholder="Enter a choice..."]
        │     │   span.input-group-btn > button.btn.btn-outline-light
        │     │       i.fa.fa-plus-circle  "Add Choice"
        │     ├ ol   (added choices render as <li> here)
        │     ├ hr
        │     ├ h3  <span.label.label-warning>3</span> "When done editing, Send your poll"
        │     ├ .anonymous-poll-container
        │     │   input#anonymous-poll[type=checkbox, title="Anonymous Poll"]
        │     │   label[for=anonymous-poll] "Anonymous Poll (Does not show the
        │     │                              voting name/email, just results)"
        │     └ .poll-panel-footer
        │        ├ button.btn.btn-outline-light.pull-right  i.fa.fa-floppy-o "Save To Canned"
        │        └ button.btn.btn-success.centered.float-right  "Send Poll"
        └ #savedPolls .tab-pane
           ├ p  "You can store polls you use often here. Just type the
           │     poll on the create poll tab and press 'save'"
           └ ul.list-group   (saved/canned polls render as <li> here)
```

### Form fields & controls

- **Two tabs**: "Create New Poll" (`#sendpoll`, active) and
  "Pre-Canned Polls" (`#savedPolls`).
- Numbered 1/2/3 step layout (`.label.label-warning` badges).
- **1.** `input#pollQuestionTxt[type=text]` — the question.
- **2.** `input#pollChoiceTxt[type=text]` + "Add Choice" button
  (`i.fa.fa-plus-circle`); choices accumulate in an `<ol>`. There is
  **no per-row input** — you type one choice and click Add, repeat.
- **3.** `input#anonymous-poll[type=checkbox]` — Anonymous Poll
  (hides voter name/email, shows results only).
- Footer: **"Save To Canned"** (`i.fa.fa-floppy-o`) +
  **"Send Poll"** (`.btn.btn-success`).
- **Pre-Canned tab**: instructional `<p>` + `ul.list-group` of saved
  polls (reusable, "save" once and re-send later).
- Window chrome: Minimize / Maximize / Close buttons in the titlebar.

---

## 3. `app-alert-logs-modal` (file15.html)

Bootstrap modal (`#alerts-logs-modal.modal.fade`, `role=dialog`).

### Simplified tree

```
.modal#alerts-logs-modal[role=dialog]
└ .modal-dialog > .modal-content
  ├ .modal-header
  │  ├ h5  "Alerts Logs"
  │  └ button.btn-close.btn-close-white[data-bs-dismiss=modal]
  ├ .modal-body
  │  └ div
  │     ├ button.btn.btn-primary.my-2  "Reload Log List"
  │     └ .list-group
  │        └ (repeated) .list-group-item.list-group-item-action
  │             ├ div > strong.fw-bold        "Oct 22, 2023"   (date)
  │             └ div > strong.fw-bold "By: " <i>admin@protradingroom.com</i>
  └ .modal-footer.text-center
     └ button.btn.btn-secondary[data-bs-dismiss=modal]  "Close"
```

Each log entry = a `.list-group-item` with two rows: **date**
(`<strong>`) and **By: <email>** (`<strong>By: </strong><i>email</i>`).
A "Reload Log List" primary button sits above the list; a "Close"
secondary button in the footer.

---

## 4. Mapping to pro-room + divergences

### `app-post-alert-modal` → `web/src/lib/components/modals/PostAlertModal.svelte`

Our component already has 3 tabs (text / url / image) and a free-form
note. Divergences from the real component:

1. **Tab labels/scope.** Theirs: "Text Alert" / "Text Url" /
   "Image / GIF / Video". Ours: "Text" / "Url" / "Image". Their image
   tab explicitly covers GIF/Video too.
2. **URL tab has a note.** Theirs pairs the URL input with a
   `textarea[rows=2]` "Alert Text" note. Ours pairs URL with a
   single-line `Text` caption input (no textarea). The image tab in
   theirs ALSO has a note textarea; ours has none on the image tab.
3. **Real file upload.** Theirs has a working hidden file input
   (`#fuploadAlert`, `multiple`, `accept=image/*`), a drag-drop zone
   (`#filedragAlert`), and a thumbnail list (`#fileListAlert`). Ours
   shows a disabled "Upload image (coming soon)" button only.
4. **Footer checkbox set is incomplete.** Theirs has FIVE: Keep open,
   Post on X (tweet), Don't send to push notification, Non-trade
   alert (Different Sound), Add Legal Disclosure. Ours has only TWO:
   Keep open, Non-trade alert. Missing: Post on X, suppress push,
   Add Legal Disclosure.
5. **Send button is wired to a real POST.** Ours posts
   `{ note }` to `/api/rooms/:id/alerts`; theirs is a static
   `btn-success`. (Our wiring is fine — just noting ours flattens all
   tabs to a single `note` string rather than sending structured
   type/url/image fields + the option flags.)

### `app-poll-modal` → `PollModal.svelte` + `PollPanel.svelte`

`PollModal.svelte` is our create UI; `PollPanel.svelte` is the
voting/results renderer (no real-component equivalent in these
snapshots — it's our own). Divergences in the creator:

1. **No "Pre-Canned Polls" tab.** Theirs is a 2-tab panel (Create New
   Poll / Pre-Canned Polls) with a "Save To Canned" button and a
   saved-polls `list-group`. Ours is **create-only** — no tabs, no
   canned-poll save/reuse. This is the biggest gap.
2. **Choice entry model differs.** Theirs: a single choice input +
   "Add Choice" button appending to an `<ol>`. Ours: a list of
   per-row inputs (2–10), each editable in place, with a Trash remove
   button and an "Add option" button. Ours is more ergonomic but
   structurally different.
3. **Window chrome.** Theirs is a draggable panel with
   Minimize/Maximize/Close titlebar buttons. Ours uses the shared
   `Modal.svelte` (centered overlay, close only) — no min/maximize,
   not draggable.
4. **Layout.** Theirs uses numbered steps (1/2/3 `label-warning`
   badges). Ours uses plain labeled fieldsets.
5. **Footer buttons.** Theirs: "Save To Canned" + "Send Poll". Ours:
   "Cancel" + "Send" (no save-to-canned).
6. **Anonymous toggle** — present in both (parity).

### `app-alert-logs-modal` → `modals/AlertLogsModal.svelte`

Largely matches. Divergences:

1. **No backend.** Ours hard-codes `logs = []` and the Reload button
   is `disabled` (inert). Theirs reloads a real list.
2. **Entry shape.** Theirs renders date + "By: <email>" per
   `.list-group-item`. Ours renders `{date}` + `by {by}` — same two
   fields, fine once wired.
3. **No footer Close button.** Theirs has a `.modal-footer` with a
   secondary "Close". Ours relies on the shared `Modal` header close.
4. Ours adds an empty-state (`BellIcon` + "No logs yet.") not present
   in theirs — acceptable enhancement.
