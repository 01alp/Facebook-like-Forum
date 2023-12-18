CREATE TABLE chat_receipts (
    id INTEGER PRIMARY KEY,
    group_chat INTEGER NOT NULL,
    message_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    FOREIGN KEY (message_id) REFERENCES chat_messages(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id)
);

CREATE INDEX idx_chat_receipts_on_message_id ON chat_receipts (message_id);
CREATE INDEX idx_chat_receipts_on_recipient_id ON chat_receipts (recipient_id);