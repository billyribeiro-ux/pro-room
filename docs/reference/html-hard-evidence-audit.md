# HTML Reference Evidence Audit

Date: 2026-06-14

## Scope and Evidence Rules

This audit is based on hard local evidence only:

- Reference HTML set audited: `files/*.html`.
- Count: 51 individual `.html` files under `files/`.
- Current app implementation checked: `web/src/routes/rooms/[id]/+page.svelte` and `web/src/lib/components/**/*.svelte`.
- Current app build check: `pnpm build` in `web/` completed successfully.
- Existing rendered app screenshots exist at `web/e2e/screenshots/*.png` and are all `1280 x 720` PNGs.

Important limitation: I did not find a literal folder named `computer` inside this repository or under the searched Desktop depth. The local folder that contains the room reference HTML snapshots is `files/`, so this report uses `files/` as the reference HTML folder. If there is a different external folder named `computer`, this report must be re-run against that path.

Important pixel-evidence limitation: the existing app screenshots are useful evidence, but at least one screenshot is stale relative to current source. `web/e2e/screenshots/04-tab-files.png` visibly shows a `Streams` tab, while current `web/src/lib/components/MainStage.svelte` defines only `screens`, `notes`, and `files` tabs at lines 62-75. Therefore this report does not claim pixel-perfect equality unless the matching evidence exists in both reference source and current source/render artifacts.

## Every HTML File Read

| HTML file | Lines | Evidence summary |
|---|---:|---|
| `files/afterwebcamholder.html` | 118 | `app-presenter-cams`; webcam holder fragment. |
| `files/appusersettingsmodal.html` | 1191 | `app-user-settings-modal`; `user-settings-modal`; General Settings. |
| `files/as-splitter.html` | 13139 | Main split; `app-alerts`, `app-chat`, `app-presentationarea`, notes/files/webcam slices. |
| `files/avsettingsmodal.html` | 211 | AV settings modal markup without wrapper component tag. |
| `files/avsettingsmodal1.html` | 216 | `app-av-settings-modal`; AV settings modal. |
| `files/connected.html` | 8 | Connected status fragment, `connectedMsg`. |
| `files/dropdownstart.html` | 161 | Volume dropdown and room sound toggles. |
| `files/dropdownvolume.html` | 147 | Volume dropdown and room sound toggles. |
| `files/file-1.html` | 4928 | CSS/design-system evidence; `#mainAreaSplit`, `.room-sidebar`, `.mainAppNav`. |
| `files/file2.html` | 84071 | Full room snapshot with 36 Angular components and all major modals. |
| `files/file3.html` | 83721 | Full room snapshot duplicate/variant with same major component set as `file2`. |
| `files/file4.html` | 80677 | Full room snapshot duplicate/variant with same major component set as `file2`. |
| `files/file5.html` | 251 | Top nav and volume dropdown. |
| `files/file6.html` | 13166 | Main split; alerts/chat/presentation area. |
| `files/file7.html` | 81 | User Info modal. |
| `files/file8.html` | 63 | Play YouTube modal. |
| `files/file9.html` | 1191 | User Settings modal. |
| `files/file10.html` | 216 | AV Settings modal. |
| `files/file11.html` | 61 | Debug Log modal. |
| `files/file12.html` | 333 | Post Alert modal. |
| `files/file13.html` | 216 | Poll floating panel. |
| `files/file14.html` | 59164 | Chat Logs modal with large log data. |
| `files/file15.html` | 101 | Alert Logs modal. |
| `files/file16.html` | 49 | Session Control modal. |
| `files/file17.html` | 70 | Mobile App Info modal. |
| `files/file18.html` | 99 | Reply modal. |
| `files/file19.html` | 170 | Alert Q&A modal. |
| `files/file20.html` | 48 | Muted Users modal. |
| `files/file21.html` | 48 | Followed Users modal. |
| `files/file22.html` | 74 | Screenshare Preview component. |
| `files/file23.html` | 38 | Recording Preview component. |
| `files/file24.html` | 48 | Followed Users duplicate/variant. |
| `files/file25.html` | 73 | Scheduled Alerts modal. |
| `files/file26.html` | 56 | Alert Send Report modal. |
| `files/file27.html` | 55 | All User PM modal. |
| `files/file28.html` | 410 | Advanced Search modal. |
| `files/file29.html` | 62 | Alert Filter modal. |
| `files/file30.html` | 119 | WebRTC Troubleshooter modal. |
| `files/file31.html` | 57 | Rich Text Editor modal. |
| `files/file32.html` | 62 | Private Chat panel. |
| `files/file33.html` | 4 | Toast container fragment. |
| `files/file34.html` | 7 | Audio sink fragment. |
| `files/mixednavs.html` | 20 | Navigation fragment. |
| `files/navbar.html` | 251 | Top nav and volume dropdown. |
| `files/navbars-room.html` | 196 | Navbar room fragment. |
| `files/navfile.html` | 13 | Navigation fragment. |
| `files/odds-and-ends.html` | 119655 | Richest full room snapshot; main split, modals, duplicated loaded shell/CSS. |
| `files/pagesource.html` | 615 | Page source shell with `app-root`. |
| `files/reload.html` | 9 | Reload nav fragment. |
| `files/subnavbar.html` | 261 | Main presentation tabs, including `Streams`. |
| `files/webcamholder.html` | 56 | Presenter cams/webcam holder fragment. |

