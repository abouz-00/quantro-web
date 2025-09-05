#!/bin/bash

# Docker Test Database Setup Script
# Sets up PostgreSQL database for Docker testing

set -e

echo "🐳 Docker test database setup..."

# Set environment variables for test
export NODE_ENV=test
export DATABASE_URL="postgresql://test_user:test_pass@postgres-test:5432/quantro_test"

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres-test -p 5432 -U test_user; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "✅ PostgreSQL is ready!"

# Generate Prisma client and push schema
echo "🔄 Setting up database schema..."
npx prisma generate
npx prisma db push --force-reset

echo "✅ Docker test database ready!"
