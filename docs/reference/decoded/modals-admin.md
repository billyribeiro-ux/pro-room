# Modals-Admin

Admin/log/moderation modals for the "Mastering The Trade" room (lightTheme, admin role capture). Ten Angular components, each an Angular `_nghost` wrapping a Bootstrap-5 `.modal.fade` shell. They share one visual skin driven by the app's `.modal-content` var rules (navy `#103d5c` body, `#45a2ff` header/footer borders, `#f4f4f4` text), overlaid on Bootstrap 5 modal layout. Four of the ten (alerts-logs, chat-logs, muted, followed) were captured live with computed styles + rects in `proroom-all-admin.json`; the other six are decoded from raw DOM dumps + bundle scoped-CSS + bundle templates.

Component host tag → `_nghost` id → dump file:
- `app-alert-logs-modal` (`_nghost-ng-c86010747`) — `mixed-files/file15.html`, capture state `modal:alerts-logs-modal`
- `app-chat-logs-modal` (`_nghost-ng-c330848937`) — `mixed-files/file14.html` (2111 rows), capture state `modal:chat-logs-modal`
- `app-muted-users-modal` (`_nghost-ng-c170421237`) — `mixed-files/file20.html`, capture state `modal:mutedUsersModal`
- `app-followed-users-modal` (`_nghost-ng-c3991339994`) — `mixed-files/file21.html` == `file24.html`, capture state `modal:followedUsersModal`
- `app-session-control-modal` (`_nghost-ng-c3707659089`) — `mixed-files/file16.html`
- `app-scheduled-alerts-modal` (`_nghost-ng-c3289216005`) — `mixed-files/file25.html`
- `app-alerts-advanced-search` (`_nghost-ng-c2037626149`) — `mixed-files/file28.html`
- `app-alert-filter-modal` (`_nghost-ng-c1580528918`, `standalone:!0`) — `mixed-files/file29.html`
- `app-all-user-pmmodal` (`_nghost-ng-c3970478613`) — `mixed-files/file27.html`
- `app-alert-send-report-modal` (`_nghost-ng-c752360452`) — `mixed-files/file26.html`

All ten components' `ɵcmp` in `main.d6f5272aa3783e43.js` declare `encapsulation:none` — meaning `_ngcontent-%COMP%` selectors resolve, but there is **no** attribute-scoping isolation; the scoped `styles:[...]` strings behave as globals (the `[_ngcontent-%COMP%]` attribute is emitted on the elements but Angular emulated encapsulation is off, so the strings above match by class alone). Cross-checked below against computed styles.

---

## DOM structure

### Shared shell (all ten modals)
Every component renders the same outer skeleton (`main.d6f5272aa3783e43.js` `consts` arrays confirm attrs verbatim):

```
<app-XXX-modal _ngcontent-ng-c977335924 _nghost-ng-cNNN>
  <div id="<modalId>" tabindex="-1" [role="dialog" aria-labelledby="<label>"] aria-hidden="true"
       class="modal fade">          <!-- scheduled-alerts adds "text-white" -->
    <div role="document" class="modal-dialog[ modal-lg|modal-xl]">
      <div class="modal-content">
        <div class="modal-header"> <h5 …>Title</h5>
          <button type="button" data-bs-dismiss="modal" aria-label="Close"
                  class="btn-close btn-close-white"></button>
        </div>
        <div class="modal-body">  …body…  </div>
        <div class="modal-footer …"> …close/action buttons… </div>
      </div>
    </div>
  </div>
</app-XXX-modal>
```
`_ngcontent-ng-c977335924` is the parent-room host attribute stamped on the `<app-*>` custom element (the room shell instantiates all these modals as static siblings); `_ngcontent-ng-cNNN` is each modal's own component attribute.

### 1. alerts-logs (`file15.html`, host `_nghost-ng-c86010747`)
- Shell `id="alerts-logs-modal"`, `role="dialog"`, `aria-labelledby="alerts-logs-modal"`, `class="modal fade"`.
- `.modal-dialog` (no size modifier). `.modal-header` → `<h5>Alerts Logs<!----></h5>` (bare h5, **no** `.modal-title` class), `btn-close btn-close-white`.
- `.modal-body` → inner `<div>` containing: `<button class="btn btn-primary my-2">Reload Log List</button>`, then `<div class="list-group">` with a leading `<!---->` and N `<div class="list-group-item list-group-item-action ng-star-inserted">` rows. Each row:
  - `<div><strong class="fw-bold">Oct 22, 2023</strong></div>` (the log date)
  - `<div><strong class="fw-bold">By:&nbsp;</strong><i>admin@protradingroom.com</i></div>`
  - (alerts-logs has **no** Channel row — unlike chat-logs)
- Trailing `<!----><!----><!---->` in body (ng conditional placeholders: loading / empty / detail views).
- `.modal-footer text-center` → `<button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>`.

### 2. chat-logs (`file14.html`, host `_nghost-ng-c330848937`)
Identical skeleton to alerts-logs **except**:
- `<h5>Chat Logs<!----></h5>`.
- **2111** `list-group-item list-group-item-action` rows (`grep -c 'list-group-item-action' file14.html` = 2111).
- Each row has a **third** `<div>`: `<strong class="fw-bold">Channel:&nbsp;</strong><i>main</i>` (channel value; 1083 rows `main`, 1028 rows `offTopic` per `grep -oE '>[a-z]+</i>'`). Sample newest rows: `Jun 12, 2026` / `By: admin@protradingroom.com` / `Channel: offTopic`; oldest: `Oct 12, 2023`. Senders seen include `admin@protradingroom.com`, `lorna@simplertrading.com`.
- Footer `.modal-footer text-center` → `btn btn-secondary` Close.

