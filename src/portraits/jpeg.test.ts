import { describe, expect, test } from "bun:test";
import { imageSize } from "../render/imageSize";
import { rasterize, toJpeg } from "../render/raster";
import { portraitJpeg } from "./jpeg";

function raster(width: number, height: number) {
  return rasterize(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="#8aa0b4"/></svg>`,
    width,
  );
}

describe("portraitJpeg", () => {
  test("transcodes a PNG to a JPEG of the same size", () => {
    const jpeg = portraitJpeg(raster(300, 450).png);
    expect(imageSize(jpeg)).toEqual({
      height: 450,
      mimeType: "image/jpeg",
      width: 300,
    });
  });

  test("keeps a JPEG that is small enough byte for byte", () => {
    const jpeg = toJpeg(raster(300, 450), 90);
    expect(portraitJpeg(jpeg)).toBe(jpeg);
  });

  test("scales an oversized image down to a 1536 px long edge", () => {
    const jpeg = portraitJpeg(toJpeg(raster(1200, 2400), 90));
    expect(imageSize(jpeg)).toEqual({
      height: 1536,
      mimeType: "image/jpeg",
      width: 768,
    });
  });
});
