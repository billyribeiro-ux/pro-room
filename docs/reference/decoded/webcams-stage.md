# Webcams-Stage

Presenter media surface for the "Mastering The Trade" room (lightTheme). Covers the presentation area
container (`app-presentationarea` inside the `presentation-box` split pane), the webcam tiles
(`app-webcam-holder` → `app-presenter-cams` → `.webcamsHolder`), the two draggable/resizable local-preview
cards (`app-screenshare-preview` = file22, `app-rec-preview` = file23), the in-tab `room-video-player`, and
the `speech-reco` captions overlay.

Evidence sources cited inline:
- **BUNDLE** = `docs/reference/live-bundle/main.d6f5272aa3783e43.js` (component templates + `styles:[...]` scoped CSS)
- **GCSS** = `docs/reference/live-bundle/styles.d622cb9ed2bbc221.css` (global Darkly BS4 + BS5 + jQuery-UI)
- **PRES** = `proroom-full-presenter.json` (computed styles + rects)
- **ADMIN** = `proroom-all-admin.json`, **MEMBER** = `docs/reference/captures/proroom-full-member.json`
- **DOM** = `mixed-files/*.html` raw renders (`webcamholder.html`, `afterwebcamholder.html`, `file22.html`, `file23.html`)

Live room tokens (PRES `cssVariables.root`): `--presenter-area-bg = #0f2e43`, `--bs-border-radius = .375rem`,
`--bs-body-bg = #fff`, `--white = #fff`, `--darker-black = #111`, `--light-gray = #ccc`, `--lighter-gray = #eee`,
`--brown = #555`. The room body element carries class `lightTheme` (PRES `elements[].attrs.class` on `app-room`).

---

## DOM structure

### 1. Presentation split pane + presentation area (app-room template)

BUNDLE offset 2488840 (function `B4e`), the `as-split-area` that holds the stage:

```
as-split-area.presentation-box   (const 208; H("size", presAreaSize)("order", orderPresentation()))
├── app-webcam-holder
├── (div 213)  — modMessage && isPresenter  → shown only to presenter
├── app-positions-container — showPositions
├── app-presentationarea      (const 214)
└── (button 215) — sessData.positionsIframe && positionsIframeUrl
```

PRES: `as-split-area.presentation-box` — `class="presentation-box as-split-area"`, `rect {x:383,y:49,w:1018,h:856}`,
`position:relative`, `bottom:0px`.

`app-presentationarea` template root (BUNDLE offset 1991600, const 2): `<div class="mainPresentationAreaHolder">`.
PRES path `as-split#mainAreaSplit > as-split-area.presentation-box:nth-child(2) > app-presentationarea:nth-child(2) > div.mainPresentationAreaHolder`, `rect {x:383,y:49,w:1018,h:856}`.

Empty-state (BUNDLE offset ~1917453, function `eSe`): `<h3 class="text-center mt-4">No one is presenting right now...</h3>`
(const 23 = `[1,"text-center","mt-4"]`). Sibling empty message (function `ZCe`): `<h3 class="text-center mt-4">Video off to preserve data...</h3>`.

### 2. Webcam holder / presenter cams (webcamholder.html, afterwebcamholder.html)

`app-webcam-holder` (BUNDLE offset 2137203, `decls:3,vars:0`, const `[1,"webcam-wrapper","d-flex","justify-content-center","flex-wrap","align-items-end","w-100"]`) renders two `app-presenter-cams` children:

```
app-webcam-holder (_nghost-ng-c654575438)
└── div.webcam-wrapper.d-flex.justify-content-center.flex-wrap.align-items-end.w-100
    ├── app-presenter-cams (_nghost-ng-c4054903792)
    │   └── div.card.webcamsHolder#webcamsHolder-
    │       ├── video.webcamsHolderVideo#webcamVideo-  [autoplay]
    │       └── div.overlay
    │           └── h5.pNameLabel.m-0
    │               └── span.closeIcon
    │                   └── i.fas.fa-times
    └── app-presenter-cams (… identical second tile)
```

- Live ids are suffixed per presenter: `id="webcamsHolder-${pID}"`, `id="webcamVideo-${pID}"` (BUNDLE `initDrag`/`playStream`; in the static dumps the suffix is empty).
- `app-presenter-cams` template (BUNDLE offset 1215730) also renders the presenter's name into `.pNameLabel` (BUNDLE `...,o.pName," "` text interpolation at offset 1216300).
- Structure is **identical across roles** — member, presenter, admin captures all contain `div.card.webcamsHolder` + `video.webcamsHolderVideo` (PRES/ADMIN/MEMBER, 2 tiles each). No role-gated markup on the tiles themselves. The close `×` (`.closeIcon`) exists in every role's DOM.

### 3. Screenshare local preview — draggable/resizable card (file22.html)

