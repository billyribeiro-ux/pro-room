# Color system (per-author message colors)

Scope: the end-to-end per-author / per-viewer color pipeline for chat & alert messages in the
"Mastering The Trade" room running class `lightTheme`. Covers the four inline-style knobs the app
writes onto every message — `background-color` (msg bg), `color` (text), `color` + `filter:invert(1)`
(username + kebab menu), and the `$SYMBOL`/trade-copy ticker spans — the Settings "Colors & Size"
pickers that feed them, the defaults when nothing is set, and the resolution precedence.

The message component is Angular `app-st-message`, host id `_ngcontent-ng-c1254915701`
(evidence: `mixed-files/odds-and-ends.html`, the `<app-st-message _ngcontent-ng-c1936721513="" _nghost-ng-c1254915701="">` block).

---

## DOM structure

Literal message tree, from `mixed-files/odds-and-ends.html` (whitespace collapsed), first message in the Alerts column:

```
<app-st-message _nghost-ng-c1254915701 class="ng-star-inserted">
  <div _ngcontent-ng-c1254915701 class="msg-box pb-1 ng-star-inserted"
       style=" background-color: rgb( 215, 215, 215 ); ">        <!-- styleB (ngStyle) -->
    <div clas="d-flex flex-column align-items-center w-100 ">      <!-- note: literal attr is "clas" (typo in source) -->
      <div class="mr-1 d-flex flex-row">
        <div class="d-flex justify-content-center align-items-start flex-nowrap mt-1">
          <a role="button" id="dropdownMenuLink" data-bs-toggle="dropdown"
             aria-haspopup="true" aria-expanded="false"
             class="msgMenu dropright pt-1"
             style=" color: rgb( 215, 215, 215 ); filter: invert(1); ">⠇</a>   <!-- invertTxtColorToggler(invertTxtColor,"name") -->
          <div aria-labelledby="dropdownMenuLink" class="dropdown-menu users-dropdown-options"> … </div>
        </div>
        …
        <span class="username mx-1" style=" color: rgb( 232, 232, 232 ); filter: invert( 1 ); ">…</span>
        …
        <div class="text-formated">…  <span class="stockColor"> $VLO</span> … </div>
      </div>
    </div>
  </div>
</app-st-message>
```

Load-bearing elements and the inline style each receives (all via Angular `ngStyle`, not literal attrs in the template — the template arrays carry only `3,"ngStyle"` / `3,"ngClass","ngStyle"` markers):

| Element | class | style bound (bundle var) |
|---|---|---|
| Message box | `msg-box pb-1` (chat) / `msg-box msg-box-adm` (staff) | `styleB` = `{"background-color": <author bg>}` |
| Kebab menu trigger | `msgMenu dropright pt-1` (also `dropleft float-right`, `dropright float-left` variants) | `invertTxtColorToggler(invertTxtColor,"name")` = `{color:<bg>, filter:"invert(1)", …}` |
| Username | `username mx-1` | `invertTxtColorToggler(invertTxtColor,"name")` (same object as kebab) |
| Message text | `text-formated` | `styleF` = `{color:<text>, "font-size":<n>px}` |
| Date / timestamp | (date `<a>`) | `styleF` |
| Badges wrapper | (inner-HTML span) | `styleF` |
| Reply-quote name | (reply block) | `invertTxtColorToggler(invertTxtColor,"name")`; reply body → `styleF` |
| `$TICKER` in body | `stockColor` (emitted by `parseSymbols` pipe) | inline `color:<tickerColor>` (or none) |
| Trade string in body | `tradeColor` id=`id_<msgId>` (emitted by copy-trades logic) | no inline color; global CSS |

