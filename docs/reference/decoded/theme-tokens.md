# Theme-tokens

The master color reference for the "Mastering The Trade" room. This surface has no DOM of its own — it is
the CSS-custom-property system. The room boots with two `:root` blocks (a Darkly-navy default, then a
"blue navy" override that wins), the LIVE room resolves to the **blue-navy** palette, and a single element
`app-room#topRoomDiv` carries `class="lightTheme"`, which remaps ~20 chat/roster tokens for its whole subtree.

**Load-bearing facts (cited below):**
- The room runs `.lightTheme` (not `.darkTheme`). Source: `app-room#topRoomDiv` has `class="lightTheme"` in
  every capture (member/presenter/admin) — see DOM structure.
- The LIVE `:root` is the **blue-navy** theme (`--navbar-bg:#0c2434`, `--app-link-color:#45a2ff`), NOT the
  Darkly default (`--navbar-bg:#000`, `--app-link-color:#00bc8c`). Two boot `:root` blocks exist; the second
  (blue) is later in source order at equal specificity, so it wins. Source: `proroom-full-member.json`
  `cssVariables.root`, cross-checked against `file-1.html` lines 418 & 616.
- The **complete** `.lightTheme`/`.darkTheme` mapping (20 vars) lives in the global stylesheet
  `styles.d622cb9ed2bbc221.css`. The boot inline `<style>` (file-1.html 755–779) carries only a **truncated
  10-var subset** of the same mapping.

---

## DOM structure

There is no dedicated markup. The token system attaches to three nodes:

1. **`<html>` / `<body>`** — carry the six boot `:root` blocks (inline `<style>` in `file-1.html`) plus the
   linked global stylesheet. `meta.theme` in every capture reports `htmlClass:"", bodyClass:""` — no theme
   class on html/body.
   - Cite: `proroom-full-member.json` `meta.theme = {"htmlClass":"","bodyClass":""}`.

2. **`app-room#topRoomDiv`** — the theme-carrier. `class="lightTheme"`. Every descendant of this node resolves
   the mapped tokens (`--msg-bg`, `--msgs-bg`, `--roster-bg`, `--textarea-bg`, …) to their `--lightTheme-*`
   sources.
   - Cite (member): `proroom-full-member.json` element `app-room#topRoomDiv`, `attrs.class = "lightTheme"`.
   - Cite (presenter): `proroom-full-presenter.json` — same node, same class.
   - Cite (admin): `proroom-all-admin.json` — same node, same class.
   - **Role note:** identical across member / presenter / admin. There is no role-specific token override —
     the difference between roles is which DOM/features render, not which tokens are set.

3. **`:root` (document element)** — holds ~230 custom properties: Bootstrap 4 Darkly (`--blue`, `--primary`…),
   Bootstrap 5 (`--bs-*`), and the app palette (`--navbar-*`, `--sidebar-*`, `--msgs-*`, `--modal-*`,
   `--lightTheme-*`, `--darkTheme-*`).

The **`.darkTheme`** class is defined and mapped but is **not applied** in any captured state — it is the
alternate theme the same room supports.

---

## Scoped CSS (verbatim)

The theme **mapping blocks** are NOT component-scoped (`[_ngcontent-…]`) — they are global (see next section).
The bundle `main.d6f5272aa3783e43.js` contains the **consumers** of the mapped/room tokens as Angular
component-scoped strings. Verbatim consumer rules (extracted by regex from the bundle):

