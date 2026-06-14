# Forensic Dossier 04 — CHAT PANEL

Surface owner: `web/src/lib/components/ChatPanel.svelte` (chrome: `AlertsChatDock.svelte`,
`PrivateChat.svelte`). Verdict policy: hard evidence only; `ours=X vs ref=Y` + path; uncovered
→ **EVIDENCE GAP**. DO NOT implement (analysis only).

---

## A. Scope & Method

**What was measured.** Our live chat panel rendered at width=1988 for both roles
(`presenter`, dev-bypass super-admin; `member`, capabilities rewritten to chat-only via the
harness response interception), via `web/scripts/forensic-lib.mjs` `openRoom()` + `computed()`.
Scratch driver `web/scripts/chat-forensic.mjs` (created, run, **deleted** per constraints).
Both panels screenshotted to `docs/forensics/shots/04-chat-{presenter,member}.png`. Our panel
selector root: `.chat-pane .panel` (ChatPanel mounted inside the dock's chat pane,
`AlertsChatDock.svelte:127-141`).

**Reference evidence sources (in priority order).**
1. `script-results/audit/chat.json` — PRIMARY. Per-role (`presenter`/`member`, 38 elements each,
   IDENTICAL paths/styles) + `adminTargeted` computed styles of the real proroom chat box. This
   capture is **lightTheme** (`app-room.lightTheme`, confirmed in
   `docs/reference/captures/proroom-ultra-admin-room.json` meta + element class).
2. `docs/reference/captures/proroom-ultra-admin-room.json` `.targeted[26]` (Main Chat tab)
   matchedRules + `.cssVariables.root` (resolves `--modal-active-tab-*`, `--lightTheme-*`).
3. `docs/reference/captures/proroom-full-presenter.json` `.elements` — real COMPUTED message rows
   (`.msg-box`/`.username`/`.created-at`/`.msg-left`/`.separator`, 100 each) + composer
   (`.txt-area`, `.textAreaBtns`). **CAVEAT:** this capture room is a NON-light theme
   (msg-box bg `#e8e8e8`, username/date `#e8e8e8`) — its **structure & typography (sizes,
   weights, margins, font-style) are theme-invariant and reliable**, but its **colors are NOT**;
   colors are taken from the lightTheme variables in source (2).

**Normalisation.** rgb→hex, px rounded (mirrors `norm()` in forensic-lib).

**Reference architecture note.** The proroom chat is Angular: `app-chat > div.chat > div.bs-component
> nav.navbar.chat-nav` (header) then `app-roomscroller` (message list); the composer
(`#textAreaHolder` / `.txt-area`) sits below. Our equivalent is one `<section.panel>` with
`<header>`, `<ul.messages>`, `<form>`. Different DOM, same visual surface — diffs below are by
visual element, not by node path.

**Reference resolved tokens (lightTheme, from cssVariables.root):**
`--modal-active-tab-bg-color #45a2ff` · `--modal-active-tab-border-color #45a2ff` ·
`--modal-active-tab-color #fff` · `--msgs-header-bg #0a6db1` · `--lightTheme-username-color #0a6db1` ·
`--lightTheme-date-color #a8a8a8` · `--lightTheme-msg-color #676767` ·
`--lightTheme-msg-border-color #e1e1e1` · `--lightTheme-msgs-separator-bg #e8e8e8` ·
`--lightTheme-textarea-color #676767` · `--lightTheme-textarea-bg #fff` ·
`--textarea-holder-btns-color #676767` · `--textarea-holder-btns-hover-color #0a6db1` ·
`--rosterImg-border-radius 50%` · `--app-font-family 'Open Sans', sans-serif`.

---

## B. Delta Table

Property normalised (rgb→hex, px rounded). Δ = `≈0` (match) or the gap. Evidence path column
gives the reference source. Our values from `/tmp/chat-ours.json` (presenter; member identical —
see §D).

