# Forensic Dossier 01 — Top Navbar + Presenter Broadcast Controls

> Surface: the fixed top navbar (`nav.topnav` → reference `nav.navbar...mainAppNav`) and
> the presenter `.nav-controls` broadcast cluster.
> Ground truth = the protradingroom.com reference captures. Every row cites `ours=X vs ref=Y`
> with the exact evidence file. Where a capture does not cover a thing, it is marked **EVIDENCE GAP**.

---

## A. Scope & Method

- **Our files under test**
  - `web/src/lib/components/RoomTopNav.svelte` (the navbar shell + bars / users / mobile / brand / talking / volume / reload).
  - `web/src/routes/rooms/[id]/+page.svelte` lines 335–343 (mounts `RoomTopNav`, passes `actions={stageActions}`) and lines 432–498 (the `stageActions` snippet = the broadcast `.ctrl` buttons).
  - `web/src/lib/components/Icon.svelte` (FA5 `<i class="fas fa-…">` renderer).
  - Tokens: `web/src/routes/layout.css` lines 10–16 (`--bg #0c2434`, `--bg-elev-2 #103d5c`, `--text #fff`, `--accent #45a2ff`).
- **Roles rendered** via `web/scripts/forensic-lib.mjs` `openRoom({role})`:
  - `presenter` = dev-bypass super-admin.
  - `member` = `/api/rooms/:id` response intercepted, capabilities downgraded to member.
- **Width** = **1988px**, deviceScaleFactor 1 — matches the audit slice width (`script-results/audit/topnav.json` nav rect w=1988) and `proroom-full-*` captures. The ultra-admin capture is **2027px**; element X-positions from it are width-relative and were re-derived against 1988 where needed.
- **Measurement** = `computed()` / `rect()` from the harness, normalised with `norm()` (rgb→hex, px rounded), diffed across the full `PROPS` set.
- **Evidence files consulted (ground truth):**
  - `script-results/audit/topnav.json` — `presenter[]` / `member[]` / `adminTargeted[]` computed styles. **Primary reference.** (Topnav region = indices 45–59.)
  - `script-results/nav/nav-css.txt` — raw nav/control CSS rule blocks.
  - `docs/reference/captures/proroom-ultra-admin-room.json` → `.subtrees.topnav` (57-node tree, 18 navbar nodes), `.controls` (156 buttons), `.cssVariables.root`.
  - `docs/reference/captures/proroom-full-presenter.json` / `proroom-full-member.json` — role confirmation (`.elements`).
- **Screenshots:** `docs/forensics/shots/01-topnav-{presenter,member}.png` (clip 0,0 → 1988×60).

### Headline structural truth (decides most verdicts below)
The reference top navbar (`mainAppNav`) — at admin/presenter/member — contains **exactly these and nothing else**, left→right:
`span.sidebar-menu` (bars) → `span.users` (user pill) → `span.mobile-info-app-btn` (mobile) → `a.navbar-brand > img.brand-logo` → `div.collapse.navbar-collapse > ul.navbar-nav.ml-auto` → `li.talkingIndicator` ("( No one is speaking )") → `li.dropdown` (fa-2x fa-volume-up) → `li.nav-item` (fa-2x fa-sync).
Evidence: `proroom-ultra-admin-room.json` `.subtrees.topnav.nodes` = 18 nodes total (enumerated), and `audit/topnav.json` `presenter[45..59]`/`member[45..59]`.
**There is NO broadcast/share/camera/mic/CC/music/record/go-live/members button, NO "Connected" status pill, NO record dot, NO antenna icon, NO settings cog anywhere in the reference navbar.**

---

## B. Delta Table

Roles: P=presenter, M=member. Audit indices reference `script-results/audit/topnav.json` `presenter[]`.
"ref" rect X-values are from `audit/topnav.json` (1988px) unless noted.

