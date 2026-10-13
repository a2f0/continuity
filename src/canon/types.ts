// The canon schema: the hand-maintained facts every generated artifact is
// derived from. Canon records what is true about a character; anything that
// can be computed from those facts (ages, expiration dates, MRZ lines, display
// names) is derived in derive.ts instead of stored, so it cannot drift.

/** A calendar date written as YYYY-MM-DD. */
export type IsoDate = string;

/** Document sex marker, as printed on AAMVA cards and ICAO passports. */
export type Sex = "F" | "M" | "X";

/** AAMVA eye color codes. */
export type EyeColor =
  | "BLK"
  | "BLU"
  | "BRO"
  | "DIC"
  | "GRN"
  | "GRY"
  | "HAZ"
  | "MAR"
  | "PNK";

/** AAMVA hair color codes. */
export type HairColor =
  | "BAL"
  | "BLK"
  | "BLN"
  | "BRO"
  | "GRY"
  | "RED"
  | "SDY"
  | "UNK"
  | "WHI";

export type HairStyle =
  | "bald"
  | "bob"
  | "bun"
  | "buzz"
  | "curly"
  | "fade"
  | "long"
  | "ponytail"
  | "short"
  | "twists";

export type FacialHair = "beard" | "mustache" | "stubble";

export type SignatureFont =
  | "dawning-of-a-new-day"
  | "herr-von-muellerhoff"
  | "homemade-apple"
  | "la-belle-aurore"
  | "mrs-saint-delafield";

export type RelationshipKind =
  | "child"
  | "coworker"
  | "friend"
  | "manager"
  | "neighbor"
  | "parent"
  | "partner"
  | "report"
  | "sibling"
  | "spouse";

export interface PersonName {
  readonly given: string;
  readonly middle?: string;
  readonly family: string;
  /** The first name friends use and an address book stores, if not `given`. */
  readonly preferred?: string;
}

export interface PostalAddress {
  readonly street: string;
  readonly unit?: string;
  readonly city: string;
  /** Jurisdiction code, e.g. "CS" for Cascadia. */
  readonly region: string;
  readonly postalCode: string;
  readonly country: string;
}

export interface Phone {
  readonly label: "home" | "mobile" | "work";
  /** Formatted as "(NPA) 555-01XX", the range reserved for fiction. */
  readonly number: string;
}

export interface Email {
  readonly label: "personal" | "work";
  /** Must use a domain reserved for documentation (RFC 2606). */
  readonly address: string;
}

export interface Occupation {
  readonly title: string;
  readonly organization: string;
  readonly department?: string;
}

export interface Appearance {
  readonly heightCm: number;
  readonly weightKg: number;
  readonly eyes: EyeColor;
  readonly hair: HairColor;
  /** Hex colors used by the placeholder portrait until a photo exists. */
  readonly skinTone: string;
  readonly hairColor: string;
  readonly hairStyle: HairStyle;
  readonly facialHair?: FacialHair;
  readonly glasses?: boolean;
  /** Clothing color for the placeholder portrait. */
  readonly clothing: string;
  /**
   * Free-text description of the face, hair, and styling. It is the core of
   * the portrait prompt, so changing it marks the portrait as stale. Leave age
   * out: the prompt derives it from the birth date and the story date.
   */
  readonly description: string;
}

/** `kind` is what `to` is to this character: `{ to: "rosa-reyes", kind: "parent" }`. */
export interface Relationship {
  readonly to: string;
  readonly kind: RelationshipKind;
}

export interface DriversLicense {
  readonly jurisdiction: string;
  readonly number: string;
  readonly class: string;
  readonly issued: IsoDate;
  readonly endorsements?: readonly string[];
  readonly restrictions?: readonly string[];
  /** AAMVA field 5: the document discriminator printed on the card. */
  readonly documentDiscriminator: string;
  readonly donor?: boolean;
  readonly veteran?: boolean;
}

export interface Passport {
  readonly issuer: string;
  readonly number: string;
  readonly issued: IsoDate;
}

export interface Signature {
  readonly font: SignatureFont;
  /** Defaults to the given and family names. */
  readonly text?: string;
}

export interface Character {
  /** Stable kebab-case ID; never reuse or rename one. */
  readonly id: string;
  readonly name: PersonName;
  readonly sex: Sex;
  readonly pronouns: string;
  readonly birthDate: IsoDate;
  readonly birthPlace: string;
  readonly appearance: Appearance;
  readonly address: PostalAddress;
  readonly phones: readonly Phone[];
  readonly emails: readonly Email[];
  readonly occupation?: Occupation;
  readonly bio: string;
  readonly signature: Signature;
  readonly relationships: readonly Relationship[];
  readonly documents: {
    readonly driversLicense?: DriversLicense;
    readonly passport?: Passport;
  };
}

export interface Palette {
  readonly ink: string;
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly paper: string;
  readonly paperShade: string;
}

/** A fictional driver's license issuer. */
export interface Jurisdiction {
  readonly id: string;
  readonly name: string;
  /** Two-letter code used in addresses and on the card. */
  readonly code: string;
  readonly country: string;
  readonly agency: string;
  readonly motto: string;
  readonly minimumAge: number;
  /** Licenses expire on the holder's birthday this many years after issue. */
  readonly renewalYears: number;
  /** Anchored pattern every license number must match. */
  readonly licenseNumberPattern: string;
  readonly classes: Readonly<Record<string, string>>;
  readonly endorsements: Readonly<Record<string, string>>;
  readonly restrictions: Readonly<Record<string, string>>;
  readonly palette: Palette;
}

/** A fictional passport issuer, following ICAO Doc 9303 conventions. */
export interface PassportIssuer {
  readonly id: string;
  readonly name: string;
  /** Three-letter issuing state code. */
  readonly code: string;
  readonly nationality: string;
  readonly authority: string;
  readonly validityYears: number;
  readonly numberPattern: string;
  readonly palette: Palette;
}

/** Facts other canon text can draw on, so prose stays consistent. */
export interface CanonContext {
  readonly character: (id: string) => Character;
}

export interface Note {
  /** Stable kebab-case ID. The note's title is its first line. */
  readonly id: string;
  readonly text: string | ((context: CanonContext) => string);
}

export interface AddressBookEntry {
  readonly character: string;
  /** How the owner saved this person, e.g. "Mom". Shown instead of the name. */
  readonly nickname?: string;
  readonly labels?: readonly string[];
}

export type WalletDocument = "drivers_license" | "passport";

/** The owner's device: what a fresh tearleads install is seeded with. */
export interface Device {
  readonly owner: string;
  readonly tearleads: {
    readonly backupPassword: string;
    /** A valid BIP39 phrase; the seeded identity is derived from it. */
    readonly identitySeedPhrase: string;
  };
  readonly addressBook: readonly AddressBookEntry[];
  readonly notes: readonly Note[];
  readonly wallet: readonly WalletDocument[];
}

export interface World {
  /** The story's "today". Ages and document validity are measured here. */
  readonly asOf: IsoDate;
  readonly characters: readonly Character[];
  readonly jurisdictions: readonly Jurisdiction[];
  readonly passportIssuers: readonly PassportIssuer[];
  readonly device: Device;
}
