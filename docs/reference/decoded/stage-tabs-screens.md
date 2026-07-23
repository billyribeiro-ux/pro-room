# Stage Tabs & Screens

Reference decode of the **`app-presentationarea`** component's tab bar and Screens/Streams panes — the "Mastering The Trade" room. Component selector `["app-presentationarea"]`, scoped attr `_ngcontent-%COMP%` (rendered as `_ngcontent-ng-c2028866615` / `-ng-c977335924` depending on build).

> **Token / theme note (read first).** All three captures (`proroom-full-member.json`, `proroom-full-presenter.json`, `proroom-all-admin.json`) report `meta.theme.bodyClass = ""` and `htmlClass = ""` — the room is **NOT** running the `lightTheme` class. The `:root` tokens below are the room's live `:root` (`cssVariables.root`, 294 vars, identical across all three captures). The task named "lightTheme" but the evidence shows the room renders on the base navy `:root`. Every resolved colour below is the actual computed value from the captures, so this does not affect correctness — only the label. This is an honest gap in the premise, flagged per instruction.

---

## DOM structure

Literal tree, decoded from the component `consts` array and `template:function` in `main.d6f5272aa3783e43.js`, cross-checked against the rendered dump `mixed-files/odds-and-ends.html` (member render) and the capture node trees.

Template opcode order (from `template:function(i,o)`): `d(0,"div",2)` = holder → `d(1,"ul",3)` = mainTabs → li/a nodes → `d(36,"div",19)` = mainTabsContent → `#screens` / `#streams` / `#notes` / conditional panes / `#files`.

```
div.mainPresentationAreaHolder                                    (const 2)
├─ ul#mainTabs.nav.nav-tabs.mainTabset [role=tablist]             (const 3; [hidden]=viewerOnlyMode)
│  ├─ li.nav-item [role=presentation]  (click → onMainTabChange('presAreaTabs-screens'))   (const 4; [hidden]=hideScreens)
│  │  └─ a#screens-tab.nav-link [data-bs-toggle=tab, data-bs-target=#screens,             (const 5)
│  │        role=tab, aria-controls=screens, aria-selected=true]  ← ngClass {active: selectedMainTab=='presAreaTabs-screens'}
│  │     └─ div.d-flex (const 6) > div > i.fas.fa-desktop (const 7)  +  span.ml-1 "Screens" (const 8)
│  ├─ li.nav-item  (click → onMainTabChange('presAreaTabs-streams'))                       (const 4; [hidden]=hideStreams)
│  │  └─ a#streams-tab.nav-link [data-bs-target=#streams, aria-controls=streams,          (const 9)
│  │        aria-selected=true]  ← ngClass {active: ...=='presAreaTabs-streams'}
│  │     └─ div.d-flex > div > i.fas.fa-podcast (const 10)  +  span.ml-1 "Streams" (const 8)
│  ├─ li.nav-item  (click → onMainTabChange('presAreaTabs-notes'))                         (const 4; [hidden]=hideNotes)
│  │  └─ a#notes-tab.nav-link.presAreaTabs-notes [data-bs-target=#notes, aria-controls=notes, (const 11)
│  │        aria-selected=false]  ← ngClass {active: ...=='presAreaTabs-notes'}
│  │     └─ div.d-flex.align-items-center (const 12)
│  │        ├─ div > i#noteChangeIndicator.fas.fa-edit (const 13) + span.mx-1 "Notes" (const 14)
│  │        └─ ‹WCe› div.dropdown (const 15)  [*ngIf isP || canEditNotes]                  (see WCe below)
│  ├─ ‹qCe› li#…-tab "Recordings"  fa-file-video   [*ngIf archivesAvailableTo() && recsInRoom]   (const 16/60/61)
│  ├─ ‹KCe› li#…    "VideoPlayer"  fa-video        [*ngIf (hideVideoPlayer && !isP) || isP]       (const 62/63)
│  ├─ ‹YCe› li#…    "Swing Alerts" fa-bell         [*ngIf hasSwingTradeAlerts]                     (const 64/65)
│  ├─ ‹QCe› li#…    "Day Trades"   fa-bell         [*ngIf hasDayTradeAlerts]                       (const 66/65)
│  └─ li.nav-item  (click → onMainTabChange('presAreaTabs-files'))                         (const 4)
│     └─ a.nav-link [data-bs-target=#files, aria-controls=files, aria-selected=false]      (const 17; [hidden]=hideFiles)
│           ← ngClass {active: ...=='presAreaTabs-files'}
│        └─ div.d-flex.align-items-center > div > i.fas.fa-folder (const 18) + span.mx-1 "Files" (const 14)
│        └─ ‹XCe› div  [*ngIf isP]                                                          (const removed in member render)
└─ div#mainTabsContent.tab-content                                                          (const 19)
   ├─ div#screens.tab-pane.fade [role=tabpanel, aria-labelledby=screens-tab]               (const 20)
   │     ← ngClass {'show active': selectedMainTab=='presAreaTabs-screens'} ; [hidden]=hideScreens
   │  └─ div.d-flex.align-items-start.justify-content-center.w-100.h-100                    (const 21)
   │     ├─ ‹JCe› div (customPlayerURL iframe)  [ngIf sessData.customPlayerURL]             (const 21/69)
   │     └─ ‹wSe› (else): h3.text-center.mt-4 "Video off to preserve data..."  [ngIf preferences.disableVideo]
   │              ELSE ‹SSe› screens grid  ↓
   ├─ div#streams.tab-pane.fade [role=tabpanel, aria-labelledby=streams-tab]                (const 22)
   │     ← ngClass {'show active': selectedMainTab=='presAreaTabs-streams'} ; [hidden]=hideStreams
   │  └─ div.text-center.mt-4                                                               (const 23)
   │     ├─ ‹TSe› h3.text-center.mt-4 "Video off to preserve data..."  [ngIf disableVideo]
   │     └─ ‹ISe› (else) streams grid  ↓
   ├─ div#notes.tab-pane   … (Notes surface — out of scope)                                 (const 24)
   ├─ ‹recordings / videoplayer / swingAlerts / dayTradeAlerts panes› (conditional)         (const 25–28)
   └─ div#files.tab-pane.fade … (Files surface — out of scope)                              (const 29)
```

