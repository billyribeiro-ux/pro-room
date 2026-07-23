# Notes

The `#notes` pane of the presentation area (`app-presentationarea`) in the "Mastering The Trade" room, `lightTheme`. It has three structural layers:

1. **The main-tabs "Notes" tab** (`#notes-tab` nav-link in `#mainTabs`) — carries the `#noteChangeIndicator` flashing pencil.
2. **The `#notes` tab-pane** → `ul#notesTabs.noteTabset` (per-note tab strip with welcome badge / editName / dropdown caret) + `div#notesTabsContent.tab-content`.
3. **Per note**: `div.note-container` → `app-note` → `div.note-view` (summernote HTML content) followed by the sticky `div.noteOptions` action bar.

All markup facts below come from the Angular component templates and `consts` arrays in `main.d6f5272aa3783e43.js` (component `app-presentationarea`, `consts:[` at offset 1991543; component `app-note`, `selectors:[["app-note"]]` at offset 1482743). All computed values come from `proroom-all-admin.json` state `note:Welcome` (the only capture that rendered the notes pane deeply; member/presenter captures left `tab:Notes` groups empty). LIVE resolved tokens come from `proroom-all-admin.json` → `cssVariables.root`.

---

## DOM structure

### 1. Main-tabs "Notes" tab (holds the change indicator)
`app-presentationarea` main template render (`main.d6f5272aa3783e43.js`):
`d(17,"a",11)(18,"div",12)(19,"div"),T(20,"i",13),d(21,"span",14),_(22,"Notes")`

Resolving the const indices (presenter `consts` array):
- const 11 = `["id","notes-tab","data-bs-toggle","tab","data-bs-target","#notes","role","tab","aria-controls","notes","aria-selected","false",1,"nav-link","presAreaTabs-notes",3,"ngClass"]`
- const 12 = `[1,"d-flex","align-items-center"]`
- const 13 = `["id","noteChangeIndicator",1,"fas","fa-edit"]`
- const 14 = `[1,"mx-1"]`

```html
<a id="notes-tab" data-bs-toggle="tab" data-bs-target="#notes" role="tab"
   aria-controls="notes" aria-selected="false" class="nav-link presAreaTabs-notes" [ngClass]="...">
  <div class="d-flex align-items-center">
    <div>
      <i id="noteChangeIndicator" class="fas fa-edit"></i>
      <span class="mx-1">Notes</span>
    </div>
  </div>
</a>
```
Captured rect of `i#noteChangeIndicator`: `{x:1279,y:63,w:14,h:12}` (`note:Welcome`), i.e. it sits in the main tab bar row, to the left of the "Notes" label.

### 2. `#notes` tab-pane wrapper
const 24 = `["id","notes","role","tabpanel","aria-labelledby","notes-tab",1,"tab-pane",3,"ngClass","hidden"]`. Inside it, `HSe(t,n)` renders the tab strip + content:
`d(0,"ul",121),pt(1,BSe,...,"li",16,fc),u(),d(3,"div",122),pt(4,VSe,...,"div",73,fc)`
- const 121 = `["id","notesTabs","role","tablist",1,"nav","nav-tabs","noteTabset"]`
- const 122 = `["id","notesTabsContent",1,"tab-content"]`
- const 16 = `["role","presentation",1,"nav-item"]`

```html
<div id="notes" role="tabpanel" aria-labelledby="notes-tab" class="tab-pane" [ngClass]="..." [hidden]="...">
  <ul id="notesTabs" role="tablist" class="nav nav-tabs noteTabset">
    <!-- one <li> per sessionNotes entry (BSe) -->
  </ul>
  <div id="notesTabsContent" class="tab-content">
    <!-- one tab-pane per sessionNotes entry (VSe) -->
  </div>
</div>
```