Template attr arrays (bundle `docs/reference/live-bundle/main.d6f5272aa3783e43.js`):
- `[1,"msg-box","pb-1",3,"ngClass","ngStyle"]` — chat message box (ngClass toggles `msg-box-adm`, ngStyle = styleB).
- `[1,"msg-box","msg-box-adm",3,"ngStyle"]` — staff/admin message box (right-aligned reverse-row layout `["clas","w-100 h-100 d-flex flex-row-reverse"]`).
- `[…"aria-expanded","false",1,"msgMenu","dropright","pt-1",3,"ngStyle"]` — kebab (three drop-side/float variants exist).

Bindings, from the message component's update block (bundle):
```
H("ngClass",ht(30,i6,e.msg.isA))("ngStyle",e.styleB),           // msg-box: ngClass {msg-box-adm: msg.isA}, ngStyle=styleB
  m(4),H("ngStyle",e.invertTxtColorToggler(e.invertTxtColor,"name")),   // username / kebab
  …
  H("ngStyle",e.styleF)                                          // text / date / badges / reply body
```
`i6=t=>({"msg-box-adm":t})` — so a message flagged `msg.isA` (staff/presenter/admin authored) additionally gets `.msg-box-adm`.

### Role variants
- **member vs staff/admin:** identical color pipeline; the only structural difference is `msg.isA` → adds
  `msg-box-adm` (different default bg token, right-aligned reverse layout). Nothing in the color logic is
  gated on the viewer's role except the fallbacks below (presenterSettings, followedUsers apply to any viewer).
- **presenter-authored messages:** get their colors from `presenterSettings[msg.avt]` regardless of who is viewing (see Behavior). `presenterMsgsOnTheRight` / `presenter-msg-right` re-aligns but does not change color.

---

## Scoped CSS (verbatim)

From `docs/reference/live-bundle/main.d6f5272aa3783e43.js` (Angular component-scoped, `[_ngcontent-%COMP%]`; two near-identical variants exist in the bundle — 14px/16px and 600/900 weight builds — both listed):

```css
.msg-box[_ngcontent-%COMP%]{font-weight:100;font-size:16px;word-wrap:normal;text-align:inherit;width:100%;background-color:var(--msgs-bg);border-top:1px solid var(--msg-border-color)}
.msg-box[_ngcontent-%COMP%]{font-weight:100;font-size:14px;word-wrap:normal;text-align:inherit;width:100%;background-color:var(--msgs-bg);border-top:1px solid var(--msg-border-color)}
.msg-box-adm[_ngcontent-%COMP%]{background-color:var(--msgs-bg-adm);border-bottom:2px;padding-top:2px}
.msg-box[_ngcontent-%COMP%]:hover   .chat-reaction-hover[_ngcontent-%COMP%]{display:inline-block}

.msgMenu[_ngcontent-%COMP%]{padding-left:5px;font-size:20px;font-weight:600;color:var(--username-color)!important}
.msgMenu[_ngcontent-%COMP%]{padding-left:5px;font-size:20px;color:var(--username-color)!important}
.msgMenu[_ngcontent-%COMP%]:hover{color:var(--light-brown)!important;font-weight:900;cursor:pointer}

.username[_ngcontent-%COMP%]{cursor:pointer;font-size:14px;color:var(--username-color);font-weight:800}
.username[_ngcontent-%COMP%]{cursor:pointer;font-size:14px;color:var(--username-color);font-weight:900}

.text-formated[_ngcontent-%COMP%]{font-size:13px}
.text-formated[_ngcontent-%COMP%]{font-size:16px}

.private-reply-bg-dark[_ngcontent-%COMP%]{background-color:#161515}
.private-reply-bg-light[_ngcontent-%COMP%]{background-color:#f4f4f4}

.presenter-msg-right[_ngcontent-%COMP%]{text-align:right!important;margin-right:5px;padding-left:10px}
.chatNameAvatar[_ngcontent-%COMP%]{display:inline}
```

Key point: the scoped rules set the message bg / username / kebab color to `var(--msgs-bg)` /
`var(--username-color)` respectively. The inline `ngStyle` values (styleB / invertTxtColor / styleF) are
what override those vars **when a per-author or per-viewer color exists**. When they don't exist, the var wins.

