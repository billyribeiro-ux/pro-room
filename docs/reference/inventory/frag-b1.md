# frag-b1 inventory — fragment-pages file5–file8

All four are single-file HTML "evidence viewer" pages: a `<!doctype html>` wrapper with an
`evidence-banner` header (pill metadata) plus a `<div class="evidence-wrap">` containing a
**pretty-printed raw Angular DOM fragment** (attributes carry `_ngcontent-ng-c*` / `_nghost-ng-c*`
and Angular `<!---->` anchor comments). The bulk of each file's bytes is an inlined Bootstrap/Darkly
`<style>` block (Darkly teal `#00bc8c`, danger `#e74c3c`, focus ring `#375a7f40` all present in
`<style>`), so raw grep counts of class names include CSS-rule occurrences, not just DOM usage —
each finding below distinguishes DOM usage from CSS.

- **format/quality**: raw DOM + inline styles (NOT computed styles/rects; no `states`/`groups` JSON).
- **fonts**: `@import` of `Lato:400,700` in every file's head `<style>`.
- **theme**: root wrapper carries `class="darkTheme lightTheme"` (verified in file5).

---

# file5.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file5.html.html
- **kind**: html-dom-dump (Angular fragment inside an evidence viewer wrapper)
- **size**: 457,835 bytes (~447 KB; under the 500 KB whole-read threshold but dominated by inlined CSS)
- **role**: member (default room chrome; no admin/presenter-only controls — `msg-box-adm` = 0, `avsettings`/`appusersettings`/`webcamholder` = 0; determined by absence of admin markers + volume/DND being a generic viewer menu)
- **format/quality**: raw DOM + inline styles
- **surfaces documented**: top app navbar (`navbar navbar-expand-md navbar-dark fixed-top mainAppNav`) + **Volume / audio-settings dropdown** and **Do-Not-Disturb** menu
- **maps to (our components)**: top-bar / room header component; a `VolumeControl` / audio-settings popover; per-channel notification (Do-Not-Disturb) toggles
- **key findings** (cited):
  1. Evidence pills read `0 app tags`, `1 modal ids`, `17 audited gaps` (grep of `<span class="evidence-pill">`). So this capture has no Angular `<app-*>` custom elements — it is plain navbar/dropdown markup.
  2. Visible text of the wrap: `( No one is speaking ) Volume Volume Mute Alert sound on QA sound on NTA sound on Chat sound on Subtitles on Don't Disturb Reload` (perl strip of `evidence-wrap` after removing `<style>`). Confirms four independent sound channels: **Alert, QA, NTA, Chat**, plus **Subtitles** and **Reload**.
  3. IDs present: `id="dropdownVolume"`, `id="presentation-subtitles"`, `id="navbarsRoom"`, `id="cssLogo"`, and five DND toggle ids — `alert-donot-disturb`, `app-donot-disturb`, `chat-donot-disturb`, `non-trade-donot-disturb`, `qa-donot-disturb` (grep `id="..."`). These map 1:1 to the four sound channels + a global app-DND.
  4. Navbar icons captured verbatim: `sidebar-menu` (`fas fa-bars`, title "Open Sidebar"), `users ... (fas fa-user, title "Users Connected")`, `mobile-info-app-btn` (`fas fa-mobile`, `data-bs-target="#mobileAppInfoModal"`) (diff hunk lines 60–98).
- **notes**: Near-identical wrapper/scaffold to file7 & file8 (same navbar, same inlined CSS) — the three differ only in the one panel/modal each captured. file5 is the **best authority for the navbar + volume/DND menu**.

---

# file6.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file6.html.html
- **kind**: html-dom-dump (Angular fragment; the full room stage)
- **size**: 1,407,788 bytes (~1.34 MB; >500 KB — inspected by structure/grep, NOT whole-read)
- **role**: mixed, viewed as member (chat "Alerts" feed + presenter cams/webcam surfaces both present; no admin-compose controls seen — `msg-box-adm` = 0; role inferred from the message dropdown offering only User Info / Mention / Copy, not admin actions)
- **format/quality**: raw DOM + inline styles
- **surfaces documented**: the **whole trading room** — `app-alerts`, `app-chat`, `app-roomscroller`(×2), `app-st-message`(×51 message rows), `app-note`(×6 note tabs), `app-presentationarea`, `app-presenter-cams`(×2), `app-webcam-holder`, presentation box + subtitles
- **maps to (our components)**: chat/alerts feed + message row component; notes panel/tabset; presentation stage + presenter cams / webcam holder; roomscroller/virtual list
- **key findings** (cited):
  1. Evidence pills: `8 app tags`, `0 modal ids`, `21 audited gaps`. `<app-*>` census (grep `<app-`): `app-alerts`×1, `app-chat`×1, `app-note`×6, `app-presentationarea`×1, `app-presenter-cams`×2, `app-roomscroller`×2, `app-st-message`×51, `app-webcam-holder`×1.
  2. **Message row structure** (awk-extracted first `<app-st-message>`): host `app-st-message` → `div.msg-box pb-1 ng-star-inserted` carrying an **inline `background-color: rgb(215,215,215)`**; the kebab menu is `a.msgMenu.dropright` (glyph `⠇`, `style="color: rgb(215,215,215); filter: invert(1);"`) opening `div.dropdown-menu.users-dropdown-options` with items **User Info** (`fas fa-user`), **Mention** (`fas fa-reply`), **Copy** (`fas fa-copy`). Note an original-source typo `clas="d-flex flex-column ..."` is preserved in the dump.
  3. **Per-message metadata classes** (grep class= counts): `class="created-at mr-2"` ×51 (one timestamp per row) and a **QA button** `class="btn btn-sm btn-secondary me-1 alert-qa ng-star-inserted"` ×51 (one per row). `flex-row-reverse` has **0 DOM class usages** here (the single grep hit is the CSS rule only) → no own-message reversed layout in this capture.
  4. **Real trade-alert content** (perl strip of wrap): authors `LornaBot`, `heather (3) ✅`, `Danielle`, `Danielle Shay`; timestamps like `6/8/26, 8:00 AM`; TOS order strings e.g. `BOT +1 VERTICAL SPX 100 (Weeklys) 10 JUNE 26 7340/7330 PUT @1.30 LMT` and `Executed @ 2026-06-08 11:41:21`. `tradeColor` CSS = `color: var(--app-link-color); text-decoration: underline`.
  5. **Files badge**: `class="badge rounded-pill bg-danger files-badge"` ×3 (unread-file count pills). `user-badge-img` appears only in the `<style>` block here (`.user-badge-img{width:auto;height:100%;max-height:20px}`), 0 DOM `<img>` usages found in this fragment.
