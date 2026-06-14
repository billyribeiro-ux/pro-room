# file6.html — Room Main Area (Angular 17 rendered snapshot)

Source: `files/file6.html` (~13,165 lines). Layout is nested `as-split` panes:
left column = **app-alerts** (top) + **app-chat** (bottom) stacked; right column =
**app-webcam-holder** (presenter cams strip) over **app-presentationarea**
(Screens / Streams / Notes / Files tabs). Each feed scrolls via
**app-roomscroller**; each message row is **app-st-message**.

All Angular cruft stripped below: `_nghost-*`, `_ngcontent-*`,
`ng-star-inserted`, `ng-reflect-*`, empty `<!---->`.

---

## 1. Chat / Alert message bubble — `app-st-message`

Both feeds reuse the SAME `app-st-message` component. There is **no hover
options bar and no inline reaction row** — every per-message action lives in a
Bootstrap dropdown (`msgMenu`, the `⠇` kebab on the far left). The bubble has a
per-message inline `background-color` (alternating greys, e.g. `rgb(232,232,232)`)
and username/timestamp use `filter: invert(1)` so light text reads on the grey.

```html
<app-st-message>
  <div class="msg-box pb-1" style="background-color: rgb(232,232,232);">
    <div class="d-flex flex-column align-items-center w-100">   <!-- note: bug in source, attr is `clas=` -->
      <div class="mr-1 d-flex flex-row">

        <!-- LEFT GUTTER: kebab menu + avatar -->
        <div class="d-flex justify-content-center align-items-start flex-nowrap mt-1">
          <a role="button" id="dropdownMenuLink" data-bs-toggle="dropdown"
             aria-haspopup="true" aria-expanded="false"
             class="msgMenu dropright pt-1" style="filter: invert(1);">⠇</a>
          <div aria-labelledby="dropdownMenuLink"
               class="dropdown-menu users-dropdown-options">
            <a class="dropdown-item"><i class="fas fa-user"></i>&nbsp;&nbsp;User Info</a>
            <a class="dropdown-item"><i class="fas fa-reply"></i>&nbsp;&nbsp;Mention</a>
            <a class="dropdown-item"><i class="fas fa-copy"></i>&nbsp;&nbsp;Copy</a>
            <!-- conditional items: Reply / Delete / Pin appear here for own/mod msgs -->
          </div>
          <div class="avatar pl-1">
            <img alt="msg.avt" src="https://secure.gravatar.com/avatar/…?d=mm&s=50" />
          </div>
        </div>

        <!-- BODY COLUMN -->
        <div class="w-100">
          <!-- header row: username (left) + qa-button + timestamp (right) -->
          <div class="d-flex justify-content-between align-items-center w-100">
            <div class="d-flex align-items-center flex-nowrap" style="color: rgb(0,128,64);">
              <strong class="username mx-1" style="filter: invert(1);"> LornaBot </strong>
              <!-- stars/role-badge slot here (empty in sample) -->
            </div>
            <div>
              <!-- ALERT-Q&A button (alerts feed only) -->
              <button title="Ask a question" class="btn btn-sm btn-secondary me-1 alert-qa">
                <span class="me-1"> (1) </span><i class="fas fa-question-circle"></i>
              </button>
              <span class="created-at mr-2" style="filter: invert(1);">6/8/26, 8:00 AM</span>
            </div>
          </div>

          <!-- body row -->
          <div class="d-flex">
            <div class="msg-left text-formated preText ml-2 mr-2 p-0" style="color: rgb(0,128,64);">
              Good Morning :) Quick schedule update…

              <!-- IMAGE ATTACHMENT + LIGHTBOX (inline, optional) -->
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

Key facts:
- **No reactions, no hover bar, no private-reply UI** rendered in this snapshot.
  Reply/Mention/Copy/User-Info are all dropdown items behind the `⠇` kebab.
- **Alert Q&A**: `button.alert-qa` with a `(n)` count span + `fa-question-circle`
  appears in the header right side (alerts feed). This is the only thing that
  distinguishes an alert row from a chat row structurally.
- **Image lightbox** is a global `onclick="openImageModal(event, url)"` on a
  `.img-container` wrapping `img.uploaded-img` — not an Angular handler.
- Username body text color is a server-driven inline `style="color: rgb(...)"`;
  the bubble bg + username/timestamp invert is the theming trick.

### → pro-room mapping (`ChatPanel.svelte`, `AlertFeed.svelte`)
- We already render avatar (`avatar-img` w/h 36), username, timestamp, body,
  and `m.image_url`. **Divergence:** ours has no kebab `msgMenu` dropdown
  (User Info / Mention / Copy / Reply). Source has NO separate hover-options
  bar to port — consolidate actions into one dropdown to match.
- Source alternates per-message inline bg + `invert(1)`. Ours should NOT copy
  the invert hack; use theme tokens. Just note rows are visually banded.
- `AlertFeed` should keep the `alert-qa` count button in the header-right
  (we already have `AlertQaModal`).

---

## 2. Chat composer — `#textAreaHolder` / `.textSendDiv`

