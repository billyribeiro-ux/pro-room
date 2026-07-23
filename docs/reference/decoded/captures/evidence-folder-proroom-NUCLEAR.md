# Decoded capture — `evidence-folder/proroom-NUCLEAR.json`

> Forensic decode of `/Users/billyribeiro/Desktop/pro-room/evidence-folder/proroom-NUCLEAR.json`
> (23,384,044 bytes). Every value below cites a locator inside the file. Counts were verified
> `processed == total` (see §2). Do not re-open the JSON to build from this — it is self-contained.

---

## 1. File identity & capture metadata

Source: `meta` (top-level dict, 6 keys). Locator = `$.meta.*`.

| Field | Value | Locator |
|---|---|---|
| `label` | `"NUCLEAR"` | `$.meta.label` |
| `url` | `https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1` | `$.meta.url` |
| `title` | `"Mastering The Trade"` | `$.meta.title` |
| `ua` | `Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36` | `$.meta.ua` |
| `viewport.w` | `1933` | `$.meta.viewport.w` |
| `viewport.h` | `1265` | `$.meta.viewport.h` |
| `viewport.dpr` | `2` | `$.meta.viewport.dpr` |
| `capturedAt` | `2026-06-16T21:03:58.611Z` | `$.meta.capturedAt` |

**App version:** `v4.0.1-c0fee8f5` — sidebar footer, `$.domHtml` `"Version: v4.0.1-c0fee8f5"`.
**Room id:** `652754202ad80b3e7c5131e2` (from URL). **Query flag:** `sl=1`.

### UA vs viewport contradiction (honest flag)
The UA string reports **`Android 15; Pixel 9 … Mobile Safari`** yet the viewport is **1933×1265 @dpr2**
(a desktop-width layout — the app renders the desktop two-pane split, not the mobile collapse).
This is a **spoofed/emulated UA** (DevTools device-mode UA override with a desktop viewport), not a real
Pixel 9. Treat the capture as a **desktop-width render** (`navbar-expand-md` is expanded, split panes shown).
Locators: `$.meta.ua` vs `$.meta.viewport`; and `$.elements[?tag=body].rect = {w:1933,h:1265}` (`$.elements[0]`).

### Theme (applied)
**lightTheme.** `app-room` carries `class="lightTheme"` — `$.elements[?tag=app-room].class = "lightTheme"`.
`domHtml` contains both `lightTheme` (42×) and `darkTheme` (41×) tokens because the app ships **both** palettes
as CSS-var sets; only `lightTheme` is applied to the room container this session.

### DarkReader contamination (honest flag — LOW impact)
The capturing browser had the **DarkReader** extension active: `$.domHtml` contains `darkreader` 24×,
including `--darkreader-inline-bgcolor` / `data-darkreader-inline-bgcolor` (4×) **only inside note-body HTML**
(author-supplied `<a>`/`<p>` markup in the Welcome note). **Zero** elements have `darkreader` in their
`style` block (`$.elements[*].style` — 0 hits). Conclusion: **computed styles and `cssVariables` are clean**;
DarkReader only touched a few inline attributes on note content and can be ignored for palette work.

### Role determination — **MEMBER / regular viewer** (evidence-driven)
`meta` carries **no `role` field**. Role is inferred from which conditional surfaces render:

**Present (viewer affordances):**
- Chat composer is enabled — `<textarea id="textAreaTxt" placeholder="Type your message here..">`
  visible at rect `(10,1220,995×35)` (`$.elements[?attrs.id=textAreaTxt]`). Member can post to chat.
- Per-alert **"Ask a question"** buttons (`btn btn-sm btn-secondary … alert-qa`, title `"Ask a question"`,
  icon `fa-question-circle`) — a **viewer→presenter** Q&A affordance, 50 instances (`$.domHtml`, and
  `$.elements[?class~alert-qa]`). A presenter would post alerts, not "ask questions" about them.
- Message 3-dot menu (`msgMenu`, glyph `⠇`) options are **viewer-only**: `User Info`, `Mention`, `Reply`
  (chat only), `Copy` (alerts), `Add Reaction`. Enumerated app-wide via `$.domHtml` dropdown-item text:
  `User Info ×100`, `Mention ×100`, `Copy ×50`, `Reply ×50`. **No** Mute-user / Ban / Kick / Delete-message /
  Pin / Warn / Broadcast option anywhere.
- Notes show **only a "Download" button** (`noteDownload ×6`); **no** Delete/Upload/New/Save/Add-note controls
  (`noteDelete=0, noteUpload=0, noteNew=0, noteSave=0, noteAdd=0` in `$.domHtml`). A presenter/admin edits notes.

**Absent as rendered surfaces (admin/presenter only):** `Post Alert`, `Session Control`, `Present`, `Record`
strings exist **only inside hidden modal/component templates** with `rect (0×0)` (Angular always ships every
component template regardless of role) — e.g. `"Post Alert"` occurs only inside `app-post-alert-modal`
(`$.domHtml` @ offset 521613, `<h5 id="post-alert" class="modal-title">Post Alert</h5>`), and
`"Session Control"` only inside `<h5 id="session-control">` (@ 1672219). None of these render on-screen.

**Cross-check:** the sibling `member` capture (§7) has an explicit `role:"member"` and captures the identical
room — this NUCLEAR file's rendered surface set matches member exactly.

**Verdict: MEMBER (regular viewer).** No moderator/presenter/admin surface renders.

### Connection state — **OFFLINE / disconnected at capture** (honest flag — HIGH impact on `modals`)
The user-info popup captured shows `<span class="badge badge-danger">Offline</span>`
(`$.modals["Connectivity Check"].html`). The **roster is empty** (`<div class="room-roster-list"></div>`
with no children — `$.domHtml`) and the sidebar **"Users:"** counter renders no number. The stage shows the
"nobody here" empty states (§4). Interpretation: the app was **connected-then-dropped or captured while
disconnected**; live-populated surfaces (roster, user count) are empty. Chat/alert history is still present
(it is client-cached), so message content is real.

---

