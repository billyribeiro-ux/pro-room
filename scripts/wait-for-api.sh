#!/usr/bin/env bash
# Block until the Rust API accepts /health (or timeout).
# Used so Vite does not proxy /api → 502 while `cargo run` is still compiling.
set -euo pipefail

URL="${PROOM_API_HEALTH_URL:-http://127.0.0.1:8080/health}"
TIMEOUT_SEC="${PROOM_API_WAIT_TIMEOUT:-180}"
start=$(date +%s)

echo "waiting for API at $URL (timeout ${TIMEOUT_SEC}s)…"
while true; do
	if curl -sf -m 2 "$URL" >/dev/null 2>&1; then
		echo "API is up"
		exit 0
	fi
	now=$(date +%s)
	if (( now - start >= TIMEOUT_SEC )); then
		echo "error: API did not become ready within ${TIMEOUT_SEC}s ($URL)" >&2
		exit 1
	fi
	sleep 0.5
done
