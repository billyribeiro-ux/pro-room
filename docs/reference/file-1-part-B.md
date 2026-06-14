# file-1.html Design-System Spec — Part B (lines 1231–2460)

Reverse-engineered from the Simpler Trading / Mastering The Trade Angular app's
inlined scoped CSS. Angular `[_ngcontent-ng-cNNN]` attribute markers are stripped;
selectors below are the REAL classes/ids/elements. Each `<style>` block = one
Angular component (the `cNNN` marker is noted as the component fingerprint).

---

## 1. Theme tokens / customization variables

### 1a. CSS custom properties (`var(--…)`) referenced in this slice

These are consumed here but DEFINED elsewhere (global `:root`). Documented so the
pro-room theme layer knows which tokens these components depend on.

| Token | Used by (purpose) |
|---|---|
| `--presenter-recording-color` | recording text color |
| `--light-gray` | nav items, custom radio/checkbox base bg, `.text-mode-box`/`.themes` inputs |
| `--navbar-color` / `--navbar-bg` | `#navbarsRoom`, `.btnNavToggler`, `.mainAppNav` |
| `--reload-icon-bg-color` / `--reload-icon-color` | `.reload-room-users` |
| `--search-icon-bg-color` / `--search-icon-color` | `.search-room-users` |
| `--users-badge-bg-color` / `--users-badge-color` | active-room-users `.badge` |
| `--ptr-website-link-color` | `.ptr-website-link` |
| `--mobileApp-info-bg-color` / `--mobileApp-info-color` | `.mobile-app-info` |
| `--modal-content-color` | modal `a`, `.table`, user-modal `th/td`, giphy `h4` |
| `--modal-content-bg-color` | user-modal `th/td` bg, giphy border/header, popover arrow |
| `--modal-active-tab-border-color` | user-modal `.nav-tabs` border |
| `--app-primary-color` | `span.chat-stars` color |
| `--msg-color` | `.stars-container .stars-icon` color |
| `--msgs-bg` | `.stars-num` color |
| `--checkbox-bg-color` | ALL custom radio/checkbox `:checked` bg (consistent) |
| `--white` | custom radio/checkbox text color |
| `--session-control-dropdown-bg` | session-control dropdown menu bg |
| `--modal-input-group-bg` | `#addon-img`, giphy input-group-text |
| `--modal-alert-link-color` | `#alert-modal .btn-link` |
| `--modal-upload-files-color` | giphy `li:hover` bg |
| `--textarea-bg` / `--textarea-color` | chat textarea + button column |
| `--textarea-holder-btns-color` / `--textarea-holder-btns-hover-color` | textarea action buttons |
| `--dark-gray` / `--darker-gray` | textarea btn color, textarea focus border/shadow |

### 1b. User-customizable chat/alert/presenter APPEARANCE hooks (id-based)

These are `<input>` color-pickers / size-fields. They are the **end-user
customization controls** (chat & alert ticker/text/username/bg color + text size).
All share the SAME box dimensions: **width 45px, height 20px**.

**User-Settings modal (component `c124836360` → user settings):**

| Id hook | Customizes |
|---|---|
| `#chat-ticker-color` | chat ticker color |
| `#chat-username-color` | chat username color |
| `#chat-text-color` | chat message text color |
| `#chat-bg-color` | chat background color |
| `#chat-text-size` | chat text size (also has `font-size:13px`) |
| `#alert-ticker-color` | alert ticker color |
| `#alert-text-color` | alert text color |
| `#alert-bg-color` | alert background color |
| `#alert-text-size` | alert text size (`font-size:13px`) |
| `#presenter-text-color` | presenter text color |
| `#presenter-bg-color` | presenter background color |
| `#presenter-text-size` | presenter text size (`font-size:13px`) |

Box rule: `width:45px; height:20px;`. The three `*-text-size` inputs additionally
get `font-size:13px`.

**Follow-chat customization (component `c1441935951` → user modal):**

| Id hook | Customizes |
|---|---|
| `#follow-chat-ticker-color` | followed-user chat ticker color |
| `#follow-chat-text-color` | followed-user chat text color |
| `#follow-chat-username-color` | followed-user username color |
| `#follow-chat-bg-color` | followed-user chat bg color |
| `#follow-chat-text-size` | followed-user chat text size |

Same box rule `width:45px; height:20px;`. Note a separate `#chat-text-size` in
this component is `font-size:13px`.

