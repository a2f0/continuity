# Dependency maintenance

Use the managed `update-dependencies` skill. Run `bun run check` before and
after upgrades: it checks types and tooling, tests behavior, and re-renders
all genesis files byte for byte. Do not regenerate tracked images merely to
make a dependency upgrade pass. Verify the same rendering on Linux and macOS
through CI. Run `bun run agents:sync` after changing agent-tool.

The published package contains genesis data only. Pack it and verify a Bun
consumer can resolve its exported manifest and assets before shipping. Keep
run-specific inventories, audits, and validation results in the upgrade PR.

## Bun lockfile format

Bun 1.4 writes format 3 for
[nested or version-scoped overrides](https://bun.sh/docs/pm/overrides).
Removing the last such override lets the same pinned Bun write format 2.
Let Bun choose the format and verify a frozen install leaves the lock unchanged;
do not edit the format number by hand.

## Markdown tooling

Markdownlint owns Markdown formatting. Biome's Markdown formatter stays
disabled because its list spacing conflicts with Markdownlint and it would
rewrite managed skills. Revisit only when both tools agree and managed skills
remain byte for byte unchanged after the full validation gate.

Markdownlint brings two unresolved advisory groups:

- `markdownlint` pins `re2js@2.8.6`, below the
  [lookbehind DoS fix in 2.8.7](https://github.com/advisories/GHSA-gg6h-894w-4m9c).
  The affected path requires the opt-in `LOOKBEHINDS` flag and repeated
  matching. Markdownlint's front-matter compilation does not enable that flag.
  Revisit when its owner updates the exact pin; any patch override needs
  Markdownlint integration tests, not just a successful install.
- `micromark-extension-math` requires KaTeX `^0.16.0`, below the
  [trust-bypass fix in 0.18.2](https://github.com/advisories/GHSA-238p-pmpm-9mq7).
  Revisit when Markdownlint supports that release; do not force a major
  renderer change through a blanket override.

These are development-tool dependencies. Keep configuration and glob input
repository-controlled; that narrows exposure without resolving the advisories.
The previously listed
[braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) was withdrawn
on October 23, 2026 as not practically exploitable and is no longer an active
constraint.

## Wrangler

Update Wrangler with its exact Miniflare dependency as one compatibility group.
Do not override nested native or network dependencies independently without
exercising their actual Miniflare integrations. The current Miniflare pins
`undici@7.29.1`, below the [7.30.1 security
fixes](https://github.com/nodejs/undici/releases/tag/v7.30.1), including TLS
validation and denial-of-service fixes. Revisit with a compatible Wrangler /
Miniflare release after the complete remote preview below; an isolated Undici
override or a bundle-only check is not sufficient. These dependencies are
local development/deployment tooling, not included in the static gallery or
the genesis package.

The gallery Worker is `tearleads-continuity`; its hostname is managed in
tearleads' Terraform stack. Before changing Wrangler, verify the account,
current deployment, routes, bindings, and resource identities through audited
read-only commands, then build and dry-run with the proposed pinned tool.
Deployment/version metadata and a successful bundle alone do not prove route
or remote-resource safety. Preserve `workers_dev`, `preview_urls`, asset
behavior, and the externally managed hostname. Bind any later authorized
upload to the same validated commit, configuration, tool, and built assets.
