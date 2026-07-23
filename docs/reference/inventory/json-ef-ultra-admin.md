# proroom-ultra-admin-room.json

- **path**: `evidence-folder/proroom-ultra-admin-room.json`
- **kind**: json-capture
- **size**: 15,201,102 bytes (~14.5 MB) — verified via `wc -c`
- **role**: admin (ultra-admin room) — determined from `meta.label` = `"admin-room"`; presence of admin-only surfaces confirmed below (`msg-box-adm` class on 18 elements; roster admin controls "Sort by Trials", "Reload Users", "Sort Users", "Search Users"; "Mute" buttons; `alert-qa` on 50 elements). Note: `meta.role` key is **absent** (`undefined`); role inferred from `label` + admin surfaces, not a role field.
- **format/quality**: rendered DOM + computed styles + rects (this is a rich structured capture, NOT a raw HTML dump). Top-level keys: `meta, head, cssVariables, fonts, stylesheets, palette, elements, subtrees, targeted, controls, assets, inventory, errors`. `errors` is empty `[]`. `meta.elementsCapped` = false (nothing truncated).

## Capture metadata (cited)
- `meta.url` = `https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1` — room id `652754202ad80b3e7c5131e2`.
- `meta.title` = `"Mastering The Trade"`; `head` fontLinks show FA pinned at `v5.8.1` (`https://use.fontawesome.com/releases/v5.8.1/css/all.css`).
- `meta.viewport` = `{w:1989, h:1166, dpr:2}`; `meta.userAgent` = Android 15 / Pixel 9 Chrome 149 (mobile UA string but desktop-width 1989px viewport, `tooNarrow:false`).
- `meta.theme` = `{htmlClass:"", bodyClass:"", dataTheme:null}` — no theme class applied at capture (default). App is **Angular** (`app-st-message`, `app-room`, `app-presentationarea`, `ng-star-inserted` throughout).

## Structural counts (cited)
- `elements` array: **2,639** nodes. Each node shape = `{path, tag, rect:{x,y,w,h}, attrs, icon, style:{...computed}}` (verified on `elements[0]` = `html`, rect 1989x1166 with full computed `style` block).
- `subtrees` (5): `topnav` (count 68, 24 nodes, rootPath `nav.navbar...fixed-top`), `sidebar` (count 67, 52 nodes, rootPath `div.room-sidebar`), `presentation` (count 553, 50 nodes, rootPath `app-presentationarea` inside `as-split-area.presentation-box`), `webcams` (count 16, 8 nodes, rootPath `app-webcam-holder`), `roomShell` (count 600, 419 nodes, rootPath `app-room#topRoomDiv`). All `found:true`.
- `targeted`: **50** entries (keys "0".."49"), each `{querySelector, path, tag, class/id, rect, ...}`. Selected anchors: `0` = `nav.mainAppNav` (rect 1989x49), `4` = `a.navbar-brand`, `8` = `img.brand-logo#cssLogo`, `17` = `.room-sidebar`, `19` = `app-room-roster` (246x708), `21` = `app-presentationarea` (1558x1117), `22` = `#mainTabs` (`ul.nav.nav-tabs.mainTabset`), `24` = `#screenTabs` (`ul.nav.nav-tabs.screens-tabs`), `41` = `.card.webcamsHolder#webcamsHolder-` (320x240), `49` = `.presentation-box` (as-split-area, 1558x1117).
- `controls`: 230 entries. `inventory`: buttons 278, inputs 77, links 36, menus 200, modalsInDom 100, dataAttributes 14.
- `assets`: images 103, backgroundImages 8, inlineSvgs 0.
- `cssVariables`: `{root, body}` (2 keys), each holding the **full Bootstrap 5 + app theme variable set** (~300 vars incl. `--navbar-bg:#0c2434`, `--success:#00bc8c`, `--presenter-area-bg:#0f2e43`, `--modal-content-bg-color:#103d5c`, `--sidebar-wrapper-bg-color:#103d5c`, `--darkTheme-*`/`--lightTheme-*` pairs).

## Marker grep counts (raw-string `match`, whole file)
`app-st-message` 2801, `msg-box` 3137, `msg-box-adm` 352 (18 as a standalone element class), `msgMenu` 1156 (124 element class), `flex-row-reverse` 406, `user-badge-img` 826 (274 element class), `created-at` 424, `alert-qa` 383 (50 element class), `mainTabs` 106, `mainTabset` 71, `app-alerts` 34, `presentation-box` 21, `volumeControl` 20, `room-roster` 30, `noteTabset` 55, `files-tabs` 35, `files-badge` 19, `modal-content` 91, `tradeColor` 30 (11 element class), `st-searchbar` 6, `users-dropdown-options` 51, `noteDownload` 8, `badge-success` 5, `chatHeader` 11, `alertHeader` 6, `rosterImg` 7, `presUser` 3, `regUser` 3, `Add Reaction` 2. **Zero**: `replyModal`, `appusersettings`, `avsettings`, `webcamholder` (note: the holder is `app-webcam-holder` / `.card.webcamsHolder`, not the probed literal).

