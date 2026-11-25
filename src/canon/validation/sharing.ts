import type { FolderAccess, Passcode, SharedFolder, World } from "../types";
import { duplicates } from "./identifiers";

const FOLDER_ACCESS: readonly FolderAccess[] = ["read", "write"];

// RFC 2606 reserves these names, as for canon email addresses.
const RESERVED_HOST =
  /^(?:(?:[a-z0-9-]+\.)+(?:example|test)|(?:[a-z0-9-]+\.)*example\.(?:com|net|org))$/;

/** An https URL on a reserved domain, so no real site is named. */
function fictionalUrl(value: string): boolean {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  return url.protocol === "https:" && RESERVED_HOST.test(url.hostname);
}

function blank(value: string | undefined): boolean {
  return value !== undefined && value.trim() === "";
}

function checkPasscode(passcode: Passcode): string[] {
  const problems: string[] = [];
  const where = `passcode ${passcode.id}`;
  if (!passcode.title.trim()) problems.push(`${where} has no title`);
  if (!passcode.password.trim()) problems.push(`${where} has no password`);
  for (const [field, value] of [
    ["username", passcode.username],
    ["url", passcode.url],
    ["notes", passcode.notes],
  ] as const) {
    if (blank(value)) problems.push(`${where} has a blank ${field}`);
  }
  if (passcode.url !== undefined && !fictionalUrl(passcode.url)) {
    problems.push(
      `${where} URL ${passcode.url} must be https on a reserved example domain`,
    );
  }
  // tearleads stores tags as one comma-separated field, left out when blank.
  if (passcode.tags?.length === 0) {
    problems.push(`${where} lists no tags; leave tags out instead`);
  }
  for (const tag of passcode.tags ?? []) {
    if (!tag.trim() || tag.includes(",")) {
      problems.push(`${where} tag "${tag}" must be a non-empty word`);
    }
  }
  const attributes = passcode.attributes ?? [];
  for (const attribute of attributes) {
    if (!attribute.name.trim() || !attribute.value.trim()) {
      problems.push(`${where} has an attribute without a name or value`);
    }
  }
  problems.push(
    ...duplicates(attributes.map((attribute) => attribute.name)).map(
      (name) => `${where} lists the attribute ${name} more than once`,
    ),
  );
  return problems;
}

export function checkPasscodes(world: World): string[] {
  const { passcodes } = world.device;
  return [
    ...passcodes.flatMap(checkPasscode),
    // tearleads' screenshot run finds each passcode by its title.
    ...duplicates(passcodes.map((passcode) => passcode.title)).map(
      (title) => `the passcode title ${title} is used more than once`,
    ),
  ];
}

/** Who may add to a folder's notes: members of groups that can write. */
function folderWriters(world: World, folder: SharedFolder): Set<string> {
  const groups = new Set(
    folder.grants
      .filter((grant) => grant.access === "write")
      .map((grant) => grant.group),
  );
  return new Set(
    world.device.addressBook
      .filter((entry) => entry.labels?.some((label) => groups.has(label)))
      .map((entry) => entry.character),
  );
}

function checkFolder(world: World, folder: SharedFolder): string[] {
  const problems: string[] = [];
  const where = `folder ${folder.name}`;
  const groups = new Set(world.device.tearleads.groups);
  for (const grant of folder.grants) {
    if (!groups.has(grant.group)) {
      problems.push(`${where} grants ${grant.group}, which is not a group`);
    }
    if (!FOLDER_ACCESS.includes(grant.access)) {
      problems.push(`${where} grants unknown access ${grant.access}`);
    }
  }
  problems.push(
    ...duplicates(folder.grants.map((grant) => grant.group)).map(
      (group) => `${where} grants ${group} more than once`,
    ),
  );
  const writers = folderWriters(world, folder);
  for (const note of folder.notes) {
    for (const addition of note.additions) {
      if (!writers.has(addition.author)) {
        problems.push(
          `note ${note.id}: ${addition.author} cannot write in ${folder.name}`,
        );
      }
      if (!addition.text.trim()) {
        problems.push(`note ${note.id} has an empty addition`);
      }
    }
  }
  return problems;
}

export function checkFolders(world: World): string[] {
  const { folders } = world.device.tearleads;
  return [
    ...folders
      .filter((folder) => !folder.name.trim() || folder.name.includes("/"))
      .map((folder) => `folder name "${folder.name}" is not a plain name`),
    ...duplicates(folders.map((folder) => folder.name)).map(
      (name) => `the folder ${name} is listed more than once`,
    ),
    ...folders.flatMap((folder) => checkFolder(world, folder)),
  ];
}
