import { describe, expect, test } from "bun:test";
import { world } from "../../canon/world";
import { findCharacter } from "../canon/derive";
import { AVATAR_SIZE, renderAvatar } from "./avatar";
import { imageSize } from "./imageSize";
import { cropAroundFace, ID_PHOTO_FRAMING, loadPortrait } from "./portrait";

const maya = findCharacter(world, "maya-reyes");

describe("portraits", () => {
  test("reflects appearance changes for the same character ID", () => {
    const character = { ...maya, id: "test-placeholder" };
    const first = loadPortrait(character);
    const changed = loadPortrait({
      ...character,
      appearance: { ...character.appearance, clothing: "#ff0000" },
    });
    const repeated = loadPortrait(character);
    expect(first.source).toBe("placeholder");
    expect(Buffer.from(first.bytes).equals(Buffer.from(changed.bytes))).toBe(
      false,
    );
    expect(Buffer.from(first.bytes).equals(Buffer.from(repeated.bytes))).toBe(
      true,
    );
  });

  test("renders square PNG avatars at tearleads' size", () => {
    const size = imageSize(renderAvatar(loadPortrait(maya)).png);
    expect(size).toEqual({
      height: AVATAR_SIZE,
      mimeType: "image/png",
      width: AVATAR_SIZE,
    });
  });
});

describe("cropAroundFace", () => {
  test("keeps the crop inside the image", () => {
    const portrait = {
      ...loadPortrait(findCharacter(world, "rosa-reyes")),
      face: { cx: 30, cy: 40, height: 400 },
    };
    const crop = cropAroundFace(portrait, ID_PHOTO_FRAMING);
    expect(crop.x).toBe(0);
    expect(crop.y).toBe(0);
    expect(crop.width / crop.height).toBeCloseTo(0.8);
  });
});
