//! `LiveKit` Cloud access-token minting. A `LiveKit` token is an HS256 JWT carrying
//! a "video grant" describing what the bearer may do in a room. We mint it
//! directly (no SDK) so the publish/subscribe grants are derived precisely from
//! our own authorization decision.

use crate::config::LiveKitConfig;
use anyhow::Context as _;
use jsonwebtoken::{Algorithm, EncodingKey, Header};
use serde::Serialize;
use time::OffsetDateTime;

/// Tokens are short-lived; the client reconnects/refreshes as needed.
const TTL_SECONDS: i64 = 6 * 3600;

#[derive(Serialize)]
struct Claims<'a> {
    iss: &'a str,
    sub: &'a str,
    name: &'a str,
    nbf: i64,
    exp: i64,
    video: VideoGrant<'a>,
}

/// `LiveKit`'s video-grant wire format; the boolean flags are dictated by `LiveKit`.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
#[allow(clippy::struct_excessive_bools)]
struct VideoGrant<'a> {
    room: &'a str,
    room_join: bool,
    can_publish: bool,
    can_subscribe: bool,
    can_publish_data: bool,
}

/// What a participant is permitted to do, decided upstream by the authz engine.
pub struct Grant {
    pub identity: String,
    pub display_name: String,
    pub room: String,
    /// Only `super_admin`/`admin` who passed the publish check get this.
    pub can_publish: bool,
}

/// Mint a signed `LiveKit` access token.
pub fn mint(config: &LiveKitConfig, grant: &Grant) -> anyhow::Result<String> {
    let now = OffsetDateTime::now_utc().unix_timestamp();
    let claims = Claims {
        iss: &config.api_key,
        sub: &grant.identity,
        name: &grant.display_name,
        nbf: now,
        exp: now + TTL_SECONDS,
        video: VideoGrant {
            room: &grant.room,
            room_join: true,
            can_publish: grant.can_publish,
            can_subscribe: true,
            can_publish_data: true,
        },
    };
    jsonwebtoken::encode(
        &Header::new(Algorithm::HS256),
        &claims,
        &EncodingKey::from_secret(config.api_secret.as_bytes()),
    )
    .context("failed to sign livekit token")
}
