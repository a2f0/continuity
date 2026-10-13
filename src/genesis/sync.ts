import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import type { GenesisFile } from "./build";

// Compare or write a built genesis tree against the one on disk.

export interface GenesisDiff {
  readonly added: readonly string[];
  readonly changed: readonly string[];
  readonly removed: readonly string[];
}

function existingFiles(root: string): string[] {
  if (!existsSync(root)) {
    return [];
  }
  return readdirSync(root, { encoding: "utf8", recursive: true })
    .filter((path) => statSync(join(root, path)).isFile())
    .map((path) => path.split("\\").join("/"))
    .sort();
}

function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && Buffer.from(a).equals(Buffer.from(b));
}

export function diffGenesis(
  files: readonly GenesisFile[],
  root: string,
): GenesisDiff {
  const onDisk = new Set(existingFiles(root));
  const added: string[] = [];
  const changed: string[] = [];
  for (const file of files) {
    if (!onDisk.has(file.path)) {
      added.push(file.path);
    } else if (
      !sameBytes(
        new Uint8Array(readFileSync(join(root, file.path))),
        file.bytes,
      )
    ) {
      changed.push(file.path);
    }
    onDisk.delete(file.path);
  }
  return { added, changed, removed: [...onDisk] };
}

export function writeGenesis(
  files: readonly GenesisFile[],
  root: string,
): GenesisDiff {
  const diff = diffGenesis(files, root);
  const pending = new Set([...diff.added, ...diff.changed]);
  for (const file of files.filter((item) => pending.has(item.path))) {
    const target = join(root, file.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.bytes);
  }
  for (const path of diff.removed) {
    rmSync(join(root, path));
  }
  removeEmptyDirectories(root);
  return diff;
}

function removeEmptyDirectories(directory: string): void {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) {
      removeEmptyDirectories(path);
      if (readdirSync(path).length === 0) {
        rmSync(path, { recursive: true });
      }
    }
  }
}
