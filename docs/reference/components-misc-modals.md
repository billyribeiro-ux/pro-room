# Misc modals — Simpler Trading DOM reference

Extracted from Angular 17 rendered snapshots (`files/file7,8,11,16,17,14.html`),
Angular cruft stripped (`_nghost*`, `_ngcontent*`, `ng-star-inserted`,
`ng-reflect-*`, empty `<!---->`). All use Bootstrap modal shell:
`.modal.fade > .modal-dialog > .modal-content > {.modal-header, .modal-body, .modal-footer}`.

---

## 1. `app-user-info-modal` (file7) → `UserInfoModal.svelte`

### Markup tree
```
.modal#user-modal [role=dialog, aria-labelledby=user-details]
  .modal-dialog[role=document]
    .modal-content
      .modal-header
        .edit-user-avatar > img (gravatar, src=.../avatar/undefined?d=mm&s=80)
        h3.modal-title > span.badge.badge-danger "Offline"   (status badge only — name lives elsewhere/empty in snapshot)
        button.btn-close.btn-close-white [data-bs-dismiss=modal, aria-label=Close]
      .modal-body.py-0   (empty in snapshot)
      .modal-footer.text-center
        button.btn.btn-outline-light  "@Mention"
        button.btn.btn-outline-light  "Private Chat"
        button.btn.btn-outline-info   > span "Follow"
        button.btn.btn-outline-warning> span "Mute"
        button.btn.btn-primary        "Close"
```

### Fields & controls
- Avatar `<img>` (gravatar). Status badge (`badge-danger` Offline / would be online variant).
- Footer actions: **@Mention**, **Private Chat**, **Follow**, **Mute**, **Close**.

### Divergence from our `UserInfoModal.svelte`
- We render an **initial-letter avatar div**; source uses a gravatar `<img>`.
- We show the **display name** in body (source `modal-title` only carries the badge — name was empty/data-driven).
- Footer order/labels **match** (all 4 actions + Close present). Source uses semantic Bootstrap color classes per action (info=Follow, warning=Mute); ours are uniform `.action` buttons. Close is `btn-primary`. Source Follow/Mute wrap text in `<span>` (toggle target). No functional gaps — our version is faithful.

---

## 2. `app-play-youtube-modal` (file8) → **NEW** (no pro-room equivalent)

### Markup tree
```
.modal#play-youtube-modal [role=dialog]
  .modal-dialog > .modal-content
    .modal-header
      h5 "Play YouTube For All"
      button.btn-close.btn-close-white [Close]
    .modal-body
      .input-group.mb-3
        input.form-control [type=text, placeholder="Paste YouTube URL", aria-label="Paste YouTube URL", aria-describedby=basic-addonYT]
        span#basic-addonSave.input-group-text.btn "Save"
        span#basic-addonPlay.input-group-text.btn "Play For All"
    .modal-footer.text-center
      button.btn.btn-secondary [data-bs-dismiss] "Close"
```

### Fields & controls
- Single text input for YouTube URL + two inline addon-buttons: **Save**, **Play For All**. Footer **Close**.
- Admin/host broadcast tool (pushes a YT video to all room members).

---

## 3. `app-debug-log-modal` (file11) → **NEW**

### Markup tree
```
.modal#debug-log-modal [role=dialog, aria-labelledby=user-details]
  .modal-dialog.modal-lg [style: overflow-y: initial !important]
    .modal-content
      .modal-header
        h3.modal-title "Debug Log"
        button.btn-close.btn-close-white [Close]
      .modal-body [style: max-height:77vh; overflow-y:scroll]
        .row
          textarea#debugLogModalTxt.form-control [rows=1000, readonly, style: min-width:100%]
    .modal-footer            (sibling of .modal-content — note: outside it in source)
      button.btn.btn-secondary [data-bs-dismiss] "Close"
```

### Fields & controls
- One large read-only `<textarea>` dump of client debug log. Footer **Close**. `modal-lg` size.

