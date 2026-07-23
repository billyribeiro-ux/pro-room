# Overlays & Toasts

Surface scope: the **overlay-container** + **#toast-container** ngx-toastr stack (all four type
variants, their embedded SVG icons, and the `top:70px` override), the **notConnectedOverlay /
#connectedMsg** "Conected" chip, the **imgur-modal / bootbox** image modal built by the global
`openImageModal()` function, its `downloadImage()` helper, and the **animate.css** usage.

The room runs under the `lightTheme` class — confirmed by the capture: the `<app-room#topRoomDiv>`
element carries `class="lightTheme"` (`proroom-all-admin.json`, `elements[]`, tag `app-room`,
path `app-room#topRoomDiv`, `class="lightTheme"`). All `var()` chains below are resolved against
the LIVE `:root` tokens in `proroom-all-admin.json → cssVariables.root` (294 keys).

---

## DOM structure

### 1. ngx-toastr overlay + toast stack (transient — created at runtime, absent from all captures)

The stack is built programmatically by ngx-toastr, not authored in any template. Two nested
runtime-created `<div>`s plus one toast component per active toast.

**(a) The overlay container** — created once, appended to `<body>`
(`main.d6f5272aa3783e43.js` @879119, `_createContainer`):

```
document.createElement("div")
  → classList.add("overlay-container")
  → setAttribute("aria-live","polite")
  → document.body.appendChild(...)
```

Literal result:
```html
<div class="overlay-container" aria-live="polite"> … </div>
```

**(b) The toast container** — created lazily per position, appended INTO the overlay container
(`main.d6f5272aa3783e43.js` @880123, `_createPaneElement`):

```
const o = document.createElement("div");
o.id = "toast-container";
o.classList.add(e);                 // e = positionClass = "toast-top-right"
o.classList.add("toast-container");
```

Literal result (default position — see config below):
```html
<div id="toast-container" class="toast-top-right toast-container" aria-live="polite"> … </div>
```

**(c) Each toast** — the `toast-component` (`main.d6f5272aa3783e43.js`, selector
`[["","toast-component",""]]`, `decls:5`). Host bindings: `(click)=tapToast()`,
`(mouseenter)=stickAround()`, `(mouseleave)=delayedHideToast()`; host binds the `@flyInOut`
animation, applies `toastClasses`, and sets inline `display` (`Oo("display",o.displayStyle)`).
The template is five `*ngIf` slots (`consts` array, same file, immediately after
`selectors:[["","toast-component",""]]`):

```
consts: [
  ["type","button","class","toast-close-button","aria-label","Close",3,"click",4,"ngIf"],   // slot 0: close button
  [3,"class",4,"ngIf"],                                                                       // slot 1: title
  ["role","alert",3,"class","innerHTML",4,"ngIf"],                                            // slot 2: message (enableHtml)
  ["role","alert",3,"class",4,"ngIf"],                                                        // slot 3: message (text)
  [4,"ngIf"],                                                                                 // slot 4: progress bar
  ["type","button","aria-label","Close",1,"toast-close-button",3,"click"],                   // rendered close button
  ["aria-hidden","true"],                                                                     // ×  glyph inside button
  ["role","alert",3,"innerHTML"],                                                             // message (html)
  ["role","alert"],                                                                           // message (text)
  [1,"toast-progress"]                                                                        // progress bar
]
template ngIf order:
  H("ngIf", o.options.closeButton)                    // slot 0
  H("ngIf", o.title)                                  // slot 1
  H("ngIf", o.message && o.options.enableHtml)        // slot 2
  H("ngIf", o.message && !o.options.enableHtml)       // slot 3
  H("ngIf", o.options.progressBar)                    // slot 4
```

