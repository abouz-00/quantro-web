#!/bin/bash

# Quick Docker verification
echo "🔍 Verifying Docker installation..."

# Check Docker command
if ! command -v docker &> /dev/null; then
    echo "❌ Docker CLI not found"
    exit 1
fi

# Check Docker daemon
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon not running"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose not available"
    exit 1
fi

echo "✅ Docker is properly installed and running!"
echo ""
echo "🚀 Ready to run: ./setup-docker.sh"
