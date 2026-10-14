import type { birthCertificateFields } from "../canon/documentFields";
import { type CardArt, SPECIMEN_RED, specimenMark } from "./card";
import { FONT } from "./fonts";
import { el, text } from "./svg";

export const CERTIFICATE_PAGE = {
  width: 148,
  height: 190,
  radius: 0.4,
} as const;

export function birthCertificatePage(
  fields: ReturnType<typeof birthCertificateFields>,
): CardArt {
  const ink = "#29494d";
  const label = { family: FONT.sans, size: 2.6, fill: ink };
  const value = { family: FONT.serif, size: 3.8, fill: "#172c30" };
  const rows = [
    ["Full name", fields.fullName],
    ["Date of birth", fields.dateOfBirth],
    ["Place of birth", fields.placeOfBirth],
    ["Parent(s) recorded", fields.parentNames],
    ["Certificate number", fields.certificateNumber],
    ["Date issued", fields.dateIssued],
  ];
  return {
    defs: "",
    body: [
      el("rect", { width: 148, height: 190, fill: "#faf7ec" }),
      el("rect", {
        x: 6,
        y: 6,
        width: 136,
        height: 178,
        fill: "none",
        stroke: ink,
        "stroke-width": 0.5,
      }),
      el("rect", {
        x: 8,
        y: 8,
        width: 132,
        height: 174,
        fill: "none",
        stroke: ink,
        "stroke-width": 0.15,
      }),
      text(74, 22, "UTOPIA · CIVIL RECORDS", {
        ...label,
        anchor: "middle",
        letterSpacing: 0.8,
      }),
      text(74, 34, "Certificate of Birth", {
        ...value,
        family: FONT.display,
        size: 6,
        anchor: "middle",
      }),
      text(74, 43, fields.issuingAuthority, { ...label, anchor: "middle" }),
      ...rows.map(([name = "", content = ""], index) => {
        const y = 59 + index * 17;
        return (
          text(17, y, name.toUpperCase(), label) +
          text(17, y + 7, content, value) +
          el("path", {
            d: `M17 ${y + 10}H131`,
            stroke: "#b4c0b5",
            "stroke-width": 0.2,
          })
        );
      }),
      specimenMark(74, 104, 16),
      text(74, 169, "SPECIMEN · FICTIONAL RECORD", {
        ...label,
        fill: SPECIMEN_RED,
        anchor: "middle",
        weight: 600,
      }),
      text(74, 176, "For demonstration only · Not valid for identification", {
        ...label,
        size: 2.4,
        anchor: "middle",
      }),
    ].join(""),
  };
}