`.mentionColor` and `.questionColor` are referenced in the template ngClass map
(`dge=(t,n,e)=>({mentionColor:t,questionColor:n,"presenter-msg-right":…})`) but **no matching CSS rule was
found in the message component scope** (see Honest gaps).

---

## Global CSS (verbatim)

From `docs/reference/live-bundle/styles.d622cb9ed2bbc221.css` — the ticker & trade spans are styled globally, not scoped:

```css
.stockColor{font-weight:700;font-style:italic;text-transform:uppercase}
.tradeColor{color:var(--app-link-color);text-decoration:underline}
.tradeColor:hover{cursor:pointer;opacity:.85}
```

lightTheme var indirection (global `styles.css`, `.lightTheme{…}` block — the room runs class `lightTheme`):
```css
.lightTheme{
  --msg-border-color: var(--lightTheme-msg-border-color);
  --username-color: var(--lightTheme-username-color);
  --msgs-bg: var(--lightTheme-msgs-bg);
  --msgs-bg-adm: var(--lightTheme-msgs-bg-adm);
  …
}
```
Boot-default base values in `styles.css` `:root` (`--lightTheme-msgs-bg:#f1f1f1!important`,
`--lightTheme-msgs-bg-adm:#e1e1e1!important`, `--lightTheme-username-color:#000!important`,
`--lightTheme-msg-border-color:#d9d9d9!important`, `--app-link-color:#00bc8c`) are **overridden by the LIVE
room tokens** — see Resolved values.

---

## Resolved values

Resolved against the **LIVE room** `cssVariables.root` in `docs/reference/captures/proroom-full-member.json`
and `proroom-full-presenter.json` (these override the boot defaults). Computed columns are actual captured
`element.style` values.

**LIVE room tokens (lightTheme):**

| Token | Live value | Boot default (overridden) |
|---|---|---|
| `--lightTheme-msgs-bg` → `--msgs-bg` | `#fff` | `#f1f1f1` |
| `--lightTheme-msgs-bg-adm` → `--msgs-bg-adm` | `#f4f4f4` | `#e1e1e1` |
| `--lightTheme-username-color` → `--username-color` | `#0a6db1` (rgb 10,109,177) | `#000` |
| `--lightTheme-msg-border-color` → `--msg-border-color` | `#e1e1e1` (rgb 225,225,225) | `#d9d9d9` |
| `--light-brown` | `#8c8686` | — |
| `--app-link-color` | `#45a2ff` (rgb 69,162,255) | `#00bc8c` |

**Message default style objects** (bundle, `this.chatStyle = {lightTheme:{…}, darkTheme:{…}}`; `alertStyle` and `presenterStyle` are identical):
```
lightTheme: { color:"#1a1a1a", tickerColor:"#1a1a1a", usernameColor:"#365d7d", bgColor:"#e8e8e8", fontSize:"13" }
darkTheme:  { color:"#f7fd37", tickerColor:"#f7fd37", usernameColor:"#c0d8ed", bgColor:"#000",    fontSize:"13" }
```
(A second default seen in the "follow chat" path uses `bgColor:"#ffffff", fontSize:14` — the followed-user modal seed, distinct from `chatStyle`.)

**Resolved per element** (computed from captures unless noted):

