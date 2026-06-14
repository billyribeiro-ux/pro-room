# `<app-alerts>` — DOM extraction (file2.html lines 683–12315)

Source: `files/file2.html`, Angular 17 rendered snapshot of the Simpler Trading
room. This section is the **Alerts** panel. ~11.6k lines, almost entirely
repeated alert rows (`<app-st-message>`). Angular cruft
(`_nghost*`, `_ngcontent*`, `ng-star-inserted`, `ng-reflect-*`, empty
`<!---->` nodes) is stripped below.

> Key finding: **the Alerts panel is read-only.** There is **no composer**
> (no `<form>`, `<textarea>`, `<input>`, symbol/side fields, or Post button)
> anywhere in lines 683–12315. The panel is header + scroller of messages and
> nothing else. (Composing alerts must happen elsewhere — likely an admin/host
> surface not in this snapshot.)

---

## 1. Simplified markup tree

```html
<app-alerts>
  <div class="chat d-flex flex-column" style="height:100%">

    <!-- HEADER -->
    <div class="bs-component">
      <nav class="navbar navbar-expand-lg navbar-light chat-nav p-1 alertHeader">
        <a class="navbar-brand ml-1"><i class="fas fa-bell me-1"></i> Alerts</a>
        <ul class="nav ml-auto">
          <li class="nav-item mx-1">
            <a title="Search" class="nav-link p-0"><i class="fas fa-search"></i></a>
          </li>
          <li class="nav-item dropdown ml-2" style="position:static">
            <a class="nav-link dropdown-toggle p-0"
               aria-haspopup="true" aria-expanded="false">
              <i title="Settings" class="fas fa-cog chat-header-gear"></i>
            </a>
            <!-- no dropdown-menu rendered in snapshot (closed state) -->
          </li>
        </ul>
      </nav>
    </div>

    <!-- SCROLLER -->
    <app-roomscroller id="chatScrollViewParentAlerts"
                      style="overflow-y:scroll; height:100%">
      <div>
        <app-st-message> … </app-st-message>   <!-- repeated, one per alert -->
        <app-st-message>                         <!-- with day separator variant -->
          <div class="separator"><a>Tuesday, June 9, 2026</a></div>
          <div class="msg-box"> … </div>
        </app-st-message>
        …
      </div>
    </app-roomscroller>
  </div>
</app-alerts>
```

---

## 2. Header controls

| Control | Markup | Notes |
|---|---|---|
| Title | `<a class="navbar-brand"><i class="fas fa-bell"></i> Alerts</a>` | bell icon |
| Search | `<li class="nav-item mx-1"><a title="Search" class="nav-link p-0"><i class="fas fa-search"></i></a>` | icon-only |
| Settings/gear | `<li class="nav-item dropdown"><a class="dropdown-toggle"><i title="Settings" class="fas fa-cog chat-header-gear"></i></a>` | `position:static` so the dropdown spans the panel |

The settings dropdown's **menu items are NOT in the snapshot** (rendered only
on open). Only the toggle is present.

---

## 3. One alert row (`<app-st-message>`)

```html
<app-st-message>
  <!-- optional day separator precedes the first row of a new day -->
  <div class="separator"><a>Tuesday, June 9, 2026</a></div>

  <div class="msg-box pb-1" style="background-color: rgb(215,215,215)">
    <!-- per-row bg tint; rows alternate / are author-themed -->
    <div clas="d-flex flex-column align-items-center w-100"><!-- sic: clas typo in source -->
      <div class="mr-1 d-flex flex-row">

        <!-- LEFT: options menu + avatar -->
        <div class="d-flex justify-content-center align-items-start flex-nowrap mt-1">
          <a role="button" id="dropdownMenuLink" data-bs-toggle="dropdown"
             aria-haspopup="true" aria-expanded="false"
             class="msgMenu dropright pt-1"
             style="color: rgb(215,215,215); filter: invert(1)">⠇</a>
          <div class="dropdown-menu users-dropdown-options"
               aria-labelledby="dropdownMenuLink">
            <a class="dropdown-item"><i class="fas fa-user"></i>&nbsp;&nbsp;User Info</a>
            <a class="dropdown-item"><i class="fas fa-reply"></i>&nbsp;&nbsp;Mention</a>
            <a class="dropdown-item"><i class="fas fa-copy"></i>&nbsp;&nbsp;Copy</a>
          </div>
          <div class="avatar pl-1">
            <img alt="msg.avt" src="https://secure.gravatar.com/avatar/…?d=mm&s=50" />
          </div>
        </div>

        <!-- RIGHT: header line + body -->
        <div class="w-100">
          <div class="d-flex justify-content-between align-items-center w-100">
            <div class="d-flex align-items-center justify-content-between flex-nowrap"
                 style="color: rgb(0,128,64)">
              <strong class="username mx-1"
                      style="color: rgb(215,215,215); filter: invert(1)">
                LornaBot </strong>
            </div>
            <div>
              <!-- Q&A badge: only present when the alert has questions -->
              <button title="Ask a question" class="btn btn-sm btn-secondary me-1 alert-qa"
                      style="color: rgb(0,128,64)">
                <span class="me-1">(1) </span>          <!-- question count -->
                <i class="fas fa-question-circle"></i>
                <span>✅</span>                          <!-- present only when resolved -->
              </button>
              <span class="created-at mr-2"
                    style="color: rgb(215,215,215); filter: invert(1)">6/8/26, 8:00 AM</span>
            </div>
          </div>

          <div class="d-flex">
            <div class="msg-left text-formated preText ml-2 mr-2 p-0"
                 style="color: rgb(0,128,64)">
              Good Morning :) Quick schedule update: …
              <!-- inline link variant -->
              <a href="https://youtu.be/…" target="_blank" class="linkColor"
                 onclick="event.stopPropagation()">https://youtu.be/…</a>
              <!-- embedded chart image variant -->
              <div class="img-container"
                   onclick="openImageModal(event, 'https://cdn1.protradingroom.com/uploads/images/…png')">
                <img class="uploaded-img" src="https://cdn1.protradingroom.com/uploads/images/…png" />
                <br clear="both" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</app-st-message>
```