| # | Element | Our selector | Property | Ours | Ref | Δ | Evidence | Verdict |
|---|---------|--------------|----------|------|-----|---|----------|---------|
| 1 | Header bar | `header` | background | `#0a6db1` | `#0a6db1` (rgb 10,109,177) | 0 | chat.json presenter[20] `.chat-nav` | ✅ MATCH |
| 2 | Header bar | `header` | height / min-height | `48px` | `48px` | 0 | chat.json [20] | ✅ MATCH |
| 3 | Header bar | `header` | padding | `4px` all | `4px` all | 0 | chat.json [20] | ✅ MATCH |
| 4 | Header bar | `header` | color | `#ffffff` | `#ffffff` | 0 | chat.json [20] | ✅ MATCH |
| 5 | Comment icon | `header .lead i` | glyph | `fa-comment` (FA5 Free 900) | `i.fas.fa-comment` 900 | 0 | chat.json [22] | ✅ MATCH |
| 6 | Comment icon | `header .lead i` | font-size | `16px` | `16px` | 0 | chat.json [22] | ✅ MATCH |
| 7 | Comment icon | `header .lead i` | color | `#ffffff` | `#ffffff` | 0 | chat.json [22] | ✅ MATCH |
| 8 | Tab bar (underline) | `.tabs` | border-bottom | `1px solid #45a2ff` | `1px solid #45a2ff` (rgb 69,162,255) | 0 | chat.json [23] `ul.nav-tabs.chatTabs` | ✅ MATCH |
| 9 | Tab bar | `.tabs` | justify-content | `center` | `center` | 0 | chat.json [23] | ✅ MATCH |
| 10 | Active tab | `.tabs button.active` | background | `#45a2ff` | `#45a2ff` | 0 | chat.json [25] / ultra `--modal-active-tab-bg-color` | ✅ MATCH |
| 11 | Active tab | `.tabs button.active` | border-color (all) | `#45a2ff` | `#45a2ff` !important | 0 | ultra `.chatTabs .nav-link.active` | ✅ MATCH |
| 12 | Active tab | `.tabs button.active` | color | `#ffffff` | `#ffffff` | 0 | chat.json [25] | ✅ MATCH |
| 13 | Active tab | `.tabs button.active` | font-weight | `700` | `700` | 0 | ultra `.chatTabs li a` / chat.json [25] | ✅ MATCH |
| 14 | Active tab | `.tabs button.active` | font-size | `12px` | `12px` | 0 | chat.json [25] | ✅ MATCH |
| 15 | Active tab | `.tabs button.active` | padding | `8px 5px 5px` | `8px 5px 5px` | 0 | chat.json [25] | ✅ MATCH |
| 16 | Active tab | `.tabs button.active` | margin-right | `5px` | `5px` | 0 | chat.json [25] / ultra | ✅ MATCH |
| 17 | Active tab | `.tabs button.active` | top radius | `6px 6px` | `6px 6px` | 0 | chat.json [25] | ✅ MATCH |
| 18 | Inactive tab | `.tabs button:not(.active)` | font-weight | `700` | `700` | 0 | chat.json [27] / ultra `.chatTabs li a` | ✅ MATCH |
| 19 | Inactive tab | `.tabs button:not(.active)` | background | `transparent` | `transparent` | 0 | chat.json [27] | ✅ MATCH |
| 20 | Inactive tab | `.tabs button:not(.active)` | border-bottom-color | `transparent` | `transparent` (rgba 0,0,0,0) | 0 | chat.json [27] | ✅ MATCH |
| 21 | Search icon | `.actions button:nth-child(1) i` | glyph | `fa-search` (FA5 900) | `i.fas.fa-search` 900 | 0 | chat.json [31] | ✅ MATCH |
| 22 | Search icon | `.actions … i` | size / color | `16px` / `#ffffff` | `16px` / `#ffffff` | 0 | chat.json [31] | ✅ MATCH |
| 23 | Gear icon | `.actions button.gear i:nth-child(1)` | glyph | `fa-cog` (FA5 900) | `i.fas.fa-cog.chat-header-gear` 900 | 0 | chat.json [34] | ✅ MATCH |
| 24 | Gear icon | `.actions button.gear i` | size / color | `16px` / `#ffffff` | `16px` / `#ffffff` | 0 | chat.json [34] | ✅ MATCH |
| 25 | **Caret next to gear** | `.actions button.gear i:nth-child(2)` | element | `fa-caret-down` 10px present | **reference gear has NO standalone caret glyph** (dropdown-toggle ::after) | EXTRA | chat.json [33-34]: only `i.fa-cog`, no 2nd `<i>` | ⚠️ MINOR EXTRA |
| 26 | Empty state | `ul.messages li.empty` | text | `"No messages yet."` | (rows collapsed — n/a) | — | EVIDENCE GAP | ⚠️ GAP |
| 27 | Empty state | `li.empty` | color | `#8a909c` | (no ref) | — | EVIDENCE GAP | ⚠️ GAP |
| 28 | Composer textarea | `form .pill textarea` | color | `#676767` | `#676767` | 0 | ultra `--lightTheme-textarea-color`; full `.txt-area` | ✅ MATCH |
| 29 | Composer textarea | `… textarea` | font-size | `14px` | `14px` | 0 | full `.txt-area`; ultra `.txt-area` | ✅ MATCH |
| 30 | Composer textarea | `… textarea` | placeholder text | `"Type your message here.."` | (placeholder string not captured) | — | EVIDENCE GAP | ⚠️ GAP |
| 31 | Composer placeholder | `… textarea::placeholder` | color | `#6a7282` (oklch 0.551…) | `#999999` (rgb 153,153,153) | **≠** | ultra `.form-control::placeholder` | ❌ DELTA |
| 32 | Composer textarea | `… textarea` | height (1 line) | `30px` | `35px` (min-height/height) | **5px** | full `.txt-area` | ❌ DELTA |
| 33 | Composer textarea | `… textarea` | font-weight | `300` | `400` | **100** | full `.txt-area` (computed 400) | ❌ DELTA |
| 34 | Composer holder | `form .pill` | border-radius | `999px` (pill) | `8px` (`#textAreaHolder`) | **≠** | ultra `#textAreaHolder { border-radius: 8px }` | ❌ DELTA |
| 35 | Composer holder | `form .pill` | border | `1px solid #d3d7e0` | `1px` (light: `#textAreaHolder` bg #fff, no visible border in light) | minor | ultra `#textAreaHolder`; `.txt-area border:0` | ⚠️ MINOR |
| 36 | Emoji/Image/GIF btns | `.pill .ic` | color | `#676767` | `#676767` | 0 | ultra `.textAreaBtns`/`--textarea-holder-btns-color`; full | ✅ MATCH |
| 37 | Emoji/Image/GIF btns | `.pill .ic` | hover color | `#0a6db1` | `#0a6db1` | 0 | ultra `.textAreaBtns:hover` | ✅ MATCH |
| 38 | Emoji/Image/GIF btns | `.pill .ic` | padding | `4px` | `5px` (`.textAreaBtns padding:5px`) | **1px** | ultra/full `.textAreaBtns` | ⚠️ MINOR |
| 39 | Emoji icon | `.pill button[aria-label=Emoji] i` | glyph | `fa-smile` 18px | (icon family present, glyph not separately captured) | — | EVIDENCE GAP (glyph id) | ⚠️ GAP |
| 40 | GIF control | `.pill .gif` | element | text `"GIF"` 12px/800 | proroom uses a GIF `.textAreaBtns` (no `send` class) | plausible | full `.textAreaBtns` ×8 | ⚠️ PLAUSIBLE |
| 41 | **Send button** | `form button.send` | element | `<button.send>` "Send" pill #0a6db1 | **NO `.send`/send-btn class anywhere in proroom captures** | **EXTRA?** | full/ultra: `send` count = 0; composer is icon-bar + Enter-to-send | ⚠️ SUSPECT EXTRA |
| 42 | Send button | `form button.send` | background | `#0a6db1` | (no ref element) | — | EVIDENCE GAP | ⚠️ GAP |
| 43 | Msg row container | `li.msg-box` (n/a empty) | border-top | `1px solid #e1e1e1` | `1px solid #e1e1e1` | 0 | full `.msg-box` (color via lightTheme `--msg-border-color`) | ✅ MATCH (code) |
| 44 | Msg row | `.msg-box` | font-weight | `var inherit` | `100` | check | full `.msg-box` weight 100 | ⚠️ see §E |
| 45 | Username | `.username` (n/a empty) | font-size / weight | `14px` / `900` | `14px` / `900` | 0 | full `.username` (strong) | ✅ MATCH (code) |
| 46 | Username | `.username` | color | `var(--username-color)`=`#0a6db1` | `#0a6db1` (lightTheme) | 0 | ultra `--lightTheme-username-color` | ✅ MATCH (code) |
| 47 | Username | `.username` | margin | `0 4px` | `0 4px` (`mx-1`) | 0 | full `.username` | ✅ MATCH (code) |
| 48 | Timestamp | `.created-at` (n/a empty) | font-size / weight | `12px` / `600` | `12px` / `600` | 0 | full `.created-at` | ✅ MATCH (code) |
| 49 | Timestamp | `.created-at` | font-style | `normal` | `normal` (computed) | 0 | full `.created-at` computed = normal | ✅ MATCH (code) |
| 50 | Timestamp | `.created-at` | color | `#a8a8a8` | `#a8a8a8` (lightTheme) | 0 | ultra `--lightTheme-date-color` | ✅ MATCH (code) |
| 51 | Body text | `.body` (n/a empty) | font-size | `var(--msg-font-size)`=`13px` | `13px` | 0 | full `.msg-left` 13px; layout.css:28 | ✅ MATCH (code) |
| 52 | Body text | `.body` | color | `#676767` | `#676767` (lightTheme) | 0 | ultra `--lightTheme-msg-color`; full `.msg-left` | ✅ MATCH (code) |
| 53 | Separator | `.separator` (n/a empty) | background | `#e8e8e8` | `#e8e8e8` (lightTheme `--…-separator-bg`) | 0 | ultra `--lightTheme-msgs-separator-bg` | ✅ MATCH (code) |
| 54 | Separator | `.separator` | font-size | `13px` | `13px` (`.separator a`) | 0 | ultra `.separator a { font-size: 13px }` | ✅ MATCH (code) |

"MATCH (code)" = row element not live-rendered (empty chat), value verified against ChatPanel.svelte
source CSS + reference — see §E EVIDENCE GAP on live row rendering.

---

## C. Structural / Behavioural findings (our file:line)

1. **Chat search control is DEAD — CONFIRMED.** `ChatPanel.svelte:156`
   `<button type="button" aria-label="Search chat">` has **no `onclick`** and no bound state. It
   renders the `fa-search` glyph (matches ref [31]) but does nothing. Reference also exposes the
   icon (`a.nav-link.p-0 > i.fa-search`, chat.json [30-31]); whether the reference search is
   functional is not provable from static captures → its *dead-ness in ours* is confirmed by source;
   ref behaviour = EVIDENCE GAP.

2. **Chat gear/cog control is DEAD — CONFIRMED.** `ChatPanel.svelte:157-159` the `.gear` button
   has **no `onclick`**, no dropdown menu wired. Reference renders `a.nav-link.dropdown-toggle.p-0
   > i.fa-cog.chat-header-gear` (chat.json [33-34]) i.e. a Bootstrap **dropdown-toggle** (it opens
   a settings menu in proroom). Ours is a static icon. Confirmed dead.

3. **Extra caret glyph next to the gear.** `ChatPanel.svelte:158` renders a second icon
   `<Icon name="caret-down" size={10} />`. The reference gear is a single `i.fa-cog` (chat.json
   [34]); the dropdown affordance there is the Bootstrap `.dropdown-toggle::after` CSS triangle,
   not a Font Awesome caret. Visually similar but structurally an EXTRA element (delta #25).

4. **"Send" button likely EXTRA vs reference.** `ChatPanel.svelte:260`
   `<button type="submit" class="send">Send</button>`. No `send`/`send-btn`/`sendBtn` class exists
   anywhere in `proroom-full-presenter.json` or `proroom-ultra-admin-room.json` (grep count 0). The
   proroom composer is an icon bar (`.textAreaBtns` ×8 in full capture: emoji/image/GIF/etc.) with
   **Enter-to-send** and no labelled Send button. Our blue pill "Send" is an addition. (delta #41).
   Note: our composer ALSO supports Enter-to-send — `ChatPanel.svelte:89-94` `onComposerKeydown`
   — so behaviour is a superset, but the visible Send button is extra chrome.

5. **Composer holder shape differs.** `ChatPanel.svelte:530-540` `.pill { border-radius: 999px }`
   (full pill). Reference `#textAreaHolder { border-radius: 8px }` (ultra capture) — a rounded
   **rectangle**, not a pill. (delta #34). Combined with #32/#33 the composer is the least-matched
   region.

6. **Emoji/Image/GIF controls present and correctly coloured but DEAD.** `ChatPanel.svelte:255-258`
   — all three `.ic` buttons have no `onclick` (no emoji picker / file input / GIF picker wired).
   Reference has functional `.textAreaBtns` (full capture, 8 instances). Confirmed dead in ours;
   colours/hover match (deltas #36-38).

7. **Message rows collapsed in PRIMARY capture.** The lightTheme PRIMARY (`chat.json`) chat box has
   no message rows (audit stops at `app-roomscroller` [35]); our live chat is also empty
   ("No messages yet."). Real computed row values were recovered from the *non-light*
   `proroom-full-presenter.json` (structure/typography reliable; colours via lightTheme tokens).
   Our row CSS (`ChatPanel.svelte:398-520`) matches those facts (deltas #43-54) but is verified
   from source, not from a live render — see §E.

8. **Role parity.** See §D — presenter and member chat panels are byte-identical in our build.

---

## D. Screenshots & role differences

- `docs/forensics/shots/04-chat-presenter.png`
- `docs/forensics/shots/04-chat-member.png`

**Role differences: NONE (with evidence).**
- Reference: `chat.json` `presenter` and `member` arrays are 38 elements each with **identical
  paths, classes, icons, and computed styles** — the proroom chat panel does not vary by role.
- Ours: measured `panelRect` identical for both roles
  (`{x:0,y:662.69,w:563.45,h:537.31}`), and every measured element identical. The composer renders
  for member because the harness member mock sets `can_post_message:true`
  (`forensic-lib.mjs:21-27`); `ChatPanel` gates the composer purely on `canPost`
  (`ChatPanel.svelte:241`), with a read-only fallback `"You can read the chat…"`
  (`ChatPanel.svelte:263`) for non-posting members — that fallback string has **no reference
  counterpart** (EVIDENCE GAP). No presenter-only chat controls exist.

---

## E. EVIDENCE GAPS

1. **Live message-row rendering.** PRIMARY (`chat.json`) chat box is empty; our live chat is empty.
   Row deltas (#43-54) are verified from `ChatPanel.svelte` source vs `proroom-full-presenter.json`
   computed (a non-light theme) + lightTheme tokens. Not confirmed by a live, lightTheme, populated
   render. To close: seed messages via API `aea3ca10-…/messages` and re-measure rows. (Brief
   explicitly flagged rows COLLAPSED — confirmed.)
2. **`.created-at` font-style.** Two equal-specificity `.created-at` rules exist (ultra capture):
   [7399] `font-style: italic`, [7868] no font-style. Source-order cascade would *suggest* italic,
   but the live COMPUTED value in `proroom-full-presenter.json` is **normal** — so our
   `font-style: normal` (ChatPanel.svelte:506) is CORRECT. Resolved, not a delta.
3. **Placeholder string.** No reference capture records the textarea `placeholder` attribute text;
   ours is `"Type your message here.."` (two trailing dots). Cannot confirm the exact ref string.
4. **Empty-state ("No messages yet.").** No reference computed style — proroom captures were always
   populated or collapsed. Our colour `#8a909c` / 14px is unverifiable against ref.
5. **Search / gear reference behaviour.** Static captures can't prove what proroom's search and gear
   dropdown do; only that ours are dead is provable (no handlers).
6. **Emoji glyph identity.** Reference composer-button glyphs are not individually captured (only
   `.textAreaBtns` containers). Our `fa-smile`/`fa-image`/text-"GIF" choice is plausible but
   unverified per-glyph.
7. **Send button.** Absence of any `send` class in two captures is strong evidence the reference has
   no labelled Send button, but absence-of-evidence for the exact composer affordance set is a gap
   (the captures may not include a hover/focus composer state).
8. **`#textAreaHolder` border in lightTheme.** The captured `.txt-area` border colour is `#fff`
   (rule `1px solid rgb(255,255,255)`) on the holder bg — the visible holder border in light theme
   is effectively absent / very subtle; ours uses `#d3d7e0`. Hard to confirm exact light-theme
   holder border without a lightTheme composer computed sample.

---

## F. Prioritised fix list (our file:line → exact change → reference)

NOTE: analysis only; no edits applied.

**P1 — composer shape & metrics (most visible mismatch)**
1. `ChatPanel.svelte:538` `.pill { border-radius: 999px }` → **`border-radius: 8px`**.
   Ref: `proroom-ultra-admin-room.json` `#textAreaHolder { border-radius: 8px }` (delta #34).
2. `ChatPanel.svelte:541-556` `.pill textarea` height ~30px → **min-height 35px** (and the
   composer line box to 35px). Ref: `proroom-full-presenter.json` `.txt-area` height/min-height
   `35px` (delta #32).
3. `ChatPanel.svelte:541-556` textarea `font-weight` (currently inherits 300) → **`font-weight:
   400`**. Ref: `.txt-area` computed `400` (delta #33).
4. Add an explicit `::placeholder` colour on `ChatPanel.svelte` textarea →
   **`color: #999999` (rgb 153,153,153)**. Ours currently inherits a global reset (`#6a7282`).
   Ref: ultra `.form-control::placeholder { color: rgb(153,153,153) }` (delta #31).

**P2 — extra/dead chrome alignment**
5. `ChatPanel.svelte:158` remove the standalone `<Icon name="caret-down" size={10} />`; rely on a
   CSS dropdown-toggle `::after` triangle if a dropdown is added. Ref gear is a single `i.fa-cog`
   (chat.json [34]) (delta #25).
6. `ChatPanel.svelte:260` the labelled `<button.send>Send</button>` has no reference counterpart
   (no `send` class in either capture). Decision needed: drop the labelled button and rely on the
   icon-bar + Enter-to-send, OR keep as an intentional UX superset. Ref: composer = `.textAreaBtns`
   bar (full capture ×8), no Send class (delta #41, §C-4). **Confirm product intent before
   removing** (behaviour, not pure pixels).
7. `ChatPanel.svelte:557-568` `.ic { padding: 0.25rem }` (=4px) → **`padding: 5px`** to match
   `.textAreaBtns { padding: 5px }` (delta #38).

**P3 — wire dead controls (behavioural; lower visual priority)**
8. `ChatPanel.svelte:156` search button — wire a search action (currently dead). Ref exposes a
   search affordance (chat.json [30-31]) (§C-1).
9. `ChatPanel.svelte:157-159` gear button — wire the settings dropdown (currently dead). Ref is a
   Bootstrap `.dropdown-toggle` (chat.json [33]) (§C-2).
10. `ChatPanel.svelte:255-258` emoji/image/GIF buttons — wire pickers/file input (currently dead)
    (§C-6).

**No change needed (verified MATCH):** header bar (#1-4), comment/search/gear glyphs (#5-7,21-24),
the #45a2ff tab-bar underline (#8) and folder-tab fill/border/weight/radius/padding (#10-20),
emoji/image/GIF colour & hover (#36-37), and all message-row typography/colour (#43-54, verified
from source vs reference — pending live confirmation per §E-1).
