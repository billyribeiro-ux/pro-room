# Assets inventory (slug: assets-note)

Scope: image/vector assets and the two viewer index.html shells. Per assignment these are
catalogued as assets (one entry each, no deep read). None of these are raw-dump authority — the
authority remains the JSON captures + HTML DOM dumps. The two `index.html` files below are
**viewer shells / prior-analysis presentation**, not authority.

---

# visual-evidence-deep.png
- **path**: docs/reference/visual-evidence-deep/visual-evidence-deep.png
- **kind**: asset(png) — screenshot
- **size**: 6,846,497 bytes (6.8 MB)
- **role**: mixed (n/a — composite screenshot; role not decodable from a bitmap)
- **format/quality**: screenshot (raster)
- **surfaces documented**: full stacked/stitched composite of the deep-evidence set
- **maps to (our components)**: whole-app visual reference; not component-specific
- **key findings** (cited):
  - Dimensions 1500 × 37,032 px (`sips -g pixelWidth/pixelHeight`) — an extremely tall stitched
    strip (aspect ~1:25), i.e. a single vertically-concatenated montage, not one viewport.
  - Referenced by the deep viewer: `grep -c visual-evidence-deep.png .../visual-evidence-deep/index.html` = 0,
    so the deep `index.html` does NOT embed/link this file by name — it stands as a standalone artifact.
  - It is a rendered raster only: no DOM, no styles, no text extractable — cannot be authority.
- **notes**: Largest asset in the corpus. Treat as illustrative overview; verify any claim against JSON/HTML dumps.

---

# original-fragments/*.png (per-fragment screenshots)
- **path**: docs/reference/visual-evidence-deep/original-fragments/
- **kind**: asset(png) — screenshots (one per fragment)
- **size**: directory 3.7 MB total; individual samples 1100 × 760 px each
  (`sips` on navbar.html.png and webcamholder.html.png both = 1100×760)
- **role**: member/presenter/mixed (n/a per-image — role inferred only from the source fragment name)
- **format/quality**: screenshot (raster) — one rendered PNG per HTML fragment
- **surfaces documented**: 52 fragment renders (see mapping below)
- **maps to (our components)**: each PNG is the rendered picture of the like-named HTML dump in
  `../fragment-pages/<name>.html.html`. `comm -3` of the two dir listings (stripping `.png` vs `.html`)
  returned EMPTY → every PNG has an exact 1:1 fragment-page sibling.
- **key findings** (cited):
  - **COUNT DISCREPANCY / honest gap**: assignment says "53 per-fragment screenshots"; actual is
    **52** (`ls original-fragments | wc -l` = 52). If 53 was meant to include the top-level
    `visual-evidence-deep.png`, that file lives one directory up, not in `original-fragments/`.
  - Naming convention is `<fragment>.html.png`; the fragment each PNG corresponds to is its filename
    stem (e.g. `navbar.html.png` → the `navbar` fragment).
  - The deep viewer references this folder heavily: `grep -c original-fragments .../index.html` = 65.
  - Fragment → surface mapping (from filenames; the sibling HTML dump is the authority for content):
    - Nav surfaces: `navbar`, `subnavbar`, `mixednavs`, `navbars-room`, `navfile`, `as-splitter`
    - Webcam / presentation stage: `webcamholder`, `afterwebcamholder`
    - Settings modals: `appusersettingsmodal`, `avsettingsmodal`, `avsettingsmodal1`
    - Connection / lifecycle states: `connected`, `reload`
    - Dropdown menus: `dropdownstart`, `dropdownvolume`
    - Files / notes tab documents: `file-1`, `file2`–`file34` (numeric series), `important-doc`,
      `pagesource`, `odds-and-ends`
  - Full list of the 52 stems: afterwebcamholder, appusersettingsmodal, as-splitter, avsettingsmodal,
    avsettingsmodal1, connected, dropdownstart, dropdownvolume, file-1, file2, file3, file4, file5,
    file6, file7, file8, file9, file10, file11, file12, file13, file14, file15, file16, file17, file18,
    file19, file20, file21, file22, file23, file24, file25, file26, file27, file28, file29, file30,
    file31, file32, file33, file34, important-doc, mixednavs, navbar, navbars-room, navfile,
    odds-and-ends, pagesource, reload, subnavbar, webcamholder.
- **notes**: Secondary/illustrative. Pair each PNG with `fragment-pages/<name>.html.html` (raw DOM) for
  authoritative content.

---

# capture-geometry/*.svg (4 files)
- **path**: docs/reference/visual-evidence-deep/capture-geometry/
- **kind**: asset(svg) — element-geometry diagrams derived from the 4 JSON captures
- **size**: proroom-full-member.json.svg 20,000 B · proroom-full-presenter.json.svg 20,003 B ·
  proroom-ultra-admin-room.json.svg 20,006 B · proroom-ultra-member-room.json.svg 19,902 B
- **role**: one per capture — **member** (proroom-full-member), **presenter** (proroom-full-presenter),
  **admin** (proroom-ultra-admin-room), **member** (proroom-ultra-member-room). Determined from the
  `<text>` label baked into each SVG.
