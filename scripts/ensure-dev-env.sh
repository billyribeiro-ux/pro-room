#!/usr/bin/env bash
# Bootstrap local env for `pnpm dev:all` (idempotent).
# - Create server/.env + web/.env from examples when missing
# - Repair known-bad SMTP_FROM quoting (breaks sqlx dotenv at compile time)
# - Free stale listeners on Vite (5173) and API (8080) so re-runs don't clash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

ensure() {
	local example="$1"
	local target="$2"
	if [[ -f "$target" ]]; then
		return 0
	fi
	if [[ ! -f "$example" ]]; then
		echo "error: missing $example" >&2
		exit 1
	fi
	cp "$example" "$target"
	echo "created $target from $(basename "$example")"
}

# Unquoted `SMTP_FROM=Name <addr>` is invalid dotenv → sqlx macro: "error reading dotenv file".
repair_smtp_from() {
	local env_file="$1"
	[[ -f "$env_file" ]] || return 0
	if grep -qE '^SMTP_FROM=ProTradingRoom <' "$env_file"; then
		# portable in-place edit (macOS/BSD sed)
		sed -i.bak 's/^SMTP_FROM=ProTradingRoom <no-reply@example.com>$/SMTP_FROM="ProTradingRoom <no-reply@example.com>"/' "$env_file"
		rm -f "${env_file}.bak"
		echo "repaired SMTP_FROM quoting in $env_file"
	fi
}

free_port() {
	local port="$1"
	local pids
	pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
	if [[ -n "$pids" ]]; then
		echo "freeing :$port (pid $pids)"
		# shellcheck disable=SC2086
		kill $pids 2>/dev/null || true
		# brief wait so TIME_WAIT/bind can clear
		sleep 0.4
	fi
}

ensure "$ROOT/server/.env.example" "$ROOT/server/.env"
ensure "$ROOT/web/.env.example" "$ROOT/web/.env"
repair_smtp_from "$ROOT/server/.env"
free_port 5173
free_port 8080
