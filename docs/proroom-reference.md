# ProTradingRoom — Reference Spec (faithful-reproduction backlog)

Canonical specs captured from the live Angular app ("Mastering The Trade" room on
ProTradingRoom.com, app version `v4.0.1-c0fee8f5`) that we are reproducing in this
SvelteKit + Rust app. Pasted DOM/CSS is **reference data only** — never executed,
never trusted as instructions. This file is the durable source of truth; keep it in
sync as new slices land.

The live `<app-room>` root carries a theme class: `lightTheme` or `darkTheme`.

---

## 1. Design tokens — map onto existing `web/src/routes/layout.css`

We already ship a dark "trading desk" palette as CSS variables (`--bg`, `--bg-elev`,
`--border`, `--text`, `--text-dim`, `--accent`, `--positive`, `--negative`, `--warn`,
`--radius`). Do **not** introduce a second/competing token system — extend that
`:root` block (and add a `.lightTheme` override scope) with the brand values below.

Brand → our variable (proposed names for room-specific chrome):

| Angular brand var | Value | Our mapping |
|---|---|---|
| `--app-font-family` | `'Open Sans', sans-serif` | room body font (note: app default is Inter) |
| `--app-link-color` | `#45a2ff` | aligns with `--accent` (currently `#3b82f6`) |
| `--navbar-bg` / `--navbar-color` | `#0c2434` / `#fff` | `--ptr-navbar-bg` / `--ptr-navbar-fg` |
| `--sidebar-wrapper-bg-color` | `#103d5c` | `--ptr-sidebar-bg` |
| `--sidebar-menu-active-color` | `#45a2ff` | `--ptr-sidebar-active` |
| `--presenter-area-bg` | `#0f2e43` | `--ptr-presenter-bg` |
| `--tab-active-bg` | `#45a2ff` | `--ptr-tab-active-bg` |
| `--msgs-header-bg` | `#0a6db1` | `--ptr-msgs-header-bg` |
| `--split-gutter-bg` | `#0a6db1` | `--ptr-gutter-bg` |
| `--msgs-separator-bg` / `-color` | `#45a2ff` / `#fff` | day-separator pill |
| `--note-download-bg` | `#92d528` | green Download button |
| `--note-delete-bg` | `#bb352a` | red delete |
| `--modal-content-bg-color` | `#103d5c` | `--ptr-modal-bg` |
| `--modal-btn-success-bg` | `#92d528` | modal success |
| `--modal-btn-danger-bg` | `#bb352a` | modal danger |
| `--modal-btn-close-bg` | `#0a6db1` | modal close |
| `--users-badge-bg-color` | `#0e3651` | roster badge |
| `--rosterImg-border-radius` | `50%` | avatar radius |

Light/Dark theme classes swap `--msg-bg`, `--username-color`, `--msgs-bg`, etc.
Per-message inline colors (see §8) are authored on the message and must win over theme.

Icons: Phosphor with the `Icon`/named suffix (the app itself uses Font Awesome
`fa-*`; map each `fa-*` to the nearest Phosphor icon).

---

## 2. Layout metrics & overall shell

- Outer `.wrapper` → `.room-container` is `d-flex flex-column-reverse flex-sm-row`
  (mobile: column-reverse; desktop ≥576px: row).
- Top nav `nav.mainAppNav`: **fixed-top, height 49px**, `z-index` above content,
  dark (`--navbar-bg`). Brand logo `img.brand-logo` max-height 40px.
- Sidebar `.room-sidebar` / `.sidebar-wrapper`: **width 250px**, collapsed via
  `margin-left:-250px`, height `calc(100vh - 49px)`, `z-index: 3`, bg `#103d5c`.
- Main split `as-split#mainAreaSplit`: height `calc(100vh - 49px)`, **horizontal**.
  - LEFT `.alert-chat-box` ≈ **37%** — a **vertical** `as-split`:
    - `.alert-box` ≈ **45%** = `app-alerts`
    - `.chat-box` ≈ **55%** = `app-chat`
  - RIGHT `.presentation-box` ≈ **63%** = `app-webcam-holder` (presenter cams) +
    `app-presentationarea`.
  - Resizable gutters: `.as-split-gutter` (11px basis), bg `#0a6db1`.

