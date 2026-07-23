# frag-webcam inventory

Assignment slug: `frag-webcam`. Six files under `docs/reference/visual-evidence-deep/fragment-pages/`.

**Corpus format note (all six):** each file is an "evidence-viewer" wrapper page: `<html><head>` with a full inlined copy of the app stylesheet + injected override CSS, then a `<div class="evidence-banner">` header with four `<div class="evidence-pill">` labels (`files/<name>.html`, `N app tags`, `N modal ids`, `N audited gaps`), then a single `<div class="evidence-wrap">` holding the RAW extracted fragment DOM. The captured fragments are **raw Angular DOM** (custom `<app-*>` element tags, `_ngcontent-ng-cNNN` / `_nghost-ng-cNNN` attributes, `ng-star-inserted` classes) with **inline `class`/`id`/attrs but NO computed styles and NO rects**. So kind = `html-dom-dump` (raw DOM + inline styles), NOT a computed-styles/states JSON capture.
**Provenance:** these are fragments of the ORIGINAL Angular source app the project is rebuilding — `pagesource.html.html` shows `<title>PTRChat</title>` and hashed Angular bundles. This is authority (rendered/raw DOM), not prose.
**Encoding caveat (verified):** every file carries embedded NUL bytes (`webcamholder` 117, `odds-and-ends` 119,716). All greps below were run after `tr -d '\0'`; raw-file greps silently return 0 because NULs break line matching. Anyone re-verifying MUST strip NULs first.

---

# webcamholder.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/webcamholder.html.html
- **kind**: html-dom-dump (raw Angular DOM + inline styles/classes)
- **size**: 448,924 bytes (`wc -c`)
- **role**: presenter (surface = presenter webcams; determined from `<app-webcam-holder>` / `<app-presenter-cams>` host tags and `pNameLabel` presenter-name label)
- **format/quality**: raw DOM fragment, inline classes/ids only, no computed styles, no rects. Evidence pills: `files/webcamholder.html`, `2 app tags`, `0 modal ids`, `9 audited gaps`.
- **surfaces documented**: presenter webcam holder / cameras row
- **maps to (our components)**: presenter webcam holder / video tiles component (e.g. WebcamHolder + PresenterCam tile)
- **key findings** (cited):
  - Host chain: `<app-webcam-holder>` → `<div class="webcam-wrapper d-flex justify-content-center flex-wrap align-items-end w-100">` → **two** sibling `<app-presenter-cams>` (two `class="card webcamsHolder" id="webcamsHolder-"` blocks in the fragment markup).
  - Each cam tile = `<video autoplay="autoplay" class="webcamsHolderVideo" id="webcamVideo-">` + `<div class="overlay">` → `<h5 class="pNameLabel m-0">` → `<span class="closeIcon">` → `<i class="fas fa-times">` (cited from fragment dump).
  - The `id` values are placeholder stubs `webcamsHolder-` / `webcamVideo-` (trailing dash, no numeric suffix) → these are **unbound template shells**, no live presenter id attached; `pNameLabel` has no text node.
  - Close control is FontAwesome `fas fa-times` inside `.closeIcon`; layout uses Bootstrap flex utils (`justify-content-center flex-wrap align-items-end`).
- **notes**: Subset of `afterwebcamholder.html.html` (same webcam block) and of `odds-and-ends.html.html` (which also has `app-webcam-holder` x2). Best isolated authority for the webcam-tile-only structure.

---

# afterwebcamholder.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/afterwebcamholder.html.html
- **kind**: html-dom-dump (raw Angular DOM + inline styles/classes)
- **size**: 450,669 bytes (`wc -c`)
- **role**: presenter (webcam block + presentation-area tab strip)
- **format/quality**: raw DOM fragment, inline only, no computed styles/rects. Evidence pills: `files/afterwebcamholder.html`, `1 app tags`, `0 modal ids`, `8 audited gaps`.
- **surfaces documented**: presenter webcams (same as webcamholder) PLUS the presentation-area tab strip (Screens / Notes)
- **maps to (our components)**: presenter webcam holder + presentation-area tabset (Screens/Notes tabs)
- **key findings** (cited):
  - Contains the identical webcam block as `webcamholder` (`webcam-wrapper` → two `<app-presenter-cams>` with `card webcamsHolder#webcamsHolder-`, `video.webcamsHolderVideo#webcamVideo-`, `overlay`, `pNameLabel`, `closeIcon`, `fas fa-times`).
  - Adds the presentation-area tabs: `<a id="screens-tab" class="nav-link active">` with `<i class="fas fa-desktop">` + `<span class="ml-1">` text "Screens".
  - Notes tab: `<li class="nav-item">` → `<a id="notes-tab" class="nav-link presAreaTabs-notes">` → `<i id="noteChangeIndicator" class="fas fa-edit">` + `<span class="mx-1">` text "Notes". Fragment visible text = "Screens Notes Notes".
  - Tab strip uses Bootstrap `nav-item`/`nav-link`; active tab class is literally `active`.
