# Reference vs. ours — gap analysis

Source: 8 parallel agents mined the saved reference HTML snapshots in `pro-room/files/`
(`odds-and-ends.html` richest — 21+ distinct modals incl `post-alert`) + our
`web/src/lib/components/**`, then a synthesis pass diffed them.
(`reference-html-forensics` workflow, 9 agents, ~976K tokens.)

**Headline:** 32 reference surfaces, 40 of our components, 33 gaps — **0 missing**,
17 mismatch, 1 unverifiable, 15 OK. Nearly every reference modal/nav/panel already
has a component; the work is **structural fidelity**, not new surfaces. These HTML
snapshots are third-party VISUAL REFERENCE ONLY — match structure/classes/icons,
never copy their text/data.

## HIGH — fix first (presenter/member surfaces actively being matched)

1. **PostAlertModal** — reference has **3 tabs**: `Text Alert`, `Text Url`, and ONE
   combined **`Image / GIF / Video`** tab (url input-group w/ `fa-link` prepend +
   multi-file upload + **drag-drop zone** + `rows=2` textarea). Ours splits media
   into **5 tabs** (Text/Url/Image/GIF/Video), single-file, no drop zone. Footer 5
   checkboxes + green `Post Alert` already match. → collapse media to one tab + add
   filedrag zone.
2. **PollModal** — reference is a **draggable FLOATING panel** (`#pollModalCompHolder`)
   with titlebar `Polls` + Min/Max/Close window buttons, **2 tabs** (`Create New Poll`
   / **`Pre-Canned Polls`**), step labels 1/2/3, ordered choice list, **`Save To
   Canned`** (`fa-floppy-o`), green `Send Poll`. Ours is a plain centered modal
   `Create a poll` with none of that chrome. → rebuild as floating panel + pre-canned tab.
3. **UserInfoModal** — reference puts the **gravatar `<img>` + `badge-danger 'Offline'`
   in the HEADER**; ours puts an initial-letter avatar + badge in the body. Footer
   labels match (Mention/Private Chat/Follow/Mute/Close) but reference uses
   `btn-outline-info` (Follow) / `btn-outline-warning` (Mute) / `btn-primary` (Close).
4. **AdvancedSearchModal** — reference uses bootstrap **multi-select dropdown-menus**
   for `--Select Traders--` / `--Select Rooms--` and a **`Rooms` refresh button
   (`fa-sync-alt`) inside the H5 title**. Ours uses native single `<select>` and lacks
   the refresh button. Field set otherwise matches.
5. **ScheduledAlertsModal** — reference is a **`modal-xl` TABLE** (cols Date/Time,
   Sender, Alert, Repeat, Actions w/ per-row delete), **no add-composer**. Ours is a
   normal-width modal with an ADD composer + simple list. → convert to the xl table;
   the composer is an addition not in the reference.
6. **Alert/Chat row kebab** — chat row correctly uses `⠇` (U+2807); **AlertFeed still
   uses `fa-ellipsis-v`** — reference uses `⠇` on BOTH. Row menu items match
   (User Info/Mention/Copy). → switch AlertFeed kebab to `⠇`.
7. **AlertFeed inline composer** — reference `app-alerts` has **NO inline composer**
   (alerts post ONLY via the Post Alert modal); ours renders a bottom symbol+side+note
   form when `canPost`. → remove inline composer + route `+` to PostAlertModal (already wired).

## MED

- **ReplyModal** — title should inject target user (`Private reply to <user>:`); reference has **no Send button** (Enter-to-send), footer only Close. Ours has static title + Send.
- **Settings, App tab** — reference blocks are `Color Theme` + `Room Layout` + `Chat Color Mode`; ours folds colors+size into one block + adds an `Edit my Info` button not in the reference App tab. Tab-sleep checkbox placement varies (App vs Chat). Mostly cosmetic ordering.
- **ConnectivityCheckModal** — title `Connectivity/Mic Troubleshooter` (h3) and full row labels (`UDP Enabled`/`TCP Enabled`/`STUN Server Connectivity`/`TURN Server Connectivity`); ours abbreviates.
- **PlayYouTubeModal** — title `Play YouTube For All`; reference uses an input-group with Save + `Play For All` as addon buttons (ours uses footer buttons).
- **SessionControlModal** — reference body was Angular-injected (empty in snapshot); single `Done` (btn-success btn-block) footer. Ours implements concrete admin actions — a reasonable superset; exact reference control list **unverifiable** without a live capture.
- **AlertQaModal** — reference HEADER embeds a **preview of the source alert** (avatar/created-at/username/body) titled `Q&A for Alert:`; ours titles `Q&A — {symbol}` with no embedded preview. Add the preview block.
- **RoomTopNav** — reference brand is an `<img class=brand-logo>`; ours renders room name as TEXT (self-flagged). Presenter broadcast controls render inline via snippet (reference gates by role; unverifiable vs a presenter capture).

## LOW (mostly title/label wording)

- MutedUsersModal: `Muted Chat Users` (ours `Muted / Ignored Users`).
- FollowedUsersModal: `Followed Chat Users` (ours `Followed Users`); reference Close is `btn-light`.
- AlertLogsModal: reference title `Alerts Logs` (plural).
- ScreenShare preview: reference is a floating draggable+resizable card w/ live `<video>` + title dropdown + 8 jQuery-UI resize handles — presenter-only, low priority.
- RecPreview: verify title copy `Recording Preview. (DELAYED UPTO 20s)` + `Recording paused.`
- PrivateChat: reference `app-privchat` has `fa-comments` brand navbar + panel-controls dropdown (not matched verbatim).
- MobileAppInfoModal: reference uses store-badge IMAGES (third-party assets — keep our FA-icon stand-in).

## UNVERIFIABLE — needs a direct read / capture

- **Presentation tabs (Screens/Streams/Notes/Files)** — confirm tab order, the hidden
  `Streams` tab, Notes Summernote/welcome-home-badge/rename/Download, and Files
  `Files/Images/Sounds` red count-badges by reading `MainStage`/`NotesPanel`/`FilesPanel`
  directly (not read in this pass).

## OK (already matching — 15)

ChatPanel (header/rows/tabs), AlertSendReportModal, AVSettingsModal, AlertFilterModal
(minor wording), ChatLogsModal, AllUserPmModal, Volume dropdown (polarity correct),
RoomSidebar (strong match), MobileAppInfoModal, AlertLogsModal, DebugLogModal,
RichTextEditorModal, RecPreview, PrivateChat, MediaForAllModal (intentional superset).
