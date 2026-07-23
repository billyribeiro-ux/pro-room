# Emoji picker (`emoji-mart` / ngx-emoji-mart)

The chat composer's **Add Emojis** button and the Add-Reaction popover open ngx-emoji-mart's
`<emoji-mart>` picker inside an `ngbPopover` (`popoverClass="popOverDiv"`, `placement="auto"`,
`container="body"`, `autoClose="outside"` — see `chat-composer.md` §2b, slots 69/70). No live capture
shows the picker **open** (honest gap noted in `chat-composer.md`), so the compiled bundle is the sole
authority. Everything below is decoded from:

- **`docs/reference/live-bundle/main.d6f5272aa3783e43.js`** (minified Angular bundle, one long line;
  offsets are byte offsets via `grep -bo` + Python slicing).
- **`docs/reference/live-bundle/styles.d622cb9ed2bbc221.css`** (the complete global `.emoji-mart` stylesheet).

The library is **ngx-emoji-mart** (the Angular port of emoji-mart), emoji data **`emoji-datasource-apple@14.0.0`**
(proven by the default `backgroundImageFn`, below). This is a faithful decode, not memory.

---

## 1. Component graph (all standalone, compiled into `main.js`)

| Class (minified) | Selector | Offset (`ɵcmp`/def) | Role |
|---|---|---|---|
| `Za` | `emoji-mart` | i18n `jR` @ **744541**, class body immediately after | Root picker |
| `IR` | `emoji-mart-anchors` | @ **723141** (`emoji-mart-anchors` const) | Top category-anchor bar |
| `yC` | `emoji-category` | @ ~**724800** (`emoji-mart-category` consts) | One scrolling category section |
| `CC` | `emoji-search` | @ ~**726900** (`emoji-mart-search`) | Search input + icon button |
| `FC` | `emoji-preview` | @ ~**725900** (`emoji-mart-preview`) | Bottom preview footer |
| `LR` | `emoji-skins` | @ ~**724300** (`emoji-mart-skin-swatches`) | Skin-tone swatch row (inside preview) |
| `vC` | `ngx-emoji` | @ ~**318150** (`emoji-mart-emoji-native` toggle) | A single emoji cell (span/button) |
| `OR` | (service) | @ ~**723700** | Frequently-used service (`emoji-mart.frequently` localStorage) |
| `Yee` | (service) | @ ~**319800** | Search index over `emojiService.emojis` |
| `f_` | (service) | @ ~**710100** | Emoji data service — `uncompress(See)`, `unifiedToNative` |

The `emoji-mart` module bundle is `Xee=[Za,IR,yC,CC,FC,LR]` (@ end of picker region).

---

## 2. Root picker `<emoji-mart>` — compiled DEFAULT inputs (class `Za`)

Field initializers decoded verbatim from the class body (@ ~**745060**, immediately after the `jR` i18n object):

| Input | Default (compiled) | Note |
|---|---|---|
| `perLine` | `9` | grid columns; drives width |
| `totalFrequentLines` | `4` | rows of frequently-used |
| `i18n` | `{}` (merged with `jR`) | see §5 |
| `style` | `{}` | overrides `getWidth()` if `.width` set |
| `title` | `"Emoji Mart™"` (**"Emoji Mart™"**) | idle preview label |
| `emoji` | `"department_store"` | idle preview emoji (🏬) |
| `darkMode` | `matchMedia("(prefers-color-scheme: dark)").matches` | toggles `.emoji-mart-dark` |
| `color` | `"#ae65c5"` | **selected-anchor icon + bar color** (overrides CSS `#464646`) |
| `hideObsolete` | `true` (`!0`) | hides `obsoletedBy` emojis |
| `set` | `"apple"` | sprite set (only matters when `isNative=false`) |
| `skin` | `1` | default skin tone |
| `isNative` | **`false`** (`!1`) | **sprite-sheet mode by default** (see §7 divergence) |
| `emojiSize` | `24` | px; drives width & cell size |
| `sheetSize` | `64` | sprite sheet resolution |
| `showPreview` | `true` (`!0`) | render the bottom preview footer |
| `emojiTooltip` | `false` (`!1`) | |
| `autoFocus` | `false` (`!1`) | search box does **not** autofocus |
| `custom` | `[]` | |
| `hideRecent` | `true` initially → set **`false`** in `ngOnInit` when recent isn't excluded → **"Frequently Used" shown** |
| `notFoundEmoji` | `"sleuth_or_spy"` | 🕵 shown in the no-results state |
| `categoriesIcons` | `BR` (§4) | the 9 inline SVG anchor icons |
| `searchIcons` | `UR` (§4) | search + clear SVG icons |
| `useButton` | `false` (`!1`) | cells are `<span>` not `<button>` |
| `enableFrequentEmojiSort` | `false` (`!1`) | |
| `enableSearch` | `true` (`!0`) | render the search box |
| `showSingleCategory` | `false` (`!1`) | |
| `virtualize` | `false` (`!1`) | all emojis rendered, no virtual scroll |
| `NAMESPACE` | `"emoji-mart"` | localStorage prefix |
| `RECENT_CATEGORY` | `{id:"recent",name:"Recent",emojis:null}` | label displayed via i18n = "Frequently Used" |
| `SEARCH_CATEGORY` | `{id:"search",name:"Search",emojis:null,anchor:false}` | no anchor (results only) |
| `backgroundImageFn` | `` (e,i)=>`https://cdn.jsdelivr.net/npm/emoji-datasource-${e}@14.0.0/img/${e}/sheets-256/${i}.png` `` | proves **emoji-datasource-apple@14.0.0** |