## Reference Component Inventory

The richest snapshots (`files/file2.html`, `files/file3.html`, `files/file4.html`, `files/odds-and-ends.html`) contain these Angular component tags:

`app-alert-filter-modal`, `app-alert-logs-modal`, `app-alert-qa-modal`, `app-alert-send-report-modal`, `app-alerts`, `app-alerts-advanced-search`, `app-all-user-pmmodal`, `app-av-settings-modal`, `app-chat`, `app-chat-logs-modal`, `app-debug-log-modal`, `app-followed-users-modal`, `app-mobile-app-info-modal`, `app-muted-users-modal`, `app-note`, `app-play-youtube-modal`, `app-poll-modal`, `app-post-alert-modal`, `app-presentationarea`, `app-presenter-cams`, `app-privchat`, `app-rec-preview`, `app-reply-modal`, `app-rich-text-editor`, `app-room`, `app-room-roster`, `app-roomscroller`, `app-root`, `app-scheduled-alerts-modal`, `app-screenshare-preview`, `app-session-control-modal`, `app-st-message`, `app-user-info-modal`, `app-user-settings-modal`, `app-webcam-holder`, `app-webrtc-troubleshooter`.

Direct line evidence:

- Full reference room: `files/file2.html:15` has `.room-sidebar`, `files/file2.html:349` has `.mainAppNav`, `files/file2.html:656` has `id="mainAreaSplit"`.
- Full reference major components: `files/file2.html:683` `app-alerts`, `files/file2.html:12325` `app-chat`, `files/file2.html:12589` `app-presentationarea`.
- Full reference modal block starts: `files/file2.html:16517` settings, `files/file2.html:18164` post alert, `files/file2.html:18528` poll, `files/file2.html:83219` advanced search, `files/file2.html:83763` troubleshooter, `files/file2.html:83979` private chat.
- CSS/design-system evidence: `files/file-1.html:938` `#mainAreaSplit`, `files/file-1.html:945` `.room-sidebar`, `files/file-1.html:1269` `.mainAppNav`.

## Current App Surface Map

