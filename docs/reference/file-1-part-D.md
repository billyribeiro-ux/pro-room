# file-1.html — Design Spec Part D (lines 3691–4927, to end of file)

Source: `files/file-1.html`. This is the final run of Angular component scoped
`<style>` blocks plus the closing `</head>`. Angular `[_ngcontent-ng-cNNNN]`
attribute scoping has been stripped — real selectors are the class/id/element.

The slice ends at `</head>` (line 4927). **No `<body>`, `<app-root>`, or HTML
markup appears in this range** — only `<style>` blocks. The DOM/template lives
outside this slice.

---

## 1. Theme tokens (CSS custom properties)

No `:root` / token *definitions* appear in this slice (they live earlier in the
file). This slice only *consumes* tokens. Tokens referenced here (for cross-ref):

`--msgs-header-bg`, `--msgs-header-color`, `--chat-header-bg`,
`--chat-header-color`, `--chat-bg`, `--msgs-bg`, `--msgs-bg-adm`,
`--msg-border-color`, `--msg-color`, `--username-color`, `--date-color`,
`--msgs-separator-bg`, `--msgs-separator-color`, `--textarea-bg`,
`--textarea-color`, `--textarea-holder-btns-color`,
`--textarea-holder-btns-hover-color`, `--dark-gray`, `--darker-gray`,
`--light-gray`, `--lighter-gray`, `--dark-black`, `--darker-black`,
`--light-black`, `--white`, `--yellow`, `--brown`, `--dark-brown`,
`--light-brown`, `--border-color`, `--modal-content-bg-color`,
`--modal-content-color`, `--modal-input-group-bg`, `--modal-upload-files-color`,
`--modal-active-tab-border-color`, `--modal-active-tab-bg-color`,
`--modal-active-tab-color`.

Hard-coded hex values found in this slice (not tokenized):
`#fff`/`#ffffff`, `#000`, `#9acd32` (unread indicator green), `#f1f2f3`,
`#08668e` (alerts blue / download buttons / table headers), `#0d6efd`
(Bootstrap blue range slider), `#00bc8c` (private-reply green accent),
`#f4f4f4`, `#161515`, `#363f45` (presenter combo bg), `#363f45` border,
`#ff0` / `#ffff00` (giphy hover yellow), `#0a0a0a`, `#f8f9fa`, `#ddd`, `#666`,
`#ccc`, `#90949c` (typing/users-count gray), `#fafafa`, `#000c` (speech overlay
bg, ~80% black), `#00000080` (webcam name label, 50% black),
`#ffffff1a`/`#ffffff4d`/`#ffffff80` (scrollbar track/thumb/hover), `yellowgreen`.

---

## 2. Per-component styles

### Component A — Chat panel / toolbar (`ng-c3761163150`)
Maps to pro-room `ChatPanel.svelte` + `AlertsChatDock.svelte`.

