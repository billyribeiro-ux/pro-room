# Decoded capture — `proroom-full-presenter.json` (PRESENTER role)

Forensic decode of the two PRESENTER-role DOM/style captures of the ProTradingRoom "Mastering The Trade" room. Every value below cites its JSON locator (`section/path[index]/key`) in the PRIMARY file unless prefixed `SECONDARY`. Nothing is inferred from memory. Where a surface is defined in CSS but not rendered in the captured DOM, that is called out as an explicit honest gap — not reconstructed.

Verification of completeness (processed == total):
- PRIMARY `elements`: 2184 processed == 2184 total (`len(elements)`).
- PRIMARY `states`: 15 processed == 15 total.
- PRIMARY `cssVariables.root`: 294 keys; `cssVariables.body`: 294 keys; **`root == body` exactly** (byte-identical dict).
- PRIMARY `inventory`: buttons 248, inputs 74, links 39, menus 300, modalsInDom 120, dataAttributes 13.
- Full-JSON string walk over every leaf performed for presenter keywords (Recording / Session Control / SoundCloud / WebCam / Screen Share / TAWK / microphone) — see §7 and §8.

---

## 1. File identity, capture metadata & the PRIMARY↔SECONDARY relationship

| Field | PRIMARY `proroom-full-presenter.json` | SECONDARY `docs/reference/captures/proroom-full-presenter.json` |
|---|---|---|
| Size on disk | 27,094,331 bytes | 11,184,807 bytes |
| `meta/role` | `presenter` | `presenter` (SAME) |
| `meta/url` | `https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1` | SAME |
| `meta/title` | `Mastering The Trade` | SAME |
| `meta/viewport` | `{w:1401, h:905, dpr:2}` | **`{w:1988, h:1157, dpr:2}`** |
| `meta/screen` | `{w:1401, h:905}` | **`{w:1988, h:1157}`** |
| `meta/userAgent` | `…Chrome/150.0.0.0 Mobile Safari…` (Android 15; Pixel 9) | **`…Chrome/149.0.0.0…`** |
| `meta/theme` | `{htmlClass:"", bodyClass:"", dataTheme:null}` | `{htmlClass:"", bodyClass:""}` (no `dataTheme` key) |
| `meta/tooNarrow` / `elementsCapped` | `false` / `false` | `false` / `false` (SAME) |
| `head/stylesheetLinks[2]` app CSS | `styles.d622cb9ed2bbc221.css` | **`styles.0d26360b9b3e223c.css`** |
| `elements` count | 2184 | 1178 |
| `states` count | 15 | 9 |
| `inventory.buttons/menus/modalsInDom` | 248 / 300 / 120 | 200 / 251 / 120 |
| `assets.images` | 89 | 34 |
| `errors` | 0 | 0 |

**Exact relationship — two INDEPENDENT captures, NOT a subset/superset.** Evidence:
- Different **viewport** (1401×905 vs 1988×1157) → different layout rects throughout; PRIMARY is the narrower window.
- Different **app build**: main CSS hash `d622cb9ed2bbc221` (PRIMARY) vs `0d26360b9b3e223c` (SECONDARY) — `head/stylesheetLinks[2]` and `stylesheets[4].href` differ (`stylesheets` index 4 is the only differing sheet; indices 0–3 and 5–40 match).
- Different **browser**: Chrome 150 vs 149 (`meta/userAgent`).
- **Element-path overlap** (by CSS `path`): PRIMARY 2081 distinct paths, SECONDARY 1125 distinct paths; **928 SECONDARY paths are absent from PRIMARY** and 1884 PRIMARY paths absent from SECONDARY → neither contains the other.
- **States**: shared 9 = `tab:Screens, tab:Streams, tab:Notes, tab:Files, dropdown:1, dropdown:2, dropdown:3, dropdown:7, dropdown:8`. PRIMARY adds 6 per-note states not in SECONDARY: `note:Welcome`, `note:JC's Daily Briefing`, `note:Henry's Workflowy Notes`, `note:Sam's Mag 7 index`, `note:1on1 Coaching/ Prop Firm & Too`, `note:Taylor's Scorecard Rankings (6…`.
- **Identical sections** across both: `fonts`, `cssVariables` (both root & body, all 294 vars), `assets.backgroundImages` (8). `palette` sub-arrays share the same value set but differ in per-value counts (more DOM in PRIMARY).

**Conclusion:** PRIMARY is the richer, more recent presenter capture (larger element/state/asset counts, per-note drill-downs). SECONDARY is an earlier, wider-viewport capture of the same room/role on a prior build. **Decode PRIMARY as authority; use SECONDARY only to cross-check role-invariant data (cssVariables, fonts).**

---

## 2. Complete top-level structure (PRIMARY)

Root is an object with 11 keys:

