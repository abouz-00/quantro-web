#!/bin/bash

# Docker-based test runner with full stack
# Usage: ./scripts/docker-test.sh

set -e

echo "🐳 Running tests with full Docker stack..."

# Use test-specific compose file
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit

echo "✅ Docker stack tests completed"
