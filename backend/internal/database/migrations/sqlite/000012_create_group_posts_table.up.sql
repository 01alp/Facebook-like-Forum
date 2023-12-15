CREATE TABLE group_posts (
    id          INTEGER PRIMARY KEY,
    author_id   INTEGER NOT NULL,
    group_id    INTEGER NOT NULL,
    message     TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (group_id) REFERENCES groups(id)
);