| Key | Type | Count / shape |
|---|---|---|
| `meta` | object | 9 keys (role, url, title, viewport, screen, tooNarrow, theme, userAgent, elementsCapped) |
| `head` | object | 4 keys (stylesheetLinks[3], fontLinks[1], preloads[0], metas{viewport}) |
| `cssVariables` | object | 2 keys: `root` (294), `body` (294); root == body |
| `fonts` | object | 3 keys: `loaded`[7], `fontFaceRules`[4], `fontFileUrls`[12] |
| `stylesheets` | array | 41 entries (`{href, text}`); total inline CSS ≈ 742,822 bytes |
| `palette` | object | 18 sub-keys (color, backgroundColor, borderColor, fontFamily, fontSize, fontWeight, lineHeight, opacity, marginTop, zIndex, paddingTop, paddingLeft, borderRadius, borderTopWidth, fontStyle, textTransform, gap, boxShadow) — each an array of `{value,count}` sorted desc |
| `elements` | array | 2184 nodes; per-node keys ⊆ `{path, tag, rect{x,y,w,h}, attrs{}, class, id, icon, style{}, before, after, text}` |
| `assets` | object | 3 keys: `images`[89], `backgroundImages`[8], `inlineSvgs`[0] |
| `inventory` | object | 6 keys: `buttons`[248], `inputs`[74], `links`[39], `menus`[300], `modalsInDom`[120], `dataAttributes`[13] |
| `states` | object | 15 keys (see §5); each `{groups:[…]}`, group = `{selector, rootPath, count, nodes[]}`; nodes carry `matchedRules` (full CSS cascade) that top-level `elements` do NOT |
| `errors` | array | 0 (empty) |

App framework: **Angular `ng-version 17.3.12`** (`elements` path `…app-root` `attrs/_nghost… ng-version`). App version string on-screen: **`Version: v4.0.1-b422b517`** (`elements` sidebar `<p>` text). Angular components present (`elements` tags): `app-root`(1), `app-room`(1), `app-presentationarea`(1), `app-chat`(1), `app-note`(1), `app-alerts`(1), `app-room-roster`(1), `app-roomscroller`(2), `app-st-message`(100).

`before`/`after` per node hold the ::before/::after computed pseudo (e.g. FontAwesome glyph): `{content, fontFamily, fontSize, fontWeight, color, background}` — example `elements` `<i class="fas fa-check">` → `before:{content:"", fontFamily:'"Font Awesome 5 Free"', fontSize:"14px", fontWeight:"900", color:"rgb(103,103,103)"}`.

Fonts (`fonts/loaded`): Font Awesome 5 Free 400+900 **loaded**; FA5 Brands, Lato (400/700/400-italic), `summernote` all **unloaded** (declared, not fetched). `fonts/fontFileUrls` lists the 12 FA + summernote woff2/woff/ttf on `chat.protradingroom.com`. Note: `cssVariables --font-family-sans-serif` names **Lato** but the computed `palette/fontFamily` top value is **`"Open Sans", sans-serif` (23176 uses)** — Open Sans wins at runtime.

---

## 3. cssVariables — COMPLETE (294 vars, `root` == `body`)

All 294 come verbatim from `cssVariables/root`. Grouped for readability; every value is exact. (Bootstrap 5 `--bs-*` tokens, ~130 of them, are the stock Bootstrap palette and are listed in the last block.)

### 3a. Brand / theme accent tokens (app-specific)
| Var | Value |
|---|---|
| `--app-font-family` | `'Open Sans', sans-serif` |
| `--app-link-color` | `#45a2ff` |
| `--font-family-sans-serif` | `"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, …` |
| `--font-family-monospace` | `SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` |
| `--primary` | `#375a7f` |
| `--secondary` | `#444` |
| `--success` | `#00bc8c` |
| `--info` | `#3498DB` |
| `--warning` | `#F39C12` |
| `--danger` | `#E74C3C` |
| `--blue` | `#375a7f` · `--cyan` `#3498DB` · `--green` `#00bc8c` · `--red` `#f00` · `--yellow` `#ff0` · `--orange` `#fd7e14` · `--pink` `#e83e8c` · `--purple` `#6f42c1` · `--indigo` `#6610f2` · `--teal` `#20c997` |
| `--light` | `#303030` · `--dark` `#adb5bd` · `--gray` `#bbb` · `--gray-dark` `#303030` |
| Grays scale | `--light-gray` `#ccc` · `--dark-gray` `#aaa` · `--darker-gray` `#aaa6a6` · `--lighter-gray` `#eee` · `--darker-black` `#111` · `--dark-black` `#222` · `--light-black` `#373c42` · `--lighter-black` `#3e444a` · `--black` `#000` · `--white` `#fff` |
| Extra hues | `--light-blue` `#40e0d0` · `--lighter-blue` `#edf2f6` · `--light-green` `#1edd6e` · `--fire-yellow` `#f7fd37` · `--dark-brown` `#4b4b4b` · `--light-brown` `#8c8686` · `--brown` `#555` · `--transparent-gray` `rgba(255,255,255,0.331)` |

