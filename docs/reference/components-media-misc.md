# Simpler Trading — Media & Misc Components (Angular 17 DOM snapshots)

Extracted from rendered Angular snapshots. Angular cruft stripped
(`_nghost*`, `_ngcontent*`, `ng-star-inserted`, `ng-reflect-*`, empty `<!---->`).
Real tags / `class` / `id` / `role` / `aria` preserved. Bootstrap 5 + `ngb*`
dropdowns + Font Awesome + jQuery-UI draggable/resizable are the underlying libs.

---

## 1. `app-screenshare-preview` (file22.html)

Floating, draggable + resizable card holding the **local** screen-share video
plus a source-picker dropdown and a close (X) button.

### Simplified tree
```html
<app-screenshare-preview>
  <div id="screenshareLocalPreviewHolder"
       class="card webcamsHolderScreen ui-draggable ui-draggable-handle ui-resizable">
    <div class="card-body">
      <h5 class="card-title m-0">
        <!-- source-picker dropdown -->
        <div ngbDropdown class="d-inline-block dropdown">
          <button id="dropdownBasic1" ngbDropdownToggle aria-expanded="false"
                  class="dropdown-toggle btn btn-outline-dark"></button>
          <div ngbDropdownMenu aria-labelledby="dropdownBasic1"
               class="dropdown-menu"><!-- source <button> items injected --></div>
        </div>
        <!-- close button -->
        <span class="float-right p-2"><i class="fas fa-times"></i></span>
      </h5>
      <video autoplay id="webcamScreenLocalPreview" class="webcamPreviewScreen"></video>
    </div>
    <!-- jQuery-UI resize handles: 8 directions -->
    <div class="ui-resizable-handle ui-resizable-n"  style="z-index:90"></div>
    <div class="ui-resizable-handle ui-resizable-e"  style="z-index:90"></div>
    <div class="ui-resizable-handle ui-resizable-s"  style="z-index:90"></div>
    <div class="ui-resizable-handle ui-resizable-w"  style="z-index:90"></div>
    <div class="ui-resizable-handle ui-resizable-ne" style="z-index:90"></div>
    <div class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se"
         style="z-index:90;display:block"></div>
    <div class="ui-resizable-handle ui-resizable-sw" style="z-index:90"></div>
    <div class="ui-resizable-handle ui-resizable-nw" style="z-index:90"></div>
  </div>
</app-screenshare-preview>
```

### Controls / chrome
| Element | Purpose |
|---|---|
| `#screenshareLocalPreviewHolder.card` | Drag root — `ui-draggable ui-draggable-handle` (whole card is the drag handle). |
| `button#dropdownBasic1` (`ngbDropdownToggle`) | **Source select** — opens menu of capture sources (button label/items rendered dynamically; empty in snapshot). |
| `.dropdown-menu` | Holds source options. |
| `<span class="float-right p-2"><i class="fas fa-times">` | **Close** the preview. |
| `<video id="webcamScreenLocalPreview" autoplay class="webcamPreviewScreen">` | Local screen-share stream. No `controls`, no `muted` attr in snapshot. |
| 8× `.ui-resizable-handle` (n/e/s/w/ne/se/sw/nw) | jQuery-UI resize grips; only `se` visibly active (`display:block` + grip icon). |

### Map to pro-room
- Closest to **`ScreenStage`** (the shared-screen surface) but the floating /
  draggable / resizable shell is the **`WebcamHolder`** pattern. Reuse
  `WebcamHolder` for the drag+resize chrome and embed a `<video>` for screen.
- **Divergences:** pro-room should not pull in jQuery-UI — implement drag with a
  pointer-based action and resize with CSS `resize` or a single corner handle
  (the `se` grip is the only active one here, so a single bottom-right handle is
  faithful). The Bootstrap `ngbDropdown` source picker maps to a Svelte
  dropdown/`<select>` for choosing the capture source.

---

## 2. `app-rec-preview` (file23.html) — NEW component

Floating card showing a **delayed (~20 s) recording preview**, with expand +
close icons and a paused state.

