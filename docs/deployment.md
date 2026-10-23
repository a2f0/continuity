# Gallery deployment

Run commands from the repository root. Build and preview the gallery with
`bun run site:build` and `bun run site:dev`; publish with `bun run site:deploy`.

Set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` for deployment, or use
Wrangler's authenticated session. The gallery is static HTML and CSS, built
from the committed `genesis/` snapshot; run `bun run check` before publishing.
`src/site/` builds the page and `site/` contains its stylesheet and headers.
The build renders `favicon.svg`, `favicon.ico`, and `apple-touch-icon.png` from
`assets/brand/logo.svg` with the `favicons` target in `agent-tool.json`
(`agent-tool images build favicons --out dist`); rendered icons are never
committed.

The production gallery initializes `@a2f0/ct-client` explicitly for clicks,
with site `continuity`, app `gallery`, and environment `production`. Its small
browser module runs only at the exact production origin; local previews,
automation, and the published genesis data package do not initialize CT.
`buildSite()` also defaults to tracking off; the production CLI opts in.
The gallery remains usable with JavaScript disabled.

The gallery overrides Global Privacy Control while honoring Do Not Track and
CT's extension and saved opt-outs. The public
[click analytics notice](https://continuity.tearleads.com/#privacy) explains
the recorded fields, IP/geolocation, retention, and opt-out instructions.
Browser tests intercept the collector and never submit production events.

The hostname belongs to `terraform/stacks/prod/continuity` in the
[tearleads repository](https://github.com/a2f0/tearleads). For its first setup,
publish the Worker here, then plan and apply the hostname there:

```sh
terraform/scripts/run-continuity-stack.sh plan -out=/path/to/gallery.tfplan
terraform/scripts/run-continuity-stack.sh apply /path/to/gallery.tfplan
```

Later asset deployments need only Wrangler. `workers.dev` and preview URLs
are disabled.

## Verification

After an authorized deployment from reset `main`, prove the live index matches
the built artifact, and that the page and its assets still carry the
`noindex` header. Tests check `_headers` in the build; only the live response
shows that Cloudflare applied it.

```sh
curl -fsS https://continuity.tearleads.com/ | cmp - dist/index.html
for page in / /genesis/manifest.json; do
  curl -fsSI "https://continuity.tearleads.com$page" |
    grep -i '^x-robots-tag: noindex' || echo "missing noindex: $page"
done
```

CI does not publish the gallery. The automatic shipping obligation applies only
to changes in `genesis/`, `src/site/`, `site/`, `assets/brand/`, the `images`
section of `agent-tool.json`, or `wrangler.jsonc`.
