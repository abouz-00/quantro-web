#!/bin/bash

# Optimized Test Database Setup Script
# This script sets up a local SQLite database for testing with better error handling

set -e

# Run pre-test cleanup first
./scripts/pre-test-cleanup.sh

echo "🗄️  Setting up test database..."

# Set environment variables for test
export NODE_ENV=test
export DATABASE_URL="file:./test.db"

# Function to clean up on exit
cleanup() {
    echo "🧹 Cleaning up on exit..."
    # Remove any temporary files
    rm -f ./test.db.tmp 2>/dev/null || true
}

# Set up trap for cleanup
trap cleanup EXIT

# Clean up any existing test database more safely
echo "🧹 Cleaning up existing test database..."
if [ -f "./test.db" ]; then
    rm -f ./test.db
fi
if [ -f "./prisma/test.db" ]; then
    rm -f ./prisma/test.db
fi

# Kill any existing processes that might lock the database (safer approach)
if pgrep -f "test.db" > /dev/null 2>&1; then
    echo "⚠️  Stopping processes using test.db..."
    pkill -f "test.db" || true
    sleep 2
fi

# Check if Prisma is available
if ! command -v npx > /dev/null 2>&1; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

# Generate Prisma client for test schema with timeout
echo "⚙️  Generating Prisma test client..."
timeout 60s npx prisma generate --schema=./prisma/schema.test.prisma || {
    echo "❌ Prisma client generation failed or timed out"
    exit 1
}

# Push the test schema to create the database with timeout
echo "📦 Creating test database schema..."
timeout 60s npx prisma db push --schema=./prisma/schema.test.prisma --force-reset --skip-generate || {
    echo "❌ Database schema creation failed or timed out"
    exit 1
}

# Verify database was created
if [ ! -f "./test.db" ]; then
    echo "❌ Test database was not created successfully"
    exit 1
fi

echo "✅ Test database setup complete!"
echo "📍 Database location: ./test.db"
echo "🔗 Connection string: file:./test.db"