`app-screenshare-preview` (BUNDLE offset 2186158, `decls:13,vars:4`). Rendered once, unconditionally, in the
app-room root (BUNDLE offset 2543280, `(26,"app-screenshare-preview")`):

```
app-screenshare-preview (_nghost-ng-c1065544020)
└── div#screenshareLocalPreviewHolder.card.webcamsHolderScreen  [+ live: ui-draggable ui-draggable-handle ui-resizable]
    ├── div.card-body
    │   ├── h5.card-title.m-0
    │   │   ├── div.d-inline-block.dropdown [ngbDropdown]
    │   │   │   ├── button#dropdownBasic1.dropdown-toggle.btn.btn-outline-dark [ngbDropdownToggle]   ← text = presenter name (o.pName)
    │   │   │   └── div.dropdown-menu [ngbDropdownMenu, aria-labelledby=dropdownBasic1]  ← *ngFor screenProducers → ngbDropdownItem buttons
    │   │   └── span.float-right.p-2  (click → closePreview())
    │   │       └── i.fas.fa-times
    │   └── video#webcamScreenLocalPreview.webcamPreviewScreen  [autoplay, srcObject=pStream]
    └── 8× div.ui-resizable-handle.ui-resizable-{n,e,s,w,ne,se,sw,nw}  (style="z-index:90"; injected by jQuery-UI, present only when live)
```

The `ui-draggable`/`ui-resizable` classes + handle divs are added at runtime by jQuery-UI (file22 is a live capture, so they are present; the component template BUNDLE consts do NOT list them).

### 4. Recording preview — draggable card (file23.html)

`app-rec-preview` (BUNDLE offset 2350203, `decls:12,vars:2`). Rendered once in app-room root (BUNDLE offset 2543310, `(27,"app-rec-preview")`):

```
app-rec-preview (_nghost-ng-c3658149680)
└── div#recLocalPreviewHolder.card.recsHolderScreen   [+ live toggles .recsHolderScreen-lg on expand]
    └── div.card-body
        ├── h5.card-title.m-0
        │   ├── div.d-inline-block.p-2.text-white  "Recording Preview. (DELAYED UPTO 20s)"
        │   ├── span.float-right.p-2  (click → closePreview())
        │   │   └── i.fas.fa-times.text-white
        │   └── span.float-right.p-2.mx-1  (click → expandPreview())
        │       └── i.fas.fa-expand.text-white          (expandRecPreview ? fa-compress-arrows-alt : fa-expand)
        ├── (img#recScreenLocalPreview.recPreviewScreen)   ← when isRecording && !isRecordingPaused
        └── div.text-center.py-4.text-white               ← else branch
            └── h4  "Recording paused."
```

Template branch (BUNDLE offset ~2351100): icon = `expandRecPreview ? const8(fa-compress-arrows-alt) : const9(fa-expand)`;
body = `isRecording && !isRecordingPaused ? const10(img.recPreviewScreen) : const11(h4 "Recording paused.")`.

### 5. In-tab video player (room-video-player) — inside #videoplayer tab

BUNDLE offset ~2002129, consts:
- iframe branch: `<iframe class="videoPlayerUrl-iframe" width="100%" height="90%" allow="autoplay; encrypted-media" frameborder="0" allowfullscreen [src]>`
- native branch: `<video class="room-video-player" autoplay playsinline controls [src]>`
- controls: `div.video-player-btns` with `button.btn.btn-primary.m-2.me-4` (title "Play For All", `i.fa.fa-play-circle.mr-2`), `button.btn.btn-danger.btn-sm.m-1` (title "Stop For All", `i.fa.fa-stop-circle.mr-2`), and `i.fas.fa-trash.me-2.text-danger.video-player-delete-btn`.

### 6. Speech-reco / captions overlay (inside mainPresentationAreaHolder)

BUNDLE offset ~2009980 consts + offset 1995467 (`[1,"speech-reco-overlay",3,"history-mode","single-line"]`):

```
div.speech-reco-overlay   [class.history-mode, class.single-line bound]
├── div.speech-reco-body
│   ├── div.speech-reco-text-wrapper  (scroll handler)     ← single-line/live view
│   │   └── div.speech-reco-line
│   │       ├── div.d-flex.align-items-center.position-sticky.top-0
│   │       │   └── i.fas.fa-closed-captioning.speech-reco-icon.me-1
│   │       ├── span.speech-reco-sender
│   │       └── span.speech-reco-text
│   └── div.speech-reco-history  (scroll handler)           ← history-mode view
│       └── div.speech-reco-history-line[.live-entry]
│           ├── div.speech-reco-history-time
│           └── div.speech-reco-history-text
└── div.speech-reco-buttons
    ├── button.speech-reco-history-btn  (title "Full Transcript History" / "Speech Recognition History")
    └── button.speech-reco-close-btn    (title "Close Speech Recognition Overlay", click handler)
```