```css
/* chat message body — reads the mapped tokens */
.msg-box[_ngcontent-%COMP%]{ ... width:100%; background-color:var(--msgs-bg);
                             border-top:1px solid var(--msg-border-color); ... }
.msg-box-adm[_ngcontent-%COMP%]{ background-color:var(--msgs-bg-adm); border-bottom:2px; padding-top:2px; }
.msg-left[_ngcontent-%COMP%], .msg-right[_ngcontent-%COMP%]{ color:var(--msg-color); word-break:break-word; }
.created-at[_ngcontent-%COMP%]{ font-size:12px; color:var(--date-color); overflow:hidden; font-weight:600; }
.username[_ngcontent-%COMP%]{ cursor:pointer; font-size:14px; color:var(--username-color); font-weight:900; }
.msgMenu[_ngcontent-%COMP%]{ ...font-weight:600; color:var(--username-color)!important; }
.menuTriger[_ngcontent-%COMP%]:after{ content:"\2807"; font-size:20px; color:var(--username-color); ... }
span.chat-stars[_ngcontent-%COMP%]{ color:var(--username-color); }
.stars-num[_ngcontent-%COMP%]{ position:absolute; color:var(--msgs-bg); left:6px; top:5px; ... }
.userLocation[_ngcontent-%COMP%]{ ...font-size:12px; margin-bottom:0; color:var(--user-location-color); }

/* message-list & private-chat scrollers */
.list-of-msgs[_ngcontent-%COMP%]{ ...overflow-y:scroll; background-color:var(--msgs-bg); }
.privChatScroller[_ngcontent-%COMP%]{ background-color:var(--msgs-bg); }
[_nghost-%COMP%]{ background-color:var(--msgs-bg); }           /* a chat host component */

/* composer / textareas — read --textarea-bg / --textarea-color */
.txt-area[_ngcontent-%COMP%]{ ...color:var(--textarea-color)!important;
                              background-color:var(--textarea-bg)!important; outline:none; overflow:...; }
.txt-area-alert[_ngcontent-%COMP%]{ ...color:var(--textarea-color)!important;
                                     background-color:var(--textarea-bg)!important; ... }
#textAreaHolder[_ngcontent-%COMP%]{ background-color:var(--textarea-bg); border-radius:8px; padding:5px; margin:5px; }
#textAreaAlertHolder[_ngcontent-%COMP%]{ background-color:var(--textarea-bg); border-radius:8px; padding:5px; margin:5px; }
#textAreaHolderPM[_ngcontent-%COMP%]{ background-color:var(--textarea-bg); border-radius:8px; padding:5px; margin:0 5px; }
#textAreaTxt[_ngcontent-%COMP%], .textAreaBtnsCol[_ngcontent-%COMP%]{ background-color:var(--textarea-bg); }
#textAreaReplyTxt[_ngcontent-%COMP%], .textAreaBtnsCol[_ngcontent-%COMP%]{ background-color:var(--textarea-bg); }
#textAreaQATxt[_ngcontent-%COMP%], .textAreaBtnsCol[_ngcontent-%COMP%]{ background-color:var(--textarea-bg); }
.textAreaBtnsCol[_ngcontent-%COMP%]{ background-color:var(--textarea-bg)!important; color:var(--dark-gray)!important; }

/* roster / chat container — mapped tokens WITHOUT a --lightTheme fallback default */
/* roster row bg */  { background-color:var(--roster-bg); border-bottom:1px solid var(--dark-gray); }
/* chat pane bg  */  { background-color:var(--chat-bg); }        /* x3 in bundle */
/* nickname      */  { font-weight:bolder; font-size:16px; color:var(--nickname-color); position:relative; }

/* sidebar wrapper — mapped tokens */
{ ...width:250px; background-color:var(--sidebar-wrapper-bg-color)!important;
   color:var(--sidebar-wrapper-color)!important; z-index:3...; }

/* mobileApp info line */
{ ...var(--mobileApp-info-bg-color); color:var(--mobileApp-info-color); }
```

(Bundle also consumes the non-mapped room tokens directly, e.g. `--navbar-bg` ×4, `--navbar-color` ×6,
`--sidebar-menu-bg` ×2, `--msgs-header-bg` ×9, `--modal-content-bg-color` ×16, `--checkbox-bg-color` ×8,
`--textarea-holder-btns-color` ×5 — counted from `main.d6f5272aa3783e43.js`.)

---

## Global CSS (verbatim)

### The complete theme mapping — `styles.d622cb9ed2bbc221.css` (this is the authority; boot inline is a subset)

