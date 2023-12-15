CREATE TABLE group_events (
    id          INTEGER PRIMARY KEY,
    group_id    INTEGER NOT NULL,
    creator_id  INTEGER NOT NULL,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date  TIMESTAMP NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (creator_id) REFERENCES users(id)
);