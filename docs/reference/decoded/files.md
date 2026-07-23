# Files

The `#files` pane is the "Files" tab of the presentation-area right panel (`app-presentationarea`, component const set at `main.d6f5272aa3783e43.js` offset `1991543`, template render fn beginning `template:function(i,o){1&i&&(d(0,"div",2)…` at ~`1993500`). It is one of the main presentation-area tabs (Screens / Streams / Notes / Files / …). Inside it are three sub-tabs (Files / Images / Sounds), a search bar, a Refresh (and, for presenters, Delete-Selected / Upload / Stop-For-All) button cluster, and a striped table of file rows. A single shared `<audio id="mp3player">` element (sibling of the pane) plays Sounds-tab files.

IMPORTANT — evidence note: the room's default active main tab is Screens (`selectedMainTab="presAreaTabs-screens"`, constructor at `main…` ~`1950900`). The `#files` panel carries a `hidden` ngClass binding (`H("hidden",o.hideFiles)`) and none of the three capture JSONs (admin/member/presenter) contain any files-pane element (verified: `fileHits=0` in `proroom-all-admin.json`, `proroom-full-member.json`, `proroom-full-presenter.json`). Therefore every value below is resolved from **template attrs (bundle) + scoped CSS (bundle) + global CSS (styles.css)**, not from captured computed styles. The one live-DOM render available is the static markup in `mixed-files/as-splitter.html` (lines 12983–13120), captured with an empty file list (all three badges = `0`, no `<tr>` rows). Row-level markup below is reconstructed from the compiled template functions, which is the authoritative source for row structure.

---

## DOM structure

Literal tree of `#files` (from `mixed-files/as-splitter.html` lines 12983–13119 for the container/tabs/searchbar/refresh, and from the compiled template functions `qwe`/`Kwe`/`Ywe` in `main.d6f5272aa3783e43.js` for the table rows). `_ngcontent-ng-c2028866615` is the live scoping attribute; consts are the numeric-indexed attrs arrays parsed from the component `consts:[…]` array (offset `1991543`, 286 entries).

