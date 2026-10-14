import { creditCardExpiration, findCharacter, legalName } from "./derive";
import type { BirthCertificate, Character, CreditCard, World } from "./types";

export function birthCertificateFields(
  world: World,
  character: Character,
  certificate: BirthCertificate,
) {
  return {
    certificateNumber: certificate.number,
    fullName: legalName(character),
    dateOfBirth: character.birthDate,
    placeOfBirth: character.birthPlace,
    parentNames: character.relationships
      .filter((relationship) => relationship.kind === "parent")
      .map((relationship) => legalName(findCharacter(world, relationship.to)))
      .join("; "),
    issuingAuthority: certificate.authority,
    dateIssued: certificate.issued,
  };
}

export function creditCardFields(character: Character, card: CreditCard) {
  return {
    issuer: card.issuer,
    cardNumber: card.number.replace(/(.{4})(?=.)/g, "$1 "),
    cvvCode: card.cvv,
    nameOnCard: legalName(character),
    expirationDate: creditCardExpiration(card),
  };
}
