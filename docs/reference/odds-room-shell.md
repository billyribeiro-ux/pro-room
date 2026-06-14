# Room Shell — extracted from `odds-and-ends.html` (Angular 17 `app-room`)

Source: `files/odds-and-ends.html`, lines ~18481–19133 (shell/nav/roster) and
~9134–13145 (the main `as-split` body). Angular cruft (`_nghost*`, `_ngcontent*`,
`ng-star-inserted`, `ng-reflect-*`, empty `<!---->`) stripped. The roster and chat/
alert lists render empty in this snapshot (no users / no messages present), so row
shapes below are reconstructed from class names + scoped CSS.

---

## 1. Top-level room shell skeleton

```html
<app-root>
  <router-outlet></router-outlet>
  <app-room id="topRoomDiv" class="lightTheme">     <!-- theme class swaps light/dark -->
    <div class="wrapper">
      <!-- column-reverse on mobile (sidebar BELOW content), row on >=sm -->
      <div class="d-flex flex-column-reverse flex-sm-row room-container">

        <!-- (A) OFF-CANVAS LEFT SIDEBAR -->
        <div class="room-sidebar">
          <div class="sidebar-wrapper">
            <nav class="navbar w-100 h-100">
              <ul class="navbar-nav small w-100 h-100"> ... see §3 sidebar ... </ul>
            </nav>
          </div>
        </div>

        <!-- (B) FIXED TOP NAV (overlays via position:fixed) -->
        <nav class="navbar navbar-expand-md navbar-dark fixed-top mainAppNav"> ... §2 ... </nav>

        <!-- (C) MAIN AREA — horizontal resizable split (angular-split) -->
        <as-split id="mainAreaSplit" class="as-horizontal as-percent" dir="ltr" minsize="0">

          <!-- LEFT PANE: alerts + chat, itself a VERTICAL split -->
          <as-split-area class="alert-chat-box alert-chat-regular as-split-area"
                         style="flex: 0 0 calc(33.5% - …)">
            <as-split class="as-vertical as-percent" dir="ltr" minsize="0">
              <as-split-area class="alert-box as-split-area"  style="flex: 0 0 calc(45.17% …)">
                <app-alerts> …alert header + roomscroller list… </app-alerts>
              </as-split-area>
              <as-split-area class="chat-box as-split-area" style="flex: 0 0 calc(54.83% …)">
                <app-chat> …chat tabs (Main Chat / Off Topic) + scroller + textarea… </app-chat>
              </as-split-area>
              <div role="separator" class="as-split-gutter" aria-orientation="horizontal">
                <div class="as-split-gutter-icon"></div>
              </div>
            </as-split>
          </as-split-area>

          <!-- vertical gutter between left pane and presentation -->
          <div role="separator" class="as-split-gutter" aria-orientation="vertical"
               aria-valuenow="45.17" aria-valuetext="45 percent"
               style="flex-basis:11px; order:1">
            <div class="as-split-gutter-icon"></div>
          </div>

          <!-- RIGHT PANE: presentation / webcams / screen -->
          <as-split-area class="presentation-box as-split-area"
                         style="flex: 0 0 calc(66.49% …)">
            <app-webcam-holder>
              <div class="webcam-wrapper d-flex justify-content-center flex-wrap align-items-end w-100">
                <app-presenter-cams> …card.webcamsHolder… </app-presenter-cams>
              </div>
            </app-webcam-holder>
            <app-presentationarea> …screen share / slides… </app-presentationarea>
          </as-split-area>
        </as-split>
      </div>
    </div>
  </app-room>
</app-root>
```

### Layout / sizing facts (from scoped CSS ~14442–14454)

- `#mainAreaSplit { height: calc(100vh - 49px); width: 100vw; }` — full-viewport
  split minus the fixed top nav.
- `.box-left, .box-right { height: calc(100vh - 60px); }`
- `.brand-logo { max-width:200px; max-height:40px; }`
- `.room-sidebar .navbar-nav { overflow: hidden auto; }` — sidebar scrolls
  internally.
- The whole layout is **flex**, not grid: outer `room-container` is a flex row
  (`flex-column-reverse` on mobile → sidebar stacks under content), and the main
  area is `angular-split` (`as-split`) panes sized by `flex: 0 0 calc(% - gutterPx)`.

