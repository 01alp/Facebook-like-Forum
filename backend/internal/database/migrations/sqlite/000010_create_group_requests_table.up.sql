CREATE TABLE group_requests (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    request_status INTEGER NOT NULL DEFAULT 0,
    -- 0-pending, 1-accepted, 2-declined (TODO: Decide behaviour here. If accepted, can remove request, but notify user? If declined, can request again or not?)
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (group_id) REFERENCES groups(id)
);
-- Insert dummy data into the group_requests table
INSERT INTO group_requests (user_id, group_id, request_status)
VALUES (1, 1, 1),
    (2, 2, 1),
    (3, 3, 1),
    (1, 2, 1),
    (1, 3, 1);