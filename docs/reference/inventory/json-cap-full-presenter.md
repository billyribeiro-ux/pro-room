# proroom-full-presenter.json

- **path**: docs/reference/captures/proroom-full-presenter.json
- **kind**: json-capture
- **size**: 11,184,807 bytes (~11 MB / 10.7 MiB)
- **role**: presenter — determined by `meta.role` == `"presenter"` AND `meta.url` == `https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1` (the `&sl=1` presenter/stream-leader flag). `meta.title` == `"Mastering The Trade"`.
- **format/quality**: rendered DOM with computed styles + rects (states/groups + top-level `elements`). This is an AUTHORITY dump (rendered capture beats prose). Structure: top keys `[meta, head, cssVariables, fonts, stylesheets, palette, elements, assets, inventory, states, errors]`. `errors` array is empty (len 0). `meta.elementsCapped: false` — nothing truncated.

## Capture environment (cited)
- **Viewport**: `meta.viewport` = `{w:1988, h:1157, dpr:2}`; `meta.screen` same; `meta.tooNarrow: false`.
- **UA is MOBILE despite wide viewport**: `meta.userAgent` = `...Pixel 9...Chrome/149.0.0.0 Mobile Safari...`. So this is a Pixel-9 UA driving a 1988px-wide (dpr2) window — a wide desktop-layout capture through a mobile UA, not a phone-width layout.
- **Theme**: `meta.theme` = `{htmlClass:"", bodyClass:""}` (no theme class on html/body).

## surfaces documented
- **App shell / Angular components** (from `elements[].tag`, hyphenated tags): `app-root`(1), `app-room`(1), `app-room-roster`(1), `app-alerts`(1), `app-chat`(1), `app-presentationarea`(1), `app-note`(1), `app-roomscroller`(2), `app-st-message`(50), `as-split`(2)+`as-split-area`(4) (Angular split-pane layout).
- **Presentation stage** (presenter-specific): `app-presentationarea` → `div.mainPresentationAreaHolder` rect `{x:590,y:49,w:1398,h:1108}`; container `as-split-area.presentation-box` bg `rgb(15, 46, 67)` (navy). Presentation-area detail lives in `states.dropdown:*` groups (see below), NOT in top-level `elements` (top-level `elements` has only 2 presentationarea nodes).
- **Webcams**: `div.webcamsHolder` ×2 rect `{x:1294,y:1162,w:320,h:240}` bg `rgb(0,0,0)`, each containing `video.webcamsHolderVideo` ×2 rect `{...w:318,h:238}`. NOTE: y=1162 is BELOW the viewport bottom (1157) — webcams are rendered but scrolled/positioned off the bottom edge in this capture. No `<video>` tag counted by raw grep beyond these (grep `"tag":"video"` = 0 in flat scan; they appear inside state-group nodes).
- **Presentation-area tabset** (`#mainTabs` / `.mainTabset`, in `states.dropdown:*` group `#mainTabs` = 25 nodes): 3 tabs, identified by FA icons — `i.fas.fa-desktop` (Screens) at x1173, `i.fas.fa-edit` (Notes) at x1262 which carries `nav-link presAreaTabs-notes active`, `i.fas.fa-folder` (Files) at x1343. **Presenter view exposes Screens / Notes / Files, with NOTES active in this capture.** (Streams tab absent from the presenter mainTabs here.)
- **Chat** (`app-chat`): `nav.chatHeader` rect `{x:0,y:673,w:579,h:48}` bg `rgb(10,109,177)` (blue). 50 chat messages: `app-st-message`(50) each with `.msg-box`(50), `.msgMenu`(50) (per-message action menu, `dropright`), `.alert-qa`(50) + `i.fa-question-circle`(50) (Q&A question marker), `.created-at`(50) timestamp, `.username`(50), `.avatar`(50), `.text-formated`/`.preText`(50).
- **Alerts panel** (`app-alerts`): `nav.alertHeader` rect `{x:0,y:49,w:579,h:48}` bg `rgb(10,109,177)`. `tradeColor` class ×13 (trade-alert color coding).
- **Roster** (`app-room-roster` → `div.room-roster-list`): rect `{x:-248,y:452,w:246,h:699}` — **NEGATIVE x (-248): roster is collapsed/off-screen left** in this presenter capture. Only 2 roster nodes at top level.
- **Notes** (`app-note`): `.noteTabset`(1), `.noteDownload`(1).
- **Volume**: `i.fa-volume-up`(1) (single volume-up control, not a `volumeControl` class).

