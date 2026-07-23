# proroom-NUCLEAR-member.json

- **path**: `proroom-NUCLEAR-member.json` (repo root)
- **kind**: json-capture
- **size**: 31,322,421 bytes (~31 MB)
- **role**: **member** — determined from `role: "member"` top-level key AND `meta`-style header fields; `url: "https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1"`, `title: "Mastering The Trade"`.
- **format/quality**: computed styles + rects + matched CSS rules, organized as `states[]` (interaction snapshots). This is the richest capture format in the corpus — each node carries `path` (full CSS-selector chain w/ classes/ids), `tag`, `attrs`, `icon`, `rect` (x/y/w/h), `style` (full computed style block), and `matched` (array of matched CSS rule text w/ source stylesheet comment). **AUTHORITY-grade rendered dump.**
- **surfaces documented**: left sidebar nav (navbar/nav-item), main tabset (`#mainTabs` = Chat / Notes / Files-type tabs), chat message stream (`app-st-message` / `msg-box` / `msg-box-adm`), admin-vs-member message styling, user badges (`user-badge-img`), Notes tab (`#notesTabs` with per-note tabs + `noteUpd`/`editName`/`noteDownload`), Files tab, Off Topic tab, Archives dropdown, per-message ⠇ kebab dropdowns, room roster (`app-room-roster`), volume/audio controls (`volumeControl`), presentation split-pane (`presentation-box`), settings/search, alerts (`app-alerts`).

## Capture metadata (cited)
- `capturedAt: "2026-07-23T01:05:15.280Z"`, `dpr: 2`.
- `userAgent: "Mozilla/5.0 (Linux; Android 15; Pixel 9) ... Chrome/150.0.0.0 Mobile"` → **captured under a MOBILE (Pixel 9 / Android) user agent.**
- `viewport: {"w":1401,"h":905}` — declared desktop-width viewport, but see anomaly below.
- `flags: {"AUTO_REVEAL":true,"MATCHED_RULES":true,"INCLUDE_FULL_CSS":true}`.
- Angular SPA: node `attrs` carry `_nghost-ng-c*`/`_ngcontent-ng-c*`/`ng-version` — **class names are NOT in `attrs.class`; they live in the `path` selector string.** (grep against `attrs.class` returns 0; grep against `path` returns the real counts below.)

## Structure (cited, from `node -e` structural inspection)
- Top-level keys: `role, capturedAt, url, title, viewport, dpr, userAgent, flags, rootVars, fonts, states, assets, inventory, stylesheets, inaccessibleStylesheets`.
- `states`: **12 snapshots** — `[0] base (6000 nodes)`, `[1] tab:Notes (377)`, `[2] tab:Files (24)`, `[3] tab:Off Topic (4)`, `[4] dropdown:Archives (10)`, `[5] dropdown:menu (3)`, `[6–11] dropdown:⠇ (7 each)` — six per-message kebab menus captured. Total 6,460 nodes across states.
- `rootVars`: **294 CSS custom properties** (20 `darkTheme-*` + 20 `lightTheme-*` + Bootstrap `--bs-*`).
- `fonts`: 16 entries — **Font Awesome 5 Free (400 loaded, 900 loaded)** + FA5 Brands, **Lato (400/700, normal+italic)**, `summernote`.
- `assets`: images=89, backgroundImages=8, scripts=5. `stylesheetHrefs` = `use.fontawesome.com/releases/v5.8.1/css/all.css` (**FA pinned 5.8.1**), `cdnjs animate.css 3.7.2`, `chat.protradingroom.com/styles.d622cb9ed2bbc221.css`.
- `stylesheets`: 38 accessible + 1 inaccessible.
- `inventory`: buttons=232, links=400, inputs=76, icons=59. Button labels include `"Mobile App Info","Reload Users","Sort Users","Search Users","Toggle navigation","Mute Audio","⠇","Ask a question"`. Icons are FA classes: `fas fa-check, fa-network-wired, fa-cogs, fa-archive, fa-bell, fa-comment, fa-closed-captioning, fa-comments, fa-users, fa-user`.

