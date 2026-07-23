# Roster

The **Users** section: the roster header row (Users: label + count badge + cog / reload / sort / search buttons and their dropdowns) rendered by the parent sidebar component, plus the `app-room-roster` component that renders the scrolling list of user rows (`presUser` vs `regUser`), each with avatar, nickName, badges, and the `msgMenu` kebab whose `users-dropdown-options` menu holds User Info / Mention‑Reply / Private Chat.

All evidence is from:
- **BUNDLE** = `docs/reference/live-bundle/main.d6f5272aa3783e43.js` (Angular ivy templates + component‑scoped CSS strings; `[_ngcontent-%COMP%]` = scoped attribute selector).
- **GLOBAL** = `docs/reference/live-bundle/styles.d622cb9ed2bbc221.css` (Bootstrap 4 Darkly + BS5 + toastr + app rules).
- **CAP** = `proroom-all-admin.json` (computed styles + rects + the LIVE `:root`/`body` token map in `cssVariables`, which is authoritative for the running lightTheme room) and its `states{}` for the open dropdowns.
- **BOOT** = `mixed-files/file-1.html` `<style>` (`.lightTheme{}` var remapping).

Two distinct Angular components own this surface:
- **Parent sidebar component** (component id `ng-c1254915701` per CAP attrs) — owns the header `<li>`, the count badge, the cog/reload/sort/search buttons, the search `<input>`, and hosts `<app-room-roster>`.
- **`app-room-roster`** — owns the row list (`presUser`/`regUser`, avatar, nickName, badges, stars, `msgMenu`, `users-dropdown-options`).

---

## DOM structure

### A. Header row + roster host — parent component template `mPe` (BUNDLE @ ~2464490)

Const attr arrays resolved from the parent `consts:[…]` (BUNDLE @ 2528978). Indices in `"i,attr"` map to those arrays.

```html
<!-- consts[31]: [1,"nav-item","d-flex","flex-column","h-100"] -->
<li class="nav-item d-flex flex-column h-100">

  <!-- consts[57]: [1,"nav-link","active-room-users","d-flex","align-items-center","justify-content-between","pt-0"] -->
  <a class="nav-link active-room-users d-flex align-items-center justify-content-between pt-0">

    <!-- consts[58]: ["title","Users"]  -> the "Users: <count>" label group -->
    <div title="Users">
      <i class="fas fa-user"></i>               <!-- consts[56] -->
      <span class="pl-2">Users: </span>          <!-- consts[22] = [1,"pl-2"] -->
      <!-- hPe, shown only if rosterCountVisibleToViewers || isPresenter -->
      <span class="badge badge-primary d-inline-block ml-1"> {{rosterCount + simUserCount}} </span>  <!-- consts[59] -->
    </div>

    <!-- consts[60]: [1,"flex-fill","users-btns"] -->
    <div class="flex-fill users-btns">

      <!-- cog (Users Options) dropdown; consts[61]=["title","Users Options",1,"dropdown","user-options"] -->
      <div title="Users Options" class="dropdown user-options">
        <!-- consts[62]: ["id","user-options-btn","data-bs-toggle","dropdown","aria-expanded","false",1,"btn","btn-sm","btn-dark","ml-1","float-right","border-0","dropdown-toggle"] -->
        <button id="user-options-btn" data-bs-toggle="dropdown" aria-expanded="false"
                class="btn btn-sm btn-dark ml-1 float-right border-0 dropdown-toggle">
          <i class="fas fa fa-cog"></i>          <!-- consts[63] -->
        </button>
        <!-- consts[64]: ["aria-labelledby","user-options-btn",1,"dropdown-menu"] -->
        <ul aria-labelledby="user-options-btn" class="dropdown-menu">
          <!-- consts[65]: [1,"dropdown-item","d-flex","align-items-center","justify-content-between",3,"click"] (click)=sortFTUsers() -->
          <li class="dropdown-item d-flex align-items-center justify-content-between">
            <span>Sort by Trials</span>
            <!-- pPe: <i class="fas fa-check-circle"></i> (consts[66]) shown only if isSortFTUsers -->
          </li>
        </ul>
      </div>

      <!-- reload; consts[67]=["title","Reload Users",1,"btn","btn-sm","btn-default","ml-1","float-right","reload-room-users","border-0",3,"click"] (click)=reloadUsers() -->
      <button title="Reload Users" class="btn btn-sm btn-default ml-1 float-right reload-room-users border-0">
        <i class="fas fa fa-sync"></i>            <!-- consts[68] -->
      </button>

      <!-- sort; consts[69]=["title","Sort Users",1,"btn","btn-sm","btn-secondary","float-right","border-0","ms-1",3,"click","ngClass"] (click)=sortUsers(); [ngClass]=WB(isSortUsers) -->
      <button title="Sort Users" class="btn btn-sm btn-secondary float-right border-0 ms-1">
        <i class="fas fa-sort-alpha-down"></i>    <!-- consts[70] -->
      </button>

      <!-- search toggle; consts[71]=["title","Search Users",1,"btn","btn-sm","btn-default","float-right","search-room-users","border-0",3,"click"] (click)=toggleUserSearch() -->
      <button title="Search Users" class="btn btn-sm btn-default float-right search-room-users border-0">
        <i class="fas fa fa-search"></i>          <!-- consts[72] -->
      </button>
    </div>
  </a>

  <!-- fPe (input), rendered only when showUserSearch; consts[76]=["type","search","id","userSearchTermInput","placeholder","Search by nick or email,enter to search","aria-label","Search","aria-describedby","addon-search",1,"form-control",3,"ngModelChange","search","keyup","ngModel"] -->
  <input type="search" id="userSearchTermInput"
         placeholder="Search by nick or email,enter to search"
         aria-label="Search" aria-describedby="addon-search"
         class="form-control" [(ngModel)]="userSearchTermTxt"
         (search)="searchUsers()" (keyup)="doUserSearch($event)">

  <!-- consts[74]: [1,"flex-grow-1"] -->
  <div class="flex-grow-1">
    <!-- consts[75]: [3,"roster","parent"] -->
    <app-room-roster [roster]="visibleRoster" [parent]="…"></app-room-roster>
  </div>
</li>
```