**Screens grid (`SSe`, rendered when presenting; `g(2)` context):**
```
‹eSe› h3.text-center.mt-4 "No one is presenting right now..."  [ngIf screenSharingUsers.length==0]   (const 23)
ul#screenTabs.nav.nav-tabs.screens-tabs [role=tablist]                                                (const 70)
├─ ‹rSe›  li.nav-item  (click → onScreenShareTabChange(screen._id))  *ngFor screenSharingUsers        (const 31)
│    └─ a.nav-link [data-bs-toggle=tab, role=tab, aria-selected=true, id="{_id}-tab",                 (const 74)
│          aria-controls="{_id}"]  ← ngClass {active: selectedScreenShareTab==_id}
│       ├─ ‹tSe› span.mr-2 [tooltip="This is the default screen…", placement=bottom] > i.fas.fa-eye   (const 75/82)  [ngIf forcedScreenID==_id]
│       ├─ ‹nSe› span.mr-2 [tooltip="Unlock this screen?"] (click → toggleLockScreen) > i.fas.fa-lock (const 83/84)  [ngIf lockedScreenID===_id]
│       ├─ img.presenter-img [src=gravatar…?d=mm&s=20]                                                (const 77)
│       ├─ span.mx-1 "{mediaValue.name}-{mediaValue.screenName}"                                      (const 14)
│       └─ div.d-inline-block (const 78)
│          ├─ span#dropdownMenuScreen.dropdown-toggle [data-bs-toggle=dropdown, aria-expanded=false]  (const 79)
│          │     > i.fas.fa-cog                                                                       (const 55)
│          └─ ul.dropdown-menu [aria-labelledby=dropdownMenuButton]                                   (const 56)
│             ├─ ‹iSe› [ngIf isP]:
│             │   ├─ li (click → bringFocusToScreen) > a.dropdown-item[href=#] > i.fas.fa-eye " Bring everyone here"   (const 57/58/82)
│             │   └─ li (click → stopSharingThisScreenRemote) > a.dropdown-item > i.fas.fa-trash-alt " Stop This Screen"(const 85)
│             ├─ li (click → detachScreen) > a.dropdown-item > i.fas.fa-external-link-alt " Detach Screen to a new window" (const 80)
│             └─ li (click → toggleLockScreen) > a.dropdown-item:
│                 ├─ ‹oSe› span[title="Lock this screen?"] > i.fas.fa-lock " Lock Screen"             (const 81/84)  [ngIf lockedScreenID!==_id]
│                 └─ ‹sSe› span[title="Unlock this screen?"] > i.fas.fa-unlock " Unlock Screen"       (const 86/87)  [else]
└─ ‹FSe› li.nav-item.ms-auto   [ngIf screenSharingUsers.length>0]                                     (const 71)  — zoom / volume / capture controls
     └─ div.zoom-controls-container.position-relative (const 88)
        ├─ ‹aSe› div.zoom-controls.position-absolute [ngClass viewer-only-screen-zoom-controls] [ngIf showZoomCtrl]  (const 89)
        │     └─ button.btn.btn-sm.btn-warning ×3 (panZoomIn/Out/Reset): i.fa-search-plus / fa-search-minus / fa-redo (const 102–105)
        ├─ ‹uSe› button#dropdownVolume.btn.btn-sm.btn-dark [data-bs-toggle=dropdown]  [ngIf !viewerOnlyMode]        (const 90)
        │     > i.fa-volume-up|down|off (by audioVolume)  (const 106/107/108)
        │  div.dropdown-menu.volumeControl [aria-labelledby=dropdownVolume]  (const 91)
        │     ├─ h4 "Volume" > span.float-right.mr-2[data-bs-toggle=dropdown] > i.fas.fa-times (const 92/93)
        │     ├─ input.mx-auto.py-2.volCtrl [type=range min=0 max=100 title=Volume] (change/input → adjustVol)  (const 94)
        │     ├─ button.btn.btn-primary.btn-sm "Mute" (click→mute) [ngIf audioVolume>0]   (const 109)
        │     ├─ button.btn.btn-primary.btn-sm "Unmute" (click→unmute) [ngIf audioVolume==0] (const 110)
        │     ├─ hr
        │     └─ div.room-sound-options (talking-users volume rows) [ngIf talkingUsers.length>0]  (const 97)
        ├─ button.btn.btn-sm.btn-dark (click→togglePanZoom) > i.icon.fas.fa-search        (const 98/99)
        ├─ button.btn.btn-sm.btn-dark (click→captureVideoImage) > i.icon.fas.fa-camera    (const 98/100)
        └─ button.btn.btn-sm.btn-dark (click→fullScreenshare):                            (const 98)
              ‹vSe› i.icon.fas.fa-compress-arrows-alt [ngIf isFullScreenshare]  (const 101)
              ‹ySe› i.icon.fas.fa-expand [else]                                 (const 116)
div#screensTabsContent.tab-content [ngClass viewer-only-screen-tab: viewerOnlyMode]        (const 72)
└─ ‹CSe›  div.tab-pane.fade [role=tabpanel, id="{_id}", aria-labelledby="{_id}-tab"]       (const 73)  *ngFor screenSharingUsers
      ← ngClass {'show active': selectedScreenShareTab==_id}
   └─ app-screenshare-view.h-inherit [muser=screen]                                        (const 117)
```

