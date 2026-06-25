#!/usr/bin/env bash

set -Eeuo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
SERVICE="${SERVICE:-backend}"
NO_CACHE="${NO_CACHE:-0}"

echo "🚧 Building Pixegotchi Docker image"
echo "   compose file: ${COMPOSE_FILE}"
echo "   service:      ${SERVICE}"
echo "   git sha:      $(git rev-parse --short HEAD)"

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  echo "❌ Compose file not found: ${COMPOSE_FILE}" >&2
  exit 1
fi

mkdir -p runtime/logs/backend

echo "🔎 Validating Docker Compose config..."
docker compose -f "${COMPOSE_FILE}" config --quiet

build_args=()
if [[ "${NO_CACHE}" == "1" ]]; then
  build_args+=(--no-cache)
fi

echo "📦 Building ${SERVICE} image..."
docker compose -f "${COMPOSE_FILE}" build "${build_args[@]}" "${SERVICE}"

echo "✅ Build finished"
echo "Next:"
echo "  docker compose -f ${COMPOSE_FILE} run --rm --no-deps ${SERVICE} sh -c \"cd packages/backend && npx prisma generate\""
echo "  docker compose -f ${COMPOSE_FILE} up -d postgres redis ${SERVICE}"
