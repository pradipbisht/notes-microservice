-- initialize the database

-- CREATE TABLE IF NOT EXISTS users (
--     id SERIAL PRIMARY KEY,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

CREATE DATABASE notesverb_notes;
CREATE DATABASE notesverb_users;
CREATE DATABASE notesverb_notes;
CREATE DATABASE notesverb_tags;
CREATE DATABASE notesverb_test;

GRANT ALL PRIVILEGES ON DATABASE notesverb_auth TO notesverb;
GRANT ALL PRIVILEGES ON DATABASE notesverb_notes TO notesverb;
GRANT ALL PRIVILEGES ON DATABASE notesverb_tags TO notesverb;
GRANT ALL PRIVILEGES ON DATABASE notesverb_users TO notesverb;
GRANT ALL PRIVILEGES ON DATABASE notesverb_test TO notesverb;