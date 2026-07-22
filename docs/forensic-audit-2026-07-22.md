# Forensic reference-parity audit + fix pass — 2026-07-22

**Method:** 10 parallel forensic agents (8 per-surface vs `evidence-folder/report.md`,
1 presenter-capture reconstruction over `docs/reference/captures/proroom-full-presenter.json`
+ `script-results/`, 1 function-parity matrix over the whole evidence tree). Every claim
below is evidence-cited; conflicts resolved by the rendered-capture-wins rule.
**Gates:** svelte-check 0 errors / 0 warnings (602 files), ESLint clean, autofixer clean per
file, live Playwright screenshot of the room at 1989×1166 verified.

## Root-cause finding

The shipped palette was captured from the WRONG source (`chat.protradingroom.com`
Bootswatch-Darkly: black nav, teal `#00bc8c` accent). The admin-room capture of the real
trading room is NAVY chrome: nav `#0c2434` (report.md:105,330), gutters/headers `#0a6db1`
(:150,:1257), stage `#0f2e43` (:135-137), accent/active `#45a2ff` (:211,2454,2601),
username blue `#0a6db1` (:2845,2055). ~40 findings traced back to this single divergence.
**Exception (kept):** modal chrome IS Darkly gray — the spec's own verified correction block
(report.md:1526-1540) marks the navy `--modal-*` values as an error; our tokens already
matched. Modal *tabs* are the measured `#45a2ff`/white pill (targeted.json node 33, :1589).

## Fixed (by surface, all evidence-cited in code comments)

- **Tokens** (`layout.css`, `theme.svelte.ts`): `--accent` → `#45a2ff`; new reference tokens
  (`--navbar-bg #0c2434`, `--sidebar-menu-bg #103d5c`, `--split-gutter-bg #0a6db1`,
  `--presenter-area-bg #0f2e43`, `--notes-tabs-bg #0c2434`, `--tab-active-bg #45a2ff`,
  `--tabs-border-color #0a6db1`, `--darker-black #111`, file/note/sidebar token sets);
  `--content-header-bg #0a6db1`/`#fff`; `--content-meta #a8a8a8`; `--content-border #e1e1e1`;
  `--username-color #0a6db1`; `--content-bg-adm #f4f4f4`; body line-height 1.5.
  Theme localStorage key bumped to `ptr.theme.tokens.v2` so stale teal palettes can't
  override the corrected defaults.
- **Shell/splits:** gutters `#0a6db1` both axes; angular-split sizing model
  (`flex-shrink:0` + `calc(% − gutter share)`); pane `overflow:hidden auto`; corrected
  `aria-orientation` both gutters; `aria-valuetext`; dbl-click snap; keyboard-operable
  vertical gutter; seeds 21.2364/78.7636; inner fraction 0.806; minsize 0; wrapper `#111`
  + `#ccc`; audio-unblock + LiveKit notice made overlays (split keeps the full band).
- **Top nav:** bg `#0c2434`; pill `#103d5c` 27px lh + `#eee` hover; volume/reload 32px fa-2x;
  mic 16px; brand = `a.navbar-brand` (pad 5px 0, ml 4px, mr auto) with `max-width:200/max-height:40`
  logo; users pill 4px margins + pointer; talking 16px + working ellipsis + 22×25 waveform;
  **idle "( No one is speaking )" rendered** (presenter capture, rect 1713,4,167,41);
  `[ REC ]` `#45a2ff` + blink, **wired** to the recording state (was dead); volume panel =
  captured open dropdown (160px, dropstart-left, 24px title/close, `#0d6efd` slider,
  reference input names `alert-donot-disturb` …, `#45a2ff` divider, 16px `#ccc` rows);
  z-index 1030.
- **Stage:** panel `#0f2e43`; strips `#0c2434`; active tabs/pills `#45a2ff`+white everywhere;
  Notes-tab active `#0c2434` special-case restored; hover borders `#0a6db1`; Streams
  placeholder at nth-child(2); fullscreen = `fa-expand`; zoom cluster un-dims on hover;
  **per-screen cog is a live dropdown** with the captured "Detach Screen to a new window"
  (opens the track in a new window); notes text `#676767`, `#f4f4f4` toolbar, `#bb352a`
  delete; files = light striped list (`#fff`/`#f4f4f4`), names `#0a6db1`, white searchbar,
  white 12px refresh, weight-300 tabs, **hidden `#mp3player` sink + click-to-play Sounds**.
- **Alerts/chat:** headers `#0a6db1`/white; active chat tab `#45a2ff`/white, 6px tab gap;
  **inline alert composer removed** (reference posts only via the modal); leading symbol
  renders as `stockColor` ticker (700/13/uppercase, no italic); alert rows `0 0 4px`,
  chat rows `2px 0 4px`; avatars 35×35 square, always author identity (image moved into
  body); body indent 58px; title 18.75px; 12px header gaps + `title=` tooltips; timestamps
  `#a8a8a8`; kebab `#0a6db1`; menus 160px/z-1000/shadowless; date separators clickable;
  images capped 300×200 with an **in-app lightbox** (replaces new-tab); reactions =
  transparent 700-12 `#676767` badges + bare 12px regular smile; composer icons 16px,
  5px padding, GIF label 300; chat gear = dropdown; **GIF picker built** (GIPHY-backed,
  enabled the moment `PUBLIC_GIPHY_KEY` is set).
