# Reference Divergences — MASTER (ours vs protradingroom)

Combined forensic diff of our SvelteKit repo against the protradingroom.com *“Mastering The Trade”* reference, drawing on **both** captures the user provided:
- **`proroom-ultra-admin-room.json`** — breadth (2639 elements, subtrees, 100 modals, 230 controls). 10 surface agents.
- **`proroom-presenter-deep.json`** — depth (12 hand-targeted elements with exact computed + `:hover`/`:active` + matched CSS rules). 6 precision agents.

- **Generated:** 2026-06-16 · 16 parallel Opus 4.8 sub-agents · every divergence grounded in BOTH the reference value AND our `file:line`.
- **Total raw divergences: 206** (146 broad + 60 precision; some token items overlap across the two passes) — 4 critical, 42 high, 49 medium, 57 low, 54 cosmetic.
- The two captures have **identical** 294-token sets. Where the reference itself disagrees across files (modal chrome, avatar radius vs a *third* file), it's called out below as an **open question**, not a fix.

## ⚠️ Open question — reference sources disagree (decide before fixing)

- **Modal chrome:** these two captures show **navy** modal tokens (`--modal-content-bg-color #103d5c`, text `#f4f4f4`, success `#92d528`, danger `#bb352a`, close `#0a6db1`, active-tab `#45a2ff`); a **Darkly-gray** modal set (`#303030`/`#00bc8c`/`#e74c3c`/`#375a7f`) lives in another capture file. Our build ships Darkly gray. Likely per-room-theme / version. **Confirm the target theme before changing any `--modal-*`.**
- **Avatar shape:** these captures define `--rosterImg-border-radius: 50%` (round); we render square. Same caveat.

## ⚡ Priority queue — Critical & High (deduped across both passes)