- `.navbar` — `font-size: 12px; padding: 2px`.
- `.chatToolbar`, `.chatHeader` — `background: var(--msgs-header-bg); color: var(--msgs-header-color)`.
- `.chatHeader .dropdown-menu` — same header bg, `border: none; border-radius: 0 0 0 5px`.
- `.roomLog` — `height: 100%; overflow-y: scroll`.
- `.chatDisabled` — `height/min-height: 40px; width: 100%; bg #fff; color #000`.
- `.webinarMode` — `bg #fff; color #000; width: 100%`.
- `.chat-header-nav` — `font-size: 12px; min-height: 30px`.
- `.chatHeader .fas`, `.chat-header-nav .navbar-brand` — `font-size: 16px`.
- `.menu-p-label` — `padding: 5px; font-weight: 100; font-size: 12px`.
- `.chat-header-menu-settings` — reset button: `padding/margin: 0; border: none; border-radius: 0; bg transparent`.
- `.chat-header` — `bg var(--chat-header-bg) !important; color var(--chat-header-color) !important`.
- `.chat` — `bg var(--chat-bg)`.
- `.chat li a`, `.chat .clear-chat-input` — `cursor: pointer`.
- `.list-of-msgs` — `height: calc(100% - 41px); overflow-y: scroll; bg var(--msgs-bg)`. (Key: 41px header offset.)
- `.textAreaBtns` — `padding: 5px; color var(--textarea-holder-btns-color) !important`; hover → `var(--textarea-holder-btns-hover-color) !important; cursor pointer`.
- `.custom-file` — `display: none`.
- `.input-group-text` — `padding/margin: 0`.
- `.textAreaBtnsCol` — `bg var(--textarea-bg) !important; color var(--dark-gray) !important`.
- `.txt-area` — `border-radius: 0; border: 1px solid #ffffff; font-size: 14px; resize: none; color/bg via tokens; outline none; overflow-y auto; padding-left/right 5px`. Focus → `border-color var(--darker-gray); box-shadow 1px 1px 1px var(--darker-gray)`.
- `#form-upload-img .input-group-text`, `.form-control` — `border-radius: 0`.
- `.unreadIndicator` — `text-align center; position relative; top 30px; z-index 10; bg #9acd32`.
- `.white` — `color #fff`.
- `.chat-nav` — `align-items center; flex-wrap nowrap; min-height 40px`.
- `.chatTabs li a` — `font-weight 700; font-size 12px; padding-l/r 5px; margin-right 5px; margin-bottom 0; padding-bottom 5px`.
- `ul.chatTabs` — `margin-bottom 0`.
- `.chatTabs` — `border-color var(--modal-active-tab-border-color) !important`.
- `.chatTabs .nav-link.active` — `border: 1px solid var(--modal-active-tab-border-color) !important; border-bottom none`.
- `.chatTabs .nav-link:hover` — border-color token; cursor pointer.
- Active tab / shown nav-item — `bg var(--modal-active-tab-bg-color) !important; color var(--modal-active-tab-color) !important; cursor default`.
- `.counterBadge` — `top -5px; position relative`.
- `.textAreaBtnSelected` — `bg #f1f2f3`.
- Bootstrap popover top arrow `:after` — `border-top-color var(--modal-content-bg-color)`.
- `.giphy-search` — `width 400px; height 700px; border 2px solid var(--modal-content-bg-color); bg #fff; overflow hidden`. Nested: `.input-group-text` `border none; bg var(--modal-input-group-bg)`; `.fa-times` `font-size 16.5px; padding 10px` (hover cursor + opacity .85); `li` `padding 10px`, hover `bg var(--modal-upload-files-color)`; `h4/h6` `color var(--modal-content-color)`.
- `.giphy-header` — `padding 10px; bg var(--modal-content-bg-color)`.
- `.search-results` — `overflow-y auto; height 100%; padding 5px`.
- `.gif-result` — `text-align center`; nested `img` `cursor pointer`.
- `.giphy-hr` — `color #fff; padding 0; margin 0 0 10px`.
- `#textAreaHolder` — `bg var(--textarea-bg); border-radius 8px; padding 5px; margin 5px`.
- `.typing-indicator-container` — `margin 0 8px; border-top 1px solid #ccc`.
- `.users-count`, `.users-typing` — `color #90949c; font-size 12px`. `.users-typing` adds `white-space nowrap; overflow hidden; text-overflow ellipsis`; nested `em` `font-weight 700`.
- `#textAreaTxt` — `max-height 300px; width 100%; bg var(--textarea-bg)`.
- `img` — `max-width 100%`.

### Component B — message host (`ng-c1936721513`)
- `:host` — `background-color: var(--msgs-bg)`.

### Component C — Webcam wrapper (`ng-c654575438`)
- `.webcam-wrapper` — `position absolute; bottom 0`. → pro-room `WebcamHolder.svelte`.

### Component D — Main presentation / stage area (`ng-c2028866615`)
Maps to pro-room `MainStage.svelte`, `ScreenStage.svelte`, `FilesPanel.svelte`,
`NotesPanel.svelte`, `AlertFeed.svelte`.

