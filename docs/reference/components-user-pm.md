# User / Messaging Components — Simpler Trading reference (Angular 17 snapshots)

Source captures under `files/`. Angular cruft (`_nghost*`, `_ngcontent*`,
`ng-star-inserted`, `ng-reflect-*`, empty `<!---->`) stripped below. These six
components cover replies, alert Q&A, all-user PM list, the private-chat panel,
and the muted/followed user modals.

All modals use Bootstrap 5 modal chrome: `.modal.fade > .modal-dialog >
.modal-content > {.modal-header, .modal-body, .modal-footer}`, with a
`btn-close btn-close-white` dismiss button. The composer pattern (textarea +
emoji + image buttons) is shared between Reply and Alert-QA.

---

## 1. `app-reply-modal` (file18.html) → `ReplyModal.svelte`

Private-reply composer popped from a chat/alert row.

### Markup tree

```
div#replyModal.modal.fade [aria-labelledby=replyLabel, aria-hidden]
└─ .modal-dialog > .modal-content
   ├─ .modal-header
   │  ├─ h5#replyLabel.modal-title
   │  │  └─ span.do-private-reply  →  "<strong>:</strong> <div></div>"   (dynamic target name)
   │  └─ button.btn-close.btn-close-white [data-bs-dismiss=modal, aria-label=Close]
   ├─ .modal-body
   │  └─ .flex-fill.d-flex.mx-0                                (textSendDiv composer row)
   │     ├─ .px-0.flex-fill
   │     │  └─ textarea#textAreaReplyTxt.txt-area.form-control.border-0
   │     │       [name=txt-area, rows=1, spellcheck, placeholder="Type your message here.."]
   │     └─ .textAreaBtnsCol  (flex, centered)
   │        ├─ span.textAreaBtns > i.far.fa-smile   [ngbTooltip="Add Emojis", popover]
   │        └─ span.textAreaBtns > i.fas.fa-image   [ngbTooltip="Upload an Image"]
   └─ .modal-footer
      └─ button.btn.btn-secondary [data-bs-dismiss=modal]  "Close"
```

### Fields / controls
- **Title**: `do-private-reply` — renders `<targetName>:` (the `<strong>:` + dynamic `<div>`).
- **textarea** `#textAreaReplyTxt`, auto-grow (`rows=1`), placeholder "Type your message here..".
- **Emoji** popover trigger (`fa-smile`), **Image** upload trigger (`fa-image`).
- Footer has **Close** only — there is **no explicit Send button**; submit is Enter-on-textarea.

