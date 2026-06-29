#!/usr/bin/env bash

set -Eeuo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
TEST_COMPOSE_FILE="${TEST_COMPOSE_FILE:-docker-compose.test.yml}"
BRANCH="${BRANCH:-$(git branch --show-current)}"
REMOTE="${REMOTE:-origin}"
SKIP_PULL="${SKIP_PULL:-0}"
RESTART_APP="${RESTART_APP:-1}"

test_status=0

restart_app() {
  local exit_code=$?

  echo "🧹 Cleaning test Compose stack..."
  docker compose -f "${TEST_COMPOSE_FILE}" --profile test down -v || true

  if [[ "${RESTART_APP}" == "1" ]]; then
    echo "▶️ Starting main Compose stack..."
    docker compose -f "${COMPOSE_FILE}" up -d
  else
    echo "⏭ Main Compose restart skipped because RESTART_APP=0"
  fi

  if [[ "${test_status}" != "0" ]]; then
    exit "${test_status}"
  fi

  exit "${exit_code}"
}

echo "🧪 Pixegotchi server test deploy"
echo "   branch:            ${BRANCH}"
echo "   remote:            ${REMOTE}"
echo "   compose file:      ${COMPOSE_FILE}"
echo "   test compose file: ${TEST_COMPOSE_FILE}"
echo "   skip pull:         ${SKIP_PULL}"
echo "   restart app:       ${RESTART_APP}"

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  echo "❌ Compose file not found: ${COMPOSE_FILE}" >&2
  exit 1
fi

if [[ ! -f "${TEST_COMPOSE_FILE}" ]]; then
  echo "❌ Test Compose file not found: ${TEST_COMPOSE_FILE}" >&2
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ Local git changes detected. Commit or stash them before server test deploy." >&2
  exit 1
fi

trap restart_app EXIT

echo "⏹ Stopping main Compose stack to free server resources..."
docker compose -f "${COMPOSE_FILE}" down

if [[ "${SKIP_PULL}" != "1" ]]; then
  echo "📥 Pulling latest code..."
  git fetch "${REMOTE}" "${BRANCH}"
  git checkout "${BRANCH}"
  git pull --ff-only "${REMOTE}" "${BRANCH}"
else
  echo "⏭ Skipping git pull because SKIP_PULL=1"
fi

echo "🔎 Validating test Compose config..."
docker compose -f "${TEST_COMPOSE_FILE}" --profile test config --quiet

echo "🧪 Running isolated Docker test stack..."
set +e
docker compose -f "${TEST_COMPOSE_FILE}" --profile test up \
  --build \
  --abort-on-container-exit \
  --exit-code-from backend-test \
  backend-test
test_status=$?
set -e

if [[ "${test_status}" != "0" ]]; then
  echo "❌ Tests failed with exit code ${test_status}" >&2
  exit "${test_status}"
fi

echo "✅ Tests passed"
