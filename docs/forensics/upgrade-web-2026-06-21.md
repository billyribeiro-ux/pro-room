# Web dependency-currency upgrade — 2026-06-21

**Scope:** `web/` (SvelteKit 2 · Svelte 5 runes · TS strict). Bring every dependency to its
latest stable as of 2026-06-21, plus the FontAwesome 5→7 major bump the user explicitly
approved, plus prettier formatting. No app-logic refactors; no unrelated audit fixes.

**Evidence basis:** `pnpm outdated`, `npm view <pkg> version`, and direct grep of the installed
FA7 stylesheet `web/node_modules/@fortawesome/fontawesome-free/css/all.min.css`.

---

## (a) Dependency before → after

Latest column verified against `pnpm outdated` (run 2026-06-21) and corroborated with
`npm view`. All bumps applied to `web/package.json` and `web/pnpm-lock.yaml` refreshed via
`pnpm install`. "Installed after" = resolved version in node_modules / lockfile.

| Package | Before (installed) | After (installed) | Latest evidence |
|---|---|---|---|
| @fortawesome/fontawesome-free | 5.8.1 | **7.2.0** | `npm view @fortawesome/fontawesome-free version` → 7.2.0 (user-approved major) |
| @sveltejs/adapter-vercel | 6.3.3 | 6.3.4 | pnpm outdated Latest 6.3.4 |
| @sveltejs/kit | 2.65.0 | 2.66.0 | `npm view @sveltejs/kit version` → 2.66.0 |
| @tailwindcss/vite | 4.3.0 | 4.3.1 | pnpm outdated Latest 4.3.1 |
| tailwindcss | 4.3.0 | 4.3.1 | pnpm outdated Latest 4.3.1 |
| dompurify | 3.4.10 | 3.4.11 | pnpm outdated Latest 3.4.11 |
| prettier-plugin-svelte | 4.1.0 | 4.1.1 | pnpm outdated Latest 4.1.1 |
| typescript-eslint | 8.61.0 | 8.61.1 | pnpm outdated Latest 8.61.1 |
| vitest | 4.1.8 | 4.1.9 | pnpm outdated Latest 4.1.9 |
| @playwright/test | 1.60.0 | 1.61.0 | pnpm outdated Latest 1.61.0 |
| eslint | 10.4.1 | 10.5.0 | `npm view eslint version` → 10.5.0 |

After the bumps, `pnpm outdated` reports a single remaining row — `@types/node 24.13.2 → 26.0.0` —
which is the documented exception below (intentionally not taken).

### Documented exceptions

1. **Node (`.nvmrc`) — NOT changed.** `/home/user/pro-room/.nvmrc` stays `24.16.0`, the latest
   **LTS** (Krypton). Node 26 is "Current", not LTS. The user explicitly carved Node out to
   "latest LTS". File left byte-for-byte unchanged.

2. **`@types/node` — kept on latest 24.x, NOT 26.0.0.** Pinned via range `^24`, which resolves to
   the latest 24.x = **24.13.2** (`npm view @types/node@24 version` → newest 24.x is 24.13.2).
   `@types/node` must track the Node major actually run; jumping to 26.0.0 would advertise Node 26
   APIs that do not exist on the Node 24 LTS runtime. This is the direct partner of the Node
   carve-out and the idiomatic, evidence-based choice.

---

## (b) FontAwesome 5.8.1 → 7.2.0 glyph audit

### Package layout & style-class evidence (grep of `css/all.min.css`)

- **CSS import path unchanged.** `src/routes/+layout.svelte:11` imports
  `@fortawesome/fontawesome-free/css/all.min.css`. That file still exists in the 7.2.0 package
  (`ls css/` → `all.css`, `all.min.css`). No import-path fix needed.
- **Legacy short style classes retained.** Grep of `all.min.css`:
  - `.fas`, `.far`, `.fab` → **present** (FA7 keeps the FA5 short aliases)
  - `.fa-solid`, `.fa-regular`, `.fa-brands` → also present
  - Therefore `Icon.svelte`'s `fam` logic (`solid→fas`, `regular→far`, `brands→fab`) is still
    valid. **No family-class change made.**
