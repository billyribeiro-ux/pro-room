# Deep Visual Hard Evidence

Generated: 2026-06-14T23:42:59.640Z

## Source Counts

- Original HTML fragments rendered: 52
- Current named repo screenshots indexed: 21
- Fresh Playwright failure screenshots indexed: 4
- Total current-side screenshots indexed: 25
- Capture geometry files rendered: 4
- Original harvested CSS: /private/tmp/original-app-evidence/analyzed-2026-06-14T22-21-48-994Z/resources/0003-chat.protradingroom.com_styles.0d26360b9b3e223c.css-80f1b521a71b.css
- Original code evidence: /private/tmp/original-app-evidence/analyzed-2026-06-14T22-21-48-994Z/original-app-full-code-evidence.md

## Limits

- Original visuals are rendered from saved HTML fragments plus the harvested original CSS, not a new live original-app browser session.
- Current repo screenshots include the named e2e screenshot artifacts plus Playwright failure screenshots from the latest run when present.
- Cards with no current screenshot are source/code-evidence only until fresh role-specific screenshots are captured.
- Hidden modals/fragments are force-shown for inspection; that is marked as inspection rendering, not native runtime state.

## Section List: Correct Version vs Our Version

### Room Shell / Full Layout
- Correct version: Angular room shell uses top fixed Bootstrap nav, left room sidebar, angular-split/as-split areas, alerts/chat pane, and presentation area in one dense work UI.
- Our version: Svelte room shell exists and has the same broad regions, but current screenshots/code use custom CSS/grid/button markup instead of the reference Bootstrap/as-split DOM.
- Confidence: Strong for section existence and broad layout; exact parity must be validated live after code changes.
- Original files: file-1.html, file2.html, file3.html, file4.html, file6.html, important-doc.html, as-splitter.html
- Repo screenshots: 01-room-loaded.png
- Repo paths: web/src/routes/rooms/+page.svelte, web/src/lib/components/RoomTopNav.svelte, web/src/lib/components/RoomSidebar.svelte, web/src/lib/components/AlertsChatDock.svelte, web/src/lib/components/MainStage.svelte

### Top Navbar / Volume / Reload
- Correct version: Bootstrap navbar with mainAppNav, hamburger/sidebar menu, user/mobile indicators, dropdownVolume, volume slider, sound toggles, and fa-sync reload nav item.
- Our version: RoomTopNav component exists, but evidence points to a custom topbar implementation and likely different dropdown/nav-link/button structure.
- Confidence: Strong for original structure from isolated nav fragments and capture JSON; current visual is from existing repo screenshot, not fresh live run.
- Original files: file5.html, navbar.html, navbars-room.html, dropdownstart.html, dropdownvolume.html, navfile.html, reload.html
- Repo screenshots: 01-room-loaded.png
- Repo paths: web/src/lib/components/RoomTopNav.svelte, web/src/lib/components/Nav.svelte

### Sidebar / Roster / Admin Controls
- Correct version: Reference sidebar is Bootstrap nav list with Mobile App Info, Connectivity Check, General Settings, Archives, muted/followed users, active room users, sort/search/user option buttons, and role-gated controls.
- Our version: Sidebar/member panel exists, but evidence needs live admin/presenter/member captures for exact gated controls and roster geometry.
- Confidence: Medium: original evidence is strong, current-state parity needs fresh role-specific screenshots.
- Original files: file4.html, important-doc.html, odds-and-ends.html
- Repo screenshots: 21-members-online.png
- Repo paths: web/src/lib/components/RoomSidebar.svelte, web/src/lib/components/MembersPanel.svelte

### Presentation Tabs / Screens / Streams / Notes / Files
- Correct version: Bootstrap nav-tabs list with Screens, hidden Streams in some captures, Notes with noteChangeIndicator/edit icon, Files with folder icon, and note sub-tabs including home/pen badges.
- Our version: Existing repo screenshots include Streams/Notes/Files states, but source inspection previously showed some tab assumptions were stale. This must be checked against current code before calling it fixed.
- Confidence: Strong for original tab markup; medium for repo because screenshots may be stale.
- Original files: subnavbar.html, mixednavs.html, afterwebcamholder.html, file6.html
- Repo screenshots: 02-tab-streams.png, 03-tab-notes.png, 04-tab-files.png
- Repo paths: web/src/lib/components/MainStage.svelte, web/src/lib/components/ScreenStage.svelte, web/src/lib/components/NotesPanel.svelte, web/src/lib/components/FilesPanel.svelte

### Alerts Panel / Alert Rows / Posting Flow
- Correct version: Reference alerts feed is read-only for rows; posting is routed through Post Alert modal. Rows use dense Bootstrap message bubbles, QA/reaction/menu affordances, and row menu actions.
- Our version: Our screenshots show Post Alert flow and row menu, but code must be checked for any leftover inline composer or non-reference row/menu chrome.
- Confidence: Strong for correct flow; current parity depends on code read/live screenshot.
- Original files: file2.html, file6.html, as-splitter.html
- Repo screenshots: 05-alert-modal.png, 06-alert-modal-filled.png, 07-alert-posted.png, 08-alert-row-menu.png
- Repo paths: web/src/lib/components/AlertFeed.svelte, web/src/lib/components/PostAlertModal.svelte

### Post Alert Modal
- Correct version: Bootstrap modal #alert-modal with Text Alert, Text Url, combined Image / GIF / Video tab, textarea, URL input group, upload label/drop zone, footer checkboxes, green Post Alert.
- Our version: Current screenshot shows a Post Alert modal, but first-pass evidence was too narrow; the deeper card compares the original single saved modal directly against current screenshot and component path.
- Confidence: Strong.
- Original files: file12.html
- Repo screenshots: 05-alert-modal.png, 06-alert-modal-filled.png
- Repo paths: web/src/lib/components/PostAlertModal.svelte

### Poll Window / Poll Panel
- Correct version: Reference is a floating draggable poll panel with titlebar controls, Create New Poll and Pre-Canned Polls tabs, step labels, Add Choice, Save To Canned, and Send Poll.
- Our version: Current screenshot shows a poll create surface; compare carefully for floating titlebar chrome, canned tab, and Save To Canned before calling it matched.
- Confidence: Strong for original, medium for current screenshot freshness.
- Original files: file13.html, odds-and-ends.html
- Repo screenshots: 13-poll-modal.png, 14-poll-created.png, 15-poll-voted.png, 16-poll-closed.png
- Repo paths: web/src/lib/components/PollModal.svelte, web/src/lib/components/PollPanel.svelte

