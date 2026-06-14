# file-1.html — Design System Spec (Part A: lines 1–1230)

Source: `/Users/billyribeiro/Desktop/pro-room/pro-room/files/file-1.html`, the index.html of the
real "Mastering The Trade" / Simpler Trading Angular app. Angular `[_ngcontent-ng-cXXXX]` attribute
markers are stripped below; the real selector is the class/id/element they attach to.

This slice covers: `<head>` (meta, external libs, fonts), an inline image-modal/chat `<script>`, the
Bootstrap-4-dark base theme tokens, the Bootstrap-5 token block, **two competing `:root` token sets**
(an old "dark/yellow" theme and a newer "blue" theme that overrides it), light/dark chat theme maps,
and the first big component-CSS block (presenter / screen-share / sidebar / navbar / poll+priv-chat
holders / volume controls).

---

## 1. External dependencies & fonts

### CDN stylesheets / libs (in `<head>`)
| Resource | URL | Version | Notes |
|---|---|---|---|
| FontAwesome | `https://use.fontawesome.com/releases/v5.8.1/css/all.css` | 5.8.1 | SRI integrity hash present, `crossorigin=anonymous`. Icons used as `fa`/`fa-1x`/`fa-download`. |
| animate.css | `https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.2/animate.min.css` | 3.7.2 | |
| Google Fonts — Lato | `@import "https://fonts.googleapis.com/css?family=Lato:400,700,400italic";` | — | The only **active** font import. |
| App bundle CSS | `styles.0d26360b9b3e223c.css` (`media="all"`, async `onload`, `<noscript>` fallback) | hashed | Angular build output (not in this slice). |
| Favicon | `https://cdn.simplertrading.com/2023/10/19112203/favicon.png` | — | `id="dynamic-favicon"`, can be swapped at runtime. |

### Commented-out (NOT loaded) font imports
Roboto, Source Sans Pro, Lato, Merriweather — all `@import`s are commented out in the first `<style>`.

### Inline JS (`<script>`)
jQuery-based (`$`), uses `bootbox.dialog` for image modals. Functions: `openImageModal`,
`downloadImage` (XHR blob download, strips `name_` prefix/suffix from filename), `removeImageFromChat`,
`showChatGif` (toggle `.d-none` on a sibling, "gif muted, click to show" / "click to hide").

### Font-family stacks (there are THREE, in order of precedence)
1. **Bootstrap-4 dark** `--font-family-sans-serif`:
   `"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`
2. **Bootstrap-5** `--bs-font-sans-serif`:
   `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, ...emoji`
3. **App effective font** `--app-font-family` — defined TWICE:
   - Old theme: `Arial, Helvetica, sans-serif !important`
   - **New theme (effective / wins): `"Open Sans", sans-serif !important`**
   (Note: "Open Sans" is referenced but NOT imported anywhere in this slice — likely loaded by the
   hashed bundle CSS. Worth confirming when rebuilding.)

Monospace (both BS4 & BS5): `SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`.

---

## 2. Theme tokens

There are several `:root` blocks. They REDEFINE the same names, so later blocks win. The important
distinction is the **OLD dark/yellow app theme** (first `--app-*` block, ~line 418) vs the **NEW blue
app theme** (second `--app-*` block, ~line 616) which is the one actually in effect.

### 2a. Bootstrap-4 dark palette (`:root`, ~line 177)
```
--blue:#375a7f  --indigo:#6610f2  --purple:#6f42c1  --pink:#e83e8c  --red:#e74c3c
--orange:#fd7e14 --yellow:#f39c12 --green:#00bc8c  --teal:#20c997  --cyan:#3498db
--white:#fff  --gray:#999  --gray-dark:#303030
--primary:#375a7f  --secondary:#444  --success:#00bc8c  --info:#3498db
--warning:#f39c12  --danger:#e74c3c  --light:#303030  --dark:#adb5bd
breakpoints: xs 0 / sm 576 / md 768 / lg 992 / xl 1200
```
Base `body`: font-size `0.9375rem`, weight 400, line-height 1.5, color `#fff`, bg `#222`.