## 2. Top-level structure (7 keys) — verified counts

`processed == total == 9000` for `elements` (verified by full iteration). `$` = root object.

| Key | Type | Count / len | Notes | Locator |
|---|---|---|---|---|
| `meta` | dict | 6 keys | §1 | `$.meta` |
| `cssVariables` | dict | 2 keys (`root`, `body`) | `root` and `body` are **byte-identical**, 294 vars each (§3) | `$.cssVariables` |
| `fonts` | dict | 2 keys (`loaded` 16, `faceRules` 4) | §3 | `$.fonts` |
| `stylesheets` | list | 41 | 3 external + 38 inline; 5,286 total CSS rules; §8 | `$.stylesheets` |
| `domHtml` | str | 1,702,737 chars | full serialized DOM (Angular, `_ngcontent-ng-c*` scoping) | `$.domHtml` |
| `elements` | list | **9000** | per-element `{path, tag, class, attrs, rect, style, before, after}`; §4 | `$.elements` |
| `modals` | dict | 8 keys | **all 8 resolve to the same "Offline" user-info popup — real modal content NOT captured (honest gap)** §5 | `$.modals` |

**Element schema** (`$.elements[i]`, 8 keys): `path` (CSS-ish ancestor chain), `tag`, `class`, `attrs` (obj),
`rect` `{x,y,w,h}`, `style` (**55 distinct computed properties**), `before` / `after` (pseudo-element objects
or `null`). Pseudo usage: **478** elements have `::before`, **5** have `::after` (`$.elements[*].before/after`).

**Element tag histogram** (all 9000, `$.elements[*].tag`):
`div 3776, strong 1819, i 1616, a 535, img 338, span 289, app-st-message 100, p 99, button 95, br 60,
input 58, label 54, li 45, ul 17, h3 11, b 10, hr 7, h5 7, nav 6, app-note 6, h2 6, textarea 5,
as-split-area 4, font 4, select 3, as-split 2, app-roomscroller 2, app-presenter-cams 2, video 2, option 2,`
and singletons: `body, app-root, router-outlet, app-room, app-room-roster, h4, app-alerts, app-chat,
app-webcam-holder, app-presentationarea, audio, ol, app-user-info-modal, app-play-youtube-modal,
app-user-settings-modal, app-av-settings-modal, app-debug-log-modal, app-post-alert-modal, app-poll-modal,
app-chat-logs-modal`.

**Rect visibility:** 2,200 elements have nonzero area; **6,800 have zero-area rects** (off-screen scroller
history at negative `y`, and 0×0 hidden modal/component templates). `$.elements[*].rect`.

---

## 3. cssVariables — COMPLETE (294 vars, `$.cssVariables.root`)

`root` ≡ `body` (identical). These are the **getComputedStyle `:root` values** (Bootstrap 5 base +
ProTradingRoom theme). Note: an inline `<style>` block in `domHtml` (see §8) **re-declares a large subset of
these ProTradingRoom vars with a DARK palette** (yellow accents `#f7fd37`, `#000/#111` bg) via a per-room
theme — those inline values are what actually paint dark-mode; the table below is the computed `:root`
baseline (lightTheme active this session, so the `--lightTheme-*` vars govern message/roster colors).

### 3a. ProTradingRoom app tokens (the ones that drive this UI)

| Variable | Value |
|---|---|
| `--app-font-family` | `'Open Sans', sans-serif` |
| `--app-link-color` | `#45a2ff` |
| `--navbar-bg` | `#0c2434` |
| `--navbar-color` | `#fff` |
| `--sidebar-wrapper-bg-color` | `#103d5c` |
| `--sidebar-wrapper-color` | `#fff` |
| `--sidebar-menu-bg` | `#103d5c` |
| `--sidebar-menu-color` | `#fff` |
| `--sidebar-menu-active-color` | `#45a2ff` |
| `--sidebar-navItem-border-color` | `#fff` |
| `--presenter-area-bg` | `#0f2e43` |
| `--presenter-noRecording-color` | `#fff` |
| `--presenter-recording-color` | `#45a2ff` |
| `--msgs-header-bg` | `#0a6db1` |
| `--msgs-header-color` | `#fff` |
| `--msgs-separator-bg` | `#45a2ff` |
| `--msgs-separator-border-color` | `#45a2ff` |
| `--msgs-separator-color` | `#fff` |
| `--nickname-color` | `#0a6db1` |
| `--name-color` | `#c0d8ed` |
| `--users-color` | `#fff` |
| `--users-border-color` | `#fff` |
| `--users-badge-bg-color` | `#0e3651` |
| `--users-badge-color` | `#f4f4f4` |
| `--textarea-bg` | `#111` |
| `--textarea-holder-border-color` | `#0a6db1` |
| `--textarea-holder-btns-color` | `#676767` |
| `--textarea-holder-btns-hover-color` | `#0a6db1` |
| `--tab-active-bg` | `#45a2ff` |
| `--tabs-color` | `#fff` |
| `--tabs-border-color` | `#0a6db1` |
| `--tabs-dropdown-bg` | `#0f2e43` |
| `--tabs-dropdown-color` | `#45a2ff` |
| `--notes-tabs-bg` | `#0c2434` |
| `--note-tabs-color` | `#fff` |
| `--note-text-bg` | `#fff` |
| `--note-text-color` | `#676767` |
| `--note-options-bg` | `#f4f4f4` |
| `--note-options-color` | `#fff` |
| `--note-options-hover-color` | `#212529` |
| `--note-download-bg` | `#92d528` |
| `--note-delete-bg` | `#bb352a` |
| `--note-next-bg` | `#45a2ff` |
| `--file-download-bg` | `#92d528` |
| `--file-delete-bg` | `#bb352a` |
| `--file-see-more-bg` | `#45a2ff` |
| `--file-list-odd-bg` | `#fff` |
| `--file-list-even-bg` | `#f4f4f4` |
| `--file-name-color` | `#0a6db1` |
| `--file-size-color` | `#b2b2b2` |
| `--file-searchbar-bg` | `#fff` |
| `--file-searchbar-color` | `#b7b7b7` |
| `--file-searchbar-icon-color` | `#666666` |
| `--split-gutter-bg` | `#0a6db1` |
| `--split-gutter-color` | `#fff` |
| `--checkbox-bg-color` | `#45a2ff` |
| `--search-icon-bg-color` | `#45a2ff` |
| `--search-icon-color` | `#f4f4f4` |
| `--reload-icon-bg-color` | `#f4f4f4` |
| `--reload-icon-color` | `#45a2ff` |
| `--session-control-dropdown-bg` | `#0e3651` |
| `--archives-dropdown-menu-bg-color` | `#0e3651` |
| `--archives-dropdown-menu-color` | `#45a2ff` |
| `--dropdown-divider-bg` | `#45a2ff` |
| `--rosterImg-border-radius` | `50%` |
| `--avatar-gear-icon-padding` | `3px 6px` |
| `--ptr-website-link-color` | `#45a2ff` |
| `--mobileApp-info-bg-color` | `transparent` |
| `--mobileApp-info-color` | `#f4f4f4` |
| `--transparent-gray` | `rgba(255, 255, 255, 0.331)` |

