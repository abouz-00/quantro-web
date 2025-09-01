#!/bin/bash

# Preventive Cache Maintenance Script
# Run this periodically to prevent cache corruption issues

echo "🛡️  Preventive Cache Maintenance"
echo "================================"

# Check if dev server is running
if pgrep -f "next dev" > /dev/null; then
    echo "⚠️  Dev server is running. Stopping it first..."
    pkill -f "next dev" 2>/dev/null || true
    sleep 2
fi

# Clean caches that tend to get corrupted
echo "🧹 Cleaning potentially corrupted caches..."

# Clean SWC cache (most common source of issues)
if [ -d ".swc" ]; then
    echo "🗑️  Cleaning SWC cache..."
    rm -rf .swc
fi

# Clean Jest cache if it exists
if [ -d ".jest-cache" ]; then
    echo "🗑️  Cleaning Jest cache..."
    rm -rf .jest-cache
fi

# Clean TypeScript build info
if [ -f "tsconfig.tsbuildinfo" ]; then
    echo "🗑️  Cleaning TypeScript build info..."
    rm -f tsconfig.tsbuildinfo
fi

# Clean ESLint cache
if [ -f ".eslintcache" ]; then
    echo "🗑️  Cleaning ESLint cache..."
    rm -f .eslintcache
fi

# Check for large cache directories
echo "📊 Checking cache sizes..."
if [ -d ".next" ]; then
    next_size=$(du -sh .next 2>/dev/null | cut -f1)
    echo "📁 .next directory size: $next_size"
fi

if [ -d "node_modules/.cache" ]; then
    cache_size=$(du -sh node_modules/.cache 2>/dev/null | cut -f1)
    echo "📁 node_modules/.cache size: $cache_size"
fi

echo "✅ Preventive maintenance complete!"
echo "💡 Your development environment is now optimized."
