CREATE TABLE group_event_members (
    user_id     INTEGER NOT NULL,
    event_id    INTEGER NOT NULL,
    group_id    INTEGER NOT NULL,
    status      INTEGER NOT NULL, -- 0-pending, 1-going, 2-not going
    PRIMARY KEY (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES group_events(id),
    FOREIGN KEY (group_id) REFERENCES groups(id)

);