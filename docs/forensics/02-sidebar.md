# Forensic Dossier 02 — Sidebar Drawer (the white 250px drawer)

Surface: OUR `web/src/lib/components/RoomSidebar.svelte` (the in‑flow white rail opened by the
topnav hamburger) vs the real protradingroom.com reference capture.

---

## A. Scope & Method

- **Target**: the white drawer (`<aside class="sidebar">`) toggled by the topnav hamburger
  (`button[aria-label="Toggle sidebar"]`, `web/src/lib/components/RoomTopNav.svelte:58–62`,
  wired in `web/src/routes/rooms/[id]/+page.svelte:339,358–363`). It is CLOSED by default
  (`sidebarOpen = $state(false)`, `+page.svelte:54`). My script opens it before measuring.
- **Harness**: `web/scripts/forensic-lib.mjs` `openRoom({role, width:1988})`, `computed`, `rect`,
  `shot`, `norm`. Scratch script: `web/scripts/fx-sidebar.mjs` (deleted after run); raw output
  preserved analysis only — not committed.
- **Roles**: measured `presenter` (dev super‑admin) and `member` (caps rewritten by the harness).
- **Reference (PRIMARY)**: `script-results/audit/sidebar.json` → `presenter[]` / `member[]` (51
  elements each, computed styles + rects) and `adminTargeted[]`.
- **Reference (hover/CSS rules)**: `docs/reference/captures/proroom-ultra-admin-room.json` →
  `.targeted[16]` (`a.active-room-users` matchedRules) and the raw `.stylesheets` blob
  (grep for `.sidebar-item`).
- **Glyph validation**: every FA name we use was grepped against
  `web/node_modules/@fortawesome/fontawesome-free/css/all.min.css` — all 22 exist (table E note 1).
- Colors normalised rgb→hex; px rounded.

### Reference menu inventory (audit/sidebar.json — IDENTICAL for presenter and member)

| # | li class | item glyph (`<i>`) | label |
|---|----------|--------------------|-------|
| 1 | `nav-item` | `fas fa-network-wired` | Connectivity Check |
| 2 | `nav-item` | `fas fa-cogs` | General Settings |
| 3 | `nav-item dropdown` | `fas fa-archive` (`dropdown-toggle`) | Archives |
| 4 | `nav-item py-0` | `fas fa-comments` (`ps-1`) | Manage Muted Users |
| 5 | `nav-item py-0` | `fas fa-users` (`ps-1`) | Manage Followed Users |
| 6 | `nav-item d-flex flex-column h-100` | `fas fa-user` | Users: \<roster\> |

> **The reference `presenter` and `member` element arrays are byte‑for‑byte identical** (same 51
> nodes, classes, glyphs, rects). Evidence: `script-results/audit/sidebar.json` `presenter` vs
> `member`. The reference capture shows **NO role split, NO Audio/Video Settings item, NO expanded
> Archives sub‑items, NO Admin group** in the sidebar. (Whether those exist behind a collapsed
> dropdown is an EVIDENCE GAP — see E.)

---

## B. Delta Table

Evidence keys: `AUD[i]` = `script-results/audit/sidebar.json` `presenter[i]`;
`CAP.targeted[16]` / `CAP.stylesheets` = `docs/reference/captures/proroom-ultra-admin-room.json`.
Ours measured via `web/scripts/fx-sidebar.mjs` at width 1988.

