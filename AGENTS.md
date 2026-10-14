# Repository guidance

Resolve the GitHub repository with `gh repo view --json nameWithOwner` and use
its reported identity for GitHub commands. Work on a feature branch, use
conventional commits, and preserve unrelated edits. Do not force-push or add
attribution footers. Do not create GitHub issues without an explicit request.

## Validation

- `bun run check:fast`: Biome, ls-lint, Markdown, ShellCheck, managed and
  project skills, binary placement, Knip, and TypeScript.
- `bun run check`: `check:fast`, tests, canon consistency, and a full re-render
  proving `genesis/` matches canon byte for byte, then the static gallery build.
  The pre-push hook runs it.
- `bun run canon:check`: continuity rules alone, plus portrait status.
- `bun run genesis:check`: the re-render alone (about 20 seconds).

Wrap noisy commands with `bun run agent:run --label <name> -- <command>` and
inspect failures with `bun run agent:logs <path>`.

## Code organization

- Keep `src/canon/` independent of rendering, exports, and the concrete
  `canon/world.ts`. Pass `World` into functions; load the world in CLI
  entrypoints.
- `src/genesis/` coordinates renderers and exporters. Renderers take explicit
  inputs and must not import the genesis builder or cache canon-dependent state
  across builds.
- Split modules by behavior: canon rules live in `src/canon/validation/`, and
  document layouts in `src/render/drivers-license/` and `src/render/passport/`.
  Import the implementing module directly; avoid barrel files and catch-all
  helpers.
- Keep tests beside the behavior they exercise. Use `genesis:check` to prove
  rendering refactors preserve output without regenerating tracked binaries.
- `src/site/` packages the `genesis/` snapshot and static assets. Read facts
  from that snapshot; do not load `canon/world.ts` or render documents there.

## Canon and generated output

- `canon/` is the source of truth. Change facts there, then run
  `bun run genesis` and commit canon and `genesis/` together.
- Never edit `genesis/` by hand. CI re-renders it on Linux and macOS and fails
  on any difference.
- Derive, do not store: expiration dates, ages, MRZ lines, and display names
  are computed in `src/canon/derive.ts` and `src/render/mrz.ts`. A note that
  mentions a canon fact should read it through its context function (see
  `canon/device/notes.ts`).
- Make and replace portraits with the `portrait-fidelity` skill. Faces must be
  photographs of people who do not exist, reviewed against canon and framed
  before `bun run genesis`.
- Character IDs are permanent. Never rename or reuse one; tearleads and other
  consumers key on them.
- Rendering must stay deterministic: no system fonts, clocks, or unseeded
  randomness in `src/render/` or `src/genesis/`. Use `seededRandom` for jitter.
- Keep documents unmistakably fictional: fictional issuers only,
  non-AAMVA barcode payloads, 555-01XX phone numbers, and
  reserved email domains. Do not model a real jurisdiction's or country's
  design. Do not add specimen watermarks.

## Binary files

Binary files are allowed only as `assets/fonts/*.ttf`,
`assets/portraits/*.{jpg,png}`, `assets/household/*.jpg`, and
`genesis/**/*.{jpg,png}`, each at most
3 MiB (`bun run lint:binary-files`). Regenerating images adds to history, so
avoid churning renders without a reason.

## Agent tooling and shipping

Review, PR, merge, and version helpers come from the exact-pinned
[`@a2f0/agent-tool`](https://github.com/a2f0/agent-tool) dev dependency; run it
with `bun run agent-tool`. Title, required-check, and version policy is in
`agent-tool.json`. The shared `cross-agent-review`, `open-pr`, `squash-merge`,
`ship-pr`, `reset`, and `update-dependencies` skills are managed copies in
`.agents/skills` and `.claude/skills`, tracked by `.agent-tool-skills.json`. Do
not edit them; change the shared skill upstream instead. Project-owned skills,
such as `portrait-fidelity`, live byte for byte in both directories;
`bun run lint:skills` fails when the copies differ. After changing the
pin, run `bun run agents:sync` and commit the lockfile, skills, and manifest
together. `bun run agents:check`, part of `check:fast`, fails on missing,
outdated, or edited managed skills.

Shipping rules on top of the shared skills:

- **Reviewer**: prefer the other agent's CLI (Codex from Claude Code, Claude
  from Codex), then the remaining CLIs, and report any fallback.
- **Base integration**: merge the pinned base OID; never rebase or force-push.
- **Versions**: the root package ships one patch past its version on the merge
  base. Before each review, run
  `bun run agent-tool versions prepare "$BASE_OID"`. Versions are not part of
  `genesis/`, so a bump never requires regenerating.
- **Titles**: PR titles and squash subjects follow `commitlint.config.mts`.
  Check them with
  `printf '%s\n' "$TITLE" | bun x --no-install commitlint --config commitlint.config.mts`
  and branch names with `bun run lint:branch-name <name>`.
- **Merge**: run
  `node_modules/.bin/agent-tool pr merge '' "$REVIEWED_SHA" "$BASE_REF"`
  directly, because `bun run` drops empty arguments. Never use `gh pr merge`.
- **Reset**: after returning to `main`, run `sh scripts/git/installHooks.sh` so
  merged hook changes take effect.
- **Deploy**: CI does not publish the gallery at continuity.tearleads.com.
  After merging a change to `genesis/`, `src/site/`, `site/`, or
  `wrangler.jsonc`, run `bun run site:deploy` from the reset `main`, then
  prove the live index matches the build with
  `curl -fsS https://continuity.tearleads.com/ | cmp - dist/index.html`.
  Report a failed deploy separately from the merge.
