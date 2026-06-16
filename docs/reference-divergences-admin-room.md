# Reference Divergences — Admin Room Capture

Forensic side-by-side comparison of **`proroom-ultra-admin-room.json`** (protradingroom.com, admin view of *“Mastering The Trade”*, viewport 1989×1166@2x) against our SvelteKit repo. The reference is the source of truth.

- **Generated:** 2026-06-16 from a 14 MB capture (2639 elements w/ computed styles, 294 CSS tokens, 100 modals, 230 controls, 200 menus).
- **Method:** 10 parallel Opus 4.8 sub-agents, one per surface, each grounding every divergence in BOTH the reference computed style/class AND our actual code (`file:line`). No assumptions.
- **Total divergences: 146** — 2 critical, 27 high, 34 medium, 40 low, 43 cosmetic.

## ⚠️ Open question — reference sources disagree (do NOT assume)

Two values differ between reference captures, so they are flagged for a decision rather than treated as settled:

- **Modal chrome: navy vs Darkly.** Both "Mastering The Trade" captures provided (`proroom-presenter-deep.json` + `proroom-ultra-admin-room.json`, identical 294-token sets) show **navy** modal tokens (`--modal-content-bg-color #103d5c`, text `#f4f4f4`, success `#92d528`, danger `#bb352a`, close `#0a6db1`, active-tab `#45a2ff`), and in these files the `.modal-content` cascade resolves to navy. A **Darkly-gray** modal set (`#303030` / `#00bc8c` / `#e74c3c` / `#375a7f`) exists in **another capture file** (not in these two — here `#303030` is only the Darkly base globals `--gray-dark`/`--light`). Our build currently ships Darkly gray. This is likely a **per-room theme / app-version difference** — needs confirmation of which theme is the target before changing anything.
- **Roster avatars:** these captures show `--rosterImg-border-radius: 50%` (circular). Our sidebar renders them square. (Per-message avatar radius uses a separate selector, unconfirmed.) Same caveat — confirm the target theme.

## Summary by surface

| Surface | Total | 🔴 | 🟠 | 🟡 | 🔵 | ⚪ |
|---|--:|--:|--:|--:|--:|--:|
| DESIGN TOKENS / CSS VARIABLES | 13 |  | 4 | 3 | 3 | 3 |
| TOP NAV + ADMIN BROADCAST CONTROLS | 17 | 1 | 4 | 3 | 5 | 4 |
| SIDEBAR / USER ROSTER | 20 |  | 3 | 5 | 5 | 7 |
| PRESENTATION / STAGE | 15 |  | 1 | 2 | 5 | 7 |
| WEBCAMS | 11 |  | 1 | 3 | 2 | 5 |
| ALERTS PANEL | 12 |  | 1 | 2 | 3 | 6 |
| CHAT PANEL | 17 |  | 4 | 4 | 6 | 3 |
| MODALS INVENTORY | 17 | 1 | 4 | 5 | 5 | 2 |
| BUTTONS / CONTROLS / INPUTS | 15 |  | 5 | 5 | 3 | 2 |
| 50 TARGETED KEY ELEMENTS | 9 |  |  | 2 | 3 | 4 |

## ⚡ Priority queue — Critical & High (fix first)