### 2b. Bootstrap-5 token block (`:root`, ~line 258) — light defaults
Standard BS5.3 tokens. Highlights: `--bs-primary:#0d6efd`, `--bs-body-color:#212529`,
`--bs-body-bg:#fff`, `--bs-border-radius:0.375rem` (sm `0.25rem`, lg `0.5rem`, xl `1rem`,
xxl `2rem`, pill `50rem`), `--bs-border-color:#dee2e6`, box-shadow `0 0.5rem 1rem rgba(0,0,0,.15)`,
focus-ring color `rgba(13,110,253,.25)`. Breakpoints add `xxl:1400px`.
(These mostly get overridden by the dark app shell; the app forces `html,body { background:#fff; overflow:hidden !important }`.)

### 2c. Shared literal color tokens (present in BOTH app theme blocks)
```
--dark-gray:#aaa --darker-gray:#aaa6a6 --gray:#bbb --light-gray:#ccc --lighter-gray:#eee
--dark-black:#222 --darker-black:#111 --light-black:#373c42 --lighter-black:#3e444a
--light-green:#1edd6e --brown:#555 --light-brown:#8c8686 --dark-brown:#4b4b4b
--lighter-blue:#edf2f6 --white:#fff --black:#000 --yellow:#ff0 --fire-yellow:#f7fd37
--red:#f00 --light-blue:#40e0d0 --name-color:#c0d8ed
--transparent-gray:rgba(255,255,255,.331) --textarea-bg:var(--darker-black)
```

### 2d. App theme tokens — OLD (dark/yellow) vs NEW (blue). NEW is effective.