> pro-room mapping: these become the user appearance settings persisted per-user
> and applied as inline CSS vars on ChatPanel / AlertFeed / FollowedUsers chat.

---

## 2. Per-component styles

### Component `c977335924` — Room top-nav / presenter / recording (→ RoomTopNav, PresenceBar, Nav)

| Selector | Purpose / key props |
|---|---|
| `.talkingWaveform` | mic waveform: `max-height:25px; max-width:30px` |
| `.navbar-dark .navbar-nav .nav-link`, `.muted` | color `#abb0b5` |
| `.mic-gear-btn` | `font-size:0.7rem; color:#abb0b5; cursor:pointer; transition opacity/color .2s; margin-left:-7px!important`. `:hover` → `color:#fff!important` |
| `.mainNavItem` | `display:none; color:var(--light-gray)`. Shown (`display:block`) at `max-width:768px` |
| `#navbarsRoom` | `color:var(--navbar-color); background:var(--navbar-bg)` |
| `.btnNavToggler` | `color:var(--navbar-color)` |
| `.mainAppNav` | navbar color + bg vars |
| `.reload-room-users` / `.search-room-users` | icon buttons w/ themed bg+color vars |
| `.active-room-users .badge` | users count badge, themed bg+color |
| `.ptr-website-link` | `color:var(--ptr-website-link-color)` |
| `.mobile-app-info` | themed bg+color; `:hover` opacity `0.9` |
| `.benzinga-logo` | `max-height:25px!important` |
| `.benzinga-logo-alt` | `background:#000; width:100%!important; max-height:25px!important; max-width:230px!important` |
| `.sidebar-item` | `color:inherit!important`; `:hover` bg `#e9ecef` |
| `.room-split-dir` | `flex-direction:row-reverse!important; direction:ltr!important` (reversed split layout) |
| `.user-options .dropdown-menu` | `position:absolute!important; z-index:1000; top:30px; left:-106px; width:228px; font-size:13px; padding:2px` |
| `.user-options .dropdown-toggle:after` | `display:none` (hide caret) |
| `.users-btns .btn` | `padding:3px 6px` |
| `.recording-reminder` | absolute tooltip: `top:50px; left:-50px; bg:#fff; color:#000; width:160px; padding:5px 5px 5px 10px; font-size:12px; flex; align-items:center; justify-content:space-between` |
| `.recording-reminder-arrow` | CSS triangle pointer (`border-bottom:5px solid #fff`), `top:-5px; left:75px` |
| `.blinking-rec` | `animation: blinking 1s step-start infinite` (`@keyframes`: 50%→opacity:0) |
| `.breathing-rec` | `color:red!important; animation: breathing 5s ease-out infinite` (scale 0.9↔1.1 pulse) |
| `.mod-msg-container` | moderator broadcast banner: `bg:#000; position:absolute; bottom:5px; left:0; width:85%; z-index:11; padding:10px; margin:0 10px; border-radius:5px` |
| `.mod-msg-btn` | `margin:0 10px; font-size:20px`; `:hover` cursor+opacity 0.85 |

**Responsive:** 768–930px → `#navbarsRoom`/`.fa-2x` font 15px, talkingIndicator
`a` 12px, `.brand-logo` max-width 150px. `≤768px` → `.mainNavItem` block.
`≤600px` → `.soundcloud-options`/`.screen-options-start-screen` width inherit,
`.brand-logo` max-width 120px, `#textAreaHolder` min-height 150px.

---

### Component `c1441935951` — User modal + chat-stars + follow-chat customization (→ MembersPanel user modal / settings, FollowedUsersModal, chat-stars badge)

