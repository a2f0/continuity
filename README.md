# continuity

Canonical fictional characters, and the genesis data rendered from them:
driver's licenses, passports, birth certificates, credit cards, contact cards,
avatars, family photos, household inventory, health trackers, and notes that
seed
[tearleads](https://github.com/a2f0/tearleads) for screenshots, demos, and
import testing. The asset gallery is available at
[continuity.tearleads.com](https://continuity.tearleads.com). See
[Asset gallery](#asset-gallery).

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
bun run hooks:install
bun x --no-install playwright install --with-deps chromium

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
| `assets/brand/` | The logo SVG that the gallery's favicons are rendered from |
| `assets/fonts/` | Vendored OFL and Apache fonts, with their licenses |
| `assets/portraits/` | One canonical portrait per character, with provenance |
| `assets/household/` | Family and equipment photos, with generation provenance |
| `genesis/` | Generated output; never edit it by hand |

## Generated output

| Path | Use |
| --- | --- |
| `genesis/tearleads/seed.json` | tearleads `SeedSpec`: contacts, notes, wallet documents |
| `genesis/tearleads/expectations.json` | Strings tearleads' screenshot run asserts on |
| `genesis/tearleads/*.jpg`, `*.png` | Attachments referenced by `seed.json` |
| `genesis/documents/<id>/` | Character documents: licenses, passports, birth certificates, and credit cards |
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

The documents use realistic layouts for screenshots and import testing, with
fictional people, issuers, and data. They render without specimen watermarks.

- Licenses come from Cascadia, a state that does not exist. They follow the
  AAMVA card standard's field numbering but copy no real jurisdiction's design.
- Passports come from Utopia (`UTO`), the specimen state ICAO uses in its own
  examples. Their machine readable zones are computed to the ICAO rules.
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

See [gallery deployment](docs/deployment.md) for credentials, hostname ownership,
publication, and live verification. CI does not deploy the gallery.

## Development

Repository conventions, validation commands, and shipping rules are in
[AGENTS.md](AGENTS.md), with shared tooling and hook setup in
[development](docs/development.md). PRs ship with the
[`@a2f0/agent-tool`](https://github.com/a2f0/agent-tool) skills.
See [dependency maintenance](docs/dependency-upgrades.md) for upgrade checks
and active compatibility constraints.
