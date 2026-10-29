# Development tooling

Use the Bun and ShellCheck versions in `.mise.toml`. In agent shells, put their
installations under `~/.local/share/mise/installs` first on PATH; do not run
`mise trust`. Install dependencies with `bun install --frozen-lockfile`, then
run `bun run hooks:install`.

## Hooks and branches

Tracked hooks live in `scripts/git/hooks/`. The shared installer handles copied
hook ownership, backups, and linked worktrees. When migrating an existing clone,
inspect its installed hooks and run
`bun run hooks:install --adopt` once to adopt those copies. Subsequent installs
use `bun run hooks:install`. Rerun installation after pulling hook changes; the
pre-push hook refuses stale copies.

Branch names use the same Conventional Commits types and 50-character limit as
commit headers, with `main` exempt. `bun run lint:branch-name <name>` validates
Git ref syntax and naming. Create a branch with
`bun run agent-tool branch create chore/maintenance --base main`; the helper
fetches the base and refuses dirty state or existing names. Pre-push checks each
pushed destination branch, and CI checks the PR branch without changing HEAD.
Commitlint remains authoritative for commit-message rules.

## Validation and scripts

`bun run check:fast` runs static checks. `bun run check` also runs tests, validates
canon, re-renders genesis byte for byte, and builds the gallery. Their sequential
plans live in `scripts/testing/`; the shared runner records each step and its
private log, with source fingerprints to invalidate results if inputs change.
Inspect reports with `bun run agent-tool runs list` and logs with
`bun run agent:logs <path>`.

`scripts/checks/` holds project-owned checks: binary location and 3 MiB limits,
project skill mirror consistency, and the CI gate's required job names. These
policies remain local while branch validation, hook installation, generic CI
result evaluation, and command receipts come from the exact agent-tool pin.
Keep public package command names stable and update all callers when moving
internal scripts. Application commands remain in `src/` by domain.

## Module layering

Imports point down this list, never up:

1. `src/canon/`: rules, derivations, and types. It takes `World` as an argument
   and never imports the concrete `canon/world.ts`.
2. `src/render/` and `src/export/`: renderers and exporters take explicit
   inputs. Shapes shared between exporters live in their own module, such as
   `src/export/seedTypes.ts`.
3. `src/genesis/`: coordinates renderers and exporters into `genesis/`.
4. `src/site/`: packages the `genesis/` snapshot; it never loads
   `canon/world.ts` or renders documents.
5. CLI entrypoints (`src/cli.ts`, `src/portraits/cli.ts`) load the world.

Biome enforces the boundaries for non-test files (`style/noRestrictedImports`
overrides in `biome.jsonc`) and rejects import cycles, including type-only
ones (`suspicious/noImportCycles`). Tests may load the concrete world.

README covers setup and normal use. [AGENTS.md](../AGENTS.md) owns agent policy;
[dependency maintenance](dependency-upgrades.md) owns upgrade constraints;
[deployment](deployment.md) owns publication and live verification. Canon,
portrait, and consumer contracts stay in their existing domain guides.
