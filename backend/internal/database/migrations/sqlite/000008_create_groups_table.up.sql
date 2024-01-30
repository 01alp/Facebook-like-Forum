CREATE TABLE groups (
    id INTEGER PRIMARY KEY,
    creator_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (creator_id) REFERENCES users(id)
);
-- BEGIN: dummy data for groups
INSERT INTO groups (creator_id, title, description, created_at)
VALUES (1, 'Group 1', 'This is group 1', datetime('now')),
    (2, 'Group 2', 'This is group 2', datetime('now')),
    (3, 'Group 3', 'This is group 3', datetime('now'));
-- END: dummy data for groups