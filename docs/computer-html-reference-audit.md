# Computer HTML Reference Audit

Date: 2026-06-14

## Scope

The requested `computer` folder does not exist as a directory in this repo search scope: `find . -type d -iname '*computer*'` returned no matches. The local reference dump with "over 35 files" is `files/`, which contains 51 HTML files and 466,005 `wc -l` lines.

I excluded vendor/generated HTML under `web/node_modules/` and the generated Playwright report at `web/e2e/report/index.html` because those are not reference UI source files. I also checked the two first-party HTML files outside `files/`:

- `important-doc.html`: 83,921 lines, another full Angular room snapshot. It repeats the same core evidence as `files/file2.html`, including `app-root` at `important-doc.html:2`, `mainAppNav` at `important-doc.html:349`, `brand-logo` at `important-doc.html:382`, `Streams` at `important-doc.html:12519`, `app-post-alert-modal` at `important-doc.html:18015`, `app-poll-modal` at `important-doc.html:18379`, `app-alerts-advanced-search` at `important-doc.html:83070`, `id="webcam"` at `important-doc.html:83909`, and `toast-container` at `important-doc.html:83919`.
- `web/src/app.html`: 18 lines, only the SvelteKit shell with fonts and `%sveltekit.body%`; it is not a rendered UI reference. Evidence: `web/src/app.html:1-18`.

## Evidence Boundaries

This report is based on static HTML and Svelte source evidence, not assumptions. I attempted to use the in-app browser for visual verification, but it was unavailable in this session (`Browser is not available: iab`). Because of that, I cannot truthfully certify any surface as pixel-perfect by screenshot diff.

Evidence standard used below:

- A `Verified present` finding means the reference HTML and current Svelte source both contain the named surface or label at cited lines. It is not a pixel-perfect claim.
- A `Verified difference` finding means cited lines show different text, IDs, tab count, DOM classes, structure, or component behavior.
- A `Verified missing` finding means the reference has the item and a source search or current component definition did not find the equivalent in `web/src`.
- A `Visual not verified` finding means a browser screenshot or pixel diff is required; no visual conclusion is made.
- Existing e2e screenshots/tests are not accepted as proof of current pixel parity because `web/e2e/proroom.e2e.ts:80-87` expects a `Streams` tab, while current `web/src/lib/components/MainStage.svelte:62-74` defines only `screens`, `notes`, and `files`.

`pnpm build` in `web/` completed successfully during this audit. That verifies the current app builds, not that it visually matches the reference HTML.

## Status Labels

- `Verified present`: cited reference lines and cited current source lines both contain the surface or label. This is not a pixel-perfect claim.
- `Verified difference`: cited reference lines and cited current source lines differ.
- `Verified missing`: cited reference lines contain an item that source search or current component definitions did not find in `web/src`.
- `Verified extra`: current source contains UI not found in the compared reference surface.
- `Visual not verified`: a live browser, backend data, screenshot, or pixel diff is required.

## High-Level Result

No surface is certified pixel-perfect by visual evidence in this report. That is a fact about available evidence, not a design conclusion.

Verified present in both source sets, with no pixel-perfect claim:

- Navy room palette and fonts: reference variables in `files/file-1.html:646-656`; current tokens in `web/src/routes/layout.css:7-33`.
- Split gutter color and grip: reference gutter in `files/file2.html:12494-12503`; current gutter and grip in `web/src/lib/components/Split.svelte:167-176` and `web/src/lib/components/Split.svelte:194-212`.
- Top room shell exists: reference `mainAppNav`, `room-sidebar`, and `mainAreaSplit` at `files/file2.html:15`, `files/file2.html:349`, and `files/file2.html:656`; current shell renders `RoomTopNav`, `RoomSidebar`, and `Split` at `web/src/routes/rooms/[id]/+page.svelte:336-375`.
- Chat panel exists in both: reference `app-chat` starts at `files/file2.html:12325`, reference has Off Topic at `files/as-splitter.html:9590`, and reference has composer textarea at `files/as-splitter.html:9663-9671`; current chat has Off Topic at `web/src/lib/components/ChatPanel.svelte:162`, composer textarea at `web/src/lib/components/ChatPanel.svelte:267-277`, image/GIF buttons at `web/src/lib/components/ChatPanel.svelte:279-281`, and the row-menu glyph note at `web/src/lib/components/ChatPanel.svelte:203-206`.
- Notes and Files surfaces exist in both: reference tabs at `files/file6.html:9846-9945`; current tabs at `web/src/lib/components/MainStage.svelte:71-74`, `NotesPanel` render at `web/src/lib/components/MainStage.svelte:110-111`, and `FilesPanel` render at `web/src/lib/components/MainStage.svelte:113`.

Verified differences or missing items:

- `Streams` tab is present in reference HTML but absent from current `MainStage`.
- Reference brand uses a `brand-logo` image; current top nav uses text branding.
- Sidebar archive menu is a Bootstrap dropdown in the reference; current sidebar renders separate grouped buttons.
- Reference version text is `v4.0.1-c0fee8f5`; current sidebar says `v0.0.1`.
- Post Alert reference has three tabs; current app has five tabs.
- Poll reference has a floating `Polls` panel with `Create New Poll` and `Pre-Canned Polls`; current app has a centered `Create a poll` modal only.
- Advanced Search reference uses Bootstrap dropdowns with specific IDs; current app uses native `select`.
- Several modal titles/labels differ exactly.
- Reference runtime fragments `connectedMsg`, `id="webcam"`, `toast-container`, and `mp3player` were not found in current `web/src`.

