# Reply / Alert-QA / PM (reply-qa-pm)

Scope: the private/public **Reply modal** (`app-reply-modal` → `#replyModal`), the **Alert Q&A modal** (`app-alert-qa-modal` → `#alertQAModal`), the **private-chat PM panel** (`app-privchat` → `#privaChatCompHolder.privChatHolder`) with its composer `#textAreaHolderPM`, and the **all-user PM broadcast modal** (`app-all-user-pmmodal` → `#all-user-pm-modal`) that feeds into the PM system.

Angular component IDs (from live bundle `main.d6f5272aa3783e43.js` and matching `_ngcontent-ng-c*` attrs in `mixed-files/odds-and-ends.html`):
- Reply modal component: `_ngcontent-ng-c1823712792` / `_nghost-ng-c1823712792`
- Alert-QA modal component: `_ngcontent-ng-c698792182` / `_nghost-ng-c698792182`
- Privchat (PM panel) component: `_ngcontent-ng-c3142977328` / `_nghost-ng-c3142977328`
- All shown as children of room host `_ngcontent-ng-c977335924`.

The room runs class **`lightTheme`**; the LIVE `:root` tokens captured in `docs/reference/captures/proroom-full-member.json` → `cssVariables.root` OVERRIDE the boot `:root` in `styles.d622cb9ed2bbc221.css`. Under `.lightTheme` (rule in `styles.d622cb9ed2bbc221.css`): `--textarea-bg: var(--lightTheme-textarea-bg)`, `--textarea-color: var(--lightTheme-textarea-color)`, `--msgs-bg: var(--lightTheme-msgs-bg)`. All other tokens keep their live-`:root` values.

---

## DOM structure

### A. Reply modal — `mixed-files/file18.html` (empty/skeleton) + `odds-and-ends.html` L117920 (identical) + bundle template `selectors:[["app-reply-modal"]],decls:23,vars:4`

```
<app-reply-modal _nghost-ng-c1823712792>
  <div #replyModal.modal.fade tabindex="-1" aria-labelledby="replyLabel" aria-hidden="true">
    <div .modal-dialog>
      <div .modal-content>
        <div .modal-header>
          <h5 #replyLabel.modal-title>
            <span .do-private-reply [innerHTML]>       <!-- bundle const [1,"do-private-reply"],[3,"innerHTML"] -->
              <strong>{{name}}:</strong>                <!-- template idx 6/7 -->
              <div></div>                               <!-- idx 8, holds quoted msg text -->
            </span>
          </h5>
          <button.btn-close.btn-close-white type="button" data-bs-dismiss="modal" aria-label="Close">
        </div>
        <div .modal-body>
          <!-- (emoji ng-template popoverClass, idx 10) -->
          <div .flex-fill.d-flex.mx-0>
            <div .px-0.flex-fill>
              <textarea #textAreaReplyTxt name="txt-area" rows="1" spellcheck="true"
                        placeholder="Type your message here.." class="txt-area form-control border-0">
            </div>
            <div .textAreaBtnsCol.justify-content-center.d-flex.flex-row.align-items-center.justify-content-center.p-0.m-0.text-center>
              <span .textAreaBtns placement="auto" container="body" autoclose="outside" popoverclass="popOverDiv">
                <i .far.fa-smile placement="left" ngbtooltip="Add Emojis">       <!-- emoji popover -->
              </span>
              <span .textAreaBtns>
                <i .fas.fa-image ngbtooltip="Upload an Image" placement="left">   <!-- image upload -->
              </span>
            </div>
          </div>
        </div>
        <div .modal-footer>
          <button.btn.btn-secondary type="button" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</app-reply-modal>
```
Notes: reply modal has ONLY two composer buttons — **emoji** (`far fa-smile`) and **image upload** (`fas fa-image`); NO GIF button (unlike the main chat composer). No role variants in the markup — the same modal is used for every user; the header quote (`.do-private-reply` innerHTML) is populated at runtime from the message being replied to.

### B. Alert-QA modal — `mixed-files/file19.html` + bundle `["id","alertQAModal",...]`

```
<app-alert-qa-modal _nghost-ng-c698792182>
  <div #alertQAModal.fade.modal tabindex="-1" aria-labelledby="alertQALabel"
       aria-hidden="true" data-keyboard="false" data-backdrop="static">
    <div .modal-dialog>
      <div .modal-content>
        <div .modal-header.align-items-start>
          <div .flex-fill>
            <h5 #alertQALabel.modal-title>Q&amp;A for Alert:</h5>
            <div .admin-alert.mt-2>                      <!-- the alert being Q&A'd, mirrors chat-msg layout -->
              <div clas="d-flex flex-column align-items-center w-100">   <!-- NB typo attr `clas` in source -->
                <div .mr-1.d-flex.flex-row-reverse>
                  <div .d-flex.flex-row-reverse.justify-content-center.align-items-start.flex-nowrap.mt-1>
                    <div .avatar.pl-1><img alt="qaMsg.avt" src="https://secure.gravatar.com/avatar/?d=mm&s=50"></div>
                  </div>
                  <div .w-100>
                    <div .d-flex.justify-content-between.align-items-center.w-100>
                      <span .created-at.mr-2 placement="top"></span>
                      <div .d-flex.align-items-center.justify-content-between.flex-nowrap>
                        <strong .username.mx-1></strong>
                      </div>
                    </div>
                    <div .msg-left.text-formated.preText.ml-2.mr-2.p-0></div>   <!-- the alert body -->
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button.btn-close.btn-close-white type="button" data-bs-dismiss="modal" aria-label="Close">
        </div>
        <div .modal-body>
          <div .my-2>There are no questions.</div>       <!-- empty state; question list renders here otherwise -->
        </div>
        <div .modal-footer.flex-nowrap>
          <div #textAreaHolder.d-flex.align-items-center.textSendDiv.flex-fill>
            <div .flex-fill.d-flex.mx-0>
              <div .px-0.flex-fill>
                <textarea #textAreaQATxt name="txt-area" rows="1" spellcheck="true"
                          class="txt-area form-control border-0" placeholder="Type your question here...">
              </div>
              <div .textAreaBtnsCol...>
                <span .textAreaBtns ...><i .far.fa-smile placement="left" ngbtooltip="Add Emojis"></span>
                <span .textAreaBtns><i .fas.fa-image ngbtooltip="Upload an Image" placement="left"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</app-alert-qa-modal>
```
Notes: QA modal is **not dismissable by backdrop/ESC** (`data-backdrop="static"` + `data-keyboard="false"`). The composer footer holder is `#textAreaHolder` (NOT `#textAreaHolderPM`); its textarea is `#textAreaQATxt`; placeholder is `Type your question here...`. Same two-button (emoji+image) composer, no GIF. The `.msg-left.text-formated.preText` classes render the quoted alert body; `.username`/`.created-at` come from the alert author.

