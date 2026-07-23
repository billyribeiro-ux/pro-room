# Decoded capture — `proroom-all-admin.json` (ADMIN role)

> Forensic decode of `/Users/billyribeiro/Desktop/pro-room/proroom-all-admin.json`
> (45,835,730 bytes). Every value below cites a JSON path (`$`= root) or the state/element
> index it came from. **All 2188 element records were processed (processed == total = 2188).**
> This file is the **only ADMIN-role capture at full size** — it uniquely evidences the
> admin/moderation surfaces (Alert Logs, Chat Logs, Muted/Followed users, admin dropdowns).
> Rendered/computed values win over any prose. Uncaptured regions are called out as honest gaps in §8.

---

## 1. File identity & capture metadata  (`$.meta`, `$.head`)

| Field | Value | JSON path |
|---|---|---|
| Role | **`admin`** | `$.meta.role` |
| URL | `https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1` | `$.meta.url` |
| Room id | `652754202ad80b3e7c5131e2` (query `id`) | `$.meta.url` |
| Page title | `Mastering The Trade` | `$.meta.title` |
| Viewport | **2041 × 1265**, dpr **2** | `$.meta.viewport` |
| Screen | 2041 × 1265 | `$.meta.screen` |
| tooNarrow | `false` | `$.meta.tooNarrow` |
| Theme | htmlClass `""`, bodyClass `""`, dataTheme `null` — theme is class-driven on `#topRoomDiv` (see §4.0) | `$.meta.theme` |
| User-Agent | `Mozilla/5.0 (Linux; Android 15; Pixel 9) … Chrome/150.0.0.0 Mobile Safari/537.36` (emulated mobile UA at desktop viewport) | `$.meta.userAgent` |
| presenterOnlyRoots | `7` | `$.meta.presenterOnlyRoots` |
| elementsCapped | `false` (nothing truncated by the capture cap) | `$.meta.elementsCapped` |
| Framework | **Angular 17.3.12** (`ng-version` on `<app-root>`, index 2) | `$.elements[2].attrs["ng-version"]` |
| App version | **`v4.0.1-b422b517`** (sidebar text) | `$.elements[12].text` |

**Head** (`$.head`):
- `stylesheetLinks`: FontAwesome `https://use.fontawesome.com/releases/v5.8.1/css/all.css`; `animate.css/3.7.2`; app CSS `https://chat.protradingroom.com/styles.d622cb9ed2bbc221.css`.
- `fontLinks`: FA 5.8.1 only.
- `metas.viewport`: `width=device-width, initial-scale=1.0, target-densitydpi=device-dpi`.
- `preloads`: none.

**Capture states present** (`$.states`, 27 keys — see §5 for full decode):
`tab:Screens`, `tab:Streams`, `tab:Notes`, `tab:Files`, `note:Welcome`, `note:JC's Daily Briefing`,
`note:Henry's Workflowy Notes`, `note:Sam's Mag 7 index`, `note:1on1 Coaching/ Prop Firm & Too…`,
`note:Taylor's Scorecard Rankings (6…`, `dropdown:1/2/3/7/8`, `sidebar:open`, `sidebar:archives-open`,
`sidebar:roster-cog-open`, `kebab:open`, `modal:mobileAppInfoModal`, `modal:webrtc-troubleshooter-modal`,
`modal:user-settings-modal`, **`modal:alerts-logs-modal`**, **`modal:chat-logs-modal`**,
**`modal:mutedUsersModal`**, **`modal:followedUsersModal`**, `modal:replyModal`.

---

## 2. Complete top-level structure  (`$`)

| Key | Type | Count / notes | Path |
|---|---|---|---|
| `meta` | object | 10 keys (§1) | `$.meta` |
| `head` | object | 4 keys (§1) | `$.head` |
| `cssVariables` | object | 2 keys: `root` (294), `body` (294) — **identical, 0 diffs** (§3) | `$.cssVariables` |
| `fonts` | object | `loaded` (7), `fontFaceRules` (4), `fontFileUrls` (12) (§3.4) | `$.fonts` |
| `stylesheets` | array | **41** sheets (FA=1411 rules, animate=0, app=3102 rules, 38 inline Angular blocks) | `$.stylesheets` |
| `palette` | object | 18 aggregated style-value histograms (§3.5) | `$.palette` |
| `elements` | array | **2188** element records (§4) | `$.elements` |
| `assets` | object | `images` (89), `backgroundImages` (8), `inlineSvgs` (0) (§4.10) | `$.assets` |
| `inventory` | object | `buttons` (250), `inputs` (74), `links` (39), `menus` (300), `modalsInDom` (120), `dataAttributes` (13) (§7) | `$.inventory` |
| `states` | object | 27 interaction-state snapshots (§5) | `$.states` |
| `errors` | array | **empty** | `$.errors` |

**Element record schema** (union of keys across all 2188 — `$.elements[*]`):
`path`(2188), `tag`(2188), `rect`(2188 `{x,y,w,h}`), `attrs`(2188), `style`(2188 full computed-style
object, ~95 props each), `before`(2188, ::before pseudo or null), `after`(2188), `class`(1840),
`icon`(830 — **note: `icon:"fas fa-check"` is a capture artifact/default, ignore it**), `text`(490), `id`(148).

**Tag distribution** (`$.elements[*].tag`): div 1167, img 311, span 165, a 143, strong 102,
app-st-message 100, i 82, button 56, li 25, ul 7, p 5, nav 4, as-split-area 4, as-split 2,
app-roomscroller 2, video 2, + singletons (html, body, app-root, app-room, hr, app-room-roster,
app-alerts, app-chat, textarea, app-presentationarea, app-note).

---

## 3. cssVariables — COMPLETE  (`$.cssVariables.root` — 294 vars; `$.cssVariables.body` is byte-identical)

> These are the load-bearing design tokens. `root == body` (verified: 0 differences).
> Grouped logically below; **every one of the 294 is listed.**

### 3.1 App/brand & surface tokens (the proroom-specific palette)
```
--app-font-family: 'Open Sans', sans-serif
--app-link-color: #45a2ff
--font-family-sans-serif: "Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji"…
--font-family-monospace: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace
--ptr-website-link-color: #45a2ff
--rosterImg-border-radius: 50%
--avatar-gear-icon-padding: 3px 6px
--transparent-gray: rgba(255, 255, 255, 0.331)
```

### 3.2 Navbar / sidebar / tabs (top-nav + left sidebar chrome)
```
--navbar-bg: #0c2434            --navbar-color: #fff
--sidebar-wrapper-bg-color: #103d5c   --sidebar-wrapper-color: #fff
--sidebar-menu-bg: #103d5c      --sidebar-menu-color: #fff
--sidebar-menu-active-color: #45a2ff  --sidebar-navItem-border-color: #fff
--tabs-color: #fff              --tabs-border-color: #0a6db1
--tab-active-bg: #45a2ff        --tabs-dropdown-bg: #0f2e43   --tabs-dropdown-color: #45a2ff
--archives-dropdown-menu-bg-color: #0e3651   --archives-dropdown-menu-color: #45a2ff
--session-control-dropdown-bg: #0e3651
--dropdown-divider-bg: #45a2ff
--split-gutter-bg: #0a6db1      --split-gutter-color: #fff
```

