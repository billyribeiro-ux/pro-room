-- Chat messages gain a channel so the UI can separate on-topic trading chat
-- from off-topic banter. Constrained to the two known channels.
ALTER TABLE messages ADD COLUMN channel text NOT NULL DEFAULT 'main';
ALTER TABLE messages ADD CONSTRAINT messages_channel_check
    CHECK (channel IN ('main', 'off_topic'));
