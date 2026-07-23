# Chat-panel

Surface = the `app-chat` component: the chat header/nav bar (Main Chat / Off Topic tabs, search, settings gear), the scrolling message list, and the individual message rows (`app-st-message` / `app-st-compactmessage`) with avatars, usernames, badges, timestamps, the kebab menu, separators, and reactions. All evidence is cited to `main.d6f5272aa3783e43.js` (the live bundle, "BUNDLE"), `styles.d622cb9ed2bbc221.css` ("GLOBAL"), the capture JSONs ("CAP"), the raw DOM dumps ("DOM"), or the boot token source ("BOOT").

The three chat components share one template shape:
- `app-chat` (BUNDLE selector `["app-chat"...]` @ off 1453890) and `app-extra-chat` (@ off 2397435) — **byte-identical scoped CSS** (verified by diff). This is the header + list + textarea shell.
- `app-st-message` (BUNDLE selector `["app-st-message"]` @ off 1361201) — the standard message row (`.avatar img{width:35px;height:35px}`, `.username{font-weight:900}`, `.text-formated{font-size:13px}`).
- `app-st-compactmessage` (BUNDLE @ off 1399741) — a denser variant (`.avatar img{25px}`, `.username{font-weight:800}`, `.uploaded-img{max 150px}`, adds `.reactions-container{margin-left:20px}` and `.nowrap`). The room in the captures renders the `app-st-message` (35px avatar) form — CAP `proroom-all-admin.json` `strong.username` and `div.avatar img` resolve to the 35px/`font-weight:900` values.

---

## DOM structure

### Header / nav (`app-chat` template, BUNDLE consts+template @ off 1447148–1453890)

Literal creation order from `template:function(i,o){...d(0,"div",6)(1,"div",7)(2,"nav",8)...}`:

```
div.chat.d-flex.flex-column.h-100  [style overflow-y:hidden]          (const 6)
  div.bs-component                                                     (const 7)
    nav.navbar.navbar-expand-lg.navbar-light.chat-nav.p-1.chatHeader   (const 8)
      a.navbar-brand.ml-1.mr-1                                         (const 9)
        i.fas.fa-comment                                              (const 10)
        span            → text " Chat"        (U1e; shown only when chatTabs.length==0)
        span.badge.badge-danger.ml-2 > i.fas.fa-bell-slash + " DND"   (j1e; shown when preferences.doNotDisturbOn) (const 11 badge, const 26 icon)
      ul.nav.nav-tabs.flex-wrap.flex-grow-1.justify-content-center.chatTabs  [role=tablist]  (const 12)
        li.nav-item  (const 14)  *ngFor chatTabs
          a.nav-link  [ngClass {active: tab.name==channel}] (click)=switchChatChannel(name)  (const 27)
            "{{tab.displayName}}"
            span.badge.badge-pill.badge-warning.ml-1.counterBadge  "{{unreadMsgs[name]}}"  (const 28; when unread)
              span.text-danger " ({{unreadMentions[name]}})"       (const 29; presenter + mentions)
        (z1e renders this <ul> only when chatTabs.length>0)
      ul.nav.ml-auto.align-items-center                               (const 13)
        li.nav-item  (const 14)  → a.nav-link (click)=showPrivateChat  > i.fas.fa-comments  (G1e; only when showPMBtn)  (const 30/31)
        li.nav-item.mx-1  (click)=toggleChatToolbarSearchOnly()       (const 15)
          a.nav-link.p-0  [title="Search"]                            (const 16)
            i.fas.fa-search                                           (const 17)
        li.nav-item.dropdown.ml-2  [style position:static] (click)=toggleChatToolbar()   (const 18)
          a.nav-link.dropdown-toggle.p-0  [aria-haspopup=true aria-expanded=false]        (const 19)
            i.fas.fa-cog.chat-header-gear  [title="Settings"]         (const 20)
    div.shadow.p-2.w-100.chatToolbar  [style margin-top:0px]          (const 21)  ← search/settings toolbar, shown only when showChatToolbar (X1e)
    app-roomscroller#... [style overflow-y:scroll;height:100%] [logType="chat" displayMode isPresenter ngClass]  (const 22)  ← the message LIST host
    <ng-template> popoverClass                                        (const 23; emoji-mart popover J1e)
    div.px-1.webinarMode  " Webinar Mode " span>i + i               (const 24; Z1e, shown when webinarMode)
    div.typing-indicator-container ...                                (e0e; shown when showTyping && usersTypingCnt>0)
    div#textAreaHolder.d-flex.align-items-center.textSendDiv  /  div.chatDisabled  (const 25 / const 90; connected+enabled vs disabled)
```

