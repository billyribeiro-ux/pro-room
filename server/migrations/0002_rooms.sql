-- Rooms, memberships (carrying per-room role + ABAC attributes), and the
-- room-scoped content: alerts and chat messages. Plus an immutable audit log.

CREATE TYPE room_visibility AS ENUM ('public', 'private');

CREATE TABLE rooms (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug       text NOT NULL UNIQUE,
    name       text NOT NULL,
    owner_id   uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    visibility room_visibility NOT NULL DEFAULT 'private',
    -- Live broadcasting toggle; gates alert posting and screen publishing.
    is_live    boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE room_members (
    room_id    uuid NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    user_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role       user_role NOT NULL DEFAULT 'member',
    -- Free-form ABAC subject attributes evaluated by the authz engine.
    attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
    joined_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (room_id, user_id)
);

CREATE TABLE alerts (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id    uuid NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    author_id  uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    symbol     text NOT NULL,
    side       text NOT NULL,
    note       text,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_alerts_room_created ON alerts (room_id, created_at DESC);

CREATE TABLE messages (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id    uuid NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    author_id  uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    body       text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_room_created ON messages (room_id, created_at DESC);

-- Every authorization decision on a sensitive action is recorded here.
CREATE TABLE audit_log (
    id         bigserial PRIMARY KEY,
    actor_id   uuid,
    action     text NOT NULL,
    resource   text NOT NULL,
    decision   text NOT NULL,
    reason     text,
    context    jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_actor ON audit_log (actor_id, created_at DESC);
