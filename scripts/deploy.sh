#!/usr/bin/env bash

set -Eeuo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
BRANCH="${BRANCH:-$(git branch --show-current)}"
REMOTE="${REMOTE:-origin}"
SERVICE="${SERVICE:-backend}"
RESET_LOCAL_CHANGES="${RESET_LOCAL_CHANGES:-0}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-0}"
RESET_NODE_MODULES="${RESET_NODE_MODULES:-1}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/health}"

echo "🚀 Deploying Pixegotchi"
echo "   branch:       ${BRANCH}"
echo "   remote:       ${REMOTE}"
echo "   compose file: ${COMPOSE_FILE}"
echo "   service:      ${SERVICE}"

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  echo "❌ Compose file not found: ${COMPOSE_FILE}" >&2
  exit 1
fi

if [[ "${RESET_LOCAL_CHANGES}" != "1" ]]; then
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "❌ Local git changes detected. Commit/stash them or run with RESET_LOCAL_CHANGES=1." >&2
    exit 1
  fi
else
  echo "⚠️  Resetting local changes because RESET_LOCAL_CHANGES=1"
  git reset --hard HEAD
  git clean -fd
fi

echo "📥 Fetching latest code..."
git fetch "${REMOTE}" "${BRANCH}"
git checkout "${BRANCH}"
git pull --ff-only "${REMOTE}" "${BRANCH}"

export APP_VERSION="$(git rev-parse --short HEAD)"
mkdir -p runtime/logs/backend

echo "🔎 Validating Docker Compose config..."
docker compose -f "${COMPOSE_FILE}" config --quiet

echo "📦 Building ${SERVICE} image..."
docker compose -f "${COMPOSE_FILE}" build "${SERVICE}"

if [[ "${RESET_NODE_MODULES}" == "1" ]]; then
  echo "♻️  Recreating Docker node_modules volumes for fresh dependencies..."
  compose_project="$(
    docker compose -f "${COMPOSE_FILE}" config --format json \
      | sed -n 's/^[[:space:]]*"name": "\(.*\)",$/\1/p' \
      | head -1
  )"

  if [[ -z "${compose_project}" ]]; then
    echo "❌ Could not resolve Compose project name" >&2
    exit 1
  fi

  docker compose -f "${COMPOSE_FILE}" stop "${SERVICE}" >/dev/null 2>&1 || true
  docker compose -f "${COMPOSE_FILE}" rm -f "${SERVICE}" >/dev/null 2>&1 || true

  docker volume rm "${compose_project}_backend_node_modules" >/dev/null 2>&1 || true
  docker volume rm "${compose_project}_shared_node_modules" >/dev/null 2>&1 || true
else
  echo "⏭ Keeping existing Docker node_modules volumes because RESET_NODE_MODULES=0"
fi

echo "🧬 Generating Prisma client for Docker dev runtime..."
docker compose -f "${COMPOSE_FILE}" run --rm --no-deps "${SERVICE}" \
  sh -c "cd packages/backend && npx prisma generate"

if [[ "${RUN_MIGRATIONS}" == "1" ]]; then
  echo "🗄 Running Prisma migrate deploy..."
  docker compose -f "${COMPOSE_FILE}" run --rm "${SERVICE}" \
    sh -c "cd packages/backend && npx prisma migrate deploy"
else
  echo "⏭ Skipping migrations. Use RUN_MIGRATIONS=1 only when you intentionally want migrate deploy."
fi

echo "▶️ Starting services..."
docker compose -f "${COMPOSE_FILE}" up -d postgres redis "${SERVICE}"

echo "🏥 Checking service status..."
docker compose -f "${COMPOSE_FILE}" ps
docker compose -f "${COMPOSE_FILE}" logs --tail=120 "${SERVICE}"

echo "🌐 Checking health endpoint: ${HEALTH_URL}"
for attempt in {1..30}; do
  if curl -fsS "${HEALTH_URL}" >/tmp/pixegotchi-health.json; then
    cat /tmp/pixegotchi-health.json
    echo
    echo "✅ Deployment complete"
    exit 0
  fi

  echo "Waiting for health check... (${attempt}/30)"
  sleep 2
done

echo "❌ Health check failed" >&2
docker compose -f "${COMPOSE_FILE}" logs --tail=200 "${SERVICE}" >&2
exit 1
