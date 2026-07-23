# proroom-full-presenter.json

- **path**: `proroom-full-presenter.json` (repo ROOT copy)
- **kind**: json-capture (rendered DOM + computed styles + rects + multi-state) — **RAW dump, AUTHORITY**
- **size**: 27,094,331 bytes (~25.8 MiB / "27MB")
- **role**: **presenter** — determined from `meta.role: "presenter"` (line 3) and corroborated by presenter-only surfaces in the DOM (webcamsHolder/streams/video-player, "Sort by Trials" admin control, alert-composition tabs "Text Alert / Text Url / Image / GIF / Video")
- **format/quality**: computed styles + rects, per-element, with a `states`/`groups` model capturing multiple interaction states (tabs opened, notes selected, dropdowns opened). Pretty-printed JSON (multi-line, human-readable). `errors: []` — clean capture, not truncated (`meta.elementsCapped: false`).

## Structure (verified by `node` inspection, not full read)
Top-level keys: `meta, head, cssVariables, fonts, stylesheets, palette, elements, assets, inventory, states, errors`.
- `meta`: role=presenter; url=`https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1`; title=`Mastering The Trade`; viewport `1401x905 @dpr2`; UA = Android 15 / Pixel 9 Chrome (mobile UA but desktop-width viewport, `tooNarrow:false`); theme htmlClass/bodyClass both `""`, dataTheme `null`.
- `head.stylesheetLinks` (3): FontAwesome **v5.8.1** `all.css`, animate.css 3.7.2, and app `styles.d622cb9ed2bbc221.css`. `fontLinks`: FA 5.8.1.
- `cssVariables.root`: **294** CSS custom properties (e.g. `--success:#00bc8c`, `--darkTheme-msgs-bg-adm:#0f2e43`, `--lightTheme-roster-bg-adm:#e1e1e1`, `--note-text-color:#676767`, `--modal-upload-files-color:#0a6db1`).
- `elements`: **2,184** nodes, each `{path, tag, rect, attrs, icon, style, before, after}` (full computed `style` block per node — e.g. html node carries display/box-sizing/position/width/height/min-*).
- `states`: **15** states → `tab:Screens, tab:Streams, tab:Notes, tab:Files, note:Welcome, note:JC's Daily Briefing, note:Henry's Workflowy Notes, note:Sam's Mag 7 index, note:1on1 Coaching/ Prop Firm & Too, note:Taylor's Scorecard Rankings (6, dropdown:1, dropdown:2, dropdown:3, dropdown:7, dropdown:8`. Each state = `{groups:[{selector, rootPath, count, nodes[]}]}`. Common groups per state: `app-presentationarea` (438), `.presentation-box` (455), `#mainTabs` (25); dropdown states add `.dropdown-menu.show` (varying counts 3–35).
- `assets`: `images` **89**, `backgroundImages` **8**, `inlineSvgs` **0**. Image hosts: `chat.protradingroom.com/var/www/uploads/...` and `secure.gravatar.com/avatar/...?d=mm&s=50` (roster avatars).
- `fonts.loaded`: FA5 Free 400/900 **loaded**; FA5 Brands, Lato (400/700/italic), summernote all listed `unloaded`.
- `palette.color` (by count): `rgb(33,37,41)` #212529 ×19752 (dominant body ink/dark navy), `rgb(204,204,204)` ×1451, `rgb(69,162,255)` #45a2ff ×863 (link/accent blue), `rgb(244,244,244)` #f4f4f4 ×406, `rgb(103,103,103)` #676767 ×311, `rgb(10,109,177)` #0a6db1 ×158, `rgb(0,128,64)` ×119.
- `inventory`: keys `buttons, inputs, links, menus, modalsInDom, dataAttributes`.

