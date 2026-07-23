# proroom-presenter-deep (1).json

- **path**: `proroom-presenter-deep (1).json` (repo root)
- **kind**: json-capture (targeted "deep" computed-style + cascade capture)
- **size**: 160,826 bytes (~157 KB); pretty-printed JSON, 4,933 lines
- **role**: **presenter** — determined from `meta.role: "presenter"` (line 3) and `meta.url` = `https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1` (`sl=1` = streamer/presenter). `meta.title: "Mastering The Trade"`.
- **format/quality**: RENDERED capture — per-target computed styles + client rects + **matched-rule cascade winners** (a `hover` map per property giving `{value, important, selector, fromState}`). This is a raw-dump AUTHORITY file, not prose. `meta.rulesCollected: 7425`, `meta.dpr: 2`, `meta.innerWidth: 1401`, `meta.innerHeight: 905`, `meta.openedSidebar: false`, `meta.capturedAt: "2026-07-23T01:07:46.632Z"`.

## Top-level structure (verified by grep on 2-space-indent keys)
Four top-level keys (lines 2, 15, 311, 4931):
- `meta` — object (11 fields).
- `cssVariables` — **294 entries** (counted via node; e.g. `--success: #00bc8c`, `--tabs-dropdown-color: #45a2ff`, `--modal-content-bg-color: #103d5c`, `--textarea-bg: #111`, `--danger: #E74C3C`, `--warning: #F39C12`).
- `targets` — **12 named target groups** (each: `selector`, `note`, `found`, `items[]`; `mainTabs` also has an `active[]` array). Each `item` = `{tag, id?, class, text, rect{x,y,w,h}, computed{...~55 props}, hover{prop→ruleWinner}}`.
- `errors` — `[]` (empty; clean capture).

### The 12 targets (name / selector / note / found) — grepped at 4-space indent
1. `navbar` — `nav.navbar, .navbar` — "top navbar shell" — found 1
2. `userPill` — `span.users, .users` — "user-count pill — TRUE resting height/margin/box" — found 1
3. `userPillIcon` — `.users i.fa-user, .users .fa-user` — "fa-user glyph" — found 1
4. `sidebarDrawer` — `.sidebar, app-sidebar .sidebar, .room-sidebar` — "white drawer — width/bg" — found 1
5. `sidebarItem` — `.sidebar-item` — "menu item — TRUE resting + :hover winners" — found 4
6. `chatHolder` — `#textAreaHolder` — "chat composer holder — radius/border/bg" — found 1
7. `chatTextarea` — `.txt-area, #textAreaHolder textarea` — "chat textarea — height/min-height/weight/color" — found 1
8. `mainTabs` — `#mainTabs .nav-link` — "Screens/Notes/Files tabs — which has .active" — found 4
9. `notesTabActive` — `#notes-tab` — found 1
10. `screensTabActive` — `#screens-tab` — found 1
11. `alertQa` — `.alert-qa` — "Q&A badge — bg/color/border (btn-secondary?)" — found 2
12. `alertHeader` — `nav.alertHeader, .alertHeader` — "alerts header bar" — found 1

## surfaces documented
Presenter top navbar shell, user-count pill (`.users`) + its `fa-user` glyph, the collapsible white sidebar drawer and its 4 menu items, chat composer holder (`#textAreaHolder`) + textarea (`.txt-area`/`#textAreaTxt`), the main tabset (Screens/Streams/Notes/Files), the Q&A alert badge, and the Alerts header bar.

## maps to (our components)
- navbar / userPill / userPillIcon → top nav / header user-count component (`.users` pill with `fa-user`).
- sidebarDrawer + sidebarItem → sidebar/drawer menu component (items: Connectivity Check, General Settings, Archives, Manage Muted Users).
- chatHolder + chatTextarea → chat composer / message-input component.
- mainTabs / notesTabActive / screensTabActive → the main tabset component (Screens/Streams/Notes/Files); default active = Screens.
- alertQa + alertHeader → the alerts/Q&A panel header + Q&A badge component.

## key findings (cited)
1. **Presenter tabset is 4 tabs = Screens · Streams · Notes · Files** (NOT the "Screens/Notes/Files" the JSON note assumes). `mainTabs.found: 4`; item ids/texts at lines 2231 `screens-tab`/"Screens", 2577 `streams-tab`/"Streams", 2921 `notes-tab`/"Notes", 3266 "Files". `mainTabs.active: ["screens-tab"]` (line 2226) — default-active tab is **Screens**.
2. **Active tab styling**: active `.nav-link` computed `background-color: rgb(69,162,255)` (#45a2ff), `color: rgb(255,255,255)`, `font-family: "Open Sans", sans-serif`, `font-size: 12px`, `font-weight: 300`, `border-radius: 3px`, `padding: 8px`, `margin: 5px` (lines 2250-2284). Hover winner traces to `.mainTabset .nav-link.active` → `var(--tab-active-bg)` (line 2297).
3. **Presenter sidebar menu = 4 items**: "Connectivity Check" (641), "General Settings" (942), "Archives" (id `archivesDropdown`, 1242-1244), "Manage Muted Users" (1554). `sidebarItem.found: 4`.
4. **Q&A badge** (`alertQa`): `button.btn.btn-sm.btn-secondary.me-1.alert-qa`, text **"(2) ✅"** (line 4320), computed `background-color: rgb(108,117,125)` (#6c757d), `color: rgb(26,26,26)` (#1a1a1a), `font-size: 10px`, `border-radius: 4px`. Its `rect.y: -9927` (line 4323) = element is off-canvas/hidden (collapsed alerts panel), so treat position as not-visible in this capture.
5. **App version + collapsed state**: navbar/sidebar text = `"Powered by: ProTradingRoom.com Version: v4.0.1-b422b517 Mobi"` (lines 320, 567) → app **v4.0.1**. Sidebar is collapsed in this capture: `meta.openedSidebar: false`; navbar `rect.x: -250` (off-canvas, line 328 area) and `sidebarDrawer .room-sidebar` computed `width: 0px` (line 578). alertHeader text = "Alerts" (line 4827).

## notes
- **Near-duplicate sibling exists**: `evidence-folder/proroom-presenter-deep.json` (160,813 bytes, md5 `2800b209…`) vs this root file (md5 `6ca13326…`). Same `role`/`url`/`title`, same **12 target names** and **294 cssVariables**, but DIFFERENT viewport (`evidence-folder` = 1989×1166, `rulesCollected: 7419`, `capturedAt: 2026-06-15`) vs this root file (1401×905, 7425 rules, `capturedAt: 2026-07-23`). They are two captures of the same presenter target set at different window sizes/dates — NOT byte-identical; rects differ. This root file is the **newer** capture (Jul 23 vs Jun 15).
- **Best-authority flag**: this is a genuine rendered-DOM computed-style + cascade dump (AUTHORITY), superseding any prose `.md` claims. It is narrow/targeted (12 curated surfaces), not a full-page element dump — pair with a full presenter DOM dump for surfaces outside these 12.
- No corruption/empties beyond the intentionally-empty `errors: []`.