Whole header `<li>` (index 44, `mPe`) is rendered only if `onlyPresentersVisibleToViewers || rosterVisibleToViewers || isPresenter || user.hasAdminChat` (BUNDLE `gPe` update block). Count badge (`hPe`, index 6) requires `rosterCountVisibleToViewers || isPresenter`. Cog "Sort by Trials" checkmark (index 15) requires `isSortFTUsers`. Search input (index 22) requires `showUserSearch`.

### B. `app-room-roster` component (BUNDLE, selector `["app-room-roster"]` @ 2035433; `decls:6,vars:7`)

Root template:
```html
<!-- consts[0]: [1,"room-roster-list"] -->
<div class="room-roster-list">
  <!-- @for over roster (virtual scroll), F2e template, tracked by userXrefID (c2e) -->
  <!-- consts[1]: [1,"room-roster-container"] -->
  <div class="room-roster-container"> … F2e/y2e … </div>
  <!-- pipes: sortUsers, sortFTUsers applied to (roster, isSortUsers, isSortFTUsers) -->
</div>
```

Per-user row (`y2e` → `b2e`, `decls 21`). `ngClass` selects `regUser` vs `presUser` via `d2e=(t,n)=>({regUser:t,presUser:n})` with args `(!e.isP, e.isP||e.hasAdminChat)` — i.e. **regUser** when the user is not a presenter, **presUser** when `isP` or `hasAdminChat`:

```html
<!-- consts[2]: [3,"ngClass"]  -> class becomes "regUser" or "presUser" -->
<div [ngClass]="{regUser:!isP, presUser:isP||hasAdminChat}">

  <!-- b2e (full row, shown unless showOnlyUsernames && !isP; else v2e username-only variant) -->
  <!-- consts[3]: [1,"media"] -->
  <div class="media">

    <!-- u2e avatar, shown when showUserAvatar(isP); consts[19]: [1,"rosterImg","mr-3",3,"click","src","alt"] -->
    <img class="rosterImg mr-3" (click)="doUserInfo(userXrefID,_id,socketID,serverID)"
         [src]="pic || 'https://secure.gravatar.com/avatar/'+emailHash+'?d=mm&s=50'" [alt]="nick">

    <!-- consts[5]: [1,"media-body"] -->
    <div class="media-body">
      <!-- consts[6]: [1,"mt-0","mb-0","nickName","d-inline"] -->
      <div class="mt-0 mb-0 nickName d-inline">

        <!-- consts[7]: [3,"click","dblclick"] -->
        <span (click)="doMention(nick)"
              (dblclick)="doUserInfo(userXrefID,_id,socketID,serverID)">{{nick}}</span>

        <!-- h2e badges (if data.badges); consts[8]: [1,"d-inline-block","align-baseline","mr-1",3,"innerHTML"] -->
        <div class="d-inline-block align-baseline mr-1" [innerHTML]="parseBadges(data.badges)"></div>

        <!-- p2e trial badge (if isPresenter && isFT); consts[9]: [1,"badge","bg-danger","trial-badge"] -->
        <span class="badge bg-danger trial-badge">Trial</span>

        <!-- f2e new badge (if isNewIndicatorOn && isPresenter && isNew); consts[10]: [1,"badge","bg-warning","new-badge"] -->
        <span class="badge bg-warning new-badge">New</span>

        <!-- m2e stars (if !disableStarYears && !isP && data.years); consts[11]: [1,"stars-container"] -->
        <span class="stars-container">
          <i class="fas fa-star stars-icon"></i>   <!-- consts[20] -->
          <span class="stars-num">{{data.years}}</span>   <!-- consts[21] -->
        </span>

        <!-- kebab trigger; consts[12]: ["role","button","id","dropdownMenuLink","data-bs-toggle","dropdown","aria-haspopup","true","aria-expanded","false",1,"msgMenu","dropright","d-inline-block","float-right"] -->
        <a role="button" id="dropdownMenuLink" data-bs-toggle="dropdown"
           aria-haspopup="true" aria-expanded="false"
           class="msgMenu dropright d-inline-block float-right">⠇ </a>   <!-- U+2807 ⠇ then space -->

        <!-- consts[13]: ["aria-labelledby","dropdownMenuLink",1,"dropdown-menu","users-dropdown-options"] -->
        <div aria-labelledby="dropdownMenuLink" class="dropdown-menu users-dropdown-options">
          <!-- consts[14]: [1,"dropdown-item",3,"click"] -->
          <a class="dropdown-item" (click)="doUserInfo(userXrefID,_id,socketID,serverID)">
            <i class="fas fa-user"></i>&nbsp;&nbsp;User Info</a>       <!-- consts[15] icon -->
          <a class="dropdown-item" (click)="doMention(nick)">
            <i class="fas fa-reply"></i>&nbsp;&nbsp;Mention / Reply</a> <!-- consts[16] icon -->
          <!-- g2e Private Chat, shown if canPM || (('a'===perms||hasAdminChat) && userToPresenterPM); consts[17]: [1,"dropdown-item"] -->
          <a class="dropdown-item" (click)="startPC(user)">
            <i class="fas fa-comments"></i>&nbsp;&nbsp;Private Chat </a> <!-- consts[22] icon -->
        </div>
      </div>

      <!-- _2e location line, shown if isPresenter && privData; consts[18]: [1,"userLocation"] -->
      <p class="userLocation"> {{privData.locStr}} </p>
    </div>
  </div>
</div>
```

**Username‑only variant** `v2e` (rendered instead of `b2e` when `showOnlyUsernames && !isP`):
```html
<div class="media">
  <i class="fas fa-user m-1"></i>                <!-- consts[23]: [1,"fas","fa-user","m-1"] -->
  <span (click)="doMention(nick)" (dblclick)="doUserInfo(…)">{{nick}}</span>  <!-- consts[7] -->
</div>
```

**Row visibility gate** (`F2e`): a row renders only if `((onlyPresentersVisibleToViewers && (isP||hasAdminChat)) || rosterVisibleToViewers || isPresenter || (user.hasAdminChat && (isP||hasAdminChat||user.userXrefID===userXrefID)))`.

