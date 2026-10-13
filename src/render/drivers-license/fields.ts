import { formatUsDate } from "../../canon/dates";
import {
  formatHeight,
  formatWeightPounds,
  givenNames,
} from "../../canon/derive";
import type { Character } from "../../canon/types";
import { fieldStyles, inlineField, SPECIMEN_RED } from "../card";
import { FONT } from "../fonts";
import { fitSize, text, upper } from "../svg";
import type { LicenseInput } from "./types";

export function addressLines(character: Character): [string, string] {
  const { street, unit, city, region, postalCode } = character.address;
  return [
    upper(unit ? `${street} ${unit}` : street),
    upper(`${city}, ${region} ${postalCode}`),
  ];
}

export function identityFields(input: LicenseInput): string {
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

export function physicalFields(input: LicenseInput): string {
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
