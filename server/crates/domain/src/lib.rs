//! Pure domain types for `ProTradingRoom`: identities, roles, permissions, and the
//! vocabulary (`Action`/`Resource`) the authorization engine reasons over.
//!
//! This crate has no I/O and no async. Everything here is deterministic and
//! unit-testable, which lets the `authz` crate be exhaustively exercised.

pub mod authz;
pub mod entities;
pub mod ids;
pub mod permission;
pub mod role;

pub use authz::{Action, Context, Decision, Resource, Subject};
pub use ids::{AlertId, MessageId, RoomId, SessionId, UserId};
pub use permission::Permission;
pub use role::Role;
