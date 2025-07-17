#!/bin/bash

echo "🧹 Cleaning build cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "� Killing existing processes..."
# Kill any existing Next.js processes
pkill -f "next dev" 2>/dev/null || true
# Kill any processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo "�🔄 Generating Prisma client..."
npx prisma generate

echo "🚀 Starting development server..."
npm run dev