### User Settings Modal
- Correct version: Bootstrap modal #user-settings-modal with App Settings, Alert Settings, Chat Settings tabs, radio/checkbox groups for color theme, layout, chat color mode, sound toggles, and chat text size number input.
- Our version: No current repo screenshot artifact found for this modal. Must use code inspection or generate fresh screenshot before visual parity claim.
- Confidence: Strong original, weak current visual until captured.
- Original files: appusersettingsmodal.html, file9.html
- Repo screenshots: none found yet
- Repo paths: web/src/lib/components/modals/SettingsModal.svelte, web/src/lib/components/RoomSidebar.svelte

### Audio/Video Settings Modal
- Correct version: Bootstrap AV settings modal with User Settings and Presenter Settings tabs, speaker output selector/test, presenter mic/cam selectors, and Save/Close footer.
- Our version: No current repo screenshot artifact found. Current implementation needs visual capture for exact tab/nav/form/footer parity.
- Confidence: Strong original, weak current visual until captured.
- Original files: avsettingsmodal.html, avsettingsmodal1.html, file10.html
- Repo screenshots: none found yet
- Repo paths: web/src/lib/components/modals/AVSettingsModal.svelte

### Advanced Search / Alert Filter / Scheduled Alerts
- Correct version: Reference uses Bootstrap modal chrome. Advanced Search has title Rooms refresh button, dropdown-menu multi-selects, text search, checkbox filters, datetime fields. Scheduled Alerts is modal-xl table Date/Time, Sender, Alert, Repeat, Actions.
- Our version: No local screenshot artifact for these surfaces; existing docs say these are high-risk until visual capture confirms dropdown/table structure.
- Confidence: Strong original, weak current visual until captured.
- Original files: file25.html, file28.html, file29.html
- Repo screenshots: none found yet
- Repo paths: web/src/lib/components/modals/AdvancedSearchModal.svelte, web/src/lib/components/modals/AlertFilterModal.svelte, web/src/lib/components/modals/ScheduledAlertsModal.svelte

### Session / Logs / Reports Admin Modals
- Correct version: Reference admin modals use Bootstrap modal hierarchy, title-specific ids, modal headers/footers, list groups/tables/loading states, and role-gated visibility.
- Our version: Session screenshots exist; logs/reports/all-PM need fresh current visual capture before claiming exact match.
- Confidence: Medium: original modal shells are strong; some bodies are async/empty in captures.
- Original files: file11.html, file14.html, file15.html, file16.html, file26.html, file27.html
- Repo screenshots: 19-session-control.png, 20-confirm-clear-chat.png
- Repo paths: web/src/lib/components/modals/SessionControlModal.svelte, web/src/lib/components/modals/DebugLogModal.svelte, web/src/lib/components/modals/ChatLogsModal.svelte, web/src/lib/components/modals/AlertLogsModal.svelte, web/src/lib/components/modals/AlertSendReportModal.svelte, web/src/lib/components/modals/AllUserPmModal.svelte

### Chat / Private Chat / Reply / QA
- Correct version: Reference chat/PM/reply surfaces use dense Bootstrap message rows, textareas with image/GIF/emoji affordances, private chat docked panel, followed/muted user modals, and Q&A modal shell.
- Our version: Current chat screenshots cover basic chat/reactions only; private/reply/QA/followed/muted need dedicated current visuals.
- Confidence: Medium.
- Original files: file18.html, file19.html, file20.html, file21.html, file24.html, file32.html
- Repo screenshots: 09-chat-main.png, 10-chat-offtopic.png, 11-reaction-picker.png, 12-reaction-added.png
- Repo paths: web/src/lib/components/ChatPanel.svelte, web/src/lib/components/PrivateChat.svelte, web/src/lib/components/modals/ReplyModal.svelte, web/src/lib/components/modals/AlertQaModal.svelte, web/src/lib/components/modals/MutedUsersModal.svelte, web/src/lib/components/modals/FollowedUsersModal.svelte

### Media / YouTube / Mobile App / Screen Share / Recording
- Correct version: Reference includes Play YouTube For All modal, mobile app modal with store badges, draggable/resizable screen-share and rec preview cards, WebRTC troubleshooter rows, rich text editor shell, toast container, and hidden webcam audio sink.
- Our version: Some media screenshots exist; screen-share/recording/toast/audio sink/mobile/settings require current visual or code evidence before exact parity claims.
- Confidence: Medium.
- Original files: file8.html, file17.html, file22.html, file23.html, file30.html, file31.html, file33.html, file34.html, webcamholder.html, afterwebcamholder.html
- Repo screenshots: 17-media-modal.png, 18-media-playing.png
- Repo paths: web/src/lib/components/MediaPlayer.svelte, web/src/lib/components/WebcamHolder.svelte, web/src/lib/components/modals/MediaForAllModal.svelte, web/src/lib/components/modals/MobileAppInfoModal.svelte, web/src/lib/components/modals/ConnectivityCheckModal.svelte, web/src/lib/components/modals/RichTextEditorModal.svelte, web/src/lib/components/RecPreview.svelte

## Original Fragment Atlas

### afterwebcamholder.html
- Thumbnail: original-fragments/afterwebcamholder.html.png
- Source: files/afterwebcamholder.html
- SHA: 13a6f559dfaf287f
- Size: 3.9 KB
- App selectors: app-presenter-cams
- Modal ids: none
- Important ids: noteChangeIndicator, notes-tab, screens-tab, webcamVideo-, webcamsHolder-
- Audited gaps: 8; high: 2

### appusersettingsmodal.html
- Thumbnail: original-fragments/appusersettingsmodal.html.png
- Source: files/appusersettingsmodal.html
- SHA: 430c1096f7ce5e53
- Size: 63.7 KB
- App selectors: app-user-settings-modal
- Modal ids: alert-compact-mode, alert-donot-disturb, alert-popup-donot-disturb, alert-regular-mode, alertDoNotDisturb, alertPopup, alertTextMode, chat-alerts-bottom, chat-alerts-left, chat-alerts-right, chat-alerts-top, longer-alert-popup, non-trade-alert, user-alert-settings, user-alert-settings-tab, user-app-settings, user-app-settings-tab, user-chat-settings, user-chat-settings-tab, user-settings-modal
- Important ids: alert-compact-mode, alert-donot-disturb, alert-popup-donot-disturb, alert-regular-mode, alertDoNotDisturb, alertPopup, alertTextMode, alwaysScrollToBottom, app-dark-theme, app-disable-video, app-donot-disturb, app-light-theme, app-reactions-popup, app-reactions-popup-qa, app-reactions-sound-qa, app-recording-start-sound, app-recording-stop-sound, app-speech-reco-overlay, appDisableVideo, appDoNotDisturb, appSpeechRecoOverlay, chat-alerts-bottom, chat-alerts-left, chat-alerts-right, chat-alerts-top, chat-always-scroll, chat-badges-donot-disturb, chat-bg-color, chat-compact-mode, chat-donot-disturb
- Audited gaps: 25; high: 0