### 3b. Navbar / sidebar / tabs
| Var | Value | Var | Value |
|---|---|---|---|
| `--navbar-bg` | `#0c2434` | `--navbar-color` | `#fff` |
| `--sidebar-wrapper-bg-color` | `#103d5c` | `--sidebar-wrapper-color` | `#fff` |
| `--sidebar-menu-bg` | `#103d5c` | `--sidebar-menu-color` | `#fff` |
| `--sidebar-menu-active-color` | `#45a2ff` | `--sidebar-navItem-border-color` | `#fff` |
| `--tabs-color` | `#fff` | `--tabs-border-color` | `#0a6db1` |
| `--tab-active-bg` | `#45a2ff` | `--tabs-dropdown-bg` | `#0f2e43` |
| `--tabs-dropdown-color` | `#45a2ff` | `--split-gutter-bg` | `#0a6db1` |
| `--split-gutter-color` | `#fff` | `--archives-dropdown-menu-bg-color` | `#0e3651` |
| `--archives-dropdown-menu-color` | `#45a2ff` | `--reload-icon-bg-color` | `#f4f4f4` |
| `--reload-icon-color` | `#45a2ff` | `--search-icon-bg-color` | `#45a2ff` |
| `--search-icon-color` | `#f4f4f4` | `--ptr-website-link-color` | `#45a2ff` |

### 3c. Chat / messages / roster / users
| Var | Value | Var | Value |
|---|---|---|---|
| `--msgs-header-bg` | `#0a6db1` | `--msgs-header-color` | `#fff` |
| `--msgs-separator-bg` | `#45a2ff` | `--msgs-separator-color` | `#fff` |
| `--msgs-separator-border-color` | `#45a2ff` | `--nickname-color` | `#0a6db1` |
| `--name-color` | `#c0d8ed` | `--users-badge-bg-color` | `#0e3651` |
| `--users-badge-color` | `#f4f4f4` | `--users-color` | `#fff` |
| `--users-border-color` | `#fff` | `--rosterImg-border-radius` | `50%` |
| `--checkbox-bg-color` | `#45a2ff` | `--dropdown-divider-bg` | `#45a2ff` |
| `--avatar-gear-icon-padding` | `3px 6px` | `--mobileApp-info-color` | `#f4f4f4` |
| `--mobileApp-info-bg-color` | `transparent` | | |

### 3d. Textarea / composer
`--textarea-bg` `#111` · `--textarea-holder-border-color` `#0a6db1` · `--textarea-holder-btns-color` `#676767` · `--textarea-holder-btns-hover-color` `#0a6db1`.

### 3e. Modals (NAVY — confirms the memory note "modals are NAVY #103d5c")
| Var | Value | Var | Value |
|---|---|---|---|
| `--modal-content-bg-color` | `#103d5c` | `--modal-content-border-color` | `#103d5c` |
| `--modal-content-color` | `#f4f4f4` | `--modal-active-tab-bg-color` | `#45a2ff` |
| `--modal-active-tab-border-color` | `#45a2ff` | `--modal-active-tab-color` | `#fff` |
| `--modal-tabs-border-color` | `#45a2ff` | `--modal-input-group-bg` | `#0a6db1` |
| `--modal-btn-close-bg` | `#0a6db1` | `--modal-btn-close-border` | `#0a6db1` |
| `--modal-btn-danger-bg` | `#bb352a` | `--modal-btn-danger-border` | `#bb352a` |
| `--modal-btn-success-bg` | `#92d528` | `--modal-btn-success-border` | `#92d528` |
| `--modal-btn-hover-opacity` | `0.9` | `--modal-alert-link-color` | `#0a6db1` |
| `--modal-upload-files-color` | `#0a6db1` | | |

### 3f. Notes / files
`--notes-tabs-bg` `#0c2434` · `--note-tabs-color` `#fff` · `--note-text-bg` `#fff` · `--note-text-color` `#676767` · `--note-options-bg` `#f4f4f4` · `--note-options-color` `#fff` · `--note-options-hover-color` `#212529` · `--note-download-bg` `#92d528` · `--note-delete-bg` `#bb352a` · `--note-next-bg` `#45a2ff` · `--file-list-even-bg` `#f4f4f4` · `--file-list-odd-bg` `#fff` · `--file-name-color` `#0a6db1` · `--file-size-color` `#b2b2b2` · `--file-download-bg` `#92d528` · `--file-delete-bg` `#bb352a` · `--file-see-more-bg` `#45a2ff` · `--file-searchbar-bg` `#fff` · `--file-searchbar-color` `#b7b7b7` · `--file-searchbar-icon-color` `#666666`.

### 3g. PRESENTER-specific tokens (governs the presenter media surfaces)
| Var | Value | Meaning |
|---|---|---|
| `--presenter-area-bg` | `#0f2e43` | background of `.presentation-box` (the stage) |
| `--presenter-recording-color` | `#45a2ff` | recording-active accent |
| `--presenter-noRecording-color` | `#fff` | recording-idle accent |
| `--session-control-dropdown-bg` | `#0e3651` | Session Control modal's dropdown bg |

