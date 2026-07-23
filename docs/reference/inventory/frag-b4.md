# frag-b4 inventory — fragment-pages file18–file21

**Corpus:** `docs/reference/visual-evidence-deep/fragment-pages/`
**Assignment slug:** frag-b4
**Shared nature (verified):** All four are the same kind of artifact — an isolated **Angular modal component** (raw DOM with `_ngcontent`/`_nghost` attrs, e.g. `_ngcontent-ng-c977335924`) wrapped in a two-part evidence shell: an `evidence-banner` with `evidence-pill`s (source file / N app tags / N modal ids / N audited gaps) and an `evidence-wrap` that inlines the **full ~440KB Bootswatch v4.3.1 (Darkly) + app stylesheet**. Verified with `grep -oE '<app-[a-z-]+'` and `head -c 400` (each `<head>` links `@fortawesome/fontawesome-free/css/all.min.css` and `@import ...Lato...`, then a `Bootswatch v4.3.1` comment).

**CRITICAL marker caveat (verified with python `body.count()` vs `whole.count()`):** the probe markers (`mainTabs`=12, `mainTabset`=12, `noteTabset`=11, `files-tabs`=6, `user-badge-img`=4, `badge-success`=5, `modal-content`=36, `st-searchbar`=5, etc.) return **identical counts in all four files** and occur **0 times in the DOM body** — they are matches inside the shared inlined **stylesheet**, NOT rendered content. The real DOM body (everything after the last `</style>`) is tiny: file18=4674 B, file19=8712 B, file20=2183 B, file21=2205 B, each containing exactly one `modal-content` (body count=1) = one modal. Do not treat the shared marker counts as evidence of these surfaces existing in these captures.

**Role (all four):** `member` — determined by (a) surface semantics (reply / alert Q&A / muted-users / followed-users are all member-facing chat features) and (b) absence of any admin marker: `grep -c` for `msg-box-adm`, `adminTabset`, `presentation-controls`, `kick-user`, `ban-user`, `startPresentation`, `app-camera`, `app-webcam` = **0** in every file. The fragment carries no explicit role attribute; role is inferred, not stamped.

---

# file18.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file18.html.html
- **kind**: html-dom-dump (isolated Angular modal component + evidence-banner wrapper)
- **size**: 450,970 bytes (~440.4 KB; body-only DOM = 4,674 B)
- **role**: member (see shared note; 0 admin markers)
- **format/quality**: raw DOM + inline styles (Angular `_ngcontent`/`_nghost`); NO computed styles/rects, NO states/groups → not a JSON capture
- **surfaces documented**: **Private-reply composer modal** — `<app-reply-modal>`, `id="replyModal"`
- **maps to (our components)**: `web/src/lib/components/modals/ReplyModal.svelte` (name + `id="replyModal"` match)
- **key findings** (cited):
  - Single custom element `<app-reply-modal _nghost-ng-c1823712792>`; `grep 'id="replyModal"'` → 1 hit; evidence pills read `1 app tags` / `1 modal ids` / **`12 audited gaps`** (most gaps of the four).
  - Composer present: `placeholder="Type your message here.."` (grep on `placeholder=`); modal `Close` button carries `aria-label="Close"`.
  - Body contains `class="do-private-reply"` (body count=1) — the private-reply action wrapper; the quoted/original message uses `flex-row-reverse` + `admin-alert mt-2` layout (seen in 18↔19 diff).
  - Modal `modal-title` text is empty in the static capture (dynamic — filled with the target message at runtime).
- **notes**: Best (and only) authority in this set for the reply-modal surface. Distinct from the other three (only file with a `do-private-reply` body node and only 1 modal id).

---

# file19.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file19.html.html
- **kind**: html-dom-dump (isolated Angular modal component + evidence-banner wrapper)
- **size**: 455,008 bytes (~444.3 KB; body-only DOM = 8,712 B — largest body of the four)
- **role**: member (see shared note; 0 admin markers)
- **format/quality**: raw DOM + inline styles (Angular); no computed styles/rects
- **surfaces documented**: **Alert Q&A modal** — `<app-alert-qa-modal>`, `id="alertQAModal"`
- **maps to (our components)**: `web/src/lib/components/AlertQaModal.svelte` (note: this one lives at components root, not `components/modals/`)
- **key findings** (cited):
  - `<app-alert-qa-modal _nghost-ng-c698792182>`; `grep 'id="alertQAModal"'` → 1; pills `1 app tags` / `2 modal ids` / **`9 audited gaps`**.
  - Header visible text `Q&A for Alert:` and empty-state `There are no questions.` (python tag-strip of body).
  - Question composer: `placeholder="Type your question here..."`.
  - Whole-file `alert-qa`=2, `flex-row-reverse`=3, `created-at`=3, `tradeColor`=2, `user-badge-img`=4, `badge-success`=5 (these last markers include stylesheet hits — the empty-state body shows no questions, so badge/created-at nodes are from the referenced alert header template/CSS, not rendered rows).
