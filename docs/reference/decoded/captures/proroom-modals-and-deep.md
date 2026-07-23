# Decoded: Modals + Deep Probes (forensic, 100% evidence)

Forensic decode of four evidence captures. Every value below cites a locator (JSON path / element index / CSS-var key). Colours are given exactly as captured (both the computed `rgb(...)` and the resolved hex). Where the capture did not record a region, it is called out as an **HONEST GAP** rather than inferred.

**Source files decoded**

| # | File | Bytes | What it is |
|---|------|-------|-----------|
| 1 | `evidence-folder/proroom-modals.json` | 317,061 | Hamburger-menu modal capture (User-Info modal shell, Offline state) |
| 2 | `evidence-folder/proroom-presenter-deep.json` | 160,813 | Deep presenter probe — 12 targets w/ computed + hover/active winners |
| 3 | `docs/reference/captures/proroom-deep-member-833px.json` | 160,978 | Same probe at 833px viewport (responsive deltas) |
| 4 | `proroom-gaps-presenter.json` | 745,580 | Gap-targeted presenter probe — 8 states, pane node trees |

**Processing counts (verified: processed == declared for every file)**

| File | Unit | Declared | Processed | Notes |
|------|------|----------|-----------|-------|
| 1 modals | modal keys | 8 | 8 | **all 8 are byte-identical → only 1 unique modal shell** (128 element records = 8 × 16, one deduped set) |
| 1 modals | root CSS vars | 294 | 294 | |
| 1 modals | sidebarItems | 8 | 8 | |
| 2 presenter-deep | targets | 12 | 12 | 19 item records total |
| 2 presenter-deep | CSS vars | 294 | 294 | `rulesCollected: 7419` |
| 3 833px | targets | 12 | 12 | 19 item records total |
| 3 833px | CSS vars | 294 | 294 | `innerWidth: 833`, default active tab = **notes-tab** |
| 4 gaps | states | 8 | 8 | 5 populated, 3 empty (gear-menu:1/2/3) |
| 4 gaps | nodes | — | 102 | across the 5 populated states |
| 4 gaps | stylesheets | 41 | 41 | |
| 4 gaps | CSS vars (root & body) | 294 / 294 | 294 / 294 | root == body (identical) |

**Cross-file token consistency:** all 21 modal/theme tokens spot-checked resolve identically across files 1, 2 and 4 (e.g. `--modal-content-bg-color = #103d5c` in all three). The palette is stable; there is one authoritative token set.

---

# ★ MODAL PALETTE (file 1 — TOP PRIORITY)

## Identity of the captured modal

- **meta.label**: `hamburger-modals`
- **meta.url**: `https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1`
- **meta.title**: `Mastering The Trade`
- **meta.viewport**: `{ w: 1933, h: 1265, dpr: 2 }`
- **meta.capturedAt**: `2026-06-16T20:55:00.125Z`

**CRITICAL FINDING — the 8 named modals are NOT 8 modals.** `modals` is a dict with 8 keys (`Connectivity Check`, `General Settings`, `Archives`, `Alert Logs`, `Chat Logs`, `Transcript History`, `Manage Muted Users`, `Manage Followed Users` — these are just the 8 `sidebarItems`), but **all 8 values are byte-identical** (`html` md5 = `54185cd7…`, `elements` md5 = `bcdb6889…` for every key). The capture opened the hamburger menu and, for every item, re-serialized the **one modal that happened to be in the DOM** — a **User-Info / member card modal frozen in its "Offline" state**. So this file gives us exactly ONE modal's real palette, not eight.

**What the single modal actually is** (from `modals["Connectivity Check"].html`, path = the shared shell):
- `div.modal-content` → `div.modal-header` [ `div.edit-user-avatar > img` (gravatar `secure.gravatar.com/avatar/undefined?d=mm&s=80`), `h3.modal-title` containing `span.badge.badge-danger` = **"Offline"**, `button.btn-close.btn-close-white` ]
- `div.modal-body.py-0` (empty — `<!----><!---->`)
- `div.modal-footer.text-center` [ `button.btn.btn-outline-light` "@Mention", `button.btn.btn-outline-light` "Private Chat", `button.btn.btn-outline-info` "Follow", `button.btn.btn-outline-warning` "Mute", `button.btn.btn-primary` "Close" ]

This is the **member/user modal** shown when you click a roster user; the red **Offline** badge is the status. The user's report that "the Connecting/Offline modal has its own colors distinct from the navy modal tokens" is **confirmed and located** below (the footer btn-primary and the badge, in particular).

