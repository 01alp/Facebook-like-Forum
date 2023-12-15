CREATE TABLE posts (
    id          INTEGER PRIMARY KEY,
    author_id   INTEGER NOT NULL,
    message     TEXT NOT NULL,
    image       TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    privacy     INTEGER NOT NULL DEFAULT 0, -- 0-public, 1-private, 2-almost private
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- BEGIN: Insert dummy posts
INSERT INTO posts (author_id, message, image, created_at, privacy)
VALUES (1, 'Hello world! postId=1 userId=1', '0', '2021-11-30T19:08:00Z', 0);

INSERT INTO posts (author_id, message, image, created_at, privacy)
VALUES (1, 'This is a test post postId=2 userId=1', '0', '2022-11-30T17:08:00Z', 2);

INSERT INTO posts (author_id, message, image, created_at, privacy)
VALUES (3, 'Another test post postId=3 userId=3', '0', '2022-12-01T10:30:00Z', 0);

INSERT INTO posts (author_id, message, image, created_at, privacy)
VALUES (2, 'Testing post postId=4 userId=2', '0', '2022-12-02T15:45:00Z', 1);

INSERT INTO posts (author_id, message, image, created_at, privacy)
VALUES (4, 'New post postId=5 userId=4', '0', '2022-12-03T01:00:00Z', 2);

INSERT INTO posts (author_id, message, image, created_at, privacy)
VALUES (2, 'This is a test post postId=6 userId=2', '0', '2023-11-30T20:08:25Z', 1);

-- END: Insert dummy posts