### C. PM panel — `mixed-files/file32.html` == `odds-and-ends.html` L119559 (both only ever render the "No active chat" skeleton)

```
<app-privchat #privaChatCompHolder.privChatHolder>
  <div .chat.d-flex.flex-column.h-100 style="overflow-y: hidden">
    <div .bs-component>
      <nav .navbar.navbar-expand-lg.navbar-light.bg-light.chat-nav-pm.p-1.text-white>
        <a .navbar-brand.ml-1.mr-1><i .fas.fa-comments></i></a>
        <ul .nav.ml-auto.flex-nowrap.align-items-center>
          <li .nav-item.dropdown style="position: static">
            <a .nav-link.dropdown-toggle.p-0 aria-haspopup="true" aria-expanded="false">
              <i .fas.fa-cog.chat-header-gear title="Settings"></i>
            </a>
          </li>
          <li .nav-item.ml-2.mr-2><i .fas.fa-times></i></li>      <!-- close panel -->
        </ul>
      </nav>
    </div>
    <div .d-flex.h-100.pc-body>
      <div .flex-fill.p-3.text-center>No active chat</div>          <!-- empty state -->
    </div>
  </div>
</app-privchat>
```

**Active-chat PM composer (bundle template only — NOT rendered in any DOM dump).** From `main.d6f5272aa3783e43.js` privchat consts:
```
["id","textAreaHolderPM",1,"textSendDiv"], [3,"emojiSelect"], [1,"d-flex","mx-0"],
[1,"px-1","webinarMode"], [1,"flex-fill","px-0"],
["name","txt-area","id","textAreaTxtPM","rows","1","spellcheck","true",
 "placeholder","Type your message here...",1,"txt-area","form-control",3,"keyup","paste","focus"],
[1,"justify-content-center","align-items-center","d-flex","flex-row","p-0","m-0","text-center","textAreaBtnsCol"],
["placement","auto","container","body","autoClose","outside","popoverClass","popOverDiv",1,"textAreaBtns",3,"click","ngbPopover"],
["placement","left","ngbTooltip","Add Emojis",1,"far","fa-smile"],
[1,"textAreaBtns"], ["ngbTooltip","Search for GIFs","placement",...]   <!-- PM composer DOES have a GIF button -->
```
So the active PM composer wrapper is `#textAreaHolderPM.textSendDiv`, its textarea is `#textAreaTxtPM` (placeholder `Type your message here...`, events keyup/paste/focus), and unlike Reply/QA it includes a **GIF search** button in addition to emoji + image. It also supports a `webinarMode` variant (`.px-1.webinarMode`). Other privchat scoped classes present in the template but unrendered: `.pc-list` (user list, `flex-basis:220px`), `.pc-logs`, `.pc-active`, `.list-group-item`, `.pc-username`, `.close-tab`, `.user-status-container`/`.user-status-type` (red presence dot), `ul.chatTabs`/`.chatTabs li a`, `.counterBadge`, `.privchatUnread`, `.avatarImg`/`.avatarImg-active`, `.privChatScroller`, `.pmToolbar`, `.giphy-search`.

### D. All-user PM modal — bundle `selectors:[["app-all-user-pmmodal"]],decls:14,vars:3`
```
["id","all-user-pm-modal","tabIndex","-1","role","dialog","aria-labelledby","all-user-pm-modal","aria-hidden","true",1,"modal","fade"],
["role","document",1,"modal-dialog"], [1,"modal-content"], [1,"modal-header"],
["type","button","data-bs-dismiss","modal","aria-label","Close",1,"btn-close","btn-close-white"],
[1,"modal-body"], [1,"text-center","my-4"], [1,"w-100"], [1,"modal-footer","text-center"],
["type","button","data-bs-dismiss","modal",1,"btn","btn-secondary"],
[1,"ml-2","fas","fa-spinner","fa-spin"], [1,"log-body"], [1,"log-messages"],
["logType","pc","isP","isP",3,"msg","prevD","id"], [1,"mt-3"]
// h5 text: "All private ..." (truncated in bundle)
```
Opened from a staff/admin control: `["type","button","data-bs-toggle","modal","data-bs-target","#all-user-pm-modal",1,"btn","btn-block","btn-outline-light"]` with a `fas fa-comment` icon (found twice in bundle, near record/stop controls → admin/presenter surface). It embeds a `logType="pc"` message list.

---

## Scoped CSS (verbatim)

