#!/bin/bash

echo "🚀 Enhanced Quantro Development Server"
echo "======================================"

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up..."
    pkill -f "next dev" 2>/dev/null || true
    exit 0
}

# Trap exit signals
trap cleanup SIGINT SIGTERM

# Check system resources
echo "📊 System Resource Check:"
echo "- Memory available: $(vm_stat | grep 'Pages free' | awk '{print $3}' | sed 's/\.//' | awk '{print $1 * 4096 / 1024 / 1024 "MB"}')"
echo "- File descriptor limit: $(ulimit -n)"

# Clean previous build
echo "🧹 Cleaning build cache..."
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .swc 2>/dev/null || true
rm -rf .jest-cache 2>/dev/null || true
rm -f tsconfig.tsbuildinfo 2>/dev/null || true
rm -f .eslintcache 2>/dev/null || true

# Kill any existing processes
echo "🔄 Killing existing processes..."
pkill -f "next dev" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Generate Prisma client
echo "🔗 Generating Prisma client..."
npx prisma generate

# Start with resource monitoring
echo "🚀 Starting enhanced development server..."
echo "💡 Changes made to improve stability:"
echo "   - Removed file polling (reduces CPU/memory usage)"
echo "   - Added more directories to ignore list"
echo "   - Using native file system events"
echo ""

# Start the server with enhanced monitoring
npm run dev 2>&1 | while IFS= read -r line; do
    timestamp=$(date '+%H:%M:%S')
    echo "[$timestamp] $line"
    
    # Log any errors to a file
    if [[ "$line" == *"Error"* || "$line" == *"error"* ]]; then
        echo "[$timestamp] ERROR: $line" >> dev-server-errors.log
    fi
done
