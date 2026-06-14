-- Room lock toggle for admin moderation. When a room is locked, non-admin users
-- are blocked from (re)joining — the WebSocket connect path rejects them — while
-- admins and super admins are always allowed in. Distinct from `is_live` (which
-- gates posting/broadcasting): a room can be idle-and-locked or live-and-locked.
--
-- Nullable is unnecessary here: a boolean with a false default backfills every
-- existing row to "unlocked", and old clients never send the column.
--
-- Forward-only, re-runnable (ADD COLUMN IF NOT EXISTS), no CONCURRENTLY.

ALTER TABLE rooms
    ADD COLUMN IF NOT EXISTS locked boolean NOT NULL DEFAULT false;
