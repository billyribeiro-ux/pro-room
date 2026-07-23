# proroom-ultra-member-room.json

- **path**: docs/reference/captures/proroom-ultra-member-room.json
- **kind**: json-capture
- **size**: 4,988,785 bytes (~4.76 MB / ~5 MB)
- **role**: member (+ how determined) — `meta.label` = `"member-room"` and `meta.url` = `https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1`. This is the member/attendee view of the "Mastering The Trade" room (`meta.title` = "Mastering The Trade"). No admin-only compose/moderation surfaces are present in the rendered `elements` (verified: `users-dropdown-options` = 0 rendered elements; `msg-box-adm` = 0 rendered elements — appears only in stylesheet text).
- **format/quality**: computed styles + rects (rich rendered-DOM capture). Top-level keys (via `Object.keys`): `meta, head, cssVariables, fonts, stylesheets, palette, elements, assets, inventory, errors`. Each of the 1,173 `elements` nodes has keys `path, tag, rect, attrs, style, before, after` (so per-node rect + computed style + pseudo-element `before`/`after`). This is a HIGH-authority rendered capture, not prose.

## surfaces documented
- Top chat tabs: **Main Chat** (active) and **Off Topic** (`.mainTabset .nav-link`, 2 labels only) — verified by extracting `nav-link` text.
- Presenter area: `presentation-box` (1 rendered `as-split-area presentation-box`, rect `{x:301,y:49,w:716,h:1195}`) with `webcamsHolder` card + `webcamsHolderVideo` `<video>` (rect ~320×240). So this member capture DOES include the presenter/webcam stage.
- Trade-alert stream: 50 `app-st-message` / 50 `msg-box` / 50 `msgMenu` (`⠇` kebab) / 50 `created-at` / 50 `alert-qa` message rows — a full member chat feed.
- Trade tickers: 13 rendered `tradeColor` elements with real content, e.g. `BUY +2 VERTICAL MP 100 18 JUN 26 65/60 P`, `SELL -1 MP 100 17 JUL 26 70 CALL @2.17 L`, `BUY +2 POET 100 17 JUL 26 12 CALL @2.47` — colored `rgb(69,162,255)` (`--app-link-color` #45a2ff).
- Headers: `alertHeader` (1) and `chatHeader` (1) navbars (`navbar navbar-expand-lg navbar-light chat-nav p-1`).
- Alerts container `app-alerts` (1), notes tab `noteTabset` (1) + `noteDownload` (1), files search `st-searchbar`, `files-tabs` (CSS + markers present).
- Roster: `room-roster` present (marker), `rosterImg` referenced (CSS `--rosterImg-border-radius:50%`).
- `inventory` block enumerates interactive controls: buttons ("Mobile App Info", "Sort by Trials", "Reload Users" `fa-sync`, "Sort Users" `fa-sort-alpha-down`, "Search Users" `fa-search`, "Mute"/"Mute Audio", "Ask a question" `alert-qa` with `(3) ✅`), plus `inputs, links, menus, modalsInDom, dataAttributes`.

## maps to (our components)
- Trade-alert message rows (`app-st-message`/`msg-box`/`msgMenu`/`created-at`) → our chat message list + message-context-menu components (reason: 1:1 rendered structure with kebab menu and timestamp).
- `mainTabset` (Main Chat / Off Topic) → our chat tab strip (reason: exact 2-tab label set).
- `presentation-box` + `webcamsHolder`/`webcamsHolderVideo` → our presenter stage / video area (reason: rects show the 716px-wide split area holding the video).
- `alert-qa` "Ask a question" button + `(3) ✅` counter → our Q&A / ask-question control.
- `tradeColor` spans → our trade-ticker inline link styling (`.tradeColor { color: var(--app-link-color); text-decoration: underline }`).
- `st-searchbar` / `files-tabs` / `noteTabset`+`noteDownload` → our files panel + notes panel.
- `cssVariables.root` (400+ vars) → our theme token map (single best source for exact palette).

## key findings (cited)
1. **Rendered app is in LIGHT theme**: the `app-room` element carries class `lightTheme` (only 1 element, verified). `meta.theme` = `{htmlClass:"", bodyClass:"", dataTheme:null}`. But the palette is still navy-dominant because component chrome uses fixed navy tokens (`--navbar-bg:#0c2434`, `--sidebar-wrapper-bg-color:#103d5c`, `--presenter-area-bg:#0f2e43`).
2. **Badges are IMG, not text** — confirmed by CSS: `.user-badge-img { width:auto; height:100%; max-height:20px }` (asset `badge.png` present in `assets.images`). NOTE: in THIS member capture there are 0 rendered `user-badge-img` DOM elements (member messages here carry no badge img); `user-badge-img` appears only inside `stylesheets` text. The prose-doc "New/Trial TEXT badge" claim is contradicted — CSS also defines `.new-badge, .trial-badge, .user-badge` but they are separate small (`font-size:11px`) pill classes.
3. **Exact theme tokens captured** (`cssVariables.root`, ~400 vars, identical `root` and `body` copies): `--success:#00bc8c`, `--primary:#375a7f`, `--app-link-color:#45a2ff`, `--tab-active-bg:#45a2ff`, `--msgs-header-bg:#0a6db1`, `--modal-content-bg-color:#103d5c`, `--darkTheme-msgs-bg:#143c57`, `--nickname-color:#0a6db1`, `--app-font-family:'Open Sans', sans-serif`, `--font-family-sans-serif` leads with `"Lato"`.
4. **Font Awesome 5.8.1** is the icon system — `head.stylesheetLinks[0]` = `https://use.fontawesome.com/releases/v5.8.1/css/all.css` (1,411 rules), `fonts.loaded` shows "Font Awesome 5 Free 400/900 loaded". Icons in `inventory` use `fas fa-*` classes.
5. **Palette frequency** (`palette.color`, by rendered pixel count): `rgb(33,37,41)` ×19,207 (body text `#212529`), `rgb(204,204,204)` ×744, `rgb(244,244,244)` ×406 (`--modal-content-color`), `rgb(69,162,255)` ×400 (`#45a2ff` links/active), `rgb(10,109,177)` ×79 (`#0a6db1`). Confirms #45a2ff as the dominant accent.
6. **Message-list semantics** verified: `.tradeColor` (link/underline), `.stockColor` (bold italic uppercase), `.questionColor` `rgb(32,149,242)`, `.mentionColor` `rgb(4,141,4)` italic, `.linkColor` `rgb(2,90,168)`, `.chat-reaction`/`.chat-reaction-added` (reaction pills) — all defined in captured stylesheet; drives message rich-text rendering.

## notes
- **Best-authority flag**: this is a rich rendered capture (computed styles + rects + pseudo-elements + full stylesheet text + inventory). For MEMBER-view layout/spacing/colors it is the primary authority over any `docs/reference/*.md` prose.
- Viewport `1017×1244` @ dpr 2, `meta.tooNarrow:true` — captured at a narrow/mobile-ish width; some responsive rules (`max-width:600px` block, `alert-chat-box-sm`) may apply. Rects reflect this narrow layout, not a wide desktop.
- `errors` = `[]` (clean capture). `elementsCapped:false` (not truncated). `stylesheets` = 41 sheets (full CSS text embedded, incl. app `styles.0d26360b9b3e223c.css`).
- `assets` object has `images, backgroundImages, inlineSvgs` sub-keys (embedded asset inventory).
- `users-dropdown-options`, `msg-box-adm`, `replyModal`, `webcamholder`(lowercase), `avsettings`, `appusersettings` = 0 rendered elements (present only in CSS text if at all) — consistent with member (non-admin) scope.
- Duplicate/superset: `cssVariables.root` and `cssVariables.body` are byte-identical duplicates of the same ~400-var map.
