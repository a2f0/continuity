import { describe, expect, test } from "bun:test";
import { world } from "../../canon/world";
import { googleContactsCsv } from "./googleContactsCsv";
import { buildSeedExpectations, buildTearleadsSeed } from "./tearleadsSeed";
import { addressBookVcard } from "./vcard";

describe("buildTearleadsSeed", () => {
  const seed = buildTearleadsSeed(world);

  test("seeds the owner's address book, notes, and wallet", () => {
    expect(seed.contacts).toHaveLength(world.device.addressBook.length);
    expect(seed.contacts[0]?.fields).toEqual({
      firstName: "Rosa",
      lastName: "Reyes",
      nickname: "Mom",
    });
    expect(seed.notes).toHaveLength(world.device.notes.length);
    expect(seed.files.slice(0, 4).map((file) => file.kind)).toEqual([
      "drivers_license",
      "passport",
      "birth_certificate",
      "credit_card",
    ]);
  });

  test("uses the slots and field names tearleads defines", () => {
    const [license, passport] = seed.files;
    expect(license?.fields).toEqual({
      expirationDate: "2032-03-14",
      licenseId: "R620-4183-9147",
    });
    expect(license?.attachments.map((item) => item.slot)).toEqual([
      "front",
      "back",
    ]);
    expect(passport?.fields).toEqual({
      expirationDate: "2033-06-01",
      fullName: "Maya Elena Reyes",
      issuingCountry: "Utopia",
      passportNumber: "UA4821937",
    });
    expect(passport?.attachments[0]?.slot).toBe("passport-image");
  });

  test("resolves computed notes from canon", () => {
    const gifts = seed.notes.find((note) => note.text.startsWith("Gift ideas"));
    expect(gifts?.text).toContain("Theo (June 2)");
    expect(gifts?.text).toContain("Mom (July 22)");
  });

  test("derives the strings the screenshot run asserts on", () => {
    expect(buildSeedExpectations(seed)).toMatchObject({
      contact: { displayName: "Daniel Okafor" },
      driversLicense: {
        imageCount: 2,
        title: "Driver's License R620-4183-9147",
      },
      note: {
        bodyLine: "Priya wants the empty states reworked before Thursday.",
        title: "Design review: onboarding refresh",
      },
      passport: { imageCount: 1, title: "Passport UA4821937" },
      birthCertificate: {
        imageCount: 1,
        title: "Birth Certificate Maya Elena Reyes",
      },
      creditCard: { imageCount: 2, title: "Alder Grove Bank ending in 4242" },
    });
  });
});

describe("googleContactsCsv", () => {
  const [header = "", ...rows] = googleContactsCsv(world)
    .trimEnd()
    .split(/\n(?=[^\n]*,[^\n]*,)/);

  test("writes Google's 38 columns", () => {
    expect(header.split(",")).toHaveLength(38);
    expect(header.startsWith("First Name,Middle Name,Last Name,")).toBe(true);
  });

  test("quotes multi-line addresses", () => {
    expect(rows.join("\n")).toContain(
      '"88 Juniper Lane\nCedar Hollow, CS 98432\nUSA"',
    );
  });
});

describe("addressBookVcard", () => {
  const vcard = addressBookVcard(
    world,
    new Map([["rosa-reyes", new Uint8Array(200).fill(7)]]),
  );

  test("writes one card per address book entry", () => {
    expect(vcard.match(/BEGIN:VCARD/g)).toHaveLength(
      world.device.addressBook.length,
    );
    expect(vcard).toContain("NICKNAME:Mom\r\n");
  });

  test("escapes structured-value separators", () => {
    const withSemicolon = {
      ...world,
      characters: world.characters.map((character) =>
        character.id === "rosa-reyes"
          ? {
              ...character,
              address: {
                ...character.address,
                street: "88 Juniper Lane; Rear",
              },
            }
          : character,
      ),
    };
    expect(addressBookVcard(withSemicolon, new Map())).toContain(
      "ADR;TYPE=HOME:;;88 Juniper Lane\\; Rear;Cedar Hollow;CS;98432;USA\r\n",
    );
  });

  test("folds long lines at 75 octets with CRLF", () => {
    const lines = vcard.split("\r\n");
    expect(lines.every((line) => Buffer.byteLength(line, "utf8") <= 75)).toBe(
      true,
    );
    expect(lines.some((line) => line.startsWith(" "))).toBe(true);
  });
});
