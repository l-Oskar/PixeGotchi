#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${REPO_ROOT}/runtime/logs/backend"
LOG_FILE="${LOG_DIR}/backend.log"
TEMPLATE="${REPO_ROOT}/packages/backend/logrotate.conf.template"
TARGET="/etc/logrotate.d/pixegotchi-backend"
TEMP_FILE="$(mktemp)"

trap 'rm -f "${TEMP_FILE}"' EXIT

mkdir -p "${LOG_DIR}"
touch "${LOG_FILE}"

ESCAPED_LOG_FILE="${LOG_FILE//&/\\&}"
LOG_USER="$(stat -c "%U" "${LOG_FILE}")"
LOG_GROUP="$(stat -c "%G" "${LOG_FILE}")"
sed \
  -e "s|__LOG_FILE__|${ESCAPED_LOG_FILE}|g" \
  -e "s|__LOG_USER__|${LOG_USER}|g" \
  -e "s|__LOG_GROUP__|${LOG_GROUP}|g" \
  "${TEMPLATE}" > "${TEMP_FILE}"

sudo install -m 0644 "${TEMP_FILE}" "${TARGET}"
sudo logrotate --debug "${TARGET}"

echo "Installed logrotate config: ${TARGET}"
echo "Log file: ${LOG_FILE}"