## CSS, Colors, Effects, Modals

### CSS And Color Facts

| Area | Reference evidence | Current app evidence | Status | Fact |
| --- | --- | --- | --- | --- |
| Theme token model | Reference defines many semantic room variables: `--navbar-bg`, `--sidebar-menu-bg`, `--textarea-holder-*`, `--msgs-header-bg`, `--split-gutter-bg`, `--archives-dropdown-*`, and modal variables at `files/file-1.html:641-730`. | Current customizable token type is limited to generic tokens `--bg`, `--bg-elev`, `--bg-elev-2`, `--border`, `--text`, `--text-dim`, `--accent`, `--accent-hover`, `--positive`, `--negative`, `--warn`, `--username-color`, and `--ticker-color` at `web/src/lib/stores/theme.svelte.ts:14-28`. | Verified difference | Some color values match, but the CSS variable system is not the same. |
| Navy background | Reference `--navbar-bg: #0c2434` at `files/file-1.html:646`. | Current `--bg: #0c2434` at `web/src/routes/layout.css:10`; top nav uses `background: var(--bg)` at `web/src/lib/components/RoomTopNav.svelte:205-208`. | Verified same color / different token | Same hex value, different variable name. |
| Elevated navy | Reference `--presenter-area-bg: #0f2e43` at `files/file-1.html:657`. | Current `--bg-elev: #0f2e43` at `web/src/routes/layout.css:11`. | Verified same color / different token | Same hex value, different variable name. |
| Sidebar/modal navy | Reference `--sidebar-menu-bg: #103d5c` and `--modal-content-bg-color: #103d5c` at `files/file-1.html:647` and `files/file-1.html:713`. | Current `--bg-elev-2: #103d5c` at `web/src/routes/layout.css:12`; `Modal.svelte` panel uses `background: var(--bg-elev-2)` at `web/src/lib/components/Modal.svelte:93`. | Verified same color / different token | Same background color value is reused through a generic token. |
| Accent blue | Reference `--app-link-color`, `--sidebar-menu-active-color`, `--tab-active-bg`, and `--modal-active-tab-bg-color` use `#45a2ff` at `files/file-1.html:642`, `files/file-1.html:649`, `files/file-1.html:658`, and `files/file-1.html:717`. | Current `--accent: #45a2ff` at `web/src/routes/layout.css:16`; current Post Alert active tab uses color and border-bottom, not active-tab background, at `web/src/lib/components/modals/PostAlertModal.svelte:288-290`. | Verified same color / verified style difference | Same accent hex exists, but active tab styling differs. |
| Dark blue action/header | Reference `--textarea-holder-border-color`, `--msgs-header-bg`, and `--split-gutter-bg` use `#0a6db1` at `files/file-1.html:654`, `files/file-1.html:689`, and `files/file-1.html:690`. | Current `--accent-hover`, `--username-color`, and `--ticker-color` use `#0a6db1` at `web/src/routes/layout.css:19` and `web/src/routes/layout.css:26-27`; current split gutter directly uses `#0a6db1` at `web/src/lib/components/Split.svelte:167-168`. | Verified same color / different token | Same hex value exists, but reference semantic variables are not defined as current theme tokens. |
| Success/danger colors | Reference modal success/danger variables are `#92d528` and `#bb352a` at `files/file-1.html:724-727`. | Current `--positive: #92d528` and `--negative: #bb352a` at `web/src/routes/layout.css:20-21`. | Verified same color / different token | Same values, different variable names. |
| Modal chrome | Reference modal content variables include content bg/color/border, active tab bg/color/border, close button colors, and button colors at `files/file-1.html:713-730`; reference modal DOM uses `modal fade`, `modal-dialog`, `modal-content`, `modal-header`, and `btn-close-white`, e.g. `files/file12.html:4-29`. | Current shared modal uses `.backdrop` and `.panel`, `max-width: 440px`, `background: var(--bg-elev-2)`, `border: 1px solid var(--border)`, `border-radius: 8px`, and `box-shadow: 0 18px 48px rgba(0,0,0,.5)` at `web/src/lib/components/Modal.svelte:77-145`. | Verified difference | Reference Bootstrap modal chrome is not the current modal chrome. |
| Light/dark message colors | Reference maps `.lightTheme` and `.darkTheme` to message variables `--msg-bg`, `--msg-border-color`, `--date-color`, `--msg-color`, `--username-color`, `--msgs-bg`, `--msgs-bg-adm`, `--textarea-color`, and `--textarea-bg` at `files/file-1.html:732-778`. | Current light mode overrides generic page/app tokens only at `web/src/routes/layout.css:41-55`, and current theme token type does not include `--msg-bg`, `--msgs-bg`, or `--textarea-bg` at `web/src/lib/stores/theme.svelte.ts:14-28`. | Verified difference | Reference has message-specific theme variables that are not part of the current theme token model. |

### Before / After And Interaction Effects

