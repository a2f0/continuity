// The seed tearleads loads into an account. Its shape is tearleads' SeedSpec
// (packages/app/src/document-types/continuity/seedTypes.ts); attachment paths
// are file names beside seed.json. Contact avatars use the "contact-avatar"
// slot when the tearleads seeder writes the address book.

export interface SeedAttachment {
  readonly file: string;
  readonly mimeType: string;
  readonly slot?: string;
  /** Marks the photo the document shows as its avatar; at most one. */
  readonly avatar?: true;
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

/** A line a group member adds to a folder note under their own account. */
export interface SeedNoteAddition {
  /** The member's contact ID. */
  readonly author: string;
  readonly text: string;
}

/** A folder note: the owner writes `text`, then each addition follows. */
export interface SeedFolderNote {
  readonly text: string;
  readonly additions: readonly SeedNoteAddition[];
}

/** A group's access to a folder, by the group's name. */
export interface SeedFolderGrant {
  readonly group: string;
  readonly access: "read" | "write";
}

/** A folder under the owner's root, and the groups it is shared with. */
export interface SeedFolder {
  readonly name: string;
  readonly grants: readonly SeedFolderGrant[];
  readonly notes: readonly SeedFolderNote[];
}

export interface SeedSpec {
  readonly schemaVersion: 4;
  readonly identitySeedPhrase: string;
  readonly contacts: readonly SeedContact[];
  readonly notes: readonly { readonly text: string }[];
  readonly files: readonly SeedFile[];
  readonly groups: readonly SeedGroup[];
  readonly folders: readonly SeedFolder[];
}