| Selector | Purpose / key props |
|---|---|
| `.modal-title` | `vertical-align:middle` |
| `a` | `color:var(--modal-content-color)` |
| `#user-modal nav` | `margin-bottom:16px` |
| `#user-modal img` | `display:block; max-width:80px; min-width:50px; margin-right:10px` (avatar) |
| `#nav-info table` | `margin-bottom:0; width:0; flex-basis:100%` |
| `.table` | `color:var(--modal-content-color)` |
| `#user-modal thead` | `font-size:20px` |
| `#user-modal .nav-tabs` | border `var(--modal-active-tab-border-color)!important` |
| `#user-modal th, td` | `border:none!important; bg:var(--modal-content-bg-color); color:var(--modal-content-color)` |
| `#user-modal th` | `width:100px; font-size:15px` |
| `#user-modal td` | `font-size:14px` |
| `#user-modal .modal-footer button` | `width:23%; margin:4px` (4-up button row) |
| `#user-modal .modal-dialog` | `max-width:600px` |
| `#user-modal .tagline` | `display:block; font-size:14px; font-style:italic` |
| `.smallAvatarImg` | `max-width:20px!important; display:inline!important` |
| `.edit-username` | `font-size:14px`; `:hover` cursor+opacity 0.85 |
| **`.chat-stars`** | reputation stars: `font-size:8px; vertical-align:text-top!important` |
| **`span.chat-stars`** | `margin-top:2px; margin-left:2px; display:inline-block; color:var(--app-primary-color)` |
| `.stars-container` | `position:relative` |
| `.stars-container .stars-icon` | `color:var(--msg-color)` |
| `.stars-num` | overlaid count: `position:absolute; color:var(--msgs-bg); left:5px; top:3px; font-size:10px; font-weight:700` |
| `.followingSign:before` | check glyph `\2713` (✓): `color:inherit; font-size:12px; margin-right:5px` |
| `.follow-user-example` | preview row: `padding:10px; border-radius:5px; margin-bottom:10px; flex; align-items:center; justify-content:space-between` |
| `.text-mode-box .form-check-input` | **custom radio** (see shared radio spec below) |
| `.text-mode-box .form-check-input:checked + label` | `text-transform:uppercase; font-weight:700` |
| `.edit-user-avatar` | `position:relative` |
| `.edit-user-avatar-options` | avatar edit FAB: `position:absolute; bottom:-8px; right:2px; padding:3px 4px; bg:#fff; border-radius:50%; color:#444; line-height:16px; text-align:center; font-size:14px`; `:hover` color `#000` |
| `.edit-user-avatar-options .dropdown-toggle:after` | `display:none` |
| `.remove-profile-picture-btn` | `font-size:12px; margin:0 4px` |

---

### Shared custom radio / checkbox pattern (appears in c1441935951, c124836360, c3558549984, c3707659089)

`.form-check-input` (and `.themes`/`.text-mode-box` variants):
```
appearance:none; height:20px; width:20px;
transition:all .15s ease-out 0s;
background-color:var(--light-gray);
border:none; color:var(--white); cursor:pointer;
display:inline-block; margin-right:0.5rem;
outline:none; position:relative; z-index:1000;
border-radius:50%;   /* circular */
```
- `:checked` → `background-color:var(--checkbox-bg-color)`
- `:checked + label` → `text-transform:uppercase; font-weight:700`
- `.form-check-label:hover` → `cursor:pointer; opacity:0.85`

> pro-room: this is the canonical themed radio used across settings / poll /
> session-control modals. Reuse one shared component.

---

### Component `c1011176350` — Play-YouTube modal

| Selector | Props |
|---|---|
| `#play-youtube-modal .modal-dialog` | `max-width:700px` |
| `#play-youtube-modal button.close` | `color:#fff` |
| `.remove-yt-url` | `padding:1px 4px; margin-right:8px` |
| `.yt-url:hover` | underline + cursor pointer |

---

### Component `c124836360` — User-Settings modal (→ settings appearance customization)

| Selector | Props |
|---|---|
| `#user-settings-modal .modal-dialog` | `max-width:700px` (≤750px → 60%, ≤500px → 50%) |
| `#user-settings-modal button.close` | `color:#fff` |
| The 12 `#chat-*` / `#alert-*` / `#presenter-*` color/size hooks | see §1b — `width:45px; height:20px`, size fields `font-size:13px` |
| `.themes`/`.text-mode-box .form-check-input` | shared custom radio (see above) |
| `@keyframes click-wave` | ripple effect 40px→200px, opacity 0.35→0 |

> pro-room mapping: **the appearance/customization tab of settings/+page.svelte** —
> the live color & text-size controls for chat, alerts, presenter text.

---

### Component `c286619529` — AV-settings modal (→ ConnectivityCheckModal / device settings)

| Selector | Props |
|---|---|
| `#av-settings-modal video` | `max-width:100%; max-height:66.5px` |
| `#av-settings-modal .video-container` | `margin-bottom:-8px` |

---

### Component `c3443900831` — Alert modal (→ AlertFeed alert composer / AlertQaModal sibling)

