# Dependency maintenance

Use the managed `update-dependencies` skill. Run `bun run check` before and
after upgrades: it checks types and tooling, tests behavior, and re-renders
all genesis files byte for byte. Do not regenerate tracked images merely to
make a dependency upgrade pass. Verify the same rendering on Linux and macOS
through CI. Run `bun run agents:sync` after changing agent-tool.

The published package contains genesis data only. Pack it and verify a Bun
consumer can resolve its exported manifest and assets before shipping. Keep
run-specific inventories, audits, and validation results in the upgrade PR.

## Markdown tooling

`markdownlint-cli2@0.23.3` pins `smol-toml@1.8.0`, affected by
[quadratic TOML parsing](https://github.com/advisories/GHSA-r4xh-jqrq-34v2).
Its scoped override selects the fixed 1.9.1 patch. Recheck actual Markdownlint
TOML configuration loading and large flat-key parsing after changing it.
Remove the override when the owner selects a fixed release and those checks
and the dependency audit pass.

Markdownlint also brings two unresolved advisory groups:

- `micromatch` uses `braces@3.0.3`, for which
  [the stack-exhaustion advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
  has no fixed release. Revisit when a compatible fixed owner is published.
- `micromark-extension-math` requires KaTeX `^0.16.0`, below the
  [trust-bypass fix in 0.18.2](https://github.com/advisories/GHSA-238p-pmpm-9mq7).
  Revisit when Markdownlint supports that release; do not force a major
  renderer change through a blanket override.

These are development-tool dependencies. Keep configuration and glob input
repository-controlled; that narrows exposure without resolving the advisories.

## Wrangler

Wrangler remains at 4.123.0 until a candidate has a complete non-destructive
deployment preview. Its exact Miniflare dependency retains Sharp 0.35.2 and
Undici 7.29.0 with unresolved advisories; upgrading only those nested pins
requires compatibility tests for the actual Miniflare integrations.
See [Sharp's advisory](https://github.com/advisories/GHSA-wq5f-xc86-pv6w)
and [Undici's security advisories](https://github.com/nodejs/undici/security/advisories).

The gallery Worker is `tearleads-continuity`; its hostname is managed in
tearleads' Terraform stack. Before changing Wrangler, verify the account,
current deployment, routes, bindings, and resource identities through audited
read-only commands, then build and dry-run with the proposed pinned tool.
Deployment/version metadata and a successful bundle alone do not prove route
or remote-resource safety. Preserve `workers_dev`, `preview_urls`, asset
behavior, and the externally managed hostname. Bind any later authorized
upload to the same validated commit, configuration, tool, and built assets.
