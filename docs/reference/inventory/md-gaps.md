# md-gaps — inventory of docs/reference gap/evidence/audit prose docs

**Scope:** GAP-ANALYSIS.md, HTML-EVIDENCE-GAPS.md, html-hard-evidence-audit.md, README.md — all under `docs/reference/`.

## ⚠️ Corpus-level honest gaps (apply to ALL four files)

1. **All four files are DELETED from the working tree.** `ls docs/reference/` shows none of them present (only `_gap-findings-raw.json`, `captures/`, `inventory/`, `visual-evidence*/`). `git status --porcelain --ignored` reports them as `D` (deleted). They still exist in `HEAD` (`git cat-file -s HEAD:docs/reference/<f>` returns sizes), so I recovered each via `git show HEAD:docs/reference/<f>` into the scratchpad and read those. Every citation below is from the HEAD blob, not a live working-tree file.
2. **The `files/*.html` reference corpus these docs are built on is ABSENT from the repo.** All four docs cite `files/file2.html:683`, `files/file12.html:47`, etc. as their authority. But `ls files/*.html` → "no matches", `git ls-tree -r --name-only HEAD | grep -c '^files/.*\.html$'` → **0**, and `git log --all -- 'files/*.html'` → empty (never committed). So the raw HTML dumps that every line-number citation in these four docs points to are **not present in this repo** and cannot be re-verified here. Per the authority rule, these `.md` files are PRIOR PROSE ANALYSIS of an evidence set that isn't in the tree — treat every claim as unverified against raw dumps.
3. **The raw JSON these docs reference has a doubled path.** `docs/reference/_gap-findings-raw.json` (present, 384162 bytes, JSON array of 52 `{file, identity, gaps}` objects) records `"file":"/Users/billyribeiro/Desktop/pro-room/pro-room/files/file14.html"` — note the doubled `pro-room/pro-room/` — another sign the source corpus lived outside this repo's tree.
4. **These docs contradict the JSON captures that ARE authority.** They describe a **legacy Angular 17 + Bootstrap "Darkly"** app (light/dark theme, `btn-close-white`, `modal fade`). The MEMORY/authority note says the governing capture is the **admin-room navy** palette and that the real badges are `<img class="user-badge-img">`, not text. These prose docs predate/diverge from that finding.

---

# GAP-ANALYSIS.md
- **path**: docs/reference/GAP-ANALYSIS.md (deleted from tree; read from `HEAD`)
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority; must be verified against the raw dumps (its own cited `files/*.html` dumps are absent, so it is currently unverifiable in-repo)
- **size**: 6130 bytes (per `git cat-file -s HEAD:`), 78 lines
- **role**: mixed (member + presenter + admin) — determined from body: covers presenter-only surfaces ("ScreenShare preview … presenter-only", "RoomTopNav … presenter broadcast controls") and admin surfaces ("SessionControlModal … admin actions") alongside member chat/alert surfaces
- **format/quality**: prose analysis (synthesis of a 9-agent / ~976K-token "reference-html-forensics" workflow); no rects, no computed styles — cites HTML classes/labels only
- **surfaces documented**: PostAlertModal, PollModal, UserInfoModal, AdvancedSearchModal, ScheduledAlertsModal, AlertFeed kebab/composer, ReplyModal, Settings App-tab, ConnectivityCheckModal, PlayYouTubeModal, SessionControlModal, AlertQaModal, RoomTopNav, MutedUsers/FollowedUsers/AlertLogs modals, ScreenShare/RecPreview, PrivateChat, MobileAppInfoModal, plus a 15-item "OK" list
- **maps to (our components)**: names our components directly — PostAlertModal, PollModal/PollPanel, UserInfoModal, AdvancedSearchModal, ScheduledAlertsModal, AlertFeed, ChatPanel, ReplyModal, ConnectivityCheckModal, AlertQaModal, RoomTopNav (reason: it is an explicit reference→ours diff)
- **key findings** (cited):
  - Headline tally (line 8): "32 reference surfaces, 40 of our components, 33 gaps — 0 missing, 17 mismatch, 1 unverifiable, 15 OK." Self-described as structural-fidelity work, not missing surfaces.
  - PostAlertModal (lines 16-21): reference has **3 tabs** (`Text Alert`, `Text Url`, one combined `Image / GIF / Video`); ours splits into **5 tabs**. Combined tab has `fa-link` prepend + drag-drop + `rows=2` textarea.
  - PollModal (lines 22-26): reference is a **draggable floating panel `#pollModalCompHolder`** with Min/Max/Close titlebar, 2 tabs (`Create New Poll` / `Pre-Canned Polls`), `Save To Canned` (`fa-floppy-o`); ours is a plain centered modal.
  - AlertFeed (lines 42-44): reference `app-alerts` has **NO inline composer** — alerts post ONLY via the Post Alert modal; ours renders a symbol/side/note form.
  - Kebab glyph (lines 39-41): reference uses `⠇` (U+2807) on BOTH chat and alert rows; our AlertFeed still uses `fa-ellipsis-v`.
  - Explicitly flags `odds-and-ends.html` as "richest — 21+ distinct modals incl `post-alert`" (line 4).
