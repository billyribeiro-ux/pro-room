# Per-File Forensic Audit — AREA: rust-core-security

READ-ONLY, doc-grounded Rust audit. No source was modified.

**Environment note:** There is **NO Rust MCP server** in this environment. Authoritative
crate documentation was pulled from **docs.rs via WebFetch** (and, where docs.rs pages 404'd,
cross-checked against the vendored crate source in `~/.cargo/registry`, which is the exact
pinned version). The live cargo toolchain was used: `cargo 1.94.1 (29ea6fb6a 2026-03-24)`,
`rustc 1.94.1`.

**Established ground truth (given, not re-run here):** workspace
`cargo clippy --all-targets --all-features -- -D warnings` = **0 warnings / 0 errors**, and
**25 tests pass**. This audit therefore looks past lints the compiler already enforces and
focuses on doc-conformance + security idioms. (No targeted `clippy -p` run was needed.)

**Pinned versions (from `server/Cargo.lock`):** argon2 0.5.3 · password-hash 0.5.0 ·
sha2 0.10.9 · cookie 0.18.1 · axum-extra 0.12.6 · base64 0.22.1 · time 0.3.49 · uuid 1.23.3 ·
reqwest 0.13.4 · getrandom 0.2.17. `jsonwebtoken 10.4.0` is present in the dependency tree but
is **not used by any of the 17 audited files** (grep-confirmed), so its docs page is N/A here.

