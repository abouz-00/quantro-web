#!/bin/bash

# Run production build locally in Docker
# Usage: ./scripts/docker-run.sh

set -e

echo "🚀 Running production build in Docker..."

# Build if image doesn't exist
if ! docker images quantro:latest | grep -q quantro; then
    echo "Building image first..."
    ./scripts/docker-build.sh
fi

# Run the container
docker run --rm \
  -p 3000:3000 \
  -e DATABASE_URL="${DATABASE_URL:-file:./prod.db}" \
  -e NEXTAUTH_URL="${NEXTAUTH_URL:-http://localhost:3000}" \
  -e NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-your-secret-key}" \
  quantro:latest

echo "✅ App running at http://localhost:3000"