**Search / settings toolbar** (`X1e` @ off 1423221, rendered into `div.chatToolbar` const 21):
```
form#chat-settings.w-100  (change)=searchTermChanged  (keydown.enter)=onEnterSearchChat   (const 32)
  div > div.form-group.m-0 (33) > div.input-group (34)
    input.form-control  [name=chatSearchTermTxt placeholder="Type your search term, then press Enter"
                         aria-label=Search title="Type your search term, then press Enter"] [(ngModel)=chatSearchTerm]  (const 35)
    span#addon-chat-clear.btn.btn-outline-secondary.clear-chat-input.input-group-text  [title="Clear the search"] (click)→clear  (const 36)
      i.fas.fa-times   (const 37)
    (q1e, when showChatToolbarExtended):
      span#addon-chat-save     [title="Save chat messages"]    (click)=downloadLog('chat')  > i.fas.fa-save   (const 38/39)
      div#addon-chat-archive   [title="Archive Chat Messages"] (click)=archiveOptions()      > i.fas.fa-trash (const 40/41→W1e, presenter only)
  (Q1e extended row, when showChatToolbarExtended):
      form-check "Show only Moderators messages" → input#mod-only[type=checkbox] [(ngModel)] + label[for=mod-only]   (const 43/44/45)
      dropdown.group-chat-control  button.btn.btn-secondary.dropdown-toggle "Group Chat Control" (K1e)
        ul.dropdown-menu > li>a>i.fas + "Regular Group Chat" / "Web..." (changeChatMode 'g'/'p')
      a.btn.btn-outline-info "Detach Chat" > i.fas.fa-window-restore   (const 47/54)
      emoji-mart / webinar help tooltip i.fas.fa-question-circle       (const 55/56/57)
```
NOTE — the "gear" is **not** a Bootstrap dropdown-menu; despite the `.dropdown`/`.dropdown-toggle` classes on consts 18/19, the `(click)` calls `toggleChatToolbar()`, which toggles the `.chatToolbar` panel (const 21). The search icon calls `toggleChatToolbarSearchOnly()` (opens the same toolbar with only the search row). Source: `template` @ off 1451362 (`M("click",function(){return D(s),E(o.toggleChatToolbarSearchOnly())})` and `...E(o.toggleChatToolbar())`).

**Tab model** (BUNDLE @ off 1146176, `processSessData`):
```
chatTabs = [ {displayName:"Main Chat", name:"main", type:"r"} ]                      // always (or altGenChannelName)
  + if hasChannelTabs:      {displayName:"Off Topic", name:"offTopic", type:"r"}    // or altOffTopicChannelName
  + if hasAdminOnlyChannel: {displayName:"Admins",    name:"adminChat", type:"po"}
  + extraAdminChannels (type "p"), extraRegChannels (type "r")
```
CAP confirms the live room renders exactly two: `Main Chat` (active) and `Off Topic` (`proroom-all-admin.json`, `proroom-full-member.json`, `proroom-ultra-admin-room-stronger.json` — all three: `a.nav-link.active "Main Chat"`, `a.nav-link "Off Topic"`).

### Message row (`app-st-message`, BUNDLE consts @ off 1357000–1361150; template `Lge`/`p_e`)

Component inputs (BUNDLE @ off 1357180): `msg, isP, logType, prevD, isQAMsg, msgIndex, qaMsgID, extraChatMsg, sessName`.

Top-level `template` picks one of two row renderers:
`2&i&&(...O(3,o.msg.isA&&"alert"!=o.logType?3:4))` → **`Lge`** (const 3) when `msg.isA && logType!='alert'`, else **`p_e`** (const 4). Both build the same outer box:

```
div.msg-box.pb-1  [ngClass {msg-box-adm: msg.isA}]  [ngStyle=styleB]        (const 4)   ← STAFF/admin msgs get .msg-box-adm
  div.d-flex.flex-column.align-items-center.w-100  (or clas variant)         (const 7)
    div.mr-1.d-flex.flex-row-reverse                                         (const 8)   ← row is flex-row-reverse (kebab leads)
      div.d-flex.flex-row-reverse.justify-content-center.align-items-start.flex-nowrap.mt-1   (const 9)
        a#dropdownMenuLink.msgMenu.dropright.pt-1  [role=button data-bs-toggle=dropdown        (const 10)
                                                    aria-haspopup=true aria-expanded=false ngStyle]
          "⠇ "                                                          ← the ⠇ kebab glyph (U+2807)
        div.dropdown-menu.users-dropdown-options  [aria-labelledby=dropdownMenuLink]           (const 11)
          <kebab items — see below>
    div.avatar.pl-1  (click)=doUserInfo(msg.uid,msg.rid)                     (const 44)
      img  [alt=msg.avt  src = msg.pic || "https://secure.gravatar.com/avatar/"+msg.avt+"?d=mm&s=50"]   (const 45)
    div.w-100                                                                (const 20)
      div.d-flex.justify-content-between.align-items-center.w-100            (const 21)
        span.created-at.mx-2  [placement=top ngbTooltip=(msg.t|short) ngStyle]  "{{msg.t | hh:mm a}}"   (const 22)
        div.d-flex.align-items-center.justify-content-between.flex-nowrap    (const 23)
          strong.username.mx-1  (click)=... (dblclick)=... [ngStyle]  " {{msg.n}} "               (const 24)
          (badges, const 33 → Nge): span.badge.bg-danger.trial-badge / span.badge.bg-warning.new-badge / stars-container
      div.msg-left.text-formated.preText.ml-2.mr-2.p-0  [ngStyle ngClass innerHTML]  ← message body  (const 29)
      div.reactions block (const 38 → reaction ngFor, see Reactions)
```
The **member vs staff difference is the `msg-box-adm` class only** (bound to `msg.isA`, BUNDLE @ off ~1360950 `H("ngClass",ht(30,i6,e.msg.isA))`, where `i6=t=>({"msg-box-adm":t})`). Flex direction, avatar, and kebab are identical for both. There is a right-aligned presenter variant gated on `sessData.presenterMsgsOnTheRight` (`cge=t=>({"justify-content-end":t})`, plus `.presenter-msg-right` / `.presenter-reactions-right`).

### Kebab menu items (`div.dropdown-menu.users-dropdown-options`, const 11)

Fixed first two items, then conditional items. Each is `a.dropdown-item` (const 12) unless noted. Labels are prefixed with two NBSPs (`  `). Icon = the `<i>` inside.

