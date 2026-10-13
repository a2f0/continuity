#!/bin/sh

# Static checks: formatting, lint, file names, Markdown, shell scripts,
# managed and project skills, binary placement, dead code, and types. Runs in
# seconds.

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

echo "Checking formatting and lint..."
bun run lint:biome

echo "Checking file names..."
bun run lint:files

echo "Checking Markdown..."
bun run lint:markdown

echo "Checking shell scripts..."
bun run lint:scripts

echo "Checking managed skills..."
bun run agents:check

echo "Checking project skills..."
bun run lint:skills

echo "Checking binary files..."
bun run lint:binary-files

echo "Checking for unused code and dependencies..."
bun run lint:knip

echo "Checking TypeScript..."
bun run typecheck