### Reply modal — `_ngcontent-ng-c1823712792` (`odds-and-ends.html` L15555–15691; identical to bundle `_ngcontent-%COMP%` block)
```css
.textAreaBtns[_ngcontent-ng-c1823712792] { padding: 5px; color: var(--dark-gray); }
.custom-file[_ngcontent-ng-c1823712792] { display: none; }
.input-group-text[_ngcontent-ng-c1823712792] { padding: 0; margin: 0; }
.textAreaBtnsCol[_ngcontent-ng-c1823712792] { background-color: var(--textarea-bg) !important; color: var(--dark-gray) !important; }
.textAreaBtns[_ngcontent-ng-c1823712792] { color: var(--textarea-holder-btns-color) !important; }
.textAreaBtns[_ngcontent-ng-c1823712792]:hover { color: var(--textarea-holder-btns-hover-color) !important; cursor: pointer; }
.txt-area[_ngcontent-ng-c1823712792] {
  border-radius: 0; border: 1px solid #ffffff; font-size: 14px; resize: none;
  color: var(--textarea-color) !important; background-color: var(--textarea-bg) !important;
  outline: none; overflow-y: auto; margin-left: 0; margin-right: 0; padding-left: 5px; padding-right: 5px;
}
.txt-area[_ngcontent-ng-c1823712792]:focus { border-color: var(--darker-gray); box-shadow: 1px 1px 1px var(--darker-gray); }
#form-upload-img[_ngcontent-ng-c1823712792] .input-group-text[_ngcontent-ng-c1823712792],
#form-upload-img[_ngcontent-ng-c1823712792] .form-control[_ngcontent-ng-c1823712792] { border-radius: 0; }
.white[_ngcontent-ng-c1823712792] { color: #fff; }
.textAreaBtnSelected[_ngcontent-ng-c1823712792] { background-color: #f1f2f3; }
.bs-popover-top[_ngcontent-ng-c1823712792] > .arrow[_ngcontent-ng-c1823712792]:after,
.bs-popover-auto[x-placement^="top"][_ngcontent-ng-c1823712792] > .arrow[_ngcontent-ng-c1823712792]:after { border-top-color: var(--modal-content-bg-color); }
.giphy-search[_ngcontent-ng-c1823712792] { width: 400px; height: 700px; border: 2px solid var(--modal-content-bg-color); background-color: #fff; overflow: hidden; }
.giphy-search[_ngcontent-ng-c1823712792] .input-group-text[_ngcontent-ng-c1823712792] { border: none; background-color: var(--modal-input-group-bg); }
.giphy-search[_ngcontent-ng-c1823712792] .fa-times[_ngcontent-ng-c1823712792] { font-size: 16.5px; padding: 10px; }
.giphy-search[_ngcontent-ng-c1823712792] .fa-times[_ngcontent-ng-c1823712792]:hover { cursor: pointer; opacity: 0.85; }
.giphy-header[_ngcontent-ng-c1823712792] { padding: 10px; background-color: var(--modal-content-bg-color); }
.search-results[_ngcontent-ng-c1823712792] { overflow-y: auto; height: 100%; padding: 5px; }
.gif-result[_ngcontent-ng-c1823712792] { text-align: center; }
.gif-result[_ngcontent-ng-c1823712792] img[_ngcontent-ng-c1823712792] { cursor: pointer; }
.giphy-search[_ngcontent-ng-c1823712792] li[_ngcontent-ng-c1823712792] { padding: 10px; }
.giphy-search[_ngcontent-ng-c1823712792] li[_ngcontent-ng-c1823712792]:hover { background-color: var(--modal-upload-files-color); }
.giphy-search[_ngcontent-ng-c1823712792] h4[_ngcontent-ng-c1823712792] { color: var(--modal-content-color); text-align: center; }
#textAreaHolder[_ngcontent-ng-c1823712792] { background-color: var(--textarea-bg); border-radius: 8px; padding: 5px; margin: 5px; }
.typing-indicator-container[_ngcontent-ng-c1823712792] { margin: 4px 16px; }
.users-typing[_ngcontent-ng-c1823712792] { color: #90949c; font-size: 12px; }
.users-typing[_ngcontent-ng-c1823712792] em[_ngcontent-ng-c1823712792] { font-weight: 700; }
#textAreaReplyTxt[_ngcontent-ng-c1823712792] { max-height: 300px; width: 100%; }
#textAreaReplyTxt[_ngcontent-ng-c1823712792], .textAreaBtnsCol[_ngcontent-ng-c1823712792] { background-color: var(--textarea-bg); }
img[_ngcontent-ng-c1823712792] { max-width: 100%; }
```
(Note: `.textAreaBtns` is defined twice — the 2nd, `color:var(--textarea-holder-btns-color)!important`, wins the color.)

