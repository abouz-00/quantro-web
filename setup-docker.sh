#!/bin/bash

# Complete Docker setup for Quantro
# Run this after installing Docker Desktop

set -e

echo "🚀 Setting up Quantro with Docker..."
echo "===================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first:"
    echo "   https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is ready!"

# Test 1: PostgreSQL Database
echo ""
echo "🧪 Test 1: PostgreSQL Database"
echo "------------------------------"
docker compose up -d postgres
sleep 5
docker compose exec postgres psql -U quantro -d quantro_dev -c "SELECT version();"
echo "✅ PostgreSQL test passed!"

# Test 2: Docker-based Testing
echo ""
echo "🧪 Test 2: Docker-based Testing"
echo "-------------------------------"
./scripts/docker-test.sh
echo "✅ Docker testing completed!"

# Test 3: Production Build
echo ""
echo "🧪 Test 3: Production Build"
echo "---------------------------"
./scripts/docker-build.sh
echo "✅ Production build completed!"

# Cleanup
echo ""
echo "🧹 Cleaning up..."
docker compose down
docker system prune -f

echo ""
echo "🎉 All Docker tests completed successfully!"
echo "=========================================="
echo "Your Quantro project now has:"
echo "✅ PostgreSQL database container"
echo "✅ Consistent testing environment"
echo "✅ Production build optimization"
echo "✅ CI/CD ready Docker setup"
