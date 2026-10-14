# tearleads integration

tearleads' screenshot run restores an encrypted backup built from a seed
specification. Building the backup needs tearleads' client SDK and schema, so
it stays in tearleads; this repository supplies the specification and its
attachments.

## Contract

`genesis/tearleads/seed.json` matches `SeedSpec` in tearleads'
`packages/app/test/screenshot-seed/seedTypes.ts`:

- `schemaVersion`: currently `2`; consumers must reject unsupported versions.
- `password` and `identitySeedPhrase`: the backup password and the BIP39 phrase
  the seeded identity is derived from. Both come from `canon/device/device.ts`.
- `contacts`: the owner's address book as `firstName`, `lastName`, and
  `nickname` fields, with an `avatar` attachment for the `contact-avatar` slot.
- `notes`: the owner's notes.
- `files`: wallet documents, family photos, two Alderforge tools, two Hearthmere
  appliances, and Maya's weight and blood pressure trackers. Tracker `rows` are
  first-class row fields; weights carry their own units and every measurement
  has an explicit time zone.

| Kind | Attachment slots |
| --- | --- |
| `drivers_license` | `front`, `back` (resolved by the seeder) |
| `passport` | `passport-image` |
| `birth_certificate` | `birth-certificate-image` |
| `credit_card` | `credit-card-front-image`, `credit-card-back-image` |
| `tool`, `appliance` | `equipment-photos` (repeatable), `receipt-image` |
| `image` | Unslotted attachment |

Attachment `file` values are names beside `seed.json`. Household photos use
`household-<id>.jpg` names to avoid collisions with wallet images. Birth
certificates
resolve the holder's name, birth date, birthplace, and parent names from canon.
Credit cards resolve the cardholder name and expiration month from canon;
their non-payment numbers start with `0000` and the specimen CVV is `000`.

`genesis/tearleads/expectations.json` lists the strings the screenshot run
asserts on: a contact's display name, the first note's title and body line,
and each wallet document's title and image count. Optional wallet kinds are
omitted when the device does not select them.

## Household photos and checks

`canon/device/household.ts` owns the family photo metadata, fictional equipment
brands and identifiers, and tracker readings. `assets/household/` holds reviewed
photorealistic JPEGs and JSON provenance with the exact prompt, generation
model,
generation date, image and prompt SHA-256 hashes, and reference portrait hashes.
Detail photos also bind their source equipment image. Edited images retain
the previous generation prompt and image hash in `previousGeneration`.
These images were generated with Codex's built-in image tool; family
photos use the existing fictional portraits as face references. Regeneration
verifies these hashes and reference portraits, then derives image sizes before
constructing the seed; it never calls an image service.

The drill has two photos in the same logical `equipment-photos` slot. Tearleads
must append a distinct physical slot for each photo, preserving independent
replace/remove behavior. Its existing `receipt-image` slot remains separate.

Canon validation rejects invalid dates, unknown people, duplicate IDs/serials,
and invalid measurements. Genesis rejects missing, edited, or undersized photos.
The manifest covers seed JSON, expectations, and every image. Consumers verify
these hashes before building a backup and check restored rows and image counts.
Expectations include every household image and inventory item plus the tracker
rows, so screenshots can assert visible fields and plotted points.

## Adopting it in tearleads

Schema version 2 requires the coordinated Tearleads consumer update: row
creation, repeatable equipment slots, integrity verification, and household
screenshot assertions. Older consumers cannot safely adopt this version.
The coordinated consumer
([Tearleads integration](https://github.com/a2f0/tearleads)) must demonstrate
a fresh encrypted restore with 24 blobs. Before shipping that consumer, run
its fresh-restore contract test and browser captures against the merged pin.

Update the commit pin for `@a2f0/continuity` in tearleads' root `package.json`
catalog and run `bun install`. Bun records the commit in `bun.lock`; rendered
specimens remain in this package instead of being copied into tearleads' Git
history.

The seeder reads `genesis/tearleads/seed.json` through package resolution and
loads attachments relative to that file. Its `continuitySeed.test.ts` contract
test checks document titles and image counts through the real SDK and encrypted
backup path. The capture runner reads `expectations.json` and waits for the
restored images to decode.

Run `bun run build:website` in tearleads to regenerate the backup, capture the
app, and stage the screenshots into the website. When adding a wallet kind,
register its projector and editor in tearleads before adopting the new pin,
and add its detail view to the screenshot capture and website gallery.

Each seeded equipment item also has a photorealistic purchase receipt in its
`receipt-image` slot. Canon owns the fictional merchant, date, receipt number,
and integer-cent amounts. Receipt sidecars bind those facts and the item's
make, model, and serial number with `receiptSha256`; changing them requires
regenerating and visually checking the receipt text.
Use `receiptFactsHash(item)` from
`src/genesis/householdFacts.ts` to compute the fingerprint. Product photos also
bind equipment type, make, model, and serial through `equipmentFactsHash(item)`
and the sidecar's `equipmentSha256`. Both functions hash explicit ordered field
lists, so reordering object keys does not invalidate a current image.
Receipts use the same
image integrity checks as household photos and have no specimen watermark.
