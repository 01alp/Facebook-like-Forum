BEGIN TRANSACTION;

-- Create copy of table
CREATE TABLE user_messages_backup (
    id INTEGER PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id)
);

-- Copy the data from the original table to the new table
INSERT INTO user_messages_backup (id, sender_id, recipient_id, message, created_at)
SELECT id, sender_id, recipient_id, message, created_at FROM user_messages;

-- Drop the original table
DROP TABLE user_messages;

-- Rename the new table
ALTER TABLE user_messages_backup RENAME TO user_messages;

-- Re-create indexes
CREATE INDEX idx_user_messages_on_sender_id ON user_messages (sender_id);
CREATE INDEX idx_user_messages_on_recipient_id ON user_messages (recipient_id);
CREATE INDEX idx_user_messages_on_created_at ON user_messages (created_at);

COMMIT;