- `.mainPresentationAreaHolder` — `display block; width/height 100%; position relative`.
- `#screens`, `#streams`, `#mainTabsContent`, `#notes`, `#notesTabsContent` (+ their `.tab-pane.active`) — `height: 100%`.
- `#files` — `overflow auto; height calc(100% - 40px)`.
- `#streamsTabsContent`, `#screensTabsContent` — `height calc(100% - 82px)` (82px = two stacked toolbars).
- `.h-inherit` — `height inherit`.
- `.zoom-controls-container` — `bg transparent; z-index 10; opacity 0.5; margin-top 4px`.
- `.zoom-controls` — `top -33px; left -33px`.
- `.noteEditBtn` — `position relative; top 10px; right 10px`.
- `.fileDriveImg` — `max-width 200px`.
- `.fileCount` — `font-size 18px`.
- `.screen-options` — `bg var(--white); font-size 16px; color var(--darker-black); width 300px; padding 5px`; `a` `text-decoration none`; `li:hover` `color var(--brown); bg var(--lighter-gray)`.
- `.soundcloud-options`, `.screen-options-start-screen` — same as `.screen-options` (white bg, 16px, 300px, darker-black, 5px).
- `.files-badge` — `margin-top -9px; margin-left 3px`.
- `.screen-presenters span` — `font-size 14px`; `li` `padding-top/bottom 4px`; `i` `vertical-align middle; padding-right 5px`.
- `.screen-presenters-cmb` — `color #fff !important; bg #363f45; border-color #363f45; border-radius 3px`.
- `.presenter-img` — `max-width 20px`.
- `.hidden` — `display none`.
- `.fileDownload` — `width 120px`.
- `.fileName` — `word-break break-all`.
- `.set-alert-sound-btn` — `font-size 12px`.
- `.volumeControl` — `text-align center; color var(--light-gray); bg var(--darker-black); border 1px solid #fafafa`.
- `.volCtrl` — `bg var(--darker-black); height 32px; width 129px`.
- Range input (`-moz-range-progress`) — `bg/border #0d6efd; height 8px; border-radius 3px`; (`-moz-range-thumb`) — `bg/border #0d6efd; height/width 13px`.
- `#dropdownVolume` — `width 31px`; `:after` `display none` (hides caret).
- `.room-sound-options` — `text-align left; padding-left 30px`. Hover on `.video-player-delete-btn` / `.form-check-label` — `opacity .85; cursor pointer`.
- `.room-video-player` — `width/height 100%; object-fit contain; vertical-align top; max-height calc(100vh - 140px)`.
- `.video-player-btns button` — `width 100px; padding 2px 4px; font-size 12px`.
- `#dayTradeAlerts`, `#swingAlerts` — `overflow-y auto; height calc(100% - 40px)`.
- `.day-trade-alert-txt`, `.swing-alert-txt` — `padding-left 5%`.
- `.download-day-trades-btn`, `.download-swing-trades-btn` — `font-size 18px; bg #08668e; padding 3px 11px; color #fff; border-radius 6px; line-height 24px`. Hover (+ alert edit/delete btns) — `opacity .75; cursor pointer`.
- `.day-trade-symbol-container`, `.swing-symbol-container` — `width 100%; max-width 150px; text-align left; display block; margin 0 auto 0 24%`.
- `.day-trade-alert-form`, `.swing-alert-form` — `font-size 12px; max-width 600px`; nested `.input-group-text` `width 105px; font-size 12px`; `.form-control` `font-size 12px`; long/short id inputs `margin-top 3px`.
- Alerts tables (`.table`) — `font-size 12px`; `th/td` `text-align center; vertical-align middle`; `h4` `bg #08668e; color #fff`.
- Alert search inputs `#dayTradeAlert-search`/`#swingAlert-search` + limit containers — `width 100%`; search `max-width 300px`; limit containers `max-width 180px`.
- `.videoPlayerUrl-iframe` — `width 100%; height 90%`.
- `.alert-sender-img`, `.uploaded-alert-image`, `.uploaded-img-preview` — `width auto; height 100%; max-height 30px; object-fit contain`.
- `.remove-image-btn` — `width 36px !important`.
- Various images/labels/long-short hover — `cursor pointer`.
- `.img-fluid` — `max-width 100%; max-height 70vh; display block; margin 0 auto`.

