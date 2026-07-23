# mixed-files/ (directory catalog)

- **path**: `mixed-files/`
- **kind**: html-dom-dump (directory of 51 raw Angular DOM fragments)
- **size**: 51 files, ~40 MB total. Range 108 B (`file34.html`) → 8,300,445 B (`odds-and-ends.html`). Six "big" files (>500 KB): `odds-and-ends.html` (8.3 MB), `file2.html` (5.9 MB), `file3.html` (5.56 MB), `file4.html` (5.07 MB), `file14.html` (3.27 MB), `file6.html` (961 KB), `as-splitter.html` (959 KB), `file-1.html` (174 KB).
- **role**: mixed. Determined by root `<app-*>` component tag per file (grep of first `<app-` tag) plus marker probe: some files are member/room surfaces, some admin modals, some presenter/webcam surfaces (see table).
- **format/quality**: raw DOM + inline styles + Angular `_ngcontent-ng-cXXXXXXXX` / `_nghost` attributes. NOT computed-style/rects JSON — grep for `"cssVariables"|"states"|"groups"|"computedStyle"` returned **zero** matches across all 51 files; `_ngcontent` present (19 in `file7.html`), so these are Angular-serialized DOM fragments, not rendered JSON captures.

## Mapping: mixed-files/ === RAW originals of the fragment-pages (verified)

- `docs/reference/visual-evidence-deep/fragment-pages/` holds 52 files named `<name>.html.html`; each is a **full HTML wrapper** (`<!doctype html><html><head><title>file11.html</title><link ... fontawesome-free/css/all.min.css><style>@import Lato... Bootswatch v4.3.1 / Bootstrap v4.3.1 ...</style>`) around the **verbatim raw body** from the matching `mixed-files/<name>.html`.
- **Spot-check (4 files) confirms the mapping**:
  - `file11.html`: mixed = 2,199 B; fragment = 448,864 B. Raw body starts `<app-debug-log-modal _ngcontent-ng-c977335924=...>`; the fragment contains `app-debug-log-modal` (2×) and `_ngcontent-ng-c3228599039` (11×) — same Angular ids → body embedded verbatim, ~446 KB of CSS/head overhead added.
  - `webcamholder.html`: mixed = 2,241 B (`<app-webcam-holder ... class="webcam-wrapper d-flex ...">`); fragment = 448,924 B, contains `webcam` (15×) / `video` (13×).
  - `avsettingsmodal.html`: mixed = 10,199 B; fragment = 456,892 B.
  - `file7.html`: mixed = 3,263 B; fragment = 449,926 B.
  - Constant ~446 KB delta across all four = the injected Bootswatch/Bootstrap/FontAwesome `<head>`. So **mixed-files = the raw source; fragment-pages = the same fragments re-hosted in a renderable page shell** (and `original-fragments/` holds the 52 matching `.png` screenshots).
- **One extra in fragment-pages, absent from mixed-files**: `important-doc.html` exists as `fragment-pages/important-doc.html.html` but there is **no** `mixed-files/important-doc.html` (`comm -3` shows exactly this one difference). Honest gap: mixed-files is 51, fragment-pages is 52 — the fragment set added one page that has no raw original here.

## Per-file identity (root `<app-*>` tag + size; grepped, not read whole)

| file | bytes | root component | surface |
|---|---|---|---|
| file2.html / file3.html / file4.html | 5.9M / 5.56M / 5.07M | `app-root` (file4 → `app-room`) | full room DOM (member view); **3 distinct dumps** (md5 differ) |
| odds-and-ends.html | 8.3M | `app-alerts` | fullest capture — admin + presenter + roster |
| as-splitter.html | 959K | `app-alerts` | alerts pane / splitter |
| file6.html | 961K | `app-alerts` | alerts pane |
| file14.html | 3.27M | `app-chat-logs-modal` | chat logs modal (admin) |
| file-1.html | 174K | (no app tag) | fragment |
| pagesource.html | 24.7K | `app-root` | page source shell |
| appusersettingsmodal.html / file9.html | 65K each | `app-user-settings-modal` | **duplicate** (identical md5) |
| avsettingsmodal1.html / file10.html | 11.2K each | `app-av-settings-modal` | **duplicate** (identical md5) |
| navbar.html / file5.html | 11.2K each | (no app tag) | navbar — **duplicate** (identical md5) |
| avsettingsmodal.html | 10.2K | (no app tag) | A/V settings variant |
| afterwebcamholder.html | 4.0K | `app-presenter-cams` | presenter cams |
| webcamholder.html | 2.2K | `app-webcam-holder` | webcam holder |
| file12.html | 16.4K | `app-post-alert-modal` | post-alert modal (admin) |
| file13.html | 9.1K | `app-poll-modal` | poll modal |
| file15.html | 4.4K | `app-alert-logs-modal` | alert logs modal |
| file16.html | 1.7K | `app-session-control-modal` | session control |
| file17.html | 3.0K | `app-mobile-app-info-modal` | mobile app info |
| file18.html | 4.3K | `app-reply-modal` | reply modal |
| file19.html | 8.3K | `app-alert-qa-modal` | alert Q&A modal |
| file20.html | 1.8K | `app-muted-users-modal` | muted users |
| file21.html / file24.html | 1.8K each | `app-followed-users-modal` | followed users (two dumps) |
| file22.html | 2.7K | `app-screenshare-preview` | screenshare preview (presenter) |
| file23.html | 1.4K | `app-rec-preview` | recording preview |
| file25.html | 3.0K | `app-scheduled-alerts-modal` | scheduled alerts (admin) |
| file26.html | 2.1K | `app-alert-send-report-modal` | alert send report |
| file27.html | 2.1K | `app-all-user-pmmodal` | all-user PM (admin) |
| file28.html | 21.1K | `app-alerts-advanced-search` | alerts advanced search |
| file29.html | 2.5K | `app-alert-filter-modal` | alert filter |
| file30.html | 5.2K | `app-webrtc-troubleshooter` | WebRTC troubleshooter (presenter) |
| file31.html | 2.2K | `app-rich-text-editor` | rich text editor |
| file32.html | 2.3K | `app-privchat` | private chat |
| file7.html | 3.3K | `app-user-info-modal` | user info modal |
| file8.html | 2.6K | `app-play-youtube-modal` | YouTube player modal |
| file11.html | 2.2K | `app-debug-log-modal` | debug log modal (admin) |
| file33.html / file34.html | 135 B / 108 B | (none) | near-empty stubs |
| connected.html / reload.html / navfile.html / mixednavs.html | 186–651 B | (none) | tiny nav/status stubs |
| dropdownstart.html / dropdownvolume.html | 6.2K / 5.1K | (none) | dropdown menus (start / volume) |
| navbars-room.html / subnavbar.html | 8.6K / 8.4K | (none) | room nav bars |