**Width formula** (`getWidth()`, @ ~**746600**):
`this.style.width || (perLine*(emojiSize+12)+12+2+measureScrollbar)+"px"`
= `9*(24+12)+12+2+scrollbar` = `324+14+scrollbar` = **`338px + scrollbar`** (`measureScrollbar` is the
runtime-measured native scrollbar width, ~15–17px; on macOS overlay scrollbars it is 0).

`ngOnInit` order (@ ~**745600**): merges `i18n` with `jR`; reads persisted `emoji-mart.skin`; builds
`categories` from `[...PR]` (+ optional custom); **unshifts `RECENT_CATEGORY`** (since recent isn't excluded,
sets `hideRecent=false`); **unshifts `SEARCH_CATEGORY`**; `selected = first real category name`; renders the
first `min(categories.length,3)` active categories (the 3rd initially trimmed to 60 emojis then filled on a
`setTimeout` — a lazy first-paint optimisation); attaches a scroll listener that updates `selected`.

---

## 3. DOM structure (compiled templates)

### 3.1 Root `<emoji-mart>` template (`Za`, template fn @ ~**746800**, `decls:8`)

```html
<!-- class binding: "emoji-mart " + (darkMode ? "emoji-mart-dark" : "") ; style.width = getWidth() -->
<section [ngStyle]="style">
  <div class="emoji-mart-bar">                    <!-- :first-child → border-bottom + top radius -->
    <emoji-mart-anchors
      (anchorClick)="handleAnchorClick($event)"
      [categories] [color] [selected] [i18n] [icons]></emoji-mart-anchors>
  </div>

  <emoji-search *ngIf="enableSearch"                <!-- §3.3 -->
    [i18n] [include] [exclude] [custom] [autoFocus] [icons]="searchIcons" [emojisToShowFilter]
    (searchResults)="handleSearch($event)"
    (enterKeyOutsideAngular)="handleEnterKey($event,...)"></emoji-search>

  <section #scrollRef class="emoji-mart-scroll" [attr.aria-label]="i18n.emojilist">
    <emoji-category *ngFor="let c of activeCategories; trackBy: categoryTrack"
      [id] [name] [emojis] [perLine] [totalFrequentLines] [hasStickyPosition]
      [i18n] [hideObsolete] [notFoundEmoji] [custom] [recent] [virtualize] [virtualizeOffset]
      [emojiIsNative]="isNative" [emojiSkin]="skin" [emojiSize] [emojiSet]="set"
      [emojiSheetSize]="sheetSize" [emojiForceSize]="isNative" [emojiTooltip]
      [emojiBackgroundImageFn] [emojiImageUrlFn] [emojiUseButton]="useButton"
      (emojiOverOutsideAngular)="handleEmojiOver($event)"
      (emojiLeaveOutsideAngular)="handleEmojiLeave()"
      (emojiClickOutsideAngular)="handleEmojiClick($event)"></emoji-category>
  </section>

  <div class="emoji-mart-bar" *ngIf="showPreview">  <!-- :last-child → border-top + bottom radius -->
    <emoji-preview
      [emoji]="previewEmoji" [idleEmoji]="emoji" [emojiIsNative]="isNative" [emojiSize]="38"
      [emojiSkin]="skin" [emojiSet]="set" [i18n] [emojiSheetSize]="sheetSize"
      [emojiBackgroundImageFn] [emojiImageUrlFn] [title]
      (skinChange)="handleSkinChange($event)"></emoji-preview>
  </div>
</section>
```
Evidence: `template:function(i,o){… d(0,"section",1)(1,"div",2)(2,"emoji-mart-anchors",3) … V(3,zee,…"emoji-search") … d(4,"section",5,0) … V(6,Gee,…"emoji-category") … V(7,Wee,…"div") …}` and the
2&i bindings `Rh("emoji-mart ",o.darkMode?"emoji-mart-dark":"","")`, `Oo("width",o.getWidth())`,
`H("ngIf",o.enableSearch)`, `H("ngIf",o.showPreview)` — decoded @ ~**747100**. The preview passes
`[emojiSize]="38"` (fixed 38 in `Wee` @ ~**722200**) and `[idleEmoji]="emoji"` (the "department_store" default).

### 3.2 Anchors `<emoji-mart-anchors>` (`IR`, @ **723141**)

`consts:[[1,"emoji-mart-anchors"], … [1,"emoji-mart-anchor",3,"click"],
["xmlns","http://www.w3.org/2000/svg","viewBox","0 0 24 24","width","24","height","24"],
[1,"emoji-mart-anchor-bar"]]`. Per-category anchor (template `Eee` @ ~**723040**):

