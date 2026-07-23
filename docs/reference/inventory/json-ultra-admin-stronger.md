# proroom-ultra-admin-room-stronger.json

- **path**: proroom-ultra-admin-room-stronger.json
- **kind**: json-capture (RAW dump — AUTHORITY)
- **size**: 13,227,947 bytes (~13 MB / 12.6 MiB)
- **role**: admin — determined by `meta.label = "admin-room"` AND 407 occurrences of `msg-box-adm` (admin-authored message class) grepped in file AND admin-only controls captured (see labels below: "Manage Muted Users", "Manage Followed Users", "Users: Sort by Trials", "Archives", "Connectivity Check", "General Settings"). This is an authoring/admin perspective, not the member read-only view.
- **format/quality**: computed styles + rects + attrs (rich rendered-DOM capture). Each of the 2184 `elements` carries `{path, tag, rect{x,y,w,h}, attrs, icon, style{...computed...}, before, after}`. NOT a raw HTML/inline-style dump.

## Structure (verified via `node -e` on top-level keys)
Top-level keys: `meta, head, cssVariables, fonts, stylesheets, palette, elements, subtrees, targeted, controls, assets, inventory, errors`.
- `meta`: `url = https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1`, `title = "Mastering The Trade"`, `viewport {w:1245,h:905,dpr:2}`, `userAgent` = Pixel 9 / Android 15 Chrome (mobile-emulated capture at 1245px wide), `elementsCapped:false`, `theme{htmlClass:"",bodyClass:"",dataTheme:null}`.
- `cssVariables.root`: 294 vars; `body`: 294 vars. Sample: `--success=#00bc8c`, `--red=#f00`, `--pink=#e83e8c`, `--bs-orange=#fd7e14`, `--sidebar-menu-color=#fff`, `--lightTheme-roster-bg-adm=#e1e1e1`, `--darkTheme-msg-border-color=#f4f4f4`, `--file-list-even-bg=#f4f4f4`, `--tabs-color=#fff`.
- `stylesheets`: array[41]. `head.stylesheetLinks/fontLinks/preloads/metas`.
- `fonts.loaded`: FA 5 Free 400 loaded, FA 5 Free 900 loaded, FA 5 Brands unloaded, Lato 400/700 unloaded, summernote unloaded. `fontFileUrls` point at `chat.protradingroom.com/webfonts/fa-*` (Font Awesome 5, matches memory's FA-5.8.1 pin).
- `elements`: array[2184]. `subtrees`: `topnav(57)`, `sidebar(67)`, `presentation(438)`, `webcams(16)`, `roomShell(600)` — all `found:true`.
- `targeted`: array[48] (explicit selector probes). `controls`: array[206]. `assets.images`: 89, `backgroundImages`: 8, `inlineSvgs`: 0. `inventory`: `buttons(248), inputs(74), links(39), menus(200), modalsInDom(100), dataAttributes(13)`. `errors`: [] (clean capture).

## Surfaces documented
Top navbar (`nav.mainAppNav`, brand `img#cssLogo` rect 88,16,200,18, volumeControl, room-sound-options, talkingIndicator, fa-sync reload); left room-sidebar (Archives, Manage Muted Users, Manage Followed Users, General Settings, Connectivity Check, Mobile App Info); room roster (`app-room-roster` / `.room-roster-list` / `active-room-users`, Sort/Search/Reload Users, "Users: Sort by Trials"); alert-chat split (`as-split#mainAreaSplit`, `alert-chat-box`, chat tabs Main Chat / Off Topic); Q&A alerts (`alert-qa` ×383, "Ask a question", "(N) ✅" counters); presentation area (`app-presentationarea`, `presentation-box`, `#mainTabs`/`mainTabset`, tabs Screens/Notes/Files, `#screenTabs`, `#streamsTabs`, `#notesTabs noteTabset`, `#myTab files-tabs`, `files-badge`); Notes sub-tabs (Welcome, JC's Daily Briefing, Henry's Workflowy Notes, Sam's Mag 7 index, 1on1 Coaching/Prop Firm & Tool Discounts, Taylor's Scorecard Rankings (6/26 CLOSE)), Download; webcams (`app-webcam-holder`, `app-presenter-cams`, `.webcam-wrapper`, `div#webcamsHolder-`, `video.webcamsHolderVideo`, `.overlay` + `h5.pNameLabel`); user settings tabs (`user-app-settings-tab`, `user-audio-video-settings-tab`). Messages: `msg-box` / `msg-box-adm`, `msgMenu`, `flex-row-reverse`, `user-badge-img`, `created-at`, `tradeColor`.

## Maps to (our components)
- Top navbar + volume/sound → RoomTopNav / VolumeControl (targeted[0..13]).
- Left sidebar admin actions → RoomSidebar admin menu (controls: Archives, Manage Muted/Followed Users, General/Connectivity Settings).
- Roster → RoomRoster / RosterList (`app-room-roster`, presUser/regUser/rosterImg, "Sort by Trials").
- Alert+chat split → AlertChat / ChatPane + tab strip (Main Chat/Off Topic); Q&A → QaAlerts (`alert-qa`).
- Presentation tabset → PresentationArea (Screens/Notes/Files), NotesTabs, FilesTabs (+files-badge).
- Webcams → WebcamHolder / PresenterCams overlay + pNameLabel.
- Message rows → ChatMessage (+ admin variant `msg-box-adm`), badge → UserBadgeImg (img, not text).

## Key findings (cited)
1. **Badges are IMAGES, not text** — confirms the CLAUDE.md landmine. `elements` with `class="user-badge-img"` have `src=https://i.imgur.com/EwVGWGS.png` (also w0vevvY, p5iXYiw, RSoWlNO). 610 grep hits of `user-badge-img`. No "New"/"Trial" TEXT badge in rendered DOM.
2. **Admin-authored message styling** — an element `class="msg-box pb-1 msg-box-adm"` computes `background-color: rgb(215,215,215)` with `color: rgb(204,204,204)`. 407 `msg-box-adm` occurrences vs member captures which lack them → distinguishes admin voice from member.
3. **Admin-only controls present** — 34 distinct control labels include `Manage Muted Users`, `Manage Followed Users`, `Users: Sort by Trials`, `Reload Users`, `Archives`, `Connectivity Check`, `General Settings` — surfaces a member (chat-only) role never sees.
4. **Presentation tabs + Notes documents** — control labels expose exact tab set: `Main Chat | Off Topic | Screens | Notes | Files` and Notes documents: `Welcome | JC's Daily Briefing | Henry's Workflowy Notes | Sam's Mag 7 index | 1on1 Coaching/ Prop Firm & Tool Discounts codes. | Taylor's Scorecard Rankings (6/26 CLOSE)` + `Download`. `#mainTabs class="nav nav-tabs mainTabset"` rect x341,y49.
5. **Palette authority (navy admin theme)** — 294 CSS vars incl. `--success=#00bc8c`, `--lightTheme-roster-bg-adm=#e1e1e1`, `--darkTheme-msg-border-color=#f4f4f4`; FA5 Free 400/900 loaded from `/webfonts/fa-*`. Q&A: `alert-qa` ×383, `created-at` ×352, `tradeColor` ×44 (trade-alert color coding present).

## Notes
- **Best authority for the ADMIN/authoring room view** among the corpus: rich computed-style+rect capture, uncapped (`elementsCapped:false`), zero errors, 2184 elements + 48 targeted probes + 206 controls. Superset over prose analyses.
- `replyModal`, `msg-box-mod`, `pinned-msg`, `admtag`, `moderator` = 0 hits → no explicit Moderator-tier or reply-modal markup in this capture (consistent with the 3-tier code gap in memory). `Add Reaction` only 2 hits (reaction affordance minimal here).
- Mobile-emulated viewport (Pixel 9, 1245px) — rects reflect that width; some webcam rects have negative/off-screen x (e.g. y:911) indicating collapsed/off-canvas panels. Cross-check layout against a desktop-width capture before pixel-matching.
- Verify all downstream numbers/labels against THIS raw dump, not against `.md-analysis` prose files.
