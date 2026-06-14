-- Live polls: a room admin posts a poll with 2..10 options; members cast one
-- vote each (changeable while the poll is open). Closing freezes voting. The
-- UNIQUE(poll_id, user_id) on poll_votes enforces one-vote-per-user atomically
-- via ON CONFLICT, so votes never need a read-then-write.

CREATE TABLE IF NOT EXISTS polls (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id    uuid NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    author_id  uuid NOT NULL REFERENCES users (id),
    question   text NOT NULL,
    anonymous  boolean NOT NULL DEFAULT false,
    status     text NOT NULL DEFAULT 'open',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poll_options (
    id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id  uuid NOT NULL REFERENCES polls (id) ON DELETE CASCADE,
    label    text NOT NULL,
    position int NOT NULL
);

CREATE TABLE IF NOT EXISTS poll_votes (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id    uuid NOT NULL REFERENCES polls (id) ON DELETE CASCADE,
    option_id  uuid NOT NULL REFERENCES poll_options (id) ON DELETE CASCADE,
    user_id    uuid NOT NULL REFERENCES users (id),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (poll_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_poll_options_poll ON poll_options (poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON poll_votes (poll_id);
