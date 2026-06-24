#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Скидаємо всі локальні зміни та отримуємо чисту версію з GitHub
echo "🔄 Resetting local changes..."
git reset --hard HEAD

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Перебудовуємо контейнер, щоб застосувати env, volumes і logging config
export APP_VERSION="$(git rev-parse --short HEAD)"
mkdir -p runtime/logs/backend
echo "🔄 Rebuilding backend container..."
docker compose up -d --build backend

echo "✅ Deployment complete!"
