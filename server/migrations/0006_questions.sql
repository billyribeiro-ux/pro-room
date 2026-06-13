-- Alert Q&A: threaded questions attached to a trade alert. A member posts a
-- question; an admin (alert poster / room manager) answers and resolves it.
-- Scoped to both the alert and its room so reads can filter by either.

CREATE TABLE IF NOT EXISTS questions (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id    uuid NOT NULL REFERENCES alerts (id) ON DELETE CASCADE,
    room_id     uuid NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    author_id   uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    body        text NOT NULL,
    answer      text,
    answered_by uuid REFERENCES users (id) ON DELETE SET NULL,
    resolved    boolean NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now(),
    answered_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_questions_alert ON questions (alert_id);
CREATE INDEX IF NOT EXISTS idx_questions_room ON questions (room_id);