### 3. Per-note TAB in `#notesTabs` — `BSe(t,n)`
```
d(0,"li",31),M("click",…onNotesTabChange(o._id)),
  d(1,"a",74)(2,"div",12)(3,"div"),
    V(4,NSe,2,0,"span",123),        // welcome badge, *ngIf isWelcomeMat
    T(5,"i",124),                    // fa-pen change flag (id noteUpd-<id>)
    d(6,"a",125),M("dblclick",…renameTab(o.name,o._id)),_(7),  // editName + note name text
  V(8,LSe,27,0,"div"),              // dropdown caret menu, *ngIf isP||canEditNotes
```
Const map:
- const 31 = `["role","presentation",1,"nav-item",3,"click"]`
- const 74 = `["data-bs-toggle","tab","role","tab","aria-selected","true",1,"nav-link",3,"ngClass","id"]` → id bound `"<_id>-tab"`, ngClass `active` when `selectedNoteTab=="noteTab-"+_id`, `aria-controls=_id`
- const 12 = `[1,"d-flex","align-items-center"]`
- const 123 = `["placement","bottom","ngbTooltip","This note is the Welcome Mat, and will be shown by default when noboby is presenting",1,"badge","badge-success","mx-1","p-0"]`
- const 124 = `[1,"fas","fa-pen","mx-1",2,"display","none",3,"id"]` → inline `style="display:none"`, id bound `"noteUpd-<_id>"`
- const 125 = `["placement","bottom","tooltip","Double-Click to rename note tab",1,"editName","mx-1",3,"dblclick"]`
- `NSe` = `d(0,"span",123),T(1,"i",126)` where const 126 = `[1,"fas","fa-home"]`

Rendered welcome tab (`note:Welcome`, active note `652765a0e494735aa53574ba`):
```html
<li class="nav-item" (click)="onNotesTabChange('652765…')">
  <a id="652765a0e494735aa53574ba-tab" data-bs-toggle="tab" role="tab"
     aria-selected="true" class="nav-link active" aria-controls="652765…">
    <div class="d-flex align-items-center">
      <div>
        <!-- only when note.isWelcomeMat -->
        <span class="badge badge-success mx-1 p-0"
              ngbTooltip="This note is the Welcome Mat, and will be shown by default when noboby is presenting"
              placement="bottom">
          <i class="fas fa-home"></i>
        </span>
        <i id="noteUpd-652765…" class="fas fa-pen mx-1" style="display:none"></i>
        <a class="editName mx-1" tooltip="Double-Click to rename note tab" placement="bottom"
           (dblclick)="renameTab('Welcome','652765…')"> Welcome </a>
      </div>
      <!-- dropdown caret (LSe), only when isP || user.canEditNotes -->
    </div>
  </a>
</li>
```
Non-welcome tabs render identically but WITHOUT the `span.badge.badge-success` (the `NSe` span is `*ngIf note.isWelcomeMat`). Confirmed by capture: only `li:nth-child(1)` has the badge; li 2–6 have only `i.fas.fa-pen` + `a.editName`.

### 3a. Per-note tab dropdown caret — `LSe(t,n)` (role-gated: `isP || canEditNotes`)
```
d(0,"div")(1,"span",127),T(2,"i",55),u(),          // caret toggle: fa-cog
d(3,"ul",128)                                       // dropdown-menu
  li → editNote(_id)      : <i i,129 fa-edit>  " Edit Note"
  li → renameTab(name,_id):                     " Rename Note"
  li → bringFocusToTab(_id): <i i,82 fa-eye>   " Bring everyone here"
  li → setAsWelcomeTab(_id,!1): <i i,126 fa-home> " Make Welcome Mat"
  li → setAsWelcomeTab(_id,!0): <i i,126 fa-home> " Apply as Welcome Mat to multiple rooms"
  li → deleteNote(_id)   : <i i,85 fa-trash-alt> " Delete"
```
Const map: 127 = `["id","dropdownMenuNote","data-bs-toggle","dropdown","aria-expanded","false",1,"dropdown-toggle"]`; 55 = `[1,"fas","fa-cog"]`; 128 = `["aria-labelledby","dropdownMenuNote",1,"dropdown-menu"]`; 57 = `[3,"click"]` (each `li`); 58 = `["href","#",1,"dropdown-item"]` (each `a`); 129 = `[1,"fas","fa-edit"]`; 82 = `[1,"fas","fa-eye"]`; 126 = `[1,"fas","fa-home"]`; 85 = `[1,"fas","fa-trash-alt"]`.