### Map to pro-room (`modals/ReplyModal.svelte` — currently ORPHANED)
- Already has textarea + emoji/image tool buttons via `Modal.svelte` + phosphor (`SmileyIcon`,`ImageIcon`,`PaperPlaneTiltIcon`).
- **Divergences**: our version (a) adds an explicit **Send** primary button (ST relies on Enter — keep our button, it's better UX); (b) static title `"Reply"` vs ST's dynamic `"<name>:"` — add a `target?: string` prop to render `{target}:`; (c) emoji/image buttons are inert placeholders.
- **Wiring (TODO)**: not referenced anywhere. Should be opened from a chat/alert message row's "reply privately" action, passing the target user + an `onSend(text)` that POSTs a private message. Wire alongside the new PrivateChat panel (a reply opens/targets a PM thread).

---

## 2. `app-alert-qa-modal` (file19.html) → `AlertQaModal.svelte`

Q&A thread attached to a specific admin alert. Header embeds the **source
alert**; body lists questions; footer is the **ask** composer.

### Markup tree

```
div#alertQAModal.modal.fade [data-keyboard=false, data-backdrop=static]
└─ .modal-dialog > .modal-content
   ├─ .modal-header.align-items-start
   │  ├─ .flex-fill
   │  │  ├─ h5#alertQALabel.modal-title  "Q&A for Alert:"
   │  │  └─ .admin-alert.mt-2                        ← EMBEDDED SOURCE-ALERT HEADER
   │  │     └─ .d-flex.flex-row-reverse
   │  │        ├─ .avatar.pl-1 > img[src=gravatar]
   │  │        └─ .w-100
   │  │           ├─ .d-flex.justify-content-between
   │  │           │  ├─ span.created-at.mr-2          (timestamp)
   │  │           │  └─ strong.username.mx-1          (author)
   │  │           └─ .msg-left.text-formated.preText  (alert body text)
   │  └─ button.btn-close.btn-close-white
   ├─ .modal-body
   │  └─ .my-2  "There are no questions."            ← EMPTY STATE (else: question list)
   └─ .modal-footer.flex-nowrap
      └─ #textAreaHolder.textSendDiv.flex-fill        ← ASK COMPOSER (same shape as reply)
         └─ .flex-fill.d-flex.mx-0
            ├─ textarea#textAreaQATxt [placeholder="Type your question here..."]
            └─ .textAreaBtnsCol
               ├─ span.textAreaBtns > i.far.fa-smile  (Add Emojis)
               └─ span.textAreaBtns > i.fas.fa-image  (Upload an Image)
```

### Fields / controls
- **Source-alert header**: avatar, `created-at`, `username`, body (`msg-left preText`).
- **Questions list** (empty here): "There are no questions." otherwise question rows.
- **Composer**: textarea `#textAreaQATxt` + emoji + image. Modal is **non-dismissible by backdrop/ESC** (`data-backdrop=static`, `data-keyboard=false`).

### Map to pro-room (`AlertQaModal.svelte` — already WIRED in `AlertFeed.svelte`)
- Ours is **richer**: real `listQuestions`/`postQuestion`/`resolveQuestion` API, loading/error states, admin-gated answer/resolve composer, valibot validation, `parseMessage`/`formatStamp`.
- **Divergences vs ST**: ST has no answer/resolve UI in this capture (one-way ask only) — ours adds answering. ST's emoji/image composer buttons → ours uses `PaperPlaneTiltIcon` send; emoji/image not present. ST title is fixed `"Q&A for Alert:"`. ST embeds source alert in the **header**; confirm ours renders the source-alert header block (avatar+author+stamp+body) the same way. Consider `data-backdrop=static` equivalent (don't close on backdrop while composing).

---

## 3. `app-all-user-pmmodal` (file27.html) → **NEW** `AllUserPmModal.svelte`

Modal listing **all** of the current user's private-message threads. Capture
shows only the loading state.

### Markup tree

```
div#all-user-pm-modal.modal.fade [role=dialog]
└─ .modal-dialog[role=document] > .modal-content
   ├─ .modal-header
   │  ├─ h5  "All private messages:"
   │  └─ button.btn-close.btn-close-white
   ├─ .modal-body
   │  ├─ .text-center.my-4 > h5 > i.fas.fa-spinner.fa-spin  "Loading..."   ← LOADING STATE
   │  └─ (list of PM threads renders here once loaded)
   └─ .modal-footer.text-center
      └─ button.btn.btn-secondary [data-bs-dismiss]  "Close"
```

### Fields / controls
- Title "All private messages:".
- **Loading**: spinner + "Loading...". Loaded state (not captured) = list of conversation rows (per-user thread → opens PrivateChat).
- Footer **Close**.

### Map to pro-room — **NEW component needed**
- No equivalent exists. Build `AllUserPmModal.svelte` on `Modal.svelte`: title "All private messages", body = loading spinner → list of thread rows (avatar, username, last-message preview, unread badge), clicking a row opens the PrivateChat panel for that user. Backend: needs a "list my PM threads" endpoint.

---

## 4. `app-privchat` (file32.html) → **NEW** `PrivateChat.svelte`

A **panel** (not a Bootstrap modal) — a docked private-chat surface with its own
navbar, body, and (when active) composer. Capture shows the "no active chat"
empty state.

### Markup tree