| Selector | Props |
|---|---|
| `.modalClose` | `color:#fff; border:none; background:none; font-size:20px` |
| `#addon-img` | `background:var(--modal-input-group-bg)` |
| `#alert-modal .btn-link` | `color:var(--modal-alert-link-color)` |
| `.upload-area:hover` | `cursor:pointer` |

---

### Component `c3558549984` — Poll panel (→ PollPanel / PollModal)

Floating/draggable poll panel. KEY component for pro-room PollPanel.

| Selector | Purpose / key props |
|---|---|
| `.poll-panel-titlebar` | **draggable header**: `flex; align-items:center; justify-content:space-between; padding:6px 10px; background:#2c2c2c; border-bottom:1px solid #555; cursor:move; user-select:none` |
| `.poll-panel-title` | `font-weight:700; font-size:14px; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis` |
| `.poll-panel-controls` | `display:flex; gap:6px; flex-shrink:0` (title-bar button cluster) |
| `.poll-panel-btn` | icon button: `background:transparent; border:1px solid #666; color:#ccc; width:28px; height:28px; flex center; border-radius:3px; cursor:pointer; font-size:12px; padding:0`. `:hover` → `background:#444; color:#fff` |
| `.poll-panel-btn-close:hover` | `background:#c0392b; color:#fff` (red close) |
| `.poll-panel-body` | `padding:10px; overflow-x:hidden; overflow-y:auto; height:calc(100% - 40px); color:#ddd` (40px reserved for titlebar) |
| `.poll-panel-footer` | `display:flex; justify-content:flex-end; gap:8px; padding-top:10px` (right-aligned actions) |
| `#sendpoll h3` | `font-size:20px` |
| `.nav-tabs` | `width:100%; margin:0; flex; align-items+justify center` |
| `#responsesTxt` | `max-height:300px; overflow-y:auto` (responses list) |
| `.anonymous-poll-container` | `margin:8px 0 8px 20px` (anonymous-poll toggle row) |
| `.form-check-input` / `:checked` / `.form-check-label:hover` | shared custom radio (see above), plus `margin-top:0` |
| `.input-group-btn .btn` | `border-radius:0 6px 6px 0` (right-attached add button) |
| `.nav-link.active`, `.nav-link.active:hover` | `color:#000!important` |

Palette summary (dark, hardcoded): titlebar `#2c2c2c`, borders `#555`/`#666`,
muted text `#ccc`/`#ddd`, hover `#444`, close hover `#c0392b`.

---

### Components `c330848937` & `c86010747` — Log modals (→ AlertLogsModal, ChatLogsModal) — IDENTICAL CSS

| Selector | Props |
|---|---|
| `.list-group` | `text-align:center; width:100%; max-width:600px; margin:0 auto` |
| `.list-group-item` | `margin-bottom:1px`; `:hover` cursor pointer |
| `.log-header`, `.log-body` | `width:100%; margin:0 auto` |
| `.log-header-container` | `padding:10px` |
| `.log-body` | `text-align:center` |
| `.log-messages` | `max-height:calc(100vh - 350px); overflow-y:auto` |
| `.modal-dialog` | `overflow-y:initial!important; width:100%; max-width:1000px` (wide log modal) |

---

### Component `c3707659089` — Session-control modal (→ admin session/recording control)

| Selector | Props |
|---|---|
| `#session-control-modal p` | `font-size:14px; margin-top:5px`; `:last-child` margin-bottom 0 |
| `#session-control-modal .dropdown-menu` | `background:var(--session-control-dropdown-bg)`; menu `a:hover` cursor pointer |
| `.modal-body form button` | `width:45%; margin:0 2.5%` (2-up) |
| `.modal-body button/textarea/label` | `font-size:14px` |
| `.form-check-input` etc | shared custom radio |
| `.disable-video:hover`, `.form-check-label:hover` | cursor + opacity 0.85 |
| `.restream-link:hover` | underline + cursor pointer |

---

### Component `c4094271479` — Google badge

| `.google-badge` | `width:auto; height:100%; max-height:60px` |

---

### Component `c1823712792` — Chat textarea / composer + Giphy search (→ ChatPanel composer)

