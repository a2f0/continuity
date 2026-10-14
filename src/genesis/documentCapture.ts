import { seededRandom } from "../render/card";

export const JPEG_QUALITY = 88;
export const CARD_WIDTH_PX = 1600;
export const PAGE_WIDTH_PX = 2000;

/** Each capture gets its own small tilt and glare, fixed per character. */
export function capture(seed: string) {
  const random = seededRandom(seed);
  return {
    glareAngle: Math.round(random() * 60) - 10,
    rotation: Math.round((random() * 2.6 - 1.3) * 10) / 10,
  };
}
