# frag-b3 inventory — fragment-pages file13/15/16/17

Corpus: `docs/reference/visual-evidence-deep/fragment-pages/`. All four are the SAME kind of
artifact: a self-contained HTML **evidence viewer** page. Each wraps the full inlined app CSS
(Bootswatch v4.3.1 Darkly-derived, ~440KB minified in a single `<style>` block, lines 7–59)
plus a small evidence header, and then renders exactly ONE isolated Angular component inside
`<div class="evidence-wrap">` starting at line 60. Verified: file is 276 lines total (`wc -l`),
real DOM begins at the `evidence-wrap` div (`grep -n evidence-wrap` → line 60).

CRITICAL SIZING NOTE (applies to all four): the probe markers (`mainTabs`=12, `mainTabset`=12,
`modal-content`=35/36, `noteTabset`=11, `files-tabs`=6, `st-searchbar`=5, `badge-success`=5,
`user-badge-img`=4, `presUser`/`regUser`/`webcamholder`=0, etc.) are **CSS-selector occurrences
inside the inlined `<style>` block, NOT DOM elements.** Proven: `grep -o 'class="[^"]*mainTabs'`
= 0 and `grep -o 'class="[^"]*modal-content'` = 0 in file13 — none appear as class attributes.
Do NOT read the marker counts as "this page contains a roster/chat/tabset." Each page's actual
DOM payload is one modal/panel only.

Header pill `1 app tags` (grepped `evidence-pill">...`) confirms exactly one `<app-*>` component
per file. The `<title>` is just the filename (e.g. `<title>file13.html</title>`) — not a room title.

**Role (all four): n/a — not determinable from the isolated fragment.** The body DOM is a single
detached component; there is no roster/chat/webcam/`msg-box-adm` DOM to key role off. The word
"presenter" appears 4× in file13 but only inside the CSS block (body DOM is the poll modal alone),
so it is not a role signal. By FUNCTION, poll authoring (file13) and session control (file16) are
presenter/admin surfaces; alert-logs (file15) and mobile-app-info (file17) are viewer/universal.

---

# file13.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file13.html.html
- **kind**: html-dom-dump (single isolated Angular component inside an evidence-viewer wrapper)
- **size**: 455812 bytes (~445 KB; ~440 KB of that is the shared inlined CSS block)
- **role**: n/a — isolated `<app-poll-modal>` only; role not derivable from DOM. Functionally a presenter/admin authoring surface.
- **format/quality**: raw DOM + inline attributes (Angular `_ngcontent-*`/`_nghost-*` hydration markers, NO computed styles, NO rects). Not a JSON capture.
- **surfaces documented**: Polls panel / poll-creation modal (`app-poll-modal`)
- **maps to (our components)**: a Poll/Polls modal component (poll authoring + saved-polls list) — clearest reason: DOM ids `pollModalCompHolder`, `pollPanelTitlebar`, `pollQuestionTxt`, `pollChoiceTxt`, `sendpoll`, `sendpolltab`, `savedPolls`, `anonymous-poll`.
- **key findings** (cited):
  1. Root element `<app-poll-modal id="pollModalCompHolder" class="pollModalHolder">` — this is a floating panel, NOT a Bootstrap `.modal.fade` (unlike file15/16/17). It has its own titlebar chrome. (grep `evidence-wrap"><app-poll-modal`; visible text line "id=pollModalCompHolder class=pollModalHolder").
  2. Titlebar `id="pollPanelTitlebar" class="poll-panel-titlebar"` shows text **"Polls"** and three window-chrome buttons with `title="Minimize"` (`fa fa-window-minimize`), `title="Maximize"` (`fa fa-window-maximize`), `title="Close"` (`class="poll-panel-btn poll-panel-btn-close"`). (extracted visible text, NR>=60.)
  3. Two tabs via `id="nav-tab"` / `class="nav-tabs"` with panes `id="sendpolltab"` (compose) and `id="savedPolls"` (saved list); pane container `class="tab-content"` / `tab-pane`. Compose fields: `id="pollQuestionTxt"` and `id="pollChoiceTxt"` with visible labels "Send your poll", "Choices/Answers:", button **"Send Poll"** (`id="sendpoll"`, `btn btn-success`). (grep ids; visible-text scan.)
  4. Anonymous option: `id="anonymous-poll"` / `class="anonymous-poll-container"` with label text **"Anonymous Poll (Does not show ...)"** using `form-check-input`/`form-check-label`. (visible-text scan.)
  5. Header pills: `7 modal ids`, `9 audited gaps` (grep `evidence-pill">`). This is the richest of the four fragments (most sub-structure).