### 4. Per-note CONTENT pane in `#notesTabsContent` — `VSe(t,n)`
```
d(0,"div",73)(1,"div",130),T(2,"app-note",131),u(),   // note-container > app-note[tab]
d(3,"div",132)(4,"div"),                                // noteOptions bar > left div
  V(5,USe,3,0,"button",133),                            // Edit btn, *ngIf isP||canEditNotes
  d(6,"button",134),M("click",…downloadNote(o)),T(7,"i",135),_(8,"Download "),  // Download btn
  V(9,jSe,3,0,"button",136),                            // Delete btn, *ngIf isP||canEditNotes
```
Const map:
- const 73 = `["role","tabpanel",1,"tab-pane","fade",3,"ngClass","id"]` → id = `_id`, ngClass `active` when `selectedNoteTab=="noteTab-"+_id`, aria-labelledby `"<_id>-tab"`
- const 130 = `[1,"note-container"]`
- const 131 = `[3,"tab"]` → `<app-note [tab]="note">`
- const 132 = `[1,"noteOptions","d-flex","align-items-center","justify-content-between"]`
- const 134 (Download, always) = `["type","button","title","Download Note",1,"btn","btn-sm","noteDownload","mr-3",3,"click"]`
- const 135 = `[1,"fas","fa-download","mr-2"]`
- `USe` Edit btn: const 137 = `["type","button","title","Edit Note",1,"btn","btn-sm","noteEdit","mr-3",3,"click"]`; icon const 138 = `[1,"fas","fa-edit","mr-2"]`; text `"Edit "`
- `jSe` Delete btn: const 139 = `["type","button","title","Delete Note",1,"btn","btn-sm","noteDelete",3,"click"]`; icon const 140 = `[1,"fas","fa-trash-alt","mr-2"]`; text `"Delete "`

Both `USe` and `jSe` are gated: `O(5, i.isP||i.appService.globals.user.canEditNotes ? 5 : -1)` and `O(9, … ? 9 : -1)`.

```html
<div role="tabpanel" class="tab-pane fade" [ngClass]="{active: …}" id="652765…"
     aria-labelledby="652765…-tab">
  <div class="note-container">
    <app-note [tab]="note"></app-note>
  </div>
  <div class="noteOptions d-flex align-items-center justify-content-between">
    <div>
      <!-- Edit: only when isP || canEditNotes -->
      <button type="button" title="Edit Note" class="btn btn-sm noteEdit mr-3" (click)="editNote(_id)">
        <i class="fas fa-edit mr-2"></i>Edit </button>
      <button type="button" title="Download Note" class="btn btn-sm noteDownload mr-3" (click)="downloadNote(note)">
        <i class="fas fa-download mr-2"></i>Download </button>
      <!-- Delete: only when isP || canEditNotes -->
      <button type="button" title="Delete Note" class="btn btn-sm noteDelete" (click)="deleteNote(_id)">
        <i class="fas fa-trash-alt mr-2"></i>Delete </button>
    </div>
  </div>
</div>
```

**Role variant (proven):** In `proroom-all-admin.json` (`note:Welcome`), `div.noteOptions` contained exactly ONE child `div` with ONE `button.noteDownload` — no Edit, no Delete. So in that captured session `isP=false && canEditNotes=false` (the "admin" here was not presenting and lacked note-edit rights). Member view is the same base case: Download only. Staff/presenter (`isP` true) OR any user with `canEditNotes` additionally gets the Edit + Delete buttons and the per-tab dropdown caret (`LSe`). The right-hand side of the `justify-content-between` bar is an empty second slot in the base case; the template's `_(8,"Download ")` block is the only always-present content.

### 5. `app-note` component internal template (`selectors:[["app-note"]]`)
`template:function(i,o){1&i&&(V(0,w0e,16,3),T(1,"div",3),Qe(2,"noSanitize"),…),2&i&&(O(0,o.isEditing?0:-1),m(),ei("id","summernoteEdit-",o.tab._id,""),H("innerHTML",wt(2,4,o.tab.noteContent,"html"),wn))}`
- `app-note` `consts` index 3 = `[1,"note-view",3,"innerHTML","id"]`.
- Display mode (focus surface): `<div class="note-view" id="summernoteEdit-<tab._id>" [innerHTML]="tab.noteContent | noSanitize:'html'"></div>`. The id is `summernoteEdit-<_id>`; the innerHTML is the raw stored HTML note body (summernote WYSIWYG output).
- `V(0,w0e,…)` is the `*ngIf isEditing` branch (the full summernote editor + toolbar / giphy / carousel / file-browser / version-history) — rendered only while editing. Out of scope for the read-only notes surface; its scoped classes are listed under Scoped CSS.

