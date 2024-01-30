CREATE TABLE event_receipts (
    id INTEGER PRIMARY KEY,
    event_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    FOREIGN KEY (event_id) REFERENCES group_events(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id)
);