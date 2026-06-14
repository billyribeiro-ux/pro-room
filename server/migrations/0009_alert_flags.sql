-- Post Alert option flags. The Post Alert modal lets the author also tweet the
-- alert (post_to_x) and/or suppress the push notification (no_push). These were
-- previously dropped on the floor; persist them so the intent is captured even
-- before X/push delivery is wired up. Nullable with a false default so existing
-- rows backfill cleanly and old clients (which omit the fields) keep working.
--
-- Forward-only, re-runnable (ADD COLUMN IF NOT EXISTS), no CONCURRENTLY.

ALTER TABLE alerts
    ADD COLUMN IF NOT EXISTS post_to_x boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS no_push   boolean DEFAULT false;