## Marker probe (grep of `path` across all states, with counts)
PRESENT: `mainTabs` 11, `app-alerts` 13, `app-st-message` 2711, `msg-box` 2603, `msg-box-adm` 546, `flex-row-reverse` 506, `users-dropdown-options` 862, **`user-badge-img` 202**, `badge-success` 4, `room-roster` 2, `volumeControl` 29, `st-searchbar` 4, `noteDownload` 24, `files-badge` 6, `modal-content` 2229, `presentation-box` 3, `created-at` 100.

ABSENT (in this member capture): `mainTabset, msgMenu, replyModal, presUser, regUser, rosterImg, noteTabset, files-tabs, appusersettings, avsettings, webcamholder, alertHeader, chatHeader, alert-qa, tradeColor`. (Member has no presenter/AV surfaces — `webcamholder`/`avsettings`/`presUser` absent is consistent with a member-only role. The presentation area exists as an empty split pane, `presentation-box` = 3 nodes only.)

## Key findings (cited)
1. **Badges are `<img class="user-badge-img">`, NOT text badges — confirmed.** 202 `user-badge-img` occurrences; distinct badge PNG filenames captured include `EwVGWGS.png, w0vevvY.png, p5iXYiw.png, RSoWlNO.png, ...` (35 distinct imgur-style PNG basenames pulled from `attrs.src`). This corroborates the NON-NEGOTIABLE note that prose ".md" files claiming a "New"/"Trial" TEXT badge are WRONG.
2. **Admin vs member message classes.** Chat rows are `div.msg-box.pb-1.ng-star-inserted` (member) vs `div.msg-box.pb-1.msg-box-adm.ng-star-inserted` (admin) — `msg-box-adm` appears 546×. `--darkTheme-msgs-bg-adm: #0f2e43` is the admin-message dark background. `flex-row-reverse` (506×) is applied to own/right-aligned message rows.
3. **Theme palette (rootVars, cited values):** `--success: #00bc8c`, `--red: #f00`, `--darkTheme-msgs-bg-adm: #0f2e43`, `--darkTheme-msg-border-color: #f4f4f4`, `--sidebar-menu-color: #fff`, `--users-color: #fff`, `--tabs-color: #fff`, `--note-text-color: #676767`, `--bs-body-bg: #fff`, `--bs-body-color: #212529`. Both light+dark theme variable sets present (20 each).
4. **Notes tab is real, data-bearing.** `tab:Notes` state exposes `ul#notesTabs` with per-note tabs keyed by Mongo ObjectIds (`a#652765a0e494735aa53574ba-tab`, `#665874b2...`, `#68385e5f...`, etc.), each with `i#noteUpd-<id>`, `a.editName.mx-1`, and a `span.badge.badge-success.mx-1.p-0` on the Home/`fa-home` note. `noteDownload` appears 24×.
5. **Left tabset geometry (base state rects):** `ul#mainTabs` at rect x0 y49 110×118; tab items are vertically stacked `li.nav-item` (~40px tall each) with `a.nav-link` containing `i.fas.fa-folder` + `span.mx-1`; `div#mainTabsContent` at y191, 110×378.5. Roster `app-room-roster` rect `{x:-248,y:452,w:246,h:359}` → **off-canvas (negative x) i.e. collapsed/hidden panel** in this snapshot.

## Notes
- **ANOMALY / honest gap:** despite `viewport.w=1401`, the rendered layout collapsed to a **~110px-wide column** — `html>body` rect is `{w:110,h:817}`, `app-room#topRoomDiv` `{w:0,h:18}`, and every surface (sidebar, mainTabs, presentation-box) is 110px wide. Combined with the Pixel-9 mobile UA, this capture reflects a **narrow/mobile-collapsed render**, NOT the full desktop pro-room layout. Rects here are usable for stacking order and relative structure but the absolute widths are the collapsed-mobile widths — do NOT treat 110px as the intended desktop pane width. This is the single most important caveat for pixel comparison.
- **Best-authority flag:** for MEMBER chat/notes/badge/message-styling structure and computed CSS, this is the richest member-role source (6000 base nodes + matched CSS rules + 294 rootVars). Superset over any member HTML-DOM dump for *computed* styles. For desktop-width geometry, pair it with a desktop-viewport capture (this one is mobile-collapsed).
- No presenter/AV surfaces present (expected for member role) — do not source `webcamholder`/`presentation` internals from this file.
