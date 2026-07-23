# IMPLEMENTATION-PLAN — decoded reference vs SvelteKit clone

Per-surface diff of `docs/reference/decoded/*.md` (the decoded reference truth) against the current
implementation in `web/src`. Work items are formatted:

`- [P0/P1/P2] <component> — <what differs> — EVIDENCE: <decoded .md §> — FIX: <exact change> — VERIFY: <measurable check>`

- **P0** = visibly wrong / broken · **P1** = clear mismatch · **P2** = polish / behavioral.
- `✅ MATCH` items are called out so we do not churn them.
- `⚙ BACKEND` marks items that need a server/API change to land honestly.

Global note on premise: several decoded files (stage-tabs, webcams, files) flag that the *captured* room
rendered on the base navy `:root`, NOT the `.lightTheme` class (bodyClass=""), yet the resolved colours are
the live computed values. Our `layout.css` already bakes those live values into flat tokens
(`--navbar-bg:#0c2434`, `--tab-active-bg:#45a2ff`, `--modal-bg:#103d5c`, etc.), so the token layer is
faithful. Do NOT reintroduce a `.lightTheme`/`.darkTheme` remap system unless we add the theme toggle.

---

## 1. Top-nav (`top-nav.md` → `RoomTopNav.svelte`)

- ✅ MATCH — fixed 49px `#0c2434` bar, z-1030, no bottom border, Open Sans 300 16px/24px. EVIDENCE: top-nav.md Resolved values (nav.mainAppNav).
- ✅ MATCH — hamburger `.menu-btn` = `.sidebar-menu` (bg #103d5c, padding 1px 5px, margin 0 5px, 1px transparent border, hover #eee). EVIDENCE: top-nav.md §States (sidebar-menu hover).
- ✅ MATCH — `.users` pill (14px, 1px solid #fff border, padding 1px 5px). EVIDENCE: top-nav.md Resolved (span.users).
- ✅ MATCH — brand `mr-auto` right-pin, logo max 200×40. EVIDENCE: top-nav.md DOM idx22.
- ✅ MATCH — "( No one is speaking )" idle talkingIndicator + speaking waveform variant. EVIDENCE: top-nav.md DOM idx17/idx16.
- ✅ MATCH — volume dropstart panel: 160px wide, opens LEFT of toggle, #111 bg, #ccc text, 1px #fafafa border, h4 "Volume" 24px, `#0d6efd` slider accent, `.divider` #45a2ff, sound-option rows w/ on/off spans + DND. EVIDENCE: top-nav.md Resolved (volumeControl) + §States (on/off label swap).
- ✅ MATCH — `[ REC ]` indicator #45a2ff blink 1s step-start. EVIDENCE: top-nav.md idx19 + .blinking-rec.
- ✅ MATCH — reload `fa-sync` fa-2x #abb0b5. EVIDENCE: top-nav.md idx88.
- [P2] RoomTopNav.svelte — sidebar-menu open state should swap to `fa-arrow-left` + active-icon styling (color/border #45a2ff, border-radius 5px, transition all .5s) when the sidebar is open; we keep `fa-bars` always. EVIDENCE: top-nav.md §States "sidebar-menu open/close swap" (`_Pe`/`bPe`, active-icon rule). FIX: pass sidebar-open state into RoomTopNav, render `arrow-left` + `.active-icon` class when open. VERIFY: open sidebar → hamburger shows a blue-bordered left-arrow, title="Close Sidebar".
- [P2] RoomTopNav.svelte — volume icon does not switch by level; reference shows `fa-volume-up` (>50), `fa-volume-down` (4–50), `fa-volume-off` (<4). We only swap up/mute on the muted flag. EVIDENCE: top-nav.md §States "volume icon threshold". FIX: derive icon from `volume` value (up/down/off) instead of `muted ? mute : up`. VERIFY: drag slider through 60→20→2 and confirm the three glyphs.
- [P2] RoomTopNav.svelte — background-music volume slider (`h4e` block) is absent; reference adds a "Background Music:" sub-slider in the volume panel when SoundCloud/mp3/YouTube is playing. EVIDENCE: top-nav.md DOM idx48. FIX: when `currentMedia` is playing, render a second range labelled "Background Music:" bound to the media volume. VERIFY: play a YouTube; open volume panel → second slider appears.
- [P2] RoomTopNav.svelte — "NTA sound" label reads `NTA sound`; reference label is literally `NTA sound` ✅ but the master DND row should read `DON'T DISTURB` (uppercase) when ON and `Don't Disturb` when OFF. We render only "Don't Disturb". EVIDENCE: top-nav.md §States "on/off + DON'T DISTURB label swap". FIX: `{dnd.app ? "DON'T DISTURB" : "Don't Disturb"}`. VERIFY: check the box → label uppercases.
- [P2] RoomTopNav.svelte — presenter nav controls render at `#abb0b5` with hover `opacity:.8` and NO colour change; the decoded reference nav-link hover is `color:var(--app-link-color)` (#45a2ff) for the volume/reload nav-links. Our code deliberately kept the presenter cluster gray. This is an intentional divergence noted in-file — leave as-is unless a fresh capture of the presenter cluster proves otherwise (top-nav.md flags the presenter cluster as an honest gap: no computed values captured). EVIDENCE: top-nav.md §Honest gaps (presenter/broadcast cluster uncaptured). FIX: none required; keep as documented divergence.

---

## 2. Sidebar (`sidebar.md` → `RoomSidebar.svelte`)

- ✅ MATCH — off-canvas 250px push rail, wrapper `#fff` bg / `#676767` text, `li` 14px fw-700 with 1px #fff bottom border, `li:first-child` fw-400. EVIDENCE: sidebar.md Resolved (.sidebar-wrapper, li).
- ✅ MATCH — powered block: "Powered by:" + ptr-website-link (#45a2ff underlined), Version, Mobile App Info `.btn-secondary` #6c757d, `hr` 5px, Chat/Media ticks gated on connection. EVIDENCE: sidebar.md DOM li:first-child.
- ✅ MATCH — Connectivity Check / General Settings / Archives dropdown (navy #0e3651 / #45a2ff items) / Manage Muted / Manage Followed (`.ps-1`). EVIDENCE: sidebar.md DOM + Resolved (users-dropdown-options).
- ✅ MATCH — roster header (Users: + count + cog/reload/sort/search buttons with the reload #f4f4f4/#45a2ff, search #45a2ff/#f4f4f4, sort #6c757d/#fff), user-options cog menu "Sort by Trials". EVIDENCE: roster.md Resolved (header buttons).
- [P1] RoomSidebar.svelte — Archives dropdown item labels: reference order is **Recording** (presenter/!hideRecs) → **Alert Logs** → **Chat Logs** → **Transcript History**. Member render shows Alert Logs + Chat Logs + Transcript History (no Recording). We render Alert Logs / Chat Logs / Transcript History — matches member, but the Recording item is entirely missing for presenters. EVIDENCE: sidebar.md §Role variants + Behavior (Recording=`aPe`, `launchRecordings()`). FIX: add a "Recording" archives item gated on `canManage` that opens the recordings surface (or an honest disabled item pending backend). VERIFY: as admin, Archives menu lists Recording first.
- [P1] RoomSidebar.svelte — the ADMIN / APP grouped sections (Audio/Video Settings, All Private Messages, Play YouTube, Session Control, Debug Log, Branding, Badges, Users) are OUR additions; the decoded sidebar has **NO dedicated ADMIN/APP section** — grep of the reference returns 0 hits. Presenter/admin differences are the feature-gated `li` items (Get Random User, Recording, Sort-by-Trials), not a section. EVIDENCE: sidebar.md DOM structure note ("There is NO dedicated ADMIN or APP section"). FIX: this is a deliberate functional extension (our RBAC surfaces need somewhere to live). Keep, but flag as a known divergence from reference structure — do NOT try to match the reference here since the reference simply lacks these controls. VERIFY: n/a (documented divergence).
- [P2] RoomSidebar.svelte — "Get Random User" presenter item (`uPe`, `getRandomUser()`) is absent. EVIDENCE: sidebar.md Role variants (Get Random User, O(43)). FIX: add presenter-gated "Get Random User" item (needs a backend endpoint to pick a random present user — mark ⚙ BACKEND). VERIFY: as presenter, item present; clicking highlights a random roster user.
- [P2] RoomSidebar.svelte — the roster `li` bottom borders resolve to `#fff` (invisible on white) in the reference; we use `#fff` on nav-items ✅ but roster rows use `#aaa` bottom border. Reference `.regUser` border-bottom is `1px solid var(--dark-gray)` = **#aaa** — so `#aaa` is correct for roster rows (distinct from the nav-item #fff). EVIDENCE: roster.md Resolved (.presUser/.regUser border-bottom = #aaa). FIX: none — already correct. ✅ MATCH.
- [P2] RoomSidebar.svelte — Transcript History is disabled at FULL opacity in the reference (matches Alert/Chat Logs visually). We already do `opacity:1` on the disabled archives-item. EVIDENCE: sidebar.md — Transcript History renders enabled-looking. ✅ MATCH.

---

## 3. Roster (`roster.md` → RoomSidebar roster section)

- ✅ MATCH — `.rosterImg` 45×45 circular (border-radius 50%) object-fit cover. EVIDENCE: roster.md Resolved (.rosterImg).
- ✅ MATCH — `.regUser` #f1f1f1 / `.presUser` #e1e1e1 backgrounds, min-height 42px. EVIDENCE: roster.md Resolved.
- ✅ MATCH — `.nickName` 16px fw-bolder #0a6db1. EVIDENCE: roster.md Resolved.
- ✅ MATCH — `.msgMenu` ⠇ 20px fw-600 #0a6db1, hover #8c8686 fw-900. EVIDENCE: roster.md Resolved (.msgMenu).
- ✅ MATCH — kebab menu items User Info / Mention / Private-Chat → we render User Info / Mention / Copy. Reference third item is **Private Chat** (`startPC`), not Copy. See below.
- [P1] RoomSidebar.svelte — roster kebab third item should be **Private Chat** (`fa-comments`, `startPC(user)`), gated on `canPM`. We render "Copy" (copies the display name). EVIDENCE: roster.md DOM (g2e Private Chat, consts[17/22]) + Behavior (startPC). FIX: replace/augment the Copy item with "Private Chat" → `openPrivateChat({user_id, display_name})`; keep Copy as an extra if desired. VERIFY: roster ⋮ → Private Chat opens the PM panel for that user.
- [P2] RoomSidebar.svelte — presenter-only roster affordances (Trial badge on `isPresenter&&isFT`, New badge on `isNewIndicatorOn&&isPresenter&&isNew`, stars on `!isP&&data.years`, `.userLocation` line on `isPresenter&&privData`) are not rendered. EVIDENCE: roster.md DOM (p2e/f2e/m2e/_2e). FIX: when presence carries `is_ft`/`is_new`/`years`/`location`, render the Trial/New pills, the stars-container, and the userLocation `<p>`. Needs presence fields → ⚙ BACKEND (presence currently lacks trial/role/years/location). VERIFY: with seeded fields, a trial user shows a red "Trial" pill.
- [P2] RoomSidebar.svelte — count badge (`.active-room-users .badge`, bg #0e3651 / color #f4f4f4) is rendered as a plain `.roster-count` span (#676767). Reference shows the count in a `.badge.badge-primary` re-themed to #0e3651/#f4f4f4, gated on `rosterCountVisibleToViewers||isPresenter`. EVIDENCE: roster.md Resolved (.active-room-users .badge). FIX: wrap the count in a `.badge` styled #0e3651 bg / #f4f4f4 text. VERIFY: count renders as a navy pill.

---

## 4. Chat panel (`chat-panel.md` → `ChatPanel.svelte`)

- ✅ MATCH — header `nav.chatHeader` #0a6db1 bg / #fff, p-1 (4px), min 48px, comment lead + tabs + search + gear. EVIDENCE: chat-panel.md Resolved (nav.chatHeader).
- ✅ MATCH — tabs (Main Chat / Off Topic), active #45a2ff/#fff, fw-700 12px, 6px 6px 0 0 radius, 6px gap, unread pill on inactive. EVIDENCE: chat-panel.md Resolved (.chatTabs .nav-link.active).
- ✅ MATCH — message row: `.msg-box` #fff, top border #e1e1e1, staff `.msg-box-adm` #f4f4f4 + padding-top 2px + flex-row-reverse mirror. EVIDENCE: chat-panel.md DOM (msg-box-adm) + Resolved.
- ✅ MATCH — avatar 35×35 object-fit cover (square, radius 0), pl-1 4px. EVIDENCE: chat-panel.md Resolved (div.avatar img).
- ✅ MATCH — `.username` 14px fw-900 #0a6db1, `.created-at` 12px fw-600 upright, `.msg-left` body 13px #676767 line-height 1.5, `.separator` #e8e8e8 band / 13px #373c42. EVIDENCE: chat-panel.md Resolved.
- ✅ MATCH — kebab menu (dropright, navy #0e3651 panel, #45a2ff items, hover #375a7f/#fff), items User Info / Mention / Reply / Add Reaction (+ admin Delete). EVIDENCE: chat-panel.md DOM (kebab table).
- ✅ MATCH — per-author colour system: inline row bg + username/kebab/created-at `filter:invert(1)` + body text colour. EVIDENCE: color-system.md Behavior (precedence 1–5).
- ✅ MATCH — typing indicator (`.typing-indicator-container` margin 4px 16px, 3 dots #9e9ea1 staggered blink .33/.66/.99s, `.users-typing em` fw-700). EVIDENCE: chat-composer.md §States (typing dots).
- [P1] ChatPanel.svelte — the reference composer's button column renders the emoji / image / GIF buttons **INLINE** (the shipped reference DOM shows them directly, no `+` collapse) when the chat width ≥ 400px; only below 400px does it collapse to a single `fa-plus` "Show message options". We ALWAYS collapse behind a `+` popover. The in-file comment even notes "the shipped reference renders the three buttons directly". EVIDENCE: chat-composer.md §Role variants (`showMessageOptions = chatWidth.offsetWidth >= 400`) + DOM 2b (l0e). FIX: render emoji/image/GIF inline in `.textAreaBtnsCol` when the panel is ≥400px wide (measure via a container query or ResizeObserver); collapse to `+` only when narrower. VERIFY: at a wide chat pane, the three glyphs sit beside the textarea with no `+`.
- [P1] ChatPanel.svelte — gear icon opens a two-item dropdown (Settings / Edit Profile). Reference gear (`toggleChatToolbar()`) is NOT a dropdown menu — it toggles a `.chatToolbar` search/settings PANEL (const 21) rendered inline below the header, with the search input, Save/Archive, "Show only Moderators messages" checkbox, "Group Chat Control", "Detach Chat", emoji help. EVIDENCE: chat-panel.md DOM (X1e toolbar) + Behavior (gear NOT a real dropdown). FIX: convert the gear to toggle an inline `.chatToolbar` panel (search field + the extended controls) rather than a floating Settings/Edit-Profile menu. The search icon opens the same panel in search-only mode. VERIFY: click gear → an inline search/settings bar slides under the header (not a popup menu).
- [P2] ChatPanel.svelte — DND badge in the brand (`.badge.badge-danger` `fa-bell-slash` + " DND" when `preferences.doNotDisturbOn`) is absent from the chat header brand. EVIDENCE: chat-panel.md DOM (const 11/26, j1e). FIX: render a red DND pill next to the comment lead icon when `dnd.app` is on. VERIFY: enable Don't Disturb → red "DND" pill appears in the chat header.
- [P2] ChatPanel.svelte — webinar-mode banner (`div.px-1.webinarMode " Webinar Mode "`, #fff bg / #000) is not implemented. EVIDENCE: chat-panel.md DOM (const 24, Z1e). FIX: render a "Webinar Mode" banner above the composer when a webinar-mode flag is set. Needs a room flag → ⚙ BACKEND. VERIFY: set flag → white "Webinar Mode" strip renders.
- [P2] ChatPanel.svelte — "Chat Disabled" fallback: reference shows `.chatDisabled` (#fff bg / #000, `fa-lock` " Chat Disabled" + optional " till {muted-till}") in place of the composer when `!(isConnected && chatEnabled)`. We show a plain readonly `<p>`. EVIDENCE: chat-composer.md DOM 3 (u0e). FIX: style the readonly state as `.chatDisabled` (40px, white, lock icon, "Chat Disabled"). VERIFY: as a non-poster, composer shows a white lock bar.

---

## 5. Chat composer (`chat-composer.md` → ChatPanel composer region)

- ✅ MATCH — `#textAreaHolder.textSendDiv` #fff bg, 8px radius, padding 5px, margin 5px; `#textAreaTxt.txt-area.form-control.border-0` #fff bg / #676767 / 14px / 400 / border 0 / max-height 300 / focus box-shadow `1px 1px 1px #aaa6a6`. EVIDENCE: chat-composer.md Resolved.
- ✅ MATCH — `.textAreaBtnsCol` #fff / #aaa, `.textAreaBtns` #676767 hover #0a6db1, GIF label 12px. EVIDENCE: chat-composer.md Resolved.
- ✅ MATCH — Enter sends, Shift+Enter newline; no Send button. EVIDENCE: chat-composer.md Behavior.
- [P2] ChatPanel.svelte — YouTube button (`data-bs-target=#play-youtube-modal`, `fa-video`, presenter-only) is not in the chat composer button row; it lives only in the sidebar. Reference has it in the expanded composer row (`i0e`, gated `isPresenter`). EVIDENCE: chat-composer.md DOM 2b (i0e). FIX: add a presenter-only `fa-video` "Play YouTube For All" button to the composer options that opens PlayYouTubeModal. VERIFY: as presenter, composer options include a video icon → opens YouTube modal.
- [P2] ChatPanel.svelte — RTE button (`fa-font`, "Rich Text Editor", gated `enableRTE && isPresenter`) absent from the composer. EVIDENCE: chat-composer.md DOM 2b (a0e). FIX: presenter-gated `fa-font` button opening the RichTextEditorModal (already exists in the repo). VERIFY: as presenter with RTE enabled, composer shows a font icon.

---

## 6. Alerts panel (`alerts-panel.md` → `AlertFeed.svelte`)

- ✅ MATCH — header `nav.alertHeader` #0a6db1/#fff, bell brand "Alerts" 18.75px fw-300, Post Alert (`fa-plus-circle`, presenter) + search + gear. EVIDENCE: alerts-panel.md Resolved (nav.alertHeader).
- ✅ MATCH — alert row structure (gutter kebab+avatar, meta line, `.stockColor` ticker 700/italic/uppercase inheriting body colour, body #676767 fw-100). EVIDENCE: alerts-panel.md Resolved (.stockColor, .msg-left).
- ✅ MATCH — `.alert-qa` button `.btn-secondary` #6c757d/#fff, 10px, padding 1px 3px, radius 0.2rem, (N) count + fa-question-circle + ✅ answered. EVIDENCE: alerts-panel.md Resolved (.alert-qa).
- ✅ MATCH — kebab items User Info / Mention / Copy / Delivery report / Delete. EVIDENCE: alerts-panel.md DOM (p_e menu).
- [P1] AlertFeed.svelte — Poll trigger placement: reference "Poll" (`doPollUI()`, `fa-question-circle` + " Poll") and "Post Alert" (`fa-plus-circle` + " Post Alert") both live in the alert header `ul.nav.ml-auto` for presenters; a non-presenter with `pollIsMinimized` still sees a blinking "Poll" restore link (`E2e`, `.poll-active-blink` #f39c12 pulse 1.5s). We put a poll icon in the header (OK for presenters) but there is NO member "restore minimized poll" blink link. EVIDENCE: alerts-panel.md DOM (E2e, poll-active-blink). FIX: when a poll is active+minimized, show a `.poll-active-blink` (#f39c12, pulse) "Poll" link in the alert header for all viewers to restore it. VERIFY: minimize an active poll → a pulsing amber "Poll" link appears in the alerts header.
- [P2] AlertFeed.svelte — `.filtered` badge (`.badge.badge-danger` " filtered", shown when `modAlertFilterList && doFilteredAlerts`, opens `#alert-filter-modal`) is not rendered in the brand. EVIDENCE: alerts-panel.md DOM (consts[8], w2e). FIX: when a filter is active, render a red " filtered" badge next to "Alerts" that opens AlertFilterModal. VERIFY: apply a filter → red "filtered" pill appears.
- [P2] AlertFeed.svelte — DND badge (`fa-bell-slash` + " DND") absent from the alert brand (same as chat). EVIDENCE: alerts-panel.md DOM (consts[9], T2e). FIX: red DND pill when `dnd.app`. VERIFY: enable DND → pill in alert header.
- [P2] AlertFeed.svelte — inline alert entry: reference presenter can toggle a `#textAreaAlertTxt` inline composer (`showAlertsEntry`, placeholder "Type your alert here.."). We post only via the modal. This is a documented reference-parity choice (alerts posted via modal only). EVIDENCE: alerts-panel.md DOM (N2e) — but note our GAP-ANALYSIS decision. FIX: optional; keep modal-only unless parity demanded. VERIFY: n/a.
- [P2] AlertFeed.svelte — per-author `invertTxtColor` on alerts: the username/created-at/kebab invert (`filter:invert(1)`) is wired ✅, and `styleF` size nudge (name +1px, date −2px) from `invertTxtColorToggler` is NOT applied. EVIDENCE: alerts-panel.md §States (per-author invert mechanic, size nudge). FIX: apply the ±1/−2px font-size nudge when a per-author fontSize is present. VERIFY: an alert with a custom fontSize shows a slightly larger name / smaller date.

---

## 7. Reply / Alert-QA / PM (`reply-qa-pm.md` → `ReplyModal`, `AlertQaModal`, `PrivateChat`)

- ✅ MATCH — Reply modal: title quote (`<strong>name:</strong>`), two-button composer (emoji + image, NO GIF), Close `.btn-secondary`. EVIDENCE: reply-qa-pm.md DOM A.
- ✅ MATCH — Alert-QA modal: `#alertQAModal` max-width 600px, min-body 330px, `.admin-alert` 1px #444 quote block, `#textAreaQATxt` "Type your question here...", static backdrop. EVIDENCE: reply-qa-pm.md DOM B.  *(verify our AlertQaModal renders the quoted-alert `.admin-alert` block + non-dismissable backdrop)*
- ✅ MATCH — PM panel: `.chat-nav-pm` #0a6db1, "No active chat" skeleton, close ×. EVIDENCE: reply-qa-pm.md DOM C.
- [P2] AlertQaModal.svelte — confirm the modal uses `data-backdrop="static"` semantics (can't dismiss by backdrop/ESC — only the × or Close). Our shared Modal closes on backdrop click + Escape. EVIDENCE: reply-qa-pm.md DOM B (data-backdrop="static", data-keyboard="false"). FIX: pass a `dismissable={false}`-style flag to Modal for the QA modal so backdrop/Escape don't close it. VERIFY: click the QA backdrop → stays open.
- [P2] PrivateChat.svelte — active PM composer should include a **GIF** button (PM-only) in addition to emoji + image; reply/QA do NOT get GIF. EVIDENCE: reply-qa-pm.md DOM C notes (PM composer has GIF, unlike Reply/QA). FIX: ensure the PM composer options include the GIF search control. VERIFY: open a PM thread → composer shows emoji/image/GIF.
- [P2] PrivateChat.svelte — presence dot (`.user-status-type` red #dc3545 circle, bottom-right of the avatar) + `.pc-list` (flex-basis 220px) + `.chatTabs` per-conversation tabs are the reference's active-panel chrome (never captured live). Verify our active PM UI approximates: navy `.chat-nav-pm` header, 220px user list, red online dot. EVIDENCE: reply-qa-pm.md Scoped CSS (privchat). FIX: align PM panel chrome to those values if it diverges. VERIFY: PM panel header is #0a6db1, user list ~220px, online users carry a red dot.

---

## 8. Poll (`poll.md` → `PollModal.svelte` + `PollPanel.svelte`)

- ✅ MATCH — PollModal is a draggable FLOATING PANEL (not a Bootstrap modal) with a titlebar (Polls + Minimize/Maximize/Close) and Create/Canned tabs. EVIDENCE: poll.md DOM (pollModalHolder titlebar) — our PollModal already models this.
- [P1] PollPanel.svelte — the reference has NO standalone always-visible results card; results live INSIDE the same floating `app-poll-modal` in `results` mode (pie chart + `#responsesTxt` textarea + "Post Results"). Our PollPanel renders active polls as a separate floating `.poll` card with vote bars in `poll-overlay`. This is a structural divergence: reference = one draggable window with setup/answer/results modes; ours = a create modal + a persistent results card. EVIDENCE: poll.md DOM (three modes ETe/xTe/RTe driven by `o.mode`). FIX (large): decide parity level. Minimum: keep PollPanel but restyle to the reference floating window (dark `#1e1e1e` bg, titlebar `#2c2c2c`, `poll-panel-btn` 28×28, `.poll-panel-btn-close:hover` #c0392b) so setup+results share the window chrome. VERIFY: an active poll renders in a `#1e1e1e` panel with a `#2c2c2c` titlebar and min/max/close buttons.
- [P1] PollModal.svelte — member `answer` mode: the voting card is `<h1>{question}</h1><hr><ol><li>{choice} <button class="btn btn-primary float-right btn-sm" style="color:white">&nbsp;Choose</button></li></ol>`. Verify a member (non-creator) receiving a broadcast poll gets this Choose-card, not the vote-bar PollPanel. EVIDENCE: poll.md DOM (xTe answer mode). FIX: when a poll arrives to a non-creator and is open, render the Choose-card variant (h1 + Choose buttons), collapsing to `mode="done"` after one vote. VERIFY: as a member, an incoming poll shows the big-question Choose card.
- [P2] PollPanel.svelte — "Anonymous Poll" round checkbox: reference `.form-check-input` is a custom 20×20 ROUND swatch (#ccc unchecked, `#45a2ff` checked) with a `\2714` checkmark + click-wave ripple. Verify the PollModal setup checkbox matches. EVIDENCE: poll.md Scoped CSS (.form-check-input round). FIX: style the anonymous checkbox as the round #45a2ff swatch. VERIFY: check "Anonymous" → round blue swatch fills.
- [P2] PollModal.svelte — the numbered step badges `<span class="label label-warning">1|2|3</span>` render as UNSTYLED inline text in the reference (`.label`/`.label-warning` absent from the stylesheet). Do NOT add a yellow badge background. EVIDENCE: poll.md Global CSS (.label absent) + Resolved (unstyled inline text). FIX: render the step numbers as plain inline text (no pill). VERIFY: the "1/2/3" step markers are plain numbers, not colored badges.
- [P2] PollModal.svelte — "Send Poll" button is `.btn-success` which resolves to BS5 **#198754** (NOT Darkly #00bc8c); "Add Choice"/"Save To Canned" are `.btn-outline-light` (#f8f9fa border/text). EVIDENCE: poll.md Resolved (.btn-success #198754, .btn-outline-light #f8f9fa). FIX: match those exact button colours in the setup tab. VERIFY: Send Poll is #198754 green.

---

## 9. Files (`files.md` → `FilesPanel.svelte`)

- ✅ MATCH — three sub-tabs (Files/Images/Sounds) with count badges, search bar, refresh, hidden `<audio id="mp3player">` sink, presenter-gated upload/delete/play-for-all. EVIDENCE: files.md DOM.
- [P2] FilesPanel.svelte — sub-tab count badges should be `.badge.rounded-pill.bg-danger.files-badge` (red pill, `margin-top:-9px; margin-left:3px`, `bg-danger` #e74c3c). Verify our badges are red pills, not a neutral count. EVIDENCE: files.md Resolved (span.files-badge). FIX: style the counts as red rounded-pill badges. VERIFY: each sub-tab shows a red count pill.
- [P2] FilesPanel.svelte — table is `.table.table-striped` with faint odd-row stripe `rgba(255,255,255,.05)` (the reference could not confirm the exact stripe — honest gap). Since our surface is on a light panel, keep a subtle stripe consistent with the light theme. EVIDENCE: files.md Resolved + Honest gaps (stripe unconfirmed). FIX: add table-striped rows if not present. VERIFY: alternating row tint in the file list.
- [P2] FilesPanel.svelte — image rows render an inline `img.fileDriveImg` (max-width 200px, black backdrop) thumbnail; non-image rows a bare download anchor. EVIDENCE: files.md DOM (const 247/257). FIX: for image files, render a 200px-max thumbnail with `background:#000`. VERIFY: an uploaded PNG shows a black-backed thumbnail in its row.

---

## 10. Notes (`notes.md` → `NotesPanel.svelte`)

- ✅ MATCH (structure) — per-note tab strip (`noteTabset`) + content pane + `.noteOptions` action bar; `app-note` renders `note.noteContent` HTML into `.note-view`. EVIDENCE: notes.md DOM.
- [P1] NotesPanel.svelte — `noteTabset` styling: reference tab strip is navy `#0c2434` (`--notes-tabs-bg`) with a `1px #0a6db1` top border; active note tab is `#45a2ff` bg / #fff, 3px radius, 12px/12px, 8px padding, 5px margin. Verify our note tabs paint that navy strip + blue active pill (not the light-panel default). EVIDENCE: notes.md Resolved (ul#notesTabs, a.nav-link.active). FIX: style the note tab strip #0c2434 with #45a2ff active pills. VERIFY: the notes tab strip is navy with a blue active tab.
- [P1] NotesPanel.svelte — `.noteOptions` action bar: **Download** `.noteDownload` bg `#92d528` (green) / #fff; **Edit** `.noteEdit` bg `#45a2ff`; **Delete** `.noteDelete` bg `#bb352a`; bar bg `#f4f4f4`, `position:sticky; bottom:0`, hover text `#212529`. Verify our action buttons use those token colours. EVIDENCE: notes.md Resolved (.noteDownload/.noteEdit/.noteDelete + --note-* tokens). FIX: map Download→#92d528, Edit→#45a2ff, Delete→#bb352a on the sticky #f4f4f4 bar. VERIFY: Download is green #92d528, Delete is red #bb352a.
- [P2] NotesPanel.svelte — welcome-mat badge (`.badge.badge-success` #00bc8c with `fa-home`, tooltip "This note is the Welcome Mat…") on the welcome note's tab; and the `#noteChangeIndicator` (`fa-edit`) flashing pencil on the main "Notes" tab + `fa-pen` per-note update flag. EVIDENCE: notes.md DOM (NSe badge, noteChangeIndicator). FIX: render a green home badge on the welcome note tab; flash the main Notes tab pencil (`animated fadeIn flash` 3s) on note update. VERIFY: welcome note shows a green home pill; editing a note flashes the Notes tab.
- [P2] NotesPanel.svelte — per-tab dropdown caret (`fa-cog` → Edit/Rename/Bring-everyone-here/Make-Welcome-Mat/Delete), presenter/canEditNotes-gated. EVIDENCE: notes.md DOM (LSe). FIX: add a cog dropdown per note tab for editors with those items (some need ⚙ BACKEND: setAsWelcomeTab, bringFocusToTab). VERIFY: as editor, each note tab has a cog menu.

---

## 11. Stage tabs & Screens (`stage-tabs-screens.md` → `MainStage.svelte`, `ScreenStage.svelte`)

- ✅ MATCH — main tab strip transparent over #0f2e43, active generic tab #45a2ff 3px pill, active NOTES tab folder (#0c2434 bg, #0a6db1 top/side border, 3px 3px 0 0 radius, z-10). EVIDENCE: stage-tabs-screens.md Resolved + States (Notes special-case).
- ✅ MATCH — Screens empty state "No one is presenting right now..." (28px h3, top-centered). EVIDENCE: stage-tabs-screens.md Resolved (h3).
- ✅ MATCH — `#screenTabs.screens-tabs` navy #0c2434 strip, per-screen pill (4px padding, #45a2ff active), presenter-img 20×20, cog dropdown "Detach Screen to a new window". EVIDENCE: stage-tabs-screens.md DOM (rSe) + ScreenStage impl.
- ✅ MATCH — zoom/snapshot/fullscreen control group (`.zoom-controls-container` opacity .5 → 1 hover, `.btn-dark` #212529). EVIDENCE: stage-tabs-screens.md DOM (FSe) + Resolved (.btn-dark).
- ✅ MATCH — "Streams" tab hidden placeholder between Screens and Notes. EVIDENCE: stage-tabs-screens.md DOM (const 4 hideStreams) — we render `hidden` placeholder.
- [P2] MainStage.svelte — `#mainTabs` order: reference is Screens · Streams(hidden) · Notes · [Recordings/VideoPlayer/Swing/Day conditional] · Files. We render Screens · Streams(hidden) · Notes · Files (no conditional tabs). EVIDENCE: stage-tabs-screens.md DOM. FIX: add conditionally-gated Recordings / Video Player tabs when the room has recordings / a queued video (⚙ BACKEND for the data flags). VERIFY: with recordings present, a "Recordings" tab appears with `fa-file-video`.
- [P2] ScreenStage.svelte — screen cog dropdown items for presenters: "Bring everyone here" (`bringFocusToScreen`), "Stop This Screen" (`stopSharingThisScreenRemote`), "Lock/Unlock Screen" (`toggleLockScreen`) — reference has these in addition to "Detach Screen". We render only "Detach Screen". EVIDENCE: stage-tabs-screens.md DOM (iSe/oSe/sSe). FIX: add presenter-gated Bring-everyone-here / Stop-This-Screen / Lock-Screen items (⚙ BACKEND: focus/stop/lock server commands; `screen_locked` event already exists). VERIFY: as presenter, screen cog lists all four items.
- [P2] MainStage.svelte — the jQuery hover effect that HIDES the whole `#mainTabs` strip while hovering `.alert-chat-box` is a reference behavior; not required. EVIDENCE: stage-tabs-screens.md §States (jQuery hover). FIX: skip (behavioral quirk, not visual parity). VERIFY: n/a.

---

## 12. Webcams-stage (`webcams-stage.md` → `WebcamHolder.svelte`, `ScreensharePreview.svelte`, `RecPreview.svelte`)

- ✅ MATCH — webcam tile `.webcamsHolder` 320×240, #000 bg, 1px yellowgreen border, 6px radius, 5px margin, cursor:move draggable; `.webcamsHolderVideo` object-fit contain; close × top-right. EVIDENCE: webcams-stage.md Resolved (.webcamsHolder) + WebcamHolder impl.
- ✅ MATCH — `.webcam-wrapper` absolute bottom, justify-center align-end w-100. EVIDENCE: webcams-stage.md Scoped CSS + MainStage `.webcam-overlay`.
- [P1] WebcamHolder.svelte — `.pNameLabel` (name bar): reference is `background:#00000080` (rgba(0,0,0,.5)) — we use `rgba(0,0,0,0.5)` ✅. But the reference overlay sits at `top:0` (z-101) across the FULL card top; verify the name bar spans full width at the top. EVIDENCE: webcams-stage.md Scoped CSS (.overlay top:0, .pNameLabel width:100%). FIX: confirm `.name` is full-width top bar — already implemented. ✅ MATCH.
- [P2] ScreensharePreview.svelte — `.webcamsHolderScreen` local screenshare preview: fixed 350×260 bottom-right, #000 bg, 1px #fafafa border, `display:none` until sharing; card-title dropdown (presenter name) + close ×; jQuery-UI draggable+resizable (8 handles). Verify our ScreensharePreview matches the 350×260 fixed card with a resizable frame. EVIDENCE: webcams-stage.md DOM 3 + Resolved (.webcamsHolderScreen). FIX: size the preview 350×260 fixed bottom-right with a resize handle. VERIFY: while sharing, a 350×260 draggable preview appears bottom-right.
- [P2] RecPreview.svelte — `.recsHolderScreen` rec preview: fixed 350×260 at `bottom:265px; right:0` (stacked above the screenshare preview), expand toggles `.recsHolderScreen-lg` 700×520 (icon fa-expand↔fa-compress-arrows-alt), body shows `img.recPreviewScreen` while recording else `<h4>Recording paused.</h4>`; header "Recording Preview. (DELAYED UPTO 20s)". EVIDENCE: webcams-stage.md DOM 4 + Resolved (.recsHolderScreen). FIX: match the 350×260→700×520 expand, the delayed-preview header text, and the paused fallback. VERIFY: recording → a bottom-right rec preview with an expand button that doubles its size.
- [P2] CaptionsOverlay.svelte — speech-reco overlay: `position:absolute; bottom:0; bg rgba(0,0,0,.8)`, `.speech-reco-line` 22px #fff, `.speech-reco-sender` fw-600, history/close buttons (28×28 circle, 2px #fff border) revealed on overlay hover; responsive font 22→20→16→14. Verify our CaptionsOverlay approximates these. EVIDENCE: webcams-stage.md Scoped CSS (speech-reco). FIX: align caption overlay to bottom `rgba(0,0,0,.8)`, 22px white line, hover-revealed circular buttons. VERIFY: captions render as a bottom bar with a bold sender + 22px text.

---

## 13. Modals-core (`modals-core.md` → `Modal.svelte` + user-settings/av/post-alert/mobile/webrtc modals)

- ✅ MATCH — shared shell: `.modal-content` #103d5c bg / #f4f4f4, 8px→(our 6px) radius, header/footer border #45a2ff, `btn-close-white` white ×, `.modal.fade` slide-in. EVIDENCE: modals-core.md Resolved (.modal-content) + Modal.svelte.
- ✅ MATCH — nav-tabs inside modals: active #45a2ff/#fff, 1px #45a2ff border, hover #45a2ff border. EVIDENCE: modals-core.md Global CSS (app override block).
- ✅ MATCH — buttons: `.btn-primary` #0a6db1, `.btn-success` #92d528, `.btn-secondary` #6c757d, `.btn-warning` #ffc107, `.btn-outline-danger` #dc3545, `.btn-outline-light` #f8f9fa. EVIDENCE: modals-core.md Resolved (buttons).
- ✅ MATCH — round 20px `.form-check-input` swatch (#ccc → #45a2ff checked), `:checked + label{text-transform:uppercase;font-weight:700}`. EVIDENCE: modals-core.md Scoped CSS (user-settings). *(verify SettingsModal renders round swatches + uppercase-on-checked labels)*
- [P1] Modal.svelte — `.modal-content` border-radius: reference computes **8px** (all captures), we use 6px. EVIDENCE: modals-core.md Resolved (border-radius 8px) + modals-admin.md Resolved (border-radius 8px). FIX: change `.panel` border-radius from 6px → 8px. VERIFY: any modal has 8px corners.
- [P1] Modal.svelte — title font: reference h5/h5.modal-title compute **20px / weight 500** across all captured modals (the `.modal-title{18px/700}` rule is present but shadowed). We use 20px/500 ✅. But bare-h5 (non-`.modal-title`) titles like "General Settings"/"Q&A for Alert:" render at 16px/300 in some captures — minor; keep 20px/500 as the rendered truth. EVIDENCE: modals-admin.md Honest gaps (rendered truth 20/500). FIX: none. ✅ MATCH.
- [P2] Modal.svelte — backdrop opacity: reference `.modal-backdrop` is `#000` at `.5`; we use `rgba(0,0,0,0.5)` ✅. Stacking: reference backdrop 1054 / modal 1055; we set backdrop 1054 / panel 1055 ✅. `#followedUsersModal` is deliberately z-1054 (below the standard layer). EVIDENCE: modals-admin.md Resolved (followed z-1054). FIX: give FollowedUsersModal a lower z so it can open under another modal. VERIFY: FollowedUsers opens beneath a stacked modal.
- [P2] SettingsModal.svelte — verify the 3 tabs (App / Alert / Chat Settings) + the Colors & Size color pickers (`#chat-*-color` 45×20px, `#chat-text-size` number 45×20 13px) + the DND checkbox rows with trailing `<span>on</span>` state words. EVIDENCE: modals-core.md DOM (user-settings). FIX: align if diverging. VERIFY: Settings modal has App/Alert/Chat tabs and 45×20 color swatches.
- [P2] AVSettingsModal.svelte — "Disable Video (saves bandwidth)" nav-item + Speakers select + Test button; presenter tab with audio/video device selects + "Change Devices". EVIDENCE: modals-core.md DOM (av-settings). FIX: verify structure. VERIFY: AV modal shows the speakers/test row.
- [P2] PostAlertModal.svelte — 3 tabs (Text Alert / Text Url / Image·GIF·Video), the 5 footer checkboxes (Keep open / Post on X / push / non-trade / legal disclosure), `.upload-area` drop zone, `#addon-img` #0a6db1 prepend. EVIDENCE: modals-core.md DOM (post-alert). FIX: verify. VERIFY: Post Alert modal has the 3 tabs + 5 checkboxes.
- [P2] ConnectivityCheckModal.svelte (webrtc) — 4 `.status-item` rows (UDP/TCP/STUN/TURN) with LIGHT card bg `#f8fafc`, `.status-icon.pending` #64748b, passed #10b981 / failed #ef4444, header title white/700, Start Test `.btn-primary` #0a6db1 / Copy `.btn-success` #92d528. EVIDENCE: modals-core.md Resolved (webrtc). FIX: match the light status cards + colored icons. VERIFY: connectivity modal shows 4 light cards with grey pending dots.
- [P2] MobileAppInfoModal.svelte — two store badges (Google Play PNG `.google-badge` max-height 60px + App Store SVG), `.btn-secondary` Close. EVIDENCE: modals-core.md DOM (mobile-app-info). FIX: verify badge sizing. VERIFY: modal shows both store badges.

---

## 14. Modals-admin (`modals-admin.md` → AlertLogs/ChatLogs/Muted/Followed/SessionControl/Scheduled/AdvancedSearch/AlertFilter/AllUserPm/AlertSendReport)

- ✅ MATCH — shared navy shell (#103d5c, #45a2ff borders, white ×). EVIDENCE: modals-admin.md Resolved.
- [P1] AlertLogsModal / ChatLogsModal — `.modal-dialog` max-width **1000px** (scoped), `.list-group` max-width 600px centered, `.list-group-item` white rows with `.fw-bold` date / "By: email" (chat-logs adds "Channel: main|offTopic"), "Reload Log List" `.btn-primary` #0a6db1. EVIDENCE: modals-admin.md Resolved (alerts-logs) + DOM 1/2. FIX: size these two modals to 1000px, render date/By/Channel rows. VERIFY: Chat Logs modal is ~1000px wide with date/By/Channel rows.
- [P2] MutedUsersModal — Close is `.btn-primary` (#0a6db1); FollowedUsersModal Close is `.btn-light` (#f8f9fa). Different close buttons per modal. EVIDENCE: modals-admin.md DOM 3/4. FIX: match the per-modal close button variant. VERIFY: Muted Close is blue, Followed Close is light.
- [P2] AdvancedSearchModal — max-width 1000px, header inline "Rooms" refresh `.btn-info` button, trader/room multi-select dropdowns (`data-bs-auto-close="outside"`, 200×38 toggle, trader menu 410px column-wrap), datetime-local Start/End (190px), Non-Trade/Archives checkboxes, Search `.btn-primary` / Close `.btn-secondary`. EVIDENCE: modals-admin.md DOM 7 + Scoped CSS. FIX: verify the multi-select + date-range layout. VERIFY: Advanced Search shows two multi-selects + two datetime inputs at ~1000px.
- [P2] ScheduledAlertsModal — `.modal-xl` (800px) `text-white`, table headers Date/Time · Sender · Alert · Repeat · Actions, `.alert-date-time-th` min-width 150px, `.remove-scheduled-alert-btn` 88px. EVIDENCE: modals-admin.md DOM 6 + Scoped CSS. FIX: verify the 5-col table. VERIFY: Scheduled modal is xl with a 5-column table.
- [P2] AlertFilterModal — title "Filter out … alerts from the following:", `#show-alerts` checkbox "Only show alerts from these people:", per-trader `.list-group-item-action` rows (`toggleTraders`), "List is empty." fallback. EVIDENCE: modals-admin.md DOM 8. FIX: verify. VERIFY: filter modal shows the checkbox + trader list.
- [P2] AllUserPmModal — `#all-user-pm-modal` "All private messages:", loading spinner state, embeds `logType="pc"` message log; opened from an admin `.btn-outline-light.btn-block`. EVIDENCE: modals-admin.md DOM 9. FIX: verify. VERIFY: All-PM modal shows a spinner then the PM log.
- [P2] AlertSendReportModal — "Alert Sent Report. AlertID:{id}", spinner loading, `#pie-container` 600×192 delivery pie, `.sent-time` 14px #6c757d, `.failed-reason` 14px/100 italic. EVIDENCE: modals-admin.md DOM 10 + Scoped CSS. FIX: verify the report + pie. VERIFY: report modal shows a 600×192 pie + sent/failed rows.
- [P2] SessionControlModal — `.modal-lg`, body runtime-rendered (summernote "room closed message" editor + device selects + streaming RTMP controls), footer "Done" `.btn-success.btn-block` (no data-bs-dismiss — closed via `done()`). EVIDENCE: modals-admin.md DOM 5. FIX: verify our SessionControl approximates (closed-message editor + streaming). VERIFY: Session Control is lg with a rich-text closed-message editor.

---

## 15. Overlays & Toasts (`overlays-toasts.md` → `ToastContainer.svelte`, `Lightbox.svelte`, `ConnectionOverlay.svelte`)

- [P1] ToastContainer.svelte — position: reference `#toast-container` is `.toast-top-right` with the app override `top:70px !important` (below the 49px nav + margin), z-999999, right:12px, each `.ngx-toastr` 300px, padding 15px 15px 15px 50px, radius 3px, box-shadow `0 0 12px #999`, type bg (`.toast-info`#2f96b4 / `.toast-error`#bd362f / `.toast-success`#51a351 / `.toast-warning`#f89406), 24px SVG icon left. Our toasts are custom-positioned. EVIDENCE: overlays-toasts.md Resolved (#toast-container, .ngx-toastr, type bg). FIX: position toasts top-right at top:70px, width 300px, 3px radius, 15/50px padding, and use the four toastr type backgrounds. VERIFY: an alert toast appears top-right ~70px down, 300px wide, teal/blue.
- [P2] ToastContainer.svelte — app routes success/info/error all through the **info** variant with a close button + blank title (`alertService.info(e,"",{closeButton:true})`). So most app toasts are the blue info style with an × close. EVIDENCE: overlays-toasts.md Behavior (all through info). FIX: default toasts to the info style + close button. VERIFY: a chat/alert toast is blue with an × close button.
- [P2] Lightbox.svelte — reference image modal is a bootbox `.imgur-modal` (`.modal-lg` min-width 90% / min-height 80%, `.modal-content` #103d5c, `text-align:center`, `img` max-width 100% / max-height calc(100vh−150px), a `<hr>` + "Download Image" `.btn-primary.btn-sm`). Verify our Lightbox matches (centered image + download button + 90%/80% dialog). EVIDENCE: overlays-toasts.md DOM 3 + Resolved (imgur). FIX: add a "Download Image" button under the image; size the dialog 90%/80%. VERIFY: clicking a chat image opens a large centered lightbox with a Download button.
- [P2] ConnectionOverlay.svelte — the connected chip is `.notConnectedOverlay#connectedMsg` (`animated fadeIn`, absolute bottom:5px right:5px, z-10000, #000 bg, opacity .7, `fa-check` + " Conected" — note the reference typo "Conected"). Ours renders a reconnect banner. Keep our clearer "Connected/Reconnecting" wording (the typo is a reference bug; do NOT replicate). EVIDENCE: overlays-toasts.md DOM 2 (Conected typo). FIX: none required; do not copy the typo. VERIFY: n/a.

---

## 16. Color-system (`color-system.md` → ChatPanel/AlertFeed per-author colours)

- ✅ MATCH — per-message `styleB` (row bg), `styleF` (text colour + font-size), `invertTxtColor` (username/kebab/created-at get `color:<bg>; filter:invert(1)`). EVIDENCE: color-system.md Behavior (steps 1–5) + ChatPanel/AlertFeed impl.
- ✅ MATCH — `.stockColor` 700/italic/uppercase inheriting body colour; `.tradeColor` `--app-link-color` #45a2ff underline. EVIDENCE: color-system.md Global CSS.
- [P2] ChatPanel/AlertFeed — `.mentionColor` (#048d04 italic) and `.questionColor` (#2095f2) body classes are toggled in the reference when `msg.isMention` / body contains "?". These are in the reference ngClass map (color-system.md flags the CSS itself as an honest gap — not found in scope, but alerts-panel.md gives the values `#048d04`/`#2095f2`). We don't tint mentions/questions. EVIDENCE: alerts-panel.md Global CSS (.mentionColor/.questionColor). FIX: add `.mentionColor`/`.questionColor` body classes toggled on mention / "?"-containing messages. VERIFY: a message mentioning you renders in green italic.
- [P2] color-system font-size nudge — `invertTxtColorToggler` sets name = fontSize+1px, date = fontSize−2px when a per-author fontSize is present. Not applied (same item as Alerts §6). EVIDENCE: color-system.md §States (size nudge). FIX: apply the ±1/−2 nudge in both ChatPanel and AlertFeed. VERIFY: a custom-fontSize author's name is slightly larger, date slightly smaller.

---

## 17. Theme-tokens (`theme-tokens.md` → `layout.css`)

- ✅ MATCH — the live blue-navy palette is baked into `layout.css` as flat tokens matching the resolved values (`--navbar-bg:#0c2434`, `--sidebar-menu-bg:#103d5c`, `--tab-active-bg:#45a2ff`, `--notes-tabs-bg:#0c2434`, `--content-header-bg:#0a6db1`, `--username-color:#0a6db1`, `--presenter-area-bg:#0f2e43`, `--modal-bg:#103d5c`, `--split-gutter-bg:#0a6db1`, `--qa-badge-bg:#6c757d`, `--kebab-color:#8c8686`, `--content-meta:#a8a8a8`, `--content-text:#676767`, `--content-separator-bg:#e8e8e8`). EVIDENCE: theme-tokens.md §A/C Resolved.
- [P2] layout.css — the reference supports a `.lightTheme`/`.darkTheme` class flip on `app-room#topRoomDiv` that re-points 20 mapped tokens. We hard-code the light values. If a theme toggle is ever added (the "Choose Color Theme" radios in SettingsModal), it needs the dark token set (`--darkTheme-*`: msgs-bg #143c57, roster-bg #111, textarea-bg #0c2434, msg-color #fff, etc.). EVIDENCE: theme-tokens.md §B (darkTheme source pairs) + §States (theme toggle). FIX: only if wiring the dark theme — add a `.dark` root scope with the §B dark values and toggle it from SettingsModal. VERIFY: toggling "Dark Theme" repaints chat/roster/composer to the dark palette. Otherwise: leave as-is (documented single-theme decision).
- [P2] SettingsModal.svelte — the "Choose Color Theme" radios (Light/Dark) currently have no dark theme to switch to. Either wire the dark token set (above) or mark the Dark radio disabled/"coming soon" honestly rather than a no-op. EVIDENCE: modals-core.md DOM (App Settings → #app-light-theme/#app-dark-theme). FIX: disable the Dark radio (honest) OR implement the dark token flip. VERIFY: the Dark radio either themes the room or is clearly unavailable.

---

## Recommended execution order

**Wave 1 — visible P0/P1 chrome parity (no backend):**
1. Modal.svelte border-radius 6px → **8px** (§13) — one-line, affects every modal.
2. ChatPanel gear → inline `.chatToolbar` panel + inline composer buttons at ≥400px (§4 P1, §5).
3. Notes tab strip navy + `.noteOptions` button colours (Download #92d528 / Edit #45a2ff / Delete #bb352a) (§10 P1).
4. Roster kebab "Private Chat" item; count badge as navy pill (§3 P1/P2).
5. ToastContainer → top-right toastr styling (top:70px, 300px, type backgrounds, info default) (§15 P1).
6. AlertLogs/ChatLogs modals → 1000px + date/By/Channel rows (§14 P1).

**Wave 2 — P1 behavioral parity (mostly frontend):**
7. Sidebar Archives "Recording" item + presenter "Get Random User" (§2) [Get-Random ⚙ BACKEND].
8. AlertFeed poll-restore blink link + `.filtered`/DND badges (§6 P1/P2).
9. Poll: member `answer` Choose-card + PollPanel floating-window restyle (§8 P1).
10. Alert-QA static backdrop; PM composer GIF button + presence dot (§7).

**Wave 3 — P2 polish & completeness:**
11. Top-nav: sidebar open-state arrow, volume level icons, background-music slider, DON'T DISTURB uppercase (§1).
12. Chat/Alert `.mentionColor`/`.questionColor` + per-author font-size nudge (§16, §4/§6).
13. Files: red pill badges, image thumbnails, striped rows (§9).
14. Notes welcome-mat badge + change-flash + per-tab cog (§10 P2).
15. ScreensharePreview 350×260 + RecPreview 350×260↔700×520 + CaptionsOverlay bottom bar (§12).
16. Screen cog Bring-everyone/Stop/Lock items (§11) [⚙ BACKEND], main-tab Recordings/VideoPlayer tabs [⚙ BACKEND].
17. Remaining modal detail passes: PostAlert checkboxes, WebRTC status cards, AdvancedSearch/Scheduled/AlertFilter/AllPm/SendReport (§13/§14 P2).
18. Lightbox Download button (§15 P2).

**Wave 4 — optional / gated:**
19. Dark theme token set + SettingsModal Light/Dark flip, OR disable the Dark radio honestly (§17).
20. Presenter roster fields (Trial/New/stars/location), inline alert entry, webinar mode (§3/§6/§4) — all ⚙ BACKEND-dependent.

**Backend-required items (⚙):** Get Random User; presenter roster fields (trial/new/years/location); Recordings/Video-Player tab data; screen focus/stop/lock commands; setAsWelcomeTab / bringFocusToTab; webinar-mode flag; scheduled-alerts persistence; alert-send-report delivery data.
