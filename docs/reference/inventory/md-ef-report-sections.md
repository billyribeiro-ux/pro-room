# Inventory — `evidence-folder/_report-sections/` (md-ef-report-sections)

**Assignment slug:** md-ef-report-sections
**Files inspected:** 11 of 11 (all read in full — each is a small `.md`, 16–33 KB)
**Corpus role:** These are the 11 chapters of the human-authored reference write-up. They read as a single coherent report split by surface (shell → nav → sidebar → stage → cams → alerts/chat → modals → controls → exact-CSS → tokens → misc). Numbered filenames map 1:1 to `## NN — …` headings inside.

> ⚠️ **AUTHORITY WARNING (applies to ALL 11 files below).** Every file here is **kind: md-analysis — SECONDARY / PROSE, NOT authority.** They are prior analysis DERIVED from the raw dumps (they cite `_slices/*.json`, `subtree-*.json`, `elements-*.json`, `targeted.json`, `theme.json`, and `controls.json`). They **must be re-verified against the raw JSON captures + HTML DOM dumps** before any value is trusted. The rendered capture/computed-style JSON always wins over this prose. Concrete internal contradictions found across these 11 files are enumerated in the "Cross-file contradictions" section at the end — these are exactly the kind of prose error the authority rule anticipates.

---

# 01-room-shell-layout.md
- **path**: evidence-folder/_report-sections/01-room-shell-layout.md
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority, must be verified against the raw dumps
- **size**: 21185 bytes
- **role**: admin room shell (host `app-room#topRoomDiv`). Determined by the header line: reconstructed from `subtree-roomShell.json`, rootPath `app-room#topRoomDiv`. Capture is a viewer/member session (stated elsewhere, e.g. 02).
- **format/quality**: prose analysis of computed-styles+rects (cites `subtree-roomShell.json` 600 DOM nodes / 419 captured, `subtree-presentation.json`, `targeted.json`, `elements-other.json`, `theme.json`).
- **surfaces documented**: overall page frame, fixed top navbar clearance, off-canvas sidebar, `as-split#mainAreaSplit` horizontal split (left alert-chat / right presentation), inner vertical alert/chat split, angular-split gutters, alert header + scroll list.
- **maps to (our components)**: RoomShell/layout root, top nav host, sidebar host, main split container, alerts panel host — the geometry backbone every other component sits inside.
- **key findings** (cited):
  - Viewport **1989×1166**; navbar band **0→49 (49px)**, main area **y=49, h=1117** (§2.0 table).
  - Horizontal split ratio **21.24% / 78.76%** left/right; gutter **11px @ x=420**; left col `420.055px` = `calc(21.2364% - 2.336px)`, right col `1558px` = `calc(78.7636% - 8.664px)` (§2.2 table).
  - Host `app-room#topRoomDiv` carries class **`lightTheme`** even though room renders dark (§1); its own rect is a misleading 19px sliver at y=1151 — real bounds are on `div.wrapper` `[0,49,1989,1117]`, bg `#111` (§2.0 note, §2.1).
  - Shell colors: navbar `#0c2434`, gutter + alert-header `#0a6db1`, presentation bg `--presenter-area-bg #0f2e43`, alert scroll-list bg `#fff` (§2.1, §2.5, §2.6).
  - Inner vertical split ~81.4% alerts / ~18.6% chat; alert-box `900.305px`, chat region **~206px INFERRED** (chat panel empty at capture, `elements-chat.json` = `[]`) (§2.4, marked with `*`).
- **notes**: Explicitly flags the chat panel (vertical gutter, `chat-box`, `app-chat`) as **inferred, not captured** — an honest gap. Best-authority for the split-geometry constants. Verify the calc() basis values and 49/1117 bands against `subtree-roomShell.json` rects.

---

