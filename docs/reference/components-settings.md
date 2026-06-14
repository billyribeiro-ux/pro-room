# Settings Components Reference (Simpler Trading → pro-room)

Extracted from Angular 17 rendered snapshots. Angular cruft
(`_nghost*`, `_ngcontent*`, `ng-star-inserted`, `ng-reflect-*`, empty
`<!---->`) stripped. Real tags / `id` / `class` / `role` / `aria` kept.

Source files:

- `file9.html` → `app-user-settings-modal` ("General Settings")
- `file10.html` → `app-av-settings-modal` ("Audio/Video Settings")
- `file5.html` → main nav `<nav class="mainAppNav">` **Volume dropdown**
  (room sound options), NOT a standalone settings modal.

---

## 1. `app-user-settings-modal` ("General Settings")

Bootstrap modal, 3 tabs. **No current pro-room equivalent → build NEW
`SettingsModal.svelte`.**

### Markup tree

```
#user-settings-modal .modal.fade [role=dialog, aria-labelledby=user-settings-modal]
  .modal-dialog [role=document]
    .modal-content
      .modal-header
        h5 "General Settings"
        button.btn-close.btn-close-white [data-bs-dismiss=modal, aria-label=Close]
      .modal-body
        ul#userSettingsTab.nav.nav-tabs [role=tablist]
          li.nav-item > a#user-app-settings-tab    [href=#user-app-settings,   active] "App Settings"
          li.nav-item > a#user-alert-settings-tab  [href=#user-alert-settings]       "Alert Settings"
          li.nav-item > a#user-chat-settings-tab    [href=#user-chat-settings]        "Chat Settings"
        #userSettingsTabContent.tab-content
          #user-app-settings    [role=tabpanel, active]   ... (see below)
          #user-alert-settings  [role=tabpanel]
          #user-chat-settings   [role=tabpanel]
      .modal-footer.text-center
        button.btn.btn-secondary [data-bs-dismiss=modal] "Close"
```

### Tab "App Settings" (`#user-app-settings`)

Each section is a `.p-2.themes` / `.p-2.text-mode-box` block with a
title row (`<i class="fas ...">` + label span) and indented `.ml-5`
controls.

**Color Theme** (`#colorTheme`, fa-palette) — radio group `name="app-color-theme"`:

| id                | value         | label       |
|-------------------|---------------|-------------|
| `app-light-theme` | `Light Theme` | Light Theme |
| `app-dark-theme`  | `Dark Theme`  | Dark Theme  |

**Room Layout** (`#roomLayout`, fa-columns) — radio group `name="roomLayoutOptions"`:

| id                  | value               | label                  |
|---------------------|---------------------|------------------------|
| `chat-alerts-left`  | `chat-alerts-left`  | Chat and Alerts left   |
| `chat-alerts-top`   | `chat-alerts-top`   | Chat and Alerts top    |
| `chat-alerts-right` | `chat-alerts-right` | Chat and Alerts right  |
| `chat-alerts-bottom`| `chat-alerts-bottom`| Chat and Alerts bottom |

`<hr>` then checkbox `#pm-window-layout` (`name="pm-window-layout"`) → "PM logs on the right".

**Colors & Size** (`#chatColorMode`, fa-wrench) — appearance controls. Each
`<input>` carries `name`/`id`; `value` is the Angular binding expr
(the appearance token it maps to). Block has its own **Reset** +
**Save changes** buttons (`.btn-outline-danger` / `.btn-outline-light`).

| control id            | type     | label            | appearance token (binding) |
|-----------------------|----------|------------------|----------------------------|
| `chat-text-color`     | `color`  | Text Color       | `chatStyle.color`          |
| `chat-username-color` | `color`  | Username Color   | `chatStyle.usernameColor`  |
| `chat-bg-color`       | `color`  | Background Color | `chatStyle.bgColor`        |
| `chat-ticker-color`   | `color`  | Ticker Color     | `chatStyle.tickerColor`    |
| `chat-text-size`      | `number` | Text Size        | `chatStyle.fontSize`       |

