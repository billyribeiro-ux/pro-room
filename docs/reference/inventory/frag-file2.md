# file2.html.html

- **path**: docs/reference/visual-evidence-deep/fragment-pages/file2.html.html
- **kind**: html-dom-dump
- **size**: 6,356,246 bytes (6.06 MiB / ~6.3 MB)
- **role**: mixed — member-operative full room client. Determined from the DOM: a live, visible chat composer (`placeholder="Type your message here.."`, line 12473) and 51 rendered chat messages (`<app-st-message>` ×51) are the member-facing operative surfaces; admin/presenter *authoring* surfaces (Post Alert, Poll, YouTube, session control) exist only as Angular modal templates (see notes), so the captured account cannot be proven to be admin from this dump. Roster is empty (`<!----><!---->` inside `.room-roster-list`, line 344), so no per-user role badge is available to confirm the viewer's tier.
- **format/quality**: raw DOM + inline styles (pretty-printed Angular render; `_ngcontent-*`/`_nghost-*` attributes, custom `<app-*>` elements). NO computed styles, NO rects. First 446,287 bytes are an inlined Bootswatch/Bootstrap 4.3.1 `<style>` block; actual DOM begins at the second `<body` (byte 446304, style closes at byte 446287). Head links FontAwesome `all.min.css` and imports Google Lato font.

- **surfaces documented** (all confirmed as `<app-*>` custom elements present in DOM, `grep -oE '<app-[a-z-]+' | sort | uniq -c`):
  - Core: `app-root`, `app-room`, `app-chat`, `app-privchat`, `app-note` (×6), `app-room-roster`, `app-roomscroller` (×2), `app-st-message` (×51), `app-alerts`, `app-alerts-advanced-search`, `app-rich-text-editor`
  - Presentation/AV: `app-presentationarea`, `app-presenter-cams` (×2), `app-webcam-holder`, `app-screenshare-preview`, `app-rec-preview`, `app-webrtc-troubleshooter`, `app-av-settings-modal`
  - Modals (authoring/admin/member): `app-post-alert-modal`, `app-poll-modal`, `app-alert-qa-modal`, `app-alert-filter-modal`, `app-alert-logs-modal`, `app-alert-send-report-modal`, `app-scheduled-alerts-modal`, `app-session-control-modal`, `app-chat-logs-modal`, `app-muted-users-modal`, `app-followed-users-modal` (×2), `app-all-user-pmmodal`, `app-user-info-modal`, `app-user-settings-modal`, `app-reply-modal`, `app-play-youtube-modal`, `app-post-alert-modal`, `app-mobile-app-info-modal`, `app-debug-log-modal`

- **maps to (our components)**:
  - Chat feed + message rows → our chat message list / `StMessage` equivalent (51 `.msg-box pb-1` rows; each message carries an `.alert-qa` button and a `.created-at mr-2` timestamp)
  - Presentation tabset (Screens/Streams) → our stage/presentation area component (see key findings)
  - Room roster panel → our roster/`room-roster` sidebar (present but empty here)
  - Alerts panel + Post-Alert/Poll modals → our alerts feed + alert-authoring modals
  - Notes (`app-note` ×6) and Files tabs → our notes/files panels
  - Reply modal (`app-reply-modal`) → our reply/quote modal

- **key findings** (cited; counts are true occurrence counts via `grep -oE ... | wc -l` on the DOM slice, not line-match counts):
  1. **Presentation tabset is `.nav.nav-tabs.mainTabset`** (line 12609) with a **"Screens" tab active** (`id="screens-tab"`, `class="nav-link active"`, icon `fas fa-desktop`, label `>Screens<`) and a **"Streams" tab that is `hidden=""`** (`id="streams-tab"`, line ~12645). So the default/visible stage view is Screens.
  2. **Chat = 51 messages**: `<app-st-message>` ×51, each wrapping `class="msg-box pb-1 ng-star-inserted"` (×51) and an `.alert-qa` action button (`class="btn btn-sm btn-secondary me-1 alert-qa ng-star-inserted"` ×51). **52 `.created-at mr-2` timestamps** (one more than messages — extra timestamp likely on an alert). Only **1** own-message row uses `flex-row-reverse` (`d-flex flex-row-reverse justify-content-center...`, line-unique) — i.e. one right-aligned/self message in this snapshot.
  3. **13 `.tradeColor` spans** in messages (`class="tradeColor"` ×13) — inline colored trade tickers/symbols embedded in chat text; a side-by-side must reproduce this trade-coloring.
  4. **Roster is empty** in this capture: `<app-room-roster>` → `<div class="room-roster-list"><!----><!----></div>` (lines 338–346). Hence `presUser`, `regUser`, `rosterImg` = 0 occurrences — an honest gap, NOT evidence of a rosterless design.
  5. **NO `user-badge-img` in the DOM** (0 occurrences in the body slice; the earlier "4" was a line-match artifact incl. CSS). Only **1 `badge-success`** in DOM. Confirms the prose-analysis warning: this capture does not evidence text badges; badge imagery is absent/empty here.
  6. **`msg-box-adm` = 0** — no admin-styled message variant rendered in this snapshot (consistent with member-operative view).
  7. Composer/authoring placeholders present: `"Type your message here.."` (chat, 12473, visible), plus modal-only authoring fields `"Alert Text..."` (×3, post-alert-modal ~18276+), `"Paste YouTube URL"` (16492), `"Search files..."` (16270), `"Main poll question..."` (18649) — the alert/poll/youtube inputs live inside their modal templates, not the main toolbar.

- **notes**:
  - **BEST-AUTHORITY flag**: this is a *complete single-page room client* raw DOM dump (full `app-root` with every `<app-*>` panel and modal template), making it a strong structural authority for component inventory and class names — but it has **no computed styles or rects**, so it is NOT authority for pixel color/spacing/geometry (pair with a JSON capture for those).
  - **Superset**: contains nearly every room surface (chat, alerts, notes, files, presentation, AV, ~19 modals) — likely a superset of narrower fragment dumps.
  - **Caveat on role**: Angular instantiates all modal/component templates regardless of the viewer's permission tier, so the presence of `app-post-alert-modal`, `app-session-control-modal`, `app-presenter-cams`, etc. does NOT prove an admin/presenter capture. Treat those as available templates, not proof of granted role. Roster being empty removes the one direct role-badge signal.
  - **Marker-count caveat**: initial whole-file `grep -oc` counts conflated CSS-block matches and line-match semantics; all numbers above were re-derived from the DOM-only slice (bytes ≥446304) with `grep -oE '<marker>' | wc -l` for occurrence truth.
