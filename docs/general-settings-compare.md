# General Settings — side-by-side vs the reference

Every General Settings toggle, compared against protradingroom's reference (bundle
`main.*.js`) and our implementation. The reference model is uniform: each toggle
calls `setPreference(key, value)` → writes `globals.preferences[key]`,
`savePreferences()` persists to localStorage, emits a local event — **no server
round-trip**. We mirror that with `web/src/lib/stores/prefs.svelte.ts`
(`ptr.pref.<key>`), the same idiom as `dnd.svelte.ts` / `layout.svelte.ts`.

Legend: ✅ wired + live-verified · ⛔ blocked on an un-built feature (honest gap).

| Toggle | Reference (`preferences.*`) | Our consumer | Status |
|---|---|---|---|
| **Theme / colors / font** | theme tokens | `theme.svelte.ts` (pre-existing) | ✅ |
| **Room layout / PM-logs-right** | layout prefs | `layout.svelte.ts` (pre-existing) | ✅ |
| **DND sound/popup mutes** | per-channel | `dnd.svelte.ts` → `sound.svelte.ts` (pre-existing) | ✅ |
| **Video Enabled** | `disableVideo` (inverse) | `WebcamHolder` → "Video off to preserve data…" placeholder, skips track attach | ✅ |
| **Closed Captions Overlay** | `showSpeechRecoOverlay` | `prefs.captionsOverlay`, shared with the sidebar CC button + `MainStage`/`CaptionsOverlay`. Default forced OFF (ours starts local mic speech-reco; ON-by-default would auto-request the mic) | ✅ |
| **Alert / Chat Compact Mode** | `switchAlertMode`/`switchChatMode` 'r'/'c' | `.compact` class on `AlertFeed`/`ChatPanel` → denser rows | ✅ |
| **Smaller image preview** | `smallImagePreview` | `AlertFeed .alert-img` capped 300→120px (chat `image_url` is the avatar, so alerts are the real inline-image surface) | ✅ |
| **Always scroll to bottom** | `alwaysScrollToBottom` | `ChatPanel` `$effect.pre` overrides the near-bottom guard | ✅ |
| **Reduce chatlog memory** | `trimChatLogs` (shift past `trimLogSize`) | `ChatPanel` caps rendered rows to last 300 | ✅ |
| **Start/Stop recording sound** | `recordingStartSound`/`recordingStopSound` | `playSound` PREF gate + `RecPreview` start()/stop() triggers | ✅ |
| **Reactions Response / QA** | `reactionsPopup`/`reactionsPopupQA` | `playSound('reaction')` gated by `reactionsResponse`, fired from `onReact` | ✅ |
| **Tab sleep optimization** | `visibilityChangeEnabled` | `visibility.svelte.ts` `shouldThrottle()` → `ChatPanel`/`AlertFeed` skip autoscroll while hidden | ✅ |
| **Extra chat column** | `extraChatColumn` (2nd `offTopic` getChatLog) | `AlertsChatDock` renders a 2nd `ChatPanel` locked to off-topic; `+page` feeds `offTopicMessages` + off-topic post | ✅ |
| **Filter out alerts** | `app-alert-filter-modal` (`alertFilterFor` + `showAlertsFrom`) | `alertFilter.svelte.ts` store + rewritten `AlertFilterModal` (trader checklist, allow/block-list) → `AlertFeed` derived `visibleAlerts`. Live: block Dev Admin → 37→1; allow-list → 1→36 | ✅ |
| **Edit my Info & Avatar** | `editUsername`/`emailHash` | `EditProfileModal` (name + gravatar via SHA-256) + backend `PATCH /api/auth/me`. Live: Save → name updated app-wide + toast | ✅ |
| **Longer alert popup** | `toastr.warning(…,{timeOut: longerAlertPopup?1e4:5e3})` | `toast.svelte.ts` + `ToastContainer` → `+page` case `'alert'` fires a top-right toast (10s/5s), `alertPopup`-gated, preventDuplicates. Live: alert → toast; 2 identical → 1 | ✅ |

## Summary
**16 of 16** General Settings surfaces are now wired to a real consumer and
live-verified. The three that were previously deferred (alert-filter engine,
profile editor, alert-popup system) were each built as its own feature from the
mined reference evidence — see commits `3285fb4` (popup), `3d2b404` (filter),
`081318e` (edit-info). Nothing is faked.