```
div#files.tab-pane.fade  [role=tabpanel, aria-labelledby="files-tab", ngClass, hidden]   (const 31 in template; as-splitter L12983)
├── ul#myTab.nav.nav-tabs.files-tabs.d-flex.justify-content-center  [role=tablist]        (const 30; L12990)
│   ├── li.nav-item [role=presentation]  (click → onFileTabChange('files'))              (const 31; L12996)
│   │   └── a#files-tab.nav-link.d-flex.align-items-center.justify-content-between.active
│   │         [data-bs-toggle=tab, role=tab, aria-controls=files, aria-selected=true, ngClass]  (const 32; L13001)
│   │       ├── span "Files"
│   │       └── span.badge.rounded-pill.bg-danger.files-badge  → {{ files count }}         (const 33; L13011)
│   ├── li.nav-item (click → onFileTabChange('images'))
│   │   └── a#image-tab.nav-link…  [aria-controls=image, aria-selected=false]  (const 34)
│   │       ├── span "Images"
│   │       └── span.badge.rounded-pill.bg-danger.files-badge  → {{ images count }}
│   └── li.nav-item (click → onFileTabChange('sounds'))
│       └── a#sounds-tab.nav-link…  [aria-controls=sounds, aria-selected=false]  (const 35)
│           ├── span "Sounds"
│           └── span.badge.rounded-pill.bg-danger.files-badge  → {{ sounds count }}
├── div.mt-3.mb-3.text-center.d-flex.flex-wrap.justify-content-center.align-items-center.w-75.m-auto  (const 36; L13063)
│   ├── div.flex-fill.mb-1                                                                 (const 37)
│   │   └── div.input-group.st-searchbar                                                   (const 38; L13071)
│   │       ├── input.form-control  [type=text, placeholder="Search files...",
│   │       │     aria-label=search, aria-describedby=addon-wrapping, ngModel=filesSearch] (const 39; L13075)
│   │       └── span#basic-addon1.input-group-text.st-searchbar-icon.btn.btn-outline-secondary  (const 40; L13082)
│   │           └── i.fas.fa-search                                                        (const 41; L13086)
│   ├── div.d-flex.flex-wrap.justify-content-center.align-items-center.ml-2                (const 42; L13093)
│   │   ├── [PRESENTER-ONLY] button.btn.m-2.st-fileDeleteSelected  [title="Delete Selected"]  (const 43, fn Rwe, gated *ngIf isP)
│   │   │       → <i class="fas fa-check mr-2"></i> "Delete Selected "
│   │   ├── button.btn.mt-2.mr-2.mb-2.st-fileSeeMore  [title="Reload list"]  (click → getSessionFiles())  (const 44, fn in main template; L13097)
│   │   │       → "Refresh" <i class="fas fa-sync ml-2"></i>
│   │   └── [PRESENTER-ONLY] button.btn.btn-secondary.mt-2.mr-2.mb-2.st-fileUpload  [title="Upload New File"]  (const 46, fn Iwe, click → newFile())
│   │           → <i class="fas fa-plus"></i> " Upload File "     (icon const 59 = fa-plus)
│   ├── div  (const=[])
│   │   └── [PRESENTER-ONLY] button.btn.ml-2.st-fileDelete  [type=button, title="Stop For All"]  (const 47, fn Owe, click → stopMp3ForAll())
│   │           → <i class="fas fa-stop"></i> "Stop Playing For All "   (icon const 158 = fa-stop)
├── [EMPTY STATE] h4.mt-4.text-center  "No room files found."   (const 48, fn Nwe; shown when list empty)
└── [TABLE] table.table.table-striped.m-auto.w-100.mt-3.st-fileTable   (const 49, fn Ywe)
    └── tbody#filesDriveList        (const 243)
        └── *ngFor tr  (fn Kwe, filtered by `filter` pipe on sessionFiles/filesSearch and by selectedFileTab vs contentType)
            └── (row cells, fn qwe, 24 nodes / 17 bindings):
                ├── [PRESENTER-ONLY] td > input[type=checkbox]  [value=file._id]   (const 256, fn Lwe, gated isP)
                ├── td
                │   └── div.d-flex.flex-column                                    (const 244)
                │       ├── div
                │       │   ├── span.st-fileName            → {{ file.name }}       (const 245)
                │       │   └── span.st-fileSize.ml-2       → {{ round(file.size/1024) }}"Kb"  (const 246)
                │       ├── div.st-fileName
                │       │   └── i (italic)  → {{ file.created | date:'medium' }}   (unclassed <i>, const 245 wrapper)
                │       └── [IMAGES] a[target=_blank, href=file.vidPath, type, download]   (const 247, fn Bwe, *ngIf contentType~image/)
                │             └── img.fileDriveImg [alt="Image", src=file.vidPath, style="background-color:#000"]  (const 257)
                └── td
                    └── div.d-flex.justify-content-center.align-items-center.flex-wrap  (const 248)
                        ├── [NON-IMAGE] a.fileDowload  [href=file.vidPath, type, download]  (const 249, fn Uwe, *ngIf NOT image/) — hidden/bare anchor, no visible text
                        ├── a.btn.st-fileDownload  [title="Download File", target=_blank, href, type, download]  (const 250)
                        │       → <i class="fas fa-download mr-2"></i> "Download "   (icon const 135 = fa-download mr-2)
                        ├── [PRESENTER-ONLY] button.btn.ml-2.st-fileDelete  [type=button, title="Delete File"]  (const 258, fn jwe, click → deleteFile(name,_id))
                        │       → <i class="fas fa-trash"></i> "Delete "     (icon const 145)
                        ├── [PRESENTER + audio/] button.btn.ml-2.st-fileDownload.btn-success  [title="Play"]  (const 259, fn $we, click → playMp3ForMe(file))
                        │       → toggles <span><i fa-stop>"Stop "</span> (fn Vwe) / <span><i fa-play/fa-stop>"Play "</span> (fn Hwe)
                        ├── [PRESENTER + audio/] button.btn.ml-2.st-fileDelete  [type=button, title="Play For All"]  (const 260, fn zwe, click → playMp3ForAll(vidPath))
                        │       → <i class="fas fa-…"></i> "Play For All "
                        ├── [PRESENTER + audio/ + not-overwritten] button.btn.ml-2.btn-info.set-alert-sound-btn  [title="Overwrite Cash Register Sound"]  (const 261, fn Gwe)
                        │       → <i class="fa fa-bell mr-2"></i> …
                        └── [PRESENTER + audio/ + overwritten] button.btn.ml-2.btn-info.set-alert-sound-btn  [title="Remove Overwrited Cash Register Sound"]  (const 255→click variant, fn Wwe)
```