**Streams grid (`ISe`, `g` context; MTX streams):**
```
‹DSe› h3.text-center.mt-4 "No one is streaming right now..."  [ngIf mtxStreams.length==0]  (const 23)
ul#streamsTabs.nav.nav-tabs.screens-tabs [role=tablist]                                     (const 118)
└─ ‹PSe› li.nav-item (click → onStreamTabChange(_id)) *ngFor mtxStreams                     (const 31)
   └─ a.nav-link [id="{_id}-tab", aria-controls="{_id}"] ← ngClass {active: selectedMTXStreamTab==_id}  (const 74)
      ├─ ‹ESe› span.mr-2 > i.fas.fa-eye  [ngIf forcedScreenMTXID==_id]                      (const 75/82)
      ├─ ‹kSe› span.mr-2 (click→toggleLockScreenMTX) > i.fas.fa-lock [ngIf lockedScreenIDMTX===_id]  (const 83/84)
      ├─ span.mx-1 "{mediaValue.name}"                                                      (const 14)
      └─ div.d-inline-block > span#dropdownMenuScreen.dropdown-toggle > i.fas.fa-cog        (const 78/79/55)
         + ul.dropdown-menu (const 56):
            ‹xSe›[ngIf isP] li (click→bringFocusToScreen) > a > i.fa-eye " Bring everyone here"   (const 57/58/82)
            li (click→toggleLockScreenMTX) > a:  ‹MSe› span[title=Lock] i.fa-lock " Lock Screen" | ‹ASe› span[title=Unlock] i.fa-unlock " Unlock Screen"  (const 81/86)
div#streamsTabsContent.tab-content                                                          (const 119)
└─ ‹RSe› div.tab-pane.fade [id="{_id}", aria-labelledby="{_id}-tab"] ← ngClass {'show active': selectedMTXStreamTab==_id}  (const 73)
   └─ app-streaming-view.h-inherit [muser=stream]                                           (const 117)
```

### Role variants
- **member / staff / admin markup is identical** for this surface — visibility of the four extra tabs (Recordings/VideoPlayer/Swing/Day) and the Notes cog is driven by data flags (`isP`, `canEditNotes`, `hasSwingTradeAlerts`, …), not role branches in the template.
- **Screen cog dropdown items** branch on `isP` (presenter): `iSe`/`xSe` ("Bring everyone here", "Stop This Screen") render only for presenters; "Detach Screen" and "Lock/Unlock Screen" render for everyone.
- `#screenTabs` per-screen tabs, the `ms-auto` zoom/volume `<li>`, and the cog dropdown **only exist while someone is actively screensharing** (`screenSharingUsers.length>0`). In every capture the room had 0 sharers, so only the empty h3 + empty `#screenTabs` + empty `#screensTabsContent` were present (see rendered dump below).