```css
.lightTheme{--msg-bg: var(--lightTheme-msg-bg);--msg-border-color: var(--lightTheme-msg-border-color);--date-color: var(--lightTheme-date-color);--msg-color: var(--lightTheme-msg-color);--username-color: var(--lightTheme-username-color);--msgs-bg: var(--lightTheme-msgs-bg);--roster-bg: var(--lightTheme-roster-bg);--msgs-bg-adm: var(--lightTheme-msgs-bg-adm);--roster-bg-adm: var(--lightTheme-roster-bg-adm);--textarea-color: var(--lightTheme-textarea-color);--textarea-bg: var(--lightTheme-textarea-bg);--user-location-color: var(--lightTheme-user-location-color);--sidebar-wrapper-bg-color: var(--lightTheme-sidebar-wrapper-bg-color);--sidebar-wrapper-color: var(--lightTheme-sidebar-wrapper-color);--nickname-color: var(--lightTheme-nickname-color);--mobileApp-info-color: var(--lightTheme-mobileApp-info-color);--msgs-separator-color: var(--lightTheme-msgs-separator-color);--msgs-separator-border-color: var(--lightTheme-msgs-separator-border-color);--msgs-separator-bg: var(--lightTheme-msgs-separator-bg);--chat-bg: var(--lightTheme-chat-bg)}

.darkTheme{--msg-bg: var(--darkTheme-msg-bg);--msg-border-color: var(--darkTheme-msg-border-color);--date-color: var(--darkTheme-date-color);--msg-color: var(--darkTheme-msg-color);--username-color: var(--darkTheme-username-color);--msgs-bg: var(--darkTheme-msgs-bg);--roster-bg: var(--darkTheme-roster-bg);--msgs-bg-adm: var(--darkTheme-msgs-bg-adm);--roster-bg-adm: var(--darkTheme-roster-bg-adm);--textarea-color: var(--darkTheme-textarea-color);--textarea-bg: var(--darkTheme-textarea-bg);--user-location-color: var(--darkTheme-user-location-color);--sidebar-wrapper-bg-color: var(--darkTheme-sidebar-wrapper-bg-color);--sidebar-wrapper-color: var(--darkTheme-sidebar-wrapper-color);--nickname-color: var(--darkTheme-nickname-color);--mobileApp-info-color: var(--darkTheme-mobileApp-info-color);--msgs-separator-color: var(--darkTheme-msgs-separator-color);--msgs-separator-border-color: var(--darkTheme-msgs-separator-border-color);--msgs-separator-bg: var(--darkTheme-msgs-separator-bg);--chat-bg: var(--darkTheme-chat-bg)}

/* immediately after the darkTheme block: */
html,body{background-color:#fff;overflow:hidden!important}

/* only darkTheme-scoped visual rule in the global sheet: */
.darkTheme .sidebar-item:hover{background-color:#111!important}
```

The boot inline `<style>` (`file-1.html` 755–779) contains the **same mapping but truncated to 10 vars**
(`--msg-bg, --msg-border-color, --date-color, --msg-color, --username-color, --msgs-bg, --msgs-bg-adm,
--textarea-color, --textarea-bg, --user-location-color`). It is missing `--roster-bg`, `--roster-bg-adm`,
`--sidebar-wrapper-bg-color`, `--sidebar-wrapper-color`, `--nickname-color`, `--mobileApp-info-color`,
`--msgs-separator-*`, `--chat-bg`. The full `styles.css` copy supplies those, so all 20 map correctly at runtime.

### The boot `:root` blocks — `file-1.html` inline `<style>` (lines given)

There are **two app-palette `:root` blocks** with equal specificity; per CSS cascade the **later (line 616)
wins** for every shared key. The LIVE captured `:root` matches the line-616 (blue-navy) block exactly for
all 109 keys that differ between them.

- **Block #1 (Darkly default), `file-1.html` lines 419–562** — `--navbar-bg:#000`, `--app-link-color:#00bc8c`,
  `--sidebar-menu-active-color:#f7fd37`, `--modal-content-bg-color:#303030`, etc. **DOES NOT WIN.**
- **Block #2 (blue-navy override), `file-1.html` lines 617–753** — `--navbar-bg:#0c2434`,
  `--app-link-color:#45a2ff`, `--sidebar-menu-active-color:#45a2ff`, `--modal-content-bg-color:#103d5c`, etc.
  **THIS IS THE LIVE ROOM.**