## maps to (our components)
- Room shell / stage / roster → `file2/3/4` (app-root/app-room), `odds-and-ends.html` (superset with roster).
- Alerts feed → `as-splitter.html`, `file6.html`, `odds-and-ends.html` (`app-alerts`).
- Settings modals → `appusersettingsmodal.html`/`file9`, `avsettingsmodal*`/`file10`.
- Admin modals → `file11` (debug), `file12` (post-alert), `file14` (chat-logs), `file25` (scheduled), `file27` (all-user PM).
- Webcam / presenter surfaces → `webcamholder.html`, `afterwebcamholder.html`, `file22` (screenshare), `file30` (webrtc).
- Nav → `navbar.html`/`file5`, `navbars-room.html`, `subnavbar.html`, dropdowns.

## key findings (cited)
1. **mixed-files is the RAW source for fragment-pages** — verified on 4 files: raw body embeds verbatim inside `fragment-pages/<name>.html.html` (same `_ngcontent-ng-cXXXX` Angular ids; constant ~446 KB head delta). `original-fragments/<name>.html.png` = the 52 rendered screenshots.
2. **`odds-and-ends.html` (8.3 MB) is the richest/superset capture**: marker grep counts — `msg-box-adm` ×1 (admin message box), `presUser` ×3 + `regUser` ×3 (roster with presenter vs regular users), `room-roster` ×5, `mainTabset` ×2, `alert-qa` ×105, `created-at` ×105, `tradeColor` ×26, `users-dropdown-options` ×103. It is the only mixed-file carrying BOTH admin (`msg-box-adm`) and presenter (`presUser`) markers.
3. **`file2/file3/file4` are three DISTINCT full-room dumps** (md5 646e9458… / 629f0d38… / 618920da…), each ~5–6 MB `app-root`, all with identical marker profile: `alert-qa` ×53, `created-at` ×52, `users-dropdown-options` ×52, `room-roster` ×3, `tradeColor` ×13, `mainTabset` ×1, `app-alerts` ×4. Member/room view — no `msg-box-adm`, no `presUser`.
4. **Confirmed duplicates (identical md5)**: `file9.html`≡`appusersettingsmodal.html` (4f3c6a1f…), `file10.html`≡`avsettingsmodal1.html` (def30981…), `file5.html`≡`navbar.html` (5396db9b…). The `file*`-numbered name and the descriptive name are the same byte content.
5. **Badge marker note (re. authority rule)**: these RAW dumps do **NOT** contain `user-badge-img` (grep = 0 in `file2`, `odds-and-ends`, `as-splitter`, `file6`). `odds-and-ends.html` has `badge-success` ×2 but **no** `>New<`/`>Trial<` text nodes. Badge authority remains the JSON computed-style captures, not these DOM dumps — consistent with the non-negotiable warning that prose "New/Trial TEXT badge" claims are unverified.

## notes
- **Best-authority flags**: `odds-and-ends.html` = superset (admin+presenter+roster in one). `file2/3/4` = primary member-room DOM (three variants — diff them, don't assume one). These are raw DOM+inline-style dumps: good for structure/class names/hierarchy, but NOT for computed colors/rects (no computed styles captured here — defer to JSON captures for pixel/color truth).
- **Duplicates**: 3 confirmed byte-identical pairs (see finding 4) — inventory once, not twice.
- **Honest gap**: `important-doc` has a fragment-page + screenshot but no raw original in mixed-files (51 raw vs 52 fragments).
- **Stubs**: `file33.html` (135 B), `file34.html` (108 B), `connected.html` (186 B), `reload.html` (332 B), `navfile.html` (342 B), `mixednavs.html` (651 B) are near-empty — low evidentiary value.
- Directory cataloged as ONE entry per assignment; the 51 files are NOT individually re-inventoried (identity table above is grep-derived, whole-file reads avoided on the six >500 KB files).