- **Selector format note (methodology):** FA7's minified CSS encodes glyphs as
  `.fa-<name>{--fa:"\fXXX"}` (CSS custom property), not the FA5 `.fa-<name>:before{content:…}`.
  Existence was verified with the pattern `\.fa-<name>(\{|,|:)` (complete class token followed by a
  rule/group/pseudo terminator), not `.fa-<name>:before`.

### Glyph inventory & existence

The complete deduplicated set of glyph names used by `<Icon>` — **104 distinct names** across
solid/regular/brands, gathered from all static `name="literal"` usages **and** every dynamic
`<Icon name={expr}>` source (traced to literals: `metric.icon` in AlertSendReportModal,
`tool.icon` in RichTextEditorModal, `action.icon` in SessionControlModal, `t.icon` in MainStage,
and ternaries incl. `isFollowed ? 'user-check' : 'user-plus'` (user-check reachable only
dynamically), `isMuted ? 'bell' : 'bell-slash'`, `screen.micMuted ? 'microphone-slash' :
'microphone'`) — was grepped one-by-one against `all.min.css`.

**Result: 104 / 104 present. 0 absent. 0 remaps required. 0 blockers.**

FA7 free preserved backward-compatible aliases for every FA5 name this app uses. The FA5 names the
task flagged as historically renamed all still resolve, as the same physical glyph, via grouped
alias rules. Representative grep hits (old name → grouped FA7 rule = evidence):

| FA5 name (kept, unchanged) | FA7 `all.min.css` rule (grep hit) | FA7 canonical alias |
|---|---|---|
| cog | `.fa-cog,.fa-gear{--fa:"\f013"}` | gear |
| cogs | `.fa-cogs,.fa-gears{--fa:"\f085"}` | gears |
| sign-out-alt | `.fa-right-from-bracket,.fa-sign-out-alt{--fa:"\f2f5"}` | right-from-bracket |
| sliders-h | `.fa-sliders,.fa-sliders-h{--fa:"\f1de"}` | sliders |
| sync | `.fa-arrows-rotate,.fa-refresh,.fa-sync{--fa:"\f021"}` | arrows-rotate |
| sync-alt | `.fa-rotate,.fa-sync-alt{--fa:"\f2f1"}` | rotate |
| pencil-alt | `.fa-pencil,.fa-pencil-alt{--fa:"\f303"}` | pencil |
| trash-alt | `.fa-trash-alt,.fa-trash-can{--fa:"\f2ed"}` | trash-can |
| undo-alt | `.fa-rotate-left,...,.fa-undo-alt{--fa:"\f2ea"}` | rotate-left |
| times | `.fa-close,.fa-multiply,.fa-remove,.fa-times,.fa-xmark{--fa:"\f00d"}` | xmark |
| sort-alpha-down | `.fa-arrow-down-a-z,.fa-sort-alpha-asc,.fa-sort-alpha-down{--fa:"\f15d"}` | arrow-down-a-z |
| map-marker-alt | `.fa-location-dot,.fa-map-marker-alt{--fa:"\f3c5"}` | location-dot |
| compress-arrows-alt | `.fa-compress-arrows-alt,.fa-minimize{--fa:"\f78c"}` | minimize |
| volume-mute | `.fa-volume-mute,.fa-volume-times,.fa-volume-xmark{--fa:"\f6a9"}` | volume-xmark |
| dot-circle | `.fa-circle-dot,.fa-dot-circle{--fa:"\f192"}` | circle-dot |
| broadcast-tower | `.fa-broadcast-tower,.fa-tower-broadcast{--fa:"\f519"}` | tower-broadcast |
| poll | `.fa-poll,.fa-square-poll-vertical{--fa:"\f681"}` | square-poll-vertical |
| user-times | `.fa-user-times,.fa-user-xmark{--fa:"\f235"}` | user-xmark |
| exchange-alt | `.fa-exchange-alt,.fa-right-left{--fa:"\f362"}` | right-left |
| edit | `.fa-edit,.fa-pen-to-square{--fa:"\f044"}` | pen-to-square |
| video-slash | `.fa-video-slash{--fa:"\f4e2"}` | (same) |
| microphone-slash | `.fa-microphone-slash{--fa:"\f131"}` | (same) |
| user-check | `.fa-user-check{...}` | (same) |

