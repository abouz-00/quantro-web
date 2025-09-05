#!/bin/bash

# Production build in Docker for consistent builds
# Usage: ./scripts/docker-build.sh

set -e

echo "🏗️  Building production image..."

# Build the Docker image
docker build -t quantro:latest .

echo "✅ Production image built: quantro:latest"

# Optional: Show image size
docker images quantro:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
