# Chat composer

The message-entry surface at the bottom of the main group-chat panel: the typing-indicator row, the
`#textAreaHolder` / `.textSendDiv` container, the `#textAreaTxt` textarea, and the `.textAreaBtnsCol`
button column (collapsed single **+** button vs. the expanded emoji / image / GIF / RTE row). Rendered by
the Angular group-chat component whose scoped id in the live capture is `_ngcontent-ng-c3761163150`
(the `%COMP%` placeholder in the bundle).

All markup, class lists, and slot indices below come from the live bundle
`docs/reference/live-bundle/main.d6f5272aa3783e43.js`: the component's `consts:[...]` array starts at byte
offset **1447148** (id `#textAreaHolder`, `typing-indicator-container`, `textAreaTxt`, `textAreaBtnsCol`),
its `template:function` render fn immediately follows, and the sub-template functions
`Z1e`/`e0e`/`t0e`/`l0e`/`c0e`/`u0e`/`J1e` sit at offsets 1424083–1427136. The
`app-typing-indicator-dots` child component (class `a6`) is defined at offset **1419185**.

---

## DOM structure

The composer region is emitted by four sibling slots of the group-chat component's root template
(`main.js` template render fn @ 1447148):

```
V(21, Z1e, ...)   // webinar-mode banner  — shown when o.webinarMode
V(22, e0e, ...)   // typing indicator     — shown when o.showTyping && o.usersTypingCnt > 0
V(23, c0e, ...)   // composer (#textAreaHolder) — when o.isConnected && o.chatEnabled ... else
V(24, u0e, ...)   // "Chat Disabled" panel      — when NOT (isConnected && chatEnabled)
```
Control flow (2&i branch of the render fn):
`O(22, o.showTyping && o.usersTypingCnt>0 ? 22 : -1)` and
`O(23, o.isConnected && o.chatEnabled ? 23 : 24)`.

### 1. Typing indicator — `e0e` (`main.js` @ 1424188), consts slots 58–61

```html
<div>
  <div class="d-flex align-items-center typing-indicator-container">            <!-- slot 58 -->
    <strong class="users-count me-1">[{{usersTypingCnt}}]</strong>              <!-- slot 59 -->
    <app-typing-indicator-dots></app-typing-indicator-dots>                     <!-- child cmp a6 -->
    <span class="users-typing">                                                <!-- slot 60 -->
      <em class="mx-1">{{usersTyping}}</em>                                     <!-- slot 61, innerHTML -->
    </span>
  </div>
</div>
```
Bindings (2&t): `m(3), Ie("[", e.usersTypingCnt, "]")` writes `[N]` into the `<strong>`;
`m(4), Je(e.usersTyping)` sets the `<em>` via innerHTML (`Je` = `ɵɵproperty('innerHTML')` sanitized).

`app-typing-indicator-dots` template (class `a6`, `main.js` @ 1419185), `consts:[[1,"typing-indicator"]]`:
```html
<div class="typing-indicator"><span></span><span></span><span></span></div>
```

### 2. Composer — `c0e` (`main.js` @ 1426538), consts slots 25 & 62–65

```html
<div id="textAreaHolder" class="d-flex align-items-center textSendDiv">        <!-- slot 25 -->
  <div class="flex-fill d-flex mx-0" #chatWidth>                               <!-- slot 62, local ref "chatWidth" -->
    <div class="px-0 flex-fill">                                              <!-- slot 63 -->
      <textarea name="txt-area" id="textAreaTxt" rows="1" spellcheck="true"    <!-- slot 64 -->
                placeholder="Type your message here.."
                class="txt-area form-control border-0"
                (keyup)="onKey($event)" (paste)="onImagePaste($event)"
                (keydown.enter)="onKeydown($event)"
                (focus)="onTextareaFocus($event,'textAreaTxt')"></textarea>
    </div>
    <div class="justify-content-center d-flex flex-row align-items-center       <!-- slot 65 = .textAreaBtnsCol -->
                justify-content-center p-0 m-0 text-center textAreaBtnsCol">
      <!-- slot 6: showMessageOptions ? l0e(expanded) : t0e(collapsed +) -->
    </div>
  </div>
</div>
```
`c0e` 2&t branch: `m(6), O(6, e.showMessageOptions ? 7 : 6)` — chooses `l0e` (expanded) when
`showMessageOptions` is true, `t0e` (single plus) when false.

