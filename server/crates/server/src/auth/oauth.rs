//! OAuth 2.0 authorization-code sign-in with PKCE, for Google and GitHub.
//!
//! `start` builds the provider authorize URL and stashes the CSRF state + PKCE
//! verifier; `callback` validates the state, exchanges the code, fetches the
//! user's profile, and provisions/links the local account.

use crate::auth::account;
use crate::config::OAuthProviderConfig;
use crate::crypto;
use crate::db;
use crate::error::{AppError, AppResult};
use crate::state::AppState;
use anyhow::Context as _;
use base64::Engine;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use domain::UserId;
use sha2::{Digest, Sha256};
use time::{Duration, OffsetDateTime};

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Provider {
    Google,
    Github,
}

impl Provider {
    pub fn parse(s: &str) -> AppResult<Self> {
        match s {
            "google" => Ok(Self::Google),
            "github" => Ok(Self::Github),
            _ => Err(AppError::NotFound),
        }
    }

    const fn name(self) -> &'static str {
        match self {
            Self::Google => "google",
            Self::Github => "github",
        }
    }

    const fn authorize_url(self) -> &'static str {
        match self {
            Self::Google => "https://accounts.google.com/o/oauth2/v2/auth",
            Self::Github => "https://github.com/login/oauth/authorize",
        }
    }

    const fn token_url(self) -> &'static str {
        match self {
            Self::Google => "https://oauth2.googleapis.com/token",
            Self::Github => "https://github.com/login/oauth/access_token",
        }
    }

    const fn scope(self) -> &'static str {
        match self {
            Self::Google => "openid email profile",
            Self::Github => "read:user user:email",
        }
    }
}

fn provider_config(state: &AppState, provider: Provider) -> AppResult<&OAuthProviderConfig> {
    let cfg = match provider {
        Provider::Google => state.config.google_oauth.as_ref(),
        Provider::Github => state.config.github_oauth.as_ref(),
    };
    cfg.ok_or(AppError::Disabled("oauth provider not configured"))
}

fn redirect_uri(state: &AppState, provider: Provider) -> String {
    format!(
        "{}/api/auth/oauth/{}/callback",
        state.config.public_api_url.trim_end_matches('/'),
        provider.name()
    )
}

/// Build the authorize URL the browser is redirected to, persisting CSRF/PKCE
/// state for the callback.
pub async fn start(
    state: &AppState,
    provider: Provider,
    redirect_to: Option<&str>,
) -> AppResult<String> {
    let config = provider_config(state, provider)?;

    let csrf = crypto::generate_token().secret;
    let verifier = crypto::generate_token().secret;
    let challenge = URL_SAFE_NO_PAD.encode(Sha256::digest(verifier.as_bytes()));
    let expires_at = OffsetDateTime::now_utc() + Duration::minutes(10);
    db::oauth::save(
        &state.db,
        &csrf,
        provider.name(),
        &verifier,
        redirect_to,
        expires_at,
    )
    .await?;

    let mut url = url::Url::parse(provider.authorize_url()).expect("valid authorize url");
    url.query_pairs_mut()
        .append_pair("client_id", &config.client_id)
        .append_pair("redirect_uri", &redirect_uri(state, provider))
        .append_pair("response_type", "code")
        .append_pair("scope", provider.scope())
        .append_pair("state", &csrf)
        .append_pair("code_challenge", &challenge)
        .append_pair("code_challenge_method", "S256");
    Ok(url.to_string())
}

/// Handle the provider callback: validate state, exchange the code, fetch the
/// profile, provision/link the account, and return the user plus where to send
/// the browser next.
pub async fn callback(
    state: &AppState,
    provider: Provider,
    code: &str,
    returned_state: &str,
) -> AppResult<(UserId, Option<String>)> {
    let config = provider_config(state, provider)?;

    let stored = db::oauth::consume(&state.db, returned_state)
        .await?
        .ok_or(AppError::BadRequest("invalid oauth state".into()))?;
    if stored.provider != provider.name() {
        return Err(AppError::BadRequest("oauth provider mismatch".into()));
    }

    let access_token = exchange_code(state, provider, config, code, &stored.pkce_verifier).await?;
    let profile = fetch_profile(provider, &access_token).await?;

    let display_name = profile.name.unwrap_or_else(|| profile.email.clone());
    let user = account::find_or_create_by_email(state, &profile.email, &display_name).await?;
    db::identities::link(&state.db, user.id, provider.name(), &profile.subject).await?;
    Ok((user.id, stored.redirect_to))
}

