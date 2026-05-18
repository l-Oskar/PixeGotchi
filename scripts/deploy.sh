#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Скидаємо всі локальні зміни та отримуємо чисту версію з GitHub
echo "🔄 Resetting local changes..."
git reset --hard HEAD

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Перезапускаємо backend
echo "🔄 Restarting backend container..."
docker restart pixegotchi-backend-1

echo "✅ Deployment complete!"