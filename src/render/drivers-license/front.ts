import { formatUsDate } from "../../canon/dates";
import type { IsoDate } from "../../canon/types";
import {
  ACCENT_RED,
  CARD,
  type CardArt,
  cardClip,
  grainFilter,
  grayscaleFilter,
  laminateGradient,
  paperGradient,
  signature,
} from "../card";
import { FONT } from "../fonts";
import { microtext, waveField } from "../guilloche";
import { ID_PHOTO_FRAMING, portraitImage } from "../portrait";
import { seal } from "../seal";
import { el, fitSize, num, text, upper } from "../svg";
import { background } from "./background";
import { identityFields, physicalFields } from "./fields";
import type { LicenseInput } from "./types";

function compactDate(date: IsoDate): string {
  return formatUsDate(date).replaceAll("/", "").slice(0, 4) + date.slice(2, 4);
}

function landscape(input: LicenseInput): string {
  const { palette } = input.jurisdiction;
  const ridge =
    "M0 46L6 42.5L11 44.2L18 38.6L24 42L30 39.8L37 43.4L45 37.2L52 41.6L58 39.4L66 43L73 38.4L80 41.8L85.6 40V53.98H0Z";
  const front =
    "M0 49.5L8 47.2L15 48.6L23 46L31 48.2L40 46.4L49 48.8L57 46.6L66 48.4L75 46.2L85.6 48V53.98H0Z";
  return [
    el("path", { d: ridge, fill: palette.secondary, opacity: 0.1 }),
    el("path", { d: front, fill: palette.primary, opacity: 0.08 }),
  ].join("");
}

function header(input: LicenseInput): string {
  const { palette } = input.jurisdiction;
  const name = upper(input.jurisdiction.name);
  return [
    el("rect", { width: CARD.width, height: 10.4, fill: "url(#f-header)" }),
    waveField({
      x: 0,
      y: 0.8,
      width: CARD.width,
      height: 8.8,
      lines: 9,
      amplitude: 0.35,
      wavelength: 5,
      phaseStep: 0.7,
      stroke: "#ffffff",
      strokeWidth: 0.04,
      opacity: 0.18,
    }),
    el("rect", {
      y: 10.4,
      width: CARD.width,
      height: 0.35,
      fill: palette.accent,
    }),
    seal({
      cx: 6.7,
      cy: 5.2,
      radius: 4,
      topText: `STATE OF ${name}`,
      bottomText: upper(input.jurisdiction.motto),
      motif: "forest",
      color: "#ffffff",
      opacity: 0.92,
    }),
    text(12, 7.6, name, {
      family: FONT.display,
      fill: "#ffffff",
      letterSpacing: 0.55,
      size: fitSize(name, 40, 5.8, 0.72, 0.55),
    }),
    text(82.6, 4, input.jurisdiction.country, {
      anchor: "end",
      family: FONT.sans,
      fill: "#ffffff",
      letterSpacing: 0.3,
      size: 1.9,
      weight: 600,
    }),
    text(82.6, 7.6, "DRIVER LICENSE", {
      anchor: "end",
      family: FONT.sans,
      fill: "#ffffff",
      letterSpacing: 0.18,
      size: 2.8,
      weight: 700,
    }),
  ].join("");
}

function photo(input: LicenseInput): string {
  const box = { x: 3.4, y: 12.6, width: 23.6, height: 29.5 };
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

function ghostImage(input: LicenseInput): string {
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

function badges(input: LicenseInput): string {
  const badgesText: string[] = [];
  let y = 26.2;
  if (input.license.donor) {
    badgesText.push(
      el("path", {
        d: `M70.6 ${num(y - 0.6)}c-0.5-0.9-1.9-0.7-1.9 0.4c0 0.9 1.2 1.6 1.9 2.2c0.7-0.6 1.9-1.3 1.9-2.2c0-1.1-1.4-1.3-1.9-0.4z`,
        fill: ACCENT_RED,
      }),
      text(73, y + 0.9, "DONOR", {
        family: FONT.sans,
        fill: ACCENT_RED,
        size: 1.6,
        weight: 700,
      }),
    );
    y -= 3;
  }
  if (input.license.veteran) {
    badgesText.push(
      text(69, y + 0.9, "VETERAN", {
        family: FONT.sans,
        fill: input.jurisdiction.palette.primary,
        size: 1.6,
        weight: 700,
      }),
    );
  }
  return badgesText.join("");
}

function frontDefs(input: LicenseInput): string {
  const { palette } = input.jurisdiction;
  return [
    cardClip("f-card"),
    paperGradient("f-paper", palette),
    laminateGradient("f-laminate"),
    grayscaleFilter("f-gray"),
    grainFilter("f-grain", 11),
    el(
      "linearGradient",
      { id: "f-header", x1: 0, y1: 0, x2: 1, y2: 0 },
      el("stop", { offset: 0, "stop-color": palette.primary }) +
        el("stop", { offset: 1, "stop-color": palette.secondary }),
    ),
    el(
      "clipPath",
      { id: "f-photo-clip" },
      el("rect", { x: 3.4, y: 12.6, width: 23.6, height: 29.5, rx: 0.6 }),
    ),
    el(
      "clipPath",
      { id: "f-signature-clip" },
      el("rect", { x: 2.4, y: 42.6, width: 25.6, height: 10 }),
    ),
    el(
      "clipPath",
      { id: "f-ghost-clip" },
      el("ellipse", { cx: 75.7, cy: 38.75, rx: 6.3, ry: 8 }),
    ),
  ].join("");
}

export function driversLicenseFront(input: LicenseInput): CardArt {
  const body = el(
    "g",
    { "clip-path": "url(#f-card)" },
    [
      background("f", input, 1),
      landscape(input),
      header(input),
      microtext(3.4, 11.95, 78.8, `${upper(input.jurisdiction.agency)} · `, {
        family: FONT.sans,
        fill: input.jurisdiction.palette.primary,
        size: 0.62,
      }),
      photo(input),
      el(
        "g",
        { "clip-path": "url(#f-signature-clip)" },
        signature(input.character, 3.8, 47.6, 22.4),
      ),
      identityFields(input),
      physicalFields(input),
      ghostImage(input),
      badges(input),
      el("rect", {
        width: CARD.width,
        height: CARD.height,
        fill: "url(#f-laminate)",
      }),
    ].join(""),
  );
  return { body, defs: frontDefs(input) };
}