Literal rendered toast (default config → no title, text message, closeButton per app wrapper, no
progress bar; `<toast-component>` host carries the type class):
```html
<div id="toast-container" class="toast-top-right toast-container" aria-live="polite">
  <toast-component class="ngx-toastr toast-info" style="display:block;">
    <button type="button" class="toast-close-button" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
    <div role="alert" class="toast-message">…message text…</div>
  </toast-component>
</div>
```
(Type class is one of `toast-success` / `toast-error` / `toast-info` / `toast-warning` — from
`iconClasses`, see config. `toast-title` div appears only when a title is passed; app callers pass
`""` for the title, so it is absent. `toast-progress` div appears only when `progressBar:true`.)

### 2. notConnectedOverlay / #connectedMsg chip (webcam overlay component; hidden by default)

Authored markup (`mixed-files/connected.html`, verbatim):
```html
<div
    _ngcontent-ng-c977335924=""
    id="connectedMsg"
    class="notConnectedOverlay animated fadeIn"
>
    <i _ngcontent-ng-c977335924="" class="fas fa-check"></i> Conected
</div>
```
Notes, all from the evidence:
- The literal label text is `Conected` (one "n" — a typo in the source, `connected.html`).
- `animated fadeIn` are **animate.css v3.7.2** classes (loaded from CDN — see Behavior).
- `fas fa-check` is **FontAwesome 5.8.1** (`pagesource.html` L14–18 pins
  `use.fontawesome.com/releases/v5.8.1/css/all.css`).
- Not present in ANY capture's `elements[]` (verified absent in `proroom-all-admin.json`,
  `proroom-full-presenter.json`, `docs/reference/captures/proroom-full-member.json`) because
  `#connectedMsg` is `display:none` until a connection event toggles it (see States).

### 3. imgur-modal (bootbox image modal) — built by the global `openImageModal()`

Not authored markup; produced by `window.bootbox.dialog(...)` inside the inline `<script>` in
`mixed-files/pagesource.html` (L81–138). The chat-message renderer emits the click hook
(`main.d6f5272aa3783e43.js` @1325926):
```html
<div class="img-container" onclick="openImageModal(event,'<url>')">
  <img class="uploaded-img" src="<url>"><br clear="both"/>
</div>
```
`openImageModal(event,url)` (`pagesource.html` L81–138):
- If `event.shiftKey || event.altKey || event.ctrlClick` → opens the raw image in a new blank
  window (`window.open`) with a full-screen centered black-background document (L86–120), then returns.
- Otherwise builds a bootbox dialog (L121–137):
```js
var imageName = url.substring(url.lastIndexOf("/") + 1);
return bootbox.dialog({
  onEscape: true,
  message: '<img src="' + url + '" alt="' + imageName + '" /><hr>'
         + '<button class="btn btn-primary btn-sm" onclick="downloadImage(\'' + url + "', '" + imageName + '\')">'
         + '<i class="fa fa-download"></i> Download Image</button>',
  closeButton: true,
  size: "large",          // → bootbox adds .modal-lg to the dialog
  className: "imgur-modal"
});
```
So the rendered bootbox DOM (standard bootbox/BS structure with the app additions) is:
```html
<div class="bootbox modal fade imgur-modal" tabindex="-1" role="dialog" style="display:block;">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
      </div>
      <div class="modal-body">
        <div class="bootbox-body">
          <img src="<url>" alt="<imageName>" />
          <hr>
          <button class="btn btn-primary btn-sm" onclick="downloadImage('<url>','<imageName>')">
            <i class="fa fa-download"></i> Download Image
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="modal-backdrop fade show"></div>
```
(The exact bootbox skeleton — `.close` button, `.bootbox-body` wrapper, backdrop — comes from the
bootbox library, which is `window.bootbox` per `main.d6f5272aa3783e43.js` @1029093
`ac=window.bootbox`; only the parts explicitly set by `openImageModal` — `imgur-modal` class,
`modal-lg`/large size, the `<img><hr><button>` body — are directly cited.)

`downloadImage(url, imageName)` (`pagesource.html` L139–160): XHR GET as blob → `createObjectURL`
→ synthetic `<a download>` click; strips the filename prefix up to the first `_` and the
`_<suffix>` before the extension.

