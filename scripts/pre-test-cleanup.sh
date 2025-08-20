#!/bin/bash

# Pre-test cleanup script to ensure clean test environment
echo "🧹 Pre-test cleanup..."

# Kill any hanging Jest processes
pkill -f "jest" || true

# Kill any hanging Prisma processes
pkill -f "prisma" || true

# Remove any test database locks
rm -f ./test.db-shm ./test.db-wal || true

# Clean Jest cache
rm -rf ./.jest-cache || true

# Clean any temporary files
rm -f ./test.db.tmp || true

echo "✅ Pre-test cleanup complete"
