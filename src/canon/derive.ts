import { addDays, addYears, ageOn, birthdayIn, yearOf } from "./dates";
import type {
  Character,
  DriversLicense,
  IsoDate,
  Jurisdiction,
  Note,
  Passport,
  PassportIssuer,
  World,
} from "./types";

// Facts computed from canon rather than stored in it.

export function findCharacter(world: World, id: string): Character {
  const character = world.characters.find((candidate) => candidate.id === id);
  if (!character) {
    throw new Error(`Unknown character: ${id}`);
  }
  return character;
}

export function findJurisdiction(world: World, id: string): Jurisdiction {
  const jurisdiction = world.jurisdictions.find(
    (candidate) => candidate.id === id,
  );
  if (!jurisdiction) {
    throw new Error(`Unknown jurisdiction: ${id}`);
  }
  return jurisdiction;
}

export function findPassportIssuer(world: World, id: string): PassportIssuer {
  const issuer = world.passportIssuers.find((candidate) => candidate.id === id);
  if (!issuer) {
    throw new Error(`Unknown passport issuer: ${id}`);
  }
  return issuer;
}

/** A note's text, resolving canon references in computed notes. */
export function resolveNoteText(world: World, note: Note): string {
  if (typeof note.text === "string") {
    return note.text;
  }
  return note.text({ character: (id) => findCharacter(world, id) });
}

/** The first name an address book stores. */
export function firstName(character: Character): string {
  return character.name.preferred ?? character.name.given;
}

/** Given and middle names, as printed on identity documents. */
export function givenNames(character: Character): string {
  const { given, middle } = character.name;
  return middle ? `${given} ${middle}` : given;
}

export function legalName(character: Character): string {
  return `${givenNames(character)} ${character.name.family}`;
}

export function signatureText(character: Character): string {
  return (
    character.signature.text ??
    `${character.name.given} ${character.name.family}`
  );
}

export function ageAsOf(world: World, character: Character): number {
  return ageOn(character.birthDate, world.asOf);
}

/** Licenses expire on the holder's birthday `renewalYears` after issue. */
export function driversLicenseExpiration(
  character: Character,
  license: DriversLicense,
  jurisdiction: Jurisdiction,
): IsoDate {
  return birthdayIn(
    character.birthDate,
    yearOf(license.issued) + jurisdiction.renewalYears,
  );
}

/** Passports expire the day before the anniversary of issue. */
export function passportExpiration(
  passport: Passport,
  issuer: PassportIssuer,
): IsoDate {
  return addDays(addYears(passport.issued, issuer.validityYears), -1);
}

/** 5'-05", as printed in AAMVA field 16. */
export function formatHeight(heightCm: number): string {
  const totalInches = Math.round(heightCm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'-${String(inches).padStart(2, "0")}"`;
}

export function formatWeightPounds(weightKg: number): string {
  return `${Math.round(weightKg * 2.20462)} lb`;
}

/** Every dated document a character holds, for validity checks. */
export function documentExpirations(
  world: World,
  character: Character,
): readonly { readonly label: string; readonly expires: IsoDate }[] {
  const expirations: { label: string; expires: IsoDate }[] = [];
  const { driversLicense, passport } = character.documents;
  if (driversLicense) {
    expirations.push({
      expires: driversLicenseExpiration(
        character,
        driversLicense,
        findJurisdiction(world, driversLicense.jurisdiction),
      ),
      label: `${character.id} driver's license ${driversLicense.number}`,
    });
  }
  if (passport) {
    expirations.push({
      expires: passportExpiration(
        passport,
        findPassportIssuer(world, passport.issuer),
      ),
      label: `${character.id} passport ${passport.number}`,
    });
  }
  return expirations;
}
