# Forensic Audit — AREA `rust-db`

**Scope:** `server/crates/server/src/db/*.rs` (19 files) + `server/migrations/0001…0013` (13 files).
**Mode:** READ-ONLY, per-file, doc-grounded. No source modified.

**Tooling note:** There is **no Rust MCP server** in this environment. As instructed, authoritative
documentation was pulled live from **docs.rs via WebFetch** (cited per file) and corroborated with
**live cargo** (`cargo 1.94.1`). Workspace state is taken as established by the prompt:
**clippy 0/0, 25 tests passing** — not re-run wholesale; only targeted checks performed.

**Baseline checks performed:**
- `rg 'format!|push_str|write!' server/crates/server/src/db/` → **single hit**, `users.rs:305`,
  which builds an *error-context* string (`format!("user-delete cascade: {stmt}")`), **not SQL**.
  ⇒ **Zero string-interpolated SQL in the entire module. 100% parameterized.**
- `.sqlx/` offline cache present (≥10 `query-*.json`) ⇒ `query!` macros are compile-time verified
  against a captured schema; runtime `query_as` repos are the documented exception (live DB absent).

---

## DOCS.RS PAGES PULLED (authoritative, shared across files)

- **`sqlx::query!`** — "Bind parameters in the SQL string are specific to the database backend:
  Postgres: `$N` where `N` is the 1-based positional argument index". "The query must be a string
  literal … or else it cannot be introspected (and thus cannot be dynamic…)." ⇒ injection-proof by
  construction; parameters are bound, never interpolated.
- **`sqlx::query_as`** — "A variant of `query!` which takes a path to an explicitly defined struct."
  Runtime form binds via `.bind()` (positional `$N`), maps columns→struct via `FromRow`.
- **`sqlx::FromRow`** — "The generated implementation will consist of a sequence of calls to
  `Row::try_get` using the name from each struct field." "Nullable columns require `Option<_>`."
- **`sqlx::Transaction`** — "A transaction should end with a call to `commit` or `rollback`. If
  neither are called before the transaction goes out-of-scope, `rollback` is called." ⇒ atomicity +
  rollback-on-drop guaranteed.
- **`sqlx::Acquire::begin`** — `fn begin(self) -> …Result<Transaction<'c, Self::Database>, Error>`;
  implemented for `&Pool<DB>` (so `pool.begin()` is valid).
- **`sqlx::postgres::types`** — `i64`↔`BIGINT/BIGSERIAL/INT8`; `i32`↔`INT/SERIAL`; `bool`↔`BOOL`;
  `uuid::Uuid`↔`UUID`; `time::OffsetDateTime`↔`TIMESTAMPTZ`; `String/&str`↔`TEXT/VARCHAR/CITEXT`;
  "One-dimensional arrays are supported as `Vec<T>` or `&[T]`" (backs `= ANY($1)`).
- **`time::OffsetDateTime`** — "the current date and time in UTC" via `now_utc()`; offset-aware;
  subtraction yields a `Duration` (`badges.rs` uses `(now - created_at).whole_days()`).
- **`uuid::Uuid`** — maps 1:1 to Postgres `UUID` (all id newtypes go through `.as_uuid()`).

**Money/amount rule:** there are **no monetary columns** in this schema. Alerts carry
`symbol/side/note` (all `text`); there is no price/qty/amount field anywhere. The only `BIGINT` is
`files.size_bytes`, mapped end-to-end as `i64` (correct). The i64/BIGINT rule is therefore **N/A but
satisfied** for the one wide-integer column present.

---

## PER-FILE BLOCKS

### `db/mod.rs` · 42 LOC
Purpose: pool construction (`PgPoolOptions::max_connections(10)`) + `migrate!`.
Docs: `PgPoolOptions`, `Acquire`. Findings:
- **INFO** `mod.rs:33` — pool capped at 10 connections; fine for the workload but a fixed magic
  number (no `min_connections`/`acquire_timeout`). Fix: none required; consider
  `.acquire_timeout(..)` so a saturated pool fails fast rather than hanging a request.
- **OK** Migrations run on connect; errors `.context`-wrapped.

