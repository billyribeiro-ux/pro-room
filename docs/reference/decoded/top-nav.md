# Top-nav

The fixed top navbar `nav.navbar.navbar-expand-md.navbar-dark.fixed-top.mainAppNav` of the ProTradingRoom room ("Mastering The Trade", lightTheme). It is a single Angular component (`_ngcontent-ng-c977335924`) whose template lives in the bundle as render function `M4e` (main.d6f5272aa3783e43.js @ offset 2480615), attribute (`consts`) array beginning @ 2529251, and scoped `styles` string @ ~2543900–2560500 and a second component style block @ ~2016800–2019200.

All role/permission conditionals below are transcribed verbatim from the `2&t` (change-detection) block of `M4e` and its sub-render-functions. The member DOM dumps (`mixed-files/navbar.html`, `mixed-files/navbars-room.html`, `mixed-files/file2.html`) render the member branch; every non-member `<li>` collapses to an Angular `<!---->` placeholder comment there. Computed values come from `docs/reference/captures/proroom-full-member.json` (role `member`, viewport 1988×1157) and, for the open volume dropdown, `proroom-all-admin.json` state `dropdown:3`.

---

## DOM structure

Literal tree (member-rendered order; from `mixed-files/navbar.html` cross-checked against the `M4e` template + `consts` array). `_ngcontent-ng-c977335924` attr omitted for brevity — it is on every element.