```html
<div class="emoji-mart-anchors">
  <!-- *ngFor category; rendered only when category.anchor !== false (so no anchor for SEARCH_CATEGORY) -->
  <span class="emoji-mart-anchor"
        [class.emoji-mart-anchor-selected]="category.name === selected"
        [style.color]="category.name === selected ? color : null"   <!-- selected → #ae65c5 -->
        [attr.title]="i18n.categories[category.id]"
        (click)="handleClick($event, index)">
    <div><svg viewBox="0 0 24 24" width="24" height="24"><path [attr.d]="icons[category.id]"/></svg></div>
    <span class="emoji-mart-anchor-bar" [style.background-color]="color"></span>  <!-- bar = #ae65c5 -->
  </span>
</div>
```
Evidence `Eee`: `d(0,"span",3) … d(1,"div"), … d(2,"svg",4),T(3,"path"),u()(), T(4,"span",5) …` with
`Oo("color",e.name===i.selected?i.color:null)`, `Mt("emoji-mart-anchor-selected",e.name===i.selected)`,
`xt("d",i.icons[e.id])`, `Oo("background-color",i.color)`. So the **selected** anchor's icon *and* the 3px
bar are painted `color` (`#ae65c5`); unselected icons fall to the CSS `#858585` (→ `#464646` on hover).

### 3.3 Search `<emoji-search>` (`CC`, @ ~**726900**)

`consts` decoded: input `type="search"` bound `[id]="inputId"` (`"emoji-mart-search-"+counter`),
`[placeholder]="i18n.search"`, `[autofocus]="autoFocus"`, `[(ngModel)]="query"`; a visually-hidden
`<label class="emoji-mart-sr-only" [htmlFor]="inputId">{{ i18n.search }}</label>`; and a
`<button type="button" class="emoji-mart-search-icon" [disabled]="!isSearching" (click)="clear()">`
containing `<svg viewBox="0 0 20 20" width="13" height="13" opacity="0.5"><path [attr.d]="icon"/></svg>`.
`icon` toggles between `icons.search` (magnifier) and `icons.delete` (× — shown while searching). Enter in
the box selects the first result (`handleEnterKey`). `[attr.aria-label]="i18n.clear"` on the button.

```html
<div class="emoji-mart-search">
  <input type="search" [id] [placeholder]="i18n.search" [autofocus]="autoFocus" [(ngModel)]="query"
         (ngModelChange)="handleChange()">
  <label class="emoji-mart-sr-only" [htmlFor]="inputId">{{ i18n.search }}</label>
  <button type="button" class="emoji-mart-search-icon" [disabled]="!isSearching"
          (click)="clear()" [attr.aria-label]="i18n.clear">
    <svg viewBox="0 0 20 20" width="13" height="13" opacity="0.5"><path [attr.d]="icon"/></svg>
  </button>
</div>
```

### 3.4 Category `<emoji-category>` (`yC`, @ ~**724800**, `decls:10`)

```html
<section class="emoji-mart-category" [class.emoji-mart-no-results]="noEmojiToDisplay"
         [ngStyle]="containerStyles" [attr.aria-label]="i18n.categories[id]">
  <div #container class="emoji-mart-category-label" [ngStyle]="labelStyles" [attr.data-name]="name">
    <span #label aria-hidden="true" [ngStyle]="labelSpanStyles"> {{ i18n.categories[id] }} </span>
  </div>
  <!-- virtualize=false → the "normalRenderTemplate": each emoji as an <ngx-emoji> cell -->
  <div *ngIf="!virtualize"> …one <ngx-emoji> per emoji… </div>
  <!-- no-results block (Iee): a big notFoundEmoji cell + the not-found label -->
  <div *ngIf="noEmojiToDisplay"> <div><ngx-emoji [emoji]="notFoundEmoji" [size]="38" …></ngx-emoji></div>
       <div class="emoji-mart-no-results-label">{{ i18n.notfound }}</div> </div>
</section>
```
Evidence: `template:function… d(0,"section",3,0)(2,"div",4)(3,"span",5,1),_(5) … V(6,Ree,…"div",6)(7,Iee,…"div",7)`
with `Mt("emoji-mart-no-results",o.noEmojiToDisplay)`, `xt("aria-label",o.i18n.categories[o.id])`,
`Ie(" ",o.i18n.categories[o.id]," ")`. **The displayed category label = `i18n.categories[id]`, NOT the PR
`name`** (so `activity` renders **"Activity"**, though its PR name is "Activities"). The `Iee` no-results
template renders `[emoji]="notFoundEmoji"` (`sleuth_or_spy` 🕵) + `Ie(" ",i18n.notfound," ")`.
Note: the CSS ships an unused `.emoji-mart-category-list` (`<ul>`) — this compiled version flows the
`.emoji-mart-emoji` cells inline directly inside the category `<div>`, no `<ul>`/`<li>`.

### 3.5 Emoji cell `<ngx-emoji>` (`vC`, @ ~**318150**)

`useButton=false` → renders a `<span>`; native vs sprite chosen by `isNative`:

