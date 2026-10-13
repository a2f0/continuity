import {
  ageAsOf,
  driversLicenseExpiration,
  findJurisdiction,
  findPassportIssuer,
  firstName,
  legalName,
  passportExpiration,
} from "../canon/derive";
import type { Character, World } from "../canon/types";
import { loadPortrait } from "../render/portrait";

// canon.json: the canon with every derived fact resolved, for consumers that
// want character data without running TypeScript from this repository.

export interface CharacterFiles {
  readonly avatar: string;
  readonly driversLicenseFront?: string;
  readonly driversLicenseBack?: string;
  readonly passport?: string;
}

function documents(world: World, character: Character) {
  const { driversLicense, passport } = character.documents;
  return {
    ...(driversLicense
      ? {
          driversLicense: {
            ...driversLicense,
            expires: driversLicenseExpiration(
              character,
              driversLicense,
              findJurisdiction(world, driversLicense.jurisdiction),
            ),
          },
        }
      : {}),
    ...(passport
      ? {
          passport: {
            ...passport,
            expires: passportExpiration(
              passport,
              findPassportIssuer(world, passport.issuer),
            ),
          },
        }
      : {}),
  };
}

export function canonSnapshot(
  world: World,
  files: ReadonlyMap<string, CharacterFiles>,
): unknown {
  return {
    asOf: world.asOf,
    owner: world.device.owner,
    characters: world.characters.map((character) => {
      const {
        appearance,
        signature: _signature,
        documents: _documents,
        ...facts
      } = character;
      return {
        ...facts,
        age: ageAsOf(world, character),
        displayName: `${firstName(character)} ${character.name.family}`,
        legalName: legalName(character),
        appearance: {
          description: appearance.description,
          eyes: appearance.eyes,
          hair: appearance.hair,
          heightCm: appearance.heightCm,
          weightKg: appearance.weightKg,
        },
        documents: documents(world, character),
        portrait: loadPortrait(character).source,
        files: files.get(character.id),
      };
    }),
    jurisdictions: world.jurisdictions,
    passportIssuers: world.passportIssuers,
  };
}
