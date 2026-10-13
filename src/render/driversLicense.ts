import { formatUsDate } from "../canon/dates";
import { formatHeight, formatWeightPounds, givenNames } from "../canon/derive";
import type {
  Character,
  DriversLicense,
  IsoDate,
  Jurisdiction,
} from "../canon/types";
import { code128, pdf417, quietZone } from "./barcode";
import {
  CARD,
  type CardArt,
  cardClip,
  fieldStyles,
  grainFilter,
  grayscaleFilter,
  inlineField,
  laminateGradient,
  paperGradient,
  SPECIMEN_RED,
  signature,
  specimenMark,
} from "./card";
import { FONT } from "./fonts";
import { microtext, rosette, spirograph, waveField } from "./guilloche";
import { ID_PHOTO_FRAMING, type Portrait, portraitImage } from "./portrait";
import { seal } from "./seal";
import { el, fitSize, num, text } from "./svg";

// A driver's license laid out on the AAMVA card design standard's numbered
// fields (1 family name, 2 given names, 3 DOB, 4a/4b issue and expiry, 4d
// number, 5 document discriminator, 8 address, 9 class, ...). The jurisdiction
// supplies the palette, seal, and wording, so the design is original.

export interface LicenseInput {
  readonly character: Character;
  readonly license: DriversLicense;
  readonly jurisdiction: Jurisdiction;
  readonly expires: IsoDate;
  readonly portrait: Portrait;
}

function compactDate(date: IsoDate): string {
  return formatUsDate(date).replaceAll("/", "").slice(0, 4) + date.slice(2, 4);
}

function upper(value: string): string {
  return value.toLocaleUpperCase("en-US");
}

