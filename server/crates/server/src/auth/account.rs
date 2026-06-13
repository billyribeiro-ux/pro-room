//! Account provisioning shared by all credential types.
//!
//! The very first account created on a fresh deployment becomes `super_admin`
//! (bootstrap); everyone else starts as `member` and is elevated later by a
//! super admin.

use crate::db;
use crate::error::AppResult;
use crate::state::AppState;
use domain::Role;
use domain::entities::User;

/// Choose the role for a newly created account: super admin if it is the first
/// user, otherwise member.
pub async fn bootstrap_role(state: &AppState) -> AppResult<Role> {
    let count = db::users::count(&state.db).await?;
    Ok(if count == 0 {
        Role::SuperAdmin
    } else {
        Role::Member
    })
}

/// Find a user by email, creating a passwordless account (for OAuth/magic-link
/// sign-in) if none exists. Returns the user and whether it was just created.
pub async fn find_or_create_by_email(
    state: &AppState,
    email: &str,
    display_name: &str,
) -> AppResult<User> {
    if let Some(existing) = db::users::find_by_email(&state.db, email).await? {
        return Ok(existing.user);
    }
    let role = bootstrap_role(state).await?;
    let user = db::users::create(&state.db, email, display_name, None, role).await?;
    Ok(user)
}