| # | Item (label) | Icon | Handler | Show condition (BUNDLE @ off ~1360850 `O()`) |
|---|---|---|---|---|
| 7 | (Delete + optional Mute submenu) | fa-trash (const 30) | `bge`/`Uge` → `doMsgDelete` | `isP` (presenter) — `O(7,e.isP?7:-1)`. Nested `_ge`/`Bge` "Mute Chat for 24hrs" `fa-comment-slash` (const 32) shown when `!msg.isA`. |
| 8 | Delete Message | fa-trash (const 30) | `vge`/`jge` → `usersDoMsgDelete` | `!isP && canDeleteOwnMsg` — `O(8,!e.isP&&e.canDeleteOwnMsg?8:-1)` |
| — | **User Info** | fa-user (const 13) | `doUserInfo(msg.uid,msg.rid)` | always (const 10 static) |
| — | **Mention** | fa-reply (const 14) | `doMention(msg.n)` | always (const 14 static) |
| 15 | Show message to all | fa-envelope-open (const 33) | `yge` → `doShowMsgToAll` | `globals.isPresenter && !isLimitedPresenter` |
| 16 | Alert Send Report | fa-chart-pie (const 35) | `Fge` → `openAlertSendReport(msg._id)`; anchor const 34 = `data-bs-toggle=modal data-bs-target="#alert-send-report-modal"` | `isP && logType=='alerts'` |
| 17 | Reply | fa-comment (const 37) | `Cge` → `doPublicReply(msg)`; anchor const 36 = `data-bs-toggle=modal data-bs-target="#replyModal"` | `canDoPublicReply` |
| 18 | Mark Answered | fa-check (const 38) | `Sge` → `markAsAnswered(msg)` | `isP && logType=='chat'` |
| 19 | Add Reaction | far fa-smile (const 40) | `wge` → `addReaction()`; anchor const 39 has ngbPopover (emoji picker), `(shown)`/`(hidden)` handlers | reactions enabled for this log/QA context |
| 20 | Edit | fa-edit (const 41) | `Tge` → `editMessage()` | `canEditMessage` |
| 21 | Copy | fa-copy (const 42) | `Dge` → `copyMessage()` | `logType=='alerts'` |
| 22 | Private Chat | fa-comments (const 43) | `Ege` → `startPC(msg.uid)` | `canPM` |
| 23 | (user avatar tile) | img (const 45) | `kge` → `doUserInfo`; div const 44 | `!hideAvatar` |

The only `data-bs-*` targets in the message menu are **`#alert-send-report-modal`** (const 16/34) and **`#replyModal`** (const 17/36). (`data-bs-target` verified BUNDLE @ off 1357962 / 1358051.)

### Separator (BUNDLE `gge` @ off ~1330000, const 3)
```
div.separator  > a.[ngStyle=styleF]  "{{ msg.t | fullDate }}"
```
Rendered as a date divider between message groups (`O(2,o.isND?2:-1)` — shown when `isND`, "is new date").

---

## Scoped CSS (verbatim)

