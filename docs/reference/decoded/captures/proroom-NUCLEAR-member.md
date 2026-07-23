# Decoded Capture — `proroom-NUCLEAR-member.json` (MEMBER role)

> Forensic decode of `/Users/billyribeiro/Desktop/pro-room/proroom-NUCLEAR-member.json`
> (31,322,421 bytes). Every value below cites a JSON locator: `states[N].nodes[i]` for the
> node index in a state's node array, `rootVars["--x"]`, `assets.*`, `inventory.*`, etc.
> Node indices (`[i]`) are the array position inside `states[0].nodes` (the `base` state) unless a
> different state is named. **This file is the authority for "what a MEMBER must NOT see."**
> All record counts verified: **declared nodeCount sum = actual nodes sum = 6460** (processed == total).

---

## 1. File identity & capture metadata

| Field | Value | JSON path |
|---|---|---|
| role | `member` | `role` |
| capturedAt | `2026-07-23T01:05:15.280Z` | `capturedAt` |
| url | `https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1` | `url` |
| title | `Mastering The Trade` | `title` |
| viewport | `{ "w": 1401, "h": 905 }` | `viewport` |
| dpr | `2` | `dpr` |
| userAgent | `Mozilla/5.0 (Linux; Android 15; Pixel 9) … Chrome/150.0.0.0 Mobile Safari/537.36` | `userAgent` |
| flags | `{ "AUTO_REVEAL": true, "MATCHED_RULES": true, "INCLUDE_FULL_CSS": true }` | `flags` |

**Room identity:** room id `652754202ad80b3e7c5131e2` (appears in image URLs, e.g.
`assets.images[4]` `…/652754202ad80b3e7c5131e2_FTNT_…png`). Room display title = "Mastering The Trade"
(`title`). App version **`v4.0.1-b422b517`** (`states[0].nodes[13].text`).

**⚠ Layout caveat — this capture is in a COLLAPSED / mobile-narrow layout.** UA is a Pixel 9 Android
mobile string (`userAgent`), and although viewport is `1401×905`, the room is forced narrow: `body`
computed `width` = **110px** (`states[0].nodes[0].style.width` = `"110px"`). The navbar is in its
`collapse navbar-collapse` (hamburger) state (`[83]` id `navbarsRoom`, rect `0×0` = collapsed), the
sidebar wrapper is off-screen left at `x=-250` (`[7]`), and the roster is off-screen at `x=-248`
(`[71]`). Interpret all `x<0` rects as "rendered in an off-canvas/collapsed panel", and treat the
110px column widths as the mobile-collapsed measurement, NOT the desktop layout. Colours, fonts,
component structure, and text are all still valid; **pixel widths/positions are the collapsed-mobile
variant.**

**Theme = LIGHT.** Sidebar wrapper bg is `rgb(255,255,255)` (`[7].style.background-color`), chat
panel bg `rgb(238,238,238)` = `#eee` (`[1905]`), message bg white/`#e8e8e8`. These are the
`lightTheme-*` token values (see §3), so this member capture was taken with the Light theme active.

---

## 2. Top-level structure

Root is an object with 15 keys:

| key | type | count / len | notes |
|---|---|---|---|
| `role` | str | `"member"` | |
| `capturedAt` | str | ISO ts | |
| `url` | str | | |
| `title` | str | `"Mastering The Trade"` | |
| `viewport` | obj | `{w,h}` | |
| `dpr` | int | `2` | |
| `userAgent` | str | | |
| `flags` | obj | 3 keys | |
| `rootVars` | obj | **294** | CSS custom properties on `:root` — see §3 |
| `fonts` | list | **16** | `document.fonts` entries — see below |
| `states` | list | **12** | captured DOM snapshots — see §5. Node arrays total **6460** |
| `assets` | obj | 4 keys | `images`(89), `backgroundImages`(8), `stylesheetHrefs`(3), `scripts`(5) |
| `inventory` | obj | 4 keys | `buttons`(232), `links`(400), `inputs`(76), `icons`(59) |
| `stylesheets` | list | **38** | 1 external FA + 1 external app CSS + 36 inline (`href:"(inline)"`) |
| `inaccessibleStylesheets` | list | **1** | `https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.2/animate.min.css` |

### Node record shape (every element in `states[N].nodes[i]`)
Keys: `path`, `tag`, `id`, `class`, `attrs`, `icon`, `rect`, `style`, `matched`, `text`, `before`.
- `path` — CSS-path string, ` > `-joined (e.g. `as-split#mainAreaSplit > as-split-area.chat-box… > app-chat > …`).
- `id`, `class` — **top-level string keys** (NOT inside `attrs`); empty string when absent.
- `attrs` — remaining attributes; carries Angular markers (`_ngcontent-ng-cXXXX`, `_nghost-…`, `ng-version`), plus `title`, `href`, `role`, `type`, `placeholder`, `data-bs-toggle/target`, `aria-*`, `ngbtooltip`, `tooltip`, `data-filename`, `value`, `alt`, `min`/`max`, etc. **`class` is NOT duplicated here** (it is the top-level key).
- `icon` — inherited/nearest FA icon class string (helper, may repeat down a subtree).
- `rect` — `{x, y, w, h}` viewport-relative floats. `w=0,h=0` ⇒ display:none / collapsed. Large negative `y` ⇒ scrolled above the viewport in a virtual scroller (chat).
- `style` — **91 computed-style properties** (full box model, flex/grid, color/bg, font, border, radius, shadow, transform, transition, cursor, visibility, pointer-events, backdrop-filter, filter). Full key list at end of this section.
- `matched` — list of matched CSS rule text strings (raw declarations) — present because `flags.MATCHED_RULES` & `INCLUDE_FULL_CSS`.
- `text` — trimmed rendered text (only on text-bearing leaves).
- `before` — `::before` pseudo `{content, font-family, …}`; used for FA glyphs (e.g. `{'content':'""','font-family':'"Font Awesome 5 Free"'}` = `fa-reply`).

**Full 91 `style` keys:** display, position, top, right, bottom, left, z-index, box-sizing, float, clear, width, height, min-width, min-height, max-width, max-height, margin-top/right/bottom/left, padding-top/right/bottom/left, flex-direction, flex-wrap, justify-content, align-items, align-content, align-self, gap, row-gap, column-gap, order, flex-grow, flex-shrink, flex-basis, grid-template-columns, grid-template-rows, grid-auto-flow, grid-column, grid-row, color, background-color, background-image, background-size, background-position, background-repeat, opacity, font-family, font-size, font-weight, font-style, line-height, letter-spacing, text-align, text-transform, text-decoration-line, text-decoration-color, white-space, text-overflow, vertical-align, overflow, overflow-x, overflow-y, border-top/right/bottom/left-width, border-top-style, border-top/right/bottom/left-color, border-top-left/top-right/bottom-right/bottom-left-radius, box-shadow, outline-width, outline-color, transform, transform-origin, transition, animation-name, cursor, visibility, pointer-events, backdrop-filter, filter, list-style-type.

