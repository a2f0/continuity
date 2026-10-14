import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

// Binary files belong here, unlike in tearleads, but only where they are
// expected: vendored fonts, portraits, and generated genesis output. Each must
// be a known type and stay small enough to keep clones and history light.
//
//   bun run lint:binary-files            check every tracked file as checked out
//   bun run lint:binary-files --staged   check the staged version of staged files

const ALLOWED: readonly {
  readonly prefix: string;
  readonly extensions: readonly string[];
}[] = [
  { extensions: [".ttf"], prefix: "assets/fonts/" },
  { extensions: [".jpg", ".png"], prefix: "assets/portraits/" },
  { extensions: [".jpg"], prefix: "assets/household/" },
  { extensions: [".jpg", ".png"], prefix: "genesis/" },
];
const MAX_BYTES = 3 * 1024 * 1024;
const SNIFF_BYTES = 8000;

function git(args: readonly string[]): Buffer {
  const result = spawnSync("git", args, { maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(
      `git ${args.join(" ")} failed: ${result.stderr.toString().trim()}`,
    );
  }
  return result.stdout;
}

function listFiles(staged: boolean): string[] {
  const args = staged
    ? ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"]
    : ["ls-files", "-z"];
  return git(args).toString("utf8").split("\0").filter(Boolean);
}

function contents(path: string, staged: boolean): Buffer {
  return staged ? git(["show", `:${path}`]) : readFileSync(path);
}

function isBinary(bytes: Buffer): boolean {
  return bytes.subarray(0, SNIFF_BYTES).includes(0);
}

function check(path: string, bytes: Buffer): string | undefined {
  if (!isBinary(bytes)) {
    return undefined;
  }
  const rule = ALLOWED.find((item) => path.startsWith(item.prefix));
  if (!rule?.extensions.some((extension) => path.endsWith(extension))) {
    return `${path}: binary files are only allowed as ${ALLOWED.map((item) => `${item.prefix}*{${item.extensions.join(",")}}`).join(", ")}`;
  }
  if (bytes.length > MAX_BYTES) {
    return `${path}: ${bytes.length} bytes exceeds the ${MAX_BYTES}-byte limit`;
  }
  return undefined;
}

const staged = process.argv.includes("--staged");
const problems = listFiles(staged)
  .filter((path) => staged || existsSync(path))
  .flatMap((path) => {
    const problem = check(path, contents(path, staged));
    return problem ? [problem] : [];
  });

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