```html
<span class="emoji-mart-emoji" [class.emoji-mart-emoji-native]="isNative"
      [class.emoji-mart-emoji-custom]="custom" [attr.title]="title" [attr.aria-label]="label">
  <span [ngStyle]="style">   <!-- style = sprite background when !isNative; empty when native -->
    <!-- isNative → text node = the native glyph (bound via {{ unified→native }}) -->
  </span>
</span>
```
Evidence `Cee` (span variant): `d(0,"span",6,1)(2,"span",5),V(3,Fee,…"ng-template",2) …` with
`Mt("emoji-mart-emoji-native",e.isNative)("emoji-mart-emoji-custom",e.custom)`,
`xt("title",e.title)("aria-label",e.label)`, `H("ngStyle",e.style)`; the native text template `Fee`:
`_(0),Je(g(2).unified)` — writes the (converted) glyph. `vee` is the `<button>` variant used when
`useButton=true` (not the app's case).

### 3.6 Preview footer `<emoji-preview>` (`FC`, @ ~**725900**, `decls:9`)

```html
<!-- hovered-emoji state (jee, *ngIf="emoji && emojiData") -->
<div class="emoji-mart-preview" ...> ...hovered emoji big + name + shortnames + emoticons... </div>
<!-- idle state (always rendered, [hidden]="emoji") -->
<div class="emoji-mart-preview" [hidden]="emoji">
  <div class="emoji-mart-preview-emoji">
    <ngx-emoji *ngIf="idleEmoji && idleEmoji.length"
      [emoji]="idleEmoji" [size]="…" [isNative] [skin] [set] [sheetSize] …></ngx-emoji>  <!-- 🏬 department_store -->
  </div>
  <div class="emoji-mart-preview-data">
    <span class="emoji-mart-title-label">{{ title }}</span>  <!-- "Emoji Mart™" -->
  </div>
  <div class="emoji-mart-preview-skins">
    <emoji-skins [skin]="emojiSkin" [i18n] (changeSkin)="skinChange.emit($event)"></emoji-skins>
  </div>
</div>
```
Evidence: `template:function… V(0,jee,…"div",0), d(1,"div",1)(2,"div",2),V(3,Vee,…"ngx-emoji",3),u(),
d(4,"div",4)(5,"span",5),_(6),u()(), d(7,"div",6)(8,"emoji-skins",7)…` with `Je(o.title)` into the
title-label span, `H("hidden",o.emoji)`, `H("ngIf",o.idleEmoji&&o.idleEmoji.length)`, and the hovered
block (`jee`) rendering `.emoji-mart-preview-name` (the `name`) + `*ngFor` of
`.emoji-mart-preview-shortname` (`:shortname:`) and `.emoji-mart-preview-emoticon`.

### 3.7 Skin swatches `<emoji-skins>` (`LR`, @ ~**724300**)

```html
<section class="emoji-mart-skin-swatches" [class.opened]="opened">
  <span class="emoji-mart-skin-swatch" *ngFor="let t of [1,2,3,4,5,6]" [class.selected]="isSelected(t)">
    <span class="emoji-mart-skin emoji-mart-skin-tone-{t}" role="button"
          [tabIndex] (click) (keyup.enter) (keyup.space)></span>
  </span>
</section>
```
Evidence: `skinTones=[1,2,3,4,5,6]`, `selectors:[["emoji-skins"]]`, consts `[1,"emoji-mart-skin-swatches"]`,
`[1,"emoji-mart-skin-swatch"]`, `role="button"`. Collapsed by default (`opened=false`); clicking opens the
row, clicking a swatch emits `changeSkin`. Persisted to `emoji-mart.skin`.

---

## 4. Anchor + search SVG icons (verbatim path data)

`BR` (category anchor icons, viewBox `0 0 24 24`, `fill:currentColor`, height 18px) @ ~**723480**;
`UR` (search icons, viewBox `0 0 20 20`) @ ~**723300**. Extracted verbatim into
`web/src/lib/emoji/data.ts` (`ANCHOR_ICONS`, `SEARCH_ICON`, `CLEAR_ICON`). Keys present in `BR`:
`activity, custom, flags, foods, nature, objects, people, places, recent, symbols` (the used set here is
`recent, people, nature, foods, activity, places, objects, symbols, flags` — `custom` unused, no custom
category). `UR` = `{ search, delete }`.

Example (`recent`): `M13 4h-2v7H9v2h2v2h2v-2h4v-2h-4zm-1-4a12 12 0 1 0 0 24 12 12 0 0 0 0-24m0 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20`
Example (`search`): `M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z`
(All 12 path strings live in `data.ts`; they are byte-for-byte from the bundle.)

---

## 5. i18n strings (bundle `jR` @ **744541**, verbatim)

```
search: "Search"      emojilist: "List of emoji"    notfound: "No Emoji Found"    clear: "Clear"
categories: {
  search:  "Search Results"
  recent:  "Frequently Used"     <-- the "recent" category label the room shows
  people:  "Smileys & People"
  nature:  "Animals & Nature"
  foods:   "Food & Drink"
  activity:"Activity"            <-- note: PR name is "Activities", but THIS wins for display
  places:  "Travel & Places"
  objects: "Objects"
  symbols: "Symbols"
  flags:   "Flags"
  custom:  "Custom"
}
skintones: { 1:"Default Skin Tone", 2:"Light Skin Tone", 3:"Medium-Light Skin Tone",
             4:"Medium Skin Tone", 5:"Medium-Dark Skin Tone", 6:"Dark Skin Tone" }
```

---

## 6. Emoji DATASET — location, encoding, extraction (the important one)

**The dataset IS in this bundle** (not lazy-loaded). Two structures:

### 6a. `const PR=[…]` @ byte offset **318881** — category order + membership

8 real categories, each `{ id, name, emojis:[<unified>…] }`. `emojis` is an **ordered array of
unified-hex codepoint strings** (e.g. `"1F600"`, `"263A-FE0F"`, `"1F636-200D-1F32B-FE0F"`,
`"1F1E6-1F1E8"`). Byte offsets of each category header (`grep`/slice-verified):

| id | PR name | @ abs | count (unified) |
|---|---|---|---|
| people | Smileys & People | 318892 | 524 |
| nature | Animals & Nature | 326531 | 144 |
| foods | Food & Drink | 327795 | 132 |
| activity | Activities | 328902 | 86 |
| places | Travel & Places | 329678 | 218 |
| objects | Objects | 331683 | 255 |
| symbols | Symbols | 333991 | 221 |
| flags | Flags | 336151 | 269 |

`PR` closes @ ~**340049**. Total unified across `PR` = **1849**. `PR` carries **no** shortcodes/names —
only the unified order + category grouping.

### 6b. `See=[…]` @ byte offset **340050** → **709916** — the master emoji table

Immediately follows `PR`. **1854 entries**, each
`{ name, unified, text?, emoticons?, keywords[], sheet[r,c], skinVariations?, obsoletes?, obsoletedBy?,
shortNames?, shortName }`. Example:
`{name:"Grinning Face",unified:"1F600",text:":D",keywords:[…],sheet:[32,20],shortName:"grinning"}`.
This is the `emoji-datasource-apple@14.0.0` "compact" table. The data service `f_` (@ **710100**)
`uncompress(See)`: sets `id=shortName`, `shortNames.unshift(shortName)`, and
**`native = unifiedToNative(unified)`** where (@ ~**711360**):
```js
unifiedToNative(e){ const i=e.split("-").map(o=>parseInt(`0x${o}`,16)); return String.fromCodePoint(...i) }
```
Skin-tone modifiers `Tee=["1F3FA","1F3FB","1F3FC","1F3FD","1F3FE","1F3FF"]` follow `See` @ ~**709918**.

### 6c. Join → our `{ native, name, shortcode }` dataset

For each category in `PR` order, each unified is looked up in `See` (via `unified` key), and we emit
`{ native: unifiedToNative(unified), name: See.name, shortcode: See.shortName }`. Two exact fidelity rules
applied to match the picker:
- **Obsolete filter (`hideObsolete=true`)**: `filterEmojis` in `yC` skips any emoji whose data has
  `obsoletedBy`. There are **37** such entries, **all in `people`** (old blond/gendered variants that a
  newer ZWJ sequence supersedes). Omitted → `people` becomes **487** (524−37).
- **Zero missing**: all 1849 unified resolved in `See` (0 unmatched). Final total = **1812** emojis:
  people 487, nature 144, foods 132, activity 86, places 218, objects 255, symbols 221, flags 269.

Extraction is committed as `web/src/lib/emoji/data.ts` (`EMOJI_CATEGORIES`), category display labels from
the §5 i18n (so `activity` → "Activity"). **No emoji is invented; every glyph comes from the bundle's own
`unifiedToNative`.**

### 6d. Frequently-used defaults + persistence (service `OR` @ ~**723700**)

`NAMESPACE="emoji-mart"`. Persists to `localStorage["emoji-mart.frequently"]` (a `{shortName:count}` map)
and `localStorage["emoji-mart.last"]`. On first run (no storage) `get(perLine=9, totalFrequentLines=4)`
returns `DEFAULTS.slice(0, perLine)` — the first **9** of:
`DEFAULTS=["+1","grinning","kissing_heart","heart_eyes","laughing","stuck_out_tongue_winking_eye",
"sweat_smile","joy","scream","disappointed","unamused","weary","sob","sunglasses","heart","poop"]`.
Resolved first-9 glyphs (via `See`): 👍 `+1`, 😀 `grinning`, 😘 `kissing_heart`, 😍 `heart_eyes`,
😆 `laughing`, 😜 `stuck_out_tongue_winking_eye`, 😅 `sweat_smile`, 😂 `joy`, 😱 `scream`.
Committed as `DEFAULT_FREQUENT` in `data.ts`; storage keys as `FREQUENTLY_KEY`/`LAST_KEY`.

---

## 7. How the APP instantiates `<emoji-mart>` (byte-cited)

Every `emojiSelect` occurrence was checked. The composer's emoji popover template is `J1e` (top-level
`ng-template`, `main.js` @ **1423955**; consts slot 55 = `[3,"emojiSelect"]`). Compiled render fn @ **1424017**:
```js
function J1e(t,n){ if(1&t){ const e=Q(); d(0,"emoji-mart",55),
  M("emojiSelect",function(o){return D(e),E(g().selectEmoji(o))}), u() } }
```
i.e. **`<emoji-mart (emojiSelect)="selectEmoji($event)"></emoji-mart>`**. The app binds **exactly one thing:
the `emojiSelect` output**. It binds **no inputs whatsoever** — no `isNative`, no `darkMode`, no `set`, no
`title`, no `emoji`, no `showPreview`, no `perLine`, no `color`, no `include`/`exclude`, no `custom`,
no `i18n`. **⇒ Every value in §2 is the effective runtime value** (only `darkMode` varies with the OS/theme
media query; the room boots `lightTheme`, so `darkMode=false` and `.emoji-mart-dark` is off in the room).

