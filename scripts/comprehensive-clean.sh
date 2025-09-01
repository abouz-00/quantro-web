#!/bin/bash

# Comprehensive Cache Cleaner
# This script cleans all possible cache directories that can cause build issues

echo "🧹 Comprehensive Cache Cleaner"
echo "=============================="

# Function to safely remove directories
safe_remove() {
    local path="$1"
    if [ -e "$path" ]; then
        echo "🗑️  Removing $path..."
        rm -rf "$path"
    else
        echo "ℹ️  $path not found, skipping..."
    fi
}

# Kill any running processes
echo "🔥 Killing running processes..."
pkill -f "next dev" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1

# Clean all cache directories
echo "🧹 Cleaning all cache directories..."

# Next.js caches
safe_remove ".next"
safe_remove ".swc"

# Node.js caches
safe_remove "node_modules/.cache"
safe_remove ".cache"

# TypeScript caches
safe_remove "tsconfig.tsbuildinfo"

# Jest caches
safe_remove ".jest-cache"
safe_remove "node_modules/.cache/jest"

# ESLint caches
safe_remove ".eslintcache"

# Other build caches
safe_remove ".turbo"
safe_remove ".parcel-cache"
safe_remove "node_modules/.cache/prettier"

# Clean npm cache (optional, uncomment if needed)
# echo "🗑️  Cleaning npm cache..."
# npm cache clean --force 2>/dev/null || true

echo "✅ All caches cleaned!"
echo "💡 You can now run 'npm run dev' or 'npm run build'"
echo ""
echo "💡 Tip: If issues persist, try:"
echo "   - npm install"
echo "   - npx prisma generate"
echo "   - npm run dev:safe"
