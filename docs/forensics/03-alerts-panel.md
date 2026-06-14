# Forensic Dossier 03 — ALERTS PANEL

Surface owner: `web/src/lib/components/AlertFeed.svelte` (+ `web/src/lib/components/AlertsChatDock.svelte` for the splitter/grip chrome).
Reference: protradingroom.com captures. Method: hard-evidence pixel/behaviour diff. Cite `ours=X vs ref=Y` + path. Uncovered → **EVIDENCE GAP**.

---

## A. Scope & Method

**What was compared:** the Alerts panel — folder-tab/title header (`"Alerts"` + bell), right-side controls (post-alert `+`, search, gear/cog), the alert composer (Symbol / side / Note / Post), the empty-state (`"No alerts yet."`), alert message ROW styling, and the angular-split grip PNG + horizontal drag splitter. Both roles (presenter vs member).

**Evidence sources (all under repo root `/home/user/pro-room`):**
- `script-results/audit/alerts.json` — PRIMARY. `presenter[38]` + `member[38]` element arrays (computed styles per role) + `adminTargeted[4]` (matchedRules incl. pseudo-rules). NOTE: both role arrays are byte-for-byte the SAME element set (identical paths/rects) — the audit did NOT capture role-gated DOM differences for alerts; gating verified live instead.
- `script-results/audit/alerts.json` alert pane was captured with the **alert feed EMPTY** (no `app-st-message`/`msg-box` rows in either array). Row styling therefore comes from the full capture below.
- `docs/reference/captures/proroom-ultra-admin-room.json` — `.targeted[5]` ("Alerts" navbar-brand), `.targeted[3]`/`[26]` (`.nav-link.active`), `.controls[26..30]` (alert-header buttons), `.elements` (50 populated alert `msg-box` rows under `app-roomscroller#chatScrollViewParentAlerts`).
- `script-results/audit/theme-tokens.json` — `:root` design tokens.
- `script-results/audit/css-panes.txt` — pane CSS rules.
- FA validation: `web/node_modules/.pnpm/@fortawesome+fontawesome-free@5.8.1/.../css/all.min.css`.

**OUR measurements:** live app `http://localhost:5174/rooms/aea3ca10-30b3-4b16-9763-2bab0a545a0d` via `web/scripts/forensic-lib.mjs` (`openRoom`, width 1988), scratch script (now deleted). Values normalised with `norm()` (rgb→hex). Screenshots in §D.

**Baseline:** `pnpm --prefix web run check` = **0 errors / 0 warnings** (578 files) before and after (no source edited).

**Reference DOM shape (Angular, for selector mapping):**
```
as-split-area.alert-box > app-alerts > div.chat.d-flex.flex-column
  > div.bs-component
      > nav.navbar...chat-nav.p-1.alertHeader        ← OUR <header>
          > a.navbar-brand.ml-1 (i.fas.fa-bell.me-1 + "Alerts")   ← OUR .title
          > ul.nav.ml-auto
              > li.nav-item.mx-1 > a.nav-link.p-0 > i.fas.fa-search     ← OUR search btn
              > li.nav-item.dropdown.ml-2 > a.nav-link.dropdown-toggle.p-0 > i.fas.fa-cog.chat-header-gear  ← OUR gear
  > app-roomscroller#chatScrollViewParentAlerts (rows)  ← OUR ul.feed
(NO composer/post form in the reference alerts pane DOM)
div.as-split-gutter > div.as-split-gutter-icon         ← OUR .hsplit > .hgrab
```

---

## B. Delta Table

Legend: ✅ match · ⚠ minor/rounding · ❌ mismatch · ➕ EXTRA in ours · ➖ MISSING in ours.
`Ours` = live computed (normalised). `Ref` = audit/capture computed (normalised).

