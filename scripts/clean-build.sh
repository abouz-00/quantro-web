#!/bin/bash

# Clean Build Script
# This script cleans all build artifacts and caches to prevent module loading issues

echo "🧹 Cleaning build artifacts and caches..."

# Check for --force flag to kill dev server
FORCE_KILL=false
if [[ "$1" == "--force" ]] || [[ "$1" == "-f" ]]; then
    FORCE_KILL=true
fi

# Only kill dev server if --force flag is passed
# This prevents accidentally killing dev server during normal clean operations
if [ "$FORCE_KILL" = true ]; then
    echo "🔥 Killing processes on port 3000 (--force mode)..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No processes found on port 3000"
else
    if lsof -ti:3000 >/dev/null 2>&1; then
        echo "ℹ️  Dev server is running on port 3000 - leaving it running"
        echo "   Use --force flag to kill it: ./scripts/clean-build.sh --force"
    fi
fi

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