- **notes**: The `poll-panel-*` class family and floating-panel behavior are UNIQUE to this file among the four — best authority for the Poll panel surface. No duplicate of the other three.

---

# file15.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file15.html.html
- **kind**: html-dom-dump (single isolated Angular component in evidence-viewer wrapper)
- **size**: 451110 bytes (~440 KB)
- **role**: n/a — isolated `<app-alert-logs-modal>` only. Functionally a viewer/history surface.
- **format/quality**: raw DOM + inline attributes (Angular hydration markers). No computed styles, no rects.
- **surfaces documented**: Alerts Logs modal (`app-alert-logs-modal`)
- **maps to (our components)**: an Alert-Logs / trade-alert history modal — reason: `id="alerts-logs-modal"`, title text "Alerts Logs", a "Reload Log List" action, and dated `list-group-item` entries.
- **key findings** (cited):
  1. Standard Bootstrap modal shell: `<div id="alerts-logs-modal" role="dialog" aria-labelledby="alerts-logs-modal" aria-hidden="true" class="modal fade">` with `modal-dialog`/`modal-content`/`modal-header`/`modal-body`/`modal-footer`. Close via `class="btn-close btn-close-white"` + `data-bs-dismiss="modal"`. (visible-text scan NR>=60.)
  2. Title text **"Alerts Logs"** (visible-text scan).
  3. Action button **"Reload Log List"** `class="btn btn-primary my-2"` (visible-text scan).
  4. Log entries rendered as `class="list-group-item list-group-item-action ng-star-inserted"`, each with a bold date `<strong class="fw-bold">Oct 22, 2023</strong>` and `<strong class="fw-bold">By:&nbsp;...` author line. Dates seen: **"Oct 15, 2023"** and **"Oct 22, 2023"**. (grep visible date text.)
  5. Header pills: `1 modal ids`, `8 audited gaps` (grep `evidence-pill">`).
- **notes**: `ng-star-inserted` on list items = Angular `*ngFor` structural clone → these are real captured data rows (honest data: dated Oct 2023). Best/only authority for the Alerts-Logs surface among the four.

---

# file16.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file16.html.html
- **kind**: html-dom-dump (single isolated Angular component in evidence-viewer wrapper)
- **size**: 448380 bytes (~438 KB)
- **role**: n/a — isolated `<app-session-control-modal>` only. Functionally a presenter/admin control surface.
- **format/quality**: raw DOM + inline attributes (Angular hydration markers). No computed styles, no rects.
- **surfaces documented**: Session Control modal (`app-session-control-modal`)
- **maps to (our components)**: a Session-Control (admin session/presenter management) modal — reason: `id="session-control-modal"`, `aria-labelledby="session-control"`, title "Session Control".
- **key findings** (cited):
  1. Bootstrap **large** modal: `<div id="session-control-modal" role="dialog" aria-labelledby="session-control" class="modal fade">` → inner `<div role="document" class="modal-dialog modal-lg">`. (`modal-lg` grepped in key-classes; visible-text scan.)
  2. Title `<h5 id="session-control" class="modal-title">` text **"Session Control"** (visible-text scan).
  3. Footer action: single full-width button **"Done"** `class="btn btn-success btn-block"` (`btn-block` in key-classes; visible-text scan). Header close `btn-close btn-close-white` + `data-bs-dismiss="modal"`.
  4. The captured body between title and Done button is sparse in the visible-text extraction (control widgets likely rendered via Angular child components not expanded here) — treat interior controls as an honest gap; only the shell, `modal-lg` sizing, title, and Done button are hard-verified.
  5. Header pills: `2 modal ids`, `6 audited gaps` (grep `evidence-pill">`).