### as-splitter.html
- Thumbnail: original-fragments/as-splitter.html.png
- Source: files/as-splitter.html
- SHA: 8cff6c0cb8da970f
- Size: 937.0 KB
- App selectors: app-alerts, app-chat, app-note, app-presentationarea, app-presenter-cams, app-roomscroller, app-st-message, app-webcam-holder
- Modal ids: none
- Important ids: 652765a0e494735aa53574ba, 652765a0e494735aa53574ba-tab, 665874b2692d34204762bb73, 665874b2692d34204762bb73-tab, 68385e5f7568b13c34072e13, 68385e5f7568b13c34072e13-tab, 6879121b8f9c6824f6f03266, 6879121b8f9c6824f6f03266-tab, 68ac8cdb207a2a2927a27775, 68ac8cdb207a2a2927a27775-tab, 6953c35f88f24e0dd42a1218, 6953c35f88f24e0dd42a1218-tab, basic-addon1, chatScrollViewParentAlerts, docs-internal-guid-2b81aed8-7fff-5e6b-3df4-740ad0bc32f3, docs-internal-guid-3cf97d5e-7fff-6ae2-e3ed-e28c1f11416e, docs-internal-guid-4071bd07-7fff-f7a7-3707-c62db945bdd1, docs-internal-guid-7a7c6d17-7fff-2242-234c-f86e7d095ba4, docs-internal-guid-7d4fefb6-7fff-6967-8759-1cd2380ca685, docs-internal-guid-886b0096-7fff-323b-66d1-9769e7cc373f, docs-internal-guid-936bf10b-7fff-2343-cc96-ee8179cc199c, docs-internal-guid-9d8d5e97-7fff-337e-dfcb-3386430b68a6, docs-internal-guid-b7f4d388-7fff-8196-b56c-a66f9387a978, docs-internal-guid-c18f77ca-7fff-1047-6ab4-e876f31179a1, docs-internal-guid-cfb9da61-7fff-b014-faa9-7bec519343cc, dropdownMenuLink, files, files-tab, id_6a26e2a593c3cb36774c909f, id_6a26e2b993c3cb36774c90a2
- Audited gaps: 18; high: 3

### avsettingsmodal.html
- Thumbnail: original-fragments/avsettingsmodal.html.png
- Source: files/avsettingsmodal.html
- SHA: 9e631bc4577e009f
- Size: 10.0 KB
- App selectors: none
- Modal ids: av-settings-modal, presenter-audio-video-settings, user-audio-video-settings, user-audio-video-settings-tab
- Important ids: audio-deviceList, av-settings-modal, presenter-audio-video-settings, speakers-device, user-audio-video-settings, user-audio-video-settings-tab, userSettingsTab, userSettingsTabContent, video-deviceList
- Audited gaps: 12; high: 2

### avsettingsmodal1.html
- Thumbnail: original-fragments/avsettingsmodal1.html.png
- Source: files/avsettingsmodal1.html
- SHA: edf8be065dbea227
- Size: 10.9 KB
- App selectors: app-av-settings-modal
- Modal ids: av-settings-modal, presenter-audio-video-settings, user-audio-video-settings, user-audio-video-settings-tab
- Important ids: audio-deviceList, av-settings-modal, presenter-audio-video-settings, speakers-device, user-audio-video-settings, user-audio-video-settings-tab, userSettingsTab, userSettingsTabContent, video-deviceList
- Audited gaps: 12; high: 2

### connected.html
- Thumbnail: original-fragments/connected.html.png
- Source: files/connected.html
- SHA: e609a4760a04467b
- Size: 186 B
- App selectors: none
- Modal ids: none
- Important ids: connectedMsg
- Audited gaps: 7; high: 2

### dropdownstart.html
- Thumbnail: original-fragments/dropdownstart.html.png
- Source: files/dropdownstart.html
- SHA: b955c74c729df11a
- Size: 6.0 KB
- App selectors: none
- Modal ids: alert-donot-disturb
- Important ids: alert-donot-disturb, app-donot-disturb, chat-donot-disturb, dropdownVolume, non-trade-donot-disturb, presentation-subtitles, qa-donot-disturb
- Audited gaps: 15; high: 4

### dropdownvolume.html
- Thumbnail: original-fragments/dropdownvolume.html.png
- Source: files/dropdownvolume.html
- SHA: f1e6d4f3cbfa3426
- Size: 5.0 KB
- App selectors: none
- Modal ids: alert-donot-disturb
- Important ids: alert-donot-disturb, app-donot-disturb, chat-donot-disturb, non-trade-donot-disturb, presentation-subtitles, qa-donot-disturb
- Audited gaps: 12; high: 0

### file-1.html
- Thumbnail: original-fragments/file-1.html.png
- Source: files/file-1.html
- SHA: 0d3ebe334166c6ca
- Size: 169.6 KB
- App selectors: none
- Modal ids: none
- Important ids: dynamic-favicon
- Audited gaps: 23; high: 1

