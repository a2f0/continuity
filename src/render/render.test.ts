import { describe, expect, test } from "bun:test";
import { world } from "../../canon/world";
import { findCharacter } from "../canon/derive";
import { renderDocuments } from "../genesis/documents";
import { AVATAR_SIZE, renderAvatar } from "./avatar";
import { imageSize } from "./imageSize";
import { cropAroundFace, ID_PHOTO_FRAMING, loadPortrait } from "./portrait";

describe("document rendering", () => {
  const maya = findCharacter(world, "maya-reyes");

  test("renders the same bytes every time", () => {
    const first = renderDocuments(world, maya);
    const second = renderDocuments(world, maya);
    expect(first.driversLicenseFront).toBeDefined();
    expect(
      Buffer.from(first.driversLicenseFront ?? []).equals(
        Buffer.from(second.driversLicenseFront ?? []),
      ),
    ).toBe(true);
  });

  test("renders photographed JPEGs of each document", () => {
    const documents = renderDocuments(world, maya);
    for (const bytes of [
      documents.driversLicenseFront,
      documents.driversLicenseBack,
      documents.passport,
    ]) {
      const size = imageSize(bytes ?? new Uint8Array());
      expect(size.mimeType).toBe("image/jpeg");
      expect(size.width).toBeGreaterThanOrEqual(1600);
    }
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
