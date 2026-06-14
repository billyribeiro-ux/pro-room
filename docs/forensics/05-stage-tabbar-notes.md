# Forensic Dossier 05 — Stage / Presentation area + Screens·Notes·Files tabbar + Notes/Files panes

Surface owner: ScreenStage / MainStage tabbar / Notes pane / Files pane
Date: 2026-06-14 · Width: 1988px · Room: `aea3ca10-30b3-4b16-9763-2bab0a545a0d`
Verdict legend: ✅ match · ⚠️ minor/cosmetic delta · ❌ real delta · 🕳️ EVIDENCE GAP

---

## A. Scope & method

**In scope (our files):**
- `web/src/lib/components/MainStage.svelte` — the **Screens / Notes / Files** main tabbar + active-tab styling + pane switching + default active tab.
- `web/src/lib/components/ScreenStage.svelte` — the Screens pane: the "0 sharing" sub-bar (broadcast-tower antenna icon) + the two layout-toggle buttons (single/split).
- `web/src/lib/components/NotesPanel.svelte` — Notes pane internals (sub-tabs, head, download, body).
- `web/src/lib/components/FilesPanel.svelte` — Files pane internals (category sub-tabs, badges, search/refresh/upload, table).
- `web/src/lib/components/Icon.svelte` — FA5 glyph emitter.

**Evidence sources (hard):**
- `script-results/audit/tabbar.json` — PRIMARY computed styles for `#mainTabs` (Screens/Notes/Files) presenter+member. Active tab in ref = `a#notes-tab.nav-link.presAreaTabs-notes active`.
- `script-results/audit/notes.json` — computed styles for `#notesTabs` sub-tabset + `#notesTabsContent` + `#summernoteEdit…` note view.
- `script-results/audit/css-panes.txt` — pane CSS rules (`.mainTabset`, `.noteTabset`, `.files-tabs`, `.screens-tabs`, `.presentation-box`, `.noteOptions`, `.st-file*`).
- `docs/reference/captures/proroom-ultra-admin-room.json` → `.subtrees.presentation` (DOM tree), `.targeted[27]` (active notes-tab matchedRules), `.cssVariables.root` (token values).
- Live measurement: `web/scripts/stage-forensic.mjs` → `script-results/audit/_stage-ours.json` (presenter + member, with Notes/Files clicked).

**Method:** opened our live room as presenter and member at 1988px via `openRoom`; enumerated `.tabbar button[role=tab]` (text, active, rect, computed style, FA `::before` glyph codepoint); measured ScreenStage bar/count/toggles; clicked Notes and Files and measured their sub-tabs; screenshotted each into `docs/forensics/shots/05-*.png`. Diffed every visual prop against ref computed styles + resolved `cssVariables`. `pnpm --prefix web run check` = **0 errors / 0 warnings** (baseline clean).

**Resolved reference tokens (from `.cssVariables.root`):** `--tab-active-bg #45a2ff` · `--notes-tabs-bg #0c2434` · `--note-tabs-color #fff` · `--tabs-color #fff` · `--tabs-border-color #0a6db1` · `--presenter-area-bg #0f2e43` · `--navbar-bg #0c2434` · `--note-text-color #676767` · `--note-text-bg #fff` · `--note-download-bg #92d528` · `--note-delete-bg #bb352a` · `--file-download-bg #92d528` · `--file-delete-bg #bb352a` · `--reload-icon-color #45a2ff` · `--file-size-color #b2b2b2` · `--file-name-color #0a6db1` · `--app-font-family 'Open Sans', sans-serif`.

---

## B. Delta table

