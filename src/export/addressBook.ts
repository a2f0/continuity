import { findCharacter, firstName } from "../canon/derive";
import type { AddressBookEntry, Character, World } from "../canon/types";

// The owner's address book, flattened for contact exporters.

export interface AddressBookContact {
  readonly entry: AddressBookEntry;
  readonly character: Character;
  readonly firstName: string;
}

export function addressBook(world: World): readonly AddressBookContact[] {
  return world.device.addressBook.map((entry) => {
    const character = findCharacter(world, entry.character);
    return { character, entry, firstName: firstName(character) };
  });
}

export function formattedAddress(character: Character): string {
  const { street, unit, city, region, postalCode, country } = character.address;
  return [
    unit ? `${street} ${unit}` : street,
    `${city}, ${region} ${postalCode}`,
    country,
  ].join("\n");
}
