# tearleads integration

tearleads loads a seed specification into an account with its `tearleads
seed` command, and its screenshot run seeds a fixture account the same way.
Writing documents and organization groups needs tearleads' client SDK, so that
stays in tearleads; this repository supplies the specification and its
attachments.

## Contract

`genesis/tearleads/seed.json` matches `SeedSpec` in tearleads'
`packages/app/src/document-types/continuity/seedTypes.ts`:

- `schemaVersion`: currently `3`; consumers must reject unsupported versions.
- `identitySeedPhrase`: the BIP39 phrase of the fixture account tearleads'
  screenshot run seeds and signs in as. It comes from `canon/device/device.ts`.
  Version 3 dropped version 2's backup `password`.
- `contacts`: the owner's address book as `firstName`, `lastName`, and
  `nickname` fields, with an `avatar` attachment for the `contact-avatar` slot.
  Each contact's `id` is its canon character ID, stable across versions.
- `notes`: the owner's notes.
- `files`: wallet documents, family photos, two Alderforge tools, two Hearthmere
  appliances, Maya's weight and blood pressure trackers, and her passcodes.
  Tracker `rows` are first-class row fields; weights carry their own units and
  every measurement has an explicit time zone. Passcode fields are tearleads'
  `title`, `username`, `password`, `url`, `notes`, and comma-joined `tags`,
  with blank ones left out; each extra attribute is a row of `name`, `value`,
  and `protected: "true"` when it is masked.
- `groups`: organization groups, each a `name` and the contact `id`s of its
  `members`. One group exists per label in the device's `tearleads.groups`,
  holding everyone saved with that label; today that is `Family` with Maya's
  mother, husband, and brother. tearleads gives each member an account, adds
  them to the owner's roster, and then to the group.
- `folders`: folders tearleads creates under the owner's root, from
  `tearleads.folders` in `canon/device/folders.ts`. Each `grants` a group
  `read` or `write` access and holds `notes`. A note's `text` is the owner's;
  each of its `additions` is a line a group member (by contact `id`) appends
  as themselves, in order, so the note has several authors. Today a `Family`
  folder that the Family group can write holds Maya's Thanksgiving plan, with
  a line each from Rosa, Daniel, and Theo. Canon validation lets only members
  of a group that can write add to a folder's notes.

| Kind | Attachment slots |
| --- | --- |
| `drivers_license` | `front`, `back` (resolved by the seeder) |
| `passport` | `passport-image` |
| `birth_certificate` | `birth-certificate-image` |
| `credit_card` | `credit-card-front-image`, `credit-card-back-image` |
| `tool`, `appliance` | `equipment-photos` (repeatable), `receipt-image` |
| `image` | Unslotted attachment |
| `passcode` | None |

An attachment with `avatar: true` is the photo the document shows as its
avatar. Each tool and appliance marks its first `equipment-photos` photo; the
seeder points the document's `avatarPhotoSlotId` field at that photo's slot.

Attachment `file` values are names beside `seed.json`. Household photos use
`household-<id>.jpg` names to avoid collisions with wallet images. Birth
certificates
resolve the holder's name, birth date, birthplace, and parent names from canon.
Credit cards resolve the cardholder name and expiration month from canon;
their non-payment numbers start with `0000` and the specimen CVV is `000`.

`genesis/tearleads/expectations.json` lists the strings the screenshot run
asserts on: a contact's display name, the first note's title and body line,
each wallet document's title and image count, and each group's name with its
members' roster names (`firstName lastName`). Optional wallet kinds are
omitted when the device does not select them. Each passcode lists its title,
fields, and attribute count; each tool and appliance names its `avatar` file;
and each folder lists its grants and, per note, its title, the full text once
every addition is in, and the roster names of the members who add to it.

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
these hashes before writing any document and check the written rows and image
counts.
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
test checks document titles and image counts against `expectations.json`, and
the CLI's seed tests read every document back from a fresh device. The capture
runner reads `expectations.json` and waits for the synced images to decode.

Run `bun run build:website` in tearleads to seed the capture accounts, capture
the app, and stage the screenshots into the website. When adding a wallet kind,
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

Generated document artwork omits visible specimen marks and demo disclaimers.
Fictional issuers, non-payment card numbers, and reserved contact data remain
part of canon. `documentMarkings.test.ts` guards all six document faces against
visible specimen text returning.