| Token | OLD (dark/yellow) | NEW (blue) — EFFECTIVE |
|---|---|---|
| `--app-font-family` | `Arial, Helvetica, sans-serif` | `"Open Sans", sans-serif` |
| `--app-link-color` | `#00bc8c` (teal) | `#45a2ff` (brand blue) |
| `--avatar-gear-icon-padding` | `5px 5.5px` | `3px 6px` |
| `--navbar-color` | `#fff` | `#fff` |
| `--navbar-bg` | `#000` | `#0c2434` (darkest navy) |
| `--sidebar-menu-bg` | `#000` | `#103d5c` (mid navy) |
| `--sidebar-menu-color` | `#ccc` | `#fff` |
| `--sidebar-menu-active-color` | `#f7fd37` (fire yellow) | `#45a2ff` |
| `--sidebar-navItem-border-color` | `transparent` | `#fff` |
| `--users-color` | `#fff` | `#fff` |
| `--users-border-color` | `#000` | `#fff` |
| `--presenter-noRecording-color` | `#f7fd37` | `#fff` |
| `--presenter-recording-color` | `#f00` | `#45a2ff` |
| `--textarea-holder-border-color` | `#fff` | `#0a6db1` (link-blue) |
| `--textarea-holder-btns-color` | `#bbb` | `#676767` |
| `--textarea-holder-btns-hover-color` | (n/a) | `#0a6db1` |
| `--presenter-area-bg` | `#111` | `#0f2e43` (navy) |
| `--tab-active-bg` | `#222` | `#45a2ff` |
| `--tabs-color` | `#fff` | `#fff` |
| `--note-tabs-color` | `#00bc8c` | `#fff` |
| `--notes-tabs-bg` | `#111` | `#0c2434` |
| `--tabs-dropdown-bg` | `#323232` | `#0f2e43` |
| `--tabs-dropdown-color` | `#777` | `#45a2ff` |
| `--tabs-border-color` | `#444` | `#0a6db1` |
| `--session-control-dropdown-bg` | `#222` | `#0e3651` |
| `--dropdown-divider-bg` | `#e9ecef` | `#45a2ff` |
| `--note-download-bg` | `#00bc8c` | `#92d528` (green) |
| `--note-delete-bg` | `#e74c3c` | `#bb352a` (red) |
| `--note-next-bg` | `#375a7f` | `#45a2ff` |
| `--note-options-color` | `#fff` | `#fff` |
| `--note-options-hover-color` | `#cccc`(sic) | `#212529` |
| `--note-options-bg` | `#111` | `#f4f4f4` |
| `--note-text-bg` | `#222` | `#fff` |
| `--note-text-color` | `#ccc` | `#676767` |
| `--file-download-bg` | `#00bc8c` | `#92d528` |
| `--file-delete-bg` | `#e74c3c` | `#bb352a` |
| `--file-see-more-bg` | `#375a7f` | `#45a2ff` |
| `--file-list-odd-bg` | `#fff` | `#fff` |
| `--file-list-even-bg` | `#f4f4f4` | `#f4f4f4` |
| `--file-name-color` | `#333` | `#0a6db1` |
| `--file-size-color` | `#b2b2b2` | `#b2b2b2` |
| `--file-searchbar-color` | `#b7b7b7` | `#b7b7b7` |
| `--file-searchbar-icon-color` | `#666666` | `#666666` |
| `--file-searchbar-bg` | `#fff` | `#fff` |
| `--msgs-header-color` | `#ccc` | `#fff` |
| `--msgs-header-bg` | `#111` | `#0a6db1` |
| `--split-gutter-bg` | `#000` | `#0a6db1` |
| `--split-gutter-color` | `#fff` | `#fff` |
| `--msgs-separator-color` | `#373c42` | `#fff` |
| `--msgs-separator-bg` | `#e8e8e8` | `#45a2ff` |
| `--msgs-separator-border-color` | `#373c42` | `#45a2ff` |
| `--sidebar-wrapper-bg-color` | (n/a here) | `#103d5c` |
| `--sidebar-wrapper-color` | (n/a here) | `#fff` |
| `--archives-dropdown-menu-bg-color` | `#fff` | `#0e3651` |
| `--archives-dropdown-menu-color` | `#222222` | `#45a2ff` |
| `--nickname-color` | (n/a here) | `#0a6db1` |
| `--rosterImg-border-radius` | `0` | `50%` |
| `--search-icon-bg-color` | `#adb5bd` | `#45a2ff` |
| `--search-icon-color` | `#222` | `#f4f4f4` |
| `--reload-icon-bg-color` | `#00bc8c` | `#f4f4f4` |
| `--reload-icon-color` | `#fff` | `#45a2ff` |
| `--users-badge-bg-color` | `#375a7f` | `#0e3651` |
| `--users-badge-color` | `#fff` | `#f4f4f4` |
| `--ptr-website-link-color` | `#00bc8c` | `#45a2ff` |
| `--mobileApp-info-bg-color` | `transparent` | `transparent` |
| `--mobileApp-info-color` | `#676767` | `#f4f4f4` |
| `--modal-content-bg-color` | `#303030` | `#103d5c` |
| `--modal-content-color` | `#fff` | `#f4f4f4` |
| `--modal-content-border-color` | `#444` | `#103d5c` |
| `--modal-tabs-border-color` | `#444` | `#45a2ff` |
| `--modal-active-tab-bg-color` | `#222` | `#45a2ff` |
| `--modal-active-tab-color` | `#00bc8c` | `#fff` |
| `--modal-active-tab-border-color` | `#444` | `#45a2ff` |
| `--checkbox-bg-color` | `#00bc8c` | `#45a2ff` |
| `--modal-btn-hover-opacity` | `0.9` | `0.9` |
| `--modal-btn-close-bg/border` | `#375a7f` | `#0a6db1` |
| `--modal-btn-success-bg/border` | `#00bc8c` | `#92d528` |
| `--modal-btn-danger-bg/border` | `#e74c3c` | `#bb352a` |
| `--modal-input-group-bg` | `#444` | `#0a6db1` |
| `--modal-upload-files-color` | `#555` | `#0a6db1` |
| `--modal-alert-link-color` | `#00bc8c` | `#0a6db1` |

**Brand blue ramp (NEW theme), darkest → lightest:**
`#0c2434` (navbar) · `#0e3651` (dropdowns/badges) · `#0f2e43` (presenter area) · `#103d5c` (sidebar/modal) · `#143c57` (dark msgs) · `#0a6db1` (link/accent) · `#45a2ff` (primary bright blue).