Captured display-mode subtree (`note:Welcome`):
```
div.note-view#summernoteEdit-652765…  @569,146 1457x1135
  p (:nth-child 2)                     @569,162 1457x640
    a  → img                            (embedded image link, 1457x640)
```

---

## Scoped CSS (verbatim)

From `app-presentationarea` `styles:[…]` in `main.d6f5272aa3783e43.js` (offset ~2015540):
```css
#screens[_ngcontent-%COMP%], #screens[_ngcontent-%COMP%]   .tab-pane.active[_ngcontent-%COMP%], #streams[_ngcontent-%COMP%], #streams[_ngcontent-%COMP%]   .tab-pane.active[_ngcontent-%COMP%], #mainTabsContent[_ngcontent-%COMP%], #notes[_ngcontent-%COMP%], #notesTabsContent[_ngcontent-%COMP%]{height:100%}
#notesTabsContent[_ngcontent-%COMP%]   .tab-pane.active[_ngcontent-%COMP%]{height:100%;display:flex;flex-direction:column}
#notesTabsContent[_ngcontent-%COMP%]   .note-container[_ngcontent-%COMP%]{flex:1;min-height:0;overflow:auto}
.noteEditBtn[_ngcontent-%COMP%]{position:relative;top:10px;right:10px}
```
(`.noteEditBtn` is defined in this component but is NOT emitted in the current notes template — no element carries class `noteEditBtn`; retained here for completeness.)

From `app-note` `styles:[…]` (offset ~1486990) — every rule verbatim:
```css
[_nghost-%COMP%]{display:block;height:100%}
.note-view[_ngcontent-%COMP%]{height:100%}
.giphy-search[_ngcontent-%COMP%]{padding:5px;width:400px;height:700px;overflow-y:auto;border:2px solid #0a0a0a;background-color:#fff}
.gif-result[_ngcontent-%COMP%]{text-align:center}
.gif-result[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{cursor:pointer}
.giphy-search[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:hover{background-color:#ff0;border:2px solid var(--yellow)}
.giphy-search[_ngcontent-%COMP%]   h6[_ngcontent-%COMP%]{color:#0a0a0a;text-align:center}
img[_ngcontent-%COMP%]{max-width:100%}
.carousel-slides-list[_ngcontent-%COMP%]{max-height:50vh;overflow-y:auto}
.carousel-slide-row[_ngcontent-%COMP%]{border:1px solid #dee2e6;background-color:#fafafa}
.carousel-img-preview[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:flex-start}
.carousel-img-preview[_ngcontent-%COMP%]   .carousel-preview-img[_ngcontent-%COMP%]{max-height:140px;max-width:100%;object-fit:contain;border:1px solid #dee2e6;border-radius:4px;background:#111}
.file-browser-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;max-height:60vh;overflow-y:auto}
.file-browser-item[_ngcontent-%COMP%]{cursor:pointer;border:2px solid transparent;border-radius:6px;overflow:hidden;text-align:center;padding:4px;transition:border-color .15s,background .15s}
.file-browser-item[_ngcontent-%COMP%]:hover{border-color:#0d6efd;background:#f0f6ff}
.file-browser-thumb[_ngcontent-%COMP%]{width:100%;height:100px;object-fit:cover;border-radius:4px;display:block}
.file-browser-name[_ngcontent-%COMP%]{font-size:.72rem;color:#555;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.version-history-panel[_ngcontent-%COMP%]{max-height:300px;overflow-y:auto;border:1px solid #ddd}
.version-history-panel[_ngcontent-%COMP%]   .card-header[_ngcontent-%COMP%]{background-color:#f8f9fa;padding:.5rem 1rem}
.version-history-panel[_ngcontent-%COMP%]   .version-preview[_ngcontent-%COMP%]{font-size:.85em;color:#666;max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.version-history-panel[_ngcontent-%COMP%]   .list-group-item[_ngcontent-%COMP%]{padding:.5rem 1rem}
.version-history-panel[_ngcontent-%COMP%]   .list-group-item[_ngcontent-%COMP%]:hover{background-color:#f8f9fa}
```
For the **read-only note surface**, only `[_nghost-%COMP%]{display:block;height:100%}`, `.note-view[_ngcontent-%COMP%]{height:100%}`, and `img[_ngcontent-%COMP%]{max-width:100%}` apply. The `img` rule constrains images embedded in `note.noteContent`. The rest apply only in edit-mode (`isEditing`) subtrees.