**Role variants:** none — the toast stack, the connected chip, and the image modal are identical
across member / staff / admin / presenter. The connected chip lives in the webcam/presenter overlay
component; the image modal fires from any chat message with an uploaded image regardless of role.

---

## Scoped CSS (verbatim)

From `main.d6f5272aa3783e43.js` (Angular component-scoped, `[_ngcontent-%COMP%]`). The component
appears in two build variants (light/dark theme component instances); both emit **identical**
rules for this surface:

```css
.notConnectedOverlay[_ngcontent-%COMP%]{display:block;position:absolute;bottom:5px;right:5px;z-index:10000;background-color:#000;color:var(--presenter-noRecording-color);opacity:.7}
#connectedMsg[_ngcontent-%COMP%]{display:none}
```

imgur-modal scoped rules (chat-message component, `main.d6f5272aa3783e43.js` @1364268):
```css
.imgur-modal[_ngcontent-%COMP%]{text-align:center}
.imgur-modal[_ngcontent-%COMP%]   .modal-dialog[_ngcontent-%COMP%]{max-width:90%;max-height:90%}
.imgur-modal[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:inherit;height:inherit;max-width:100%;max-height:calc(100vh - 150px)}
```
The chat trigger's own scoped rule (`main.d6f5272aa3783e43.js` @1364268):
```css
.uploaded-img[_ngcontent-%COMP%]{max-width:300px;max-height:300px}
```

> NOTE on `.imgur-modal .modal-dialog[_ngcontent-%COMP%]`: the bootbox dialog is created OUTSIDE
> the Angular component (via `window.bootbox`), so its `.modal-dialog` will NOT carry the
> component's `_ngcontent-%COMP%` attribute. Therefore this scoped descendant rule likely does
> **not** actually match the runtime bootbox modal (honest gap — see below); the winning geometry
> comes from the global `.modal-lg` override instead.

`.overlay-container` and `#toast-container` have **no** scoped CSS — the overlay container is an
unstyled positioning wrapper; the toast container is styled entirely by the global toastr rules.

---

## Global CSS (verbatim)

All from `styles.d622cb9ed2bbc221.css` unless noted. ngx-toastr block (@416400–@421700):