# 02-top-nav.md
- **path**: evidence-folder/_report-sections/02-top-nav.md
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority, must be verified against the raw dumps
- **size**: 18483 bytes
- **role**: **member/viewer** capture (explicitly stated §0: "captured session is a viewer/member session, not a presenter/broadcaster session"). This is the strongest role-provenance statement in the set.
- **format/quality**: prose analysis of `subtree-topnav.json` (24 nodes, subtree count 68) + `targeted.json`, `controls.json`, `subtree-roomShell.json`, `theme.json`.
- **surfaces documented**: `nav.mainAppNav` bar; left group (hamburger pill, user-count pill, mobile-app icon, brand logo); right cluster (talking indicator, REC indicator, volume dropdown, reload); presenter broadcast controls as a CONDITIONAL/absent variant.
- **maps to (our components)**: TopNav / RoomHeader and all its buttons.
- **key findings** (cited):
  - Right cluster = exactly **4 `<li>`** in this capture: talkingIndicator, recIndicator, volume `dropdown.dropstart`, reload (§0, verified by walking children in two slices).
  - Bar: `position:fixed; z-index:1030; 1989×49; bg #0C2434; color #fff; font 300 16px/24px "Open Sans"` (§2.1).
  - Hamburger pill `span.sidebar-menu` bg **#103D5C**, pad `1px 5px`, glyph `fa-bars` U+F0C9 (§2.2, §3.1).
  - Volume/reload resting icon color **#ABB0B5**, 32px (`fa-2x`), hover → **#45A2FF** (`--app-link-color`); `#dropdownVolume::after{display:none}` suppresses caret; `dropstart` opens left (§2.4, §3.4).
  - `[ REC ]` text color **#45A2FF** = `--presenter-recording-color` (§3.3).
- **notes**: §3.6 flags all presenter broadcast controls (screen-share/camera/mic/CC/music/record/go-live/members/gear) as **NOT in this capture** — explicit TODO "re-capture from a presenter session." Honest gap. Best-authority for the member-navbar structure.

---

# 03-sidebar.md
- **path**: evidence-folder/_report-sections/03-sidebar.md
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority, must be verified against the raw dumps
- **size**: 20293 bytes
- **role**: admin room sidebar, captured **CLOSED / off-canvas** (drawer at `x=-250`). From `subtree-sidebar.json` (52 captured nodes).
- **format/quality**: prose analysis of computed styles+rects; cites `subtree-sidebar.json`, `theme.json`, matchedRules.
- **surfaces documented**: `div.room-sidebar` → `.sidebar-wrapper` drawer; powered-by/version/mobile-app info block; Connectivity Check, General Settings, Archives (dropdown), Manage Muted, Manage Followed nav items; roster section (header toolbar + `app-room-roster` list).
- **maps to (our components)**: Sidebar/RosterDrawer + each nav item + roster toolbar buttons.
- **key findings** (cited):
  - **Skin discrepancy flagged (§ capture-state note):** theme tokens define a DARK navy drawer (`--sidebar-wrapper-bg-color:#103d5c`, `--sidebar-wrapper-color:#fff`), but the **computed** capture resolves to a LIGHT skin (white bg `rgb(255,255,255)`, gray text `rgb(103,103,103)`, blue accent `#45a2ff`). Instruction: build to computed values, keep token names.
  - Modal-trigger wiring per item: Connectivity→`#webrtc-troubleshooter-modal`, General Settings→`#user-settings-modal`, Muted→`#mutedUsersModal`, Followed→`#followedUsersModal`, Mobile App Info→`#mobileAppInfoModal` (§3.3.2–3.3.6, all `data-bs-toggle="modal"`).
  - Roster toolbar 4 buttons: DOM order cog→sync→sort→search; `float:right` reverses visual to search·sort·sync·cog (§3.3.7). Reload-users icon `#45a2ff` on `#f4f4f4`; search-users inverse.
  - FA glyph codepoint table with `::before` content for 11 icons (§3.2): e.g. `fa-network-wired \f6ff`, `fa-cogs \f085`, `fa-archive \f187`, `fa-comments \f086`, `fa-users \f0c0`.
- **notes**: Archives dropdown menu (Alert Logs / Chat Logs / Transcript History) and per-user roster rows are **lazily rendered / absent from slice** — documented from "surface intent," an honest inference gap. Version string `v4.0.1-c0fee8f5` is third-party data.

---

