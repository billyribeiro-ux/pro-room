//! Linked login identities (password / google / github / magic) for a user.

use anyhow::Context as _;
use domain::UserId;

pub async fn link(
    pool: &sqlx::PgPool,
    user_id: UserId,
    provider: &str,
    provider_subject: &str,
) -> anyhow::Result<()> {
    sqlx::query!(
        r#"
        INSERT INTO identities (user_id, provider, provider_subject)
        VALUES ($1, $2::text::identity_provider, $3)
        ON CONFLICT (provider, provider_subject) DO NOTHING
        "#,
        user_id.as_uuid(),
        provider,
        provider_subject,
    )
    .execute(pool)
    .await
    .context("link identity")?;
    Ok(())
}