1. **🔴 CRITICAL** · _TOP NAV + ADMIN BROADCAST CONTROLS_ · **Inline admin broadcast control cluster does not exist in the reference nav** — ref `The ADMIN capture's nav right cluster (ul.navbar-nav.ml-auto, topnav[9]) contains ONLY li.` vs ours `We render a full broadcast cluster inline in the nav via {@r` (web/src/lib/components/RoomTopNav.svelte:112-114 (.nav-controls render) + web/src/routes/rooms/[id]/+page.svelte:431-540 (stageActions snippet))
2. **🔴 CRITICAL** · _MODALS INVENTORY_ · **Modal shell bg is Darkly GRAY, reference is NAVY #103d5c** — ref `--modal-content-bg-color: #103d5c (tokens.json:42); used as modal-content background` vs ours `--modal-bg: #303030` (web/src/routes/layout.css:36)
3. **🟠 HIGH** · _DESIGN TOKENS / CSS VARIABLES_ · **Modal background is Darkly gray, reference modal is navy** — ref `--modal-content-bg-color = #103d5c and --modal-content-border-color = #103d5c (navy, same ` vs ours `--modal-bg: #303030 (Bootswatch Darkly gray)` (web/src/routes/layout.css:36)
4. **🟠 HIGH** · _DESIGN TOKENS / CSS VARIABLES_ · **Modal success button green wrong** — ref `--modal-btn-success-bg = #92d528 and --modal-btn-success-border = #92d528 (lime green, sam` vs ours `--modal-success: #00bc8c (Darkly teal)` (web/src/routes/layout.css:41)
5. **🟠 HIGH** · _DESIGN TOKENS / CSS VARIABLES_ · **Modal danger button red wrong** — ref `--modal-btn-danger-bg = #bb352a and --modal-btn-danger-border = #bb352a (brick red, same a` vs ours `--modal-danger: #e74c3c (Darkly red)` (web/src/routes/layout.css:42)
6. **🟠 HIGH** · _DESIGN TOKENS / CSS VARIABLES_ · **Modal active-tab color wrong** — ref `--modal-active-tab-bg-color = #45a2ff and --modal-active-tab-border-color = #45a2ff, --mod` vs ours `--modal-active-tab: #00bc8c (Darkly teal)` (web/src/routes/layout.css:43)
7. **🟠 HIGH** · _TOP NAV + ADMIN BROADCAST CONTROLS_ · **Go-live control: reference has none in nav; ours uses fa-broadcast-tower** — ref `MISSING from nav (no go-live/broadcast button in any captured nav node)` vs ours `<Icon name="broadcast-tower"> with title 'Go live'/'End broa` (web/src/routes/rooms/[id]/+page.svelte:520-529)
8. **🟠 HIGH** · _TOP NAV + ADMIN BROADCAST CONTROLS_ · **Record control: reference has none in nav; ours uses fa-dot-circle** — ref `MISSING from nav. Note: the reference DOES have a recIndicator '[ REC ]' text badge (li.re` vs ours `<Icon name="dot-circle"> title 'Record', opens showRecPrevie` (web/src/routes/rooms/[id]/+page.svelte:516-518)
9. **🟠 HIGH** · _TOP NAV + ADMIN BROADCAST CONTROLS_ · **Screen-share / camera / mic / CC / music controls absent from reference nav** — ref `MISSING from nav — no fa-desktop, fa-video, fa-microphone (toggle), fa-closed-captioning, ` vs ours `stageActions renders desktop/stop-circle, video/video-slash,` (web/src/routes/rooms/[id]/+page.svelte:432-512)
10. **🟠 HIGH** · _TOP NAV + ADMIN BROADCAST CONTROLS_ · **Members control: reference has none in nav; ours uses fa-cog** — ref `MISSING from nav. (A 'General Settings' fa-cogs item exists but only inside the off-canvas` vs ours `<Icon name="cog"> title 'Members', toggles showMembers, gate` (web/src/routes/rooms/[id]/+page.svelte:530-538)
11. **🟠 HIGH** · _SIDEBAR / USER ROSTER_ · **Extra 'Audio/Video Settings' nav item not in reference** — ref `Sidebar nav items are exactly: Connectivity Check, General Settings, Archives, Manage Mute` vs ours `Extra nav-item 'Audio/Video Settings' (fa-video) opening AVS` (web/src/lib/components/RoomSidebar.svelte:93-102)
12. **🟠 HIGH** · _SIDEBAR / USER ROSTER_ · **Entire 'Admin' sub-group absent from reference sidebar** — ref `No Admin group, no All Private Messages / Play YouTube / Session Control / Debug Log items` vs ours `{#if canManage} block renders a .group with group-head 'Admi` (web/src/lib/components/RoomSidebar.svelte:174-214)
13. **🟠 HIGH** · _SIDEBAR / USER ROSTER_ · **Roster avatars square instead of circular** — ref `--rosterImg-border-radius: 50% (tokens.json) → circular gravatars.` vs ours `border-radius: 0 on .avatar with comment claiming reference ` (web/src/lib/components/RoomSidebar.svelte:591-593)
14. **🟠 HIGH** · _PRESENTATION / STAGE_ · **Zoom buttons use wrong (Bootstrap-4) .btn-dark fill — light gray instead of dark** — ref `COMPUTED background-color rgb(33,37,41)=#212529, color rgb(255,255,255) (BS5 .btn-dark --b` vs ours `background-color rgb(173,181,189)=#adb5bd, color rgb(34,34,3` (web/src/lib/components/ScreenStage.svelte:267-271 (.btn-dark) + comment 248-249 calling it a 'LIGHT-gray pill')
15. **🟠 HIGH** · _WEBCAMS_ · **Name label renders presenter text; reference has none** — ref `h5.pNameLabel.m-0 contains ONLY span.closeIcon (the X). No presenter-name text node in eit` vs ours `h5.name renders `{publisher.name ?? 'Presenter'}{publisher.i` (web/src/lib/components/WebcamHolder.svelte:106-108)
16. **🟠 HIGH** · _ALERTS PANEL_ · **Body not indented under avatar/username gutter** — ref `div.text-formated body left edge at x=66 (indented past the avatar column + pl), margin-le` vs ours `margin: 0.35rem 8px 0 8px — body starts ~8px from the panel ` (web/src/lib/components/AlertFeed.svelte:651-652 (.body margin))
17. **🟠 HIGH** · _CHAT PANEL_ · **Username color is black, reference is room-blue** — ref `strong.username computed color rgb(10,109,177)=#0a6db1 (matchedRule color:var(--username-c` vs ours `#000` (web/src/lib/components/ChatPanel.svelte:256 (style:color={m.author_color ?? '#000'}) and :574 (.username color:#000))
18. **🟠 HIGH** · _CHAT PANEL_ · **Message body color too dark** — ref `div.msg-left computed color rgb(103,103,103)=#676767 (--lightTheme-msg-color)` vs ours `#1a1a1a` (web/src/lib/components/ChatPanel.svelte:598 (.body color:#1a1a1a))
19. **🟠 HIGH** · _CHAT PANEL_ · **Header invents Main Chat / Off Topic tabs not in reference** — ref `No tab bar exists; reference chat/alerts header is nav.chat-nav with a navbar-brand text l` vs ours `Two-button role=tablist with Main Chat / Off Topic (folder-t` (web/src/lib/components/ChatPanel.svelte:163-178 (.tabs tablist) and :342-382 (tab CSS))
20. **🟠 HIGH** · _CHAT PANEL_ · **Uploaded images replace the avatar instead of rendering in-body** — ref `An image message keeps the 35px avatar AND renders a separate div.img-container > img.uplo` vs ours `image_url is rendered AS the avatar (36px square), replacing` (web/src/lib/components/ChatPanel.svelte:250-254 (img.avatar-img branch on m.image_url))
21. **🟠 HIGH** · _MODALS INVENTORY_ · **Modal border color #444 vs reference #103d5c** — ref `--modal-content-border-color: #103d5c (tokens.json:127) — same as bg, so the content edge ` vs ours `--modal-border: #444` (web/src/routes/layout.css:39)
22. **🟠 HIGH** · _MODALS INVENTORY_ · **Close button bg #375a7f vs reference #0a6db1** — ref `--modal-btn-close-bg: #0a6db1, --modal-btn-close-border: #0a6db1 (tokens.json:251,41)` vs ours `--modal-close-bg: #375a7f` (web/src/routes/layout.css:40)
23. **🟠 HIGH** · _MODALS INVENTORY_ · **Success button lime #92d528 vs our teal #00bc8c** — ref `--modal-btn-success-bg / -border: #92d528 (tokens.json:182,26)` vs ours `--modal-success: #00bc8c` (web/src/routes/layout.css:41)
24. **🟠 HIGH** · _MODALS INVENTORY_ · **Active-tab accent #00bc8c vs reference #45a2ff** — ref `--modal-active-tab-bg-color: #45a2ff, --modal-active-tab-color: #fff, --modal-tabs-border-` vs ours `--modal-active-tab: #00bc8c` (web/src/routes/layout.css:43)
25. **🟠 HIGH** · _BUTTONS / CONTROLS / INPUTS_ · **No Bootstrap / no shared button primitive** — ref `Stock Bootstrap 5 .btn system: every button is .btn + a variant (btn-secondary/dark/primar` vs ours `No bootstrap dependency in package.json; no shared Button co` (web/package.json (no bootstrap); web/src/routes/layout.css:101 (only a bare button{} reset); per-component <style> blocks)
26. **🟠 HIGH** · _BUTTONS / CONTROLS / INPUTS_ · **Sidebar search button inverts btn-default colors** — ref `search-room-users is 'btn btn-sm btn-default': background #f4f4f4, icon color #45a2ff (sam` vs ours `.mini-search background #45a2ff, color #f4f4f4 (the INVERSE ` (web/src/lib/components/RoomSidebar.svelte:557-561)
27. **🟠 HIGH** · _BUTTONS / CONTROLS / INPUTS_ · **btn-outline-* user-menu variants all rendered as one filled style** — ref `User menu uses distinct BS outline variants: @Mention=btn-outline-light (transparent bg, #` vs ours `All four are class='action' with identical fill: background ` (web/src/lib/components/modals/UserInfoModal.svelte:36-56,202-214)
28. **🟠 HIGH** · _BUTTONS / CONTROLS / INPUTS_ · **Chat composer is a pill with rounded Send, reference is flat icon row** — ref `Composer = 'txt-area form-control border-0' textarea + flat textAreaBtns icon buttons (26x` vs ours `.pill wrapper border-radius:999px containing textarea + .ic ` (web/src/lib/components/ChatPanel.svelte:280-298,617-678)
29. **🟠 HIGH** · _BUTTONS / CONTROLS / INPUTS_ · **Modal form-control inputs use dark Darkly fill, reference is white BS form-control** — ref `Stock BS5 form-control: background #fff (--bs-body-bg), color #212529, 1px solid #ced4da b` vs ours `Modal inputs (.term, .date input, .field) use background var` (web/src/lib/components/modals/AdvancedSearchModal.svelte:171-181,217-225; web/src/lib/components/DialogHost.svelte:88-98; web/src/lib/components/Modal.svelte:111-118)

---

## DESIGN TOKENS / CSS VARIABLES

> The reference exposes 294 named CSS custom properties on :root (171 project-specific room/panel/modal/chat/alert/sidebar/file/note/ticker tokens + 123 Bootstrap --bs-* tokens). Our SvelteKit app uses a completely different, condensed abstraction of ~21 semantic tokens (--bg, --bg-elev, --accent, --modal-bg, etc.) in web/src/routes/layout.css; NONE of the reference token NAMES exist in our :root, so any third-party CSS or markup that consumed reference names would break. The core navy room colors that overlap conceptually DO match in value (#0c2434 / #0f2e43 / #103d5c / #45a2ff / #0a6db1 / #92d528 / #bb352a), but our MODAL token block diverges hard: we ship Bootswatch "Darkly" gray modals (#303030 / #00bc8c / #e74c3c) whereas the reference modal is NAVY (#103d5c bg, #f4f4f4 text, #92d528 success, #bb352a danger, #45a2ff active tab). Fonts: we correctly self-host Open Sans (reference --app-font-family) and pin Font Awesome to the exact 5.8.1, but we do NOT load Lato (reference --font-family-sans-serif primary, fonts.loaded Lato 400/700/italic) nor the summernote editor font.

<details><summary>Reference facts this diff is grounded in</summary>

- tokens.json cssVariables.root has 294 entries; 171 are project-specific (non --bs-*), 123 are Bootstrap --bs-*.
- Reference room/panel bg tokens: --navbar-bg=#0c2434, --notes-tabs-bg=#0c2434, --darkTheme-textarea-bg=#0c2434, --presenter-area-bg=#0f2e43, --darkTheme-msgs-bg-adm=#0f2e43, --tabs-dropdown-bg=#0f2e43, --sidebar-wrapper-bg-color=#103d5c, --sidebar-menu-bg=#103d5c, --modal-content-bg-color=#103d5c.
- Reference accent/link tokens: --app-link-color=#45a2ff, --ptr-website-link-color=#45a2ff, --sidebar-menu-active-color=#45a2ff, --tab-active-bg=#45a2ff, --checkbox-bg-color=#45a2ff, --search-icon-bg-color=#45a2ff, --msgs-separator-bg=#45a2ff; darker link blue --msgs-header-bg=#0a6db1, --nickname-color=#0a6db1, --file-name-color=#0a6db1, --split-gutter-bg=#0a6db1, --tabs-border-color=#0a6db1, --modal-btn-close-bg=#0a6db1.
- Reference status colors: --file-download-bg / --note-download-bg / --modal-btn-success-bg=#92d528 (green positive); --note-delete-bg / --file-delete-bg / --modal-btn-danger-bg=#bb352a (red negative); --warning=#F39C12.
- Reference MODAL tokens (project-specific, NAVY not Darkly): --modal-content-bg-color=#103d5c, --modal-content-border-color=#103d5c, --modal-content-color=#f4f4f4, --modal-btn-success-bg=#92d528, --modal-btn-danger-bg=#bb352a, --modal-active-tab-bg-color=#45a2ff, --modal-active-tab-color=#fff, --modal-input-group-bg=#0a6db1, --modal-btn-close-bg=#0a6db1, --modal-alert-link-color=#0a6db1, --modal-upload-files-color=#0a6db1.
- Reference ALSO defines Bootswatch-Darkly base tokens separately: --light=#303030, --gray-dark=#303030, --success=#00bc8c, --danger=#E74C3C, --primary=#375a7f, --secondary=#444, --info=#3498DB, --warning=#F39C12 — these are the Darkly globals, distinct from the navy --modal-* tokens that actually skin the modals.
- Reference dark-theme chat/message tokens: --darkTheme-chat-bg=#000, --darkTheme-msgs-bg=#143c57, --darkTheme-msgs-bg-adm=#0f2e43, --darkTheme-msg-bg=#000, --darkTheme-msg-color=#fff, --darkTheme-nickname-color=#c0d8ed, --darkTheme-username-color=#0a6db1, --darkTheme-roster-bg=#111, --darkTheme-msgs-separator-bg=#222, --name-color=#c0d8ed.
- Reference light-theme chat tokens: --lightTheme-chat-bg=#eee, --lightTheme-msgs-bg=#fff, --lightTheme-msg-color=#676767, --lightTheme-roster-bg=#f1f1f1, --lightTheme-roster-bg-adm=#e1e1e1, --lightTheme-username-color=#0a6db1, --lightTheme-msgs-separator-bg=#e8e8e8.
- Reference file-panel tokens: --file-list-even-bg=#f4f4f4, --file-list-odd-bg=#fff, --file-searchbar-bg=#fff, --file-searchbar-color=#b7b7b7, --file-searchbar-icon-color=#666666, --file-size-color=#b2b2b2, --file-name-color=#0a6db1, --file-see-more-bg=#45a2ff.
- Reference fonts.loaded = [Font Awesome 5 Brands, Font Awesome 5 Free 400, Font Awesome 5 Free 900, Lato italic 400, Lato 400, Lato 700, summernote 400]. head.stylesheetLinks loads use.fontawesome.com v5.8.1 + animate.css 3.7.2. --app-font-family='Open Sans', sans-serif; --font-family-sans-serif puts "Lato" first.
- Reference avatar/roster/webcam tokens: --rosterImg-border-radius=50%, --avatar-gear-icon-padding=3px 6px, --users-badge-bg-color=#0e3651, --users-badge-color=#f4f4f4, --users-border-color=#fff, --session-control-dropdown-bg=#0e3651, --archives-dropdown-menu-bg-color=#0e3651.

</details>

### 🟠 HIGH — Modal background is Darkly gray, reference modal is navy
`background`

- **Reference:** --modal-content-bg-color = #103d5c and --modal-content-border-color = #103d5c (navy, same as the room's --bg-elev-2)
- **Ours:** --modal-bg: #303030 (Bootswatch Darkly gray)
- **Location:** web/src/routes/layout.css:36
- **Fix / why:** The reference modal is navy #103d5c, NOT Darkly gray. Our comment at layout.css:33-37 explicitly (and wrongly) claims modals are 'ALWAYS dark (Bootstrap Darkly)' citing report.md §07 — MEMORY note 'report §07 modal tokens wrong' confirms that report table was a mistake; the reference's own --modal-content-bg-color proves modals are navy. Fix: set our modal bg token to #103d5c.

### 🟠 HIGH — Modal success button green wrong
`color`

- **Reference:** --modal-btn-success-bg = #92d528 and --modal-btn-success-border = #92d528 (lime green, same as --file-download-bg)
- **Ours:** --modal-success: #00bc8c (Darkly teal)
- **Location:** web/src/routes/layout.css:41
- **Fix / why:** Reference modal success buttons are lime #92d528 (the app's --positive green), not Darkly teal #00bc8c. #00bc8c is the reference --success Darkly GLOBAL but is NOT what skins modal buttons. Align --modal-success to #92d528.

### 🟠 HIGH — Modal danger button red wrong
`color`

- **Reference:** --modal-btn-danger-bg = #bb352a and --modal-btn-danger-border = #bb352a (brick red, same as --note-delete-bg)
- **Ours:** --modal-danger: #e74c3c (Darkly red)
- **Location:** web/src/routes/layout.css:42
- **Fix / why:** Reference modal danger buttons are brick #bb352a (the app's --negative), not Darkly #e74c3c (#E74C3C is the reference --danger global, unused for modal buttons). Align --modal-danger to #bb352a.

### 🟠 HIGH — Modal active-tab color wrong
`color`

- **Reference:** --modal-active-tab-bg-color = #45a2ff and --modal-active-tab-border-color = #45a2ff, --modal-active-tab-color = #fff (bright accent blue)
- **Ours:** --modal-active-tab: #00bc8c (Darkly teal)
- **Location:** web/src/routes/layout.css:43
- **Fix / why:** Reference modal active tab uses the bright accent #45a2ff, not teal #00bc8c. Align --modal-active-tab to #45a2ff.

### 🟡 MEDIUM — Entire reference token namespace (171 project tokens) is absent from our :root
`structure`

- **Reference:** 294 named custom properties on :root: 171 project-specific (--navbar-bg, --presenter-area-bg, --sidebar-wrapper-bg-color, --msgs-header-bg, --nickname-color, --file-*-bg, --note-*-bg, --modal-*, --darkTheme-*, --lightTheme-*, --tab-active-bg, --tabs-*, etc.) + 123 Bootstrap --bs-*
- **Ours:** ~21 condensed semantic tokens only (--bg, --bg-elev, --bg-elev-2, --border, --text, --text-dim, --accent, --accent-hover, --positive, --negative, --warn, --username-color, --ticker-color, --msg-font-size, --radius, --modal-bg, --modal-color, --modal-border, --modal-close-bg, --modal-success, --modal-danger, --modal-active-tab, --modal-input-bg, --modal-btn-primary, --modal-btn-secondary, --font-sans). No reference token NAME is defined.
- **Location:** web/src/routes/layout.css:7-53
- **Fix / why:** This is a deliberate abstraction, not a per-token mismatch — values mostly match where concepts overlap (see below). It only becomes a defect if any markup/3rd-party CSS expects a reference name; our components reference reference names ONLY in comments, except --ptr-link-color (see separate item). Acceptable as an architectural choice; flagged so the namespace gap is on record.

### 🟡 MEDIUM — Modal input/close-button background wrong
`color`

- **Reference:** --modal-input-group-bg = #0a6db1 and --modal-btn-close-bg = #0a6db1 (darker link blue)
- **Ours:** --modal-input-bg: #444 (Darkly gray) and --modal-close-bg: #375a7f (Darkly primary)
- **Location:** web/src/routes/layout.css:40,44
- **Fix / why:** Reference modal input groups and the close button use the room's darker link blue #0a6db1; we use Darkly gray #444 / Darkly primary #375a7f. Align both to #0a6db1.

### 🟡 MEDIUM — Modal border color wrong
`border`

- **Reference:** --modal-content-border-color = #103d5c (navy, equal to modal bg → borderless look)
- **Ours:** --modal-border: #444 (Darkly gray)
- **Location:** web/src/routes/layout.css:39
- **Fix / why:** Reference modal border equals its navy bg (#103d5c). Our #444 gray border reads as a visible Darkly frame. Set --modal-border to #103d5c (or the room --border) for the navy modal look.

### 🔵 LOW — Modal text color slightly off
`color`

- **Reference:** --modal-content-color = #f4f4f4 (off-white)
- **Ours:** --modal-color: #ffffff (pure white)
- **Location:** web/src/routes/layout.css:38
- **Fix / why:** Comment at layout.css:37 claims reference --modal-content-color is pure #fff, but the capture shows #f4f4f4. Change --modal-color to #f4f4f4 and correct the comment (comment-vs-code drift against the real reference value).

### 🔵 LOW — Lato font not loaded
`font`

- **Reference:** fonts.loaded includes Lato italic/400, Lato 400, Lato 700; --font-family-sans-serif = "Lato", -apple-system, ... (Lato is the FIRST family in the reference's primary sans stack)
- **Ours:** app.html line 10 loads Open Sans + Lato 400/700 via Google Fonts <link>, BUT +layout.svelte:5-9 only self-hosts @fontsource/open-sans (300/400/600/700/400-italic); no @fontsource Lato import. --font-sans (layout.css:50-52) lists 'Open Sans','Lato',... so Lato is a fallback only.
- **Location:** web/src/routes/+layout.svelte:5-9; web/src/routes/layout.css:50-52
- **Fix / why:** Open Sans is the reference EFFECTIVE app font (--app-font-family) so leading with Open Sans is correct. Lato is the reference's Bootstrap --font-family-sans-serif primary; we reference it as a fallback and pull it via the Google Fonts link in app.html but don't self-host it. Low impact since Open Sans wins; note it for completeness — if any element relies on the Bootstrap sans stack it would get Lato in the reference and Open Sans for us.

### 🔵 LOW — summernote editor font missing
`missing-feature`

- **Reference:** fonts.loaded includes 'summernote | normal | 400' with @font-face src summernote.woff2/woff/ttf (the rich-text editor's icon/glyph font)
- **Ours:** MISSING — no summernote font loaded; rich-text editor is RichTextEditorModal.svelte without the summernote glyph font
- **Location:** n/a (not implemented)
- **Fix / why:** The reference's Summernote WYSIWYG ships its own icon font. Our editor is a custom Svelte component, so the exact font is not strictly required, but toolbar glyphs that depend on it would be absent. Low priority unless pixel-matching the editor toolbar.

### ⚪ COSMETIC — --ptr-link-color consumed live but never defined
`behavior`

- **Reference:** --ptr-website-link-color = #45a2ff and --app-link-color = #45a2ff define the autolink color
- **Ours:** MessageBody.svelte:52 uses color: var(--ptr-link-color, #45a2ff) but --ptr-link-color is NOT declared in our :root (theme.svelte.ts ThemeTokens has no such key), so it ALWAYS resolves to the #45a2ff fallback
- **Location:** web/src/lib/components/MessageBody.svelte:52
- **Fix / why:** Value is correct by luck (fallback #45a2ff == reference). But the token name is dead — it can never be themed and is the only reference-derived name we consume live without defining. Either define it in :root or drop the indirection and use --accent.

### ⚪ COSMETIC — Font Awesome version matches exactly
`font`

- **Reference:** head.stylesheetLinks loads https://use.fontawesome.com/releases/v5.8.1/css/all.css; fonts.loaded = Font Awesome 5 Free 400/900 + Brands
- **Ours:** @fortawesome/fontawesome-free pinned to 5.8.1 (package.json:46), imported in +layout.svelte:11
- **Location:** web/package.json:46; web/src/routes/+layout.svelte:11
- **Fix / why:** MATCH — exact same Font Awesome 5.8.1 Free icon set. No action needed; recorded as a confirmed match per the no-invented-divergences rule.

### ⚪ COSMETIC — Core navy/accent/status palette values match (conceptual mapping)
`color`

- **Reference:** --navbar-bg/--notes-tabs-bg #0c2434; --presenter-area-bg/--msgs-bg-adm #0f2e43; --sidebar-wrapper-bg/--modal-content-bg #103d5c; --app-link-color/--tab-active-bg #45a2ff; --msgs-header-bg/--nickname-color #0a6db1; --file-download-bg #92d528; --note-delete-bg #bb352a; --warning #F39C12
- **Ours:** --bg #0c2434, --bg-elev #0f2e43, --bg-elev-2 #103d5c, --accent #45a2ff, --accent-hover #0a6db1, --positive #92d528, --negative #bb352a, --warn #f39c12, --username-color #0a6db1, --ticker-color #1a1a1a
- **Location:** web/src/routes/layout.css:10-30; web/src/lib/stores/theme.svelte.ts:34-48
- **Fix / why:** MATCH (values, not names) — our 5 core room colors, accent pair, and positive/negative/warn all equal the reference values exactly (case-insensitive: --warn #f39c12 vs reference #F39C12). --ticker-color #1a1a1a corresponds to the reference rgb(26,26,26) ticker color (palette count 98). Recorded as a confirmed value match; the only gap is the naming abstraction noted above.

---

## TOP NAV + ADMIN BROADCAST CONTROLS (RoomTopNav.svelte vs reference admin nav.mainAppNav)

> The static nav chrome (bg, height, bars, users, mobile, talking indicator, [REC], volume, reload) matches the reference closely — tokens (#0c2434 bg, #103d5c bars bg, #abb0b5 muted icons, #45a2ff accent) and most geometry are right. The ONE structural divergence that dominates this surface: our nav renders a full inline admin broadcast cluster (screen-share, camera, mic, CC, music, record, go-live, members) via the `actions`/`stageActions` snippet, but the reference ADMIN capture's nav bar contains NONE of these controls — its right cluster is identical to the member nav (talkingIndicator -> recIndicator -> volume -> reload). The reference admin broadcast controls do not live in the top nav at all. Secondary divergences are small: nav z-index (40 vs 1030), volume/reload icon size (32 vs 36px box / matching 32px font), users margins (5px vs 4px), mobile rendered as a button vs a bare span, brand text vs logo image, and the recording prop never wired so [REC] can never appear.

<details><summary>Reference facts this diff is grounded in</summary>

- nav.mainAppNav (topnav[0]): background-color rgb(12,36,52)=#0c2434, height 49px, padding 0 on all sides, border-bottom-width 0px, z-index 1030, font Open Sans 300 16px/24px, color #fff, position fixed, display flex align-items center
- span.sidebar-menu bars (topnav[1]): background rgb(16,61,92)=#103d5c, 1px SOLID border color rgba(0,0,0,0) transparent, padding 1px 5px, margin 0 5px, glyph fa-bars () 18px weight 900 white
- span.users (topnav[3]): 1px SOLID white border (#fff), padding 1px 5px, margin-right 4px margin-left 4px (ml-1 mr-1), font 14px/21px weight 300 white; child i.fas.fa-user 14px weight 900 white ()
- span.fas.fa-mobile.mobile-info-app-btn (topnav[5]): it is a SPAN not a button, glyph 16px weight 900 white, margin-right 4px, no padding, title 'Launch in Mobile App'
- a.navbar-brand.ml-1.mr-auto > img.brand-logo (topnav[6,7]): brand slot is an IMAGE 200x18 (max-width 200/max-height 40), line-height 30px — not text
- li.talkingIndicator > a.talking (topnav[10,11]): white #fff, display inline-flex align-items center, line-height 41px, margin 0 5px, max-width 400px; i.icon.fa.fa-microphone () 16px white; span.talking-string 14px max-width 250px; plus img.talkingWaveform (22x25) when speaking
- li.recIndicator > a (topnav[16,17]): text '[ REC ]' color rgb(69,162,255)=#45a2ff, line-height 41px, max-width 117px, display inline-block, margin 0 5px
- li.dropdown.dropstart > a.nav-link > i.fas.fa-2x.fa-volume-up (topnav[18,19,20]): icon color rgb(171,176,181)=#abb0b5, font-size 32px (fa-2x) box 36x32, nav-link padding 8px, margin 0 5px; lives in a Bootstrap dropstart dropdown
- li.nav-item > a.nav-link > i.fas.fa-2x.fa-sync reload (topnav[21,22,23]): icon #abb0b5, font-size 32px box 32x32, padding 8px, margin 0 5px
- Across all 419 captured nodes (rs_all_nodes.json) the ONLY nav glyphs are fa-bars, fa-user, fa-mobile, fa-microphone (talking), fa-volume-up, fa-sync. No fa-video/fa-camera/fa-desktop/fa-closed-captioning/fa-music/broadcast/record/go-live icons exist anywhere in this ADMIN capture's nav.
- nav-link hover: resting #abb0b5 -> hover --app-link-color #45a2ff (.navbar-dark .navbar-nav .nav-link:hover); confirmed in tokens.json
- Volume dropdown panel (volumeControl / room-sound-options / volCtrl) was NOT captured (dropdown closed at capture) — its contents are unverifiable against the reference

</details>

### 🔴 CRITICAL — Inline admin broadcast control cluster does not exist in the reference nav
`missing-feature`

- **Reference:** The ADMIN capture's nav right cluster (ul.navbar-nav.ml-auto, topnav[9]) contains ONLY li.talkingIndicator -> li.recIndicator -> li.dropdown(volume) -> li.nav-item(reload). No screen-share, camera, mic, CC, music, record, go-live, or members buttons are present in the nav bar in any captured node (419 nodes scanned).
- **Ours:** We render a full broadcast cluster inline in the nav via {@render actions()} -> stageActions snippet: Share screen (fa-desktop/stop-circle), Camera (fa-video/video-slash), Mic (fa-microphone/microphone-slash + stop), Captions (fa-closed-captioning), Music (fa-music), Record (fa-dot-circle), Go live (fa-broadcast-tower), Members (fa-cog).
- **Location:** web/src/lib/components/RoomTopNav.svelte:112-114 (.nav-controls render) + web/src/routes/rooms/[id]/+page.svelte:431-540 (stageActions snippet)
- **Fix / why:** This is the single largest divergence on this surface. In the reference the admin broadcast controls are NOT in the top nav — the admin nav looks identical to the member nav. Either move these controls to the surface where the reference actually puts them (e.g. a presenter toolbar over the stage — see subtree_presentation.json) and strip them from the nav, or confirm with the operator that a deliberate redesign was intended. Right now the admin top nav is structurally wrong vs the source of truth.

### 🟠 HIGH — Go-live control: reference has none in nav; ours uses fa-broadcast-tower
`icon`

- **Reference:** MISSING from nav (no go-live/broadcast button in any captured nav node)
- **Ours:** <Icon name="broadcast-tower"> with title 'Go live'/'End broadcast', class:live-on bound to detail.room.is_live
- **Location:** web/src/routes/rooms/[id]/+page.svelte:520-529
- **Fix / why:** Part of the broadcast cluster the reference nav lacks. Cannot validate the chosen fa-broadcast-tower glyph because the reference renders no go-live control here. If kept, the icon choice is unverified against the source of truth.

### 🟠 HIGH — Record control: reference has none in nav; ours uses fa-dot-circle
`icon`

- **Reference:** MISSING from nav. Note: the reference DOES have a recIndicator '[ REC ]' text badge (li.recIndicator), but no record-toggle button.
- **Ours:** <Icon name="dot-circle"> title 'Record', opens showRecPreview, gated by caps.can_manage_room
- **Location:** web/src/routes/rooms/[id]/+page.svelte:516-518
- **Fix / why:** Reference signals recording state via the passive '[ REC ]' indicator only; there is no record-button glyph in the nav to match against. fa-dot-circle is our invention.

### 🟠 HIGH — Screen-share / camera / mic / CC / music controls absent from reference nav
`missing-feature`

- **Reference:** MISSING from nav — no fa-desktop, fa-video, fa-microphone (toggle), fa-closed-captioning, or fa-music anywhere in the captured admin nav. (fa-microphone DOES appear, but only inside li.talkingIndicator as the active-speaker glyph, not as a mic-publish toggle.)
- **Ours:** stageActions renders desktop/stop-circle, video/video-slash, microphone/microphone-slash(+stop), closed-captioning, music buttons
- **Location:** web/src/routes/rooms/[id]/+page.svelte:432-512
- **Fix / why:** Same root cause as the cluster divergence — listed separately so each control is accounted for. None of these glyphs can be validated against the reference nav.

### 🟠 HIGH — Members control: reference has none in nav; ours uses fa-cog
`icon`

- **Reference:** MISSING from nav. (A 'General Settings' fa-cogs item exists but only inside the off-canvas sidebar drawer, not the nav bar — controls_nav_dedup.json[5,6], rect at negative x.)
- **Ours:** <Icon name="cog"> title 'Members', toggles showMembers, gated by caps.can_manage_members
- **Location:** web/src/routes/rooms/[id]/+page.svelte:530-538
- **Fix / why:** A members/settings entry point exists in the reference but inside the sidebar drawer (fa-cogs, off-canvas), not the top nav. Our fa-cog 'Members' button in the nav has no reference counterpart there.

### 🟡 MEDIUM — Nav z-index is 40, reference is 1030
`size`

- **Reference:** z-index: 1030 (nav.mainAppNav computed, topnav[0]) — Bootstrap fixed-top stacking level
- **Ours:** z-index: 40
- **Location:** web/src/lib/components/RoomTopNav.svelte:216
- **Fix / why:** Functional risk: if any overlay/sidebar/modal sits between 40 and 1030 it will cover the nav in our app but not the reference. Set z-index to 1030 (or align the whole stacking scale to Bootstrap's) to match the reference layering contract.

### 🟡 MEDIUM — Brand slot is text, reference is a logo image
`missing-element`

- **Reference:** a.navbar-brand.ml-1.mr-auto > img.brand-logo, 200px x 18px (max-width 200, max-height 40), line-height 30px (topnav[6,7])
- **Ours:** <span class="brand">{roomName}</span> — plain text, font 20px/30px weight 300
- **Location:** web/src/lib/components/RoomTopNav.svelte:90, 314-323
- **Fix / why:** The reference brand is a fixed logo IMAGE (the Pro Trading Room logo), not the room name as text. Our code comment at line 314-318 already acknowledges this ('brand is a logo image in the reference, not text'). To match 1:1, render an <img> logo (with explicit width=200 height=18 to avoid CLS per the stack's img rule) rather than the room name. Note the reference does NOT show the room name in the nav at all.

### 🟡 MEDIUM — recIndicator [REC] never shows — recording prop is not wired
`behavior`

- **Reference:** li.recIndicator > a text '[ REC ]' color #45a2ff renders when the admin room is recording (present in this admin capture, topnav[16,17])
- **Ours:** recording prop exists and renders '[ REC ]' correctly (RoomTopNav.svelte:25,116-118,357-365) BUT +page.svelte:334-342 never passes recording=, so it defaults to false and [REC] can never appear
- **Location:** web/src/routes/rooms/[id]/+page.svelte:334-342 (no recording= prop)
- **Fix / why:** The indicator markup and color (#45a2ff) match the reference, but it is dead because the parent never sets recording. Wire recording={detail?.room.is_recording or screen.recording} so the [REC] badge actually appears during a recording, matching the admin reference.

### 🔵 LOW — Volume & reload icon size 32 vs reference fa-2x box 36/32px
`size`

- **Reference:** i.fas.fa-2x.fa-volume-up: font-size 32px, box 36px x 32px (topnav[20]); i.fas.fa-2x.fa-sync: font-size 32px, box 32px x 32px (topnav[23])
- **Ours:** <Icon name="volume-up"|"volume-mute"|"sync" size={32}> => font-size 32px
- **Location:** web/src/lib/components/RoomTopNav.svelte:129,131,205
- **Fix / why:** Font-size 32px matches (fa-2x = 2rem = 32px). The rendered glyph width differs only because the FA glyph aspect ratio differs (volume-up is wider). No code change needed for font-size; just noting the box-width difference is intrinsic to the glyph, not a bug.

### 🔵 LOW — Mobile-app launcher rendered as a <button>, reference is a bare <span>
`structure`

- **Reference:** span.fas.fa-mobile.mr-1.mobile-info-app-btn (topnav[5]) — a bare span glyph, 16px weight 900 white, margin-right 4px, NO padding box, NO button element
- **Ours:** <button class="icon-btn mobile-btn"> wrapping <Icon name="mobile" size={16}>, with padding 0.35rem inherited from .icon-btn then overridden to padding 0 / margin 0 4px 0 0 by .mobile-btn
- **Location:** web/src/lib/components/RoomTopNav.svelte:81-88, 264-267
- **Fix / why:** Visually close (margin-right 4px and padding 0 match after the .mobile-btn override), but ours is a real <button> while the reference is a clickable <span>. Accessibility-wise our button is arguably better; flagging for 1:1 fidelity. Title differs too: ours 'Launch in mobile app' vs reference 'Launch in Mobile App' (capitalization).

### 🔵 LOW — Volume dropdown is a Bootstrap dropstart in the reference; ours opens downward
`behavior`

- **Reference:** li.nav-item.dropdown.dropstart (topnav[18], position relative) — dropstart means the menu opens to the LEFT of the toggle
- **Ours:** Custom .volume-panel: position absolute, top calc(100% + 0.4rem), right 0 — opens DOWNWARD-and-left, not horizontally to the left
- **Location:** web/src/lib/components/RoomTopNav.svelte:422-434
- **Fix / why:** Reference uses Bootstrap dropstart (panel to the left of the icon). Ours drops below the icon, anchored to its right edge. The panel CONTENTS could not be verified — the reference dropdown was closed at capture so volumeControl/room-sound-options nodes are absent from all slices. Treat our panel's slider/mute/sound-options/Don't-Disturb/Subtitles internals as UNVERIFIED against the reference; only the toggle glyph and its open-direction are checkable, and the open-direction differs.

### 🔵 LOW — talkingWaveform image (active-speaker animation) not implemented
`missing-element`

- **Reference:** img.talkingWaveform.animated.fadeIn (topnav[15], 22px x 25px) renders next to the talking-string when someone is speaking
- **Ours:** When speaker is set we render only the fa-microphone glyph + '( {speaker} is speaking )' text — no waveform image
- **Location:** web/src/lib/components/RoomTopNav.svelte:99-106
- **Fix / why:** The reference shows an animated waveform GIF/image (22x25) beside the speaker name. We omit it. Minor, but it is a present element in the reference active-speaker state. Also note our text format '( {speaker} is speaking )' vs reference which shows just the presenter initials/name 'TG' in span.talking-string with no '( ... is speaking )' wrapper.

### 🔵 LOW — talking-string content format differs (parenthetical vs bare name)
`behavior`

- **Reference:** span.talking-string contains the bare speaker token e.g. 'TG' (topnav[14] text 'TG'); when no speaker the indicator is simply absent (li.talkingIndicator has ng-star-inserted, conditionally rendered)
- **Ours:** Always renders the .talking span; shows '( {speaker} is speaking )' when speaking and '( No one is speaking )' when idle
- **Location:** web/src/lib/components/RoomTopNav.svelte:99-106, 102, 104
- **Fix / why:** Two differences: (1) reference shows the bare name 'TG' not '( X is speaking )'; (2) reference appears to drop the indicator entirely when no one speaks (conditional ng-star-inserted), whereas we always render a '( No one is speaking )' placeholder. Confirm desired idle behavior with operator; for 1:1, show bare name and hide when idle.

### ⚪ COSMETIC — Users span side margins 5px vs reference 4px
`spacing`

- **Reference:** span.users (ml-1 mr-1): margin-left 4px, margin-right 4px (topnav[3] computed)
- **Ours:** margin: 0 5px on .users
- **Location:** web/src/lib/components/RoomTopNav.svelte:306
- **Fix / why:** Bootstrap ml-1/mr-1 = 0.25rem = 4px, not 5px. The code comment at line 299-300 even claims 'margin 0 5px' which is wrong vs the computed 4px. Change to margin: 0 4px and fix the comment (comment-vs-code drift).

### ⚪ COSMETIC — Mobile launcher title capitalization differs
`behavior`

- **Reference:** title='Launch in Mobile App' (topnav[5] attrs)
- **Ours:** title="Launch in mobile app" and aria-label="Launch in mobile app"
- **Location:** web/src/lib/components/RoomTopNav.svelte:84-85
- **Fix / why:** Capitalize to 'Launch in Mobile App' to match the reference tooltip exactly.

### ⚪ COSMETIC — Bars button border-radius 0 and bg/border match — verified correct
`color`

- **Reference:** span.sidebar-menu: background #103d5c, 1px solid transparent border, padding 1px 5px, margin 0 5px, border-radius 0, glyph 18px white
- **Ours:** .menu-btn background var(--bg-elev-2)=#103d5c, 1px solid transparent, padding 1px 5px, margin 0 5px; .icon-btn border-radius 0; Icon size 18
- **Location:** web/src/lib/components/RoomTopNav.svelte:250-255, 73, 244
- **Fix / why:** MATCH — no change needed. Recorded as a positive confirmation. (One structural note: reference bars is a <span> with title 'Open Sidebar'; ours is a <button> — acceptable a11y upgrade, same as the mobile span.)

### ⚪ COSMETIC — Nav bg, height, padding, border-bottom, font — verified correct
`color`

- **Reference:** nav.mainAppNav: background-color #0c2434, height 49px, padding 0, border-bottom-width 0, font Open Sans 300 16px/24px, color #fff (topnav[0])
- **Ours:** .topnav: background var(--bg)=#0c2434, height 49px, padding 0, gap 0, no border, font-size 16px weight 300 line-height 24px, color var(--text)=#fff
- **Location:** web/src/lib/components/RoomTopNav.svelte:210-232
- **Fix / why:** MATCH for bg/height/padding/border-bottom/font. Only z-index (separate divergence) and font-family declaration differ — our .topnav does not set font-family, relying on inherited body font; verify the app's global font is 'Open Sans', sans-serif to match the reference computed value.

---

## SIDEBAR / USER ROSTER (room-sidebar nav menu + roster)

> Our RoomSidebar.svelte is a close structural match to the reference room-sidebar nav menu (Powered-by block, Chat/Media caps, nav items, Users header toolbar, app-room-roster list). The header toolbar (Search/Sort/Reload/Cog buttons) and Powered/caps blocks match well. The main divergences: (1) ours ADDS an "Audio/Video Settings" nav item and an entire "Admin" sub-group (All PMs / YouTube / Session Control / Debug Log) that DO NOT exist in the reference sidebar; (2) roster avatars are square in our code but the reference token --rosterImg-border-radius is 50% (circular); (3) the reference roster-bg/roster-bg-adm/username-color tokens are not applied in our roster rows; (4) ProTradingRoom link href and version string differ. The reference roster had zero users at capture time, so per-user row DOM (avatar img, name, role, per-user dropdown) is unverified in the evidence — our roster row is a reasonable but unconfirmed reconstruction. MembersPanel.svelte is a separate admin drawer with no counterpart in the reference sidebar slice; PresenceBar.svelte (chip strip) likewise has no reference-sidebar counterpart.

<details><summary>Reference facts this diff is grounded in</summary>

- subtree_sidebar.json: sidebar nav-item order is exactly Connectivity Check (fa-network-wired) → General Settings (fa-cogs) → Archives dropdown (fa-archive) → Manage Muted Users (fa-comments) → Manage Followed Users (fa-users). No 'Audio/Video Settings' item, no 'Admin' group.
- subtree_sidebar.json node[5]: a.ptr-website-link text 'ProTradingRoom.com', href 'https://protradingroom.com' (NO www), color rgb(69,162,255)=#45a2ff, text-decoration underline, margin 0 5px.
- subtree_sidebar.json node[6]: version text literally 'Version: v4.0.1-c0fee8f5'.
- subtree_sidebar.json node[8]: button.btn.btn-sm.btn-secondary 'Mobile App Info' bg rgb(108,117,125)=#6c757d, color #fff, padding 4px 8px, radius 4px, border 1px solid #6c757d.
- subtree_sidebar.json node[9] hr: border-top 1px solid #676767, margin 5px 0, opacity 0.25.
- subtree_sidebar.json caps row: 'Chat' + fa-check, 'Media' + fa-check; i is 'Font Awesome 5 Free' weight 900, content .
- Sidebar items: a.nav-link.sidebar-item padding 8px 0, margin 0 5px, font-size 14px, font-weight 700, color #676767; icon span.pl-2 padding-left 8px; sidebar-item:hover background rgb(233,236,239)=#e9ecef (controls_sidebar.json matchedRules).
- Muted/Followed Users rows: li.nav-item.py-0 (0 vertical pad, 38px tall) with a.nav-link.sidebar-item.ps-1.
- Archives dropdown (file2.html): div.dropdown-menu.users-dropdown-options with Alert Logs (fa-bell #alerts-logs-modal), Chat Logs (fa-comment #chat-logs-modal), Transcript History (fa-closed-captioning, disabled/no target).
- Users header (node[36-48]): a.nav-link.active-room-users.d-flex.justify-content-between.pt-0; left div title='Users' = i.fa-user + span.pl-2 'Users:'; right div.flex-fill.users-btns holds 4 float-right buttons.
- Cog button (node[41]): id=user-options-btn, btn.btn-sm.btn-dark, bg rgb(33,37,41)=#212529, icon #fff, 26x27, data-bs-toggle=dropdown; dropdown-menu has ONE item 'Sort by Trials' (file2.html).
- Reload button (node[43]): btn-default class reload-room-users, bg rgb(244,244,244)=#f4f4f4, icon #45a2ff, title 'Reload Users', fa fa-sync.
- Sort button (node[45]): btn-secondary ms-1, bg #6c757d, icon #fff, title 'Sort Users', fa-sort-alpha-down, 24x27.
- Search button (node[47]): btn-default search-room-users, bg rgb(69,162,255)=#45a2ff, icon #f4f4f4, title 'Search Users', fa fa-search, 26x27.
- Roster: div.flex-grow-1 > app-room-roster > div.room-roster-list; room-roster-list width/height 100%; room-roster-container min-height 42px. Roster EMPTY at capture (0 user rows in any slice/HTML).
- tokens.json: --rosterImg-border-radius:50% (circular avatars); --lightTheme-roster-bg:#f1f1f1; --lightTheme-roster-bg-adm:#e1e1e1; --lightTheme-username-color:#0a6db1; --lightTheme-sidebar-wrapper-bg-color:#fff; --lightTheme-sidebar-wrapper-color:#676767.
- sidebar-wrapper background #fff, width 250px; ul.navbar-nav.small font-size 14px, color #676767, font 'Open Sans'.

</details>

### 🟠 HIGH — Extra 'Audio/Video Settings' nav item not in reference
`missing-feature` · element: `.nav-item > button.item (Audio/Video Settings)`

- **Reference:** Sidebar nav items are exactly: Connectivity Check, General Settings, Archives, Manage Muted Users, Manage Followed Users (subtree_sidebar.json nodes 16-34). No A/V Settings item exists.
- **Ours:** Extra nav-item 'Audio/Video Settings' (fa-video) opening AVSettingsModal
- **Location:** web/src/lib/components/RoomSidebar.svelte:93-102
- **Fix / why:** Reference puts A/V settings inside the General Settings / user-settings-modal, not as its own sidebar row. Remove the standalone item to match the reference 5-item menu, or confirm it's an intentional addition.

### 🟠 HIGH — Entire 'Admin' sub-group absent from reference sidebar
`missing-feature` · element: `.nav-item .group (Admin)`

- **Reference:** No Admin group, no All Private Messages / Play YouTube / Session Control / Debug Log items appear anywhere in subtree_sidebar.json (67 nodes) or the saved nav HTML.
- **Ours:** {#if canManage} block renders a .group with group-head 'Admin' (fa-shield-alt) + 4 sub-items: All Private Messages (fa-envelope), Play YouTube Video (brands youtube), Session Control (fa-sliders-h), Debug Log (fa-bug)
- **Location:** web/src/lib/components/RoomSidebar.svelte:174-214
- **Fix / why:** These admin actions are not in the reference room-sidebar (the reference exposes them elsewhere, e.g. presenter controls/top-nav). Either move them out of the sidebar or confirm this is a deliberate divergence; as-is it adds a whole uppercase 'Admin' section the reference never shows.

### 🟠 HIGH — Roster avatars square instead of circular
`size` · element: `.avatar`

- **Reference:** --rosterImg-border-radius: 50% (tokens.json) → circular gravatars.
- **Ours:** border-radius: 0 on .avatar with comment claiming reference avatars are square
- **Location:** web/src/lib/components/RoomSidebar.svelte:591-593
- **Fix / why:** The code comment ('reference gravatars are square, --rosterImg-border-radius: 0') is factually wrong — the token is 50%. Change .avatar border-radius to 50%. This is a comment-vs-evidence drift, not just a style nit.

### 🟡 MEDIUM — Roster row backgrounds (roster-bg / roster-bg-adm) not applied
`background` · element: `.roster-item`

- **Reference:** --lightTheme-roster-bg: #f1f1f1 (member rows), --lightTheme-roster-bg-adm: #e1e1e1 (admin/staff rows) — distinct row fills.
- **Ours:** MISSING — .roster-item has no background (only :hover background var(--bg-elev-2)); no admin-vs-member row distinction
- **Location:** web/src/lib/components/RoomSidebar.svelte:574-583
- **Fix / why:** Reference roster rows carry a persistent light fill (#f1f1f1) and admin rows a darker fill (#e1e1e1). Add a base background and a role-based modifier (e.g. .roster-item.admin) to match. Currently rows are transparent until hover.

### 🟡 MEDIUM — Roster username color not #0a6db1
`color` · element: `.roster-name`

- **Reference:** --lightTheme-username-color: #0a6db1 (blue) for roster names.
- **Ours:** MISSING — .roster-name inherits default sidebar text (#676767 via .sidebar-inner color)
- **Location:** web/src/lib/components/RoomSidebar.svelte:600-605
- **Fix / why:** Set roster name color to #0a6db1 to match the reference username token.

### 🟡 MEDIUM — Per-user roster row structure unverified vs reference
`missing-element` · element: `li.roster-item`

- **Reference:** Reference roster (app-room-roster > div.room-roster-list) was EMPTY at capture — no per-user row DOM (avatar img, name, role badge, per-user dropdown) exists in any slice or saved HTML.
- **Ours:** li.roster-item = span.avatar (initial letter) + span.roster-name; no role badge, no per-user dropdown/kebab
- **Location:** web/src/lib/components/RoomSidebar.svelte:240-249
- **Fix / why:** Our row is a plausible reconstruction but UNGROUNDED — the reference never showed a populated row. Reference uses real gravatar <img> (circular, per --rosterImg-border-radius) not a letter initial, and likely a per-user right-click/dropdown (the room uses MouseRightClick interactions). Treat row internals as unverified; do not assume parity. Capture a populated reference room before locking row design.

### 🟡 MEDIUM — Cog dropdown menu ('Sort by Trials') not implemented
`missing-feature` · element: `button.mini.mini-cog`

- **Reference:** Cog button (#user-options-btn, btn-dark) opens ul.dropdown-menu with one item: span 'Sort by Trials' (file2.html).
- **Ours:** MISSING — .mini-cog button is disabled with no dropdown menu
- **Location:** web/src/lib/components/RoomSidebar.svelte:234-236
- **Fix / why:** Reference cog opens a 'Users Options' dropdown containing 'Sort by Trials'. Ours renders the cog as a permanently-disabled icon with no menu. Implement the dropdown (single 'Sort by Trials' item) to match.

### 🟡 MEDIUM — Roster toolbar buttons all disabled
`behavior` · element: `.roster-actions button.mini`

- **Reference:** Search/Sort/Reload/Cog are live buttons (titles 'Search Users'/'Sort Users'/'Reload Users'/dropdown) with cursor:pointer.
- **Ours:** All four .mini buttons have the `disabled` attribute (opacity 0.65, not-allowed)
- **Location:** web/src/lib/components/RoomSidebar.svelte:225-236
- **Fix / why:** Functional gap: reference toolbar is interactive (reload re-fetches users, sort toggles, search filters). Ours is inert. Wire up handlers or note as intentionally stubbed.

### 🔵 LOW — Per-user dropdown / right-click menu missing
`missing-feature` · element: `li.roster-item (per-user actions)`

- **Reference:** Reference roster supports per-user actions (the only captured roster-level control is the global cog 'Users Options' → 'Sort by Trials'; per-user menus weren't captured but the app ships MouseRightClick assets).
- **Ours:** MISSING — no per-user dropdown or context menu on roster rows
- **Location:** web/src/lib/components/RoomSidebar.svelte:240-249
- **Fix / why:** Unconfirmed in evidence (empty roster). Flagged so it isn't assumed complete; verify against a populated reference room.

### 🔵 LOW — Sidebar item hover background differs
`color` · element: `.item:hover, .sub-item:hover`

- **Reference:** .sidebar-item:hover { background-color: rgb(233,236,239)=#e9ecef } (controls_sidebar.json matchedRules).
- **Ours:** .item:hover / .sub-item:hover set background:transparent and only darken text to #212529, explicitly suppressing the #e9ecef fill
- **Location:** web/src/lib/components/RoomSidebar.svelte:440-444, 484-488
- **Fix / why:** The matched reference rule gives a light-gray hover fill (#e9ecef). Our code intentionally suppresses it (comment cites the dark-skin .sidebar-menu:hover behavior instead). Since the captured admin room is the LIGHT skin, the #e9ecef hover fill is the source of truth — restore background:#e9ecef on hover.

### 🔵 LOW — MembersPanel.svelte has no reference counterpart in sidebar
`missing-element` · element: `aside.drawer (MembersPanel)`

- **Reference:** The reference room-sidebar has no slide-over members drawer, no add-member form, no online/offline split, no IP/geo columns. The sidebar roster is a single flat app-room-roster list.
- **Ours:** MembersPanel.svelte renders a fixed slide-over .drawer with Members header, 'Online now' section (name/location/IP/role), add-member email+role form, and a removable members list
- **Location:** web/src/lib/components/MembersPanel.svelte:62-129
- **Fix / why:** This is a separate admin surface, not part of the reference sidebar slice — so it is neither a match nor a divergence for THIS surface. Flagged so the reconcile doesn't try to force it into the sidebar. The reference's equivalent admin member-management lives in dedicated modals (followedUsersModal, mutedUsersModal), not an inline drawer.

### 🔵 LOW — PresenceBar.svelte (pill chips) has no reference-sidebar counterpart
`missing-element` · element: `.presence .chip`

- **Reference:** No pill/chip presence strip exists in the reference sidebar; presence is shown only via the app-room-roster list and the 'Users:' header count.
- **Ours:** PresenceBar.svelte renders fa-users icon + count + rounded (border-radius 999px) name chips
- **Location:** web/src/lib/components/PresenceBar.svelte:11-19, 39-45
- **Fix / why:** Out-of-scope for the sidebar surface (likely a top-nav/compact presence widget). If it is ever shown in the sidebar context it diverges (pill chips vs roster rows); otherwise no action. Note its chips are pill-shaped (999px) which conflicts with the reference's square-cornered roster aesthetic if reused.

### 🔵 LOW — Roster 'Users:' count placement
`structure` · element: `.roster-count`

- **Reference:** node[37-39]: header left side is div(title='Users') > i.fa-user + span.pl-2 'Users:'. The numeric count is NOT a captured child of the header (roster empty; count rendered by app-room-roster).
- **Ours:** .roster-title contains Icon(user) + 'Users:' label + .roster-count {present.length} inline in the header
- **Location:** web/src/lib/components/RoomSidebar.svelte:218-222
- **Fix / why:** Plausible but unverified — reference header shows only 'Users:' (no inline count captured); the count may live inside the roster list region. Low risk; verify against a populated room.

### ⚪ COSMETIC — Cog button background unverified (#212529)
`color` · element: `.mini-cog`

- **Reference:** node[41]: btn-dark bg rgb(33,37,41)=#212529, icon #fff — this IS captured, so the reference value is confirmed #212529.
- **Ours:** --mini-cog background #212529, color #fff
- **Location:** web/src/lib/components/RoomSidebar.svelte:541-544
- **Fix / why:** Our code comment says the cog bg/color is 'not in the evidence / unverified' — that comment is now stale. node[41] confirms #212529 bg + #fff icon. Update the comment; the value itself is correct.

### ⚪ COSMETIC — Search button icon color tone
`color` · element: `.mini-search`

- **Reference:** node[47]: search button bg #45a2ff, icon color rgb(244,244,244)=#f4f4f4.
- **Ours:** .mini-search background #45a2ff, color #f4f4f4, margin-left 0
- **Location:** web/src/lib/components/RoomSidebar.svelte:557-561
- **Fix / why:** Matches reference exactly (bg #45a2ff, icon #f4f4f4). No change needed — recording as a confirmed match.

### ⚪ COSMETIC — Reload/Sort button colors match
`color` · element: `.mini-reload, .mini-sort`

- **Reference:** Reload: bg #f4f4f4 icon #45a2ff (node43/44). Sort: bg #6c757d icon #fff (node45/46).
- **Ours:** .mini-reload bg #f4f4f4 / #45a2ff; .mini-sort bg #6c757d / #fff
- **Location:** web/src/lib/components/RoomSidebar.svelte:546-554
- **Fix / why:** Confirmed match to reference toolbar button colors. No change needed.

### ⚪ COSMETIC — ProTradingRoom link href has extra 'www'
`behavior` · element: `a.ptr-website-link`

- **Reference:** node[5] href = 'https://protradingroom.com' (no www).
- **Ours:** href='https://www.protradingroom.com'
- **Location:** web/src/lib/components/RoomSidebar.svelte:55
- **Fix / why:** Reference uses the apex domain (no www). Drop 'www.' to match exactly.

### ⚪ COSMETIC — Version string placeholder
`behavior` · element: `p.version`

- **Reference:** node[6] text 'Version: v4.0.1-c0fee8f5'.
- **Ours:** 'Version: v0.0.1'
- **Location:** web/src/lib/components/RoomSidebar.svelte:60
- **Fix / why:** Expected to differ (different build); recording for completeness. Ours is a placeholder string, reference embeds a real semver+git-sha.

### ⚪ COSMETIC — Powered link color token
`color` · element: `.ptr-website-link`

- **Reference:** --ptr-website-link-color / --app-link-color = #45a2ff; node[5] color rgb(69,162,255).
- **Ours:** .ptr-website-link color #45a2ff
- **Location:** web/src/lib/components/RoomSidebar.svelte:333-337
- **Fix / why:** Confirmed match (#45a2ff, underlined, margin 0 5px). No change needed.

### ⚪ COSMETIC — Sidebar outer background / width / text color match
`background` · element: `.sidebar / .sidebar-inner`

- **Reference:** sidebar-wrapper bg #fff, width 250px, color #676767, font 'Open Sans' 14px (subtree nodes 0-3; --lightTheme-sidebar-wrapper-* tokens).
- **Ours:** .sidebar background #ffffff, flex 0 0 250px, .sidebar-inner color #676767 font-size 14px
- **Location:** web/src/lib/components/RoomSidebar.svelte:272-297
- **Fix / why:** Confirmed match for shell bg, width, base color, base font-size. Font-family is inherited (Open Sans) — ensure the global stack resolves to Open Sans; not set locally here.

---

## PRESENTATION / STAGE (MainStage.svelte + ScreenStage.svelte vs subtree_presentation.json + controls_presentation.json)

> Our MainStage tab strip and ScreenStage sub-tab strip are a close, evidence-grounded match to the reference: tab order (Screens/Notes/Files), active blue #45a2ff pill, idle #ccc text, the notes-active dark #0c2434 quirk, the 20x20 presenter-img, the cog dropdown caret, and the three search/camera/expand zoom buttons are all present and styled correctly. The most significant divergences are in the zoom-control button fills — our ScreenStage hardcodes the OLD Bootstrap-4 .btn-dark light-gray (#adb5bd / #222 text), but the reference computed value is the Bootstrap-5 dark fill rgb(33,37,41)=#212529 with white text and a 4px radius. Several smaller structure/spacing items (container display:block vs inline-flex, ml-1 vs mx-1, transparent #mainTabs background, missing per-screen Detach/Lock dropdown menu, our extra locked-pill) round out the list.

<details><summary>Reference facts this diff is grounded in</summary>

- controls_presentation.json a#screens-tab (active main tab): computed background-color rgb(69,162,255)=#45a2ff, color rgb(255,255,255), border-color transparent, border-radius 3px all corners, padding 8px, margin 5px, font 12px/300 line-height 12px, font-family Open Sans; icon fas fa-desktop ().
- controls_presentation.json Files tab (idle, ul#mainTabs>li:nth-child(4)>a.nav-link): computed color rgb(204,204,204)=#ccc, background transparent, border-top-left-radius 6px (idle main tabs use 6px top corners, NOT 3px), padding 8px, margin 5px; icon fas fa-folder ().
- subtree_presentation.json ul#mainTabs.nav.nav-tabs.mainTabset: computed background-color rgba(0,0,0,0) TRANSPARENT, justify-content center, align-items center, height 40.5px, border-bottom 1px transparent.
- subtree_presentation.json a#notes-tab class 'nav-link presAreaTabs-notes', idle color #ccc, border-top-left-radius 6px, icon i#noteChangeIndicator.fas.fa-edit; rule '#presAreaTabs-notes.active { background-color: var(--notes-tabs-bg) }' = #0c2434 (active Notes tab is dark navy, not the blue pill).
- Tab label spans: Screens uses span.ml-1 (margin-left 4px only); Notes & Files use span.mx-1 (margin-left+right 4px). All 12px, Screens label #fff, Notes/Files labels computed #ccc.
- subtree_presentation.json ul#screenTabs.screens-tabs: computed background-color rgb(12,36,52)=#0c2434, height 40px; active sub-tab a#...-tab computed bg rgb(69,162,255), padding 4px, radius 3px, width ~128px, with span.mx-1 name + img.presenter-img (20x20, radius 0px, src gravatar s=20) + span#dropdownMenuScreen.dropdown-toggle with i.fas.fa-cog ().
- controls_presentation.json zoom buttons button.btn.btn-sm.btn-dark x3 (icons icon fas fa-search, icon fas fa-camera, icon fas fa-expand): COMPUTED background-color rgb(33,37,41)=#212529, border-color rgb(33,37,41), color rgb(255,255,255), border-radius 4px, padding 4px 8px, size 32x31 / 30x31, font 14px/400. The BS5 .btn-dark rule (--bs-btn-bg:#212529) wins over the legacy .btn-dark rgb(173,181,189) rule.
- .zoom-controls-container.position-relative: computed display block, opacity 0.5, background transparent; buttons display inline-block. nth-child(1) inside it is a hidden div.dropdown-menu.volumeControl (zoom dropdown), buttons are nth-child 2/3/4.
- Reference active screen sub-tab title is 'TG-Screen 1' with a fa-cog dropdown that opens 'Detach Screen to a new window / Lock Screen' (label on a#...-tab in controls_presentation.json).

</details>

### 🟠 HIGH — Zoom buttons use wrong (Bootstrap-4) .btn-dark fill — light gray instead of dark
`color`

- **Reference:** COMPUTED background-color rgb(33,37,41)=#212529, color rgb(255,255,255) (BS5 .btn-dark --bs-btn-bg:#212529 wins)
- **Ours:** background-color rgb(173,181,189)=#adb5bd, color rgb(34,34,34)=#222 (legacy BS4 value)
- **Location:** web/src/lib/components/ScreenStage.svelte:267-271 (.btn-dark) + comment 248-249 calling it a 'LIGHT-gray pill'
- **Fix / why:** The capture's matchedRules include BOTH rules but the computed wins is the BS5 dark #212529. Our hardcoded #adb5bd makes the zoom/snapshot/fullscreen buttons render as light-gray pills instead of dark ones. Change .btn-dark to background-color:#212529; border-color:#212529; color:#fff. The icons are then white-on-dark (we already force .icon white, so icons would currently be white-on-light-gray which is also wrong).

### 🟡 MEDIUM — Per-screen sub-tab dropdown (Detach Screen / Lock Screen menu) not implemented
`missing-feature`

- **Reference:** span#dropdownMenuscreen.dropdown-toggle opens a menu with 'Detach Screen to a new window' and 'Lock Screen' (label on a#6a300cc...-tab); cog is a real Bootstrap dropdown trigger
- **Ours:** MISSING — ScreenStage renders the cog + caret but it is decorative (aria-hidden, no dropdown, no Detach/Lock actions)
- **Location:** web/src/lib/components/ScreenStage.svelte:66-70
- **Fix / why:** The cog/caret is purely visual in ours (aria-hidden=true, aria-expanded=false, no click handler). The reference cog opens a dropdown with Detach-to-new-window and Lock-Screen actions. If presenter screen controls are in scope this is a real missing feature; otherwise it's a known visual-only placeholder.

### 🟡 MEDIUM — Zoom button title attributes (Zoom/Snapshot/Fullscreen) — labels are our invention
`behavior`

- **Reference:** buttons have no captured title attr; semantics inferred from icons (search=zoom, camera=snapshot, expand=fullscreen)
- **Ours:** title="Zoom" / "Snapshot" / "Fullscreen" with no onclick handlers (decorative)
- **Location:** web/src/lib/components/ScreenStage.svelte:78-86
- **Fix / why:** Icons match the reference (fa-search, fa-camera, fa-expand) but our buttons are non-functional (no onclick). If zoom/snapshot/fullscreen are in scope, these need wiring; reference fullscreen is on the screencast-pan dblclick (which we DO implement at ScreenStage.svelte:99-103) but the expand button itself does nothing in ours.

### 🔵 LOW — Zoom-controls container is display:block in reference, inline-flex in ours
`structure`

- **Reference:** .zoom-controls-container computed display: block; child buttons display: inline-block (laid out inline)
- **Ours:** display: inline-flex on container AND .btn elements set display: inline-flex
- **Location:** web/src/lib/components/ScreenStage.svelte:239 (container) and 251 (.btn)
- **Fix / why:** Visually equivalent for 3 small buttons but a structural mismatch. Reference relies on inline-block flow; ours uses flex. Low risk but flag for 1:1 fidelity.

### 🔵 LOW — Hidden zoom dropdown-menu (volumeControl/zoom slider) sibling absent
`missing-element`

- **Reference:** .zoom-controls-container nth-child(1) is div.dropdown-menu.volumeControl (collapsed zoom/level dropdown) preceding the 3 buttons
- **Ours:** MISSING — only the 3 buttons exist, no preceding dropdown-menu element
- **Location:** web/src/lib/components/ScreenStage.svelte:77-86
- **Fix / why:** This is a Bootstrap dropdown-menu that is display:none by default, so it has zero visual impact in the idle state. Only matters if the zoom button is wired to open a level/volume menu. Safe to omit for pixel parity.

### 🔵 LOW — presenter-img 20x20 square initials vs reference 20x20 gravatar image
`icon`

- **Reference:** img.presenter-img 20x20, border-radius 0px, src=gravatar (an <img>, object-fit fill)
- **Ours:** span.presenter-img 20x20, border-radius 0, renders text initials on --bg-elev-2 (#103d5c) background
- **Location:** web/src/lib/components/ScreenStage.svelte:64,191-203
- **Fix / why:** Reference is a 20x20 gravatar <img> (radius 0, square — confirmed by computed border-top-left-radius:0px); ours is a 20x20 initials box (also square, radius 0). Dimensions and square shape match; content differs (initials vs avatar image) by deliberate design choice to avoid external gravatar requests. Our initials bg #103d5c is an invented value (no reference equivalent since reference shows a photo).

### 🔵 LOW — Empty-state 'Waiting for a presenter…' not present in reference capture
`missing-feature`

- **Reference:** n/a — reference room had a live screen share (TG-Screen 1), so no empty/no-presenter state was captured
- **Ours:** .empty grid-centered text 'Waiting for a presenter to share their screen…' / 'Connecting…' on #0f2e43, color var(--text-dim), 0.9rem
- **Location:** web/src/lib/components/ScreenStage.svelte:116-118,284-294
- **Fix / why:** Cannot 1:1 compare — the reference slice contains no empty state. Our empty state uses --text-dim (#9fc4dd) on the #0f2e43 presenter-area bg, which is a reasonable extrapolation but is UNVERIFIED against reference. Treat copy/color as best-guess until a no-share capture exists.

### 🔵 LOW — Locked-screen pill is an addition with no reference equivalent
`missing-feature`

- **Reference:** n/a — no 'Screen locked' pill exists in the reference tab strip; reference handles lock via the per-screen cog dropdown 'Lock Screen' action
- **Ours:** .locked-pill (rounded warn-colored badge with lock icon + 'Screen locked') rendered in the main tab strip when screenLocked && !canManage
- **Location:** web/src/lib/components/MainStage.svelte:84-88,203-217
- **Fix / why:** This is our own UX addition (uses --warn #f39c12). The reference has no such pill — its lock state lives in the screen-tab cog dropdown. Not a defect per se, but it is an element present in ours and absent from the reference; flag for design sign-off on whether to keep it.

### ⚪ COSMETIC — Zoom button border-radius 0.2rem vs reference 4px
`size`

- **Reference:** border-radius 4px (computed on all three btn-sm btn-dark buttons)
- **Ours:** border-radius: 0.2rem (≈3.2px)
- **Location:** web/src/lib/components/ScreenStage.svelte:265 (.btn-sm)
- **Fix / why:** Reference computed corner radius is 4px (BS5 --bs-border-radius-sm). Set .btn-sm border-radius:4px to match exactly; the ~0.8px difference is minor but measurable.

### ⚪ COSMETIC — Zoom-controls container missing margin-top:4px / position-relative class semantics
`spacing`

- **Reference:** li.nav-item.ms-auto > div.zoom-controls-container.position-relative; buttons top-aligned at y=94 within the 40px strip
- **Ours:** div.zoom-controls-container with margin-top:4px; position:relative — present
- **Location:** web/src/lib/components/ScreenStage.svelte:238-246
- **Fix / why:** Our container already sets margin-top:4px and position:relative, matching the reference's vertical offset inside the 40px strip. No change needed — included for completeness; matches.

### ⚪ COSMETIC — #mainTabs background is transparent in reference; ours paints --bg-elev
`color`

- **Reference:** ul#mainTabs computed background-color rgba(0,0,0,0) (transparent — navy shows through from presentation-box parent)
- **Ours:** .tabbar background: var(--bg-elev) = #0f2e43 (explicitly painted)
- **Location:** web/src/lib/components/MainStage.svelte:149
- **Fix / why:** Net pixel result is identical because our parent surface is also #0f2e43 (--bg-elev) and the reference's transparent strip sits over a #0f2e43 presentation-box. Functionally a match; flagged only because the mechanism differs (we paint, they inherit).

### ⚪ COSMETIC — Idle main-tab border-radius 6px (top corners) matches; active is 3px
`size`

- **Reference:** idle main tab (Files/Notes) border-top-left/right-radius 6px, bottom 0; active (Screens) radius 3px all corners
- **Ours:** .tabbar button border-radius:6px (idle), .tabbar button.active border-radius:3px
- **Location:** web/src/lib/components/MainStage.svelte:173 (idle 6px) and 196 (active 3px)
- **Fix / why:** Matches the reference: idle tabs use 6px, active uses 3px. Our idle applies 6px to all four corners whereas reference only rounds the top two (bottom 0); since idle tabs sit on a transparent strip the bottom corners are not visible, so effectively a match.

### ⚪ COSMETIC — Tab icon-to-label spacing: reference uses ml-1 (Screens) / mx-1 (Notes,Files); ours uses uniform flex gap:4px
`spacing`

- **Reference:** Screens label span.ml-1 (margin-left 4px only); Notes & Files labels span.mx-1 (margin-left 4px + margin-right 4px)
- **Ours:** .tabbar button gap:4px (4px between icon and label for all three; no trailing right margin on label)
- **Location:** web/src/lib/components/MainStage.svelte:158-159 (gap:4px)
- **Fix / why:** Leading 4px gap matches all three tabs. The reference Notes/Files labels also carry a 4px right margin (mx-1) that ours lacks; visually negligible inside the 8px button padding but a literal spacing difference.

### ⚪ COSMETIC — Active-Notes-tab dark navy quirk correctly reproduced
`color`

- **Reference:** #presAreaTabs-notes.active { background-color: var(--notes-tabs-bg) } = #0c2434 (active Notes tab is dark navy, NOT the blue pill)
- **Ours:** .tabbar button.active.notes-active { background: var(--bg, #0c2434) }
- **Location:** web/src/lib/components/MainStage.svelte:198-202
- **Fix / why:** Match. Our --bg resolves to #0c2434 (theme.svelte.ts:35) = reference --notes-tabs-bg #0c2434. The reference-specific quirk is faithfully reproduced.

### ⚪ COSMETIC — Screen sub-tab strip bg, height, active pill all match
`color`

- **Reference:** ul#screenTabs.screens-tabs computed background rgb(12,36,52)=#0c2434, height 40px; active sub-tab bg #45a2ff, padding 4px, radius 3px, white text
- **Ours:** .screens-tabs background-color:#0c2434, min-height:40px; .nav-link.active background-color:#45a2ff, padding 4px, radius 3px, color #fff
- **Location:** web/src/lib/components/ScreenStage.svelte:135-186
- **Fix / why:** Match across bg, height, active fill, padding, radius and text color. Hover border #0a6db1 (--tabs-border-color) also matches (ScreenStage.svelte:174-176).

---

## WEBCAMS (app-webcam-holder / WebcamHolder.svelte)

> Tile geometry (320x240, 5px margin, black bg, 6px radius, 1px yellowgreen border, contain video) matches the reference closely. The structural model diverges materially: the reference name label (h5.pNameLabel) is EMPTY and serves only as the container for the close-X — there is NO presenter-name text and the X shows on every tile, whereas our build renders a centered translucent name bar with the presenter name and gates the close button to the local tile only. Card overflow also differs (reference visible vs our hidden), and our close control is a sibling &lt;button&gt; rather than a &lt;span&gt; nested inside the h5.

<details><summary>Reference facts this diff is grounded in</summary>

- card.webcamsHolder (node[0]): width 320px / height 240px, margin 5px all sides, background-color rgb(0,0,0), border 1px solid rgb(154,205,50) (=yellowgreen), border-radius 6px, position:absolute, z-index:105, display:flex flex-direction:column, overflow-x/y:visible, cursor:move, color rgb(33,37,41), font 300 16px 'Open Sans', free-positioned (left:778.969px right:448.969px bottom:-250px) → JS drag
- video.webcamsHolderVideo (node[1]): width 318px / height 238px, position:relative, display:block, object-fit:contain, no border/radius, background rgba(0,0,0,0)
- Overlay DOM (files/webcamholder.html + afterwebcamholder.html): div.overlay > h5.pNameLabel.m-0 > span.closeIcon > i.fas.fa-times — the h5 contains ONLY the close span, NO presenter-name text node
- span.closeIcon (node[2]): position:absolute top:0 right:5px, z-index:102, width 13.75px height 24px, color rgb(255,255,255), font-size 20px, font-weight 500, text-align center, background transparent
- i.fas.fa-times (node[3]): FA5 'Font Awesome 5 Free' weight 900, before content , 20px, color white, line-height 20px
- yellowgreen rgb(154,205,50) is NOT a token in tokens.json (no --webcam var); reference uses the literal color

</details>

### 🟠 HIGH — Name label renders presenter text; reference has none
`structure`

- **Reference:** h5.pNameLabel.m-0 contains ONLY span.closeIcon (the X). No presenter-name text node in either captured DOM snapshot (files/webcamholder.html, files/afterwebcamholder.html). Slice node[2] closeIcon is the sole child.
- **Ours:** h5.name renders `{publisher.name ?? 'Presenter'}{publisher.isLocal ? ' (you)' : ''}` as a full-width centered bar
- **Location:** web/src/lib/components/WebcamHolder.svelte:106-108
- **Fix / why:** The reference never shows a presenter name in the webcam tile — the overlay bar is purely the close-X holder. We invented a visible name label. To match, drop the name text (or hide it) and make the overlay only host the close control. If a name is a deliberate product addition, flag it explicitly; it is not in the reference.

### 🟡 MEDIUM — Translucent name-bar background is an addition
`background`

- **Reference:** Reference overlay shows no name bar: the only overlay element is the transparent closeIcon span (background-color rgba(0,0,0,0)). No translucent strip across the top.
- **Ours:** `.name` has `background: rgba(0,0,0,0.5)` spanning full width across the top
- **Location:** web/src/lib/components/WebcamHolder.svelte:205
- **Fix / why:** Tied to the name-label divergence: since the reference has no name text, there is no dark bar over the video top. Our 50%-black strip is not in the reference and covers the top of the camera feed. Remove with the name text.

### 🟡 MEDIUM — Close-X gated to local tile only; reference shows it on every tile
`behavior`

- **Reference:** Every captured tile (both app-presenter-cams instances in the snapshot) contains span.closeIcon > i.fas.fa-times. No isLocal distinction exists in the markup.
- **Ours:** Close button only renders under `{#if onClose && publisher.isLocal}` — non-local tiles get NO close control
- **Location:** web/src/lib/components/WebcamHolder.svelte:111
- **Fix / why:** In the reference the X appears on each webcam tile (admin can close any). Our gate hides it for remote presenters. If the admin-room behavior is 'close any cam', the isLocal gate diverges; reconcile against the intended RBAC for the admin room.

### 🟡 MEDIUM — Per-card absolute positioning + JS free-drag not replicated
`structure`

- **Reference:** Each card.webcamsHolder is position:absolute, z-index:105, free-positioned (left:778.969px, right:448.969px, bottom:-250px, transform-origin 160px 120px) — JS drag repositions each card absolutely within the presentation area
- **Ours:** Cards are flex items in a flex-wrap holder (justify-content:center, align-items:flex-end); drag applies a CSS translate() offset rather than absolute repositioning. Holder, not each card, is the positioned context.
- **Location:** web/src/lib/components/WebcamHolder.svelte:140-148 (.holder flex) + 92-93 (translate offset); MainStage.svelte:127-135 (.webcam-overlay absolute)
- **Fix / why:** Functionally both are draggable with cursor:move, but the reference positions each tile absolutely (z-index:105 per card) so tiles float independently over the presentation area, while ours lays them out in a centered flex row inside an absolute overlay (z-index:5). Multi-cam layout and free placement will differ. Acceptable if single-cam, but the layout model is not 1:1.

### 🔵 LOW — Close control is a <button> sibling, not a <span> inside the h5
`structure`

- **Reference:** span.closeIcon is nested INSIDE h5.pNameLabel which is inside div.overlay: div.overlay > h5.pNameLabel.m-0 > span.closeIcon > i.fas.fa-times
- **Ours:** <button class="close"> is a direct child of .card, a SIBLING of .overlay (outside the overlay div), containing <Icon name="times">
- **Location:** web/src/lib/components/WebcamHolder.svelte:112-120 (button is after the closing </div> of .overlay at line 109)
- **Fix / why:** Tag and nesting differ (span-in-h5 vs button sibling). Our button is the more accessible choice (keyboard/focus), but the DOM hierarchy and element type diverge from reference. Cosmetically equivalent if positioned identically; positioning currently is (top:0 right:5px) which matches.

### 🔵 LOW — Card overflow: hidden vs reference visible
`behavior`

- **Reference:** card.webcamsHolder overflow-x:visible, overflow-y:visible (slice node[0] lines 64-65)
- **Ours:** `.card { overflow: hidden }`
- **Location:** web/src/lib/components/WebcamHolder.svelte:160
- **Fix / why:** Reference lets content overflow the rounded card; we clip. With our 6px radius + contain video this mostly matches visually, but the X/overlay would clip at the card edge in ours where it would not in the reference. Set overflow:visible to match (note: reference relies on the 318x238 video inside a 320x240 bordered box, so the 1px border ring shows on all sides).

### ⚪ COSMETIC — Holder/overlay z-index lower than reference card
`behavior`

- **Reference:** card.webcamsHolder z-index:105; closeIcon z-index:102
- **Ours:** .webcam-overlay z-index:5 (MainStage); .card.dragging z-index:200; .overlay z-index:101; .close z-index:102
- **Location:** web/src/lib/components/MainStage.svelte:132; WebcamHolder.svelte:175,194,221
- **Fix / why:** Our stacking context is reparented under a z-5 overlay so the absolute 105 vs 5 is not directly comparable, but within-tile the overlay(101)/close(102) ordering matches reference (closeIcon 102 above the name layer). No visible defect expected; noting the numeric divergence for completeness.

### ⚪ COSMETIC — Active border color sourced via local CSS var vs reference literal
`color`

- **Reference:** border-top/right/bottom/left-color rgb(154,205,50) (yellowgreen); no --webcam token exists in tokens.json
- **Ours:** border: 1px solid var(--webcam-active-border) where --webcam-active-border:#9acd32 (=rgb(154,205,50))
- **Location:** web/src/lib/components/WebcamHolder.svelte:131-132,158
- **Fix / why:** Color value matches exactly (#9acd32 == rgb(154,205,50)). Reference applies this as the always-on border (the only captured state). We treat it as the 'active' border but apply it unconditionally too, so visually identical. No change needed; documented for grounding.

### ⚪ COSMETIC — closeIcon font-weight/text-align on the span
`font`

- **Reference:** span.closeIcon font-weight:500, text-align:center, font-size:20px, color white, width 13.75px height 24px
- **Ours:** .close uses display:inline-flex, align/justify center, color #fff; inner <i> is FA via Icon (font-size 20px). No explicit font-weight on the span wrapper (the glyph weight comes from FA solid 900 on the <i>, which matches reference i weight 900).
- **Location:** web/src/lib/components/WebcamHolder.svelte:215-231; Icon.svelte:26-32
- **Fix / why:** Glyph (fa-times, FA5 solid weight 900, 20px, white) matches the reference <i>. The span-level font-weight:500/text-align:center is moot because we flex-center the icon. Visually equivalent.

### ⚪ COSMETIC — Empty state 'No presenters' has no reference counterpart
`missing-feature`

- **Reference:** Reference renders app-presenter-cams only when a publisher exists; no empty-state element captured (MainStage gates on webcamPublishers.length > 0).
- **Ours:** `{#if publishers.length === 0} <div class="empty">No presenters</div>`
- **Location:** web/src/lib/components/WebcamHolder.svelte:81-82
- **Fix / why:** Harmless because MainStage.svelte:101 only mounts WebcamHolder when webcamPublishers.length>0, so the empty branch never renders in the room. Reference has no such placeholder. Could be removed as dead UI, but no visible divergence.

### ⚪ COSMETIC — Video element dimensions match (318x238 inside 320x240 border)
`size`

- **Reference:** video.webcamsHolderVideo 318x238 (card 320x240 minus 1px border each side), object-fit:contain
- **Ours:** video width:100% height:100% object-fit:contain inside a 320x240 card with 1px border and overflow:hidden
- **Location:** web/src/lib/components/WebcamHolder.svelte:177-185
- **Fix / why:** MATCHES — 100%/100% inside the bordered box yields the same 318x238 content area; object-fit:contain matches; background transparent matches reference rgba(0,0,0,0). No action.

---

## ALERTS PANEL (AlertFeed.svelte / AlertsChatDock.svelte)

> Our AlertFeed is a close, evidence-driven match on the big-ticket tokens: header bg #0a6db1, 48px min-height, p-1 (4px) padding; navbar-brand bell 20px/300/lh30; username navy #0a6db1 14px/900; created-at #a8a8a8 12px/600 upright; body #676767 13px/100 lh19.5 pre-wrap; alert-qa BS btn-sm.btn-secondary gray #6c757d 10px/400; FA5 icons via matching markup. The remaining gaps are structural/layout: the reference indents the body under the avatar gutter (x=66) and lays the row out as a fixed kebab column + avatar column + w-100 (username left / qa+date right), whereas ours uses a single flex row with a near-flush body; the reference avatar is a real 35x35 square img inside an avatar pl-1 wrapper (ours falls back to an initials chip with a colored bg); and several spacing values (msgMenu 20px/600 navy with pt-1/pl-1, qa-count answered turns green #008040) differ in detail.

<details><summary>Reference facts this diff is grounded in</summary>

- alertHeader nav.navbar-light.chat-nav.p-1: background rgb(10,109,177)=#0a6db1, height 48px, padding 4px all sides, color #fff, position relative, align-items center (rs_alerts_dedup.json node nav.alertHeader)
- navbar-brand 'Alerts' link: font-size 20px, font-weight 300, line-height 30px, color #fff, padding 5px 0, margin-left 4px(ml-1), margin-right 16px; bell i.fas.fa-bell.me-1 = glyph , 20px/900, margin-right 4px
- Search control: li.nav-item.mx-1 (mx=4px) > a.nav-link.p-0[title=Search] > i.fas.fa-search glyph  16px/900 #fff
- Gear control: li.nav-item.dropdown.ml-2 (ml=8px) > a.nav-link.dropdown-toggle.p-0 (dropdown-toggle::after = CSS caret border-triangle, NOT a fa glyph) > i.fas.fa-cog.chat-header-gear glyph  16px/900 #fff
- msg-box (div.msg-box.pb-1): padding 0 0 4px 0, border-top 1px solid rgb(225,225,225)=#e1e1e1, background #fff, border-radius 0
- Row layout: msgMenu (x=0) | avatar (x=19) | w-100 block holding [username x=62 left] + [alert-qa x=301 & created-at x=323 right via justify-content space-between]; body row indented to x=66
- msgMenu a.msgMenu.dropright.pt-1: text '⠇', width 18.67px, color rgb(10,109,177)=#0a6db1, font 20px/600 lh30, padding-top 4px(pt-1) padding-left 5px, NO before/after pseudo (glyph is literal text), background transparent
- avatar div.avatar.pl-1 (w 39px, padding-left 4px) wraps img 35x35, object-fit cover, border-radius 0 (square) — computed border-top-left-radius 0px despite --rosterImg-border-radius:50% token
- username strong.username.mx-1: color rgb(10,109,177)=#0a6db1, font-size 14px, font-weight 900, line-height 21px, margin 0 4px (mx-1)
- alert-qa button.btn.btn-sm.btn-secondary.me-1: bg rgb(108,117,125)=#6c757d, border 1px solid #6c757d, color #fff, font 10px/400 lh15, padding 1px 3px, border-radius 4px, .alert-qa override {font-size:10px;padding:1px 3px}; box 18x19; hover bg #5c636a border #565e64
- qa icon i.fas.fa-question-circle: glyph  (solid), 10px/900, color #fff
- qa count span.me-1: '(4)' color #fff when unanswered; '(9)' color rgb(0,128,64)=#008040 (green) when answered — count color encodes answered state, font 10px/400
- created-at span.created-at.mr-2: text '6/8/26, 1:17 PM', color rgb(168,168,168)=#a8a8a8, font 12px/600 lh18, font-style normal (upright), margin-right 8px (mr-2)
- body div.msg-left.text-formated.preText.ml-2.mr-2.p-0: color rgb(103,103,103)=#676767, font-size 13px, font-weight 100, line-height 19.5px, white-space pre-wrap, text-align left, margin 0 8px (ml-2 mr-2); positioned at x=66 (indented under avatar/username gutter)
- Image: div.img-container (padding 3px) > img.uploaded-img 300px wide, object-fit contain
- Panel root as-split-area.alert-box overflow-y auto, background transparent (inherits white); column font-family 'Open Sans' sans-serif; no ticker element present in alerts slice

</details>

### 🟠 HIGH — Body not indented under avatar/username gutter
`spacing` · element: `.body / div.msg-left.text-formated.preText`

- **Reference:** div.text-formated body left edge at x=66 (indented past the avatar column + pl), margin-left 8px (ml-2) relative to its w-100 parent which itself starts at x=58
- **Ours:** margin: 0.35rem 8px 0 8px — body starts ~8px from the panel left edge, NOT aligned under the avatar gutter; sits flush-left under the kebab
- **Location:** web/src/lib/components/AlertFeed.svelte:651-652 (.body margin)

### 🟡 MEDIUM — Row structure: single flex row vs kebab-column + avatar-column + w-100
`structure` · element: `.row1 / mr-1.d-flex.flex-row`

- **Reference:** msg-box > mr-1.d-flex.flex-row containing: msgMenu(col, x=0), avatar(col, x=19), and a w-100 block; the w-100 holds username(left) and a justify-content:space-between cluster of alert-qa + created-at(right); body is a SEPARATE second flex row indented under the gutter
- **Ours:** single .row1 flex (kebab, avatar, username, qa, created-at all inline) with .body as a sibling block below; no w-100 wrapper, no avatar gutter column the body aligns to
- **Location:** web/src/lib/components/AlertFeed.svelte:233-318 (.row1 + .body)

### 🟡 MEDIUM — Q&A answered state shown by ✅ emoji vs green count color
`behavior` · element: `.alert-qa .qa-count / span.me-1`

- **Reference:** answered alerts render the question-count span in GREEN rgb(0,128,64)=#008040 (the '(9)' sample); unanswered is white '(4)'. No checkmark glyph captured
- **Ours:** answered renders a trailing ✅ emoji (.qa-check) AFTER the icon, and the count (.qa-count) is always font-weight 700 white — does not switch to green when answered
- **Location:** web/src/lib/components/AlertFeed.svelte:309-312, 627-633 (.qa-count / .qa-check)

### 🔵 LOW — Avatar is an initials chip, not a 35x35 square image in an avatar pl-1 wrapper
`missing-element` · element: `.avatar / div.avatar.pl-1`

- **Reference:** div.avatar.pl-1 (w 39px, padding-left 4px) wrapping img 35x35 object-fit cover, border-radius 0
- **Ours:** img path renders 35x35 when image_url present (matches), but the no-image fallback is a colored initials chip (.avatar bg #e7e9ef, color #5a6273, 0.78rem/700); the reference has no initials-chip styling captured (always an img), and there is no pl-1 (4px) left-padding wrapper column
- **Location:** web/src/lib/components/AlertFeed.svelte:289-293, 563-587 (.avatar / .avatar-img)

### 🔵 LOW — msgMenu kebab weight/padding mismatch
`spacing` · element: `.menu-trigger / a.msgMenu.dropright.pt-1`

- **Reference:** a.msgMenu.dropright.pt-1: font-weight 600, line-height 30px, padding-top 4px (pt-1) + padding-left 5px, color #0a6db1 (navy), width 18.67px, NO border-radius; glyph '⠇' is literal text content (no pseudo)
- **Ours:** .menu-trigger color var(--username-color)=#0a6db1 (matches), font-weight 600 (matches), but padding 0.1rem (~1.6px) all sides (vs reference pt 4px/pl 5px), .ellipsis 20px/lh1 (vs ref 20px/lh30), and hover flips to font-weight 900 + color #8c8686 (reference msgMenu has no captured hover-weight change)
- **Location:** web/src/lib/components/AlertFeed.svelte:506-527 (.menu-trigger)

### 🔵 LOW — Header gear has no dropdown background/menu tokens captured to compare
`missing-feature` · element: `.settings-dropdown / dropdown-menu`

- **Reference:** gear dropdown-toggle aria-expanded toggles a BS dropdown-menu (Darkly gray per memory) — only the toggle anchor is in this slice; menu contents not captured here
- **Ours:** .menu.settings-dropdown is a custom white menu (bg #fff, border #e3e5ec, radius 8px, shadow) opened on click — likely diverges from the Darkly-gray BS dropdown but the reference menu DOM is not in this slice to confirm exact tokens
- **Location:** web/src/lib/components/AlertFeed.svelte:195-218, 441-444, 528-558

### ⚪ COSMETIC — Gear control: caret rendered as fa-caret-down glyph vs Bootstrap dropdown-toggle CSS triangle
`icon` · element: `.gear caret / .dropdown-toggle::after`

- **Reference:** a.nav-link.dropdown-toggle::after = pure-CSS border triangle (border-width .3em .3em 0; content '') sitting after the fa-cog; it is NOT a Font Awesome glyph
- **Ours:** renders an explicit <Icon name="caret-down" size={10}> (fa-caret-down ) next to the cog
- **Location:** web/src/lib/components/AlertFeed.svelte:193

### ⚪ COSMETIC — alert-qa border-radius 4px vs Bootstrap btn-sm 0.2rem
`size` · element: `.alert-qa border-radius`

- **Reference:** btn-sm border-radius resolves to 0.2rem (~3.2px) per .btn-sm rule (border-radius: 0.2rem); computed border-top-left-radius 4px in capture (the older BS .btn-sm rule = 0.2rem, the BS5 token = var(--bs-border-radius-sm)); the capture's computed rect shows radius 4px
- **Ours:** border-radius: 4px (AlertFeed.svelte:619) — matches the computed 4px
- **Location:** web/src/lib/components/AlertFeed.svelte:619

### ⚪ COSMETIC — alert-qa always rendered on every row (matches reference) — verified, no divergence
`behavior` · element: `.alert-qa presence`

- **Reference:** button.alert-qa present on EVERY msg-box row (both captured rows have it), title 'Ask a question', icon fa-question-circle
- **Ours:** rendered unconditionally on every row (AlertFeed.svelte:302-313) with same title/icon — MATCHES
- **Location:** web/src/lib/components/AlertFeed.svelte:302-313

### ⚪ COSMETIC — Ticker styling — not present in reference alerts slice
`missing-feature` · element: `ticker / symbol rendering`

- **Reference:** No ticker / symbol-pill element exists in rs_alerts_dedup.json; alert body is plain text-formated preText with no separate ticker chip
- **Ours:** bodyText() concatenates 'SYMBOL side note' into the body text via MessageBody (no separate ticker chip) — consistent with reference (no dedicated ticker element)
- **Location:** web/src/lib/components/AlertFeed.svelte:118-121, 318

### ⚪ COSMETIC — Day separator not in reference slice; ours is implemented but unverifiable against this capture
`missing-element` · element: `.separator`

- **Reference:** No separator-row captured in the alerts feed slice (rs_alerts_dedup.json has no .separator node); separator tokens exist globally: --lightTheme-msgs-separator-bg #e8e8e8, --lightTheme-msgs-separator-color #373c42
- **Ours:** .separator bg #e8e8e8, color #373c42, 13px/300, full-width flat bar (AlertFeed.svelte:465-482) — matches the GLOBAL separator tokens (#e8e8e8 bg / #373c42 text), but no per-feed capture to confirm placement
- **Location:** web/src/lib/components/AlertFeed.svelte:460-482

### ⚪ COSMETIC — Header bg / height / padding — MATCH (verified)
`color` · element: `header / nav.alertHeader`

- **Reference:** nav.alertHeader background rgb(10,109,177)=#0a6db1, height 48px, padding 4px (p-1), color #fff
- **Ours:** header background #0a6db1, min-height 48px, padding 4px, color #fff (AlertFeed.svelte:404-406) — MATCHES
- **Location:** web/src/lib/components/AlertFeed.svelte:396-407

---

## CHAT PANEL (web/src/lib/components/ChatPanel.svelte vs protradingroom.com admin room reference)

> Our ChatPanel reproduces the overall layout (blue header, white scroll area, square avatars, left-kebab rows, pill composer with emoji/image/GIF), but diverges on several CONFIRMED computed values: username color (#0a6db1 blue vs our #000), message-body color (#676767 vs our #1a1a1a), timestamp color (#a8a8a8 vs our #8394a9), and row top-border (#e1e1e1 vs our #d9d9d9). The biggest structural divergence is the header: the reference chat/alerts header is a single brand-label + search + gear bar with NO "Main Chat / Off Topic" tabs and NO accent underline, whereas our component invents a two-tab tablist with a 1px #45a2ff bottom border. The reference also renders uploaded images as a separate 300px in-body element (avatar stays an avatar), while we replace the avatar with the image. Several values our code comments cite as authoritative (#000 username, #1a1a1a body) are contradicted by the live computed styles and the resolved --lightTheme tokens.

<details><summary>Reference facts this diff is grounded in</summary>

- rs_chat_dedup/rs_chat.json strong.username: computed color rgb(10,109,177)=#0a6db1, font "Open Sans" 14px / weight 900, margin 0 4px, cursor pointer, tag is <strong>
- rs_chat.json div.msg-left text-formated preText ml-2 mr-2 p-0: body color rgb(103,103,103)=#676767, 13px / line-height 19.5px, margin-left 8px margin-right 8px, white-space pre-wrap, font "Open Sans"
- rs_chat.json span.created-at mr-2: color rgb(168,168,168)=#a8a8a8, 12px / weight 600, margin-right 8px, display inline
- rs_chat.json div.msg-box pb-1: bg rgb(255,255,255)=#fff, border-top 1px solid rgb(225,225,225)=#e1e1e1, padding 0 0 4px 0 (pb-1 only), font "Open Sans"
- rs_chat.json div.separator: bg rgb(232,232,232)=#e8e8e8, font-size 16px weight 300, display flex justify center align center, height ~20px; tokens --lightTheme-msgs-separator-color #373c42 / -bg #e8e8e8
- controls_chat_dedup.json a.msgMenu dropright pt-1 #dropdownMenuLink: glyph ⠇, matchedRule {padding-left:5px; font-size:20px; font-weight:600; color:var(--username-color)!important} → computed color rgb(10,109,177)=#0a6db1; hover color var(--light-brown)=#8c8686 weight 900; Bootstrap dropdown (data-bs-toggle=dropdown, dropright = opens RIGHT)
- rs_chat.json avatar: div.avatar pl-1 wrapper 39x35 (4px pl), inner img 35x35 object-fit cover border-radius 0 (square); uploaded image img.uploaded-img 300px wide object-fit contain rendered in a separate div.img-container below the body
- rs_alerts_dedup.json nav.chat-nav p-1 alertHeader: bg rgb(10,109,177)=#0a6db1, color white, padding 4px all, height 48px, border-bottom-width 0px (NO underline); brand a.navbar-brand ml-1 text label 20px/300 white; search i.fas fa-search () 16px white weight900; gear i.fas fa-cog chat-header-gear () 16px white, dropdown caret via Bootstrap ::after not an FA glyph
- controls_chat_dedup + inventory_other: composer toolbar = far fa-smile (, color #676767, 12px/400) + fas fa-image + GIF text button, inside justify-content-center d-flex flex-row, textAreaBtns class, right-aligned ~x329-410; NO fa-paper-plane / Send button captured
- No msg-box-adm and no msg-right class anywhere in chat captures: all 17 rows are plain left-aligned msg-box with blue username and left kebab; no 'Main Chat'/'Off Topic'/'nav-tabs' text or class found in any slice
- tokens.json: --lightTheme-username-color #0a6db1, --lightTheme-msg-color #676767, --lightTheme-date-color #a8a8a8, --lightTheme-msg-border-color #e1e1e1, --lightTheme-msgs-bg #fff, --lightTheme-msgs-bg-adm #f4f4f4, --lightTheme-textarea-color #676767, --textarea-holder-btns-color #676767, --textarea-holder-btns-hover-color #0a6db1, --light-brown #8c8686

</details>

### 🟠 HIGH — Username color is black, reference is room-blue
`color`

- **Reference:** strong.username computed color rgb(10,109,177)=#0a6db1 (matchedRule color:var(--username-color)!important; --lightTheme-username-color=#0a6db1)
- **Ours:** #000
- **Location:** web/src/lib/components/ChatPanel.svelte:256 (style:color={m.author_color ?? '#000'}) and :574 (.username color:#000)
- **Fix / why:** Default (no per-user author_color) username renders black; reference renders blue #0a6db1. The code comment at :573-575 claiming --username-color 'resolves to #000' is wrong — both --lightTheme-username-color and --darkTheme-username-color are #0a6db1. Fix: default to #0a6db1 (author_color still wins).

### 🟠 HIGH — Message body color too dark
`color`

- **Reference:** div.msg-left computed color rgb(103,103,103)=#676767 (--lightTheme-msg-color)
- **Ours:** #1a1a1a
- **Location:** web/src/lib/components/ChatPanel.svelte:598 (.body color:#1a1a1a)
- **Fix / why:** Body text is near-black; reference is medium gray #676767. Comment at :596-597 claims --msg-color(light)=#1a1a1a but the token is #676767. Fix: color:#676767.

### 🟠 HIGH — Header invents Main Chat / Off Topic tabs not in reference
`missing-feature`

- **Reference:** No tab bar exists; reference chat/alerts header is nav.chat-nav with a navbar-brand text label + ul.nav (search li + gear dropdown li). No 'Main Chat'/'Off Topic' text or ul.nav-tabs/a.nav-link.active anywhere in any slice
- **Ours:** Two-button role=tablist with Main Chat / Off Topic (folder-tab styling, accent fill on active)
- **Location:** web/src/lib/components/ChatPanel.svelte:163-178 (.tabs tablist) and :342-382 (tab CSS)
- **Fix / why:** The reference has a single brand label where we render channel tabs. The orchestrator prompt assumes tabs exist, but they are absent from the capture (could not find chat-nav nav-tabs, 'Off Topic', or 'Main Chat' in rs_chat/rs_all_nodes/controls). If the product genuinely has channels, the visual treatment still differs (brand label vs tab buttons). Confirm whether channels exist in this build; if not, replace the tablist with a brand label.

### 🟠 HIGH — Uploaded images replace the avatar instead of rendering in-body
`behavior`

- **Reference:** An image message keeps the 35px avatar AND renders a separate div.img-container > img.uploaded-img (300px wide, object-fit contain) below the message body
- **Ours:** image_url is rendered AS the avatar (36px square), replacing the initials avatar; no separate in-body image
- **Location:** web/src/lib/components/ChatPanel.svelte:250-254 (img.avatar-img branch on m.image_url)
- **Fix / why:** Semantic mismatch: in our model image_url is the user's gravatar/avatar; in the reference an uploaded media attachment is a 300px contained image inside the message body (img-container/uploaded-img), distinct from the avatar. If image_url is meant to be an attachment, render it as a body image, not the avatar. If it is the avatar, the reference avatar is a separate img the slices show at 35px.

### 🟡 MEDIUM — Timestamp color wrong
`color`

- **Reference:** span.created-at computed color rgb(168,168,168)=#a8a8a8 (--lightTheme-date-color)
- **Ours:** #8394a9
- **Location:** web/src/lib/components/ChatPanel.svelte:589 (.created-at color:#8394a9)
- **Fix / why:** Comment at :586-587 claims --date-color(light)=#8394a9; the actual token is #a8a8a8 and the live computed value is rgb(168,168,168). Fix: color:#a8a8a8. Size 12px/weight 600/normal style all match.

### 🟡 MEDIUM — Header carries an accent underline the reference lacks
`border`

- **Reference:** nav.chat-nav alertHeader border-bottom-width 0px (NO bottom border)
- **Ours:** .tabs border-bottom:1px solid var(--accent,#45a2ff)
- **Location:** web/src/lib/components/ChatPanel.svelte:354 (.tabs border-bottom)
- **Fix / why:** Reference header has no bottom rule; our tab bar paints a 1px #45a2ff underline across the header. Tied to the tabs divergence — removing tabs removes this.

### 🟡 MEDIUM — Kebab default color comment claims #000 but reference is #0a6db1
`color`

- **Reference:** .msgMenu computed color rgb(10,109,177)=#0a6db1 (color:var(--username-color)!important)
- **Ours:** #000 (with comment asserting --username-color resolves to #000)
- **Location:** web/src/lib/components/ChatPanel.svelte:484-492 (.menu-trigger color:#000 + comment)
- **Fix / why:** Same root cause as the username divergence: --username-color is #0a6db1, not #000. The kebab should be blue. Hover color #8c8686 (--light-brown) + weight 900 is correct. Fix: .menu-trigger color:#0a6db1 (or var(--accent)).

### 🟡 MEDIUM — References undefined --msg-font-size token
`font`

- **Reference:** Reference body/msg-box use fixed sizes (body 13px, msg-box 16px) — no --msg-font-size custom property exists in tokens.json
- **Ours:** font-size: var(--msg-font-size) (no fallback)
- **Location:** web/src/lib/components/ChatPanel.svelte:451 (.msg-box) and :602 (.body)
- **Fix / why:** var(--msg-font-size) has no fallback and the token is undefined in the reference cascade; if our app doesn't define it globally the font-size resolves to the inherited/initial value, not 13px. The body line-height:1.5 (≈19.5px on 13px) matches the reference. Fix: use an explicit 13px or add a fallback var(--msg-font-size, 13px).

### 🔵 LOW — Row top-border color wrong
`color`

- **Reference:** div.msg-box border-top 1px solid rgb(225,225,225)=#e1e1e1 (--lightTheme-msg-border-color)
- **Ours:** 1px solid #d9d9d9
- **Location:** web/src/lib/components/ChatPanel.svelte:451 (.msg-box border-top)
- **Fix / why:** Comment at :448 cites --msg-border-color=#d9d9d9; the real token is #e1e1e1 and computed is rgb(225,225,225). Fix: border-top:1px solid #e1e1e1.

### 🔵 LOW — Composer emoji icon uses solid family + wrong size
`icon`

- **Reference:** reaction/composer emoji is far fa-smile (regular/outline, ), color #676767, ~12-18px
- **Ours:** <Icon name="smile" size={18}> → fas fa-smile (solid family, default)
- **Location:** web/src/lib/components/ChatPanel.svelte:292 (emoji button) + Icon.svelte:23 (defaults to fas)
- **Fix / why:** Reference uses the REGULAR (outline) smile (far); our Icon defaults to solid (fas). Pass family="regular" so it renders far fa-smile to match. The image button fas fa-image and GIF text button match the reference textAreaBtns.

### 🔵 LOW — Kebab dropdown opens downward; reference uses dropright (opens to the right)
`behavior`

- **Reference:** a.msgMenu has class 'dropright' + data-bs-toggle='dropdown' → Bootstrap menu opens to the RIGHT of the trigger
- **Ours:** absolute-positioned .menu opens DOWN (top:100%), from left edge on regular rows / right edge on .elevated rows
- **Location:** web/src/lib/components/ChatPanel.svelte:501-524 (.menu positioning)
- **Fix / why:** Reference kebab menu is a Bootstrap dropright (rightward). Our menu drops downward. The kebab glyph ⠇/20px/600 and left placement match the reference; only the menu direction differs.

### 🔵 LOW — Separator font weight/size differ
`font`

- **Reference:** div.separator font-size 16px, font-weight 300, bg #e8e8e8, color (inner text) --lightTheme-msgs-separator-color #373c42, display flex center; height ~20px (line-height 24px)
- **Ours:** .separator font-size 13px, font-weight 300, bg #e8e8e8, color #373c42, line-height 1.5, padding 0
- **Location:** web/src/lib/components/ChatPanel.svelte:428-442
- **Fix / why:** bg #e8e8e8 and color #373c42 match. But reference separator text is 16px (computed), not 13px; weight 300 matches. Our 13px makes the date label smaller. Note the reference separator also contains reaction-tally spans ((4) ✅ at 10px) which is a per-day reaction summary we don't render.

### 🔵 LOW — info icon (fa-question-circle) next to username not implemented
`missing-element`

- **Reference:** Each row's username group contains i.fas fa-question-circle (, 10px, white, weight 900) — a tooltip/info trigger beside the name
- **Ours:** MISSING
- **Location:** n/a (not implemented)
- **Fix / why:** Reference renders a small white question-circle next to each username (white-on-white so only visible on hover/admin tooltip). We render no such element. Low impact since it's effectively invisible, but it is present in every reference row.

### 🔵 LOW — Standalone Send button not present in reference composer
`missing-feature`

- **Reference:** Composer toolbar captured is emoji|image|GIF (textAreaBtns) right-aligned; no fa-paper-plane or 'Send' text button found in any slice (textarea element itself not captured)
- **Ours:** Explicit <button type=submit class=send>Send</button> pill at ChatPanel.svelte:297
- **Location:** web/src/lib/components/ChatPanel.svelte:297
- **Fix / why:** The reference toolbar shows no send button (likely sends on Enter, matching our onComposerKeydown). Our extra Send pill is a divergence, but confidence is limited because the reference textarea/composer row was not fully captured (zero-rect). Verify against a live reference before removing.

### ⚪ COSMETIC — Avatar image size 36 vs reference 35
`size`

- **Reference:** img inside div.avatar pl-1: 35px x 35px, object-fit cover, border-radius 0 (square); wrapper div is 39px wide via 4px padding-left
- **Ours:** 36px x 36px (avatar + avatar-img)
- **Location:** web/src/lib/components/ChatPanel.svelte:251 (img width/height 36) and :547-549 (.avatar/.avatar-img 36px)
- **Fix / why:** Square radius/object-fit cover match; only the box is 36px vs 35px and we lack the 4px pl wrapper offset. Minor.

### ⚪ COSMETIC — Gear renders an explicit caret-down FA glyph; reference uses Bootstrap ::after triangle
`icon`

- **Reference:** gear is i.fas fa-cog chat-header-gear () 16px white; the dropdown caret is drawn by Bootstrap .dropdown-toggle::after (CSS triangle), NOT a separate FA icon
- **Ours:** <Icon name="cog" size={16}> + <Icon name="caret-down" size={10}> (two FA glyphs)
- **Location:** web/src/lib/components/ChatPanel.svelte:191
- **Fix / why:** Visually similar but the reference has no fa-caret-down glyph (none found in any slice). Minor fidelity nit; the cog itself matches at 16px white.

### ⚪ COSMETIC — Composer placeholder text
`behavior`

- **Reference:** placeholder not captured in any slice
- **Ours:** "Type your message here.."
- **Location:** web/src/lib/components/ChatPanel.svelte:288
- **Fix / why:** Cannot confirm the exact reference placeholder string from the slices (no placeholder attr captured). Flagging as unverified, not a confirmed divergence.

---

## MODALS INVENTORY (admin room) — reference modal/menu set vs our SvelteKit modals

> Our 22 modals + 3 modal-like components (AlertQaModal, PollModal, DialogHost) cover essentially every distinct reference modal title and admin menu — the functional coverage is strong. The dominant defect is systemic: the Bootstrap modal shell tokens are wrong. The reference modals are a NAVY-BLUE surface (--modal-content-bg-color #103d5c, color #f4f4f4, border #103d5c, close #0a6db1, success #92d528, danger #bb352a, active-tab #45a2ff, input-group #0a6db1), but our layout.css hardcodes the Darkly GRAY palette (#303030 bg, #fff text, #444 border, #375a7f close, #00bc8c success, #e74c3c danger) — citing report.md §07/§10, which the project memory already flagged as a mis-transcription. Secondary: the "Archives" menu is a real top-nav Bootstrap dropdown in the reference but we render it as always-open sidebar sub-items; and the close control differs (btn-close-white X vs our times icon).

<details><summary>Reference facts this diff is grounded in</summary>

- tokens.json:42 --modal-content-bg-color = #103d5c (navy), NOT #303030
- tokens.json:230 --modal-content-color = #f4f4f4 (near-white), NOT #fff
- tokens.json:127 --modal-content-border-color = #103d5c (same as bg — borderless look)
- tokens.json:251 --modal-btn-close-bg = #0a6db1; tokens.json:41 --modal-btn-close-border = #0a6db1
- tokens.json:182/26 --modal-btn-success-bg/border = #92d528 (lime), NOT #00bc8c
- tokens.json:68/211 --modal-btn-danger-bg/border = #bb352a, NOT #e74c3c
- tokens.json:198/261 --modal-active-tab-bg-color #45a2ff / color #fff; border #45a2ff (210)
- tokens.json:233 --modal-input-group-bg = #0a6db1 (blue addon), NOT #444
- tokens.json:146 --modal-alert-link-color = #0a6db1; tokens.json:20 --modal-upload-files-color = #0a6db1
- tokens.json:105 --archives-dropdown-menu-bg-color = #0e3651 (Archives dropdown panel bg)
- modalsInDom.json distinct titles: Offline, Debug Log, Post Alert, '1 Enter your poll question:' (pollModalHolder), Session Control, Download our mobile apps, ':' (Play For All / media), 'Q&A for Alert:', Muted Chat Users, Followed Chat Users
- inventory_other menus: nav-item dropdown 'Archives' -> [Alert Logs, Chat Logs, Transcript History]; dropdown 'Sort by Trials'; nav-item dropdown dropstart 'Volume'->[Mute]; users-dropdown-options ->[User Info, Mention, Copy]
- buttons inventory: modal footers use btn-close btn-close-white (white X) + btn-secondary 'Close'; Post Alert=btn-success; Connectivity 'Change Devices'=btn-primary, 'Test'=btn-outline-light; UserInfo 'Edit my Info and Avatar'=btn-warning; AlertFilter 'Filter out alerts'=btn-primary; Poll 'Add Choice','Save To Canned','Send Poll'=btn-success
- Bootstrap modal shell classes in reference: 'modal fade' > 'modal-dialog' (modal-lg for Debug Log/Session Control) > 'modal-content' > 'modal-header'/'modal-body'/'modal-footer'; Q&A uses 'modal-header align-items-start' + 'modal-footer flex-nowrap'

</details>

### 🔴 CRITICAL — Modal shell bg is Darkly GRAY, reference is NAVY #103d5c
`color` · element: `.panel / .modal-content (var(--modal-bg))`

- **Reference:** --modal-content-bg-color: #103d5c (tokens.json:42); used as modal-content background
- **Ours:** --modal-bg: #303030
- **Location:** web/src/routes/layout.css:36
- **Fix / why:** Every modal in the app renders gray instead of the reference navy blue. This is the single biggest visual mismatch and it cascades to all 25 modal components since they inherit --modal-bg via Modal.svelte:119. Fix: set --modal-bg: #103d5c. The code comment (layout.css:33-35) cites report.md §07/§10 and project memory note 'report-section07-modal-tokens-wrong' already records that §07 mis-listed Darkly gray; trust tokens.json.

### 🟠 HIGH — Modal border color #444 vs reference #103d5c
`border` · element: `.panel border + .head/.foot dividers (var(--modal-border))`

- **Reference:** --modal-content-border-color: #103d5c (tokens.json:127) — same as bg, so the content edge is effectively borderless
- **Ours:** --modal-border: #444
- **Location:** web/src/routes/layout.css:39
- **Fix / why:** Reference modal-content border equals its bg (#103d5c) → no visible outline; header/footer separators come from Bootstrap's rgba dividers, not #444. Our #444 paints a gray outline and gray header/footer rules that don't exist in the reference. Fix: --modal-border to match #103d5c (or a faint rgba) for the content edge.

### 🟠 HIGH — Close button bg #375a7f vs reference #0a6db1
`color` · element: `.close:hover (Modal.svelte:160-162)`

- **Reference:** --modal-btn-close-bg: #0a6db1, --modal-btn-close-border: #0a6db1 (tokens.json:251,41)
- **Ours:** --modal-close-bg: #375a7f
- **Location:** web/src/routes/layout.css:40
- **Fix / why:** Reference close-button accent is the link-blue #0a6db1, not the muted slate #375a7f. Fix: --modal-close-bg: #0a6db1.

### 🟠 HIGH — Success button lime #92d528 vs our teal #00bc8c
`color` · element: `Post Alert / Save / Send Poll / Done btn-success across modals (var(--modal-success))`

- **Reference:** --modal-btn-success-bg / -border: #92d528 (tokens.json:182,26)
- **Ours:** --modal-success: #00bc8c
- **Location:** web/src/routes/layout.css:41
- **Fix / why:** Reference success buttons (Post Alert, Save, Send Poll, Done) are lime green #92d528, our token is Darkly teal #00bc8c. Affects PostAlertModal, AVSettingsModal, ConnectivityCheckModal, SessionControlModal, PollModal. Fix: --modal-success: #92d528 (note this is the BUTTON color; the room's general --positive is also #92d528, so they align).

### 🟠 HIGH — Active-tab accent #00bc8c vs reference #45a2ff
`color` · element: `active tab in SettingsModal / multi-tab modals (var(--modal-active-tab) → --accent in Modal.svelte:114)`

- **Reference:** --modal-active-tab-bg-color: #45a2ff, --modal-active-tab-color: #fff, --modal-tabs-border-color: #45a2ff (tokens.json:198,261,210)
- **Ours:** --modal-active-tab: #00bc8c
- **Location:** web/src/routes/layout.css:43
- **Fix / why:** Reference modal tab highlight is bright blue #45a2ff, our token is teal #00bc8c — wrong hue entirely. Modal.svelte:114 maps --accent to this token, so any tabbed modal (Settings) shows a teal active tab instead of blue. Fix: --modal-active-tab: #45a2ff.

### 🟡 MEDIUM — Danger button #e74c3c vs reference #bb352a
`color` · element: `danger buttons/links in UserInfoModal:155, ScheduledAlertsModal:135 (var(--modal-danger))`

- **Reference:** --modal-btn-danger-bg / -border: #bb352a (tokens.json:68,211)
- **Ours:** --modal-danger: #e74c3c
- **Location:** web/src/routes/layout.css:42
- **Fix / why:** Reference danger is the darker brick #bb352a, not bright #e74c3c. Fix: --modal-danger: #bb352a.

### 🟡 MEDIUM — Input-group addon bg #444 vs reference #0a6db1
`color` · element: `span.input-group-text.btn addons (Play For All / Save buttons)`

- **Reference:** --modal-input-group-bg: #0a6db1 (tokens.json:233)
- **Ours:** --modal-input-bg: #444 (and modals hardcode --modal-btn-secondary #444 for input-group-text)
- **Location:** web/src/routes/layout.css:44; PlayYouTubeModal.svelte:106-140; MediaForAllModal
- **Fix / why:** Reference input-group addon buttons (the 'Save'/'Play For All' attached buttons) are blue #0a6db1, not gray #444. PlayYouTubeModal.svelte:106 comment even claims '#444 (--modal-input-group-bg)' — the token is actually #0a6db1, so the comment is wrong. Fix: --modal-input-bg: #0a6db1 and correct the comment.

### 🟡 MEDIUM — --modal-btn-primary #375a7f vs reference link-blue usage #0a6db1
`color` · element: `btn-primary buttons in AlertLogsModal:77, ChatLogsModal:78, MutedUsersModal:37, ScheduledAlertsModal:157`

- **Reference:** Reference has no --modal-btn-primary token; the blue accents on modal buttons/links resolve to #0a6db1 (--modal-btn-close-bg, --modal-alert-link-color, --modal-upload-files-color all = #0a6db1)
- **Ours:** --modal-btn-primary: #375a7f
- **Location:** web/src/routes/layout.css:47
- **Fix / why:** We invented --modal-btn-primary #375a7f (the room navy primary). The reference's primary-blue modal buttons (e.g. 'Reload Log List' btn-primary, 'Filter out alerts' btn-primary) read at #0a6db1, not #375a7f. Reconcile to #0a6db1 for modal-context primary buttons.

### 🟡 MEDIUM — Archives is a top-nav dropdown in reference, sidebar inline list in ours
`behavior` · element: `.nav-item dropdown (Archives)`

- **Reference:** menus[0]: 'nav-item dropdown' with items [Archives, Alert Logs, Chat Logs, Transcript History] and a 'dropdown-menu users-dropdown-options' panel (bg --archives-dropdown-menu-bg-color #0e3651) that opens on click
- **Ours:** Rendered as always-visible sidebar group: a .group with one .item 'Archives' + three .sub-item buttons, no collapse/dropdown
- **Location:** web/src/lib/components/RoomSidebar.svelte:115-150
- **Fix / why:** Reference Archives is a collapsed Bootstrap dropdown that expands to a #0e3651 panel; we show the three children permanently expanded in the white sidebar. Placement also differs: reference dropdown lives in the navbar nav, ours is in the left sidebar. Functionally the same three destinations (Alert Logs, Chat Logs, Transcript History) are present, so this is structure/behavior, not a missing feature.

### 🟡 MEDIUM — 'Transcript History' is disabled/stub in our build
`missing-feature` · element: `Transcript History menu item`

- **Reference:** Archives dropdown item 'Transcript History' (menus[0], menus[2]) is a live dropdown-item small
- **Ours:** Sidebar sub-item 'Transcript History' rendered with the disabled attribute (no modal, no handler)
- **Location:** web/src/lib/components/RoomSidebar.svelte:141-148
- **Fix / why:** We list Transcript History but it is hard-disabled with no backing modal — there is no TranscriptHistoryModal.svelte. The reference exposes it as a real archive destination. Either wire a modal or note it as a deliberate stub; currently it's a visible dead control.

### 🔵 LOW — Modal close control: btn-close-white (X glyph) vs our Phosphor/FA 'times' icon button
`icon` · element: `.close button`

- **Reference:** buttons inventory repeatedly shows ariaLabel 'Close' class 'btn-close btn-close-white' — Bootstrap's white SVG-mask X, no border
- **Ours:** <button class='close'> with <Icon name='times' size=18/> inside a bordered button
- **Location:** web/src/lib/components/Modal.svelte:64-72,147-158
- **Fix / why:** Reference uses Bootstrap btn-close-white (borderless white X mask). Ours is a Font Awesome/Phosphor 'times' glyph in a 1px-bordered box (border var(--modal-border)). Visually close but the bordered box and glyph weight differ from the flat btn-close. Consider removing the border and matching the btn-close mask sizing.

### 🔵 LOW — Q&A modal header/footer modifier classes not mirrored
`class` · element: `AlertQaModal .dialog`

- **Reference:** modalsInDom: Q&A uses 'modal-header align-items-start' and 'modal-footer flex-nowrap'; AlertQaModal also nests an admin-alert identity block in the header
- **Ours:** AlertQaModal.svelte has a custom header (.head-main + .admin-alert) and a generic close; not built on the shared Modal.svelte and uses its own .dialog shell
- **Location:** web/src/lib/components/AlertQaModal.svelte:151-177
- **Fix / why:** AlertQaModal is a bespoke dialog (not using Modal.svelte), so it does NOT inherit the --modal-* token remap in Modal.svelte:111-118. Verify its bg/border/buttons are themed to the navy modal palette independently — otherwise it will diverge from the (corrected) shared shell. Title text 'Q&A for Alert:' matches the reference exactly.

### 🔵 LOW — PollModal is a floating draggable panel, reference is .modal + pollModalHolder
`structure` · element: `.poll-panel`

- **Reference:** modalsInDom: 'pollModalHolder' with title '1 Enter your poll question:' inside the modal stack; buttons 'Add Choice', 'Save To Canned', 'Send Poll' (btn-success), window controls fa-window-minimize/maximize/times
- **Ours:** PollModal.svelte renders a draggable .poll-panel with titlebar 'Polls' + min/max/close, two nav-tabs, Add Choice / Save To Canned / Send Poll
- **Location:** web/src/lib/components/PollModal.svelte:165-231
- **Fix / why:** Feature parity is good (all reference poll buttons + window controls present). Reference poll lives inside a pollModalHolder within the Bootstrap modal layer; ours is a free-floating draggable panel. Behavior/placement differs but no missing feature. Like AlertQaModal it's a bespoke shell — confirm it picks up the navy modal tokens.

### 🔵 LOW — No standalone 'Offline' modal component
`missing-element` · element: `Offline modal`

- **Reference:** modalsInDom[0]: 'modal fade' title 'Offline' with modal-body.py-0 and modal-footer.text-center — the connection-lost modal
- **Ours:** Handled by ConnectionOverlay.svelte (full-screen overlay, bg var(--bg-elev-2) #103d5c) rather than a Bootstrap modal
- **Location:** web/src/lib/components/ConnectionOverlay.svelte (no modal in modals/ dir)
- **Fix / why:** Reference shows an 'Offline' modal in the DOM; we implement the offline/reconnect state as ConnectionOverlay instead of a titled modal. Functionally equivalent (and already navy #103d5c). Not a gap, but note the mechanism differs from the reference's modal.

### 🔵 LOW — User chat dropdown: reference items [User Info, Mention, Copy] vs our set
`behavior` · element: `users-dropdown-options menu`

- **Reference:** menus 'dropdown-menu users-dropdown-options' repeated ~50x with items [User Info, Mention, Copy] — the per-message/per-user kebab in chat
- **Ours:** Chat kebab/user menu handled in ChatPanel.svelte + UserInfoModal; verify the three items User Info / Mention / Copy are all present and in that order
- **Location:** web/src/lib/components/ChatPanel.svelte; UserInfoModal.svelte
- **Fix / why:** Reference per-user dropdown is exactly [User Info, Mention, Copy]. Confirm our chat kebab offers the same three actions with the same labels (the inventory does NOT show admin-only extras like Mute/Follow in this particular dropdown — those live in the UserInfo modal as btn-outline-warning 'Mute' / btn-outline-info 'Follow').

### ⚪ COSMETIC — Modal text color #fff vs reference #f4f4f4
`color` · element: `.panel color (var(--modal-color))`

- **Reference:** --modal-content-color: #f4f4f4 (tokens.json:230)
- **Ours:** --modal-color: #ffffff
- **Location:** web/src/routes/layout.css:38
- **Fix / why:** Reference uses near-white #f4f4f4, not pure #fff. Code comment at layout.css:37 explicitly (and wrongly) claims '--modal-content-color is pure #fff'. Comment-vs-token drift. Fix: --modal-color: #f4f4f4.

### ⚪ COSMETIC — Modal-content border-radius — verify 6px
`size` · element: `.panel border-radius`

- **Reference:** Modal.svelte comment claims reference .modal-content radius is 6px (the dominant radius token). tokens.json --bs-border-radius = .375rem (6px); --bs-border-radius-lg = .5rem (8px). modal-content computed radius was not captured (modals visible:false).
- **Ours:** border-radius: 6px
- **Location:** web/src/lib/components/Modal.svelte:122
- **Fix / why:** 6px is plausible (matches --bs-border-radius). Cannot confirm from the capture because all modals are visible:false (no computed rect/style). Flagging as unverified; if a live admin capture becomes available, confirm .modal-content's actual border-radius.

---

## BUTTONS / CONTROLS / INPUTS (cross-cutting)

> The reference renders all controls with stock Bootstrap 5 (LIGHT theme: --bs-primary #0d6efd, --bs-secondary #6c757d, --bs-dark #212529, --bs-success #198754, white form-control bg) plus a custom legacy btn-default (#f4f4f4 bg / #45a2ff text) and Open Sans 14px / weight 400 / radius 4px (.25rem). Our repo has NO Bootstrap dependency and no shared button component: every button is hand-rolled per component with semantic classes, a navy room palette, var(--radius)=6px, font-weight 600, and font-size ~0.8-0.85rem. Several in-room controls match the captured BS values closely (alert-qa badge, app-info-btn, sidebar sort), but the modal/dialog button system, the Mute primary color, the sidebar search button, the chat composer/send pill, the kebab color, and all btn-outline-* user-menu variants diverge. NOTE: modals render as dark "Darkly" in our repo while the reference tokens are stock BS5 light — that token surface is owned by another agent; here it is flagged only where it changes a button/input's computed appearance.

<details><summary>Reference facts this diff is grounded in</summary>

- inventory_other.json buttons[278]: 50x 'btn btn-sm btn-secondary me-1 alert-qa', 13x 'btn btn-secondary', 6x 'btn btn-primary', 5x 'btn btn-outline-light', 3x 'btn btn-sm btn-dark', 3x 'btn btn-success', plus single btn-light/btn-warning/btn-info/btn-outline-info/-warning/-danger/-dark/-secondary and legacy btn-default. 22x 'btn-close btn-close-white'.
- rs_all_nodes.json computed btn-secondary: background rgb(108,117,125)=#6c757d, color #fff, border 1px solid #6c757d, radius 4px, font 14px/21px weight 400 'Open Sans', padding 4px 8px (btn) / 1px 3px font 10px/15px (alert-qa badge).
- rs_all_nodes.json computed btn-dark: background rgb(33,37,41)=#212529, color #fff, border 0, radius 4px, 14px/21px, padding 3px 6px, height 27px.
- rs_all_nodes.json computed btn-default (reload/search-room-users): background rgb(244,244,244)=#f4f4f4, color rgb(69,162,255)=#45a2ff, border none, radius 4px, 14px (legacy BS3 class, custom-skinned).
- tokens.json cssVariables.root: --bs-primary #0d6efd, --bs-secondary #6c757d, --bs-success #198754, --bs-danger #dc3545, --bs-warning #ffc107, --bs-info #0dcaf0, --bs-light #f8f9fa, --bs-dark #212529, --bs-body-bg #fff, --bs-border-radius .375rem, --bs-border-radius-sm .25rem, --bs-link-color #0d6efd. Stock Bootstrap 5, NOT Darkly.
- inputs[77]: 40x form-check-input, 12x 'form-control ng-...', 3x 'txt-area form-control border-0' (chat composer), 2x form-select, 2x volCtrl range. Types: 40 checkbox, 10 radio, 7 textarea, 4 text, 4 color, 3 select, 2 range/url/datetime-local, 1 number/file/search.
- msgMenu kebab computed (multiple slices): tag a, content '⠇', color rgb(10,109,177)=#0a6db1, font 20px weight 600 'Open Sans', padding 4px 0 0 5px, w18.67 h34, no radius.
- Reference search-room-users and reload-room-users are BOTH 'btn btn-sm btn-default' (bg #f4f4f4 / icon #45a2ff); cog is 'btn-sm btn-dark' (#212529); sort lives in 'flex-fill users-btns' (transparent, #676767 700 14px).

</details>

### 🟠 HIGH — No Bootstrap / no shared button primitive
`structure`

- **Reference:** Stock Bootstrap 5 .btn system: every button is .btn + a variant (btn-secondary/dark/primary/success/outline-*), uniform .375rem radius (btn) / .25rem (btn-sm), 1rem/.875rem font, weight 400, Open Sans
- **Ours:** No bootstrap dependency in package.json; no shared Button component. Each component re-implements buttons with bespoke semantic classes (.mute, .action, .send, .app-info-btn, .mini, .btn.primary) using var(--radius)=6px, font-weight 600, font-size 0.8-0.85rem
- **Location:** web/package.json (no bootstrap); web/src/routes/layout.css:101 (only a bare button{} reset); per-component <style> blocks
- **Fix / why:** Button geometry/typography drifts per component instead of one BS-matched primitive. A single shared .btn + .btn-sm rule (radius 4px, weight 400, 14px Open Sans, padding 3-4px/6-8px) would align the whole surface. Currently radius (6 vs 4), weight (600 vs 400) and size are inconsistent app-wide.

### 🟠 HIGH — Sidebar search button inverts btn-default colors
`color`

- **Reference:** search-room-users is 'btn btn-sm btn-default': background #f4f4f4, icon color #45a2ff (same as reload-room-users)
- **Ours:** .mini-search background #45a2ff, color #f4f4f4 (the INVERSE of btn-default)
- **Location:** web/src/lib/components/RoomSidebar.svelte:557-561
- **Fix / why:** Direct color inversion: the reference search button is light-gray bg with a blue glyph, ours is blue bg with light-gray glyph. Swap to background #f4f4f4 / color #45a2ff to match reload (.mini-reload, which is correct at lines 546-549).

### 🟠 HIGH — btn-outline-* user-menu variants all rendered as one filled style
`missing-feature`

- **Reference:** User menu uses distinct BS outline variants: @Mention=btn-outline-light (transparent bg, #f8f9fa text+border), Follow=btn-outline-info (#0dcaf0), Mute=btn-outline-warning (#ffc107), Reset=btn-outline-danger (#dc3545) — each transparent-bg with its own colored text+border
- **Ours:** All four are class='action' with identical fill: background var(--bg-elev), border 1px var(--border), color var(--text) — no per-action color, not outline style
- **Location:** web/src/lib/components/modals/UserInfoModal.svelte:36-56,202-214
- **Fix / why:** The reference's color-coded outline buttons (gray Mention, cyan Follow, amber Mute, red Reset) collapse to four identical gray-filled buttons in ours. Add per-action outline variants matching btn-outline-light/info/warning/danger to restore the visual affordance.

### 🟠 HIGH — Chat composer is a pill with rounded Send, reference is flat icon row
`structure`

- **Reference:** Composer = 'txt-area form-control border-0' textarea + flat textAreaBtns icon buttons (26x34, color #676767) + a GIF button (textAreaBtnsCol, 81x35). No rounded pill container, no pill Send button visible in inventory (send is icon-driven)
- **Ours:** .pill wrapper border-radius:999px containing textarea + .ic icon buttons + a separate rounded .send pill button (background #0a6db1, border-radius 999px, padding 0.45rem 0.9rem)
- **Location:** web/src/lib/components/ChatPanel.svelte:280-298,617-678
- **Fix / why:** The reference composer is a flat full-width textarea with a flat icon button row, not a 999px-radius pill with a pill Send button. The pill geometry + the explicit rounded Send button are not in the reference. Reconcile to a flat textarea (form-control, border-0) with flat 26x34 icon buttons.

### 🟠 HIGH — Modal form-control inputs use dark Darkly fill, reference is white BS form-control
`color`

- **Reference:** Stock BS5 form-control: background #fff (--bs-body-bg), color #212529, 1px solid #ced4da border, radius .375rem (6px). form-select likewise white.
- **Ours:** Modal inputs (.term, .date input, .field) use background var(--bg-elev)=#444 (modal Darkly remap), color var(--text)=#fff, 1px var(--border)=#444, radius var(--radius)=6px
- **Location:** web/src/lib/components/modals/AdvancedSearchModal.svelte:171-181,217-225; web/src/lib/components/DialogHost.svelte:88-98; web/src/lib/components/Modal.svelte:111-118
- **Fix / why:** Reference inputs are white BS form-controls; ours are dark (#444) because modals are themed Darkly. This is driven by the modal --modal-* tokens (the dark-vs-light modal token surface is owned by another agent), but it directly changes every form-control/form-select appearance. Padding also differs (ours ~0.45rem vs BS .375rem .75rem).

### 🟡 MEDIUM — Button border-radius 6px vs reference 4px
`size`

- **Reference:** btn computed border-top-left-radius: 4px (= --bs-border-radius-sm .25rem); btn-secondary/dark/default all 4px
- **Ours:** var(--radius)=6px used by .btn.primary/.ghost (DialogHost.svelte:110), .action (UserInfoModal.svelte), .mute (RoomTopNav.svelte:474)
- **Location:** web/src/routes/layout.css:32 (--radius:6px); web/src/lib/components/DialogHost.svelte:110
- **Fix / why:** Every modal/dialog button is 2px rounder than the reference. Either introduce a button-specific 4px radius token or set var(--radius) usage on buttons to 4px to match BS btn radius.

### 🟡 MEDIUM — Button font-weight 600 vs reference 400
`font`

- **Reference:** All captured btn variants font-weight: 400 (btn-secondary, btn-dark, btn-default)
- **Ours:** font-weight 600 on .btn (DialogHost.svelte:112), .action (UserInfoModal.svelte:212), .send (ChatPanel.svelte:667), .rooms-refresh (AdvancedSearchModal.svelte)
- **Location:** web/src/lib/components/DialogHost.svelte:112; web/src/lib/components/modals/UserInfoModal.svelte:212
- **Fix / why:** Our modal/dialog/composer buttons render bolder than the reference's regular-weight BS buttons. Set button font-weight to 400 to match.

### 🟡 MEDIUM — Mute button uses room accent #45a2ff, reference btn-primary is #0d6efd
`color`

- **Reference:** button.btn.btn-primary.btn-sm 'Mute' = stock BS5 primary, background #0d6efd, border #0d6efd, color #fff, radius 4px
- **Ours:** background var(--accent)=#45a2ff, border var(--accent), border-radius var(--radius)=6px
- **Location:** web/src/lib/components/RoomTopNav.svelte:469-479
- **Fix / why:** Intentional re-theme (comment says 'primary = room accent') but it diverges from the reference's literal BS primary blue #0d6efd and uses 6px not 4px radius. Flag as a deliberate-but-divergent choice; if 1:1 fidelity is the goal, use #0d6efd / 4px.

### 🟡 MEDIUM — Chat row kebab color #000 vs reference #0a6db1
`color`

- **Reference:** msgMenu '⠇' computed color: rgb(10,109,177) = #0a6db1 (room blue), font 20px weight 600 Open Sans, padding 4px 0 0 5px, no radius
- **Ours:** .menu-trigger color: #000 (comment claims '--username-color resolves to #000'), weight 600, ellipsis 20px
- **Location:** web/src/lib/components/ChatPanel.svelte:487-495
- **Fix / why:** Comment-vs-capture mismatch: the captured computed kebab color is #0a6db1, not #000. The code hardcodes black. Set .menu-trigger color to #0a6db1 (the username/room blue) to match the reference glyph. Padding also differs (ours 0.1rem all sides vs reference 4px-top/5px-left asymmetric).

### 🟡 MEDIUM — btn-close (X) implemented as bordered Icon button, not BS btn-close-white
`icon`

- **Reference:** 22x 'btn-close btn-close-white': Bootstrap's borderless SVG-X close glyph (data-URI mask, white via btn-close-white filter), no border, 1em box
- **Ours:** Custom .close button: transparent bg, 1px solid var(--modal-border) BORDER, var(--radius)=6px, renders a FontAwesome 'times' Icon at 18px
- **Location:** web/src/lib/components/Modal.svelte:64-72,147-163
- **Fix / why:** Reference close is a borderless BS SVG-X; ours is a bordered rounded square with a FA times glyph. Visually heavier. Drop the border + radius and match the BS btn-close (borderless ~16px X) for fidelity.

### 🔵 LOW — Button font-size below reference 14px
`size`

- **Reference:** btn computed font-size: 14px (btn-sm) / Open Sans
- **Ours:** 0.85rem (13.6px) on .btn (DialogHost.svelte:113), 0.8rem (12.8px) on .action (UserInfoModal.svelte:211) and .rooms-refresh (0.8rem), 0.82rem on .send (ChatPanel.svelte:668)
- **Location:** web/src/lib/components/DialogHost.svelte:113; web/src/lib/components/modals/UserInfoModal.svelte:211
- **Fix / why:** Modal/menu buttons are ~0.4-1.2px smaller than the reference 14px. Minor but compounds with the weight/radius drift.

### 🔵 LOW — Checkbox/radio accent teal #00bc8c vs reference BS default
`color`

- **Reference:** form-check-input (40 instances) is stock BS5: checked background #0d6efd (--bs-primary), 1px #dee2e6 border, white-bg unchecked
- **Ours:** accent-color: #00bc8c (Darkly teal) on .check input[type=checkbox] (comment cites '--checkbox-bg-color teal #00bc8c')
- **Location:** web/src/lib/components/modals/AdvancedSearchModal.svelte:198-200
- **Fix / why:** Reference tokens are stock BS5 (#0d6efd primary), so the teal #00bc8c accent is a Darkly assumption not present in the captured tokens.json. If matching stock BS5, checkbox accent should be #0d6efd; if the running reference actually used a teal custom var it must be re-confirmed (tokens.json shows BS5 light, not Darkly).

### 🔵 LOW — rooms-refresh styled as btn-info Darkly #3498db, BS5 info is #0dcaf0
`color`

- **Reference:** btn-info per tokens --bs-info = #0dcaf0 (stock BS5 cyan)
- **Ours:** .rooms-refresh background #3498db (Darkly btn-info blue per comment)
- **Location:** web/src/lib/components/modals/AdvancedSearchModal.svelte:138-148
- **Fix / why:** Comment says 'Bootstrap btn-info (Darkly cyan-blue)' and uses #3498db, but the captured tokens are stock BS5 where --bs-info is #0dcaf0. Another Darkly-vs-BS5 mismatch; reconcile to #0dcaf0 if matching captured tokens.

### ⚪ COSMETIC — Alert-qa badge matches reference (no divergence)
`color`

- **Reference:** alert-qa = btn-sm btn-secondary: background #6c757d, border 1px #6c757d, color #fff, font 10px/15px weight 400, padding 1px 3px, radius 4px, min-height 19px
- **Ours:** .alert-qa background #6c757d, border 1px #6c757d, color #fff, 10px/15px weight 400, padding 1px 3px, radius 4px, min-height 19px; hover #5c636a/#565e64 (matches BS secondary hover)
- **Location:** web/src/lib/components/AlertFeed.svelte:604-626
- **Fix / why:** MATCH — documented for completeness. This badge is a faithful 1:1 of the reference btn-sm btn-secondary including the hover darken. No change needed.

### ⚪ COSMETIC — app-info-btn and sidebar sort match reference (no divergence)
`color`

- **Reference:** app-info-btn = btn-sm btn-secondary #6c757d/#fff padding 4px 8px radius 4px 14px; sort = users-btns transparent #676767 700 14px
- **Ours:** .app-info-btn background #6c757d border #6c757d color #fff padding 4px 8px radius 4px 14px weight 400 (RoomSidebar.svelte:354-365); sidebar reload .mini-reload #f4f4f4/#45a2ff matches btn-default (lines 546-549)
- **Location:** web/src/lib/components/RoomSidebar.svelte:354-369,545-549
- **Fix / why:** MATCH for app-info-btn and reload. Documented to bound the diff — these two are correct; only .mini-search (inverted) and .mini-cog (unverified, separate item) need attention.

---

## 50 TARGETED KEY ELEMENTS (nav, sidebar, tabs, msg rows, separators, composer, webcam/presentation shell) — deep dive vs reference computed styles + matchedRules

> Our SvelteKit room shell matches the reference on the overwhelming majority of the 50 targeted elements — the design tokens (--bg #0c2434, --bg-elev #0f2e43, --bg-elev-2 #103d5c, --accent #45a2ff) map 1:1 onto the reference's computed navy/blue palette, and the high-signal elements (top nav, sidebar-menu button, users counter, active tabs, screens tabs, presentation-box, webcam card, pNameLabel, room-sound-options) are reproduced faithfully with reference-grounded comments. The notable divergences are: the files-badge color/border (we use coral+black-border, reference computes Bootstrap #dc3545 with NO border), the sidebar's extra right border (reference border-right-width:0), and the brand slot being text instead of the reference's <img class="brand-logo"> (already self-flagged in code). Note: the matchedRules in targeted.json carried selectors only (no declaration bodies — all "None"), so every divergence below is grounded in the reliable 85-property computed `style` block instead.

<details><summary>Reference facts this diff is grounded in</summary>

- nav.mainAppNav (idx 0): bg rgb(12,36,52)=#0c2434, h 49px, position fixed, z-index 1030, Open Sans 300/16px/24px, flex row align-items center — matches our --bg token
- span.sidebar-menu (idx 1): bg rgb(16,61,92)=#103d5c, border 1px solid transparent, padding 1px 5px, margin 0 5px, white 18px/27px weight 300
- span.users (idx 2): border 1px SOLID rgb(255,255,255), bg transparent, padding 1px 5px, margin 0 4px, 14px/21px weight 300
- span.mobile-info-app-btn (idx 3): Font Awesome 5 Free, weight 900, 16px, white, no border, margin-right 4px
- a.navbar-brand + img.brand-logo (idx 4/8): the brand is an <img> 200x18 (max-width 200px), NOT text
- a.nav-link.active chat tab (idx 28): bg rgb(69,162,255), border 1px solid rgb(69,162,255) all sides, white, padding 8px 5px 5px, border-top-radius 6px, 12px/18px weight 700
- a.nav-link.active main/screens tab (idx 29/30): bg rgb(69,162,255), white, margin 5px all, padding 8px (main) / 4px (screens), border-top-radius 3px, 12px/12px weight 300
- ul.screens-tabs (idx 24): bg rgb(12,36,52)=#0c2434, flex-wrap, h 40px, border-bottom-width 1px, z-index 1
- span.files-badge (idx 34/35/36, all 3 unanimous): bg rgb(220,53,69)=#dc3545, border-top-width 0px (NO border), color #fff, 9px/9px weight 700, padding 3.15px 5.85px, radius 800px, margin -9px 0 0 3px
- as-split-area.presentation-box (idx 49): bg rgb(15,46,67)=#0f2e43=--bg-elev, position relative
- div.card.webcamsHolder (idx 41): 320x240, margin 5px, border-top-color rgb(154,205,50)=yellowgreen, z-index 105, cursor move
- video.webcamsHolderVideo (idx 43): 318x238, object-fit contain, position relative
- div.overlay (idx 45): position absolute, z-index 101, width 318
- h5.pNameLabel (idx 47): bg rgba(0,0,0,0.5), color #fff, 20px/24px weight 500, text-align center, full width
- div.sidebar-wrapper (subtree_sidebar): bg rgb(255,255,255), color rgb(103,103,103)=#676767, width 250px, border-right-width 0px, box-shadow none
- div.room-sound-options (idx 12): padding-left 30px, text-align left, color #ccc

</details>

### 🟡 MEDIUM — files-badge background is coral, reference is Bootstrap red #dc3545
`color` · element: `.files-badge / .badge.rounded-pill.bg-danger`

- **Reference:** background-color: rgb(220, 53, 69) = #dc3545 (idx 34/35/36 all three targeted captures agree)
- **Ours:** background: rgb(231, 76, 60) (coral)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/FilesPanel.svelte:313

### 🟡 MEDIUM — files-badge has a 1px solid black border; reference has none
`border` · element: `.files-badge`

- **Reference:** border-top-width: 0px (no border on .files-badge in all 3 targeted captures)
- **Ours:** border: 1px solid #000000
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/FilesPanel.svelte:309

### 🔵 LOW — files-badge font sizing is em-relative; reference is fixed 9px
`size` · element: `.files-badge`

- **Reference:** font-size: 9px; line-height: 9px; padding: 3.15px 5.85px (computed, fixed px)
- **Ours:** font-size: 0.75em; line-height: 1; padding: 0.35em 0.65em
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/FilesPanel.svelte:307-315

### 🔵 LOW — Sidebar carries a right border; reference sidebar-wrapper has border-right-width 0
`border` · element: `.sidebar (aside)`

- **Reference:** div.sidebar-wrapper border-right-width: 0px (subtree_sidebar.json)
- **Ours:** border-right: 1px solid var(--border)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomSidebar.svelte:277

### 🔵 LOW — Brand slot is text, reference is an <img class="brand-logo">
`missing-element` · element: `a.navbar-brand / img.brand-logo`

- **Reference:** a.navbar-brand contains img.brand-logo (200x18, max-width 200px, line-height 30px) — a logo IMAGE
- **Ours:** <span class="brand">{roomName}</span> — plain text, font-size 20px weight 300
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomTopNav.svelte:90,314

### ⚪ COSMETIC — nav z-index lower than reference (cosmetic / stacking)
`behavior` · element: `.topnav (nav)`

- **Reference:** nav.mainAppNav z-index: 1030 (Bootstrap fixed-top)
- **Ours:** z-index: 40
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomTopNav.svelte:216

### ⚪ COSMETIC — webcam card z-index differs from reference
`behavior` · element: `.card.webcamsHolder`

- **Reference:** div.card.webcamsHolder z-index: 105 (idx 41); video overlay z-index 101 (idx 45), close 102
- **Ours:** .card uses default stacking + .card.dragging z-index:200; overlay z-index 101; close z-index 102
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/WebcamHolder.svelte:173,194,221

### ⚪ COSMETIC — screens-tabs border-bottom is transparent vs reference 1px
`border` · element: `.screens-tabs`

- **Reference:** ul.screens-tabs border-bottom-width: 1px (idx 24); bottom-color not captured (likely transparent)
- **Ours:** border-color: transparent (no explicit 1px border-bottom width)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ScreenStage.svelte:145

### ⚪ COSMETIC — top nav background uses elevated note: nav is transparent-bordered (verified match, no divergence)
`color` · element: `.topnav — MATCHES (listed for completeness)`

- **Reference:** nav.mainAppNav background-color: rgb(12,36,52) = #0c2434
- **Ours:** background: var(--bg) = #0c2434
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomTopNav.svelte:227

---
