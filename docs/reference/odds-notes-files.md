# odds-and-ends.html — Notes / Files (loaded) + capture caveats

From the full loaded dump `files/odds-and-ends.html` (Angular 17, 119k lines).

## MainStage tab bar (as rendered)
`ul#mainTabs.nav-tabs.mainTabset` → tabs `#screens-tab` (active), `#streams-tab` (hidden), `#notes-tab`, `#files-tab`. Each `a.nav-link` wraps `<div class="d-flex"><i class="fas fa-*"></i><span>Label</span></div>`.

## Notes (LOADED) → `NotesPanel.svelte`
- `ul#notesTabs.noteTabset` — one `<li><a class="nav-link">` per note. First tab ("Welcome") carries a `badge badge-success` with `fa-home`; each has a hidden `fa-pen` edit indicator (`#noteUpd-<id>`).
- Real tab names (from screenshots): **Welcome · JC's Daily Briefing · Henry's Workflowy Notes · Sam's Mag 7 index · 1on1 Coaching/Prop Firm & Tool Discounts codes · Taylor's Scorecard Rankings (6/02 CLOSE)**.
- `#notesTabsContent > .tab-pane > .note-container > app-note > #summernoteEdit-<id>` renders **raw user-authored Summernote HTML** (headings/lists/links/tables/images all possible — e.g. "Sam's Mag 7 index" is a one-line formula). Footer `.noteOptions > button.noteDownload` (`fa-download` "Download").
- Build note: render note body as trusted server HTML; do not linkify/transform.

## Files (LOADED but EMPTY) → `FilesPanel.svelte`
- `ul#myTab.files-tabs` → **Files / Images / Sounds**, each `a.nav-link` = `<span>Label</span>` + `<span class="badge rounded-pill bg-danger files-badge">N</span>`. In this capture all counts = **0** and the list is empty.
- Below: `.input-group.st-searchbar` (search input + `fa-search`) + `button.st-fileSeeMore` ("Refresh" + `fa-sync`) + hidden `<audio id="mp3player">` for the Sounds tab.
- **File ROW layout is NOT in any DOM capture** (always 0 files). Reconstruct it from the screenshots: a row = file **name** (link) · **size** (e.g. "297Kb") · **date** (e.g. "May 4, 2026, 4:09:55 PM") · green **Download** button on the right.

## Capture caveats (what no static snapshot contains)
- `app-alert-send-report-modal` — **always** the async "Loading…" state (4 `<!---->` section slots); the resolved report layout is never in a static capture. Build the shell now; design the report sections in Phase 2 (or grab a post-load capture).
- `app-all-user-pmmodal`, `app-session-control-modal` — bodies render async; only shells captured.
- Roster rows + alert/chat lists were empty in `odds-and-ends.html`; row shapes come from `file2`/`file6` + scoped CSS.
