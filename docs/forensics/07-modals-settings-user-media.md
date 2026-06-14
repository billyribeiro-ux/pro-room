# Forensic Dossier 07 — Settings / User / Media Modals

**Scope:** 15 modals — SettingsModal, AVSettingsModal, MediaForAllModal, PlayYouTubeModal, RichTextEditorModal, ConnectivityCheckModal, DebugLogModal, SessionControlModal, UserInfoModal, AllUserPmModal, MutedUsersModal, FollowedUsersModal, ChatLogsModal, ReplyModal, MobileAppInfoModal.
**Method:** source read of every modal + shared `web/src/lib/components/Modal.svelte`; live render via a temporary scratch route (`web/src/routes/_forensic_b`, since deleted) using the harness `openRoom({role:'presenter',width:1280,height:900})`, then navigating `?m=<Name>`; FA5 glyph validation by grep over `web/node_modules/@fortawesome/fontawesome-free/css/all.min.css`; capture evidence from `docs/reference/captures/proroom-ultra-admin-room.json`.
**Baseline:** `pnpm --prefix web run check` = **0 errors / 0 warnings** before and after this investigation. All 15 modals rendered live with **0 per-modal console errors**.

---

## Global capture finding (applies to ALL 15 modals) — EVIDENCE GAP for modal bodies

Hard evidence from `docs/reference/captures/proroom-ultra-admin-room.json`:
- `elements[]` (1177 nodes) scanned: **`role="dialog"` or `aria-modal` count = 0**; **elements with a `modal`/`modal-*` class = 0**.
- Conclusion: **the capture contains NO open modal DOM.** Every modal in this dossier is **click-triggered** and therefore absent from the static capture. Pixel-for-pixel reference comparison of modal *bodies* is an **EVIDENCE GAP** for all 15 — there is nothing to diff against.
- What the capture DOES corroborate is the **trigger labels**. The capture `controls[]` array (156 controls) contains the exact sidebar/menu text our triggers use: `"General Settings"`, `"Connectivity Check"`, `"Manage Followed Users"`, `"Manage Muted Users"`, `"Mobile App Info"`, `"Settings"`, `"Reload Users"`, `"Sort Users"`, `"Search Users"`, `"Chat Logs"`, `"Session Control"`, `"Debug Log"`. (`ours` sidebar labels in `RoomSidebar.svelte` match these.)

Where a per-modal section says "EVIDENCE GAP (no modal DOM in capture)" it refers to this finding.

---

## Shared wrapper — `web/src/lib/components/Modal.svelte`

- Svelte 5 runes throughout (`$props`, `$state`, `$effect`, `$props.id()`). Clean.
- Structure: `.backdrop` (fixed, z-1000, rgba(0,0,0,.6)) → `.panel` (`role="dialog" aria-modal="true" aria-labelledby` from `$props.id()`, `tabindex="-1"`, focus-trap entry via `queueMicrotask(panel.focus)`, focus-restore on close) → `header.head` (`h2.title` + close button) → `.body` → optional `footer.foot`.
- Close button: `<Icon name="times" size={18}>` — **FA5 `fa-times` valid** (`\f00d`).
- Panel `max-width:440px`, `max-height:calc(100vh - 2rem)`, body `overflow-y:auto` (so tall modals scroll inside the body — verified on SettingsModal at 868px tall, footer stays pinned).
- **Behaviour note (applies to every modal):** Escape closes (keydown handler), backdrop click closes, panel click stops propagation. Solid.
- **Minor a11y:** backdrop is a `div` with `onclick`/`onkeydown` and an `a11y_no_static_element_interactions` ignore comment — acceptable; no fix needed.

---

## 1. SettingsModal — `web/src/lib/components/modals/SettingsModal.svelte`

