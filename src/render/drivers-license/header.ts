import { CARD } from "../card";
import { FONT } from "../fonts";
import { waveField } from "../guilloche";
import { seal } from "../seal";
import { el, fitSize, text, upper } from "../svg";
import type { LicenseInput } from "./types";

/** The front's colored banner: seal, jurisdiction name, and document title. */
export function header(input: LicenseInput): string {
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