---

## 4. `app-session-control-modal` (file16) → **NEW**

### Markup tree
```
.modal#session-control-modal [role=dialog, aria-labelledby=session-control]
  .modal-dialog.modal-lg > .modal-content
    .modal-header
      h5.modal-title#session-control "Session Control"
      button.btn-close.btn-close-white [Close]
    .modal-body   (empty in snapshot — content data-driven)
    .modal-footer
      button.btn.btn-success.btn-block "Done"
```

### Fields & controls
- Body empty in snapshot (dynamic session controls). Single footer **Done** (`btn-success btn-block`). `modal-lg`. Admin/host session-management tool.

---

## 5. `app-mobile-app-info-modal` (file17) → `MobileAppInfoModal.svelte`

### Markup tree
```
.modal#mobileAppInfoModal [aria-labelledby=mobileAppInfoLabel]
  .modal-dialog > .modal-content
    .modal-header
      h5.modal-title#mobileAppInfoLabel "Download our mobile apps"
      button.btn-close.btn-close-white [Close]
    .modal-body
      .d-flex.align-items-center.justify-content-evenly.m-3.mb-4
        a[target=_blank, href=play.google.com/.../com.bellesoft.stprotradingroom] > img.google-badge (/assets/images/google-play-badge.png)
        a[target=_blank, href=apps.apple.com/.../id1278652736] > img (/assets/images/iosAppStore.svg)
    .modal-footer
      button.btn.btn-secondary [data-bs-dismiss] "Close"
```

### Fields & controls
- Two store-badge links (Google Play + App Store) side-by-side. Footer **Close**.

### Divergence from our `MobileAppInfoModal.svelte`
- Title differs: source **"Download our mobile apps"** vs ours **"Mobile App Info"**.
- Source uses **store-badge images** laid out horizontally; ours uses **text links stacked vertically** + a device icon + intro paragraph (source has no intro copy).
- Source hrefs are the **real app listings** (`com.bellesoft.stprotradingroom`, `id1278652736`); ours point to generic store homepages. Source has no footer Close in markup-body but does in footer; ours has none (relies on Modal X). Recommend updating title, badge images, and real hrefs.

---

## 6. `app-chat-logs-modal` (file14, shell only) → `ChatLogsModal.svelte`

### Markup tree (header/controls — log rows omitted)
```
.modal#chat-logs-modal [role=dialog, aria-labelledby=chat-logs-modal]
  .modal-dialog > .modal-content
    .modal-header
      h5 "Chat Logs"
      button.btn-close.btn-close-white [Close]
    .modal-body
      div
        button.btn.btn-primary.my-2 "Reload Log List"
        .list-group
          .list-group-item.list-group-item-action   (repeated; 59k lines of these)
            div > strong.fw-bold "<Date>"  e.g. "Jun 12, 2026"
            div > strong.fw-bold "By:&nbsp;" + i "<email>"  e.g. admin@protradingroom.com
            div > strong.fw-bold "Channel:&nbsp;" + i "<channel>"  e.g. offTopic | main
```

### Fields & controls
- **Reload Log List** button (active in source). Scrollable `.list-group` of log entries; each row = **Date**, **By: <email>**, **Channel: <main|offTopic>**.

### Divergence from our `ChatLogsModal.svelte`
- Our **Reload** button is `disabled` (no backend); source's is **active**.
- Our row model is `{date, by, channel}` rendered inline in one `.entry` line — source stacks the three as separate `div`s with bold labels (`By:`, `Channel:`). Field set matches.
- We render an **empty state**; source always has rows. When backend lands, match the date/by/channel row layout and enable Reload.

---

## NEW modals to build (no pro-room equivalent)
- **`PlayYouTubeModal.svelte`** — URL input + Save / Play For All (admin broadcast).
- **`DebugLogModal.svelte`** — read-only textarea log dump (`modal-lg`).
- **`SessionControlModal.svelte`** — admin session controls, single Done button (`modal-lg`).
