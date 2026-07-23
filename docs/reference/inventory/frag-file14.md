# file14.html.html

- **path**: docs/reference/visual-evidence-deep/fragment-pages/file14.html.html
- **kind**: html-dom-dump (raw Angular DOM + full inline `<style>`; NOT a computed-styles/rects JSON capture)
- **size**: 3,720,110 bytes (~3.7 MB). `<style>` block ends at byte 446,288; `<body>` is 3,273,805 bytes — i.e. ~88% of the file is the rendered DOM of one modal.
- **role**: admin (determined by content: every one of the 2,111 log rows reads `By: admin@protradingroom.com`; the surface is the "Chat Logs" download/export modal, an admin/moderator management tool — not a member surface)
- **format/quality**: raw DOM with Angular `_ngcontent-ng-c*` / `_nghost-ng-c*` attributes + one large inline Bootswatch/Bootstrap 4.3.1 Darkly-derived stylesheet. No computed styles, no rects, no states/groups. A wrapper "evidence-banner" (`file14.html`, `1 app tags`, `1 modal ids`, `10 audited gaps`) is injected by the dump harness, not part of the app.

## surfaces documented
- **Chat Logs modal** — the entire captured DOM is a single component: `<app-chat-logs-modal>` wrapping `#chat-logs-modal` (`div.modal.fade`, `role="dialog"`, `aria-labelledby="chat-logs-modal"`).
  - modal-header: `<h5>Chat Logs</h5>` + `btn-close btn-close-white`.
  - modal-body: a `Reload Log List` button, then a `div.list-group` of 2,111 `list-group-item list-group-item-action ng-star-inserted` rows.
  - modal-footer: `Close` button.
- Each log row = a date (`<strong class="fw-bold">Jun 12, 2026</strong>`), `By:` `<i>admin@protradingroom.com</i>`, and `Channel:` value (`main` or `offTopic`).

## maps to (our components)
- A **ChatLogsModal** component (admin/moderator) — modal shell + reload button + scrollable list of downloadable chat-log entries. Reason: single `app-chat-logs-modal` host with `#chat-logs-modal` dialog and a `list-group` of dated entries.
- **Chat-log entry / list-group row** subcomponent — reason: 2,111 repeated `list-group-item-action` rows, each carrying date / author / channel metadata.
- Backing data model: a chat-log export keyed by (date, channel) with `main` and `offTopic` channels — reason: every row's `Channel:` is one of exactly those two values.

## key findings (cited)
1. Only ONE app component is present: `grep`/parse of body found `<app-chat-logs-modal` count = 1 and the only `id=` in body is `chat-logs-modal`. This fragment is narrowly the Chat Logs modal, nothing else.
2. **2,111 log entries** — body contains `Channel:` × 2,111 and `By:` × 2,111 (one each per row). `offTopic` appears 1,028 times → the remaining ~1,083 rows are `main`. Dates run at least May–Jun 2026 (e.g. `Jun 12, 2026` … `May 28, 2026` visible in text sweep).
3. **Two chat channels only**: `main` and `offTopic` (the only two `Channel:` values in the text). Useful for our channel enum.
4. **All authored by `admin@protradingroom.com`** — confirms this is an admin-facing export surface, not a member view.
5. Styling is the shared Darkly base: `:root` defines `--green:#00bc8c`, `--primary:#375a7f`, `body{background-color:#222}`; theme uses `--tabs-*` / `--chat-bg` / `--msg-bg` vars gated on `.darkTheme` / `.lightTheme` (body has both classes). Rows are plain Bootstrap `list-group-item-action`, not the `noteDownload`/`files-tabs` widgets (those tokens appear ONLY inside the CSS block, never in the DOM — verified: 0 DOM matches).

## notes
- Marker probe was misleading at first pass: `mainTabs(12)`, `noteTabset(11)`, `files-tabs(6)`, `st-searchbar(5)`, `presentation-box(1)`, `user-badge-img(4)`, `badge-success(5)`, `modal-content(36)` etc. are almost entirely **CSS selector text inside the big shared `<style>` block**, NOT rendered DOM. The only DOM-real class of interest is `modal-content` (the modal shell). Do not treat the style-block hits as surfaces present here.
- **Best authority** for the Chat Logs modal structure/labels among the fragment dumps (this fragment is dedicated to it). It is raw DOM only — for exact spacing/colors it must be cross-checked against any JSON computed-style capture of the same modal if one exists.
- Honest gap: no click/download handler URLs are visible (Angular `(click)` bindings are stripped in the static DOM; no `href` on rows), so the download endpoint/format is NOT determinable from this file.
- The `10 audited gaps` / `1 modal ids` pills are dump-harness metadata, not app content.
