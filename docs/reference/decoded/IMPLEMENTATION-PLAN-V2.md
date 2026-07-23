# IMPLEMENTATION-PLAN-V2 — master synthesis (evidence-driven, modal-first)

> Supersedes `IMPLEMENTATION-PLAN.md` (prior 17-surface pass). This V2 folds in the **8 fresh
> per-JSON decodes** in `captures/` (the new authority), re-diffs the modal palette + every surface
> against our live `web/src`, and lists honest gaps and already-verified matches.
>
> **Precedence for every conflict (user's rule):** rendered capture > bundle template > stylesheet >
> prose. Where two decodes disagree, the one closer to a *rendered computed style* wins; a prose
> summary never overrides a `getComputedStyle` value.
>
> **Item grammar:** `[Pn] <component:where> — EVIDENCE: <decode.md § / cited JSON locator> → FIX:
> <file:line, exact value> → VERIFY: <computed-style / screenshot check>`.
> **Severity:** P1 = visible in the default render every session · P2 = state-dependent (open a
> modal / toggle / role) · P3 = rare / gated / needs backend.
>
> **No item without a citation. Plan only — no code was modified.**
> (MCP note: the svelte MCP is unauthenticated in this session; irrelevant here since this is a plan
> doc, but any code edits that follow MUST run `mcp__svelte__svelte-autofixer` per CLAUDE.md.)

---

## §0 — Evidence index (one line per input; coverage proof)

**A. The 8 fresh per-JSON decodes — `docs/reference/decoded/captures/*.md` (AUTHORITY):**

| Decode file | Authoritatively covers | Coverage proof (processed == total) |
|---|---|---|
| `proroom-all-admin.md` | The **only full-size ADMIN** capture: 294-token `:root`, admin dropdowns (Archives→Alert/Chat Logs), `#alerts-logs-modal`+`#chat-logs-modal` interiors (`By: admin@protradingroom.com`, `Channel: main/offTopic`), Muted/Followed modals, roster-cog, 12 rendered modal states, QA-count buttons `(2)✅`. | **2188 == 2188 elements**; `cssVariables root==body` 294/294; 27 states decoded. |
| `proroom-NUCLEAR-member.md` | Authority for **"what a MEMBER must NOT see"**: 3-item alert kebab / 4-item chat kebab, member composer = one `+`, `msg-box-adm` #d7d7d7 in member main-chat, staff tools present-but-untriggerable. | **nodeCount sum == 6460**; 294 rootVars; 12 states. **Caveat: collapsed-mobile (`body` width 110px) — colours/structure valid, pixel widths are mobile.** |
| `proroom-full-presenter.md` | Presenter chat-row chrome (`msg-box-adm` + `flex-row-reverse`, avatar right x≈310, kebab far-right x≈349), presenter composer extras (Paste YouTube URL, Q&A composer), Session Control shell, `.msg-box-adm{bg var(--msgs-bg-adm);border-bottom:2px;padding-top:2px}` CSS verbatim. | PRIMARY **2184 == 2184**; `root==body` 294/294 byte-identical; 15 states. |
| `evidence-folder-proroom-NUCLEAR.md` | Desktop-width MEMBER render (1933×1265): full `domHtml` (1.7MB) with exact markup, message anatomy computed styles (55 props), split ratio (left ≈48% / right ≈42.98%, 11px gutter), 6 note tabs, hidden modal templates. | **9000 == 9000 elements**; `cssVariables root==body` 294 each. **Caveat: OFFLINE at capture — all 8 `modals` resolved to the same "Offline" user-info popup (real modal interiors NOT captured).** |
| `proroom-ultra-admin-room.md` | The **live-room token authority** (3 admin captures, byte-identical 294 vars): admin msg render (`msg-box-adm` = #f4f4f4 + 2px top-pad over #fff), **3-tier author colors #e8e8e8 admin / #d7d7d7 bot / #0a6db1 member**, `[REC]`+`TG` talking, live `webcamScreen` share, 4-region split rects. | PRIMARY **2639 == 2639** (uncapped); 294 root==body across all 3 files. |
| `proroom-member-set.md` | Member-side authority (3 files A/B/C): composer exact computed (holder 45px #ccc/8px, textarea 35→300px #676767 14px/400), **kebab LEFT of avatar, flex-row NOT reverse (0 reverse)**, **no `By:` email on member rows** (0 matches / 1178 els), 294 vars byte-identical across A/B/C. | A **1178==1178**, B **2142==2142**, C 1173; `root==body` and A==B==C 0 diffs. |
| `proroom-modals-and-deep.md` | **★ THE MODAL PALETTE authority** (4 files): the one captured modal (User-Info/Offline) shell computed — `.modal-content` #103d5c/#f4f4f4, border `rgba(0,0,0,.176)`, radius **8px**, header divider #45a2ff **style:none (invisible)**, footer divider #45a2ff **solid**, footer btn-primary **#0a6db1**, **Offline badge #E74C3C** (`--danger`, NOT `#dc3545`, NOT `#bb352a`); pane interiors (note tab bar #0c2434 + border-top #0a6db1, active note tab #45a2ff, home badge #00bc8c, note body #fff/#676767, sticky toolbar #f4f4f4, Download #92d528); responsive tab flip at ≤833px. | 8 modal keys → **1 unique shell**; 294 vars 3 files consistent; 12/12 & 12/12 targets; 8/8 states (5 populated). |
| `script-results-and-manifests.md` | Region probes at **2027px** (topnav/sidebar/presentation exact rects+computed), FA glyph→codepoint map, label→glyph dict (31+42), the **85-token `ref-theme.json`**, and — decisively — the **`_gap-findings-raw.json`: 52 fragments / 590 gaps mapping reference `fileN.html:line` → our Svelte component** with status(mismatch 376/ok 172/missing 42)+priority(high 136). | topnav 18/18, sidebar 52/52, presentation 68/68 nodes; iconmaps 31+42; theme 85; gaps 590; 13-surface rollup. |

**B. Prior bundle-template decodes — `docs/reference/decoded/*.md`** (17 surface files + emoji): the prior
`IMPLEMENTATION-PLAN.md` distilled these into the §1–§17 diff below. They remain valid for per-surface
computed values (chat-composer, chat-panel, top-nav, modals-core, modals-admin, alerts-panel, poll, notes,
color-system, theme-tokens, etc.); the fresh A-decodes **corroborate and in a few cases correct** them
(see §MODALS and the CONTRADICTIONS list). Coverage of each was asserted in that file's own header.

**C. Our implementation — `web/src`** (read for this plan): `Modal.svelte`, `routes/layout.css`
(193 lines, the token layer), the 26 `modals/*.svelte`, `AlertQaModal.svelte`, `PollModal.svelte`,
`Lightbox.svelte`, `Split.svelte`, `UserInfoModal.svelte`, `AlertFeed.svelte`, `ChatPanel.svelte`.
The token layer already bakes the authoritative navy palette (`--modal-bg:#103d5c`,
`--tab-active-bg:#45a2ff`, etc.); most divergences are per-component semantic-token mis-mappings, not
missing tokens.

---

## §1 — MODALS (FIRST — user order: "fix all the modal colors to match perfectly")

### §1.0 — The definitive modal palette (build this table into review; every value cited)

From `proroom-modals-and-deep.md` (the ONE rendered modal + the 294-var table, cross-checked identical in
`proroom-all-admin.md §3.4`, `-NUCLEAR-member.md §3 Modals`, `-full-presenter.md §3e`, `-member-set.md §3`):

| Part | Token / class | Value (hex) | Evidence |
|---|---|---|---|
| **Shell bg** | `--modal-content-bg-color` | **#103d5c** `rgb(16,61,92)` | modals-and-deep §Shell `[0]`; ultra-admin §3b |
| **Shell text** | `--modal-content-color` | **#f4f4f4** | modals-and-deep §Shell `[0]` |
| **Shell border** | (computed, not token) | **`1px solid rgba(0,0,0,0.176)`** (= `--bs-border-color-translucent .175`) | modals-and-deep §Shell `[0]` "border (all sides)" |
| **Shell radius** | (`--bs-border-radius-lg`) | **8px** (all corners; header/footer inner 7px = 8−1) | modals-and-deep §Shell; all-admin §3.4 rendered confirm |
| **Header divider** | `--modal-tabs-border-color` | #45a2ff **but `border-style:none` → does NOT render** | modals-and-deep §Shell `[1]` "border-bottom style none" |
| **Footer divider** | `--modal-tabs-border-color` | **#45a2ff `solid` (DOES render)** | modals-and-deep §Shell `[8]` |
| **Modal title h5** | `.modal-title` | **20px / 500 / #f4f4f4** (a bare-h3 title computed 28px/500) | modals-and-deep §Shell `[4]`; all-admin §5.5 |
| **Close btn** | `.btn-close.btn-close-white` | inline SVG "×" `fill=#000` @ **opacity 0.5** (white-invert NOT applied in the captured build — verify vs live before forcing white) | modals-and-deep §Shell `[6]` + Honest gap 3 |
| **Filled primary / Close btn** | `--modal-btn-close-bg` | **#0a6db1** (NOT `--primary` #375a7f, NOT `--bs-primary` #0d6efd) | modals-and-deep §Buttons `[15]` — "THE OWN-COLOR FINDING" |
| **Danger / delete btn** | `--modal-btn-danger-bg/-border` | **#bb352a** | all/member/presenter §Modal tokens |
| **Success / download btn** | `--modal-btn-success-bg/-border` | **#92d528** | all/member/presenter §Modal tokens |
| **Active tab** | `--modal-active-tab-bg/-border` / `-color` | **#45a2ff** / #45a2ff / **#fff** | all §3.4; member §3 |
| **Tabs border** | `--modal-tabs-border-color` | **#45a2ff** | all §3.4 |
| **Input-group / upload / links** | `--modal-input-group-bg` / `-upload-files-color` / `-alert-link-color` | **#0a6db1** | all §3.4 |
| **Checkbox fill** | `--checkbox-bg-color` | #45a2ff (round 20px swatch, #ccc unchecked) | modals-core.md; all §3 |
| **btn hover** | `--modal-btn-hover-opacity` | **0.9** | all §3.4 |
| **Archives/Session dropdown bg** | `--archives-dropdown-menu-bg-color` / `--session-control-dropdown-bg` / `--users-badge-bg-color` | **#0e3651** | all §3.2/§5.1 |
| **★ Offline status badge** | `.badge.badge-danger` → Darkly `--danger` | **#E74C3C** `rgb(231,76,60)` (NOT `--bs-danger` #dc3545, NOT `--modal-btn-danger` #bb352a) | modals-and-deep §Shell `[5]` + "own-color finding" |
| **★ Online / Welcome-Mat badge** | `.badge.badge-success` → Darkly `--success` | **#00bc8c** `rgb(0,188,140)` (NOT `--modal-btn-success` #92d528) | modals-and-deep §pane:Notes `[6]`; ref-presentation node 28 |
| **Outline-info btn (Follow)** | `.btn-outline-info` → `--bs-info` | **#0dcaf0** border/text, transparent bg | modals-and-deep §Buttons `[11]` |
| **Outline-warning btn (Mute)** | `.btn-outline-warning` → `--bs-warning` | **#ffc107** border/text, transparent bg | modals-and-deep §Buttons `[13]` |
| **Outline-light btn (@Mention / Private Chat)** | `.btn-outline-light` → `--bs-light` | **#f8f9fa** border/text, transparent bg | modals-and-deep §Buttons `[9]/[10]` |
| **Secondary btn (Close on some modals)** | `.btn-secondary` → `--bs-secondary` | **#6c757d** | member/all §6 buttons |

> **The single most important nuance the fresh decode surfaces:** the app deliberately mixes TWO color
> scales in one footer. `badge-danger`/`badge-success` resolve to **Darkly** `--danger #E74C3C` /
> `--success #00bc8c`; the modal **buttons** use the proroom `--modal-btn-*` (#0a6db1 / #bb352a / #92d528);
> and `btn-outline-*` use **Bootstrap** `--bs-info/-warning/-light` (#0dcaf0 / #ffc107 / #f8f9fa). A badge
> and a button that both look "red" are #E74C3C vs #bb352a — different tokens.

### §1.1 — Per-modal-component diff (each mismatch = one item)

Our token layer (`routes/layout.css`) is faithful: `--modal-bg:#103d5c`, `--modal-color:#f4f4f4`,
`--modal-close-bg:#0a6db1`, `--modal-danger:#bb352a`, `--modal-success:#92d528`,
`--modal-active-tab-bg:#45a2ff`, `--modal-input-bg:#0a6db1`, plus Darkly `--positive:#00bc8c` /
`--negative:#e74c3c` at `:root`. `Modal.svelte` already sets radius **8px** and blue header/footer
dividers. So the fixes below are **per-component token mis-mappings**, not the shell.

- **[P1] `modals/UserInfoModal.svelte:184` — Offline badge is the WRONG red.** The badge uses
  `background: var(--modal-danger, #e74c3c)`, but `--modal-danger` resolves to **#bb352a** (the *button*
  danger), so the Offline badge paints #bb352a. Reference `badge-danger` computes **#E74C3C**.
  EVIDENCE: `proroom-modals-and-deep.md §Shell [5]` (`rgb(231,76,60)` = #E74C3C = `--danger`, "NOT
  `--bs-danger #dc3545`"). → FIX: `modals/UserInfoModal.svelte:184` `background: var(--negative, #e74c3c)`
  (the Darkly `--negative` token in layout.css:29), not `--modal-danger`. → VERIFY: DevTools computed
  `background-color` on `.status-badge.offline` = `rgb(231,76,60)`.
- **[P1] `modals/UserInfoModal.svelte:180` — Online badge is the WRONG green.** Uses
  `var(--modal-success, #00bc8c)`; `--modal-success` = **#92d528** (button green). Reference
  `badge-success` computes **#00bc8c**. EVIDENCE: `proroom-modals-and-deep.md §pane:Notes [6]`
  (`rgb(0,188,140)` = #00bc8c = Darkly `--success`); `ref-presentation` node 28 same.
  → FIX: `background: var(--positive, #00bc8c)` (layout.css:28), not `--modal-success`.
  → VERIFY: computed = `rgb(0,188,140)`.
- **[P2] `modals/MutedUsersModal.svelte:90-91` — muted badge/indicator uses `--modal-danger` (#bb352a)**
  where a `badge-danger` semantic (#E74C3C) is intended. EVIDENCE: same badge-danger token proof
  (modals-and-deep §Shell `[5]`). → FIX: if it is a `badge-danger`-role chip, point at `--negative`
  #e74c3c; if it is a delete *button*, #bb352a is correct — inspect the element role first.
  → VERIFY: computed matches the intended token.
- **[P2] `Modal.svelte:169` — shell border color.** We set `border:1px solid var(--modal-border)` =
  **#103d5c** (navy on navy = invisible edge). The captured shell border is
  **`rgba(0,0,0,0.176)`** (a faint dark hairline). EVIDENCE: `proroom-modals-and-deep.md §Shell [0]`
  "border 1px solid rgba(0,0,0,0.176)". → FIX: `Modal.svelte:169` border-color →
  `rgba(0,0,0,0.176)` (or a `--modal-border-translucent` token). → VERIFY: `.panel` computed
  `border-top-color` = `rgba(0,0,0,0.176)`. *(Low visual impact — on a dark backdrop the navy edge and
  the translucent-black edge look near-identical; include for pixel-parity.)*
- **[P2] `Modal.svelte:195` — header divider renders; reference header divider is INVISIBLE.** We set
  `.head{border-bottom:1px solid #45a2ff}` (a visible blue line). The reference `.modal-header`
  border-bottom is #45a2ff **but `border-style:none`** → it does NOT paint; only the **footer** divider
  is `solid`. EVIDENCE: `proroom-modals-and-deep.md §Shell [1]` ("style none … does not render") vs
  `[8]` ("footer border-top … DOES render, style solid"). → FIX: remove the header's rendered
  border-bottom (or set `border-bottom-style:none`); keep the footer `.foot` blue border-top as-is.
  → VERIFY: open any modal — header has no blue underline; footer keeps its blue top line.
- **[P2] `Modal.svelte:105-113,203-221` — close button "×" white-invert.** We render an
  `<Icon name="times">` in `--modal-color` (#f4f4f4 ≈ white). The captured `btn-close-white` computed
  to **black "×" @ opacity 0.5** (invert not applied in that build). EVIDENCE:
  `proroom-modals-and-deep.md §Shell [6]` + Honest gap 3 ("verify against a live screenshot before
  styling the × white"). → FIX: **do NOT change blindly** — this is a HONEST GAP (capture artifact vs
  intended). Keep white; flag for a live-screenshot check. → VERIFY: screenshot the live reference modal;
  if the × is white there, keep ours; if grey-black, match.
- **[P3] `modals/AlertLogsModal.svelte` / `ChatLogsModal.svelte` — interiors now have HARD reference
  data.** The fresh admin capture gives the real rows: white `.list-group-item` cards on the navy shell,
  each `strong.fw-bold`=date (`Oct 22, 2023` / `Jul 21, 2026`), `strong`"By: "+`i`
  `admin@protradingroom.com`, chat-logs adds `strong`"Channel: "+`i` `main`/`offTopic`; toolbar
  `button.btn-primary.my-2` "Reload Log List" (#0a6db1); dialog max-width **1000px**; footer
  `.btn-secondary` Close. Our components render a hardcoded-empty list + no footer + `.reload` custom
  class. EVIDENCE: `proroom-all-admin.md §5.5/§5.6` (rendered rows, By:/Channel:) + gap-findings `[0]`
  file14.html (10 gaps) & `[15]` file15.html (8 gaps) + prior plan §14. → FIX: size both to
  `maxWidth={1000}`, render `list-group-item`-style rows with `fw-bold` date / "By: {email}" /
  "Channel: {main|offTopic}" (chat only), admin-gate the `By:` email, add the `.btn-secondary` Close
  footer. → VERIFY: as admin, Chat Logs is ~1000px with date/By/Channel rows; By: is hidden for members.
- **[P3] `modals/FollowedUsersModal.svelte` vs `MutedUsersModal.svelte` — per-modal Close button + z-index
  + title text.** Reference: Muted Close = `.btn-primary` (**#0a6db1**), title **"Muted Chat Users"**,
  z-1055; Followed Close = `.btn-light` (**#f8f9fa**, black text), title **"Followed Chat Users"**,
  **z-1054** (deliberately below the standard modal layer). Ours: both `.btn ghost`; titles "Muted /
  Ignored Users" and "Followed Users". EVIDENCE: `proroom-all-admin.md §5.7/§5.8` (title strings, Muted
  Close btn-primary #0a6db1, Followed Close btn-light, z 1055/1054) + gap-findings `[23]` file2 items
  14/15. → FIX: Muted title "Muted Chat Users" + Close #0a6db1; Followed title "Followed Chat Users" +
  Close #f8f9fa/black + panel z 1054. → VERIFY: titles match verbatim; Muted Close is blue, Followed
  Close is light-gray and can stack under another modal.
- **[P3] `AlertQaModal.svelte` — quoted `.admin-alert` block + static backdrop.** Reference `#alertQAModal`
  max-width 600px, min-body 330px, `.admin-alert` 1px #444 quote (gravatar+username+timestamp+alert
  text), `#textAreaQATxt` "Type your question here...", `data-backdrop="static" data-keyboard="false"`
  (backdrop/ESC do NOT close). Our shared `Modal` closes on backdrop+ESC and (per gap-findings `[9]`)
  strips the admin-alert block. EVIDENCE: `proroom-all-admin.md` (Q&A modal in `modalsInDom` +
  `alert-qa` "Ask a question") + reply-qa-pm.md DOM B + gap-findings `[9]` file19.html.
  → FIX: pass a `dismissable={false}` flag to Modal for QA; render the `.admin-alert` quoted block.
  → VERIFY: clicking the QA backdrop leaves it open; the quoted alert renders above the composer.
- **[P3] `PollModal.svelte` — Send Poll green is #198754, not #92d528.** Reference "Send Poll" is
  `.btn-success` resolving through the BS5 layer to **#198754** (NOT Darkly #00bc8c, NOT modal #92d528);
  Add Choice / Save To Canned are `.btn-outline-light` (#f8f9fa); step badges are UNSTYLED inline text
  (no yellow pill). Our PollModal:650 already uses #198754 and :513/:634 #f8f9fa outline ✅.
  EVIDENCE: `poll.md Resolved` (.btn-success #198754, .btn-outline-light #f8f9fa) + gap-findings `[10]`
  file13.html items 0/5/6. → FIX: none for the button colors (already correct); ensure step numbers
  render as plain inline text (gap `[10]` item 0). → VERIFY: Send Poll computed = #198754; "1/2/3"
  render as bare numbers.
- **[P3] `Lightbox.svelte` — imgur-modal shell.** Reference image lightbox is a bootbox `.imgur-modal`
  `.modal-lg` (min-width 90% / min-height 80%), `.modal-content` **#103d5c**, centered image
  (max-height `calc(100vh−150px)`), `<hr>` + "Download Image" `.btn-primary` #0a6db1 (btn-sm).
  EVIDENCE: overlays-toasts.md DOM 3 (imgur). → FIX: navy #103d5c content, 90%/80% dialog, centered img,
  Download-Image #0a6db1 button. → VERIFY: opening a chat image shows a large centered navy lightbox with
  a blue Download button.

> **HONEST GAP for the rest of the modal SET:** `proroom-modals-and-deep.md` captured **only one** modal
> interior (the User-Info/Offline popup, 8× deduped). Settings / AV / Post-Alert / Poll / WebRTC /
> Session-Control / Advanced-Search / Scheduled / All-PM / Send-Report / Reply modal **bodies** are NOT
> in the fresh rendered evidence — their palettes are the shared shell above (safe), but their per-field
> layouts come only from the bundle-template decodes (§B) + the gap-findings structural diffs (they are
> Bootstrap→Svelte structure mismatches, not color mismatches). Do NOT invent modal-body colors.

---

## §2 — Per-surface gap list (EVIDENCE → FIX → VERIFY, severity-tagged)

> These fold the prior `IMPLEMENTATION-PLAN.md` §1–§17 (still valid per-surface computed values) with the
> fresh decodes. Items already ✅ in the prior plan and re-confirmed by a fresh decode are in §4.

### 2.1 Top-nav (`RoomTopNav.svelte`)
- **[P2]** Sidebar-open hamburger should swap `fa-bars` → `fa-arrow-left` + `.active-icon`
  (color/border #45a2ff, radius 5px). EVIDENCE: top-nav.md §States (active-icon rule); ref-topnav shows
  the closed `fa-bars` at `#0c2434` bg #fff. → FIX: render arrow-left + `.active-icon` when sidebar open.
  → VERIFY: open sidebar → blue-bordered left arrow.
- **[P2]** Volume icon should track level (`fa-volume-up`>50 / `-down` 4–50 / `-off`<4); we only swap
  up/mute. EVIDENCE: top-nav.md §States; ref-topnav `fa-volume-up` #abb0b5 (`rgb(171,176,181)`).
  → FIX: derive glyph from `volume`. → VERIFY: drag 60→20→2 shows 3 glyphs.
- **[P3]** `[ REC ]` + talking initials cluster is a live-presenter surface only in the admin capture
  (`li.recIndicator`"[ REC ]", `li.talkingIndicator > a.talking` "TG"). EVIDENCE:
  `proroom-ultra-admin-room.md §4a`. → FIX: render `[REC]` (#45a2ff) + talking initials when a presenter
  is live/recording. → VERIFY: with a recording presenter, both indicators show.

### 2.2 Sidebar / roster (`RoomSidebar.svelte`)
- **[P1]** Roster kebab 3rd item should be **Private Chat** (`fa-comments`, `startPC`), not Copy.
  EVIDENCE: roster.md DOM; but note the fresh member/presenter/admin captures show the **message/alert**
  kebab is User Info / Mention / Copy (alerts) and User Info / Mention / Reply / Add Reaction (chat) —
  the *roster-row* kebab (Private Chat) is a separate, off-canvas surface (HONEST GAP §3). → FIX: roster
  kebab → Private Chat; leave message kebabs as the fresh-decode item sets. → VERIFY: roster ⋮ opens PM.
- **[P2]** Roster count should be a navy pill (`.badge` bg **#0e3651** / text **#f4f4f4**), not plain
  #676767. EVIDENCE: roster.md Resolved (.active-room-users .badge); ultra-admin `--users-badge-bg-color
  #0e3651`. → FIX: wrap count in a #0e3651/#f4f4f4 badge. → VERIFY: count is a navy pill.
- **[P2]** Roster toolbar button colors (from ref-sidebar computed, 2027px): reload `#f4f4f4` bg /
  `#45a2ff` icon; search `#45a2ff` bg / `#f4f4f4` icon; sort `#6c757d` bg / #fff; cog `#212529` bg / #fff.
  EVIDENCE: `script-results-and-manifests.md ref-sidebar` nodes 41/43/45/47 (computed bg+color) +
  gap-findings `[23]` file2 item 2 (our .mini-* already hardcode these; cog flagged unverified —
  ref-sidebar node 41 confirms **#212529**). → FIX: confirm `.mini-cog` = #212529 (now verified).
  → VERIFY: computed bg of each of the 4 roster buttons matches.
- **[P1] (structure, gap-findings)** Sidebar item markup is Bootstrap `<a.nav-link.sidebar-item>` (14px /
  **weight 700** / color **#676767** / padding 8px 0 / margin 0 5px); we use `<button.item>`. EVIDENCE:
  `ref-sidebar` node 16/20/24 (computed 14px/700/#676767) + gap-findings `[4]`,`[22]`,`[23]`. → FIX:
  this is a documented framework divergence — match the *computed* 14px/700/#676767 on our buttons (not
  the tag). → VERIFY: computed sidebar-item = 14px/700/rgb(103,103,103).

### 2.3 Split / gutters (`Split.svelte`, `AlertsChatDock.svelte`)
- **[P1]** Desktop split ratio: LEFT `alert-chat-box` ≈ **26.73%** (`flex-basis:calc(26.7319% − 2.94px)`),
  col gutter **11px** bg **#0a6db1**, RIGHT `presentation-box` ≈ **73.27%**
  (`flex-basis:calc(73.2681% − 8.06px)`, bg **#0f2e43**). Inner vertical split alert 30% / chat 70% with
  an 11px row gutter. EVIDENCE: `proroom-all-admin.md §4.3` (exact calc()s + gutter #0a6db1 + valuenow
  26.73). (The evidence-folder member capture shows ≈48/42.98 — that's a user-dragged session, NOT the
  default; the admin default 26.73/73.27 wins per rendered-capture precedence.) Our Split.svelte already
  models `as-percent` calc() basis + 11px #0a6db1 gutter ✅. → FIX: confirm the **default** split ratio
  seeds to ~26.73/73.27 (not 50/50). → VERIFY: fresh room load → left pane ~27% width, gutter 11px
  #0a6db1.

### 2.4 Stage / mainTabs (`MainStage.svelte`, `ScreenStage.svelte`)
- **[P1]** 3 top tabs Screens · Notes · Files (Streams hidden between Screens and Notes). Active generic
  tab = **#45a2ff** 3px pill / #fff 12px/12px; active NOTES tab = special folder (**#0c2434** bg,
  **#0a6db1** top border, 3px 3px 0 0 radius, 15px bottom padding). EVIDENCE:
  `script-results ref-presentation` nodes 4/10/16 + `proroom-full-presenter.md §4c/§5`
  (Screens active bg #45a2ff, Notes active bg #0c2434 padding 8/8/15/8). Responsive: at ≤833px the
  active pane flips Screens→Notes and the active-tab treatment flips pill↔navy-folder
  (`proroom-modals-and-deep.md File 3`). Our MainStage already models this ✅. → VERIFY: active Notes tab
  computed bg = rgb(12,36,52), border-top #0a6db1.

### 2.5 Notes (`NotesPanel.svelte`)
- **[P1]** Note tab strip navy **#0c2434** + `1px #0a6db1` top border; active note tab **#45a2ff** 3px
  pill / #fff. EVIDENCE: `proroom-modals-and-deep.md §pane:Notes [1]/[3]`; `ref-presentation` node 23/25.
  → FIX: paint the note tab strip navy with blue active pills. → VERIFY: strip = #0c2434, active tab
  #45a2ff.
- **[P1]** `.noteOptions` sticky bar (#f4f4f4): **Download** `.noteDownload` **#92d528**/#fff (14px/400,
  padding 4/8, radius 4) · **Edit** `#45a2ff` · **Delete** `#bb352a`. EVIDENCE:
  `proroom-modals-and-deep.md §pane:Notes [42]/[44]` (toolbar #f4f4f4 sticky, Download #92d528);
  `ref-presentation` node 64/66 (noteOptions #f4f4f4, Download #92d528); notes.md `--note-*` tokens.
  → FIX: Download→#92d528, Edit→#45a2ff, Delete→#bb352a on the sticky #f4f4f4 bar.
  → VERIFY: Download computed = rgb(146,213,40); bar = #f4f4f4.
- **[P2]** 6 note tabs verbatim (welcome-mat home badge **#00bc8c**): `Welcome` (badge-success + fa-home) ·
  `JC's Daily Briefing` · `Henry's Workflowy Notes` · `Sam's Mag 7 index` ·
  `1on1 Coaching/ Prop Firm & Tool Discounts codes.` · `Taylor's Scorecard Rankings (…)`. EVIDENCE:
  `ref-presentation` nodes 28-55; `proroom-all-admin.md §4.5`; member/presenter §4.5. → FIX: green home
  badge (#00bc8c) on Welcome tab; verbatim labels. → VERIFY: Welcome tab shows a #00bc8c home pill.

### 2.6 Alerts panel (`AlertFeed.svelte`)
- **[P1]** Header `nav.alertHeader` **#0a6db1**/#fff, bell brand "Alerts", presenter Post-Alert
  (`fa-plus-circle`) + search + gear. EVIDENCE: `proroom-full-presenter.md §4e` / all-admin §4.6
  (alertHeader #0a6db1); ref-iconmap "Alerts"→bell. Our AlertFeed already models the header + filtered/DND
  badges ✅. → VERIFY: header computed bg = rgb(10,109,177).
- **[P2]** Alert-row QA button `.alert-qa` = `.btn-secondary` **#6c757d**/#fff, **10px/15px**, padding
  1px 3px, radius 4px, 18×19; count `(N)` + fa-question-circle + `✅`. EVIDENCE: `proroom-full-presenter.md
  §4d` (`.alert-qa{font-size:10px;padding:1px 3px}` verbatim CSS + bg #6c757d); member §4.4 (at narrow
  width text goes #1a1a1a). Note gap-findings `[17]` item 3 flags OUR `.alert-qa` bg as #eef4fb (light
  blue) — a DIVERGENCE from the reference #6c757d. → FIX: `.alert-qa` bg → #6c757d (not #eef4fb).
  → VERIFY: computed bg = rgb(108,117,125).

### 2.7 Chat rows (`ChatPanel.svelte`) — the 3-tier author + msg-box-adm system
- **[P1]** 3-tier author username color (class-driven, no inline): **admin/presenter #e8e8e8** · **bot
  #d7d7d7** · **member #0a6db1** (`--nickname-color`). EVIDENCE: `proroom-ultra-admin-room.md §4d`
  (author-tier table: #e8e8e8 Danielle/Sam/JC, #d7d7d7 LornaBot, #0a6db1 members; "class-driven, no inline
  colors"). Note member main-chat username is #0a6db1 (member §4.4). → FIX: map author badge tier →
  {#e8e8e8 admin, #d7d7d7 bot, #0a6db1 member}. → VERIFY: an admin row username computed = rgb(232,232,232).
- **[P1]** `msg-box-adm` (staff row in main chat): bg **#f4f4f4** (`--lightTheme-msgs-bg-adm`), **padding-top
  2px ONLY**, border-top 1px #e1e1e1 — everything else identical to `msg-box` (#fff). EVIDENCE:
  `proroom-ultra-admin-room.md §4d` ("bg #fff→#f4f4f4 and padding-top 0→2px; else identical"); presenter
  §4d verbatim `.msg-box-adm{background-color:var(--msgs-bg-adm);border-bottom:2px;padding-top:2px}`.
  (In the member main-chat the staff variant renders **#d7d7d7** — member §4.4 `[1955]` — but that is the
  member-tier shade; the admin-room capture's #f4f4f4 is the presenter/admin room render. Rendered-capture
  precedence: use `--lightTheme-msgs-bg-adm #f4f4f4` as the token, which both cite.) → FIX: `.msg-box-adm`
  bg #f4f4f4 + padding-top 2px. → VERIFY: computed bg = rgb(244,244,244), padding-top 2px.
- **[P1]** Presenter/admin own row is mirrored: `div.mr-1.d-flex.flex-row-reverse` (avatar RIGHT ≈x310,
  timestamp LEFT ≈x8, kebab far-right ≈x349); **member rows are flex-row, kebab LEFT of avatar, NOT
  reversed** (0 reverse across 1178 member els). EVIDENCE: `proroom-full-presenter.md §4d/§7.1`
  (flex-row-reverse presenter) vs `proroom-member-set.md §4.2/§7.2` (0 reverse, kebab x0 left of avatar
  x19). → FIX: apply flex-row-reverse only for is_presenter/admin authored rows. → VERIFY: an admin row
  has avatar on the right; a member row has kebab left of avatar.
- **[P1]** Message kebab item sets (fresh, authoritative): **alert row = User Info / Mention / Copy** (3);
  **main-chat row = User Info / Mention / Reply / Add Reaction** (4). Menu bg **#0e3651**, items **#45a2ff**.
  EVIDENCE: `proroom-NUCLEAR-member.md §5/§7.1` (6 identical `dropdown:⠇` = 3 alert items; base
  `[1930..1938]` = 4 chat items) + presenter §5 dropdown:7/8. → FIX: alert kebab 3 items, chat kebab 4
  items; navy #0e3651 / #45a2ff. → VERIFY: alert ⋮ shows exactly 3; chat ⋮ shows exactly 4; menu bg
  rgb(14,54,81).
- **[P2]** created-at + body text: chat timestamp **#a8a8a8** 12px/600 (`04:02 PM` same-day); alert
  timestamp `7/17/26, 11:55 AM`; member body **#676767**, admin body **#1a1a1a** 13px/100 lh19.5.
  EVIDENCE: `proroom-ultra-admin-room.md §4d` (date #a8a8a8, body #676767 member / #1a1a1a admin);
  member §4.4. → FIX: confirm date #a8a8a8, admin-body #1a1a1a. → VERIFY: computed date = rgb(168,168,168).

### 2.8 Composer (`ChatPanel.svelte` composer region)
- **[P1] (role split)** MEMBER composer = textarea + **one `fa-plus`** button (no emoji/image/GIF inline);
  PRESENTER composer = emoji (`far fa-smile`) + image (`fas fa-image`) + `GIF` text, plus Paste-YouTube.
  EVIDENCE: `proroom-NUCLEAR-member.md §4.4/§7.3` ("ONE '+' button … the ENTIRE member composer") vs
  `proroom-member-set.md §4.1` (emoji/image/GIF present at wider member captures) vs
  `proroom-full-presenter.md §4d` (fa-plus/far fa-smile/fas fa-image). **CONTRADICTION** (see list) —
  resolved: the `+` is a *collapsed* affordance shown at narrow width; the three buttons render inline at
  ≥400px (prior plan §4/§5, chat-composer.md `showMessageOptions = width>=400`). → FIX: render
  emoji/image/GIF inline at ≥400px, collapse to `+` below (ResizeObserver / container query). → VERIFY:
  wide chat pane shows the three glyphs beside the textarea, no `+`.
- **[P1] ✅→confirm** Composer computed: holder **45px**, bg #fff, radius **8px**, color #ccc, padding 5px,
  margin 5px top/bottom; textarea **min-h 35 / max-h 300**, bg #fff, color **#676767**, 14px/400, padding
  6/5, placeholder **`Type your message here..`** (two dots). EVIDENCE: `proroom-member-set.md §4.1`
  (exact computed table). Ours matches (prior plan §5 ✅). → VERIFY: textarea computed color rgb(103,103,103),
  max-height 300px, placeholder exact.

### 2.9 Files (`FilesPanel.svelte`)
- **[P2]** Sub-tab count badges `.badge.rounded-pill.bg-danger.files-badge` (red #dc3545, margin-top −9px,
  margin-left 3px); search bar #fff/#b7b7b7, icon #666; even-row #f4f4f4/odd #fff. EVIDENCE:
  `proroom-NUCLEAR-member.md §4.6` (files badges bg-danger #dc3545, "Search files...", Refresh #45a2ff) +
  files.md. → FIX: red pill badges + even/odd row tint. → VERIFY: each sub-tab has a red pill; rows
  alternate #fff/#f4f4f4. *(HONEST GAP: no file *rows* were ever captured — see §3.)*

### 2.10 Toasts / overlays (`ToastContainer.svelte`, `ConnectionOverlay.svelte`, `CaptionsOverlay.svelte`)
- **[P1]** Toast container `#toast-container.toast-top-right` at `top:70px`, z-999999, each `.ngx-toastr`
  300px, padding 15/15/15/50, radius 3px, shadow `0 0 12px #999`, type bg (info #2f96b4 / error #bd362f /
  success #51a351 / warning #f89406); app routes all through **info** + close button. EVIDENCE:
  overlays-toasts.md Resolved + gap-findings `[36]` file33.html (missing — "our codebase has NO toast
  system"). → FIX: build a top-right toastr container at top:70px / 300px / info-default. → VERIFY: an
  alert toast is blue, top-right ~70px down, 300px wide, with an × close.
- **[P2]** Reconnect chip: keep our clear "Connected/Reconnecting" wording — the reference typo "Conected"
  (`#connectedMsg.notConnectedOverlay`, #000 bg opacity .7, bottom/right 5px) is a bug; do NOT replicate.
  EVIDENCE: `evidence-folder-proroom-NUCLEAR.md §6` + overlays-toasts.md DOM 2 (sic "Conected"). → FIX:
  none. → VERIFY: n/a.

### 2.11 Poll / PM / QA / Log modals
- Poll (§1.1 items above): Send Poll #198754 ✅, step numbers plain, floating panel #1e1e1e / titlebar
  #2c2c2c, member Choose-card. EVIDENCE: poll.md + gap-findings `[10]`.
- PM (`PrivateChat.svelte`): navy `.chat-nav-pm` #0a6db1 header, ~220px user list, red presence dot
  (#dc3545), PM composer gets GIF (Reply/QA do NOT). EVIDENCE: reply-qa-pm.md; gap-findings `[16]`.
- QA + Logs: see §1.1 [P3] AlertQaModal / AlertLogs / ChatLogs items (By: emails admin-gated).

---

## §3 — Honest gaps (need FRESH capture; do NOT invent)

- **Roster rows (avatars / badges / rank / presence / roster-kebab).** Off-canvas (x=−248/−250) in EVERY
  capture (admin, member×3, presenter, evidence-folder, ref-sidebar). Only the empty `.room-roster-list`
  container + the roster *header* toolbar are captured. Row markup/colors come from the enriched presence
  payload (memory `roster-presence-enrichment`), NOT from these dumps. EVIDENCE: every decode's Honest
  Gaps §; `ref-sidebar` nodes 49-51 (empty container). → NEEDS: a sidebar-open / Users-tab-active capture.
- **Presenter media toolbar (Recording / Mic / Screen-Share / WebCam / SoundCloud / TAWK / Go-Live).**
  A full-JSON leaf walk found **ZERO** rendered occurrences — these exist only as CSS rules
  (`.webcamsHolderScreen 350×260 fixed bottom-right #000 display:none`, `.soundcloud-options 350px`,
  `.recording-reminder`, `#session-control-modal`) and 4 hidden modal shells. EVIDENCE:
  `proroom-full-presenter.md §8.1`. → NEEDS: a live-presenter capture with the media controls expanded.
- **Real modal interiors beyond the captured set.** Only ONE modal body was rendered (User-Info/Offline).
  Settings / AV / Post-Alert / Poll / WebRTC / Session-Control / Advanced-Search / Scheduled / All-PM /
  Send-Report / Reply bodies were `visible:false` (0×0) or offline-failed. Their palettes = the shared
  navy shell (safe); their field LAYOUTS come only from bundle templates + gap-findings structure.
  EVIDENCE: modals-and-deep §Honest Gap 1; evidence-folder §Honest Gap 1 (all 8 modals = Offline popup);
  member-set §4.5 (all 24 `visible:false`). → NEEDS: per-modal open-state captures.
- **Dark-theme renders.** Every capture is Light theme (or unthemed default). The `--darkTheme-*` bank
  (msgs-bg #143c57, msgs-bg-adm #0f2e43, roster-bg #111, textarea-bg #0c2434, msg-color #fff, sidebar
  #000, …) exists as tokens but was NEVER rendered/computed. EVIDENCE: every decode §3 dark bank +
  Honest Gaps. → NEEDS: a dark-theme capture before wiring the SettingsModal Light/Dark flip (until then,
  disable the Dark radio honestly).
- **Files rows / Streams tiles / live screen-share content.** Files sub-tab bodies show 0 rows in every
  capture; Streams renders the same 3 tabs (no distinct tiles); `#screensTabsContent`/`#webcamVideo-` are
  empty ("No one is presenting"). The admin room capture DOES show one live `video#webcamScreen-…` + a
  `TG-Screen 1` tab, but no file/stream *list rows*. EVIDENCE: all-admin §9; ultra-admin §4f/§7;
  member §4.6. → NEEDS: a capture with files uploaded / a stream active.
- **btn-close-white "×" true color** (black@0.5 in the one capture vs intended white) — capture-artifact
  ambiguity; resolve with a live screenshot (modals-and-deep Honest Gap 3).

---

## §4 — Already-verified matches (do NOT re-litigate; both sides cited)

- **Composer 45px / #ccc holder / 8px radius + textarea 35→300px / #676767 / 14px / 400 / `Type your
  message here..`** — REF: `proroom-member-set.md §4.1` exact computed table; OURS: prior plan §5 ✅ +
  `chat-composer.md`. Byte-match.
- **Member kebab LEFT + item sets (alert 3 / chat 4)** — REF: `proroom-NUCLEAR-member.md §5/§7.1`,
  `proroom-member-set.md §4.2` (kebab x0, avatar x19, 0 reverse); OURS: prior plan §3/§4 kebab handling.
- **Presenter row flex-row-reverse mirror** — REF: `proroom-full-presenter.md §4d/§7.1`; OURS: prior plan
  §4 (`.msg-box-adm flex-row-reverse`) ✅.
- **Reconnect toast wording (keep "Connected", ignore ref "Conected" typo)** — REF:
  `evidence-folder-proroom-NUCLEAR.md §6`; OURS: prior plan §15 ConnectionOverlay ✅.
- **Nav has NO blue hover on the presenter/reload cluster (rest #abb0b5)** — REF: `ref-topnav` nodes
  13/16 (`rgb(171,176,181)`); OURS: prior plan §1 documented divergence ✅.
- **Poll minimize/restore + floating-panel model** — REF: `poll.md` DOM (pollModalHolder titlebar
  Minimize/Maximize/Close) + `proroom-full-presenter.md §6` ("Minimize"/"Maximize"/"Close"); OURS:
  PollModal poll-panel-btn / poll-panel-btn-close ✅.
- **Emoji-mart replica** — REF: `emoji-mart.md`; OURS: `EmojiMart.svelte` (prior plan / memory) ✅.
- **Modal shell radius 8px + navy #103d5c / #f4f4f4 + blue #45a2ff active tabs + footer btn #0a6db1** —
  REF: `proroom-modals-and-deep.md §Shell`; OURS: `Modal.svelte:174` (8px) + `layout.css:108-120` tokens ✅.
- **Split gutter 11px #0a6db1 + as-percent calc() basis** — REF: `proroom-all-admin.md §4.3`; OURS:
  `Split.svelte:194,202` ✅.
- **ConnectivityCheck status labels (UDP Enabled / TCP Enabled / STUN Server Connectivity / TURN Server
  Connectivity)** — REF: gap-findings `[13]` file30 + all-admin §5.10; OURS:
  `ConnectivityCheckModal.svelte:17-20` ✅ (verbatim match).
- **PollModal Send-Poll #198754 + outline-light #f8f9fa** — REF: `poll.md Resolved`; OURS:
  `PollModal.svelte:650,513,634` ✅.
- **294-var token layer faithful to the live palette** — REF: all A-decodes §3 (root==body, byte-identical
  across roles/files); OURS: `layout.css` bakes the resolved light values ✅.

---

## §5 — Item counts + top-10 P1 + contradictions

### Counts per section (P1 / P2 / P3)

| Section | P1 | P2 | P3 |
|---|---|---|---|
| §1 MODALS | 2 (Offline/Online badge red+green) | 4 (muted badge, shell border, header divider, close-invert) | 6 (Logs interiors, Muted/Followed, AlertQa, PollModal step, Lightbox) |
| §2.1 Top-nav | 0 | 2 | 1 |
| §2.2 Sidebar/roster | 2 | 2 | 0 |
| §2.3 Split | 1 | 0 | 0 |
| §2.4 Stage/tabs | 1 | 0 | 0 |
| §2.5 Notes | 2 | 1 | 0 |
| §2.6 Alerts | 1 | 1 | 0 |
| §2.7 Chat rows | 4 | 1 | 0 |
| §2.8 Composer | 2 | 0 | 0 |
| §2.9 Files | 0 | 1 | 0 |
| §2.10 Toasts | 1 | 1 | 0 |
| §2.11 Poll/PM/QA | 0 | 0 | (counted in §1) |
| **TOTAL** | **16** | **13** | **7** |

### Top 10 P1 items (verbatim, ordered by user-visible impact)

1. **[P1] `modals/UserInfoModal.svelte:184` — Offline badge wrong red.** `background: var(--modal-danger,
   #e74c3c)` resolves to #bb352a; reference `badge-danger` = **#E74C3C**. EVIDENCE: modals-and-deep
   §Shell[5] (`rgb(231,76,60)` = `--danger`). → FIX: `background: var(--negative, #e74c3c)`. → VERIFY:
   computed = rgb(231,76,60).
2. **[P1] `modals/UserInfoModal.svelte:180` — Online badge wrong green.** `var(--modal-success)` = #92d528;
   reference `badge-success` = **#00bc8c**. EVIDENCE: modals-and-deep §pane:Notes[6]. → FIX:
   `background: var(--positive, #00bc8c)`. → VERIFY: computed = rgb(0,188,140).
3. **[P1] ChatPanel — 3-tier author username color (#e8e8e8 admin / #d7d7d7 bot / #0a6db1 member),
   class-driven.** EVIDENCE: proroom-ultra-admin-room.md §4d author-tier table. → FIX: map badge tier →
   color. → VERIFY: admin row username computed rgb(232,232,232).
4. **[P1] ChatPanel — `.msg-box-adm` = bg #f4f4f4 + padding-top 2px ONLY (else identical to #fff
   msg-box).** EVIDENCE: proroom-ultra-admin-room.md §4d + presenter §4d verbatim CSS. → FIX: `.msg-box-adm{
   background:#f4f4f4; padding-top:2px}`. → VERIFY: computed bg rgb(244,244,244), padding-top 2px.
5. **[P1] ChatPanel — message kebab item sets: alert = User Info/Mention/Copy (3); chat = User
   Info/Mention/Reply/Add Reaction (4); menu #0e3651 / items #45a2ff.** EVIDENCE:
   proroom-NUCLEAR-member.md §5/§7.1. → FIX: gate the two item lists. → VERIFY: alert ⋮ = 3, chat ⋮ = 4.
6. **[P1] Notes — `.noteOptions` sticky #f4f4f4 bar: Download #92d528 / Edit #45a2ff / Delete #bb352a.**
   EVIDENCE: modals-and-deep §pane:Notes[42]/[44]; ref-presentation node 64/66. → FIX: map the 3 button
   bgs. → VERIFY: Download computed rgb(146,213,40).
7. **[P1] Notes — tab strip navy #0c2434 + `1px #0a6db1` top border, active note tab #45a2ff 3px pill.**
   EVIDENCE: modals-and-deep §pane:Notes[1]/[3]; ref-presentation node 23/25. → FIX: paint the strip.
   → VERIFY: strip computed rgb(12,36,52), active tab rgb(69,162,255).
8. **[P1] Composer — render emoji/image/GIF INLINE at ≥400px; collapse to a single `+` only when
   narrower.** EVIDENCE: proroom-member-set.md §4.1 (three buttons present) vs NUCLEAR-member §7.3 (one `+`
   at 110px collapse) + chat-composer.md `showMessageOptions=width>=400`. → FIX: ResizeObserver gate.
   → VERIFY: wide pane shows 3 glyphs, no `+`.
9. **[P1] Split — default ratio must seed to ~26.73% left / 73.27% right (not 50/50), 11px #0a6db1
   gutter.** EVIDENCE: proroom-all-admin.md §4.3 (`calc(26.7319%−2.94px)` / `calc(73.2681%−8.06px)`).
   → FIX: seed default flex-basis. → VERIFY: fresh load left pane ≈27%.
10. **[P1] ChatPanel — presenter/admin authored row is `flex-row-reverse` (avatar right); member rows are
    flex-row (0 reverse).** EVIDENCE: proroom-full-presenter.md §4d/§7.1 vs proroom-member-set.md §4.2.
    → FIX: reverse only for is_presenter/admin authors. → VERIFY: admin row avatar on the right.

### Contradictions found between input decodes (with the winner per rendered-capture > template > stylesheet > prose)

1. **Composer buttons — one `+` vs three (emoji/image/GIF).** `proroom-NUCLEAR-member.md §4.4` (ONE `+`,
   collapsed-mobile, body width 110px) **vs** `proroom-member-set.md §4.1` (emoji/image/GIF present at
   1988/1401px member captures) **vs** `proroom-full-presenter.md §4d` (fa-plus + far fa-smile + fas
   fa-image). **WINNER: both are correct — width-conditional.** The `+` is the *collapsed* affordance
   (NUCLEAR-member is explicitly a 110px collapsed-mobile render, flagged in its own §1 caveat); the three
   buttons render inline at ≥400px (member-set is a desktop-width render → higher pixel-fidelity for this
   axis). Resolution: `showMessageOptions = chatWidth >= 400`.
2. **Staff-row background — #f4f4f4 vs #d7d7d7.** `proroom-ultra-admin-room.md §4d` and
   `proroom-full-presenter.md §3h` say `msg-box-adm` bg = **#f4f4f4** (`--lightTheme-msgs-bg-adm`), while
   `proroom-NUCLEAR-member.md §4.4 [1955]` says the staff variant in the *member's* main chat computes
   **#d7d7d7**. **WINNER: #f4f4f4 for the `msg-box-adm` token** (two rendered admin/presenter captures cite
   the token directly; the member's #d7d7d7 is the member-tier rendering of a staff *author* row, a
   different code path — the `--lightTheme-msgs-bg-adm` token itself is #f4f4f4 in all six 294-var tables).
   Use #f4f4f4 for `.msg-box-adm`; the #d7d7d7 member shade is a secondary author-tier tint.
3. **Default split ratio — 26.73/73.27 vs ~48/42.98.** `proroom-all-admin.md §4.3` (26.73/73.27, admin
   default) **vs** `evidence-folder-proroom-NUCLEAR.md §4` (left ≈48% / right ≈42.98%, aria-valuenow
   47.59). **WINNER: 26.73/73.27** — the evidence-folder ratio is a user-dragged mid-session state (arbitrary
   valuenow), whereas the admin capture's calc() basis reflects the shipped default; rendered-default beats
   a dragged snapshot. (Neither is "wrong"; seed to 26.73.)
4. **App version string — `v4.0.1-b422b517` vs `-c0fee8f5` vs `-23e57286`.** `proroom-all-admin.md §1` /
   member / presenter say **b422b517**; `evidence-folder`/`ultra-admin`/`ref-sidebar` say **c0fee8f5** /
   **23e57286**. **WINNER: display whatever the backend returns (honest data), not a hardcoded string** —
   these are different capture moments of an evolving build; the version is dynamic, not a design token.
   No pixel-parity item; do not hardcode.
5. **Offline badge red — #E74C3C vs #dc3545 vs #bb352a.** modals-and-deep §Shell[5] **rgb(231,76,60)
   #E74C3C** (rendered computed, `--danger`) explicitly rules out `--bs-danger #dc3545`; and #bb352a is the
   *button* danger, not the badge. **WINNER: #E74C3C** (the only *rendered* value; the other two are
   token-name confusions). This is exactly the P1 fix #1 above.