### `db/audit.rs` · 30 LOC
Purpose: append-only authz audit insert. Docs: `query!`.
- **OK** Single `query!` INSERT, all `$N` bound. `actor_id` correctly `Option<Uuid>` (column nullable).
- **INFO** Writes go to `pool` directly — append-only log, no transaction needed (single statement).

### `db/identities.rs` · 26 LOC
Purpose: link login identity. Docs: `query!`, enum casts.
- **OK** `$2::text::identity_provider` casts a bound `&str` into the enum — parameterized, idiom-safe.
- **OK** `ON CONFLICT (provider, provider_subject) DO NOTHING` matches the `UNIQUE` in 0001.

### `db/magic.rs` · 45 LOC
Purpose: single-use magic-link tokens. Docs: `query!`, `time::OffsetDateTime`↔TIMESTAMPTZ.
- **OK** `consume` is a single guarded `UPDATE … WHERE consumed_at IS NULL AND expires_at > now()
  RETURNING email` — atomic single-use, no read-then-write TOCTOU. Correct.
- **LOW** `magic.rs` / migration 0001 — `magic_link_tokens` has **no index on `expires_at`** for
  reaping; lookups are by the UNIQUE `token_hash` (indexed), so not hot, but a cleanup job will scan.

### `db/oauth.rs` · 55 LOC
Purpose: transient OAuth state. Docs: `query!`.
- **OK** `consume` uses `DELETE … RETURNING provider::text AS "provider!"` — single atomic consume.
- **OK** `"provider!"` non-null override on the cast column is correct (cast can't be inferred NOT NULL).

### `db/branding.rs` · 76 LOC
Purpose: singleton branding row. Docs: `query!` (read) + runtime `query` (writes).
- **OK** Singleton enforced by `id boolean PK CHECK(id)` (0012); all writes `WHERE id = true`.
- **OK** `set_name(name: Option<&str>)` binds `None` to a **nullable** `text` column — type-correct.
- **INFO** Mixed API (read via `query!`, writes via runtime `query`) — intentional; writes don't need
  the cache. Consistent with module convention.

### `db/files.rs` · 162 LOC
Purpose: file metadata. Docs: `query!`, `i64`↔BIGINT, FromRow-less mapping via `map_file`.
- **OK** `size_bytes` is `i64` ↔ `bigint` (0005) **end-to-end** — correct wide-int mapping.
- **OK** `list` filter `($2::text IS NULL OR category = $2)` is fully parameterized (nullable bind).
- **OK** `delete … RETURNING storage_name` lets the caller unlink bytes — single round-trip, room-scoped.
- **INFO** `category` is free `text` + `FromStr` fallback to `File` on parse miss (`files.rs:28`);
  acceptable, but the column has **no CHECK constraint** (unlike `messages.channel`) so junk is storable.

### `db/notes.rs` · 170 LOC
Purpose: room notes. Docs: `query!`, `i32`↔INT.
- **OK** All five fns use `query!`; `position` `i32`↔`integer`. Room-scoped on every read/write.
- **LOW** `create` computes `position` via a correlated `SELECT COALESCE(MAX(position),-1)+1 …` in the
  same INSERT (`notes.rs:96`). Single statement (atomic), but **two concurrent creates can collide**
  on the same position (no UNIQUE(room_id,position)); ordering is then by `created_at` tiebreak
  (`list` orders `position ASC, created_at ASC`), so it self-heals visually. Fix: optional
  `UNIQUE(room_id, position)` + retry, or accept the tiebreak.

### `db/sessions.rs` · 111 LOC
Purpose: session create/resolve/revoke. Docs: `query!`, `query_scalar`, enum `::text` casts.
- **OK** `resolve` filters `revoked_at IS NULL AND expires_at > now()` then rejects non-`active` users
  in Rust — correct layered check. `"global_role!"`/`"status!"` non-null overrides on casts.
- **OK** `active_token_hashes` uses `query_scalar` → `Vec<String>` (idiomatic for one column).
- **OK** Lookups hit `token_hash` (UNIQUE-indexed, 0001) and `user_id` (`idx_sessions_user`).

### `db/users.rs` · 315 LOC
Purpose: user CRUD + dev bypass + hard-delete tx. Docs: `query!`, `query_as`, `Transaction`, citext.
- **OK** `email` is `citext`; docs: "SQLx generally considers `CITEXT` … compatible with `String`".
  Binding `&str` is correct.
- **OK** **`delete` (`users.rs:292-314`) is a correct multi-statement transaction**: `pool.begin()`,
  four `DELETE`s + final `DELETE FROM users`, then `commit()`. Per docs, an early `?` drops `tx` ⇒
  **rollback-on-drop** — atomic. The static statements live in an array and are `.bind()`-ed (the
  lone `format!` here is the *error context*, not SQL).
- **MED** `count_active_super_admins` (`users.rs:272`) filters `global_role::text = 'super_admin'`
  casting the enum to text per-row. Correct result, but `::text` on a column **defeats any index** on
  `global_role`. Low row count today; flag for awareness. Fix: compare against the enum literal
  (`global_role = 'super_admin'::user_role`) as `find_highest_privilege` already does (`users.rs:240`).
- **INFO** `display_names` uses `id = ANY($1)` with `&[Uuid]` — docs confirm `&[T]`→PG array. Good
  batch (no N+1).

### `db/members.rs` · 256 LOC
Purpose: membership + effective-role. Docs: `query!`, `query_as`/`FromRow`, `LEFT JOIN`.
- **OK** `upsert` `INSERT … ON CONFLICT (room_id,user_id) DO UPDATE` matches PK (0002). Atomic.
- **OK** `get`/`list` use `query!` with `role::text AS "role!"`; `effective_role`/`present_roster`
  use runtime `query_as` (documented offline-cache reason).
- **OK** `present_roster` resolves a *set* of users in **one** `query_as` with `= ANY($1)` — no N+1.
- **MED** `effective_role`/`present_roster` `LEFT JOIN room_members m ON … m.room_id = $2` then
  `WHERE u.id = $1`/`ANY`. `room_members` is keyed `(room_id,user_id)` — the join on `user_id` alone
  has **no dedicated index** (PK leads with `room_id`). For a per-user lookup this is a (room,user) PK
  probe (fine); for the roster it's acceptable. See migrations table re: `room_members(user_id)`.

### `db/messages.rs` · 176 LOC
Purpose: chat messages + role/badge-enriched list. Docs: `query_as`/`FromRow`, `Transaction` (none).
- **OK** `create` via `query!`; deletes via runtime `query` with `.bind()`, room-scoped.
- **OK** `list_recent` JOINs `users` + LEFT JOINs `room_members` for effective role — **single query**.
- **OK** **Badges batched**: after building views it calls `badges::for_authors(pool, &author_ids)`
  **once** (`messages.rs:169`). This is the correct anti-N+1 design (one query for all authors).
- **MED** `list_recent` filters `WHERE m.room_id = $1 AND m.channel = $2 ORDER BY created_at DESC`.
  Index `idx_messages_room_created (room_id, created_at DESC)` (0002) covers room+order but **not
  `channel`** — Postgres filters channel after the index range scan. Minor; fine at current scale.
  Fix (optional): `(room_id, channel, created_at DESC)`.

### `db/alerts.rs` · 174 LOC
Purpose: trade alerts + badge-enriched list. Docs: `query_as`/`FromRow`.
- **OK** Runtime `query_as` (post_to_x/no_push from 0009 absent in offline cache) — documented.
- **OK** `post_to_x`/`no_push` are `Option<bool>` ↔ nullable `boolean DEFAULT false` (0009) — correct.
- **OK** `list_recent` hits `idx_alerts_room_created (room_id, created_at DESC)` (0002) — index-aligned.
- **OK** Author badges batched once (`alerts.rs:167`) — no N+1.

### `db/questions.rs` · 150 LOC
Purpose: alert Q&A. Docs: `query_as`/`FromRow`, CTE `INSERT … RETURNING` + JOIN.
- **OK** `create`/`resolve` use a CTE (`WITH ins/upd AS (INSERT/UPDATE … RETURNING) SELECT … JOIN
  users`) to return the author name in **one** round-trip — clean (RETURNING can't JOIN).
- **OK** `list_for_alert` filters `q.alert_id=$1 AND q.room_id=$2`; both indexed
  (`idx_questions_alert`, `idx_questions_room`, 0006).

### `db/polls.rs` · 309 LOC
Purpose: polls + options + votes. Docs: `Transaction`, `query_as`/`FromRow`, `count(*)`→`i64`.
- **OK** **`create` is a correct transaction** (`polls.rs:126-152`): `pool.begin()`, insert poll,
  loop-insert options on `&mut *tx`, `commit()`. Atomic per docs (rollback-on-drop on early `?`).
- **OK** `vote` is well-reasoned: status pre-check + **guarded upsert**
  `INSERT … SELECT … WHERE EXISTS(… status='open') ON CONFLICT (poll_id,user_id) DO UPDATE`
  (`polls.rs:260`) closes the TOCTOU window in one statement; `UNIQUE(poll_id,user_id)` (0007) backs it.
- **HIGH (perf, N+1)** **`list_active` (`polls.rs:160-179`) is an N+1**: one query lists polls, then
  the `for poll_row` loop calls `option_results(pool, …)` **once per poll** — N option-tally queries
  for N polls. `get_detail`/`vote`/`close` each issue their own follow-up read too (acceptable singly,
  but `list_active` fans out). Fix: aggregate all options for the listed poll ids in **one** query
  (`WHERE o.poll_id = ANY($1) … GROUP BY o.poll_id, o.id …`) then bucket in Rust — mirrors the
  `badges::for_authors` batch pattern already used elsewhere.
- **OK** `votes`/`count(*)` decoded as `i64` (docs: `BIGINT`↔`i64`); `total_votes` summed in Rust.

### `db/reactions.rs` · 172 LOC
Purpose: emoji reactions (toggle). Docs: `Transaction`, `query_as`/`FromRow`, `count(*)`/`bool_or`.
- **OK** **`toggle` is a correct transaction** (`reactions.rs:125-163`): begin → `DELETE … RETURNING
  id` → conditional `INSERT … ON CONFLICT DO NOTHING` → commit. Atomic; `UNIQUE(target_kind,
  target_id,user_id,emoji)` (0008) backs idempotency even without the tx.
- **OK** `target_in_room` chooses table by `match target_kind` — the **SQL string is a literal per
  arm**, still fully `.bind()`-parameterized (no interpolation). Correct.
- **MED** `list_for` (re-run after every toggle + on read) does `count(*)` cast to `i64` then narrows
  to `i32` defensively (`reactions.rs:34` `unwrap_or(i32::MAX)`) — safe. The aggregate filters
  `target_kind,target_id,room_id`; `idx_message_reactions_target (target_kind,target_id)` (0008)
  serves it (room_id is a residual filter) — index-aligned.

### `db/private_messages.rs` · 220 LOC
Purpose: 1:1 PMs. Docs: `query_as`/`FromRow`, CTE insert+join, `DISTINCT ON`.
- **OK** `create` uses a CTE (`WITH inserted AS (INSERT … RETURNING) SELECT … JOIN users us/ur`) for
  one round-trip with both display names. Parameterized.
- **OK** `thread` query symmetric pair filter `((sender=$2 AND recipient=$3) OR (sender=$3 AND
  recipient=$2))` aligns with the **functional index** `idx_pm_thread (room_id, LEAST(...),
  GREATEST(...), created_at DESC)` (0011) — index-aware design.
- **MED (N+1-adjacent, but avoided)** `threads_for` uses `DISTINCT ON (peer) … ORDER BY peer,
  created_at DESC` to get the latest message per peer in **one** query — good (no per-peer loop).
- **LOW** `threads_for`/`thread` SQL is held in a `let sql = "…"` then passed to `query_as` — still a
  `&'static str` literal (string concatenation of literals across `\`-continued lines), **not** a
  runtime-built string. No injection surface. Flagged only because a literal-in-variable can *look*
  dynamic on a skim; it is not.

### `db/badges.rs` · 209 LOC
Purpose: badge registry + per-author resolution. Docs: `query_as`/`FromRow`, `= ANY($1)`, `time`.
- **OK** **`for_authors` is the canonical anti-N+1**: resolves *all* authors in **two** queries
  (assignments via `= ANY($1)`, then flags via `= ANY($1)`), bucketed into a `HashMap` — exactly the
  batch other repos call. `for_author` delegates to it with a 1-element slice.
- **OK** `is_new`/`years` derived in Rust from `created_at` via `(now - created_at).whole_days()`
  (`badges.rs:191`) — docs confirm `OffsetDateTime - OffsetDateTime → Duration`; `now_utc()` used.
- **OK** `position` `i32`↔`int` (0013); colors/labels `text`. Inserts/deletes parameterized.
- **LOW** `create`/`assign` carry `created_by`/`assigned_by` FKs → `user_badges.assigned_by` and
  `badges.created_by` are **un-indexed** (see migrations table). Not hot paths.

---

## SUMMARY — per-file status

| File | LOC | API | Param SQL | Tx correct | N+1 | Notable |
|---|---|---|---|---|---|---|
| mod.rs | 42 | pool | n/a | n/a | n/a | fixed pool=10, no acquire_timeout (INFO) |
| audit.rs | 30 | `query!` | ✅ | n/a | ✅ | clean |
| identities.rs | 26 | `query!` | ✅ | n/a | ✅ | enum cast bound |
| magic.rs | 45 | `query!` | ✅ | n/a (atomic stmt) | ✅ | no expires_at index (LOW) |
| oauth.rs | 55 | `query!` | ✅ | n/a (atomic stmt) | ✅ | clean |
| branding.rs | 76 | mixed | ✅ | n/a | ✅ | singleton ok |
| files.rs | 162 | `query!` | ✅ | n/a | ✅ | category no CHECK (INFO) |
| notes.rs | 170 | `query!` | ✅ | n/a | ✅ | position race (LOW) |
| sessions.rs | 111 | `query!`/scalar | ✅ | n/a | ✅ | clean |
| users.rs | 315 | mixed | ✅ | ✅ delete tx | ✅ | `::text` defeats index (MED) |
| members.rs | 256 | mixed | ✅ | n/a | ✅ | user_id join index (MED) |
| messages.rs | 176 | mixed | ✅ | n/a | ✅ batched | channel not in index (MED) |
| alerts.rs | 174 | `query_as` | ✅ | n/a | ✅ batched | index-aligned |
| questions.rs | 150 | `query_as` | ✅ | n/a (CTE) | ✅ | clean |
| polls.rs | 309 | `query_as` | ✅ | ✅ create tx | ❌ **list_active** | **N+1 (HIGH)** |
| reactions.rs | 172 | `query_as` | ✅ | ✅ toggle tx | ✅ | index-aligned |
| private_messages.rs | 220 | `query_as` | ✅ | n/a (CTE) | ✅ | functional-index aware |
| badges.rs | 209 | `query_as` | ✅ | n/a | ✅ canonical batch | FK indexes (LOW) |

Legend: ✅ correct/safe · ❌ issue · n/a not applicable.

## SUMMARY — migrations

| Migration | Tables/changes | Missing index? | Issues / notes |
|---|---|---|---|
| 0001_identity | users, identities, sessions, magic_link_tokens, oauth_states | `magic_link_tokens.expires_at`, `oauth_states.expires_at` (cleanup-only) | NOT NULL + UNIQUE solid; `identities.user_id`, `sessions.user_id` indexed; enums typed |
| 0002_rooms | rooms, room_members, alerts, messages, audit_log | **`messages.author_id`**, **`alerts.author_id`**, **`room_members.user_id`** (FKs, un-indexed) | `owner_id`/alert `author_id` are `ON DELETE RESTRICT` (intentional, see users.delete); `idx_alerts_room_created`/`idx_messages_room_created`/`idx_audit_actor` present |
| 0003_chat_channels | messages.channel | n/a | good: `CHECK (channel IN ('main','off_topic'))`; NOT NULL DEFAULT |
| 0004_notes | notes | — | `created_by` SET NULL ok; `idx_notes_room_position` present; no UNIQUE(room_id,position) (see notes.rs LOW) |
| 0005_files | files | — | `size_bytes BIGINT` (✅ i64); `uploaded_by` SET NULL; `idx_files_room_created` present; `category` is bare text (no CHECK) |
| 0006_questions | questions | `questions.author_id`, `questions.answered_by` (FKs) | `author_id` RESTRICT, `answered_by` SET NULL — correct; alert/room indexed |
| 0007_polls | polls, poll_options, poll_votes | **`polls.author_id`**, **`poll_votes.user_id`** (FKs) | `polls.author_id`/`poll_votes.user_id` lack `ON DELETE` action → default **RESTRICT** (users.delete pre-clears them — consistent); `UNIQUE(poll_id,user_id)` ✅; option/vote-by-poll indexed |
| 0008_reactions | message_reactions | — | `target_id` deliberately not an FK (polymorphic, validated in app); `UNIQUE(...)` + `idx_..._target` ✅; CHECK on target_kind ✅ |
| 0009_alert_flags | alerts.post_to_x/no_push | n/a | nullable `boolean DEFAULT false`, backfills cleanly; `Option<bool>` mapping matches |
| 0010_room_locked | rooms.locked | n/a | `NOT NULL DEFAULT false` (good — non-null, unlike 0009 by design) |
| 0011_private_messages | private_messages | — | FKs all CASCADE; `pm_not_self` CHECK ✅; **functional** `idx_pm_thread` (LEAST/GREATEST) + `idx_pm_recipient` ✅ — query-aware |
| 0012_branding | branding | — | singleton `id boolean PK CHECK(id)` ✅; `updated_by` SET NULL; seeds one row |
| 0013_badges | badges, user_badges, users.is_trial | `badges.created_by`, `user_badges.assigned_by` (FKs) | `user_badges` PK(user_id,badge_id) + `idx_user_badges_user`; both core FKs CASCADE ✅; `is_trial NOT NULL DEFAULT false` |

**Cascade correctness:** content tables CASCADE on `room_id`/parent (alerts→questions, polls→options→votes,
badges→user_badges) so room/badge deletes reap cleanly. Authored-content FKs are deliberately split:
**RESTRICT** for alerts/polls/questions authorship (forces the explicit pre-clear in `users::delete`’s
transaction) and **SET NULL** for soft-authorship (notes/files/branding/answered_by/assigned_by). This is
internally consistent — `users::delete` clears exactly the RESTRICT-constrained content before the final
delete, and a room **owner** (also RESTRICT) is correctly *non-deletable*, rolling back the tx.

---

## SEVERITY TOTALS

| Severity | Count | Items |
|---|---|---|
| **HIGH** | 1 | `polls.rs::list_active` N+1 (one option-tally query per poll) |
| **MED** | 4 | `users.rs::count_active_super_admins` `::text` cast defeats enum index; `members` `user_id`-only join (no index); `messages.list_recent` channel not in covering index; reactions room_id residual filter (minor) |
| **LOW** | 5 | `notes` position race (no UNIQUE); `magic`/`oauth` expiry cleanup un-indexed; FK indexes missing on `messages/alerts/room_members/polls/questions/poll_votes/badges/user_badges` author/user columns; `files.category` no CHECK; literal-in-variable SQL readability |
| **INFO** | 5 | pool sizing; audit single-stmt; branding mixed API; files category text; users ANY batch (positive) |

**Injection / parameterization:** **0 findings.** Every statement in all 19 files uses `$N` bind
parameters (compile-time `query!`/`query_as!` where the `.sqlx` cache covers them, runtime `query`/
`query_as` + `.bind()` elsewhere). The sole `format!` builds an error message, not SQL.

**Transactions:** all three multi-statement mutations (`polls::create`, `reactions::toggle`,
`users::delete`) correctly use `pool.begin()` + `commit()` with rollback-on-drop, per the cited
`Transaction` docs. No multi-statement mutation runs un-transacted.

**Money columns:** none exist; the single `BIGINT` (`files.size_bytes`) is `i64` end-to-end (correct).

**Net:** the module is idiomatic and injection-safe. The one materially actionable item is the
**`polls::list_active` N+1** (HIGH, perf only — not a correctness or security bug); the rest are
index/constraint hardening (MED/LOW) that the existing access patterns tolerate at current scale.