### `app-chat` / `app-extra-chat` (BUNDLE @ off 1453890, identical @ 2397435)
```css
.navbar[_ngcontent-%COMP%]{font-size:12px;padding:2px}
.chatToolbar[_ngcontent-%COMP%], .chatHeader[_ngcontent-%COMP%]{background-color:var(--msgs-header-bg);color:var(--msgs-header-color)}
.chatHeader[_ngcontent-%COMP%]   .dropdown-menu[_ngcontent-%COMP%]{background-color:var(--msgs-header-bg);border:none;border-radius:0 0 0 5px}
.roomLog[_ngcontent-%COMP%]{height:100%;overflow-y:scroll}
.chatDisabled[_ngcontent-%COMP%]{height:40px;min-height:40px;width:100%;background-color:#fff;color:#000}
.webinarMode[_ngcontent-%COMP%]{background-color:#fff;color:#000;width:100%}
.chat-header-nav[_ngcontent-%COMP%]{font-size:12px;min-height:30px}
.chatHeader[_ngcontent-%COMP%]   .fas[_ngcontent-%COMP%], .chat-header-nav[_ngcontent-%COMP%]   .navbar-brand[_ngcontent-%COMP%]{font-size:16px}
.menu-p-label[_ngcontent-%COMP%]{padding:5px;font-weight:100;font-size:12px}
.chat-header-menu-settings[_ngcontent-%COMP%]{padding:0;margin:0;border:none;border-radius:0%;background-color:transparent}
.chat-header[_ngcontent-%COMP%]{background-color:var(--chat-header-bg)!important;color:var(--chat-header-color)!important}
.chat[_ngcontent-%COMP%]{background-color:var(--chat-bg)}
.chat[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   a[_ngcontent-%COMP%], .chat[_ngcontent-%COMP%]   .clear-chat-input[_ngcontent-%COMP%]{cursor:pointer}
.list-of-msgs[_ngcontent-%COMP%]{height:calc(100% - 41px);overflow-y:scroll;background-color:var(--msgs-bg)}
.textAreaBtns[_ngcontent-%COMP%]{padding:5px;color:var(--dark-gray)}
.custom-file[_ngcontent-%COMP%]{display:none}
.input-group-text[_ngcontent-%COMP%]{padding:0;margin:0}
.textAreaBtnsCol[_ngcontent-%COMP%]{background-color:var(--textarea-bg)!important;color:var(--dark-gray)!important}
.textAreaBtns[_ngcontent-%COMP%]{color:var(--textarea-holder-btns-color)!important}
.textAreaBtns[_ngcontent-%COMP%]:hover{color:var(--textarea-holder-btns-hover-color)!important;cursor:pointer}
.txt-area[_ngcontent-%COMP%]{border-radius:0;border:1px solid #ffffff;font-size:14px;resize:none;color:var(--textarea-color)!important;background-color:var(--textarea-bg)!important;outline:none;overflow-y:auto;margin-left:0;margin-right:0;padding-left:5px;padding-right:5px}
.txt-area[_ngcontent-%COMP%]:focus{border-color:var(--darker-gray);box-shadow:1px 1px 1px var(--darker-gray)}
#form-upload-img[_ngcontent-%COMP%]   .input-group-text[_ngcontent-%COMP%], #form-upload-img[_ngcontent-%COMP%]   .form-control[_ngcontent-%COMP%]{border-radius:0}
.unreadIndicator[_ngcontent-%COMP%]{text-align:center;position:relative;top:30px;z-index:10;background-color:#9acd32}
.white[_ngcontent-%COMP%]{color:#fff}
.chat-nav[_ngcontent-%COMP%]{align-items:center;flex-wrap:nowrap;min-height:40px}
.chatTabs[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{font-weight:700;font-size:12px;padding-left:5px;padding-right:5px;margin-right:5px;margin-bottom:0;padding-bottom:5px}
ul.chatTabs[_ngcontent-%COMP%]{margin-bottom:0}
.chatTabs[_ngcontent-%COMP%]{border-color:var(--modal-active-tab-border-color)!important}
.chatTabs[_ngcontent-%COMP%]   .nav-link.active[_ngcontent-%COMP%]{border:1px solid var(--modal-active-tab-border-color)!important;border-bottom:none}
.chatTabs[_ngcontent-%COMP%]   .nav-link[_ngcontent-%COMP%]:hover{border-color:var(--modal-active-tab-border-color)!important;cursor:pointer}
.chatTabs[_ngcontent-%COMP%]   .nav-link.active[_ngcontent-%COMP%], .chatTabs[_ngcontent-%COMP%]   .nav-item.show[_ngcontent-%COMP%]   .nav-link[_ngcontent-%COMP%]{background-color:var(--modal-active-tab-bg-color)!important;color:var(--modal-active-tab-color)!important;cursor:default}
.chatTabs[_ngcontent-%COMP%]   .nav-link.active[_ngcontent-%COMP%]:hover{cursor:default}
.counterBadge[_ngcontent-%COMP%]{top:-5px;position:relative}
.textAreaBtnSelected[_ngcontent-%COMP%]{background-color:#f1f2f3}
.bs-popover-top[_ngcontent-%COMP%] > .arrow[_ngcontent-%COMP%]:after, .bs-popover-auto[x-placement^=top][_ngcontent-%COMP%] > .arrow[_ngcontent-%COMP%]:after{border-top-color:var(--modal-content-bg-color)}
.giphy-search[_ngcontent-%COMP%]{width:400px;height:700px;border:2px solid var(--modal-content-bg-color);background-color:#fff;overflow:hidden}
.giphy-search[_ngcontent-%COMP%]   .input-group-text[_ngcontent-%COMP%]{border:none;background-color:var(--modal-input-group-bg)}
.giphy-search[_ngcontent-%COMP%]   .fa-times[_ngcontent-%COMP%]{font-size:16.5px;padding:10px}
.giphy-search[_ngcontent-%COMP%]   .fa-times[_ngcontent-%COMP%]:hover{cursor:pointer;opacity:.85}
.giphy-header[_ngcontent-%COMP%]{padding:10px;background-color:var(--modal-content-bg-color)}
.search-results[_ngcontent-%COMP%]{overflow-y:auto;height:100%;padding:5px}
.gif-result[_ngcontent-%COMP%]{text-align:center}
.gif-result[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{cursor:pointer}
.giphy-search[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]{padding:10px}
.giphy-search[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:hover{background-color:var(--modal-upload-files-color)}
.giphy-search[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%], .giphy-search[_ngcontent-%COMP%]   h6[_ngcontent-%COMP%]{color:var(--modal-content-color)}
.giphy-hr[_ngcontent-%COMP%]{color:#fff;padding:0;margin:0 0 10px}
#textAreaHolder[_ngcontent-%COMP%]{background-color:var(--textarea-bg);border-radius:8px;padding:5px;margin:5px}
.typing-indicator-container[_ngcontent-%COMP%]{margin:0 8px;border-top:1px solid #ccc}
.users-count[_ngcontent-%COMP%], .users-typing[_ngcontent-%COMP%]{color:#90949c;font-size:12px}
.users-typing[_ngcontent-%COMP%]{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.users-typing[_ngcontent-%COMP%]   em[_ngcontent-%COMP%]{font-weight:700}
#textAreaTxt[_ngcontent-%COMP%]{max-height:300px;width:100%}
#textAreaTxt[_ngcontent-%COMP%], .textAreaBtnsCol[_ngcontent-%COMP%]{background-color:var(--textarea-bg)}
img[_ngcontent-%COMP%]{max-width:100%}
```

