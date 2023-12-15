CREATE TABLE group_post_comments (
    id              INTEGER PRIMARY KEY,
    author_id       INTEGER NOT NULL,
    group_post_id   INTEGER NOT NULL,
    message         TEXT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (group_post_id) REFERENCES group_posts(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);