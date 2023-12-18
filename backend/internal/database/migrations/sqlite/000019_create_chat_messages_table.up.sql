CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY,
    group_chat INTEGER NOT NULL, -- 0-private chat, 1-group chat
    sender_id INTEGER NOT NULL,
    user_recipient_id INTEGER, -- for private chat
    group_id INTEGER, -- for group chat
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (user_recipient_id) REFERENCES users(id),
    FOREIGN KEY (group_id) REFERENCES groups(id)
);

CREATE INDEX idx_chat_messages_on_sender_id ON chat_messages (sender_id);
CREATE INDEX idx_chat_messages_on_user_recipient_id ON chat_messages (user_recipient_id);
CREATE INDEX idx_chat_messages_on_group_id ON chat_messages (group_id);
CREATE INDEX idx_chat_messages_on_created_at ON chat_messages (created_at);