# 04-presentation-stage.md
- **path**: evidence-folder/_report-sections/04-presentation-stage.md
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority, must be verified against the raw dumps
- **size**: 21632 bytes
- **role**: admin presentation area. From `subtree-presentation.json` (553 subtree elements / 50 captured; **Screens tab was the active rendered state**).
- **format/quality**: prose analysis of computed styles+rects + `targeted.json` matchedRules + `theme.json` tokens.
- **surfaces documented**: `presentation-box` → `app-presentationarea` → main tab bar (`#mainTabs`: Screens/Streams-hidden/Notes/Files); screen sub-tab strip `#screenTabs` (per-screen pill w/ gravatar+name+cog, zoom/snapshot/fullscreen group); screenshare pan-zoom video chain; hidden Streams/Notes(Summernote)/Files panes; files count badge.
- **maps to (our components)**: PresentationStage, tab bars, ScreenShareView, Notes editor, Files panel.
- **key findings** (cited):
  - Active tab pill = `bg var(--tab-active-bg) #45a2ff / white / border-radius 3px`; inactive-hover = `1px solid var(--tabs-border-color) #0a6db1` (§04.2 main-tab links).
  - Screen sub-tab strip bg `--notes-tabs-bg #0c2434`, `z-index:1`; per-screen `img.presenter-img` 20×20 gravatar `?d=mm&s=20`; cog `span#dropdownMenuScreen` dropdown (§04.2).
  - Screen video: `<video autoplay muted playsinline data-ng-dblclick="fullScreen()">` inside nested `pan-element`/`zoom-element` `transform:matrix()` rig, 1558×1035 (§04.2, §04.3).
  - **Files badge `.bg-danger` OVERRIDDEN to `rgb(231,76,60)`** (coral), NOT `--bs-danger-rgb 220,53,69` (§04.4). ⚠️ CONTRADICTS 09 (see contradictions section).
  - Only 2 of 4 main tabs measured non-zero (Screens active, Notes/Files present; Streams `li:nth-child(2)` hidden 0×0) (§04.1 capture note).
- **notes**: Streams/Notes/Files pane interiors are **0×0 / reconstructed from tokens+matchedRules**, an explicit honest gap. Best-authority for tab-active styling and Summernote/Files token map.

---

# 05-webcams.md
- **path**: evidence-folder/_report-sections/05-webcams.md
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority, must be verified against the raw dumps
- **size**: 16328 bytes
- **role**: admin webcam surface. From `subtree-webcams.json` (rootPath `…presentation-box > app-webcam-holder`), captured in **collapsed / parked** state.
- **format/quality**: prose analysis of computed styles+rects + `targeted.json` matchedRules + tokens.
- **surfaces documented**: `app-webcam-holder` → `.webcam-wrapper` (bottom-anchored, centered, wrap) → per-presenter `app-presenter-cams` → `.card.webcamsHolder` (draggable) → `<video>`, `.overlay` → `h5.pNameLabel` + `.closeIcon` (`fa-times`).
- **maps to (our components)**: WebcamHolder / PresenterCam tile.
- **key findings** (cited):
  - Card: `320×240`, `position:absolute; z-index:105; border:1px solid yellowgreen (rgb(154,205,50)); background:#000; margin:5px; cursor:move; border-radius:6px` (radius inherited from `.card`, not declared) (§2 card table + authoritative rule).
  - Video `.webcamsHolderVideo`: `object-fit:contain; width/height 100%; 318×238` (fills card minus 1px border); `autoplay`, no controls/muted/poster (§2).
  - Name bar `h5.pNameLabel.m-0`: `background rgba(0,0,0,.5); color #fff; font-size 20px; weight 500; text-align center; width 100%; margin 0` (§2 overlay).
  - Close icon `span.closeIcon` (`fa-times` U+F00D, white, 20px, `right:5px; top:0; z-index:102`) is the **only per-tile control** — no expand/minimize/mute/cog (§3 notes). Reference omits `aria-label` (accessibility gap to fix in our build).
  - Capture parked at `bottom:-250px` (below viewport), wrapper `height:0` = collapsed no-active-cam state (§scope note).
- **notes**: No-video avatar placeholder is **inferred, not captured** (tiles collapsed). Slice captured the same tile twice (render/stacking duplicate) — real tree is N tiles, one per presenter. Honest gaps.

---