#### 2a. Collapsed button — `t0e` (`main.js` @ 1424459), slots 67/68
```html
<span class="textAreaBtns" (click)="toggleMessageOptions()">                    <!-- slot 67 -->
  <i class="fas fa-plus" ngbTooltip="Show message options" placement="left"></i><!-- slot 68 -->
</span>
```

#### 2b. Expanded button row — `l0e` (`main.js` @ 1425xxx), slots 66/67/69/70/71/73/89
```html
<span class="textAreaBtns" placement="auto" container="body" autoClose="outside"     <!-- slot 69 -->
      popoverClass="popOverDiv" [ngbPopover]="emojiTemplate(ref 20)"
      (click)="toggleEmojiPanel()">
  <i class="far fa-smile" placement="left" ngbTooltip="Add Emojis"></i>               <!-- slot 70 -->
</span>

<!-- @if canPostImages -->
<span class="textAreaBtns" (click)="imgUpload()">                                     <!-- slot 67, n0e -->
  <i class="fas fa-image" ngbTooltip="Upload an Image" placement="left"></i>          <!-- slot 73 -->
</span>

<!-- @if isPresenter -->
<span data-bs-toggle="modal" data-bs-target="#play-youtube-modal" class="textAreaBtns"><!-- slot 71, i0e -->
  <i class="fas fa-video" ngbTooltip="Play YouTube For All" placement="left"></i>     <!-- slot 74 -->
</span>

<!-- @if canPostImages : GIF (r0e) -->
<span class="textAreaBtns" [ngbPopover]="giphyTemplate" ngbTooltip="Search for GIFs"  <!-- slot 75 -->
      placement="top" container="body" autoClose="outside" popoverClass="popOverDiv"
      triggers="manual" style="font-size:12px" (click)="toggleGiphyPanel(popover)">
  <span>GIF</span>
  <ng-template>…giphy-search panel…</ng-template>
</span>

<!-- @if enableRTE (sessData & prefs & isPresenter) -->
<span class="textAreaBtns" (click)="openRTEModal()">                                  <!-- slot 67, a0e -->
  <i class="fas fa-font" ngbTooltip="Rich Text Editor" placement="left"></i>          <!-- slot 89 -->
</span>
```
`l0e` conditions (2&t): `H("ngbPopover",Nt(20))` on the emoji span; then
`O(2, e.canPostImages?2:-1)` (image), `O(3, e.isPresenter?3:-1)` (youtube),
`O(4, e.canPostImages?4:-1)` (GIF),
`O(5, e.appService.globals.sessData.enableRTE && e.appService.globals.preferences.enableRTE && e.appService.globals.isPresenter ?5:-1)` (RTE).

