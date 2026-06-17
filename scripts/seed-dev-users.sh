#!/usr/bin/env bash
#
# Seed dev users (a super-admin, an admin/presenter, and three members) for local
# testing. Idempotent — safe to re-run. Each user gets a real password login via the
# API's /register (correct argon2 hash + password identity) plus the right
# global_role and a membership in the dev room.
#
# Requires: the API up (default :8081) and psql access to the dev DB (default :5433).
# All seed users share the same password (below). Log in via the web /login page.
#
# AUTH_DEV_BYPASS note: with the bypass ON, an UNauthenticated request is served as a
# synthetic super-admin. To test as a specific seeded role you must LOG IN as that
# user — a real session cookie takes precedence over the bypass (session.rs).
#
# Usage:  ./scripts/seed-dev-users.sh
# Env overrides: API_URL, PGHOST/PGPORT/PGUSER/PGDB/PGPASSWORD, SEED_PASSWORD, SEED_ROOM_SLUG
set -euo pipefail

API="${API_URL:-http://localhost:8081}"
PASSWORD="${SEED_PASSWORD:-proom1234}"
ROOM_SLUG="${SEED_ROOM_SLUG:-dev-room}"
psql_q() {
	env PGPASSWORD="${PGPASSWORD:-proroom}" psql -h "${PGHOST:-localhost}" -p "${PGPORT:-5433}" \
		-U "${PGUSER:-proroom}" -d "${PGDB:-proroom}" -tA -c "$1"
}

# email | display_name | global_role
USERS=(
	"super@proroom.dev|Super Admin|super_admin"
	"presenter@proroom.dev|Presenter Pat|admin"
	"member1@proroom.dev|Member One|member"
	"member2@proroom.dev|Member Two|member"
	"member3@proroom.dev|Member Three|member"
)

room_id="$(psql_q "select id from rooms where slug='${ROOM_SLUG}' limit 1;")"

echo "Seeding ${#USERS[@]} users into '${ROOM_SLUG}' (${room_id:-no such room})…"
for u in "${USERS[@]}"; do
	IFS='|' read -r email name role <<<"$u"
	# Register: creates the user row, argon2 password hash, and password identity.
	# 409 (already registered) is expected on re-run — that's fine.
	code="$(curl -s -o /dev/null -w '%{http_code}' -X POST "$API/api/auth/register" \
		-H 'Content-Type: application/json' \
		-d "{\"email\":\"$email\",\"password\":\"$PASSWORD\",\"display_name\":\"$name\"}")"
	# Force the intended role + display name (register defaults new users to 'member').
	psql_q "update users set global_role='${role}'::user_role, display_name='${name}' where email='${email}';" >/dev/null
	# Add to the dev room with the matching role (idempotent).
	if [ -n "$room_id" ]; then
		psql_q "insert into room_members (room_id, user_id, role)
		        select '${room_id}', id, '${role}'::user_role from users where email='${email}'
		        on conflict (room_id, user_id) do update set role=excluded.role;" >/dev/null
	fi
	echo "  ✓ ${email} (${role}) — register HTTP ${code}"
done

echo ""
echo "Done. All seed users share password: ${PASSWORD}"
echo "Log in at the web /login page; a real session overrides AUTH_DEV_BYPASS."
psql_q "select email||'  '||global_role||'  ('||display_name||')' from users where email like '%@proroom.dev' order by global_role desc, email;" | sed 's/^/  /'
