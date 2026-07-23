# proroom-all-admin.json

- **path**: `proroom-all-admin.json` (repo root)
- **kind**: json-capture
- **size**: 45,835,730 bytes (~45 MB / 1,103,342 lines, pretty-printed)
- **role**: **admin** — determined from `meta.role: "admin"` (line 3) AND corroborated by the DOM: `msg-box-adm` appears 20x in `elements`, admin-only log modals captured in `states` (`alerts-logs-modal`, `chat-logs-modal`, `mutedUsersModal`, `followedUsersModal`), and `--darkTheme-msgs-bg-adm: #0f2e43` admin message background is applied (rgb(14,54,81) = #0e3651 is the #2 most common bg color, 101 uses).
- **format/quality**: computed styles + rects (multi-state). Every `elements[]` node has `{path, tag, rect{x,y,w,h}, attrs, icon, style{...full computed style...}, before, after}`. Plus a `states` object of 27 interaction snapshots, each a `groups[]` of `{selector, rootPath, count, nodes[]}` with rects+styles. This is the richest capture format (not raw-DOM/inline-style like the HTML dumps).

## Structure (top-level keys, verified via node)
- `meta` — role/url/title/viewport/theme/userAgent. `url: https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1`, `title: "Mastering The Trade"`, viewport 2041x1265 dpr2, Android/Pixel 9 mobile UA, `presenterOnlyRoots: 7`, `elementsCapped: false`.
- `head` — 3 stylesheetLinks (FontAwesome **5.8.1** pinned, animate.css 3.7.2, app `styles.d622cb9ed2bbc221.css`).
- `cssVariables` — `{root, body}`; **root has 294 CSS custom properties** (e.g. `--success: #00bc8c`, `--darkTheme-msgs-bg-adm: #0f2e43`, `--lightTheme-roster-bg-adm: #e1e1e1`, `--note-text-color: #676767`).
- `fonts` — loaded list: FontAwesome 5 Free (400/900 loaded), Lato (400/700/italic unloaded), summernote.
- `stylesheets` — **41 stylesheet objects** with rule text (`stylesheets[0]` = FA all.css, 1411 rules).
- `palette` — 18 style buckets (color, backgroundColor, borderColor, fontFamily, fontSize, fontWeight, lineHeight, opacity, margins, zIndex, paddings, borderRadius, borderTopWidth, fontStyle, textTransform, gap, boxShadow). `backgroundColor` has 32 distinct values ranked by count (top: white 2292, #0e3651-ish 101, #6c757d 66).
- `elements` — **2,188 nodes** (full computed-style array).
- `assets` — `{images: 89, backgroundImages: 8, inlineSvgs: 0}`.
- `inventory` — `buttons: 250, inputs: 74, links: 39, menus: 300, modalsInDom: 120, dataAttributes: 13`.
- `states` — **27 interaction snapshots** (see below).
- `errors` — `[]` (clean capture, no errors).

## states documented (27) — the standout value of this file
Every state carries the base `app-presentationarea | .presentation-box | #mainTabs` groups plus its unique overlay:
- **Tabs**: `tab:Screens`, `tab:Streams`, `tab:Notes`, `tab:Files`
- **Notes** (real content, 6): `note:Welcome`, `note:JC's Daily Briefing`, `note:Henry's Workflowy Notes`, `note:Sam's Mag 7 index`, `note:1on1 Coaching/ Prop Firm & Too…`, `note:Taylor's Scorecard Rankings (6…`
- **Dropdowns** (`.dropdown-menu.show`): `dropdown:1,2,3,7,8`
- **Sidebar/menus**: `sidebar:open`, `sidebar:archives-open`, `sidebar:roster-cog-open`, `kebab:open`
- **Modals** (`.modal.show`, 8): `mobileAppInfoModal`, `webrtc-troubleshooter-modal`, `user-settings-modal`, **`alerts-logs-modal`**, **`chat-logs-modal`**, **`mutedUsersModal`**, **`followedUsersModal`**, `replyModal`

## surfaces documented
Main tabset (Screens/Streams/Notes/Files), presentation area / presentation-box, chat message list (msg-box, admin msg-box-adm), message kebab menu (msgMenu, dropright), reactions/reply, user badges, roster, notes panel (noteTabset/noteDownload), alerts (alertHeader, alert-qa, tradeColor), chat header, admin log modals, user-settings modal, webrtc troubleshooter, mobile-app-info modal, reply modal.

## maps to (our components)
- Main tab shell / stage → `MainTabs`/stage components (`#mainTabs`, `mainTabset`, `presentation-box`, `app-presentationarea`).
- Chat message rows → chat message component (`msg-box` x100, `msg-box-adm` x20 admin variant, `msg-left`, `preText`/`text-formated`, `created-at` x100, `username` x102, `avatar` x100, `flex-row-reverse` x40 = own/reverse messages).
- Message actions → kebab/reactions component (`msgMenu` x100, `dropright` x100).
- User badge rendering → badge component (`user-badge-img` x202, distinct imgur PNG srcs — confirms badges are `<img class="user-badge-img">`, NOT text badges, matching NON-NEGOTIABLE #0).
- Alerts panel → alert component (`alertHeader`, `alert-qa` x50, `tradeColor` x18, `badge-success` x1).
- Notes panel → notes component (`noteTabset`, `noteDownload`).
- Admin modals → admin log/moderation modals (alerts-logs, chat-logs, muted users, followed users) — these are ADMIN surfaces not present in member captures.

## key findings (cited)
1. **This is the authoritative ADMIN capture.** `meta.role: "admin"` + admin-only DOM: `msg-box-adm` counted **20x** and admin log modals (`alerts-logs-modal`, `chat-logs-modal`, `mutedUsersModal`, `followedUsersModal`) present in `states`. Admin message bg `--darkTheme-msgs-bg-adm: #0f2e43` is the #2 background color (rgb(14,54,81), 101 uses).
2. **Badges are images, not text.** `user-badge-img` appears **202x** in `elements`, each an `<img>` with a distinct imgur src (e.g. `https://i.imgur.com/EwVGWGS.png`, `w0vevvY.png`, `p5iXYiw.png`). Confirms the corpus authority note that "New/Trial text badge" prose analysis is WRONG.
3. **27 pre-expanded interaction states** — the only file giving computed styles+rects for every modal/dropdown/tab OPEN state, incl. 6 real note bodies (trader names JC/Henry/Sam/Taylor) and 8 modals. Base stage always = `#mainTabs` + `.presentation-box`.
4. **FontAwesome pinned 5.8.1** (`head.stylesheetLinks[0]` = `use.fontawesome.com/releases/v5.8.1/css/all.css`); fonts = Lato 400/700 + FA5 Free 400/900. `--success: #00bc8c` (TrickTrades/Darkly teal) is a root CSS var.
5. **Reverse (own) messages** = `flex-row-reverse` x40; `created-at`/`msgMenu`/`avatar` each ~100 = roughly 100 messages captured. `elementsCapped: false` so the 2,188-element tree is complete, not truncated.

## notes
- **Best-authority / superset flag**: this is the single richest ADMIN-role artifact — full computed styles + rects + 27 states + palette + inventory + 41 stylesheets. Any admin-role side-by-side comparison should treat THIS as primary authority over any prose `.md` or raw HTML dump.
- Companion to (likely) member/presenter `proroom-all-*.json` captures; this one uniquely carries the admin log/moderation modals and `msg-box-adm`.
- `errors: []` and `elementsCapped: false` → clean, complete capture. No corruption/empties/duplication observed.
- Captured under a mobile UA (Pixel 9) at a wide 2041px viewport (`tooNarrow: false`) — desktop-width layout, mobile UA string; note this if resolving responsive breakpoints.