# 06-alerts-and-chat-dock.md
- **path**: evidence-folder/_report-sections/06-alerts-and-chat-dock.md
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority, must be verified against the raw dumps
- **size**: 19935 bytes
- **role**: admin left column (alerts over chat). From `elements-alerts.json` (2349 nodes) + `elements-other.json` (composer) + `targeted.json` + `theme.json`.
- **format/quality**: prose analysis of computed styles+rects; heavy row-anatomy deduplication.
- **surfaces documented**: left `as-split-area` vertical split; alerts header (`alertHeader` blue bar, bell brand + search + settings-cog); alerts scroll body + `app-st-message` row anatomy (avatar-left, username, Q&A `?` badge, timestamp, body, ticker `stockColor`, uploaded image); date separators; reactions; chat header (`chatHeader`, comment brand, Main Chat / Off Topic tabs); chat rows (direction-based `flex-row` vs `flex-row-reverse.msg-box-adm`); composer `#textAreaHolder`.
- **maps to (our components)**: AlertsPanel, ChatPanel, MessageRow, ChatComposer.
- **key findings** (cited):
  - Both headers bg **#0a6db1** white; alertHeader font 16px, chatHeader font **12px** (§6.2, §6.4.1).
  - Alert row: avatar LEFT (gutter w58, 35×35 **square** `border-radius:0`), username `strong.username` **900 14px color #0a6db1**, timestamp `.created-at` `#a8a8a8` 600 12px, body `.text-formated` `#676767` 100 13px/19.5, ticker `span.stockColor` `#1a1a1a` 700 uppercase (§6.3.2 per-part table).
  - Q&A `?` badge (`button.alert-qa .btn-secondary`) sits RIGHT of header, left of timestamp; bg `rgb(108,117,125)`; every capture is icon-only/unanswered state (§6.3.2 note).
  - Active chat tab solid **#45a2ff** fill; inactive transparent (§6.4.1).
  - Composer capsule white, `textarea#textAreaTxt` placeholder "Type your message here.."; 3 right actions emoji(`far fa-smile`)/image(`fas fa-image`)/GIF(text label); **no discrete Send button** (Enter-driven); tooltips via `ngbtooltip` not `title` (§6.5).
  - ⚠️ **§6.4.2 CLAIMS "No kebab / msgMenu element exists anywhere in this capture"** (searched 2349 alert nodes). **This is contradicted by 08 §6a and 11 §11.10**, which document 124 `a#dropdownMenuLink.msgMenu` kebabs — those live in `elements-other.json`, not `elements-alerts.json`. See contradictions section: 06's blanket statement is an overstatement scoped only to the alerts slice.
- **notes**: Chat rows' username/body largely collapsed in capture. The kebab-absence claim is the single most important error to correct against raw dumps. Best-authority for alert-row per-part CSS.

---

# 07-modals.md
- **path**: evidence-folder/_report-sections/07-modals.md
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority, must be verified against the raw dumps
- **size**: 21252 bytes
- **role**: admin modals/overlays/dropdowns. From `elements-modals.json` (15 nodes = 5 triggers + 9 img-lightbox triggers) + `theme.json → inventory.modalsInDom` (33 modal subtrees) + `inventory.menus` + `targeted.json`.
- **format/quality**: prose analysis; modal BODIES reconstructed from inventory (all `visible:false`/hidden at capture).
- **surfaces documented**: Bootstrap-5 modal shell; 5 modal triggers; 33-modal catalogue (Offline, Debug Log [lg], Post Alert, poll, Session Control [lg], mobile-apps, Q&A for Alert, Muted/Followed Users, settings shells); footer button vocabulary; modal form fields; image lightbox `div.img-container` + `openImageModal()`; dropdown menus (volume, per-user kebab, archives, sort).
- **maps to (our components)**: Modal framework + each named modal + Dropdown menus + image Lightbox.
- **key findings** (cited):
  - Modal z-index **1055** (backdrop 1054); `.modal-content` bg `--modal-content-bg-color #103d5c`, color `#f4f4f4`, radius 6px; the **single non-reset shadow** `rgba(0,0,0,.5) 0 4px 20px 0` (§7.1).
  - Modal button tokens: close `#0a6db1`, success `#92d528`, danger `#bb352a`, hover-opacity 0.9 (§7.1).
  - Only **Debug Log** and **Session Control** are `modal-lg`; poll uses custom `pollModalHolder` (§7.3).
  - Per-user dropdown `.users-dropdown-options` items: User Info / Mention / Copy (§7.5.2); Archives: Alert Logs / Chat Logs / Transcript History `dropdown-item small`, bg `#0e3651` color `#45a2ff` (§7.5.3).
  - Volume `.volumeControl`: center text, `#ccc` on `#111`, `1px solid rgb(250,250,250)`, slider in `.room-sound-options` padding-left 30px (§7.5.1).
