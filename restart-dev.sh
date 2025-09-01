#!/bin/bash

echo "🧹 Cleaning build cache..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc
rm -rf .jest-cache
rm -f tsconfig.tsbuildinfo
rm -f .eslintcache

echo "🔪 Killing existing processes..."
# Kill any existing Next.js processes
pkill -f "next dev" 2>/dev/null || true
# Kill any processes on port 3000 (more comprehensive)
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
# Wait a moment for processes to fully terminate
sleep 2
# Double-check and force kill if anything is still running on port 3000
if lsof -ti:3000 >/dev/null 2>&1; then
    echo "🔴 Port 3000 still occupied, force killing..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "🚀 Starting development server on port 3000..."
npm run dev "🧹 Cleaning build cache..."
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
