import { resolve } from "node:path";

// This file is src/paths.ts, so the repository root is one level up.
const REPO_ROOT = resolve(import.meta.dir, "..");

export function repoPath(...segments: readonly string[]): string {
  return resolve(REPO_ROOT, ...segments);
}