1. **Trigger & reachability:** `RoomSidebar.svelte:102` button "General Settings" → `settingsOpen = true`; mounted at `RoomSidebar.svelte:246`. **Reachable.** Title rendered = `"General Settings"`.
2. **Structure:** 3 tabs (App Settings / Alert Settings / Chat Settings, `role="tablist"`). Sections use `<Icon>` headers: `palette`, `columns`, `wrench`, `bell-slash`, `desktop`, `closed-captioning`, `user-tie`, `file`, `bell`, `filter`. Radios (theme-mode, room-layout, alert-text-mode, chat-text-mode — these **do** carry `name`), color inputs, range slider, many checkboxes. Footer: single **"Close"** button (`onclick={onClose}`). Live panel = **440×868** (scrolls in body).
3. **FA5 glyph validity:** all valid — `palette \f53f`, `columns \f0db`, `wrench \f0ad`, `bell-slash \f1f6`, `desktop \f108`, `closed-captioning \f20a`, `user-tie \f508`, `file \f15b`, `bell \f0f3`, `filter \f0b0`, `undo-alt \f2ea`, `save \f0c7`. **No broken glyphs.**
4. **Form-field id/name gaps (this is the big one):** radios are fine (have `name`). **Every checkbox and color input lacks both `id` and `name`:**
   - Color inputs (have `aria-label` only, no id/name): `:219` (×4 via `{#each colorControls}`).
   - Range slider `:231` **is fine** (`id="settings-text-size"` + `<label for>`).
   - Checkboxes missing id+name: `:203` (PM logs), `:258,:262,:266,:270,:274` (App DnD ×5), `:285` (Video Enabled), `:295` (Captions), `:334,:338,:342,:346,:350` (Alert DnD ×5), `:361` (Longer popup), `:393` (Smaller image), `:404,:408,:412,:416` (Chat DnD ×4), `:427` (Extra column), `:437` (Scroll bottom), `:448,:452` (Reduce memory ×2). **~27 checkboxes + 4 color inputs = ~31 fields with no id/name.** All are wrapped in `<label>` so they are *implicitly labelled* (a11y screen-reader OK), but they have no stable `id`/`name` for form serialization, autofill, or test targeting.
5. **Runes/check issues:** None — check is 0/0. Note the `$effect` at `:110` writes 9 `setDnd(...)` calls on every render of any of those `$state` deps (intentional sync), correct runes usage.
6. **Behaviour / dead controls:** "Edit my Info and Avatar" (`:300`) and "Filter out alerts" (`:365`) are **no-ops unless the parent wires `onEditProfile`/`onFilterAlerts`** — `RoomSidebar.svelte:246` mounts SettingsModal **without** those props, so **both buttons are currently dead** in production. "Save changes"/"Reset" call real `theme.apply()/reset()`. Theme/layout/color/size radios drive real stores.
7. **Capture evidence:** Trigger label `"General Settings"` present in capture `controls[]`. Modal body = **EVIDENCE GAP** (no modal DOM in capture).
8. **Screenshot:** `docs/forensics/shots/07-SettingsModal.png`.
9. **Prioritized fixes:**
   - **[Dead control] `RoomSidebar.svelte:246`** → pass `onEditProfile`/`onFilterAlerts` (or remove the two buttons) so they aren't inert.
   - **[Form hygiene] SettingsModal `:203–:452`** → add `id`+`name` to each checkbox/color input (e.g. `name="pm-logs-right"`, `name="dnd-app"`, …) for serialization/testability. Low visual risk.

---

## 2. AVSettingsModal — `web/src/lib/components/modals/AVSettingsModal.svelte`

