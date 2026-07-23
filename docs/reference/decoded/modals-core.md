# Modals-core

Shared modal chrome + five modals: **user-settings** (`app-user-settings-modal`), **av-settings** (`app-av-settings-modal`), **post-alert** (`app-post-alert-modal`), **mobile-app-info** (`app-mobile-app-info-modal`), **webrtc-troubleshooter** (`app-webrtc-troubleshooter`). Room = "Mastering The Trade", **lightTheme**.

Evidence precedence used: live-bundle scoped CSS (`main.d6f5272aa3783e43.js`) ≥ captured COMPUTED styles (`proroom-all-admin.json`, states `modal:user-settings-modal`, `modal:mobileAppInfoModal`, `modal:webrtc-troubleshooter-modal`) ≥ raw DOM (`mixed-files/file9,10,12,17,30.html`) ≥ global `styles.d622cb9ed2bbc221.css` ≥ boot tokens. Every load-bearing value is cross-checked between the live token table (`proroom-all-admin.json` › `cssVariables.root`) and a captured computed value or bundle rule.

> **Critical:** the app-level `.modal-content{…}` override block (global CSS) plus the LIVE room `:root` tokens jointly govern all modal chrome. The Bootstrap-Darkly boot defaults (`#303030`/`#222`/`#00bc8c`) are **overridden** by the live room tokens (navy `#103d5c`, cyan-blue `#45a2ff`, etc.). All computed colours below were captured with those live tokens in effect.

---

## DOM structure

Shared chrome shape (identical across all five components; only host element and ids differ):

```
<app-{modal}-modal _nghost-ng-cXXXX>
  <div id="{modal-id}" tabindex="-1" role="dialog"        <!-- mobile-app-info omits role="dialog" -->
       aria-labelledby="…" aria-hidden="true" class="modal fade">
    <div role="document" class="modal-dialog">            <!-- mobile-app-info omits role="document" -->
      <div class="modal-content">
        <div class="modal-header">
          <h5 | h3 [class="modal-title"]>…title…</h5>
          <button type="button" data-bs-dismiss="modal" aria-label="Close"
                  class="btn-close btn-close-white"></button>
        </div>
        <div class="modal-body"> …component-specific… </div>
        <div class="modal-footer [text-center]"> …buttons… </div>
      </div>
    </div>
  </div>
</app-{modal}-modal>
```

Per-modal specifics (host `_nghost` ids from raw dumps):

| Modal | host `_nghost` | dialog `id` | `aria-labelledby` | title tag/text | dialog max-width |
|---|---|---|---|---|---|
| user-settings | `ng-c124836360` | `user-settings-modal` | `user-settings-modal` | `<h5>` "General Settings" (no `.modal-title`) | 700px (scoped) |
| av-settings | `ng-c286619529` | `av-settings-modal` | `av-settings-modal` | `<h5>` "Audio/Video Settings" (no `.modal-title`) | default (500px) |
| post-alert | `ng-c3443900831` | `alert-modal` | `post-alert` | `<h5 id="post-alert" class="modal-title">` "Post Alert" | default |
| mobile-app-info | `ng-c4094271479` | `mobileAppInfoModal` | `mobileAppInfoLabel` | `<h5 id="mobileAppInfoLabel" class="modal-title">` "Download our mobile apps" | default |
| webrtc-troubleshooter | `ng-c2606333922` | `webrtc-troubleshooter-modal` | `webrtc-troubleshooter-modal` | `<h3 class="modal-title">` "Connectivity/Mic Troubleshooter" | inline `style="max-width:540px"` |

(`file9.html`, `file10.html`, `file12.html`, `file17.html`, `file30.html`, lines cited below per modal.)

### user-settings (`file9.html`)
`modal-body` → `<ul id="userSettingsTab" role="tablist" class="nav nav-tabs">` with **3 tabs** (`file9.html:24-70`):
- `<a id="user-app-settings-tab" data-bs-toggle="tab" href="#user-app-settings" class="nav-link active">App Settings`
- `<a id="user-alert-settings-tab" … href="#user-alert-settings" class="nav-link">Alert Settings`
- `<a id="user-chat-settings-tab" … href="#user-chat-settings" class="nav-link">Chat Settings`
- Two trailing `<!---->` Angular placeholders after the 3 tabs (`file9.html:69`) = conditionally-rendered extra tabs (presenter/staff) not present for this (admin/member) capture.

`<div id="userSettingsTabContent" class="tab-content">` holds three `role="tabpanel"` panes:

