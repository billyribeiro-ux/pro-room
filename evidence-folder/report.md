# protradingroom — Admin Room Reference Spec

**Source:** `evidence-folder/proroom-ultra-admin-room.json` (15 MB capture, viewport **1989×1166** dpr 2, label `admin-room`, "Mastering The Trade"). Reconstructed exhaustively by 11 parallel agents, one per surface, from 2,639 elements + 5 subtrees + 50 targeted (matchedRules) + 230 controls + full `cssVariables`/palette/fonts. **Third-party visual reference only** — match structure/layout/CSS/behavior, never copy content.

## ⚠️ Read first — capture caveats
- **This is a VIEWER session, not presenter.** The top-nav right cluster has only 4 items (talking indicator, rec indicator, volume, reload). The **presenter broadcast controls** (screen-share / camera / mic / CC / music / record / go-live / members / gear) are **NOT in this DOM** — they still require a **presenter-session re-capture** (see §02).
- **Chat scroll was empty** (`elements-chat.json = []`); chat-panel chrome is documented from the `alert-chat-box` slice and may be partly inferred (see §06).
- **Reconcile before changing code:** a few details differ *between sections* and from earlier evidence — notably the message-row **kebab/`⠇`** (§06 reports none on alerts; §08 found 124 `#dropdownMenuLink` kebabs) and **chat own-message alignment** (§06 infers own=right/`flex-row-reverse`, which conflicts with the all-left rule we verified across 250+ rendered rows + your directive). Treat §06's chat claims as inferred (empty chat) and verify against the Bruce Marshall screenshot + a presenter capture before reverting any shipped fix.