| Effect | Reference evidence | Current app evidence | Status | Fact |
| --- | --- | --- | --- | --- |
| Global pseudo reset | Reference applies `box-sizing: border-box` to `*`, `*:before`, and `*:after` at `files/file-1.html:213-216`. | Current global CSS applies `box-sizing: border-box` only to `*` at `web/src/routes/layout.css:57-59`. | Verified difference | Reference includes pseudo-elements in the reset; current global reset does not. |
| Print pseudo reset | Reference print media resets `text-shadow` and `box-shadow` for `*`, `*:before`, and `*:after` at `files/file-1.html:244-249`. | Source search for `@media print`, `text-shadow: none`, and `box-shadow: none` in current `web/src` found no equivalent rule. | Verified missing | Print-specific pseudo reset is not present in current source. |
| Theme checkbox checkmark | Reference checked radio/checkbox style creates a checkmark with `:checked:before { content: "\\2714" }` at `files/file-1.html:1071-1085`. | Current settings checkboxes/radios use native `accent-color: var(--accent)` at `web/src/lib/components/modals/SettingsModal.svelte:537-542`. | Verified difference | Reference uses generated pseudo-element checkmark; current uses native accent-color. |
| Theme checkbox click wave | Reference checked input uses `:checked:after` and `_click-wave` animation at `files/file-1.html:1086-1110`. | Source search for `click-wave` in current `web/src` found no equivalent implementation. | Verified missing | Reference animated pseudo-element effect is absent. |
| Dropdown caret suppression | Reference hides `#dropdownVolume:after` at `files/file-1.html:1121-1125`. | Current top nav uses Svelte button classes and no `#dropdownVolume` selector in `RoomTopNav.svelte`; the current top nav styles are at `web/src/lib/components/RoomTopNav.svelte:191-270`. | Verified difference | Reference Bootstrap dropdown pseudo-caret override is not current structure. |
| Follow marker | Reference `.followingSign:before` inserts `\\2713` at `files/file-1.html:1535-1539`. | Source search for `followingSign` in current `web/src` returned no matching implementation. | Verified missing | Follow checkmark pseudo-element is absent. |
| Row menu generated dots | Reference `.menuTriger:after` inserts vertical-dot content `\\2807` at `files/file-1.html:4800-4805`. | Current chat row uses a literal `⠇` span at `web/src/lib/components/ChatPanel.svelte:203-206`; current alert row uses `<Icon name="ellipsis-v">` at `web/src/lib/components/AlertFeed.svelte:220-225`. | Verified difference | Current app does not use the same generated pseudo-element for row menus. |
| Active icon transition | Reference `.active-icon` uses `transition: all 0.5s` at `files/file-1.html:825-830`. | Current sidebar has a width/flex collapse transition at `web/src/lib/components/RoomSidebar.svelte:253-267`; current top nav hover uses opacity at `web/src/lib/components/RoomTopNav.svelte:249-254`. | Verified difference | The current effects are different transitions, not the same active-icon effect. |

### Exact Modal / Surface Gaps

This table is about exact reference surface parity, not whether the app has some replacement workflow.

| Reference surface | Reference evidence | Current app evidence | Status | Fact |
| --- | --- | --- | --- | --- |
| `app-post-alert-modal` exact media UI | Reference has three tabs `Text Alert`, `Text Url`, `Image / GIF / Video` at `files/file12.html:30-70`, plus `filedragAlert` and `fileListAlert` at `files/file12.html:201-214`. | Current `PostAlertModal` has five tabs at `web/src/lib/components/modals/PostAlertModal.svelte:136-185` and upload styling at `web/src/lib/components/modals/PostAlertModal.svelte:328-345`. | Verified difference | Current modal exists but does not match exact tab/media/drop-zone UI. |
| `app-poll-modal` floating panel | Reference has `id="pollModalCompHolder"` and `class="pollModalHolder"` at `files/file13.html:1-5`, titlebar controls at `files/file13.html:8-42`, `Create New Poll` and `Pre-Canned Polls` at `files/file13.html:50-80`, and `Save To Canned` at `files/file13.html:174-185`. | Current `PollModal` is a shared centered modal titled `Create a poll` at `web/src/lib/components/PollModal.svelte:97` with create fields at `web/src/lib/components/PollModal.svelte:108-154`. | Verified difference / verified missing | Pre-canned panel and floating titlebar controls are missing from current source. |
| `app-screenshare-preview` | Reference has `id="screenshareLocalPreviewHolder"`, `webcamScreenLocalPreview`, draggable/resizable classes, and eight `ui-resizable-handle` nodes at `files/file22.html:1-73`. | Current source search for screen preview files returned no exact component; current room source imports `ScreenShareRoom` and stage controls but no `ScreensharePreview` component at `web/src/routes/rooms/[id]/+page.svelte:7` and `web/src/routes/rooms/[id]/+page.svelte:433-499`. | Verified missing by exact component | Exact floating draggable/resizable preview surface is not present. |
| `app-webrtc-troubleshooter` exact modal | Reference title is `Connectivity/Mic Troubleshooter`, with labels `UDP Enabled`, `TCP Enabled`, `STUN Server Connectivity`, and `TURN Server Connectivity` at `files/file30.html:19-78`. | Current replacement modal is titled `Connectivity Check`, labels rows `UDP`, `TCP`, `STUN`, `TURN`, and explicitly says no real WebRTC probing is performed at `web/src/lib/components/modals/ConnectivityCheckModal.svelte:14-34` and `web/src/lib/components/modals/ConnectivityCheckModal.svelte:76-90`. | Verified difference | A current connectivity modal exists, but the exact reference title/labels/behavior do not. |
| `app-play-youtube-modal` title/scope | Reference title is `Play YouTube For All` at `files/file8.html:14`. | Current title is `Play YouTube Video` at `web/src/lib/components/modals/PlayYouTubeModal.svelte:52`; current also has a separate `MediaForAllModal` titled `Play music for all` at `web/src/lib/components/modals/MediaForAllModal.svelte:131`. | Verified difference | Reference title/scope is split or renamed in current source. |
| `app-rich-text-editor` title | Reference title is `Rich Text Editor` at `files/file31.html:18`. | Current title is `Rich Text` at `web/src/lib/components/modals/RichTextEditorModal.svelte:135`. | Verified difference | Exact title differs. |
| Runtime modal support fragments | Reference has `connectedMsg`, `id="webcam"`, `toast-container`, and `mp3player` at `files/connected.html:3`, `files/file34.html:5`, `files/file33.html:2`, and `files/file6.html:13142`. | Source searches in `web/src` found no matching `connectedMsg`, no `id="webcam"`, no `toast-container`, and no `mp3player`. | Verified missing | Reference runtime support fragments are absent from current source. |

