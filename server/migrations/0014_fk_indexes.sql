-- Indexes on foreign-key columns that lacked one.
--
-- Postgres does NOT auto-index the *referencing* (child) side of a foreign key.
-- Without an index whose LEADING column is the FK column, every DELETE on the
-- parent must sequentially scan the child to enforce the ON DELETE action
-- (CASCADE / RESTRICT / SET NULL) — and RESTRICT/NO-ACTION columns are scanned on
-- *every* delete attempt. Several of these columns are also frequent read/join
-- predicates (noted inline). Each statement is additive, idempotent
-- (IF NOT EXISTS), changes no data, and is safe to apply online.
--
-- Coverage was derived by auditing every `REFERENCES` in migrations 0001-0013
-- against every existing index/PK/UNIQUE leading column. Only `branding.updated_by`
-- is intentionally omitted: that table is a single boolean-PK row, so an index is
-- meaningless.

-- ── Columns referencing users(id): scanned on every user delete ──────────────
CREATE INDEX IF NOT EXISTS idx_messages_author          ON messages (author_id);          -- CASCADE
CREATE INDEX IF NOT EXISTS idx_alerts_author            ON alerts (author_id);             -- RESTRICT
CREATE INDEX IF NOT EXISTS idx_notes_created_by         ON notes (created_by);             -- SET NULL
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by        ON files (uploaded_by);            -- SET NULL
CREATE INDEX IF NOT EXISTS idx_questions_author         ON questions (author_id);          -- RESTRICT
CREATE INDEX IF NOT EXISTS idx_questions_answered_by    ON questions (answered_by);        -- SET NULL
CREATE INDEX IF NOT EXISTS idx_polls_author             ON polls (author_id);              -- NO ACTION
CREATE INDEX IF NOT EXISTS idx_poll_votes_user          ON poll_votes (user_id);           -- NO ACTION (UNIQUE leads poll_id)
CREATE INDEX IF NOT EXISTS idx_message_reactions_user   ON message_reactions (user_id);    -- CASCADE (UNIQUE leads target_kind)
CREATE INDEX IF NOT EXISTS idx_pm_sender                ON private_messages (sender_id);   -- CASCADE
CREATE INDEX IF NOT EXISTS idx_pm_recipient_fk          ON private_messages (recipient_id);-- CASCADE (idx_pm_recipient leads room_id)
CREATE INDEX IF NOT EXISTS idx_badges_created_by        ON badges (created_by);            -- SET NULL
CREATE INDEX IF NOT EXISTS idx_user_badges_assigned_by  ON user_badges (assigned_by);      -- SET NULL
-- room_members.user_id: CASCADE on user delete AND a hot read predicate — the
-- room-list visibility check (rooms.rs: EXISTS room_members WHERE user_id = $1).
-- The PK (room_id, user_id) cannot serve a user_id-only lookup.
CREATE INDEX IF NOT EXISTS idx_room_members_user        ON room_members (user_id);
-- rooms.owner_id: RESTRICT on user delete AND a hot read predicate (room-list
-- WHERE owner_id = $1).
CREATE INDEX IF NOT EXISTS idx_rooms_owner              ON rooms (owner_id);

-- ── Columns referencing rooms(id) / badges(id) without an index ──────────────
-- polls.room_id: CASCADE on room delete AND the active-poll listing predicate
-- (db/polls.rs list_active: WHERE p.room_id = $1 AND status = 'open').
CREATE INDEX IF NOT EXISTS idx_polls_room               ON polls (room_id);
-- user_badges.badge_id: CASCADE on badge delete (PK leads user_id, not badge_id).
CREATE INDEX IF NOT EXISTS idx_user_badges_badge        ON user_badges (badge_id);

-- ── Read-path composite ──────────────────────────────────────────────────────
-- Channel-filtered chat history: idx_messages_room_created omits `channel`, so the
-- main/off_topic split (messages.rs: WHERE m.room_id = $1 AND m.channel = $2,
-- newest-first) filtered a (room_id, created_at) scan. This serves it directly.
CREATE INDEX IF NOT EXISTS idx_messages_room_channel_created
    ON messages (room_id, channel, created_at DESC);