> NOTE: in this snapshot only the **chat** appearance set is rendered
> (ticker/username/text/bg/size). The alert and presenter color/size
> sets the prompt references are NOT present in file9 — only chat-style
> tokens exist here. (Alert appearance lives behind "Compact/Regular"
> text modes + the alert-filter modal; presenter styling is not in
> this snapshot.)

**Do not disturb / sounds** (`#appDoNotDisturb`, fa-bell-slash) — checkboxes:

| id                           | label                |
|------------------------------|----------------------|
| `app-donot-disturb`          | Don't Disturb        |
| `app-recording-start-sound`  | Start recording sound (on) |
| `app-recording-stop-sound`   | Stop recording sound (on)  |
| `app-reactions-popup`        | Reactions Response (on)    |
| `app-reactions-popup-qa`     | Reactions QA Response (on) |

**Video** (`#appDisableVideo`, fa-desktop) — checkbox `app-disable-video` "Video Enabled".
**Closed Captions** (`#appSpeechRecoOverlay`, fa-closed-captioning) — checkbox `app-speech-reco-overlay` "Enabled".
Footer of tab: `button.btn-warning` "Edit my Info and Avatar" (fa-user-tie).

### Tab "Alert Settings" (`#user-alert-settings`)

**Text Mode** (`#alertTextMode`, fa-file-alt) — radio `name="alert-text-mode"`:
`alert-regular-mode` (Regular Mode) / `alert-compact-mode` (Compact Mode).

**Do not disturb** (`#alertDoNotDisturb`, fa-bell-slash) — checkboxes:

| id                          | label                  |
|-----------------------------|------------------------|
| `alert-popup-donot-disturb` | Alert / QA Popup (on)  |
| `alert-donot-disturb`       | Alert sound (on)       |
| `qa-donot-disturb`          | QA sound (on)          |
| `app-reactions-sound-qa`    | QA Reactions Sound (on)|
| `non-trade-alert`           | Non-trade alert sound (on) |

**Alert popup** (`#alertPopup`, fa-bell) — checkbox `longer-alert-popup`
"Longer alert popup (off)" + `button.btn-primary` "Filter out alerts"
(fa-filter, `data-bs-target="#alert-filter-modal"` → our `AlertFilterModal.svelte`).

### Tab "Chat Settings" (`#user-chat-settings`)

**Text Mode** (`#chatTextMode`, fa-file-alt) — radio `name="chat-text-mode"`:
`chat-regular-mode` (Regular, default `aria-checked=true`) / `chat-compact-mode` (Compact).

**Image Preview** (`#chatImagePreview`, fa-image) — checkbox `small-image-preview` "Smaller image preview (on)".

**Do not disturb** (`#chatDoNotDisturb`, fa-bell-slash) — checkboxes:

| id                          | label                |
|-----------------------------|----------------------|
| `chat-gif-donot-disturb`    | Gif (on)             |
| `chat-badges-donot-disturb` | Badges (on)          |
| `chat-popup-donot-disturb`  | Chat / PM Popup (off)|
| `chat-donot-disturb`        | Chat sound (on)      |

**Extra chat column** (`#extraChatColumn`, fa-comment) — checkbox `extra-chat-column` "Chat column (off)".
**Always Scroll To Bottom** (`#alwaysScrollToBottom`, fa-scroll) — checkbox `chat-always-scroll` "Always scroll to bottom (off)".
**Reduce Chatlog Memory** (`#trimChatlogFat`, fa-trash) — checkboxes
`chat-mem-clear` "Reduce Chatlog Memory (on)" + `visibility-change-enabled` "Tab sleep optimization (on)".

---

## 2. `app-av-settings-modal` ("Audio/Video Settings")

Bootstrap modal. One visible tab `User Settings`; a second hidden
panel (`#presenter-audio-video-settings`) holds presenter device
inputs. Maps to existing `AVSettingsModal.svelte`.

### Markup tree