## Reference HTML Inventory

Every HTML file in `files/` is accounted for below.

| Reference file | Lines | Primary evidence / purpose |
| --- | ---: | --- |
| `files/afterwebcamholder.html` | 117 | Presenter/webcam fragment; `app-presenter-cams` at lines 5 and 27. |
| `files/appusersettingsmodal.html` | 1,190 | User settings modal; `app-user-settings-modal` at line 1. Duplicate of `files/file9.html`. |
| `files/as-splitter.html` | 13,138 | Room split fragment with alerts, chat, webcam, presentation; `app-alerts` at line 25, `app-chat` at line 9539, `app-webcam-holder` at line 9719, `app-presentationarea` at line 9783. |
| `files/avsettingsmodal.html` | 210 | AV settings modal fragment. |
| `files/avsettingsmodal1.html` | 215 | AV settings modal; `app-av-settings-modal` at line 1. Duplicate of `files/file10.html`. |
| `files/connected.html` | 7 | Runtime connected message; `id="connectedMsg"` at line 3. |
| `files/dropdownstart.html` | 160 | Top nav volume/dropstart fragment. |
| `files/dropdownvolume.html` | 146 | Top nav volume dropdown fragment. |
| `files/file-1.html` | 4,927 | CSS/design-system dump; key theme variables at `files/file-1.html:646-656`. |
| `files/file2.html` | 84,070 | Full Angular room snapshot; `app-root` at line 2; many modal/surface anchors listed below. |
| `files/file3.html` | 83,720 | Full Angular room snapshot variant; `app-root` at line 1. |
| `files/file4.html` | 80,676 | Full Angular room snapshot variant; room, modals, advanced search, RTE. |
| `files/file5.html` | 250 | Top nav/volume fragment. |
| `files/file6.html` | 13,165 | Room split/presentation fragment; tabs at lines 9846-9945; `mp3player` at line 13142. |
| `files/file7.html` | 80 | User info modal; `user-modal` at line 4. |
| `files/file8.html` | 62 | YouTube modal; title `Play YouTube For All` at line 14. |
| `files/file9.html` | 1,190 | User settings modal; duplicate of `appusersettingsmodal.html`. |
| `files/file10.html` | 215 | AV settings modal; `app-av-settings-modal` at line 1. |
| `files/file11.html` | 60 | Debug log modal; `Debug Log` title at line 20. |
| `files/file12.html` | 332 | Post Alert modal; three nav tabs and media upload/drop area. |
| `files/file13.html` | 215 | Poll modal/panel; `pollModalCompHolder`, `Polls`, create and pre-canned tabs. |
| `files/file14.html` | 59,163 | Chat Logs modal with large log payload; `app-chat-logs-modal` at line 1. |
| `files/file15.html` | 100 | Alert Logs modal; title `Alerts Logs` at line 15. |
| `files/file16.html` | 48 | Session Control modal; title at line 23 and mostly empty body at lines 33-35. |
| `files/file17.html` | 69 | Mobile app info modal; title at line 18. |
| `files/file18.html` | 98 | Reply modal. |
| `files/file19.html` | 169 | Alert Q&A modal. |
| `files/file20.html` | 47 | Muted Chat Users modal. |
| `files/file21.html` | 47 | Followed Chat Users modal. |
| `files/file22.html` | 73 | Screenshare preview modal. |
| `files/file23.html` | 37 | Recording preview modal. |
| `files/file24.html` | 47 | Duplicate Followed Chat Users modal. |
| `files/file25.html` | 72 | Scheduled Alerts modal. |
| `files/file26.html` | 55 | Alert Send Report modal. |
| `files/file27.html` | 54 | All-user private message modal. |
| `files/file28.html` | 409 | Alerts Advanced Search modal. |
| `files/file29.html` | 61 | Alert Filter modal; `show-alerts` checkbox. |
| `files/file30.html` | 118 | WebRTC troubleshooter modal. |
| `files/file31.html` | 56 | Rich Text Editor modal. |
| `files/file32.html` | 61 | Private chat surface. |
| `files/file33.html` | 3 | Toast container; `id="toast-container"` at line 2. |
| `files/file34.html` | 6 | Runtime audio element; `id="webcam"` at line 5. |
| `files/mixednavs.html` | 19 | Stage nav fragment. |
| `files/navbar.html` | 250 | Top nav/volume fragment. |
| `files/navbars-room.html` | 195 | Top nav/volume fragment. |
| `files/navfile.html` | 12 | Top nav fragment. |
| `files/odds-and-ends.html` | 119,654 | Multi-snapshot dump with room fragments and modals. |
| `files/pagesource.html` | 614 | Runtime page shell; `app-root` at line 608. |
| `files/reload.html` | 8 | Reload icon fragment. |
| `files/subnavbar.html` | 260 | Stage tabs; Screens/Streams/Notes/Files at lines 21, 47, 75, 100 and repeated at 174, 200, 228, 253. |
| `files/webcamholder.html` | 55 | Webcam holder; `app-webcam-holder` at line 1 and `app-presenter-cams` at lines 6 and 30. |