| Element | Our selector | Property | Ours | Ref | Δ | Evidence | Verdict |
|---|---|---|---|---|---|---|---|
| Drawer outer | `.sidebar` | width | 250px | 250px | — | AUD[0].width | ✅ |
| Drawer outer | `.sidebar` | background | #ffffff | #ffffff | — | AUD[0].background-color | ✅ |
| Drawer inner | `.sidebar-inner` | color | #676767 | #676767 | — | AUD[2].color | ✅ |
| Drawer inner | `.sidebar-inner` | font-size | 14px | 14px | — | AUD[2].font-size | ✅ |
| Drawer inner | `.sidebar-inner` | font-family | "Open Sans",Lato,… | "Open Sans",sans-serif | family list differs but resolves Open Sans | AUD[2].font-family | ✅ (cosmetic) |
| Powered li | `.powered` | padding | 5px 2px | 5px 2px | — | AUD[3] padding | ✅ |
| "Powered by:" p | `.powered-by` | margin-bottom / lh / size | 8px / 21px / 14px | 8px / 21px / 14px | — | AUD[4] | ✅ |
| PTR link | `.ptr-website-link` | color | #45a2ff | #45a2ff | — | AUD[5].color | ✅ |
| PTR link | `.ptr-website-link` | text-decoration | underline | underline | — | AUD[5].text-decoration-line | ✅ |
| PTR link | `.ptr-website-link` | margin | 0 5px | 0 5px | — | AUD[5] margin-l/r | ✅ |
| **Version p** | `.version` | **text** | **"Version: v0.0.1"** | **"Version: v4.0.1-c0fee8f5"** | **string** | AUD[6].text vs fx run | ❌ |
| Mobile App btn | `.app-info-btn` | bg / color | #6c757d / #ffffff | #6c757d / #ffffff | — | AUD[8] | ✅ |
| Mobile App btn | `.app-info-btn` | padding / radius | 4px 8px / 4px | 4px 8px / 4px | — | AUD[8] | ✅ |
| Separator | `hr.sep` | border-top-width | 1px | 1px | — | AUD[9].border-top-width | ✅ |
| Separator | `hr.sep` | border-top-color | #676767 | #676767 | — | AUD[9].border-top-color | ✅ |
| **Separator** | `hr.sep` | **opacity** | **1** | **0.25** | **0.75** | AUD[9].opacity | ❌ |
| Caps p | `.caps` | text-align / mb | center / 8px | center / 8px | — | AUD[10] | ✅ |
| Caps tick `<i>` | `.caps i` | font-family / weight | FA5 Free / 900 | FA5 Free / 900 | — | AUD[12].font-family,weight | ✅ |
| Caps tick `<i>` | `.caps i` | size | 14px | 14px | — | AUD[12].font-size | ✅ |
| nav-item li | `.menu .nav-item` | padding | 5px 2px | 5px 2px | — | AUD[15] padding | ✅ |
| Item link | `.item` | padding | 8px 0 | 8px 0 | — | AUD[16] padding-t/b | ✅ |
| Item link | `.item` | margin | 0 5px | 0 5px | — | AUD[16] margin-l/r | ✅ |
| Item link | `.item` | font-weight | 700 | 700 | — | AUD[16].font-weight | ✅ |
| Item link | `.item` | color | #676767 | #676767 | — | AUD[16].color | ✅ |
| Item icon | `.item i` | font-family / weight | FA5 Free / 900 | FA5 Free / 900 | — | AUD[17] | ✅ |
| Item icon | `.item i` | font-size | 14px | 14px | — | AUD[17].font-size | ✅ |
| Item label | `.item .label` | padding-left | 8px | 8px | — | AUD[18].padding-left (`.pl-2`) | ✅ |
| Muted item | `.item-ps` | padding-left | 4px | 4px | — | AUD[28].padding-left (`.ps-1`) | ✅ |
| **Item hover** | `.item:hover` | **background** | **#e9ecef** | **#111111** (`!important`) | **wrong color** | CAP.stylesheets `.sidebar-item:hover{background-color:rgb(17,17,17)!important}` | ❌ |
| **Item hover** | `.item:hover` | **color** | **#45a2ff (accent)** | **inherit (#676767)** | **adds color shift** | CAP.stylesheets `.sidebar-item{color:inherit!important}` | ❌ |
| Roster title | `.roster-title` | size / weight / color | 14px / 700 / #676767 | 14px / 700 / #676767 | — | AUD[36],[39] | ✅ |
| Reload btn | `.mini-reload` | bg / icon | #f4f4f4 / #45a2ff | #f4f4f4 / #45a2ff | — | AUD[41].bg, AUD[42].color | ✅ |
| Sort btn | `.mini-sort` | bg / icon | #6c757d / #ffffff | #6c757d / #ffffff | — | AUD[43],[44] | ✅ |
| Search btn | `.mini-search` | bg / icon | #45a2ff / #f4f4f4 | #45a2ff / #f4f4f4 | — | AUD[45],[46] | ✅ |
| Search btn | `.mini-search` | margin-left | 0 | 0 | — | AUD[45].margin-left | ✅ |
| Roster mini btns | `.mini` | padding | 3px 6px | 3px 6px | — | AUD[41] padding | ✅ |
| **Roster mini btns** | `.mini` | **height** | **20px** | **27px** | **7px** | AUD[41].height=27px; ours rect h=20 | ❌ |
| **Cog btn** | `.mini-cog` | bg / color | #212529 / #ffffff | *(unverified)* | unknown | AUD[40] is a `<div>` glyph, no btn styling captured | ⚠️ GAP |

---

## C. Structural / Behavioural Findings (with our file:line)

