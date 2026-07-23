# proroom-modals.json

- **path**: `evidence-folder/proroom-modals.json`
- **kind**: json-capture (rendered DOM + computed styles + rects, hamburger/modals capture)
- **size**: 317,061 bytes (~310 KB)
- **role**: member — determined from `meta.url` = `https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1` and the single captured modal's footer offering member-facing user actions (`@Mention`, `Private Chat`, `Follow`, `Mute`) with no admin/moderation controls.
- **format/quality**: computed styles + rects per element (each modal has `html`, `count`, `elements[]`; each element carries `tag`, `class`, `attrs`, `rect`, `style`, `before`, `after`). NOTE: every `rect` is `{x:0,y:0,w:0,h:0}` — the modal DOM was detached/hidden (never laid out) at capture, so only computed `style` values are usable, not geometry.
- **surfaces documented (as LABELED)**: `meta.label` = "hamburger-modals". Top-level keys: `meta`, `cssVariables`, `sidebarItems`, `modals`.
  - `sidebarItems` (array, len 8, plain strings): "Connectivity Check", "General Settings", "Archives", "Alert Logs", "Chat Logs", "Transcript History", "Manage Muted Users", "Manage Followed Users" — the hamburger-menu labels.
  - `modals` (object, 8 keys named identically to the sidebar items).
- **surfaces ACTUALLY captured**: ONE modal only — a **user-action / roster-user popup** (avatar + name + Offline badge + `@Mention / Private Chat / Follow / Mute / Close` footer, EMPTY body). See critical finding #1.
- **maps to (our components)**:
  - A shared **Modal/Dialog primitive** (`.modal-content` / `.modal-header` / `.modal-body` / `.modal-footer` Bootstrap chrome on the navy `#103d5c` surface) — reason: this is the reusable modal shell used by all room dialogs.
  - A **UserActionModal** (roster-user click popup: `@Mention`, `Private Chat`, `Follow`, `Mute`, `Close`) — reason: that is literally the only DOM present; footer button set and `edit-user-avatar` header match a per-user context modal.
  - The 8 named hamburger surfaces (Settings, Archives, Alert Logs, Chat Logs, Transcript History, Manage Muted/Followed Users, Connectivity Check) — NOT buildable from this file; see honest gap.

## Key findings (cited)

1. **CRITICAL — the 8 modals are byte-identical duplicates, NOT 8 distinct captures.** All 8 `modals[*].html` are the same string (`htmlLen=1365`, `count=16`, md5 head `54185cd76f`; `elements` md5 `049991e1c2` identical for all 8). The capture harness recorded the *same* modal 8 times under 8 different names.
2. **The single captured DOM is a user-action popup, not any named surface.** Full HTML (ng-attrs stripped): `.modal-content > .modal-header ( .edit-user-avatar > img gravatar src="...avatar/undefined?d=mm&s=80" ; h3.modal-title > span.badge.badge-danger "Offline" ; button.btn-close.btn-close-white ) + .modal-body.py-0 (EMPTY — only `<!---->` comments) + .modal-footer.text-center ( btn.btn-outline-light "@Mention", btn.btn-outline-light "Private Chat", btn.btn-outline-info "Follow", btn.btn-outline-warning "Mute", btn.btn-primary "Close" )`. There is NO Settings/Archives/Logs/Transcript content anywhere in the file.
3. **Modal chrome colors (computed, verified).** `.modal-content` `background-color: rgb(16,61,92)` = `#103d5c` (matches `cssVariables.root --modal-content-bg-color: #103d5c`), `color: rgb(244,244,244)` (#f4f4f4), `font-weight: 300`, `border: 1px rgba(0,0,0,.176)`. `.modal-header` and `.modal-footer` border-color `rgb(69,162,255)` (#45a2ff). `.modal-title` `font-size: 28px; font-weight: 500`.
4. **Footer button variants (computed).** `.btn-outline-light` color `rgb(248,249,250)`; `.btn-outline-info` (Follow) color/border `rgb(13,202,240)`; `.btn-outline-warning` (Mute) color/border `rgb(255,193,7)`; `.btn-primary` (Close) bg `rgb(10,109,177)` = `#0a6db1` (matches `--modal-btn-close-border: #0a6db1`). `.badge-danger` (Offline) bg `rgb(231,76,60)`, white text, `font-size: 21px; font-weight: 700`.
5. **294 theme tokens** in `cssVariables.root` (single `root` scope). Modal-relevant: `--modal-content-bg-color: #103d5c`, `--modal-btn-close-border: #0a6db1`, `--modal-btn-success-border: #92d528`, `--modal-upload-files-color: #0a6db1`, `--modal-btn-hover-opacity: 0.9`, `--success: #00bc8c`. Confirms the navy `#103d5c` modal surface is a real design token, not incidental.

## Notes

- **DUPLICATE / MISLABELED capture — treat as an honest gap.** Despite `meta.label` "hamburger-modals" and 8 named `modals` keys, this file contains exactly ONE modal (a roster user-action popup) copied 8×. The 8 hamburger surfaces named in `sidebarItems` are documented only as menu labels — their internal DOM/styles are absent and CANNOT be reconstructed from this file. Any side-by-side of Settings/Archives/Alert Logs/Chat Logs/Transcript/Muted/Followed/Connectivity must source DOM elsewhere.
- **rects unusable**: all `{0,0,0,0}` (modal not laid out). Use computed `style` values only; no geometry/spacing evidence here.
- **Best authority for**: the shared Bootstrap modal chrome (navy `#103d5c` surface, border colors, title/badge sizing) and the roster **UserActionModal** button set. Not authority for any of the 8 named menu destinations.
- Avatar `src` resolves to `.../avatar/undefined` → no real user was bound; the modal was captured as a hidden template, consistent with the all-zero rects.