The other `emojiSelect` byte hits (745710, 750741, 751435, 753167/753180, plus the 1.3M–2.4M range) are
inside the **library's own** component defs (outputs map / template bindings) and other components' unrelated
templates — **not** additional `<emoji-mart>` instantiations. The composer `J1e` is the app's only usage
site (the same template is reused for the Add-Reaction popover per `chat-composer.md`).

**Honest divergence for our replica (documented in `data.ts` header):** the reference default `isNative=false`
means the reference paints **Apple sprite sheets** via `backgroundImageFn` (jsDelivr CDN,
`emoji-datasource-apple@14.0.0/img/apple/sheets-256/64.png`) — an external image host. Our replica renders
the **native Unicode glyph** (`.emoji-mart-emoji-native` mode, which the reference CSS already fully styles),
because (a) the task pins native rendering and (b) a third-party sprite CDN is not viable in our SvelteKit
app/CSP. The dataset, order, labels, and every other visual are reference-exact.

---

## 8. Global CSS (verbatim, `styles.d622cb9ed2bbc221.css`)

Extracted with `grep -o "[^{}]*emoji-mart[^{}]*{[^}]*}"` — **all 80 rules** below, byte-for-byte. (Note the
selector is the **class** `.emoji-mart`, not the element `emoji-mart`; the picker root gets `class="emoji-mart"`.)