### 3h. Dual light/dark theme token banks (both fully present, theme not active — `meta/theme` blank)
`--darkTheme-*` (16 vars): chat-bg `#000`, msg-bg `#000`, msg-color `#fff`, msg-border-color `#f4f4f4`, msgs-bg `#143c57`, **msgs-bg-adm `#0f2e43`** (admin/presenter row bg — matches `msg-box-adm`), msgs-separator-bg `#222`, msgs-separator-border-color `#373c42`, msgs-separator-color `#aaa`, date-color `#a8a8a8`, nickname-color `#c0d8ed`, username-color `#0a6db1`, roster-bg `#111`, roster-bg-adm `#000`, sidebar-wrapper-bg-color `#000`, sidebar-wrapper-color `#f4f4f4`, textarea-bg `#0c2434`, textarea-color `#f4f4f4`, user-location-color `#f4f4f4`, mobileApp-info-color `#f4f4f4`.
`--lightTheme-*` (16 vars): chat-bg `#eee`, msg-bg `#fff`, msg-color `#676767`, msg-border-color `#e1e1e1`, msgs-bg `#fff`, msgs-bg-adm `#f4f4f4`, msgs-separator-bg `#e8e8e8`, msgs-separator-border-color `#373c42`, msgs-separator-color `#373c42`, date-color `#a8a8a8`, nickname-color `#676767`, username-color `#0a6db1`, roster-bg `#f1f1f1`, roster-bg-adm `#e1e1e1`, sidebar-wrapper-bg-color `#fff`, sidebar-wrapper-color `#676767`, textarea-bg `#fff`, textarea-color `#676767`, user-location-color `#676767`, mobileApp-info-color `#676767`.

### 3i. Bootstrap 5 stock tokens (~130 `--bs-*` + breakpoints)
Present verbatim and identical to stock BS 5.3: breakpoints `--bs-breakpoint-{xs 0, sm 576px, md 768px, lg 992px, xl 1200px, xxl 1400px}` (and legacy `--breakpoint-*` without xxl); theme colors `--bs-blue #0d6efd`, `--bs-primary #0d6efd`, `--bs-success #198754`, `--bs-danger #dc3545`, `--bs-warning #ffc107`, `--bs-info #0dcaf0`, `--bs-secondary #6c757d`, `--bs-light #f8f9fa`, `--bs-dark #212529`; grays `--bs-gray-100…900` (`#f8f9fa`→`#212529`); body `--bs-body-bg #fff`, `--bs-body-color #212529`, `--bs-body-font-family system-ui,-apple-system,"Segoe UI",Roboto,…`, `--bs-body-font-size 1rem`, `--bs-body-line-height 1.5`; radii `--bs-border-radius .375rem` (sm `.25rem`, lg `.5rem`, xl `1rem`, pill `50rem`); `--bs-border-color #dee2e6`; shadows `--bs-box-shadow 0 .5rem 1rem rgba(0,0,0,.15)`; link `--bs-link-color #0d6efd` / hover `#0a58ca`; focus ring `rgba(13,110,253,.25)`; plus every `*-bg-subtle / -border-subtle / -text-emphasis / -rgb` variant. (Full list is deterministic stock BS; reproduce the standard 5.3 `:root`.)

---

## 4. Element inventory by surface (PRIMARY `elements`, 2184 nodes)

Coordinate note: the capture scrolled the chat column, so many message rows carry large **negative `y`** (e.g. −9926 … +768) — those are off the current viewport but in the DOM. `rect{x,y,w,h}` is in CSS px at dpr 2. Repetitive sets are given as one full example + count + deltas.

### 4a. Top app navbar — `nav.navbar.navbar-expand-md.navbar-dark.fixed-top.mainAppNav` (`elements`, rect x0 y0 **w1401 h49**)
| Element | rect (x,y,w,h) | text / title | class / icon |
|---|---|---|---|
| Open-sidebar hamburger | 5,9,28,31 | title `Open Sidebar` | `span.sidebar-menu` › `i.fas.fa-bars` (11,15,16,18) |
| Users-connected badge | 42,16,24,18 | title `Users Connected` | `span.users.ml-1.mr-1` › `i.fas.fa-user` (48,18,12,14) |
| Launch-in-mobile-app | 70,17,10,16 | title `Launch in Mobile App` | `span.fas.fa-mobile.mobile-info-app-btn` |
| Brand logo | 88,16,200,18 | — | `a.navbar-brand` › `img.brand-logo` |
| Collapsible region | 288,1,1113,48 | — | `div.collapse.navbar-collapse` |
| Talking indicator | 1126,4,167,41 → `a` 1131,4,157,41 | **`( No one is speaking )`** | `li.nav-item.talkingIndicator.animated.fadeIn` |
| **Volume dropdown toggle** | li 1293,1,50,48 → a 1298,1,40,48 → `i` 1306,9,36,32 | — | `li.nav-item.dropdown.dropstart` › `i.fas.fa-2x.fa-volume-up` (opens state `dropdown:3`, §5) |
| Reload | li 1343,1,58,48 → a 1348,1,48,48 → `i` 1356,9,32,32 | title `Reload` | `li.nav-item` › `i.fas.fa-2x.fa-sync` |