### 3.3 Presenter / notes / files / chat-composer / msgs / users tokens
```
--presenter-area-bg: #0f2e43    --presenter-noRecording-color: #fff   --presenter-recording-color: #45a2ff
--notes-tabs-bg: #0c2434        --note-tabs-color: #fff
--note-text-bg: #fff           --note-text-color: #676767
--note-options-bg: #f4f4f4     --note-options-color: #fff   --note-options-hover-color: #212529
--note-delete-bg: #bb352a      --note-download-bg: #92d528  --note-next-bg: #45a2ff
--file-list-even-bg: #f4f4f4   --file-list-odd-bg: #fff     --file-name-color: #0a6db1
--file-delete-bg: #bb352a      --file-download-bg: #92d528  --file-see-more-bg: #45a2ff
--file-size-color: #b2b2b2     --file-searchbar-bg: #fff    --file-searchbar-color: #b7b7b7
--file-searchbar-icon-color: #666666
--search-icon-bg-color: #45a2ff   --search-icon-color: #f4f4f4
--reload-icon-bg-color: #f4f4f4   --reload-icon-color: #45a2ff
--textarea-bg: #111            --textarea-holder-border-color: #0a6db1
--textarea-holder-btns-color: #676767   --textarea-holder-btns-hover-color: #0a6db1
--checkbox-bg-color: #45a2ff
--msgs-header-bg: #0a6db1      --msgs-header-color: #fff
--msgs-separator-bg: #45a2ff   --msgs-separator-border-color: #45a2ff   --msgs-separator-color: #fff
--nickname-color: #0a6db1      --name-color: #c0d8ed
--users-color: #fff            --users-border-color: #fff
--users-badge-bg-color: #0e3651   --users-badge-color: #f4f4f4
--mobileApp-info-bg-color: transparent   --mobileApp-info-color: #f4f4f4
```

### 3.4 Modal tokens (NAVY modal system — governs every dialog in §5)
```
--modal-content-bg-color: #103d5c     --modal-content-border-color: #103d5c   --modal-content-color: #f4f4f4
--modal-active-tab-bg-color: #45a2ff  --modal-active-tab-border-color: #45a2ff  --modal-active-tab-color: #fff
--modal-tabs-border-color: #45a2ff
--modal-btn-close-bg: #0a6db1         --modal-btn-close-border: #0a6db1
--modal-btn-danger-bg: #bb352a        --modal-btn-danger-border: #bb352a
--modal-btn-success-bg: #92d528       --modal-btn-success-border: #92d528
--modal-btn-hover-opacity: 0.9
--modal-input-group-bg: #0a6db1       --modal-upload-files-color: #0a6db1     --modal-alert-link-color: #0a6db1
```
> Rendered confirmation (§5): `.modal-content` computes to `rgb(16, 61, 92)` = **#103d5c**, color `rgb(244,244,244)` = **#f4f4f4**, radius **8px**; header/footer border color `rgb(69,162,255)` = **#45a2ff**.

### 3.5 Dark/Light theme swatch tokens (per-surface, both themes)
```
LIGHT: --lightTheme-chat-bg:#eee  --lightTheme-msgs-bg:#fff  --lightTheme-msgs-bg-adm:#f4f4f4
  --lightTheme-msg-bg:#fff  --lightTheme-msg-color:#676767  --lightTheme-msg-border-color:#e1e1e1
  --lightTheme-nickname-color:#676767  --lightTheme-username-color:#0a6db1  --lightTheme-date-color:#a8a8a8
  --lightTheme-roster-bg:#f1f1f1  --lightTheme-roster-bg-adm:#e1e1e1
  --lightTheme-sidebar-wrapper-bg-color:#fff  --lightTheme-sidebar-wrapper-color:#676767
  --lightTheme-textarea-bg:#fff  --lightTheme-textarea-color:#676767
  --lightTheme-msgs-separator-bg:#e8e8e8  --lightTheme-msgs-separator-color:#373c42  --lightTheme-msgs-separator-border-color:#373c42
  --lightTheme-user-location-color:#676767  --lightTheme-mobileApp-info-color:#676767
DARK: --darkTheme-chat-bg:#000  --darkTheme-msgs-bg:#143c57  --darkTheme-msgs-bg-adm:#0f2e43
  --darkTheme-msg-bg:#000  --darkTheme-msg-color:#fff  --darkTheme-msg-border-color:#f4f4f4
  --darkTheme-nickname-color:#c0d8ed  --darkTheme-username-color:#0a6db1  --darkTheme-date-color:#a8a8a8
  --darkTheme-roster-bg:#111  --darkTheme-roster-bg-adm:#000
  --darkTheme-sidebar-wrapper-bg-color:#000  --darkTheme-sidebar-wrapper-color:#f4f4f4
  --darkTheme-textarea-bg:#0c2434  --darkTheme-textarea-color:#f4f4f4
  --darkTheme-msgs-separator-bg:#222  --darkTheme-msgs-separator-color:#aaa  --darkTheme-msgs-separator-border-color:#373c42
  --darkTheme-user-location-color:#f4f4f4  --darkTheme-mobileApp-info-color:#f4f4f4
```
> This capture is rendered in **Light theme** (`#topRoomDiv class="lightTheme"`, index 3).

### 3.6 Named base colors (theme palette)
```
--blue:#375a7f  --indigo:#6610f2  --purple:#6f42c1  --pink:#e83e8c  --red:#f00  --orange:#fd7e14
--yellow:#ff0  --green:#00bc8c  --teal:#20c997  --cyan:#3498DB  --white:#fff  --gray:#bbb
--gray-dark:#303030  --primary:#375a7f  --secondary:#444  --success:#00bc8c  --info:#3498DB
--warning:#F39C12  --danger:#E74C3C  --light:#303030  --dark:#adb5bd  --brown:#555  --dark-brown:#4b4b4b
--light-brown:#8c8686  --black:#000  --dark-black:#222  --darker-black:#111  --darkest? (see below)
--light-black:#373c42  --lighter-black:#3e444a  --darker-gray:#aaa6a6  --dark-gray:#aaa  --darker-gray:#aaa6a6
--light-gray:#ccc  --lighter-gray:#eee  --light-blue:#40e0d0  --lighter-blue:#edf2f6  --light-green:#1edd6e
--fire-yellow:#f7fd37
```