### 3b. Modal tokens (all render as the NAVY modal — matches memory)

| Variable | Value |
|---|---|
| `--modal-content-bg-color` | `#103d5c` |
| `--modal-content-border-color` | `#103d5c` |
| `--modal-content-color` | `#f4f4f4` |
| `--modal-active-tab-bg-color` | `#45a2ff` |
| `--modal-active-tab-border-color` | `#45a2ff` |
| `--modal-active-tab-color` | `#fff` |
| `--modal-tabs-border-color` | `#45a2ff` |
| `--modal-input-group-bg` | `#0a6db1` |
| `--modal-alert-link-color` | `#0a6db1` |
| `--modal-upload-files-color` | `#0a6db1` |
| `--modal-btn-close-bg` | `#0a6db1` |
| `--modal-btn-close-border` | `#0a6db1` |
| `--modal-btn-success-bg` | `#92d528` |
| `--modal-btn-success-border` | `#92d528` |
| `--modal-btn-danger-bg` | `#bb352a` |
| `--modal-btn-danger-border` | `#bb352a` |
| `--modal-btn-hover-opacity` | `0.9` |

### 3c. Per-theme message/roster palettes (dual sets — `--lightTheme-*` active)

| Variable | Value |  | Variable | Value |
|---|---|---|---|---|
| `--lightTheme-chat-bg` | `#eee` | | `--darkTheme-chat-bg` | `#000` |
| `--lightTheme-msg-bg` | `#fff` | | `--darkTheme-msg-bg` | `#000` |
| `--lightTheme-msg-color` | `#676767` | | `--darkTheme-msg-color` | `#fff` |
| `--lightTheme-msg-border-color` | `#e1e1e1` | | `--darkTheme-msg-border-color` | `#f4f4f4` |
| `--lightTheme-msgs-bg` | `#fff` | | `--darkTheme-msgs-bg` | `#143c57` |
| `--lightTheme-msgs-bg-adm` | `#f4f4f4` | | `--darkTheme-msgs-bg-adm` | `#0f2e43` |
| `--lightTheme-nickname-color` | `#676767` | | `--darkTheme-nickname-color` | `#c0d8ed` |
| `--lightTheme-username-color` | `#0a6db1` | | `--darkTheme-username-color` | `#0a6db1` |
| `--lightTheme-date-color` | `#a8a8a8` | | `--darkTheme-date-color` | `#a8a8a8` |
| `--lightTheme-roster-bg` | `#f1f1f1` | | `--darkTheme-roster-bg` | `#111` |
| `--lightTheme-roster-bg-adm` | `#e1e1e1` | | `--darkTheme-roster-bg-adm` | `#000` |
| `--lightTheme-textarea-bg` | `#fff` | | `--darkTheme-textarea-bg` | `#0c2434` |
| `--lightTheme-textarea-color` | `#676767` | | `--darkTheme-textarea-color` | `#f4f4f4` |
| `--lightTheme-sidebar-wrapper-bg-color` | `#fff` | | `--darkTheme-sidebar-wrapper-bg-color` | `#000` |
| `--lightTheme-sidebar-wrapper-color` | `#676767` | | `--darkTheme-sidebar-wrapper-color` | `#f4f4f4` |
| `--lightTheme-user-location-color` | `#676767` | | `--darkTheme-user-location-color` | `#f4f4f4` |
| `--lightTheme-mobileApp-info-color` | `#676767` | | `--darkTheme-mobileApp-info-color` | `#f4f4f4` |
| `--lightTheme-msgs-separator-bg` | `#e8e8e8` | | `--darkTheme-msgs-separator-bg` | `#222` |
| `--lightTheme-msgs-separator-color` | `#373c42` | | `--darkTheme-msgs-separator-color` | `#aaa` |
| `--lightTheme-msgs-separator-border-color` | `#373c42` | | `--darkTheme-msgs-separator-border-color` | `#373c42` |

### 3d. Named color palette + Bootstrap semantic tokens

| Variable | Value |  | Variable | Value |
|---|---|---|---|---|
| `--primary` | `#375a7f` | | `--blue` | `#375a7f` |
| `--secondary` | `#444` | | `--success` | `#00bc8c` / `--green` `#00bc8c` |
| `--info` | `#3498DB` / `--cyan` `#3498DB` | | `--warning` | `#F39C12` |
| `--danger` | `#E74C3C` | | `--red` | `#f00` |
| `--light` | `#303030` | | `--dark` | `#adb5bd` |
| `--black` | `#000` | | `--white` | `#fff` |
| `--yellow` | `#ff0` | | `--fire-yellow` | `#f7fd37` |
| `--orange` | `#fd7e14` | | `--pink` | `#e83e8c` |
| `--purple` | `#6f42c1` | | `--indigo` | `#6610f2` |
| `--teal` | `#20c997` | | `--light-blue` | `#40e0d0` |
| `--gray` | `#bbb` | | `--gray-dark` | `#303030` |
| `--dark-black` | `#222` | | `--darker-black` | `#111` |
| `--light-black` | `#373c42` | | `--lighter-black` | `#3e444a` |
| `--dark-brown` | `#4b4b4b` | | `--light-brown` | `#8c8686` |
| `--brown` | `#555` | | `--darker-gray` | `#aaa6a6` |
| `--dark-gray` | `#aaa` | | `--light-gray` | `#ccc` |
| `--lighter-gray` | `#eee` | | `--transparent-gray` | `rgba(255,255,255,0.331)` |
| `--light-green` | `#1edd6e` | | `--lighter-blue` | `#edf2f6` |

