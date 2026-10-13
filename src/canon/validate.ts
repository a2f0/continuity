import { addYears, ageOn, compareDates, isIsoDate } from "./dates";
import { documentExpirations, findCharacter, resolveNoteText } from "./derive";
import type {
  Character,
  Device,
  DriversLicense,
  Passport,
  RelationshipKind,
  World,
} from "./types";

// Continuity rules. Each rule returns human-readable problems; an empty list
// means the canon is internally consistent and safe to render.

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// 555-0100 through 555-0199 is the NANP range reserved for fiction.
const PHONE_PATTERN = /^\(\d{3}\) 555-01\d{2}$/;
// RFC 2606 reserves these names for documentation and examples.
const EMAIL_PATTERN =
  /^[a-z0-9._+-]+@(?:(?:[a-z0-9-]+\.)+(?:example|test)|example\.(?:com|net|org))$/;
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/;
const MINIMUM_PARENT_AGE = 14;

const INVERSE_RELATIONSHIP: Readonly<
  Record<RelationshipKind, RelationshipKind>
> = {
  child: "parent",
  coworker: "coworker",
  friend: "friend",
  manager: "report",
  neighbor: "neighbor",
  parent: "child",
  partner: "partner",
  report: "manager",
  sibling: "sibling",
  spouse: "spouse",
};