Overlay `#speechRecoBody` template ref = const 1 `["speechRecoBody",""]`.

---

## Scoped CSS (verbatim)

### app-presenter-cams (BUNDLE offset 1216328, `styles:[...]`)

```css
.webcamsHolder[_ngcontent-%COMP%]{position:absolute;z-index:105;border:1px solid yellowgreen;cursor:move;background-color:#000;width:320px;height:240px;margin:5px}
.webcamsHolderVideo[_ngcontent-%COMP%]{object-fit:contain;position:relative;width:100%;height:100%}
.pNameLabel[_ngcontent-%COMP%]{background-color:#00000080;color:#fff;text-align:center;width:100%}
.overlay[_ngcontent-%COMP%]{position:absolute;top:0;left:0;right:0;z-index:101}
.closeIcon[_ngcontent-%COMP%]{position:absolute;right:5px;z-index:102}
.closeIcon[_ngcontent-%COMP%]:hover{cursor:pointer}
```

### app-webcam-holder (BUNDLE offset 2137467, `styles:[...]`)

```css
.webcam-wrapper[_ngcontent-%COMP%]{position:absolute;bottom:0}
```

### app-screenshare-preview (BUNDLE offset 2187117, `styles:[...]`)

```css
.webcamsHolderScreen[_ngcontent-%COMP%]{width:350px;height:260px;position:fixed;bottom:0;right:0;z-index:100;border:1px solid #fafafa;cursor:move;background-color:#000;display:none}
.webcamsHolderScreen[_ngcontent-%COMP%]   .card-body[_ngcontent-%COMP%]{padding:0;width:100%;height:100%}
.webcamsHolderScreen[_ngcontent-%COMP%]   .card-title[_ngcontent-%COMP%]{padding:5px;font-size:12px}
.webcamsHolderScreen[_ngcontent-%COMP%]   .card-title[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{font-size:12px}
.webcamsHolderScreen[_ngcontent-%COMP%]   .card-title[_ngcontent-%COMP%]   .float-right[_ngcontent-%COMP%]:hover{cursor:pointer}
.pNameLabel[_ngcontent-%COMP%]{position:relative;background-color:#00000080;color:#fff;text-align:center}
.webcamPreviewScreen[_ngcontent-%COMP%]{object-fit:contain;width:100%;max-height:calc(100% - 42px);padding:3px}
.hidden[_ngcontent-%COMP%]{display:none}
```

### app-rec-preview (BUNDLE offset 2351169, `styles:[...]`)

```css
.recsHolderScreen[_ngcontent-%COMP%]{width:350px;height:260px;position:fixed;bottom:265px;right:0;z-index:100;border:1px solid #fafafa;cursor:move;background-color:#000;display:none}
.recsHolderScreen-lg[_ngcontent-%COMP%]{width:700px;height:520px}
.recsHolderScreen[_ngcontent-%COMP%]   .card-body[_ngcontent-%COMP%]{padding:0;width:100%;height:100%}
.recsHolderScreen[_ngcontent-%COMP%]   .card-title[_ngcontent-%COMP%]{padding:5px;font-size:12px}
.recsHolderScreen[_ngcontent-%COMP%]   .card-title[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{font-size:12px}
.recsHolderScreen[_ngcontent-%COMP%]   .card-title[_ngcontent-%COMP%]   .float-right[_ngcontent-%COMP%]:hover{cursor:pointer}
.pNameLabel[_ngcontent-%COMP%]{position:relative;background-color:#00000080;color:#fff;text-align:center}
.recPreviewScreen[_ngcontent-%COMP%]{object-fit:contain;width:100%;max-height:calc(100% - 42px);padding:3px}
.hidden[_ngcontent-%COMP%]{display:none}
```

### app-presentationarea — video-player + speech-reco rules (BUNDLE offset 2015609, `styles:[...]`)

