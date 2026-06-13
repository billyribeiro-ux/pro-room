//! Room membership repository, including the per-room role and ABAC attributes.

use anyhow::Context as _;
use domain::{Role, RoomId, UserId};
use serde::Serialize;
use sqlx::PgPool;

/// The authorization-relevant facts about a (room, user) pair.
pub struct Membership {
    pub role: Role,
    pub attributes: Vec<(String, String)>,
}

/// A membership joined with the member's public profile, for listing.
#[derive(Serialize)]
pub struct MemberView {
    pub user_id: UserId,
    pub email: String,
    pub display_name: String,
    pub role: Role,
    #[serde(with = "time::serde::rfc3339")]
    pub joined_at: time::OffsetDateTime,
}

pub async fn upsert(
    pool: &PgPool,
    room_id: RoomId,
    user_id: UserId,
    role: Role,
    attributes: &serde_json::Value,
) -> anyhow::Result<()> {
    sqlx::query!(
        r#"
        INSERT INTO room_members (room_id, user_id, role, attributes)
        VALUES ($1, $2, $3::text::user_role, $4)
        ON CONFLICT (room_id, user_id)
        DO UPDATE SET role = EXCLUDED.role, attributes = EXCLUDED.attributes
        "#,
        room_id.as_uuid(),
        user_id.as_uuid(),
        role.as_str(),
        attributes,
    )
    .execute(pool)
    .await
    .context("upsert member")?;
    Ok(())
}

pub async fn remove(pool: &PgPool, room_id: RoomId, user_id: UserId) -> anyhow::Result<()> {
    let affected = sqlx::query!(
        "DELETE FROM room_members WHERE room_id = $1 AND user_id = $2",
        room_id.as_uuid(),
        user_id.as_uuid(),
    )
    .execute(pool)
    .await
    .context("remove member")?
    .rows_affected();
    anyhow::ensure!(affected == 1, "membership not found");
    Ok(())
}

/// Fetch the authorization facts for a (room, user) pair, if a membership exists.
pub async fn get(
    pool: &PgPool,
    room_id: RoomId,
    user_id: UserId,
) -> anyhow::Result<Option<Membership>> {
    let row = sqlx::query!(
        r#"SELECT role::text AS "role!", attributes FROM room_members
           WHERE room_id = $1 AND user_id = $2"#,
        room_id.as_uuid(),
        user_id.as_uuid(),
    )
    .fetch_optional(pool)
    .await
    .context("get membership")?;

    row.map(|r| {
        let attributes = match r.attributes {
            serde_json::Value::Object(map) => map
                .into_iter()
                .filter_map(|(k, v)| v.as_str().map(|s| (k, s.to_owned())))
                .collect(),
            _ => Vec::new(),
        };
        Ok(Membership {
            role: r.role.parse().context("parse role")?,
            attributes,
        })
    })
    .transpose()
}

pub async fn list(pool: &PgPool, room_id: RoomId) -> anyhow::Result<Vec<MemberView>> {
    let rows = sqlx::query!(
        r#"
        SELECT m.user_id, u.email, u.display_name, m.role::text AS "role!", m.joined_at
        FROM room_members m
        JOIN users u ON u.id = m.user_id
        WHERE m.room_id = $1
        ORDER BY m.joined_at
        "#,
        room_id.as_uuid(),
    )
    .fetch_all(pool)
    .await
    .context("list members")?;

    rows.into_iter()
        .map(|r| {
            Ok(MemberView {
                user_id: UserId::from_uuid(r.user_id),
                email: r.email,
                display_name: r.display_name,
                role: r.role.parse().context("parse role")?,
                joined_at: r.joined_at,
            })
        })
        .collect()
}
