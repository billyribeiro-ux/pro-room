-- Identity, sessions, and the credential types that all converge on one session.

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('member', 'admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended');
CREATE TYPE identity_provider AS ENUM ('password', 'google', 'github', 'magic');

CREATE TABLE users (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email         citext NOT NULL UNIQUE,
    display_name  text NOT NULL,
    -- Null for users who only authenticate via OAuth or magic link.
    password_hash text,
    global_role   user_role NOT NULL DEFAULT 'member',
    status        user_status NOT NULL DEFAULT 'active',
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

-- A single user may link several login methods (password + Google + GitHub...).
CREATE TABLE identities (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    provider         identity_provider NOT NULL,
    provider_subject text NOT NULL,
    created_at       timestamptz NOT NULL DEFAULT now(),
    UNIQUE (provider, provider_subject)
);
CREATE INDEX idx_identities_user ON identities (user_id);

-- Server-side sessions. We persist only a hash of the opaque token so a DB leak
-- does not expose live credentials. Revocable via revoked_at.
CREATE TABLE sessions (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    user_agent text,
    ip         text,
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz
);
CREATE INDEX idx_sessions_user ON sessions (user_id);

-- Single-use, short-TTL tokens for passwordless magic-link login.
CREATE TABLE magic_link_tokens (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email       citext NOT NULL,
    token_hash  text NOT NULL UNIQUE,
    created_at  timestamptz NOT NULL DEFAULT now(),
    expires_at  timestamptz NOT NULL,
    consumed_at timestamptz
);

-- Transient CSRF/PKCE state for the OAuth authorization-code flow.
CREATE TABLE oauth_states (
    state         text PRIMARY KEY,
    provider      identity_provider NOT NULL,
    pkce_verifier text NOT NULL,
    redirect_to   text,
    created_at    timestamptz NOT NULL DEFAULT now(),
    expires_at    timestamptz NOT NULL
);