Sibling of `#files` panel (outside it, inside `app-presentationarea`), as-splitter L13113:
```
audio#mp3player  [autoplay=autoplay, src=""]   (const 52; src bound to file.vidPath on play)
```

### Role variants
- **Member (non-presenter, `isP === false`)** — the room's user is member-only per project memory. Renders ONLY: the three sub-tabs + badges, the search bar + icon, the `st-fileSeeMore` Refresh button, and per row: `st-fileName` / `st-fileSize` / italic `created` date / the `st-fileDownload` "Download" button (and, for images, the inline `fileDriveImg` thumbnail; for non-images the bare `fileDowload` anchor). No checkbox column, no Delete/Upload/Stop-For-All/Play-For-All/Overwrite controls.
- **Presenter / staff (`isP === true`)** — additionally: leading `<td>` checkbox per row (const 256), `st-fileDeleteSelected` "Delete Selected" (const 43), `st-fileUpload` "Upload File" (const 46), `st-fileDelete` "Stop For All" (const 47) in the toolbar, and per row Delete/Play/Play-For-All/Overwrite-Cash-Register controls (audio-only for the play/overwrite set). Gating source: `O(0,i.isP?0:-1)` and the `i.isP && contentType.indexOf("audio/")>=0` conditions in fn `qwe`.

---

## Scoped CSS (verbatim)

Extracted from `main.d6f5272aa3783e43.js` (Angular component styles, written with the `[_ngcontent-%COMP%]` placeholder — the live scope attr on this component is `_ngcontent-ng-c2028866615`). **Verified exhaustively: NO CSS rule exists for any `st-*` class** — `st-searchbar`, `st-searchbar-icon`, `st-fileSeeMore`, `st-fileTable`, `st-fileName`, `st-fileSize`, `st-fileDownload`, `fileDowload`, `st-fileUpload`, `st-fileDelete`, `st-fileDeleteSelected`, `files-tabs` all return 0 CSS matches (regex `\.<class>[\[{ :,]` over the whole bundle). Those are behavioral/semantic hook classes only; visual styling comes from the older `.file*`/`.files-*` rules below plus global Bootstrap.

Rules that affect this surface (from CSS block ~`2015800`–`2018200` and the `.files-options`/`.files-search`/`.fileActions` rule):

```css
#files[_ngcontent-%COMP%]{overflow:auto;height:calc(100% - 40px)}
.files-badge[_ngcontent-%COMP%]{margin-top:-9px;margin-left:3px}
.fileDriveImg[_ngcontent-%COMP%]{max-width:200px}
.fileDownload[_ngcontent-%COMP%]{width:120px}
.fileName[_ngcontent-%COMP%]{word-break:break-all}
.files-options[_ngcontent-%COMP%]   button[_ngcontent-%COMP%], .files-search[_ngcontent-%COMP%]   .form-control[_ngcontent-%COMP%], .fileName[_ngcontent-%COMP%], .fileDownload[_ngcontent-%COMP%], .fileActions[_ngcontent-%COMP%]{font-size:12px}
.files-options[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{padding:5px}
.fileCount[_ngcontent-%COMP%]{font-size:18px}
.hidden[_ngcontent-%COMP%]{display:none}
```

