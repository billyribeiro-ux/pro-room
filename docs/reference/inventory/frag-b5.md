# frag-b5 — fragment-pages inventory (file22–file25)

**Assignment slug:** frag-b5
**Corpus dir:** `docs/reference/visual-evidence-deep/fragment-pages/`

## Shared structure (verified once, applies to all 4)

All four files share an identical wrapper:
- `<!doctype html>` → `<head>` with `<link ... fontawesome-free/css/all.min.css>` (`file://` local path) and one massive `<style>` block = `@import Lato` + **Bootswatch v4.3.1** ("Copyright 2012-2019") + custom room CSS.
- **The ~446KB of each file is that shared `<head>` stylesheet.** The real DOM `<body>` is only ~3KB. Verified: in file22 `</style>` ends at byte offset **446288** and `<body>` starts at **446305** (file is 449318 bytes).
- CRITICAL for marker counts: the Phase-1 probe markers (`mainTabs=12`, `modal-content=35`, `noteTabset=11`, `files-tabs=6`, `user-badge-img=4`, `badge-success=5`, `created-at=2`, `tradeColor=2`, etc.) are **CSS selector occurrences inside the shared stylesheet, NOT DOM elements.** Verified: extracting only the post-`</style>` body (`/tmp/f22body.html`, 3022 bytes) gives `mainTabs`, `modal-content`, `files-tabs`, `user-badge-img`, `created-at`, `tradeColor`, `msgMenu` all = **0** in-body. Do not read these marker counts as evidence of those surfaces being present in these fragments.
- `<body class="darkTheme lightTheme">` then a `<div class="evidence-banner">` (filename + `evidence-pill`s) then one `<div class="evidence-wrap">` holding **exactly one Angular component** (production build: `_ngcontent-ng-*` / `_nghost-ng-*` attrs). Each file's `evidence-pill` reads `1 app tags`.
- **Role: n/a / member-context.** No admin markers in any body: `msg-box-adm=0`, `adminOnly|is-admin|role="admin"=0`, `presUser=0`, `Presenter=0` in all four. These are isolated UI-component fragments, not a full room capture, so role is not directly asserted; the components themselves (screenshare/rec preview, followed-users, scheduled-alerts) are user-side surfaces.

---

# file22.html.html
- **path**: `docs/reference/visual-evidence-deep/fragment-pages/file22.html.html`
- **kind**: html-dom-dump (isolated single-component fragment, raw DOM + inline styles)
- **size**: 449318 bytes (~449 KB; ~3 KB is actual DOM body, rest is shared Bootswatch stylesheet)
- **role**: n/a (member/user-side component; no admin/presenter markers — `msg-box-adm=0`, `presUser=0`)
- **format/quality**: raw production-Angular DOM + inline styles (no computed styles, no rects, no states/groups). Not a JSON capture.
- **surfaces documented**: `app-screenshare-preview` — the local screen-share preview card.
- **maps to (our components)**: our screen-share / local-preview overlay on the stage (recent commit `0c20d4e fix: show local screen share on the stage`). This is the reference DOM for that draggable/resizable preview card.
- **key findings** (cited):
  - Root: `<app-screenshare-preview>` wrapping `<div id="screenshareLocalPreviewHolder" class="card webcamsHolderScreen ui-draggable ui-draggable-handle ui-resizable">` — the preview is a jQuery-UI **draggable + resizable** card.
  - Card body contains `<h5 class="card-title m-0">` with an `ngbDropdown` (`<button id="dropdownBasic1" class="dropdown-toggle btn btn-outline-dark">` + empty `dropdown-menu`) and a close control `<span class="float-right p-2"><i class="fas fa-times"></i></span>`.
  - Video element: `<video autoplay id="webcamScreenLocalPreview" class="webcamPreviewScreen">` — this is where the local screen-share stream renders.
  - Eight `ui-resizable-handle` divs (n/e/s/w/ne/se/sw/nw) each `style="z-index: 90"`; the SE handle is `ui-icon ui-icon-gripsmall-diagonal-se` with `display: block`.
  - Banner pills: `1 app tags`, `0 modal ids`, `7 audited gaps`.
- **notes**: Only DOM difference from siblings is this single component; head/stylesheet identical to file23–25. Best (and only) authority in this batch for the screenshare local preview.

# file23.html.html
- **path**: `docs/reference/visual-evidence-deep/fragment-pages/file23.html.html`
- **kind**: html-dom-dump (isolated single-component fragment, raw DOM + inline styles)
- **size**: 448068 bytes (~3 KB DOM body; rest shared stylesheet)
- **role**: n/a (user-side component; no admin/presenter markers)
- **format/quality**: raw production-Angular DOM + inline styles (no computed styles/rects/states).
- **surfaces documented**: `app-rec-preview` — the recording preview card.
- **maps to (our components)**: our recording-preview overlay (companion to the screenshare preview stage overlay).
- **key findings** (cited):
  - Root: `<app-rec-preview>` wrapping `<div id="recLocalPreviewHolder" class="card recsHolderScreen">` — note this card is **NOT** draggable/resizable (no `ui-draggable`/`ui-resizable` classes, unlike file22).
  - Title text: `<div class="d-inline-block p-2 text-white">Recording Preview. (DELAYED UPTO 20s)</div>`.
  - Two header controls: close `<i class="fas fa-times text-white">` and expand `<i class="fas fa-expand text-white">` (both `float-right p-2`).
  - Empty/paused state body: `<div class="text-center py-4 text-white"><h4>Recording paused.</h4></div>`.
  - Banner pills: `1 app tags`, `0 modal ids`, `6 audited gaps`.