| # | Element | Our selector | Property | Ours | Ref | Δ | Evidence path | Verdict |
|---|---------|--------------|----------|------|-----|---|---------------|---------|
| 1 | Header bar | `.panel > header` | background-color | `#0a6db1` | `rgb(10,109,177)`=`#0a6db1` | 0 | alerts.json `presenter[6]` (`nav.alertHeader`) | ✅ |
| 2 | Header bar | `header` | color | `#ffffff` | `rgb(255,255,255)` | 0 | alerts.json `presenter[6]` | ✅ |
| 3 | Header bar | `header` | height | `48px` | `48px` | 0 | alerts.json `presenter[6]` rect h=48 | ✅ |
| 4 | Header bar | `header` | padding (all) | `4px` | `4px` (`p-1`) | 0 | alerts.json `presenter[6]` | ✅ |
| 5 | Header bar | `header` | align-items | `center` | `center` | 0 | alerts.json `presenter[6]` | ✅ |
| 6 | Header bar | `header` | font-family | `"Open Sans", Lato, …` | `"Open Sans", sans-serif` | family head matches | alerts.json `presenter[6]`; tokens `--app-font-family` | ✅ |
| 7 | Title "Alerts" | `header .title` | font-size | `20px` | `20px` | 0 | alerts.json `adminTargeted[0]` / capture `targeted[5]` | ✅ |
| 8 | Title "Alerts" | `.title` | font-weight | `300` | `300` | 0 | capture `targeted[5]` | ✅ |
| 9 | Title "Alerts" | `.title` | line-height | `30px` | `30px` | 0 | capture `targeted[5]` | ✅ |
| 10 | Title "Alerts" | `.title` | color | `#ffffff` | `rgb(255,255,255)` | 0 | capture `targeted[5]` | ✅ |
| 11 | Title "Alerts" | `.title` | text-decoration | none | `text-decoration-line: none` | 0 | capture `targeted[5]` | ✅ |
| 12 | Bell↔text gap | `.title` | gap | `4px` | brand bell `me-1`=4px margin-right | 0 | alerts.json `presenter[8]` margin-right 4px | ✅ |
| 13 | Bell icon | `.title i.fa-bell` | font-family | `"Font Awesome 5 Free"` | `"Font Awesome 5 Free"` | 0 | alerts.json `presenter[8]` | ✅ |
| 14 | Bell icon | `.title i.fa-bell` | glyph | `fa-bell` (`\f0f3`) | `i.fas.fa-bell.me-1` | 0 | all.min.css `.fa-bell:before{\f0f3}` | ✅ |
| 15 | Bell icon | `.title i.fa-bell` | font-size | `20px` | `20px` | 0 | alerts.json `presenter[8]` | ✅ |
| 16 | Bell icon | `.title i.fa-bell` | font-weight | `900` (solid) | `900` | 0 | alerts.json `presenter[8]` | ✅ |
| 17 | Bell icon | `.title i.fa-bell` | color | `#ffffff` | `rgb(255,255,255)` | 0 | alerts.json `presenter[8]` | ✅ |
| 18 | Search icon | `i.fa-search` | glyph/family/size | `fa-search` / FA5 / `16px` | `i.fas.fa-search` / `16px` | 0 | alerts.json `presenter[12]`; capture `controls[28]` | ✅ |
| 19 | Search icon | `i.fa-search` | color | `#ffffff` | `rgb(255,255,255)` | 0 | alerts.json `presenter[12]` | ✅ |
| 20 | Cog icon | `.gear i.fa-cog` | glyph/family/size | `fa-cog` / FA5 / `16px` | `i.fas.fa-cog.chat-header-gear` / `16px` | 0 | alerts.json `presenter[15]`; capture `controls[30]` | ✅ |
| 21 | Cog icon | `.gear i.fa-cog` | color | `#ffffff` | `rgb(255,255,255)` | 0 | alerts.json `presenter[15]` | ✅ |
| 22 | Gear cluster | `.gear` (a.dropdown-toggle) | width | `~31.6px` (cog+caret) | `29px` (`controls[29]` 29×24) | +2.6px | alerts.json `presenter[14]` w=29.08 | ⚠ |
| 23 | Post-alert `+` | `button[aria-label="Post an alert"]` | EXISTS | **present** (`fa-plus-circle` 18px) | **ABSENT** in ref alerts header | ➕ EXTRA | capture `controls[26..30]` (no +); alerts.json `presenter[9..15]` (only search+cog) | ❌ ➕ |
| 24 | Active underline | (chat tab, NOT alerts) | "#45a2ff active underline" | n/a in alerts header | **chat tab**: bg `#45a2ff`, 1px `#45a2ff` border, white text — a FILLED tab, not an underline | brief mislabel | alerts.json `adminTargeted[3]`; tokens `--modal-active-tab-bg-color:#45a2ff` | ℹ see §C/§E |
| 25 | Empty state | `.feed .empty` | text | `"No alerts yet."` | EVIDENCE GAP (ref feed was populated) | — | capture has 50 rows; audit feed empty | ℹ |
| 26 | Empty state | `.feed .empty` | color | `#8a909c` | EVIDENCE GAP | — | no ref empty-state captured | ℹ |
| 27 | Empty state | `.feed .empty` | font-size | `14px` (0.85rem) | EVIDENCE GAP | — | — | ℹ |
| 28 | Composer form | `.panel form` | EXISTS | **present** (presenter) | **ABSENT** in ref alerts pane DOM | ➕ EXTRA | capture: no compose form under app-alerts; ref posts via gear→modal | ❌ ➕ |
| 29 | Composer bg | `form` | background-color | `#ffffff` | EVIDENCE GAP (no ref composer) | — | — | ℹ |
| 30 | Composer field | `form .sym` | border-width / color | `1px #d3d7e0` | EVIDENCE GAP | — | — | ℹ |
| 31 | Composer field | `form .sym` | border-radius | `0px` | EVIDENCE GAP (ref `.form-control` flat per css-panes) | plausibly 0 | css-panes form-control radius 0 (file inputs) | ⚠ |
| 32 | Composer field | `form .sym` | font-size | `13px` | EVIDENCE GAP | — | — | ℹ |
| 33 | Post button | `form button[type=submit]` | background-color | `#0a6db1` | EVIDENCE GAP | — | — | ℹ |
| 34 | Post button | `form button` | radius | `4px` | EVIDENCE GAP | — | — | ℹ |
| 35 | Row `.msg-box` | `.feed .msg-box` | background-color | `#ffffff` | `rgb(255,255,255)` | 0 | capture `elements` msg-box | ✅ |
| 36 | Row `.msg-box` | `.msg-box` | border-top | `1px solid #e1e1e1` | `1px solid rgb(225,225,225)`=`#e1e1e1` | 0 | capture msg-box | ✅ |
| 37 | Row `.msg-box` | `.msg-box` | border-radius | `0px` | `0px` | 0 | capture msg-box | ✅ |
| 38 | Row `.msg-box` | `.msg-box` | padding | `0.6rem 0.85rem 0.25rem` (≈10/14/4px) | ref box: `0 0 4px 0` (`pb-1`); inner uses `mx`/`ml-2 mr-2`/`pl-1` | ❌ padding model differs | capture msg-box pad-bottom 4px, others 0 | ❌ |
| 39 | Username | `.username` | color | `var(--username-color)` → `#0a6db1` | `rgb(10,109,177)`=`#0a6db1` | 0 | capture `.username.mx-1`; tokens `--lightTheme-username-color:#0a6db1` | ✅ |
| 40 | Username | `.username` | font-size/weight | `14px` / `900` | `14px` / `900` | 0 | capture `.username.mx-1` | ✅ |
| 41 | Username | `.username` | margin | `0 4px` | `0 4px` (`mx-1`) | 0 | capture `.username.mx-1` | ✅ |
| 42 | Timestamp | `.created-at` | color | `#a8a8a8` | `rgb(168,168,168)`=`#a8a8a8` | 0 | capture `.created-at.mr-2`; tokens `--lightTheme-date-color` | ✅ |
| 43 | Timestamp | `.created-at` | font-size/weight | `12px` / `600` | `12px` / `600` | 0 | capture `.created-at.mr-2` | ✅ |
| 44 | Timestamp | `.created-at` | font-style | `normal` | `normal` | 0 | capture `.created-at.mr-2` | ✅ |
| 45 | Timestamp | `.created-at` | margin-right | `0` (uses `margin-left:auto`) | `8px` (`mr-2`) | -8px | capture `.created-at.mr-2` | ⚠ |
| 46 | Body text | `.body` | color | `#676767` | `rgb(103,103,103)`=`#676767` | 0 | capture `.msg-left.text-formated`; tokens `--lightTheme-msg-color` | ✅ |
| 47 | Body text | `.body` | line-height | `1.5` (≈19.5px@13) | `19.5px` | 0 | capture `.msg-left` lh 19.5 | ✅ |
| 48 | Body text | `.body` | font-size | `var(--msg-font-size)` | `13px` | verify token=13 | capture `.msg-left` 13px | ⚠ |
| 49 | Body text | `.body` | font-weight | inherits (300/400) | `100` | weight differs | capture `.msg-left` weight 100 | ⚠ |
| 50 | Body text | `.body` | margin | `0.35rem 0 0 8px` | ref `0 8px 0 8px` (`ml-2 mr-2`) | top margin extra | capture `.msg-left` margins | ⚠ |
| 51 | Separator | `.separator` | background-color | `#e8e8e8` | `rgb(232,232,232)`=`#e8e8e8` | 0 | capture `.separator`; tokens `--lightTheme-msgs-separator-bg` | ✅ |
| 52 | Separator | `.separator` | text-align | `center` | `center` | 0 | capture `.separator` | ✅ |
| 53 | Separator | `.separator` | full-width | `width:100%` | `566px` (full) | 0 | capture `.separator` rect | ✅ |
| 54 | Separator | `.separator` | date color | `#373c42` | tokens `--lightTheme-msgs-separator-color:#373c42` | 0 | tokens | ✅ |
| 55 | Q&A badge | `.alert-qa` | background-color | `#eef4fb` (light blue pill) | `rgb(108,117,125)`=`#6c757d` (`btn-secondary` grey) | ❌ | capture `.alert-qa.btn-secondary`; tokens `--bs-secondary` | ❌ |
| 56 | Q&A badge | `.alert-qa` | color | `#0a6db1` | `rgb(255,255,255)` white | ❌ | capture `.alert-qa` | ❌ |
| 57 | Q&A badge | `.alert-qa` | border | `1px #cfe0f5` | `1px #6c757d` | ❌ | capture `.alert-qa` | ❌ |
| 58 | Q&A badge | `.alert-qa` | radius/size/pad | `5px` / 10px / `1px 3px` | `4px` / 10px / `1px 3px` | ⚠ radius | capture `.alert-qa` | ⚠ |
| 59 | Q&A glyph | `.alert-qa i` | glyph | `fa-question-circle` | `i.fas.fa-question-circle` | 0 | capture; all.min.css `.fa-question-circle` exists | ✅ |
| 60 | Avatar | `.avatar` | size | `36×36` | `39×35` (`avatar.pl-1`) | ~3px | capture `.avatar.pl-1` rect | ⚠ |
| 61 | Avatar | `.avatar` | radius | `50%` | tokens `--rosterImg-border-radius:50%` | 0 | tokens | ✅ |
| 62 | Splitter gutter | `.dock .hsplit` | background-color | `#0a6db1` | `rgb(10,109,177)`=`#0a6db1` | 0 | alerts.json `presenter[36]` (`as-split-gutter`); tokens `--split-gutter-bg` | ✅ |
| 63 | Splitter gutter | `.hsplit` | height | `11px` | `11px` | 0 | alerts.json `presenter[36]` rect h=11 | ✅ |
| 64 | Grip PNG | `.dock .hgrab` | background-image | `data:image/png;base64,iVBOR…QObYZgAAABRJREFUeAFjYGRkwIMJSeMHlBkOABP7AEGzSuPKAAAAAElFTkSuQmCC` | **identical** data-URI | 0 (byte-exact) | alerts.json `presenter[37]` (`as-split-gutter-icon`) vs `AlertsChatDock.svelte:193` | ✅ |
| 65 | Grip PNG | `.hgrab` | position/repeat | `50% 50%` / `no-repeat` | same | 0 | alerts.json `presenter[37]` | ✅ |

