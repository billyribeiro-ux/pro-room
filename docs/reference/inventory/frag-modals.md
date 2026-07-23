# frag-modals — forensic inventory (Phase 1)

Assignment slug: `frag-modals`. Corpus location: `docs/reference/visual-evidence-deep/fragment-pages/`.

All four are single-fragment HTML DOM dumps wrapped by a synthetic evidence harness
(`<div class="evidence-banner">` + pill counts, then `<div class="evidence-wrap">` holding the raw
Angular fragment). Each embeds the full **Bootswatch v4.3.1 (Darkly)** stylesheet inline (`<style>` with
`--primary:#375a7f`, `--success:#00bc8c`, verified by grep), which is why every file is ~450 KB despite
only a few dozen real DOM nodes. FontAwesome is linked via a local `file://` path
(`node_modules/@fortawesome/fontawesome-free/css/all.min.css`) — not embedded.

Raw DOM + inline attributes are the authority here (this is a `html-dom-dump`, not a computed-styles/rects
JSON capture — there are NO rects or computed styles in these files).

---

# avsettingsmodal.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/avsettingsmodal.html.html
- **kind**: html-dom-dump
- **size**: 456,892 bytes (~446 KB; bulk = embedded Bootswatch Darkly CSS)
- **role**: mixed (member + presenter) — determined from DOM: active `#user-audio-video-settings` tabpanel is member-facing "User Settings"; a second `#presenter-audio-video-settings` tabpanel exists in the template but its tab-link `<li>` is NOT rendered (only one `<li class="nav-item">` "User Settings" then an Angular `<!---->` placeholder).
- **format/quality**: raw DOM + inline attributes (Angular `_ngcontent-ng-c286619529` scope ids); NO computed styles, NO rects
- **surfaces documented**: Audio/Video Settings modal (`#av-settings-modal`, `class="modal fade"`)
- **maps to (our components)**: an AV/device-settings modal component (Bootstrap `modal-dialog` > `modal-content` with header/body/footer); tabbed settings pane
- **key findings** (cited):
  1. Modal id is `av-settings-modal`, header `<h5>Audio/Video Settings</h5>`, close is `<button class="btn-close btn-close-white">` (Bootstrap 5 close-button API, `data-bs-dismiss="modal"`).
  2. Tabset `<ul id="userSettingsTab" class="nav nav-tabs">` — only ONE tab link rendered: `#user-audio-video-settings-tab` "User Settings" (`class="nav-link active"`, `aria-selected="true"`); presenter tab link is Angular-suppressed (`<!---->`).
  3. Member "User Settings" pane contains: a `Disable Video` nav-link with `<i class="fas fa-desktop">` and sub-label `<span class="saves-bandwidth">(saves bandwidth)</span>`; a `Speakers:` `<select id="speakers-device" class="form-control">` with two options ("Default - External Headphones", "…Headphones 2") and a `Test` button `<button class="btn btn-outline-light">` with `<i class="fas fa-volume-up mr-2">`.
  4. Hidden presenter pane `#presenter-audio-video-settings` (`class="tab-pane fade"`, not active) has `Audio device (input):` `#audio-deviceList` and `Video device (input):` `#video-deviceList` as EMPTY `<select class="form-select">` plus a `Change Devices` `<button class="btn btn-primary">`.
  5. Footer `<div class="modal-footer text-center">` = `Save` (`btn btn-success`, `type="submit"`) + `Close` (`btn btn-secondary`, `data-bs-dismiss="modal"`).
- **notes**: Evidence banner pills read "0 app tags / 4 modal ids / 12 audited gaps". This variant has NO Angular host element — the fragment starts at the bare `<div id="av-settings-modal">`. DOM body is byte-identical to `avsettingsmodal1.html.html` EXCEPT the missing `<app-av-settings-modal>` host wrapper (see below). Companion screenshot: `../visual-evidence-deep/original-fragments/avsettingsmodal.html.png` (42,681 bytes).

---

# avsettingsmodal1.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/avsettingsmodal1.html.html
- **kind**: html-dom-dump
- **size**: 457,894 bytes (~447 KB; ~1 KB larger than avsettingsmodal.html.html)
- **role**: mixed (member + presenter) — same tab structure as above
- **format/quality**: raw DOM + inline attributes; NO computed styles/rects
- **surfaces documented**: Audio/Video Settings modal, wrapped in its Angular component host
- **maps to (our components)**: same AV-settings modal component as avsettingsmodal.html.html
- **key findings** (cited):
  1. This is the SAME modal as `avsettingsmodal.html.html`, but the fragment is wrapped in the Angular host element `<app-av-settings-modal _ngcontent-ng-c977335924="" _nghost-ng-c286619529="">` — banner pill reads "1 app tags" (vs "0 app tags" for the sibling), confirming the only delta is the component host tag.
  2. Inner modal (`#av-settings-modal`), header (`Audio/Video Settings`), tabset (`#userSettingsTab`), both tabpanes, and footer buttons are identical to avsettingsmodal.html.html (same `_ngcontent-ng-c286619529` scope id, same `speakers-device`/`audio-deviceList`/`video-deviceList` ids, same Save/Close footer).
  3. Confirms the component selector is literally `app-av-settings-modal` — useful for mapping the Angular component boundary to a Svelte component.
- **notes**: DUPLICATE of avsettingsmodal.html.html at the DOM-content level; superset by exactly one wrapper element (`<app-av-settings-modal>`). Best authority for the **component name/boundary**; use avsettingsmodal.html.html interchangeably for inner markup. Companion screenshot: `../visual-evidence-deep/original-fragments/avsettingsmodal1.html.png` (43,028 bytes).