```css
.mainPresentationAreaHolder[_ngcontent-%COMP%]{display:block;width:100%;height:100%;position:relative}
.h-inherit[_ngcontent-%COMP%]{height:inherit}
.room-video-player[_ngcontent-%COMP%]{width:100%;height:100%;object-fit:contain;vertical-align:top;max-height:calc(100vh - 140px)}
.video-player-btns[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{width:100px;padding:2px 4px;font-size:12px}
.video-player-delete-btn[_ngcontent-%COMP%]:hover{opacity:.85;cursor:pointer}
.videoPlayerUrl-iframe[_ngcontent-%COMP%]{width:100%;height:90%}

.speech-reco-overlay[_ngcontent-%COMP%]{position:absolute;bottom:0;left:0;right:0;background-color:#000c;padding:12px 20px;z-index:9999;max-height:40vh;overflow-y:auto;display:flex;flex-direction:row;align-items:center;justify-content:space-between;min-height:48px;gap:12px;pointer-events:auto}
.speech-reco-overlay[_ngcontent-%COMP%]:hover   .speech-reco-close-btn[_ngcontent-%COMP%], .speech-reco-overlay[_ngcontent-%COMP%]:hover   .speech-reco-history-btn[_ngcontent-%COMP%]{opacity:1}
.speech-reco-overlay.history-mode[_ngcontent-%COMP%]{flex-direction:column;align-items:stretch;max-height:60vh;padding:16px 24px;gap:16px}
.speech-reco-overlay.single-line[_ngcontent-%COMP%]{max-height:none}
.speech-reco-body[_ngcontent-%COMP%]{flex:1;display:flex;align-items:center;justify-content:flex-start;min-width:0;overflow:visible}
.speech-reco-overlay.history-mode[_ngcontent-%COMP%]   .speech-reco-body[_ngcontent-%COMP%]{flex-direction:column;align-items:stretch;gap:12px}
.speech-reco-overlay.history-mode[_ngcontent-%COMP%]   .speech-reco-buttons[_ngcontent-%COMP%]{align-self:flex-end;order:-1}
.speech-reco-history[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:8px;overflow-y:auto;overflow-x:hidden;padding-right:8px;max-height:60vh}
.speech-reco-history[_ngcontent-%COMP%]::-webkit-scrollbar{width:8px}
.speech-reco-history[_ngcontent-%COMP%]::-webkit-scrollbar-track{background:#ffffff1a;border-radius:4px}
.speech-reco-history[_ngcontent-%COMP%]::-webkit-scrollbar-thumb{background:#ffffff4d;border-radius:4px}
.speech-reco-history[_ngcontent-%COMP%]::-webkit-scrollbar-thumb:hover{background:#ffffff80}
.speech-reco-history-line[_ngcontent-%COMP%]{display:flex;gap:12px;align-items:baseline;color:#fff;font-size:16px;line-height:1.2}
.speech-reco-history-time[_ngcontent-%COMP%]{font-size:14px;opacity:.7;flex:0 0 auto;width:60px}
.speech-reco-history-text[_ngcontent-%COMP%]{flex:1 1 auto;word-break:break-word}
.speech-reco-history-line.live-entry[_ngcontent-%COMP%]   .speech-reco-history-text[_ngcontent-%COMP%]{font-style:italic;opacity:.9}
.speech-reco-history[_ngcontent-%COMP%], .speech-reco-line[_ngcontent-%COMP%], .speech-reco-history-text[_ngcontent-%COMP%], .speech-reco-line[_ngcontent-%COMP%]   .speech-reco-text[_ngcontent-%COMP%]{pointer-events:none}
.speech-reco-buttons[_ngcontent-%COMP%]{display:none;gap:8px;pointer-events:auto;transition:display .2s ease}
.speech-reco-buttons[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{position:static;opacity:1}
.speech-reco-overlay[_ngcontent-%COMP%]:hover   .speech-reco-buttons[_ngcontent-%COMP%]{display:flex}
.speech-reco-close-btn[_ngcontent-%COMP%], .speech-reco-history-btn[_ngcontent-%COMP%]{background:transparent;border:2px solid #ffffff;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10000;transition:opacity .2s ease,transform .2s ease;font-size:14px;padding:0}
.speech-reco-text-wrapper[_ngcontent-%COMP%]{flex:1;min-width:0;overflow-y:auto;overflow-x:hidden;max-height:3.5em;padding-right:8px}
.speech-reco-text-wrapper[_ngcontent-%COMP%]::-webkit-scrollbar{width:8px}
.speech-reco-text-wrapper[_ngcontent-%COMP%]::-webkit-scrollbar-track{background:#ffffff1a;border-radius:4px}
.speech-reco-text-wrapper[_ngcontent-%COMP%]::-webkit-scrollbar-thumb{background:#ffffff4d;border-radius:4px}
.speech-reco-text-wrapper[_ngcontent-%COMP%]::-webkit-scrollbar-thumb:hover{background:#ffffff80}
.speech-reco-line[_ngcontent-%COMP%]{color:#fff;font-size:22px;font-weight:400;line-height:1.4;word-wrap:break-word;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;display:flex;align-items:flex-start;gap:12px}
.speech-reco-icon[_ngcontent-%COMP%]{font-size:18px;opacity:.8;flex-shrink:0}
.speech-reco-sender[_ngcontent-%COMP%]{font-weight:600;margin-right:8px}
.speech-reco-text[_ngcontent-%COMP%]{font-weight:400}

@media only screen and (max-width:1200px){.speech-reco-line[_ngcontent-%COMP%]{font-size:20px}.speech-reco-icon[_ngcontent-%COMP%]{font-size:18px}}
@media only screen and (max-width:768px){.speech-reco-overlay[_ngcontent-%COMP%]{padding:12px 16px}.speech-reco-line[_ngcontent-%COMP%]{font-size:16px}.speech-reco-icon[_ngcontent-%COMP%]{font-size:14px}}
@media only screen and (max-width:480px){.speech-reco-overlay[_ngcontent-%COMP%]{padding:12px;max-height:30vh}.speech-reco-line[_ngcontent-%COMP%]{font-size:14px;margin-bottom:8px;gap:8px}.speech-reco-icon[_ngcontent-%COMP%]{font-size:12px}}
```