### Alert-QA modal — `_ngcontent-ng-c698792182` (`odds-and-ends.html` L15694–15882)
```css
#alertQAModal[_ngcontent-ng-c698792182] .modal-dialog[_ngcontent-ng-c698792182] { max-width: 600px !important; overflow-y: initial !important; }
#alertQAModal[_ngcontent-ng-c698792182] .modal-body[_ngcontent-ng-c698792182] { min-height: 330px; max-height: 70vh; height: 100%; overflow-y: auto; }
.preText[_ngcontent-ng-c698792182] { white-space: pre-wrap; }
#textAreaTxt[_ngcontent-ng-c698792182] { max-height: 300px; width: 100%; }
.admin-alert[_ngcontent-ng-c698792182] { border: 1px solid #444; border-radius: 5px; padding: 5px; }
.avatar[_ngcontent-ng-c698792182] { display: inline; }
.avatar[_ngcontent-ng-c698792182] img[_ngcontent-ng-c698792182] { width: 100%; max-width: 50px; height: auto; }
.username[_ngcontent-ng-c698792182] { font-size: 14px; color: #ccc; font-weight: 900; }
.created-at[_ngcontent-ng-c698792182] { font-size: 12px; font-style: italic; color: #ccc; overflow: hidden; font-weight: 600; }
.msg-left[_ngcontent-ng-c698792182] { text-align: left; }
.text-formated[_ngcontent-ng-c698792182] { font-size: 16px; }
.chatNameAvatar[_ngcontent-ng-c698792182] { display: inline; }
.textAreaBtns[_ngcontent-ng-c698792182] { padding: 5px; color: var(--dark-gray); }
.custom-file[_ngcontent-ng-c698792182] { display: none; }
.input-group-text[_ngcontent-ng-c698792182] { padding: 0; margin: 0; }
.textAreaBtnsCol[_ngcontent-ng-c698792182] { background-color: var(--textarea-bg) !important; color: var(--dark-gray) !important; }
.textAreaBtns[_ngcontent-ng-c698792182] { color: var(--textarea-holder-btns-color) !important; }
.textAreaBtns[_ngcontent-ng-c698792182]:hover { color: var(--textarea-holder-btns-hover-color) !important; cursor: pointer; }
.txt-area[_ngcontent-ng-c698792182] {
  border-radius: 0; border: 1px solid #ffffff; font-size: 14px; resize: none;
  color: var(--textarea-color) !important; background-color: var(--textarea-bg) !important;
  outline: none; overflow-y: auto; margin-left: 0; margin-right: 0; padding-left: 5px; padding-right: 5px;
}
.txt-area[_ngcontent-ng-c698792182]:focus { border-color: var(--darker-gray); box-shadow: 1px 1px 1px var(--darker-gray); }
#form-upload-img[_ngcontent-ng-c698792182] .input-group-text[_ngcontent-ng-c698792182],
#form-upload-img[_ngcontent-ng-c698792182] .form-control[_ngcontent-ng-c698792182] { border-radius: 0; }
.white[_ngcontent-ng-c698792182] { color: #fff; }
.textAreaBtnSelected[_ngcontent-ng-c698792182] { background-color: #f1f2f3; }
.bs-popover-top[_ngcontent-ng-c698792182] > .arrow[_ngcontent-ng-c698792182]:after,
.bs-popover-auto[x-placement^="top"][_ngcontent-ng-c698792182] > .arrow[_ngcontent-ng-c698792182]:after { border-top-color: var(--modal-content-bg-color); }
.giphy-search[_ngcontent-ng-c698792182] { width: 400px; height: 700px; border: 2px solid var(--modal-content-bg-color); background-color: #fff; overflow: hidden; }
.giphy-search[_ngcontent-ng-c698792182] .input-group-text[_ngcontent-ng-c698792182] { border: none; background-color: var(--modal-input-group-bg); }
.giphy-search[_ngcontent-ng-c698792182] .fa-times[_ngcontent-ng-c698792182] { font-size: 16.5px; padding: 10px; }
.giphy-search[_ngcontent-ng-c698792182] .fa-times[_ngcontent-ng-c698792182]:hover { cursor: pointer; opacity: 0.85; }
.giphy-header[_ngcontent-ng-c698792182] { padding: 10px; background-color: var(--modal-content-bg-color); }
.search-results[_ngcontent-ng-c698792182] { overflow-y: auto; height: 100%; padding: 5px; }
.gif-result[_ngcontent-ng-c698792182] { text-align: center; }
.gif-result[_ngcontent-ng-c698792182] img[_ngcontent-ng-c698792182] { cursor: pointer; }
.giphy-search[_ngcontent-ng-c698792182] li[_ngcontent-ng-c698792182] { padding: 10px; }
.giphy-search[_ngcontent-ng-c698792182] li[_ngcontent-ng-c698792182]:hover { background-color: var(--modal-upload-files-color); }
.giphy-search[_ngcontent-ng-c698792182] h4[_ngcontent-ng-c698792182] { color: var(--modal-content-color); text-align: center; }
#textAreaHolder[_ngcontent-ng-c698792182] { background-color: var(--textarea-bg); border-radius: 8px; padding: 5px; margin: 5px; }
.typing-indicator-container[_ngcontent-ng-c698792182] { margin: 4px 16px; }
.users-typing[_ngcontent-ng-c698792182] { color: #90949c; font-size: 12px; }
.users-typing[_ngcontent-ng-c698792182] em[_ngcontent-ng-c698792182] { font-weight: 700; }
#textAreaQATxt[_ngcontent-ng-c698792182] { max-height: 300px; width: 100%; }
#textAreaQATxt[_ngcontent-ng-c698792182], .textAreaBtnsCol[_ngcontent-ng-c698792182] { background-color: var(--textarea-bg); }
img[_ngcontent-ng-c698792182] { max-width: 100%; }
```