## Component Comparison

### Room Shell, Navigation, Sidebar

| Surface | Reference evidence | Current app evidence | Status | Detail |
| --- | --- | --- | --- | --- |
| Root theme | `files/file2.html:8` has `class="lightTheme"`; reference CSS variables in `files/file-1.html:646-656`. | Current defaults in `web/src/routes/layout.css:7-33`. | Verified present / visual not verified | Both sources contain theme/color definitions. Pixel parity depends on live runtime theme state, which was not visually verified. |
| Top nav container | `files/file2.html:349` has `navbar navbar-expand-md navbar-dark fixed-top mainAppNav`. | `RoomTopNav` is rendered at `web/src/routes/rooms/[id]/+page.svelte:336-344`. | Verified present / visual not verified | Both sources contain a top-nav surface. Pixel match was not visually verified. |
| Brand mark | Reference `brand-logo` at `files/file2.html:383` and `important-doc.html:382`. | `RoomTopNav.svelte` uses text branding and comments that the logo is not exact at `web/src/lib/components/RoomTopNav.svelte:283-287`. | Verified difference | Reference contains a logo element; current source uses non-exact text branding. |
| Sidebar shell | Reference `room-sidebar` at `files/file2.html:15`. | Current sidebar rendered at `web/src/routes/rooms/[id]/+page.svelte:359-364`. | Verified present / differences listed below | Both sources contain a sidebar surface. Specific content differences are listed in this table. |
| Version text | Reference `Version: v4.0.1-c0fee8f5` at `important-doc.html:45`. | Current `Version: v0.0.1` at `web/src/lib/components/RoomSidebar.svelte:55`. | Verified difference | Exact text differs. |
| Archives menu | Reference Bootstrap dropdown at `important-doc.html:125-148` with Alert Logs and Chat Logs items at `important-doc.html:154-176`. | Current renders separate grouped buttons at `web/src/lib/components/RoomSidebar.svelte:108-137`. | Verified difference | Reference uses dropdown DOM; current source uses separate buttons. |
| Main split | Reference `id="mainAreaSplit"` at `files/file2.html:656`; `alert-chat-box` at `files/file2.html:664`; `presentation-box` at `files/file2.html:12512`. | Current `Split` rendered at `web/src/routes/rooms/[id]/+page.svelte:368-375`; split implementation at `web/src/lib/components/Split.svelte:109-137`. | Verified present / visual not verified | Both sources contain a split layout. Pixel match was not visually verified. |
| Gutter | Reference `as-split-gutter` and `as-split-gutter-icon` at `files/file2.html:12494-12503`. | Current gutter width/color/grip at `web/src/lib/components/Split.svelte:167-176` and `web/src/lib/components/Split.svelte:194-212`. | Verified present / visual not verified | Both sources contain a gutter and grip implementation. Pixel match was not visually verified. |

### Stage Area

| Surface | Reference evidence | Current app evidence | Status | Detail |
| --- | --- | --- | --- | --- |
| Stage tabs | Reference shows `Screens`, `Streams`, `Notes`, `Files` at `files/file6.html:9846-9945` and `files/subnavbar.html:21-100`. | Current `MainStage` defines `type Tab = 'screens' | 'notes' | 'files'` and TABS only Screens/Notes/Files at `web/src/lib/components/MainStage.svelte:62-74`. | Verified missing | `Streams` exists in reference HTML and is absent from the current `MainStage` tab definition. |
| Current source comment | Reference has Streams. | Current comment says "the reference room has no Streams tab" at `web/src/lib/components/MainStage.svelte:40`, which conflicts with `files/subnavbar.html:47` and `files/file6.html:9877`. | Verified difference | The source comment is contradicted by the cited HTML reference lines. |
| Screens empty state | Reference says `No one is presenting right now...` at `files/file6.html:9969`. | Current says `Waiting for a presenter to share their screen...` or `Connecting...` at `web/src/lib/components/ScreenStage.svelte:56`. | Verified difference | Exact empty text differs. |
| Files hidden player | Reference has `id="mp3player"` at `files/file6.html:13142`. | `rg -n "mp3player" web/src` returned no match. | Verified missing | The reference ID was not found in current source. |
| Notes/Files panels | Reference shows Notes and Files tabs/content in `files/file6.html:9911-9945` and Files again at `files/file6.html:13037`. | Current renders `NotesPanel` and `FilesPanel` at `web/src/lib/components/MainStage.svelte:110-113`; Files categories at `web/src/lib/components/FilesPanel.svelte:16`. | Verified present / visual not verified | Both sources contain Notes and Files surfaces. Pixel match was not visually verified. |

### Alerts And Chat