| # | Element | Our selector | Property | Ours | Ref | Δ | Evidence | Verdict |
|---|---------|--------------|----------|------|-----|---|----------|---------|
| 1 | **Default active main tab** | `MainStage.svelte:63 tab=$state('screens')` | which tab shown on load | **Screens** | **Notes** | YES | ref `a#notes-tab` has `.active`; `subtrees.presentation` shows `#notes.tab-pane.active.show`; tabbar.json #27. Ours `_stage-ours.json presenter__defaultActiveTab=Screens` | ❌ |
| 2 | Tab order/labels | `MainStage.svelte:71-75 TABS[]` | order | Screens, Notes, Files | Screens, Notes, Files | none | `subtrees.presentation` `#mainTabs` children; tabbar.json | ✅ |
| 3 | "Streams" tab present? | `MainStage.svelte` (none) | extra tab | absent | absent (in `#mainTabs`) | none | ref `#mainTabs` has only Screens/Notes/Files; `#streamsTabs` is a *Screens-pane sub-tabset*, not a main tab | ✅ |
| 4 | Screens tab icon | Icon `desktop` | FA glyph | `fa-desktop` U+F108 | `fas fa-desktop` U+F108 | none | tabbar.json:598 `content ""`; `_stage-ours.json` glyph U+F108 | ✅ |
| 5 | Notes tab icon | Icon `edit` | FA glyph | `fa-edit` U+F044 | `fas fa-edit` (`#noteChangeIndicator`) | none | `subtrees.presentation` `i#noteChangeIndicator.fas.fa-edit`; tabbar.json:709 `icon fas fa-edit` | ✅ |
| 6 | Files tab icon | Icon `folder` | FA glyph | `fa-folder` U+F07B | `fas fa-folder` | none | tabbar.json:1204; `subtrees` `i.fas.fa-folder` | ✅ |
| 7 | Tab icon font/size/weight | Icon size 12 | font / size / weight | FA5 Free / 12px / 900 | FA5 Free / 12px / 900 | none | tabbar.json:560-564; `_stage-ours.json` iconFont/iconSize/iconWt | ✅ |
| 8 | Idle tab color | `MainStage.svelte:163` | color | `#ccc` rgb(204,204,204) | rgb(204,204,204) | none | tabbar.json:264 (#screens-tab); ours measured | ✅ |
| 9 | Idle tab padding/margin | `MainStage.svelte:168-169` | padding / margin | 8px / 5px | 8px / 5px | none | tabbar.json:232-239; `.mainTabset .nav-link {padding:.5rem;margin:5px}` | ✅ |
| 10 | Idle tab radius | `MainStage.svelte:172` | top radius | 6px 6px 0 0 | 6px (`#screens-tab` TL/TR) | none | tabbar.json:249-250; ours measured radTL/TR=6px | ✅ |
| 11 | Active tab bg | `MainStage.svelte:192 var(--bg)` | background | `#0c2434` rgb(12,36,52) | rgb(12,36,52) | none | tabbar.json:859; targeted[27] `.presAreaTabs-notes.active{bg:var(--notes-tabs-bg)}`=#0c2434 | ✅ |
| 12 | Active tab color | `MainStage.svelte:189` | color | `#fff` | rgb(255,255,255) | none | tabbar.json:865; `--note-tabs-color #fff` | ✅ |
| 13 | Active tab top border | `MainStage.svelte:198` | border-top | 1px solid #0a6db1 | 1px solid rgb(10,109,177) | none | tabbar.json:841-845; ours measured `1px solid rgb(10,109,177)` | ✅ |
| 14 | Active tab bottom border | `MainStage.svelte:199` | border-bottom-width | 0 | 0 | none | tabbar.json:843; `.presAreaTabs-notes.active{border-bottom:transparent}` | ✅ |
| 15 | Active tab radius | `MainStage.svelte:195` | radius | 3px 3px 0 0 | 3px 3px 0 0 | none | tabbar.json:850-853; css-panes `.presAreaTabs-notes.active{border-radius:3px 3px 0 0}` | ✅ |
| 16 | Active tab pad-bottom | `MainStage.svelte:202` | padding-bottom | 15px | 15px | none | tabbar.json:839; css-panes `padding-bottom:15px` | ✅ |
| 17 | Active tab margin-bottom | `MainStage.svelte:204` | margin-bottom | -1px | -1px | none | tabbar.json:833 marginBottom -1px; css-panes `margin-bottom:-1px` | ✅ |
| 18 | Tabbar container layout | `MainStage.svelte:140-141` | align/justify | center / center | center / center | none | tabbar.json:81-82 (#mainTabs); css-panes `.mainTabset{align-items:center;justify-content:center}` | ✅ |
| 19 | Tabbar font-family | inherited | declared stack | `"Open Sans", Lato, …` | `"Open Sans", sans-serif` | stack tail differs | tabbar.json:66; ours measured. Both resolve Open Sans first → identical render | ⚠️ |
| 20 | "X sharing" bar bg | `ScreenStage.svelte:94` | background | `#0c2434` | `#0c2434` (`.screens-tabs{bg:var(--notes-tabs-bg)}`) | none | css-panes; ours measured rgb(12,36,52) | ✅ |
| 21 | "X sharing" bar border-bottom | `ScreenStage.svelte:95` | border-bottom | 1px transparent | (`.screens-tabs` border transparent) | none | css-panes `.screens-tabs{border-color:transparent}` | ✅ |
| 22 | "sharing" count icon | `ScreenStage.svelte:36` Icon `broadcast-tower` 14 | FA glyph / size | `fa-broadcast-tower` U+F519 / 14px / wt900 | — (not in capture) | unverifiable | glyph valid in FA5 Free 5.8.1; ref Screens pane not revealed | 🕳️ |
| 23 | "sharing" count color/size | `ScreenStage.svelte:101-104` | color / font-size | #fff / 12px / lh12px | #fff / 12px (`.screens-tabs .nav-link`) | none on tokens | css-panes `.screens-tabs .nav-link{color:var(--tabs-color);font-size:12px;line-height:12px}` | ✅ (token) |
| 24 | Layout toggle btn padding | `ScreenStage.svelte:118` | padding | 4px | 4px | none | css-panes `.screens-tabs .nav-link{padding:4px}` | ✅ (token) |
| 25 | Layout toggle active bg | `ScreenStage.svelte:128` | background | `#45a2ff` | `#45a2ff` (`.screens-tabs .nav-link.active{bg:var(--tab-active-bg)}`) | none on token | css-panes; ours measured rgb(69,162,255) | ✅ (token) |
| 26 | Layout toggle hover border | `ScreenStage.svelte:122` | border | 1px #0a6db1 | 1px var(--tabs-border-color)=#0a6db1 | none | css-panes `.screens-tabs .nav-link:hover{border:1px solid var(--tabs-border-color)}` | ✅ (token) |
| 27 | Layout toggle icons (single/split) | `ScreenStage.svelte:41,49` `square`/`columns` | which glyphs | `fa-square` U+F0C8 / `fa-columns` U+F0DB | — (not in capture) | unverifiable | ref Screens pane never revealed; can't confirm ref uses these glyphs | 🕳️ |
| 28 | Layout toggle btn size | computed | w×h | 24×26px | — | unverifiable | no ref | 🕳️ |
| 29 | Notes pane bg | `NotesPanel.svelte:252` | background | `#ffffff` | `#fff` (`--note-text-bg`) | none | notes.json `#summernoteEdit` on white; `--note-text-bg #fff` | ✅ |
| 30 | Notes body text color | `NotesPanel.svelte:253` | color | `#1f2430` | `#676767` (`--note-text-color`) | YES | notes.json:957 `color rgb(103,103,103)`; ours #1f2430 | ❌ |
| 31 | Notes sub-tabs bg | `NotesPanel.svelte:260` | background | `#0c2434` | rgb(12,36,52) | none | notes.json:159 (#notesTabs); `.noteTabset{bg:var(--notes-tabs-bg)}` | ✅ |
| 32 | Notes sub-tabs border-top | `NotesPanel.svelte:261` | border-top | 1px #0a6db1 | 1px rgb(10,109,177) | none | notes.json:141-145; css-panes `.noteTabset{border-top:1px solid var(--tabs-border-color)}` | ✅ |
| 33 | Notes sub-tab btn color/size/pad | `NotesPanel.svelte:271-276` | color/size/pad | #fff / 12px / 8px | #fff / 12px / .5rem | none | css-panes `.noteTabset .nav-link{padding:.5rem;font-size:12px;color:var(--tabs-color)}` | ✅ |
| 34 | Notes sub-tab active bg | `NotesPanel.svelte:280` | background | `#45a2ff` | `#45a2ff` (`.noteTabset .nav-link.active{bg:var(--tab-active-bg)}`) | none | css-panes; code-verified (no live notes data to measure) | ✅ (code) |
| 35 | Notes first sub-tab icon | `NotesPanel.svelte:172` Icon `home` | first tab glyph | `fa-home` | `fas fa-home` (Welcome tab) | none | `subtrees.presentation` `i.fas.fa-home` on first notesTab; notes.json:208 icon fa-home | ✅ |
| 36 | Notes other sub-tab icon | `NotesPanel.svelte:173` Icon `pen` | non-first glyph | `fa-pen` | `fas fa-pen mx-1` | none | notes.json:307 `icon fas fa-pen mx-1` | ✅ |
| 37 | Note download btn bg | `NotesPanel.svelte:349` | background | `#92d528` | `#92d528` (`.noteDownload{bg:var(--note-download-bg)}`) | none | css-panes `.noteOptions .noteDownload`; not live-measured (empty) | ✅ (code) |
| 38 | Note download icon | `NotesPanel.svelte:223` Icon `download` 15 | glyph | `fa-download` | `fas fa-download.mr-2` | none | `subtrees.presentation` `i.fas.fa-download.mr-2` | ✅ |
| 39 | Files sub-tabs bg | `FilesPanel.svelte:267` | background | `#0c2434` | `#0c2434` (`.files-tabs{bg:var(--notes-tabs-bg)}`) | none | css-panes; ours measured rgb(12,36,52) | ✅ |
| 40 | Files sub-tab pad/margin/size | `FilesPanel.svelte:282-283` | padding/margin/size | 5px 10px / 5px / 12px | 5px 10px / 5px / 12px | none | css-panes `.files-tabs .nav-link{padding:5px 10px;margin:5px;font-size:12px}` | ✅ |
| 41 | Files sub-tab active bg | `FilesPanel.svelte:289` | background | `#45a2ff` | `#45a2ff` | none | css-panes `.files-tabs .nav-link.active{bg:var(--tab-active-bg)}`; ours measured | ✅ |
| 42 | Files badge bg/color | `FilesPanel.svelte:305-308` | background/color | `#dc3545` / #fff | `bg-danger` #dc3545 (`files-badge`, text "0") | none | targeted[32] `badge rounded-pill bg-danger files-badge` text 0; ours measured rgb(220,53,69) | ✅ |
| 43 | Files tabs centered + tools right | `FilesPanel.svelte:262,319` | layout | center + abs-right tools | center (`.files-tabs{justify-content:center}`) | none | css-panes; screenshot 05-files.png | ✅ |
| 44 | Files refresh icon color | `FilesPanel.svelte:350` | color | `#45a2ff` | `#45a2ff` (`--reload-icon-color`) | none | cssVariables `--reload-icon-color #45a2ff` | ✅ |
| 45 | Files upload btn bg | `FilesPanel.svelte:369` | background | `#45a2ff` | `--tab-active-bg #45a2ff` | none | ours measured rgb(69,162,255) | ✅ |
| 46 | Files size col color | `FilesPanel.svelte:417` | color | `#b2b2b2` | `#b2b2b2` (`--file-size-color`) | none | cssVariables `--file-size-color`; css-panes `.st-fileSize` | ✅ |
| 47 | Files download btn bg/width | `FilesPanel.svelte:453,458` | background/width | `#92d528` / 120px | `#92d528` / 120px | none | css-panes `a.st-fileDownload{bg:var(--file-download-bg)}`, `.fileDownload{width:120px}` | ✅ |
| 48 | Files row table (NAME/SIZE/DATE) | `FilesPanel.svelte:195-240` | table internals | custom `<table>` | — (Files pane not revealed) | unverifiable | ref `#myTab`/files pane not auto-expanded in capture | 🕳️ |

---

## C. Structural / behavioural findings (our file:line)

1. **Default active tab is Screens, not Notes (real delta).** `MainStage.svelte:63` `let tab = $state<Tab>('screens')`. The reference room loads with the **Notes** main tab active: `targeted[27] a#notes-tab` carries `.active`, and `subtrees.presentation` renders `div#notes.tab-pane.active.show` as the visible default pane. Our live capture (`_stage-ours.json`) shows `presenter__defaultActiveTab = Screens` and `member__defaultActiveTab = Screens`. → Flag confirmed. Fix is a one-line state change (see F-1), subject to the caveat that our app additionally has a presenter "screen lock" feature (`MainStage.svelte:66-69`) that *forces* Screens when locked — the default should be Notes only when **not** locked.

2. **Tab set matches; no Streams main tab.** `MainStage.svelte:71-75` defines exactly Screens/Notes/Files in that order. The reference `#mainTabs` (`subtrees.presentation`) has the same three. The capture's `#streamsTabs` (`targeted[23]`) is a **sub-tabset inside the Screens pane**, not a top-level tab — so omitting a "Streams" main tab is correct, and `MainStage.svelte:38-42` documents this deliberately. ✅

3. **Active-tab folder shape is faithfully reproduced.** Our `.tabbar button.active` (`MainStage.svelte:187-205`) reproduces the reference `.mainTabset .presAreaTabs-notes.active` override exactly: bg #0c2434 (NOT the accent #45a2ff that idle-style `.nav-link.active` would give), 1px #0a6db1 top/side border, 0 bottom border, 3px 3px 0 0 radius, 15px bottom padding, −1px bottom margin. Every value cross-checked against tabbar.json #27 computed + css-panes matchedRules. ✅

4. **"0 sharing" bar + layout toggles exist and render** (screenshot `05-stage-presenter.png`): broadcast-tower antenna icon + "0 sharing" text left, two #45a2ff square/columns buttons top-right. `ScreenStage.svelte:33-52`. Token-level styling (`.screens-tabs` bg #0c2434, `.nav-link` 4px padding, `.active` #45a2ff, hover #0a6db1) matches css-panes — but the **reference DOM for this pane was never captured** (Screens is the inactive tab), so the specific antenna-icon size, the exact toggle glyphs, and button dimensions are unverifiable (see E).

5. **Notes body text color delta.** `NotesPanel.svelte:253` sets the note view text to `#1f2430`; reference note view text is `#676767` (`--note-text-color`, notes.json:957 `rgb(103,103,103)`). White background is correct; only the body text tone differs. (F-2)

6. **Notes/Files panes are data-empty in our environment.** Our local API returns zero notes and zero files, so the live capture hit the empty states ("No notes yet…", "No files in this category yet."). Sub-tab *active* styling, the note head/h3/download button, and the file rows could only be **code-verified**, not pixel-measured. The reference room is fully populated (6 notes incl. "Welcome", JC's Daily Briefing, etc.). This is a data difference, not a UI delta — flagged so a re-run with seeded data can pixel-confirm rows 34/37/48.

---

## D. Screenshots

All at 1988px, presenter unless noted, clipped to the `.main-stage` region (`docs/forensics/shots/`):
- `05-stage-presenter.png` — Screens tab active (delta #1), "0 sharing" bar + antenna + 2 blue layout toggles, "Connecting…" empty stage.
- `05-stage-member.png` — same surface as member (capabilities downgraded); identical default Screens-active layout.
- `05-notes.png` — Notes tab clicked: white pane, #0c2434 sub-tab bar with "+ New note", empty state.
- `05-files.png` — Files tab clicked: centered Files/Images/Sounds tabs (active #45a2ff, red #dc3545 badges), right-side search/refresh/upload, NAME/SIZE/DATE table header, empty state.

---

## E. EVIDENCE GAPS

- 🕳️ **Screens active-pane internals (KNOWN GAP, stated explicitly).** The reference captures only auto-revealed the **Notes** tab. The Screens pane DOM (its `#screenTabs`/`#streamsTabs` content, the live "X sharing" sub-bar, the layout-toggle buttons) was never rendered into `subtrees.presentation` or `targeted`. String search of the whole capture confirms: `fa-broadcast-tower`, `fa-square`, `fa-columns`, `fa-clone`, `fa-th`, `fa-rss` appear **only** as FA stylesheet glyph definitions (never as DOM nodes); "sharing" appears only inside note hyperlink URLs; "layout" only on a settings checkbox. → Our broadcast-tower antenna icon (rows 22), the specific toggle glyphs square/columns (row 27), and the toggle button dimensions (row 28) cannot be pixel-matched. Only the `.screens-tabs` *container/nav-link tokens* (css-panes) are confirmed.
- 🕳️ **Files active-pane internals (row 48).** The Files pane (`#myTab` content / file rows) was likewise not auto-expanded; the reference file-row table layout, thumbnails, and column widths beyond the documented tokens (`.st-fileDownload` width 120px, `.st-fileSize` #b2b2b2, all-12px font) cannot be verified.
- 🕳️ **Empty-data states.** Local API has 0 notes / 0 files, so the Notes sub-tab active pill, note head/download button, and file rows were code-verified only (rows 34, 37, 48). Re-run with seeded room data to pixel-confirm.
- 🕳️ **Notes sub-tab badge.** Reference first notes sub-tab ("Welcome") carries a green `badge.badge-success` (`subtrees.presentation`). Our `NotesPanel.svelte` renders no per-note badge — but this is keyed to note state/data we don't have, so it's a gap, not a confirmed miss.

---

## F. Prioritized fix list (DO NOT IMPLEMENT — reference numbers from §B)

| P | File:line | Exact change | Ref |
|---|-----------|--------------|-----|
| **P0** | `web/src/lib/components/MainStage.svelte:63` | Change default to Notes while preserving the screen-lock force-to-Screens: `let tab = $state<Tab>('notes');` (keep `activeTab = $derived(locked ? 'screens' : tab)` at :69 so a locked room still pins Screens). Verify the member/presenter unlocked default then renders Notes. | B-1 (`targeted[27].active`, `subtrees.presentation #notes.tab-pane.active.show`) |
| **P2** | `web/src/lib/components/NotesPanel.svelte:253` | Change note pane text color `#1f2430` → `#676767` to match `--note-text-color`. (Body link color #45a2ff already correct.) | B-30 (notes.json:957 rgb(103,103,103)) |
| **P3** | `web/src/lib/components/MainStage.svelte:164` (and ScreenStage/Notes/Files font inheritance) | Tabbar font stack inherits app stack `"Open Sans", Lato, …`; ref declares `"Open Sans", sans-serif`. Cosmetic only — render is identical (Open Sans wins). Optionally align the declared stack if a byte-exact match is required. | B-19 (tabbar.json:66) |
| **P3 (verify, not fix)** | — | Re-run `web/scripts/stage-forensic.mjs` against a room seeded with notes+files to pixel-confirm B-34 (notes active pill #45a2ff), B-37 (note download #92d528), B-48 (file rows), and to check the green "Welcome" `badge-success` (E). | E |

**No changes warranted** for tab order/labels, icons/glyphs, active-tab folder geometry, "0 sharing" bar tokens, layout-toggle tokens, Files sub-tabs/badges/upload/download — all ✅ against hard evidence.