### file2.html
- Thumbnail: original-fragments/file2.html.png
- Source: files/file2.html
- SHA: 602c321d14e4f511
- Size: 5.6 MB
- App selectors: app-alert-filter-modal, app-alert-logs-modal, app-alert-qa-modal, app-alert-send-report-modal, app-alerts, app-alerts-advanced-search, app-all-user-pmmodal, app-av-settings-modal, app-chat, app-chat-logs-modal, app-debug-log-modal, app-followed-users-modal, app-mobile-app-info-modal, app-muted-users-modal, app-note, app-play-youtube-modal, app-poll-modal, app-post-alert-modal, app-presentationarea, app-presenter-cams, app-privchat, app-rec-preview, app-reply-modal, app-rich-text-editor, app-room, app-room-roster, app-roomscroller, app-root, app-scheduled-alerts-modal, app-screenshare-preview, app-session-control-modal, app-st-message, app-user-info-modal, app-user-settings-modal, app-webcam-holder, app-webrtc-troubleshooter
- Modal ids: alert-compact-mode, alert-donot-disturb, alert-filter-modal, alert-legal-disclosure-label, alert-modal, alert-non-trade-label, alert-popup-donot-disturb, alert-push-label, alert-regular-mode, alert-send-report-modal, alertDoNotDisturb, alertPopup, alertQALabel, alertQAModal, alertTextMode, alerts-advanced-search-modal, alerts-logs-modal, all-user-pm-modal, anonymous-poll, av-settings-modal, chat-alerts-bottom, chat-alerts-left, chat-alerts-right, chat-alerts-top, chat-logs-modal, debug-log-modal, debugLogModalTxt, followedUsersModal, followedUsersModalLabel, longer-alert-popup, mobileAppInfoModal, mutedUsersModal, mutedUsersModalLabel, non-trade-alert, play-youtube-modal, pollChoiceTxt, pollModalCompHolder, pollPanelTitlebar, pollQuestionTxt, post-alert, presenter-audio-video-settings, replyModal, rteLabel, rteModal, scheduledAlertsModal, scheduledAlertsModalLabel, search-term-input, sendpoll, sendpolltab, session-control, session-control-modal, show-alerts, user-alert-settings, user-alert-settings-tab, user-app-settings, user-app-settings-tab, user-audio-video-settings, user-audio-video-settings-tab, user-chat-settings, user-chat-settings-tab, user-modal, user-settings-modal, webrtc-troubleshooter-modal
- Important ids: 652765a0e494735aa53574ba, 652765a0e494735aa53574ba-tab, 665874b2692d34204762bb73, 665874b2692d34204762bb73-tab, 68385e5f7568b13c34072e13, 68385e5f7568b13c34072e13-tab, 6879121b8f9c6824f6f03266, 6879121b8f9c6824f6f03266-tab, 68ac8cdb207a2a2927a27775, 68ac8cdb207a2a2927a27775-tab, 6953c35f88f24e0dd42a1218, 6953c35f88f24e0dd42a1218-tab, addon-img, addon-url, alert-compact-mode, alert-donot-disturb, alert-filter-modal, alert-legal-disclosure-label, alert-modal, alert-non-trade-label, alert-popup-donot-disturb, alert-push-label, alert-regular-mode, alert-send-report-modal, alertDoNotDisturb, alertPopup, alertQALabel, alertQAModal, alertTextMode, alerts-advanced-search-modal
- Audited gaps: 20; high: 0

### file3.html
- Thumbnail: original-fragments/file3.html.png
- Source: files/file3.html
- SHA: 2cbc4f965e8b7582
- Size: 5.3 MB
- App selectors: app-alert-filter-modal, app-alert-logs-modal, app-alert-qa-modal, app-alert-send-report-modal, app-alerts, app-alerts-advanced-search, app-all-user-pmmodal, app-av-settings-modal, app-chat, app-chat-logs-modal, app-debug-log-modal, app-followed-users-modal, app-mobile-app-info-modal, app-muted-users-modal, app-note, app-play-youtube-modal, app-poll-modal, app-post-alert-modal, app-presentationarea, app-presenter-cams, app-privchat, app-rec-preview, app-reply-modal, app-rich-text-editor, app-room, app-room-roster, app-roomscroller, app-root, app-scheduled-alerts-modal, app-screenshare-preview, app-session-control-modal, app-st-message, app-user-info-modal, app-user-settings-modal, app-webcam-holder, app-webrtc-troubleshooter
- Modal ids: alert-compact-mode, alert-donot-disturb, alert-filter-modal, alert-legal-disclosure-label, alert-modal, alert-non-trade-label, alert-popup-donot-disturb, alert-push-label, alert-regular-mode, alert-send-report-modal, alertDoNotDisturb, alertPopup, alertQALabel, alertQAModal, alertTextMode, alerts-advanced-search-modal, alerts-logs-modal, all-user-pm-modal, anonymous-poll, av-settings-modal, chat-alerts-bottom, chat-alerts-left, chat-alerts-right, chat-alerts-top, chat-logs-modal, debug-log-modal, debugLogModalTxt, followedUsersModal, followedUsersModalLabel, longer-alert-popup, mobileAppInfoModal, mutedUsersModal, mutedUsersModalLabel, non-trade-alert, play-youtube-modal, pollChoiceTxt, pollModalCompHolder, pollPanelTitlebar, pollQuestionTxt, post-alert, presenter-audio-video-settings, replyModal, rteLabel, rteModal, scheduledAlertsModal, scheduledAlertsModalLabel, search-term-input, sendpoll, sendpolltab, session-control, session-control-modal, show-alerts, user-alert-settings, user-alert-settings-tab, user-app-settings, user-app-settings-tab, user-audio-video-settings, user-audio-video-settings-tab, user-chat-settings, user-chat-settings-tab, user-modal, user-settings-modal, webrtc-troubleshooter-modal
- Important ids: 652765a0e494735aa53574ba, 652765a0e494735aa53574ba-tab, 665874b2692d34204762bb73, 665874b2692d34204762bb73-tab, 68385e5f7568b13c34072e13, 68385e5f7568b13c34072e13-tab, 6879121b8f9c6824f6f03266, 6879121b8f9c6824f6f03266-tab, 68ac8cdb207a2a2927a27775, 68ac8cdb207a2a2927a27775-tab, 6953c35f88f24e0dd42a1218, 6953c35f88f24e0dd42a1218-tab, addon-img, addon-url, alert-compact-mode, alert-donot-disturb, alert-filter-modal, alert-legal-disclosure-label, alert-modal, alert-non-trade-label, alert-popup-donot-disturb, alert-push-label, alert-regular-mode, alert-send-report-modal, alertDoNotDisturb, alertPopup, alertQALabel, alertQAModal, alertTextMode, alerts-advanced-search-modal
- Audited gaps: 22; high: 4

