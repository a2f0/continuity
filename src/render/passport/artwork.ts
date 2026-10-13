import { FONT } from "../fonts";
import { microtext, rosette, spirograph, waveField } from "../guilloche";
import { ID_PHOTO_FRAMING, portraitImage } from "../portrait";
import { seal } from "../seal";
import { el, text, upper } from "../svg";
import { DATA_PAGE, type PassportInput } from "./types";

export function background(input: PassportInput): string {
  const { palette } = input.issuer;
  return [
    el("rect", {
      width: DATA_PAGE.width,
      height: DATA_PAGE.height,
      fill: "url(#p-paper)",
    }),
    el("rect", {
      width: DATA_PAGE.width,
      height: DATA_PAGE.height,
      filter: "url(#p-grain)",
      opacity: 0.05,
    }),
    waveField({
      x: -1,
      y: 1,
      width: DATA_PAGE.width + 2,
      height: DATA_PAGE.height - 2,
      lines: 78,
      amplitude: 0.6,
      wavelength: 9,
      phaseStep: 0.24,
      modulation: 0.6,
      stroke: palette.primary,
      strokeWidth: 0.045,
      opacity: 0.15,
    }),
    rosette({
      cx: 80,
      cy: 40,
      radius: 25,
      depth: 0.07,
      petals: 40,
      strands: 11,
      stroke: palette.secondary,
      strokeWidth: 0.04,
      opacity: 0.22,
    }),
    spirograph({
      cx: 80,
      cy: 40,
      fixed: 15,
      rolling: 3.7,
      pen: 6.5,
      turns: 37,
      stroke: palette.accent,
      strokeWidth: 0.035,
      opacity: 0.32,
    }),
    seal({
      cx: 80,
      cy: 40,
      radius: 20,
      topText: `REPUBLIC OF ${upper(input.issuer.name)}`,
      bottomText: upper(input.issuer.authority),
      motif: "sun",
      color: palette.primary,
      opacity: 0.06,
    }),
  ].join("");
}

export function header(input: PassportInput): string {
  const { palette } = input.issuer;
  return [
    seal({
      cx: 10,
      cy: 8,
      radius: 4.6,
      topText: `REPUBLIC OF ${upper(input.issuer.name)}`,
      bottomText: "PASSPORT",
      motif: "sun",
      color: palette.primary,
      opacity: 0.9,
    }),
    text(16.5, 10, upper(input.issuer.name), {
      family: FONT.serif,
      fill: palette.primary,
      letterSpacing: 1.1,
      size: 5.6,
      weight: 600,
    }),
    text(119, 7.4, "PASSPORT", {
      anchor: "end",
      family: FONT.sans,
      fill: palette.primary,
      letterSpacing: 0.6,
      size: 3,
      weight: 700,
    }),
    text(119, 10.4, "PASSEPORT", {
      anchor: "end",
      family: FONT.sans,
      fill: palette.secondary,
      letterSpacing: 0.6,
      size: 2,
      weight: 500,
    }),
    el("rect", {
      x: 6,
      y: 12.4,
      width: 113,
      height: 0.3,
      fill: palette.accent,
    }),
  ].join("");
}

export function portraitBlocks(input: PassportInput): string {
  const photoBox = { x: 6, y: 16.4, width: 32, height: 40 };
  const ghostBox = { x: 107.5, y: 28.4, width: 12, height: 15 };
  return [
    el("rect", { ...photoBox, rx: 0.8, fill: "#e6ebef" }),
    el(
      "g",
      { "clip-path": "url(#p-photo-clip)" },
      portraitImage(input.portrait, photoBox, ID_PHOTO_FRAMING),
    ),
    el(
      "g",
      {
        filter: "url(#p-gray)",
        opacity: 0.3,
        "clip-path": "url(#p-ghost-clip)",
      },
      portraitImage(input.portrait, ghostBox, ID_PHOTO_FRAMING),
    ),
    microtext(
      ghostBox.x,
      ghostBox.y + ghostBox.height + 1.4,
      ghostBox.width,
      input.passport.number,
      {
        family: FONT.mono,
        fill: input.issuer.palette.primary,
        size: 0.9,
      },
    ),
  ].join("");
}
