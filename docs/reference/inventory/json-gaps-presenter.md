# proroom-gaps-presenter.json

- **path**: `proroom-gaps-presenter.json` (repo root)
- **kind**: json-capture
- **size**: 745,580 bytes (~745 KB) — `wc -c`
- **role**: presenter — determined from `meta.role: "presenter"` and `meta.url: "https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1"` (the `sl=1` query flag). `meta.title: "Mastering The Trade"`, `meta.viewport: {w:1401,h:905,dpr:2}`, `meta.capturedAt: 2026-07-23T01:02:36.774Z`.
- **format/quality**: computed styles + rects, organized as `states` → per-state `groups[]` → each `{selector, rootPath, rootClass, count, nodes[]}`; each node carries `path, tag, id, class, rect{x,y,w,h}, attrs, style{...computed...}, text`. This is a **targeted "gaps" probe** (8 named states), NOT a full-DOM dump — it deliberately samples specific panes/rows to fill holes, and several probes MISSED their intended target (see key findings).

## Top-level structure (verified)
`Object.keys` = `meta, cssVariables, stylesheets, fonts, states, errors`.
- `cssVariables`: subkeys `root` (294 vars) and `body`; both include `--success:#00bc8c`, `--modal-content-bg-color:#103d5c`, `--darkTheme-msgs-bg-adm:#0f2e43`, `--tabs-dropdown-color:#45a2ff`, `--sidebar-menu-color:#fff` (navy admin-room palette, consistent with reference authority).
- `stylesheets`: 41 entries; `[0]` = FontAwesome `use.fontawesome.com/releases/v5.8.1/css/all.css` (1411 rules) — **FA pinned 5.8.1 confirmed**.
- `fonts`: `{}` (empty). `errors`: `[]` (empty).
- `states` keys (8): `pane:Screens`, `pane:Notes`, `pane:Files`, `alert-row`, `chat-row`, `gear-menu:1`, `gear-menu:2`, `gear-menu:3`.

## surfaces documented
- **Screens/Presentation pane** (`div#screens`) — EMPTY state.
- **Notes pane** (`div#notes`, `#notesTabs` noteTabset) — rich: 6 note tabs + active note body + Download button.
- **Files pane** — probe fell back to `div#notes` (duplicate of Notes; no real Files data).
- **alert-row / chat-row** — probes fell back to the alerts search icon (no real message rows).
- **gear-menu:1/2/3** — empty groups (nothing captured).

## maps to (our components)
- Screens pane → presentation/stage component (empty-state "No one is presenting right now...").
- Notes pane → Notes tabset component (`noteTabset`, `note-view`/summernote render, `noteDownload` button, per-tab `badge-success` + `fa-home` home badge, `editName` tab labels).
- Files pane → files component — **NOT usable from this file** (duplicate of Notes).
- alert-row/chat-row → alert/chat message rows — **NOT usable from this file** (captured search button only).

## key findings (cited)
1. **Presenter's Screens pane was EMPTY at capture.** `states["pane:Screens"].groups[0]` (selector `active-pane`, root `div#screens`, 4 nodes) contains an `h3.text-center.mt-4` with `text: "No one is presenting right now..."`, `rect {x:383,y:113,w:1018,h:34}`, plus `ul#screenTabs.nav.nav-tabs.screens-tabs` (h:1) and empty `div#screensTabsContent.tab-content`. Despite role=presenter, NO active presentation/screen-share was on the stage — honest gap for presenter-media evidence.
2. **Notes pane has 6 note tabs (real content).** `states["pane:Notes"].groups[0]` (root `div#notes.tab-pane.active.show`, 46 nodes). Tab labels via `a.editName.mx-1` text: "Welcome" (ACTIVE, `nav-link active`, has `span.badge.badge-success.mx-1.p-0` + `i.fas.fa-home`), "JC's Daily Briefing", "Henry's Workflowy Notes", "Sam's Mag 7 index", "1on1 Coaching/ Prop Firm & Tool Discounts codes.", "Taylor's Scorecard Rankings (6/26 CLOSE)". Tab element IDs captured (e.g. `#652765a0e494735aa53574ba-tab`). Active note body: `div.note-container > app-note > div#summernoteEdit-652765a0e494735aa53574ba.note-view` containing `p > a > img`, plus `div.noteOptions.d-flex.align-items-center.justify-content-between` and `button.btn.btn-sm.noteDownload.mr-3` (text "Download", `i.fas.fa-download.mr-2`).
3. **Computed styles for Notes chrome (exact values).** `badge-success`: `background:rgb(0,188,140)` (=#00bc8c), `color:rgb(255,255,255)`, `font-size:9px`. `noteDownload` button: `background:rgb(146,213,40)`, `color:rgb(255,255,255)`, `font-size:14px`. `nav-link.active`: `background:rgb(69,162,255)` (=#45a2ff `--tabs-dropdown-color`), `color:rgb(255,255,255)`, `border-bottom-color:rgba(0,0,0,0)`.
4. **Files probe is a DUPLICATE of Notes.** `JSON.stringify(states["pane:Files"].groups[0].nodes) === JSON.stringify(states["pane:Notes"].groups[0].nodes)` → `true` (byte-identical, same `rootPath: div#notes`, count 377, 46 nodes). The Files pane selector resolved to the Notes root — this file carries NO real Files-pane evidence.
5. **alert-row and chat-row probes MISSED and are duplicates of each other.** Both `states["alert-row"]` and `states["chat-row"]` groups are byte-identical (`=== true`), each 3 nodes: `li.nav-item.mx-1 > a.nav-link.p-0 > i.fas.fa-search` — i.e. the alerts navbar SEARCH icon, not any alert/chat message row. Their `selector` fields list message-row selectors (`.chatMessage, .chat-message, [class*="message"...]`, `.alert-item`...) but the capture fell back to the `rootPath` search `li`. NO message-row evidence here.
6. **gear-menu:1/2/3 captured nothing.** All three states have `groups: []` (length 0) with only `capturedAt`. The gear/settings-menu probes yielded no nodes — honest gap.

## notes
- **Best-authority for**: presenter Notes tabset (tab labels, note IDs, active-note body chrome, Download button, home badge) and the "No one is presenting" Screens empty-state. Rendered computed styles + rects make it authoritative over any prose.
- **Duplicates / dead probes (do NOT rely on)**: `pane:Files` == `pane:Notes` (identical); `alert-row` == `chat-row` (identical, both = search icon); `gear-menu:1/2/3` empty. For Files, alert rows, chat rows, and gear menus, seek other captures.
- This is a supplemental "gaps" capture (8 focused states), not a full-page dump; cross-reference the main presenter full-DOM/full-state captures for surfaces absent or mis-targeted here.
