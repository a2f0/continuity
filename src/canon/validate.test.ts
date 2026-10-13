import { describe, expect, test } from "bun:test";
import { world } from "../../canon/world";
import type { Character, World } from "./types";
import { validateWorld } from "./validate";

function withCharacter(
  id: string,
  change: (character: Character) => Character,
): World {
  return {
    ...world,
    characters: world.characters.map((character) =>
      character.id === id ? change(character) : character,
    ),
  };
}

describe("validateWorld", () => {
  test("accepts the canon", () => {
    expect(validateWorld(world)).toEqual([]);
  });

  test.each(["maya-reyes", "rosa-reyes", "theo-reyes"])(
    "reports an invalid birth date for %s without throwing",
    (id) => {
      const broken = withCharacter(id, (character) => ({
        ...character,
        birthDate: "2000-02-30",
      }));
      expect(validateWorld(broken)).toContain(
        `${id}: birth date 2000-02-30 is not a calendar date`,
      );
    },
  );

  test("reports every invalid birth date before date-dependent rules run", () => {
    const broken: World = {
      ...world,
      characters: world.characters.map((character) => ({
        ...character,
        birthDate: "invalid",
      })),
    };
    expect(validateWorld(broken)).toEqual(
      world.characters.map(
        (character) =>
          `${character.id}: birth date invalid is not a calendar date`,
      ),
    );
  });

  test("reports note failures even when the thrown value is not an Error", () => {
    const broken: World = {
      ...world,
      device: {
        ...world.device,
        notes: [
          {
            id: "broken-note",
            text: () => {
              throw "missing note data";
            },
          },
        ],
      },
    };
    expect(validateWorld(broken)).toContain(
      "note broken-note: missing note data",
    );
  });

  test("requires relationships to be reciprocated", () => {
    const broken = withCharacter("rosa-reyes", (character) => ({
      ...character,
      relationships: character.relationships.filter(
        (item) => item.to !== "theo-reyes",
      ),
    }));
    expect(validateWorld(broken)).toContain(
      'rosa-reyes is theo-reyes\'s parent, so rosa-reyes must list theo-reyes as "child"',
    );
  });

  test("rejects a parent too young for the child", () => {
    const broken = withCharacter("rosa-reyes", (character) => ({
      ...character,
      birthDate: "1985-01-01",
    }));
    expect(validateWorld(broken)).toContain(
      "rosa-reyes is too young to be maya-reyes's parent",
    );
  });

  test("rejects contact details outside the ranges reserved for fiction", () => {
    const broken = withCharacter("theo-reyes", (character) => ({
      ...character,
      emails: [{ label: "personal", address: "theo@gmail.com" }],
      phones: [{ label: "mobile", number: "(360) 555-2368" }],
    }));
    const problems = validateWorld(broken);
    expect(problems.some((item) => item.includes("theo@gmail.com"))).toBe(true);
    expect(problems.some((item) => item.includes("555-2368"))).toBe(true);
  });

  test("flags a license that expired before the story date", () => {
    const broken = withCharacter("marcus-bell", (character) => ({
      ...character,
      documents: {
        driversLicense: {
          ...(character.documents.driversLicense as NonNullable<
            Character["documents"]["driversLicense"]
          >),
          issued: "2017-08-14",
        },
      },
    }));
    expect(validateWorld(broken)).toContain(
      "marcus-bell driver's license B590-8814-2265 expired on 2025-08-27; renew it in canon",
    );
  });

  test("rejects a license issued before driving age", () => {
    const broken = withCharacter("theo-reyes", (character) => ({
      ...character,
      documents: {
        driversLicense: {
          ...(character.documents.driversLicense as NonNullable<
            Character["documents"]["driversLicense"]
          >),
          issued: "2011-06-01",
        },
      },
    }));
    expect(validateWorld(broken)).toContain(
      "theo-reyes: license issued before age 16",
    );
  });

  test("rejects duplicate document numbers", () => {
    const broken = withCharacter("daniel-okafor", (character) => ({
      ...character,
      documents: {
        driversLicense: {
          ...(character.documents.driversLicense as NonNullable<
            Character["documents"]["driversLicense"]
          >),
          number: "R620-4183-9147",
        },
      },
    }));
    expect(validateWorld(broken)).toContain(
      "license number R620-4183-9147 is used more than once",
    );
  });

  test("requires address book entries to be other characters", () => {
    const broken: World = {
      ...world,
      device: {
        ...world.device,
        addressBook: [...world.device.addressBook, { character: "maya-reyes" }],
      },
    };
    expect(validateWorld(broken)).toContain(
      "address book entry maya-reyes is not another character",
    );
  });

  test("requires a resident's country to match the license issuer", () => {
    const broken = withCharacter("maya-reyes", (character) => ({
      ...character,
      address: { ...character.address, country: "CAN" },
    }));
    expect(validateWorld(broken)).toContain(
      "maya-reyes: a Cascadia license needs a CS, USA address",
    );
  });

  test("requires ICAO-sized issuer codes", () => {
    const broken: World = {
      ...world,
      passportIssuers: world.passportIssuers.map((issuer) => ({
        ...issuer,
        code: "UTOPIA",
      })),
    };
    expect(validateWorld(broken)).toContain(
      "passport issuer utopia code UTOPIA must be three capital letters",
    );
  });

  test("requires a valid BIP39 identity phrase", () => {
    const broken: World = {
      ...world,
      device: {
        ...world.device,
        tearleads: {
          ...world.device.tearleads,
          identitySeedPhrase: Array(24).fill("notaword").join(" "),
        },
      },
    };
    expect(validateWorld(broken)).toContain(
      "the tearleads identity seed phrase must be a valid 24-word BIP39 phrase",
    );
  });

  test("requires what the screenshot run asserts on", () => {
    const broken: World = {
      ...world,
      device: {
        ...world.device,
        addressBook: world.device.addressBook.map((entry) => ({
          ...entry,
          nickname: entry.nickname ?? "Friend",
        })),
        notes: [],
      },
    };
    const problems = validateWorld(broken);
    expect(problems).toContain("the device needs at least one note");
    expect(problems).toContain(
      "the address book needs at least one entry without a nickname",
    );
  });
});
