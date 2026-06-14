# Simpler Trading room — reference spec & build delta

Reverse-engineered from the real app (Angular 17.3.12) supplied in `files/`.
Source captures → specs:

| Spec doc | Source | Covers |
|---|---|---|
| `file-1-part-A..D.md` | `file-1.html` | **Design system** — theme tokens, fonts, every component's CSS |
| `file2-alerts.md` / `file2-mainstage.md` / `file2-modals.md` | `file2.html` | Room DOM (alerts, main stage, modals) |
| `file6-room-area.md` | `file6.html` | Chat message bubble, composer, notes/files content |
| `components-settings.md` | `file9/10/5` | User-settings, AV-settings, nav volume dropdown |
| `components-alert-poll.md` | `file12/13/15` | Post-alert composer, poll panel, alert logs |
| `components-misc-modals.md` | `file7/8/11/14/16/17` | User-info, youtube, debug-log, session, mobile-app, chat-logs |
| `components-user-pm.md` | `file18/19/20/21/27/32` | Reply, alert-QA, all-user-PM, privchat, muted, followed |
| `components-alert-modals2.md` | `file25/26/28/29` | Advanced-search (full), scheduled, send-report, alert-filter |
| `components-media-misc.md` | `file22/23/30/31/33/34` | Screenshare/rec preview, webrtc troubleshooter, rich-text editor |
| `odds-room-shell.md` | `odds-and-ends.html` | **Top-level room layout** (2-level resizable split), top nav, roster |
| `odds-notes-files.md` | `odds-and-ends.html` | Notes (loaded) + Files (empty) + capture caveats |
| `odds-modals-loaded.md` | `odds-and-ends.html` | send-report / all-user-pm / session-control shells (bodies async) |

`file3.html`, `file4.html` were redundant duplicates of `file2`; `file24`=`file21`;
the 59k-line log dumps in `file14`/`file2`'s chat-logs modal are data, not structure.
**Runtime fragments (not components):** `file33` = ngx-toastr toast container
(`#toast-container.toast-top-right`); `file34` = `<audio id=webcam>` remote-audio sink.

## Theme tokens (navy-blue dark theme — the one that wins)
- Navbar `#0c2434` · dropdowns/badges `#0e3651` · presenter `#0f2e43` · sidebar/modals `#103d5c` · dark chat msg `#143c57`
- Accent bright blue **`#45a2ff`** · link `#0a6db1` · success `#92d528` · danger `#bb352a`
- Font: **Lato / Open Sans**. Top bar **49px**. z-index ladder: sidebar 3 → gutters 5 → privChat 500 → pollModal 501.

## Component inventory — real → pro-room status
Legend: ✅ matches · 🔶 diverges (adjust) · 🆕 missing (build)

