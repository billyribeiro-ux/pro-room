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
| **Filter out alerts** | `app-alert-filter-modal` | — `AlertFilterModal` is a **stub** (no filter logic). Wiring would open an empty modal. | ⛔ |
| **Edit my Info & Avatar** | profile editor | — no self-profile editor exists in our app (its own feature). | ⛔ |
| **Longer alert popup** | `longerAlertPopup` (10s vs 5s toast) | — our app has **no alert-popup/toast** mechanism to lengthen. Pref is stored, inert. | ⛔ |

## Summary
**13 of 16** General Settings surfaces are wired to a real consumer and
live-verified (persist to `ptr.pref.*`, observable effect). The **3 blocked** are
not toggle-wiring gaps — they require building a feature that doesn't exist yet
(an alert-filter engine, a profile editor, an alert-popup system). Each is flagged
in the modal/code rather than faked, per the evidence bar.
