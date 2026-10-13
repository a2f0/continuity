# tearleads integration

tearleads' screenshot run restores an encrypted backup built from a seed
specification. Building the backup needs tearleads' client SDK and schema, so
it stays in tearleads; this repository supplies the specification and its
attachments.

## Contract

`genesis/tearleads/seed.json` matches `SeedSpec` in tearleads'
`packages/app/test/screenshot-seed/seedTypes.ts`:

- `password` and `identitySeedPhrase`: the backup password and the BIP39 phrase
  the seeded identity is derived from. Both come from
  `canon/device/device.ts`.
- `contacts`: the owner's address book as `firstName`, `lastName`, and
  `nickname` fields.
- `notes`: the owner's notes.
- `files`: the owner's `drivers_license` (slots `front` and `back`) and
  `passport` (slot `passport-image`), with the fields tearleads defines.

Attachment `file` values are names beside `seed.json`. Each contact also
carries an `avatar` attachment that today's seeder ignores, until it learns the
`contact-avatar` slot.

`genesis/tearleads/expectations.json` lists the strings the screenshot run
asserts on: a contact's display name, the first note's title and body line,
and the license and passport titles with their image counts.

## Verified

tearleads' own `buildSeedArtifact` builds a backup from this output unchanged
(140 rows and 3 blobs at tearleads `a9f4ba2d2`): the license front and back,
and the passport image.

## Adopting it in tearleads

1. Pin this repository by commit, as tearleads pins agent-tool:

   ```json
   {
     "devDependencies": {
       "@a2f0/continuity": "github:a2f0/continuity#<full-commit-sha>"
     }
   }
   ```

   Bun records the commit and integrity in `bun.lock`, and no binary file
   enters tearleads' repository.

2. Point `buildScreenshotSeed.ts` at the package instead of its local fixtures:

   ```ts
   const SPEC_PATH = Bun.resolveSync(
     "@a2f0/continuity/genesis/tearleads/seed.json",
     import.meta.dir,
   );
   const FIXTURES_DIR = dirname(SPEC_PATH);
   ```

   Then delete `fixtures/seed.json` and the two SVG license fixtures.

3. In `packages/app-web/screenshots/capture.spec.ts`, read the asserted
   strings from `@a2f0/continuity/genesis/tearleads/expectations.json`
   instead of hard-coding "Alan Turing", "Meeting notes", and
   "Driver's License S123-4567-8901".

4. Optionally teach `buildSeedArtifact` to attach `contact.avatar` to the
   `contact-avatar` slot, and add the passport to the screenshot captures.

5. Replace the private `.test_files/` documents with
   `genesis/documents/maya-reyes/*.jpg` and `genesis/contacts/contacts.csv`.

To update, move the pin to a newer commit and run `bun install`.