- **notes**: Modal bodies are **reconstructed from `inventory.modalsInDom`, none open at capture** — a large honest gap (structure inferred). Image-lightbox nodes carry third-party CDN URLs (do not reuse). Best-authority for the modal catalogue + dropdown item lists.

---

# 08-controls-inventory.md
- **path**: evidence-folder/_report-sections/08-controls-inventory.md
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority, must be verified against the raw dumps
- **size**: 21166 bytes
- **role**: admin interactive controls master list. From `controls.json` (230 controls: 142 `<a>`, 58 `<button>`, 28 `<i>`, 2 `<li>`).
- **format/quality**: prose analysis of a flat control array WITH matchedRules (`:hover`/`::before`).
- **surfaces documented**: region census (chat 187, sidebar 19, presentation 11, topnav 9, alerts 4); shared Bootstrap button baseline + variants; per-region control tables; design-token map; behavior-by-mechanism summary.
- **maps to (our components)**: every interactive control across the app — cross-cutting reference.
- **key findings** (cited):
  - **187 of 230 controls are chat** because ~50 rendered messages each contribute a per-message "Ask a question" button AND a per-message kebab (§0).
  - **Per-message kebab ×124: `a#dropdownMenuLink` class `msgMenu dropright pt-1`**, glyph `⠇` U+2807, color `#0a6db1` (`--username-color`) `!important`, hover `--light-brown #8c8686`, font 20px 600→900 (§6a). ⚠️ **This directly contradicts 06 §6.4.2's "no kebab exists" claim.**
  - Q&A button `.btn-sm.btn-secondary.alert-qa` bg `rgb(108,117,125)`, `fa-question-circle`, some show `(n) ✅` answered state, count text `rgb(0,128,64)` (§6b).
  - Button variants: `.btn-secondary #444`, reload-users `#45a2ff on #f4f4f4`, search-users inverse, focus box-shadow `rgba(55,90,127,.25)` (`--primary` tint) — noted as conflicting with the global `box-shadow:none !important` reset (§1).
  - FA→phosphor-svelte mapping guidance (e.g. `fa-cog`→`GearIcon`, `fa-volume-up`→`SpeakerHighIcon`) per global CLAUDE.md (§8).
- **notes**: The focus-box-shadow-vs-global-reset conflict is flagged in the file itself (§1) — verify which wins in computed styles. Best-authority for the kebab (`msgMenu`) existence + styling, and the region control census. Corroborated by 11 §11.10.

---

# 09-targeted-exact-css.md
- **path**: evidence-folder/_report-sections/09-targeted-exact-css.md
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority, must be verified against the raw dumps
- **size**: 33243 bytes (largest file)
- **role**: admin room, 50 targeted key elements WITH matchedRules. From `evidence-folder/_slices/targeted.json` (author `cssText`), resolved against `theme.json`.
- **format/quality**: prose analysis closest to raw — quotes verbatim `{selector, cssText}` pairs including `:hover`/`:focus`/`::before`/`.active`/`:empty`. Self-describes as "matchedRules source of truth."
- **surfaces documented**: navbar[00–08,14–16], talking/volume/sound dropdowns[09–13], sidebar/roster[17–20], presentation tab strips + `.nav-link.active` matrix[21–33], files-badge[34–36], webcams/pNameLabel[37–48], presentation-box[49], glyph `::before` inventory.
- **maps to (our components)**: exact CSS source for tabs, badges, cams, navbar, dropdowns.
- **key findings** (cited):
  - Global reset appears on all 50: `*,::before,::after{ box-sizing:border-box; text-shadow:none!important; box-shadow:none!important }` → **no shadows render anywhere** (§method note, §cross-element rules).
  - Two Bootstrap layers coexist (v4 literals shadowed by **v5 `--bs-*`**, the effective one) (§method note, §I.8).
  - Tab-active matrix (§28–33): in-room screen/files/notes tabs active = `bg #45a2ff / #fff / radius 3px / border transparent`, hover `1px solid #0a6db1`; chat & modal tabs active = `border 1px solid #45a2ff !important`.
  - **Files badge [34–36]: computed `background rgb(220,53,69)` (`#dc3545` Bootstrap danger)**, `border 1px solid rgb(0,0,0)`, `.files-badge{margin-top:-9px;margin-left:3px}`, `.badge:empty{display:none}`. ⚠️ CONTRADICTS 04 (which says overridden to `rgb(231,76,60)`).
  - Webcam card [41/42]: `border 1px solid yellowgreen (#9acd32); cursor:move; bg #000; 320×240; z-index 105`; presentation-box [49] bg `--presenter-area-bg #0f2e43; overflow:hidden !important` (§F, §G).