- **notes**: Sibling of file22; identical shared stylesheet. Only authority in this batch for the recording preview + its "Recording paused." state.

# file24.html.html
- **path**: `docs/reference/visual-evidence-deep/fragment-pages/file24.html.html`
- **kind**: html-dom-dump (isolated single-component fragment, raw DOM + inline styles)
- **size**: 448501 bytes (~3 KB DOM body; rest shared stylesheet)
- **role**: n/a (user-side modal; no admin/presenter markers)
- **format/quality**: raw production-Angular DOM + inline styles.
- **surfaces documented**: `app-followed-users-modal` — the "Followed Chat Users" modal.
- **maps to (our components)**: our followed-users / chat-follow modal.
- **key findings** (cited):
  - Root: `<app-followed-users-modal>` → `<div id="followedUsersModal" tabindex="-1" aria-labelledby="followedUsersModalLabel" aria-hidden="true" class="modal fade">` — standard Bootstrap modal (`modal-dialog` default size, no `modal-xl`).
  - Header: `<h5 id="followedUsersModalLabel" class="modal-title">Followed Chat Users</h5>` + close `<button class="btn-close btn-close-white" data-bs-dismiss="modal">` (Bootstrap 5 `data-bs-dismiss` + white close variant).
  - Body empty state: `<div class="text-center">You don't have any followed users.</div>` followed by `<!----><!---->` (Angular empty structural-directive anchors — where the follower list would render).
  - Footer: `<button class="btn btn-light" data-bs-dismiss="modal">Close</button>`.
  - Banner pills: `1 app tags`, `2 modal ids`, `5 audited gaps` (the `2 modal ids` = `followedUsersModal` + its label id).
- **notes**: Sibling; shared stylesheet identical. Only authority in this batch for the followed-users modal (incl. its empty state).

# file25.html.html
- **path**: `docs/reference/visual-evidence-deep/fragment-pages/file25.html.html`
- **kind**: html-dom-dump (isolated single-component fragment, raw DOM + inline styles)
- **size**: 449669 bytes (~3 KB DOM body; rest shared stylesheet)
- **role**: n/a (modal surface; text-white/dark styling — no explicit admin/presenter markers, but "Manage Scheduled Alerts" is an alert-authoring surface)
- **format/quality**: raw production-Angular DOM + inline styles.
- **surfaces documented**: `app-scheduled-alerts-modal` — the "Manage Scheduled Alerts" modal (large table).
- **maps to (our components)**: our scheduled-alerts management modal.
- **key findings** (cited):
  - Root: `<app-scheduled-alerts-modal>` → `<div id="scheduledAlertsModal" tabindex="-1" aria-labelledby="scheduledAlertsModalLabel" aria-hidden="true" class="modal fade text-white">` with `<div class="modal-dialog modal-xl">` — this is a **wide (`modal-xl`)** modal, unlike the default-width followed-users modal in file24.
  - Header: `<h5 id="scheduledAlertsModalLabel" class="modal-title">Manage Scheduled Alerts</h5>` + `btn-close btn-close-white`.
  - Body: `<table class="table table-striped text-white w-100">` with `<thead>` columns in order: **Date / Time, Sender, Alert, Repeat, Actions** (5 `<th scope="col">`). `<tbody>` contains only `<!---->` (empty — Angular row anchor, no scheduled alerts present).
  - Footer: `<button class="btn btn-primary" data-bs-dismiss="modal">Close</button>` (note `btn-primary`, vs `btn-light` in file24).
  - Banner pills: `1 app tags`, `2 modal ids`, `6 audited gaps`.
- **notes**: Sibling; shared stylesheet identical. Only authority in this batch for the scheduled-alerts modal + its exact column set/order. Empty tbody = honest empty-state, no fabricated rows.

---

## Batch-level notes
- **All four are near-duplicate wrappers** differing only in the single Angular component inside `evidence-wrap` and the banner pills. They are NOT full-room captures and NOT JSON computed-style captures — they are per-component raw-DOM slices from a production Angular build (Revolution/TrickTrades room).
- These are RAW DOM dumps = authority (per Rule 0), but limited: inline styles only, **no computed styles, no rects, no states/groups** — geometry/colors must be cross-referenced with a JSON capture elsewhere in the corpus.
- No `.md-analysis` (prose) files in this batch; nothing to flag as secondary.
- No corruption/empties; content is coherent. The large byte size is stylesheet bloat, not data.
