# md-file6-odds — inventory (slug: md-file6-odds)

## ⛔ HONEST GAP — the four assigned `.md` files DO NOT EXIST

The assignment named these files to READ fully under `docs/reference/`:

- `file6-room-area.md`
- `odds-modals-loaded.md`
- `odds-notes-files.md`
- `odds-room-shell.md`

**None of them exist anywhere in the repository.** Evidence:

- `find . -iname "*room-area*" -o -iname "*modals-loaded*" -o -iname "*notes-files*" -o -iname "*room-shell*"` → **zero hits**.
- `ls docs/reference/` → only `_gap-findings-raw.json`, `captures/`, `inventory/`, `visual-evidence/`, `visual-evidence-deep/`. No such `.md` files.
- Full listing of `docs/reference/inventory/*.md` (30 files) contains no `file6-room-area`, `odds-modals-loaded`, `odds-notes-files`, or `odds-room-shell`.
- `git log --all` for those name patterns → no file ever committed under those names.

I did **not** invent content for these. Per rule 4, I report the gap.

**What the names actually refer to:** the assignment slug `md-file6-odds` and the four names map by content to two RAW HTML DOM fragment dumps that DO exist — `file6.html` and `odds-and-ends.html` (the latter contains the room shell, the modals, and the notes/files surfaces, i.e. the "modals-loaded / notes-files / room-shell" the phantom filenames describe). Per rule 0 (raw dumps are the ONLY authority), I cataloged those two real dumps below so this inventory slot is not empty.

---

# file6.html

- **path**: `mixed-files/file6.html`
- **kind**: html-dom-dump (raw Angular DOM + inline styles; `_ngcontent-ng-*` / `_nghost-ng-*` attributes, pretty-printed)
- **size**: 961,125 bytes (~961 KB) — large, probed by grep, not read whole
- **role**: **member** — determined by absence of admin/moderator message markers: `msg-box-adm = 0`, `flex-row-reverse = 0` (own/admin-styled messages), `moderator = 0`, `admin = 0`. Chat is the regular member column (`class="alert-chat-box alert-chat-regular as-split-area"` in the head bytes).
- **format/quality**: raw DOM + inline styles. No `<title>`. Starts mid-tree at `<as-split id="mainAreaSplit">` — a captured fragment of the main split area, NOT a full page.
- **surfaces documented**: alert/chat split column, chat message list, Q&A alerts, Notes tab, Files tab, presentation box, alert + chat headers
- **maps to (our components)**: Stage/PresentationBox (`presentation-box=1`), ChatColumn + message list (`msg-box=51`, `app-st-message=102`), QAAlerts (`alert-qa=51`), NotesPanel (`noteTabset=1`, `noteDownload=6`), FilesPanel (`files-tabs=1`, `files-badge=3`), tab bar (`mainTabset=1`, `mainTabs=3`), per-message menu (`msgMenu=51`), user mention dropdown (`users-dropdown-options=51`)
- **key findings** (cited):
  1. Head byte-0 is `<as-split ... id="mainAreaSplit" class="as-horizontal as-percent as-init">` with first area `class="alert-chat-box alert-chat-regular as-split-area" style="order: 0; flex: 0 0 calc(33.5082% - ...)"` → the alert-chat column is ~33.5% of the horizontal split (inline flex-basis cited).
  2. Chat volume: `msg-box=51`, `alert-qa=51`, `created-at=51`, `msgMenu=51`, `users-dropdown-options=51` all equal → ~51 chat/alert message rows, each carrying a timestamp, a menu, and a mention dropdown.
  3. `tradeColor=13` → 13 trade-colored elements present (trade alert color coding is used in this fragment).
  4. `user-badge-img = 0` in this fragment — the img-based user badges the authority note references are NOT present here (badge markers here are `badge-success=1` only). Do not assert img badges from this file.
  5. `presenter=4` token hits but `presUser=0`, `room-roster=0` → no roster / no presenter-user rows in this fragment; "presenter" occurrences are non-roster (likely presentation-box related), so this is a member chat/notes/files slice without the roster panel.
- **notes**: Fragment (partial DOM tree, no `<html>`/`<title>`). Rendered counterpart exists at `docs/reference/visual-evidence-deep/fragment-pages/file6.html.html` (1,407,788 bytes) and screenshot at `docs/reference/visual-evidence-deep/original-fragments/file6.html.png` (346,216 bytes). Subset of `odds-and-ends.html` (which has ~2× the message count and adds roster + modals).

---

