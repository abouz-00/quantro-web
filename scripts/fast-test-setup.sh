#!/bin/bash

# Super Fast Test Database Setup Script
# Uses existing Prisma client and database structure for maximum speed

set -e

echo "⚡ Ultra-fast test database setup..."

# Set environment variables for test
export NODE_ENV=test
export DATABASE_URL="file:./test.db"

# Quick cleanup - no processes to kill, just files
rm -f ./test.db ./test.db-shm ./test.db-wal 2>/dev/null || true

# Create empty test database with correct schema structure
# Use SQLite to create tables from scratch - much faster than Prisma
echo "📋 Creating fast test database schema..."

sqlite3 ./test.db << 'EOF'
CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    emailVerified DATETIME,
    image TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Account (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    providerAccountId TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Session (
    id TEXT PRIMARY KEY,
    sessionToken TEXT UNIQUE NOT NULL,
    userId TEXT NOT NULL,
    expires DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS FoodEntry (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    calories REAL NOT NULL,
    protein REAL NOT NULL DEFAULT 0,
    carbs REAL NOT NULL DEFAULT 0,
    fat REAL NOT NULL DEFAULT 0,
    date DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    sortOrder INTEGER DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS Account_provider_providerAccountId_key ON Account(provider, providerAccountId);
CREATE UNIQUE INDEX IF NOT EXISTS Session_sessionToken_key ON Session(sessionToken);
CREATE INDEX IF NOT EXISTS FoodEntry_userId_date_idx ON FoodEntry(userId, date);
EOF

echo "✅ Ultra-fast test database ready!"