## Table of contents
1. [Room Shell & Layout](#01)  ·  2. [Top Nav](#02)  ·  3. [Sidebar / Roster](#03)  ·  4. [Presentation Stage](#04)  ·  5. [Webcams](#05)
6. [Alerts & Chat Dock](#06)  ·  7. [Modals & Overlays](#07)  ·  8. [Controls Inventory (230)](#08)  ·  9. [Exact Matched CSS (50)](#09)  ·  10. [Theme Tokens (294)](#10)  ·  11. [Catch-all](#11)

---


<a id="01"></a>

## 01 — Room Shell & Layout

> Reference-spec section reconstructed from `subtree-roomShell.json` (rootPath `app-room#topRoomDiv`, 600 DOM nodes, 419 captured), cross-referenced with `subtree-presentation.json`, `targeted.json`, `elements-other.json`, and `theme.json`. Viewport **1989 × 1166**. Third-party visual reference only — structure/layout/CSS documented for 1:1 reconstruction; their text/data is never copied as ours.

This section maps the **whole geometry of the admin room shell**: the `app-room` host, the fixed top navbar and the clearance it forces, the off-canvas sidebar, and — the core of the layout — the `as-split#mainAreaSplit` horizontal split that divides the screen into the **alert-chat-box (LEFT)** and **presentation-box (RIGHT)** columns, plus the **inner vertical split** that stacks **alerts (top) / chat (bottom)** inside the left column, and the **`angular-split` gutters** between them.

The room uses the [`angular-split`](https://www.npmjs.com/package/angular-split) library (`as-split` / `as-split-area` / `as-split-gutter` custom elements, Angular host attr `_nghost-ng-c3013344202`). All split sizing is **percentage mode** (`as-percent`) with draggable gutters.

---

### 1. STRUCTURE — DOM / Angular component tree

Root component is `<app-room id="topRoomDiv" class="lightTheme">` (Angular host `_nghost-ng-c977335924`). Although the room is dark, the host carries the `lightTheme` class — theming is applied lower in the tree, not on the host.

```
app-room#topRoomDiv .lightTheme                         (host; component tree root)
└── div.wrapper                                          (relative, full 1989×1117, bg #111)
    └── div.d-flex.flex-column-reverse.flex-sm-row.room-container   (flex row, the shell flexbox)
        ├── div.room-sidebar
        │   └── div.sidebar-wrapper                      (off-canvas, absolute, x=-250 → hidden)
        │       └── nav.navbar.w-100.h-100
        │           └── ul.navbar-nav.small.w-100.h-100  (sidebar nav items + app-room-roster)
        │               └── … li.nav-item × N → app-room-roster (user roster)
        ├── nav.navbar.navbar-expand-md.navbar-dark.fixed-top.mainAppNav   (TOP NAVBAR, fixed, z 1030)
        │   ├── span.sidebar-menu  (fa-bars hamburger)
        │   ├── span.users         (fa-user count) + span.fa-mobile
        │   ├── a.navbar-brand     (img.brand-logo)
        │   └── div.collapse.navbar-collapse → ul.navbar-nav (talking/rec indicators, volume, sync)
        └── as-split#mainAreaSplit .as-horizontal.as-percent.as-init       (MAIN HORIZONTAL SPLIT)
            ├── as-split-area.alert-chat-box.alert-chat-regular  :nth-child(1)   (LEFT column)
            │   └── as-split.as-percent.as-vertical.as-init                       (INNER VERTICAL SPLIT)
            │       ├── as-split-area.alert-box  :nth-child(1)                    (TOP — alerts)
            │       │   └── app-alerts
            │       │       └── div.chat.d-flex.flex-column
            │       │           ├── div.bs-component
            │       │           │   └── nav.navbar…chat-nav.p-1.alertHeader       (alert header bar)
            │       │           └── app-roomscroller#chatScrollViewParentAlerts   (scroll list)
            │       │               └── div → app-st-message × N                  (alert messages)
            │       ├── div.as-split-gutter  (role=separator, VERTICAL)           (alert↔chat drag handle)*
            │       └── as-split-area.chat-box  :nth-child(2)                     (BOTTOM — chat)*
            │           └── app-chat*                                             (chat input + log)
            ├── div.as-split-gutter  (role=separator, HORIZONTAL)                 (left↔right drag handle)
            │   └── div.as-split-gutter-icon
            └── as-split-area.presentation-box  :nth-child(2)                     (RIGHT column)
                └── app-presentationarea
                    └── div.mainPresentationAreaHolder
                        └── ul#mainTabs.nav.nav-tabs.mainTabset + tab panes
```

`*` Items marked with an asterisk (vertical gutter, `chat-box`, `app-chat`) were **not present** in any captured slice — at capture time the chat panel was empty/collapsed (`elements-chat.json` is `[]`). Their geometry is **inferred** from the alert-box flex-basis and left-column dimensions (see §2.4). All other nodes are directly evidenced.

**Angular host/content attribute fingerprints** (useful for identifying which component owns a node):

| Attribute | Owner |
|---|---|
| `_nghost-ng-c977335924` / `_ngcontent-ng-c977335924` | `app-room` shell |
| `_nghost-ng-c3013344202` / `_ngcontent-ng-c3013344202` | `as-split` (angular-split) |
| `_nghost-ng-c1922465750` / `_ngcontent-ng-c1922465750` | `app-alerts` |
| `_nghost-ng-c1936721513` | `app-roomscroller` |
| `_ngcontent-ng-c654575438` | presentation-area / webcam wrapper |
| `_ngcontent-ng-c4243810522` | outer app host attr on `app-room` |

---

### 2. LAYOUT — geometry, computed CSS, tokens

#### 2.0 Coordinate model & page stack

Page is **1989 wide × 1166 tall**. Vertical stack:

| Band | y-range | height | What |
|---|---|---|---|
| Fixed top navbar | 0 → 49 | **49px** | `nav.fixed-top.mainAppNav` (position:fixed, z 1030) |
| Main content area | 49 → 1166 | **1117px** | `as-split#mainAreaSplit` + everything below |

The navbar is `position: fixed; top:0` and does **not** participate in flow, so the main area gets its 49px top clearance from the `.wrapper` / `.room-container` being laid out **after** the fixed navbar in the flex row while the navbar floats above. Net effect: `as-split#mainAreaSplit` rect starts at **y=49** and is **1117px** tall.

> Note: `app-room#topRoomDiv` itself reports `display:inline` with a rect of `[x=0, y=1151, w=1989, h=19]` — that 19px sliver is the inline host box's own line box (it contains a trailing inline node), **not** the room bounds. The real room bounds live on its child `div.wrapper` (`[0,49,1989,1117]`).

#### 2.1 Shell containers — computed CSS

| Element | rect (x,y,w,h) | display | position | size CSS | bg | color | overflow | notes |
|---|---|---|---|---|---|---|---|---|
| `app-room#topRoomDiv.lightTheme` | 0,1151,1989,19 | `inline` | static | width/height auto | transparent | `rgb(33,37,41)` | visible | host; `transition: all` |
| `div.wrapper` | 0,49,1989,1117 | `inline-block` | **relative** | 1989×1117 | **`rgb(17,17,17)` (#111)** | `rgb(204,204,204)` | visible | `top/left/right/bottom: 0` |
| `div.d-flex.flex-column-reverse.flex-sm-row.room-container` | 0,49,1989,1117 | **flex** | static | 1989×1117 | transparent | `rgb(204,204,204)` | visible | `flex-direction: row` (≥sm); column-reverse on xs |
| `nav.…fixed-top.mainAppNav` | 0,0,1989,49 | flex | **fixed** | 1989×49 | **`rgb(12,36,52)` (#0c2434)** | `#fff` | visible | `top:0; left:0; right:0; z-index:1030`, `flex-direction:row` |
| `div.sidebar-wrapper` | **-250**,49,250,1117 | block | **absolute** | 250×1117 | **`#fff`** | `rgb(103,103,103)` (#676767) | visible | `top:0;left:0`; **x=-250 ⇒ off-canvas / hidden** by default; `z-index:3` |
| `as-split#mainAreaSplit` | 0,49,1989,1117 | **flex** | static | 1989×1117 | transparent | `rgb(204,204,204)` | **hidden/hidden** | `flex-direction:row`; `dir=ltr`; `min-width/height:auto` |

`.room-container` is the shell flexbox. On `flex-sm-row` (≥576px, true at 1989px) it lays out **row**: sidebar (absolute, removed from flow) + fixed navbar (removed from flow) + `as-split#mainAreaSplit` which fills the row. On `<sm` it would stack `column-reverse`. The sidebar's negative `x=-250` confirms the drawer is **closed** in the captured state (toggled by the `fa-bars` hamburger in the navbar).

#### 2.2 The horizontal split (`as-split#mainAreaSplit`) — LEFT vs RIGHT

`as-split` host attrs: `minsize="0"`, `gutterdblclickduration="400"`, `dir="ltr"`, classes `as-horizontal as-percent as-init`. It is `display:flex; flex-direction:row; overflow:hidden`. Three flex children, all sized by `flex-basis` percentages with `flex-grow:0; flex-shrink:0` (areas) / fixed basis (gutter):

| Child (order) | Element | rect | flex-basis | resolved width | % of 1989 |
|---|---|---|---|---|---|
| 1 | `as-split-area.alert-chat-box.alert-chat-regular` (`:nth-child(1)`) | **0,49,420,1117** | `calc(21.2364% - 2.336px)` | **420.055px** | **21.24%** |
| (gutter) | `div.as-split-gutter` (HORIZONTAL) | **420,49,11,1117** | `11px` (`order:1`) | **11px** | — |
| 2 | `as-split-area.presentation-box` (`:nth-child(2)`) | **431,49,1558,1117** | `calc(78.7636% - 8.664px)` | **1558px** | **78.76%** |

**Split ratio (horizontal): 21.24% / 78.76%** (left / right), gutter **11px**. Math: 420.055 + 11 + 1558 ≈ 1989.06 ✓. The `- 2.336px` / `- 8.664px` deductions in each `calc()` are angular-split distributing the single 11px gutter's width proportionally across the two areas (2.336 + 8.664 = 11).

Shared area rule (from `targeted.json` matchedRules, applies to every `> .as-split-area`):

```css
[_nghost-ng-c3013344202] > .as-split-area { flex-grow: 0; flex-shrink: 0; overflow: hidden auto; }
.as-horizontal[_nghost-ng-c3013344202] > .as-split-area { height: 100%; }
```

**LEFT column** `as-split-area.alert-chat-box.alert-chat-regular`:
- `display:block; flex-grow:0; flex-shrink:0; flex-basis:calc(21.2364% - 2.336px)`, `overflow-x:hidden; overflow-y:auto`, `height:1117px (100%)`, bg transparent, color `rgb(204,204,204)`. The `alert-chat-regular` class is the layout variant (vs. an alerts-only or chat-only mode).

**RIGHT column** `as-split-area.presentation-box` (matchedRules from `targeted.json`):
```css
.presentation-box { position: relative; background-color: var(--presenter-area-bg); overflow: hidden !important; }
```
- `--presenter-area-bg = #0f2e43` (dark navy). rect `431,49,1558,1117`. Contains `app-presentationarea > div.mainPresentationAreaHolder` (full 1558×1117) and `ul#mainTabs.nav.nav-tabs.mainTabset` (the tab strip, `431,49,1558,41`). Detailed in section 02 (presentation).

#### 2.3 The horizontal gutter (left ↔ right)

`div.as-split-gutter` (from `elements-other.json`):

| Prop | Value |
|---|---|
| rect | **420, 49, 11, 1117** |
| `width` / `height` | `11px` / `1117px` |
| `flex-basis` / `order` | `11px` / `1` |
| `display` | `flex` |
| `cursor` | **`col-resize`** |
| `background-color` | **`rgb(10,109,177)` (#0a6db1)** — the brand blue |
| `role` | `separator` |
| `aria-orientation` | `horizontal` |
| `aria-valuemin` | `0` |
| `aria-valuenow` | `21.23640617096612` |
| `aria-valuetext` | `"21 percent"` |
| `tabindex` | `0` (keyboard-focusable) |

It contains `div.as-split-gutter-icon` (`11×1117`, `order:0`, `display:block`, transparent bg, `cursor:col-resize`) — the visual grip glyph layer.

#### 2.4 The inner vertical split (alerts top / chat bottom)

Inside the LEFT column, `as-split.as-percent.as-vertical.as-init` (host attrs `minsize="0"`, `dir="ltr"`):

| Prop | Value |
|---|---|
| rect | **0,49,420,1117** (420.055 × 1117) |
| `display` | `flex` |
| `flex-direction` | **`column`** |
| `overflow` | hidden / hidden |

Children:

| Child | Element | rect | flex-basis | resolved h | % of 1117 |
|---|---|---|---|---|---|
| 1 (top) | `as-split-area.alert-box` (`:nth-child(1)`) | **0,49,420,900** | `calc(81.4024% - 8.95426px)` | **900.305px** | **81.40%** |
| (gutter)* | `div.as-split-gutter` (VERTICAL, `aria-orientation:vertical`, `cursor:row-resize`) | ~0,949,420,~11 | `11px` | ~11px | — |
| 2 (bottom)* | `as-split-area.chat-box` (`:nth-child(2)`) | ~0,960,420,~206 | `calc(~18.6% - …)` | **~206px** | **~18.6%** |

**Split ratio (vertical, inside left): ~81.4% alerts / ~18.6% chat.** Alert-box resolves to **900.305px** tall. Remainder (1117 − 900.305 − ~11 gutter ≈ **~206px**) is the chat panel. The vertical gutter + `chat-box` + `app-chat` were not in any captured slice (chat empty at capture) — their rects above are inferred from the alert-box basis; the vertical gutter mirrors the horizontal one but with `aria-orientation:vertical` and `cursor:row-resize`.

`as-split-area.alert-box` computed: `display:block; flex-grow:0; flex-shrink:0; flex-basis:calc(81.4024% - 8.95426px)`, `overflow-x:hidden; overflow-y:auto`, `height:900.305px`, bg transparent.

#### 2.5 Alert column interior (top area contents)

The alert-box top area contains the alerts feed. Container chain and computed CSS:

| Element | rect | display | position | bg | color | overflow-y | notes |
|---|---|---|---|---|---|---|---|
| `app-alerts` | 0,49,420,900 | inline (host) | static | transparent | `rgb(204,204,204)` | visible | host |
| `div.chat.d-flex.flex-column` | 0,49,420,900 | **flex** | static | transparent | `rgb(204,204,204)` | visible | `flex-direction:column` — header above scroller |
| `div.bs-component` | 0,49,420,48 | block | static | transparent | — | visible | header wrapper, **48px** tall |
| `nav.navbar…chat-nav.p-1.alertHeader` | 0,49,420,**48** | **flex** | **relative** | **`rgb(10,109,177)` (#0a6db1)** | **#fff** | visible | the blue alert header bar; `flex-direction:row`; padding `.p-1` |
| `app-roomscroller#chatScrollViewParentAlerts` | 0,**97**,420,**852** | block | static | **`#fff` (white)** | `rgb(204,204,204)` | **`scroll`** | the scrolling alert list; `overflow-x:auto` |

The alert header bar (`alertHeader`) is **blue #0a6db1** (matches the gutter blue) with white text, **48px** tall, sitting at the top of the left column (y=49→97). Below it the **white** scroll list `app-roomscroller` (y=97→949, h=852) holds `app-st-message` rows. Message rows in the captured DOM have **negative y** (e.g. `y=-9683`) — they are scrolled above the viewport (the list is scrolled to bottom; total inner height ≈ 10633px). The header bar typography: `"Open Sans", sans-serif`, 16px, weight 300, line-height 24px (the room body defaults). Header internals (brand `fa-bell`, `fa-search`, `fa-cog` dropdown) are documented in the alerts section.

#### 2.6 Design tokens applied to the shell

From `theme.json` `cssVariables.root`:

| Token | Value | Used by |
|---|---|---|
| `--presenter-area-bg` | `#0f2e43` | RIGHT presentation-box background |
| `--primary` | `#375a7f` | theme primary (bootstrap-darkly base) |
| `--bs-primary` | `#0d6efd` | bootstrap primary |
| `--darker-black` | `#111` | `.wrapper` background `rgb(17,17,17)` |
| `--dark-black` | `#222` | dark surfaces |
| `--sidebar-menu-color` | `#fff` | navbar hamburger / sidebar text |
| `--lightTheme-sidebar-wrapper-bg-color` | `#fff` | sidebar-wrapper bg |
| `--lightTheme-sidebar-wrapper-color` | `#676767` | sidebar text color `rgb(103,103,103)` |
| `--tab-active-bg`, `--sidebar-menu-active-color`, `--presenter-recording-color`, `--checkbox-bg-color`, `--search-icon-bg-color` | `#45a2ff` | accent blue (active tab, rec indicator, etc.) |
| `--modal-content-bg-color` | `#103d5c` | navy surfaces |
| `--notes-tabs-bg` | `#0c2434` | matches top navbar `rgb(12,36,52)` |

Hard-coded shell colors not tokenized: top navbar `#0c2434` (= `--notes-tabs-bg`), gutter + alert-header blue `#0a6db1` (`rgb(10,109,177)`), white scroll-list bg `#fff`.

**Typography (room default, inherited through the shell):**

| Prop | Value |
|---|---|
| font-family | **`"Open Sans", sans-serif`** (dominant; 23 265 uses) — note `--bs-body-font-family` token is the system-ui stack, but the room actually renders Open Sans |
| font-size | **16px** (body default) |
| font-weight | **300** (light; dominant) — 700 for bold/usernames |
| line-height | **24px** |
| color | `rgb(204,204,204)` (#ccc) on dark surfaces; `rgb(33,37,41)` (#212529) is the bootstrap body default |
| icon font | **Font Awesome 5 Free** (weight 900 solid `fas`, 400 regular), + FA5 Brands |

`box-sizing: border-box` is applied to `*, ::before, ::after` globally; a global reset also forces `text-shadow:none !important; box-shadow:none !important` (hence every shell element reports `box-shadow:none`).

---

### 3. BEHAVIOR — interactive elements of the shell

| Element | Interaction | Attrs / handlers | Icon | Notes |
|---|---|---|---|---|
| `div.as-split-gutter` (horizontal) | **Drag to resize** left↔right; **double-click** snaps (`gutterdblclickduration=400`) | `role=separator`, `aria-orientation=horizontal`, `aria-valuenow=21.236`, `aria-valuemin=0`, `aria-valuetext="21 percent"`, `tabindex=0` (arrow-key resize) | grip icon via `.as-split-gutter-icon` | `cursor:col-resize`; bg `#0a6db1` |
| `div.as-split-gutter` (vertical)* | Drag to resize alerts↔chat | `role=separator`, `aria-orientation=vertical`, `tabindex=0` | grip icon | `cursor:row-resize` (inferred — not captured) |
| `span.sidebar-menu` (navbar) | **Toggle off-canvas sidebar** | click handler (Angular) — toggles `.sidebar-wrapper` between `x=-250` (closed) and `x=0` (open) | `i.fas.fa-bars` | hamburger; rect `5,9,28,31` |
| `a.navbar-brand` (navbar) | Brand / home link | href | `img.brand-logo` (200×18) | rect `88,5,200,40` |
| `li.talkingIndicator a.talking` | Live talking indicator (animated `fadeIn`) | `ng-star-inserted` | `i.icon.fa.fa-microphone` + `img.talkingWaveform` | rect `1739,4,81,41` |
| `li.recIndicator a` | Recording indicator (animated) | `ng-star-inserted` | — | rect `1819,4,62,41` |
| navbar volume control | `a.nav-link` dropdown (`dropstart`) | `li.nav-item.dropdown.dropstart` | `i.fas.fa-2x.fa-volume-up` | rect `1881,1,50,48` |
| navbar sync | refresh/sync action | `a.nav-link` | `i.fas.fa-2x.fa-sync` | rect `1931,1,58,48` |
| `app-roomscroller#chatScrollViewParentAlerts` | **Scrollable** alert feed | `overflow-y:scroll` | — | scroll container, white bg, y=97→949 |

**Sidebar nav** (off-canvas, x=-250) interactive items observed: `fa-network-wired`, `fa-cogs`, `fa-archive` (dropdown), `fa-comments`, `fa-users`, plus a roster header row with action buttons (`fa fa-search`, `fa-sort-alpha-down`, `fa fa-sync` reload, `fa fa-cog`), `ptr-website-link` anchor, and an `app-room-roster` user list (`div.room-roster-list`, rect `-248,452,246,708`). These belong to the sidebar section; listed here only to confirm shell-level wiring.

The top navbar (`fixed-top.mainAppNav`, `navbar-expand-md navbar-dark`) collapses below `md`; at 1989px the `div.collapse.navbar-collapse` (rect `288,1,1701,48`) is expanded, right-aligning its `ul.navbar-nav.ml-auto` (rect `1739,1,250,48`).

---

### 4. SUBSECTIONS — rebuild checklist

1. **Page frame** — `app-room` host carrying `lightTheme` class (theming applied below, not here) → `div.wrapper` (relative, bg `#111`, 1989×1117 at y=49) → `div.room-container` (`d-flex flex-column-reverse flex-sm-row`).
2. **Fixed top navbar** — `nav.fixed-top.mainAppNav`, 49px tall, bg `#0c2434`, white text, z 1030, removed from flow; forces the 49px top clearance on the main area. (Full content → topnav section.)
3. **Off-canvas sidebar** — `div.sidebar-wrapper`, absolute, 250px, bg `#fff`, color `#676767`, z 3, parked at `x=-250` (closed); slides to `x=0` on hamburger toggle. (Full content → sidebar section.)
4. **Main horizontal split** — `as-split#mainAreaSplit` (`as-horizontal as-percent`), flex row, 1989×1117 at y=49, overflow hidden. Ratio **21.24% / 78.76%** with an **11px** `col-resize` gutter (bg `#0a6db1`, `role=separator`, `aria-valuetext="21 percent"`).
5. **LEFT column** — `as-split-area.alert-chat-box.alert-chat-regular`, 420.055px wide, full height, `overflow-y:auto`.
   - **Inner vertical split** — `as-split.as-vertical.as-percent`, flex column, ratio **~81.4% alerts / ~18.6% chat**, vertical `row-resize` gutter (~11px).
   - **Alerts (top)** — `as-split-area.alert-box` (900.305px tall) → `app-alerts` → `div.chat.d-flex.flex-column`: blue **`alertHeader`** bar (`#0a6db1`, white, 48px) above the **white** scrolling `app-roomscroller#chatScrollViewParentAlerts` (852px, `overflow-y:scroll`) of `app-st-message` rows. (Full content → alerts section.)
   - **Chat (bottom)** — `as-split-area.chat-box` → `app-chat` (~206px tall; empty at capture; not directly evidenced).
6. **RIGHT column** — `as-split-area.presentation-box`, x=431, 1558px wide, full height, `position:relative; background:var(--presenter-area-bg) #0f2e43; overflow:hidden !important` → `app-presentationarea` → `div.mainPresentationAreaHolder` + `ul#mainTabs.nav-tabs.mainTabset` (41px tab strip). (Full content → presentation section.)

**Exact reconstruction constants:** viewport `1989×1166`; navbar `49px`; main area `y=49,h=1117`; horizontal gutter `11px` @ `x=420`; left col `420.055px` (`calc(21.2364% - 2.336px)`); right col `1558px` (`calc(78.7636% - 8.664px)`); alert-box `900.305px` (`calc(81.4024% - 8.95426px)`); chat region `~206px`. Shell bg `#111`; navbar `#0c2434`; gutter/alert-header `#0a6db1`; presentation bg `#0f2e43`; scroll-list bg `#fff`. Font `"Open Sans", sans-serif` 16px/300/24px, color `#ccc` on dark.

---


<a id="02"></a>

## 02 — Top Nav Bar (`#navbarsRoom` / `.mainAppNav`)

> Reference reconstruction from captured DOM+CSS slice `subtree-topnav.json` (24 nodes, reported subtree `count: 68`). Cross-referenced against `targeted.json`, `controls.json`, `subtree-roomShell.json`, and `theme.json`. Viewport **1989 × 1166**. Third-party visual reference only — structure/layout/CSS/behavior documented; no third-party text/data is to be reused as ours.

### 0. Capture-variant caveat (read first)

The captured session is a **viewer / member** session, **not** a presenter/broadcaster session. The navbar's right cluster (`#navbarsRoom > ul.navbar-nav.ml-auto`) therefore contains exactly **four `<li>`** items in this capture — `talkingIndicator`, `recIndicator`, volume `dropdown`, and `reload` — **confirmed** by walking the right-cluster children in both `subtree-topnav.json` and `subtree-roomShell.json`.

The presenter broadcast controls the FOCUS lists (screen-share, camera, mic, CC, music, record, go-live, members) are **not present in this navbar DOM**. In the captured DOM those broadcast/presenter affordances live elsewhere (presentation-area tab bars `#mainTabs`/`#screenTabs`/`#streamsTabs`, the `.room-sound-options` CC panel, and the sidebar `.fas.fa-cogs` / `.fas.fa-users` items + `#user-options-btn` gear). They are documented here only as the **conditional presenter variant** (§3.6) with the evidence that exists; the four-item viewer cluster (§3.1–§3.5) is the authoritative, fully-measured structure.

Angular component context: every node carries the attribute `_ngcontent-ng-c977335924` (one Angular view-encapsulation scope id; the navbar is a single component's template). No `app-*` custom element tags appear inside the navbar itself — it is plain Bootstrap-4/5 `navbar` markup emitted by the room-shell component.

---

### 1. STRUCTURE — DOM hierarchy

Root: `nav.navbar.navbar-expand-md.navbar-dark.fixed-top.mainAppNav`

```
nav.navbar.navbar-expand-md.navbar-dark.fixed-top.mainAppNav      [00]  (#0c2434, fixed top, 1989×49)
├─ span.sidebar-menu                          [01]  title="Open Sidebar"   ← hamburger pill
│   └─ i.fas.fa-bars                          [02]  (FA U+F0C9)
├─ span.users.ml-1.mr-1.d-flex.align-items-center  [03]  title="Users Connected"  ← user-count pill
│   └─ i.fas.fa-user                          [04]  (FA U+F007)
├─ span.fas.fa-mobile.mr-1.mobile-info-app-btn     [05]  title="Launch in Mobile App"
│                                                    data-bs-toggle="modal" data-bs-target="#mobileAppInfoModal"  (FA U+F10B)
├─ a.navbar-brand.ml-1.mr-auto                [06]                          ← brand link (mr-auto pushes rest right)
│   └─ img#cssLogo.brand-logo                 [07]  alt="App Logo" src=…/uploads/8cb6ad5c…
└─ div#navbarsRoom.collapse.navbar-collapse   [08]                          ← right region (Bootstrap collapse target)
    └─ ul.navbar-nav.align-items-center.ml-auto   [09]                      ← right cluster (margin-left:auto)
        ├─ li.nav-item.talkingIndicator.animated.fadeIn.ng-star-inserted  [10]  (1st child)
        │   └─ a.talking                      [11]  text=" "
        │       ├─ i.icon.fa.fa-microphone    [12]  (FA U+F130)
        │       ├─ span.talking-string        [13]
        │       │   └─ span.ng-star-inserted  [14]  text="TG"  ← speaker initials (placeholder)
        │       └─ img#talkingLevelsImg.talkingWaveform.animated.fadeIn.ng-star-inserted  [15]  src=/assets/images/talking.gif
        ├─ li.nav-item.recIndicator.animated.fadeIn.ng-star-inserted      [16]  (2nd child)
        │   └─ a                              [17]  text="[ REC ]"  (no class)
        ├─ li.nav-item.dropdown.dropstart     [18]  (3rd child)            ← volume dropdown
        │   └─ a#dropdownVolume.nav-link.d-flex.align-items-center  [19]  data-bs-toggle="dropdown"
        │       └─ i.fas.fa-2x.fa-volume-up   [20]  (FA U+F028)
        └─ li.nav-item                        [21]  title="Reload"          ← reload
            └─ a.nav-link.d-flex.align-items-center  [22]
                └─ i.fas.fa-2x.fa-sync        [23]  (FA U+F021)
```

**ID inventory:** `#navbarsRoom` (collapse region), `#cssLogo` (logo img), `#talkingLevelsImg` (waveform gif), `#dropdownVolume` (volume toggle). **Element order is left → right exactly as listed.** The `ng-star-inserted` class marks Angular `*ngIf`/`*ngFor`-inserted nodes (talkingIndicator, recIndicator, talking initials span, waveform img) — i.e. those four are **conditionally rendered**.

---

### 2. LAYOUT — geometry + computed CSS + tokens

#### 2.1 The bar itself (`nav.mainAppNav`)

| Property | Value | Token |
|---|---|---|
| position | `fixed`; `top:0; left:0`; `z-index:1030` | — |
| rect | x=0 y=0 **w=1989 h=49** | — |
| display | `flex; flex-direction:row; align-items:center; justify-content:flex-start; flex-wrap:nowrap` | — |
| background-color | `rgb(12,36,52)` = **`#0C2434`** | `--navbar-bg: #0c2434` |
| color | `rgb(255,255,255)` = **`#FFFFFF`** | `--navbar-color: #fff` |
| font-family | `"Open Sans", sans-serif` | — |
| font-size / weight / line-height | `16px` / `300` / `24px` | — |

Bootstrap `navbar-expand-md` ⇒ at ≥768px the collapse region is always shown inline (it does not collapse at 1989px). `fixed-top` ⇒ removed from flow, pinned. **Global reset in effect** (matched on every descendant): `*, ::before, ::after { box-sizing: border-box; text-shadow: none !important; box-shadow: none !important; }` — i.e. **no box-shadow anywhere in the navbar**, by `!important`.

#### 2.2 Left group geometry (left → right)

| # | Element | rect (x,y,w,h) | display | bg | color | font-size | pad / margin |
|---|---|---|---|---|---|---|---|
| 01 | `span.sidebar-menu` | 5, 9, **27.75×31** | block | `#103D5C` | `#FFF` | 18px/w300 | pad `1px 5px`; mar `0 5px` |
| 02 | `i.fas.fa-bars` | 11,15, 15.75×18 | inline-block | — | `#FFF` | 18px/w900 (FA) | — |
| 03 | `span.users …d-flex` | 42,16, 24.25×18 | flex row, items center | transparent | `#FFF` | 14px/w300 | pad `1px 5px`; mar `0 4px` |
| 04 | `i.fas.fa-user` | 48,18, 12.25×14 | block | — | `#FFF` | 14px/w900 (FA) | — |
| 05 | `span.fas.fa-mobile…btn` | 70,17, 10×16 | block | transparent | `#FFF` | 16px/w900 (FA) | mar-right 4px |
| 06 | `a.navbar-brand.ml-1.mr-auto` | 88,5, **200×40** | block | — | `#FFF` | 20px/w300 | pad `5px 0`; mar-left 4px; **`margin-right:auto`** |
| 07 | `img#cssLogo.brand-logo` | 88,17, **199.99×17.76** | inline | — | — | — | `max-width:200px`; `vertical-align:middle` |

`a.navbar-brand.mr-auto` carries the `margin-right:auto` that pushes the entire `#navbarsRoom` region to the right edge.

#### 2.3 Right region geometry

| # | Element | rect (x,y,w,h) | display | notes |
|---|---|---|---|---|
| 08 | `div#navbarsRoom.collapse.navbar-collapse` | 288,1, **1701×48** | flex row, items center | bg `#0C2434`; spans logo→right edge |
| 09 | `ul.navbar-nav.ml-auto` | **1739**,1, **250.22×48** | flex row, items center | `margin-left: 1450.78px` (computed from `ml-auto`) ⇒ cluster hugs the right edge |
| 10 | `li.talkingIndicator` | 1739,4, **80.66×41** | list-item | `max-width:400px; white-space:nowrap; text-overflow:ellipsis` |
| 16 | `li.recIndicator` | 1819,4, **61.55×41** | list-item | — |
| 18 | `li.nav-item.dropdown.dropstart` | 1881,1, **50×48** | list-item, `position:relative` | dropstart ⇒ menu opens to the **left** |
| 21 | `li.nav-item` (reload) | 1931,1, **58×48** | list-item | `title="Reload"` |

**Important matched rule on right-cluster items** (`targeted.json`): `#navbarsRoom .nav-item { width: 100% !important; padding: 0 10px !important; }` — applies to the collapsed/stacked (mobile, `<768px`) state. At 1989px the items are inline and the measured widths above govern.

#### 2.4 Right-cluster sub-element geometry & color

| # | Element | rect | color | font-size/weight | margin |
|---|---|---|---|---|---|
| 11 | `a.talking` | 1744,4, 70.66×41 | `#FFF` | 16/300, line-height **41px** | `0 5px`; `display:inline-flex; align-items:center` |
| 12 | `i.icon.fa.fa-microphone` | 1744,17, 11×16 | `#FFF` | 16px/w900 (FA U+F130) | — |
| 13 | `span.talking-string` | 1764,4, 18.68×41 | `#FFF` | 14/300, lh 41px | `0 5px`; `max-width:250px` |
| 14 | `span.ng-star-inserted` ("TG") | 1764,17, 18.68×16 | `#FFF` | 14/300 | inline |
| 15 | `img#talkingLevelsImg` | 1792,12, **22.08×24.99** | — | — | `max-width:30px; vertical-align:middle` |
| 17 | `a` ("[ REC ]") | 1824,4, 61.55×41 | **`rgb(69,162,255)` = `#45A2FF`** | 16/300, lh 41px | `0 5px`; `max-width:117px`; `display:inline-block` |
| 19 | `a#dropdownVolume` | 1886,1, **40×48** | `rgb(171,176,181)` = **`#ABB0B5`** | 16/300 | pad `8px`; mar `0 5px`; flex/center |
| 20 | `i.fas.fa-2x.fa-volume-up` | 1894,9, **36×32** | `#ABB0B5` | **32px**/w900 (FA U+F028) | — |
| 22 | `a.nav-link` (reload) | 1936,1, **48×48** | `#ABB0B5` | 16/300 | pad `8px`; mar `0 5px`; flex/center |
| 23 | `i.fas.fa-2x.fa-sync` | 1944,9, **32×32** | `#ABB0B5` | **32px**/w900 (FA U+F021) | — |

#### 2.5 Color tokens used by this surface

| Token | Value | Where applied |
|---|---|---|
| `--navbar-bg` | `#0c2434` | nav + `#navbarsRoom` bg |
| `--navbar-color` | `#fff` | nav default text/icon |
| `--sidebar-menu-bg` | `#103d5c` | hamburger pill bg (node 01) |
| `--sidebar-menu-color` | `#fff` | hamburger glyph |
| `--app-link-color` | `#45a2ff` | nav-link **hover** color (volume, reload) |
| `--presenter-recording-color` | `#45a2ff` | matches `[ REC ]` text color `#45A2FF` |
| `--reload-icon-color` | `#45a2ff` | presenter/sidebar reload variant (active state) |
| `--reload-icon-bg-color` | `#f4f4f4` | presenter/sidebar reload-button variant bg |
| (computed) `#ABB0B5` | gray | resting color of volume + reload nav-link icons in this viewer capture |

**Fonts loaded:** `Open Sans` (UI text), `Font Awesome 5 Free` weight 900 (solid `fas` glyphs) and weight 400 (regular). Also present but unloaded in capture: `Lato`, `summernote`, `Font Awesome 5 Brands`.

---

### 3. BEHAVIOR — interactive elements (icon, handlers, states)

Each entry: the trigger element, its FA glyph (codepoint **extracted from `::before { content }`**), declared attributes, and behavior.

#### 3.1 Left group — utility controls

| Control | Element | FA icon | Codepoint | Attrs / behavior |
|---|---|---|---|---|
| **Hamburger / sidebar toggle** | `span.sidebar-menu` > `i.fas.fa-bars` | `fa-bars` | U+F0C9 | `title="Open Sidebar"`. `cursor:pointer`. Pill-styled (bg `#103D5C`, pad `1px 5px`, mar `5px`). Opens the left sidebar drawer (Angular click handler; no inline `onclick`/`href`). |
| **User-count pill** | `span.users.d-flex` > `i.fas.fa-user` | `fa-user` | U+F007 | `title="Users Connected"`. `cursor:pointer`. Flex row; the live connected-user count renders as a sibling text node after the icon (count text not captured in this slice — it is dynamic). |
| **Mobile-app launch** | `span.fas.fa-mobile.mobile-info-app-btn` | `fa-mobile` | U+F10B | `title="Launch in Mobile App"`, `data-bs-toggle="modal"`, `data-bs-target="#mobileAppInfoModal"`. Opens the mobile-app-info modal. The `<span>` itself is the FA glyph host (icon-as-button — class includes `fas fa-mobile`). |
| **Brand / logo** | `a.navbar-brand.mr-auto` > `img#cssLogo.brand-logo` | — (image) | — | `<a>` brand link; `img` `alt="App Logo"`, `max-width:200px`, served from R2/uploads. `mr-auto` on the anchor is the layout hinge that right-aligns the entire control cluster. |

#### 3.2 Talking indicator (`li.talkingIndicator`)

- Conditionally rendered (`ng-star-inserted` + `animated fadeIn` ⇒ Animate.css fade-in when a speaker starts talking).
- `a.talking` (`cursor:pointer`, `inline-flex`, items centered) contains, in order:
  1. `i.icon.fa.fa-microphone` — `fa-microphone` **U+F130**, white.
  2. `span.talking-string` > `span.ng-star-inserted` — text **"TG"** = current speaker initials (dynamic placeholder; do not reuse).
  3. `img#talkingLevelsImg.talkingWaveform` — animated waveform GIF `src=/assets/images/talking.gif`, ~22×25px, fades in with Animate.css.
- Container rule: `.talkingIndicator { max-width:400px; white-space:nowrap; text-overflow:ellipsis; }` — long speaker names truncate with an ellipsis.
- No href/role; click handled by Angular (likely focus/scroll-to-speaker). State = visible only while someone is talking.

#### 3.3 Recording indicator (`li.recIndicator`)

- Conditionally rendered (`ng-star-inserted` + `animated fadeIn`). Visible only while the room is recording.
- `a` (no class, **no href**) with text **"[ REC ]"**, color **`#45A2FF`** (= `--presenter-recording-color`), `cursor:pointer`, line-height 41px. Clicking likely jumps to / toggles the recording view (Angular handler).

#### 3.4 Volume dropdown (`li.nav-item.dropdown.dropstart`)

- Toggle: `a#dropdownVolume.nav-link.d-flex.align-items-center`, `data-bs-toggle="dropdown"` (Bootstrap dropdown).
- Icon: `i.fas.fa-2x.fa-volume-up` — `fa-volume-up` **U+F028**, **32px** glyph, resting color **`#ABB0B5`**.
- `dropstart` ⇒ the menu opens to the **left** of the toggle. `li` is `position:relative` (positioning context for the menu).
- Matched rules: `#dropdownVolume { width:40px }`; `#dropdownVolume::after { display:none }` — the default Bootstrap dropdown **caret is suppressed**.
- **Hover state** (matched): `.navbar-dark .navbar-nav .nav-link:hover/:focus { color: var(--app-link-color) }` ⇒ icon turns **`#45A2FF`** on hover (the app override beats Bootstrap's default `#00bc8c`/`rgb(0,188,140)`). `text-decoration:none` on hover.
- Behavior: opens the room volume / sound-options popover (master volume slider + per-source toggles; the CC `fas fa-closed-captioning` option lives in the related `.room-sound-options` panel, padded `padding-left:30px; text-align:left`).

#### 3.5 Reload (`li.nav-item` title="Reload")

- `a.nav-link.d-flex.align-items-center` (no href) > `i.fas.fa-2x.fa-sync` — `fa-sync` **U+F021**, **32px**, resting color **`#ABB0B5`**.
- `li` carries `title="Reload"`. Same nav-link hover override ⇒ **`#45A2FF`** on hover.
- Behavior: reloads the room / re-syncs streams (Angular click handler). Note: a related but **distinct** sidebar variant `button.btn.btn-sm.btn-default.reload-room-users` exists with `.reload-room-users { background-color: var(--reload-icon-bg-color)=#f4f4f4; color: var(--reload-icon-color)=#45a2ff }` and `fas fa fa-sync` — that is the sidebar's "reload users" button, not this navbar nav-link.

#### 3.6 Presenter broadcast controls — CONDITIONAL variant (not in this capture)

The FOCUS-requested presenter controls (screen-share / camera / mic / CC / music / record / go-live / members + gear) are **rendered only in presenter sessions** and were **absent** from the captured viewer navbar (right cluster = 4 items, verified). Rebuild guidance for the presenter variant, with the evidence found in sibling slices:

| Intended control | Likely FA glyph (FA5 solid) | Evidence in capture |
|---|---|---|
| Screen-share | `fa-desktop` (U+F108) | `a#screens-tab.nav-link.active i.fas.fa-desktop`, `ul#mainTabs` (presentation tab bar) |
| Camera | `fas fa-camera` (U+F030) | `button.btn.btn-sm.btn-dark i.icon.fas.fa-camera` (presentation controls) |
| Mic | `fa-microphone` (U+F130) | same glyph as talking indicator |
| Closed Captions | `fa-closed-captioning` (U+F20A) | `div.room-sound-options` carries the CC affordance |
| Music / record / go-live | (not captured) | no node found — presenter-only |
| Members | `fas fa-users` (U+F0C0) | sidebar `a.nav-link.sidebar-item.ps-1 i.fas.fa-users` |
| Gear / settings | `fas fa-cog` (U+F013) / `fa-cogs` (U+F085) | `button#user-options-btn.btn.btn-sm.btn-dark.dropdown-toggle i.fas.fa.fa-cog`; sidebar `i.fas.fa-cogs`; chat `a.nav-link.dropdown-toggle i.fas.fa-cog.chat-header-gear` |

Presenter-relevant hover/state behaviors found: `.btn-dark:hover { color:#fff; background-color:rgb(152,162,172); border-color:rgb(145,156,166) }` (the `#user-options-btn` gear). When the presenter goes live, `--presenter-recording-color: #45a2ff` vs `--presenter-noRecording-color: #fff` toggles the record-state color. **Treat §3.6 as a TODO to re-capture from a presenter session before building these 1:1.**

---

### 4. SUBSECTIONS — rebuild checklist (1:1)

1. **Bar** — `position:fixed; top:0; left:0; z-index:1030; height:49px; width:100vw; background:#0C2434; color:#fff; display:flex; align-items:center; font:300 16px/24px "Open Sans"`. Apply the global `text-shadow/box-shadow: none !important` reset so the bar is flat (no shadow).
2. **Hamburger pill** — `span.sidebar-menu`, bg `#103D5C`, pad `1px 5px`, margin `5px`, glyph `fa-bars` 18px/#fff, `title="Open Sidebar"`, `cursor:pointer`; opens sidebar.
3. **User-count pill** — `span.users.d-flex`, glyph `fa-user` 14px, pad `1px 5px`, margin `4px`, `title="Users Connected"`, dynamic count text after the icon.
4. **Mobile launch** — `span.fas.fa-mobile.mobile-info-app-btn`, glyph 16px, `data-bs-toggle="modal" data-bs-target="#mobileAppInfoModal"`, `title="Launch in Mobile App"`.
5. **Brand** — `a.navbar-brand.mr-auto` (the `mr-auto` is load-bearing) wrapping `img#cssLogo.brand-logo` (`max-width:200px`, ~200×18 rendered, `vertical-align:middle`).
6. **Right cluster** — `div#navbarsRoom.collapse.navbar-collapse` > `ul.navbar-nav.align-items-center.ml-auto`; four `<li>`: talkingIndicator, recIndicator, volume `dropdown.dropstart`, reload. Cluster width ≈250px, right-pinned via `ml-auto`. Stacked-state rule: `#navbarsRoom .nav-item { width:100% !important; padding:0 10px !important }`.
7. **Talking indicator** — mic glyph `fa-microphone` (U+F130) + initials span (truncating, `max-width:400px`) + `talking.gif` waveform; Animate.css `fadeIn`; conditional.
8. **Rec indicator** — `[ REC ]` text in `#45A2FF`; conditional; `animated fadeIn`.
9. **Volume dropdown** — `a#dropdownVolume` (`width:40px`, `::after{display:none}`), glyph `fa-volume-up` 2x/#ABB0B5; hover `#45A2FF`; `dropstart` opens left; opens sound-options.
10. **Reload** — `a.nav-link` > `fa-sync` 2x/#ABB0B5; hover `#45A2FF`; `title="Reload"`.
11. **Presenter variant (§3.6)** — flag as separate capture; build only after re-capturing a presenter session.

---


<a id="03"></a>

## 03 — Left Sidebar / Roster Drawer

Reference reconstruction of the protradingroom.com admin trading-room **left sidebar** (the collapsible roster/navigation drawer). Third-party visual reference only — structure, layout, CSS, and behavior are documented; their copy/data are NOT to be reproduced as ours.

> **Capture-state note (critical for rebuild).** In this slice the drawer is **closed**. The outer `div.room-sidebar` flex column has collapsed to **width 0** (`flex-grow:0`, `flex-basis:auto`), and the `div.sidebar-wrapper` inside is `position:absolute` pushed fully off the left edge: `left:0; right:1989px; margin-left:-250px`, so every rect reports `x = -250 … -7`. When the drawer is **open**, the wrapper slides to `x:0` (toggle removes the `-250px` left offset / the room-container reflows the column to 250px). All widths/heights/typography below are the real rendered values; only the X-origin is the off-canvas offset. The drawer occupies the full content height (`y:49 → 1166`, `height:1117px`) below the 49px top nav.
>
> **Theme-token note.** The design tokens (theme.json `cssVariables.root`) define a **dark navy** themed skin for this drawer — `--sidebar-wrapper-bg-color:#103d5c`, `--sidebar-wrapper-color:#fff`, `--sidebar-menu-bg:#103d5c`, `--sidebar-menu-color:#fff`, `--sidebar-menu-active-color:#45a2ff`, `--sidebar-navItem-border-color:#fff`. The *computed* styles in this capture resolve to a **light skin** (white wrapper bg `rgb(255,255,255)`, body text `rgb(103,103,103)`, blue accent `rgb(69,162,255)` = `#45a2ff`). Build to the computed values; keep the token names so either skin can be applied.

---

### 3.1 Structure — DOM / Angular component tree

Root path of this surface:

```
app-room#topRoomDiv
└ div.wrapper
  └ div.d-flex.flex-column-reverse.flex-sm-row.room-container
    └ div.room-sidebar                         ← outer flex column (width:0 when closed)
      └ div.sidebar-wrapper                    ← absolute drawer panel, 250px, z-index:3
        └ nav.navbar.w-100.h-100               ← display:flex, transparent
          └ ul.navbar-nav.small.w-100.h-100    ← display:flex; overflow-y:auto; font-size 14px
            ├ li.nav-item.text-center                 (1) — Powered-by / version / mobile-app block
            │  ├ p            "Powered by:"
            │  ├ a.ptr-website-link  "ProTradingRoom.com"  → https://protradingroom.com
            │  ├ p            "Version: v4.0.1-c0fee8f5"
            │  ├ p ▸ button.btn.btn-sm.btn-secondary  "Mobile App Info"  (modal #mobileAppInfoModal)
            │  ├ hr
            │  └ p ▸ span "Chat" ▸ i.fas.fa-check  +  span.ng-star-inserted "Media" ▸ i.fas.fa-check
            ├ li.nav-item                              (2) — Connectivity Check
            │  └ a.nav-link.sidebar-item   ▸ i.fas.fa-network-wired + span.pl-2 "Connectivity Check"
            ├ li.nav-item                              (3) — General Settings
            │  └ a.nav-link.sidebar-item   ▸ i.fas.fa-cogs + span.pl-2 "General Settings"
            ├ li.nav-item.dropdown                     (4) — Archives (Bootstrap dropdown)
            │  └ a#archivesDropdown.nav-link.sidebar-item.dropdown-toggle ▸ i.fas.fa-archive + span.pl-2 "Archives"
            │     └ (dropdown-menu: Alert Logs / Chat Logs / Transcript History — rendered lazily, not in slice)
            ├ li.nav-item.py-0                         (5) — Manage Muted Users
            │  └ a.nav-link.sidebar-item.ps-1 ▸ i.fas.fa-comments + span.pl-2 "Manage Muted Users"
            ├ li.nav-item.py-0                         (6) — Manage Followed Users
            │  └ a.nav-link.sidebar-item.ps-1 ▸ i.fas.fa-users + span.pl-2 "Manage Followed Users"
            └ li.nav-item.d-flex.flex-column.h-100     (7) — Roster section (fills remaining height)
               ├ a.nav-link.active-room-users.d-flex.align-items-center.justify-content-between.pt-0
               │  ├ div[title=Users]  ▸ i.fas.fa-user + span.pl-2 "Users:"
               │  └ div.flex-fill.users-btns          ← roster toolbar (float-right buttons)
               │     ├ button#user-options-btn.btn.btn-sm.btn-dark   ▸ i.fas.fa.fa-cog   (dropdown)
               │     ├ button.btn.btn-sm.btn-default.reload          ▸ i.fas.fa.fa-sync  (title "Reload Users")
               │     ├ button.btn.btn-sm.btn-secondary               ▸ i.fas.fa-sort-alpha-down (title "Sort Users")
               │     └ button.btn.btn-sm.btn-default.search-room…    ▸ i.fas.fa.fa-search (title "Search Users")
               └ div.flex-grow-1                       ← scroll region (flex-grow:1)
                  └ app-room-roster                    ← Angular component (_nghost-ng-c900715899)
                     └ div.room-roster-list            ← per-user rows render here (empty in slice)
```

Angular component IDs observed: the sidebar shell is rendered under content scope `_ngcontent-ng-c977335924`; `app-room-roster` is host scope `_nghost-ng-c900715899` with content scope `_ngcontent-ng-c900715899`.

Order is fixed: info block → Connectivity → Settings → Archives → Muted → Followed → Roster. Items 2–6 are single-row nav links; item 7 is a flex-column that expands to fill leftover height and contains the scrolling roster.

---

### 3.2 Layout — geometry + computed CSS + tokens

**Drawer container chain**

| Element | Rect (x,y,w,h) | Position | Key computed CSS |
|---|---|---|---|
| `div.room-sidebar` (outer) | `0, 49, 0, 1117` | static, flex child | width collapses to `0px` when closed; `flex-grow:0`; full content height 1117px |
| `div.sidebar-wrapper` | `-250, 49, 250, 1117` | **absolute** | `top:0; bottom:0; left:0; right:1989px; margin-left:-250px; z-index:3`; bg `rgb(255,255,255)` (token `--sidebar-wrapper-bg-color:#103d5c`); color `rgb(103,103,103)`; font `"Open Sans", sans-serif` 16px/300 |
| `nav.navbar.w-100.h-100` | `-250, 49, 250, 1117` | relative | `display:flex`; bg transparent; padding 0 |
| `ul.navbar-nav.small.w-100.h-100` | `-250, 49, 250, 1117` | static | `display:flex` (column via flex defaults of nav-item li); **`overflow-x:hidden; overflow-y:auto`** (the whole list scrolls); `font-size:14px; font-weight:400; line-height:21px` (`.small`) |

Page-level font stack on the wrapper is `"Open Sans", sans-serif` (note: theme.json `--font-family-sans-serif` is `"Lato", …`; the live computed family here is Open Sans — match Open Sans). Color tokens in play: body text `rgb(103,103,103)`, accent blue `rgb(69,162,255)` = `#45a2ff` (= `--checkbox-bg-color` / `--sidebar-menu-active-color`), `--lighter-gray:#eee` (hover), separators use `rgb(255,255,255)` (= `--sidebar-navItem-border-color`).

**`<li>` nav items — shared geometry**

| li | Class | Rect (w,h) | padding | border-bottom | font-weight |
|---|---|---|---|---|---|
| Info block | `nav-item text-center` | 250 × 143 | `5px 2px` | `1px solid rgb(255,255,255)` | 400 |
| Connectivity | `nav-item` | 250 × 48 | `5px 2px` | `1px solid rgb(255,255,255)` | 700 |
| General Settings | `nav-item` | 250 × 48 | `5px 2px` | `1px solid rgb(255,255,255)` | 700 |
| Archives | `nav-item dropdown` (`position:relative`) | 250 × 48 | `5px 2px` | `1px solid rgb(255,255,255)` | 700 |
| Manage Muted | `nav-item py-0` | 250 × 38 | `0 2px` (py-0 zeros vertical) | `1px solid rgb(255,255,255)` | 700 |
| Manage Followed | `nav-item py-0` | 250 × 38 | `0 2px` | `1px solid rgb(255,255,255)` | 700 |
| Roster section | `nav-item d-flex flex-column h-100` | 250 × 754 | `5px 2px` | `1px solid rgb(255,255,255)` | 700; `display:flex; flex-direction:column` |

Every `li` carries a `1px` bottom separator in white — they read as faint dividers on the dark themed skin, white-on-white (invisible) on the captured light skin. The roster `li` is `display:flex; flex-direction:column` and takes the remaining ~754px so its inner scroll region fills the drawer.

**`a.nav-link.sidebar-item` (rows 2–6) — shared**

| Property | Value |
|---|---|
| display | `block` (item 7's link is `flex`) |
| width × height | `236 × 37` (Muted/Followed same; ps-1 variant adds `padding-left:4px`) |
| padding | `8px 0` vertical (`.nav-link` y), `padding-right/left:0` (`.navbar-nav .nav-link`) |
| margin | `0 5px` (from `.sidebar-menu, … , .navbar-nav li a` rule) |
| font | 14px / **700** / 21px |
| color | `rgb(103,103,103)` |
| cursor | `pointer` |
| hover | `.sidebar-menu:hover { color: var(--lighter-gray); border:1px solid transparent }` (sidebar-menu rule family); `.nav-link:hover{ text-decoration:none }` |

The shared rule from the room component:
```css
.sidebar-menu, .users, .helpLink, .navbar-nav li a { cursor:pointer; margin:0 5px; }
.sidebar-menu, .users, .helpLink { font-size:18px; }
.sidebar-menu { padding:1px 5px; border:1px solid transparent; background-color:var(--sidebar-menu-bg); color:var(--sidebar-menu-color); }
.sidebar-menu:hover { color:var(--lighter-gray); border:1px solid transparent; }
```

**Label spans (`span.pl-2`)**

| Node | Text | color | font-size | font-weight | padding-left |
|---|---|---|---|---|---|
| Connectivity | "Connectivity Check" | `rgb(103,103,103)` | 14px | 700 | 8px (`pl-2`) |
| Settings | "General Settings" | `rgb(103,103,103)` | 14px | 700 | 8px |
| Archives | "Archives" | `rgb(103,103,103)` | 14px | 700 | 8px |
| Muted | "Manage Muted Users" | `rgb(103,103,103)` | 14px | 700 | 8px |
| Followed | "Manage Followed Users" | `rgb(103,103,103)` | 14px | 700 | 8px |
| Roster header | "Users:" | `rgb(103,103,103)` | 14px | 700 | 8px |

`span.pl-2` = Bootstrap `padding-left:0.5rem` (8px). Icons sit left, label right.

**FontAwesome 5 icons** — family `"Font Awesome 5 Free"`, weight **900** (solid `fas`), 14px. Each glyph is the `i` element's `::before content`:

| Node | Class | FA name | `::before` content | icon color |
|---|---|---|---|---|
| 12,14 | `fas fa-check` | check | `\f00c` | `rgb(103,103,103)` |
| 17 | `fas fa-network-wired` | network-wired | `\f6ff` | `rgb(103,103,103)` |
| 21 | `fas fa-cogs` | cogs | `\f085` | `rgb(103,103,103)` |
| 25 | `fas fa-archive` | archive | `\f187` | `rgb(103,103,103)` |
| 29 | `fas fa-comments` | comments | `\f086` | `rgb(103,103,103)` |
| 33 | `fas fa-users` | users | `\f0c0` | `rgb(103,103,103)` |
| 38 | `fas fa-user` | user | `\f007` | `rgb(103,103,103)` |
| 42 | `fas fa fa-cog` | cog | `\f013` | `rgb(255,255,255)` (white on dark btn) |
| 44 | `fas fa fa-sync` | sync | `\f021` | `rgb(69,162,255)` (blue) |
| 46 | `fas fa-sort-alpha-down` | sort-alpha-down | `\f15d` | `rgb(255,255,255)` |
| 48 | `fas fa fa-search` | search | `\f002` | `rgb(244,244,244)` (near-white on blue btn) |

Note icon `i` widths: network-wired/users/search ≈ 18px, cog/sync ≈ 14px, archive/comments 14–16px, check 14px, sort 12px, user 12px (FA fixed-width varies by glyph; the `fa` legacy class is present on the toolbar trio cog/sync/search).

---

### 3.3 Subsections (rebuild each 1:1)

#### 3.3.1 Powered-by / Version / Mobile-App block (`li.nav-item.text-center`)
Centered (`text-align:center`), 250×143, padding `5px 2px`.

| Line | Element | Content / behavior | Style |
|---|---|---|---|
| 1 | `p` | "Powered by:" | block, 246×21, `margin-bottom:8px`, 14px/400 |
| 2 | `a.ptr-website-link` | text → site link | `href="https://protradingroom.com"`, `target="_blank"`, `rel="noopener noreferrer"`; color `rgb(69,162,255)`; `margin:0 5px`; `cursor:pointer`; inline |
| 3 | `p` | "Version: v4.0.1-c0fee8f5" | block, 246×21, `margin-bottom:8px` (rebuild: substitute our own build string) |
| 4 | `p` ▸ `button` | "Mobile App Info" button | see below |
| 5 | `hr` | divider | block, width 246, `border-top:1px rgb(103,103,103)`, `opacity:0.25`, `margin:5px 0` |
| 6 | `p` ▸ 2 spans + checks | Chat/Media indicator ticks | see below |

**Mobile App Info button** — `button.btn.btn-sm.btn-secondary`, `type="button"`, **`data-bs-toggle="modal"` `data-bs-target="#mobileAppInfoModal"`**. Rect `115×31` (rendered `114.523px`), padding `4px 8px`, `color:rgb(255,255,255)`, `bg:rgb(108,117,125)` (Bootstrap secondary gray), 14px/400, `cursor:pointer`, centered.

**Chat / Media tick row** — `p` (centered) containing:
- `span` "Chat" (color `rgb(103,103,103)`, 14px/400) + `i.fas.fa-check` (`\f00c`, gray) at x≈-143.
- `span.ng-star-inserted` "Media" + `i.fas.fa-check` (`\f00c`, gray) at x≈-87.
These are status indicators (Chat enabled / Media enabled). `ng-star-inserted` = conditionally rendered via `*ngIf`. Check icons render only when the feature is connected/enabled; the check color flips to a success/blue when active (token `--green:#00bc8c` / blue `#45a2ff` available).

#### 3.3.2 Connectivity Check (`li.nav-item` → `a.nav-link.sidebar-item`)
- **`title="Connectivity Check"`**, **`data-bs-toggle="modal"` `data-bs-target="#webrtc-troubleshooter-modal"`** → opens the WebRTC troubleshooter modal.
- Icon `i.fas.fa-network-wired` (`\f6ff`) + label "Connectivity Check".
- Link 236×37, padding `8px 0`, margin `0 5px`, 14px/700, gray, pointer.

#### 3.3.3 General Settings (`li.nav-item` → `a.nav-link.sidebar-item`)
- **`title="General Settings"`**, **`data-bs-toggle="modal"` `data-bs-target="#user-settings-modal"`**.
- Icon `i.fas.fa-cogs` (`\f085`) + label "General Settings". Same link metrics as 3.3.2.

#### 3.3.4 Archives dropdown (`li.nav-item.dropdown` → `a#archivesDropdown.nav-link.sidebar-item.dropdown-toggle`)
- Bootstrap dropdown: `id="archivesDropdown"`, **`data-bs-toggle="dropdown"`**, `aria-haspopup="true"`, `aria-expanded="false"`, `title="Archives"`.
- `li` is `position:relative` (dropdown-menu anchors to it). The toggle's `::after` is the caret (`content:""`, Bootstrap caret triangle, currently empty/0-size in slice).
- Icon `i.fas.fa-archive` (`\f187`) + label "Archives".
- **Dropdown menu (rendered lazily by Bootstrap on open — NOT present in this DOM slice).** Per surface intent it contains three items: **Alert Logs**, **Chat Logs**, **Transcript History**. Rebuild as a Bootstrap `.dropdown-menu` with three `.dropdown-item` links opening their respective archive views/modals.

#### 3.3.5 Manage Muted Users (`li.nav-item.py-0` → `a.nav-link.sidebar-item.ps-1`)
- **`title="Manage Muted Users"`**, **`data-bs-toggle="modal"` `data-bs-target="#mutedUsersModal"`**.
- Icon `i.fas.fa-comments` (`\f086`) + label "Manage Muted Users".
- `li.py-0` → vertical padding 0; link `ps-1` adds `padding-left:4px`. Row height 38px.

#### 3.3.6 Manage Followed Users (`li.nav-item.py-0` → `a.nav-link.sidebar-item.ps-1`)
- **`title="Manage Followed Users"`**, **`data-bs-toggle="modal"` `data-bs-target="#followedUsersModal"`**.
- Icon `i.fas.fa-users` (`\f0c0`) + label "Manage Followed Users". Same metrics as 3.3.5.

#### 3.3.7 Roster section (`li.nav-item.d-flex.flex-column.h-100`)
Flex column, 250×754, fills remaining drawer height. Two children: the header/toolbar row and the scrolling list region.

**(a) Roster header + toolbar** — `a.nav-link.active-room-users.d-flex.align-items-center.justify-content-between.pt-0`
- Rect `236×35`, `display:flex; justify-content:space-between; align-items:center`; `padding-top:0` (`pt-0`), `padding-bottom:8px`; margin `0 5px`; 14px/700; pointer.
- Left child: `div[title="Users"]` (64×21) ▸ `i.fas.fa-user` (`\f007`) + `span.pl-2` "Users:" (14px/700, pl 8px). Clicking the row title toggles/focuses the roster.
- Right child: `div.flex-fill.users-btns` (`flex-grow:1`, 172×27) holding four right-floated buttons. **DOM order is cog → sync → sort → search; `float:right` reverses visual order to: search · sort · sync · cog** (left→right on screen). All buttons `btn btn-sm`, height 27px, padding `3px 6px`, `margin-left:4px` (except first), 14px, pointer.

| Visual pos | Button | Classes | Attrs / handler | Icon (`::before`) | bg / color |
|---|---|---|---|---|---|
| left | Search Users | `btn btn-sm btn-default float-right search-room…` | `title="Search Users"` | `fas fa fa-search` `\f002` | bg `rgb(69,162,255)` blue / icon `rgb(244,244,244)`; 26×27 |
| 2 | Sort Users | `btn btn-sm btn-secondary float-right border-0` | `title="Sort Users"` | `fas fa-sort-alpha-down` `\f15d` | bg `rgb(108,117,125)` gray / icon white; 24.25×27 |
| 3 | Reload Users | `btn btn-sm btn-default ml-1 float-right reload…` | `title="Reload Users"` | `fas fa fa-sync` `\f021` | bg `rgb(244,244,244)` light / icon `rgb(69,162,255)` blue; 26×27 |
| right | User Options | `btn btn-sm btn-dark ml-1 float-right border-0` | `id="user-options-btn"`, **`data-bs-toggle="dropdown"`**, `aria-expanded="false"` | `fas fa fa-cog` `\f013` | bg `rgb(33,37,41)` dark / icon white; 26×27 |

Behavior: **cog** (`#user-options-btn`) opens a Bootstrap dropdown of bulk user-options (rendered lazily — not in slice); **sync** reloads the roster; **sort** toggles alphabetical sort (the `fa-sort-alpha-down`/`-up` glyph likely flips on toggle); **search** opens an inline user-search input/box (class hints `search-room…`). All four are buttons (not links), keyboard-focusable, with `title` tooltips and no `disabled` state captured.

**(b) Roster list region** — `div.flex-grow-1` (246×708, `flex-grow:1`) ▸ `app-room-roster` (246×708) ▸ `div.room-roster-list`.
- `app-room-roster` is the Angular component; its rule:
  ```css
  .room-roster-list { width:100%; height:100%; overflow-y:inherit !important; }
  ```
- **Per-user rows are NOT in this slice** (the captured room had no active users serialized into the roster, so `div.room-roster-list` is empty). Rebuild target: a vertically scrolling list (scroll is owned by the outer `ul.navbar-nav` `overflow-y:auto`, while `.room-roster-list` inherits overflow) of user rows. Each row (per the surface intent and sibling toolbar) is expected to carry: avatar/presence dot, username, role/badge, and a per-row `user-options` affordance (mirroring `#user-options-btn`, likely a `data-bs-toggle="dropdown"` cog/kebab giving mute/follow/PM/role actions). Row typography should follow the list scope: 14px, gray `rgb(103,103,103)`, Open Sans.

---

### 3.4 Behavior summary — interactive inventory

| # | Element | Trigger | FA icon | Tooltip/title | Target / state |
|---|---|---|---|---|---|
| 1 | `a.ptr-website-link` | click | — | — | external link `https://protradingroom.com` `target=_blank rel=noopener noreferrer` |
| 2 | `button` Mobile App Info | click | — | — | modal `#mobileAppInfoModal` (`data-bs-toggle=modal`) |
| 3 | Chat tick `i.fa-check` | indicator | `fa-check \f00c` | — | shows when Chat connected (`*ngIf`) |
| 4 | Media tick `i.fa-check` | indicator | `fa-check \f00c` | — | shows when Media connected (`ng-star-inserted`) |
| 5 | Connectivity link | click | `fa-network-wired \f6ff` | "Connectivity Check" | modal `#webrtc-troubleshooter-modal` |
| 6 | General Settings link | click | `fa-cogs \f085` | "General Settings" | modal `#user-settings-modal` |
| 7 | Archives `a#archivesDropdown` | click | `fa-archive \f187` | "Archives" | dropdown (`data-bs-toggle=dropdown`, `aria-haspopup=true`, `aria-expanded=false`) → Alert Logs / Chat Logs / Transcript History |
| 8 | Manage Muted link | click | `fa-comments \f086` | "Manage Muted Users" | modal `#mutedUsersModal` |
| 9 | Manage Followed link | click | `fa-users \f0c0` | "Manage Followed Users" | modal `#followedUsersModal` |
| 10 | Roster header `a.active-room-users` | click | `fa-user \f007` | div `title="Users"` | toggles/focuses roster |
| 11 | Search button | click | `fa-search \f002` | "Search Users" | opens user search |
| 12 | Sort button | click | `fa-sort-alpha-down \f15d` | "Sort Users" | toggles A→Z / Z→A sort |
| 13 | Reload button | click | `fa-sync \f021` | "Reload Users" | refetch roster |
| 14 | User-Options `button#user-options-btn` | click | `fa-cog \f013` | — | dropdown (`data-bs-toggle=dropdown`, `aria-expanded=false`) of bulk user actions |

**Elements covered in this section: 52 captured nodes** (full `subtree-sidebar.json`), plus the lazily-rendered Archives dropdown menu and `room-roster-list` per-user rows documented from surface intent (absent from the slice's DOM).

---


<a id="04"></a>

## 04 — Presentation Stage (`presentation-box` / `app-presentationarea`)

> Third-party visual reference only. Documents structure / layout / CSS / behavior reconstructed from a captured DOM+CSS slice of protradingroom.com's admin trading room at viewport **1989×1166**. Do not copy their text/data — rebuild structure 1:1 with our own content.

Primary slice: `_slices/subtree-presentation.json` (rootPath `as-split#mainAreaSplit > as-split-area.presentation-box:nth-child(2) > app-presentationarea`, **553 elements in subtree, 50 captured nodes** — the active **Screens** tab was the rendered state at capture; Streams/Notes/Files panes exist in the DOM but were collapsed/hidden 0×0). Cross-referenced against `_slices/targeted.json` (matchedRules for `#mainTabs`, `#screenTabs`, `#streamsTabs`, `#notesTabs`, `#myTab`, `.nav-link.active`, `.files-badge`, `.presentation-box`) and `_slices/theme.json` (design tokens, fonts).

**Element count covered: 50 captured presentation nodes + 7 cross-referenced targeted nodes (mainTabs, screenTabs, streamsTabs, notesTabs, myTab/files-tab, files-badge, presentation-box).**

---

### 04.0 Tokens, fonts & shared constants used by this surface

| Token | Value | Where used |
|---|---|---|
| `--presenter-area-bg` | `#0f2e43` | `.presentation-box` container background |
| `--notes-tabs-bg` | `#0c2434` | screen/files/notes tab-bar strip background |
| `--tab-active-bg` | `#45a2ff` | active sub-tab pill background (screens/files/notes/streams) |
| `--tabs-color` | `#fff` | inactive sub-tab text |
| `--tabs-border-color` | `#0a6db1` | sub-tab hover border (1px) + `.noteTabset` top border |
| `--note-tabs-color` | `#fff` | active sub-tab text color |
| `--app-link-color` | `#45a2ff` | link color (`a:link/visited/active`) |
| `--tabs-dropdown-bg` | `#0f2e43` | per-screen cog dropdown menu bg |
| `--tabs-dropdown-color` | `#45a2ff` | per-screen cog dropdown menu text |
| `--note-text-color` | `#676767` | Notes editor body text |
| `--note-text-bg` | `#fff` | Notes editor canvas |
| `--note-options-bg` | `#f4f4f4` | Notes toolbar / options bar |
| `--note-options-color` | `#fff` | Notes options text |
| `--note-options-hover-color` | `#212529` | Notes options hover |
| `--note-download-bg` / `--note-next-bg` | `#92d528` / `#45a2ff` | Notes download button / next button |
| `--note-delete-bg` | `#bb352a` | Notes delete button |
| `--file-list-even-bg` / `--file-list-odd-bg` | `#f4f4f4` / `#fff` | Files list row striping |
| `--file-name-color` | `#0a6db1` | File name link |
| `--file-size-color` | `#b2b2b2` | File size label |
| `--file-searchbar-bg` / `--file-searchbar-color` / `--file-searchbar-icon-color` | `#fff` / `#b7b7b7` / `#666666` | Files search bar |
| `--file-download-bg` | `#92d528` | File download action |
| `--file-delete-bg` | `#bb352a` | File delete action |
| `--file-see-more-bg` | `#45a2ff` | "see more" button |
| `--presenter-recording-color` / `--presenter-noRecording-color` | `#45a2ff` / `#fff` | recording indicator states |
| `--bs-border-radius-pill` | `50rem` | files count badge pill |
| `--bs-danger-rgb` | `220,53,69` | (Bootstrap default) — note `.bg-danger` is overridden to `rgb(231, 76, 60)` |

**Fonts:** body/UI = **Lato** (400/700, + italic 400) and `"Open Sans", sans-serif` (dropdown caret pseudo). Icons = **Font Awesome 5 Free** weight **900** (solid `fas`). Notes rich-text editor loads the **summernote** font family (confirms Summernote WYSIWYG). Global reset in force: `*, ::before, ::after { box-sizing: border-box; text-shadow: none !important; box-shadow: none !important; }` — **no box-shadows anywhere on this surface**.

---

### 04.1 STRUCTURE — Angular component / DOM tree

```
as-split#mainAreaSplit
└─ as-split-area.presentation-box.as-split-area  (minsize="0")          [431,49 1558×1117]
   └─ app-presentationarea  (_nghost-ng-c2028866615)                    [431,49 1558×1117]
      └─ div.mainPresentationAreaHolder                                  [431,49 1558×1117]
         ├─ ul#mainTabs.nav.nav-tabs.mainTabset  [role=tablist]          [431,49 1558×41]
         │  ├─ li.nav-item        (Screens)                              [1089,49 89×41]
         │  │  └─ a#screens-tab.nav-link.active  [data-bs-target=#screens]
         │  │     └─ div.d-flex › div › i.fas.fa-desktop + span.ml-1
         │  ├─ li.nav-item        (Streams — HIDDEN, nth-child(2))       (0×0)
         │  │  └─ a#streams-tab.nav-link  [data-bs-target=#streams]
         │  ├─ li.nav-item        (Notes,  nth-child(3))                 [1178,49 81×41]
         │  │  └─ a#notes-tab.nav-link.presAreaTabs-notes [data-bs-target=#notes]
         │  │     └─ div.d-flex.align-items-center › div ›
         │  │        i#noteChangeIndicator.fas.fa-edit + span.mx-1
         │  └─ li.nav-item        (Files,  nth-child(4))                 [1259,49 72×41]
         │     └─ a.nav-link      [data-bs-target=#files]
         │        └─ div.d-flex.align-items-center › div ›
         │           i.fas.fa-folder + span.mx-1
         └─ div#mainTabsContent.tab-content                              [431,90 1558×1117]
            ├─ div#screens.tab-pane.fade.show.active [role=tabpanel]     [431,90 1558×1117]
            │  ├─ ul#screenTabs.nav.nav-tabs.screens-tabs [role=tablist] [431,90 1558×40]
            │  │  ├─ li.nav-item.ng-star-inserted   (per shared screen)  [431,90 138×40]
            │  │  │  └─ a#<screenId>-tab.nav-link.active [data-bs-toggle=tab]
            │  │  │     ├─ img.presenter-img  (gravatar 20×20)           [441,100 20×20]
            │  │  │     ├─ span.mx-1          (presenter name)           [465,102 68×14]
            │  │  │     └─ div.d-inline-block
            │  │  │        └─ span#dropdownMenuScreen.dropdown-toggle [data-bs-toggle=dropdown]
            │  │  │           └─ i.fas.fa-cog                            [537,102 12×12]
            │  │  └─ li.nav-item.ms-auto.ng-star-inserted (zoom controls)[1895,90 94×40]
            │  │     └─ div.zoom-controls-container.position-relative    [1895,94 94×31]  (opacity .5)
            │  │        ├─ button.btn.btn-sm.btn-dark › i.icon.fas.fa-search   (zoom)   [1895,94 32×31]
            │  │        ├─ button.btn.btn-sm.btn-dark › i.icon.fas.fa-camera   (snapshot)[1927,94 32×31]
            │  │        └─ button.btn.btn-sm.btn-dark › i.icon.fas.fa-expand   (fullscreen)[1959,94 30×31]
            │  └─ div#screensTabsContent.tab-content                     [431,130 1558×1035]
            │     └─ div#<screenId>.tab-pane.fade.ng-star-inserted.show.active [role=tabpanel]
            │        └─ app-screenshare-view.h-inherit  (_nghost-ng-c422358253)
            │           └─ div.h-inherit
            │              └─ div.position-relative.h-inherit.overflow-hidden.screencast-pan  [appdoubleclick]
            │                 ├─ pan-zoom.h-inherit  (_nghost-ng-c2749938274)
            │                 │  └─ div.pan-zoom-frame
            │                 │     └─ div.pan-element  (position:absolute; transform:matrix)
            │                 │        └─ div.zoom-element  (transform:matrix)
            │                 ├─ div#video-screen-container-<screenId>.video-screen-container
            │                 └─ video#webcamScreen-<screenId>.webcamScreen
            │                       [autoplay muted playsinline, data-ng-dblclick="fullScreen()"]
            ├─ div#streams.tab-pane.fade  (HIDDEN)
            │  └─ ul#streamsTabs.nav.nav-tabs.screens-tabs  (0×0)
            ├─ div#notes.tab-pane.fade  (HIDDEN)
            │  └─ ul#notesTabs.nav.nav-tabs.noteTabset.ng-star-inserted  (0×0)   ← Summernote panes
            └─ div#files.tab-pane.fade  (HIDDEN)
               └─ ul#myTab.nav.nav-tabs.files-tabs.d-flex.justify-content-center (0×0)
                  └─ a#files-tab.nav-link.d-flex.align-items-center.justify-content-between
                     └─ … span.badge.rounded-pill.bg-danger.files-badge  (count badge)
```

All elements carry Angular content/host attributes: `app-presentationarea` host = `_nghost-ng-c2028866615`; `app-screenshare-view` host = `_nghost-ng-c422358253`; `pan-zoom` host = `_nghost-ng-c2749938274`. Content attr inside presentation area = `_ngcontent-ng-c2028866615`.

> **Capture note:** only `#screens` (the active main tab) and one active screen sub-tab were expanded at snapshot. The Streams main tab (`li:nth-child(2)`) and the Notes / Files / Streams sub-tab-bars (`#notesTabs`, `#myTab`, `#streamsTabs`) were present in the DOM but measured 0×0 (collapsed/hidden). Their styling below is reconstructed from `targeted.json` matchedRules + theme tokens.

---

### 04.2 LAYOUT & geometry

#### Outer container

| Element | Rect (x,y,w,h) | Key CSS |
|---|---|---|
| `as-split-area.presentation-box` | 431,49 1558×1117 | `position:relative; background-color: var(--presenter-area-bg) (#0f2e43); overflow:hidden !important;` flex item with `flex-grow:0; flex-shrink:0; height:100%` (right pane of the horizontal `as-split`) |
| `app-presentationarea` | 431,49 1558×1117 | `display:inline` host; color `rgb(204,204,204)` |
| `div.mainPresentationAreaHolder` | 431,49 1558×1117 | `display:block; position:relative; width:1557.94px; height:1117px` |

The presentation box is the **second area** of `#mainAreaSplit` (sidebar/chat is the first). Its left edge is x=431; full width 1558px to viewport right (≈1989).

#### Main tab bar `#mainTabs.nav.nav-tabs.mainTabset`

- Rect **431,49 1558×40.5**. `display:flex; flex-wrap:wrap`, and `.mainTabset` adds `align-items:center; justify-content:center; border-color:transparent` → **tabs are centered horizontally** in the bar (Screens at x≈1089, i.e. centered cluster, not left-aligned).
- `.nav` base: `padding-left:0; margin-bottom:0; list-style:none; --bs-nav-link-padding-x:1rem; --bs-nav-link-padding-y:.5rem`.
- `.nav-tabs` base: `border-bottom: 1px solid rgb(68,68,68)` — but `.mainTabset` overrides `border-color:transparent`.
- Each `li.nav-item` = `display:list-item`, height 40.5px (Screens li 89×40.5; Notes li 81×40.5; Files li 72×40.5).

#### Main-tab links (`.mainTabset .nav-link`)

| Tab | id | Rect | Active? | Text color |
|---|---|---|---|---|
| Screens | `screens-tab` | 1094,54 79×31 | active | `rgb(255,255,255)` |
| Streams | `streams-tab` | (0×0, hidden) | — | — |
| Notes | `notes-tab` | 1183,54 71×31 | inactive | `rgb(204,204,204)` |
| Files | (no id) | 1264,54 62×31 | inactive | `rgb(204,204,204)` |

Link CSS (`.mainTabset .nav-link`, also shared with `.screens-tabs`/`.noteTabset`):
`padding:0.5rem; font-size:12px; line-height:12px; margin:5px; color:var(--tabs-color)(#fff); display:block; border:1px solid transparent; transition: color/background-color/border-color 0.15s ease-in-out`.
- **Active** (`.nav-link.active`): `background-color: var(--tab-active-bg) (#45a2ff); border-color:transparent; border-radius:3px; color: var(--note-tabs-color) (#fff)`.
- **Hover** (`.nav-link:hover`): `border:1px solid var(--tabs-border-color) (#0a6db1); border-radius:3px; cursor:pointer`. Active tab hover: `cursor:default`.

The Notes-tab special case: `.mainTabset #presAreaTabs-notes.active` (and `.nav-item.show`) gets `background-color: var(--notes-tabs-bg) (#0c2434)`.

#### Screen sub-tab bar `#screenTabs.nav.nav-tabs.screens-tabs`

- Rect **431,90 1558×40**. `display:flex; position:relative; z-index:1; background-color: var(--notes-tabs-bg) (#0c2434); border-color:transparent`.
- Per-screen `li.nav-item.ng-star-inserted` 138×40 starting x=431 (one li per active screen-share; repeats `ng-star-inserted`).
- Active screen tab `a#<screenId>-tab.nav-link.active` 436,95 **128×30**: same active styling (`#45a2ff` bg, 3px radius, white). `.screens-tabs .nav-link` overrides padding to **4px** (vs 0.5rem on main/note tabs).
  - `img.presenter-img` 441,100 **20×20** — gravatar (`src="https://secure.gravatar.com/avatar/<hash>?d=mm&s=20"`, `d=mm` fallback).
  - `span.mx-1` 465,102 68×14 — presenter display name (white, 12px).
  - `div.d-inline-block` → `span#dropdownMenuScreen.dropdown-toggle` 537,102 22×14 → `i.fas.fa-cog` 12×12 (per-screen settings cog).
- Right-aligned zoom group `li.nav-item.ms-auto.ng-star-inserted` 1895,90 94×40 (the `ms-auto` pushes it to the far right; `ng-star-inserted` = conditionally rendered).

#### Zoom / capture controls

`div.zoom-controls-container.position-relative` 1895,94 **94×31**, **opacity:0.5** (dimmed/idle state at capture). Three dark buttons:

| Button | Rect | Icon `<i class>` | FA glyph | Purpose |
|---|---|---|---|---|
| Zoom | 1895,94 32×31 | `icon fas fa-search` | `\f002` | zoom into screen |
| Snapshot | 1927,94 32×31 | `icon fas fa-camera` | `\f030` | capture screenshot |
| Fullscreen | 1959,94 30×31 | `icon fas fa-expand` (`ng-star-inserted`) | `\f065` | enter fullscreen |

Buttons = `.btn.btn-sm.btn-dark`: `display:inline-block; color:#fff; cursor:pointer; height:31px; transition: color/background-color/border-color/box-shadow 0.15s ease-in-out`. Icon `<i>` font-size **14px**, weight 900, white.

#### Screen content surface (the actual screen-share / video)

| Element | Rect | CSS |
|---|---|---|
| `div#screensTabsContent.tab-content` | 431,130 1558×1035 | the screen viewport (below the 40px screen-tab strip) |
| `div#<screenId>.tab-pane.fade.show.active` | 431,130 1558×1035 | `transition: opacity 0.15s linear` (Bootstrap tab fade) |
| `app-screenshare-view.h-inherit` | 431,130 1558×1035 | `height:100%` |
| `div.position-relative.h-inherit.overflow-hidden.screencast-pan` | 431,130 1558×1035 | `appdoubleclick` directive; clips pan/zoom overflow |
| `pan-zoom.h-inherit` → `div.pan-zoom-frame` | 431,130 1558×1035 | pan/zoom container |
| `div.pan-element` | 431,130 1558×1035 | `position:absolute; transform:matrix(1,0,0,1,0,0)` (pan offset) |
| `div.zoom-element` | 431,130 1558×1035 | `transform:matrix(1,0,0,1,0,0)` (zoom scale) |
| `div#video-screen-container-<screenId>.video-screen-container` | 431,130 1558×1035 | `position:relative` video wrapper |
| `video#webcamScreen-<screenId>.webcamScreen` | 431,130 1558×1035 | the actual stream |

`<video>` attrs: `autoplay="autoplay" muted="true" playsinline data-ng-dblclick="fullScreen()"`. Double-clicking the video toggles fullscreen (mirrors the expand button + the `appdoubleclick` directive on `.screencast-pan`).

---

### 04.3 BEHAVIOR — interactive elements

#### Main tab switching (Bootstrap 5 tabs)

All four main tabs use `data-bs-toggle="tab"` with `data-bs-target` + `role="tab"` + `aria-controls` + `aria-selected`:

| Tab | `data-bs-target` | `aria-controls` | `aria-selected` (captured) | Icon `<i>` | FA glyph |
|---|---|---|---|---|---|
| `#screens-tab` | `#screens` | `screens` | `true` (active) | `fas fa-desktop` | `\f108` |
| `#streams-tab` (hidden) | `#streams` | `streams` | — | (stream icon) | — |
| `#notes-tab` | `#notes` | `notes` | `false` | `i#noteChangeIndicator.fas.fa-edit` | `\f044` |
| Files (no id) | `#files` | `files` | `false` | `fas fa-folder` | `\f07b` |

- **`#noteChangeIndicator`** (the Notes tab's `fa-edit` icon, id'd separately): a runtime hook that flags unsaved/changed notes (color toggles between `#ccc` idle and an alert color when notes change).
- Icon font-size 12px weight 900; tab label `span` (`.ml-1` on Screens, `.mx-1` on Notes/Files) at 12px.

#### Screen sub-tab cog dropdown

`span#dropdownMenuScreen.dropdown-toggle` carries `data-bs-toggle="dropdown" aria-expanded="false"` → Bootstrap dropdown for per-screen options (rename/remove screen etc.). Its `::after` is the dropdown caret (`content:""`, `font-family:"Open Sans"`, 12px, weight 300, white). Dropdown menu themed via `--tabs-dropdown-bg` (#0f2e43) / `--tabs-dropdown-color` (#45a2ff).

#### Zoom controls

Three `<button>`s (search/zoom, camera/snapshot, expand/fullscreen) — `cursor:pointer`, dark style, container at `opacity:0.5` until hovered/active. Fullscreen also reachable via `<video>` double-click (`data-ng-dblclick="fullScreen()"`).

#### Links

Global `a` = `color: var(--app-link-color) (#45a2ff)` for link/visited/active; legacy rule sets `rgb(0,188,140)` (teal) but token override wins. `.nav-link` resets `text-decoration:none` and `transition:none`.

---

### 04.4 SUBSECTIONS — hidden panes (reconstructed for 1:1 rebuild)

These panes were not expanded at capture (0×0); structure inferred from tab IDs in `targeted.json` and theme tokens.

#### Streams pane (`#streams` / `#streamsTabs.nav.nav-tabs.screens-tabs`)
Same chrome as the Screens pane: a `.screens-tabs` strip (`background:#0c2434; position:relative; z-index:1`) with per-stream `.nav-link` pills (active `#45a2ff`, 3px radius, white). The whole **Streams main tab is hidden** in this admin config (`li:nth-child(2)` of `#mainTabs`, 0×0). Rebuild the bar identically to `#screenTabs`.

#### Notes pane (`#notes` / `#notesTabs.nav.nav-tabs.noteTabset`)
- Tab strip `.noteTabset`: `border-color:transparent; display:flex; align-items:center; justify-content:center; background-color: var(--notes-tabs-bg) (#0c2434); border-top: 1px solid var(--tabs-border-color) (#0a6db1)`. Note links: `.noteTabset .nav-link` = `padding:0.5rem; font-size:12px; line-height:12px; margin:5px`, active = `#45a2ff` pill / white text.
- **Editor = Summernote** (the `summernote` @font-face is loaded). Editor canvas: `--note-text-bg #fff`, body text `--note-text-color #676767`. Options/toolbar bar: `--note-options-bg #f4f4f4`, text `--note-options-color #fff`, hover `--note-options-hover-color #212529`.
- **Welcome / empty state**, **rename**, **download**, **next/delete** actions per tokens: download/next button `--note-download-bg / --note-next-bg` = `#92d528` / `#45a2ff`; delete button `--note-delete-bg #bb352a`. The Notes main tab carries the live-change indicator `#noteChangeIndicator` (`fa-edit \f044`).

#### Files pane (`#files` / `#myTab.nav.nav-tabs.files-tabs`)
- Tab strip `.files-tabs`: `display:flex !important; justify-content:center !important; align-items:center; border-color:transparent; background-color: var(--notes-tabs-bg) (#0c2434)`. This holds the **Files / Images / Sounds sub-tabs** (`#files-tab` is the first, `class="nav-link d-flex align-items-center justify-content-between active"` — `aria-controls=files`).
- `.files-tabs .nav-link` = `padding:5px 10px; margin:5px; font-size:12px`; active = `#45a2ff` pill, white, 3px radius; hover = `1px solid #0a6db1`, 3px radius.
- **Count badge** `span.badge.rounded-pill.bg-danger.files-badge`:
  - `.badge`: `display:inline-block; padding:.35em .65em; font-size:.75em; font-weight:700; line-height:1; text-align:center; white-space:nowrap; vertical-align:baseline; border:1px solid rgb(0,0,0); transition:none`.
  - `.bg-danger` (overridden): `background-color: rgb(231,76,60) !important` (a coral-red, NOT the `--bs-danger-rgb 220,53,69` default).
  - `.rounded-pill`: `border-radius: var(--bs-border-radius-pill) (50rem)`.
  - `.files-badge` (component): `margin-top:-9px; margin-left:3px` (notch up-right onto the sub-tab label).
  - `.badge:empty { display:none }` → badge hides when count is 0.
- **File list rows** (per tokens): striped `--file-list-even-bg #f4f4f4` / `--file-list-odd-bg #fff`; file name link `--file-name-color #0a6db1`; size `--file-size-color #b2b2b2`; per-row download `--file-download-bg #92d528`, delete `--file-delete-bg #bb352a`; "see more" button `--file-see-more-bg #45a2ff`. Search bar: `--file-searchbar-bg #fff`, text `#b7b7b7`, icon `#666666`.

---

### 04.5 FA icon inventory (this surface)

| Element | Class | Glyph | Weight |
|---|---|---|---|
| Screens main tab | `fas fa-desktop` | `\f108` | 900 |
| Notes main tab (`#noteChangeIndicator`) | `fas fa-edit` | `\f044` | 900 |
| Files main tab | `fas fa-folder` | `\f07b` | 900 |
| Per-screen cog | `fas fa-cog` | `\f013` | 900 |
| Zoom button | `icon fas fa-search` | `\f002` | 900 (14px) |
| Snapshot button | `icon fas fa-camera` | `\f030` | 900 (14px) |
| Fullscreen button | `icon fas fa-expand` | `\f065` | 900 (14px) |

All icons render via `::before` content, `font-family:"Font Awesome 5 Free"`, weight `900`. Tab-row icons 12px / `#fff` or `#ccc`; zoom-group icons 14px / `#fff`.

---

### 04.6 Rebuild checklist (Svelte 5)

- Outer panel: full-height right split, `background:#0f2e43`, `overflow:hidden`.
- Main tab bar: flex centered, transparent border, 12px Lato labels with leading FA icon; active pill `#45a2ff`/white/3px radius; Streams tab gated off in admin.
- Screen sub-tab strip: `#0c2434` bg, `z-index:1`, per-screen pill with 20×20 gravatar + name + cog dropdown; zoom/snapshot/fullscreen group right-aligned (`margin-left:auto`), container `opacity:.5` idle.
- Screen surface: nested pan/zoom (`transform: matrix(...)` on pan-element + zoom-element), `<video autoplay muted playsinline>` filling 1558×1035, double-click → fullscreen.
- Notes = Summernote-style WYSIWYG on white canvas, `#676767` text, `#f4f4f4` toolbar; download/next green/blue, delete `#bb352a`.
- Files = centered Files/Images/Sounds sub-tabs with empty-hiding coral pill count badge (`rgb(231,76,60)`, `margin:-9px 0 0 3px`), striped list rows.
- **No shadows** (`box-shadow:none !important` globally). All transitions 0.15s.

---


<a id="05"></a>

## 05 — Webcams (`app-webcam-holder` / `app-presenter-cams`)

> Reference spec for the ADMIN trading-room webcam surface, reconstructed from the captured DOM+CSS slice `_slices/subtree-webcams.json` (rootPath `as-split#mainAreaSplit > as-split-area.presentation-box > app-webcam-holder`), cross-referenced against `_slices/targeted.json` (authoritative `matchedRules`) and `_slices/theme.json` (design tokens). THIRD-PARTY VISUAL REFERENCE — structure/layout/CSS/behavior only.

### Scope note / what this surface is

The webcam surface is the floating, draggable presenter-camera layer that sits **on top of** the presentation/screenshare area inside the right-hand split pane (`as-split-area.presentation-box`, the 2nd split child). It is **not** the screenshare itself: the screenshare viewer, its expand/zoom/cog dropdown controls, and the floating screenshare preview live in `subtree-presentation.json` (component `app-screenshare-view`, ids `dropdownMenuScreen`, `fas fa-expand`, etc.) — **none of those nodes exist in this subtree**. The webcam surface owns only: the holder card(s), the `<video>` element, the name-label overlay, and a single close (`fa-times`) control per tile.

At capture time the webcam tiles are in a **collapsed / no-active-cam state**: the holder card's computed `bottom: -250px` parks it just below the viewport (tile top edge at `y≈1171`, viewport height `1166`), and the wrapper has `height:0`. There is therefore **no rendered no-video avatar placeholder node** in the slice (the avatar would occupy the empty `<video>` region when a presenter is connected but camera-off; it is documented below as the expected empty-state, inferred from layout, not captured).

---

### 1. STRUCTURE — DOM hierarchy / Angular component tree

Full ancestry (Angular component view-encapsulation id for this subtree is `_ngcontent-ng-c4054903792`; the wrapper above it carries `_ngcontent-ng-c654575438`):

```
as-split#mainAreaSplit
└─ as-split-area.presentation-box.as-split-area:nth-child(2)
   └─ app-webcam-holder                         (host, no class)        rect 431,49,0,0
      └─ div.webcam-wrapper.d-flex.justify-content-center
              .flex-wrap.align-items-end.w-100   [ng-c654575438]         rect 431,1166,1558,0
         ├─ app-presenter-cams:nth-child(1)      (host, no class)        rect 1210,1166,0,0
         │  └─ div#webcamsHolder-.card.webcamsHolder  [ng-c4054903792]   rect 1215,1171,320,240
         │     ├─ video#webcamVideo-.webcamsHolderVideo  (autoplay)      rect 1216,1172,318,238
         │     └─ div.overlay:nth-child(2)        [ng-c4054903792]       rect 1216,1172,318,0
         │        └─ h5.pNameLabel.m-0:nth-child(1)                      rect 1216,1172,318,0
         │           └─ span.closeIcon:nth-child(1)                      rect 1515,1172,14,24
         │              └─ i.fas.fa-times:nth-child(1)                   rect 1515,1174,14,20
         └─ app-presenter-cams:nth-child(2)       (host, no class)       rect 1210,1166,0,0
            └─ … (same internal structure as above, one tile per presenter)
```

Element-order notes:
- Inside `div#webcamsHolder-` the `<video>` is child 1 and `div.overlay` is child 2 (`:nth-child(2)`) — **video first, overlay painted above it** via z-index, not source order.
- `div.webcam-wrapper` is the single positioning container; **each presenter is its own `app-presenter-cams` instance**, repeated as siblings inside the wrapper (the `flex-wrap` lets multiple tiles wrap to new rows). The slice captured one tile twice (two capture passes of the same DOM); the real tree is N `app-presenter-cams`, one per connected presenter camera.
- `id="webcamsHolder-"` and `id="webcamVideo-"` end with a trailing hyphen → these are Angular string-interpolated ids of the form `webcamsHolder-{presenterId}` / `webcamVideo-{presenterId}` where the id was empty/unbound in this capture. **Rebuild as `webcamsHolder-${peerId}` etc.**

Component inventory (Angular `app-*` custom elements in this surface):

| Tag | Role | Class |
|---|---|---|
| `app-webcam-holder` | Surface host; owns the wrapper + drag logic | (none) |
| `app-presenter-cams` | One per presenter; renders a single draggable cam tile | (none) |

---

### 2. LAYOUT — geometry + computed CSS + tokens

#### Container chain

| Element | position | rect (x,y,w,h) | key box props |
|---|---|---|---|
| `app-webcam-holder` | host | 431,49,0,0 | zero-box host (children positioned absolutely) |
| `div.webcam-wrapper` | `absolute; bottom:0` | 431,1166,1558,0 | `display:flex` · `justify-content:center` · `flex-wrap:wrap` · `align-items:flex-end` · `width:100%` |
| `app-presenter-cams` | host | 1210,1166,0,0 | zero-box host |
| `div#webcamsHolder-` (.card.webcamsHolder) | `absolute; z-index:105` | 1215,1171,320,240 | see card table below |
| `video.webcamsHolderVideo` | `relative` | 1216,1172,318,238 | `object-fit:contain` · `width:100%` · `height:100%` |
| `div.overlay` | `absolute; top:0;left:0;right:0; z-index:101` | 1216,1172,318,0 | spans tile width, pinned to top |
| `h5.pNameLabel.m-0` | static (in overlay) | 1216,1172,318,0 | `width:100%` · `text-align:center` |
| `span.closeIcon` | `absolute; z-index:102` | 1515,1172,14,24 | `right:5px; top:0` |
| `i.fas.fa-times` | static | 1515,1174,14,20 | inline-block glyph |

**Wrapper authoritative rule** (`targeted.json`):
`.webcam-wrapper[_ngcontent-ng-c654575438] { position: absolute; bottom: 0px; }`
plus Bootstrap utilities: `.d-flex{display:flex!important}` · `.w-100{width:100%!important}` · `.flex-wrap{flex-wrap:wrap!important}` · `.justify-content-center{justify-content:center!important}` · `.align-items-end{align-items:flex-end!important}`.
→ Tiles are bottom-anchored, horizontally centered, and wrap upward as more presenters join.

#### The holder card — `.card.webcamsHolder`

Authoritative custom rule (`targeted.json`):
```css
.webcamsHolder[_ngcontent-ng-c4054903792] {
  position: absolute;
  z-index: 105;
  border: 1px solid yellowgreen;     /* yellowgreen = rgb(154,205,50) */
  cursor: move;
  background-color: rgb(0, 0, 0);
  width: 320px;
  height: 240px;
  margin: 5px;
}
```
This sits on top of Bootstrap `.card` (which it overrides): base `.card` would give `background-color:#303030` (`rgb(48,48,48)`, dark-theme override of `--bs-card-bg`) and `border-radius:.25rem`, but the custom rule's `background:#000` and `border:yellowgreen` win on color; the **border-radius comes through from `.card` → computed `6px`** (`border-*-radius: 6px` on all corners — note `0.375rem` token would be 6px; the computed shows 6px so `--bs-border-radius` resolves to 6px here).

| Computed prop | Value | Source / token |
|---|---|---|
| `position` | `absolute` | `.webcamsHolder` |
| `z-index` | `105` | `.webcamsHolder` (above overlay 101 / closeIcon 102) |
| `width` / `height` | `320px` / `240px` | `.webcamsHolder` (4:3) |
| `margin` | `5px` (all sides) | `.webcamsHolder` |
| `background-color` | `rgb(0,0,0)` | `.webcamsHolder` |
| `border` | `1px solid rgb(154,205,50)` | `.webcamsHolder` (`yellowgreen`) |
| `border-radius` | `6px` all corners | `.card` → `--bs-border-radius` |
| `box-shadow` | `none` | reset rule `*{box-shadow:none!important}` |
| `display` / `flex-direction` | `flex` / `column` | `.card` |
| `cursor` | `move` | `.webcamsHolder` (draggable) — **inherited by all descendants** (video, overlay, closeIcon, icon all compute `cursor:move`) |
| `color` | `rgb(33,37,41)` | `--bs-body-color` (#212529) |
| `font-family` | `"Open Sans", sans-serif` | room base font |
| `font-size` / `line-height` / `weight` | `16px` / `24px` / `300` | room base |
| `transition` | `all` | drag/move animation |
| `transform-origin` | `160px 120px` | center of 320×240 |
| Positioning at capture | `top:0; bottom:-250px; left:778.969px; right:448.969px` | parked below viewport (collapsed state) — JS drag sets `left/top` inline at runtime |

#### The video — `.webcamsHolderVideo`

Authoritative rule:
```css
.webcamsHolderVideo[_ngcontent-ng-c4054903792] {
  object-fit: contain;
  position: relative;
  width: 100%;
  height: 100%;
}
```
Computed: `318×238` (fills card minus 1px border each side), `object-fit:contain`, `background:transparent` (`rgba(0,0,0,0)` — the black card shows through letterbox bars), `display:block`, `border:0`, `border-radius:0`. Attribute `autoplay="autoplay"`. No `controls`, no `muted`, no `poster` attribute captured. `transform-origin:159px 119px`.

#### The overlay + name label

`div.overlay` rule:
```css
.overlay[_ngcontent-ng-c4054903792] { position: absolute; top: 0px; left: 0px; right: 0px; z-index: 101; }
```
Pinned to the top edge of the tile, full width, height collapses to its content (the label). z-index 101 (above the relatively-positioned video, below closeIcon 102).

`h5.pNameLabel.m-0` rule:
```css
.pNameLabel[_ngcontent-ng-c4054903792] {
  background-color: rgba(0, 0, 0, 0.5);
  color: rgb(255, 255, 255);
  text-align: center;
  width: 100%;
}
```
Bootstrap layers under it: `h5` → `font-size:1.25rem` (20px) computed, `font-weight:500`, `line-height:1.2`, `margin-bottom:0.5rem` — then `.m-0{margin:0!important}` zeroes all margin. `--bs-heading-color` token is empty so color falls to the rule's white. Net: a **semi-transparent black bar across the top of the tile, centered white presenter name, 20px / 500 weight, no margin**. (This holds the presenter's display name; render OUR own placeholder text, never copy theirs.)

#### Token summary applied to this surface

| Token | Value | Where used |
|---|---|---|
| `--bs-body-color` | `#212529` (`rgb(33,37,41)`) | card text color |
| `--bs-body-bg` / `--bs-card-bg` | `#fff` (overridden to `#303030` by dark `.card`) | base card bg (overridden to `#000` by `.webcamsHolder`) |
| `--bs-border-radius` | `.375rem` → computed 6px | card corner radius |
| `--bs-border-width` | `1px` | base card border width |
| `--bs-heading-color` | (empty) | h5 falls back to `.pNameLabel` white |
| literal `yellowgreen` | `rgb(154,205,50)` | tile border (the room's "active presenter" accent) |
| literal `rgba(0,0,0,.5)` | — | name-label bar bg |
| Global reset | `*,::before,::after{box-sizing:border-box; text-shadow:none!important; box-shadow:none!important}` | kills all shadows on the surface |

Fonts available (`theme.json`): `"Open Sans", sans-serif` (body), `Font Awesome 5 Free` (weight 900 loaded — used by the close icon), `Lato`, `summernote` (unloaded).

---

### 3. BEHAVIOR — interactive elements

| Element | Interaction | FA icon | aria / role / attrs | state |
|---|---|---|---|---|
| `div#webcamsHolder-` (tile) | **Draggable** — `cursor:move` on the card and inherited by every child; `transition:all` + `transform-origin` center indicate JS-driven drag repositioning (sets inline `left`/`top`). No `data-bs-*` / no `role`. | — | only `_ngcontent` marker + `id="webcamsHolder-{id}"` | `position:absolute z-105`; capture shows it parked off-screen (`bottom:-250px`) = collapsed |
| `video#webcamVideo-` | Media element, `autoplay`. Click target inherits `cursor:move` (drag, not play/pause). | — | `autoplay="autoplay"`, `id="webcamVideo-{id}"`; no `controls`/`muted`/`loop`/`poster` | plays presenter stream; transparent bg → black letterbox when `contain` |
| `span.closeIcon` | **Close / remove this cam tile** (click handler on the span). `absolute; right:5px; top:0; z-index:102; text-align:center; width:13.75px; height:24px`. Cursor inherits `move`. | wraps `fa-times` | no `title`/`aria-label`/`role` captured — unlabeled icon button (accessibility gap to improve in OUR build: add `aria-label` + `role="button"`) | color `rgb(255,255,255)`, `font-size:20px`, `font-weight:500` |
| `i.fas.fa-times` | The X glyph itself. `display:inline-block`, `font-family:"Font Awesome 5 Free"`, `font-weight:900`, `font-size:20px`, `color:#fff`, `13.75×20`. | `fas fa-times` (U+F00D) | `::before { content:"\f00d"; font-family:"Font Awesome 5 Free"; font-weight:900; font-size:20px; color:rgb(255,255,255); background:transparent }` | rendered via `::before` glyph |

Notes on absent controls: **no expand / minimize / maximize / fullscreen / dropdown / cog / mute / pin** control exists on the webcam tile in this slice. The only per-tile control is the single white `fa-times` close icon top-right. (Expand `fas fa-expand`, cog dropdown `dropdownMenuScreen`, zoom/pan all belong to the separate `app-screenshare-view` presentation surface.) No `:hover` rule for `.closeIcon` was captured (the close icon's specific selector did not surface in `targeted.json` matchedRules — only universal `*`/`h5` rules attached — so hover styling, if any, is unconfirmed; default is no shadow per the global `box-shadow:none!important` reset).

---

### 4. SUBSECTIONS — rebuild parts 1:1

**4.1 Surface host (`app-webcam-holder` + `.webcam-wrapper`)**
- Render `app-webcam-holder` as a zero-box host inside the presentation split pane.
- Inside it, one `div.webcam-wrapper` with classes `d-flex justify-content-center flex-wrap align-items-end w-100` **and** the scoped rule `position:absolute; bottom:0`. This bottom-anchors the camera row to the floor of the presentation area, centers tiles, wraps upward, and bottom-aligns each tile.

**4.2 Presenter tile (`app-presenter-cams` → `.card.webcamsHolder`)**
- One `app-presenter-cams` host per connected presenter (loop over presenters).
- Inside, `div.card.webcamsHolder#webcamsHolder-${peerId}`: `320×240`, `absolute`, `z-index:105`, `1px solid yellowgreen` border, `border-radius:6px`, `background:#000`, `margin:5px`, `cursor:move`, `transition:all`, JS-set inline `left`/`top` for drag. Children laid out `flex column`.

**4.3 Video (`.webcamsHolderVideo`)**
- `<video id="webcamVideo-${peerId}" autoplay>` filling the card (`width:100%;height:100%;object-fit:contain;position:relative`). Transparent bg → black card shows as letterbox bars. Attach the presenter MediaStream as `srcObject` at runtime.

**4.4 No-video avatar placeholder (empty state — inferred, not in slice)**
- When the presenter is connected but camera-off, the `<video>` shows nothing and the black `#000` card is the backdrop. The reference's avatar/initials placeholder would be centered inside the card region (same `318×238` box) above the video / under the overlay. **Not captured in this slice** (tiles were collapsed); in OUR build implement a centered avatar (e.g. circular initials on the black card) sized to the tile, never reusing their imagery.

**4.5 Name-label overlay (`.overlay` → `h5.pNameLabel.m-0` → `.closeIcon` → `i.fas.fa-times`)**
- `div.overlay`: `absolute; top:0; left:0; right:0; z-index:101` — top strip spanning tile width.
- `h5.pNameLabel.m-0`: full-width centered bar, `background:rgba(0,0,0,.5)`, `color:#fff`, `font-size:20px`, `font-weight:500`, `margin:0`. Holds the presenter display name (OUR placeholder text only).
- `span.closeIcon`: `absolute; right:5px; top:0; z-index:102`, white, `font-size:20px`; click = remove/close this cam. Wrap an `<i class="fas fa-times">` rendering the X via `::before content:"\f00d"` in Font Awesome 5 Free weight 900. Add `aria-label="Close camera"` + `role="button"` in OUR rebuild (reference omits it).

**4.6 Floating screenshare / recording preview**
- **Not present in this surface.** Lives in `subtree-presentation.json` (`app-screenshare-view`, `dropdownMenuScreen`, `fas fa-expand`, pan/zoom). Documented in the presentation section, not here.

---

### Rebuild gotchas (this stack)
- Tile drag is JS-driven via inline `left`/`top` + `transition:all`; the `bottom:-250px` in the capture is a collapsed/parked state, not the resting position — resting position is bottom-anchored centered by the wrapper.
- The `yellowgreen` (`rgb(154,205,50)`) border is a literal, not a token — treat as the "active presenter" accent and define a token for it in OUR theme.
- `border-radius` is inherited from Bootstrap `.card` (6px), not declared on `.webcamsHolder`.
- All shadows are killed globally (`box-shadow:none!important`); do not add tile shadows.
- The close icon has no accessible name in the reference — add one in OUR build.
- Use `<video autoplay>` with `srcObject`; no `controls` (drag, not scrub).

---


<a id="06"></a>

## 06 — Alerts & Chat Dock (left column)

> **Source:** `_slices/elements-alerts.json` (2349 nodes), cross-referenced with
> `_slices/elements-other.json` (chat composer), `_slices/targeted.json`
> (matchedRules) and `_slices/theme.json` (design tokens).
> **Viewport:** 1989 × 1166. The dock is the **leftmost column**, full height
> below the 49px top-nav.
> **Third-party visual reference only** — structure / layout / CSS / behaviour
> are documented for 1:1 rebuild; their text and user data are NOT to be copied
> into our product.

The slice is dominated by repeated rows: **124 `app-st-message`** elements
(deduped below to their distinct structures), **407 `<img>`**, **153 `<span>`**,
**125 `<strong>`**, **50 `<button>`**. Only the structural skeleton and the
**distinct** row anatomies are reproduced here.

---

### 6.1 Column shell & split geometry

The dock is one `as-split-area` of the page-level `as-split#mainAreaSplit`,
internally split **vertically** into Alerts (top) and Chat (bottom) by a nested
`as-split`.

| Element | tag | class | rect (x,y,w,h) | notes |
|---|---|---|---|---|
| Dock column | `as-split-area` | `alert-chat-box alert-chat-regular as-split-area` | 0, 49, **420**, 1117 | computed `width: 420.055px`; `min-size=0` |
| Inner split | `as-split` | `as-percent as-vertical as-init` | 0, 49, 420, 1117 | vertical splitter (Alerts over Chat) |
| Alerts area | `as-split-area` | `alert-box as-split-area` | 0, 49, 420, **900** | `height: 900.305px` |
| └ component | `app-alerts` | — | 0, 49, 420, 900 | |
| Chat area | `as-split-area` | `chat-box as-split-area` | 0, **960**, 420, **206** | `height: 205.695px` |
| └ component | `app-chat` | — | 0, 960, 420, 206 | |

There is a **~11px draggable gutter** between the two areas (Alerts bottom = 949,
Chat top = 960). Both areas are `display:block`, `color: rgb(204,204,204)`
inherited, `font: 300 16px/24px "Open Sans", sans-serif`.

**Angular component tree (left column):**

```
as-split#mainAreaSplit
└─ as-split-area.alert-chat-box.alert-chat-regular        (420×1117 @ y=49)
   └─ as-split.as-percent.as-vertical.as-init
      ├─ as-split-area.alert-box                          (420×900)
      │  └─ app-alerts
      │     ├─ div.bs-component
      │     │  └─ nav.navbar.navbar-expand-lg.navbar-light.chat-nav.p-1.alertHeader
      │     └─ app-roomscroller#chatScrollViewParentAlerts (420×852 @ y=97)
      │        └─ div > app-st-message × N               (alert rows)
      └─ as-split-area.chat-box                            (420×206)
         └─ app-chat
            └─ div.chat.d-flex.flex-column.h-100
               ├─ div.bs-component
               │  └─ nav.…chat-nav.p-1.chatHeader
               ├─ app-roomscroller.chat-uploaded-img-sm   (chat rows)
               └─ [div#textAreaHolder.textSendDiv]         (composer — see 6.5)
```

---

### 6.2 ALERTS panel header (`nav.alertHeader`)

`<nav class="navbar navbar-expand-lg navbar-light chat-nav p-1 alertHeader">`
wrapped in `div.bs-component`.

| Prop | Value | Token |
|---|---|---|
| rect | 0, 49, 420, **48** | |
| background-color | **`rgb(10,109,177)`** = `#0a6db1` (deep blue) | |
| color | `rgb(255,255,255)` | |
| font | `300 16px/24px "Open Sans"` | |
| padding | `4px` all sides (`p-1`) | |
| display / layout | `flex; flex-direction:row; align-items:center; justify-content:flex-start` | |
| border-bottom | white (`rgb(255,255,255)`), width 0 in capture | |

**Header children (left → right):**

| Order | Element | tag | class | rect | icon / attrs |
|---|---|---|---|---|---|
| Brand | Alerts brand link | `a` | `navbar-brand ml-1` | 8, 53, **79**, 40 | contains bell + "Alerts" label |
| └ bell | icon | `i` | `fas fa-bell me-1` | 8, 63, 18, 20 | FA solid bell, `me-1` right gap |
| Spacer | (auto) | `ul` | `nav ml-auto` | 355, 61, 61, 24 | pushes actions to right edge |
| Action 1 | Search | `li.nav-item.mx-1 > a.nav-link.p-0` | | 359, 61, 16, 24 | `i.fas.fa-search` (16×16); `title="Search"` |
| Action 2 | Settings | `li.nav-item.dropdown.ml-2 > a.nav-link.dropdown-toggle.p-0` | | 387, 61, **29**, 24 | `i.fas.fa-cog.chat-header-gear`; `title="Settings"`, `aria-haspopup="true"`, `aria-expanded="false"` |

- **Brand link** (`a.navbar-brand`): `.navbar-brand` = `display:inline-block;
  padding: .324219rem 0; margin-right:1rem; font-size: 1.17188rem; white-space:nowrap`.
  Under `.navbar-light`/`-dark` the brand colour is forced **white**. The
  brand carries the bell glyph **+ "Alerts" caption** (their text — do not copy
  literally).
- **No standalone "add/compose" button** is present in this capture; the alert
  composer is opened via the gear/settings dropdown or is an admin-only affordance
  not rendered in the captured slice. Document the **search + gear** pair as the
  only header actions.
- The settings control is a **Bootstrap dropdown** (`dropdown-toggle`,
  `aria-haspopup`) — clicking toggles `aria-expanded` and a dropdown menu.

---

### 6.3 ALERTS scroll body (`app-roomscroller#chatScrollViewParentAlerts`)

`rect 0, 97, 420, 852`. Contains `div > app-st-message.ng-star-inserted` rows.
Rows are positioned in a tall virtual scroll buffer (off-screen rows have large
negative `y`). **106 of 124 rows are normal (`flex-row`); 18 are
`flex-row-reverse`** (admin/own — relevant to the Chat panel; see 6.4). **7
date-separator rows** are interleaved.

#### 6.3.1 Distinct alert row signatures (deduped from 124)

| Count | Markers present | Meaning |
|---|---|---|
| 74 | bare (collapsed/off-screen render) | virtualised, body not materialised |
| 43 | avatar + Q&A + `.text-formated` | standard alert |
| 6 | + `separator` | first alert after a date divider |
| 1 | + `separator` + `stockColor` | alert opening with a ticker after a divider |

#### 6.3.2 Standard alert row anatomy (`app-st-message`)

```
app-st-message.ng-star-inserted
└─ div.msg-box.pb-1.ng-star-inserted                       (pb-1 = 4px bottom)
   └─ div
      └─ div.mr-1.d-flex.flex-row                          (avatar LEFT, content right)
         ├─ div.d-flex.justify-content-center.align-items-start  (avatar gutter, w=58)
         │  └─ div.avatar.pl-1                              (39×35, pl=4px)
         │     └─ img  alt="msg.avt"  (35×35, object-fit:cover, radius 0 → SQUARE)
         └─ div.w-100                                       (x=58, w=358)
            ├─ div.d-flex.justify-content-between.align-items-center   (header row, h=24)
            │  ├─ div.d-flex.align-items-center.justify-content-between
            │  │  └─ strong.username.mx-1                   (author name)
            │  └─ div.ng-star-inserted                      (right cluster, x≈294–301)
            │     ├─ button.btn.btn-sm.btn-secondary.me-1.alert-qa   (Q&A "?" badge)
            │     │  └─ i.fas.fa-question-circle
            │     └─ span.created-at.mr-2                   (timestamp)
            └─ div.d-flex                                    (body row)
               └─ div.msg-left.text-formated.preText.ml-2.mr-2.p-0   (rendered body)
                  ├─ span.stockColor                        (ticker, optional)
                  └─ img.uploaded-img                        (attached chart, optional)
```

**Avatar is on the LEFT** for alerts (gutter `div` width 58px, avatar 35×35 square,
gravatar `secure.gravatar.com/avatar/…?d=mm&s=50`). The **`avatar` div has
`padding-left:4px` and `border-radius:0`** (not circular).

**Per-part computed CSS:**

| Part | Selector | Key CSS |
|---|---|---|
| Username | `strong.username.mx-1` | color **`rgb(10,109,177)` `#0a6db1`** (role-blue; some rows `rgb(232,232,232)`/`rgb(215,215,215)` for muted roles); `font: 900 14px/21px "Open Sans"`; `mx-1` = 4px h-margin |
| Q&A "?" badge | `button.alert-qa` (`.btn-sm.btn-secondary`) | 18×19px; color `#fff`; **bg `rgb(108,117,125)`** (BS secondary gray); `font: 400 10px/15px`; padding `1px 3px`; `me-1` right gap; `title="Ask a question"`. Icon `i.fas.fa-question-circle` 10×10 |
| Timestamp | `span.created-at.mr-2` | color **`rgb(168,168,168)` `#a8a8a8`**; `font: 600 12px/18px`; `mr-2` = 8px right; inline; rect ≈ 85–92px wide |
| Body | `div.msg-left.text-formated.preText.ml-2.mr-2.p-0` | color **`rgb(103,103,103)` `#676767`** (`--lightTheme-msg-color`); `font: 100 13px/19.5px`; `white-space:pre-wrap`; `ml-2`/`mr-2` = 8px; width ≈ 342px |
| Ticker | `span.stockColor` | color `rgb(26,26,26)` `#1a1a1a`; `font: 700 13px/19.5px`; **`text-transform:uppercase`**; `white-space:pre-wrap`; inline |
| Attached image | `img.uploaded-img` | `max-width:300px; max-height:200px` (sample 300×193); `cursor:pointer`; src `cdn1.protradingroom.com/uploads/images/…` |

> **Q&A "?" badge position:** it sits **on the RIGHT side of the header row**,
> immediately *left of the timestamp* (badge x≈294–301, timestamp x≈316–323),
> inside the same `justify-content:between` flex row as the username (username
> on the far left). In this capture every badge is the **icon-only / unanswered**
> state (uniform 18px wide, no numeric count rendered). The component supports an
> answered/count variant (a count would widen the button and shift the timestamp
> right), but no answered example was captured.

#### 6.3.3 Date separator row

| Element | rect | CSS |
|---|---|---|
| `div.separator.ng-star-inserted` | 0, *, 420, **20** | `display:flex; text-align:center`; **bg `rgb(232,232,232)` `#e8e8e8`**; color `rgb(204,204,204)`; `font: 300 16px/24px`; height 19.5px; full column width |
| └ `a` (date label, centered) | ≈145–272, *, 124–130, 20 | color `rgb(55,60,66)` `#373c42` (= `--light-black` / `--lightTheme-msgs-separator-border-color`); `font: 300 13px`; transparent bg; no h-padding |

The separator is a horizontal divider band with a centered clickable date anchor.
No `::before`/`::after` content captured (the rule line is the band background,
not pseudo-elements).

#### 6.3.4 Reactions (alert/chat rows)

Reactions render as `span.badge.chat-reaction.ng-star-inserted` (36×20px):
color `rgb(103,103,103)`; transparent bg; `font: 700 12px`; padding `3px 6px`;
`margin-right:2px`; `display:inline-block`. The **add-reaction affordance** is
`i.far.fa-smile` (FA *regular* smile, 12×12) with
`ngbtooltip="Add Reaction"`, `placement="left"`. It appears **below the body**
inside the `div.w-100` content column.

---

### 6.4 CHAT panel chrome (`app-chat`, inside same column)

`div.chat.d-flex.flex-column.h-100` (0, 960, 420, 206) — a vertical flex stack:
header → roomscroller → composer.

#### 6.4.1 Chat header (`nav.chatHeader`)

`<nav class="navbar navbar-expand-lg navbar-light chat-nav p-1 chatHeader">`
in `div.bs-component`. Same blue chrome as the alerts header but smaller text.

| Prop | Value |
|---|---|
| rect | 0, 960, 420, 48 |
| background-color | **`rgb(10,109,177)` `#0a6db1`** |
| color | `rgb(255,255,255)` |
| font | `300 12px/18px "Open Sans"` (note: 12px here vs 16px on alertHeader) |
| padding | `4px` (`p-1`); `flex; align-items:center` |

**Children (left → right):**

| Element | tag | class | rect | icon / attrs |
|---|---|---|---|---|
| Comment brand | `a` | `navbar-brand ml-1 mr-1` | 8, 964, **16**, 40 | `i.fas.fa-comment` (16×16) — icon-only brand |
| Tabs list | `ul` | `nav nav-tabs flex-wrap flex-grow-1 justify-content-center chatTabs` | 28, 968, 330, 33 | `role="tablist"` |
| └ Tab 1 (active) | `li.nav-item > a.nav-link.active` | | 121, 968, 69, 33 | `data-bs-toggle="tab"`, `role="tab"` — **Main Chat** |
| └ Tab 2 | `li.nav-item > a.nav-link` | | 196, 968, 64, 33 | `data-bs-toggle="tab"`, `role="tab"` — **Off Topic** |
| Actions list | `ul` | `nav ml-auto align-items-center` | 358, 975, 58, 19 | |
| └ Search | `li.nav-item.mx-1 > a.nav-link.p-0` | | 362, 975, 16, 19 | `i.fas.fa-search`; `title="Search"` |
| └ Settings | `li.nav-item.dropdown.ml-2 > a.nav-link.dropdown-toggle.p-0` | | 390, 975, 26, 19 | `i.fas.fa-cog.chat-header-gear`; `title="Settings"`, `aria-haspopup="true"` |

**Chat tabs (`ul.chatTabs.nav-tabs`):**
- `.nav-tabs { border-bottom: 1px solid rgb(68,68,68) }`; `ul.chatTabs { margin-bottom:0 }`;
  `.chatTabs { border-color: var(--modal-active-tab-border-color) !important }`
  (= `#45a2ff`).
- Tabs centered (`justify-content-center`, `flex-grow-1`).

| Tab state | CSS |
|---|---|
| `a.nav-link.active` (Main Chat) | color `#fff`; **bg `rgb(69,162,255)` `#45a2ff`** (= `--tab-active-bg`); `font: 700 12px/18px`; padding `8px 5px 5px`; `border-bottom: 1px solid rgb(69,162,255)` |
| `a.nav-link` (Off Topic) | color `#fff`; **no background** (transparent); `font: 700 12px/18px`; same padding; transparent border-bottom |

The active tab is distinguished by the **solid `#45a2ff` fill**; inactive tabs
are bare white text on the blue header.

#### 6.4.2 Chat scroll body (`app-roomscroller.chat-uploaded-img-sm`)

Holds `app-st-message` rows in a virtual buffer (`div` 420×4027). **Chat rows use
direction-based alignment, NOT a Q&A button:**

| Row class | direction | meaning | sample CSS |
|---|---|---|---|
| `div.msg-box.pb-1` | `div.mr-1.d-flex.flex-row` | **incoming** (other users) — avatar/content LEFT-aligned | transparent bg |
| `div.msg-box.pb-1.msg-box-adm` | `div.mr-1.d-flex.flex-row-reverse` | **admin / own** message — content RIGHT-aligned | **bg `rgb(244,244,244)` `#f4f4f4`**; padding `2px 0 4px` |

Inner chat-row content (username/body) is collapsed in this capture; the visible
parts: `strong.username.mx-1` (`font:900 14px`), an inline
`div.d-inline-block.flex-shrink-1` adjacent badge/time slot, and the
`span.badge.chat-reaction` + `i.far.fa-smile` reaction (see 6.3.4).

> **Kebab/`msgMenu` side — key finding:** **No kebab / overflow-menu element
> exists anywhere in this capture** (no `fa-ellipsis*`, no `msgMenu`/`msg-menu`
> class on any of the 2349 nodes). Alert rows expose their per-row action as the
> **Q&A `?` button on the RIGHT of the header**; chat rows distinguish authorship
> by **flex direction** (own/admin = `flex-row-reverse`, content on the **right**;
> others = `flex-row`, content on the **left**) rather than a kebab. If a kebab is
> required for our build, it would belong on the **right** for chat-own rows and
> the same right-cluster as the Q&A badge for alert rows — but the reference
> renders none here.

---

### 6.5 CHAT composer (`div#textAreaHolder.textSendDiv`)

> Captured in `_slices/elements-other.json` (flattened paths). Sits at the bottom
> of the chat column, `y ≈ 1116–1161`.

```
div#textAreaHolder.d-flex.align-items-center.textSendDiv        (5,1116,410,45)
└─ div.flex-fill.d-flex.mx-0                                     (10,1121,400,35)
   ├─ div.px-0.flex-fill                                         (10,1121,319,35)
   │  └─ textarea#textAreaTxt.txt-area.form-control.border-0     (10,1121,319,35)
   └─ div.justify-content-center.d-flex.flex-row.align-items-…   (329,1121,81,35)
      ├─ span.textAreaBtns  (emoji)                              (329,1122,26,34)
      │  └─ i.far.fa-smile  ngbtooltip="Add Emojis" placement="left"   (334,1130,16,16)
      ├─ span.textAreaBtns  (image)                              (355,1122,26,34)
      │  └─ i.fas.fa-image  ngbtooltip="Upload an Image" placement="left" (360,1130,16,16)
      └─ span.textAreaBtns  (GIF)  ngbtooltip="Search for GIFs"  (381,1125,29,28)
         └─ span  "GIF" text label                               (386,1132,19,14)
```

| Part | Selector | Key CSS / attrs |
|---|---|---|
| Composer bar | `div#textAreaHolder.textSendDiv` | 410×45; **bg `rgb(255,255,255)` white**; padding `5px`; margin `0 5px`; `display:flex; align-items:center`; rounded card sitting on the column |
| Text input | `textarea#textAreaTxt.txt-area.form-control.border-0` | 319×35; color **`#676767`** (`--lightTheme-textarea-color`); bg white; `font: 400 14px/21px "Open Sans"`; padding `6px 5px`; `border:0`; `cursor:text`; **`placeholder="Type your message here.."`** |
| Emoji button | `span.textAreaBtns` + `i.far.fa-smile` | 26×34 hit area; icon 16×16; color **`#676767`** (`--textarea-holder-btns-color`); FA **regular** smile; `ngbtooltip="Add Emojis"` |
| Image button | `span.textAreaBtns` + `i.fas.fa-image` | icon 16×16, FA **solid** (weight 900); color `#676767`; `ngbtooltip="Upload an Image"` |
| GIF button | `span.textAreaBtns` + inner `span` "GIF" | 29×28; text label `font: 300 12px/18px`; color `#676767`; `ngbtooltip="Search for GIFs"` |

- The three action buttons are a right-aligned cluster (`x` 329 / 355 / 381) sharing
  class `textAreaBtns`, each `text-align:center`, `padding:5px`, color `#676767`.
- **No discrete "Send" button** is rendered in the resting state — send is
  keyboard-driven (Enter on `#textAreaTxt`); a send affordance would appear on
  focus/typing but was not captured. Tooltips use **ng-bootstrap** (`ngbtooltip`,
  `placement`), not native `title`, on the composer icons (vs `title=` on the
  header search/gear).

---

### 6.6 Design-token map (colours used in this surface)

| Hex / RGB | Where used | Token(s) |
|---|---|---|
| `#0a6db1` `rgb(10,109,177)` | both panel headers bg; alert username | (header-blue; no single named token — closest brand blue) |
| `#45a2ff` `rgb(69,162,255)` | active chat tab bg + border; tab border-color | `--tab-active-bg`, `--modal-active-tab-bg-color`, `--modal-active-tab-border-color`, `--sidebar-menu-active-color` |
| `#676767` `rgb(103,103,103)` | alert/chat body text; composer text & button icons; reaction badge | `--lightTheme-msg-color`, `--lightTheme-textarea-color`, `--textarea-holder-btns-color`, `--note-text-color` |
| `#a8a8a8` `rgb(168,168,168)` | `created-at` timestamp | (muted gray) |
| `#f4f4f4` `rgb(244,244,244)` | own/admin chat bubble bg (`msg-box-adm`) | (light surface) |
| `#e8e8e8` `rgb(232,232,232)` | date-separator band bg; some muted usernames | (separator surface) |
| `#373c42` `rgb(55,60,66)` | separator date-anchor text | `--light-black`, `--lightTheme-msgs-separator-border-color` |
| `#1a1a1a` `rgb(26,26,26)` | ticker `stockColor` | (near-black) |
| `rgb(108,117,125)` | Q&A `?` badge bg (BS secondary) | (Bootstrap `$secondary`) |
| `#00bc8c` `rgb(0,188,140)` | generic `<a>` link colour (theme default) | `--success`, `--green` |

**Fonts:** UI text = **"Open Sans", sans-serif** (weights 100/300/400/600/700/900
observed). Icons = **Font Awesome 5 Free** (`far`/`fas`; regular 400 + solid 900
loaded). `Lato` and `summernote` fonts are declared but unloaded on this surface.

---

### 6.7 Behaviour & interaction summary

| Element | Trigger | Behaviour |
|---|---|---|
| `a.navbar-brand` (Alerts / comment) | click | brand link (no observable target captured) |
| Search `a.nav-link` (both headers) | click | `title="Search"` → opens/expands in-panel search |
| Settings `a.nav-link.dropdown-toggle` (both headers) | click | Bootstrap dropdown; toggles `aria-expanded`, `aria-haspopup="true"` |
| Chat tab `a.nav-link` (Main Chat / Off Topic) | click | `data-bs-toggle="tab"`, `role="tab"` → switches chat channel; active gets `.active` + `#45a2ff` fill |
| Alert `button.alert-qa` | click | `title="Ask a question"` → opens Q&A on that alert (icon `fa-question-circle`) |
| `i.far.fa-smile` (in-row) | hover/click | `ngbtooltip="Add Reaction"` → reaction picker |
| `img.uploaded-img` | click | `cursor:pointer` → lightbox/expand attachment |
| Composer `textarea#textAreaTxt` | type | message input; Enter sends |
| Composer emoji `i.far.fa-smile` | click | `ngbtooltip="Add Emojis"` → emoji picker |
| Composer image `i.fas.fa-image` | click | `ngbtooltip="Upload an Image"` → file upload |
| Composer GIF `span` | click | `ngbtooltip="Search for GIFs"` → GIF search |

---


<a id="07"></a>

## 07 — Modals, Overlays & Dropdown Menus

> ⚠️ **CORRECTION (verified against the primary capture `cssVariables.root`):** the
> modal `--modal-*` token VALUES quoted throughout this section (and the §08/§10
> token tables) are WRONG — they list the room's navy/green palette by mistake.
> The modals are Bootstrap **"Darkly"** gray, independent of the light panels.
> Authoritative values from `proroom-ultra-admin-room.json → cssVariables.root`:
> `--modal-content-bg-color #303030`, `--modal-content-color #fff`,
> `--modal-content-border-color #444`, `--modal-tabs-border-color #444`,
> `--modal-active-tab-bg-color #222`, `--modal-active-tab-color #00bc8c`,
> `--modal-active-tab-border-color #444`, `--modal-btn-close-bg/-border #375a7f`,
> `--modal-btn-success-bg/-border #00bc8c`, `--modal-btn-danger-bg/-border #e74c3c`,
> `--modal-input-group-bg #444`, `--modal-upload-files-color #555`,
> `--modal-alert-link-color #00bc8c`, `--modal-btn-hover-opacity .9`.
> NOTE: the CHAT/screen tabs' `#45a2ff` active pill comes from `--tab-active-bg`,
> NOT `--modal-active-tab-bg-color` (the report conflates the two). The shipped
> Modal.svelte / layout.css `--modal-*` tokens already use these Darkly values.

Reference reconstruction of every modal/overlay/dropdown surface present in the admin trading-room DOM (viewport 1989×1166). Third-party visual reference only — structure / layout / CSS / behavior are documented; their copy and image data are NOT reproduced as ours.

The modals slice (`elements-modals.json`) contains 15 nodes: **5 modal/overlay TRIGGERS** (sidebar buttons + navbar mobile icon, all using Bootstrap 5 `data-bs-toggle="modal"`) and **9 chat image-lightbox triggers** (`div.img-container` with inline `onclick="openImageModal(...)"`). The actual modal *bodies* live collapsed/hidden in the DOM (`visible:false`); their authoritative inventory is reconstructed from `theme.json → inventory.modalsInDom` (33 modals worth of `modal-*` parts), `inventory.menus` (dropdown menus), and the modal-specific design tokens in `cssVariables.root`. Cross-referenced with `targeted.json` (volume dropdown + settings-modal tab matched rules).

---

### 7.1 Bootstrap 5 modal framework — shared shell

All modals in this app are Bootstrap 5 (`data-bs-*` API, not the legacy `data-toggle`). The framework primitives observed (`inventory.dataAttributes`): `data-bs-toggle`, `data-bs-target`, `data-bs-dismiss`, `data-bs-auto-close`, `data-keyboard`, `data-backdrop`.

**DOM skeleton (every modal):**

```
div.modal.fade  (id = #<modalId>, role=dialog, tabindex=-1, aria-hidden=true)
└─ div.modal-dialog[.modal-lg]            ← size class lives HERE
   └─ div.modal-content
      ├─ div.modal-header[.align-items-start]
      │  ├─ h5.modal-title (or h4)
      │  └─ button.btn-close.btn-close-white  (data-bs-dismiss="modal")
      ├─ div.modal-body[.py-0]
      └─ div.modal-footer[.text-center | .flex-nowrap]
```

**Shell computed CSS / tokens** (from `cssVariables.root` + palette):

| Part | Property | Value / token |
|---|---|---|
| `.modal` backdrop stacking | `z-index` | **1055** (modal), 1054 (backdrop) — palette zIndex counts confirm |
| `.modal-content` | `background-color` | `var(--modal-content-bg-color)` = **#103d5c** (dark navy) |
| `.modal-content` | `border-color` | `var(--modal-content-border-color)` = **#103d5c** |
| `.modal-content` | `color` | `var(--modal-content-color)` = **#f4f4f4** |
| `.modal-content` | `border-radius` | **6px** (dominant radius token; 245 uses) |
| `.modal-dialog` shadow | `box-shadow` | `rgba(0,0,0,0.5) 0 4px 20px 0` (the single non-reset shadow in palette) |
| backdrop | `background` | `rgba(0,0,0,0.5)` |
| body font | `font-family` | `"Open Sans", sans-serif` |

**Modal tabs** (modals that embed Bootstrap `nav-tabs`, e.g. General Settings):

| Selector | Property | Value / token |
|---|---|---|
| `.modal-content .nav-tabs .nav-link.active` | `border` | `1px solid var(--modal-active-tab-border-color)` = **#45a2ff** `!important` |
| `.modal-content .nav-tabs .nav-link.active` | `background-color` | `var(--modal-active-tab-bg-color)` = **#45a2ff** `!important` |
| `.modal-content .nav-tabs .nav-link.active` | `color` | `var(--modal-active-tab-color)` = **#fff** `!important` |
| `.modal-content .nav-tabs .nav-link.active` | `cursor` | `default` |
| `.modal-content .nav-tabs .nav-link:hover` | `cursor` | `pointer`; `border-color: var(--modal-active-tab-border-color) !important` |
| general `--modal-tabs-border-color` | | **#45a2ff** |

Measured active settings tab (`targeted.json` node 33, `#user-app-settings-tab`): `padding: 8px 16px`, `background-color: rgb(69,162,255)` (#45a2ff), `color: rgb(255,255,255)`, `border-top: 1px solid #45a2ff`, `border-radius: 6px (top corners)`, `font-size: 16px`.

**Modal-scoped button & input tokens** (`cssVariables.root`):

| Token | Value | Used by |
|---|---|---|
| `--modal-btn-close-bg` | **#0a6db1** | header/footer close button bg |
| `--modal-btn-close-border` | **#0a6db1** | close button border |
| `--modal-btn-success-bg` | **#92d528** | Save / Post Alert / Send Poll |
| `--modal-btn-success-border` | **#92d528** | success button border |
| `--modal-btn-danger-bg` | **#bb352a** | destructive actions |
| `--modal-btn-danger-border` | **#bb352a** | |
| `--modal-btn-hover-opacity` | **0.9** | all modal buttons :hover |
| `--modal-input-group-bg` | **#0a6db1** | input-group addon (Save chips) |
| `--modal-upload-files-color` | **#0a6db1** | upload links |
| `--modal-alert-link-color` | **#0a6db1** | links inside alert modals |

---

### 7.2 Modal trigger inventory (the 5 trigger nodes in the slice)

All triggers carry Angular's component-scope attribute `_ngcontent-ng-c977335924=""` (room shell component). Each is a Bootstrap modal launcher.

| # | Element | Trigger text / title | FA icon (`fa-*`) | `data-bs-target` (modal id) | Rect (x,y,w,h) |
|---|---|---|---|---|---|
| 0 | `button.btn.btn-sm.btn-secondary` | "Mobile App Info" | — (text button) | **#mobileAppInfoModal** | -182, 112, 115, 31 (sidebar, off-canvas) |
| 5 | `span.fas.fa-mobile.mr-1.mobile-info-app-btn` | title "Launch in Mobile App" | `fas fa-mobile` (glyph `\f10b`) | **#mobileAppInfoModal** | 70, 17, 10, 16 (navbar top) |
| 1 | `a.nav-link.sidebar-item` | title "Connectivity Check" | `fas fa-network-wired` | **#webrtc-troubleshooter-modal** | -243, 197, 236, 37 |
| 2 | `a.nav-link.sidebar-item` | title "General Settings" | `fas fa-cogs` | **#user-settings-modal** | -243, 245, 236, 37 |
| 3 | `a.nav-link.sidebar-item.ps-1` | title "Manage Muted Users" | `fas fa-comments` | **#mutedUsersModal** | -243, 336, 236, 37 |
| 4 | `a.nav-link.sidebar-item.ps-1` | title "Manage Followed Users" | `fas fa-users` | **#followedUsersModal** | -243, 374, 236, 37 |

Notes:
- Negative `x` for nodes 0–4 means the sidebar that hosts them is in its collapsed/off-canvas state at capture time (toggled by `span.sidebar-menu`, title "Open Sidebar"). The triggers exist in DOM but render off-screen left.
- `#mobileAppInfoModal` has **two** triggers: the labeled sidebar button (node 0) and the compact navbar phone icon (node 5).

**Trigger #0 — "Mobile App Info" button — computed CSS** (`btn-sm btn-secondary`):

| Property | Value |
|---|---|
| display | inline-block |
| width × height | 114.523px × 31px |
| padding | 4px 8px |
| background-color | `rgb(108,117,125)` (#6c757d = `--bs-gray-600`) |
| color | `rgb(255,255,255)` |
| border | `1px solid rgb(108,117,125)` |
| border-radius | 4px |
| font | `"Open Sans", sans-serif` 14px / 400 / line-height 21px |
| text-align | center |
| cursor | pointer |
| transition | `color/background-color/border-color/box-shadow .15s ease-in-out` |

**Trigger #5 — navbar mobile icon — computed CSS** (`fas fa-mobile mobile-info-app-btn`):

| Property | Value |
|---|---|
| display | block; width 10px × height 16px |
| margin-right | 4px (`.mr-1` = 0.25rem) |
| color | `rgb(255,255,255)` |
| font | `"Font Awesome 5 Free"` 16px / **900** / line-height 16px |
| `::before` content | `"\f10b"` (fa-mobile glyph), FA5 Free, weight 900, color #fff |
| matched | `.mobile-info-app-btn:hover { cursor: pointer; }` |

**Triggers #1–#4 — sidebar nav-link items — computed CSS** (`nav-link sidebar-item`):

| Property | Value |
|---|---|
| display | block; width 236px × height 37px |
| margin | `0 5px` (matched `.navbar-nav li a { margin: 0 5px; cursor: pointer; }`) |
| padding | `8px 0` |
| background | transparent |
| color | `rgb(103,103,103)` (#676767 = `--lightTheme-sidebar-wrapper-color`) |
| font | `"Open Sans", sans-serif` 14px / **700** / line-height 21px |
| text-align | start |
| cursor | pointer |
| (active variant) | `--sidebar-menu-active-color: #45a2ff` applies the blue active state |

The FA glyph on each `a.sidebar-item` precedes the title text via a child `<i class="fas fa-*">` (icon recorded in `node.icon`). FA5 Free, weight 900, applied through `.fas{font-family:"Font Awesome 5 Free"} .fas{font-weight:900}`.

---

### 7.3 Modal catalogue (reconstructed from `inventory.modalsInDom`)

`inventory.modalsInDom` enumerates 33 modal sub-trees. Grouping the `modal fade` roots by their `title` field and the `modal-dialog` size class yields the full modal set. All are `visible:false` at capture (none open).

| Modal title | `modal-dialog` size class | header type | footer class | Triggered by | Purpose |
|---|---|---|---|---|---|
| **Offline** | `modal-dialog` (default ~500px) | `modal-header` + `modal-title` | `modal-footer text-center` | connection-lost (auto) | "you are offline" notice; body `modal-body py-0` |
| **Debug Log** | `modal-dialog modal-lg` (~800px) | `modal-header` + `modal-title` | `modal-footer` | debug action | scrollable debug log |
| **Post Alert** | `modal-dialog` | `modal-header` + `modal-title` | `modal-footer` | alert composer btn | compose/send a trading alert |
| (poll) **"Enter your poll question:"** | `pollModalHolder` (custom wrapper, not `.modal-dialog`) | — | — | poll btn | poll builder (`.poll-panel-btn-close`) |
| **Session Control** | `modal-dialog modal-lg` | `modal-header` + `modal-title` | `modal-footer` | session-control btn | admin session management |
| **Download our mobile apps** | `modal-dialog` | `modal-header` + `modal-title` | `modal-footer` | `#mobileAppInfoModal` (nodes 0 & 5) | mobile app download links/QR |
| **":"** (templated alert/Q&A title) | `modal-dialog` | `modal-header` + `modal-title` | `modal-footer` | per-alert action | generic alert detail (title interpolated) |
| **Q&A for Alert:** | `modal fade` (note `fade modal` order) → `modal-dialog` | `modal-header align-items-start` + `modal-title` | `modal-footer flex-nowrap` | alert "Q&A" action | threaded Q&A on an alert |
| **Muted Chat Users** | `modal-dialog` | `modal-header` + `modal-title` | `modal-footer` | `#mutedUsersModal` (node 3) | manage muted users list |
| **Followed Chat Users** | `modal-dialog` | `modal-header` + `modal-title` | `modal-footer` | `#followedUsersModal` (node 4) | manage followed users list |
| (untitled empty-title shells ×4) | `modal-dialog` | `modal-header` | `modal-footer text-center` | various (General Settings = `#user-settings-modal`, WebRTC Troubleshooter = `#webrtc-troubleshooter-modal`) | settings / connectivity check (titles set at runtime) |

Two `modal-dialog modal-lg` (large) dialogs: **Debug Log** and **Session Control**. Everything else uses the default `modal-dialog` width except the custom `pollModalHolder`. No `modal-sm`, `modal-xl`, or `modal-fullscreen` observed.

**Footer button vocabulary** (from `inventory.buttons`, deduped) — the buttons that appear inside modal footers:

| Button class | Label | Modal context |
|---|---|---|
| `btn-close btn-close-white` | (icon ✕) | every modal header — `data-bs-dismiss="modal"` |
| `btn btn-primary` | "Close" | generic / alert modals |
| `btn btn-secondary` | "Close" | Offline / info modals |
| `btn btn-light` | "Close" | dark-content modals |
| `btn btn-secondary m-2 align-self-end` | "Close" | settings modal |
| `btn btn-success` | "Save" | settings / forms |
| `btn btn-success` | "Post Alert" | Post Alert modal |
| `btn btn-success centered float-right` | "Send Poll" | poll modal |
| `btn btn-success btn-block` | "Done" | wizard-style modal |
| `btn btn-success` | "Copy Results" | poll results |
| `btn btn-outline-light` | "Save changes" | settings tab |
| `btn btn-outline-light pull-right` | "Save To Canned" | alert composer |
| `btn btn-outline-danger mx-1` | "Reset" | settings |
| `input-group-text btn` | "Save" | input-group addon (bg `--modal-input-group-bg` #0a6db1) |
| `poll-panel-btn poll-panel-btn-close` | (icon ✕) | poll modal close |

**Form fields inside modals** (from `inventory.inputs`, deduped — these belong to Post Alert / General Settings / Poll / Session Control modals):

| Field | type | name / placeholder / aria | class | Modal |
|---|---|---|---|---|
| Alert body | `textarea` | placeholder "Alert Text..." | `form-control` | Post Alert |
| Alert link | `url` | "Link / URL to send to users" | `form-control` | Post Alert |
| Alert media | `url` | "Image or Video Link to show" | `form-control` | Post Alert |
| Alert file | `file` | name `fuploadAlert` | — | Post Alert |
| Poll question | `text` | "Main poll question (...)" | `form-control` | Poll |
| Poll choice | `text` | "Enter a choice (i.e. Up, Down, Sideways)" | `form-control` | Poll |
| App color theme | `radio` | name `app-color-theme` | `form-check-input` | General Settings |
| PM window layout | `checkbox` | name `pm-window-layout` | `form-check-input` | General Settings |
| Chat text color | `color` | name `chat-text-color` | `form-check-input` | General Settings |
| Chat text size | `number` | name `chat-text-size` | `form-check-input` | General Settings |
| Audio input device | `select-one` | aria "Audio device (input)" | `form-select` | General / WebRTC |
| Generic dropdown | `select-one` | — | `form-control` | settings |
| Schedule time | `datetime-local` | — | `form-control` | Post Alert (schedule) |
| Q&A question | `textarea` | placeholder "Type your question here..." | `txt-area form-control border-0` | Q&A for Alert |
| Do-not-disturb | `checkbox` | name `talkingPresenter0-donot-disturb` | `form-check-input` | presenter/settings |

---

### 7.4 Image lightbox triggers — `div.img-container` (9 nodes)

Nodes 6–14 are inline chat images that, on click, open a JS image-lightbox overlay via a global handler. They are NOT Bootstrap modals — they call an inline `onclick` function.

**Common attrs / behavior:**
- `class="img-container "` (trailing space) — no Angular scope attr (rendered from chat HTML).
- `onclick="openImageModal(event,'<cdn url>')"` — opens a full-screen image overlay. The URL is the CDN-hosted upload (host `cdn1.protradingroom.com/uploads/images/...`). **Reference only — do not reuse their image URLs/filenames.**
- `text: " "` (single space; the image is a background/child, not alt text in this node).

**Computed CSS** (`div.img-container`, representative node 6):

| Property | Value |
|---|---|
| display | **inline-flex** |
| width × height | ~342px × ~186–199px (varies per image aspect) |
| padding | 3px (all sides) |
| background | transparent |
| border / radius | none / 0 |
| color | `rgb(103,103,103)` |
| font | `"Open Sans", sans-serif` 13px / weight 100 / line-height 19.5px |
| white-space | pre-wrap |
| cursor | **pointer** |
| transition | all |
| `::before` / `::after` | none |

The 9 instances (path index in chat → rect y → image filename, third-party — for layout reference only):

| Node | chat msg index | rect (x,y,w,h) |
|---|---|---|
| 6 | nth-child(3) | 66, -9074, 342, 199 |
| 7 | nth-child(5) | 66, -8522, 342, 196 |
| 8 | nth-child(7) | 66, -8070, 342, 186 |
| 9 | nth-child(35) | 66, -2858, 342, 192 |
| 10 | nth-child(38) | 66, -2070, 342, 195 |
| 11 | nth-child(40) | 66, -1560, 342, 196 |
| 12 | nth-child(41) | 66, -1177, 342, 197 |
| 13 | nth-child(42) | 66, -695, 342, 193 |
| 14 | nth-child(47) | 66, 114, 342, 196 |

(Large negative `y` = scrolled above the viewport in the alerts scroller `app-roomscroller#chatScrollViewParentAlerts`; only node 14 is on-screen at y=114.) All share width ~342px and a ~3px frame padding — a uniform thumbnail size for inline chat media. Clicking any opens the same `openImageModal` lightbox overlay.

---

### 7.5 Dropdown menus (open overlays — volume, users/kebab, archives)

Dropdowns use the Bootstrap 5 `.dropdown` / `.dropdown-toggle` / `.dropdown-menu` API with `data-bs-auto-close`. Reconstructed from `inventory.menus` + `targeted.json` matched rules.

**Shared `.dropdown-menu` base** (Bootstrap, from targeted matched rule):

| Property | Value |
|---|---|
| position | absolute; top 100%; left 0; z-index **1000** |
| display | none (until `.show`) |
| min-width | 10rem (160px) |
| padding | `0.5rem 0` (8px top/bottom) |
| margin | `0.125rem 0 0` |
| font-size | 0.9375rem (15px) base / 16px in volume control |
| background-color | `rgb(34,34,34)` (#222) base — overridden per variant |
| color | `rgb(255,255,255)` base |
| text-align | left |
| `--bs-dropdown-zindex` | 1000 |

#### 7.5.1 Volume dropdown — `div.dropdown-menu.volumeControl`

Opened from `li.nav-item.dropdown.dropstart` toggle `#dropdownVolume`. Menu carries `aria-labelledby="dropdownVolume"`. Items (`inventory.menus`): **Volume** (range slider) + **Mute** (toggle), separated by `.dropdown-divider`.

Matched rules / computed (targeted node 10):

| Property | Value / token |
|---|---|
| `.volumeControl` text-align | **center** |
| color | `var(--light-gray)` = **#ccc** (`rgb(204,204,204)`) |
| background-color | `var(--darker-black)` = **#111** (`rgb(17,17,17)`) |
| border | `1px solid rgb(250,250,250)` |
| border-radius | 6px (top-left token) |
| padding | `8px 0` |
| min-width | 160px |
| z-index | 1000 |
| `.dropdown-divider` | bg `var(--dropdown-divider-bg)` = **#45a2ff** |

**Volume slider** (`input[type=range].mx-auto.py-2.volCtrl`) lives in `div.room-sound-options`:

| `.room-sound-options` | Value |
|---|---|
| display | block |
| text-align | left |
| padding-left | **30px** |
| color | `rgb(204,204,204)` (#ccc) |
| font-size | 16px |

#### 7.5.2 Per-user dropdown (kebab / roster context menu) — `div.dropdown-menu.users-dropdown-options`

Each roster user row has a kebab toggle `a.nav-link.dropdown-toggle.p-0` inside `li.nav-item.dropdown.ml-2`, opening `div.dropdown-menu.users-dropdown-options`. There are dozens of identical instances (one per connected user — `inventory.menus` repeats it ~50×).

Items (each a `a.dropdown-item`, the third with `ng-star-inserted`):

| Item | class |
|---|---|
| **User Info** | `dropdown-item` |
| **Mention** | `dropdown-item` |
| **Copy** | `dropdown-item ng-star-inserted` (conditionally rendered) |

#### 7.5.3 Archives / logs dropdown — `nav-item dropdown` → `dropdown-menu users-dropdown-options`

Sidebar "Archives" menu (toggle `a.nav-link.sidebar-item.dropdown-toggle`). Items:

| Item | class |
|---|---|
| **Alert Logs** | `dropdown-item small` |
| **Chat Logs** | `dropdown-item small` |
| **Transcript History** | `dropdown-item small` |

Archives dropdown tokens: `--archives-dropdown-menu-bg-color` = **#0e3651**, `--archives-dropdown-menu-color` = **#45a2ff**, `--tabs-dropdown-color` = **#45a2ff**, `--tabs-dropdown-bg` = **#0f2e43**. Session-control dropdown: `--session-control-dropdown-bg` = **#0e3651**.

#### 7.5.4 User-list sort dropdown — `dropdown user-options`

Toggle `button.btn.btn-sm.btn-dark.ml-1.float-right.border-0.dropdown-toggle` → `dropdown-menu` with one item:

| Item | class |
|---|---|
| **Sort by Trials** | `dropdown-item d-flex align-items-center justify-content-between` |

---

### 7.6 Backdrop / overlay layers

| Layer | class / source | z-index | Notes |
|---|---|---|---|
| Bootstrap modal | `.modal` | **1055** | palette zIndex count = 20 (all modal roots) |
| Bootstrap backdrop | `.modal-backdrop` | **1054** | `rgba(0,0,0,0.5)` dimmer |
| Dropdown menus | `.dropdown-menu` | **1000** | 166 occurrences (every dropdown) |
| Fixed-top navbar | `.fixed-top` | 1030 | hosts the mobile-info trigger |
| Presenter cam overlay | `div.overlay` (targeted 45–46) | — | name label overlay on `app-presenter-cams` (not a modal) |
| Image lightbox | `openImageModal()` JS overlay | (very high, e.g. 999999/10000 seen in palette) | opened by `.img-container` clicks |

---

### 7.7 Rebuild checklist (1:1)

1. **Triggers** use Bootstrap 5 `data-bs-toggle="modal"` + `data-bs-target="#id"`. Map: phone icon/`Mobile App Info`→`#mobileAppInfoModal`, `fa-network-wired`→`#webrtc-troubleshooter-modal`, `fa-cogs`→`#user-settings-modal`, `fa-comments`→`#mutedUsersModal`, `fa-users`→`#followedUsersModal`.
2. **Shell**: `.modal.fade > .modal-dialog[.modal-lg?] > .modal-content`; content bg **#103d5c**, color **#f4f4f4**, radius 6px, shadow `rgba(0,0,0,.5) 0 4px 20px`. z-index 1055 / backdrop 1054 dimmer `rgba(0,0,0,.5)`.
3. **Header**: `h5.modal-title` + `button.btn-close.btn-close-white[data-bs-dismiss="modal"]`. Q&A modal uses `.modal-header.align-items-start` + `.modal-footer.flex-nowrap`.
4. **Footers**: success actions `btn btn-success` bg **#92d528**; close `btn btn-secondary/primary/light`; danger **#bb352a**; hover opacity 0.9; close-btn bg **#0a6db1**.
5. **Modal tabs** (General Settings): active tab bg/border **#45a2ff**, color #fff, `!important`; radius 6px; padding `8px 16px`.
6. **Sizes**: only **Debug Log** and **Session Control** are `modal-lg`; rest default; poll uses custom `pollModalHolder` wrapper.
7. **Dropdowns**: `.dropdown-menu` min-width 160px, padding `8px 0`, z-index 1000. Volume (`.volumeControl`): center text, color #ccc, bg **#111**, `1px solid #fa fafa`, range slider in `.room-sound-options` (padding-left 30px). User kebab (`.users-dropdown-options`): items User Info / Mention / Copy. Archives: Alert Logs / Chat Logs / Transcript History (`dropdown-item small`), bg **#0e3651** color **#45a2ff**. Divider `.dropdown-divider` color **#45a2ff**.
8. **Image lightbox**: `.img-container` inline-flex, padding 3px, cursor pointer, ~342px wide; click invokes a JS image-overlay (our equivalent), NOT a Bootstrap modal. Build our own lightbox; do not copy their CDN URLs/filenames.

---


<a id="08"></a>

## 08 — Controls Inventory (Master Interactive Control Reference)

> Third-party visual reference only. This documents the **structure, layout, CSS, and behavior** of the admin trading room's interactive controls, reconstructed from a captured DOM+CSS slice (`controls.json`, 230 controls, viewport 1989×1166). No third-party text/data is to be reused as ours; example labels (usernames, message text, room names) are recorded only to identify the control they belong to.

### 0. Scope & Census

`controls.json` is a flat array of **230 interactive controls**, each with `matchedRules` (the actual CSS rule `cssText`, including `:hover`/`::before`). Tag breakdown:

| Tag | Count | What it is |
|---|---|---|
| `<a>` | 142 | nav links, tab toggles, dropdown triggers, per-message kebab menus |
| `<button>` | 58 | btn-styled actions (modals, per-message "Ask a question", user-panel actions, presentation overlay) |
| `<i>` | 28 | Font Awesome icon glyphs (nested inside the links/buttons above — counted as separate slice nodes) |
| `<li>` | 2 | top-nav status indicators (talking / REC) |

Assigned to regions by stable path anchors (slice paths are relative to captured sub-roots such as `a#dropdownMenuLink`, `div#navbarsRoom`, `ul#mainTabs`, `app-room#topRoomDiv`):

| Region | Count | Anchor signature |
|---|---|---|
| **chat** | 187 | `a#dropdownMenuLink` (×124 kebabs), `app-st-message`, `app-roomscroller`, `app-chat`, `div#textAreaHolder`, `ul#mainTabs`, `.chatTabs` |
| **sidebar** | 19 | `room-sidebar > navbar-nav`, `.sidebar-item`, `a#archivesDropdown`, `.users-btns`, `button#user-options-btn`, `li.nav-item.text-center` |
| **presentation** | 11 | `div#webcamsHolder-`, `ul#screenTabs`, `a#screens-tab`, `.presAreaTabs-*`, `span#dropdownMenuScreen`, zoom overlay buttons |
| **topnav** | 9 | `div#navbarsRoom`, `.navbar-expand-md`, `a#dropdownVolume`, `.sidebar-menu`, `span.users`, talking/REC `<li>` |
| **alerts** | 4 | `app-alerts` header (bell, search, settings cog) |

The slice is overwhelmingly **chat** because the captured DOM held ~50 rendered messages, each contributing a per-message "Ask a question" button **and** a per-message kebab (⠇) menu, plus the chat tabs/header/composer chrome.

---

### 1. Shared Bootstrap button baseline

Every `<button>` and most `.btn`-classed `<a>` inherit the Bootstrap 4-era token block. Key resolved values (from `.btn` / `.btn-sm` matchedRules):

| Property | `.btn` | `.btn-sm` (used by most room buttons) |
|---|---|---|
| display | `inline-block` | — |
| font-weight | `400` | — |
| color (base) | `rgb(255,255,255)` | — |
| font-size | `0.9375rem` (15px) | `0.820312rem` (≈13.1px) |
| line-height | `1.5` | `1.5` |
| padding | `0.375rem 0.75rem` | `0.25rem 0.5rem` |
| border | `1px solid transparent` | — |
| border-radius | `0.25rem` (4px) | `0.2rem` (≈3.2px) |
| transition | `none` (overridden from the 0.15s default) | — |
| focus box-shadow | `rgba(55,90,127,0.25) 0 0 0 0.2rem` (`--primary` #375a7f tint) | — |
| disabled | `opacity: 0.65` | — |

A global reset `*, ::before, ::after { text-shadow: none !important; box-shadow: none !important; }` is present (a print/utility override captured in the slice) — note it conflicts with the focus box-shadow rules; treat focus shadows as design intent.

**Button color variants observed:**

| Variant class | bg | border | text | hover bg | token |
|---|---|---|---|---|---|
| `.btn-secondary` | `rgb(68,68,68)` `#444` | `#444` | `#fff` | `rgb(49,49,49)` | `--secondary: #444` |
| `.btn-default` (Reload Users) | `var(--reload-icon-bg-color)` → `rgb(244,244,244)` | none (`border-0`) | `var(--reload-icon-color)` → `rgb(69,162,255)` `#45a2ff` | — | `--app-link-color` |
| `.btn-default` (Search Users) | `var(--search-icon-bg-color)` → `rgb(69,162,255)` `#45a2ff` | none | `rgb(244,244,244)` `#f4f4f4` | — | inverse of Reload |
| `.btn-secondary` (Sort Users) | `#444` | none (`border-0`) | `#fff` | `rgb(49,49,49)` | `--secondary` |
| `.btn-dark` (`user-options-btn`) | dark | none (`border-0`) | `#fff` | — | bs-dark |
| `.btn` (presentation overlay) | `rgb(33,37,41)` `#212529` | — | `#fff` | `var(--bs-btn-hover-bg)` | bs-dark |

---

### 2. TOP NAV (9 controls)

Fixed top navbar (`nav.navbar-expand-md.navbar-dark.fixed-top`, `div#navbarsRoom`). Spans the full 1989px width; right cluster sits at x≈1739–1984, y≈1–48 (48px tall bar). Link color baseline `rgb(171,176,181)` (muted), white for hamburger/user.

| # | Label / role | Tag | fa-icon | Rect (x,y,w,h) | color | hover color | font-size | bg | Behavior / attrs | Inferred action |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Hamburger | `i` | `fa-bars` | 11,15,16,18 | `#fff` | — | 18px | transparent | inside `span.sidebar-menu` | Toggle sidebar drawer |
| 2 | User icon | `i` | `fa-user` | 48,18,12,14 | `#fff` | — | 14px | transparent | inside `span.users.ml-1.mr-1` | Room user-count indicator |
| 3 | Talking indicator | `li` | `fa-microphone` (`icon fa fa-microphone`) | 1739,4,81,41 | `#fff` | — | 16px | transparent | `li.nav-item.talkingIndicator.animated.fadeIn`; text "TG" | Shows current speaker (animated fade-in) |
| 4 | (mic glyph) | `i` | `fa-microphone` | 1744,17,11,16 | `#fff` | — | 16px | transparent | child of #3 | — |
| 5 | REC indicator | `li` | — (text `[ REC ]`) | 1819,4,62,41 | `#fff` | — | 16px | transparent | `li.nav-item.recIndicator.animated.fadeIn` | Recording-active badge |
| 6 | Volume | `a` | `fa-volume-up` `fa-2x` | 1886,1,40,48 | `rgb(171,176,181)` | `var(--app-link-color)` #45a2ff | 16px (glyph 32px) | transparent | `id=dropdownVolume`, `data-bs-toggle=dropdown`; `::after` (caret) `display:none`; width pinned 40px | Open volume/audio dropdown |
| 7 | (volume glyph) | `i` | `fa-volume-up` `fa-2x` | 1894,9,36,32 | `rgb(171,176,181)` | — | 32px | transparent | child of #6 | — |
| 8 | Reload | `a` | `fa-sync` `fa-2x` | 1936,1,48,48 | `rgb(171,176,181)` | `var(--app-link-color)` | 16px (glyph 32px) | transparent | `li.nav-item:nth-child(4)` | Hard-reload the room |
| 9 | (reload glyph) | `i` | `fa-sync` `fa-2x` | — | `rgb(171,176,181)` | — | 32px | transparent | child of #8 | — |

Nav link hover rule (own component): `.navbar-dark .navbar-nav .nav-link:hover, .muted:hover { color: var(--app-link-color) }`.

---

### 3. SIDEBAR (19 controls)

Left rail `nav.navbar.w-100.h-100` inside `div.room-sidebar > .sidebar-wrapper`. Two parts: **(a)** the settings/links nav list (`.sidebar-item` rows, 236px wide, 37px tall, x≈-243 in the captured off-canvas state) and **(b)** the users-panel action buttons (`.users-btns`, ~27px tall, x≈-33…-121). `.sidebar-item` color is `inherit !important` → resolves to muted `rgb(103,103,103)` (`--lightTheme-sidebar-wrapper-color #676767`); hover bg `rgb(233,236,239)`.

#### 3a. Sidebar settings list (`.sidebar-item` rows + Mobile App Info)

| Label | Tag | fa-icon | Rect | color | hover | font | bg | Behavior (attrs) | Action |
|---|---|---|---|---|---|---|---|---|---|
| Mobile App Info | `button` | — | -182,112,115,31 | `#fff` | `var(--bs-btn-hover-color)` | 14px | `rgb(108,117,125)` (`.btn-secondary` bs) | `data-bs-toggle=modal` `data-bs-target=#mobileAppInfoModal` `type=button` | Open mobile-app info modal |
| (check ×2) | `i` | `fa-check` | — | `rgb(103,103,103)` | — | 14px | transparent | status glyphs in `p:nth-child(5)` | Connection-OK ticks |
| Connectivity Check | `a` | `fa-network-wired` | -243,197,236,37 | `rgb(103,103,103)` | bg `rgb(233,236,239)` | 14px | transparent | `data-bs-toggle=modal` `data-bs-target=#webrtc-troubleshooter-modal` `title=Connectivity Check` | Open WebRTC troubleshooter |
| General Settings | `a` | `fa-cogs` | -243,?,236,37 | `rgb(103,103,103)` | bg `rgb(233,236,239)` | 14px | transparent | `data-bs-toggle=modal` `data-bs-target=#user-settings-modal` `title=General Settings` | Open user-settings modal |
| Manage Muted Users | `a` | `fa-comments` | -243,?,236,37 | `rgb(103,103,103)` | bg `rgb(233,236,239)` | 14px | transparent | `data-bs-toggle=modal` `data-bs-target=#mutedUsersModal` `title=Manage Muted Users` | Open muted-users modal |
| Manage Followed Users | `a` | `fa-users` | -243,?,236,37 | `rgb(103,103,103)` | bg `rgb(233,236,239)` | 14px | transparent | `data-bs-toggle=modal` `data-bs-target=#followedUsersModal` `title=Manage Followed Users` | Open followed-users modal |
| Users: Sort by Trials | `a` | `fa-user` | -243,?,236,37 | `rgb(103,103,103)` | bg `rgb(233,236,239)` | 14px | transparent | `.sidebar-item` row | Toggle user-list sort to trials |
| Archives | `a` | `fa-archive` | -243,293,236,37 | `rgb(103,103,103)` | inherit | 14px | transparent | `id=archivesDropdown` `class=...dropdown-toggle` `data-bs-toggle=dropdown` `title=Archives` `aria-haspopup=true` `aria-expanded=false` | Open archives dropdown |
| (icons for the above) | `i` | matching `fa-*` | — | `rgb(103,103,103)` | — | 14px | transparent | glyph children | — |

(Each `<a>` row above has a matching nested `<i>` glyph node in the slice — they account for the paired icon rows.)

#### 3b. Users-panel action buttons (`.users-btns .btn`, padding `3px 6px`, radius 4px, `border-0`)

| Label | Tag | fa-icon | Rect | color | bg | Action |
|---|---|---|---|---|---|---|
| Reload Users | `button` | `fa-sync` | -63,417,26,27 | `rgb(69,162,255)` (`--reload-icon-color`) | `rgb(244,244,244)` (`--reload-icon-bg-color`) | Refetch room user list |
| Sort Users | `button` | `fa-sort-alpha-down` | -91,417,24,27 | `#fff` | `rgb(108,117,125)` (`.btn-secondary`) | Toggle alpha sort |
| Search Users | `button` | `fa-search` | -121,417,26,27 | `rgb(244,244,244)` (`--search-icon-color`) | `rgb(69,162,255)` (`--search-icon-bg-color`) | Open user search field |
| (user options) | `button` | — | -33,417,26,27 | `#fff` | dark (`.btn-dark`) | `id=user-options-btn` | Open user-options menu |

---

### 4. ALERTS (4 controls)

Alerts panel header (`app-alerts`). White-on-dark icon row.

| Label | Tag | fa-icon | Rect | color | hover | font-size | Behavior | Action |
|---|---|---|---|---|---|---|---|---|
| (bell) | `i` | `fa-bell` (`fa-bell me-1`) | — | `#fff` | — | 20px | header title glyph | Alerts section marker |
| Search | `a` | `fa-search` | — | `#fff` | inherit | 16px | `title=Search` | Open alert search |
| (search glyph) | `i` | `fa-search` | — | `#fff` | — | 16px | child of Search | — |
| Settings | `a` | `fa-cog` | — | `#fff` | inherit | 16px | `aria-haspopup=true` `aria-expanded=false` | Open alerts settings dropdown |

The alert-search and alert-settings live in the alert-chat header; the alert link color token is `--modal-alert-link-color #0a6db1` (used inside alert message bodies, not these header icons which are forced white).

---

### 5. PRESENTATION (11 controls)

Presentation/screen-share area: webcam overlay close buttons (`div#webcamsHolder-`), screen/notes tabs (`ul#screenTabs`, `.presAreaTabs-*`, 12px font), per-screen cog dropdown, and the zoom/capture overlay buttons.

#### 5a. Tabs (`ul#screenTabs` / `presAreaTabs`) — active tab uses `--tab-active-bg #45a2ff`

| Label | Tag | fa-icon | Rect-state | color | bg | font | Behavior (attrs) | Action |
|---|---|---|---|---|---|---|---|---|
| Screens | `a` | `fa-desktop` | active | `#fff` | `rgb(69,162,255)` #45a2ff | 12px | `data-bs-toggle=tab` `data-bs-target=#screens` `role=tab` `aria-controls=screens` | Show screens grid |
| Notes | `a` | `fa-edit` | inactive | `rgb(204,204,204)` #ccc | transparent | 12px | `data-bs-toggle=tab` `data-bs-target=#notes` `role=tab` `aria-controls=notes` (`id=notes-tab`) | Show notes panel |
| TG-Screen 1 (per-screen) | `a` | `fa-cog` | active | `#fff` | `rgb(69,162,255)` | 12px | `data-bs-toggle=tab` `role=tab` `aria-controls=6a300cc493c3cb36774d1c0d` (`id=…-tab`); title incl. "Detach Screen to a new window" | Select that shared screen / cog opens screen options |
| (note-change) | `i` | `fa-edit` | — | — | — | — | `id=noteChangeIndicator` | Unsaved-notes indicator |
| (screen cog) | `i` | `fa-cog` | — | — | — | — | `span#dropdownMenuScreen > i` | Per-screen settings menu |
| (tab glyphs) | `i` | `fa-desktop`/`fa-edit`/`fa-cog` | — | matches tab | transparent | 12px | glyph children | — |

#### 5b. Overlay close + zoom controls

| Label | Tag | fa-icon | color | bg | font | Action |
|---|---|---|---|---|---|---|
| (close ×2) | `i` | `fa-times` | `#fff` | transparent | 20px | Close/dismiss webcam overlay (`div.overlay`) |
| (zoom search) | `button` | `fa-search` | `#fff` | `rgb(33,37,41)` #212529 | 14px | Zoom/search within screen (`zoom-controls-container`) |
| (capture) | `button` | `fa-camera` | `#fff` | `rgb(33,37,41)` | 14px | Screenshot / capture frame |
| (expand) | `button` | `fa-expand` | `#fff` | `rgb(33,37,41)` | 14px | Fullscreen the screen |

Overlay name label is `h5.pNameLabel` (presenter name) within `div#webcamsHolder- > div.overlay`.

---

### 6. CHAT (187 controls) — the dominant region

Chat occupies `as-split#mainAreaSplit > as-split-area.alert-chat-box` → `app-chat` → `app-roomscroller` → 50× `app-st-message`. Three high-cardinality repeated controls dominate, plus the chat chrome (tabs / header / composer).

#### 6a. Per-message KEBAB menu (⠇) — ×124

The single most repeated control. **All 124 share the identical path `a#dropdownMenuLink`** (one per message; the doubled count reflects messages with two action affordances). Each:

| Field | Value |
|---|---|
| Tag / text | `<a>` `⠇` (U+2807 vertical ellipsis) |
| class | `msgMenu dropright pt-1` |
| attrs | `id=dropdownMenuLink` `data-bs-toggle=dropdown` `role=button` `aria-haspopup=true` `aria-expanded=false` |
| rect | w 19, h 34 (x=0 main column, x=397 alert column) |
| color | computed `rgb(10,109,177)` = `var(--username-color)` `#0a6db1` **!important** |
| hover | `var(--light-brown)` `#8c8686` **!important**; `font-weight: 600 → 900`; `cursor: pointer` |
| matched | `.msgMenu { padding-left:5px; font-size:20px; font-weight:600; color:var(--username-color)!important }` · `.msgMenu:hover { font-weight:900; cursor:pointer; color:var(--light-brown)!important }` |
| action | Open per-message admin dropdown (reply / quote / delete / mute / pin etc.) |

#### 6b. Per-message "Ask a question" button — ×~50

| Field | Value |
|---|---|
| Tag | `<button>` |
| class | `btn btn-sm btn-secondary me-1 alert-qa ng-star-inserted` |
| fa-icon | `fa-question-circle` |
| title | `Ask a question` |
| rect | w 18, h 19 (x≈301, inline in message header) |
| font-size | 10px (glyph) |
| bg | `rgb(108,117,125)` (bs `.btn-secondary`) ; hover bg `rgb(49,49,49)` (#444 theme variant) |
| color | varies by message theme: `rgb(255,255,255)` (dark rows) or `rgb(26,26,26)` (light rows); some show vote-count text `(n)` and a `✅` resolved marker, count text colored `rgb(0,128,64)` when answered |
| action | Promote message into the Q&A queue / mark as question |

The count/✅ overlay text (`(4) ✅`, `(9) ✅`, etc.) is per-instance message data — recorded only to show the button's resolved/answered state styling.

#### 6c. Chat chrome (tabs, header, composer) — distinct controls

| Label | Tag | fa-icon | Rect-state | color | bg | font | Behavior (attrs) | Action |
|---|---|---|---|---|---|---|---|---|
| Main Chat | `a` | — | active tab | `#fff` (`--modal-active-tab-color`) | `rgb(69,162,255)` #45a2ff (`--tab-active-bg`); active also `rgb(34,34,34)` per bs `.nav-tabs .active` | 12px | `data-bs-toggle=tab` `role=tab`; `.chatTabs .nav-link.active` border `1px solid var(--modal-active-tab-border-color)` #45a2ff; radius 6px | Switch to main chat |
| Off Topic | `a` | — | inactive tab | `#fff` | transparent | 12px | `data-bs-toggle=tab` `role=tab` | Switch to off-topic chat |
| Files | `a` | `fa-folder` | tab | `rgb(204,204,204)` #ccc | transparent | 12px | `data-bs-toggle=tab` `data-bs-target=#files` `role=tab` `aria-controls=files` (`ul#mainTabs li:nth-child(4)`) | Switch to files tab |
| Search | `a` | `fa-search` | header | `#fff` | transparent | 12px (glyph 16px) | `title=Search` | Open chat search |
| (settings) | `a` | `fa-cog` | header | `#fff` | transparent | 12px (glyph 16px) | `aria-haspopup=true` `aria-expanded=false` (`chat-header-gear`) | Open chat settings dropdown |
| Settings | `i` | `fa-cog` | header | `#fff` | transparent | 16px | `title=Settings` (`fa-cog chat-header-gear`) | (glyph for above) |
| (comment) | `i` | `fa-comment` | header | `#fff` | transparent | 16px | tab/section glyph | Chat section marker |
| (emoji) | `i` | `fa-smile` (`far fa-smile`) | composer | `rgb(103,103,103)` | transparent | 12px / 16px | inside `div#textAreaHolder` composer row | Open emoji picker |
| (image) | `i` | `fa-image` | composer | `rgb(103,103,103)` | transparent | 16px | composer row | Attach image |

Chat-tab own rules: `.chatTabs .nav-link.active { border: 1px solid var(--modal-active-tab-border-color) }` (#45a2ff); `.chatTabs .nav-link:hover { cursor: pointer; border-color: var(--modal-active-tab-border-color) }`; active tab `cursor: default`. Bootstrap `.nav-tabs .nav-link` base radius `0.25rem` top corners; nav-link padding `0.5rem 2rem`.

---

### 7. Design tokens referenced by controls

Pulled from `theme.json → cssVariables.root`. These are the tokens the control `matchedRules` resolve against:

| Token | Value | Used by |
|---|---|---|
| `--username-color` (`--lightTheme/--darkTheme-username-color`) | `#0a6db1` | kebab menu base color |
| `--light-brown` | `#8c8686` | kebab menu hover color |
| `--app-link-color` / `--ptr-website-link-color` | `#45a2ff` | nav-link hover, reload/search-user accents, tab active bg |
| `--secondary` | `#444` | `.btn-secondary` theme override (bg/border hover) |
| `--primary` | `#375a7f` | `.btn:focus` box-shadow tint |
| `--tab-active-bg` / `--modal-active-tab-bg-color` | `#45a2ff` | active chat/screen tab bg |
| `--modal-active-tab-border-color` / `--modal-tabs-border-color` | `#45a2ff` | active chat tab border |
| `--modal-active-tab-color` / `--tabs-color` | `#fff` | active tab text |
| `--tabs-dropdown-color` | `#45a2ff` | tab dropdown text |
| `--sidebar-wrapper-color` (light) | `#676767` (`rgb(103,103,103)`) | `.sidebar-item` muted text |
| `--sidebar-menu-color` | `#fff` | hamburger / sidebar-menu glyph |
| `--sidebar-menu-active-color` | `#45a2ff` | active sidebar item |
| `--sidebar-wrapper-bg-color` / `--sidebar-menu-bg` | `#103d5c` | sidebar panel bg |
| `--reload-icon-color` / `--reload-icon-bg-color` | `#45a2ff` / `#f4f4f4` | Reload Users button |
| `--search-icon-color` / `--search-icon-bg-color` | `#f4f4f4` / `#45a2ff` | Search Users button |
| `--modal-alert-link-color` | `#0a6db1` | alert body links |
| `--success` / `--danger` / `--warning` / `--info` | `#00bc8c` / `#E74C3C` / `#F39C12` / `#3498DB` | message status badges (e.g. answered-count green `rgb(0,128,64)`) |
| `--bs-link-color` / hover | `#0d6efd` / `#0a58ca` | Bootstrap `<a>` fallback (overridden by `--app-link-color` in nav) |

---

### 8. Behavior summary — by mechanism

| Mechanism | attr signature | Controls using it |
|---|---|---|
| **Modal open** | `data-bs-toggle="modal"` + `data-bs-target="#…"` | Mobile App Info → `#mobileAppInfoModal`; Connectivity Check → `#webrtc-troubleshooter-modal`; General Settings → `#user-settings-modal`; Manage Muted → `#mutedUsersModal`; Manage Followed → `#followedUsersModal` |
| **Dropdown open** | `data-bs-toggle="dropdown"` + `aria-haspopup` `aria-expanded` | per-message kebab (`#dropdownMenuLink` ×124), Archives (`#archivesDropdown`), Volume (`#dropdownVolume`), chat header cog, alerts settings cog, per-screen cog (`#dropdownMenuScreen`), user-options |
| **Tab switch** | `data-bs-toggle="tab"` + `role="tab"` + `data-bs-target` + `aria-controls` | Main Chat, Off Topic, Files (`#files`), Screens (`#screens`), Notes (`#notes`), per-screen tab |
| **title tooltip** | `title="…"` | Search, Settings, Connectivity Check, General Settings, Manage Muted/Followed Users, Archives, Reload/Sort/Search Users, Ask a question |
| **Plain action button** | `type="button"` / `.btn` no toggle | Reload Users, Sort Users, Search Users, user-options, presentation overlay (search/camera/expand) |
| **Status / non-interactive glyph** | `<i>` / `<li>` indicator | talking (`fa-microphone`), REC, connection checks (`fa-check`), bell, note-change indicator |

**Icon library:** Font Awesome 5 (`fas`/`far` prefixes). Distinct `fa-*` glyphs observed: `fa-archive, fa-cog, fa-cogs, fa-bars, fa-user, fa-users, fa-network-wired, fa-comments, fa-comment, fa-check, fa-sync, fa-sort-alpha-down, fa-search, fa-bell, fa-volume-up, fa-microphone, fa-desktop, fa-edit, fa-folder, fa-smile, fa-image, fa-times, fa-camera, fa-expand, fa-question-circle` (+ `fa-2x` size modifier on volume/reload). For our Svelte 5 rebuild these map to `phosphor-svelte` `*Icon` equivalents (e.g. `fa-cog`→`GearIcon`, `fa-archive`→`ArchiveIcon`, `fa-question-circle`→`QuestionIcon`, `fa-volume-up`→`SpeakerHighIcon`, `fa-microphone`→`MicrophoneIcon`) — never copy Font Awesome assets.

---


<a id="09"></a>

## 09 — Targeted Exact CSS (matchedRules source of truth)

This section documents the **50 targeted key elements** captured WITH their `matchedRules` (the actual author CSS `cssText`, including `:hover` / `:focus` / `::before` / `.active` / `:empty` variants). This is the canonical reference cited whenever we need exact hover states, kebab/glyph rendering, tab-active styling, and badge styling. Every value below is verbatim from the captured slice (`evidence-folder/_slices/targeted.json`); variable references are resolved against `theme.json → cssVariables.root`.

> THIRD-PARTY VISUAL REFERENCE ONLY — structure/layout/CSS only. Never copy their text/data.

### Method note on `matchedRules`
- Each element's `matchedRules` is an ordered list of `{selector, cssText}` pairs — the *raw rule text* the cascade applied, in source order. Later, more-specific rules win.
- Every element carries the universal resets repeatedly (`*, ::before, ::after { box-sizing: border-box }` and `*, ::before, ::after { text-shadow: none !important; box-shadow: none !important }`). **The global `box-shadow: none !important` + `text-shadow: none !important` reset means NO element in the room renders any shadow** — already reflected in computed `box-shadow: none`. This is enumerated once here and omitted from the per-element tables.
- Bootstrap appears twice in the cascade (an older v4-style sheet — `padding: 1rem`, `0.324219rem`, `1.17188rem` — *and* a v5 sheet with `--bs-*` custom properties). When both match, the **v5 `--bs-*` rule is the effective one** and the v4 literals are shadowed. Both are recorded; effective value noted.
- `before`/`after` fields capture the resolved `::before`/`::after` computed props (Font Awesome glyph content, font, size, weight, color) where present.

### Resolved design tokens used by these 50 elements (from `theme.json`)
| Token | Value | Token | Value |
|---|---|---|---|
| `--navbar-color` | `#fff` | `--navbar-bg` | `#0c2434` |
| `--sidebar-menu-bg` | `#103d5c` | `--sidebar-menu-color` | `#fff` |
| `--lighter-gray` | `#eee` | `--light-gray` | `#ccc` |
| `--users-color` | `#fff` | `--users-border-color` | `#fff` |
| `--darker-black` | `#111` | `--archives-dropdown-menu-bg-color` | `#0e3651` |
| `--tabs-dropdown-color` | `#45a2ff` | `--notes-tabs-bg` | `#0c2434` |
| `--tabs-border-color` | `#0a6db1` | `--tabs-color` | `#fff` |
| `--tab-active-bg` | `#45a2ff` | `--note-tabs-color` | `#fff` |
| `--modal-active-tab-border-color` | `#45a2ff` | `--modal-active-tab-bg-color` | `#45a2ff` |
| `--modal-active-tab-color` | `#fff` | `--app-link-color` | `#45a2ff` |
| `--presenter-area-bg` | `#0f2e43` | `--bs-danger-rgb` | `220,53,69` (`#dc3545`) |
| `--bs-border-radius` | `.375rem` (=6px) | `--bs-border-radius-pill` | `50rem` |
| `--bs-border-width` | `1px` | `--bs-border-color` | `#dee2e6` |
| `--bs-secondary-bg` | `#e9ecef` | `--bs-tertiary-bg` | `#f8f9fa` |
| `--bs-body-bg` | `#fff` | `--bs-body-color` | `#212529` |

**Effective font for every targeted element:** computed `font-family: "Open Sans", sans-serif` (body inheritance). Font Awesome glyphs render in `"Font Awesome 5 Free"` weight `900` (solid `fas`). The theme's `@font-face` list also declares **Lato 400/700i** and FA Brands/Free 400/900; only FA Free 400/900 report `loaded` in the capture.

---

### Cross-element global rules (appear on all 50)
```css
*, ::before, ::after { box-sizing: border-box; }
*, ::before, ::after { text-shadow: none !important; box-shadow: none !important; }
*, ::after, ::before { box-sizing: border-box; }   /* duplicate from 2nd Bootstrap */
```
Consequence: every shadow is suppressed; every box uses border-box sizing.

---

## A. Top room navbar (`mainAppNav`) and its controls — elements 00–08, 14–16

### [00] `nav.mainAppNav` — fixed top app bar
- `tag=nav` · `class="navbar navbar-expand-md navbar-dark fixed-top mainAppNav"` · `attrs: _ngcontent-ng-c977335924`
- `rect = x:0 y:0 w:1989 h:49` · component `ng-c977335924` (app-room shell)
- Effective computed: `color: rgb(255,255,255)`; `background: rgb(12,36,52)` (`#0c2434`); `font: 16px/24px "Open Sans"; weight 300`; `padding: 0`.

| Selector | Effective cssText (key props) |
|---|---|
| `.fixed-top` | `position: fixed; top:0; right:0; left:0; z-index:1030;` |
| `.navbar` (v5) | flex container: `display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between;` + `--bs-navbar-*` token block. NB an earlier `.navbar { display:none }` rule is shadowed. |
| `.navbar-expand-md` | `flex-wrap:nowrap; justify-content:flex-start;` |
| `.navbar-dark` | sets `--bs-navbar-color: rgba(255,255,255,.55)`, `--bs-navbar-active-color:#fff`, `--bs-navbar-brand-color:#fff`, toggler icon (white stroke svg). |
| `.navbar[_ngcontent-ng-c977335924]` | **`padding: 0px; height: 49px;`** — overrides Bootstrap's `1rem`. |
| `.mainAppNav[_ngcontent-ng-c977335924]` | **`color: var(--navbar-color)` (`#fff`); `background-color: var(--navbar-bg)` (`#0c2434`).** |

Icon present on the bar context: `fas fa-bars` (hamburger / sidebar toggle, see [01]).

### [01] `span.sidebar-menu` — "Open Sidebar" hamburger
- `class="sidebar-menu"` · `attrs: title="Open Sidebar"` · `icon=fas fa-bars` · `rect = 5,9 28×31`
- Computed: `bg rgb(16,61,92)` (`#103d5c`); `color #fff`; `18px/27px`; `padding:1px 5px`; `border:1px solid rgba(0,0,0,0)` (transparent).

| Selector | cssText |
|---|---|
| `.sidebar-menu, .users, .helpLink, .navbar-nav li a` | `cursor: pointer; margin: 0px 5px;` |
| `.sidebar-menu, .users, .helpLink` | `font-size: 18px;` |
| `.sidebar-menu` | `padding: 1px 5px; border: 1px solid transparent;` |
| **`.sidebar-menu:hover`** | **`color: var(--lighter-gray)` (`#eee`); border: 1px solid transparent;`** |
| `.sidebar-menu` | `background-color: var(--sidebar-menu-bg)` (`#103d5c`); `color: var(--sidebar-menu-color)` (`#fff`); |

Hover effect: text lightens to `#eee`, the transparent border stays (no shift — border reserved in both states, so no layout jump).

### [02] `span.users` — "Users Connected" counter pill
- `class="users ml-1 mr-1 d-flex align-items-center"` · `title="Users Connected"` · `icon=fas fa-user` · `rect = 42,16 24×18`
- Computed: `color #fff`; `bg transparent`; `font-size 14px`; `padding:1px 5px`; `border:1px solid #fff`.

| Selector | cssText |
|---|---|
| `.mr-1,.mx-1` | `margin-right:0.25rem !important;` |
| `.ml-1,.mx-1` | `margin-left:0.25rem !important;` |
| `.d-flex` | `display:flex !important;` |
| `.align-items-center` | `align-items:center !important;` |
| `.users` (shared) | `cursor:pointer; margin:0 5px;` then `font-size:18px;` |
| **`.users`** | **`color: var(--users-color)` (`#fff`); border: 1px solid var(--users-border-color) (`#fff`); font-size: 14px; padding: 1px 5px;`** (the explicit `14px` wins over the shared `18px`) |

No `:hover` rule — static white-bordered pill.

### [03] `.fa-mobile` — "Launch in Mobile App" glyph button
- `class="fas fa-mobile mr-1 mobile-info-app-btn"` · `attrs: title="Launch in Mobile App", data-bs-toggle="modal", data-bs-target="#mobileAppInfoModal"` · `rect = 70,17 10×16`
- **`::before` glyph:** `content:"\f10b"` (FA mobile) · `font-family:"Font Awesome 5 Free"` · `font-size:16px` · `font-weight:900` · `color: rgb(255,255,255)`.
- Behavior: opens Bootstrap modal `#mobileAppInfoModal` via `data-bs-toggle="modal"`.

| Selector | cssText |
|---|---|
| `.fa,.fab,.fal,.far,.fas` | `-webkit-font-smoothing:antialiased; display:inline-block; font-style:normal; text-rendering:auto; line-height:1;` |
| `.fa-mobile::before` | `content:"";` (glyph injected via FA's per-icon rule → resolved `\f10b`) |
| `.fa,.far,.fas` | `font-family:"Font Awesome 5 Free";` |
| `.fa,.fas` | `font-weight:900;` |
| **`.mobile-info-app-btn:hover`** | **`cursor: pointer;`** (only hover change) |

### [04] `a.navbar-brand` — top room logo link (`ml-1 mr-auto`)
- `rect = 88,5 200×40`. Computed: `color #fff`; `font 20px/30px "Open Sans" weight 300`; `padding:5px 0` (`0.3125rem` top/bottom = `--bs-navbar-brand-padding-y`); `margin-right:auto`.

| Selector | cssText |
|---|---|
| `a` (v4) | `color: rgb(0,188,140); text-decoration:none; background-color:transparent;` |
| **`a:hover`** | `color: rgb(0,112,83); text-decoration:underline;` (shadowed by brand-hover below) |
| `a:not([href]):not([tabindex])` | `color:inherit; text-decoration:none;` |
| `a:not([href]):not([tabindex]):hover/:focus` | `color:inherit; text-decoration:none;` |
| `.navbar-brand` (v5, effective) | `padding-top/bottom: var(--bs-navbar-brand-padding-y); margin-right: var(--bs-navbar-brand-margin-end); font-size: var(--bs-navbar-brand-font-size) (1.25rem→20px); color: var(--bs-navbar-brand-color); text-decoration:none; white-space:nowrap;` |
| **`.navbar-brand:focus, .navbar-brand:hover`** | **`color: var(--bs-navbar-brand-hover-color)` (`#fff` for dark navbar) — no color change on hover; no underline.** |
| `.navbar-dark .navbar-brand` | `color: rgb(255,255,255);` |
| `.mr-auto,.mx-auto` | `margin-right:auto !important;` |
| `a:link,a:visited,a:active` | `color: var(--app-link-color)` (`#45a2ff`) — applies only when `href` present. |

### [05]/[06]/[07] `a.navbar-brand` — chat-nav brand titles (alerts / chat / private-chat)
Three distinct Angular components (`ng-c1922465750` alerts, `ng-c3761163150` chat, `ng-c3142977328` privchat). Same Bootstrap brand cascade as [04] but inside `.navbar-light` instead of `.navbar-dark`:

| Selector | cssText |
|---|---|
| `.navbar-light .navbar-brand` | **`color: rgb(255,255,255);`** (the app overrides Bootstrap-light's dark default — brand text is white) |
| `.navbar-light .navbar-brand:hover/:focus` | `color: rgb(255,255,255);` (no change) |
| `.navbar-brand:focus,:hover` (v5) | `color: var(--bs-navbar-brand-hover-color);` |

Icons (in the brand text): **[05] `fas fa-bell me-1`** (Alerts header), **[06] `fas fa-comment`** (Chat header, `ml-1 mr-1`), **[07] `fas fa-comments`** (Private Chat header, `bg-light` navbar, rect 0×0 = hidden when no private chat open). Computed for [05]: `color #fff; font 20px/30px; padding 5px 0`.

### [08] `img#cssLogo.brand-logo` — logo image
- `attrs: id="cssLogo", alt="App Logo", src=<uploads CDN path>` · `rect = 88,17 200×18`

| Selector | cssText |
|---|---|
| `img` | `vertical-align:middle; border-style:none;` and `img,svg { vertical-align:middle }` and `tr,img { break-inside:avoid }` |
| `.brand-logo` | `max-width: 200px; height: auto; max-height: 40px;` |
| `.brand-logo` (responsive override A) | `max-width: 150px;` |
| `.brand-logo` (responsive override B) | `max-width: 120px;` |

Three `max-width` rules exist (200 / 150 / 120) gated by media queries; effective desktop value is **200px** with `max-height:40px; height:auto`. Always constrain logo by `max-height:40px`.

### [14] `.fa-sync` (sidebar refresh, in active-room-users button)
- `class="fas fa fa-sync"` inside `button.btn.btn-sm.btn-default` · `rect = -57,424 14×14` (off-canvas left = sidebar collapsed)
- **`::before` glyph:** `content:"\f021"` · FA Free · `14px` · `900` · **`color: rgb(69,162,255)`** (`#45a2ff` accent).

### [15] `.fa-sync` (navbar reconnect, `fa-2x`)
- `class="fas fa-2x fa-sync"` · `rect = 1944,9 32×32`
- `::before`: `content:"\f021"` · `font-size:32px` · `900` · **`color: rgb(171,176,181)`** (muted gray `#abb0b5`).
- Note rule `#navbarsRoom, #navbarsRoom .fa-2x { font-size:15px }` — but `.fa-2x { font-size:2em }` × inherited 15px ≈ resolves to 32px computed. The `.fa-2x` doubles the navbar's 15px base.

### [16] `.fa-sync` (files-tab refresh button, `ml-2`)
- `class="fas fa-sync ml-2"` in `div#files` · `rect 0×0` (files tab inactive)
- `::before`: `content:"\f021"` · `12px` · `900` · `color: rgb(255,255,255)`. · `.ml-2 { margin-left:0.5rem !important }`.

---

## B. Navbar talking indicator & volume/sound dropdowns — elements 09–13

### [09] `li.talkingIndicator` — "X is talking" pill
- `class="nav-item talkingIndicator animated fadeIn ng-star-inserted"` · `icon=icon fa fa-microphone` · `rect = 1739,4 81×41`
- Computed: `color #fff; 16px/24px; bg transparent`.

| Selector | cssText |
|---|---|
| `#navbarsRoom .nav-item` | `width: 100% !important; padding: 0px 10px !important;` |
| `.talkingIndicator` | `max-width: 400px; white-space: nowrap; text-overflow: ellipsis;` |

Animated entrance via `.animated.fadeIn` (Animate.css). Ellipsis-truncates speaker name at 400px.

### [10] `.dropdown-menu.volumeControl` — navbar volume/sound dropdown
- `attrs: aria-labelledby="dropdownVolume"` · in `li.nav-item.dropdown.dropstart` · `icon=fas fa-times` (close) · `rect 0×0` (closed by default; `display:none`).

| Selector | cssText (effective) |
|---|---|
| `.dropdown-menu` (v4) | `position:absolute; top:100%; left:0; z-index:1000; display:none; float:left; min-width:10rem; padding:0.5rem 0; margin:0.125rem 0 0; font-size:0.9375rem; color:rgb(255,255,255); text-align:left; list-style:none; background-color:rgb(34,34,34); background-clip:padding-box; border:1px solid rgb(68,68,68); border-radius:0.25rem;` |
| `.navbar-nav .dropdown-menu` | `position:static; float:none;` (mobile) |
| `.navbar-expand-md .navbar-nav .dropdown-menu` | `position:absolute;` (desktop) |
| `.dropdown-menu` (v5) | full `--bs-dropdown-*` token block; `display:none; position:absolute;` |
| **`.volumeControl`** | **`text-align: center; color: var(--light-gray)` (`#ccc`); background-color: var(--darker-black) (`#111`); border: 1px solid rgb(250,250,250);`** |

Effective dropdown panel: centered text, `#ccc` text on `#111`, near-white 1px border.

### [11] `.dropdown-menu.volumeControl` — presentation-area variant (`ng-c2028866615`)
- In `ul#screenTabs > li.nav-item.ms-auto > div.zoom-controls-container`. Same `.dropdown-menu` base. Extra rule:

| Selector | cssText |
|---|---|
| `.nav-tabs .dropdown-menu` | `margin-top: calc(-1 * var(--bs-nav-tabs-border-width)); border-top-left-radius:0; border-top-right-radius:0;` |
| `.screens-tabs .dropdown-menu, .mainTabset .dropdown-menu, .noteTabset .dropdown-menu` | `background-color: var(--archives-dropdown-menu-bg-color)` (`#0e3651`); color: var(--tabs-dropdown-color) (`#45a2ff`); border: none;` |
| `.volumeControl` (this component) | `text-align:center; color: var(--light-gray); background-color: var(--darker-black); border:1px solid rgb(250,250,250);` |

### [12]/[13] `.room-sound-options` — sound-option rows inside the dropdowns
- [12] navbar variant (`fas fa-closed-captioning` icon nearby), [13] presentation variant. Both:

| Selector | cssText |
|---|---|
| `.room-sound-options` | `text-align: left; padding-left: 30px;` |

Left-aligned rows indented 30px (to clear the leading toggle icon).

---

## C. Room sidebar & roster — elements 17–20

### [17] `.room-sidebar` — collapsible left rail container
- `rect = 0,49 0×1117` (collapsed → width 0; sits below the 49px navbar). Only universal resets match — **no author rule for `.room-sidebar` in this capture** (geometry comes from inline/parent layout, see layout section). `icon=fas fa-check` context.

### [18] `a.active-room-users` — "Active Room Users" sidebar header link
- `class="nav-link active-room-users d-flex align-items-center justify-content-between pt-0"` · `icon=fas fa-user` · `rect = -243,417 236×35`
- Computed: **`color: rgb(103,103,103)` (`#676767` muted gray); `font-weight:700`; `14px/21px`; `padding:0 0 8px`.** Off-canvas (x:-243) when sidebar collapsed.

| Selector | cssText |
|---|---|
| `.nav-link` (v5) | `display:block; padding: var(--bs-nav-link-padding-y) var(--bs-nav-link-padding-x); color: var(--bs-nav-link-color); transition: color .15s, background-color .15s, border-color .15s;` then `transition:none;` |
| `.navbar-nav .nav-link` | `padding-right:0; padding-left:0;` |
| `.nav-link:focus, .nav-link:hover` | `color: var(--bs-nav-link-hover-color);` |
| `.d-flex` / `.justify-content-between` / `.align-items-center` | flex row, space-between, centered |
| `.pt-0,.py-0` | `padding-top:0 !important;` |
| `.navbar-nav li a` (app) | `cursor:pointer; margin:0 5px;` |

### [19] `app-room-roster` — roster host component
- `_nghost-ng-c900715899` · `rect = -248,452 246×708`. Only universal resets (host has no own rule).

### [20] `.room-roster-list` — scrollable roster list
- `rect = -248,452 246×708`

| Selector | cssText |
|---|---|
| `.room-roster-list` | `width: 100%; height: 100%; overflow-y: inherit !important;` |

Fills its host; vertical scroll inherited from parent (sidebar) rather than self-managed.

---

## D. Presentation area, tab strips & tabs — elements 21–33 (the tab-active source of truth)

### [21] `app-presentationarea` — main content host
- `_nghost-ng-c2028866615` · `icon=fas fa-desktop` · `rect = 431,49 1558×1117`. Only universal resets at host level.

### [22] `ul#mainTabs.nav.nav-tabs.mainTabset` — top presentation tab strip
- `attrs: id="mainTabs", role="tablist"` · `rect = 431,49 1558×41` · computed `color rgb(204,204,204)` (`#ccc`).

| Selector | cssText (effective) |
|---|---|
| `ol,ul,dl` | `margin-top:0; margin-bottom:1rem;` |
| `.nav` (v5) | `--bs-nav-link-padding-x:1rem; --bs-nav-link-padding-y:.5rem; display:flex; flex-wrap:wrap; padding-left:0; margin-bottom:0; list-style:none;` |
| `.nav-tabs` (v4) | `border-bottom: 1px solid rgb(68,68,68);` |
| `.nav-tabs` (v5 tokens) | `--bs-nav-tabs-border-width: var(--bs-border-width); --bs-nav-tabs-link-active-color: var(--bs-emphasis-color); --bs-nav-tabs-link-active-bg: var(--bs-body-bg); border-bottom: var(--bs-nav-tabs-border-width) solid var(--bs-nav-tabs-border-color);` |
| **`.files-tabs, .mainTabset, .noteTabset`** | **`border-color:transparent; display:flex; align-items:center; justify-content:center;`** |

### [23] `.nav-tabs.chatTabs` — chat tab strip (`ng-c3761163150`)
- `class="nav nav-tabs flex-wrap flex-grow-1 justify-content-center chatTabs"` · `role="tablist"`.

| Selector | cssText |
|---|---|
| `.flex-grow-1` | `flex-grow:1 !important;` |
| `.flex-wrap` | `flex-wrap:wrap !important;` |
| `.justify-content-center` | `justify-content:center !important;` |
| `ul.chatTabs` | `margin-bottom: 0px;` |
| **`.chatTabs`** | **`border-color: var(--modal-active-tab-border-color) !important;`** (`#45a2ff`) |

### [24] `ul#screenTabs.nav-tabs.screens-tabs` — screens tab strip
- `attrs: id="screenTabs", role="tablist"` · `icon=fas fa-cog` · `rect = 431,90 1558×40`.

| Selector | cssText |
|---|---|
| `.screens-tabs` | `border-color: transparent; position: relative; z-index: 1;` |
| `.screens-tabs, .files-tabs, .noteTabset, .mainTabset #presAreaTabs-notes.active, .mainTabset .nav-item.show #presAreaTabs-notes` | `background-color: var(--notes-tabs-bg)` (`#0c2434`) |

### [25] `ul#streamsTabs.nav-tabs.screens-tabs` — streams tab strip
Identical ruleset to [24] (`.screens-tabs` + `--notes-tabs-bg`). `id="streamsTabs"`, rect 0×0 (inactive).

### [26] `ul#notesTabs.nav-tabs.noteTabset` — notes tab strip
- `icon=fas fa-home` · `attrs: id="notesTabs", role="tablist"`, rect 0×0.

| Selector | cssText |
|---|---|
| `.files-tabs, .mainTabset, .noteTabset` | `border-color:transparent; display:flex; align-items:center; justify-content:center;` |
| `.noteTabset` (bg) | `background-color: var(--notes-tabs-bg)` (`#0c2434`) |
| **`.noteTabset`** | **`border-top: 1px solid var(--tabs-border-color)` (`#0a6db1`)** |

### [27] `ul#myTab.nav-tabs.files-tabs` — files tab strip
- `attrs: id="myTab", role="tablist"`, rect 0×0. Rules: `.d-flex`, `.justify-content-center`, `.files-tabs` (flex centered, border transparent), `background-color: var(--notes-tabs-bg)` (`#0c2434`).

---

### Tab links `.nav-link.active` — exact active/hover/focus matrix (elements 28–33)
All six `.nav-link.active` anchors carry `data-bs-toggle="tab"` + `role="tab"`. They share a long Bootstrap base; the **app-specific rules differ per tab family**. The Bootstrap defaults common to all:

```css
.nav-link            { display:block; padding: var(--bs-nav-link-padding-y) var(--bs-nav-link-padding-x); color: var(--bs-nav-link-color); transition:none; }
.nav-tabs .nav-link  { margin-bottom: calc(-1 * var(--bs-nav-tabs-border-width)); border: 1px solid transparent; border-top-left/right-radius: var(--bs-border-radius); }
.nav-tabs .nav-link:focus, .nav-tabs .nav-link:hover { isolation:isolate; border-color: var(--bs-nav-tabs-link-hover-border-color); }   /* v5 */
.nav-tabs .nav-link:hover, .nav-tabs .nav-link:focus { border-color: rgb(68,68,68) rgb(68,68,68) transparent; }                          /* v4 */
.nav-tabs .nav-link.active { color: rgb(255,255,255); background-color: rgb(34,34,34); border-color: rgb(68,68,68) rgb(68,68,68) transparent; }  /* v4 */
.nav-tabs .nav-link.active, .nav-tabs .nav-item.show .nav-link { color: var(--bs-nav-tabs-link-active-color); background-color: var(--bs-nav-tabs-link-active-bg); border-color: var(--bs-nav-tabs-link-active-border-color); }  /* v5 */
.nav-tabs .nav-link:hover        { cursor: pointer; }
.nav-tabs .nav-link.active:hover { cursor: default; }
```

**App overrides (the rules that actually win) per tab family:**

#### [28] chat tab `.chatTabs .nav-link.active` (`ng-c3761163150`)
| State | cssText |
|---|---|
| base link | `.chatTabs li a { font-weight:700; font-size:12px; padding: 0 5px 5px; margin-right:5px; margin-bottom:0; }` |
| **`.chatTabs .nav-link.active`** | **`border: 1px solid var(--modal-active-tab-border-color) !important;`** (`#45a2ff`) |
| **active (bg/color)** | **`cursor:default; background-color: var(--modal-active-tab-bg-color) !important` (`#45a2ff`); color: var(--modal-active-tab-color) !important (`#fff`);** |
| **`.chatTabs .nav-link:hover`** | **`cursor:pointer; border-color: var(--modal-active-tab-border-color) !important;`** (`#45a2ff`) |
| `.chatTabs .nav-link.active:hover` | `cursor: default;` |

#### [29] screens tab `#screens-tab` (`.screens-tabs .nav-link.active`)
- `attrs: id="screens-tab", data-bs-target="#screens", aria-controls="screens", aria-selected="true"` · `icon=fas fa-desktop` · `rect = 1094,54 79×31`.
- Computed active: **`color #fff; bg rgb(69,162,255)` (`#45a2ff`); `12px/12px` weight 300; `padding 8px`; `border 1px solid transparent`; `border-radius 3px`.**

| State | cssText |
|---|---|
| base | `.screens-tabs .nav-link, .mainTabset .nav-link, .noteTabset .nav-link { padding:0.5rem; font-size:12px; line-height:12px; margin:5px; color: var(--tabs-color)` (`#fff`)`; }` |
| **`.mainTabset/.screens-tabs/.files-tabs/.noteTabset .nav-link.active`** | **`background-color: var(--tab-active-bg)` (`#45a2ff`); border-color:transparent; border-radius:3px; color: var(--note-tabs-color) (`#fff`);** |
| **`…nav-link:hover`** | **`border: 1px solid var(--tabs-border-color)` (`#0a6db1`); border-radius:3px;`** |

#### [30] settings/screen tab `.screens-tabs .nav-link.active` (`fas fa-cog`)
- `attrs: id="6a300cc493c3cb36774d1c0d-tab", aria-controls=…, aria-selected="true"` · `rect = 436,95 128×30`.
- Same `.screens-tabs` family as [29] **plus** a tighter padding rule: `.screens-tabs .nav-link { padding: 4px; }` (computed padding 4px). Active bg `#45a2ff`, radius 3px, hover border `#0a6db1`.

#### [31] notes tab `.noteTabset .nav-link.active` (`fas fa-home`)
- `attrs: id="652765a0e494735aa53574ba-tab", aria-selected="true"`, rect 0×0.
- `.noteTabset .nav-link { padding:0.5rem; font-size:12px; line-height:12px; margin:5px; color: var(--tabs-color); }` → active bg `var(--tab-active-bg)` (`#45a2ff`), radius 3px, color `#fff`; hover `1px solid var(--tabs-border-color)` (`#0a6db1`).

#### [32] files tab `#files-tab` (`.files-tabs .nav-link.active`)
- `class="nav-link d-flex align-items-center justify-content-between active"` · `attrs: id="files-tab", aria-controls="files", aria-selected="true"`, rect 0×0.
| State | cssText |
|---|---|
| base | `.files-tabs .nav-link { padding: 5px 10px; margin:5px; font-size:12px; }` |
| **active** | `background-color: var(--tab-active-bg)` (`#45a2ff`); `border-color:transparent; border-radius:3px; color: var(--note-tabs-color)` (`#fff`); |
| hover | `border: 1px solid var(--tabs-border-color)` (`#0a6db1`); radius 3px |

#### [33] settings-modal tab `#user-app-settings-tab` (`.modal-content .nav-tabs .nav-link.active`)
- `class="nav-link active"` · `attrs: id="user-app-settings-tab", href="#user-app-settings", aria-controls="user-app-settings", aria-selected="true"` · component `ng-c124836360` (this tab lives in a modal).
| State | cssText |
|---|---|
| **`.modal-content .nav-tabs .nav-link.active`** | **`border: 1px solid var(--modal-active-tab-border-color) !important;`** (`#45a2ff`) |
| **active (bg/color)** | **`cursor:default; background-color: var(--modal-active-tab-bg-color) !important` (`#45a2ff`); color: var(--modal-active-tab-color) !important (`#fff`);** |
| **`.modal-content .nav-tabs .nav-link:hover`** | **`cursor:pointer; border-color: var(--modal-active-tab-border-color) !important;`** (`#45a2ff`) |
| `.modal-content .nav-tabs .nav-link.active:hover` | `cursor:default;` |
| `a:link/:visited/:active` | `color: var(--app-link-color)` (`#45a2ff`) — has `href`. |

**Summary of tab-active styling to match 1:1:**
- **In-room presentation/screens/files/notes tabs** → active = `bg #45a2ff` / `color #fff` / `border-radius 3px` / `border transparent`; hover (inactive) = `1px solid #0a6db1` border + `3px` radius; cursor pointer on hover, default when active.
- **Chat tabs & modal tabs** → active = `bg #45a2ff` / `color #fff` / `border 1px solid #45a2ff !important`; hover = `border-color #45a2ff !important`.
- Inactive tab base text color = `var(--tabs-color)` (`#fff`) for screen-family, accent `#45a2ff` for link tabs; font `12px`, `line-height 12px`, `margin 5px`.

---

## E. Files badge — elements 34–36 (`.files-badge`)
Three identical instances (`ng-c2028866615`). `class="badge rounded-pill bg-danger files-badge"`.
- Computed: `color #fff`; `background rgb(220,53,69)` (`#dc3545` Bootstrap danger); `font-size 9px` (=`.75em` of 12px); `font-weight 700`; `line-height 9px`; `padding 3.15px 5.85px` (=`.35em .65em`); **`border-radius 800px` (pill, from `50rem`)**; `text-align center`; `border 1px solid rgb(0,0,0)`.

| Selector | cssText |
|---|---|
| `.badge` (v5, effective) | `--bs-badge-padding-x:.65em; --bs-badge-padding-y:.35em; --bs-badge-font-size:.75em; --bs-badge-font-weight:700; --bs-badge-color:#fff; display:inline-block; padding: var(...y) var(...x); font-size: var(...); font-weight:700; line-height:1; color:#fff; text-align:center; white-space:nowrap; vertical-align:baseline; border-radius: var(--bs-border-radius);` |
| **`.badge` (app)** | **`border: 1px solid rgb(0,0,0);`** (black outline — distinctive vs stock Bootstrap) |
| **`.badge:empty`** | **`display: none;`** (badge hides when count is empty/zero) |
| `.bg-danger` | `--bs-bg-opacity:1; background-color: rgba(var(--bs-danger-rgb),1) !important;` (`#dc3545`) |
| `.rounded-pill` | `border-radius: var(--bs-border-radius-pill) !important;` (`50rem`) |
| **`.files-badge`** | **`margin-top: -9px; margin-left: 3px;`** (pulls the count up onto the tab corner) |

To rebuild the file-count badge: pill, `#dc3545` bg, `#fff` text, `1px solid #000` border, `font-size .75em`, `font-weight 700`, offset `margin-top:-9px; margin-left:3px`, hidden when empty.

---

## F. Webcams / presenter cams / video overlay — elements 37–48

### [37] `app-webcam-holder` — webcam holder host
- `_nghost-ng-c654575438` · `rect = 431,49 0×0`. Universal resets only.

### [38] `.webcam-wrapper` — bottom-anchored webcam strip
- `class="webcam-wrapper d-flex justify-content-center flex-wrap align-items-end w-100"` · `rect = 431,1166 1558×0`.

| Selector | cssText |
|---|---|
| `.d-flex` / `.w-100` / `.flex-wrap` / `.justify-content-center` / `.align-items-end` | flex row, 100% width, wrap, centered horizontally, bottom-aligned |
| **`.webcam-wrapper`** | **`position: absolute; bottom: 0px;`** |

### [39]/[40] `app-presenter-cams` — presenter cams host (two instances)
- `_nghost-ng-c4054903792` · `rect = 1210,1166 0×0`. Universal resets only.

### [41]/[42] `.card.webcamsHolder` — draggable webcam card
- `attrs: id="webcamsHolder-"` · `rect = 1215,1171 320×240`.
- Computed: `bg rgb(0,0,0)`; **`border 1px solid rgb(154,205,50)` (`yellowgreen`)**; `border-radius 6px`.

| Selector | cssText |
|---|---|
| `.card` (v5) | full `--bs-card-*` block; `position:relative; display:flex; flex-direction:column; min-width:0; background-color: var(--bs-card-bg); border: 1px solid var(--bs-card-border-color); border-radius: var(--bs-card-border-radius);` |
| **`.webcamsHolder`** | **`position: absolute; z-index: 105; border: 1px solid yellowgreen; cursor: move; background-color: rgb(0,0,0); width: 320px; height: 240px; margin: 5px;`** |

Distinctive: **`cursor: move`** (drag), **`yellowgreen` (`#9acd32`) 1px border**, black bg, fixed 320×240, `z-index:105`.

### [43]/[44] `video.webcamsHolderVideo` — the webcam `<video>`
- `attrs: autoplay="autoplay", id="webcamVideo-"` · `rect = 1216,1172 318×238`.

| Selector | cssText |
|---|---|
| `.webcamsHolderVideo` | `object-fit: contain; position: relative; width: 100%; height: 100%;` |

`object-fit:contain` (letterboxed, no crop); fills the 320×240 card minus its 1px border.

### [45]/[46] `.overlay` — top overlay strip over the cam
- `rect = 1216,1172 318×0`

| Selector | cssText |
|---|---|
| `.overlay` | `position: absolute; top: 0; left: 0; right: 0; z-index: 101;` |

Sits above the video (`z-index 101`) for top-edge controls.

### [47]/[48] `.pNameLabel` — presenter name caption (`h5`)
- `class="pNameLabel m-0"` · `rect = 1216,1172 318×0`.
- Computed: `color #fff`; **`background rgba(0,0,0,0.5)`**; `font-size 20px` (h5 = `1.25rem`); `font-weight 500`; `line-height 24px`; `text-align center`; `width 100%`; `margin 0`.

| Selector | cssText |
|---|---|
| `h1..h6` (v5) | `margin-top:0; margin-bottom:0.5rem; font-weight:500; line-height:1.2; color: var(--bs-heading-color);` |
| `.h5,h5` | `font-size: 1.25rem;` (=20px; an earlier `1.17188rem` is shadowed) |
| `.m-0` | `margin: 0px !important;` |
| **`.pNameLabel`** | **`background-color: rgba(0,0,0,0.5); color: rgb(255,255,255); text-align: center; width: 100%;`** |

Semi-transparent black name caption, centered white text, full width, no margin.

---

## G. Presentation split area — element 49

### [49] `as-split-area.presentation-box` — the angular-split content pane
- `class="presentation-box as-split-area"` · `attrs: minsize="0"` · `rect = 431,49 1558×1117`.
- Computed bg: `var(--presenter-area-bg)` (`#0f2e43`).

| Selector | cssText |
|---|---|
| **`.presentation-box`** | **`position: relative; background-color: var(--presenter-area-bg)` (`#0f2e43`); overflow: hidden !important;`** |
| `[_nghost-ng-c3013344202] > .as-split-area` | `flex-grow:0; flex-shrink:0; overflow: hidden auto;` |
| `.as-horizontal[_nghost-…] > .as-split-area` | `height: 100%;` |

The main presentation pane: dark navy `#0f2e43` background, clipped overflow, managed by `angular-split` (`as-split-area`, `minsize="0"`).

---

## H. Glyph (`::before`) inventory captured on these elements
| Element | FA class | `content` | size | weight | color |
|---|---|---|---|---|---|
| [03] mobile-app btn | `fas fa-mobile` | `\f10b` | 16px | 900 | `#fff` |
| [14] sidebar refresh | `fas fa fa-sync` | `\f021` | 14px | 900 | **`#45a2ff`** |
| [15] navbar reconnect | `fas fa-2x fa-sync` | `\f021` | 32px | 900 | `#abb0b5` |
| [16] files refresh | `fas fa-sync` | `\f021` | 12px | 900 | `#fff` |

All glyphs: `font-family:"Font Awesome 5 Free"`, solid (weight 900), transparent background, `line-height:1`, `display:inline-block`, `-webkit-font-smoothing:antialiased`. The room's other targeted `icon` fields (`fas fa-bars`, `fa-user`, `fa-bell`, `fa-comment(s)`, `fa-microphone`, `fa-desktop`, `fa-cog`, `fa-home`, `fa-check`, `fa-times`, `fa-closed-captioning`) name the nearest associated glyph but did not capture a resolved `::before` block on the targeted node itself.

---

## I. Key takeaways for 1:1 matching
1. **Accent blue `#45a2ff`** is the universal "active/selected/link" color: active tabs bg, link color, sidebar-refresh glyph, modal/chat active tab border.
2. **Active tab pattern** = `bg #45a2ff`, `color #fff`, `border-radius 3px`; inactive-hover = `1px solid #0a6db1` + `radius 3px`. Chat/modal tabs use `border 1px solid #45a2ff !important` instead.
3. **Navbar** = `#0c2434` bg, white text, fixed-top, `height 49px`, `padding 0`. Sidebar hamburger = `#103d5c` bg, hover text `#eee`.
4. **Files badge** = danger pill `#dc3545`, white text, **black 1px border**, `font .75em/700`, offset `-9px/3px`, `display:none` when empty.
5. **Webcam card** = black bg, **`yellowgreen` 1px border**, `cursor:move`, `320×240`, `z-index 105`; video `object-fit:contain`; name caption `rgba(0,0,0,.5)` white centered.
6. **Presentation pane** bg = `#0f2e43`, `overflow:hidden`.
7. **Global resets** kill all text/box shadows app-wide (`!important`).
8. Two Bootstrap layers coexist (v4 literals shadowed by v5 `--bs-*`); when rebuilding, use the **v5 token-driven values** as effective.

---


<a id="10"></a>

## 10. Theme & Design Tokens — The Design-Token Source of Truth

> Reconstructed from `evidence-folder/_slices/theme.json` (admin trading room, viewport 1989×1166). THIRD-PARTY VISUAL REFERENCE ONLY — values document the reference's structure/CSS so we can rebuild equivalent tokens in our own SvelteKit stack; their text/data is never reproduced as ours.

This section is the **complete design-token catalog**. It covers every CSS custom property on `:root` (294 total — 123 Bootstrap `--bs-*` + 171 app-specific), the dominant color/size usage counts (`palette`), and the loaded font families (`fonts`). The app is built on **Bootstrap 5.3 "Darkly"-derived theme** (note `--primary: #375a7f`, `--success: #00bc8c` — the Bootswatch Darkly palette) with a heavy **custom navy/blue chat skin** layered on top, plus **Font Awesome 5** for all glyph icons (this confirms the icon system is `fa-*` classes, NOT Phosphor — when WE rebuild, we map each `fa-*` to a `phosphor-svelte` `*Icon`).

Key facts established here, used by every other section:
- `:root` and `body` carry **identical** variable sets (0 diffs) — there is no per-scope override at the `body` level; theme switching is class-driven (`lightTheme-*` vs `darkTheme-*` token families exist as parallel sets).
- The app ships **two palettes simultaneously**: a `darkTheme-*` set (navy/black chat) and a `lightTheme-*` set (white/gray chat). The admin room screenshot is the **dark** variant.
- Three brand-anchor colors dominate the custom skin and recur across 14–18 token aliases each: **`#45a2ff`** (accent/link/active blue), **`#0a6db1`** (header/username blue), **`#103d5c`** (sidebar/modal navy).

---

### 10.1 Font system (`fonts`)

#### 10.1.1 Effective font stacks (what actually renders)

`palette.fontFamily` shows what computed `font-family` resolves to across all elements — the truth on screen, regardless of token declarations:

| Computed `font-family` | Element count | Role |
|---|---:|---|
| `"Open Sans", sans-serif` | 23,265 | **The actual body/UI font** — dominant everywhere |
| `"Font Awesome 5 Free"` | 600 | Icon glyphs (`::before` content) |
| `Arial, sans-serif` | 202 | Isolated fallback nodes (likely Summernote editor) |
| `sans-serif` | 53 | Bare fallback |
| `-apple-system-font` | 1 | One stray node |

> **Token-vs-reality discrepancy (important for rebuild):** The token `--font-family-sans-serif` declares a **Lato**-led stack, and `--bs-body-font-family` declares a `system-ui`-led stack — but the computed result on 23k+ nodes is **`"Open Sans", sans-serif`** via `--app-font-family: 'Open Sans', sans-serif`. The app-level override wins. **Use Open Sans as the primary UI font.**

#### 10.1.2 Declared font tokens

| Token | Value |
|---|---|
| `--app-font-family` | `'Open Sans', sans-serif` ← **the one that wins** |
| `--font-family-sans-serif` | `"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"` |
| `--font-family-monospace` | `SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` |
| `--bs-body-font-family` | `system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans","Liberation Sans",Arial,sans-serif,…` |
| `--bs-font-sans-serif` | same `system-ui`-led stack |
| `--bs-font-monospace` | `SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace` |
| `--bs-body-font-size` | `1rem` |
| `--bs-body-font-weight` | `400` |
| `--bs-body-line-height` | `1.5` |

#### 10.1.3 `@font-face` declarations (`fonts.fontFaceRules`) & files

Four `@font-face` rules; all font files are self-hosted under `https://chat.protradingroom.com/webfonts/` (+ a hashed Summernote bundle). **Open Sans and Lato are NOT in any `@font-face`** — they are expected to be loaded elsewhere (Google Fonts link or a stylesheet not in this slice); only icon/editor fonts are declared here.

| `font-family` | `font-style` | `font-weight` | `src` files (`woff2`/`woff`/`ttf`) |
|---|---|---|---|
| `"Font Awesome 5 Brands"` | normal | normal | `fa-brands-400.{woff2,woff,ttf}` |
| `"Font Awesome 5 Free"` | normal | **400** (regular) | `fa-regular-400.{woff2,woff,ttf}` |
| `"Font Awesome 5 Free"` | normal | **900** (solid) | `fa-solid-900.{woff2,woff,ttf}` |
| `summernote` | normal | 400 | `summernote.<hash>.{woff2,woff,ttf}` (rich-text editor toolbar glyphs) |

All declared `font-display: auto`. Full file URL list (12):
```
/webfonts/fa-brands-400.{woff2,woff,ttf}
/webfonts/fa-regular-400.{woff2,woff,ttf}
/webfonts/fa-solid-900.{woff2,woff,ttf}
/summernote.<hash>.{woff2,woff,ttf}
```

#### 10.1.4 Loaded-font report (`fonts.loaded`)

`document.fonts` enumeration at capture time:

| Family | Style | Weight | Status |
|---|---|---|---|
| Font Awesome 5 Brands | normal | normal | unloaded |
| **Font Awesome 5 Free** | normal | **400** | **loaded** |
| **Font Awesome 5 Free** | normal | **900** | **loaded** |
| Lato | italic | 400 | unloaded |
| Lato | normal | 400 | unloaded |
| Lato | normal | 700 | unloaded |
| summernote | normal | 400 | unloaded |

Only the two Font Awesome 5 Free weights (regular 400 + solid 900) were actually drawn — consistent with `fa-*` icons being the only `@font-face`-driven glyphs on the admin screen. Lato declarations were registered but never rendered (Open Sans won via `--app-font-family`).

#### 10.1.5 Font weights & sizes actually used (`palette`)

Weight distribution (`palette.fontWeight`): the body default is **300 (light)** — 13,703 nodes — with **700 (bold)** for emphasis (6,473), **100** thin (1,936), **400** (1,058), **900** for FA-solid icons (649), **600** (253), **500** (49).

Font-size distribution (`palette.fontSize`): base is **16px** (22,868 nodes). Notable secondary sizes: **14px** (275), **12px** (229), **14.6667px** = `0.9167rem` (186), **13px** (184), **20px** (177), **10px** (123); large/display sizes 24/28/32/36px appear in low counts (headings/modals). `0.1px` (8) is a measurement-hidden node.

Line-height distribution (`palette.lineHeight`): base **24px** (= 16px×1.5) on 22,347 nodes; secondaries 16px, 21px, 19.5px, 17.6px, 18px, 30px.

---

### 10.2 Bootstrap base tokens (`--bs-*`, 123 vars)

These are the standard Bootstrap 5.3 CSS variables with a **Darkly-flavored** override layer. Grouped below. (Where the app's custom `--primary`/`--success` etc. differ from `--bs-primary`, see §10.3 — the app keeps BOTH and the non-`bs` names are the Darkly values.)

#### 10.2.1 Core body / typography
| Token | Value |
|---|---|
| `--bs-body-bg` | `#fff` (`255,255,255`) |
| `--bs-body-color` | `#212529` (`33,37,41`) ← **dominant text color, 19,219 nodes** |
| `--bs-body-font-family` | system-ui stack (overridden by Open Sans in practice) |
| `--bs-body-font-size` | `1rem` |
| `--bs-body-font-weight` | `400` |
| `--bs-body-line-height` | `1.5` |
| `--bs-emphasis-color` | `#000` |
| `--bs-heading-color` | *(empty — inherits)* |
| `--bs-highlight-bg` | `#fff3cd` |
| `--bs-highlight-color` | `#212529` |
| `--bs-code-color` | `#d63384` |

#### 10.2.2 Bootstrap palette (named colors)
| Token | Value | Token | Value |
|---|---|---|---|
| `--bs-blue` | `#0d6efd` | `--bs-indigo` | `#6610f2` |
| `--bs-purple` | `#6f42c1` | `--bs-pink` | `#d63384` |
| `--bs-red` | `#dc3545` | `--bs-orange` | `#fd7e14` |
| `--bs-yellow` | `#ffc107` | `--bs-green` | `#198754` |
| `--bs-teal` | `#20c997` | `--bs-cyan` | `#0dcaf0` |
| `--bs-black` | `#000` (`0,0,0`) | `--bs-white` | `#fff` (`255,255,255`) |
| `--bs-gray` | `#6c757d` | `--bs-gray-dark` | `#343a40` |

Gray scale: `--bs-gray-100` `#f8f9fa` · `-200` `#e9ecef` · `-300` `#dee2e6` · `-400` `#ced4da` · `-500` `#adb5bd` · `-600` `#6c757d` · `-700` `#495057` · `-800` `#343a40` · `-900` `#212529`.

#### 10.2.3 Bootstrap semantic colors (+ `-rgb`, `-bg-subtle`, `-border-subtle`, `-text-emphasis`)
| Semantic | base | `-rgb` | `-bg-subtle` | `-border-subtle` | `-text-emphasis` |
|---|---|---|---|---|---|
| primary | `#0d6efd` | `13,110,253` | `#cfe2ff` | `#9ec5fe` | `#052c65` |
| secondary | `#6c757d` | `108,117,125` | `#e2e3e5` | `#c4c8cb` | `#2b2f32` |
| success | `#198754` | `25,135,84` | `#d1e7dd` | `#a3cfbb` | `#0a3622` |
| info | `#0dcaf0` | `13,202,240` | `#cff4fc` | `#9eeaf9` | `#055160` |
| warning | `#ffc107` | `255,193,7` | `#fff3cd` | `#ffe69c` | `#664d03` |
| danger | `#dc3545` | `220,53,69` | `#f8d7da` | `#f1aeb5` | `#58151c` |
| light | `#f8f9fa` | `248,249,250` | `#fcfcfd` | `#e9ecef` | `#495057` (light-text-emphasis) |
| dark | `#212529` | `33,37,41` | `#ced4da` (dark-bg-subtle) | `#adb5bd` (dark-border-subtle) | `#495057` (dark-text-emphasis) |

Background/secondary layers: `--bs-secondary-bg` `#e9ecef` (`233,236,239`) · `--bs-secondary-color` `rgba(33,37,41,.75)` · `--bs-tertiary-bg` `#f8f9fa` (`248,249,250`) · `--bs-tertiary-color` `rgba(33,37,41,.5)`.

#### 10.2.4 Links / focus / forms
| Token | Value |
|---|---|
| `--bs-link-color` | `#0d6efd` (`13,110,253`) |
| `--bs-link-hover-color` | `#0a58ca` (`10,88,202`) |
| `--bs-link-decoration` | `underline` |
| `--bs-focus-ring-color` | `rgba(13,110,253,.25)` |
| `--bs-focus-ring-width` | `.25rem` |
| `--bs-focus-ring-opacity` | `.25` |
| `--bs-form-valid-color` / `-border-color` | `#198754` |
| `--bs-form-invalid-color` / `-border-color` | `#dc3545` |

#### 10.2.5 Borders / radius / shadows / gradient
| Token | Value |
|---|---|
| `--bs-border-color` | `#dee2e6` (`222,226,230`) ← 2nd-most-used border, 2,152 nodes |
| `--bs-border-color-translucent` | `rgba(0,0,0,.175)` |
| `--bs-border-width` | `1px` |
| `--bs-border-style` | `solid` |
| `--bs-border-radius` | `.375rem` |
| `--bs-border-radius-sm` | `.25rem` · `-lg` `.5rem` · `-xl` `1rem` · `-xxl`/`-2xl` `2rem` · `-pill` `50rem` |
| `--bs-box-shadow` | `0 .5rem 1rem rgba(0,0,0,.15)` |
| `--bs-box-shadow-sm` | `0 .125rem .25rem rgba(0,0,0,.075)` |
| `--bs-box-shadow-lg` | `0 1rem 3rem rgba(0,0,0,.175)` |
| `--bs-box-shadow-inset` | `inset 0 1px 2px rgba(0,0,0,.075)` |
| `--bs-gradient` | `linear-gradient(180deg, rgba(255,255,255,.15), rgba(255,255,255,0))` |

#### 10.2.6 Breakpoints (Bootstrap)
`--bs-breakpoint-xs` `0` · `-sm` `576px` · `-md` `768px` · `-lg` `992px` · `-xl` `1200px` · `-xxl` `1400px`. (The app also re-declares `--breakpoint-*` without the `xxl`, see §10.3.7.)

---

### 10.3 App-specific custom tokens (171 vars) — the chat skin

This is the part WE actually rebuild. Grouped by functional family. **Resolve key brand anchors in §10.4.**

#### 10.3.1 Brand / accent / named-color aliases
The app re-declares Bootswatch **Darkly** named colors (these differ from `--bs-*`):

| Token | Value | Token | Value |
|---|---|---|---|
| `--primary` | `#375a7f` | `--blue` | `#375a7f` |
| `--secondary` | `#444` | `--success` | `#00bc8c` |
| `--info` | `#3498DB` | `--warning` | `#F39C12` |
| `--danger` | `#E74C3C` | `--cyan` | `#3498DB` |
| `--green` | `#00bc8c` | `--teal` | `#20c997` |
| `--indigo` | `#6610f2` | `--purple` | `#6f42c1` |
| `--pink` | `#e83e8c` | `--orange` | `#fd7e14` |
| `--yellow` | `#ff0` | `--red` | `#f00` |
| `--white` | `#fff` | `--black` | `#000` |
| `--gray` | `#bbb` | `--gray-dark` | `#303030` |
| `--light` | `#303030` | `--dark` | `#adb5bd` |
| `--app-link-color` | `#45a2ff` | `--ptr-website-link-color` | `#45a2ff` |
| `--transparent-gray` | `rgba(255,255,255,0.331)` | `--fire-yellow` | `#f7fd37` |

Extended gray/black/blue/brown ramp (custom, used by the dark skin):
| Token | Value | Token | Value |
|---|---|---|---|
| `--dark-black` | `#222` | `--darker-black` | `#111` |
| `--light-black` | `#373c42` | `--lighter-black` | `#3e444a` |
| `--dark-gray` | `#aaa` | `--darker-gray` | `#aaa6a6` |
| `--light-gray` | `#ccc` | `--lighter-gray` | `#eee` |
| `--dark-brown` | `#4b4b4b` | `--light-brown` | `#8c8686` |
| `--brown` | `#555` | `--light-blue` | `#40e0d0` |
| `--lighter-blue` | `#edf2f6` | `--light-green` | `#1edd6e` |

#### 10.3.2 Dark-theme chat palette (`--darkTheme-*`, 20 vars) — **the admin screen uses these**
| Token | Value | Meaning |
|---|---|---|
| `--darkTheme-chat-bg` | `#000` | chat scroll background |
| `--darkTheme-msgs-bg` | `#143c57` | regular message-row bg (navy) |
| `--darkTheme-msgs-bg-adm` | `#0f2e43` | **admin/staff message-row bg** (darker navy) |
| `--darkTheme-msg-bg` | `#000` | individual message bubble bg |
| `--darkTheme-msg-color` | `#fff` | message text |
| `--darkTheme-msg-border-color` | `#f4f4f4` | message border |
| `--darkTheme-username-color` | `#0a6db1` | username link |
| `--darkTheme-nickname-color` | `#c0d8ed` | nickname |
| `--darkTheme-date-color` | `#a8a8a8` | timestamp |
| `--darkTheme-roster-bg` | `#111` | roster (user list) bg |
| `--darkTheme-roster-bg-adm` | `#000` | admin roster bg |
| `--darkTheme-sidebar-wrapper-bg-color` | `#000` | sidebar bg |
| `--darkTheme-sidebar-wrapper-color` | `#f4f4f4` | sidebar text |
| `--darkTheme-textarea-bg` | `#0c2434` | composer textarea bg |
| `--darkTheme-textarea-color` | `#f4f4f4` | composer text |
| `--darkTheme-user-location-color` | `#f4f4f4` | user location label |
| `--darkTheme-mobileApp-info-color` | `#f4f4f4` | mobile info banner text |
| `--darkTheme-msgs-separator-bg` | `#222` | date-separator bg |
| `--darkTheme-msgs-separator-border-color` | `#373c42` | separator border |
| `--darkTheme-msgs-separator-color` | `#aaa` | separator text |

#### 10.3.3 Light-theme chat palette (`--lightTheme-*`, 20 vars) — parallel set for light mode
| Token | Value | Token | Value |
|---|---|---|---|
| `--lightTheme-chat-bg` | `#eee` | `--lightTheme-msgs-bg` | `#fff` |
| `--lightTheme-msgs-bg-adm` | `#f4f4f4` | `--lightTheme-msg-bg` | `#fff` |
| `--lightTheme-msg-color` | `#676767` | `--lightTheme-msg-border-color` | `#e1e1e1` |
| `--lightTheme-username-color` | `#0a6db1` | `--lightTheme-nickname-color` | `#676767` |
| `--lightTheme-date-color` | `#a8a8a8` | `--lightTheme-roster-bg` | `#f1f1f1` |
| `--lightTheme-roster-bg-adm` | `#e1e1e1` | `--lightTheme-sidebar-wrapper-bg-color` | `#fff` |
| `--lightTheme-sidebar-wrapper-color` | `#676767` | `--lightTheme-textarea-bg` | `#fff` |
| `--lightTheme-textarea-color` | `#676767` | `--lightTheme-user-location-color` | `#676767` |
| `--lightTheme-mobileApp-info-color` | `#676767` | `--lightTheme-msgs-separator-bg` | `#e8e8e8` |
| `--lightTheme-msgs-separator-border-color` | `#373c42` | `--lightTheme-msgs-separator-color` | `#373c42` |

> The two theme families are **structurally identical** (same 20 keys); a `.lightTheme`/`.darkTheme` class on a wrapper picks which family the non-prefixed `--msgs-*`, `--textarea-*`, `--sidebar-*` etc. resolve to. For our rebuild this maps cleanly to a `data-theme` attribute + two token blocks.

#### 10.3.4 Modal dark palette (`--modal-*`, 17 vars)
| Token | Value | Meaning |
|---|---|---|
| `--modal-content-bg-color` | `#103d5c` | modal body bg (navy) |
| `--modal-content-border-color` | `#103d5c` | modal border |
| `--modal-content-color` | `#f4f4f4` | modal text |
| `--modal-active-tab-bg-color` | `#45a2ff` | active tab fill |
| `--modal-active-tab-border-color` | `#45a2ff` | active tab border |
| `--modal-active-tab-color` | `#fff` | active tab text |
| `--modal-tabs-border-color` | `#45a2ff` | tab strip border |
| `--modal-btn-close-bg` | `#0a6db1` | close-btn bg |
| `--modal-btn-close-border` | `#0a6db1` | close-btn border |
| `--modal-btn-danger-bg` | `#bb352a` | danger-btn bg (red) |
| `--modal-btn-danger-border` | `#bb352a` | danger-btn border |
| `--modal-btn-success-bg` | `#92d528` | success-btn bg (green) |
| `--modal-btn-success-border` | `#92d528` | success-btn border |
| `--modal-btn-hover-opacity` | `0.9` | btn hover opacity |
| `--modal-alert-link-color` | `#0a6db1` | alert link |
| `--modal-input-group-bg` | `#0a6db1` | input-group addon bg |
| `--modal-upload-files-color` | `#0a6db1` | upload label color |

#### 10.3.5 Sidebar / navbar / roster / tabs / split / search / reload
| Token | Value | | Token | Value |
|---|---|---|---|---|
| `--sidebar-wrapper-bg-color` | `#103d5c` | | `--sidebar-wrapper-color` | `#fff` |
| `--sidebar-menu-bg` | `#103d5c` | | `--sidebar-menu-color` | `#fff` |
| `--sidebar-menu-active-color` | `#45a2ff` | | `--sidebar-navItem-border-color` | `#fff` |
| `--navbar-bg` | `#0c2434` | | `--navbar-color` | `#fff` |
| `--users-color` | `#fff` | | `--users-border-color` | `#fff` |
| `--users-badge-bg-color` | `#0e3651` | | `--users-badge-color` | `#f4f4f4` |
| `--rosterImg-border-radius` | `50%` | | `--avatar-gear-icon-padding` | `3px 6px` |
| `--tabs-color` | `#fff` | | `--tabs-border-color` | `#0a6db1` |
| `--tabs-dropdown-bg` | `#0f2e43` | | `--tabs-dropdown-color` | `#45a2ff` |
| `--tab-active-bg` | `#45a2ff` | | `--split-gutter-bg` | `#0a6db1` |
| `--split-gutter-color` | `#fff` | | `--search-icon-bg-color` | `#45a2ff` |
| `--search-icon-color` | `#f4f4f4` | | `--reload-icon-bg-color` | `#f4f4f4` |
| `--reload-icon-color` | `#45a2ff` | | `--checkbox-bg-color` | `#45a2ff` |
| `--dropdown-divider-bg` | `#45a2ff` | | `--session-control-dropdown-bg` | `#0e3651` |
| `--archives-dropdown-menu-bg-color` | `#0e3651` | | `--archives-dropdown-menu-color` | `#45a2ff` |

#### 10.3.6 Messages header / separator / username / textarea-holder / presenter / notes / files
**Messages chrome:**
| Token | Value | | Token | Value |
|---|---|---|---|---|
| `--msgs-header-bg` | `#0a6db1` | | `--msgs-header-color` | `#fff` |
| `--msgs-separator-bg` | `#45a2ff` | | `--msgs-separator-color` | `#fff` |
| `--msgs-separator-border-color` | `#45a2ff` | | `--name-color` | `#c0d8ed` |
| `--nickname-color` | `#0a6db1` | | | |

**Composer (textarea holder):**
| Token | Value |
|---|---|
| `--textarea-bg` | `#111` |
| `--textarea-holder-border-color` | `#0a6db1` |
| `--textarea-holder-btns-color` | `#676767` |
| `--textarea-holder-btns-hover-color` | `#0a6db1` |

**Presenter / recording:**
| Token | Value |
|---|---|
| `--presenter-area-bg` | `#0f2e43` |
| `--presenter-recording-color` | `#45a2ff` (recording indicator) |
| `--presenter-noRecording-color` | `#fff` |

**Notes panel (`--note*`):**
| Token | Value | | Token | Value |
|---|---|---|---|---|
| `--notes-tabs-bg` | `#0c2434` | | `--note-tabs-color` | `#fff` |
| `--note-text-bg` | `#fff` | | `--note-text-color` | `#676767` |
| `--note-options-bg` | `#f4f4f4` | | `--note-options-color` | `#fff` |
| `--note-options-hover-color` | `#212529` | | `--note-next-bg` | `#45a2ff` |
| `--note-download-bg` | `#92d528` | | `--note-delete-bg` | `#bb352a` |

**File-share panel (`--file*`):**
| Token | Value | | Token | Value |
|---|---|---|---|---|
| `--file-name-color` | `#0a6db1` | | `--file-size-color` | `#b2b2b2` |
| `--file-list-odd-bg` | `#fff` | | `--file-list-even-bg` | `#f4f4f4` |
| `--file-download-bg` | `#92d528` | | `--file-delete-bg` | `#bb352a` |
| `--file-see-more-bg` | `#45a2ff` | | `--file-searchbar-bg` | `#fff` |
| `--file-searchbar-color` | `#b7b7b7` | | `--file-searchbar-icon-color` | `#666666` |

**Mobile-app info banner:** `--mobileApp-info-bg-color` `transparent` · `--mobileApp-info-color` `#f4f4f4`.

#### 10.3.7 App breakpoints (custom mirror)
`--breakpoint-xs` `0` · `-sm` `576px` · `-md` `768px` · `-lg` `992px` · `-xl` `1200px`. (Mirrors Bootstrap minus `xxl`.)

---

### 10.4 Resolved token chains (semantic anchors)

The custom skin is built on **three navy/blue anchor colors** plus a green/red action pair and an off-white. Each anchor is aliased by many tokens — change the anchor, the whole skin shifts. This is the highest-leverage table for our rebuild (define 8 base colors → derive the rest).

| Anchor hex | Role | # of token aliases | Representative aliases |
|---|---|---:|---|
| **`#45a2ff`** | **Accent / link / active-state blue** | **18** | `--app-link-color`, `--tab-active-bg`, `--sidebar-menu-active-color`, `--modal-active-tab-bg-color`, `--msgs-separator-bg`, `--checkbox-bg-color`, `--search-icon-bg-color`, `--reload-icon-color`, `--note-next-bg`, `--file-see-more-bg`, `--dropdown-divider-bg`, `--presenter-recording-color`, `--archives-dropdown-menu-color`, `--tabs-dropdown-color`, `--ptr-website-link-color`, `--modal-tabs-border-color`, `--modal-active-tab-border-color`, `--msgs-separator-border-color` |
| **`#0a6db1`** | **Header / username / primary-action blue** | **14** | `--msgs-header-bg`, `--nickname-color`, `--lightTheme-username-color`, `--darkTheme-username-color`, `--file-name-color`, `--tabs-border-color`, `--split-gutter-bg`, `--modal-btn-close-bg/-border`, `--modal-input-group-bg`, `--modal-alert-link-color`, `--modal-upload-files-color`, `--textarea-holder-border-color`, `--textarea-holder-btns-hover-color` |
| **`#103d5c`** | **Sidebar / modal-body navy** | **4** | `--sidebar-wrapper-bg-color`, `--sidebar-menu-bg`, `--modal-content-bg-color`, `--modal-content-border-color` |
| **`#0c2434`** | **Navbar / composer / notes-tab dark navy** | **3** | `--navbar-bg`, `--darkTheme-textarea-bg`, `--notes-tabs-bg` |
| **`#0e3651`** | **Dropdown / badge navy** | **3** | `--session-control-dropdown-bg`, `--archives-dropdown-menu-bg-color`, `--users-badge-bg-color` |
| **`#0f2e43`** | **Presenter / tabs-dropdown / admin-msg navy** | **3** | `--presenter-area-bg`, `--tabs-dropdown-bg`, `--darkTheme-msgs-bg-adm` |
| **`#143c57`** | **Regular dark message-row bg** | 1 | `--darkTheme-msgs-bg` |
| **`#92d528`** | **Success / download / save green** | **4** | `--modal-btn-success-bg/-border`, `--file-download-bg`, `--note-download-bg` |
| **`#bb352a`** | **Danger / delete red** | **4** | `--modal-btn-danger-bg/-border`, `--file-delete-bg`, `--note-delete-bg` |
| **`#f4f4f4`** | **Off-white text/surface on dark** | **13** | `--modal-content-color`, `--darkTheme-textarea-color`, `--darkTheme-sidebar-wrapper-color`, `--users-badge-color`, `--reload-icon-bg-color`, `--search-icon-color`, `--note-options-bg`, `--file-list-even-bg`, `--mobileApp-info-color`, `--darkTheme-msg-border-color`, `--darkTheme-user-location-color`, `--darkTheme-mobileApp-info-color`, `--lightTheme-msgs-bg-adm` |
| **`#676767`** | **Light-theme body text gray** | **8** | `--lightTheme-msg-color`, `--lightTheme-nickname-color`, `--lightTheme-textarea-color`, `--lightTheme-sidebar-wrapper-color`, `--note-text-color`, `--textarea-holder-btns-color`, `--lightTheme-user-location-color`, `--lightTheme-mobileApp-info-color` |
| **`#c0d8ed`** | **Nickname pale blue** | 2 | `--name-color`, `--darkTheme-nickname-color` |

**Minimal base set to reproduce the skin (8 colors):** `#45a2ff` (accent), `#0a6db1` (header/username), `#103d5c` (sidebar/modal), `#0c2434` (navbar/composer), `#0e3651`/`#0f2e43`/`#143c57` (navy depth ramp), `#92d528` (green), `#bb352a` (red), `#f4f4f4` (off-white), `#676767` (light text).

---

### 10.5 Dominant computed colors (`palette` — what actually paints)

These counts are the on-screen reality (computed values across all DOM nodes), independent of token names — use them to sanity-check a rebuild's pixel match.

#### 10.5.1 Text color (`palette.color`)
| Computed | Count | Maps to |
|---|---:|---|
| `rgb(33,37,41)` `#212529` | 19,219 | `--bs-body-color` (default text) |
| `rgb(204,204,204)` `#ccc` | 1,926 | `--light-gray` |
| `rgb(69,162,255)` `#45a2ff` | 1,073 | accent blue (links/active) |
| `rgb(244,244,244)` `#f4f4f4` | 406 | off-white on dark |
| `rgb(103,103,103)` `#676767` | 346 | light-theme gray text |
| `rgb(0,0,0)` / `rgb(255,255,255)` | 285 / 285 | black / white |
| `rgb(10,109,177)` `#0a6db1` | 228 | header/username blue |
| `rgb(168,168,168)` `#a8a8a8` | 102 | date/timestamp |
| `rgb(26,26,26)` `#1a1a1a` | 98 | near-black |
| `rgb(0,128,64)`, `rgb(56,118,29)` | 18, 8 | green text (trade/positive) |

#### 10.5.2 Background color (`palette.backgroundColor`)
| Computed | Count | Maps to |
|---|---:|---|
| `rgb(255,255,255)` `#fff` | 2,268 | white surfaces |
| `rgb(14,54,81)` `#0e3651` | 126 | dropdown/badge navy |
| `rgb(108,117,125)` `#6c757d` | 66 | `--bs-gray`/secondary |
| `rgb(69,162,255)` `#45a2ff` | 31 | accent fills (active tab, buttons) |
| `rgb(232,232,232)` `#e8e8e8` | 26 | light separator |
| `rgb(244,244,244)` `#f4f4f4` | 23 | off-white panels |
| `rgb(16,61,92)` `#103d5c` | 23 | sidebar/modal navy |
| `rgb(10,109,177)` `#0a6db1` | 16 | header blue |
| `rgb(146,213,40)` `#92d528` | 10 | success/download green |
| `rgb(12,36,52)` `#0c2434` | 6 | navbar/composer navy |
| `rgb(220,53,69)` `#dc3545` | 3 | bootstrap danger |

#### 10.5.3 Border color (`palette.borderColor`)
Dominated by `rgb(33,37,41)` `#212529` (17,079 — the default `border-color` on reset elements), then `rgb(222,226,230)` `#dee2e6` = `--bs-border-color` (2,152), `rgb(204,204,204)` `#ccc` (1,780), `rgb(69,162,255)` `#45a2ff` (1,125 — accent borders/separators), `#676767` (346), `#f4f4f4` (333), `#0a6db1` (239). Border-top-width is almost entirely `1px` (385) with a single `2px`.

#### 10.5.4 Radius / spacing / z-index / shadow
- **Border-radius** (`palette.borderRadius`): dominant **`6px`** (245), then `4px` (82), `50%` (34, avatars — matches `--rosterImg-border-radius`), `8px` (24), `7px` (23), `12px` (4), `800px`/`5px` (pills). Bootstrap's `.375rem`=6px is the de-facto default.
- **Padding** (`palette.paddingTop`/`paddingLeft`): top dominated by `8px` (2,328) then `4px` (619); left dominated by `16px` (2,643) then `5px`/`4px`/`8px`/`12px`. Base rhythm is an **8px/16px** grid.
- **Margin-top** (`palette.marginTop`): `4px` (216) dominant; notable `28px`, `-8px`, `5px`, `16px`.
- **Gap** (`palette.gap`): `8px` (3), `6px` (1) — flex gaps are sparse; most spacing is padding/margin.
- **z-index** (`palette.zIndex`): `1000` (166 — dropdowns/tooltips), `1055` (20 — Bootstrap modal), `1054`/`1030` (modal backdrop/sticky), plus app layers `90/100/101/102/105/500/501/1999/10000/999999`.
- **Box-shadow** (`palette.boxShadow`): only two distinct shadows actually paint — `rgba(0,0,0,0) 0 0 0 9999px inset` (5, a transparent inset spread used as a hover/focus trick) and **`rgba(0,0,0,0.5) 0 4px 20px 0`** (1, the modal/overlay drop shadow). The UI is otherwise **flat** (no ambient shadows) — important for pixel match.
- **Opacity** (`palette.opacity`): overwhelmingly `1` (24,053); `0` (35, hidden), `0.5` (23, disabled), `0.25` (9), `0.7` (1).
- **font-style**: `italic` appears on 4,232 nodes (likely Open Sans italic on timestamps/system messages). **text-transform**: `uppercase` on 41 nodes (labels/tab headers only).

---

### 10.6 `data-*` attribute vocabulary (`inventory.dataAttributes`)

The theme slice records which `data-*` hooks exist app-wide — these drive interactive behavior documented in other sections, listed here for completeness:

`data-critters-container` · **`data-bs-toggle`** · **`data-bs-target`** · **`data-bs-dismiss`** · **`data-bs-auto-close`** (Bootstrap 5 JS API: dropdowns/modals/tabs/collapse) · `data-keyboard` · `data-backdrop` (legacy BS modal options) · `data-ng-dblclick` (**AngularJS** double-click handler — confirms an AngularJS layer, not just Angular) · `data-filename` · `data-start` / `data-end` / `data-spread` (range/slider or message-grouping markers) · `data-darkreader-inline-bgcolor` / `data-darkreader-inline-color` (injected by the user's DarkReader extension — **noise**, ignore for rebuild).

---

### 10.7 Rebuild guidance (our SvelteKit stack)

1. **Primary UI font = Open Sans** (`--app-font-family`), self-host `woff2`; weights **300 / 400 / 700** observed (base 300, bold 700). Body size **16px / line-height 1.5 (24px)**.
2. **Icons:** reference uses **Font Awesome 5** (`fa-regular-400` + `fa-solid-900`). When rebuilding, map each `fa-*` to a `phosphor-svelte` `*Icon` (per global CLAUDE.md, standardize on the `*Icon` suffix). Do NOT load FA.
3. **Two token blocks** keyed by theme (`darkTheme-*` vs `lightTheme-*`) — implement as `:root[data-theme="dark"]` / `[data-theme="light"]`. Admin room = dark.
4. **8-color base** (§10.4) → derive the ~80 semantic chat tokens. Don't hand-write 171 hexes; alias from the anchors.
5. **Flat design:** radius **6px** default (50% avatars), **8/16px** spacing grid, **only one real drop shadow** (`rgba(0,0,0,.5) 0 4px 20px` on modals). No ambient shadows.
6. **Money/i32 caution N/A here** (no numeric tokens), but note the slice confirms Bootstrap 5.3 + AngularJS — our rebuild replaces both with SvelteKit/Svelte-5 equivalents and must not import Bootstrap's JS data-API.

---


<a id="11"></a>

## 11 — Misc / Uncovered (catch-all inventory)

> **Scope.** This is the catch-all section for the 284 nodes in `elements-other.json` that the other sections (top-nav, sidebar, roster, presentation, webcams, chat, modals, alerts, controls) do not own outright. Most are *boundary/wrapper* elements (the page root and document chrome, the app split scaffold), *off-screen scrolled-out chat artifacts* (124 message kebab menus + 11 trade-tagged message spans sitting at large negative `y`), or *render-state duplicates* (two stacked webcam holders at the same rect). The goal here is completeness: prove nothing in the capture is unaccounted-for, and flag the structural/CSS facts a sibling section might otherwise miss.
>
> **Third-party visual reference only.** All literal labels, room names, ticker strings, presenter initials and trade text below are the captured site's data, documented for structure/measurement. Do **not** reproduce their text/data as ours.
>
> Viewport: **1989 × 1166**. Document mode is **`lightTheme`** (`app-room#topRoomDiv.lightTheme`). Global font stack throughout: **`"Open Sans", sans-serif`** (the design tokens declare Lato `@font-face` but Open Sans is what computes on these nodes). A global reset rule `*, ::before, ::after { text-shadow: none !important; box-shadow: none !important; }` is in effect — **every node in this slice computes `box-shadow: none`**; do not add shadows when rebuilding.

### 11.0 Node census (284 total)

| Tag | Count | What it is here |
|---|---|---|
| `a` | 136 | 124 message-kebab triggers + 12 misc links (sidebar links, nav tab links, REC/talking, volume) |
| `div` | 35 | wrappers, split scaffold, screenshare pan-zoom chain, composer inner rows |
| `span` | 34 | 11 `tradeColor` message spans + tab labels, GIF label, talking string, close icons |
| `i` | 28 | FontAwesome glyph elements (all `<i class="… fa-…">`) |
| `li` | 16 | sidebar nav-items + top-nav indicators + tab list items |
| `button` | 7 | roster action buttons, screen zoom controls |
| `ul` | 4 | sidebar nav, top-nav indicator list, `#mainTabs`, `#screenTabs` |
| `p` | 4 | sidebar footer text (Powered by / Version) |
| `img` | 3 | `#cssLogo`, `#talkingLevelsImg`, presenter-img on screen tab |
| `video` | 3 | 2 webcam holder videos + 1 `webcamScreen` (screenshare) |
| `nav` | 2 | sidebar `nav.navbar` + top `nav.mainAppNav` |
| `html`,`body`,`app-root`,`app-room`,`app-room-roster`,`as-split`,`as-split-area`,`app-presentationarea`,`app-screenshare-view`,`pan-zoom`,`textarea`,`hr` | 1 each | document chrome + Angular component hosts + composer textarea + sidebar rule |

> **Note on the `icon` field in the slice.** Many wrapper/boundary nodes carry `icon: "fas fa-check"` (e.g. `html`, `body`, `app-root`). That is a **capture artifact / inherited default**, not a real glyph on those elements. The authoritative icon mapping is the `::before content` codepoint table in §11.7, not the `icon` field.

---

### 11.1 Document chrome & root boundary (5 nodes)

The outermost wrappers. These define the page box and the Angular host; sibling sections render *inside* `.wrapper`.

| Path | Tag | rect (x,y,w,h) | Key computed | Attrs |
|---|---|---|---|---|
| `html` | `html` | 0,0,1989,1166 | `box-sizing:border-box` (global reset) | `lang="en"`, `data-critters-container=""` (Critters/critical-CSS inliner marker) |
| `html > body` | `body` | 0,0,1989,1166 | `position:static` | `cz-shortcut-listen="true"` (browser-extension injected; ignore) |
| `… > app-root` | `app-root` | 0,**1151**,1989,19 | host of the SPA | `ng-version="17.3.12"` |
| `… > app-room#topRoomDiv` | `app-room` | 0,**1151**,1989,19 | `color:rgb(33,37,41)`, `font-weight:300`, `display:inline` | `id="topRoomDiv"`, `class="lightTheme"` |
| `… > div.wrapper` | `div` | 0,**49**,1989,1117 | full-bleed content area below the 49px fixed nav | — |

> **Flag — the `app-root` / `app-room` rect (`y:1151, h:19`) is misleading.** Angular host elements are `display:inline`/contents-sized, so the measured box collapses to a sliver at the page bottom; the *real* room content lives in `div.wrapper` at `y:49 → 1166` (height 1117). When rebuilding, treat `.wrapper` (not the component host) as the layout root. **Angular version is 17.3.12** — this is the framework target if we ever match component-tree behavior.

`div.wrapper` → `div.d-flex.flex-column-reverse.flex-sm-row.room-container` (0,49,1989,1117) is the master row: **sidebar | split-area** laid out as a horizontal flex on ≥sm, column-reverse below sm (Bootstrap responsive). `room-container` is the named hook.

---

### 11.2 Collapsed sidebar (off-canvas, `x:-250`) — 30 nodes

The full left sidebar is present in the DOM but **translated off-screen to the left** (`sidebar-wrapper` rect `x:-250, y:49, w:250, h:1117`), i.e. it is in its **collapsed/hidden state** at capture time. It is opened via the hamburger in the top nav (§11.4, `span.sidebar-menu title="Open Sidebar"`). Documented here because it is structurally "uncovered" (the dedicated sidebar section covers the *open* layout from `subtree-sidebar.json`; this slice carries the collapsed-state geometry).

**Container chain:** `div.sidebar-wrapper` → `nav.navbar.w-100.h-100` → `ul.navbar-nav.small.w-100.h-100`.

**Footer block (first `li.nav-item.text-center`, w250 h143):**

| Element | Text | rect | Notes |
|---|---|---|---|
| `p` | `Powered by:` | -248,54,246,21 | |
| `a.ptr-website-link` | `ProTradingRoom.com` | -150,57,136,16 | `href="https://protradingroom.com"` `target="_blank"` `rel="noopener noreferrer"`; color token `--ptr-website-link-color:#45a2ff` |
| `p` | `Version: v4.0.1-…` | -248,83,246,21 | build version string |
| `p` (empty) | — | -248,112,246,31 | |
| `hr` | — | -248,151,246,1 | divider |
| `p` → `span "Chat"` `<i fas fa-check>` + `span.ng-star-inserted "Media"` `<i fas fa-check>` | -248,157 | the `fa-check` (``) marks enabled feature toggles |

**Sidebar nav items** (each `li.nav-item`, w250 h48 unless noted; icon color `#676767` = `--lightTheme-sidebar-wrapper-color`):

| `li` class | Icon `<i>` | Glyph | Label span | Behavior |
|---|---|---|---|---|
| `nav-item` | `fas fa-network-wired` | `` | `Connectivity Che…` | — |
| `nav-item` | `fas fa-cogs` | `` | `General Settings` | — |
| `nav-item dropdown` | `fas fa-archive` | `` | `Archives` | `a#archivesDropdown.dropdown-toggle` `title="Archives"` `data-bs-toggle="dropdown"` `aria-haspopup="true"` `aria-expanded="false"` |
| `nav-item py-0` | `fas fa-comments` | `` | `Manage Muted Use…` | — |
| `nav-item py-0` | `fas fa-users` | `` | `Manage Followed …` | — |
| `nav-item d-flex flex-column h-100` (w250 **h754**) | `fas fa-user` | `` | `Users:` | the roster panel container (see §11.3) |

**Roster header action row** inside the last item — `div.flex-fill.users-btns` (w172 h27), four right-floated `btn btn-sm` buttons (icon-only, `border-0`):

| Button | id / class tail | Icon | Glyph | `title` |
|---|---|---|---|---|
| Search | `.btn-default.float-right.search-room-users` | `fas fa fa-search` | `` | `Search Users` |
| Sort | `.btn-secondary.float-right.ms-1` | `fas fa-sort-alpha-down` | `` | `Sort Users` |
| Reload | `.btn-default.ml-1.float-right.reload-room-users` | `fas fa fa-sync` | `` | `Reload Users` (icon color `#45a2ff` = `--reload-icon-color`) |
| Options | `button#user-options-btn.btn-dark.dropdown-toggle` | `fas fa fa-cog` | `` | `data-bs-toggle="dropdown"` `aria-expanded="false"` (white cog) |

---

### 11.3 `app-room-roster` host (3 nodes)

| Path | rect | Notes |
|---|---|---|
| `div.flex-grow-1` | -248,452,246,708 | fills remaining sidebar height |
| `app-room-roster` | -248,452,246,708 | Angular component host (roster list itself is detailed in the roster section) |
| `div.room-roster-list` | -248,452,246,708 | scroll container |

Only the *host boundary* is in this slice (the populated roster rows live in `subtree-sidebar.json`). Documented so the host element + its sizing (`246 × 708`, off-canvas) is not lost.

---

### 11.4 Top navbar — indicator cluster & right-edge controls (≈25 nodes)

The fixed top bar: `nav.navbar.navbar-expand-md.navbar-dark.fixed-top.mainAppNav` (0,0,**1989×49**). Most of the bar belongs to the top-nav section; this slice owns the **brand/hamburger left stub** and the **right-aligned indicator/volume/reload cluster** under `div#navbarsRoom.collapse.navbar-collapse` (288,1,1701,48).

**Left stub:**

| Element | rect | Glyph | Notes |
|---|---|---|---|
| `span.sidebar-menu` `title="Open Sidebar"` → `<i fas fa-bars>` | 5,9,28,31 | `` (white) | hamburger that un-collapses §11.2 |
| `span.users` `title="Users Connected"` → `<i fas fa-user>` | 42,16,24,18 | `` (white) | connected-user count badge |
| `a.navbar-brand.ml-1.mr-auto` → `img#cssLogo.brand-logo` | 88,17,**200×18** | — | logo image (`mr-auto` pushes the rest right) |

**Right cluster** `ul.navbar-nav.align-items-center.ml-auto` (1739,1,250,48):

| `li` | Content | rect | Glyph / detail |
|---|---|---|---|
| `talkingIndicator animated fadeIn` | `a.talking` → `<i icon fa fa-microphone>` (``, white) + `span.talking-string` → `span "TG"` + `img#talkingLevelsImg.talkingWaveform.animated.fadeIn` | 1739,4,81,41 | shows the active speaker initials (`TG`) + an animated waveform GIF (22×25 at 1792,12); `line-height:41px` centers the row |
| `recIndicator animated fadeIn` | `a` text `[ REC ]` | 1819,4,62,41 | recording badge; `cursor:pointer`, color `#45a2ff` (`--presenter-recording-color`), `line-height:41px` |
| `nav-item dropdown dropstart` | `a#dropdownVolume.nav-link` → `<i fas fa-2x fa-volume-up>` | 1881,1,50,48 | ``, color `rgb(171,176,181)`; `data-bs-toggle="dropdown"` opens a volume slider **to the left** (`dropstart`) |
| `nav-item` `title="Reload"` | `a.nav-link` → `<i fas fa-2x fa-sync>` | 1931,1,58,48 | ``, color `rgb(171,176,181)`; page/stream reload |

> **Flag — `animated fadeIn`** on the talking & REC indicators is an Animate.css entrance; both are gated by `ng-star-inserted` (conditionally rendered). Rebuild them as conditionally-mounted with a fade-in, not always-present.

---

### 11.5 Main split scaffold — `as-split` (Angular Split) — 6 nodes

The chat-pane | presentation-pane divider system (`angular-split` library).

| Path | rect | Key computed | Notes |
|---|---|---|---|
| `as-split#mainAreaSplit.as-horizontal.as-percent.as-init` | 0,49,1989,1117 | `display:flex` | horizontal split, percent-based sizing, init complete |
| `as-split-area.presentation-box` | 431,49,**1558**×1117 | the presentation/right area | chat area is the *other* (left) `as-split-area`, owned by the chat section |
| `div.as-split-gutter` | **420,49,11×1117** | `background:rgb(10,109,177)` (`--split-gutter-bg:#0a6db1`), `cursor:col-resize`, `display:flex`, `color:#fff` | `role="separator"`, `tabindex="0"` — keyboard-focusable drag handle |
| `div.as-split-gutter-icon` | 420,49,11×1117 | grip glyph centered in the gutter | — |

> **Flag — the resize gutter is a real interactive separator:** 11px wide, solid brand-blue (`#0a6db1`), `col-resize` cursor, `role="separator"` + `tabindex="0"` (arrow-key resizable). The left chat pane ends at x≈420 and the presentation area starts at x=431 (the 11px gutter sits between). This is the canonical split ratio measurement for the room layout.

---

### 11.6 Message composer — `div#textAreaHolder` (10 nodes)

The chat input row at the bottom-left of the chat pane.

| Path | rect | Key computed | Notes |
|---|---|---|---|
| `div#textAreaHolder.d-flex.align-items-center.textSendDiv` | 5,**1116**,410,45 | `bg:#fff`, `border-radius:8px` (`border-top-left-radius:8px`), `padding:5px`, `color:rgb(204,204,204)` | rounded white capsule; border token `--textarea-holder-border-color:#0a6db1` |
| `div.flex-fill.d-flex.mx-0` | 10,1121,400,35 | row | |
| `div.px-0.flex-fill` | 10,1121,319,35 | textarea wrapper | |
| `textarea#textAreaTxt.txt-area.form-control.border-0` | 10,1121,**319×35** | `color:rgb(103,103,103)` (`--lightTheme-textarea-color:#676767`), `bg:#fff`, `font-size:14px`, `font-weight:400`, `line-height:21px`, `padding:6px/5px`, `cursor:text` | `placeholder="Type your message here.."`, `border-0` (borderless) |
| `div.…textAreaBtnsCol` | 329,1121,81,35 | right button cluster (`justify-content-center d-flex flex-row align-items-center text-center p-0 m-0`) | |
| `span.textAreaBtns.ng-star-inserted` → `<i far fa-smile>` | 329,1122,26,34 | `` | emoji picker (button color `#676767` = `--textarea-holder-btns-color`, hover `#0a6db1`) |
| `span.textAreaBtns.ng-star-inserted` → `<i fas fa-image>` | 355,1122,26,34 | `` | image upload |
| `span.textAreaBtns.ng-star-inserted` → `span "GIF"` | 381,1122,29,28 | text label `GIF` (12px, `#676767`) | GIF picker — note: **no FA icon, a text glyph "GIF"** |

> **Flag — the composer is the chat-input capsule** (`textSendDiv`, 410×45, rounded `8px`, white). Three trailing actions: emoji (`far fa-smile`), image (`fas fa-image`), and a **text-rendered "GIF"** button (not an icon). Button icons are `#676767` idle → `#0a6db1` on hover (token pair `--textarea-holder-btns-color` / `--textarea-holder-btns-hover-color`).

---

### 11.7 FontAwesome icon inventory (this surface)

Family: **Font Awesome 5 Free** (solid weight 900 + regular weight 400 loaded; brands unloaded). All glyphs delivered via `::before { content }`. Authoritative codepoints captured from the live `::before`:

| FA class | Unicode | Where used | `::before` color |
|---|---|---|---|
| `fa-check` | `` | sidebar feature-enabled marks | `#676767` |
| `fa-network-wired` | `` | Connectivity Check | `#676767` |
| `fa-cogs` | `` | General Settings | `#676767` |
| `fa-archive` | `` | Archives dropdown | `#676767` |
| `fa-comments` | `` | Manage Muted Users | `#676767` |
| `fa-users` | `` | Manage Followed | `#676767` |
| `fa-user` | `` | Users header / nav user count | `#676767` / `#fff` |
| `fa-cog` | `` | user-options-btn / screen-tab dropdown | `#fff` |
| `fa-sync` | `` | reload users / nav reload | `#45a2ff` / `rgb(171,176,181)` |
| `fa-sort-alpha-down` | `` | sort users | `#fff` |
| `fa-search` | `` | search users / screen zoom-search | `#f4f4f4` / `#fff` |
| `fa-bars` | `` | hamburger (open sidebar) | `#fff` |
| `fa-microphone` | `` | talking indicator | `#fff` |
| `fa-volume-up` | `` | volume dropdown (`fa-2x`) | `rgb(171,176,181)` |
| `fa-smile` (regular) | `` | composer emoji | `#676767` |
| `fa-image` | `` | composer image upload | `#676767` |
| `fa-times` | `` | webcam close icon | `#fff` |
| `fa-desktop` | `` | Screens main-tab | `#fff` |
| `fa-edit` | `` | Notes main-tab (`#noteChangeIndicator`) | `#cccccc` |
| `fa-folder` | `` | Files main-tab | `#cccccc` |
| `fa-camera` | `` | screen zoom snapshot | `#fff` |
| `fa-expand` | `` | screen zoom fullscreen | `#fff` |

---

### 11.8 Presentation-area tabs & screenshare host (≈45 nodes)

`app-presentationarea` (431,49,1558,1117) → `div.mainPresentationAreaHolder`. This slice carries the **tab bars and the screenshare host chain** (the rendered note/file *content* belongs to the presentation section).

**Main tabs** `ul#mainTabs.nav.nav-tabs.mainTabset` (431,49,1558,41), `role="tablist"`:

| Tab `a` | rect | Icon | Glyph | Label | Behavior |
|---|---|---|---|---|---|
| `a#screens-tab.nav-link.active` | 1094,54,79,31 | `fas fa-desktop` | `` | `Screens` | `data-bs-toggle="tab"` `data-bs-target="#screens"` `role="tab"` (active) |
| `a#notes-tab.nav-link.presAreaTabs-notes` | 1183,54,71,31 | `fas fa-edit` (`i#noteChangeIndicator`) | `` | `Notes` | `data-bs-target="#notes"` — the edit icon doubles as an unsaved-changes indicator (color `#cccccc`) |
| `a.nav-link` | 1264,54,62,31 | `fas fa-folder` | `` | `Files` | `data-bs-target="#files"` |

> Tab strip is **right-aligned** (tabs start at x≈1089 within the 1558-wide area). Each `li.nav-item` is `role="presentation"`; the `<a>` carries `role="tab"`.

**Screens tab panel** `div#mainTabsContent.tab-content` → `div#screens.tab-pane.fade.show.active` (`role="tabpanel"`).

**Screen sub-tabs** `ul#screenTabs.nav.nav-tabs.screens-tabs` (431,90,1558,40), `role="tablist"`:

| Element | rect | Detail |
|---|---|---|
| `li.nav-item.ng-star-inserted` → `a#6a300cc493c3cb36774d1c0d.nav-link.active` | 436,95,128,30 | one screen tab; `data-bs-toggle="tab"` `role="tab"`. Active tab background `#45a2ff` (`--tab-active-bg`) |
| `img.presenter-img` | 441,100,20×20 | presenter avatar on the tab |
| `span.mx-1` | 465,102 | tab label `TG-Screen 1` |
| `span#dropdownMenuScreen.dropdown-toggle` → `<i fas fa-cog>` | 537,102,22×14 | ``; `data-bs-toggle="dropdown"` `aria-expanded="false"` — per-screen options menu |

**Zoom controls** (right-aligned `li.nav-item.ms-auto`) `div.zoom-controls-container.position-relative` (1895,94,94×31), three `button.btn.btn-sm.btn-dark` (32/32/30 px wide):

| Button | Icon | Glyph |
|---|---|---|
| Zoom/search | `icon fas fa-search` | `` |
| Snapshot | `icon fas fa-camera` | `` |
| Fullscreen | `icon fas fa-expand ng-star-inserted` | `` |

**Screenshare host chain** (the actual shared screen video) — `div#screensTabsContent.tab-content` → `div#…tab-pane.fade.show.active` (`role="tabpanel"`) → `app-screenshare-view.h-inherit` (431,130,1558×1035) → `div.h-inherit` → `div.position-relative.h-inherit.overflow-hidden.screencast-pan` → **`pan-zoom.h-inherit`** → `div.pan-zoom-frame` → `div.pan-element` → `div.zoom-element` → `div.video-screen-container` → **`video#webcamScreen-….webcamScreen`** (431,130,1558×1035).

> **Flag — the shared screen is a `<video class="webcamScreen">` inside a `pan-zoom` pan/zoom rig** (`.pan-element` / `.zoom-element` / `.pan-zoom-frame`), wrapped by `.screencast-pan` with `overflow:hidden`. Pan/zoom is driven by the three zoom-control buttons above. The full 1558×1035 occupies the presentation area below the two 40/41px tab bars.

---

### 11.9 Webcam holders — duplicated, off-screen (8 nodes = 2 × 4)

Two **identical** floating webcam cards captured at the **same rect**, i.e. a render/stacking duplicate or a draggable + its ghost:

| Path | rect | Key computed | Behavior |
|---|---|---|---|
| `div#webcamsHolder-.card.webcamsHolder` (×2) | 1215,**1171**,320×240 | `position:absolute`, `z-index:105`, `border:1px solid yellowgreen` (`rgb(154,205,50)`), `bg:#000`, `border-radius:6px`, `cursor:move`, `margin:5px` | **draggable** floating card (matchedRule: `.webcamsHolder{position:absolute;z-index:105;border:1px solid yellowgreen;cursor:move;background-color:#000;width:320px;height:240px;margin:5px}`) |
| `video#webcamVideo-.webcamsHolderVideo` (×2) | 1216,1172,318×238 | fills the card inset by the 1px border | the live cam feed |
| `span.closeIcon` (×2) | 1515,1172,14×24 | `position:absolute`, `z-index:102`, `color:#fff`, `font-size:20px`, `cursor:move` → `<i fas fa-times>` `` | dismiss the cam (top-right corner) |

> **Flag — green border = "active/live" cam** (`yellowgreen`/`#9ACD32`). The two holders share rect `1215,1171` (just below the viewport fold at y=1166) — treat as a single draggable webcam card when rebuilding, not two. Drag is implied by `cursor:move` on both the card and its close icon; the close icon's `z-index:102` < card's `105` (close still hittable because it's absolutely positioned over the video).

---

### 11.10 Off-screen chat artifacts (135 nodes) — message kebabs + trade tags

These are **scrolled-out chat history rows** captured at large negative `y` (the chat log is scrolled near the bottom; older rows sit above the visible area). They belong conceptually to the chat section but appear here because they're the per-message *action affordances*, not message bodies.

**124 × `a#dropdownMenuLink.msgMenu.dropright.pt-1`** — the per-message "kebab" (vertical-dots) menu trigger:

- Text glyph: **`⠇`** (U+2807, Braille pattern used as a 3-dot vertical handle), **not** a FA icon.
- Computed: `color:rgb(10,109,177)` (`--nickname-color`/brand `#0a6db1`), `font-size:20px`, `font-weight:600`, `line-height:30px`, `width:18.67px`, `height:34px`, `padding:4px 0 0 5px`, `cursor:pointer`, `display:block`, `position:relative`.
- Attrs: `role="button"`, `id="dropdownMenuLink"` (⚠ **non-unique id repeated 124×** — invalid HTML the source ships; do not copy the duplicate-id pattern, use a class), `data-bs-toggle="dropdown"`, `aria-haspopup="true"`, `aria-expanded="false"`.
- Class `dropright` → the message-action menu opens **to the right** of the dots.
- All 124 sit at `x:0` with 122 distinct negative `y` (e.g. `-9678`, `-9279`, … up to `+568`) — one per chat message in the scrollback.

**11 × `span.tradeColor`** (`id="id_<24-hex>"`) — trade-tagged message text:

- Computed: `color:rgb(69,162,255)` (`#45a2ff`, the brand light-blue used for highlights/links), `font-size:13px`, `font-weight:100` (thin), `line-height:19.5px`.
- All at `x:66`, widths 301–344px, `y` from `-8724` to `+568` (interleaved with the kebabs in the scrollback).
- Captured text are trade callouts (e.g. `SELL -1 VERTICAL…`, `BUY +1 CALENDAR…`) — **third-party data, reference only.** The structural takeaway: trade-callout messages get a dedicated `.tradeColor` span in light-blue thin weight.

> **Flag — completeness check passes:** of the 284 nodes, 124 are the duplicate kebab triggers and 11 are trade spans (135 off-screen chat artifacts), ~70 are the structural wrappers/hosts/tabs/composer/webcams documented in §§11.1–11.9, and the remaining are their child `i`/`span`/`div` glyph and label elements. Nothing in `elements-other.json` is undocumented.

---

### 11.11 Tokens referenced by this surface

| Token | Value | Used by |
|---|---|---|
| `--split-gutter-bg` | `#0a6db1` | resize gutter background |
| `--textarea-holder-border-color` | `#0a6db1` | composer capsule border |
| `--textarea-holder-btns-color` / `…-hover-color` | `#676767` / `#0a6db1` | composer action icons idle/hover |
| `--lightTheme-textarea-color` | `#676767` | textarea text |
| `--tab-active-bg` | `#45a2ff` | active screen sub-tab |
| `--presenter-recording-color` | `#45a2ff` | `[ REC ]` indicator |
| `--reload-icon-color` | `#45a2ff` | reload-users sync icon |
| `--ptr-website-link-color` | `#45a2ff` | sidebar footer link |
| `--nickname-color` / brand | `#0a6db1` | message kebab color |
| (literal) | `yellowgreen` `#9ACD32` | live webcam border |
| (literal) | `rgb(171,176,181)` | nav volume/reload icon idle |

**Reset to honor:** `* { box-shadow:none !important; text-shadow:none !important }` — no shadows anywhere on this surface.

---

