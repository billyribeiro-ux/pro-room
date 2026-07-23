# Sidebar

The left drawer of the room shell — the Angular component `app-room` scoped id in the
captured build is `_ngcontent-ng-c977335924` (raw DOM dumps) / `_ngcontent-%COMP%` (live
bundle `main.d6f5272aa3783e43.js`); both are the SAME component, verified rule-for-rule
identical. The room runs `<app-room class="lightTheme">` (see Resolved values), so the
navy `--sidebar-wrapper-*` boot tokens are overridden to white/grey for the wrapper while
the accent tokens (`--ptr-website-link-color`, `--archives-*`, `--reload/search-icon-*`,
`--users-badge-*`) keep their navy values.

The tree is `div.room-sidebar > div.sidebar-wrapper > nav.navbar.w-100.h-100 >
ul.navbar-nav.small.w-100.h-100 > li…`. The wrapper is `position:absolute; margin-left:-250px`
(off-screen left, x = -250 in every capture — it is CLOSED by default and opened via the
navbar hamburger `.sidebar-menu`, which pushes the content `div.wrapper` right by adding
class `push-wrapper`).

---

## DOM structure

Literal member-view markup, verbatim from `mixed-files/file2.html` lines 15–305 (attr
`_ngcontent-ng-c977335924` omitted below for brevity; present on every element). The live
bundle template (`main.d6f5272aa3783e43.js`, functions `dPe`/`uPe`/`mPe`/`iPe`/`rPe`/`aPe`/
`lPe`/`cPe` and the parent list assembly) confirms the same nodes plus role/feature
conditionals noted inline.

