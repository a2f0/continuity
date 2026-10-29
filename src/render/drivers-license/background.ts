import { CARD } from "../card";
import { rosette, spirograph, waveField } from "../guilloche";
import { seal } from "../seal";
import { el, upper } from "../svg";
import type { LicenseInput } from "./types";

export function background(
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

/** Front-only hills along the bottom edge, drawn over the guilloche. */
export function landscape(input: LicenseInput): string {
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
