import { AVATAR_FRAMING, type Portrait, portraitImage } from "./portrait";
import { type Raster, rasterize } from "./raster";

// A square contact photo cut from the canonical portrait. tearleads stores
// contact avatars as PNGs of at most 512 px, already cropped.

export const AVATAR_SIZE = 512;

export function renderAvatar(portrait: Portrait, size = AVATAR_SIZE): Raster {
  const box = { x: 0, y: 0, width: size, height: size };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${portraitImage(portrait, box, AVATAR_FRAMING)}</svg>`;
  return rasterize(svg, size);
}
