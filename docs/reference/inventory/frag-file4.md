# file4.html.html

- **path**: docs/reference/visual-evidence-deep/fragment-pages/file4.html.html
- **kind**: html-dom-dump
- **size**: 5,519,896 bytes (~5.26 MB)
- **role**: admin / presenter (SUPERSET) — determined by the presence of presenter/admin-only Angular component tags in the DOM: `<app-post-alert-modal>`, `<app-scheduled-alerts-modal>`, `<app-session-control-modal>`, `<app-poll-modal>`, `<app-chat-logs-modal>`, `<app-debug-log-modal>`, `<app-muted-users-modal>`, `<app-presenter-cams>` (x2), `<app-webcam-holder>`, `<app-screenshare-preview>`, `<app-rec-preview>`, `<app-presentationarea>`, `<app-followed-users-modal>`, `<app-all-user-pmmodal>` (grep `<app-` tag inventory below). A member (chat-only) capture would not contain post-alert / session-control / poll / presenter-cam surfaces.
- **format/quality**: raw DOM + inline styles — full-page HTML dump. `<head>` embeds the complete Bootswatch v4.3.1 **Darkly** theme CSS inline (`@import "...Lato..."`, `Bootswatch v4.3.1`); FontAwesome linked via local `file://` node_modules `all.min.css`. DOM carries Angular runtime attributes (`ng-star-inserted` on every `msg-box`). NOT computed-styles/rects; NO states/groups JSON. Rendered-DOM authority (raw dump), but note grep counts mix CSS-rule hits with real element hits — element-class counts are disambiguated below via `class="..."` matching.
- **surfaces documented**: main room chat/alerts stream, per-message action menu, alerts+QA feed, room roster, notes panel, files panel, presentation/screenshare area, presenter cams / webcam holder, and a large set of modals (user settings, AV settings, user info, session control, post-alert, scheduled-alerts, poll, play-youtube, chat-logs, debug-log, muted-users, followed-users, all-user PM, reply, rec-preview, webrtc-troubleshooter, mobile-app-info, advanced alert search).

- **maps to (our components)**:
  - `app-st-message` / `msg-box` / `msgMenu` → our chat message row + per-message menu (MessageItem / MessageMenu).
  - `app-alerts` / `alert-qa` / `alertHeader` → Alerts + Q&A feed and its header nav.
  - `app-room-roster` / `room-roster-list` → roster/presence sidebar (RoomRoster).
  - `app-note` (x6) / `noteTabset` / `noteDownload` → Notes tab.
  - `files-tabs` / `files-badge` → Files tab.
  - `app-presentationarea` / `presentation-box as-split-area` / `app-screenshare-preview` → presentation/screenshare stage (StageArea).
  - `app-presenter-cams` / `app-webcam-holder` / `volumeControl` → presenter camera strip / webcam holder.
  - `app-reply-modal` / `replyModal` → reply modal; `app-user-settings-modal`/`app-av-settings-modal` → settings modals; `st-searchbar` → alert search bar.
  - angular-split (`as-split` x9 / `as-split-area` x12) → our resizable split-pane layout.

- **key findings** (cited):
  1. **Darkly palette is authoritative here**: `--primary: #375a7f` (1 hit) and `--success: #00bc8c` (1 hit) declared in the inline CSS `:root`; `#00bc8c` appears 54x and `#375a7f` 53x total. Nav-tabs active state = `color:#fff;background-color:#222;border-color:#444` (from `.nav-tabs .nav-link.active` rule). Confirms the memory note that modal/tab chrome is Darkly #222 / #00bc8c.
  2. **Message stream size**: 51 `app-st-message` component tags and 51 `class="...msg-box..."` (`msg-box pb-1 ng-star-inserted`), each with a `msgMenu` (51 `msgMenu`) and `msg-left` (52). So ~51 chat messages rendered.
  3. **Alerts/QA feed**: 51 elements carrying `class="...alert-qa..."` and 52 `class="...created-at..."` timestamps; `tradeColor` used as a class 13x (trade-direction color coding on alerts). One `alertHeader` navbar: `class="... navbar-light chat-nav p-1 alertHeader"`.
  4. **Badges are IMAGES, not text**: `user-badge-img` appears only inside CSS rules (`.user-badge-img{width:auto;height:100%;max-height:20px}`, hover `transform:scale(1.2)`, and small-column `display:none`) — confirming badges render as `<img class="user-badge-img">` (max-height 20px), consistent with the AUTHORITY note that "New/Trial" TEXT badges are an error. `msg-box-adm` = 0 (no admin-styled message variant present in this dump).
  5. **Layout is angular-split**: `presentation-box as-split-area`, with 12 `as-split-area` panes across 9 `as-split` containers — the room is a nested resizable split layout, not a static grid.

- **notes**: Superset/best-authority candidate for the **admin/presenter** view of the main room — it contains the widest set of `app-*` modal/presenter components of the fragment dumps probed so far. It is a raw DOM dump (inline styles), so it is authoritative for structure/class-names/theme CSS but does NOT provide computed rects or per-element resolved styles (would need a JSON capture for pixel geometry). Grep marker caveat: many probe strings (e.g. `presentation-box`, `user-badge-img`, `nav-link`) also occur inside the embedded stylesheet, so raw `grep -c` overcounts DOM presence — element counts above were re-verified with `class="..."`-anchored matches. No corruption/empty/duplicate detected; file parses as a single well-formed `<!doctype html>` page titled `file4.html`.
