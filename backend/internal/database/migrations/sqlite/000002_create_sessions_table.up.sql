CREATE TABLE sessions (
    session_token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_sessions_expires_at ON sessions (expires_at);