**There is NO `+` "Show message options" expander in this snapshot.** The
emoji / image / GIF controls are always-visible inline buttons to the right of
the textarea. (file2's empty composer is filled by these three `span.textAreaBtns`.)

```html
<div id="textAreaHolder" class="d-flex align-items-center textSendDiv">
  <div class="flex-fill d-flex mx-0">
    <div class="px-0 flex-fill">
      <textarea name="txt-area" id="textAreaTxt" rows="1" spellcheck="true"
                placeholder="Type your message here.."
                class="txt-area form-control border-0"></textarea>
    </div>
    <div class="d-flex flex-row align-items-center text-center textAreaBtnsCol">
      <span class="textAreaBtns" placement="auto" container="body" autoclose="outside"
            popoverclass="popOverDiv">                 <!-- ngbPopover host -->
        <i class="far fa-smile" ngbtooltip="Add Emojis" placement="left"></i>
      </span>
      <span class="textAreaBtns">
        <i class="fas fa-image" ngbtooltip="Upload an Image" placement="left"></i>
      </span>
      <span class="textAreaBtns" style="font-size:12px" ngbtooltip="Search for GIFs"
            triggers="manual" popoverclass="popOverDiv" autoclose="outside">
        <span>GIF</span>
      </span>
      <!-- send is implicit (Enter); no visible paper-plane button -->
    </div>
  </div>
</div>
```

Notes: emoji + GIF open `ngbPopover` panels (`popOverDiv`); image opens a file
picker. No microphone, no caption field, no send button glyph.

### → pro-room mapping (`ChatPanel.svelte`)
- We already have `input[placeholder="Type your message here.."]` + a `GIF`
  button (`button.ic.gif`). **Divergences:** (1) source uses a `<textarea
  rows=1>` (auto-grow), we use `<input>` — switch to textarea for multiline +
  Shift+Enter. (2) Add the always-visible `fa-smile` emoji + `fa-image` upload
  buttons alongside GIF; there is no expander to build. (3) Order is
  emoji → image → GIF.

---

## 3. Notes — `#notes` tab-pane → `#notesTabs` + `app-note`

```html
<div id="notes" role="tabpanel" class="tab-pane">
  <ul id="notesTabs" role="tablist" class="nav nav-tabs noteTabset">
    <li class="nav-item" role="presentation">
      <a data-bs-toggle="tab" role="tab" class="nav-link active"
         id="<noteId>-tab" aria-controls="<noteId>">
        <div class="d-flex align-items-center"><div>
          <!-- Welcome Mat note gets a home badge -->
          <span class="badge badge-success mx-1 p-0"
                ngbtooltip="…Welcome Mat, shown by default when nobody is presenting">
            <i class="fas fa-home"></i></span>
          <i class="fas fa-pen mx-1" style="display:none" id="noteUpd-<noteId>"></i>
          <a class="editName mx-1" tooltip="Double-Click to rename note tab">Welcome</a>
        </div></div>
      </a>
    </li>
    <!-- more tabs: "JC's Daily Briefing", "Henry's Workflowy Notes", … -->
  </ul>

  <div id="notesTabsContent" class="tab-content">
    <div role="tabpanel" class="tab-pane fade show active"
         aria-labelledby="<noteId>-tab" id="<noteId>">
      <div class="note-container">
        <app-note>
          <div id="summernoteEdit-<noteId>">
            <!-- raw Summernote HTML: <p>, <a target=_blank>, <img style="width:100%"> -->
            <p><a href="…ai-trading" target="_blank">
              <img src="https://cdn1.protradingroom.com/uploads/images/…png"
                   style="width:100%" data-filename="… .png" /></a></p>
          </div>
        </app-note>
      </div>
      <div class="noteOptions d-flex align-items-center justify-content-between">
        <div>
          <button type="button" title="Download Note" class="btn btn-sm noteDownload mr-3">
            <i class="fas fa-download mr-2"></i>Download
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
```

Notes content is **trusted server HTML rendered by Summernote** (links open
`target=_blank`, images are CDN-hosted welcome-mat banners). Per-pane footer is
a `.noteOptions` bar with a single **Download** button. First note carries a
`badge-success` home icon = Welcome Mat; tabs are double-click renamable
(`a.editName`).

### → pro-room mapping (`NotesPanel.svelte`)
- Match: tab list of note titles + active pane rendering rich HTML +
  per-pane Download. **Divergences:** add the Welcome-Mat `fa-home` badge on the
  default note; render note body as sanitized server HTML (links `target=_blank
  rel=noopener`, full-width images). Footer Download per pane, not global.

---

## 4. Files — `#files` tab-pane → `#myTab` sub-tabs + search

File list is **empty (0 files)** in this snapshot — no row markup rendered, so
the row shape (name/size/date/Download) is not capturable from file6. Only the
chrome is present:

```html
<div id="files" role="tabpanel" class="tab-pane fade">
  <ul id="myTab" role="tablist" class="nav nav-tabs files-tabs d-flex justify-content-center">
    <li class="nav-item"><a id="files-tab"  data-bs-toggle="tab" class="nav-link … active">
      <span>Files</span><span class="badge rounded-pill bg-danger files-badge">0</span></a></li>
    <li class="nav-item"><a id="image-tab"  data-bs-toggle="tab" class="nav-link …">
      <span>Images</span><span class="badge rounded-pill bg-danger files-badge">0</span></a></li>
    <li class="nav-item"><a id="sounds-tab" data-bs-toggle="tab" class="nav-link …">
      <span>Sounds</span><span class="badge rounded-pill bg-danger files-badge">0</span></a></li>
  </ul>

  <div class="mt-3 mb-3 text-center d-flex flex-wrap justify-content-center w-75 m-auto">
    <div class="flex-fill mb-1">
      <div class="input-group st-searchbar">
        <input type="text" placeholder="Search files..." aria-label="search"
               class="form-control" />
        <span id="basic-addon1" class="input-group-text st-searchbar-icon btn btn-outline-secondary">
          <i class="fas fa-search"></i></span>
      </div>
    </div>
    <div class="d-flex flex-wrap justify-content-center ml-2">
      <button title="Reload list" class="btn mt-2 mr-2 mb-2 st-fileSeeMore">
        Refresh<i class="fas fa-sync ml-2"></i></button>
    </div>
    <!-- file rows render here (empty); a "See more" button toggles via st-fileSeeMore -->
  </div>
</div>

<audio id="mp3player" autoplay="autoplay" src=""></audio>   <!-- sounds tab playback -->
```

Three sub-tabs **Files / Images / Sounds**, each with a red pill count
(`files-badge`). Search bar `input[placeholder="Search files..."]` + magnifier
addon, plus a **Refresh** button (`fa-sync`). A hidden `<audio id="mp3player">`
serves the Sounds tab.

### → pro-room mapping (`FilesPanel.svelte`)
- Match: 3 sub-tabs with count badges, search input, Refresh button.
  **Divergence/TODO:** the file ROW markup (name/size/date/Download) cannot be
  derived from file6 (list was empty) — keep our existing row design; add the
  red `files-badge` per-tab count and the hidden `mp3player` audio element for
  Sounds playback.

---

## 5. presentationarea — main tabs + Screens + cams

```html
<app-presentationarea>
  <div class="mainPresentationAreaHolder">
    <ul id="mainTabs" role="tablist" class="nav nav-tabs mainTabset">
      <li><a id="screens-tab" data-bs-target="#screens" class="nav-link active">
        <i class="fas fa-desktop"></i><span class="ml-1">Screens</span></a></li>
      <li hidden><a id="streams-tab" data-bs-target="#streams" class="nav-link">
        <i class="fas fa-podcast"></i><span class="ml-1">Streams</span></a></li>
      <li><a id="notes-tab" data-bs-target="#notes" class="nav-link presAreaTabs-notes">
        <i id="noteChangeIndicator" class="fas fa-edit"></i><span class="mx-1">Notes</span></a></li>
      <li><a data-bs-target="#files" class="nav-link">
        <i class="fas fa-folder"></i><span class="mx-1">Files</span></a></li>
    </ul>

    <div id="mainTabsContent" class="tab-content">
      <div id="screens" role="tabpanel" class="tab-pane fade active show">
        <h3 class="text-center mt-4">No one is presenting right now...</h3>
        <ul id="screenTabs" role="tablist" class="nav nav-tabs screens-tabs"></ul>
        <div id="screensTabsContent" class="tab-content"></div>
      </div>
      <div id="streams" role="tabpanel" class="tab-pane fade" hidden>
        <h3 class="text-center mt-4">No one is streaming right now...</h3>
        <ul id="streamsTabs" class="nav nav-tabs screens-tabs"></ul>
      </div>
      <!-- #notes (§3), #files (§4) -->
    </div>
    <audio id="mp3player" autoplay src=""></audio>
  </div>
</app-presentationarea>
```

Presenter cam strip (above the tabs, in `app-webcam-holder`):

```html
<app-webcam-holder>
  <div class="webcam-wrapper d-flex justify-content-center flex-wrap align-items-end w-100">
    <app-presenter-cams>                                  <!-- one per presenter -->
      <div class="card webcamsHolder" id="webcamsHolder-<id>">
        <video autoplay class="webcamsHolderVideo" id="webcamVideo-<id>"></video>
        <div class="overlay">
          <h5 class="pNameLabel m-0">
            <span class="closeIcon"><i class="fas fa-times"></i></span>
          </h5>
        </div>
      </div>
    </app-presenter-cams>
  </div>
</app-webcam-holder>
```

State in snapshot: nobody presenting/streaming (empty `screenTabs`/`streamsTabs`
+ "No one is presenting right now..." `h3`). Streams tab is `hidden`. Cams render
two empty `app-presenter-cams` (no `src`, empty `pNameLabel`).

### → pro-room mapping
- `MainStage.svelte` = `mainPresentationAreaHolder` + `#mainTabs`
  (Screens / Notes / Files; Streams hidden). The `notes-tab` has a
  `#noteChangeIndicator` `fa-edit` that flags unseen note edits — port as a dot.
- `ScreenStage.svelte` = `#screens` pane: empty-state `h3` + `screenTabs`
  (one tab per presented screen) + tab content. We have the empty state; add the
  per-screen tab strip.
- `WebcamHolder.svelte` = `webcam-wrapper` of `app-presenter-cams` tiles
  (`card.webcamsHolder` > `video` + `.overlay` with `pNameLabel` + close `X`).
  **Divergence:** ours should render the presenter name in `pNameLabel`
  (empty in snapshot) and a mute/close affordance via `.closeIcon`.
