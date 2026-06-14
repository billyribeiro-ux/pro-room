# file2.html — MainStage / Chat / Webcam DOM extraction

Source: `files/file2.html` (Simpler Trading Angular 17 rendered snapshot).
All Angular cruft (`_nghost*`, `_ngcontent*`, `ng-star-inserted`,
`ng-reflect-*`, empty `<!---->`) has been stripped. Icons are
Font Awesome (`fas fa-*`); pro-room uses `phosphor-svelte` (`*Icon`).

Snapshot state at capture:
- Screens tab = **active**, showing the empty "No one is presenting" state.
- Notes tab populated with 8 named notes; first note ("Welcome") active.
- Files tab present but **empty** (Files/Images/Sounds counts all `0`, no rows).

---

## 1. MainStage tab bar  (`<app-presentationarea>`, lines 12596–12745)

Top-level Bootstrap tab switcher. Four tabs, `Streams` is `hidden`.

```html
<ul id="mainTabs" role="tablist" class="nav nav-tabs mainTabset">
  <li role="presentation" class="nav-item">
    <a id="screens-tab" data-bs-toggle="tab" data-bs-target="#screens"
       role="tab" aria-controls="screens" aria-selected="true"
       class="nav-link active">
      <div class="d-flex"><div>
        <i class="fas fa-desktop"></i><span class="ml-1">Screens</span>
      </div></div>
    </a>
  </li>

  <li role="presentation" class="nav-item" hidden>   <!-- Streams: hidden -->
    <a id="streams-tab" data-bs-toggle="tab" data-bs-target="#streams"
       role="tab" aria-controls="streams" aria-selected="false"
       class="nav-link" tabindex="-1">
      <div class="d-flex"><div>
        <i class="fas fa-podcast"></i><span class="ml-1">Streams</span>
      </div></div>
    </a>
  </li>

  <li role="presentation" class="nav-item">
    <a id="notes-tab" data-bs-toggle="tab" data-bs-target="#notes"
       role="tab" aria-controls="notes" aria-selected="false"
       class="nav-link presAreaTabs-notes" tabindex="-1">
      <div class="d-flex align-items-center"><div>
        <i id="noteChangeIndicator" class="fas fa-edit"></i>
        <span class="mx-1">Notes</span>
      </div></div>
    </a>
  </li>

  <li role="presentation" class="nav-item">
    <a data-bs-toggle="tab" data-bs-target="#files"
       role="tab" aria-controls="files" aria-selected="false"
       class="nav-link" tabindex="-1">
      <div class="d-flex align-items-center"><div>
        <i class="fas fa-folder"></i><span class="mx-1">Files</span>
      </div></div>
    </a>
  </li>
</ul>

<div id="mainTabsContent" class="tab-content"> ... panes ... </div>
```

Tab → icon → target map:

| Tab | id | target | icon | active in snapshot |
|---|---|---|---|---|
| Screens | `screens-tab` | `#screens` | `fa-desktop` | yes |
| Streams | `streams-tab` | `#streams` | `fa-podcast` | hidden |
| Notes | `notes-tab` | `#notes` | `fa-edit` (`#noteChangeIndicator`) | no |
| Files | (none) | `#files` | `fa-folder` | no |

Active tab carries `class="nav-link active"` + `aria-selected="true"`;
inactive ones add `tabindex="-1"`.

---

## 2. Screens view  (`#screens`, lines 12751–12782)

Empty / not-presenting state. **No zoom or volume controls render in
this snapshot** — they only appear once a stream/screen is active
(`#screenTabs` and `#screensTabsContent` are empty here). The
container scaffolding to reproduce:

```html
<div id="screens" role="tabpanel" aria-labelledby="screens-tab"
     class="tab-pane fade active show">
  <h3 class="text-center mt-4">No one is presenting right now...</h3>

  <!-- per-presenter screen tabs (empty when nobody presents) -->
  <ul id="screenTabs" role="tablist" class="nav nav-tabs screens-tabs"></ul>
  <div id="screensTabsContent" class="tab-content"></div>
</div>
```

Sibling `#streams` pane (hidden) mirrors this:
`<h3>No one is streaming right now...</h3>` + `#streamsTabs` +
`#streamsTabsContent`.