1. **Trigger & reachability:** `RoomSidebar.svelte:91` button "Audio/Video Settings" → `avSettingsOpen = true`; mounted `:241`. **Reachable.** Title = `"Audio/Video Settings"`.
2. **Structure:** 2 tabs (User Settings / Presenter). User tab: "Disable Video" checkbox + Speakers `<select id="av-speaker">` with Test button. Presenter tab: mic/camera selects (`id="av-mic"`, `id="av-camera"`) + "Change Devices". Footer: **Save** (green `.success`) + **Close** (`.ghost`). Live panel = 440×360.
3. **FA5 glyphs:** `desktop \f108`, `volume-up \f028`, `microphone \f130`, `video \f03d` — all valid.
4. **Form-field id/name gaps:** the three `<select>` all have `id` (good). **Gap:** `disableVideo` checkbox `:160` lacks `id`+`name` (wrapped in `<label>`, so a11y OK).
5. **Runes/check issues:** None. `$effect` device enumeration with a `didEnumerate` plain-guard is correct (avoids read+write loop).
6. **Behaviour / dead controls:** "Change Devices" and "Save" are **no-ops unless parent wires `onChangeDevices`/`onSave`** — `RoomSidebar.svelte:241` mounts **without** them, so Save/Change-Devices currently do nothing but close. "Test" tone (`testSpeaker`) is real WebAudio and works. Device lists show "No … detected" until mic/cam permission granted (expected, hint shown).
7. **Capture evidence:** No `"Audio/Video Settings"` literal found in capture `controls[]` text scan (the reference's AV-settings menu item may be labelled differently or icon-only) — note as partial **EVIDENCE GAP**. Modal body = EVIDENCE GAP.
8. **Screenshot:** `docs/forensics/shots/07-AVSettingsModal.png`.
9. **Fixes:** [Dead control] `RoomSidebar.svelte:241` → wire `onSave`/`onChangeDevices` to real device switching, or the presenter tab is decorative. [Form hygiene] `:160` add `id="av-disable-video" name="av-disable-video"`.

---

## 3. MediaForAllModal — `web/src/lib/components/modals/MediaForAllModal.svelte`

1. **Trigger & reachability:** `routes/rooms/[id]/+page.svelte:473` "Music" presenter control → `showMediaModal = true`; mounted `:410` **with real `onPlay={playMedia}` / `onStop={stopMedia}`.** **Reachable + fully wired** (gated on `caps?.can_publish_screen`). Title = `"Play music for all"`.
2. **Structure:** intro (`music` icon), URL `<input type="url">` with live "Detected:" provider hint, inline error region. Footer: **Stop for everyone** (`stop` icon) + **Play for everyone** (`play` icon). Live panel = 440×296.
3. **FA5 glyphs:** `music \f001`, `stop \f04d`, `play \f04b`, `exclamation-circle \f06a` — all valid.
4. **Form-field id/name gaps:** URL input `:139` has `aria-describedby`/`aria-invalid` but **no `id`/`name`** and **no `<label for>`** — it relies on a `<span class="field-label">` inside the wrapping `<label class="field">` (implicit label OK, but no id/name). Add `id="media-url" name="media-url"`.
5. **Runes/check issues:** None. `$derived` detection is clean; URL host-parsing is robust (subdomain-safe).
6. **Behaviour:** Fully functional — validates protocol, detects SoundCloud/YouTube/MP3/video, calls real `onPlay`. No dead controls.
7. **Capture evidence:** EVIDENCE GAP (no modal DOM in capture). Trigger is an icon-only "Music" control (not a text label in `controls[]`).
8. **Screenshot:** `docs/forensics/shots/07-MediaForAllModal.png`.
9. **Fixes:** [Form hygiene] `:139` add `id`/`name`. Otherwise solid — best-wired media modal of the set.

---

## 4. PlayYouTubeModal — `web/src/lib/components/modals/PlayYouTubeModal.svelte`

1. **Trigger & reachability:** `RoomSidebar.svelte:178` admin sub-item "Play YouTube Video" → `playYoutubeOpen = true`; mounted `:247` **without `onPlay`** (admin-gated by `canManage`). **Reachable but the Play action is a no-op.** Title = `"Play YouTube Video"`.
2. **Structure:** intro (`youtube` brand icon), URL `<input type="url">`, error. Footer: **Save** + **Play For All**. Live panel = 440×275.
3. **FA5 glyphs:** `youtube \f167` rendered with `family="brands"` (`.fab`) — **valid brand glyph.**
4. **Form-field id/name gaps:** URL input `:60` — no `id`/`name`, no `<label for>` (uses `<span class="label">` inside wrapping `<label>`). Add `id="yt-url" name="yt-url"`.
5. **Runes/check issues:** None.
6. **Behaviour / dead controls:** **"Save" (`:48`) is dead** — `save()` only validates and clears the error, it never persists or calls a callback (no `onSave` prop exists). **"Play For All" calls `onPlay` which is unset at the mount site (`:247`)** → also effectively dead in production. URL validator is a loose regex (`youtube\.com|youtu\.be` substring) — weaker than MediaForAll's host parser.
7. **Capture evidence:** EVIDENCE GAP. (Capture text scan found `"Play YouTube"` 0× in controls; admin sub-menu may be collapsed in capture.)
8. **Screenshot:** `docs/forensics/shots/07-PlayYouTubeModal.png`.
9. **Fixes:** [Dead control] `:48` "Save" → either remove it or give it a real action (it has no purpose distinct from Play). `RoomSidebar.svelte:247` → wire `onPlay`. [Form hygiene] `:60` add id/name. **Overlap concern:** MediaForAllModal already handles YouTube — PlayYouTubeModal is redundant with a weaker validator; consider consolidating.

---

## 5. RichTextEditorModal — `web/src/lib/components/modals/RichTextEditorModal.svelte`

1. **Trigger & reachability:** `NotesPanel.svelte:212` edit button → `editorOpen = true` (also `:73` programmatic); mounted `NotesPanel.svelte:240` **with real `initialHtml` + `onSave={saveBody}`.** **Reachable + wired.** Title = `"Rich Text"`.
2. **Structure:** toolbar (`role="toolbar"`) with 5 tool buttons, optional inline link composer (`#rte-link-url` input with `<label for>`), `contenteditable` editor (`#rte-editor`, white surface, `role="textbox"`). Footer: **Close** + **Send**. Live panel = 440×423.
3. **FA5 glyphs:** `bold \f032`, `italic \f033`, `underline \f0cd`, `list-ul \f0ca`, `link \f0c1` — all valid (verified rendered in screenshot, no empty squares).
4. **Form-field id/name gaps:** link input `:155` has `id="rte-link-url"` + `<label for>` (good). The `contenteditable` is not a form field. **No gaps.**
5. **Runes/check issues:** None. Uses `{@attach}` Svelte 5 attachments correctly; `innerHTML` seed is DOMPurify-sanitised (`:40`) — good XSS hygiene.
6. **Behaviour:** Functional via `document.execCommand` (deprecated but works); link composer themed (no `window.prompt`). Send calls real `onSave`. No dead controls.
7. **Capture evidence:** EVIDENCE GAP (notes-editor is admin-click-triggered).
8. **Screenshot:** `docs/forensics/shots/07-RichTextEditorModal.png`.
9. **Fixes:** None required. (Optional: `execCommand` is deprecated — long-term migration, not a match issue.)

---

## 6. ConnectivityCheckModal — `web/src/lib/components/modals/ConnectivityCheckModal.svelte`

1. **Trigger & reachability:** `RoomSidebar.svelte:80` "Connectivity Check" → `connectivityOpen = true`; mounted `:240`. **Reachable.** Title = `"Connectivity Check"`.
2. **Structure:** intro (`plug` icon), 4 status rows (UDP/TCP/STUN/TURN) with colored dots. Footer: **Start Test** / **Copy Results** (`copy` icon) / **Close**. Live panel = 440×418.
3. **FA5 glyphs:** `plug \f1e6`, `copy \f0c5` — valid.
4. **Form-field id/name gaps:** none (no inputs).
5. **Runes/check issues:** None.
6. **Behaviour / dead controls:** **The test is purely presentational** — `startTest()` walks rows pending→pass on a 450ms timer; **no real WebRTC probing** (acknowledged in source comment `:33`). "Copy Results" is real (clipboard). So results are always "Passed" regardless of actual connectivity — **functionally fake**.
7. **Capture evidence:** Trigger label `"Connectivity Check"` present in capture `controls[]`. Body = EVIDENCE GAP.
8. **Screenshot:** `docs/forensics/shots/07-ConnectivityCheckModal.png`.
9. **Fixes:** [Behaviour] `:35 startTest` → wire to a real ICE-gathering probe; today it falsely reports success. Cosmetics fine.

---

## 7. DebugLogModal — `web/src/lib/components/modals/DebugLogModal.svelte`

1. **Trigger & reachability:** `RoomSidebar.svelte:194` admin sub-item "Debug Log" → `debugLogOpen = true`; mounted `:249` **without a `log` prop** (admin-gated). **Reachable, but always shows the empty placeholder** ("No debug log captured…") because no `log` is passed. Title = `"Debug Log"`.
2. **Structure:** read-only monospace `<textarea id="debug-log-text">` with `sr-only` `<label for>`. Footer: **Copy** (`copy`/`check` icons, disabled when empty) + **Close**. Panel widened to **820px** via `:has(.debug-log-body)`. Live panel = 820×528.
3. **FA5 glyphs:** `copy \f0c5`, `check \f00c` — valid.
4. **Form-field id/name gaps:** textarea has `id` + `<label for>` (good). **No gaps.**
5. **Runes/check issues:** None. `$effect` cleanup clears the copy-flash timer correctly.
6. **Behaviour:** Copy works when log present; disabled otherwise. **Dead in practice** because mount site never supplies `log`.
7. **Capture evidence:** Trigger label `"Debug Log"` present in capture `controls[]`. Body = EVIDENCE GAP.
8. **Screenshot:** `docs/forensics/shots/07-DebugLogModal.png` (rendered with sample log via scratch route).
9. **Fixes:** [Dead content] `RoomSidebar.svelte:249` → pass a real `log` source so the modal isn't permanently empty.

---

## 8. SessionControlModal — `web/src/lib/components/modals/SessionControlModal.svelte`

1. **Trigger & reachability:** `RoomSidebar.svelte:186` admin sub-item "Session Control" → `sessionControlOpen = true`; mounted `:248` (admin-gated `canManage`). **Reachable.** Title = `"Session Control"`. Reads `page.params.id` at init — fine inside `/rooms/[id]`.
2. **Structure:** intro (`shield-alt`), error region, 6 action rows each `[icon] [label + hint]`. Footer: **Done**. Live panel = 440×673.
3. **FA5 glyphs:** `shield-alt \f3ed`, `lock \f023`, `desktop \f108`, `volume-mute \f6a9`, `broom \f51a`, `exchange-alt \f362`, `sign-out-alt \f2f5` — all valid.
4. **Form-field id/name gaps:** none (no inputs; only buttons).
5. **Runes/check issues:** None. Optimistic toggle + revert-on-error pattern is correct.
6. **Behaviour:** Real API calls — `lockRoom`, `muteAllApi`, `clearChatApi`, `lockScreenApi`, `kickDuplicatesApi` from `$lib/admin`; destructive actions confirm via styled `confirmDialog` (no `window.confirm`). **Note label/action mismatch:** the `end-session` action is labelled **"Unlock room"** and calls `lockRoom(roomId, false)` then `onEndSession?.()` — `onEndSession` is **unset at the mount site (`:248`)**, so the "end the broadcast" side of it is a no-op; only the unlock fires. Minor inconsistency between the modal's "Session Control / end session" framing and what it actually does (lock/unlock + admin housekeeping).
7. **Capture evidence:** Trigger label `"Session Control"` present in capture `controls[]`. Body = EVIDENCE GAP.
8. **Screenshot:** `docs/forensics/shots/07-SessionControlModal.png`.
9. **Fixes:** [Behaviour] `RoomSidebar.svelte:248` → wire `onEndSession` if a true end-broadcast is intended; otherwise the "end" semantics are just "unlock". Otherwise solid (real admin wiring, confirm dialogs).

---

## 9. UserInfoModal — `web/src/lib/components/modals/UserInfoModal.svelte`

1. **Trigger & reachability:** Two mount sites: `ChatPanel.svelte:267` (set via `infoUser` at `:118`) and `AlertFeed.svelte:325` (set at `:125`). **Reachable from both chat and alert feeds** (click a username/avatar). Title = `"User Info"`.
2. **Structure:** avatar (initial) + name + online/offline badge. Footer: **@Mention**, **Private Chat**, **Follow**, **Mute**, **Close**. Live panel = 440×239.
3. **FA5 glyphs:** `at \f1fa`, `comment \f075`, `user-plus \f234`, `bell-slash \f1f6` — all valid.
4. **Form-field id/name gaps:** none (no inputs).
5. **Runes/check issues:** None.
6. **Behaviour / dead controls:** **Only "Private Chat" is wired** (`openPrivateChat`, `:45`). **"@Mention", "Follow", "Mute" are dead** — buttons with `aria-label` but **no `onclick`** (`:37,:51,:54`). They do nothing.
7. **Capture evidence:** `"User Info"` text appears 47× in capture (it's the chat/roster username affordance label), corroborating the trigger exists. Body = EVIDENCE GAP.
8. **Screenshot:** `docs/forensics/shots/07-UserInfoModal.png`.
9. **Fixes:** [Dead controls] `:37` (@Mention), `:51` (Follow), `:54` (Mute) → add real handlers or remove. 3 of 4 footer actions are inert.

---

## 10. AllUserPmModal — `web/src/lib/components/modals/AllUserPmModal.svelte`

1. **Trigger & reachability:** `RoomSidebar.svelte:170` admin sub-item "All Private Messages" → `allPmOpen = true`; mounted `:250` **without a `threads` prop** (admin-gated). **Reachable, but always shows the empty state** ("No private messages.") because `threads` defaults to `[]`. Title = `"All private messages"`.
2. **Structure:** empty state (`envelope` icon) OR thread list (avatar + name + preview + time). Footer: **Close**. Live panel = 440×304 (with sample threads).
3. **FA5 glyphs:** `envelope \f0e0` — valid.
4. **Form-field id/name gaps:** none.
5. **Runes/check issues:** None.
6. **Behaviour:** Read-only list; **dead/empty in practice** (no `threads` supplied; rows aren't clickable even when present).
7. **Capture evidence:** EVIDENCE GAP (admin sub-menu). Body = EVIDENCE GAP.
8. **Screenshot:** `docs/forensics/shots/07-AllUserPmModal.png`.
9. **Fixes:** [Dead content] `RoomSidebar.svelte:250` → supply real `threads`; consider making rows open the PM thread.

---

## 11. MutedUsersModal — `web/src/lib/components/modals/MutedUsersModal.svelte`

1. **Trigger & reachability:** `RoomSidebar.svelte:145` "Manage Muted Users" → `mutedUsersOpen = true`; mounted `:244`. **Reachable.** Title = `"Muted / Ignored Users"`.
2. **Structure:** static empty state only (`volume-mute` icon + "You don't have any muted/ignored users."). Footer: **Close**. Live panel = 440×274.
3. **FA5 glyphs:** `volume-mute \f6a9` — valid.
4. **Form-field id/name gaps:** none.
5. **Runes/check issues:** None.
6. **Behaviour:** **Stub** — no props, no list, always empty. No way to view/unmute real muted users.
7. **Capture evidence:** Trigger label `"Manage Muted Users"` present in capture `controls[]` (and `"Muted"` 12×). Body = EVIDENCE GAP.
8. **Screenshot:** `docs/forensics/shots/07-MutedUsersModal.png`.
9. **Fixes:** [Stub] Add a `users` prop + unmute action; currently decorative.

---

## 12. FollowedUsersModal — `web/src/lib/components/modals/FollowedUsersModal.svelte`

1. **Trigger & reachability:** `RoomSidebar.svelte:156` "Manage Followed Users" → `followedUsersOpen = true`; mounted `:245`. **Reachable.** Title = `"Followed Users"`.
2. **Structure:** static empty state (`users` icon + "You don't have any followed users."). Footer: **Close**. Live panel = 440×274.
3. **FA5 glyphs:** `users \f0c0` — valid.
4. **Form-field id/name gaps:** none.
5. **Runes/check issues:** None.
6. **Behaviour:** **Stub** — identical pattern to MutedUsersModal; always empty.
7. **Capture evidence:** Trigger label `"Manage Followed Users"` present in capture `controls[]`. Body = EVIDENCE GAP.
8. **Screenshot:** `docs/forensics/shots/07-FollowedUsersModal.png`.
9. **Fixes:** [Stub] Add a `users` prop + unfollow action.

---

## 13. ChatLogsModal — `web/src/lib/components/modals/ChatLogsModal.svelte`

1. **Trigger & reachability:** `RoomSidebar.svelte:130` archives sub-item "Chat Logs" → `chatLogsOpen = true`; mounted `:243`. **Reachable.** Title = `"Chat Logs"`.
2. **Structure:** toolbar with **"Reload Log List"** button (always `disabled`, `sync` icon) + empty state (`comment-alt` icon + "No logs yet."). **No footer** (no `footer` snippet passed → Modal renders none; close only via header ✕/Esc/backdrop). Live panel = 440×249.
3. **FA5 glyphs:** `sync \f021`, `comment-alt \f27a` — valid.
4. **Form-field id/name gaps:** none.
5. **Runes/check issues:** None.
6. **Behaviour / dead controls:** **"Reload Log List" is hard-disabled** (`disabled` attribute, `:17`); the `logs` array is a hardcoded `[]` (`:12`, "No backend yet"). Entirely a stub.
7. **Capture evidence:** Trigger label `"Chat Logs"` present in capture `controls[]` (and `"Reload"` exists as a reference control). Body = EVIDENCE GAP.
8. **Screenshot:** `docs/forensics/shots/07-ChatLogsModal.png`.
9. **Fixes:** [Stub] Wire `logs` + enable Reload. [Consistency] Other modals have a footer Close button; this one only closes via header — consider matching for consistency.

---

## 14. ReplyModal — `web/src/lib/components/modals/ReplyModal.svelte`

1. **Trigger & reachability:** **DEAD / UNMOUNTED.** `grep -rn ReplyModal src/` returns **only the file itself — it is never imported or mounted anywhere.** It renders fine in isolation but is **unreachable in the running app.** Title = `"Reply"`.
2. **Structure:** `<textarea>` (sr-only label) + footer with emoji/image tool buttons + **Send** (disabled until non-empty). Live panel = 440×252.
3. **FA5 glyphs:** `smile \f118`, `image \f03e`, `paper-plane \f1d8` — all valid.
4. **Form-field id/name gaps:** textarea `:33` — **no `id`/`name`**, uses an `sr-only` `<span>` (not a `<label for>`); implicit label via wrapping `<label class="field">`. Add `id="reply-text" name="reply"`.
5. **Runes/check issues:** None.
6. **Behaviour / dead controls:** Whole modal unreachable. Within it, **emoji (`:38`) and image (`:41`) tool buttons have no `onclick`** — dead even if mounted. Send works via `onSend` (when provided).
7. **Capture evidence:** `"reply"` appears 10× / `"Reply"` 2× in capture text (the inline reply affordance exists in the reference) — but our component is **not the thing wired to it**. Body = EVIDENCE GAP.
8. **Screenshot:** `docs/forensics/shots/07-ReplyModal.png`.
9. **Fixes:** [Reachability] Either mount ReplyModal at a real reply trigger or delete it as dead code. [Dead controls] `:38`/`:41` emoji/image buttons. [Form hygiene] `:33` add id/name + real `<label for>`.

---

## 15. MobileAppInfoModal — `web/src/lib/components/modals/MobileAppInfoModal.svelte`

1. **Trigger & reachability:** Two mount sites: `RoomSidebar.svelte:239` (button `:61` "Mobile App Info" → `mobileAppOpen=true`) and `routes/rooms/[id]/+page.svelte:408` (`showMobileInfo`). **Reachable.** Title = `"Download our mobile apps"`.
2. **Structure:** lead text + two store badges (App Store / Google Play) as external `<a>` links (`target="_blank" rel="noopener noreferrer"`). **No footer** (close via header ✕/Esc/backdrop). Live panel = 440×185.
3. **FA5 glyphs:** `apple \f179` (brands), `google-play \f3ab` (brands) — both **valid brand glyphs**, rendered with `family="brands"` (verified in screenshot, white on black badges).
4. **Form-field id/name gaps:** none.
5. **Runes/check issues:** None. ESLint `no-navigation-without-resolve` suppressed on the two external links (correct — they're real external URLs).
6. **Behaviour:** Links go to the generic Apple App Store / Google Play homepages (placeholder destinations, not specific app pages). No dead controls.
7. **Capture evidence:** Trigger label `"Mobile App Info"` present in capture `controls[]` (and `"Mobile App"`/`"mobile app"` 15×). Body = EVIDENCE GAP.
8. **Screenshot:** `docs/forensics/shots/07-MobileAppInfoModal.png`.
9. **Fixes:** [Content] Point the two `href`s (`:19`, `:27`) at the real app listing URLs once known (currently generic store homepages).

---

# Consolidated fix list (prioritized; DO NOT implement — dossier only)

### A. Dead / unmounted components & controls (highest impact on "perfect match" behaviour)
1. **ReplyModal — entirely unmounted** (never imported). Mount it at a real reply trigger or delete. Its emoji/image buttons (`ReplyModal.svelte:38,:41`) are also handler-less.
2. **UserInfoModal — 3 of 4 footer actions dead:** @Mention (`:37`), Follow (`:51`), Mute (`:54`) have no `onclick`.
3. **PlayYouTubeModal — "Save" button dead** (`:48`, no persist/callback); **Play For All no-op** because `onPlay` unset at mount (`RoomSidebar.svelte:247`). Redundant with MediaForAllModal's stronger YouTube handling.
4. **SettingsModal — "Edit my Info and Avatar" (`:300`) and "Filter out alerts" (`:365`) dead** because `onEditProfile`/`onFilterAlerts` not passed at `RoomSidebar.svelte:246`.
5. **AVSettingsModal — Save & Change Devices no-ops** because `onSave`/`onChangeDevices` not passed at `RoomSidebar.svelte:241`.
6. **SessionControlModal — `onEndSession` unset** at `RoomSidebar.svelte:248`; "end session" semantics reduce to unlock only.

### B. Stub / always-empty modals (need backend wiring)
7. **DebugLogModal** — always empty; pass real `log` at `RoomSidebar.svelte:249`.
8. **AllUserPmModal** — always empty; pass real `threads` at `:250`; make rows open threads.
9. **MutedUsersModal / FollowedUsersModal** — pure empty-state stubs; add `users` props + (un)mute/(un)follow actions.
10. **ChatLogsModal** — hardcoded `[]`, "Reload Log List" hard-disabled (`:17`); wire backend.
11. **ConnectivityCheckModal** — **fake test** (`:35`, timer-driven, always "Passed"); wire real ICE probing.
12. **MobileAppInfoModal** — store links (`:19`,`:27`) point at generic store homepages, not the app listings.

### C. Form-field id/name hygiene (a11y is OK via implicit labels; gaps are for serialization/autofill/testability)
13. **SettingsModal (the big one)** — ~27 checkboxes (`:203,258,262,266,270,274,285,295,334,338,342,346,350,361,393,404,408,412,416,427,437,448,452`) + 4 color inputs (`:219` each) lack `id`+`name`. Radios already have `name` (fine); range slider already has `id`+label (fine).
14. **AVSettingsModal** — disableVideo checkbox `:160` (selects already have `id`).
15. **MediaForAllModal** — URL input `:139`.
16. **PlayYouTubeModal** — URL input `:60`.
17. **ReplyModal** — textarea `:33` (also wants a real `<label for>` instead of sr-only span).

### D. No issues found (clean)
- **RichTextEditorModal** — wired, DOMPurify-sanitised, attachments correct, no field gaps. (Only future note: `execCommand` deprecation.)
- **Shared Modal.svelte** — focus trap/restore, Esc/backdrop close, ARIA all correct.

### FA5 glyph validity — ALL 48 glyphs used across these 15 modals (+ shared wrapper + sidebar triggers) validate against FA5 Free 5.8.1 `all.min.css`. **Zero broken/missing glyphs.** Brand glyphs (`youtube`, `apple`, `google-play`) correctly use `family="brands"`.

### Check status: `pnpm --prefix web run check` = **0/0** (verified before and after; scratch route `_forensic_b` and scratch script removed).
