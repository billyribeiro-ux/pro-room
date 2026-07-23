# proroom-ultra-admin-room.json

- **path**: docs/reference/captures/proroom-ultra-admin-room.json
- **kind**: json-capture
- **size**: 9,186,618 bytes (~8.76 MB / 9 MB on disk)
- **role**: admin (leaning mixed) — determined by `meta.label` = `"admin-room"` and `meta.url` = `https://chat.protradingroom.com/?id=652754202ad80b3e7c5131e2&sl=1`. The capture also carries full presenter surfaces (webcams, presentation area, presenter-cams, `pNameLabel`) and the moderation UI, so it is effectively the fullest-privilege view. This is a RENDERED-DOM authority capture (rects + computed styles), so it OUTRANKS any prose `.md` on conflicts.
- **format/quality**: computed styles + rects + attrs, plus the full head/CSS environment. Not raw HTML-inline-style; each node in `elements` has `{path, tag, rect, attrs, icon, style, before, after}` where `style` is the resolved computed-style map (e.g. `width:"2027px"`, `box-sizing:"border-box"`). `meta.elementsCapped=false`.

## Structure (verified by `node -e` key inspection)
Top-level keys: `meta, head, cssVariables, fonts, stylesheets, palette, elements, subtrees, targeted, controls, assets, inventory, errors`.

- `meta`: `label:"admin-room"`, `title:"Mastering The Trade"`, `viewport:{w:2027,h:1244,dpr:2}`, `screen:{w:2560,h:1440}`, `theme:{htmlClass:"",bodyClass:"",dataTheme:null}`, Chrome/149 macOS UA, `tooNarrow:false`, `elementsCapped:false`.
- `head`: `{stylesheetLinks, fontLinks, preloads, metas}`.
- `cssVariables`: `{root, body}` — `root` has **294** custom properties (e.g. `--sidebar-menu-color`, `--users-color`, `--lightTheme-roster-bg-adm`, `--darkTheme-msgs-bg-adm`). Both light and dark theme variable families are present; the ACTIVE indirection resolves to lightTheme (see key findings).
- `stylesheets`: **41** entries, all `href` (external `<link>` sheets; full CSS text embedded — the marker-class CSS rules like `.msg-box-adm`, `.user-badge-img`, `.flex-row-reverse` live here).
- `palette`: color-frequency histogram. Dominant: `rgb(33,37,41)` #212529 ×19207 (Bootstrap dark text), `rgb(204,204,204)` ×729, `rgb(244,244,244)` ×406, `rgb(69,162,255)` #45a2ff ×400 (link/accent blue), `rgb(255,255,255)` ×280, `rgb(10,109,177)` ×79.
- `elements`: array of **1177** styled nodes (deduped/representative set).
- `subtrees`: `{topnav, sidebar, presentation, webcams, roomShell}` — each `{found, rootPath, count, nodes}`. Node counts: roomShell **600**, presentation **468**, sidebar **67**, topnav **57**, webcams **16**.
- `targeted`: array of **48** explicit selector captures (see selector list in key findings).
- `controls`: array of **156** interactive controls (buttons/links) with label+path+rect+icon.
- `assets`: `{images:33, backgroundImages:8, inlineSvgs:0}`.
- `inventory`: pre-extracted buttons list (e.g. "Mobile App Info" `btn btn-sm btn-secondary`, "Sort by Trials" `flex-fill users-btns` icon `fas fa fa-cog`, "Reload Users" `reload-room-users` icon `fas fa fa-sync`).
- `errors`: present (not inspected in depth).

## Surfaces documented
Top navbar (`nav.mainAppNav` = `navbar navbar-expand-md navbar-dark fixed-top`), room sidebar / user roster (`app-room-roster`, `.room-roster-list`, `active-room-users`, sort/reload-users controls, `users-btns`), presentation area (`app-presentationarea`, `.presentation-box`, `.pNameLabel`, `.overlay`), webcams (`app-webcam-holder`, `.webcam-wrapper`, `app-presenter-cams`, `.card.webcamsHolder`, `video.webcamsHolderVideo`), main tabset (`#mainTabs`, `.nav-tabs`, `.nav-link.active`, `.files-badge`), chat/messages (`msg-box`, admin message variant `msg-box-adm`, `app-st-message`, `alert-qa`, `tradeColor`), volume/sound (`.volumeControl`, `.room-sound-options`), branding (`a.navbar-brand`, `img.brand-logo`).

