# proroom-deep-member-833px.json

- **path**: docs/reference/captures/proroom-deep-member-833px.json
- **kind**: json-capture
- **size**: 160,978 bytes (~157 KB)
- **role**: mixed / CONFLICTED — filename says "member"; but `meta.role` = `"presenter"` and `meta.url` = `https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1` (`sl=1` = screen/presenter-layout flag). How determined: printed `meta` via `node -e`. This is a NARROW-viewport curated capture (`innerWidth:833, innerHeight:1157, dpr:2`) of the "Mastering The Trade" room. **FLAG: the metadata role contradicts the filename — do not trust the filename; the raw `meta.role` says presenter.**
- **format/quality**: computed styles + rects + hover/active state resolution + full matchingRules (specificity/order/winning declarations). This is NOT a full-DOM dump — it is a small, deliberately-targeted "deep" probe of 12 named UI selectors. Highest analytical density per element of any capture (each target carries `computed`, `hover`, `active`, and `matchingRules[]` with resolved cascade winners).

## Structure (verified via node)
- Top-level keys: `meta`, `cssVariables`, `targets`, `errors`.
- `meta`: `{role:"presenter", url:..., title:"Mastering The Trade", innerWidth:833, innerHeight:1157, dpr:2, htmlClass:"", bodyClass:"", openedSidebar:false, rulesCollected:7410, capturedAt:"2026-06-14T21:08:59.933Z"}`.
- `cssVariables`: object, **294 keys** (theme tokens — light/dark theme vars, bootstrap `--bs-*`, room-specific).
- `targets`: object with **12 named probes** (not an array): `navbar, userPill, userPillIcon, sidebarDrawer, sidebarItem, chatHolder, chatTextarea, mainTabs, notesTabActive, screensTabActive, alertQa, alertHeader`. Each = `{selector, note, found, items[]}` (mainTabs also has `active`). Each `item` = `{tag,(id),class,text,rect,computed,hover,active,matchingRules}`.
- `errors`: `[]` (empty — clean capture, no honest-gap needed here).

## Surfaces documented
Top navbar shell; user-count pill (`span.users`) + `fa-user` glyph; collapsed sidebar drawer (`.room-sidebar`) + sidebar menu items (`.sidebar-item`); chat composer holder (`#textAreaHolder`) + chat textarea (`#textAreaTxt.txt-area`); presentation-area main tabs (`#mainTabs .nav-link` = Screens/Notes/Files); Notes tab active-state; Screens tab; alerts Q&A badge (`.alert-qa`); alerts header bar (`.alertHeader`).

## Maps to (our components)
- `.navbar` / `.alertHeader` → top nav + Alerts panel header (reason: `alertHeader` selector `nav.navbar...chat-nav...alertHeader`, text "Alerts", bg rgb(10,109,177)).
- `span.users` + `i.fas.fa-user` → user-count pill in nav (reason: note "user-count pill — TRUE resting height/margin/box").
- `.room-sidebar` / `.sidebar-item` → collapsible room sidebar menu (reason: 4 `.sidebar-item` items incl. "Connectivity Check").
- `#textAreaHolder` / `.txt-area` → chat composer (reason: notes "chat composer holder", "chat textarea").
- `#mainTabs` (Screens/Notes/Files) + `.presAreaTabs-notes` → presentation-area tabset (reason: `mainTabs.active:["notes-tab"]`).
- `.alert-qa` → Q&A badge/button on alerts (reason: `btn btn-sm btn-secondary ... alert-qa`).

## Key findings (cited)
1. **Default active presentation tab = Notes.** `targets.mainTabs.active = ["notes-tab"]`; `notesTabActive.items[0].class = "nav-link presAreaTabs-notes active"`, computed `background-color: rgb(12, 36, 52)` (= #0c2434 navy), `color: rgb(255,255,255)`. Non-active `screens-tab` bg `rgba(0,0,0,0)`, color rgb(204,204,204).
2. **Alerts header is bright blue, not navy.** `alertHeader.items[0].computed.background-color = rgb(10, 109, 177)` (#0a6db1), color white, height 48px, rect `{x:0,y:49,w:227,h:48}`.
3. **At 833px the sidebar/navbar are collapsed off-canvas.** `navbar` rect `{x:-250,y:49,w:250,h:1108}` (x negative = off-screen left); `.room-sidebar` computed `width:0px`; `openedSidebar:false`. `sidebar-item` rects also negative-x (x:-243). So this capture documents the COLLAPSED/narrow layout state.
4. **Cascade winners are pre-resolved.** `sidebarItem.items[0].hover.background-color = rgb(233,236,239)` from selector `.sidebar-item:hover` (fromState:hover); `matchingRules` len 19 with `specificity`/`order`/`decls` — you can read the exact winning rule without re-simulating the cascade. `notes-tab` active bg resolves to `var(--notes-tabs-bg)` via `.mainTabset .presAreaTabs-notes.active`.
5. **Theme tokens present (294 vars).** Verified values: `--success:#00bc8c`, `--red:#f00`, `--darkTheme-msgs-bg-adm:#0f2e43`, `--tabs-color:#fff`, `--users-color:#fff`, `--note-text-color:#676767`, `--lightTheme-roster-bg-adm:#e1e1e1`. `--success:#00bc8c` corroborates the Darkly-green accent noted in memory.
6. **chat textarea box:** `#textAreaTxt.txt-area.form-control.border-0`, computed `min-height:35px, max-height:300px, height:35px`, bg white, color rgb(103,103,103), font-size 14px. Holder `#textAreaHolder` rect `{x:5,y:1107,w:217,h:45}`, bg white.

## Notes
- **Best authority for cascade/hover/active resolution** on these 12 specific surfaces — the only capture (of the 5 JSONs in this dir) that ships resolved `matchingRules` + hover/active winners. Use it to settle "which rule wins" questions rather than the huge full/ultra dumps.
- NOT a superset of the big captures: it covers only 12 targeted selectors, so it complements (does not replace) `proroom-full-member.json` / `proroom-full-presenter.json`.
- **Role caveat repeated:** treat as presenter-layout narrow-viewport per `meta.role:"presenter"`; the filename "member" is unreliable.

---

# captures/README.md — NOT FOUND (honest gap)

- **path**: docs/reference/captures/README.md
- **status**: **DOES NOT EXIST.** `ls docs/reference/captures/` returned only: `proroom-deep-member-833px.json`, `proroom-full-member.json`, `proroom-full-presenter.json`, `proroom-ultra-admin-room.json`, `proroom-ultra-member-room.json`. `find docs/reference -iname 'README*'` returned nothing.
- **note**: The assignment named `captures/README.md` but no such file is present in the repo working tree at capture time. Reported as an honest gap, not invented. (No README describing the capture corpus exists under docs/reference.)