### Privchat / PM panel — `_ngcontent-ng-c3142977328` (`odds-and-ends.html` L16664–16963; PM-relevant subset)
```css
.navbar[_ngcontent-ng-c3142977328] { font-size: 12px; padding: 2px; }
.chatDisabled[_ngcontent-ng-c3142977328] { height: 40px; min-height: 40px; width: 100%; background-color: #aaa; color: #000; }
.webinarMode[_ngcontent-ng-c3142977328] { background-color: #aaa; color: #000; width: 100%; }
.chat-header-nav[_ngcontent-ng-c3142977328] { font-size: 12px; min-height: 30px; }
.chat-header-nav[_ngcontent-ng-c3142977328] .navbar-brand[_ngcontent-ng-c3142977328],
.chat-header-gear[_ngcontent-ng-c3142977328] { font-size: 16px; }
.chat-header[_ngcontent-ng-c3142977328] { background-color: var(--chat-header-bg) !important; color: var(--chat-header-color) !important; }
.textAreaBtns[_ngcontent-ng-c3142977328] { padding: 5px; color: var(--textarea-holder-btns-color) !important; }
.textAreaBtns[_ngcontent-ng-c3142977328]:hover { color: var(--textarea-holder-btns-hover-color) !important; cursor: pointer; }
.custom-file[_ngcontent-ng-c3142977328] { display: none; }
.input-group-text[_ngcontent-ng-c3142977328] { padding: 0; margin: 0; }
.textAreaBtnsCol[_ngcontent-ng-c3142977328] { background-color: var(--textarea-bg) !important; color: var(--dark-gray) !important; }
.txt-area[_ngcontent-ng-c3142977328] {
  border-radius: 0; border: 1px solid #ffffff; font-size: 14px; resize: none;
  color: var(--textarea-color) !important; background-color: var(--textarea-bg) !important;
  outline: none; overflow-y: auto; margin-left: 0; margin-right: 0; padding-left: 5px; padding-right: 5px; word-wrap: break-word;
}
.txt-area[_ngcontent-ng-c3142977328]:focus { box-shadow: 1px 1px 1px var(--darker-gray); }
.chat-nav-pm[_ngcontent-ng-c3142977328] { align-items: center; flex-wrap: nowrap; min-height: 40px; background-color: var(--msgs-header-bg) !important; }
.chat-nav-pm[_ngcontent-ng-c3142977328] .dropdown-menu[_ngcontent-ng-c3142977328] { background-color: var(--msgs-header-bg); border: none; border-radius: 0 0 0 5px; }
.chat-nav-pm[_ngcontent-ng-c3142977328] .nav-item[_ngcontent-ng-c3142977328],
.chat-nav-pm[_ngcontent-ng-c3142977328] .btn[_ngcontent-ng-c3142977328],
.chat-nav-pm[_ngcontent-ng-c3142977328] .input-group-append[_ngcontent-ng-c3142977328] { cursor: pointer; }
.pc-body[_ngcontent-ng-c3142977328] { background-color: #f1f1f1; overflow: hidden; }
.pc-list[_ngcontent-ng-c3142977328] { flex-basis: 220px; height: 100%; overflow: hidden auto; padding: 0 1px; }
.pc-active[_ngcontent-ng-c3142977328] { background-color: #f9f9f9; }
.list-group-item[_ngcontent-ng-c3142977328] { padding: 10px 3px; border-bottom: 1px solid #eee; text-align: left; margin-top: 1px; }
.pc-logs[_ngcontent-ng-c3142977328] { flex: 1; height: 100%; }
.chatSearchTerm[_ngcontent-ng-c3142977328] { height: inherit; }
.pc-username[_ngcontent-ng-c3142977328] { white-space: nowrap; max-width: 135px; overflow: hidden; text-overflow: ellipsis; display: inline-block; vertical-align: middle; }
.close-tab[_ngcontent-ng-c3142977328] { cursor: pointer; padding: 2px 5px; }
.user-status-container[_ngcontent-ng-c3142977328] { position: relative; }
.user-status-type[_ngcontent-ng-c3142977328] { padding: 0.5px 4px !important; border-radius: 50%; position: absolute; bottom: -5px; left: 26px; background-color: #dc3545; }
#textAreaHolderPM[_ngcontent-ng-c3142977328] { background-color: var(--textarea-bg); border-radius: 8px; padding: 5px; margin: 0 5px; }
.privchatUnread[_ngcontent-ng-c3142977328] { background-color: red !important; }
.chatTabs[_ngcontent-ng-c3142977328] .nav-item[_ngcontent-ng-c3142977328] .active[_ngcontent-ng-c3142977328] { color: var(--tabs-color); background-color: var(--tab-active-bg); border-color: var(--tabs-border-color); }
.chatTabs[_ngcontent-ng-c3142977328] li[_ngcontent-ng-c3142977328] a[_ngcontent-ng-c3142977328] { font-weight: 700; font-size: 12px; padding-left: 5px; padding-right: 5px; margin-right: 5px; color: #d3d3d3; margin-bottom: 0; padding-bottom: 5px; }
ul.chatTabs[_ngcontent-ng-c3142977328] { margin-bottom: 0; border-color: var(--tabs-border-color); }
.chatTabs[_ngcontent-ng-c3142977328] li[_ngcontent-ng-c3142977328] a[_ngcontent-ng-c3142977328]:hover { border-color: var(--tab-active-bg); border-radius: 3px; }
.counterBadge[_ngcontent-ng-c3142977328] { top: -5px; position: relative; }
.textAreaBtnSelected[_ngcontent-ng-c3142977328] { background-color: #f1f2f3; }
.avatarImg[_ngcontent-ng-c3142977328] { width: 32px; height: 32px; margin-right: 5px; object-fit: cover; }
.avatarImg-active[_ngcontent-ng-c3142977328] { width: 25px; height: 25px; }
.privChatScroller[_ngcontent-ng-c3142977328] { background-color: var(--msgs-bg); }
.pmToolbar[_ngcontent-ng-c3142977328] { background-color: var(--msgs-header-bg); color: var(--msgs-header-color); }
```
(Privchat `.giphy-search` block is identical to the modal blocks except `height: 400px` instead of `700px`.)

---

## Global CSS (verbatim, only rules that win)

From `styles.d622cb9ed2bbc221.css`. Computed values (see next section) confirm which of the stacked Darkly/BS5 rules win.

App override (beats Darkly base — sets modal chrome to the navy token):
```css
.modal-content { background-color: var(--modal-content-bg-color); color: var(--modal-content-color); }
```
BS5 `.modal-content` (wins geometry: flex column, 8px radius, thin translucent border, full width):
```css
.modal-content { position: relative; display: flex; flex-direction: column; width: 100%;
  color: var(--bs-body-color); pointer-events: auto; background-color: var(--bs-modal-bg);
  background-clip: padding-box; border: var(--bs-modal-border-width) solid var(--bs-modal-border-color);
  border-radius: var(--bs-modal-border-radius); outline: 0; }
```
BS5 `.modal-header` / `.modal-footer` / `.modal-title` / `.modal-body` (win — resolved computed proves BS5, not Darkly BS4):
```css
.modal-header { display: flex; flex-shrink: 0; align-items: center; padding: var(--bs-modal-header-padding);
  border-bottom: var(--bs-modal-header-border-width) solid var(--bs-modal-header-border-color);
  border-top-left-radius: var(--bs-modal-inner-border-radius); border-top-right-radius: var(--bs-modal-inner-border-radius); }
.modal-footer { display: flex; flex-shrink: 0; flex-wrap: wrap; align-items: center; justify-content: flex-end;
  padding: calc(var(--bs-modal-padding) - var(--bs-modal-footer-gap) * .5); background-color: var(--bs-modal-footer-bg);
  border-top: var(--bs-modal-footer-border-width) solid var(--bs-modal-footer-border-color);
  border-bottom-right-radius: var(--bs-modal-inner-border-radius); border-bottom-left-radius: var(--bs-modal-inner-border-radius); }
.modal-title { margin-bottom: 0; line-height: var(--bs-modal-title-line-height); }
.modal-body { position: relative; flex: 1 1 auto; padding: var(--bs-modal-padding); }
.modal-body { overflow-y: auto; }   /* app rule */
.modal-dialog { max-width: 500px; margin: 1.75rem auto; }   /* @media (min-width:576px) */
```
(Note: alert-QA scoped rule `#alertQAModal .modal-dialog{max-width:600px!important}` overrides the 500px for the QA modal only. Header alignment for QA is overridden inline by `.modal-header.align-items-start`.)