### 2e. Chat theme maps (`--lightTheme-*` / `--darkTheme-*`) — also redefined OLD vs NEW

Two driver classes consume these:
- `.lightTheme { --msg-bg, --msg-border-color, --date-color, --msg-color, --username-color, --msgs-bg, --msgs-bg-adm, --textarea-color, --textarea-bg, --user-location-color }`
- `.darkTheme { …same names mapped to `--darkTheme-*` }`

| Var | OLD lightTheme | NEW lightTheme | OLD darkTheme | NEW darkTheme |
|---|---|---|---|---|
| msg-bg | `#d9d9d9` | `#fff` | `#000` | `#0c2434`→ overridden `#143c57` |
| msg-border-color | `#d9d9d9` | `#e1e1e1` | `#393939` | `#f4f4f4` |
| date-color | `#8394a9` | `#a8a8a8` | `#8394a9` | `#a8a8a8` |
| msg-color | `#1a1a1a` | `#676767` | `#f7fd37` | `#fff` |
| username-color | `#000` | `#0a6db1` | `#c0d8ed` | `#0a6db1` |
| msgs-bg | `#f1f1f1` | `#fff` | `#111` | `#143c57` |
| msgs-bg-adm | `#e1e1e1` | `#f4f4f4` | `#000` | `#0f2e43` |
| textarea-color | `#555` | `#676767` | `#eee` | `#f4f4f4` |
| textarea-bg | `#fff` | `#fff` | `#111` | `#0c2434` |
| user-location-color | `#676767` | `#676767` | `#f7fd37` | `#f4f4f4` |
| roster-bg / -adm (OLD only) | `#f1f1f1` / `#e1e1e1` | — | `#111` / `#000` | — |
| chat-bg (OLD only) | `#eee` | — | `#000` | — |
| separator color/border/bg (OLD only) | `#373c42`/`#373c42`/`#e8e8e8` | — | `#aaa`/`#373c42`/`#222` | — |

All `--*Theme-*` values carry `!important`.

---

## 3. Per-component styles

Component CSS block scoped to `_ngcontent-ng-c977335924` (the room shell component).

### Global / base
- `html, body` → `height:100% !important`; later forced `background:#fff; overflow:hidden !important`.
- `body` (app) → `box-sizing:border-box; font-weight:300; font-family:var(--app-font-family); min-height:100vh / -webkit-fill-available`.
- `body` (shell, c977335924) → `width:100vw; height:100%`.
- `.container-fluid` → padding 0 (shell); also `height:100%;width:100%` in popover component (c4243810522).
- `.popOverDiv` → `padding:0 !important`.
- `*,*:before,*:after { box-sizing:border-box }`.
- `@media (max-width:600px)` → `html,body{overflow:hidden}`, body min-height fill-available.

### Navbar / sidebar menu
- `.navbar` → `padding:0; height:49px` (the canonical top-bar height — note `calc(100vh - 49px)` recurs).
- `.btnNavToggler` → `height:49px`.
- `.navbar-nav .fa-1x` → `font-size:25px !important`.
- `.sidebar-menu, .users, .helpLink, .navbar-nav li a` → `cursor:pointer; margin:0 5px`.
- `.sidebar-menu, .users, .helpLink` → `font-size:18px`.
- `.sidebar-menu` → `padding:1px 5px; border:1px solid transparent; bg:var(--sidebar-menu-bg); color:var(--sidebar-menu-color)`. `:hover` → `color:var(--lighter-gray)`.
- `.users` → `color:var(--users-color); border:1px solid var(--users-border-color); font-size:14px; padding:1px 5px`.
- `.active-icon` → `color/border:var(--sidebar-menu-active-color); border-radius:5px; transition:all .5s`.
- `.mobile-info-app-btn:hover` → `cursor:pointer`.
- `.brand-logo` → `max-width:200px; height:auto; max-height:40px`.