async fn exchange_code(
    state: &AppState,
    provider: Provider,
    config: &OAuthProviderConfig,
    code: &str,
    verifier: &str,
) -> AppResult<String> {
    let params = [
        ("grant_type", "authorization_code"),
        ("code", code),
        ("redirect_uri", &redirect_uri(state, provider)),
        ("client_id", &config.client_id),
        ("client_secret", &config.client_secret),
        ("code_verifier", verifier),
    ];
    let resp = http_client()?
        .post(provider.token_url())
        .header("Accept", "application/json")
        .form(&params)
        .send()
        .await
        .context("oauth token request failed")?;
    if !resp.status().is_success() {
        return Err(AppError::BadRequest("oauth token exchange rejected".into()));
    }
    let body: serde_json::Value = resp.json().await.context("parse oauth token response")?;
    body.get("access_token")
        .and_then(|v| v.as_str())
        .map(str::to_owned)
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("oauth response missing access_token")))
}

struct Profile {
    subject: String,
    email: String,
    name: Option<String>,
}

async fn fetch_profile(provider: Provider, access_token: &str) -> AppResult<Profile> {
    match provider {
        Provider::Google => fetch_google(access_token).await,
        Provider::Github => fetch_github(access_token).await,
    }
}

async fn fetch_google(access_token: &str) -> AppResult<Profile> {
    let body: serde_json::Value = http_client()?
        .get("https://openidconnect.googleapis.com/v1/userinfo")
        .bearer_auth(access_token)
        .send()
        .await
        .context("google userinfo request failed")?
        .json()
        .await
        .context("parse google userinfo")?;

    let email = body
        .get("email")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::BadRequest("google account has no email".into()))?
        .to_owned();
    Ok(Profile {
        subject: string_field(&body, "sub").unwrap_or_else(|| email.clone()),
        email,
        name: string_field(&body, "name"),
    })
}

async fn fetch_github(access_token: &str) -> AppResult<Profile> {
    let user: serde_json::Value = http_client()?
        .get("https://api.github.com/user")
        .bearer_auth(access_token)
        .send()
        .await
        .context("github user request failed")?
        .json()
        .await
        .context("parse github user")?;

    let subject = user
        .get("id")
        .map(std::string::ToString::to_string)
        .ok_or_else(|| AppError::BadRequest("github account has no id".into()))?;

    // GitHub may omit a public email; fall back to the primary verified address.
    let email = match string_field(&user, "email") {
        Some(email) => email,
        None => github_primary_email(access_token).await?,
    };
    Ok(Profile {
        subject,
        email,
        name: string_field(&user, "name").or_else(|| string_field(&user, "login")),
    })
}

async fn github_primary_email(access_token: &str) -> AppResult<String> {
    let emails: Vec<serde_json::Value> = http_client()?
        .get("https://api.github.com/user/emails")
        .bearer_auth(access_token)
        .send()
        .await
        .context("github emails request failed")?
        .json()
        .await
        .context("parse github emails")?;

    emails
        .iter()
        .find(|e| {
            e.get("primary").and_then(serde_json::Value::as_bool) == Some(true)
                && e.get("verified").and_then(serde_json::Value::as_bool) == Some(true)
        })
        .and_then(|e| string_field(e, "email"))
        .ok_or_else(|| AppError::BadRequest("github account has no verified primary email".into()))
}

fn string_field(value: &serde_json::Value, key: &str) -> Option<String> {
    value.get(key).and_then(|v| v.as_str()).map(str::to_owned)
}

fn http_client() -> AppResult<reqwest::Client> {
    reqwest::Client::builder()
        .user_agent("pro-room-server")
        // Bound every OAuth provider call so a slow or hung endpoint can't pin a
        // request task indefinitely (geo.rs sets the same pair). connect + total.
        .connect_timeout(std::time::Duration::from_secs(5))
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| AppError::Internal(anyhow::Error::new(e)))
}
