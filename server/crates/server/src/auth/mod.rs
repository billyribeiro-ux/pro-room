//! Authentication: sessions plus the three credential types (password, OAuth,
//! magic link) that all converge on a single server-side session.

pub mod account;
pub mod magic;
pub mod mailer;
pub mod oauth;
pub mod session;
