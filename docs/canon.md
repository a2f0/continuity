# Canon

The canon is the story's ground truth: who exists, what is true about them,
and what the owner's device holds. Everything in `genesis/` is rendered from
it, and `bun run canon:check` enforces its continuity rules.

## Model

| File | Holds |
| --- | --- |
| `canon/world.ts` | The story date (`asOf`) and the list of everything below |
| `canon/characters/*.ts` | One `Character` per person |
| `canon/places/*.ts` | Fictional issuers: a `Jurisdiction` or `PassportIssuer` |
| `canon/device/device.ts` | The owner, address book, wallet, and tearleads identity |
| `canon/device/notes.ts` | The owner's notes |

The schema lives in `src/canon/types.ts`. Canon stores facts, and
`src/canon/derive.ts` computes everything that follows from them:

- ages, as of the story date;
- license expiration: the holder's birthday, `renewalYears` after issue;
- passport expiration: the day before the anniversary of issue;
- the machine readable zone, display names, height and weight formats.

Storing a derived value would let it drift, so the schema has no field for one.

## Continuity rules

`validateWorld` in `src/canon/validate.ts` rejects canon that is not
internally consistent:

- IDs are unique and kebab-case.
- Every relationship is reciprocated with its inverse (`parent` and `child`,
  `manager` and `report`, and so on), and parents are at least 14 years older
  than their children.
- Phone numbers are in the 555-0100 to 555-0199 range and email addresses use
  reserved domains.
- Licenses match their jurisdiction's number pattern, classes, and codes, were
  issued after driving age, and belong to a resident of that jurisdiction.
- Documents were issued before the story date and have not expired on it.
- License numbers, document discriminators, passport numbers, and phone
  numbers are unique.
- The address book lists only other characters, and the wallet lists only
  documents the owner holds.

## Common changes

### Add a character

1. Create `canon/characters/<camelCaseId>.ts` exporting a `Character` with a
   new kebab-case `id`.
2. Add reciprocal relationships on both sides.
3. Add it to `canon/world.ts`, and to the address book if the owner knows them.
4. Run `bun run canon:check`, then `bun run portraits generate <id>` (or
   import a portrait), then `bun run genesis`.

### Renew a document

When the Freshness workflow fails, or the story moves on:

1. Set a new `issued` date. For a license, also give it a new
   `documentDiscriminator`; real agencies issue one per card.
2. Advance `asOf` in `canon/world.ts` if the story date should move too.
3. Run `bun run genesis`.

Renewing is also a good moment to refresh a portrait: an aged character's
prompt changes at each decade boundary (`early`, `mid`, `late`), which marks
the portrait stale.

### Change what the device holds

Edit `canon/device/device.ts` or `canon/device/notes.ts`. The first note, and
the first address book entry without a nickname, are the ones tearleads'
screenshot run asserts on; `genesis/tearleads/expectations.json` records them,
so tearleads can read them instead of hard-coding strings.

### Write notes that stay true

A note's `text` can be a function of a `CanonContext`. The gift list in
`canon/device/notes.ts` reads birthdays from the characters, so changing a
birthday changes the note with it.

## Places

Cascadia (`CS`) is a fictional Pacific Northwest state with an original seal,
palette, and numbering scheme. Utopia (`UTO`) is the specimen state from ICAO
Doc 9303. New issuers must be equally fictional: invent the name, seal, and
design, and never model a real jurisdiction's.
