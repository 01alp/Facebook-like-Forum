CREATE TABLE chat_messages_new (
    id INTEGER PRIMARY KEY,
    group_chat INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    user_recipient_id INTEGER NOT NULL DEFAULT 0, --Added default value
    group_id INTEGER NOT NULL DEFAULT 0, --Added default value
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (user_recipient_id) REFERENCES users(id),
    FOREIGN KEY (group_id) REFERENCES groups(id)
);

INSERT INTO chat_messages_new (id, group_chat, sender_id, user_recipient_id, group_id, message, created_at)
SELECT 
    id, 
    group_chat, 
    sender_id, 
    COALESCE(user_recipient_id, 0), -- Converting NULL to 0
    COALESCE(group_id, 0), -- Converting NULL to 0
    message, 
    created_at 
FROM chat_messages;

DROP TABLE chat_messages;

ALTER TABLE chat_messages_new RENAME TO chat_messages;

CREATE INDEX idx_chat_messages_on_sender_id ON chat_messages (sender_id);
CREATE INDEX idx_chat_messages_on_user_recipient_id ON chat_messages (user_recipient_id);
CREATE INDEX idx_chat_messages_on_group_id ON chat_messages (group_id);
CREATE INDEX idx_chat_messages_on_created_at ON chat_messages (created_at);
