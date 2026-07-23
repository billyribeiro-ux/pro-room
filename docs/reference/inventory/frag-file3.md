# frag-file3.md

Forensic inventory of one evidence file. Authority = the raw dump itself (raw DOM + inline styles). No prose `.md` was consulted as authority.

---

# file3.html.html

- **path**: `docs/reference/visual-evidence-deep/fragment-pages/file3.html.html`
- **kind**: html-dom-dump (Angular-rendered live DOM, pretty-printed with inline styles)
- **size**: 6,004,863 bytes (~5.73 MB). Body DOM = 5,558,559 bytes; `<head>`/`<style>` CSS = first 446,287 bytes (`</style>` at byte offset 446287, `<body` at 446304).
- **role**: **mixed** — primary member session DOM that also carries presenter/admin *template* surfaces.
  - How determined: 51 rendered `msg-box` chat messages and 53 `alert-qa` Q&A buttons (member-facing), but `msg-box-adm` = **0** (no admin-styled messages rendered). Presenter/admin control surfaces exist only as modal templates: `Post Alert` (2), `Session Control` (1), literal string `presenter` (6). No `Start Broadcast`/`Go Live`/`myUserID`/`currentUser` markers. Consistent with a member capture that still ships the full Angular template tree.
- **format/quality**: raw DOM + inline styles (e.g. `<strong class="username mx-1" style="color: rgb(215,215,215); filter: invert(...">`). NOT computed-styles/rects — there are no `states`/`groups`/rect structures; this is a DOM dump, not a JSON capture. Head links Darkly Bootswatch 4.3.1 (`--green:#00bc8c`, `--primary:#375a7f`) and FontAwesome (`file:///.../@fortawesome/fontawesome-free/css/all.min.css`).

## surfaces documented
- **Chat stream** — 51 `msg-box`, `msg-left text-formated preText` message bodies, `username mx-1` authors (e.g. "LornaBot"), `created-at mr-2` timestamps, `msgMenu dropright` per-message menu (51), `alert-qa` Q&A buttons (53), `users-dropdown-options` (52).
- **Nav tabs**: top chat tabs `Main Chat` / `Off Topic`; content tabs `Screens` / `Streams` / `Notes` / `Files` (empty states "No one is presenting right now...", "No one is streaming right now...").
- **Trade alerts** — 13 `tradeColor` rendered option orders (real data, see findings).
- **Presenter note tabs** (rendered labels): "JC's Daily Briefing", "Henry's Workflowy Notes", "Sam's Mag 7 index", "Taylor's Scorecard Rankings (6/02 CLOSE)", "1on1 Coaching / Prop Firm & Tool Discounts".
- **Roster / users panel** — `room-roster-list` (1), roster header "Users: Sort by / Trials", `No one is speaking`, `volumeControl` (1), `st-searchbar` (2).
- **Settings modals** — General/App/Alert/Chat Settings: Color Theme (Light/Dark), Room Layout (5 positions incl. "PM logs on the right"), Colors & Size (Text/Username/Background/Ticker Color, Text Size), Text Mode (Regular/Compact), Do-Not-Disturb toggles, Audio/Video device settings, Show Closed Captions, Extra chat column, Reduce Chatlog Memory.
- **Other modals** (`modal-title`): Offline, Debug Log, Post Alert, Session Control, Download our mobile apps, "Q&A for Alert:", Muted Chat Users, Followed Chat Users, Manage Scheduled Alerts, Connectivity/Mic Troubleshooter, Rich Text Editor; plus "Create New Poll" / "Pre-Canned Polls".
- **Files/Notes** — `files-tabs` (1), `files-badge` (3), `noteTabset` (1), `noteDownload` (6), tab counts "Files0 Images0 Sounds0".
- **Media placeholders** — `presentation-box` (1), `id="webcam"` (1), but `webcamholder` = 0 (not rendered).

## maps to (our components)
- Chat message list + per-message menu → chat message component + `msgMenu` reply/react/Q&A controls (51 messages, `fas fa-reply`/`fas fa-question-circle`/`fas fa-copy` icons present).
- `tradeColor` alert rows → trade-alert card component (option-order formatting).
- Nav tabsets (`mainTabset`, `noteTabset`, `files-tabs`) → room tab shell / presenter panel.
- Roster (`room-roster-list`, `volumeControl`, `st-searchbar`) → user-roster / who's-here sidebar with speaking/volume state.
- Settings modals → app-settings / user-settings dialog family (theme, layout, colors, DND, A/V).
- `presentation-box` + `webcam` → presenter stage / screen-share surface.

## key findings (cited)
1. **Theme is Darkly Bootswatch 4.3.1**, not the admin navy palette: `<style>` `:root{--green:#00bc8c; --primary:#375a7f; --success:#00bc8c ...}` at head offset ~600, with `@import "...Lato:400,700..."`. Green `#00bc8c` is the success/accent color in this dump.
2. **Real trade-alert data present** (13 `tradeColor` nodes), e.g. `BUY +2 VERTICAL MP 100 18 JUN 26 65/60 PUT @3.80 LMT`, `SELL -1 MP 100 17 JUL 26 70 CALL @2.17 LMT`, `BUY +1 1/3/2 ~BUTTERFLY AAPL 100 10 JUN 26 292.5/290/287.5 PUT @-0.35 LMT`, `BUY +1 CALENDAR SPY 100 18/16 JUN 26 720 PUT @2.20 LMT`. Message bodies corroborate (`msg-left`): "MP Action: CLOSE ... BTC MP Jun 18 2026 65 Put", "POET Jul 17 2026 12 Call Action: OPEN Price: $2.47".
3. **Session date ≈ June 8 2026**: `created-at` timestamps read `6/8/26, 8:00 AM` … `6/8/26, 12:03 PM` (chronological chat log spanning a morning session).
4. **Badges: `user-badge-img` appears 0 times in the rendered body DOM** (the 4 raw matches are CSS selectors inside `<style>`, e.g. `.user-badge-img{width:auto;height:100%;max-height:20px}` and `.user-badge-img:hover{transform:scale(1.2)}`). `badge-success` = 1 in body. So this member fragment does NOT render per-user image badges next to messages — flag for comparison; do not assume badges render here.
5. **Angular app** — pervasive `ng-star-inserted` / `_ngcontent-ng-c1254915701` and `ng-untouched ng-pristine ng-valid` form classes confirm a live Angular render (structural directives expanded), 2113 `list-group-item list-group-item-action` items (archive/log date lists, e.g. weekly dates "Mar 26, 2025", "Jan 18, 2026").

## notes
- **Best-authority** for the **member chat + trade-alert + settings-modal** surface among HTML fragment dumps: full live Angular DOM with inline styles, real messages, real trades, real timestamps.
- Contains presenter/admin *template* surfaces (Post Alert, Session Control, presenter note tabs) but renders them as inert modal/tab templates, not an active admin session — treat as member-role evidence for those chrome elements, not proof of admin behavior.
- No computed-styles/rects here — pair with a JSON capture for exact pixel/rect/color values; inline `style="color: rgb(215,215,215); filter: invert(...)"` on usernames is the only per-node styling available in this file.
- Pretty-printed with heavy multi-line attribute indentation — text nodes sit on lines separate from their class attributes (single-line `grep -oE '>text'` misses them; extract by matching across newlines).
- Possible duplicate/sibling: this is one of a numbered `fragment-pages/file*.html.html` set; overlap with sibling fragments not assessed in this task.