---

## Global CSS (verbatim)

From `styles.d622cb9ed2bbc221.css` — the rules that actually apply to this surface:

**noteTabset (tab strip):**
```css
.noteTabset .nav-link{padding:.5rem;font-size:12px;line-height:12px;margin:5px;color:var(--tabs-color)}
.noteTabset{border-color:transparent;display:flex;align-items:center;justify-content:center}
.noteTabset .nav-link.active{background-color:var(--tab-active-bg);border-color:transparent;border-radius:3px;color:var(--note-tabs-color)}
.noteTabset .nav-link.active{position:relative;z-index:1}
.noteTabset,.mainTabset #presAreaTabs-notes.active,.mainTabset .nav-item.show #presAreaTabs-notes{background-color:var(--notes-tabs-bg)}
.noteTabset{border-top:1px solid var(--tabs-border-color)}
.noteTabset .nav-link:hover{border:1px solid var(--tabs-border-color);border-radius:3px}
.noteTabset .dropdown-menu{background-color:var(--archives-dropdown-menu-bg-color);color:var(--tabs-dropdown-color);border:none}
.noteTabset .dropdown-menu .dropdown-item{color:var(--tabs-dropdown-color);font-size:15px}
.noteTabset .nav-link .btn{padding:0 .5rem;font-size:12px;line-height:12px;color:var(--note-tabs-color)}
.noteTabset .nav-link{padding:.5rem;font-size:12px;line-height:12px}
.noteTabset .btn{padding:0 .5rem;font-size:12px;line-height:12px}
```

**noteOptions (action bar):**
```css
.noteOptions{background-color:var(--note-options-bg);position:sticky;bottom:0;padding:10px}
.noteOptions .noteDownload{background-color:var(--note-download-bg);color:var(--note-options-color)}
.noteOptions .noteDelete{background-color:var(--note-delete-bg);color:var(--note-options-color)}
.noteOptions .noteEdit,.noteOptions .noteNext{background-color:var(--note-next-bg);color:var(--note-options-color)}
.noteOptions .noteEdit:hover,.noteOptions .noteDownload:hover,.noteOptions .noteDelete:hover,.noteOptions .noteNext:hover{color:var(--note-options-hover-color)}
```

**badge-success (welcome pill):**
```css
.badge-success{color:#fff;background-color:#00bc8c}
```
(Plus Bootstrap `.badge{display:inline-block;padding:.25em .4em;font-size:75%;font-weight:700;line-height:1;text-align:center;white-space:nowrap;vertical-align:baseline;border-radius:.25rem}` — resolved size is overridden by `.p-0` (padding 0) and the `mx-1` margins; measured badge is 10.125×9.5 px, border-radius 6px.)

**nav-tabs base (Bootstrap, inherited by noteTabset):**
```css
.nav-tabs .nav-link{border:1px solid transparent;border-top-left-radius:.25rem;border-top-right-radius:.25rem}
.nav-tabs .nav-link.active{color:var(--bs-nav-tabs-link-active-color);background-color:var(--bs-nav-tabs-link-active-bg);border-color:var(--bs-nav-tabs-link-active-border-color)}
```
`.noteTabset .nav-link.active{background-color:var(--tab-active-bg)…}` wins over the generic `.nav-tabs .nav-link.active` for the active note tab (both single-class specificity, `noteTabset` rule appears later / is more specific by the `.noteTabset` compound). Measured active tab bg = `rgb(69,162,255)` = `--tab-active-bg` #45a2ff, confirming noteTabset wins.

`.btn` / `.btn-sm` Bootstrap defaults apply to the noteOptions buttons; `.btn-sm` → `padding:.25rem .5rem;font-size:.875rem;border-radius:.2rem` (measured: padding 4px 8px, font 14px, radius 4px). No `.btn-primary/.btn-success` colour class is on these buttons — colour comes entirely from `.noteOptions .noteDownload{…}` etc.

**animate.css (noteChangeIndicator flash):**
```css
@keyframes flash{0%{opacity:1}50%{opacity:0}…}
.flash{animation:flash 1s infinite}
```

