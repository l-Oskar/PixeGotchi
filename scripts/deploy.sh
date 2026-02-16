#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

echo "🗑 Очищення старих образів..."
docker image prune -f

# Build images
echo "📦 Building Docker images..."
docker compose -f docker-compose.yml build --no-cache

# Stop old containers
echo "🛑 Stopping old containers..."
docker compose -f docker-compose.yml down

# Start new containers
echo "▶️  Starting new containers..."
docker compose -f docker-compose.yml up -d

# Health check
echo "🏥 Checking services health..."
sleep 10
docker compose -f docker-compose.yml ps

echo "✅ Deployment complete!"