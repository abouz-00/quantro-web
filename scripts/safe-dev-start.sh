#!/bin/bash

# Safe Dev Start Script
# This script ensures a clean development environment before starting

echo "🚀 Starting development server safely..."

# First, clean any potential issues
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

# Start development server
echo "🎯 Starting Next.js development server..."
npm run dev