Note the naming mismatch: the current build's **template** emits `st-fileName` / `st-fileDownload` (const 245 / const 250), but the scoped **CSS** targets the legacy unprefixed `.fileName` / `.fileDownload`. Since the DOM elements carry `st-fileName`/`st-fileDownload` (NOT `fileName`/`fileDownload`), the `.fileName{word-break}`, `.fileDownload{width:120px}`, and the shared `font-size:12px` rule **do not match any current-build element** and have no effect. Likewise `.files-options button`, `.files-search .form-control`, `.fileActions` target classes not present in the current template (the toolbar is `.d-flex.flex-wrap…`, not `.files-options`). The only scoped rules that DO match current markup are `#files{…}`, `.files-badge{…}`, `.fileDriveImg{…}`, and `.hidden{…}`.

---

## Global CSS (verbatim)

From `styles.d622cb9ed2bbc221.css`. Where BS4 (Darkly) and BS5 both define a rule, both are shown with byte offsets; BS5 loads **later** (higher offset) and wins on equal specificity.

Sub-tabs (`.nav-tabs`, `.nav-link`):
```css
/* BS4 @61949/62113/62485 */
.nav-link{display:block;padding:.5rem 2rem}
.nav-tabs{border-bottom:1px solid #444}
.nav-tabs .nav-link{border:1px solid transparent;border-top-left-radius:.25rem;border-top-right-radius:.25rem}
.nav-tabs .nav-link.active,.nav-tabs .nav-item.show .nav-link{color:#fff;background-color:#222;border-color:#444 #444 transparent}
/* Darkly override @135212 */
.nav-tabs .nav-link.active,.nav-tabs .nav-link.active:focus,.nav-tabs .nav-link.active:hover,…{ /* active tab styling */ }
/* BS5 @208862/209422/209830 (wins on tie) */
.nav-tabs{--bs-nav-tabs-border-width:…;--bs-nav-tabs-border-color:var(--bs-border-color);…}
.nav-tabs .nav-link.active{color:var(--bs-nav-tabs-link-active-color);background-color:var(--bs-nav-tabs-link-active-bg);border-color:var(--bs-nav-tabs-link-active-border-color)}
```

Badge (`.badge.rounded-pill.bg-danger`):
```css
.badge{display:inline-block;padding:.25em .4em;font-size:75%;font-weight:700;line-height:1;text-align:center;white-space:nowrap;vertical-align:baseline;border-radius:.25rem;transition:…}   /* @74230 */
.badge{transition:none}                          /* @74569 */
.badge{border:1px solid #000}                    /* @132645 */
.rounded-pill{border-radius:50rem!important}     /* BS4 @99595 */
.rounded-pill{border-radius:var(--bs-border-radius-pill)!important}  /* BS5 @316192 (wins) */
.bg-danger{background-color:#e74c3c!important}   /* BS4 @97759 */
.bg-danger{--bs-bg-opacity:1;background-color:rgba(var(--bs-danger-rgb),var(--bs-bg-opacity))!important}  /* BS5 @313702 (wins) */
```