- **notes**: Highest-fidelity CSS file in the set (verbatim cssText), but still SECONDARY — verify against `targeted.json` directly. Best-authority among these 11 for exact hover/active/`::before` rules. The files-badge color conflict with 04 must be resolved against the raw `targeted.json` computed value.

---

# 10-theme-tokens.md
- **path**: evidence-folder/_report-sections/10-theme-tokens.md
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority, must be verified against the raw dumps
- **size**: 28481 bytes
- **role**: whole-app design tokens. From `theme.json` (`:root` = 294 custom props: 123 `--bs-*` + 171 app-specific), `palette`, `fonts`.
- **format/quality**: prose analysis / token catalog + computed-color usage counts.
- **surfaces documented**: font system (declared vs effective), Bootstrap base tokens, app custom tokens (dark/light chat palettes, modal, sidebar/navbar, notes/files), resolved anchor-color chains, dominant computed colors/radius/spacing/z-index/shadow, `data-*` vocabulary.
- **maps to (our components)**: the theme layer / CSS custom-property block for the entire rebuild.
- **key findings** (cited):
  - **Effective UI font = "Open Sans", sans-serif** (23,265 nodes) via `--app-font-family`, NOT the Lato/system-ui token stacks (§10.1.1–2 discrepancy note). Only FA5 Free 400+900 actually loaded; Lato/summernote unloaded (§10.1.4).
  - Base is **Bootswatch Darkly-derived** (`--primary #375a7f`, `--success #00bc8c`) + custom navy chat skin (§intro).
  - 8-color base set (§10.4): `#45a2ff` accent (18 aliases), `#0a6db1` header/username (14), `#103d5c` sidebar/modal, `#0c2434` navbar, `#0e3651`/`#0f2e43`/`#143c57` navy ramp, `#92d528` green, `#bb352a` red, `#f4f4f4` off-white, `#676767` light text.
  - Dark vs light chat palettes are structurally identical 20-key sets → maps to `data-theme` attribute; **admin room uses `--darkTheme-*`** (§10.3.2–3). Note: admin-msg row bg `--darkTheme-msgs-bg-adm #0f2e43`.
  - Flat design: dominant radius **6px** (245), 8/16px spacing grid, **only one real drop shadow** `rgba(0,0,0,.5) 0 4px 20px` on modals; `data-ng-dblclick` confirms an **AngularJS** layer, Angular `ng-version 17.3.12` (§10.5.4, §10.6).
- **notes**: ⚠️ **Internal token-family discrepancy flagged by the file itself but note the room-vs-token skin conflict:** 03 says the drawer *computed* to a LIGHT skin while tokens are dark; 10 asserts the admin room uses the DARK palette. Reconcile per-surface against computed styles. Best-authority for the token catalog + anchor chains. Darkly `--danger #E74C3C` = `rgb(231,76,60)` here is the root of the 04-vs-09 files-badge conflict.

---