| Real component | pro-room | Status | Note |
|---|---|---|---|
| `app-alerts` | `AlertFeed` | 🔶 | Real panel is **read-only** (no inline composer); posting is via `PostAlertModal`. Header search+gear ▾ + ⠇ menu (User Info/Mention/Copy) ✅ |
| `app-chat` + `app-st-message` | `ChatPanel` | 🔶 | Same bubble as alerts (only `alert-qa` differs). Composer = auto-grow `<textarea>` + inline emoji/image/GIF ✅ (our inline tools were RIGHT). Ours uses `<input>` → switch to textarea |
| `app-presentationarea` | `MainStage` | 🔶 | Tabs: Screens / **Streams (hidden)** / Notes / Files |
| screens empty state | `ScreenStage` | ✅ | "No one is presenting…" |
| notes | `NotesPanel` | 🔶 | Named-tab row; **Welcome tab home badge**; content = raw HTML body; per-note Download |
| files | `FilesPanel` | 🔶 | **Files/Images/Sounds** sub-tabs w/ red count pills; search; Refresh; hidden `<audio id=mp3player>` |
| `app-webcam-holder` | `WebcamHolder` | ✅ | Draggable PiP 320×240 |
| `app-poll-modal` | `PollModal`/`PollPanel` | 🔶 | Draggable windowed panel; **2 tabs (Create / Pre-Canned)** + Save-To-Canned. Ours is create-only centered modal |
| `app-post-alert-modal` | `PostAlertModal` | 🔶 | 3 tabs (Text / Text+Url / Image-GIF-Video) + **real file upload/drag-drop** + 5 footer checkboxes. No symbol/side field |
| `app-user-info-modal` | `UserInfoModal` | ✅ | @Mention/Private Chat/Follow/Mute footer |
| `app-av-settings-modal` | `AVSettingsModal` | 🔶 | speaker + inline Test; presenter mic/cam; Save+Close. Keep our live `enumerateDevices()` |
| `app-alert-logs-modal` | `AlertLogsModal` | 🔶 | inert in ours (no backend) |
| `app-chat-logs-modal` | `ChatLogsModal` | 🔶 | inert in ours |
| `app-alerts-advanced-search` | `AdvancedSearchModal` | ✅ | trader/room multiselect, datetime-local, 2 checkboxes |
| `app-alert-filter-modal` | `AlertFilterModal` | ✅ | allow/blocklist toggle + people list |
| `app-mobile-app-info-modal` | `MobileAppInfoModal` | 🔶 | Real: store badges + real app URLs (`com.bellesoft.stprotradingroom`, `id1278652736`). Ours: wrong title + generic links |
| nav volume dropdown (`file5`) | `Nav`/`RoomTopNav` | 🆕 | Range slider + Mute + room sound toggles |
| `app-user-settings-modal` | — | 🆕 | Appearance (chat color/size) + App/Alert/Chat tabs + sound toggles |
| `app-play-youtube-modal` | — | 🆕 | URL input + Save / Play-For-All (admin broadcast) |
| `app-debug-log-modal` | — | 🆕 | read-only log textarea |
| `app-session-control-modal` | — | 🆕 | admin session tool |
| `app-alert-send-report-modal` | — | 🆕 | per-alert delivery report (loading + 4 sections, centered Close) |
| `app-reply-modal` | `ReplyModal` | 🔶 | exists but ORPHANED — wire to a "reply privately" action feeding PrivateChat; ours adds a Send btn (theirs is Enter-to-send) |
| `app-scheduled-alerts-modal` | `ScheduledAlertsModal` | 🔶 | `modal-xl`, title **"Manage Scheduled Alerts"**, table Date/Time·Sender·Alert·Repeat·Actions (ours: wrong title/width) |
| `app-privchat` | — | 🆕 | docked private-chat **panel** (not modal): navbar + msg list + composer |
| `app-all-user-pmmodal` | — | 🆕 | "All private messages" thread list |
| `app-rec-preview` | — | 🆕 | recording preview card ("DELAYED UPTO 20s"), expand/close |
| `app-rich-text-editor` | — | 🆕 | Summernote-style editor modal (toolbar + editable area), pairs with Notes |
| `app-webrtc-troubleshooter` | `ConnectivityCheckModal` | 🔶 | 540px modal; 4 status rows UDP/TCP/STUN/TURN; Start Test / Copy Results / Close. **No mic UI** despite name |

### Adjustments to earlier rows
- `AdvancedSearchModal` is 🔶 not ✅: real uses **Bootstrap multi-select dropdowns** (`data-bs-auto-close=outside`), not native `<select multiple>`; has a **Rooms refresh** button in the title.
- `AlertQaModal`: ST version is **ask-only**; ours is richer (answer/resolve) — keep ours.

## Biggest structural correction
The real **alert-posting flow is modal-based and free-form** (text / url / image+upload),
**not** the inline Symbol/Side/Note form pro-room's `AlertFeed` currently ships.
→ Make `AlertFeed` read-only; wire `PostAlertModal` as the composer (admin-gated).

## Suggested build order
1. Alert flow: `AlertFeed` read-only + wire `PostAlertModal` (3 tabs + upload + checkboxes).
2. Theme pass: apply the navy tokens + Lato/Open Sans across the room shell.
3. `ChatPanel`: `<input>` → auto-grow `<textarea>`.
4. `FilesPanel`: Files/Images/Sounds count pills + Sounds audio player.
5. `NotesPanel`: Welcome home badge + raw-HTML note body.
6. `PollModal`: Pre-Canned tab + Save-To-Canned (or defer).
7. New components as needed: SettingsModal, nav volume dropdown, YouTube/Debug/Session/SendReport modals.
