# Inventory: docs/reference/file-1-part-{A,B,C,D}.md

> **CRITICAL PROVENANCE / HONEST GAP:** All four assigned files were **NOT on disk** at
> `docs/reference/` — the working tree has them staged-for-deletion (`git status` shows
> `D docs/reference/…` for the whole batch; `ls docs/reference/` does not list them). They still
> exist in **git HEAD** (`git ls-files` tracks them; blobs read via `git show HEAD:…`). I restored
> each from HEAD to a scratchpad and read all four **in full**. Sizes below are the git blob sizes.
>
> **AUTHORITY:** All four are **kind: md-analysis — SECONDARY/PROSE, NOT authority.** They are a
> human/prior-agent reverse-engineering of the raw source `mixed-files/file-1.html` and must be
> verified against that raw DOM dump (and against the JSON rendered captures) before any claim is
> trusted. Rendered capture ALWAYS wins over this prose.
>
> **Raw source they analyze (the real authority):** `mixed-files/file-1.html` —
> **4927 lines / 173,693 bytes** (verified `wc -l -c`). The four parts partition it exactly:
> A = lines 1–1230, B = 1231–2460, C = 2461–3690, D = 3691–4927(EOF `</head>`). No overlap, no gap.
> Note: the parts cite the source path as `files/file-1.html` / `pro-room/files/file-1.html`, which
> **does not exist** at that path (verified `ls`); the matching 4927-line file is `mixed-files/file-1.html`.
> A second, larger copy exists at `docs/reference/visual-evidence-deep/fragment-pages/file-1.html.html`
> (4988 lines / 620,359 bytes — differs, likely with Angular `_ngcontent` markers un-stripped).

---

# file-1-part-A.md

- **path**: docs/reference/file-1-part-A.md (git HEAD only — deleted from working tree)
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority, must be verified against the raw dumps
- **size**: 19,872 bytes (git blob 3e4f346) / 299 lines
- **role**: n/a — this is a CSS/theme spec, not a role-scoped capture. Source `file-1.html` is the app's
  index.html `<head>` (shared shell CSS, role-agnostic). Determined: content is `:root` token tables +
  scoped component CSS, no per-user DOM.
- **format/quality**: prose analysis of raw DOM inline `<style>` blocks (Angular `_ngcontent-ng-cNNNN`
  markers stripped, selectors reduced to class/id/element). NOT computed styles, NOT rects.
- **surfaces documented**: `<head>` external deps + fonts; inline image-modal/chat `<script>`; Bootstrap-4
  dark + Bootstrap-5 token blocks; **two competing `:root` app themes** (OLD dark/yellow vs NEW blue);
  light/dark chat theme maps; first component-CSS block (navbar/sidebar/split-gutters/presenter+recording/
  screen-share dropdowns/volume control/theme picker/privChatHolder/pollModalHolder).
- **maps to (our components)**: global theme layer / `app.css` tokens; `RoomTopNav.svelte`, `Nav.svelte`,
  sidebar drawer, `Split.svelte` gutters, presenter/recording controls, `PollPanel/PollModal`, `PrivateChat`.
- **key findings** (cited):
  1. **Two theme generations ship simultaneously; the NEW blue theme wins** (declared later) — spec §2d,
     lines 83–170. OLD teal/yellow (`--app-link-color:#00bc8c`, `--sidebar-menu-active-color:#f7fd37`) vs
     NEW navy/blue (`#45a2ff`, `#0a6db1`, `#0c2434`). Blue ramp cited line 170. **Rebuild target = NEW blue.**
     This CONTRADICTS the MEMORY note that "modal tabs are Darkly #222/#00bc8c" — verify against raw dump.
  2. **Top-bar height = 49px everywhere**; content = `calc(100vh - 49px)`, split boxes/gutters =
     `calc(100vh - 60px)` (lines 212, 233–236, 288). Load-bearing layout constant.
  3. FontAwesome pinned **v5.8.1** via `use.fontawesome.com/releases/v5.8.1/css/all.css` w/ SRI (line 20) —
     matches MEMORY "FA pinned 5.8.1". Only active font `@import` = **Lato 400/700/400italic** (line 22);
     effective `--app-font-family` = `"Open Sans", sans-serif` but Open Sans is NOT imported in this slice
     (line 42–43) — an honest gap flagged by the author, must confirm bundle CSS.
  4. Off-canvas sidebar = **250px**, parked `margin-left:-250px`, z-index 3; z-order ladder: sidebar 3 <
     gutters 5 < position btns 11 < privChat 500 < pollModal 501 < notConnectedOverlay 10000 (line 289).
  5. Chat theme is **class-based** (`.lightTheme`/`.darkTheme` remap `--msg-*`/`--msgs-*`/`--textarea-*`),
     all values `!important` (§2e, line 194).