### `app-st-message` (BUNDLE @ off 1361201) — message row (35px avatar variant, the one the live room renders)
```css
.msg-box[_ngcontent-%COMP%]{font-weight:100;font-size:16px;word-wrap:normal;text-align:inherit;width:100%;background-color:var(--msgs-bg);border-top:1px solid var(--msg-border-color)}
.msg-box-adm[_ngcontent-%COMP%]{background-color:var(--msgs-bg-adm);border-bottom:2px;padding-top:2px}
.private-reply[_ngcontent-%COMP%]{font-size:12px}
.private-reply-message[_ngcontent-%COMP%]{border-left:2px solid #00bc8c;margin-left:10px;margin-bottom:3px;padding:3px 3px 3px 5px}
.private-reply-bg-light[_ngcontent-%COMP%]{background-color:#f4f4f4}
.private-reply-bg-dark[_ngcontent-%COMP%]{background-color:#161515}
@keyframes _ngcontent-%COMP%_slideInRight{0%,40%{transform:scale(0);transform-origin:bottom right}40%,to{transform:scale(1);transform-origin:bottom right}}
.avatar[_ngcontent-%COMP%]{display:inline}
.avatar[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:35px;height:35px;object-fit:cover}
.username[_ngcontent-%COMP%]{cursor:pointer;font-size:14px;color:var(--username-color);font-weight:900}
.msg-left[_ngcontent-%COMP%], .msg-right[_ngcontent-%COMP%]{color:var(--msg-color);word-break:break-word}
.msg-right[_ngcontent-%COMP%]{text-align:right;margin-right:5px;padding-left:10px}
.presenter-msg-right[_ngcontent-%COMP%]{text-align:right!important;margin-right:5px;padding-left:10px}
.presenter-reactions-right[_ngcontent-%COMP%]{text-align:right!important;margin-right:50px;display:inline-block;width:100%}
.alert-qa[_ngcontent-%COMP%]{font-size:10px;padding:1px 3px}
.msg-left[_ngcontent-%COMP%]{text-align:left;margin-left:5px;padding-right:10px}
.created-at[_ngcontent-%COMP%]{font-size:12px;color:var(--date-color);overflow:hidden;font-weight:600}
.options-left[_ngcontent-%COMP%]{right:0}
.options-right[_ngcontent-%COMP%]{left:0}
.options[_ngcontent-%COMP%]{display:none;opacity:0;position:absolute;top:0}
.options[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{color:var(--dark-brown);border:1px solid var(--border-color);padding:2px 8px;min-width:30px;min-height:20px;cursor:pointer}
.options[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:first-child{border-top-left-radius:5px;border-bottom-left-radius:5px}
.options[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:last-child{border-top-right-radius:5px;border-bottom-right-radius:5px}
.options[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover{color:var(--dark-black)}
.options[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]{font-size:16px}
.bubble-box-left[_ngcontent-%COMP%]:hover   .options[_ngcontent-%COMP%], .bubble-box-right[_ngcontent-%COMP%]:hover   .options[_ngcontent-%COMP%]{display:block;z-index:1000;opacity:1}
.smallChatLog[_ngcontent-%COMP%]{font-size:16px;font-weight:200}
.smallChatLogBkg[_ngcontent-%COMP%]{background-color:var(--light-black)}
.smallChatLog[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{max-width:16px;max-height:16px}
.img-container[_ngcontent-%COMP%]{text-align:left;cursor:pointer;display:inline-flex;padding:3px}
.uploaded-img[_ngcontent-%COMP%]{max-width:300px;max-height:300px}
.msg-left[_ngcontent-%COMP%], .msg-right[_ngcontent-%COMP%]{float:inherit!important}
.imgur-modal[_ngcontent-%COMP%]{text-align:center}
.imgur-modal[_ngcontent-%COMP%]   .modal-dialog[_ngcontent-%COMP%]{max-width:90%;max-height:90%}
.imgur-modal[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:inherit;height:inherit;max-width:100%;max-height:calc(100vh - 150px)}
.preText[_ngcontent-%COMP%]{white-space:pre-wrap}
.text-formated[_ngcontent-%COMP%]{font-size:13px}
.chatNameAvatar[_ngcontent-%COMP%]{display:inline}
.menuTrigger[_ngcontent-%COMP%]{margin-top:15px}
.menuTriger[_ngcontent-%COMP%]:after{content:"\2807";font-size:20px;color:var(--username-color);vertical-align:middle;border:none;padding-left:5px}
.msgMenu[_ngcontent-%COMP%]{padding-left:5px;font-size:20px;font-weight:600;color:var(--username-color)!important}
.msgMenu[_ngcontent-%COMP%]:hover{color:var(--light-brown)!important;font-weight:900;cursor:pointer}
.chatDPMenu[_ngcontent-%COMP%]{font-size:12px;text-align:left}
.chat-stars[_ngcontent-%COMP%]{font-size:8px;vertical-align:text-top!important}
span.chat-stars[_ngcontent-%COMP%]{margin-top:2px;margin-left:2px;display:inline-block}
span.chat-stars[_ngcontent-%COMP%]{color:var(--username-color)}
.stars-container[_ngcontent-%COMP%]{position:relative}
.stars-container[_ngcontent-%COMP%]   .stars-icon[_ngcontent-%COMP%]{color:var(--msg-color)}
.stars-num[_ngcontent-%COMP%]{position:absolute;color:var(--msgs-bg);left:6px;top:5px;font-size:10px;font-weight:700}
a[_ngcontent-%COMP%]{color:var(--light-black)}
.separator[_ngcontent-%COMP%]{display:flex;align-items:center;text-align:center;background-color:var(--msgs-separator-bg)!important}
.separator[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{color:var(--msgs-separator-color)!important;margin:0 auto;font-size:13px}
.msg-box[_ngcontent-%COMP%]:hover   .chat-reaction-hover[_ngcontent-%COMP%]{display:inline-block}
.chat-reaction-hover[_ngcontent-%COMP%]{display:none}
```

