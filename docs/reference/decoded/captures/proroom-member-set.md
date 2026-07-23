# Pro-Room MEMBER capture set — forensic decode

**Evidence rule:** every value below cites a locator (file / JSON path / element index / selector / computed-style key). Nothing is inferred from memory. Where a region was not captured it is called out as an **HONEST GAP**, not invented. Rendered/computed values win over prose.

Three source files decoded:

| ID | File (absolute) | Bytes | `meta` identity |
|----|-----------------|-------|-----------------|
| **A** | `/Users/billyribeiro/Desktop/pro-room/docs/reference/captures/proroom-full-member.json` | 11,184,801 | `meta.role="member"` |
| **B** | `/Users/billyribeiro/Desktop/pro-room/proroom-ultra-member-room.json` | 8,531,039 | `meta.label="member-room"` |
| **C** | `/Users/billyribeiro/Desktop/pro-room/docs/reference/captures/proroom-ultra-member-room.json` | 4,988,785 | `meta.label="member-room"` |

**Element-count integrity (processed == total, verified by full iteration asserting `path/tag/rect/style` on every node):**
- A: processed **1178** == total 1178 ✓
- B: processed **2142** == total 2142 ✓
- C: total **1173** (list length)

---

## 1. Identity & metadata (all three) + relationships