**Pane `#user-app-settings` (`class="tab-pane fade show active"`, `file9.html:76-599`):**
- `.p-2.themes` **Choose Color Theme** (`#colorTheme` title, `<i class="fas fa-palette">`): 2 radios `name="app-color-theme"` — `#app-light-theme` (value "Light Theme"), `#app-dark-theme` (value "Dark Theme"), each in `.ml-5` with `.form-check-label`.
- `.p-2.themes` **Room Layout** (`#roomLayout`, `<i class="fa fa-columns">`): 4 radios `name="roomLayoutOptions"` in `.form-check` — `#chat-alerts-left/-top/-right/-bottom`; then `<hr>` + checkbox `#pm-window-layout` "PM logs on the right".
- `.p-2.d-flex.align-items-end.justify-content-between` **Colors & Size** (`#chatColorMode`, `<i class="fas fa-wrench">`): five `.ml-5` rows each `<input class="form-check-input">` + `<label class="form-check-label ml-4 pl-2">` — `#chat-text-color` (type=color) "Text Color", `#chat-username-color` (color) "Username Color", `#chat-bg-color` (color) "Background Color", `#chat-ticker-color` (color) "Ticker Color", `#chat-text-size` (number) "Text Size". Right column `.text-right`: `<button class="btn btn-outline-danger mx-1">Reset` + `<button class="btn btn-outline-light">Save changes`.
- `.p-2.text-mode-box` **Do not disturb** (`#appDoNotDisturb`, `<i class="fas fa-bell-slash">`): checkboxes `#app-donot-disturb`, `#app-recording-start-sound`, `#app-recording-stop-sound`, `#app-reactions-popup`, `#app-reactions-popup-qa` (each label ends with a `<span>on</span>` state word).
- `.p-2.text-mode-box` **Disable/Enable Video** (`#appDisableVideo`, `<i class="fas fa-desktop">`): checkbox `#app-disable-video` (label "Video&nbsp;<span>Enabled</span>").
- `.p-2.text-mode-box` **Closed Captions Overlay** (`#appSpeechRecoOverlay`, `<i class="fas fa-closed-captioning">`): checkbox `#app-speech-reco-overlay` ("<span>Enabled</span>").
- `.p-2.text-mode-box` › `.mx-3`: `<button class="btn btn-warning btn-sm m-1"><i class="fas fa-user-tie me-1"> Edit my Info and Avatar`.

**Pane `#user-alert-settings` (`tab-pane fade`, `file9.html:600-830`):**
- `.text-mode-box` **Text Mode** (`#alertTextMode`, `fa-file-alt`): radios `name="alert-text-mode"` `#alert-regular-mode`, `#alert-compact-mode`.
- `.text-mode-box` **Do not disturb** (`#alertDoNotDisturb`, `fa-bell-slash`): checkboxes `#alert-popup-donot-disturb` ("Alert / QA Popup" + `<hr>`), `#alert-donot-disturb` ("Alert sound"), `#qa-donot-disturb` ("QA sound"), `#app-reactions-sound-qa` ("QA Reactions Sound"), `#non-trade-alert` ("Non-trade alert sound").
- `.text-mode-box` **Alert popup** (`#alertPopup`, `fa-bell`): checkbox `#longer-alert-popup` ("Longer alert popup <span>off</span>") + `<button data-bs-toggle="modal" data-bs-target="#alert-filter-modal" class="btn btn-primary btn-sm mt-4 ml-4"><i class="fas fa-filter me-1"> Filter out alerts`.

**Pane `#user-chat-settings` (`tab-pane fade`, `file9.html:831-1170`):**
- `.text-mode-box` **Text Mode** (`#chatTextMode`, `fa-file-alt`): radios `name="chat-text-mode"` `#chat-regular-mode` (`aria-checked="true"`), `#chat-compact-mode`.
- `.text-mode-box` **Image Preview** (`#chatImagePreview`, `fa-image`): checkbox `#small-image-preview`.
- `.text-mode-box` **Do not disturb** (`#chatDoNotDisturb`, `fa-bell-slash`): `#chat-gif-donot-disturb` ("Gif"), `#chat-badges-donot-disturb` ("Badges"), `#chat-popup-donot-disturb` ("Chat / PM Popup <span>off</span>" + `<hr>`), `#chat-donot-disturb` ("Chat sound").
- `.text-mode-box` **Extra chat column** (`#extraChatColumn`, `fa-comment`): checkbox `#extra-chat-column`.
- `.text-mode-box` **Always Scroll To Bottom** (`#alwaysScrollToBottom`, `fa-scroll`): checkbox `#chat-always-scroll`.
- `.text-mode-box` **Reduce Chatlog Memory** (`#trimChatlogFat`, `fa-trash`): checkboxes `#chat-mem-clear`, `#visibility-change-enabled` ("Tab sleep optimization").

Footer: `.modal-footer.text-center` → single `<button data-bs-dismiss="modal" class="btn btn-secondary">Close`.

**Role variants:** the DOM is the same for member vs admin. The `<!---->` placeholders (`file9.html:69,500,502,581,828,1169,1171`) mark conditionally-added controls (presenter/staff options such as extra settings tabs, reaction toggles) not rendered in this capture. Section headers use `title` attrs (tooltips) matching the label text.