function background(
  prefix: string,
  input: LicenseInput,
  intensity: number,
): string {
  const { palette } = input.jurisdiction;
  return [
    el("rect", {
      width: CARD.width,
      height: CARD.height,
      fill: `url(#${prefix}-paper)`,
    }),
    el("rect", {
      width: CARD.width,
      height: CARD.height,
      filter: `url(#${prefix}-grain)`,
      opacity: 0.06,
    }),
    waveField({
      x: -1,
      y: 1,
      width: CARD.width + 2,
      height: CARD.height - 2,
      lines: 52,
      amplitude: 0.5,
      wavelength: 7.2,
      phaseStep: 0.28,
      modulation: 0.55,
      stroke: palette.primary,
      strokeWidth: 0.04,
      opacity: 0.2 * intensity,
    }),
    rosette({
      cx: 56,
      cy: 32,
      radius: 15.5,
      depth: 0.09,
      petals: 28,
      strands: 9,
      stroke: palette.secondary,
      strokeWidth: 0.035,
      opacity: 0.32 * intensity,
    }),
    spirograph({
      cx: 56,
      cy: 32,
      fixed: 9.5,
      rolling: 2.3,
      pen: 4.2,
      turns: 23,
      stroke: palette.accent,
      strokeWidth: 0.03,
      opacity: 0.4 * intensity,
    }),
    seal({
      cx: 56,
      cy: 32,
      radius: 12.5,
      topText: `STATE OF ${upper(input.jurisdiction.name)}`,
      bottomText: upper(input.jurisdiction.motto),
      motif: "forest",
      color: palette.primary,
      opacity: 0.07 * intensity,
    }),
  ].join("");
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

function addressLines(character: Character): [string, string] {
  const { street, unit, city, region, postalCode } = character.address;
  return [
    upper(unit ? `${street} ${unit}` : street),
    upper(`${city}, ${region} ${postalCode}`),
  ];
}

function identityFields(input: LicenseInput): string {
  const { character, license, jurisdiction } = input;
  const styles = fieldStyles(jurisdiction.palette);
  const x = 29.4;
  const family = upper(character.name.family);
  const given = upper(givenNames(character));
  const [street, locality] = addressLines(character);
  return [
    inlineField(x, 15.2, "4d DLN", license.number, styles, {
      family: FONT.mono,
      fill: SPECIMEN_RED,
      size: 2.6,
    }),
    inlineField(68.5, 15.2, "9 CLASS", license.class, styles, { size: 2.4 }),
    inlineField(x, 19.4, "1", family, styles, {
      size: fitSize(family, 50, 2.9, 0.5),
      weight: 700,
    }),
    inlineField(x, 22.8, "2", given, styles, {
      size: fitSize(given, 50, 2.5, 0.5),
    }),
    inlineField(x, 26.2, "8", street, styles, {
      size: fitSize(street, 50, 1.9, 0.5),
      weight: 500,
    }),
    text(x + 1.1, 28.6, locality, {
      ...styles.value,
      size: fitSize(locality, 50, 1.9, 0.5),
      weight: 500,
    }),
  ].join("");
}

function physicalFields(input: LicenseInput): string {
  const { character, license, jurisdiction, expires } = input;
  const styles = fieldStyles(jurisdiction.palette);
  const { appearance } = character;
  const x = 29.4;
  const column = 47.6;
  const endorsements = license.endorsements?.join("") || "NONE";
  const restrictions = license.restrictions?.join("") || "NONE";
  return [
    inlineField(x, 32.6, "3 DOB", formatUsDate(character.birthDate), styles, {
      fill: SPECIMEN_RED,
      size: 2.9,
      weight: 700,
    }),
    inlineField(x, 36.2, "4b EXP", formatUsDate(expires), styles, {
      size: 2.3,
      weight: 700,
    }),
    inlineField(x, 39.6, "4a ISS", formatUsDate(license.issued), styles),
    inlineField(column, 36.2, "15 SEX", character.sex, styles),
    inlineField(
      column,
      39.6,
      "16 HGT",
      formatHeight(appearance.heightCm),
      styles,
    ),
    inlineField(x, 43, "18 EYES", appearance.eyes, styles),
    inlineField(column, 43, "19 HAIR", appearance.hair, styles),
    inlineField(x, 46.4, "9a END", endorsements, styles),
    inlineField(
      column,
      46.4,
      "17 WGT",
      formatWeightPounds(appearance.weightKg),
      styles,
    ),
    inlineField(x, 49.8, "12 RSTR", restrictions, styles),
    inlineField(column, 49.8, "5 DD", license.documentDiscriminator, styles, {
      family: FONT.mono,
      size: 1.45,
      weight: 500,
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
        fill: SPECIMEN_RED,
      }),
      text(73, y + 0.9, "DONOR", {
        family: FONT.sans,
        fill: SPECIMEN_RED,
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
      specimenMark(46, 37, 8.6),
      el("rect", {
        width: CARD.width,
        height: CARD.height,
        fill: "url(#f-laminate)",
      }),
    ].join(""),
  );
  return { body, defs: frontDefs(input) };
}

function barcodePayload(input: LicenseInput): string {
  const { character, license, jurisdiction, expires } = input;
  return [
    "CONTINUITY SPECIMEN - NOT A GOVERNMENT DOCUMENT",
    `${upper(jurisdiction.agency)}`,
    `DL ${license.number} CLASS ${license.class}`,
    `${upper(character.name.family)}, ${upper(givenNames(character))}`,
    `DOB ${character.birthDate} ISS ${license.issued} EXP ${expires}`,
    addressLines(character).join(", "),
    `DD ${license.documentDiscriminator}`,
  ].join("\n");
}

function legend(input: LicenseInput): string {
  const { license, jurisdiction } = input;
  const { palette } = jurisdiction;
  const label = {
    family: FONT.sans,
    fill: palette.primary,
    size: 1.35,
    weight: 700,
  };
  const value = {
    family: FONT.sans,
    fill: palette.ink,
    size: 1.45,
    weight: 500,
  };
  const describe = (
    codes: readonly string[] | undefined,
    table: Readonly<Record<string, string>>,
  ) =>
    codes && codes.length > 0
      ? codes.map((code) => `${code}  ${table[code] ?? ""}`).join("   ")
      : "NONE";
  const rows: [string, string][] = [
    ["CLASS", `${license.class}  ${jurisdiction.classes[license.class] ?? ""}`],
    ["ENDORSEMENTS", describe(license.endorsements, jurisdiction.endorsements)],
    ["RESTRICTIONS", describe(license.restrictions, jurisdiction.restrictions)],
  ];
  return rows
    .map(
      ([name, content], index) =>
        text(4.2, 29.6 + index * 2.7, name, label) +
        text(19.5, 29.6 + index * 2.7, upper(content), value),
    )
    .join("");
}

function finePrint(input: LicenseInput): string {
  const { jurisdiction, license } = input;
  const style = {
    family: FONT.sans,
    fill: jurisdiction.palette.ink,
    opacity: 0.82,
    size: 1.12,
    weight: 400,
  };
  const lines = [
    `This license is the property of the ${jurisdiction.agency} and must be surrendered on request.`,
    `Altering, lending, or duplicating this card is unlawful. Report a lost card at dol.${jurisdiction.id}.example.`,
  ];
  const donorLine = license.donor
    ? text(4.2, 38.4, "ORGAN AND TISSUE DONOR — REGISTERED", {
        family: FONT.sans,
        fill: SPECIMEN_RED,
        size: 1.4,
        weight: 700,
      })
    : "";
  return (
    donorLine +
    lines
      .map((line, index) => text(4.2, 41.6 + index * 1.75, line, style))
      .join("")
  );
}

export function driversLicenseBack(input: LicenseInput): CardArt {
  const { palette } = input.jurisdiction;
  const defs = [
    cardClip("b-card"),
    paperGradient("b-paper", palette),
    laminateGradient("b-laminate"),
    grainFilter("b-grain", 23),
  ].join("");
  const bar = { x: 4.3, y: 5.6, width: 77, height: 19.2 };
  const body = el(
    "g",
    { "clip-path": "url(#b-card)" },
    [
      background("b", input, 0.7),
      el("rect", { width: CARD.width, height: 3.4, fill: palette.primary }),
      microtext(
        3.4,
        2.15,
        78.8,
        `${upper(input.jurisdiction.name)} · ${upper(input.jurisdiction.motto)} · `,
        {
          family: FONT.sans,
          fill: "#ffffff",
          size: 0.7,
        },
      ),
      quietZone({ x: 3.3, y: 4.6, width: 79, height: 21.2 }, "#ffffff"),
      pdf417(barcodePayload(input), { ...bar, color: "#111418" }),
      legend(input),
      finePrint(input),
      quietZone({ x: 55.4, y: 46, width: 27.4, height: 6.4 }, "#ffffff"),
      code128(input.license.documentDiscriminator, {
        x: 56.4,
        y: 46.6,
        width: 25.4,
        height: 5.2,
        color: "#111418",
      }),
      text(
        4.2,
        51.4,
        `ISS ${formatUsDate(input.license.issued)}   REV 03/2022   ICN ${input.license.documentDiscriminator.slice(0, 10)}`,
        {
          family: FONT.mono,
          fill: palette.ink,
          size: 1.2,
          weight: 500,
        },
      ),
      specimenMark(43, 30, 8.6),
      el("rect", {
        width: CARD.width,
        height: CARD.height,
        fill: "url(#b-laminate)",
      }),
    ].join(""),
  );
  return { body, defs };
}
