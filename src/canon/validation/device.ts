import { validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { findCharacter, resolveNoteText } from "../derive";
import type { Device, World } from "../types";
import { duplicates } from "./identifiers";

export function checkDevice(world: World, device: Device): string[] {
  const problems: string[] = [];
  const ids = new Set(world.characters.map((character) => character.id));
  if (!ids.has(device.owner)) {
    return [`device owner ${device.owner} is not a character`];
  }
  const owner = findCharacter(world, device.owner);
  for (const entry of device.addressBook) {
    if (!ids.has(entry.character) || entry.character === device.owner) {
      problems.push(
        `address book entry ${entry.character} is not another character`,
      );
    }
  }
  problems.push(
    ...duplicates(device.addressBook.map((entry) => entry.character)).map(
      (id) => `address book lists ${id} more than once`,
    ),
  );
  const phrase = device.tearleads.identitySeedPhrase;
  if (
    phrase.trim().split(/\s+/).length !== 24 ||
    !validateMnemonic(phrase, wordlist)
  ) {
    problems.push(
      "the tearleads identity seed phrase must be a valid 24-word BIP39 phrase",
    );
  }
  const labels = new Set(
    device.addressBook.flatMap((entry) => entry.labels ?? []),
  );
  for (const group of device.tearleads.groups) {
    if (!labels.has(group)) {
      problems.push(
        `the tearleads group ${group} labels no address book entry`,
      );
    }
  }
  problems.push(
    ...duplicates(device.tearleads.groups).map(
      (group) => `the tearleads groups list ${group} more than once`,
    ),
  );
  // tearleads' screenshot run asserts on the first note and on a contact it
  // can find by full name.
  if (device.notes.length === 0) {
    problems.push("the device needs at least one note");
  }
  if (!device.addressBook.some((entry) => !entry.nickname)) {
    problems.push(
      "the address book needs at least one entry without a nickname",
    );
  }
  if (
    device.wallet.includes("drivers_license") &&
    !owner.documents.driversLicense
  ) {
    problems.push(
      `the wallet lists a driver's license ${owner.id} does not hold`,
    );
  }
  if (device.wallet.includes("passport") && !owner.documents.passport) {
    problems.push(`the wallet lists a passport ${owner.id} does not hold`);
  }
  for (const [kind, document] of [
    ["birth_certificate", owner.documents.birthCertificate],
    ["credit_card", owner.documents.creditCard],
  ] as const) {
    if (device.wallet.includes(kind) && !document) {
      problems.push(`the wallet lists a ${kind} ${owner.id} does not hold`);
    }
  }
  return problems;
}

export function checkNotes(world: World): string[] {
  return [
    ...world.device.notes,
    ...world.device.tearleads.folders.flatMap((folder) => folder.notes),
  ].flatMap((note) => {
    try {
      return resolveNoteText(world, note).trim()
        ? []
        : [`note ${note.id} is empty`];
    } catch (error) {
      return [
        `note ${note.id}: ${error instanceof Error ? error.message : String(error)}`,
      ];
    }
  });
}
