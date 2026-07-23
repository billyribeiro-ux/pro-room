# proroom-presenter-deep.json

- **path**: `evidence-folder/proroom-presenter-deep.json`
- **kind**: json-capture (targeted deep-capture — curated set of named surfaces, NOT a full-page element dump)
- **size**: 160,813 bytes (~157 KB) — verified `wc -c`
- **role**: **presenter** — determined by `meta.role: "presenter"` (line 3) and `meta.url: "https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1"` (the `&sl=1` presenter/streamer flag). `meta.title: "Mastering The Trade"`.
- **format/quality**: computed styles + rects + resolved `:hover`/`:active` winners + `matchingRules` (with selector/state/specificity/order/decls). This is the HIGHEST-fidelity capture format in the corpus for the surfaces it covers — it resolves the actual cascade winner per pseudo-state, not just resting computed style. Capture context: `innerWidth:1989`, `innerHeight:1166`, `dpr:2`, `rulesCollected:7419`, `openedSidebar:false`, `capturedAt:2026-06-15T14:27:47.556Z`. `errors: []` (clean capture).

## Structure (verified via `node -e` on JSON, not whole-file read)
Top-level keys: `meta`, `cssVariables`, `targets`, `errors`.
- `cssVariables`: object, **294 entries** (design tokens; e.g. `--success:#00bc8c`, `--warning:#F39C12`, `--modal-content-bg-color:#103d5c`, `--modal-btn-close-border:#0a6db1`, `--darkTheme-msgs-bg-adm:#0f2e43`, `--lightTheme-roster-bg-adm:#e1e1e1`).
- `targets`: object keyed by **12 named surfaces**, each `{selector, note, found, items[]}` (mainTabs also has `active`). Each item carries `tag, [id,] class, text, rect, computed, hover, active, matchingRules`.
- `errors`: empty array.

## surfaces documented (the 12 targets, with `found` counts)
1. `navbar` (`nav.navbar, .navbar`) — found 1 — top navbar shell
2. `userPill` (`span.users`) — found 1 — user-count pill (resting height/margin/box)
3. `userPillIcon` (`.users i.fa-user`) — found 1 — fa-user glyph
4. `sidebarDrawer` (`.sidebar, app-sidebar .sidebar, .room-sidebar`) — found 1 — white drawer width/bg
5. `sidebarItem` (`.sidebar-item`) — found 4 — menu items + resting/:hover winners
6. `chatHolder` (`#textAreaHolder`) — found 1 — chat composer holder
7. `chatTextarea` (`.txt-area, #textAreaHolder textarea`) — found 1 — chat textarea
8. `mainTabs` (`#mainTabs .nav-link`) — found 4 — Screens/Streams/Notes/Files tabs; `active:["screens-tab"]`
9. `notesTabActive` (`#notes-tab`) — found 1
10. `screensTabActive` (`#screens-tab`) — found 1
11. `alertQa` (`.alert-qa`) — found 2 — Q&A badge/button
12. `alertHeader` (`nav.alertHeader, .alertHeader`) — found 1 — alerts header bar

## maps to (our components)
- `navbar` / `userPill` / `userPillIcon` → `web/src/lib/components/RoomTopNav.svelte` (top nav + user-count pill). Reason: selectors `nav.navbar`, `span.users`, `.fa-user` glyph.
- `sidebarDrawer` / `sidebarItem` → `web/src/lib/components/RoomSidebar.svelte`. Reason: `.sidebar` / `.sidebar-item` menu items (Connectivity Check, General Settings, Archives, Manage Muted Users).
- `chatHolder` / `chatTextarea` → `web/src/lib/components/ChatPanel.svelte` (composer). Reason: `#textAreaHolder` + `#textAreaTxt.txt-area`.
- `mainTabs` / `notesTabActive` / `screensTabActive` → the presenter-area tabset driving `ScreenStage.svelte`, `NotesPanel.svelte`, `FilesPanel.svelte`, plus a **Streams** tab (see below). Reason: `#mainTabs .nav-link` ids `screens-tab`/`streams-tab`/`notes-tab`/Files.
- `alertQa` → `web/src/lib/components/AlertQaModal.svelte` / `AlertFeed.svelte`. Reason: `button.alert-qa`.
- `alertHeader` → `web/src/lib/components/AlertFeed.svelte` / `AlertsChatDock.svelte` header bar.