---

## C. Structural / Behavioural Findings (with our file:line)

### C1. ✅ Header chrome is a near-perfect match
Our `<header>` (`AlertFeed.svelte:152-203`, style `:352-392`) reproduces the reference `nav.chat-nav.p-1.alertHeader`: bg `#0a6db1`, height 48px, padding 4px, white text, `align-items:center`. The "Alerts" title (`:153`, style `:364-373`) is 20px/300/lh30/white — byte-matching `capture.targeted[5]` and `alerts.json adminTargeted[0]`. Bell (`fa-bell`, `Icon size=20`, `:153`) matches `presenter[8]` exactly (20px/900/white, 4px gap via `me-1`).

### C2. ❌ ➕ The `+` post-alert button is EXTRA — not in the reference alerts header
`AlertFeed.svelte:155-162` renders a `+` (`fa-plus-circle`, 18px) when `canPost`. The reference alerts header contains ONLY two controls — search and the gear dropdown — for BOTH admin/presenter and member:
- `capture.controls[27]` Search (`a.nav-link.p-0 > i.fas.fa-search`), `controls[29..30]` Settings (`a.nav-link.dropdown-toggle.p-0 > i.fas.fa-cog.chat-header-gear`). No `+`/plus control anywhere in the alert header.
- `alerts.json presenter[9..15]` enumerates the alert header's `ul.nav.ml-auto` children: `fa-search` then `fa-cog` — no third button.