### `app-st-compactmessage` (BUNDLE @ off 1399741) — deltas from `app-st-message` (NOT the rendered variant, kept for completeness)
```css
.msg-box[_ngcontent-%COMP%]{ ...font-size:14px... }              /* 14px, not 16px */
.avatar[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:25px;height:25px;object-fit:cover}  /* 25px, not 35px */
.username[_ngcontent-%COMP%]{...font-weight:800}                 /* 800, not 900 */
.msg-right[_ngcontent-%COMP%]{text-align:right;margin-right:5px} /* no padding-left */
.presenter-reactions-right[_ngcontent-%COMP%]{text-align:right!important;margin:0 0 0 -50px!important;display:inline-block;width:100%}
.created-at[_ngcontent-%COMP%]{font-size:12px;color:var(--date-color)}  /* no font-weight:600, no overflow */
.img-container[_ngcontent-%COMP%]{...display:flex...}            /* flex, not inline-flex */
.uploaded-img[_ngcontent-%COMP%]{max-width:150px;max-height:150px}
.msgMenu[_ngcontent-%COMP%]{padding-left:5px;font-size:20px;color:var(--username-color)!important}  /* no font-weight:600 */
.chatDPMenu[_ngcontent-%COMP%]{font-size:12px;text-align:right}  /* right, not left */
.nowrap[_ngcontent-%COMP%]{white-space:nowrap;display:table}     /* extra */
.reactions-container[_ngcontent-%COMP%]{margin-left:20px}        /* extra */
/* (no .text-formated, .menuTrigger, .menuTriger, .options, .smallChatLog rules here) */
```

---

## Global CSS (verbatim)

Only the rules that actually win on this surface (GLOBAL = `styles.d622cb9ed2bbc221.css`):

```css
/* reactions — no scoped rule exists, these are the authority (GLOBAL) */
.chat-reaction{padding:3px 6px;margin:0 2px;color:var(--msg-color);border:1px solid var(--msg-color)}
.chat-reaction:hover{cursor:pointer;opacity:.85}
.chat-reaction,.alert-chat-box-sm .chat-reaction{font-size:8px!important;padding:1px 2px!important}
.chat-reaction-added{color:var(--app-link-color);border:1px solid var(--app-link-color)}

/* badge base + variants used in header (GLOBAL, BS4 Darkly) */
.badge{display:inline-block;padding:.25em .4em;font-size:75%;font-weight:700;line-height:1;text-align:center;white-space:nowrap;vertical-align:baseline;border-radius:.25rem;transition:...}
.badge{transition:none}
.badge-danger{color:#fff;background-color:#e74c3c}       /* header brand DND / counter fallback */
.badge-warning{color:#fff;background-color:#f39c12}      /* .counterBadge unread pill */

/* nav-tabs base (GLOBAL BS4) — overridden by scoped .chatTabs rules for active/hover colors */
.nav-tabs .nav-link{border:1px solid transparent;border-top-left-radius:.25rem;border-top-right-radius:.25rem}
.nav-tabs .nav-link.active,.nav-tabs .nav-item.show .nav-link{color:#fff;background-color:#222;border-color:#444 #444 transparent}
```
Note: the BS `.nav-tabs .nav-link.active{background-color:#222}` rule is **beaten** by the scoped `.chatTabs .nav-link.active{background-color:var(--modal-active-tab-bg-color)!important}` (the `!important` wins). The room's live `--modal-active-tab-bg-color` resolves to `#45a2ff` (see Resolved values), not `#222`.

---

## Resolved values

All resolved values are the **LIVE room** computed values from the captures (they override boot tokens). RGB → hex in parentheses.