| Element | Property | Value when NO per-author color (var/default) | Value when per-author color present |
|---|---|---|---|
| `.msg-box` (chat) | background-color | `rgb(255,255,255)` = `--msgs-bg` (member/presenter capture, msgs with no styleB) | `rgb(232,232,232)` = `#e8e8e8` (default chatStyle bgColor via saved localStorage) or `rgb(215,215,215)` (per-message `msg.bkgColor`) — captured on real messages |
| `.msg-box.msg-box-adm` | background-color | `rgb(244,244,244)` = `#f4f4f4` = `--msgs-bg-adm` (presenter capture) | overridden by styleB if bkgColor set |
| `.msg-box` | border-top | `1px solid rgb(225,225,225)` = `--msg-border-color` #e1e1e1 (member capture) | unchanged (styleB only sets bg) |
| `.msgMenu` (⠇) | color | `rgb(10,109,177)` = `--username-color` #0a6db1, filter `none` (member/presenter capture) | `rgb(215,215,215)`/`rgb(232,232,232)` = the msg bkgColor, **filter `invert(1)`** (odds-and-ends raw DOM + presenter capture) |
| `.msgMenu` | font-size / font-weight | `20px` / `600` (scoped) | same |
| `.username` | color | `rgb(10,109,177)` = `--username-color` (presenter capture, 57 msgs) | `rgb(232,232,232)`/`rgb(215,215,215)` = msg bkgColor + `filter:invert(1)` (raw DOM `style="color:rgb(232,232,232);filter:invert(1)"`; presenter capture 45 msgs) |
| `.text-formated` | font-size | `13px` (scoped `.text-formated`; member capture had no saved chatStyle) | `<chatStyle.fontSize>px` inline via styleF |
| message text | color | inherits (theme msg color) | `<chatStyle.color>` / `<bkgColor-derived>` via styleF |
| `.stockColor` (`$SYM`) | color | inherited/default (member capture `rgb(26,26,26)`; no inline) | inline `color:<tickerColor>` — presenter capture `rgb(103,103,103)` and `rgb(32,149,242)` (saved chatStyle/followedUsers tickerColor) |
| `.stockColor` | font-weight/style/transform | `700` / italic / uppercase (global) | same |
| `.tradeColor` | color | `rgb(69,162,255)` = `--app-link-color` #45a2ff (member capture, 13 spans) | same (no per-author override) |
| `.tradeColor` | text-decoration | `underline` (global) | same |

**Distribution proof** (presenter capture, 100 msg-boxes): bg `rgb(255,255,255)`×53 (no styleB),
`rgb(232,232,232)`×24, `rgb(215,215,215)`×21, `rgb(244,244,244)`×2 (msg-box-adm). msgMenu:
`rgb(10,109,177)|invert(1)`×45 (bkgColor present), `rgb(10,109,177)|none`×55 (no bkgColor). username:
`rgb(232,232,232)`×24 + `rgb(215,215,215)`×21 (= their box bg, inverted) + `rgb(10,109,177)`×57 (default).

---

## States & effects

- **`filter: invert(1)` (kebab + username):** applied **only** when a per-message/per-author color exists,
  via `this.invertTxtColor = {color: <bkgColor>, filter:"invert(1)"}` bound through
  `invertTxtColorToggler`. The element's `color` is set to the message background color, then inverted, so the
  glyph/name renders as a guaranteed-contrast complement of the bubble. When no per-author color exists,
  `invertTxtColor = {}` → no inline color/filter → the scoped `color:var(--username-color)!important` wins and
  filter is `none` (captured: `filter: none`).
- **`invertTxtColorToggler(e,i)` size nudge** (bundle): when `invertTxtColor` carries a non-empty `fontSize`,
  it derives a per-target size — `"name"` (username) → `fontSize + 1 + "px"`, otherwise → `fontSize - 2 + "px"`.
  If the fontSize equals the theme's default (`chatStyle[theme].color` / `presenterStyle[theme].color`) it
  returns `{}` (no override).
- **`.msgMenu:hover`** → `color:var(--light-brown)!important; font-weight:900; cursor:pointer`
  (= `#8c8686` in this room).
- **`.msg-box:hover .chat-reaction-hover`** → `display:inline-block` (reaction affordance reveal; not a color effect).
- **`.tradeColor:hover`** → `cursor:pointer; opacity:.85`.
- **`.msg-box-adm`** conditional class (`{"msg-box-adm": msg.isA}`) → swaps bg token to `--msgs-bg-adm` and adds
  `border-bottom:2px; padding-top:2px`.