BS5 close button + white filter (win):
```css
.btn-close { box-sizing: content-box; width: 1em; height: 1em; padding: .25em; color: var(--bs-btn-close-color);
  background: transparent var(--bs-btn-close-bg) center/1em auto no-repeat; border: 0; border-radius: .375rem; opacity: var(--bs-btn-close-opacity); }
.btn-close-white, [data-bs-theme=dark] .btn-close { filter: var(--bs-btn-close-white-filter); }   /* invert(1) grayscale(100%) brightness(200%) */
.btn-close:hover { color: var(--bs-btn-close-color); text-decoration: none; opacity: var(--bs-btn-close-hover-opacity); }
```
BS5 `.btn-secondary` (wins — computed bg `#6c757d`, not Darkly `#444`):
```css
.btn-secondary { --bs-btn-color:#fff; --bs-btn-bg:#6c757d; --bs-btn-border-color:#6c757d;
  --bs-btn-hover-color:#fff; --bs-btn-hover-bg:#5c636a; --bs-btn-hover-border-color:#565e64;
  --bs-btn-active-color:#fff; --bs-btn-active-bg:#565e64; --bs-btn-active-border-color:#51585e; ... }
```
Modal transition / backdrop (BS5):
```css
.modal.fade .modal-dialog { transition: transform .3s ease-out; transform: translateY(-50px); }
.modal.show .modal-dialog { transform: none; }
.fade { transition: opacity .15s linear; }
.modal-backdrop { --bs-backdrop-zindex:1050; --bs-backdrop-bg:#000; --bs-backdrop-opacity:.5;
  position: fixed; top: 0; left: 0; z-index: var(--bs-backdrop-zindex); width: 100vw; height: 100vh; background-color: var(--bs-backdrop-bg); }
```
PM panel navbar uses Bootstrap `.navbar.bg-light.navbar-light` base but scoped `.chat-nav-pm{background-color:var(--msgs-header-bg)!important}` overrides `bg-light`. `.btn-block`/`.btn-outline-light` (BS) style the all-user-pm trigger button.

---

## Resolved values

Live-room token resolution (`.lightTheme` map + `cssVariables.root` in `proroom-full-member.json`):

| Token | Resolves to | Source |
|---|---|---|
| `--textarea-bg` (lightTheme) | `#fff` | `.lightTheme{--textarea-bg:var(--lightTheme-textarea-bg)}` → `--lightTheme-textarea-bg:#fff` |
| `--textarea-color` (lightTheme) | `#676767` (member root) / `#555` (styles.css `:root`) | root token `--lightTheme-textarea-color`; member capture `#676767`, boot `:root` `#555` — capture wins |
| `--textarea-holder-btns-color` | `#676767` | member `cssVariables.root` (boot `:root` default is `#bbb`; live overrides) |
| `--textarea-holder-btns-hover-color` | `#0a6db1` | member `cssVariables.root` |
| `--dark-gray` | `#aaa` | `:root` |
| `--darker-gray` | `#aaa6a6` | `:root` |
| `--modal-content-bg-color` | `#103d5c` (navy) | member `cssVariables.root` (boot `:root` default `#303030`; live overrides) |
| `--modal-content-color` | `#f4f4f4` | member `cssVariables.root` |
| `--modal-input-group-bg` | `#0a6db1` | member `cssVariables.root` |
| `--modal-upload-files-color` | `#0a6db1` | member `cssVariables.root` |
| `--msgs-header-bg` | `#0a6db1` | member `cssVariables.root` |
| `--msgs-header-color` | `#fff` | member `cssVariables.root` |
| `--msgs-bg` (lightTheme) | `#fff` | `.lightTheme{--msgs-bg:var(--lightTheme-msgs-bg)}` → `#fff` |
| `--tabs-color` | `#fff` | member `cssVariables.root` |
| `--tab-active-bg` | `#45a2ff` | member `cssVariables.root` |
| `--tabs-border-color` | `#0a6db1` | member `cssVariables.root` |

Computed styles for the **Reply modal** (from `proroom-all-admin.json` → `states["modal:replyModal"]`, the only captured live state of this surface; modal chrome is Bootstrap + navy tokens, identical across roles):

