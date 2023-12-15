CREATE TABLE users (
    id             INTEGER PRIMARY KEY,
    username       TEXT UNIQUE,
    first_name     TEXT NOT NULL,
    last_name      TEXT NOT NULL,
    email          TEXT NOT NULL UNIQUE,
    password       TEXT NOT NULL,
    about_me       TEXT,
    birth_date     TIMESTAMP NOT NULL,
    register_date  TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    avatar         TEXT,
    public         INTEGER NOT NULL DEFAULT 1 -- 1-public, 0-private
);

INSERT INTO users (username, first_name, last_name, email, password, about_me, birth_date, avatar)
VALUES ('user1', 'John', 'Doe', 'john.doe@example.com', '$2a$10$qHyYw63cHZoa.H5cLdZITuXxWa.xv029xfzuV1nsQayyMQf75EQli', 'I am user 1', '1990-01-01', '');

INSERT INTO users (username, first_name, last_name, email, password, about_me, birth_date, avatar)
VALUES ('user2', 'Jane', 'Smith', 'jane.smith@example.com', '$2a$10$qHyYw63cHZoa.H5cLdZITuXxWa.xv029xfzuV1nsQayyMQf75EQli', 'I am user 2', '1995-05-05', '');

INSERT INTO users (username, first_name, last_name, email, password, about_me, birth_date, avatar)
VALUES ('user3', 'Mike', 'Johnson', 'mike.johnson@example.com', '$2a$10$qHyYw63cHZoa.H5cLdZITuXxWa.xv029xfzuV1nsQayyMQf75EQli', 'I am user 3', '1985-08-10', '0');

INSERT INTO users (username, first_name, last_name, email, password, about_me, birth_date, avatar)
VALUES ('user4', 'Emily', 'Brown', 'emily.brown@example.com', '$2a$10$qHyYw63cHZoa.H5cLdZITuXxWa.xv029xfzuV1nsQayyMQf75EQli', 'I am user 4', '1992-12-15', '0');
