# file-1.html design-system spec — Part C (lines 2461–3690)

Reverse-engineered from the Angular app's inlined scoped `<style>` blocks.
`[_ngcontent-ng-cNNNN]` markers stripped; the real selector is the class/id/element.
Each `<style>` block ≈ one Angular component; grouped below by inferred component.

---

## 1. Theme tokens (CSS custom properties referenced in range)

No `:root`/`--x: value` *definitions* appear in this slice — these tokens are
**defined elsewhere** but **consumed** here. Capture them as required theme vars
for the pro-room rebuild:

| Token | Used by |
|---|---|
| `--chat-header-bg`, `--chat-header-color` | chat header |
| `--msgs-bg` | message list, private-chat scroller, roster `stars-num` |
| `--msgs-header-bg`, `--msgs-header-color` | chat PM nav, alerts toolbar/header, PM toolbar |
| `--textarea-bg`, `--textarea-color` | chat + alert textareas, PM/alert holders |
| `--textarea-holder-btns-color`, `--textarea-holder-btns-hover-color` | textarea action buttons |
| `--dark-gray`, `--darker-gray` | roster borders, textarea focus shadow |
| `--tabs-color`, `--tab-active-bg`, `--tabs-border-color` | chat tabs |
| `--modal-content-bg-color`, `--modal-content-color`, `--modal-input-group-bg`, `--modal-upload-files-color` | giphy search popover |
| `--chat-bg` | inline alert entry field |
| `--rosterImg-border-radius` | roster avatar |
| `--nickname-color`, `--username-color`, `--user-location-color` | roster names |
| `--light-brown` | roster msg-menu hover |
| `--app-primary-color` | chat-stars |
| `--msg-color` | roster stars-icon |

**Literal palette used inline (no var):** dark-slate theme for the connectivity/mic
modal — `#0f172a` (canvas bg), `#1e293b` / `#334155` (surfaces/borders),
`#94a3b8` / `#cbd5e1` / `#e2e8f0` (text), `#22d3ee` cyan (accent/active),
`#10b981` green (pass), `#ef4444` red (fail), `#eab308` amber (warn), `#64748b`
(pending). Light status surfaces `#f8fafc`/`#ecfdf5`/`#fef2f2`.

---

## 2. Per-component styles

### A. Screen-recording preview (`_ngc3658149680`) → ScreenStage / WebcamHolder
- `.recsHolderScreen` (host, partial — top lines): `position` fixed-ish, `bottom: 265px; right: 0; z-index: 100; border: 1px solid #fafafa; cursor: move; background-color: #000; display: none` (draggable floating preview, hidden by default).
- `.recsHolderScreen-lg`: `width: 700px; height: 520px`.
- `.recsHolderScreen .card-body`: `padding: 0; width: 100%; height: 100%`.
- `.recsHolderScreen .card-title`: `padding: 5px; font-size: 12px`; nested `button` `font-size: 12px`; `.float-right:hover { cursor: pointer }`.
- `.pNameLabel`: `position: relative; background-color: #00000080; color: #fff; text-align: center` (presenter-name overlay).
- `.recPreviewScreen`: `object-fit: contain; width: 100%; max-height: calc(100% - 42px); padding: 3px`.
- `.hidden`: `display: none`.

### B. Scheduled-alerts table (`_ngc3289216005`) → AlertFeed / scheduled alerts admin
- `.remove-scheduled-alert-btn`: `width: 88px !important`.
- `.alert-date-time-th`: `min-width: 150px !important`.

### C. Report / list modal (`_ngc752360452`) → modals (alert delivery report)
- `.list-group`: `width: 100%; max-width: 600px; margin: 0 auto`.
- `.list-group-item`: `margin-bottom: 1px`; `:hover { cursor: pointer }`.
- `.report-header`, `.report-body`: `width: 100%; max-width: 600px; margin: 0 auto`.
- `.report-header-container`: `padding: 10px`.
- `.report-body`: `text-align: left; max-height: calc(100vh - 500px); overflow-y: auto`.
- `.modal-dialog`: `overflow-y: initial !important; width: 100%; max-width: 800px`.
- `#search-select-addon`: `padding: 0; border: 0; margin: 0`.
- `.form-select`: square left side (`border-top-right-radius: 0; border-bottom-right-radius: 0`) — input-group joined to addon.
- `.failed-reason`: `font-size: 14px; font-weight: 100; font-style: italic`.
- `.sent-time`: `font-size: 14px; color: #6c757d`.
- `#pie-container`: `left:0; top:0; width: 600px; height: 192px; margin-bottom: 8px` (delivery pie chart).