| Reference surface | Current app file | Evidence-backed status |
|---|---|---|
| Room route / shell | `web/src/routes/rooms/[id]/+page.svelte` | Present, not fully pixel-verified. Uses `RoomTopNav`, `RoomSidebar`, `Split`, `AlertsChatDock`, `MainStage` at lines 336-375 and 503-535. |
| Top nav | `web/src/lib/components/RoomTopNav.svelte` | Mostly present. Reference brand is image; current app uses text room name. |
| Sidebar/roster | `web/src/lib/components/RoomSidebar.svelte` | Present. Includes powered block, capabilities, archive items, muted/followed users, roster buttons. |
| Alerts/chat split | `web/src/lib/components/AlertsChatDock.svelte` | Present. Uses internal resize gutter and renders `AlertFeed` + `ChatPanel`. |
| Alerts feed | `web/src/lib/components/AlertFeed.svelte` | Present but has structural mismatch: inline alert composer exists in current app; reference uses modal posting. |
| Chat panel | `web/src/lib/components/ChatPanel.svelte` | Strong source match for tabs, textarea composer, row menu, user info/mention/copy. |
| Presentation tabs | `web/src/lib/components/MainStage.svelte` | Present but missing `Streams` tab in current source. |
| Notes panel | `web/src/lib/components/NotesPanel.svelte` | Present and handles HTML note body + download; needs refreshed pixel verification. |
| Files panel | `web/src/lib/components/FilesPanel.svelte` | Present with Files/Images/Sounds and count badges; needs mp3/audio-sink parity check. |
| Poll modal/panel | `web/src/lib/components/PollModal.svelte` | Present but not pixel-matched; current is centered modal, reference is floating panel with pre-canned tab. |
| Post Alert modal | `web/src/lib/components/modals/PostAlertModal.svelte` | Present but not pixel-matched; current splits media into three tabs, reference has one combined media tab. |
| Advanced Search | `web/src/lib/components/modals/AdvancedSearchModal.svelte` | Present but not pixel-matched; current native selects vs reference Bootstrap dropdown multi-selects and Rooms refresh button. |
| Scheduled Alerts | `web/src/lib/components/modals/ScheduledAlertsModal.svelte` | Present but not pixel-matched; current composer/list vs reference `modal-xl` table. |
| User Info | `web/src/lib/components/modals/UserInfoModal.svelte` | Present but not pixel-matched; current initial avatar/body layout vs reference gravatar/header layout. |
| AV Settings | `web/src/lib/components/modals/AVSettingsModal.svelte` | Present, source covers user/presenter tabs and device selectors. |
| Connectivity/Troubleshooter | `web/src/lib/components/modals/ConnectivityCheckModal.svelte` | Present but title/row labels differ from reference. |
| Play YouTube | `web/src/lib/components/modals/PlayYouTubeModal.svelte` | Present but title and button placement differ from reference. |
| Mobile App Info | `web/src/lib/components/modals/MobileAppInfoModal.svelte` | Present but uses generic store URLs/icons instead of reference app-specific links/images. |
| Reply modal | `web/src/lib/components/modals/ReplyModal.svelte` | Present, but not proven wired into message actions in reviewed source. |
| Alert Q&A | `web/src/lib/components/AlertQaModal.svelte` | Present but richer/different; missing reference alert-preview header. |
| Private Chat | `web/src/lib/components/PrivateChat.svelte` | Present but simplified in-memory panel. |
| Recording Preview | `web/src/lib/components/RecPreview.svelte` | Present; copy differs in casing from reference. |
| Rich Text Editor | `web/src/lib/components/modals/RichTextEditorModal.svelte` | Present; title differs from reference. |

## Matches With Strong Evidence

### Top-Level Room Structure Exists

Reference evidence:

- `files/file2.html:15` shows `.room-sidebar`.
- `files/file2.html:349` shows `.mainAppNav`.
- `files/file2.html:656` shows `id="mainAreaSplit"`.
- `files/as-splitter.html:4` and `files/file6.html:4` also show `id="mainAreaSplit"`.

Current app evidence:

- `web/src/routes/rooms/[id]/+page.svelte:336-344` renders `RoomTopNav`.
- `web/src/routes/rooms/[id]/+page.svelte:358-377` renders `RoomSidebar` and `Split`.
- `web/src/routes/rooms/[id]/+page.svelte:503-521` renders `AlertsChatDock`.
- `web/src/routes/rooms/[id]/+page.svelte:524-535` renders `MainStage`.

Conclusion: the major shell surfaces exist. Pixel-perfect status is not fully proven because the current runtime capture was not refreshed after source changes.

### Chat Composer and Message Row Behavior Mostly Match

Reference evidence:

