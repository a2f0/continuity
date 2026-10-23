import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["scripts/**/*.ts", "src/site/browser.ts"],
  project: ["canon/**/*.ts", "scripts/**/*.ts", "src/**/*.ts"],
  // The canon schema names every part of a character so authors can annotate
  // with it, even where only the enclosing type is imported elsewhere.
  ignoreExportsUsedInFile: { interface: true, type: true },
  // Run through `bun x` (in scripts and git hooks), which Knip does not trace.
  ignoreDependencies: ["@commitlint/cli", "lint-staged", "markdownlint-cli2"],
};

export default config;
