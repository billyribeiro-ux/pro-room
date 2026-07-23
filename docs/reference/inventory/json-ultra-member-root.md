# proroom-ultra-member-room.json

- **path**: `proroom-ultra-member-room.json` (repo ROOT copy)
- **kind**: json-capture
- **size**: 8,531,039 bytes (8.53 MB) — verified via `wc -c`
- **role**: **member** — determined from `meta.label = "member-room"` and `meta.url = https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1`. No admin/presenter authoring toolbars present in the tab/inventory scan (member-consumer surface).
- **format/quality**: **computed styles + rects** (rendered DOM). Each element node carries `path, tag, rect{x,y,w,h}, attrs, style, before, after`. This is a rendered-DOM capture (Angular app), NOT a raw HTML dump. **High-authority.**

## Capture facts (cited)
- **Top-level keys**: `meta, head, cssVariables, fonts, stylesheets, palette, elements, assets, inventory, errors` (printed via `Object.keys`).
- **meta**: `title = "Mastering The Trade"`, `viewport {w:1401,h:905,dpr:2}`, `userAgent` = Android/Pixel 9 Chrome Mobile, `theme.dataTheme = null`, `elementsCapped:false`.
- **elements**: array length **2142** (`j.elements.length`).
- **cssVariables**: `root` = 294 vars, `body` = 294 vars.
- **stylesheets**: 41. **fonts.loaded** includes `Font Awesome 5 Free 400/900 loaded`, `Lato 400/700`, `Font Awesome 5 Brands` — FA5 + Lato confirmed.
- **errors**: `[]` (empty — clean capture, no capture errors).
- **head keys**: `stylesheetLinks, fontLinks, preloads, metas`.
- Framework: **Angular** — `ng-star-inserted` is the single most frequent class (621 occurrences).

## Surfaces documented
- **Chat/message stream** (member view): 100 `msg-box` messages, 20 `msg-box-adm` (admin-authored messages shown to member), 100 `msgMenu`, 100 `created-at`, 100 `username`, 100 `avatar`, 100 `text-formated preText`.
- **Alerts + Q&A**: `alertHeader` (1) navbar at rect `y:49, w:372, h:48`; 50 `alert-qa` (each with `fa-question-circle`); `alert-box` (1). Trade/question colored text: 18 `tradeColor`, `questionColor`.
- **Chat header**: `chatHeader` (1) navbar at rect `y:314, w:372, h:48` — stacked below the alerts pane in the left 372px column.
- **Presentation area**: `presentation-box` (1); `nav nav-tabs mainTabset` (1) at rect `x:383, y:49, w:1018, h:40` with tab labels including `presAreaTabs-notes` (Notes tab) plus sibling tabs at x=770/860/941.
- **User settings / sidebar nav** (rendered off-canvas at negative x, i.e. collapsed drawer): `Connectivity Check`, `General Settings`, `Manage Muted Users`, `Manage Followed Users`, `active-room-users` roster panel (rect `x:-243, y:417`).
- **Reply reactions / message actions**: `msgMenu` (100), `dropright` (100) per message.

## Maps to (our components)
- **msg-box / msg-left / username / avatar / created-at / text-formated preText** → chat message row component + message list. Reason: 100 identical repeated structures = the message feed.
- **user-badge-img** → member badge component. Reason: 202 `<img class="user-badge-img">` nodes with `src` = imgur PNGs (see below), NOT text badges.
- **alertHeader / alert-qa / alert-box / tradeColor** → Alerts + Q&A pane. Reason: dedicated 372px-wide navbar header + 50 Q&A entries.
- **chatHeader** → chat pane header. **mainTabset / presentation-box / presAreaTabs-notes** → presentation/notes tabbed area.
- **active-room-users** + sidebar nav items → room roster + settings drawer.

## Key findings (cited — a side-by-side needs these)
1. **Badges are IMAGES, not text.** 202 `user-badge-img` nodes; `src` values are imgur PNGs, e.g. `https://i.imgur.com/6a4VEXZ.png` (×40), `RSoWlNO.png` (×39), `EwVGWGS.png` (×21), `5s70Vkf.png` (×19), `EjWjZwW.png` (×16), + ~24 more distinct PNGs. **Confirms the CLAUDE.md warning: no "New"/"Trial" TEXT badge — real badges are `<img class="user-badge-img">`.**
2. **Two-pane left column layout.** `alertHeader` at `y:49` and `chatHeader` at `y:314`, both `w:372, h:48` at `x:0` — alerts stacked above chat in a fixed 372px left column; presentation `mainTabset` occupies `x:383 → 1401` (w:1018).
3. **Username color = `rgb(232, 232, 232)`** for regular users; an admin/special username is `rgb(10, 109, 177)` (blue). `tradeColor` text = `rgb(69, 162, 255)`; `questionColor` = `rgb(32, 149, 242)`. (from `el.style.color`.)
4. **Dominant palette** (`palette.color` counts): `rgb(33,37,41)` ×19752 (near-black bg #212529 — Bootstrap dark body), `rgb(204,204,204)` ×1456, `rgb(69,162,255)` ×863 (trade blue), `rgb(0,128,64)` ×119 (green), `rgb(10,109,177)` ×158.
5. **20 `msg-box-adm`** vs 100 total `msg-box` — admin-authored messages are a distinct visual class the member sees inline (styling differs from member `msg-box`).

## Notes
- **Best authority for the MEMBER chat + alerts + badges surface** among the corpus: rendered DOM with computed styles, rects, and per-node `style` — supersedes any prose `.md` describing member chat.
- This is the **ROOT copy**; other copies of the same capture may exist elsewhere in the tree (flag for de-dup — compare by size/hash before treating as independent evidence).
- Sidebar/settings nav and roster are captured but rendered at **negative x** (off-canvas collapsed drawer at mobile viewport `w:1401` on a Pixel-9 UA) — geometry is drawer-relative, not the on-screen layout.
- No presenter authoring tools observed → treat presenter/admin authoring surfaces as a gap for this file; use presenter-role captures instead.
