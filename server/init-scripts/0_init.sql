CREATE TABLE clients (
    id VARCHAR(36) PRIMARY KEY
);

-- CREATE TABLE tokens (
--     id VARCHAR(36) PRIMARY KEY NOT NULL,
--     client_id VARCHAR(36) NOT NULL,
--     token VARCHAR(255) NOT NULL,
--     FOREIGN KEY (client_id) REFERENCES clients(id)
-- );
