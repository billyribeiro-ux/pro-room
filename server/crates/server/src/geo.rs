//! Best-effort IP geolocation for the admin presence view.
//!
//! Resolves a client IP to a human-readable "City, Country" string by calling a
//! free geo-IP API ([ip-api.com]). Resolution is strictly best-effort: any
//! failure (network error, timeout, non-success body, unparseable IP) yields
//! `None` and never blocks or errors the calling request.
//!
//! Results are cached in-process so each distinct IP is resolved at most once
//! for the lifetime of the server. Private, loopback, and otherwise non-global
//! addresses short-circuit to `None` ("Local network" client-side) *without*
//! touching the network — we never leak an internal address to a third party.
//!
//! [ip-api.com]: http://ip-api.com/

use serde::Deserialize;
use std::collections::HashMap;
use std::net::IpAddr;
use std::sync::{Arc, Mutex};
use std::time::Duration;

/// Outbound request timeout for a single geo lookup. Generous enough for a
/// cross-region call, short enough that a hung API never ties up the admin
/// request for long. Hard rule (CLAUDE.md): every external HTTP client sets BOTH
/// `.timeout()` and `.connect_timeout()`.
const REQUEST_TIMEOUT: Duration = Duration::from_secs(3);
/// TCP/TLS handshake timeout — a stalled connect must not consume the full
/// request budget.
const CONNECT_TIMEOUT: Duration = Duration::from_secs(3);

/// Geolocation resolver: a shared reqwest client plus an in-memory result cache.
/// Cheap to clone (everything inside is reference-counted), so it lives on
/// `AppState` and is cloned into handlers.
#[derive(Clone)]
pub struct GeoResolver {
    client: reqwest::Client,
    /// IP → resolved location. `None` means "resolved, but no location" (private
    /// address or a failed/empty lookup) — distinct from "not yet resolved"
    /// (absent key), so we never re-hit the API for a known-unresolvable IP.
    cache: Arc<Mutex<HashMap<IpAddr, Option<String>>>>,
}

/// The subset of the ip-api.com response we request (`fields=status,country,city`).
#[derive(Deserialize)]
struct GeoApiResponse {
    status: String,
    country: Option<String>,
    city: Option<String>,
}