| Element | Property | Resolved value | Source |
|---|---|---|---|
| `nav.chat-nav.chatHeader` | background-color | `rgb(10,109,177)` (#0a6db1) | CAP proroom-all-admin + full-member (identical) |
| `nav.chat-nav.chatHeader` | color | `rgb(255,255,255)` #fff | CAP (both) |
| `nav.chat-nav.chatHeader` | font-size / font-weight | 12px / 300 | CAP (both) |
| `nav.chat-nav.chatHeader` | padding-top | 4px (`.p-1`) | CAP (both) |
| `i.fas.fa-cog.chat-header-gear` | color / font-size / font-weight | #fff / 16px / 900 | CAP full-member |
| `a.nav-link.p-0` (search) | color / font-size | #fff / 16px | CAP full-member |
| `ul.chatTabs .nav-link.active` (Main Chat) | background-color | `rgb(69,162,255)` (#45a2ff) | CAP all-admin, full-member, ultra-admin-room-stronger (all 3 identical) |
| `ul.chatTabs .nav-link.active` | color / font-weight / font-size | #fff / 700 / 12px | CAP (all 3) |
| `ul.chatTabs .nav-link.active` | border-bottom-color | `rgb(69,162,255)` (#45a2ff) | CAP (all 3) |
| `ul.chatTabs .nav-link` (Off Topic, inactive) | background-color | `rgba(0,0,0,0)` transparent | CAP (all 3) |
| `ul.chatTabs .nav-link` (inactive) | color / font-weight | #fff / 700 | CAP (all 3) |
| `div.msg-box` (member/normal) | background-color | `rgb(232,232,232)` (#e8e8e8) = `--msgs-bg` | CAP all-admin + full-member |
| `div.msg-box` | font-size / font-weight | 16px / 100 | CAP (both) — confirms 35px (`app-st-message`) variant renders |
| `div.msg-box` | border-top | 1px solid `--msg-border-color` | BUNDLE scoped |
| `div.msg-box.msg-box-adm` (staff/admin) | background-color | `rgb(215,215,215)` (#d7d7d7) = `--msgs-bg-adm` | CAP all-admin |
| `div.msg-box.msg-box-adm` | padding-top | 2px | CAP all-admin |
| `strong.username` (base token) | color | `rgb(10,109,177)` (#0a6db1) = `--username-color` | CAP all-admin (msgMenu, also uses `--username-color`); per-user `styleF` may override to e.g. rgb(232,232,232) |
| `strong.username` | font-size / font-weight | 14px / 900 | BUNDLE scoped (`app-st-message`) |
| `a.msgMenu` (kebab) | color | `rgb(10,109,177)` (#0a6db1) = `--username-color` | CAP all-admin + full-member |
| `a.msgMenu` | font-size / font-weight | 20px / 600 | CAP (both) |
| `span.created-at` | color | `rgb(232,232,232)` (per-msg `styleF`/invert) or `--date-color` | CAP all-admin |
| `span.created-at` | font-size / font-weight / font-style | 12px / 600 / normal | CAP all-admin |
| `div.msg-left` (body) | color | `rgb(26,26,26)` (#1a1a1a) = `--msg-color` | CAP all-admin + full-member |
| `div.msg-left` | font-size / font-weight / text-align | 13px / 100 / left | CAP (both) |
| `div.msg-left` | margin-left / margin-right | 8px / 8px (`.ml-2 .mr-2`) | CAP (both) |
| `div.separator` | background-color | `rgb(232,232,232)` (#e8e8e8) = `--msgs-separator-bg` | CAP all-admin + full-member |
| `div.separator` | display / text-align | flex / center | CAP (both) |
| `span.badge.chat-reaction` | color | `rgb(103,103,103)` (#676767) = `--msg-color` (this capture's room) | CAP all-admin |
| `span.badge.chat-reaction` | border | 1px solid `--msg-color` | GLOBAL `.chat-reaction` |
| `span.badge.chat-reaction` | font-size | 8px !important | GLOBAL `.chat-reaction,.alert-chat-box-sm .chat-reaction` |
| `span.badge.chat-reaction` | font-weight / text-align / display | 700 / center / inline-block | CAP all-admin (badge base) |
| `span.badge.chat-reaction-added` | color / border | `var(--app-link-color)` = `#00bc8c` | GLOBAL `.chat-reaction-added` |
| `div.avatar img` | width / height / object-fit | 35px / 35px / cover | BUNDLE scoped (`app-st-message`) |

**Token map** (LIVE-resolved where available; BOOT default noted when captures didn't isolate it):
- `--msgs-bg` = **#e8e8e8** (LIVE; BOOT `#f1f1f1`) · `--msgs-bg-adm` = **#d7d7d7** (LIVE; BOOT `#e1e1e1`)
- `--msg-color` = **#1a1a1a** (member) / **#676767** (admin-room capture) — BOOT lightTheme lists both `#1a1a1a` and `#676767`
- `--msg-border-color` = `#d9d9d9` (BOOT lightTheme; also `#e1e1e1`)
- `--username-color` = **#0a6db1** (LIVE; BOOT lightTheme `#000` or `#0a6db1`)
- `--date-color` = `#8394a9` (BOOT lightTheme; also `#a8a8a8`)
- `--msgs-separator-bg` = **#e8e8e8** (LIVE == BOOT) · `--msgs-separator-color` = `#373c42` (BOOT)
- `--chat-bg` = `#eee` (BOOT lightTheme) · `--msgs-header-bg` = `#111`, `--msgs-header-color` = `#ccc` (BOOT base)
- `--modal-active-tab-bg-color` = **#45a2ff** (LIVE room; BOOT base `#222`) · `--modal-active-tab-color` = `#00bc8c` (BOOT base) · `--modal-active-tab-border-color` = `#444` (BOOT base)
- `--app-link-color` = **#00bc8c** (BOOT lightTheme; the TrickTrades teal)
- `--light-brown` = `#8c8686`, `--dark-brown` = `#4b4b4b`, `--dark-black` = `#222`, `--light-black` = `#373c42`, `--dark-gray` = `#aaa`, `--darker-gray` = `#aaa6a6` (BOOT base)

The header background resolves to **#0a6db1** in the live captures, which means the room sets `--chat-header-bg`/`--msgs-header-bg` to that blue (the scoped `.chat-header` rule uses `--chat-header-bg`; `.chatHeader` uses `--msgs-header-bg`). Boot base has `--msgs-header-bg:#111`, so the live room overrides it — honest note: the exact token name the room overrides is not isolated in the 2-var capture cssVariables, but the *resolved* `nav.chatHeader` background is unambiguously `rgb(10,109,177)`.

---

## States & effects

- **Message hover reveals reaction button**: `.msg-box:hover .chat-reaction-hover{display:inline-block}` (default `.chat-reaction-hover{display:none}`). Source: BUNDLE `app-st-message` scoped CSS.
- **Kebab hover**: `.msgMenu:hover{color:var(--light-brown)!important;font-weight:900;cursor:pointer}` (idle `color:var(--username-color)!important;font-weight:600`). BUNDLE scoped.
- **Reaction hover**: `.chat-reaction:hover{cursor:pointer;opacity:.85}`. GLOBAL.
- **Active-tab lock**: `.chatTabs .nav-link.active{cursor:default}` and `.chatTabs .nav-link.active:hover{cursor:default}`; inactive `.chatTabs .nav-link:hover{border-color:var(--modal-active-tab-border-color)!important;cursor:pointer}`. BUNDLE scoped.
- **Textarea focus**: `.txt-area:focus{border-color:var(--darker-gray);box-shadow:1px 1px 1px var(--darker-gray)}`. BUNDLE scoped.
- **textAreaBtns hover**: `.textAreaBtns:hover{color:var(--textarea-holder-btns-hover-color)!important;cursor:pointer}`. BUNDLE scoped.
- **Legacy bubble hover options** (`.options`) — `.bubble-box-left:hover .options / .bubble-box-right:hover .options{display:block;z-index:1000;opacity:1}` (idle `.options{display:none;opacity:0;position:absolute;top:0}`). Present in `app-st-message` CSS but the current template renders the `.msgMenu` dropdown, not `.options` (no `.bubble-box-*` in the message template) — likely dead/legacy path.
- **Animations**: `@keyframes _ngcontent-%COMP%_slideInRight` (scale 0→1 from bottom-right) defined but not referenced by any rule in the extracted message CSS — honest gap: trigger not shown. GLOBAL `.badge{transition:none}` disables the BS badge transition.
- **Hidden-until conditions** (BUNDLE template `O()` bindings): chatTabs `<ul>` shown only when `chatTabs.length>0`; brand ` Chat` text only when `chatTabs.length==0`; DND badge only when `preferences.doNotDisturbOn`; PM tab only when `showPMBtn`; `.chatToolbar` only when `showChatToolbar`; webinar div only when `webinarMode`; typing indicator only when `showTyping && usersTypingCnt>0`; `#textAreaHolder` when `isConnected && chatEnabled` else `.chatDisabled` "Chat Disabled" (with `fa-lock`); kebab items per the table in DOM structure.

---

## Behavior (provable from templates)

- **Tab click** → `switchChatChannel(tab.name)` (BUNDLE `$1e` @ off 1420…). Active class = `{active: tab.name==channel}`. Unread pill shows `unreadMsgs[name]`; presenters also see `(unreadMentions[name])`.
- **Search icon** (`li.nav-item.mx-1`) → `toggleChatToolbarSearchOnly()`. **Gear icon** (`li.nav-item.dropdown.ml-2`) → `toggleChatToolbar()`. Both toggle the same `.chatToolbar` panel; the gear is NOT a real dropdown menu (BUNDLE template @ off 1451362).
- **Search form**: `(change)=searchTermChanged(chatSearchTerm)`, `(keydown.enter)=onEnterSearchChat(inputValue)`; clear button sets input `.value=""` then `onEnterSearchChat("")` (BUNDLE `X1e`). Extended toolbar (when `showChatToolbarExtended`): Save → `downloadLog('chat')`, Archive → `archiveOptions()` (presenter only), a `#mod-only` checkbox "Show only Moderators messages", a "Group Chat Control" dropdown (`changeChatMode('g'|'p')`), and "Detach Chat".
- **PM tab** → `showPrivateChat()`.
- **Kebab** (`a#dropdownMenuLink.msgMenu`) uses `data-bs-toggle="dropdown"`; jQuery binds `hide.bs.dropdown` on `.msgMenu` (BUNDLE @ off 1348830). Items & handlers per the DOM-structure table. The only modal targets are `data-bs-target="#alert-send-report-modal"` (Alert Send Report) and `data-bs-target="#replyModal"` (Reply anchor).
- **Avatar click** (`div.avatar.pl-1`) → `doUserInfo(msg.uid, msg.rid)`. Default avatar src `https://secure.gravatar.com/avatar/{msg.avt}?d=mm&s=50` when `msg.pic` absent (BUNDLE `kge` / const 45).
- **Username** `(click)` / `(dblclick)` handlers present (mention / user-info; exact fn not fully de-minified). `created-at` shows `msg.t | hh:mm a` with an `ngbTooltip` of the short date, `placement="top"`.
- **Reaction badge** (`span.badge.chat-reaction`): text = `{{emoji}} {{count}}`; `(click)=addRemoveReaction(key)`; `[ngClass]={'chat-reaction-added': value.clickedBy.includes(hashEmail)}` (BUNDLE `Rge`/`c_e`). "Add Reaction" kebab item opens an emoji-mart popover (`ngbPopover`, `(shown)=onPopoverOpen`, `(hidden)=onPopoverClose`).
- **Webinar mode**: renders `div.px-1.webinarMode " Webinar Mode "` (BUNDLE `Z1e`); help tooltip text "In webinar mode users only see their own chat messages, while Presenters see everyones messages..." (BUNDLE const 54). `.webinarMode{background-color:#fff;color:#000;width:100%}`.

---

## Honest gaps

- **cssVariables in captures carry only 2 keys** — the full live `:root`/`.lightTheme` token map was NOT captured. Every token value here is either a *resolved computed value* off a real element (authoritative) or the BOOT default (labeled). Where LIVE and BOOT disagree (`--msgs-bg`, `--username-color`, `--modal-active-tab-bg-color`, header bg), I used the LIVE computed value per precedence.
- **Exact token the room overrides for the header background (#0a6db1)** is not isolated — `.chatHeader` reads `--msgs-header-bg` (BOOT `#111`) and `.chat-header` reads `--chat-header-bg`; the room clearly overrides one/both to the blue, but the capture doesn't expose which variable holds it. The *resolved* `nav.chatHeader` bg `rgb(10,109,177)` is certain.
- **`created-at` color**: the captured element shows `rgb(232,232,232)`, which is a per-message `styleF`/`invertTxtColor` inline override, not the base `--date-color` (BOOT `#8394a9`). The scoped rule is `color:var(--date-color)`; the base resolved value was not isolated from an un-inverted message.
- **`app-st-compactmessage`** deltas are documented, but the live room renders `app-st-message` (35px avatar / fw-900). No capture of the compact variant in these rooms.
- **`@keyframes ..._slideInRight`** is defined but its `animation:` trigger is not present in the extracted rules — not shown where/when it applies.
- **`.options` / `.bubble-box-*` hover toolbar** exists in the message CSS but no matching markup is emitted by the current templates (`Lge`/`p_e` render `.msgMenu` instead) — treated as legacy/dead.
- **No live capture of a rendered reaction in `chat-reaction-added` (activated) state**, the emoji picker popover contents, or the gear "settings" extended toolbar in an open state — those are decoded from templates/global CSS only, not from a computed-style capture.
- **Staff/moderator role nuance**: the code exposes `isP` (presenter), `globals.isPresenter`, `isLimitedPresenter`, `canDeleteOwnMsg`, `canDoPublicReply`, `canEditMessage`, `canPM` — a distinct "Moderator" tier is not represented as a separate flag in this component (matches the known 3-tier code gap). The visual staff marker is `.msg-box-adm` bound to `msg.isA`.