- **notes**: Only file in the set showing the `alert-qa` surface. `2 modal ids` (the QA modal itself likely nests/refs a second id). Superset of the reply set only in body size, not scope.

---

# file20.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file20.html.html
- **kind**: html-dom-dump (isolated Angular modal component + evidence-banner wrapper)
- **size**: 448,479 bytes (~437.9 KB; body-only DOM = 2,183 B)
- **role**: member (see shared note; 0 admin markers)
- **format/quality**: raw DOM + inline styles (Angular); no computed styles/rects
- **surfaces documented**: **Muted / ignored chat users modal** — `<app-muted-users-modal>`, `id="mutedUsersModal"` + `id="mutedUsersModalLabel"`
- **maps to (our components)**: `web/src/lib/components/modals/MutedUsersModal.svelte` (name + id match)
- **key findings** (cited):
  - `<app-muted-users-modal _nghost-ng-c170421237>`; `grep 'id="mutedUsersModal"'` and `mutedUsersModalLabel` both present → pills `1 app tags` / `2 modal ids` / **`6 audited gaps`**.
  - Visible body text (python tag-strip): title **`Muted Chat Users`**, empty-state **`You don't have any muted/ignored users.`**, footer `Close`.
  - Captured in **empty state** — no user rows present; the list-item template is not exercised here.
- **notes**: Near-twin of file21 by structure (20↔21 diff = only 42 differing lines, the smallest diff of any pair) — same 2-id label pattern and 6-gap count; they differ only in the modal's identity/label/empty-copy. Best authority for the muted-users empty state.

---

# file21.html.html
- **path**: docs/reference/visual-evidence-deep/fragment-pages/file21.html.html
- **kind**: html-dom-dump (isolated Angular modal component + evidence-banner wrapper)
- **size**: 448,501 bytes (~437.9 KB; body-only DOM = 2,205 B)
- **role**: member (see shared note; 0 admin markers)
- **format/quality**: raw DOM + inline styles (Angular); no computed styles/rects
- **surfaces documented**: **Followed chat users modal** — `<app-followed-users-modal>`, `id="followedUsersModal"` + `id="followedUsersModalLabel"`
- **maps to (our components)**: `web/src/lib/components/modals/FollowedUsersModal.svelte` (name + id match)
- **key findings** (cited):
  - `<app-followed-users-modal _nghost-ng-c3991339994>`; `followedUsersModal` + `followedUsersModalLabel` present → pills `1 app tags` / `2 modal ids` / **`6 audited gaps`**.
  - Visible body text: title **`Followed Chat Users`**, empty-state **`You don't have any followed users.`**, footer `Close`.
  - Captured in **empty state** — no followed-user rows; list-item template not exercised.
- **notes**: Structural sibling of file20 (see 20↔21 diff = 42 lines). Best authority for the followed-users empty state. No `data-gap`/annotation nodes exist in body — the "audited gaps" pill is a harness-computed **count only** (grep for `data-gap`/`class*=gap` in body = 0 across all four); gap detail is NOT in these files.

---

## Cross-file summary (evidence-driven)
| file | app tag | modal id(s) | audited gaps | body B | surface | our component |
|---|---|---|---|---|---|---|
| file18 | app-reply-modal | replyModal | 12 | 4674 | private reply composer | modals/ReplyModal.svelte |
| file19 | app-alert-qa-modal | alertQAModal (2 ids) | 9 | 8712 | alert Q&A | AlertQaModal.svelte |
| file20 | app-muted-users-modal | mutedUsersModal(+Label) | 6 | 2183 | muted users (empty) | modals/MutedUsersModal.svelte |
| file21 | app-followed-users-modal | followedUsersModal(+Label) | 6 | 2205 | followed users (empty) | modals/FollowedUsersModal.svelte |

**Authority flags:** These are RAW HTML DOM dumps (inline styles only, no computed-style/rect JSON) → authoritative for **DOM structure, class names, ids, static copy, and Darkly stylesheet**, but NOT for rendered geometry/computed color (no rects/computed styles captured). For pixel/color truth cross-check a JSON capture. The muted/followed captures are **empty-state only** — the populated list-row markup is an honest gap not present in this set.