### 3.7 Bootstrap 5 tokens (`--bs-*`, ~150 vars — the full Bootstrap 5.3 default set is present)
Notable non-default overrides / key values:
```
--bs-body-bg:#fff  --bs-body-color:#212529  --bs-body-font-size:1rem  --bs-body-font-weight:400  --bs-body-line-height:1.5
--bs-body-font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans",…
--bs-primary:#0d6efd  --bs-secondary:#6c757d  --bs-success:#198754  --bs-info:#0dcaf0  --bs-warning:#ffc107
--bs-danger:#dc3545  --bs-light:#f8f9fa  --bs-dark:#212529
--bs-blue:#0d6efd  --bs-indigo:#6610f2  --bs-purple:#6f42c1  --bs-pink:#d63384  --bs-red:#dc3545
--bs-orange:#fd7e14  --bs-yellow:#ffc107  --bs-green:#198754  --bs-teal:#20c997  --bs-cyan:#0dcaf0
--bs-gray-100:#f8f9fa … --bs-gray-900:#212529 (full ramp)
--bs-border-radius:.375rem  --bs-border-radius-sm:.25rem  --bs-border-radius-lg:.5rem  --bs-border-radius-xl:1rem  --bs-border-radius-2xl:2rem  --bs-border-radius-pill:50rem
--bs-border-color:#dee2e6  --bs-border-width:1px  --bs-border-style:solid  --bs-border-color-translucent:rgba(0,0,0,.175)
--bs-box-shadow:0 .5rem 1rem rgba(0,0,0,.15)  --bs-box-shadow-sm/-lg/-inset present
--bs-link-color:#0d6efd  --bs-link-hover-color:#0a58ca  --bs-link-decoration:underline
--bs-focus-ring-color:rgba(13,110,253,.25)  --bs-focus-ring-width:.25rem
--bs-code-color:#d63384  --bs-highlight-bg:#fff3cd
--bs-breakpoint-sm:576px  -md:768px  -lg:992px  -xl:1200px  -xxl:1400px  (also non-bs --breakpoint-* mirror)
+ all --bs-*-bg-subtle / -border-subtle / -text-emphasis / -rgb variants for every semantic color.
```
> The `--bs-*` tokens are stock Bootstrap; the **proroom-specific** design tokens are §3.1–3.5.

---

## 3.4b Fonts  (`$.fonts`)
- **Loaded** (`$.fonts.loaded`): `Font Awesome 5 Free | 400 | loaded`, `Font Awesome 5 Free | 900 | loaded`
  (both loaded); `Font Awesome 5 Brands | unloaded`; `Lato 400/400italic/700 | unloaded`; `summernote 400 | unloaded`.
  → **Body text renders in `'Open Sans', sans-serif`** (see palette §3.5b — Lato is declared but unloaded, so
  the actual rendered `font-family` for 23,179 nodes is `"Open Sans", sans-serif`).
- **@font-face rules** (`$.fonts.fontFaceRules`): FA Brands/Free-regular/Free-solid (from `../webfonts/…`),
  and `summernote` (`summernote.a838752e64c7ba6a.woff2`).
- **fontFileUrls** (12): `…/webfonts/fa-{brands-400,regular-400,solid-900}.{woff2,woff,ttf}` +
  `…/summernote.*.{woff2,woff,ttf}`, all on `chat.protradingroom.com`.

## 3.5b palette histograms  (`$.palette` — 18 keys, aggregate style-value counts)
Top values (value → node count) — these prove the dominant tokens by frequency:
- **color** (`$.palette.color`): `rgb(33,37,41)`=19752 · `rgb(204,204,204)`=1451 · **`rgb(69,162,255)`=863** ·
  `rgb(244,244,244)`=406 · `rgb(103,103,103)`=315 · `rgb(255,255,255)`=241 · `rgb(0,0,0)`=164 ·
  `rgb(10,109,177)`=158 · `rgb(0,128,64)`=119 · `rgb(26,26,26)`=110 · … (32 distinct).