## Surfaces documented
- **Presentation stage**: `app-presentationarea` / `.presentation-box` (main center pane, rect x=383 y=49 w=1018 h=856), icon `fas fa-desktop`. Presenter media stack present: `webcamsHolder`, `webcamsHolderVideo`, `webcamsHolderScreen`, `webcamVideo-*`, `webcamScreen`, `webcamPreviewScreen`, `webcam-wrapper`, `presentation-subtitles`, `video-player` (+ `video-player-btns`, `video-player-delete-btn`, `video-settings`, `video-screen-container`, `videoPlayerUrl-iframe`, `video-slash`), `video-container`.
- **Main tabset** (`#mainTabs` / `mainTabset`, 2525 / 1781 occurrences): tabs Screens, Streams, Notes, Files (+ streams `streamsTabsContent`, `files-tabs`).
- **Notes**: `noteTabset` (1756), `noteDownload` (220), 6 note documents captured as states (Welcome, JC's Daily Briefing, Henry's Workflowy Notes, Sam's Mag 7 index, 1on1 Coaching/Prop Firm, Taylor's Scorecard Rankings).
- **Chat / stream messages**: `app-st-message` (1978), `msg-box` (2378), `msg-box-adm` (406 — admin/presenter message styling), `flex-row-reverse` (466), `msgMenu` (306), `created-at` (304), `alert-qa` (151), `tradeColor` (38).
- **Roster**: `room-roster` (8), `presUser` (3) vs `regUser` (3) — presenter/regular user split in roster, `rosterImg` (7), `volumeControl` (39), `users-dropdown-options` (146), `st-searchbar` (6). "Sort by Trials" / "Sort Users" / "Reload Users" buttons.
- **Badges**: `user-badge-img` (610), `badge-success` (165), `files-badge` (1). (Per Rule 0: badges are `<img class="user-badge-img">`, NOT text badges.)
- **Modals / settings**: `modal-content` (85); link-tab labels `App Settings | Alert Settings | Chat Settings | User Settings` and alert-composition `Text Alert | Text Url | Image / GIF / Video`; `modalsInDom` includes an "Offline" modal (visible:false). `alertHeader` (4), `chatHeader` (5).
- **Dropdowns**: 5 dropdown-open states captured (`.dropdown-menu.show`).

## Maps to (our components)
- `app-presentationarea` / `.presentation-box` + webcamsHolder/video-player → **presentation stage / webcam-holder / screen-share component** (this capture is the primary authority for the presenter stage layout & controls).
- `#mainTabs` Screens/Streams/Notes/Files → **main tabset component** (tab bar + panes).
- `noteTabset` + 6 note states → **notes tab + note-document renderer** (Welcome, briefings, etc.).
- `app-st-message` / `msg-box` / `msg-box-adm` / `flex-row-reverse` / `msgMenu` / `alert-qa` / `tradeColor` → **chat/alert message list + message menu + trade-alert coloring**.
- `room-roster` / `presUser` / `regUser` / `volumeControl` / `users-dropdown-options` → **roster panel with presenter vs member grouping + volume + user menu**.
- `user-badge-img` / `badge-success` → **badge image renderer** (image-based, not text).
- Alert-composition tabs (Text Alert / Text Url / Image/GIF/Video) + App/Alert/Chat/User Settings → **presenter alert-authoring modal + settings modals**.

## Key findings (cited)
1. **This IS the presenter view** — `meta.role:"presenter"` (line 3) plus DOM-only presenter surfaces: `webcamsHolderVideo` (125), `webcamsHolderScreen` (5), `video-player`/`video-settings`/`videoPlayerUrl-iframe`, and authoring links `Text Alert | Text Url | Image / GIF / Video` — surfaces a member capture would not have.
2. **Multi-state capture (15 states)** — not a single snapshot; every main tab, 6 note documents, and 5 dropdown-open states are separately recorded under `states[k].groups`, so this file documents interaction states, not just default layout.
3. **Presentation stage geometry is authoritative** — `app-presentationarea` rect `{x:383,y:49,w:1018,h:856}` inside `as-split#mainAreaSplit > as-split-area.presentation-box:nth-child(2)` (Angular `as-split` split-pane layout, `_nghost-ng-c2028866615`). Left column ≈383px, stage fills remaining 1018px of 1401px viewport.
4. **Palette/theme is dark** — dominant ink `rgb(33,37,41)` #212529 (19,752 refs), accent blue `#45a2ff`, success `#00bc8c`; theme classes empty (`htmlClass:""`) so theme is driven by 294 CSS vars, not a body class. FA pinned **5.8.1** (matches MEMORY authority note).
5. **Badges are images** — `user-badge-img` appears 610× as a class; consistent with Rule 0's warning that real badges are `<img class="user-badge-img">`, NOT "New"/"Trial" text badges from prose analyses.

## Notes
- **Best-authority flag**: for the **presenter stage / webcam / streams / video-player** surfaces this is the richest capture in the corpus (computed styles + rects + multi-state). Rendered capture — use over any prose `.md`.
- **Duplicate/superset**: filename implies a paired copy may exist elsewhere in the tree (this is the ROOT copy). Not compared here; if a `_report-sections` or nested copy exists, this ROOT `full-presenter` is the raw authority and any `.md` derived from it is SECONDARY.
- `inlineSvgs: 0` and `errors: []` — no captured inline SVG art; capture is clean and not capped (`elementsCapped:false`).
- Mobile UA string but 1401px desktop viewport — capture harness used a mobile UA yet desktop layout; note when reconciling responsive breakpoints.