**Glyph remap table: empty.** Because FA7 free keeps every FA5 alias used here, NO usage site was
renamed. `Icon.svelte` markup (`<i class="{fam} fa-{name}">`) and all 200+ call sites are
unchanged.

**Glyphs left unchanged:** all 104 (full set verified present). The complete list, by family:
- brands (5): apple, github, google, google-play, youtube
- regular (1): smile (also used as solid elsewhere)
- solid (remainder): archive, arrow-left, at, bars, bell, bell-slash, bold, broom,
  broadcast-tower, bug, camera, caret-down, caret-left, caret-right, chart-bar, chart-line, check,
  check-circle, circle-notch, clock, closed-captioning, cog, cogs, columns, comment, comments,
  compress-arrows-alt, copy, desktop, dot-circle, download, edit, envelope, envelope-open,
  exchange-alt, exclamation-circle, exclamation-triangle, expand, file, filter, folder, font,
  globe, home, image, info-circle, italic, link, list-ul, lock, map-marker-alt, microphone,
  microphone-slash, minus, mobile, music, network-wired, palette, paper-plane, pen, pencil-alt,
  play, plus, plus-circle, poll, question-circle, reply, save, search, shield-alt, sign-out-alt,
  sliders-h, smile, sort-alpha-down, spinner, star, stop, stop-circle, sync, sync-alt, times,
  trash, trash-alt, underline, undo-alt, upload, user, user-check, user-plus, user-tie,
  user-times, users, video, video-slash, volume-mute, volume-up, window-maximize, window-minimize,
  wrench.

### `Icon.svelte` change

Only change: the doc comment was updated from "Font Awesome 5 icon" to "Font Awesome 7 icon"
(noting FA7 keeps the legacy `fas`/`far`/`fab` aliases and FA5 glyph names, so the markup is
unchanged). The Svelte MCP autofixer (`mcp__svelte__svelte-autofixer`) was run on the edited
component → `issues:[]`.

---

## (c) Blockers (Pro-only glyphs)

**None.** Every glyph used by the app exists in FA7 **free**. No glyph was moved to Pro; no usage
was left broken.

---

## (d) Final toolchain numbers (before → after)

| Gate | Baseline (before) | After upgrade |
|---|---|---|
| `pnpm run check` | 0 errors / 2 warnings (unused-CSS in UserInfoModal, pre-existing) | **0 errors / 2 warnings** (identical, no new warnings) |
| `pnpm run build` | PASS | **PASS** (`✓ built`, adapter-vercel done) |
| prettier `--check` | 12 files need formatting | **0** — "All matched files use Prettier code style!" after `pnpm format` |
| eslint | 9 problems (6 doc-confirmed false positives) | **9 problems** (same set, unchanged — none in files edited here) |

`pnpm format` reformatted the prettier-flagged files (the count surfaced was 17 — pre-existing
formatting drift, partly newly surfaced by the prettier-plugin-svelte 4.1.0→4.1.1 bump; all are
unrelated to the upgrade and were cleared by the formatter per scope). `check` and `build` were
re-run after formatting and remain green. No regression below baseline on any gate.

---

## CAVEAT — visual fidelity not verified here

Glyph **existence** is proven by grep of FA7's `all.min.css` (above). Glyph **visual fidelity** to
the protradingroom.com reference is **NOT verifiable in this headless environment** (no browser, no
reference image). FA7 redrew a number of glyphs versus FA5, so an icon can exist yet look different.
Before merge, run the repo's pixel-diff harness `web/scripts/pixel-diff.mjs` in a browser against
the reference to confirm no icon regressed visually.