### Room sidebar wrapper (slide-out drawer, 250px)
- `.sidebar-wrapper` → `position:absolute !important; margin-left:-250px; top:0; height:calc(100vh - 49px); width:250px; bg/color via vars; z-index:3` (off-canvas, slides in).
- `.push-wrapper` → `left:250px; width:calc(100% - 250px)` (content pushed when drawer open).
- `.room-sidebar .navbar-nav` → `overflow:hidden auto !important`.
- `.room-sidebar .navbar-nav li` → `font-size:14px; font-weight:700; border-bottom:1px solid var(--sidebar-navItem-border-color); padding:5px 2px`. `:first-child` → weight 400.
- `… li p` → `margin-bottom:8px`; `… li hr` → `margin:5px 0`; `.saves-bandwidth` → `font-size:11px`; `.dropdown-toggle:after` → `float:right; margin:10px 10px 15px`.

### Split layout / gutters (Split.js)
- `.wrapper` → `position:relative; display:inline-block; margin-top:49px; color:var(--light-gray); bg:var(--darker-black)`.
- `.gutter` → `bg:var(--split-gutter-bg); background-repeat:no-repeat; background-position:50%`.
- `.gutter-horizontal` → `background-image:url(/static/img/grips/vertical.png); cursor:ew-resize; height:calc(100vh - 60px); z-index:5`.
- `.gutter-vertical` → `background-image:url(/static/img/grips/horizontal.png); cursor:ns-resize; z-index:5`.
- `.box-left, .box-right` → `height:calc(100vh - 60px)`.
- `#mainAreaSplit` → `height:calc(100vh - 49px); width:100vw`.
- `.h-inherit` → `height:inherit !important`; `.vh-100` → `height:100vh !important`; `.hidden` → `display:none`.
- `#connectedMsg` → `display:none`.

### Presenter / recording / screen-share controls
- `.notConnectedOverlay` → `display:block; position:absolute; bottom:5px; right:5px; z-index:10000; bg:#000; color:var(--presenter-noRecording-color); opacity:.7`.
- `.positionBtn` → `position:absolute; bottom:18px; right:5px; z-index:11; border/color:#00bc8c`. `:hover` → `color:#000; bg:#00bc8c`.
- `.updatePositionBtn` → same but `right:122px`.
- `.recIndicatorStart a` → `line-height:41px; color:#ff0`.
- `.talkingIndicator a` → `color:var(--presenter-noRecording-color)`.
- `.recIndicator a` → `color:var(--presenter-recording-color)` (also `line-height:41px`).
- `.talkingIndicator` → `max-width:400px; white-space:nowrap; text-overflow:ellipsis`. Its `a` → `display:inline-flex; align-items:center; width:inherit; max-height:47px`.
- `.talkingIndicator .talking-string` → `white-space:nowrap; overflow:auto hidden; width:100%; font-size:14px; margin:0 5px; height:100%; max-height:47px; max-width:250px`.

### Screen / presenter option dropdowns
- `.screen-options` → `bg:var(--white); font-size:16px; color:var(--darker-black); width:300px; padding:5px`. `a` → no underline. `li:hover` → `color:var(--brown); bg:var(--lighter-gray)`.
- `.soundcloud-options, .screen-options-start-screen` → like above but `width:350px`.
- Their `li:hover` (incl `.screen-options li:hover`) → `cursor:pointer; color:var(--light-black)`.
- `.screen-presenters span` → `font-size:14px`; `… li` → `padding 4px top/bottom`; `… i` → `vertical-align:middle; padding-right:5px`.
- `.screen-presenters-cmb` → `color:#fff !important; bg/border:#363f45; border-radius:3px`.
- `.presenter-img` → `max-width:28px`.

### Volume control
- `.volumeControl` → `text-align:center; color:var(--light-gray); bg:var(--darker-black); border:1px solid #fafafa`.
- `.audioVolSlider` → `bg:#fafafa`.
- `.volCtrl` → `bg:var(--darker-black); height:32px; width:129px`.
- `input[type=range]::-moz-range-progress` → `bg/border:#0d6efd; height:8px; border-radius:3px`.
- `input[type=range]::-moz-range-thumb` → `bg/border:#0d6efd; height:13px; width:13px`.
- `#dropdownVolume` → `width:40px`; `:after` hidden.