> **HONEST GAP:** every element's `rect` is `{x:0,y:0,w:0,h:0}` — the modal node was in the DOM but not laid out/visible at capture, so pixel **positions and box sizes are not captured**. All **colours, borders, radii, typography, padding/margin** ARE captured (computed style is resolved regardless of layout). Positions must come from a live re-capture or from the box model (padding/margin below).

### Modal SHELL palette (`modals[*].elements[0..8]`)

| Part | Element idx / class | Property | Computed value | Hex | Token that resolves it |
|------|--------------------|----------|----------------|-----|------------------------|
| **modal-content** | `[0] div.modal-content` | background-color | `rgb(16, 61, 92)` | **#103d5c** | `--modal-content-bg-color` / `--sidebar-menu-bg` / `--sidebar-wrapper-bg-color` |
| | | color (default text) | `rgb(244, 244, 244)` | **#f4f4f4** | `--modal-content-color` |
| | | border (all sides) | `1px solid rgba(0,0,0,0.176)` | — | `--bs-border-color-translucent` (`rgba(0,0,0,.175)`) |
| | | border-radius (all corners) | `8px` | — | `--bs-border-radius-lg` (`.5rem`) |
| | | box-shadow | `none` | — | |
| | | font-family | `"Open Sans", sans-serif` | — | `--app-font-family` |
| | | font-size / weight / line-height | `16px` / `300` / `24px` | — | |
| | | display / flex-direction | `flex` / `column` | — | |
| **modal-header** | `[1] div.modal-header` | background | `rgba(0,0,0,0)` transparent | — | (inherits content #103d5c) |
| | | padding | `16px` all sides | — | |
| | | border-bottom | width `1px`, **style `none`** (so no visible line), color `rgb(69,162,255)` **#45a2ff** | — | `--modal-tabs-border-color` / `--tab-active-bg`. NB: border-**style:none** means the 1px bottom border does **not** render despite the blue color being set. |
| | | border-top-left/right-radius | `7px` | — | (content 8px − 1px border) |
| | | display / justify / align | `flex` / `space-between` / `center` | — | |
| **avatar wrap** | `[2] div.edit-user-avatar` | (layout only) display `block`, position `relative` | — | — | |
| **avatar img** | `[3] img` | min-width `50px`, **max-width `80px`**, margin-right `10px`, overflow `clip` | — | — | gravatar 80px |
| **modal-title** | `[4] h3.modal-title` | color | `rgb(244,244,244)` | **#f4f4f4** | inherits `--modal-content-color` |
| | | font-size / weight / line-height | **`28px` / `500` / `42px`** | — | (h3 heading scale) |
| **status badge** | `[5] span.badge.badge-danger` "Offline" | background-color | `rgb(231, 76, 60)` | **#E74C3C** | `--danger` (Darkly danger, **NOT** `--bs-danger #dc3545`) |
| | | color | `rgb(255,255,255)` | **#fff** | |
| | | font-size / weight / line-height | `21px` / `700` / `21px` | — | |
| | | padding | `7.35px 13.65px` | — | |
| | | border-radius | `6px` | — | `--bs-border-radius` (`.375rem`) |
| **close btn** | `[6] button.btn-close.btn-close-white` | color / opacity | `rgb(0,0,0)` / **`0.5`** | — | BS default btn-close |
| | | background-image | inline SVG "×" (`fill='%23000'`) — the `btn-close-white` class is present but the computed fill is **black at 0.5 opacity** (white-invert not applied in this build) | — | |
| | | size / padding / margin | `16×16` content-box, padding `8px`, margin `-8px … auto` (pushes right) | — | |
| **modal-body** | `[7] div.modal-body.py-0` | background transparent, color `#f4f4f4`, padding `0 16px` (py-0 → top/bottom 0) | — | — | |
| **modal-footer** | `[8] div.modal-footer.text-center` | **border-top** | `1px solid rgb(69,162,255)` **#45a2ff** — this one DOES render (style `solid`) | — | `--modal-tabs-border-color` |
| | | padding | `12px` all sides | — | |
| | | border-bottom-left/right-radius | `7px` | — | |
| | | display / flex-wrap / justify / align | `flex` / `wrap` / `flex-end` / `center` | — | |

### Modal FOOTER BUTTONS — exact computed palette (`elements[9..15]`)

All footer buttons: `width:23%`, `margin:4px`, `padding:6px 12px`, `border:1px solid`, `border-radius:6px`, `font:400 16px/24px "Open Sans"`, `text-align:center`, `cursor:pointer`.

| Button | idx / class | text | bg | border-color | text color (hex) |
|--------|------------|------|-----|--------------|------------------|
| @Mention | `[9] btn btn-outline-light` | @Mention | transparent | `rgb(248,249,250)` **#f8f9fa** | `rgb(248,249,250)` **#f8f9fa** |
| Private Chat | `[10] btn btn-outline-light` | Private Chat | transparent | `rgb(248,249,250)` **#f8f9fa** | `rgb(248,249,250)` **#f8f9fa** |
| Follow | `[11] btn btn-outline-info` (+`[12] span` "Follow") | Follow | transparent | `rgb(13,202,240)` **#0dcaf0** | `rgb(13,202,240)` **#0dcaf0** (`--bs-info`) |
| Mute | `[13] btn btn-outline-warning` (+`[14] span` "Mute") | Mute | transparent | `rgb(255,193,7)` **#ffc107** | `rgb(255,193,7)` **#ffc107** (`--bs-warning`) |
| **Close** | `[15] btn btn-primary` | Close | **`rgb(10,109,177)` #0a6db1** | **#0a6db1** | `rgb(255,255,255)` **#fff** |

**★ THE "OWN COLORS" FINDING (user's key concern).** In this modal, the filled primary button is **NOT** the theme `--primary #375a7f` nor Bootstrap `--bs-primary #0d6efd`. Its computed background is **`rgb(10,109,177)` = #0a6db1**, which is `--modal-btn-close-bg` / `--msgs-header-bg` / `--modal-alert-link-color` / `--modal-input-group-bg` / `--split-gutter-bg` / `--tabs-border-color` / `--textarea-holder-border-color`. **So modal filled/primary actions use the blue #0a6db1, distinct from the app-wide navy tokens.** And the "Offline" status badge is **#E74C3C** (`--danger`, Darkly) — again its own colour, not `--bs-danger #dc3545`. These two are the deltas the user was pointing at.

### Modal design tokens (authoritative, from `cssVariables.root` — identical across files 1/2/4)

| Token | Value | Used for |
|-------|-------|----------|
| `--modal-content-bg-color` | `#103d5c` | modal-content bg (navy) |
| `--modal-content-border-color` | `#103d5c` | (border in tokens; actual computed border = translucent black, see shell table) |
| `--modal-content-color` | `#f4f4f4` | modal default text |
| `--modal-btn-close-bg` | `#0a6db1` | **primary/close filled button bg** ← the modal "own colour" |
| `--modal-btn-close-border` | `#0a6db1` | |
| `--modal-btn-danger-bg` / `-border` | `#bb352a` | modal danger/delete button (distinct from #E74C3C badge) |
| `--modal-btn-success-bg` / `-border` | `#92d528` | modal success/download button |
| `--modal-btn-hover-opacity` | `0.9` | button hover |
| `--modal-active-tab-bg-color` | `#45a2ff` | active tab in modals |
| `--modal-active-tab-border-color` | `#45a2ff` | |
| `--modal-active-tab-color` | `#fff` | |
| `--modal-tabs-border-color` | `#45a2ff` | header/footer divider color (footer renders, header does not) |
| `--modal-input-group-bg` | `#0a6db1` | modal input-group addon |
| `--modal-alert-link-color` | `#0a6db1` | links inside modals |
| `--modal-upload-files-color` | `#0a6db1` | |
| `--checkbox-bg-color` | `#45a2ff` | modal checkboxes |
| `--dropdown-divider-bg` | `#45a2ff` | |
| `--archives-dropdown-menu-bg-color` | `#0e3651` | Archives submenu bg |
| `--session-control-dropdown-bg` | `#0e3651` | Session-control dropdown bg |
| `--users-badge-bg-color` | `#0e3651` | roster/user badge bg |

**Darkly semantic tokens (used raw by badges/outline btns, NOT the `--bs-*` set):**
`--primary #375a7f`, `--success #00bc8c`, `--info #3498DB`, `--danger #E74C3C`, `--warning #F39C12`, `--pink`(see full dump).
**Bootstrap tokens (used by `btn-outline-info/-warning` and utility badges):**
`--bs-info #0dcaf0`, `--bs-warning #ffc107`, `--bs-danger #dc3545`, `--bs-primary #0d6efd`, `--bs-success #198754`, `--bs-secondary-bg #e9ecef`.
Note the app deliberately mixes both scales, which is why the Offline badge (`badge-danger` → `--danger #E74C3C`) and the outline-info Follow button (`--bs-info #0dcaf0`) come from different palettes in the same footer.

### sidebarItems (file 1, the hamburger menu list)
`["Connectivity Check","General Settings","Archives","Alert Logs","Chat Logs","Transcript History","Manage Muted Users","Manage Followed Users"]`
(These are the 8 menu entries; the capture keyed the single modal under each of them.)

> **HONEST GAP — the other modals.** This file does NOT contain distinct captures of Settings, WebRTC/Connectivity, Session-Control, Badges, Poll, Q&A, or Logs modals. It contains one User-Info modal 8×. To build those modals pixel-perfect, use the token table above (they all share `.modal-content #103d5c / #f4f4f4`, footer btn #0a6db1, active-tab #45a2ff, tab divider #45a2ff, danger btn #bb352a, success btn #92d528) — but their **body layouts are not in this evidence** and remain an honest gap pending a per-modal capture.

---

# FILE 2 — presenter-deep (`evidence-folder/proroom-presenter-deep.json`)

## Identity / metadata
- role `presenter`, url same room, title `Mastering The Trade`
- **innerWidth 1989 × innerHeight 1166, dpr 2**
- htmlClass `""`, bodyClass `""`, openedSidebar `false`
- **rulesCollected 7419**, errors `[]`
- capturedAt `2026-06-15T14:27:47.556Z`
- App version string (from navbar text): **`Powered by: ProTradingRoom.com  Version: v4.0.1-c0fee8f5`**

12 targets, each with `selector`, `note`, `found`, `items[]` (tag/class/text/rect/computed/hover/active/matchingRules). `hover`/`active` record the **winning declared value** per property with its source selector + `fromState`.

### Target computed palette (resting state, 1989px)

| Target | selector · found | tag.class · text | key computed values | rect (x,y,w,h) |
|--------|------------------|------------------|---------------------|----------------|
| **navbar** | `nav.navbar,.navbar` · 1 | `nav.navbar w-100 h-100` · "Powered by… v4.0.1-c0fee8f5" | bg transparent; color `rgb(103,103,103)` **#676767**; font `300 16px/24px "Open Sans"`; display flex row, justify space-between, align center | -250,49,**250**,1117 |
| **userPill** | `span.users,.users` · 1 | `span.users ml-1 mr-1 d-flex align-items-center` | bg transparent; color `rgb(255,255,255)`; **border 1px solid #fff, radius 0**; font `300 14px/21px`; padding `1px 5px`; margin `0 4px`; cursor pointer. hover/active winner: color `var(--users-color)` (#fff) | 42,16,24.25,18 |
| **userPillIcon** | `.users i.fa-user` · 1 | `i.fas.fa-user` | color `#fff`; **font-family `"Font Awesome 5 Free"` weight 900**; 14px | 48,18,12.25,14 |
| **sidebarDrawer** | `.sidebar,app-sidebar .sidebar,.room-sidebar` · 1 | `div.room-sidebar` | bg transparent; color `rgb(204,204,204)` **#cccccc**; **width 0px** (drawer collapsed at capture) | 0,49,**0**,1117 |
| **sidebarItem** | `.sidebar-item` · 4 | `a.nav-link.sidebar-item` · "Connectivity Check" / "General Settings" / "Archives"(+`dropdown-toggle`) / "Manage Muted Users"(+`ps-1`) | bg transparent; color `rgb(103,103,103)` **#676767**; **font-weight 700, 14px/21px**; height 37; padding `8px 0`; margin `0 5px`; cursor pointer | -243,197/245/293/336,236,37 |
| **chatHolder** | `#textAreaHolder` (matched `.textSendDiv`) · 1 | `div.d-flex.align-items-center.textSendDiv` · "GIF" | **bg `rgb(255,255,255)` #fff**; color #cccccc; **border-radius 8px**, border 0; padding 5px; margin 5px; height 45. hover/active winner bg `var(--textarea-bg)` (#111) | 5,1116,**410**,45 |
| **chatTextarea** | `.txt-area,#textAreaHolder textarea` · 1 | `textarea.txt-area.form-control.border-0` | **bg #fff**; color `rgb(103,103,103)` #676767; **font 400 14px/21px**; **min-height 35px, max-height 300px**; padding `6px 5px`; white-space pre-wrap; border 0; cursor text. hover/active winner (important): bg `var(--textarea-bg)` #111, color `var(--textarea-color)` | 10,1121,**319**,35 |
| **mainTabs** | `#mainTabs .nav-link` · 4 | Screens(`active`) / Streams / Notes(`presAreaTabs-notes`) / Files | see tab detail below; **default active = Screens** (`active:["screens-tab"]`) | 1094/…/1183/1264, 54, 79/…/71/62, 31 |
| **notesTabActive** | `#notes-tab` (matched Notes link) · 1 | `a.nav-link.presAreaTabs-notes` · "Notes" | INACTIVE here at 1989px: bg transparent, color `rgb(204,204,204)`, radius top `6px`, height 30.5 | 1183,54,71,31 |
| **screensTabActive** | `#screens-tab` · 1 | `a.nav-link.active` · "Screens" | ACTIVE: **bg `rgb(69,162,255)` #45a2ff**, color #fff, **radius 3px all**, transparent border, 12px/12px, padding 8px | 1094,54,79,31 |
| **alertQa** | `.alert-qa` · 2 | `button.btn.btn-sm.btn-secondary.me-1.alert-qa` (×2) | **bg `rgb(108,117,125)` #6c757d** (`btn-secondary`); color #fff; border `1px solid #6c757d`; **font 400 10px/15px**; padding `1px 3px`; radius 4px; size 18×19. hover winner bg `--bs-btn-hover-bg`, border `rgb(43,42,42)`; active bg `rgb(43,42,42)`, border `rgb(36,36,36)` | 301,**-9679 / -9279**,18,19 (off-screen scroll) |
| **alertHeader** | `nav.alertHeader,.alertHeader` · 1 | `nav.navbar…chat-nav.p-1.alertHeader` · "Alerts" | **bg `rgb(10,109,177)` #0a6db1** (`--msgs-header-bg`); color #fff (`--msgs-header-color`); height 48; padding 4px; justify flex-start | 0,49,**420**,48 |

### Main tabs — full detail (1989px)
- **Screens** `[0] a.nav-link.active` "Screens": bg **#45a2ff**, color #fff, radius **3px all** (pill), border transparent 1px, `12px/12px`, padding 8px, margin 5px. hover/active winner bg `var(--tab-active-bg)`.
- **Streams** `[1] a.nav-link` "Streams": **rect 0,0,0,0 → not rendered/hidden**; color #cccccc; radius top `6px`, bottom `0`.
- **Notes** `[2] a.nav-link.presAreaTabs-notes` "Notes": inactive, bg transparent, color #cccccc, radius top 6px.
- **Files** `[3] a.nav-link` "Files": inactive, bg transparent, color #cccccc, radius top 6px.
- Inactive tabs use `border-top-left/right-radius:6px` + `border-bottom:0` (classic tab shape); the ACTIVE tab overrides to `border-radius:3px` all + solid `#45a2ff` fill (pill shape). Winner selectors: active bg from `.mainTabset .nav-link.active` → `var(--tab-active-bg)`; hover on inactive gives `border-top-color rgb(68,68,68)` via `.nav-tabs .nav-link:hover`.

---

# FILE 3 — 833px narrow probe (`docs/reference/captures/proroom-deep-member-833px.json`)

## Identity / metadata
- role **`presenter`** (filename says "member" but `meta.role` = presenter — same probe, narrow viewport)
- **innerWidth 833 × innerHeight 1157, dpr 2**; htmlClass/bodyClass `""`; openedSidebar false
- **rulesCollected 7410**; capturedAt `2026-06-14T21:08:59.933Z`
- Same 12 targets, same 19 items, same 294 vars as file 2.

## Responsive deltas vs 1989px (this is the file's unique value)

| Element | Property | WIDE (1989) | NARROW (833) |
|---------|----------|-------------|--------------|
| navbar / sidebarDrawer | height | 1117px | 1108px |
| **chatHolder** (`.textSendDiv`) | width | 410px | **217px** |
| **chatTextarea** | width | 319px | **183px** |
| **mainTabs default active** | `active` list | **`["screens-tab"]`** | **`["notes-tab"]`** |
| **Screens tab** `[0]/screensTabActive` | bg | `#45a2ff` (active) | **transparent** (INACTIVE at 833) |
| | color | #fff | `rgb(204,204,204)` #cccccc |
| | radius | 3px all (pill) | **6px top / 0 bottom** (tab shape) |
| | rect.x | 1094 | **419** |
| **Notes tab** `[2]/notesTabActive` | bg | transparent | **`rgb(12,36,52)` #0c2434** (`--notes-tabs-bg`) |
| | color | #cccccc | **#fff** |
| | height | 30.5px | **36.5px** |
| | padding-bottom | 8px | **15px** |
| | margin-bottom | 5px | **-1px** |
| | border-bottom-width | 1px | **0px** |
| | border-top/right/left-color | transparent | **`rgb(10,109,177)` #0a6db1** |
| | border-top radius | 6px | **3px** |
| | rect.x | 1183 | 509 |
| **alertHeader** | width | 420px | **227px** |
| | justify-content | flex-start | **space-between** |
| **alertQa** (Q&A btn) | color | #fff | **`rgb(26,26,26)` #1a1a1a** |

**Responsive findings:**
1. At ≤833px the **default active pane switches Screens→Notes**, and the active-tab styling flips: the Notes tab renders as a **navy tab body (#0c2434) bordered #0a6db1 on top/left/right, taller (36.5px), no bottom border, radius 3px top** — a "connected tab" look — while Screens reverts to the plain inactive tab (transparent, #ccc, 6px-top radius). The wide layout instead gives the active tab a **solid #45a2ff pill (3px all-radius)**. Two visually distinct active-tab treatments across the breakpoint.
2. Composer (`chatHolder`) and its textarea roughly halve in width (410→217, 319→183) but the **textarea keeps min-height 35/max-height 300 and the holder keeps radius 8px + white bg** — no layout-mode change, just fluid width.
3. `alertHeader` switches to `justify-content:space-between` to spread its controls in the narrow bar.
4. `alertQa` text goes dark (#1a1a1a) at narrow width (likely a different theme context for the off-screen alert list).

> **HONEST GAP:** the sidebarDrawer width is `0px` in BOTH captures (drawer collapsed / `openedSidebar:false`), so the **open-drawer width and the collapsed-composer "+" affordance are NOT captured** in either file. The task brief's expected "collapsed composer +" and "narrow nav / mobile affordances" are not present as distinct measured elements here — only the fluid resize above is evidenced.

---

# FILE 4 — gaps-presenter (`proroom-gaps-presenter.json`)

## Identity / metadata
- role `presenter`; url same room; title `Mastering The Trade`
- **viewport 1401 × 905, dpr 2**; `tooNarrow: false`
- capturedAt `2026-07-23T01:02:36.774Z` (the most recent capture of the four)
- `cssVariables.root` (294) **== `cssVariables.body` (294)** — identical, same token set as files 1/2.
- `errors: []`

## Stylesheets (41 total, `stylesheets[i] = {href, rules, blocked}`)
None blocked. Load-bearing external sheets:
- `[0]` **FontAwesome v5.8.1** — `https://use.fontawesome.com/releases/v5.8.1/css/all.css` (1411 rules) → confirms **FA pinned 5.8.1**, glyphs render via `font-family "Font Awesome 5 Free"` weight 900 (matches every `i.fas.*` node).
- `[1]` animate.css 3.7.2 (`cdnjs`, **0 rules** — loaded but empty/animation-only).
- `[4]` **app bundle** `https://chat.protradingroom.com/styles.d622cb9ed2bbc221.css` (**3102 rules** — the main Angular styles).
- `[2],[3],[5]…[40]` = 38 inline `<style>` blocks (rule counts: 1,16,2,3,107,36,4,11,2,4,17,9,9,11,1,30,42,6,7,8,9,2,13,5,12,4,77,59,19,19,13,56,1,1,90,6,54,22). The big inline blocks (107, 90, 77, 59, 56, 54, 42) are component-scoped Angular styles.

## States (8; `states[name] = { groups[], capturedAt }`, group = `{selector, rootPath, rootClass, count, nodes[] }`)

**Populated (5):** `pane:Screens` (4 nodes), `pane:Notes` (46), `pane:Files` (46), `alert-row` (3), `chat-row` (3). **Empty (3):** `gear-menu:1`, `gear-menu:2`, `gear-menu:3` — `groups: []`.
Node style dump = 84 CSS properties each (full box + typography + flex/grid + transform/filter). 102 nodes total.

### pane:Screens (`div#screens.tab-pane.fade.active.show`, 4 nodes)
- `[0] div#screens`: color #cccccc, `300 16px/24px "Open Sans"`, bg transparent, rect 383,113,1018,856.
- `[1] h3.text-center.mt-4`: **28px/500**, color #cccccc, margin `24px 0 8px`, center — the pane's title heading.
- `[2] ul#screenTabs.nav.nav-tabs.screens-tabs`: **bg `rgb(12,36,52)` #0c2434** (`--notes-tabs-bg`), height 1px (empty tab strip), border-bottom 1px transparent, z-index 1.
- `[3] div#screensTabsContent.tab-content`: transparent, 1018×774.

### pane:Notes (`div#notes.tab-pane.active.show`, group count **377**, **46 nodes captured**)
The notes tab strip + first note. Load-bearing:
- `[1] ul#notesTabs.nav.nav-tabs.noteTabset`: **bg #0c2434**, height 80, **border-top `1px solid rgb(10,109,177)` #0a6db1**, justify center, align center — the note tab bar.
- `[3] a#…-tab.nav-link.active` (first note tab): **bg `rgb(69,162,255)` #45a2ff**, color #fff, `300 12px/12px`, padding 8px, margin `5px 0`, **radius 3px**, z-index 1 → active note tab = #45a2ff pill (matches modal active-tab token).
- `[6] span.badge.badge-success.mx-1.p-0`: **bg `rgb(0,188,140)` #00bc8c** (`--success`, Darkly), color #fff, `700 9px/9px`, radius 6px — the little "home" badge on the pinned note tab (`[7] i.fas.fa-home` inside it, color #fff, FA weight 900).
- `[10],[15],[20],[25],[30] a.nav-link` (inactive note tabs): bg transparent, color #cccccc, `12px/12px`, **radius top 6px**, margin `5px 0`.
- `[8]/[13]/[18]/[23]/[28]/[33] a.editName.mx-1`: inline edit-name links, color inherits (#fff on active tab, #ccc on inactive).
- `[36] div.note-container`: **bg #fff**, color `rgb(103,103,103)` #676767, padding 15px, **overflow-y auto** — the white note body panel.
- `[38] div#summernoteEdit-….note-view`: white summernote editor surface (988×775).
- `[40] a` (link inside note) / `[41] img`: link color `rgb(69,162,255)` #45a2ff; embedded note image 988×434.
- `[42] div.noteOptions.d-flex.justify-content-between`: **bg `rgb(244,244,244)` #f4f4f4** (`--note-options-bg`), **position sticky**, padding 10px, height 51 — the sticky note toolbar.
- `[44] button.btn.btn-sm.noteDownload.mr-3`: **bg `rgb(146,213,40)` #92d528** (`--note-download-bg` / `--modal-btn-success-bg`), color #fff, `400 14px/21px`, padding `4px 8px`, radius 4px; `[45] i.fas.fa-download` #fff FA-900. → **note Download button = green #92d528**.

> **HONEST GAP:** `pane:Notes` declares `count:377` but only **46 nodes were captured** (the visible tab bar + first note + toolbar). The remaining ~331 nodes (other notes' full content) are NOT in the dump — only the first note is fully decoded.

### pane:Files (group count 377, 46 nodes) — **DUPLICATE of Notes**
The `pane:Files` group's `rootPath` is `div#notes` with `rootClass "tab-pane active show"` and the node tree is the **same notesTabs DOM as pane:Notes** (identical first 46 nodes: same `#notesTabs`, same `652765a0…-tab` active #45a2ff, same badge #00bc8c, same editName links).
> **HONEST GAP:** the Files pane was **not actually switched to** at capture — the probe re-serialized the Notes DOM under the "Files" key. There is **no distinct Files-pane evidence** (file list rows, `--file-list-even-bg #f4f4f4` / `--file-list-odd-bg #fff` / `--file-download-bg #92d528` / `--file-delete-bg #bb352a` tokens exist in the palette but their rendered rows are uncaptured).

### alert-row & chat-row (3 nodes each) — **both fell back to the search icon**
Both states' primary selectors matched nothing, so the fallback (`[class*="alert" i][class*="item" i]` / `[class*="message"…]`) resolved to the **alert header's search button**, and BOTH captured the identical 3-node chain:
`li.nav-item.mx-1` → `a.nav-link.p-0` → `i.fas.fa-search` (color #fff, FA-900, 16×16, rect 311,61). Not a real alert/chat message row.
> **HONEST GAP:** there is **no genuine alert-message-row or chat-message-row evidence** in this file — both are false-positive matches on the header search glyph. Alert/chat row styling remains uncaptured here.

### gear-menu:1 / :2 / :3 — **empty**
All three have `groups: []`. The gear/context menus never opened (or matched nothing).
> **HONEST GAP:** the presenter **gear-menu / context-menu** surfaces are entirely uncaptured (0 nodes across 3 attempts).

---

# CROSS-FILE UNIQUE EVIDENCE (what each file alone gives)

- **File 1 only** — the **one real modal palette**: `.modal-content #103d5c / text #f4f4f4 / border rgba(0,0,0,.176) / radius 8px`; footer btn-primary **#0a6db1** (the "own colour"); Offline badge **#E74C3C**; footer top divider **#45a2ff (solid)** vs header divider #45a2ff (style:none→invisible); outline buttons in the BS scale (#f8f9fa / #0dcaf0 / #ffc107). h3 title 28px/500. btn-close is black@0.5 despite `btn-close-white`.
- **File 2 only** — resting computed for navbar/userPill/sidebarItem/composer/tabs/alertHeader at 1989px WITH hover/active winners and their source selectors; **app version `v4.0.1-c0fee8f5`**; alertHeader **#0a6db1**; Q&A badge **btn-secondary #6c757d**; sidebar items **#676767 700-weight 14px**; composer holder **white, radius 8px**; textarea **min-h 35 / max-h 300, #676767 text**.
- **File 3 only** — the **breakpoint behaviour**: active pane flips Screens→Notes at ≤833px; active-tab treatment flips **#45a2ff pill (wide) ↔ #0c2434 tab bordered #0a6db1 (narrow)**; composer/textarea halve width; alertHeader → space-between; alertQa text → #1a1a1a.
- **File 4 only** — the **pane interiors at 1401px**: note tab bar **#0c2434 / border-top #0a6db1**, active note tab **#45a2ff pill**, note badge **#00bc8c** with fa-home, **white note body #fff / text #676767**, sticky note toolbar **#f4f4f4**, note **Download btn #92d528**; note links #45a2ff; the **41-stylesheet inventory** confirming **FA 5.8.1** + app bundle `styles.d622cb9ed2bbc221.css` (3102 rules) + animate.css 3.7.2 (0 rules).

---

# HONEST GAPS (consolidated)

1. **File 1: 7 of the 8 "modals" don't exist as captures.** Only the User-Info/Offline modal is present (8 identical copies). Settings, Connectivity, Session-Control, Badges, Poll, Q&A, Logs modal **bodies are uncaptured**; only their shared shell/token palette is known.
2. **File 1: all modal `rect`s are 0×0** — no pixel positions/box sizes for the modal (colours/typography/padding/margins ARE captured).
3. **File 1: btn-close** renders black at 0.5 opacity (the `btn-close-white` invert isn't applied in the captured computed style) — verify against a live screenshot before styling the "×" white.
4. **Files 2 & 3: sidebar drawer width = 0** in both (collapsed). Open-drawer dimensions and any collapsed-composer "+" affordance are **not captured**.
5. **File 3: it's a `presenter` role at 833px**, not a distinct "member" capture — the filename is misleading; role parity for a true member is not evidenced here.
6. **File 4: `pane:Files` duplicates `pane:Notes`** (never switched) — no real Files-pane rows.
7. **File 4: `alert-row` and `chat-row` are false positives** (both matched the header search icon) — no real message-row styling.
8. **File 4: gear-menu:1/2/3 are empty** — context menus uncaptured.
9. **File 4: `pane:Notes` captured 46 of 377 nodes** — only the tab bar + first note + toolbar; remaining note contents uncaptured.

# TOP 5 FINDINGS

1. **(MODAL) The captured modal is the User-Info/Offline member modal, and it has its own palette:** shell **#103d5c / #f4f4f4 / radius 8px**; filled Close button **#0a6db1** (`--modal-btn-close-bg`, NOT `--primary #375a7f` and NOT `--bs-primary #0d6efd`); Offline badge **#E74C3C** (`--danger`, NOT `--bs-danger #dc3545`). These are the distinct colours the user flagged. (`modals[*].elements[0,5,15]` + `cssVariables.root`.)
2. **(MODAL) The 8 modal keys are one deduplicated capture** — do not treat them as 8 modals; 7 modal bodies are an honest gap. The full token table (footer #0a6db1, active-tab #45a2ff, danger btn #bb352a, success btn #92d528, tab divider #45a2ff) is the authority for rebuilding the others.
3. **(RESPONSIVE) The active-pane and active-tab styling flip at ≤833px:** default active pane Screens→Notes; active tab **#45a2ff pill (wide) ↔ #0c2434 navy tab bordered #0a6db1, 36.5px tall (narrow)**. (File 3 diff vs File 2.)
4. **(THEME) Token set is 294 vars and 100% consistent across all three token-bearing files**, and the app mixes two colour scales deliberately (Darkly `--primary/--success/--danger/--info/--warning` for badges/outline semantics vs Bootstrap `--bs-*` for `btn-outline-*`). Money-color note n/a. FontAwesome is **pinned 5.8.1** (`stylesheets[0]`), glyphs via `"Font Awesome 5 Free"` weight 900.
5. **(PANE INTERIORS) Notes/Files/Screens pane chrome decoded from File 4:** note tab bar **#0c2434 + border-top #0a6db1**, active note tab **#45a2ff**, home badge **#00bc8c**, white note body **#fff / #676767**, sticky toolbar **#f4f4f4**, Download btn **#92d528**, note links **#45a2ff** — but Files rows, alert/chat message rows, and gear menus are honest gaps.
