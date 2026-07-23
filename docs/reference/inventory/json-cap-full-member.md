# proroom-full-member.json

- **path**: docs/reference/captures/proroom-full-member.json
- **kind**: json-capture
- **size**: 11,184,801 bytes (~11 MB); 271,400 lines (pretty-printed)
- **role**: member — determined from `meta.role: "member"` and `meta.url` (`https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1`). Corroborated by DOM: `msg-box-adm` = 0 occurrences (no admin message boxes), no presenter/admin compose surfaces; only the member roster/read surfaces present.
- **format/quality**: computed styles + rects + attrs (rendered DOM snapshot). Each element carries `{path, tag, rect, attrs, icon, style, before, after}` — full computed-style map (`style` object) and layout rect per node. This is high-authority rendered capture (NOT prose). Includes `cssVariables`, `palette` (aggregated value+count), `fonts`, `stylesheets`, `assets`, `inventory`, and interaction `states`.
- **surfaces documented**: chat message list (50 messages), chat header, alert header + Q&A alert rows, room roster / user list, presentation area (screen-share stage), notes panel, files, top nav tabset, message context menu (msgMenu), user/room/trader select dropdowns, several modals (settings, poll, generic).

- **maps to (our components)**:
  - `app-chat` + 50× `app-st-message` (`msg-box`, `msgMenu`, `username`, `avatar`, `created-at`, `text-formated`, `preText`) → our chat message list / message row + per-message action menu.
  - `app-alerts` + `alertHeader` + 50× `alert-qa` (`fa-question-circle`) → our alerts / Q&A pane.
  - `app-room-roster` (roster buttons: "Sort by Trials", "Reload Users", "Sort Users", "Mobile App Info") → our roster / user-list sidebar.
  - `app-presentationarea` (`presentation-box`, rect 1398×1108 at x=590) → our screen-share / presentation stage.
  - `app-note` (`noteTabset`, `noteDownload`) → our notes panel; top `nav-item`/`nav-link` tabset (25 nav-items) → our main tabset.
  - `chatHeader` + top nav dropdown ("Archives", "Alert Logs", "Chat Logs", "Transcript History") → our chat header + logs menu.

- **key findings** (cited):
  1. **Custom Angular component tree** (from `elements[].tag` counts): `app-root:1` › `app-room:1` › `app-chat:1`, `app-alerts:1`, `app-room-roster:1`, `app-presentationarea:1`, `app-note:1`, `app-st-message:50`, `app-roomscroller:2`. Layout uses `as-split`/`as-split-area` (angular-split): `presentation-box` split-area holds `app-presentationarea`.
  2. **Message row structure** (attrs.class counts over 1178 elements): `msg-box:50`, `msgMenu:50`, `username:50`, `avatar:50`, `created-at:50`, `alert-qa:50`, `msg-left:50`, `text-formated:50`, `preText:50`, `fa-question-circle:50`. Note `flex-row-reverse:0` and `msg-box-adm:0` — this member capture shows NO reversed/own-side or admin-styled messages.
  3. **Badges are NOT present as text OR as `user-badge-img` here**: `user-badge-img` = 0, `badge-success` = 1, and 0 img `src` containing "badge". Avatars are Gravatar (`secure.gravatar.com/avatar/...?d=mm&s=50`) — 60 img elements, 21 distinct srcs; content images from `cdn1.protradingroom.com/uploads/images/652754202ad80b3e7c5131e2_...` and one `i.imgur.com`. Treat any prose claim of text "New"/"Trial" badges as unverified against this capture.
  4. **Palette / theme is LIGHT** (`palette.backgroundColor`): dominant bg `rgb(255,255,255)` count 2206; text `rgb(33,37,41)` count 19207. Brand blues: `rgb(14,54,81)`, `rgb(16,61,92)`, `rgb(10,109,177)`, and accent `rgb(69,162,255)` (also the `tradeColor` value — 13 `tradeColor` elements all `color: rgb(69,162,255)`). `meta.theme.htmlClass`/`bodyClass` are empty (no dark theme class applied). 294 CSS custom props on both `:root` and `body`.
  5. **msgMenu context-menu + selects** (`inventory.menus` items): per-message menu = "Volume | Mute | User Info | Mention | Copy"; roster logs menu (`users-dropdown-options`) = "Alert Logs | Chat Logs | Transcript History"; trader picker `--Select Traders--` lists 20+ names (Allison, Danielle Shay, TG Watkins, Trendy Jon, CML Alert Bot, ...); `--Select Rooms--` = "Showcase Room | Mastering The Trade | Tr3ndy Trading". Room title `meta.title: "Mastering The Trade"`.
  6. **Inventory scale**: buttons 200, inputs 74, links 34, menus 251, modalsInDom 120. Modal classes seen: `modal-content`, `modal-dialog modal-lg/-xl`, `pollModalHolder`, `modal fade text-white`. Fonts: Font Awesome 5 Free (400/900 loaded) + Brands (unloaded), Lato, summernote (editor) — FA served from `/webfonts/fa-*-400/900`.

- **notes**:
  - **Honest GAP**: the four `tab:*` interaction states (`tab:Screens`, `tab:Streams`, `tab:Notes`, `tab:Files`) all report `note: "tab not found"` with `groups: []` (len 0) — the tab-open interaction failed to locate those tabs, so their expanded content is NOT captured here. Only `dropdown:1/2/3/7/8` captured `groups` (e.g. `dropdown:1` group0 selector `app-presentationarea`, count 468).
  - **Viewport**: `meta.viewport {w:1988,h:1157,dpr:2}`, `userAgent` = Android 15 Pixel 9 Chrome mobile — captured at a wide/desktop-equivalent CSS width (`tooNarrow:false`), so this is effectively the desktop member layout, not a narrow mobile layout.
  - `assets.inlineSvgs` = 0 (icons are Font Awesome glyph fonts, per `elements[].icon` like `fas fa-check`, `fas fa-desktop`), `assets.images` 34, `assets.backgroundImages` 8. `errors` array is empty (clean capture). `elementsCapped:false` — the 1178-element list is complete, not truncated.
  - **Best-authority flag**: this is a rendered computed-style+rect capture and OVERRIDES any prose .md analysis for the member view of "Mastering The Trade". It is the authoritative member-role JSON in the corpus, but its `tab:*` deep states are empty (see GAP) — pair with an HTML DOM dump for those panels.
