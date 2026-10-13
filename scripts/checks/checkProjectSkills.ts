import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";

// Project-owned skills serve Codex and Claude Code alike, so each lives, byte
// for byte, in both .agents/skills and .claude/skills. Edit one copy, then
// copy it to the other. Skills managed by @a2f0/agent-tool are recorded in
// .agent-tool-skills.json and checked by `bun run agents:check` instead.

const ROOTS = [".agents/skills", ".claude/skills"] as const;
const MANIFEST = ".agent-tool-skills.json";

const managed = new Set(
  Object.keys(
    (JSON.parse(readFileSync(MANIFEST, "utf8")) as { files: object }).files,
  ),
);

function projectFiles(root: string): Map<string, Buffer> {
  const entries = existsSync(root)
    ? readdirSync(root, { recursive: true, encoding: "utf8" })
    : [];
  return new Map(
    entries
      .filter(
        (path) =>
          !basename(path).startsWith(".") &&
          !managed.has(`${root}/${path}`) &&
          statSync(join(root, path)).isFile(),
      )
      .map((path) => [path, readFileSync(join(root, path))]),
  );
}

const [codex, claude] = ROOTS.map(projectFiles) as [
  Map<string, Buffer>,
  Map<string, Buffer>,
];
const problems: string[] = [];
for (const path of new Set([...codex.keys(), ...claude.keys()])) {
  const [a, b] = [codex.get(path), claude.get(path)];
  if (!a || !b) {
    const [present, missing] = a ? ROOTS : [ROOTS[1], ROOTS[0]];
    problems.push(`${present}/${path} has no copy in ${missing}`);
  } else if (!a.equals(b)) {
    problems.push(`${ROOTS[0]}/${path} and ${ROOTS[1]}/${path} differ`);
  }
}

if (problems.length > 0) {
  console.error(problems.sort().join("\n"));
  process.exit(1);
}
