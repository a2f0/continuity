import { parseArgs } from "node:util";
import { world } from "../canon/world";
import { daysBetween, isIsoDate } from "./canon/dates";
import { documentExpirations } from "./canon/derive";
import { validateWorld } from "./canon/validate";
import { buildGenesis } from "./genesis/build";
import { diffGenesis, type GenesisDiff, writeGenesis } from "./genesis/sync";
import { repoPath } from "./paths";
import { portraitStatus } from "./portraits/sidecar";

// bun run canon:check       validate canon and report portrait status
// bun run genesis           render canon into genesis/
// bun run genesis:check     fail if genesis/ is not exactly what canon renders
// bun run canon:freshness   fail if a document expires soon in real time

const GENESIS_ROOT = repoPath("genesis");

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function validate(): void {
  const problems = validateWorld(world);
  if (problems.length > 0) {
    fail(
      `Canon is inconsistent:\n${problems.map((item) => `- ${item}`).join("\n")}`,
    );
  }
  console.log(
    `Canon is consistent: ${world.characters.length} characters as of ${world.asOf}.`,
  );
  const portraits = world.characters
    .map(
      (character) => [character.id, portraitStatus(world, character)] as const,
    )
    .filter(([, status]) => status !== "current");
  if (portraits.length > 0) {
    console.log("Portraits needing attention (see `bun run portraits`):");
    for (const [id, status] of portraits) {
      console.log(`  ${status.padEnd(12)} ${id}`);
    }
  }
}

function describe(diff: GenesisDiff): string[] {
  return [
    ...diff.added.map((path) => `  added    ${path}`),
    ...diff.changed.map((path) => `  changed  ${path}`),
    ...diff.removed.map((path) => `  removed  ${path}`),
  ];
}

function generate(): void {
  const files = buildGenesis(world);
  const diff = writeGenesis(files, GENESIS_ROOT);
  const lines = describe(diff);
  console.log(
    lines.length > 0
      ? `Updated genesis/ (${files.length} files):\n${lines.join("\n")}`
      : `genesis/ is already current (${files.length} files).`,
  );
}

function check(): void {
  const files = buildGenesis(world);
  const lines = describe(diffGenesis(files, GENESIS_ROOT));
  if (lines.length > 0) {
    fail(
      `genesis/ does not match canon. Run \`bun run genesis\` and commit the result:\n${lines.join("\n")}`,
    );
  }
  console.log(`genesis/ matches canon (${files.length} files).`);
}

function freshness(days: number, today: string): void {
  const expiring = world.characters
    .flatMap((character) => documentExpirations(world, character))
    .map((item) => ({ ...item, remaining: daysBetween(today, item.expires) }))
    .filter((item) => item.remaining < days)
    .sort((a, b) => a.remaining - b.remaining);
  if (expiring.length > 0) {
    fail(
      [
        `Documents expiring within ${days} days of ${today}:`,
        ...expiring.map(
          (item) =>
            `- ${item.label} expires ${item.expires} (${item.remaining} days)`,
        ),
        "Renew them in canon (a new issue date, and a new document discriminator for licenses), advance `asOf`, and run `bun run genesis`.",
      ].join("\n"),
    );
  }
  console.log(`No document expires within ${days} days of ${today}.`);
}

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    days: { type: "string", default: "180" },
    today: { type: "string", default: new Date().toISOString().slice(0, 10) },
  },
});

switch (positionals[0]) {
  case "validate":
    validate();
    break;
  case "generate":
    generate();
    break;
  case "check":
    check();
    break;
  case "freshness": {
    const days = Number(values.days);
    if (!Number.isInteger(days) || days < 0 || !isIsoDate(values.today)) {
      fail("Usage: bun run canon:freshness [--days <n>] [--today YYYY-MM-DD]");
    }
    freshness(days, values.today);
    break;
  }
  default:
    fail("Usage: bun src/cli.ts validate|generate|check|freshness");
}