- **notes**: Superset/synthesis doc — the highest-level of the four. Its conclusions are echoed in more granular form by html-hard-evidence-audit.md and HTML-EVIDENCE-GAPS.md. Marks one item ("SessionControlModal control list") **unverifiable without a live capture** and one section UNVERIFIABLE (Presentation tabs). NOT authority; underlying `files/*.html` absent.

---

# README.md
- **path**: docs/reference/README.md (deleted from tree; read from `HEAD`)
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority; index/spec map for a set of `*.md` spec docs that are themselves NOT in `docs/reference/` (see notes)
- **size**: 7169 bytes (per `git cat-file -s HEAD:`), 82 lines
- **role**: mixed — determined from the component table: covers member surfaces (AlertFeed, ChatPanel), presenter (WebcamHolder, RecPreview, screenshare), and admin (session-control, play-youtube "admin broadcast", debug-log)
- **format/quality**: prose analysis + two tables (spec-doc→source map; real-component→pro-room status with ✅/🔶/🆕 legend) + theme-token summary. Cites the source app as **Angular 17.3.12**. No rects/computed styles.
- **surfaces documented**: full component inventory — `app-alerts`, `app-chat`+`app-st-message`, `app-presentationarea`, screens/notes/files, `app-webcam-holder`, `app-poll-modal`, `app-post-alert-modal`, `app-user-info-modal`, `app-av-settings-modal`, alert/chat-logs, advanced-search, alert-filter, mobile-app-info, nav volume dropdown, user-settings, play-youtube, debug-log, session-control, alert-send-report, reply, scheduled-alerts, privchat, all-user-pm, rec-preview, rich-text-editor, webrtc-troubleshooter
- **maps to (our components)**: the whole doc is a real→pro-room map (AlertFeed, ChatPanel, MainStage, ScreenStage, NotesPanel, FilesPanel, WebcamHolder, PollModal/PollPanel, PostAlertModal, UserInfoModal, AVSettingsModal, AlertLogsModal, ChatLogsModal, AdvancedSearchModal, AlertFilterModal, MobileAppInfoModal, Nav/RoomTopNav, ReplyModal, ScheduledAlertsModal, PrivateChat, ConnectivityCheckModal) with 🆕 flags for surfaces marked missing (user-settings, volume dropdown, play-youtube, debug-log, session-control, alert-send-report, all-user-pm, rec-preview, rich-text-editor, privchat)
- **key findings** (cited):
  - Theme tokens (lines 27-29): navbar `#0c2434`, dropdowns/badges `#0e3651`, presenter `#0f2e43`, sidebar/modals `#103d5c`, dark chat `#143c57`; accent `#45a2ff`, link `#0a6db1`, success `#92d528`, danger `#bb352a`; font Lato/Open Sans; top bar **49px**; z-index sidebar 3→gutters 5→privChat 500→pollModal 501. **⚠️ These navy tokens differ from the MEMORY "reference palette authority" navy set — verify against the JSON captures, not this doc.**
  - "Biggest structural correction" (lines 70-73): real alert-posting flow is modal-based and free-form (text/url/image+upload), NOT the inline Symbol/Side/Note form — make AlertFeed read-only, wire PostAlertModal.
  - ChatPanel (line 37): our inline emoji/image/GIF tools were RIGHT; composer should be an auto-grow `<textarea>` (ours uses `<input>`).
  - Dedup notes (lines 21-24): `file3.html`/`file4.html` = redundant dups of `file2`; `file24`=`file21`; `file33`=ngx-toastr toast container; `file34`=`<audio id=webcam>` remote-audio sink.
  - MobileAppInfoModal (line 51): real store URLs `com.bellesoft.stprotradingroom` / `id1278652736` — third-party data, do NOT copy.
