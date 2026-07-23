# Implementation Plan — Hard-Evidence Parity (2026-07-23)

Every item cites verbatim evidence from the raw dumps / the live bundle
(`main.d6f5272aa3783e43.js` scoped CSS, boot `index.html` tokens, live-room
`:root`, capture JSONs, live DOM pastes). No prose sources. Each item lists:
EVIDENCE → CURRENT → FIX → VERIFY.

---

## P0-1 · "Connected" overlay — misplaced + invisible dark blue

**EVIDENCE**
- DOM (`mixed-files/connected.html`, complete file):
  `#connectedMsg.notConnectedOverlay.animated.fadeIn > i.fas.fa-check + " Conected"`
  (reference's literal typo "Conected").
- Bundle CSS:
  `.notConnectedOverlay{display:block;position:absolute;bottom:5px;right:5px;z-index:10000;background-color:#000;color:var(--presenter-noRecording-color);opacity:.7}`
  `#connectedMsg{display:none}` (base hidden — shown transiently with fadeIn).
- Live room `:root`: `--presenter-noRecording-color: #fff`.

**CURRENT** `ConnectionOverlay.svelte` renders a large centered navy overlay →
invisible-on-navy + misplaced (the user's report).

**FIX** Small chip pinned **bottom-right of the stage** (`position:absolute;
bottom:5px; right:5px; z-index:10000`), `background:#000; opacity:.7; color:#fff`,
content `fa-check + "Conected"`, fade-in on (re)connect and auto-hide (reference
base state is `display:none`). Disconnected state uses the same chip styling
(class is `notConnectedOverlay` for both).

**VERIFY** Render stage, toggle connection state, measure chip rect =
bottom-right +5px inset, computed bg rgb(0,0,0)/opacity .7/color #fff.

---

## P0-2 · Composer ("Type your message") — final conformance matrix

**EVIDENCE** (bundle scoped CSS, verbatim):
- `#textAreaHolder{background-color:var(--textarea-bg);border-radius:8px;padding:5px;margin:5px}`
- `.txt-area{border-radius:0;border:1px solid #fff;font-size:14px;resize:none;color:var(--textarea-color)!important;background-color:var(--textarea-bg)!important;outline:none;overflow-y:auto;margin:0 0;padding-left:5px;padding-right:5px}` + element `border-0` ⇒ border 0
- `.txt-area:focus{border-color:var(--darker-gray);box-shadow:1px 1px 1px var(--darker-gray)}` (#aaa6a6; border can't paint ⇒ shadow-only active effect)
- `.textAreaBtns{padding:5px;color:var(--textarea-holder-btns-color)!important}` (#676767), hover `#0a6db1`
- `.chat{background-color:var(--chat-bg)}` → `#eee`
- Captured computed: textarea 35px min / 300px max, pad 6px 5px, 14px/21px #676767; holder 45px.

**CURRENT** All values implemented and measured equal (holder 45px, #eee column,
border 0, shadow-only focus). The user still sees a mismatch on :5173 —
consistent with a stale HMR tab (a fresh :5173 page load measured correct).

**FIX/VERIFY** Run the conformance matrix on a fresh browser profile against
:5173 (the user's origin) and diff every property above; screenshot evidence.
If any property diverges live, fix that property — otherwise the remaining
mismatch is the stale tab (hard refresh).

---

## P1-1 · Per-author color system (chat + alerts)

**EVIDENCE** (live DOM pastes, multiple rows):
- Row: `div.msg-box.pb-1` with **inline** `style="background-color: rgb(215,215,215)"`
  (LornaBot) / `rgb(232,232,232)` (JC/Sam) / none (TG, Taylor…).
- Meta: `a.msgMenu`, `strong.username`, `span.created-at` each inline
  `style="color: <rowBg>; filter: invert(1)"`.
- Name-block wrapper div, `.alert-qa` button, `.msg-left` body: inline
  `style="color: <authorTextColor>"` (LornaBot `rgb(0,128,64)`, JC `rgb(26,26,26)`).
- No inline styles at all when the author has no custom colors → stylesheet
  defaults (#0a6db1 username, #a8a8a8 date, #676767 body).
- Chat staff rows additionally carry `msg-box-adm` + flex-row-reverse (already
  implemented); **alert rows never flip** (all captured `flex-row`).

**CURRENT** Only `author_color` (username tint) exists; no row bg / body color.

**FIX**
1. Migration: `users` + `msg_bg_color TEXT NULL`, `msg_text_color TEXT NULL`
   (validated `#rrggbb`), forward-only.
2. Profile update endpoint accepts them; Settings modal "Colors & Size"
   (Background/Text pickers) saves to backend (currently local-only theme).
3. `MessageView`/`AlertView` + `Chat`/`Alert` WS events carry
   `author_bg_color`, `author_text_color` (same join as author_name).
4. FE (ChatPanel + AlertFeed): when `author_bg_color` present → row inline bg +
   username/timestamp/kebab `color: <bg>; filter: invert(1)`; when
   `author_text_color` present → name-block wrapper, QA button, body inline color.
   Absent → current stylesheet defaults (no change).

**VERIFY** Set colors on a test user; render both feeds; computed row bg /
inverted meta / body color equal the set values; users w/o colors unchanged.

---

## P1-2 · Typing indicator above composer

**EVIDENCE** (bundle):
- Template: `.d-flex.align-items-center.typing-indicator-container >
  .users-count.me-1 + .users-typing + .typing-indicator(3 spans)`.
- CSS: `.typing-indicator-container{margin:4px 16px}` (variant `margin:0 8px;
  border-top:1px solid #ccc`), `.users-count,.users-typing{color:#90949c;
  font-size:12px}`, `.users-typing em{font-weight:700}` + ellipsis,
  `.typing-indicator span{3px dots #9e9ea1 blink 1.5s staggered}`.

**CURRENT** None.

**FIX** WS `typing` event (client sends throttled on keystroke; server fans out
room-wide, ephemeral); FE renders the container above the composer with
"<em>Name</em> is typing" + 3-dot blink, per the rules above.

**VERIFY** Two sessions; typing in one shows the indicator in the other with the
exact computed styles.

---

## P1-3 · Date separator (both feeds)

**EVIDENCE**
- DOM: `div.separator > a` → text `"Sunday, July 19, 2026"` (weekday long,
  month long, day, year).
- Bundle: `.separator{display:flex;align-items:center;text-align:center;
  background-color:var(--msgs-separator-bg)!important}` (#e8e8e8) and
  `.separator a{color:var(--msgs-separator-color)!important;margin:0 auto;
  font-size:13px}` (#373c42).

**CURRENT** Verify ours (formatDayLabel + separator styles) against the above;
fix format to `weekday:'long', month:'long', day:'numeric', year:'numeric'`
and the exact colors/sizes if divergent.

**VERIFY** Rendered separator text + computed styles equal the rules.

---

## P2 · Verification + residuals

1. **Render-verify agent surfaces**: roster rows (#f1f1f1/#e1e1e1, 45px round
   avatars, 16px bolder names, 20px/600/#0a6db1 kebab, User Info/Mention/Copy),
   notes (Download LEFT btn-sm, welcome badge p-0 r6 9px), files (inline NNNKb +
   italic long datetime + per-row Download, bg-danger badges incl. 0), toasts
   (ngx-toastr) — screenshot + computed-style checks.
2. **Roster nickname color**: live room `--nickname-color: #0a6db1` — ours may
   render #676767 via sidebar inherit; set `.roster-name{color:#0a6db1}`.
3. **Nav item labels**: reference nav has `span.mainNavItem "Volume"/"Reload"`
   beside the 2x icons — extract `.mainNavItem` rule from the bundle (visibility/
   media behavior) before changing our icon-only buttons; act only on the rule.
4. **Files date string**: long month format ("May 4, 2026, 4:09:55 PM") — agent
   used month:long; verify rendered vs reference strings.
5. **QA button ✅/(N)** interplay with author text color (inline color per P1-1).

Order: P0-1 → P0-2 → P1-1 → P1-3 → P1-2 → P2. Each lands only with its VERIFY
step measured, then a single gated commit per tier (svelte-check + 42 E2E).