#### Speech-recognition caption overlay (live captions over the stage)
- `.speech-reco-overlay` — `position absolute; bottom/left/right 0; bg #000c (~80% black); padding 12px 20px; z-index 9999; max-height 40vh; overflow-y auto; display flex; flex-direction row; align-items center; justify-content space-between; min-height 48px; gap 12px; pointer-events auto`.
- `.speech-reco-overlay.history-mode` — switches to `flex-direction column; align-items stretch; max-height 60vh; padding 16px 24px; gap 16px`.
- `.speech-reco-overlay.single-line` — `max-height none`.
- `.speech-reco-body` — `flex 1; flex center/flex-start; min-width 0; overflow visible`; in history-mode → column, stretch, gap 12px.
- `.speech-reco-buttons` — `display none` (shown `flex` on overlay hover); `gap 8px; pointer-events auto`. In history-mode aligned flex-end, `order -1`.
- `.speech-reco-history` — `flex column; gap 8px; overflow-y auto; overflow-x hidden; padding-right 8px; max-height 60vh`. Custom webkit scrollbar: `width 8px`, track `#ffffff1a`, thumb `#ffffff4d` (hover `#ffffff80`), radius 4px.
- `.speech-reco-history-line` — `flex; gap 12px; align-items baseline; color #fff; font-size 16px; line-height 1.2`. `.live-entry .speech-reco-history-text` → `font-style italic; opacity .9`.
- `.speech-reco-history-time` — `font-size 14px; opacity .7; flex 0 0 auto; width 60px`.
- `.speech-reco-history-text` — `flex 1 1 auto; word-break break-word`.
- `.speech-reco-close-btn`, `.speech-reco-history-btn` — `bg transparent; border 2px solid #fff; color #fff; width/height 28px; border-radius 50%; flex center; cursor pointer; z-index 10000; transition opacity/transform .2s; font-size 14px; padding 0`. Shown opacity 1 on overlay hover.
- `.speech-reco-text-wrapper` — `flex 1; min-width 0; overflow-y auto; overflow-x hidden; max-height 3.5em; padding-right 8px` (+ same webkit scrollbar styling).
- `.speech-reco-line` — `color #fff; font-size 22px; font-weight 400; line-height 1.4; word-wrap break-word; system font stack; display flex; align-items flex-start; gap 12px`.
- `.speech-reco-icon` — `font-size 18px; opacity .8; flex-shrink 0`.
- `.speech-reco-sender` — `font-weight 600; margin-right 8px`.
- `.speech-reco-text` — `font-weight 400`.
- `.trade-alerts-select` — `font-size 12px; vertical-align bottom`.

### Component E — Webcams holder / draggable (`ng-c4054903792`)
Maps to pro-room `WebcamHolder.svelte` (draggable PiP webcam).
- `.webcamsHolder` — `position absolute; z-index 105; border 1px solid yellowgreen; cursor move; bg #000; width 320px; height 240px; margin 5px` (4:3 PiP).
- `.webcamsHolderVideo` — `object-fit contain; position relative; width/height 100%`.
- `.pNameLabel` — `bg #00000080; color #fff; text-align center; width 100%`.
- `.overlay` — `position absolute; top/left/right 0; z-index 101`.
- `.closeIcon` — `position absolute; right 5px; z-index 102` (hover cursor pointer).