```css
.toast-center-center{top:50%;left:50%;transform:translate(-50%,-50%)}
.toast-top-center{top:0;right:0;width:100%}
.toast-bottom-center{bottom:0;right:0;width:100%}
.toast-top-full-width{top:0;right:0;width:100%}
.toast-bottom-full-width{bottom:0;right:0;width:100%}
.toast-top-left{top:12px;left:12px}
.toast-top-right{top:12px;right:12px}
.toast-bottom-right{right:12px;bottom:12px}
.toast-bottom-left{bottom:12px;left:12px}
.toast-title{font-weight:700}
.toast-message{word-wrap:break-word}
.toast-message a,.toast-message label{color:#fff}
.toast-message a:hover{color:#ccc;text-decoration:none}
.toast-close-button{position:relative;right:-.3em;top:-.3em;float:right;font-size:20px;font-weight:700;color:#fff;text-shadow:0 1px 0 #ffffff}
.toast-close-button:hover,.toast-close-button:focus{color:#000;text-decoration:none;cursor:pointer;opacity:.4}
button.toast-close-button{padding:0;cursor:pointer;background:transparent;border:0}
.toast-container{pointer-events:none;position:fixed;z-index:999999}
.toast-container *{box-sizing:border-box}
.toast-container .ngx-toastr{position:relative;overflow:hidden;margin:0 0 6px;padding:15px 15px 15px 50px;width:300px;border-radius:3px;background-position:15px center;background-repeat:no-repeat;background-size:24px;box-shadow:0 0 12px #999;color:#fff}
.toast-container .ngx-toastr:hover{box-shadow:0 0 12px #000;opacity:1;cursor:pointer}
.toast-info{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA1MTIgNTEyJyB3aWR0aD0nNTEyJyBoZWlnaHQ9JzUxMic+…)}   /* circled-i */
.toast-error{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA1MTIgNTEyJyB3aWR0aD0nNTEyJyBoZWlnaHQ9JzUxMic+…)}   /* circled-× */
.toast-success{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA1MTIgNTEyJyB3aWR0aD0nNTEyJyBoZWlnaHQ9JzUxMic+…)} /* checkmark */
.toast-warning{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA1NzYgNTEyJyB3aWR0aD0nNTc2JyBoZWlnaHQ9JzUxMic+…)} /* triangle-! */
.toast-container.toast-top-center .ngx-toastr,.toast-container.toast-bottom-center .ngx-toastr{width:300px;margin-left:auto;margin-right:auto}
.toast-container.toast-top-full-width .ngx-toastr,.toast-container.toast-bottom-full-width .ngx-toastr{width:96%;margin-left:auto;margin-right:auto}
.ngx-toastr{background-color:#030303;pointer-events:auto}
.toast-success{background-color:#51a351}
.toast-error{background-color:#bd362f}
.toast-info{background-color:#2f96b4}
.toast-warning{background-color:#f89406}
.toast-progress{position:absolute;left:0;bottom:0;height:4px;background-color:#000;opacity:.4}
@media all and (max-width: 240px){.toast-container .ngx-toastr.div{padding:8px 8px 8px 50px;width:11em}.toast-container .toast-close-button{right:-.2em;top:-.2em}}
@media all and (min-width: 241px) and (max-width: 480px){.toast-container .ngx-toastr.div{padding:8px 8px 8px 50px;width:18em}.toast-container .toast-close-button{right:-.2em;top:-.2em}}
@media all and (min-width: 481px) and (max-width: 768px){.toast-container .ngx-toastr.div{padding:15px 15px 15px 50px;width:25em}}
```
(The four `background-image` values are full base64 SVGs — abbreviated with `…` above but present
verbatim in the source at `styles.d622cb9ed2bbc221.css` @417866–@420200; each is a white-fill icon:
info = circled "i", error = circled "×", success = checkmark, warning = triangle "!".)

**App override of the container position** (`styles.d622cb9ed2bbc221.css` @438597 — later in the
sheet than the toastr block, so it wins the `top` cascade):
```css
.toast-container{top:70px!important}
```