Search bar (`.input-group`, `.form-control`, `.input-group-text`, `.btn-outline-secondary`):
```css
.input-group{position:relative;display:flex;flex-wrap:wrap;align-items:stretch;width:100%}   /* @178499 */
.input-group>.form-control,…{position:relative;flex:1 1 auto;width:1%;margin-bottom:0}        /* @48631 */
.form-control{display:block;width:100%;height:calc(1.5em + .75rem + 2px);padding:.375rem .75rem;font-size:.9375rem;font-weight:400;line-height:1.5;color:#444;background-color:#fff;background-clip:padding-box;border:1px solid …}  /* BS4 @18971 */
.form-control{transition:none}                   /* @19338 */
.input-group-text{display:flex;align-items:center;padding:.375rem .75rem;margin-bottom:0;font-size:.9375rem;font-weight:400;line-height:1.5;color:#adb5bd;text-align:center;white-space:nowrap;background-color:#444;border:1px solid transparent;border-radius:.25rem}  /* BS4 @ input-group-text */
.input-group-text{display:flex;align-items:center;padding:.375rem .75rem;font-size:1rem;…;color:var(--bs-body-color);…;background-color:var(--bs-tertiary-bg);border:var(--bs-border-width) solid var(--bs-border-color);border-radius:var(--bs-border-radius)}  /* BS5 (wins on tie) */
.btn-outline-secondary{color:#444;border-color:#444}                          /* BS4 @37930 */
.btn-outline-secondary:hover{color:#fff;background-color:#444;border-color:#444}  /* BS4 @37982 */
.btn-outline-secondary{--bs-btn-color:#6c757d;--bs-btn-border-color:#6c757d;--bs-btn-hover-color:#fff;--bs-btn-hover-bg:#6c757d;…}  /* BS5 @194438 (wins) */
```

Buttons:
```css
.btn{display:inline-block;font-weight:400;color:#fff;text-align:center;vertical-align:middle;user-select:none;background-color:transparent;border:1px solid transparent;padding:.375rem .75rem;font-size:.9375rem;line-height:1.5;border-radius:.25rem;transition:…}   /* BS4 @31035 */
.btn{transition:none}                                            /* @31473 */
.btn-secondary{color:#fff;background-color:#444;border-color:#444}   /* BS4 @32398 */  (BS5 @190790 → --bs-btn-bg:#6c757d, wins)
.btn-success{color:#fff;background-color:#00bc8c;border-color:#00bc8c}  /* BS4 @33106 */  (BS5 @191248 → #198754, wins)
.btn-info{color:#fff;background-color:#3498db;border-color:#3498db}    /* BS4 @33802 */  (BS5 @191703 → #0dcaf0, wins)
```

Table (`.table.table-striped.m-auto.w-100.mt-3`):
```css
.table{width:100%;margin-bottom:1rem;color:#fff}                 /* BS4 @14188 */
.table th,.table td{padding:.75rem;vertical-align:top;border-top:1px solid #444}
.table thead th{vertical-align:bottom;border-bottom:2px solid #444}
.table{border-collapse:collapse!important}                       /* @132674 (Darkly print/override) */
.table{--bs-table-color-type:initial;--bs-table-bg-type:initial;…}  /* BS5 @159542 */
/* --- STRIPING (three competing rules) --- */
.table-striped tbody tr:nth-of-type(odd){background-color:#303030}     /* BS4 Darkly @14726 */
.table-striped tbody tr:nth-of-type(odd){background-color:#ffffff0d}   /* @18006 (later → beats the #303030 tr-level rule) */
.table-striped>tbody>tr:nth-of-type(odd)>*{--bs-table-color-type:var(--bs-table-striped-color);--bs-table-bg-type:var(--bs-table-striped-bg)}  /* BS5 @161030 (cell-level, higher specificity) */
/* BS5 default striped bg token: */
--bs-table-striped-bg: rgba(var(--bs-emphasis-color-rgb), .05)   /* @159869 */
.w-100{width:100%!important}     /* @300044 */
.m-auto{margin:auto!important}   /* @302584 */
.text-center{text-align:center!important}   /* @307874 */
```

The `st-fileTable` has no `.table-dark` / `--bs-table-*` context class, so the BS5 cell-level rule (`@161030`) fires with the default `--bs-table-striped-bg: rgba(var(--bs-emphasis-color-rgb),.05)`. In the dark Darkly base (`--bs-emphasis-color-rgb` ≈ white in dark mode), that resolves to a faint `rgba(255,255,255,.05)` (= the `#ffffff0d` at @18006). See Resolved values + Honest gaps — the exact winner is not confirmable without a live computed style because this table is never present in the captures.

---

## Resolved values