```
app-privchat#privaChatCompHolder.privChatHolder
└─ .chat.d-flex.flex-column.h-100  [overflow-y:hidden]
   ├─ .bs-component
   │  └─ nav.navbar.chat-nav-pm.text-white                  ← PANEL CHROME (top bar)
   │     ├─ a.navbar-brand > i.fas.fa-comments               (PM icon/title)
   │     └─ ul.nav.ml-auto.flex-nowrap
   │        ├─ li.nav-item.dropdown
   │        │  └─ a.nav-link.dropdown-toggle > i.fas.fa-cog.chat-header-gear  [title=Settings]
   │        └─ li.nav-item > i.fas.fa-times                  (close panel)
   └─ .d-flex.h-100.pc-body                                  ← MESSAGE LIST AREA
      └─ .flex-fill.p-3.text-center  "No active chat"        ← EMPTY STATE
         (active state: message list + composer render here)
```

### Fields / controls
- **Chrome**: navbar with comments-icon brand, **Settings** gear (dropdown), **close** (`fa-times`).
- **Body** (`.pc-body`): empty = "No active chat"; active = scrollable message list + a composer (same textarea/emoji/image pattern as reply, not present in this capture).

### Map to pro-room — **NEW component needed** (`PrivateChat`)
- No equivalent. Build a docked panel (not a modal): header bar (PM icon, settings dropdown, close), message list, composer reusing the Reply composer pattern. Targeted by ReplyModal "reply privately" and by AllUserPmModal row clicks. Empty state "No active chat". Backend: per-pair message history + realtime PM events.

---

## 5. `app-muted-users-modal` (file20.html) → `MutedUsersModal.svelte`

### Markup tree
```
div#mutedUsersModal.modal.fade
└─ .modal-dialog > .modal-content
   ├─ .modal-header > h5#mutedUsersModalLabel.modal-title "Muted Chat Users"
   │                + button.btn-close.btn-close-white
   ├─ .modal-body > .text-center  "You don't have any muted/ignored users."   ← EMPTY STATE
   └─ .modal-footer > button.btn.btn-primary [data-bs-dismiss] "Close"
```
- **Empty state**: centered text. **List-row shape** (not captured): per-muted-user row with username + unmute action.
- **Map (`modals/MutedUsersModal.svelte` — exists)**: matches well. Ours title "Muted / Ignored Users" (ST: "Muted Chat Users"), adds a `SpeakerSlashIcon`. Footer button: ours `ghost`, ST `btn-primary`. Missing the populated list-row + unmute action (add when backend exists).

## 6. `app-followed-users-modal` (file21.html) → `FollowedUsersModal.svelte`

### Markup tree
```
div#followedUsersModal.modal.fade
└─ .modal-dialog > .modal-content
   ├─ .modal-header > h5#followedUsersModalLabel.modal-title "Followed Chat Users"
   │                + button.btn-close.btn-close-white
   ├─ .modal-body > .text-center  "You don't have any followed users."         ← EMPTY STATE
   └─ .modal-footer > button.btn.btn-light [data-bs-dismiss] "Close"
```
- Identical shape to muted modal; **list-row** = followed-user + unfollow action (not captured).
- **Map (`modals/FollowedUsersModal.svelte` — exists)**: matches well. Ours title "Followed Users" (ST: "Followed Chat Users"), adds `UsersThreeIcon`. Footer: ours `ghost`, ST `btn-light`. Missing populated list-row + unfollow action.

---

## Summary of pro-room status

| ST component | pro-room target | Status |
|---|---|---|
| app-reply-modal | `modals/ReplyModal.svelte` | Exists but **ORPHANED** — wire to chat/alert "reply privately" + PrivateChat |
| app-alert-qa-modal | `AlertQaModal.svelte` | **Wired** (in AlertFeed); richer than ST (answer/resolve) |
| app-all-user-pmmodal | `AllUserPmModal.svelte` | **NEW** — does not exist |
| app-privchat | `PrivateChat` panel | **NEW** — does not exist |
| app-muted-users-modal | `modals/MutedUsersModal.svelte` | Exists (empty-state only; add list rows) |
| app-followed-users-modal | `modals/FollowedUsersModal.svelte` | Exists (empty-state only; add list rows) |