Rendered empty-state markup — `mixed-files/odds-and-ends.html` @ `id="screens"`:
```html
<div id="screens" role="tabpanel" aria-labelledby="screens-tab" class="tab-pane fade active show">
  <h3 class="text-center mt-4">No one is presenting right now...</h3>
  <!---->
  <ul id="screenTabs" role="tablist" class="nav nav-tabs screens-tabs"><!----><!----></ul>
  <div id="screensTabsContent" class="tab-content"><!----></div>
  <!----><!----><!----><!---->
</div>
```
Streams pane in the same dump carries `hidden=""` and `<h3 class="text-center mt-4">No one is streaming right now...</h3>`, `ul#streamsTabs.nav.nav-tabs.screens-tabs`. The Streams `<li>` in `#mainTabs` also carries `hidden=""` (`mixed-files/odds-and-ends.html`).

---

## Scoped CSS (verbatim)

From `main.d6f5272aa3783e43.js`, `styles:[…]` array of `app-presentationarea` (`[_ngcontent-%COMP%]` = component scope). Only rules touching this surface:

```css
.mainPresentationAreaHolder[_ngcontent-%COMP%]{display:block;width:100%;height:100%;position:relative}

#screens[_ngcontent-%COMP%], #screens[_ngcontent-%COMP%]   .tab-pane.active[_ngcontent-%COMP%],
#streams[_ngcontent-%COMP%], #streams[_ngcontent-%COMP%]   .tab-pane.active[_ngcontent-%COMP%],
#mainTabsContent[_ngcontent-%COMP%], #notes[_ngcontent-%COMP%], #notesTabsContent[_ngcontent-%COMP%]{height:100%}

#streamsTabsContent[_ngcontent-%COMP%], #screensTabsContent[_ngcontent-%COMP%]{height:calc(100% - 82px)}

.h-inherit[_ngcontent-%COMP%]{height:inherit}

.zoom-controls-container[_ngcontent-%COMP%]{background-color:transparent;z-index:10;opacity:.5;margin-top:4px}
.zoom-controls[_ngcontent-%COMP%]{top:-33px;left:-33px}

.presenter-img[_ngcontent-%COMP%]{max-width:20px}

.hidden[_ngcontent-%COMP%]{display:none}

/* screen cog dropdown menus */
.screen-options[_ngcontent-%COMP%]{background-color:var(--white);font-size:16px;color:var(--darker-black);width:300px;padding:5px}
.screen-options[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{text-decoration:none}
.screen-options[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:hover{color:var(--brown);background-color:var(--lighter-gray)}
.screen-presenters[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]{font-size:14px}
.screen-presenters[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]{padding-top:4px;padding-bottom:4px}
.screen-presenters[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]{vertical-align:middle;padding-right:5px}
.screen-presenters-cmb[_ngcontent-%COMP%]{color:#fff!important;background-color:#363f45;border-color:#363f45;border-radius:3px}

/* per-screen volume dropdown */
.volumeControl[_ngcontent-%COMP%]{text-align:center;color:var(--light-gray);background-color:var(--darker-black);border:1px solid #fafafa}
.volCtrl[_ngcontent-%COMP%]{background-color:var(--darker-black);height:32px;width:129px}
.volumeControl[_ngcontent-%COMP%]   input[type=range][_ngcontent-%COMP%]::-moz-range-progress{background-color:#0d6efd;border-color:#0d6efd;height:8px;border-radius:3px}
.volumeControl[_ngcontent-%COMP%]   input[type=range][_ngcontent-%COMP%]::-moz-range-thumb{background-color:#0d6efd;border-color:#0d6efd;height:13px;width:13px}
#dropdownVolume[_ngcontent-%COMP%]{width:31px}
#dropdownVolume[_ngcontent-%COMP%]:after{display:none}
.room-sound-options[_ngcontent-%COMP%]{text-align:left;padding-left:30px}
.video-player-delete-btn[_ngcontent-%COMP%]:hover, .room-sound-options[_ngcontent-%COMP%]   .form-check-label[_ngcontent-%COMP%]:hover{opacity:.85;cursor:pointer}
```

> Note: `#screens .tab-pane.active` and `#streams .tab-pane.active` get `height:100%` — this targets the inner per-screen/per-stream `.tab-pane` (const 73), NOT the `#screens` pane itself. `#screensTabsContent`/`#streamsTabsContent` are `height:calc(100% - 82px)` (the 82px accounts for the empty h3 + screenTabs bar above).

---

## Global CSS (verbatim)

From `styles.d622cb9ed2bbc221.css`. Only rules that actually win for this surface:

