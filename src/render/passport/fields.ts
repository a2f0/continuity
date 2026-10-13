import { formatIcaoDate, formatMrzDate } from "../../canon/dates";
import { givenNames } from "../../canon/derive";
import { signature } from "../card";
import { FONT } from "../fonts";
import { passportMrz } from "../mrz";
import { el, fitSize, text, upper } from "../svg";
import { DATA_PAGE, type PassportInput } from "./types";

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

export function dataFields(input: PassportInput): string {
  const { character, passport, issuer, expires } = input;
  const left = 43;
  const right = 80;
  const rows = [15.4, 22.3, 29.2, 36.1, 43, 49.9, 56.8] as const;
  const fields: Field[] = [
    { x: left, y: rows[0], caption: "Type / Type", value: "P", width: 8 },
    {
      x: 55,
      y: rows[0],
      caption: "Code / Code",
      value: issuer.code,
      width: 12,
    },
    {
      x: right,
      y: rows[0],
      caption: "Passport No. / N° du passeport",
      value: passport.number,
      width: 30,
    },
    {
      x: left,
      y: rows[1],
      caption: "Surname / Nom",
      value: upper(character.name.family),
      width: 70,
    },
    {
      x: left,
      y: rows[2],
      caption: "Given names / Prénoms",
      value: upper(givenNames(character)),
      width: 70,
    },
    {
      x: left,
      y: rows[3],
      caption: "Nationality / Nationalité",
      value: issuer.nationality,
      width: 34,
    },
    {
      x: right,
      y: rows[3],
      caption: "Sex / Sexe",
      value: character.sex,
      width: 10,
    },
    {
      x: left,
      y: rows[4],
      caption: "Date of birth / Date de naissance",
      value: formatIcaoDate(character.birthDate),
      width: 34,
    },
    {
      x: right,
      y: rows[4],
      caption: "Place of birth / Lieu de naissance",
      value: upper(character.birthPlace),
      width: 26,
    },
    {
      x: left,
      y: rows[5],
      caption: "Date of issue / Date de délivrance",
      value: formatIcaoDate(passport.issued),
      width: 34,
    },
    {
      x: right,
      y: rows[5],
      caption: "Authority / Autorité",
      value: upper(issuer.authority),
      width: 26,
    },
    {
      x: left,
      y: rows[6],
      caption: "Date of expiry / Date d'expiration",
      value: formatIcaoDate(expires),
      width: 34,
    },
  ];
  return fields.map((item) => field(input, item)).join("");
}

export function signatureBlock(input: PassportInput): string {
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

export function machineReadableZone(input: PassportInput): string {
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