### D. Log modal — simple (`_ngc3970478613`) → modals/ChatLogsModal (small variant)
- `.log-header`, `.log-body`: `width: 100%; margin: 0 auto`.
- `.log-header-container`: `padding: 10px`.
- `.log-body`: `text-align: center`.
- `.modal-dialog`: `overflow-y: initial !important; width: 100%; max-width: 800px`.
- `.log-messages`: `max-height: calc(100vh - 350px); overflow-y: auto`.

### E. Log modal — searchable w/ trader/room filters (`_ngc2037626149`) → modals/AlertLogsModal + ChatLogsModal
- `.modal-dialog`: `overflow-y: initial !important; width: 100%; max-width: 1000px` (wider).
- `.log-messages`: `max-height: calc(100vh - 425px); overflow-y: auto`.
- `.dropdown-trader-select .dropdown-toggle`, `.dropdown-room-select .dropdown-toggle`: `width: 200px; height: 38px; display: flex; align-items: center; justify-content: space-between`.
- `.form-select`: `width: 200px`.
- `#search-term-input`: `flex: 1; flex-basis: 300px`.
- `#search-term-input`, `.form-select`: `margin: 4px`.
- `#startDateInput`, `#endDateInput`: `width: 190px`.
- hover states (`.dropdown-item:hover`, `#search-term-addon:hover`): `cursor: pointer; opacity: 0.85`.
- `.dropdown-trader-select .dropdown-menu.show`: `height: 420px; display: flex; flex-direction: column; width: 410px !important; flex-wrap: wrap` (multi-column wrapped trader list).
- `.dropdown-item` (trader/room): `word-break: break-word; text-wrap: wrap`.
- `.selected-traders-str`, `.selected-rooms-str`: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` (truncated summary of selection).

### F. Checkbox list (`_ngc1580528918`) → modals/MutedUsersModal or FollowedUsersModal
- `.text-opacity`: `opacity: 0.1`.
- `.list-group-item-action`: `padding: 4px 4px 4px 16px`; `:hover { cursor: pointer }`.
- `.form-check-input:hover`: `cursor: pointer; opacity: 0.85`.

### G. Connectivity / mic troubleshooter modal (`_ngc2606333922`) → modals/ConnectivityCheckModal
Dark-slate themed, the most detailed block in range.

**Tabs** (`.troubleshooter-tabs`): `border-bottom: none; padding: 0.5rem 1rem 0; gap: 0.5rem`.
- `.nav-link`: `border: none; border-radius: 0.5rem 0.5rem 0 0; color: #94a3b8; font-weight: 600; font-size: 0.9rem; padding: 0.6rem 1.2rem; transition: all .25s; background: transparent`.
- `:hover`: `color: #e2e8f0; background: #ffffff0d`.
- `.nav-link.active`: `color: #22d3ee; background: #22d3ee14; box-shadow: inset 0 -2px #22d3ee`.
- nested `i`: `font-size: 0.85rem`.

**Status rows** (`.status-item`): `display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 1rem 1.25rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; transition: background-color .3s`.
- `span.fw-medium`: `color: #1a202c !important; font-weight: 600 !important; font-size: 0.95rem`.
- `.status-item.passed`: `background: #ecfdf5; border-left: 4px solid #10b981`.
- `.status-item.failed`: `background: #fef2f2; border-left: 4px solid #ef4444`.
- `.status-icon`: `font-size: 1.5rem; min-width: 24px; text-align: center`; variants `.passed #10b981`, `.failed #ef4444`, `.pending #64748b`.
- `.spin`: `animation: spin 1s linear infinite` (keyframes 0→360deg).

**Modal chrome:** `.modal-header .modal-title { color:#fff; font-weight:700; font-size:1.25rem }`; `.modal-body { max-height: 60vh; overflow-y: auto }`; `.modal-body .text-muted { color:#e5e7eb; font-weight:500; font-size:.95rem }`; `.btn { border-radius: .375rem }` (icon `i` margin-right .5rem).