### av-settings (`file10.html`)
`modal-body` → `<ul id="userSettingsTab" class="nav nav-tabs">` with **one** visible tab `<a id="user-audio-video-settings-tab" class="nav-link active">User Settings` + trailing `<!---->` (`file10.html:24-44`) — the presenter tab (`#presenter-audio-video-settings-tab`, present in the bundle template's attrs array) is hidden for non-presenters.
- Pane `#user-audio-video-settings` (`tab-pane fade show active`): `<nav class="navbar w-100 h-100"><ul class="navbar-nav small w-100 h-100">` with two `.nav-item`:
  1. `<a title="Disable Video" class="nav-link"><i class="fas fa-desktop"><span class="pl-2"> Disable Video <span class="saves-bandwidth"> (saves bandwidth)</span></span>` (click → `mediaService.toggleDisableVideo()` per bundle template).
  2. `<a title="Choose Speakers" class="nav-link">` › `.form-group.d-flex.justify-content-between.align-items-end` › `.w-75.mr-2` `<label for="speakers-device">Speakers:</label><select id="speakers-device" class="form-control">` (2 `<option>`) + `.w-25` `<button class="btn btn-outline-light"><i class="fas fa-volume-up mr-2">Test`.
- Pane `#presenter-audio-video-settings` (`tab-pane fade`, presenter-only): `.form-group` `<label for="audio-deviceList">Audio device (input):</label><select id="audio-deviceList" class="form-select">`; `.form-group` `<label for="video-deviceList">Video device (input):</label><select id="video-deviceList" class="form-select">`; `<button class="btn btn-primary">Change Devices` (click → `setNewDevices()`).
- Footer `.modal-footer.text-center`: `<button type="submit" class="btn btn-success">Save` + `<button data-bs-dismiss="modal" class="btn btn-secondary">Close`.

### post-alert (`file12.html`) — staff/presenter tool
`modal-body` → `<nav>` › `<div id="nav-tab" role="tablist" class="nav nav-tabs">` **3 tabs** (`file12.html:30-71`): `#nav-tab-text` (`href="#nav-text"`, `nav-item nav-link active`) "Text Alert", `#nav-tab-url` (`#nav-url`) "Text Url", `#nav-tab-img` (`#nav-img`) "Image / GIF / Video".
- `#nav-text` pane (`tab-pane fade show active`): `.form-group.mb-3.mt-3` `<textarea rows="10" placeholder="Alert Text...">`.
- `#nav-url` pane: `.input-group.mb-3.mt-3` › `.input-group-prepend` `<span id="addon-url" class="input-group-text pl-2 pr-2"><i class="fas fa-link">` + `<input type="url" placeholder="Link / URL to send to users">`; then `.form-group` `<textarea rows="2" placeholder="Alert Text...">`.
- `#nav-img` pane: `.input-group` › `<span id="addon-img" class="input-group-text pl-2 pr-2 text-light"><i class="fas fa-link">` + `<input type="url" placeholder="Image or Video Link to show">`; then `OR...` `<label for="fuploadAlert" class="upload-area" style="width:100%;text-align:center"><input id="fuploadAlert" type="file" multiple accept="image/*" style="display:none"><i class="fas fa-file-upload fa-2x"><br> Click to select images to upload</label>`; `<div id="filedragAlert" class="filedragMD" style="display:block">or drop an image here</div>`; `<div id="fileListAlert" class="fileList text-center">`; `.clearfix`; `.form-group` `<textarea rows="2">`.
- Footer `.modal-footer` › `.row.w-100` › `.col-12` **5 `.form-check` checkboxes**: `#keepOpenChk` "Keep alert window open?", `#postOnXChk` "Post on X? (tweet)", `#alert-push-label` "Don't send to push notification?", `#alert-non-trade-label` "Non-trade alert? (Different Sound)", `#alert-legal-disclosure-label` "Add Legal Disclosure?"; then `.text-right` `<button class="btn btn-success">Post Alert`. Interleaved `<!---->` placeholders (`file12.html:269,285,301,317,320`) mark role-gated extra checkboxes/buttons.

### mobile-app-info (`file17.html`)
`modal-body` › `.d-flex.align-items-center.justify-content-evenly.m-3.mb-4` two `<a target="_blank" type="button">`: Google Play (`href="https://play.google.com/store/apps/details?id=com.bellesoft.stprotradingroom&hl=en&gl=US"`) `<img src="/assets/images/google-play-badge.png" class="google-badge">`; App Store (`href="https://apps.apple.com/us/app/simpler-trading-mobile/id1278652736"`) `<img src="/assets/images/iosAppStore.svg">` (no class). Trailing `<!---->` (`file17.html:54`). Footer: single `<button data-bs-dismiss="modal" class="btn btn-secondary">Close`.

### webrtc-troubleshooter (`file30.html`)
`modal-body` › `<div>` › `<p class="text-muted mb-4">This tool checks your network and connectivity to essential WebRTC servers.</p>` + **4 `.status-item`** rows (`.mb-3` ×3, `.mb-4` ×1): each `<span class="fw-medium">{label}</span><span class="status-icon pending">●</span>`. Labels: "UDP Enabled", "TCP Enabled", "STUN Server Connectivity", "TURN Server Connectivity". The `status-icon` span wraps `●` in Angular `<!---->` conditionals (icon swaps per pass/fail/pending). Trailing `<!---->` placeholders (`file30.html:85,87,114`) mark the mic-test / results sections (component has extensive mic-test scoped CSS — see gaps). Footer `.modal-footer`: `<button class="btn btn-primary"><i class="fas fa-play"> Start Test`, `<button class="btn btn-success"><i class="fas fa-copy"> Copy Results`, `<button data-bs-dismiss="modal" class="btn btn-secondary">Close`.

---

## Scoped CSS (verbatim)

Extracted from `main.d6f5272aa3783e43.js` (component `styles:[…]` arrays; `[_ngcontent-%COMP%]` is Angular's per-component attribute placeholder).

### user-settings-modal component (bundle offset 2285615)
```css
#user-settings-modal[_ngcontent-%COMP%]   .modal-dialog[_ngcontent-%COMP%]{max-width:700px}
#user-settings-modal[_ngcontent-%COMP%]   button.close[_ngcontent-%COMP%]{color:#fff}
#chat-ticker-color[_ngcontent-%COMP%], #alert-ticker-color[_ngcontent-%COMP%], #presenter-text-color[_ngcontent-%COMP%], #chat-username-color[_ngcontent-%COMP%], #presenter-bg-color[_ngcontent-%COMP%], #alert-text-color[_ngcontent-%COMP%], #alert-bg-color[_ngcontent-%COMP%], #chat-text-color[_ngcontent-%COMP%], #chat-bg-color[_ngcontent-%COMP%], #chat-text-size[_ngcontent-%COMP%], #alert-text-size[_ngcontent-%COMP%], #presenter-text-size[_ngcontent-%COMP%]{width:45px;height:20px}
#chat-text-size[_ngcontent-%COMP%], #alert-text-size[_ngcontent-%COMP%], #presenter-text-size[_ngcontent-%COMP%]{font-size:13px}
.themes[_ngcontent-%COMP%]   .form-check-input[_ngcontent-%COMP%]:checked + label[_ngcontent-%COMP%], .text-mode-box[_ngcontent-%COMP%]   .form-check-input[_ngcontent-%COMP%]:checked + label[_ngcontent-%COMP%]{text-transform:uppercase;font-weight:700}
.themes[_ngcontent-%COMP%]   .form-check-input[_ngcontent-%COMP%], .text-mode-box[_ngcontent-%COMP%]   .form-check-input[_ngcontent-%COMP%]{-webkit-appearance:none;-o-appearance:none;appearance:none;height:20px;width:20px;transition:all .15s ease-out 0s;background-color:var(--light-gray);border:none;color:var(--white);cursor:pointer;display:inline-block;margin-right:.5rem;outline:none;position:relative;z-index:1000;border-radius:50%}
.form-check-label[_ngcontent-%COMP%]:hover{cursor:pointer;opacity:.85}
.themes[_ngcontent-%COMP%]   .form-check-input[_ngcontent-%COMP%]:checked, .text-mode-box[_ngcontent-%COMP%]   .form-check-input[_ngcontent-%COMP%]:checked{background-color:var(--checkbox-bg-color)}
@keyframes _ngcontent-%COMP%_click-wave{0%{height:40px;width:40px;opacity:.35;position:relative}to{height:200px;width:200px;margin-left:-80px;margin-top:-80px;opacity:0}}
@media only screen and (max-width: 750px){#user-settings-modal[_ngcontent-%COMP%]   .modal-dialog[_ngcontent-%COMP%]{max-width:60%}}
@media only screen and (max-width: 500px){#user-settings-modal[_ngcontent-%COMP%]   .modal-dialog[_ngcontent-%COMP%]{max-width:50%}}
```
(The `.themes`/`.text-mode-box` checkbox styling also appears verbatim in the **room-sidebar** component around offset 2548506, where `.themes .form-check-input:checked:before{content:"\2714";font-size:20px;line-height:20px}` and `:checked:after{animation:…click-wave .65s;…}` add the checkmark glyph + ripple — those `:before/:after` are the sidebar-scoped variants; the user-settings component ships only the `:checked` background rule above.)

### av-settings-modal component (bundle offset 2292832)
```css
#av-settings-modal[_ngcontent-%COMP%]   video[_ngcontent-%COMP%]{max-width:100%;max-height:66.5px}
#av-settings-modal[_ngcontent-%COMP%]   .video-container[_ngcontent-%COMP%]{margin-bottom:-8px}
```

### post-alert-modal component (bundle offset 2136717)
```css
.modalClose[_ngcontent-%COMP%]{color:#fff;border:none;background:none;font-size:20px}
#addon-img[_ngcontent-%COMP%]{background-color:var(--modal-input-group-bg)}
#alert-modal[_ngcontent-%COMP%]   .btn-link[_ngcontent-%COMP%]{color:var(--modal-alert-link-color)}
.upload-area[_ngcontent-%COMP%]:hover{cursor:pointer}
```
(No scoped rule for `.filedragMD` or `#addon-url`; those fall to global CSS.)

### mobile-app-info-modal component
```css
.google-badge[_ngcontent-%COMP%]{width:auto;height:100%;max-height:60px}
```

### webrtc-troubleshooter component (bundle offset 2452624) — rules affecting the captured surface
```css
.status-item[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;background-color:#f8fafc;padding:1rem 1.25rem;border-radius:.75rem;transition:background-color .3s ease;border:1px solid #e2e8f0}
.status-item[_ngcontent-%COMP%]   span.fw-medium[_ngcontent-%COMP%]{color:#1a202c!important;font-weight:600!important;font-size:.95rem}
.status-item.passed[_ngcontent-%COMP%]{background-color:#ecfdf5;border-left:4px solid #10b981}
.status-item.failed[_ngcontent-%COMP%]{background-color:#fef2f2;border-left:4px solid #ef4444}
.status-icon[_ngcontent-%COMP%]{font-size:1.5rem;min-width:24px;text-align:center}
.status-icon.passed[_ngcontent-%COMP%]{color:#10b981}
.status-icon.failed[_ngcontent-%COMP%]{color:#ef4444}
.status-icon.pending[_ngcontent-%COMP%]{color:#64748b}
.modal-header[_ngcontent-%COMP%]   .modal-title[_ngcontent-%COMP%]{color:#fff!important;font-weight:700!important;font-size:1.25rem}
.modal-body[_ngcontent-%COMP%]{max-height:60vh;overflow-y:auto}
.modal-body[_ngcontent-%COMP%]   .text-muted[_ngcontent-%COMP%]{color:#e5e7eb!important;font-weight:500!important;font-size:.95rem}
.btn[_ngcontent-%COMP%]{border-radius:.375rem}
.btn[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]{margin-right:.5rem}
@keyframes _ngcontent-%COMP%_spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}
.spin[_ngcontent-%COMP%]{animation:_ngcontent-%COMP%_spin 1s linear infinite}
```
(The same component also ships `.troubleshooter-tabs …`, `.alert.alert-info/success/danger`, `.no-mic-* `, `.mic-select`, `.waveform-wrapper` rules for a mic-test view not present in `file30.html` — see Honest gaps.)

---

## Global CSS (verbatim — only rules that win)

From `styles.d622cb9ed2bbc221.css`.

**Modal chrome base (Bootstrap 5 layer that wins):**
```css
.modal-content{position:relative;display:flex;flex-direction:column;width:100%;color:var(--bs-modal-color);pointer-events:auto;background-color:var(--bs-modal-bg);background-clip:padding-box;border:var(--bs-modal-border-width) solid var(--bs-modal-border-color);border-radius:var(--bs-modal-border-radius);outline:0}
.modal-header{display:flex;flex-shrink:0;align-items:center;padding:var(--bs-modal-header-padding);border-bottom:var(--bs-modal-header-border-width) solid var(--bs-modal-header-border-color);border-top-left-radius:var(--bs-modal-inner-border-radius);border-top-right-radius:var(--bs-modal-inner-border-radius)}
.modal-body{position:relative;flex:1 1 auto;padding:var(--bs-modal-padding)}
.modal-footer{display:flex;flex-shrink:0;flex-wrap:wrap;align-items:center;justify-content:flex-end;padding:calc(var(--bs-modal-padding) - var(--bs-modal-footer-gap) * .5);background-color:var(--bs-modal-footer-bg);border-top:var(--bs-modal-footer-border-width) solid var(--bs-modal-footer-border-color);border-bottom-right-radius:var(--bs-modal-inner-border-radius);border-bottom-left-radius:var(--bs-modal-inner-border-radius)}
.modal-title{margin-bottom:0;line-height:var(--bs-modal-title-line-height)}
.modal-dialog{position:relative;width:auto;margin:var(--bs-modal-margin);pointer-events:none}
.modal.fade .modal-dialog{transition:transform .3s ease-out;transform:translateY(-50px)}
.modal.show .modal-dialog{transform:none}
.fade{transition:opacity .15s linear}
.modal-backdrop{--bs-backdrop-zindex:1050;--bs-backdrop-bg:#000;--bs-backdrop-opacity:.5;position:fixed;top:0;left:0;z-index:var(--bs-backdrop-zindex);width:100vw;height:100vh;background-color:var(--bs-backdrop-bg)}
.modal-backdrop.show{opacity:var(--bs-backdrop-opacity)}
.modal-header .btn-close{padding:calc(var(--bs-modal-header-padding-y) * .5) calc(var(--bs-modal-header-padding-x) * .5);margin:calc(-.5 * var(--bs-modal-header-padding-y)) calc(-.5 * var(--bs-modal-header-padding-x)) calc(-.5 * var(--bs-modal-header-padding-y)) auto}
```

**App-level modal override block (token-driven; wins over BS/Darkly for content, tabs, buttons):**
```css
.modal-content{background-color:var(--modal-content-bg-color);color:var(--modal-content-color)}
.modal-content .modal-header,.modal-content .modal-footer,.modal-content .nav-tabs{border-color:var(--modal-active-tab-border-color)!important}
.modal-content .nav-tabs .nav-link.active{border:1px solid var(--modal-active-tab-border-color)!important;border-bottom:none}
.modal-content .nav-tabs .nav-link:hover{border-color:var(--modal-active-tab-border-color)!important;cursor:pointer}
.modal-content .nav-tabs .nav-link.active,.modal-content .nav-tabs .nav-item.show .nav-link{background-color:var(--modal-active-tab-bg-color)!important;color:var(--modal-active-tab-color)!important;cursor:default}
.modal-content .nav-tabs .nav-link.active:hover{cursor:default}
.modal-content .btn-primary{background-color:var(--modal-btn-close-bg);border-color:var(--modal-btn-close-border)}
.modal-content .btn-primary:active{background-color:var(--modal-close-btn-bg);border-color:var(--modal-close-btn-border)}
.modal-content .btn-success,.modal-content .btn-success:active{background-color:var(--modal-btn-success-bg);border-color:var(--modal-btn-success-border)}
.modal-content .btn:hover{opacity:var(--modal-btn-hover-opacity)}
.nav-tabs .nav-link:hover{cursor:pointer}
.nav-tabs .nav-link.active:hover{cursor:default}
```

**`.btn-close` (Bootstrap 5) + white filter:**
```css
.btn-close{--bs-btn-close-color:#000;--bs-btn-close-bg:url("data:image/svg+xml,…fill='%23000'…");--bs-btn-close-opacity:.5;--bs-btn-close-hover-opacity:.75;--bs-btn-close-focus-shadow:0 0 0 .25rem rgba(13, 110, 253, .25);--bs-btn-close-focus-opacity:1;--bs-btn-close-disabled-opacity:.25;--bs-btn-close-white-filter:invert(1) grayscale(100%) brightness(200%);box-sizing:content-box;width:1em;height:1em;padding:.25em;color:var(--bs-btn-close-color);background:transparent var(--bs-btn-close-bg) center/1em auto no-repeat;border:0;border-radius:.375rem;opacity:var(--bs-btn-close-opacity)}
.btn-close:hover{color:var(--bs-btn-close-color);text-decoration:none;opacity:var(--bs-btn-close-hover-opacity)}
.btn-close:focus{outline:0;box-shadow:var(--bs-btn-close-focus-shadow);opacity:var(--bs-btn-close-focus-opacity)}
.btn-close-white,[data-bs-theme=dark] .btn-close{filter:var(--bs-btn-close-white-filter)}
```

**Buttons (Bootstrap 5 layer that wins — `--bs-btn-*` custom props):**
```css
.btn-secondary{--bs-btn-color:#fff;--bs-btn-bg:#6c757d;--bs-btn-border-color:#6c757d;…}
.btn-warning{--bs-btn-color:#000;--bs-btn-bg:#ffc107;--bs-btn-border-color:#ffc107;…}
.btn-outline-light{--bs-btn-color:#f8f9fa;--bs-btn-border-color:#f8f9fa;--bs-btn-hover-color:#000;--bs-btn-hover-bg:#f8f9fa;…}
.btn-outline-danger{--bs-btn-color:#dc3545;--bs-btn-border-color:#dc3545;--bs-btn-hover-color:#fff;--bs-btn-hover-bg:#dc3545;…}
```
(Inside `.modal-content`, `.btn-primary` and `.btn-success` backgrounds are overridden by the app block above; `.btn-secondary/-warning/-outline-*` are not overridden and resolve to the BS5 values.)

**Form controls / input-group:**
```css
.form-check-input{--bs-form-check-bg:var(--bs-body-bg);flex-shrink:0;width:1em;height:1em;margin-top:.25em;vertical-align:top;-webkit-appearance:none;appearance:none;background-color:var(--bs-form-check-bg);…}
.input-group-text{display:flex;align-items:center;padding:.375rem .75rem;font-size:1rem;font-weight:400;line-height:1.5;color:var(--bs-body-color);text-align:center;white-space:nowrap;background-color:var(--bs-tertiary-bg);border:var(--bs-border-width) solid var(--bs-border-color);border-radius:var(--bs-border-radius)}
.input-group-text{background-color:var(--white);border-color:var(--lighter-gray)}
.fileList{width:100%;height:100%;display:none;overflow-y:auto;max-height:350px}
.text-right{text-align:right!important}
h5,.h5{font-size:1.171875rem}
```
(In post-alert, the scoped `#addon-img{background-color:var(--modal-input-group-bg)}` wins over the global `.input-group-text` background for the image-tab prepend; `#addon-url` uses the global.)

---

## Resolved values

Live-room token resolutions (`proroom-all-admin.json` › `cssVariables.root`, in effect during captures):
`--modal-content-bg-color=#103d5c`, `--modal-content-color=#f4f4f4`, `--modal-content-border-color=#103d5c`, `--modal-active-tab-bg-color=#45a2ff`, `--modal-active-tab-color=#fff`, `--modal-active-tab-border-color=#45a2ff`, `--modal-tabs-border-color=#45a2ff`, `--checkbox-bg-color=#45a2ff`, `--modal-btn-close-bg=#0a6db1`, `--modal-btn-close-border=#0a6db1`, `--modal-btn-success-bg=#92d528`, `--modal-btn-success-border=#92d528`, `--modal-btn-hover-opacity=0.9`, `--modal-input-group-bg=#0a6db1`, `--modal-alert-link-color=#0a6db1`, `--light-gray=#ccc`, `--white=#fff`, `--bs-modal-*` unset here so BS defaults apply for radius/padding.

Computed (from `proroom-all-admin.json` `.modal.show` groups) unless noted:

| Element | Property | Resolved value |
|---|---|---|
| `.modal` root (open) | display / position / z-index / overflow-y | `block` / `fixed` / `1055` / `auto` |
| `.modal-backdrop.show` | background / opacity | `#000` / `0.5` |
| `.modal-dialog` (user-settings) | max-width / margin / transform / pointer-events | `700px` / `28px auto` / `none` / `none` |
| `.modal-dialog` (webrtc) | max-width | `540px` (inline) |
| `.modal-content` | background-color | **`rgb(16,61,92)` = `#103d5c`** |
| `.modal-content` | color | `rgb(244,244,244)` = `#f4f4f4` |
| `.modal-content` | border | `1px solid rgba(0,0,0,0.176)` |
| `.modal-content` | border-radius | `8px` (all corners) |
| `.modal-content` | font-family / size / weight / line-height | `"Open Sans", sans-serif` / `16px` / `300` / `24px` |
| `.modal-header` | background / border-bottom | `transparent` / `1px solid rgb(69,162,255)` (=`#45a2ff`) |
| `.modal-header` | padding / height | `16px` / `65px` |
| `h5` title (user-settings/av) | color / size / weight | `#f4f4f4` / `16px` / `300` (no `.modal-title`) |
| `h5.modal-title` (mobile-app) | color / size / weight | `#f4f4f4` / `20px` / `500` |
| `h3.modal-title` (webrtc) | color / size / weight | `rgb(255,255,255)` / `20px` / `700` (scoped `!important`) |
| `.btn-close.btn-close-white` | width×height / padding / opacity | `16px×16px` (content-box; total 32px) / `8px` / `0.5` |
| `.btn-close` icon | filter | `invert(1) grayscale(100%) brightness(200%)` (white) |
| `.nav-tabs` (ul) | border-bottom | `1px solid rgb(69,162,255)` = `#45a2ff` |
| `.nav-link.active` | background / color | **`rgb(69,162,255)` = `#45a2ff`** / `rgb(255,255,255)` |
| `.nav-link.active` | border / radius | `1px solid #45a2ff`, `border-bottom:none` / `6px` top corners |
| `.nav-link` (inactive) | background / color / border | `transparent` / `rgb(255,255,255)` / `1px solid transparent` |
| `.themes/.text-mode-box .form-check-input` (unchecked) | appearance / bg / size / radius | `none` / `var(--light-gray)`=`#ccc` / `20px×20px` / `50%` |
| `.form-check-input:checked` | background-color | `rgb(69,162,255)` = `#45a2ff` (`--checkbox-bg-color`) |
| `.form-check-input:checked + label` | text-transform / weight | `uppercase` / `700` |
| `.form-check-label` | color | `#f4f4f4` |
| color-picker inputs (`#chat-*-color`) | width × height | `45px × 20px` (scoped) |
| `#chat-text-size` (number) | width×height / font-size | `45px×20px` / `13px` |
| `.modal-footer` | background / border-top / padding / height | `transparent` / `1px solid #45a2ff` / `12px` / `71px` |
| `.btn.btn-secondary` (Close) | bg / color / radius / padding | `rgb(108,117,125)` = `#6c757d` / `#fff` / `6px` / `6px 12px` |
| `.btn.btn-outline-danger` (Reset) | bg / color / border | `transparent` / `rgb(220,53,69)` = `#dc3545` / `1px solid #dc3545` |
| `.btn.btn-outline-light` (Save changes) | bg / color / border | `transparent` / `rgb(248,249,250)` = `#f8f9fa` / `1px solid #f8f9fa` |
| `.btn.btn-warning.btn-sm` (Edit Info) | bg / color / size / padding | `rgb(255,193,7)` = `#ffc107` / `#000` / `14px` / `4px 8px` |
| `.btn.btn-primary` (webrtc Start Test) | bg / color | **`rgb(10,109,177)` = `#0a6db1`** (`--modal-btn-close-bg`) / `#fff` |
| `.btn.btn-success` (webrtc Copy / av Save) | bg / color | **`rgb(146,213,40)` = `#92d528`** (`--modal-btn-success-bg`) / `#fff` |
| webrtc `p.text-muted` | color / size / weight | `rgb(229,231,235)` = `#e5e7eb` / `15.2px` / `500` (scoped `!important`) |
| webrtc `.status-item` | background / border / radius / padding | **`rgb(248,250,252)` = `#f8fafc`** (light card) / `1px solid rgb(226,232,240)`=`#e2e8f0` / `12px` / `16px 20px` |
| webrtc `.status-item span.fw-medium` | color / size / weight | `rgb(26,32,44)` = `#1a202c` / `15.2px` / `600` |
| webrtc `.status-icon.pending` | color / size / min-width | `rgb(100,116,139)` = `#64748b` / `24px` / `24px` |
| webrtc `.status-icon.passed` / `.failed` | color | `#10b981` / `#ef4444` (scoped; not in this pending capture) |
| mobile-app `img.google-badge` | height / max-height / width | `60px` / `60px` / `auto` (`155px` rendered) |
| post-alert `#addon-img` | background-color | `#0a6db1` (`--modal-input-group-bg`; scoped) |
| post-alert `#addon-url` | background / color / border | `var(--white)`=`#fff` / `--bs-body-color`=`#212529` / `1px solid var(--lighter-gray)`=`#eee` |

---

## States & effects

- **Open/close animation:** `.modal.fade .modal-dialog{transition:transform .3s ease-out;transform:translateY(-50px)}` → `.modal.show .modal-dialog{transform:none}` (dialog slides down-in). `.fade{transition:opacity .15s linear}` fades content; `.modal-backdrop.fade{opacity:0}`→`.show{opacity:.5}` fades the `#000` backdrop. When open, Bootstrap JS sets the root `.modal` to `display:block` (captured) and adds `.show`; `aria-hidden` toggles off.
- **Tab switch** (`data-bs-toggle="tab"`): active `<a>` gets `.active`; app rule `.modal-content .nav-tabs .nav-link.active{background:#45a2ff!important;color:#fff!important;cursor:default;border:1px solid #45a2ff;border-bottom:none}`. Panes: `.tab-pane.fade` → active pane adds `.show.active` (Bootstrap fade-in).
- **Tab hover** (inactive): `.modal-content .nav-tabs .nav-link:hover{border-color:#45a2ff!important;cursor:pointer}`. Active tab hover: `cursor:default`.
- **Checkbox/radio checked** (`.themes`/`.text-mode-box`): custom-drawn 20px circle; `:checked{background-color:#45a2ff}`; `:checked + label{text-transform:uppercase;font-weight:700}` (label text shouts when on). Transition `all .15s ease-out`. The sidebar-scoped variant adds `:checked:before{content:"\2714"}` checkmark + `:checked:after{animation:click-wave .65s}` ripple (200px expanding circle, opacity .35→0).
- **`.form-check-label:hover`** `{cursor:pointer;opacity:.85}` (scoped, user-settings).
- **`.btn-close`**: opacity `.5` → hover `.75` → focus `1` with focus-shadow `0 0 0 .25rem rgba(13,110,253,.25)`; white via `btn-close-white` filter.
- **Modal buttons hover:** `.modal-content .btn:hover{opacity:.9}` (`--modal-btn-hover-opacity`).
- **`.upload-area:hover`** (post-alert) `{cursor:pointer}`. **`.fileList`** default `display:none` (shows when files added). **`#filedragAlert`** inline `display:block`.
- **webrtc status:** `.status-icon.pending` grey `#64748b`; JS toggles `.passed` (green `#10b981`, item bg `#ecfdf5`, `border-left:4px solid #10b981`) / `.failed` (red `#ef4444`, bg `#fef2f2`) per test result. `.status-item{transition:background-color .3s ease}`. `.spin{animation:spin 1s linear infinite}` for in-progress icon.
- **Responsive** (user-settings): `@media max-width:750px{ .modal-dialog{max-width:60%} }`, `@media max-width:500px{ max-width:50% }`.

## Behavior

- **Dismiss:** every close button + the header `×` carry `data-bs-dismiss="modal"` (Bootstrap closes the modal). Footer "Close" buttons are `btn btn-secondary`.
- **Tabs:** `data-bs-toggle="tab"` + `href="#paneId"` (Bootstrap tab plugin swaps panes). Section header `<div>`s carry `title` tooltips.
- **av-settings:** "Disable Video" link → `mediaService.toggleDisableVideo()`; "Change Devices" → `setNewDevices()` (bundle template, offset ~2291544). Footer Save is `type="submit"`.
- **user-settings App tab:** "Filter out alerts" button has `data-bs-toggle="modal" data-bs-target="#alert-filter-modal"` (opens the alert-filter modal). "Edit my Info and Avatar" (`btn-warning`) opens the avatar/info editor (handler not in this dump). Reset/Save-changes buttons in the Colors&Size block are `type="button"`.
- **post-alert:** file input `#fuploadAlert` (`accept="image/*" multiple`) triggered by the `.upload-area` label; drop-zone `#filedragAlert`. "Post Alert" is `btn btn-success`. This is a **staff/presenter** tool (member view has no post-alert entry point).
- **mobile-app-info:** two external `target="_blank"` store links (URLs cited in DOM section).
- **webrtc-troubleshooter:** "Start Test" (`btn-primary`, `fa-play`) runs connectivity checks that flip each `.status-icon` pending→passed/failed; "Copy Results" (`btn-success`, `fa-copy`) copies output.

## Honest gaps

- **Backdrop element not in captures.** `.modal.show` state groups contain only the modal subtree; the `.modal-backdrop` div's computed style isn't captured — its appearance is taken from the global rule (`#000`, opacity `.5`, z-index 1050) which the modal root at z-index 1055 sits above.
- **Post-alert & av-settings not in the capture JSONs.** No `modal:alert-modal` or `modal:av-settings-modal` state exists in `proroom-all-admin.json`; their resolved chrome values are inferred from the shared `.modal-content` block + the identical DOM, and their component scoped CSS from the bundle. Individual computed values for post-alert/av-settings elements (e.g. textarea, form-select, `#addon-url` exact rect) are not directly captured.
- **Presenter/staff-only sub-controls hidden.** The `<!---->` placeholders (user-settings tabs beyond 3; av-settings presenter tab; post-alert extra checkboxes/buttons) represent role-gated markup absent from these (admin/member) dumps. The av-settings `#presenter-audio-video-settings` pane markup IS in `file10.html` but was inactive.
- **webrtc mic-test view not rendered.** `file30.html` shows only the 4-item connectivity checklist (`pending`). The component ships extensive scoped CSS for a mic-test panel (`.troubleshooter-tabs`, `.no-mic-*`, `.mic-select`, `.waveform-wrapper`, `.alert.alert-*`) and `passed`/`failed` states that are not exercised in the dump — those rules are listed but their live rendered values are uncaptured.
- **`--modal-close-btn-bg`/`--modal-close-btn-border`** (referenced by `.modal-content .btn-primary:active`) are **not present** in the live token table — that active-state rule resolves to unset (no override) in this room.
- **Exact form-check-input `:checked` glyph in user-settings.** The user-settings component's own styles omit the `:before` checkmark (only `:checked{background}`); whether the room-sidebar `:before/:after` variants also apply to the modal checkboxes depends on host encapsulation and was not directly observable in a checked state in the capture (all captured checkboxes were unchecked).