**Conflicting Bootstrap-5 `.toast-container`** (`styles.d622cb9ed2bbc221.css` @253746 — EARLIER in
source order, so its `position`/`z-index` LOSE to the ngx-toastr rule; its `width`/`max-width`
survive because ngx-toastr doesn't set them):
```css
.toast-container{--bs-toast-zindex:1090;position:absolute;z-index:var(--bs-toast-zindex);width:max-content;max-width:100%;pointer-events:none}
```

Modal / bootbox global rules that apply to the imgur-modal:
```css
/* @86023 base BS4/Darkly */
.modal{overflow-x:hidden;overflow-y:auto}
.modal{position:fixed;top:0;left:0;z-index:1050;display:none;width:100%;height:100%;overflow:hidden;outline:0}
.modal-dialog{position:relative;width:auto;margin:.5rem;pointer-events:none}
.modal-content{position:relative;display:flex;flex-direction:column;width:100%;pointer-events:auto;background-color:#303030;background-clip:padding-box;border:1px solid #444;border-radius:.3rem;outline:0}
.modal-header{display:flex;align-items:flex-start;justify-content:space-between;padding:1rem;border-bottom:1px solid #444;border-top-left-radius:.3rem;border-top-right-radius:.3rem}
.modal-body{position:relative;flex:1 1 auto;padding:1rem}
.modal-backdrop{position:fixed;top:0;left:0;z-index:1040;width:100vw;height:100vh;background-color:#000}
.modal-backdrop.show{opacity:.5}
@media (min-width: 992px){.modal-lg,.modal-xl{max-width:800px}}
/* @435987 APP OVERRIDE — later in sheet, wins for modal-content skin */
.modal-content{background-color:var(--modal-content-bg-color);color:var(--modal-content-color)}
/* @429668 APP OVERRIDE — wins over BS4/BS5 max-width for size:large */
.modal-lg{min-width:90%;min-height:80%}
/* @1029093 bootbox: window.bootbox; @styles bootbox pointer-events */
.bootbox.modal{pointer-events:none!important}
```

---

## Resolved values

Resolved against `proroom-all-admin.json → cssVariables.root` (lightTheme live tokens).

| Element | Property | Resolved value | Source |
|---|---|---|---|
| `#toast-container` (`.toast-container`) | position | `fixed` | ngx-toastr rule @417420 wins source-order over BS5 @253746 |
| `#toast-container` | z-index | `999999` | ngx-toastr rule @417420 (BS5 `1090` loses) |
| `#toast-container` | top | `70px` (`!important`) | app override @438597 (overrides toastr `top:12px` from `.toast-top-right`) |
| `#toast-container` | right | `12px` | `.toast-top-right` @416568 (default position) |
| `#toast-container` | width / max-width | `max-content` / `100%` | surviving decls from BS5 @253746 |
| `#toast-container` | pointer-events | `none` | ngx-toastr rule @417420 |
| toast `.ngx-toastr` | width | `300px` | `.toast-container .ngx-toastr` @417420 |
| toast `.ngx-toastr` | padding | `15px 15px 15px 50px` | same |
| toast `.ngx-toastr` | margin | `0 0 6px` | same |
| toast `.ngx-toastr` | border-radius | `3px` | same |
| toast `.ngx-toastr` | box-shadow | `0 0 12px #999` (hover → `0 0 12px #000`) | @417420 / `:hover` |
| toast `.ngx-toastr` | background-size / position | `24px` / `15px center` | same |
| toast `.ngx-toastr` | color | `#fff` | same |
| toast `.ngx-toastr` (base) | background-color | `#030303` | `.ngx-toastr` @420200 |
| `.toast-success` | background-color | `#51a351` | @420240 |
| `.toast-error` | background-color | `#bd362f` | @420260 |
| `.toast-info` | background-color | `#2f96b4` | @420280 |
| `.toast-warning` | background-color | `#f89406` | @420300 |
| `.toast-title` | font-weight | `700` | @416916 |
| `.toast-message` | word-wrap | `break-word` | @416945 |
| `.toast-message a` | color | `#fff` (hover `#ccc`) | @416970 |
| `.toast-close-button` | font-size / weight / color | `20px` / `700` / `#fff` | @417085 |
| `.toast-close-button` | position | `relative; right:-.3em; top:-.3em; float:right` | @417085 |
| `.toast-close-button` | text-shadow | `0 1px 0 #ffffff` | @417085 |
| `.toast-close-button:hover/focus` | color / opacity | `#000` / `.4` | @417200 |
| `.toast-progress` | height / bg / opacity | `4px` / `#000` / `.4` | @421308 |
| `#connectedMsg` | display | `none` | scoped `#connectedMsg[_ngcontent]{display:none}` — id beats `.notConnectedOverlay{display:block}` |
| `.notConnectedOverlay` (when shown) | position | `absolute; bottom:5px; right:5px` | scoped @main |
| `.notConnectedOverlay` | z-index | `10000` | scoped |
| `.notConnectedOverlay` | background-color | `#000` | scoped |
| `.notConnectedOverlay` | color | `#fff` | `var(--presenter-noRecording-color)` → `#fff` (root token) |
| `.notConnectedOverlay` | opacity | `.7` | scoped |
| imgur `.modal-content` | background-color | `#103d5c` | `var(--modal-content-bg-color)` → `#103d5c` (root); override @435987 beats Darkly `#303030` |
| imgur `.modal-content` | color | `#f4f4f4` | `var(--modal-content-color)` → `#f4f4f4` (root) |
| imgur `.modal-content` | border | `1px solid #444` | Darkly @86992 (not overridden) |
| imgur `.modal-content` | border-radius | `.3rem` | Darkly @86992 |
| imgur `.modal-lg` | min-width / min-height | `90%` / `80%` | app override @429668 (beats BS `max-width:800px`) |
| imgur `.imgur-modal` | text-align | `center` | scoped @1364268 |
| imgur `.imgur-modal img` | max-width / max-height | `100%` / `calc(100vh - 150px)` | scoped @1364268 (if scope matches — see gap) |
| `.modal-backdrop` | z-index / bg | `1040` / `#000` | @global; `.show` → opacity `.5` |
| chat `.uploaded-img` | max-width / max-height | `300px` / `300px` | scoped @1364268 |

---

## States & effects

- **Toast enter/leave animation** — Angular `@flyInOut` trigger (`main.d6f5272aa3783e43.js`,
  `data:{animation:[mJ("flyInOut",…)]}`): states `inactive{opacity:0}`, `active{opacity:1}`,
  `removed{opacity:0}`; transitions `inactive => active` and `active => removed` run
  `{{easeTime}}ms {{easing}}`. With the default config that is **300ms ease-in** (opacity fade,
  not a translate — despite the "flyInOut" name).
- **Toast hover** — `.toast-container .ngx-toastr:hover{box-shadow:0 0 12px #000;opacity:1;cursor:pointer}`.
- **Toast host interactions** — `(click)=tapToast()`, `(mouseenter)=stickAround()`,
  `(mouseleave)=delayedHideToast()` (host bindings). `tapToDismiss:true` (config) → clicking the
  body dismisses; hovering pauses the timeout, leaving restarts the `extendedTimeOut:1000ms`.
- **Toast auto-dismiss** — `timeOut:5000ms`, `extendedTimeOut:1000ms` (default config).
- **Close button hover/focus** — `.toast-close-button:hover,:focus{color:#000;opacity:.4;cursor:pointer}`.
- **#connectedMsg fade-in** — carries `animated fadeIn` (animate.css v3.7.2). The `fadeIn`
  keyframe (`0%{opacity:0} to{opacity:1}`) is provided by the CDN animate.css, not by this repo's
  stylesheets (honest gap: keyframe body not in the captured bundles).
- **#connectedMsg hidden-until** — `display:none` by default (scoped `#connectedMsg` id rule wins
  over `.notConnectedOverlay{display:block}`); toggled visible by a runtime connection event
  (event not captured).