- `files/file2.html:12339` has `chatHeader`.
- `files/file2.html:12353` has `chatTabs`.
- `files/file2.html:12366` and `files/file2.html:12381` show `Main Chat` and `Off Topic`.
- `files/file2.html:12458-12466` shows a `textarea` with placeholder `Type your message here..`.
- `files/file6.html:129-138` shows `.msgMenu` and the literal `⠇` row menu glyph.

Current app evidence:

- `web/src/lib/components/ChatPanel.svelte:146-180` renders chat header, channel tabs, search and settings.
- `web/src/lib/components/ChatPanel.svelte:203-207` renders literal `⠇`.
- `web/src/lib/components/ChatPanel.svelte:264-284` renders textarea composer, emoji/image/GIF controls, and Send.

Conclusion: source-level match is strong for the chat row/menu/composer structure. Visual parity still needs a fresh current screenshot after resolving the stale screenshot issue.

### Files Panel Category Structure Exists

Reference evidence:

- `files/file6.html:13021` has `.files-tabs`.
- `files/file6.html:13030-13084` shows `Files`, `Images`, and `Sounds` with `files-badge`.
- `files/file6.html:13142` shows `id="mp3player"`.

Current app evidence:

- `web/src/lib/components/FilesPanel.svelte:15-19` defines `Files`, `Images`, `Sounds`.
- `web/src/lib/components/FilesPanel.svelte:154-190` renders category tabs, search, refresh, upload.
- `web/src/lib/components/FilesPanel.svelte:297-300` styles `.badge`.

Conclusion: category tabs and badges exist. The reference hidden mp3 player/audio sink is not proven matched in current app source.

### Notes Panel Has Named Tabs and HTML Body Rendering

Reference evidence:

- `files/file6.html:10025` shows notes pane.
- `files/file6.html:10144` shows a named note tab.
- `files/file6.html:13014` shows Files pane following Notes in the same presentation area.

Current app evidence:

- `web/src/lib/components/NotesPanel.svelte:162-185` renders note tabs with first-tab home icon.
- `web/src/lib/components/NotesPanel.svelte:189-231` renders selected note header, actions, download, and sanitized HTML body.
- `web/src/lib/components/NotesPanel.svelte:239-244` wires `RichTextEditorModal`.

Conclusion: source-level structure exists. Pixel match for reference note content/layout is not proven without fresh render capture.

## Mismatches and Missing Pixel-Fidelity Items

### 1. Alerts Feed Has an Inline Composer That Reference Does Not Show

Reference evidence:

- `files/file12.html:1-331` is the Post Alert modal.
- `files/file2.html:18164-18527` is the Post Alert modal inside the full room.
- Reference `app-alerts` starts at `files/file2.html:683` and closes at `files/file2.html:12315`; the posting evidence is modal-based at `files/file2.html:18164`, not an inline symbol/side/note form inside the alert pane.

Current app evidence:

- `web/src/lib/components/AlertFeed.svelte:151-203` renders alert header and opens `PostAlertModal`.
- `web/src/lib/components/AlertFeed.svelte:315-326` also renders an inline `Symbol` / `Side` / `Note` form.
- Existing rendered screenshot `web/e2e/screenshots/01-room-loaded.png` visibly shows that inline form in the Alerts pane.

Conclusion: not pixel-perfect. Remove or hide the inline alert composer if matching the reference strictly.

### 2. Alert Row Kebab Uses Font Awesome Icon Instead of Literal Reference Glyph

Reference evidence:

- `files/file6.html:129-138` shows `.msgMenu` with literal `⠇`.
- The same pattern repeats throughout alerts in `files/file6.html`.

Current app evidence:

- Chat uses the literal glyph: `web/src/lib/components/ChatPanel.svelte:203-207`.
- Alerts use Font Awesome ellipsis: `web/src/lib/components/AlertFeed.svelte:217-226` renders `<Icon name="ellipsis-v" />`.

Conclusion: not pixel-perfect. Alert rows should use the same literal `⠇` treatment as chat rows.

### 3. Presentation Area Is Missing the Reference Streams Tab in Current Source