Bootstrap breakpoints: `--breakpoint-xs 0 / -sm 576px / -md 768px / -lg 992px / -xl 1200px` (and `--bs-*`
mirrors + `--bs-breakpoint-xxl 1400px`). `--font-family-sans-serif` = `"Lato", -apple-system, …` (theme
default), but the applied body font is **Open Sans** (see §4, `--app-font-family` and body computed
`font-family: "Open Sans", sans-serif`). Full Bootstrap 5.3 token set (`--bs-primary #0d6efd`, `--bs-gray-*`,
`--bs-danger #dc3545`, `--bs-success #198754`, `--bs-border-radius .375rem`, `--bs-box-shadow …`, etc.) is
present verbatim at `$.cssVariables.root` (≈130 `--bs-*` keys) — standard Bootstrap defaults, reproduce from
Bootstrap 5.3 if needed.

---

## 3e. Fonts (`$.fonts`)

**`fonts.loaded` (16):** `Font Awesome 5 Free normal 400 loaded`, `Font Awesome 5 Free normal 900 loaded`
(these two **loaded**); `Font Awesome 5 Brands normal normal unloaded`; `summernote normal 400 unloaded`;
and 12× `Lato` faces (italic/normal, 400/700) — **all Lato unloaded** (page paints Open Sans / system).
`$.fonts.loaded[*]`.

**`fonts.faceRules` (4):** `@font-face` for `"Font Awesome 5 Brands"` (fa-brands-400.woff2/woff/ttf),
`"Font Awesome 5 Free"` weight 400 (fa-regular-400.*), `"Font Awesome 5 Free"` weight 900 (fa-solid-900.*),
and `summernote` (summernote.woff2/woff/ttf). `$.fonts.faceRules[*]`. **Applied body font** = `"Open Sans",
sans-serif` (computed, `$.elements[0].style.font-family`), body weight `300`, size `16px`, line-height `24px`.

---

## 4. Element inventory by surface

Layout root: `body (1933×1265)` → `app-root` → `app-room#topRoomDiv .lightTheme`. Two structural columns via
Angular-split (`as-split#mainAreaSplit`, `as-horizontal as-percent`):
**LEFT alert+chat column** `as-split-area.alert-chat-box` = `(0,49, 1096×1216)` and
**RIGHT presentation column** `as-split-area.presentation-box` = `(1107,49, 826×1216)`.
Gutter `as-split-gutter` at `flex-basis:11px`, `aria-valuenow≈47.59%` ("48 percent") — i.e. left pane ≈48%,
right pane `flex: 0 0 calc(42.9833% - 4.72817px)`. `$.domHtml` (split attrs) + `$.elements[?tag=as-split-area]`.

The LEFT column is itself a **vertical** split (`as-split.as-vertical`): **Alerts** `as-split-area.alert-box`
= `(0,49, 1096×574)` above **Chat** `as-split-area.chat-box` = `(0,634, 1096×631)`.

### 4a. Top navbar — `nav.navbar.navbar-expand-md.navbar-dark.fixed-top.mainAppNav` `(0,0, 1933×49)`
`$.elements[?class~mainAppNav]`, `$.domHtml`. bg **`rgb(12,36,52)` = #0c2434**, color `#fff`, font-size 16px.
Left→right children:
| Element | Rect | Detail |
|---|---|---|
| `span.sidebar-menu` `title="Open Sidebar"` | `(5,9, 28×31)` | bg `#103d5c`, child `<i class="fas fa-bars">` `(11,15,16×18)` 18px |
| `span.users` `title="Users Connected"` | `(42,16, 24×18)` | `<i class="fas fa-user">` 14px + count text (renders empty — offline) |
| `span.fas.fa-mobile.mobile-info-app-btn` `title="Launch in Mobile App"` | `(70,17, 10×16)` | 16px; `data-bs-target="#mobileAppInfoModal"` |
| `a.navbar-brand.ml-1.mr-auto` | `(88,5, 200×40)` | `<img id="cssLogo" alt="App Logo" class="brand-logo" src="…/uploads/8cb6ad5c3757766914222382a24b9d2a">` |
| `button.navbar-toggler.btnNavToggler` | `(0,0,0×0)` collapsed-only | `aria-label="Toggle navigation"`, target `#navbarsRoom` |
| `#navbarsRoom .navbar-nav.ml-auto` (right menu) | — | `li.talkingIndicator` text **`( No one is speaking )`**; `#dropdownVolume` **"Volume"** (`fa-volume-up 2x`, range slider min0 max100 title "Volume"); **"Reload"** item. Only mainNavItem labels present: **Volume**, **Reload**. |

### 4b. Sidebar (off-canvas, `nav.navbar.w-100.h-100` at `(-250,49, 250×1216)` — slid off-screen/closed)
`$.elements[?class~"navbar w-100 h-100"]`, full HTML `$.domHtml` @ offset 116386. bg `#103d5c`, links `#fff`.
Ordered items (each `a.nav-link.sidebar-item` with FA icon + label):
1. Footer block: `Powered by: ProTradingRoom.com` (link `https://protradingroom.com`), `Version: v4.0.1-c0fee8f5`,
   `<button class="btn btn-sm btn-secondary">Mobile App Info</button>`, `<hr>`, then status line
   `Chat ✓` (`fa-check`) `Media ✓`.
