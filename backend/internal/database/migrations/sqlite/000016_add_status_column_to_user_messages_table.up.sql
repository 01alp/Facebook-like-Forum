-- For keeping track of pending/delivered status of msg (0-pending, 1-received)
ALTER TABLE user_messages ADD COLUMN status INTEGER NOT NULL DEFAULT 0;

CREATE INDEX idx_user_messages_on_status ON user_messages (status);