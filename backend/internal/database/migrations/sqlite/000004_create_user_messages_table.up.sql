CREATE TABLE user_messages (
    id INTEGER PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id)
);

CREATE INDEX idx_user_messages_on_sender_id ON user_messages (sender_id);
CREATE INDEX idx_user_messages_on_recipient_id ON user_messages (recipient_id);
CREATE INDEX idx_user_messages_on_created_at ON user_messages (created_at);