1. **Item hover color is wrong (highest‑confidence pixel defect).**
   The reference has TWO `.sidebar-item:hover` rules in its stylesheets:
   - global theme: `.sidebar-item:hover { background-color: rgb(17,17,17) !important; }` (#111111) +
     `.sidebar-item { color: inherit !important; }`
   - component‑scoped: `.sidebar-item[_ngcontent…]:hover { background-color: rgb(233,236,239); }`
     (#e9ecef)
   The `!important` global rule wins the cascade, so the **reference hover bg is #111111 (near‑black)
   with text color unchanged (inherit #676767)**. OURS does `background:#e9ecef; color:var(--accent)`
   (`RoomSidebar.svelte:410–413` for `.item`, `:450–453` for `.sub-item`) — i.e. light‑grey bg + blue
   text. Evidence: capture stylesheets grep, and our live hover measured `bg=#e9ecef color=#45a2ff`.

2. **Separator opacity.** Reference `<hr>` has `opacity: 0.25` (Bootstrap default `hr`), so the line
   is a faint grey. Ours forces full‑strength `#676767` at opacity 1 → too dark.
   Ours: `RoomSidebar.svelte:357–361` (`.sep`). Evidence: AUD[9].opacity=0.25.

3. **Version string.** Ours hard‑codes `Version: v0.0.1` (`RoomSidebar.svelte:55`). Reference shows
   `Version: v4.0.1-c0fee8f5` (AUD[6].text). Cosmetic/text mismatch; flagged not auto‑fixed because
   the real build hash is environment‑specific (EVIDENCE GAP on the canonical value).

4. **Roster toolbar button height.** Reference mini buttons are 27px tall (AUD[41/43/45].height=27);
   ours render 20px tall. Cause: ours has no explicit min-height/height and `line-height:0` collapses
   the box (`.mini`, `RoomSidebar.svelte:492–502`). Reference height comes from Bootstrap `.btn-sm`
   line-height (21px) + 3px×2 padding = 27px.

5. **Extra items not present in the reference capture (structural superset).**
   Our menu enumerates 14 actionable rows; the reference enumerates 5 items + roster. Items present
   in OURS but absent from the reference `presenter`/`member` arrays:
   - **Audio/Video Settings** (`fas fa-video`) — `RoomSidebar.svelte:86–95`. Not in AUD.
   - **Archives expanded sub‑items**: Alert Logs (`fa-bell`), Chat Logs (`fa-comment`),
     Transcript History (`fa-closed-captioning`, disabled) — `RoomSidebar.svelte:118–136`. In the
     reference, Archives is a collapsed `dropdown-toggle` (AUD[24]) with no visible children.
   - **Admin group** + 4 children: All Private Messages (`fa-envelope`), Play YouTube Video
     (`fab fa-youtube`), Session Control (`fa-sliders-h`), Debug Log (`fa-bug`) —
     `RoomSidebar.svelte:162–200`. No Admin group anywhere in AUD.
   See E for why these are GAPS, not confirmed "extra".

6. **Items present in reference that we collapse differently.** Reference Archives is a Bootstrap
   `dropdown` (`li.nav-item.dropdown`, AUD[23]) with a `dropdown-toggle` caret (`::after` content,
   AUD[24].after). Ours renders Archives as a plain button that opens a modal and *always* shows its
   children inline (`RoomSidebar.svelte:108–138`) — no dropdown caret, no collapse. Structural delta.

7. **Role differences.** OURS gates the Admin group on `canManage` (`RoomSidebar.svelte:162`), so
   member view drops items 9–13 (confirmed: member menu enumerates 9 rows, presenter 14). The
   reference capture shows **NO role difference at all** (identical arrays). So our role‑gating is a
   behaviour the reference capture does not corroborate (GAP — the reference admin capture may simply
   not expose admin items in the sidebar at this width).

8. **Close (X) button.** Ours adds an absolutely‑positioned `.close` button top‑right of the powered
   block (`RoomSidebar.svelte:46–50, 290–303`). The screenshot shows it overlapping the
   "ProTradingRoom.com" link text. No such button exists in the reference sidebar (the reference
   drawer is closed via the topnav hamburger only). Extra element — visual collision.

9. **Confirmed matches (no action):** width 250 / white bg / inner #676767 14px / Open Sans /
   nav-item 5px 2px / item 8px 0 + 0 5px margin + weight 700 / `.pl-2` 8px label gap / `.ps-1` 4px /
   FA5 Free weight‑900 icons at 14px / PTR link #45a2ff underlined 0 5px / Mobile App Info btn
   #6c757d 4px 8px r4 / caps centered ticks / all four roster btn colors (#f4f4f4·#45a2ff /
   #6c757d·#fff / #45a2ff·#f4f4f4) and the search btn margin‑left:0 leftmost ordering.

---

## D. Screenshots

- Presenter drawer: `docs/forensics/shots/02-sidebar-presenter.png`
- Member drawer: `docs/forensics/shots/02-sidebar-member.png`

(Both captured at width 1988, drawer opened via the hamburger, clip 270×1180.)

---

## E. Evidence Gaps

1. **Extra menu items (A/V Settings, expanded Archives children, Admin group)** — the reference
   capture (`script-results/audit/sidebar.json`) was taken with these either absent or collapsed.
   It is NOT proven they are wrong; it is proven they are *not visible in the reference at capture
   time*. Cannot confirm correct glyphs/labels/order for these from evidence. Treat as
   under‑specified, not as confirmed defects.
2. **Role differences** — reference presenter and member arrays are identical, so there is no
   evidence for how (or whether) the reference differentiates admin vs member sidebar contents.
3. **Cog roster button styling** — reference AUD[40] `users-btns` is a `<div>` whose first child is
   a bare `fas fa fa-cog` glyph; **no colored button background/foreground was captured** for the cog
   (only reload/sort/search buttons are captured as real `<button>`s). Ours invents
   `#212529`/`#fff` (`RoomSidebar.svelte:506–509`) — flagged unverified in the file already. No
   evidence to confirm/deny.
4. **Canonical Version string** — `v4.0.1-c0fee8f5` is a build hash specific to the reference deploy;
   the correct dynamic value for our build is not derivable from the capture.
5. **Archives dropdown menu contents** — the reference `dropdown-toggle` (AUD[24]) was not expanded
   in the capture, so the actual dropdown items behind Archives are unknown.
6. **Roster list items** — reference `app-room-roster`/`.room-roster-list` (AUD[48/49]) were captured
   empty (height from layout only); per‑row avatar/name styling has no reference evidence, so our
   `.roster-item`/`.avatar`/`.roster-name` styling (`RoomSidebar.svelte:539–568`) is unverified.

---

## F. Prioritized Fix List (DO NOT IMPLEMENT — proposals only)

Ordered by evidence strength × visual impact. Each cites our file:line → exact change → reference.

1. **Item/sub-item hover background & color** — `RoomSidebar.svelte:410–413` and `:450–453`.
   Change to match the winning `!important` reference rule:
   ```css
   .item:hover:not(:disabled),
   .sub-item:hover:not(:disabled) {
     background: #111111;   /* ref rgb(17,17,17) !important wins cascade */
     color: inherit;        /* ref .sidebar-item { color: inherit !important } */
   }
   ```
   Reference: `proroom-ultra-admin-room.json` stylesheets — `.sidebar-item:hover{background-color:rgb(17,17,17)!important}` + `.sidebar-item{color:inherit!important}`.
   (Verify Svelte 5 scoping doesn't drop the rule; keep `:not(:disabled)`.)

2. **Separator opacity** — `RoomSidebar.svelte:357–361` (`.sep`). Add `opacity: 0.25;` so the rule
   reads `border:none; border-top:1px solid #676767; opacity:0.25; margin:5px 0;`.
   Reference: AUD[9].opacity = `0.25`.

3. **Roster mini button height** — `RoomSidebar.svelte:492–502` (`.mini`). Remove `line-height:0`
   (or set `line-height:21px`) and add `height:27px;` to hit the reference box.
   Reference: AUD[41/43/45].height = `27px`.

4. **Version string** — `RoomSidebar.svelte:55`. Replace literal `v0.0.1` with the build version.
   Reference label format: `Version: v4.0.1-c0fee8f5` (AUD[6].text). Confirm the canonical value
   (GAP E.4) before wiring; do not hard‑code the reference hash.

5. **Close (X) button collision** — `RoomSidebar.svelte:46–50 / 290–303`. The reference sidebar has
   no in‑drawer close button; at minimum stop it overlapping the PTR link. Decide (with product)
   whether to remove it entirely (matches reference) or reposition. No reference glyph for it (GAP).

6. **Reconcile extra items & dropdown structure** (BLOCKED on GAPs E.1/E.5) —
   `RoomSidebar.svelte:86–95` (A/V Settings), `:108–138` (Archives + inline children), `:162–200`
   (Admin group). The reference shows Archives as a *collapsed* `dropdown-toggle` and shows none of
   the other extras. Before changing, obtain a reference capture with the Archives dropdown expanded
   and an admin‑role sidebar capture; otherwise removing them risks regressing real features.

7. **Cog button styling** (BLOCKED on GAP E.3) — `RoomSidebar.svelte:506–509`. No captured
   background for the reference cog; leave as‑is and flagged until evidence exists.
