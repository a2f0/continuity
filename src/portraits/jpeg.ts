import { imageSize } from "../render/imageSize";
import { rasterize, toJpeg } from "../render/raster";
import { dataUri, el } from "../render/svg";

// Portraits are stored as JPEG no larger than documents need. A photographic
// PNG runs several times the size of the same JPEG, and every portrait stays
// in history, so imports are transcoded and, when oversized, scaled down.

const MAX_EDGE = 1536;
const QUALITY = 92;

export function portraitJpeg(bytes: Uint8Array): Uint8Array {
  const { height, mimeType, width } = imageSize(bytes);
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  if (mimeType === "image/jpeg" && scale === 1) {
    return bytes;
  }
  // Flatten any transparency onto white; JPEG has no alpha.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${el("rect", { width, height, fill: "#ffffff" })}${el("image", { width, height, href: dataUri(mimeType, bytes) })}</svg>`;
  return toJpeg(rasterize(svg, Math.round(width * scale)), QUALITY);
}