---

## Global CSS (verbatim)

Rules from GCSS that actually win on this surface:

### Bootstrap 5 `.card` (loads after Darkly BS4 → this is the winning `.card`)

```css
.card{--bs-card-border-radius:var(--bs-border-radius);--bs-card-inner-border-radius:calc(var(--bs-border-radius) - (var(--bs-border-width)));--bs-card-cap-padding-y:.5rem;--bs-card-cap-padding-x:1rem;--bs-card-bg:var(--bs-body-bg);position:relative;display:flex;flex-direction:column;min-width:0;height:var(--bs-card-height);color:var(--bs-body-color);word-wrap:break-word;background-color:var(--bs-card-bg);background-clip:border-box;border:var(--bs-card-border-width) solid var(--bs-card-border-color);border-radius:var(--bs-card-border-radius)}
```
(`--bs-border-radius:.375rem` per GCSS `:root`; PRES confirms live value `.375rem`.)

```css
.card-body{flex:1 1 auto;padding:1.25rem}   /* overridden to padding:0 by scoped .webcamsHolderScreen .card-body / .recsHolderScreen .card-body */
.card-title{margin-bottom:.75rem}            /* overridden by .m-0 utility on the h5 */
```

### presentation-box container background (GCSS)

```css
.presentation-box{position:relative;overflow:hidden!important;background-color:var(--presenter-area-bg)}
```
(`--presenter-area-bg:#0f2e43` in the live room; the file-1/pagesource boot default `#111` is overridden.)

### Bootstrap utilities used

```css
.d-inline-block{display:inline-block!important}
.float-right{float:right!important}
.btn-outline-dark{color:#adb5bd;border-color:#adb5bd}
.w-100{width:100%!important}   .m-0{margin:0!important}
```
(`.d-flex`, `.justify-content-center`, `.flex-wrap`, `.align-items-end`, `.text-white`, `.text-center`, `.py-4`, `.mx-1`, `.p-2`, `.mt-4` are standard BS5 utilities from GCSS.)

### jQuery-UI draggable/resizable (GCSS offset ~401079 / ~402021) — applies to screenshare-preview handles

```css
.ui-draggable-handle{touch-action:none}
.ui-resizable{position:relative}
.ui-resizable-handle{position:absolute;font-size:.1px;display:block;touch-action:none}
.ui-resizable-disabled .ui-resizable-handle,.ui-resizable-autohide .ui-resizable-handle{display:none}
.ui-resizable-n{cursor:n-resize;height:7px;width:100%;top:-5px;left:0}
.ui-resizable-s{cursor:s-resize;height:7px;width:100%;bottom:-5px;left:0}
.ui-resizable-e{cursor:e-resize;width:7px;right:-5px;top:0;height:100%}
.ui-resizable-w{cursor:w-resize;width:7px;left:-5px;top:0;height:100%}
.ui-resizable-se{cursor:se-resize;width:12px;height:12px;right:1px;bottom:1px}
.ui-resizable-sw{cursor:sw-resize;width:9px;height:9px;left:-5px;bottom:-5px}
.ui-resizable-nw{cursor:nw-resize;width:9px;height:9px;left:-5px;top:-5px}
.ui-resizable-ne{cursor:ne-resize;width:9px;height:9px;right:-5px;top:-5px}
```

---

## Resolved values

Computed values from PRES (identical structure in ADMIN/MEMBER; tile rects differ only by viewport). All resolved
against the live `lightTheme` room tokens.

