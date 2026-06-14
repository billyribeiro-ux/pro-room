# Reference captures — protradingroom.com (hard evidence)

Raw computed-style / layout / stylesheet captures pulled from the **real**
protradingroom.com app (Angular 17 + Bootstrap "Darkly"), used to pixel- and
behaviour-match this clone. **These are visual reference only** — the content
(note names, alert text, the SimplerTrading brand) belongs to another service
and must NOT be copied as our own content; we match layout/CSS/icons, not data.

## Files

| File | Viewport | Role | What's in it |
|---|---|---|---|
| `proroom-full-presenter.json` | **1988px** (desktop) | admin/presenter | base elements + computed styles, all stylesheets (full CSS incl `:hover`/`::before`), CSS vars, palette, assets, inventory, and auto-revealed `states` (Notes/dropdowns). Default tab = Notes. |
| `proroom-full-member.json` | **1988px** | member | same shape; confirms members have **no presenter toolbar**. |
| `proroom-ultra-admin-room.json` | **2027px** | admin | the richest one — has `subtrees` (topnav/sidebar/presentation/webcams) + `targeted` elements **with matchedRules** (the actual CSS rules incl `:hover`). Notes tab active. |
| `proroom-ultra-member-room.json` | (member) | member | earliest capture (no `subtrees`); palette/fonts/elements. |

## How they were produced

DevTools console scripts (in `docs/`), run on the real app, full-width
(DevTools undocked):
- `pixel-capture-fullstates.js` → `proroom-full-*` (auto-reveals tabs/dropdowns; clicks by stable id)
- `pixel-capture-admin.js` → `proroom-ultra-*` (subtrees + matched rules)
- `pixel-capture.js` / `pixel-capture-ultimate.js` → earlier variants

## Derived slices (regenerate from the above)

`script-results/` holds per-surface slices extracted from these captures:
- `script-results/audit/<surface>.json` — topnav/sidebar/alerts/chat/tabbar/notes elements (presenter + member) with computed styles + `theme-tokens.json` (294 ref CSS vars) + `css-panes.txt` (pane CSS rules)
- `script-results/nav/nav-css.txt` — every nav/control CSS rule block from the real stylesheets
- `script-results/ref/*` — earlier per-region slices + icon maps

## Known evidence gaps (click-triggered UI never in a static capture)

- Screens/Files **active pane** internals, the chat/alert **gear dropdowns**, the
  **Share-screen source picker** — these don't exist in the DOM until clicked, so
  match them from `css-panes.txt` + spec, or capture an open-state.
- Presenter **broadcast controls** in the nav were never rendered in a capture
  (idle/member states) — their style is matched from `.navbar-dark .nav-link`
  (bare muted-gray icons); exact size is inferred.
