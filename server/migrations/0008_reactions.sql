-- Emoji reactions on chat messages and trade alerts. A reaction is owned by a
-- room and targets either a message or an alert (target_kind + target_id). Each
-- (target, user, emoji) tuple is unique, so adding the same reaction twice is a
-- no-op via ON CONFLICT and "toggling" is a delete of that exact row — no
-- read-then-write is needed to keep counts honest.
--
-- target_id is an untyped uuid (not an FK) because it points at one of two
-- tables depending on target_kind; the handler validates that the target exists
-- in the room before inserting. ON DELETE CASCADE on room_id reaps reactions
-- when a room is deleted.

CREATE TABLE IF NOT EXISTS message_reactions (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id     uuid NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    target_kind text NOT NULL CHECK (target_kind IN ('message', 'alert')),
    target_id   uuid NOT NULL,
    user_id     uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    emoji       text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (target_kind, target_id, user_id, emoji)
);

-- Aggregating reactions for one target (the common read + every broadcast)
-- filters on (target_kind, target_id); this index serves both that and the
-- UNIQUE-backed upsert lookups.
CREATE INDEX IF NOT EXISTS idx_message_reactions_target
    ON message_reactions (target_kind, target_id);
