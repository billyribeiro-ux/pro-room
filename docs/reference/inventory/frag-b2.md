# frag-b2 — fragment-pages inventory (file9–file12)

**Scope:** `docs/reference/visual-evidence-deep/fragment-pages/{file9,file10,file11,file12}.html.html`
**Corpus shape (verified for all four):** each file is a standalone HTML document — `<title>fileN.html`, a `<link>` to the local FontAwesome `all.min.css`, and one giant inline `<style>` block containing **Bootswatch v4.3.1 / Bootstrap v4.3.1 "Darkly"** CSS (comment banner at head, `grep`'d). The `<body class="darkTheme lightTheme">` holds an injected `div.evidence-banner` (annotation pills) then a single `div.evidence-wrap` wrapping **exactly one Angular `app-*-modal` component** (`1 app tags` pill on every file; `grep -oE '<app-'` returns one unique tag each). So these are **isolated single-component DOM captures**, not full-room dumps.

> ⚠️ Marker-count trap (documented so later agents don't repeat it): a whole-file `grep` for room markers (`mainTabset`, `noteTabset`, `msg-box`, `st-searchbar`, `presentation-box`, …) returns 5–13 hits **per file — all inside the shared Bootstrap CSS `<style>` block, none in the DOM body.** The real DOM body is only 70–1200 lines (2.5 KB–65 KB) after the `<body>` tag (line 52 in every file). All findings below are from the body slice, not the CSS.

**Common technical facts (all four, cited):**
- **Framework:** Angular. `_ngcontent-ng-c*` / `_nghost-ng-c*` attributes present (`grep -o _ngcontent`: file9=231, file10=42, file11=12, file12=62). Shared parent component id `_ngcontent-ng-c977335924` on every `app-*` host.
- **Markup dialect = Bootstrap 5**, not the bundled CSS: `data-bs-toggle` / `data-bs-dismiss` present (`data-bs-`: 39–44 hits), `data-toggle=` (BS4) = **0** in all four, close buttons are `class="btn-close btn-close-white"` (BS5). **Mismatch worth flagging: DOM is BS5, bundled stylesheet is BS4.3.1 Darkly** — `btn-close` won't be styled by the bundled CSS.
- **Format/quality:** raw DOM + inline `style="…"` attributes only. **No computed styles, no rects** (`grep -oE 'getBoundingClientRect|computedStyle|"rect"'` = 0 in all four). Not a JSON/rendered capture.
- **Theme tokens present** but not authoritative here (BS4 Darkly `#303030` popover / `#222`-family surfaces live in the CSS block).

---

# file9.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file9.html.html
- **kind**: html-dom-dump (single isolated Angular component)
- **size**: 511,849 bytes (~500 KB; body slice only 65,545 bytes / 1200 lines — rest is Bootstrap CSS)
- **role**: **member** — it is the end-user preferences modal (personal chat/alert/app/theme prefs, "Edit my Info and Avatar"); no post/moderation controls. How determined: component tag + label inventory below.
- **format/quality**: raw DOM + inline styles (no rects/computed styles)
- **surfaces documented**: `app-user-settings-modal` → `#user-settings-modal`. Tabbed settings modal, `#userSettingsTab`. Tabs (id=*-tab anchors, grep'd): **App Settings** (`#user-app-settings-tab`), **Chat Settings** (`#user-chat-settings-tab`), **Alert Settings** (`#user-alert-settings-tab`). Theme + layout + color controls live in the App/Chat panes.
- **maps to (our components)**: our user/room settings modal (Settings modal with App/Chat/Alert tabs), theme picker (Light/Dark), chat-appearance controls, alert-preference toggles.
- **key findings** (cited):
  1. Tab ids present: `user-app-settings`, `user-chat-settings`, `user-alert-settings` (+ `-tab` anchors) — a 3-tab user-settings modal (`grep 'id="'`).
  2. Theme + layout controls (label text, perl-extracted): **Light Theme / Dark Theme**; room-layout radios **"Chat and Alerts left / top / right / bottom"**, **"PM logs on the right"**; ids `app-light-theme`, `app-dark-theme`, `roomLayout`, `pm-window-layout`.
  3. Chat appearance controls: **Text Color / Username Color / Background Color / Ticker Color / Text Size** (ids `chat-text-color`, `chat-username-color`, `chat-bg-color`, `chat-ticker-color`, `chat-text-size`).
  4. App-settings toggles (labels): **Don't Disturb, Start/Stop recording sound, Reactions Response, Reactions QA Response, Disable/Enable Video, Show Closed Captions Overlay, Edit my Info and Avatar**, Text Mode **Regular/Compact** (ids incl. `appDoNotDisturb`, `app-recording-start-sound`, `app-reactions-popup`, `appDisableVideo`, `appSpeechRecoOverlay`).
  5. Alert-settings toggles (labels): **Alert / QA Popup, Alert sound, QA sound, QA Reactions Sound, Non-trade alert sound, Longer alert popup, Filter out alerts**, Text Mode Regular/Compact (ids `alertPopup`, `alert-donot-disturb`, `non-trade-alert`, `longer-alert-popup`).
- **notes**: Largest of the four and the richest single surface in this batch. Best authority for the member Settings modal's full option set. evidence pills: `1 app tags`, `20 modal ids`, `21 audited gaps`.

---

# file10.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file10.html.html
- **kind**: html-dom-dump (single isolated Angular component)
- **size**: 457,864 bytes (~447 KB; body slice 11,559 bytes / 225 lines)
- **role**: **mixed** (member + presenter) — active tab is "User Settings"; a second, hidden `#presenter-audio-video-settings` tab-pane exists. How determined: two tabpanels below.
- **format/quality**: raw DOM + inline styles
- **surfaces documented**: `app-av-settings-modal` → `#av-settings-modal`, `<h5>Audio/Video Settings</h5>`, `modal-dialog` (default size). Tablist `#userSettingsTab`; active pane `#user-audio-video-settings` ("User Settings"), hidden pane `#presenter-audio-video-settings`.
- **maps to (our components)**: our A/V settings modal — device pickers (speakers/mic/camera), "Disable Video (saves bandwidth)", speaker test.
- **key findings** (cited):
  1. Active member pane `#user-audio-video-settings` (class `tab-pane fade show active`): **"Disable Video (saves bandwidth)"** (`i.fas.fa-desktop`) and a **Speakers** `<select id="speakers-device">` with sample options "Default - External Headphones" / "…Headphones 2" plus a **Test** button (`i.fas.fa-volume-up`).
  2. Hidden presenter pane `#presenter-audio-video-settings` (class `tab-pane fade`, not active): **"Audio device (input):"** `<select id="audio-deviceList">` and **"Video device (input):"** `<select id="video-deviceList">` (both `form-select`, empty), plus **"Change Devices"** `btn btn-primary`.
  3. Footer: **Save** (`btn btn-success`, `type=submit`) + **Close** (`btn btn-secondary`, `data-bs-dismiss`).
  4. Only the User Settings tab is rendered active; the presenter tab is the second `<li>`-less pane (an empty `<!---->` sibling where its tab link would be), so presenter device controls are present in DOM but tab header is stripped in this capture.
- **notes**: The presenter device-selection UI here overlaps conceptually with presenter A/V surfaces; treat as the authority for the A/V settings modal structure. evidence pills: `1 app tags`, `4 modal ids`, `14 audited gaps`.

---

# file11.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file11.html.html
- **kind**: html-dom-dump (single isolated Angular component)
- **size**: 448,864 bytes (~438 KB; body slice 2,559 bytes / 70 lines — smallest DOM in batch)
- **role**: **n/a** (diagnostic utility; effectively admin/dev-facing) — a read-only debug log viewer, no role-specific chrome. How determined: content is one readonly textarea.
- **format/quality**: raw DOM + inline styles
- **surfaces documented**: `app-debug-log-modal` → `#debug-log-modal` (`modal-dialog modal-lg`, inline `overflow-y: initial !important`). `<h3 class="modal-title">Debug Log</h3>`.
- **maps to (our components)**: a debug/log viewer modal (developer diagnostics) — low priority for the member/presenter parity work.
- **key findings** (cited):
  1. Body is a single readonly `<textarea id="debugLogModalTxt" rows="1000" readonly="readonly" class="form-control" style="min-width:100%">` inside `modal-body` (inline `max-height:77vh; overflow-y:scroll`).
  2. Footer: single **Close** `btn btn-secondary` (`data-bs-dismiss`).
  3. Modal is `modal-lg`; textarea is **empty** in the capture (no log content — honest gap, no data to compare).
- **notes**: Thinnest surface in the batch; complete structurally but content-empty. evidence pills: `1 app tags`, `2 modal ids`, `6 audited gaps`.

---

# file12.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file12.html.html
- **kind**: html-dom-dump (single isolated Angular component)
- **size**: 463,072 bytes (~452 KB; body slice 16,767 bytes / 342 lines)
- **role**: **admin / presenter** — a "Post Alert" composer (broadcast to room, tweet, push, legal disclosure); not a member surface. How determined: component + controls below.
- **format/quality**: raw DOM + inline styles
- **surfaces documented**: `app-post-alert-modal` → `#alert-modal`, `<h5 id="post-alert" class="modal-title">Post Alert</h5>`. Three-tab composer `#nav-tab`: **Text Alert** (`#nav-text`, active), **Text Url** (`#nav-url`), **Image / GIF / Video** (`#nav-img`).
- **maps to (our components)**: our alert/post composer (admin broadcast) — text/url/image tabs, upload dropzone, post-options checkboxes.
- **key findings** (cited):
  1. **Text Alert** pane (active): `<textarea rows="10" placeholder="Alert Text...">`.
  2. **Text Url** pane: URL `<input type="url" placeholder="Link / URL to send to users">` (input-group with `fa-link`) + `rows=2` alert-text textarea.
  3. **Image/GIF/Video** pane: url input "Image or Video Link to show", **OR** a file dropzone — `label.upload-area` for `<input id="fuploadAlert" type="file" multiple accept="image/*">`, drag target `#filedragAlert.filedragMD` ("or drop an image here"), `#fileListAlert`, + `rows=2` text.
  4. Footer post-options (checkboxes, id+label): **Keep alert window open?** (`keepOpenChk`), **Post on X? (tweet)** (`postOnXChk`), **Don't send to push notification?** (`alert-push-label`), **Non-trade alert? (Different Sound)** (`alert-non-trade-label`), **Add Legal Disclosure?** (`alert-legal-disclosure-label`).
  5. Submit: **Post Alert** `btn btn-success` (surrounded by `<!---->` Angular conditional slots — some buttons conditionally rendered).
- **notes**: Authority for the admin Post-Alert composer. Several `<!---->` comment placeholders indicate `*ngIf`-gated controls not rendered in this capture (honest gap — the full button/option set may be larger for higher roles). evidence pills: `1 app tags`, `5 modal ids`, `9 audited gaps`.
