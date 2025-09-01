#!/bin/bash

# Clean Build Script
# This script cleans all build artifacts and caches to prevent module loading issues

echo "🧹 Cleaning build artifacts and caches..."

# Kill any running dev servers on port 3000
echo "🔥 Killing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No processes found on port 3000"

# Remove Next.js build directory
echo "🗑️  Removing .next directory..."
rm -rf .next

# Remove node_modules cache
echo "🗑️  Removing node_modules/.cache..."
rm -rf node_modules/.cache

# Remove TypeScript build info
echo "🗑️  Removing TypeScript build info..."
rm -f tsconfig.tsbuildinfo

# Remove any Jest cache
echo "🗑️  Removing Jest cache..."
rm -rf .jest-cache
rm -rf node_modules/.cache/jest

# Remove SWC cache
echo "🗑️  Removing SWC cache..."
rm -rf .swc

# Remove any ESLint cache
echo "🗑️  Removing ESLint cache..."
rm -f .eslintcache

# Remove any Prettier cache
echo "🗑️  Removing Prettier cache..."
rm -rf node_modules/.cache/prettier

# Remove any other potential cache directories
echo "🗑️  Removing other cache directories..."
rm -rf .cache
rm -rf .turbo
rm -rf .parcel-cache

echo "✅ Build cleanup complete!"
echo "💡 You can now run 'npm run dev' or 'npm run build'"