# odds-and-ends.html

- **path**: `mixed-files/odds-and-ends.html`
- **kind**: html-dom-dump (raw Angular DOM + inline styles; `_ngcontent-ng-*` / `_nghost-ng-*`)
- **size**: 8,300,445 bytes (~8.3 MB) — very large, probed by grep, not read whole
- **role**: **mixed** — contains member chat AND admin/roster surfaces: `msg-box-adm=1` (an admin message), `flex-row-reverse=2` (own/admin-aligned messages), `room-roster=5` with `presUser=3` + `regUser=3` (roster showing presenters and regular users), plus `replyModal=1`. Presence of both regular and presenter/admin markers = mixed capture.
- **format/quality**: raw DOM + inline styles. Has `<title>Mastering The Trade</title>`. Head opens with `<div id="connectedMsg" class="notConnectedOverlay animated fadeIn"><i class="fas fa-check"></i> Conected</div>` then `<as-split id="mainAreaSplit">` → a fuller room capture (connection overlay + main split). Note the source typo "Conected" (verbatim from dump).
- **surfaces documented**: room shell / main split, connection overlay, full chat + alerts (both columns), room roster (presenters + members), reply modal, ~50 modal-content blocks, notes tabs, files tabs, presentation boxes, volume controls, search bars
- **maps to (our components)**: RoomShell / main split (`mainAreaSplit`, `mainTabset=2`, `mainTabs=7`), Roster panel (`room-roster=5`, `presUser=3`, `regUser=3`, `rosterImg=4`), Modals layer (`modal-content=50`, `replyModal=1`), ChatColumn ×N (`msg-box=105`, `app-st-message=204`, `alert-qa=105`, `created-at=105`), NotesPanel (`noteTabset=2`, `noteDownload=12`), FilesPanel (`files-tabs=2`, `files-badge=7`), PresentationBox ×2 (`presentation-box=2`), volume/AV controls (`volumeControl=8`), search (`st-searchbar=4`), admin message variant (`msg-box-adm=1`), reversed/own-message alignment (`flex-row-reverse=2`)
- **key findings** (cited):
  1. `<title>Mastering The Trade</title>` — this dump is branded/titled (unlike file6.html which has no title), i.e. a full-room capture rather than a bare fragment.
  2. Roughly **double** file6.html's chat: `msg-box=105` vs 51, `app-st-message=204` vs 102, `alert-qa=105` vs 51, `created-at=105` vs 51 → two chat columns' worth of messages captured.
  3. `modal-content=50` — a large modal layer is present in the DOM (file6.html has 0 `modal-content`), so this is the source of truth for modal surfaces. `replyModal=1` confirms the reply modal specifically.
  4. Roster is real here: `room-roster=5`, `presUser=3`, `regUser=3`, `rosterImg=4` → roster panel with 3 presenter rows, 3 regular-user rows, avatar images. `grep "roster-body\|roster-item\|roster-user" = 0` → the roster uses different inner class names than those guesses (verify inner structure against this dump before building roster item markup).
  5. `user-badge-img = 0`, `appusersettings = 0`, `avsettings = 0`, `webcamholder = 0` — despite modal-content=50, these specific settings/webcam/img-badge classes are NOT in this dump; do not assert their presence here. `msg-box-adm=1` + `flex-row-reverse=2` are the only admin-alignment evidence.
- **notes**: **Best authority of the two** for room shell, roster, and modals (superset of file6.html). Rendered counterpart at `docs/reference/visual-evidence-deep/fragment-pages/odds-and-ends.html.html` (8,747,134 bytes); screenshot at `docs/reference/visual-evidence-deep/original-fragments/odds-and-ends.html.png` (207,259 bytes). Raw DOM only — has inline styles but NO computed styles/rects, so pixel values must come from the JSON captures in `docs/reference/captures/`, not this file.

---

## Related evidence (not assigned, listed for cross-reference)

- `docs/reference/visual-evidence-deep/fragment-pages/file6.html.html` — rendered version of file6.html (1.41 MB)
- `docs/reference/visual-evidence-deep/fragment-pages/odds-and-ends.html.html` — rendered version (8.75 MB)
- `docs/reference/visual-evidence-deep/original-fragments/file6.html.png` — screenshot (346 KB)
- `docs/reference/visual-evidence-deep/original-fragments/odds-and-ends.html.png` — screenshot (207 KB)

All grep counts above use `grep -oc` (matching-line counts) on the raw dumps; treat them as row-order-of-magnitude, exact-for-presence.