```
#av-settings-modal .modal.fade [role=dialog]
  .modal-dialog > .modal-content
    .modal-header > h5 "Audio/Video Settings" + button.btn-close
    .modal-body
      ul#userSettingsTab.nav.nav-tabs > li > a#user-audio-video-settings-tab "User Settings"
      #userSettingsTabContent.tab-content
        #user-audio-video-settings [role=tabpanel, active]
          nav.navbar > ul.navbar-nav
            li.nav-item > a [title=Disable Video]  i.fa-desktop  "Disable Video (saves bandwidth)"
            li.nav-item > a [title=Choose Speakers]
              .form-group
                .w-75 > label[for=speakers-device] "Speakers:" + select#speakers-device.form-control
                       options: "Default - External Headphones", "... Headphones 2"
                .w-25 > button.btn-outline-light  i.fa-volume-up  "Test"
        #presenter-audio-video-settings [role=tabpanel] (hidden)
          .form-group > label[for=audio-deviceList] "Audio device (input):" + select#audio-deviceList.form-select
          .form-group > label[for=video-deviceList] "Video device (input):" + select#video-deviceList.form-select
          button.btn-primary "Change Devices"
    .modal-footer.text-center
      button.btn-success [type=submit] "Save"
      button.btn-secondary [data-bs-dismiss=modal] "Close"
```

### Fields

| field             | control                        | notes                         |
|-------------------|--------------------------------|-------------------------------|
| Disable Video     | nav link toggle (`title=Disable Video`) | "(saves bandwidth)" |
| Speakers (output) | `select#speakers-device`       | + **Test** button (fa-volume-up) |
| Audio input (mic) | `select#audio-deviceList`      | presenter panel, `aria-label` set |
| Video input (cam) | `select#video-deviceList`      | presenter panel, `aria-label` set |
| —                 | button "Change Devices"        | presenter panel               |
| Footer            | Save (btn-success), Close      |                               |

### Divergences from current `web/.../modals/AVSettingsModal.svelte`

- **Speaker Test button**: source has a per-speaker **Test** (fa-volume-up)
  inline; ours has a single footer "Test" that is a no-op placeholder.
- **Two-panel split**: source separates a *User* tab (speakers + disable
  video) from a hidden *Presenter* tab (mic + camera + "Change Devices").
  Ours flattens speakers/mic/camera into one body — acceptable, but the
  presenter "Change Devices" apply step is missing.
- **Footer**: source = **Save** (btn-success) + **Close**; ours = **Test**
  + **Done**. No explicit Save in ours (it relies on live binds).
- Ours adds runtime `enumerateDevices()` population + empty-state
  fallbacks (source selects are statically/server-populated). Keep ours.

---

## 3. file5 — what it actually is

`file5.html` is **not** a settings modal. It is the rendered main top
navbar `<nav class="navbar ... mainAppNav">` — specifically the
**Volume dropdown** (`#dropdownVolume` → `.dropdown-menu.volumeControl`)
plus surrounding nav items (sidebar toggle, users-connected, mobile-app
button, brand logo, talking indicator, Reload). Maps to pro-room
`Nav.svelte` / `RoomTopNav.svelte` + a volume popover.

The dropdown contains a `<input type=range>` volume slider (0–100,
`audiovolslider`), a **Mute** button, `<hr>`, and a
`.room-sound-options` block of sound toggles (these duplicate the
user-settings sound toggles, surfaced quickly from the navbar):

| id                       | label              |
|--------------------------|--------------------|
| `alert-donot-disturb`    | Alert sound (on)   |
| `qa-donot-disturb`       | QA sound (on)      |
| `non-trade-donot-disturb`| NTA sound (on)     |
| `chat-donot-disturb`     | Chat sound (on)    |
| `presentation-subtitles` | Subtitles (on, fa-closed-captioning) |
| `app-donot-disturb`      | Don't Disturb      |

---

## pro-room mapping summary

| Source                     | pro-room target                                  |
|----------------------------|--------------------------------------------------|
| `app-user-settings-modal`  | **NEW** `SettingsModal.svelte` (App/Alert/Chat tabs) — no equivalent yet |
| `app-av-settings-modal`    | existing `modals/AVSettingsModal.svelte` (note divergences above) |
| file5 (Volume dropdown)    | `Nav.svelte` / `RoomTopNav.svelte` volume popover + room sound toggles |