Reference evidence:

- `files/subnavbar.html:35-47` shows `id="streams-tab"` and label `Streams`.
- `files/as-splitter.html:9833-9850` shows `streams-tab`.
- `files/file6.html:9860-9877` shows `streams-tab`.
- `files/odds-and-ends.html:9841-9858` shows `streams-tab`.

Current app evidence:

- `web/src/lib/components/MainStage.svelte:62` defines tab type as only `screens | notes | files`.
- `web/src/lib/components/MainStage.svelte:71-75` defines only Screens, Notes, Files.
- Existing screenshot `web/e2e/screenshots/04-tab-files.png` shows Streams, but it conflicts with current source and is therefore stale evidence.

Conclusion: current source is not pixel-perfect against the reference. Add the Streams tab or clearly mark it intentionally omitted.

### 4. Post Alert Modal Splits Media Into Separate Tabs

Reference evidence:

- `files/file12.html:47` shows `Text Alert`.
- `files/file12.html:58` shows `Text Url`.
- `files/file12.html:69` shows one combined `Image / GIF / Video` tab.
- `files/file12.html:199-204` shows image upload/drop evidence including `filedragMD`.
- `files/file12.html:251-314` shows five footer checkboxes.

Current app evidence:

- `web/src/lib/components/modals/PostAlertModal.svelte:18-19` defines five tabs: `text`, `url`, `image`, `gif`, `video`.
- `web/src/lib/components/modals/PostAlertModal.svelte:135-187` renders `Text Alert`, `Text Url`, `Image`, `GIF`, `Video`.
- `web/src/lib/components/modals/PostAlertModal.svelte:239-260` renders the five footer checkboxes and Post Alert button.
- Existing rendered screenshot `web/e2e/screenshots/05-alert-modal.png` visibly shows separate Image/GIF/Video tabs.

Conclusion: footer options match well, but the tab structure is not pixel-perfect. Collapse Image/GIF/Video into one reference-style media tab and add drag/drop behavior.

### 5. Poll UI Is a Centered Modal, Not the Reference Floating Panel

Reference evidence:

- `files/file13.html:3` has `id="pollModalCompHolder"`.
- `files/file13.html:16`, `:26`, `:36-37` show Minimize, Maximize, Close titlebar controls.
- `files/file13.html:59-78` shows `Create New Poll` and `Pre-Canned Polls` tabs.
- `files/file13.html:185` shows `Save To Canned`.

Current app evidence:

- `web/src/lib/components/PollModal.svelte:97` renders shared `Modal` with title `Create a poll`.
- `web/src/lib/components/PollModal.svelte:105-159` renders question/options/anonymous poll form.
- Existing rendered screenshot `web/e2e/screenshots/13-poll-modal.png` shows the centered modal.

Conclusion: not pixel-perfect. Reference requires a floating/windowed poll panel with titlebar controls and pre-canned poll tab.

### 6. Advanced Search Uses Native Selects Instead of Reference Bootstrap Dropdowns

Reference evidence:

- `files/file28.html:17` title `Alerts Advanced Search`.
- `files/file28.html:25-27` title includes Rooms refresh button.
- `files/file28.html:57-61` `selectTraderDropdown` with `--Select Traders--`.
- `files/file28.html:241-245` `selectRoomDropdown` with `--Select Rooms--`.
- `files/file28.html:282-363` search term, checkboxes, and date inputs.

Current app evidence:

- `web/src/lib/components/modals/AdvancedSearchModal.svelte:63` title `Alerts Advanced Search`.
- `web/src/lib/components/modals/AdvancedSearchModal.svelte:97-115` uses native `<select>` controls.
- No Rooms refresh button exists in the modal title source.

Conclusion: present but not pixel-perfect.

### 7. Scheduled Alerts Modal Shape Differs

Reference evidence:

- `files/file25.html:10-13` uses `modal fade text-white` and `modal-dialog modal-xl`.
- `files/file25.html:20` title `Manage Scheduled Alerts`.
- `files/file25.html:31-57` table structure with `Sender`, `Alert`, `Repeat`, `Actions`.