There is **no** Recording / Mic / Screen-Share / WebCam / SoundCloud / Session-Control / TAWK control in this navbar. The navbar's presenter-media zone is **absent from the captured DOM** (honest gap §8).

### 4b. Left sidebar / roster — `div.sidebar-wrapper` (`elements`, rect x**−250** y49 w250 h856; off-canvas, negative x = closed)
Powered-by header (`p` "Powered by:", `a.ptr-website-link` "ProTradingRoom.com" → `https://protradingroom.com/`), `p` "Version: v4.0.1-b422b517", `button.btn.btn-sm.btn-secondary` "Mobile App Info" (−182,112,115,31), feature badges `span` "Chat"+`i.fa-check`, "Media"+`i.fa-check`. Nav items (each `li.nav-item` → `a.nav-link.sidebar-item` with title + `i` + `span.pl-2` label):
- `Connectivity Check` (`fas fa-network-wired`) · `General Settings` (`fas fa-cogs`) · `Archives` dropdown (`dropdown-toggle`; menu items = Alert Logs / Chat Logs / Transcript History, §5 dropdown:1) · `Manage Muted Users` (`fas fa-comments`) · `Manage Followed Users` (`fas fa-users`).
- **Users panel** `a.nav-link.active-room-users` (−243,417): `div title=Users` + `i.fa-user` + `span` "Users:"; button cluster `div.flex-fill.users-btns` (−179,417,172,27): `button` "Sort by Trials" (`fas fa-cog`) + dropdown-toggle (`fas fa-cog`), **Reload Users** (`fas fa-sync`, title), **Sort Users** (`fas fa-sort-alpha-down`, title), **Search Users** (`fas fa-search`, title).
- Roster list: `app-room-roster` › `div.room-roster-list` (−248,452,246,447).

### 4c. Main presentation area (the "stage") — `app-presentationarea` (`elements`, rect **x383 y49 w1018 h856**) inside `.presentation-box` (bg `--presenter-area-bg #0f2e43`)
Top-level `elements` only captures `div.mainPresentationAreaHolder`; the full subtree (438 nodes) is in the state groups (§5). **Main tab bar `ul#mainTabs.nav.nav-tabs.mainTabset`** (383,49,1018,40) has exactly **3 tabs** (from state `#mainTabs`, count 25):
1. **Screens** — `a.nav-link.active` `i.fas.fa-desktop` + `span` "Screens" (li 770,49,89,40).
2. **Notes** — `a.nav-link.presAreaTabs-notes` `i.fas.fa-edit` + `span` "Notes" (li 860,49,81,40).
3. **Files** — `a.nav-link` `i.fas.fa-folder` + `span` "Files" (li 941,49,72,40).

No Streams/Recording/Session-Control tab element is present (the `tab:Streams` state exists as a key but its `#mainTabs` group still shows only these 3 tabs — §8). Under the Notes tab, a **note sub-tabset** `ul.nav.nav-tabs.noteTabset` with editable note tabs (`a.editName`): "Welcome" (badge-success dot + `fa-home`), "JC's Daily Briefing" (`fa-pen`, active), "Henry's Workflowy Notes", "Sam's Mag 7 index", "1on1 Coaching/ Prop Firm & Tool Dis…", "Taylor's Scorecard Rankings (6/26 C…". Note body renders in `app-note` › `div.note-view`; footer `div.noteOptions` (383,854,1018,51) with `button.btn.btn-sm.noteDownload` "Download" (title "Download Note", `fas fa-download`).

### 4d. Chat column — `app-chat` (messages via `app-st-message`, 100 instances)
Chat header nav `nav.navbar.chat-nav` (0,314,372,48) with settings gear `i.fas.fa-cog.chat-header-gear` (title "Settings", appears at 339,64 and 343,328). Composer at bottom: `textarea.txt-area.form-control.border-0` placeholder **"Type your message here.."** name `txt-area` (10,860,**328**,35) + a `+` button `span.textAreaBtns` `fas fa-plus` (338,861,24,34) inside `div.…textAreaBtnsCol` (338,860,24,35).

**Chat-row layout — the presenter-defining detail (two distinct row types):**

