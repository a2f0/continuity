import {
  ageAsOf,
  driversLicenseExpiration,
  findJurisdiction,
  findPassportIssuer,
  firstName,
  legalName,
  passportExpiration,
} from "../canon/derive";
import {
  birthCertificateFields,
  creditCardFields,
} from "../canon/documentFields";
import type { Character, World } from "../canon/types";
import type { CharacterAssets } from "./characters";

// canon.json: the canon with every derived fact resolved, for consumers that
// want character data without running TypeScript from this repository.

function documents(world: World, character: Character) {
  const { driversLicense, passport, birthCertificate, creditCard } =
    character.documents;
  return {
    ...(birthCertificate
      ? {
          birthCertificate: birthCertificateFields(
            world,
            character,
            birthCertificate,
          ),
        }
      : {}),
    ...(creditCard
      ? { creditCard: creditCardFields(character, creditCard) }
      : {}),
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
  assets: ReadonlyMap<string, CharacterAssets>,
) {
  return {
    asOf: world.asOf,
    owner: world.device.owner,
    characters: world.characters.map((character) => {
      const rendered = assets.get(character.id);
      if (!rendered) {
        throw new Error(`Missing rendered assets for ${character.id}`);
      }
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
        portrait: rendered.portrait,
        files: rendered.files,
      };
    }),
    jurisdictions: world.jurisdictions,
    passportIssuers: world.passportIssuers,
  };
}
