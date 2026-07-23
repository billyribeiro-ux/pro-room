# frag-b6 — fragment-pages inventory (file26–file29)

**Assignment slug:** frag-b6
**Corpus dir:** `docs/reference/visual-evidence-deep/fragment-pages/`
**Common shape (all 4):** pretty-printed **HTML DOM dump** of a single Angular modal component. Each file is
`<!doctype html>` → `<head>` with an embedded **Bootswatch v4.3.1 (Darkly)** stylesheet (`@import Lato`, the
`Bootswatch v4.3.1` banner is in the `<style>` head comment) plus a `<link>` to local FontAwesome
(`@fortawesome/fontawesome-free/css/all.min.css`). The CSS is ~440KB of the ~450KB — the actual captured
component markup is only lines ~52–116. `<body class="darkTheme lightTheme">`. Body wraps an
`.evidence-banner` (filename + pills: "N app tags", "N modal ids", "N audited gaps") then
`.evidence-wrap` containing one `<app-…>` Angular host element with `_ngcontent`/`_nghost` attributes.
DOM is a **static, un-hydrated snapshot** — every modal still shows its initial state (`fa-spinner fa-spin`
"Loading…", empty lists), so no live data is present except hard-coded option lists. `id` attributes carry
`modal fade` + `aria-hidden="true"` (modals captured closed).

The banner "N audited gaps" is a **tooling-generated count** (from the dump generator) — there are NO inline
gap annotations in the captured markup (grep: `audit` appears 1×, `gap-` 108× are Bootstrap `gap-*` utility
CSS classes, not annotations). Treat the gap counts as prior-analysis metadata, not authority.

---

# file26.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file26.html.html
- **kind**: html-dom-dump
- **size**: 448,765 bytes (~449 KB)
- **role**: n/a — single modal component, not a role-scoped page. Surface is admin/moderator-leaning (an
  alert-delivery report), but the fragment carries no role marker; `<body class="darkTheme lightTheme">` only.
- **format/quality**: raw DOM + inline `_ngcontent`/`_nghost` attrs + embedded Darkly CSS. No computed
  styles/rects (this is a DOM dump, not a JSON capture). Un-hydrated (spinner still spinning).
- **surfaces documented**: "Alert Sent Report" modal (delivery/receipt report for a sent alert).
- **maps to (our components)**: an alert-send-report modal / toast-report surface tied to the alert composer
  (admin/presenter alert tooling). Reason: component tag `app-alert-send-report-modal`, id
  `alert-send-report-modal`, `<h5>` "Alert Sent Report. AlertID:".
- **key findings** (cited):
  1. Component host `<app-alert-send-report-modal>` with `id="alert-send-report-modal"` (grep of ids);
     banner pills: "1 app tags", "1 modal ids", "7 audited gaps".
  2. Header `<h5>` text = `Alert Sent Report. AlertID:` (trailing colon, ID value NOT captured — un-hydrated).
  3. Body is the loading state only: `<i class="ml-2 fas fa-spinner fa-spin">` + "Loading…", followed by
     four empty `<!---->` Angular comment anchors (the report table is unrendered).
  4. Footer: single `<button class="btn btn-secondary">Close` with `data-bs-dismiss="modal"`; close-X is
     `btn-close btn-close-white` (Bootstrap 5 dismiss attrs `data-bs-dismiss`).
- **notes**: Content-thin (loading skeleton only). Best authority for the modal's chrome (title/footer/close),
  NOT for its populated report rows. Same head/CSS/wrapper as file27–29 (siblings, not duplicates — distinct
  component per file).

---

