import { isIsoDate } from "./dates";
import type { World } from "./types";
import {
  checkAppearance,
  checkContactDetails,
  checkIdentity,
  checkRelationships,
} from "./validation/characters";
import { checkDevice, checkNotes } from "./validation/device";
import { checkDocuments } from "./validation/documents";
import {
  checkIds,
  checkIssuers,
  checkUniqueDocumentNumbers,
} from "./validation/identifiers";

export function validateWorld(world: World): readonly string[] {
  if (!isIsoDate(world.asOf)) {
    return [`story date ${world.asOf} is not a calendar date`];
  }
  // Date-dependent rules can run only after every birth date is valid.
  const invalidBirthDates = world.characters
    .filter((character) => !isIsoDate(character.birthDate))
    .map(
      (character) =>
        `${character.id}: birth date ${character.birthDate} is not a calendar date`,
    );
  if (invalidBirthDates.length > 0) {
    return invalidBirthDates;
  }
  return [
    ...checkIds(world),
    ...checkIssuers(world),
    ...world.characters.flatMap((character) => [
      ...checkIdentity(world, character),
      ...checkContactDetails(world, character),
      ...checkAppearance(character),
      ...checkRelationships(world, character),
      ...checkDocuments(world, character),
    ]),
    ...checkUniqueDocumentNumbers(world),
    ...checkDevice(world, world.device),
    ...checkNotes(world),
  ];
}
