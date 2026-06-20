//! User repository.

use anyhow::Context as _;
use domain::entities::{User, UserStatus};
use domain::{Role, UserId};
use sqlx::PgPool;

/// A user row including the password hash (needed for credential login). Not
/// serialized to clients; use [`UserRecord::into_user`] for the public view.
pub struct UserRecord {
    pub user: User,
    pub password_hash: Option<String>,
}

/// Insert a new user. `password_hash` is `None` for OAuth/magic-link-only users.
pub async fn create(
    pool: &PgPool,
    email: &str,
    display_name: &str,
    password_hash: Option<&str>,
    global_role: Role,
) -> anyhow::Result<User> {
    let row = sqlx::query!(
        r#"
        INSERT INTO users (email, display_name, password_hash, global_role)
        VALUES ($1, $2, $3, $4::text::user_role)
        RETURNING id, email, display_name,
                  global_role::text AS "global_role!",
                  status::text AS "status!",
                  created_at
        "#,
        email,
        display_name,
        password_hash,
        global_role.as_str(),
    )
    .fetch_one(pool)
    .await
    .context("insert user")?;

    Ok(User {
        id: UserId::from_uuid(row.id),
        email: row.email,
        display_name: row.display_name,
        global_role: row.global_role.parse().context("parse role")?,
        status: row.status.parse().context("parse status")?,
        created_at: row.created_at,
    })
}

pub async fn find_by_email(pool: &PgPool, email: &str) -> anyhow::Result<Option<UserRecord>> {
    let row = sqlx::query!(
        r#"
        SELECT id, email, display_name, password_hash,
               global_role::text AS "global_role!",
               status::text AS "status!",
               created_at
        FROM users WHERE email = $1
        "#,
        email,
    )
    .fetch_optional(pool)
    .await
    .context("find user by email")?;

    row.map(|row| {
        Ok(UserRecord {
            user: User {
                id: UserId::from_uuid(row.id),
                email: row.email,
                display_name: row.display_name,
                global_role: row.global_role.parse().context("parse role")?,
                status: row.status.parse().context("parse status")?,
                created_at: row.created_at,
            },
            password_hash: row.password_hash,
        })
    })
    .transpose()
}

pub async fn find_by_id(pool: &PgPool, id: UserId) -> anyhow::Result<Option<User>> {
    let row = sqlx::query!(
        r#"
        SELECT id, email, display_name,
               global_role::text AS "global_role!",
               status::text AS "status!",
               created_at
        FROM users WHERE id = $1
        "#,
        id.as_uuid(),
    )
    .fetch_optional(pool)
    .await
    .context("find user by id")?;

    row.map(|row| {
        Ok(User {
            id: UserId::from_uuid(row.id),
            email: row.email,
            display_name: row.display_name,
            global_role: row.global_role.parse().context("parse role")?,
            status: row.status.parse().context("parse status")?,
            created_at: row.created_at,
        })
    })
    .transpose()
}

pub async fn list(pool: &PgPool) -> anyhow::Result<Vec<User>> {
    let rows = sqlx::query!(
        r#"
        SELECT id, email, display_name,
               global_role::text AS "global_role!",
               status::text AS "status!",
               created_at
        FROM users ORDER BY created_at
        "#,
    )
    .fetch_all(pool)
    .await
    .context("list users")?;

    rows.into_iter()
        .map(|row| {
            Ok(User {
                id: UserId::from_uuid(row.id),
                email: row.email,
                display_name: row.display_name,
                global_role: row.global_role.parse().context("parse role")?,
                status: row.status.parse().context("parse status")?,
                created_at: row.created_at,
            })
        })
        .collect()
}

pub async fn set_role(pool: &PgPool, id: UserId, role: Role) -> anyhow::Result<()> {
    let affected = sqlx::query!(
        "UPDATE users SET global_role = $2::text::user_role, updated_at = now() WHERE id = $1",
        id.as_uuid(),
        role.as_str(),
    )
    .execute(pool)
    .await
    .context("set user role")?
    .rows_affected();
    anyhow::ensure!(affected == 1, "user not found");
    Ok(())
}

/// Update a user's display name. Mirrors `set_role`; uses a runtime-checked query
/// (no sqlx macro cache needed for the bare UPDATE).
pub async fn set_display_name(pool: &PgPool, id: UserId, name: &str) -> anyhow::Result<()> {
    let affected =
        sqlx::query("UPDATE users SET display_name = $1, updated_at = now() WHERE id = $2")
            .bind(name)
            .bind(id.as_uuid())
            .execute(pool)
            .await
            .context("set display name")?
            .rows_affected();
    anyhow::ensure!(affected == 1, "user not found");
    Ok(())
}

/// Replace a user's argon2 password hash (self-service change-password). Runtime
/// query (no sqlx macro cache needed for the bare UPDATE). The caller hashes off
/// the async worker.
pub async fn set_password_hash(pool: &PgPool, id: UserId, hash: &str) -> anyhow::Result<()> {
    let affected =
        sqlx::query("UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2")
            .bind(hash)
            .bind(id.as_uuid())
            .execute(pool)
            .await
            .context("set password hash")?
            .rows_affected();
    anyhow::ensure!(affected == 1, "user not found");
    Ok(())
}