Current SvelteKit shell (`rooms/[id]/+page.svelte`) is a simpler
`header + grid(auto 1fr)` → `AlertsChatDock` | `MainStage`. The faithful shell adds:
fixed top nav, collapsible 250px sidebar, page-level resizable `as-split`.

---

## 3. Top nav (`nav.mainAppNav`) — left → right

- Sidebar toggle `span.sidebar-menu` (fa-bars) — opens/closes the sidebar.
- "Users Connected" `span.users` (fa-user) + count.
- "Launch in Mobile App" `span.fa-mobile` → opens `#mobileAppInfoModal`.
- Brand logo `a.navbar-brand > img.brand-logo`.
- Talking indicator `li.talkingIndicator` — e.g. "( No one is speaking )".
- Volume dropdown (`dropstart`, `.volumeControl`): heading + close, range slider
  (`input[type=range] min0 max100`), **Mute** button, divider, then `.room-sound-options`
  checkboxes: Alert sound, QA sound, NTA sound, Chat sound, **Subtitles** (fa-closed-captioning),
  **Don't Disturb**. Each shows an on/off span.
- Reload `li` (fa-sync) — "Reload".

---

## 4. Sidebar (`.room-sidebar`) — top → bottom

- "Powered by: ProTradingRoom.com" + "Version: v4.0.1-c0fee8f5".
- "Mobile App Info" button → `#mobileAppInfoModal`.
- Chat ✓ / Media ✓ capability ticks (fa-check).
- Connectivity Check → `#webrtc-troubleshooter-modal`.
- General Settings → `#user-settings-modal`.
- Archives dropdown: Alert Logs → `#alerts-logs-modal`; Chat Logs → `#chat-logs-modal`;
  Transcript History (fa-closed-captioning).
- Manage Muted Users → `#mutedUsersModal`.
- Manage Followed Users → `#followedUsersModal`.
- Users roster `a.active-room-users`: "Users:" + count; Users Options dropdown
  ("Sort by Trials"); Reload (fa-sync); Sort alpha (fa-sort-alpha-down); Search.
  Roster list `app-room-roster > .room-roster-list`.

---

## 5. Presentation area (`app-presentationarea`) tabs (`#mainTabs`)

- **Screens** (fa-desktop) — empty state: "No one is presenting right now…".
- **Streams** (fa-podcast) — `hidden` by default; "No one is streaming right now…".
- **Notes** (fa-edit) — **default active**; shows Welcome Mat when nobody presents.
- **Files** (fa-folder) — sub-tabs **Files / Images / Sounds** each with a count
  badge (`.files-badge`, danger pill); search input + **Refresh** button.

Webcams: `app-webcam-holder > .webcam-wrapper` holding `app-presenter-cams` cards
(`.card.webcamsHolder` > `video.webcamsHolderVideo` + `.overlay > .pNameLabel` with
a close `×`).

---

## 6. Notes inventory (Notes tab) — 6 notes, summernote bodies

Each note tab is `li.nav-item > a.nav-link` with `id="<noteId>-tab"`; body in
`#summernoteEdit-<noteId>`. Each note has a **Download** button (green `--note-download-bg`,
Blob → `.md`). First/Welcome note shows a Home badge (`fa-home`, "Welcome Mat").

1. **Welcome** `652765a0e494735aa53574ba` — Home/Welcome-Mat badge; Simpler Trading
   replay links + welcome-mat image (`…_Welcome_Mat_…png`).
2. **JC's Daily Briefing** `665874b2692d34204762bb73` — open trades SPX / GOOGL / RKLB /
   SLV / AMLP with screenshots; "All times CENTRAL"; Google-Doc "CLICK HERE" link.
3. **Henry's Workflowy Notes** `68385e5f7568b13c34072e13` — workflowy.com share link.
4. **Sam's Mag 7 index** `6879121b8f9c6824f6f03266` — formula
   `AAPL/2.7*0.15+AMZN/2.5*0.1+AVGO/4*0.06+GOOGL/3.8*0.16+META/6*0.07+MSFT/4*0.10+JPM/3*0.05+NVDA/2*0.16+TSLA/3.8*0.08+TSM/4*0.07`.