```css
.emoji-mart,.emoji-mart *{box-sizing:border-box;line-height:1.15}
.emoji-mart{font-family:-apple-system,BlinkMacSystemFont,Helvetica Neue,sans-serif;font-size:16px;display:inline-block;color:#222427;border:1px solid #d9d9d9;border-radius:5px;background:#fff}
.emoji-mart .emoji-mart-emoji{padding:6px}
.emoji-mart-bar{border:0 solid #d9d9d9}
.emoji-mart-bar:first-child{border-bottom-width:1px;border-top-left-radius:5px;border-top-right-radius:5px}
.emoji-mart-bar:last-child{border-top-width:1px;border-bottom-left-radius:5px;border-bottom-right-radius:5px}
.emoji-mart-anchors{display:flex;flex-direction:row;justify-content:space-between;padding:0 6px;line-height:0}
.emoji-mart-anchor{position:relative;display:block;flex:1 1 auto;color:#858585;text-align:center;padding:12px 4px;overflow:hidden;transition:color .1s ease-out;margin:0;box-shadow:none;background:none;border:none}
.emoji-mart-anchor:focus{outline:0}
.emoji-mart-anchor:hover,.emoji-mart-anchor:focus,.emoji-mart-anchor-selected{color:#464646}
.emoji-mart-anchor-selected .emoji-mart-anchor-bar{bottom:0}
.emoji-mart-anchor-bar{position:absolute;bottom:-3px;left:0;width:100%;height:3px;background-color:#464646}
.emoji-mart-anchors i{display:inline-block;width:100%;max-width:22px}
.emoji-mart-anchors svg,.emoji-mart-anchors img{fill:currentColor;height:18px}
.emoji-mart-scroll{overflow-y:scroll;height:270px;padding:0 6px 6px;will-change:transform}
.emoji-mart-search{margin-top:6px;padding:0 6px;position:relative}
.emoji-mart-search input{font-size:16px;display:block;width:100%;padding:5px 25px 6px 10px;border-radius:5px;border:1px solid #d9d9d9;outline:0}
.emoji-mart-search input,.emoji-mart-search input::-webkit-search-decoration,.emoji-mart-search input::-webkit-search-cancel-button,.emoji-mart-search input::-webkit-search-results-button,.emoji-mart-search input::-webkit-search-results-decoration{-webkit-appearance:none}
.emoji-mart-search-icon{position:absolute;top:3px;right:11px;z-index:2;padding:2px 5px 1px;border:none;background:none}
.emoji-mart-category .emoji-mart-emoji span{z-index:1;position:relative;text-align:center;cursor:default}
.emoji-mart-category .emoji-mart-emoji:hover:before{z-index:0;content:"";position:absolute;top:0;left:0;width:100%;height:100%;background-color:#f4f4f4;border-radius:100%}
.emoji-mart-category-label{z-index:2;position:relative;position:sticky;top:0}
.emoji-mart-category-label span{display:block;width:100%;font-weight:500;padding:5px 6px;background-color:#fff;background-color:#fffffff2}
.emoji-mart-category-list{margin:0;padding:0}
.emoji-mart-category-list li{list-style:none;margin:0;padding:0;display:inline-block}
.emoji-mart-emoji{position:relative;display:inline-block;font-size:0;margin:0;padding:0;border:none;background:none;box-shadow:none}
.emoji-mart-emoji-native{font-family:"Segoe UI Emoji",Segoe UI Symbol,Segoe UI,"Apple Color Emoji",Twemoji Mozilla,"Noto Color Emoji","Android Emoji"}
.emoji-mart-no-results{font-size:14px;text-align:center;padding-top:70px;color:#858585}
.emoji-mart-no-results .emoji-mart-category-label{display:none}
.emoji-mart-no-results .emoji-mart-no-results-label{margin-top:.2em}
.emoji-mart-no-results .emoji-mart-emoji:hover:before{content:none}
.emoji-mart-preview{position:relative;height:70px}
.emoji-mart-preview-emoji,.emoji-mart-preview-data,.emoji-mart-preview-skins{position:absolute;top:50%;transform:translateY(-50%)}
.emoji-mart-preview-emoji{left:12px}
.emoji-mart-preview-data{left:68px;right:12px;word-break:break-all}
.emoji-mart-preview-skins{right:30px;text-align:right}
.emoji-mart-preview-skins.custom{right:10px;text-align:right}
.emoji-mart-preview-name{font-size:14px}
.emoji-mart-preview-shortname{font-size:12px;color:#888}
.emoji-mart-preview-shortname+.emoji-mart-preview-shortname,.emoji-mart-preview-shortname+.emoji-mart-preview-emoticon,.emoji-mart-preview-emoticon+.emoji-mart-preview-emoticon{margin-left:.5em}
.emoji-mart-preview-emoticon{font-size:11px;color:#bbb}
.emoji-mart-title span{display:inline-block;vertical-align:middle}
.emoji-mart-title .emoji-mart-emoji{padding:0}
.emoji-mart-title-label{color:#999a9c;font-size:26px;font-weight:300}
.emoji-mart-skin-swatches{font-size:0;padding:2px 0;border:1px solid #d9d9d9;border-radius:12px;background-color:#fff}
.emoji-mart-skin-swatches.custom{font-size:0;border:none;background-color:#fff}
.emoji-mart-skin-swatches.opened .emoji-mart-skin-swatch{width:16px;padding:0 2px}
.emoji-mart-skin-swatches.opened .emoji-mart-skin-swatch.selected:after{opacity:.75}
.emoji-mart-skin-swatch{display:inline-block;width:0;vertical-align:middle;transition-property:width,padding;transition-duration:.125s;transition-timing-function:ease-out}
.emoji-mart-skin-swatch:nth-child(1){transition-delay:0s}
.emoji-mart-skin-swatch:nth-child(2){transition-delay:.03s}
.emoji-mart-skin-swatch:nth-child(3){transition-delay:.06s}
.emoji-mart-skin-swatch:nth-child(4){transition-delay:.09s}
.emoji-mart-skin-swatch:nth-child(5){transition-delay:.12s}
.emoji-mart-skin-swatch:nth-child(6){transition-delay:.15s}
.emoji-mart-skin-swatch.selected{position:relative;width:16px;padding:0 2px}
.emoji-mart-skin-swatch.selected:after{content:"";position:absolute;top:50%;left:50%;width:4px;height:4px;margin:-2px 0 0 -2px;background-color:#fff;border-radius:100%;pointer-events:none;opacity:0;transition:opacity .2s ease-out}
.emoji-mart-skin-swatch.custom{display:inline-block;width:0;height:38px;overflow:hidden;vertical-align:middle;transition-property:width,height;transition-duration:.125s;transition-timing-function:ease-out;cursor:default}
.emoji-mart-skin-swatch.custom.selected{position:relative;width:36px;height:38px;padding:0 2px 0 0}
.emoji-mart-skin-swatch.custom.selected:after{content:"";width:0;height:0}
.emoji-mart-skin-swatches.custom .emoji-mart-skin-swatch.custom:hover{background-color:#f4f4f4;border-radius:10%}
.emoji-mart-skin-swatches.custom.opened .emoji-mart-skin-swatch.custom{width:36px;height:38px;padding:0 2px 0 0}
.emoji-mart-skin-swatches.custom.opened .emoji-mart-skin-swatch.custom.selected:after{opacity:.75}
.emoji-mart-skin-text.opened{display:inline-block;vertical-align:middle;text-align:left;color:#888;font-size:11px;padding:5px 2px;width:95px;height:40px;border-radius:10%;background-color:#fff}
.emoji-mart-skin{display:inline-block;width:100%;padding-top:100%;max-width:12px;border-radius:100%}
.emoji-mart-skin-tone-1{background-color:#ffc93a}
.emoji-mart-skin-tone-2{background-color:#fadcbc}
.emoji-mart-skin-tone-3{background-color:#e0bb95}
.emoji-mart-skin-tone-4{background-color:#bf8f68}
.emoji-mart-skin-tone-5{background-color:#9b643d}
.emoji-mart-skin-tone-6{background-color:#594539}
.emoji-mart-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}
.emoji-mart-dark{color:#fff;border-color:#555453;background-color:#222}
.emoji-mart-dark .emoji-mart-bar{border-color:#555453}
.emoji-mart-dark .emoji-mart-search input{color:#fff;border-color:#555453;background-color:#2f2f2f}
.emoji-mart-dark .emoji-mart-search-icon svg{fill:#fff}
.emoji-mart-dark .emoji-mart-category .emoji-mart-emoji:hover:before{background-color:#444}
.emoji-mart-dark .emoji-mart-category-label span{background-color:#222;color:#fff}
.emoji-mart-dark .emoji-mart-skin-swatches{border-color:#555453;background-color:#222}
.emoji-mart-dark .emoji-mart-anchor:hover,.emoji-mart-dark .emoji-mart-anchor:focus,.emoji-mart-dark .emoji-mart-anchor-selected{color:#bfbfbf}
```