```
nav.navbar.navbar-expand-md.navbar-dark.fixed-top.mainAppNav          [consts idx per bundle: [1,"navbar","navbar-expand-md","navbar-dark","fixed-top","mainAppNav"]]
├─ (V idx1) span.sidebar-menu[title="Open Sidebar"]  > i.fas.fa-bars        ← rendered when showSidebar||alwaysShowRoster is false (open-sidebar variant bPe → consts 78/136)
│  (alt V idx0) span.sidebar-menu.active-icon[title="Close Sidebar"] > i.fas.fa-arrow-left   ← when showSidebar && !alwaysShowRoster (_Pe → consts 77/134)
├─ span.users.ml-1.mr-1.d-flex.align-items-center[title="Users Connected"]  (click)=toggleSideBarUsersCount() (dblclick)=hideCount=!hideCount
│  └─ i.fas.fa-user
│     └─ (V idx5) span.ml-1  → " {rosterCount+simUserCount} "   ← hidden unless rosterCountVisibleToViewers||isPresenter (vPe → consts 80)
├─ span.fas.fa-mobile.mr-1.mobile-info-app-btn[title="Launch in Mobile App"][data-bs-toggle="modal"][data-bs-target="#mobileAppInfoModal"]
│     ← hidden when !(ptrMobileAppEnabled||customMobileAppEnabled||alwaysShowRoster) OR (user.isFT && !freeTrialsGetApp)
├─ a.navbar-brand.ml-1.mr-auto
│  └─ img#cssLogo.brand-logo[alt="App Logo"][src=globals.logoURL]     (member src observed: https://chat.protradingroom.com/var/www/uploads/8cb6ad5c3757766914222382a24b9d2a)
├─ (V idx9) a.helpLink.mr-auto[href="https://intercom.help/simpler-trading/en/"][target="_blank"] > i.fas.fa-question-circle   ← only when hasSTHelpLink (FPe → consts 84/138); NOT rendered for this room
├─ button.navbar-toggler.btnNavToggler[type="button"][data-bs-toggle="collapse"][data-bs-target="#navbarsRoom"][aria-controls="navbarsRoom"][aria-expanded="false"][aria-label="Toggle navigation"]
│  └─ span.navbar-toggler-icon
└─ div#navbarsRoom.collapse.navbar-collapse
   └─ ul.navbar-nav.align-items-center.ml-auto
      ├─ (idx14 CPe) li.nav-item[title=tipMeBtnTxt] (click)=doTipToUser() > a.d-flex.align-items-center.btn.btn-primary.btn-sm > i.fas.fa-dollar-sign + span.ml-1{tipMeBtnTxt}   ← only if isTipEnabled
      ├─ (idx15 SPe) li.nav-item.animated.fadeIn.benzinga-li > a[target=_blank][title="Benzinga News"] > img.benzinga-logo.animated.fadeIn   ← only if sessData.hasBenzingaNews
      ├─ (idx16 EPe) li.nav-item.talkingIndicator.animated.fadeIn  ── SPEAKING variant ── > a.talking > i.icon.fa.fa-microphone + span.talking-string(*ngFor talkingUsers → span (click)=muteTalkingUserDialog){name} + img#talkingLevelsImg.talkingWaveform | img#nolevelsImg.talkingWaveform   ← when talkingUsers.length>0
      ├─ (idx17 kPe) li.nav-item.talkingIndicator.animated.fadeIn > a " ( No one is speaking )"   ← when !talkingStr   [THIS is the member-observed state]
      ├─ (idx18 xPe) li.nav-item.recIndicator.animated.flash > a "[ REC PAUSED]"   ← when isRecordingPaused && isRecording
      ├─ (idx19 MPe) li.nav-item.recIndicator.animated.fadeIn[title=…] > a "[ REC ]"   ← when isRecording && !paused && !starting
      ├─ (idx20 APe) li.nav-item.recIndicatorStart > a.nav-link > i.fas.fa-spinner.fa-spin " REC "   ← when isRecordingStarting
      │  ─────────── PRESENTER / BROADCAST CLUSTER (all collapse to <!----> for member) ───────────
      ├─ (idx21 WPe) li.nav-item.dropdown[title="Star/Stop Recording"] > a.nav-link.dropdown-toggle.d-flex.align-items-center[id=dropdownRecording][data-bs-toggle=dropdown] > i.far.fa-2x.fa-dot-circle + span.ml-2.mainNavItem "Start/Stop Recording"; + recording-reminder div; + ul.screen-options-start-screen.dropdown-menu.dropdown-menu-end (record method menu)
      │     ← when (isPresenter||user.hasMic||user.hasScreen) && !isNonPresenterAdmin
      ├─ (idx22 KPe) li.nav-item.dropdown[title="Play music from SoundCloud for all"] > a.nav-link.dropdown-toggle.d-flex.align-items-center[id=soundcloudDropdown] > i.fab.fa-2x.fa-soundcloud + span.ml-2 "" + span.caret (+img playing.gif when scPlaying); + ul.dropdown-menu.dropdown-menu-end.soundcloud-options (Play a track / Stop For All / Stop For Me)
      │     ← when isPresenter||isNonPresenterAdmin
      ├─ (idx23 YPe) li.nav-item[title="Music is playing from SoundCloud for all"] > a (click)=doSoundCloudUserStop() > i.fab.fa-2x.fa-soundcloud + img playing.gif   ← when !(isPresenter||isNonPresenterAdmin) && scPlaying
      ├─ (idx24 QPe) li.nav-item.d-flex.align-items-center[title="Unmute/Mute Microphone"] > a[id=unmuteMuteMicrophone].nav-link.d-flex.align-items-center (click)=toggleMic() > i.fas.fa-2x.fa-microphone + span.ml-2.mainNavItem "Unmute/Mute Microphone"; + a.nav-link.mic-gear-btn.p-0.m-0 (click)=openAvDeviceSelection() > i.fas.fa-cog
      │     ← when (isPresenter||user.hasMic||isLimitedPresenter) && !isNonPresenterAdmin && !micDisabled && !micLaunching
      ├─ (idx25 XPe) li.nav-item > a.nav-link > i.fas.fa-2x.fa-spinner.fa-spin   ← when micLaunching
      ├─ (idx26 n4e) li.screen-sharing.nav-item.dropdown[title="Start/Stop Screen Sharing"] > a.nav-link.dropdown-toggle.d-flex.align-items-center[id=dropdownScreenSharing] > i.fas.fa-2x.fa-desktop + span.ml-2.mainNavItem "Start/Stop Screen Sharing"; + ul.screen-options-start-screen.dropdown-menu.dropdown-menu-end ("Share Screen", "OBS / XSPLIT / Share Virtual Cam", MediaMTX/stop options, screenProducers *ngFor)
      │     ← when (isPresenter||user.hasScreen||isLimitedPresenter) && !isNonPresenterAdmin
      ├─ (idx27 i4e) li.nav-item[title="Start / Stop WebCam"] (click)=toggleWebcam() > a[id=startStopWebCam].nav-link.d-flex.align-items-center > i.fas.fa-2x.fa-video + span.ml-2.mainNavItem "Start / Stop WebCam"
      │     ← when !hideWebcamForRoom && (isPresenter||user.hasCam||isLimitedPresenter) && !isNonPresenterAdmin && !camLaunching
      ├─ (idx28 o4e) li.nav-item > a.nav-link > i.fas.fa-2x.fa-spinner.fa-spin   ← when camLaunching
      ├─ (idx29 s4e) li.nav-item[title="Session Control"][data-bs-toggle=modal][data-bs-target="#session-control-modal"] (click)=doSessionControl() > a.nav-link.d-flex.align-items-center > i.fas.fa-2x.fa-cog + span.ml-2.mainNavItem "Session Control"
      │     ← when isPresenter||user.hasMic (i.e. NOT (!isPresenter && !user.hasMic) ) && !isLimitedPresenter
      ├─ (idx30 r4e) li.nav-item[title="TAWK Support"] (click)=toggleTAWKSupport() > a.nav-link.d-flex.align-items-center > i.fas.fa-2x.fa-question-circle + span.ml-2.mainNavItem "TAWK Support"
      │     ← when isPresenter && sessData.tawkPresenterSupport
      │  ─────────── VOLUME (always present) ───────────
      ├─ (idx31) li.nav-item.dropdown.dropstart
      │  ├─ a#dropdownVolume.nav-link.d-flex.align-items-center[data-bs-toggle="dropdown"]
      │  │  ├─ i.fas.fa-2x.fa-volume-up        ← when audioVolume>50   (a4e → consts 105)
      │  │  ├─ i.fas.fa-2x.fa-volume-down       ← when 4<audioVolume<50 (l4e → consts 106)
      │  │  ├─ i.fas.fa-2x.fa-volume-off        ← when audioVolume<4    (c4e → consts 107)
      │  │  └─ span.ml-2.mainNavItem "Volume"
      │  └─ div.dropdown-menu.volumeControl[aria-labelledby="dropdownVolume"]
      │     ├─ h4 "Volume" > span.float-right.mr-2[data-bs-toggle="dropdown"] > i.fas.fa-times
      │     ├─ input.mx-auto.py-2.volCtrl[audioVolSlider][type=range][min=0][max=100][title="Volume"]  [(ngModel)]=audioVolume (change/input)=adjustVol($event)
      │     ├─ br
      │     ├─ button.btn.btn-primary.btn-sm[title="Mute Audio"] (click)=mute() "Mute"    ← when audioVolume>0 (d4e)
      │     │  (alt) button.btn.btn-primary.btn-sm[title="Unmute Audio"] (click)=unmute() "Unmute"  ← when audioVolume==0 (u4e)
      │     ├─ hr
      │     ├─ (idx48 h4e) div[style="text-align:center"] > hr + p.m-0 "Background Music:" + input[audioVolSlider][type=range][title="Background Volume"]   ← when scPlaying||mp3Playing||roomState.ytURL
      │     ├─ div.dropdown-divider
      │     └─ div.room-sound-options
      │        ├─ (idx51 _4e) *ngFor talkingUsers → per-user presenter volume sliders + hr   ← when talkingUsers.length>0
      │        ├─ div.my-1 > input#alert-donot-disturb.form-check-input[type=checkbox][name="alert-donot-disturb"][value="Alert Do not disturb"][title="Alert sound"] (change)=alertSoundOnChange() [checked]=preferences.alertSoundOn
      │        │            + label.form-check-label[for=alert-donot-disturb] "Alert sound " span{ "on" | "off" }
      │        ├─ div.my-1 > input#qa-donot-disturb …[title="QA sound"] (change)=qaSoundOnChange() [checked]=preferences.qaSoundOn + label "QA sound " span{on|off}
      │        ├─ div.my-1 > input#non-trade-donot-disturb …[title="Non-trade alert sound"] (change)=nonTradeSoundOnChange() [checked]=preferences.nonTradeSound + label "NTA sound " span{on|off}
      │        ├─ div.my-1 > input#chat-donot-disturb …[title="Chat sound"] (change)=chatSoundOnChange() [checked]=preferences.chatSoundOn + label "Chat sound " span{on|off}
      │        ├─ div.my-1 > input#presentation-subtitles …[value="Presentation Subtitles"][title="Show Speech Recognition Overlay"] (change)=subtitlesOnChange() [checked]=preferences.showSpeechRecoOverlay + label > i.fas.fa-closed-captioning " Subtitles " span{on|off}
      │        └─ div.my-1 > input#app-donot-disturb …[value="Do not disturb"][title="Don't Disturb"] (change)=doNotDisturbOnChange() [checked]=preferences.doNotDisturbOn + label > span{ "DON'T DISTURB" | "Don't Disturb" }
      └─ (idx88) li.nav-item[title="Reload"] > a.nav-link.d-flex.align-items-center (click)=doReload() > i.fas.fa-2x.fa-sync + span.ml-2.mainNavItem "Reload"
```

