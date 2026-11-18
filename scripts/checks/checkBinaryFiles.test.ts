import { afterEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const SCRIPT = join(import.meta.dir, "checkBinaryFiles.ts");
const BINARY = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 1, 2, 3]);

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

// Hooks export GIT_DIR and GIT_INDEX_FILE; drop them so Git uses the temp repo.
function cleanEnv(): NodeJS.ProcessEnv {
  return Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
  );
}

function run(root: string, command: string, args: string[]) {
  const result = spawnSync(command, args, { cwd: root, env: cleanEnv() });
  return {
    status: result.status,
    stderr: result.stderr.toString(),
  };
}

function git(root: string, ...args: string[]): void {
  const result = run(root, "git", args);
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  }
}

function write(root: string, path: string, bytes: string | Uint8Array): void {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), bytes);
}

function writeAllow(root: string, allow: string[]): void {
  write(root, "agent-tool.json", JSON.stringify({ binaries: { allow } }));
}

function repo(allow: string[]): string {
  const root = mkdtempSync(join(tmpdir(), "continuity-binaries-"));
  roots.push(root);
  git(root, "init", "--quiet");
  mkdirSync(join(root, "scripts/checks"), { recursive: true });
  copyFileSync(SCRIPT, join(root, "scripts/checks/checkBinaryFiles.ts"));
  writeAllow(root, allow);
  git(root, "add", "agent-tool.json");
  return root;
}

const check = (root: string, ...args: string[]) =>
  run(dirname(root), process.execPath, [
    join(root, "scripts/checks/checkBinaryFiles.ts"),
    ...args,
  ]);

describe("binary file policy", () => {
  test("accepts tracked binaries the allowlist matches at any depth", () => {
    const root = repo(["genesis/**/*.{jpg,png}"]);
    write(root, "genesis/a.png", BINARY);
    write(root, "genesis/documents/x/b.jpg", BINARY);
    write(root, "notes.txt", "text is never a binary\n");
    git(root, "add", ".");
    expect(check(root).status).toBe(0);
  });

  test("rejects a binary outside the allowlist", () => {
    const root = repo(["genesis/**/*.png"]);
    write(root, "site/logo.png", BINARY);
    git(root, "add", ".");
    const result = check(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("site/logo.png: binary files are only");
  });

  test("rejects an allowed binary over 3 MiB", () => {
    const root = repo(["genesis/**/*.png"]);
    const large = new Uint8Array(3 * 1024 * 1024 + 1);
    large.set(BINARY);
    write(root, "genesis/large.png", large);
    git(root, "add", ".");
    const result = check(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("exceeds the 3145728-byte limit");
  });

  test("judges staged binaries by the staged allowlist", () => {
    const root = repo(["genesis/**/*.png"]);
    write(root, "site/logo.png", BINARY);
    git(root, "add", "site/logo.png");
    // An unstaged relaxation does not approve the staged binary.
    writeAllow(root, ["genesis/**/*.png", "site/**/*.png"]);
    expect(check(root, "--staged").status).toBe(1);

    // A staged relaxation does, even when the worktree tightens it again.
    git(root, "add", "agent-tool.json");
    writeAllow(root, ["genesis/**/*.png"]);
    expect(check(root, "--staged").status).toBe(0);
  });

  test("fails without a binaries.allow list", () => {
    const root = repo([]);
    const result = check(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("binaries.allow");
  });
});
