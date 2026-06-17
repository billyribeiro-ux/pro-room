//! Application branding repository: a single-row table holding the admin-set
//! brand name and logo storage key. The migration seeds exactly one row, so
//! [`get`] always finds it; writes update it in place.

use anyhow::Context as _;
use domain::UserId;
use sqlx::PgPool;

/// The branding row. All fields are optional — a NULL means "use the bundled
/// default" on the client.
pub struct Branding {
    pub name: Option<String>,
    pub logo_storage_name: Option<String>,
    pub logo_content_type: Option<String>,
    pub updated_at: time::OffsetDateTime,
}

/// Read the singleton branding row (always present; seeded by the migration).
pub async fn get(pool: &PgPool) -> anyhow::Result<Branding> {
    let row = sqlx::query!(
        r#"SELECT name, logo_storage_name, logo_content_type, updated_at FROM branding WHERE id = true"#
    )
    .fetch_one(pool)
    .await
    .context("get branding")?;
    Ok(Branding {
        name: row.name,
        logo_storage_name: row.logo_storage_name,
        logo_content_type: row.logo_content_type,
        updated_at: row.updated_at,
    })
}

/// Set (or clear, with `None`) the brand display name.
pub async fn set_name(pool: &PgPool, name: Option<&str>, updated_by: UserId) -> anyhow::Result<()> {
    sqlx::query(
        "UPDATE branding SET name = $1, updated_by = $2, updated_at = now() WHERE id = true",
    )
    .bind(name)
    .bind(updated_by.as_uuid())
    .execute(pool)
    .await
    .context("update branding name")?;
    Ok(())
}

/// Point the brand logo at a freshly stored on-disk file.
pub async fn set_logo(
    pool: &PgPool,
    storage_name: &str,
    content_type: &str,
    updated_by: UserId,
) -> anyhow::Result<()> {
    sqlx::query(
        "UPDATE branding SET logo_storage_name = $1, logo_content_type = $2, updated_by = $3, updated_at = now() WHERE id = true",
    )
    .bind(storage_name)
    .bind(content_type)
    .bind(updated_by.as_uuid())
    .execute(pool)
    .await
    .context("update branding logo")?;
    Ok(())
}

/// Clear the logo (revert to the bundled default).
pub async fn clear_logo(pool: &PgPool, updated_by: UserId) -> anyhow::Result<()> {
    sqlx::query(
        "UPDATE branding SET logo_storage_name = NULL, logo_content_type = NULL, updated_by = $1, updated_at = now() WHERE id = true",
    )
    .bind(updated_by.as_uuid())
    .execute(pool)
    .await
    .context("clear branding logo")?;
    Ok(())
}