### Simplified tree
```html
<app-rec-preview>
  <div id="recLocalPreviewHolder" class="card recsHolderScreen">
    <div class="card-body">
      <h5 class="card-title m-0">
        <div class="d-inline-block p-2 text-white">
          Recording Preview. (DELAYED UPTO 20s)
        </div>
        <span class="float-right p-2"><i class="fas fa-times text-white"></i></span>
        <span class="float-right p-2 mx-1"><i class="fas fa-expand text-white"></i></span>
      </h5>
      <div class="text-center py-4 text-white">
        <h4>Recording paused.</h4>
      </div>
      <!-- video element injected when active (absent in paused snapshot) -->
    </div>
  </div>
</app-rec-preview>
```

### Controls
| Element | Purpose |
|---|---|
| Title `div` | Static label "Recording Preview. (DELAYED UPTO 20s)". |
| `<i class="fas fa-times">` | **Close** preview. |
| `<i class="fas fa-expand">` | **Expand / fullscreen** the preview. |
| `.text-center` body | State message — here "Recording paused." (video replaces it when recording). |

Note: `recsHolderScreen` (not `webcamsHolderScreen`) and **no** `ui-draggable` /
`ui-resizable` classes in this snapshot — so it is positioned, not drag/resize.

### Map to pro-room
- **NEW component** (no existing counterpart). Suggest `RecPreview.svelte`
  (sibling of `WebcamHolder`/`ScreenStage`). Needs: title bar with expand+close,
  a state/paused message, and a `<video>` slot for the delayed stream.
- **Divergence:** expand icon implies a fullscreen toggle pro-room must add.

---

## 3. `app-webrtc-troubleshooter` (file30.html) — NEW capture → `ConnectivityCheckModal.svelte`

Bootstrap modal that runs a network/WebRTC connectivity + mic check with a list
of status rows and run/copy/close actions.

### Simplified tree
```html
<app-webrtc-troubleshooter>
  <div id="webrtc-troubleshooter-modal" role="dialog" tabindex="-1"
       aria-labelledby="webrtc-troubleshooter-modal" aria-hidden="true"
       class="modal fade">
    <div role="document" class="modal-dialog" style="max-width:540px">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Connectivity/Mic Troubleshooter</h3>
          <button type="button" data-bs-dismiss="modal" aria-label="Close"
                  class="btn-close btn-close-white"></button>
        </div>
        <div class="modal-body">
          <p class="text-muted mb-4">
            This tool checks your network and connectivity to essential WebRTC servers.
          </p>
          <div class="status-item mb-3">
            <span class="fw-medium">UDP Enabled</span>
            <span class="status-icon pending">●</span>
          </div>
          <div class="status-item mb-3">
            <span class="fw-medium">TCP Enabled</span>
            <span class="status-icon pending">●</span>
          </div>
          <div class="status-item mb-3">
            <span class="fw-medium">STUN Server Connectivity</span>
            <span class="status-icon pending">●</span>
          </div>
          <div class="status-item mb-4">
            <span class="fw-medium">TURN Server Connectivity</span>
            <span class="status-icon pending">●</span>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary"><i class="fas fa-play"></i> Start Test</button>
          <button type="button" class="btn btn-success"><i class="fas fa-copy"></i> Copy Results</button>
          <button type="button" data-bs-dismiss="modal" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</app-webrtc-troubleshooter>
```

### Controls / status indicators
| Element | Purpose |
|---|---|
| 4× `.status-item` | Check rows: **UDP Enabled**, **TCP Enabled**, **STUN Server Connectivity**, **TURN Server Connectivity**. |
| `.status-icon.pending` (`●`) | Per-row state dot. State carried by class — `pending` here; success/fail classes swapped at runtime (colored bullet). |
| `.btn-primary` + `fa-play` | **Start Test** — runs all checks. |
| `.btn-success` + `fa-copy` | **Copy Results** — copies diagnostics to clipboard. |
| `.btn-secondary` (`data-bs-dismiss`) | **Close**. |
| `.btn-close` header | Dismiss (X). |

Note: snapshot shows **no** mic/camera level-meter UI — only the 4 network
checks. "Mic" in the title is aspirational / collapsed; the rendered body is
network connectivity only. Modal width pinned to 540px.

