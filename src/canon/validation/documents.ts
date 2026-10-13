import { addYears, compareDates, isIsoDate } from "../dates";
import { documentExpirations } from "../derive";
import type { Character, DriversLicense, Passport, World } from "../types";

const PASSPORT_NUMBER_PATTERN = /^[A-Z0-9]{1,9}$/;

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
  if (
    character.address.region !== jurisdiction.code ||
    character.address.country !== jurisdiction.country
  ) {
    problems.push(
      `${id}: a ${jurisdiction.name} license needs a ${jurisdiction.code}, ${jurisdiction.country} address`,
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
  if (!PASSPORT_NUMBER_PATTERN.test(passport.number)) {
    problems.push(
      `${id}: passport number ${passport.number} must be at most nine letters and digits`,
    );
  }
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

export function checkDocuments(world: World, character: Character): string[] {
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