| Element | Property | Resolved value | Source |
|---|---|---|---|
| `.presentation-box` (split area) | position / bottom | `relative` / `0px` | PRES computed |
| `.presentation-box` | background-color | `#0f2e43` (`var(--presenter-area-bg)`) | GCSS + PRES root token |
| `.presentation-box` | overflow | `hidden !important` | GCSS |
| `.presentation-box` (presenter) | rect | `x:383 y:49 w:1018 h:856` | PRES |
| `.mainPresentationAreaHolder` | display / position | `block` / `relative` | BUNDLE + PRES |
| `.mainPresentationAreaHolder` | width / height | `100%` / `100%` (computed `1018.42px × 856px`) | PRES |
| `.mainPresentationAreaHolder` | background | `transparent` (rgba(0,0,0,0)) | PRES |
| `.webcam-wrapper` | position / bottom | `absolute` / `0` | BUNDLE scoped |
| `.webcamsHolder` (tile) | position | `absolute` | BUNDLE + PRES |
| `.webcamsHolder` | width / height | `320px` / `240px` | BUNDLE + PRES rect w:320 h:240 |
| `.webcamsHolder` | z-index | `105` | BUNDLE + PRES |
| `.webcamsHolder` | border | `1px solid rgb(154,205,50)` (`yellowgreen`) | BUNDLE + PRES |
| `.webcamsHolder` | border-radius | `6px` (`.375rem`, from BS5 `.card`) | GCSS + PRES |
| `.webcamsHolder` | background-color | `rgb(0,0,0)` (#000) | BUNDLE + PRES |
| `.webcamsHolder` | margin | `5px` (all sides) | BUNDLE + PRES |
| `.webcamsHolder` | cursor | `move` | BUNDLE + PRES |
| `.webcamsHolder` | display | `flex` (from `.card`) | PRES |
| `.webcamsHolder` (presenter tile) | rect | `x:897 y:910 w:320 h:240` | PRES |
| `.webcamsHolderVideo` | object-fit | `contain` | BUNDLE + PRES |
| `.webcamsHolderVideo` | position | `relative` | BUNDLE + PRES |
| `.webcamsHolderVideo` | width / height | `100%` / `100%` (computed `318×238`) | BUNDLE + PRES |
| `.webcamsHolderVideo` | background | `transparent` | PRES |
| `.overlay` | position / top / left / right | `absolute` / `0` / `0` / `0` | BUNDLE scoped |
| `.overlay` | z-index | `101` | BUNDLE scoped |
| `.pNameLabel` (presenter-cams) | background-color | `rgba(0,0,0,.5)` (#00000080) | BUNDLE scoped |
| `.pNameLabel` (presenter-cams) | color | `#fff` | BUNDLE scoped |
| `.pNameLabel` (presenter-cams) | text-align / width | `center` / `100%` | BUNDLE scoped |
| `.closeIcon` | position / right | `absolute` / `5px` | BUNDLE + PRES |
| `.closeIcon` | z-index | `102` | BUNDLE + PRES |
| `.closeIcon` | color | `rgb(255,255,255)` | PRES |
| `.closeIcon` | rect | `x:1197 y:911 w:14 h:24` | PRES |
| `.webcamsHolderScreen` (screenshare) | width / height | `350px` / `260px` | BUNDLE scoped |
| `.webcamsHolderScreen` | position | `fixed` | BUNDLE scoped |
| `.webcamsHolderScreen` | bottom / right | `0` / `0` | BUNDLE scoped |
| `.webcamsHolderScreen` | z-index | `100` | BUNDLE scoped |
| `.webcamsHolderScreen` | border | `1px solid #fafafa` | BUNDLE scoped |
| `.webcamsHolderScreen` | background-color | `#000` | BUNDLE scoped |
| `.webcamsHolderScreen` | display (default) | `none` (shown via jQuery `.show()`) | BUNDLE scoped |
| `.webcamsHolderScreen .card-body` | padding / w / h | `0` / `100%` / `100%` | BUNDLE scoped |
| `.webcamsHolderScreen .card-title` | padding / font-size | `5px` / `12px` | BUNDLE scoped |
| `.webcamPreviewScreen` | object-fit / width | `contain` / `100%` | BUNDLE scoped |
| `.webcamPreviewScreen` | max-height / padding | `calc(100% - 42px)` / `3px` | BUNDLE scoped |
| `.recsHolderScreen` (rec preview) | width / height | `350px` / `260px` | BUNDLE scoped |
| `.recsHolderScreen` | position / bottom / right | `fixed` / `265px` / `0` | BUNDLE scoped |
| `.recsHolderScreen` | z-index | `100` | BUNDLE scoped |
| `.recsHolderScreen` | border | `1px solid #fafafa` | BUNDLE scoped |
| `.recsHolderScreen` | background / display | `#000` / `none` (default) | BUNDLE scoped |
| `.recsHolderScreen-lg` (expanded) | width / height | `700px` / `520px` | BUNDLE scoped |
| `.recPreviewScreen` | object-fit / width / max-height / padding | `contain` / `100%` / `calc(100% - 42px)` / `3px` | BUNDLE scoped |
| `.room-video-player` | width / height / object-fit | `100%` / `100%` / `contain` | BUNDLE scoped |
| `.room-video-player` | max-height | `calc(100vh - 140px)` | BUNDLE scoped |
| `.video-player-btns button` | width / padding / font-size | `100px` / `2px 4px` / `12px` | BUNDLE scoped |
| `.videoPlayerUrl-iframe` | width / height | `100%` / `90%` | BUNDLE scoped |
| `.speech-reco-overlay` | position / bottom / left / right | `absolute` / `0` / `0` / `0` | BUNDLE scoped |
| `.speech-reco-overlay` | background-color | `rgba(0,0,0,.8)` (#000c) | BUNDLE scoped |
| `.speech-reco-overlay` | padding / z-index | `12px 20px` / `9999` | BUNDLE scoped |
| `.speech-reco-overlay` | max-height / min-height | `40vh` / `48px` | BUNDLE scoped |
| `.speech-reco-overlay` | display / flex-direction | `flex` / `row` | BUNDLE scoped |
| `.speech-reco-line` | color / font-size / font-weight | `#fff` / `22px` / `400` | BUNDLE scoped |
| `.speech-reco-line` | font-family | `-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif` | BUNDLE scoped |
| `.speech-reco-icon` | font-size / opacity | `18px` / `.8` | BUNDLE scoped |
| `.speech-reco-sender` | font-weight / margin-right | `600` / `8px` | BUNDLE scoped |
| `.speech-reco-close-btn` / `-history-btn` | size / border / radius | `28×28px` / `2px solid #fff` / `50%` | BUNDLE scoped |
| `.speech-reco-buttons` | display (default) | `none` (→ `flex` on overlay hover) | BUNDLE scoped |

---

## States & effects

- **Webcam tile close-icon hover** — `.closeIcon:hover{cursor:pointer}` (BUNDLE app-presenter-cams). Tile itself is `cursor:move`.
- **Webcam tile drag/resize** — runtime jQuery-UI: `nu('#webcamsHolder-${pID}').draggable({appendTo:'.app-room',containment:'window',cursor:'move',scroll:false,snap:true, stop→saveWebcamPosition}).resizable({handles:'n, e, s, w, ne, se, sw, nw', stop→saveWebcamPosition}).show()` (BUNDLE `initDrag`, offset ~1214690). Position/size persisted to `localStorage` key `webcam-${sessionID}-${name}` and restored via `.css({top,left,width,height})` on init.
- **Screenshare-preview draggable** — file22 shows live `ui-draggable ui-draggable-handle ui-resizable` on `#screenshareLocalPreviewHolder` with 8 handle divs (`style="z-index:90"`); the SE handle carries `ui-icon ui-icon-gripsmall-diagonal-se` and `display:block`. Handle sizes/cursors from GCSS jQuery-UI rules.
- **Screenshare card-title × hover** — `.webcamsHolderScreen .card-title .float-right:hover{cursor:pointer}` (BUNDLE).
- **Rec-preview expand** — `expandPreview()` toggles class `recsHolderScreen-lg` (350×260 → 700×520). On expand, `expandRecPreview` swaps the header icon `fa-expand → fa-compress-arrows-alt`; if the card is off-screen it is nudged (`left:678px` when left>700, `top:415px` when top>520) (BUNDLE offset ~2349850).
- **Rec-preview body toggle** — `isRecording && !isRecordingPaused` shows `img#recScreenLocalPreview.recPreviewScreen`; otherwise shows `<h4>Recording paused.</h4>` (BUNDLE template branch).
- **Hidden-until (default display:none)** — `.webcamsHolderScreen` and `.recsHolderScreen` are `display:none` by default; made visible by jQuery `.show()` when the presenter starts a screenshare / recording. This is why neither appears in the PRES/ADMIN/MEMBER captures.
- **Video-player delete hover** — `.video-player-delete-btn:hover{opacity:.85;cursor:pointer}` (BUNDLE).
- **Speech-reco overlay hover** — `.speech-reco-overlay:hover .speech-reco-buttons{display:flex}` reveals the history + close buttons (hidden `display:none` at rest); `:hover .speech-reco-close-btn`, `:hover .speech-reco-history-btn` set `opacity:1`. Buttons transition `opacity .2s ease, transform .2s ease`.
- **Speech-reco modes** — class `history-mode` switches overlay to column layout (`max-height:60vh`, buttons `order:-1` pinned to top); class `single-line` sets `max-height:none`. Live transcript line uses `.live-entry` (`font-style:italic;opacity:.9`).
- **Custom scrollbars** — `.speech-reco-history` and `.speech-reco-text-wrapper` have styled `::-webkit-scrollbar` (8px, translucent white track/thumb, thumb hover `#ffffff80`).
- **Responsive** — speech-reco line font shrinks `22px → 20px (≤1200) → 16px (≤768) → 14px (≤480)`; overlay max-height drops to 30vh at ≤480px. Presentation area file/tab utilities also have `≤900px` / `≤400px` breakpoints (BUNDLE).
- **No CSS transitions on the tiles themselves** — PRES reports `transition:"all"` (browser default shorthand) with no explicit transition list; movement is jQuery-driven, not CSS.

---

## Behavior

- **Webcam tile close** (`.closeIcon > i.fas.fa-times`) → `closeMe()`: logs "Closing preview...", if it is the local user clears `pStream`; otherwise clears `pStream` and calls `mediaSoupService.hupScreenOfProducer(muser)`, then emits `guiEventBus.emit("removeWebcamPresenter", muser)` (BUNDLE offset ~1214350).
- **Webcam stream playback** — `playStream(e)` sets `#webcamVideo-${pID}.srcObject = stream` and calls `.play()` (BUNDLE). `showWebcams()`/`hideWebcams()` = `nu('#webcamsHolder').show()/.hide()`.
- **Screenshare-preview** — `#dropdownBasic1` (`ngbDropdownToggle`, `.btn.btn-outline-dark`) opens `ngbDropdownMenu` listing `mediaSoupService.screenProducers` (keyvalue pipe → `ngbDropdownItem` buttons, each `click→` select). The button label is the presenter name `o.pName`. The `.float-right` `×` → `closePreview()`. `<video#webcamScreenLocalPreview>` bound `[srcObject]="pStream"` (BUNDLE offset 2186158 template).
- **Rec-preview** — `×` (`.float-right.p-2`) → `closePreview()`; expand (`.float-right.p-2.mx-1`) → `expandPreview()` (BUNDLE offset 2350203 template).
- **Video-player** (in `#videoplayer` tab) — "Play For All" `btn-primary` and "Stop For All" `btn-danger` broadcast playback; `video-player-delete-btn` removes the queued video. Both native `<video controls>` and YouTube-style `<iframe allow="autoplay; encrypted-media" allowfullscreen>` are supported branches (BUNDLE offset ~2001780).
- **Tabs** (main presentation tabset, `#mainTabs.nav.nav-tabs.mainTabset`): Screens (`#screens`, `data-bs-target="#screens"`, `fa-desktop`), Streams (`#streams`, `fa-podcast`), Notes (`#notes`, `fa-edit`, `#noteChangeIndicator`), Files (`#files`, `fa-folder`), Recordings (`#recordings`, `fa-file-video`), Video Player (`#videoplayer`, active). All use Bootstrap `data-bs-toggle="tab"` (BUNDLE consts + afterwebcamholder.html).
- **Speech-reco buttons** — history button title "Full Transcript History" / "Speech Recognition History"; close button title "Close Speech Recognition Overlay" with a click handler; body `scroll` handlers on `.speech-reco-text-wrapper` and `.speech-reco-history` (BUNDLE consts offset ~2009980).
- **Empty stage** — when no presenter: `<h3 class="text-center mt-4">No one is presenting right now...</h3>`; the data-saver branch shows `Video off to preserve data...` (BUNDLE functions `eSe`/`ZCe`).

---

## Honest gaps

- **`.overlay`, `.pNameLabel`, `.webcam-wrapper`, and the custom element hosts** (`app-webcam-holder`, `app-presenter-cams`) are NOT present as individually-styled nodes in the capture `elements[]` arrays — only `div.webcamsHolder`, `video.webcamsHolderVideo`, and `span.closeIcon` were captured with computed styles. Their resolved values above come from the BUNDLE scoped CSS, not from a computed-style capture. (The `.pNameLabel` name text and its exact rendered position are therefore un-verified against a live rect.)
- **Screenshare-preview (`.webcamsHolderScreen`) and rec-preview (`.recsHolderScreen`) computed values are un-captured** — both default to `display:none`, so no capture JSON contains them with rects/computed styles. All values are from BUNDLE scoped CSS + the static DOM dumps file22/file23 (which are live renders but were captured without a computed-style layer). Live drag/resize positions (localStorage-restored) are not evidenced.
- **speech-reco overlay is un-captured** — it does not appear in PRES/ADMIN/MEMBER `elements[]` (only shown while speech recognition is active). All values are BUNDLE scoped CSS; no computed rect or live text sample exists in the evidence.
- **`--presenter-area-bg` value `#0f2e43`** is read from PRES `cssVariables.root`; the boot default in `file-1.html`/`pagesource.html` is `#111` — the live token overrides it, but I did not separately confirm the boot value line.
- **The `webcamsHolderVideo` and `webcamsHolderScreen`/`recsHolderScreen` cards render black (#000) with no visible media** in the captures because no stream was active; actual video content/aspect behavior is inferred from `object-fit:contain` only.
- **`app-presenter-cams` template name interpolation** (`o.pName` into `.pNameLabel`) is confirmed in BUNDLE text nodes, but the exact surrounding markup (whether pName sits before/after the closeIcon span) is not shown in the static webcamholder.html dump (which captured an empty pID with no name text).