All three point at the **same room**: `meta.url = https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1`, `meta.title = "Mastering The Trade"` (verbatim from each file's `meta`). All three: `meta.elementsCapped=false`, `meta.tooNarrow` varies, `meta.theme.htmlClass=""`, `meta.theme.bodyClass=""` (no theme class applied — theme comes from CSS-var defaults, see §3).

| Field (`meta.*`) | A | B | C |
|---|---|---|---|
| identity key | `role: "member"` | `label: "member-room"` | `label: "member-room"` |
| `viewport` | **1988×1157 @dpr2** | **1401×905 @dpr2** | **1017×1244 @dpr2** |
| `screen` | 1988×1157 | 1401×905 | **2560×1440** |
| `tooNarrow` | false | false | **true** |
| `theme.dataTheme` | *(key absent)* | `null` | `null` |
| `userAgent` | Android 15 / Pixel 9 / Chrome **149** Mobile | Android 15 / Pixel 9 / Chrome **150** Mobile | **macOS / Chrome 149 desktop** |

**Prior-decode correction (cite: `meta` blocks above):** the task brief's assumption "role member, lightTheme, viewport 1988×1157" holds **only for A**. B and C carry `label:"member-room"` (NOT `role`), and their viewports are 1401×905 and 1017×1244 respectively — not 1988×1157. There is **no `lightTheme` string in any `meta`**; the light appearance is the CSS-var default (§3), not a declared theme.

**Relationships (evidence):**
- **A** is the canonical member authority: only file with `meta.role` and the only file carrying a `states` block (`A.states`, 9 keys) and a `states`-derived presenter subtree. Chat history captured spans **6/8/26 11:41 AM → 6/14/26 1:42 PM** (`created-at` text nodes, first/last). 50 chat rows (`msg-box` count = 50).
- **B** is the **deepest** capture: 2142 elements, **100 chat rows** (`msg-box`=100, `username`=102, `created-at`=100) covering a **later/fresher** window — first `created-at`="7/17/26, 11:55 AM", last="04:13 PM" (B is newer data than A: file mtime Jul 22 21:08 vs Jul 22 12:39). B has **no `states` block** and no `role` key.
- **C** is the **narrow-viewport** capture: `tooNarrow=true`, viewport 1017px wide, desktop UA at 2560×1440 screen (a narrowed browser window). 50 chat rows like A but **NOT identical to A** (content signature differs; verified `md5(tag+text list) A ≠ C`). C is the smaller-file sibling of B (same `label`, same capture tool, different window width).
- **B vs C** are the same tool ("ultra" member-room dumps); B = wide (1401px, 100 rows), C = narrow (1017px, 50 rows, `tooNarrow`).

---

## 2. Complete top-level structure

A top-level keys: `meta, head, cssVariables, fonts, stylesheets, palette, elements, assets, inventory, states, errors`.
B & C top-level keys: same **minus `states`** — `meta, head, cssVariables, fonts, stylesheets, palette, elements, assets, inventory, errors`.

`errors` = `[]` (empty) in all three. `stylesheets` = list len **41** in all three.

Sub-shapes (identical schema across all three):
- `head`: `{stylesheetLinks, fontLinks, preloads, metas}` — `metas` is a **dict** `{"viewport":"width=device-width, initial-scale=1.0, target-densitydpi=device-dpi"}`; `preloads=[]`.
- `cssVariables`: `{root, body}`, **294 vars each** (§3).
- `fonts`: `{loaded, fontFaceRules, fontFileUrls}` (§ fonts below).
- `palette`: 18 categories, each a list of `{value, count}` (§ palette below).
- `elements`: flat list; per-node schema `{path, tag, rect{x,y,w,h}, attrs{}, icon, style{86 keys}, before, after}` (+ optional `text`, `class` on text-bearing nodes).
- `assets`: `{images[34], backgroundImages[8], inlineSvgs[0]}` (A).
- `inventory`: `{buttons, inputs, links, menus, modalsInDom, dataAttributes}`.
- `states` (A only): `{tab:Screens, tab:Streams, tab:Notes, tab:Files, dropdown:1, dropdown:2, dropdown:3, dropdown:7, dropdown:8}` (§5).

### head / fonts (from A; identical links in B, C — 41 stylesheets each)
- `head.stylesheetLinks[0..2]`: `https://use.fontawesome.com/releases/v5.8.1/css/all.css` · `https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.2/animate.min.css` · `https://chat.protradingroom.com/styles.0d26360b9b3e223c.css`
- **FontAwesome pinned v5.8.1** (`head.fontLinks[0]`) — matches memory authority.
- `fonts.loaded`: `Font Awesome 5 Free|400|loaded`, `Font Awesome 5 Free|900|loaded`, `Font Awesome 5 Brands|unloaded`, `Lato|400|unloaded`, `Lato|700|unloaded`, `Lato italic|unloaded`, `summernote|unloaded`.
- `fonts.fontFileUrls` (12): `fa-brands-400`, `fa-regular-400`, `fa-solid-900` (woff2/woff/ttf each) at `https://chat.protradingroom.com/webfonts/…`, plus `summernote.*` (woff2/woff/ttf).
- `fonts.fontFaceRules` (4): the three FA5 @font-face + one `summernote`.
- **App font of record:** CSS var `--app-font-family = 'Open Sans', sans-serif` and `palette.fontFamily` top value `"Open Sans", sans-serif` used **21,364** times. (Lato is declared in `--font-family-sans-serif` but reports `unloaded` — Open Sans is what actually renders.)
- `head.metas`: only `viewport` (single dict, not a list).
- `Version` string (element text, A[12]): **`Version: v4.0.1-c0fee8f5`**. Footer also: `Powered by:` / `ProTradingRoom.com` (A[10],[11]).

---

## 3. cssVariables — COMPLETE (294 vars), and DIFF flags

**Diff verdict (hard):**
- `root` vs `body` within A: **0 differing keys** (identical).
- A.root vs **B**.root: **0 differing keys**.
- A.root vs **C**.root: **0 differing keys**.
- **Every one of the 294 CSS variables is byte-identical across root/body and across all three member captures.** No member-vs-member variance exists. (Cross-check vs admin captures is out of scope of this file set; flagged as a compare-later item, not a diff found here.)

Full value table (from `A.cssVariables.root`, authoritative; sorted). Colors are as-authored (hex/rgb/rgba). **NAVY modal + navy sidebar confirmed** (`--modal-content-bg-color:#103d5c`, `--sidebar-wrapper-bg-color:#103d5c`), matching memory ("modals are NAVY #103d5c", not Darkly). Brand blue `#45a2ff` and link/active blue `#0a6db1` dominate.

```
--app-font-family              'Open Sans', sans-serif
--app-link-color               #45a2ff
--archives-dropdown-menu-bg-color   #0e3651
--archives-dropdown-menu-color      #45a2ff
--avatar-gear-icon-padding     3px 6px
--black                        #000
--blue                         #375a7f
--breakpoint-lg                992px
--breakpoint-md                768px
--breakpoint-sm                576px
--breakpoint-xl                1200px
--breakpoint-xs                0
--brown                        #555
--checkbox-bg-color            #45a2ff
--cyan                         #3498DB
--danger                       #E74C3C
--dark                         #adb5bd
--dark-black                   #222
--dark-brown                   #4b4b4b
--dark-gray                    #aaa
--darker-black                 #111
--darker-gray                  #aaa6a6
--dropdown-divider-bg          #45a2ff
--fire-yellow                  #f7fd37
--font-family-monospace        SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace
--font-family-sans-serif       "Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"
--gray                         #bbb
--gray-dark                    #303030
--green                        #00bc8c
--indigo                       #6610f2
--info                         #3498DB
--light                        #303030
--light-black                  #373c42
--light-blue                   #40e0d0
--light-brown                  #8c8686
--light-gray                   #ccc
--light-green                  #1edd6e
--lighter-black                #3e444a
--lighter-blue                 #edf2f6
--lighter-gray                 #eee
--orange                       #fd7e14
--pink                         #e83e8c
--primary                      #375a7f
--purple                       #6f42c1
--red                          #f00
--secondary                    #444
--success                      #00bc8c
--teal                         #20c997
--transparent-gray             rgba(255, 255, 255, 0.331)
--warning                      #F39C12
--white                        #fff
--yellow                       #ff0

# --- Chat / message surface ---
--msgs-header-bg               #0a6db1
--msgs-header-color            #fff
--msgs-separator-bg            #45a2ff
--msgs-separator-border-color  #45a2ff
--msgs-separator-color         #fff
--name-color                   #c0d8ed
--nickname-color               #0a6db1
--navbar-bg                    #0c2434
--navbar-color                 #fff

# --- lightTheme.* (active look; body has NO theme class so these defaults render) ---
--lightTheme-chat-bg           #eee
--lightTheme-date-color        #a8a8a8
--lightTheme-mobileApp-info-color   #676767
--lightTheme-msg-bg            #fff
--lightTheme-msg-border-color  #e1e1e1
--lightTheme-msg-color         #676767
--lightTheme-msgs-bg           #fff
--lightTheme-msgs-bg-adm       #f4f4f4
--lightTheme-msgs-separator-bg #e8e8e8
--lightTheme-msgs-separator-border-color  #373c42
--lightTheme-msgs-separator-color   #373c42
--lightTheme-nickname-color    #676767
--lightTheme-roster-bg         #f1f1f1
--lightTheme-roster-bg-adm     #e1e1e1
--lightTheme-sidebar-wrapper-bg-color   #fff
--lightTheme-sidebar-wrapper-color  #676767
--lightTheme-textarea-bg       #fff
--lightTheme-textarea-color    #676767
--lightTheme-user-location-color    #676767
--lightTheme-username-color    #0a6db1

# --- darkTheme.* (defined but not active) ---
--darkTheme-chat-bg            #000
--darkTheme-date-color         #a8a8a8
--darkTheme-mobileApp-info-color    #f4f4f4
--darkTheme-msg-bg             #000
--darkTheme-msg-border-color   #f4f4f4
--darkTheme-msg-color          #fff
--darkTheme-msgs-bg            #143c57
--darkTheme-msgs-bg-adm        #0f2e43
--darkTheme-msgs-separator-bg  #222
--darkTheme-msgs-separator-border-color   #373c42
--darkTheme-msgs-separator-color    #aaa
--darkTheme-nickname-color     #c0d8ed
--darkTheme-roster-bg          #111
--darkTheme-roster-bg-adm      #000
--darkTheme-sidebar-wrapper-bg-color    #000
--darkTheme-sidebar-wrapper-color   #f4f4f4
--darkTheme-textarea-bg        #0c2434
--darkTheme-textarea-color     #f4f4f4
--darkTheme-user-location-color     #f4f4f4
--darkTheme-username-color     #0a6db1

# --- Modal (NAVY) ---
--modal-active-tab-bg-color    #45a2ff
--modal-active-tab-border-color     #45a2ff
--modal-active-tab-color       #fff
--modal-alert-link-color       #0a6db1
--modal-btn-close-bg           #0a6db1
--modal-btn-close-border       #0a6db1
--modal-btn-danger-bg          #bb352a
--modal-btn-danger-border      #bb352a
--modal-btn-hover-opacity      0.9
--modal-btn-success-bg         #92d528
--modal-btn-success-border     #92d528
--modal-content-bg-color       #103d5c
--modal-content-border-color   #103d5c
--modal-content-color          #f4f4f4
--modal-input-group-bg         #0a6db1
--modal-tabs-border-color      #45a2ff
--modal-upload-files-color     #0a6db1

# --- Sidebar / tabs / navbar ---
--sidebar-menu-active-color    #45a2ff
--sidebar-menu-bg              #103d5c
--sidebar-menu-color           #fff
--sidebar-navItem-border-color #fff
--sidebar-wrapper-bg-color     #103d5c
--sidebar-wrapper-color        #fff
--session-control-dropdown-bg  #0e3651
--split-gutter-bg              #0a6db1
--split-gutter-color           #fff
--tab-active-bg                #45a2ff
--tabs-border-color            #0a6db1
--tabs-color                   #fff
--tabs-dropdown-bg             #0f2e43
--tabs-dropdown-color          #45a2ff

# --- Composer (textarea) ---
--textarea-bg                  #111
--textarea-holder-border-color #0a6db1
--textarea-holder-btns-color   #676767
--textarea-holder-btns-hover-color  #0a6db1

# --- Roster / users ---
--users-badge-bg-color         #0e3651
--users-badge-color            #f4f4f4
--users-border-color           #fff
--users-color                  #fff
--rosterImg-border-radius      50%
--name-color                   #c0d8ed

# --- Files / Notes ---
--file-delete-bg               #bb352a
--file-download-bg             #92d528
--file-list-even-bg            #f4f4f4
--file-list-odd-bg             #fff
--file-name-color              #0a6db1
--file-searchbar-bg            #fff
--file-searchbar-color         #b7b7b7
--file-searchbar-icon-color    #666666
--file-see-more-bg             #45a2ff
--file-size-color              #b2b2b2
--note-delete-bg               #bb352a
--note-download-bg             #92d528
--note-next-bg                 #45a2ff
--note-options-bg              #f4f4f4
--note-options-color           #fff
--note-options-hover-color     #212529
--note-tabs-color              #fff
--note-text-bg                 #fff
--note-text-color              #676767
--notes-tabs-bg                #0c2434

# --- Presenter / misc ---
--presenter-area-bg            #0f2e43
--presenter-noRecording-color  #fff
--presenter-recording-color    #45a2ff
--ptr-website-link-color       #45a2ff
--reload-icon-bg-color         #f4f4f4
--reload-icon-color            #45a2ff
--search-icon-bg-color         #45a2ff
--search-icon-color            #f4f4f4
--mobileApp-info-bg-color      transparent
--mobileApp-info-color         #f4f4f4
--avatar-gear-icon-padding     3px 6px
```

**Bootstrap 5 vars** are also present (all 200+ `--bs-*`, standard BS 5.3 light defaults: `--bs-body-bg:#fff`, `--bs-body-color:#212529`, `--bs-primary:#0d6efd`, `--bs-secondary:#6c757d`, `--bs-danger:#dc3545`, `--bs-success:#198754`, full `--bs-gray-100..900`, `--bs-border-radius:.375rem`, box-shadow tokens, breakpoints `xs0/sm576/md768/lg992/xl1200/xxl1400`). These are unmodified Bootstrap and identical across A/B/C; the app-brand vars above are what override the look.

---

## 4. Element inventory — member-view depth (all locators from **A** unless noted)

### 4.1 Composer — `#textAreaHolder` / `#textAreaTxt` (EXACT computed values)
Locators: A `elements[1086]` (holder) and `elements[1089]` (textarea). **Identical computed values across A, B, C** — only `width` and `rect.x/y` scale with viewport.

**`div#textAreaHolder`** — `class="d-flex align-items-center textSendDiv"` (B adds `ng-star-inserted`), `_ngcontent-ng-c3761163150`:
| prop | value |
|---|---|
| `display` | `flex` · `flex-direction: row` · `align-items: center` · `justify-content: normal` · `gap: normal` |
| `height` | **`45px`** (rect.h=45) |
| `padding` | `5px` all sides |
| `margin` | `5px` top **and** bottom (`margin-top:5px; margin-bottom:5px`), 0 left/right |
| `border` | width 0 all sides; `border-top-style:none`; `border-top-color: rgb(204,204,204)` (=#ccc) |
| `border-top-left-radius` | **`8px`** |
| `background-color` | `rgb(255,255,255)` (#fff) |
| **`color`** | **`rgb(204,204,204)` = #ccc** (the `--light-gray`/#ccc inheritance the brief calls out — set on the HOLDER) |
| `font` | `"Open Sans", sans-serif` · `16px` · weight **`300`** · line-height `24px` |
| `overflow-y` | `visible` · `position: static` |
| width by capture | A 569.047px · B 361.562px · C 279.945px (holder rect.w 569/362/280) |

**`textarea#textAreaTxt`** — `name="txt-area"`, `rows="1"`, `spellcheck="true"`, `class="txt-area form-control border-0"`, **`placeholder="Type your message here.."`** (exact, two trailing dots):
| prop | value |
|---|---|
| `display` | `block` · `position: static` |
| `height` | **`35px`** (rect.h=35); `min-height:35px`; **`max-height:300px`** (grows to 300 then scrolls) |
| `padding` | `6px` top/bottom, `5px` left/right |
| `margin` | 0 |
| `border` | width 0; style none; `border-top-color: rgb(103,103,103)` |
| `background-color` | `rgb(255,255,255)` |
| **`color`** | **`rgb(103,103,103)` = #676767** (`--textarea-color`; textarea text is #676767, DISTINCT from the holder's #ccc) |
| `font` | `"Open Sans", sans-serif` · **`14px`** · weight `400` · line-height `21px` |
| `overflow-y` | `auto` |
| width by capture | A 478.195px · B 327.562px · C 245.945px |

**Composer buttons** (`textAreaHolder > … > div.justify-content-center.d-flex.flex-row.align-items-center`, A[1090], rect x488 w81 h35). Three `span.textAreaBtns.ng-star-inserted`:
1. A[1091] `<i class="far fa-smile">` — **emoji** picker (regular-weight smile, 26×34 span, 16×16 icon).
2. A[1093] `<i class="fas fa-image">` — **image** upload (solid image).
3. A[1095] inner `<span>` text **`GIF`** (A[1096], 19×14) — **GIF** picker.
(No fa-paper-plane send button is captured; send is Enter-key on the textarea. **Member composer = emoji + image + GIF**, no admin-only controls.)

### 4.2 Chat rows — member view (kebab LEFT, NO flex-row-reverse) — 50 rows in A, **100 in B**, 50 in C
**HARD verdict on reverse:** `flex-row-reverse` class occurrences = **0** in A; computed `flex-direction:row-reverse` = **0**. Member rows are NOT reversed. (This is the key member-vs-admin distinction.)

**Kebab position — LEFT:** the menu is `a#dropdownMenuLink` `class="msgMenu dropright pt-1"` (A[100], first of 50). `rect.x = 0` (leftmost in the row); avatar sits at `rect.x=19–23` (A[101/102]) — i.e. **kebab is to the LEFT of the avatar**. Computed: `position:relative; left:0; right:0; float:none; order:0; display:block; cursor:pointer; color: rgb(10,109,177) = #0a6db1`. Rendered glyph text = **`⠇`** (U+2807, the 3-dot vertical kebab). 50 identical `msgMenu` in A, 100 in B.

**Row DOM skeleton** (A[96]→[112], repeats ~identically per row; one full + count):
```
div.msg-box.pb-1.ng-star-inserted                 [96]  (row wrapper; h≈185)
└ div (unnamed)                                    [97]
  └ div.mr-1.d-flex.flex-row                       [98]  (row is flex-row, NOT reverse)
    ├ div.d-flex.justify-content-center.align-items-start.flex-nowrap.mt-1   [99]  (left gutter, w58)
    │  ├ a#dropdownMenuLink.msgMenu.dropright.pt-1  [100]  KEBAB  x0  color #0a6db1  text "⠇"
    │  └ div.avatar.pl-1.ng-star-inserted           [101]  x19 w39
    │     └ img (gravatar 35×35)                     [102]  x23
    └ div.w-100                                      [103]  (message body, x58 w517)
      ├ div.d-flex.justify-content-between.align-items-center.w-100   [104]  (header bar, h24)
      │  ├ div.d-flex.align-items-center.justify-content-between.flex-nowrap   [105]
      │  │  └ strong.username.mx-1                    [106]  e.g. "Danielle"
      │  └ div.ng-star-inserted                       [107]  (right cluster)
      │     ├ button.btn.btn-sm.btn-secondary.me-1.alert-qa.ng-star-inserted   [108]  Q&A btn, x453
      │     │  └ i.fas.fa-question-circle              [109]  10×10
      │     └ span.created-at.mr-2                     [110]  timestamp, e.g. "6/8/26, 11:41 AM"
      └ div.d-flex                                     [111]
        └ div.msg-left.text-formated.preText.ml-2.mr-2.p-0.ng-star-inserted   [112]  message body text
```
- **`strong.username.mx-1`** — display name, e.g. `Danielle`, `Danielle Shay`, `HG`, `Bruce Marshall`, `Taylor Horton`, `heather`, `LornaBot` (A text nodes).
- **`span.created-at.mr-2`** — timestamp string like `6/8/26, 11:41 AM` (A[110]).
- **`button.btn.btn-sm.btn-secondary.me-1.alert-qa`** (A[108]) — the **Q&A-for-alert** button, `<i class="fas fa-question-circle">`; present on all 50 rows (`alert-qa`=50, `fa-question-circle`=50). `btn-secondary` computes bg `rgb(108,117,125)` (#6c757d).
- **`div.msg-left.text-formated.preText`** (A[112]) — message body; `msg-left`=50 (all left-aligned, confirming no reverse). `preText` preserves whitespace (trade legs render multi-line).
- **Trade-alert body** `span.tradeColor` (A[113], count 13 in A / 18 in B) — the colored order line, e.g. `BUY +2 VERTICAL MP 100 18 JUN 26 65/60 PUT @3.80 LMT`, `SELL -1 MP 100 17 JUL 26 70 CALL @2.17 LMT`.
- **Reactions** (later rows, A[299/301]): `span.me-1.ng-star-inserted` text like `(4)` (count) + `span.ng-star-inserted` text `✅` (emoji reaction).
- **Date separators** (`separator`, A count 6): `a` text like `Tuesday, June 9, 2026` (A[285]).
- **Uploaded images in chat**: `img.uploaded-img` inside `.img-container` (A: uploaded-img=9, img-container=8). Sample A[225]: `src=https://cdn1.protradingroom.com/uploads/images/652754202ad80…`, `width:300px height:193.422px object-fit:contain border-radius:0`.

### 4.3 Alert rows — NO "By: email" (member view)
**HARD verdict:** searched every `before`/`after`/`text` on all 1178 A elements for `"By:"` → **0 matches**. Member alert/message rows show `username` + `created-at` + Q&A button only; **no author-email `By:` attribution line** (an admin-only surface). Alert rows ARE the chat rows above (`alert-qa` on all 50) — the room is an alerts feed; member sees the alert, the Q&A button, but not the poster's email.

### 4.4 Roster — as member sees it — **HONEST GAP (off-canvas)**
The roster IS in the DOM but **collapsed off the left edge** in every member capture: `div.room-roster-list` (A[57]) has `rect.x = -248` (w246, i.e. fully off-screen left), and its subtree = **1 node only** (no user rows captured). Same in B: `room-roster-list` rect.x=-248, subtree node count = 1, roster `username`/`badge-success` text nodes = 0. The roster toolbar buttons are likewise off-canvas: `users-btns` (A[46], `fa-cog`, x-179), `reload-room-users` (A[49], `fa-sync`, x-63), `search-room-users` (A[53], `fa-search`, x-121). Tokens confirming the roster component exists: `room-roster-list`(1), `users ml-1 mr-1`(1), `badge badge-success mx-1 p-0`(1, A only), `nav-link active-room-users`(1), `fas fa-users`(1).
→ **GAP: individual roster rows (avatars, names, presence badges, per-user kebab/rank) are NOT captured in this member set** — the active sidebar tab is Alerts/Chat, not Users, so the roster panel is hidden at x:-248. Roster row structure must come from a capture with the Users tab active (or the enriched presence payload per memory `roster-presence-enrichment`).

### 4.5 Modals — member-visible (all `visible:false` in DOM)
`inventory.modalsInDom` = **120** entries in A (100 in B/C) = ~24 modal skeletons, **every one `visible:false`** (present but closed). Distinct modal titles a **member** has in DOM (from `modalsInDom[].title`):
`Offline` · `Debug Log` · `Post Alert` · `Session Control` · `Download our mobile apps` · `Q&A for Alert:` · `Muted Chat Users` · `Followed Chat Users` · `Manage Scheduled Alerts` · `:` · `` (empty-title skeletons).
Each modal = `modal fade` → `modal-dialog` (some `modal-lg`, e.g. Debug Log) → `modal-content` → `modal-header` / `modal-body` (some `py-0`) / `modal-footer text-center`. Modal computed colors come from the NAVY vars in §3 (`--modal-content-bg-color:#103d5c`, active tab `#45a2ff`, close btn `#0a6db1`, danger `#bb352a`, success `#92d528`). **GAP:** modal bodies are empty in the capture (closed state) — no per-modal field-level layout is captured; only the title + shell + the CSS-var palette that will style them.

### 4.6 Sidebar / settings menu (member) + navbar tabs
- Settings-menu item texts (member): `Chat` (A[17]), `Media` (A[19]), `Connectivity Check` (A[24]), `General Settings` (A[28]), `Archives` (A[32]), `Manage Muted Users` (A[36]), `Manage Followed Users` (A[40]), `Users:` (A[45]). Plus footer `Mobile App Info` button (A[14]).
- Navbar brand text `Alerts` (A[84], `navbar-brand ml-1`, x8 y53) — the alerts panel header.
- **Chat tabs** (`nav-tabs`, A[1075]/[1077]): **`Main Chat`** (active) and **`Off Topic`**. Active tab computed `background-color: rgb(69,162,255)` (#45a2ff), `color: rgb(255,255,255)`, `border-bottom-width:1px`. Inactive `Off Topic`: `background: rgba(0,0,0,0)` (transparent), `color:#fff`.
- Presenter state (all three): `a` text **`( No one is speaking )`** (A[69]) — no active presenter/speaker in any member capture.

### 4.7 inventory counts (buttons / inputs / links / menus / modalsInDom)
| | A | B | C |
|---|---|---|---|
| buttons | 200 | 248 | 198 |
| inputs | 74 | 74 | 74 |
| links | 34 | 39 | 33 |
| menus | 251 | 200 | 200 |
| modalsInDom | 120 | 100 | 100 |
| dataAttributes | 13 | — | — |

Per-surface class counts (member surfaces): `msg-box` A50/B100/C50 · `msgMenu` 50/100/50 · `alert-qa` 50/50/50 · `username` 50/102/50 · `created-at` 50/100/50 · `tradeColor` 13/18/13 · `uploaded-img` 9/8/9 · `nav-tabs` 3/3/3 · `textAreaBtns` 4/2/2 · `badge-success` 1/0/1.

---

## 5. States fully decoded (A ONLY — B and C have no `states` block)
`A.states` keys: `tab:Screens, tab:Streams, tab:Notes, tab:Files, dropdown:1, dropdown:2, dropdown:3, dropdown:7, dropdown:8`.

- **`tab:Screens` / `tab:Streams` / `tab:Notes` / `tab:Files`** → each `{groups:[], note:"tab not found"}`. **HARD:** these four presenter tabs were **not present** for the member — the capture tool clicked them and found nothing. → **Member has no Screens/Streams/Notes/Files presenter tabs.** (Honest gap for those surfaces on the member side; they belong to presenter/admin.)
- **`dropdown:1,2,3,7,8`** → each `{groups:[{selector:"app-presentationarea", rootPath:"as-split#mainAreaSplit > as-split-area.presentation-box… > app-presentationarea", count:**468**, nodes:[…full 468-node subtree with rects+computed styles…]}]}`. The presentation area root `app-presentationarea` sits at `rect{x:590, y:49, w:1398, h:1108}` with `icon:"fas fa-desktop"`, `display:inline`. All five dropdown states captured the **same** 468-node presentationarea subtree (the dropdowns overlay the presentation split-pane). This is the member's view of the (empty, "no one speaking") presenter/screen-share pane. (`dropdown:4,5,6` absent → those trigger indices found no menu.)

---

## 6. Text content — exact labels / placeholders (verbatim)
- Composer placeholder: **`Type your message here..`** (`#textAreaTxt[placeholder]`, two dots).
- Chat tabs: **`Main Chat`**, **`Off Topic`**.
- Settings menu: `Chat`, `Media`, `Connectivity Check`, `General Settings`, `Archives`, `Manage Muted Users`, `Manage Followed Users`, `Users:`, `Mobile App Info`.
- Panel header: `Alerts`. Presenter: `( No one is speaking )`.
- Footer: `Powered by:` · `ProTradingRoom.com` · `Version: v4.0.1-c0fee8f5`.
- Kebab glyph: `⠇`. Q&A button glyph: `fa-question-circle` (). Reaction: `✅` with `(n)` count.
- Modal titles (§4.5): `Offline`, `Debug Log`, `Post Alert`, `Session Control`, `Download our mobile apps`, `Q&A for Alert:`, `Muted Chat Users`, `Followed Chat Users`, `Manage Scheduled Alerts`.
- Sample real message/trade text (honest data, from A `msg-left`/`tradeColor`): `BUY +2 VERTICAL MP 100 18 JUN 26 65/60 PUT @3.80 LMT` · `SELL -1 MP 100 17 JUL 26 70 CALL @2.17 LMT` · `BUY +2 POET 100 17 JUL 26 12 CALL @2.47 LMT` · `SELL -1 VERTICAL AAOI 100 18 JUN 26 175/225 CALL @20.85 LMT`.

**Palette frequency crosscheck (`A.palette`):** dominant text color `rgb(33,37,41)`=#212529 (19,207 uses) → BS body color; then `rgb(204,204,204)`=#ccc (745), `rgb(244,244,244)`=#f4f4f4 (406), `rgb(69,162,255)`=#45a2ff (400), `rgb(103,103,103)`=#676767 (266), `rgb(10,109,177)`=#0a6db1 (79). Dominant bg `rgb(255,255,255)` (2206), then `#6c757d`(66), `#0e3651`(51), `#45a2ff`(29), `#103d5c`(23). Dominant font-size `16px` (20,990); font `"Open Sans", sans-serif` (21,364); weight `300` (13,581) then `700` (6,467). Avatars are **gravatar** `https://secure.gravatar.com/avatar/…?d=mm&s=50` (assets.images), matching memory `roster-presence-enrichment`.

---

## 7. What this set UNIQUELY evidences + honest gaps

**Uniquely evidenced (member-side authority):**
1. **Member composer** is exactly emoji + image + GIF (`far fa-smile` / `fas fa-image` / text `GIF`), placeholder `Type your message here..`, holder 45px / textarea 35px→300px, holder color #ccc / textarea color #676767, 8px top-left radius, Open Sans 16px/300 holder + 14px/400 textarea. (§4.1)
2. **Kebab is LEFT of avatar** (`a#dropdownMenuLink.msgMenu.dropright` at x0, avatar x19), and rows are **flex-row NOT flex-row-reverse** (0 reverse anywhere). (§4.2)
3. **Member alert rows carry NO `By:` email** (0 matches across the whole dump). (§4.3)
4. **Member modal set**: Post Alert, Session Control, Q&A for Alert, Muted/Followed Chat Users, Manage Scheduled Alerts, Debug Log, Offline, Download mobile apps — all NAVY (#103d5c). (§4.5)
5. **Member lacks presenter Screens/Streams/Notes/Files tabs** ("tab not found" in A.states). (§5)
6. **294 CSS vars are byte-identical across all three member captures** — a stable palette baseline. (§3)
7. Chat tabs `Main Chat`/`Off Topic`; active-tab bg #45a2ff/white. (§4.6)

**HONEST GAPS (not captured — do not invent):**
- **Roster rows**: roster panel is off-canvas at x:-248 (1 node, 0 user rows) in ALL three — no avatars/names/presence-badges/per-user menus/ranks captured. Needs a Users-tab-active capture or the presence payload.
- **Modal body internals**: all 24 modals are `visible:false` (closed); only shell + title + CSS-var palette captured, not field layout inside Post Alert / Session Control / Q&A / Manage Scheduled Alerts.
- **Presenter/screen-share content**: `( No one is speaking )` in all three — the live presentation surface is empty; `states.dropdown:*` captured the empty 468-node `app-presentationarea` shell only.
- **Chat history windows differ** and none is "complete": A=6/8–6/14 (50 rows), B=~7/17 (100 rows), C=narrow 50 rows. No single capture is the full scrollback.
- **Cross-role diff**: this set is member-only; any "differs from admin" claim (e.g. kebab side, By: line) is asserted here only against the member evidence — the admin comparison lives in the admin capture, not these files.
- `inlineSvgs=0` (no inline SVG captured); B/C omit `states` and `dataAttributes` entirely.