### file4.html
- Thumbnail: original-fragments/file4.html.png
- Source: files/file4.html
- SHA: e9497226a41f4a87
- Size: 4.8 MB
- App selectors: app-alert-filter-modal, app-alert-logs-modal, app-alert-qa-modal, app-alert-send-report-modal, app-alerts, app-alerts-advanced-search, app-all-user-pmmodal, app-av-settings-modal, app-chat, app-chat-logs-modal, app-debug-log-modal, app-followed-users-modal, app-mobile-app-info-modal, app-muted-users-modal, app-note, app-play-youtube-modal, app-poll-modal, app-post-alert-modal, app-presentationarea, app-presenter-cams, app-privchat, app-rec-preview, app-reply-modal, app-rich-text-editor, app-room, app-room-roster, app-roomscroller, app-scheduled-alerts-modal, app-screenshare-preview, app-session-control-modal, app-st-message, app-user-info-modal, app-user-settings-modal, app-webcam-holder, app-webrtc-troubleshooter
- Modal ids: alert-compact-mode, alert-donot-disturb, alert-filter-modal, alert-legal-disclosure-label, alert-modal, alert-non-trade-label, alert-popup-donot-disturb, alert-push-label, alert-regular-mode, alert-send-report-modal, alertDoNotDisturb, alertPopup, alertQALabel, alertQAModal, alertTextMode, alerts-advanced-search-modal, alerts-logs-modal, all-user-pm-modal, anonymous-poll, av-settings-modal, chat-alerts-bottom, chat-alerts-left, chat-alerts-right, chat-alerts-top, chat-logs-modal, debug-log-modal, debugLogModalTxt, followedUsersModal, followedUsersModalLabel, longer-alert-popup, mobileAppInfoModal, mutedUsersModal, mutedUsersModalLabel, non-trade-alert, play-youtube-modal, pollChoiceTxt, pollModalCompHolder, pollPanelTitlebar, pollQuestionTxt, post-alert, presenter-audio-video-settings, replyModal, rteLabel, rteModal, scheduledAlertsModal, scheduledAlertsModalLabel, search-term-input, sendpoll, sendpolltab, session-control, session-control-modal, show-alerts, user-alert-settings, user-alert-settings-tab, user-app-settings, user-app-settings-tab, user-audio-video-settings, user-audio-video-settings-tab, user-chat-settings, user-chat-settings-tab, user-modal, user-settings-modal, webrtc-troubleshooter-modal
- Important ids: 652765a0e494735aa53574ba, 652765a0e494735aa53574ba-tab, 665874b2692d34204762bb73, 665874b2692d34204762bb73-tab, 68385e5f7568b13c34072e13, 68385e5f7568b13c34072e13-tab, 6879121b8f9c6824f6f03266, 6879121b8f9c6824f6f03266-tab, 68ac8cdb207a2a2927a27775, 68ac8cdb207a2a2927a27775-tab, 6953c35f88f24e0dd42a1218, 6953c35f88f24e0dd42a1218-tab, addon-img, addon-url, alert-compact-mode, alert-donot-disturb, alert-filter-modal, alert-legal-disclosure-label, alert-modal, alert-non-trade-label, alert-popup-donot-disturb, alert-push-label, alert-regular-mode, alert-send-report-modal, alertDoNotDisturb, alertPopup, alertQALabel, alertQAModal, alertTextMode, alerts-advanced-search-modal
- Audited gaps: 13; high: 4

### file5.html
- Thumbnail: original-fragments/file5.html.png
- Source: files/file5.html
- SHA: 5c637f62f3e13de9
- Size: 10.9 KB
- App selectors: none
- Modal ids: alert-donot-disturb
- Important ids: alert-donot-disturb, app-donot-disturb, chat-donot-disturb, cssLogo, dropdownVolume, navbarsRoom, non-trade-donot-disturb, presentation-subtitles, qa-donot-disturb
- Audited gaps: 17; high: 2

### file6.html
- Thumbnail: original-fragments/file6.html.png
- Source: files/file6.html
- SHA: 7b7ba73f3d03af13
- Size: 938.6 KB
- App selectors: app-alerts, app-chat, app-note, app-presentationarea, app-presenter-cams, app-roomscroller, app-st-message, app-webcam-holder
- Modal ids: none
- Important ids: 652765a0e494735aa53574ba, 652765a0e494735aa53574ba-tab, 665874b2692d34204762bb73, 665874b2692d34204762bb73-tab, 68385e5f7568b13c34072e13, 68385e5f7568b13c34072e13-tab, 6879121b8f9c6824f6f03266, 6879121b8f9c6824f6f03266-tab, 68ac8cdb207a2a2927a27775, 68ac8cdb207a2a2927a27775-tab, 6953c35f88f24e0dd42a1218, 6953c35f88f24e0dd42a1218-tab, basic-addon1, chatScrollViewParentAlerts, docs-internal-guid-2b81aed8-7fff-5e6b-3df4-740ad0bc32f3, docs-internal-guid-3cf97d5e-7fff-6ae2-e3ed-e28c1f11416e, docs-internal-guid-4071bd07-7fff-f7a7-3707-c62db945bdd1, docs-internal-guid-7a7c6d17-7fff-2242-234c-f86e7d095ba4, docs-internal-guid-7d4fefb6-7fff-6967-8759-1cd2380ca685, docs-internal-guid-886b0096-7fff-323b-66d1-9769e7cc373f, docs-internal-guid-936bf10b-7fff-2343-cc96-ee8179cc199c, docs-internal-guid-9d8d5e97-7fff-337e-dfcb-3386430b68a6, docs-internal-guid-b7f4d388-7fff-8196-b56c-a66f9387a978, docs-internal-guid-c18f77ca-7fff-1047-6ab4-e876f31179a1, docs-internal-guid-cfb9da61-7fff-b014-faa9-7bec519343cc, dropdownMenuLink, files, files-tab, id_6a26e2a593c3cb36774c909f, id_6a26e2b993c3cb36774c90a2
- Audited gaps: 21; high: 7

### file7.html
- Thumbnail: original-fragments/file7.html.png
- Source: files/file7.html
- SHA: c5809738ed519eb0
- Size: 3.2 KB
- App selectors: app-user-info-modal
- Modal ids: user-modal
- Important ids: user-modal
- Audited gaps: 11; high: 4

### file8.html
- Thumbnail: original-fragments/file8.html.png
- Source: files/file8.html
- SHA: debd559e1f5f9870
- Size: 2.5 KB
- App selectors: app-play-youtube-modal
- Modal ids: play-youtube-modal
- Important ids: basic-addonPlay, basic-addonSave, play-youtube-modal
- Audited gaps: 9; high: 0

### file9.html
- Thumbnail: original-fragments/file9.html.png
- Source: files/file9.html
- SHA: 430c1096f7ce5e53
- Size: 63.7 KB
- App selectors: app-user-settings-modal
- Modal ids: alert-compact-mode, alert-donot-disturb, alert-popup-donot-disturb, alert-regular-mode, alertDoNotDisturb, alertPopup, alertTextMode, chat-alerts-bottom, chat-alerts-left, chat-alerts-right, chat-alerts-top, longer-alert-popup, non-trade-alert, user-alert-settings, user-alert-settings-tab, user-app-settings, user-app-settings-tab, user-chat-settings, user-chat-settings-tab, user-settings-modal
- Important ids: alert-compact-mode, alert-donot-disturb, alert-popup-donot-disturb, alert-regular-mode, alertDoNotDisturb, alertPopup, alertTextMode, alwaysScrollToBottom, app-dark-theme, app-disable-video, app-donot-disturb, app-light-theme, app-reactions-popup, app-reactions-popup-qa, app-reactions-sound-qa, app-recording-start-sound, app-recording-stop-sound, app-speech-reco-overlay, appDisableVideo, appDoNotDisturb, appSpeechRecoOverlay, chat-alerts-bottom, chat-alerts-left, chat-alerts-right, chat-alerts-top, chat-always-scroll, chat-badges-donot-disturb, chat-bg-color, chat-compact-mode, chat-donot-disturb
- Audited gaps: 21; high: 16