2. **Connectivity Check** — `fa-network-wired`, `data-bs-target="#webrtc-troubleshooter-modal"`.
3. **General Settings** — `fa-cogs`, `#user-settings-modal`.
4. **Archives** (dropdown `#archivesDropdown`, `fa-archive`) → items: **Alert Logs** (`fa-bell`,
   `#alerts-logs-modal`), **Chat Logs** (`fa-comment`, `#chat-logs-modal`), **Transcript History**
   (`fa-closed-captioning`, no modal wired).
5. **Manage Muted Users** — `fa-comments`, `#mutedUsersModal`.
6. **Manage Followed Users** — `fa-users`, `#followedUsersModal`.
7. **Users:** block (`a.active-room-users`, `fa-user`) with button cluster (all `btn btn-sm`, `(-121..-33,417)`,
   ~26×27): **Search Users** (`fa-search`), **Sort Users** (`fa-sort-alpha-down`), **Reload Users** (`fa-sync`),
   **Users Options** cog dropdown (`#user-options-btn`) → single item **"Sort by Trials"**. Then
   `<app-room-roster>` → **`.room-roster-list` is EMPTY** (offline; no roster rows captured).

### 4c. Alerts panel — `app-alerts` `(0,49, 1096×574)`
Header `nav.chat-nav.alertHeader` `(0,49, 1096×48)`, bg **`rgb(10,109,177)` = #0a6db1**.
Brand `<a class="navbar-brand"><i class="fas fa-bell me-1"></i> Alerts </a>`. Right controls:
**Search** (`fa-search`) and **Settings** gear (`fa-cog chat-header-gear`, title "Settings").
Body: `app-roomscroller#chatScrollViewParentAlerts` `(0,97, 1096×526)` containing **50 `app-st-message`**
(alerts render Q&A, not chat replies; message menu = User Info / Mention / **Copy** — no Reply/Reaction).
`$.domHtml` (app-alerts, len 153,345), `$.elements[?tag=app-st-message & path~chatScrollViewParentAlerts]` = 50.

### 4d. Chat panel — `app-chat` `(0,634, 1096×631)`
Header `nav.chat-nav.chatHeader` `(0,634, 1096×48)`, bg **#0a6db1**. Brand `<i class="fas fa-comment">`.
**Tabs** (`ul.chatTabs` role=tablist): **"Main Chat"** (`nav-link active`) and **"Off Topic"**.
Right controls: **Search** (`fa-search`), **Settings** gear (`fa-cog`, "Settings").
Body: `app-roomscroller.chat-uploaded-img-sm` `(0,682, 1096×528)` containing **50 `app-st-message`**
(message menu = User Info / Mention / **Reply** / **Add Reaction** — no Copy).
Tab-active style (scoped CSS): `.chatTabs .nav-link.active` bg `var(--modal-active-tab-bg-color)` **#45a2ff**,
color `var(--modal-active-tab-color)` **#fff**, border `#45a2ff`; tab font `700 / 12px`. `$.domHtml` (app-chat).

**Total `app-st-message` = 100** (**50 alerts + 50 chat**, counted by element `path`:
`$.elements[?tag=app-st-message]` = 100; 50 under `chatScrollViewParentAlerts`, 50 under `chat-uploaded-img-sm`).
Menu-item split confirmed in `$.domHtml`: **Reply = chat-only (50×), Copy = alerts-only (50×), Add Reaction =
chat-only** (all messages scrolled into history at negative `y`; the scrollers show a window of the full log).

### 4e. Message anatomy (repeated set — one full spec + deltas)
`app-st-message` → `div.msg-box.pb-1` → row `[3-dot menu][avatar]` + `[header][body]`.
Full example (chat, `$.domHtml` chat scroller): username **"Bill in Dallas"**, gravatar avatar,
5 badge imgs, timestamp **"03:57 PM"**, then `div.msg-left.text-formated.preText` body.
Computed styles (from a rendered `.msg-box` subtree, `$.elements`):

| Sub-element | Selector | Computed style |
|---|---|---|
| container | `.msg-box` (div) | bg **#fff** (rgb 255,255,255); font `"Open Sans"` 16px/24px; w 1095.86px |
| menu | `a.msgMenu.dropright` | glyph `⠇` (U+2807); dropdown `.users-dropdown-options` items **User Info / Mention / Reply / Add Reaction** (chat) or **User Info / Mention / Copy** (alerts) |
| avatar | `.avatar.pl-1 > img` | box `(x,y, 39×35)`, `padding-left 4px`, `src=secure.gravatar.com/avatar/<hash>?d=mm&s=50`; roster/avatar `border-radius 50%` |
| username | `strong.username.mx-1` | color **#0a6db1** (rgb 10,109,177), **font-weight 900**, 14px/21px, margin-left 4px |
| badges | `img.user-badge-img` | **20×20** each, inline row (`d-inline-block`); srcs = `i.imgur.com/*.png` |
| timestamp | `span.created-at.mx-2` | color **#a8a8a8** (rgb 168,168,168), 12px, font-weight 600. **Chat format `"03:57 PM"`; Alert format `"6/10/26, 10:33 AM"`** |
| body | `div.msg-left.text-formated.preText` | color **#676767** (rgb 103,103,103), **13px**/19.5px, margin-left 8px |
| Q&A (alerts only) | `button.alert-qa` `title="Ask a question"` | bg **#6c757d** (btn-secondary), color #fff, **10px**, 18×19, radius 4px, icon `fa-question-circle` |

**Date separators** (`div.separator`, 6 of them): bg **#e8e8e8** (rgb 232,232,232), text color #ccc, 16px;
inner `<a>` text = **"Thursday, June 11, 2026"**, **"Friday, June 12, 2026"** (this one has inline
`style="color: rgb(26,26,26)"`), **"Saturday, June 13, 2026"**, **"Sunday, June 14, 2026"**,
**"Monday, June 15, 2026"**, **"Tuesday, June 16, 2026"**. `$.elements[?class~separator]`, `$.domHtml`.

