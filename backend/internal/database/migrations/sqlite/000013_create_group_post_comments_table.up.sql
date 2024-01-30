CREATE TABLE group_post_comments (
    id INTEGER PRIMARY KEY,
    author_id INTEGER NOT NULL,
    group_post_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (group_post_id) REFERENCES group_posts(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);
-- Insert dummy comments
INSERT INTO group_post_comments (author_id, group_post_id, message)
VALUES (1, 1, 'Group post 1 comment 1'),
    (2, 2, 'Group post 2 comment 2'),
    (3, 3, 'Group post 3 comment 1'),
    (4, 4, 'Group post 4 comment 2'),
    (1, 5, 'Group post 5 comment 1'),
    (2, 6, 'Group post 6 comment 2');