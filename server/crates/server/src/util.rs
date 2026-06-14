//! Small shared helpers.

use axum::http::HeaderMap;
use std::net::SocketAddr;

/// Resolve the client's IP address for a request. In production the service sits
/// behind a proxy (Vercel / Railway), so the forwarded headers carry the real
/// client address; the direct peer address is only the proxy. Order of
/// preference: `X-Forwarded-For` (first hop), then `X-Real-IP`, then the direct
/// TCP peer from `ConnectInfo`. Returns the address as a string, or `None` when
/// nothing is available.
#[must_use]
pub fn client_ip(headers: &HeaderMap, peer: Option<SocketAddr>) -> Option<String> {
    // `X-Forwarded-For: client, proxy1, proxy2` — the first entry is the origin
    // client. Take the leftmost non-empty token.
    if let Some(value) = headers.get("x-forwarded-for").and_then(|v| v.to_str().ok())
        && let Some(first) = value.split(',').map(str::trim).find(|s| !s.is_empty())
    {
        return Some(first.to_owned());
    }
    if let Some(value) = headers.get("x-real-ip").and_then(|v| v.to_str().ok()) {
        let trimmed = value.trim();
        if !trimmed.is_empty() {
            return Some(trimmed.to_owned());
        }
    }
    peer.map(|addr| addr.ip().to_string())
}

/// Turn an arbitrary string into a URL-safe slug: lowercase ASCII alphanumerics,
/// with runs of other characters collapsed to single hyphens and trimmed.
#[must_use]
pub fn slugify(input: &str) -> String {
    let mut slug = String::with_capacity(input.len());
    let mut prev_dash = false;
    for ch in input.trim().chars() {
        if ch.is_ascii_alphanumeric() {
            slug.push(ch.to_ascii_lowercase());
            prev_dash = false;
        } else if !prev_dash && !slug.is_empty() {
            slug.push('-');
            prev_dash = true;
        }
    }
    slug.trim_end_matches('-').to_owned()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn slugifies() {
        assert_eq!(slugify("  Morning  Scalps!! "), "morning-scalps");
        assert_eq!(slugify("ES / NQ Futures"), "es-nq-futures");
        assert_eq!(slugify("***"), "");
    }
}