- **imgur-modal / bootbox fade** — `.modal.fade .modal-dialog` transition is present in the sheet
  but a later Darkly rule sets it to `transition:none` (@86290 / @255828); `.modal.show
  .modal-dialog{transform:none}` (@255871). Backdrop uses `.modal-backdrop.show{opacity:.5}`.
- **Responsive toast padding** — three `@media` breakpoints narrow the toast to `11em / 18em /
  25em` under 768px (see Global CSS).

---

## Behavior

- **Toast firing** — the app's `AlertService`/bootbox wrapper `ha` (`main.d6f5272aa3783e43.js`
  @1029087) routes `success(e)`, `info(e)`, and `error(e)` ALL through
  `alertService.info(e,"",{closeButton:true, tapToDismiss:true})` — so app toasts are the **info**
  variant with an explicit close button and a blank title. ngx-toastr's own `.success/.error/
  .warning/.info` service methods are the underlying primitives; direct `.error(` calls dominate
  the codebase (129 occurrences) with `.info(`×34, `.success(`×9, `.warning(`×2 — all four type
  classes (`toast-error/-info/-success/-warning`) are wired via `iconClasses` in the default config.
- **Default toastr config** (`main.d6f5272aa3783e43.js` @884160): `closeButton:false`,
  `timeOut:5000`, `extendedTimeOut:1000`, `enableHtml:false`, `progressBar:false`,
  `toastClass:"ngx-toastr"`, `positionClass:"toast-top-right"`, `titleClass:"toast-title"`,
  `messageClass:"toast-message"`, `easing:"ease-in"`, `easeTime:300`, `tapToDismiss:true`,
  `iconClasses:{error:"toast-error",info:"toast-info",success:"toast-success",warning:"toast-warning"}`.
  `maxOpened` handling with `autoDismiss` clears the oldest toast (`this.clear(this.toasts[0].toastId)`).
- **Image click → modal** — chat images render `onclick="openImageModal(event,'<url>')"`
  (`main.d6f5272aa3783e43.js` @1325926). `openImageModal` (`pagesource.html` L81):
  - Shift/Alt/Ctrl-click → opens the raw image in a new window (`window.open`,
    `toolbar=0,location=0,resizable=1,scrollbars=1`) on a centered black background.
  - Plain click → `bootbox.dialog({onEscape:true, closeButton:true, size:"large",
    className:"imgur-modal", message:<img><hr><Download button>})`.
- **Download button** — the modal's `Download Image` button calls `downloadImage(url, imageName)`
  (`pagesource.html` L139): XHR blob GET → object URL → synthetic `<a download>` click, with the
  filename cleaned of its `<prefix>_` and `_<suffix>` decorations.
- **Escape / close** — `onEscape:true` + `closeButton:true` (bootbox) allow ESC and the header ×
  to dismiss the image modal.
- **animate.css & FontAwesome loaded** — `pagesource.html` L14–22:
  `use.fontawesome.com/releases/v5.8.1/css/all.css` (FA 5.8.1) and
  `cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.2/animate.min.css` (animate.css 3.7.2). The
  connected chip uses `animated fadeIn` (animate.css) + `fas fa-check` (FA5).

---

## Honest gaps

- **No captured render of any toast, the connected chip, or the image modal.** All three are
  transient/event-driven; verified absent from `elements[]` and `states` in
  `proroom-all-admin.json`, `proroom-full-presenter.json`, and
  `docs/reference/captures/proroom-full-member.json`. Every geometry/color above is resolved from
  the CSS rules + live tokens, NOT from a computed-style capture of the live element.
- **animate.css `fadeIn` keyframe body is not in this repo's bundles** — it's loaded from the
  cdnjs animate.css 3.7.2 CDN (`pagesource.html` L21). The standard definition is
  `@keyframes fadeIn{from{opacity:0}to{opacity:1}}` but that exact text is not citable from the
  captured files.
- **bootbox library skeleton is not fully captured.** `openImageModal` is proven to pass
  `className:"imgur-modal"`, `size:"large"`, `closeButton:true`, `onEscape:true`, and the
  `<img><hr><button>` body; the surrounding `.modal`/`.modal-dialog`/`.modal-content`/`.close`
  wrapper markup is inferred from standard bootbox structure (`window.bootbox`,
  `main.d6f5272aa3783e43.js` @1029093) — the bootbox library source itself is not in the captured
  bundle, so exact class names on the header/close button are not verbatim-cited.
- **`.imgur-modal .modal-dialog[_ngcontent-%COMP%]` scoping mismatch.** Because bootbox builds the
  dialog outside the Angular component tree, the scoped descendant rules
  (`.imgur-modal .modal-dialog[_ngcontent-%COMP%]{max-width:90%;max-height:90%}` and the scoped
  `img` rule) will not carry a matching `_ngcontent` attribute on the runtime `.modal-dialog`/`img`
  and therefore probably do NOT apply at runtime; the effective sizing comes from the global
  `.modal-lg{min-width:90%;min-height:80%}` override. This could not be confirmed against a live
  computed style (no capture of the modal).
- **Connection event that toggles `#connectedMsg` from `display:none` → visible** is not present
  in any evidence file (no template handler captured); only the CSS default (`display:none`) and
  the authored `animated fadeIn` classes are cited.