function duplicates(values: readonly string[]): string[] {
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

function checkIds(world: World): string[] {
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

function checkIdentity(world: World, character: Character): string[] {
  const problems: string[] = [];
  const { id, birthDate } = character;
  if (!isIsoDate(birthDate)) {
    return [`${id}: birth date ${birthDate} is not a calendar date`];
  }
  const age = ageOn(birthDate, world.asOf);
  if (age < 0 || age > 110) {
    problems.push(`${id}: age ${age} on ${world.asOf} is implausible`);
  }
  if (!character.name.given.trim() || !character.name.family.trim()) {
    problems.push(`${id}: given and family names are required`);
  }
  return problems;
}

function checkContactDetails(world: World, character: Character): string[] {
  const { id } = character;
  const regions = new Set(world.jurisdictions.map((item) => item.code));
  return [
    ...character.phones
      .filter((phone) => !PHONE_PATTERN.test(phone.number))
      .map(
        (phone) =>
          `${id}: phone ${phone.number} must be "(NPA) 555-01XX" (reserved for fiction)`,
      ),
    ...character.emails
      .filter((email) => !EMAIL_PATTERN.test(email.address))
      .map(
        (email) =>
          `${id}: email ${email.address} must use a reserved domain such as *.example`,
      ),
    ...(regions.has(character.address.region)
      ? []
      : [
          `${id}: address region ${character.address.region} is not a known jurisdiction`,
        ]),
  ];
}

function checkAppearance(character: Character): string[] {
  const { id, appearance } = character;
  const problems: string[] = [];
  for (const [field, value] of [
    ["skinTone", appearance.skinTone],
    ["hairColor", appearance.hairColor],
    ["clothing", appearance.clothing],
  ] as const) {
    if (!HEX_COLOR_PATTERN.test(value)) {
      problems.push(
        `${id}: appearance.${field} ${value} is not a #rrggbb color`,
      );
    }
  }
  if (appearance.heightCm < 120 || appearance.heightCm > 220) {
    problems.push(`${id}: height ${appearance.heightCm} cm is implausible`);
  }
  if (appearance.weightKg < 30 || appearance.weightKg > 200) {
    problems.push(`${id}: weight ${appearance.weightKg} kg is implausible`);
  }
  return problems;
}

function checkRelationships(world: World, character: Character): string[] {
  const problems: string[] = [];
  for (const relationship of character.relationships) {
    const other = world.characters.find((item) => item.id === relationship.to);
    if (!other || other.id === character.id) {
      problems.push(
        `${character.id}: relationship to unknown character ${relationship.to}`,
      );
      continue;
    }
    const inverse = INVERSE_RELATIONSHIP[relationship.kind];
    const reciprocated = other.relationships.some(
      (item) => item.to === character.id && item.kind === inverse,
    );
    if (!reciprocated) {
      problems.push(
        `${other.id} is ${character.id}'s ${relationship.kind}, so ${other.id} must list ${character.id} as "${inverse}"`,
      );
    }
    if (
      relationship.kind === "parent" &&
      ageOn(other.birthDate, character.birthDate) < MINIMUM_PARENT_AGE
    ) {
      problems.push(`${other.id} is too young to be ${character.id}'s parent`);
    }
  }
  return problems;
}

function checkDriversLicense(
  world: World,
  character: Character,
  license: DriversLicense,
): string[] {
  const { id } = character;
  const jurisdiction = world.jurisdictions.find(
    (item) => item.id === license.jurisdiction,
  );
  if (!jurisdiction) {
    return [`${id}: unknown license jurisdiction ${license.jurisdiction}`];
  }
  if (!isIsoDate(license.issued)) {
    return [
      `${id}: license issue date ${license.issued} is not a calendar date`,
    ];
  }
  const problems: string[] = [];
  if (!new RegExp(jurisdiction.licenseNumberPattern).test(license.number)) {
    problems.push(
      `${id}: license number ${license.number} does not match ${jurisdiction.licenseNumberPattern}`,
    );
  }
  if (!(license.class in jurisdiction.classes)) {
    problems.push(
      `${id}: license class ${license.class} is not issued by ${jurisdiction.id}`,
    );
  }
  for (const [kind, codes, known] of [
    ["endorsement", license.endorsements ?? [], jurisdiction.endorsements],
    ["restriction", license.restrictions ?? [], jurisdiction.restrictions],
  ] as const) {
    for (const code of codes.filter((item) => !(item in known))) {
      problems.push(`${id}: unknown ${kind} code ${code}`);
    }
  }
  const eligible = addYears(character.birthDate, jurisdiction.minimumAge);
  if (compareDates(license.issued, eligible) < 0) {
    problems.push(
      `${id}: license issued before age ${jurisdiction.minimumAge}`,
    );
  }
  if (compareDates(license.issued, world.asOf) > 0) {
    problems.push(`${id}: license issued after the story date ${world.asOf}`);
  }
  if (character.address.region !== jurisdiction.code) {
    problems.push(
      `${id}: a ${jurisdiction.name} license needs a ${jurisdiction.code} address`,
    );
  }
  return problems;
}

function checkPassport(
  world: World,
  character: Character,
  passport: Passport,
): string[] {
  const { id } = character;
  const issuer = world.passportIssuers.find(
    (item) => item.id === passport.issuer,
  );
  if (!issuer) {
    return [`${id}: unknown passport issuer ${passport.issuer}`];
  }
  if (!isIsoDate(passport.issued)) {
    return [
      `${id}: passport issue date ${passport.issued} is not a calendar date`,
    ];
  }
  const problems: string[] = [];
  if (!new RegExp(issuer.numberPattern).test(passport.number)) {
    problems.push(
      `${id}: passport number ${passport.number} does not match ${issuer.numberPattern}`,
    );
  }
  if (compareDates(passport.issued, character.birthDate) < 0) {
    problems.push(`${id}: passport issued before birth`);
  }
  if (compareDates(passport.issued, world.asOf) > 0) {
    problems.push(`${id}: passport issued after the story date ${world.asOf}`);
  }
  return problems;
}

function checkDocuments(world: World, character: Character): string[] {
  const { driversLicense, passport } = character.documents;
  const problems = [
    ...(driversLicense
      ? checkDriversLicense(world, character, driversLicense)
      : []),
    ...(passport ? checkPassport(world, character, passport) : []),
  ];
  if (problems.length > 0) {
    return problems;
  }
  return documentExpirations(world, character)
    .filter((item) => compareDates(item.expires, world.asOf) <= 0)
    .map(
      (item) => `${item.label} expired on ${item.expires}; renew it in canon`,
    );
}

function checkUniqueDocumentNumbers(world: World): string[] {
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

function checkDevice(world: World, device: Device): string[] {
  const problems: string[] = [];
  const ids = new Set(world.characters.map((character) => character.id));
  if (!ids.has(device.owner)) {
    return [`device owner ${device.owner} is not a character`];
  }
  const owner = findCharacter(world, device.owner);
  for (const entry of device.addressBook) {
    if (!ids.has(entry.character) || entry.character === device.owner) {
      problems.push(
        `address book entry ${entry.character} is not another character`,
      );
    }
  }
  problems.push(
    ...duplicates(device.addressBook.map((entry) => entry.character)).map(
      (id) => `address book lists ${id} more than once`,
    ),
  );
  if (device.tearleads.identitySeedPhrase.trim().split(/\s+/).length !== 24) {
    problems.push("the tearleads identity seed phrase must have 24 words");
  }
  if (
    device.wallet.includes("drivers_license") &&
    !owner.documents.driversLicense
  ) {
    problems.push(
      `the wallet lists a driver's license ${owner.id} does not hold`,
    );
  }
  if (device.wallet.includes("passport") && !owner.documents.passport) {
    problems.push(`the wallet lists a passport ${owner.id} does not hold`);
  }
  return problems;
}

function checkNotes(world: World): string[] {
  return world.device.notes.flatMap((note) => {
    try {
      return resolveNoteText(world, note).trim()
        ? []
        : [`note ${note.id} is empty`];
    } catch (error) {
      return [`note ${note.id}: ${(error as Error).message}`];
    }
  });
}

export function validateWorld(world: World): readonly string[] {
  if (!isIsoDate(world.asOf)) {
    return [`story date ${world.asOf} is not a calendar date`];
  }
  return [
    ...checkIds(world),
    ...world.characters.flatMap((character) => [
      ...checkIdentity(world, character),
      ...checkContactDetails(world, character),
      ...checkAppearance(character),
      ...checkRelationships(world, character),
      ...checkDocuments(world, character),
    ]),
    ...checkUniqueDocumentNumbers(world),
    ...checkDevice(world, world.device),
    ...checkNotes(world),
  ];
}