# 11-misc-uncovered.md
- **path**: evidence-folder/_report-sections/11-misc-uncovered.md
- **kind**: md-analysis — SECONDARY/PROSE, NOT authority, must be verified against the raw dumps
- **size**: 22813 bytes
- **role**: admin room catch-all. From `elements-other.json` (284 nodes not owned by other sections). Document mode `lightTheme`.
- **format/quality**: prose analysis of computed styles+rects; completeness/accounting pass.
- **surfaces documented**: document chrome/root boundary (`html`/`body`/`app-root`/`app-room`/`.wrapper`); collapsed sidebar geometry; `app-room-roster` host; top-nav indicator cluster; `as-split` scaffold + resize gutter; message composer; FA `::before` codepoint inventory; presentation tabs + screenshare host chain; duplicated webcam holders; **off-screen chat kebabs + trade spans**.
- **maps to (our components)**: layout root, split gutter, composer, presentation host chain, plus the chat kebab/trade-tag primitives.
- **key findings** (cited):
  - **Angular `ng-version="17.3.12"`** on `app-root`; `.wrapper` (not the inline host) is the true layout root at `y:49, h:1117` (§11.1 flag).
  - **124 × `a#dropdownMenuLink.msgMenu.dropright.pt-1`** kebabs confirmed at large negative `y` (scrolled out): glyph `⠇` U+2807, color `#0a6db1`, 20px/600, `role=button data-bs-toggle=dropdown`, `dropright`. ⚠️ **Non-unique `id="dropdownMenuLink"` repeated 124× (invalid HTML the source ships) — use a class in our build.** This CONFIRMS 08 and CONTRADICTS 06 (§11.10).
  - **11 × `span.tradeColor`** (`id="id_<24-hex>"`): color `#45a2ff`, 13px, weight 100 — trade-callout messages get a dedicated light-blue thin span (§11.10).
  - Resize gutter `div.as-split-gutter` **420,49,11×1117**, bg `#0a6db1`, `cursor:col-resize`, `role=separator`, `tabindex=0` (keyboard-resizable) (§11.5).
  - Composer capsule `#textAreaHolder.textSendDiv` 410×45, white, `border-radius:8px`, textarea `#676767`; GIF button is a **text label, not an icon** (§11.6).
  - Full FA `::before` codepoint table for 22 glyphs (§11.7) — cross-checks 03/04/09 glyph maps.
- **notes**: Explicit completeness proof ("nothing in `elements-other.json` is undocumented"). Warns the `icon:"fas fa-check"` field on wrapper nodes is a capture artifact, not a real glyph — authoritative source is the `::before` codepoint table, not the `icon` field. Best-authority for the kebab existence, split gutter, and root-boundary facts.

---

## Cross-file contradictions (must resolve against raw dumps — these prove the "prose is secondary" rule)

1. **Kebab / `msgMenu` existence — 06 vs 08 vs 11.**
   - **06 §6.4.2** asserts: *"No kebab / overflow-menu element exists anywhere in this capture (no `fa-ellipsis*`, no `msgMenu`/`msg-menu` class on any of the 2349 nodes)."* — but that search was scoped to `elements-alerts.json` only.
   - **08 §6a** and **11 §11.10** both document **124 × `a#dropdownMenuLink.msgMenu.dropright`** kebabs (glyph `⠇`), sourced from `controls.json` / `elements-other.json`.
   - **Resolution:** kebabs DO exist (in the chat scrollback). 06's blanket "anywhere in this capture" is an **overstatement / prose error** — the real bar is: alert rows use a Q&A `?` button on the right; chat rows also carry a per-message `msgMenu` kebab. Verify counts/classes against `controls.json` + `elements-other.json`.

2. **Files count badge background color — 04 vs 09.**
   - **04 §04.4** claims `.bg-danger` is OVERRIDDEN to **`rgb(231,76,60)`** (coral, = Darkly `--danger #E74C3C`, corroborated by 10.3.1).
   - **09 [34–36]** states the **computed** `.files-badge` background is **`rgb(220,53,69)` (`#dc3545`, Bootstrap `--bs-danger-rgb`)**.
   - **Resolution:** the two disagree on whether Darkly's `--danger` or Bootstrap's `--bs-danger-rgb` wins for `.bg-danger` on this element. 09 claims to quote the computed value from `targeted.json`; verify the actual computed `background-color` on the `.files-badge` node in the raw `targeted.json` before building.

3. **Sidebar drawer skin: dark tokens vs light computed — 03 vs 10.**
   - **03** capture-state note: the drawer *computed* to a LIGHT skin (white bg, `#676767` text) even though tokens are dark navy (`--sidebar-wrapper-bg-color #103d5c`).
   - **10** asserts the admin room uses the `--darkTheme-*` palette throughout.
   - **Resolution:** likely a per-surface theme-class state at capture (host `app-room` carries `lightTheme` class per 01/11) vs. token intent. Resolve per-surface against computed styles in the raw slices; do not assume one global skin.

## Honest scope note
All 11 files are prose reconstructions that themselves flag many INFERRED/uncaptured regions (empty chat panel in 01, presenter navbar in 02, lazy dropdowns/roster rows in 03, hidden Streams/Notes/Files panes in 04, collapsed cams in 05, closed modals in 07). None of these files are raw dumps; every cited value needs a raw-dump cross-check. No file was corrupt, empty, or a duplicate; each covers a distinct surface with only intentional cross-references.
