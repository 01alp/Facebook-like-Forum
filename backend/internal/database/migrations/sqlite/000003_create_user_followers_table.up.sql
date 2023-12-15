CREATE TABLE user_followers (
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    status INTEGER NOT NULL, -- 0-pending, 1-accepted, 2-declined
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (following_id) REFERENCES users(id)
);