pub async fn set_status(pool: &PgPool, id: UserId, status: UserStatus) -> anyhow::Result<()> {
    let affected = sqlx::query!(
        "UPDATE users SET status = $2::text::user_status, updated_at = now() WHERE id = $1",
        id.as_uuid(),
        status.as_str(),
    )
    .execute(pool)
    .await
    .context("set user status")?
    .rows_affected();
    anyhow::ensure!(affected == 1, "user not found");
    Ok(())
}

/// Fetch `(id, display_name)` for a set of users, for presence display.
pub async fn display_names(
    pool: &PgPool,
    ids: &[uuid::Uuid],
) -> anyhow::Result<Vec<(UserId, String)>> {
    let rows = sqlx::query!("SELECT id, display_name FROM users WHERE id = ANY($1)", ids,)
        .fetch_all(pool)
        .await
        .context("fetch display names")?;
    Ok(rows
        .into_iter()
        .map(|r| (UserId::from_uuid(r.id), r.display_name))
        .collect())
}

/// Flat projection for [`find_highest_privilege`]. `email` is Postgres `citext`
/// (decodes to `String`); `global_role`/`status` are the enum columns cast to
/// `text` in the query, then `.parse()`d into the domain enums by the mapping
/// below. Uses runtime `query_as` for the same offline-cache reason as the
/// polls/questions repositories.
#[derive(sqlx::FromRow)]
struct HighestPrivilegeRow {
    id: uuid::Uuid,
    email: String,
    display_name: String,
    global_role: String,
    status: String,
    created_at: time::OffsetDateTime,
}

/// DEV-ONLY: resolve the highest-privilege active user, for the env-gated auth
/// bypass (see `auth::session::CurrentUser`). Prefers a `super_admin`, then an
/// `admin`. Returns `None` if no such user exists. Never used unless
/// `AUTH_DEV_BYPASS` is set; not part of the normal request path.
pub async fn find_highest_privilege(pool: &PgPool) -> anyhow::Result<Option<User>> {
    let row: Option<HighestPrivilegeRow> = sqlx::query_as(
        r"
        SELECT id, email, display_name,
               global_role::text AS global_role,
               status::text AS status,
               created_at
        FROM users
        WHERE status = 'active'::user_status
          AND global_role IN ('super_admin'::user_role, 'admin'::user_role)
        ORDER BY global_role DESC, created_at ASC
        LIMIT 1
        ",
    )
    .fetch_optional(pool)
    .await
    .context("find highest-privilege user")?;

    row.map(|row| {
        Ok(User {
            id: UserId::from_uuid(row.id),
            email: row.email,
            display_name: row.display_name,
            global_role: row.global_role.parse().context("parse role")?,
            status: row.status.parse().context("parse status")?,
            created_at: row.created_at,
        })
    })
    .transpose()
}

pub async fn count(pool: &PgPool) -> anyhow::Result<i64> {
    let row = sqlx::query!(r#"SELECT count(*) AS "count!" FROM users"#)
        .fetch_one(pool)
        .await
        .context("count users")?;
    Ok(row.count)
}

/// Count ACTIVE super-admins — used to refuse demoting/suspending the last one
/// (which would lock everyone out of user management). Runtime query.
pub async fn count_active_super_admins(pool: &PgPool) -> anyhow::Result<i64> {
    let n: i64 = sqlx::query_scalar(
        "SELECT count(*) FROM users \
         WHERE global_role::text = 'super_admin' AND status::text = 'active'",
    )
    .fetch_one(pool)
    .await
    .context("count active super admins")?;
    Ok(n)
}

/// Hard-delete a user (for removing test accounts). The final `DELETE FROM users`
/// CASCADEs sessions, identities, room memberships, chat messages, reactions,
/// private messages and badge assignments; SET-NULL columns (notes/files/branding
/// authorship) are nulled. This transaction first clears the user's authored
/// content that is RESTRICT-constrained (alerts, polls + their votes, Q&A
/// questions) so the final delete can succeed. A user who OWNS a room is NOT
/// deletable here (`rooms.owner_id` is RESTRICT) — the final delete errors and the
/// whole tx rolls back. Returns false when no such user existed. Runtime queries
/// (no .sqlx cache needed for the bare statements).
pub async fn delete(pool: &PgPool, id: UserId) -> anyhow::Result<bool> {
    let uid = id.as_uuid();
    let mut tx = pool.begin().await.context("begin user-delete tx")?;
    for stmt in [
        "DELETE FROM poll_votes WHERE user_id = $1",
        "DELETE FROM polls WHERE author_id = $1",
        "DELETE FROM questions WHERE author_id = $1",
        "DELETE FROM alerts WHERE author_id = $1",
    ] {
        sqlx::query(stmt)
            .bind(uid)
            .execute(&mut *tx)
            .await
            .with_context(|| format!("user-delete cascade: {stmt}"))?;
    }
    let affected = sqlx::query("DELETE FROM users WHERE id = $1")
        .bind(uid)
        .execute(&mut *tx)
        .await
        .context("delete user")?
        .rows_affected();
    tx.commit().await.context("commit user-delete")?;
    Ok(affected == 1)
}