### 3. muted-users (`file20.html`, host `_nghost-ng-c170421237`)
- Shell `id="mutedUsersModal"` (note: `tabindex` lowercase in dump, `aria-labelledby="mutedUsersModalLabel"`, `class="modal fade"`; no `role`).
- `.modal-dialog` (default). `.modal-header` → `<h5 id="mutedUsersModalLabel" class="modal-title">Muted Chat Users</h5>` (**has** `.modal-title`), `btn-close btn-close-white`.
- `.modal-body` → `<div class="text-center">You don't have any muted/ignored users.</div>` + `<!----><!---->` (list placeholder). Empty state as captured.
- `.modal-footer` → `<button class="btn btn-primary" data-bs-dismiss="modal">Close</button>`.

### 4. followed-users (`file21.html` == `file24.html`, host `_nghost-ng-c3991339994`)
- Shell `id="followedUsersModal"`, `aria-labelledby="followedUsersModalLabel"`, `class="modal fade"`, no `role`.
- `.modal-header` → `<h5 id="followedUsersModalLabel" class="modal-title">Followed Chat Users</h5>`.
- `.modal-body` → `<div class="text-center">You don't have any followed users.</div>` + `<!----><!---->`.
- `.modal-footer` → `<button class="btn btn-light" data-bs-dismiss="modal">Close</button>` (**btn-light**, differs from muted's btn-primary).
- Files file21 and file24 are byte-identical dumps of this component.

### 5. session-control (`file16.html`, host `_nghost-ng-c3707659089`)
- Shell `id="session-control-modal"`, `role="dialog"`, `aria-labelledby="session-control"`, `class="modal fade"`.
- `.modal-dialog modal-lg`. `.modal-header` → `<h5 id="session-control" class="modal-title">Session Control</h5>`.
- `.modal-body` → captured **empty** (`<!----><!---->`): body is populated at runtime. Bundle (`app-session-control-modal.ngOnInit`) shows on `"doSessionControlModal"` it calls `$("#session-control-modal").modal("show")` and initialises a **summernote** WYSIWYG editor on `#summernoteClosedMsg` (the "room closed message" editor; toolbar `["bold","italic","underline","clear"]` + forecolor, `dialogsInBody:!0`), plus audio/video device selects and streaming controls (`streamingType="RTMP"`, `streamingPlayerEnabled`). This is why the static dump body is empty.
- `.modal-footer` → `<button class="btn btn-success btn-block">Done</button>` (**no** `data-bs-dismiss`; closed programmatically via `done(){$("#session-control-modal").modal("hide")}` in bundle).

### 6. scheduled-alerts (`file25.html`, host `_nghost-ng-c3289216005`)
- Shell `id="scheduledAlertsModal"`, `aria-labelledby="scheduledAlertsModalLabel"`, `class="modal fade text-white"` (adds `text-white`), no `role`.
- `.modal-dialog modal-xl`. `.modal-header` → `<h5 id="scheduledAlertsModalLabel" class="modal-title">Manage Scheduled Alerts</h5>`.
- `.modal-body` → `<table class="table table-striped text-white w-100">`:
  - `<thead><tr>` five `<th scope="col">`: **Date / Time**, **Sender**, **Alert**, **Repeat**, **Actions**.
  - `<tbody>` → single `<!---->` (empty list as captured).
- `.modal-footer` → `<button class="btn btn-primary" data-bs-dismiss="modal">Close</button>`.

### 7. advanced-search (`file28.html`, host `_nghost-ng-c2037626149`)
- Shell `id="alerts-advanced-search-modal"`, `role="dialog"`, `aria-labelledby="alerts-advanced-search-modal"`, `class="modal fade"`.
- `.modal-header` → `<h5>Alerts Advanced Search <button class="btn btn-info btn-sm mx-1"><i class="fas fa-sync-alt me-1"></i> Rooms</button></h5>` (h5 **contains** an inline refresh-rooms button; no `.modal-title` class), then `btn-close btn-close-white`.
- `.modal-body`:
  - Row 1 `div.d-flex.align-items-center.justify-content-between.flex-wrap.mb-2`:
    - `div.d-flex…` wrapping two dropdowns:
      - `div.dropdown.dropdown-trader-select.mx-1` → `<button id="selectTraderDropdown" class="btn btn-light dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false"><span>--Select Traders--</span></button>` + `<ul class="dropdown-menu w-100">` of `<li><a class="dropdown-item">…</a></li>` (20 traders captured: Allison, Big Bad Voodoo Daddy, Bruce Marshall, Chris Brecher, Danielle Shay, Heather, Henry, JC, Kody Ashmore, Lorna St. George, Melissa Beegle, Mirza Catic, Omer Krdzic, RH, Sam, ST_Neil, Taylor, TG Watkins, Trendy Jon, CML Alert Bot).
      - `div.dropdown.dropdown-room-select.mx-1` → button `#selectRoomDropdown` `--Select Rooms--` + `<ul class="dropdown-menu w-100">` 3 rooms: **Showcase Room**, **Mastering The Trade**, **Tr3ndy Trading**.
    - `<input id="search-term-input" name="search-term-input" type="search" placeholder="Type your search term" aria-describedby="search-term-addon" class="form-control">`.
  - Row 2 `div.d-flex…justify-content-between.flex-wrap.mb-2`:
    - `<div>` two `div.form-check.m-1`: `#checkNonTradeAlert` "Non Trade Alert", `#checkArchives` "Also search archives?".
    - `div.d-flex…date-input-container`: two `div.d-flex…m-1` each `<label class="form-label m-0 me-1">` + `<input type="datetime-local">` → `#startDateInput` (Start Date:), `#endDateInput` (End Date:).
  - `div.w-100` → `<div class="mt-4 pt-4 text-center">No logs to display. Please, change the input fields.</div>` + `<!----><!---->` (results placeholder).
- `.modal-footer d-flex align-items-center justify-content-end` → `<!---->` + `<div>` with `<button class="btn btn-primary m-2 align-self-end"><i class="fas fa-search me-1"></i> Search</button>` and `<button class="btn btn-secondary m-2 align-self-end" data-bs-dismiss="modal">Close</button>`.

### 8. alert-filter (`file29.html`, host `_nghost-ng-c1580528918`, standalone)
- Shell `id="alert-filter-modal"`, `role="dialog"`, `aria-labelledby="alert-filter-modal"`, `class="modal fade"`.
- `.modal-header` → `<h5>Filter out<!----><!---->alerts from the following:</h5>`. The two `<!---->` are a conditional word insertion; bundle template `wue(t,n){1&t&&_(0,"Filter out")}` confirms "Filter out" is one conditional branch of the title (variant text is data-driven; see Honest gaps).
- `.modal-body pt-1`:
  - `div.form-check.m-2` → `<input type="checkbox" id="show-alerts" class="form-check-input">` + `<label for="show-alerts" class="form-check-label"> Only show alerts from these people: </label>`.
  - `<p>List is empty.</p>` + `<!----><!---->` (the people list `ul` — bundle `Due`/`Eue` template views render `<li>` rows with per-trader avatar + `toggleTraders(avatar,username)` click).
- `.modal-footer d-flex align-items-center justify-content-between` → `<button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>` + `<!---->`.

### 9. all-user-pm (`file27.html`, host `_nghost-ng-c3970478613`)
- Shell `id="all-user-pm-modal"`, `role="dialog"`, `aria-labelledby="all-user-pm-modal"`, `class="modal fade"`.
- `.modal-header` → `<h5>All private messages:<!----></h5>` (no `.modal-title`).
- `.modal-body` → loading state `<div class="text-center my-4"><h5><i class="ml-2 fas fa-spinner fa-spin"></i> Loading...</h5></div>` + `<!----><!---->`. **Note:** in this dump the `.modal-footer` is nested *inside* `.modal-body` (structural quirk in the captured DOM) → `<button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>`.

### 10. alert-send-report (`file26.html`, host `_nghost-ng-c752360452`)
- Shell `id="alert-send-report-modal"`, `role="dialog"`, `aria-labelledby="alert-send-report-modal"`, `class="modal fade"`.
- `.modal-header` → `<h5>Alert Sent Report. AlertID:</h5>` (AlertID value appended at runtime; empty here).
- `.modal-body` → loading state `<div class="text-center my-4"><h5><i class="ml-2 fas fa-spinner fa-spin"></i> Loading...</h5></div>` + `<!----><!----><!----><!---->`.
- `.modal-footer text-center` → `<button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>`.

### Trigger sources (role variants)
Triggers are staff/admin-only dropdown items and buttons elsewhere in the app (`data-bs-toggle="modal" data-bs-target="#<id>"`), from `main.d6f5272aa3783e43.js` `consts`:
- `#alerts-logs-modal` and `#chat-logs-modal` — `dropdown-item small` items inside a `dropdown-menu users-dropdown-options`, with `<i class="fas fa-bell">` / bell-adjacent icons (per-user context menu, admin).
- `#alert-send-report-modal` and `#replyModal` — `dropdown-item` items (fa-chart-pie / fa-reply) on an alert's action dropdown.
- `#all-user-pm-modal` — `btn btn-block btn-outline-light` (a full-width button in the perms/notes tab).
- `#scheduledAlertsModal` — `btn btn-outline-success mx-1` with `<i class="fas fa-calendar">`.
- `#alert-filter-modal` and `#alerts-advanced-search-modal` — `btn btn-outline-light btn-sm m-1` pair (alert toolbar).
Member view has none of these triggers (chat-only role — see Honest gaps).

---

## Scoped CSS (verbatim)

Extracted from `main.d6f5272aa3783e43.js` component `styles:[...]` arrays (each `ɵcmp`). `[_ngcontent-%COMP%]` attributes emitted but `encapsulation:none` → effectively global class selectors.

### app-alert-logs-modal
```css
.list-group[_ngcontent-%COMP%]{text-align:center;width:100%;max-width:600px;margin:0 auto}
.list-group-item[_ngcontent-%COMP%]{margin-bottom:1px}
.list-group-item[_ngcontent-%COMP%]:hover{cursor:pointer}
.log-header[_ngcontent-%COMP%], .log-body[_ngcontent-%COMP%]{width:100%;margin:0 auto}
.log-header-container[_ngcontent-%COMP%]{padding:10px}
.log-body[_ngcontent-%COMP%]{text-align:center}
.modal-dialog[_ngcontent-%COMP%]{overflow-y:initial!important}
.log-messages[_ngcontent-%COMP%]{max-height:calc(100vh - 350px);overflow-y:auto}
.modal-dialog[_ngcontent-%COMP%]{width:100%;max-width:1000px}
```

### app-chat-logs-modal
Byte-identical to alert-logs-modal styles:
```css
.list-group[_ngcontent-%COMP%]{text-align:center;width:100%;max-width:600px;margin:0 auto}
.list-group-item[_ngcontent-%COMP%]{margin-bottom:1px}
.list-group-item[_ngcontent-%COMP%]:hover{cursor:pointer}
.log-header[_ngcontent-%COMP%], .log-body[_ngcontent-%COMP%]{width:100%;margin:0 auto}
.log-header-container[_ngcontent-%COMP%]{padding:10px}
.log-body[_ngcontent-%COMP%]{text-align:center}
.modal-dialog[_ngcontent-%COMP%]{overflow-y:initial!important}
.log-messages[_ngcontent-%COMP%]{max-height:calc(100vh - 350px);overflow-y:auto}
.modal-dialog[_ngcontent-%COMP%]{width:100%;max-width:1000px}
```

### app-muted-users-modal
```css
.modal-dialog[_ngcontent-%COMP%]{overflow-y:initial!important}
.modal-body[_ngcontent-%COMP%]{max-height:79vh;overflow-y:auto;height:100%}
.list-group-item[_ngcontent-%COMP%]{background-color:inherit;color:#f1f1f1}
.list-group-item[_ngcontent-%COMP%]:hover{background-color:#353535}
.fw-bold[_ngcontent-%COMP%]{text-overflow:ellipsis;overflow:hidden;white-space:nowrap}
.fw-bold[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:30px;height:30px}
```

### app-followed-users-modal
```css
#followedUsersModal[_ngcontent-%COMP%]{z-index:1054!important}
.modal-dialog[_ngcontent-%COMP%]{overflow-y:initial!important}
.modal-body[_ngcontent-%COMP%]{max-height:79vh;overflow-y:auto;height:100%}
.list-group-item[_ngcontent-%COMP%]{background-color:inherit;color:#f1f1f1;border-color:#97cef0}
.list-group-item[_ngcontent-%COMP%]:hover{background-color:#164663}
.fw-bold[_ngcontent-%COMP%]{text-overflow:ellipsis;overflow:hidden;white-space:nowrap}
.fw-bold[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:30px;height:30px}
```

### app-session-control-modal
`styles:false` — no component-scoped CSS (pure Bootstrap + global app rules).

### app-scheduled-alerts-modal
```css
.remove-scheduled-alert-btn[_ngcontent-%COMP%]{width:88px!important}
.alert-date-time-th[_ngcontent-%COMP%]{min-width:150px!important}
```

### app-alerts-advanced-search
```css
.modal-dialog[_ngcontent-%COMP%]{overflow-y:initial!important}
.log-messages[_ngcontent-%COMP%]{max-height:calc(100vh - 425px);overflow-y:auto}
.modal-dialog[_ngcontent-%COMP%]{width:100%;max-width:1000px}
.dropdown-trader-select[_ngcontent-%COMP%]   .dropdown-toggle[_ngcontent-%COMP%], .dropdown-room-select[_ngcontent-%COMP%]   .dropdown-toggle[_ngcontent-%COMP%]{width:200px;height:38px;display:flex;align-items:center;justify-content:space-between}
.form-select[_ngcontent-%COMP%]{width:200px}
#search-term-input[_ngcontent-%COMP%]{flex:1;flex-basis:300px}
#search-term-input[_ngcontent-%COMP%], .form-select[_ngcontent-%COMP%]{margin:4px}
#startDateInput[_ngcontent-%COMP%], #endDateInput[_ngcontent-%COMP%]{width:190px}
.dropdown-trader-select[_ngcontent-%COMP%]   .dropdown-item[_ngcontent-%COMP%]:hover, .dropdown-room-select[_ngcontent-%COMP%]   .dropdown-item[_ngcontent-%COMP%]:hover, #search-term-addon[_ngcontent-%COMP%]:hover{cursor:pointer;opacity:.85}
.dropdown-trader-select[_ngcontent-%COMP%]   .dropdown-menu.show[_ngcontent-%COMP%]{height:420px;display:flex;flex-direction:column;width:410px!important;flex-wrap:wrap}
.dropdown-trader-select[_ngcontent-%COMP%]   .dropdown-item[_ngcontent-%COMP%], .dropdown-room-select[_ngcontent-%COMP%]   .dropdown-item[_ngcontent-%COMP%]{word-break:break-word;text-wrap:wrap}
.selected-traders-str[_ngcontent-%COMP%], .selected-rooms-str[_ngcontent-%COMP%]{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
```

### app-alert-filter-modal
```css
.text-opacity[_ngcontent-%COMP%]{opacity:.1}
.list-group-item-action[_ngcontent-%COMP%]{padding:4px 4px 4px 16px}
.list-group-item-action[_ngcontent-%COMP%]:hover{cursor:pointer}
.form-check-input[_ngcontent-%COMP%]:hover{cursor:pointer;opacity:.85}
```

### app-all-user-pmmodal
```css
.log-header[_ngcontent-%COMP%], .log-body[_ngcontent-%COMP%]{width:100%;margin:0 auto}
.log-header-container[_ngcontent-%COMP%]{padding:10px}
.log-body[_ngcontent-%COMP%]{text-align:center}
.modal-dialog[_ngcontent-%COMP%]{overflow-y:initial!important;width:100%;max-width:800px}
.log-messages[_ngcontent-%COMP%]{max-height:calc(100vh - 350px);overflow-y:auto}
```

### app-alert-send-report-modal
```css
.list-group[_ngcontent-%COMP%]{width:100%;max-width:600px;margin:0 auto}
.list-group-item[_ngcontent-%COMP%]{margin-bottom:1px}
.list-group-item[_ngcontent-%COMP%]:hover{cursor:pointer}
.report-header[_ngcontent-%COMP%], .report-body[_ngcontent-%COMP%]{width:100%;max-width:600px;margin:0 auto}
.report-header-container[_ngcontent-%COMP%]{padding:10px}
.report-body[_ngcontent-%COMP%]{text-align:left;max-height:calc(100vh - 500px);overflow-y:auto}
.modal-dialog[_ngcontent-%COMP%]{overflow-y:initial!important}
.modal-dialog[_ngcontent-%COMP%]{width:100%;max-width:800px}
#search-select-addon[_ngcontent-%COMP%]{padding:0;border:0;margin:0}
.form-select[_ngcontent-%COMP%]{border-top-right-radius:0;border-bottom-right-radius:0}
.failed-reason[_ngcontent-%COMP%]{font-size:14px;font-weight:100;font-style:italic}
.sent-time[_ngcontent-%COMP%]{font-size:14px;color:#6c757d}
#pie-container[_ngcontent-%COMP%]{left:0;top:0;width:600px;height:192px;margin-bottom:8px}
```

---

## Global CSS (verbatim)

The rules that actually win, from `styles.d622cb9ed2bbc221.css` (app override layer + Bootstrap 5). Order in the file: BS5 defaults first, then the app override block last (wins).

App override block (`styles.d622cb9ed2bbc221.css`, the rule that paints the navy skin — confirmed by computed `modal-content` bg = rgb(16,61,92)):
```css
.modal-content{background-color:var(--modal-content-bg-color);color:var(--modal-content-color)}
.modal-content .modal-header,.modal-content .modal-footer,.modal-content .nav-tabs{border-color:var(--modal-active-tab-border-color)!important}
.modal-content .nav-tabs .nav-link.active{border:1px solid var(--modal-active-tab-border-color)!important;border-bottom:none}
.modal-content .nav-tabs .nav-link:hover{border-color:var(--modal-active-tab-border-color)!important}
.modal-content .btn-primary{background-color:var(--modal-btn-close-bg);border-color:var(--modal-btn-close-border)}
```
`.modal-title` (app override, wins — but only applies where the h5 carries `.modal-title`, i.e. muted/followed/session-control/scheduled-alerts):
```css
.modal-title{color:#fff;font-size:18px;font-weight:700}
```

Bootstrap 5 modal layout (the winning BS5 copy, using `--bs-modal-*` vars):
```css
.modal-content{position:relative;display:flex;flex-direction:column;width:100%;color:var(--bs-modal-color);pointer-events:auto;background-color:var(--bs-modal-bg);background-clip:padding-box;border:var(--bs-modal-border-width) solid var(--bs-modal-border-color);border-radius:var(--bs-modal-border-radius);outline:0}
.modal-header{display:flex;flex-shrink:0;align-items:center;padding:var(--bs-modal-header-padding);border-bottom:var(--bs-modal-header-border-width) solid var(--bs-modal-header-border-color);border-top-left-radius:var(--bs-modal-inner-border-radius);border-top-right-radius:var(--bs-modal-inner-border-radius)}
.modal-footer{display:flex;flex-shrink:0;flex-wrap:wrap;align-items:center;justify-content:flex-end;padding:calc(var(--bs-modal-padding) - var(--bs-modal-footer-gap) * .5);background-color:var(--bs-modal-footer-bg);border-top:var(--bs-modal-footer-border-width) solid var(--bs-modal-footer-border-color);border-bottom-right-radius:var(--bs-modal-inner-border-radius);border-bottom-left-radius:var(--bs-modal-inner-border-radius)}
```
Note the app's `.modal-content .modal-header/.modal-footer{border-color:#45a2ff!important}` overrides the BS5 `--bs-modal-header-border-color` (computed proves it: border = rgb(69,162,255)).

`.btn-close` / `.btn-close-white` (BS5, `styles.d622cb9ed2bbc221.css`):
```css
.btn-close{--bs-btn-close-color:#000;--bs-btn-close-bg:url("data:image/svg+xml,…fill='%23000'…");--bs-btn-close-opacity:.5;--bs-btn-close-hover-opacity:.75;--bs-btn-close-focus-opacity:1;--bs-btn-close-white-filter:invert(1) grayscale(100%) brightness(200%);box-sizing:content-box;width:1em;height:1em;padding:.25em;color:var(--bs-btn-close-color);background:transparent var(--bs-btn-close-bg) center/1em auto no-repeat;border:0;border-radius:.375rem;opacity:var(--bs-btn-close-opacity)}
.btn-close-white,[data-bs-theme=dark] .btn-close{filter:var(--bs-btn-close-white-filter)}
```

Dialog sizing (BS5, winning copies):
```css
.modal-lg{min-width:90%;min-height:80%}   /* app override; session-control uses modal-lg */
.modal-xl{--bs-modal-width:800px}          /* scheduled-alerts; also .modal-xl{max-width:800px} in an earlier layer */
```
(Note: the component scoped rule `.modal-dialog{max-width:1000px}` overrides BS5 `.modal-lg/.modal-xl` where present — see Resolved values.)

Buttons (BS5 Darkly + BS5 utility layer; only ones used):
```css
.btn-success{color:#fff;background-color:#00bc8c;border-color:#00bc8c}   /* Darkly copy */
.btn-block{display:block;width:100%}
.list-group-item{position:relative;display:block;padding:.75rem 1.25rem;margin-bottom:-1px;background-color:#303030;border:1px solid #444}   /* Darkly base — overridden per-modal */
.list-group-item-action{width:100%;color:var(--bs-list-group-action-color);text-align:inherit}   /* BS5 */
.table-striped>tbody>tr:nth-of-type(odd)>*{--bs-table-color-type:var(--bs-table-striped-color);--bs-table-bg-type:var(--bs-table-striped-bg)}
```

---

## Resolved values

Live-room tokens (`proroom-all-admin.json` `cssVariables.body`) that feed the modal skin:
`--modal-content-bg-color: #103d5c` · `--modal-content-color: #f4f4f4` · `--modal-content-border-color: #103d5c` · `--modal-active-tab-border-color: #45a2ff` · `--modal-btn-close-bg: #0a6db1` · `--modal-btn-close-border: #0a6db1` · `--modal-btn-success-bg: #92d528` · `--modal-btn-danger-bg: #bb352a`.

Computed values from `proroom-all-admin.json` (`.modal.show` group of each state). rgb→hex in parentheses.

| Element (state) | Property | Resolved value | Source |
|---|---|---|---|
| `.modal.fade.show` (backdrop layer) | z-index | **1055** (followed = **1054**) | computed, alerts-logs / followed states |
| `.modal.fade.show` | overflow-y | auto | computed |
| `.modal-dialog` (alerts-logs) | width / max-width | **1000px / 1000px** | computed; scoped `.modal-dialog{max-width:1000px}` |
| `.modal-dialog` (alerts-logs) | rect | x:521 y:28 w:1000 h:357 | computed rect |
| `.modal-dialog` (muted/followed) | width / max-width | **500px / 500px** | computed (default BS width; no scoped max-width in these two → BS `--bs-modal-width` 500px) |
| `.modal-dialog` (muted/followed) | rect | x:771 y:28 w:500 h:192 | computed rect |
| `.modal-content` (all captured) | background-color | **rgb(16,61,92) = #103d5c** | computed = `--modal-content-bg-color` |
| `.modal-content` | color | **rgb(244,244,244) = #f4f4f4** | computed = `--modal-content-color` |
| `.modal-content` | border | **1px solid rgba(0,0,0,.176)** | computed (border-*-color rgba(0,0,0,0.176)) |
| `.modal-content` | border-radius | **8px** (all corners) | computed |
| `.modal-content` | display | flex (column) | computed |
| `.modal-content` | font-family | **"Open Sans", sans-serif** | computed (modal chain overrides body Lato) |
| `.modal-content` | font-size / weight | 16px / 300 | computed |
| `.modal-header` | border-bottom-color | **rgb(69,162,255) = #45a2ff** | computed = `--modal-active-tab-border-color` (app `!important`) |
| `.modal-header` | rect (alerts-logs) | x:522 y:29 w:998 h:65 | computed |
| `.modal-header` | display | flex, align-items:center | computed |
| `h5` bare title (alerts-logs) | font-size / weight | **20px / 500** | computed (BS5 h5 default; NOT `.modal-title` 18/700) |
| `h5` bare title | color | rgb(244,244,244) = #f4f4f4 | computed |
| `h5.modal-title` (muted) | font-size / weight | **20px / 500** (computed) | computed — NB: app `.modal-title{font-size:18px;font-weight:700}` exists but computed shows 20/500, so a later h5 rule / BS `--bs-modal-title` wins here; treat 20px/500 as the rendered truth |
| `.btn-close.btn-close-white` | width / height | 16px / 16px (icon 1em); box content-box → 32×32 hit | computed rect w:32 h:32 |
| `.btn-close.btn-close-white` | opacity | 0.5 | computed |
| `.btn-close.btn-close-white` | filter | invert(1) grayscale(100%) brightness(200%) (renders white ×) | global `.btn-close-white` |
| `.btn-close` | rect (alerts-logs) | x:1480 y:45 w:32 h:32 | computed |
| `.modal-body` (alerts-logs) | rect | x:522 y:94 w:998 h:219 | computed |
| `.modal-body` (muted/followed) | max-height / overflow-y | **999.35px (79vh) / auto** | computed = scoped `.modal-body{max-height:79vh;overflow-y:auto}` |
| `button.btn.btn-primary.my-2` "Reload Log List" | background-color | **rgb(10,109,177) = #0a6db1** | computed = `--modal-btn-close-bg` (app `.modal-content .btn-primary`) |
| `button.btn.btn-primary` "Reload…" | color | rgb(255,255,255) | computed |
| `button.btn.btn-primary` "Reload…" | rect | x:538 y:118 w:137 h:38 | computed |
| `.list-group` (alerts-logs) | width / max-width | 600px / 600px | computed = scoped `.list-group{max-width:600px}` |
| `.list-group` | text-align / display | center / flex | computed |
| `.list-group` | rect | x:721 y:164 w:600 h:133 | computed |
| `.list-group-item.list-group-item-action` (alerts-logs/chat-logs) | background-color | **rgb(255,255,255) = #fff** (Bootstrap default, NOT overridden — alerts/chat have no bg override) | computed |
| `.list-group-item` (alerts-logs) | color | rgb(33,37,41) = #212529 | computed |
| `.list-group-item` (alerts-logs) | rect (1st row) | x:721 y:164 w:600 h:66 | computed |
| `strong.fw-bold` (alerts-logs) | font-weight | 700 | computed |
| `strong.fw-bold` | display | inline | computed |
| `.modal-footer` (alerts-logs) | border-top-color | **rgb(69,162,255) = #45a2ff** | computed (app `!important`) |
| `.modal-footer` (alerts-logs) | display / justify | flex; text-center → text-align:center | computed |
| `.modal-footer` (alerts-logs) | rect | x:522 y:313 w:998 h:71 | computed |
| `button.btn.btn-secondary` Close (alerts-logs) | background-color | rgb(108,117,125) = #6c757d | computed |
| `button.btn.btn-secondary` Close | rect | x:1437 y:330 w:67 h:38 | computed |
| `button.btn.btn-primary` Close (muted) | background-color | rgb(10,109,177) = #0a6db1 (`--modal-btn-close-bg`) | computed |
| `button.btn.btn-light` Close (followed) | background-color / color | rgb(248,249,250) = #f8f9fa / rgb(0,0,0) | computed |
| chat-logs `.modal-dialog` | height (rect) | **195795px** (2111 rows, no scroll cap on dialog; `.modal-body` here has no max-height so the whole list renders) | computed rect |
| followed `.list-group-item` (when populated) | background / color / border | inherit (→#103d5c) / #f1f1f1 / #97cef0 | scoped (not exercised in empty capture) |
| muted `.list-group-item` (when populated) | background / color | inherit (→#103d5c) / #f1f1f1 | scoped (not exercised in empty capture) |
| advanced-search `.dropdown-toggle` (trader/room) | width / height | 200px / 38px | scoped |
| advanced-search `#search-term-input` | flex / flex-basis | 1 / 300px | scoped |
| advanced-search `#startDateInput`,`#endDateInput` | width | 190px | scoped |
| advanced-search trader `.dropdown-menu.show` | height / width | 420px / 410px (column wrap) | scoped |
| scheduled-alerts `.alert-date-time-th` | min-width | 150px | scoped |
| scheduled-alerts `.remove-scheduled-alert-btn` | width | 88px | scoped |
| alert-send-report `#pie-container` | width / height | 600px / 192px | scoped |
| alert-send-report `.sent-time` | font-size / color | 14px / #6c757d | scoped |
| alert-send-report `.failed-reason` | font-size / weight / style | 14px / 100 / italic | scoped |

Backdrop: `.modal-backdrop` not in these groups; BS5 default `rgba(0,0,0,.5)` via `--bs-backdrop-opacity` (not captured — see Honest gaps).

---

## States & effects

- **Hidden-until:** every shell is `class="modal fade" … aria-hidden="true"` in the static dumps → hidden. Shown by Bootstrap adding `.show` + inline `display:block` (captured states show `div.modal.fade.show`, and the room JS calls `$("#id").modal("show")`). `.fade` gives the BS5 opacity transition (`transition:opacity .15s linear`, BS5 default).
- **List-group-item hover (alerts-logs / chat-logs / send-report):** `.list-group-item:hover{cursor:pointer}` (scoped) — pointer cursor, no color change; item stays white.
- **List-group-item hover (muted):** `.list-group-item:hover{background-color:#353535}` (scoped).
- **List-group-item hover (followed):** `.list-group-item:hover{background-color:#164663}` (scoped).
- **Advanced-search dropdown-item hover / search-addon hover:** `{cursor:pointer;opacity:.85}` (scoped).
- **Alert-filter list-group-item-action hover & form-check-input hover:** `{cursor:pointer}` / `{cursor:pointer;opacity:.85}` (scoped).
- **btn-close hover/focus:** BS5 `--bs-btn-close-hover-opacity:.75`, `--bs-btn-close-focus-opacity:1`, focus ring `--bs-btn-close-focus-shadow:0 0 0 .25rem rgba(13,110,253,.25)` (global `.btn-close`). Base opacity .5.
- **followed-users z-index:** scoped `#followedUsersModal{z-index:1054!important}` → the followed modal sits *below* the standard 1055 modal layer (confirmed computed z-index 1054 vs 1055 elsewhere). Deliberate stacking so it can open over another modal.
- **Nav-tabs (only if a modal renders tabs):** app `.modal-content .nav-tabs .nav-link.active{border:1px solid #45a2ff!important;border-bottom:none}` and `:hover{border-color:#45a2ff!important}`. None of these ten static dumps show tabs, but session-control/all-user-pm bodies are runtime-rendered.
- **Spinner:** loading states (all-user-pm, alert-send-report) use `<i class="fas fa-spinner fa-spin">` — FontAwesome `fa-spin` keyframe rotation.
- **text-opacity:** alert-filter scoped `.text-opacity{opacity:.1}` (dims a filtered-out row when active).
- **No CSS transitions** on modal-content/body beyond BS `.fade` opacity; no transforms captured.

---

## Behavior (provable from templates/DOM)

- **Dismiss:** every `btn-close btn-close-white` and every footer Close button (except session-control's Done and alert-filter's is Close) carry `data-bs-dismiss="modal"` → Bootstrap hides the modal. Session-control's `<button class="btn btn-success btn-block">Done</button>` has **no** dismiss attr — it is closed by component code `done(){$("#session-control-modal").modal("hide")}` (bundle).
- **Session-control open:** app event bus `"doSessionControlModal"` → `$("#session-control-modal").modal("show")`; on first open it initialises summernote on `#summernoteClosedMsg` and wires audio/video device change + streaming (RTMP) handlers (bundle `ngOnInit`).
- **Advanced-search:**
  - Header "Rooms" button (`btn btn-info btn-sm`, `fa-sync-alt`) refreshes the room list.
  - `#selectTraderDropdown` / `#selectRoomDropdown` are `data-bs-toggle="dropdown" data-bs-auto-close="outside"` (menu stays open while multi-selecting). `.dropdown-item` clicks toggle selection; selected labels render into `.selected-traders-str` / `.selected-rooms-str` (ellipsised).
  - `#search-term-input` (type=search), `#checkNonTradeAlert`, `#checkArchives`, `#startDateInput`/`#endDateInput` (datetime-local) feed the query.
  - Footer **Search** (`btn btn-primary`, `fa-search`) runs it; **Close** (`btn btn-secondary`, `data-bs-dismiss`) closes.
- **Alert-filter:** `#show-alerts` checkbox → "Only show alerts from these people". People `<li>` rows call `toggleTraders(avatar, username)` (bundle `Tue` template). Empty state renders `<p>List is empty.</p>`.
- **Alerts-logs / chat-logs:** "Reload Log List" `btn btn-primary` re-fetches the date list; each `list-group-item` (`:hover{cursor:pointer}`) is clickable to open that day's log (the trailing `<!---->` body placeholders are the detail/loading views).
- **Trigger wiring** (see DOM structure → Trigger sources): all modals are opened by `data-bs-toggle="modal" data-bs-target="#<id>"` controls in the admin UI, except session-control (event-bus) and the two loading modals (all-user-pm, alert-send-report) which fetch on open.
- **Tooltips:** none of these ten components declare `data-bs-toggle="tooltip"` in their dumps/templates.

---

## Honest gaps

- **Six modals never captured with computed styles.** Only alerts-logs, chat-logs, muted, followed have live computed styles/rects in `proroom-all-admin.json`. Session-control, scheduled-alerts, advanced-search, alert-filter, all-user-pm, alert-send-report are decoded from raw DOM + bundle CSS only — their resolved pixel values (final button positions, exact modal-xl/lg widths as rendered) are inferred from scoped rules + BS5 defaults, not measured.
- **Empty / loading states only.** muted ("no muted users"), followed ("no followed users"), scheduled-alerts (empty `<tbody>`), advanced-search ("No logs to display"), alert-filter ("List is empty"), all-user-pm & alert-send-report ("Loading…") were all captured in their empty/loading state. Populated-row markup (a muted user row, a scheduled-alert row, a PM row, a sent-report pie/table) is **not** in the evidence — only the scoped CSS hints (`.fw-bold img{30×30}`, `.remove-scheduled-alert-btn`, `#pie-container`, `.sent-time`, `.failed-reason`) show what those rows will contain.
- **Session-control body is entirely runtime.** file16 body is `<!----><!---->`. The summernote editor, device selects, and streaming controls markup are generated by JS at open time and are not in any static dump.
- **`.modal-title` computed conflict.** App CSS declares `.modal-title{color:#fff;font-size:18px;font-weight:700}` (at byte offset 443089 in `styles.d622cb9ed2bbc221.css`, the last of three `.modal-title` rules) but the muted **and** followed captures both compute their `h5.modal-title` at **20px / font-weight 500 / color rgb(244,244,244)=#f4f4f4** with line-height 30px — and the bare `h5` in alerts-logs computes identically (20px/500, line-height 24px). So the 18px/700/#fff rule is present in the sheet but is **not** the winner at runtime for these modals (color inherits the `.modal-content` #f4f4f4 rather than the rule's #fff, confirming it's shadowed — likely by a `.modal-content h5` / `--bs-modal-title-*` chain not isolated here). Rendered truth for all captured titles = **20px / 500 / #f4f4f4**; treat the 18px/700 rule as present-but-overridden.
- **Backdrop.** `.modal-backdrop` element/opacity not present in the captured `.modal.show` groups; BS5 default `rgba(0,0,0,.5)` assumed, not measured.
- **Alert-filter title variant.** Header is `Filter out<!----><!---->alerts from the following:` with two conditional placeholders; bundle confirms "Filter out" is a conditional branch (`wue`) but the alternate title text (e.g. a "trade"/"all" qualifier) was not resolvable from the dump.
- **AlertID / PM content.** alert-send-report `<h5>Alert Sent Report. AlertID:</h5>` and all-user-pm titles have their dynamic value appended at runtime — the ID/count is empty in the dump.
- **Member vs staff.** These are admin/moderator surfaces; the member (chat-only) role has no triggers for them (per role model). No member-role capture of these modals exists to diff against.
- **file21 == file24.** Both are identical followed-users dumps; file24 provides no additional variant.
