#!/bin/bash

# Database Environment Switcher
# Usage: ./scripts/switch-db.sh [local|production|test]

set -e

DB_MODE=${1:-local}

case $DB_MODE in
  "local")
    echo "🔄 Switching to local SQLite database..."
    export DATABASE_URL="file:./prisma/dev.db"
    echo "📍 Using: file:./prisma/dev.db"
    echo "📋 Using SQLite schema (prisma/schema.prisma)"
    npx prisma db push
    npx prisma generate
    echo "✅ Switched to local development database"
    ;;
  
  "test")
    echo "🔄 Switching to test SQLite database..."
    export DATABASE_URL="file:./test.db"
    echo "📍 Using: file:./test.db"
    echo "📋 Using test schema (prisma/schema.test.prisma)"
    ./scripts/setup-test-db.sh
    echo "✅ Switched to test database"
    ;;
  
  "production")
    echo "🔄 Switching to production PostgreSQL database..."
    echo "⚠️  Make sure your .env.local has the correct PostgreSQL DATABASE_URL"
    echo "📍 Using: PostgreSQL (from .env.local)"
    echo "📋 Using PostgreSQL schema (prisma/schema.production.prisma)"
    
    # Copy production schema to main schema temporarily
    cp prisma/schema.production.prisma prisma/schema.prisma.backup
    cp prisma/schema.production.prisma prisma/schema.prisma
    
    npx prisma db push
    npx prisma generate
    
    echo "✅ Switched to production database"
    echo "⚠️  Remember to switch back to local when done: ./scripts/switch-db.sh local"
    ;;
  
  *)
    echo "❌ Invalid database mode: $DB_MODE"
    echo "Usage: $0 [local|production|test]"
    exit 1
    ;;
esac
