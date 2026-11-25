import { describe, expect, test } from "bun:test";
import { world } from "../../canon/world";
import { loadHouseholdPhotos } from "../genesis/household";
import { googleContactsCsv } from "./googleContactsCsv";
import { buildSeedExpectations, buildTearleadsSeed } from "./tearleadsSeed";
import { addressBookVcard } from "./vcard";

describe("buildTearleadsSeed", () => {
  const seed = buildTearleadsSeed(world, loadHouseholdPhotos(world));

  test("seeds the owner's address book, notes, and wallet", () => {
    expect(seed.contacts).toHaveLength(world.device.addressBook.length);
    expect(seed.contacts[0]?.fields).toEqual({
      firstName: "Rosa",
      lastName: "Reyes",
      nickname: "Mom",
    });
    expect(seed.notes).toHaveLength(world.device.notes.length);
    expect(seed.files.map((file) => file.kind)).toEqual([
      "drivers_license",
      "passport",
      "birth_certificate",
      "credit_card",
      "image",
      "image",
      "tool",
      "tool",
      "appliance",
      "appliance",
      "weight",
      "blood_pressure",
      ...world.device.passcodes.map(() => "passcode"),
    ]);
  });

  test("marks each equipment item's first photo as its avatar", () => {
    for (const file of seed.files.filter(
      (item) => item.kind === "tool" || item.kind === "appliance",
    )) {
      const photos = file.attachments.filter(
        (item) => item.slot === "equipment-photos",
      );
      expect(photos[0]?.avatar).toBe(true);
      expect(
        file.attachments.filter((item) => item.avatar === true),
      ).toHaveLength(1);
    }
    expect(
      seed.files
        .filter((file) => file.kind !== "tool" && file.kind !== "appliance")
        .flatMap((file) => file.attachments)
        .some((item) => item.avatar),
    ).toBe(false);
  });

  test("writes passcodes with tags joined and protected attributes", () => {
    const passcode = (name: string) =>
      seed.files.find(
        ({ kind, fields: { title } }) => kind === "passcode" && title === name,
      );
    const alarm = passcode("Alarm system");
    expect(alarm).toEqual({
      kind: "passcode",
      fields: {
        title: "Alarm system",
        username: "maya.reyes",
        password: "2580",
        url: "https://account.kestrelwatch.example",
        notes: "Kestrel Watch panel by the front door.",
        tags: "home",
      },
      attachments: [],
      rows: [
        { name: "Monitoring account", value: "KW-20817" },
        { name: "Duress code", value: "2581", protected: "true" },
      ],
    });
    const garage = passcode("Garage door");
    expect(garage?.rows).toBeUndefined();
    expect(Object.keys(garage?.fields ?? {})).not.toContain("username");
  });

  test("shares the Family folder with its group for writing", () => {
    expect(seed.folders).toHaveLength(1);
    const [family] = seed.folders;
    expect(family?.name).toBe("Family");
    expect(family?.grants).toEqual([{ group: "Family", access: "write" }]);
    const [note] = family?.notes ?? [];
    expect(note?.text.split("\n")[0]).toBe("Thanksgiving at Mom's");
    expect(note?.additions.map(({ author }) => author)).toEqual([
      "rosa-reyes",
      "daniel-okafor",
      "theo-reyes",
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

  test("groups everyone saved with a group label under a stable ID", () => {
    expect(seed.groups).toEqual([
      {
        name: "Family",
        members: ["rosa-reyes", "daniel-okafor", "theo-reyes"],
      },
    ]);
    const ids = seed.contacts.map((contact) => contact.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("priya-natarajan");
  });

  test("refuses a group nobody belongs to or a member who is not a contact", () => {
    const photos = loadHouseholdPhotos(world);
    const lonely = {
      ...world,
      device: {
        ...world.device,
        tearleads: { ...world.device.tearleads, groups: ["Nope"] },
      },
    };
    expect(() => buildTearleadsSeed(lonely, photos)).toThrow(
      "No address-book entry has the group label Nope.",
    );
    expect(() =>
      buildSeedExpectations({
        ...seed,
        groups: [{ name: "Family", members: ["maya-reyes"] }],
      }),
    ).toThrow("Group member maya-reyes is not a contact.");
  });

  test("resolves computed notes from canon", () => {
    const gifts = seed.notes.find((note) => note.text.startsWith("Gift ideas"));
    expect(gifts?.text).toContain("Theo (June 2)");
    expect(gifts?.text).toContain("Mom (July 22)");
  });

  test("derives the strings the screenshot run asserts on", () => {
    const {
      schemaVersion,
      photos,
      tools,
      appliances,
      weight,
      bloodPressure,
      groups,
      passcodes,
      folders,
      ...walletExpectations
    } = buildSeedExpectations(seed);
    expect(schemaVersion).toBe(4);
    expect(groups).toEqual([
      {
        name: "Family",
        members: ["Rosa Reyes", "Daniel Okafor", "Theo Reyes"],
      },
    ]);
    expect(passcodes.map(({ title }) => title)).toEqual(
      world.device.passcodes.map(({ title }) => title),
    );
    expect(
      passcodes.find(({ title }) => title === "Alarm system")?.attributeCount,
    ).toBe(2);
    expect(folders).toEqual([
      {
        name: "Family",
        grants: [{ group: "Family", access: "write" }],
        notes: [
          {
            title: "Thanksgiving at Mom's",
            text: [
              "Thanksgiving at Mom's",
              "Thursday, November 26. Dinner at 4.",
              "- Maya: flan and the folding chairs",
              "- Rosa: turkey is ordered from Juniper Market; I'll pick it up Wednesday",
              "- Daniel: cider, and I'll set up the long table",
              "- Theo: pumpkin empanadas and the playlist",
            ].join("\n"),
            authors: ["Rosa Reyes", "Daniel Okafor", "Theo Reyes"],
          },
        ],
      },
    ]);
    expect(tools.map(({ avatar }) => avatar)).toEqual([
      "household-drill.jpg",
      "household-circular-saw.jpg",
    ]);
    expect(appliances.map(({ avatar }) => avatar)).toEqual([
      "household-washing-machine.jpg",
      "household-refrigerator.jpg",
    ]);
    expect(photos.some((photo) => "avatar" in photo)).toBe(false);
    expect(photos).toHaveLength(2);
    expect(tools).toHaveLength(2);
    expect(appliances).toHaveLength(2);
    expect(weight.rowCount).toBe(6);
    expect(bloodPressure.rowCount).toBe(6);
    expect(walletExpectations).toEqual({
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
