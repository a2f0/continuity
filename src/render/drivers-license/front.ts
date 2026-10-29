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
import { microtext } from "../guilloche";
import { el, num, text, upper } from "../svg";
import { background, landscape } from "./background";
import { identityFields, physicalFields } from "./fields";
import { header } from "./header";
import { ghostImage, PHOTO_BOX, photo } from "./portraits";
import type { LicenseInput } from "./types";

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
      el("rect", { ...PHOTO_BOX, rx: 0.6 }),
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
