//! Outbound email for magic links.
//!
//! Delivery is intentionally pluggable. With no SMTP configured (the default in
//! development) the link is logged so the flow is fully exercisable end-to-end.
//! Wiring a real transport (e.g. `lettre`) when `config.smtp` is set is a
//! single-function change here and does not touch the auth flow.

use crate::config::Config;

/// "Send" a magic-link email. Returns `Ok` once the link has been handed off
/// (logged in dev; would be submitted to SMTP in production).
pub fn send_magic_link(config: &Config, email: &str, link: &str) {
    match &config.smtp {
        Some(smtp) => {
            // Production transport goes here. Until wired, we log that we would
            // send so the operator can see delivery is configured but inert.
            tracing::info!(
                to = email,
                from = smtp.from,
                host = smtp.url,
                "magic link ready to send via SMTP (transport not yet wired)"
            );
            tracing::debug!(link, "magic link");
        }
        None => {
            // Dev mode: surface the link so sign-in can be completed locally.
            tracing::info!(to = email, link, "magic link (dev: no SMTP configured)");
        }
    }
}