- **Redraw:** saving/resetting Colors&Size emits `redrawChatAndAlerts`, which re-runs the message color
  resolution (below) so existing bubbles re-tint live without reload.
- No CSS transitions/animations are attached to any of these color properties (none present in the scoped/global rules).

---

## Behavior

Color resolution runs in `app-st-message` `ngOnInit` (bundle). **Precedence, later wins** (each stage
overwrites `styleB`/`styleF`/`invertTxtColor`):

1. **Per-message author color** — `if (this.msg.bkgColor)` →
   `invertTxtColor = {color: msg.bkgColor, filter:"invert(1)"}`, `styleB = {"background-color": msg.bkgColor}`.
   `if (this.msg.fontColor)` → `styleF.color = msg.fontColor`. (Server-supplied per-message colors.)
2. **Badges** — each badge in `msg.b` renders `<span class="badge …" style="background-color: <r.bkcolor>; color: <r.color>">`
   (per-badge colors from `sessData.badgesH`; darkTheme badge variant swapped when `preferences.theme==="darkTheme"`).
   Gated on `preferences.chatBadges && !presenterMsgsOnTheRight && sessData.enableBadges` and, if
   `showBadgesToPresentersOnly`, `isPresenter`.
3. **Presenter colors** — `if (sessData.presenterSettings)` and `presenterSettings[msg.avt]` has both `color`
   and `bkgColor` → `this.presenterColors = that`; then
   `invertTxtColor = {color: presenterColors.bkgColor, filter:"invert(1)"}`,
   `styleB = {"background-color": presenterColors.bkgColor}`, `styleF.color = presenterColors.color`.
   (Overrides step 1 for presenter-authored messages, for **all viewers**. `msg.avt` = hashed-email author key.)