- **notes**: Superset of `webcamholder.html.html` (webcams) + partial overlap with presentation-area surfaces in `odds-and-ends`. Best authority for the Screens/Notes presenter tab strip in isolation.

---

# connected.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/connected.html.html
- **kind**: html-dom-dump (raw Angular DOM + inline styles/classes)
- **size**: 446,860 bytes (`wc -c`)
- **role**: mixed / n-a (connection-status overlay, not role-specific)
- **format/quality**: raw DOM fragment, inline only. Evidence pills: `files/connected.html`, `0 app tags`, `0 modal ids`, `7 audited gaps`.
- **surfaces documented**: connection-status toast/overlay ("Connected" state)
- **maps to (our components)**: connection-status overlay / not-connected banner
- **key findings** (cited):
  - Entire fragment = `<div id="connectedMsg" class="notConnectedOverlay animated fadeIn">` → `<i class="fas fa-check"></i> Conected`.
  - Text is **misspelled in source**: "Conected" (single n) — cite verbatim; do not silently correct when matching.
  - Uses animate.css classes `animated fadeIn` (confirms animate.css dependency; matches `pagesource` head link to animate.css 3.7.2).
  - The connected state reuses the `notConnectedOverlay` class (same overlay element toggled between states), with `fa-check` as the connected glyph.
- **notes**: Smallest content fragment (single div). No app-* tags (`0 app tags` pill).

---

# reload.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/reload.html.html
- **kind**: html-dom-dump (raw Angular DOM + inline styles/classes)
- **size**: 446,997 bytes (`wc -c`)
- **role**: member/mixed (main left-nav item; visible to all roles)
- **format/quality**: raw DOM fragment, inline only. Evidence pills: `files/reload.html`, `0 app tags`, `0 modal ids`, `4 audited gaps`.
- **surfaces documented**: main navigation "Reload" sidebar item
- **maps to (our components)**: main nav rail item (Reload button)
- **key findings** (cited):
  - Fragment = `<li title="Reload" class="nav-item">` → `<a class="nav-link d-flex align-items-center">` → `<i class="fas fa-2x fa-sync"></i>` + `<span class="ml-2 mainNavItem">Reload</span>`.
  - Nav item label class is `mainNavItem`; icon is `fas fa-sync` sized `fa-2x`; the `<li>` carries a `title="Reload"` tooltip.
  - Confirms the main-nav item structure: `li.nav-item > a.nav-link > i.fa + span.mainNavItem`.
- **notes**: Single nav item in isolation. Same `mainNavItem` pattern appears (embedded) in larger dumps; this is the clean authority for one main-nav row.

---