### Per-row details

- **Author theming.** `msg-box` gets an inline `background-color`. The
  `username`, `created-at`, and `msgMenu` carry that same bg color **plus
  `filter: invert(1)`** so the text inverts to stay readable against the tint
  (a hack — color set to the bg, then inverted). The body
  (`msg-left … preText`) and the header wrapper carry the author's true text
  color (e.g. `rgb(0,128,64)` green). No stars/badges on usernames in this
  snapshot.
- **Avatar.** `<img alt="msg.avt">`, gravatar or imgur/CDN URL. No width/height
  attrs (CLS risk — pro-room should set dimensions).
- **Body whitespace.** `preText` = preformatted; the source wraps every word on
  its own line but it renders as normal flowed text.
- **Ticker handling.** Tickers appear as **plain text** in the body
  (e.g. "SPX", "AAOI") — there is **no cashtag/`$SYMBOL` linkification** in this
  snapshot. Only explicit URLs become `<a class="linkColor">`.
- **Chart image.** Wrapped in `.img-container` with an inline
  `onclick="openImageModal(event, url)"`; the `<img class="uploaded-img">` is
  followed by `<br clear="both">`.

### Options menu items (exact)

| Item | Icon |
|---|---|
| User Info | `fas fa-user` |
| Mention | `fas fa-reply` |
| Copy | `fas fa-copy` |

(Between Mention and Copy there are 6 empty `<!---->` slots — conditional items
like Edit/Delete/Pin that are hidden for the viewer's permission level.)

### Q&A badge

`<button class="alert-qa">` — only rendered on alerts that have questions.
Contents: `<span>(N)</span>` count, `<i class="fas fa-question-circle">`, and an
optional `<span>✅</span>` shown when the Q&A thread is resolved.

---

## 4. Composer

**None.** The Alerts panel has no input/compose UI in this snapshot. See the
finding box at the top.

---

## 5. Empty state

**None present** — the snapshot has many alerts, so no empty-state markup was
rendered.

---

## 6. Mapping to pro-room

pro-room's `web/src/lib/components/AlertFeed.svelte` already mirrors this
structure faithfully:

| Simpler Trading | pro-room `AlertFeed.svelte` | Status |
|---|---|---|
| `.separator` day divider | `.separator-row` / `.separator` + `formatDayLabel` | matches |
| `users-dropdown-options` → User Info / Mention / Copy | `UserIcon` User Info, `ArrowBendUpLeftIcon` Mention, `CopyIcon` Copy (lines 210–216) | matches (Phosphor `*Icon` vs FontAwesome) |
| `username` w/ per-author color | `.username` `style:color={a.author_color ?? var(--username-color)}` | matches |
| `alert-qa` badge `(N)` + `?` + `✅` | `.alert-qa` button + `openQa(a)` + `.qa-check` | matches |
| `created-at` | `<time class="created-at">` `formatStamp` | matches |
| `uploaded-img` / `img-container` openImageModal | (verify image-modal wiring exists) | check |
| `linkColor` URL autolink + `stopPropagation` | (verify body link rendering) | check |

### Structural differences / actions for pro-room

1. **No composer in the real app.** pro-room `AlertFeed.svelte` ships a
   composer (`<input class="sym" placeholder="Symbol">`, `.note`, Post — lines
   ~267–273). The reference Alerts panel is **read-only**. Decide whether
   pro-room intends an authoring affordance the real app lacks, or whether the
   composer belongs on a separate admin surface. If kept, it's a deliberate
   pro-room addition, not a fidelity match.
2. **Header gear dropdown items unknown** — not in snapshot. pro-room's
   settings menu items here are not constrained by this reference.
3. **Author-color readability hack** — Simpler uses `filter: invert(1)` on
   username/timestamp/menu against the row bg tint. pro-room uses explicit
   theme tokens (`--username-color`, separator bg/color vars) — cleaner; no need
   to replicate the invert hack.
4. **Ticker text is not linkified** in the reference — pro-room should not add
   cashtag linking if aiming for fidelity (only explicit URLs link).
5. **Avatar `<img>` has no width/height** in the source (CLS) — pro-room should
   keep explicit dimensions / `aspect-ratio`.
6. `clas="…"` (misspelled `class`) on the flex-column wrapper is a **bug in the
   source** — that class does nothing. Don't copy it.

`AlertsChatDock.svelte` also has `role="separator"` dividers (lines 126, 148)
consistent with the day-separator pattern.