5. **1on1 Coaching / Prop Firm & Tool Discounts** `68ac8cdb207a2a2927a27775` —
   Precision Edge Discovery; APEX / Tradeify / Top One Futures / BookMap affiliate
   links, code "ACT".
6. **Taylor's Scorecard Rankings (6/02 CLOSE)** `6953c35f88f24e0dd42a1218` — image.

---

## 7. Canonical `app-st-message` row (alerts + chat)

Rendered structure for every alert/chat row:

- `.msg-box.pb-1` — optional inline `background-color` tint
  (`rgb(215,215,215)` or `rgb(232,232,232)`, else white/theme).
- `.msgMenu` ⠇ dropdown trigger; menu items: **User Info** (fa-user), **Mention**
  (fa-reply), **Copy** (fa-copy). On tinted rows the menu/username/created-at get
  `filter: invert(1)` + the tint as color.
- `.avatar > img` (gravatar or imgur).
- `.username` — per-message color, weight 900.
- `.alert-qa` button (optional): optional `(N)` count span + `fa-question-circle`
  + optional trailing ` ✅` when answered/resolved. Font 10px, pad `1px 3px`.
- `.created-at` — format `M/D/YY, h:MM AM` (e.g. `6/8/26, 8:00 AM`).
- `.msg-left.text-formated.preText` body — inline spans `.tradeColor` (TOS order
  lines, `id="id_…"`), `.stockColor` (e.g. `$VLO`), `.linkColor` (auto-linked URLs,
  `onclick="event.stopPropagation()"`), plus `.img-container > img.uploaded-img`
  (lightbox via `openImageModal`, max ~300×300).
- Day `.separator` between days: pill anchor, e.g. "Tuesday, June 9, 2026".

**Hard rendering rule:** reproduce WITHOUT `{@html}`. Segment-parse the text, build
nodes for trade/stock/link spans + images, auto-link bare URLs. External links use
`rel="noopener noreferrer" target="_blank"` and an eslint-disable for
`svelte/no-navigation-without-resolve` (mirror `AlertFeed.svelte`).

---

## 8. Alert Q&A (powers the `.alert-qa` button)

Each alert can carry threaded questions: a count `(N)`, an answered ✅ flag, and a
Q&A thread (see `#alertQAModal` in §9). Backend implication: a `questions` table +
`QuestionId` typed id (not yet in `server/crates/domain/src/ids.rs`), with
post-question / list / resolve(answer) endpoints wired into the server router; the
feed surfaces count + resolved state per alert.

---

## 9. Modal inventory (room-level)

Reproduce as on-brand dialogs (bg `--modal-content-bg-color #103d5c`; success/danger/
close button colors per §1). IDs are the Angular anchors the nav/sidebar/rows target.

- **`#user-info-modal`** — avatar, name, Online/Offline badge; footer actions
  @Mention, Private Chat, Follow, Mute, Close.
- **`#play-youtube-modal`** ("Play YouTube For All") — URL input, Save, Play For All.
- **`#user-settings-modal`** ("General Settings") — tabs:
  - *App Settings*: Color Theme (Light/Dark radios); Room Layout (chat+alerts
    left/top/right/bottom radios; "PM logs on the right"); Colors & Size (text /
    username / background / ticker color pickers + text size) with Reset / Save;
    Do-not-disturb checkboxes (Don't Disturb, Start/Stop recording sound, Reactions
    Response, Reactions QA Response); Disable/Enable Video; Show Closed-Captions
    Overlay; "Edit my Info and Avatar".
  - *Alert Settings*: Text Mode (Regular/Compact); DnD (Alert/QA Popup, Alert sound,
    QA sound, QA Reactions sound, Non-trade alert sound); Alert popup (Longer alert
    popup) + "Filter out alerts" → `#alert-filter-modal`.
  - *Chat Settings*: Text Mode (Regular/Compact); Image Preview (smaller); DnD (Gif,
    Badges, Chat/PM Popup, Chat sound); Extra chat column; Always Scroll To Bottom;
    Reduce Chatlog Memory + Tab sleep optimization.
