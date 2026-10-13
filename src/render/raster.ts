import { Resvg } from "@resvg/resvg-js";
import jpeg from "jpeg-js";
import { FONT, fontFiles } from "./fonts";

// SVG to raster. resvg renders in software with vendored fonts and jpeg-js
// encodes in plain JavaScript, so the same SVG yields the same bytes on macOS
// and Linux, which is what lets CI verify checked-in images byte for byte.

export interface Raster {
  readonly width: number;
  readonly height: number;
  /** Straight (not premultiplied) RGBA. */
  readonly pixels: Uint8Array;
  readonly png: Uint8Array;
}

export function rasterize(svg: string, widthPx: number): Raster {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: widthPx },
    font: {
      defaultFontFamily: FONT.sans,
      fontFiles: [...fontFiles()],
      loadSystemFonts: false,
    },
    shapeRendering: 2,
    textRendering: 2,
    imageRendering: 0,
  });
  const image = resvg.render();
  return {
    height: image.height,
    pixels: new Uint8Array(image.pixels),
    png: new Uint8Array(image.asPng()),
    width: image.width,
  };
}

/** Encode an opaque raster as a baseline JPEG. */
export function toJpeg(raster: Raster, quality: number): Uint8Array {
  const encoded = jpeg.encode(
    {
      data: Buffer.from(raster.pixels),
      height: raster.height,
      width: raster.width,
    },
    quality,
  );
  return new Uint8Array(encoded.data);
}
