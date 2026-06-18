-- User rank/role badges (the reference's per-user badge system). A `badges` row
-- is an admin-defined badge in the registry; `user_badges` assigns badges to
-- users. A message/alert view resolves the author's assigned badges plus the
-- derived trial/new/tenure indicators (the reference's isFT / isNew / years).
CREATE TABLE badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Stable identifier for the badge (admin-chosen, unique).
    slug text NOT NULL UNIQUE,
    -- Short label shown in the text-pill variant (and as the img alt/title).
    label text NOT NULL,
    -- Optional image badge; when set the client renders <img> instead of the pill.
    image_url text,
    -- Pill colours (the reference stores a bg + text colour per badge). Defaults
    -- use our theme accent so a text badge is on-brand out of the box.
    bg_color text NOT NULL DEFAULT '#45a2ff',
    text_color text NOT NULL DEFAULT '#ffffff',
    -- Display order (lower first), mirroring the reference's ordered badge list.
    position int NOT NULL DEFAULT 0,
    created_by uuid REFERENCES users (id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Many-to-many badge assignment. ON DELETE CASCADE so removing a badge or user
-- cleans up the assignments.
CREATE TABLE user_badges (
    user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    badge_id uuid NOT NULL REFERENCES badges (id) ON DELETE CASCADE,
    assigned_by uuid REFERENCES users (id) ON DELETE SET NULL,
    assigned_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges (user_id);

-- Free-trial flag (the reference's isFT → the red "Trial" badge). Admin-settable;
-- `is_new` and `years` are DERIVED from users.created_at at query time (no column).
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_trial boolean NOT NULL DEFAULT false;
