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

- Node **24.18.0** LTS (`.nvmrc`) · pnpm
- Rust stable 1.97+ (`server/rust-toolchain.toml`)
- Docker (Postgres 18, Redis 8, LiveKit 1.13.4) via `docker compose up`

## Development

One command from `web/` starts Postgres + Redis, the Rust API, and the SvelteKit
dev server (creates `server/.env` / `web/.env` from the examples if missing).
Vite boots immediately in parallel while infra + the API come up:

```bash
cd web && pnpm install && pnpm dev:all
```

- Web: http://localhost:5173 (or http://127.0.0.1:5173)  
- API: http://127.0.0.1:8080 (Vite proxies `/api` → API so auth cookies are same-origin)

Or run pieces separately:

```bash
pnpm dev:infra     # docker compose: postgres + redis (waits until healthy)
pnpm dev:api       # cargo run -p server
pnpm dev:backend   # infra then API
pnpm dev           # vite (SvelteKit)
```

Optional LiveKit SFU for screen share: `docker compose up -d livekit` from the
repo root (keys in `livekit.yaml` / `server/.env.example`).

See `web/.env.example` and `server/.env.example` for configuration (database URL
on host port **5433**, Redis on **6380**, LiveKit, OAuth, SMTP).