## maps to (our components)
- `app-presentationarea` / `.presentation-box` / `.mainPresentationAreaHolder` → our PresentationStage / presenter stage component (navy `rgb(15,46,67)` bg).
- `.webcamsHolder` + `video.webcamsHolderVideo` → our WebcamStrip / presenter webcam tiles (320×240 each).
- `#mainTabs`/`.mainTabset` (fa-desktop/fa-edit/fa-folder) → our presentation-area Tabs (Screens/Notes/Files).
- `app-chat` + `chatHeader` + `app-st-message`/`.msg-box`/`.msgMenu`/`.alert-qa` → ChatPanel + ChatMessage + per-message action menu (Q&A markers).
- `app-alerts` + `alertHeader` + `tradeColor` → AlertsPanel / trade-alert rows.
- `app-room-roster`/`.room-roster-list` → RoomRoster (collapsible sidebar, here collapsed).
- `app-note` + `.noteTabset`/`.noteDownload` → NotesPanel.

## key findings (cited)
1. **Interactive state expansions live in `states`** (9 keys): `tab:Screens`, `tab:Streams`, `tab:Notes`, `tab:Files`, `dropdown:1/2/3/7/8`. All four `tab:*` states returned `{groups:[], note:"tab not found"}` — the tab-click probes FAILED (honest gap: no per-tab content captured). The 5 `dropdown:*` states each captured 4 groups: `app-presentationarea`(468 nodes), `.presentation-box`(485), `#mainTabs`(25), `.dropdown-menu.show`(3–35, the open context menu). The dense presentation-area DOM (468 nodes) is ONLY in these dropdown state groups.
2. **user-badge-img is a real IMG element governed by CSS, NOT a text badge** — confirming the corpus warning. The 4 `user-badge-img` matches are all in `stylesheets` CSS text: `.user-badge-img { width:auto; height:100%; max-height:20px }`, `.user-badge-img:hover { transform: scale(1.2) }`, plus `.trial-badge` rules and an `@media (max-width:600px)` rule hiding `.user-badge-img`/`.trial-badge`. NO rendered `user-badge-img` DOM node exists in this capture (grep matched CSS only). Do NOT model a "New"/"Trial" text badge.
3. **Header/theme colors (cited computed styles + palette)**: chat/alert headers `rgb(10,109,177)` (blue, `palette.backgroundColor` count 16); presentation stage `rgb(15,46,67)`; `presAreaTabs-notes` bg `rgb(12,36,52)`; dominant navy fills `rgb(14,54,81)`(count 51) and `rgb(16,61,92)`(count 23). Link color `--app-link-color: #45a2ff` (= `rgb(69,162,255)`, count 29). `--primary: #375a7f` (Darkly default). `--app-font-family: 'Open Sans', sans-serif`.
4. **Scale metrics**: `elements` = 1178 nodes; `cssVariables.root` = 294 vars (body identical, 294); `stylesheets` = 41; `assets` = 34 images + 8 backgroundImages + 0 inlineSvgs; `inventory` = 200 buttons, 74 inputs, 34 links, 251 menus, 120 modalsInDom.
5. **Chat message anatomy (50 identical-structured messages)**: each `app-st-message` = `.msg-box` + `.msgMenu.dropright` (hover action menu) + `.alert-qa` with `i.fa-question-circle` (Q&A) + `.avatar` + `.username` + `.created-at` + `.text-formated`/`.preText`. Message body font per computed style: `'Open Sans', sans-serif`. `badge-success` appears 69× and `badge-warning` 5× in raw scan (mostly CSS + inventory).

## notes
- **Best authority for the PRESENTER stage + webcams + presenter mainTabs (Screens/Notes/Files)** — this is the only capture in the set flagged `meta.role:"presenter"` with `app-presentationarea` fully expanded (468-node group). Prefer it over any member capture for presenter surfaces and over any `.md` prose.
- **Superset caveat**: the rich presentation DOM is inside `states.dropdown:*` groups, not top-level `elements` — a side-by-side comparison must read the state groups, not just `elements`.
- **Honest gaps**: (a) all four `tab:*` state probes = "tab not found" (no per-tab switched content); (b) roster is off-canvas (x=-248) and webcams are below the fold (y=1162 > viewport 1157) so their in-context layout is only partially observable; (c) mobile Pixel-9 UA on a 1988px window — treat as desktop-layout capture, verify against a true-desktop-UA dump if one exists.
