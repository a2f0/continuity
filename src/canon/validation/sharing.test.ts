import { describe, expect, test } from "bun:test";
import { world } from "../../../canon/world";
import type { Passcode, SharedFolder, World } from "../types";
import { validateWorld } from "../validate";

function withPasscodes(passcodes: readonly Passcode[]): World {
  return { ...world, device: { ...world.device, passcodes } };
}

function withFolders(folders: readonly SharedFolder[]): World {
  return {
    ...world,
    device: {
      ...world.device,
      tearleads: { ...world.device.tearleads, folders },
    },
  };
}

const [family] = world.device.tearleads.folders;
if (!family) throw new Error("The canon has no shared folder.");

describe("passcodes", () => {
  const safe: Passcode = { id: "safe", title: "Safe", password: "1234" };

  test("require a title, a password, and no blank optional fields", () => {
    expect(
      validateWorld(
        withPasscodes([{ ...safe, title: " ", password: "", username: "" }]),
      ),
    ).toEqual([
      "passcode safe has no title",
      "passcode safe has no password",
      "passcode safe has a blank username",
    ]);
  });

  test("require unique IDs and titles", () => {
    expect(validateWorld(withPasscodes([safe, safe]))).toEqual([
      'passcode ID "safe" is used more than once',
      "the passcode title Safe is used more than once",
    ]);
  });

  test("require absolute URLs, plain tags, and distinct attributes", () => {
    expect(
      validateWorld(
        withPasscodes([
          {
            ...safe,
            url: "kestrelwatch",
            tags: ["home, work"],
            attributes: [
              { name: "Code", value: "1" },
              { name: "Code", value: "2" },
              { name: "Hint", value: " " },
            ],
          },
        ]),
      ),
    ).toEqual([
      "passcode safe URL kestrelwatch is not absolute",
      'passcode safe tag "home, work" must be a non-empty word',
      "passcode safe has an attribute without a name or value",
      "passcode safe lists the attribute Code more than once",
    ]);
  });
});

describe("shared folders", () => {
  test("grant only device groups, once each", () => {
    expect(
      validateWorld(
        withFolders([
          {
            ...family,
            grants: [
              { group: "Family", access: "write" },
              { group: "Family", access: "read" },
              { group: "Work", access: "read" },
            ],
          },
        ]),
      ),
    ).toEqual([
      "folder Family grants Work, which is not a group",
      "folder Family grants Family more than once",
    ]);
  });

  test("let only members of a writing group add to a note", () => {
    const readOnly = withFolders([
      { ...family, grants: [{ group: "Family", access: "read" }] },
    ]);
    expect(validateWorld(readOnly)).toEqual([
      "note thanksgiving: rosa-reyes cannot write in Family",
      "note thanksgiving: daniel-okafor cannot write in Family",
      "note thanksgiving: theo-reyes cannot write in Family",
    ]);
    const [note] = family.notes;
    if (!note) throw new Error("The Family folder has no note.");
    const outsider = withFolders([
      {
        ...family,
        notes: [
          {
            ...note,
            additions: [{ author: "priya-natarajan", text: "- Priya: pie" }],
          },
        ],
      },
    ]);
    expect(validateWorld(outsider)).toEqual([
      "note thanksgiving: priya-natarajan cannot write in Family",
    ]);
  });

  test("require plain, distinct names and note IDs unique across notes", () => {
    const [note] = family.notes;
    if (!note) throw new Error("The Family folder has no note.");
    expect(
      validateWorld(
        withFolders([
          family,
          { ...family, name: "Family", notes: [] },
          {
            name: "a/b",
            grants: [],
            notes: [{ ...note, id: "gift-ideas", additions: [] }],
          },
        ]),
      ),
    ).toEqual([
      'note ID "gift-ideas" is used more than once',
      'folder name "a/b" is not a plain name',
      "the folder Family is listed more than once",
    ]);
  });
});