## Maps to (our components)
- Top navbar → our room top-nav / app header component (selector `nav.mainAppNav`, rect `{x:0,y:0,w:2027,h:49}`).
- Roster/sidebar → room-roster + user-list + sort/reload-users controls (reason: `app-room-roster`, `.room-roster-list`, `users-btns`, `reload-room-users` all captured).
- Presentation stage → presentation-area / stage component (reason: `app-presentationarea`, `.presentation-box`, `.pNameLabel`, `.overlay`).
- Webcams strip → webcam-holder / presenter-cams (reason: `app-webcam-holder`, `app-presenter-cams`, `video.webcamsHolderVideo`).
- Main tabset (Chat/Alerts/Notes/Files) → mainTabs tabset (reason: `#mainTabs`, `.nav-tabs`, `.files-badge`).
- Chat message list → message row + admin-message variant (reason: `.msg-box` rendered ×50, `.msg-box-adm` CSS rule, `.alert-qa`, `.tradeColor`).

## Key findings (cited)
1. **Active theme is LIGHT despite empty theme attrs.** `meta.theme.dataTheme=null` and both html/body class empty, yet the active indirection resolves light: `--msgs-bg: var(--lightTheme-msgs-bg)`, `--msgs-bg-adm: var(--lightTheme-msgs-bg-adm)`, `--msg-border-color: var(--lightTheme-msg-border-color)` (found by grepping the embedded CSS text). Both `--lightTheme-*` and `--darkTheme-*` families exist in `cssVariables.root` (294 props).
2. **Admin message styling is real and CSS-defined, not a text badge.** Rule `.msg-box-adm { background-color: var(--msgs-bg-adm); border-bottom: 2px; padding-top: 2px; }` exists in the stylesheet text. In THIS capture `.msg-box-adm` appears 0× as a rendered element class (no admin message currently on screen), while `.msg-box` renders 50× — so the admin-message variant is available but not instantiated in the snapshot.
3. **Badges are `<img class="user-badge-img">`, confirming the CLAUDE.md warning.** CSS rule `.user-badge-img { width:auto; height:100%; max-height:20px; }` is present; the marker appears in CSS but 0× as a rendered element attr in this frame — badges are image elements, NOT "New"/"Trial" TEXT badges. Rendered capture wins over any prose claiming text badges.
4. **Accent/link color = `#45a2ff`.** `cssVariables.root["--app-link-color"] = "#45a2ff"`, corroborated by palette entry `rgb(69,162,255)` ×400. Dominant surface text color is `#212529` (`rgb(33,37,41)` ×19207).
5. **48 targeted selectors give exact rects/styles for the load-bearing chrome**, including: `nav.mainAppNav`, `span.sidebar-menu`, `span.users`, `a.navbar-brand` (×4), `img.brand-logo`, `li.talkingIndicator`, `.volumeControl`, `app-room-roster`, `.room-roster-list`, `app-presentationarea`, `#mainTabs`, `.nav-tabs`, `.nav-link.active`, `.files-badge`, `app-webcam-holder`, `app-presenter-cams`, `.card.webcamsHolder`, `video.webcamsHolderVideo`, `.overlay`, `.pNameLabel`, `.presentation-box`. Angular attrs like `_ngcontent-ng-c977335924` confirm the source app is Angular (component-scoped attributes) — useful when mapping selectors to our Svelte components.

## Notes
- **Best-authority flag**: this is the fullest-privilege rendered capture in the corpus (admin-room label + presenter surfaces + moderation controls + computed styles/rects). Treat it as PRIMARY authority for admin/presenter layout and for theme-variable resolution.
- Marker "counts" from a raw string grep of the whole JSON conflate three sources: embedded stylesheet CSS rules, element `attrs.class`, and node paths. Verified rendered-element counts (from `elements[].attrs.class`) differ sharply from raw counts — e.g. `app-st-message` raw 1336 but 0 rendered in `elements` (it lives in CSS + deep subtree nodes, not the deduped `elements` array); `msg-box` raw 1327 vs 50 rendered. Cite the rendered count, not the raw grep, when asserting on-screen presence.
- `assets.inlineSvgs = 0`; icons are Font Awesome classes (`fas fa fa-cog`, `fas fa fa-sync`, `fas fa-check`) per `elements[].icon`, matching the FA-pinned branding note.
- No corruption/duplication observed; JSON parses cleanly; `elementsCapped:false` (complete, not truncated).
