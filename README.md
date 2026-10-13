# continuity

Canonical fictional characters, and the genesis data rendered from them:
driver's licenses, passports, contact cards, avatars, and notes that seed
[tearleads](https://github.com/a2f0/tearleads) for screenshots, demos, and
import testing.

Everything is derived from one hand-maintained canon, so a character's name,
birthday, address, face, and document numbers agree everywhere they appear. The
canon also checks itself: relationships must be reciprocated, documents must be
valid on the story date, and the generated files must match the canon byte for
byte.

tearleads keeps binary files out of its repository. This repository holds them
instead, alongside the source that produces them, and tearleads consumes the
result as a pinned dependency.

## Quick start

```sh
mise install                # Bun and ShellCheck, pinned in .mise.toml
bun install --frozen-lockfile
sh scripts/git/installHooks.sh

bun run canon:check         # validate the canon, report portrait status
bun run genesis             # render canon into genesis/
bun run check               # everything CI runs
```

## Layout

| Path | Contents |
| --- | --- |
| `canon/` | The story: characters, places, and the owner's device |
| `src/canon/` | Canon schema, derived facts, and continuity rules |
| `src/render/` | Deterministic SVG renderers for documents and avatars |
| `src/export/` | tearleads seed, Google Contacts CSV, and vCard writers |
| `src/genesis/` | Builds `genesis/` and compares it with what is on disk |
| `src/portraits/` | Portrait prompts, provenance, and image generation |
| `src/site/`, `site/` | Static asset gallery builder, stylesheet, and headers |
| `assets/fonts/` | Vendored OFL and Apache fonts, with their licenses |
| `assets/portraits/` | One canonical portrait per character, with provenance |
| `genesis/` | Generated output; never edit it by hand |

## Generated output

| Path | Use |
| --- | --- |
| `genesis/tearleads/seed.json` | tearleads `SeedSpec`: contacts, notes, wallet documents |
| `genesis/tearleads/expectations.json` | Strings tearleads' screenshot run asserts on |
| `genesis/tearleads/*.jpg`, `*.png` | Attachments referenced by `seed.json` |
| `genesis/documents/<id>/` | Every character's license (front and back) and passport |
| `genesis/avatars/<id>.png` | 512 px contact photos |
| `genesis/contacts/contacts.csv` | The owner's address book as a Google Contacts export |
| `genesis/contacts/contacts.vcf` | The same address book as vCard 3.0, with photos |
| `genesis/canon.json` | The canon with derived facts resolved |
| `genesis/manifest.json` | Size and SHA-256 of every generated file |

The JPEGs and CSV are drop-in replacements for tearleads' private
`.test_files/` fixtures, which are real documents.

## The cast

The device owner is Maya Reyes, a product designer in Port Alder, in the
fictional state of Cascadia. Her address book holds her mother Rosa ("Mom"),
husband Daniel, brother Theo, manager Priya, friends Sam and Marcus, and
neighbor Hana. See [docs/canon.md](docs/canon.md) for how the canon is modeled
and maintained.

## Fiction, not forgery

The documents are realistic enough for screenshots and import testing, and
designed so that none of them can pass for a real one:

- Licenses come from Cascadia, a state that does not exist. They follow the
  AAMVA card standard's field numbering but copy no real jurisdiction's design.
- Passports come from Utopia (`UTO`), the specimen state ICAO uses in its own
  examples. Their machine readable zones are computed to the ICAO rules.
- Every document carries a visible `SPECIMEN` mark.
- License barcodes encode a plain-text specimen notice, never AAMVA data.
- Phone numbers use 555-0100 through 555-0199, reserved for fiction, and email
  addresses use domains reserved by RFC 2606. The canon rejects anything else.

## Portraits

Each character has a photographic portrait of a person who does not exist;
until one does, documents use an illustrated placeholder drawn from canon.
`bun run portraits` reports status. The `portrait-fidelity` skill, for Codex and
Claude Code alike, generates, reviews, frames, and adopts portraits, through
OpenAI's image API when `OPENAI_API_KEY` is set and Codex's built-in image
generation otherwise. See [docs/portraits.md](docs/portraits.md).

## Keeping it current

Canon dates are fixed at the story date (`asOf` in `canon/world.ts`), so output
never changes on its own. tearleads, however, compares expiration dates with
the real clock. The weekly Freshness workflow fails 180 days before any
document expires; renew it in canon and regenerate.

## tearleads

See [docs/tearleads.md](docs/tearleads.md) for the seed contract and how
tearleads pins and consumes this repository.

## Asset gallery

[continuity.tearleads.com](https://continuity.tearleads.com) shows the cast,
portraits, specimen documents, notes, and downloads on one scrollable page.
The HTML and every asset response carry `noindex` directives.

```sh
bun run site:dev       # build the gallery and preview it with Wrangler
bun run site:build     # copy verified genesis assets and build dist/index.html
bun run site:deploy    # rebuild and publish the tearleads-continuity Worker
```

Set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` for deployment, or use
Wrangler's authenticated session. The gallery is static HTML and CSS, built
from the committed `genesis/` snapshot; run `bun run check` before publishing.
`src/site/` builds the page and `site/` contains its stylesheet and headers.

The hostname belongs to `terraform/stacks/prod/continuity` in the
[tearleads repository](https://github.com/a2f0/tearleads). For its first setup,
publish the Worker here, then plan and apply the hostname there:

```sh
terraform/scripts/run-continuity-stack.sh plan -out=/path/to/gallery.tfplan
terraform/scripts/run-continuity-stack.sh apply /path/to/gallery.tfplan
```

Later asset deployments need only Wrangler. `workers.dev` and preview URLs
are disabled.

## Development

Repository conventions, validation commands, and shipping rules are in
[AGENTS.md](AGENTS.md). PRs ship with the
[`@a2f0/agent-tool`](https://github.com/a2f0/agent-tool) skills.