- **notes**: Best-authority for the **global token palette + head/deps**. Prose only — every hex/token must
  be re-grepped in `mixed-files/file-1.html` lines 1–1230. The OLD-vs-NEW palette claim is the single most
  important thing to verify against a rendered JSON capture's `cssVariables`.

---

# file-1-part-B.md

- **path**: docs/reference/file-1-part-B.md (git HEAD only — deleted from working tree)
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority, must be verified against the raw dumps
- **size**: 23,297 bytes (git blob) / 424 lines
- **role**: n/a (shell CSS spec). Covers admin/presenter/member surfaces mixed (modals, poll, session-control
  are admin/moderator; chat composer is member). Determined by component purpose, not a role capture.
- **format/quality**: prose analysis of raw inline `<style>` blocks; organized **per Angular component**
  (`cNNN` fingerprint kept as the component id). No rects/computed styles.
- **surfaces documented**: token-consumption table; **user-customizable appearance hooks** (12 `#chat-*`/
  `#alert-*`/`#presenter-*` color+size inputs, all `45×20px`); shared custom radio/checkbox pattern; and
  ~15 components: room top-nav/recording/mod-banner, user modal + chat-stars + follow-chat, user-settings,
  YouTube modal, AV-settings, alert modal, **poll panel**, alert/chat log modals, session-control, google
  badge, chat composer + giphy, alert Q&A, muted-users, followed-users, floating webcams PiP, recs holder.
- **maps to (our components)**: explicit map table lines 408–425 → `RoomTopNav/Nav/PresenceBar`,
  `MembersPanel` user modal, `settings/+page.svelte` appearance tab, `AlertFeed`, `PollPanel/PollModal`,
  `AlertLogsModal`, `ChatLogsModal`, session-control modal, `ChatPanel` composer, `AlertQaModal`,
  `MutedUsersModal`, `FollowedUsersModal`, `WebcamHolder`, `ConnectivityCheckModal`, YouTube modal.
- **key findings** (cited):
  1. **12 end-user appearance controls** (§1b lines 49–64): `#chat-ticker-color`, `#chat-username-color`,
     `#chat-text-color`, `#chat-bg-color`, `#chat-text-size` + alert(4) + presenter(3); uniform `45×20px`,
     size fields add `font-size:13px`. These become persisted per-user CSS vars on ChatPanel/AlertFeed.
  2. **Poll panel is a floating/draggable dark panel** (component `c3558549984`, lines 228–251):
     `.poll-panel-titlebar cursor:move; user-select:none; bg#2c2c2c`, body `calc(100% - 40px)` (40px titlebar),
     hardcoded dark palette `#2c2c2c/#555/#666/#ccc/#ddd`, close-hover `#c0392b`. KEY for `PollPanel.svelte`.
  3. **Modal width ladder** (line 393–395): AV/alert default; user/poll/alertQA `600px`; user-settings/
     youtube `700px`; log modals `1000px`. `#followedUsersModal z-index:1054` stacks ABOVE a base modal (line 356).
  4. **chat-stars reputation badge** (lines 145–149): `.chat-stars font-size:8px`, `.stars-num` absolutely
     positioned count overlay — a real recurring badge component (appears again in Parts C & D rosters/bubbles).
  5. Log modals `c330848937` (alert) and `c86010747` (chat) have **IDENTICAL CSS** (line 254) — one shared component.