| Element | Property | Computed value |
|---|---|---|
| `.modal-dialog` | rect | 500 × 226, centered (x 771, y 28) |
| `.modal-content` | background-color | `rgb(16, 61, 92)` = `#103d5c` |
| `.modal-content` | border | `1px solid rgba(0,0,0,0.176)` (BS5 `--bs-modal-border-color`) |
| `.modal-content` | border-radius | `8px` |
| `.modal-content` | color | `rgb(244,244,244)` = `#f4f4f4` |
| `.modal-content` | font | `"Open Sans", sans-serif` 16px / 300 |
| `.modal-header` | padding | `16px` (1rem) |
| `.modal-header` | border-bottom | `0px` (BS5 `--bs-modal-header-border-width:0` here) |
| `.modal-header` | justify/align | `space-between` / `center` |
| `.modal-header` | height | `85.5px` |
| `h5#replyLabel.modal-title` | font-size / weight | `20px` / `500` (BS5 wins over Darkly 18px/700) |
| `h5#replyLabel.modal-title` | line-height | `30px` |
| `.do-private-reply` span | display / font | `inline`, 15px / 500, color `#f4f4f4` |
| `.do-private-reply strong` | font-weight | `700` |
| `.do-private-reply > div` (quote) | display / font | `block`, 15px / 500 |
| `#textAreaReplyTxt` | background-color | `rgb(255,255,255)` = `#fff` |
| `#textAreaReplyTxt` | color | `rgb(103,103,103)` = `#676767` |
| `#textAreaReplyTxt` | font-size | `14px`, line-height 21px |
| `#textAreaReplyTxt` | border | `0px` (`.border-0` util removes the scoped `1px #fff`) |
| `#textAreaReplyTxt` | resize | `none`; white-space `pre-wrap`; overflow-y `auto` |
| `#textAreaReplyTxt` | min/max-height | min `35px`, max `300px` (scoped `max-height:300px`) |
| `#textAreaReplyTxt` | padding | `6px 5px` |
| `#textAreaReplyTxt` | transition | `border-color .15s, box-shadow .15s` (BS form-control) |
| `.textAreaBtnsCol` | background-color | `rgb(255,255,255)` = `#fff` (`var(--textarea-bg)`) |
| `.textAreaBtnsCol` | color | `rgb(170,170,170)` = `#aaa` (`var(--dark-gray)`) |
| `.textAreaBtnsCol` | display / justify / align | `flex` / `center` / `center`; 51.5 × 35 |
| `span.textAreaBtns` | color | `rgb(103,103,103)` = `#676767` (`--textarea-holder-btns-color` !important wins) |
| `span.textAreaBtns` | padding | `5px` |
| `i.far.fa-smile` | size / weight | 15.5 × 16, font-weight 400 (regular FA) |
| `i.fas.fa-image` | size / weight | 16 × 16, font-weight 900 (solid FA) |
| `.modal-footer` | padding | `12px` (BS5); border-top `1px solid rgb(69,162,255)` = `#45a2ff` |
| `.modal-footer` | justify / align | `flex-end` / `center` |
| `button.btn-secondary` | background-color | `rgb(108,117,125)` = `#6c757d` |
| `button.btn-secondary` | color | `#fff`; border `1px solid #6c757d`; radius 6px; 66.9 × 38 |
| `button.btn-close-white` | color / opacity | `rgb(0,0,0)` base, opacity `0.5`; 16 × 16 content-box, padding 8px; filter `invert(1) grayscale(100%) brightness(200%)` renders it white |

(The footer border color `#45a2ff` = the `--modal-tabs-border-color`/`--bs-modal-footer-border-color` resolved in this room; the header border-bottom-width resolved to 0 in the capture.)

Alert-QA & PM composer resolved (no live capture — resolved from scoped CSS + tokens):
| Element | Property | Resolved |
|---|---|---|
| `#alertQAModal .modal-dialog` | max-width | `600px !important` |
| `#alertQAModal .modal-body` | min-height / max-height / overflow | `330px` / `70vh` / `auto` |
| `.admin-alert` | border | `1px solid #444`, radius 5px, padding 5px |
| `.username` (QA) | color / weight / size | `#ccc` / `900` / `14px` |
| `.created-at` (QA) | color / style / size | `#ccc` / italic / `12px`, weight 600 |
| `.text-formated` (QA) | font-size | `16px` |
| `.preText` (QA) | white-space | `pre-wrap` |
| `#textAreaQATxt` / `#textAreaReplyTxt` | max-height / width | `300px` / `100%` |
| `#textAreaHolder` (QA & reply) | bg / radius / padding / margin | `#fff` / `8px` / `5px` / `5px` |
| `#textAreaHolderPM` (PM) | bg / radius / padding / margin | `#fff` (`var(--textarea-bg)`) / `8px` / `5px` / `0 5px` |
| `.chat-nav-pm` (PM navbar) | bg / min-height | `#0a6db1` `!important` / `40px` |
| `.pc-body` (PM) | bg | `#f1f1f1` |
| `.pc-list` (PM) | flex-basis | `220px` |
| `.chatTabs li a` (PM) | color / weight / size | `#d3d3d3` / `700` / `12px` |
| `.chatTabs .nav-item .active` (PM) | color / bg / border | `#fff` / `#45a2ff` / `#0a6db1` |
| `.user-status-type` (PM presence dot) | bg | `#dc3545` (red), circular, `bottom:-5px;left:26px` |
| `.privchatUnread` (PM) | bg | `red !important` |
| `.pmToolbar` (PM) | bg / color | `#0a6db1` / `#fff` |
| `.avatarImg` / `.avatarImg-active` (PM) | size | 32×32 / 25×25, object-fit cover |

---

## States & effects

- **Textarea focus** (all three): `.txt-area:focus{box-shadow:1px 1px 1px var(--darker-gray)}` → `1px 1px 1px #aaa6a6`. Reply & QA additionally set `border-color:var(--darker-gray)` on focus (PM does not). Base transition (BS form-control): `border-color .15s ease-in-out, box-shadow .15s ease-in-out`. `outline:none`.
- **Composer button hover** (`.textAreaBtns:hover`, all three): `color:var(--textarea-holder-btns-hover-color)!important` → `#0a6db1`, `cursor:pointer`.
- **Selected composer button**: `.textAreaBtnSelected{background-color:#f1f2f3}` (toggled when a popover panel is open).
- **PM chat tab hover**: `.chatTabs li a:hover{border-color:var(--tab-active-bg);border-radius:3px}` → border `#45a2ff`.
- **GIF search list hover** (`.giphy-search li:hover`): `background-color:var(--modal-upload-files-color)` → `#0a6db1`; `.giphy-search .fa-times:hover{cursor:pointer;opacity:.85}`.
- **Close (X) button**: `.btn-close` opacity `0.5` → hover `0.75` (`--bs-btn-close-hover-opacity`); `.btn-close-white` filter inverts it to white.
- **Modal enter/leave transition**: `.modal.fade .modal-dialog{transition:transform .3s ease-out;transform:translateY(-50px)}` → on `.show`: `transform:none`; backdrop `.fade{transition:opacity .15s linear}` opacity 0→.5, `#000`.
- **Hidden-until conditions**:
  - Reply modal shown by `fo("#replyModal").modal("show")` (Bootstrap), triggered by a chat message's dropdown "Reply" item (`data-bs-target="#replyModal"`, `fas fa-comment` icon).
  - Alert-QA modal shown by `yi("#alertQAModal").modal("show")` when a `doQA`-type event carries the alert `_id`; it is `data-backdrop="static"` + `data-keyboard="false"` so it can't be dismissed by clicking the backdrop or pressing ESC — only the X or Close button (`data-bs-dismiss="modal"`).
  - PM panel is normally the "No active chat" skeleton; the active-chat body (`pc-list`, `chatTabs`, `#textAreaHolderPM`) renders only when a private conversation is open — never captured in any DOM dump.
  - All-user-PM modal (`#all-user-pm-modal`) toggled by `data-bs-toggle="modal"` on a `btn-outline-light btn-block` control on a staff/admin surface; shows a `fa-spinner fa-spin` while sending.