**Alerts:** `.alert { border-radius:.5rem; border:none; font-size:.9rem }`; `.alert-info #dbeafe/#1e40af`; `.alert-success #ecfdf5/#047857`; `.alert-danger #fef2f2/#dc2626`.

**No-mic empty state** (`.no-mic-container`): centered column, `padding: 2rem 1rem`.
- `.no-mic-icon`: `64×64; border-radius: 50%; background: #ef44441a; flex center; margin-bottom: 1rem`; nested `i` `font-size:1.6rem; color:#ef4444`; `.loading` variant swaps to cyan `#22d3ee1a` / `#22d3ee`.
- `.no-mic-title`: `color:#e2e8f0; font-weight:700; margin-bottom:.5rem`.
- `.no-mic-text`: `color:#94a3b8; font-size:.9rem; max-width:320px; margin-bottom:1rem`.

**Mic test:** `.mic-label`: `display:block; color:#cbd5e1; font-weight:600; font-size:.85rem; text-transform:uppercase; letter-spacing:.05em`.
- `.mic-select`: `background:#1e293b; border:1px solid #334155; color:#e2e8f0; border-radius:.5rem; font-size:.9rem; padding:.5rem .75rem` (all `!important`); `:focus { border-color:#22d3ee; box-shadow:0 0 0 2px #22d3ee26 }`; `:disabled { opacity:.5; cursor:not-allowed }`; `option` `bg:#1e293b; color:#e2e8f0`.

**Waveform:** `.waveform-wrapper`: `position:relative; border-radius:.75rem; overflow:hidden; border:1px solid #1e293b; background:#0f172a`; `.active { border-color:#22d3ee; box-shadow: 0 0 20px #22d3ee1f, inset 0 0 30px #22d3ee08 }`.
- `.waveform-canvas`: `display:block; width:100%; height:120px`.
- `.waveform-overlay`: `position:absolute; inset:0; flex column center; gap:.5rem; background:#0f172ad9; color:#475569`; `i` 1.5rem, `span` .85rem/500.

**Volume meter:** `.volume-label`: flex space-between, `margin-bottom:.4rem`; `.volume-value`: `font-size:.85rem; font-weight:700; color:#475569; font-variant-numeric: tabular-nums`; `.active` → `#22d3ee`.
- `.volume-bar-track`: `height:10px; background:#1e293b; border-radius:999px; overflow:hidden; border:1px solid #334155`.
- `.volume-bar-fill`: `height:100%; border-radius:999px; transition: width .08s linear`; `.low` cyan→green gradient, `.mid` green→amber, `.high` amber→red — each with matching glow box-shadow.

