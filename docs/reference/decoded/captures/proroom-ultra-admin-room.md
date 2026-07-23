# Decoded capture — `proroom-ultra-admin-room` (ADMIN room family, 3 captures)

> Forensic decode of three ultra-dumps of the **admin** view of the live Pro Trading Room
> (room `652754202ad80b3e7c5131e2`, title "Mastering The Trade"). Every value below cites a
> locator inside the JSON (top-level key → path/index). This family is the authority for the
> live-room design tokens (`--tabs-color`, `--nickname-color`, `--chat-bg`, `--msgs-bg-adm`,
> `--darker-gray`, `--textarea-*`, `--app-link-color`, …). All 294 CSS variables are reproduced
> verbatim in §3.

Source files (do not re-open to build — everything needed is below):
- **PRIMARY** `evidence-folder/proroom-ultra-admin-room.json` — 15,201,102 bytes
- **STRONGER** `proroom-ultra-admin-room-stronger.json` — 13,227,947 bytes
- **CAPTURES** `docs/reference/captures/proroom-ultra-admin-room.json` — 9,186,618 bytes

---

## 1. Identity, metadata & relationships between the three

All three are the **same admin user, same room, same URL** — captured at **different browser
viewports / user-agents / moments**, so they are complementary scroll/hydration snapshots of one
room rather than three different states. Evidence (`meta` block of each):

| Field (`meta.*`) | PRIMARY | STRONGER | CAPTURES |
|---|---|---|---|
| `label` | `admin-room` | `admin-room` | `admin-room` |
| `url` | `https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1` | *(identical)* | *(identical)* |
| `title` | `Mastering The Trade` | `Mastering The Trade` | `Mastering The Trade` |
| `viewport.w × h` (`dpr` 2) | **1989 × 1166** | **1245 × 905** | **2027 × 1244** |
| `screen.w × h` | 1989 × 1166 | 1245 × 905 | **2560 × 1440** |
| `userAgent` | Android 15 / Pixel 9 / Chrome **149** Mobile | Android 15 / Pixel 9 / Chrome **150** Mobile | **macOS / Chrome 149 desktop** |
| `theme` | `{htmlClass:"", bodyClass:"", dataTheme:null}` | *(identical)* | *(identical)* |
| `tooNarrow` / `elementsCapped` | false / **false** | false / false | false / false |
| `errors` (top level) | `[]` (0) | `[]` (0) | `[]` (0) |

**Top-level element counts** (`elements` length; other diagnostic counts):

| Metric | PRIMARY | STRONGER | CAPTURES |
|---|---|---|---|
| `elements` (full uncapped tree) | **2639** | 2184 | 1177 |
| `app-st-message` rows | **124** | 100 | 50 |
| admin messages (`msg-box-adm`) | **18** | 20 | **0** |
| regular messages (`msg-box`) | 106 | 80 | 50 |
| `img` elements | 410 | 311 | 60 |
| distinct usernames rendered | **40** | 32 | 12 |
| `targeted` / `controls` | 50 / 230 | 48 / 206 | 48 / 156 |
| `stylesheets` | 43 | 41 | 41 |

**Relationships / which is superset:**
- **PRIMARY is the superset** — most elements (2639), most messages (124), most usernames (40),
  largest viewport (1989×1166 renders more of the wide layout), and 18 admin messages. **Use
  PRIMARY as the build authority.**
- **STRONGER** is a *narrower mobile viewport* (1245×905). It scrolled to a slightly different
  window: it has **20 admin messages** (2 more than PRIMARY) and uniquely renders authors **JC ×18**
  and **LornaBot ×21** heavily. Its message class is `msg-box pb-1` **without** the
  `ng-star-inserted` Angular flag (hydration-timing difference — same component, different capture
  moment). Use it only to backfill admin-author colors PRIMARY lacks.
- **CAPTURES** is the *smallest* (desktop, but a short scroll window of 50 messages) and contains
  **zero admin messages** (`msg-box-adm=0`) — it is a strict subset of the design surface, useful
  only as a corroborating third sample. Same class suffix as PRIMARY (`ng-star-inserted`).
- **All three share byte-identical `cssVariables` (294 root == 294 body vars, verified equal
  across all three files) and identical `head` links.** That is why this family is the token
  authority — the tokens are stable regardless of capture.

**`head` (identical across all three):**
- `head.stylesheetLinks` (3): `https://use.fontawesome.com/releases/v5.8.1/css/all.css` · `https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.2/animate.min.css` · `https://chat.protradingroom.com/styles.0d26360b9b3e223c.css`
- `head.fontLinks` (1): FontAwesome **v5.8.1** all.css
- `head.metas.viewport`: `width=device-width, initial-scale=1.0, target-densitydpi=device-dpi`
- `head.preloads`: `[]`

---

## 2. Complete top-level structure of PRIMARY

`evidence-folder/proroom-ultra-admin-room.json` is an object with **13 keys**:

| Key | Type | Size | What it holds |
|---|---|---|---|
| `meta` | dict(9) | — | identity block (§1) |
| `head` | dict(4) | — | stylesheet/font links, metas |
| `cssVariables` | dict(2) | `root`(294) + `body`(294), **identical** | full token table (§3) |
| `fonts` | dict(3) | `loaded`(7), `fontFaceRules`(4), `fontFileUrls`(12) | §3 fonts |
| `stylesheets` | list | 43 (2 external CDN + 1 app bundle + 40 inline `<style>`) | see §3 |
| `palette` | dict(18) | frequency-ranked computed values | §3 palette |
| `elements` | list | **2639** (full, `elementsCapped=false`) | §4 inventory |
| `subtrees` | dict(5) | topnav / sidebar / presentation / webcams / roomShell | §4 |
| `targeted` | list | 50 named `querySelector` probes w/ full style | §4 |
| `controls` | list | 230 interactive controls **with `matchedRules` (real CSS)** | §4 |
| `assets` | dict(3) | `images`(103), `backgroundImages`(8), `inlineSvgs`(0) | §4 |
| `inventory` | dict(6) | `buttons`(278), `inputs`(77), `links`(36), `menus`(200), `modalsInDom`(100), `dataAttributes`(14) | §4 / §5 |
| `errors` | list | 0 | clean capture |

**Per-element schema** (every one of the 2639 has these; key frequency):
`path`(2639) · `tag`(2639) · `rect`{x,y,w,h}(2639) · `attrs`(2639) · `style`(2639, ~95 computed
props each) · `before`(2639) · `after`(2639) · `class`(2360) · `icon`(931) · `text`(584) ·
`id`(163). The `style` object carries full computed CSS (display, position, all 4 margins/paddings/
borders, colors, font-*, flex-*, grid-*, transform, etc.). `targeted` and `controls` items
additionally carry `querySelector`/`label` and (`controls` only) a `matchedRules` array of the
literal CSS rules that matched — e.g. `.btn-secondary { --bs-btn-bg:#6c757d; … }`.

**Integrity note (honest):** the `subtrees.*.count` values (topnav 68, sidebar 67, presentation
553, webcams 16, roomShell 600) are the *total DOM node counts* of each subtree, but each
subtree's `nodes` array is a **capped sample** (24, 52, 50, 8, 419 respectively — count ≠
len(nodes)). The **`elements` array is the full uncapped tree** (`meta.elementsCapped=false`), so
element-level claims below draw from `elements`, and subtree `nodes` are used only for the
nav/sidebar structure they fully contain.

---

## 3. Design tokens (this family's primary value)

### 3a. Fonts (`fonts`, `head`)
- Body font family (computed, `palette.fontFamily`): **`"Open Sans", sans-serif`** used 23,265×
  (dominant); secondary `Arial, sans-serif` (202×), `"Font Awesome 5 Free"` (600×). Note the
  **token** `--app-font-family = 'Open Sans', sans-serif` and `--font-family-sans-serif` lists
  `"Lato", …` — but the **live computed font is Open Sans** (Lato face is `unloaded` in
  `fonts.loaded`).
- `fonts.loaded`: FA5 Brands (unloaded), **FA5 Free 400 (loaded)**, **FA5 Free 900 (loaded)**,
  Lato italic/400/700 (all *unloaded*), summernote 400 (unloaded).
- `@font-face` src bases: `../webfonts/fa-brands-400`, `fa-regular-400`, `fa-solid-900` (woff2/woff/
  ttf) + `summernote.*`.

### 3b. Full CSS variable table — all 294 (`cssVariables.root`, identical to `.body`, identical across all 3 files)

Grouped for build use. **Every value verbatim from the JSON.**

**App / brand core**
```
--app-font-family: 'Open Sans', sans-serif
--app-link-color: #45a2ff
--font-family-sans-serif: "Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"
--font-family-monospace: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace
--ptr-website-link-color: #45a2ff
--rosterImg-border-radius: 50%
--avatar-gear-icon-padding: 3px 6px
```

**Navbar / sidebar / shell**
```
--navbar-bg: #0c2434
--navbar-color: #fff
--sidebar-wrapper-bg-color: #103d5c
--sidebar-wrapper-color: #fff
--sidebar-menu-bg: #103d5c
--sidebar-menu-color: #fff
--sidebar-menu-active-color: #45a2ff
--sidebar-navItem-border-color: #fff
--split-gutter-bg: #0a6db1
--split-gutter-color: #fff
--session-control-dropdown-bg: #0e3651
```

**Chat message / roster tokens (live-room source)**
```
--nickname-color: #0a6db1
--name-color: #c0d8ed
--tabs-color: #fff
--tabs-border-color: #0a6db1
--tabs-dropdown-bg: #0f2e43
--tabs-dropdown-color: #45a2ff
--tab-active-bg: #45a2ff
--darker-gray: #aaa6a6
--dark-gray: #aaa
--msgs-header-bg: #0a6db1
--msgs-header-color: #fff
--msgs-separator-bg: #45a2ff
--msgs-separator-border-color: #45a2ff
--msgs-separator-color: #fff
--users-color: #fff
--users-border-color: #fff
--users-badge-bg-color: #0e3651
--users-badge-color: #f4f4f4
```