1. **🔴 CRITICAL** · _TOP NAV + ADMIN BROADCAST CONTROLS_ · Inline admin broadcast control cluster does not exist in the reference nav — ref `The ADMIN capture's nav right cluster (ul.navbar-nav.ml-auto, topnav[9` vs ours `We render a full broadcast cluster inline in the` (web/src/lib/components/RoomTopNav.svelte:112-114 (.nav-controls render) + web/src/routes/rooms/[id]/+page.svelte:431-540 (stageActions snippet)) · [admin-room]
2. **🔴 CRITICAL** · _MODALS INVENTORY_ · Modal shell bg is Darkly GRAY, reference is NAVY #103d5c — ref `--modal-content-bg-color: #103d5c (tokens.json:42); used as modal-cont` vs ours `--modal-bg: #303030` (web/src/routes/layout.css:36) · [admin-room]
3. **🔴 CRITICAL** · _sidebar-deep_ · Menu-item hover background fill is dropped (reference shows #e9ecef) — ref `rgb(233, 236, 239) = #e9ecef (hover winner from .sidebar-item[_ngconte` vs ours `transparent` (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomSidebar.svelte:444 (.item:hover:not(:disabled) { background: transparent; })) · [presenter-deep]
4. **🔴 CRITICAL** · _composer-deep_ · Composer holder shape: 999px pill vs reference flat 8px rectangle — ref `8px on all four corners (border-top-left/right + bottom-left/right-rad` vs ours `999px (border-radius: 999px) on .pill` (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:621) · [presenter-deep]
5. **🟠 HIGH** · _DESIGN TOKENS / CSS VARIABLES_ · Modal background is Darkly gray, reference modal is navy — ref `--modal-content-bg-color = #103d5c and --modal-content-border-color = ` vs ours `--modal-bg: #303030 (Bootswatch Darkly gray)` (web/src/routes/layout.css:36) · [admin-room]
6. **🟠 HIGH** · _DESIGN TOKENS / CSS VARIABLES_ · Modal success button green wrong — ref `--modal-btn-success-bg = #92d528 and --modal-btn-success-border = #92d` vs ours `--modal-success: #00bc8c (Darkly teal)` (web/src/routes/layout.css:41) · [admin-room]
7. **🟠 HIGH** · _DESIGN TOKENS / CSS VARIABLES_ · Modal danger button red wrong — ref `--modal-btn-danger-bg = #bb352a and --modal-btn-danger-border = #bb352` vs ours `--modal-danger: #e74c3c (Darkly red)` (web/src/routes/layout.css:42) · [admin-room]
8. **🟠 HIGH** · _DESIGN TOKENS / CSS VARIABLES_ · Modal active-tab color wrong — ref `--modal-active-tab-bg-color = #45a2ff and --modal-active-tab-border-co` vs ours `--modal-active-tab: #00bc8c (Darkly teal)` (web/src/routes/layout.css:43) · [admin-room]
9. **🟠 HIGH** · _TOP NAV + ADMIN BROADCAST CONTROLS_ · Go-live control: reference has none in nav; ours uses fa-broadcast-tower — ref `MISSING from nav (no go-live/broadcast button in any captured nav node` vs ours `<Icon name="broadcast-tower"> with title 'Go liv` (web/src/routes/rooms/[id]/+page.svelte:520-529) · [admin-room]
10. **🟠 HIGH** · _TOP NAV + ADMIN BROADCAST CONTROLS_ · Record control: reference has none in nav; ours uses fa-dot-circle — ref `MISSING from nav. Note: the reference DOES have a recIndicator '[ REC ` vs ours `<Icon name="dot-circle"> title 'Record', opens s` (web/src/routes/rooms/[id]/+page.svelte:516-518) · [admin-room]
11. **🟠 HIGH** · _TOP NAV + ADMIN BROADCAST CONTROLS_ · Screen-share / camera / mic / CC / music controls absent from reference nav — ref `MISSING from nav — no fa-desktop, fa-video, fa-microphone (toggle), fa` vs ours `stageActions renders desktop/stop-circle, video/` (web/src/routes/rooms/[id]/+page.svelte:432-512) · [admin-room]
12. **🟠 HIGH** · _TOP NAV + ADMIN BROADCAST CONTROLS_ · Members control: reference has none in nav; ours uses fa-cog — ref `MISSING from nav. (A 'General Settings' fa-cogs item exists but only i` vs ours `<Icon name="cog"> title 'Members', toggles showM` (web/src/routes/rooms/[id]/+page.svelte:530-538) · [admin-room]
13. **🟠 HIGH** · _SIDEBAR / USER ROSTER_ · Extra 'Audio/Video Settings' nav item not in reference — ref `Sidebar nav items are exactly: Connectivity Check, General Settings, A` vs ours `Extra nav-item 'Audio/Video Settings' (fa-video)` (web/src/lib/components/RoomSidebar.svelte:93-102) · [admin-room]
14. **🟠 HIGH** · _SIDEBAR / USER ROSTER_ · Entire 'Admin' sub-group absent from reference sidebar — ref `No Admin group, no All Private Messages / Play YouTube / Session Contr` vs ours `{#if canManage} block renders a .group with grou` (web/src/lib/components/RoomSidebar.svelte:174-214) · [admin-room]
15. **🟠 HIGH** · _SIDEBAR / USER ROSTER_ · Roster avatars square instead of circular — ref `--rosterImg-border-radius: 50% (tokens.json) → circular gravatars.` vs ours `border-radius: 0 on .avatar with comment claimin` (web/src/lib/components/RoomSidebar.svelte:591-593) · [admin-room]
16. **🟠 HIGH** · _PRESENTATION / STAGE_ · Zoom buttons use wrong (Bootstrap-4) .btn-dark fill — light gray instead of dark — ref `COMPUTED background-color rgb(33,37,41)=#212529, color rgb(255,255,255` vs ours `background-color rgb(173,181,189)=#adb5bd, color` (web/src/lib/components/ScreenStage.svelte:267-271 (.btn-dark) + comment 248-249 calling it a 'LIGHT-gray pill') · [admin-room]
17. **🟠 HIGH** · _WEBCAMS_ · Name label renders presenter text; reference has none — ref `h5.pNameLabel.m-0 contains ONLY span.closeIcon (the X). No presenter-n` vs ours `h5.name renders `{publisher.name ?? 'Presenter'}` (web/src/lib/components/WebcamHolder.svelte:106-108) · [admin-room]
18. **🟠 HIGH** · _ALERTS PANEL_ · Body not indented under avatar/username gutter — ref `div.text-formated body left edge at x=66 (indented past the avatar col` vs ours `margin: 0.35rem 8px 0 8px — body starts ~8px fro` (web/src/lib/components/AlertFeed.svelte:651-652 (.body margin)) · [admin-room]
19. **🟠 HIGH** · _CHAT PANEL_ · Username color is black, reference is room-blue — ref `strong.username computed color rgb(10,109,177)=#0a6db1 (matchedRule co` vs ours `#000` (web/src/lib/components/ChatPanel.svelte:256 (style:color={m.author_color ?? '#000'}) and :574 (.username color:#000)) · [admin-room]
20. **🟠 HIGH** · _CHAT PANEL_ · Message body color too dark — ref `div.msg-left computed color rgb(103,103,103)=#676767 (--lightTheme-msg` vs ours `#1a1a1a` (web/src/lib/components/ChatPanel.svelte:598 (.body color:#1a1a1a)) · [admin-room]
21. **🟠 HIGH** · _CHAT PANEL_ · Header invents Main Chat / Off Topic tabs not in reference — ref `No tab bar exists; reference chat/alerts header is nav.chat-nav with a` vs ours `Two-button role=tablist with Main Chat / Off Top` (web/src/lib/components/ChatPanel.svelte:163-178 (.tabs tablist) and :342-382 (tab CSS)) · [admin-room]
22. **🟠 HIGH** · _CHAT PANEL_ · Uploaded images replace the avatar instead of rendering in-body — ref `An image message keeps the 35px avatar AND renders a separate div.img-` vs ours `image_url is rendered AS the avatar (36px square` (web/src/lib/components/ChatPanel.svelte:250-254 (img.avatar-img branch on m.image_url)) · [admin-room]
23. **🟠 HIGH** · _MODALS INVENTORY_ · Modal border color #444 vs reference #103d5c — ref `--modal-content-border-color: #103d5c (tokens.json:127) — same as bg, ` vs ours `--modal-border: #444` (web/src/routes/layout.css:39) · [admin-room]
24. **🟠 HIGH** · _MODALS INVENTORY_ · Close button bg #375a7f vs reference #0a6db1 — ref `--modal-btn-close-bg: #0a6db1, --modal-btn-close-border: #0a6db1 (toke` vs ours `--modal-close-bg: #375a7f` (web/src/routes/layout.css:40) · [admin-room]
25. **🟠 HIGH** · _MODALS INVENTORY_ · Success button lime #92d528 vs our teal #00bc8c — ref `--modal-btn-success-bg / -border: #92d528 (tokens.json:182,26)` vs ours `--modal-success: #00bc8c` (web/src/routes/layout.css:41) · [admin-room]
26. **🟠 HIGH** · _MODALS INVENTORY_ · Active-tab accent #00bc8c vs reference #45a2ff — ref `--modal-active-tab-bg-color: #45a2ff, --modal-active-tab-color: #fff, ` vs ours `--modal-active-tab: #00bc8c` (web/src/routes/layout.css:43) · [admin-room]
27. **🟠 HIGH** · _BUTTONS / CONTROLS / INPUTS_ · No Bootstrap / no shared button primitive — ref `Stock Bootstrap 5 .btn system: every button is .btn + a variant (btn-s` vs ours `No bootstrap dependency in package.json; no shar` (web/package.json (no bootstrap); web/src/routes/layout.css:101 (only a bare button{} reset); per-component <style> blocks) · [admin-room]
28. **🟠 HIGH** · _BUTTONS / CONTROLS / INPUTS_ · Sidebar search button inverts btn-default colors — ref `search-room-users is 'btn btn-sm btn-default': background #f4f4f4, ico` vs ours `.mini-search background #45a2ff, color #f4f4f4 (` (web/src/lib/components/RoomSidebar.svelte:557-561) · [admin-room]
29. **🟠 HIGH** · _BUTTONS / CONTROLS / INPUTS_ · btn-outline-* user-menu variants all rendered as one filled style — ref `User menu uses distinct BS outline variants: @Mention=btn-outline-ligh` vs ours `All four are class='action' with identical fill:` (web/src/lib/components/modals/UserInfoModal.svelte:36-56,202-214) · [admin-room]
30. **🟠 HIGH** · _BUTTONS / CONTROLS / INPUTS_ · Chat composer is a pill with rounded Send, reference is flat icon row — ref `Composer = 'txt-area form-control border-0' textarea + flat textAreaBt` vs ours `.pill wrapper border-radius:999px containing tex` (web/src/lib/components/ChatPanel.svelte:280-298,617-678) · [admin-room]
31. **🟠 HIGH** · _BUTTONS / CONTROLS / INPUTS_ · Modal form-control inputs use dark Darkly fill, reference is white BS form-control — ref `Stock BS5 form-control: background #fff (--bs-body-bg), color #212529,` vs ours `Modal inputs (.term, .date input, .field) use ba` (web/src/lib/components/modals/AdvancedSearchModal.svelte:171-181,217-225; web/src/lib/components/DialogHost.svelte:88-98; web/src/lib/components/Modal.svelte:111-118) · [admin-room]
32. **🟠 HIGH** · _CSS design tokens_ · Modal background: reference is navy #103d5c, we render Darkly gray #303030 — ref `#103d5c` vs ours `#303030` (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/routes/layout.css:36) · [presenter-deep]
33. **🟠 HIGH** · _CSS design tokens_ · Modal border: reference #103d5c, we use #444 — ref `#103d5c` vs ours `#444` (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/routes/layout.css:39) · [presenter-deep]
34. **🟠 HIGH** · _CSS design tokens_ · Modal close button bg: reference #0a6db1, we use #375a7f — ref `#0a6db1` vs ours `#375a7f` (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/routes/layout.css:40) · [presenter-deep]
35. **🟠 HIGH** · _CSS design tokens_ · Modal success button bg: reference #92d528, we use #00bc8c — ref `#92d528` vs ours `#00bc8c` (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/routes/layout.css:41) · [presenter-deep]
36. **🟠 HIGH** · _CSS design tokens_ · Modal danger button bg: reference #bb352a, we use #e74c3c — ref `#bb352a` vs ours `#e74c3c` (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/routes/layout.css:42) · [presenter-deep]
37. **🟠 HIGH** · _CSS design tokens_ · Modal active-tab: reference #45a2ff bg / #fff text, we use #00bc8c — ref `#45a2ff (bg), #fff (text)` vs ours `#00bc8c` (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/routes/layout.css:43) · [presenter-deep]
38. **🟠 HIGH** · _CSS design tokens_ · Modal input-group bg: reference #0a6db1, we use #444 — ref `#0a6db1` vs ours `#444` (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/routes/layout.css:44) · [presenter-deep]
39. **🟠 HIGH** · _nav-deep_ · userPill uses flex gap 0.3rem; reference uses gap: normal (no flex gap) — ref `normal (computed; .users has no row-gap — icon+count spacing is intrin` vs ours `gap: 0.3rem` (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomTopNav.svelte:297) · [presenter-deep]
40. **🟠 HIGH** · _sidebar-deep_ · Menu-item hover text color darkened instead of held constant — ref `stays rgb(103,103,103) = #676767 — the .sidebar-item rule declares col` vs ours `#212529 (darkens on hover)` (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomSidebar.svelte:441 (.item:hover:not(:disabled) { color: #212529; })) · [presenter-deep]
41. **🟠 HIGH** · _composer-deep_ · Composer holder border: 1px solid #d3d7e0 vs reference borderless — ref `border-*-width: 0px on all sides, border-top-style: none — the holder ` vs ours `border: 1px solid #d3d7e0 on .pill` (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:620) · [presenter-deep]
42. **🟠 HIGH** · _composer-deep_ · Composer outer wrapper bg: reference holder is white (no gray form bar) vs our form #f7f8fa — ref `Holder bg is rgb(255,255,255) white; there is no separate gray compose` vs ours `form background: #f7f8fa (gray bar) with border-` (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:604-612) · [presenter-deep]
43. **🟠 HIGH** · _composer-deep_ · Textarea height/min-height/max-height: reference 35/35/300 vs ours auto/none/120 — ref `height: 35px, min-height: 35px, max-height: 300px (computed)` vs ours `height not set (auto-grows via JS to min(scrollH` (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:91,636) · [presenter-deep]
44. **🟠 HIGH** · _composer-deep_ · Separate Send button present in ours, absent in reference composer slice — ref `No Send button in the reference composer slice — the holder contains t` vs ours `Extra <button class="send"> rendered outside the` (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:297,661-678) · [presenter-deep]
45. **🟠 HIGH** · _stagetabs-deep_ · Active Notes tab forced to dark bg — invented quirk not in reference — ref `var(--tab-active-bg) = #45a2ff (rgb(69,162,255)); the reference active` vs ours `background: var(--bg, #0c2434) = #0c2434` (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/MainStage.svelte:198-202 (.tabbar button.active.notes-active { background: var(--bg, #0c2434); })) · [presenter-deep]
46. **🟠 HIGH** · _stagetabs-deep_ · Hover border color wrong: ours uses accent-hover blue, reference uses #444 gray — ref `rgb(68, 68, 68) = #444 — winning hover rule .nav-tabs .nav-link:hover ` vs ours `var(--accent-hover) = #0a6db1 (dark theme) / #15` (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/MainStage.svelte:178-183 (.tabbar button:hover:not(.active):not(:disabled) { border: 1px solid var(--accent-hover); border-radius: 3px; })) · [presenter-deep]

---

# Part 1 — Deep precision (presenter-deep: exact px / colors / states)

## CSS design tokens  ·  _[presenter-deep]_

> Our app does not mirror the reference's ~80 granular project tokens 1:1; it collapses them into ~13 abstract tokens + hardcoded component literals. For the structural shell (navbar/sidebar/presenter) the mapping is faithful and values MATCH the reference defaults. The largest divergence cluster is the MODAL palette: the reference raw-capture cssVariables.root defines modal tokens in the NAVY room palette (--modal-content-bg-color #103d5c, --modal-btn-close-bg #0a6db1, --modal-btn-success-bg #92d528, --modal-btn-danger-bg #bb352a, --modal-active-tab-bg-color #45a2ff, --modal-input-group-bg #0a6db1), but we render Bootstrap-Darkly gray modals (--modal-bg #303030, close #375a7f, success/active-tab #00bc8c, danger #e74c3c, input #444). This directly contradicts our layout.css comment ('modals are ALWAYS dark Darkly') and matches the documented MEMORY scar (report.md §07 Darkly modal table was wrong; raw capture is authoritative). If the raw capture is the source of truth, every modal-* token below is a high-severity color mismatch. Secondary divergences: avatars rendered square vs reference --rosterImg-border-radius 50%; a handful of light-theme message-chrome tokens we approximate with slightly different hexes; and ~50 reference tokens (note-*, file-*, search-icon-*, users-badge-*, archives-dropdown-*, etc.) we never define as tokens — most are covered by hardcoded literals that happen to match, so they are not all divergences, but the ones below are either wrong or undefined-and-visible. Reference dark-theme message-panel tokens (--darkTheme-msgs-bg #143c57 etc.) are intentionally unused because our panel ships the light palette in both modes — flagged low as a structural note, not a per-pixel bug.

### 🟠 HIGH — Modal background: reference is navy #103d5c, we render Darkly gray #303030
`--modal-content-bg-color → our --modal-bg` · element: `Modal content surface`

- **Reference:** #103d5c
- **Ours:** #303030
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/routes/layout.css:36
- **Fix / why:** Raw capture cssVariables.root says --modal-content-bg-color=#103d5c (navy room palette), NOT Darkly gray. Our layout.css comment (lines 33-36) asserts modals are 'ALWAYS dark Bootstrap Darkly' — this contradicts the authoritative capture and matches the documented MEMORY scar (report-section07-modal-tokens-wrong: report.md §07 Darkly table is a mistake; raw capture wins). If the capture is truth, the entire modal surface color is wrong.

### 🟠 HIGH — Modal border: reference #103d5c, we use #444
`--modal-content-border-color → our --modal-border` · element: `Modal content border`

- **Reference:** #103d5c
- **Ours:** #444
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/routes/layout.css:39
- **Fix / why:** Reference border is the same navy as the modal bg (borderless look); we draw a Darkly gray #444 edge.

### 🟠 HIGH — Modal close button bg: reference #0a6db1, we use #375a7f
`--modal-btn-close-bg → our --modal-close-bg` · element: `Modal close/X button`

- **Reference:** #0a6db1
- **Ours:** #375a7f
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/routes/layout.css:40
- **Fix / why:** Reference close button is the room link-blue #0a6db1 (also --modal-btn-close-border, --modal-input-group-bg, --msgs-header-bg); we use Darkly primary #375a7f.

### 🟠 HIGH — Modal success button bg: reference #92d528, we use #00bc8c
`--modal-btn-success-bg → our --modal-success` · element: `Modal success/download button`

- **Reference:** #92d528
- **Ours:** #00bc8c
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/routes/layout.css:41
- **Fix / why:** Reference success/download green is lime #92d528 (== --positive, --file-download-bg, --note-download-bg); we use Darkly teal-green #00bc8c. Our --positive token IS #92d528, so the modal success should reuse it.

### 🟠 HIGH — Modal danger button bg: reference #bb352a, we use #e74c3c
`--modal-btn-danger-bg → our --modal-danger` · element: `Modal danger/delete button`

- **Reference:** #bb352a
- **Ours:** #e74c3c
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/routes/layout.css:42
- **Fix / why:** Reference danger/delete red is brick #bb352a (== --negative, --file-delete-bg, --note-delete-bg); we use Darkly red #e74c3c. Our --negative token IS #bb352a, so the modal danger should reuse it.

### 🟠 HIGH — Modal active-tab: reference #45a2ff bg / #fff text, we use #00bc8c
`--modal-active-tab-bg-color (#45a2ff) + --modal-active-tab-color (#fff) → our --modal-active-tab` · element: `Modal tab (active)`

- **Reference:** #45a2ff (bg), #fff (text)
- **Ours:** #00bc8c
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/routes/layout.css:43
- **Fix / why:** Reference active modal tab is accent-blue #45a2ff (== --tab-active-bg, --checkbox-bg-color, --search-icon-bg-color, --modal-tabs-border-color); we color it Darkly green #00bc8c. Our --accent IS #45a2ff. Modal.svelte:114 also remaps --accent:var(--modal-active-tab) inside modals, propagating the wrong green.

### 🟠 HIGH — Modal input-group bg: reference #0a6db1, we use #444
`--modal-input-group-bg → our --modal-input-bg` · element: `Modal input group addon`

- **Reference:** #0a6db1
- **Ours:** #444
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/routes/layout.css:44
- **Fix / why:** Reference input-group addon is link-blue #0a6db1; we use Darkly input gray #444. (Note our token name --modal-input-bg conflates the addon bg with the field bg.)

### 🟡 MEDIUM — Modal active-tab text remap inside Modal.svelte uses wrong accent-hover
`--accent-hover (modal scope)` · element: `Modal scoped overrides`

- **Reference:** n/a (reference modal hover derives from #45a2ff/#0a6db1 family)
- **Ours:** #00a37a
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/Modal.svelte:115
- **Fix / why:** Modal.svelte overrides --accent-hover:#00a37a and --text-dim:#b8b8b8 to support the Darkly-green theme; both fall out of sync with the reference navy/blue modal family. Tied to the modal-palette decision above.

### 🟡 MEDIUM — Avatar/roster image radius: reference 50% (round), we render square
`--rosterImg-border-radius` · element: `Roster / chat / alert / presenter avatar`

- **Reference:** 50%
- **Ours:** border-radius: 0 (hardcoded)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomSidebar.svelte:579,591-592 (also ChatPanel.svelte:551, ScreenStage.svelte:190, AlertFeed.svelte:570)
- **Fix / why:** Reference --rosterImg-border-radius is 50% (round gravatars). We deliberately render SQUARE avatars (border-radius:0) with a comment claiming Bootstrap Darkly uses --rosterImg-border-radius:0 — but the authoritative JSON value is 50%. Visible shape mismatch on every avatar.

### 🟡 MEDIUM — Chat username color: reference light-theme --username-color #676767, we use #000
`--lightTheme-username-color / --lightTheme-nickname-color` · element: `Chat message username (member rows)`

- **Reference:** #0a6db1 (--lightTheme-username-color) — see note
- **Ours:** #000
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:256,487,576
- **Fix / why:** Reference --lightTheme-username-color=#0a6db1 (link-blue). We hardcode chat username #000 (per a prior eyedrop claim that 'light-theme --username-color resolves to #000'), which conflicts with the JSON token value #0a6db1. Per-user author_color still overrides via inline style, so this only affects users with no custom color. AlertFeed.svelte (514,592) correctly uses var(--username-color) = #0a6db1.

### 🔵 LOW — Modal text color: reference #f4f4f4, we use #ffffff
`--modal-content-color → our --modal-color` · element: `Modal content text`

- **Reference:** #f4f4f4
- **Ours:** #ffffff
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/routes/layout.css:38
- **Fix / why:** Off-white vs pure white — barely visible. Our layout.css line 37 comment claims --modal-content-color is pure #fff, but the JSON value is #f4f4f4.

### 🔵 LOW — Dark-theme message-panel tokens never used (panel ships light palette in both modes)
`--darkTheme-msgs-bg (#143c57), --darkTheme-msg-bg (#000), --darkTheme-msgs-bg-adm (#0f2e43), --darkTheme-msg-color (#fff), --darkTheme-chat-bg (#000), --darkTheme-roster-bg (#111), --darkTheme-textarea-bg (#0c2434)` · element: `Chat/alert message panel (dark mode)`

- **Reference:** dark message-panel palette (e.g. msgs-bg #143c57)
- **Ours:** MISSING (we render the light palette: msgs-bg #fff in all modes)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:320,414,449,456
- **Fix / why:** The reference message panel has an independent dark theme (white-on-navy). Our panel always renders the reference LIGHT palette (white bg) regardless of app dark/light mode, so the entire --darkTheme-msg* group is unimplemented. This is a deliberate simplification, flagged as a structural gap rather than a per-token color bug.

### 🔵 LOW — Notes/files/search-icon/users-badge/archives-dropdown token families undefined
`--note-* / --file-* / --search-icon-* / --users-badge-* / --archives-dropdown-menu-* / --tabs-* / --tab-*` · element: `Notes tabs, file rows, search icon, user-count badge, archives dropdown`

- **Reference:** e.g. --tab-active-bg #45a2ff, --tabs-border-color #0a6db1, --file-size-color #b2b2b2, --file-download-bg #92d528, --file-delete-bg #bb352a, --notes-tabs-bg #0c2434, --note-options-bg #f4f4f4, --users-badge-bg-color #0e3651, --search-icon-bg-color #45a2ff, --archives-dropdown-menu-bg-color #0e3651
- **Ours:** MISSING as tokens — covered by hardcoded literals in component scoped styles (FilesPanel.svelte, ScreenStage.svelte, RoomSidebar.svelte) that reference the same hexes in comments
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/FilesPanel.svelte:269,291,297,422,456 ; ScreenStage.svelte:143,174,178
- **Fix / why:** We define none of these as tokens; the component comments cite the exact reference hexes and the hardcoded literals appear to match, so most are NOT visible divergences. Flagged low because they are visibly-used surfaces that depend on literal correctness rather than a shared token — verify the literals individually if a per-pixel pass is needed. The values that ARE wrong (modal-* family, avatar radius, chat username) are split out above.

### ⚪ COSMETIC — Message admin-row bg matches reference but via hardcode, not token
`--lightTheme-msgs-bg-adm` · element: `Chat/alert admin message row`

- **Reference:** #f4f4f4
- **Ours:** #f4f4f4 (hardcoded)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:456
- **Fix / why:** Value MATCHES, but we hardcode the literal instead of defining a token, so a runtime re-theme can't reach it. Listed for completeness, not a visible bug.

### ⚪ COSMETIC — Message separator colors match reference light-theme but hardcoded
`--lightTheme-msgs-separator-bg (#e8e8e8) + --lightTheme-msgs-separator-color (#373c42)` · element: `Chat date separator`

- **Reference:** #e8e8e8 bg, #373c42 text
- **Ours:** #e8e8e8 bg, #373c42 text (hardcoded)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:434-435
- **Fix / why:** Values MATCH the reference light-theme separator tokens; hardcoded, not tokenized. No visible divergence.

### ⚪ COSMETIC — Split gutter color matches reference (#0a6db1) — no divergence
`--split-gutter-bg (#0a6db1) + --split-gutter-color (#fff)` · element: `Split-pane drag gutter`

- **Reference:** #0a6db1 bg, #fff grip
- **Ours:** #0a6db1 (hardcoded)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/Split.svelte:168 ; AlertsChatDock.svelte:185
- **Fix / why:** MATCH. Hardcoded, not tokenized. Included so the gutter is not mistaken for an open divergence.

### ⚪ COSMETIC — Checkbox/accent-color matches reference (#45a2ff) — no divergence
`--checkbox-bg-color (#45a2ff)` · element: `Settings checkboxes / form accents`

- **Reference:** #45a2ff
- **Ours:** var(--accent) = #45a2ff
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/routes/settings/+page.svelte:322
- **Fix / why:** MATCH via our --accent token (dark mode #45a2ff). Note: in our LIGHT mode --accent becomes #1d7fe0, so checkbox accent would diverge from reference #45a2ff there — but the reference checkbox token is mode-independent. Minor light-mode-only edge.

---

## nav-deep  ·  _[presenter-deep]_

> The .users pill is a close match on the load-bearing properties (1px solid #fff border, NO radius, padding 1px 5px, margin 0 5px≈4px, 14px/21px weight-300 white text, cursor pointer, display flex, align-items center). Real divergences: (1) the pill uses flex `gap: 0.3rem` where the reference uses `gap: normal` (no gap) — the reference relies on the fa-user glyph's natural inline width + the count text with no flex gap, so our pill renders ~5px wider than the reference's measured 24.25px and our icon-to-count spacing differs; (2) the fa-user icon is rendered via our Icon.svelte (font-family unknown / likely a different icon font or SVG) rather than reference "Font Awesome 5 Free" weight 900 — the reference glyph is a font glyph (display:block, 12.25×14, weight 900), worth confirming our Icon outputs the same metrics. NOTE on the navbar shell: the reference slice's `nav.navbar` block (250×1117, transparent bg, color rgb(103,103,103), flex-direction row, justify-content space-between) is the COLLAPSED LEFT SIDEBAR/off-canvas drawer (rect.x=-250, text "Powered by… Version v4.0.1"), NOT the 49px top app bar — so that computed block is not a valid 1:1 reference for our `.topnav` shell. Our `.topnav` height 49px / bg --bg(#0c2434) / flex / align-items center is from the verified mainAppNav and is internally consistent; I report the shell rows as informational mismatches against the captured (sidebar) element with that caveat, plus the genuinely comparable userPill/icon rows. No radius, border, color, padding, or font-weight bug found on the pill itself.

### 🟠 HIGH — userPill uses flex gap 0.3rem; reference uses gap: normal (no flex gap)
`gap` · element: `span.users`

- **Reference:** normal (computed; .users has no row-gap — icon+count spacing is intrinsic, measured pill width 24.25px)
- **Ours:** gap: 0.3rem
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomTopNav.svelte:297
- **Fix / why:** Reference computed gap is `normal`. Our 0.3rem (≈4.8px) flex gap pushes the count away from the glyph and widens the pill beyond the reference's 24.25px. To match the 24.25px box (12.25px glyph + 5px+5px padding ≈ 22.5px plus ~1.75px count digit) the icon and count must sit with no flex gap. Remove `gap` (or set 0) and let the count text follow the glyph directly.

### 🟡 MEDIUM — userPill measured width is wider than reference 24.25px
`width` · element: `span.users`

- **Reference:** 24.25px (computed width; rect w=24)
- **Ours:** auto (content-driven; inflated by gap:0.3rem at line 297)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomTopNav.svelte:294-308
- **Fix / why:** Consequence of the extra flex gap (and the count digit being rendered). Reference pill is 24.25×18 holding ONLY the fa-user glyph (the visible reference pill has no number text — text is empty in the capture). Our pill renders `{userCount}` in a .count span, which the reference pill does not show in this capture, further widening it. Confirm whether the reference shows the count digit at all; if not, the .count text is an extra element vs the reference.

### 🟡 MEDIUM — userPillIcon font/weight — reference is Font Awesome 5 Free weight 900
`font-family / font-weight` · element: `i.fas.fa-user`

- **Reference:** font-family "Font Awesome 5 Free", font-weight 900, font-size 14px, line-height 14px, display block, 12.25×14, color rgb(255,255,255)
- **Ours:** <Icon name="user" size={14} /> — glyph emitted by Icon.svelte (not verified to be FA5 weight-900; Icon component abstracts the font/SVG source)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomTopNav.svelte:77
- **Fix / why:** Reference glyph is a solid (weight 900) Font Awesome 5 user glyph at 14px sized to 12.25×14, display:block, white. Our icon goes through Icon.svelte at size 14; whether it produces the same 12.25×14 metrics, weight, and white fill is not confirmable from this file. Verify Icon.svelte name="user" maps to the FA5 solid user glyph (or matching SVG) at weight 900 and display:block so the box is 12.25×14.

### 🔵 LOW — userPill renders a count digit the reference capture does not
`text-content` · element: `span.users > span.count`

- **Reference:** (empty — reference .users text is "", glyph only, box 24.25×18)
- **Ours:** <span class="count">{userCount}</span> (renders the numeric user count)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomTopNav.svelte:78
- **Fix / why:** The captured reference pill is 24.25px wide with empty text — only the fa-user glyph. Our pill appends the count number. This may be a legitimate product choice, but it diverges from the captured reference box dimensions. If matching the reference exactly, the digit should not be inside the pill.

### 🔵 LOW — userPillIcon display — reference is block, our Icon likely inline
`display` · element: `i.fas.fa-user`

- **Reference:** block
- **Ours:** MISSING (Icon.svelte default display unknown; FA via inline <i> would be inline-block, not block)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomTopNav.svelte:77
- **Fix / why:** Reference fa-user computes display:block (12.25×14). Inside a flex pill this rarely changes layout, but the reference value is block — confirm Icon.svelte's inner element does not introduce extra inline whitespace/baseline offset that shifts the glyph within the 18px-tall pill.

### 🔵 LOW — Navbar shell computed block in slice is the COLLAPSED SIDEBAR, not the top bar
`identity / dimensions / background` · element: `nav.navbar (slice 'navbar' item)`

- **Reference:** width 250px, height 1117px, rect.x=-250 (offscreen), background-color rgba(0,0,0,0) transparent, color rgb(103,103,103), flex-direction row, justify-content space-between, text "Powered by: ProTradingRoom.com Version: v4.0.1…"
- **Ours:** .topnav: position fixed, height 49px, background var(--bg)=#0c2434, color var(--text)=#fff, display flex, align-items center, justify-content NOT set (default flex-start; right-pinning via .spacer flex:1)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomTopNav.svelte:210-232
- **Fix / why:** The captured nav.navbar is the 250px-wide, 1117px-tall left off-canvas drawer (transparent bg, gray text, 'Powered by… Version' footer text), NOT the 49px mainAppNav top bar. Its computed style block therefore is NOT a valid 1:1 reference for our .topnav shell. Our .topnav 49px height / #0c2434 bg / flex / no bottom border is sourced from the verified mainAppNav (consistent with the code comments at lines 219-231). Treat the shell bg/height/flex rows as already verified against mainAppNav; the slice's space-between/250px/transparent values should NOT be applied to .topnav.

---

## sidebar-deep  ·  _[presenter-deep]_

> Forensic diff of RoomSidebar.svelte (/Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomSidebar.svelte) against the presenter-view reference slice (/tmp/proroom-ref-slices/pd_sidebar.json). The reference exposes two element groups: the .room-sidebar drawer (captured collapsed: width 0px, transparent bg, #cccccc text, Open Sans 16px/300/lh24) and four .nav-link.sidebar-item rows (Connectivity Check, General Settings, Archives [dropdown-toggle], Manage Muted Users) at w236 h37, display:block, #676767, 14px/700, lh21px, padding 8px 0, margin 0 5px, transparent bg, no border, radius 0.

The single most important divergence is the resting->hover behavior. The reference hover WINNER is background-color #e9ecef (rgb(233,236,239), from .sidebar-item:hover, specificity 300) with color staying #676767 (the .sidebar-item rule carries color:inherit !important, so #676767 is preserved on hover). Our code at lines 440-444 does the EXACT OPPOSITE: it sets background:transparent and color:#212529 on hover — i.e. we suppress the gray fill the reference shows and we darken the text the reference keeps constant. The inline comment at lines 435-439 explicitly rationalizes dropping the #e9ecef fill ("NO background fill", "Border stays transparent"), which directly contradicts the captured hover winner. Same inversion applies to .sub-item:hover (lines 484-488). Active state in the reference is also a no-op (bg initial, color inherit) which we approximately match by also being a no-op visually, but our resting/hover model is wrong.

Secondary divergences: our rows are display:flex (line 415/467) vs reference display:block; line-height is unset on our items (inherits, computes ~normal ~17px) vs reference 21px, which combined with our reserved 1px transparent border yields ~35px rows vs the reference 37px; Archives is white-space:nowrap in the reference (computed line 717) but unset (normal) in ours. The .room-sidebar drawer itself is transparent with #cccccc/16px/300 text in the reference (the white comes from a parent container), whereas we paint background:#ffffff and color:#676767 directly on .sidebar/.sidebar-inner (lines 276/291) and set font-size 14px (line 295) — the rendered white matches but the structural model differs; width is not comparable because the reference was captured collapsed (0px).

### 🔴 CRITICAL — Menu-item hover background fill is dropped (reference shows #e9ecef)
`background-color (hover)` · element: `.nav-link.sidebar-item:hover (Connectivity Check / General Settings / Archives / Manage Muted Users)`

- **Reference:** rgb(233, 236, 239) = #e9ecef (hover winner from .sidebar-item[_ngcontent]:hover, specificity 300, order 6743)
- **Ours:** transparent
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomSidebar.svelte:444 (.item:hover:not(:disabled) { background: transparent; })
- **Fix / why:** This is the explicitly-named focus item ('hover bg #e9ecef'). The reference hover paints a light gray fill across the full 236px row; our hover paints nothing. The comment at lines 435-439 deliberately rationalizes removing this fill, contradicting the captured winner. Same on .sub-item:hover line 487.

### 🟠 HIGH — Menu-item hover text color darkened instead of held constant
`color (hover)` · element: `.nav-link.sidebar-item:hover`

- **Reference:** stays rgb(103,103,103) = #676767 — the .sidebar-item rule declares color: inherit !important (order 6742), so the resting #676767 is preserved through hover; the hover{} block reports color value 'inherit' !important fromState base
- **Ours:** #212529 (darkens on hover)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomSidebar.svelte:441 (.item:hover:not(:disabled) { color: #212529; })
- **Fix / why:** Reference text color does not change on hover (only the background fills). We change color and not background — the inverse of the reference. Same on .sub-item:hover line 486.

### 🟡 MEDIUM — Menu item line-height unset (computes ~normal) vs reference 21px → row height 35 vs 37
`line-height / height` · element: `.nav-link.sidebar-item`

- **Reference:** line-height 21px; computed height 37px (rect h=37, w=236)
- **Ours:** line-height not set on .item (inherits; no line-height on .sidebar-inner either) → ~normal (~17px); with padding 8+8 and reserved 1px transparent border top+bottom, height computes ~35px
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomSidebar.svelte:414-430 (.item has no line-height; border 1px transparent at line 422)
- **Fix / why:** Reference rows are 37px tall from lh21 + 8px*2 padding and NO border. We have ~17px line-height + 16px padding + 2px transparent border = ~35px. Add line-height:21px and the rows match; the 1px transparent border (line 422) also adds 2px the reference does not have (reference border-width is 0px all sides).

### 🔵 LOW — Menu item uses display:flex; reference is display:block
`display` · element: `.nav-link.sidebar-item`

- **Reference:** block
- **Ours:** flex
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomSidebar.svelte:415 (.item { display: flex; align-items: center; }) and :467 (.sub-item)
- **Fix / why:** Reference relies on inline icon + span.pl-2 flow inside a block anchor; we use flex with align-items:center. Visually similar for a single icon+label line but the box model differs (flex baseline vs inline block).

### 🔵 LOW — Drawer painted white/#676767 directly; reference drawer is transparent with #cccccc text
`background-color / color / font-size / font-weight` · element: `.room-sidebar (drawer) vs our .sidebar / .sidebar-inner`

- **Reference:** background-color rgba(0,0,0,0) (transparent); color rgb(204,204,204)=#cccccc; font-size 16px; font-weight 300; line-height 24px; font-family "Open Sans", sans-serif (white surface comes from a parent container, not this element)
- **Ours:** background #ffffff (line 276), color #676767 (line 291), font-size 14px (line 295); font-weight inherits body (~400)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomSidebar.svelte:276,291,295 (.sidebar background:#ffffff; .sidebar-inner color:#676767; font-size:14px)
- **Fix / why:** Structural difference: the reference .room-sidebar is a transparent block whose default text is #cccccc/16px/300 — the white background and the #676767 menu text both come from descendants/parent, not this node. We collapse that onto the drawer (white bg + #676767 base color + 14px base). The rendered menu rows still match because our .item/.sub-item override to #676767/14px/700. Drawer width is not comparable: the reference was captured collapsed (rect w=0, computed width 0px).

### ⚪ COSMETIC — Archives row missing white-space: nowrap
`white-space` · element: `a#archivesDropdown.nav-link.sidebar-item.dropdown-toggle (Archives)`

- **Reference:** nowrap (computed line 717; the other three rows are 'normal')
- **Ours:** normal (white-space not set on .item)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/RoomSidebar.svelte:414-430 (.item — no white-space declared)
- **Fix / why:** Only the Archives dropdown-toggle row is nowrap in the reference (dropdown caret behavior). Single-word label won't wrap regardless, so visually negligible, but the computed value differs.

---

## composer-deep  ·  _[presenter-deep]_

> Our composer is structurally divergent from the reference. The reference is a FLAT white rounded-rectangle holder (#textAreaHolder.textSendDiv: white bg, border-radius 8px, margin 5px all sides, padding 5px all sides, height 45px, flex align-items:center) containing a textarea (.txt-area: white bg, color #676767, 14px/400, line-height 21px, height 35px/min-height 35px/max-height 300px, padding 6px 5px, white-space pre-wrap) plus inline GIF/emoji/image buttons — there is NO visible Send button and NO pill border in the holder; the only border/radius is the holder's own 8px corners. Our implementation (ChatPanel.svelte lines 278-301, .pill/.send styles 604-678) instead renders a gray form bar (#f7f8fa, padding 0.6rem 0.65rem, top border) wrapping a 999px-radius bordered .pill that holds a transparent textarea, plus a separate blue rounded Send button. Net effect: wrong container shape (999px pill vs 8px rect), wrong bg layering (gray form bar + bordered pill vs single white holder), wrong textarea metrics (font 0.85rem≈13.6px vs 14px, line-height 1.4 vs 21px, max-height 120px vs 300px, no min-height 35px, padding 0.35rem 0.25rem vs 6px 5px), and an extra Send button the reference doesn't show. The reference holder/textarea hover and active states keep the same white bg and #676767 color (no visual change on hover) — we have no hover styling on the holder/textarea, which is acceptable since the reference is also static, but our pill border + form bar produce a visibly different resting state.

### 🔴 CRITICAL — Composer holder shape: 999px pill vs reference flat 8px rectangle
`border-radius` · element: `chatHolder (#textAreaHolder.textSendDiv) → our .pill`

- **Reference:** 8px on all four corners (border-top-left/right + bottom-left/right-radius: 8px); holder itself carries the only radius
- **Ours:** 999px (border-radius: 999px) on .pill
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:621
- **Fix / why:** Reference is a near-square rounded rectangle (8px); ours is a fully-rounded capsule pill. Changes the entire silhouette of the composer.

### 🟠 HIGH — Composer holder border: 1px solid #d3d7e0 vs reference borderless
`border` · element: `chatHolder (#textAreaHolder.textSendDiv) → our .pill`

- **Reference:** border-*-width: 0px on all sides, border-top-style: none — the holder has NO border (white bg only, radius supplies the shape)
- **Ours:** border: 1px solid #d3d7e0 on .pill
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:620
- **Fix / why:** Reference holder is borderless; ours draws a visible gray outline around the pill.

### 🟠 HIGH — Composer outer wrapper bg: reference holder is white (no gray form bar) vs our form #f7f8fa
`background-color` · element: `form wrapper around composer`

- **Reference:** Holder bg is rgb(255,255,255) white; there is no separate gray composer bar in the reference slice — the holder sits directly with white bg + 5px margin
- **Ours:** form background: #f7f8fa (gray bar) with border-top 1px #e3e5ec and padding 0.6rem 0.65rem
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:604-612
- **Fix / why:** We introduce a gray form bar + top border that the reference does not have; the reference composer area is white.

### 🟠 HIGH — Textarea height/min-height/max-height: reference 35/35/300 vs ours auto/none/120
`height, min-height, max-height` · element: `chatTextarea (.txt-area.form-control.border-0) → our .pill textarea`

- **Reference:** height: 35px, min-height: 35px, max-height: 300px (computed)
- **Ours:** height not set (auto-grows via JS to min(scrollHeight,120)); min-height MISSING; max-height: 120px
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:91,636
- **Fix / why:** Reference textarea has a hard 35px min and 300px max; ours has no 35px floor and caps growth at 120px instead of 300px (autogrow() line 91 also clamps to 120).

### 🟠 HIGH — Separate Send button present in ours, absent in reference composer slice
`display / element existence` · element: `send button (our .send) vs reference holder`

- **Reference:** No Send button in the reference composer slice — the holder contains the textarea + inline icon buttons (GIF etc.) only; sending is via Enter/icon, no standalone rounded blue Send
- **Ours:** Extra <button class="send"> rendered outside the pill: blue #0a6db1, border-radius 999px, padding 0.45rem 0.9rem, weight 600
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:297,661-678
- **Fix / why:** We add a standalone Send button the reference composer does not show. Either remove it or move sending inline to match the reference holder layout.

### 🟡 MEDIUM — Composer holder margin: reference 5px all sides vs ours MISSING
`margin` · element: `chatHolder (#textAreaHolder.textSendDiv) → our .pill`

- **Reference:** margin-top/right/bottom/left: 5px each (5px all around the holder)
- **Ours:** MISSING — .pill has no margin; spacing comes from the form's padding instead
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:613-623
- **Fix / why:** Reference insets the white holder 5px from its parent; ours relies on the gray form wrapper's padding (0.6rem 0.65rem) which is a different value and layering.

### 🟡 MEDIUM — Composer holder padding: reference 5px all sides vs ours 0.15rem 0.5rem
`padding` · element: `chatHolder (#textAreaHolder.textSendDiv) → our .pill`

- **Reference:** padding-top/right/bottom/left: 5px each
- **Ours:** padding: 0.15rem 0.5rem (≈2.4px vertical, 8px horizontal) on .pill
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:622
- **Fix / why:** Reference padding is a uniform 5px; ours is asymmetric (2.4px/8px), so vertical inset is too small and horizontal too large.

### 🟡 MEDIUM — Composer holder height: reference fixed 45px vs ours not set
`height` · element: `chatHolder (#textAreaHolder.textSendDiv) → our .pill`

- **Reference:** height: 45px (computed exactly 45px; rect h=45)
- **Ours:** MISSING — .pill height is content-driven (textarea + 0.15rem padding); no explicit height
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:613-623
- **Fix / why:** Reference holder is a fixed 45px tall bar; ours has no fixed height, so resting height differs.

### 🟡 MEDIUM — Textarea font-size: reference 14px vs ours 0.85rem (≈13.6px)
`font-size` · element: `chatTextarea (.txt-area.form-control.border-0) → our .pill textarea`

- **Reference:** font-size: 14px
- **Ours:** font-size: 0.85rem (13.6px at 16px root)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:632
- **Fix / why:** 0.4px smaller than reference; should be 14px to match.

### 🟡 MEDIUM — Textarea line-height: reference 21px vs ours 1.4 (≈19px)
`line-height` · element: `chatTextarea (.txt-area.form-control.border-0) → our .pill textarea`

- **Reference:** line-height: 21px
- **Ours:** line-height: 1.4 (≈19.04px at 13.6px font)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:637
- **Fix / why:** Reference uses an absolute 21px; ours computes to ~19px, affecting single-line vertical centering.

### 🔵 LOW — Textarea padding: reference 6px 5px vs ours 0.35rem 0.25rem
`padding` · element: `chatTextarea (.txt-area.form-control.border-0) → our .pill textarea`

- **Reference:** padding-top/bottom: 6px, padding-left/right: 5px (6px 5px)
- **Ours:** padding: 0.35rem 0.25rem (≈5.6px vertical, 4px horizontal)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:633
- **Fix / why:** Vertical 5.6px vs 6px and horizontal 4px vs 5px; small but off.

### 🔵 LOW — Textarea background: reference white vs ours transparent
`background-color` · element: `chatTextarea (.txt-area.form-control.border-0) → our .pill textarea`

- **Reference:** background-color: rgb(255,255,255) white (var(--textarea-bg) resolves white, applied !important)
- **Ours:** background: transparent
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:629
- **Fix / why:** Reference textarea is explicitly white; ours is transparent. Visually equivalent only because our .pill bg is also white — but the reference rule is white !important, so structurally different.

### 🔵 LOW — Textarea font-weight: reference 400 vs ours not set (inherits 300 from holder context)
`font-weight` · element: `chatTextarea (.txt-area.form-control.border-0) → our .pill textarea`

- **Reference:** font-weight: 400 (textarea computed 400, distinct from holder's 300)
- **Ours:** MISSING — no font-weight on .pill textarea; inherits page default (likely 400 via body, but not asserted)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:624-639
- **Fix / why:** Reference pins textarea to 400 explicitly; we should set font-weight: 400 to be safe rather than inherit.

### 🔵 LOW — Textarea font-family: reference Open Sans vs ours inherit
`font-family` · element: `chatTextarea (.txt-area.form-control.border-0) → our .pill textarea`

- **Reference:** font-family: "Open Sans", sans-serif
- **Ours:** font-family: inherit (line 638) — depends on app's body font, not guaranteed Open Sans
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:638
- **Fix / why:** Reference is Open Sans; ours inherits whatever the app sets. Only matches if the room shell loads Open Sans as the base font.

### 🔵 LOW — Holder font-size/weight: reference 16px/300 vs ours (placeholder GIF text) inherits
`font-size, font-weight` · element: `chatHolder (#textAreaHolder.textSendDiv) → our .pill`

- **Reference:** holder font-size: 16px, font-weight: 300, line-height: 24px (governs inline text like the GIF label)
- **Ours:** MISSING on .pill; our GIF label is styled by .gif (font-size 0.72rem, weight 800) at lines 656-660 — very different
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:613-623,656-660
- **Fix / why:** Reference holder text is light (300) 16px; our GIF chip is bold (800) 0.72rem. Different treatment of the inline GIF affordance.

### ⚪ COSMETIC — Textarea color matches (#676767) — confirm only
`color` · element: `chatTextarea (.txt-area.form-control.border-0) → our .pill textarea`

- **Reference:** color: rgb(103,103,103) = #676767
- **Ours:** color: #676767
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:631
- **Fix / why:** Match. Listed only because font-weight/family differ around it; color itself is correct so could be omitted.

### ⚪ COSMETIC — Holder flex direction/align match (row, center) — confirm only
`display, flex-direction, align-items` · element: `chatHolder (#textAreaHolder.textSendDiv) → our .pill`

- **Reference:** display: flex, flex-direction: row, align-items: center
- **Ours:** display: flex, align-items: center (flex-direction defaults to row)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/ChatPanel.svelte:614-615
- **Fix / why:** Match on layout axis/alignment. Listed for completeness; could be omitted.

---

## stagetabs-deep  ·  _[presenter-deep]_

> Forensic diff of #mainTabs tabs (Screens/Notes/Files) in MainStage.svelte vs the protradingroom.com presenter reference. The default-active tab in the reference is screens-tab (.nav-link.active), and our component also defaults tab='screens' — so the active element matches. The active pill geometry is largely faithful: ref active bg rgb(69,162,255)=#45a2ff, color #fff, border-radius 3px, padding 8px, margin 5px, font 12px/300/12px Open Sans — and our .tabbar button.active reproduces bg var(--accent,#45a2ff)=#45a2ff, #fff, radius 3px, font-weight 300; idle padding 8px + margin 5px also match. The most consequential divergences: (1) our idle tab color is hardcoded #ccc which actually MATCHES the reference COMPUTED rgb(204,204,204), so that is correct — but our hover border uses --accent-hover (#0a6db1 dark / #1565be light) whereas the reference hover border-top-color is rgb(68,68,68)=#444, and our hover forces border-radius 3px while the reference hover keeps the idle 6px top radius (hover changes only border-top-color, not radius). (2) Our .notes-active rule paints the ACTIVE Notes tab dark --bg #0c2434, but the reference never does this: #notes-tab is not the default-active tab, and even its active-state winners resolve --tab-active-bg #45a2ff (blue) with --note-tabs-color #fff — there is no dark-notes-tab quirk in this slice, so .notes-active is an invented divergence. (3) Idle tab border-radius: reference is asymmetric (top-left/top-right 6px, bottom 0px — a tab-folder shape) but ours is a uniform 6px all corners; the active reference flips to a uniform 3px pill (which we match). (4) Tablist structure: reference renders <a> nav-links inside Bootstrap .nav-tabs; ours renders <button role=tab> — functionally fine but the reference relies on Bootstrap nav-tabs cascade (border-top transparent, underline reset). Minor: reference label gap is via span margin-left 4px (we use flex gap 4px — equivalent); ref icon is an <i> Bootstrap glyph vs our Icon component at size 12. The reference also has a 4th hidden 'Streams' tab (rect 0,0,0,0) not present in our TABS array (we have Screens/Notes/Files only) — the reference visible set is Screens/Notes/Files, so our 3-tab set matches the visible reference.

### 🟠 HIGH — Active Notes tab forced to dark bg — invented quirk not in reference
`background-color (active state)` · element: `#notes-tab (.nav-link.presAreaTabs-notes) when active`

- **Reference:** var(--tab-active-bg) = #45a2ff (rgb(69,162,255)); the reference active winner for #notes-tab is .mainTabset .nav-link.active { background-color: var(--tab-active-bg) } resolving to #45a2ff, with color var(--note-tabs-color)=#fff. No dark-bg rule applies.
- **Ours:** background: var(--bg, #0c2434) = #0c2434
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/MainStage.svelte:198-202 (.tabbar button.active.notes-active { background: var(--bg, #0c2434); })
- **Fix / why:** The slice shows NO notes-specific dark-bg rule. The active Notes tab in the reference is the same blue #45a2ff pill as any active tab (.mainTabset .nav-link.active applies uniformly). Our .notes-active override paints it dark navy, diverging whenever Notes is the active tab. Recommend removing the .notes-active branch and the class:notes-active binding (line 75).

### 🟠 HIGH — Hover border color wrong: ours uses accent-hover blue, reference uses #444 gray
`border-top-color (hover)` · element: `#mainTabs .nav-link (idle tab) :hover`

- **Reference:** rgb(68, 68, 68) = #444 — winning hover rule .nav-tabs .nav-link:hover { border-top-color: rgb(68,68,68) } (specificity 300, fromState hover). Confirmed identically in screens/notes/files hover{} blocks.
- **Ours:** var(--accent-hover) = #0a6db1 (dark theme) / #1565be (light theme) — full 1px border on ALL sides, not just top
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/MainStage.svelte:178-183 (.tabbar button:hover:not(.active):not(:disabled) { border: 1px solid var(--accent-hover); border-radius: 3px; })
- **Fix / why:** Reference hover only changes border-TOP-color to #444 (the other three sides stay rgba(0,0,0,0) transparent per the idle .nav-tabs .nav-link border-color:transparent). Ours sets a full 4-side colored border in a different hue. Also see radius divergence below.

### 🟡 MEDIUM — Hover changes border-radius (3px); reference keeps idle radius on hover
`border-radius (hover)` · element: `#mainTabs .nav-link (idle tab) :hover`

- **Reference:** No radius change on hover — the hover winners only touch border-top-color/color/text-decoration. Idle radius (top-left/top-right 6px, bottom 0px) is retained on hover.
- **Ours:** border-radius: 3px
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/MainStage.svelte:182 (.tabbar button:hover ... { border-radius: 3px; })
- **Fix / why:** Reference hover does not alter radius; our hover snaps the idle 6px corners to 3px, a visible shape change on mouseover the reference does not have.

### 🟡 MEDIUM — Idle tab corner radius: reference is asymmetric tab-folder, ours is uniform 6px
`border-radius (resting)` · element: `#mainTabs .nav-link (idle: streams/notes/files)`

- **Reference:** border-top-left-radius 6px, border-top-right-radius 6px, border-bottom-right-radius 0px, border-bottom-left-radius 0px (only top corners rounded — Bootstrap nav-tab folder tab shape)
- **Ours:** border-radius: 6px (all four corners 6px)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/MainStage.svelte:173 (.tabbar button { border-radius: 6px; })
- **Fix / why:** Our bottom corners are 6px-rounded; reference bottom corners are square (0px). Recommend border-radius: 6px 6px 0 0 for idle. Note: idle tabs are transparent-bg so the rounding is only perceptible on hover border / focus.

### 🔵 LOW — Reference uses <a> nav-link inside Bootstrap .nav-tabs; ours uses <button role=tab>
`tag / class` · element: `tab element tag/class structure`

- **Reference:** tag a, class 'nav-link active' (screens) / 'nav-link presAreaTabs-notes' (notes) / 'nav-link' (files), inside #mainTabs .mainTabset .nav-tabs
- **Ours:** tag button, type=button, role=tab, class:active / class:notes-active, no Bootstrap nav-link/nav-tabs classes
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/MainStage.svelte:70-81
- **Fix / why:** Functionally equivalent and arguably more accessible (button + role=tab). Noted because the reference's transparent-border / no-underline / color cascade all come from the Bootstrap .nav-tabs + a:not(.btn) chain, which we reimplement by hand; any future Bootstrap-derived behavior won't carry over automatically.

### ⚪ COSMETIC — Active tab radius matches but is uniform vs idle asymmetry — verify intent
`border-radius (active)` · element: `#screens-tab (.nav-link.active, default-active)`

- **Reference:** all four corners 3px (border-top-left/right/bottom-left/bottom-right all 3px) — active pill is a fully-rounded 3px rect
- **Ours:** border-radius: 3px (all four corners)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/MainStage.svelte:196 (.tabbar button.active { border-radius: 3px; })
- **Fix / why:** MATCH — active pill is uniform 3px in both. Listed only to confirm the active/idle radius asymmetry (idle 6px-top/0-bottom vs active 3px-all) is real and our active value is correct.

### ⚪ COSMETIC — Notes tab id/class — presAreaTabs-notes class not present
`id / class` · element: `#notes-tab`

- **Reference:** id='notes-tab', class='nav-link presAreaTabs-notes'
- **Ours:** no id; class:notes-active toggled only when active; no presAreaTabs-notes class. Tab keyed by t.id='notes'.
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/MainStage.svelte:69-76 (TABS loop; notes entry defined line 62)
- **Fix / why:** We don't expose #notes-tab / .presAreaTabs-notes identifiers. No visual impact in this slice (presAreaTabs-notes carries no decls in the matchingRules), but it means selector-based reference CSS targeting #notes-tab would not hit our markup.

### ⚪ COSMETIC — Idle tab color hardcoded #ccc — matches computed, but diverges from token rule
`color (resting)` · element: `#mainTabs .nav-link (idle)`

- **Reference:** COMPUTED rgb(204,204,204) = #ccc (authoritative rendered value). Note: the highest-order matching rule .mainTabset .nav-link { color: var(--tabs-color) } resolves to #fff, but the computed block shows #ccc actually rendered — so #ccc is correct.
- **Ours:** color: #ccc
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/MainStage.svelte:165 (.tabbar button { color: #ccc; })
- **Fix / why:** MATCH against computed. Flagged only to document the reference's internal rule-vs-computed conflict (--tabs-color #fff rule loses to whatever set #ccc); do not 'fix' this to #fff.

### ⚪ COSMETIC — Label/icon spacing mechanism differs (flex gap vs span margin-left)
`gap / margin` · element: `tab inner content (icon + label)`

- **Reference:** icon-to-label spacing via label span margin-left 4px (span.ml-1); the link itself has gap:normal (no flex gap), display block
- **Ours:** display: inline-flex; gap: 4px on the button
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/MainStage.svelte:156-158 (.tabbar button { display: inline-flex; ... gap: 4px; })
- **Fix / why:** Visually equivalent 4px icon-label gap. Reference link is display:block with an inline icon + margin-left:4px span; ours is inline-flex with gap. No pixel difference expected.

---

## alerts-deep  ·  _[presenter-deep]_

> Two elements compared against the reference: the Q&A badge (.alert-qa) and the alerts header (nav.alertHeader). The resting state of .alert-qa is a near-exact match — the reference COMPUTED block is btn-secondary gray rgb(108,117,125)=#6c757d bg + #6c757d border, white text, 400/10px/15px, padding 1px 3px, 4px radius, 1px solid border, cursor pointer — and our code reproduces all of these. The two real divergences on .alert-qa are the :hover colors (we use #5c636a/#565e64; the reference Darkly winners are bg rgb(49,49,49)=#313131 and border-top rgb(43,42,42)=#2b2a2a) and the missing explicit width/height (ref 18x19; we only pin min-height:19px and let padding size the box). The alertHeader matches the reference on bg (#0a6db1=rgb(10,109,177)), height (48px), padding (4px all sides), align-items center, and color #fff; it diverges on justify-content (ref flex-start, ours space-between — a deliberate title/actions split) and the nav's own font-size (ref 16px/weight300/lh24 on the nav; our header sets no font-size and the .title child is 20px). No box-shadow, no border, flat corners on both — those match.

### 🟡 MEDIUM — .alert-qa :hover background-color differs from reference Darkly winner
`background-color (:hover)` · element: `.alert-qa (button.btn.btn-sm.btn-secondary.me-1.alert-qa)`

- **Reference:** rgb(49, 49, 49) = #313131 (matchingRules .btn-secondary:hover order 1941 decls.background-color; this is the highest-order hover bg winner over the var(--bs-btn-hover-bg) at order 3875)
- **Ours:** #5c636a
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/AlertFeed.svelte:624 (.alert-qa:hover { background: #5c636a; })
- **Fix / why:** We used the upstream Bootstrap default btn-secondary hover (#5c636a) but the reference is the Darkly theme override (#313131, a dark gray). Resting bg already matches (#6c757d), so the hover is the only mismatched state. The reference hover.background-color entry resolves to var(--bs-btn-hover-bg) but the higher-specificity/order .btn-secondary:hover rule (1941) is the actual winner at rgb(49,49,49).

### 🟡 MEDIUM — .alert-qa :hover border-color differs from reference
`border-top-color (:hover)` · element: `.alert-qa (button.btn.btn-sm.btn-secondary.me-1.alert-qa)`

- **Reference:** rgb(43, 42, 42) = #2b2a2a (hover.border-top-color winner, selector .btn-secondary:hover; matchingRules order 1941 decls.border-top-color rgb(43,42,42))
- **Ours:** #565e64 (border-color shorthand on hover)
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/AlertFeed.svelte:625 (.alert-qa:hover { border-color: #565e64; })
- **Fix / why:** Same root cause as the hover bg: we matched upstream Bootstrap (#565e64) instead of the Darkly override (#2b2a2a). Reference applies it to all four sides (computed border is uniform); our shorthand also covers all four, so only the value is wrong.

### 🔵 LOW — .alert-qa missing explicit width/height (relies on padding to size the box)
`width / height` · element: `.alert-qa (button.btn.btn-sm.btn-secondary.me-1.alert-qa)`

- **Reference:** width: 18px; height: 19px (computed; min-width/min-height 0px, max-width/max-height none)
- **Ours:** width: MISSING (no explicit width); height: MISSING — only min-height: 19px is set; box width comes from inline-flex content (10px icon) + padding 1px 3px + 1px border
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/AlertFeed.svelte:617 (min-height: 19px;) and :618 (padding: 1px 3px;)
- **Fix / why:** The reference 18px width = 10px icon + 3px+3px padding + 1px+1px border = 18px, and 19px height = 15px line-height + 1px+1px padding + 1px+1px border = 19px. Our box arrives at the same 19px height via min-height and the same ~18px width via content+padding+border, so the rendered box should match the reference numerically. Flagged because the dimensions are implicit, not asserted — when a count like '(3)' is present our width grows naturally (the reference button also has no fixed width: max-width none), so this is benign but worth noting that we never pin width/height explicitly.

### 🔵 LOW — alertHeader justify-content differs (deliberate layout redesign)
`justify-content` · element: `nav.alertHeader (our <header> inside .panel)`

- **Reference:** flex-start (computed justify-content: flex-start; the reference nav left-aligns its single brand)
- **Ours:** space-between
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/AlertFeed.svelte:399 (header { justify-content: space-between; })
- **Fix / why:** Reference nav only contains the 'Alerts' brand and left-aligns it (flex-start). Our header adds an .actions cluster (post/search/settings) on the right, so space-between is an intentional divergence to position both groups. Not a pixel defect of the brand itself; recorded because the property literally differs.

### 🔵 LOW — alertHeader nav font-size differs from reference base
`font-size / font-weight / line-height` · element: `nav.alertHeader (our <header> / .title)`

- **Reference:** nav computed: font-size 16px, font-weight 300, line-height 24px, font-family "Open Sans", sans-serif (the brand text 'Alerts' inherits these unless a navbar-brand rule overrides)
- **Ours:** header sets no font-size (inherits app default); .title child sets font-size: 20px, font-weight: 300, line-height: 30px
- **Location:** /Users/billyribeiro/Desktop/pro-room/pro-room/web/src/lib/components/AlertFeed.svelte:413-416 (.title { font-weight: 300; font-size: 20px; line-height: 30px; })
- **Fix / why:** The reference slice captures the NAV computed font (16px/300/24px). Our 'Alerts' text is rendered at 20px because we sized it to the navbar-brand spec (per the existing inline comment citing a.navbar-brand 20px/300/30px). Whether 20px or 16px is correct depends on whether the brand has its own larger rule in the reference; the slice only gives the nav-level 16px, so against THIS slice our title is 4px larger. font-weight (300) and family (Open Sans) match.

---

# Part 2 — Broad coverage (admin-room: structure / inventory / controls)

## DESIGN TOKENS / CSS VARIABLES  ·  _[admin-room]_

> The reference exposes 294 named CSS custom properties on :root (171 project-specific room/panel/modal/chat/alert/sidebar/file/note/ticker tokens + 123 Bootstrap --bs-* tokens). Our SvelteKit app uses a completely different, condensed abstraction of ~21 semantic tokens (--bg, --bg-elev, --accent, --modal-bg, etc.) in web/src/routes/layout.css; NONE of the reference token NAMES exist in our :root, so any third-party CSS or markup that consumed reference names would break. The core navy room colors that overlap conceptually DO match in value (#0c2434 / #0f2e43 / #103d5c / #45a2ff / #0a6db1 / #92d528 / #bb352a), but our MODAL token block diverges hard: we ship Bootswatch "Darkly" gray modals (#303030 / #00bc8c / #e74c3c) whereas the reference modal is NAVY (#103d5c bg, #f4f4f4 text, #92d528 success, #bb352a danger, #45a2ff active tab). Fonts: we correctly self-host Open Sans (reference --app-font-family) and pin Font Awesome to the exact 5.8.1, but we do NOT load Lato (reference --font-family-sans-serif primary, fonts.loaded Lato 400/700/italic) nor the summernote editor font.

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

## TOP NAV + ADMIN BROADCAST CONTROLS  ·  _[admin-room]_

> The static nav chrome (bg, height, bars, users, mobile, talking indicator, [REC], volume, reload) matches the reference closely — tokens (#0c2434 bg, #103d5c bars bg, #abb0b5 muted icons, #45a2ff accent) and most geometry are right. The ONE structural divergence that dominates this surface: our nav renders a full inline admin broadcast cluster (screen-share, camera, mic, CC, music, record, go-live, members) via the `actions`/`stageActions` snippet, but the reference ADMIN capture's nav bar contains NONE of these controls — its right cluster is identical to the member nav (talkingIndicator -> recIndicator -> volume -> reload). The reference admin broadcast controls do not live in the top nav at all. Secondary divergences are small: nav z-index (40 vs 1030), volume/reload icon size (32 vs 36px box / matching 32px font), users margins (5px vs 4px), mobile rendered as a button vs a bare span, brand text vs logo image, and the recording prop never wired so [REC] can never appear.

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

## SIDEBAR / USER ROSTER  ·  _[admin-room]_

> Our RoomSidebar.svelte is a close structural match to the reference room-sidebar nav menu (Powered-by block, Chat/Media caps, nav items, Users header toolbar, app-room-roster list). The header toolbar (Search/Sort/Reload/Cog buttons) and Powered/caps blocks match well. The main divergences: (1) ours ADDS an "Audio/Video Settings" nav item and an entire "Admin" sub-group (All PMs / YouTube / Session Control / Debug Log) that DO NOT exist in the reference sidebar; (2) roster avatars are square in our code but the reference token --rosterImg-border-radius is 50% (circular); (3) the reference roster-bg/roster-bg-adm/username-color tokens are not applied in our roster rows; (4) ProTradingRoom link href and version string differ. The reference roster had zero users at capture time, so per-user row DOM (avatar img, name, role, per-user dropdown) is unverified in the evidence — our roster row is a reasonable but unconfirmed reconstruction. MembersPanel.svelte is a separate admin drawer with no counterpart in the reference sidebar slice; PresenceBar.svelte (chip strip) likewise has no reference-sidebar counterpart.

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

## PRESENTATION / STAGE  ·  _[admin-room]_

> Our MainStage tab strip and ScreenStage sub-tab strip are a close, evidence-grounded match to the reference: tab order (Screens/Notes/Files), active blue #45a2ff pill, idle #ccc text, the notes-active dark #0c2434 quirk, the 20x20 presenter-img, the cog dropdown caret, and the three search/camera/expand zoom buttons are all present and styled correctly. The most significant divergences are in the zoom-control button fills — our ScreenStage hardcodes the OLD Bootstrap-4 .btn-dark light-gray (#adb5bd / #222 text), but the reference computed value is the Bootstrap-5 dark fill rgb(33,37,41)=#212529 with white text and a 4px radius. Several smaller structure/spacing items (container display:block vs inline-flex, ml-1 vs mx-1, transparent #mainTabs background, missing per-screen Detach/Lock dropdown menu, our extra locked-pill) round out the list.

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

## WEBCAMS  ·  _[admin-room]_

> Tile geometry (320x240, 5px margin, black bg, 6px radius, 1px yellowgreen border, contain video) matches the reference closely. The structural model diverges materially: the reference name label (h5.pNameLabel) is EMPTY and serves only as the container for the close-X — there is NO presenter-name text and the X shows on every tile, whereas our build renders a centered translucent name bar with the presenter name and gates the close button to the local tile only. Card overflow also differs (reference visible vs our hidden), and our close control is a sibling &lt;button&gt; rather than a &lt;span&gt; nested inside the h5.

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

## ALERTS PANEL  ·  _[admin-room]_

> Our AlertFeed is a close, evidence-driven match on the big-ticket tokens: header bg #0a6db1, 48px min-height, p-1 (4px) padding; navbar-brand bell 20px/300/lh30; username navy #0a6db1 14px/900; created-at #a8a8a8 12px/600 upright; body #676767 13px/100 lh19.5 pre-wrap; alert-qa BS btn-sm.btn-secondary gray #6c757d 10px/400; FA5 icons via matching markup. The remaining gaps are structural/layout: the reference indents the body under the avatar gutter (x=66) and lays the row out as a fixed kebab column + avatar column + w-100 (username left / qa+date right), whereas ours uses a single flex row with a near-flush body; the reference avatar is a real 35x35 square img inside an avatar pl-1 wrapper (ours falls back to an initials chip with a colored bg); and several spacing values (msgMenu 20px/600 navy with pt-1/pl-1, qa-count answered turns green #008040) differ in detail.

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

## CHAT PANEL  ·  _[admin-room]_

> Our ChatPanel reproduces the overall layout (blue header, white scroll area, square avatars, left-kebab rows, pill composer with emoji/image/GIF), but diverges on several CONFIRMED computed values: username color (#0a6db1 blue vs our #000), message-body color (#676767 vs our #1a1a1a), timestamp color (#a8a8a8 vs our #8394a9), and row top-border (#e1e1e1 vs our #d9d9d9). The biggest structural divergence is the header: the reference chat/alerts header is a single brand-label + search + gear bar with NO "Main Chat / Off Topic" tabs and NO accent underline, whereas our component invents a two-tab tablist with a 1px #45a2ff bottom border. The reference also renders uploaded images as a separate 300px in-body element (avatar stays an avatar), while we replace the avatar with the image. Several values our code comments cite as authoritative (#000 username, #1a1a1a body) are contradicted by the live computed styles and the resolved --lightTheme tokens.

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

## MODALS INVENTORY  ·  _[admin-room]_

> Our 22 modals + 3 modal-like components (AlertQaModal, PollModal, DialogHost) cover essentially every distinct reference modal title and admin menu — the functional coverage is strong. The dominant defect is systemic: the Bootstrap modal shell tokens are wrong. The reference modals are a NAVY-BLUE surface (--modal-content-bg-color #103d5c, color #f4f4f4, border #103d5c, close #0a6db1, success #92d528, danger #bb352a, active-tab #45a2ff, input-group #0a6db1), but our layout.css hardcodes the Darkly GRAY palette (#303030 bg, #fff text, #444 border, #375a7f close, #00bc8c success, #e74c3c danger) — citing report.md §07/§10, which the project memory already flagged as a mis-transcription. Secondary: the "Archives" menu is a real top-nav Bootstrap dropdown in the reference but we render it as always-open sidebar sub-items; and the close control differs (btn-close-white X vs our times icon).

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

## BUTTONS / CONTROLS / INPUTS  ·  _[admin-room]_

> The reference renders all controls with stock Bootstrap 5 (LIGHT theme: --bs-primary #0d6efd, --bs-secondary #6c757d, --bs-dark #212529, --bs-success #198754, white form-control bg) plus a custom legacy btn-default (#f4f4f4 bg / #45a2ff text) and Open Sans 14px / weight 400 / radius 4px (.25rem). Our repo has NO Bootstrap dependency and no shared button component: every button is hand-rolled per component with semantic classes, a navy room palette, var(--radius)=6px, font-weight 600, and font-size ~0.8-0.85rem. Several in-room controls match the captured BS values closely (alert-qa badge, app-info-btn, sidebar sort), but the modal/dialog button system, the Mute primary color, the sidebar search button, the chat composer/send pill, the kebab color, and all btn-outline-* user-menu variants diverge. NOTE: modals render as dark "Darkly" in our repo while the reference tokens are stock BS5 light — that token surface is owned by another agent; here it is flagged only where it changes a button/input's computed appearance.

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

## 50 TARGETED KEY ELEMENTS  ·  _[admin-room]_

> Our SvelteKit room shell matches the reference on the overwhelming majority of the 50 targeted elements — the design tokens (--bg #0c2434, --bg-elev #0f2e43, --bg-elev-2 #103d5c, --accent #45a2ff) map 1:1 onto the reference's computed navy/blue palette, and the high-signal elements (top nav, sidebar-menu button, users counter, active tabs, screens tabs, presentation-box, webcam card, pNameLabel, room-sound-options) are reproduced faithfully with reference-grounded comments. The notable divergences are: the files-badge color/border (we use coral+black-border, reference computes Bootstrap #dc3545 with NO border), the sidebar's extra right border (reference border-right-width:0), and the brand slot being text instead of the reference's <img class="brand-logo"> (already self-flagged in code). Note: the matchedRules in targeted.json carried selectors only (no declaration bodies — all "None"), so every divergence below is grounded in the reliable 85-property computed `style` block instead.

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
