import { describe, expect, test } from "bun:test";
import { imageSize } from "../render/imageSize";
import type { Portrait } from "../render/portrait";
import { rasterize } from "../render/raster";
import { framingPreview } from "./preview";

describe("framingPreview", () => {
  test("lays the source beside its ID photo and avatar crops", () => {
    const portrait: Portrait = {
      bytes: rasterize(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="400" height="600" fill="#8aa0b4"/></svg>',
        400,
      ).png,
      face: { cx: 200, cy: 220, height: 200 },
      height: 600,
      mimeType: "image/png",
      source: "photo",
      width: 400,
    };
    // 480 source + 24 gap + 576 ID photo + 24 gap + 360 avatar.
    expect(imageSize(framingPreview(portrait))).toEqual({
      height: 720,
      mimeType: "image/png",
      width: 1464,
    });
  });
});