4. **Viewer's saved chatStyle** — `const e = localStorage.getItem("chatStyle")` → if present, JSON-parsed `o`:
   - if `presenterColors` set: keep presenter bg/color but apply `styleF["font-size"]=o.fontSize+"px"`.
   - else: `invertTxtColor = {color: o.usernameColor, fontSize: o.fontSize}`,
     `styleF["font-size"]=o.fontSize+"px"`, `styleF.color = o.color`,
     `styleB = {"background-color": o.bgColor}`. (This is why the member/presenter capture bubbles show
     `#e8e8e8`/etc. — the viewer's saved chatStyle bg, not the raw token.)
5. **Followed-user override** — `const {followedUsers:i} = globals`; if `i[msg.avt]` exists →
   `o.followChatStyle` wins: `styleF["font-size"]=followChatStyle.fontSize+"px"`,
   `styleB={"background-color": followChatStyle.bgColor}`, `styleF.color=followChatStyle.color`,
   `invertTxtColor={color: followChatStyle.usernameColor, fontSize: followChatStyle.fontSize}`,
   `hasCustomFollowedUserColors=true`. **Highest precedence** — a per-viewer, per-author override.

**Ticker (`$SYMBOL`) interplay** — `parseSymbols` pipe → `parseStock` (bundle). For each `$XXX` token:
- chat: reads `localStorage.chatStyle` and `localStorage.followedUsers`. If the author is a followed user
  → `<span class="stockColor" style="color:<followChatStyle.tickerColor>">`; else if chatStyle saved →
  `color:<chatStyle.tickerColor>`; else plain `<span class="stockColor">` (global CSS default).
- alerts: reads `localStorage.alertStyle` → `color:<alertStyle.tickerColor>`; else plain.
- So the ticker color is a **separate per-viewer knob** (`tickerColor`) from the message text color, and honors
  the same followed-user override. Captured proof: presenter had `stockColor` colored `rgb(103,103,103)` /
  `rgb(32,149,242)`; member (no saved style) had bare `<span class="stockColor">` (odds-and-ends raw DOM).

**Trade-copy (`tradeColor`)** — copy-trade markup: message text containing `[{( … )}]` is rewritten to
`<span class="tradeColor" id="id_<msg._id>"> … </span>` (bundle, in the alerts/copy-trades map). Clicking it
(`copyTradeOnClick`: target is a `SPAN` with class `tradeColor` and matching id) calls `doTradeCopy(id)` which
reads `textContent` of `#<id>`. Color is **not** per-author — always global `.tradeColor{color:var(--app-link-color)}`
(= `#45a2ff` live). Gated on `sessData.enableCopyTrades && logType==="alerts"`.

**Settings → "Colors & Size" panel** (bundle template, section labeled `"Colors & Size:"` with icon
`.fa-wrench`) edits the viewer's `chatStyle` (ngModel two-way), five controls:

| Control | input | model | label |
|---|---|---|---|
| Text Color | `<input type="color" id="chat-text-color">` | `chatStyle.color` | "Text Color" |
| Username Color | `<input type="color" id="chat-username-color">` | `chatStyle.usernameColor` | "Username Color" |
| Background Color | `<input type="color" id="chat-bg-color">` | `chatStyle.bgColor` | "Background Color" |
| Ticker Color | `<input type="color" id="chat-ticker-color">` | `chatStyle.tickerColor` | "Ticker Color" |
| Text Size | `<input type="number" id="chat-text-size">` | `chatStyle.fontSize` | "Text Size" |

- **Save changes** → `saveChatStyle()`: `guiEventBus.emit("chatStyle", chatStyle)`,
  `localStorage.setItem("chatStyle", JSON.stringify(chatStyle))`, `emit("redrawChatAndAlerts")`.
- **Reset** → `resetChatStyle()`: removes `localStorage.chatStyle`, resets
  `chatStyle = {...globals.chatStyle[preferences.theme]}` (the defaults above), re-emits, redraws.
- Presenters get a parallel **presenter** panel: `savePresenterStyle()` sends admin command
  `savePresenterColors` `{key: hashEmail(user.email), val:{bkgColor: presenterStyle.bgColor, color: presenterStyle.color}}`
  — i.e. presenter colors are stored **server-side** (feeding step 3's `presenterSettings[msg.avt]`), not in localStorage.
- The **followed-user** color modal ("Edit chat text colors & size") edits `followChatStyle`
  (Text Color / Username Color / Background Color / Ticker Color) → step 5.

---

## Honest gaps

- **`.mentionColor` / `.questionColor` CSS not located.** The classes are toggled by the template ngClass map
  (`{mentionColor: msg.isMention, questionColor: …}`) and `msg.isMention` is set when the body contains
  `@<viewer name>`, but no matching CSS rule was found in the message component scope or the searched global
  CSS. Their actual color is not proven by the evidence here.
- **`msg.bkgColor` / `msg.fontColor` provenance.** These are read off the server message object; the evidence
  shows they are applied (raw DOM `rgb(215,215,215)`/`rgb(232,232,232)` bubbles) but not where the server
  assigns them per author, nor the exact author→color algorithm on the backend.
- **`presenterSettings` / `badgesH` / `followedUsers` contents** are session/server data not present in the
  static bundle; only the shapes consumed (`.color`, `.bkgColor`, `.tickerColor`, `.bkcolor`) are proven.
- **fontSize captured value not exercised in member view.** The member capture had no saved `chatStyle`, so
  `.text-formated` showed the scoped `13px`; the styleF `font-size:<n>px` inline path is proven from the
  bundle code and the presenter capture, not from an inline member-DOM sample.
- **Two bundle variants** (`.msg-box` 14px vs 16px; `.username` 800 vs 900; `.text-formated` 13 vs 16) both
  appear in the single bundle string; which is the active emitted rule for this specific room build is not
  disambiguated by the captures beyond the computed `.username` weight (`600`) / `.msg-box` values observed.
- **`msg.avt`** is used as the author key (hashed email) in presenterSettings / followedUsers lookups; the
  hashing (`appService.hashEmail`) implementation was not decoded here.