> Zoom (`fa-search-plus`/`fa-search-minus`) and volume
> (`fa-volume-*`) controls were NOT present in the captured DOM —
> reconstruct them on the live presenter tile, not the empty state.
> The presentation area also holds a hidden global audio element:
> `<audio id="mp3player" autoplay src=""></audio>` (line 16300).

---

## 3. Notes view  (`#notes`, lines 12815–16161)

### 3a. Named-note tab row (`#notesTabs`, lines 12822–13090)

Horizontal tab row, one `<li>` per note. The first note is the
"Welcome Mat" and carries a green home badge. Each note name is an
inner `<a class="editName">` (double-click to rename) preceded by a
hidden `fa-pen` edit indicator (`#noteUpd-<id>`).

```html
<ul id="notesTabs" role="tablist" class="nav nav-tabs noteTabset">

  <!-- Welcome Mat (active, default note) -->
  <li role="presentation" class="nav-item">
    <a data-bs-toggle="tab" role="tab" aria-selected="true"
       class="nav-link active"
       id="652765a0e494735aa53574ba-tab"
       aria-controls="652765a0e494735aa53574ba">
      <div class="d-flex align-items-center"><div>
        <span class="badge badge-success mx-1 p-0"
              placement="bottom"
              ngbtooltip="This note is the Welcome Mat, and will be shown by default when noboby is presenting">
          <i class="fas fa-home"></i>
        </span>
        <i class="fas fa-pen mx-1" style="display:none"
           id="noteUpd-652765a0e494735aa53574ba"></i>
        <a class="editName mx-1" placement="bottom"
           tooltip="Double-Click to rename note tab">Welcome</a>
      </div></div>
    </a>
  </li>

  <!-- subsequent notes: same shape minus the home badge -->
  <li role="presentation" class="nav-item">
    <a data-bs-toggle="tab" role="tab" aria-selected="true"
       class="nav-link"
       id="665874b2692d34204762bb73-tab"
       aria-controls="665874b2692d34204762bb73">
      <div class="d-flex align-items-center"><div>
        <i class="fas fa-pen mx-1" style="display:none"
           id="noteUpd-665874b2692d34204762bb73"></i>
        <a class="editName mx-1">JC's Daily Briefing</a>
      </div></div>
    </a>
  </li>
  <!-- ... -->
</ul>
```

Note names captured (in order): **Welcome**, **JC's Daily Briefing**,
**Henry's Workflowy Notes**, **Sam's Mag 7 index**, **Taylor's
Scorecard Rankings (6/02 CLOSE)**, + more (8 total). Only the Welcome
tab has `nav-link active` + the `badge-success` home badge.

### 3b. Note content area + Download (lines 13091–13191)

Each note's body is rendered inside `<app-note>` (raw HTML note
content — images, links). Below it is the note options bar with the
green Download button.

```html
<div id="notesTabsContent" class="tab-content">
  <div role="tabpanel" class="tab-pane fade show active"
       aria-labelledby="652765a0e494735aa53574ba-tab"
       id="652765a0e494735aa53574ba">

    <div class="note-container">
      <app-note>
        <!-- arbitrary rendered note HTML, e.g. -->
        <p><a href="https://www.simplertrading.com/ai-trading" target="_blank">
          <img src="https://cdn1.protradingroom.com/uploads/images/..._Welcome_Mat_....png"
               style="width:100%"
               data-filename="2026 Q2 JC Intel Welcome Mat 1050X461 - v2 (1).png">
        </a></p>
      </app-note>
    </div>

    <div class="noteOptions d-flex align-items-center justify-content-between">
      <div>
        <button type="button" title="Download Note"
                class="btn btn-sm noteDownload mr-3">
          <i class="fas fa-download mr-2"></i>Download
        </button>
      </div>
    </div>
  </div>
  <!-- one tab-pane per note -->
</div>
```

> No explicit version-history affordance found in the captured DOM.
> The only per-note action is the `noteDownload` button. (The
> `fa-pen`/`editName` "double-click to rename" is editor affordance,
> not version history.)

---

## 4. Files view  (`#files`, lines 16163–16298)

### 4a. Files / Images / Sounds sub-tab bar with counts (16170–16245)