### 4f. Chat composer — `div.textAreaHolder.textSendDiv` (bottom of chat)
`$.domHtml`, `$.elements[?attrs.id=textAreaTxt]`. `<textarea id="textAreaTxt" name="txt-area" rows="1"
spellcheck="true" placeholder="Type your message here.." class="txt-area form-control border-0">` at
`(10,1220, 995×35)`. Scoped CSS: border `1px solid #ffffff`, radius 0, font-size 14px, resize none, bg/color
via `--textarea-bg/--textarea-color`. **No send button** (Enter to send). Right button column
`.textAreaBtnsCol`, 3 `span.textAreaBtns`:
1. `<i class="far fa-smile">` — tooltip **"Add Emojis"** (popover).
2. `<i class="fas fa-image">` — tooltip **"Upload an Image"**.
3. `<span>GIF</span>` (12px) — tooltip **"Search for GIFs"** (Giphy popover, `.giphy-search` 400×700).

### 4g. Presentation / stage — `app-presentationarea` `(1107,49, 826×1216)`
`$.domHtml` (`<app-presentationarea>`). Wrapper `.mainPresentationAreaHolder`. `app-webcam-holder` +
`app-presenter-cams` present but **0×0** (no active cams). presentation-box bg **#0f2e43** (rgb 15,46,67).
**Main tabs** `ul#mainTabs.mainTabset` (role=tablist):
| Tab | id | icon | state |
|---|---|---|---|
| **Screens** | `screens-tab` | `fa-desktop` | pane `.fade` (not shown); empty state `<h3>No one is presenting right now...</h3>` |
| **Streams** | `streams-tab` | `fa-podcast` | **`hidden=""`** (tab hidden); empty state `<h3>No one is streaming right now...</h3>` |
| **Notes** | `notes-tab` | `fa-edit` (`#noteChangeIndicator`) | **`.active` — this tab is shown** |
| **Files** | `files-tab` | `fa-folder` | pane `.fade` |

### 4h. Notes (active tab) — `ul#notesTabs.noteTabset`
6 note tabs (`a.editName`), `$.domHtml` (editName), `$.elements[?tag=app-note]` (6, only first rendered at
`(1122,185, 796×1046)`, rest 0×0):
1. **"Welcome"** — `nav-link active`; `badge badge-success` w/ `fa-home` tooltip
   *"This note is the Welcome Mat, and will be shown by default when noboby is presenting"*. Content =
   Simpler Trading welcome-mat `<img>` (`…2026_Q2_JC_Intel_Welcome_Mat_1050X461…png`, width 100%) wrapping
   replay links (`simplertrading.com/market-shock-replay`, `/momentum-replay`, `/earnings-trades-replay`,
   `/explosive-earnings`, `/ai-trading`, `/options-income-replay`).
2. **"JC's Daily Briefing"** — content: `<b>` "All times quoted are CENTRAL TIME." + "FOR ADDITIONAL NOTES
   CLICK HERE" (Google Docs link) + a screenshot img.
3. **"Henry's Workflowy Notes"**
4. **"Sam's Mag 7 index"**
5. **"1on1 Coaching/ Prop Firm & Tool Discounts codes."**
6. **"Taylor's Scorecard Rankings (6/15 CLOSE)"**

Note options bar (`.noteOptions`): single button **"Download"** (`btn.noteDownload`, `fa-download`) — **no
edit/delete/add** (viewer). `noteDownload ×6` in `$.domHtml`.

### 4i. Files tab — `#files` (`.fade`, not shown)
Sub-tabs `ul#myTab.files-tabs`: **Files** (`badge bg-danger` count **0**), **Images** (count **0**),
**Sounds** (count **0**). Search input `placeholder="Search files..."`. `$.domHtml` (`id="files"`).

### 4j. Poll — `app-poll-modal#pollModalCompHolder.pollModalHolder` (floating panel, **0×0** hidden)
`$.domHtml` (`app-poll-modal`). Titlebar `#pollPanelTitlebar` "**Polls**" with Minimize
(`fa-window-minimize`) / Maximize (`fa-window-maximize`) / Close (`fa-times`) buttons. Body tabs:
**"Create New Poll"** (active) — inputs `#pollQuestionTxt` (ph *"Main poll question (i.e. Where do you think
the market is going?)"*), `#pollChoiceTxt` (ph *"Enter a choice (i.e. Up, Down, Sideways)"*), numbered steps
`1 Enter your poll question` / `2 Add Choices/Answers` — and **"Pre-Canned Polls"**. NOTE: this is a
poll-*creation* template shipped in the DOM but rendered 0×0 (not an active member surface this session).

