#!/bin/bash

# CI-Optimized Test Database Setup Script
# Designed for CI environments with strict timeouts

set -e

echo "🏗️  CI test database setup..."

# Set environment variables for test
export NODE_ENV=test
export DATABASE_URL="file:./test.db"

# Clean up any existing test database
rm -f ./test.db ./test.db-shm ./test.db-wal 2>/dev/null || true

# For CI, create the database schema directly without Prisma overhead
echo "📋 Creating test database schema (CI mode)..."

# Use SQLite to create tables - fastest approach for CI
sqlite3 ./test.db << 'EOF'
CREATE TABLE User (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    emailVerified DATETIME,
    image TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Account (
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

CREATE TABLE Session (
    id TEXT PRIMARY KEY,
    sessionToken TEXT UNIQUE NOT NULL,
    userId TEXT NOT NULL,
    expires DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE FoodEntry (
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

CREATE UNIQUE INDEX Account_provider_providerAccountId_key ON Account(provider, providerAccountId);
CREATE UNIQUE INDEX Session_sessionToken_key ON Session(sessionToken);
CREATE INDEX FoodEntry_userId_date_idx ON FoodEntry(userId, date);
EOF

echo "✅ CI test database ready!"
