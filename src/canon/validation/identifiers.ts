import type { World } from "../types";

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISSUER_CODE_PATTERN = /^[A-Z]{3}$/;
const JURISDICTION_CODE_PATTERN = /^[A-Z]{2}$/;

export function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      repeated.add(value);
    }
    seen.add(value);
  }
  return [...repeated];
}

export function checkIds(world: World): string[] {
  const groups: [string, readonly string[]][] = [
    ["character", world.characters.map((character) => character.id)],
    ["jurisdiction", world.jurisdictions.map((item) => item.id)],
    ["passport issuer", world.passportIssuers.map((item) => item.id)],
    ["note", world.device.notes.map((note) => note.id)],
  ];
  return groups.flatMap(([kind, ids]) => [
    ...ids
      .filter((id) => !ID_PATTERN.test(id))
      .map((id) => `${kind} ID "${id}" is not kebab-case`),
    ...duplicates(ids).map((id) => `${kind} ID "${id}" is used more than once`),
  ]);
}

export function checkIssuers(world: World): string[] {
  return [
    ...world.jurisdictions
      .filter((item) => !JURISDICTION_CODE_PATTERN.test(item.code))
      .map(
        (item) =>
          `jurisdiction ${item.id} code ${item.code} must be two capital letters`,
      ),
    ...world.passportIssuers
      .filter((item) => !ISSUER_CODE_PATTERN.test(item.code))
      .map(
        (item) =>
          `passport issuer ${item.id} code ${item.code} must be three capital letters`,
      ),
  ];
}

export function checkUniqueDocumentNumbers(world: World): string[] {
  const licenses = world.characters.flatMap((character) => {
    const license = character.documents.driversLicense;
    return license ? [license] : [];
  });
  const passports = world.characters.flatMap((character) => {
    const passport = character.documents.passport;
    return passport ? [passport.number] : [];
  });
  return [
    ...duplicates(licenses.map((item) => item.number)).map(
      (number) => `license number ${number} is used more than once`,
    ),
    ...duplicates(licenses.map((item) => item.documentDiscriminator)).map(
      (dd) => `document discriminator ${dd} is used more than once`,
    ),
    ...duplicates(passports).map(
      (number) => `passport number ${number} is used more than once`,
    ),
    ...duplicates(
      world.characters.flatMap((character) =>
        character.phones.map((phone) => phone.number),
      ),
    ).map((number) => `phone number ${number} is used more than once`),
  ];
}
