import { expect, test } from "bun:test";
import { world } from "../../canon/world";
import { buildTearleadsSeed } from "./tearleadsSeed";

test("birth certificates derive identity and parent names from canon", () => {
  const seed = buildTearleadsSeed(world);
  const certificate = seed.files.find(
    (file) => file.kind === "birth_certificate",
  );
  expect(certificate?.fields).toEqual({
    certificateNumber: "UT-B-1991-0314-042",
    fullName: "Maya Elena Reyes",
    dateOfBirth: "1991-03-14",
    placeOfBirth: "Aurelia, Utopia",
    parentNames: "Rosa María Reyes",
    issuingAuthority: "Aurelia Civil Registry, Utopia",
    dateIssued: "1991-03-20",
  });
  expect(certificate?.attachments.map((item) => item.slot)).toEqual([
    "birth-certificate-image",
  ]);
  const renamed = {
    ...world,
    characters: world.characters.map((character) =>
      character.id === "rosa-reyes"
        ? { ...character, name: { given: "Rosalind", family: "Reyes" } }
        : character,
    ),
  };
  const { parentNames } =
    buildTearleadsSeed(renamed).files.find(
      (file) => file.kind === "birth_certificate",
    )?.fields ?? {};
  expect(parentNames).toBe("Rosalind Reyes");
});

test("credit cards export fields and both attachment slots used by Tearleads", () => {
  const card = buildTearleadsSeed(world).files.find(
    (file) => file.kind === "credit_card",
  );
  expect(card?.fields).toEqual({
    issuer: "Alder Grove Bank",
    cardNumber: "0000 0000 0000 4242",
    cvvCode: "000",
    nameOnCard: "Maya Elena Reyes",
    expirationDate: "2028-06",
  });
  expect(card?.attachments.map((item) => item.slot)).toEqual([
    "credit-card-front-image",
    "credit-card-back-image",
  ]);
});

test("wallet selection controls exported sample documents", () => {
  expect(
    buildTearleadsSeed({
      ...world,
      device: { ...world.device, wallet: [] },
    }).files.filter((file) =>
      world.device.wallet.includes(
        file.kind as (typeof world.device.wallet)[number],
      ),
    ),
  ).toEqual([]);
});
