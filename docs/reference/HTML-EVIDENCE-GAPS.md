# Reference HTML — hard-evidence gap audit

**Source:** every reference `.html` snapshot in `pro-room/files/` + `important-doc.html` (**52 files**), audited one Opus-4.8-agent-per-file vs our `web/src` components, then generated deterministically from all 52 findings — **no truncation, every gap included**. Third-party visual reference (legacy Angular 17 + Bootstrap "Darkly"): match structure/classes/icons, never copy content. Framework-port deltas are expected, not defects.

**Totals:** 52 files · **418 non-ok gaps** (42 missing, 376 mismatch) · 113 high-priority. Raw evidence JSON: `docs/reference/_gap-findings-raw.json`.


## File → surface map

| File | Captures | Non-ok gaps |
|---|---|---|
| `afterwebcamholder.html` | afterwebcamholder.html - Presenter webcam tiles strip + Screens/Notes tab n | 8 |
| `appusersettingsmodal.html` | appusersettingsmodal.html - User Settings Modal (General Settings) | 3 |
| `as-splitter.html` | Angular snapshot: alerts/chat splitter with presentation pane. Top-level as | 7 |
| `avsettingsmodal.html` | Audio/Video Settings Modal (Angular reference snapshot) | 12 |
| `avsettingsmodal1.html` | Audio/Video Settings Modal (AVSettingsModal.svelte) | 11 |
| `connected.html` | Connected status toast overlay — a simple success message displayed when th | 7 |
| `dropdownstart.html` | dropdownstart — Volume/Sound settings dropdown panel in trading room navbar | 14 |
| `dropdownvolume.html` | Volume control dropdown panel from reference Angular app | 5 |
| `file-1.html` | Mastering The Trade (Angular) - HTML HEAD only snapshot with all embedded s | 1 |
| `file10.html` | Audio/Video Settings Modal (AVSettingsModal.svelte) | 11 |
| `file11.html` | Debug Log Modal (Angular Bootstrap version) | 6 |
| `file12.html` | Post Alert Modal — reference snapshot from protradingroom.com | 6 |
| `file13.html` | Poll Modal (Create/Canned Polls) | 9 |
| `file14.html` | ChatLogsModal - Angular snapshot showing populated list with Bootstrap styl | 10 |
| `file15.html` | AlertLogsModal - Alerts Logs modal dialog showing audit log entries with re | 8 |
| `file16.html` | Angular Session Control Modal (Bootstrap 5) — empty modal with header, body | 5 |
| `file17.html` | MobileAppInfoModal - mobile app download promotion modal | 7 |
| `file18.html` | Reply Modal - private message reply dialog with text input and emoji/image  | 11 |
| `file19.html` | AlertQaModal snapshot - old Angular Bootstrap modal for Q&A on alerts | 9 |
| `file2.html` | Full trading room page (Angular 17.3.12) — "Mastering The Trade" member ses | 5 |
| `file20.html` | Muted Chat Users Modal | 5 |
| `file21.html` | FollowedUsersModal - a simple modal displaying "Followed Chat Users" with e | 6 |
| `file22.html` | app-screenshare-preview: local screen share preview window (Angular, dragga | 7 |
| `file23.html` | RecPreview component — Recording Preview modal | 6 |
| `file24.html` | FollowedUsersModal | 5 |
| `file25.html` | ScheduledAlertsModal — Manage Scheduled Alerts modal | 6 |
| `file26.html` | AlertSendReportModal - loading state view (Bootstrap/Angular) | 7 |
| `file27.html` | AllUserPmModal (Angular + Bootstrap version from protradingroom.com snapsho | 8 |
| `file28.html` | Alerts Advanced Search Modal (app-alerts-advanced-search) - old Angular Boo | 18 |
| `file29.html` | AlertFilterModal (alert filter dialog) | 8 |
| `file3.html` | file3.html — Angular 17.3.12 full-page trading room snapshot (legacy refere | 21 |
| `file30.html` | WebRTC Troubleshooter Modal (Angular snapshot) | 9 |
| `file31.html` | RichTextEditor Modal - Angular Bootstrap snapshot | 9 |
| `file32.html` | Private chat component — empty state (Angular Bootstrap snapshot) | 8 |
| `file33.html` | Toast notification overlay container — minimal structural snapshot showing  | 1 |
| `file34.html` | Orphaned audio element — id="webcam", Angular snapshot | 2 |
| `file4.html` | Full trading room snapshot: &lt;app-room&gt; shell (80.6K lines) with sideb | 10 |
| `file5.html` | RoomTopNav navbar component — main trading room navigation bar with sidebar | 16 |
| `file6.html` | Full-room trading session snapshot (Mastering the Trade, June 2026): horizo | 13 |
| `file7.html` | User Info Modal (Angular/Bootstrap snapshot) - displays user profile with s | 11 |
| `file8.html` | PlayYouTubeModal - modal for broadcasting YouTube videos to room | 9 |
| `file9.html` | app-user-settings-modal (General Settings) | 4 |
| `important-doc.html` | Full trading room page snapshot (Angular 17.3.12 / Bootstrap) - "Mastering  | 11 |
| `mixednavs.html` | Hidden Streams tab (Bootstrap nav-item) from Angular trading room room tabs | 2 |
| `navbar.html` | navbar.html - Angular navbar snapshot from protradingroom.com trading room | 2 |
| `navbars-room.html` | Right-side navbar controls from Angular trading room (Mastering The Trade s | 6 |
| `navfile.html` | Bootstrap navbar-toggler button for collapsible room navigation (Angular sn | 3 |
| `odds-and-ends.html` | Angular trading room UI snapshots (legacy) — contains isolated modals and c | 18 |
| `pagesource.html` | Base HTML shell - Angular application (legacy/archived version of PTRChat t | 11 |
| `reload.html` | Reload Navigation Item (Angular snapshot) | 4 |
| `subnavbar.html` | Reference subnavbar HTML snapshot from protradingroom.com — tab navigation  | 10 |
| `webcamholder.html` | app-webcam-holder wrapper with app-presenter-cams children (Angular) | 7 |

## MISSING user-visible surfaces (build these)

| Surface | Our component | Evidence (file:line) |
|---|---|---|
| Utility JavaScript Functions | /Users/billyribeiro/Desktop/pr | pagesource.html:80-179: Contains three utility function _(pagesource.html)_ |
| Navbar toggler (mobile collapse) | /Users/billyribeiro/Desktop/pr | navbar.html:31-42: <button class="navbar-toggler btnNav _(navbar.html)_ |
| Question item structure | /Users/billyribeiro/Desktop/pr | file19.html has empty modal-body; no question items pre _(file19.html)_ |
| Icon handling (close, buttons) | /Users/billyribeiro/Desktop/pr | file19.html:144-160 — uses plain `<i class="far fa-smil _(file19.html)_ |
| Note welcome-mat badge: Green home icon badge on f | /Users/billyribeiro/Desktop/pr | file6.html:10056-10060 `<span class="badge badge-succes _(file6.html)_ |
| Note tab unsaved indicator: pen icon (fas fa-pen)  | /Users/billyribeiro/Desktop/pr | file6.html:10061-10066 `<i class="fas fa-pen mx-1" styl _(file6.html)_ |
| Form Field Hint Text |  | AVSettingsModal.svelte:153-155 shows hint paragraph abo _(file10.html)_ |
| Mobile/responsive toggle button | /Users/billyribeiro/Desktop/pr | file5.html:31-42: `<button class="navbar-toggler btnNav _(file5.html)_ |
| Empty state display | /Users/billyribeiro/Desktop/pr | file15.html:35-80 shows populated .list-group with two  _(file15.html)_ |
| Device permission hint text | /Users/billyribeiro/Desktop/pr | AVSettingsModal.svelte:153-155 `{#if !labelsAvailable}  _(avsettingsmodal.html)_ |
| Hint text (permission grant message) | /Users/billyribeiro/Desktop/pr | avsettingsmodal1.html — No hint visible in snapshot _(avsettingsmodal1.html)_ |
| Send button | /Users/billyribeiro/Desktop/pr | file18.html:85-94 — footer contains only Close button,  _(file18.html)_ |
| Chat Logs Modal | ChatLogsModal.svelte | odds-and-ends.html:117663 — closing tag observed, struc _(odds-and-ends.html)_ |
| Publisher identification | /Users/billyribeiro/Desktop/pr | webcamholder.html:12 and 36 use id="webcamsHolder-" and _(webcamholder.html)_ |
| Navbar collapse toggle button | /Users/billyribeiro/Desktop/pr | navfile.html:1-12; <button type='button' class='navbar- _(navfile.html)_ |
| Floating Speech Recognition Overlay (.speech-reco- |  | file-1.html:2980-3090+ — .speech-reco-overlay { positio _(file-1.html)_ |
| Content Introduction | /Users/billyribeiro/Desktop/pr | file8.html - no intro section with icon or description  _(file8.html)_ |
| Footer Close Button | /Users/billyribeiro/Desktop/pr | file8.html:46-58 - modal-footer with Close button (btn  _(file8.html)_ |
| Error Display | /Users/billyribeiro/Desktop/pr | file8.html - no error message display element _(file8.html)_ |
| Hidden audio element | None found in /web/src/lib/com | file34.html:1-6 — <audio id="webcam" autoplay="autoplay _(file34.html)_ |
| Message composer form | /Users/billyribeiro/Desktop/pr | file32.html snapshot shows ONLY empty state, no form/te _(file32.html)_ |
| List Container (empty state wrapper) | /Users/billyribeiro/Desktop/pr | file29.html:26: `<div class="modal-body pt-1">` contain _(file29.html)_ |
| Icons in buttons | /Users/billyribeiro/Desktop/pr | file7.html:43-75 - No icon elements visible, buttons sh _(file7.html)_ |
| Toolbar structure (when editor visible) | /Users/billyribeiro/Desktop/pr | file31.html shows no toolbar structure—only empty `msgT _(file31.html)_ |
| Editor input area (when visible) | /Users/billyribeiro/Desktop/pr | file31.html shows no editor or contenteditable element— _(file31.html)_ |
| Link composer (when link tool active) | /Users/billyribeiro/Desktop/pr | file31.html shows no link input UI _(file31.html)_ |
| Toast notification overlay container | Not found in /Users/billyribei | file33.html:1-2 — `<div class="overlay-container" aria- _(file33.html)_ |
| Composer form (new alert input) | ScheduledAlertsModal.svelte:59 | file25.html — no form or input fields present in refere _(file25.html)_ |
| Scheduled alerts list display | ScheduledAlertsModal.svelte:81 | file25.html — table structure with 5 columns but empty  _(file25.html)_ |
| Loading state UI | /Users/billyribeiro/Desktop/pr | file27.html:27-35, <div class="text-center my-4"><h5><i _(file27.html)_ |
| Thread list structure | /Users/billyribeiro/Desktop/pr | file27.html:36 (<!-- --> placeholders for threads conte _(file27.html)_ |
| Streams tab nav-item (hidden) | /Users/billyribeiro/Desktop/pr | mixednavs.html:1-19 \| <li role="presentation" class="n _(mixednavs.html)_ |
| Streams tab icon and label structure | /Users/billyribeiro/Desktop/pr | mixednavs.html:14-16 \| <i class="fas fa-podcast"></i>< _(mixednavs.html)_ |
| Modal Backdrop/Overlay | /Users/billyribeiro/Desktop/pr | file20.html – no explicit backdrop overlay rendered _(file20.html)_ |
| Empty State Icon | /Users/billyribeiro/Desktop/pr | N/A in reference file21.html — the reference displays o _(file21.html)_ |
| Banner wrapper div | /Users/billyribeiro/Desktop/pr | connected.html:1-7 wraps icon+text directly in root div _(connected.html)_ |
| Modal footer | /Users/billyribeiro/Desktop/pr | file17.html:56-64 — `.modal-footer` with `<button class _(file17.html)_ |
| Root component wrapper |  | file22.html:1-2 `<app-screenshare-preview _ngcontent-ng _(file22.html)_ |
| Draggable/resizable container |  | file22.html:2-6 `.card.webcamsHolderScreen.ui-draggable _(file22.html)_ |
| jQuery UI resize handles |  | file22.html:41-72 eight `<div class="ui-resizable-handl _(file22.html)_ |
| Chat Logs Modal (chat-logs-modal) | /web/src/lib/components/modals | important-doc.html:18616+ - <div id="chat-logs-modal" c _(important-doc.html)_ |
| Presentation Subtitles Checkbox (presentation-subt | No direct match found; may be  | important-doc.html:587-613 - <div id="presentation-subt _(important-doc.html)_ |

## HIGH-priority mismatches

| Surface | Our component | Divergence | Evidence |
|---|---|---|---|
| Overlay label element | /Users/billyribeiro/Deskto | Reference: h5 element for label (class="pNameLabel m-0"), span for close icon wi | afterwebcamholder.html:17-25 — <div class="ov _(afterwebcamholder.html)_ |
| Tab navigation — Screens tab | /Users/billyribeiro/Deskto | Reference: <a> with Bootstrap data-bs-toggle/data-bs-target for tab switching, n | afterwebcamholder.html:52-67 — <a id="screens _(afterwebcamholder.html)_ |
| Main split wrapper | AlertsChatDock.svelte (lin | Reference uses angular-split library (`<as-split>`, `<as-split-area>`, `<as-spli | /Users/billyribeiro/Desktop/pro-room/pro-room _(as-splitter.html)_ |
| Alert QA button | AlertFeed.svelte:280-291.  | Reference uses fa-question-circle icon + check emoji. Ours uses Icon component w | as-splitter.html:227-245. `<button class="btn _(as-splitter.html)_ |
| Chat message composer | ChatPanel.svelte:264-284.  | Reference has a single plus-icon button inside the textarea container; ours has  | as-splitter.html:9650-9690. Composer: `<div i _(as-splitter.html)_ |
| Tab navigation structure (tablist) | /Users/billyribeiro/Deskto | Reference uses `<ul>/<li>/<a>` with Bootstrap nav-tabs classes (`nav`, `nav-tabs | avsettingsmodal.html:23-43 uses `<ul id="user _(avsettingsmodal.html)_ |
| Disable Video checkbox structure | /Users/billyribeiro/Deskto | Reference wraps in `<li>/<a>` nav structure without actual checkbox input; uses  | avsettingsmodal.html:68-88 wraps in `<li clas _(avsettingsmodal.html)_ |
| Presenter panel — Audio device select | /Users/billyribeiro/Deskto | Reference has label text 'Audio device (input):' only (no icon) with form-group  | avsettingsmodal1.html:159-169 — `<div class=" _(avsettingsmodal1.html)_ |
| Presenter panel — Video device select | /Users/billyribeiro/Deskto | Reference has label text 'Video device (input):' only (no icon) with form-group  | avsettingsmodal1.html:171-181 — `<div class=" _(avsettingsmodal1.html)_ |
| Root container element | /Users/billyribeiro/Deskto | Reference has id="connectedMsg" + class="notConnectedOverlay animated fadeIn"; o | connected.html:1-4 `<div _ngcontent-ng-c97733 _(connected.html)_ |
| Conditional rendering / state handling | /Users/billyribeiro/Deskto | Reference snapshot captures only the success toast (no conditional logic). Ours  | connected.html:1-7 shows only the 'Connected' _(connected.html)_ |
| Container wrapper structure | /Users/billyribeiro/Deskto | Reference uses Bootstrap dropdown markup (li.nav-item.dropdown, a.nav-link, data | dropdownstart.html:1-13 — `<li class="nav-ite _(dropdownstart.html)_ |
| Volume toggle button styling | RoomTopNav.svelte:100-112 | Reference: a.nav-link with d-flex, Font Awesome fa-volume-up fa-2x icon + span.m | dropdownstart.html:2-12 — `<a id="dropdownVol _(dropdownstart.html)_ |
| Volume slider control | RoomTopNav.svelte:128-140 | Reference: input with audiovolslider custom directive, mx-auto py-2, volCtrl cla | dropdownstart.html:28-35 — `<input audiovolsl _(dropdownstart.html)_ |
| Status indicators on sound toggles | RoomTopNav.svelte:150-179 | Reference: all checkboxes show fixed 'on' status text. Ours: dynamic span.status | dropdownstart.html:48-157 — All sound option  _(dropdownstart.html)_ |
| Modal container | /Users/billyribeiro/Deskto | Reference uses Bootstrap modal classes (modal, fade, modal-dialog, modal-lg) wit | file11.html:2-10 `<div id="debug-log-modal" c _(file11.html)_ |
| Textarea element | /Users/billyribeiro/Deskto | Reference: id=debugLogModalTxt, rows=1000, class=form-control, min-width:100% in | file11.html:36-44 `<textarea id="debugLogModa _(file11.html)_ |
| Modal footer buttons | /Users/billyribeiro/Deskto | Reference has only one button (Close) with btn-secondary class and data-bs-dismi | file11.html:48-57 `<div class="modal-footer"> _(file11.html)_ |
| Media Upload Area (Image/GIF/Video tab) | /Users/billyribeiro/Deskto | Reference: separate label (click target) and div.filedragMD (drop zone) with sep | file12.html:179-216: <label class="upload-are _(file12.html)_ |
| Modal wrapper structure | /Users/billyribeiro/Deskto | Reference uses Bootstrap `modal fade` classes and `id="chat-logs-modal"`; ours u | file14.html:2-10: `<div id="chat-logs-modal"  _(file14.html)_ |
| Modal header structure | /Users/billyribeiro/Deskto | Reference uses Bootstrap `modal-header`, `h5` tag, and `btn-close btn-close-whit | file14.html:13-21: `<div class="modal-header" _(file14.html)_ |
| Toolbar / Reload button | /Users/billyribeiro/Deskto | Reference: Bootstrap `btn btn-primary my-2` button with plain text; ours: custom | file14.html:25-31: `<button class="btn btn-pr _(file14.html)_ |
| List container | /Users/billyribeiro/Deskto | Reference uses Bootstrap `list-group` div; ours uses semantic `<ul class="list"> | file14.html:32: `<div class="list-group">` _(file14.html)_ |
| List item structure | /Users/billyribeiro/Deskto | Reference: Bootstrap `list-group-item list-group-item-action` div with nested di | file14.html:34-61: `<div class="list-group-it _(file14.html)_ |
| Modal root element and structure | /Users/billyribeiro/Deskto | Reference uses Bootstrap modal classes (modal, fade, modal-dialog, modal-content | file15.html:1-10 — Root is `<app-alert-logs-m _(file15.html)_ |
| Modal wrapper root element | /Users/billyribeiro/Deskto | Reference uses Bootstrap `.modal.fade` + `.modal-dialog.modal-lg` hierarchy. Our | file16.html:1-9 `<app-session-control-modal>` _(file16.html)_ |
| Modal header structure | /Users/billyribeiro/Deskto | Reference uses Bootstrap `.modal-header` + h5 title + `.btn-close.btn-close-whit | file16.html:17-31 `.modal-header` with h5 id= _(file16.html)_ |
| Modal footer and Done button | /Users/billyribeiro/Deskto | Reference uses Bootstrap `.btn.btn-success.btn-block` green button in `.modal-fo | file16.html:36-44 `.modal-footer` with button _(file16.html)_ |
| CSS framework and styling | /Users/billyribeiro/Deskto | Reference uses Bootstrap 5 CSS classes for styling and layout. Our implementatio | file16.html:1-48 Bootstrap 5 classes througho _(file16.html)_ |
| Modal dialog wrapper | /Users/billyribeiro/Deskto | Reference uses Bootstrap (`modal fade` class); ours uses custom Svelte Modal wit | file18.html:2-9 `<div class="modal fade" id=" _(file18.html)_ |
| Modal header / title area | /Users/billyribeiro/Deskto | Reference title structure is h5 with `modal-title` class and nested `do-private- | file18.html:12-24 `<div class="modal-header"> _(file18.html)_ |
| Textarea input field | /Users/billyribeiro/Deskto | Reference: rows="1", name="txt-area", id="textAreaReplyTxt", placeholder="Type y | file18.html:43-51 `<textarea name="txt-area"  _(file18.html)_ |
| Textarea wrapper layout | /Users/billyribeiro/Deskto | Reference wraps textarea and buttons in a horizontal flex layout (`d-flex flex-r | file18.html:35-83 `<div class="flex-fill d-fl _(file18.html)_ |
| Modal footer / action buttons | /Users/billyribeiro/Deskto | Reference has only a Close button (dismisses modal). Ours footer contains: left- | file18.html:85-94 `<div class="modal-footer"> _(file18.html)_ |
| Modal wrapper & dialog structure | /Users/billyribeiro/Deskto | New component uses a custom `<div class="backdrop">` wrapper (line 129-135) with | file19.html:1-11 — `<app-alert-qa-modal><div  _(file19.html)_ |
| Modal header | /Users/billyribeiro/Deskto | New header is minimal: `<header><h2>Q&A — {alert.symbol}</h2><button>` (line 137 | file19.html:14-98 — `<div class="modal-header _(file19.html)_ |
| Textarea & composer footer | /Users/billyribeiro/Deskto | New component has simpler `<form class="composer"><textarea placeholder="Ask a q | file19.html:99-165 — `<div class="modal-foote _(file19.html)_ |
| Modal Container & Dialog Element | /Users/billyribeiro/Deskto | Reference uses Bootstrap 5 modal markup (.modal, .fade, .modal-dialog, .modal-co | file21.html:1-9 — <app-followed-users-modal>  _(file21.html)_ |
| Card header with dropdown menu |  | ScreenStage.svelte (lines 34-51) has a `.bar` with a `.toggle` button group (sin | file22.html:8-29 `<h5 class="card-title m-0"> _(file22.html)_ |
| Root component wrapper | /Users/billyribeiro/Deskto | Reference is Angular (<app-rec-preview>) with card/recsHolderScreen classes; our | file23.html:1-2 `<app-rec-preview _ngcontent- _(file23.html)_ |
| Card title header | /Users/billyribeiro/Deskto | Reference uses h5.card-title with Bootstrap classes (d-inline-block, p-2, text-w | file23.html:8-14 `<h5 _ngcontent-ng-c36581496 _(file23.html)_ |
| Action buttons (expand/minimize and clos | /Users/billyribeiro/Deskto | Reference uses <span> wrappers with float-right and fa-times/fa-expand icons in  | file23.html:15-26 `<span _ngcontent-ng-c36581 _(file23.html)_ |
| Overall structure and styling paradigm | /Users/billyribeiro/Deskto | Reference is Angular + Bootstrap + Font Awesome; ours is Svelte with scoped CSS  | file23.html (lines 1-37) — uses Angular direc _(file23.html)_ |
| Modal root element | /Users/billyribeiro/Deskto | Snapshot is Angular with ng-* attributes; our code is Svelte with no framework-s | file26.html:1-3 — `<app-alert-send-report-mod _(file26.html)_ |
| Modal structure (dialog, classes, attrib | /Users/billyribeiro/Deskto | Snapshot uses Bootstrap `.modal.fade` / `.modal-dialog` / `.modal-content` struc | file26.html:4-12 — `<div id="alert-send-repor _(file26.html)_ |
| Modal header / title | /Users/billyribeiro/Deskto | Snapshot: h5 in `.modal-header` div. Our code: h2 id={titleId} in `.head` elemen | file26.html:15-18 — `<div class="modal-header _(file26.html)_ |
| Modal body content | /Users/billyribeiro/Deskto | Snapshot shows loading state only (spinner + 'Loading...'). Our code renders ful | file26.html:27-38 — `.modal-body` with loadin _(file26.html)_ |
| Modal container wrapper | /Users/billyribeiro/Deskto | Reference uses Angular component wrapper (app-all-user-pmmodal) with Bootstrap c | file27.html:1-2, <app-all-user-pmmodal _ngcon _(file27.html)_ |
| Modal header structure | /Users/billyribeiro/Deskto | Reference uses Bootstrap modal-header with h5 title and btn-close btn-close-whit | file27.html:13-24, <div class="modal-header"> _(file27.html)_ |
| Modal Component Root | /Users/billyribeiro/Deskto | Old: Angular component with ng-specific attributes (_ngcontent, _nghost, _ngcont | file28.html:1-3 <app-alerts-advanced-search _ _(file28.html)_ |
| Modal Dialog Structure | /Users/billyribeiro/Deskto | Old: Bootstrap modal classes (modal, fade, modal-dialog, modal-content); uses ar | file28.html:4-12 uses <div id="alerts-advance _(file28.html)_ |
| Modal Header & Close Button | /Users/billyribeiro/Deskto | Old: uses <div class="modal-header"> and <h5> for title, Bootstrap's btn-close-w | file28.html:15-36 contains <div class="modal- _(file28.html)_ |
| Title Header with Rooms Button | /Users/billyribeiro/Deskto | Old: title is 'Alerts Advanced Search' with a separate 'Rooms' refresh button (b | file28.html:16-28 has <h5> wrapping title + i _(file28.html)_ |
| CSS Styling Approach | /Users/billyribeiro/Deskto | Old: Angular encapsulated styles (view encapsulation) with Bootstrap framework f | file28.html uses _ngcontent and _nghost attri _(file28.html)_ |
| Dropdown Interaction Pattern | /Users/billyribeiro/Deskto | Old: Bootstrap dropdown library handles toggle/open/close. New: native HTML <sel | file28.html: lines 51-63 (trader) and 235-247 _(file28.html)_ |
| Empty State Placeholder | /Users/billyribeiro/Deskto | Reference shows plain `<p>List is empty.</p>`; ours renders custom `.empty` div  | file29.html:42: `<p>List is empty.</p>` _(file29.html)_ |
| Modal Footer Button | /Users/billyribeiro/Deskto | Reference button label is 'Close' with Bootstrap btn btn-secondary classes and d | file29.html:49-55: `<button type="button" dat _(file29.html)_ |
| Framework Mismatch: Angular → Svelte | /Users/billyribeiro/Deskto | The reference HTML is from an Angular 17 version of the app. The current impleme | file3.html:1 `<app-root _nghost-ng-c424381052 _(file3.html)_ |
| Main Room Container & Layout | /Users/billyribeiro/Deskto | Reference uses Bootstrap flexbox + Angular Split library (`as-split`, `as-split- | file3.html:3-12 `<app-room class="lightTheme" _(file3.html)_ |
| General Settings Modal (user-settings-mo | /Users/billyribeiro/Deskto | Reference uses Bootstrap tab nav + radio buttons. Svelte likely uses simpler tog | file3.html:16394-17721 modal with `<ul id="us _(file3.html)_ |
| Root App Structure (app-root, router-out | /Users/billyribeiro/Deskto | Reference is Angular app-root + router-outlet. Svelte uses file-based routing (+ | file3.html:1-2 `<app-root _nghost-ng-c4243810 _(file3.html)_ |
| Status Item Labels | /Users/billyribeiro/Deskto | Reference uses verbose labels with 'Enabled' and 'Server Connectivity' suffixes; | file30.html:41-42, 53-54, 65-66, 77-78: Label _(file30.html)_ |
| Status Item Structure | /Users/billyribeiro/Deskto | Reference nests label + status indicator as siblings in a div; our component ren | file30.html:37-48 (example): `<div class="sta _(file30.html)_ |
| Modal root element | /Users/billyribeiro/Deskto | Snapshot uses Angular component `<app-rich-text-editor>` with Bootstrap `.modal` | file31.html:1-2 `<app-rich-text-editor>` wrap _(file31.html)_ |
| Modal structure and dialog semantics | /Users/billyribeiro/Deskto | Snapshot: Bootstrap modal with `.modal-dialog` > `.modal-content` > `.modal-head | file31.html:2-9 has `id='rteModal' tabindex=' _(file31.html)_ |
| Modal body content area | /Users/billyribeiro/Deskto | Snapshot shows generic placeholder `msgTxtContainer`; ours renders RTE-specific  | file31.html:28-29 has `.modal-body` with empt _(file31.html)_ |
| Root element tag | /Users/billyribeiro/Deskto | Reference uses Angular component tag <app-privchat>; ours is <section class="pri | file32.html:1 <app-privchat id="privaChatComp _(file32.html)_ |
| Navbar/Header structure | /Users/billyribeiro/Deskto | Reference uses Bootstrap navbar classes (.navbar, .navbar-expand-lg, .navbar-lig | file32.html:12-49 uses <nav class="navbar nav _(file32.html)_ |
| Body container structure | /Users/billyribeiro/Deskto | Reference shows empty state div (.flex-fill .p-3 .text-center); ours shows full  | file32.html:52 <div class="d-flex h-100 pc-bo _(file32.html)_ |
| Main top navbar (mainAppNav) structure a | /Users/billyribeiro/Deskto | Our RoomTopNav is a fixed 49px bar with icon buttons and a volume dropdown panel | file4.html:331–388 — navbar with flex layout, _(file4.html)_ |
| Sidebar structure and navigation items | /Users/billyribeiro/Deskto | Our sidebar uses semantic button elements instead of Bootstrap nav-link anchors. | file4.html:12–327 — .room-sidebar with .sideb _(file4.html)_ |
| Settings modal (General Settings) — tabs | /Users/billyribeiro/Deskto | The reference uses Bootstrap .nav-tabs (ul > li > a.nav-link.active) and .tab-co | file4.html:15621–16268 — id='user-settings-mo _(file4.html)_ |
| Audio/Video Settings modal — user + pres | /Users/billyribeiro/Deskto | Same as SettingsModal: Bootstrap .nav-tabs vs. our custom .tabs button structure | file4.html:16913–17118 (est.) — id='av-settin _(file4.html)_ |
| Brand logo | /Users/billyribeiro/Deskto | Reference: anchor.navbar-brand with img.brand-logo child (external URL). Ours: s | file5.html:24-30: `<a class="navbar-brand ml- _(file5.html)_ |
| Volume dropdown structure | /Users/billyribeiro/Deskto | Reference: Bootstrap dropdown (li.dropdown > a[data-bs-toggle] > div.dropdown-me | file5.html:60-234: `<li class="nav-item dropd _(file5.html)_ |
| Modal wrapper element | /Users/billyribeiro/Deskto | Snapshot is Angular component tag; codebase is Svelte using `<Modal>` wrapper co | file7.html:1 - `<app-user-info-modal>` with A _(file7.html)_ |
| Modal container structure & classes | /Users/billyribeiro/Deskto | Snapshot uses Bootstrap grid/modal framework classes (.modal, .fade, .modal-dial | file7.html:2-12 - Uses Bootstrap `.modal.fade _(file7.html)_ |
| Avatar display | /Users/billyribeiro/Deskto | Snapshot displays Gravatar image from external URL. Codebase displays first char | file7.html:14-20 - `<div class='edit-user-ava _(file7.html)_ |
| Profile section layout | /Users/billyribeiro/Deskto | Snapshot: avatar and title in header, badge inside title. Codebase: dedicated `. | file7.html:13-27 - Avatar and title in `.moda _(file7.html)_ |
| Sidebar (room-sidebar, navbar structure) | /web/src/lib/components/Ro | HTML uses Bootstrap navbar (nav, ul.navbar-nav, li.nav-item); our RoomSidebar is | important-doc.html:15-343 - <div class="room- _(important-doc.html)_ |
| Top Navigation (mainAppNav - users conne | /web/src/lib/components/Ro | HTML uses Bootstrap navbar classes (navbar navbar-expand-md navbar-dark fixed-to | important-doc.html:347-655 - <nav class="navb _(important-doc.html)_ |
| Volume Control Dropdown (dropdownVolume  | /web/src/lib/components/Ro | HTML has inline dropdown menu in navbar; includes volume slider (<input type="ra | important-doc.html:424-650 - <a id="dropdownV _(important-doc.html)_ |
| Color Theme & Styling | Theme system in /web/src/l | HTML uses Bootstrap CSS classes and lightTheme/darkTheme class names; our Svelte | important-doc.html:8 - class="lightTheme" on  _(important-doc.html)_ |
| Toggle button classes and attributes | /Users/billyribeiro/Deskto | Reference button carries Angular's _ngcontent-ng-c977335924 scope marker and Boo | navfile.html:1-12; _ngcontent-ng-c977335924 ( _(navfile.html)_ |
| User Info Modal | UserInfoModal.svelte | Reference modal-body is empty (awaits content). Our component should populate us | odds-and-ends.html:34892-34993 — id="user-mod _(odds-and-ends.html)_ |
| General Settings Modal (User Settings) | SettingsModal.svelte | Reference shows classic radio button structure with old Bootstrap class names (f | odds-and-ends.html:35075-35425 — id="user-set _(odds-and-ends.html)_ |
| Audio/Video Settings Modal | AVSettingsModal.svelte | Reference has two tabs (user/presenter). Reference shows navbar structure for sp | odds-and-ends.html:36426-36673 — id="av-setti _(odds-and-ends.html)_ |
| Post Alert Modal | PostAlertModal.svelte | Reference shows rich tabbed interface with file upload. Our component's implemen | odds-and-ends.html:36750-37120 — id="alert-mo _(odds-and-ends.html)_ |
| Poll Modal (Create/Canned Polls Panel) | PollModal.svelte | Reference shows floated panel with titlebar controls (minimize/maximize). Our im | odds-and-ends.html:13148-13361 and 37122-3736 _(odds-and-ends.html)_ |
| Message component (app-st-message) | MessageBody.svelte (likely | Reference shows classic Bootstrap message bubble with action menu. Our component | odds-and-ends.html:102-459 — msg-box div with _(odds-and-ends.html)_ |
| Reload Navigation Item Container | /Users/billyribeiro/Deskto | Reference uses Angular `<li>` with nested `<a>` element (nav-item/nav-link patte | reload.html:1-8: `<li _ngcontent-ng-c97733592 _(reload.html)_ |
| Reload Icon | /Users/billyribeiro/Deskto | Reference uses FontAwesome direct `<i>` tag with `fas fa-2x fa-sync` classes. Cu | reload.html:3: `<i _ngcontent-ng-c977335924=" _(reload.html)_ |
| Structural Architecture | /Users/billyribeiro/Deskto | Reference snapshot is from an Angular application (indicated by `_ngcontent-ng-c | reload.html: Full file structure with Angular _(reload.html)_ |
| Tab bar wrapper element | /Users/billyribeiro/Deskto | Reference uses `<ul class="nav nav-tabs mainTabset">` with Bootstrap tab classes | subnavbar.html:1-6 — `<ul id="mainTabs" role= _(subnavbar.html)_ |
| Tab list items wrapper | /Users/billyribeiro/Deskto | Reference wraps each tab in `<li role="presentation">` with `<a>` element and Bo | subnavbar.html:7-26 (Screens tab) — wrapped i _(subnavbar.html)_ |
| Screens tab structure | /Users/billyribeiro/Deskto | Reference uses nested divs with Bootstrap utility classes (d-flex, ml-1) and Fon | subnavbar.html:8-24 — `<a id="screens-tab" da _(subnavbar.html)_ |
| Files tab structure | /Users/billyribeiro/Deskto | Reference uses nested divs with Bootstrap classes (d-flex, align-items-center, m | subnavbar.html:83-106 — `<a data-bs-toggle="t _(subnavbar.html)_ |
| Bootstrap tab CSS classes | /Users/billyribeiro/Deskto | Reference relies on Bootstrap utility and tab classes for styling. Our component | subnavbar.html throughout — Uses 'nav', 'nav- _(subnavbar.html)_ |

## Full detail — every gap, grouped by file


### `afterwebcamholder.html` — afterwebcamholder.html - Presenter webcam tiles strip + Screens/Notes tab navigation from 
- **[HIGH][mismatch] Overlay label element** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: h5 element for label (class="pNameLabel m-0"), span for close icon with i.fas.fa-times inside. Our implementation: span.name for label, button.close with Icon component inside. Element structure and class naming differ significantly.  
  - _evidence:_ afterwebcamholder.html:17-25 — <div class="overlay"><h5 class="pNameLabel m-0"><span class="closeIcon"><i class="fas fa-times"></i></span></h5></div>  
- **[HIGH][mismatch] Tab navigation — Screens tab** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: <a> with Bootstrap data-bs-toggle/data-bs-target for tab switching, nested divs with d-flex utilities, <i class="fas fa-desktop">. Our implementation: <button role="tab" onclick> handler, Icon component with name="desktop" size={12}. Element type (<a> vs <button>), tab switching mechanism (Bootstrap data attributes vs onclick handler), icon delivery differ.  
  - _evidence:_ afterwebcamholder.html:52-67 — <a id="screens-tab" data-bs-toggle="tab" data-bs-target="#screens" role="tab" aria-controls="screens" aria-selected="true" class="nav-link active"><div class="d-flex"><div><i class="fas fa-desktop"></i><span class="ml-1">Screens</span></div></div></a>  
- **[MED][mismatch] Presenter camera tiles container** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Angular <app-presenter-cams> components and Bootstrap-style naming (webcamsHolder, webcamsHolderVideo). Our implementation is a single Svelte component using .card class with <video>, no component wrapper per tile. Reference repeats two identical <app-presenter-cams> blocks (lines 5-26 and 27-49).  
  - _evidence:_ afterwebcamholder.html:5-49 — <app-presenter-cams> Angular component wrapping <div class="card webcamsHolder" id="webcamsHolder-"> with <video class="webcamsHolderVideo" id="webcamVideo-">  
- **[MED][mismatch] Video element attributes** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: class="webcamsHolderVideo", id="webcamVideo-", autoplay as string attribute. Our implementation: no explicit class on video, uses {@attach attachTrack()} directive for srcObject, attributes are autoplay (no value), muted, playsinline. Missing muted and playsinline in reference.  
  - _evidence:_ afterwebcamholder.html:11-16 — <video autoplay="autoplay" class="webcamsHolderVideo" id="webcamVideo-"></video>  
- **[MED][mismatch] Close button icon** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: uses <i class="fas fa-times"> (Font Awesome icon). Our implementation: uses <Icon name="times" size={14} /> Svelte component. Icon delivery mechanism differs (raw fa-times vs Icon component).  
  - _evidence:_ afterwebcamholder.html:19-24 — <span class="closeIcon"><i class="fas fa-times"></i></span>  
- **[MED][mismatch] Tab navigation — Notes tab (first instance)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: wraps <a> in <li role="presentation" class="nav-item">. Our implementation: no <li> wrapper, <button> directly in flex container. Markup structure for tab list differs (reference follows Bootstrap nav-tabs pattern with li, our uses flat button structure).  
  - _evidence:_ afterwebcamholder.html:69-92 — <li role="presentation" class="nav-item"><a id="notes-tab" data-bs-toggle="tab" data-bs-target="#notes" role="tab" aria-controls="notes" aria-selected="false" class="nav-link presAreaTabs-notes" tabindex="-1"><div class="d-flex align-items-center"><div><i class="fas fa-edit" id="noteChangeIndicator"></i><span class="mx-1">Notes</span></div><!----></div></a></li>  
- **[LOW][mismatch] Webcam tiles wrapper** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap utility classes (d-flex, justify-content-center, flex-wrap, align-items-end, w-100) on outer wrapper. Our implementation uses CSS classes .holder with Flexbox properties in <style> block (justify-content: center, align-items: flex-end, width: 100%, gap: 0.5rem, padding: 0.5rem). Structure is correct but utility class approach differs.  
  - _evidence:_ afterwebcamholder.html:1-4 — <div class="webcam-wrapper d-flex justify-content-center flex-wrap align-items-end w-100">  
- **[LOW][mismatch] Tab navigation — Notes tab (second instance / duplicate)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference HTML contains duplicate Notes tab markup (lines 69-92 and 94-117 are identical). Our implementation renders tabs from TABS array (line 71-75) which contains exactly one Notes entry. Reference appears to be a snapshot artifact or error (duplicate with same id="notes-tab").  
  - _evidence:_ afterwebcamholder.html:94-117 — Exact duplicate of lines 69-92: <li role="presentation" class="nav-item"><a id="notes-tab" ... (identical markup appears twice)  

### `appusersettingsmodal.html` — appusersettingsmodal.html - User Settings Modal (General Settings)
- **[?][mismatch] Tab Navigation (ul.nav.nav-tabs)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Structure differs: reference uses <ul role="tablist"><li><a></a></li></ul> Bootstrap pattern; ours uses <div class="tabs"><button role="tab" aria-controls></button></div>. Labels match (App Settings, Alert Settings, Chat Settings) but semantics: reference uses <a href="#panel-id">, ours uses <button onclick>  
  - _evidence:_ appusersettingsmodal.html:24-70 — <ul id="userSettingsTab" role="tablist" class="nav nav-tabs"> with 3 <li class="nav-item"> containing <a> tags with class="nav-link" and aria-selected  
- **[?][mismatch] Icon Implementation** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - HIGH: reference uses raw FontAwesome <i> tags; ours uses Icon component. Icon name mappings needed: palette→palette, fa-columns→columns, fa-wrench→wrench, fa-bell-slash→bell-slash, fa-desktop→desktop, fa-closed-captioning→closed-captioning, fa-file-alt→file, fa-bell→bell, fa-image→image, fa-comment→columns, fa-scroll→file(?), fa-trash→file(?). NOTE: some icon names may not directly map — verify Icon component's available names.  
  - _evidence:_ appusersettingsmodal.html uses <i class="fas fa-*"></i> throughout (e.g., line 92: fas fa-palette, line 142: fa fa-columns, line 262: fas fa-wrench)  
- **[?][mismatch] Text Size Input Control** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - MEDIUM: reference uses type="number" with no visible min/max/step; ours uses type="range" with explicit constraints (10-28px). UX differs: number input is manual entry, range is slider. Reference does not show visual size value display; ours displays {theme.fontSize}px  
  - _evidence:_ appusersettingsmodal.html:350-364 — <input type="number" name="chat-text-size" value="chatStyle.fontSize" id="chat-text-size">  

### `as-splitter.html` — Angular snapshot: alerts/chat splitter with presentation pane. Top-level as-split (horizon
- **[HIGH][mismatch] Main split wrapper** → `AlertsChatDock.svelte (line 104) uses `<`  
  - Reference uses angular-split library (`<as-split>`, `<as-split-area>`, `<as-split-gutter>`) for flexible layout. Ours uses standard HTML/CSS Grid for the alerts/chat vertical split. The outer horizontal split (alerting+chat vs presentation) is not in AlertsChatDock—it's handled at room-shell level.  
  - _evidence:_ /Users/billyribeiro/Desktop/pro-room/pro-room/files/as-splitter.html:1-8. Root is `<as-split id="mainAreaSplit" class="as-horizontal as-percent">` with nested `<as-split-area>` children.  
- **[HIGH][mismatch] Alert QA button** → `AlertFeed.svelte:280-291. Uses `<button `  
  - Reference uses fa-question-circle icon + check emoji. Ours uses Icon component with same icon name. Reference button has Bootstrap classes (btn btn-sm btn-secondary) and margin (me-1); ours is custom. Alert-qa styling in ours (line 550-574) differs: reference bg=sec (greyish), ours bg=#eef4fb (light blue).  
  - _evidence:_ as-splitter.html:227-245. `<button class="btn btn-sm btn-secondary me-1 alert-qa" title="Ask a question">` with optional `<span class="me-1">(N)</span>` count + `<i class="fas fa-question-circle">` + optional check emoji.  
- **[HIGH][mismatch] Chat message composer** → `ChatPanel.svelte:264-284. Form with `.pi`  
  - Reference has a single plus-icon button inside the textarea container; ours has Emoji, Image, GIF buttons + external Send button. Reference layout embeds buttons within textSendDiv; ours uses a pill pattern with separate send. This is a significant UI divergence.  
  - _evidence:_ as-splitter.html:9650-9690. Composer: `<div id="textAreaHolder" class="textSendDiv d-flex">` > textarea `#textAreaTxt` (rows=1, placeholder='Type your message here..') + right-side button col with `fa-plus` icon (plus tooltip 'Show message options'). No visible Send button (may be separate or collapsed).  
- **[MED][mismatch] Alert feed header settings dropdown** → `AlertFeed.svelte:166-201. Settings butto`  
  - Reference snapshot does not show the dropdown open; ours implements the full menu. No divergence in structure—this is a state/visibility difference.  
  - _evidence:_ as-splitter.html:72-83. Settings button shown in navbar. Reference does not show a dropdown menu in this snapshot (it may be inactive/collapsed).  
- **[MED][mismatch] Alert composer form** → `AlertFeed.svelte:315-326. Shows a form w`  
  - Snapshot does not capture the form, so visual comparison not possible. Structure expected to match (symbol, side, note fields).  
  - _evidence:_ as-splitter.html does not show the alert composer form (it's likely below the scroll or in the snapshot of just the alerts list). Reference would have symbol input, side select, and note textarea at the bottom of alerts panel.  
- **[MED][mismatch] Split gutter (alerts/chat divider)** → `AlertsChatDock.svelte:119-128. `.hsplit``  
  - Reference uses angular-split gutter component; ours is a custom div. Icon is a PNG data URI in both. Height/styling should match visually.  
  - _evidence:_ as-splitter.html does not show the horizontal gutter between alerts and chat panels in the visible section. Expected to be an `<as-split-gutter>` with class `as-split-gutter-icon`.  
- **[LOW][mismatch] Alerts/chat panel layout (vertical split fraction)** → `AlertsChatDock.svelte:49-65. Stores `ale`  
  - Reference snapshot shows a fixed split at 45%. Ours uses persistent user-controlled fraction. Functionality differs (user can drag to resize); snapshot shows a moment in time.  
  - _evidence:_ as-splitter.html:20,23-24. Inner vertical split with style `flex: 0 0 calc(45.1704% - 4.96874px)` for alerts and implicit remainder for chat.  

### `avsettingsmodal.html` — Audio/Video Settings Modal (Angular reference snapshot)
- **[HIGH][mismatch] Tab navigation structure (tablist)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses `<ul>/<li>/<a>` with Bootstrap nav-tabs classes (`nav`, `nav-tabs`, `nav-item`, `nav-link`), data-bs-toggle="tab", and href anchors. Ours uses `<div>/<button>` with custom `.tabs` and `.tab` classes, onclick handlers, and `aria-selected`/`aria-controls`. Reference lacks `aria-label` on tablist.  
  - _evidence:_ avsettingsmodal.html:23-43 uses `<ul id="userSettingsTab" role="tablist" class="nav nav-tabs"> ... <li class="nav-item"> ... <a id="user-audio-video-settings-tab" data-bs-toggle="tab" href="#user-audio-video-settings" role="tab"` vs AVSettingsModal.svelte:126-150 uses `<div class="tabs" role="tablist" aria-label="..."> ... <button type="button" role="tab" id="av-tab-user" onclick={() => (tab = 'user')} class="tab"`  
- **[HIGH][mismatch] Disable Video checkbox structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference wraps in `<li>/<a>` nav structure without actual checkbox input; uses title attribute, fa-desktop icon, and pl-2 padding class. Ours uses native `<input type="checkbox">` inside a `<label class="check">`, Icon component, and custom class layout.  
  - _evidence:_ avsettingsmodal.html:68-88 wraps in `<li class="nav-item"> ... <a class="nav-link" title="Disable Video"> ... <i class="fas fa-desktop"></i> ... <span class="pl-2">Disable Video <span class="saves-bandwidth">(saves bandwidth)</span></span>` vs AVSettingsModal.svelte:159-163 uses `<label class="check"><input type="checkbox" bind:checked={disableVideo} /><Icon name="desktop" size={15} /><span>Disable Video <span class="saves-bandwidth">(saves bandwidth)</spa  
- **[MED][mismatch] Modal wrapper structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap modal classes (`modal fade`, `modal-dialog`, `modal-content`, `modal-header`, `modal-body`, `modal-footer`); Ours uses custom Svelte Modal component with `.backdrop`, `.panel`, `.head`, `.body`, `.foot` classes. Reference has `id="av-settings-modal"` with `tabindex="-1"`, `aria-hidden="true"`, and data-bs-dismiss attributes; Ours has `aria-modal="true"` and custom onKeydown handler.  
  - _evidence:_ avsettingsmodal.html:1-10 `<div id="av-settings-modal" ... class="modal fade"> ... <div role="document" class="modal-dialog"> ... <div class="modal-content">` vs AVSettingsModal.svelte:125 & Modal.svelte:37-72 uses `<div class="backdrop"> ... <div role="dialog" class="panel">` with Svelte Modal component wrapper  
- **[MED][mismatch] Close button markup** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses empty `<button class="btn-close btn-close-white">` (Bootstrap pseudo-element styling); Ours renders an Icon component with `fa-times` glyph inside. Title and onclick differ; reference uses data-bs-dismiss.  
  - _evidence:_ avsettingsmodal.html:14-20 `<button type="button" data-bs-dismiss="modal" aria-label="Close" class="btn-close btn-close-white"></button>` vs Modal.svelte:52-60 `<button class="close" type="button" onclick={onClose} aria-label="Close dialog" title="Close"><Icon name="times" size={18} /></button>`  
- **[MED][mismatch] Tab panel content wrapper (User Settings tab)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference wraps in `tab-pane fade show active` with nested `<nav class="navbar">` and `<ul class="navbar-nav">`. Ours uses simple `<div class="panel">` with flexbox layout. Reference has `w-100 h-100` and `small` classes; Ours does not. Different semantic structure (navbar/navbar-nav vs simple panel).  
  - _evidence:_ avsettingsmodal.html:49-150 wraps user settings in `<div id="user-audio-video-settings" role="tabpanel" aria-labelledby="user-audio-video-settings-tab" class="tab-pane fade show active"> ... <nav class="navbar w-100 h-100"> ... <ul class="navbar-nav small w-100 h-100">` vs AVSettingsModal.svelte:157-187 uses `<div id="av-panel-user" role="tabpanel" aria-labelledby="av-tab-user" class="panel">`  
- **[MED][mismatch] Speakers selector structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference wraps in `<li>/<a>` nav structure with `form-group d-flex justify-content-between align-items-end`, uses `w-75 mr-2` widths. Label text is plain 'Speakers:' without icon. Ours uses `<div class="field">` with icon inside label, `<div class="row">` flex wrapper, and `av-speaker` id.  
  - _evidence:_ avsettingsmodal.html:94-147 uses `<li class="nav-item"><a title="Choose Speakers" class="nav-link"><div class="form-group d-flex justify-content-between align-items-end"><div class="w-75 mr-2"><label for="speakers-device">Speakers:</label><select id="speakers-device" class="form-control">` vs AVSettingsModal.svelte:165-186 uses `<div class="field"><label class="label" for="av-speaker"><Icon name="volume-up" size={15} /> Speakers</label><div class="row"><se  
- **[MED][mismatch] Presenter tab panel structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses `form-group` wrapper and `form-select` class with bare label text and aria-label on select. Ours uses `field` wrapper, `label` class with inline Icon component, `av-mic` id, no aria-label on select.  
  - _evidence:_ avsettingsmodal.html:151-189 uses `<div id="presenter-audio-video-settings" role="tabpanel" class="tab-pane fade"><div class="form-group"><label for="audio-deviceList">Audio device (input):</label><select id="audio-deviceList" aria-label="Audio device (input)" class="form-select">` vs AVSettingsModal.svelte:189-223 uses `<div id="av-panel-presenter" role="tabpanel" class="panel"><div class="field"><label class="label" for="av-mic"><Icon name="microphone" s  
- **[MED][mismatch] Footer buttons** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses `modal-footer text-center` wrapper with `type="submit"` on Save and `data-bs-dismiss` on Close, Bootstrap btn-success/btn-secondary. Ours uses Modal.foot footer section with `type="button"` on both, custom `.success` and `.ghost` classes, explicit onclick handlers. 'Close' button type differs.  
  - _evidence:_ avsettingsmodal.html:192-207 uses `<div class="modal-footer text-center"><button type="submit" class="btn btn-success">Save</button><button type="button" data-bs-dismiss="modal" class="btn btn-secondary">Close</button>` vs AVSettingsModal.svelte:226-229 uses snippet `{#snippet footer()} <button type="button" class="success" onclick={handleSave}>Save</button> <button type="button" class="ghost" onclick={onClose}>Close</button> {/snippet}` rendered by Modal.  
- **[LOW][mismatch] Test speaker button styling** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap `btn btn-outline-light` with `mr-2` icon margin. Ours uses custom `.ghost .test` classes with Icon component and explicit aria-label.  
  - _evidence:_ avsettingsmodal.html:133-143 uses `<button type="button" class="btn btn-outline-light"><i class="fas fa-volume-up mr-2"></i>Test</button>` vs AVSettingsModal.svelte:177-184 uses `<button type="button" class="ghost test" onclick={testSpeaker} aria-label="..."><Icon name="volume-up" size={15} /> Test</button>`  
- **[LOW][mismatch] Audio/Video device selects (Presenter tab)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference ids are `audio-deviceList` / `video-deviceList`; Ours are `av-mic` / `av-camera`. Reference uses hardcoded options in snapshot; Ours dynamically renders from arrays with fallback 'No ... detected' messages.  
  - _evidence:_ avsettingsmodal.html:163-180 two selects with ids `audio-deviceList` and `video-deviceList`, class `form-select`, hardcoded options (or empty in snapshot) vs AVSettingsModal.svelte:194-218 uses ids `av-mic` and `av-camera`, dynamic options populated from `mics` and `cameras` arrays with placeholder options  
- **[LOW][mismatch] Change Devices button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap `btn btn-primary`; Ours uses custom `.primary .change` classes with onclick handler.  
  - _evidence:_ avsettingsmodal.html:182-188 uses `<button type="button" class="btn btn-primary">Change Devices</button>` vs AVSettingsModal.svelte:220-222 uses `<button type="button" class="primary change" onclick={handleChangeDevices}>Change Devices</button>`  
- **[LOW][missing] Device permission hint text** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Ours includes dynamic hint text when device labels are unavailable; reference snapshot does not show this conditional element.  
  - _evidence:_ AVSettingsModal.svelte:153-155 `{#if !labelsAvailable} <p class="hint">Device names appear after you grant the browser microphone/camera access.</p> {/if}` — no equivalent in reference HTML snapshot  

### `avsettingsmodal1.html` — Audio/Video Settings Modal (AVSettingsModal.svelte)
- **[HIGH][mismatch] Presenter panel — Audio device select** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference has label text 'Audio device (input):' only (no icon) with form-group wrapper and form-select class; our component has Icon (name="microphone", size=15) + label in .field div. Label text is identical but presentation differs significantly (no icon in reference).  
  - _evidence:_ avsettingsmodal1.html:159-169 — `<div class="form-group"><label for="audio-deviceList">Audio device (input):</label><select id="audio-deviceList" aria-label="Audio device (input)" class="form-select"></select></div>`  
- **[HIGH][mismatch] Presenter panel — Video device select** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference has label text 'Video device (input):' only (no icon) with form-group wrapper and form-select class; our component has Icon (name="video", size=15) + label in .field div. Label presentation differs significantly.  
  - _evidence:_ avsettingsmodal1.html:171-181 — `<div class="form-group"><label for="video-deviceList">Video device (input):</label><select id="video-deviceList" aria-label="Video device (input)" class="form-select"></select></div>`  
- **[MED][mismatch] Modal wrapper element** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Angular component tag + Bootstrap modal classes (modal fade); our component uses Svelte's `<Modal>` wrapper which renders a custom dialog structure without Bootstrap modal classes. Our modal uses a `.panel` div with role="dialog" aria-modal="true", not the Bootstrap modal fade.  
  - _evidence:_ avsettingsmodal1.html:1-4 — `<app-av-settings-modal _ngcontent-...></app-av-settings-modal>` wraps `<div id="av-settings-modal" tabindex="-1" role="dialog" aria-labelledby="av-settings-modal" aria-hidden="true" class="modal fade">`  
- **[MED][mismatch] Tab navigation structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap nav-tabs structure (ul>li>a with nav-link/nav-item classes, data-bs-toggle); our component uses custom flexbox `.tabs` wrapper with custom `.tab` buttons. Button IDs differ (user-audio-video-settings-tab vs av-tab-user). Reference shows only 'User Settings' tab; our component has both 'User Settings' and 'Presenter' tabs visible.  
  - _evidence:_ avsettingsmodal1.html:24-44 — `<ul id="userSettingsTab" role="tablist" class="nav nav-tabs">` containing `<li class="nav-item">` with `<a id="user-audio-video-settings-tab" data-bs-toggle="tab" ... class="nav-link active">User Settings</a>`, followed by empty comment `<!---->`  
- **[MED][mismatch] User Settings panel — Disable Video checkbox** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference wraps 'Disable Video' in a navbar-nav `<a>` element (anchor tag, not form input), with title attribute; our component uses proper `<label class="check">` with `<input type="checkbox">`. Reference uses navbar/nav-link structure; our component uses semantic label+checkbox pattern.  
  - _evidence:_ avsettingsmodal1.html:69-89 — `<li class="nav-item"><a title="Disable Video" class="nav-link"><i class="fas fa-desktop"></i><span class="pl-2">Disable Video <span class="saves-bandwidth">(saves bandwidth)</span></span><!----><!----></a></li>`  
- **[MED][mismatch] User Settings panel — Speakers section layout** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap navbar structure with form-group d-flex classes and nested divs (w-75/w-25 split); our component uses custom `.field` and `.row` divs with flexbox. Reference select id="speakers-device" vs our id="av-speaker". Reference label text is 'Speakers:' (plain text) vs our label includes Icon (name="volume-up"). Button styling differs: reference btn btn-outline-light vs our class="ghost test".  
  - _evidence:_ avsettingsmodal1.html:95-148 — Speakers wrapped in navbar `<a>` with nested form-group (d-flex justify-content-between align-items-end); label 'Speakers:' with select id="speakers-device"; button with icon fa-volume-up and text 'Test'  
- **[MED][mismatch] Presenter panel — Change Devices button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap btn btn-primary styling; our component uses custom class="primary change". Both have same button text and type; styling classes differ.  
  - _evidence:_ avsettingsmodal1.html:183-189 — `<button type="button" class="btn btn-primary">Change Devices</button>`  
- **[MED][mismatch] Modal footer buttons** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap btn btn-success and btn btn-secondary with text-center wrapper; our component uses custom class="success" and class="ghost" buttons in footer snippet. Reference has type="submit" on Save; our component has type="button" with onclick handler. Layout and styling classes differ.  
  - _evidence:_ avsettingsmodal1.html:197-210 — Footer contains two buttons: Save (type="submit" class="btn btn-success") and Close (type="button" data-bs-dismiss="modal" class="btn btn-secondary"), within div class="modal-footer text-center"  
- **[MED][missing] Hint text (permission grant message)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Our component includes conditional hint paragraph 'Device names appear after you grant the browser microphone/camera access' (class="hint") that displays when labelsAvailable is false. Reference snapshot shows empty device labels (suggesting labels ARE available), so hint would not be visible in this particular state.  
  - _evidence:_ avsettingsmodal1.html — No hint visible in snapshot  
- **[LOW][mismatch] Modal header close button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap `btn-close btn-close-white` (unstyled empty button); our component uses custom `.close` button with Icon component (name="times", size=18) rendering `<i class="fas fa-times">`. Icon differs.  
  - _evidence:_ avsettingsmodal1.html:15-21 — `<button type="button" data-bs-dismiss="modal" aria-label="Close" class="btn-close btn-close-white"></button>`  
- **[LOW][mismatch] User Settings panel — nav-item wrapper structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap navbar structure (nav>ul.navbar-nav>li.nav-item>a.nav-link); our component uses semantic HTML divs with custom classes (.panel, .check, .field). Structurally different organization.  
  - _evidence:_ avsettingsmodal1.html:57-150 — Entire user settings panel uses navbar/navbar-nav/nav-item/nav-link Bootstrap structure with nested <li> elements inside a <nav><ul class="navbar-nav"></ul></nav>  

### `connected.html` — Connected status toast overlay — a simple success message displayed when the socket connec
- **[HIGH][mismatch] Root container element** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference has id="connectedMsg" + class="notConnectedOverlay animated fadeIn"; ours has class="overlay" only with aria-live="polite" + no id. Reference uses Angular animation classes (animated fadeIn), ours uses Svelte transitions (fade with duration:200).  
  - _evidence:_ connected.html:1-4 `<div _ngcontent-ng-c977335924="" id="connectedMsg" class="notConnectedOverlay animated fadeIn">`  
- **[HIGH][mismatch] Conditional rendering / state handling** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference snapshot captures only the success toast (no conditional logic). Ours implements full state machine: 'Reconnecting…' banner (lines 45-50) shown when down \|\| reconnecting, 'Connected' toast (lines 51-55) shown briefly after down→up transition. Reference is a frozen snapshot; ours is a stateful component.  
  - _evidence:_ connected.html:1-7 shows only the 'Connected' success state, no reconnecting state  
- **[MED][mismatch] Check icon** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses raw Font Awesome `fas fa-check` icon; ours uses `<Icon name="check-circle" />` component abstraction. Reference is a basic <i> tag, ours delegates to Icon.svelte for semantic rendering.  
  - _evidence:_ connected.html:6 `<i _ngcontent-ng-c977335924="" class="fas fa-check"></i>`  
- **[MED][missing] Banner wrapper div** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference has no intermediate banner wrapper. Ours wraps icon+label in <div class="banner up" role="status" transition:fade>. Reference structure is flat; ours has semantic hierarchy with role="status" for accessibility.  
  - _evidence:_ connected.html:1-7 wraps icon+text directly in root div  
- **[MED][mismatch] Styling approach** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Angular/external animation classes. Ours uses Svelte scoped CSS with custom animation keyframes (spin), CSS variables for theming (--bg-elev-2, --positive, --text), and Svelte transition:fade directive for animation control.  
  - _evidence:_ connected.html:1-7 relies on CSS class 'animated fadeIn' (external animation)  
- **[LOW][mismatch] Status label text** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference displays 'Conected' (typo); ours displays 'Connected' (correct spelling). Text is wrapped in <span class="label"> in ours.  
  - _evidence:_ connected.html:6 `Conected` (typo present in reference)  
- **[LOW][mismatch] Positioning and layout** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference is a standalone snapshot with no layout context. Ours is positioned fixed top:1rem, left/right:0, z-index:900, centered with flexbox, pointer-events:none to not block interactions.  
  - _evidence:_ connected.html:1-7 no positioning info in snapshot  

### `dropdownstart.html` — dropdownstart — Volume/Sound settings dropdown panel in trading room navbar
- **[HIGH][mismatch] Container wrapper structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap dropdown markup (li.nav-item.dropdown, a.nav-link, data-bs-toggle). Ours uses custom div.volume with button.icon-btn and conditional rendering of .volume-panel. Reference uses dropstart (left-opening), ours uses position:absolute with top/right positioning.  
  - _evidence:_ dropdownstart.html:1-13 — `<li class="nav-item dropdown dropstart">` with `<a id="dropdownVolume" class="nav-link d-flex align-items-center">` containing icon + label  
- **[HIGH][mismatch] Volume toggle button styling** → `RoomTopNav.svelte:100-112`  
  - Reference: a.nav-link with d-flex, Font Awesome fa-volume-up fa-2x icon + span.mainNavItem label. Ours: button.icon-btn.nav-link-btn with Icon component, conditional icon (volume-mute or volume-up), no text label, Icon has nav-muted-icon class.  
  - _evidence:_ dropdownstart.html:2-12 — `<a id="dropdownVolume" class="nav-link d-flex align-items-center">` with Font Awesome `fa-volume-up` and text span  
- **[HIGH][mismatch] Volume slider control** → `RoomTopNav.svelte:128-140`  
  - Reference: input with audiovolslider custom directive, mx-auto py-2, volCtrl class, Angular validation classes. Ours: input wrapped in label.vol-row with preceding span.vol-label, uses bind:value={volume}, disabled when muted, no custom directive, no ng-* classes.  
  - _evidence:_ dropdownstart.html:28-35 — `<input audiovolslider="" type="range" min="0" max="100" title="Volume" class="mx-auto py-2 volCtrl ng-untouched ng-pristine ng-valid">`  
- **[HIGH][mismatch] Status indicators on sound toggles** → `RoomTopNav.svelte:150-179`  
  - Reference: all checkboxes show fixed 'on' status text. Ours: dynamic span.status with {condition ? 'on' : 'off'} text bound to checkbox state. Reference shows only 'on', ours shows dynamic state.  
  - _evidence:_ dropdownstart.html:48-157 — All sound option labels have hardcoded span with 'on' text (e.g., line 62: `<span>on</span>`)  
- **[MED][mismatch] Dropdown menu container** → `RoomTopNav.svelte:114-182`  
  - Reference: div.dropdown-menu.volumeControl with aria-labelledby. Ours: div.volume-panel (position:absolute, top/right, custom styling). Bootstrap vs custom positioned panel.  
  - _evidence:_ dropdownstart.html:14-18 — `<div class="dropdown-menu volumeControl" aria-labelledby="dropdownVolume">`  
- **[MED][mismatch] Panel header and close button** → `RoomTopNav.svelte:116-126`  
  - Reference: h4 with direct text + span.float-right for close. Ours: div.panel-head with flex layout, h4 in separate element, button.panel-close with Icon component. Reference uses data-bs-toggle on close span, ours uses button onclick.  
  - _evidence:_ dropdownstart.html:19-27 — `<h4>Volume` with `<span data-bs-toggle="dropdown" class="float-right mr-2"><i class="fas fa-times"></i></span>`  
- **[MED][mismatch] Mute button** → `RoomTopNav.svelte:142-144`  
  - Reference: btn.btn-primary.btn-sm with fixed 'Mute' label. Ours: button.mute with conditional text ('Mute' or 'Unmute'), toggle class .on when muted, custom border/accent styling.  
  - _evidence:_ dropdownstart.html:36-42 — `<button title="Mute Audio" class="btn btn-primary btn-sm">Mute</button>`  
- **[MED][mismatch] Alert sound checkbox** → `RoomTopNav.svelte:149-151`  
  - Reference: div.my-1, input with name='alert-donot-disturb' value='Alert Do not disturb', separate label.form-check-label with form-check-input class. Ours: label wraps input directly, no .form-check-* classes, no .my-1 wrapper.  
  - _evidence:_ dropdownstart.html:48-65 — div.my-1 with input#alert-donot-disturb + label with 'Alert sound' + span showing 'on'  
- **[MED][mismatch] QA sound checkbox** → `RoomTopNav.svelte:153-155`  
  - Reference: input name='qa-donot-disturb' value='QA Do not disturb', div.my-1, form-check pattern. Ours: inline label, no wrapper div, no form-check classes.  
  - _evidence:_ dropdownstart.html:66-83 — div.my-1 with input#qa-donot-disturb, label with 'QA sound'  
- **[MED][mismatch] NTA sound checkbox** → `RoomTopNav.svelte:157-159`  
  - Reference: input name='non-trade-donot-disturb' value='Non-trade alerts do not disturb', div.my-1, form-check pattern. Ours: inline label with no wrapper, no my-1 spacing.  
  - _evidence:_ dropdownstart.html:84-101 — div.my-1 with input#non-trade-donot-disturb, label with 'NTA sound'  
- **[MED][mismatch] Chat sound checkbox** → `RoomTopNav.svelte:161-163`  
  - Reference: input name='chat-donot-disturb' value='Chat Do not disturb', div.my-1, form-check pattern. Ours: inline label, no wrapper, no my-1.  
  - _evidence:_ dropdownstart.html:102-119 — div.my-1 with input#chat-donot-disturb, label with 'Chat sound'  
- **[MED][mismatch] Subtitles checkbox** → `RoomTopNav.svelte:165-175`  
  - Reference: div.my-1, input name='presentation-subtitles' value='Presentation Subtitles', label with inline <i class="fas fa-closed-captioning"></i>. Ours: inline label with Icon component rendering closed-captioning icon, no wrapper div.  
  - _evidence:_ dropdownstart.html:120-140 — div.my-1 with input#presentation-subtitles, label with fa-closed-captioning icon + 'Subtitles'  
- **[MED][mismatch] Don't Disturb checkbox** → `RoomTopNav.svelte:176-179`  
  - Reference: input name='app-donot-disturb' value='Do not disturb', div.my-1, form-check pattern with span wrapping label text. Ours: inline label, conditional text (on/off status), no wrapper div.  
  - _evidence:_ dropdownstart.html:141-157 — div.my-1 with input#app-donot-disturb, label with 'Don't Disturb'  
- **[LOW][mismatch] Divider section** → `RoomTopNav.svelte:146`  
  - Reference has both <hr> and .dropdown-divider div. Ours has single hr.divider. Reference uses two separate dividers, ours consolidates to one.  
  - _evidence:_ dropdownstart.html:43-45 — `<hr>` followed by `<div class="dropdown-divider"></div>`  

### `dropdownvolume.html` — Volume control dropdown panel from reference Angular app
- **[MED][mismatch] Root container class and aria attributes** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap `.dropdown-menu` class with `aria-labelledby` for accessibility; ours uses `.volume-panel` with absolute positioning. Reference structure implies Bootstrap dropdown behavior; ours is custom positioned.  
  - _evidence:_ dropdownvolume.html:1-4 `<div class="dropdown-menu volumeControl" aria-labelledby="dropdownVolume">` vs RoomTopNav.svelte:352-365 `.volume-panel` (no aria-labelledby, uses absolute positioning instead of Bootstrap dropdown)  
- **[MED][mismatch] Panel header structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference embeds close button in h4 span with `data-bs-toggle="dropdown"` attribute (Bootstrap pattern); ours uses separate `.panel-head` container with flex layout and `.panel-close` button.  
  - _evidence:_ dropdownvolume.html:6-14 `<h4>` + `<span data-bs-toggle="dropdown">` with `fa-times` icon vs RoomTopNav.svelte:116-126 `.panel-head` flex layout with `.panel-close` button  
- **[MED][mismatch] Mute button styling** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap `.btn .btn-primary .btn-sm` classes; ours uses custom `.mute` class with `.on` modifier for state. Reference button text is static 'Mute'; ours toggles 'Mute'/'Unmute'.  
  - _evidence:_ dropdownvolume.html:23-28 `<button class="btn btn-primary btn-sm" title="Mute Audio">Mute</button>` vs RoomTopNav.svelte:142-144 `<button class="mute" ... {muted ? 'Unmute' : 'Mute'}</button>`  
- **[LOW][mismatch] Volume slider input** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference has `audiovolslider=""` Angular directive, Bootstrap spacing classes (`mx-auto py-2`), and Angular form state classes. Ours is wrapped in `.vol-row` label with bound state and disabled when muted.  
  - _evidence:_ dropdownvolume.html:15-22 `<input audiovolslider="" type="range" min="0" max="100" title="Volume" class="mx-auto py-2 volCtrl ng-untouched ng-pristine ng-valid">` vs RoomTopNav.svelte:130-140 `<input id="nav-volume" name="volume" type="range" ... bind:value={volume}>`  
- **[LOW][mismatch] Sound options container** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference class name is `room-sound-options`; ours is `sound-options`. Functional structure is identical.  
  - _evidence:_ dropdownvolume.html:33 `<div class="room-sound-options">` vs RoomTopNav.svelte:148 `<div class="sound-options">`  

### `file-1.html` — Mastering The Trade (Angular) - HTML HEAD only snapshot with all embedded styles and scrip
- **[HIGH][missing] Floating Speech Recognition Overlay (.speech-reco-overlay, .speech-reco-line, .speech-reco** → ``  
  - Reference has comprehensive speech recognition UI with floating overlay displaying transcribed text in real-time, word-wrap, history button, close button, scrollable text container. OUR: No corresponding component found in codebase. This is a missing surface—transcription overlay for live speech-to-text during sessions.  
  - _evidence:_ file-1.html:2980-3090+ — .speech-reco-overlay { position: absolute; inset: 0; display: flex; }, .speech-reco-line { color: #fff; font-size: 22px; word-wrap: break-word; }, .speech-reco-buttons { display: flex; gap: 8px; pointer-events: auto; }, .speech-reco-text-wrapper { flex: 1; max-height: 3.5em; overflow-y: auto; }, .speech-reco-close-btn, .speech-reco-history-btn { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; }  

### `file10.html` — Audio/Video Settings Modal (AVSettingsModal.svelte)
- **[?][mismatch] Tab Navigation (tablist, tab buttons, active states)** → ``  
  - Reference uses Bootstrap nav-tabs with anchors (href-based), ours uses custom tabs component with button elements; reference has only 'User Settings' tab visible (presenter tab hidden in comment <!---->), ours shows both User Settings and Presenter buttons  
  - _evidence:_ file10.html:24-44 uses <ul class='nav nav-tabs'> with <li class='nav-item'> containing <a> anchors with data-bs-toggle='tab' and class 'nav-link active'; AVSettingsModal.svelte:126-150 uses <div class='tabs'> with <button role='tab'> elements  
- **[?][mismatch] Tab Content Panel (User Settings panel)** → ``  
  - Reference wraps settings in navbar/ul/li structure (navbar-nav pattern), ours uses flat div/label/input structure. Reference has nested list structure; ours has semantic form structure.  
  - _evidence:_ file10.html:50-150 defines id='user-audio-video-settings' with nested <nav class='navbar'> containing <ul class='navbar-nav'> and nav-items; AVSettingsModal.svelte:157-187 uses <div id='av-panel-user' role='tabpanel'> with direct label and field elements  
- **[?][mismatch] Disable Video Checkbox** → ``  
  - Reference embeds checkbox state in anchor's title/span structure without visible input element, ours has explicit checkbox input. Reference uses fa-desktop icon, ours uses Icon component with name='desktop'  
  - _evidence:_ file10.html:69-89 shows <a class='nav-link'> wrapping icon+span with inline checkbox logic (lines 73-88); AVSettingsModal.svelte:159-163 uses <label class='check'> wrapping <input type='checkbox'> with Icon component  
- **[?][mismatch] Speakers Dropdown Section** → ``  
  - Reference uses form-group with Bootstrap w-75/w-25 grid widths, ours uses custom field/row layout. Reference has form-group > div(w-75) + div(w-25) structure; ours has label + div(row) with flex properties  
  - _evidence:_ file10.html:95-148 wraps speakers control in <a class='nav-link'> > <div class='form-group'> with nested label+select and test button in w-75/w-25 layout; AVSettingsModal.svelte:165-186 uses <div class='field'> with label and <div class='row'> for flex layout  
- **[?][mismatch] Speakers Select Element and Test Button** → ``  
  - Reference uses form-control and btn btn-outline-light Bootstrap classes, ours uses custom ghost/test classes. Reference option labels are hardcoded ('Default - External Headphones'), ours dynamically generates labels from MediaDeviceInfo. Reference has mr-2 margin on icon, ours uses gap in flex layout.  
  - _evidence:_ file10.html:111-145 shows <select id='speakers-device' class='form-control'> and <button class='btn btn-outline-light'> with fa-volume-up icon; AVSettingsModal.svelte:168-185 shows <select id='av-speaker'> and <button class='ghost test'> with Icon component  
- **[?][mismatch] Presenter Tab Panel (second tab)** → ``  
  - Reference uses form-group class pattern, ours uses custom field class. Reference has form-select class on select elements (lines 168, 180), ours has no class. Reference presenter tab is marked hidden in the snapshot (no aria-selected), but component has full implementation.  
  - _evidence:_ file10.html:152-190 shows id='presenter-audio-video-settings' with form-group divs for audio and video dropdowns, plus Change Devices button; AVSettingsModal.svelte:189-223 shows id='av-panel-presenter' with field divs and Change Devices button  
- **[?][mismatch] Audio Device (input) Dropdown** → ``  
  - Reference uses form-select class and plain label, ours uses custom label class with Icon component. Reference has aria-label on select, ours does not. Reference wraps in form-group, ours uses field wrapper.  
  - _evidence:_ file10.html:159-170 shows <div class='form-group'> > <label for='audio-deviceList'>Audio device (input):</label> > <select id='audio-deviceList' class='form-select'>; AVSettingsModal.svelte:190-202 shows <label class='label' for='av-mic'> with Icon component + <select id='av-mic'>  
- **[?][mismatch] Video Device (input) Dropdown** → ``  
  - Reference uses form-select class and plain label, ours uses custom label class with Icon component. Reference has aria-label on select, ours does not. Reference wraps in form-group, ours uses field wrapper.  
  - _evidence:_ file10.html:171-182 shows <div class='form-group'> > <label for='video-deviceList'>Video device (input):</label> > <select id='video-deviceList' class='form-select'>; AVSettingsModal.svelte:205-217 shows <label class='label' for='av-camera'> with Icon + <select id='av-camera'>  
- **[?][mismatch] Icons (Font Awesome vs custom Icon component)** → ``  
  - Reference uses Font Awesome <i> tags with fas fa-* classes, ours uses abstracted Icon component. Icon class names differ: reference has fa-desktop/fa-volume-up, ours wraps these in Icon component with name prop.  
  - _evidence:_ file10.html:73-76 uses <i class='fas fa-desktop'>, line 141 uses <i class='fas fa-volume-up'>; AVSettingsModal.svelte:161, 166, 192, 207, 221 use <Icon name='desktop'/>, name='volume-up'/>, name='microphone'/>, name='video'/> components  
- **[?][missing] Form Field Hint Text** → ``  
  - Our implementation includes a permission hint (lines 153-155: 'Device names appear after you grant the browser microphone/camera access'), which is not visible in the reference HTML. This is a feature addition.  
  - _evidence:_ AVSettingsModal.svelte:153-155 shows hint paragraph about device names appearing after permission grant; file10.html has no corresponding hint text in visible content  
- **[?][mismatch] Option Labels in Dropdowns** → ``  
  - Reference has static/mock option labels, ours dynamically populates from enumerated devices. Reference shows 2 speaker options, ours shows 'No speakers detected' fallback when empty.  
  - _evidence:_ file10.html:116-127 shows hardcoded option values 'Default - External Headphones' and 'Default - External Headphones 2'; AVSettingsModal.svelte:169-175 dynamically generates from MediaDeviceInfo array using deviceLabel() helper  

### `file11.html` — Debug Log Modal (Angular Bootstrap version)
- **[HIGH][mismatch] Modal container** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap modal classes (modal, fade, modal-dialog, modal-lg) with inline styles; ours uses a custom Svelte component with CSS variables and a backdrop pattern. Reference has aria-hidden and aria-labelledby on modal; ours uses aria-modal and aria-labelledby on the panel inside a rendered conditional.  
  - _evidence:_ file11.html:2-10 `<div id="debug-log-modal" class="modal fade" role="dialog" aria-labelledby="user-details" aria-hidden="true">`  
- **[HIGH][mismatch] Textarea element** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: id=debugLogModalTxt, rows=1000, class=form-control, min-width:100% inline style. Ours: id=debug-log-text, no rows attribute, class=log, width:100% via CSS, includes spellcheck=false and wrap=off attributes, has aria-label, and uses reactive value binding.  
  - _evidence:_ file11.html:36-44 `<textarea id="debugLogModalTxt" rows="1000" readonly="readonly" class="form-control" style="min-width: 100%"></textarea>`  
- **[HIGH][mismatch] Modal footer buttons** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference has only one button (Close) with btn-secondary class and data-bs-dismiss. Ours has two buttons in a snippet: Copy button (with check/copy icons and disabled state) and Close button (primary variant). Reference uses Bootstrap button classes; ours uses custom btn, ghost, and primary CSS classes.  
  - _evidence:_ file11.html:48-57 `<div class="modal-footer"><button type="button" data-bs-dismiss="modal" class="btn btn-secondary">Close</button></div>`  
- **[MED][mismatch] Close button in header** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap btn-close class with empty content and data-bs-dismiss; ours uses Icon component with name="times" size=18px and explicit onclick handler.  
  - _evidence:_ file11.html:22-28 `<button type="button" data-bs-dismiss="modal" aria-label="Close" class="btn-close btn-close-white"></button>`  
- **[MED][mismatch] Modal body wrapper** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap modal-body and row classes with inline overflow-y:scroll; ours uses custom .body class and wraps textarea in .debug-log-body div instead of .row.  
  - _evidence:_ file11.html:30-46 `<div class="modal-body" style="max-height: 77vh; overflow-y: scroll"><div class="row"><textarea...></textarea></div></div>`  
- **[MED][mismatch] Modal styling approach** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses inline styles for layout control (!important override); ours uses CSS variables (--bg-elev, --border, --accent, etc.) and Svelte :global selector to size modal based on content (.panel:has(.debug-log-body)).  
  - _evidence:_ file11.html:15 `style="overflow-y: initial !important"` on modal-dialog; file11.html:33 `style="max-height: 77vh; overflow-y: scroll"` on modal-body  

### `file12.html` — Post Alert Modal — reference snapshot from protradingroom.com
- **[HIGH][mismatch] Media Upload Area (Image/GIF/Video tab)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: separate label (click target) and div.filedragMD (drop zone) with separate fileList div below. Ours: single <label class="upload"> that is both click AND drop zone (ondrop + ondragover bound to same element); text is conditional ("Uploading…" while uploading); media preview image rendered conditionally below label; no separate file list area; uses Icon name="upload" instead of fa-file-upload fa-2x.  
  - _evidence:_ file12.html:179-216: <label class="upload-area"> → hidden <input type="file" id="fuploadAlert" accept="image/*"> → <i class="fas fa-file-upload fa-2x"> → text → <div id="filedragAlert" class="filedragMD"> (separate drop zone) → <div id="fileListAlert" class="fileList">  
- **[MED][mismatch] Tab Navigation Structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap tab API (<a data-bs-toggle> with href anchors). Ours uses <button role="tab"> with onclick handlers and Svelte reactive tab state; ours includes Icon components (name="font"\|"link"\|"image") inline with labels, reference uses no icons.  
  - _evidence:_ file12.html:37-70: <a> elements with role="tab", data-bs-toggle="tab", href="#nav-text" etc.; class="nav-item nav-link" with active state  
- **[MED][mismatch] Tab Content Panels** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference renders tab panels as <div role="tabpanel"> with Bootstrap tab-pane classes. Ours uses Svelte conditional rendering ({#if tab === 'text'}) with no tabpanel role or tab-pane classes; panels are logically separated but not marked as tabpanels in the DOM.  
  - _evidence:_ file12.html:78-233: <div role="tabpanel"> with class="tab-pane fade" (show active on active tab)  
- **[MED][mismatch] URL Input Group (Text Url & Media tabs)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap input-group DOM structure with input-group-text span. Ours uses custom flexbox .input-group with .prepend span and Icon component (name="link") instead of <i class="fas fa-link">, no aria-describedby linking.  
  - _evidence:_ file12.html:107-131 (url tab) & 154-178 (media tab): Bootstrap input-group with input-group-prepend → <span class="input-group-text"> → <i class="fas fa-link">  
- **[LOW][mismatch] Footer Checkboxes Layout** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap .form-check wrapper divs with checkbox and label as siblings. Ours uses custom .check labels wrapping checkbox input directly (label > input pattern), more compact flex gap arrangement, same label text content.  
  - _evidence:_ file12.html:240-316: Bootstrap .form-check layout with <input type="checkbox"> + <label> as adjacent siblings within .form-check div; IDs: keepOpenChk, postOnXChk, alert-push-label, alert-non-trade-label, alert-legal-disclosure-label  
- **[LOW][mismatch] Post Button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: text-only button. Ours: includes Icon component (name="paper-plane" size={14}) before text, button text conditionally shows 'Posting…' when posting, disabled={posting \|\| uploading}.  
  - _evidence:_ file12.html:320-325: <button class="btn btn-success">Post Alert</button> (text only, no icon)  

### `file13.html` — Poll Modal (Create/Canned Polls)
- **[MED][mismatch] Step numbers on section headers** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses `<span class="label label-warning">1/2/3</span>` numeric badges before step headers; ours uses plain `<h3 class="step">` with no numbering  
  - _evidence:_ file13.html:90-96 — `<h3><span class="label label-warning">1</span> Enter your poll question:</h3>` with numbered badge elements  
- **[MED][mismatch] Tab structure markup** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap tab structure (ul > li > a) with data-bs-target/data-bs-toggle; ours uses simple `<div class="nav-tabs">` with button children and onclick handlers  
  - _evidence:_ file13.html:50-80 — `<ul id="nav-tab" role="tablist" class="nav nav-tabs">` with `<li class="nav-item">` containing `<a>` tags with data-bs-toggle  
- **[MED][mismatch] Choices list rendering** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses `<ol>` (ordered list) for choices; ours uses `<ol class="choices">` with li items containing span and delete button. Ours wraps in conditional rendering.  
  - _evidence:_ file13.html:138-140 — `<ol _ngcontent-ng-c3558549984=""><!----></ol>` (empty ol with Angular comment)  
- **[MED][mismatch] Tabpanel container divs and aria structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference wraps all tabpanels in `tab-content` container with explicit tabpanel divs and tab-pane classes; ours renders pane content conditionally based on tab state  
  - _evidence:_ file13.html:82-86 — `<div class="tab-content w-100 p-2"><div role="tabpanel" id="sendpoll" class="tab-pane active">`  
- **[LOW][mismatch] Anonymous poll checkbox label text** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference text: 'Does not show the voting name/email, just results' (3 items); ours: 'Does not show the voting members\' names' (simpler description)  
  - _evidence:_ file13.html:161-168 — `<label for="anonymous-poll" class="form-check-label">Anonymous Poll (Does not show the voting name/email, just results)</label>`  
- **[LOW][mismatch] Form input classes and attributes** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap form-control classes and Angular form-state classes (ng-untouched, ng-pristine, ng-valid); ours uses custom `class="input"`  
  - _evidence:_ file13.html:98-104 — `<input type="text" id="pollQuestionTxt" placeholder="..." class="form-control ng-untouched ng-pristine ng-valid"/>`  
- **[LOW][mismatch] Button icons implementation** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses inline FontAwesome icons with `<i class="fa fa-*">` tags; ours uses `<Icon name="minus\|expand\|times" size=N />` component abstraction  
  - _evidence:_ file13.html:19-21, 29-31, 40 — `<i class="fa fa-window-minimize"></i>`, `<i class="fa fa-window-maximize"></i>`, `<i class="fa fa-times"></i>`  
- **[LOW][mismatch] Panel footer button layout** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap utility classes (pull-right, float-right, centered) on buttons within poll-panel-footer div; ours uses flex-based `<div class="actions">` with space-between justify  
  - _evidence:_ file13.html:170-194 — `<div class="poll-panel-footer"><button class="btn btn-outline-light pull-right">Save To Canned</button><button class="btn btn-success centered float-right">Send Poll</button></div>`  
- **[LOW][mismatch] Add Choice button icon and structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap input-group/input-group-btn structure with fa-plus-circle icon and spacer entities; ours uses custom flex add-choice div with Icon component  
  - _evidence:_ file13.html:114-136 — `<div class="input-group"><input.../><span class="input-group-btn"><button type="button" class="btn btn-outline-light"><i class="fa fa-plus-circle"></i>&nbsp;&nbsp;Add Choice</button></span></div>`  

### `file14.html` — ChatLogsModal - Angular snapshot showing populated list with Bootstrap styling
- **[HIGH][mismatch] Modal wrapper structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap `modal fade` classes and `id="chat-logs-modal"`; ours uses custom `<Modal>` component with custom `backdrop` and `panel` classes  
  - _evidence:_ file14.html:2-10: `<div id="chat-logs-modal" role="dialog" class="modal fade">` with Bootstrap modal classes  
- **[HIGH][mismatch] Modal header structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap `modal-header`, `h5` tag, and `btn-close btn-close-white` close button; ours uses custom `header` class with `h2` tag and Icon component  
  - _evidence:_ file14.html:13-21: `<div class="modal-header"><h5>Chat Logs</h5><button class="btn-close btn-close-white"></button></div>`  
- **[HIGH][mismatch] Toolbar / Reload button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: Bootstrap `btn btn-primary my-2` button with plain text; ours: custom `.reload` class with Icon component (`<Icon name="sync" size={14} />`)  
  - _evidence:_ file14.html:25-31: `<button class="btn btn-primary my-2">Reload Log List</button>` (plain text, no icon)  
- **[HIGH][mismatch] List container** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap `list-group` div; ours uses semantic `<ul class="list">` element  
  - _evidence:_ file14.html:32: `<div class="list-group">`  
- **[HIGH][mismatch] List item structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: Bootstrap `list-group-item list-group-item-action` div with nested divs; ours: semantic `<li class="entry">` with 3 `<span>` children (`.date`, `.by`, `.channel`)  
  - _evidence:_ file14.html:34-61: `<div class="list-group-item list-group-item-action">` containing 3 nested `<div>` elements with `<strong>` labels and `<i>` values  
- **[MED][mismatch] Modal body wrapper** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap `modal-body`; ours uses custom `body` class  
  - _evidence:_ file14.html:23: `<div class="modal-body">`  
- **[MED][mismatch] List item field labels and formatting** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: separate `<strong>` for labels with `&nbsp;` separators and `<i>` for values; ours: simple text spans with no label prefix, by/channel have custom CSS styling for dimming  
  - _evidence:_ file14.html:39-60: Date in `<strong>`, By as `<strong>By:&nbsp;</strong><i>admin@protradingroom.com</i>`, Channel as `<strong>Channel:&nbsp;</strong><i>offTopic</i>`  
- **[MED][mismatch] Modal footer** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: Bootstrap `modal-footer text-center` with secondary button; ours: no footer rendered (Modal only renders footer if snippet passed)  
  - _evidence:_ file14.html:59147-59159: `<div class="modal-footer text-center"><button class="btn btn-secondary">Close</button></div>`  
- **[MED][mismatch] Close button styling** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: Bootstrap `btn-close btn-close-white`; ours: custom `.close` class with Icon component  
  - _evidence:_ file14.html:20: `class="btn-close btn-close-white"`  
- **[LOW][mismatch] Empty state handling** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference snapshot shows actual populated data; ours: array is hardcoded empty and shows `<div class="empty">` with icon and 'No logs yet.' message  
  - _evidence:_ file14.html: shows populated list with multiple log entries  

### `file15.html` — AlertLogsModal - Alerts Logs modal dialog showing audit log entries with reload button and
- **[HIGH][mismatch] Modal root element and structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap modal classes (modal, fade, modal-dialog, modal-content, modal-header, modal-body, modal-footer) with aria-labelledby pointing to modal id itself. Ours uses custom Svelte Modal wrapper with role='dialog', aria-modal='true', aria-labelledby pointing to unique titleId, and custom .backdrop/.panel structure instead of Bootstrap grid  
  - _evidence:_ file15.html:1-10 — Root is `<app-alert-logs-modal>` wrapping Bootstrap `.modal.fade` with id='alerts-logs-modal', role='dialog', aria-labelledby='alerts-logs-modal'  
- **[HIGH][missing] Empty state display** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Our implementation has an explicit empty state (div.empty with bell icon and 'No logs yet.' text). Reference snapshot shows only the populated list state with sample data (Oct 22, 2023 and Oct 15, 2023 entries). The logs array is currently empty in our code comment, so this is a logic state difference — reference shows rendered sample data, ours shows the empty fallback  
  - _evidence:_ file15.html:35-80 shows populated .list-group with two sample log entries; no empty state markup present in this snapshot  
- **[MED][mismatch] Modal header and title** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses h5 tag, Bootstrap .btn-close .btn-close-white classes, and data-bs-dismiss. Ours uses h2 tag with inline Icon component (times icon, 18px), .close class, and onclick handler to call onClose()  
  - _evidence:_ file15.html:13-24 — .modal-header contains `<h5>` with text 'Alerts Logs', plus `<button class='btn-close btn-close-white'>` with data-bs-dismiss='modal'  
- **[MED][mismatch] Reload button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap btn btn-primary classes. Ours uses custom .reload class (disabled state, custom styling with --bg-elev/--border variables), contains Icon component with sync icon (14px) before text, and is disabled (disabled attribute)  
  - _evidence:_ file15.html:28-34 — `<button class='btn btn-primary my-2'>` with text 'Reload Log List', no icon visible in markup  
- **[MED][mismatch] Log list container** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap .list-group/.list-group-item classes. Ours conditionally renders: if logs.length===0, shows .empty div with bell icon and 'No logs yet.' message; else renders ul.list with li.entry children  
  - _evidence:_ file15.html:35-80 — `.list-group` div containing `.list-group-item.list-group-item-action` elements (Bootstrap list structure)  
- **[MED][mismatch] Log entry structure (when data present)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses div+strong+i semantic hierarchy. Ours uses li.entry with two span children: span.date (date only, no 'By:' label) and span.by (formatted as 'by {log.by}' inline)  
  - _evidence:_ file15.html:37-57 (first entry) — `.list-group-item` contains two inner `<div>` elements: first has `<strong class='fw-bold'>` with date text (e.g. 'Oct 22, 2023'), second has `<strong class='fw-bold'>` with 'By:&nbsp;' plus `<i>` with email address  
- **[MED][mismatch] Modal footer** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference has Bootstrap footer with Close button. Our AlertLogsModal does NOT pass a footer snippet to Modal, so no footer is rendered. Modal component supports optional footer via snippet prop, but AlertLogsModal does not use it  
  - _evidence:_ file15.html:84-96 — `.modal-footer.text-center` with single `<button class='btn btn-secondary'>` labeled 'Close' with data-bs-dismiss='modal'  
- **[LOW][mismatch] Styling and CSS classes** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap class-based styling. Ours uses Svelte scoped CSS variables (--bg-elev, --border, --text-dim, --radius, --accent-hover) for theming and custom semantic classes (.toolbar, .reload, .empty, .list, .entry, .date, .by)  
  - _evidence:_ file15.html uses Bootstrap utility classes: btn, btn-primary, btn-secondary, btn-close, btn-close-white, modal*, my-2, fw-bold, text-center, list-group*  

### `file16.html` — Angular Session Control Modal (Bootstrap 5) — empty modal with header, body, footer
- **[HIGH][mismatch] Modal wrapper root element** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap `.modal.fade` + `.modal-dialog.modal-lg` hierarchy. Our Modal.svelte uses custom `.backdrop` + `.panel` (role='dialog') without Bootstrap classes. Different CSS framework.  
  - _evidence:_ file16.html:1-9 `<app-session-control-modal>` with `.modal.fade` div structure  
- **[HIGH][mismatch] Modal header structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap `.modal-header` + h5 title + `.btn-close.btn-close-white`. Our Modal uses custom `.head` + h2 title + Icon-based close button. Different heading level (h5 vs h2) and close button implementation.  
  - _evidence:_ file16.html:17-31 `.modal-header` with h5 id='session-control', close button class='btn-close btn-close-white'  
- **[HIGH][mismatch] Modal footer and Done button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap `.btn.btn-success.btn-block` green button in `.modal-footer`. Our SessionControlModal renders footer with `<button class='btn ghost'>Done</button>` — neutral ghost button styling, not Bootstrap success variant. Also Modal.svelte footer uses `.foot` not `.modal-footer`.  
  - _evidence:_ file16.html:36-44 `.modal-footer` with button class='btn btn-success btn-block' text='Done'  
- **[HIGH][mismatch] CSS framework and styling** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap 5 CSS classes for styling and layout. Our implementation uses custom Svelte CSS modules (--bg-elev, --border, --accent, --text-dim CSS variables) with custom styling. No Bootstrap dependency.  
  - _evidence:_ file16.html:1-48 Bootstrap 5 classes throughout: .modal.fade, .modal-dialog, .modal-content, .modal-header, .modal-body, .modal-footer, .btn-close, .btn.btn-success.btn-block  
- **[MED][mismatch] Modal title attribute and ID** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses fixed id='session-control' on h5 and aria-labelledby. Our Modal.svelte uses generated titleId via $props.id() and aria-labelledby={titleId}, h2 element. Both are semantically valid but different approaches.  
  - _evidence:_ file16.html:7,20 aria-labelledby='session-control', h5 id='session-control'  

### `file17.html` — MobileAppInfoModal - mobile app download promotion modal
- **[?][mismatch] Modal container root element** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap modal structure with `.modal.fade` and static HTML div; ours wraps in Svelte Modal component which renders a modern dialog with backdrop overlay. Reference uses `aria-hidden=true` for hidden state; ours conditionally renders with Svelte `{#if open}` and uses `aria-modal=true`.  
  - _evidence:_ file17.html:1-9 — `<app-mobile-app-info-modal>` wrapper with inner `<div id="mobileAppInfoModal" class="modal fade" aria-hidden="true" tabindex="-1">`  
- **[?][mismatch] Modal header structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap `h5.modal-title` with white-style close button; ours uses `h2` with custom Icon component inside a styled `.close` button. Reference has `btn-close-white` class; ours applies custom border/color styling. Our close button has custom aria-label and title attributes; reference uses generic aria-label="Close".  
  - _evidence:_ file17.html:12-26 — `.modal-header` with `<h5 id="mobileAppInfoLabel" class="modal-title">` and `.btn-close.btn-close-white` button  
- **[?][mismatch] Modal body content wrapper** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference omits descriptive text and uses only flex container for badges. Ours includes introductory paragraph: 'Get the trading room on the go — install our mobile app.' with `.lead` styling. Reference uses Bootstrap flex utilities (`justify-content-evenly`); ours uses custom CSS (`gap: 0.75rem`).  
  - _evidence:_ file17.html:28-54 — `.modal-body` with inner flex container `.d-flex.align-items-center.justify-content-evenly.m-3.mb-4`  
- **[?][mismatch] App store badge links** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses image badges (PNG/SVG files) with `alt` text; ours uses Font Awesome brand icons (`apple`, `google-play`) via custom Icon component. Reference links: Google Play (com.bellesoft.stprotradingroom app) and Apple (specific app ID 1278652736); ours links to generic store pages. Reference has `type="button"` on `<a>` tags; ours is semantic links without type attribute. Reference: `class="google-badge"`; ours: custom `.badge` styling with black bac  
  - _evidence:_ file17.html:33-52 — Two `<a target="_blank" type="button">` with `<img src="/assets/images/google-play-badge.png">` and `<img src="/assets/images/iosAppStore.svg">`  
- **[?][mismatch] Badge styling and layout** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference images are styled inline with `alt` attributes only. Ours badges have structured layout: `.badge { flex: 1 1 0; min-width: 165px; display: inline-flex; gap: 0.6rem; background: #000000; border-radius: 10px; }`. Reference doesn't show text; ours renders two-line text (small + strong) via `.txt` span with `line-height: 1.15`. Reference uses Bootstrap spacing (m-3, mb-4); ours uses CSS custom properties and custom spacing.  
  - _evidence:_ file17.html:40-51 — Images with `class="google-badge"` and no sizing/layout classes on links  
- **[?][missing] Modal footer** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference includes an explicit 'Close' button in footer using Bootstrap `.btn.btn-secondary` styling. Our Modal component has no footer slot rendered in MobileAppInfoModal (footer?: Snippet is optional and not passed). Close action is handled only by the X icon in header.  
  - _evidence:_ file17.html:56-64 — `.modal-footer` with `<button class="btn btn-secondary">Close</button>`  
- **[?][mismatch] Modal accessibility attributes** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses static `aria-hidden=true` and `aria-labelledby`; ours uses dynamic `role="dialog" aria-modal="true" aria-labelledby={titleId}` with Svelte-generated unique ID. Reference: `aria-hidden=true` at page level; ours: structure only renders when open, managing focus/restore automatically via `$effect`.  
  - _evidence:_ file17.html:4-7 — `id="mobileAppInfoModal" tabindex="-1" aria-labelledby="mobileAppInfoLabel" aria-hidden="true"`  

### `file18.html` — Reply Modal - private message reply dialog with text input and emoji/image insertion tools
- **[HIGH][mismatch] Modal dialog wrapper** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap (`modal fade` class); ours uses custom Svelte Modal with custom `.backdrop` and `.panel` styling. No `fade` animation class in ours. Reference has `aria-hidden="true"`; ours uses `aria-modal="true"` on panel  
  - _evidence:_ file18.html:2-9 `<div class="modal fade" id="replyModal" tabindex="-1" aria-labelledby="replyLabel" aria-hidden="true">` — Bootstrap modal fade class  
- **[HIGH][mismatch] Modal header / title area** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference title structure is h5 with `modal-title` class and nested `do-private-reply` span containing strong ':' marker and empty div. Ours is `<h2>` with plain text title. Reference has decorative ':' before username (lines 20-22); ours has no such prefix. Reference's `aria-labelledby="replyLabel"`; ours uses dynamic titleId  
  - _evidence:_ file18.html:12-24 `<div class="modal-header"><h5 id="replyLabel" class="modal-title"><span class="do-private-reply"><strong>:</strong><div></div></span></h5>` — h5 with nested span/strong  
- **[HIGH][mismatch] Textarea input field** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: rows="1", name="txt-area", id="textAreaReplyTxt", placeholder="Type your message here..", classes "txt-area form-control border-0". Ours: rows="3", no name/id attributes on textarea itself, placeholder="Write a reply…", in a `<label class="field">` wrapper with sr-only span  
  - _evidence:_ file18.html:43-51 `<textarea name="txt-area" id="textAreaReplyTxt" rows="1" spellcheck="true" placeholder="Type your message here.." class="txt-area form-control border-0"></textarea>` — single-row textarea  
- **[HIGH][mismatch] Textarea wrapper layout** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference wraps textarea and buttons in a horizontal flex layout (`d-flex flex-row`) with textarea in left column and button tools in right column. Ours: textarea is standalone in a label, buttons are in footer snippet. Reference uses Bootstrap flex utilities; ours uses custom footer layout with `.tools` and `.tool` classes  
  - _evidence:_ file18.html:35-83 `<div class="flex-fill d-flex mx-0"> <div class="px-0 flex-fill"> [textarea] </div> <div class="justify-content-center d-flex flex-row..."> [buttons] </div> </div>` — flexbox row with text + buttons columns  
- **[HIGH][mismatch] Modal footer / action buttons** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference has only a Close button (dismisses modal). Ours footer contains: left-aligned `.tools` div with emoji + image buttons, and right-aligned primary Send button. Reference uses `data-bs-dismiss` for close action; ours uses explicit Send button with `onclick={send}` and Close is implicit via onClose or Escape. No explicit Close button in ours  
  - _evidence:_ file18.html:85-94 `<div class="modal-footer"><button type="button" data-bs-dismiss="modal" class="btn btn-secondary">Close</button></div>` — single Close button using Bootstrap `modal-footer`  
- **[HIGH][missing] Send button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference snapshot does not show a Send button in the footer — only a Close button. Ours has a primary Send button with Icon + text, disabled when text is empty. This is either a missing surface in the snapshot or the reference snapshot is incomplete  
  - _evidence:_ file18.html:85-94 — footer contains only Close button, no explicit Send button found  
- **[MED][mismatch] Root component container** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference is Angular component wrapper; ours is Svelte component. Reference has compiled `_ngcontent` / `_nghost` attributes; ours is pure Svelte (no compiled markup attributes)  
  - _evidence:_ file18.html:1 `<app-reply-modal _ngcontent-ng-c977335924="" _nghost-ng-c1823712792="">` — Angular component with compiled attributes  
- **[MED][mismatch] Close button in header** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap `btn-close btn-close-white` classes with `data-bs-dismiss="modal"`; ours uses custom `.close` class with Icon component rendering `fa-times`. Reference is empty button; ours has Icon child element  
  - _evidence:_ file18.html:25-31 `<button type="button" data-bs-dismiss="modal" aria-label="Close" class="btn-close btn-close-white"></button>` — Bootstrap close button  
- **[MED][mismatch] Emoji insert button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: `<span>` wrapper with ng-bootstrap popover attrs (placement, container, autoclose, popoverclass), `<i class="far fa-smile">` (regular/outline icon). Ours: `<button class="tool">` with Icon component `name="smile"` (solid by default, not regular), aria-label="Insert emoji"  
  - _evidence:_ file18.html:57-70 `<span class="textAreaBtns" placement="auto" container="body" autoclose="outside" popoverclass="popOverDiv"><i placement="left" ngbtooltip="Add Emojis" class="far fa-smile"></i></span>` — regular FontAwesome smile icon with ngb-tooltip  
- **[MED][mismatch] Image insert button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: `<span>` wrapper, `<i class="fas fa-image">` (solid). Ours: `<button class="tool">` with Icon component `name="image"` (solid), aria-label="Attach image"  
  - _evidence:_ file18.html:71-80 `<span class="textAreaBtns"><i ngbtooltip="Upload an Image" placement="left" class="fas fa-image"></i></span>` — solid FontAwesome image icon with ngb-tooltip  
- **[MED][mismatch] Icon font system** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses raw FontAwesome classes (far/fas/fab + fa-name). Ours wraps in Icon component which accepts `name` and `family` props and generates the same FA classes. Reference emoji uses 'far' (regular); ours uses default 'solid'  
  - _evidence:_ file18.html:68 `class="far fa-smile"`, line 78 `class="fas fa-image"` — raw FontAwesome classes  

### `file19.html` — AlertQaModal snapshot - old Angular Bootstrap modal for Q&A on alerts
- **[HIGH][mismatch] Modal wrapper & dialog structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - New component uses a custom `<div class="backdrop">` wrapper (line 129-135) with custom click-to-close handler and CSS `position: fixed; inset: 0`, replacing Bootstrap modal scaffolding. Role is now dialog with aria-modal=true instead of modal with data-* attributes.  
  - _evidence:_ file19.html:1-11 — `<app-alert-qa-modal><div id="alertQAModal" class="fade modal" role="dialog">` — Bootstrap modal with data-backdrop and data-keyboard attrs  
- **[HIGH][mismatch] Modal header** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - New header is minimal: `<header><h2>Q&A — {alert.symbol}</h2><button>` (line 137-142). Removes the entire admin-alert display block (lines 28-88 in snapshot) showing gravatar, username, created-at timestamp. Shows symbol instead of generic 'Alert:' label.  
  - _evidence:_ file19.html:14-98 — `<div class="modal-header align-items-start"><h5 id="alertQALabel" class="modal-title">Q&A for Alert:</h5>` with admin-alert badge section displaying gravatar avatar and username  
- **[HIGH][missing] Question item structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - New component has `<ul>` with `<li class="q">` items containing: q-head (author + timestamp, lines 155-158), q-body with message parsing (159-167), resolved answer display or answer form (169-208). Snapshot shows no actual question markup.  
  - _evidence:_ file19.html has empty modal-body; no question items present  
- **[HIGH][mismatch] Textarea & composer footer** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - New component has simpler `<form class="composer"><textarea placeholder="Ask a question about this alert…">` with only a single 'Send' button with Icon (paper-plane). Removes emoji and image upload icon buttons entirely (snapshot lines 137-161).  
  - _evidence:_ file19.html:99-165 — `<div class="modal-footer"><div id="textAreaHolder"><textarea id="textAreaQATxt" placeholder="Type your question here..." class="txt-area form-control">` with emoji + image icon buttons using fa-smile and fa-image  
- **[MED][mismatch] Close button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - New component uses `<button type="button" class="close" onclick={onClose}>` with Icon component (`<Icon name="times" size={18} />`), replacing Bootstrap's btn-close-white.  
  - _evidence:_ file19.html:91-97 — `<button type="button" data-bs-dismiss="modal" aria-label="Close" class="btn-close btn-close-white"></button>` (Bootstrap button)  
- **[MED][mismatch] Questions list (empty state)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - New component uses conditional rendering: loading state → 'Loading questions…', error state → error message, empty state → 'No questions yet. Be the first to ask.' (line 150). Also has full question list with author/timestamp/body (lines 154-210) not captured in snapshot's empty state.  
  - _evidence:_ file19.html:99-105 — `<div class="modal-body">` with hardcoded message: `There are no questions.` and conditional comments  
- **[MED][mismatch] Modal container classes** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - New component uses custom CSS flexbox: `<div class="dialog">` with `display: flex; flex-direction: column; width: min(34rem, 100%); max-height: 80vh`. No Bootstrap modal-dialog/modal-content classes.  
  - _evidence:_ file19.html:12-13 — `<div class="modal-dialog"><div class="modal-content">` (Bootstrap grid classes)  
- **[MED][missing] Icon handling (close, buttons)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - New component imports and uses custom `<Icon>` Svelte component (line 9) with name props like `icon name="times"` and `icon name="paper-plane"`, replacing raw FontAwesome <i> tags.  
  - _evidence:_ file19.html:144-160 — uses plain `<i class="far fa-smile"></i>` and `<i class="fas fa-image"></i>` FontAwesome icons  
- **[LOW][mismatch] Typo in class attribute** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - New component has no corresponding element; this was a bug in the snapshot.  
  - _evidence:_ file19.html:32 — `clas="d-flex flex-column..."` (typo: 'clas' instead of 'class')  

### `file2.html` — Full trading room page (Angular 17.3.12) — "Mastering The Trade" member session. Contains 
- **[?][mismatch] Sidebar — Users roster section** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Button styling: Reference buttons have specific explicit background colors (#212529 cog, #f4f4f4 reload, #6c757d sort, #45a2ff search). Our version hardcodes these same values in .mini-cog/.mini-reload/.mini-sort/.mini-search CSS (lines 506-526), which matches the reference, but the comment on line 505 flags the cog button color as unverified.  
  - _evidence:_ file2.html:237-360+ \| .active-room-users nav-link with toolbar (user count + mini buttons: cog/reload/sort/search). Reference has these 4 mini buttons with distinct colors (black bg for cog, #f4f4f4 for reload, #6c757d for sort, #45a2ff for search). Our RoomSidebar.svelte:203-223 renders the same structure (roster-head, roster-title + icon, roster-count, roster-actions with 4 .mini buttons).  
- **[?][mismatch] Chat Logs modal — Header & List** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - List item structure differs: Reference uses div > div structure with <strong> + <i> tags for labels/values (3 divs per entry). Our version renders flat flex spans (date/by/channel line 30-33). Reference shows actual log data (dates, users); our version has empty state only (line 22-26 'No logs yet'). Button styling: Reference uses 'btn btn-primary my-2'; our version uses custom .reload styling.  
  - _evidence:_ file2.html:18793-19030+ \| Chat Logs modal body has 'Reload Log List' button (type=button class='btn btn-primary' line 18795-18801), list-group with list-group-item entries (line 18804+). Each entry shows Date (Jun 12, 2026 line 18815), By (admin@protradingroom.com line 18824), Channel (offTopic/main line 18833-18834). Our ChatLogsModal.svelte:15-37 has toolbar with reload button (line 17-19), empty state (line 22-26), list rendering (line 28-36).  
- **[?][mismatch] Alert Logs modal — Header & List** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - List item structure differs (same as ChatLogs): Reference uses nested divs with <strong>/<i> tags; our version uses flat spans. Reference shows actual dates; our version only renders empty state. Alert Logs: Reference shows 2 fields (Date + By), no Channel field. Modal footer: Reference has explicit Close button in modal-footer (line 82257-82265); our version relies on Modal component's default footer behavior (no explicit footer rendering in AlertLogsModa  
  - _evidence:_ file2.html:82194-82226+ \| Alerts Logs modal with 'Reload Log List' button (line 82194-82200), list-group with entries (line 82201+) showing Date (Oct 22, 2023 line 82214) and By (line 82221-82224), no Channel field. Modal footer with Close button (line 82257-82265). Our AlertLogsModal.svelte:15-37 has toolbar, empty state (line 23-26 'No logs yet'), list rendering structure.  
- **[?][mismatch] Muted Users modal** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Title text: Reference says 'Muted Chat Users'; our version says 'Muted / Ignored Users'. Close button styling: Reference uses btn-primary (blue); our version uses btn.ghost (transparent). Icon: Reference likely has no icon visible (empty list context); our version shows volume-mute icon (line 18).  
  - _evidence:_ file2.html:82711 \| Title is 'Muted Chat Users' (line 82711); empty state text 'You don't have any muted/ignored users.' (line 82726); Close button uses 'btn btn-primary' class (line 82738). Our MutedUsersModal.svelte:16 has title 'Muted / Ignored Users' (line 16), same empty message (line 19), Close button uses .btn.ghost class (line 13).  
- **[?][mismatch] Followed Users modal** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Title text: Reference says 'Followed Chat Users'; our version says 'Followed Users'. Close button styling: Reference uses btn-light (gray); our version uses btn.ghost (transparent). Icon: Reference has no visible icon; our version shows users icon (line 18). Our modal is simpler and does not render a list structure like the reference might (though reference shows empty state).  
  - _evidence:_ file2.html:82768 \| Title is 'Followed Chat Users' (line 82768); empty state 'You don't have any followed users.' (line 82786); Close button uses 'btn btn-light' class (line 82798). Our FollowedUsersModal.svelte:16 has title 'Followed Users', same empty message (line 19), Close button uses .btn.ghost class (line 13).  

### `file20.html` — Muted Chat Users Modal
- **[MED][mismatch] Modal Close Button (Header)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap's btn-close and btn-close-white classes; our Modal.svelte uses a custom close button with Icon component. Icon is rendered (Icon name='times') instead of Bootstrap's native close button  
  - _evidence:_ file20.html:20-26 – button.btn-close.btn-close-white with data-bs-dismiss='modal' and aria-label='Close'  
- **[MED][mismatch] Modal Structure (Container)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap modal classes (.modal, .fade, .modal-dialog, .modal-content, .modal-header, .modal-body, .modal-footer); our Modal uses custom classes (.backdrop, .panel, .head, .body, .foot) with custom CSS. Reference has id='mutedUsersModal' and uses aria-labelledby/aria-hidden; our Modal uses role='dialog' and aria-modal='true'  
  - _evidence:_ file20.html:1-9 – app-muted-users-modal > div#mutedUsersModal.modal.fade with role attributes  
- **[MED][mismatch] Modal Body Content** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses plain text in a centered div (text-center); our component wraps content in div.empty (custom styles) and includes an Icon component (volume-mute, size 28) above the paragraph. Reference has no icon; ours renders Icon with styling  
  - _evidence:_ file20.html:28-33 – div.modal-body with div.text-center containing plain text 'You don't have any muted/ignored users.'  
- **[LOW][mismatch] Modal Title** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses 'Muted Chat Users' but our component passes 'Muted / Ignored Users' to the Modal component title prop  
  - _evidence:_ file20.html:15-19 – h5#mutedUsersModalLabel with text 'Muted Chat Users'  
- **[LOW][missing] Modal Backdrop/Overlay** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Our Modal component adds a backdrop div with fixed positioning and semi-transparent background (rgba(0,0,0,0.6)). Reference HTML snippet does not show backdrop (may be handled by Bootstrap off-screen or omitted from snapshot)  
  - _evidence:_ file20.html – no explicit backdrop overlay rendered  

### `file21.html` — FollowedUsersModal - a simple modal displaying "Followed Chat Users" with empty state mess
- **[HIGH][mismatch] Modal Container & Dialog Element** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap 5 modal markup (.modal, .fade, .modal-dialog, .modal-content, .modal-header/body/footer); our Modal renders a custom structure with backdrop, panel (role='dialog'), header (.head), body (.body), footer (.foot) — no Bootstrap classes. Our close button uses Icon component; reference uses btn-close btn-close-white classes. Reference has aria-hidden='true', ours uses aria-modal='true'.  
  - _evidence:_ file21.html:1-9 — <app-followed-users-modal> wrapper with <div id="followedUsersModal" class="modal fade"> using Bootstrap modal classes (modal, modal-dialog, modal-content, modal-header, modal-body, modal-footer); aria-labelledby, aria-hidden, role attributes  
- **[MED][mismatch] Modal Header** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference title is h5 with class 'modal-title'; our Modal uses h2 with class 'title'. Reference close button is Bootstrap btn-close btn-close-white; ours is custom button with Icon child. Reference id is 'followedUsersModalLabel'; ours derives titleId dynamically.  
  - _evidence:_ file21.html:12-26 — <div class="modal-header"> containing <h5 id="followedUsersModalLabel" class="modal-title">Followed Chat Users</h5> and <button class="btn-close btn-close-white"></button>  
- **[MED][mismatch] Modal Body Content** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference body has text-center class with plain text message; our component renders <div class="empty"> with Icon child (users icon, 28px) stacked above message in flex column. Reference is static div; ours has custom styling (flex-direction column, centered, with icon/text gap).  
  - _evidence:_ file21.html:28-32 — <div class="modal-body"> with <div class="text-center">You don't have any followed users.</div> and comment nodes (empty ng-template markers)  
- **[MED][mismatch] Modal Footer** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference footer uses Bootstrap classes (btn, btn-light, data-bs-dismiss); our footer renders button with class 'btn ghost' via snippet. Reference button has no onclick handler; ours calls onClose callback.  
  - _evidence:_ file21.html:34-42 — <div class="modal-footer"> with <button type="button" data-bs-dismiss="modal" class="btn btn-light">Close</button>  
- **[MED][missing] Empty State Icon** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Our implementation includes <Icon name="users" size={28} /> icon in the empty state; reference HTML snapshot shows no icon element in modal-body, only text message.  
  - _evidence:_ N/A in reference file21.html — the reference displays only text, no icon visible  
- **[LOW][mismatch] Modal Title Text** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference displays 'Followed Chat Users'; our FollowedUsersModal passes title='Followed Users' (omits 'Chat').  
  - _evidence:_ file21.html:18 — text 'Followed Chat Users'  

### `file22.html` — app-screenshare-preview: local screen share preview window (Angular, draggable/resizable)
- **[HIGH][missing] Root component wrapper** → ``  
  - Angular component `app-screenshare-preview` is not present in Svelte codebase. Svelte uses functional components (ScreenStage.svelte, WebcamHolder.svelte) instead of Angular selector-based components.  
  - _evidence:_ file22.html:1-2 `<app-screenshare-preview _ngcontent-ng-c977335924="" _nghost-ng-c1065544020="">`  
- **[HIGH][missing] Draggable/resizable container** → ``  
  - jQuery UI draggable/resizable functionality completely absent in Svelte. Svelte components (ScreenStage, WebcamHolder, MainStage) use fixed CSS Grid/Flexbox layout with no floating or resizable overlays.  
  - _evidence:_ file22.html:2-6 `.card.webcamsHolderScreen.ui-draggable.ui-draggable-handle.ui-resizable`; lines 41-72 contain 8 jQuery UI resize handles (ui-resizable-handle ui-resizable-{n,e,s,w,ne,se,sw,nw})  
- **[HIGH][mismatch] Card header with dropdown menu** → ``  
  - ScreenStage.svelte (lines 34-51) has a `.bar` with a `.toggle` button group (single/split layout toggles) using custom Icon components, NOT a dropdown. The close button is in WebcamHolder overlay (lines 137-157), not in a dropdown. MainStage has tabs (lines 85-105) instead of a dropdown header.  
  - _evidence:_ file22.html:8-29 `<h5 class="card-title m-0">` containing `<div ngbdropdown class="d-inline-block dropdown">` with `<button id="dropdownBasic1" ngbdropdowntoggle class="dropdown-toggle btn btn-outline-dark">` and empty `<div ngbdropdownmenu>`  
- **[HIGH][missing] jQuery UI resize handles** → ``  
  - No equivalents in Svelte codebase. The Svelte layout uses Split.svelte (lines 25, 368-376 of [id]/+page.svelte) for resizable split panes between dock and stage, but not for floating window corners/edges. This is a fundamental architectural difference: Angular had draggable floating windows, Svelte has a fixed two-pane layout.  
  - _evidence:_ file22.html:41-72 eight `<div class="ui-resizable-handle ui-resizable-{direction}" style="z-index: 90"></div>` divs  
- **[MED][mismatch] Close button (×)** → ``  
  - WebcamHolder.svelte (lines 58-67) conditionally shows a `.close` button only when `onClose && publisher.isLocal` is true; button uses `<Icon name="times" size={14} />` (custom component), not FontAwesome `fas fa-times`. Additionally, close is rendered inside the video overlay (absolute positioned at bottom-right), not in a header.  
  - _evidence:_ file22.html:30-32 `<span class="float-right p-2"><i class="fas fa-times"></i></span>`  
- **[MED][mismatch] Video element** → ``  
  - WebcamHolder.svelte (line 52) renders `<video {@attach attachTrack(publisher.track)} autoplay muted playsinline></video>` with `muted` and `playsinline` attributes that file22.html lacks. ScreenStage.svelte (line 68) also uses `muted playsinline`. The id and class naming differ (file22 uses single-purpose IDs, Svelte relies on component scope).  
  - _evidence:_ file22.html:34-39 `<video autoplay="autoplay" id="webcamScreenLocalPreview" class="webcamPreviewScreen"></video>`  
- **[LOW][mismatch] Container styling** → ``  
  - Svelte components use custom CSS (ScreenStage.svelte .stage, WebcamHolder.svelte .holder/.card) with CSS custom properties (--border, --bg-elev-2, --radius) and Svelte-specific styling (no Bootstrap classes). The overall architecture is flat containers (not nested card > card-body). ScreenStage has a `.bar` (top bar with count + toggle) and `.tiles` grid; WebcamHolder has `.holder` flex container.  
  - _evidence:_ file22.html:5 `.card.webcamsHolderScreen` with Bootstrap card classes; file22.html:7 `.card-body`  

### `file23.html` — RecPreview component — Recording Preview modal
- **[HIGH][mismatch] Root component wrapper** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference is Angular (<app-rec-preview>) with card/recsHolderScreen classes; ours is Svelte <aside class="rec"> with different styling architecture (CSS variables, flexbox layout, position: fixed)  
  - _evidence:_ file23.html:1-2 `<app-rec-preview _ngcontent-ng-c977335924="" _nghost-ng-c3658149680=""><div _ngcontent-ng-c3658149680="" id="recLocalPreviewHolder" class="card recsHolderScreen">` — Angular component tag with ngContent attributes  
- **[HIGH][mismatch] Card title header** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses h5.card-title with Bootstrap classes (d-inline-block, p-2, text-white); ours uses <header class="head"> with custom CSS variables. Text reads 'Recording Preview. (DELAYED UPTO 20s)' vs ours 'Recording Preview <small>(delayed up to 20s)</small>' (case/punctuation/structure differ)  
  - _evidence:_ file23.html:8-14 `<h5 _ngcontent-ng-c3658149680="" class="card-title m-0"><div _ngcontent-ng-c3658149680="" class="d-inline-block p-2 text-white">Recording Preview. (DELAYED UPTO 20s)</div>` — h5.card-title with nested div using Bootstrap classes  
- **[HIGH][mismatch] Action buttons (expand/minimize and close)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses <span> wrappers with float-right and fa-times/fa-expand icons in Bootstrap style; ours uses <button class="ic"> with custom Icon components (window-minimize/window-maximize then times icon). Icon order reversed in ours (expand/shrink first, close second)  
  - _evidence:_ file23.html:15-26 `<span _ngcontent-ng-c3658149680="" class="float-right p-2"><i _ngcontent-ng-c3658149680="" class="fas fa-times text-white"></i></span><span _ngcontent-ng-c3658149680="" class="float-right p-2 mx-1"><i _ngcontent-ng-c3658149680="" class="fas fa-expand text-white"></i></span>` — two span buttons with fa-* icons  
- **[HIGH][mismatch] Overall structure and styling paradigm** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference is Angular + Bootstrap + Font Awesome; ours is Svelte with scoped CSS and custom Icon component. Layout is fundamentally different: reference is card-based (Bootstrap), ours is fixed position sidebar (position: fixed, right: 1rem, bottom: 1rem). Reference has minimal functionality visible (just 'Recording paused' state), ours has full multi-state recording UI with start/stop/review/save controls and video preview  
  - _evidence:_ file23.html (lines 1-37) — uses Angular directives (_ngcontent-*, _nghost-*), Bootstrap utility classes (card, card-body, card-title, d-inline-block, p-2, m-0, float-right, text-white, text-center, py-4, mx-1), and Font Awesome icons (fas fa-*)  
- **[MED][mismatch] Card body content area** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses div.card-body (Bootstrap); ours uses div.body (custom CSS). Ours has aspect-ratio: 16/9, background: #000000; reference omits these  
  - _evidence:_ file23.html:7 `<div _ngcontent-ng-c3658149680="" class="card-body">` — Bootstrap card-body wrapper  
- **[MED][mismatch] Recording paused message** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference displays message in h4 with text-center, py-4, text-white Bootstrap classes; ours uses <p class="paused"> with custom CSS (color: var(--text-dim), font-size: 0.85rem). Ours also shows error state conditionally: {error ?? 'Recording paused.'} so message may vary  
  - _evidence:_ file23.html:28-33 `<div _ngcontent-ng-c3658149680="" class="text-center py-4 text-white"><h4 _ngcontent-ng-c3658149680="">Recording paused.</h4></div>` — h4.text-center with Bootstrap utilities  

### `file24.html` — FollowedUsersModal
- **[MED][mismatch] Modal structure and classes** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap modal markup (.modal.fade, .modal-dialog, .modal-header, .modal-body, .modal-footer) vs our custom Modal component with custom CSS (backdrop, panel, head, body, foot classes)  
  - _evidence:_ file24.html:8-10 – Bootstrap classes: modal fade, modal-dialog, modal-header, modal-body, modal-footer  
- **[MED][mismatch] Empty state presentation** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference has plain text-center div with message; our component wraps message in .empty div with Icon element (users icon, 28px) above the text  
  - _evidence:_ file24.html:29-30 – <div class="text-center">You don't have any followed users.</div>  
- **[LOW][mismatch] Modal title text** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference title is 'Followed Chat Users' vs our title 'Followed Users'  
  - _evidence:_ file24.html:18 – <h5>Followed Chat Users</h5>  
- **[LOW][mismatch] Close button styling** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap btn btn-light classes vs our custom btn ghost classes with custom hover styling  
  - _evidence:_ file24.html:35-42 – <button class="btn btn-light">Close</button>  
- **[LOW][mismatch] Header close button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap btn-close btn-close-white vs our custom close button with Icon component (times icon, 18px size)  
  - _evidence:_ file24.html:20-26 – <button class="btn-close btn-close-white"></button> (Bootstrap close)  

### `file25.html` — ScheduledAlertsModal — Manage Scheduled Alerts modal
- **[?][mismatch] Modal root & structure** → `ScheduledAlertsModal.svelte:58 — uses cu`  
  - Reference uses explicit Bootstrap modal markup (modal, modal-dialog modal-xl, modal-content, modal-fade); ours abstracts into custom Modal component. Reference has root element app-scheduled-alerts-modal and id="scheduledAlertsModal"; ours delegates to Modal component.  
  - _evidence:_ file25.html:1-12 — `<app-scheduled-alerts-modal>` wraps `<div id="scheduledAlertsModal" class="modal fade text-white">` → `<div class="modal-dialog modal-xl">` → `<div class="modal-content">`  
- **[?][mismatch] Modal header (title & close button)** → `ScheduledAlertsModal.svelte:58 — Modal c`  
  - Reference uses Bootstrap modal-header with h5.modal-title and btn-close btn-close-white; ours uses Modal prop + separate close button in footer with custom styling (btn ghost). Reference close button is icon-only with aria-label, ours is labeled 'Close'.  
  - _evidence:_ file25.html:14-28 — `<div class="modal-header">` with `<h5 id="scheduledAlertsModalLabel" class="modal-title">Manage Scheduled Alerts</h5>` and `<button type="button" data-bs-dismiss="modal" aria-label="Close" class="btn-close btn-close-white"></button>`  
- **[?][mismatch] Modal body content structure** → `ScheduledAlertsModal.svelte:59-111 — Mod`  
  - Reference displays a static 5-column table with no data rows; ours displays a 2-part UI: (1) composer form for scheduling new alerts (Alert + Send at fields + Schedule button), (2) list of scheduled alerts or empty state. Table vs. custom list rendering; reference has 'Sender' and 'Repeat' columns not present in our data model.  
  - _evidence:_ file25.html:30-57 — `<div class="modal-body">` contains `<table class="table table-striped text-white w-100">` with 5 th columns: 'Date / Time', 'Sender', 'Alert', 'Repeat', 'Actions'; empty tbody  
- **[?][mismatch] Modal footer** → `ScheduledAlertsModal.svelte:54-56 — foot`  
  - Reference uses .btn .btn-primary (accent color background); ours uses .btn .ghost (transparent, dim text). Reference uses data-bs-dismiss for Bootstrap modal dismissal; ours calls onClose callback. Button styling differs significantly.  
  - _evidence:_ file25.html:59-68 — `<div class="modal-footer">` with single `<button type="button" data-bs-dismiss="modal" class="btn btn-primary">Close</button>`  
- **[?][missing] Composer form (new alert input)** → `ScheduledAlertsModal.svelte:59-79 — form`  
  - Reference snapshot captures only the empty table state with no composer. Our component includes a form-driven composer for scheduling new alerts—reference does not show this feature.  
  - _evidence:_ file25.html — no form or input fields present in reference  
- **[?][missing] Scheduled alerts list display** → `ScheduledAlertsModal.svelte:81-111 — ul.`  
  - Reference shows table with columns for Sender and Repeat (not in our data model); ours renders as unordered list with only Alert text + formatted Send At time + delete button. Reference is empty, so no actual display of scheduled items; ours shows actual scheduled alerts with custom styling.  
  - _evidence:_ file25.html — table structure with 5 columns but empty tbody; no list item details or delete buttons shown  

### `file26.html` — AlertSendReportModal - loading state view (Bootstrap/Angular)
- **[HIGH][mismatch] Modal root element** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot is Angular with ng-* attributes; our code is Svelte with no framework-specific attrs. Snapshot wraps Bootstrap modal; our code uses custom Modal wrapper component  
  - _evidence:_ file26.html:1-3 — `<app-alert-send-report-modal _ngcontent-ng-c977335924="" _nghost-ng-c752360452="">` (Angular component with ng-content/ng-host attributes)  
- **[HIGH][mismatch] Modal structure (dialog, classes, attributes)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot uses Bootstrap `.modal.fade` / `.modal-dialog` / `.modal-content` structure; our code uses `.backdrop` + `.panel` (role=dialog, aria-modal=true, aria-labelledby, tabindex=-1)  
  - _evidence:_ file26.html:4-12 — `<div id="alert-send-report-modal" role="dialog" aria-labelledby="alert-send-report-modal" class="modal fade">` with `.modal-dialog` and `.modal-content` children  
- **[HIGH][mismatch] Modal header / title** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot: h5 in `.modal-header` div. Our code: h2 id={titleId} in `.head` element. Snapshot shows incomplete text (no ID value); our code shows computed title with alertId or em dash fallback (line 28 of AlertSendReportModal.svelte)  
  - _evidence:_ file26.html:15-18 — `<div class="modal-header"><h5>Alert Sent Report. AlertID:</h5>` (no alertId populated in snapshot)  
- **[HIGH][mismatch] Modal body content** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot shows loading state only (spinner + 'Loading...'). Our code renders full delivery report: summary section (Icon 'paper-plane', description text), stats grid with 4 metric cards (recipients/delivered/push/opened with icons), and info note about placeholder figures  
  - _evidence:_ file26.html:27-38 — `.modal-body` with loading spinner (`.text-center.my-4`, `<i class="fas fa-spinner fa-spin">`, 'Loading...' text) and empty comments  
- **[MED][mismatch] Close button (header)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot: Bootstrap `.btn-close.btn-close-white` (data-bs-dismiss). Our code: `.close` button with Icon component (name='times', size=18), custom onclick={onClose} handler  
  - _evidence:_ file26.html:19-25 — `<button type="button" data-bs-dismiss="modal" aria-label="Close" class="btn-close btn-close-white"></button>`  
- **[MED][mismatch] Modal footer / action buttons** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot: `.modal-footer.text-center` with `.btn.btn-secondary` button. Our code: `.foot` with `.btn.ghost` button (ghost styling, not secondary). Snapshot is centered; our code uses flex-end layout (right-aligned)  
  - _evidence:_ file26.html:39-51 — `.modal-footer.text-center` with single `<button class="btn btn-secondary">Close</button>`  
- **[MED][mismatch] Icon library** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot uses Font Awesome classes (fas fa-*). Our code uses custom `<Icon>` component with named icons ('paper-plane', 'check-circle', 'bell', 'envelope-open', 'info-circle', 'times')  
  - _evidence:_ file26.html:30-32 — `<i class="fas fa-spinner fa-spin"></i>` (Font Awesome icon, loading spinner)  

### `file27.html` — AllUserPmModal (Angular + Bootstrap version from protradingroom.com snapshot)
- **[HIGH][mismatch] Modal container wrapper** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Angular component wrapper (app-all-user-pmmodal) with Bootstrap classes (modal fade); ours uses Svelte component with custom modal via Modal.svelte wrapper. Reference has _ngcontent/_nghost attributes, id='all-user-pm-modal', and aria-hidden=true; ours generates dynamic aria-labelledby and uses open boolean prop.  
  - _evidence:_ file27.html:1-2, <app-all-user-pmmodal _ngcontent-... _nghost-...><div id="all-user-pm-modal" role="dialog" aria-hidden="true" class="modal fade">  
- **[HIGH][mismatch] Modal header structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap modal-header with h5 title and btn-close btn-close-white button; ours uses custom header with h2 title and Icon-based close button with custom close class. Reference data-bs-dismiss and Bootstrap close button; ours uses onclick handler.  
  - _evidence:_ file27.html:13-24, <div class="modal-header"><h5>All private messages:</h5><button type="button" data-bs-dismiss="modal" aria-label="Close" class="btn-close btn-close-white"></button>  
- **[HIGH][missing] Loading state UI** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference has explicit loading state div with Font Awesome spinner icon and 'Loading...' text; current Svelte version only shows empty state (no messages) but lacks visual loading spinner feedback. Reference uses fas fa-spinner fa-spin icon and centered text-center my-4 classes; ours shows Icon name='envelope' for empty only.  
  - _evidence:_ file27.html:27-35, <div class="text-center my-4"><h5><i class="ml-2 fas fa-spinner fa-spin"></i>Loading...</h5></div>  
- **[MED][mismatch] Modal body container** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap modal-body class; ours uses custom 'body' class with padding and overflow-y: auto styles. Reference lacks explicit body styling; ours has 0.9rem font-size and 1.5 line-height.  
  - _evidence:_ file27.html:26, <div _ngcontent-... class="modal-body">  
- **[MED][mismatch] Modal footer structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap modal-footer with text-center and btn btn-secondary classes; ours uses custom footer slot with 'btn ghost' class. Reference button is centered and secondary-styled; ours is flex right-aligned with ghost styling (transparent bg, text-dim color).  
  - _evidence:_ file27.html:37-49, <div class="modal-footer text-center"><button type="button" data-bs-dismiss="modal" class="btn btn-secondary">Close</button></div>  
- **[MED][mismatch] Close button styling** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap btn-close btn-close-white (white X icon); ours uses custom close button with Icon name='times' and custom styling. Reference is data-bs-dismiss; ours uses onclick handler.  
  - _evidence:_ file27.html:18-24, <button ... class="btn-close btn-close-white"></button> (Bootstrap close)  
- **[MED][mismatch] Spinner icon** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Font Awesome fas fa-spinner fa-spin icon; if ours were to add loading state, it would use Icon component. Reference uses <i> tag with classes; ours would use <Icon name='...' /> component.  
  - _evidence:_ file27.html:29-32, <i class="ml-2 fas fa-spinner fa-spin"></i> (Font Awesome)  
- **[MED][missing] Thread list structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference snapshot only shows loading state with empty <!-- --> placeholders for actual thread list; current implementation has ul.threads with li.thread items containing avatar, meta (name/preview), and when time. Reference does not show actual populated thread UI in this snapshot.  
  - _evidence:_ file27.html:36 (<!-- --> placeholders for threads content)  

### `file28.html` — Alerts Advanced Search Modal (app-alerts-advanced-search) - old Angular Bootstrap implemen
- **[HIGH][mismatch] Modal Component Root** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: Angular component with ng-specific attributes (_ngcontent, _nghost, _ngcontent-ng-*). New: Svelte component (<Modal>) wrapper - no Angular framework remnants. Old uses HTML <div> with 'modal fade' classes; new uses Svelte-rendered backdrop with CSS styling.  
  - _evidence:_ file28.html:1-3 <app-alerts-advanced-search _ngcontent-ng-c977335924="" _nghost-ng-c2037626149=""></app-alerts-advanced-search>  
- **[HIGH][mismatch] Modal Dialog Structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: Bootstrap modal classes (modal, fade, modal-dialog, modal-content); uses aria-hidden="true" initially. New: Custom Svelte backdrop with conditional rendering; uses aria-modal="true" (ARIA 1.2 compliant); no Bootstrap classes; dynamic backdrop/panel structure.  
  - _evidence:_ file28.html:4-12 uses <div id="alerts-advanced-search-modal" role="dialog" aria-hidden="true" class="modal fade"> with aria-labelledby referencing the same id  
- **[HIGH][mismatch] Modal Header & Close Button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: uses <div class="modal-header"> and <h5> for title, Bootstrap's btn-close-white; nested title button inside h5. New: uses semantic <header class="head"> with <h2> title and separate close button with Icon component; no Bootstrap btn-close class.  
  - _evidence:_ file28.html:15-36 contains <div class="modal-header"> with <h5> title and button with class="btn-close btn-close-white" (Bootstrap close button)  
- **[HIGH][mismatch] Title Header with Rooms Button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: title is 'Alerts Advanced Search' with a separate 'Rooms' refresh button (btn-info style) in the same h5. New: title is just 'Alerts Advanced Search' in a simple h2; no Rooms button in the modal header.  
  - _evidence:_ file28.html:16-28 has <h5> wrapping title + inline <button class="btn btn-info btn-sm mx-1"> with fa-sync-alt icon and 'Rooms' text  
- **[HIGH][mismatch] CSS Styling Approach** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: Angular encapsulated styles (view encapsulation) with Bootstrap framework for all styling. New: Svelte scoped <style> block with custom CSS variables (--text-dim, --bg-elev, --border, --accent, --radius) and no Bootstrap dependency.  
  - _evidence:_ file28.html uses _ngcontent and _nghost attributes + Bootstrap classes (modal, btn-light, form-control, d-flex, etc.)  
- **[HIGH][mismatch] Dropdown Interaction Pattern** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: Bootstrap dropdown library handles toggle/open/close. New: native HTML <select> element (browser-native behavior); no JavaScript dropdown logic needed.  
  - _evidence:_ file28.html: lines 51-63 (trader) and 235-247 (rooms) use data-bs-toggle="dropdown" with Bootstrap dropdown behavior  
- **[MED][mismatch] Trader Dropdown Structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: Bootstrap dropdown component with dropdown-toggle, dropdown-menu classes, individual dropdown-item <a> elements rendered in template. New: native HTML <select> element with <option> children populated by traders prop array via {#each}; no dropdown markup.  
  - _evidence:_ file28.html:49-230 uses Bootstrap dropdown with <button class="btn btn-light dropdown-toggle"> controlling <ul class="dropdown-menu"> with 20 <li><a class="dropdown-item"> entries (Allison, Big Bad Voodoo Daddy, etc.)  
- **[MED][mismatch] Rooms Dropdown Structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: Bootstrap dropdown-room-select with button/ul/li/a markup; hardcoded room list. New: native HTML <select> with <option> elements bound to rooms prop via {#each}.  
  - _evidence:_ file28.html:233-277 uses Bootstrap dropdown (button + ul with 3 li/a items: Showcase Room, Mastering The Trade, Tr3ndy Trading)  
- **[MED][mismatch] Trader Dropdown Hardcoded Data** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: traders list baked into HTML template. New: traders is a prop parameter (default []); allows dynamic population from parent component or API.  
  - _evidence:_ file28.html:68-227 lists 20 traders hardcoded in template (Allison, Big Bad Voodoo Daddy, Bruce Marshall, Chris Brecher, Danielle Shay, Heather, Henry, JC, Kody Ashmore, Lorna St. George, Melissa Beegle, Mirza Catic, Omer Krdzic, RH, Sam, ST_Neil, Taylor, TG Watkins, Trendy Jon, CML Alert Bot)  
- **[MED][mismatch] Rooms Dropdown Hardcoded Data** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: rooms list hardcoded. New: rooms is a prop parameter (default []); allows dynamic population.  
  - _evidence:_ file28.html:252-276 lists 3 rooms (Showcase Room, Mastering The Trade, Tr3ndy Trading)  
- **[MED][mismatch] Search Term Input Field** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: id=search-term-input, type=search, placeholder='Type your search term', class=form-control (Bootstrap). New: id={formId}-term, type=text, placeholder='e.g. $SPX, breakout, trim'; uses custom CSS (no Bootstrap form-control); wrapped in a .field div with label.  
  - _evidence:_ file28.html:280-289 uses <input id="search-term-input" type="search" placeholder="Type your search term" class="form-control">  
- **[MED][mismatch] Form Layout - First Row (Dropdowns + Search)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: Bootstrap flex utilities (d-flex, align-items-center, justify-content-between, flex-wrap, mb-2) on outer container. New: form uses .form with flex-direction: column, .grid for 2-column layout; search term and dropdowns appear in separate sections; no mb-2 or flex wrapping.  
  - _evidence:_ file28.html:39-290 uses <div class="d-flex align-items-center justify-content-between flex-wrap mb-2"> wrapping trader/room dropdowns and search input in one row  
- **[MED][mismatch] Checkboxes - Non Trade Alert & Also search archives** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: Bootstrap form-check/form-check-input/form-check-label classes; each checkbox in its own div with separate label. New: <label class="check"> wrapping <input type="checkbox"> directly; .checks container uses flexbox with gap; more compact layout.  
  - _evidence:_ file28.html:298-329 uses two <div class="form-check"> containers with <input type="checkbox"> and <label class="form-check-label">  
- **[MED][mismatch] Date Input Section Structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: uses .date-input-container with Bootstrap flex classes (d-flex, align-items-center, flex-wrap, m-1) and labels inline with inputs using me-1. New: uses .grid layout (grid-template-columns: 1fr 1fr) with .field children, labels above inputs.  
  - _evidence:_ file28.html:331-367 has .date-input-container with two inner divs (.d-flex), each containing label + datetime-local input  
- **[MED][mismatch] Modal Footer Buttons** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: uses Bootstrap modal-footer class with d-flex, justify-content-end; buttons are btn btn-primary and btn btn-secondary with m-2 margins; fa-search icon. New: Footer snippet renders two buttons with custom classes (btn ghost and btn primary); uses Icon component for search; buttons wrapped in footer with custom flex layout.  
  - _evidence:_ file28.html:380-405 uses <div class="modal-footer d-flex align-items-center justify-content-end"> with two buttons: primary 'Search' (with fa-search icon) and secondary 'Close'  
- **[MED][mismatch] Overall Form Structure Organization** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: multi-row horizontal layout with Bootstrap grid/flex utilities and absolute positioning of date inputs. New: vertical flex layout (.form) with distinct sections: search term, checkboxes, dates in grid, traders/rooms in grid; cleaner separation of concerns.  
  - _evidence:_ file28.html:38-378 sections: row1 (dropdowns+search), row2 (checkboxes+dates), empty state div  
- **[LOW][mismatch] Modal Body Empty State** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: displays 'No logs to display' message in the modal body when no search results. New: AdvancedSearchModal does not render a results table or empty state; it appears to be purely a search criteria form.  
  - _evidence:_ file28.html:369-377 contains <div class="w-100"><div class="mt-4 pt-4 text-center">No logs to display. Please, change the input fields.</div></div>  
- **[LOW][mismatch] Button Icons - Rooms & Search** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Old: uses Font Awesome classes (fas fa-sync-alt, fas fa-search) directly. New: uses custom Icon component (<Icon name="search" size={14} />) with proprietary icon naming; no Rooms button in new version.  
  - _evidence:_ file28.html:23-26 (Rooms button): <i class="fas fa-sync-alt me-1"></i>; file28.html:391-394 (Search button): <i class="fas fa-search me-1"></i>  

### `file29.html` — AlertFilterModal (alert filter dialog)
- **[HIGH][mismatch] Empty State Placeholder** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference shows plain `<p>List is empty.</p>`; ours renders custom `.empty` div with Icon(name='filter') + `<p>No people selected yet.</p>` (icon + different message)  
  - _evidence:_ file29.html:42: `<p>List is empty.</p>`  
- **[HIGH][mismatch] Modal Footer Button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference button label is 'Close' with Bootstrap btn btn-secondary classes and data-bs-dismiss; ours is 'Done' with custom .primary class (accent color, no Bootstrap)  
  - _evidence:_ file29.html:49-55: `<button type="button" data-bs-dismiss="modal" class="btn btn-secondary">Close</button>`  
- **[HIGH][missing] List Container (empty state wrapper)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference shows inline empty text in modal-body; ours has explicit `.list` container with min-height/border that displays .empty state. Reference lacks visible container; ours always shows bordered list area (dimmed when checkbox unchecked).  
  - _evidence:_ file29.html:26: `<div class="modal-body pt-1">` contains form-check and `<p>List is empty.</p>` directly; no visible list container for selected people  
- **[MED][mismatch] Modal Title (header h5)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference title is 'Filter out alerts from the following:' (with line break); ours is 'Filter out alerts' (abbreviated)  
  - _evidence:_ file29.html:14-16: `<h5>Filter out<!----><!---->alerts from the following:</h5>`  
- **[MED][mismatch] Checkbox Input & Label (form-check)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap form-check classes and m-2 margin; ours uses custom .check class with flexbox gap/align-items. Reference wraps label text with colon; ours omits colon.  
  - _evidence:_ file29.html:27-40: `<div class="form-check m-2"><input type="checkbox" id="show-alerts" class="form-check-input"/><label for="show-alerts" class="form-check-label">Only show alerts from these people:</label></div>`  
- **[MED][mismatch] Modal Footer Container** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap modal-footer with justify-content-between; ours uses custom .foot class with flex-end (button aligns right, no space-between)  
  - _evidence:_ file29.html:45-47: `<div class="modal-footer d-flex align-items-center justify-content-between">`  
- **[MED][mismatch] Modal Container Structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap modal classes (modal, fade, modal-dialog, modal-content); ours uses custom .backdrop, .panel with Svelte semantics (aria-modal, onclick handlers). Reference has Bootstrap fade transition; ours relies on CSS/Svelte transitions.  
  - _evidence:_ file29.html:2-10: `<div id="alert-filter-modal" role="dialog" class="modal fade"><div role="document" class="modal-dialog"><div class="modal-content">`  
- **[LOW][mismatch] Close Button (modal-header)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap btn-close btn-close-white (empty button); ours renders Icon(name='times') inside button with custom .close class  
  - _evidence:_ file29.html:18-24: `<button type="button" data-bs-dismiss="modal" aria-label="Close" class="btn-close btn-close-white"></button>`  

### `file3.html` — file3.html — Angular 17.3.12 full-page trading room snapshot (legacy reference)  _(dup of A — this is a complete room page with integrated modals)_
- **[HIGH][mismatch] Framework Mismatch: Angular → Svelte** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - The reference HTML is from an Angular 17 version of the app. The current implementation is a full Svelte rewrite using SvelteKit. All component architecture, rendering, and state management differs fundamentally.  
  - _evidence:_ file3.html:1 `<app-root _nghost-ng-c4243810522="" ng-version="17.3.12">` vs. current codebase uses @sveltejs/kit (package.json shows `@sveltejs/kit ^2.63.0`, `svelte ^5.56.1`)  
- **[HIGH][mismatch] Main Room Container & Layout** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap flexbox + Angular Split library (`as-split`, `as-split-area`). Svelte version uses native CSS and a custom Split.svelte abstraction. Both achieve responsive side-by-side/stacked layouts but with different tech.  
  - _evidence:_ file3.html:3-12 `<app-room class="lightTheme" id="topRoomDiv"><div class="wrapper"><div class="d-flex flex-column-reverse flex-sm-row room-container"><div class="room-sidebar">...` with nested navbar, sidebar, split-area layout using `<as-split>` (Angular library)  
- **[HIGH][mismatch] General Settings Modal (user-settings-modal id, 3 tabs: App/Alert/Chat)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap tab nav + radio buttons. Svelte likely uses simpler toggle/tabbed UX. Theme options and layout selectors may be exposed differently.  
  - _evidence:_ file3.html:16394-17721 modal with `<ul id="userSettingsTab" class="nav nav-tabs">` containing 3 tabs (app-settings, alert-settings, chat-settings) + tab-content with radio inputs for color theme (app-light-theme, app-dark-theme ids) and room layout (chat-alerts-left, chat-alerts-right, etc. ids)  
- **[HIGH][mismatch] Root App Structure (app-root, router-outlet)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference is Angular app-root + router-outlet. Svelte uses file-based routing (+layout.svelte, +page.svelte).  
  - _evidence:_ file3.html:1-2 `<app-root _nghost-ng-c4243810522="" ng-version="17.3.12"><router-outlet></router-outlet>...`  
- **[MED][mismatch] Left Sidebar (room-sidebar class)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap navbar + HTML `<ul><li>` with data-bs-toggle/target attributes for modals. Svelte version likely uses component state bindings + Svelte click handlers. Navigation items structurally similar but implementation differs.  
  - _evidence:_ file3.html:14-340 sidebar navbar with `class="navbar navbar-nav"`, items: `<li class="nav-item">` with titles like Connectivity Check (id="webrtc-troubleshooter-modal"), General Settings (id="user-settings-modal"), Archives dropdown, Manage Muted Users, Manage Followed Users, Users section with <app-room-roster>  
- **[MED][mismatch] Top Navbar (mainAppNav class, navbarsRoom id)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap navbar with data-bs-collapse/toggle attributes. Svelte uses component state & click handlers. IDs present in reference (dropdownVolume, navbarsRoom) may or may not exist in Svelte version.  
  - _evidence:_ file3.html:343-643 `<nav class="navbar navbar-expand-md navbar-dark fixed-top mainAppNav">` with: sidebar-menu toggle, users count, mobile-app button, brand logo (cssLogo id), navbar-toggler, items in `#navbarsRoom` div including talkingIndicator, volume dropdown (dropdownVolume), reload button  
- **[MED][mismatch] Alert Chat Dock (left/right split content area)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses nested `<as-split>` (vertical) + `<app-roomscroller>` + `<app-st-message>` (Angular components). Svelte version uses custom Split.svelte + AlertFeed.svelte + ChatPanel.svelte. Core surface (alerts feed on top, chat feed below, switchable) is preserved but component internals differ.  
  - _evidence:_ file3.html:644-12400+ `<as-split id="mainAreaSplit"><as-split-area class="alert-chat-box">...<app-alerts>...navbar with Alerts heading, icon fa-bell...<app-roomscroller> for message list, containing <app-st-message> components repeating  
- **[MED][mismatch] User Modal (user-modal id, edit-user-avatar, modal-title badge, buttons)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap modal with badge + gravatar img. Svelte version likely uses Dialog component + different badge style. Button order/labels may differ.  
  - _evidence:_ file3.html:16228-16316 `<div id="user-modal" class="modal fade"><div class="modal-content"><div class="modal-header"><div class="edit-user-avatar"><img src="gravatar..."></div><h3 class="modal-title"><span class="badge badge-danger">Offline</span></h3>...` with footer buttons: @Mention, Private Chat, Follow, Mute, Close  
- **[MED][mismatch] Audio/Video Settings Modal (av-settings-modal id, device selectors)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses nested navbar for menu structure inside modal. Svelte likely uses form controls or radio/select elements. Device selection UI may differ.  
  - _evidence:_ file3.html:17722-17950+ `<div id="av-settings-modal" class="modal fade"><h5>Audio/Video Settings</h5>` with navbar-based menu in modal body: Disable Video (saves bandwidth), Choose Speakers (`<select id="speakers-device">`), Choose Microphone, etc.  
- **[MED][mismatch] Alert Modal (alert-modal id, alert list with quick-actions)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference modal structure vs. Svelte alert handling. The current app may handle alerts in the main feed rather than a dedicated modal.  
  - _evidence:_ file3.html:18020+ `<div id="alert-modal" class="modal fade">` containing tabs/list of alerts with details and action buttons  
- **[MED][mismatch] Connectivity Check / WebRTC Troubleshooter Modal (webrtc-troubleshooter-modal id)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Modal exists in both. The Svelte version may have different diagnostic UI.  
  - _evidence:_ file3.html:83448-83587 `<div id="webrtc-troubleshooter-modal" class="modal fade">` with connection diagnostic content  
- **[MED][mismatch] Rich Text Editor Modal (rteModal id, msgTxtContainer, Send button)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Modal exists in both. The rich text editor implementation likely differs (editor library/framework).  
  - _evidence:_ file3.html:83587-83641 `<div id="rteModal" class="modal fade"><h5>Rich Text Editor</h5><div id="msgTxtContainer"></div>` with Close/Send buttons  
- **[MED][mismatch] Private Chat Component (privchatCompHolder id, privChatHolder class)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Angular app-privchat component with navbar styling. Svelte version uses PrivateChat.svelte with different internal structure.  
  - _evidence:_ file3.html:83642-83712 `<app-privchat id="privaChatCompHolder" class="privChatHolder"><div class="chat d-flex flex-column"><nav class="navbar... chat-nav-pm"><i class="fas fa-comments"></i>...No active chat` with settings gear icon  
- **[MED][mismatch] Session Control Modal & Related (session-control-modal id, pollModalCompHolder, alertQAMod** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - All modals exist in the Svelte codebase. Reference Angular version uses Bootstrap modal API (data-bs-toggle, data-bs-target). Svelte version uses component state + Svelte reactivity. Internal form controls, button labels, and UX flows may differ.  
  - _evidence:_ file3.html: Multiple modals (ids: session-control-modal, pollModalCompHolder/poll modal, alertQAModal, replyModal, scheduledAlertsModal, alert-filter-modal, alerts-advanced-search-modal, alert-send-report-modal, all-user-pm-modal, debug-log-modal) each with modal-content structure  
- **[MED][mismatch] CSS Classes & Styling (Bootstrap v5, FontAwesome icons)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap for layout/components. Svelte version uses Tailwind CSS for styling. Icons (FontAwesome) are present in both but class syntax differs.  
  - _evidence:_ file3.html uses throughout: Bootstrap classes (navbar, modal, btn, form-*, d-flex, flex-*, etc.), FontAwesome 5.8.1 icons (`fas fa-*`, `fa-*`)  
- **[LOW][mismatch] Chat Logs Modal (chat-logs-modal id)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Modal exists in both. Svelte implementation details differ.  
  - _evidence:_ file3.html:18591-18700+ `<div id="chat-logs-modal" class="modal fade">` for exporting/viewing chat history  
- **[LOW][mismatch] Alert Logs Modal (alerts-logs-modal id)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Similar to Chat Logs Modal — surface present in both but implementation differs.  
  - _evidence:_ file3.html:81986-82093 `<div id="alerts-logs-modal" class="modal fade">` for alert history  
- **[LOW][mismatch] Muted Users Modal (mutedUsersModal id)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Modal exists in both frameworks. Svelte implementation details differ.  
  - _evidence:_ file3.html: `<div id="mutedUsersModal">` managing user mutes with list + remove buttons  
- **[LOW][mismatch] Followed Users Modal (followedUsersModal id)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Modal exists in both. Implementation differs.  
  - _evidence:_ file3.html: `<div id="followedUsersModal">` for managing followed users  
- **[LOW][mismatch] Mobile App Info Modal (mobileAppInfoModal id)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Modal exists in both. Svelte implementation may differ.  
  - _evidence:_ file3.html: `<div id="mobileAppInfoModal">` triggered by data-bs-target="#mobileAppInfoModal" in sidebar and top nav  
- **[LOW][mismatch] Play YouTube Modal (play-youtube-modal id)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Modal exists in both. Implementation differs.  
  - _evidence:_ file3.html:16322-16394 `<div id="play-youtube-modal" class="modal fade"><h5>Play YouTube For All</h5>` with iframe/input for YouTube URL  

### `file30.html` — WebRTC Troubleshooter Modal (Angular snapshot)
- **[HIGH][mismatch] Status Item Labels** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses verbose labels with 'Enabled' and 'Server Connectivity' suffixes; our component uses short labels ('UDP', 'TCP', 'STUN', 'TURN') with dynamic state labels ('Pending', 'Passed', 'Failed')  
  - _evidence:_ file30.html:41-42, 53-54, 65-66, 77-78: Labels are 'UDP Enabled', 'TCP Enabled', 'STUN Server Connectivity', 'TURN Server Connectivity'  
- **[HIGH][mismatch] Status Item Structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference nests label + status indicator as siblings in a div; our component renders an `<li>` with three flex children: dot, name, state (showing 'Pending'/'Passed'/'Failed')  
  - _evidence:_ file30.html:37-48 (example): `<div class="status-item mb-3"><span class="fw-medium">UDP Enabled</span><span class="status-icon pending">●</span></div>`  
- **[MED][mismatch] Modal Title** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference shows 'Connectivity/Mic Troubleshooter'; our component renders 'Connectivity Check' (title prop in Modal component)  
  - _evidence:_ file30.html:19-21: `<h3 class="modal-title">Connectivity/Mic Troubleshooter</h3>`  
- **[MED][mismatch] Status Indicator Rendering** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference renders text bullet '●' inside span with status class; our component uses CSS-styled circular dot (10x10px border-radius: 50%)  
  - _evidence:_ file30.html:43-46, 56-59, 68-71, 80-83: `<span class="status-icon pending"><!---->●<!----></span>` (inline bullet with CSS class for color)  
- **[MED][mismatch] Footer Button: Start Test** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference button has fa-play icon and btn-primary Bootstrap class; our component has no icon, custom .btn.primary styling, and shows 'Testing…' when running  
  - _evidence:_ file30.html:90-97: `<button class="btn btn-primary"><i class="fas fa-play"></i>Start Test</button>`  
- **[MED][mismatch] Modal Container & Accessibility** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference is Angular with Bootstrap modal framework; our component is Svelte using custom Modal wrapper with custom CSS (--accent, --bg-elev, --border, --radius CSS variables)  
  - _evidence:_ file30.html:1-16: Angular `<app-webrtc-troubleshooter>` host with Bootstrap `modal fade` structure, aria attributes, data-bs-dismiss handlers  
- **[LOW][mismatch] Introductory Text** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference text: 'This tool checks your network and connectivity to essential WebRTC servers.'; our component: 'Run a quick connectivity check to confirm the room can reach our media servers.' with icon (plug)  
  - _evidence:_ file30.html:33-36: `<p class="text-muted mb-4">This tool checks your network and connectivity to essential WebRTC servers.</p>`  
- **[LOW][mismatch] Footer Button: Copy Results** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses btn-success Bootstrap class; our component uses .btn.ghost custom styling with Icon component for copy icon  
  - _evidence:_ file30.html:98-104: `<button class="btn btn-success"><i class="fas fa-copy"></i>Copy Results</button>`  
- **[LOW][mismatch] Footer Button: Close** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses btn-secondary Bootstrap class with data-bs-dismiss; our component uses .btn.ghost custom styling with onclick handler  
  - _evidence:_ file30.html:105-112: `<button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>`  

### `file31.html` — RichTextEditor Modal - Angular Bootstrap snapshot
- **[HIGH][mismatch] Modal root element** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot uses Angular component `<app-rich-text-editor>` with Bootstrap `.modal` classes; our component uses Svelte with custom `<Modal>` wrapper (Modal.svelte:37-74) that renders a `.backdrop` div with nested `.panel` containing `role='dialog'`  
  - _evidence:_ file31.html:1-2 `<app-rich-text-editor>` wrapping `<div id='rteModal' class='modal fade'>`  
- **[HIGH][mismatch] Modal structure and dialog semantics** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot: Bootstrap modal with `.modal-dialog` > `.modal-content` > `.modal-header/.modal-body/.modal-footer` structure. Ours: Custom `.backdrop` (fixed overlay) > `.panel` (dialog) with `.head/.body/.foot` sections. Title is in `<h2>` not `<h5>`, and uses dynamic `titleId` instead of hardcoded `rteLabel`  
  - _evidence:_ file31.html:2-9 has `id='rteModal' tabindex='-1' aria-labelledby='rteLabel' aria-hidden='true' class='modal fade'`; nested `.modal-dialog` > `.modal-content`  
- **[HIGH][mismatch] Modal body content area** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot shows generic placeholder `msgTxtContainer`; ours renders RTE-specific content: `.rte` div with `.toolbar`, optional `.link-bar`, and contenteditable `.editor` with full formatting UI (Bold, Italic, Underline, Bullet List, Link buttons)  
  - _evidence:_ file31.html:28-29 has `.modal-body` with empty `<div id='msgTxtContainer'></div>`  
- **[HIGH][missing] Toolbar structure (when editor visible)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot is a static capture of the modal shell with no editor content. Ours includes full toolbar with `.toolbar` div, `role='toolbar'` aria-label, and 5 tool buttons (Bold, Italic, Underline, Bullet List, Link) each with Icon child  
  - _evidence:_ file31.html shows no toolbar structure—only empty `msgTxtContainer`  
- **[HIGH][missing] Editor input area (when visible)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot lacks the contenteditable editor. Ours has `<div id='rte-editor' class='editor' contenteditable='true' role='textbox' aria-multiline='true' aria-label='Message body'>`  
  - _evidence:_ file31.html shows no editor or contenteditable element—only empty placeholder div  
- **[HIGH][missing] Link composer (when link tool active)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot does not include the optional `.link-bar` with label, input, and buttons. Ours conditionally renders `{#if linkOpen}` with label, url input, 'Add' and 'Cancel' buttons  
  - _evidence:_ file31.html shows no link input UI  
- **[MED][mismatch] Modal header** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot uses Bootstrap `.modal-header` with `.btn-close` (X button). Ours uses custom `.head` with `<h2>` and Icon component for close (`<Icon name='times' size={18} />`). Title text is 'Rich Text Editor' in snapshot vs. 'Rich Text' in RichTextEditorModal.svelte:135  
  - _evidence:_ file31.html:12-26 has `.modal-header` with `<h5 id='rteLabel' class='modal-title'>Rich Text Editor</h5>` and `<button class='btn-close btn-close-white'>`  
- **[MED][mismatch] Modal footer** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot uses Bootstrap `.modal-footer` with `.d-flex justify-content-between w-100 align-items-center` and `.btn btn-secondary/.btn btn-primary`. Ours renders custom `.foot` (flex end-aligned) with buttons using custom `.btn.ghost` and `.btn.primary` classes. Button order differs: snapshot is 'Close' then 'Send', ours is also 'Close' then 'Send' (same order but different CSS)  
  - _evidence:_ file31.html:31-52 has `.modal-footer` with flexbox wrapper and two buttons: 'Close' (secondary) and 'Send' (primary)  
- **[LOW][mismatch] Close button styling** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot uses Bootstrap `.btn-close` classes. Ours uses custom `.close` button with Icon component inside. Snapshot has no aria-label, ours has `aria-label='Close dialog'`  
  - _evidence:_ file31.html:20-26 header close button: `<button class='btn-close btn-close-white'></button>`  

### `file32.html` — Private chat component — empty state (Angular Bootstrap snapshot)
- **[HIGH][mismatch] Root element tag** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Angular component tag <app-privchat>; ours is <section class="priv-chat"> (Svelte semantic HTML)  
  - _evidence:_ file32.html:1 <app-privchat id="privaChatCompHolder" class="privChatHolder">  
- **[HIGH][mismatch] Navbar/Header structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap navbar classes (.navbar, .navbar-expand-lg, .navbar-light, .bg-light); ours uses semantic <header> with CSS Grid/Flexbox  
  - _evidence:_ file32.html:12-49 uses <nav class="navbar navbar-expand-lg navbar-light bg-light chat-nav-pm"> with Bootstrap classes  
- **[HIGH][mismatch] Body container structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference shows empty state div (.flex-fill .p-3 .text-center); ours shows full messaging UL with conditional empty state  
  - _evidence:_ file32.html:52 <div class="d-flex h-100 pc-body"> with nested message container  
- **[HIGH][missing] Message composer form** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference snapshot captures only the empty state view; ours includes complete message input interface. This is a partial capture.  
  - _evidence:_ file32.html snapshot shows ONLY empty state, no form/textarea visible (lines 52-59)  
- **[MED][mismatch] Icon markup** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses raw <i> with Font Awesome classes (fas fa-*); ours abstracts to Icon component with name prop  
  - _evidence:_ file32.html:17 <i class="fas fa-comments"></i>; file32.html:35-39 <i class="fas fa-cog chat-header-gear"></i>; file32.html:44-46 <i class="fas fa-times"></i>  
- **[MED][mismatch] Component wrapper classes** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: .privChatHolder (camelCase); ours: .priv-chat (kebab-case, CSS convention)  
  - _evidence:_ file32.html:4 class="privChatHolder"  
- **[LOW][mismatch] Settings button title attribute** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses title attribute on icon; ours uses aria-label on button (accessibility best practice)  
  - _evidence:_ file32.html:37 title="Settings" on <i> tag  
- **[LOW][mismatch] Empty state message** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference text: 'No active chat'; ours: 'No messages yet — say hello.' (different empty state semantics)  
  - _evidence:_ file32.html:54-57 "No active chat" in .flex-fill .p-3 .text-center  

### `file33.html` — Toast notification overlay container — minimal structural snapshot showing the reference a
- **[HIGH][missing] Toast notification overlay container** → `Not found in /Users/billyribeiro/Desktop`  
  - Reference implements a dedicated toast notification system with `overlay-container` wrapper (aria-live=polite for accessibility) and `toast-container` div. Our codebase has NO toast system — notifications are currently handled via ConnectionOverlay.svelte (connection status) and CaptionsOverlay.svelte (captions), but no generic toast/alert notification queue for user actions or system messages.  
  - _evidence:_ file33.html:1-2 — `<div class="overlay-container" aria-live="polite"><div id="toast-container" class="toast-top-right toast-container"></div></div>`  

### `file34.html` — Orphaned audio element — id="webcam", Angular snapshot
- **[MED][missing] Hidden audio element** → `None found in /web/src/lib/components or`  
  - Element is entirely absent from current codebase. The id="webcam" suggests audio playback, but no corresponding audio player or audio element with this id exists in the Svelte implementation. The _ngcontent-ng-c4243810522 attribute confirms this is from the reference Angular app, not our codebase.  
  - _evidence:_ file34.html:1-6 — <audio id="webcam" autoplay="autoplay" hidden="true"></audio>  
- **[LOW][mismatch] Element attributes** → `N/A — no audio element in codebase`  
  - Reference uses Angular's Ivy view encapsulation marker; our app is Svelte-based and would not generate this attribute. This confirms the snapshot is from the reference Angular prototype, not our implementation.  
  - _evidence:_ file34.html:2 — _ngcontent-ng-c4243810522 is an Angular-specific attribute  

### `file4.html` — Full trading room snapshot: &lt;app-room&gt; shell (80.6K lines) with sidebar, top nav, pr
- **[HIGH][mismatch] Main top navbar (mainAppNav) structure and layout** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Our RoomTopNav is a fixed 49px bar with icon buttons and a volume dropdown panel. The reference uses Bootstrap navbar with dropdown-menu (CSS-based popovers). Our button styling and layout differ: we use 'icon-btn' + 'nav-link-btn' classes; the reference uses 'navbar-toggler', 'nav-link', 'dropdown-toggle'. Our volume panel is a custom div; the reference is a Bootstrap dropdown-menu with aria-labelledby.  
  - _evidence:_ file4.html:331–388 — navbar with flex layout, sidebar-menu button (hamburger), users count span, mobile-app button (fa-mobile), navbar-brand (logo), navbar-toggler, and ul.navbar-nav.ml-auto with talking indicator + volume dropdown + reload button  
- **[HIGH][mismatch] Sidebar structure and navigation items** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Our sidebar uses semantic button elements instead of Bootstrap nav-link anchors. Reference has aria-haspopup/aria-expanded on dropdown toggle; we use native <button> with onclick. The reference 'Audio/Video Settings' modal trigger is on line 70–87 (video icon + 'Audio/Video Settings' label) in OUR sidebar but NOT visible in the reference's left sidebar navigation — it's in the top nav's volume dropdown. The reference Transcript History item is a plain anch  
  - _evidence:_ file4.html:12–327 — .room-sidebar with .sidebar-wrapper > nav.navbar > ul.navbar-nav. Items: powered-by block + mobile-app button, Connectivity Check (fa-network-wired), Audio/Video Settings (missing in reference nav, shown in sidebar), General Settings (fa-cogs), Archives dropdown (fa-archive) with sub-items (Alert Logs, Chat Logs, Transcript History), Manage Muted Users (fa-comments), Manage Followed Users (fa-users), Users/Roster section with toolbar bu  
- **[HIGH][mismatch] Settings modal (General Settings) — tabs and theme/layout controls** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - The reference uses Bootstrap .nav-tabs (ul > li > a.nav-link.active) and .tab-content (div > .tab-pane.fade.show.active). Our component uses custom .tabs (button.tab.active) and .panel (div.panel). The reference theme radios have name='app-color-theme' with values 'Light Theme'/'Dark Theme' (no binding); our radios are bound to theme.mode and call selectMode() on change. Reference uses Bootstrap form-check-input/form-check-label; we use semantic radio + sp  
  - _evidence:_ file4.html:15621–16268 — id='user-settings-modal' > .modal-content > .modal-header (h5 'General Settings', btn-close-white) + .modal-body > ul#userSettingsTab.nav.nav-tabs with three tabs (id='user-app-settings-tab', 'user-alert-settings-tab', 'user-chat-settings-tab') + #userSettingsTabContent.tab-content > .tab-pane divs. App tab contains: 'Choose Color Theme' (fa-palette) with Light/Dark radio buttons (id='app-light-theme', 'app-dark-theme'), 'Room Layo  
- **[HIGH][mismatch] Audio/Video Settings modal — user + presenter tabs** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Same as SettingsModal: Bootstrap .nav-tabs vs. our custom .tabs button structure. The reference Disable Video uses fa-desktop icon; we use Icon name='desktop'. Reference has form-group > select with id='speakers-device'; we use plain select with id='av-speaker'. The reference 'Choose Speakers' is a label inside a nav-item's a element; we use a .field container with label + .row (select + button). Button styling differs: reference uses btn btn-sm btn-defaul  
  - _evidence:_ file4.html:16913–17118 (est.) — id='av-settings-modal' > .modal-content > .modal-header (h5 'Audio/Video Settings', btn-close-white) + .modal-body > ul#userSettingsTab.nav.nav-tabs with tabs: 'User Settings' (id='user-audio-video-settings-tab') showing 'Disable Video' (fa-desktop) checkbox + 'Choose Speakers' dropdown selector + Test button. Presenter tab (partially shown) likely has mic/camera selectors.  
- **[MED][mismatch] Top nav talking indicator and volume dropdown** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap dropstart dropdown-menu (aria-labelledby); we use custom .volume-panel div. Reference wraps talking indicator in li.nav-item.talkingIndicator.animated.fadeIn > a (no onclick); we use span.talking (no animation). Our sound options use input[type=checkbox] bound to $state booleans; the reference uses plain checkboxes with no visible binding. Reference has fa-2x fa-volume-up icon on the volume button; we conditionally show fa-volume-m  
  - _evidence:_ file4.html:391–587 — li.nav-item.talkingIndicator > a '( No one is speaking )'. Volume dropdown: li.nav-item.dropdown.dropstart > a#dropdownVolume (data-bs-toggle='dropdown', fa-2x fa-volume-up icon + span.mainNavItem 'Volume') > .dropdown-menu.volumeControl with h4 header, volume label/range, Mute button, hr, sound options checkboxes (alert, QA, NTA, chat, subtitles, don't disturb).  
- **[MED][mismatch] Sidebar nav item structure and icon placement** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - The reference items use anchor tags (a.nav-link.sidebar-item); we use button.item. Reference padding is 'pl-2' (8px) on the label span; we use '.label { padding-left: 8px }' class. Reference has no explicit flex layout on the icon+label pair; we use 'display: flex; align-items: center;' on the button. Reference icons use fas fa-* classes directly; we use Icon component with name prop (Icon renders <i class='fas fa-{name}'>).  
  - _evidence:_ file4.html:70–106 — each nav-item is an li > a.nav-link.sidebar-item (data-bs-toggle/target attrs for modals) > i.fas (icon) + span.pl-2 (label). Example: Connectivity Check — 'fa-network-wired' + 'Connectivity Check'. General Settings — 'fa-cogs' + 'General Settings'.  
- **[MED][mismatch] Sidebar Archives dropdown menu** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap .dropdown-menu (aria-labelledby); we use .group (flex-column) with .group-head (span 'Archives') and sub-item buttons. Reference has a.dropdown-item elements; we use button.sub-item. Reference icon + label are on each item directly; we render Icon component + label. Our Archive section is NOT a dropdown; it's always-visible nested buttons grouped under a span header. This is a structural difference in how expandable groups are rend  
  - _evidence:_ file4.html:108–177 — li.nav-item.dropdown > a#archivesDropdown.dropdown-toggle (fa-archive icon + 'Archives' label) > .dropdown-menu.users-dropdown-options with three dropdown-item anchors: Alert Logs (fa-bell), Chat Logs (fa-comment), Transcript History (fa-closed-captioning, disabled/plain).  
- **[MED][mismatch] Sidebar Users/Roster section with toolbar** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - The reference .nav-link.active-room-users is an anchor; we use a semantic .roster section. Reference toolbar buttons are btn btn-sm classes (btn-dark, btn-default, btn-secondary) with fa-* icons; we use .mini (inline-flex) with colored background classes (.mini-cog, .mini-reload, .mini-sort, .mini-search). Reference layout is flex with float-right positioning; ours uses inline-flex. Reference has fa fa-sync (double fa); ours is single fa-sync. Button title  
  - _evidence:_ file4.html:222–324 — li.nav-item.d-flex.flex-column > a.nav-link.active-room-users (flex, space-between) > div (fa-user + 'Users: ' label) + .flex-fill.users-btns (flex, 4 buttons: user-options dropdown [fa-cog], reload [fa-sync], sort [fa-sort-alpha-down], search [fa-search]). Below: app-room-roster > .room-roster-list (empty or with users).  
- **[LOW][mismatch] Modal structure and header styling** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - The reference uses Bootstrap modal classes (.modal-header, .modal-body, .modal-footer) with btn-close-white button; our Modal component is a custom Svelte wrapper that renders a dialog-like structure with 'modal' class. The reference close button is btn-close btn-close-white; our Modal doesn't render a visible close button in its template (onClose is passed as a prop for buttons to wire).  
  - _evidence:_ file4.html:15621–15643 (user-settings-modal example) — .modal-fade > .modal-dialog > .modal-content > .modal-header (h5 title + button.btn-close.btn-close-white) + .modal-body + .modal-footer  
- **[LOW][mismatch] Sidebar item icons — icon family and specific glyphs** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Our Icon component can specify family='brands' (line 180: Icon name='youtube' family='brands'). The reference sidebar items are all Font Awesome Solid (fas). No divergence observed — our icon mapping should match fas-* names directly. The 'fa-network-wired' → name='network-wired' mapping is correct.  
  - _evidence:_ file4.html:77–106 — Connectivity Check uses 'fa-network-wired'; General Settings uses 'fa-cogs'; Archives uses 'fa-archive'; Muted Users uses 'fa-comments'; Followed Users uses 'fa-users'. All use class='fas fa-{icon}'. No 'brands' or non-standard icon families visible in this snippet.  

### `file5.html` — RoomTopNav navbar component — main trading room navigation bar with sidebar toggle, user c
- **[HIGH][mismatch] Brand logo** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: anchor.navbar-brand with img.brand-logo child (external URL). Ours: span.brand with text content (roomName prop). Reference uses image; ours uses text.  
  - _evidence:_ file5.html:24-30: `<a class="navbar-brand ml-1 mr-auto">` containing `<img id="cssLogo" ... src="...">`. Anchor link wraps img.  
- **[HIGH][mismatch] Volume dropdown structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: Bootstrap dropdown (li.dropdown > a[data-bs-toggle] > div.dropdown-menu). Ours: div.volume > button + conditional div.volume-panel. Reference uses Bootstrap modal/dropdown JS; ours uses local state (volumeOpen).  
  - _evidence:_ file5.html:60-234: `<li class="nav-item dropdown dropstart">` containing `<a id="dropdownVolume" data-bs-toggle="dropdown">` → `<div class="dropdown-menu volumeControl">`. Bootstrap dropdown pattern.  
- **[MED][mismatch] Root navbar structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap navbar classes (navbar-expand-md, navbar-dark, fixed-top); we use custom .topnav class with explicit fixed positioning and height. Reference has empty style attr; ours is styled in <style> block.  
  - _evidence:_ file5.html:1-5: `<nav class="navbar navbar-expand-md navbar-dark fixed-top mainAppNav" style="">`. Our: nav.topnav with fixed position + height:49px via CSS.  
- **[MED][missing] Mobile/responsive toggle button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: explicit navbar-toggler button for mobile nav collapse. Ours: no mobile collapse button in component; responsiveness handled elsewhere or not implemented in RoomTopNav.  
  - _evidence:_ file5.html:31-42: `<button class="navbar-toggler btnNavToggler" data-bs-toggle="collapse" data-bs-target="#navbarsRoom">` with nested icon. Bootstrap responsive behavior.  
- **[MED][mismatch] Volume slider range input** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: input with custom audiovolslider directive and Angular classes (ng-untouched, ng-pristine, ng-valid). Ours: input with bind:value={volume}, disabled when muted, plain HTML5 range without directive.  
  - _evidence:_ file5.html:93-100: `<input audiovolslider="" type="range" min="0" max="100" class="mx-auto py-2 volCtrl ng-untouched ng-pristine ng-valid" />`. Custom directive audiovolslider.  
- **[MED][mismatch] Sound options checkboxes layout** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: outer .room-sound-options > nested divs. Ours: div.sound-options > labels (no intermediate divs). Reference each checkbox in div.my-1; ours directly in labels. Reference label.form-check-label with for attr; ours implicit label wrapping.  
  - _evidence:_ file5.html:114-232: `<div class="room-sound-options">` containing 6 `<div class="my-1">` children, each with checkbox + label. Bootstrap spacing classes.  
- **[LOW][mismatch] Sidebar toggle button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: span with .sidebar-menu class containing fa-icon. Ours: button.icon-btn.menu-btn with custom Icon component. Reference title attr matches (implicit in aria-label).  
  - _evidence:_ file5.html:6-10: `<span class="sidebar-menu">` with `<i class="fas fa-bars"></i>`. Has title="Open Sidebar", margin/padding via BS classes.  
- **[LOW][mismatch] Users connected indicator** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: span with Bootstrap flex classes (d-flex, align-items-center, ml-1, mr-1). Ours: span.users with custom CSS flexbox. Reference has no count text in DOM; ours renders {userCount}.  
  - _evidence:_ file5.html:11-16: `<span class="users ml-1 mr-1 d-flex align-items-center">` with `<i class="fas fa-user"></i>` and empty comment (count not rendered).  
- **[LOW][mismatch] Mobile app info button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: bare span with fa-icon class and Bootstrap modal attrs (data-bs-toggle, data-bs-target). Ours: button.icon-btn.mobile-btn with Icon component and onclick handler. Reference does NOT wrap the icon; icon class is directly on the span element.  
  - _evidence:_ file5.html:17-23: `<span class="fas fa-mobile mr-1 mobile-info-app-btn">` with data-bs-toggle/target for modal trigger. No icon wrapper.  
- **[LOW][mismatch] Talking indicator styling** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: li.talkingIndicator with animated/fadeIn Bootstrap animation classes. Ours: span.talking with Svelte @keyframes fade-in. Reference has no speaker var; ours conditionally renders speaker name or 'No one is speaking'.  
  - _evidence:_ file5.html:53-58: `<li class="nav-item talkingIndicator animated fadeIn">` with animation classes. Line 57: text `( No one is speaking )`.  
- **[LOW][mismatch] Mute button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: button.btn.btn-primary.btn-sm always labeled 'Mute'. Ours: button.mute with conditional text (muted ? 'Unmute' : 'Mute') and .on state class for styling.  
  - _evidence:_ file5.html:101-107: `<button class="btn btn-primary btn-sm" title="Mute Audio">` with text 'Mute'. Hardcoded label.  
- **[LOW][mismatch] Reload button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: li > a.nav-link. Ours: button.icon-btn.nav-link-btn. Different semantic element and structure, but same visual icon (fa-sync / Icon name='sync').  
  - _evidence:_ file5.html:235-246: `<li class="nav-item" title="Reload">` → `<a class="nav-link d-flex align-items-center">` with fa-sync icon. Nested in li.nav-item.  
- **[LOW][mismatch] Volume panel header close button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: h4 text + span with data-bs-toggle inside (reuses dropdown toggle). Ours: div.panel-head > h4 + button.panel-close with explicit onclick handler. Different close mechanism (toggle vs button).  
  - _evidence:_ file5.html:81-92: `<h4>` with nested `<span data-bs-toggle="dropdown" class="float-right mr-2">` containing close icon. Float-right positioning.  
- **[LOW][mismatch] Don't Disturb checkbox label** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: Don't Disturb label WITHOUT status span (no 'on'/'off' indicator). Ours: includes .status span with {dontDisturb ? 'on' : 'off'}. Reference is asymmetric vs other sound options.  
  - _evidence:_ file5.html:223-230: `<label for="app-donot-disturb" class="form-check-label">` with span wrapper around text 'Don\'t Disturb'. No status span after.  
- **[LOW][mismatch] Sound option status indicator** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: status is static 'on' text. Ours: dynamic status spans showing {alertSound ? 'on' : 'off'} etc, reflecting actual state.  
  - _evidence:_ file5.html:150-151, 169, etc: `<span>on</span>` hardcoded after each label text (except Don't Disturb). Always 'on'.  
- **[LOW][mismatch] Nav item styling structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference: semantic ul > li list structure with Bootstrap navbar-nav classes. Ours: flat flex nav with button/span/div elements. No ul/li at all.  
  - _evidence:_ file5.html: Entire navbar wrapped in `<ul class="navbar-nav align-items-center ml-auto">` (line 48-249). All nav items as `<li class="nav-item ...">`.  

### `file6.html` — Full-room trading session snapshot (Mastering the Trade, June 2026): horizontal split layo
- **[MED][mismatch] Alerts panel header: navbar with brand icon+label + search/settings icons** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference has explicit <nav class="navbar"> with Bootstrap navbar structure + separate dropdown for gear icon; our AlertFeed uses a generic header structure without Bootstrap navbar elements. The reference wraps the header in <div class="bs-component"> before the nav, we render a bare structure.  
  - _evidence:_ file6.html:34-85 `<nav class="navbar navbar-expand-lg navbar-light chat-nav p-1 alertHeader">` with `<i class="fas fa-bell me-1"></i> Alerts` and two nav items (search, settings dropdown)  
- **[MED][mismatch] Chat panel header: navbar with comment icon + Main Chat / Off Topic tabs + search/settings** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap navbar + tablist with tab navigation inline in header; our ChatPanel uses a generic header structure. The reference's tab bar is part of the navbar with flex-grow-1 centered tabs.  
  - _evidence:_ file6.html:9545-9634 `<nav class="navbar navbar-expand-lg navbar-light chat-nav p-1 chatHeader">` with `<i class="fas fa-comment"></i>` + `<ul role="tablist" class="nav nav-tabs flex-wrap flex-grow-1 justify-content-center chatTabs">` containing Main Chat / Off Topic tabs  
- **[MED][mismatch] Main stage / presentation area: top nav with Screens/Notes/Files tabs + webcam strip above** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses `<ul role="tablist" class="nav nav-tabs mainTabset">` with `<li><a>` structure; our MainStage uses `<div class="tabbar"><button role="tab">` structure. Reference wraps tabs in `<div class="mainPresentationAreaHolder">`, icon is in a nested flex div.  
  - _evidence:_ file6.html:9810-9952 `<app-presentationarea>` with `<ul id="mainTabs" class="nav nav-tabs mainTabset">` containing Screens (fa-desktop), Notes (fa-edit), Files (fa-folder) tabs; webcam holders appear above at line 9751-9809  
- **[MED][mismatch] Notes panel: tab list with multiple note tabs (with badge for Welcome Mat, edit icon, name** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference renders note tabs as Bootstrap nav-tabs with rich badge/icon decoration (home icon for Welcome Mat, pen icon for unsaved state); our NotesPanel currently lacks this level of tab decoration. Reference uses `<a class="editName">` as a dblclick-to-rename target; our implementation uses a different interaction pattern.  
  - _evidence:_ file6.html:10028-10262 `<ul id="notesTabs" role="tablist" class="nav nav-tabs noteTabset">` with multiple `<li><a>` tabs; first tab has `<span class="badge badge-success"><i class="fas fa-home"></i></span>` + `<i class="fas fa-pen">` (hidden) + `<a class="editName">` label  
- **[MED][missing] Note welcome-mat badge: Green home icon badge on first note tab** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Our NotesPanel does not render a visual badge/indicator for which note is the Welcome Mat / default display note.  
  - _evidence:_ file6.html:10056-10060 `<span class="badge badge-success"><i class="fas fa-home"></i></span>` with tooltip 'This note is the Welcome Mat...'  
- **[MED][missing] Note tab unsaved indicator: pen icon (fas fa-pen) with display:none toggle when dirty** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Our NotesPanel does not show a visual 'unsaved' indicator (pen icon) on note tabs when the note body has been modified but not yet saved.  
  - _evidence:_ file6.html:10061-10066 `<i class="fas fa-pen mx-1" style="display: none" id="noteUpd-652765a0e494735aa53574ba"></i>` (hidden by default, shown when note is unsaved)  
- **[MED][mismatch] Streams tab (hidden): Podcast icon + label structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference includes a hidden Streams tab in the tab list; our MainStage omits it entirely (no Streams tab in the TABS array). Reference keeps it in DOM with hidden attribute; we do not render it.  
  - _evidence:_ file6.html:9852-9882 `<li hidden=""><a ... class="nav-link"><i class="fas fa-podcast"></i><span class="ml-1">Streams</span></a></li>` (reference includes but hides Streams tab)  
- **[LOW][mismatch] Chat input area: textarea + emoji/image/GIF buttons** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses ngbtooltip directives and span-wrapped buttons with fa-smile/fa-image/GIF label; our implementation likely has simpler button structure without explicit tooltip attributes.  
  - _evidence:_ file6.html:9650-9718 `<div id="textAreaHolder" class="d-flex align-items-center textSendDiv">` with `<textarea id="textAreaTxt" name="txt-area" placeholder="Type your message here..">` + three action icons (emoji, image, GIF) in `<span class="textAreaBtns">`  
- **[LOW][mismatch] Presenter camera tiles (app-presenter-cams): video element + overlay with name label + clo** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses `<h5 class="pNameLabel">` for the presenter name overlay; our WebcamHolder uses `<span class="name">`. Reference wraps close button in span with closeIcon class; our version uses direct button.  
  - _evidence:_ file6.html:9751-9809 Multiple `<app-presenter-cams>` with `<div class="card webcamsHolder">` containing `<video autoplay>` + `<div class="overlay">` with `<h5 class="pNameLabel">` + `<span class="closeIcon"><i class="fas fa-times"></i></span>`  
- **[LOW][mismatch] Note options footer: Download button (fa-download) + other action buttons** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference includes explicit Download button in the note pane footer; our NotesPanel has a download() function but the button placement/styling may differ. Reference uses Bootstrap btn-sm class.  
  - _evidence:_ file6.html:10340-10358 `<div class="noteOptions d-flex align-items-center justify-content-between">` with `<button class="btn btn-sm noteDownload"><i class="fas fa-download"></i> Download</button>`  
- **[LOW][mismatch] Chat header: Comment icon + comment label (implicit in icon)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference shows only icon without text label; typical implementations may add visible 'Chat' text.  
  - _evidence:_ file6.html:9550-9557 `<a class="navbar-brand"><i class="fas fa-comment"></i></a>` (label omitted, only icon shown)  
- **[LOW][mismatch] Main presentation tabs (Screens/Notes/Files): Icon + label structure inside tab** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses nested flex divs and ml-1 spacing; our MainStage uses simpler gap-based flexbox. Reference wraps icon+label in extra div levels for layout control.  
  - _evidence:_ file6.html:9837-9848 `<a ... class="nav-link active"><div class="d-flex"><div><i class="fas fa-desktop"></i><span class="ml-1">Screens</span></div></div></a>` (similar for Notes/Files)  
- **[LOW][mismatch] Note tab rename interaction: editName class link with dblclick tooltip** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference displays note title as a styled link with explicit tooltip instructing double-click to rename; our implementation uses promptDialog() on dblclick but may not have the same tooltip affordance on the tab element itself.  
  - _evidence:_ file6.html:10067-10073 `<a class="editName mx-1" placement="bottom" tooltip="Double-Click to rename note tab">Welcome</a>`  

### `file7.html` — User Info Modal (Angular/Bootstrap snapshot) - displays user profile with status, avatar, 
- **[HIGH][mismatch] Modal wrapper element** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot is Angular component tag; codebase is Svelte using `<Modal>` wrapper component. Different framework architecture (Angular decorators vs Svelte reactive declarations).  
  - _evidence:_ file7.html:1 - `<app-user-info-modal>` with Angular-specific attributes `_ngcontent-*`, `_nghost-*`  
- **[HIGH][mismatch] Modal container structure & classes** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot uses Bootstrap grid/modal framework classes (.modal, .fade, .modal-dialog, .modal-content, .modal-header/body/footer). Codebase uses custom CSS classes (.backdrop, .panel, .head, .body, .foot) with flexbox layout and custom styling. No Bootstrap dependency in Svelte version.  
  - _evidence:_ file7.html:2-12 - Uses Bootstrap `.modal.fade`, `.modal-dialog`, `.modal-content`; id='user-modal'  
- **[HIGH][mismatch] Avatar display** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot displays Gravatar image from external URL. Codebase displays first character initial in a circular colored div (`.avatar {initial}`). No external image dependency in Svelte version.  
  - _evidence:_ file7.html:14-20 - `<div class='edit-user-avatar'><img src='https://secure.gravatar.com/avatar/undefined?d=mm&s=80' />`  
- **[HIGH][mismatch] Profile section layout** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot: avatar and title in header, badge inside title. Codebase: dedicated `.profile` flexbox section with `.avatar` + `.meta` (containing `.name` and `.badge` as separate inline elements). Header only contains title and close button.  
  - _evidence:_ file7.html:13-27 - Avatar and title in `.modal-header`; status badge inline in `<h3 class='modal-title'>`  
- **[MED][mismatch] Status badge styling** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot: Bootstrap `.badge.badge-danger` with text only. Codebase: custom `.badge` class with `.dot` indicator element (filled circle), conditional `.online` class modifier for styling, and `{online ? 'Online' : 'Offline'}` text. Different color scheme (danger vs positive/text-dim).  
  - _evidence:_ file7.html:24-26 - `<span class='badge badge-danger'>Offline</span>` (Bootstrap badge classes)  
- **[MED][mismatch] Action buttons (@Mention, Private Chat, Follow, Mute)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot: Each button has unique Bootstrap color class (outline-light, outline-info, outline-warning). Codebase: All action buttons use uniform `.action` class with custom border/hover styling. Icons are embedded (Icon name='at', 'comment', 'user-plus', 'bell-slash'). Snapshot shows text labels only, no icons.  
  - _evidence:_ file7.html:43-69 - Multiple buttons with mixed classes: `btn btn-outline-light` (@Mention, Private Chat), `btn btn-outline-info` (Follow), `btn btn-outline-warning` (Mute)  
- **[MED][mismatch] Close button styling** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot: Bootstrap `.btn.btn-primary`. Codebase: custom `.close-btn` class with accent background color. Different styling approach (Bootstrap vs custom CSS variables).  
  - _evidence:_ file7.html:56-75 - `<button class='btn btn-primary'>Close</button>`  
- **[MED][mismatch] Close button (modal header)** → `/Users/billyribeira/Desktop/pro-room/pro`  
  - Snapshot: Bootstrap `btn-close btn-close-white` with data-bs-dismiss='modal'. Codebase: custom close button with Icon component (name='times', size=18) and onclick handler. No Bootstrap close button class.  
  - _evidence:_ file7.html:28-34 - `<button data-bs-dismiss='modal' aria-label='Close' class='btn-close btn-close-white'></button>`  
- **[MED][mismatch] Modal dialog attributes** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot: Uses `aria-hidden='true'`, `id='user-modal'`, static labelledby='user-details'. Codebase: Uses `aria-modal='true'` (more accessible), dynamic `aria-labelledby={titleId}`, no id attribute on dialog, conditional rendering (not hidden via aria-hidden). Bootstrap .modal/.fade classes vs custom styling.  
  - _evidence:_ file7.html:4-9 - `id='user-modal'`, `role='dialog'`, `aria-labelledby='user-details'`, `aria-hidden='true'`, `class='modal fade'`, `tabindex='-1'`  
- **[MED][missing] Icons in buttons** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot: Text-only buttons. Codebase: Each action button includes an `<Icon>` component (at, comment, user-plus, bell-slash) rendered inline with button text.  
  - _evidence:_ file7.html:43-75 - No icon elements visible, buttons show text labels only  
- **[LOW][mismatch] Modal body content** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Snapshot: Empty modal-body in current snapshot. Codebase: Contains `.profile` section with avatar, name, and status badge. Snapshot may be a partial capture or the content is rendered dynamically.  
  - _evidence:_ file7.html:36-38 - Empty `.modal-body` with only comments  

### `file8.html` — PlayYouTubeModal - modal for broadcasting YouTube videos to room
- **[MED][mismatch] Modal Title** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference has 'Play YouTube For All' but our component has 'Play YouTube Video'  
  - _evidence:_ file8.html:14 - <h5>Play YouTube For All</h5>  
- **[MED][mismatch] Modal Structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap modal classes (modal fade, modal-dialog, modal-content, modal-header, modal-body, modal-footer); our component uses custom <Modal> wrapper with Svelte structure  
  - _evidence:_ file8.html:9 - class="modal fade" (Bootstrap modal framework)  
- **[MED][missing] Content Introduction** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference snapshot has no intro section; our component includes an intro div with youtube icon and 'Broadcast a YouTube video to everyone in the room' description  
  - _evidence:_ file8.html - no intro section with icon or description in modal-body  
- **[MED][mismatch] URL Input Field** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses type="text" with Bootstrap input-group layout; our component uses type="url" with label wrapper and custom styling; placeholder differs ('Paste YouTube URL' vs 'Paste a YouTube URL')  
  - _evidence:_ file8.html:24-32 - input type="text" in input-group, class="form-control", placeholder="Paste YouTube URL"  
- **[MED][mismatch] Save/Play Buttons Layout** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference has Save and Play For All as span buttons (input-group-text) inline with input field in modal-body; our component has them in a footer snippet with btn classes (.ghost and .primary)  
  - _evidence:_ file8.html:24-43 - buttons as input-group-text spans within input-group div in modal-body  
- **[LOW][mismatch] Close Button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference has explicit btn-close button in modal-header; our custom Modal component handles close button internally via onClose handler  
  - _evidence:_ file8.html:15-21 - button with class="btn-close btn-close-white" in header  
- **[LOW][missing] Footer Close Button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference has explicit modal-footer with 'Close' button; our component footer only has Save and Play For All buttons, no explicit Close button (close is handled via modal header close button)  
  - _evidence:_ file8.html:46-58 - modal-footer with Close button (btn btn-secondary)  
- **[LOW][missing] Error Display** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference snapshot has no error message element; our component includes conditional error message display with aria-alert role and id reference  
  - _evidence:_ file8.html - no error message display element  
- **[LOW][mismatch] Input Accessibility Attributes** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses aria-label and aria-describedby for input; our component uses aria-invalid and conditional aria-describedby for error state  
  - _evidence:_ file8.html:25-31 - input has aria-label and aria-describedby="basic-addonYT" (but id is basic-addonSave/basic-addonPlay)  

### `file9.html` — app-user-settings-modal (General Settings)
- **[MED][mismatch] Chat Settings > Image Preview section header icon** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses `fa-image` icon; our component uses `fa-file` (line 389: `<Icon name="file" />`). Should be `fa-image` for consistency.  
  - _evidence:_ file9.html:902-904: `<i class="fas fa-image"></i>`  
- **[MED][mismatch] Chat Settings > Always Scroll To Bottom section header icon** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses `fa-scroll` icon; our component uses `fa-file` (line 433: `<Icon name="file" />`). Should be `fa-scroll` for consistency.  
  - _evidence:_ file9.html:1080-1083: `<i class="fas fa-scroll"></i>`  
- **[MED][mismatch] Chat Settings > Reduce Chatlog Memory section header icon** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses `fa-trash` icon; our component uses `fa-file` (line 443: `<Icon name="file" />`). Should be `fa-trash` for consistency.  
  - _evidence:_ file9.html:1120-1123: `<i class="fas fa-trash"></i>`  
- **[MED][mismatch] Chat Settings > Always Scroll To Bottom section** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Our component uses fa-file icon but should use fa-scroll; reference shows fa-scroll is correct semantically  
  - _evidence:_ file9.html:1070-1109 (fa-scroll icon, 1 checkbox for 'Always scroll to bottom')  

### `important-doc.html` — Full trading room page snapshot (Angular 17.3.12 / Bootstrap) - "Mastering The Trade" memb
- **[HIGH][mismatch] Sidebar (room-sidebar, navbar structure)** → `/web/src/lib/components/RoomSidebar.svel`  
  - HTML uses Bootstrap navbar (nav, ul.navbar-nav, li.nav-item); our RoomSidebar is a Svelte component with custom sidebar styling. Bootstrap-based structure completely refactored to Svelte.  
  - _evidence:_ important-doc.html:15-343 - <div class="room-sidebar"><div class="sidebar-wrapper"><nav class="navbar w-100 h-100"><ul class="navbar-nav small w-100 h-100">  
- **[HIGH][mismatch] Top Navigation (mainAppNav - users connected, volume control, speaking indicator)** → `/web/src/lib/components/RoomTopNav.svelt`  
  - HTML uses Bootstrap navbar classes (navbar navbar-expand-md navbar-dark fixed-top); custom dropdown for volume with class="dropdown-menu volumeControl". Our Svelte version has different component structure and likely uses custom styling instead of Bootstrap.  
  - _evidence:_ important-doc.html:347-655 - <nav class="navbar navbar-expand-md navbar-dark fixed-top mainAppNav">; volume control at line 424: <a id="dropdownVolume" data-bs-toggle="dropdown">  
- **[HIGH][mismatch] Volume Control Dropdown (dropdownVolume with audio controls)** → `/web/src/lib/components/RoomTopNav.svelt`  
  - HTML has inline dropdown menu in navbar; includes volume slider (<input type="range" min="0" max="100">), Mute button, and sound checkboxes (alert-donot-disturb, qa-donot-disturb, non-trade-donot-disturb, chat-donot-disturb, app-donot-disturb). Our implementation may distribute these controls differently.  
  - _evidence:_ important-doc.html:424-650 - <a id="dropdownVolume" data-bs-toggle="dropdown" class="nav-link d-flex align-items-center"><i class="fas fa-2x fa-volume-up"></i>; dropdown-menu with volume range slider and sound options  
- **[HIGH][mismatch] Color Theme & Styling** → `Theme system in /web/src/lib/stores/them`  
  - HTML uses Bootstrap CSS classes and lightTheme/darkTheme class names; our Svelte uses CSS variables (--text, --bg-elev, --border, --radius, etc.) for theming, managed via theme.svelte store.  
  - _evidence:_ important-doc.html:8 - class="lightTheme" on app-room; CSS classes reference Bootstrap (btn, btn-primary, btn-secondary, form-control, nav-tabs, dropdown, etc.)  
- **[MED][mismatch] Alert Logs Modal (alerts-logs-modal)** → `/web/src/lib/components/modals/AlertLogs`  
  - HTML has actual log items (Oct 22, 2023, Oct 15, 2023 with admin@protradingroom.com); uses Bootstrap list-group and list-group-item classes. Our Svelte version has hardcoded empty logs state with no data. Button text matches ('Reload Log List') but styling differs (btn btn-primary my-2 vs custom button).  
  - _evidence:_ important-doc.html:82014-82119 - <div id="alerts-logs-modal" class="modal fade"><button type="button" class="btn btn-primary my-2">Reload Log List</button>; list items using <div class="list-group-item"> at lines 82059-82100  
- **[MED][missing] Chat Logs Modal (chat-logs-modal)** → `/web/src/lib/components/modals/ChatLogsM`  
  - Component exists but need to verify it has the same list-group structure and data display as the HTML snapshot. HTML shows list-group-item divs with dates and user info.  
  - _evidence:_ important-doc.html:18616+ - <div id="chat-logs-modal" class="modal fade"> with similar list-group structure to alerts-logs-modal  
- **[MED][mismatch] Alerts/Chat Dock (mainAreaSplit region with chat and alerts)** → `/web/src/lib/components/AlertsChatDock.s`  
  - HTML uses angular-split with class row main-split-container; our Svelte version uses a custom Split component for resizable layout. Layout logic refactored but functionality equivalent.  
  - _evidence:_ important-doc.html:655+ - <div id="mainAreaSplit" class="row main-split-container"> containing split panes for alerts and chat  
- **[MED][mismatch] Room Roster/Users List (room-roster with user listings)** → `/web/src/lib/components/MembersPanel.sve`  
  - HTML uses app-room-roster component with room-roster-list class; our Svelte has MembersPanel. Control buttons (reload users, sort users, search users) exist in HTML sidebar but layout/implementation differs.  
  - _evidence:_ important-doc.html:329-337 - <app-room-roster _nghost-ng-c900715899=""><div class="room-roster-list"></div></app-room-roster>; sidebar user management buttons at lines 296-323 (reload, sort, search users)  
- **[MED][mismatch] Chat Messages (app-roomscroller with app-st-message items)** → `/web/src/lib/components/ChatPanel.svelte`  
  - HTML uses app-roomscroller and app-st-message components (Angular); our Svelte version uses ChatPanel and MessageBody. Structure and rendering logic refactored.  
  - _evidence:_ important-doc.html:750-15000+ - <app-roomscroller><div class="chatScrollViewParentAlerts"><app-st-message> repeated for each message  
- **[MED][mismatch] Alerts Section (app-alerts component)** → `/web/src/lib/components/AlertFeed.svelte`  
  - HTML uses app-alerts Angular component; our Svelte uses AlertFeed. Same functional purpose, different implementation.  
  - _evidence:_ important-doc.html:682-750 - <app-alerts _nghost-ng-c2104969901="">  
- **[MED][missing] Presentation Subtitles Checkbox (presentation-subtitles)** → `No direct match found; may be part of Ca`  
  - HTML has a dedicated checkbox in the sound options dropdown for presentation subtitles; our codebase has CaptionsOverlay component but need to verify subtitle toggle is accessible in the same location.  
  - _evidence:_ important-doc.html:587-613 - <div id="presentation-subtitles" class="my-1"><input type="checkbox" name="presentation-subtitles" id="presentation-subtitles" class="form-check-input"/><label for="presentation-subtitles" class="form-check-label">Presentation subtitles</label></div>  

### `mixednavs.html` — Hidden Streams tab (Bootstrap nav-item) from Angular trading room room tabs navigation
- **[LOW][missing] Streams tab nav-item (hidden)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Our MainStage.svelte defines TABS array with only 3 tabs (Screens, Notes, Files) at line 71-75; reference has a hidden Streams tab with fa-podcast icon marked hidden="" indicating it was placeholdered in the Angular app but disabled. Our implementation does not include this tab definition at all (neither visible nor hidden).  
  - _evidence:_ mixednavs.html:1-19 \| <li role="presentation" class="nav-item" hidden=""> containing <a id="streams-tab" data-bs-toggle="tab" data-bs-target="#streams" role="tab" class="nav-link" tabindex="-1">  
- **[LOW][missing] Streams tab icon and label structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap fa-podcast icon with ml-1 margin; our TABS array uses Icon component names ('desktop', 'edit', 'folder') and 4px gap. The Streams entry is entirely absent from our TABS definition.  
  - _evidence:_ mixednavs.html:14-16 \| <i class="fas fa-podcast"></i><span class="ml-1">Streams</span>  

### `navbar.html` — navbar.html - Angular navbar snapshot from protradingroom.com trading room
- **[?][mismatch] Users connected indicator** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - reference snapshot shows only icon no count visible, but HTML structure allows it; ours explicitly renders userCount prop which may not be shown in reference session  
  - _evidence:_ navbar.html:11-16: <span class="users ml-1 mr-1 d-flex align-items-center"><i class="fas fa-user"></i></span> (no user count text visible) \| RoomTopNav.svelte:65-68: <span class="users"><Icon name="user"/><span class="count">{userCount}</span></span>  
- **[?][missing] Navbar toggler (mobile collapse)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Bootstrap navbar-toggler missing — ours does not have a responsive collapse button for mobile nav items (not applicable to ours as items are not in a collapsible list)  
  - _evidence:_ navbar.html:31-42: <button class="navbar-toggler btnNavToggler" data-bs-toggle="collapse" data-bs-target="#navbarsRoom" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>  

### `navbars-room.html` — Right-side navbar controls from Angular trading room (Mastering The Trade session) — conta
- **[MED][mismatch] Container structure and layout** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - We use a flat flexbox `<nav class="topnav">` structure instead of Bootstrap's nested collapse/ul/li hierarchy. Reference uses Bootstrap utilities (collapse, navbar-collapse, navbar-nav, ml-auto); we use custom CSS Grid/Flexbox layout  
  - _evidence:_ navbars-room.html:1-9 `<div id="navbarsRoom" class="collapse navbar-collapse"><ul class="navbar-nav align-items-center ml-auto">` — Bootstrap navbar structure with navbar-collapse wrapper and navbar-nav ul  
- **[MED][mismatch] Alert sound checkbox** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference input name/id is 'alert-donot-disturb' (negative semantic: checked=suppress sound); we use name='alertSound' (positive semantic: checked=sound on). Reference label is `<label for="...">Alert sound <span>on</span></label>`; we use `<input>` + `Alert sound <span class="status">{alertSound ? 'on' : 'off'}</span>` inside the label. Both show dynamic on/off status  
  - _evidence:_ navbars-room.html:69-86 `<input type="checkbox" name="alert-donot-disturb" id="alert-donot-disturb" title="Alert sound" class="form-check-input"/><label for="alert-donot-disturb" class="form-check-label">Alert sound <span>on</span></label>` — input id/name is 'alert-donot-disturb', label shows 'Alert sound on'  
- **[MED][mismatch] QA sound checkbox** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Same as alert — reference name is 'qa-donot-disturb' (negative), we use 'qaSound' (positive). Label structure and dynamic status text match but semantic inversion differs  
  - _evidence:_ navbars-room.html:87-104 `<input type="checkbox" name="qa-donot-disturb" id="qa-donot-disturb" title="QA sound"/><label for="qa-donot-disturb">QA sound <span>on</span></label>`  
- **[MED][mismatch] NTA (Non-Trade Alert) sound checkbox** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference name is 'non-trade-donot-disturb'; we use 'ntaSound'. Both show 'NTA sound' label and dynamic on/off status. Semantic inversion (negative vs positive) differs  
  - _evidence:_ navbars-room.html:105-122 `<input type="checkbox" name="non-trade-donot-disturb" id="non-trade-donot-disturb" title="Non-trade alert sound"/><label for="non-trade-donot-disturb">NTA sound <span>on</span></label>` — label shows 'NTA sound' abbreviation  
- **[MED][mismatch] Chat sound checkbox** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference name is 'chat-donot-disturb' (negative); we use 'chatSound' (positive). Label structure and dynamic status match but semantics differ  
  - _evidence:_ navbars-room.html:123-141 `<input type="checkbox" name="chat-donot-disturb" id="chat-donot-disturb" title="Chat sound"/><label for="chat-donot-disturb">Chat sound <span>on</span></label>`  
- **[MED][mismatch] Don't Disturb checkbox** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference name is 'app-donot-disturb' (negative semantic); we use 'dontDisturb' (positive). Reference label omits the dynamic on/off status span; we include `<span class="status">{dontDisturb ? 'on' : 'off'}</span>` for consistency with other toggles. This is a UX difference — reference shows plain label, ours shows state  
  - _evidence:_ navbars-room.html:163-180 `<input type="checkbox" name="app-donot-disturb" id="app-donot-disturb" title="Don't Disturb"/><label for="app-donot-disturb"><span>Don't Disturb</span></label>` — input name is 'app-donot-disturb', label shows 'Don't Disturb' only (no status span in this one)  

### `navfile.html` — Bootstrap navbar-toggler button for collapsible room navigation (Angular snapshot)
- **[HIGH][missing] Navbar collapse toggle button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference is a Bootstrap collapse-toggle for a collapsible navbar (#navbarsRoom). Our codebase is Svelte, not Angular + Bootstrap. Our RoomTopNav has a menu-btn (sidebar toggle, lines 56-63) but it toggles a sidebar via onToggleSidebar callback, not a Bootstrap collapse. No '.navbar-toggler' or 'data-bs-toggle' equivalents in our stack.  
  - _evidence:_ navfile.html:1-12; <button type='button' class='navbar-toggler btnNavToggler' data-bs-toggle='collapse' data-bs-target='#navbarsRoom'>  
- **[HIGH][mismatch] Toggle button classes and attributes** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference button carries Angular's _ngcontent-ng-c977335924 scope marker and Bootstrap data attributes (data-bs-toggle, data-bs-target). Our button is a pure Svelte component with onclick handler (onToggleSidebar), aria-label, and title. No Bootstrap collapse mechanism; no Angular scope markers.  
  - _evidence:_ navfile.html:1-12; _ngcontent-ng-c977335924 (Angular scope attribute), data-bs-toggle='collapse', data-bs-target='#navbarsRoom', aria-controls='navbarsRoom'  
- **[MED][mismatch] Icon element inside toggle** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Bootstrap's .navbar-toggler-icon (an empty span rendered via CSS). Our button renders <Icon name='bars' size={18} /> — a Svelte Icon component that imports actual SVG/font glyph. Different icon strategy and rendering paradigm.  
  - _evidence:_ navfile.html:11; <span _ngcontent-ng-c977335924='' class='navbar-toggler-icon'></span>  

### `odds-and-ends.html` — Angular trading room UI snapshots (legacy) — contains isolated modals and components from 
- **[HIGH][mismatch] User Info Modal** → `UserInfoModal.svelte`  
  - Reference modal-body is empty (awaits content). Our component should populate user profile details, but template structure differs from the reference button arrangement.  
  - _evidence:_ odds-and-ends.html:34892-34993 — id="user-modal", modal-header with edit-user-avatar img, h3 modal-title with badge 'Offline', modal-body empty, modal-footer with @Mention, Private Chat, Follow, Mute buttons  
- **[HIGH][mismatch] General Settings Modal (User Settings)** → `SettingsModal.svelte`  
  - Reference shows classic radio button structure with old Bootstrap class names (form-check-input). Our component is in Svelte with modern styling but requires verification that all settings tabs/options are implemented.  
  - _evidence:_ odds-and-ends.html:35075-35425 — id="user-settings-modal", h5 'General Settings', nav tabs (App Settings, Alert Settings, Chat Settings), tab panes with color theme radios (Light/Dark), room layout radios (chat-alerts-left/top/right/bottom), PM window layout checkbox, chat color mode options  
- **[HIGH][mismatch] Audio/Video Settings Modal** → `AVSettingsModal.svelte`  
  - Reference has two tabs (user/presenter). Reference shows navbar structure for speaker selection; our implementation must verify feature-complete device management and tab structure.  
  - _evidence:_ odds-and-ends.html:36426-36673 — id="av-settings-modal", h5 'Audio/Video Settings', nav tabs (User Settings, presumably Presenter Settings), navbar-nav with 'Disable Video' link, form-group for Speakers dropdown with options 'Default - External Headphones' and test button, presenter tab with Audio device (input) and Video device (input) dropdowns, 'Change Devices' button, Save/Close footer buttons  
- **[HIGH][mismatch] Post Alert Modal** → `PostAlertModal.svelte`  
  - Reference shows rich tabbed interface with file upload. Our component's implementation should match or improve upon the structure; verify all tabs and options.  
  - _evidence:_ odds-and-ends.html:36750-37120 — id="alert-modal", h5 'Post Alert', nav tabs (Text Alert, Text Url, Image/GIF/Video), tab panes with textarea for alert text, url input with fa-link icon, file upload for images with drag-drop (id="filedragAlert"), multiple checkboxes (keepOpenChk, postOnXChk, alert-push-label, alert-non-trade-label, alert-legal-disclosure-label)  
- **[HIGH][mismatch] Poll Modal (Create/Canned Polls Panel)** → `PollModal.svelte`  
  - Reference shows floated panel with titlebar controls (minimize/maximize). Our implementation may be a modal dialog vs. floating panel — architectural difference in how polls are presented.  
  - _evidence:_ odds-and-ends.html:13148-13361 and 37122-37364 — id="pollModalCompHolder", poll-panel-titlebar with title 'Polls', minimize/maximize/close buttons (fa-window-minimize, fa-window-maximize, fa-times), poll-panel-body with nav tabs (Create New Poll, Pre-Canned Polls), h3 stepped form with label warnings (1,2,3), textarea/input fields for question and choices, anonymous-poll checkbox, Save To Canned and Send Poll buttons  
- **[HIGH][mismatch] Message component (app-st-message)** → `MessageBody.svelte (likely; exact compon`  
  - Reference shows classic Bootstrap message bubble with action menu. Our component structure in Svelte should be verified for feature-complete dropdown menu and message formatting.  
  - _evidence:_ odds-and-ends.html:102-459 — msg-box div with background color, avatar img, msgMenu dropdown (User Info, Mention, Copy), username strong, Q&A button with count and icon, created-at span, msg-left textarea content  
- **[MED][mismatch] Session Control Modal** → `SessionControlModal.svelte`  
  - Reference has minimal modal-body with no visible controls. Our implementation is feature-complete with action list (lock session, mute all, clear chat, kick duplicates, unlock room) with icons, labels, and hints.  
  - _evidence:_ odds-and-ends.html:13460-13506 — Bootstrap modal structure with id="session-control-modal", modal-dialog modal-lg, h5 title 'Session Control', empty modal-body, basic footer  
- **[MED][mismatch] Alerts Logs Modal** → `AlertLogsModal.svelte`  
  - Reference shows a simple list-group with date entries. Our component likely has more structured content/filtering but needs verification of feature parity.  
  - _evidence:_ odds-and-ends.html:13364-13458 — id="alerts-logs-modal", modal-header h5 'Alerts Logs', btn-close-white, modal-body with 'Reload Log List' button and list-group-items showing dates/by fields, modal-footer 'Close' button  
- **[MED][mismatch] Debug Log Modal** → `DebugLogModal.svelte`  
  - Reference structure not fully visible in audit sample. Verify debug log UI against our implementation.  
  - _evidence:_ odds-and-ends.html:36674-36752 — id="debug-log-modal", h5 title, modal-body with content structure unknown (truncated in sample), modal-footer  
- **[MED][mismatch] Alert Filter Modal** → `AlertFilterModal.svelte`  
  - Reference structure not fully extracted. Audit incomplete for this surface.  
  - _evidence:_ odds-and-ends.html:119259-? — id="alert-filter-modal", structure not fully sampled  
- **[MED][mismatch] Alert Send Report Modal** → `AlertSendReportModal.svelte`  
  - Reference structure not fully extracted. Audit incomplete for this surface.  
  - _evidence:_ odds-and-ends.html:118642-? — id="alert-send-report-modal", structure not fully sampled  
- **[MED][mismatch] All User PM Modal** → `AllUserPmModal.svelte`  
  - Reference structure not fully extracted. Audit incomplete for this surface.  
  - _evidence:_ odds-and-ends.html:118712-? — id="all-user-pm-modal", structure not fully sampled  
- **[MED][mismatch] Advanced Search Modal** → `AdvancedSearchModal.svelte`  
  - Reference structure not fully extracted. Audit incomplete for this surface.  
  - _evidence:_ odds-and-ends.html:118783-? — id="alerts-advanced-search-modal", structure not fully sampled  
- **[MED][missing] Chat Logs Modal** → `ChatLogsModal.svelte`  
  - Reference chat logs modal present but not fully audited; our implementation exists but feature parity unknown.  
  - _evidence:_ odds-and-ends.html:117663 — closing tag observed, structure not sampled in detail  
- **[MED][mismatch] Alerts panel with navbar (app-alerts component)** → `AlertFeed.svelte`  
  - Reference shows navbar with header controls (search, settings). Our AlertFeed component may have different nav structure; verify UI controls match.  
  - _evidence:_ odds-and-ends.html:33-94 — nav navbar-light with fa-bell icon, 'Alerts' brand, search icon, settings gear icon dropdown  
- **[LOW][mismatch] Connected notification overlay (id=connectedMsg)** → `ConnectionOverlay.svelte`  
  - Reference uses old Angular directive `animated fadeIn`, plain icon markup, typo 'Conected'. Our component uses Svelte transitions, properly spelled 'Connected', and structured icon import.  
  - _evidence:_ odds-and-ends.html:1-7 — `<div id="connectedMsg" class="notConnectedOverlay animated fadeIn"><i class="fas fa-check"></i> Conected</div>`  
- **[LOW][mismatch] Play YouTube Modal** → `PlayYouTubeModal.svelte`  
  - Reference uses input-group-text spans as buttons; our implementation likely uses proper <button> elements. Structure and labeling are similar but DOM patterns differ.  
  - _evidence:_ odds-and-ends.html:34994-35074 — id="play-youtube-modal", h5 'Play YouTube For All', input-group with text input (placeholder 'Paste YouTube URL'), two input-group-text buttons 'Save' and 'Play For All', modal-footer with Close button  
- **[LOW][mismatch] WebRTC Troubleshooter Modal** → `ConnectivityCheckModal.svelte`  
  - Reference has app-webrtc-troubleshooter component (Angular). We have ConnectivityCheckModal.svelte (Svelte). Names differ but functionality is analogous; verify feature parity of connectivity testing UI.  
  - _evidence:_ odds-and-ends.html:119334-119485 — id="webrtc-troubleshooter-modal", app-webrtc-troubleshooter component wrapping modal  

### `pagesource.html` — Base HTML shell - Angular application (legacy/archived version of PTRChat trading room). T
- **[?][mismatch] Framework Architecture** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - pagesource.html is an Angular app bootstrap document; our codebase uses SvelteKit. The snapshot is from a legacy/previous version of the application.  
  - _evidence:_ pagesource.html:1-2 & lines 608-612: Uses Angular (`<app-root></app-root>` + Angular scripts like runtime, polyfills, main). Current codebase (web/src/app.html) uses SvelteKit with `%sveltekit.body%` placeholder.  
- **[?][mismatch] DOCTYPE and Base Tag** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Legacy Angular app used relative base path routing; SvelteKit does not require this.  
  - _evidence:_ pagesource.html:1,7: `<!doctype html>` with `<base href="/" />` (Angular base routing). Current app.html:1-2: `<!doctype html>` with no base tag (SvelteKit uses standard routing).  
- **[?][mismatch] External Dependencies (FontAwesome)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Legacy snapshot includes FontAwesome v5.8.1 from CDN; current SvelteKit app does not reference FontAwesome in app.html (may be imported elsewhere in components).  
  - _evidence:_ pagesource.html:14-18: FontAwesome v5.8.1 CSS link with integrity hash (cdn.fontawesome). Current app.html has no FontAwesome import.  
- **[?][mismatch] Animate.css Library** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Legacy snapshot includes animate.css library; current app does not reference it at app shell level.  
  - _evidence:_ pagesource.html:19-22: External link to animate.css v3.7.2 from cdnjs. Current app.html has no animate.css.  
- **[?][missing] Utility JavaScript Functions** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Legacy Angular app embeds global image modal and chat utility functions in app shell; SvelteKit app.html does not include these (likely handled in component code instead).  
  - _evidence:_ pagesource.html:80-179: Contains three utility functions: `openImageModal()`, `downloadImage()`, `removeImageFromChat()`, `showChatGif()`. Current app.html has no script tag.  
- **[?][mismatch] CSS Variables (Theme System)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Legacy Angular app centralizes theme variables in app.html shell; SvelteKit app likely uses CSS modules or separate stylesheet imports.  
  - _evidence:_ pagesource.html:182-567: Extensive custom property definitions (--blue, --primary, --dark-gray, --modal-content-bg-color, --lightTheme-*, --darkTheme-*) spanning 385 lines. Current app.html has no CSS variables.  
- **[?][mismatch] Bootstrap/Form Validation CSS** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Legacy app includes Bootstrap 5 CSS variable framework; current SvelteKit app.html does not include Bootstrap theme vars.  
  - _evidence:_ pagesource.html:263-391: Full Bootstrap 5 CSS variable definitions (--bs-blue, --bs-primary, --bs-form-valid-color, etc.). Current app.html has no Bootstrap variables.  
- **[?][mismatch] Font Imports (Lato, Google Fonts)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Legacy app imports only Lato via CSS rule; current app imports both Open Sans (wght 400,600,700,800) and Lato (wght 400,700) via <link> tags in head.  
  - _evidence:_ pagesource.html:181 & 209-212: Imports Lato from Google Fonts within style tag. Current app.html:9-11: Uses `<link>` to import Open Sans + Lato from Google Fonts.  
- **[?][mismatch] Viewport Meta Tag** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Legacy includes `target-densitydpi=device-dpi` (iOS-specific); current app uses simpler viewport config.  
  - _evidence:_ pagesource.html:8-11: `<meta name="viewport" content="width=device-width, initial-scale=1.0, target-densitydpi=device-dpi">`. Current app.html:5: `<meta name="viewport" content="width=device-width, initial-scale=1" />`  
- **[?][mismatch] Stylesheet Loading Strategy** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Legacy uses progressive CSS loading; current SvelteKit app.html relies on bundler to inject styles.  
  - _evidence:_ pagesource.html:597-605: Links CSS with media="print" and onload handler to switch to media="all". Current app.html has no stylesheet link.  
- **[?][mismatch] Page Title** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Legacy hardcodes "PTRChat" title in app shell; SvelteKit uses per-route page titles.  
  - _evidence:_ pagesource.html:5: `<title>PTRChat</title>`. Current app.html has no title (SvelteKit pages set via page layout/meta).  

### `reload.html` — Reload Navigation Item (Angular snapshot)
- **[HIGH][mismatch] Reload Navigation Item Container** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses Angular `<li>` with nested `<a>` element (nav-item/nav-link pattern). Current implementation uses a `<button>` element with classes `icon-btn nav-link-btn`. The wrapper container is completely different (list item vs. button button). The class names differ: `nav-item`, `nav-link`, `d-flex`, `align-items-center`, `mainNavItem` in reference vs. `icon-btn`, `nav-link-btn` in current.  
  - _evidence:_ reload.html:1-8: `<li _ngcontent-ng-c977335924="" title="Reload" class="nav-item">` with `<a _ngcontent-ng-c977335924="" class="nav-link d-flex align-items-center">` child  
- **[HIGH][mismatch] Reload Icon** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses FontAwesome direct `<i>` tag with `fas fa-2x fa-sync` classes. Current implementation uses Svelte Icon component: `<Icon name="sync" size={32} class="nav-muted-icon" />`. The fa-2x (32px) size matches the Icon size={32}, but the implementation approach is fundamentally different (direct HTML vs. component abstraction).  
  - _evidence:_ reload.html:3: `<i _ngcontent-ng-c977335924="" class="fas fa-2x fa-sync"></i>`  
- **[HIGH][mismatch] Structural Architecture** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference snapshot is from an Angular application (indicated by `_ngcontent-ng-c977335924` change detection markers). Current codebase is Svelte/SvelteKit. The entire framework, build system, and component model have changed. The reload button is now in a button bar with icon styling rather than a Bootstrap/Angular list-item pattern.  
  - _evidence:_ reload.html: Full file structure with Angular `_ngcontent-*` attributes and list item semantics  
- **[MED][mismatch] Reload Label Text** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference includes a text span with `ml-2 mainNavItem` classes ('Reload' label). Current implementation uses aria-label="Reload" and title="Reload" attributes on the button but does NOT render visible text—the reload control is icon-only. The label is now machine-readable instead of visually displayed.  
  - _evidence:_ reload.html:4-5: `<span _ngcontent-ng-c977335924="" class="ml-2 mainNavItem">Reload</span>`  

### `subnavbar.html` — Reference subnavbar HTML snapshot from protradingroom.com — tab navigation for Screens/Not
- **[HIGH][mismatch] Tab bar wrapper element** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses `<ul class="nav nav-tabs mainTabset">` with Bootstrap tab classes. Ours uses `<div class="tabbar" role="tablist">` — different element type and no Bootstrap classes.  
  - _evidence:_ subnavbar.html:1-6 — `<ul id="mainTabs" role="tablist" class="nav nav-tabs mainTabset">`  
- **[HIGH][mismatch] Tab list items wrapper** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference wraps each tab in `<li role="presentation">` with `<a>` element and Bootstrap tab data attributes (data-bs-toggle, data-bs-target). Ours renders `<button role="tab">` directly without wrapper.  
  - _evidence:_ subnavbar.html:7-26 (Screens tab) — wrapped in `<li role="presentation" class="nav-item">` containing `<a>` element with data-bs-toggle="tab"  
- **[HIGH][mismatch] Screens tab structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses nested divs with Bootstrap utility classes (d-flex, ml-1) and FontAwesome `<i>` icon. Ours uses Icon component with no nested divs. Reference has data-bs-toggle/data-bs-target; ours uses onclick handler.  
  - _evidence:_ subnavbar.html:8-24 — `<a id="screens-tab" data-bs-toggle="tab" data-bs-target="#screens" role="tab" class="nav-link active"><div class="d-flex"><div><i class="fas fa-desktop"></i><span class="ml-1">Screens</span></div></div></a>`  
- **[HIGH][mismatch] Files tab structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses nested divs with Bootstrap classes (d-flex, align-items-center, mx-1) and fa-folder icon. Ours uses Icon component with no nested divs.  
  - _evidence:_ subnavbar.html:83-106 — `<a data-bs-toggle="tab" data-bs-target="#files" role="tab" class="nav-link"><div class="d-flex align-items-center"><div><i class="fas fa-folder"></i><span class="mx-1">Files</span></div><!----></div></a>`  
- **[HIGH][mismatch] Bootstrap tab CSS classes** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference relies on Bootstrap utility and tab classes for styling. Our component uses custom CSS classes (tabbar, active, locked-pill) without Bootstrap. Gap, padding, spacing all custom-styled.  
  - _evidence:_ subnavbar.html throughout — Uses 'nav', 'nav-tabs', 'nav-item', 'nav-link', 'nav-link active', 'd-flex', 'align-items-center', 'ml-1', 'mx-1'  
- **[MED][mismatch] Notes tab with change indicator** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference has custom class 'presAreaTabs-notes' on Notes tab and id 'noteChangeIndicator' on the edit icon. Our component has no special styling or change indicator on Notes tab icon.  
  - _evidence:_ subnavbar.html:53-81 — `<a id="notes-tab" class="nav-link presAreaTabs-notes"><div class="d-flex align-items-center"><div><i id="noteChangeIndicator" class="fas fa-edit"></i><span class="mx-1">Notes</span></div><!----></div></a>`  
- **[MED][mismatch] Streams tab (hidden)** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference snapshot includes hidden Streams tab. Our TABS array has only ['screens', 'notes', 'files'] — no Streams tab defined, even hidden.  
  - _evidence:_ subnavbar.html:27-52 — `<li ... hidden="">` with Streams tab marked hidden with podcast icon and class 'fa-podcast'  
- **[MED][mismatch] Tab icon implementation** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses FontAwesome via `<i>` tags. Our component uses custom Icon component with name props ('desktop', 'edit', 'folder').  
  - _evidence:_ subnavbar.html:19, 45, 72, 98, 125, 148 — FontAwesome `<i class="fas fa-desktop">` / `fa-edit` / `fa-podcast` / `fa-folder`  
- **[LOW][mismatch] DOM structure duplication** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference HTML contains exact duplicate of the entire tab bar (lines 1-107 repeated at 154-260). This appears to be an artifact of the HTML snapshot, not part of our component.  
  - _evidence:_ subnavbar.html:1-107 and 154-260 — Entire tab structure repeated twice, identical from line 154  
- **[LOW][mismatch] Orphaned elements** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference HTML contains floating `<li>` tab items (lines 109-132, 134-152) that are not wrapped in a `<ul>`. These appear malformed and are likely artifacts of the HTML extraction.  
  - _evidence:_ subnavbar.html:109-152 — Orphaned `<li>` and `<li hidden>` elements outside any `<ul>` container between the two tab bar copies  

### `webcamholder.html` — app-webcam-holder wrapper with app-presenter-cams children (Angular)
- **[?][mismatch] Root component wrapper** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference is nested Angular component structure (app-webcam-holder > div.webcam-wrapper) with Bootstrap utility classes; ours is Svelte with conditional rendering. Reference uses Bootstrap flex utilities (d-flex, justify-content-center, flex-wrap, align-items-end) vs. our CSS custom properties and flexbox directly.  
  - _evidence:_ webcamholder.html:1–2 `<app-webcam-holder _ngcontent-ng-c977335924="" _nghost-ng-c654575438=""><div class="webcam-wrapper d-flex justify-content-center flex-wrap align-items-end w-100">`  
- **[?][mismatch] Presenter card container** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses class names 'card webcamsHolder' with id 'webcamsHolder-'; ours uses only class 'card'. Reference structure implies each card is wrapped in app-presenter-cams component; ours renders inline in each loop iteration.  
  - _evidence:_ webcamholder.html:9–12 `<div _ngcontent-ng-c4054903792="" class="card webcamsHolder" id="webcamsHolder-">`  
- **[?][mismatch] Video element** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference has class 'webcamsHolderVideo' with id 'webcamVideo-'; ours has no class attribute on video. Reference specifies autoplay="autoplay" with string value; ours uses boolean autoplay. Ours adds muted and playsinline attributes not present in reference.  
  - _evidence:_ webcamholder.html:14–19 `<video _ngcontent-ng-c4054903792="" autoplay="autoplay" class="webcamsHolderVideo" id="webcamVideo-"></video>`  
- **[?][mismatch] Name label structure** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses h5.pNameLabel.m-0 with close icon as first child; ours uses span.name with publisher name text and close button as sibling. Reference has nested structure (h5 > span.closeIcon > i.fas.fa-times); ours has separate span.name (with fallback 'Presenter') and button.close (with Icon component).  
  - _evidence:_ webcamholder.html:21 `<h5 _ngcontent-ng-c4054903792="" class="pNameLabel m-0">` (empty h5 with only closeIcon span inside)  
- **[?][mismatch] Close icon button** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference wraps icon in span.closeIcon with no button element; ours is proper <button> with aria-label, title, onclick handler, and Icon component (not raw <i class="fas fa-times">). Reference shows close icon always rendered; ours conditionally renders only if onClose prop exists AND publisher.isLocal is true.  
  - _evidence:_ webcamholder.html:22–27 `<span _ngcontent-ng-c4054903792="" class="closeIcon"><i _ngcontent-ng-c4054903792="" class="fas fa-times"></i></span>`  
- **[?][mismatch] Component composition** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference uses separate app-presenter-cams component per publisher (each is its own component instance); ours renders cards inline via {#each} loop without intermediate component wrapper. Reference architecture adds an extra component layer that ours does not have.  
  - _evidence:_ webcamholder.html:6–29 and 30–54 show two repeated app-presenter-cams instances with identical structure  
- **[?][missing] Publisher identification** → `/Users/billyribeiro/Desktop/pro-room/pro`  
  - Reference assigns IDs to each video and card container; ours does not generate or expose IDs on these elements. Reference pattern implies dynamic id generation per publisher (e.g. webcamsHolder-userId, webcamVideo-userId) that is missing in our implementation.  
  - _evidence:_ webcamholder.html:12 and 36 use id="webcamsHolder-" and id="webcamVideo-" with empty suffix (implies IDs generated by template)  
