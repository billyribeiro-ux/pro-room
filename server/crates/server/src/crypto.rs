//! Password hashing and opaque-token generation/hashing.
//!
//! - Passwords use Argon2id with a per-password random salt.
//! - Session and magic-link tokens are high-entropy random strings; only their
//!   SHA-256 hash is stored, so the database never holds a usable credential.

use argon2::Argon2;
use argon2::password_hash::rand_core::{OsRng, RngCore};
use argon2::password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString};
use base64::Engine;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use sha2::{Digest, Sha256};

/// Hash a plaintext password with Argon2id.
pub fn hash_password(password: &str) -> anyhow::Result<String> {
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| anyhow::anyhow!("argon2 hash failed: {e}"))?;
    Ok(hash.to_string())
}

/// Verify a plaintext password against a stored Argon2 hash. Returns `false`
/// for a mismatch; errors only if the stored hash is malformed.
pub fn verify_password(password: &str, stored_hash: &str) -> anyhow::Result<bool> {
    let parsed = PasswordHash::new(stored_hash)
        .map_err(|e| anyhow::anyhow!("stored password hash is malformed: {e}"))?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok())
}

/// A freshly generated opaque token: the secret to hand to the client, and the
/// hash to persist.
pub struct Token {
    /// Give this to the client (e.g. in the cookie or magic link). Never stored.
    pub secret: String,
    /// Store this. Used to look the token up on subsequent requests.
    pub hash: String,
}

/// Generate a 256-bit random token and its storage hash.
#[must_use]
pub fn generate_token() -> Token {
    let mut bytes = [0u8; 32];
    OsRng.fill_bytes(&mut bytes);
    let secret = URL_SAFE_NO_PAD.encode(bytes);
    let hash = hash_token(&secret);
    Token { secret, hash }
}

/// Hash an opaque token for storage/lookup (SHA-256, hex-encoded).
#[must_use]
pub fn hash_token(secret: &str) -> String {
    let digest = Sha256::digest(secret.as_bytes());
    hex(&digest)
}

fn hex(bytes: &[u8]) -> String {
    use std::fmt::Write;
    bytes
        .iter()
        .fold(String::with_capacity(bytes.len() * 2), |mut s, b| {
            let _ = write!(s, "{b:02x}");
            s
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn password_roundtrip() {
        let hash = hash_password("correct horse battery staple").unwrap();
        assert!(verify_password("correct horse battery staple", &hash).unwrap());
        assert!(!verify_password("wrong password", &hash).unwrap());
    }

    #[test]
    fn tokens_are_unique_and_hash_is_stable() {
        let a = generate_token();
        let b = generate_token();
        assert_ne!(a.secret, b.secret);
        assert_eq!(a.hash, hash_token(&a.secret));
        assert_ne!(a.hash, b.hash);
    }
}