**Emoji popover content** — `Nt(20)` resolves to `J1e` (`main.js` @ 1423955), an `ng-template` at top-level
slot 19, consts slot 55 `[3,"emojiSelect"]`:
```html
<emoji-mart (emojiSelect)="selectEmoji($event)"></emoji-mart>
```
So the "emoji picker in bundle" is `emoji-mart` (ngx-emoji-mart's `<emoji-mart>` element), styled by the
global `emoji-mart{…}` rules (see Global CSS).

### 3. "Chat Disabled" fallback — `u0e` (`main.js` @ 1427136), slots 90–92
```html
<div class="chatDisabled d-flex align-items-center">
  <h5 class="pl-3"><i class="fas fa-lock"></i> Chat Disabled
    <span *ngIf="chatMutedTill"> till {{ chatMutedTill | date:'EEE @ h:mm a' }}</span>
  </h5>
</div>
```

### Role variants
- **member vs staff/admin/presenter:** the DOM tree is identical; individual expanded buttons are gated
  by flags, not by an explicit role: image upload → `canPostImages`, YouTube → `isPresenter`, GIF →
  `canPostImages`, RTE → `enableRTE && isPresenter`. In the **member** capture
  (`docs/reference/captures/proroom-full-member.json`) the expanded row rendered emoji + image + GIF (no
  video/RTE — member is not presenter).
- **`showMessageOptions` auto-set:** in `ngOnInit` the component subscribes to `resizeChatView` and sets
  `this.showMessageOptions = this.chatWidth?.nativeElement?.offsetWidth >= 400`
  (`main.js`, component class `p0e` @ ~1427800). The member capture has a 478 px `chatWidth`, so the row was
  expanded (no lone **+**).
- **Private-chat (PM) composer** is a *separate* component (`#textAreaHolderPM` / `#textAreaTxtPM`,
  `main.js` @ 2214168) — out of scope for this surface, but note its scoped CSS differs slightly (see gaps).

---

## Scoped CSS (verbatim)

Extracted from the group-chat component `styles:[...]` block in `main.d6f5272aa3783e43.js` (the block that
immediately follows the template render fn at offset 1447148). `%COMP%` is the component scope attribute.

```css
.textAreaBtns[_ngcontent-%COMP%]{padding:5px;color:var(--dark-gray)}
.custom-file[_ngcontent-%COMP%]{display:none}
.input-group-text[_ngcontent-%COMP%]{padding:0;margin:0}
.textAreaBtnsCol[_ngcontent-%COMP%]{background-color:var(--textarea-bg)!important;color:var(--dark-gray)!important}
.textAreaBtns[_ngcontent-%COMP%]{color:var(--textarea-holder-btns-color)!important}
.textAreaBtns[_ngcontent-%COMP%]:hover{color:var(--textarea-holder-btns-hover-color)!important;cursor:pointer}
.txt-area[_ngcontent-%COMP%]{border-radius:0;border:1px solid #ffffff;font-size:14px;resize:none;color:var(--textarea-color)!important;background-color:var(--textarea-bg)!important;outline:none;overflow-y:auto;margin-left:0;margin-right:0;padding-left:5px;padding-right:5px}
.txt-area[_ngcontent-%COMP%]:focus{border-color:var(--darker-gray);box-shadow:1px 1px 1px var(--darker-gray)}
.textAreaBtnSelected[_ngcontent-%COMP%]{background-color:#f1f2f3}
#textAreaHolder[_ngcontent-%COMP%]{background-color:var(--textarea-bg);border-radius:8px;padding:5px;margin:5px}
.typing-indicator-container[_ngcontent-%COMP%]{margin:0 8px;border-top:1px solid #ccc}
.users-count[_ngcontent-%COMP%], .users-typing[_ngcontent-%COMP%]{color:#90949c;font-size:12px}
.users-typing[_ngcontent-%COMP%]{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.users-typing[_ngcontent-%COMP%]   em[_ngcontent-%COMP%]{font-weight:700}
#textAreaTxt[_ngcontent-%COMP%]{max-height:300px;width:100%}
#textAreaTxt[_ngcontent-%COMP%], .textAreaBtnsCol[_ngcontent-%COMP%]{background-color:var(--textarea-bg)}
img[_ngcontent-%COMP%]{max-width:100%}
```

Note: `.textAreaBtns` is declared **twice**; the second (`color:var(--textarea-holder-btns-color)!important`)
wins over the first (`color:var(--dark-gray)`).

Popover-arrow rule that applies when the emoji/GIF popover opens above the composer:
```css
.bs-popover-top[_ngcontent-%COMP%] > .arrow[_ngcontent-%COMP%]:after, .bs-popover-auto[x-placement^=top][_ngcontent-%COMP%] > .arrow[_ngcontent-%COMP%]:after{border-top-color:var(--modal-content-bg-color)}
```

**typing-indicator-dots** child component `styles:[...]` (`main.js` @ 1419185, scope of `app-typing-indicator-dots`):
```css
.typing-indicator[_ngcontent-%COMP%]{display:flex!important}
.typing-indicator[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]{height:3px;width:3px;float:left;margin:0 1px;background-color:#9e9ea1;display:block;border-radius:50%;opacity:.4}
.typing-indicator[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:nth-of-type(1){animation:1.5s _ngcontent-%COMP%_blink infinite .3333s}
.typing-indicator[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:nth-of-type(2){animation:1.5s _ngcontent-%COMP%_blink infinite .6666s}
.typing-indicator[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:nth-of-type(3){animation:1.5s _ngcontent-%COMP%_blink infinite .9999s}
@keyframes _ngcontent-%COMP%_blink{50%{opacity:1}}
```

GIF-popover panel scoped CSS (rendered from the GIF button's `ng-template`, same component `styles`):
```css
.giphy-search[_ngcontent-%COMP%]{width:400px;height:700px;border:2px solid var(--modal-content-bg-color);background-color:#fff;overflow:hidden}
.giphy-search[_ngcontent-%COMP%]   .input-group-text[_ngcontent-%COMP%]{border:none;background-color:var(--modal-input-group-bg)}
.giphy-search[_ngcontent-%COMP%]   .fa-times[_ngcontent-%COMP%]{font-size:16.5px;padding:10px}
.giphy-search[_ngcontent-%COMP%]   .fa-times[_ngcontent-%COMP%]:hover{cursor:pointer;opacity:.85}
.giphy-header[_ngcontent-%COMP%]{padding:10px;background-color:var(--modal-content-bg-color)}
.search-results[_ngcontent-%COMP%]{overflow-y:auto;height:100%;padding:5px}
.gif-result[_ngcontent-%COMP%]{text-align:center}
.gif-result[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{cursor:pointer}
.giphy-hr[_ngcontent-%COMP%]{color:#fff;padding:0;margin:0 0 10px}
```

---

## Global CSS (verbatim)

From `docs/reference/live-bundle/styles.d622cb9ed2bbc221.css` — only rules that actually win on this surface.

**lightTheme token remap** (the room runs class `lightTheme`, so these override the boot `:root` defaults):
```css
.lightTheme{ … --textarea-color: var(--lightTheme-textarea-color); --textarea-bg: var(--lightTheme-textarea-bg); … }
```
(`--textarea-holder-btns-color` / `--textarea-holder-btns-hover-color` / `--dark-gray` / `--darker-gray` are
**not** remapped by lightTheme — they keep their `:root` values, see Resolved values.)

**Bootstrap `.form-control`** (applies to `#textAreaTxt.form-control`, but almost every property is overridden
by the scoped `.txt-area` rule which is more specific / uses `!important`):
```css
.form-control{display:block;width:100%;height:calc(1.5em + .75rem + 2px);padding:.375rem .75rem;font-size:.9375rem;font-weight:400;line-height:1.5;color:#444;background-color:#fff;background-clip:padding-box;border:1px solid transparent;border-radius:.25rem;transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out}
.form-control:focus{color:#444;background-color:#fff;border-color:#739ac2;outline:0;box-shadow:0 0 0 .2rem #375a7f40}
.form-control::placeholder{color:#999;opacity:1}
```
What survives from Bootstrap on the textarea after `.txt-area` overrides: `display:block`, `width:100%`,
`line-height:1.5`, the `transition`, and `::placeholder{color:#999}` for the placeholder text. `.txt-area`
overrides border-radius (0), border (`1px solid #fff`), font-size (14px), color/background (via vars,
`!important`), and `outline:none`.

**`.border-0`** (Bootstrap utility on the textarea) → `border:0!important;` (this overrides the scoped
`.txt-area{border:1px solid #fff}` because `!important` beats the scoped non-important rule).

**popOverDiv** wrapper (the emoji & GIF popovers use `popoverClass="popOverDiv"`):
```css
.popOverDiv .popover-body{padding:0!important}
.popOverDiv .arrow{right:0!important}
```

**emoji-mart** (the emoji picker element inside the emoji popover):
```css
emoji-mart,.emoji-mart *{box-sizing:border-box;line-height:1.15}
emoji-mart{font-family:-apple-system,BlinkMacSystemFont,Helvetica Neue,sans-serif;font-size:16px;display:inline-block;color:#222427;border:1px solid #d9d9d9;border-radius:5px;background:#fff}
emoji-mart .emoji-mart-emoji{padding:6px}
```

---

## Resolved values

LIVE room tokens from `proroom-all-admin.json → cssVariables.root` combined with the `.lightTheme` remap.
Computed columns are from `docs/reference/captures/proroom-full-member.json` (member, `lightTheme`,
viewport 1988×1157 @dpr 2). Var chains: `--textarea-bg → var(--lightTheme-textarea-bg) = #fff`;
`--textarea-color → var(--lightTheme-textarea-color) = #676767`; `--dark-gray = #aaa`;
`--darker-gray = #aaa6a6`; `--textarea-holder-btns-color = #676767`;
`--textarea-holder-btns-hover-color = #0a6db1`.

| Element | Property | Resolved value | Source |
|---|---|---|---|
| `#textAreaHolder` (`.textSendDiv`) | background-color | `#fff` (`rgb(255,255,255)`) | scoped `#textAreaHolder{background-color:var(--textarea-bg)}` → lightTheme `#fff`; member computed `rgb(255,255,255)` |
| `#textAreaHolder` | border-radius | `8px` | scoped rule; member computed |
| `#textAreaHolder` | padding | `5px` (L/R computed 5px) | scoped rule; member computed padding-left/right 5px |
| `#textAreaHolder` | margin | `5px` (L/R computed 5px) | scoped rule; member computed margin-left/right 5px |
| `#textAreaHolder` | display / rect | `flex`; `x5 y1107 w569 h45` | member computed / rect |
| `#textAreaTxt` (`.txt-area`) | background-color | `#fff` (`rgb(255,255,255)`) | scoped `.txt-area{background-color:var(--textarea-bg)!important}`; member computed |
| `#textAreaTxt` | color | `#676767` (`rgb(103,103,103)`) | scoped `.txt-area{color:var(--textarea-color)!important}` → lightTheme `#676767`; member computed |
| `#textAreaTxt` | font-size | `14px` | scoped `.txt-area{font-size:14px}`; member computed |
| `#textAreaTxt` | font-weight | `400` | member computed (Bootstrap `.form-control`) |
| `#textAreaTxt` | border | `0` | Bootstrap `.border-0{border:0!important}` wins over scoped `1px solid #fff`; member computed shows no border box |
| `#textAreaTxt` | border-radius | `0` | scoped `.txt-area{border-radius:0}` |
| `#textAreaTxt` | resize | `none` | scoped `.txt-area{resize:none}` |
| `#textAreaTxt` | outline | `none` | scoped `.txt-area{outline:none}`; member computed `… none 3px` |
| `#textAreaTxt` | max-height | `300px` | scoped `#textAreaTxt{max-height:300px}`; member computed |
| `#textAreaTxt` | width / height | `100%` → `478.195px` / `35px` | scoped `width:100%`; member computed/rect |
| `#textAreaTxt` | padding-left/right | `5px` / `5px` | scoped rule; member computed |
| `#textAreaTxt` | white-space | `pre-wrap` | member computed |
| `#textAreaTxt::placeholder` | color | `#999` | global `.form-control::placeholder{color:#999}` |
| `.textAreaBtnsCol` | background-color | `#fff` (`rgb(255,255,255)`) | scoped `.textAreaBtnsCol{background-color:var(--textarea-bg)!important}`; member computed |
| `.textAreaBtnsCol` | color | `#aaa` (`rgb(170,170,170)`) | scoped `.textAreaBtnsCol{color:var(--dark-gray)!important}` = `--dark-gray:#aaa`; member computed `rgb(170,170,170)` |
| `.textAreaBtnsCol` | rect | `x488 y1112 w81 h35` | member rect |
| `.textAreaBtns` (span) | color | `#676767` (`rgb(103,103,103)`) | scoped 2nd `.textAreaBtns{color:var(--textarea-holder-btns-color)!important}` = `#676767`; member computed |
| `.textAreaBtns` (span) | padding | `5px` | scoped `.textAreaBtns{padding:5px}`; member computed padding-left/right 5px |
| `.textAreaBtns` (span) | background | transparent | member computed `rgba(0,0,0,0)` |
| `.textAreaBtns:hover` | color | `#0a6db1` | scoped `.textAreaBtns:hover{color:var(--textarea-holder-btns-hover-color)!important}` = `#0a6db1` |
| `.typing-indicator-container` | margin | `0 8px` | scoped rule (main composer) |
| `.typing-indicator-container` | border-top | `1px solid #ccc` | scoped rule |
| `.users-count`, `.users-typing` | color | `#90949c` | scoped rule |
| `.users-count`, `.users-typing` | font-size | `12px` | scoped rule |
| `.users-typing` | white-space / overflow | `nowrap` / `hidden` + ellipsis | scoped rule |
| `.users-typing em` | font-weight | `700` | scoped rule |
| `.typing-indicator span` (dot) | size | `3px × 3px` | dots-component scoped rule |
| `.typing-indicator span` | background-color | `#9e9ea1` | dots-component scoped rule |
| `.typing-indicator span` | border-radius / opacity | `50%` / `.4` (→ `1` mid-blink) | dots-component scoped rule + `@keyframes blink` |

---

## States & effects

- **Textarea focus** — `.txt-area:focus{border-color:var(--darker-gray);box-shadow:1px 1px 1px var(--darker-gray)}`
  → border-color `#aaa6a6`, box-shadow `1px 1px 1px #aaa6a6`. (Bootstrap's `.form-control:focus` blue glow
  `#739ac2` / `#375a7f40` is **overridden** — the scoped rule and `.border-0` win.) Fired programmatically
  too via `(focus)="onTextareaFocus($event,'textAreaTxt')"`.
- **Button hover** — `.textAreaBtns:hover{color:var(--textarea-holder-btns-hover-color)!important;cursor:pointer}`
  → icon turns `#0a6db1`, cursor pointer.
- **Selected button** — `.textAreaBtnSelected{background-color:#f1f2f3}` (class toggled in TS; not present
  in the static captures).
- **Typing-dots animation** — three `<span>` dots, each `animation:1.5s …_blink infinite` staggered at
  `.3333s` / `.6666s` / `.9999s`; `@keyframes blink{50%{opacity:1}}` pulses each dot from `opacity:.4` to
  `1` and back. `display:flex!important` on `.typing-indicator`.
- **Collapse vs expand** — the whole `.textAreaBtnsCol` content switches on `showMessageOptions`
  (`c0e`: `O(6, showMessageOptions?7:6)`): **false** → single `fa-plus` (tooltip "Show message options",
  click `toggleMessageOptions()`); **true** → emoji / image / video / GIF / RTE row. Auto-set to `true`
  when the chat panel width ≥ 400 px (`resizeChatView` handler in `ngOnInit`).
- **Typing row hidden-until** — slot 22 renders only when `showTyping && usersTypingCnt > 0`.
- **Composer hidden-until** — slot 23 renders only when `isConnected && chatEnabled`; otherwise slot 24
  ("Chat Disabled" with optional muted-till date) shows instead.
- **Transitions** — only Bootstrap's `.form-control transition:border-color .15s, box-shadow .15s` applies
  to the textarea; the scoped rules define no transitions.
- **Popover bodies** — `.popOverDiv .popover-body{padding:0!important}` and `.arrow{right:0!important}` for
  both the emoji and GIF popovers; the top-placement arrow tip is `var(--modal-content-bg-color)`.

---

## Behavior

Provable from templates/DOM (`main.js`):

- **textarea** `#textAreaTxt` handlers: `(keyup)=onKey($event)`, `(paste)=onImagePaste($event)`
  (paste-to-upload image), `(keydown.enter)=onKeydown($event)` (Enter to send), `(focus)=onTextareaFocus(...)`.
- **+ button** (collapsed) `(click)=toggleMessageOptions()`, tooltip "Show message options", placement left.
- **Emoji button** `(click)=toggleEmojiPanel()` and `[ngbPopover]` → `<emoji-mart>` template; popover
  `placement="auto" container="body" autoClose="outside" popoverClass="popOverDiv"`. Selecting an emoji
  fires `(emojiSelect)=selectEmoji($event)`. Tooltip "Add Emojis", placement left.
- **Image button** (`@if canPostImages`) `(click)=imgUpload()`, icon `fa-image`, tooltip "Upload an Image".
- **YouTube button** (`@if isPresenter`) `data-bs-toggle="modal" data-bs-target="#play-youtube-modal"`,
  icon `fa-video`, tooltip "Play YouTube For All".
- **GIF button** (`@if canPostImages`) `(click)=toggleGiphyPanel(popover)` with a **manually-triggered**
  `ngbPopover` (`triggers="manual"`) rendering the 400×700 `.giphy-search` panel; search submits
  `(ngSubmit)=searchGiphy()`, double-clicking a result fires `sendGif(title, images.original.url)`.
- **RTE button** (`@if enableRTE && enableRTE-pref && isPresenter`) `(click)=openRTEModal()`, icon `fa-font`,
  tooltip "Rich Text Editor".
- **Typing state** driven by component fields: `usersTypingCnt` (rendered as `[N]`), `usersTyping`
  (innerHTML, may contain `<em>` for bolded names), `showTyping`, plus `typingDelayMillis=5000`,
  `lastTypedTime`, `amITyping` (from class `p0e` field initializers) that govern the typing broadcast.

---

## Honest gaps

- **No live typing-indicator capture.** In the member capture `usersTypingCnt` was 0, so slot 22 did not
  render; the dots' animated frames, the exact `usersTyping` text/markup, and the container's rendered rect
  are inferred from the bundle CSS + component fields, not from a computed capture. (A *reply*-composer
  variant's inline `<style>` in `mixed-files/odds-and-ends.html` shows `.typing-indicator-container{margin:4px 16px}`
  — a **different** value from the main composer's `margin:0 8px`; only the main composer's value is asserted
  here.)
- **Collapsed single-`+` state not captured.** The member capture rendered the *expanded* button row
  (`chatWidth` 478 px ≥ 400). The lone `fa-plus` (`t0e`) computed styles/rect are not directly captured
  (only its rule text and the `Show message options` tooltip string appear in the raw DOM).
- **Emoji popover open-state not captured.** `<emoji-mart>` markup + the global `emoji-mart{…}` styles are
  in the bundle, but no capture shows the picker open, so its internal category/search layout and computed
  rects are not evidenced here.
- **GIF popover open-state not captured** beyond its scoped CSS and template; no computed capture of an open
  Giphy panel.
- **RTE / YouTube buttons** were gated off for the member and thus absent from the member capture; their
  computed styles come only from the shared `.textAreaBtns` rules, not a per-button capture.
- **`--darker-gray` / `--dark-gray` in lightTheme:** resolved from `proroom-all-admin.json` root
  (`#aaa6a6` / `#aaa`); confirmed indirectly by the member computed `.textAreaBtnsCol` color `rgb(170,170,170)=#aaa`,
  but the focus box-shadow color `#aaa6a6` was not separately verified against a focused-textarea capture.
