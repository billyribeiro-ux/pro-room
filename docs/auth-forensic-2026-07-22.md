# Auth forensic report — 2026-07-22

## Verdict

**The stack works.** The only failure reproduced end-to-end is **wrong password**.
The UI message `authentication required` is the generic 401 body used for failed login
(not a separate “session missing” bug when you see it on `POST …/login`).

## Hard evidence matrix (Playwright + curl)

| Case | Result | Login URL | HTTP | UI / cookie |
|------|--------|-----------|------|-------------|
| `admin@test.local` / `admin1234` @ localhost:5173 | **PASS** | `http://localhost:5173/api/auth/login` | **200** | → `/rooms`, `proom_session` set |
| `admin@ptr.test` / `admin1234` @ localhost:5173 | **PASS** | same-origin `/api` | **200** | → `/rooms` |
| `admin@test.local` / `admin1234` @ 127.0.0.1:5173 | **PASS** | `http://127.0.0.1:5173/api/auth/login` | **200** | cookie domain `127.0.0.1` |
| `admin@ptr.test` / `proom1234` (old password) | **FAIL** | same-origin `/api` | **401** | UI: `authentication required`, no cookie |

### curl (same machine)

```
8080 admin@test.local / admin1234 -> 200
8080 admin@ptr.test / admin1234 -> 200
8080 admin@ptr.test / proom1234 -> 401   # OLD password — fails
5173@localhost admin@test.local -> 200  # Vite proxy
5173@127.0.0.1 admin@test.local -> 200
```

### Client config currently served by Vite

- `API_URL === ""` (same-origin; **not** `:8080`)
- `import.meta.env.DEV === true`
- Scanned served bundles: **no** hardcoded `8080` left

### If DevTools shows `:8080/api/auth/login`

That is a **stale browser tab / old JS bundle** from before the same-origin proxy fix.
Hard refresh or restart `pnpm dev:all`. Current server serves login as
`http://localhost:5173/api/auth/login`.

## Root causes of “still not working” (ranked)

1. **Wrong password (confirmed)** — `proom1234` was the first seed password; accounts were later
   reset to `admin1234`. Typing the old password produces exactly your 401 + message.
2. **Stale client hitting :8080** — earlier sessions before proxy fix; fixed on `main` (PR #20–#21).
3. **Browser autofill** inserting old password after email fill.

## Working credentials (local Docker Postgres only)

| Email | Password | Role |
|-------|----------|------|
| `admin@test.local` | `admin1234` | admin |
| `admin@ptr.test` | `admin1234` | admin |

URL: **http://localhost:5173/login**

## Git

- `d33d902` — Merge PR #21 force same-origin API in Vite dev
- `ec019b0` — Merge PR #20 Vite /api proxy
