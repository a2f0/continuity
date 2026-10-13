import { formatIcaoDate, formatMrzDate } from "../canon/dates";
import { givenNames } from "../canon/derive";
import type {
  Character,
  IsoDate,
  Passport,
  PassportIssuer,
} from "../canon/types";
import {
  type CardArt,
  grainFilter,
  grayscaleFilter,
  laminateGradient,
  paperGradient,
  signature,
  specimenMark,
} from "./card";
import { FONT } from "./fonts";
import { microtext, rosette, spirograph, waveField } from "./guilloche";
import { passportMrz } from "./mrz";
import { ID_PHOTO_FRAMING, type Portrait, portraitImage } from "./portrait";
import { seal } from "./seal";
import { el, fitSize, text } from "./svg";

// A TD3 passport data page (125 x 88 mm) laid out per ICAO Doc 9303: photo on
// the left, bilingual captions, and a two-line machine readable zone whose
// check digits are computed, not invented.

export const DATA_PAGE = { width: 125, height: 88, radius: 2.5 } as const;

export interface PassportInput {
  readonly character: Character;
  readonly passport: Passport;
  readonly issuer: PassportIssuer;
  readonly expires: IsoDate;
  readonly portrait: Portrait;
}

function upper(value: string): string {
  return value.toLocaleUpperCase("en-US");
}

function background(input: PassportInput): string {
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

function header(input: PassportInput): string {
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

interface Field {
  readonly x: number;
  readonly y: number;
  readonly caption: string;
  readonly value: string;
  readonly width: number;
}

function field(input: PassportInput, item: Field): string {
  const { palette } = input.issuer;
  return (
    text(item.x, item.y, item.caption, {
      family: FONT.sans,
      fill: palette.secondary,
      size: 1.45,
      weight: 500,
    }) +
    text(item.x, item.y + 3.3, item.value, {
      family: FONT.sans,
      fill: palette.ink,
      size: fitSize(item.value, item.width, 2.6, 0.5),
      weight: 600,
    })
  );
}

function dataFields(input: PassportInput): string {
  const { character, passport, issuer, expires } = input;
  const left = 43;
  const right = 80;
  const rows = [15.4, 22.3, 29.2, 36.1, 43, 49.9, 56.8];
  const fields: Field[] = [
    { x: left, y: rows[0] ?? 0, caption: "Type / Type", value: "P", width: 8 },
    {
      x: 55,
      y: rows[0] ?? 0,
      caption: "Code / Code",
      value: issuer.code,
      width: 12,
    },
    {
      x: right,
      y: rows[0] ?? 0,
      caption: "Passport No. / N° du passeport",
      value: passport.number,
      width: 30,
    },
    {
      x: left,
      y: rows[1] ?? 0,
      caption: "Surname / Nom",
      value: upper(character.name.family),
      width: 70,
    },
    {
      x: left,
      y: rows[2] ?? 0,
      caption: "Given names / Prénoms",
      value: upper(givenNames(character)),
      width: 70,
    },
    {
      x: left,
      y: rows[3] ?? 0,
      caption: "Nationality / Nationalité",
      value: issuer.nationality,
      width: 34,
    },
    {
      x: right,
      y: rows[3] ?? 0,
      caption: "Sex / Sexe",
      value: character.sex,
      width: 10,
    },
    {
      x: left,
      y: rows[4] ?? 0,
      caption: "Date of birth / Date de naissance",
      value: formatIcaoDate(character.birthDate),
      width: 34,
    },
    {
      x: right,
      y: rows[4] ?? 0,
      caption: "Place of birth / Lieu de naissance",
      value: upper(character.birthPlace),
      width: 26,
    },
    {
      x: left,
      y: rows[5] ?? 0,
      caption: "Date of issue / Date de délivrance",
      value: formatIcaoDate(passport.issued),
      width: 34,
    },
    {
      x: right,
      y: rows[5] ?? 0,
      caption: "Authority / Autorité",
      value: upper(issuer.authority),
      width: 26,
    },
    {
      x: left,
      y: rows[6] ?? 0,
      caption: "Date of expiry / Date d'expiration",
      value: formatIcaoDate(expires),
      width: 34,
    },
  ];
  return fields.map((item) => field(input, item)).join("");
}

function signatureBlock(input: PassportInput): string {
  return (
    text(80, 56.8, "Holder's signature / Signature du titulaire", {
      family: FONT.sans,
      fill: input.issuer.palette.secondary,
      size: 1.45,
      weight: 500,
    }) +
    el(
      "g",
      { "clip-path": "url(#p-signature-clip)" },
      signature(input.character, 80.5, 63.2, 26),
    )
  );
}

function portraitBlocks(input: PassportInput): string {
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

function machineReadableZone(input: PassportInput): string {
  const { character, passport, issuer, expires } = input;
  const lines = passportMrz({
    birthDate: formatMrzDate(character.birthDate),
    documentNumber: passport.number,
    expiryDate: formatMrzDate(expires),
    givenNames: givenNames(character),
    issuingState: issuer.code,
    nationality: issuer.code,
    sex: character.sex,
    surname: character.name.family,
  });
  const style = { family: FONT.mono, fill: "#15171a", size: 3.55, weight: 500 };
  return [
    el("rect", {
      x: 0,
      y: 67.6,
      width: DATA_PAGE.width,
      height: 20.4,
      fill: "#fbf8f1",
      opacity: 0.72,
    }),
    ...lines.map((line, index) =>
      text(6, 75.6 + index * 6.6, line, style, {
        textLength: 113,
        lengthAdjust: "spacing",
      }),
    ),
  ].join("");
}

export function passportDataPage(input: PassportInput): CardArt {
  const defs = [
    el(
      "clipPath",
      { id: "p-page" },
      el("rect", {
        width: DATA_PAGE.width,
        height: DATA_PAGE.height,
        rx: DATA_PAGE.radius,
      }),
    ),
    paperGradient("p-paper", input.issuer.palette),
    laminateGradient("p-laminate"),
    grayscaleFilter("p-gray"),
    grainFilter("p-grain", 31),
    el(
      "clipPath",
      { id: "p-photo-clip" },
      el("rect", { x: 6, y: 16.4, width: 32, height: 40, rx: 0.8 }),
    ),
    el(
      "clipPath",
      { id: "p-ghost-clip" },
      el("ellipse", { cx: 113.5, cy: 35.9, rx: 6, ry: 7.5 }),
    ),
    el(
      "clipPath",
      { id: "p-signature-clip" },
      el("rect", { x: 79, y: 58, width: 40, height: 8.6 }),
    ),
  ].join("");
  const body = el(
    "g",
    { "clip-path": "url(#p-page)" },
    [
      background(input),
      header(input),
      portraitBlocks(input),
      dataFields(input),
      signatureBlock(input),
      machineReadableZone(input),
      specimenMark(64, 42, 13),
      el("rect", {
        width: DATA_PAGE.width,
        height: DATA_PAGE.height,
        fill: "url(#p-laminate)",
      }),
    ].join(""),
  );
  return { body, defs };
}