| Surface | Reference evidence | Current app evidence | Status | Detail |
| --- | --- | --- | --- | --- |
| Alerts pane | Reference `app-alerts` in `files/file2.html:683-12315`. | Current `AlertFeed` is mounted by `AlertsChatDock` and room page at `web/src/routes/rooms/[id]/+page.svelte:504-521`. | Verified present / differences listed below | Both sources contain an alerts pane. Specific differences are listed in this table. |
| Alert row menu glyph | Reference rows use the literal vertical-dot glyph repeatedly, e.g. `files/file6.html:138`, with dropdown menus at `files/file6.html:143`. | Current alert rows use `<Icon name="ellipsis-v">` at `web/src/lib/components/AlertFeed.svelte:225`; current chat rows use the reference glyph at `web/src/lib/components/ChatPanel.svelte:203-206`. | Verified difference | Reference alert rows and current alert rows use different glyph implementations. |
| Alert actions | Reference dropdown includes User Info and Copy repeatedly, e.g. `files/file6.html:143-169`. | Current alert menu has User Info, Copy, delivery report, Delete at `web/src/lib/components/AlertFeed.svelte:230-260`. | Verified difference / verified extra | Delivery report and Delete are present in current source lines cited; those specific actions are not part of the cited reference dropdown slice. |
| Alert inline composer | Reference alert posting is via `app-post-alert-modal` at `files/file12.html:1` and no inline symbol/side/note composer is present in that modal evidence. | Current `AlertFeed` has an inline composer at `web/src/lib/components/AlertFeed.svelte:315-326`. | Verified extra | The current inline composer is present at cited current lines and not present in the cited Post Alert modal reference. |
| Chat pane | Reference `app-chat` at `files/file2.html:12325`, Off Topic at `files/as-splitter.html:9590`, textarea at `files/as-splitter.html:9663-9671`. | Current Off Topic at `web/src/lib/components/ChatPanel.svelte:162`, textarea at `web/src/lib/components/ChatPanel.svelte:267-277`, image/GIF at `web/src/lib/components/ChatPanel.svelte:279-281`. | Verified present / visual not verified | Both sources contain the cited chat labels/controls. Pixel match was not visually verified. |
| Chat row menu | Reference menu glyph/dropdown at `files/file6.html:138-169`. | Current chat explicitly uses the reference glyph at `web/src/lib/components/ChatPanel.svelte:203-206` and menu items at `web/src/lib/components/ChatPanel.svelte:211-229`. | Verified present / visual not verified | Both sources contain the cited row-menu glyph/menu concept. Pixel match was not visually verified. |

### Modals And Floating Surfaces

