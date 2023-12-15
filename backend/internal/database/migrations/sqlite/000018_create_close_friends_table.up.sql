CREATE TABLE close_friends (
    source_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    PRIMARY KEY (source_id, friend_id),
    FOREIGN KEY (source_id) REFERENCES users(id),
    FOREIGN KEY (friend_id) REFERENCES users(id)
);