# tearleads integration

tearleads' screenshot run restores an encrypted backup built from a seed
specification. Building the backup needs tearleads' client SDK and schema, so
it stays in tearleads; this repository supplies the specification and its
attachments.

## Contract

`genesis/tearleads/seed.json` matches `SeedSpec` in tearleads'
`packages/app/test/screenshot-seed/seedTypes.ts`:

- `password` and `identitySeedPhrase`: the backup password and the BIP39 phrase
  the seeded identity is derived from. Both come from `canon/device/device.ts`.
- `contacts`: the owner's address book as `firstName`, `lastName`, and
  `nickname` fields, with an `avatar` attachment for the `contact-avatar` slot.
- `notes`: the owner's notes.
- `files`: the owner's wallet documents, with the fields tearleads defines.

| Kind | Attachment slots |
| --- | --- |
| `drivers_license` | `front`, `back` (resolved by the seeder) |
| `passport` | `passport-image` |
| `birth_certificate` | `birth-certificate-image` |
| `credit_card` | `credit-card-front-image`, `credit-card-back-image` |

Attachment `file` values are names beside `seed.json`. Birth certificates
resolve the holder's name, birth date, birthplace, and parent names from canon.
Credit cards resolve the cardholder name and expiration month from canon;
their non-payment numbers start with `0000` and the specimen CVV is `000`.

`genesis/tearleads/expectations.json` lists the strings the screenshot run
asserts on: a contact's display name, the first note's title and body line,
and each wallet document's title and image count. Optional wallet kinds are
omitted when the device does not select them.

## Adopting it in tearleads

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
