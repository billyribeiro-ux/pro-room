# frag-b7 — fragment-pages file30–file34 inventory

**Corpus location:** `docs/reference/visual-evidence-deep/fragment-pages/`

## Corpus-wide finding (applies to all 5 files) — READ FIRST

All five are the **same page template**: a Bootswatch **Darkly v4.3.1** shell (`@import Lato`, `/*! Bootswatch v4.3.1 */` at head start) with the entire app stylesheet inlined (~440 KB of `<style>`), then a tiny `<body>` containing an **evidence banner** + a single isolated Angular component fragment inside `<div class="evidence-wrap">`.

Cited by: `head -c 400` shows `<link ... fontawesome-free/css/all.min.css>` + `Bootswatch v4.3.1`; `<body class="darkTheme lightTheme">` on all 5 (grepped).

**CRITICAL EVIDENCE CAVEAT — the marker grep is misleading here.** Whole-file `grep` counts (mainTabs=12, room-roster, st-searchbar=5, noteTabset=11, files-tabs=6, modal-content=36, user-badge-img=4, badge-success=5, etc.) are **near-identical across all 5 files because they match the shared inlined CSS, NOT rendered DOM.** Splitting each file at the last `</style>` and counting only the DOM portion: for file30 `mainTabs=0, room-roster=0, st-searchbar=0, user-badge-img=0, modal-content=1`. **The real captured DOM per file is 477 B – 5.5 KB.** Do NOT treat these files as full-room captures; each isolates ONE component. Rendered capture wins over the CSS-inflated grep.

These are **html-dom-dump** (raw DOM + inline styles), NOT json-capture — there are no `states`/`groups`/rects/computed-style objects.

---

# file30.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file30.html.html
- **kind**: html-dom-dump
- **size**: 451,843 bytes (~441 KB; ~5.5 KB is real DOM, rest is inlined Darkly CSS)
- **role**: role-neutral shared component (corpus is member-sourced per project memory; nothing in this fragment is role-gated — determined from fragment content, no admin/presenter markers)
- **format/quality**: raw DOM + inline styles; Bootswatch Darkly shell. No computed styles / rects.
- **surfaces documented**: Connectivity/Mic (WebRTC) Troubleshooter modal
- **maps to (our components)**: a `WebrtcTroubleshooterModal` / connectivity-diagnostics dialog (reason: sole DOM component is `<app-webrtc-troubleshooter>` with `id="webrtc-troubleshooter-modal"`, `role="dialog"`, `max-width:540px`)
- **key findings** (cited):
  1. Evidence-wrap component = `<div class="evidence-wrap"><app-webrtc-troubleshooter …>` (grep). Banner pills: `1 app tags`, `1 modal ids`, `9 audited gaps`.
  2. Modal id `webrtc-troubleshooter-modal`; `class="modal-content"` inside `modal-dialog` `style="max-width: 540px"` (diff/perl extract).
  3. Visible text (DOM only): "Connectivity/Mic Troubleshooter / This tool checks your network and connectivity to essential WebRTC servers. / UDP Enabled ● / TCP Enabled ● / STUN Server Connectivity ● / TURN Server Connectivity ● / Start Test / Copy Results / Close" (perl strip-tags).
  4. Four diagnostic rows (UDP, TCP, STUN, TURN) each with a status bullet ●; action buttons Start Test, Copy Results, Close.
- **notes**: Best (and only) authority in this batch for the WebRTC troubleshooter surface. modal-content grep=36 whole-file but =1 in DOM — CSS inflation.

# file31.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file31.html.html
- **kind**: html-dom-dump
- **size**: 448,909 bytes (~2.6 KB real DOM)
- **role**: role-neutral shared component (member-sourced corpus; no role markers in fragment)
- **format/quality**: raw DOM + inline styles; Darkly shell. No computed styles/rects.
- **surfaces documented**: Rich Text Editor modal (message composer)
- **maps to (our components)**: a `RichTextEditorModal` / message-compose dialog (reason: DOM component `<app-rich-text-editor>`, `id="rteModal"`, label `id="rteLabel"`, contains `id="msgTxtContainer"`)
- **key findings** (cited):
  1. Evidence-wrap = `<app-rich-text-editor …>`; banner pills `1 app tags`, `2 modal ids`, `9 audited gaps` (grep).
  2. IDs present in DOM: `rteModal`, `rteLabel`, `msgTxtContainer` (perl id scan).
  3. Modal class chain: `modal fade > modal-dialog > modal-content > modal-header(modal-title) / modal-body / modal-footer` with footer `d-flex justify-content-between w-100 align-items-center` (class scan).
  4. Buttons: `btn btn-secondary` ("Close") + `btn btn-primary` ("Send"); close uses `btn-close btn-close-white` (Bootstrap 5 close style). Title text "Rich Text Editor".
