# as-splitter.html.html

- **path**: docs/reference/visual-evidence-deep/fragment-pages/as-splitter.html.html
- **kind**: html-dom-dump (raw DOM + full inline Bootswatch/Bootstrap CSS; NOT a computed-styles/rects JSON capture)
- **size**: 1,406,120 bytes (1.4 MB) — `wc -c`
- **role**: mixed / room-splitter view containing PRESENTER surfaces, chat rendered from a MEMBER-style message stream. Determined by: `<app-presenter-cams>` (x2), `<app-webcam-holder>` (x1), `<app-presentationarea>` (x1) present in DOM, while `msg-box-adm` count = 0 (no admin message boxes) and no `<img class="user-badge-img">` in the DOM body (the 4 `user-badge-img` hits are CSS rules only). "presenter" text appears 8x, all inside `<app-presenter-cams>` markup (e.g. `...></app-presenter-cams></div></app-webcam...`).
- **format/quality**: raw DOM + inline styles. Head declares `<title>as-splitter.html</title>` and inlines Bootswatch v4.3.1 (Darkly) + Bootstrap v4.3.1 CSS with FontAwesome linked from local node_modules. No `states`/`groups`/`rects`/computed-style JSON — this is a DOM dump, not a JSON capture.

## surfaces documented
- Presentation/media split ("as-splitter") layout: `<app-presentationarea>`, `<app-presenter-cams>` (x2), `<app-webcam-holder>`, `presentation-box` (x2), `app-presentation` markers (x3), `screenshare` (x1), `webcam` (x12).
- Main tabset (`id="mainTabs"` / `mainTabsContent`): tabs by `aria-controls` = **screens, streams, notes, files** (top-level room panels).
- Room/channel sub-tabs: 6 tabs keyed by Mongo-style ObjectIds (`652765a0e494735aa53574ba`, `665874b2692d34204762bb73`, `68385e5f7568b13c34072e13`, `6879121b8f9c6824f6f03266`, `68ac8cdb207a2a2927a27775`, `6953c35f88f24e0dd42a1218`).
- Files/media sub-tabs: `aria-controls` = **files, image, sounds**; `files-tabs` (x7), `files-badge` (x3).
- Chat stream: `<app-chat>`, `<app-roomscroller>` (x2), `app-st-message` (x51), `msg-box` (x51), `msgMenu` (x53), `users-dropdown-options` (x54), `created-at` (x53), `alert-qa` (x51), `flex-row-reverse` (x1, own-message alignment).
- Alerts panel: `<app-alerts>`, `app-alerts` (x4), `alertHeader` (x1), `chatHeader` (x1).
- Notes: `<app-note>` (x6), `noteTabset` (x12), `noteDownload` (x8).
- Search: `st-searchbar` (x7). Trade coloring: `tradeColor` (x15). Splitter mechanics: `gutter` (x97), `as-split` (x24).

## maps to (our components)
- Splitter/stage layout → our stage + resizable-panel/gutter container (evidence: `as-split` x24, `gutter` x97 — Split.js-style gutters).
- `<app-presentationarea>` + `<app-presenter-cams>` + `<app-webcam-holder>` → our Presentation/Stage + presenter camera tiles + local webcam holder.
- `mainTabs` (screens/streams/notes/files) → our main room tabset.
- `<app-chat>` / `<app-roomscroller>` / `app-st-message` → chat pane + message list + message row.
- `<app-alerts>` / `alertHeader` → alerts/Q&A sidebar.
- `<app-note>` / `noteTabset` / `noteDownload` → notes tab.
- files/image/sounds tabs → files/media tab.

## key findings (cited)
1. Theme is Darkly (Bootswatch v4.3.1 / Bootstrap v4.3.1) — `:root` sets `--green:#00bc8c`, `--primary:#375a7f`, `--success:#00bc8c`, `--info:#3498DB`; active nav tab uses `background-color:#222` (`.nav-tabs .nav-link.active{...background-color:#222...}`). This matches the Darkly modal-tab palette noted in memory. (from inline `<style>` head slice)
2. This is the full room "splitter" surface, not a member-only chat fragment: it carries the presenter media stack (`<app-presentationarea>`, `<app-presenter-cams>` x2, `<app-webcam-holder>`) AND the chat stream (`app-st-message` x51) in the same DOM. (grep counts of `<app-*>` custom elements)
3. No admin message chrome and no rendered badges: `msg-box-adm` = 0; no `<img class="user-badge-img">` in DOM (the 4 hits are CSS selectors only). Confirms the corpus-wide rule that badges are `<img class="user-badge-img">`, not TEXT — and here none are present in body. (grep, verified against CSS-only matches)
4. 51 chat messages captured (`app-st-message` x51 / `msg-box` x51), each with per-message menu (`msgMenu` x53), user dropdown options (`users-dropdown-options` x54), timestamp (`created-at` x53) and Q&A affordance (`alert-qa` x51). One `flex-row-reverse` = a single own/right-aligned message. (grep counts)
5. Six room/channel sub-tabs identified by ObjectId in `aria-controls` (652765a0e494735aa53574ba … 6953c35f88f24e0dd42a1218), plus media sub-tabs image/sounds — real IDs usable to correlate with other fragment dumps. (grep of `aria-controls`)

## notes
- **Authority: this raw DOM dump is primary** for the splitter/presentation layout; prefer it over any `.md` prose. It is the most complete single fragment for the presentation+chat combined stage seen so far (both `<app-presentationarea>` and 51 `app-st-message` in one file).
- Not a JSON capture, so it has NO computed styles or rects — pixel/spacing verification still needs a paired JSON capture; treat exact geometry here as an honest gap (inline CSS gives declared rules, not resolved layout).
- No duplicate/corruption detected: valid `<!doctype html>`, coherent head + DOM.