| Surface | Reference evidence | Current app evidence | Status | Detail |
| --- | --- | --- | --- | --- |
| Shared modal chrome | Reference modals use Bootstrap `modal fade`, `modal-dialog`, `modal-content`, and `btn-close-white`, e.g. `files/file16.html:4-31`. | Current shared modal is custom `.backdrop`/`.panel` at `web/src/lib/components/Modal.svelte:37-73` with styles at `web/src/lib/components/Modal.svelte:76-145`. | Verified difference | Reference modal DOM classes and current modal DOM classes differ. |
| User settings | Reference `app-user-settings-modal` at `files/appusersettingsmodal.html:1` and `files/file9.html:1`. | Current `SettingsModal` includes App/Alert/Chat tabs at `web/src/lib/components/modals/SettingsModal.svelte:135-151` and controls at `web/src/lib/components/modals/SettingsModal.svelte:155-455`. | Verified present / visual not verified | Both sources contain a user settings surface. Exact layout and pixel match were not visually verified. |
| AV settings | Reference title and device IDs: `Audio/Video Settings` at `files/file10.html:14`, `speakers-device` at `files/file10.html:113`, `audio-deviceList` at `files/file10.html:166`, `video-deviceList` at `files/file10.html:178`, `Change Devices` at `files/file10.html:188`. | Current title/tabs/fields at `web/src/lib/components/modals/AVSettingsModal.svelte:125-229`, but IDs are `av-speaker`, `av-mic`, and `av-camera`. | Verified difference | Same type of modal exists, but cited DOM IDs differ. |
| Post Alert | Reference title and tabs at `files/file12.html:19-69`; media area has `Image / GIF / Video`, `filedragAlert`, `filedragMD`, and `fileListAlert` at `files/file12.html:61-212`. | Current has five separate tabs Text Alert/Text Url/Image/GIF/Video at `web/src/lib/components/modals/PostAlertModal.svelte:136-185`; image upload only under image at `web/src/lib/components/modals/PostAlertModal.svelte:208-220`. | Verified difference | Reference has three tabs with combined media; current has five tabs and different upload DOM. |
| Polls | Reference floating holder `pollModalCompHolder` at `files/file13.html:3`, title `Polls` at `files/file13.html:11`, `Create New Poll` at `files/file13.html:66`, `Pre-Canned Polls` at `files/file13.html:78`, anonymous checkbox at `files/file13.html:152-163`, `Save To Canned` at `files/file13.html:185`, and `savedPolls` at `files/file13.html:200`. | Current title `Create a poll` at `web/src/lib/components/PollModal.svelte:97`, create-only fields at `web/src/lib/components/PollModal.svelte:108-154`. | Verified difference / verified missing | Current source lacks the cited pre-canned and save-to-canned reference UI. |
| Chat Logs | Reference `app-chat-logs-modal` at `files/file14.html:1` with large log content. | Current `ChatLogsModal` title at `web/src/lib/components/modals/ChatLogsModal.svelte:15`; current implementation uses empty local state. | Verified difference | Reference dump contains log content; current source defines an empty local list state. |
| Alert Logs | Reference title `Alerts Logs` and reload/list items at `files/file15.html:15-80`. | Current title `Alert Logs` at `web/src/lib/components/modals/AlertLogsModal.svelte:15` with empty local state. | Verified difference | Exact title and list content differ. |
| Session Control | Reference title at `files/file16.html:23`, empty body at `files/file16.html:33-35`, Done button at `files/file16.html:37-43`. | Current title at `web/src/lib/components/modals/SessionControlModal.svelte:186`, intro and action list at `web/src/lib/components/modals/SessionControlModal.svelte:187-208`. | Verified extra / verified difference | Current source contains action UI where the cited reference body is empty. |
| Mobile app info | Reference title at `files/file17.html:18`. | Current title matches at `web/src/lib/components/modals/MobileAppInfoModal.svelte:12`. | Verified present / visual not verified | The title exists in both sources. Body assets/links were not visually verified. |
| Reply modal | Reference `files/file18.html`. | Current `ReplyModal` uses `Reply` title and Send footer at `web/src/lib/components/modals/ReplyModal.svelte:30-48`. | Verified difference | Current cited title/footer do not match the reference modal shape captured in `files/file18.html`. |
| Alert Q&A | Reference `files/file19.html` and full snapshot title `Q&A for Alert:` at `files/file2.html:82544`. | Current title is `Q&A - {alert.symbol}` at `web/src/lib/components/AlertQaModal.svelte:138`. | Verified difference | Exact title text differs. |
| Muted users | Reference title `Muted Chat Users` at `files/file20.html:18`. | Current title `Muted / Ignored Users` at `web/src/lib/components/modals/MutedUsersModal.svelte:16`. | Verified difference | Exact title differs. |
| Followed users | Reference title `Followed Chat Users` at `files/file21.html:18` and duplicate `files/file24.html`. | Current title `Followed Users` at `web/src/lib/components/modals/FollowedUsersModal.svelte:16`. | Verified difference | Exact title differs. |
| Screenshare preview | Reference `files/file22.html`. | Current room has share/camera stage controls at `web/src/routes/rooms/[id]/+page.svelte:433-499`; no exact `app-screenshare-preview` component path was found by source search. | Visual not verified / source match not found | A current exact matching component was not proven by source search; live workflow capture is required. |
| Recording preview | Reference `files/file23.html`. | Current `RecPreview` title and delayed note at `web/src/lib/components/RecPreview.svelte:141-174`. | Verified present / verified text difference | Surface exists in current source; exact case/punctuation differs. |
| Scheduled Alerts | Reference table columns Sender/Alert/Repeat/Actions at `files/file25.html:41-50`. | Current `ScheduledAlertsModal` includes a composer form at `web/src/lib/components/modals/ScheduledAlertsModal.svelte:58-79` and list at `web/src/lib/components/modals/ScheduledAlertsModal.svelte:81-111`. | Verified difference / verified extra | Current source contains a composer form not shown in the cited reference table header. |
| Alert Send Report | Reference `Alert Sent Report. AlertID:` at `files/file26.html:17`. | Current title matches shape at `web/src/lib/components/modals/AlertSendReportModal.svelte:26-29` and `web/src/lib/components/modals/AlertSendReportModal.svelte:54`. | Verified present / visual not verified | Title pattern exists in both sources. Body pixel/data match was not verified. |
| All user PM | Reference `app-all-user-pmmodal` at `files/file27.html:1`. | Current `AllUserPmModal` title/list at `web/src/lib/components/modals/AllUserPmModal.svelte:29-48`. | Verified present / visual not verified | Surface exists in both sources. Pixel match was not visually verified. |
| Advanced Search | Reference title and controls at `files/file28.html:17-363`, including `selectTraderDropdown`, `selectRoomDropdown`, `search-term-input`, `checkNonTradeAlert`, `checkArchives`, `startDateInput`, and `endDateInput`. | Current title at `web/src/lib/components/modals/AdvancedSearchModal.svelte:63`; native selects at `web/src/lib/components/modals/AdvancedSearchModal.svelte:100-114`. | Verified difference | Reference uses Bootstrap dropdown IDs; current source uses native selects/generated IDs. |
| Alert Filter | Reference title/body at `files/file29.html:14-42`, `show-alerts` ID at `files/file29.html:32`. | Current title `Filter out alerts` at `web/src/lib/components/modals/AlertFilterModal.svelte:14`; checkbox text at `web/src/lib/components/modals/AlertFilterModal.svelte:15-18`; no `show-alerts` ID. | Verified difference | Exact title and checkbox ID differ. |
| WebRTC troubleshooter | Reference title/labels at `files/file30.html:20-78`. | Current title `Connectivity Check` at `web/src/lib/components/modals/ConnectivityCheckModal.svelte:76`; labels `UDP`, `TCP`, `STUN`, `TURN` at `web/src/lib/components/modals/ConnectivityCheckModal.svelte:15-18`. | Verified difference | Title and labels differ. |
| Rich Text Editor | Reference title `Rich Text Editor` at `files/file31.html:18`. | Current title `Rich Text` at `web/src/lib/components/modals/RichTextEditorModal.svelte:135`. | Verified difference | Exact title differs. |
| Private chat | Reference `app-privchat` at `files/file32.html:1`. | Current `PrivateChat` renders panel/composer at `web/src/lib/components/PrivateChat.svelte:71-118`. | Verified present / visual not verified | Surface exists in both sources. Pixel match was not visually verified. |
| YouTube modal | Reference title `Play YouTube For All` at `files/file8.html:14`. | Current `PlayYouTubeModal` title `Play YouTube Video` at `web/src/lib/components/modals/PlayYouTubeModal.svelte:52`; separate `MediaForAllModal` title `Play music for all` at `web/src/lib/components/modals/MediaForAllModal.svelte:131`. | Verified difference | Current titles/scope differ from reference title. |
| Debug Log | Reference title and textarea at `files/file11.html:20-44`. | Current title at `web/src/lib/components/modals/DebugLogModal.svelte:46`; textarea/body at `web/src/lib/components/modals/DebugLogModal.svelte:49-57`. | Verified present / verified extra | Surface exists; current source adds Copy footer and custom modal chrome. |