**Light theme (THIS ROOM IS RENDERING LIGHT — see §4 evidence)**
```
--lightTheme-chat-bg: #eee
--lightTheme-msg-bg: #fff
--lightTheme-msg-color: #676767
--lightTheme-msg-border-color: #e1e1e1
--lightTheme-msgs-bg: #fff
--lightTheme-msgs-bg-adm: #f4f4f4
--lightTheme-msgs-separator-bg: #e8e8e8
--lightTheme-msgs-separator-border-color: #373c42
--lightTheme-msgs-separator-color: #373c42
--lightTheme-nickname-color: #676767
--lightTheme-username-color: #0a6db1
--lightTheme-date-color: #a8a8a8
--lightTheme-roster-bg: #f1f1f1
--lightTheme-roster-bg-adm: #e1e1e1
--lightTheme-textarea-bg: #fff
--lightTheme-textarea-color: #676767
--lightTheme-sidebar-wrapper-bg-color: #fff
--lightTheme-sidebar-wrapper-color: #676767
--lightTheme-user-location-color: #676767
--lightTheme-mobileApp-info-color: #676767
```

**Dark theme (defined but NOT active in these captures)**
```
--darkTheme-chat-bg: #000
--darkTheme-msg-bg: #000
--darkTheme-msg-color: #fff
--darkTheme-msg-border-color: #f4f4f4
--darkTheme-msgs-bg: #143c57
--darkTheme-msgs-bg-adm: #0f2e43
--darkTheme-msgs-separator-bg: #222
--darkTheme-msgs-separator-border-color: #373c42
--darkTheme-msgs-separator-color: #aaa
--darkTheme-nickname-color: #c0d8ed
--darkTheme-username-color: #0a6db1
--darkTheme-date-color: #a8a8a8
--darkTheme-roster-bg: #111
--darkTheme-roster-bg-adm: #000
--darkTheme-textarea-bg: #0c2434
--darkTheme-textarea-color: #f4f4f4
--darkTheme-sidebar-wrapper-bg-color: #000
--darkTheme-sidebar-wrapper-color: #f4f4f4
--darkTheme-user-location-color: #f4f4f4
--darkTheme-mobileApp-info-color: #f4f4f4
```

**Textarea / composer**
```
--textarea-bg: #111
--textarea-holder-border-color: #0a6db1
--textarea-holder-btns-color: #676767
--textarea-holder-btns-hover-color: #0a6db1
```

**Modal system (NAVY, not Darkly — landmine confirmed)**
```
--modal-content-bg-color: #103d5c
--modal-content-border-color: #103d5c
--modal-content-color: #f4f4f4
--modal-active-tab-bg-color: #45a2ff
--modal-active-tab-border-color: #45a2ff
--modal-active-tab-color: #fff
--modal-tabs-border-color: #45a2ff
--modal-alert-link-color: #0a6db1
--modal-btn-close-bg: #0a6db1
--modal-btn-close-border: #0a6db1
--modal-btn-danger-bg: #bb352a
--modal-btn-danger-border: #bb352a
--modal-btn-success-bg: #92d528
--modal-btn-success-border: #92d528
--modal-btn-hover-opacity: 0.9
--modal-input-group-bg: #0a6db1
--modal-upload-files-color: #0a6db1
```

**Presenter / recording / webcams**
```
--presenter-area-bg: #0f2e43
--presenter-noRecording-color: #fff
--presenter-recording-color: #45a2ff
```

**Notes tabs**
```
--notes-tabs-bg: #0c2434
--note-tabs-color: #fff
--note-text-bg: #fff
--note-text-color: #676767
--note-options-bg: #f4f4f4
--note-options-color: #fff
--note-options-hover-color: #212529
--note-next-bg: #45a2ff
--note-delete-bg: #bb352a
--note-download-bg: #92d528
```

**Files panel**
```
--file-list-even-bg: #f4f4f4
--file-list-odd-bg: #fff
--file-name-color: #0a6db1
--file-size-color: #b2b2b2
--file-searchbar-bg: #fff
--file-searchbar-color: #b7b7b7
--file-searchbar-icon-color: #666666
--file-see-more-bg: #45a2ff
--file-download-bg: #92d528
--file-delete-bg: #bb352a
```

**Archives / search / reload / checkbox / dropdown chrome**
```
--archives-dropdown-menu-bg-color: #0e3651
--archives-dropdown-menu-color: #45a2ff
--dropdown-divider-bg: #45a2ff
--checkbox-bg-color: #45a2ff
--search-icon-bg-color: #45a2ff
--search-icon-color: #f4f4f4
--reload-icon-bg-color: #f4f4f4
--reload-icon-color: #45a2ff
--mobileApp-info-bg-color: transparent
--mobileApp-info-color: #f4f4f4
```

