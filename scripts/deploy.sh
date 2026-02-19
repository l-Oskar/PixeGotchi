#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Перезапускаємо backend
echo "🔄 Restarting backend container..."
docker restart pixegotchi-backend-1

echo "✅ Deployment complete!"