var() chains resolved against the live `:root` from `styles.css` (`--danger:#E74C3C`, `--secondary:#444`, `--success:#00bc8c`, `--info:#3498DB`, `--white:#fff`). The lightTheme token block (`.lightTheme{--msg-bg:…}`) covers chat/roster/textarea only — **none of the files-pane elements consume a lightTheme token**, so lightTheme vs default theme does not change this surface.

| Element | Property | Resolved value | Source |
|---|---|---|---|
| `#files` | overflow / height | `auto` / `calc(100% - 40px)` | scoped `#files[_ngcontent]` |
| `ul.files-tabs` | border-bottom | `1px solid #444` (BS4) / BS5 `var(--bs-border-color)` | `.nav-tabs` |
| `a.nav-link` (tab) | padding | `.5rem 2rem` | `.nav-link` @61949 |
| `a.nav-link.active` (Files tab) | color / background | `#fff` / `#222` (BS4) or `var(--bs-nav-tabs-link-active-*)` (BS5, later) | `.nav-tabs .nav-link.active` |
| `span.files-badge` | margin-top / margin-left | `-9px` / `3px` | scoped `.files-badge` |
| `span.files-badge` | background / radius / weight / font-size | `#e74c3c` (→ BS5 `rgba(--bs-danger-rgb,1)`) / pill `50rem`→`var(--bs-border-radius-pill)` / `700` / `75%` | `.bg-danger` + `.rounded-pill` + `.badge` |
| `span.files-badge` | border | `1px solid #000` | `.badge` @132645 |
| `input.form-control` (search) | color / bg / height / padding | `#444` / `#fff` / `calc(1.5em+.75rem+2px)` / `.375rem .75rem` | `.form-control` @18971 |
| `input.form-control` (search) | flex | `1 1 auto`, width `1%` | `.input-group>.form-control` @48631 |
| `span#basic-addon1` (icon addon) | as `.input-group-text` | display flex, align-items center; BS4 color `#adb5bd`, bg `#444`; BS5 (wins) color `var(--bs-body-color)`, bg `var(--bs-tertiary-bg)` | `.input-group-text` |
| `span#basic-addon1` (as `.btn.btn-outline-secondary`) | color / border | BS4 `#444`/`#444`; BS5 (wins) `--bs-btn-color:#6c757d` | `.btn-outline-secondary` |
| `button.st-fileSeeMore` (Refresh) | (no `st-*` CSS) → base `.btn` | color `#fff`, bg transparent, border `1px solid transparent`, padding `.375rem .75rem`, radius `.25rem`, font-size `.9375rem` | `.btn` @31035 |
| `button.st-fileUpload` (presenter) | as `.btn-secondary` | BS4 bg `#444`; BS5 (wins) bg `#6c757d` | `.btn-secondary` |
| `button.st-fileDownload.btn-success` (Play, presenter/audio) | as `.btn-success` | BS4 bg `#00bc8c`; BS5 (wins) bg `#198754` | `.btn-success` |
| `button.set-alert-sound-btn.btn-info` (presenter/audio) | font-size / bg | `12px` (scoped) / BS4 `#3498db`, BS5 (wins) `#0dcaf0` | scoped `.set-alert-sound-btn` + `.btn-info` |
| `table.st-fileTable` | width / margin / color | `100%!important` / `auto!important` / `#fff` | `.w-100`+`.m-auto`+`.table` |
| `table.st-fileTable td/th` | padding / border-top | `.75rem` / `1px solid #444` | `.table th,.table td` |
| `tr:nth-of-type(odd)` (striped) | background | dark-faint stripe: `rgba(255,255,255,.05)` (BS5 cell-level `--bs-table-striped-bg` default, matching the `#ffffff0d` @18006) — **not** the BS4 `#303030` @14726; even rows transparent | `.table-striped…` (see gap) |
| `span.st-fileName` / `span.st-fileSize` / italic `<i>` date | (no `st-*` CSS) | inherit table `color:#fff`, default font-size (`.fileName{font-size:12px}` does NOT apply — class mismatch); `<i>` renders italic via UA default | template + absence of matching CSS |
| `img.fileDriveImg` | max-width / background | `200px` (scoped `.fileDriveImg`) / inline `#000` | scoped + const 257 inline style |
| `audio#mp3player` | — | autoplay, `src` bound to played file's `vidPath` | const 52 |