**Mic status pill** (`.mic-status`): flex, `gap:.6rem; padding:.75rem 1rem; border-radius:.625rem; font-size:.9rem; font-weight:600`; `.mic-status-dot` 10×10 circle.
- variants: `idle` (#1e293b/#94a3b8, dot #475569), `testing` (#22d3ee14/#22d3ee, dot pulses), `success` (#10b9811a/#10b981, dot glow), `no-audio` (#eab3081a/#eab308, dot pulses fast), `error` (#ef44441a/#ef4444). `pulse-dot` keyframe scales 1→1.6 + fades.

**Mic action buttons** (`.mic-actions-row` flex wrap gap .5rem), all `padding:.5rem 1.2rem; border-radius:.5rem; font-weight:600; border:none`:
- `.btn-mic-start`: gradient `135deg #0891b2→#22d3ee`, white; hover darker + `box-shadow 0 4px 12px #22d3ee4d; translateY(-1px)`.
- `.btn-mic-stop`: `#334155` / `#e2e8f0`; hover `#475569`/white.
- `.btn-mic-record`: `#7f1d1d`/`#fca5a5`, `i.fa-circle` red; hover `#991b1b`/`#fecaca`; `.recording` → `#dc2626`/white + `recording-glow` keyframe (pulsing box-shadow).
- `.btn-mic-play`: gradient `135deg #047857→#10b981`, white; `:hover:not(:disabled)` darker + green glow + lift; `:disabled { opacity:.7; cursor:not-allowed }`.

### H. Chat panel + private messages + giphy (`_ngc3142977328`) → ChatPanel / AlertsChatDock
- `.navbar`: `font-size: 12px; padding: 2px`.
- `.roomLog`: `height:100%; overflow-y: scroll`.
- `.chatDisabled`: `height/min-height:40px; width:100%; background:#aaa; color:#000` (disabled banner). `.webinarMode`: `background:#aaa; color:#000; width:100%`.
- `.chat-header-nav`: `font-size:12px; min-height:30px`; nested `.navbar-brand` & `.chat-header-gear`: `font-size:16px`.
- `.menu-p-label`: `padding:5px; font-weight:100; font-size:12px`.
- `.chat-header-menu-settings`: `padding:0; margin:0; border:none; border-radius:0%; background:transparent`.
- `.chat-header`: `background: var(--chat-header-bg); color: var(--chat-header-color)` (both `!important`).
- `.list-of-msgs`: `height: calc(100% - 41px); overflow-y: scroll; background: var(--msgs-bg)`.
- `.textAreaBtns`: `padding:5px; color: var(--textarea-holder-btns-color)`; `:hover` → `var(--textarea-holder-btns-hover-color); cursor:pointer`.
- `.custom-file`: `display:none`. `.input-group-text`: `padding:0; margin:0`.
- `.textAreaBtnsCol`: `background: var(--textarea-bg); color: var(--dark-gray)`.
- `.txt-area`: `border-radius:0; border:1px solid #fff; font-size:14px; resize:none; color: var(--textarea-color); background: var(--textarea-bg); outline:none; overflow-y:auto; padding 0 5px; word-wrap:break-word`; `:focus { box-shadow: 1px 1px 1px var(--darker-gray) }`.
- `#form-upload-img .input-group-text/.form-control`: `border-radius:0`.
- `.unreadIndicator`: `text-align:center; position:relative; top:30px; z-index:10; background:#9acd32` (yellow-green new-msgs pill).
- `.white`: `color:#fff`.
- `.chat-nav-pm`: `align-items:center; flex-wrap:nowrap; min-height:40px; background: var(--msgs-header-bg)`; `.dropdown-menu` `bg var(--msgs-header-bg); border:none; border-radius:0 0 0 5px`; `.nav-item/.btn/.input-group-append { cursor:pointer }`.
- `.pc-body`: `background:#f1f1f1; overflow:hidden` (private-chat body).
- `.pc-list`: `flex-basis:220px; height:100%; overflow:hidden auto; padding:0 1px` (PM conversation list).
- `.pc-active`: `background:#f9f9f9`.
- `.list-group-item`: `padding:10px 3px; border-bottom:1px solid #eee; text-align:left; margin-top:1px`.
- `.pc-logs`: `flex:1; height:100%`.
- `.chatSearchTerm`: `height: inherit`.
- `.pc-username`: `white-space:nowrap; max-width:135px; overflow:hidden; text-overflow:ellipsis; display:inline-block; vertical-align:middle`.
- `.close-tab`: `cursor:pointer; padding:2px 5px`.
- `.user-status-container`: `position:relative`; `.user-status-type`: `padding:.5px 4px !important; border-radius:50%; position:absolute; bottom:-5px; left:26px; background:#dc3545` (red status badge on avatar).
- `#textAreaHolderPM`: `background: var(--textarea-bg); border-radius:8px; padding:5px; margin:0 5px`.
- `.privchatUnread`: `background: red !important`.
- `.chatTabs .nav-item .active`: `color: var(--tabs-color); background: var(--tab-active-bg); border-color: var(--tabs-border-color)`.
- `.chatTabs li a`: `font-weight:700; font-size:12px; padding 0 5px; margin-right:5px; color:#d3d3d3; margin-bottom:0; padding-bottom:5px`; `:hover { border-color: var(--tab-active-bg); border-radius:3px }`.
- `ul.chatTabs`: `margin-bottom:0; border-color: var(--tabs-border-color)`.
- `.counterBadge`: `top:-5px; position:relative`.
- `.textAreaBtnSelected`: `background:#f1f2f3`.
- popover arrow (`.bs-popover-top > .arrow:after`): `border-top-color: var(--modal-content-bg-color)`.
- **Giphy search popover** `.giphy-search`: `width:400px; height:400px; border:2px solid var(--modal-content-bg-color); background:#fff; overflow:hidden`.
  - `.input-group-text`: `border:none; background: var(--modal-input-group-bg)`.
  - `.fa-times`: `font-size:16.5px; padding:10px`; `:hover { cursor:pointer; opacity:.85 }`.
  - `.giphy-header`: `padding:10px; background: var(--modal-content-bg-color)`.
  - `.search-results`: `overflow-y:auto; height:100%; padding:5px`.
  - `.gif-result`: `text-align:center`; nested `img { cursor:pointer }`.
  - `li`: `padding:10px`; `li:hover { background: var(--modal-upload-files-color) }`.
  - `h4/h6`: `color: var(--modal-content-color)`.
  - `.giphy-hr`: `color:#fff; padding:0; margin:0 0 10px`.
- `img`: `max-width:100%`.
- `.avatarImg`: `32×32; margin-right:5px; object-fit:cover`; `.avatarImg-active`: `25×25`.
- `.privChatScroller`: `background: var(--msgs-bg)`.
- `.pmToolbar`: `background: var(--msgs-header-bg); color: var(--msgs-header-color)`.

### I. Angular-split layout (`_ngc3013344202`) → Split.svelte (panel splitter)
Reimplementation of `angular-split`. Host `display:flex; flex-wrap:nowrap; justify-content:flex-start; align-items:stretch; overflow:hidden; width:100%; height:100%`.
- `.as-split-gutter`: `border:none; flex-grow:0; flex-shrink:0; background:#eee; flex center` (drag handle).
- `.as-split-gutter.as-split-gutter-collapsed`: `flex-basis:1px !important; pointer-events:none`.
- `.as-split-gutter-icon`: `width/height:100%; background-position/repeat: center/no-repeat` (base64 PNG grip dots).
- `.as-split-area`: `flex-grow:0; flex-shrink:0; overflow-x:hidden; overflow-y:auto`; `.as-hidden { flex:0 1 0px !important; overflow:hidden }`; `.iframe-fix { position:absolute; inset top/left 0; 100%×100% }`.
- `.as-horizontal` (host): `flex-direction:row`; gutter `cursor: col-resize; height:100%` (horizontal grip PNG); areas `height:100%`.
- `.as-vertical` (host): `flex-direction:column`; gutter `cursor: row-resize; width:100%` (vertical grip PNG); areas `width:100%`; `.as-split-area.as-hidden { max-width:0 }`.
- `.as-disabled` gutter: `cursor:default`.
- `.as-transition.as-init:not(.as-dragging)` gutter+area: `transition: flex-basis 0.3s`.

### J. Room roster (`_ngc900715899`) → MembersPanel / PresenceBar
- `.rosterImg`: `45×45; object-fit:cover; border-radius: var(--rosterImg-border-radius)`.
- `.presUser`, `.regUser`: `font-size:14px`; `:hover { cursor:pointer; transition: all .2s }`.
- `.presUser` (presenter/admin row): `background: var(--roster-bg-adm) !important; border-bottom:1px solid var(--dark-gray) !important`.
- `.regUser` (regular member): `background: var(--roster-bg); border-bottom:1px solid var(--dark-gray)`.
- `.nickName`: `font-weight:bolder; font-size:16px; color: var(--nickname-color); position:relative`; nested `.dropdown-menu { position:absolute; left:-12px }`.
- `.userLocation`: `font-weight:200; font-size:12px; margin-bottom:0; color: var(--user-location-color)`.
- `.msgMenu`: `padding-left:5px; font-size:20px; font-weight:600; color: var(--username-color)`; `:hover { color: var(--light-brown); font-weight:900; cursor:pointer }`.
- `.room-roster-list`: `width/height:100%; overflow-y: inherit !important`.
- `.chat-stars`: `font-size:8px; vertical-align: text-top !important`; `span.chat-stars { margin-top:2px; margin-left:2px; display:inline-block; color: var(--app-primary-color) }`.
- `.stars-container`: `position:relative`; `.stars-icon { color: var(--msg-color) }`.
- `.stars-num`: `position:absolute; color: var(--msgs-bg); left:6px; top:4px; font-size:10px; font-weight:700` (count overlaid on star badge).
- `.room-roster-container`: `display:block; width:100%; min-height:42px`.
- `virtual-scroller`: `width:100%; height:100vh` (virtualized roster list).

### K. Alerts panel (`_ngc1922465750`, partial — block truncates at line 3690) → AlertFeed / AlertsChatDock
- `.chat li a`, `.chat .clear-alert-input`: `cursor:pointer`.
- `.alertsToolbar`, `.alertHeader`: `background: var(--msgs-header-bg); color: var(--msgs-header-color)`.
- `.alertHeader .dropdown-menu`: `background: var(--msgs-header-bg); border:none; border-radius:0 0 0 5px`.
- `.inline-alert-entry-field`: `background: var(--chat-bg)`.
- `#textAreaAlertHolder`: `background: var(--textarea-bg); border-radius:8px; padding:5px; margin:5px`.
- `.txt-area-alert`: `border-radius:0; border:1px solid #fff; font-size:14px; resize:none; color: var(--textarea-color); background: var(--textarea-bg); outline:none; overflow-y:auto; padding 0 5px`; `:focus { border-color: var(--darker-gray); box-shadow: 0 1px 0 var(--darker-gray) }`.
- `.form-check-label:hover`: `cursor:pointer; opacity:.85`.
- `.filtered-text`: `font-size:12px; vertical-align:middle`; `:hover { cursor:pointer; opacity:.85 }`.
- `.poll-active-blink`: `color:#f39c12 !important; animation: poll-pulse 1.5s ease-in-out infinite`.
- `.poll-active-indicator`: `color:#f39c12 !important`.
- `poll-pulse` keyframe: opacity 1 ↔ (50% truncated, presumably ~0.4) — orange blinking poll indicator → maps to PollPanel/PollModal active state.

---

## 3. Layout / structure hints

- **Panel splitting** is `angular-split` (component I) → pro-room `Split.svelte`/`WebcamHolder`. Horizontal = side-by-side resizable panes (`col-resize`), vertical = stacked (`row-resize`); collapsible areas use `.as-hidden` (flex/max-width → 0); animated via `flex-basis 0.3s` transition. Drag grips are tiny base64 PNGs.
- **Chat panel** (H) full-height column: header `~30–41px`, message list fills `calc(100% - 41px)`, textarea holder pinned bottom (rounded 8px). Tabs are 12px bold pills. Private-chat is a two-pane split inside the panel: `.pc-list` (220px fixed) + `.pc-logs` (flex:1).
- **Roster** (J) is virtualized (`virtual-scroller`, `100vh`); rows ≥42px; avatars 45px; admin/presenter rows visually distinct (`--roster-bg-adm`).
- **Modals** share a Bootstrap `.modal-dialog` base; widths vary by purpose: report 800px, simple log 800px, searchable log 1000px. Bodies cap height with `calc(100vh - Npx)` + `overflow-y:auto`. `overflow-y: initial !important` on the dialog lets dropdowns escape the modal.
- **Connectivity/mic modal** (G) is the one fully self-themed dark-slate component (Tailwind-like palette, not CSS vars) — the rest of the app theme rides on CSS custom properties. Tabs at top, status rows / waveform / volume meter / action buttons stacked in `60vh` scrollable body.
- No `@media` breakpoints in this slice; responsiveness handled via flex (`flex:1`, `flex-basis`) and the split component.

---

## 4. pro-room component mapping summary

| Source block (_ngc) | Inferred component | pro-room counterpart |
|---|---|---|
| 3658149680 | screen-recording floating preview | ScreenStage / WebcamHolder |
| 3289216005 | scheduled-alerts table | AlertFeed (scheduled) |
| 752360452 | alert delivery report modal | modals/AlertLogsModal |
| 3970478613 | simple log modal | modals/ChatLogsModal |
| 2037626149 | searchable log modal w/ trader/room filters | modals/AlertLogsModal + ChatLogsModal |
| 1580528918 | checkbox user list | modals/MutedUsersModal / FollowedUsersModal |
| 2606333922 | connectivity + mic troubleshooter | modals/ConnectivityCheckModal |
| 3142977328 | chat + private messages + giphy | ChatPanel / AlertsChatDock |
| 3013344202 | angular-split layout | Split.svelte |
| 900715899 | room roster | MembersPanel / PresenceBar |
| 1922465750 | alerts panel (partial) | AlertFeed / AlertsChatDock / PollPanel |
