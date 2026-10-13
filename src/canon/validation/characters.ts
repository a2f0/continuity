import { ageOn } from "../dates";
import type { Character, RelationshipKind, World } from "../types";

// 555-0100 through 555-0199 is the NANP range reserved for fiction.
const PHONE_PATTERN = /^\(\d{3}\) 555-01\d{2}$/;
// RFC 2606 reserves these names for documentation and examples.
const EMAIL_PATTERN =
  /^[a-z0-9._+-]+@(?:(?:[a-z0-9-]+\.)+(?:example|test)|example\.(?:com|net|org))$/;
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/;

const MINIMUM_PARENT_AGE = 14;

const INVERSE_RELATIONSHIP: Readonly<
  Record<RelationshipKind, RelationshipKind>
> = {
  child: "parent",
  coworker: "coworker",
  friend: "friend",
  manager: "report",
  neighbor: "neighbor",
  parent: "child",
  partner: "partner",
  report: "manager",
  sibling: "sibling",
  spouse: "spouse",
};

export function checkIdentity(world: World, character: Character): string[] {
  const problems: string[] = [];
  const { id, birthDate } = character;
  const age = ageOn(birthDate, world.asOf);
  if (age < 0 || age > 110) {
    problems.push(`${id}: age ${age} on ${world.asOf} is implausible`);
  }
  if (!character.name.given.trim() || !character.name.family.trim()) {
    problems.push(`${id}: given and family names are required`);
  }
  return problems;
}

export function checkContactDetails(
  world: World,
  character: Character,
): string[] {
  const { id } = character;
  const regions = new Set(world.jurisdictions.map((item) => item.code));
  return [
    ...character.phones
      .filter((phone) => !PHONE_PATTERN.test(phone.number))
      .map(
        (phone) =>
          `${id}: phone ${phone.number} must be "(NPA) 555-01XX" (reserved for fiction)`,
      ),
    ...character.emails
      .filter((email) => !EMAIL_PATTERN.test(email.address))
      .map(
        (email) =>
          `${id}: email ${email.address} must use a reserved domain such as *.example`,
      ),
    ...(regions.has(character.address.region)
      ? []
      : [
          `${id}: address region ${character.address.region} is not a known jurisdiction`,
        ]),
  ];
}

export function checkAppearance(character: Character): string[] {
  const { id, appearance } = character;
  const problems: string[] = [];
  for (const [field, value] of [
    ["skinTone", appearance.skinTone],
    ["hairColor", appearance.hairColor],
    ["clothing", appearance.clothing],
  ] as const) {
    if (!HEX_COLOR_PATTERN.test(value)) {
      problems.push(
        `${id}: appearance.${field} ${value} is not a #rrggbb color`,
      );
    }
  }
  if (appearance.heightCm < 120 || appearance.heightCm > 220) {
    problems.push(`${id}: height ${appearance.heightCm} cm is implausible`);
  }
  if (appearance.weightKg < 30 || appearance.weightKg > 200) {
    problems.push(`${id}: weight ${appearance.weightKg} kg is implausible`);
  }
  return problems;
}

export function checkRelationships(
  world: World,
  character: Character,
): string[] {
  const problems: string[] = [];
  for (const relationship of character.relationships) {
    const other = world.characters.find((item) => item.id === relationship.to);
    if (!other || other.id === character.id) {
      problems.push(
        `${character.id}: relationship to unknown character ${relationship.to}`,
      );
      continue;
    }
    const inverse = INVERSE_RELATIONSHIP[relationship.kind];
    const reciprocated = other.relationships.some(
      (item) => item.to === character.id && item.kind === inverse,
    );
    if (!reciprocated) {
      problems.push(
        `${other.id} is ${character.id}'s ${relationship.kind}, so ${other.id} must list ${character.id} as "${inverse}"`,
      );
    }
    if (
      relationship.kind === "parent" &&
      ageOn(other.birthDate, character.birthDate) < MINIMUM_PARENT_AGE
    ) {
      problems.push(`${other.id} is too young to be ${character.id}'s parent`);
    }
  }
  return problems;
}