### file10.html
- Thumbnail: original-fragments/file10.html.png
- Source: files/file10.html
- SHA: edf8be065dbea227
- Size: 10.9 KB
- App selectors: app-av-settings-modal
- Modal ids: av-settings-modal, presenter-audio-video-settings, user-audio-video-settings, user-audio-video-settings-tab
- Important ids: audio-deviceList, av-settings-modal, presenter-audio-video-settings, speakers-device, user-audio-video-settings, user-audio-video-settings-tab, userSettingsTab, userSettingsTabContent, video-deviceList
- Audited gaps: 14; high: 0

### file11.html
- Thumbnail: original-fragments/file11.html.png
- Source: files/file11.html
- SHA: 66f85f6f951f8a8f
- Size: 2.1 KB
- App selectors: app-debug-log-modal
- Modal ids: debug-log-modal, debugLogModalTxt
- Important ids: debug-log-modal, debugLogModalTxt
- Audited gaps: 6; high: 3

### file12.html
- Thumbnail: original-fragments/file12.html.png
- Source: files/file12.html
- SHA: 59e876c189cb99f1
- Size: 16.0 KB
- App selectors: app-post-alert-modal
- Modal ids: alert-legal-disclosure-label, alert-modal, alert-non-trade-label, alert-push-label, post-alert
- Important ids: addon-img, addon-url, alert-legal-disclosure-label, alert-modal, alert-non-trade-label, alert-push-label, fileListAlert, filedragAlert, fuploadAlert, keepOpenChk, nav-img, nav-tab, nav-tab-img, nav-tab-text, nav-tab-url, nav-tabContent, nav-text, nav-url, post-alert, postOnXChk
- Audited gaps: 9; high: 1

### file13.html
- Thumbnail: original-fragments/file13.html.png
- Source: files/file13.html
- SHA: 693d68a2cbb2c239
- Size: 8.9 KB
- App selectors: app-poll-modal
- Modal ids: anonymous-poll, pollChoiceTxt, pollModalCompHolder, pollPanelTitlebar, pollQuestionTxt, sendpoll, sendpolltab
- Important ids: anonymous-poll, nav-tab, pollChoiceTxt, pollModalCompHolder, pollPanelTitlebar, pollQuestionTxt, savedPolls, sendpoll, sendpolltab
- Audited gaps: 9; high: 0

### file14.html
- Thumbnail: original-fragments/file14.html.png
- Source: files/file14.html
- SHA: 3ff8d09a37d93685
- Size: 3.1 MB
- App selectors: app-chat-logs-modal
- Modal ids: chat-logs-modal
- Important ids: chat-logs-modal
- Audited gaps: 10; high: 5

### file15.html
- Thumbnail: original-fragments/file15.html.png
- Source: files/file15.html
- SHA: 26d922dbd6004787
- Size: 4.3 KB
- App selectors: app-alert-logs-modal
- Modal ids: alerts-logs-modal
- Important ids: alerts-logs-modal
- Audited gaps: 8; high: 2

### file16.html
- Thumbnail: original-fragments/file16.html.png
- Source: files/file16.html
- SHA: cceeb6daf8e884b6
- Size: 1.7 KB
- App selectors: app-session-control-modal
- Modal ids: session-control, session-control-modal
- Important ids: session-control, session-control-modal
- Audited gaps: 6; high: 4

### file17.html
- Thumbnail: original-fragments/file17.html.png
- Source: files/file17.html
- SHA: b5983274c8c434b6
- Size: 2.9 KB
- App selectors: app-mobile-app-info-modal
- Modal ids: mobileAppInfoModal
- Important ids: mobileAppInfoLabel, mobileAppInfoModal
- Audited gaps: 7; high: 0

### file18.html
- Thumbnail: original-fragments/file18.html.png
- Source: files/file18.html
- SHA: 8d92ab02e238c2f4
- Size: 4.2 KB
- App selectors: app-reply-modal
- Modal ids: replyModal
- Important ids: replyLabel, replyModal, textAreaReplyTxt
- Audited gaps: 12; high: 6

### file19.html
- Thumbnail: original-fragments/file19.html.png
- Source: files/file19.html
- SHA: dbb8c965d69600a4
- Size: 8.1 KB
- App selectors: app-alert-qa-modal
- Modal ids: alertQALabel, alertQAModal
- Important ids: alertQALabel, alertQAModal, textAreaHolder, textAreaQATxt
- Audited gaps: 9; high: 4

### file20.html
- Thumbnail: original-fragments/file20.html.png
- Source: files/file20.html
- SHA: 1c38da2e1ac8c439
- Size: 1.8 KB
- App selectors: app-muted-users-modal
- Modal ids: mutedUsersModal, mutedUsersModalLabel
- Important ids: mutedUsersModal, mutedUsersModalLabel
- Audited gaps: 6; high: 0

### file21.html
- Thumbnail: original-fragments/file21.html.png
- Source: files/file21.html
- SHA: 395edb186cd4071e
- Size: 1.8 KB
- App selectors: app-followed-users-modal
- Modal ids: followedUsersModal, followedUsersModalLabel
- Important ids: followedUsersModal, followedUsersModalLabel
- Audited gaps: 6; high: 1

### file22.html
- Thumbnail: original-fragments/file22.html.png
- Source: files/file22.html
- SHA: 57ec1e2ef77f4f4c
- Size: 2.6 KB
- App selectors: app-screenshare-preview
- Modal ids: none
- Important ids: dropdownBasic1, screenshareLocalPreviewHolder, webcamScreenLocalPreview
- Audited gaps: 7; high: 4

### file23.html
- Thumbnail: original-fragments/file23.html.png
- Source: files/file23.html
- SHA: d2d986d7d8d14c21
- Size: 1.4 KB
- App selectors: app-rec-preview
- Modal ids: none
- Important ids: recLocalPreviewHolder
- Audited gaps: 6; high: 4

### file24.html
- Thumbnail: original-fragments/file24.html.png
- Source: files/file24.html
- SHA: 395edb186cd4071e
- Size: 1.8 KB
- App selectors: app-followed-users-modal
- Modal ids: followedUsersModal, followedUsersModalLabel
- Important ids: followedUsersModal, followedUsersModalLabel
- Audited gaps: 5; high: 0

