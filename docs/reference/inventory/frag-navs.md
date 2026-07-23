# frag-navs — Navigation fragment inventory

Assignment slug: **frag-navs**. Five HTML DOM-dump fragment-pages from
`docs/reference/visual-evidence-deep/fragment-pages/`. All five share the same
harness shape: `<!doctype html>` → `<head>` with an inlined Bootswatch v4.3.1
`<style>` block (the bulk of every file's byte size) + FontAwesome `all.min.css`
link → `<body class="darkTheme lightTheme">` containing an `.evidence-banner`
(filename + `files/<name>.html` source pill + "N app tags / N modal ids / N
audited gaps" pills) followed by one `.evidence-wrap` div holding the actual
captured fragment DOM.

METHOD NOTE (evidence honesty): body starts at line 52 in every file; lines
1–51 are `<head>`/CSS. I extracted `NR>=52` slices to scratchpad and read each
fragment body in full (navbar 261 body-lines, navbars-room 206, subnavbar 271,
mixednavs 30, navfile 23). The raw `grep -oE` marker counts on the whole file
(e.g. `navbar=370`, `dropdown-menu=121`, `mainTabs=12`) are **CSS-rule matches
inside the Bootswatch `<style>`**, NOT DOM occurrences — I verified the real DOM
by reading the body slices, and cite body line numbers below.

All fragments are **raw DOM + inline styles** dumps with Angular `_ngcontent-*`
attribution attributes preserved — NOT computed-styles/rects JSON captures.
Two distinct Angular component ids appear: `_ngcontent-ng-c977335924` (the top
nav / `RoomTopNav`) and `_ngcontent-ng-c2028866615` (the presentation tab strip).

---

# navbar.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/navbar.html.html
- **kind**: html-dom-dump (fragment evidence page; head-CSS wrapped)
- **size**: 457,838 bytes (fragment body ≈ 11.5 KB; remainder is inlined Bootswatch CSS)
- **role**: n/a — shared app chrome (top navbar), no role-specific markers; banner declares source `files/navbar.html`, "0 app tags / 1 modal ids / 21 audited gaps"
- **format/quality**: raw DOM + inline styles, Angular `_ngcontent-ng-c977335924` on every node
- **surfaces documented**: full main top navigation bar — `<nav class="navbar navbar-expand-md navbar-dark fixed-top mainAppNav">` (body L9-11)
- **maps to (our components)**: `web/src/lib/components/RoomTopNav.svelte` — verified it already cites this fragment (`grep` hit: comments referencing `a.navbar-brand.ml-1.mr-auto`, `li.talkingIndicator`, `volumeControl`, `room-sound-options`, plus a `Reload` button at RoomTopNav L268)
- **key findings** (cited):
  - Left cluster (L14-38): `span.sidebar-menu` title="Open Sidebar" (`i.fas.fa-bars`); `span.users.ml-1.mr-1` title="Users Connected" (`i.fas.fa-user`); `span.fas.fa-mobile.mr-1.mobile-info-app-btn` title="Launch in Mobile App" → `data-bs-target="#mobileAppInfoModal"` (this is the "1 modal ids" the banner counts); `a.navbar-brand.ml-1.mr-auto` wrapping `img#cssLogo.brand-logo` alt="App Logo" `src="https://chat.protradingroom.com/var/www/uploads/8cb6ad5c3757766914222382a24b9d2a"` (L35-38).
  - Toggler (L39-50): `button.navbar-toggler.btnNavToggler` `data-bs-target="#navbarsRoom"` with `span.navbar-toggler-icon`.
  - Collapse `div#navbarsRoom.collapse.navbar-collapse` (L51-55) → `ul.navbar-nav.align-items-center.ml-auto` (L56-59). First item `li.nav-item.talkingIndicator.animated.fadeIn` renders literal idle text `( No one is speaking )` (L61-66).
  - Volume dropdown (L68-242): `li.nav-item.dropdown.dropstart` → toggle `a#dropdownVolume.nav-link` (`i.fas.fa-2x.fa-volume-up` + `span.ml-2.mainNavItem` "Volume"); panel `div.dropdown-menu.volumeControl` with `h4` "Volume" + float-right `i.fas.fa-times` close, `input[audiovolslider][type=range min=0 max=100].volCtrl`, `button.btn.btn-primary.btn-sm` "Mute", `hr`, `div.dropdown-divider`, then `div.room-sound-options`.
  - `room-sound-options` = exactly 6 `div.my-1` checkbox rows (L122-239): `alert-donot-disturb` "Alert sound", `qa-donot-disturb` "QA sound", `non-trade-donot-disturb` "NTA sound", `chat-donot-disturb` "Chat sound", `presentation-subtitles` "Subtitles" (with `i.fas.fa-closed-captioning`), `app-donot-disturb` "Don't Disturb" — each toggle text ends in a `<span>on</span>`. Last nav item `li.nav-item` title="Reload" → `a.nav-link` (`i.fas.fa-2x.fa-sync` + "Reload") (L243-255).
- **notes**: **SUPERSET** — this fragment contains `navbars-room.html`'s DOM verbatim (the `#navbarsRoom` collapse). Best authority for the complete top bar. No trade/badge/roster surfaces here.

---

# navbars-room.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/navbars-room.html.html
- **kind**: html-dom-dump (fragment evidence page)
- **size**: 455,264 bytes (fragment body ≈ 8.95 KB)
- **role**: n/a — shared chrome; banner: source `files/navbars-room.html`, "0 app tags / 1 modal ids / 14 audited gaps"
- **format/quality**: raw DOM + inline styles, `_ngcontent-ng-c977335924` (same component as navbar.html)
- **surfaces documented**: the collapsible right-hand nav group only — `div#navbarsRoom.collapse.navbar-collapse` (body L9-13)
- **maps to (our components)**: `web/src/lib/components/RoomTopNav.svelte` (same target as navbar.html — this is the collapse portion)
- **key findings** (cited):
  - Contents are byte-for-byte the inner `#navbarsRoom` of navbar.html: `ul.navbar-nav.align-items-center.ml-auto` (L14-16) → talkingIndicator "( No one is speaking )" (L19-24) → volume dropdown `li.nav-item.dropdown.dropstart` (L26-191) → Reload `li` (L192-201).
  - Same 6-checkbox `room-sound-options` (L74-189): alert/qa/non-trade/chat/presentation-subtitles/app-donot-disturb, identical names/labels to navbar.html.
  - Volume toggle `a#dropdownVolume` + panel `div.dropdown-menu.volumeControl` with `input.volCtrl[type=range 0-100]` and "Mute" `btn.btn-primary.btn-sm` (L27-70).
  - The banner's "1 modal ids" here is a false-positive from CSS/`#mobileAppInfoModal` reference elsewhere in the wrapper — no `data-bs-target="#mobileAppInfoModal"` node exists inside this fragment body (that node lives only in navbar.html's left cluster).
- **notes**: **SUBSET / DUPLICATE of navbar.html** — no brand logo, no toggler, no sidebar/users/mobile cluster. Prefer navbar.html as authority; keep this only to confirm the collapse boundary.

---

# subnavbar.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/subnavbar.html.html
- **kind**: html-dom-dump (fragment evidence page)
- **size**: 455,111 bytes (fragment body ≈ 8.8 KB)
- **role**: n/a — presentation-area tab strip, shared chrome; banner: source `files/subnavbar.html`, "0 app tags / 0 modal ids / 11 audited gaps"
- **format/quality**: raw DOM + inline styles, `_ngcontent-ng-c2028866615` (the tab-strip component — DIFFERENT from the navbar component id)
- **surfaces documented**: the presentation-area tab set — `ul#mainTabs.nav.nav-tabs.mainTabset` (body L9-14)
- **maps to (our components)**: `web/src/lib/components/MainStage.svelte` — verified via `grep` (only MainStage among stage components matches `Screens|fa-desktop|mainTabs|presAreaTabs`)
- **key findings** (cited):
  - Tab set `ul#mainTabs.nav.nav-tabs.mainTabset` contains 4 `li.nav-item` tabs (L15-114): **Screens** `a#screens-tab` `data-bs-target="#screens"` `.nav-link.active` `aria-selected="true"` (`i.fas.fa-desktop`); **Streams** `a#streams-tab` `data-bs-target="#streams"` on a `li[hidden]` (`i.fas.fa-podcast`, `aria-selected=false`); **Notes** `a#notes-tab` `data-bs-target="#notes"` `.nav-link.presAreaTabs-notes` with `i#noteChangeIndicator.fas.fa-edit`; **Files** `a` `data-bs-target="#files"` (`i.fas.fa-folder`).
  - Each tab label is `div.d-flex` → `i.fas.<icon>` + `span.ml-1`/`span.mx-1` text (Screens uses `ml-1`; Notes/Files use `mx-1` inside `d-flex.align-items-center`).
  - `<!---->` Angular comment placeholders sit between Notes and Files (L90) — indicates conditionally-rendered tabs omitted in this capture (honest gap: e.g. an Alerts/QA tab may be role-gated out).
  - **Capture contains duplicated/loose DOM**: after the first complete `ul#mainTabs` (L9-115), the wrap repeats a standalone `li` Notes (L117-140), a standalone `li[hidden]` Streams (L142-160), then an ENTIRE second copy of `ul#mainTabs` with Screens/Streams/Notes/Files (L162-268). Same content twice — the fragment file itself concatenated multiple snapshots.
- **notes**: Best authority for the presentation tab strip. `mixednavs.html`'s single Streams `li` is a subset of this. Duplication is an artifact of the dump, not two different tab sets.

---

# mixednavs.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/mixednavs.html.html
- **kind**: html-dom-dump (fragment evidence page)
- **size**: 447,325 bytes (fragment body ≈ 1.0 KB — smallest but for navfile)
- **role**: n/a; banner: source `files/mixednavs.html`, "0 app tags / 0 modal ids / 2 audited gaps"
- **format/quality**: raw DOM + inline styles, `_ngcontent-ng-c2028866615` (tab-strip component)
- **surfaces documented**: a single loose **Streams** tab list-item
- **maps to (our components)**: `web/src/lib/components/MainStage.svelte` (the Streams tab in the presentation tab set)
- **key findings** (cited):
  - Whole wrap is one node (body L9-27): `li.nav-item[role=presentation][hidden]` → `a#streams-tab` `data-bs-target="#streams"` `aria-controls="streams"` `aria-selected="false"` `.nav-link` `tabindex="-1"` → `div.d-flex` → `i.fas.fa-podcast` + `span.ml-1` "Streams".
  - The `hidden=""` attribute confirms Streams is present-but-hidden in the live room (matches its `[hidden]` state in subnavbar.html).
- **notes**: **SUBSET of subnavbar.html** — identical to the Streams `li` there. Despite the plural "mixednavs" filename, the captured body holds only the single hidden Streams item; no other nav is present (honest: name implies more than the DOM contains).

---

# navfile.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/navfile.html.html
- **kind**: html-dom-dump (fragment evidence page)
- **size**: 447,010 bytes (fragment body ≈ 0.7 KB — smallest)
- **role**: n/a; banner: source `files/navfile.html`, "0 app tags / 0 modal ids / 3 audited gaps"
- **format/quality**: raw DOM + inline styles, `_ngcontent-ng-c977335924` (navbar component id)
- **surfaces documented**: the mobile nav toggle button (hamburger)
- **maps to (our components)**: `web/src/lib/components/RoomTopNav.svelte` (the collapse toggler for `#navbarsRoom`)
- **key findings** (cited):
  - Whole wrap is one node (body L9-20): `button.navbar-toggler.btnNavToggler` `type="button"` `data-bs-toggle="collapse"` `data-bs-target="#navbarsRoom"` `aria-controls="navbarsRoom"` `aria-expanded="false"` `aria-label="Toggle navigation"` → `span.navbar-toggler-icon`.
  - Same toggler markup appears inside navbar.html (L39-50), confirming it is the navbar's collapse control extracted on its own.
- **notes**: **SUBSET of navbar.html**. Despite the "navfile" name there is no Files/file-manager content — it is purely the navbar toggler button (name is misleading).

---

## Cross-file summary
- Two component families: **top nav** (`_ngcontent-ng-c977335924`) → `navbar.html` (superset) ⊃ `navbars-room.html` (collapse only) and `navfile.html` (toggler only), all → `RoomTopNav.svelte`.
- **Presentation tab strip** (`_ngcontent-ng-c2028866615`) → `subnavbar.html` (full 4-tab set, best authority) ⊃ `mixednavs.html` (single hidden Streams tab), both → `MainStage.svelte`.
- No trade/alert/badge/roster/webcam surfaces in any of the five — these are pure navigation chrome fragments.
- All five are `.html` raw-DOM dumps (inline styles + Angular attrs), NOT computed-style JSON captures; for pixel-exact color/spacing on these, the corresponding JSON capture (e.g. the `volume-dropdown.json` referenced by RoomTopNav) is the higher authority.