```css
/* --- mainTabset / screens-tabs tab bar (app-specific, high specificity) --- */
.screens-tabs .nav-link,.mainTabset .nav-link,.noteTabset .nav-link{padding:.5rem;font-size:12px;line-height:12px;margin:5px;color:var(--tabs-color)}
.mainTabset .nav-link,.noteTabset .nav-link{padding:.5rem;font-size:12px;line-height:12px}
.screens-tabs .nav-link{padding:4px}
.files-tabs,.mainTabset,.noteTabset{border-color:transparent;display:flex;align-items:center;justify-content:center}
.screens-tabs{border-color:transparent;position:relative;z-index:1}

.screens-tabs .nav-link.active,.files-tabs .nav-link.active,.mainTabset .nav-link.active,.noteTabset .nav-link.active{background-color:var(--tab-active-bg);border-color:transparent;border-radius:3px;color:var(--note-tabs-color)}
.screens-tabs,.files-tabs,.noteTabset,.mainTabset #presAreaTabs-notes.active,.mainTabset .nav-item.show #presAreaTabs-notes{background-color:var(--notes-tabs-bg)}
.mainTabset .presAreaTabs-notes.active,.mainTabset .nav-item.show .presAreaTabs-notes{border-color:var(--tabs-border-color);border-bottom:transparent;padding-bottom:15px;margin-bottom:-1px;border-radius:3px 3px 0 0;background-color:var(--notes-tabs-bg)}

.screens-tabs .nav-link:hover,.files-tabs .nav-link:hover,.mainTabset .nav-link:hover,.noteTabset .nav-link:hover{border:1px solid var(--tabs-border-color);border-radius:3px}

.mainTabset .nav-link a.dropdown-toggle,.noteTabset .nav-link .btn{padding:0 .5rem;font-size:12px;line-height:12px;color:var(--note-tabs-color)}

.screens-tabs .dropdown-menu,.mainTabset .dropdown-menu,.noteTabset .dropdown-menu{background-color:var(--archives-dropdown-menu-bg-color);color:var(--tabs-dropdown-color);border:none}
.screens-tabs .dropdown-menu .dropdown-item,.mainTabset .dropdown-menu .dropdown-item,.noteTabset .dropdown-menu .dropdown-item{color:var(--tabs-dropdown-color);font-size:15px}

/* --- fullscreen + viewer-only screenshare (applied via ngClass) --- */
.is-fullscreenshare{position:fixed;z-index:1030!important;width:100vw!important;height:100vh!important;top:0;left:0;background:#111;overflow:hidden}
.viewer-only-screen-tab{height:100%!important;max-height:calc(100vh - 40px)!important;padding-bottom:5px}
.viewer-only-screen-zoom-controls{top:33px!important;left:-3px!important}

/* --- Bootstrap 4 Darkly base (winning cascade order) --- */
.nav{display:flex;flex-wrap:wrap;padding-left:0;margin-bottom:0;list-style:none}
.nav-link{display:block;padding:.5rem 2rem}            /* overridden by .mainTabset .nav-link padding:.5rem */
.nav-tabs{border-bottom:1px solid #444}
.tab-content>.tab-pane{display:none}
.tab-content>.active{display:block}
.fade{transition:none}                                  /* Darkly kills the BS fade */
[hidden]{display:none!important}
.h3,h3{font-size:calc(1.3rem + .6vw)}

/* dropdown base (only where the app rule above doesn't override bg) */
.dropdown-menu{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:10rem;padding:.5rem 0;margin:.125rem 0 0;font-size:.9375rem;color:#fff;text-align:left;list-style:none;background-color:#222;background-clip:padding-box;border:1px solid #444;border-radius:.25rem}
.dropdown-item{display:block;width:100%;padding:.25rem 1.5rem;clear:both;font-weight:400;color:#fff;text-align:inherit;white-space:nowrap;background-color:transparent;border:0}
.dropdown-toggle:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:"";border-top:.3em solid;border-right:.3em solid transparent;border-bottom:0;border-left:.3em solid transparent}
```

---

## Resolved values

Live `:root` tokens (identical in member, presenter, admin captures — `cssVariables.root`):
`--tabs-color:#fff` · `--tab-active-bg:#45a2ff` · `--note-tabs-color:#fff` · `--notes-tabs-bg:#0c2434` · `--tabs-border-color:#0a6db1` · `--archives-dropdown-menu-bg-color:#0e3651` · `--tabs-dropdown-color:#45a2ff` · `--white:#fff` · `--darker-black:#111` · `--light-gray:#ccc` · `--lighter-gray:#eee` · `--brown:#555`.

Computed values from captures (rect/style). Member+presenter+admin agree where all present; source noted per row.