**Hierarchy summary:** sidebar (A) and top nav (B) are siblings of the main split (C)
inside one flex `room-container`. The split is 2-level: outer horizontal = [alerts+chat | gutter | presentation];
inner vertical inside the left pane = [alerts / gutter / chat].

---

## 2. Top nav (`.mainAppNav`, `position: fixed`)

```html
<nav class="navbar navbar-expand-md navbar-dark fixed-top mainAppNav">
  <span class="sidebar-menu" title="Open Sidebar"><i class="fas fa-bars"></i></span>   <!-- hamburger -->
  <span class="users ml-1 mr-1 d-flex align-items-center" title="Users Connected">
    <i class="fas fa-user"></i> <!-- connected-user count -->
  </span>
  <span class="fas fa-mobile mr-1 mobile-info-app-btn"
        data-bs-toggle="modal" data-bs-target="#mobileAppInfoModal" title="Launch in Mobile App"></span>
  <a class="navbar-brand ml-1 mr-auto">
    <img id="cssLogo" class="brand-logo" alt="App Logo" src="…/uploads/…"> <!-- room/brand logo -->
  </a>
  <button class="navbar-toggler btnNavToggler" data-bs-target="#navbarsRoom"
          aria-controls="navbarsRoom" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <div id="navbarsRoom" class="collapse navbar-collapse">
    <ul class="navbar-nav align-items-center ml-auto">
      <li class="nav-item talkingIndicator animated fadeIn">
        <a>( No one is speaking )</a>                     <!-- live speaker indicator -->
      </li>
      <li class="nav-item dropdown dropstart">            <!-- volume/speaker control -->
        <a id="dropdownVolume" class="nav-link d-flex align-items-center" data-bs-toggle="dropdown">
          <i class="fas fa-2x fa-volume-up"></i><span class="ml-2 mainNavItem">Volume</span>
        </a>
        <div class="dropdown-menu volumeControl">
          <h4>Volume <span class="float-right mr-2"><i class="fas fa-times"></i></span></h4>
          <input type="range" min="0" max="100" class="volCtrl" title="Volume">
          <button class="btn btn-primary btn-sm">Mute</button>
          <hr><div class="dropdown-divider"></div>
          <div class="room-sound-options">
            <!-- checkbox toggles, each: input.form-check-input + label.form-check-label -->
            Alert sound · QA sound · NTA sound · Chat sound · Subtitles · Don't Disturb
          </div>
        </div>
      </li>
      <li class="nav-item" title="Reload">
        <a class="nav-link d-flex align-items-center">
          <i class="fas fa-2x fa-sync"></i><span class="ml-2 mainNavItem">Reload</span>
        </a>
      </li>
    </ul>
  </div>
</nav>
```

Left cluster: hamburger, connected-users count, mobile-app link, brand logo.
Right cluster (collapsible): "( No one is speaking )" talking indicator, Volume
dropdown (range + Mute + per-sound DND toggles), Reload.

---

## 3. Off-canvas sidebar (`.room-sidebar` `<ul class="navbar-nav small">`)

Top `<li class="nav-item text-center">` is an info block, the rest are action items:

- **Info block**: "Powered by: ProTradingRoom.com", "Version: v4.0.1-…",
  `button[data-bs-target="#mobileAppInfoModal"]` "Mobile App Info", `<hr>`,
  then a "Chat ✓ / Media ✓" capability row.
- **Connectivity Check** → modal `#webrtc-troubleshooter-modal` (`fa-network-wired`).
- **General Settings** → modal `#user-settings-modal` (`fa-cogs`).
- **Archives** dropdown (`fa-archive`): Alert Logs (`#alerts-logs-modal`),
  Chat Logs (`#chat-logs-modal`), Transcript History.
- **Manage Muted Users** → `#mutedUsersModal` (`fa-comments`).
- **Manage Followed Users** → `#followedUsersModal` (`fa-users`).
- **Users** block (`li.nav-item.d-flex.flex-column.h-100`) — the roster lives here:
  - header `a.active-room-users` with `<i class="fas fa-user"></i> Users:` on the
    left and a `.users-btns` cluster on the right:
    - `.dropdown.user-options` → button `#user-options-btn` (gear) → menu with
      "Sort by Trials" (sort options).
    - `button.reload-room-users` (`fa-sync`, title "Reload Users").
    - `button` sort (`fa-sort-alpha-down`, title "Sort Users").
    - `button.search-room-users` (`fa-search`, title "Search Users").
  - `<div class="flex-grow-1"><app-room-roster>…</app-room-roster></div>`

