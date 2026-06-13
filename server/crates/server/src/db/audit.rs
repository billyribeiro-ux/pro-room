//! Append-only audit log of authorization decisions on sensitive actions.

use anyhow::Context as _;
use domain::UserId;

pub struct AuditEntry<'a> {
    pub actor_id: Option<UserId>,
    pub action: &'a str,
    pub resource: &'a str,
    pub decision: &'a str,
    pub reason: Option<&'a str>,
}

pub async fn record(pool: &sqlx::PgPool, entry: AuditEntry<'_>) -> anyhow::Result<()> {
    sqlx::query!(
        r#"
        INSERT INTO audit_log (actor_id, action, resource, decision, reason)
        VALUES ($1, $2, $3, $4, $5)
        "#,
        entry.actor_id.map(|id| id.as_uuid()),
        entry.action,
        entry.resource,
        entry.decision,
        entry.reason,
    )
    .execute(pool)
    .await
    .context("insert audit log")?;
    Ok(())
}