| | Regular member row | **Admin/Presenter row** |
|---|---|---|
| Container | `div.msg-box.pb-1` | **`div.msg-box.pb-1.msg-box-adm`** |
| Row flex | `div.mr-1.d-flex.**flex-row**` | `div.mr-1.d-flex.**flex-row-reverse**` |
| Avatar side | LEFT — `div.avatar.pl-1` at **x≈19–23** | RIGHT — `div.avatar.pl-1` at **x≈310–314** |
| Timestamp | right of name, `span.created-at.mr-2` (e.g. `7/22/26, 3:59 PM`) | **left**, `span.created-at.mx-2` (e.g. `04:10 PM`) at x≈8 |
| Kebab menu | `a.msgMenu.dropright.pt-1` text `⠇` | same `⠇` kebab, positioned **far right** at **x≈349** (or x0 when column narrow) |
| Badges | `img.user-badge-img` 20×20 row (up to 4) | same |
| QA button | `button.alert-qa` (`fas fa-question-circle`, title "Ask a question"), e.g. text `(2) ✅` / `(8) ✅` | same |
CSS (verbatim, `stylesheets[4]`): `.msg-box-adm { background-color: var(--msgs-bg-adm); border-bottom: 2px; padding-top: 2px; }` · `.msgMenu { padding-left: 5px; font-size: 20px; font-weight: 600; color: var(--username-color) !important; }` · `.alert-qa { font-size: 10px; padding: 1px 3px; }` · `.flex-row-reverse { flex-direction: row-reverse !important; }`.

Repetitive set (`inventory.buttons`, 248 total): `⠇` kebab ×**100** (`a.msgMenu.dropright.pt-1`, rect w19 h34, x alternates 0 / 349 by row side, y stepping through negative scroll offsets); `alert-qa` "Ask a question" button ×**41** (mostly empty text, some `(n)` / `(n) ✅` counts at 18–53 px wide); "Download"/"Download Note" ×6; `far fa-smile` composer emoji ×4; `fas fa-image` composer image ×2; `fas fa-plus` composer add ×2.

### 4e. Alerts column — `app-alerts` + `app-roomscroller#chatScrollViewParentAlerts`
Alert rows share the `app-st-message` structure; user-context kebab menus (states dropdown:7/8) offer **User Info / Mention / Copy**.

---

## 5. States (15) — decoded

Each state is a re-capture of the presentation subtree plus a specific opened surface. Every state carries these 3 base groups: `app-presentationarea` (`count:438`), `.presentation-box` (`count:455`), `#mainTabs` (`count:25`). `count` = true DOM subtree size; `nodes[]` is a capped sample (46 of the state groups have `count > len(nodes)` — the capture caps node arrays, so deep note bodies are truncated; honest gap §8). Nodes uniquely include `matchedRules[]` = the full CSS cascade per element (`{selector, cssText}`), e.g. `.presentation-box { background-color: var(--presenter-area-bg); … }`.

**Tab states** (`tab:Screens`, `tab:Streams`, `tab:Notes`, `tab:Files`): the 3 base groups only; `#mainTabs` always shows the same 3 tabs (Screens/Notes/Files). `tab:Streams` and `tab:Screens` render the same tab bar — no distinct Streams tab element captured.

**Note states** (PRIMARY-only, 6): `note:Welcome`, `note:JC's Daily Briefing` (largest, 128 sampled nodes — renders `p` "All times quoted are CENTRAL TIME.", `b` "FOR ADDITIONAL NOTES" + `a` "CLICK HERE", embedded trade log e.g. "BOT +1 AMLP 100 16 OCT 26 51 CALL @…", images, dates like "3/26/26, 2:10 PM"), `note:Henry's Workflowy Notes`, `note:Sam's Mag 7 index`, `note:1on1 Coaching/ Prop Firm & Too` (177 nodes), `note:Taylor's Scorecard Rankings (6…`. Each re-captures the presentation subtree with that note tab active.

**Dropdown states** (5) — each adds a 4th group `.dropdown-menu.show`:
- **`dropdown:1`** (count 10) — Archives menu `div.dropdown-menu.users-dropdown-options.show` (−248,332,246,103): `a.dropdown-item.small` **Alert Logs** (`fas fa-bell`), **Chat Logs** (`fas fa-comment`), **Transcript History** (`fas fa-closed-captioning`).
- **`dropdown:2`** (count 3) — user sort menu `ul.dropdown-menu.show` (−285,449): item **"Sort by Trials"**.
- **`dropdown:3`** (count 35) — **the Volume / room-sound panel** `div.dropdown-menu.volumeControl.show` (1131,1,160,335): `h4` **"Volume"** + close `i.fas.fa-times`; `input[type=range].volCtrl` (title "Volume", 1147,46,129,32); `button.btn.btn-primary.btn-sm` **"Mute"** (title "Mute Audio", 1186,85,49,31); `hr` + `dropdown-divider`; `div.room-sound-options` with 6 toggles each `input.form-check-input` + `label.form-check-label` + `span` state "on": **Alert sound** (on), **QA sound** (on), **NTA sound** (title "Non-trade alert sound", on), **Chat sound** (on), **Subtitles** (`fas fa-closed-captioning`, title "Show Speech Recognition Overlay", on), **Don't Disturb** (checkbox name `alert-donot-disturb`).
- **`dropdown:7`** & **`dropdown:8`** (count 7 each) — alert-row user context menu `div.dropdown-menu.users-dropdown-options.show` (w160 h112): `a.dropdown-item` **User Info** (`fas fa-user`), **Mention** (`fas fa-reply`), **Copy** (`fas fa-copy`).

