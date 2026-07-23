# file-1.html.html

- **path**: docs/reference/visual-evidence-deep/fragment-pages/file-1.html.html
- **kind**: html-dom-dump (specifically: a wrapped copy of the app's **static `index.html` source** — CSS + inline scripts, NOT a rendered-state capture)
- **size**: 620,359 bytes (~606 KB) — `wc -c`
- **role**: n/a / mixed — this is the shared app shell (stylesheet + boot scripts) served to every role; there is no rendered per-role DOM to key off. The bundled evidence-banner literally states **"0 app tags"** and **"0 modal ids"** (`dd` @ offset 446305).
- **format/quality**: raw source (full CSS + one inline `<script>` of helper JS) — **NOT** computed styles+rects, and **NOT** rendered Angular component DOM. No states/groups.

## What this file actually is (verified)
- Byte 446305 begins an **evidence wrapper**: `<body class="darkTheme lightTheme">` → `<div class="evidence-banner">` with pills: `files/file-1.html`, `0 app tags`, `0 modal ids`, `23 audited gaps` (`dd` @446305).
- Inside `<div class="evidence-wrap">` sits an inner `<head>` with `<title>Mastering The Trade</title>` and `<base href="/">` — i.e. the room app's own `index.html` head (`dd` @446305).
- The first ~446 KB is the giant inlined CSS blob (Bootswatch v4.3.1 header comment at offset ~350; the head `<link>` to fontawesome all.min.css at offset ~200).
- There is exactly **1 `<script>`** tag (`grep -oc '<script'`), containing helper JS: `bootbox.dialog` image viewer, `downloadImage(url,imageName)` via XHR blob, plus a giphy-search and version-history-panel inline `<style>` at EOF (`tail -c 2000`).
- **Critical**: every "room marker" I probed matches **only inside CSS rule bodies**, never as a rendered `class="…"` attribute. E.g. `.presentation-box{position:relat…`, `.user-badge-img{width:auto;hei…`, `.mainTabset .nav-link,.noteTabset .nav-link{…}` (grep with `.{25}<marker>.{15}` context). `presUser`, `chatHeader`, `msg-box`, `room-roster`, `volumeControl` returned **zero** contextual DOM hits — the raw substring counts from a naive `grep` were CSS/JS noise. So this file documents **styling**, not layout/structure.

## surfaces documented (as CSS definitions only — no rendered instances)
Room-specific selectors that ARE defined here (CSS-ref counts via `grep -oE '\.<name>\b'`):
- `note-modal` (45) — Summernote-based Notes editor styling
- `giphy-search` (33) — GIF picker
- `alert-chat-box` (30) — alerts/chat column
- `mainTabset` (12), `noteTabset` (11), `files-tabs` (6), `files-badge` (1) — tabbed panels
- `volumeControl` (7), `st-searchbar` (5), `version-history-panel` (5), `user-badge-img` (4), `msg-box` (3), `presentation-box` (1)

## maps to (our components)
- Global theme tokens / `app.css` — the `:root` Bootswatch variables are the authority for palette.
- Notes editor component — `.note-modal` / `.note-nav-*` styles.
- Chat/Alerts column, Files tab, Presentation stage, roster badges — but **as visual/CSS reference only**; use a rendered capture (a JSON state dump or a fragment WITH `class="…"` DOM) for structure/layout.

## key findings (cited)
1. **Theme palette authority.** `:root{ … --primary: #375a7f; --success:#00bc8c; --green:#00bc8c; --info:#3498DB; --warning:#F39C12; --danger:#E74C3C; --light:#303030; }` — Bootswatch v4.3.1 (comment header). Consistent with the Darkly-family navy/green. (head CSS @ offset ~1050; `grep -oE '\-\-green: #…'` → `#00bc8c`).
2. **FontAwesome pinned to v5.8.1.** Inner head links `https://use.fontawesome.com/releases/v5.8.1/css/all.css` (`grep -oE 'releases/v[0-9.]+/css/all'`). Matches the MEMORY note "FA pinned 5.8.1".
3. **App identity.** Inner `<title>Mastering The Trade</title>` and `<base href="/">` (a commented-out `<!-- <base href="/v4" /> -->` sits above it) — `dd` @446305.
4. **No rendered DOM / no modals.** Evidence banner asserts `0 app tags`, `0 modal ids`, `23 audited gaps` — so this file cannot be used for element structure, roster contents, badge `<img>` sources, or presenter-vs-member differences. Any such claim must come from a different capture.
5. **Inline JS behaviors present.** Image lightbox via `bootbox.dialog(...className:"imgur-modal")` and `downloadImage()` XHR→blob→objectURL download flow (offset ~449444, `dd`). These are real runtime behaviors the rebuild's image viewer/download must replicate.

## notes
- **Best-authority flag**: this is the strongest single source for the room's **global CSS / theme tokens and FontAwesome pinning**, but it is **NOT authority for layout, structure, roster, badges, or role differences** (no rendered DOM). Pair with a rendered JSON state capture for those.
- The 620 KB size is almost entirely one inlined stylesheet (Bootswatch 4.x twice-over + Summernote note-modal + custom room CSS); low information density per byte.
- Wrapper vs. content: outer `<body class="darkTheme lightTheme">` is the evidence-viewer chrome; the inner `<head>`/scripts are the real app shell. Do not confuse the wrapper's classes for app classes.
- Not a `.md` prose file, so the "secondary/not-authority" caveat for analysis docs does not apply — but note this file's own embedded banner ("23 audited gaps") is itself a prior-analysis annotation and is not authority.
