# 00 — END-TO-END PLAN OF ATTACK (pro-room ⇄ protradingroom.com)

Synthesised by the principal from the 7 forensic dossiers in this folder (01–07),
each a live-app-vs-capture diff (`ours=X vs ref=Y`, evidence-cited). Mandate:
**perfect match, hard evidence only, no assumptions, EVIDENCE GAP where the
captures don't cover it.** Nothing here is implemented yet — this is the sign-off
gate before any app-code change.

Stack verified up: Postgres 16 + Redis (local), Rust API :8081 (room → 200,
super-admin caps), web :5174. Member role rendered live via harness
capability-interception. Fonts (Open Sans) confirmed loading.

---

## 1. Overall verdict (how close are we?)

The clone is **structurally very close**: tokens, colours, the folder-tab chrome,
splitter grip PNG (byte-exact), tabbar geometry, sidebar metrics, navbar palette
all MATCH on hard evidence. The deltas cluster into a **small set of real pixel
misses**, a **set of dead controls**, **form-field-id hygiene**, and a **handful of
structural divergences that are product decisions** (where our app is a deliberate
superset of the reference).

| Surface | Match | Headline |
|---|---|---|
| Topnav chrome | ★★★★☆ | bg/height/glyphs/volume+reload exact; `.users` margin 5→4, height 25→18; right-cluster drifts ~12px (derivative) |
| Presenter broadcast controls | 🕳️ GAP | never in any capture — **do not remove**; needs presenter gap-capture |
| Sidebar drawer | ★★★★☆ | 250px/white/typography exact; **hover bg wrong (#e9ecef→#111111)**, separator opacity, mini-btn height |
| Alerts panel | ★★★★☆ | header/splitter/rows mostly exact; **Q&A badge colour wrong**; `+`/composer are structural extras (decision) |
| Chat panel | ★★★★☆ | header/tabs/#45a2ff fill exact; **composer shape (pill→8px), textarea 30→35/300→400, placeholder** |
| Stage + tabbar | ★★★★★ | tabs/geometry/tokens exact; **default tab Screens→Notes (P0)**; notes body colour |
| Modals (21) | n/a vs pixels | bodies are EVIDENCE GAPs (click-triggered); many **dead controls**, form-id gaps, 2 structural (PostAlert tabs, Poll dims) |

---

## 2. Fix backlog — TIER 1: unambiguous pixel-perfect fixes (hard evidence, no decision)

Each is a direct `ours→ref` correction with a cited number. These can ship as a
depth-first pixel pass, surface by surface, re-verified side-by-side after each.

**Sidebar** (`web/src/lib/components/RoomSidebar.svelte`)
- T1.1 Item/sub-item **hover**: `:410-413,:450-453` → `background:#111111; color:inherit` (ref `.sidebar-item:hover{bg:rgb(17,17,17)!important}` + `.sidebar-item{color:inherit!important}`). [02 P1]
- T1.2 Separator **opacity**: `:357-361` → add `opacity:0.25` (AUD[9]). [02 P2]
- T1.3 Roster mini-btn **height**: `:492-502` → drop `line-height:0`, `height:27px` (AUD[41/43/45]). [02 P3]

**Topnav** (`web/src/lib/components/RoomTopNav.svelte`)
- T1.4 `.users` **margin** `:275` `0 5px`→`0 4px` (topnav.json[48]). [01 #3]
- T1.5 `.users` **height** `:263-277` 25px→18px (reduce `gap:0.3rem`; AUD[48].h=18). [01 #4]
- T1.6 (low) bars box `.menu-btn` height `:231-236` 22→31 (line-height collapse; glyph already matches). [01 #7]

**Stage / Notes** (`MainStage.svelte`, `NotesPanel.svelte`)
- T1.7 **P0 default tab**: `MainStage.svelte:63` `$state('screens')`→`'notes'`, keep `activeTab=$derived(locked?'screens':tab)` at :69 (ref `#notes-tab.active`). [05 P0]
- T1.8 Notes body **text colour**: `NotesPanel.svelte:253` `#1f2430`→`#676767` (`--note-text-color`). [05 P2]

**Chat composer** (`web/src/lib/components/ChatPanel.svelte`)
- T1.9 holder **radius** `:538` `999px`→`8px` (`#textAreaHolder`). [04 P1]
- T1.10 textarea **height** `:541-556` 30→`min-height:35px`; **weight** 300→400 (`.txt-area`). [04 P1]
- T1.11 **placeholder** colour → `#999999` (`.form-control::placeholder`). [04 P1]
- T1.12 `.ic` **padding** `:557-568` 4px→5px (`.textAreaBtns`). [04 P2]
- T1.13 remove standalone `<Icon name="caret-down">` `:158` (ref gear has no caret glyph; use `::after` if a dropdown is added). [04 P2]

**Alerts** (`web/src/lib/components/AlertFeed.svelte`)
- T1.14 **Q&A badge** `:544-559` → `bg:#6c757d; color:#fff; border:1px #6c757d; radius:4px` (`.alert-qa.btn-secondary`). [03 P3]
- T1.15 row **padding model** `:440-448` → box `0 0 4px 0`, child insets `.created-at mr 8px`, `.body margin 0 8px` (ref `pb-1`+`mx`/`mr-2`). [03 P4]
- T1.16 (low) body **weight** `:578-586` →300; avatar 36→39×35. [03 P5/P6]

---

## 3. Fix backlog — TIER 2: wire DEAD controls (behavioural; evidence = "ours do nothing")

- T2.1 **Chat search** `ChatPanel.svelte:156` → open `AdvancedSearchModal` (mount + state). [04 C1 / punch-list]
- T2.2 **Chat gear** `:157` → open `SettingsModal`. [04 C2]
- T2.3 **Chat emoji/image/GIF** `:255-258` → wire emoji picker / file input / GIF picker (or hide until built). [04 C6]
- T2.4 **Mount the modals** in the room page that exist but aren't mounted (AdvancedSearch/Settings/AlertFilter wiring per punch-list dossier).
- T2.5 **PollModal is orphaned** (`+page.svelte:56 showCreatePoll` never set) → add the "New poll" trigger in the Alerts section (header + bottom button), gated `can_post_alert`. [06 #2 / punch-list]
- T2.6 Modal dead callbacks: UserInfo @Mention/Follow/Mute, PlayYouTube Save/Play, AVSettings Save, SessionControl onEndSession, AdvancedSearch onSearch, ScheduledAlerts onSchedule/onDelete — wire or explicitly stub. [06/07]
- T2.7 **ReplyModal is dead code** (never imported) — decide: wire into chat/alert reply, or remove. [07 #4]

---

## 4. Fix backlog — TIER 3: form-field id/name hygiene (DevTools warning; purely additive)

≈45–50 form fields across modals lack id/name (behaviour-neutral; exact line-by-line
tables in dossiers 06 & 07 and the form-id audit). Biggest: **SettingsModal** (~26–31),
**PostAlertModal** (12). Apply `id`+`name` (interpolated for `{#each}` colour inputs),
no `<label for>` needed (fields are wrapped in labels). Keep `check` 0/0. [06/07]

---

## 5. Fix backlog — TIER 4: STRUCTURAL DIVERGENCES — **need your decision** (do not auto-apply)

These are places our app deliberately diverges from the reference. Each is a product
call, not a pixel fix; some contradict the brief's earlier "what already matches".

- **D1. Alerts `+` button + inline composer.** Reference alerts header = search + gear ONLY; posting is gear→modal (`PostAlertModal`). Ours adds a `+` icon and an inline `Symbol/Buy/Note/Post` form. [03 C2/C3] → **Match reference** (remove `+`/composer, post via gear menu item) **or keep our inline composer** as an intentional improvement?
- **D2. Chat "Send" button.** Reference composer = icon-bar + Enter-to-send, no labelled Send. Ours adds a blue "Send" pill (we also support Enter). [04 C4] → remove to match, or keep as superset?
- **D3. Presenter broadcast `.nav-controls`.** Reference navbar contains none — **but they were never rendered in any capture** (idle/member), and the brief intentionally placed them as bare muted-gray nav icons. [01 C1, E1] → **Resolve via the presenter gap-capture** (real placement/size) before any change; do NOT remove blind.
- **D4. PostAlertModal tabs.** Ours = 5 tabs (text/url/image/gif/video); reference = 3 (`#nav-text`/`#nav-url`/`#nav-img` "Image/GIF/Video"). [06 #4] → restructure to 3?
- **D5. PollModal redesign.** Ref `pollModalHolder` = 580×553, radius 4, bg #1e1e1e, title "Enter your poll question:", footer "Save To Canned" + "Send Poll". Ours = 440px/#103d5c/"Create a poll"/"Cancel"+"Send". [06 #3] → redesign to ref geometry (keeping OUR copy per the brand caveat)?
- **D6. Sidebar extras.** A/V Settings, expanded Archives children, Admin group, in-drawer close-X (collides with PTR link) — none in the reference capture, but Archives is a *collapsed* dropdown and admin-sidebar may exist behind a gap. [02 #5/#8, E1] → keep (superset) / relocate / remove? Blocked on the Archives-expanded + admin-role gap-capture.
- **D7. Brand slot.** Reference = `img.brand-logo` 200×18; ours = room-name text. **Per the brief's reference-data caveat this is intentional (our content is text, theirs is a logo image).** → **No change** unless you say otherwise. (Listed for completeness.)
- **D8. "Connected" pill / ConnectionOverlay.** No reference counterpart (EVIDENCE GAP). Likely legitimate transient UX → keep, but it must not occupy the reference navbar's right cluster.

---

## 6. EVIDENCE GAPS to close before claiming "perfect" (capture or seed)

**You run `docs/pixel-capture-gaps.js`** (presenter + member) to capture:
- presenter **broadcast controls** real placement/size (D3)
- chat/alert **gear dropdown** contents (T2.2 styling)
- **share-screen picker** (punch-list)
- **PostAlert / Poll** modal exact dims (partly captured: poll 580×553)
- **Archives dropdown** + **admin-role sidebar** (D6)

**I can seed locally** (DB access) to close data-empty gaps myself — no capture needed:
- alert rows, chat rows (confirm row pixels: 03 B35-61, 04 B43-54)
- notes + files rows, the green "Welcome" `badge-success` (05 B34/37/48, E)

---

## 7. Proposed depth-first sequence (each: fix → side-by-side re-verify → your sign-off → next)

1. **Stage/tabbar** — T1.7 (P0 default Notes) + T1.8. Smallest, highest-visibility, zero risk.
2. **Sidebar** — T1.1–T1.3 (hover/separator/mini-btn). All hard-evidence.
3. **Topnav** — T1.4–T1.6.
4. **Chat composer** — T1.9–T1.13.
5. **Alerts pixels** — T1.14–T1.16.
6. **Seed data** → re-verify alert/chat/notes/files rows (close §6 data gaps).
7. **Tier 2** dead-control wiring (chat search/gear/pickers, poll trigger, modal callbacks).
8. **Tier 3** form-field ids (mechanical sweep).
9. **Tier 4** structural items — only the ones you approve in §5, in priority order.
10. **Gap-capture-blocked** items (D3/D6, picker) once your JSONs land.

Throughout: Svelte 5 runes + svelte-autofixer on every `.svelte`; FA5 Free 5.8.1
glyphs only; `pnpm --prefix web run check` stays 0/0; side-by-side screenshot +
computed-style proof per surface before sign-off.
