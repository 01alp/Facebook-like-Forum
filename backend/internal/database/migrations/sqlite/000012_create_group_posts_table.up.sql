CREATE TABLE group_posts (
    id INTEGER PRIMARY KEY,
    author_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (group_id) REFERENCES groups(id)
);
INSERT INTO group_posts (author_id, group_id, message, created_at)
VALUES (1, 1, 'Group 1 test post 1', datetime('now')),
    (2, 1, 'Group 1 test post 2', datetime('now')),
    (3, 2, 'Group 2 test post 1', datetime('now')),
    (4, 2, 'Group 2 test post 2', datetime('now')),
    (1, 3, 'Group 3 test post 1', datetime('now')),
    (2, 3, 'Group 3 test post 2', datetime('now'));