### Role variants
- **member vs presenter (viewer's own role)**: whether the header `<li>` and the roster rows render at all is gated by `isPresenter` / `rosterVisibleToViewers` / `hasAdminChat` (above). The cog "Sort by Trials", the Trial/New badges, the stars, and the `userLocation` line are all **presenter‑only** (require `isPresenter`).
- **presUser vs regUser (the listed user's role)**: `presUser` class when the listed user `isP || hasAdminChat`; otherwise `regUser`. Only class + background differ (see Scoped CSS). `Private Chat` item visibility depends on the viewer's `canPM` / the listed user's `perms`.

### ⚠ Build discrepancy on the kebab class
BUNDLE consts[12] gives the `msgMenu` trigger class `"msgMenu dropright d-inline-block float-right"`. The CAP live DOM (`proroom-all-admin.json`, node `a#dropdownMenuLink`) has `class="msgMenu dropright pt-1"`. The BUNDLE is the current build and wins per precedence, but the captured room was a slightly older build using `pt-1` instead of `d-inline-block float-right`. Flagged as an honest gap.

---

## Scoped CSS (verbatim)

### `app-room-roster` component styles (BUNDLE `styles:[…]` @ 2036030)
```css
.rosterImg[_ngcontent-%COMP%]{width:45px;height:45px;object-fit:cover;border-radius:var(--rosterImg-border-radius)}
.presUser[_ngcontent-%COMP%], .regUser[_ngcontent-%COMP%]{font-size:14px}
.presUser[_ngcontent-%COMP%]:hover, .regUser[_ngcontent-%COMP%]:hover{cursor:pointer;transition:all .2s}
.nickName[_ngcontent-%COMP%]{font-weight:bolder;font-size:16px;color:var(--nickname-color);position:relative}
.nickName[_ngcontent-%COMP%]   .dropdown-menu[_ngcontent-%COMP%]{position:absolute;left:-12px}
.presUser[_ngcontent-%COMP%]{background-color:var(--roster-bg-adm)!important;border-bottom:1px solid var(--dark-gray)!important}
.regUser[_ngcontent-%COMP%]{background-color:var(--roster-bg);border-bottom:1px solid var(--dark-gray)}
.userLocation[_ngcontent-%COMP%]{font-weight:200;font-size:12px;margin-bottom:0;color:var(--user-location-color)}
.msgMenu[_ngcontent-%COMP%]{padding-left:5px;font-size:20px;font-weight:600;color:var(--username-color)!important}
.msgMenu[_ngcontent-%COMP%]:hover{color:var(--light-brown)!important;font-weight:900;cursor:pointer}
.room-roster-list[_ngcontent-%COMP%]{width:100%;height:100%;overflow-y:inherit!important}
.chat-stars[_ngcontent-%COMP%]{font-size:8px;vertical-align:text-top!important}
span.chat-stars[_ngcontent-%COMP%]{margin-top:2px;margin-left:2px;display:inline-block}
span.chat-stars[_ngcontent-%COMP%]{color:var(--app-primary-color)}
.stars-container[_ngcontent-%COMP%]{position:relative}
.stars-container[_ngcontent-%COMP%]   .stars-icon[_ngcontent-%COMP%]{color:var(--msg-color)}
.stars-num[_ngcontent-%COMP%]{position:absolute;color:var(--msgs-bg);left:6px;top:4px;font-size:10px;font-weight:700}
.room-roster-container[_ngcontent-%COMP%]{display:block;width:100%;min-height:42px}
virtual-scroller[_ngcontent-%COMP%]{width:100%;height:100vh}
```

### Parent sidebar component styles (BUNDLE `styles:[…]` @ 2544264) — only header‑relevant rules
```css
.active-room-users[_ngcontent-%COMP%]   .badge[_ngcontent-%COMP%]{background-color:var(--users-badge-bg-color);color:var(--users-badge-color)}
.users-btns[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]{padding:3px 6px}
.user-options[_ngcontent-%COMP%]   .dropdown-menu[_ngcontent-%COMP%]{position:absolute!important;z-index:1000!important;top:30px!important;left:-106px!important;width:228px;font-size:13px;padding:2px}
.user-options[_ngcontent-%COMP%]   .dropdown-toggle[_ngcontent-%COMP%]:after{display:none!important}
.reload-room-users[_ngcontent-%COMP%]{background-color:var(--reload-icon-bg-color);color:var(--reload-icon-color)}
.search-room-users[_ngcontent-%COMP%]{background-color:var(--search-icon-bg-color);color:var(--search-icon-color)}
.sidebar-item[_ngcontent-%COMP%]{color:inherit!important}
.sidebar-item[_ngcontent-%COMP%]:hover{background-color:#e9ecef}
```

---

## Global CSS (verbatim)

Rules that actually win on this surface (GLOBAL = `styles.d622cb9ed2bbc221.css`):

```css
/* users-dropdown-options (kebab menu + cog Archives menu) — beats Darkly .dropdown-menu */
.users-dropdown-options{background-color:var(--archives-dropdown-menu-bg-color)!important;color:var(--archives-dropdown-menu-color)!important;border:none}
.users-dropdown-options a{margin:0!important}
.users-dropdown-options a:hover{cursor:pointer}

/* Darkly dropdown base (applies to the cog .dropdown-menu, which is NOT users-dropdown-options) */
.dropdown-menu{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:10rem;padding:.5rem 0;margin:.125rem 0 0;font-size:.9375rem;color:#fff;text-align:left;list-style:none;background-color:#222;background-clip:padding-box;border:1px solid …}
.dropdown-item{display:block;width:100%;padding:.25rem 1.5rem;clear:both;font-weight:400;color:#fff;text-align:inherit;white-space:nowrap;background-color:transparent;border:0}
.dropdown-item:hover,.dropdown-item:focus{color:#fff;text-decoration:none;background-color:#375a7f}
.dropdown-item.active,.dropdown-item:active{color:#fff;text-decoration:none;background-color:#375a7f}
.dropdown-item.disabled,.dropdown-item:disabled{color:#999;pointer-events:none;background-color:transparent}

/* count badge base + Darkly primary variant (overridden by scoped .active-room-users .badge) */
.badge{display:inline-block;padding:.25em .4em;font-size:75%;font-weight:700;line-height:1;text-align:center;white-space:nowrap;vertical-align:baseline;border-radius:.25rem;transition:color .15s ease-in-out,…}
.badge-primary{color:#fff;background-color:#375a7f}
a.badge-primary:hover,a.badge-primary:focus{color:#fff;background-color:#28415b}

/* row badges */
.new-badge,.trial-badge{font-size:11px;padding:3px 5px;margin:0 2px}
.user-badge{font-size:11px}
.user-badge-img{width:auto;height:100%;max-height:20px}
.user-badge:hover,.new-badge:hover,.trial-badge:hover{transform:scale(1.1)}
.user-badge-img:hover{transform:scale(1.2)}
.bg-danger{background-color:#e74c3c!important}   /* trial-badge */
.bg-warning{background-color:#f39c12!important}  /* new-badge */

/* media layout */
.media{display:flex;align-items:flex-start}
.media-body{flex:1}

/* buttons — Darkly has NO .btn-default, so reload/search buttons get only .btn base + the scoped bg */
.btn{display:inline-block;font-weight:400;color:#fff;text-align:center;vertical-align:middle;user-select:none;background-color:transparent;border:1px solid transparent;padding:.375rem …}
.btn-sm,.btn-group-sm>.btn{padding:.25rem .5rem;font-size:.8203125rem;line-height:1.5;border-radius:.2rem}
.btn-dark{color:#222;background-color:#adb5bd;border-color:#adb5bd}      /* cog button */
.btn-secondary{color:#fff;background-color:#444;border-color:#444}        /* sort button */

/* utilities used */
.dropup,.dropright,.dropdown,.dropleft{position:relative}
.float-right{float:right!important}
.d-inline{display:inline!important}
.d-inline-block{display:inline-block!important}
.mr-3,.mx-3{margin-right:1rem!important}
.mr-1,.mx-1{margin-right:.25rem!important}
.ml-1,.mx-1{margin-left:.25rem!important}
.ms-1{margin-left:.25rem!important}
.pl-2,.px-2{padding-left:.5rem!important}
.pt-0,.py-0{padding-top:0!important}
```

Note: `.users-btns .btn{padding:3px 6px}` (scoped) overrides `.btn-sm` padding for the four header buttons.

---

## Resolved values

LIVE room tokens from CAP `cssVariables.root` (running lightTheme). Where BOOT `.lightTheme{}` remaps a token to `var(--lightTheme-*)`, the CAP root value already reflects the resolved result — both agree, cited below.

| Element | Property | Resolved value | Source / var chain |
|---|---|---|---|
| `.rosterImg` | width / height | `45px` / `45px` | BUNDLE scoped |
| `.rosterImg` | border-radius | `50%` | `--rosterImg-border-radius:50%` (CAP root) |
| `.rosterImg` | object-fit | `cover` | BUNDLE scoped |
| `.presUser`/`.regUser` | font-size | `14px` | BUNDLE scoped |
| `.presUser` | background-color | `#e1e1e1` | `--roster-bg-adm` → `--lightTheme-roster-bg-adm:#e1e1e1` (CAP root; `!important`) |
| `.regUser` | background-color | `#f1f1f1` | `--roster-bg` → `--lightTheme-roster-bg:#f1f1f1` (CAP root) |
| `.presUser`/`.regUser` | border-bottom | `1px solid #aaa` | `--dark-gray:#aaa` (CAP root; presUser `!important`) |
| `.nickName` | color | `#0a6db1` | `--nickname-color:#0a6db1` (CAP root) — **not** remapped by `.lightTheme` |
| `.nickName` | font-weight / font-size | `bolder` / `16px` | BUNDLE scoped |
| `.nickName .dropdown-menu` | position / left | `absolute` / `-12px` | BUNDLE scoped |
| `.userLocation` | color | `#676767` | `--user-location-color` → `--lightTheme-user-location-color:#676767` (CAP root) |
| `.userLocation` | font-weight / font-size / margin-bottom | `200` / `12px` / `0` | BUNDLE scoped |
| `.msgMenu` | color | `#0a6db1` (rgb(10,109,177)) | `--username-color` → `--lightTheme-username-color:#0a6db1` (CAP root); **CAP computed node `a#dropdownMenuLink` = rgb(10,109,177)** ✓ |
| `.msgMenu` | padding-left / font-size / font-weight | `5px` / `20px` / `600` | BUNDLE scoped |
| `.msgMenu` glyph | content | `⠇` (U+2807) + space | BUNDLE template `_(11,"⠇ ")` |
| `.stars-icon` | color | `#676767` | `.stars-container .stars-icon{color:var(--msg-color)}` → `--lightTheme-msg-color:#676767` |
| `.stars-num` | color | `#fff` | `--msgs-bg` → `--lightTheme-msgs-bg:#fff`; left `6px` top `4px` font-size `10px` weight `700` |
| `.room-roster-list` | width/height/overflow-y | `100%`/`100%`/`inherit !important` | BUNDLE scoped |
| `.room-roster-container` | display/width/min-height | `block`/`100%`/`42px` | BUNDLE scoped |
| `virtual-scroller` | width / height | `100%` / `100vh` | BUNDLE scoped |
| **Header** `.active-room-users` | color | `#676767` (rgb(103,103,103)) | inherits `--lightTheme-sidebar-wrapper-color`; **CAP computed = rgb(103,103,103)** ✓; rect **236×35** |
| `.active-room-users .badge` (count) | background / color | `#0e3651` / `#f4f4f4` | `--users-badge-bg-color:#0e3651`, `--users-badge-color:#f4f4f4` (CAP root; beats `.badge-primary`) |
| `#user-options-btn` (cog) | color | `#212529` text on `#adb5bd` bg | `.btn-dark`; **CAP computed color rgb(255,255,255)** on the `<i>`? see note; rect **26×27** |
| cog `.dropdown-toggle:after` | display | `none` | scoped `.user-options .dropdown-toggle:after` |
| `.reload-room-users` (reload) | background / color | `#f4f4f4` / `#45a2ff` | `--reload-icon-bg-color:#f4f4f4`, `--reload-icon-color:#45a2ff`; **CAP computed color rgb(69,162,255)** ✓; rect **26×27** |
| `.search-room-users` (search) | background / color | `#45a2ff` / `#f4f4f4` | `--search-icon-bg-color:#45a2ff`, `--search-icon-color:#f4f4f4`; **CAP computed color rgb(244,244,244)** ✓; rect **26×27** |
| sort button (`.btn-secondary`) | background / color | `#444` / `#fff` | `.btn-secondary`; **CAP computed color rgb(255,255,255)** ✓; rect **24×27** |
| header buttons | padding | `3px 6px` | scoped `.users-btns .btn` (overrides `.btn-sm`) |
| `#userSearchTermInput` | class | Bootstrap `.form-control` defaults | GLOBAL (not separately captured; see gaps) |
| `.users-dropdown-options` (kebab menu) | background / color | `#0e3651` / `#45a2ff` | `--archives-dropdown-menu-bg-color:#0e3651`, `--archives-dropdown-menu-color:#45a2ff` (`!important`); **CAP state `kebab:open` items = rgb(69,162,255)** ✓ |
| cog `.dropdown-menu` (NOT users-dropdown-options) | background / color | `#222` / `#fff` per Darkly; item text `#212529` | GLOBAL `.dropdown-menu`; **CAP state `roster-cog-open` "Sort by Trials" = rgb(33,37,41)** |
| cog menu box | position/top/left/width/font-size/padding | `absolute`/`30px`/`-106px`/`228px`/`13px`/`2px` | scoped `.user-options .dropdown-menu` |
| `.trial-badge` (Trial) | bg / font-size / padding | `#e74c3c` / `11px` / `3px 5px` | `.bg-danger` + `.trial-badge` |
| `.new-badge` (New) | bg / font-size / padding | `#f39c12` / `11px` / `3px 5px` | `.bg-warning` + `.new-badge` |
| `.user-badge` (custom badges) | font-size | `11px` | GLOBAL; inline `background-color`/`color` from `parseBadges()` per‑badge data |

---

## States & effects

- **`.presUser:hover`, `.regUser:hover`** → `cursor:pointer; transition:all .2s` (BUNDLE scoped). Hover cue is cursor only; no color change on the row itself.
- **`.msgMenu:hover`** → `color:var(--light-brown)` = **#8c8686** (`!important`), `font-weight:900`, `cursor:pointer` (BUNDLE scoped). Default state `#0a6db1`.
- **`.dropdown-item:hover / :focus`** (cog menu, Darkly) → `color:#fff; background-color:#375a7f` (GLOBAL).
- **`.users-dropdown-options a:hover`** → `cursor:pointer` only (GLOBAL). The kebab menu items keep `#45a2ff` text; note the Darkly `.dropdown-item:hover{background:#375a7f}` still applies as a background since `.users-dropdown-options` only forces the container bg/color, not the items' hover bg.
- **`.trial-badge:hover / .new-badge:hover / .user-badge:hover`** → `transform:scale(1.1)`; **`.user-badge-img:hover`** → `scale(1.2)` (GLOBAL).
- **`.sidebar-item:hover`** → `background-color:#e9ecef` (scoped) — applies to the cog Archives dropdown items in the wider sidebar, not to these four header buttons.
- **Sort‑active state**: sort button gets `[ngClass]=WB(isSortUsers)` (an active class toggled by `sortUsers()`); the cog "Sort by Trials" row shows a trailing `fas fa-check-circle` when `isSortFTUsers` is true. The roster list re‑orders via the `sortUsers`/`sortFTUsers` pipes bound to `isSortUsers`/`isSortFTUsers`, which the component subscribes to on the `guiEventBus` (`sortUsers`, `sortFTUsers` events) in `ngOnInit`.
- **Hidden‑until conditions** (all from BUNDLE update blocks): avatar `img` only if `showUserAvatar(isP)` (= `!hideAvatars || isP`); badges only if `data.badges`; **Trial** only if `isPresenter && isFT`; **New** only if `isNewIndicatorOn && isPresenter && isNew`; **stars** only if `!disableStarYears && !isP && data.years`; **Private Chat** item only if `canPM || (('a'===perms||hasAdminChat) && userToPresenterPM)`; **userLocation** only if `isPresenter && privData`; search `<input>` only if `showUserSearch`; count badge only if `rosterCountVisibleToViewers || isPresenter`.
- No CSS keyframe animations are attached to roster elements (the only transitions are `all .2s` on row hover and `.15s` on `.badge` color).

---

## Behavior

Provable from BUNDLE templates/handlers and const attrs:

- **Avatar `img` click** → `doUserInfo(userXrefID,_id,socketID,serverID)` → `appService.getUserInfo(...)` then emits `guiEventBus "doUserInfo"`.
- **nickName `<span>` click** → `doMention(nick)`: emits `guiEventBus` `"doMentionExtra"` if `extraChatColumn && chatInputFocus==='textAreaTxtExtra'`, else `"doMention"`. **dblclick** → `doUserInfo(...)`.
- **Kebab `<a#dropdownMenuLink>`** → `data-bs-toggle="dropdown"` opens the sibling `.dropdown-menu.users-dropdown-options`.
  - **User Info** item → `doUserInfo(...)`.
  - **Mention / Reply** item → `doMention(nick)`.
  - **Private Chat** item → `startPC(user)`: if target `userXrefID !== own` and PM allowed, emits `guiEventBus "startPrivChat" {uid,isInit:true,user}`; clicking yourself → `bootbox.alert("Chatting with yourself again???")`.
- **Header cog `<button#user-options-btn>`** → `data-bs-toggle="dropdown"` opens the cog `.dropdown-menu`; its **Sort by Trials** row → `sortFTUsers()`.
- **Reload button** → `reloadUsers()`. **Sort button** → `sortUsers()`. **Search button** → `toggleUserSearch()` (toggles `showUserSearch`, mounting the input).
- **Search input** → `[(ngModel)]="userSearchTermTxt"`; `(search)="searchUsers()"` (fires on the native search clear/enter); `(keyup)="doUserSearch($event)"`. Placeholder `"Search by nick or email,enter to search"`.
- **Tooltips (native `title`)**: `active-room-users` label div `title="Users"`; cog wrapper `title="Users Options"`; reload `title="Reload Users"`; sort `title="Sort Users"`; search `title="Search Users"`.
- **badges HTML** is produced by `parseBadges(data.badges)` and injected via `[innerHTML]` (sanitizer bypassed with the `noSanitize` pipe). Each badge is either `<img class="user-badge-img" src=…>` or `<span class="badge px-1 mx-1 user-badge" style="background-color:{bkcolor}; color:{color}">{text}</span>`; a per‑badge `darkTheme` variant is swapped in when `preferences.theme==='darkTheme'`. Badges only render if `enableBadges && (!showBadgesToPresentersOnly || isPresenter)`.

---

## Honest gaps

1. **`msgMenu` trigger class differs by build.** BUNDLE consts[12] = `msgMenu dropright d-inline-block float-right`; CAP live node = `msgMenu dropright pt-1`. BUNDLE (current build) is authoritative, but the exact captured room used `pt-1`. Cannot reconcile which is deployed *right now* without a fresh capture.
2. **No captured roster row nodes.** `presUser`/`regUser`/`nickName`/`rosterImg`/`stars`/badge nodes are not present as discrete captured elements in any of the three JSONs (only the header `<li>` controls and the `a#dropdownMenuLink` kebab anchors were captured; the virtual‑scroller rows were not flattened into `elements[]`). Row background/border/font resolved values come from BUNDLE scoped CSS × CAP `:root` tokens, not from a per‑row computed style. Only the `msgMenu` color (rgb(10,109,177)) is a captured per‑node computed value.
3. **Search input styling not separately captured.** `#userSearchTermInput` computed styles are absent; it inherits Bootstrap `.form-control` defaults only.
4. **Cog button `<i>` vs `<button>` color.** CAP shows the cog button node color rgb(255,255,255) while Darkly `.btn-dark` specifies text `#212529` on bg `#adb5bd`; the captured node's `color` likely reflects an inherited/child value. The exact rendered icon color of the cog is not cleanly isolated in the capture (bg `#adb5bd` from `.btn-dark` is the reliable value).
5. **Exact background colors of the four header buttons** (cog/reload/sort/search) come from token/rule resolution, not a captured `backgroundColor` (CAP `style` objects for those nodes carried only `color`). Cross‑checked via two rule sources (scoped CSS + token map), but no direct computed `backgroundColor` sample exists.
6. **Custom `user-badge` colors** are data‑driven (`bkcolor`/`color` per badge from `sessData.badgesH`); no badge instances were present in the evidence, so concrete badge colors/text are unknown.