`inventory.menus` (300) cross-confirms distinct item-lists: `[nav-item dropdown]→Archives/Alert Logs/Chat Logs/Transcript History`; `[users-dropdown-options]→Alert Logs/Chat Logs/Transcript History`; `[user-options]→Sort by Trials`; `[nav-item dropdown dropstart]→Volume/Mute`; `[volumeControl]→Mute`; `[users-dropdown-options]→User Info/Mention/Copy`; `[users-dropdown-options]→User Info/Mention/Reply/Add Reaction`.

---

## 6. Text content — exact labels & placeholders

**Nav / sidebar labels:** "Powered by:", "ProTradingRoom.com", "Version: v4.0.1-b422b517", "Mobile App Info", "Chat", "Media", "Connectivity Check", "General Settings", "Archives", "Manage Muted Users", "Manage Followed Users", "Users:", "Sort by Trials", "( No one is speaking )".
**Tabs:** "Screens", "Notes", "Files"; note tabs "Welcome", "JC's Daily Briefing", "Henry's Workflowy Notes", "Sam's Mag 7 index", "1on1 Coaching/ Prop Firm & Tool Dis…", "Taylor's Scorecard Rankings (6/26 C…".
**Volume panel:** "Volume", "Mute", "Alert sound", "QA sound", "NTA sound", "Chat sound", "Subtitles", "Don't Disturb", "on".
**User/alert menus:** "User Info", "Mention", "Copy", "Reply", "Add Reaction", "Alert Logs", "Chat Logs", "Transcript History".
**Buttons (`inventory.buttons`):** "Post Alert", "Send Poll", "Add Choice", "Save To Canned", "Play For All", "Filter out alerts", "Edit my Info and Avatar", "Change Devices", "Test", "Rooms", "--Select Traders--", "--Select Rooms--", "Search", "Start Test", "Copy Results", "Send", "Reload Log List", "Done", "@Mention", "Private Chat", "Follow", "Mute", "Reset", "Save changes", "Refresh", "Download", "Close" (×19), `⠇` (×100).
**Modal titles (`inventory.modalsInDom`):** "Offline", "Debug Log", "Post Alert", **"Session Control"** (`modal-lg`, indices 52–55), "Download our mobile apps", "Q&A for Alert:", "Muted Chat Users", "Followed Chat Users" (×2), "Manage Scheduled Alerts" (`modal-xl`, `text-white`), plus a poll holder titled **"1 Enter your poll question:"** (`div.pollModalHolder`, index 39). Poll-panel window chrome buttons: title "Minimize" (`fa-window-minimize`), "Maximize" (`fa-window-maximize`), "Close" (`fa-times`).

**Placeholders (`inventory.inputs`, 74):**
- Chat composer: **"Type your message here.."** (`textarea` name `txt-area`).
- Q&A composer variant: **"Type your question here..."** (`textarea` name `txt-area`).
- Files: **"Search files..."** (`text`).
- **"Paste YouTube URL"** (`text`) — the presenter YouTube-embed input.
- Alert composer: **"Alert Text..."** (`textarea`), **"Link / URL to send to users"** (`url`), **"Image or Video Link to show"** (`url`), file input name `fuploadAlert`.
- Poll: **"Main poll question (i.e. Where do you think the market is going?)"** and **"Enter a choice (i.e. Up, Down, Sideways)"** (both `text`).
- Search: **"Type your search term"** (`search`, name `search-term-input`); scheduled alerts use a `datetime-local`; settings inputs: `app-color-theme` (radio), `pm-window-layout` (checkbox), `chat-text-color` (color), `chat-text-size` (number), `alert-donot-disturb` (checkbox), `volCtrl` (range).

**Links (`inventory.links`, 39):** brand `https://protradingroom.com/`; settings hash-routes `#user-app-settings`, `#user-alert-settings`, `#user-chat-settings`, `#user-audio-video-settings`; alert-composer tabs `#nav-text` "Text Alert", `#nav-url` "Text Url", `#nav-img` "Image / GIF / Video"; app stores (Google Play `com.belle…`, Apple `simpler-trading-mobile`); note-embedded content links (Google Docs, Workflowy `mtt-room-notes`, Google Drive, forms.gle, YouTube playlists, apextraderfunding/tradeify/bookmap affiliate ACT links, simplertrading.com replay pages).

---

## 7. What these presenter files UNIQUELY evidence (vs member / admin captures)