- **notes**: This README indexes spec docs (`file-1-part-A..D.md`, `file2-alerts.md`, `odds-room-shell.md`, etc.) that are **NOT present in `docs/reference/`** (confirmed: no such files in the tree) — another dangling-reference gap. Best used as the human-readable orientation map of the four. NOT authority.

---

# html-hard-evidence-audit.md
- **path**: docs/reference/html-hard-evidence-audit.md (deleted from tree; read from `HEAD`)
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority; the most disciplined/evidence-cited of the four (dated 2026-06-14)
- **size**: 26535 bytes (per `git cat-file -s HEAD:`), 463 lines
- **role**: mixed — covers member (chat/alerts), presenter (webcam, screenshare, rec-preview), admin (session-control). Determined from surface list + component map.
- **format/quality**: prose analysis with **file:line citations on both sides** (reference `files/*.html:NN` and our `web/src/...svelte:NN`). Includes a "Verification Commands Run" section. No computed styles/rects — DOM-line evidence only. Notes screenshots are `1280×720` PNGs but at least one (`04-tab-files.png`) is **stale** vs current source.
- **surfaces documented**: every `files/*.html` (a 51-row table, lines 22-73, with line counts), a 36-tag Angular component inventory (line 79), a current-app surface map (lines 90-114), 4 strong-match sections, and **15 numbered mismatches** (lines 186-419)
- **maps to (our components)**: explicit two-column map — RoomTopNav, RoomSidebar, AlertsChatDock, AlertFeed, ChatPanel, MainStage, NotesPanel, FilesPanel, PollModal, PostAlertModal, AdvancedSearchModal, ScheduledAlertsModal, UserInfoModal, AVSettingsModal, ConnectivityCheckModal, PlayYouTubeModal, MobileAppInfoModal, ReplyModal, AlertQaModal, PrivateChat, RecPreview, RichTextEditorModal, Modal.svelte
- **key findings** (cited):
  - Reference corpus count (line 438): `find files -maxdepth 1 -type f -iname '*.html' | wc -l` → **51** files (this doc's count; HTML-EVIDENCE-GAPS.md uses 52 incl `important-doc.html`).
  - Streams tab (lines 218-233): reference `subnavbar.html:35-47` shows `id="streams-tab"` label `Streams`; our `MainStage.svelte:62` defines only `screens|notes|files`. Stale screenshot `04-tab-files.png` shows Streams → source wins, screenshot is stale.
  - Chat glyph (lines 141-149): reference `file6.html:129-138` `.msgMenu` literal `⠇`; our `ChatPanel.svelte:203-207` renders `⠇` (match) but `AlertFeed.svelte:217-226` uses `<Icon name="ellipsis-v" />` (mismatch).
  - Modal chrome (lines 305-317): reference modals use Bootstrap `modal fade > modal-dialog > modal-content`; our `Modal.svelte:87-145` is custom `.backdrop`/`.panel` fixed `max-width:440px`.
  - Shell anchors (lines 83-86, 118-134): reference `file2.html:15` `.room-sidebar`, `:349` `.mainAppNav`, `:656` `id="mainAreaSplit"`; our `+page.svelte:336-535` renders RoomTopNav/RoomSidebar/Split/AlertsChatDock/MainStage.
  - Live-refresh attempt (lines 430-434): loopback `127.0.0.1:8081/api/rooms` → 200, one room `dev-room`; Playwright refresh was interrupted → no fresh screenshot used.
- **notes**: Honest about its own limits — states no `computer/` folder was found and uses `files/` instead (line 15); refuses pixel-perfect claims where screenshots are stale. Best-citation quality of the four, but its evidence base (`files/*.html`) is absent from the repo, so re-verification is impossible in-tree. NOT authority.

---

# HTML-EVIDENCE-GAPS.md
- **path**: docs/reference/HTML-EVIDENCE-GAPS.md (deleted from tree; read from `HEAD`)
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority; the LARGEST and most exhaustive of the four (auto-generated from `_gap-findings-raw.json`)
- **size**: 248778 bytes (per `git cat-file -s HEAD:`), 1574 lines. Inspected structurally (grep headings + sed slices), read fully in the summary/map/HIGH sections and sampled the per-file detail.
- **role**: mixed — member/presenter/admin. Header line 4 explicitly labels the base capture "Mastering The Trade **member** session," but detail covers presenter (`afterwebcamholder`, `webcamholder`, `screenshare`) and admin (`session-control`, `play-youtube`) surfaces.
- **format/quality**: prose analysis, **deterministically generated** — "one Opus-4.8-agent-per-file vs our web/src components … generated deterministically from all 52 findings — no truncation" (line 4). Structure: intro totals → `File → surface map` table (52 rows) → `MISSING` table (~42 rows) → `HIGH-priority mismatches` table → `Full detail — every gap, grouped by file` (57 `###` per-file sections, from line 215 to EOF). Each detail gap tagged `[SEVERITY][status]` with a `_evidence:_ <file>:<line> — <html snippet>` citation. No rects/computed styles.
- **surfaces documented**: all 52 reference files (`afterwebcamholder`, `appusersettingsmodal`, `as-splitter`, `avsettingsmodal`/`avsettingsmodal1`, `connected`, `dropdownstart`/`dropdownvolume`, `file-1`, `file2`–`file34`, `file3`/`file4` dups, `important-doc`, `mixednavs`, `navbar`, `navbars-room`, `navfile`, `odds-and-ends`, `pagesource`, `reload`, `subnavbar`, `webcamholder`) each mapped to a captured surface + a non-ok gap count
- **maps to (our components)**: per-gap `ourComponent` field (often truncated to `/Users/billyribeiro/Desktop/pro-room/pro`); named components appearing include AlertsChatDock, ScreenStage, RoomTopNav, RoomSidebar, ChatLogsModal, ScheduledAlertsModal, UserInfoModal, SettingsModal, AVSettingsModal, PostAlertModal, PollModal, MessageBody, AlertFeed
- **key findings** (cited):
  - Totals (line 6): "52 files · **418 non-ok gaps** (42 missing, 376 mismatch) · 113 high-priority." Names raw source `docs/reference/_gap-findings-raw.json`.
  - Highest-gap files (map table): `file3.html` 21, `file28.html` (Advanced Search) 18, `odds-and-ends.html` 18, `file5.html` (RoomTopNav) 16, `dropdownstart.html` 14, `file6.html` 13, `avsettingsmodal.html` 12.
  - Missing hidden Streams tab (MISSING table): `mixednavs.html:1-19` `<li role="presentation" class="nav-item">` + `mixednavs.html:14-16` `<i class="fas fa-podcast"></i>` — corroborates html-hard-evidence-audit's Streams finding with a different file.
  - PostAlert media upload (HIGH): `file12.html:179-216` separate `<label class="upload-area">` + `div.filedragMD` drop zone — matches GAP-ANALYSIS's combined-media-tab claim.
  - Recurring cross-cutting delta: dozens of gaps are "reference uses Bootstrap `modal fade`/`btn-close-white`/`nav-tabs` (Angular 17) vs ours custom Svelte/scoped-CSS" — framework-port deltas the header itself calls "expected, not defects" (line 4).
  - Sample detail rigor (lines 220-243, `afterwebcamholder.html`): 8 tagged gaps incl a `[LOW]` note that the reference HTML **duplicates the Notes tab** (lines 69-92 and 94-117 identical) — flagged as a snapshot artifact, not a real requirement. Good example of honest-artifact handling.
- **notes**: SUPERSET of the other three at the gap level (52 files × per-gap detail); `_gap-findings-raw.json` (present in tree, 384162 bytes, 52-element array of `{file, identity, gaps[]}`) is its machine-readable source and the one piece of this evidence chain still in the repo. `_ourComponent_` paths and `Captures` cells are truncated in the tables (full text is in the JSON). Same corpus-absence caveat: every `_evidence:_` line points at `files/*.html` not in the tree. NOT authority — rendered JSON captures in `docs/reference/captures/` win over this prose.