- **Sidebar:** weight 700 rows; `#45a2ff` accents; 1px white row separators; borderless
  block items; hr+ticks inside the info block; close × removed; site link a real anchor;
  ticks gated on live chat/media connection; Archives = toggled dropdown
  (`#0e3651`/`#45a2ff`, text-only items, caret); **roster toolbar live**: search input,
  alpha-sort, reload (resync), cog dropdown with the captured "Sort by Trials" item
  (disabled pending a role field on presence); roster header toggles; 27px buttons;
  reference title casing; circular roster avatars (`--rosterImg-border-radius:50%`);
  roster fills the drawer.
- **Modals:** z 1054/1055; 500px default; 6px radius; the single reference shadow
  `0 4px 20px`; fade; borderless white ✕; centered-footer variant; Settings tabs =
  measured `#45a2ff` pill (8px 16px, 16px), footer Close=secondary + Save=outline-light +
  Reset=outline-danger, `app-color-theme` radio name, **37 form inputs got id/name**
  (reference names where captured); UserInfo tabs `#45a2ff`; MutedUsers undefined-token
  fix (`--modal-danger`); Q&A dialog reskinned to modal chrome; Debug Log = `size="lg"`;
  **Offline modal** replaces the connection-lost banner (title + centered Close).
- **Webcams:** `webcamsHolder-`/`webcamVideo-` ids; ✕ on every tile (local stops the cam,
  remote hides per-viewer); ✕ nested in the name bar; camera-off initials placeholder;
  flex-column card; 16px/24px font; video `position:relative`; no name truncation;
  ✕ inherits `cursor:move`; dead empty-state removed.
- **Presenter functions:** REC indicator wired; `.mic-gear-btn` added (opens AV settings);
  share menu = the evidenced white 350px `.screen-options-start-screen` picker;
  **floating local screen-share preview card built** (`app-screenshare-preview`, 350×260,
  draggable, source dropdown + ✕); RecPreview chrome matched ("Recording Preview.
  (DELAYED UPTO 20s)", fa-expand/fa-times, tri-state dot); **CC overlay history mode**
  (22px lines, 60px timestamps, hover-revealed 28px round close/history buttons, `#000c`).
- **Icons:** Font Awesome pinned back to **5.8.1** (was drifted to 7.3.1); all 92 used
  glyph names validated against the 5.8.1 css.
- **Branding:** TrickTrades logo (`/cropped-logo3-350x350.jpg`) + name "Trick Trades" as
  the app default (brand.ts), used in top nav, global nav, page `<title>` and favicon.
  DB branding row is empty so defaults govern; the admin Branding modal can override.

## Honest gaps (no capture evidence exists — cannot be matched without a re-capture)

1. **The 14 broadcast-control slots' exact icons/order/titles** — every capture (member AND
   presenter) was taken idle; only the `<!---->` placeholders + CSS hooks exist. Ours renders
   in the exact placeholder position with the evidenced bare `#abb0b5` nav-link styling.
   → Run `docs/pixel-capture-fullstates.js` on the live reference **while broadcasting** to close.
2. **Server-side recording pipeline** — reference records server-side with a ≤20s-delayed
   preview; ours is a client-side MediaRecorder (download / save-to-room). Needs LiveKit
   Egress + a `/record` endpoint (backend project).
3. **Transcript History** — needs caption persistence (a `captions` table); item present but
   disabled with an honest tooltip.
4. **"Sort by Trials"** — menu item present (captured label) but disabled: presence carries
   no role/trial field yet.
5. Session Control modal body, share-picker item list beyond the two captured labels,
   file-row template, mobile-app in-room behavior — bodies were empty/uncaptured in every
   snapshot; ours are documented supersets.
6. Intra-spec conflicts logged, resolved by rendered-capture-wins: files badge coral
   rgb(231,76,60) (matchedRule !important) vs `#dc3545` (§09-E) — kept coral; REC #fff (§08)
   vs `#45a2ff` (measured §02/§11) — used `#45a2ff`; §06 "no kebab" vs §08's 124 kebabs —
   kept kebabs; Lato-vs-Open-Sans (§04 note) — kept Open Sans (23,265 captured uses, §01).

## Deliberate divergences (kept, documented in code)

Webcam transform-drag instead of absolute+left/top (equivalent, more robust); in-flow
sidebar rail (open-state reflow matches report.md:481); Go-live button, member CRUD drawer,
unread pills, reaction "mine" tint, media-for-all superset — our features, no reference
counterpart; muted/playsinline on videos (autoplay policy).