| Selector | Purpose / key props |
|---|---|
| `.textAreaBtns` | composer action icons: `padding:5px; color:var(--dark-gray)`; overridden to `color:var(--textarea-holder-btns-color)!important`; `:hover` → `var(--textarea-holder-btns-hover-color)!important` + cursor |
| `.custom-file` | `display:none` (hidden file input) |
| `.input-group-text` | `padding:0; margin:0` |
| `.textAreaBtnsCol` | `background:var(--textarea-bg)!important; color:var(--dark-gray)!important` (button column) |
| `.txt-area` | message input: `border-radius:0; border:1px solid #fff; font-size:14px; resize:none; color:var(--textarea-color)!important; background:var(--textarea-bg)!important; outline:none; overflow-y:auto; padding 0 5px`. `:focus` → `border-color:var(--darker-gray); box-shadow:1px 1px 1px var(--darker-gray)` |
| `#form-upload-img .input-group-text/.form-control` | `border-radius:0` |
| `.white` | `color:#fff` |
| `.textAreaBtnSelected` | `background:#f1f2f3` (active toggle btn) |
| `.bs-popover-top > .arrow:after` (+auto top) | `border-top-color:var(--modal-content-bg-color)` |
| `.giphy-search` | popover panel: `width:400px; height:700px; border:2px solid var(--modal-content-bg-color); background:#fff; overflow:hidden` |
| `.giphy-search .input-group-text` | `border:none; background:var(--modal-input-group-bg)` |
| `.giphy-search .fa-times` | `font-size:16.5px; padding:10px`; `:hover` cursor+opacity 0.85 |
| `.giphy-header` | `padding:10px; background:var(--modal-content-bg-color)` |
| `.search-results` | `overflow-y:auto; height:100%; padding:5px` |
| `.gif-result` | `text-align:center`; `img` cursor pointer |
| `.giphy-search li` | `padding:10px`; `:hover` bg `var(--modal-upload-files-color)` |
| `.giphy-search h4` | `color:var(--modal-content-color); text-align:center` |
| `#textAreaHolder` | composer wrapper: `background:var(--textarea-bg); border-radius:8px; padding:5px; margin:5px` |
| `.typing-indicator-container` | `margin:4px 16px` |
| `.users-typing` | `color:#90949c; font-size:12px`; `em` font-weight:700 |
| `#textAreaReplyTxt` | reply input: `max-height:300px; width:100%`; bg var(--textarea-bg) |
| `img` | `max-width:100%` |

---

### Component `c698792182` — Alert Q&A modal (→ AlertQaModal)

Reproduces the entire chat-composer/giphy block (same as c1823712792) PLUS the
alert/message rendering. Composer selectors identical to c1823712792 (omitted —
see above). Q&A-specific selectors:

| Selector | Purpose / key props |
|---|---|
| `#alertQAModal .modal-dialog` | `max-width:600px!important; overflow-y:initial!important` |
| `#alertQAModal .modal-body` | `min-height:330px; max-height:70vh; height:100%; overflow-y:auto` |
| `.preText` | `white-space:pre-wrap` (preserve alert formatting) |
| `#textAreaTxt`, `#textAreaQATxt` | `max-height:300px; width:100%`; bg var(--textarea-bg) |
| `.admin-alert` | alert card: `border:1px solid #444; border-radius:5px; padding:5px` |
| `.avatar` | `display:inline`; `.avatar img` → `width:100%; max-width:50px; height:auto` |
| `.username` | `font-size:14px; color:#ccc; font-weight:900` |
| `.created-at` | `font-size:12px; font-style:italic; color:#ccc; overflow:hidden; font-weight:600` |
| `.msg-left` | `text-align:left` |
| `.text-formated` | message body `font-size:16px` |
| `.chatNameAvatar` | `display:inline` |

---

### Component `c170421237` — Muted-users modal (→ MutedUsersModal)

| Selector | Props |
|---|---|
| `.modal-dialog` | `overflow-y:initial!important` |
| `.modal-body` | `max-height:79vh; overflow-y:auto; height:100%` |
| `.list-group-item` | `background:inherit; color:#f1f1f1`; `:hover` bg `#353535` |
| `.fw-bold` | `text-overflow:ellipsis; overflow:hidden; white-space:nowrap`; `img` 30×30px |

---

### Component `c3991339994` — Followed-users modal (→ FollowedUsersModal)

Same shape as c170421237 but with a blue accent (follow theme).