In the reference, posting an alert is done through the **gear dropdown → a modal** (we already ship `PostAlertModal`, opened by our `+`). So the affordance exists but its TRIGGER is wrong: ref triggers it from the gear/settings menu, we add a dedicated `+` icon. `ours=+ icon in header vs ref=no + icon (post via gear menu)`.

### C3. ❌ ➕ The inline composer FORM is EXTRA — reference has no inline composer
`AlertFeed.svelte:310-321` renders an inline `Symbol / side <select> / Note / Post` form when `canPost`. The reference alerts pane DOM (`app-alerts > div.chat`) contains the header + `app-roomscroller` rows and NOTHING else — no compose form under the alerts pane in `capture.elements` nor in `alerts.json`. The reference's alert composition is modal-only (gear/`+`→modal). Our inline composer is an addition with no reference counterpart → all composer rows in §B (28-34) are EVIDENCE GAPs against an element that does not exist in the reference.

### C4. ℹ The "#45a2ff active underline" is a FILLED chat tab, and it lives in the CHAT pane — not Alerts
The brief's "#45a2ff active underline + folder-tab styling" does not apply to the alerts header (the alerts header has NO tabs — it is a single `navbar-brand` title). The `#45a2ff` active styling is on `.chatTabs .nav-link.active` ("Main Chat"), which is the **chat** pane:
- `alerts.json adminTargeted[3]` (`.nav-link.active`, text "Main Chat"): computed `background-color: rgb(69,162,255)` = `#45a2ff`, `border-bottom: 1px rgb(69,162,255)`, `color: rgb(255,255,255)`, font 12px/700 — a **solid filled blue tab**, NOT an underline.
- Driven by `--modal-active-tab-bg-color:#45a2ff`, `--modal-active-tab-border-color:#45a2ff`, `--modal-active-tab-color:#fff` (theme-tokens.json) applied via `.chatTabs .nav-link.active` (rule#33/#35 in `adminTargeted[3].matchedRules`).
This belongs to the CHAT dossier; flagged here so the alerts owner does NOT add an underline to the alerts header. See §E.

### C5. ❌ Alert ROW padding model and Q&A badge differ
Rows are otherwise excellent (username/timestamp/body/separator colors all exact, §B 35-54), but:
- **Padding model** (`AlertFeed.svelte:440-448`): our `.msg-box` puts padding on the box (`0.6rem 0.85rem 0.25rem`). The reference box has `padding: 0 0 4px 0` and indents children individually (`.username.mx-1`, `.msg-left.ml-2 mr-2`, `.avatar.pl-1`). Visually close but the left edge / inner gutters won't line up pixel-for-pixel.
- **Q&A badge** (`AlertFeed.svelte:278-285`, style `:544-559`): ours is a light-blue pill (`#eef4fb` bg, `#0a6db1` text, `#cfe0f5` border, radius 5px). The reference is a Bootstrap **`btn btn-sm btn-secondary`**: grey `#6c757d` bg, white text, `#6c757d` border, radius 4px (`capture .alert-qa`). `ours=blue pill vs ref=grey secondary button`.
- **Body weight**: ours inherits (~300/400); ref `.msg-left` is weight `100`. Minor.

### C6. ✅ Splitter + grip PNG are byte-exact
`AlertsChatDock.svelte:174-200`: `.hsplit` bg `#0a6db1`, height 11px = `alerts.json presenter[36]` (`as-split-gutter`) exactly. The grip data-URI on `.hgrab` (`:193`) is **byte-identical** to the reference `as-split-gutter-icon` background-image (`alerts.json presenter[37]`). Drag (`startHeightDrag` `:78-94`) and double-click reset (`resetHeight` `:96-98`) are behavioural extras consistent with angular-split semantics.

### C7. ✅ Role gating is correct (verified live — audit could not)
`AlertFeed.svelte:155` (`{#if canPost}` → `+`) and `:310` (`{#if canPost}` → composer). `canPost` flows from `canPostAlert` (`AlertsChatDock.svelte:103-113`) ← `can_post_alert`. Live: presenter shows `+` + composer; member (caps `can_post_alert:false`) shows neither, only Search + gear (§D). Header search/gear render unconditionally for both roles, matching the reference (both roles share the same header controls).

---

## D. Screenshots

- `docs/forensics/shots/03-alerts-presenter.png` — header (Alerts+bell, `+` search gear), "No alerts yet." empty state, inline composer (Symbol/Buy/Note/Post), blue splitter + horizontal grip.
- `docs/forensics/shots/03-alerts-member.png` — same header MINUS the `+` and MINUS the composer (role-gated). Search + gear only.

(Both 1988px viewport, `openRoom`, member via capability interception in `forensic-lib.mjs`.)

---

## E. EVIDENCE GAPS

1. **Audit alert feed was EMPTY.** `script-results/audit/alerts.json` (PRIMARY) captured the alerts pane with no rows in BOTH `presenter[38]` and `member[38]` arrays (no `app-st-message`/`msg-box`). Row styling in §B 35-61 is sourced from the *secondary* `proroom-ultra-admin-room.json` `.elements` (50 populated rows, off-screen at negative y but fully styled). Treat row diffs as "best available", not from the primary.
2. **Empty-state has NO reference.** Because every reference capture has a populated feed, there is no reference computed style for the `"No alerts yet."` empty state (§B 25-27). Our text/color/size are unverifiable. EVIDENCE GAP.
3. **Inline composer has NO reference.** The reference alerts pane has no inline compose form (§C3). Composer field/border/placeholder/Post-button values (§B 28-34) cannot be diffed — the element does not exist in the reference. EVIDENCE GAP (and a structural EXTRA).
4. **`--msg-font-size` value unverified here.** §B 48 ours uses `var(--msg-font-size)`; ref body is 13px. Confirm the token resolves to 13px in the room shell (owned by theme dossier).
5. **Presenter vs member DOM identical in audit.** `alerts.json` `presenter`/`member` arrays are the same bytes — the audit did not exercise capability rewriting, so role-gating could not be confirmed from the audit; it was confirmed live instead (§C7, §D).
6. **Brief's "#45a2ff active underline" is mislabelled** and belongs to the chat pane (§C4): it is a *filled* `#45a2ff` tab, not an underline, and there is no tab in the alerts header. No action on the alerts surface.

---

## F. Prioritized Fix List (our file:line → exact change → reference)

> All are CSS/markup-only, Svelte 5 runes preserved, FA5 Free 5.8.1 (all glyphs already validated present). DO NOT implement here — listed for the implementer. Each keeps `pnpm --prefix web run check` at 0/0.

**P1 — Remove the EXTRA `+` post-alert button from the alerts header (ref B#23 / §C2).**
`AlertFeed.svelte:155-162` — delete the `{#if canPost} <button aria-label="Post an alert">…</button> {/if}` block. The reference alerts header has only search + gear (`capture.controls[27..30]`; `alerts.json presenter[9..15]`). Re-home the `postAlertOpen=true` trigger into the gear/settings dropdown as a new `role="menuitem"` (alongside Filter/Scheduled at `:178-199`), e.g. `<button role="menuitem" onclick={() => { settingsOpen = false; postAlertOpen = true; }}><Icon name="plus-circle" size={14} /> Post alert</button>` gated by `{#if canPost}`. Reference: `controls[26..30]` (no `+`).

**P2 — Remove the EXTRA inline composer form (ref B#28 / §C3).**
`AlertFeed.svelte:310-321` — delete the `{#if canPost} <form>…</form> {/if}`. The reference alerts pane has no inline composer (`capture.elements` under `app-alerts` = header + rows only). Posting goes through `PostAlertModal` (already wired at `:333`), now reachable via the gear menu item from P1. The `submit()` handler (`:78-89`) and `symbol/side/note` runes (`:54-57`) become dead once the form is gone — remove or fold into the modal path. Reference: ref alert pane DOM has no `<form>`.

**P3 — Repaint the Q&A badge as Bootstrap `btn-secondary` grey (ref B#55-58 / §C5).**
`AlertFeed.svelte:544-559` `.alert-qa` — change `background:#eef4fb → #6c757d`, `color:#0a6db1 → #ffffff`, `border:1px solid #cfe0f5 → 1px solid #6c757d`, `border-radius:5px → 4px`; `.alert-qa:hover` `background:#e0ecfa → #5c636a`. Keep size 10px / padding `1px 3px` (already match) and `fa-question-circle` (matches). Reference: `capture .alert-qa.btn.btn-sm.btn-secondary` = `rgb(108,117,125)` bg / white / 1px `#6c757d` / radius 4px; tokens `--bs-secondary:#6c757d`.

**P4 — Align row padding model to the reference (ref B#38, B#45, B#50 / §C5).**
`AlertFeed.svelte:440-448` `.msg-box` — set `padding: 0 0 4px 0` (ref `pb-1`, no box side-padding) and move horizontal insets onto children: `.username` already `0 4px` ✅; `.body` (`:578-586`) set `margin: 0 8px` (drop the `0.35rem` top); add `margin-left:auto` is fine but also give `.created-at` (`:567-576`) `margin-right:8px` (ref `mr-2`). Reference: `capture msg-box` pad `0 0 4px 0`; `.msg-left` `ml-2 mr-2`; `.created-at` `mr-2`.

**P5 — Body font-weight (ref B#49 / §C5, minor).**
`AlertFeed.svelte:578-586` `.body` — add `font-weight: 300;` (closest FA/Open-Sans weight to ref `100`; Open Sans 100 not bundled — 300 is the lightest loaded weight per theme `--app-font-family` usage). Reference: `capture .msg-left` weight `100`. Low priority (sub-pixel visual).

**P6 — Avatar size (ref B#60, minor).**
`AlertFeed.svelte:511-534` `.avatar`/`.avatar-img` — ref avatar box is `39×35` with `pl-1` (4px left pad) rather than our `36×36`. Optional: bump to `width:39px; height:35px` or leave as a deliberate round-avatar simplification. Reference: `capture .avatar.pl-1` 39×35. Lowest priority.

**No-op (do NOT change):** header bg/height/padding (B#1-5), title (B#7-11), bell/search/cog glyphs+colors (B#13-21), username/timestamp/body color/separator (B#39-54), splitter bg/height + grip PNG (B#62-65) — all already exact. Do NOT add a `#45a2ff` underline to the alerts header (§C4/§E#6).
