# ProTradingRoom — Personal Edition

A self-hosted **live trading room**: an admin/presenter broadcasts their screen(s)
and voice in real time; members watch (single or split view), hear audio, chat,
and receive live trade alerts. This is the personal-scale build of the
ProTradingRoom concept.

## Architecture

Two fully decoupled apps that communicate only over HTTP/WebSocket + an httpOnly
session cookie, so either can be extracted into its own repository:

| App | Stack | Responsibility |
| --- | --- | --- |
| `web/` | SvelteKit 2 · Svelte 5 (runes) · TypeScript (strict) · Tailwind v4 + scoped CSS · Phosphor icons | UI, route guards, LiveKit client, realtime client |
| `server/` | Rust · Axum · Tokio · SQLx (PostgreSQL) · Redis (`fred`) · LiveKit token minting | Source of truth: auth, RBAC + ABAC, CRUD, realtime hub |

**Media** runs over LiveKit Cloud (SFU). The server mints short-lived LiveKit
JWTs whose publish/subscribe grants are derived from the authorization engine —
only `super_admin`/`admin` may publish a screen share; everyone may subscribe.

**Realtime** (chat, alerts, presence) runs over an Axum WebSocket per room, fanned
out across server instances via Redis Pub/Sub. Postgres is the source of truth;
Redis is cache + bus (sessions, presence, rate limits) for the room under load.

### Roles

`super_admin` › `admin` › `member`. Only `super_admin` and `admin` may post
trade alerts and share their screen. Members view/split + chat.

## Repository layout

```
web/                SvelteKit frontend
server/             Rust workspace
  crates/domain     pure types (ids, roles, permissions, authz vocabulary)
  crates/authz      RBAC + ABAC engine (pure, exhaustively tested)
  crates/server     Axum app: http, auth, db, cache, realtime
  migrations/       SQLx migrations
compose.yaml        local Postgres + Redis
```

## Toolchain

- Node **24.16.0** (`.nvmrc`) · pnpm
- Rust stable (`server/rust-toolchain.toml`)
- Docker (Postgres 16, Redis 7) via `docker compose up`

## Development

```bash
# infra
docker compose up -d

# backend
cd server && cargo run

# frontend
cd web && pnpm install && pnpm dev
```

See `web/.env.example` and `server/.env.example` for required configuration
(database URL, Redis URL, LiveKit credentials, OAuth client secrets, SMTP).