### popOverDiv wrapper (the popover the picker sits inside)
```css
.popOverDiv .popover-body{padding:0!important}
.popOverDiv .arrow{right:0!important}
```
(Also relevant from `chat-composer.md`: the composer's scoped
`.bs-popover-top>.arrow:after{border-top-color:var(--modal-content-bg-color)}` colours the popover arrow tip
when it opens above the composer.)

---

## 9. Behaviour (from templates/class methods)

- **Anchor click** (`handleAnchorClick`): sets `selected`, clears any search, scrolls `scrollRef` so the
  category's `top` is at the top (`scrollTop = categoryRef.top`, or `0` for the first category), sets
  `nextScroll` so the next scroll event keeps `selected` pinned.
- **Scroll** (`handleScroll`): recomputes `selected` from scroll position (top→first category; bottom→last;
  else the category whose `handleScroll(scrollTop)` returns truthy). This is the "selected anchor tracks
  scroll" behaviour.
- **Search** (`emojiSearch.search`): tokenises the query on `/[\s|,|\-|_]+/`, matches against a per-emoji
  search string built from `short_names + name + id + keywords + emoticons` (`buildSearch`); `-`/`-1` and
  `+`/`+1` are special-cased; capped at `maxResults=75`. Empty query → normal categories; non-empty →
  only the `Search` category renders (`SEARCH_CATEGORY.emojis`); no matches → the category's
  `.emoji-mart-no-results` state with `i18n.notfound` ("No Emoji Found") + the `sleuth_or_spy` emoji.