### fonts (`fonts[0..15]`)
`Font Awesome 5 Brands` (unloaded); `Font Awesome 5 Free` weight **400** (loaded) & **900** (loaded);
`Lato` 400/700 normal + 400 italic (multiple entries, all `unloaded`); `summernote` 400 (unloaded, the
notes rich-text editor font). **Loaded fonts at capture: FA5-Free 400 & 900 only.** Body font resolves
to `"Open Sans", sans-serif` in computed styles (`--app-font-family`), with Lato as the Bootstrap-body
family (`--font-family-sans-serif`).

---

## 3. cssVariables — complete tables (all 294, `rootVars`)

### App / brand / links
| var | value |
|---|---|
| `--app-link-color` | `#45a2ff` |
| `--app-font-family` | `'Open Sans', sans-serif` |
| `--font-family-sans-serif` | `"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"` |
| `--font-family-monospace` | `SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` |
| `--ptr-website-link-color` | `#45a2ff` |

### Navbar / sidebar (top-nav + off-canvas menu)
| var | value |
|---|---|
| `--navbar-bg` | `#0c2434` |
| `--navbar-color` | `#fff` |
| `--sidebar-menu-color` | `#fff` |
| `--sidebar-menu-active-color` | `#45a2ff` |
| `--sidebar-menu-bg` | `#103d5c` |
| `--sidebar-navItem-border-color` | `#fff` |
| `--sidebar-wrapper-color` | `#fff` |
| `--sidebar-wrapper-bg-color` | `#103d5c` |

### Chat message / roster / textarea
| var | value |
|---|---|
| `--msgs-header-color` | `#fff` |
| `--msgs-header-bg` | `#0a6db1` |
| `--msgs-separator-color` | `#fff` |
| `--msgs-separator-bg` | `#45a2ff` |
| `--msgs-separator-border-color` | `#45a2ff` |
| `--name-color` | `#c0d8ed` |
| `--nickname-color` | `#0a6db1` |
| `--users-color` | `#fff` |
| `--users-border-color` | `#fff` |
| `--users-badge-bg-color` | `#0e3651` |
| `--users-badge-color` | `#f4f4f4` |
| `--rosterImg-border-radius` | `50%` |
| `--textarea-bg` | `#111` |
| `--textarea-holder-btns-color` | `#676767` |
| `--textarea-holder-btns-hover-color` | `#0a6db1` |
| `--textarea-holder-border-color` | `#0a6db1` |
| `--avatar-gear-icon-padding` | `3px 6px` |
| `--split-gutter-color` | `#fff` |
| `--split-gutter-bg` | `#0a6db1` |
| `--transparent-gray` | `rgba(255, 255, 255, 0.331)` |

### Tabs (chat / notes / presentation)
| var | value |
|---|---|
| `--tab-active-bg` | `#45a2ff` |
| `--tabs-color` | `#fff` |
| `--tabs-border-color` | `#0a6db1` |
| `--tabs-dropdown-color` | `#45a2ff` |
| `--tabs-dropdown-bg` | `#0f2e43` |
| `--notes-tabs-bg` | `#0c2434` |

### Notes (member view = read + download only)
| var | value |
|---|---|
| `--note-text-color` | `#676767` |
| `--note-text-bg` | `#fff` |
| `--note-tabs-color` | `#fff` |
| `--note-options-color` | `#fff` |
| `--note-options-bg` | `#f4f4f4` |
| `--note-options-hover-color` | `#212529` |
| `--note-download-bg` | `#92d528` |
| `--note-delete-bg` | `#bb352a` |
| `--note-next-bg` | `#45a2ff` |

### Files
| var | value |
|---|---|
| `--file-list-even-bg` | `#f4f4f4` |
| `--file-list-odd-bg` | `#fff` |
| `--file-searchbar-bg` | `#fff` |
| `--file-searchbar-color` | `#b7b7b7` |
| `--file-searchbar-icon-color` | `#666666` |
| `--file-size-color` | `#b2b2b2` |
| `--file-name-color` | `#0a6db1` |
| `--file-download-bg` | `#92d528` |
| `--file-delete-bg` | `#bb352a` |
| `--file-see-more-bg` | `#45a2ff` |

### Modals (NAVY — governs all 7 modal shells)
| var | value |
|---|---|
| `--modal-content-bg-color` | `#103d5c` |
| `--modal-content-border-color` | `#103d5c` |
| `--modal-content-color` | `#f4f4f4` |
| `--modal-active-tab-bg-color` | `#45a2ff` |
| `--modal-active-tab-border-color` | `#45a2ff` |
| `--modal-active-tab-color` | `#fff` |
| `--modal-tabs-border-color` | `#45a2ff` |
| `--modal-btn-success-bg` | `#92d528` |
| `--modal-btn-success-border` | `#92d528` |
| `--modal-btn-danger-bg` | `#bb352a` |
| `--modal-btn-danger-border` | `#bb352a` |
| `--modal-btn-close-bg` | `#0a6db1` |
| `--modal-btn-close-border` | `#0a6db1` |
| `--modal-btn-hover-opacity` | `0.9` |
| `--modal-input-group-bg` | `#0a6db1` |
| `--modal-upload-files-color` | `#0a6db1` |
| `--modal-alert-link-color` | `#0a6db1` |

### Presenter / session / archives / search / reload / checkbox / dropdown / mobileApp
| var | value |
|---|---|
| `--presenter-recording-color` | `#45a2ff` |
| `--presenter-noRecording-color` | `#fff` |
| `--presenter-area-bg` | `#0f2e43` |
| `--session-control-dropdown-bg` | `#0e3651` |
| `--archives-dropdown-menu-bg-color` | `#0e3651` |
| `--archives-dropdown-menu-color` | `#45a2ff` |
| `--search-icon-bg-color` | `#45a2ff` |
| `--search-icon-color` | `#f4f4f4` |
| `--reload-icon-color` | `#45a2ff` |
| `--reload-icon-bg-color` | `#f4f4f4` |
| `--checkbox-bg-color` | `#45a2ff` |
| `--dropdown-divider-bg` | `#45a2ff` |
| `--mobileApp-info-color` | `#f4f4f4` |
| `--mobileApp-info-bg-color` | `transparent` |