Note: `.fileDriveImg` has TWO relevant declarations — scoped `.fileDriveImg[_ngcontent]{max-width:200px}` (@2016705) and, in the same block, a duplicate `max-width:200px`; the row template's inline `2,"background-color","#000"` (const 257) sets the black backdrop behind transparent PNGs.

---

## States & effects

- **Active sub-tab** — the `active` class is applied to one of `#files-tab`/`#image-tab`/`#sounds-tab` via `ngClass` (bound to `selectedFileTab`); active tab gets `.nav-tabs .nav-link.active` → color `#fff`, background `#222` (BS4) / BS5 token bg, border `#444 #444 transparent`. The static `as-splitter.html` capture shows `#files-tab` with the literal `active` class (default sub-tab = Files).
- **Search-icon addon hover** (`span#basic-addon1` as `.btn-outline-secondary:hover`) → `color:#fff; background-color:#444; border-color:#444` (BS4 @37982); under BS5 (@194438) hover resolves to `--bs-btn-hover-bg:#6c757d`.
- **Badge transition** — `.badge{transition:none}` (@74569) disables the default `color/background-color .15s` transition (@74230).
- **Table striping** — `tr:nth-of-type(odd)` only (odd rows tinted, even rows transparent); no `.table-hover` class on `st-fileTable`, so no per-row hover highlight.
- **Refresh spin** — the `fa-sync` icon (const 45) is a static FontAwesome glyph; no CSS animation/`fa-spin` in the markup (spin, if any, would be toggled at runtime; not provable from these sources).
- **Hidden-until conditions**:
  - Whole `#files` panel: `H("hidden",o.hideFiles)` + active only when `selectedMainTab === "presAreaTabs-files"` (`.hidden{display:none}`).
  - Each `<tr>`: shown only if `selectedFileTab` matches the file's `contentType` — Files tab excludes `image/` and `audio/`; Images tab requires `image/`; Sounds tab requires `audio/` (fn `Kwe` guard).
  - Rows also filtered by the `filter` pipe over `filesSearch` (fn `Ywe`: `ft(wt(4,0,e.sessionFiles,e.filesSearch))`).
  - Empty state `h4 "No room files found."` (const 48) shown when the list is empty.
  - Presenter-only nodes gated by `isP` and (for play/overwrite) `contentType.indexOf("audio/")>=0`.
  - Image thumbnail (`fileDriveImg`) shown when `contentType.indexOf("image/")>=0`; the bare `fileDowload` anchor (const 249) shown when NOT an image.
- **No CSS transitions/animations** are defined for any files-pane class beyond the disabled badge/btn transitions above.

---

## Behavior

Provable from compiled template handlers (`main.d6f5272aa3783e43.js`) and DOM attrs:

- **Sub-tab clicks** — each `li.nav-item` has `M("click",…onFileTabChange('files'|'images'|'sounds'))`; the anchors ALSO carry `data-bs-toggle="tab"` + `aria-controls` (Bootstrap tab API), so switching is driven by the Angular click handler setting `selectedFileTab` (the `data-bs-toggle` is present in markup but the `*ngFor` row filter keys off `selectedFileTab`).
- **Search** — `input` two-way-binds `ngModel` → `filesSearch`; the `filter` pipe re-filters `sessionFiles` live (`Ve("ngModelChange",…o.filesSearch=r)`).
- **Search icon** — `span#basic-addon1` is a decorative `.btn.btn-outline-secondary` addon (`fa-search`); no click handler in the template → non-interactive affordance only.
- **Refresh** (`st-fileSeeMore`, title "Reload list") — `M("click",…o.getSessionFiles())` re-fetches the session file list.
- **Download** (`st-fileDownload`, title "Download File") — anchor with `href=file.vidPath`, `type=file.contentType`, `download=file.name`, `target=_blank` (const 250). The sibling bare `fileDowload` anchor (const 249, note the typo — one 'n') carries the same href/type/download for non-image files (a hidden/text-less download anchor).
- **Images** — image files render an inline `<a target=_blank>` wrapping `img.fileDriveImg` (const 247/257) linking to `vidPath`.
- **Presenter actions**: `Delete Selected` → `deleteSelected()`; `Upload File` → `newFile()`; `Stop For All`/`Stop Playing For All` → `stopMp3ForAll()`; per-row `Delete` → `deleteFile(name,_id)`; `Play` → `playMp3ForMe(file)` (toggles Stop/Play span via `isPlayingForMe[_id]`); `Play For All` → `playMp3ForAll(vidPath)`; `Overwrite Cash Register Sound` → `overwriteCashRegisterSound(…)`. Row checkboxes bind `value=file._id` for the Delete-Selected batch.
- **Sounds player** — presenter play actions set `audio#mp3player.src` = the file's `vidPath` (element has `autoplay`); `stopMp3ForAll` stops it. The player is a bare `<audio>` sibling of the panel, not a visible custom control.
- **Titles/tooltips** — native `title` attrs: "Reload list", "Download File", "Upload New File", "Delete Selected", "Stop For All", "Delete File", "Play", "Play For All", "Overwrite Cash Register Sound", "Remove Overwrited Cash Register Sound" (typo verbatim in const 255).

---

## Honest gaps

1. **No captured computed styles for this pane.** `#files` is a hidden/inactive tab; it does not appear in `proroom-all-admin.json`, `proroom-full-member.json`, or `proroom-full-presenter.json` (0 hits). Every "Resolved value" is derived from CSS + template, not from a live computed style. Pixel-exact confirmation requires forcing the Files tab active and re-capturing.
2. **Striped-row color not empirically confirmed.** Three competing `.table-striped` rules exist (BS4 `#303030` @14726, the `#ffffff0d` @18006, and the BS5 cell-level `--bs-table-striped-bg` @161030). Source order + specificity point to the faint `rgba(255,255,255,.05)` stripe, but the exact rendered background of an odd row is not verifiable without a live capture of a populated `st-fileTable`.
3. **No populated file rows in any capture.** `as-splitter.html` shows the pane with all three badges at `0` and an empty `#filesDriveList` (no `<tr>`). Real row markup above is reconstructed from the compiled template functions (`qwe`/`Kwe`/`Ywe`); the exact live DOM of a rendered row (attribute order, whitespace, the italic date's exact element) is inferred, not observed rendered.
4. **FontAwesome glyphs not in these sources.** `fa-search`, `fa-sync`, `fa-download`, `fa-check`, `fa-plus`, `fa-stop`, `fa-trash`, `fa-bell` are referenced by class but their glyph definitions live in the pinned FA 5.8.1 stylesheet, which is not among the provided files — icon rendering can't be byte-verified here.
5. **Icon const-index guesses.** Icon consts 59 (fa-plus), 145 (delete), 158 (fa-stop/play), 135 (fa-download mr-2) were resolved where the consts array made them explicit; a couple of play/stop icon consts inside the audio-only presenter buttons (fn Vwe/Hwe) toggle between play/stop glyphs and were not each individually decoded to a specific `fa-*` name.
6. **`.fileName`/`.fileDownload` scoped rules are dead code** relative to the current template (which uses `st-`-prefixed classes). Stated as a finding, not a gap — but flagged so no one restyles assuming those rules apply.
7. **Theme independence assumed from token scan.** No files-pane element references a `--lightTheme-*` / theme token in the scoped or global CSS I searched; if a runtime-injected inline style or a class not in these files applies a theme color to the table, it would not be visible here.
