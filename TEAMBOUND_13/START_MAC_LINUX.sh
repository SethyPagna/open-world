#!/usr/bin/env sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if ! command -v node >/dev/null 2>&1; then
  echo 'Install Node.js 22 or newer, then run this script again.' >&2
  exit 1
fi
node -e "if(Number(process.versions.node.split('.')[0])<22){console.error('Node.js 22 or newer is required.');process.exit(1)}"
echo 'TEAMBOUND 13 — one host, one server. Close your old server first.'
exec node server.js