- **Hover preview** (`handleEmojiOver`/`Leave`): sets `previewEmoji` (shown in the footer); on leave a rAF
  clears it back to idle.
- **Select** (`handleEmojiClick`): emits `emojiClick` **and** `emojiSelect` (the event the app listens to),
  and `frequently.add(emoji)` (unless recent hidden) to persist frequently-used.
- **Skin change**: persists `emoji-mart.skin`, emits `skinChange`.

---

## 10. Honest gaps

- **No open-state capture** — same gap as `chat-composer.md`: no screenshot/computed-style dump exists with
  the picker open. The DOM tree, defaults, dataset, and CSS are all decoded from the compiled bundle + the
  global stylesheet (the authoritative sources), but the assembled pixel layout has **not** been diffed
  against a live rendered picker. This is an honest structural/style decode, not a screenshot match.
- **Sprite vs native (intentional divergence, §7)** — the reference default is `isNative=false` (Apple
  sprite sheets from jsDelivr). Our replica uses native glyphs. Consequence: exact per-emoji artwork differs
  (Apple sprites vs the viewer's OS emoji font). Everything else (order, categories, labels, spacing,
  colours, the preview/search/anchor chrome) is reference-exact. Flagged in `data.ts` and here.
- **`measureScrollbar` in the width formula** is measured at runtime (native scrollbar width); it is 0 on
  macOS overlay scrollbars and ~15–17px on Windows/Linux. The replica uses the CSS-visible width
  `perLine*(emojiSize+12)+12+2` = 338px content box plus the browser's scrollbar, matching the formula's
  intent without hard-coding a scrollbar constant.
- **Preview "Emoji Mart™" idle title** — this is the *library default* `title`. The app binds no `title`, so
  the reference picker genuinely shows "Emoji Mart™" with the 🏬 `department_store` idle emoji. That is the
  faithful value; retained in the replica (not a placeholder).
- **Skin swatches** — present by default in the reference (`showPreview=true` renders `<emoji-skins>`), but
  in **native** mode toggling skin tone only affects sprite selection; with native glyphs the skin modifier
  is applied by appending the Unicode skin-tone codepoint. The replica renders the swatch chrome faithfully;
  full per-emoji skin-variation application is a documented follow-up in the component (see its comment).
- **`emoji-datasource-apple@14.0.0`** is the pinned dataset version (from `backgroundImageFn`). Emoji added
  after datasource 14.0.0 are absent from the reference *and* from our extraction — this is faithful, not a
  gap in the replica.
