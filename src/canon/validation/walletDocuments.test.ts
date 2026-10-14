import { expect, test } from "bun:test";
import { world } from "../../../canon/world";
import { findCharacter } from "../derive";
import { checkDevice } from "./device";
import { checkWalletDocuments } from "./walletDocuments";

const maya = findCharacter(world, "maya-reyes");
const card = maya.documents.creditCard;
const certificate = maya.documents.birthCertificate;
if (!card || !certificate) throw new Error("Maya needs both wallet documents");

test("rejects invalid issue dates and certificates issued before birth", () => {
  for (const issued of ["invalid", "1990-01-01", "2030-01-01"]) {
    expect(
      checkWalletDocuments(world, {
        ...maya,
        documents: { birthCertificate: { ...certificate, issued } },
      }).length,
    ).toBeGreaterThan(0);
  }
});

test("rejects expired cards but accepts the entire expiration month", () => {
  expect(checkWalletDocuments({ ...world, asOf: "2028-06-30" }, maya)).toEqual(
    [],
  );
  expect(
    checkWalletDocuments({ ...world, asOf: "2028-07-01" }, maya),
  ).toContain("maya-reyes: credit card expired; renew it in canon");
});

test("rejects card numbers outside the fictional range and invalid validity", () => {
  for (const patch of [
    { number: "4111111111111111" },
    { cvv: "123" },
    { validityYears: 0 },
    { validityYears: 1.5 },
    { issued: "invalid" },
  ]) {
    expect(
      checkWalletDocuments(world, {
        ...maya,
        documents: { creditCard: { ...card, ...patch } },
      }).length,
    ).toBeGreaterThan(0);
  }
});

test("wallet documents must be held by the owner", () => {
  const missing = {
    ...world,
    characters: world.characters.map((character) =>
      character.id === maya.id ? { ...character, documents: {} } : character,
    ),
  };
  const problems = checkDevice(missing, missing.device);
  expect(problems).toContain(
    "the wallet lists a birth_certificate maya-reyes does not hold",
  );
  expect(problems).toContain(
    "the wallet lists a credit_card maya-reyes does not hold",
  );
});