```html
<div class="room-sidebar">
  <div class="sidebar-wrapper">
    <nav class="navbar w-100 h-100">
      <ul class="navbar-nav small w-100 h-100">

        <!-- li:first-child — powered-by / version / mobile-app / connection ticks -->
        <li class="nav-item text-center">
          <p>Powered by:&nbsp;
            <a href="https://protradingroom.com" target="_blank"
               rel="noopener noreferrer" class="ptr-website-link">
              ProTradingRoom.com</a>
          </p>
          <p>Version: v4.0.1-c0fee8f5</p>            <!-- bound to appService.globals.appVersion -->
          <p>                                         <!-- hidden when sessData.hideAppInfo (O(12,...?-1)) -->
            <button type="button" data-bs-toggle="modal"
                    data-bs-target="#mobileAppInfoModal"
                    class="btn btn-sm btn-secondary">Mobile App Info</button>
          </p>
          <!-- isTipEnabled gate O(13) — no tip rendered here in this capture -->
          <hr>
          <!-- Chat/Media connection ticks: -->
          <p>
            <span>Chat <i class="fas fa-check"></i></span>       <!-- shown when NOT socketConnected? see note -->
            <span class="ng-star-inserted">Media <i class="fas fa-check"></i></span>
          </p>
        </li>

        <!-- Connectivity Check -->
        <li class="nav-item">
          <a title="Connectivity Check" data-bs-toggle="modal"
             data-bs-target="#webrtc-troubleshooter-modal"
             class="nav-link sidebar-item">
            <i class="fas fa-network-wired"></i>
            <span class="pl-2">Connectivity Check</span>
          </a>
        </li>

        <!-- (conditional) Reopen Alerts / Chat — li rendered only when reopenAlertsChatBtn (bundle iPe, O(25)) -->

        <!-- General Settings -->
        <li class="nav-item">
          <a title="General Settings" data-bs-toggle="modal"
             data-bs-target="#user-settings-modal"
             class="nav-link sidebar-item">
            <i class="fas fa-cogs"></i>
            <span class="pl-2">General Settings</span>
          </a>
        </li>

        <!-- Archives dropdown -->
        <li class="nav-item dropdown">
          <a id="archivesDropdown" title="Archives" data-bs-toggle="dropdown"
             aria-haspopup="true" aria-expanded="false"
             class="nav-link sidebar-item dropdown-toggle">
            <i class="fas fa-archive"></i>
            <span class="pl-2">Archives</span>
          </a>
          <div aria-labelledby="archivesDropdown"
               class="dropdown-menu users-dropdown-options">
            <!-- Recording — bundle aPe, shown when isPresenter || !sessData.hideRecs (NOT present in member file2) -->
            <a data-bs-toggle="modal" data-bs-target="#alerts-logs-modal"
               class="dropdown-item small">
              <i class="fas fa-bell"></i><span class="pl-2">Alert Logs</span>
            </a>
            <a data-bs-toggle="modal" data-bs-target="#chat-logs-modal"
               class="dropdown-item small">
              <i class="fas fa-comment"></i><span class="pl-2">Chat Logs</span>
            </a>
            <!-- Chat Logs shown when !sessData.hideChatLog || isPresenter (bundle lPe, O(11)) -->
            <a class="dropdown-item small">
              <i class="fas fa-closed-captioning"></i>
              <span class="pl-2">Transcript History</span>
            </a>
            <!-- Transcript History shown when !sessData.hideChatLog || isPresenter (bundle cPe, O(12)) -->
          </div>
        </li>

        <!-- Manage Muted Users -->
        <li class="nav-item py-0">
          <a title="Manage Muted Users" data-bs-toggle="modal"
             data-bs-target="#mutedUsersModal" class="nav-link sidebar-item ps-1">
            <i class="fas fa-comments"></i>
            <span class="pl-2">Manage Muted Users</span>
          </a>
        </li>

        <!-- Manage Followed Users -->
        <li class="nav-item py-0">
          <a title="Manage Followed Users" data-bs-toggle="modal"
             data-bs-target="#followedUsersModal" class="nav-link sidebar-item ps-1">
            <i class="fas fa-users"></i>
            <span class="pl-2">Manage Followed Users</span>
          </a>
        </li>

        <!-- (conditional) Get Random User — bundle uPe li, shown when isPresenter (O(43)) -->
        <!-- (conditional, above Muted) Benzinga News — bundle rPe li, shown when sessData.hasBenzingaNews (O(31)) -->

        <!-- Users header + roster (li:last, gated: onlyPresentersVisibleToViewers ||
             rosterVisibleToViewers || isPresenter || user.hasAdminChat — bundle mPe, O(44)) -->
        <li class="nav-item d-flex flex-column h-100">
          <a class="nav-link active-room-users d-flex align-items-center justify-content-between pt-0">
            <div title="Users"><i class="fas fa-user"></i><span class="pl-2">Users: </span></div>
            <div class="flex-fill users-btns">
              <div title="Users Options" class="dropdown user-options">
                <button id="user-options-btn" data-bs-toggle="dropdown" aria-expanded="false"
                        class="btn btn-sm btn-dark ml-1 float-right border-0 dropdown-toggle">
                  <i class="fas fa fa-cog"></i>
                </button>
                <ul aria-labelledby="user-options-btn" class="dropdown-menu">
                  <li class="dropdown-item d-flex align-items-center justify-content-between">
                    <span>Sort by Trials</span>
                  </li>
                </ul>
              </div>
              <button title="Reload Users"
                      class="btn btn-sm btn-default ml-1 float-right reload-room-users border-0">
                <i class="fas fa fa-sync"></i>
              </button>
              <button title="Sort Users"
                      class="btn btn-sm btn-secondary float-right border-0 ms-1">
                <i class="fas fa-sort-alpha-down"></i>
              </button>
              <button title="Search Users"
                      class="btn btn-sm btn-default float-right search-room-users border-0">
                <i class="fas fa fa-search"></i>
              </button>
            </div>
          </a>
          <div class="flex-grow-1">
            <app-room-roster _nghost-ng-c900715899>
              <div class="room-roster-list"><!----></div>
            </app-room-roster>
          </div>
        </li>

      </ul>
    </nav>
  </div>
</div>
```

### Role / feature variants (bundle gating, `main.d6f5272aa3783e43.js`, sidebar `if(2&t)` block)

Verbatim conditions from the parent template's update block
(`m(11),Ie("Version: ",e.appService.globals.appVersion,"") …`):