### 4k. Modal/component templates in DOM (all `rect ≈ 0×0`, hidden)
`$.elements[?tag~modal]`: `app-user-info-modal`, `app-play-youtube-modal` (input ph "Paste YouTube URL"),
`app-user-settings-modal`, `app-av-settings-modal` (nav "user-audio-video-settings"), `app-debug-log-modal`
(`<textarea id="debugLogModalTxt">`), `app-post-alert-modal` (`#alert-modal`, `<h5 id="post-alert">Post
Alert</h5>`, `<textarea placeholder="Alert Text...">`, "Add Legal Disclosure?" checkbox, `btn-success` "Post
Alert" — **admin template, not rendered**), `app-poll-modal`, `app-chat-logs-modal`. Plus `#session-control`
modal (`<h5 id="session-control">Session Control</h5>`) and `#mobileAppInfoModal`. All ship regardless of role.

### 4l. Inputs/selects inventory (58 inputs, 3 selects) — reveals the Settings template
`$.elements[?tag=input]`. Notable ids (all from hidden General/AV settings + poll + files templates):
- Theme radios: `app-light-theme`, `app-dark-theme`.
- Chat/Alerts layout radios: `chat-alerts-left`, `chat-alerts-top`, `chat-alerts-right`, `chat-alerts-bottom`.
- Do-Not-Disturb checkboxes: `alert-donot-disturb`, `qa-donot-disturb`, `non-trade-donot-disturb`,
  `chat-donot-disturb`, `app-donot-disturb`, `presentation-subtitles`.
- Color pickers (`type=color`): `chat-text-color`, `chat-username-color`, `chat-bg-color`, `chat-ticker-color`.
- `chat-text-size` (`type=number`); `pm-window-layout` (checkbox); recording/reaction sound toggles
  (`app-recording-start-sound`, `app-recording-stop-sound`, `app-reactions-popup`).
- Text: `Search files...`, `Paste YouTube URL`; range slider (volume); poll text inputs; 3× `Alert Text...`
  textareas (hidden alert modal).

---

## 5. States — decoded

| State surface | Value / evidence | Locator |
|---|---|---|
| Applied theme | **lightTheme** | `$.elements[?tag=app-room].class` |
| Connection | **Offline / disconnected** (`badge badge-danger "Offline"`; empty roster; blank user count) | `$.modals.*.html`; `$.domHtml` `room-roster-list` empty |
| Active main tab | **Notes** (`notes-tab .active`; `#notes .show active`) | `$.domHtml` |
| Screens tab state | empty — **"No one is presenting right now..."** | `$.domHtml` `#screens h3` |
| Streams tab state | **hidden** (`hidden=""`) — empty **"No one is streaming right now..."** | `$.domHtml` `#streams` |
| Active chat tab | **Main Chat** (`.nav-link active`); other = Off Topic | `$.domHtml` chatTabs |
| Active note | **Welcome** (Welcome Mat, `.nav-link active`) | `$.domHtml` notesTabs |
| Files/Images/Sounds counts | **0 / 0 / 0** (`badge bg-danger`) | `$.domHtml` files-badge |
| Talking indicator | **"( No one is speaking )"** | `$.domHtml` talkingIndicator |
| Sidebar | **closed / off-canvas** (`nav.navbar.w-100` at x=-250, off-screen) | `$.elements[?class~"navbar w-100 h-100"].rect` |
| Poll panel | present, **hidden** (0×0), "Create New Poll" tab active in template | `$.elements[?tag=app-poll-modal].rect` |
| Media status line | **Chat ✓ / Media ✓** (sidebar footer) | `$.domHtml` |
| Split ratio | left ≈**48%** / right ≈**42.98%**, gutter 11px | `$.domHtml` as-split-gutter aria-valuenow=47.59 |
| Alert-column split | Alerts 574px above Chat 631px | `$.elements[?class~alert-box / chat-box].rect` |
| DND / reactions toggles | template only (not read as checked/unchecked here — hidden 0×0) | `$.elements[?tag=input]` |

---

## 6. Text content — exact labels/placeholders/casing (verbatim)

- Top nav titles: `Open Sidebar`, `Users Connected`, `Launch in Mobile App`. Talking: `( No one is speaking )`.
- Right-menu items: `Volume`, `Reload`.
- Sidebar: `Powered by:  ProTradingRoom.com`, `Version: v4.0.1-c0fee8f5`, `Mobile App Info`, `Chat`, `Media`,
  `Connectivity Check`, `General Settings`, `Archives`, `Alert Logs`, `Chat Logs`, `Transcript History`,
  `Manage Muted Users`, `Manage Followed Users`, `Users:`, `Sort by Trials`. Button titles: `Reload Users`,
  `Sort Users`, `Search Users`, `Users Options`, `Users`.
- Alerts header: ` Alerts ` (leading/trailing space). Chat tabs: `Main Chat`, `Off Topic`.
- Composer placeholder: **`Type your message here..`** (two trailing dots). Buttons: `Add Emojis`,
  `Upload an Image`, `Search for GIFs`, label `GIF`.
- Alert Q&A button title: `Ask a question`.
- Message menu items: `User Info`, `Mention`, `Reply`, `Copy`, `Add Reaction`.
- Stage: `No one is presenting right now...`, `No one is streaming right now...`. Main tabs: `Screens`,
  `Streams`, `Notes`, `Files`.
- Note tabs (verbatim): `Welcome`, `JC's Daily Briefing`, `Henry's Workflowy Notes`, `Sam's Mag 7 index`,
  `1on1 Coaching/ Prop Firm & Tool Discounts codes.`, `Taylor's Scorecard Rankings (6/15 CLOSE)`.
  Welcome-mat tooltip: `This note is the Welcome Mat, and will be shown by default when noboby is presenting`
  (**sic** "noboby"). Rename tooltip: `Double-Click to rename note tab`. Note button: `Download`.
- Notes body text: `All times quoted are CENTRAL TIME.`, `FOR ADDITIONAL NOTES CLICK HERE`.
- Files sub-tabs: `Files`, `Images`, `Sounds`; search `Search files...`.
- Poll: `Polls`, `Create New Poll`, `Pre-Canned Polls`, `Enter your poll question:`, `Add Choices/Answers:`,
  placeholders `Main poll question (i.e. Where do you think the market is going?)`,
  `Enter a choice (i.e. Up, Down, Sideways)`.
- Post-alert modal (template): `Post Alert`, `Alert Text...`, `Add Legal Disclosure?`.
- User-info popup (the captured "modals"): `Offline` (badge), buttons `@Mention`, `Private Chat`, `Follow`,
  `Mute`, `Close`.
- Sample real usernames in chat/alerts: `Bill in Dallas`, `Mirza Catic`. Sample alert body:
  `Hey traders! When you have a brief moment, please fill out the survey below…`.
- Date separators: `Thursday, June 11, 2026` … `Tuesday, June 16, 2026` (see §4e).
- Timestamp formats: chat `03:57 PM`; alert `6/10/26, 10:33 AM`.

**FontAwesome glyphs via `::before` content** (`$.elements[*].before.content`, 478 total): `` user (102),
`` reply (100), `` comment (53), `` smile (51), `` copy (50), `` question-circle
(50), `` pen (6), `` download (6), `` search (4), `` times (4), `` check (3),
`` bell (3), `` closed-captioning (3), `` cog (3), `` sync (3), `` desktop (3),
`` bell-slash (3), `` volume (2), `` image (2), `` file-alt (2).

---

## 7. Relationship to `proroom-NUCLEAR-member.json` (top-level compare ONLY)

Per instructions I compared only the sibling file's top-level keys/counts/viewport (no content decode).

| Aspect | THIS file (`evidence-folder/proroom-NUCLEAR.json`) | `proroom-NUCLEAR-member.json` |
|---|---|---|
| Size | 23,384,044 bytes | 31,322,421 bytes |
| Top-level schema | **7 keys** `{meta, cssVariables, fonts, stylesheets, domHtml, elements, modals}` | **15 keys** `{role, capturedAt, url, title, viewport, dpr, userAgent, flags, rootVars, fonts, states, assets, inventory, stylesheets, inaccessibleStylesheets}` |
| Explicit `role` | none (inferred = member) | **`"member"`** |
| URL | `…?id=652754202ad80b3e7c5131e2&sl=1` | **identical** `…?id=652754202ad80b3e7c5131e2&sl=1` |
| Title | `Mastering The Trade` | **identical** `Mastering The Trade` |
| Viewport | **1933 × 1265** | **1401 × 905** (different) |
| dpr | 2 | 2 |
| capturedAt | **2026-06-16T21:03:58.611Z** | **2026-07-23T01:05:15.280Z** (≈5 weeks later) |
| Chrome / UA | Chrome/**149**.0.0.0 (Pixel 9 Mobile UA) | Chrome/**150**.0.0.0 (Pixel 9 Mobile UA) |
| CSS vars | `cssVariables.root` = **294** | `rootVars` = **294** (same count) |
| fonts | 16 loaded + 4 faceRules | `fonts` list len 16 |
| stylesheets | 41 | 38 (+1 `inaccessibleStylesheets`) |

**Conclusion: DISTINCT capture sessions of the SAME room, by two DIFFERENT capture-tool formats.** They share
the room (id + title + URL identical) and the 294-var palette, but differ in timestamp (5 weeks apart),
viewport, Chrome version, and — decisively — **top-level JSON schema** (7-key `domHtml/elements/modals` dump
here vs a 15-key `inventory/states/assets/flags/rootVars` dump there). This is **not a subset** of the other;
neither file's structure is contained in the other. Both, however, represent the **member/viewer role** (this
file inferred from surfaces §1; the sibling explicit `role:"member"`), so they corroborate each other on role.
Locators: `$.meta.*` here; `$.role / $.url / $.viewport / $.capturedAt / $.rootVars` in the sibling (read
top-level scalars only, no content decoded).

---

## 8. What this file UNIQUELY evidences + honest gaps

### Uniquely evidenced (strengths of this capture)
1. **Full serialized DOM** (`domHtml`, 1.7 MB) — the only source here for exact markup, class chains, tooltip
   text, the collapsed nav menu, note-body HTML, and hidden modal/component templates (post-alert, session-
   control, poll, settings). The sibling's `inventory`/`states` format does not carry raw DOM.
2. **9000 elements with per-element computed style (55 props) + rects + `::before`/`::after`** — enough to
   pixel-place and color-match every visible surface (message anatomy §4e, headers, composer, separators).
3. **Desktop-width member render at 1933×1265** — shows the fully-expanded two-pane split, both column split
   ratios, and both alert+chat scrollers populated (100 messages, date range Jun 11–16 2026). The sibling is a
   narrower 1401×905 render.
4. **Complete 294-var computed `:root` palette** AND the **inline per-room dark-theme override block**
   (yellow `#f7fd37` accents) captured in `domHtml` — documenting both the applied lightTheme and the
   alternate dark palette in one file.
5. **Real content**: 6 note tab names + Welcome-mat/JC-briefing note bodies, real usernames, real alert copy,
   real badge/gravatar image URLs — usable for honest sample data.

### Honest gaps (do NOT invent to fill)
1. **All 8 `modals` are the wrong content.** Every key in `$.modals` (Connectivity Check, General Settings,
   Archives, Alert Logs, Chat Logs, Transcript History, Manage Muted Users, Manage Followed Users) resolved to
   the **same** 1365-char "Offline" **user-info popup** (`badge-danger "Offline"`, buttons @Mention / Private
   Chat / Follow / Mute / Close), each with 16 zero-rect elements. **The real content of those 8 sidebar modals
   was NOT captured** — the capture script's open-each-modal step failed (app offline). Rebuild these modals
   from the sibling capture or a fresh capture, not from this file.
2. **App was OFFLINE / disconnected.** Roster is empty (`room-roster-list` has no rows), the "Users:" count is
   blank, and presenter cams / screens / streams are all empty. **No live roster data, no user list, no active
   presentation/screen-share** is evidenced. Roster row markup/styling is a genuine gap here.
3. **Spoofed mobile UA on a desktop viewport** — do not treat as a real Pixel 9 mobile layout; the mobile
   collapse/off-canvas states are not shown (nav is expanded; sidebar merely slid off-canvas at x=-250).
4. **DarkReader extension was active** (24 traces in `domHtml`, note-body inline attrs only). Computed styles
   and `cssVariables` are unaffected (0 hits), but be aware the raw note HTML carries `--darkreader-*` inline
   junk to strip.
5. **`animate.css` stylesheet blocked** (CORS `SecurityError`, `$.stylesheets[1].blocked`) — its rules are not
   in the dump (0 rules). Transition/animation classes (`animated fadeIn`) reference it but the keyframes are
   uncaptured.
6. **Fonts unloaded:** all 12 Lato faces + summernote report `unloaded`; only FA Free 400/900 loaded. The page
   painted with **Open Sans** (the applied `--app-font-family`), not Lato — match Open Sans, not the Lato
   theme default.
7. **Hidden templates ≠ member capabilities.** Post-Alert / Session-Control / poll-creation / recording
   controls exist in `domHtml` only as 0×0 Angular templates. They are **not** rendered member surfaces and
   must not be treated as things this role can do.

---

*Decode method: `python3` slicing of the 23.4 MB JSON; `elements` iterated fully (processed 9000 == total
9000, verified). All external stylesheet rules parsed where accessible (5,286 rules; `animate.css` blocked).
No other files modified; no git run.*
