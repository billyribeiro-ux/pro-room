-- Indexes on foreign-key columns that lacked one. Postgres does NOT auto-index
-- the referencing side of a foreign key, so a DELETE that cascades or restricts
-- through these columns — and ordinary lookups by them — sequentially scans the
-- child table. Each statement is additive and idempotent (IF NOT EXISTS), changes
-- no data, and is safe to apply online.

-- Columns referencing users(id): every user delete checks each of these.
CREATE INDEX IF NOT EXISTS idx_messages_author       ON messages (author_id);
CREATE INDEX IF NOT EXISTS idx_alerts_author         ON alerts (author_id);
CREATE INDEX IF NOT EXISTS idx_questions_author      ON questions (author_id);
CREATE INDEX IF NOT EXISTS idx_questions_answered_by ON questions (answered_by);
CREATE INDEX IF NOT EXISTS idx_polls_author          ON polls (author_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user       ON poll_votes (user_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user     ON room_members (user_id);
CREATE INDEX IF NOT EXISTS idx_rooms_owner           ON rooms (owner_id);

-- polls.room_id references rooms(id) ON DELETE CASCADE but had no index, so a
-- room delete (and the per-room active-poll listing) scanned all polls.
CREATE INDEX IF NOT EXISTS idx_polls_room            ON polls (room_id);

-- Channel-filtered chat history: idx_messages_room_created omits `channel`, so the
-- main/off_topic split filtered a (room_id, created_at) scan. This composite
-- serves the (room_id, channel) + newest-first access pattern directly.
CREATE INDEX IF NOT EXISTS idx_messages_room_channel_created
    ON messages (room_id, channel, created_at DESC);