| Selector | Props |
|---|---|
| `#followedUsersModal` | `z-index:1054!important` (stacks above other modals) |
| `.modal-dialog` | `overflow-y:initial!important` |
| `.modal-body` | `max-height:79vh; overflow-y:auto; height:100%` |
| `.list-group-item` | `background:inherit; color:#f1f1f1; border-color:#97cef0` (light blue); `:hover` bg `#164663` (dark blue) |
| `.fw-bold` | ellipsis truncation; `img` 30×30px |

---

### Component `c1065544020` — Floating webcams holder over screenshare (→ WebcamHolder)

| Selector | Props |
|---|---|
| `.webcamsHolderScreen` | `width:350px; height:260px; position:fixed; bottom:0; right:0; z-index:100; border:1px solid #fafafa; cursor:move; background:#000; display:none` (draggable PiP, hidden by default) |
| `.webcamsHolderScreen .card-body` | `padding:0; width:100%; height:100%` |
| `.webcamsHolderScreen .card-title` | `padding:5px; font-size:12px`; nested `button` font 12px; `.float-right:hover` cursor pointer |
| `.pNameLabel` | presenter name overlay: `position:relative; background:#00000080; color:#fff; text-align:center` |
| `.webcamPreviewScreen` | `object-fit:contain; width:100%; max-height:calc(100% - 42px); padding:3px` |
| `.hidden` | `display:none` |

---

### Component `c3658149680` — Recordings holder over screenshare (truncated at line 2460)

| `.recsHolderScreen` | `width:350px; height:260px; position:fixed; …` (mirrors webcams holder; full def beyond this slice) |

---

## 3. Layout / structure & responsive hints (this slice)

- **40px title-bar convention**: poll panel body uses `calc(100% - 40px)` → the
  draggable titlebar is treated as 40px tall.
- **42px label reserve** on webcam PiP (`max-height:calc(100% - 42px)`).
- **Draggable elements** signaled by `cursor:move` + `user-select:none`:
  `.poll-panel-titlebar`, `.webcamsHolderScreen`, `.recsHolderScreen`,
  `.room-split-dir` (reversible split).
- **Floating PiP panels** are `position:fixed; bottom:0; right:0; z-index:100`,
  `350×260px`, `display:none` until activated.
- **Modal width ladder**: AV/alert (default), user/poll/alertQA `600px`,
  user-settings/youtube `700px`, log modals `1000px`. Settings modal shrinks
  responsively (`60%`/`50%` at 750/500px).
- **Modal body scroll convention**: `.modal-dialog{overflow-y:initial!important}`
  + `.modal-body{overflow-y:auto; max-height:70–79vh}` (sticky header/footer,
  scrolling body) — used by alertQA, muted, followed modals.
- **Modal stacking**: followed-users modal `z-index:1054` (sits above a 1050-ish
  base modal — i.e. it can open ON TOP of another modal).
- **Customization-control box**: every color-picker / size hook is a uniform
  `45×20px` input → render as a tight inline swatch+field grid.

---

## Component → pro-room counterpart map

| Angular component (cNNN) | Purpose | Likely pro-room file |
|---|---|---|
| c977335924 | room top nav / recording / mod banner | `RoomTopNav.svelte`, `Nav.svelte`, `PresenceBar.svelte` |
| c1441935951 | user modal + chat-stars + follow-chat colors | `MembersPanel.svelte` user modal, settings appearance |
| c124836360 | user-settings (chat/alert/presenter colors+sizes) | `routes/settings/+page.svelte` appearance tab |
| c3443900831 | alert modal | `AlertFeed.svelte` alert composer / Modal |
| c3558549984 | **poll panel** | `PollPanel.svelte`, `PollModal.svelte` |
| c330848937 | alert logs | `modals/AlertLogsModal.svelte` |
| c86010747 | chat logs | `modals/ChatLogsModal.svelte` |
| c3707659089 | session control | admin session/recording modal |
| c1823712792 | chat composer + giphy | `ChatPanel.svelte` composer |
| c698792182 | alert Q&A | `AlertQaModal.svelte` |
| c170421237 | muted users | `modals/MutedUsersModal.svelte` |
| c3991339994 | followed users | `modals/FollowedUsersModal.svelte` |
| c1065544020 | floating webcams PiP | `WebcamHolder.svelte` |
| c286619529 | AV settings | `modals/ConnectivityCheckModal.svelte` |
| c1011176350 | YouTube player modal | MainStage / ScreenStage YouTube modal |