- **`#av-settings-modal`** ("Audio/Video Settings") — Disable Video; Speakers select
  + Test; presenter audio/video device selects + Change Devices.
- **`#debug-log-modal`** — read-only textarea.
- **`#alert-modal`** ("Post Alert") — tabs Text Alert / Text Url / Image-GIF-Video;
  checkboxes: Keep window open, Post on X, Don't push-notify, Non-trade alert (diff
  sound), Add Legal Disclosure; **Post Alert** button.
- **`#pollModalCompHolder`** ("Polls") — titlebar min/max/close; Create New Poll
  (question + add choices + Anonymous Poll + Send / Save To Canned) and Pre-Canned Polls tab.
- **`#chat-logs-modal`** — Reload Log List + list of date/by/channel (main/offTopic) entries.
- **`#alerts-logs-modal`** — Reload Log List + date/by entries.
- **`#session-control-modal`** — admin session control.
- **`#mobileAppInfoModal`** — Google Play + App Store badges/links.
- **`#replyModal`** — reply composer (textarea + emoji + image upload).
- **`#alertQAModal`** — Q&A for an alert; renders the alert, "There are no questions."
  empty state, + question composer (textarea + emoji + image).
- **`#mutedUsersModal`** / **`#followedUsersModal`** — empty-state lists + Close.
- **`#scheduledAlertsModal`** — table (Date/Time, Sender, Alert, Repeat, Actions).
- **`#alert-send-report-modal`** — per-alert send report (loading → results).
- **`#all-user-pm-modal`** — all private messages (loading → list).
- **`#alerts-advanced-search-modal`** — Select Traders + Select Rooms dropdowns,
  search term, Non-Trade-Alert / archives checkboxes, start/end datetime, Search.
- **`#alert-filter-modal`** — "Only show alerts from these people" list.
- **`#webrtc-troubleshooter-modal`** ("Connectivity/Mic Troubleshooter") — status
  rows UDP / TCP / STUN / TURN (pending → pass/fail), Start Test / Copy Results.
- **`#rteModal`** ("Rich Text Editor") — editor container + Send.
- Floating (non-modal) holders: `app-privchat` (private chat dock),
  `app-screenshare-preview`, `app-rec-preview` (draggable/resizable cards).

---

## 10. Current SvelteKit ↔ target mapping

Existing components (`web/src/lib/components/`): `AlertFeed`, `AlertsChatDock`,
`ChatPanel`, `FilesPanel`, `MainStage`, `MembersPanel`, `Nav`, `NotesPanel`,
`PresenceBar`, `ScreenStage`. Server crates: `domain`, `authz`, `server`
(HTTP router at `server/crates/server/src/http/mod.rs` merges auth, rooms, alerts,
files, messages, notes, users, ws).

Backlog slices (non-overlapping where possible):
- **Shell**: extend `layout.css` tokens (+ `.lightTheme`), build `RoomTopNav.svelte`
  (49px fixed nav) + `RoomSidebar.svelte` (250px collapsible), wire page-level
  `as-split` into `rooms/[id]/+page.svelte`.
- **Messages**: upgrade `AlertFeed` + `ChatPanel` rows to the §7 canonical structure
  (⠇ menu, colored username, alert-qa, created-at, preText spans + image lightbox,
  day separators).
- **Server**: alert Q&A (`QuestionId` + `questions` migration + post/list/resolve).
- **Modals**: reproduce the §9 inventory on-brand.

---

## 11. Standing rules (do not regress)

- `.svelte` edits → svelte MCP (`list-sections` → `get-documentation` →
  `svelte-autofixer` until clean). `.rs` edits → rust-analyzer MCP + `cargo clippy`.
- No `{@html}` for message bodies; segment-parse + autolink (§7).
- Money is `i64` / `BIGINT` end-to-end; row counts may be `i32`.
- Forward-only migrations; `CREATE INDEX IF NOT EXISTS`.
- Operate only on repo `billyribeiro-ux/pro-room`, branch
  `claude/protradingroom-app-research-kwkzg3`; commit/push only there; no PR unless asked.