**docs.rs pages pulled (used across multiple files):**
- https://docs.rs/argon2/0.5.3/argon2/ — `Argon2::default()` = "Argon2id v19"
- https://docs.rs/argon2/0.5.3/argon2/enum.Error.html — 16 variants; **no** password-mismatch variant
- https://docs.rs/argon2/0.5.3/argon2/struct.Params.html — `DEFAULT_T_COST = 2`, `DEFAULT_P_COST = 1`
- argon2 0.5.3 `src/params.rs` (vendored; docs.rs constant page 404'd) — `DEFAULT_M_COST = 19 * 1024 = 19456 KiB (19 MiB)`
- https://docs.rs/password-hash/0.5.0/password_hash/trait.PasswordVerifier.html — `verify_password(...) -> Result<()>`
- https://docs.rs/password-hash/0.5.0/password_hash/errors/enum.Error.html — `Password` variant = "Invalid password."
- https://docs.rs/cookie/0.18.1/cookie/enum.SameSite.html — Lax = sent on cross-site *safe* methods only; None auto-sets Secure
- https://docs.rs/axum-extra/0.12.6/axum_extra/extract/cookie/index.html — `CookieJar`, `SignedCookieJar`, `PrivateCookieJar`
- https://docs.rs/getrandom/latest/getrandom/ — "prioritize failure over returning known insecure 'random' bytes"
- https://rust-lang.github.io/api-guidelines/ — error/naming/interop idioms

Severity legend: **C**ritical · **H**igh · **M**edium · **L**ow · **NIT**.

---

## server/crates/server/src/crypto.rs · 88 LOC
**Purpose:** Argon2id password hashing + opaque-token (session/magic/oauth) generation and
SHA-256 storage hashing.
**DOCS.RS PULLED:** argon2/0.5.3 root + enum.Error + struct.Params; password-hash/0.5.0
trait.PasswordVerifier + errors::Error; getrandom; sha2/0.10.9.

**Findings**
- **L · crypto.rs:25-31 · password-hash `verify_password -> Result<()>` returns `Err(Error::Password)` ("Invalid password") *only* for a true mismatch.** `verify_password` parses the hash first (`PasswordHash::new`, mapped to a distinct error), then collapses the verify step with `.verify_password(...).is_ok()`. Because the malformed-hash case is already split out above, the `.is_ok()` here legitimately means "wrong password" for the realistic inputs — but it would *also* swallow a genuine `Error::Crypto`/backend failure as a silent `false` (auth-deny). Fail-closed, so not a vuln. **Fix:** match on the result and treat `Err(Error::Password)` ⇒ `Ok(false)` while propagating any other `Err` as an `Err`, so an unexpected crypto fault is observable rather than indistinguishable from a wrong password.
- **L · crypto.rs:17,28 · `Argon2::default()` doc-confirmed = Argon2id v19 with `Params::DEFAULT` (m=19 MiB, t=2, p=1).** These match the current OWASP Argon2id minimum, so defaults are acceptable for v1. **Fix (hardening, optional):** pin params explicitly via `Argon2::new(Algorithm::Argon2id, Version::V0x13, Params::new(...))` so a future crate-default change can't silently weaken the cost; document the choice.
- **NIT · crypto.rs:59-67 · hand-rolled `hex`.** Correct and allocation-tuned (`with_capacity(len*2)`), but `sha2`/`base16ct` already vend constant-shape hex. Cosmetic only.
- **PASS · token entropy:** `generate_token` draws 32 bytes (256-bit) from `OsRng.fill_bytes` and URL-safe-base64-encodes — getrandom doc guarantees CSPRNG quality ("prioritize failure over … insecure bytes"). Only the SHA-256 hash is persisted (`hash_token`), so the DB never holds a usable credential, exactly as the module doc claims.
- **NOTE (not a finding):** SHA-256 of a high-entropy 256-bit token is the correct construction for an *opaque lookup token* (no salt/stretching needed because the input is already uniform high-entropy) — distinct from password hashing. No constant-time compare is needed at this layer because lookup is by hash equality in Postgres on a non-secret-derived index; timing of a hash-table/DB lookup is not the classic MAC-comparison oracle.

---

## server/crates/server/src/auth/session.rs · 155 LOC
**Purpose:** Issue/revoke session cookies, resolve session→user (cache-then-PG), `CurrentUser`
extractor, and the `AUTH_DEV_BYPASS` affordance.
**DOCS.RS PULLED:** axum-extra/0.12.6 cookie module; cookie/0.18.1 enum.SameSite;
time/0.3.49 OffsetDateTime.

**Findings**
- **M · session.rs:79-90 · cookie does not use the `__Host-` prefix and `secure` is derived, not forced.** `build_cookie` sets `http_only(true)`, `SameSite::Lax`, `path("/")`, and `secure = public_web_url.starts_with("https")`. Doc (cookie 0.18.1 SameSite) confirms Lax only blocks cross-site non-safe methods — fine for CSRF on state-changing POSTs. The gap: in any prod misconfig where `public_web_url` is non-https, `Secure` silently drops and the session cookie can leak over http. The `COOKIE_NAME` constant comment explicitly chooses a plain name over `__Host-` for dev http. **Fix:** in production force `secure(true)` (and ideally the `__Host-` prefix with `path=/`, no `Domain`), independent of the URL scheme string; assert at startup that prod config is https.
- **L · session.rs:87 · `i64::try_from(session_ttl.as_secs()).unwrap_or(i64::MAX)`.** Non-panicking and saturating — acceptable. NIT: `unwrap_or(i64::MAX)` silently turns an absurd TTL into ~292-billion-year cookie; clamping to a sane max (e.g. 400 days, the Chrome cap) would be more honest. Not in a request hot path beyond cookie build.
- **PASS · revoke hygiene:** `revoke` and `revoke_all_for_user` evict **both** stores (PG rows + Redis cache) and the doc-comment correctly explains why cache eviction is mandatory given `resolve` is cache-first. `resolve` uses `let-else` and `if let Ok(Some(..))`, so a cache error degrades to a PG read rather than failing open. No `unwrap`/`expect`/`panic` in the request path.
- **PASS · error→status:** `CurrentUser` rejection is `AppError::Unauthorized` (401), correct for "no/invalid session".

### AUTH_DEV_BYPASS guard (session.rs:121-155)
- **H · session.rs:126-131 · the dev bypass is a single runtime boolean (`state.config.auth_dev_bypass`) with no compile-time fence.** When set, *any* unauthenticated request is served as a synthetic `Role::SuperAdmin` (`dev_bypass_user` forces the highest role at line 153). The guard is defensively built — defaults off, emits `tracing::warn!` every request, requires a real admin/super-admin row to exist (else 401), and the doc says "NEVER SHIP ENABLED". But there is **no `#[cfg(debug_assertions)]` / feature gate**, so a single mis-set env var in a release binary fully disables auth. **Fix:** compile the bypass branch out of release builds (`#[cfg(any(debug_assertions, feature = "dev-bypass"))]`) so the production binary physically cannot honor the flag; keep the runtime flag as the second gate. This is the highest-leverage hardening in the file set. (Severity H, not C, only because it is off by default and loudly logged — it is a deployment-footgun, not an exploitable default.)

---

## server/crates/server/src/auth/oauth.rs · 268 LOC
**Purpose:** OAuth2 authorization-code + PKCE (S256) for Google/GitHub: build authorize URL,
validate state, exchange code, fetch profile, provision/link account.
**DOCS.RS PULLED:** sha2/0.10.9 (Sha256::digest for PKCE challenge); base64/0.22.1
URL_SAFE_NO_PAD; reqwest/0.13.4; argon2 crypto (token gen reused for CSRF/verifier).

**Findings**
- **M · oauth.rs:103 · `url::Url::parse(provider.authorize_url()).expect("valid authorize url")` is an `expect` on a request path.** The argument is a hardcoded `const` URL, so it cannot fail in practice — but it is still an `expect` reachable from the `start` handler. Per Rust API Guidelines / secure-coding (no panic in request paths), prefer returning `AppError::Internal` or constructing the `Url` once in a `OnceLock`. **Classification:** non-exploitable (constant input) but violates the "no panic in handlers" idiom. **Fix:** `?`-propagate into `AppError::Internal`.
- **L · oauth.rs:85,139 / boundary at http/auth.rs:368-370 · `redirect_to` is round-tripped through the DB and returned *unvalidated* from this module.** Open-redirect safety depends entirely on the caller: `http/auth.rs:369` applies `.filter(|r| r.starts_with('/'))`, which does block absolute `https://evil` and (because `format!("{web}{r}")` interposes the host) neutralizes protocol-relative `//evil` as well. So the system is safe, but oauth.rs offers no defense-in-depth. **Fix:** validate relative-only at store time in `start` (reject anything not matching `^/[^/]`) so the invariant lives next to the data, not only at the redirect site.
- **PASS · PKCE:** verifier = 256-bit random token; challenge = `URL_SAFE_NO_PAD(Sha256::digest(verifier))` with `code_challenge_method=S256` (oauth.rs:90-91,110-111) — textbook RFC 7636 S256.
- **PASS · CSRF/state:** `state` = independent 256-bit `crypto::generate_token` (oauth.rs:89,109); callback consumes it via `db::oauth::consume` which is **atomic single-use** (`DELETE ... WHERE state=$1 AND expires_at > now() RETURNING`, verified in db/oauth.rs) and additionally re-checks `stored.provider == provider.name()` (oauth.rs:129-131). State has a 10-minute TTL (oauth.rs:92). Replay and cross-provider confusion both closed.
- **PASS · error→status:** token-exchange non-2xx ⇒ `BadRequest` (oauth.rs:164-165); missing `access_token` ⇒ `Internal` (oauth.rs:171); network/JSON failures wrapped via `anyhow::Context` ⇒ `Internal`. No `unwrap` on provider responses; all field extraction goes through `string_field`/`and_then(as_str)` (Option-returning).
- **L · oauth.rs:226-230 · GitHub email fallback** correctly requires `primary == true && verified == true` (oauth.rs:251-256) before trusting an address for account linking — good. NIT: Google path (`fetch_google`) trusts `email` without checking the `email_verified` claim from userinfo; a Google account with an unverified email could link. **Fix:** require `email_verified == true` for Google too, mirroring the GitHub check, to prevent account-takeover via unverified-email collision in `find_or_create_by_email`.

---

## server/crates/server/src/auth/magic.rs · 43 LOC
**Purpose:** Passwordless magic-link issue + verify.
**DOCS.RS PULLED:** time/0.3.49 (Duration/OffsetDateTime); crypto (token); db::magic.

**Findings**
- **PASS · token entropy + single-use + expiry:** link token = 256-bit `crypto::generate_token`; only the hash is stored (magic.rs:18-20). 15-minute TTL (`TTL_MINUTES`). `verify` consumes via `db::magic::consume`, which is **atomic single-use** — `UPDATE ... SET consumed_at = now() WHERE token_hash=$1 AND consumed_at IS NULL AND expires_at > now() RETURNING email` (verified in db/magic.rs) — so a link cannot be replayed and expiry is enforced server-side, not on the client.
- **PASS · enumeration:** `request` doc + impl always return `Ok(())` regardless of whether the email has an account, so the endpoint does not reveal account existence.
- **L · magic.rs:39 · `email.split('@').next().unwrap_or("trader")`** — `split` on a non-empty `&str` always yields at least one element, so `unwrap_or` never hits its fallback; harmless but technically a degenerate display-name (`""` → falls back) for a leading-`@` address. Email shape is already validated upstream (`normalize_email` requires `@` and len ≥ 3). No panic risk. NIT only.
- **L · magic.rs:41 · linking identity `("magic", &email)`** keys the magic identity by raw email string; fine, but note this couples identity to a mutable attribute. Out of scope for this file; flagged for the account-linking design review.

---

## server/crates/server/src/auth/account.rs · 37 LOC
**Purpose:** Account provisioning + first-user bootstrap to `super_admin`.
**DOCS.RS PULLED:** domain::Role; db::users.

**Findings**
- **M · account.rs:15-22 · bootstrap-role TOCTOU.** `bootstrap_role` reads `db::users::count(...) == 0` then `find_or_create_by_email` (account.rs:34-35) creates with that role in a **separate** statement — a non-atomic check-then-act. Two concurrent first-sign-ins (e.g. two OAuth callbacks racing on an empty DB) could each observe `count == 0` and both be minted `SuperAdmin`. Low likelihood (requires a truly empty DB + simultaneous first users) but the blast radius is an unintended super-admin. **Fix:** make the bootstrap atomic — e.g. assign super-admin only inside the same transaction that inserts the user with a `WHERE NOT EXISTS (SELECT 1 FROM users)` guard, or a partial unique index ensuring at most one bootstrap super-admin.
- **L · account.rs:31-33 · `find_or_create_by_email` is itself a check-then-insert** (find, else create). A duplicate-email race relies on the DB unique constraint to reject the second insert; ensure `db::users::create` surfaces the unique violation as a retry/`Conflict` rather than `Internal`. Not visible in this file — flagged for db-layer review.
- **PASS:** no panics; pure `?`-propagation of `AppResult`. Doc comment accurately describes the bootstrap rule.

---

## server/crates/server/src/auth/mailer.rs · 30 LOC
**Purpose:** Outbound magic-link delivery (logs in dev; SMTP stub in prod).
**DOCS.RS PULLED:** tracing (logging); config.

**Findings**
- **M · mailer.rs:12-30 · the function signature returns `()` and SMTP is **not wired** — every "send" is a log line.** In production (`config.smtp = Some`) the link is *not* emailed; it is only `tracing::debug!`-logged (mailer.rs:23). Combined with magic.rs always returning `Ok(())`, a user requesting a link in a misconfigured prod gets a successful API response but **no email** — a silent auth dead-end, and the secret link sits in debug logs. The doc-comment is honest ("transport not yet wired"), so this is a known-gap, not a deception. **Fix before any prod magic-link rollout:** wire `lettre` (as the comment anticipates) and make `send_magic_link` return `Result` so a delivery failure propagates instead of being swallowed.
- **L · mailer.rs:23,27 · secret magic link written to logs** (`tracing::debug!(link, ...)` in the SMTP branch; `tracing::info!(... link ...)` in dev). Acceptable in dev; the SMTP-branch `debug!(link)` should be removed once transport is wired so production logs never contain a live credential. **Fix:** drop the link from the SMTP-path log; log only `to`/`from`/message-id.
- **PASS:** infallible-by-design, no panics, no unwraps.

---

## server/crates/server/src/auth/mod.rs · 8 LOC
**Purpose:** Module aggregator for the auth submodules.
**DOCS.RS PULLED:** none required (pure `pub mod` re-exports).
**Findings**
- **PASS.** No logic. Module doc accurately frames the three credential types converging on one session. No issues.

---

## server/crates/server/src/authorization.rs · 163 LOC
**Purpose:** Bridges the pure `authz` engine to the DB: resolves Subject/Resource/Context,
evaluates + audits decisions, maps denial→403.
**DOCS.RS PULLED:** domain::authz, authz::authorize; rust-lang api-guidelines (error mapping).

**Findings**
- **L · authorization.rs:122-143 · audit-log write failure is logged-and-swallowed** (`if let Err(err) = db::audit::record(...) { tracing::warn!(...) }`). For an *allow* this is benign; but a security posture that requires a complete audit trail would prefer to **fail the request** when a *deny* (or any privileged action) cannot be recorded. As written, an attacker who can pressure the audit table (e.g. fill disk) can blind the audit log without blocking access. **Fix (policy-dependent):** for high-value actions, treat audit-write failure as `AppError::Internal` rather than a warning, or write audit synchronously in the same tx as the effect.
- **L · authorization.rs:88-90 · `format!("room:{}", self.room.id)` allocates a resource string on every `ensure`.** Minor; on a hot authorize path consider a cheaper encoding. NIT-level.
- **PASS · fail-closed mapping:** `decision_to_result` maps `Allow ⇒ Ok`, `Deny{reason} ⇒ AppError::Forbidden(reason)` (403) — exhaustive 2-arm match, no catch-all, so a future `Decision` variant fails to compile. Correct error→status.
- **PASS · totality:** `action_name` is an exhaustive `match` over all 15 `Action`s (no `_` arm) — adding an action breaks the build, as the authz crate intends. `RoomContext::load` resolves Subject/Resource/Context from real rows; `is_room_member = membership.is_some()` is derived, not client-supplied.
- **PASS · no panics:** all paths are `?`-propagated `AppResult`; `.clone()` of attributes (line 50) is necessary (owned `Subject`), ownership hygiene fine.

---

## server/crates/authz/src/lib.rs · 240 LOC
**Purpose:** Engine entrypoint `authorize` = RBAC gate AND ABAC policy; plus the
deny-by-default test matrix.
**DOCS.RS PULLED:** domain types; rust-lang api-guidelines (`#[must_use]`, totality).
**Findings**
- **PASS · fail-closed composition:** `authorize` (lib.rs:25-40) requires **both** `role_has(effective_role, required)` *and* `policy::evaluate` to allow; either failure ⇒ `Decision::deny(...)` with a stable reason. `#[must_use]` on the return prevents a dropped decision. This is the correct two-layer, deny-by-default design the module doc promises.
- **PASS · totality:** the engine is a pure, total, no-I/O function; the in-file test matrix (lib.rs:42-240, 8 tests) exercises member/admin/super × live/idle/closed × public/private × member/non-member, including the negative cases (outside admin denied, member denied by RBAC). Tests are part of the established "25 passing" ground truth.
- **NIT · lib.rs:34 · `subject.effective_role()`** is the single source of role truth; note `effective_role` (domain/authz.rs:27-32) returns `room_role.unwrap_or(global_role)` for non-supers — see the domain finding below re: a global-admin with a lower room_role.

---

## server/crates/authz/src/policy.rs · 167 LOC
**Purpose:** ABAC layer — per-action resource/ownership/membership constraints.
**DOCS.RS PULLED:** domain types; secure-coding (deny-by-default, exhaustive match).
**Findings**
- **PASS · exhaustive + fail-closed dispatch:** `evaluate` (policy.rs:13-34) matches **all 15 actions** with no `_` wildcard, so a new action cannot silently fall through to allow — it won't compile until a policy is supplied. Each sub-policy's fallthrough is `Decision::deny(...)`.
- **L · policy.rs:29-32 · account-wide actions `CreateRoom | ManageUsers | ManageBranding | ManageBadges ⇒ Decision::Allow`** once RBAC passed, by design (no room resource to scope). This is correct *given* the caller always routes these through `ensure_system_action` with `Resource::System`. Risk is purely if a caller ever passed one of these actions with a `Resource::Room` — it would still allow. **Fix (defense-in-depth):** assert `matches!(resource, Resource::System)` for these arms and deny otherwise, so the policy is self-guarding regardless of caller.
- **PASS · ownership checks:** `manage_room`/`manage_members` (policy.rs:152-167) require `is_super || room.owner_id == subject.user_id` — owner-or-super, exactly as the test `room_management_limited_to_owner_admin_or_super_admin` asserts. `require_room` returns a deny (not a panic) on a wrong resource type.
- **PASS · room-state gating:** `room_access` denies `RoomStatus::Closed` for non-supers (policy.rs:82) and correctly treats `Alert`/`Message` resources as member-only.
- **NIT · policy.rs:117-131 · `send_private_message`** doc honestly records the deferred `user_pm` flag; current behavior (any room-accessing member may PM) is intentional v1. No code issue.

---

## server/crates/authz/src/rbac.rs · 132 LOC
**Purpose:** Static role→permission and action→required-permission maps.
**DOCS.RS PULLED:** domain types; api-guidelines (exhaustive `const fn` match).
**Findings**
- **PASS · compile-enforced totality:** `required_permission` (rbac.rs:16-39) and `member_has`/`admin_has` are exhaustive `match`es with no `_` arm; the module doc's claim ("adding an `Action`/`Permission` fails to compile until mapped") holds. `#[allow(clippy::match_same_arms)]` is justified and documented (JoinRoom vs SubscribeScreen kept distinct intentionally).
- **PASS · monotonic privilege:** `admin_has = member_has || {admin extras}`, `SuperAdmin ⇒ true` — higher roles strictly inherit lower caps; tests assert members lack AlertCreate/ScreenPublish/UserManage and admins lack UserManage.
- **L · rbac.rs:83-100 · `permissions_for` hardcodes the 11-permission list** rather than deriving from the `Permission` enum. If a 12th permission is added, `role_has` updates are compile-forced but this list is **not** — it would silently omit the new permission from the UI capability set. The test `super_admin_holds_everything` asserts `len() == 11`, which would catch a *count* drift but not a wrong-member swap. **Fix:** drive the list from a `Permission::ALL` const array (or `strum::EnumIter`) so it cannot desync from the enum.

---

## server/crates/domain/src/authz.rs · 128 LOC
**Purpose:** Authorization vocabulary — Subject/Action/Resource/Context/Decision.
**DOCS.RS PULLED:** domain internal; api-guidelines (`#[must_use]`, `const fn`).
**Findings**
- **M · authz.rs:27-32 · `Subject::effective_role` can *lower* a global admin's effective role inside a room.** For a non-super, it returns `room_role.unwrap_or(global_role)` — so a user who is `global_role = Admin` but holds `room_role = Some(Member)` in a given room evaluates as **Member** there, losing admin capabilities (e.g. cannot post alerts) in that room. This may be intended (per-room demotion), but it is a security-relevant policy decision that is **undocumented** beyond "per-room role if present." It also means a global admin can be *scoped down* by a room membership row — confirm this is the intended trust model and that membership rows can't be attacker-controlled to demote a moderator. **Fix:** document the precedence explicitly, or take `max(global_role, room_role)` if global privilege should never be reduced by a room role. (Super-admin is already special-cased to always win, line 28-30.)
- **L · authz.rs:34-40 · `attribute` does a linear scan of `Vec<(String,String)>`.** Fine for a handful of ABAC attributes; if attribute sets grow this is O(n) per lookup. NIT.
- **PASS:** `Decision` is `#[must_use]`-friendly via the engine; `is_allowed`/`deny` are `const fn`; `Deny{reason: &'static str}` keeps reasons allocation-free and audit-stable.

---

## server/crates/domain/src/entities.rs · 353 LOC
**Purpose:** Persistent entity structs + `FromStr`/`as_str` enum (de)serialization.
**DOCS.RS PULLED:** serde; time/0.3.49 (`time::serde::rfc3339`); uuid.
**Findings**
- **PASS · parse totality:** every `FromStr` (`UserStatus`, `RoomVisibility`, `FileCategory`, `ReactionTargetKind`) has an exhaustive match with an `other => Err(ParseError(..))` fallthrough — no panic, fail-closed parsing of DB/wire strings. `ParseError` is a proper `thiserror` type (api-guidelines: error types implement `Error`).
- **L · entities.rs:44-53 · `User` derives `Serialize` and includes `email`.** If `User` is ever serialized directly into an API response, the email (PII) ships to the client. The codebase appears to use a separate `SessionUser`/view models, but `User: Serialize` invites accidental over-exposure. **Fix:** confirm `User` is never returned raw; consider `#[serde(skip)]` on sensitive fields or a dedicated DTO. NIT→L.
- **PASS · numeric widths documented:** `votes: i64`/`count: i32` choices are doc-justified against Postgres types and overflow.

---

## server/crates/domain/src/ids.rs · 62 LOC
**Purpose:** `typed_id!` newtype macro over `Uuid` (UserId/RoomId/… ) preventing id mixing.
**DOCS.RS PULLED:** uuid 1.23.3 (`Uuid::new_v4`); serde (`transparent`).
**Findings**
- **PASS · type-safety idiom:** newtype-per-id with `#[serde(transparent)]` is the canonical Rust way to prevent passing a `RoomId` where a `UserId` is expected (api-guidelines: newtypes for clarity). `new()` uses `Uuid::new_v4` (CSPRNG-backed random v4); `from_uuid`/`as_uuid` are `const fn`.
- **NIT · ids.rs:44-48 · `From<Uuid>` is generated for every id type**, so `Uuid` converts *implicitly* into any id via `.into()`, partially eroding the very mixing-prevention the newtype exists for (a raw `Uuid` from one table can `.into()` the wrong id). Acceptable given DB code needs the conversion, but `From` is the most permissive choice; a named `from_uuid` (already present) is safer to standardize on.

---

## server/crates/domain/src/lib.rs · 19 LOC
**Purpose:** Crate root + re-exports; documents the no-I/O, deterministic design.
**DOCS.RS PULLED:** none (module declarations + `pub use`).
**Findings**
- **PASS.** Re-exports are coherent; module doc correctly states the crate is I/O-free and async-free, which is what makes the authz engine exhaustively testable. No issues.

---

## server/crates/domain/src/permission.rs · 57 LOC
**Purpose:** `Permission` enum + stable string forms.
**DOCS.RS PULLED:** serde (`rename_all`); api-guidelines (`Display`/`as_str`).
**Findings**
- **PASS.** `as_str` is an exhaustive `const fn` match over all 11 permissions; `Display` delegates to it (api-guidelines: `Display` for user-facing). Stable wire strings (`alert.create`, …) documented. No panic, no I/O.

---

## server/crates/domain/src/role.rs · 82 LOC
**Purpose:** Three-tier `Role` with privilege ordering + parse/format + unit tests.
**DOCS.RS PULLED:** serde; api-guidelines (`Ord` semantics, `FromStr`).
**Findings**
- **PASS · ordering is privilege:** `#[derive(PartialOrd, Ord)]` with declaration order `Member < Admin < SuperAdmin` is exactly the intended privilege lattice, asserted by `ordering_reflects_privilege`. `is_admin` is a `const fn` exhaustive match. `FromStr`/`as_str` round-trip is tested.
- **NIT · role.rs:9 · deriving `Ord` from declaration order** is correct but fragile — a future reorder of variants would silently invert privilege. The test guards it. Consider a comment on the enum that "variant order IS privilege order, do not reorder." (The doc-comment says ordered; making it a `// DO NOT REORDER` marker is cheap insurance.)

---

## Per-file STATUS table

| File | #findings (excl. PASS/NIT) | Top issue |
|------|---------------------------|-----------|
| auth/session.rs | 3 (1 H, 1 M, 1 L) | **H** AUTH_DEV_BYPASS lacks compile-time fence (release env-var disables auth) |
| auth/oauth.rs | 3 (1 M, 2 L) | **M** `expect` on `Url::parse` in `start` handler (no-panic-in-handler idiom) |
| auth/mailer.rs | 2 (1 M, 1 L) | **M** SMTP unwired → prod magic-link silently undelivered + secret link logged |
| auth/account.rs | 2 (1 M, 1 L) | **M** bootstrap-super-admin TOCTOU (check-then-create race) |
| crypto.rs | 1 L (+2 NIT) | **L** `verify_password` `.is_ok()` collapses crypto-fault into wrong-password |
| domain/authz.rs | 1 M (+1 L) | **M** `effective_role` can demote a global admin via room_role (undocumented) |
| authz/policy.rs | 1 L | **L** account-wide actions allow without asserting `Resource::System` |
| authz/rbac.rs | 1 L | **L** `permissions_for` hardcoded list can desync from `Permission` enum |
| authorization.rs | 1 L (+1 NIT) | **L** audit-write failure swallowed (audit can be blinded) |
| domain/entities.rs | 1 L | **L** `User: Serialize` includes email (PII over-exposure risk) |
| domain/ids.rs | 0 (1 NIT) | NIT: blanket `From<Uuid>` erodes newtype mixing-guard |
| domain/role.rs | 0 (1 NIT) | NIT: `Ord` from declaration order is reorder-fragile |
| authz/lib.rs | 0 (1 NIT) | PASS — fail-closed two-layer engine |
| domain/permission.rs | 0 | PASS |
| domain/lib.rs | 0 | PASS |
| auth/mod.rs | 0 | PASS |
| auth/magic.rs | 0 (2 L noted) | PASS — atomic single-use + expiry + no-enumeration |

## Severity totals (substantive findings)

| Severity | Count |
|----------|-------|
| Critical (C) | 0 |
| High (H) | 1 |
| Medium (M) | 4 |
| Low (L) | 11 |
| NIT | 6 |

**Top-line:** No critical defects. The authz engine (domain + authz crates) is exemplary —
pure, total, deny-by-default, exhaustive `match`es that fail compilation on omission, no panics.
The four substantive hardening items are all in the server auth layer: (1) **H** — gate
`AUTH_DEV_BYPASS` out of release builds at compile time; (2) **M** — force `Secure`/`__Host-`
on the session cookie in prod independent of the URL scheme; (3) **M** — make the first-user
super-admin bootstrap atomic; (4) **M** — wire SMTP / return `Result` before any magic-link prod
use and stop logging the live link. Plus the **M** `effective_role` precedence ambiguity worth
an explicit trust-model decision. All findings are doc-grounded against the pinned crate
versions above.