## key findings (each cited)
1. **Presenter has FOUR main tabs, not three — and `Screens` is the default active tab.** `targets.mainTabs.active = ["screens-tab"]`; the 4 items are `screens-tab "Screens"` (`class:"nav-link active"`, bg `rgb(69,162,255)` = `#45a2ff` = `--tabs-dropdown-color`/`--app-link-color`), `streams-tab "Streams"`, `notes-tab "Notes"` (`class` carries extra `presAreaTabs-notes`), and a fourth `"Files"` (no id) — all inactive tabs bg `rgba(0,0,0,0)`. The **`Streams` tab is presenter-specific** and must exist in the presenter tabset. (cited: `t.mainTabs.items[*].id/text/class/computed.background-color`)
2. **Chat composer holder is a white pill with 8px top radius.** `chatHolder` rect `{x:5,y:1116,w:410,h:45}`, `background-color:rgb(255,255,255)`, `border-top-left-radius:8px`, `padding-left:5px/padding-top:5px`. The `chatTextarea` inside is `35px` tall, `font-size:14px`, `font-weight:400`, `color:rgb(103,103,103)` (`#676767`), `min-height:35px`, `max-height:300px` (auto-grow). Its base bg/color resolve through `--textarea-bg`/`--textarea-color` `!important`. (cited: `t.chatHolder.items[0].computed` + `t.chatTextarea.items[0].computed`)
3. **Alerts header bar is solid blue `#0a6db1`.** `alertHeader` rect `{x:0,y:49,w:420,h:48}`, `background-color:rgb(10,109,177)` (= `--modal-btn-close-border`/`--modal-upload-files-color` token `#0a6db1`), `color:rgb(255,255,255)`, height `48px`. (cited: `t.alertHeader.items[0].computed`)
4. **Q&A control is a Bootstrap `btn btn-sm btn-secondary` (18×19px), and it is HIDDEN/offscreen in this capture.** `alertQa.items[0]`: `tag:button`, `class:"btn btn-sm btn-secondary me-1 alert-qa ng-star-inserted"`, rect `{x:301,y:-9679,w:18,h:19}` — the large negative `y` means it is scrolled/positioned offscreen (not rendered in view). Its `:active` winner is `background-color:rgb(43,42,42)` / `color:rgb(255,255,255)` from `.btn-secondary:not(:disabled):not(.disabled):active`. So the "Q&A badge" is a secondary button, NOT an always-visible pill. (cited: `t.alertQa.items[0]`)
5. **Sidebar drawer is CLOSED at capture (width 0); the 4 menu items are the presenter admin/settings menu.** `sidebarDrawer` rect `{x:0,y:49,w:0,h:1117}` (`width:0px`, consistent with `meta.openedSidebar:false`); `navbar` rect `{x:-250,y:49,w:250,h:1117}` (off-canvas 250px drawer). The 4 `sidebarItem` labels: **Connectivity Check, General Settings, Archives, Manage Muted Users** — all resting `color:rgb(103,103,103)` (`#676767`), transparent bg; note says ":hover winners" were also captured per item. (cited: `t.sidebarDrawer.items[0].rect`, `t.navbar.items[0].rect`, `t.sidebarItem.items[*].text/computed`)

## notes
- **Best-authority flag**: for the 12 named surfaces this is the single best source in the corpus — it uniquely records resolved `:hover`/`:active` cascade winners + `matchingRules` (specificity/order/decls), which the broad full-page dumps do not. Use it as the authority for tab set, composer, alert header, and Q&A button styling.
- **Scope is NARROW (curated), not a full DOM dump.** It documents only 12 targets — it is NOT a superset of `proroom-full-presenter.json` / `proroom-gaps-presenter.json`; those cover the wider presenter DOM. Cross-reference for anything outside these 12 surfaces.
- **Likely duplicate**: a sibling file `proroom-presenter-deep (1).json` exists at repo root — appears to be a copy/variant; reconcile before treating either as canonical.
- Angular fingerprints present (`_ngcontent-ng-c977335924`, `ng-star-inserted`) confirm the reference app is Angular; selectors are scoped attributes, so map by class/id semantics not raw selector.
- No text badges here; consistent with the corpus rule that badges are `<img class="user-badge-img">` (this capture simply doesn't include the roster/badge surface).
