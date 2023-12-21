CREATE TABLE chat_receipts_new (
    id INTEGER PRIMARY KEY,
    message_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    FOREIGN KEY (message_id) REFERENCES chat_messages(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id)
);

INSERT INTO chat_receipts_new (id, message_id, recipient_id)
SELECT id, message_id, recipient_id FROM chat_receipts;

DROP TABLE chat_receipts;

ALTER TABLE chat_receipts_new RENAME TO chat_receipts;

CREATE INDEX idx_chat_receipts_on_message_id ON chat_receipts (message_id);
CREATE INDEX idx_chat_receipts_on_recipient_id ON chat_receipts (recipient_id);