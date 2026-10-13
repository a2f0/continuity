import { formatUsDate } from "../../canon/dates";
import { givenNames } from "../../canon/derive";
import { code128, pdf417, quietZone } from "../barcode";
import {
  CARD,
  type CardArt,
  cardClip,
  grainFilter,
  laminateGradient,
  paperGradient,
  SPECIMEN_RED,
  specimenMark,
} from "../card";
import { FONT } from "../fonts";
import { microtext } from "../guilloche";
import { el, text, upper } from "../svg";
import { background } from "./background";
import { addressLines } from "./fields";
import type { LicenseInput } from "./types";

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