Current app evidence:

- `web/src/lib/components/modals/ScheduledAlertsModal.svelte:58` title `Manage Scheduled Alerts`.
- `web/src/lib/components/modals/ScheduledAlertsModal.svelte:59-79` includes an add/schedule composer.
- `web/src/lib/components/modals/ScheduledAlertsModal.svelte:83-111` renders empty/list state, not the reference table structure.

Conclusion: not pixel-perfect. Convert to `modal-xl` table layout if strict matching is required.

### 8. Shared Modal Shell Is Not Bootstrap Reference Chrome

Reference evidence:

- Many focused files use Bootstrap structure: `modal fade > modal-dialog > modal-content > modal-header/body/footer`.
- Examples: `files/file8.html:9-23`, `files/file10.html:9-23`, `files/file12.html:9-29`, `files/file28.html:11-38`, `files/file30.html:9-31`.

Current app evidence:

- `web/src/lib/components/Modal.svelte:37-73` renders custom `.backdrop` and `.panel`.
- `web/src/lib/components/Modal.svelte:87-145` styles fixed `max-width: 440px`, custom header/body/footer.

Conclusion: the modal system exists, but most reference modals cannot be called pixel-perfect until their Bootstrap dimensions/chrome/classes are matched or intentionally accepted as app-native.

### 9. User Info Modal Uses Initial Avatar Instead of Reference Gravatar Header

Reference evidence:

- `files/file7.html:4` `id="user-modal"`.
- `files/file7.html:15-25` shows gravatar image and Offline badge in the header area.
- `files/file7.html:48-67` shows footer actions `@Mention`, `Private Chat`, `Follow`, `Mute`.

Current app evidence:

- `web/src/lib/components/modals/UserInfoModal.svelte:24-34` renders initial-letter avatar and badge in the body.
- `web/src/lib/components/modals/UserInfoModal.svelte:36-58` renders the footer actions.

Conclusion: actions exist; visual structure is not pixel-perfect.

### 10. Connectivity Modal Title and Row Labels Differ

Reference evidence:

- `files/file30.html:20` title `Connectivity/Mic Troubleshooter`.
- `files/file30.html:42`, `:54`, `:66`, `:78` labels `UDP Enabled`, `TCP Enabled`, `STUN Server Connectivity`, `TURN Server Connectivity`.
- `files/file30.html:97-104` Start Test and Copy Results buttons.

Current app evidence:

- `web/src/lib/components/modals/ConnectivityCheckModal.svelte:14-19` labels are shortened to `UDP`, `TCP`, `STUN`, `TURN`.
- `web/src/lib/components/modals/ConnectivityCheckModal.svelte:76` title is `Connectivity Check`.
- `web/src/lib/components/modals/ConnectivityCheckModal.svelte:66-74` has Start Test, Copy Results, Close.

Conclusion: behavior surface exists; copy and structure are not pixel-perfect.

### 11. Play YouTube Modal Title and Button Layout Differ

Reference evidence:

- `files/file8.html:14` title `Play YouTube For All`.
- `files/file8.html:9-23` uses Bootstrap modal chrome.

Current app evidence:

- `web/src/lib/components/modals/PlayYouTubeModal.svelte:52` title `Play YouTube Video`.
- `web/src/lib/components/modals/PlayYouTubeModal.svelte:47-50` places Save and Play For All in shared modal footer.

Conclusion: present but not pixel-perfect.

### 12. Mobile App Links Are Generic

Reference evidence:

- `files/file17.html:18` title `Download our mobile apps`.
- The reference file includes mobile app badge/link content for the original service.

Current app evidence:

- `web/src/lib/components/modals/MobileAppInfoModal.svelte:12` title matches.
- `web/src/lib/components/modals/MobileAppInfoModal.svelte:17-30` links to generic Apple App Store and Google Play pages.

Conclusion: modal exists, but app-specific links/assets are not a pixel/data match.

### 13. Alert Q&A Modal Is Richer/Different Than Reference

Reference evidence:

- `files/file19.html:16` has `modal-header align-items-start`.
- `files/file19.html:99-108` modal body/footer structure.
- `files/file2.html:82544` title `Q&A for Alert:`.
- `files/file2.html:82566-82569` shows alert preview/avatar evidence in the Q&A header.

Current app evidence:

- `web/src/lib/components/AlertQaModal.svelte:136-142` title `Q&A - {alert.symbol}`.
- `web/src/lib/components/AlertQaModal.svelte:144-230` renders thread list, answer/resolve, and composer.

Conclusion: current app has more functionality but does not match reference modal header/preview structure.

### 14. Rich Text Editor Title Differs

Reference evidence:

- `files/file31.html:18` title `Rich Text Editor`.

Current app evidence:

- `web/src/lib/components/modals/RichTextEditorModal.svelte:135` title is `Rich Text`.
- `web/src/lib/components/modals/RichTextEditorModal.svelte:137-177` renders toolbar and contenteditable editor.

Conclusion: surface exists but title/chrome are not pixel-perfect.

### 15. Recording Preview Copy Casing Differs

Reference evidence:

- `files/file23.html:13` `Recording Preview. (DELAYED UPTO 20s)`.
- `files/file23.html:32` `Recording paused.`

Current app evidence:

- `web/src/lib/components/RecPreview.svelte:141-144` renders `Recording Preview` and `(delayed up to 20s)`.
- `web/src/lib/components/RecPreview.svelte:174` renders `Recording paused.`

Conclusion: surface exists; reference copy/casing/punctuation is not exact.

## Current Render Artifacts

Existing current-app screenshot files:

- `web/e2e/screenshots/01-room-loaded.png` through `web/e2e/screenshots/21-members-online.png`.
- `file` reports each as `PNG image data, 1280 x 720, 8-bit/color RGB, non-interlaced`.

Do not rely on those screenshots alone for current pixel-perfect proof because they conflict with current source on the `Streams` tab. Current source evidence wins where screenshots are stale.

Attempted live refresh:

- API evidence: elevated loopback request to `http://127.0.0.1:8081/api/rooms` returned HTTP 200 and one room: `dev-room`.
- Web evidence: elevated loopback request to `http://127.0.0.1:5174` returned HTTP 200.
- Full Playwright refresh was interrupted by the user, so no new current screenshot from that attempt is used in this report.

## Verification Commands Run

- `find files -maxdepth 1 -type f -iname '*.html' | sort | wc -l` -> 51.
- Structured extraction over every `files/*.html` for component tags, IDs, modal IDs, headings, and key line anchors.
- `pnpm build` in `web/` -> success.
- `file web/e2e/screenshots/*.png` -> existing screenshots are valid 1280x720 PNGs.

## Strict Build/Fix Priority

1. Remove the inline alert composer from `AlertFeed.svelte` and make alert posting modal-only.
2. Change AlertFeed row menu from Font Awesome `ellipsis-v` to the literal reference glyph `⠇`.
3. Add/restore the `Streams` tab in `MainStage.svelte` or document that it is intentionally omitted.
4. Rebuild `PollModal.svelte` as the reference floating panel with titlebar controls and `Create New Poll` / `Pre-Canned Polls`.
5. Collapse Post Alert media tabs into one `Image / GIF / Video` tab and add the reference drag/drop file area.
6. Replace Advanced Search native selects with reference-style Bootstrap dropdown multi-select controls and title Rooms refresh button.
7. Convert Scheduled Alerts to the reference `modal-xl` table layout.
8. Align shared modal chrome with the Bootstrap reference before claiming pixel-perfect modal parity.

## Bottom Line

The app already contains most named surfaces from the reference HTML. The remaining work is primarily pixel/structure fidelity, not missing component coverage. The strongest mismatches proven by hard evidence are:

- inline alert composer exists in current app but not reference alert flow;
- missing `Streams` tab in current source;
- poll UI is centered modal instead of reference floating panel;
- Post Alert modal uses five tabs instead of the reference three-tab structure;
- multiple modals use custom app chrome instead of Bootstrap reference chrome.

