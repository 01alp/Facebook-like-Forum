CREATE TABLE group_messages (
    id                  INTEGER PRIMARY KEY,
    sender_id           INTEGER NOT NULL,
    group_id            INTEGER NOT NULL,
    message             TEXT NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (group_id) REFERENCES groups(id)
);