### file25.html
- Thumbnail: original-fragments/file25.html.png
- Source: files/file25.html
- SHA: 624bc12a393d76e2
- Size: 2.9 KB
- App selectors: app-scheduled-alerts-modal
- Modal ids: scheduledAlertsModal, scheduledAlertsModalLabel
- Important ids: scheduledAlertsModal, scheduledAlertsModalLabel
- Audited gaps: 6; high: 0

### file26.html
- Thumbnail: original-fragments/file26.html.png
- Source: files/file26.html
- SHA: 160ef903c25e6945
- Size: 2.1 KB
- App selectors: app-alert-send-report-modal
- Modal ids: alert-send-report-modal
- Important ids: alert-send-report-modal
- Audited gaps: 7; high: 4

### file27.html
- Thumbnail: original-fragments/file27.html.png
- Source: files/file27.html
- SHA: dcf5704492a253fc
- Size: 2.1 KB
- App selectors: app-all-user-pmmodal
- Modal ids: all-user-pm-modal
- Important ids: all-user-pm-modal
- Audited gaps: 8; high: 3

### file28.html
- Thumbnail: original-fragments/file28.html.png
- Source: files/file28.html
- SHA: 1761d72565939bff
- Size: 20.6 KB
- App selectors: app-alerts-advanced-search
- Modal ids: alerts-advanced-search-modal, search-term-input
- Important ids: alerts-advanced-search-modal, checkArchives, checkNonTradeAlert, endDateInput, search-term-input, selectRoomDropdown, selectTraderDropdown, startDateInput
- Audited gaps: 18; high: 6

### file29.html
- Thumbnail: original-fragments/file29.html.png
- Source: files/file29.html
- SHA: fbad3de602d16655
- Size: 2.5 KB
- App selectors: app-alert-filter-modal
- Modal ids: alert-filter-modal, show-alerts
- Important ids: alert-filter-modal, show-alerts
- Audited gaps: 8; high: 3

### file30.html
- Thumbnail: original-fragments/file30.html.png
- Source: files/file30.html
- SHA: c90b4c9c55e19070
- Size: 5.1 KB
- App selectors: app-webrtc-troubleshooter
- Modal ids: webrtc-troubleshooter-modal
- Important ids: webrtc-troubleshooter-modal
- Audited gaps: 9; high: 2

### file31.html
- Thumbnail: original-fragments/file31.html.png
- Source: files/file31.html
- SHA: be2d97da73ae3c37
- Size: 2.2 KB
- App selectors: app-rich-text-editor
- Modal ids: rteLabel, rteModal
- Important ids: msgTxtContainer, rteLabel, rteModal
- Audited gaps: 9; high: 6

### file32.html
- Thumbnail: original-fragments/file32.html.png
- Source: files/file32.html
- SHA: 146d64c10b262780
- Size: 2.3 KB
- App selectors: app-privchat
- Modal ids: none
- Important ids: privaChatCompHolder
- Audited gaps: 9; high: 4

### file33.html
- Thumbnail: original-fragments/file33.html.png
- Source: files/file33.html
- SHA: a947b36fd6147cd8
- Size: 135 B
- App selectors: none
- Modal ids: none
- Important ids: toast-container
- Audited gaps: 1; high: 1

### file34.html
- Thumbnail: original-fragments/file34.html.png
- Source: files/file34.html
- SHA: 33913400e476fd02
- Size: 108 B
- App selectors: none
- Modal ids: none
- Important ids: webcam
- Audited gaps: 2; high: 0

### mixednavs.html
- Thumbnail: original-fragments/mixednavs.html.png
- Source: files/mixednavs.html
- SHA: 7a3e01d07ccb8dc0
- Size: 651 B
- App selectors: none
- Modal ids: none
- Important ids: streams-tab
- Audited gaps: 2; high: 0

### navbar.html
- Thumbnail: original-fragments/navbar.html.png
- Source: files/navbar.html
- SHA: 5c637f62f3e13de9
- Size: 10.9 KB
- App selectors: none
- Modal ids: alert-donot-disturb
- Important ids: alert-donot-disturb, app-donot-disturb, chat-donot-disturb, cssLogo, dropdownVolume, navbarsRoom, non-trade-donot-disturb, presentation-subtitles, qa-donot-disturb
- Audited gaps: 21; high: 0

### navbars-room.html
- Thumbnail: original-fragments/navbars-room.html.png
- Source: files/navbars-room.html
- SHA: b2d9990c1bdaa2c0
- Size: 8.4 KB
- App selectors: none
- Modal ids: alert-donot-disturb
- Important ids: alert-donot-disturb, app-donot-disturb, chat-donot-disturb, dropdownVolume, navbarsRoom, non-trade-donot-disturb, presentation-subtitles, qa-donot-disturb
- Audited gaps: 14; high: 0

### navfile.html
- Thumbnail: original-fragments/navfile.html.png
- Source: files/navfile.html
- SHA: ed5cd047237d25fc
- Size: 342 B
- App selectors: none
- Modal ids: none
- Important ids: none
- Audited gaps: 3; high: 2

