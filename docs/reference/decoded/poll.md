# Poll

The floating **Polls** panel component `app-poll-modal`. One Angular component (`_nghost-ng-c3558549984` in `file13.html`; `[_ngcontent-%COMP%]` scoped-CSS namespace + `ɵcmp` def `app-poll-modal` in the bundle at offset ~2.09–2.11M). It is a single draggable/resizable floating window whose body swaps between **three modes** driven by `o.mode`:

- `setup` → template `ETe` (staff/broadcaster: Create-New-Poll + Pre-Canned tabs) — this is what `file13.html` captured.
- `answer` → template `xTe` (member voting card broadcast to the room).
- `results` → template `RTe` (broadcaster's live pie-chart + text responses).

Evidence spine for the mode switch — bundle `main.d6f5272aa3783e43.js`, component `template:function(i,o){…}`:
```
d(10,"div",9),V(11,ETe,51,5,"div",10)(12,xTe,8,1,"div",10)(13,RTe,10,5,"div",11)
… O(11,"setup"==o.mode?11:-1),O(12,"answer"==o.mode?12:-1),O(13,"results"==o.mode?13:-1)
```

---

## DOM structure

### Titlebar (all modes) — from bundle `template:function` + `file13.html` L6–43
Bundle `consts` (authoritative attr source):
```
[0] ["id","pollPanelTitlebar",1,"poll-panel-titlebar"]
[1] [1,"poll-panel-title"]
[2] [1,"poll-panel-controls"]
[3] ["type","button","title","Minimize",1,"poll-panel-btn",3,"click"]        // click → toggleMinimize()
[4] [1,"fa","fa-window-minimize"]
[5] ["type","button","title","Maximize",1,"poll-panel-btn",3,"click"]        // click → toggleMaximize()
[6] [1,"fa",3,"ngClass"]                                                     // ngClass = isMaximized?"fa-window-restore":"fa-window-maximize"
[7] ["type","button","aria-label","Close","title","Close",1,"poll-panel-btn","poll-panel-btn-close",3,"click"] // click → closeModal()
[8] [1,"fa","fa-times"]
```
Literal tree (host + titlebar), `file13.html`:
```html
<app-poll-modal id="pollModalCompHolder" class="pollModalHolder">   <!-- host; note file13 also shows outer wrapper class="pollModalHolder" + id="pollModalCompHolder" -->
  <div id="pollPanelTitlebar" class="poll-panel-titlebar">
    <span class="poll-panel-title">Polls</span>
    <div class="poll-panel-controls">
      <button type="button" title="Minimize" class="poll-panel-btn"><i class="fa fa-window-minimize"></i></button>
      <button type="button" title="Maximize" class="poll-panel-btn"><i class="fa fa-window-maximize"></i></button>
      <button type="button" aria-label="Close" title="Close" class="poll-panel-btn poll-panel-btn-close"><i class="fa fa-times"></i></button>
    </div>
  </div>
  <div class="poll-panel-body" style="display: block"> … mode body … </div>
</app-poll-modal>
```
Note: the maximize `<i>` renders `fa fa-window-maximize` when restored and `fa fa-window-restore` when maximized (ngClass on const `[6]`). `file13.html` captured the restored state (`fa-window-maximize`, L31). The `poll-panel-body` `display` is bound: `Oo("display",o.isMinimized?"none":"block")` — captured `style="display: block"` (L47).

### `setup` mode body (staff) — template `ETe`, `file13.html` L44–214
```html
<div class="poll-panel-body">
  <div class="row">
    <ul id="nav-tab" role="tablist" class="nav nav-tabs">
      <li class="nav-item">
        <a id="sendpolltab" aria-controls="sendpoll" data-bs-target="#sendpoll" role="tab"
           data-bs-toggle="tab" aria-selected="true" class="nav-link active">Create New Poll</a>
      </li>
      <li class="nav-item">
        <a ria-controls="savedPolls" role="tab" data-bs-target="#savedPolls"      <!-- typo "ria-controls" is verbatim in both file13 L72 and bundle const [15] -->
           data-bs-toggle="tab" aria-selected="false" class="nav-link">Pre-Canned Polls</a>
      </li>
    </ul>
    <div class="tab-content w-100 p-2">

      <!-- TAB 1: Create New Poll -->
      <div role="tabpanel" id="sendpoll" class="tab-pane active">
        <div class="p-2">
          <h3><span class="label label-warning">1</span> Enter your poll question:</h3>
          <input type="text" id="pollQuestionTxt"
                 placeholder="Main poll question (i.e. Where do you think the market is going?)"
                 class="form-control …" />          <!-- [ngModel]=pollQuestion -->
          <hr />
          <h3><span class="label label-warning">2</span> Add Choices/Answers:</h3>
          <div class="input-group">
            <input type="text" id="pollChoiceTxt"
                   placeholder="Enter a choice (i.e. Up, Down, Sideways)"
                   class="form-control …" />         <!-- [ngModel]=pollChoice; (keyup.enter)=addChoice() -->
            <span class="input-group-btn">
              <button type="button" class="btn btn-outline-light">   <!-- (click)=addChoice() -->
                <i aria-hidden="true" class="fa fa-plus-circle"></i>&nbsp;&nbsp;Add Choice
              </button>
            </span>
          </div>
          <ol>
            <!-- per-choice <li> repeated from template TTe: -->
            <!-- <li> {{choice}} <button class="btn btn-link pull-right btn-default"> (click)=delChoice($index) <i class="fa fa-minus-circle"></i>&nbsp;Del</button><br clear="both"></li> -->
          </ol>
          <hr />
          <h3><span class="label label-warning">3</span> When done editing, Send your poll</h3>
          <div class="anonymous-poll-container">
            <input type="checkbox" name="anonymous-poll" id="anonymous-poll" title="Anonymous Poll"
                   class="form-check-input …" />       <!-- [ngModel]=anonymousPoll -->
            <label for="anonymous-poll" class="form-check-label">
              Anonymous Poll (Does not show the voting name/email, just results)
            </label>
          </div>
          <div class="poll-panel-footer">
            <button type="button" class="btn btn-outline-light pull-right" style="text-align: center">   <!-- (click)=savePollToStorage() -->
              <i aria-hidden="true" class="fa fa-floppy-o"></i>&nbsp;Save To Canned
            </button>
            <button type="button" class="btn btn-success centered float-right" style="text-align: center">Send Poll</button>  <!-- (click)=sendPoll() -->
          </div>
        </div>
      </div>

      <!-- TAB 2: Pre-Canned Polls -->
      <div role="tabpanel" id="savedPolls" class="tab-pane">
        <p>You can store polls you use often here. Just type the poll on the create poll tab and press "save"</p>
        <ul class="list-group">
          <!-- per-saved-poll <li> from template DTe: -->
          <!-- <li class="list-group-item"> {{q}}
                 <div class="float-right">
                   <button class="btn btn-default btn-sm mr-2"> (click)=deleteSavedPoll($index) <i class="fas fa-trash"></i> Delete</button>
                   <button class="btn btn-primary btn-sm"> (click)=loadSavedPoll($index) Load</button>
                 </div></li> -->
        </ul>
      </div>
    </div>
  </div>
</div>
```
In `file13.html` the `<ol>` (L138) and `<ul class="list-group">` (L207) each contain only `<!---->` (Angular empty-list anchor) — no choices had been added and no canned polls stored at capture time.

### `answer` mode body (MEMBER voting card) — template `xTe`
From bundle `function xTe`:
```
d(0,"div",10)(1,"div",43)(2,"h1"),_(3),u(),T(4,"hr"),d(5,"ol",44),pt(6,kTe,5,1,"li",18,…)
… m(3),Je(e.pollQuestion),m(3),ft(e.pollChoices)
```
consts referenced: `[10] [1,"row"]`, `[43] [1,"p-2",2,"text-align","center"]`, `[44] [2,"text-align","left"]`, `[18] [1,"p-2"]`.
Per-choice `<li>` = template `kTe`:
```
d(0,"li",18),_(1),d(2,"button",45),M("click",…sendAnswer($index)),_(3," \xa0Choose"),u(),T(4,"br",38)
… Ie(" ",e," ")                        // e = the choice text
```
`[45] ["type","button",1,"btn","btn-primary","float-right","btn-sm",2,"color","white",3,"click"]`, `[38] ["clear","both"]`.
Resulting member markup:
```html
<div class="row">
  <div class="p-2" style="text-align:center">
    <h1>{{pollQuestion}}</h1>
    <hr>
    <ol style="text-align:left">
      <li class="p-2"> {{choice}}
        <button type="button" class="btn btn-primary float-right btn-sm" style="color:white">&nbsp;Choose</button>  <!-- (click)=sendAnswer($index) -->
        <br clear="both">
      </li>
      … one <li> per choice …
    </ol>
  </div>
</div>
```

### `results` mode body (staff live results) — template `RTe`
From bundle `function RTe`:
```
d(0,"div",11)(1,"div",46)(2,"h2"),_(3),u(),d(4,"p"),_(5),u(),V(6,MTe,3,0),T(7,"div",47),
V(8,ATe,3,0)(9,PTe,2,0,"button",48)
… Je(pollQuestion); Ie("Total Responses: ",total,""); 0==total?MTe; anonymousPoll?hide ATe; total>0?PTe
```
consts: `[11] [1,"row","w-100",2,"text-align","center"]`, `[46] [1,"p-2","w-100",2,"text-align","center"]`,
`[47] ["id","pollPieChart",2,"display","none","width","100%","height","300px","text-align","center"]`,
`[49] ["src","../../assets/images/ajax-loader.gif"]`, `[50] [2,"margin","10px","text-align","center"]`,
`[51] ["id","responsesTxt","rows","10","maxlength","500","readonly","readonly",1,"form-control",2,"width","100%"]`,
`[48] ["type","button",1,"btn","btn-warning","float-left",2,"text-align","center",3,"click"]`.
```html
<div class="row w-100" style="text-align:center">
  <div class="p-2 w-100" style="text-align:center">
    <h2>{{pollQuestion}}</h2>
    <p>Total Responses: {{total}}</p>
    <!-- if total==0: MTe → <img src="../../assets/images/ajax-loader.gif"><p style="margin:10px;text-align:center">Waiting for results to come in...Please Wait...</p> -->
    <div id="pollPieChart" style="display:none;width:100%;height:300px;text-align:center"></div>
    <!-- if !anonymousPoll: ATe → <hr><textarea id="responsesTxt" rows="10" maxlength="500" readonly class="form-control" style="width:100%"></textarea><hr> -->
    <!-- if total>0: PTe → <button class="btn btn-warning float-left" style="text-align:center"> (click)=postResults() Post Results</button> -->
  </div>
</div>
```

### Role variants
- **Staff / poll-sender** (`senderUID == globals.user.userXrefID`, `mode` starts `setup`): sees titlebar + `setup` tabs; after `sendPoll()` the component flips to `mode="results"` and shows the pie/response panel. Close on a non-setup poll they own prompts "Closing this window, will end the poll." and fires `pollDone`.
- **Member / voter** (`mode="answer"`, delivered via `doPollModal` with `data.q`/`data.choices`): sees the voting card (`h1` question + `Choose` buttons). No tabs, no create/results UI. After one `sendAnswer`, `answered=true` (single vote), `mode="done"`, panel closes.
- There is **no** presenter-specific variant in the evidence — the split is sender vs everyone-else, keyed on `mode`/`senderUID`, not on a role string.

---

## Scoped CSS (verbatim)

All from `main.d6f5272aa3783e43.js`, the `styles:[…]` array of the `app-poll-modal` `ɵcmp` (namespace `[_ngcontent-%COMP%]`). Complete, in file order:

```css
.pollModalHolder[_ngcontent-%COMP%]{display:none;position:fixed;left:50%;top:50%;margin:0 auto;z-index:501;border:1px solid rgb(133,133,133);border-radius:4px;background-color:#1e1e1e;width:580px;height:553px;max-width:calc(100vw - 100px)!important;max-height:calc(100vh - 50px)!important;font-size:14px;box-shadow:0 4px 20px #00000080;overflow:visible;padding:10px}
.poll-panel-titlebar[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background-color:#2c2c2c;border-bottom:1px solid #555;cursor:move;user-select:none;-webkit-user-select:none}
.poll-panel-title[_ngcontent-%COMP%]{font-weight:700;font-size:14px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.poll-panel-controls[_ngcontent-%COMP%]{display:flex;gap:6px;flex-shrink:0}
.poll-panel-btn[_ngcontent-%COMP%]{background:transparent;border:1px solid #666;color:#ccc;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:3px;cursor:pointer;font-size:12px;padding:0}
.poll-panel-btn[_ngcontent-%COMP%]:hover{background-color:#444;color:#fff}
.poll-panel-btn-close[_ngcontent-%COMP%]:hover{background-color:#c0392b;color:#fff}
.poll-panel-body[_ngcontent-%COMP%]{padding:10px;overflow-x:hidden;overflow-y:auto;height:calc(100% - 40px);color:#ddd}
.poll-panel-footer[_ngcontent-%COMP%]{display:flex;justify-content:flex-end;gap:8px;padding-top:10px}
#sendpoll[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{font-size:20px}
.nav-tabs[_ngcontent-%COMP%]{width:100%;margin:0;display:flex;align-items:center;justify-content:center}
#responsesTxt[_ngcontent-%COMP%]{max-height:300px;overflow-y:auto}
.anonymous-poll-container[_ngcontent-%COMP%]{margin:8px 0 8px 20px}
.form-check-input[_ngcontent-%COMP%]{-webkit-appearance:none;-o-appearance:none;appearance:none;height:20px;width:20px;transition:all .15s ease-out 0s;background-color:var(--light-gray);border:none;color:var(--white);cursor:pointer;display:inline-block;margin-right:.5rem;outline:none;position:relative;z-index:1000;border-radius:50%;margin-top:0}
.form-check-input[_ngcontent-%COMP%]:checked{background-color:var(--checkbox-bg-color)}
.form-check-label[_ngcontent-%COMP%]:hover{cursor:pointer;opacity:.85}
.input-group-btn[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]{border-radius:0 6px 6px 0}
.nav-link.active[_ngcontent-%COMP%], .nav-link.active[_ngcontent-%COMP%]:hover{color:#000!important}
```

Note: `.pollModalHolder` is defined **once** in this component; the `%COMP%` namespace is `_ngcontent-ng-c3558549984` at render (`file13.html`). The `poll-active-blink` / `poll-active-indicator` / `@keyframes poll-pulse` rules (below) live in a **different** component (`_ngcontent-ng-c1922465750`, the chat/alert component in `odds-and-ends.html` L17221-17237) — a chat-toolbar "poll is live" indicator, not part of `app-poll-modal`, driven by the `pollActive` gui event this component emits:
```css
.poll-active-blink[_ngcontent-%COMP%]{color:#f39c12!important;animation:_ngcontent-%COMP%_poll-pulse 1.5s ease-in-out infinite}
.poll-active-indicator[_ngcontent-%COMP%]{color:#f39c12!important}
@keyframes _ngcontent-%COMP%_poll-pulse{0%,to{opacity:1}50%{opacity:.5}}
```

---

## Global CSS (verbatim)

From `styles.d622cb9ed2bbc221.css`. The stylesheet ships **both** Bootstrap 4 (Darkly) and Bootstrap 5 layers; the **later (BS5) rule wins** on equal specificity. Only winning rules shown; where BS4 and BS5 both target the class, the BS5 form is authoritative.

**`.label` / `.label-warning`** — **NOT PRESENT in the stylesheet** (`.label`/`label-warning` substring absent). The numbered badges `<span class="label label-warning">1|2|3</span>` receive **no** background/color from any rule — they render as plain inline text at the surrounding `h3` size. (BS3 legacy class; the app dropped `.label`.)

**Nav tabs (BS5 layer wins):**
```css
.nav-link{display:block;padding:var(--bs-nav-link-padding-y) var(--bs-nav-link-padding-x);font-size:var(--bs-nav-link-font-size);font-weight:var(--bs-nav-link-font-weight);color:var(--bs-nav-link-color);text-decoration:none;background:0 0;border:0;transition:color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out}
.nav-tabs{--bs-nav-tabs-link-active-color:var(--bs-emphasis-color);--bs-nav-tabs-link-active-bg:var(--bs-body-bg);--bs-nav-tabs-link-active-border-color:var(--bs-border-color) var(--bs-border-color) var(--bs-body-bg);border-bottom:var(--bs-nav-tabs-border-width) solid var(--bs-nav-tabs-border-color)}
.nav-tabs .nav-link{margin-bottom:calc(-1 * var(--bs-nav-tabs-border-width));border:var(--bs-nav-tabs-border-width) solid transparent;border-top-left-radius:var(--bs-nav-tabs-border-radius);border-top-right-radius:var(--bs-nav-tabs-border-radius)}
.nav-tabs .nav-link:focus,.nav-tabs .nav-link:hover{isolation:isolate;border-color:var(--bs-nav-tabs-link-hover-border-color)}
.nav-tabs .nav-item.show .nav-link,.nav-tabs .nav-link.active{color:var(--bs-nav-tabs-link-active-color);background-color:var(--bs-nav-tabs-link-active-bg);border-color:var(--bs-nav-tabs-link-active-border-color)}
.nav-tabs .nav-link:hover{cursor:pointer}
```
(BS4/Darkly also emits `.nav-tabs .nav-link.active{color:#fff;background-color:#222;border-color:#444 #444 transparent}` and `.nav-tabs{border-bottom:1px solid #444}` earlier — overridden by BS5 except where BS5 var chains resolve to the same. **The component's own `.nav-link.active[_ngcontent]{color:#000!important}` overrides all of these for the active tab text.**)

**Tab panes:**
```css
.tab-content>.tab-pane{display:none}
.tab-content>.active{display:block}
```

**Form control (input) — BS4 Darkly wins (light input on this control):**
```css
.form-control{display:block;width:100%;height:calc(1.5em + .75rem + 2px);padding:.375rem .75rem;font-size:.9375rem;font-weight:400;line-height:1.5;color:#444;background-color:#fff;background-clip:padding-box;border:1px solid transparent;border-radius:.25rem;transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out}
.form-control:focus{color:#444;background-color:#fff;border-color:#739ac2;outline:0;box-shadow:0 0 0 .2rem #375a7f40}
.form-control::placeholder{color:#999;opacity:1}
```

**Buttons (BS5 layer wins):**
```css
.btn{--bs-btn-padding-x:.75rem;--bs-btn-padding-y:.375rem;--bs-btn-font-size:1rem;--bs-btn-font-weight:400;--bs-btn-line-height:1.5;--bs-btn-color:var(--bs-body-color);--bs-btn-bg:transparent;--bs-btn-border-color:transparent;display:inline-block;padding:var(--bs-btn-padding-y) var(--bs-btn-padding-x);font-size:var(--bs-btn-font-size);font-weight:var(--bs-btn-font-weight);line-height:var(--bs-btn-line-height);color:var(--bs-btn-color);text-align:center;text-decoration:none;vertical-align:middle;cursor:pointer;border:var(--bs-btn-border-width) solid var(--bs-btn-border-color);border-radius:var(--bs-btn-border-radius);background-color:var(--bs-btn-bg);transition:color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out}
.btn-outline-light{--bs-btn-color:#f8f9fa;--bs-btn-border-color:#f8f9fa;--bs-btn-hover-color:#000;--bs-btn-hover-bg:#f8f9fa;--bs-btn-hover-border-color:#f8f9fa;--bs-btn-active-color:#000;--bs-btn-active-bg:#f8f9fa;--bs-btn-active-border-color:#f8f9fa;--bs-btn-disabled-color:#f8f9fa;--bs-btn-disabled-border-color:#f8f9fa}
.btn-success{--bs-btn-color:#fff;--bs-btn-bg:#198754;--bs-btn-border-color:#198754;--bs-btn-hover-color:#fff;--bs-btn-hover-bg:#157347;--bs-btn-hover-border-color:#146c43;--bs-btn-active-bg:#146c43;--bs-btn-active-border-color:#13653f;--bs-btn-disabled-bg:#198754;--bs-btn-disabled-border-color:#198754}
```
(BS4 earlier defines `.btn-success{color:#fff;background-color:#00bc8c;border-color:#00bc8c}` and `.btn-outline-light{color:#303030;border-color:#303030}` — **both overridden by the later BS5 vars**: Send-Poll green resolves to `#198754`, not Darkly's `#00bc8c`; outline-light border is `#f8f9fa`.)

**Input group / list group:**
```css
.input-group{position:relative;display:flex;flex-wrap:wrap;align-items:stretch;width:100%}
.input-group>.form-control,.input-group>.form-floating,.input-group>.form-select{position:relative;flex:1 1 auto;width:1%;min-width:0}
.list-group{display:flex;flex-direction:column;padding-left:0;margin-bottom:0;border-radius:var(--bs-list-group-border-radius)}
.list-group-item{position:relative;display:block;padding:var(--bs-list-group-item-padding-y) var(--bs-list-group-item-padding-x);color:var(--bs-list-group-color);text-decoration:none;background-color:var(--bs-list-group-bg);border:var(--bs-list-group-border-width) solid var(--bs-list-group-border-color)}
```
`.input-group-btn` (BS3/4) — **NOT PRESENT**. The `<span class="input-group-btn">` supplies no layout of its own; it exists only as the descendant selector target for the component rule `.input-group-btn .btn{border-radius:0 6px 6px 0}`.

**Form-check (mostly overridden by the component's own `.form-check-input`):**
```css
.form-check-input{--bs-form-check-bg:var(--bs-body-bg);flex-shrink:0;width:1em;height:1em;margin-top:.25em;vertical-align:top;-webkit-appearance:none;appearance:none;background-color:var(--bs-form-check-bg);border:var(--bs-border-width) solid var(--bs-border-color)}
.form-check-input[type=checkbox]{border-radius:.25em}
.form-check-input:checked{background-color:#0d6efd;border-color:#0d6efd}
.form-check-label{margin-bottom:0}
```
The **component** `.form-check-input[_ngcontent-%COMP%]` (round 20px, `var(--checkbox-bg-color)` when checked) has equal class specificity but ships in the component `styles` (Angular emits component styles after global; wins on order) — so the anonymous checkbox is the round custom swatch, not the BS5 blue square.

**Utilities that apply:** `.w-100{width:100%!important}`, `.p-2{padding:.5rem!important}`, `.float-right{float:right!important}`, `.row{display:flex;flex-wrap:wrap;…}`.
**Utilities present in markup but ABSENT from stylesheet (no effect):** `.pull-right` and `.centered` — neither exists in `styles.d622cb9ed2bbc221.css`. The footer's right alignment comes from `.poll-panel-footer{display:flex;justify-content:flex-end}`, not from `pull-right`/`float-right`.

---

## Resolved values

Var chains resolved against the **LIVE room** `:root` tokens captured in `proroom-all-admin.json` → `cssVariables.root`: `--light-gray:#ccc`, `--white:#fff`, `--checkbox-bg-color:#45a2ff`, `--darker-black:#111`. (These OVERRIDE Darkly's boot default of `--checkbox-bg-color:#00bc8c` in `pagesource.html`.)

| Element | Property | Resolved value | Source |
|---|---|---|---|
| `.pollModalHolder` (host window) | display / position | `none` (until opened) / `fixed`, `left:50%`,`top:50%` | scoped `.pollModalHolder` |
| host window | width × height | `580px × 553px` | scoped; also JS `showPanel()` sets `580/553` and `resizable` minWidth 580/minHeight 553 |
| host window | background / border / radius | `#1e1e1e` / `1px solid rgb(133,133,133)` / `4px` | scoped |
| host window | box-shadow / z-index / padding | `0 4px 20px #00000080` / `501` / `10px` | scoped |
| host window | max-width / max-height | `calc(100vw - 100px)!important` / `calc(100vh - 50px)!important` | scoped |
| `.poll-panel-titlebar` | display / justify / bg / border-bottom / cursor | `flex` space-between / `#2c2c2c` / `1px solid #555` / `move` | scoped |
| `.poll-panel-titlebar` | padding | `6px 10px` | scoped |
| `.poll-panel-title` | font-weight / size / color | `700` / `14px` / `#fff` | scoped |
| `.poll-panel-controls` | display / gap | `flex` / `6px` | scoped |
| `.poll-panel-btn` | size / bg / border / color / radius | `28×28px` / `transparent` / `1px solid #666` / `#ccc` / `3px` | scoped |
| `.poll-panel-btn` | font-size / padding | `12px` / `0` | scoped |
| `.poll-panel-body` | padding / overflow / height / color | `10px` / `x:hidden y:auto` / `calc(100% - 40px)` / `#ddd` | scoped |
| `.poll-panel-footer` | display / justify / gap / padding-top | `flex` / `flex-end` / `8px` / `10px` | scoped |
| `#sendpoll h3` | font-size | `20px` | scoped `#sendpoll h3` (beats BS h3) |
| `.label label-warning` badge (1/2/3) | bg / color | **none — unstyled inline text** | `.label*` absent from all CSS |
| `.nav-tabs` (in poll) | width / display / justify | `100%` / `flex` / `center` | scoped `.nav-tabs` |
| `.nav-tabs` | border-bottom | `1px solid var(--bs-border-color)` (BS5) | global |
| `.nav-link.active` (poll tab text) | color | `#000 !important` | scoped `.nav-link.active` (overrides BS `#fff`) |
| `.nav-link.active` | background | `var(--bs-body-bg)` (BS5 `--bs-nav-tabs-link-active-bg`) | global |
| `#pollQuestionTxt`,`#pollChoiceTxt` (`.form-control`) | color / bg / height | `#444` / `#fff` / `calc(1.5em + .75rem + 2px)` | global BS4 |
| `.form-control` | padding / font-size / radius / border | `.375rem .75rem` / `.9375rem` / `.25rem` / `1px solid transparent` | global BS4 |
| `.form-control:focus` | border / shadow | `#739ac2` / `0 0 0 .2rem #375a7f40` | global BS4 |
| Add-Choice / Save-Canned `.btn-outline-light` | color / border (resting) | `#f8f9fa` / `#f8f9fa` (BS5) | global |
| `.btn-outline-light:hover` | color / bg | `#000` / `#f8f9fa` | global BS5 |
| `.input-group-btn .btn` (Add Choice) | border-radius | `0 6px 6px 0` | scoped |
| Send-Poll `.btn-success` | color / bg / border | `#fff` / `#198754` / `#198754` | global BS5 (NOT `#00bc8c`) |
| `.btn-success:hover` | bg / border | `#157347` / `#146c43` | global BS5 |
| `.anonymous-poll-container` | margin | `8px 0 8px 20px` | scoped |
| `#anonymous-poll` `.form-check-input` | appearance / size / radius | `none` / `20×20px` / `50%` (round) | scoped |
| `#anonymous-poll` (unchecked) | background-color | `var(--light-gray)` → `#ccc` | scoped + live token |
| `#anonymous-poll:checked` | background-color | `var(--checkbox-bg-color)` → `#45a2ff` | scoped + live token |
| `.form-check-label` | color | inherits `.poll-panel-body` `#ddd` | scoped body |
| `.list-group-item` (canned poll row) | bg / border / padding | `var(--bs-list-group-bg)`=`var(--bs-body-bg)` / `1px solid var(--bs-border-color)` / `.5rem 1rem` | global BS5 |
| voting `.btn-primary btn-sm` "Choose" | color | inline `color:white`; BS bg `#0d6efd` | template const [45] + global |
| `#responsesTxt` (results textarea) | max-height / overflow | `300px` / `auto` | scoped `#responsesTxt` |
| `#pollPieChart` | display / size | `none` (until first answer) / `100% × 300px` | template const [47]; `.plot()` on first `gotPollAnswer` |

**No computed-style/rect data exists for this surface** — see Honest gaps. Every value above is resolved from source CSS + live tokens, not from a capture's `style{}`.

---

## States & effects

| Trigger | Effect | Rule / source |
|---|---|---|
| host window (default) | `display:none` — hidden until `showPanel()` runs `$("#pollModalCompHolder").show()` | scoped `.pollModalHolder{display:none}` + JS `showPanel()` |
| `.poll-panel-btn:hover` (min/max) | `background-color:#444;color:#fff` | scoped |
| `.poll-panel-btn-close:hover` (X) | `background-color:#c0392b;color:#fff` (red) | scoped |
| titlebar hover / drag | `cursor:move`; text unselectable (`user-select:none`) | scoped `.poll-panel-titlebar` |
| Maximize icon | `<i>` class toggles `fa-window-restore` ⇄ `fa-window-maximize` via `ngClass` on `isMaximized` | template `H("ngClass",o.isMaximized?"fa-window-restore":"fa-window-maximize")` |
| body visibility | `poll-panel-body` `display` = `none` when `isMinimized`, else `block` | template `Oo("display",o.isMinimized?"none":"block")` |
| `.nav-tabs .nav-link:hover/:focus` | `isolation:isolate;border-color:var(--bs-nav-tabs-link-hover-border-color)`; `cursor:pointer` | global BS5 + Darkly `.nav-tabs .nav-link:hover{cursor:pointer}` |
| active tab | `.nav-link.active` text `#000!important` (component), bg `var(--bs-body-bg)` | scoped + global |
| `.form-control:focus` | border `#739ac2`, shadow `0 0 0 .2rem #375a7f40` | global BS4 |
| `.form-check-label:hover` | `cursor:pointer;opacity:.85` | scoped |
| checkbox `:checked` | round swatch fills `var(--checkbox-bg-color)`=`#45a2ff` | scoped |
| checkbox transition | `all .15s ease-out 0s` | scoped `.form-check-input` |
| `.btn-outline-light:hover` | invert → text `#000`, bg `#f8f9fa` | global BS5 |
| `.btn-success:hover` | bg `#157347` | global BS5 |
| all `.btn` / `.nav-link` / `.form-control` | `transition:…border/bg/color .15s ease-in-out` | global |
| **chat-toolbar poll indicator** (separate component) | while a poll is live (`pollActive` emitted true), the indicator gets `poll-active-blink` → `color:#f39c12` + `poll-pulse` 1.5s ease-in-out infinite (opacity 1→.5→1) | `odds-and-ends.html` L17221-17237 |
| host window drag | jQuery-UI `.draggable({containment:".wrapper",handle:"#pollPanelTitlebar",cursor:"move",scroll:false,snap:true,cancel:"input, textarea, button, select, .poll-panel-controls"})` | JS `initDrag()` |
| host window resize | jQuery-UI `.resizable({handles:"n,e,s,w,ne,se,sw,nw",maxWidth/Height=.wrapper,minWidth:580,minHeight:553})` | JS `initDrag()` |
| minimize | `toggleMinimize()`: hides window, remembers `wasMaximizedBeforeMin`, emits `pollMinimized:true` | JS |
| maximize | `toggleMaximize()`: saves `preMaxBounds`, sizes to `.wrapper` outer w/h + offset; toggles back to saved bounds | JS |

---

## Behavior (provable from templates/JS)

Titlebar:
- **Minimize** `(click)=toggleMinimize()` → `$("#pollModalCompHolder").hide()`, sets `isMinimized`, emits `pollMinimized`. Restored via `restorePanel()` (also re-triggered by `pollRestore` gui event).
- **Maximize** `(click)=toggleMaximize()` → grows to `.wrapper` bounds; second click restores `preMaxBounds`.
- **Close** `(click)=closeModal()` → if `mode!="setup"` **and** the current user is the poll's sender, `bootbox.confirm("Closing this window, will end the poll. Are you sure?")`; on OK sends admin command `pollDone` and `hidePanel()`. Otherwise just `hidePanel()`.

Create-New-Poll tab (`data-bs-toggle="tab"`, `data-bs-target="#sendpoll"`):
- Question input `[ngModel]=pollQuestion`.
- Choice input `[ngModel]=pollChoice`; **Enter** (`keyup.enter`) or **Add Choice** button → `addChoice()` = push non-empty `pollChoice` into `pollChoices`, clear input.
- Each choice `<li>` **Del** button → `delChoice($index)` = `pollChoices.splice(index,1)`.
- **Anonymous Poll** checkbox `[ngModel]=anonymousPoll`.
- **Save To Canned** → `savePollToStorage()` = push `{q,choices}` to `savedPolls`, `sendServerCommand("savedSessionPolls",…)`, then `bootbox.alert("Poll Saved to Pre-Canned polls...")`.
- **Send Poll** → `sendPoll()` = `bootbox.confirm("Are you sure you want to send this poll?")`; on OK `sendServerAdminCommand("sendPoll",{q,choices})`, reset totals, set `mode="results"`, emit `pollActive:true`.

Pre-Canned tab (`data-bs-target="#savedPolls"`):
- Each saved `<li>` shows `{{q}}` with **Delete** → `deleteSavedPoll($index)` (`bootbox.confirm('…delete poll "q" ?'`, then splice + `savedSessionPolls` command) and **Load** → `loadSavedPoll($index)` (restores `pollQuestion`/`pollChoices`, then `$("#sendpolltab").tab("show")` switches back to the Create tab).

Member `answer` card:
- Delivered by `doPollModal` gui event with `mode="answer"`, `data.q`, `data.choices`; emits `pollActive:true`.
- Each choice **Choose** button → `sendAnswer($index)`: guarded by `answered` (one vote only) → `sendServerCommand("sendPollAnswer",{a:index})`, `mode="done"`, then `closeModal()`.

Sender `results` panel:
- Subscribes `gotPollAnswer`: increments `total`, on first answer `$("#pollPieChart").show()` + `$.plot("#pollPieChart",pieData,DB)` (Flot pie, label formatter shows `choice : NN%`), appends `total: [nick]: choice` to `#responsesTxt`, recomputes `pollChoicesTotals` and `calcPieData()`.
- **Post Results** (shown only when `total>0`) → `postResults()` builds a text summary (`choice - NN%` per line) and `sendServerCommand("alertMsg",{txt,…})` then `closeModal()`.
- Response textarea `#responsesTxt` is hidden when `anonymousPoll` is true (the `ATe` block renders only when `!anonymousPoll`).
- Subscribes `pollDone` → `hidePanel()`.

Canned-poll persistence: loaded via `loadPollsFromStorage()` on `setup` open — migrates any legacy `localStorage["savedPolls"]` up to the server session (`savedSessionPolls`), else reads `globals.sessData.savedSessionPolls`.

---

## Honest gaps

1. **Zero computed styles / rects for this surface.** The poll modal is `display:none` and was never opened in any capture (`proroom-all-admin.json`, `proroom-full-presenter.json`, `proroom-full-member.json`, `proroom-ultra-admin-room-stronger.json`, `proroom-gaps-presenter.json` all return **no** `poll*` elements). Every value in *Resolved values* is derived from source CSS + live `:root` tokens, **not** measured from a rendered node. Actual on-screen pixel positions (drag start offset, exact tab bar height, badge rendering) are un-verified against a real render.
2. **`answer` and `results` mode markup are reconstructed from the bundle template functions (`xTe`, `RTe`, `kTe`, `MTe`, `ATe`, `PTe`), not from a DOM dump.** No `file*.html` / `odds-and-ends.html` captured the voting card or results panel in its rendered form — only the `setup` mode (`ETe`) appears in `file13.html`. Attribute/class lists are exact (from `consts`), but I have no rendered HTML to confirm Angular's final attribute serialization for those two modes.
3. **Populated `<ol>` choices and `<ul class="list-group">` canned rows were never captured** — both were empty (`<!---->`) in `file13.html`. The per-`<li>` markup shown is reconstructed from templates `TTe` (choice) and `DTe` (canned), verified by class/handler but not by a rendered instance.
4. **Flot pie chart appearance** (colors, slice labels) is only defined by the `DB` options object (`innerRadius:0`, label color `#FAFAFA`, bg `#222`, opacity .8); the actual rendered chart/canvas is not in any evidence.
5. **`--bs-body-bg` / `--bs-border-color` / `--bs-emphasis-color`** (used by BS5 nav-tabs and list-group) were not read from the live `cssVariables.root` dump here — the active-tab background and list-group item background/border resolve through the BS5 theme layer, whose final hex I did not pin from a capture for this surface.
6. **`label label-warning` badges have no matching CSS in any stylesheet** — this is a genuine finding (unstyled), but I cannot rule out an inline/runtime style being applied elsewhere; none was found in the evidence.
