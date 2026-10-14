import { compareDates, isIsoDate } from "../dates";
import type { Character, CreditCard, World } from "../types";

export function checkWalletDocuments(
  world: World,
  character: Character,
): string[] {
  const problems: string[] = [];
  const { birthCertificate, creditCard } = character.documents;
  for (const [label, document] of [
    ["birth certificate", birthCertificate],
    ["credit card", creditCard],
  ] as const) {
    if (!document) continue;
    if (!isIsoDate(document.issued)) {
      problems.push(
        `${character.id}: ${label} issue date is not a calendar date`,
      );
    } else if (
      compareDates(document.issued, character.birthDate) < 0 ||
      compareDates(document.issued, world.asOf) > 0
    ) {
      problems.push(
        `${character.id}: ${label} issue date must be between birth and the story date`,
      );
    }
  }
  if (
    birthCertificate &&
    (!birthCertificate.number.trim() || !birthCertificate.authority.trim())
  ) {
    problems.push(
      `${character.id}: birth certificate needs a number and issuing authority`,
    );
  }
  if (creditCard) problems.push(...checkCreditCard(character, creditCard));
  return problems;
}

function checkCreditCard(
  character: Character,
  creditCard: CreditCard,
): string[] {
  const problems: string[] = [];
  if (!/^0000\d{12}$/.test(creditCard.number) || creditCard.cvv !== "000") {
    problems.push(
      `${character.id}: credit card must use a fictional 0000-prefixed number and 000 CVV`,
    );
  }
  if (
    !creditCard.issuer.trim() ||
    !Number.isInteger(creditCard.validityYears) ||
    creditCard.validityYears < 1 ||
    creditCard.validityYears > 10
  ) {
    problems.push(
      `${character.id}: credit card needs an issuer and validity of 1–10 years`,
    );
  }
  return problems;
}
