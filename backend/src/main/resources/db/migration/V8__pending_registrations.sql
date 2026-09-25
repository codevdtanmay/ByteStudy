CREATE TABLE pending_registrations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_pending_registration_token ON pending_registrations(token_hash);
CREATE INDEX idx_pending_registration_email ON pending_registrations(email);
