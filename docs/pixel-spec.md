# Pixel-parity spec — resolved from `proroom-pixel-room.json`

Ground truth from the live reference app (chat.protradingroom.com). Values below are
the **rendered computed styles** (reliable regardless of the capture's viewport) and
the app's own CSS rules. Apply the **confident deltas**; do **not** touch the
theme-conditional / responsive items flagged "LEAVE".

## Global (already shipped)
- Font: `"Open Sans"`, body weight **300**. Loaded via `@fontsource/open-sans`. ✓
- Bootstrap radii: default `6px` (.375rem), small `4px` (.25rem), modal `8px`.

## Type scale (confident — cross-theme)
| Element | font-size | weight | color |
|---|---|---|---|
| Alert/chat **username** (`.username`) | 14px | **900** | `#0a6db1` |
| **Timestamp** (`.created-at`) | **12px** | **600** | `#a8a8a8` |
| Message **body** text | 13px | 300 | `#676767` (on the white message area) |
| Date **separator** label | 13px | — | LEAVE (theme-conditional) |
| Stage **tab** label | 12px | 700 active / 300 idle | `#fff` |
| Sidebar menu item | 18px | — | — |
| Modal **title** | 20px (1.25rem) | **700** | `#fff` |
| Top-nav **brand** (room name) | 20px | — | `#fff` |

## Fixed chrome colors (verify; mostly already match)
- Top nav bar: bg `#0c2434`, text `#fff`, height `49px`
- Alerts/Chat **header bar**: bg `#0a6db1`, text `#fff`, **min-height 40px**
- Stage tabs: active bg `#45a2ff` text `#fff`; tab strip bottom border `#0a6db1`
- Split gutters (outer + inner): `#0a6db1` ✓
- Reaction/positive `#92d528`, danger/negative `#bb352a`, link/accent `#45a2ff`

## Modals (`Modal.svelte`)
- content: bg `#103d5c`, color `#f4f4f4`, border-radius `8px`
- header / body / footer padding: `1rem`; header bottom-border + footer top-border subtle
- title: 20px / 700 / `#fff`
- active tab (inside modals): bg `#45a2ff`, color `#fff`
- close button accent `#0a6db1`; danger `#bb352a`; success `#92d528`

## LEAVE (do NOT change from this capture)
- **Sidebar background / chat background**: the capture was in **light theme**
  (white sidebar `#fff`, white chat). Our app uses the dark-chrome scheme
  intentionally — keep our values; do not switch to white.
- **Date separator bg**: theme-conditional (`#e8e8e8` light / `#222` dark) — keep ours.
- **Message font-size**: base 16px but the reference narrows it to 12px in the narrow
  alerts/chat column (`.alert-chat-box-extra-column-sm`). Our 13px is fine — leave it.
- Any **layout rect / pane size**: the capture viewport was 165px wide (DevTools
  docked), so element positions are the squished mobile layout — not desktop truth.