- **notes**: Best-authority for **modal inventory + the poll panel + appearance-settings hooks**. Largest of
  the four. The cNNN→component map (lines 408–425) is the most useful cross-walk but is inferred ("Likely
  pro-room file") — treat as hypothesis, not fact.

---

# file-1-part-C.md

- **path**: docs/reference/file-1-part-C.md (git HEAD only — deleted from working tree)
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority, must be verified against the raw dumps
- **size**: 21,684 bytes (git blob) / 252 lines
- **role**: mixed — chat/roster (member-visible) + log/report modals + connectivity troubleshooter (all-roles).
  Determined by component purpose.
- **format/quality**: prose analysis of raw inline `<style>` blocks, per-component (`_ngcNNNN`). No rects.
- **surfaces documented**: screen-recording floating preview; scheduled-alerts table; alert-delivery-report
  modal (with pie chart); simple + searchable log modals (trader/room filters); checkbox user list;
  **connectivity/mic troubleshooter** (fully self-themed dark-slate); **chat panel + private messages +
  giphy**; **angular-split layout**; **room roster**; alerts panel (partial, truncates line 3690).
- **maps to (our components)**: map table lines 240–252 → `ScreenStage/WebcamHolder`, `AlertFeed`,
  `AlertLogsModal`, `ChatLogsModal`, `MutedUsersModal/FollowedUsersModal`, `ConnectivityCheckModal`,
  `ChatPanel/AlertsChatDock`, `Split.svelte`, `MembersPanel/PresenceBar`, `AlertFeed/PollPanel`.
- **key findings** (cited):
  1. **Room roster** (`_ngc900715899`, lines 197–210): `.rosterImg 45×45 border-radius:var(--rosterImg-border-radius)`;
     **`.presUser` vs `.regUser`** rows (presenter/admin row gets `--roster-bg-adm`); `.msgMenu` per-row DM
     trigger; list is **virtualized** (`virtual-scroller height:100vh`). Directly maps to `MembersPanel/PresenceBar`.
     (Note: these markers — `presUser`, `regUser`, `rosterImg`, `msgMenu`, `room-roster` — are on the probe list.)
  2. **Chat panel** (`_ngc3142977328`, lines 138–184): header `~30–41px`, `.list-of-msgs height:calc(100% - 41px)`;
     **private-chat is a 2-pane split** (`.pc-list flex-basis:220px` + `.pc-logs flex:1`); giphy popover
     `400×400`; `.chatTabs` 12px bold pills using `--tab-active-bg`/`--tabs-border-color`.
  3. **Connectivity/mic modal** (`_ngc2606333922`, §G lines 93–136) is the ONE fully self-themed component —
     a Tailwind-like dark-slate palette (`#0f172a/#1e293b/#334155/#22d3ee/#10b981/#ef4444`), NOT the app CSS
     vars. Waveform canvas, volume meter (low/mid/high gradient), mic status pill, gradient action buttons.
  4. **angular-split reimplementation** (`_ngc3013344202`, §I lines 186–195): `.as-split-gutter/.as-split-area`,
     horizontal=`col-resize` / vertical=`row-resize`, collapsible `.as-hidden`, `flex-basis 0.3s` animation,
     base64 PNG grip dots → maps to `Split.svelte`.
  5. Searchable log modal (`_ngc2037626149`) has a **multi-column wrapped trader dropdown** (`.dropdown-menu.show
     height:420px; width:410px; flex-wrap:wrap`, lines 84–86) — non-obvious layout detail for AlertLogsModal.
- **notes**: Best-authority for **roster + chat/private-message layout + the split component + connectivity
  modal**. Alerts panel here is explicitly **partial/truncated at line 3690** — continued/overlapping with Part D.

---

# file-1-part-D.md

- **path**: docs/reference/file-1-part-D.md (git HEAD only — deleted from working tree)
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority, must be verified against the raw dumps
- **size**: 21,342 bytes (git blob) / 262 lines
- **role**: mixed — chat bubbles (member), main presentation stage (presenter output, all view it),
  webcam PiP, notes/files. Determined by component purpose.
- **format/quality**: prose analysis of raw inline `<style>` blocks (`ng-cNNNN`). Slice ends at `</head>`
  line 4927 — **explicitly contains NO `<body>`/`<app-root>`/template markup** (author flags this, §4 line 244).
- **surfaces documented**: chat panel header/toolbar/tabs; message-list host; webcam wrapper; **main
  presentation stage** (screens/streams/notes/files tabs, zoom, volume, video player, day-trade/swing alert
  tables, **speech-recognition caption overlay**); draggable webcams PiP; **chat message bubble** (avatar,
  username, options bar, reactions, stars, private replies, lightbox); giphy + **note version-history**.
- **maps to (our components)**: map table lines 254–262 → `ChatPanel/AlertsChatDock`, `WebcamHolder`,
  `MainStage/ScreenStage/FilesPanel/NotesPanel/AlertFeed`, `AlertQaModal`, `CaptionsOverlay` (speech-reco).
- **key findings** (cited):
  1. **Main stage tab system** (`ng-c2028866615`, lines 101–104): `#screens/#streams/#mainTabsContent/#notes/
     #notesTabsContent` all `height:100%`; `#files height:calc(100% - 40px)`; `#streamsTabsContent/
     #screensTabsContent height:calc(100% - 82px)` (82px = two stacked toolbars). Load-bearing for MainStage layout.
  2. **Chat message bubble** (`ng-c1254915701`, lines 167–201): `.msg-box` vs **`.msg-box-adm`** (admin/highlighted
     `--msgs-bg-adm` + border-bottom); `.private-reply-message` quoted block (`border-left 2px #00bc8c`);
     hover-revealed `.options` action bar; `.msgMenu` `content:"\2807"` (⠇ vertical ellipsis); `.alert-qa` 10px tag;
     `.created-at` uses `--date-color`; `.separator` "new messages" divider; **`.chat-reaction-hover`** reveal on
     `.msg-box:hover`. Covers probe markers `msg-box`, `msg-box-adm`, `alert-qa`, `created-at`, `msgMenu`.
  3. **Speech-recognition caption overlay** (`.speech-reco-*`, lines 141–157): live-captions-over-stage,
     `position:absolute bottom; bg#000c; z-index 9999`; history-mode, per-line sender/time/text, close/history
     round buttons. Directly maps to the existing `CaptionsOverlay.svelte`. Responsive font ladder 22→20→16→14px.
  4. **Draggable webcam PiP** (`ng-c4054903792`, lines 159–165): `.webcamsHolder position:absolute; z-index:105;
     border 1px yellowgreen; cursor:move; 320×240` (4:3). Two webcam-holder variants across the file (this + the
     `webcamsHolderScreen` 350×260 in Part B) — WebcamHolder must support both.
  5. Responsive breakpoint ladder for this slice: **1200 / 900 / 768 / 480 / 400 px** (line 232) — mostly files-panel
     compaction + caption scaling. `@keyframes slideInRight` = chat-bubble pop-in from bottom-right (line 238).
- **notes**: Best-authority for **chat message bubble anatomy + main-stage tab layout + speech captions**.
  IMPORTANT structural note (line 244): source `file-1.html` is `<head>`-only (all CSS, zero template DOM) — so
  **file-1.html can NEVER be authority for DOM structure / which badges render / role-conditional markup**; only
  the JSON rendered captures and the fragment HTML dumps can. This reinforces the AUTHORITY rule: use these four
  .md files for the CSS token/palette layer only, and settle all DOM/badge/role questions from the raw captures.

---

## Cross-file summary

- **All four = one continuous prose spec** of the single raw file `mixed-files/file-1.html` (4927 lines),
  cleanly partitioned A/B/C/D with no overlap. They are **kind: md-analysis, SECONDARY, NOT authority.**
- **What they are genuinely useful for:** the CSS **theme-token palette** (Part A), the **modal/component
  inventory + cNNN→component crosswalk** (Parts B–D), and layout constants (49px topbar, 250px sidebar,
  41px chat header, 82px double-toolbar, modal width ladder). Every hex/value is prose and must be re-grepped
  in the raw file or, better, read from a rendered JSON capture's computed styles/`cssVariables`.
- **What they CANNOT authority:** any DOM structure, which badges render, or role-conditional markup — the
  source is `<head>`-only CSS (Part D §4). Those questions go to the JSON captures + HTML fragment dumps.
- **Known conflict to resolve against raw dumps:** Part A asserts the effective theme is the **NEW navy/blue**
  palette (`#45a2ff`/`#0a6db1`/`#0c2434`), while project MEMORY says "modal tabs are Darkly #222/#00bc8c."
  Verify against a rendered capture before trusting either.
