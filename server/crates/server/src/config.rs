//! Runtime configuration, loaded once from the environment at startup.

use std::time::Duration;

#[derive(Debug, Clone)]
pub struct Config {
    pub bind_addr: String,
    pub cors_origins: Vec<String>,
    pub public_web_url: String,
    pub public_api_url: String,
    pub database_url: String,
    pub redis_url: String,
    /// Directory on local disk where uploaded file bytes are stored. Created on
    /// startup if missing (env `APP_UPLOADS_DIR`, default `./uploads`).
    pub uploads_dir: String,
    /// Reserved for cookie integrity / CSRF token signing. Required (and length-
    /// validated) at load so deployments provision it before it is needed.
    #[allow(dead_code)]
    pub session_secret: String,
    pub session_ttl: Duration,
    /// DEV-ONLY testing affordance. When true, the `CurrentUser` extractor
    /// resolves a synthetic super-admin for requests that have no valid
    /// session, letting QA exercise every endpoint without logging in. Parsed
    /// from `AUTH_DEV_BYPASS`; defaults to `false` and MUST stay unset in any
    /// non-local deployment. Never ship enabled.
    pub auth_dev_bypass: bool,
    pub livekit: Option<LiveKitConfig>,
    pub google_oauth: Option<OAuthProviderConfig>,
    pub github_oauth: Option<OAuthProviderConfig>,
    pub smtp: Option<SmtpConfig>,
}

#[derive(Debug, Clone)]
pub struct LiveKitConfig {
    pub url: String,
    pub api_key: String,
    pub api_secret: String,
}

#[derive(Debug, Clone)]
pub struct OAuthProviderConfig {
    pub client_id: String,
    pub client_secret: String,
}

#[derive(Debug, Clone)]
pub struct SmtpConfig {
    pub url: String,
    pub from: String,
}

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("missing required environment variable: {0}")]
    Missing(&'static str),
    #[error("invalid value for {0}: {1}")]
    Invalid(&'static str, String),
}

impl Config {
    /// Load configuration from process environment (after `.env` is applied).
    pub fn from_env() -> Result<Self, ConfigError> {
        let session_secret = req("SESSION_SECRET")?;
        if session_secret.len() < 32 {
            return Err(ConfigError::Invalid(
                "SESSION_SECRET",
                "must be at least 32 bytes".to_owned(),
            ));
        }

        let ttl_hours: u64 = opt("SESSION_TTL_HOURS")
            .as_deref()
            .unwrap_or("720")
            .parse()
            .map_err(|_| ConfigError::Invalid("SESSION_TTL_HOURS", "expected an integer".into()))?;

        Ok(Self {
            bind_addr: opt("APP_BIND_ADDR").unwrap_or_else(|| "0.0.0.0:8080".to_owned()),
            cors_origins: opt("APP_CORS_ORIGINS")
                .unwrap_or_else(|| "http://localhost:5173".to_owned())
                .split(',')
                .map(|s| s.trim().to_owned())
                .filter(|s| !s.is_empty())
                .collect(),
            public_web_url: opt("APP_PUBLIC_WEB_URL")
                .unwrap_or_else(|| "http://localhost:5173".to_owned()),
            public_api_url: opt("APP_PUBLIC_API_URL")
                .unwrap_or_else(|| "http://localhost:8080".to_owned()),
            database_url: req("DATABASE_URL")?,
            redis_url: opt("REDIS_URL").unwrap_or_else(|| "redis://localhost:6379".to_owned()),
            uploads_dir: opt("APP_UPLOADS_DIR").unwrap_or_else(|| "./uploads".to_owned()),
            session_secret,
            session_ttl: Duration::from_secs(ttl_hours * 3600),
            // DEV-ONLY: off unless explicitly opted in with a truthy value.
            auth_dev_bypass: truthy("AUTH_DEV_BYPASS"),
            livekit: optional_group(&[
                ("LIVEKIT_URL", true),
                ("LIVEKIT_API_KEY", true),
                ("LIVEKIT_API_SECRET", true),
            ])
            .map(|v| LiveKitConfig {
                url: v[0].clone(),
                api_key: v[1].clone(),
                api_secret: v[2].clone(),
            }),
            google_oauth: oauth_provider("GOOGLE"),
            github_oauth: oauth_provider("GITHUB"),
            smtp: optional_group(&[("SMTP_URL", true), ("SMTP_FROM", false)]).map(|v| SmtpConfig {
                url: v[0].clone(),
                from: v
                    .get(1)
                    .cloned()
                    .unwrap_or_else(|| "ProTradingRoom <no-reply@example.com>".to_owned()),
            }),
        })
    }
}

fn req(key: &'static str) -> Result<String, ConfigError> {
    match std::env::var(key) {
        Ok(v) if !v.trim().is_empty() => Ok(v),
        _ => Err(ConfigError::Missing(key)),
    }
}

fn opt(key: &str) -> Option<String> {
    std::env::var(key).ok().filter(|v| !v.trim().is_empty())
}

/// Parse a boolean env flag. Only `"1"` and `"true"` (case-insensitive) are
/// truthy; anything else — including unset — is `false`.
fn truthy(key: &str) -> bool {
    match opt(key) {
        Some(v) => matches!(v.trim().to_ascii_lowercase().as_str(), "1" | "true"),
        None => false,
    }
}

/// Returns the values of a group of env vars only if all the ones marked
/// required are present; otherwise `None` (the feature is disabled).
fn optional_group(keys: &[(&str, bool)]) -> Option<Vec<String>> {
    let mut out = Vec::with_capacity(keys.len());
    for (key, required) in keys {
        match opt(key) {
            Some(v) => out.push(v),
            None if *required => return None,
            None => out.push(String::new()),
        }
    }
    Some(out)
}

fn oauth_provider(prefix: &str) -> Option<OAuthProviderConfig> {
    let id = opt(&format!("OAUTH_{prefix}_CLIENT_ID"))?;
    let secret = opt(&format!("OAUTH_{prefix}_CLIENT_SECRET"))?;
    Some(OAuthProviderConfig {
        client_id: id,
        client_secret: secret,
    })
}