**Bootstrap-5 theme scale (Darkly-derived), grayscale & named colors** (subset — all present in JSON):
```
--primary: #375a7f   --secondary: #444   --success: #00bc8c   --info: #3498DB
--warning: #F39C12   --danger: #E74C3C   --blue: #375a7f      --green: #00bc8c
--cyan: #3498DB      --red: #f00          --orange: #fd7e14   --yellow: #ff0
--pink: #e83e8c      --purple: #6f42c1    --teal: #20c997     --indigo: #6610f2
--white: #fff  --black: #000  --gray: #bbb  --gray-dark: #303030
--light: #303030  --dark: #adb5bd
--fire-yellow: #f7fd37   --light-blue: #40e0d0   --lighter-blue: #edf2f6
--dark-black: #222  --darker-black: #111  --light-black: #373c42  --lighter-black: #3e444a
--dark-brown: #4b4b4b  --brown: #555  --light-brown: #8c8686
--dark-gray: #aaa  --light-gray: #ccc  --lighter-gray: #eee  --darker-gray: #aaa6a6
--light-green: #1edd6e  --transparent-gray: rgba(255, 255, 255, 0.331)
--file-download-bg / --note-download-bg / modal success: #92d528 (brand green)
--file-delete-bg / --note-delete-bg / modal danger: #bb352a (brand red)
```
Plus the full Bootstrap-5 `--bs-*` set (≈150 vars: `--bs-primary:#0d6efd`, `--bs-body-bg:#fff`,
`--bs-body-color:#212529`, gray-100…900, all `--bs-*-bg-subtle/-border-subtle/-text-emphasis`,
breakpoints, border-radii `.375rem` etc.). These are stock Bootstrap and only matter for
Bootstrap component parity; the **app-specific tokens above are the ones to port.**

### 3c. `palette` (top computed values, frequency-ranked — verify real numbers)
- **color** (text): `rgb(33,37,41)` #212529 ×19219 · `rgb(204,204,204)` #cccccc ×1926 ·
  **`rgb(69,162,255)` #45a2ff ×1073** · `rgb(244,244,244)` #f4f4f4 ×406 ·
  **`rgb(103,103,103)` #676767 ×346** (msg body) · #000 ×285 · #fff ×285 ·
  **`rgb(10,109,177)` #0a6db1 ×228** (nickname) · `rgb(168,168,168)` #a8a8a8 ×102 (dates) ·
  `rgb(26,26,26)` #1a1a1a ×98 (admin msg body).
- **backgroundColor**: `rgb(255,255,255)` ×2268 · **`rgb(14,54,81)` #0e3651 ×126** ·
  `rgb(108,117,125)` #6c757d ×66 · **`rgb(69,162,255)` #45a2ff ×31** · `rgb(232,232,232)` #e8e8e8 ×26 ·
  `rgb(244,244,244)` #f4f4f4 ×23 · **`rgb(16,61,92)` #103d5c ×23** (modal/sidebar) ·
  `rgb(10,109,177)` #0a6db1 ×16 · `rgb(146,213,40)` #92d528 ×10 (success btn) ·
  `rgb(12,36,52)` #0c2434 ×6 (navbar).
- **borderColor**: #212529 ×17079 · #dee2e6 ×2152 · #cccccc ×1780 · **#45a2ff ×1125** · #676767 ×346.
- **fontSize**: **16px ×22868** (base) · 14px ×275 · 12px ×229 (timestamps) · 14.6667px ×186 ·
  13px ×184 · 20px ×177 · 10px ×123 · 32/28/24px (headings).
- **fontWeight**: 300 ×13703 (Open Sans light — body default) · 700 ×6473 · 100 ×1936 · 400 ×1058 ·
  900 ×649 (FA solid). **Note the app renders body text at weight 300, not 400.**
- **lineHeight**: 24px ×22347 (base) · 16px ×486 · 21px ×245 · 12px ×73 (timestamps).
- **borderRadius**: 6px ×245 · 4px ×82 · **50% ×34** (avatars/roster) · 8px ×24 · 7px ×23.
- **fontStyle italic** ×4232; **textTransform uppercase** ×41.
- **boxShadow**: only 2 non-none — `rgba(0,0,0,0) 0px 0px 0px 9999px inset` ×5 and
  `rgba(0,0,0,0.5) 0px 4px 20px 0px` ×1 (a floating panel).
- **zIndex**: navbar `1030`; dropdown menus `1000` ×166; modals `1055` ×20 (backdrop `1054`);
  webcam overlays `90`.

---

## 4. Element inventory by surface

The room is a 4-region `as-split` layout (from top-level `as-split-area` rects, PRIMARY):

| Region (`class`) | rect (x,y,w,h) | Meaning |
|---|---|---|
| `alert-chat-box alert-chat-regular` | 0, 49, **420**, 1117 | LEFT column wrapper |
| ↳ `alert-box` | 0, 49, 420, **900** | **Alerts panel** (top-left) |
| ↳ `chat-box` | 0, **960**, 420, **206** | **Chat tabs + composer** (bottom-left) |
| `presentation-box` | **431**, 49, **1558**, 1117 | RIGHT: shared screen / webcams |

> The chat message list (`app-chat` → `app-roomscroller`) is nested **inside** `chat-box`'s split;
> the 124 `app-st-message` rows live in a virtualised scroller — captured at large negative Y
> (e.g. `-9683`) because they are scrolled above the fold. That negative-Y offset is expected and
> not a layout value.

**Live theme = LIGHT (hard evidence):**
`chat d-flex flex-column h-100` bg = **`rgb(238,238,238)` #eee** (= `--lightTheme-chat-bg`, not
darkTheme #000); `msg-box-adm` bg = **#f4f4f4** (= `--lightTheme-msgs-bg-adm`); nickname =
**#0a6db1** (= `--lightTheme-username-color`). Build the admin room in **light theme** unless a
theme toggle is added.

