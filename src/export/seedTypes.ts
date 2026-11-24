// The seed tearleads loads into an account. Its shape is tearleads' SeedSpec
// (packages/app/src/document-types/continuity/seedTypes.ts); attachment paths
// are file names beside seed.json. Contact avatars use the "contact-avatar"
// slot when the tearleads seeder writes the address book.

export interface SeedAttachment {
  readonly file: string;
  readonly mimeType: string;
  readonly slot?: string;
}

export interface SeedContact {
  /** The canon character ID: stable across seed versions. */
  readonly id: string;
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

/** An organization group; `members` are contact IDs, who join the roster. */
export interface SeedGroup {
  readonly name: string;
  readonly members: readonly string[];
}

export interface SeedSpec {
  readonly schemaVersion: 3;
  readonly identitySeedPhrase: string;
  readonly contacts: readonly SeedContact[];
  readonly notes: readonly { readonly text: string }[];
  readonly files: readonly SeedFile[];
  readonly groups: readonly SeedGroup[];
}
