#!/bin/bash

# Optimized Test Database Setup Script
# This script sets up a local SQLite database for testing with better error handling

set -e

# Run pre-test cleanup first
./scripts/pre-test-cleanup.sh

echo "🗄️  Setting up test database..."

# Copy test environment configuration
if [ -f ".env.test" ]; then
    cp .env .env.backup.original 2>/dev/null || true
    cp .env.test .env
    echo "✅ Switched to test environment"
else
    echo "❌ .env.test file not found"
    exit 1
fi

# Set environment variables for test
export NODE_ENV=test
export DATABASE_URL="file:./test.db"

# Function to clean up on exit
cleanup() {
    echo "🧹 Cleaning up on exit..."
    # Restore original environment
    if [ -f ".env.backup.original" ]; then
        cp .env.backup.original .env
        rm -f .env.backup.original
        echo "✅ Restored original environment"
    fi
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
npx prisma generate --schema=./prisma/schema.test.prisma || {
    echo "❌ Prisma client generation failed"
    exit 1
}

# Push the test schema to create the database with timeout
echo "📦 Creating test database schema..."
npx prisma db push --schema=./prisma/schema.test.prisma --url="file:./test.db" --force-reset || {
    echo "❌ Database schema creation failed"
    exit 1
}

# Verify database was created
if [ ! -f "./test.db" ] && [ ! -f "./prisma/test.db" ]; then
    echo "❌ Test database was not created successfully"
    # Try to find where it was created
    echo "🔍 Searching for test database..."
    find . -name "test.db" -type f 2>/dev/null || echo "No test.db found"
    exit 1
fi

# Move database to expected location if needed
if [ -f "./prisma/test.db" ] && [ ! -f "./test.db" ]; then
    mv "./prisma/test.db" "./test.db"
    echo "📦 Moved database to correct location"
fi

echo "✅ Test database setup complete!"
echo "📍 Database location: ./test.db"
echo "🔗 Connection string: file:./test.db"