| Node | Rendered when (condition) | Const idx |
|------|---------------------------|-----------|
| Version `<p>` | always; text = `appService.globals.appVersion` | 11 |
| Mobile App Info `<p>` | `!sessData.hideAppInfo` | O(12) |
| Tip item | `isTipEnabled` | O(13) |
| "Chat" tick span | `!appService.globals.socketConnected ? 15 : -1` (index 15) / `18: socketConnected?18:-1` | O(15)/O(18) |
| "Media" tick span | `!mediaSoupService.connected ? 16 : -1` / `19: mediaSoupService.connected?19:-1` | O(16)/O(19) |
| Reopen Alerts / Chat `li` (`iPe`) | `reopenAlertsChatBtn` | O(25) |
| Benzinga News `li` (`rPe`) | `sessData.hasBenzingaNews` | O(31) |
| Archives `li` (`dPe`) | `archivesAvailableTo()` | O(32) |
| Get Random User `li` (`uPe`) | `appService.globals.isPresenter` | O(43) |
| Users/roster `li` (`mPe`) | `sessData.onlyPresentersVisibleToViewers \|\| sessData.rosterVisibleToViewers \|\| isPresenter \|\| user.hasAdminChat` | O(44) |

Inside the Archives dropdown (`dPe`): **Recording** (`aPe`) when `isPresenter \|\| !sessData.hideRecs`;
**Alert Logs** rendered unconditionally in `dPe`; **Chat Logs** (`lPe`) and **Transcript History**
(`cPe`) when `!sessData.hideChatLog \|\| isPresenter`. In member `file2.html` the dropdown shows
Alert Logs + Chat Logs + Transcript History (no Recording).

There is **NO dedicated "ADMIN" or "APP" section** in this sidebar — grep of `file2.html` for
`ADMIN|APP SETTINGS|Room Settings|Admin Settings|Manage Room|Broadcast` returns 0 hits. Admin/
presenter differences are the feature-gated `li` items above (Get Random User, Recording, the
Users-Options "Sort by Trials" menu), not a separate section.

---

## Scoped CSS (verbatim)

From `main.d6f5272aa3783e43.js` (`_ngcontent-%COMP%`), byte-identical to the inline
`<style>` in `mixed-files/file-1.html` lines ~942–1420 (`_ngcontent-ng-c977335924`). Only
rules touching this surface:

```css
#connectedMsg[_ngcontent-%COMP%]{display:none}
.room-sidebar[_ngcontent-%COMP%]   .navbar-nav[_ngcontent-%COMP%]{overflow:hidden auto!important}
.h-inherit[_ngcontent-%COMP%]{height:inherit!important}
.vh-100[_ngcontent-%COMP%]{height:100vh!important}
.room-sidebar[_ngcontent-%COMP%]   .navbar-nav[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]{
  font-size:14px;font-weight:700;
  border-bottom:1px solid var(--sidebar-navItem-border-color);padding:5px 2px}
.room-sidebar[_ngcontent-%COMP%]   .navbar-nav[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:first-child{
  font-size:14px;font-weight:400}
.room-sidebar[_ngcontent-%COMP%]   .navbar-nav[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{
  margin-bottom:8px}
.room-sidebar[_ngcontent-%COMP%]   .navbar-nav[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   hr[_ngcontent-%COMP%]{
  margin:5px 0}
.room-sidebar[_ngcontent-%COMP%]   .navbar-nav[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   .saves-bandwidth[_ngcontent-%COMP%]{
  font-size:11px}
.room-sidebar[_ngcontent-%COMP%]   .navbar-nav[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   .dropdown-toggle[_ngcontent-%COMP%]:after{
  float:right;margin:10px 10px 15px}

.sidebar-wrapper[_ngcontent-%COMP%]{
  position:absolute!important;margin-left:-250px;top:0;
  height:calc(100vh - 49px);width:250px;
  background-color:var(--sidebar-wrapper-bg-color)!important;
  color:var(--sidebar-wrapper-color)!important;z-index:3}

.push-wrapper[_ngcontent-%COMP%]{left:250px;width:calc(100% - 250px)}      /* one copy also has !important on width */

.navbar[_ngcontent-%COMP%]{padding:0;height:49px}
.btnNavToggler[_ngcontent-%COMP%]{height:49px}
.navbar-nav[_ngcontent-%COMP%]   .fa-1x[_ngcontent-%COMP%]{font-size:25px!important}

.navbar-dark[_ngcontent-%COMP%]   .navbar-nav[_ngcontent-%COMP%]   .nav-link[_ngcontent-%COMP%],
.muted[_ngcontent-%COMP%]{color:#abb0b5}

.ptr-website-link[_ngcontent-%COMP%]{color:var(--ptr-website-link-color)}
.mobile-app-info[_ngcontent-%COMP%]{
  background-color:var(--mobileApp-info-bg-color);color:var(--mobileApp-info-color)}
.mobile-app-info[_ngcontent-%COMP%]:hover{opacity:.9}

.sidebar-item[_ngcontent-%COMP%]{color:inherit!important}
.sidebar-item[_ngcontent-%COMP%]:hover{background-color:#e9ecef}

.reload-room-users[_ngcontent-%COMP%]{
  background-color:var(--reload-icon-bg-color);color:var(--reload-icon-color)}
.search-room-users[_ngcontent-%COMP%]{
  background-color:var(--search-icon-bg-color);color:var(--search-icon-color)}
.active-room-users[_ngcontent-%COMP%]   .badge[_ngcontent-%COMP%]{
  background-color:var(--users-badge-bg-color);color:var(--users-badge-color)}

.user-options[_ngcontent-%COMP%]   .dropdown-menu[_ngcontent-%COMP%]{
  position:absolute!important;z-index:1000!important;top:30px!important;
  left:-106px!important;width:228px;font-size:13px;padding:2px}
.user-options[_ngcontent-%COMP%]   .dropdown-toggle[_ngcontent-%COMP%]:after{display:none!important}
.users-btns[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]{padding:3px 6px}

.mainNavItem[_ngcontent-%COMP%]{display:none;color:var(--light-gray)}     /* mobile-only nav clones */

.benzinga-logo[_ngcontent-%COMP%]{max-height:25px!important}
.benzinga-logo-alt[_ngcontent-%COMP%]{
  background-color:#000;width:100%!important;max-height:25px!important;max-width:230px!important}

.hidden[_ngcontent-%COMP%]{display:none}
```

