#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
target="${TARGET_ORIGIN:-http://127.0.0.1:3000}"
port="${PORT:-8080}"
host="${HOST:-127.0.0.1}"
echo "Starting mobile proxy on ${host}:${port} -> ${target}"
PORT="$port" HOST="$host" TARGET_ORIGIN="$target" node proxy.mjs