### Runtime Fragments

| Fragment | Reference evidence | Current app evidence | Status | Detail |
| --- | --- | --- | --- | --- |
| Connected message | `files/connected.html:3` and `files/file2.html:16334` have `id="connectedMsg"`. | `rg -n "connectedMsg" web/src` returned no match. | Verified missing | Runtime connected indicator was not found by source search. |
| Webcam audio element | `files/file34.html:5` and `files/file2.html:84058` have `id="webcam"`. | `rg -n "id=['\"]webcam" web/src` returned no match. | Verified missing | The reference global audio element was not found by source search. |
| Toast container | `files/file33.html:2` and `files/file2.html:84068` have `id="toast-container"`. | `rg -n "toast-container" web/src` returned no match. | Verified missing | Reference toast container was not found by source search. |
| Page source shell | `files/pagesource.html:608` has `<app-root></app-root>`. | `web/src/app.html:16` has `%sveltekit.body%`. | Expected framework mismatch | Angular root and SvelteKit shell will not be DOM-identical. |

## Existing Test/Screenshot Caveat

The repo contains e2e artifacts, but they are not hard proof of current pixel parity:

- `web/e2e/proroom.e2e.ts:80-87` expects `Streams`.
- Current `web/src/lib/components/MainStage.svelte:62-74` does not render `Streams`.
- `web/e2e/proroom.e2e.ts:43-49` queries `.stage-actions button`, while current room action buttons are in the route markup as `.ctrl` buttons around `web/src/routes/rooms/[id]/+page.svelte:433-499`.

That creates a source-level conflict: the e2e file expects selectors/features that the cited current source does not render. The screenshots/tests are not current proof until rerun against the current app and backend data.

## Evidence-Derived Mismatch List

1. Reference contains `Streams` tab and stream empty state at `files/subnavbar.html:47` and `files/file6.html:9877`; current `MainStage` omits `Streams` at `web/src/lib/components/MainStage.svelte:62-74`.
2. Reference contains `brand-logo` at `files/file2.html:383`; current `RoomTopNav` uses non-exact text branding at `web/src/lib/components/RoomTopNav.svelte:283-287`.
3. Reference contains sidebar version `v4.0.1-c0fee8f5` and Archives dropdown DOM at `important-doc.html:45` and `important-doc.html:125-176`; current sidebar contains `v0.0.1` and separate archive buttons at `web/src/lib/components/RoomSidebar.svelte:55` and `web/src/lib/components/RoomSidebar.svelte:108-137`.
4. Current source contains alert inline composer at `web/src/lib/components/AlertFeed.svelte:315-326`; the cited reference posting surface is the Post Alert modal at `files/file12.html:1`.
5. Reference alert rows use the vertical-dot glyph at `files/file6.html:138`; current AlertFeed uses `<Icon name="ellipsis-v">` at `web/src/lib/components/AlertFeed.svelte:225`.
6. Reference Post Alert has three tabs and combined `Image / GIF / Video` upload/drop zone at `files/file12.html:33-75` and `files/file12.html:173-212`; current Post Alert has five separate tabs at `web/src/lib/components/modals/PostAlertModal.svelte:136-185`.
7. Reference Poll has `Polls`, `Create New Poll`, `Pre-Canned Polls`, anonymous checkbox, and `Save To Canned` at `files/file13.html:3-200`; current Poll is a create-only modal at `web/src/lib/components/PollModal.svelte:97-154`.
8. Reference Advanced Search uses Bootstrap dropdown IDs at `files/file28.html:49-245`; current Advanced Search uses native selects at `web/src/lib/components/modals/AdvancedSearchModal.svelte:100-114`.
9. Reference Scheduled Alerts table columns are Sender/Alert/Repeat/Actions at `files/file25.html:41-50`; current Scheduled Alerts includes a composer form at `web/src/lib/components/modals/ScheduledAlertsModal.svelte:58-79`.
10. Exact modal titles differ: `Alerts Logs`, `Muted Chat Users`, `Followed Chat Users`, `Rich Text Editor`, `Connectivity/Mic Troubleshooter`, and `Play YouTube For All` in reference do not match the cited current modal titles.
11. Reference runtime fragments `connectedMsg`, `id="webcam"`, `toast-container`, and `mp3player` exist at `files/connected.html:3`, `files/file34.html:5`, `files/file33.html:2`, and `files/file6.html:13142`; matching source searches in `web/src` returned no matches.
12. Visual pixel-perfect status remains not verified because no live browser screenshot/pixel diff was available in this session.