| # | Element | Our selector | Property | Ours | Ref | Δ | Evidence | Verdict |
|---|---------|--------------|----------|------|-----|---|----------|---------|
| 1 | navbar | `nav.topnav` | height | 49px | 49px | 0 | audit[45].rect.h=49 | MATCH |
| 2 | navbar | `nav.topnav` | background-color | #0c2434 | #0c2434 | 0 | audit[45] bg `rgb(12,36,52)`; var `--navbar-bg #0c2434` | MATCH |
| 3 | navbar | `nav.topnav` | color | #ffffff | #ffffff | 0 | audit[45] `rgb(255,255,255)` | MATCH |
| 4 | navbar | `nav.topnav` | font-family | "Open Sans",… | "Open Sans", sans-serif | tail differs (fallbacks only) | audit[45] | MATCH |
| 5 | navbar | `nav.topnav` | font-size / weight / line-height | 16px / 300 / 24px | 16px / 300 / 24px | 0 | audit[45] | MATCH |
| 6 | navbar | `nav.topnav` | border (all) | 0 / none | 0 / none | 0 | audit[45] border-*-width 0 | MATCH |
| 7 | navbar | `nav.topnav` | padding | 0 | 0 | 0 | audit[45]; nav-css.txt:236 `.navbar{padding:0;height:49px}` | MATCH |
| 8 | bars box | `.menu-btn` | background-color | #103d5c | #103d5c | 0 | audit[46] `rgb(16,61,92)`; var `--sidebar-menu-bg #103d5c` | MATCH |
| 9 | bars box | `.menu-btn` | padding | 1px 5px | 1px 5px | 0 | audit[46]; nav-css.txt:220 | MATCH |
| 10 | bars box | `.menu-btn` | margin | 0 5px | 0 5px | 0 | audit[46]; nav-css.txt:218 | MATCH |
| 11 | bars box | `.menu-btn` | border | 1px solid transparent | 1px solid transparent | 0 | audit[46]; nav-css.txt:220 | MATCH |
| 12 | bars box | `.menu-btn` | rect | x=5 w=28 h=22 | x=5 w=28 h=31 | **h −9** | ours h=22 vs audit[46].rect.h=31 | **DELTA** |
| 13 | bars glyph | `.menu-btn i` (fa-bars) | font-size | 18px | 18px | 0 | audit[47] font-size 18px | MATCH |
| 14 | bars glyph | `.menu-btn i` | font-weight | 900 | 900 | 0 | audit[47] (FA5 solid) | MATCH |
| 15 | bars glyph | `.menu-btn i` | color | #ffffff | #ffffff | 0 | audit[47] `rgb(255,255,255)` | MATCH |
| 16 | bars glyph | `.menu-btn i` | rect | x=11 w=16 h=18 | x=11 w=16 h=18 | 0 | audit[47].rect | MATCH |
| 17 | user pill | `.users` | border | 1px solid #fff | 1px solid #fff | 0 | audit[48] border 1px solid `rgb(255,255,255)`; var `--users-border-color #fff` | MATCH |
| 18 | user pill | `.users` | padding | 1px 5px | 1px 5px | 0 | audit[48]; nav-css.txt:222 | MATCH |
| 19 | user pill | `.users` | **margin** | **0 5px** | **0 4px** | **±1px L/R** | ours margin-l/r=5px vs audit[48] margin-l/r=4px (`ml-1 mr-1`=0.25rem) | **DELTA** |
| 20 | user pill | `.users` | font-size / weight / line-height | 14px / 300 / 21px | 14px / 300 / 21px | 0 | audit[48] | MATCH |
| 21 | user pill | `.users` | color | #ffffff | #ffffff | 0 | audit[48]; var `--users-color #fff` | MATCH |
| 22 | user pill | `.users` | rect | x=43 w=37 h=25 | x=42 w=24 h=18 | **h +7, w +13, x +1** | ours rect vs audit[48].rect {x:42,w:24,h:18} | **DELTA** |
| 23 | user icon | `.users > i` (fa-user) | font-size | 14px | 14px | 0 | ultra topnav node `fas fa-user` font-size 14px | MATCH |
| 24 | user icon | `.users > i` | rect | x=49 y=18 w=12 h=14 | x=48 y=18 w=12 h=14 | x +1 (from #19) | ultra topnav `fas fa-user` rect {x:48,y:18,w:12,h:14} | MATCH (geom) |
| 25 | count | `.users .count` | font-weight | 300 | 300 | 0 | audit[48] inherited weight 300 | MATCH |
| 26 | mobile glyph | `.mobile-btn i` (fa-mobile) | font-size | 16px | 16px | 0 | audit[49] font-size 16px | MATCH |
| 27 | mobile glyph | `.mobile-btn i` | font-weight | 900 | 900 | 0 | audit[49] | MATCH |
| 28 | mobile glyph | `.mobile-btn i` | color | #ffffff | #ffffff | 0 | audit[49] `rgb(255,255,255)` | MATCH |
| 29 | mobile glyph | `.mobile-btn` | margin | 0 4px 0 0 | 0 4px 0 0 | 0 | audit[49] margin-right 4px (`mr-1`) | MATCH |
| 30 | mobile glyph | `.mobile-btn i` | rect | x=85 w=10 h=16 | x=70 w=10 h=16 | **x +15** | ours x=85 vs audit[49].rect.x=70 (cascade of #19/#22 + brand width) | **DELTA (position)** |
| 31 | brand | `.brand` (TEXT) | font-size / weight / line-height | 20px / 300 / 30px | 20px / 300 / 30px | 0 (typography) | audit[50] brand-logo style | MATCH (type) |
| 32 | brand | `.brand` vs `img.brand-logo` | element type | text `<span>` | `<img class="brand-logo">` 200×18 | **kind** | audit[50] tag=img w=200 h=18; nav-css.txt:228 `.brand-logo{max-width:200px;max-height:40px}` | **DELTA (structural)** |
| 33 | talking | `.talking` (`a` in li.talkingIndicator) | color | #ffffff | #ffffff | 0 | audit[53] `rgb(255,255,255)`; var `--presenter-noRecording-color #fff` | MATCH |
| 34 | talking | `.talking` | font-size | 16px | 16px | 0 | audit[53] font-size 16px | MATCH |
| 35 | talking | `.talking` | line-height | 41px | 41px | 0 | audit[53]; nav-css.txt:245 | MATCH |
| 36 | talking | `.talking` | margin | 0 5px | 0 5px | 0 | audit[53] margin-l/r 5px | MATCH |
| 37 | talking | `.talking` | rect.w | 150 | 157 | w −7 | ours w=150 vs audit[53].rect.w=157 (text "( No one is speaking )"; ours inline-flex on the text, ref wraps span.talking-string) | DELTA (minor) |
| 38 | volume wrap | `.volume .nav-link-btn` (`a.nav-link`) | padding | 8px | 8px | 0 | audit[55] padding 8px | MATCH |
| 39 | volume wrap | `.volume .nav-link-btn` | margin | 0 5px | 0 5px | 0 | audit[55] margin-l/r 5px | MATCH |
| 40 | volume glyph | `.volume i` (fa-volume-up) | font-size | 32px | 32px | 0 | audit[56] font-size 32px (fa-2x) | MATCH |
| 41 | volume glyph | `.volume i` | color | #abb0b5 | #abb0b5 | 0 | audit[56] `rgb(171,176,181)`; nav-css.txt:248 | MATCH |
| 42 | volume glyph | `.volume i` | weight | 900 | 900 | 0 | audit[56] | MATCH |
| 43 | volume glyph | `.volume i` | rect | x=1881 w=36 h=32 | x=1893 w=36 h=32 | x −12 | ours rect vs audit[56].rect {x:1893,w:36,h:32}; w/h match | MATCH (size) / DELTA (x) |
| 44 | reload wrap | `nav.topnav > .nav-link-btn` (`a.nav-link`) | padding | 8px | 8px | 0 | audit[58] padding 8px | MATCH |
| 45 | reload wrap | `nav.topnav > .nav-link-btn` | margin | 0 5px | 0 5px | 0 | audit[58] margin-l/r 5px | MATCH |
| 46 | reload glyph | reload `i` (fa-sync) | font-size | 32px | 32px | 0 | audit[59] font-size 32px (fa-2x) | MATCH |
| 47 | reload glyph | reload `i` | color | #abb0b5 | #abb0b5 | 0 | audit[59] `rgb(171,176,181)` | MATCH |
| 48 | reload glyph | reload `i` | rect | x=1943 w=32 h=32 | x=1943 w=32 h=32 | 0 | audit[59].rect {x:1943,w:32,h:32} | MATCH |
| 49 | right cluster anchor | reload glyph right edge | x≈1975 (1988-13) | x≈1975 (audit 1943+32) | 0 | both pin reload to viewport right minus ~13px | audit[59]; reload right edge matches | MATCH |
| 50 | record dot | `.nav-controls .ctrl[aria-label=Record]` (fa-dot-circle, +page:478) | exists in navbar? | YES (P only) | **NO** | **EXTRA** | ultra `.controls` has 0 broadcast btns; `.subtrees.topnav` 18 nodes none broadcast | **DELTA (extra)** |
| 51 | antenna / go-live | `.nav-controls .ctrl[aria-label="Go live"/"End broadcast"]` (fa-broadcast-tower, +page:490) | exists in navbar? | YES (P only) | **NO** | **EXTRA** | ditto; nav-css.txt:1 loads `.fa-broadcast-tower` glyph but it is never placed in navbar | **DELTA (extra)** |
| 52 | settings cog | `.nav-controls .ctrl[aria-label=Members]` (fa-cog, +page:495) | exists in navbar? | YES (P only) | **NO** | **EXTRA** | ditto | **DELTA (extra)** |
| 53 | share/camera/mic/CC/music | `.nav-controls .ctrl` (+page:435–475) | exists in navbar? | gated (hidden in this env) | **NO** | **EXTRA (when shown)** | ultra `.controls` 156 entries, 0 broadcast in navbar | **DELTA (extra)** |
| 54 | "Connected" status pill | `<ConnectionOverlay>` (+page:348) | in topnav? | separate overlay, not in nav | **NO nav pill** | **EXTRA / N/A** | no "Connected"/status element in `.subtrees.topnav` or `.controls` | **EVIDENCE GAP / EXTRA** |
| 55 | `.nav-controls` container | `nav.topnav .nav-controls` | exists | YES (P) | **NO** | **EXTRA** | `full-presenter`/`full-member` `class~nav-controls: 0` | **DELTA (extra)** |

---

## C. Structural / Behavioural Findings

### C1. The presenter `.nav-controls` broadcast toolbar does NOT exist in the reference navbar — EXTRA
- **Our code:** `web/src/routes/rooms/[id]/+page.svelte:342` passes `actions={stageActions}`; the snippet `stageActions` (`+page.svelte:432–498`) renders up to 9 `.ctrl` buttons (Share screen `:439`, Camera `:448`, Mic `:466`/`:460`, CC `:470`, Music `:473`, Record `:478`, Go live `:490`, Members `:495`). `RoomTopNav.svelte:87–89` wraps them in `<div class="nav-controls">`.
- **Reference:** `proroom-ultra-admin-room.json` `.subtrees.topnav.nodes` = 18 nodes, NONE are broadcast buttons. `.controls` (156 buttons) has **0** broadcast-class/icon hits in `mainAppNav` (only one `fas fa-desktop` "Screens" tab in the presentation area at x=1193, y outside the navbar). `proroom-full-presenter.json` / `proroom-full-member.json`: `class~nav-controls: 0`.
- **Verdict:** The entire `.nav-controls` cluster is an OURS-only addition. The FA glyphs it uses (`fa-broadcast-tower`, `fa-camera`, `fa-microphone`, `fa-music`, `fa-stream`, `fa-closed-captioning`, `fa-users-cog`) ARE present in `nav-css.txt:1–22` — i.e. they are loaded in the reference stylesheet, but the reference app never places them in the navbar. **EVIDENCE GAP: the captures do not show where (if anywhere) the real app exposes these broadcast actions** — so do not assume "remove"; assume "relocate / out of scope for the navbar." Treat the navbar match as: the navbar should NOT contain them.

### C2. PRESENTER currently renders only 3 of the toolbar buttons in this env (Record, Go-live, Members)
- **Measured (ours, presenter):** `nav-controls .ctrl` count = **3** → Record (fa-dot-circle), End broadcast (fa-broadcast-tower, blue `rgb(69,162,255)`), Members (fa-cog).
- **Why:** share/camera/mic/CC/music are gated by `caps?.can_publish_screen && !screenDisabled` (`+page.svelte:433`). In this environment LiveKit is unconfigured (console error `503 Service Unavailable`), so `screenDisabled` is true and those 5 buttons are suppressed. The 3 visible ones are gated only by `can_manage_room` / `can_manage_members` (`+page.svelte:477,482,493`), which the dev-bypass presenter has.
- **Behavioural note:** the go-live `.ctrl.live-on` renders accent blue `#45a2ff` (matches `--accent`), consistent with `RoomTopNav.svelte:345–348`. This is internally consistent but, per C1, the whole cluster is extra vs reference.

### C3. MEMBER has NO presenter toolbar — CONFIRMED
- **Measured (ours, member):** `nav-controls .ctrl` count = **0**; `_ctrls = []`. `.nav-controls` container present but collapsed to `rect w=0 h=0` (no children render because every branch in `stageActions` is capability-gated and member caps are all false).
- **Reference cross-check:** member and presenter navbars are byte-for-structure identical — `proroom-full-member.json` and `proroom-full-presenter.json` both report `sidebar-menu:1, talkingIndicator:1, brand-logo:1, mobile-info-app-btn:1, nav-controls:0`. `audit/topnav.json` `presenter[45..59]` === `member[45..59]`.
- **Verdict:** MATCH on the "member sees no broadcast controls" requirement. (The reference goes further: presenter ALSO sees none in the navbar — see C1.)

### C4. Brand is TEXT in ours, an IMG logo in the reference — structural delta
- **Our code:** `RoomTopNav.svelte:79` `<span class="brand">{roomName}</span>` (text "Pro Trading Room").
- **Reference:** `audit/topnav.json[50]` tag=`img`, class `brand-logo`, rect 200×18; `nav-css.txt:228` `.brand-logo{max-width:200px;height:auto;max-height:40px}`. The reference brand slot is `a.navbar-brand.ml-1.mr-auto > img.brand-logo` (ultra topnav nodes 6–7).
- **Note:** the reference brand `<a>` carries `mr-auto`, which is what pushes the right cluster to the far right. Ours uses a `.spacer{flex:1}` (`RoomTopNav.svelte:85,311–313`) to achieve the same — functionally equivalent (right cluster IS right-pinned in both), but the brand mechanism differs.

### C5. `.users` pill renders taller/wider than reference
- **Measured:** ours `.users` rect h=25 (icon+count line-boxes + gap 4.8px), ref h=18 (`audit[48].rect.h=18`). The inner `fa-user` icon matches exactly (14px, 12×14 rect). Root cause is our `gap: 0.3rem` (`RoomTopNav.svelte:266`) plus the count's 21px line-box exceeding the ref's tighter 18px box. Width inflated partly by gap and the count value width.

### C6. Right-cluster X-positions drift left by ~12px
- **Measured:** volume glyph ours x=1881 vs ref x=1893; talking block ours x=1713 vs ref x=1752 (ref at 2027 capture: 1924). Reload matches exactly (x=1943). The cumulative left-drift traces to (a) `.users` margin 5 vs 4 (#19) and (b) brand text vs 200px fixed logo width. Reload is right-anchored so it lands identically; the inner items pack slightly tighter.

### C7. Items present in OUR navbar but absent from the reference navbar (full extra inventory)
- `<ConnectionOverlay>` "Connected" pill (`+page.svelte:348`) — no equivalent in `.subtrees.topnav` or `.controls`. **EVIDENCE GAP** on whether the real app shows a transient connection toast elsewhere.
- All `.nav-controls` buttons (C1).
- No reference-side items are MISSING from our navbar — ours is a superset: every reference navbar element (bars, users, mobile, brand, talking, volume, reload) has a matching element in ours.

---

## D. Screenshots Produced

- `docs/forensics/shots/01-topnav-presenter.png` — shows the extra Record dot, blue broadcast-tower (antenna), and cog before "( No one is speaking )".
- `docs/forensics/shots/01-topnav-member.png` — clean navbar, no broadcast controls (matches reference structure).

---

## E. EVIDENCE GAPS (explicit — no targets invented for these)

1. **Where the reference exposes broadcast actions.** The captures prove they are NOT in the navbar, but do not show a presenter control surface elsewhere. The broadcast FA glyphs are loaded (`nav-css.txt:1–22`) yet unplaced. → Do not assume "delete"; the correct navbar target is "navbar contains none of them." Relocation target is unknown.
2. **"Connected" status pill.** No status/connection element appears in `.subtrees.topnav`, `.controls`, or the full captures. Our `ConnectionOverlay` may be legitimate transient UX, but it has **no reference counterpart to diff against.**
3. **Brand logo asset.** Reference uses `img.brand-logo` (200×18); the captures do not include the logo image bytes/URL, only the box. Our text brand cannot be pixel-matched without the asset. EVIDENCE GAP on the actual logo image.
4. **User-count value.** Ref `.users` rect (w=24) reflects whatever count the reference room had at capture; ours shows "1". The text value is data-dependent, not a style target.
5. **Hover/active states of volume & reload.** `audit/topnav.json` captures resting state; `:hover` accent for nav-links is inferred from `nav-css.txt:194` (`--app-link-color #45a2ff`) but not captured as a state for these two glyphs specifically.

---

## F. Prioritized Fix List (THIS surface only — DO NOT implement)

Ordered by visual/structural impact. Each: our file:line → exact change → reference number to hit.

1. **Remove the broadcast `.nav-controls` cluster from the navbar (highest impact, structural).**
   - `web/src/routes/rooms/[id]/+page.svelte:342` — stop passing `actions={stageActions}` to `RoomTopNav`; and `RoomTopNav.svelte:87–89` — drop the `{#if actions}<div class="nav-controls">…` block (Svelte 5: remove the `actions` snippet prop at `RoomTopNav.svelte:23,32` and the snippet render).
   - **Reference target:** navbar must contain **0** broadcast buttons (`proroom-ultra-admin-room.json` `.subtrees.topnav` = 18 nodes, none broadcast; `full-*` `nav-controls:0`). NOTE the EVIDENCE GAP (E1): relocate rather than delete the *functionality* — but the navbar target is zero.

2. **Decide the "Connected" pill against E2 before changing anything.**
   - `web/src/routes/rooms/[id]/+page.svelte:348` `<ConnectionOverlay>`. No reference target exists. **Do not "match" it to a number** — flag for product decision. If kept, it must not occupy the reference navbar's right cluster.

3. **`.users` pill margin 5px → 4px.**
   - `web/src/lib/components/RoomTopNav.svelte:275` `margin: 0 5px;` → `margin: 0 4px;`.
   - **Reference target:** `audit/topnav.json[48]` margin-left = margin-right = **4px** (Bootstrap `ml-1 mr-1` = 0.25rem). Fixes the ~1px x-shift cascade (#19, #30).

4. **`.users` pill height 25px → 18px.**
   - `web/src/lib/components/RoomTopNav.svelte:263–277` — the `gap: 0.3rem` (line 266) and stacked line-boxes inflate height to 25px. Tighten so the box is 18px (e.g. reduce gap and let the 14px/21px content + 1px padding + 1px border resolve to 18px, matching `align-items:center`).
   - **Reference target:** `audit/topnav.json[48].rect.h = 18` (w≈24 for a 1-char count).

5. **Brand: text span vs `img.brand-logo` (structural — depends on E3 asset).**
   - `web/src/lib/components/RoomTopNav.svelte:79` `<span class="brand">{roomName}</span>`.
   - **Reference target:** `<img class="brand-logo">` box 200×18, `max-width:200px; max-height:40px` (`nav-css.txt:228`; `audit/topnav.json[50]`). Blocked on obtaining the logo asset (E3). Typography of the current text already matches (20px/300/30px), so this is structural-only.

6. **Right-cluster left-drift (~12px) — derivative of #3 and #5.**
   - No standalone change. Fixing #3 (users margin) and #5 (200px fixed brand width) should pull volume/talking X back toward ref (volume ref x=1893 vs ours 1881). Re-measure after #3/#5. Reload already MATCHES (x=1943), so no anchor change is needed.

7. **Bars box height (`.menu-btn` h=22 vs ref 31) — cosmetic.**
   - `web/src/lib/components/RoomTopNav.svelte:231–236`. Ref `.sidebar-menu` resolves to h=31 (font-size 18px → line-height 27px + 1px padding ×2 + 1px border ×2). Ours is 22 because `.icon-btn{line-height:0}` (`RoomTopNav.svelte:226`) collapses the box. The bars glyph itself matches (18px, 16×18). Low priority — the visible glyph is identical; only the clickable box height differs.

> Constraints honored: Svelte 5 runes only; all referenced glyphs (`fa-bars`, `fa-user`, `fa-mobile`, `fa-volume-up`, `fa-sync`, `fa-broadcast-tower`, etc.) are FA5 Free 5.8.1 and validated present in `nav-css.txt` / FA stylesheet. No money/i64 surface here. No source modified by this dossier.