- **backgroundColor** (`$.palette.backgroundColor`): `rgb(255,255,255)`=2292 · **`rgb(14,54,81)`=101** (#0e3651 dropdown navy) ·
  `rgb(108,117,125)`=66 · `rgb(69,162,255)`=29 · `rgb(232,232,232)`=28 · **`rgb(16,61,92)`=23** (#103d5c modal navy) ·
  `rgb(215,215,215)`=21 · `rgb(10,109,177)`=16 · `rgb(146,213,40)`=10 (#92d528 success) · `rgb(12,36,52)`=7 (#0c2434 navbar) · … (30 distinct).
- **borderColor**: `rgb(33,37,41)`=17549 · `rgb(222,226,230)`=2210 · `rgb(204,204,204)`=1330 · `rgb(69,162,255)`=915 · …
- **fontFamily**: **`"Open Sans", sans-serif`=23179** · `"Font Awesome 5 Free"`=496 · `Arial, sans-serif`=88 · `sans-serif`=52.
- **fontSize**: **`16px`=22796** · `14px`=243 · `12px`=200 · `13px`=161 · `20px`=147 · `10px`=116 · `18px`=31 · `28px`=18 · `32px`=15 · `24px`=9 · `36px`=8 · `9px`=5 · `15.2px`=5 · `19px`=4 · `21px`=1.
- **fontWeight**: **`300`=14034** · `700`=6644 · `100`=1552 · `400`=817 · `900`=546 · `600`=205 · `500`=49.
- **lineHeight**: `24px`=22374 (dominant) · `16px`=389 · `21px`=218 · `19.5px`=161 · `18px`=133 · `30px`=116 · …
- **fontStyle**: `italic`=4355 (only value — from FA/summernote pseudo usage). **textTransform**: `uppercase`=44 (only).
- **borderRadius**: `6px`=221 · `4px`=76 · `50%`=34 (avatars) · `8px`=24 (modals/composer) · `7px`=23 · `3px`=6 · `12px`=4 (webrtc status cards) · `800px`=3.
- **zIndex**: `1000`=140 (dropdowns) · `1055`=20 (modals) · `90`=8 · `1054`=2 · `1030`=1 (top navbar) · `999999`=1 · `10000`=1.
- **opacity**: `1`=23782 · `0`=35 · `0.5`=22 · `0.25`=7 (hr dividers) · `0.7`=1.
- **boxShadow**: `rgba(0,0,0,0) 0px 0px 0px 9999px inset`=5 · `rgba(0,0,0,0.5) 0px 4px 20px 0px`=1.
- **gap**: `8px`=3, `6px`=1. **borderTopWidth**: `1px`=351, `2px`=1.
- Spacing histograms present: `marginTop`, `paddingTop` (`8px`=2361 · `4px`=490), `paddingLeft` (`16px`=2603 · `5px`=121 · `4px`=106 · `8px`=104 · `12px`=86).

---

## 4. Element inventory — by surface

> Format per element: `path… | #id | .class | [x,y WxH] | text | attrs`, then load-bearing computed styles.
> Rects are viewport-relative; **negative x means off-canvas** (sidebar hidden, message scroll-buffer).
> FA glyph `::before content` given as the Unicode codepoint where captured.

### 4.0 Root & app shell
- `<html lang=en>` [0,0 2041×1265] bg `#fff`; `<body cz-shortcut-listen>` [0,0 2041×1265] bg `#fff` color `rgb(33,37,41)` font `"Open Sans",sans-serif` 16px/300 lh24. (`$.elements[0..1]`)
- `<app-root ng-version=17.3.12>` (index 2); `<app-room id="topRoomDiv" class="lightTheme">` (index 3) — **theme class lives here**; the `.wrapper` toggles `.push-wrapper` when the sidebar opens (seen in `sidebar:*` state rootPaths).
- Layout container: `div.d-flex.flex-column-reverse.flex-sm-row.room-container` → `div.room-sidebar` (off-canvas) + `nav.mainAppNav` (top) + `#mainAreaSplit`.

### 4.1 Top navbar  (`nav.navbar.navbar-expand-md.navbar-dark.fixed-top.mainAppNav`, index 58)
- **[0,0 2041×49]**, `position:fixed`, `z-index:1030`, **bg `rgb(12,36,52)` = #0c2434** (`--navbar-bg`), color `#fff`, align-items center. (`$.elements[58]`)
- `span.fas.fa-mobile.mobile-info-app-btn` [70,17 10×16] title `Launch in Mobile App` → opens `#mobileAppInfoModal`; bg none, color #fff, FA-900. (index 63)
- `a.navbar-brand.ml-1.mr-auto` [88,5 200×40] holding `img#cssLogo.brand-logo` [88,17 200×18] `alt="App Logo"` `src=…/var/www/uploads/8cb6ad5c3757766914222382a24b9d2a`, max 200×40, object rendered 199.99×17.76. (index 64–65)
- `div#navbarsRoom.collapse.navbar-collapse` [288,1 1753×48] bg #0c2434, flex-grow 1. (index 66)
  - `ul.navbar-nav.align-items-center.ml-auto` [1766,1 275×48] (right cluster).
  - `a#dropdownVolume.nav-link.d-flex.align-items-center` [1938,1 40×48], `data-bs-toggle=dropdown`, icon `fas fa-2x fa-volume-up`, color `rgb(171,176,181)`. → Volume dropdown (§5 `dropdown:3`).

### 4.2 Left sidebar  (`div.sidebar-wrapper` → `nav.navbar.w-100.h-100`, indices 6–57)
> **Sidebar is CLOSED in this capture**: `div.sidebar-wrapper` [x=-250, 250×1216], `position:absolute`,
> `margin-left:-250px`, `z-index:3`, **bg `#fff`** (lightTheme), color `rgb(103,103,103)` = #676767. (index 6)
> When open it slides to x=0 (see `sidebar:*` states, `.push-wrapper`).

`ul.navbar-nav.small` (flex column, overflow-y auto). Nav items top→bottom, each `li.nav-item` with a
1px bottom border (rendered white here), 14px/700 labels, `rgb(103,103,103)` text, FA icons 14px/900:

| # | Item | Icon (FA ::before) | Action | index |
|---|---|---|---|---|
| 1 | header block: `Powered by:` / `ProTradingRoom.com` (link `#45a2ff`, href protradingroom.com) / `Version: v4.0.1-b422b517` / **`Mobile App Info`** btn (`.btn-secondary` #6c757d) → `#mobileAppInfoModal` | — | — | 10–14 |
| 1b | status line: `Chat ✓` + `Media ✓` (fa-check glyphs `\f00c`) | fa-check | — | 16–20 |
| 2 | **`Connectivity Check`** | fa-network-wired `\f6ff` | → `#webrtc-troubleshooter-modal` | 21–24 |
| 3 | **`General Settings`** | fa-cogs `\f085` | → `#user-settings-modal` | 25–28 |
| 4 | **`Archives`** (dropdown-toggle, `#archivesDropdown`) | fa-archive `\f187` | dropdown (§5 `dropdown:1`/`archives-open`) | 29–32 |
| 5 | **`Manage Muted Users`** | fa-comments | → `#mutedUsersModal` | 33–36 |
| 6 | **`Manage Followed Users`** | fa-users | → `#followedUsersModal` | 37–40 |
| 7 | **`Users:`** row + roster (`li.nav-item.d-flex.flex-column.h-100`, [x=-250,412 250×853]) | fa-user | — | 41–57 |

Roster header row (`a.nav-link.active-room-users`, index 42) has right-aligned button cluster
`div.flex-fill.users-btns` (index 46) — **admin roster controls**:
- `button.btn-dark.dropdown-toggle` `#user-options-btn` [x=-33,417 26×27] bg `rgb(33,37,41)`, icon `fas fa fa-cog` → roster-cog dropdown ("Sort by Trials", §5 `dropdown:2`). (index 47)
- `button.reload-room-users` title `Reload Users` [x=-63 26×27] bg `#f4f4f4`, icon fa-sync color `#45a2ff`. (index 49)
- `button.btn-secondary` title `Sort Users` [x=-91 24×27] bg `#6c757d`, icon fa-sort-alpha-down. (index 51)
- `button.search-room-users` title `Search Users` [x=-121 26×27] bg **`rgb(69,162,255)`=#45a2ff**, icon fa-search color `#f4f4f4`. (index 53)

`app-room-roster > div.room-roster-list` [x=-248,452 246×807] (index 56–57) — **empty container in
this capture (roster rows NOT rendered off-canvas); roster row structure only visible via `kebab:open`
state, see §5 and honest gap §8.**

### 4.3 Main split layout  (`as-split#mainAreaSplit`, indices 76–2187)
- `as-split#mainAreaSplit.as-horizontal.as-percent` [0,49 2041×1216], flex, overflow hidden. `minsize=0`, `dir=ltr`. (index 76)
  - **LEFT** `as-split-area.alert-chat-box.alert-chat-regular` [0,49 **543**×1216], `flex-basis:calc(26.7319% - 2.94px)`, overflow-y auto. (index 77)
    - inner **vertical** `as-split.as-vertical` → `as-split-area.alert-box` [0,49 543×**362**], `flex-basis:calc(30% - 3.3px)` (index 79) **+** row gutter (11px, bg `rgb(10,109,177)`, cursor row-resize, `aria-valuenow=30`, index 2107) **+** `as-split-area.chat-box` [0,422 543×**844**], `flex-basis:calc(70% - 7.7px)`, order 2 (index 1054).
  - **col gutter** `div.as-split-gutter` [543,49 **11**×1216], bg `rgb(10,109,177)`=#0a6db1, cursor col-resize, `aria-valuenow≈26.73` (`aria-valuetext="27 percent"`), bg-image = 11×30 dotted PNG data-URI. (index 2186–2187)
  - **RIGHT** `as-split-area.presentation-box` [554,49 **1487**×1216], `flex-basis:calc(73.2681% - 8.06px)`, **bg `rgb(15,46,67)` = #0f2e43** (`--presenter-area-bg`), order 2. (index 2109)

### 4.4 Right stage — presentation area  (`app-presentationarea`, indices 2118–2178)
- `div.mainPresentationAreaHolder` [554,49 1487×1216] (index 2119).
- **`ul#mainTabs.nav.nav-tabs.mainTabset`** [554,49 1487×40.5], flex, justify-center, 1px bottom border transparent. (index 2120) — **3 tabs** (from `$.states['tab:Screens'].groups[2]`, count 25):
  - **`Screens`** (`a#screens-tab`, `data-bs-target=#screens`, icon fa-desktop, `span.ml-1`=`Screens`) — active in default page; **bg `#45a2ff` when active**.
  - **`Notes`** (`a#notes-tab.presAreaTabs-notes.active`, `data-bs-target=#notes`, `i#noteChangeIndicator.fas.fa-edit`, `span.mx-1`=`Notes`) [1270,54 71×37] — **active tab-pane in this capture**; when active: z-index 10, bg `rgb(12,36,52)`=#0c2434, border-top `#0a6db1`, radius-top 3px, color #fff. (index 2128)
  - **`Files`** (`a.nav-link`, `data-bs-target=#files`, icon fa-folder, `span.mx-1`=`Files`).
  - (`Streams` exists as a state key/sub-tab but is **not** a top-level mainTab here.)
- `a#screens-tab` inactive style [1181,54 79×31]: 12px/300, radius-top 6px, transparent border/bg, color `rgb(204,204,204)`. (index 2122)
- **Screens content** (`div#screens.tab-pane.active.show`): `h3.text-center.mt-4` **`No one is presenting right now...`** + empty `ul#screenTabs` + `div#screensTabsContent`. (`$.states['tab:Screens'].groups[1]`)
- `div#mainTabsContent.tab-content` [554,90 1487×1216] (index 2139).

### 4.5 Notes stage  (`div#notes.tab-pane.show.active`, indices 2140–2178)
- `ul#notesTabs.nav.nav-tabs.noteTabset` [554,90 1487×41], flex justify-center, **bg `rgb(12,36,52)`=#0c2434** (`--notes-tabs-bg`), border-top `#0a6db1`. (index 2141)
- **6 note tabs** (`li.nav-item` → `a#{id}-tab` → `a.editName.mx-1` label), active tab bg **`#45a2ff`**, color #fff, radius-top 3px; inactive transparent color `rgb(204,204,204)`:

| Note tab id | Label (`a.editName`) | icon | index |
|---|---|---|---|
| `652765a0e494735aa53574ba` | **`Welcome`** (has `badge badge-success` `#00bc8c` "Welcome Mat" tooltip) — **active in default page** | fa-home | 2143 |
| `665874b2692d34204762bb73` | **`JC's Daily Briefing`** | fa-pen | 2150 |
| `68385e5f7568b13c34072e13` | **`Henry's Workflowy Notes`** | fa-pen | 2155 |
| `6879121b8f9c6824f6f03266` | **`Sam's Mag 7 index`** | fa-pen | 2160 |
| `68ac8cdb207a2a2927a27775` | **`1on1 Coaching/ Prop Firm & Tool Discounts codes.`** | fa-pen | 2165 |
| `6953c35f88f24e0dd42a1218` | **`Taylor's Scorecard Rankings (6/26 CLOSE)`** | fa-pen | 2170 |

- `div#notesTabsContent.tab-content` [554,131 1487×1216] (index 2174).
- `div#summernoteEdit-652765a0e494735aa53574ba.note-view` [569,146 1457×1135], flex-column, color `#676767`. (index 2178)
- **Note body contents** (real data, `$.states['note:*'].groups[1]`):
  - *Welcome*: image `…_2026_Q3_HG_Butterfly_Web2_Welcome_Mat_1050X461_V1_…png` + link `simplertrading.com/0dte-income` + `button.noteDownload` "Download".
  - *JC's Daily Briefing*: `p` "All times quoted are CENTRAL TIME.", `b` "FOR ADDITIONAL NOTES", `a` "CLICK HERE" → Google Doc, embedded Google-Docs spans, trade log text (AMLP squeeze entries with dated `BOT +1 AMLP … CALL @3.20`), screenshot image.
  - *Taylor's Scorecard*: `b` "SCORECARD RANKINGS: 6/26", image `…_JUNE_29_…png`, Download button.
  - (Henry's Workflowy / Sam's Mag 7 present as tabs; bodies are summernote HTML with `workflowy.com` link per `inventory.links`.)

### 4.6 Left LEFT-column: Alerts panel  (`app-alerts`, alert-box, indices 83–1053)
- Header `nav.chat-nav.alertHeader` [0,49 543×48], **bg `rgb(10,109,177)`=#0a6db1** (`--msgs-header-bg`), color #fff. (index 83)
  - `a.navbar-brand` **`Alerts`** + `i.fas.fa-bell` (index 84–85); right cluster: **Search** icon (`fas fa-search`, title Search, index 88) + **Settings** gear (`fas fa-cog chat-header-gear`, title Settings, index 91).
- `app-roomscroller#chatScrollViewParentAlerts` [scroll buffer] holds **`app-st-message` × 100** (alert cards; see §4.8).

### 4.7 Left LEFT-column: Chat panel  (`app-chat.chat-box`, indices 1054–2106)
- Header `nav.chat-nav.chatHeader` [0,422 543×48], **bg `#0a6db1`**, color #fff, `a.navbar-brand` icon `fas fa-comment`. (index 1058–1060)
- **Chat channel tabs** (`ul.nav.nav-tabs.flex-wrap.flex-grow-1`):
  - `a.nav-link.active` **`Main Chat`** [183,429 69×33] **bg `rgb(69,162,255)`=#45a2ff**, color #fff, 12px/700, radius-top 6px, cursor default. (index 1063)
  - `a.nav-link` **`Off Topic`** [257,429 64×33] transparent bg, color #fff. (index 1065)
  - Right cluster: **Search** (`a.nav-link.p-0` fas fa-search, title Search, index 1068) + **Settings** dropdown (`fas fa-cog chat-header-gear`, title Settings, index 1071).

### 4.8 Message / alert card  (`app-st-message` × 100 — ONE decoded fully; repetition below)
> Decoded first card fully (`$.elements[95..114]`, an **alert/trade** card). All 100 share this skeleton;
> deltas are avatar src, username, timestamp, body text, and the optional QA/reaction chrome.
- `app-st-message` → `div.msg-box.pb-1` [543×224] **bg `rgb(232,232,232)`=#e8e8e8** (alt separator), border-top 1px `rgb(225,225,225)`=#e1e1e1, font-weight 100. (index 96)
- Avatar: `div.avatar.pl-1` → `img` 35×35 `alt="msg.avt"` `src=secure.gravatar.com/avatar/…?d=mm&s=50`. (index 101–102)
- Header row `div.d-flex.justify-content-between`:
  - `strong.username.mx-1` **`JC`** 14px/900, color `rgb(232,232,232)` with **`filter:invert(1)`** (renders dark on light). (index 106)
  - `button.btn-sm.btn-secondary.alert-qa` title `Ask a question` [51×19] bg `#6c757d`, 10px/400 — contains `span.me-1` `(2)`, `i.fas.fa-question-circle`, `span` `✅`. **QA-count buttons observed: `(2)✅`,`(8)✅`,`(1)✅`,`(5)✅`** (`$.inventory.buttons`). (index 108–111)
  - `span.created-at.mr-2` **`7/17/26, 11:55 AM`** 12px/600, color `rgb(232,232,232)` + `filter:invert(1)`. (index 112)
- Body `div.msg-left.text-formated.preText.ml-2.mr-2.p-0` [465×195], **13px/100, lh19.5, color `rgb(26,26,26)`, `white-space:pre-wrap`, text-align left** — the trade text, e.g.:
  `"SPXW\nAction: OPEN\nOrder Type: VERTICAL | NET_DEBIT\nOrder Legs:\nBTO S & P 500 INDEX 07/17/2026 $7500…"`. (index 114)
- **Ticker spans** `span.tradeColor` (×18, `$.elements` ids `id_…`): color `rgb(0,128,64)` green trade lines, e.g.
  `"BUY +10 VERTICAL SPX 100 (Weeklys) 17 JUL 26 7500/7515 CALL @4.10 LMT"`, `"SELL -10 VERTICAL SPX … @2.80 LMT"`.
- **Kebab menu** per card: `a#dropdownMenuLink.msgMenu.dropright.pt-1` glyph `⠇` (`⠇`), 19×34 — **×~120 in DOM**; opens the message user menu (§5 `dropdown:7/8`).
- All 100 message cards are positioned at **negative y (-8472 … 1140)** = virtualized scroll buffer above the fold.

### 4.9 Chat composer  (`div#textAreaHolder`, indices 2096–2106)
- `div#textAreaHolder.d-flex.align-items-center.textSendDiv` [5,1215 533×45], **bg #fff, radius 8px**, padding 5px, margin 5px. (index 2096)
- `textarea#textAreaTxt.txt-area.form-control.border-0` [10,1220 442×35], **`placeholder="Type your message here.."`** (two dots — verbatim), `rows=1`, `spellcheck=true`, min-h 35px, max-h 300px, 14px/400, color `#676767`, bg #fff, white-space pre-wrap, cursor text. (index 2099)
- Button col `div.textAreaBtnsCol` [452,1220 81×35] (right), each `span.textAreaBtns` 26×34, color `#676767`:
  - **Emoji** `i.far.fa-smile` [16px/400] `ngbtooltip="Add Emojis"`, popover attrs `placement=auto container=body autoclose=outside popoverclass=popOverDiv`. (index 2101–2102)
  - **Image** `i.fas.fa-image` [16px/900] `ngbtooltip="Upload an Image"`. (index 2103–2104)
  - **GIF** `span` text `GIF` [12px/300] `ngbtooltip="Search for GIFs"`, `triggers=manual`. (index 2105–2106)

### 4.10 Floating webcams & assets  (`#webcamsHolder-`, indices 2110–2117)
- **Two** `div#webcamsHolder-.card.webcamsHolder` [1302,1270 **320×240**], `position:absolute`, `z-index:105`,
  **bg `rgb(0,0,0)`**, **border 1px `rgb(154,205,50)` = #9acd32** (yellow-green), radius 6px, `cursor:move` (draggable),
  flex-column. (index 2110, 2114)
  - `video#webcamVideo-.webcamsHolderVideo` [318×238], `autoplay`, `object-fit:contain`. (index 2111, 2115)
  - `span.closeIcon > i.fas.fa-times` (white, 20px/900) top-right. (index 2112–2113, 2116–2117)
- **assets** (`$.assets`): `images` 89 (`…/var/www/uploads/…` logo, gravatar avatars `?d=mm&s=50`, `cdn1.protradingroom.com/uploads/images/…`); `backgroundImages` 8 (SVG data-URIs for hamburger/check icons + split-gutter dotted PNGs); `inlineSvgs` 0.

---

## 5. States — full decode  (`$.states`, 27 snapshots)

> Each state = `{groups:[…]}`. Groups 0–2 (`app-presentationarea`=438, `.presentation-box`=455,
> `#mainTabs`=25) are the **shared page context** repeated in every state (decoded once in §4.4–4.5).
> The **unique** payload is the last group (`.dropdown-menu.show` or `.modal.show`), decoded below.
> Every rendered color/size cited is from that group's node styles.

### 5.1 Sidebar Archives dropdown  (`dropdown:1` / `sidebar:archives-open`, `.dropdown-menu.users-dropdown-options.show`)
[246×103] **bg `rgb(14,54,81)` = #0e3651** (`--archives-dropdown-menu-bg-color`), color **`#45a2ff`**, z-index 1000, radius 6px. `aria-labelledby=archivesDropdown`. Items (`a.dropdown-item.small`, 14px, `.pl-2` label):
| Item | icon | opens |
|---|---|---|
| **`Alert Logs`** | fa-bell | `#alerts-logs-modal` (admin) |
| **`Chat Logs`** | fa-comment | `#chat-logs-modal` (admin) |
| **`Transcript History`** | fa-closed-captioning | (no modal target captured) |

### 5.2 Roster-cog user-options dropdown  (`dropdown:2` / `sidebar:roster-cog-open`, `ul.dropdown-menu.show`)
[228×38] bg `#fff`, color `rgb(33,37,41)`, z-index 1000, radius 6px, 1px border `rgba(0,0,0,.176)`.
`aria-labelledby=user-options-btn`. One item: `li.dropdown-item` `span`=**`Sort by Trials`** (14px/400).

### 5.3 Volume control dropdown  (`dropdown:3`, `.dropdown-menu.volumeControl.show`)
[1771,1 160×334] **bg `rgb(17,17,17)` = #111** (`--textarea-bg` reuse), color `rgb(204,204,204)`, z-index 1000, radius 6px, text-center. `aria-labelledby=dropdownVolume`.
- `h4` **`Volume`** (24px/500) + close `span.float-right > i.fas.fa-times`.
- `input[type=range]` `audiovolslider min=0 max=100 title=Volume` [129×32].
- `button.btn.btn-primary.btn-sm` **`Mute`** [49×31] bg `rgb(13,110,253)` title `Mute Audio`.
- `hr` (opacity .25) + `div.dropdown-divider` (border-top `#45a2ff`).
- `div.room-sound-options` — **6 checkboxes** (`input.form-check-input[type=checkbox]`, bg `#0d6efd` when on), each with `label.form-check-label` + trailing `span`=`on`:
  - `#alert-donot-disturb` **`Alert sound`** · `#qa-donot-disturb` **`QA sound`** · `#non-trade-donot-disturb` **`NTA sound`** · `#chat-donot-disturb` **`Chat sound`** · `#presentation-subtitles` **`Subtitles`** (+ fa-closed-captioning, title "Show Speech Recognition Overlay") · `#app-donot-disturb` **`Don't Disturb`** (bg #fff = off).

### 5.4 Message user menu  (`dropdown:7`, `dropdown:8`, `kebab:open`, `.dropdown-menu.users-dropdown-options.show`)
[160–168 × 80–112] **bg `#0e3651`**, color **`#45a2ff`**, z-index 1000, radius 6px. `aria-labelledby=dropdownMenuLink`.
- From a **message** kebab (`dropdown:7/8`): `User Info` (fa-user) · `Mention` (fa-reply) · `Copy` (fa-copy).
- From a **roster** row (`kebab:open`, rooted in `app-room-roster > … presUser > media`): `User Info` (fa-user) · `Mention / Reply` (fa-reply) [+ more items truncated at count 5].
- **`inventory.menus` also lists a 4-item variant**: `User Info, Mention, Reply, **Add Reaction**` — the fuller message menu (not all rendered in captured states).

### 5.5 Admin modal — Alerts Logs  (`modal:alerts-logs-modal`, `.modal.show` count 24) — **ADMIN-ONLY**
`div#alerts-logs-modal.modal.fade.show` [2041×1265] fixed z-index **1055**. `.modal-dialog` **[521,28 1000×357]** (wide). `.modal-content` bg **#103d5c** (`rgb(16,61,92)`), color **#f4f4f4**, radius 8px.
- Header (`.modal-header` border-bottom `#45a2ff`): `h5` **`Alerts Logs`** (20px/500) + `button.btn-close.btn-close-white`.
- Body: `button.btn.btn-primary.my-2` **`Reload Log List`** (bg #0a6db1) + `div.list-group` of `div.list-group-item.list-group-item-action` cards (bg #fff, color #212529, border `#dee2e6`), each: `strong.fw-bold`=date (e.g. **`Oct 22, 2023`**, `Oct 15, 2023`) + `strong` `By:` + `i` **`admin@protradingroom.com`**.
- Footer (`.modal-footer.text-center` border-top `#45a2ff`): `button.btn.btn-secondary` **`Close`** (bg #6c757d).

### 5.6 Admin modal — Chat Logs  (`modal:chat-logs-modal`, `.modal.show` count 500) — **ADMIN-ONLY**
Same navy shell. `h5` **`Chat Logs`** + **`Reload Log List`** button. Body = long `list-group` of dated
transcript entries (Jul 2026 back), each: `strong.fw-bold`=date (e.g. **`Jul 21, 2026`** … `Jul 13, 2026`)
+ `By:` **`admin@protradingroom.com`** + **`Channel:`** **`main`** or **`offTopic`**. (count 500 = ~30+ days × entries).

### 5.7 Admin modal — Muted Chat Users  (`modal:mutedUsersModal`, count 10) — **ADMIN/MOD**
`.modal-dialog` [771,28 500×192]. `h5#mutedUsersModalLabel` **`Muted Chat Users`** (20px/500).
Body `div.text-center` empty state **`You don't have any muted/ignored users.`**. Footer `button.btn.btn-primary` **`Close`** (bg #0a6db1). z-index 1055.

### 5.8 Admin modal — Followed Chat Users  (`modal:followedUsersModal`, count 10)
Same shell. `h5#followedUsersModalLabel` **`Followed Chat Users`**. Empty state **`You don't have any followed users.`**. Footer `button.btn.btn-light` **`Close`** (bg #f8f9fa, black text). z-index 1054.

### 5.9 Modal — Mobile App Info  (`modal:mobileAppInfoModal`, count 14)
`.modal-dialog` [771,28 500×268]. `h5#mobileAppInfoLabel` **`Download our mobile apps`**. Body:
`img.google-badge` (`/assets/images/google-play-badge.png`, 155×60) → Google Play
(`…id=com.bellesoft.stprotradingroom…`) + `img` (`/assets/images/iosAppStore.svg`, 120×40) → App Store
(`…id1278652736`). Footer `button.btn.btn-secondary` **`Close`**.

### 5.10 Modal — Connectivity/Mic Troubleshooter  (`modal:webrtc-troubleshooter-modal`, count 27)
`.modal-dialog` [751,28 540×590]. `h3.modal-title` **`Connectivity/Mic Troubleshooter`** (20px/700, color #fff).
Body: `p.text-muted.mb-4` **`This tool checks your network and connectivity to essential WebRTC servers.`**
(15.2px/500, color `rgb(229,231,235)`). **4 `div.status-item`** cards (bg `rgb(248,250,252)`, border `rgb(226,232,240)`, radius **12px**):
`UDP Enabled` · `TCP Enabled` · `STUN Server Connectivity` · `TURN Server Connectivity`; each with
`span.fw-medium` (15.2px/600 color `rgb(26,32,44)`) + `span.status-icon.pending` **`●`** (24px, color `rgb(100,116,139)` slate).
Footer: `button.btn.btn-primary` **`Start Test`** (fa-play, bg #0a6db1) · `button.btn.btn-success` **`Copy Results`** (fa-copy, **bg `rgb(146,213,40)` = #92d528**) · `button.btn.btn-secondary` **`Close`**.

### 5.11 Modal — General Settings  (`modal:user-settings-modal`, count 230)
`h5` **`General Settings`** (navy shell). **3 tabs** (`ul#userSettingsTab`): **`App Settings`** (active, bg #45a2ff) · **`Alert Settings`** · **`Chat Settings`**.
**App Settings tab** (`#user-app-settings`) form controls:
- **Choose Color Theme:** radios `#app-light-theme` **`Light Theme`** (on, bg #45a2ff) / `#app-dark-theme` **`Dark Theme`**.
- **Room Layout:** radios `roomLayoutOptions` = **`Chat and Alerts left`** (on) / **`…top`** / **`…right`** / **`…bottom`** + checkbox `#pm-window-layout` **`PM logs on the right`**.
- **Colors & Size:** color inputs `#chat-text-color` **`Text Color`**, `#chat-username-color` **`Username Color`**, `#chat-bg-color` **`Background Color`**, `#chat-ticker-color` **`Ticker Color`** + number `#chat-text-size` **`Text Size`** + `button.btn-outline-danger` **`Reset`** (color #dc3545) + `button.btn-outline-light` **`Save changes`**.
- **Do not disturb:** `#app-donot-disturb` **`Don't Disturb`**; toggles `#app-recording-start-sound` **`Start recording sound`**, `#app-recording-stop-sound` **`Stop recording sound`**, `#app-reactions-popup` **`Reactions Response`**, `#app-reactions-popup-qa` **`Reactions QA Response`** (each trailing `on`).
- **Disable/Enable Video:** `#app-disable-video` **`Video Enabled`**.
- **Show Closed Captions Overlay:** `#app-speech-reco-overlay` **`Enabled`**.
- `button.btn.btn-warning.btn-sm` **`Edit my Info and Avatar`** (bg `rgb(255,193,7)`=#ffc107) + footer `button.btn.btn-secondary` **`Close`**.
> **Alert Settings / Chat Settings** tab bodies exist (radios `alert-text-mode`, `chat-text-mode`, checkboxes `non-trade-alert`, `longer-alert-popup`, `alert-popup-donot-disturb`, `app-reactions-sound-qa` per `$.inventory.inputs`) but are inactive panes — not fully rendered (honest gap §8).

### 5.12 Modal — Reply / Private Reply  (`modal:replyModal`, count 20)
`.modal-dialog` [771,28 500×226]. `h5#replyLabel > span.do-private-reply`: `strong` **`ROM:`** (Reply-Original-Message, 15px/700) + quoted `div` with **actual quoted text** `@JC  Do you run your $PCALL on a 5day 5min chart  ?` (15px/500). Body: reply composer `textarea#textAreaReplyTxt` (**same placeholder `Type your message here..`**) + `span.textAreaBtns` Emoji (far fa-smile "Add Emojis") + Image (fas fa-image "Upload an Image"). Footer `button.btn.btn-secondary` **`Close`**.

---

## 6. Text content — exact strings (verbatim, with source)

**Room / brand:** `Mastering The Trade` (`$.meta.title`); brand logo `alt="App Logo"` (index 65);
`Powered by:` / `ProTradingRoom.com` / `Version: v4.0.1-b422b517` (sidebar, index 10/11/12).
**Main tabs:** `Screens` · `Notes` · `Files` (`$.states['tab:Screens'].groups[2]`). **Note tabs:** `Welcome` ·
`JC's Daily Briefing` · `Henry's Workflowy Notes` · `Sam's Mag 7 index` ·
`1on1 Coaching/ Prop Firm & Tool Discounts codes.` · `Taylor's Scorecard Rankings (6/26 CLOSE)`.
**Panel headers:** `Alerts` (index 84) · `Main Chat` (index 1063) · `Off Topic` (index 1065).
**Composer placeholder:** `Type your message here..` (**two dots**, `$.elements[2099].attrs.placeholder`).
**Sidebar items:** `Mobile App Info`, `Connectivity Check`, `General Settings`, `Archives`,
`Manage Muted Users`, `Manage Followed Users`, `Users:`.
**Screens empty:** `No one is presenting right now...` (`h3`, states).
**Modal titles:** `Muted Chat Users`, `Followed Chat Users`, `Download our mobile apps`,
`Connectivity/Mic Troubleshooter`, `General Settings`, `Alerts Logs`, `Chat Logs`.
**Empty states:** `You don't have any muted/ignored users.` · `You don't have any followed users.`
**Volume/settings labels:** `Volume`, `Mute`, `Alert sound`, `QA sound`, `NTA sound`, `Chat sound`,
`Subtitles`, `Don't Disturb`, `on`.
**Log lines:** `By: admin@protradingroom.com`, `Channel: main` / `Channel: offTopic`, dates `Jul 21, 2026`… / `Oct 22, 2023`.
**Reply quote:** `ROM:` + `@JC  Do you run your $PCALL on a 5day 5min chart  ?`.
**Button labels (`$.inventory.buttons`):** `Post Alert`, `Send Poll`, `Add Choice`, `Save To Canned`,
`Play For All`, `Filter out alerts`, `Change Devices`, `Rooms`, `--Select Traders--`, `--Select Rooms--`,
`Reload Log List`, `Done`, `Search`, `Start Test`, `Copy Results`, `Send`, `@Mention`, `Private Chat`,
`Follow`, `Test`, `Reset`, `Save changes`, `Edit my Info and Avatar`, `Refresh`, `Download`, `Save`, `Mute`.
**Trade tickers (`span.tradeColor`, real):** e.g. `BUY +10 VERTICAL SPX 100 (Weeklys) 17 JUL 26 7500/7515 CALL @4.10 LMT`,
`SELL -10 VERTICAL SPX 100 (Weeklys) 21 JUL 26 7505/7510 CALL @2.80 LMT`, `BUY +1 CALENDAR DASH … @4.60 LMT`.
> **No `bodyText` or `tables` top-level keys exist in this JSON** (text is carried in `elements[*].text`
> and the `states` node trees). No `"Conected"`/`"Connected"` typo string was found in this admin capture.

---

## 7. inventory  (`$.inventory`)

- **buttons** (250) — labels in §6; note admin/presenter labels `Post Alert`, `Send Poll`, `Session Control` chrome, `--Select Traders--`/`--Select Rooms--` (multi-room broadcast).
- **inputs** (74) — beyond §5: `text` `Search files...` and `text` `Paste YouTube URL` (**Files tab** search + YouTube embed), plus every settings control listed in §5.11 and volume checkboxes §5.3.
- **links** (39) — `ProTradingRoom.com`; `#nav-text`/`#nav-url`/`#nav-img` (**Post-Alert composer tabs**: Text Alert / Text Url / Image·GIF·Video); `#user-app-settings`/`#user-alert-settings`/`#user-chat-settings`/`#user-audio-video-settings`; many `simplertrading.com/*` promo replays; `workflowy.com/s/mtt-room-notes/…`; Google Doc/Drive/Forms; YouTube playlists; affiliate `apextraderfunding.com`, `tradeify.co`, `toponefutures.com`, `bookmap.com`; app-store links.
- **menus** (300) — dropdown label sets: `["Archives","Alert Logs","Chat Logs","Transcript History"]`,
  `["Sort by Trials"]`, `["Volume","Mute"]`, `["User Info","Mention","Copy"]`,
  `["User Info","Mention","Reply","Add Reaction"]`.
- **modalsInDom** (120 nodes → **11 distinct modal titles present in DOM**, `visible:false` unless opened):
  `Offline`, `Post Alert`, `Q&A for Alert:`, `Manage Scheduled Alerts`, `Session Control`, `Debug Log`,
  `Enter your poll question:` (Poll), `Download our mobile apps`, `Followed Chat Users`, `Muted Chat Users`, `:`.
- **dataAttributes** (13): `data-critters-container`, `data-bs-toggle`, `data-bs-target`, `data-bs-dismiss`,
  `data-bs-auto-close`, `data-filename`, `data-start`, `data-end`, `data-spread`, `data-keyboard`,
  `data-backdrop`, `data-darkreader-inline-{bgcolor,color}` (DarkReader ext residue — ignore).

---

## 8. What this file UNIQUELY evidences vs the other captures

This is the **only full-size ADMIN capture**. It uniquely provides:
1. **Admin dropdown → Archives** with **`Alert Logs` + `Chat Logs` + `Transcript History`** (`dropdown:1`/`sidebar:archives-open`), navy `#0e3651` / `#45a2ff`.
2. **`#alerts-logs-modal`** and **`#chat-logs-modal`** fully rendered (title, `Reload Log List`, dated
   `list-group` entries with `By: admin@protradingroom.com`, `Channel: main/offTopic`) — moderation/audit surfaces a member never sees.
3. **`Manage Muted Users` / `Manage Followed Users`** sidebar nav items + their modals (`#mutedUsersModal`, `#followedUsersModal`) with empty states.
4. Admin **roster-cog user-options** (`#user-options-btn` → `Sort by Trials`) and roster control cluster (Reload/Sort/Search Users).
5. Presence of admin/presenter modals in `modalsInDom` (`Post Alert`, `Send Poll`/`Enter your poll question:`, `Manage Scheduled Alerts`, `Session Control`, `Debug Log`) and admin buttons `--Select Traders--`/`--Select Rooms--` (multi-room broadcast), `Play For All`, `Filter out alerts`.
6. The **admin QA-count buttons** on alert cards (`(2)✅`,`(8)✅`,`(1)✅`,`(5)✅`).
7. The authoritative **294-token `:root`** set used as the live-room token source of truth.

---

## 9. Honest gaps (NOT captured / not rendered in this file)

- **Roster rows**: `app-room-roster > .room-roster-list` is an **empty container** (sidebar off-canvas). Individual
  roster user cards were not rendered; the only roster-row evidence is the `kebab:open` state root
  (`…presUser > media > media-body > nickName`) — the full row (avatar/badges/rank/presence) is a gap here.
- **Files tab body**: `#files` tab-pane has **no rendered rows** in any state (Notes tab was active). Files
  controls known only from `inventory` (`Search files...`, `Paste YouTube URL`, `Refresh`/`st-fileSeeMore`, file delete/download tokens §3.3).
- **Streams sub-tab content**: `tab:Streams` state exists but its group is identical shared context; no distinct stream tiles captured.
- **Post Alert / Poll / Session Control / Manage Scheduled Alerts / Debug Log / Offline modals**: present in
  `modalsInDom` (`visible:false`) but **never opened as states** — internal structure not captured.
- **Alert Settings / Chat Settings** tabs of `user-settings-modal`: inactive panes; only control *names* known via `inventory.inputs`.
- **Live video/screen-share**: `#webcamVideo-` and `#screensTabsContent` are empty (no one presenting: `No one is presenting right now...`).
- **Dark theme rendering**: only Light theme (`#topRoomDiv.lightTheme`) captured; dark values are the `--darkTheme-*` tokens (§3.5), not a rendered snapshot.
- **Reactions / emoji-mart / GIF / PM windows**: composer buttons exist (`Add Emojis`, `Search for GIFs`, `Private Chat`) but their popovers/panels were not open in captured states.
- **`dropdown:4/5/6`** state keys are absent (only 1,2,3,7,8 captured) — those interaction snapshots weren't taken.
