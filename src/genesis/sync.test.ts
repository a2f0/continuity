import { afterEach, describe, expect, test } from "bun:test";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { diffGenesis, writeGenesis } from "./sync";

const roots: string[] = [];

function tempRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "continuity-genesis-"));
  roots.push(root);
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

const encode = (text: string) => new TextEncoder().encode(text);

describe("genesis sync", () => {
  test("writes, then reports nothing to do", () => {
    const root = tempRoot();
    const files = [{ bytes: encode("a"), path: "one/a.txt" }];
    expect(writeGenesis(files, root).added).toEqual(["one/a.txt"]);
    expect(diffGenesis(files, root)).toEqual({
      added: [],
      changed: [],
      removed: [],
    });
  });

  test("detects edits and stray files, and cleans them up", () => {
    const root = tempRoot();
    const files = [{ bytes: encode("a"), path: "one/a.txt" }];
    writeGenesis(files, root);
    writeFileSync(join(root, "one/a.txt"), "edited");
    writeFileSync(join(root, "stray.txt"), "stray");
    expect(diffGenesis(files, root)).toEqual({
      added: [],
      changed: ["one/a.txt"],
      removed: ["stray.txt"],
    });
    writeGenesis(files, root);
    expect(readFileSync(join(root, "one/a.txt"), "utf8")).toBe("a");
    expect(existsSync(join(root, "stray.txt"))).toBe(false);
  });

  test("removes directories emptied by removals", () => {
    const root = tempRoot();
    writeGenesis([{ bytes: encode("a"), path: "old/a.txt" }], root);
    writeGenesis([], root);
    expect(existsSync(join(root, "old"))).toBe(false);
  });
});