### odds-and-ends.html
- Thumbnail: original-fragments/odds-and-ends.html.png
- Source: files/odds-and-ends.html
- SHA: 81c303bcd0870a6d
- Size: 7.9 MB
- App selectors: app-alert-filter-modal, app-alert-logs-modal, app-alert-qa-modal, app-alert-send-report-modal, app-alerts, app-alerts-advanced-search, app-all-user-pmmodal, app-av-settings-modal, app-chat, app-chat-logs-modal, app-debug-log-modal, app-followed-users-modal, app-mobile-app-info-modal, app-muted-users-modal, app-note, app-play-youtube-modal, app-poll-modal, app-post-alert-modal, app-presentationarea, app-presenter-cams, app-privchat, app-rec-preview, app-reply-modal, app-rich-text-editor, app-room, app-room-roster, app-roomscroller, app-root, app-scheduled-alerts-modal, app-screenshare-preview, app-session-control-modal, app-st-message, app-user-info-modal, app-user-settings-modal, app-webcam-holder, app-webrtc-troubleshooter
- Modal ids: alert-compact-mode, alert-donot-disturb, alert-filter-modal, alert-legal-disclosure-label, alert-modal, alert-non-trade-label, alert-popup-donot-disturb, alert-push-label, alert-regular-mode, alert-send-report-modal, alertDoNotDisturb, alertPopup, alertQALabel, alertQAModal, alertTextMode, alerts-advanced-search-modal, alerts-logs-modal, all-user-pm-modal, anonymous-poll, av-settings-modal, chat-alerts-bottom, chat-alerts-left, chat-alerts-right, chat-alerts-top, chat-logs-modal, debug-log-modal, debugLogModalTxt, followedUsersModal, followedUsersModalLabel, longer-alert-popup, mobileAppInfoModal, mutedUsersModal, mutedUsersModalLabel, non-trade-alert, play-youtube-modal, pollChoiceTxt, pollModalCompHolder, pollPanelTitlebar, pollQuestionTxt, post-alert, presenter-audio-video-settings, replyModal, rteLabel, rteModal, scheduledAlertsModal, scheduledAlertsModalLabel, search-term-input, sendpoll, sendpolltab, session-control, session-control-modal, show-alerts, user-alert-settings, user-alert-settings-tab, user-app-settings, user-app-settings-tab, user-audio-video-settings, user-audio-video-settings-tab, user-chat-settings, user-chat-settings-tab, user-modal, user-settings-modal, webrtc-troubleshooter-modal
- Important ids: 652765a0e494735aa53574ba, 652765a0e494735aa53574ba-tab, 665874b2692d34204762bb73, 665874b2692d34204762bb73-tab, 68385e5f7568b13c34072e13, 68385e5f7568b13c34072e13-tab, 6879121b8f9c6824f6f03266, 6879121b8f9c6824f6f03266-tab, 68ac8cdb207a2a2927a27775, 68ac8cdb207a2a2927a27775-tab, 6953c35f88f24e0dd42a1218, 6953c35f88f24e0dd42a1218-tab, addon-img, addon-url, alert-compact-mode, alert-donot-disturb, alert-filter-modal, alert-legal-disclosure-label, alert-modal, alert-non-trade-label, alert-popup-donot-disturb, alert-push-label, alert-regular-mode, alert-send-report-modal, alertDoNotDisturb, alertPopup, alertQALabel, alertQAModal, alertTextMode, alerts-advanced-search-modal
- Audited gaps: 18; high: 6

### pagesource.html
- Thumbnail: original-fragments/pagesource.html.png
- Source: files/pagesource.html
- SHA: 8293875f7b406ac9
- Size: 24.1 KB
- App selectors: app-root
- Modal ids: none
- Important ids: none
- Audited gaps: 13; high: 0

### reload.html
- Thumbnail: original-fragments/reload.html.png
- Source: files/reload.html
- SHA: 863e6661df1d112b
- Size: 332 B
- App selectors: none
- Modal ids: none
- Important ids: none
- Audited gaps: 4; high: 3

### subnavbar.html
- Thumbnail: original-fragments/subnavbar.html.png
- Source: files/subnavbar.html
- SHA: f86cc82f3f7767f3
- Size: 8.2 KB
- App selectors: none
- Modal ids: none
- Important ids: mainTabs, noteChangeIndicator, notes-tab, screens-tab, streams-tab
- Audited gaps: 11; high: 5

### webcamholder.html
- Thumbnail: original-fragments/webcamholder.html.png
- Source: files/webcamholder.html
- SHA: 078de600f2c3c254
- Size: 2.2 KB
- App selectors: app-presenter-cams, app-webcam-holder
- Modal ids: none
- Important ids: webcamVideo-, webcamsHolder-
- Audited gaps: 9; high: 0

### important-doc.html
- Thumbnail: original-fragments/important-doc.html.png
- Source: important-doc.html
- SHA: 136e2a797e604f4a
- Size: 5.6 MB
- App selectors: app-alert-filter-modal, app-alert-logs-modal, app-alert-qa-modal, app-alert-send-report-modal, app-alerts, app-alerts-advanced-search, app-all-user-pmmodal, app-av-settings-modal, app-chat, app-chat-logs-modal, app-debug-log-modal, app-followed-users-modal, app-mobile-app-info-modal, app-muted-users-modal, app-note, app-play-youtube-modal, app-poll-modal, app-post-alert-modal, app-presentationarea, app-presenter-cams, app-privchat, app-rec-preview, app-reply-modal, app-rich-text-editor, app-room, app-room-roster, app-roomscroller, app-root, app-scheduled-alerts-modal, app-screenshare-preview, app-session-control-modal, app-st-message, app-user-info-modal, app-user-settings-modal, app-webcam-holder, app-webrtc-troubleshooter
- Modal ids: alert-compact-mode, alert-donot-disturb, alert-filter-modal, alert-legal-disclosure-label, alert-modal, alert-non-trade-label, alert-popup-donot-disturb, alert-push-label, alert-regular-mode, alert-send-report-modal, alertDoNotDisturb, alertPopup, alertQALabel, alertQAModal, alertTextMode, alerts-advanced-search-modal, alerts-logs-modal, all-user-pm-modal, anonymous-poll, av-settings-modal, chat-alerts-bottom, chat-alerts-left, chat-alerts-right, chat-alerts-top, chat-logs-modal, debug-log-modal, debugLogModalTxt, followedUsersModal, followedUsersModalLabel, longer-alert-popup, mobileAppInfoModal, mutedUsersModal, mutedUsersModalLabel, non-trade-alert, play-youtube-modal, pollChoiceTxt, pollModalCompHolder, pollPanelTitlebar, pollQuestionTxt, post-alert, presenter-audio-video-settings, replyModal, rteLabel, rteModal, scheduledAlertsModal, scheduledAlertsModalLabel, search-term-input, sendpoll, sendpolltab, session-control, session-control-modal, show-alerts, user-alert-settings, user-alert-settings-tab, user-app-settings, user-app-settings-tab, user-audio-video-settings, user-audio-video-settings-tab, user-chat-settings, user-chat-settings-tab, user-modal, user-settings-modal, webrtc-troubleshooter-modal
- Important ids: 652765a0e494735aa53574ba, 652765a0e494735aa53574ba-tab, 665874b2692d34204762bb73, 665874b2692d34204762bb73-tab, 68385e5f7568b13c34072e13, 68385e5f7568b13c34072e13-tab, 6879121b8f9c6824f6f03266, 6879121b8f9c6824f6f03266-tab, 68ac8cdb207a2a2927a27775, 68ac8cdb207a2a2927a27775-tab, 6953c35f88f24e0dd42a1218, 6953c35f88f24e0dd42a1218-tab, addon-img, addon-url, alert-compact-mode, alert-donot-disturb, alert-filter-modal, alert-legal-disclosure-label, alert-modal, alert-non-trade-label, alert-popup-donot-disturb, alert-push-label, alert-regular-mode, alert-send-report-modal, alertDoNotDisturb, alertPopup, alertQALabel, alertQAModal, alertTextMode, alerts-advanced-search-modal
- Audited gaps: 32; high: 4
