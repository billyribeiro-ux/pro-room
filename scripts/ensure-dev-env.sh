#!/usr/bin/env bash
# Copy .env.example → .env for server + web when missing (idempotent, never overwrites).
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

ensure "$ROOT/server/.env.example" "$ROOT/server/.env"
ensure "$ROOT/web/.env.example" "$ROOT/web/.env"