# odds-and-ends.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/odds-and-ends.html.html
- **kind**: html-dom-dump (raw Angular DOM + inline styles/classes) — LARGE
- **size**: 8,747,134 bytes (~8.75 MB) (`wc -c`); 119,716 NUL bytes. Inspected by structure only, not read whole.
- **role**: mixed — member + presenter/admin surfaces together (grab-bag superset). Determined by presence of member chat (`app-st-message` x102), presenter webcams (`app-webcam-holder`), roster, and admin/moderation modals (`app-session-control-modal`, `app-scheduled-alerts-modal`, `app-alert-send-report-modal`).
- **format/quality**: raw DOM fragment; inline classes/ids; no computed styles/rects. Evidence pills: `files/odds-and-ends.html`, `36 app tags`, `63 modal ids`, `18 audited gaps`.
- **surfaces documented**: chat messages, message context menu, user dropdown, replies, alert Q&A, trade-color links, room roster, notes, files, volume control, search bar, presentation area, webcams, and ~24 modals.
- **maps to (our components)**: nearly the whole app — chat message list/item, message menu, users dropdown, reply modal, alert Q&A, roster, notes tabset, files tabset, volume control, search bar, presentation area, webcam holder, and the modal family (session control, poll, followed/muted users, av-settings, user-settings, user-info, chat-logs, debug-log, scheduled-alerts, etc.).
- **key findings** (cited, all via cleaned-file `grep`):
  - Rendered chat is heavy: `app-st-message` x204 tags (~102 messages), `msg-box` x105, `msgMenu` x108, `users-dropdown-options` x106, `alert-qa` x105, `created-at` x107, `tradeColor` x28, `flex-row-reverse` x3. Class-freq confirms rows like `msg-box pb-1 ng-star-inserted` (102), `created-at mr-2` (103), `btn btn-sm btn-secondary me-1 alert-qa ng-star-inserted` (102).
  - **Badge authority check:** `class="user-badge-img"` as a RENDERED element = **0** in this file; all 4 `user-badge-img` hits are inside CSS rules (e.g. `.user-badge-img{width:auto;height:100%;max-height:20px}`). `badge-success` x7 (also CSS). `Add Reaction` text = 0. So THIS file does not itself render badge `<img>` elements — the "real badge = `<img class="user-badge-img">`" fact must be sourced from a capture that actually renders them, not here. No "New"/"Trial" text badge present.
  - Modal-rich: pill says `63 modal ids`; distinct `id="*modal*"` includes `replyModal`, `alertQAModal`, `av-settings-modal`, `user-settings-modal`, `session-control-modal`, `followedUsersModal`, `mutedUsersModal`, `scheduledAlertsModal`, `play-youtube-modal`, `chat-logs-modal`, `debug-log-modal`, `webrtc-troubleshooter-modal`, `all-user-pm-modal`, `rteModal`, `alert-filter-modal`, `alert-send-report-modal`, `alerts-advanced-search-modal`, `alerts-logs-modal`, `mobileAppInfoModal`, `user-modal`, `pollModalCompHolder`. Class-freq: `modal-content` x24, `modal fade` x22, `modal-dialog` x20.
  - Roster + peripheral surfaces present: `room-roster` x5, `rosterImg` x5, `presUser` x3, `regUser` x3, `volumeControl` x8, `st-searchbar` x9, `noteTabset` x13, `noteDownload` x14, `files-tabs` x8, `files-badge` x7, `presentation-box` x3, `alertHeader` x4, `chatHeader` x5, `app-alerts` x8.
- **notes**: **Superset / best breadth authority** for the whole DOM in one file, but NOT best authority for badge rendering (badge classes are CSS-only here) and it carries no computed styles/rects (use JSON captures for spacing/colors). Any single surface is better isolated in a dedicated fragment where one exists.

---

# pagesource.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/pagesource.html.html
- **kind**: html-dom-dump — the ORIGINAL app `index.html` boot document (raw)
- **size**: 471,362 bytes (`wc -c`)
- **role**: n/a (app shell / boot manifest, pre-role)
- **format/quality**: raw source of the Angular app's index page, captured inside the evidence-wrap. Evidence pills: `files/pagesource.html`, `1 app tags`, `0 modal ids`, `13 audited gaps`.
- **surfaces documented**: app shell — `<head>` links/scripts, `<app-root>`, image-modal bootstrap script
- **maps to (our components)**: app root / global head (fonts, FA, animate.css), build/bundle manifest, favicon, base href
- **key findings** (cited from fragment markup):
  - Confirms original app identity: `<title>PTRChat</title>`, `<html lang="en" data-critters-container>`, body mounts `<app-root>`.
  - Base href: active `<base href="/" />` with a commented `<!-- <base href="/v4" /> -->` (both present) — evidence the app was served under `/v4` at some point.
  - Third-party CSS: FontAwesome pinned **v5.8.1** via `https://use.fontawesome.com/releases/v5.8.1/css/all.css` with `integrity="sha384-50oBUHEmvpQ+1lW4y57P..."`; plus `animate.css 3.7.2` from cdnjs. (Matches memory note "FA pinned 5.8.1" and the animate.css `fadeIn` seen in `connected`.)
  - Angular hashed bundles: `runtime.b70e5d3ff558bfdf.js`, `polyfills.7c2840b8c995960c.js`, `scripts.38973a242454fb27.js` (defer), `main.8da481200669d5d8.js` (module); stylesheet `styles.0d26360b9b3e223c.css` (loaded via print/onload swap pattern). Viewport meta includes `target-densitydpi=device-dpi`. Inline `openImageModal(event, url)` script bootstraps a click-to-open image modal (shift/alt/ctrl → new window).
- **notes**: **Best authority for the global boot/head config** (FA version, animate.css, fonts, base href, bundle manifest, app title). Not a UI-surface capture — has no room DOM beyond `<app-root>`.
