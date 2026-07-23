-- Per-author message colors (P1-1 · IMPLEMENTATION-PLAN.md).
--
-- Evidence (live DOM pastes, IMPLEMENTATION-PLAN.md P1-1): message rows carry an
-- inline `background-color` (e.g. LornaBot rgb(215,215,215), JC/Sam rgb(232,232,232))
-- and a body/name-block inline `color` (LornaBot rgb(0,128,64), JC rgb(26,26,26)),
-- while authors WITHOUT custom colors emit NO inline styles and fall back to the
-- stylesheet defaults. These two nullable columns hold that per-author choice; NULL
-- means "no custom color → stylesheet default" (the current behavior, unchanged).
--
-- Values are validated server-side as ^#[0-9a-fA-F]{6}$ before write, so the
-- database only ever stores a lowercased-or-not '#rrggbb' string or NULL.
-- Forward-only + idempotent (IF NOT EXISTS).

ALTER TABLE users ADD COLUMN IF NOT EXISTS msg_bg_color   text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS msg_text_color text;