- **notes**: Only authority for the RTE compose modal in this batch. Note `btn-close-white` (BS5) vs Darkly is BS4 — mixed Bootstrap versions in DOM markup.

# file32.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file32.html.html
- **kind**: html-dom-dump
- **size**: 448,985 bytes (~2.7 KB real DOM)
- **role**: role-neutral shared component (member-sourced corpus)
- **format/quality**: raw DOM + inline styles; Darkly shell.
- **surfaces documented**: Private chat (PM) panel — empty/idle state
- **maps to (our components)**: a `PrivateChat` / PM panel component (reason: DOM component `<app-privchat id="privaChatCompHolder" class="privChatHolder">`)
- **key findings** (cited):
  1. Evidence-wrap = `<app-privchat …>`; banner pills `1 app tags`, `0 modal ids`, `9 audited gaps`.
  2. Structure: `.chat.d-flex.flex-column.h-100` (style `overflow-y:hidden`) > `.bs-component` > `<nav class="navbar navbar-expand-lg navbar-light bg-light chat-nav-pm p-1 text-white">` (class scan).
  3. Nav brand icon `<i class="fas fa-comments">`; header controls `fas fa-cog chat-header-gear` (settings dropdown) and `fas fa-times` (close); body `d-flex h-100 pc-body`.
  4. Empty-state text: "No active chat" inside `flex-fill p-3 text-center` (perl strip-tags). This is the idle PM panel, no conversation loaded.
- **notes**: Captures the PM chrome (gear + close + comments brand) and its empty state. Only authority for `chat-nav-pm` / `pc-body` in this batch.

# file33.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file33.html.html
- **kind**: html-dom-dump
- **size**: 446,800 bytes (~0.2 KB real DOM)
- **role**: n/a (framework overlay, no role)
- **format/quality**: raw DOM + inline styles; Darkly shell.
- **surfaces documented**: Toast/notification overlay container (ngx-toastr)
- **maps to (our components)**: global toast host / notification portal (reason: `<div class="overlay-container" aria-live="polite"><div id="toast-container" class="toast-top-right toast-container">`)
- **key findings** (cited):
  1. Evidence-wrap = plain `<div class="overlay-container" aria-live="polite">` (banner pills `0 app tags`, `0 modal ids`, `1 audited gaps`).
  2. Contains empty `<div id="toast-container" class="toast-top-right toast-container">` — ngx-toastr mount point, top-right position.
  3. `aria-live="polite"` on the overlay (accessibility for toast announcements).
- **notes**: Thinnest fragment except file34. No app-tag component; pure framework overlay. Empty (no active toasts captured) — honest gap: no toast styling/content to compare.

# file34.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file34.html.html
- **kind**: html-dom-dump
- **size**: 446,773 bytes (~0.48 KB real DOM — smallest)
- **role**: n/a (hidden media element)
- **format/quality**: raw DOM + inline styles; Darkly shell.
- **surfaces documented**: Hidden webcam audio element
- **maps to (our components)**: media/webcam audio sink (reason: sole DOM node `<audio autoplay="autoplay" hidden="true" id="webcam"></audio>`)
- **key findings** (cited):
  1. Evidence-wrap = `<audio autoplay="autoplay" hidden="true" id="webcam"></audio>` (banner pills `0 app tags`, `0 modal ids`, `2 audited gaps`).
  2. Element is `hidden` and `autoplay` — an off-screen audio playback sink (id "webcam"), not a visible surface.
- **notes**: No visible UI to compare — this is plumbing (media element). Honest gap: nothing renderable. Documents that the app has a hidden `#webcam` audio sink.

---

## Cross-file summary
- All 5 = per-component evidence fragment pages (same Darkly shell, one `evidence-wrap` component each). MD5s all differ (distinct files).
- Distinguishing DOM component per file: **file30** app-webrtc-troubleshooter (Connectivity/Mic modal) · **file31** app-rich-text-editor (rteModal composer) · **file32** app-privchat (PM panel, "No active chat") · **file33** overlay-container (toast host) · **file34** audio#webcam (hidden sink).
- No json-capture, no computed styles/rects, no admin/presenter role markers in any fragment. Marker-grep totals are CSS-driven, not DOM — comparators must split at `</style>` before trusting counts.