---

# dropdownstart.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/dropdownstart.html.html
- **kind**: html-dom-dump
- **size**: 452,849 bytes (~442 KB; bulk = embedded Darkly CSS)
- **role**: member — determined from surface: a room-level volume/sound nav-item available to all attendees (no presenter/admin-gated markup present)
- **format/quality**: raw DOM + inline attributes (Angular `_ngcontent-ng-c977335924` scope id); NO computed styles/rects
- **surfaces documented**: Volume nav dropdown — the FULL nav-item including the trigger button AND the open dropdown panel
- **maps to (our components)**: top-nav Volume control + its dropdown panel (volume slider, mute, per-sound do-not-disturb toggles)
- **key findings** (cited):
  1. Root is `<li class="nav-item dropdown dropstart">` (Bootstrap `dropstart` = opens to the left) containing trigger `<a id="dropdownVolume" data-bs-toggle="dropdown" class="nav-link d-flex align-items-center">` with `<i class="fas fa-2x fa-volume-up">` + `<span class="ml-2 mainNavItem">Volume</span>`.
  2. Panel `<div class="dropdown-menu volumeControl" aria-labelledby="dropdownVolume">` header `<h4>Volume</h4>` with a close `<span class="float-right mr-2"><i class="fas fa-times"></i></span>`.
  3. Volume control is `<input audiovolslider type="range" min="0" max="100" title="Volume" class="mx-auto py-2 volCtrl ng-untouched ng-pristine ng-valid">` followed by a `Mute` `<button class="btn btn-primary btn-sm" title="Mute Audio">`; then `<hr>` and `<div class="dropdown-divider">`.
  4. `<div class="room-sound-options">` holds SIX `<div class="my-1">` checkbox toggles (all `class="form-check-input"` + `form-check-label`, each label ending in `<span>on</span>`): `alert-donot-disturb` "Alert sound", `qa-donot-disturb` "QA sound", `non-trade-donot-disturb` "NTA sound", `chat-donot-disturb` "Chat sound", `presentation-subtitles` "Subtitles" (label has `<i class="fas fa-closed-captioning">`), `app-donot-disturb` "Don't Disturb".
  5. Custom `audiovolslider` attribute directive + `volCtrl` class on the range input are load-bearing identifiers for the slider behavior.
- **notes**: SUPERSET of dropdownvolume.html.html — this file adds the `<li>`/trigger `<a>` chrome around the identical panel markup. Banner pills: "0 app tags / 1 modal ids / 15 audited gaps". Best authority for the **trigger + panel together**. Companion screenshot: `../visual-evidence-deep/original-fragments/dropdownstart.html.png` (30,678 bytes).

---

# dropdownvolume.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/dropdownvolume.html.html
- **kind**: html-dom-dump
- **size**: 451,804 bytes (~441 KB; bulk = embedded Darkly CSS)
- **role**: member — same room volume/sound surface, panel only
- **format/quality**: raw DOM + inline attributes (Angular `_ngcontent-ng-c977335924`); NO computed styles/rects
- **surfaces documented**: Volume dropdown PANEL only (`dropdown-menu volumeControl`), without the nav trigger
- **maps to (our components)**: the volume/sound dropdown panel body
- **key findings** (cited):
  1. Fragment root is the panel `<div class="dropdown-menu volumeControl" aria-labelledby="dropdownVolume">` — NO enclosing `<li class="nav-item dropdown dropstart">` or trigger `<a>` (that is the only difference from dropdownstart.html.html).
  2. Panel inner markup is BYTE-IDENTICAL to the panel inside dropdownstart.html.html: same `<h4>Volume</h4>` + close `<i class="fas fa-times">`, same `type="range" min="0" max="100"` `volCtrl` slider, same `Mute` `btn btn-primary btn-sm`, same `<hr>` + `dropdown-divider`.
  3. Same six `room-sound-options` toggles in the same order (Alert / QA / NTA / Chat / Subtitles+`fa-closed-captioning` / Don't Disturb), each `form-check-input` + `form-check-label` with trailing `<span>on</span>`.
- **notes**: DUPLICATE (panel subset) of dropdownstart.html.html. Banner pills: "0 app tags / 1 modal ids / 12 audited gaps" (12 vs 15 gaps — the 3 extra in dropdownstart correspond to the added trigger chrome). Prefer dropdownstart.html.html as authority; this file is redundant except to confirm the panel renders standalone. Companion screenshot: `../visual-evidence-deep/original-fragments/dropdownvolume.html.png` (28,593 bytes).

---

## Cross-file notes
- **Palette authority caveat**: all four embed **Bootswatch v4.3.1 Darkly** (`--primary:#375a7f`, `--success:#00bc8c`) inline. Per project memory the admin-room navy capture is the governing palette, not Darkly — so treat these fragments as authority for **structure/markup/ids/classes**, and verify exact colors against the JSON computed-style captures, not this embedded Darkly CSS.
- **No JSON captures in this set** — none of these files carry rects or computed styles; pixel-exact spacing/color must come from the `json-*` captures elsewhere in the corpus.
- **Duplicate pairs**: (avsettingsmodal.html.html ↔ avsettingsmodal1.html.html) differ only by the `<app-av-settings-modal>` host wrapper; (dropdownstart.html.html ⊃ dropdownvolume.html.html) differ only by the nav trigger chrome.