### Map to pro-room
- Maps directly onto **`ConnectivityCheckModal.svelte`**. Model 4 status rows
  with a `status: 'pending' | 'pass' | 'fail'` per check; render a colored dot.
  Footer: Start Test / Copy Results / Close.
- **Divergences:** title says "Mic" but no mic-test UI is present — pro-room can
  either drop "Mic" from the title or add a real mic level meter (gap vs source).
  Use pro-room's own `Modal.svelte` shell instead of Bootstrap `modal fade`.

---

## 4. `app-rich-text-editor` (file31.html) — NEW (notes/message editor; relates to `NotesPanel`)

Bootstrap modal wrapping a **Summernote-style** rich-text editor. The editor
toolbar + editable area are **not in the DOM snapshot** — they are injected by
the editor lib into `#msgTxtContainer` at runtime. Modal title "Rich Text
Editor" + a **Send** action ⇒ this is the compose/notes editor.

### Simplified tree
```html
<app-rich-text-editor>
  <div id="rteModal" tabindex="-1" aria-labelledby="rteLabel" aria-hidden="true"
       class="modal fade">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="rteLabel" class="modal-title">Rich Text Editor</h5>
          <button type="button" data-bs-dismiss="modal" aria-label="Close"
                  class="btn-close btn-close-white"></button>
        </div>
        <div class="modal-body">
          <div id="msgTxtContainer"></div>   <!-- editor (toolbar + contenteditable) injected here -->
        </div>
        <div class="modal-footer">
          <div class="d-flex justify-content-between w-100 align-items-center">
            <button type="button" data-bs-dismiss="modal" class="btn btn-secondary">Close</button>
            <button type="button" class="btn btn-primary"><span>Send</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</app-rich-text-editor>
```

### Controls
| Element | Purpose |
|---|---|
| `#msgTxtContainer` | **Mount point** — editor toolbar (bold/italic/lists/link/etc.) + contenteditable area injected by the RTE lib at runtime. Empty in static snapshot. |
| `.btn-secondary` (`data-bs-dismiss`) | **Close** without sending. |
| `.btn-primary` → `<span>Send</span>` | **Send** the composed content. |
| `.btn-close` header | Dismiss (X). |

### Map to pro-room
- **NEW component** — e.g. `RichTextEditorModal.svelte`. Toolbar + editable area
  need to be built explicitly (the source hides them behind a lib mount). Pairs
  with **`NotesPanel`** as the editor used to compose/edit note content.
- **Divergences:** toolbar buttons are absent from the snapshot — define them
  ourselves (recommend bold/italic/underline/list/link/clear). "Send" framing
  suggests it doubles as a chat-message composer, not purely notes.

---

## 5. `file33.html` — toast container fragment (NOT a component)

```html
<div class="overlay-container" aria-live="polite">
  <div id="toast-container" class="toast-top-right toast-container"></div>
</div>
```
**Identity:** the global **ngx-toastr / toastr notification container** —
`overlay-container` with `aria-live="polite"` wrapping `#toast-container`
(`toast-top-right`). Toasts are injected here at runtime. → maps to pro-room's
toast/notification host (the `toast` store target), **not** a new component.

## 6. `file34.html` — hidden audio sink fragment (NOT a component)

```html
<audio autoplay hidden id="webcam"></audio>
```
**Identity:** a single **hidden auto-playing `<audio id="webcam">` element** —
the WebRTC **remote audio sink** (the element a remote MediaStream's audio track
is attached to). `hidden` + `autoplay`, no controls. → in pro-room this is the
audio output element inside the call/presence plumbing, not a standalone UI
component.

---

## Summary — what's NEW vs existing
| Source component | Pro-room target | New? |
|---|---|---|
| `app-screenshare-preview` | `ScreenStage` + `WebcamHolder` (drag/resize chrome) | existing |
| `app-rec-preview` | `RecPreview.svelte` | **NEW** |
| `app-webrtc-troubleshooter` | `ConnectivityCheckModal.svelte` | existing |
| `app-rich-text-editor` | `RichTextEditorModal.svelte` (+ `NotesPanel`) | **NEW** |
| file33 (toast container) | toast host (`toast` store) | fragment, not a component |
| file34 (`<audio id="webcam">`) | remote-audio sink in call plumbing | fragment, not a component |
