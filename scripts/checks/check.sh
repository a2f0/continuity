#!/bin/sh

# Everything CI gates on: static checks, tests, canon consistency, and a full
# re-render proving genesis/ is exactly what canon produces.

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

sh scripts/checks/checkFast.sh

echo "Running tests..."
bun run test

echo "Checking canon..."
bun run canon:check

echo "Checking genesis output..."
bun run genesis:check