---

## 4. `app-room-roster` (members roster)

```html
<app-room-roster>
  <div class="room-roster-list">          <!-- width:100%; height:100%; overflow-y:inherit -->
    <virtual-scroller>                     <!-- width:100%; height:100vh (virtualized) -->
      <div class="room-roster-container">  <!-- one ROW: display:block; width:100%; min-height:42px -->
        <!-- avatar · name · status; presenter rows get a star/rating treatment -->
        <span class="stars-container">     <!-- presenter rating overlay -->
          <i class="stars-icon"></i>
          <span class="stars-num">N</span>
        </span>
        <span class="chat-stars">★</span>  <!-- 8px primary-color stars on presenters -->
      </div>
      <!-- empty state: room-roster-list contains only comment nodes when 0 users -->
    </virtual-scroller>
  </div>
</app-room-roster>
```

Roster structure (from class names + CSS, list empty in snapshot):
- **Header** = the `a.active-room-users` row in the sidebar (§3): user count +
  reload + sort + search + options dropdown.
- **List** = `virtual-scroller` (windowed) wrapping `room-roster-container` rows.
- **Row** = `.room-roster-container` (min-height 42px): avatar, name, status. A
  **presenter** is distinguished by the `.stars-container` / `.stars-num` rating
  overlay and `.chat-stars` (primary-color stars); plain **members** have none.
- **Empty state**: `.room-roster-list` renders no rows (only comment placeholders).

---

## 5. Map to pro-room (SvelteKit + Svelte 5) — and divergences

| Angular source | pro-room target | Notes / divergence |
|---|---|---|
| `app-room` `.wrapper` > `.room-container` | `routes/rooms/[id]/+page.svelte` | Ours: `RoomTopNav` + `.room-head` header + `.shell-body` containing `RoomSidebar` + `.layout` (CSS **grid `auto 1fr`**, `1fr` on mobile). Source uses **flex** `flex-column-reverse flex-sm-row` (sidebar stacks *below* content on mobile). We have no `flex-column-reverse` equivalent — mobile just collapses to one grid column. |
| `.mainAppNav` (fixed-top) | `RoomTopNav.svelte` (+ `Nav.svelte`) | Source nav is `position:fixed` and includes the talking indicator, Volume dropdown (range + per-sound DND toggles), Reload, connected-users count, mobile-app link, brand logo. Confirm ours carries the **talking indicator**, **Volume/DND dropdown**, and **Reload** — these are the load-bearing right-side controls. |
| `.room-sidebar` `<ul.navbar-nav>` | `RoomSidebar.svelte` | Source sidebar is the off-canvas menu (Connectivity Check, Settings, Archives→Alert/Chat Logs/Transcripts, Muted Users, Followed Users) AND it *contains the Users header + roster*. In pro-room the roster is split into `MembersPanel`/`PresenceBar`. Decide whether the roster lives inside `RoomSidebar` (matches source) or stays a separate panel. |
| `app-room-roster` (`virtual-scroller` rows) | `MembersPanel.svelte` / `PresenceBar.svelte` | Source uses true **virtual scrolling** (`virtual-scroller`, `height:100vh`). Row = `.room-roster-container` min-height 42px, presenter marked by star/rating overlay. If our member list can grow large, consider virtualization; presenter-vs-member visual distinction (stars) is currently likely missing. |
| `as-split` (angular-split) horizontal+vertical | `.layout` grid `auto 1fr` + flex sidebar | **Biggest divergence:** source is a **resizable 2-level split** ([alerts+chat ↕ split] \| gutter \| presentation) with draggable gutters and `flex: 0 0 calc(% - gutterPx)` panes persisted as percentages. Ours is a fixed CSS grid with no user-resizable gutters. To match faithfully we'd need a Split component (note: repo already has a new untracked `web/src/lib/components/Split.svelte`). |
| `app-alerts` + `app-chat` left column | `AlertFeed` / `AlertsChatDock` / `ChatPanel` | Left pane is alerts (top) over chat (bottom), vertically resizable. Chat has tabs **Main Chat / Off Topic**. |
| `app-webcam-holder` / `app-presenter-cams` / `app-presentationarea` | `MainStage` / `ScreenStage` / `WebcamHolder` | Right pane: webcam strip + presentation/screen area. |
