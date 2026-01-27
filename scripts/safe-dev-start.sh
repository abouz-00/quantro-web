#!/bin/bash

# Safe Dev Start Script
# This script ensures a clean development environment before starting

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DEV_LOCK_FILE="$PROJECT_DIR/.dev-server.lock"

echo "🚀 Starting development server safely..."

# Check if dev server is already running with our lock
if [ -f "$DEV_LOCK_FILE" ]; then
    LOCK_PID=$(cat "$DEV_LOCK_FILE")
    if ps -p "$LOCK_PID" > /dev/null 2>&1; then
        echo "✅ Dev server is already running (PID: $LOCK_PID)"
        echo "   Use 'npm run dev:stop' to stop it, or 'npm run dev:restart' to restart"
        exit 0
    else
        echo "🧹 Stale lock file found, cleaning up..."
        rm -f "$DEV_LOCK_FILE"
    fi
fi

# Clean without killing dev server
./scripts/clean-build.sh

# Wait a moment for cleanup to complete
sleep 1

# Ensure port 3000 is available
echo "🔍 Checking port 3000 availability..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
    echo "⚠️  Port 3000 is in use, killing processes..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Reinstall dependencies if node_modules seems corrupted
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client if needed
echo "🔄 Generating Prisma client..."
npx prisma generate

# Create lock file and set up cleanup trap
echo $$ > "$DEV_LOCK_FILE"
trap "rm -f '$DEV_LOCK_FILE'" EXIT INT TERM

# Start development server
echo "🎯 Starting Next.js development server..."
npm run dev
