import {
  driversLicenseExpiration,
  findCharacter,
  findJurisdiction,
  findPassportIssuer,
  firstName,
  legalName,
  passportExpiration,
  resolveNoteText,
} from "../canon/derive";
import {
  birthCertificateFields,
  creditCardFields,
} from "../canon/documentFields";
import type { World } from "../canon/types";
import { householdExpectations, householdFiles } from "./householdSeed";

// The seed tearleads' screenshot run restores. Its shape is tearleads'
// SeedSpec (packages/app/test/screenshot-seed/seedTypes.ts); attachment paths
// are file names beside seed.json. Contact avatars use the "contact-avatar"
// slot when the tearleads seeder restores the address book.

interface SeedAttachment {
  readonly file: string;
  readonly mimeType: string;
  readonly slot?: string;
}

interface SeedContact {
  readonly fields: {
    readonly firstName: string;
    readonly lastName: string;
    readonly nickname?: string;
  };
  readonly avatar?: SeedAttachment;
}

export interface SeedFile {
  readonly kind: string;
  readonly fields: Readonly<Record<string, string>>;
  readonly attachments: readonly SeedAttachment[];
  readonly rows?: readonly Readonly<Record<string, string>>[];
}

export interface SeedSpec {
  readonly schemaVersion: 2;
  readonly password: string;
  readonly identitySeedPhrase: string;
  readonly contacts: readonly SeedContact[];
  readonly notes: readonly { readonly text: string }[];
  readonly files: readonly SeedFile[];
}

/** Strings tearleads' screenshot run asserts on after restoring the seed. */
export interface SeedExpectations
  extends ReturnType<typeof householdExpectations> {
  readonly schemaVersion: 2;
  readonly contact: { readonly displayName: string };
  readonly note: { readonly title: string; readonly bodyLine: string };
  readonly driversLicense?: {
    readonly title: string;
    readonly imageCount: number;
  };
  readonly passport?: { readonly title: string; readonly imageCount: number };
  readonly birthCertificate?: {
    readonly title: string;
    readonly imageCount: number;
  };
  readonly creditCard?: { readonly title: string; readonly imageCount: number };
}

export const TEARLEADS_FILES = {
  avatar: (characterId: string) => `avatar-${characterId}.png`,
  driversLicenseBack: "drivers-license-back.jpg",
  driversLicenseFront: "drivers-license-front.jpg",
  passport: "passport.jpg",
  birthCertificate: "birth-certificate.jpg",
  creditCardFront: "credit-card-front.jpg",
  creditCardBack: "credit-card-back.jpg",
} as const;

function walletFiles(world: World): SeedFile[] {
  const owner = findCharacter(world, world.device.owner);
  const files: SeedFile[] = [];
  const license = owner.documents.driversLicense;
  if (world.device.wallet.includes("drivers_license") && license) {
    const jurisdiction = findJurisdiction(world, license.jurisdiction);
    files.push({
      attachments: [
        {
          file: TEARLEADS_FILES.driversLicenseFront,
          mimeType: "image/jpeg",
          slot: "front",
        },
        {
          file: TEARLEADS_FILES.driversLicenseBack,
          mimeType: "image/jpeg",
          slot: "back",
        },
      ],
      fields: {
        expirationDate: driversLicenseExpiration(owner, license, jurisdiction),
        licenseId: license.number,
      },
      kind: "drivers_license",
    });
  }
  const passport = owner.documents.passport;
  if (world.device.wallet.includes("passport") && passport) {
    const issuer = findPassportIssuer(world, passport.issuer);
    files.push({
      attachments: [
        {
          file: TEARLEADS_FILES.passport,
          mimeType: "image/jpeg",
          slot: "passport-image",
        },
      ],
      fields: {
        expirationDate: passportExpiration(passport, issuer),
        fullName: legalName(owner),
        issuingCountry: issuer.name,
        passportNumber: passport.number,
      },
      kind: "passport",
    });
  }
  const { birthCertificate, creditCard } = owner.documents;
  if (world.device.wallet.includes("birth_certificate") && birthCertificate) {
    files.push({
      kind: "birth_certificate",
      fields: birthCertificateFields(world, owner, birthCertificate),
      attachments: [
        {
          file: TEARLEADS_FILES.birthCertificate,
          mimeType: "image/jpeg",
          slot: "birth-certificate-image",
        },
      ],
    });
  }
  if (world.device.wallet.includes("credit_card") && creditCard) {
    files.push({
      kind: "credit_card",
      fields: creditCardFields(owner, creditCard),
      attachments: [
        {
          file: TEARLEADS_FILES.creditCardFront,
          mimeType: "image/jpeg",
          slot: "credit-card-front-image",
        },
        {
          file: TEARLEADS_FILES.creditCardBack,
          mimeType: "image/jpeg",
          slot: "credit-card-back-image",
        },
      ],
    });
  }
  return files;
}

export function buildTearleadsSeed(world: World): SeedSpec {
  const { device } = world;
  return {
    schemaVersion: 2,
    contacts: device.addressBook.map((entry) => {
      const character = findCharacter(world, entry.character);
      return {
        avatar: {
          file: TEARLEADS_FILES.avatar(character.id),
          mimeType: "image/png",
        },
        fields: {
          firstName: firstName(character),
          lastName: character.name.family,
          ...(entry.nickname ? { nickname: entry.nickname } : {}),
        },
      };
    }),
    files: [...walletFiles(world), ...householdFiles(world)],
    identitySeedPhrase: device.tearleads.identitySeedPhrase,
    notes: device.notes.map((note) => ({ text: resolveNoteText(world, note) })),
    password: device.tearleads.backupPassword,
  };
}

export function buildSeedExpectations(seed: SeedSpec): SeedExpectations {
  const contact = seed.contacts.find((item) => !item.fields.nickname);
  const [noteText] = seed.notes.map((note) => note.text);
  if (!contact || !noteText) {
    throw new Error(
      "The seed needs a contact without a nickname and at least one note.",
    );
  }
  const [title = "", bodyLine = ""] = noteText.split("\n");
  const imageTitle = (kind: string, prefix: string, field: string) => {
    const file = seed.files.find((item) => item.kind === kind);
    return file
      ? {
          imageCount: file.attachments.length,
          title: `${prefix} ${file.fields[field] ?? ""}`,
        }
      : undefined;
  };
  const driversLicense = imageTitle(
    "drivers_license",
    "Driver's License",
    "licenseId",
  );
  const passport = imageTitle("passport", "Passport", "passportNumber");
  const birthCertificate = imageTitle(
    "birth_certificate",
    "Birth Certificate",
    "fullName",
  );
  const card = seed.files.find((file) => file.kind === "credit_card");
  const { issuer, cardNumber } = card?.fields ?? {};
  const creditCard = card
    ? {
        title: `${issuer} ending in ${cardNumber?.replaceAll(/\D/g, "").slice(-4)}`,
        imageCount: card.attachments.length,
      }
    : undefined;
  return {
    schemaVersion: 2,
    ...householdExpectations(seed.files),
    ...(birthCertificate ? { birthCertificate } : {}),
    ...(creditCard ? { creditCard } : {}),
    contact: {
      displayName: `${contact.fields.firstName} ${contact.fields.lastName}`,
    },
    note: { bodyLine, title },
    ...(driversLicense ? { driversLicense } : {}),
    ...(passport ? { passport } : {}),
  };
}