Role variants:
- **member** (observed live): sidebar-menu, users (no count span unless roster visible), mobile-info btn (present), brand logo, "( No one is speaking )" talkingIndicator, Volume dropdown, Reload. The entire presenter/broadcast cluster (idx21–idx30) is absent (Angular `<!---->` placeholders — see the run of comments in `mixed-files/navbar.html` between the talkingIndicator `<li>` and the Volume `<li>`).
- **presenter / staff with media perms**: adds the recording / soundcloud / microphone (+ gear) / screen-sharing / webcam / session-control / TAWK cluster per the conditions above; `.mainNavItem` labels beside each `fa-2x` icon are `display:none` on wide screens (see Global/scoped media rules) and appear only ≤768px.
- **isNonPresenterAdmin**: suppresses the mic/screen/webcam/soundcloud broadcast controls (each condition explicitly `&& !isNonPresenterAdmin`) while still allowing the record `<li>` guard `(isPresenter||user.hasMic||user.hasScreen)&&!isNonPresenterAdmin`.

---

## Scoped CSS (verbatim)

From the nav component `styles` array (main.d6f5272aa3783e43.js), `[_ngcontent-%COMP%]` is the component scoping token:

```css
.sidebar-menu[_ngcontent-%COMP%], .users[_ngcontent-%COMP%], .helpLink[_ngcontent-%COMP%], .navbar-nav[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{cursor:pointer;margin:0 5px}
.mobile-info-app-btn[_ngcontent-%COMP%]:hover{cursor:pointer}
.sidebar-menu[_ngcontent-%COMP%], .users[_ngcontent-%COMP%], .helpLink[_ngcontent-%COMP%]{font-size:18px}
.sidebar-menu[_ngcontent-%COMP%]{padding:1px 5px;border:1px solid transparent}
.sidebar-menu[_ngcontent-%COMP%]:hover{color:var(--lighter-gray);border:1px solid transparent}
.users[_ngcontent-%COMP%]{color:var(--users-color);border:1px solid var(--users-border-color);font-size:14px;padding:1px 5px}
.sidebar-menu[_ngcontent-%COMP%]{background-color:var(--sidebar-menu-bg);color:var(--sidebar-menu-color)}
.active-icon[_ngcontent-%COMP%]{color:var(--sidebar-menu-active-color);border:1px solid var(--sidebar-menu-active-color);border-radius:5px;transition:all .5s}
.navbar[_ngcontent-%COMP%]{padding:0;height:49px}
.btnNavToggler[_ngcontent-%COMP%]{height:49px}
.navbar-nav[_ngcontent-%COMP%]   .fa-1x[_ngcontent-%COMP%]{font-size:25px!important}
#dropdownVolume[_ngcontent-%COMP%]{width:40px}
#dropdownVolume[_ngcontent-%COMP%]:after{display:none}
.screen-options[_ngcontent-%COMP%]{background-color:var(--white);font-size:16px;color:var(--darker-black);width:300px;padding:5px}
.soundcloud-options[_ngcontent-%COMP%], .screen-options-start-screen[_ngcontent-%COMP%]{background-color:var(--white);font-size:16px;width:350px;color:var(--darker-black);padding:5px}
.volumeControl[_ngcontent-%COMP%]{text-align:center;color:var(--light-gray);background-color:var(--darker-black);border:1px solid #fafafa}
.audioVolSlider[_ngcontent-%COMP%]{background-color:#fafafa}
.volCtrl[_ngcontent-%COMP%]{background-color:var(--darker-black);height:32px;width:129px}
.volumeControl[_ngcontent-%COMP%]   input[type=range][_ngcontent-%COMP%]::-moz-range-progress{background-color:#0d6efd;border-color:#0d6efd;height:8px;border-radius:3px}
.volumeControl[_ngcontent-%COMP%]   input[type=range][_ngcontent-%COMP%]::-moz-range-thumb{background-color:#0d6efd;border-color:#0d6efd;height:13px;width:13px}
.room-sound-options[_ngcontent-%COMP%]{text-align:left;padding-left:30px}
.room-sound-options[_ngcontent-%COMP%]   .form-check-label[_ngcontent-%COMP%]:hover{opacity:.85;cursor:pointer}
.soundcloud-options[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:hover, .screen-options-start-screen[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:hover, .screen-options[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:hover{cursor:pointer;color:var(--light-black)}
.mic-gear-btn[_ngcontent-%COMP%]{font-size:.7rem;color:#abb0b5;cursor:pointer;transition:opacity .2s ease,color .2s ease;margin-left:-7px!important}
.mic-gear-btn[_ngcontent-%COMP%]:hover{color:#fff!important}
.navbar-dark[_ngcontent-%COMP%]   .navbar-nav[_ngcontent-%COMP%]   .nav-link[_ngcontent-%COMP%], .muted[_ngcontent-%COMP%]{color:#abb0b5}
.talkingIndicator[_ngcontent-%COMP%]{max-width:400px;white-space:nowrap;text-overflow:ellipsis}
.talkingIndicator[_ngcontent-%COMP%]   a[_ngcontent-%COMP%], .recIndicator[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{line-height:41px;color:var(--presenter-noRecording-color)}
.talkingIndicator[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{color:var(--presenter-noRecording-color);width:inherit;display:inline-flex;align-items:center;max-height:47px}
.talkingIndicator[_ngcontent-%COMP%]   .talking-string[_ngcontent-%COMP%]{white-space:nowrap;overflow:auto hidden;width:100%;font-size:14px;margin:0 5px;height:100%;max-height:47px;max-width:250px}
.recIndicator[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{color:var(--presenter-recording-color);max-width:117px;display:inline-block;width:100%}
.recIndicatorStart[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{line-height:41px;color:#ff0}
.talkingWaveform[_ngcontent-%COMP%]{max-height:25px;max-width:30px}
.mainNavItem[_ngcontent-%COMP%]{display:none;color:var(--light-gray)}
#navbarsRoom[_ngcontent-%COMP%]{color:var(--navbar-color);background-color:var(--navbar-bg)}
.btnNavToggler[_ngcontent-%COMP%]{color:var(--navbar-color)}
.mainAppNav[_ngcontent-%COMP%]{color:var(--navbar-color);background-color:var(--navbar-bg)}
.reload-room-users[_ngcontent-%COMP%]{background-color:var(--reload-icon-bg-color);color:var(--reload-icon-color)}   /* sidebar roster only */
.mobile-app-info[_ngcontent-%COMP%]{background-color:var(--mobileApp-info-bg-color);color:var(--mobileApp-info-color)}
.mobile-app-info[_ngcontent-%COMP%]:hover{opacity:.9}
.benzinga-logo[_ngcontent-%COMP%]{max-height:25px!important}
.recording-reminder[_ngcontent-%COMP%]{position:absolute;top:50px;left:-50px;background-color:#fff;color:#000;width:160px;padding:5px 5px 5px 10px;font-size:12px;display:flex;align-items:center;justify-content:space-between}
.recording-reminder-arrow[_ngcontent-%COMP%]{width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:5px solid #fff;position:absolute;top:-5px;left:75px}
.benzinga-logo-alt[_ngcontent-%COMP%]{background-color:#000;width:100%!important;max-height:25px!important;max-width:230px!important}
.blinking-rec[_ngcontent-%COMP%]{animation:_ngcontent-%COMP%_blinking 1s step-start infinite}
@keyframes _ngcontent-%COMP%_blinking{50%{opacity:0}}
.breathing-rec[_ngcontent-%COMP%]{color:red!important;animation:_ngcontent-%COMP%_breathing 5s ease-out infinite normal}
@keyframes _ngcontent-%COMP%_breathing{0%{transform:scale(.9)}25%{transform:scale(1.1)}60%{transform:scale(.9)}to{transform:scale(.9)}}
.brand-logo[_ngcontent-%COMP%]{max-width:200px;height:auto;max-height:40px}

@media only screen and (min-width: 768px) and (max-width: 930px){
  #navbarsRoom[_ngcontent-%COMP%], #navbarsRoom[_ngcontent-%COMP%]   .fa-2x[_ngcontent-%COMP%]{font-size:15px}
  #navbarsRoom[_ngcontent-%COMP%]   .talkingIndicator[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{font-size:12px}
  .brand-logo[_ngcontent-%COMP%]{max-width:150px}
}
@media only screen and (max-width: 768px){ .mainNavItem[_ngcontent-%COMP%]{display:block} }
@media only screen and (max-width: 600px){
  .soundcloud-options[_ngcontent-%COMP%], .screen-options-start-screen[_ngcontent-%COMP%]{width:inherit!important}
  .brand-logo[_ngcontent-%COMP%]{max-width:120px}
}
```