Note block #2 does not redefine a handful of keys (the `--darkTheme-chat-bg`, `--darkTheme-msg-bg`,
`--darkTheme-roster-*`, `--darkTheme-sidebar-wrapper-*`, `--darkTheme-nickname-color`,
`--darkTheme-mobileApp-info-color`, `--darkTheme-msgs-separator-*`, and the parallel `--lightTheme-*`
separator/roster/chat keys). For those, block #1's value carries through to live unchanged
(e.g. `--darkTheme-chat-bg:#000`, `--lightTheme-chat-bg:#eee`, `--lightTheme-roster-bg:#f1f1f1`).
There is also a duplicate block #2 (`file-1.html` line 259 is Bootstrap-5 `--bs-*`; lines 418 & 616 are the
two app blocks).

---

## Resolved values

### A. The LIVE room `:root` — full app-palette resolved values
(Source: `proroom-full-member.json` `cssVariables.root`; identical in `proroom-full-presenter.json` and
`proroom-all-admin.json`.)

| Token | LIVE value | (boot Darkly #1 was) |
|---|---|---|
| `--app-font-family` | `'Open Sans', sans-serif` | `Arial, Helvetica, sans-serif` |
| `--app-link-color` | `#45a2ff` | `#00bc8c` |
| `--avatar-gear-icon-padding` | `3px 6px` | `5px 5.5px` |
| `--navbar-bg` | `#0c2434` | `#000` |
| `--navbar-color` | `#fff` | `#fff` |
| `--sidebar-menu-bg` | `#103d5c` | `#000` |
| `--sidebar-menu-color` | `#fff` | `#ccc` |
| `--sidebar-menu-active-color` | `#45a2ff` | `#f7fd37` |
| `--sidebar-navItem-border-color` | `#fff` | `transparent` |
| `--sidebar-wrapper-bg-color` | `#103d5c` | *(unset in #1)* |
| `--sidebar-wrapper-color` | `#fff` | *(unset in #1)* |
| `--users-color` | `#fff` | `#fff` |
| `--users-border-color` | `#fff` | `#000` |
| `--users-badge-bg-color` | `#0e3651` | `#375a7f` |
| `--users-badge-color` | `#f4f4f4` | `#fff` |
| `--presenter-area-bg` | `#0f2e43` | `#111` |
| `--presenter-noRecording-color` | `#fff` | `#f7fd37` |
| `--presenter-recording-color` | `#45a2ff` | `#f00` |
| `--textarea-bg` (base, non-mapped) | `#111` | `#111` (= `var(--darker-black)`) |
| `--textarea-holder-border-color` | `#0a6db1` | `#fff` |
| `--textarea-holder-btns-color` | `#676767` | `#bbb` |
| `--textarea-holder-btns-hover-color` | `#0a6db1` | *(unset in #1)* |
| `--tab-active-bg` | `#45a2ff` | `#222` |
| `--tabs-color` | `#fff` | `#fff` |
| `--note-tabs-color` | `#fff` | `#00bc8c` |
| `--notes-tabs-bg` | `#0c2434` | `#111` |
| `--tabs-dropdown-bg` | `#0f2e43` | `#323232` |
| `--tabs-dropdown-color` | `#45a2ff` | `#777` |
| `--tabs-border-color` | `#0a6db1` | `#444` |
| `--session-control-dropdown-bg` | `#0e3651` | `#222` |
| `--dropdown-divider-bg` | `#45a2ff` | `#e9ecef` |
| `--note-download-bg` | `#92d528` | `#00bc8c` |
| `--note-delete-bg` | `#bb352a` | `#e74c3c` |
| `--note-next-bg` | `#45a2ff` | `#375a7f` |
| `--note-options-color` | `#fff` | `#fff` |
| `--note-options-hover-color` | `#212529` | `#cccc` |
| `--note-options-bg` | `#f4f4f4` | `#111` |
| `--note-text-bg` | `#fff` | `#222` |
| `--note-text-color` | `#676767` | `#ccc` |
| `--file-download-bg` | `#92d528` | `#00bc8c` |
| `--file-delete-bg` | `#bb352a` | `#e74c3c` |
| `--file-see-more-bg` | `#45a2ff` | `#375a7f` |
| `--file-list-odd-bg` | `#fff` | `#fff` |
| `--file-list-even-bg` | `#f4f4f4` | `#f4f4f4` |
| `--file-name-color` | `#0a6db1` | `#333` |
| `--file-size-color` | `#b2b2b2` | `#b2b2b2` |
| `--file-searchbar-color` | `#b7b7b7` | `#b7b7b7` |
| `--file-searchbar-icon-color` | `#666666` | `#666666` |
| `--file-searchbar-bg` | `#fff` | `#fff` |
| `--msgs-header-color` | `#fff` | `#ccc` |
| `--msgs-header-bg` | `#0a6db1` | `#111` |
| `--split-gutter-bg` | `#0a6db1` | `#000` |
| `--split-gutter-color` | `#fff` | `#fff` |
| `--msgs-separator-color` (base) | `#fff` | `#373c42` |
| `--msgs-separator-bg` (base) | `#45a2ff` | `#e8e8e8` |
| `--msgs-separator-border-color` (base) | `#45a2ff` | `#373c42` |
| `--nickname-color` (base) | `#0a6db1` | *(unset in #1)* |
| `--rosterImg-border-radius` | `50%` | `0` |
| `--archives-dropdown-menu-bg-color` | `#0e3651` | `#fff` |
| `--archives-dropdown-menu-color` | `#45a2ff` | `#222222` |
| `--search-icon-bg-color` | `#45a2ff` | `#adb5bd` |
| `--search-icon-color` | `#f4f4f4` | `#222` |
| `--reload-icon-bg-color` | `#f4f4f4` | `#00bc8c` |
| `--reload-icon-color` | `#45a2ff` | `#fff` |
| `--ptr-website-link-color` | `#45a2ff` | `#00bc8c` |
| `--mobileApp-info-bg-color` | `transparent` | `transparent` |
| `--mobileApp-info-color` (base) | `#f4f4f4` | `#676767` |
| `--modal-content-bg-color` | `#103d5c` | `#303030` |
| `--modal-content-color` | `#f4f4f4` | `#fff` |
| `--modal-content-border-color` | `#103d5c` | `#444` |
| `--modal-tabs-border-color` | `#45a2ff` | `#444` |
| `--modal-active-tab-bg-color` | `#45a2ff` | `#222` |
| `--modal-active-tab-color` | `#fff` | `#00bc8c` |
| `--modal-active-tab-border-color` | `#45a2ff` | `#444` |
| `--checkbox-bg-color` | `#45a2ff` | `#00bc8c` |
| `--modal-btn-hover-opacity` | `0.9` | `0.9` |
| `--modal-btn-close-bg` / `-border` | `#0a6db1` | `#375a7f` |
| `--modal-btn-success-bg` / `-border` | `#92d528` | `#00bc8c` |
| `--modal-btn-danger-bg` / `-border` | `#bb352a` | `#e74c3c` |
| `--modal-input-group-bg` | `#0a6db1` | `#444` |
| `--modal-upload-files-color` | `#0a6db1` | `#555` |
| `--modal-alert-link-color` | `#0a6db1` | `#00bc8c` |
| `--sidebar-navItem-border-color` | `#fff` | `transparent` |

**Non-app base tokens (unchanged from Darkly boot, present in LIVE `:root`):** `--blue:#375a7f`,
`--primary:#375a7f`, `--secondary:#444`, `--success:#00bc8c`, `--info:#3498DB`, `--warning:#F39C12`,
`--danger:#E74C3C`, `--green:#00bc8c`, `--red:#f00`, `--yellow:#ff0`, `--fire-yellow:#f7fd37`,
`--white:#fff`, `--black:#000`, `--dark-black:#222`, `--darker-black:#111`, `--light-black:#373c42`,
`--lighter-black:#3e444a`, `--dark-gray:#aaa`, `--gray:#bbb`, `--light-gray:#ccc`, `--lighter-gray:#eee`,
`--name-color:#c0d8ed`, `--light-blue:#40e0d0`, `--light-green:#1edd6e`, `--transparent-gray:rgba(255,255,255,0.331)`.
(Cite: `proroom-full-member.json` `cssVariables.root`.)

### B. The `--lightTheme-*` / `--darkTheme-*` source pairs (in LIVE `:root`)

| source var | LIVE lightTheme | LIVE darkTheme |
|---|---|---|
| msg-bg | `#fff` | `#000` |
| msg-border-color | `#e1e1e1` | `#f4f4f4` |
| date-color | `#a8a8a8` | `#a8a8a8` |
| msg-color | `#676767` | `#fff` |
| username-color | `#0a6db1` | `#0a6db1` |
| msgs-bg | `#fff` | `#143c57` |
| roster-bg | `#f1f1f1` | `#111` |
| msgs-bg-adm | `#f4f4f4` | `#0f2e43` |
| roster-bg-adm | `#e1e1e1` | `#000` |
| textarea-color | `#676767` | `#f4f4f4` |
| textarea-bg | `#fff` | `#0c2434` |
| user-location-color | `#676767` | `#f4f4f4` |
| sidebar-wrapper-bg-color | `#fff` | `#000` |
| sidebar-wrapper-color | `#676767` | `#f4f4f4` |
| nickname-color | `#676767` | `#c0d8ed` |
| mobileApp-info-color | `#676767` | `#f4f4f4` |
| msgs-separator-color | `#373c42` | `#aaa` |
| msgs-separator-border-color | `#373c42` | `#373c42` |
| msgs-separator-bg | `#e8e8e8` | `#222` |
| chat-bg | `#eee` | `#000` |

(Cite: `proroom-full-member.json` `cssVariables.root` keys `--lightTheme-*` / `--darkTheme-*`.)

### C. FINAL resolved mapped tokens under `.lightTheme` (what the room actually paints)

Because `app-room#topRoomDiv` = `.lightTheme`, every descendant sees these. The `.lightTheme` rule
(specificity 0,1,0) **overrides** the room `:root` (0,0,0) for the four tokens that exist in both
(`--sidebar-wrapper-bg-color`, `--sidebar-wrapper-color`, `--nickname-color`, `--mobileApp-info-color`,
`--msgs-separator-*`) — the mapped light value wins over the base room value.

| Mapped token | resolves via | **FINAL value** | Verified computed sample |
|---|---|---|---|
| `--msg-bg` | `var(--lightTheme-msg-bg)` | `#fff` | — |
| `--msg-border-color` | `var(--lightTheme-msg-border-color)` | `#e1e1e1` | `.msg-box` border-top |
| `--date-color` | `var(--lightTheme-date-color)` | `#a8a8a8` | — |
| `--msg-color` | `var(--lightTheme-msg-color)` | `#676767` | `.msg-left` color = `rgb(103,103,103)` ✓ |
| `--username-color` | `var(--lightTheme-username-color)` | `#0a6db1` | — |
| `--msgs-bg` | `var(--lightTheme-msgs-bg)` | `#fff` | `.msg-box` bg = `rgb(255,255,255)` ✓ |
| `--roster-bg` | `var(--lightTheme-roster-bg)` | `#f1f1f1` | — |
| `--msgs-bg-adm` | `var(--lightTheme-msgs-bg-adm)` | `#f4f4f4` | — |
| `--roster-bg-adm` | `var(--lightTheme-roster-bg-adm)` | `#e1e1e1` | — |
| `--textarea-color` | `var(--lightTheme-textarea-color)` | `#676767` | `#textAreaTxt` color = `rgb(103,103,103)` ✓ |
| `--textarea-bg` | `var(--lightTheme-textarea-bg)` | `#fff` | `#textAreaTxt` bg = `rgb(255,255,255)` ✓ |
| `--user-location-color` | `var(--lightTheme-user-location-color)` | `#676767` | — |
| `--sidebar-wrapper-bg-color` | `var(--lightTheme-sidebar-wrapper-bg-color)` | `#fff` **(overrides room `#103d5c`)** | — |
| `--sidebar-wrapper-color` | `var(--lightTheme-sidebar-wrapper-color)` | `#676767` **(overrides `#fff`)** | — |
| `--nickname-color` | `var(--lightTheme-nickname-color)` | `#676767` **(overrides room `#0a6db1`)** | — |
| `--mobileApp-info-color` | `var(--lightTheme-mobileApp-info-color)` | `#676767` **(overrides `#f4f4f4`)** | — |
| `--msgs-separator-color` | `var(--lightTheme-msgs-separator-color)` | `#373c42` **(overrides `#fff`)** | — |
| `--msgs-separator-border-color` | `var(--lightTheme-msgs-separator-border-color)` | `#373c42` **(overrides `#45a2ff`)** | — |
| `--msgs-separator-bg` | `var(--lightTheme-msgs-separator-bg)` | `#e8e8e8` **(overrides `#45a2ff`)** | `.msg-box`(separator) bg = `rgb(232,232,232)` ✓ |
| `--chat-bg` | `var(--lightTheme-chat-bg)` | `#eee` | — |

Computed samples cite `proroom-full-member.json` `elements[]` `.msg-box.pb-1`, `.msg-left.text-formated`,
`textarea#textAreaTxt` `style.background-color` / `style.color`.

### D. Which surface consumes which token (consumer map)

| Surface / element | Consumes |
|---|---|
| Chat message body (`.msg-box`) | `--msgs-bg` (bg), `--msg-border-color` (border-top) |
| Staff/admin message (`.msg-box-adm`) | `--msgs-bg-adm` (bg) |
| Message text (`.msg-left/.msg-right`) | `--msg-color` |
| Message timestamp (`.created-at`) | `--date-color` |
| Username (`.username`,`.msgMenu`,`.menuTriger:after`,`.chat-stars`) | `--username-color` |
| User location (`.userLocation`) | `--user-location-color` |
| Star badge number (`.stars-num`) | `--msgs-bg` (as text color) |
| Message list / private-chat scrollers (`.list-of-msgs`,`.privChatScroller`) | `--msgs-bg` |
| Composer textareas (`.txt-area`,`.txt-area-alert`,`#textAreaTxt/Holder/HolderPM/ReplyTxt/QATxt`) | `--textarea-bg`, `--textarea-color` |
| Roster row | `--roster-bg`, `--dark-gray` (border) |
| Chat pane background | `--chat-bg` |
| Nickname header | `--nickname-color` |
| Sidebar wrapper | `--sidebar-wrapper-bg-color`, `--sidebar-wrapper-color` |
| MobileApp info line | `--mobileApp-info-color`, `--mobileApp-info-bg-color` |
| Navbar | `--navbar-bg`, `--navbar-color` |
| Sidebar menu | `--sidebar-menu-bg`, `--sidebar-menu-color`, `--sidebar-menu-active-color` |
| Messages header | `--msgs-header-bg`, `--msgs-header-color` |
| Tabs (notes/files) | `--tab-active-bg`, `--tabs-color`, `--note-tabs-color`, `--notes-tabs-bg`, `--tabs-dropdown-*`, `--tabs-border-color` |
| Split gutter | `--split-gutter-bg`, `--split-gutter-color` |
| Search / reload icons | `--search-icon-*`, `--reload-icon-*` |
| Modals | `--modal-content-*`, `--modal-active-tab-*`, `--modal-tabs-border-color`, `--modal-btn-*`, `--modal-input-group-bg`, `--checkbox-bg-color` |
| Presenter/stage | `--presenter-area-bg`, `--presenter-recording-color`, `--presenter-noRecording-color` |
| Notes panel | `--note-download-bg`, `--note-delete-bg`, `--note-next-bg`, `--note-text-*`, `--note-options-*` |
| Files panel | `--file-download-bg`, `--file-delete-bg`, `--file-see-more-bg`, `--file-list-*`, `--file-name-color`, `--file-searchbar-*` |
| App links (global) | `--app-link-color` (5× in `styles.css`), `--ptr-website-link-color` |

---

## States & effects

- **Theme toggle (light ↔ dark):** the app swaps `class="lightTheme"` ↔ `class="darkTheme"` on
  `app-room#topRoomDiv`. That single class flip re-points all 20 mapped tokens to the opposite `--*Theme-*`
  source set (Global CSS blocks above). No other DOM changes. Live state is `lightTheme` in all captures.
- **`.darkTheme .sidebar-item:hover{background-color:#111!important}`** — the only theme-scoped hover rule in
  the global sheet; applies only in dark mode (not active in the captured room). Source: `styles.d622cb9ed2bbc221.css`.
- **Cascade / precedence within the subtree:** `.lightTheme` (0,1,0) beats `:root` (0,0,0). So for tokens
  defined in BOTH the room `:root` and the `.lightTheme` map (`--sidebar-wrapper-bg-color`,
  `--sidebar-wrapper-color`, `--nickname-color`, `--mobileApp-info-color`, `--msgs-separator-color`,
  `--msgs-separator-border-color`, `--msgs-separator-bg`), the **light value wins inside `app-room`**; the
  room `:root` value would only show on elements OUTSIDE `app-room` (e.g. a bare navbar not under app-room).
- **Two boot `:root` blocks, same specificity:** later source wins → blue-navy (block #2, `file-1.html` 616)
  beats Darkly (block #1, `file-1.html` 418). Verified: LIVE `:root` == block #2 for all 109 differing keys.
- No `@media (prefers-color-scheme)` drives these app tokens — theme is class-driven, not OS-driven. (The only
  prefers-color-scheme rule in boot is `scroll-behavior:smooth`, `file-1.html` 392.)
- No transitions/animations are defined on the token layer itself; a theme switch is instantaneous (token
  values change; individual consuming rules have no `transition` on the color properties, per extracted rules).

## Behavior

- The token system is not interactive on its own. The only user action that touches it is the **light/dark
  theme switch**, which toggles the `lightTheme`/`darkTheme` class on `app-room#topRoomDiv` (the bundle
  contains 16 `lightTheme` + 28 `darkTheme` string references in TS logic that perform this toggle — the
  class name is applied programmatically, not via a CSS `data-bs-toggle`).
- Everything else "using" a token is passive rendering (background/color/border) — no click targets, no
  tooltips originate from the token layer.

## Honest gaps

- **The theme-switch UI control is not decoded here.** The bundle references `lightTheme`/`darkTheme` toggling
  in JS, but which button/menu item flips it (and where it persists) is not part of this token surface —
  MEMORY notes a "theme storage v2 key" but no capture in the authoritative source list shows the toggle
  control or its persisted key, so I do not assert it.
- **No captured `.darkTheme` state.** Every capture (member/presenter/admin) is `lightTheme`. The dark-mode
  FINAL resolved values in table C-analog are computed by resolving the mapping against the LIVE
  `--darkTheme-*` sources (table B), NOT observed on-screen. They are correct by construction but not
  screenshot-verified.
- **`--roster-bg`, `--roster-bg-adm`, `--chat-bg` computed samples not captured.** Their resolution is proven
  via the mapping + LIVE source values, and the consumer rules exist in the bundle, but I did not locate a
  captured element whose computed background isolates these (roster/chat container computed bg not sampled in
  the member `elements[]` slice I read). Values (`#f1f1f1`, `#e1e1e1`, `#eee`) are resolution-derived, not
  computed-verified.
- **`--textarea-bg` has two meanings.** The base `:root --textarea-bg` = `var(--darker-black)` = `#111`
  (defined in `:root`), but the `.lightTheme` map REDEFINES `--textarea-bg` = `#fff` for the app-room subtree.
  Consumers inside app-room get `#fff` (verified via `#textAreaTxt` computed `rgb(255,255,255)`); a consumer
  outside app-room would get `#111`. No such outside-consumer was found, so the `#111` path is theoretical.
- **Bootstrap `--bs-*` and Darkly base tokens** are present in `:root` but I only spot-checked the app
  palette against captures; individual `--bs-*` consumer mapping (Bootstrap components) is out of scope for
  this surface and not enumerated.