### Room sound options
- `.room-sound-options` → `text-align:left; padding-left:30px`.
- `.room-sound-options .form-check-label:hover` → `opacity:.85; cursor:pointer`.

### Theme picker (radio "themes")
- `.themes .form-check-input` → custom radio: `appearance:none; height/width:20px; border-radius:50%; bg:var(--light-gray); margin-right:.5rem; cursor:pointer; transition:all .15s ease-out; z-index:1000; inset:5px 0 0`.
- `:checked` → `bg:var(--checkbox-bg-color)`.
- `:checked:before` → content `"✔" (\2714)`, 20x20, font-size 20px, centered.
- `:checked:after` → ripple `animation: click-wave .65s` (keyframes: 40px→200px circle, opacity .35→0).
- `:checked + label` → `text-transform:uppercase; font-weight:700`.
- `.themes .form-check:hover` → `cursor:pointer`.

### Private chat holder (floating window)
- `.privChatHolder` → `display:none; position:fixed; left:50%; bottom:0; margin:0 auto; z-index:500; border:1px solid rgb(133,133,133); bg:#000; width:600px; height:400px; max-width:calc(100vw - 100px) !important; max-height:calc(100vh - 50px) !important; font-size:14px`.

### Poll modal holder (floating, centered)
- `.pollModalHolder` → `display:none; position:fixed; left:50%; top:50%; margin:0 auto; z-index:501; border:1px solid rgb(133,133,133); border-radius:4px; bg:#1e1e1e; width:580px; height:553px; max-width:calc(100vw - 100px) !important; max-height:calc(100vh - 50px) !important; font-size:14px; box-shadow:0 4px 20px #00000080; overflow:visible; padding:10px`.

---

## 4. Layout / structure hints

- **Top bar height = 49px** everywhere. Main content height = `calc(100vh - 49px)`; split gutters/boxes use `calc(100vh - 60px)` (49 + an extra ~11px).
- **Off-canvas sidebar**: `.sidebar-wrapper` is 250px, parked at `margin-left:-250px`; opening adds `.push-wrapper` to content (`left:250px; width:calc(100% - 250px)`). z-index: sidebar 3, gutters 5, position btns 11, poll modal 501, priv chat 500, notConnectedOverlay 10000.
- **DOM nesting** (from descendant selectors): `body > .container-fluid`; `.room-sidebar > .navbar-nav > li > (p | hr | .saves-bandwidth | .dropdown-toggle)`; `.navbar-nav > li > a`; `#mainAreaSplit` holds `.box-left`/`.box-right` separated by Split.js `.gutter`/`.gutter-horizontal`.
- **Floating windows** (`.privChatHolder`, `.pollModalHolder`) are `position:fixed; left:50%` and hidden by default (`display:none`), toggled by JS; both clamp to `calc(100vw-100px)` / `calc(100vh-50px)`.
- **Theme switching is class-based**: a parent gets `.lightTheme` or `.darkTheme`, which remap a shared set of `--msg-*`/`--msgs-*`/`--textarea-*` vars consumed by chat components downstream.
- **Responsive breakpoint in-range**: only one media query — `@media (max-width:600px)` locking overflow hidden + fill-available heights (mobile viewport handling). BS4 (576/768/992/1200) and BS5 (+1400) breakpoints are declared as tokens but no component queries here.
- **Recording UI**: a "talking" vs "recording" indicator pair share `line-height:41px` and color via `--presenter-noRecording-color` / `--presenter-recording-color`; both clamp height to ~47px.

### Notable: two-theme migration in progress
The file ships BOTH an old dark/teal-yellow palette (teal `#00bc8c`, fire-yellow `#f7fd37`) and a newer
navy-blue palette (blues `#45a2ff` / `#0a6db1` / `#0c2434`…). The blue block is declared later so it wins.
When rebuilding, **target the NEW blue theme** as the live design; the old values are legacy.