### Component F — Chat message bubble (`ng-c1254915701`)
Maps to pro-room `ChatPanel.svelte` message rows / `AlertFeed.svelte` items.
- `@charset "UTF-8";` declared.
- `.msg-box` — `font-weight 100; font-size 16px; word-wrap normal; text-align inherit; width 100%; bg var(--msgs-bg); border-top 1px solid var(--msg-border-color)`.
- `.msg-box-adm` — admin/highlighted msg: `bg var(--msgs-bg-adm); border-bottom 2px; padding-top 2px`.
- `.private-reply` — `font-size 12px`.
- `.private-reply-message` — `border-left 2px solid #00bc8c; margin-left 10px; margin-bottom 3px; padding 3px 3px 3px 5px` (quoted-reply block).
- `.private-reply-bg-light` — `bg #f4f4f4`; `.private-reply-bg-dark` — `bg #161515`.
- `.avatar` — `display inline`; `.avatar img` — `width/height 35px; object-fit cover`.
- `.username` — `cursor pointer; font-size 14px; color var(--username-color); font-weight 900`.
- `.msg-left`, `.msg-right` — `color var(--msg-color); word-break break-word; float inherit !important`.
- `.msg-right` — `text-align right; margin-right 5px; padding-left 10px`.
- `.msg-left` — `text-align left; margin-left 5px; padding-right 10px`.
- `.presenter-msg-right` — `text-align right !important; margin-right 5px; padding-left 10px`.
- `.presenter-reactions-right` — `text-align right !important; margin-right 50px; display inline-block; width 100%`.
- `.alert-qa` — `font-size 10px; padding 1px 3px` (small Q&A tag → `AlertQaModal`).
- `.created-at` — `font-size 12px; color var(--date-color); overflow hidden; font-weight 600`.
- `.options` — hover-revealed action bar: `display none; opacity 0; position absolute; top 0`. `.options-left` `right 0`; `.options-right` `left 0`. Buttons: `color var(--dark-brown); border 1px solid var(--border-color); padding 2px 8px; min-width 30px; min-height 20px; cursor pointer`; first/last child get rounded outer corners (radius 5px); hover `color var(--dark-black)`; `i` `font-size 16px`.
- `.bubble-box-left:hover .options`, `.bubble-box-right:hover .options` — `display block; z-index 1000; opacity 1`.
- `.smallChatLog` — `font-size 16px; font-weight 200`; `.smallChatLogBkg` `bg var(--light-black)`; `.smallChatLog img` `max-width/height 16px`.
- `.img-container` — `text-align left; cursor pointer; display inline-flex; padding 3px`.
- `.uploaded-img` — `max-width/height 300px`.
- `.imgur-modal` — `text-align center`; `.modal-dialog` `max-width/height 90%`; `img` `width/height inherit; max-width 100%; max-height calc(100vh - 150px)` (lightbox).
- `.preText` — `white-space pre-wrap`.
- `.text-formated` — `font-size 13px`.
- `.chatNameAvatar` — `display inline`.
- `.menuTrigger` — `margin-top 15px`.
- `.menuTriger:after` — `content "\2807"` (vertical ellipsis ⠇); `font-size 20px; color var(--username-color); vertical-align middle; border none; padding-left 5px`.
- `.msgMenu` — `padding-left 5px; font-size 20px; font-weight 600; color var(--username-color) !important`; hover `color var(--light-brown) !important; font-weight 900; cursor pointer`.
- `.chatDPMenu` — `font-size 12px; text-align left`.
- `.chat-stars` — `font-size 8px; vertical-align text-top !important`; `span.chat-stars` `margin-top 2px; margin-left 2px; display inline-block; color var(--username-color)`.
- `.stars-container` — `position relative`; `.stars-icon` `color var(--msg-color)`; `.stars-num` `position absolute; color var(--msgs-bg); left 6px; top 5px; font-size 10px; font-weight 700` (number overlaid on a star badge).
- `a` — `color var(--light-black)`.
- `.separator` — `display flex; align-items center; text-align center; bg var(--msgs-separator-bg) !important`; `.separator a` `color var(--msgs-separator-color) !important; margin 0 auto; font-size 13px` (date/"new messages" divider).
- `.msg-box:hover .chat-reaction-hover` — `display inline-block`; `.chat-reaction-hover` default `display none` (hover-reveal reaction button).

