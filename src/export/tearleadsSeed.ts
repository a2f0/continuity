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
import type { Passcode, World } from "../canon/types";
import {
  type HouseholdExpectations,
  type HouseholdPhotoMetadata,
  householdExpectations,
  householdFiles,
} from "./householdSeed";
import type { SeedFile, SeedFolder, SeedGroup, SeedSpec } from "./seedTypes";

interface PasscodeExpectation {
  readonly title: string;
  readonly fields: Readonly<Record<string, string>>;
  readonly attributeCount: number;
}

interface FolderNoteExpectation {
  readonly title: string;
  /** The note once every addition is in. */
  readonly text: string;
  /** Roster names of the members who add to it, in order. */
  readonly authors: readonly string[];
}

interface FolderExpectation {
  readonly name: string;
  readonly grants: SeedFolder["grants"];
  readonly notes: readonly FolderNoteExpectation[];
}

/** Strings tearleads' screenshot run asserts on after loading the seed. */
export interface SeedExpectations extends HouseholdExpectations {
  readonly schemaVersion: 4;
  /** Each group with its members' roster names in place of contact IDs. */
  readonly groups: readonly SeedGroup[];
  readonly passcodes: readonly PasscodeExpectation[];
  readonly folders: readonly FolderExpectation[];
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

/** A passcode as tearleads stores it: blank fields are left out. */
function passcodeFile(passcode: Passcode): SeedFile {
  const fields = Object.fromEntries(
    Object.entries({
      title: passcode.title,
      username: passcode.username,
      password: passcode.password,
      url: passcode.url,
      notes: passcode.notes,
      tags: passcode.tags?.join(", "),
    }).filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
  const rows = (passcode.attributes ?? []).map((attribute) => ({
    name: attribute.name,
    value: attribute.value,
    ...(attribute.protected ? { protected: "true" } : {}),
  }));
  return {
    kind: "passcode",
    fields,
    attachments: [],
    ...(rows.length ? { rows } : {}),
  };
}

function sharedFolders(world: World): SeedFolder[] {
  return world.device.tearleads.folders.map((folder) => ({
    name: folder.name,
    grants: folder.grants,
    notes: folder.notes.map((note) => ({
      text: resolveNoteText(world, note),
      additions: note.additions,
    })),
  }));
}

/** One group per configured label, holding everyone saved with it. */
function organizationGroups(world: World): SeedGroup[] {
  return world.device.tearleads.groups.map((name) => {
    const members = world.device.addressBook
      .filter((entry) => entry.labels?.includes(name))
      .map((entry) => entry.character);
    if (!members.length)
      throw new Error(`No address-book entry has the group label ${name}.`);
    return { name, members };
  });
}

export function buildTearleadsSeed(
  world: World,
  photos: ReadonlyMap<string, HouseholdPhotoMetadata>,
): SeedSpec {
  const { device } = world;
  return {
    schemaVersion: 4,
    contacts: device.addressBook.map((entry) => {
      const character = findCharacter(world, entry.character);
      return {
        id: character.id,
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
    files: [
      ...walletFiles(world),
      ...householdFiles(world, photos),
      ...world.device.passcodes.map(passcodeFile),
    ],
    groups: organizationGroups(world),
    folders: sharedFolders(world),
    identitySeedPhrase: device.tearleads.identitySeedPhrase,
    notes: device.notes.map((note) => ({ text: resolveNoteText(world, note) })),
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
  const rosterName = (id: string) => {
    const member = seed.contacts.find((item) => item.id === id);
    if (!member) throw new Error(`Group member ${id} is not a contact.`);
    return `${member.fields.firstName} ${member.fields.lastName}`;
  };
  return {
    schemaVersion: 4,
    ...householdExpectations(seed.files),
    groups: seed.groups.map((group) => ({
      name: group.name,
      members: group.members.map(rosterName),
    })),
    passcodes: seed.files
      .filter((file) => file.kind === "passcode")
      .map(({ fields, rows }) => {
        const { title = "" } = fields;
        return { title, fields, attributeCount: rows?.length ?? 0 };
      }),
    folders: seed.folders.map((folder) => ({
      name: folder.name,
      grants: folder.grants,
      notes: folder.notes.map((note) => ({
        title: note.text.split("\n")[0] ?? "",
        text: [note.text, ...note.additions.map(({ text }) => text)].join("\n"),
        authors: note.additions.map(({ author }) => rosterName(author)),
      })),
    })),
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