| Element | Property | Resolved value | Source |
|---|---|---|---|
| `.mainPresentationAreaHolder` | display / width / height / position | block / 100% / 100% / relative | scoped CSS |
| `ul#mainTabs.mainTabset` | display / height | flex / **40px** (member/presenter), 41px (admin @dpr2) | presenter `#mainTabs` rect+style; admin `tab:Screens` |
| `ul#mainTabs` | background / color / justify | transparent / rgb(204,204,204) / center | presenter capture `#mainTabs` style |
| `a#screens-tab.nav-link` (inactive) | font-size / line-height / color / padding / margin | 12px / 12px / rgb(204,204,204) `--tabs-color` / .5rem / 5px | presenter `#screens-tab` style; global `.mainTabset .nav-link` |
| `a#screens-tab.nav-link.active` | background / color | **rgb(69,162,255)** `--tab-active-bg #45a2ff` / rgb(255,255,255) | admin `tab:Screens` → `screens-tab` |
| `a#screens-tab.active` | border-radius / margin-top | 3px / 5px | global `.mainTabset .nav-link.active`; admin rect y=54 |
| `a#notes-tab.nav-link.presAreaTabs-notes.active` | background / color / position / z-index | **rgb(12,36,52)** `--notes-tabs-bg #0c2434` / #fff / relative / 10 | presenter `#notes-tab` style (Notes active state) |
| `a#notes-tab.presAreaTabs-notes.active` | border / border-radius / padding-bottom / margin-bottom | 1px solid `--tabs-border-color #0a6db1` (bottom transparent) / 3px 3px 0 0 / 15px / -1px | global `.mainTabset .presAreaTabs-notes.active` |
| `i.fas.fa-desktop` (Screens icon) | font-size / color | 12px / rgb(204,204,204) | presenter capture fa-desktop node |
| `i.fas.fa-podcast` (Streams icon) | — | (not rendered; Streams hidden) | see gaps |
| `i#noteChangeIndicator.fa-edit` | rect | 14×12px | admin `tab:Screens` node |
| `span.ml-1` "Screens" | margin-left | .25rem (BS `ml-1`) | consts 8; BS4 |
| `span.mx-1` "Notes"/"Files" | margin-x | .25rem | consts 14; BS4 |
| `div#mainTabsContent.tab-content` | display / height / width | block / 100% (856px capture) / 1018px | presenter `#mainTabsContent`; scoped height:100% |
| `div#screens.tab-pane.fade.active.show` | display / height / bg / text-align | block / 100% (1216px) / transparent / start | admin `tab:Screens` `#screens` |
| `h3.text-center.mt-4` "No one is presenting…" | font-size / line-height / text-align / margin-top / color | **28px** / 33.6px / center / 24px (`mt-4`=1.5rem) / rgb(204,204,204) | admin `tab:Screens` empty h3 |
| `ul#screenTabs.nav.nav-tabs.screens-tabs` | display / background / position / z-index / height(empty) | flex / **rgb(12,36,52)** `--notes-tabs-bg` / relative / 1 / 1px (empty) | admin `tab:Screens` `#screenTabs`; global `.screens-tabs` |
| `.screens-tabs .nav-link` (per-screen tab) | padding / font-size / line-height / color | 4px / 12px / 12px / `--tabs-color #fff` | global `.screens-tabs .nav-link` |
| `.screens-tabs .nav-link.active` | background / color / radius | `--tab-active-bg #45a2ff` / `--note-tabs-color #fff` / 3px | global |
| `div#screensTabsContent.tab-content` | height / display | calc(100% - 82px) (1134px capture) / block | scoped `#screensTabsContent`; admin rect |
| `img.presenter-img` | max-width | 20px | scoped CSS |
| `.screens-tabs .dropdown-menu` (cog menu) | background / color / border | `--archives-dropdown-menu-bg-color #0e3651` / `--tabs-dropdown-color #45a2ff` / none | global |
| `.screens-tabs .dropdown-menu .dropdown-item` | color / font-size | `--tabs-dropdown-color #45a2ff` / 15px | global |
| `.volumeControl` (per-screen vol menu) | text-align / color / background / border | center / `--light-gray #ccc` / `--darker-black #111` / 1px solid #fafafa | scoped CSS |
| `.volCtrl` (range input) | background / height / width | `--darker-black #111` / 32px / 129px | scoped CSS |
| `#dropdownVolume` | width / ::after | 31px / display:none | scoped CSS |
| `.zoom-controls-container` | bg / z-index / opacity / margin-top | transparent / 10 / .5 / 4px | scoped CSS |
| `.zoom-controls` | top / left | -33px / -33px | scoped CSS |
| `div#streams.tab-pane.fade` | rendered attr | `hidden=""` (present in DOM, display:none) | dump `odds-and-ends.html` |
| `h3` "No one is streaming right now…" | font-size / text-align / margin-top | 28px / center / 24px | same rules as screens h3 (const 23) |
| `ul#streamsTabs.nav.nav-tabs.screens-tabs` | (same as `#screenTabs`) | bg `--notes-tabs-bg #0c2434`, flex, z-index 1 | global `.screens-tabs`; dump |

