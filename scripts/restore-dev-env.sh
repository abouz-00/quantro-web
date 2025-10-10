#!/bin/bash

# Restore Development Environment Script
# Use this if tests left .env in the wrong state

echo "🔄 Restoring development environment..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found"
    exit 1
fi

# Restore .env from .env.local
cp .env.local .env
echo "✅ Restored .env from .env.local"

# Verify DATABASE_URL
DB_URL=$(grep "DATABASE_URL" .env | cut -d '=' -f 2 | tr -d '"')
echo "📍 DATABASE_URL: $DB_URL"

if [[ "$DB_URL" != *"prisma/dev.db"* ]]; then
    echo "⚠️  Warning: DATABASE_URL might not be correct"
    echo "   Expected: file:./prisma/dev.db"
    echo "   Got: $DB_URL"
fi

# Regenerate Prisma client
echo "🔄 Regenerating Prisma client..."
npx prisma generate

# Kill any process on port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
    echo "⚠️  Port 3000 is in use, killing processes..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 2
fi

echo "✅ Development environment restored!"
echo "💡 Run 'npm run dev' to start the server"
