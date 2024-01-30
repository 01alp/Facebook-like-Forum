CREATE TABLE group_members (
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    invite_status INTEGER NOT NULL DEFAULT 0,
    -- 0-pending, 1-accepted
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (group_id) REFERENCES groups(id)
);
-- Insert dummy data into the group_members table
INSERT INTO group_members (user_id, group_id, invite_status)
VALUES (1, 1, 0),
    (2, 2, 0),
    (3, 3, 0),
    (1, 2, 0),
    (1, 3, 0);
-- user 1 is a member of group 1, 2 and 3
-- user 2 is a member of group 2 and 3
-- user 3 is a member of group 3