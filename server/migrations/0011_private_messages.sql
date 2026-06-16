-- One-to-one private messages within a room. Unlike `messages` (room-wide chat),
-- a private message is addressed from one user to exactly one other user and is
-- delivered only to those two participants over the realtime layer — never fanned
-- out to the whole room. The DB is the source of truth for the thread history; the
-- privacy boundary on the live path is enforced in the application (per-user WS
-- channel), not by this table.
--
-- `pm_not_self` mirrors the handler's 400 on a self-addressed message, so the
-- invariant holds even if a caller bypasses the handler.

CREATE TABLE IF NOT EXISTS private_messages (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id      uuid NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    sender_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    recipient_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    body         text NOT NULL,
    created_at   timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pm_not_self CHECK (sender_id <> recipient_id)
);

-- Thread lookup between two specific users (either direction) within a room.
-- LEAST/GREATEST normalize the unordered pair so the same (a,b) and (b,a)
-- conversation shares one index path, newest-first.
CREATE INDEX IF NOT EXISTS idx_pm_thread
    ON private_messages (
        room_id,
        LEAST(sender_id, recipient_id),
        GREATEST(sender_id, recipient_id),
        created_at DESC
    );

-- Inbox lookup: every PM addressed to a given recipient in a room, newest-first.
-- Serves the per-user inbox summary and the admin "all PMs for a peer" read.
CREATE INDEX IF NOT EXISTS idx_pm_recipient
    ON private_messages (room_id, recipient_id, created_at DESC);
