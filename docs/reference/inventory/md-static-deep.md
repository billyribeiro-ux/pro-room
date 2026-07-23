# md-static-deep — inventory

Scope: `docs/reference/static-folder-original-app-evidence.md`, `docs/reference/visual-evidence-deep/hard-evidence-deep.md`, `docs/reference/visual-evidence-deep/manifest.json`.

> **WORKING-TREE GAP (honest):** the two `.md` files are NOT on disk. `git status` shows them staged for deletion (` D`) alongside the whole `docs/reference/*.md` prose set. They exist only in `HEAD` (`git cat-file -s` returns 60381 / 45211 bytes). I read them via `git show HEAD:<path>`. Anyone re-running this inventory against the working tree will find them absent; only `manifest.json` is physically present. `git log --all` confirms origin commits `32340c2` (static-folder) and `cc8db6d` (hard-evidence-deep).

---

# static-folder-original-app-evidence.md
- **path**: docs/reference/static-folder-original-app-evidence.md (HEAD only; deleted from working tree)
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority, must be verified against the raw dumps
- **size**: 60381 bytes / 156 lines (from `git cat-file -s`; read in full via `git show`)
- **role**: mixed — explicitly triangulates member + presenter + admin-room + member-room capture JSONs plus role-agnostic saved HTML/bundle (determined from its "Reference Capture Facts" section listing all 4 captures with `Role/label:` member, presenter, admin-room, member-room)
- **format/quality**: prose analysis — an "Evidence Matrix" table (21 feature rows) cross-referencing four evidence classes: saved HTML `files/*.html`, extracted bundle `resources/*`, capture JSONs, and current `web/src` source. NOT a raw DOM or computed-style dump.
- **surfaces documented**: room shell/as-split layout, top nav, sidebar/roster/admin, presentation tabs (incl. Streams), webcam holder, post-alert modal, poll panel, user-settings modal, AV-settings modal, session-control, scheduled-alerts, advanced-search, logs/debug, private-chat/all-user-PM, muted/followed users, mobile-info/connectivity/WebRTC, media/recording/screenshare, alert QA/reports/filters, alert+chat rows/menus, notes/files/images/sounds
- **maps to (our components)**: nearly the whole `web/src/lib/components` tree — cites exact paths+lines: AlertFeed, AlertsChatDock, MainStage, RoomSidebar, RoomTopNav, PollModal, PrivateChat, RecPreview, FilesPanel, modals/SessionControlModal, admin.ts, api.ts (each row's "Current App Source Evidence" column gives file:line locators)
- **key findings** (cited):
  - Enumerates **56 distinct Angular `app-*` selectors** found in the saved HTML folder (line 15 + the full backticked list at line 23, e.g. `app-alerts`, `app-poll-modal`, `app-session-control-modal`, `app-webrtc-troubleshooter`). SECONDARY count — verify against `important-doc.html` raw DOM (which the sibling atlas lists with 36 app-* selectors).
  - Capture element counts asserted (line 18): full-member=1178, full-presenter=1178, ultra-admin-room=1177, ultra-member-room=1173. "Reference Capture Facts" gives per-file viewport/DPR/stylesheet(41)/states — e.g. member+presenter share states `tab:Screens, tab:Streams, tab:Notes, tab:Files, dropdown:1/2/3/7/8`; admin-room has `Subtrees: topnav, sidebar, presentation, webcams, roomShell` and **Controls: 156** (lines 61-103).
  - Claims **Streams tab is a "Concrete Gap"** (line 32): asserts `web/src/lib/components/MainStage.svelte:62` defines `type Tab = 'screens'` (screens/notes/files) while reference HTML+captures show four tabs incl. Streams. Highest-flagged gap — MUST re-verify against MainStage.svelte and raw tab DOM.
  - HTML folder term counts (lines 107-126) are load-bearing selectors for parity, e.g. `app-st-message`=714, `msgMenu`=365, `msg-box`=363, `alert-qa`=369, `as-split`=184, `webcamsHolder`=73. Source folder is `pro-room/files` (51 .html files, line 7) — one fewer than the 52 the deep atlas renders.
  - HTML-folder ids assert modal chrome ids not in prose elsewhere: `pollModalCompHolder`, `pollPanelTitlebar`, `scheduledAlertsModal`, `selectTraderDropdown`/`selectRoomDropdown`, `av-settings-modal`, `audio-deviceList`/`video-deviceList`.
- **notes**: PROSE, secondary — every count/selector here must be re-cited against the raw JSON captures and HTML DOM dumps before use (authority rule 0). It is the best single **narrative index** of which `files/*.html` fragment and which capture stylesheet-index backs each feature, but its counts (56 selectors, 1178 elements, "Streams = concrete gap") are analysis, not authority. Points at bundle evidence under `/private/tmp/original-app-evidence/analyzed-2026-06-14T22-21-48-994Z` (external to repo).

---

# hard-evidence-deep.md
- **path**: docs/reference/visual-evidence-deep/hard-evidence-deep.md (HEAD only; deleted from working tree)
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority, must be verified against the raw dumps
- **size**: 45211 bytes / 648 lines (from `git cat-file -s`; read in full via `git show`)
- **role**: mixed — "correct version" (original Angular app) vs "our version" (Svelte repo). Not role-segmented by member/admin; force-shows hidden modals ("inspection rendering, not native runtime state", line 20)
- **format/quality**: prose analysis, human-readable render of `manifest.json` (identical `Generated:` timestamp `2026-06-14T23:42:59.640Z`, identical source counts). Two parts: (1) 13 "Section: Correct vs Our" mapping cards; (2) "Original Fragment Atlas" cataloguing 52 fragments. Backed by rendered PNG thumbnails, NOT raw computed styles.
- **surfaces documented**: 13 mapping sections — Room Shell, Top Navbar/Volume/Reload, Sidebar/Roster/Admin, Presentation Tabs (Screens/Streams/Notes/Files), Alerts Panel/Rows/Posting, Post Alert Modal, Poll Window, User Settings, AV Settings, Advanced Search/Filter/Scheduled, Session/Logs/Reports admin modals, Chat/PrivateChat/Reply/QA, Media/YouTube/Mobile/ScreenShare/Recording — plus per-fragment atlas entries (afterwebcamholder … important-doc)
- **maps to (our components)**: each card's "Repo paths" gives explicit targets, e.g. Room Shell → `web/src/routes/rooms/+page.svelte` + RoomTopNav/RoomSidebar/AlertsChatDock/MainStage; Poll → PollModal.svelte + PollPanel.svelte; User Settings → modals/SettingsModal.svelte; AV → modals/AVSettingsModal.svelte; and screenshot artifacts `01-room-loaded.png` … `21-members-online.png`
- **key findings** (cited):
  - Source counts (lines 6-10): **52 original HTML fragments rendered**, 21 named repo screenshots, 4 Playwright failure screenshots (25 current total), 4 capture-geometry files. Original visuals rendered from saved HTML + harvested CSS, **not a fresh live original session** (limitation, line 17).
  - Fragment Atlas gives per-file **SHA + size + app selectors + modal ids + important ids + audited gap counts** — e.g. `as-splitter.html` SHA `8cff6c0cb8da970f`, **937.0 KB**, 8 app selectors, gaps 18/high 3 (lines 150-158); `appusersettingsmodal.html` **63.7 KB**, 20 modal ids incl. `user-app-settings`/`user-alert-settings`/`user-chat-settings` tabs, gaps 25/high 0.
  - **`important-doc.html` is the superset fragment**: **5.6 MB**, SHA `136e2a797e604f4a`, lists **36 `app-*` selectors** (app-alert-filter-modal … app-webrtc-troubleshooter) and 60+ modal ids incl. `replyModal`, `alertQAModal`, `webrtc-troubleshooter-modal`, `all-user-pm-modal` — the single richest raw fragment (lines 640-648).
  - Flags surfaces with **NO current screenshot** (code-evidence only): User Settings Modal (line 85), AV Settings Modal (line 93), Advanced Search/Filter/Scheduled Alerts (line 101) — "weak current visual until captured". These are the honest visual gaps.
  - `subnavbar.html` important ids = `mainTabs, noteChangeIndicator, notes-tab, screens-tab, streams-tab` (tail) — corroborates that a `streams-tab` exists in reference tab markup (relevant to the static-folder.md "Streams gap" claim).
- **notes**: PROSE, secondary — 1:1 prose render of `manifest.json`; use the JSON, not this, for machine reads. Its SHAs/sizes/id-lists are extracted-from-fragment facts (re-derivable and fairly hard) but the "Correct vs Our / Confidence" verdicts are analysis. Rendered-from-saved-HTML, so any "correct version" pixel claim ultimately traces to `files/*.html` + harvested CSS, not a live original run — treat as pointer to raw fragments.

---

# manifest.json
- **path**: docs/reference/visual-evidence-deep/manifest.json (PRESENT on disk)
- **kind**: json-capture — but derived index/catalog (extraction of the 52 fragments + mapping table), NOT a raw DOM+computed-style dump; treat as SECONDARY structured data
- **size**: 125590 bytes (~123 KB) — inspected structurally via `node -e`, not read whole
- **role**: mixed — same "correct(original) vs ours(repo)" framing as hard-evidence-deep.md; no per-role capture segmentation
- **format/quality**: structured JSON. Top-level keys (verified): `generatedAt`, `sourceCounts`, `limitations`, `originalCss`, `originalCodeEvidence`, `fragments`, `mappings`. Machine-readable backing data that hard-evidence-deep.md renders to prose (identical `generatedAt` `2026-06-14T23:42:59.640Z` and identical `sourceCounts`).
- **surfaces documented**: `fragments` = **array of 52** fragment records; `mappings` = **array of 13** section records (same 13 sections listed in the .md: Room Shell … Media/YouTube/Mobile/ScreenShare/Recording)
- **maps to (our components)**: `mappings[i].currentCode` = repo component paths, `mappings[i].currentShots` = screenshot artifacts, `mappings[i].files` = source fragments (e.g. mapping 0 Room Shell → +page.svelte + RoomTopNav/RoomSidebar/AlertsChatDock/MainStage, shot `01-room-loaded.png`)
- **key findings** (cited):
  - `sourceCounts` (verified): `{originalHtmlFragments:52, currentRepoScreenshots:21, currentFailureScreenshots:4, captureGeometryFiles:4}` — matches the .md prose exactly, so the .md is a faithful render.
  - Each `fragments[]` element has keys: `name, size, sha, appTags, ids, modalIds, buttons, inputs, gapCount, highGapCount, thumbnail` (verified on `fragments[0]` = afterwebcamholder.html: size 3971, sha `13a6f559dfaf287f`, appTags `["app-presenter-cams"]`, gapCount 8 / highGapCount 2). This is the structured source for the Atlas — `buttons`/`inputs` arrays are captured but were NOT rendered into the .md prose.
  - Each `mappings[]` element has keys: `name, files, currentShots, currentCode, correct, ours, confidence` (verified on `mappings[0]`). The `correct`/`ours`/`confidence` strings are the exact prose that appears in the .md cards.
  - `originalCss` and `originalCodeEvidence` point OUTSIDE the repo: `/private/tmp/original-app-evidence/analyzed-2026-06-14T22-21-48-994Z/...` (harvested stylesheet + `original-app-full-code-evidence.md`) — honest external dependency, may not exist on a fresh checkout.
  - `limitations` = array of 4 (matches the 4 bullets under "## Limits" in the .md, incl. "hidden modals force-shown = inspection rendering, not native runtime state").
- **notes**: This is the authoritative *machine* form of hard-evidence-deep.md (superset — carries `buttons`/`inputs` arrays the prose drops). Still SECONDARY vs the raw `files/*.html` DOM dumps and the capture JSONs it indexes: its `appTags`/`ids`/`sha`/`size` are extractions, and its `correct`/`ours`/`confidence` are analysis. Best used as the lookup table (fragment → sha/size/ids/gaps, section → repo paths/shots) to drive verification against the raw fragments, never as the parity ground truth itself.
