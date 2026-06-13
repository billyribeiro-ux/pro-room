//! The three-tier role taxonomy. Roles are ordered: a higher role is strictly
//! more privileged than a lower one.

use serde::{Deserialize, Serialize};
use std::str::FromStr;

/// A role, used both as a global role on the user and as a per-room role on a
/// membership. `Ord` reflects privilege: `Member < Admin < SuperAdmin`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Role {
    Member,
    Admin,
    SuperAdmin,
}

impl Role {
    /// Lowercase, stable wire/database representation.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Member => "member",
            Self::Admin => "admin",
            Self::SuperAdmin => "super_admin",
        }
    }

    /// Whether this role is an administrative role (admin or super admin).
    /// Administrative roles may post alerts and publish their screen.
    #[must_use]
    pub const fn is_admin(self) -> bool {
        matches!(self, Self::Admin | Self::SuperAdmin)
    }
}

#[derive(Debug, thiserror::Error)]
#[error("invalid role: {0}")]
pub struct ParseRoleError(String);

impl FromStr for Role {
    type Err = ParseRoleError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "member" => Ok(Self::Member),
            "admin" => Ok(Self::Admin),
            "super_admin" => Ok(Self::SuperAdmin),
            other => Err(ParseRoleError(other.to_owned())),
        }
    }
}

impl std::fmt::Display for Role {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.as_str())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ordering_reflects_privilege() {
        assert!(Role::SuperAdmin > Role::Admin);
        assert!(Role::Admin > Role::Member);
    }

    #[test]
    fn roundtrips_through_string() {
        for role in [Role::Member, Role::Admin, Role::SuperAdmin] {
            assert_eq!(role.as_str().parse::<Role>().unwrap(), role);
        }
    }

    #[test]
    fn admin_classification() {
        assert!(Role::SuperAdmin.is_admin());
        assert!(Role::Admin.is_admin());
        assert!(!Role::Member.is_admin());
    }
}
