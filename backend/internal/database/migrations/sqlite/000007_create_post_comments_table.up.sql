CREATE TABLE post_comments (
    id INTEGER PRIMARY KEY,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    image TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- BEGIN
INSERT INTO post_comments (post_id, user_id, message, image) VALUES (1, 1, 'Comment 1 for post 1', '0');
INSERT INTO post_comments (post_id, user_id, message, image) VALUES (1, 2, 'Comment 2 for post 1', '0');
INSERT INTO post_comments (post_id, user_id, message, image) VALUES (2, 3, 'Comment 1 for post 2', '0');
INSERT INTO post_comments (post_id, user_id, message, image) VALUES (2, 4, 'Comment 2 for post 2', '0');
INSERT INTO post_comments (post_id, user_id, message, image) VALUES (3, 1, 'Comment 1 for post 3', '0');
INSERT INTO post_comments (post_id, user_id, message, image) VALUES (3, 2, 'Comment 2 for post 3', '0');
INSERT INTO post_comments (post_id, user_id, message, image) VALUES (4, 3, 'Comment 1 for post 4', '0');
INSERT INTO post_comments (post_id, user_id, message, image) VALUES (4, 4, 'Comment 2 for post 4', '0');
INSERT INTO post_comments (post_id, user_id, message, image) VALUES (5, 1, 'Comment 1 for post 5', '0');
INSERT INTO post_comments (post_id, user_id, message, image) VALUES (5, 2, 'Comment 2 for post 5', '0');
INSERT INTO post_comments (post_id, user_id, message, image) VALUES (6, 3, 'Comment 1 for post 6', '0');
INSERT INTO post_comments (post_id, user_id, message, image) VALUES (6, 4, 'Comment 2 for post 6', '0');
-- END