### darkTheme-* (20 — the palette used when Dark theme active; this capture is Light)
| var | value | | var | value |
|---|---|---|---|---|
| `--darkTheme-chat-bg` | `#000` | | `--darkTheme-msg-bg` | `#000` |
| `--darkTheme-msg-color` | `#fff` | | `--darkTheme-msg-border-color` | `#f4f4f4` |
| `--darkTheme-msgs-bg` | `#143c57` | | `--darkTheme-msgs-bg-adm` | `#0f2e43` |
| `--darkTheme-msgs-separator-color` | `#aaa` | | `--darkTheme-msgs-separator-bg` | `#222` |
| `--darkTheme-msgs-separator-border-color` | `#373c42` | | `--darkTheme-roster-bg` | `#111` |
| `--darkTheme-roster-bg-adm` | `#000` | | `--darkTheme-textarea-bg` | `#0c2434` |
| `--darkTheme-textarea-color` | `#f4f4f4` | | `--darkTheme-date-color` | `#a8a8a8` |
| `--darkTheme-nickname-color` | `#c0d8ed` | | `--darkTheme-username-color` | `#0a6db1` |
| `--darkTheme-user-location-color` | `#f4f4f4` | | `--darkTheme-sidebar-wrapper-color` | `#f4f4f4` |
| `--darkTheme-sidebar-wrapper-bg-color` | `#000` | | `--darkTheme-mobileApp-info-color` | `#f4f4f4` |

### lightTheme-* (20 — the ACTIVE palette in this capture)
| var | value | | var | value |
|---|---|---|---|---|
| `--lightTheme-chat-bg` | `#eee` | | `--lightTheme-msg-bg` | `#fff` |
| `--lightTheme-msg-color` | `#676767` | | `--lightTheme-msg-border-color` | `#e1e1e1` |
| `--lightTheme-msgs-bg` | `#fff` | | `--lightTheme-msgs-bg-adm` | `#f4f4f4` |
| `--lightTheme-msgs-separator-color` | `#373c42` | | `--lightTheme-msgs-separator-bg` | `#e8e8e8` |
| `--lightTheme-msgs-separator-border-color` | `#373c42` | | `--lightTheme-roster-bg` | `#f1f1f1` |
| `--lightTheme-roster-bg-adm` | `#e1e1e1` | | `--lightTheme-textarea-bg` | `#fff` |
| `--lightTheme-textarea-color` | `#676767` | | `--lightTheme-date-color` | `#a8a8a8` |
| `--lightTheme-nickname-color` | `#676767` | | `--lightTheme-username-color` | `#0a6db1` |
| `--lightTheme-user-location-color` | `#676767` | | `--lightTheme-sidebar-wrapper-color` | `#676767` |
| `--lightTheme-sidebar-wrapper-bg-color` | `#fff` | | `--lightTheme-mobileApp-info-color` | `#676767` |

### Darkly/theme base palette (non-`bs-`)
| var | value | | var | value |
|---|---|---|---|---|
| `--blue` | `#375a7f` | | `--primary` | `#375a7f` |
| `--cyan` | `#3498DB` | | `--info` | `#3498DB` |
| `--green` | `#00bc8c` | | `--success` | `#00bc8c` |
| `--danger` | `#E74C3C` | | `--warning` | `#F39C12` |
| `--secondary` | `#444` | | `--indigo` | `#6610f2` |
| `--purple` | `#6f42c1` | | `--pink` | `#e83e8c` |
| `--orange` | `#fd7e14` | | `--teal` | `#20c997` |
| `--red` | `#f00` | | `--yellow` | `#ff0` |
| `--white` | `#fff` | | `--black` | `#000` |
| `--gray` | `#bbb` | | `--gray-dark` | `#303030` |
| `--light` | `#303030` | | `--dark` | `#adb5bd` |
| `--dark-black` | `#222` | | `--darker-black` | `#111` |
| `--dark-brown` | `#4b4b4b` | | `--brown` | `#555` |
| `--dark-gray` | `#aaa` | | `--darker-gray` | `#aaa6a6` |
| `--light-blue` | `#40e0d0` | | `--light-brown` | `#8c8686` |
| `--light-green` | `#1edd6e` | | `--light-gray` | `#ccc` |
| `--light-black` | `#373c42` | | `--lighter-black` | `#3e444a` |
| `--lighter-blue` | `#edf2f6` | | `--lighter-gray` | `#eee` |
| `--fire-yellow` | `#f7fd37` | | | |
| `--breakpoint-xs/sm/md/lg/xl` | `0` / `576px` / `768px` / `992px` / `1200px` | | | |

### Bootstrap `--bs-*` (123 vars)
Full Bootstrap 5.3 default palette + theme overrides. Key/load-bearing values (all from `rootVars`):
`--bs-primary #0d6efd`, `--bs-secondary #6c757d`, `--bs-success #198754`, `--bs-danger #dc3545`,
`--bs-warning #ffc107`, `--bs-info #0dcaf0`, `--bs-light #f8f9fa`, `--bs-dark #212529`,
`--bs-body-bg #fff`, `--bs-body-color #212529`, `--bs-body-font-size 1rem`, `--bs-body-font-weight 400`,
`--bs-body-line-height 1.5`,
`--bs-body-font-family system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans",…`,
`--bs-border-radius .375rem` (sm `.25rem`, lg `.5rem`, xl `1rem`, 2xl/xxl `2rem`, pill `50rem`),
`--bs-border-color #dee2e6`, `--bs-border-width 1px`,
`--bs-link-color #0d6efd`, `--bs-link-hover-color #0a58ca`,
`--bs-box-shadow 0 .5rem 1rem rgba(0,0,0,.15)`, `--bs-box-shadow-sm 0 .125rem .25rem rgba(0,0,0,.075)`,
`--bs-box-shadow-lg 0 1rem 3rem rgba(0,0,0,.175)`,
`--bs-focus-ring-color rgba(13,110,253,.25)`, `--bs-focus-ring-width .25rem`,
`--bs-code-color #d63384`, `--bs-highlight-bg #fff3cd`,
grays 100→900: `#f8f9fa #e9ecef #dee2e6 #ced4da #adb5bd #6c757d #495057 #343a40 #212529`,
breakpoints xs/sm/md/lg/xl/xxl `0 576px 768px 992px 1200px 1400px`.
(The full 123-entry list is in the raw `rootVars`; the above covers every distinct semantic value used by
components in this capture.)

---

## 4. Element inventory by surface

> Coordinates are from the collapsed-mobile layout (see §1 caveat). Colours/fonts/structure are exact.
> Font stack on all app chrome resolves to `"Open Sans", sans-serif` (computed `font-family`).