## surfaces documented
- **Top nav** (`nav.mainAppNav`, `navbar-expand-md navbar-dark fixed-top`): brand logo `img.brand-logo#cssLogo`, `a.navbar-brand`, `btnNavToggler`.
- **Sidebar** (`div.room-sidebar` → `.sidebar-wrapper`): nav items with FA icons `fa-network-wired, fa-cogs, fa-archive, fa-comments, fa-users, fa-user`; `.ptr-website-link`; `.active-room-users`; `.users-btns`; dropdowns.
- **Room roster** (`app-room-roster`, 246x708): admin controls "Sort by Trials", "Reload Users", "Sort Users", "Search Users", "Mobile App Info", "Launch in Mobile App"; `rosterImg`; presUser/regUser markers.
- **Chat / messages**: `app-st-message`, `msg-box` + **`msg-box-adm`** (admin variant), `msgMenu` (⠇ kebab), `user-badge-img` (image badges — NOT text badges), `created-at` timestamps, `flex-row-reverse` (own-message alignment), `tradeColor` (trade-tinted messages).
- **Alerts / Q&A**: `app-alerts`, `alert-qa` ("Ask a question" button), `alertHeader`, `chatHeader`.
- **Presentation** (`app-presentationarea` in `.presentation-box` as-split-area, 1558x1117): `#mainTabs`(`.mainTabset`), `#screenTabs`(`.screens-tabs`), `volumeControl`.
- **Webcams** (`app-webcam-holder` → `.card.webcamsHolder#webcamsHolder-`, 320x240 tiles).
- **Notes / Files**: `noteTabset`, `noteDownload`, `files-tabs`, `files-badge`, `st-searchbar`.
- **Modals**: 100 modal-related nodes in DOM (`modal fade`, `modal-dialog`, `modal-content`, `modal-header/title/body/footer`), `--modal-content-bg-color:#103d5c`.

## maps to (our components)
- Top nav → `TopNav`/room navbar (brand logo, toggler). Reason: `nav.mainAppNav` targeted[0] + subtree `topnav`.
- Sidebar → `RoomSidebar` / left rail. Reason: subtree `sidebar`, `.room-sidebar` targeted[17].
- Roster → `RoomRoster` / user list with admin sort/search/reload controls. Reason: `app-room-roster` targeted[19], admin button texts.
- Chat → `ChatMessage` / `MessageList` incl. an **admin message variant** (`msg-box-adm`), kebab `msgMenu`, `user-badge-img` badge component. Reason: element-class counts above.
- Alerts panel → `AlertsPanel` / Q&A ("Ask a question"). Reason: `app-alerts`, `alert-qa`.
- Presentation stage → `PresentationArea` with `mainTabs`/`screenTabs` tab strips + `volumeControl`. Reason: subtree `presentation`, targeted[21/22/24].
- Webcams → `WebcamHolder` / webcam tile grid. Reason: subtree `webcams`, `.webcamsHolder`.
- Notes/Files tabs → `NotesTab` / `FilesTab`. Reason: `noteTabset`, `files-tabs`, `files-badge`.
- Theme tokens → global CSS variables map. Reason: `cssVariables.root` full token set.

## key findings (cited)
1. This is the **admin/ultra-admin** capture of room `652754202ad80b3e7c5131e2` "Mastering The Trade" — admin-only surfaces present that a member capture lacks: `msg-box-adm` (18 admin message boxes), roster "Sort by Trials"/"Reload Users"/"Sort Users"/"Search Users" buttons (`inventory.buttons`), "Mute" `btn-primary`. Cite: `meta.label="admin-room"` + button texts.
2. **Badges are IMAGES, not text** — `user-badge-img` appears as an element class 274× (826× in raw). Confirms the CLAUDE.md warning that prose ".md analysis" claiming "New"/"Trial" TEXT badges is wrong; authority here shows `<img class="user-badge-img">`.
3. **Full theme token authority**: `cssVariables.root/body` carry ~300 vars including dark/light pairs — e.g. `--navbar-bg:#0c2434`, `--success/--green:#00bc8c`, `--presenter-area-bg:#0f2e43`, `--modal-content-bg-color:#103d5c`, `--sidebar-wrapper-bg-color:#103d5c`, `--darkTheme-msgs-bg-adm:#0f2e43`, `--lightTheme-msgs-bg-adm:#f4f4f4`. Use for exact color matching (admin msg backgrounds differ from member via `-adm` vars).
4. **Layout is a split pane**: `as-split#mainAreaSplit` with `.presentation-box as-split-area` (1558x1117) beside sidebar (246-wide) and webcams (`app-webcam-holder`). Rects: nav 1989x49, roster 246x708, presentation 1558x1117, webcam tile 320x240. Cite: `targeted` rects + subtree rootPaths.
5. **External deps pinned**: FA `v5.8.1` all.css, `animate.css/3.7.2`, app bundle `styles.0d26360b9b3e223c.css`; fonts `Lato` (400/700/italic) + `Font Awesome 5 Free/Brands` + `summernote`; app font var `--font-family-sans-serif` leads with `"Lato"`. Cite: `head.stylesheetLinks`, `fonts.loaded`.
6. Image sources span three hosts: `chat.protradingroom.com/var/www/uploads/...`, `cdn1.protradingroom.com/uploads/images/...`, and `secure.gravatar.com/avatar/...?d=mm&s=50` (fallback avatars). Cite: `assets.images[0..5]`.

## notes
- **Best-authority flag**: this is the single richest **admin-role** structured capture in the corpus (2,639 nodes + 5 subtrees + 50 targeted anchors + full computed styles/rects + complete theme token set, `elementsCapped:false`, `errors:[]`). It is the authoritative source for admin-only chat/roster surfaces (`msg-box-adm`, roster admin controls) — outranks any HTML dump or prose `.md` for those surfaces.
- Likely **superset** of member captures for shared surfaces (nav, presentation, webcams, notes/files) since it contains the same class markers plus admin extras. Cross-check the member JSON capture for surfaces this one may render differently (member has no `msg-box-adm`, no roster admin buttons).
- Not corrupt, not empty, not a duplicate. Structured JSON parses cleanly; single capture of one room state (no `states`/`groups` variant keys present — this capture uses `subtrees`/`targeted` rather than a states-based schema).
- Mobile UA string in `meta` is a capture-harness artifact; viewport (1989px, dpr 2) and `tooNarrow:false` confirm the **desktop** layout was rendered.