---

## States & effects

- **Active main tab** — `ngClass {active: selectedMainTab=='presAreaTabs-<name>'}` on the `<a>` (helper `zo=t=>({active:t})`). `.mainTabset .nav-link.active` → `background:var(--tab-active-bg) #45a2ff`, `color:var(--note-tabs-color) #fff`, `border-radius:3px`. Verified: admin `tab:Screens` → `screens-tab` computed bg rgb(69,162,255).
- **Notes tab special-case** — the Notes `<a>` carries an extra static class `presAreaTabs-notes`; `.mainTabset .presAreaTabs-notes.active` (and `.nav-item.show` when its dropdown is open) restyle it as a folder-style tab: `border:1px solid var(--tabs-border-color) #0a6db1`, `border-bottom:transparent`, `padding-bottom:15px`, `margin-bottom:-1px`, `border-radius:3px 3px 0 0`, `background:var(--notes-tabs-bg) #0c2434`. Also `.mainTabset #presAreaTabs-notes.active` gives the same navy bg (note: an `#`-id form exists in CSS but the template only sets it as a class, so the `.presAreaTabs-notes.active` class rule is what wins — verified by presenter capture: Notes active `bg rgb(12,36,52)`, `position:relative; z-index:10`).
- **Active screen/stream pane** — inner per-screen `.tab-pane` uses `ngClass {'show active': selected}` (`Vr=t=>({"show active":t})`); the `#screens` pane uses `BCe=(t,n)=>({"show active":t,"is-fullscreenshare":n})` — i.e. adds `is-fullscreenshare` when `isFullScreenshare`. `.tab-content>.active{display:block}` reveals; `.tab-content>.tab-pane{display:none}` hides the rest.
- **Fullscreen screenshare** — `.is-fullscreenshare{position:fixed;z-index:1030!important;width:100vw!important;height:100vh!important;top:0;left:0;background:#111;overflow:hidden}` (toggled by the `fa-expand`/`fa-compress-arrows-alt` button → `fullScreenshare()`).
- **Viewer-only mode** — `#screensTabsContent` gets `ngClass {viewer-only-screen-tab: viewerOnlyMode}` (`UCe`) → `height:100%!important;max-height:calc(100vh - 40px)!important;padding-bottom:5px`. Zoom controls get `ngClass {viewer-only-screen-zoom-controls: viewerOnlyMode}` (`jCe`) → `top:33px!important;left:-3px!important`.
- **Hover — main/screen tab** — `.mainTabset .nav-link:hover` / `.screens-tabs .nav-link:hover` → `border:1px solid var(--tabs-border-color) #0a6db1; border-radius:3px`.
- **Hover — room-sound-options label** — `.room-sound-options .form-check-label:hover{opacity:.85;cursor:pointer}`.
- **Transitions** — `.fade{transition:none}` (Darkly override; the BS `transition:opacity .15s` is overridden later in the sheet). So tab panes swap with **no fade animation**. `.nav-link{transition:none}` likewise.
- **Hidden-until conditions** (all drive `[hidden]{display:none!important}` or `*ngIf`):
  - `ul#mainTabs` `[hidden]=viewerOnlyMode`.
  - Screens `<li>` `[hidden]=hideScreens`; Streams `<li>` `[hidden]=hideStreams`; Notes `<li>` `[hidden]=hideNotes`; Files `<a>` `[hidden]=hideFiles`.
  - `#screens` pane `[hidden]=hideScreens`; `#streams` pane `[hidden]=hideStreams`.
  - **Streams is hidden in this room**: every capture omits `#streams`/`streams-tab` from the visible tree and the dump shows `hidden=""` on both the Streams `<li>` and `#streams` pane.
  - Recordings/VideoPlayer/SwingAlerts/DayTrades tabs are `*ngIf`-gated (`archivesAvailableTo()&&recsInRoom`, `(hideVideoPlayer&&!isP)||isP`, `hasSwingTradeAlerts`, `hasDayTradeAlerts`).
  - Notes cog (`WCe`, `div.dropdown` with `fa-cog` + "New Note") is `*ngIf isP || canEditNotes` — collapsed to `<!---->` in the member dump.
  - Empty h3 "No one is presenting right now..." `*ngIf screenSharingUsers.length==0`; the ms-auto zoom/volume `<li>` `*ngIf screenSharingUsers.length>0`.
- **jQuery hover effect** (from bundle, ngOnInit): `hn(".alert-chat-box").mouseenter(…{ hn(".mainTabset ul.nav-tabs").hide() }).mouseleave(…{ …show() })` — hovering the alert-chat-box **hides the whole main tab strip**, restores on mouseleave.

---

## Behavior

Provable from templates / DOM (`main.d6f5272aa3783e43.js`):