Media-query rule that affects the sidebar's mobile-clone items (`file-1.html` ~1418):

```css
@media only screen and (max-width:768px){ .mainNavItem[_ngcontent-%COMP%]{display:block} }
```

Note: a SECOND component (a different `_ngcontent`) ships its own
`.sidebar-wrapper{…;background-color:#000!important;color:#868686!important;…}` in the
bundle — that is NOT this room sidebar and does not apply here; the room's wrapper uses the
`var(--sidebar-wrapper-*)` copy above.

---

## Global CSS (verbatim)

From `styles.d622cb9ed2bbc221.css` (Bootstrap 4 Darkly + BS5 layered). Only the rules that
actually win for sidebar elements:

```css
/* Archives dropdown container — overrides Darkly .dropdown-menu for this menu */
.users-dropdown-options{
  background-color:var(--archives-dropdown-menu-bg-color)!important;
  color:var(--archives-dropdown-menu-color)!important;border:none}
.users-dropdown-options a{margin:0!important}
.users-dropdown-options a:hover{cursor:pointer}

/* Darkly base (applies to user-options .dropdown-menu; archives menu overrides bg/color above) */
.dropdown-menu{
  position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:10rem;
  padding:.5rem 0;margin:.125rem 0 0;font-size:.9375rem;color:#fff;text-align:left;
  list-style:none;background-color:#222;background-clip:padding-box;border:1px solid #444;
  border-radius:.25rem}
.dropdown-item{
  display:block;width:100%;padding:.25rem 1.5rem;clear:both;font-weight:400;color:#fff;
  text-align:inherit;white-space:nowrap;background-color:transparent;border:0}

/* nav / navbar layout */
.navbar-nav{display:flex;flex-direction:column;padding-left:0;margin-bottom:0;list-style:none}
.nav-link{display:block;padding:.5rem 2rem}
small,.small{font-size:80%;font-weight:400}
.text-center{text-align:center!important}
.pt-0,.py-0{padding-top:0!important}          /* .py-0 also sets padding-bottom:0 via .pb-0,.py-0 */
.ps-1{padding-left:.25rem!important}
.pl-2,.px-2{padding-left:.5rem!important}

/* dropdown-toggle caret (BS) — repositioned by scoped .dropdown-toggle:after float:right */
.dropdown-toggle:after{
  display:inline-block;margin-left:.255em;vertical-align:.255em;content:"";
  border-top:.3em solid transparent;border-right:0;border-bottom:.3em solid transparent;
  border-left:.3em solid}

/* buttons — BS5 .btn-secondary layer WINS over Darkly's #444 (loaded later) */
.btn{
  display:inline-block;font-weight:400;color:#fff;text-align:center;vertical-align:middle;
  user-select:none;background-color:transparent;border:1px solid transparent;
  padding:.375rem .75rem;font-size:.9375rem;line-height:1.5;border-radius:.25rem;
  transition:color .15s ease-in-out,background-color .15s ease-in-out,
             border-color .15s ease-in-out,box-shadow .15s ease-in-out}
.btn-sm,.btn-group-sm>.btn{padding:.25rem .5rem;font-size:.8203125rem;line-height:1.5;border-radius:.2rem}
.btn-secondary{                                 /* Darkly (loses) */
  color:#fff;background-color:#444;border-color:#444}
.btn-secondary{                                 /* BS5 (wins → computed #6c757d) */
  --bs-btn-color:#fff;--bs-btn-bg:#6c757d;--bs-btn-border-color:#6c757d;
  --bs-btn-hover-color:#fff;--bs-btn-hover-bg:#5c636a;--bs-btn-hover-border-color:#565e64;…}
```