impl GeoResolver {
    /// Build the resolver with a timeout-bounded HTTP client. Falls back to a
    /// default client if the builder somehow fails (it does not, given these
    /// options), so construction is infallible from the caller's point of view.
    #[must_use]
    pub fn new() -> Self {
        let client = reqwest::Client::builder()
            .user_agent("pro-room-server")
            .timeout(REQUEST_TIMEOUT)
            .connect_timeout(CONNECT_TIMEOUT)
            .build()
            .unwrap_or_default();
        Self {
            client,
            cache: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Resolve an IP string to a "City, Country" label (best-effort).
    ///
    /// Returns `None` when the string is not a valid IP, the address is
    /// private/loopback/non-global, or the lookup fails. Cached results
    /// (including a cached `None`) are returned without a network call.
    pub async fn locate(&self, ip: &str) -> Option<String> {
        let addr: IpAddr = ip.trim().parse().ok()?;

        // Never call the API for non-global addresses.
        if !is_global(addr) {
            self.cache_set(addr, None);
            return None;
        }
        // Serve a prior result (present key) without a network call; only a
        // genuine cache miss falls through to the API.
        if let Some(cached) = self.cached(addr) {
            return cached;
        }

        let location = self.fetch(addr).await;
        self.cache_set(addr, location.clone());
        location
    }

    /// Perform the actual geo-IP API call. Any error or non-`"success"` status
    /// maps to `None`; this function never propagates an error.
    async fn fetch(&self, addr: IpAddr) -> Option<String> {
        let url = format!("http://ip-api.com/json/{addr}?fields=status,country,city");
        let resp = match self.client.get(&url).send().await {
            Ok(resp) => resp,
            Err(err) => {
                tracing::debug!(error = ?err, %addr, "geo lookup request failed");
                return None;
            }
        };
        let body: GeoApiResponse = match resp.json().await {
            Ok(body) => body,
            Err(err) => {
                tracing::debug!(error = ?err, %addr, "geo lookup decode failed");
                return None;
            }
        };
        if body.status != "success" {
            return None;
        }
        format_location(body.city.as_deref(), body.country.as_deref())
    }

    /// Look up a cached result. The outer `Option` is cache presence (`None` =
    /// miss, never resolved); the inner is the resolved location (`Some(None)` =
    /// resolved to no location). The two levels are semantically distinct — a
    /// miss triggers an API call, a cached `None` does not — so the nested
    /// `Option` is intentional here.
    #[allow(clippy::option_option)]
    fn cached(&self, addr: IpAddr) -> Option<Option<String>> {
        self.cache
            .lock()
            .expect("geo cache mutex poisoned")
            .get(&addr)
            .cloned()
    }

    fn cache_set(&self, addr: IpAddr, location: Option<String>) {
        self.cache
            .lock()
            .expect("geo cache mutex poisoned")
            .insert(addr, location);
    }
}

impl Default for GeoResolver {
    fn default() -> Self {
        Self::new()
    }
}

/// Combine the API's city/country into a single label. "City, Country" when both
/// are present; either alone when only one is; `None` when neither is.
fn format_location(city: Option<&str>, country: Option<&str>) -> Option<String> {
    let city = city.map(str::trim).filter(|s| !s.is_empty());
    let country = country.map(str::trim).filter(|s| !s.is_empty());
    match (city, country) {
        (Some(city), Some(country)) => Some(format!("{city}, {country}")),
        (Some(city), None) => Some(city.to_owned()),
        (None, Some(country)) => Some(country.to_owned()),
        (None, None) => None,
    }
}

/// Whether an address is globally routable, i.e. worth sending to the geo API.
/// Loopback, private (RFC 1918 / ULA), link-local, and unspecified addresses are
/// "local network" and must never be sent to a third-party service.
fn is_global(addr: IpAddr) -> bool {
    match addr {
        IpAddr::V4(v4) => {
            !(v4.is_private()
                || v4.is_loopback()
                || v4.is_link_local()
                || v4.is_broadcast()
                || v4.is_documentation()
                || v4.is_unspecified()
                || is_shared_address_space(v4))
        }
        IpAddr::V6(v6) => {
            // No stable `is_unique_local`/`is_unicast_link_local` on stable Rust,
            // so detect ULA (fc00::/7) and link-local (fe80::/10) by prefix.
            let seg = v6.segments()[0];
            let is_unique_local = (seg & 0xfe00) == 0xfc00;
            let is_link_local = (seg & 0xffc0) == 0xfe80;
            !(v6.is_loopback() || v6.is_unspecified() || is_unique_local || is_link_local)
        }
    }
}

/// RFC 6598 carrier-grade-NAT shared address space (`100.64.0.0/10`). Not covered
/// by [`std::net::Ipv4Addr::is_private`] but just as non-routable on the public
/// internet, so it must never be sent to the geo API. (`Ipv4Addr::is_shared` is
/// still unstable, hence the manual prefix check.)
fn is_shared_address_space(v4: std::net::Ipv4Addr) -> bool {
    let [a, b, ..] = v4.octets();
    a == 100 && (b & 0xc0) == 0x40
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn private_and_loopback_are_not_global() {
        for ip in [
            "127.0.0.1",
            "10.0.0.5",
            "192.168.1.10",
            "172.16.0.1",
            "169.254.0.1",
            "0.0.0.0",
            "::1",
            "fc00::1",
            "fe80::1",
        ] {
            let addr: IpAddr = ip.parse().unwrap();
            assert!(!is_global(addr), "{ip} should be treated as local");
        }
    }

    #[test]
    fn public_addresses_are_global() {
        for ip in ["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"] {
            let addr: IpAddr = ip.parse().unwrap();
            assert!(is_global(addr), "{ip} should be treated as global");
        }
    }

    #[test]
    fn cgnat_shared_space_is_not_global() {
        // RFC 6598 100.64.0.0/10 must be treated as local (never sent to the API).
        for ip in ["100.64.0.1", "100.100.50.2", "100.127.255.255"] {
            let addr: IpAddr = ip.parse().unwrap();
            assert!(!is_global(addr), "{ip} (CGNAT) should be treated as local");
        }
        // Addresses just outside the /10 stay global.
        for ip in ["100.63.255.255", "100.128.0.1"] {
            let addr: IpAddr = ip.parse().unwrap();
            assert!(is_global(addr), "{ip} should be treated as global");
        }
    }

    #[test]
    fn formats_location() {
        assert_eq!(
            format_location(Some("Lisbon"), Some("Portugal")),
            Some("Lisbon, Portugal".to_owned())
        );
        assert_eq!(
            format_location(None, Some("Portugal")),
            Some("Portugal".to_owned())
        );
        assert_eq!(
            format_location(Some("Lisbon"), None),
            Some("Lisbon".to_owned())
        );
        assert_eq!(format_location(None, None), None);
        assert_eq!(format_location(Some("  "), Some(" ")), None);
    }
}