- **Typing indicator** (reply & QA scoped): `.typing-indicator-container{margin:4px 16px}`, `.users-typing{color:#90949c;font-size:12px}`, `.users-typing em{font-weight:700}` — shown while the other party types.
- **PM unread**: `.privchatUnread{background-color:red!important}` badge / `.counterBadge{top:-5px;position:relative}`.

---

## Behavior

From `main.d6f5272aa3783e43.js`:

- **Reply header** is `[innerHTML]`-bound: `<span class="do-private-reply"><strong>${name}:</strong> ${quotedText}</span>`. The same HTML string is also used as the title of the bootbox `doReply` dialog ("Choose between private or public reply.") and `doPrivateReply` (a bootbox textarea prompt). The `#replyModal` path is the in-app reply.
- **Reply textarea** `#textAreaReplyTxt`: auto-expands on `input` (`onAutoExpand`/`autoExpand`); Enter submits, Shift/Alt+Enter inserts a newline; emoji picker inserts `e.emoji.native` into the value. Sending calls `appService.sendChatReply(channel, msg, quotedTxt, name, msgId, uid)` then `fo("#replyModal").modal("hide")` and clears the textarea, then emits `scrollChatLogToBottom`. Empty/whitespace-only input is rejected (`if(!e) return !1`). Image path: uploads to imgur, appends URL to `imggurUploadTxt`, sends via `sendChatReply`, then hides the modal. Emoji button = `ngbPopover` (autoclose outside, `popOverDiv`); image button = click → file upload.
- **Alert-QA**: opening event carries the alert `_id` → sets `modalId`, shows `#alertQAModal`, clears `#textAreaQATxt`. `@`-mention support via `doQAMention` (appends `@user `). `#textAreaQATxt` submits a question via `appService.sendAlertQAReply(...)` (whitespace-rejected). Admin can `markAsAnswered(msg)` → `appService.markChatAnswered`. On `hidden.bs.modal` a per-alert handler runs (`yi('.'+e._id).on('hidden.bs.modal', ...)`). Auto-expand + `scrollToBottomQA`. Same emoji/image buttons.
- **PM composer** `#textAreaTxtPM` inside `#textAreaHolderPM.textSendDiv`: events `keyup`, `paste`, `focus`; buttons are emoji popover (`ngbPopover`, "Add Emojis"), **GIF search** ("Search for GIFs" — PM-only, not in Reply/QA), and image upload. `webinarMode` variant applies `.px-1.webinarMode` (grey disabled bar `#aaa`/`#000`). PM navbar: brand `fa-comments`, gear `fa-cog.chat-header-gear` (title "Settings", dropdown), close `fa-times`.
- **All-user PM**: `#all-user-pm-modal` broadcasts a private message to all users; embeds a `logType="pc"` message log (`isP`); footer Close is `btn-secondary`; spinner `fas fa-spinner fa-spin` during send. Opened from a staff/admin `btn-outline-light btn-block` (`fas fa-comment`).
- Tooltips (`ngbTooltip`) with `placement="left"`: "Add Emojis", "Upload an Image", "Search for GIFs" (PM). Reply/QA emoji popover uses `container="body"`, `autoclose="outside"`.

---

## Honest gaps

1. **No live computed capture for the Alert-QA modal or the PM panel** — only the Reply modal has a captured state (`proroom-all-admin.json` → `modal:replyModal`). QA/PM resolved values are derived from scoped CSS + the live tokens, not from a real computed capture. QA-modal geometry (600px dialog, 330px min-body) and the active PM composer are unverified against a rendered screenshot.
2. **The active-chat PM panel is never rendered in any DOM dump** — every capture (`file32.html`, `odds-and-ends.html` L119559) shows only the "No active chat" skeleton. The `#textAreaHolderPM` / `#textAreaTxtPM` / `pc-list` / `chatTabs` / `pmToolbar` / `privChatScroller` markup is reconstructed from the bundle template `consts` array only — exact nesting, tab labels, and the GIF/image button order are inferred from attr sequences, not seen rendered.
3. **`.do-private-reply` has no CSS rule anywhere** — it appears only as a class in markup (bundle + `odds-and-ends.html` L117947); its computed appearance is entirely inherited from `.modal-title` (20px/500, `#f4f4f4`) with the `<strong>` bolded to 700. No border/quote-block styling exists on it despite the name.
4. **Header quote content is runtime-only** — the `<strong>name:</strong> <div>text</div>` inside `.do-private-reply` is empty in every static dump; the real replied-to username/message is injected at runtime. No sample values captured.
5. **Alert-QA question-list markup** — only the empty state ("There are no questions.") is captured. The rendered markup of an actual list of submitted questions (and the answered/`markAsAnswered` visual state) is not in any dump.
6. **All-user-PM modal body copy** — the `<h5>` text is truncated in the bundle as "All private …"; full heading and the `text-center my-4` body content are not fully recoverable.
7. **Role variants** — the Reply and QA modals show no role-conditional markup in the captured templates; `markAsAnswered` (QA) and the all-user-PM trigger are admin/staff-gated by logic, but no member-vs-admin DOM difference for these three surfaces was captured to confirm what a member sees hidden.