Centered tab bar; each tab is `Label` + red pill badge with a count.

```html
<ul id="myTab" role="tablist"
    class="nav nav-tabs files-tabs d-flex justify-content-center">
  <li role="presentation" class="nav-item">
    <a id="files-tab" data-bs-toggle="tab" role="tab"
       aria-controls="files" aria-selected="true"
       class="nav-link d-flex align-items-center justify-content-between active">
      <span>Files</span>
      <span class="badge rounded-pill bg-danger files-badge">0</span>
    </a>
  </li>
  <li role="presentation" class="nav-item">
    <a id="image-tab" data-bs-toggle="tab" role="tab"
       aria-controls="image" aria-selected="false"
       class="nav-link d-flex align-items-center justify-content-between">
      <span>Images</span>
      <span class="badge rounded-pill bg-danger files-badge">0</span>
    </a>
  </li>
  <li role="presentation" class="nav-item">
    <a id="sounds-tab" data-bs-toggle="tab" role="tab"
       aria-controls="sounds" aria-selected="false"
       class="nav-link d-flex align-items-center justify-content-between">
      <span>Sounds</span>
      <span class="badge rounded-pill bg-danger files-badge">0</span>
    </a>
  </li>
</ul>
```

### 4b. Search box + Refresh (16246–16296)

```html
<div class="mt-3 mb-3 text-center d-flex flex-wrap justify-content-center align-items-center w-75 m-auto">
  <div class="flex-fill mb-1">
    <div class="input-group st-searchbar">
      <input type="text" placeholder="Search files..."
             aria-label="search" aria-describedby="addon-wrapping"
             class="form-control">
      <span id="basic-addon1"
            class="input-group-text st-searchbar-icon btn btn-outline-secondary">
        <i class="fas fa-search"></i>
      </span>
    </div>
  </div>

  <div class="d-flex flex-wrap justify-content-center align-items-center ml-2">
    <button title="Reload list" class="btn mt-2 mr-2 mb-2 st-fileSeeMore">
      Refresh<i class="fas fa-sync ml-2"></i>
    </button>
  </div>
</div>
```

### 4c. File row

> **No file rows present in this snapshot** — all three counts are `0`
> and the list area is empty. The row template (name, size, date,
> green Download) renders dynamically and was not in the captured DOM.
> Reconstruct the row from the design intent: file name + size + date
> + a green (`btn-success`) Download button, paged behind the same
> `st-fileSeeMore` ("See more") affordance reused by Refresh.

---

## 5. Chat panel  (`<app-chat>`, lines 12325–12487)

```html
<app-chat>
  <div class="chat d-flex flex-column h-100" style="overflow-y:hidden">

    <!-- HEADER -->
    <div class="bs-component">
      <nav class="navbar navbar-expand-lg navbar-light chat-nav p-1 chatHeader">
        <a class="navbar-brand ml-1 mr-1"><i class="fas fa-comment"></i></a>

        <ul role="tablist"
            class="nav nav-tabs flex-wrap flex-grow-1 justify-content-center chatTabs">
          <li class="nav-item" role="presentation">
            <a data-bs-toggle="tab" role="tab"
               class="nav-link active" aria-selected="true">Main Chat</a>
          </li>
          <li class="nav-item" role="presentation">
            <a data-bs-toggle="tab" role="tab"
               class="nav-link" aria-selected="false" tabindex="-1">Off Topic</a>
          </li>
        </ul>

        <ul class="nav ml-auto align-items-center">
          <li class="nav-item mx-1">
            <a title="Search" class="nav-link p-0"><i class="fas fa-search"></i></a>
          </li>
          <li class="nav-item dropdown ml-2" style="position:static">
            <a aria-haspopup="true" aria-expanded="false"
               class="nav-link dropdown-toggle p-0">
              <i title="Settings" class="fas fa-cog chat-header-gear"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- MESSAGE LIST HOST (scroller) -->
    <app-roomscroller class="chat-uploaded-img-sm"
        style="overflow-y:scroll; overflow-x:hidden; height:100%">
      <div><!-- messages render here --></div>
    </app-roomscroller>

    <!-- COMPOSER -->
    <div id="textAreaHolder" class="d-flex align-items-center textSendDiv">
      <div class="flex-fill d-flex mx-0">
        <div class="px-0 flex-fill">
          <textarea name="txt-area" id="textAreaTxt" rows="1"
                    spellcheck="true"
                    placeholder="Type your message here.."
                    class="txt-area form-control border-0"></textarea>
        </div>
        <div class="justify-content-center d-flex flex-row align-items-center
                    justify-content-center p-0 m-0 text-center textAreaBtnsCol">
          <span class="textAreaBtns">
            <i class="fas fa-plus" ngbtooltip="Show message options"
               placement="left"></i>
          </span>
        </div>
      </div>
    </div>
  </div>
</app-chat>
```

