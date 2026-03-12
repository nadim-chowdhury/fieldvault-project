-- FieldVault — PostgreSQL Init Script
-- This runs automatically when the Docker container starts for the first time.
-- TypeORM migrations handle actual schema creation. This file only sets up
-- extensions and database-level defaults needed before migrations run.

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable case-insensitive text (for email matching, etc.)
CREATE EXTENSION IF NOT EXISTS "citext";