---

## Resolved values

LIVE room tokens (`proroom-all-admin.json` → `cssVariables.root`; the room's `:root` already carries the lightTheme values — no `lightTheme` body class was set in the capture, so these are the effective resolved values):

| Token | Live value |
|---|---|
| `--notes-tabs-bg` | `#0c2434` |
| `--tab-active-bg` | `#45a2ff` |
| `--tabs-color` | `#fff` |
| `--note-tabs-color` | `#fff` |
| `--tabs-border-color` | `#0a6db1` |
| `--tabs-dropdown-color` | `#45a2ff` |
| `--archives-dropdown-menu-bg-color` | `#0e3651` |
| `--note-options-bg` | `#f4f4f4` |
| `--note-options-color` | `#fff` |
| `--note-options-hover-color` | `#212529` |
| `--note-download-bg` | `#92d528` |
| `--note-delete-bg` | `#bb352a` |
| `--note-next-bg` | `#45a2ff` |
| `--note-text-bg` | `#fff` |
| `--note-text-color` | `#676767` |
| `--bs-body-bg` | `#fff` |
| `--bs-body-color` | `#212529` |

(Boot defaults in `styles.css`/`file-1.html` differ — e.g. `--notes-tabs-bg:#111`, `--tab-active-bg:#222`, `--note-download-bg:#00bc8c`, `--tabs-border-color:#444` — these are the Darkly dark defaults and are OVERRIDDEN by the live room tokens above.)

Computed values (`proroom-all-admin.json`, `note:Welcome`):

| Element | Property | Resolved value |
|---|---|---|
| `ul#notesTabs.noteTabset` | display / justify / align | `flex` / `center` / `center` |
| | background-color | `rgb(12,36,52)` = `--notes-tabs-bg` #0c2434 |
| | border-top | `1px solid rgb(10,109,177)` = `--tabs-border-color` #0a6db1 |
| | border-bottom | `1px` (Bootstrap `.nav-tabs` `border-bottom:1px solid …`, transparent here) |
| | width × height | 1487.34 × 41 px |
| `a.nav-link.active` (welcome tab) | background-color | `rgb(69,162,255)` = `--tab-active-bg` #45a2ff |
| | color | `rgb(255,255,255)` = `--note-tabs-color` |
| | font-size / line-height | 12px / 12px |
| | padding | 8px (all sides) |
| | margin | 5px (all sides) |
| | border-radius | 3px |
| | border | 1px solid transparent |
| | position / z-index | relative / 1 |
| | transition | `color .15s, background-color .15s, border-color .15s ease-in-out` |
| `span.badge.badge-success.mx-1.p-0` | background-color | `rgb(0,188,140)` = #00bc8c (`.badge-success`) |
| | color | `rgb(255,255,255)` |
| | padding | 0 (`.p-0`) |
| | margin-left/right | 4px (`.mx-1`) |
| | font-size / weight | 9px / 700 |
| | border-radius | 6px |
| | width × height | 10.125 × 9.5 px |
| `i.fas.fa-home` (in badge) | color | `rgb(255,255,255)` |
| | font-family / weight | "Font Awesome 5 Free" / 900 |
| | font-size / line-height | 9px / 9px |
| | width × height | 10.125 × 9 px |
| `i.fas.fa-pen.mx-1` (noteUpd) | inline style | `display:none` (hidden until flashed) |
| `a.editName.mx-1` | display | `inline` |
| | color | `rgb(255,255,255)` |
| | font-size / line-height | 12px / 12px |
| | margin-left/right | 4px |
| `i#noteChangeIndicator.fas.fa-edit` | color | `rgb(255,255,255)` |
| | font-family / weight | "Font Awesome 5 Free" / 900 |
| | font-size / line-height | 12px / 12px |
| | width × height | 13.5 × 12 px |
| | display | inline-block |
| `div.note-container` | background-color | `rgb(255,255,255)` (#fff, from body/pane) |
| | color | `rgb(103,103,103)` = `--note-text-color` #676767 |
| | padding | 15px (all sides) |
| | flex (scoped) | `flex:1;min-height:0;overflow:auto` |
| | font | 16px / 300 / "Open Sans", sans-serif |
| `div.note-view#summernoteEdit-…` | display / flex-direction | `flex` / `column` |
| | height | 100% (1135px measured) |
| | color | `rgb(103,103,103)` #676767 |
| | background-color | `rgba(0,0,0,0)` (transparent → shows note-container #fff) |
| | font | 16px / 300 / "Open Sans", sans-serif; line-height 24px |
| `div.noteOptions` | background-color | `rgb(244,244,244)` = `--note-options-bg` #f4f4f4 |
| | position / bottom | `sticky` / 0 |
| | display / justify / align | `flex` / `space-between` / `center` |
| | padding | 10px (all sides) |
| | height | 51 px |
| `button.noteDownload.btn.btn-sm` | background-color | `rgb(146,213,40)` = `--note-download-bg` #92d528 |
| | color | `rgb(255,255,255)` = `--note-options-color` |
| | font-size / weight | 14px / 400 |
| | padding | 4px 8px |
| | margin-right | 16px (`.mr-3`) |
| | border-radius | 4px |
| | border | 1px solid transparent |
| | cursor | pointer |
| | width × height | 102.27 × 31 px |
| `i.fas.fa-download.mr-2` (in btn) | width × height | 14 × 14 px |
| `button.noteEdit` (staff/edit only) | background-color | `--note-next-bg` #45a2ff; color #fff (from global rule; not in this capture) |
| `button.noteDelete` (staff/edit only) | background-color | `--note-delete-bg` #bb352a; color #fff (from global rule; not in this capture) |

---

## States & effects

- **Active note tab** (`a.nav-link.active`): bg `--tab-active-bg` #45a2ff, color `--note-tabs-color` #fff, border-radius 3px, `position:relative;z-index:1`. Applied when `selectedNoteTab == "noteTab-"+note._id` (ngClass binding in `BSe`).
- **Inactive note tab** hover: `.noteTabset .nav-link:hover{border:1px solid var(--tabs-border-color);border-radius:3px}` → 1px #0a6db1 border, radius 3px.
- **nav-link transition:** `color .15s, background-color .15s, border-color .15s ease-in-out` (Bootstrap `.nav-link`) — measured on the active tab.
- **Welcome badge** shown only when `note.isWelcomeMat` (`NSe` = `*ngIf`). Tooltip (ngbTooltip, placement bottom): "This note is the Welcome Mat, and will be shown by default when noboby is presenting".
- **fa-pen change flag** (`i#noteUpd-<id>`): inline `display:none` by default. `main.js` shows it flashed on server note update:
  `ii("#noteUpd-"+e.id).show().addClass("visible animated infinite flash"); setTimeout(()=>{ii("#noteUpd-"+e.id).hide().removeClass("visible animated infinite flash")},3e3)` — visible + animate.css `flash` (1s, infinite) for 3 seconds, then hidden.
- **#noteChangeIndicator** (main "Notes" tab pencil): when a note updates AND the user is not currently viewing that note tab (`"presAreaTabs-notes"!==this.selectedMainTab || this.selectedNoteTab!=="noteTab-"+e.id`):
  `ii("#noteChangeIndicator").addClass("animated fadeIn flash"); setTimeout(()=>{ …removeClass("animated fadeIn flash")},3e3)` — animate.css `fadeIn`+`flash` for 3s. Also fires an alert `Note "<name>" updated` when `preferences.noteUpdatePopup` is on.
- **noteOptions bar** is `position:sticky;bottom:0` — pinned to the bottom of the scrolling note-container; `justify-content:space-between` splits left action group from an (empty in base case) right slot.
- **noteOptions button hovers:** `.noteOptions .noteEdit:hover, .noteDownload:hover, .noteDelete:hover, .noteNext:hover{color:var(--note-options-hover-color)}` → text becomes #212529 on hover (background unchanged).
- **badge / active-tab transition:** `color .15s, background-color .15s, border-color .15s, box-shadow .15s ease-in-out` (measured on badge span).
- **Edit/Delete note buttons + per-tab dropdown caret**: hidden until `isP || appService.globals.user.canEditNotes` (Angular `@if`/`O(idx, cond?idx:-1)` guards in `VSe` and `BSe`). In the captured session neither was true, so only Download rendered.
- **Note pane visibility:** `#notes` is a Bootstrap tab-pane; shown when `#notes-tab` is the active main tab (`data-bs-toggle="tab"`, `data-bs-target="#notes"`).

---

## Behavior

All provable from templates / method bodies in `main.d6f5272aa3783e43.js`:

- **Note tab click** (`li.nav-item`): `onNotesTabChange(note._id)` — switches `selectedNoteTab`.
- **editName double-click** (`a.editName`, tooltip "Double-Click to rename note tab"): `renameTab(note.name, note._id)` → `bootbox.prompt({title:"Change note name", value:<name>, callback: o => o && sendServerAdminCommand("renameSessionNoteTab",{newName:o,id})})`. Uses bootbox modal (not `window.prompt`).
- **Download button** (`button.noteDownload`, title "Download Note"): `downloadNote(note)` → builds `new Blob([note.noteContent],{type:"text/plain;charset=utf-8"})`, creates an object URL, and clicks a hidden `<a download="<note.name>.html">`. Downloads the raw note HTML as `<name>.html`.
- **Edit button** (`button.noteEdit`, title "Edit Note", staff/edit only): `editNote(note._id)` — opens the summernote editor (toggles `app-note` `isEditing`; the bundle also wires `shown.bs.dropdown` handlers on `#notes .dropdown-toggle` to add `note-dropdown-open` to `.note-editor`).
- **Delete button** (`button.noteDelete`, title "Delete Note", staff/edit only): `deleteNote(note._id)`.
- **Per-tab dropdown caret** (`#dropdownMenuNote`, `data-bs-toggle="dropdown"`, staff/edit only) items: Edit Note → `editNote`; Rename Note → `renameTab`; Bring everyone here → `bringFocusToTab`; Make Welcome Mat → `setAsWelcomeTab(_id,false)`; Apply as Welcome Mat to multiple rooms → `setAsWelcomeTab(_id,true)`; Delete → `deleteNote`.
- **app-note display**: renders `tab.noteContent` HTML via `[innerHTML]` piped through `noSanitize:'html'` into `div.note-view#summernoteEdit-<_id>`.
- Note list source: `appService.globals.sessionNotes` (iterated by `HSe` for both the tab strip and content panes).

---

## Honest gaps

- **Staff/presenter noteOptions** (Edit/Delete buttons, per-tab dropdown caret) were NOT rendered in ANY capture. Checked both `proroom-all-admin.json` AND `proroom-full-presenter.json` `note:Welcome`/`tab:Notes`: each shows exactly one `div > button.noteDownload` (Download only) and NO `#dropdownMenuNote` caret — so every captured session had `isP=false && canEditNotes=false` (the "presenter" capture was taken as a non-presenting viewer). Their existence, classes, icons, click handlers, and token colours (`--note-next-bg` for Edit, `--note-delete-bg` for Delete) are proven from the TEMPLATE (`USe`/`jSe`/`LSe` guarded by `isP||canEditNotes`) + global CSS, but their live COMPUTED styles/rects are not captured. The member capture (`docs/reference/captures/proroom-full-member.json`) left its `tab:Notes` groups empty entirely.
- **`--note-next-bg`/`--note-delete-bg` applied to real buttons**: not captured on a rendered element; colours are the token values (#45a2ff / #bb352a) resolved from `cssVariables.root`, not from a computed style on a `.noteEdit`/`.noteDelete` node.
- **noteChangeIndicator / noteUpd flash animation** captured statically (indicator `display:inline-block`, pen `display:none`); the animate.css `fadeIn`/`flash` transitions are read from the `main.js` handler + `styles.css` keyframes, not observed mid-animation.
- **Dropdown caret menu (`LSe`) computed styles**: the note-tab dropdown (`.noteTabset .dropdown-menu`) was not opened in a captured state; its bg `--archives-dropdown-menu-bg-color` #0e3651 and item colour `--tabs-dropdown-color` #45a2ff come from global CSS + tokens only.
- **Summernote content typography**: `note-view` inner elements (headings, links, tables, lists inside `note.noteContent`) inherit body/`note-container` styling; only the outer `p`/`a`/`img` of the welcome note were captured (one embedded image at 1457×640). Per-element content styles beyond the scoped `img{max-width:100%}` are content-dependent and not exhaustively captured.
- **`.noteEditBtn` and `.noteNext`**: defined in scoped/global CSS but no element with these classes is emitted by the current notes template — likely legacy/other-surface; no live element to resolve against.
