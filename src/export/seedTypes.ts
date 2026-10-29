// The seed tearleads' screenshot run restores. Its shape is tearleads'
// SeedSpec (packages/app/test/screenshot-seed/seedTypes.ts); attachment paths
// are file names beside seed.json. Contact avatars use the "contact-avatar"
// slot when the tearleads seeder restores the address book.

export interface SeedAttachment {
  readonly file: string;
  readonly mimeType: string;
  readonly slot?: string;
}

export interface SeedContact {
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