- **format/quality**: vector rect-map — each element's bounding rect drawn to scale (computed-style
  colours + rects visualised); NOT the raw data itself.
- **surfaces documented**: full-page element layout geometry of each of the 4 JSON captures
- **maps to (our components)**: layout/positioning reference for the room shell of each role state.
- **key findings** (cited):
  - Each SVG names its source JSON in a `<text x="10" y="20" ...>` label, e.g.
    `proroom-full-member.json`, `proroom-full-presenter.json`, `proroom-ultra-admin-room.json`,
    `proroom-ultra-member-room.json` → these are geometry renders of the 4 authority JSON captures.
  - Canvas: `width="533" height="762" viewBox="0 0 533 762"` with dark bg `<rect fill="#071b29"/>`
    (header text `fill="#e8f7ff"`) — a scaled-down full-page map, not 1:1 pixels.
  - Elements drawn as translucent rects with labels, e.g.
    `<rect ... fill="rgb(92,173,173)" fill-opacity=".22" .../><text ...>html</text>` — root `html` box
    positioned at x≈67.3 y≈486.0 (member) vs y≈460–476 (admin/member-room), i.e. per-capture geometry differs.
  - Purely derived visualisation — verify any rect/colour against the source JSON's `states/groups`
    rects + computed styles, which are the authority.
- **notes**: Derivative of the JSON captures; useful as a quick spatial index, not as a data source.

---

# visual-evidence-deep/index.html
- **path**: docs/reference/visual-evidence-deep/index.html
- **kind**: other — HTML viewer shell (prior-analysis presentation, NOT authority)
- **size**: 122,213 bytes (122 KB)
- **role**: mixed (a gallery viewer spanning all roles/fragments)
- **format/quality**: prose/presentation HTML that arranges the fragment PNGs + captures for
  side-by-side viewing (a report page, not a dump)
- **surfaces documented**: index/gallery over the deep evidence set
- **maps to (our components)**: n/a — navigation aid only
- **key findings** (cited):
  - `<title>Deep Visual Hard Evidence: Original App vs Repo</title>` — explicitly a comparison viewer.
  - References `original-fragments` 65× and `capture-geometry` 1×; references `fragment-pages` 0× and
    `visual-evidence-deep.png` 0× (all via `grep -c`). So the gallery is built primarily from the
    per-fragment PNGs plus the geometry SVG.
- **notes**: Viewer/prior-analysis, NOT authority. Any assertion it makes must be verified against the
  raw JSON/HTML dumps.

---

# visual-evidence/index.html
- **path**: docs/reference/visual-evidence/index.html
- **kind**: other — HTML viewer shell (prior-analysis presentation, NOT authority)
- **size**: 3,978,707 bytes (3.9 MB) — large; inspected by markers only, not read whole
- **role**: mixed (ProRoom hard-evidence viewer)
- **format/quality**: presentation HTML with **inline base64 images** — `grep -c 'data:image'` = 8, so
  the page self-embeds 8 screenshots rather than linking files.
- **surfaces documented**: single-page hard-evidence overview
- **maps to (our components)**: n/a — presentation only
- **key findings** (cited):
  - `<title>ProRoom Visual Hard Evidence</title>`.
  - `grep -c 'visual-hard-evidence'` = 0 → it does NOT reference the sibling `visual-hard-evidence.png`
    by name; its imagery is the 8 inline `data:image` blobs instead.
- **notes**: Older/companion viewer to the `-deep` one. Prior-analysis, NOT authority.

---

# visual-evidence/visual-hard-evidence.png
- **path**: docs/reference/visual-evidence/visual-hard-evidence.png
- **kind**: asset(png) — screenshot
- **size**: 932,066 bytes (932 KB)
- **role**: mixed (n/a — composite bitmap)
- **format/quality**: screenshot (raster)
- **surfaces documented**: stitched hard-evidence composite (older set)
- **maps to (our components)**: whole-app visual reference; not component-specific
- **key findings** (cited):
  - Dimensions 1440 × 7,513 px (`sips`) — a tall stitched strip, smaller/earlier counterpart to the
    6.8 MB `visual-evidence-deep.png` (1500 × 37,032).
  - Not linked by name from its sibling `visual-evidence/index.html` (`grep -c visual-hard-evidence` = 0),
    so it stands as a standalone artifact next to the inline-embedded viewer.
- **notes**: Superseded in scope by `visual-evidence-deep.png` (which is ~5× taller / much larger).
  Raster only — cannot be authority.

---

## Summary of honest gaps / flags
- Assignment expected **53** per-fragment PNGs; corpus actually has **52** (verified via `wc -l`).
- All 7 items here are **derivative/presentation** assets. Authority stays with the JSON captures
  (`proroom-*.json`) and the raw HTML DOM dumps (`fragment-pages/*.html.html`).
- Clean 1:1 mapping confirmed: `original-fragments/<x>.png` ↔ `fragment-pages/<x>.html` (comm -3 empty).