### 4.1 Top navbar — `nav.mainAppNav` (`[73]`)
- `<nav class="navbar navbar-expand-md navbar-dark fixed-top mainAppNav">` `[73]` — bg **`rgb(12,36,52)` = #0c2434**, color `#fff`, height 49px. Fixed top.
- Hamburger toggler `<button class="navbar-toggler btnNavToggler">` `[81]` (56×49, bg transparent, `fa-bars` icon `[75]` white); toggler-icon `[82]` 30×30, uses SVG bars data-URI (`assets.backgroundImages[0]`, stroke `#fff`).
- Brand: `<a class="navbar-brand ml-1 mr-auto">` `[79]` + logo `<img id="cssLogo" class="brand-logo">` `[80]` (119.83×10.64, `alt="App Logo"` from `attrs`).
- Roster header strip inside nav: `<span class="sidebar-menu">` `[74]` (bg `#103d5c`, `fa-bars` toggler), `<span class="users …">` `[76]` with `fa-user` icon `[77]` + connected-count, `<span class="fas fa-mobile … mobile-info-app-btn">` `[78]` (Launch-in-Mobile-App). `title="Users Connected"`, `title="Launch in Mobile App"` (`inventory`).
- Right nav (`ul.navbar-nav.ml-auto` `[84]`, collapsed `0×0` here): talking indicator `<li class="nav-item talkingIndicator">` `[85]` → text **`( No one is speaking )`** (`[86].text`); Volume dropstart `<a id="dropdownVolume">` `[88]` (`fa-2x fa-volume-up`, label **"Volume"** `[90]`, `title="Volume"`), volume popover `<div class="dropdown-menu volumeControl">` `[91]` bg `#111` with **"Mute"** btn (`btn btn-primary btn-sm` `[97]`, `title="Mute Audio"`) + DND toggles (Alert/QA/Non-trade/Chat sound, Subtitles, Don't Disturb — `[102..125]`, all `form-check-input` checkboxes, checked bg `#0d6efd`); Reload `<a class="nav-link…">` `[127]` (`fa-2x fa-sync`, label **"Reload"** `[129]`, `title="Reload"`).

### 4.2 Off-canvas sidebar menu — `div.sidebar-wrapper` (`[7]`, off-screen `x=-250`, 250px wide)
Background **white `rgb(255,255,255)`** (light theme), text `#676767`, font 14px/400 (`.small`).
Nav items (`li.nav-item` → `a.nav-link.sidebar-item`, weight 700, icon + `span.pl-2` label):

| item | icon | title attr | text | node |
|---|---|---|---|---|
| header block | | | "Powered by:" / `ProTradingRoom.com` link (`#45a2ff`) / "Version: v4.0.1-b422b517" / **"Mobile App Info"** btn (`btn-sm btn-secondary` #6c757d) | `[11..15]` |
| status row | `fa-check`×2 | | "Chat ✓ Media ✓" | `[18..21]` |
| Connectivity Check | `fa-network-wired` | Connectivity Check | Connectivity Check | `[23..25]` |
| General Settings | `fa-cogs` | General Settings | General Settings | `[27..29]` |
| **Archives** (dropdown) | `fa-archive` | Archives | Archives | `[31]` id `archivesDropdown` |
| Manage Muted Users | `fa-comments` | Manage Muted Users | Manage Muted Users | `[45..47]` |
| Manage Followed Users | `fa-users` | Manage Followed Users | Manage Followed Users | `[49..51]` |
| Users: | `fa-user` | Users | "Users:" | `[53..56]` |

**Users toolbar** (`div.users-btns` `[57]`): Options `<button id="user-options-btn" class="btn-sm btn-dark…dropdown-toggle">` `[59]` (bg `#212529`, `fa-cog`, `title="Users Options"`); Reload `[64]` (bg `#f4f4f4`, `fa-sync` #45a2ff, `title="Reload Users"`); Sort `[66]` (bg `#6c757d`, `fa-sort-alpha-down`, `title="Sort Users"`); Search `[68]` (bg `#45a2ff`, `fa-search` #f4f4f4, `title="Search Users"`).
**Archives dropdown** (`state[4] dropdown:Archives`, and `[34]`): `div.dropdown-menu.users-dropdown-options` bg **`rgb(14,54,81)` = #0e3651**, items color `#45a2ff` 14px, `dropdown-item small`:
- **Alert Logs** (`fa-bell`), **Chat Logs** (`fa-comment`), **Transcript History** (`fa-closed-captioning`). ⇒ **Only 3 archive items for a member.**

### 4.3 Presentation / stage tabs — `app-presentationarea` (`[132]`)
`ul#mainTabs.mainTabset` `[134]` (role=tablist), tabs (`a.nav-link`, active bg `#45a2ff` / #fff):
- **Screens** `#screens-tab` `[136]` active (`fa-desktop`, label "Screens" `[140]`)
- **Streams** `#streams-tab` `[142]` (`fa-podcast`, "Streams" `[146]`) — collapsed `0×0`
- **Notes** `#notes-tab` `[148]` (`fa-edit` change-indicator `#noteChangeIndicator` `[151]`, "Notes" `[152]`)
- **Files** `[154]` (`fa-folder`, "Files" `[158]`)

Empty states: `<h3 class="text-center mt-4">` `[161]` **"No one is presenting right now..."**, `[165]` **"No one is streaming right now..."** (fs 21.46px/500, color `#cccccc`). ⇒ Member sees empty stage; **no presenter/broadcast controls exist** (see §7).

### 4.4 Chat / Alerts layout — `as-split#mainAreaSplit` (`[130]`)
A vertical split (`as-split`, gutters `as-split-gutter` bg `#0a6db1` `[3403/3405]`, `cursor:row-resize`). Three areas stacked (this member layout = "Chat and Alerts bottom" default):
1. **Presentation area** (`[131]` `app-presentationarea`) — stage/tabs above.
2. **Alerts scroller** (`[573]` `app-alerts`).
3. **Main chat** (`[1904]` `app-chat`).

#### Alerts panel — `app-alerts` (`[573]`)
- Header `<nav class="…chat-nav alertHeader">` `[576]` bg **`rgb(10,109,177)` = #0a6db1**, color `#fff`; brand **"Alerts"** `[577]` + `fa-bell me-1` `[578]`; right nav = **Search** (`fa-search`, `title="Search"` `[581]`) + **Settings** gear (`fa-cog chat-header-gear`, `title="Settings"` `[585]`). **No Post-Alert / compose control in the member alerts header.**
- Scroller `app-roomscroller#chatScrollViewParentAlerts` `[586]` bg `#fff`. Contains virtual list of **`app-st-message`** alert rows (scrolled above viewport, large negative y).

**Alert row (fully decoded — `[588]` first, repeated for ALL alerts):**
- `app-st-message.ng-star-inserted` `[588]` → `div.msg-box.pb-1` `[589]` bg **`rgb(232,232,232)` = #e8e8e8** (all alert rows use this; admin/staff variant `msg-box-adm` differs — see chat below).
- Kebab menu `<a id="dropdownMenuLink" class="msgMenu dropright pt-1">` `[593]` — glyph **`⠇`** (`.text` = `⠇`), color **`rgb(10,109,177)` = #0a6db1**, 20px/600, cursor pointer. Dropdown `div.dropdown-menu.users-dropdown-options` `[594]` bg `#0e3651`, radius 6px, items `#45a2ff`:
  - **User Info** (`fa-user` `[595/596]`), **Mention** (`fa-reply` `[597/598]`), **Copy** (`fa-copy` `[599/600]`). ⇒ **3 items only for a member on alert rows** (confirmed by all 6 captured `dropdown:⠇` states — see §5).
- Avatar `div.avatar.pl-1` `[601]` + `<img>` `[602]` 35×35 (gravatar `d=mm&s=50`).
- Meta row `[604]`: `<strong class="username mx-1">` `[606]` (14px/900, color `#e8e8e8`… i.e. `--username`/nickname), a **QA badge** `<button class="btn btn-sm btn-secondary me-1 alert-qa">` `[608]` bg **`rgb(108,117,125)` = #6c757d**, color `#1a1a1a`, 10px/400, radius 4px, with `fa-question-circle` `[610]` — present on **50** alert rows (`.alert-qa` ×50), `title="Ask a question"`; timestamp `<span class="created-at mr-2">` `[612]` 12px/600 color `#e8e8e8`, format **`7/17/26, 11:55 AM`**.
- Body `<div class="msg-left text-formated preText ml-2 mr-2 p-0">` `[614]` 13px/100 lh19.5 color `#1a1a1a`, `white-space:pre` (preText). Inline `<span class="tradeColor">` `[615]` color **`rgb(69,162,255)` = #45a2ff** 13px/100 (trade-order lines like "BUY +10 VERTICAL SPX…"). `.tradeColor` ×18, `.stockColor` (bold blue `$TICKER`) ×6.

#### Main chat panel — `app-chat` (`[1904]`)
- `div.chat.d-flex.flex-column.h-100` `[1905]` bg **`rgb(238,238,238)` = #eee** (light chat-bg).
- Header `nav.chatHeader` `[1907]` bg **`#0a6db1`**, `fa-comment` brand `[1909]`. Tabs `ul.chatTabs` `[1910]`:
  - **Main Chat** `[1912]` active (bg `#45a2ff`, #fff, 12px/700, radius 6px, `cursor:default`)
  - **Off Topic** `[1914]` (inactive, `cursor:pointer`)
  Right nav: **Search** (`fa-search` `[1918]`) + **Settings** gear dropdown (`fa-cog chat-header-gear` `[1921]`).
- Scroller `app-roomscroller.chat-uploaded-img-sm` `[1922]` bg `#fff`.

**Main-chat message row (fully decoded — `[1924]`):**
- `div.msg-box.pb-1` `[1925]` bg **`rgb(255,255,255)` = #fff**, border-top `rgb(225,225,225)` = #e1e1e1.
- **Admin/staff variant `div.msg-box-adm`** (×**20**, e.g. `[1955]`) bg **`rgb(215,215,215)` = #d7d7d7** (distinguishes staff-posted messages inside the member's main chat).
- Kebab `<a id="dropdownMenuLink" class="msgMenu dropright">` `[1929]` glyph `⠇`, color `#0a6db1`. Dropdown items (`[1930..1938]`):
  - **User Info** (`fa-user`), **Mention** (`fa-reply`), **Reply** (`fa-comment`), **Add Reaction** (`far fa-smile`). ⇒ **4 items for a member on main-chat rows** (Reply + Add Reaction are the extra two vs alert rows; NO Delete/Edit/Pin/Mod actions).
- Avatar `div.avatar.pl-1` `[1939]` + img 35×35.
- Meta: `<strong class="username mx-1">` `[1944]` 14px/900 color **`rgb(10,109,177)` = #0a6db1** (nickname color); user badges `<img class="user-badge-img">` (20×20) `[1946..1949]` — **`.user-badge-img` ×202** total (author badges); timestamp `<span class="created-at mx-2">` `[1950]` 12px/600 color **`rgb(168,168,168)` = #a8a8a8** (`--date-color`), format **`04:02 PM`** (time-only for same-day).
- Body `div.msg-left.text-formated.preText` `[1952]` 13px/100. Question messages add **`.questionColor`** (color **`rgb(32,149,242)` = #2095f2**, ×11). `$TICKER` = `.stockColor` blue 13px/700 `[1953]`.
- **Chat reactions** `<span class="badge chat-reaction">` (`[3336/3337]`) — inline-block, 12px/700 color `#676767`, padding 3/6, radius 6px, e.g. text **"🙏 1"**; the trailing `far fa-smile` add-reaction chip. `.chat-reaction` ×2 in this capture.
- Day separators: `<a>` rows with dates like **"Sunday, July 19, 2026"** (`[727]`), "Monday, July 20, 2026", etc. (`msgs-separator`, bg `#e8e8e8` light).

#### Composer — `#textAreaHolder` (`[3396]`) ⭐ member-critical
- `<div id="textAreaHolder" class="d-flex align-items-center textSendDiv">` `[3396]` bg **`#fff`**, radius 8px, padding 5px, margin 5px, 100×45 (collapsed width).
- Textarea `<textarea id="textAreaTxt" class="txt-area form-control border-0">` `[3399]` bg `#fff`, color `#676767`, 14px/400 lh21, min-height 35px, `cursor:text`, **placeholder `"Type your message here.."`** (`inventory.inputs` ph).
- Button column `div.textAreaBtnsCol` `[3400]` → **ONE** button `span.textAreaBtns` `[3401]` with `<i class="fas fa-plus">` `[3402]` (color `#676767`, the attach/more "+" button). **This is the ENTIRE member composer toolbar — one "+" button + textarea. No Post-Alert, Poll, Presenter, mic, camera, or record controls.**
- Not-connected overlay `<div id="connectedMsg" class="notConnectedOverlay">` `[3407]` bg `#000`, text (when disconnected) "Conected"/"Offline" badge (`badge badge-danger` `[3417]` bg `#e74c3c`).

### 4.5 Notes tab (state `tab:Notes`, 377 nodes) — member = READ + DOWNLOAD only
`div#notes.tab-pane` → `ul#notesTabs.noteTabset` bg **`#0c2434`**. **6 note tabs** (`a.nav-link`, `editName` label, `fa-pen` rename-indicator `noteUpd-*` hidden for member, `tooltip="Double-Click to rename note tab"` — but no edit controls rendered):
1. **Welcome** (`fa-home` badge-success `#00bc8c`, `ngbtooltip="This note is the Welcome Mat…"`)
2. **JC's Daily Briefing**
3. **Henry's Workflowy Notes**
4. **Sam's Mag 7 index**
5. **1on1 Coaching/ Prop Firm & Tool Discounts codes.**
6. **Taylor's Scorecard Rankings (6/26 CLOSE)**

Note body `div.note-container` bg `#fff`, `div.note-view#summernoteEdit-*` text `#676767` 16px/300 (summernote-rendered rich text). **Only member control: `<button class="btn btn-sm noteDownload mr-3">` "Download"** (bg **`#92d528`**, `fa-download`, `[231]/[351]/[377]`). **NO Edit / Save / Delete / New note buttons** (those are `--note-delete-bg #bb352a` / `--note-next-bg` tokens, not rendered for member). Note text content captured verbatim (times "All times quoted are CENTRAL TIME.", scorecard formulas, Apex/Tradeify/Bookmap promos — see `alltext.txt` extract).

### 4.6 Files tab (state `tab:Files`, 24 nodes)
`ul#myTab.files-tabs` bg `#0c2434`. Sub-tabs (`a.nav-link` + `span.badge.rounded-pill.bg-danger.files-badge` count, bg `#dc3545`):
- **Files** `#files-tab` active (bg `#45a2ff`/#fff), badge **"0"**
- **Images** `#image-tab`, badge "0"
- **Sounds** `#sounds-tab`, badge "0"
Search: `div.input-group.st-searchbar` bg `#fff`, `<input>` + `<span id="basic-addon1" class="…st-searchbar-icon">` `fa-search` #666, `placeholder="Search files..."`, `title="Reload list"`. **"Refresh"** button `<button class="btn …st-fileSeeMore">` (bg `#45a2ff`/#fff, `fa-sync`). Member is read-only (no upload/delete in this tab; upload lives only in Post-Alert modal which member cannot open).

### 4.7 Modals (7 `role="dialog"`, all in DOM but member cannot trigger the staff ones)
All share `div.modal-content` bg **`rgb(16,61,92)` = #103d5c** (NAVY, `--modal-content-bg-color`), color `#f4f4f4`, radius 8px, border `rgba(0,0,0,.176)`. Close button `btn-close btn-close-white`.

| modal | id | node | member-relevant contents |
|---|---|---|---|
| **User Info** | `#user-modal` | `[3410]` | Avatar, title, `badge badge-danger` "Offline" (`#e74c3c`), footer btns: **@Mention**, **Private Chat**, **Follow** (`btn-outline-info` #0dcaf0), **Mute** (`btn-outline-warning` #ffc107), **Close** (`btn-primary` #0a6db1). **NO Ban/Kick/Make-Presenter/Promote.** |
| **Play YouTube For All** | `#play-youtube-modal` | `[3429]` | title "Play YouTube For All", input `placeholder="Paste YouTube URL"`, addons **Save** / **Play For All**. *(Staff broadcast tool — present in DOM; no member trigger.)* |
| **User Settings** | `#user-settings-modal` | `[3443]` | Tabs **App Settings** / **Alert Settings** / **Chat Settings** (see §6 for all labels). Member-accessible personal settings. |
| **Audio/Video Settings** | `#av-settings-modal` | `[3674]` | title "Audio/Video Settings", tab "User Settings", Speakers select (options "Default - External Headphones", "…2"), Test/Change Devices btns; "presenter-audio-video-settings" tabpanel exists in DOM (audio/video device selects) but is the presenter surface. |
| **Debug Log** | `#debug-log-modal` | `[3716]` | title "Debug Log", textarea, "Reload Log List". |
| **Post Alert** | `#alert-modal` | `[3728]` | title **"Post Alert"**, tabs **Text Alert / Text Url / Image / GIF / Video**, options "Keep alert window open?", "Post on X? (tweet)", "Don't send to push notification?", "Non-trade alert? (Different Sound)", "Add Legal Disclosure?". *(STAFF tool — present in DOM, NO member trigger; see §7.)* |
| **Chat Logs** | `#chat-logs-modal` | `[3835]` | "Reload Log List", per-day entries `strong.fw-bold` dates (Feb 26 → Jul 21 2026), "By: admin@protradingroom.com", "Channel: offTopic/main". Reached via sidebar Archives → Chat Logs. |

**Poll modal** `<app-poll-modal id="pollModalCompHolder">` `[3789]`: titlebar "Polls", tabs **Create New Poll** / **Pre-Canned Polls**, steps "Enter your poll question:", "Add Choices/Answers:", "When done editing, Send your poll", "Anonymous Poll (…)", btns **Add Choice / Save To Canned / Send Poll** (`btn-success` #92d528). *(STAFF tool — present in DOM, NO member trigger; see §7.)*

### 4.8 PM / Private Chat
Trigger = **"Private Chat"** button in User Info modal (`[3422]`) + PM layout radio in settings **"PM logs on the right"** (`#pm-window-layout` `[3488]`, label `[3489]`). No standalone open PM window captured in this snapshot (honest gap — no active PM thread at capture time).

### 4.9 Overlays / toasts / misc
- Speech-reco overlay: `#appSpeechRecoOverlay` / `#app-speech-reco-overlay` (`[3546/3550]`), setting "Show Closed Captions Overlay:". `presentation-subtitles` toggle in navbar volume popover (`[118]`).
- Not-connected overlay `#connectedMsg` (§4.4), "Offline" danger badge.
- `mp3player` `<audio id="mp3player">` `[569]` (alert sounds).

### 4.10 assets (`assets.*`)
- **images (89):** gravatars `https://secure.gravatar.com/avatar/<hash>?d=mm&s=50` (roster/message avatars), room uploads `https://cdn1.protradingroom.com/uploads/images/652754202ad80b3e7c5131e2_<name>_<ts>.png`, and `https://chat.protradingroom.com/var/www/uploads/<hash>`.
- **backgroundImages (8):** hamburger SVG (stroke `#fff`), checkbox-check SVG, radio-dot SVG (`#fff`), close-X SVG (`#000`), select-caret SVG (`#343a40`), 2 base64 PNG gradients, jQuery-UI sprite `ui-icons_444444_256x240…png`.
- **stylesheetHrefs (3):** `use.fontawesome.com/releases/v5.8.1/css/all.css` (**FA pinned 5.8.1**), `cdnjs…animate.css/3.7.2`, `chat.protradingroom.com/styles.d622cb9ed2bbc221.css`.
- **scripts (5):** Angular `runtime`/`polyfills`/`scripts`/`main` bundles + `reallyfreegeoip.org/json?callback=…` (geo lookup).
- **stylesheets (38):** `[0]` FA external, `[3]` app CSS (`@import Lato`), `[1..2],[4..37]` inline (Angular `_ngcontent-ng-cXXXX`-scoped component styles + `:root` var block `[5]`). `inaccessibleStylesheets[0]` = animate.css (CORS-blocked).

### 4.11 icon inventory (`inventory.icons`, 59 distinct FA classes)
fa-check, fa-network-wired, fa-cogs, fa-archive, fa-bell, fa-comment, fa-closed-captioning, fa-comments,
fa-users, fa-user, fa-cog, fa-sync, fa-sort-alpha-down, fa-search, fa-bars, fa-mobile, fa-volume-up,
fa-times, fa-bell (me-1), fa-reply, fa-copy, fa-question-circle, far fa-smile, fa-plus, fa-desktop,
fa-podcast, fa-edit, fa-folder, fa-home, fa-pen, fa-download, fa-palette, fa-columns, fa-wrench,
fa-bell-slash, fa-user-tie, fa-file-alt, fa-filter, fa-image, fa-scroll, fa-trash, fa-link,
fa-file-upload, fa-window-minimize/maximize, fa-plus-circle, fa-floppy-o, fa-expand, fa-spinner fa-spin,
fa-sync-alt, fa-play. (`fa-user-tie`, `fa-trash`, `fa-scroll`, `fa-filter`, `fa-wrench`, `fa-palette` appear
in settings/modals internals.)

### 4.12 inputs inventory (`inventory.inputs`, 76 total by type)
checkbox ×38, textarea ×7, text ×5, radio ×10, color ×4, search ×2, url ×2, datetime-local ×2, range ×1,
number ×1, file ×1, select-one ×3. **Placeholders (verbatim):** "Search by nick or email,enter to search",
"Type your search term, then press Enter", **"Type your message here.."** (composer), "Search files...",
"Paste YouTube URL", "Alert Text..." (×3, alert modal), "Link / URL to send to users",
"Image or Video Link to show", "Main poll question (i.e. Where do you think the market is going?)",
"Enter a choice (i.e. Up, Down, Sideways)", "Type your question here..." (ask-a-question).

---

## 5. States (`states`, 12 total; base = 6000 nodes)

| # | name | trigger | nodeCount | what it reveals |
|---|---|---|---|---|
| 0 | `base` | — | 6000 | full room DOM (Screens tab active, Main Chat active, light theme) |
| 1 | `tab:Notes` | Notes | 377 | Notes tab expanded — 6 note tabs + rendered note bodies + "Download" only |
| 2 | `tab:Files` | Files | 24 | Files tab — Files/Images/Sounds sub-tabs (badges "0"), search, Refresh |
| 3 | `tab:Off Topic` | Off Topic | 4 | Off-Topic/Screens empty states ("No one is presenting…") |
| 4 | `dropdown:Archives` | Archives | 10 | Archives menu = **Alert Logs, Chat Logs, Transcript History** (3 items, `#0e3651`/`#45a2ff`) |
| 5 | `dropdown:menu` | — | 3 | Users-options menu = single item **"Sort by Trials"** (white menu #fff, #212529) |
| 6–11 | `dropdown:⠇` (×6) | ⠇ | 7 each | message-kebab menus |

**The six `dropdown:⠇` captures each show the SAME 3 items** (menu `div.users-dropdown-options.show` bg `rgb(14,54,81)`=#0e3651, 160×112, radius 6px; items `#45a2ff` 16px):
**User Info** (`fa-user`) · **Mention** (`fa-reply`) · **Copy** (`fa-copy`).
These are the ALERT-row kebabs. (Main-chat kebab adds Reply + Add Reaction — captured statically in base `[1930..1938]`, not as a separate `dropdown:⠇` state.) **No captured kebab state contains Delete, Edit, Pin, Mute-message, or any moderation action.**

---

## 6. Text content (exact casing/punctuation)

**Sidebar/nav:** "Powered by:", "ProTradingRoom.com", "Version: v4.0.1-b422b517", "Mobile App Info",
"Chat", "Media", "Connectivity Check", "General Settings", "Archives", "Alert Logs", "Chat Logs",
"Transcript History", "Manage Muted Users", "Manage Followed Users", "Users:", "Sort by Trials",
"( No one is speaking )", "Volume", "Mute", "Alert sound", "QA sound", "NTA sound", "Chat sound",
"Subtitles", "Don't Disturb", "Reload".

**Stage/tabs:** "Screens", "Streams", "Notes", "Files", "No one is presenting right now...",
"No one is streaming right now...".

**Chat/alerts:** tabs "Main Chat", "Off Topic"; header "Alerts"; kebab "User Info", "Mention", "Copy",
"Reply", "Add Reaction"; composer placeholder "Type your message here.."; overlay "Conected", "Offline".
Timestamps: alerts `7/17/26, 11:55 AM` (date+time); main chat `04:02 PM` (time-only same-day); day
separators "Sunday, July 19, 2026" … "Wednesday, July 22, 2026".

**User Info modal:** "Offline", "@Mention", "Private Chat", "Follow", "Mute", "Close".

**User Settings modal — App Settings tab:** "App Settings", "Alert Settings", "Chat Settings",
"Choose Color Theme:", "Light Theme", "Dark Theme", "Room Layout:", "Chat and Alerts left/top/right/bottom",
"PM logs on the right", "Colors & Size:", "Text Color", "Username Color", "Background Color",
"Ticker Color", "Text Size", "Reset", "Save changes", "Do not disturb:", "Start recording sound",
"Stop recording sound", "Reactions Response", "Reactions QA Response", "Disable/Enable Video:", "Video",
"Enabled", "Show Closed Captions Overlay:", "Edit my Info and Avatar".
**Alert Settings tab:** "Text Mode:", "Regular Mode", "Compact Mode", "Alert / QA Popup",
"QA Reactions Sound", "Non-trade alert sound", "Alert popup:", "Longer alert popup", "off",
"Filter out alerts".
**Chat Settings tab:** "Image Preview:", "Smaller image preview", "Gif", "Badges", "Chat / PM Popup",
"Extra chat column:", "Chat column", "Always Scroll To Bottom:", "Always scroll to bottom",
"Reduce Chatlog Memory:", "Reduce Chatlog Memory", "Tab sleep optimization".

**AV Settings:** "Audio/Video Settings", "User Settings", "Disable Video", "(saves bandwidth)",
"Speakers:", "Default - External Headphones", "Default - External Headphones 2", "Test",
"Audio device (input):", "Video device (input):", "Change Devices".

**Post Alert modal (staff):** "Post Alert", "Text Alert", "Text Url", "Image / GIF / Video", "OR...",
"Click to select images to upload", "or drop an image here", "Keep alert window open?", "Post on X? (tweet)",
"Don't send to push notification?", "Non-trade alert? (Different Sound)", "Add Legal Disclosure?".

**Poll modal (staff):** "Polls", "Create New Poll", "Pre-Canned Polls", "Enter your poll question:",
"Add Choices/Answers:", "When done editing, Send your poll", "Add Choice",
"Anonymous Poll (Does not show the voting name/email, just results)", "Save To Canned", "Send Poll",
"You can store polls you use often here…".

**Play YouTube modal (staff):** "Play YouTube For All", "Save", "Play For All".

**Debug Log / Chat Logs:** "Debug Log", "Reload Log List", per-day "By: admin@protradingroom.com",
"Channel: offTopic" / "main".

**32 distinct chat/alert usernames** captured (real data): JC, Sam, TG, Danielle Shay, Trendy Jon,
Taylor Horton, LornaBot, Allison Ostrander, Henry, HG, Big Bad Voodoo Daddy, Bruce Marshall, ROM, Pawan,
john bannwarth, Vincent 13 Screens, Tom H, M ROB, Mirza Catic, Kevin O, 007, Skydiver Jim, NoMoFomo,
MicheleD, Manak S, shivasfin, Paul Strat, Cedar Mah, Matt_NY, Raptor, AB, Tom McEvoy, Kevin O.

---

## 7. What this file UNIQUELY evidences — the MEMBER view (authority for "must NOT see")

Cross-referenced against the four role tiers. Every claim cites a JSON locator.

### 7.1 Message kebab menus are stripped to non-privileged actions
- **Alert-row kebab (Alerts panel):** exactly **3** items — User Info / Mention / Copy (`states[6..11]` all identical; base `[594..600]`). No Delete, Edit, Pin, Mute-message.
- **Main-chat kebab:** exactly **4** items — User Info / Mention / Reply / Add Reaction (base `[1930..1938]`). No moderation actions.
- ⇒ A member **must not** see Delete/Edit/Pin/Mute or any staff action in either message kebab.

### 7.2 User Info modal is member-scoped
- Buttons: @Mention, Private Chat, Follow, Mute (self-mute of that user), Close (`[3421..3427]`).
- **Absent:** Ban, Kick, Promote/Make-Presenter, Make-Admin/Mod, Grant-speak. ⇒ member cannot manage other users.

### 7.3 Composer is chat-only (one "+" button)
- `#textAreaHolder` contains **only** the textarea + a single `fa-plus` button (`[3396..3402]`). ⇒ **No Post-Alert, no Poll, no Presenter/broadcast, no mic/camera/record, no schedule-alert, no legal-disclosure** controls in the member composer.

### 7.4 Staff tools exist in DOM but have NO member trigger
Angular renders these components always, but they are **not reachable** by a member — no visible button
targets them, they render at `0×0`, and the only `data-bs-target` references are the poll modal's *internal*
tab switches (`[3803]→#sendpoll`, `[3805]→#savedPolls`), never an opener in the member chrome:
- **Post Alert modal** `#alert-modal` `[3728]` — no `data-bs-toggle` opener anywhere in nav/composer/roster.
- **Poll modal** `app-poll-modal` `[3789]` — no opener.
- **Play YouTube For All** `#play-youtube-modal` `[3429]` — staff broadcast; no opener.
- **Presenter AV** — `#presenter-audio-video-settings` tabpanel `[3704]` exists inside AV modal but is the presenter surface; member sees only the "User Settings" AV tab.
⇒ Presence of these nodes in the member dump is an Angular artifact, **NOT** a member affordance. The build must gate these behind role so members never get a trigger.

### 7.5 Alerts panel header has no compose control
- `alertHeader` `[576]` right-nav = Search + Settings only (`[581]/[585]`). ⇒ members read alerts, cannot post them. Members CAN "Ask a question" via the per-alert `alert-qa` QA badge (`[608]`, `title="Ask a question"`) — that is member-allowed.

### 7.6 Notes & Files are read-only for members
- Notes: only control is green **Download** (`[231]`); no Edit/Save/Delete/New (`--note-delete-bg`/`--note-next-bg` tokens unused in rendered member DOM).
- Files: search + Refresh only; upload lives solely in the (member-inaccessible) Post-Alert modal.

### 7.7 Sidebar Archives is limited
- Member Archives dropdown = Alert Logs / Chat Logs / Transcript History only (`states[4]`). No admin log-management/export beyond viewing.

### 7.8 Staff-message visual marker
- `msg-box-adm` (bg `#d7d7d7`, ×20, `[1955]…`) marks staff/admin-posted messages *within* the member's main chat — members can SEE staff messages (distinctly shaded) but the kebab on them is still the 4-item member menu.

**Member IS allowed (positive affordances evidenced):** send chat (composer), switch Main Chat/Off-Topic,
Reply / Add Reaction / Mention / Copy on chat rows, Ask-a-question (QA badge) on alerts, Follow/Mute/PM a
user, read Notes + Download, browse Files, view Archives logs, open personal User/Alert/Chat/AV Settings,
adjust theme/layout/colors, volume + per-channel Do-Not-Disturb.

---

## 8. Honest gaps

1. **Collapsed-mobile layout.** UA=Pixel 9, `body` width forced to **110px**; navbar hamburger-collapsed, sidebar & roster off-canvas (`x=-250/-248`). All pixel widths/positions are the **mobile-collapsed** variant — do NOT treat 110px column widths as desktop. Colours/fonts/structure/text are valid; desktop geometry is NOT in this file.
2. **Roster rows not enriched.** `app-room-roster` `[71]` contains only 2 nodes (`app-room-roster` + empty `div.room-roster-list`), rect off-screen, **zero user rows** captured (roster collapsed). No member roster-row markup, avatars, presence badges, or roster kebab in this file — use a roster-specific/expanded capture for that surface.
3. **Theme = LIGHT only.** This capture is Light theme. The `darkTheme-*` tokens (§3) are documented from `rootVars` but **no dark-theme computed styles** were captured — dark-theme rendered values are not evidenced here.
4. **No open PM window / active poll / active presentation.** Stage shows empty states ("No one is presenting…"). Poll modal, PM window, presenter stage, and webcam/stream tiles have no *live* instance in this snapshot — only their empty/DOM-stub forms.
5. **`class` attribute is captured as a top-level node key** (reliable); however the raw `attrs` object carries Angular `_ngcontent`/`_nghost` scoping markers rather than semantic data — component identity comes from `tag` (`app-*`), `id`, `class`, and `path`.
6. **Modal internals partially collapsed.** Staff modals (Post Alert, Poll, YouTube) render at `0×0` (`display` collapsed); their child labels/inputs are captured (text + structure) but their pixel geometry is not meaningful.
7. **`matched` CSS rule lists** were not exhaustively transcribed per-node (they duplicate `styles.d622cb…css`); computed `style` values (used throughout this doc) are the authority, and the source stylesheet hrefs are listed in §4.10.