---

## Resolved values

Live room tokens are from `proroom-all-admin.json` → `cssVariables.root` (and confirmed
identical in `docs/reference/captures/proroom-full-member.json`); the room is `lightTheme`
so `styles.css .lightTheme{…}` remaps `--sidebar-wrapper-bg-color → --lightTheme-sidebar-wrapper-bg-color`
(#fff), `--sidebar-wrapper-color → #676767`, `--mobileApp-info-color → #676767`. It does
**not** remap `--sidebar-navItem-border-color`, `--ptr-website-link-color`, `--archives-*`,
`--reload/search-icon-*`, `--users-badge-*` (those stay navy). Computed values are from the
admin capture `elements[]` (sidebar is at x=-250 because closed).

| Element | Property | Resolved value | Source |
|---|---|---|---|
| `.sidebar-wrapper` | background-color | `rgb(255,255,255)` (#fff) | admin JSON computed; `--lightTheme-sidebar-wrapper-bg-color:#fff` (file-1.html:534) |
| `.sidebar-wrapper` | color | `rgb(103,103,103)` (#676767) | admin JSON computed; `--lightTheme-sidebar-wrapper-color:#676767` (file-1.html:535) |
| `.sidebar-wrapper` | width / height | `250px` / `calc(100vh - 49px)` (=1216px @ vh1265) | admin JSON computed |
| `.sidebar-wrapper` | position / margin-left / z-index | `absolute` / `-250px` / `3` | scoped CSS; admin JSON x=-250 |
| `.navbar` (sidebar) | padding / height | `0` / `49px` | scoped `.navbar` |
| `li.nav-item` (all) | border-bottom | `1px solid rgb(255,255,255)` (#fff, invisible on white) | admin JSON; `--sidebar-navItem-border-color:#fff` |
| `li.nav-item` (all) | font-size | `14px` | scoped `.room-sidebar .navbar-nav li` |
| `li:first-child` (powered-by) | font-weight | `400` | scoped `li:first-child`; admin JSON fw:400 |
| `li.nav-item` (2..n) | font-weight | `700` | scoped `li`; admin JSON fw:700 |
| `a.ptr-website-link` | color | `rgb(69,162,255)` (#45a2ff) | admin JSON; `--ptr-website-link-color:#45a2ff` |
| `a.ptr-website-link` | font-size / font-weight | `14px` / `400` | admin JSON |
| version `<p>` text | content | `Version: v4.0.1-c0fee8f5` | file2.html:53; bound `appService.globals.appVersion` |
| `button` Mobile App Info (`.btn.btn-sm.btn-secondary`) | background-color | `rgb(108,117,125)` (#6c757d, BS5) | admin JSON computed |
| `button` Mobile App Info | color / font-size | `rgb(255,255,255)` / `14px` | admin JSON |
| `a.nav-link.sidebar-item` (Connectivity/Settings/Archives) | color | `rgb(103,103,103)` (#676767, inherited via `color:inherit!important`) | admin JSON; scoped `.sidebar-item{color:inherit!important}` |
| `a.nav-link.sidebar-item` | font-size / font-weight | `14px` / `700` | admin JSON |
| `a.nav-link.sidebar-item` | padding-top/bottom | `8px` / `8px` (BS `.nav-link` .5rem) | admin JSON |
| `a.nav-link.sidebar-item` | height (rect) | `37px` | admin JSON |
| `a.nav-link.sidebar-item.ps-1` (Muted/Followed) | padding-left | `.25rem` (4px) | admin JSON; `.ps-1` |
| `.dropdown-menu.users-dropdown-options` (Archives open) | background-color | `rgb(14,54,81)` (#0e3651) | admin JSON `sidebar:archives-open`; `--archives-dropdown-menu-bg-color` |
| `.dropdown-menu.users-dropdown-options` | color | `rgb(69,162,255)` (#45a2ff) | admin JSON; `--archives-dropdown-menu-color` |
| `.dropdown-menu.users-dropdown-options` | rect (open) | `x2 y332 w246 h103` | admin JSON |
| `a.dropdown-item.small` (Alert/Chat/Transcript) | color / background | `rgb(69,162,255)` / transparent | admin JSON; inherits menu color |
| `a.dropdown-item.small` | rect (each) | `w246 h29` | admin JSON |
| `button.reload-room-users` | background / color | `rgb(244,244,244)` (#f4f4f4) / `rgb(69,162,255)` (#45a2ff) | admin JSON; `--reload-icon-bg/color` |
| `button.search-room-users` | background / color | `rgb(69,162,255)` (#45a2ff) / `rgb(244,244,244)` (#f4f4f4) | admin JSON; `--search-icon-bg/color` |
| `button.reload/search` | width / height | `26px` / `27px` | admin JSON |
| `.user-options .dropdown-menu` | width / top / left / font-size | `228px` / `30px` / `-106px` / `13px` | scoped `.user-options .dropdown-menu` |
| `.push-wrapper` (content, when open) | left / width | `250px` / `calc(100% - 250px)` | scoped `.push-wrapper` |
| `app-room` (theme host) | class | `lightTheme` | admin JSON elements (path `app-room#topRoomDiv`), member JSON |

---

## States & effects

- **Sidebar closed (default):** `.sidebar-wrapper{margin-left:-250px}` — off-screen left; x=-250 in
  every captured state. `.room-sidebar` is `position:absolute` inside `.room-container`.
- **Sidebar open:** hamburger `<span class="sidebar-menu">` (in `.mainAppNav`, click →
  `toggleSideBar()` bundle) sets `showSidebar=true`, which via `ngClass` (`X4e=(t,n)=>({"push-wrapper":t,"mt-0":n})`)
  adds `push-wrapper` to the content wrapper → content shifts to `left:250px; width:calc(100% - 250px)`,
  revealing the sidebar. `toggleSideBar()` also calls `appService.loadRoster()` on open /
  `unloadRoster()` on close. No CSS transition is declared on the wrapper or `.push-wrapper`.
- **`.sidebar-item:hover`** → `background-color:#e9ecef` (light grey), scoped.
- **`.mobile-app-info:hover`** → `opacity:.9` (scoped; note the Mobile App **Info** button in
  the sidebar first-`li` uses `.btn.btn-secondary`, whose BS5 hover is `--bs-btn-hover-bg:#5c636a`).
- **`.mic-gear-btn:hover`** → `color:#fff!important` (scoped; roster-adjacent, not a top-level nav item).
- **Archives dropdown toggle:** `data-bs-toggle="dropdown"` on `#archivesDropdown`; open adds
  Bootstrap `.show` to the menu → `display:block`. Caret `.dropdown-toggle:after` is
  repositioned by scoped rule to `float:right; margin:10px 10px 15px`.
- **User-options (cog) dropdown:** `data-bs-toggle="dropdown"` on `#user-options-btn`; scoped
  rule hides its caret (`.user-options .dropdown-toggle:after{display:none!important}`) and
  positions the menu at `top:30px; left:-106px; width:228px`.
- **`#connectedMsg`** scoped `display:none` (connection overlay hidden by default;
  `mixed-files/connected.html` shows its markup `.notConnectedOverlay.animated.fadeIn`).
- **Mobile (`max-width:768px`):** `.mainNavItem{display:block}` reveals mobile-only clones
  (hidden `display:none` on desktop).
- No keyframe animation applies to the top-level sidebar nav items (the `_click-wave`,
  `blinking`, `breathing` keyframes in the same component belong to themes/rec indicators).

---

## Behavior

All provable from `data-bs-toggle`/`data-bs-target` attrs (member `file2.html`) and click
handlers (bundle `main.d6f5272aa3783e43.js`):

- **ProTradingRoom.com link** → opens `https://protradingroom.com` in a new tab
  (`target="_blank" rel="noopener noreferrer"`).
- **Mobile App Info button** → Bootstrap modal `#mobileAppInfoModal`
  (component `app-mobile-app-info-modal`).
- **Connectivity Check** → modal `#webrtc-troubleshooter-modal` (title `Connectivity Check`).
- **General Settings** → modal `#user-settings-modal` (title `General Settings`).
- **Archives** (`#archivesDropdown`) → toggles the `.users-dropdown-options` dropdown. Its items:
  - **Recording** (presenter/`!hideRecs`) → `launchRecordings()` (bundle `aPe`).
  - **Alert Logs** → modal `#alerts-logs-modal` (`doAlertsLogsModal()`).
  - **Chat Logs** → modal `#chat-logs-modal` (`doChatLogsModal()`).
  - **Transcript History** → `toggleSpeechRecoHistory()` (bundle `cPe`; no modal target).
- **Manage Muted Users** → modal `#mutedUsersModal` (DOM `data-bs-target`) / handler
  `manageMutedUsers()` (bundle). `title="Manage Muted Users"`.
- **Manage Followed Users** → modal `#followedUsersModal` / `manageFollowedUsers()`.
  `title="Manage Followed Users"`.
- **Reopen Alerts / Chat** (conditional) → `reopenAlertsChat()`.
- **Get Random User** (presenter) → `getRandomUser()`.
- **Benzinga News** (conditional) → anchor to `benzingaUrl` (optional alt logo image).
- **Users header row:** `title="Users"`; the cog button (`#user-options-btn`, `data-bs-toggle="dropdown"`)
  opens a menu with **Sort by Trials**; **Reload Users** button (`reload-room-users`),
  **Sort Users** button (`.btn-secondary`, `fa-sort-alpha-down`), **Search Users** button
  (`search-room-users`). Tooltips via `title` attrs.
- Each nav `<a>` carries a `title` attr = its label (native tooltip).

---

## Honest gaps

- **Open-state geometry not captured.** Every capture (admin, member, presenter) has the
  sidebar CLOSED (`.sidebar-wrapper` at x=-250, `margin-left:-250px`). The open layout is
  inferred from CSS (`push-wrapper{left:250px;width:calc(100% - 250px)}`) and the
  `toggleSideBar()`/`ngClass X4e` binding, but no computed rect exists for the sidebar while
  visible, and no transition/animation timing is declared, so I cannot cite a slide duration.
- **Chat/Media tick condition is ambiguous in the minified bundle.** The update block shows
  BOTH `O(15,socketConnected?-1:15)` / `O(16,mediaSoupService.connected?-1:16)` (indices
  15/16, shown when NOT connected — likely "Reconnecting…" states) AND
  `O(18,socketConnected?18:-1)` / `O(19,mediaSoupService.connected?19:-1)` (indices 18/19,
  shown when connected — the `Chat ✓` / `Media ✓` spans in `tPe`/`nPe`). The rendered
  `file2.html` shows both `Chat ✓` and `Media ✓` (connected). I could not fully de-minify
  which template index maps to which `<span>` beyond this pairing.
- **Roster content** (`app-room-roster` / `.room-roster-list`) is empty in the captures
  (`<!---->`); its internal styling is a separate surface, not decoded here.
- **`--sidebar-navItem-border-color` is `#fff` under lightTheme**, making the `li` bottom
  borders invisible against the white wrapper. No evidence shows a visible divider colour in
  lightTheme; if the reference screenshot shows visible dividers, that is an unresolved
  conflict (the token is not remapped by `.lightTheme`).
- **No ADMIN/APP section exists** — confirmed absent by grep; the "ADMIN and APP sections if
  present" in the brief are simply not present in this build.
- The exact `.badge` value inside `.active-room-users` (Users count) was not populated in the
  captured elements (roster unloaded), so `--users-badge-*` colours are cited from tokens/CSS
  but not from a rendered badge rect.