Second component style block (dropdown/volume duplicate, main.js @ ~2018000 — a distinct `[_ngcontent-%COMP%]` component that also defines these; note its `#dropdownVolume{width:31px}` differs from the nav component's 40px):

```css
.volumeControl[_ngcontent-%COMP%]{text-align:center;color:var(--light-gray);background-color:var(--darker-black);border:1px solid #fafafa}
.volCtrl[_ngcontent-%COMP%]{background-color:var(--darker-black);height:32px;width:129px}
.volumeControl[_ngcontent-%COMP%]   input[type=range][_ngcontent-%COMP%]::-moz-range-progress{background-color:#0d6efd;border-color:#0d6efd;height:8px;border-radius:3px}
.volumeControl[_ngcontent-%COMP%]   input[type=range][_ngcontent-%COMP%]::-moz-range-thumb{background-color:#0d6efd;border-color:#0d6efd;height:13px;width:13px}
#dropdownVolume[_ngcontent-%COMP%]{width:31px}
#dropdownVolume[_ngcontent-%COMP%]:after{display:none}
.room-sound-options[_ngcontent-%COMP%]{text-align:left;padding-left:30px}
```

---

## Global CSS (verbatim)

Rules that actually win on the top-nav (from `styles.d622cb9ed2bbc221.css` unless noted). Where a scoped rule targets the same element it wins by specificity; those are called out.

```css
/* layout */
.fixed-top{position:fixed;top:0;right:0;left:0;z-index:1030}
.navbar{position:relative;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;padding:1rem}   /* padding overridden by scoped .navbar{padding:0;height:49px} */
.navbar-nav{display:flex;flex-direction:column;padding-left:0;margin-bottom:0;list-style:none}
@media (min-width: 768px){
  .navbar-expand-md{flex-flow:row nowrap;justify-content:flex-start}
  .navbar-expand-md .navbar-nav{flex-direction:row}
  .navbar-expand-md .navbar-nav .dropdown-menu{position:absolute}
  .navbar-expand-md .navbar-nav .nav-link{padding-right:.5rem;padding-left:.5rem}
  .navbar-expand-md .navbar-collapse{display:flex!important;flex-basis:auto}
  .navbar-expand-md .navbar-toggler{display:none}
}
.navbar-brand{display:inline-block;padding-top:.32421875rem;padding-bottom:.32421875rem;margin-right:1rem;font-size:1.171875rem;line-height:inherit;white-space:nowrap}
.navbar-toggler{padding:.25rem .75rem;font-size:1.171875rem;line-height:1;background-color:transparent;border:1px solid transparent;border-radius:.25rem}
.navbar-toggler-icon{display:inline-block;width:1.5em;height:1.5em;vertical-align:middle;content:"";background:no-repeat center center;background-size:100% 100%}
.nav-link{display:block;padding:.5rem 2rem}
.nav-item{margin-bottom:-1px}
.navbar-dark .navbar-nav .nav-link{color:#fff}   /* LOSES to scoped .navbar-dark .navbar-nav .nav-link{color:#abb0b5} */

/* dropdown (dropstart) */
.dropdown-menu{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:10rem;padding:.5rem 0;margin:.125rem 0 0;font-size:.9375rem;color:#fff;text-align:left;list-style:none;background-color:#222;background-clip:padding-box;border:1px solid #444;border-radius:.25rem}
.dropstart .dropdown-menu[data-bs-popper]{top:0;right:100%;left:auto;margin-top:0;margin-right:var(--bs-dropdown-spacer)}
.dropstart .dropdown-toggle:after{display:none}          /* + scoped #dropdownVolume:after{display:none} */
.dropdown-divider{border-top-color:var(--dropdown-divider-bg)}   /* on top of BS5 .dropdown-divider{height:0;margin:var(--bs-dropdown-divider-margin-y) 0;overflow:hidden;border-top:1px solid var(--bs-dropdown-divider-bg);opacity:1} */

/* controls inside volume dropdown */
.form-check-input{float:left;margin-left:-1.5em}   /* BS5 checkbox; earlier BS4 defs superseded */
.btn{display:inline-block;font-weight:400;color:#fff;text-align:center;vertical-align:middle;background-color:transparent;border:1px solid transparent;...}
.btn-sm{--bs-btn-padding-y:.25rem;--bs-btn-padding-x:.5rem;--bs-btn-font-size:.875rem;--bs-btn-border-radius:var(--bs-border-radius-sm)}
.btn-primary{--bs-btn-color:#fff;--bs-btn-bg:#0d6efd;--bs-btn-border-color:#0d6efd;--bs-btn-hover-bg:#0b5ed7;--bs-btn-active-bg:#0a58ca;...}   /* BS5 def WINS → computed rgb(13,110,253); the BS4-Darkly .btn-primary{background-color:#375a7f} loses */

/* spacing utilities used on nav */
.ml-1,.mx-1{margin-left:.25rem!important}
.ml-2,.mx-2{margin-left:.5rem!important}
.mr-auto,.mx-auto{margin-right:auto!important}
.float-right{float:right!important}
.my-1{margin-top:.25rem!important}   /* +.mb-1 counterpart */
```

External stylesheets (captured, `docs/reference/captures/proroom-full-member.json` stylesheets[0..1]):

```css
/* Font Awesome 5.8.1 (use.fontawesome.com/releases/v5.8.1/css/all.css) */
.fa, .fab, .fal, .far, .fas { -webkit-font-smoothing: antialiased; display: inline-block; font-style: normal; font-variant: normal; text-rendering: auto; line-height: 1; }
.fa-2x { font-size: 2em; }
/* glyphs used: fa-bars, fa-user, fa-mobile, fa-volume-up, fa-volume-down, fa-volume-off, fa-times, fa-closed-captioning, fa-sync, fa-2x sizing; also cluster: fa-dot-circle(far), fa-soundcloud(fab), fa-microphone, fa-cog, fa-desktop, fa-video, fa-question-circle, fa-spinner+fa-spin, fa-arrow-left, fa-dollar-sign — each `.fa-<name>::before{content:"<PUA>"}` */

/* animate.css 3.7.2 (cdnjs) — drives .animated.fadeIn on talkingIndicator/benzinga */
.animated{-webkit-animation-duration:1s;animation-duration:1s;-webkit-animation-fill-mode:both;animation-fill-mode:both}
.fadeIn{-webkit-animation-name:fadeIn;animation-name:fadeIn}
@keyframes fadeIn{0%{opacity:0}to{opacity:1}}
/* .flash (used by recIndicator "[ REC PAUSED]") is animate.css .flash keyframes */
```

---

## Resolved values

Live room tokens (from `proroom-full-member.json` cssVariables.root — these are the running lightTheme values and override boot defaults): `--navbar-bg:#0c2434`, `--navbar-color:#fff`, `--sidebar-menu-bg:#103d5c`, `--sidebar-menu-color:#fff`, `--sidebar-menu-active-color:#45a2ff`, `--users-color:#fff`, `--users-border-color:#fff`, `--light-gray:#ccc`, `--lighter-gray:#eee`, `--darker-black:#111`, `--white:#fff`, `--light-black:#373c42`, `--presenter-noRecording-color:#fff`, `--presenter-recording-color:#45a2ff`, `--mobileApp-info-bg-color:transparent`, `--mobileApp-info-color:#f4f4f4`, `--dropdown-divider-bg:#45a2ff`, `--reload-icon-bg-color:#f4f4f4`, `--reload-icon-color:#45a2ff`.

| Element | Property | Resolved value | Source |
|---|---|---|---|
| nav.mainAppNav | height / display / bg / color / font-size | 49px / flex / rgb(12,36,52) #0c2434 / rgb(255,255,255) / 16px; rect 1988×49 @ (0,0) | member capture computed |
| span.sidebar-menu | bg / color / font-size / padding / border; rect | rgb(16,61,92) #103d5c / #fff / 18px / 1px 5px / 1px solid transparent; 28×31 @ (5,9) | scoped + member capture |
| span.sidebar-menu:hover | color / border | var(--lighter-gray) #eee / 1px solid transparent | scoped |
| span.users | color / border / font-size / padding; rect | #fff / 1px solid #fff / 14px / 1px 5px; 24×18 @ (42,16) | scoped + member capture |
| i.fas.fa-user (in users) | color / font-size; rect | #fff / 14px; 12×14 @ (48,18) | member capture |
| span.mobile-info-app-btn | color / font-size; rect | #fff (inherits nav) / 16px; 10×16 @ (70,17) | member capture |
| a.navbar-brand | font-size / margin-right; rect | 20px (=1.171875rem→resolved 20px) / auto; 200×40 @ (88,5) | global .navbar-brand + member capture |
| img#cssLogo.brand-logo | max-width / max-height / height; rect | 200px / 40px / auto; rendered 200×18 @ (88,17) | scoped + member capture |
| button.navbar-toggler.btnNavToggler | height / color / display | 49px / var(--navbar-color) #fff / none (≥768px) | scoped + global media |
| li.talkingIndicator | max-width / white-space / display; rect | 400px / nowrap / list-item; 167×41 @ (1713,4) | scoped + member capture |
| li.talkingIndicator > a | color / line-height / display / max-height; rect | #fff (var --presenter-noRecording-color) / 41px / inline-flex / 47px; 157×41 @ (1718,4) | scoped + member capture |
| a#dropdownVolume | color / display / width; rect | rgb(171,176,181) #abb0b5 / flex / 40px; 40×48 @ (1885,1) | scoped .navbar-dark…nav-link + #dropdownVolume{width:40px} + member capture |
| i.fas.fa-2x.fa-volume-up | color / font-size; rect | #abb0b5 / 32px (2em) / ; 36×32 @ (1893,9) | FA 5.8.1 .fa-2x + member capture |
| span.ml-2.mainNavItem "Volume"/"Reload" | display (≥768px) / color | none / var(--light-gray) #ccc | scoped .mainNavItem |
| li.nav-item[title=Reload] | rect | 58×48 @ (1930,1) | member capture |
| i.fas.fa-2x.fa-sync (reload) | color / font-size; rect | #abb0b5 / 32px; 32×32 @ (1943,9) | member capture |
| div.dropdown-menu.volumeControl (open) | bg / color / text-align / width / border; rect | rgb(17,17,17) #111 / rgb(204,204,204) #ccc / center / 160px / 1px solid #fafafa; 160×334 @ (1771,1) | admin capture dropdown:3 |
| h4 "Volume" (in dropdown) | color / font-size / text-align; rect | #ccc / 24px / center; 158×29 @ (1772,10) | admin dropdown:3 |
| span.float-right.mr-2 (× close) | rect | 17×29 @ (1906,10) | admin dropdown:3 |
| input.volCtrl[range] | bg / height / width; rect | #111 / 32px / 129px; 129×32 @ (1787,46) | scoped .volCtrl + admin dropdown:3 |
| button.btn.btn-primary.btn-sm "Mute" | color / bg / font-size; rect | #fff / rgb(13,110,253) #0d6efd / 14px; 49×31 @ (1826,85) | BS5 .btn-primary + admin dropdown:3 |
| div.dropdown-divider (in dropdown) | border-top-color; rect | var(--dropdown-divider-bg) #45a2ff; 158×1 @ (1772,149) | global + admin dropdown:3 |
| div.room-sound-options | text-align / padding-left; rect | left / 30px; 158×164 @ (1772,158) | scoped + admin dropdown:3 |
| input.form-check-input[checked] (alert/qa/nta/chat/subtitles) | bg (checked) | rgb(13,110,253) #0d6efd | admin dropdown:3 (unchecked app-donot-disturb showed rgb(255,255,255)) |
| label.form-check-label | color; rect (e.g. Alert) | #ccc; 104×24 @ (1802,158) | admin dropdown:3 |

---

## States & effects

- **sidebar-menu hover** — `.sidebar-menu:hover{color:var(--lighter-gray) #eee;border:1px solid transparent}` (scoped).
- **sidebar-menu open/close swap** — two mutually-exclusive spans: `.active-icon` (Close Sidebar, `fa-arrow-left`, color/border `--sidebar-menu-active-color` #45a2ff, `border-radius:5px`, `transition:all .5s`) rendered when `showSidebar && !alwaysShowRoster` (`_Pe`); plain `.sidebar-menu` (Open Sidebar, `fa-bars`) otherwise (`bPe`).
- **mobile-info-app-btn hover** — `cursor:pointer` (scoped).
- **mic-gear-btn** — `transition:opacity .2s ease,color .2s ease`; `:hover{color:#fff!important}` (scoped).
- **dropstart dropdown position** — `.dropstart .dropdown-menu[data-bs-popper]{top:0;right:100%;left:auto;margin-right:var(--bs-dropdown-spacer)}`; the open menu is positioned to the LEFT of the icon (observed rect x=1771 with icon at x≈1885). The toggle caret is suppressed: `.dropstart .dropdown-toggle:after{display:none}` + scoped `#dropdownVolume:after{display:none}`.
- **volume icon threshold** — `fa-volume-up` when `audioVolume>50`; `fa-volume-down` when `4<audioVolume<50`; `fa-volume-off` when `audioVolume<4`.
- **Mute/Unmute swap** — `Mute` button when `audioVolume>0`, `Unmute` when `==0`.
- **on/off + DON'T DISTURB label swap** — each sound-option label's trailing `<span>` reads `on` when its `preferences.*On` flag true else `off`; the DND label reads `DON'T DISTURB` (on) / `Don't Disturb` (off). Bound `[checked]` reflects the preference.
- **form-check-label hover** — `.room-sound-options .form-check-label:hover{opacity:.85;cursor:pointer}` (scoped).
- **talkingIndicator / recIndicator entry** — `.animated.fadeIn` (animate.css: `animation-duration:1s; @keyframes fadeIn 0%→opacity:0, 100%→opacity:1`). Recording-paused uses `.animated.flash`.
- **recording blink/breathe** — `.blinking-rec{animation:blinking 1s step-start infinite; @keyframes 50%{opacity:0}}` and `.breathing-rec{color:red!important; animation:breathing 5s ...; scale 0.9↔1.1}` (applied to the record indicator icon via ngClass `blinkingRec`/`isRecordingStarting`).
- **recording-reminder popover** — `.recording-reminder{position:absolute;top:50px;left:-50px;width:160px;bg:#fff;color:#000}` with `.recording-reminder-arrow` triangle; shown per WPe guard (recordingReminder && recording && not muted/paused).
- **Responsive** — labels `.mainNavItem{display:none}` normally, `display:block` at `max-width:768px`; nav font shrinks to 15px and talking-indicator anchor to 12px between 768–930px; brand logo `max-width` steps 200→150 (≤930)→120 (≤600); soundcloud/screen-share menus go `width:inherit` ≤600px.

---

## Behavior

Provable click/toggle targets (from `M4e` listeners and `data-bs-*` attrs):
- `span.users` — `(click)=toggleSideBarUsersCount()`, `(dblclick)` toggles `hideCount`.
- `span.sidebar-menu` — `(click)=toggleSideBar()`.
- `span.mobile-info-app-btn` — `data-bs-toggle="modal"` `data-bs-target="#mobileAppInfoModal"` (opens the Mobile App Info modal; `title="Launch in Mobile App"`).
- `button.navbar-toggler.btnNavToggler` — `data-bs-toggle="collapse"` `data-bs-target="#navbarsRoom"` (collapses/expands the right-side nav list on mobile).
- `a#dropdownVolume` — `data-bs-toggle="dropdown"` opens `.dropdown-menu.volumeControl`. The `h4 > span.float-right.mr-2` also has `data-bs-toggle="dropdown"` (× closes it).
- `input.volCtrl` — `[(ngModel)]=audioVolume`, `(change)/(input)=adjustVol($event)`.
- `button` in dropdown — `(click)=mute()` / `(click)=unmute()`.
- Background-music slider — `(input)=setBkgMusicVol($event)` `[(ngModel)]=audioBgVolume` (only when scPlaying/mp3Playing/ytURL).
- Sound checkboxes — `(change)` handlers `alertSoundOnChange / qaSoundOnChange / nonTradeSoundOnChange / chatSoundOnChange / subtitlesOnChange / doNotDisturbOnChange`.
- Reload `<li>` anchor — `(click)=doReload()`.
- Presenter cluster: record toggle `#dropdownRecording` (`data-bs-toggle=dropdown`, method menu); soundcloud `#soundcloudDropdown` menu → `doSoundCloudEmbed()` / `stopSoundCloudEmbed()` / `doSoundCloudUserStop()`; mic `#unmuteMuteMicrophone` `(click)=toggleMic()` + gear `(click)=openAvDeviceSelection()`; screen `#dropdownScreenSharing` → `mediaService.startScreenSharing(512000)` / `startScreenSharing("camera")`; webcam `#startStopWebCam` `(click)=toggleWebcam()`; session-control `(click)=doSessionControl()` + `data-bs-target="#session-control-modal"`; TAWK `(click)=toggleTAWKSupport()`.
- Tooltips are plain `title` attrs: "Open Sidebar"/"Close Sidebar", "Users Connected", "Launch in Mobile App", "Volume", "Mute Audio"/"Unmute Audio", "Reload", "Start/Stop Recording", "Play music from SoundCloud for all", "Unmute/Mute Microphone", "Audio Device Settings", "Start/Stop Screen Sharing", "Start / Stop WebCam", "Session Control", "TAWK Support", and per-checkbox ("Alert sound","QA sound","Non-trade alert sound","Chat sound","Show Speech Recognition Overlay","Don't Disturb").

---

## Honest gaps

- **No computed values for the presenter/broadcast cluster.** Both role captures (`proroom-full-presenter.json` role=presenter and `proroom-all-admin.json` role=admin) rendered the nav with the mic/record/screen/webcam/session/TAWK `<li>`s ABSENT (queried by id `unmuteMuteMicrophone`, `dropdownRecording`, `dropdownScreenSharing`, `startStopWebCam` → 0 matches each). Those items require live media/broadcast state (`user.hasMic/hasScreen/hasCam`, launched media) that was not active during capture. Their markup, scoped CSS, and render conditions are fully transcribed from the bundle, but their rendered rects/colors are not directly measured — the `fa-2x` size (32px) and nav-link color (#abb0b5) are inferred from the same scoped rules that the Volume/Reload icons demonstrably resolve to.
- **Font Awesome glyph codepoints** are Private-Use-Area characters (`.fa-<name>::before{content:"<PUA>"}`) that don't render as text here; only glyph *names* are cited, not their exact hex codepoints.
- **`--bs-dropdown-spacer`** (used by the dropstart offset) was not present in the captured cssVariables set, so the exact numeric left-offset of the open volumeControl is taken from the measured rect (x=1771, i.e. ~114px left of the 1885 icon) rather than resolved arithmetic.
- **The count span** (`{rosterCount+simUserCount}`) inside `span.users` was not rendered in the member capture (roster count not visible to this viewer), so its live text/position is unmeasured.
- **The two component style blocks** both define `.volumeControl`/`.volCtrl`/`#dropdownVolume` with a conflicting `#dropdownVolume` width (40px in the nav component vs 31px in the second block). The member capture's computed `a#dropdownVolume` width = 40px, so the nav-component rule is the one that applies to THIS element; the 31px block belongs to a different `[_ngcontent-%COMP%]` scope.
- **`.helpLink`** (Intercom help link, idx9 `FPe`) is gated on `hasSTHelpLink`; it did not render for this room in any capture, so it is documented from the template only.
