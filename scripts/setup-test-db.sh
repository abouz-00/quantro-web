#!/bin/bash

# Test Database Setup Script
# This script sets up a local SQLite database for testing

set -e

echo "🗄️  Setting up test database..."

# Set environment variables for test
export NODE_ENV=test
export DATABASE_URL="file:./test.db"

# Clean up any existing test database
echo "🧹 Cleaning up existing test database..."
rm -f ./test.db
rm -f ./prisma/test.db

# Kill any existing processes that might lock the database
pkill -f "test.db" || true
sleep 1

# Generate Prisma client for test schema
echo "⚙️  Generating Prisma test client..."
timeout 60 npx prisma generate --schema=./prisma/schema.test.prisma

# Push the test schema to create the database
echo "📦 Creating test database schema..."
timeout 60 npx prisma db push --schema=./prisma/schema.test.prisma --force-reset

echo "✅ Test database setup complete!"
echo "📍 Database location: ./test.db"
echo "🔗 Connection string: file:./test.db"