### Component G — Giphy search + note version history (`ng-c4194031869`)
Maps to pro-room `NotesPanel.svelte` (version history) + a giphy picker.
- `.giphy-search` — `padding 5px; width 400px; height 700px; overflow-y auto; border 2px solid #0a0a0a; bg #fff`.
- `.gif-result` — `text-align center`; `img` `cursor pointer`.
- `.giphy-search li:hover` — `bg #ff0; border 2px solid var(--yellow)`.
- `.giphy-search h6` — `color #0a0a0a; text-align center`.
- `img` — `max-width 100%`.
- `.version-history-panel` — `max-height 300px; overflow-y auto; border 1px solid #ddd`.
- `.version-history-panel .card-header` — `bg #f8f9fa; padding .5rem 1rem`.
- `.version-history-panel .version-preview` — `font-size .85em; color #666; max-width 400px; overflow hidden; text-overflow ellipsis; white-space nowrap`.
- `.version-history-panel .list-group-item` — `padding .5rem 1rem`; hover `bg #f8f9fa`.

---

## 3. Responsive design & animations

### `@media` queries

**Stage component (`ng-c2028866615`):**

- **`max-width: 900px`** — Files panel compaction: `.files-options button`, `.files-search .form-control`, `.fileName`, `.fileDownload`, `.fileActions` → `font-size 12px`; `.fileCount` → `height 32px; line-height 23px`.
- **`max-width: 400px`** — `.files-options button` → `padding 5px`; `.soundcloud-options` & `.screen-options-start-screen` → `width 300px !important`.

**Speech-reco caption overlay (`ng-c2028866615`):**

- **`max-width: 1200px`** — `.speech-reco-line` → `font-size 20px`; `.speech-reco-icon` → `font-size 18px`.
- **`max-width: 768px`** — `.speech-reco-overlay` → `padding 12px 16px`; `.speech-reco-line` → `font-size 16px`; `.speech-reco-icon` → `font-size 14px`.
- **`max-width: 480px`** — `.speech-reco-overlay` → `padding 12px; max-height 30vh`; `.speech-reco-line` → `font-size 14px; margin-bottom 8px; gap 8px`; `.speech-reco-icon` → `font-size 12px`.

Breakpoint ladder observed across this slice: **1200 / 900 / 768 / 480 / 400 px**.
Captions scale down progressively (22px → 20 → 16 → 14px) and the overlay
shrinks its max-height (40vh → 30vh) on the smallest screens.

### `@keyframes` / animations

- **`slideInRight`** (chat bubble, `ng-c1254915701`): `0%,40%` → `transform scale(0); transform-origin bottom right`; `40%,to` → `scale(1)` same origin. A pop-in for incoming messages anchored at the bottom-right corner.
- A pulse keyframe `50% { opacity: 0.5 }` tail appears at the very top of the slice (lines 3691–3695) — it is the closing fragment of a keyframe block defined *before* this slice (likely a typing/loading pulse); only the `50%` stop is in range.
- CSS `transition`s (not keyframes): speech-reco buttons `transition: display .2s ease`; close/history buttons `transition: opacity .2s, transform .2s`.

---

## 4. Body / DOM markup

**None present.** The slice contains only `<style>` blocks and terminates with
`</head>` at line 4927. No `<body>`, `<app-root>`, or component templates appear
in this range — they are outside the assigned slice.

---

## 5. Component → pro-room mapping summary

| Angular component (ngcontent id) | Purpose | pro-room counterpart |
|---|---|---|
| `ng-c3761163150` | Chat panel header/toolbar/tabs, textarea, giphy, typing indicator | `ChatPanel.svelte`, `AlertsChatDock.svelte` |
| `ng-c1936721513` | message-list host bg | (host wrapper) |
| `ng-c654575438` | webcam wrapper (absolute, bottom) | `WebcamHolder.svelte` |
| `ng-c2028866615` | main presentation stage: screens/streams/notes/files tabs, zoom, volume, video player, day-trade/swing alerts, speech captions | `MainStage.svelte`, `ScreenStage.svelte`, `FilesPanel.svelte`, `NotesPanel.svelte`, `AlertFeed.svelte` |
| `ng-c4054903792` | draggable webcams PiP (320×240, z-105) | `WebcamHolder.svelte` |
| `ng-c1254915701` | chat message bubble: avatar, username, options bar, reactions, stars, private replies, lightbox | `ChatPanel.svelte` rows, `AlertFeed.svelte`, `AlertQaModal.svelte` |
| `ng-c4194031869` | giphy picker + note version-history panel | `NotesPanel.svelte` |