- **Main tab clicks** — each `<li>` has `(click)=onMainTabChange('presAreaTabs-<screens|streams|notes|files|recordings|videoplayer|swingAlerts|dayTradeAlerts>')`. Method: `onMainTabChange(e){this.selectedMainTab=e; if(=='presAreaTabs-files') getSessionFiles(); if(=='presAreaTabs-videoplayer') loadVideos()}`. Bootstrap tab activation also fires via `data-bs-toggle="tab"` + `data-bs-target="#screens"|"#streams"|"#notes"|"#files"`.
- **Per-screen tab click** — `(click)=onScreenShareTabChange(screen._id)` → sets `selectedScreenShareTab`; BS `data-bs-toggle="tab"` targets `#{_id}`.
- **Per-stream tab click** — `(click)=onStreamTabChange(stream._id){ selectedMTXStreamTab=e; mtxHandlerService.selectedTabID=e }`.
- **Screen cog dropdown** — `span#dropdownMenuScreen.dropdown-toggle[data-bs-toggle=dropdown]` opens `ul.dropdown-menu`. Items: "Bring everyone here" → `bringFocusToScreen(_id)` (presenter-only; sends server admin command `focusOnScreen`), "Stop This Screen" → `stopSharingThisScreenRemote(screen)` (presenter-only), "Detach Screen to a new window" → `detachScreen(_id)`, "Lock/Unlock Screen" → `toggleLockScreen(_id)`. Stream cog: "Bring everyone here" (presenter) + "Lock/Unlock Screen" → `toggleLockScreenMTX(_id)`.
- **Zoom controls** (`ms-auto` li) — `panZoomIn()`/`panZoomOut()`/`panZoomReset()` (shown when `showZoomCtrl`); toggle via `togglePanZoom()` (fa-search button). `captureVideoImage()` (fa-camera). `fullScreenshare()` (fa-expand/compress).
- **Volume dropdown** — `button#dropdownVolume[data-bs-toggle=dropdown]`; range input `(change|input)=adjustVol($event)` bound `ngModel=audioVolume`; `mute()`/`unmute()` buttons; per-talking-user rows in `.room-sound-options`.
- **Tooltips** (`[placement=bottom] [tooltip=…]`, ngbTooltip): the `fa-eye` "forced screen" marker → *"This is the default screen users are taken to right now. If you are a presenter and talking whichever screen you select will be forced on others. You can also select a specific screen and click the gear icon on this tab to force everyone to watch that screen."* The lock marker → *"Unlock this screen?"*. Cog lock/unlock `<span>` `title="Lock this screen?"` / `"Unlock this screen?"`.
- **Session-lock side-effect** (ngOnInit) — if `sessData.isLocked && user.isPresenter`, a `bootbox.confirm` "Session Locked" dialog appears (not part of the tab DOM but wired in the same component).

---

## Honest gaps

1. **"lightTheme" premise mismatch.** No capture runs the `lightTheme` body class (`meta.theme.bodyClass=""` in all three). The room renders on the base navy `:root`. All resolved colours above are the *actual* live values, but the surface is not in a light theme.
2. **Screen cog dropdown & per-screen tabs never captured live.** No capture had `screenSharingUsers>0` — `grep dropdownMenuScreen` = 0 hits across all 5 capture JSONs and the `#screenTabs` is empty in every state. The cog-menu/per-screen-tab **DOM structure is decoded from the bundle template** (`rSe`/`PSe`/`FSe`/`SSe`/`ISe`), but their **computed rects/colours are inferred from the shared `.screens-tabs`/`.dropdown-menu`/`.volumeControl` rules, not measured on a rendered sharing screen.**
3. **Streams tab/pane fully hidden in this room** (`hideStreams`). The `fa-podcast` icon, active-streams-tab styling, `app-streaming-view`, and populated `#streamsTabs` were never rendered — structure from bundle only; the empty-state h3 text "No one is streaming right now..." is from `DSe`/`odds-and-ends.html`.
4. **`app-screenshare-view` / `app-streaming-view` internals** (`.h-inherit[muser]`) are separate components — their scoped CSS/markup are out of scope here.
5. **Conditional main tabs** (Recordings, VideoPlayer, Swing Alerts, Day Trades) were not active in captures (data flags false); their tab-strip DOM is from `qCe`/`KCe`/`YCe`/`QCe`, styles inherited from `.mainTabset .nav-link`.
6. **`customPlayerURL` / `disableVideo` branches** of `#screens`/`#streams` (`JCe` iframe, "Video off to preserve data..." h3) were not exercised — decoded from template only.
7. **`.screen-options` / `.screen-options-start-screen` / `.screen-presenters*` scoped classes** exist in the bundle (a start-screen picker menu) but no matching template node was found in this component's `consts`; likely belong to a sibling start-share flow — left documented but unmapped.