- **notes**: Only `modal-lg` fragment of the four. Only authority for Session Control surface. Interior control list not captured in visible text — flag as gap, do not invent controls.

---

# file17.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file17.html.html
- **kind**: html-dom-dump (single isolated Angular component in evidence-viewer wrapper)
- **size**: 449659 bytes (~439 KB)
- **role**: n/a — isolated `<app-mobile-app-info-modal>` only. Functionally a universal/promotional surface.
- **format/quality**: raw DOM + inline attributes (Angular hydration markers). No computed styles, no rects.
- **surfaces documented**: "Download our mobile apps" modal (`app-mobile-app-info-modal`)
- **maps to (our components)**: a Mobile-App-Info / app-store promo modal — reason: `id="mobileAppInfoModal"`, `aria-labelledby="mobileAppInfoLabel"`, title "Download our mobile apps".
- **key findings** (cited):
  1. Bootstrap modal: `<div id="mobileAppInfoModal" aria-labelledby="mobileAppInfoLabel" aria-hidden="true" class="modal fade">`; title `<h5 id="mobileAppInfoLabel" class="modal-title">` text **"Download our mobile apps"**. (visible-text scan NR>=60.)
  2. Two store links inside `class="d-flex align-items-center justify-content-evenly m-3 mb-4"`, `target="_blank"`:
     - Google Play: `href="https://play.google.com/store/apps/details?id=com.bellesoft.stprotradingroom&hl=en&gl=US"`
     - Apple App Store: `href="https://apps.apple.com/us/app/simpler-trading-mobile/id1278652736"` (grep `href="`).
  3. **BRANDING EVIDENCE / CONFLICT FLAG**: the store links point to **Simpler Trading** (`com.bellesoft.stprotradingroom`, "simpler-trading-mobile") — NOT TrickTrades. This is a hard-cited data point that contradicts the "TrickTrades branding" prose note in MEMORY.md; the reference capture (this raw DOM) wins over prose. Flag for reconciliation.
  4. Header close button `class="btn-close btn-close-white"` + `data-bs-dismiss="modal"`; footer uses `btn-secondary` (key-classes). (visible-text scan.)
  5. Header pills: `1 modal ids`, `7 audited gaps` (grep `evidence-pill">`).
- **notes**: Only authority for the mobile-app-info modal. Simpler-Trading store URLs are the strongest branding datapoint in this batch — surfaces a memory/prose conflict.

---

## Cross-file summary (all four)
- Identical wrapper + identical shared inlined CSS; pairwise `diff` = 323 / 140 / 109 lines only — differences are (a) the filename/title/pill text and (b) the single isolated `<app-*>` component. They are NOT duplicates of each other; each isolates a DISTINCT modal/panel.
- No JSON capture, no computed styles, no rects, no rendered screenshot in any of them — do NOT rely on these for pixel/color/spacing truth; they give DOM structure, ids, classes, ARIA, and visible text only.
- CSS `:root` vars confirm the Darkly-family palette (`--primary:#375a7f`, `--success:#00bc8c`, `--danger:#E74C3C`, `--warning:#F39C12`, Lato font) — shared across all four (head byte-dump). This is CSS-var evidence, applicable to the wrapper, not proof of any specific rendered element in the fragment.
- FontAwesome stylesheet linked via local `file://.../@fortawesome/fontawesome-free/css/all.min.css` (head dump) — icon classes like `fa fa-window-minimize` (file13) resolve from it.
