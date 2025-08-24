#!/bin/bash

# Safe Build Script
# This script ensures a clean build environment

echo "🏗️  Starting safe build process..."

# Clean previous build artifacts
./scripts/clean-build.sh

# Wait for cleanup
sleep 1

# Reinstall dependencies if needed
echo "📦 Verifying dependencies..."
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Run build
echo "🔨 Building application..."
npm run build

echo "✅ Safe build complete!"
