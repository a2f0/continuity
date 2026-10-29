import { formatUsDate } from "../../canon/dates";
import type { IsoDate } from "../../canon/types";
import { FONT } from "../fonts";
import { microtext, waveField } from "../guilloche";
import { ID_PHOTO_FRAMING, portraitImage } from "../portrait";
import { el } from "../svg";
import type { LicenseInput } from "./types";

/** Primary photo frame; `f-photo-clip` in the front defs clips to it. */
export const PHOTO_BOX = {
  x: 3.4,
  y: 12.6,
  width: 23.6,
  height: 29.5,
} as const;

function compactDate(date: IsoDate): string {
  return formatUsDate(date).replaceAll("/", "").slice(0, 4) + date.slice(2, 4);
}

/** The framed primary ID photo. */
export function photo(input: LicenseInput): string {
  const box = PHOTO_BOX;
  return [
    el("rect", { ...box, rx: 0.6, fill: "#dfe6ec" }),
    el(
      "g",
      { "clip-path": "url(#f-photo-clip)" },
      portraitImage(input.portrait, box, ID_PHOTO_FRAMING),
    ),
    el("rect", {
      ...box,
      rx: 0.6,
      fill: "none",
      stroke: input.jurisdiction.palette.primary,
      "stroke-width": 0.12,
      opacity: 0.55,
    }),
  ].join("");
}

/** The gray ghost portrait with its birth-date microtext. */
export function ghostImage(input: LicenseInput): string {
  const box = { x: 69.2, y: 30.6, width: 13, height: 16.3 };
  const { palette } = input.jurisdiction;
  return [
    el(
      "g",
      {
        filter: "url(#f-gray)",
        opacity: 0.34,
        "clip-path": "url(#f-ghost-clip)",
      },
      portraitImage(input.portrait, box, ID_PHOTO_FRAMING),
    ),
    waveField({
      x: box.x,
      y: box.y + 0.5,
      width: box.width,
      height: box.height - 1,
      lines: 18,
      amplitude: 0.25,
      wavelength: 2.6,
      phaseStep: 0.5,
      stroke: palette.paper,
      strokeWidth: 0.05,
      opacity: 0.5,
    }),
    microtext(
      box.x,
      box.y + box.height + 1.2,
      box.width,
      compactDate(input.character.birthDate),
      {
        family: FONT.mono,
        fill: palette.primary,
        size: 0.95,
      },
    ),
  ].join("");
}