1. **Presenter chat-row chrome.** The `msg-box-adm` + `flex-row-reverse` mirrored row (avatar right at x≈310, timestamp left at x≈8, `msgMenu` kebab far-right at x≈349) with the `--*-msgs-bg-adm` background token — the presenter's own messages render mirrored vs members' left-aligned rows. Members cannot post admin rows.
2. **Presenter composer extras.** The **"Paste YouTube URL"** input, the Q&A composer ("Type your question here..."), and the `textAreaBtns` set (fa-plus / far fa-smile / fas fa-image) — a presenter-only rich composer beyond the member "Type your message here.." box.
3. **Poll-creation surfaces.** `div.pollModalHolder` ("Enter your poll question:") + `poll-panel` window (Minimize/Maximize/Close), inputs "Main poll question…" / "Enter a choice…", buttons **Add Choice**, **Save To Canned**, **Send Poll**. Members only vote.
4. **Alert authoring.** "Post Alert" modal with Text/Url/Image tabs, "Alert Text…", "Link / URL…", "Image or Video Link…", `fuploadAlert`, "Manage Scheduled Alerts" (`modal-xl`) with `datetime-local`, "Filter out alerts". Plus the per-alert **"Q&A for Alert:"** moderation modal and 41 `alert-qa` "Ask a question" affordances with answered-counts (`(n) ✅`).
5. **Session Control.** `modal-lg` titled "Session Control" (indices 52–55) + CSS `#session-control-modal` using `--session-control-dropdown-bg #0e3651` — a presenter session-management surface members never see.
6. **Moderation menus.** Archives → Alert Logs / Chat Logs / Transcript History; Manage Muted / Followed Users; user-context Follow/Mute/Private Chat; Debug Log modal; Reload Users / Sort Users. Presenter-tier tooling.
7. **Presenter-tier tokens & latent media CSS** (`--presenter-area-bg`, `--presenter-recording-color`, `--presenter-noRecording-color`) and the CSS for `.webcamsHolderScreen` (350×260 fixed bottom-right, `display:none`), `.soundcloud-options`/`.screen-options-start-screen` (350px panels), `.recording-reminder` — the presenter broadcast machinery, defined in CSS for this role.

---

## 8. Honest gaps

1. **The presenter media toolbar is NOT in the captured DOM.** A full-JSON leaf walk found the strings **"SoundCloud", "Screen Share", "ScreenShare", "WebCam", "TAWK", "Tawk", "Broadcast", "Go Live", "Start Broadcast" = ZERO occurrences** anywhere (elements/inventory/states). "Recording", "session-control", "presenter-recording", "fa-microphone", "soundcloud", "webcam" appear **only inside `stylesheets[*].text` (CSS rules)** and "Session Control" only as 4 `inventory.modalsInDom` titles (hidden modal shells). No rendered nav button/toggle for Recording / Mic / Screen Share / WebCam / SoundCloud / TAWK exists in `elements` or in any state's `.dropdown-menu.show`. → **These presenter affordances cannot be reconstructed pixel-perfect from this capture** (rect/computed-style absent). Only their CSS definitions are available: `.webcamsHolderScreen { width:350px; height:260px; position:fixed; bottom:0; right:0; z-index:100; border:1px solid rgb(250,250,250); cursor:move; background:#000; display:none }`; `.soundcloud-options/.screen-options-start-screen { background:var(--white); font-size:16px; width:350px; color:var(--darker-black); padding:5px }`; `.recording-reminder { position:absolute; top:50px; left:-50px; background:#fff; color:#000; width:160px; padding:5px…; font-size:12px }`; `#session-control-modal p { font-size:14px; margin-top:5px }`, `#session-control-modal .dropdown-menu { background:var(--session-control-dropdown-bg) }`. To decode the live toolbar, a new presenter capture must be taken with the media controls expanded/broadcasting.
2. **No "Streams" tab element.** `states/tab:Streams` exists as a key but its `#mainTabs` group renders the same 3 tabs (Screens/Notes/Files) — no Streams `li`/`a` was captured. Streams may be a sub-mode of Screens or was not present at capture.
3. **State node arrays are capped.** 46 state groups have `count > len(nodes)` (e.g. `app-presentationarea` count 438 but 22–177 sampled nodes; note bodies truncated mid-content, e.g. "OPEN TRADES FROM SQUEEZE ULTRA CLAS…" cut off). Full note DOM beyond the sample is not recoverable here.
4. **Text values are truncated** in `elements`/state nodes to ~35–45 chars in some captures (e.g. note tab labels, trade-log lines). Long labels end in "…"; exact full strings for note bodies are partial.
5. **`app-presentationarea` deep subtree is absent from top-level `elements`** — only present (capped) inside `states`. Any Screens-tab live media/screen-share stage content is not in `elements`.
6. **Theme is unstyled at capture** (`meta/theme` all blank, `dataTheme:null`) — both `--darkTheme-*` and `--lightTheme-*` banks exist but neither is applied; computed colors reflect the default (non-theme) cascade. The active theme's rendered appearance is not evidenced.
7. **SECONDARY is a different build/viewport** (§1) — do not treat its rects as interchangeable with PRIMARY's; use it only for role-invariant data (cssVariables, fonts, which are byte-identical).
8. **No inline SVGs captured** (`assets/inlineSvgs` = 0); icons are FontAwesome glyphs via `::before` content. `assets/images` (89) and `backgroundImages` (8, incl. one PTR ui-icons sprite + BS data-URI SVGs) are URLs/data-URIs only — no binary pixels.