Notes on the composer:
- Header tabs: **Main Chat** (active) / **Off Topic**; right side has
  a **Search** (`fa-search`) and a **Settings gear** dropdown
  (`fa-cog chat-header-gear`).
- In this snapshot the composer's only button is a single `fa-plus`
  ("Show message options") that expands to the emoji / image / GIF
  options — those individual buttons were **not** expanded in the DOM.
  Reconstruct emoji/image/GIF as the expansion of `textAreaBtns`.

---

## 6. Webcam holder  (`<app-webcam-holder>` / `<app-presenter-cams>`, lines 12524–12588)

Picture-in-picture presenter cams. The holder wraps N
`<app-presenter-cams>` tiles; each tile is a card with a `<video>` and
an overlay carrying the presenter name label + a close (`fa-times`)
control.

```html
<app-webcam-holder>
  <div> <!-- holder -->
    <app-presenter-cams>
      <div class="card webcamsHolder" id="webcamsHolder-">
        <video autoplay class="webcamsHolderVideo" id="webcamVideo-"></video>
        <div class="overlay">
          <h5 class="pNameLabel m-0">
            <span class="closeIcon"><i class="fas fa-times"></i></span>
          </h5>
        </div>
      </div>
    </app-presenter-cams>
    <!-- repeated per presenter cam -->
  </div>
</app-webcam-holder>
```

(`id`/labels are templated — `webcamsHolder-`, `webcamVideo-` get the
presenter id suffix; `pNameLabel` holds the name + close icon.)

---

## 7. Mapping to pro-room Svelte components

| Source DOM | pro-room component | Responsibility |
|---|---|---|
| `#mainTabs` (Screens/Streams/Notes/Files) + `#mainTabsContent` | `MainStage.svelte` | tab switcher shell; hosts the four panes |
| `#screens` empty state + presenter tiles + (live) zoom/volume | `ScreenStage.svelte` | "No one is presenting" empty state; presenter/stream container; zoom + volume on the live tile |
| `#notesTabs` + `#notesTabsContent` (`app-note`, `noteDownload`) | `NotesPanel.svelte` | named-note tab row (home badge on Welcome), note body, per-note Download |
| `#files` (`files-tabs` Files/Images/Sounds + badges, search, Refresh, file rows) | `FilesPanel.svelte` | sub-tab bar w/ counts, search + Refresh, file rows (name/size/date/green Download) |
| `<app-chat>` (header tabs, search, gear, scroller, composer) | `ChatPanel.svelte` | Main/Off-Topic tabs, search, settings, message list, composer + emoji/image/GIF |
| `<app-webcam-holder>` / `<app-presenter-cams>` | `WebcamHolder.svelte` | PiP grid of presenter cam tiles (video + name label + close) |

Icon translation reminder (phosphor-svelte `*Icon` suffix):
`fa-desktop`→`DesktopIcon`, `fa-podcast`→`PodcastIcon`,
`fa-edit`/`fa-pen`→`PencilSimpleIcon`, `fa-folder`→`FolderIcon`,
`fa-home`→`HouseIcon`, `fa-download`→`DownloadSimpleIcon`,
`fa-search`→`MagnifyingGlassIcon`, `fa-sync`→`ArrowsClockwiseIcon`,
`fa-comment`→`ChatCircleIcon`, `fa-cog`→`GearIcon`,
`fa-plus`→`PlusIcon`, `fa-times`→`XIcon`. Verify each with
`grep 'as <Name>Icon }' node_modules/phosphor-svelte/lib/index.d.ts`.
