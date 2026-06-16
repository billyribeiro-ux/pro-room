# Hamburger Menu — End-to-End Audit (hard evidence)

Every sidebar (hamburger) function, audited by **code-path trace** (frontend handler → API → Rust backend route) **and confirmed by live browser test** (clicked each, captured the modal + its content/actions). 2026-06-16.

Legend: ✅ works end-to-end · 🟡 partial (opens + some real behavior, but key action not wired) · 🔴 stub (opens but no real data/action / no backend) · ⛔ disabled.

| # | Item | Status | Hard evidence |
|---|---|---|---|
| 1 | **Mobile App Info** | ✅ | Static info modal (store links) — correct, nothing to wire. Live: opens "Download our mobile apps". |
| 2 | **Connectivity Check** | 🔴 | `startTest()` just animates every row pending→**pass** on a 450ms timer — **no real WebRTC/STUN/TURN probing**; can never report a failure. (Copy Results works.) Live: opens, "Start Test" always passes. |
| 3 | **Audio/Video Settings** | 🟡 | Real device enumeration + speaker test-tone work. But **Save** and **Change Devices** call optional `onSave`/`onChangeDevices` callbacks that `RoomSidebar` never passes → device/disable-video choices are **discarded, never applied to the live call** (no `replaceTrack`). Live: opens, devices/test work, Save just closes. |
| 4 | **General Settings** | 🟡 | Theme (light/dark + colors + font), room layout, and DND/sound mutes **work** (localStorage + live apply). But many toggles are dead `$state` with **no consumer**: Video Enabled, Closed Captions, alert/chat text mode, smaller image preview, longer popup, extra column, scroll-to-bottom, reduce-memory, tab-sleep, and several "sound on" rows. "Edit my Info/Avatar" + "Filter alerts" not wired. Live: 19 inputs, tabs work. |
| 5 | **Archives → Alert Logs** | ✅ **DONE** | Implemented (commit 0ef41d9): fetches `GET /api/rooms/{id}/alerts` on open + Reload, lists author + time + content. Live: loaded 27 real alerts. |
| 6 | **Archives → Chat Logs** | ✅ **DONE** | Implemented (commit 0ef41d9): channel selector + `GET /messages?channel=..`, lists author + time + body. Live: loaded seeded messages per channel. |
| 7 | **Archives → Transcript History** | ⛔ | Button `disabled` in source. |
| 8 | **Manage Muted Users** | ✅ **DONE** | Implemented client-side (commit e702a8b) — matches the original (no backend): Mute toggles a localStorage list from the User Info modal, muted users' chat is filtered, the modal lists them + Unmute. Live E2E verified. |
| 9 | **Manage Followed Users** | ✅ **DONE** | Implemented client-side (commit e702a8b) — Follow toggles a localStorage list; modal lists followed users + Unfollow. Live E2E verified. |
| 10 | **Admin → All Private Messages** | 🔴 | Always "No private messages"; **no PM fetch, no PM backend** (only room chat messages exist). Live: only Close. |
| 11 | **Admin → Play YouTube Video** | 🔴 | URL input validates, but **Save/Play For All are no-ops** (`onPlay`/`onSave` not wired) and there's **no YouTube broadcast backend**. Live: opens, buttons inert. |
| 12 | **Admin → Session Control** | ✅ | All 5 actions hit real, routed backend endpoints: **Lock/Unlock** (`POST /admin/lock`), **Lock screen** (`/admin/lock-screen`), **Mute all** (`/admin/mute-all`), **Clear chat** (`/admin/clear-chat`), **Kick duplicates** (`/admin/kick-duplicates`). Live: 6 action buttons present + wired. (Caveat: "Lock session & **kick users**" label is misleading — lock doesn't kick existing members; mute/lock-screen state is ephemeral by design.) |
| 13 | **Admin → Debug Log** | 🔴 | `log` prop never passed → always placeholder; **nothing captures a session log**; Copy permanently disabled. Live: opens, empty, Copy disabled. |
| 14–17 | **Roster: Search / Sort / Reload / User options** | ⛔ | All four `disabled` in source. |

## Verdict
**3 work end-to-end** (Mobile App Info, Session Control, the theme/layout/DND parts of General Settings). **2 are partial** (Audio/Video Settings, the rest of General Settings). **8 are stubs / disabled** (Connectivity Check, Alert Logs, Chat Logs, Transcript History, Muted Users, Followed Users, All PMs, Play YouTube, Debug Log, + 4 roster controls).

Each stub is a **feature build** (most need a new backend: alert/chat archives, per-user mute, follows, private messages, YouTube-for-all broadcast, debug-log capture; plus wiring AV-settings into the LiveKit pipeline and a real WebRTC connectivity probe). They are NOT one-line fixes.