### 4a. Top navbar (`nav.mainAppNav`, `targeted[0]`, `subtrees.topnav`)
- `nav.navbar.navbar-expand-md.navbar-dark.fixed-top.mainAppNav` — rect **(0,0,1989,49)**,
  bg **`rgb(12,36,52)` #0c2434** (= `--navbar-bg`), `position:fixed`, `z-index:1030`.
- `span.sidebar-menu` (title **"Open Sidebar"**) rect (5,9,28,31) icon `fas fa-bars`.
- `span.users` (title **"Users Connected"**) rect (42,16,24,18) icon `fas fa-user`.
- `span.fas.fa-mobile.mobile-info-app-btn` (title "Launch in Mobile App") rect (70,17,10,16).
- `a.navbar-brand.ml-1.mr-auto` rect (88,5,200,40) → `img.brand-logo` rect (88,17,200,18),
  src `https://chat.protradingroom.com/var/www/uploads/8cb6ad5c3757766914222382a24b9d2a` (uploaded
  brand PNG, 200×18).
- Right cluster `ul.navbar-nav.align-items-center.ml-auto` rect (1739,1,250,48):
  - `li.talkingIndicator` (rect 1739,4,81,41) → `a.talking` icon `fa fa-microphone` +
    `span` text **"TG"** (the talking user's initials).
  - `li.recIndicator` (rect 1819,4,62,41) → `a` text **"[ REC ]"** (recording active).
  - `li.nav-item.dropdown.dropstart` → volume `fas fa-2x fa-volume-up` (dropdown items
    **Volume / Mute**, `inventory.menus`).
  - `li.nav-item` → reload `fas fa-2x fa-sync`.

### 4b. Admin sidebar (`subtrees.sidebar`, off-canvas — `room-sidebar` rect x = **-248** = closed)
Fully enumerated from `subtrees.sidebar.nodes` (nav is captured even though off-canvas). Items:
- Footer block: `p` **"Powered by:"** → `a.ptr-website-link` **"ProTradingRoom.com"** →
  `p` **"Version: v4.0.1-c0fee8f5"** → `button.btn.btn-sm.btn-secondary` **"Mobile App Info"**
  (opens `#mobileAppInfoModal`).
- Toggle chips `span` **"Chat"** / **"Media"** (icon `fas fa-check`).
- Nav links (`a.nav-link.sidebar-item`, each `span.pl-2` label + icon):
  **"Connectivity Check"** (`fas fa-network-wired`) · **"General Settings"** (`fas fa-cogs`) ·
  **"Archives"** (`fas fa-archive`, dropdown-toggle) · **"Manage Muted Users"** (`fas fa-comments`,
  opens `#mutedUsersModal`) · **"Manage Followed Users"** (`fas fa-users`, opens
  `#followedUsersModal`).
- **Users roster header** `a.nav-link.active-room-users` (rect -243,417,236,35) → `div` title
  **"Users"** → `span.pl-2` **"Users:"** + 4 buttons on the right:
  `reload-room-users` (title **"Reload Users"**, `fas fa-sync`) · `sort` (title **"Sort Users"**,
  `fas fa-sort-alpha-down`) · `search-room-users` (title **"Search Users"**, `fas fa-search`) ·
  a `btn-dark dropdown-toggle` gear (`fas fa-cog`).
- **Roster list** `div.room-roster-list` rect (-248,452,246,708) — **present but off-canvas /
  empty of rows in the captured `elements`** (see honest gaps §7).

### 4c. Alerts panel (`app-alerts`, top-left, rect 0,49,420,900)
Header (`nav.chat-nav`, bg **`rgb(10,109,177)` #0a6db1** = `--msgs-header-bg`, color #fff):
- `a.navbar-brand` text **"Alerts"** + `i.fas.fa-bell`.
- Right `ul.nav.ml-auto`: search `i.fas.fa-search`, then `li.dropdown` gear
  `i.fas.fa-cog.chat-header-gear` (opens the alert settings dropdown).
- Per-alert-row control: `button.btn.btn-sm.btn-secondary.alert-qa` (title **"Ask a question"**,
  icon `fas fa-question-circle`) — **50 instances** in `controls` (one per alert), rect w18×h19.

### 4d. Chat message rows (`app-st-message`, 124 rows) — the admin-critical surface

**Row anatomy** (children with text, from `elements`; `app-chat` path):
- `strong.username.mx-1` — author name; **per-author color** (see color tiers below).
- `img` avatar — **gravatar, 35×35**, `border-radius:0` (square), src
  `https://secure.gravatar.com/avatar/<hash>?d=…` (also `?d=mm&s=50` in `assets.images`).
- `div.msg-left.text-formated.preText.ml-2.mr-2.p-0` — message body; also variant classes
  **`questionColor`** (5×, Q&A messages) and inline `span.stockColor` for tickers.
- `span.created-at.mx-2` — timestamp, **font-size 12px, line-height 12px**, format
  `M/D/YY, h:MM AM/PM` (e.g. `'6/8/26, 1:17 PM'`); color = **`rgb(168,168,168)` #a8a8a8** for
  regular authors, **#e8e8e8** for admin-tier authors, **#d7d7d7** for LornaBot.
- `a.msgMenu.dropright.pt-1` — per-message kebab **"⠇"** (U+2807), rect 19×34, color #0a6db1
  (124 instances in `controls`; dropdown items per `inventory.menus`:
  **User Info / Mention / Copy**).
- Occasional `div.ms-1.private-reply`, `span.badge.chat-reaction`.

**Message box background — regular vs admin (one full + delta):**
| prop | `msg-box pb-1 ng-star-inserted` (regular) | `msg-box … msg-box-adm …` (admin) |
|---|---|---|
| background-color | **`rgb(255,255,255)` #fff** | **`rgb(244,244,244)` #f4f4f4** ← DIFF |
| padding-top | 0px | **2px** ← DIFF |
| border-top | 1px solid `rgb(225,225,225)` #e1e1e1 | *(same)* |
| padding-bottom | 4px | 4px |
| font-weight / size / line-height | 100 / 16px / 24px | *(same)* |
Everything except **bg #fff→#f4f4f4** and **padding-top 0→2px** is identical. Admin messages are
the ONLY difference: a light-gray tint (`--lightTheme-msgs-bg-adm`) + 2px top pad.
There are **18** admin rows (PRIMARY) / 20 (STRONGER). Admin row wrapper carries
`div.mr-1.d-flex.flex-row-reverse` (the reversed avatar/name layout confirmed).

**Message body text color by author tier:**
- Regular member message body: **`rgb(103,103,103)` #676767** (= `--lightTheme-msg-color`).
- Admin/presenter message body: **`rgb(26,26,26)` #1a1a1a**.
- Trade-signal / profit lines rendered green **`rgb(0,128,64)`**; ticker `stockColor` spans inherit
  the row color (#1a1a1a admin, #676767 regular). Sample tickers: `$VLO`, `$UPST`, `$SNOW`.

**Author color tiers (hard evidence, `strong.username` computed color across PRIMARY+STRONGER):**
| Tier | Color | Authors observed |
|---|---|---|
| **Admin / presenter** | **`rgb(232,232,232)` #e8e8e8** | Danielle Shay, Danielle, Sam, JC |
| **Bot** | **`rgb(215,215,215)` #d7d7d7** | LornaBot |
| **Member** (default) | **`rgb(10,109,177)` #0a6db1** (`--nickname-color`) | Brian Surfside, Kody Ashmore, heather, robert brauer, Henry, Cez D Day, HG, Taylor Horton, Mirza Catic, Sheppard, Bruce Marshall, Prosper Jim, PBJ, NoMoFomo, SellMortimerSell, Peter in VT, and ~24 more (40 distinct total) |
None carried an inline `style` color (`attrs.style` empty for all) — colors come purely from CSS
class, so admin/presenter/bot distinction is class-driven, not per-user inline.

**Date separators** (`div.separator.ng-star-inserted`, bg **`rgb(232,232,232)` #e8e8e8**, 7 rows):
`Tuesday, June 9, 2026` · `Wednesday, June 10, 2026` · `Thursday, June 11, 2026` ·
`Friday, June 12, 2026` · `Saturday, June 13, 2026` · `Sunday, June 14, 2026` ·
`Monday, June 15, 2026`. (Message stream spans Jun 8–15 2026.)

### 4e. Chat tabs + composer (`chat-box`, bottom-left, rect 0,960,420,206)
- Header `nav.chat-nav` bg **#0a6db1**, color #fff (icon `fas fa-comment`).
- Chat tabs `ul.nav.nav-tabs.chatTabs` (rect 28,968,330,33): **"Main Chat"** (`a.nav-link.active`,
  rect 121,968,69,33, color #fff, **bg `rgb(69,162,255)` #45a2ff** = `--tab-active-bg`) ·
  **"Off Topic"** (`a.nav-link`, rect 196,968,64,33, transparent bg).
- Composer `div.textSendDiv` (rect 5,1116,410,45):
  - `textarea#textAreaTxt` — placeholder **"Type your message here.."**, rect (10,1121,319,35),
    **bg #fff, color #676767** (light theme composer).
  - Button cluster (`span.textAreaBtns`): emoji `far fa-smile` · image `fas fa-image` · **"GIF"**
    text button.

### 4f. Presentation area (`presentation-box`, right, rect 431,49,1558,1117, bg **#0f2e43** = `--presenter-area-bg`)
- Top tabset `ul#mainTabs.nav.nav-tabs.mainTabset` (rect 431,49,1558,41): tab labels
  **"Screens"** (span, active, `a#screens-tab.nav-link.active`) · **"Notes"** · **"Files"** (each a
  `span.mx-1/ml-1`). Notes/Files tabs also have `presAreaTabs-notes` link + `files-badge`
  (`badge rounded-pill bg-danger`, present but rect 0 = hidden/empty).
- Screens tab active: `div#screens.tab-pane.active` → `ul#screenTabs.nav.nav-tabs.screens-tabs`
  (rect 431,90,1558,40) with a screen tab labeled **"TG-Screen 1"** (span, rect 465,102,68,14) and
  a `span#dropdownMenuScreen.dropdown-toggle` gear (screen options: **Detach Screen to a new
  window**, **Lock Screen** — from `inventory.links`).
- Live screen video: `video#webcamScreen-6a300cc493c3cb36774d1c0d.webcamScreen` rect
  (431,130,1558,1035) inside `div.video-screen-container` — the presenter's shared screen.
- Webcam holder: `app-webcam-holder` → `div.card.webcamsHolder` (320×240) with
  `video.webcamsHolderVideo` (318×238) + `.overlay` + `.pNameLabel.m-0` (presenter name label).

### 4g. `assets`
- `assets.images` (103): brand upload PNG, `assets/images/talking.gif`, and ~100 gravatar avatars
  (`secure.gravatar.com/avatar/<hash>?d=mm&s=50`).
- `assets.backgroundImages` (8): inline data-URI SVGs (checkbox tick `stroke=%23fff`, chevrons,
  Bootstrap form-select arrows) + 2 base64 PNG textures.
- `assets.inlineSvgs`: `[]` (0) — icons are FontAwesome webfont glyphs, not inline SVG.

---

## 5. States captured (dropdowns / modals)

The room is captured in its **default open state**: sidebar **closed** (off-canvas, x=-248),
**Screens** tab active, **Main Chat** tab active, presenter **[REC]** recording + **TG** talking.
No dropdown is visually expanded, **but the modal/menu DOM is fully present** (Angular keeps them
in DOM, `visible:false`):

**Modals in DOM** (`inventory.modalsInDom`, 100 entries; distinct titles — each ×4 = one per
chat/screen context except where noted):
- **"Post Alert"** — admin alert composer (see inputs below). Tabs (from `inventory.links`):
  **Text Alert** (`#nav-text`) · **Text Url** (`#nav-url`) · **Image / GIF / Video** (`#nav-img`).
- **"Q&A for Alert:"** — question modal (textarea "Type your question here...").
- **"Session Control"** — admin session controls.
- **"Debug Log"**, **"Offline"** (connection-lost overlay), **"Download our mobile apps"**,
  **"Followed Chat Users"** (×8), **"Muted Chat Users"** (×4), **"1 Enter your poll question:"**
  (poll builder).

**Dropdown menus** (`inventory.menus`, distinct item lists — all verbatim):
- `dropdown-menu users-dropdown-option` **×47** → **["User Info", "Mention", "Copy"]** (per-user
  right-click menu — the roster/message user menu).
- `nav-item dropdown` (Archives) → **["Archives", "Alert Logs", "Chat Logs", "Transcript History"]**
  — **the admin log surface**. A second `users-dropdown-option` variant →
  **["Alert Logs", "Chat Logs", "Transcript History"]**.
- `dropdown user-options` → **["Sort by Trials"]** (roster sort).
- `nav-item dropdown dropstart` (volume) → **["Volume", "Mute"]**; `volumeControl` → **["Mute"]**.

**Admin form inputs** (`inventory.inputs`, 77 — the settings/alert/poll fields, names verbatim):
- **Post Alert**: `textarea "Alert Text..."`, `url "Link / URL to send to users"`,
  `url "Image or Video Link to show"`, `file fuploadAlert`, `checkbox non-trade-alert`,
  `checkbox longer-alert-popup`, `text "Paste YouTube URL"`.
- **Poll builder**: `text "Main poll question (i.e. Where do you think the market is going?)"`,
  `text "Enter a choice (i.e. Up, Down, Sideways)"`, `checkbox anonymous-poll`.
- **Q&A**: `textarea "Type your question here..."`.
- **User / room settings**: `radio roomLayoutOptions` (×4 layouts), `radio app-color-theme` (×2 —
  the light/dark toggle), `radio alert-text-mode` / `chat-text-mode`, `checkbox pm-window-layout`,
  `checkbox extra-chat-column`, `checkbox chat-always-scroll`, `checkbox chat-mem-clear`,
  `checkbox app-disable-video`, `checkbox presentation-subtitles`,
  `checkbox app-speech-reco-overlay`, `checkbox visibility-change-enabled`.
- **Do-not-disturb toggles**: `talkingPresenter0-donot-disturb`, `alert-donot-disturb`,
  `qa-donot-disturb`, `chat-donot-disturb`, `app-donot-disturb`, `non-trade-donot-disturb`,
  `alert-popup-donot-disturb`, `chat-gif/badges/popup-donot-disturb`.
- **Chat appearance color pickers**: `color chat-text-color`, `color chat-username-color`,
  `color chat-bg-color`, `color chat-ticker-color`, `number chat-text-size`.
- **Reactions/sound**: `checkbox app-recording-start-sound` / `-stop-sound`,
  `checkbox app-reactions-popup` / `-qa`, `checkbox app-reactions-sound-qa`.
- **Files**: `text "Search files..."`; **User settings modal**: `datetime-local` ×2 (date range),
  `range` ×2 (sliders), `search "Type your search term"`.

**Admin nav links** (`inventory.links`): App/Alert/Chat/User Settings anchors
(`#user-app-settings`, `#user-alert-settings`, `#user-chat-settings`, `#user-audio-video-…`).

---

## 6. Exact text / labels / placeholders (verbatim, for pixel copy)

- **Room title / logo**: page title "Mastering The Trade"; brand = uploaded logo image (200×18px)
  linking to nothing (image-only navbar-brand).
- **Sidebar**: "Powered by:", "ProTradingRoom.com", **"Version: v4.0.1-c0fee8f5"**,
  "Mobile App Info", "Chat", "Media", "Connectivity Check", "General Settings", "Archives",
  "Manage Muted Users", "Manage Followed Users", "Users:".
- **Alerts panel**: "Alerts".
- **Chat tabs**: "Main Chat", "Off Topic".
- **Composer placeholder**: **"Type your message here.."** (two dots). Buttons: (emoji), (image),
  "GIF".
- **Presentation tabs**: "Screens", "Notes", "Files"; screen "TG-Screen 1".
- **Navbar indicators**: "TG" (talking), "[ REC ]" (recording).
- **Timestamps**: `6/8/26, 1:17 PM` … `6/9/26, 12:09 PM` (format `M/D/YY, h:MM AM/PM`).
- **Date dividers**: "Tuesday, June 9, 2026" … "Monday, June 15, 2026".
- **Menu items**: "User Info", "Mention", "Copy" · "Archives", "Alert Logs", "Chat Logs",
  "Transcript History" · "Sort by Trials" · "Volume", "Mute" · "Detach Screen to a new window",
  "Lock Screen".
- **Modal titles**: "Post Alert", "Q&A for Alert:", "Session Control", "Debug Log", "Offline",
  "Followed Chat Users", "Muted Chat Users", "Download our mobile apps", "Enter your poll
  question:".
- **Alert composer tabs**: "Text Alert", "Text Url", "Image / GIF / Video".
- **Input placeholders**: "Alert Text...", "Link / URL to send to users", "Image or Video Link to
  show", "Paste YouTube URL", "Search files...", "Type your question here...",
  "Main poll question (i.e. Where do you think the market is going?)",
  "Enter a choice (i.e. Up, Down, Sideways)", "Type your search term".

---

## 7. What this family uniquely evidences + honest gaps

**Uniquely evidenced by the ADMIN family (vs member/guest captures):**
1. **The complete admin token set + admin-only tokens**: `--msgs-bg-adm` / `--lightTheme-msgs-bg-adm`
   (#f4f4f4), `--session-control-dropdown-bg` (#0e3651), `--archives-dropdown-*`, `--presenter-*`,
   `--reload-icon-*`, `--search-icon-*`, `--modal-*` (17 modal tokens). 294 vars total, verbatim §3.
2. **Admin message rendering**: `msg-box-adm` = **#f4f4f4 bg + 2px top-pad** over regular #fff, and
   the **3-tier author color** system (#e8e8e8 admin / #d7d7d7 bot / #0a6db1 member) — class-driven,
   no inline colors.
3. **Admin controls**: per-message kebab menu (User Info/Mention/Copy), Archives→**Alert Logs / Chat
   Logs / Transcript History**, Manage Muted/Followed Users, the **Post Alert** composer (text/url/
   image tabs + file upload + YouTube URL), **poll builder**, **Q&A**, **Session Control**, and the
   full settings surface (layout radios, do-not-disturb matrix, chat color pickers, theme toggle).
4. **Presenter/recording state**: "TG" talking indicator + "[ REC ]" + live `webcamScreen` share +
   webcam holder — this is a capture of an *active presenting admin*.
5. **Version pin**: app **v4.0.1-c0fee8f5**; FontAwesome **5.8.1**; Bootstrap-5 `--bs-*` present;
   Open Sans (weight 300 body) is the live font (Lato token defined but unloaded).

**Honest gaps (not captured / cannot assert):**
- **Roster member rows**: `room-roster-list` is off-canvas (sidebar closed, x=-248); **no
  individual roster rows / avatars / rank badges / presence indicators are in the `elements`**.
  Roster styling must come from a capture with the sidebar open, or from the presence-payload
  memory note — NOT from this family.
- **Alert message bodies**: the Alerts panel header renders, but **no individual alert rows'
  text/authors are captured** (the `alert-box` scroller content isn't expanded in `elements`). The
  50 `alert-qa` buttons confirm 50 alerts exist, but their content/author emails are not here.
- **Log modals' interior** (Alert Logs / Chat Logs / Transcript History): only the *menu items* that
  open them are captured; the modal **bodies (author emails, log rows) are not** — `modalsInDom`
  gives titles only (`{title, class, visible}`), no field/row content. "Author emails" requested in
  the task are **not present** in any of the three files.
- **Member-management modal interiors** (Muted/Followed Users): titles + trigger present; **row
  content not captured**.
- **No open dropdown/modal snapshot**: every modal is `visible:false`; we have their DOM presence,
  input names, and menu item lists, but **no rendered/expanded geometry or styling** for any modal
  or dropdown.
- **`subtrees.*.nodes` are capped samples** (count ≠ len(nodes)); deep subtree geometry beyond the
  cap is only available via the full `elements` array, which does not descend into every collapsed/
  off-canvas branch.
- **Notes / Files tab bodies**: tabs exist but **Screens** is the active tab; Notes/Files panel
  content and the `files-badge` count are rect-0/hidden — not captured.
