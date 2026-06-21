CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    character_name VARCHAR(100),
    location_name VARCHAR(100),
    theme VARCHAR(100),
    story TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);