import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { repoPath } from "../../src/paths";

test("reports the checkout's missing skill mirror from the parent workspace", () => {
  const matrix = mkdtempSync(join(tmpdir(), "skill check "));
  try {
    const checkout = join(matrix, "checkouts", "demo");
    for (const dir of ["src", "scripts/checks", ".agents/skills/example"]) {
      mkdirSync(join(checkout, dir), { recursive: true });
    }
    for (const file of [
      "src/paths.ts",
      "scripts/checks/checkProjectSkills.ts",
    ]) {
      copyFileSync(repoPath(file), join(checkout, file));
    }
    writeFileSync(join(checkout, ".agent-tool-skills.json"), '{"files":{}}');
    writeFileSync(join(checkout, ".agents/skills/example/SKILL.md"), "Example");
    const result = spawnSync(
      process.execPath,
      ["checkouts/demo/scripts/checks/checkProjectSkills.ts"],
      { cwd: matrix, encoding: "utf8" },
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      ".agents/skills/example/SKILL.md has no copy in .claude/skills",
    );
  } finally {
    rmSync(matrix, { recursive: true, force: true });
  }
});