- **notes**: The richest, most authoritative dump of the three-panel room and the chat message component. **Best authority for**: message row layout, msgMenu actions, created-at/QA/badge chrome, and real alert text. Superset of the chat surfaces hinted at elsewhere.

---

# file7.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file7.html.html
- **kind**: html-dom-dump (Angular fragment; single modal)
- **size**: 449,926 bytes (~439 KB; dominated by inlined CSS)
- **role**: member (user-context actions a member sees on another user; no admin-only actions — `msg-box-adm`/`avsettings` = 0)
- **format/quality**: raw DOM + inline styles
- **surfaces documented**: **User Info modal / popover** (`<app-user-info-modal>`, `id="user-modal"`)
- **maps to (our components)**: user-info / user-context modal (opened from the message `msgMenu → User Info`)
- **key findings** (cited):
  1. Evidence pills: `1 app tags`, `1 modal ids`, `11 audited gaps`. The one app tag is `<app-user-info-modal` and the one modal id is `id="user-modal"` (grep).
  2. Visible wrap text: `Offline @Mention Private Chat Follow Mute Close` (perl strip) — the modal's status line (`Offline`) and its action set: **@Mention, Private Chat, Follow, Mute, Close**.
  3. Same navbar/scaffold CSS and wrapper as file5/file8 (identical inlined `<style>`; diff vs file5 differs only in `<title>`, pills, and the captured fragment).
- **notes**: Duplicate scaffold of file5/file8; unique payload = the User Info modal. **Best authority for** the user-info modal actions. Verify against raw dumps before trusting any prose that describes this modal differently.

---

# file8.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file8.html.html
- **kind**: html-dom-dump (Angular fragment; single modal)
- **size**: 449,253 bytes (~439 KB; dominated by inlined CSS)
- **role**: presenter/admin surface, captured in member scaffold (a "Play YouTube For All" broadcast control is a presenter/admin action; determined from the modal's "For All" broadcast wording)
- **format/quality**: raw DOM + inline styles
- **surfaces documented**: **Play-YouTube modal** (`<app-play-youtube-modal>`, `id="play-youtube-modal"`)
- **maps to (our components)**: presenter "play YouTube to room" modal / broadcast-media dialog
- **key findings** (cited):
  1. Evidence pills: `1 app tags`, `1 modal ids`, `9 audited gaps`. The one app tag is `<app-play-youtube-modal` and the one modal id is `id="play-youtube-modal"` (grep).
  2. Visible wrap text: `Play YouTube For All Save Play For All Close` (perl strip) — buttons **Save Play For All** and **Close**, heading **Play YouTube For All**.
  3. Same navbar/scaffold CSS and wrapper as file5/file7 (diff vs file5 differs only in `<title>`, pills, and captured fragment).
- **notes**: Duplicate scaffold of file5/file7; unique payload = the Play-YouTube broadcast modal. **Best authority for** that modal. This is the only presenter/admin-flavored surface in the frag-b1 set.

---

## Cross-file summary (frag-b1)
- file5, file7, file8 share an **identical page scaffold** (same navbar markup + same inlined Darkly/Bootstrap CSS); they differ only in the single fragment each captured (navbar+Volume/DND, User-Info modal, Play-YouTube modal respectively). Established by `diff file5 vs file7/file8` showing changes only in `<title>`, evidence pills, and the wrapped fragment.
- file6 is the outlier: the **full three-panel room** with 51 real chat/alert message rows — the primary chat-component authority.
- All are raw DOM + inline styles (no computed-style/rect JSON). Class-name grep counts are inflated by the large inlined `<style>` block, so DOM-vs-CSS was disambiguated per finding above.