# file27.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file27.html.html
- **kind**: html-dom-dump
- **size**: 448,808 bytes (~449 KB)
- **role**: n/a — modal component. Private-messages surface (member-relevant: a user's own PM history), but no
  role marker in the fragment.
- **format/quality**: raw DOM + inline ng attrs + embedded Darkly CSS; un-hydrated loading state.
- **surfaces documented**: "All private messages" modal (aggregated PM/DM list for the user).
- **maps to (our components)**: a private-messages / DM-history modal off the chat panel. Reason: tag
  `app-all-user-pmmodal`, id `all-user-pm-modal`, `<h5>` "All private messages:".
- **key findings** (cited):
  1. Host `<app-all-user-pmmodal>` (note: tag has no hyphen before "modal") with `id="all-user-pm-modal"`;
     banner pills: "1 app tags", "1 modal ids", "8 audited gaps".
  2. Header `<h5>` = `All private messages:` followed by an empty `<!---->` (a dynamic counter/name is
     unrendered).
  3. Body = loading state only: `fa-spinner fa-spin` + "Loading…", then two `<!---->` anchors where the PM
     list would render (no messages captured — un-hydrated).
  4. Footer button `btn btn-secondary` "Close"; close-X `btn-close btn-close-white`; modal is `modal fade`,
     `aria-hidden="true"` (captured closed).
- **notes**: Loading skeleton only — no actual PM rows/senders/timestamps present. Authority for modal chrome
  only. Sibling of file26/28/29 (shared head/CSS), distinct component.

---

# file28.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file28.html.html
- **kind**: html-dom-dump
- **size**: 467,728 bytes (~468 KB) — largest of the four (richest captured markup)
- **role**: admin/moderator-leaning — "Alerts Advanced Search" with a **Select Traders** roster and
  **Select Rooms** cross-room selector implies staff-level scope; no explicit role marker in the fragment, so
  treat as mixed/staff. Determined from the trader/room dropdown contents + "Rooms" refresh button.
- **format/quality**: raw DOM + inline ng attrs + embedded Darkly CSS. This one IS partially hydrated — the
  trader/room dropdowns contain real hard-coded option lists (see below). Date pickers unhydrated.
- **surfaces documented**: "Alerts Advanced Search" modal — trader filter, room filter, free-text search,
  Non-Trade-Alert + Archives checkboxes, Start/End date range.
- **maps to (our components)**: the alerts advanced-search / filter modal in the alerts panel. Reason: tag
  `app-alerts-advanced-search`, id `alerts-advanced-search-modal`, `<h5>` "Alerts Advanced Search".
- **key findings** (cited):
  1. Header `<h5>` "Alerts Advanced Search" + inline `<button class="btn btn-info btn-sm mx-1">` with
     `<i class="fas fa-sync-alt me-1">` labelled "Rooms" (a refresh-rooms action).
  2. **Real trader roster** in `#selectTraderDropdown` (`--Select Traders--`, `dropdown-menu w-100`,
     `dropdown-item` each): Allison, Big Bad Voodoo Daddy, Bruce Marshall, Chris Brecher, Danielle Shay,
     Heather, Henry, JC, Kody Ashmore, Lorna St. George, Melissa Beegle, Mirza Catic, Omer Krdzic, RH, Sam,
     ST_Neil, Taylor, TG Watkins, Trendy Jon, CML Alert Bot (20 items — hard evidence for the presenter/
     trader name list).
  3. **Real room list** in `#selectRoomDropdown` (`--Select Rooms--`): Showcase Room, Mastering The Trade,
     Tr3ndy Trading (3 rooms).
  4. Controls: `#search-term-input` (`type="search"`, placeholder "Type your search term",
     `aria-describedby="search-term-addon"`); checkboxes `#checkNonTradeAlert` label "Non Trade Alert" and
     `#checkArchives` label "Also search archives?"; date inputs `#startDateInput` (label "Start Date:") and
     `#endDateInput` (label "End Date:") in `.date-input-container`. All ids via `grep 'id="..."'`.
  5. `.modal-header` CSS (embedded Darkly): `border-bottom:1px solid #444` (dark-theme divider — authority for
     the modal border colour).
- **notes**: Best authority in this batch — only file with real option data (trader + room names). Banner
  pills: "1 app tags", "2 modal ids", "18 audited gaps" (the "2 modal ids" count is tooling noise; only one
  `id=…modal…` exists in markup). Use these 20 trader names + 3 room names as evidence when building the
  alerts filter roster, but verify against a JSON capture where possible.

---

# file29.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file29.html.html
- **kind**: html-dom-dump
- **size**: 449,195 bytes (~449 KB)
- **role**: n/a — modal component (per-user alert mute/filter; member-relevant). No role marker in fragment.
- **format/quality**: raw DOM + inline ng attrs + embedded Darkly CSS; hydrated to empty state ("List is
  empty.").
- **surfaces documented**: "Filter out alerts from the following" modal — per-user alert-mute list.
- **maps to (our components)**: an alert-filter / mute-user modal in the alerts panel. Reason: tag
  `app-alert-filter-modal`, id `alert-filter-modal`, `<h5>` "Filter out … alerts from the following:".
- **key findings** (cited):
  1. Host `<app-alert-filter-modal>`, `id="alert-filter-modal"`; banner pills "1 app tags", "2 modal ids",
     "8 audited gaps".
  2. Header `<h5>` = `Filter out` + two `<!---->` (an inline dynamic word unrendered) + `alerts from the
     following:`.
  3. Body `modal-body pt-1`: one checkbox `#show-alerts` (`form-check-input`) with label "Only show alerts
     from these people:", then `<p>List is empty.</p>` — the mute list is genuinely empty (captured state),
     not just unhydrated.
  4. Footer `modal-footer d-flex align-items-center justify-content-between`, single `btn btn-secondary`
     "Close" + trailing `<!---->` (a conditional second button unrendered).
- **notes**: Empty-state capture (honest gap: no muted users to show). Authority for the modal's structure/
  labels/empty-state copy. Sibling of file26–28 (shared head/CSS), distinct component.

---

## Batch summary
Four sibling HTML DOM dumps, each = one Angular **alert/messaging modal** on the Bootswatch **Darkly** theme
(FA `all.min.css` linked, `btn-close btn-close-white` Bootstrap-5 dismiss chrome). All captured **closed /
un-hydrated** (`modal fade`, `aria-hidden="true"`, `fa-spinner fa-spin` "Loading…"), so they are authority for
modal **chrome, ids, labels, and static option lists** — NOT for populated rows.
- file26 `app-alert-send-report-modal` — alert delivery report (loading only)
- file27 `app-all-user-pmmodal` — all private messages (loading only)
- file28 `app-alerts-advanced-search` — advanced alert search (**richest: 20 trader names + 3 room names**)
- file29 `app-alert-filter-modal` — per-user alert mute list (empty state)
No JSON captures here → no computed styles/rects; pair these with a JSON capture for pixel-exact styling.
