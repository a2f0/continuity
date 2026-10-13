import { signatureText } from "../canon/derive";
import type { Character, Palette } from "../canon/types";
import {
  FONT,
  SIGNATURE_FONT_ADVANCE,
  SIGNATURE_FONT_FAMILY,
  SIGNATURE_FONT_SCALE,
} from "./fonts";
import { el, fitSize, num, type TextStyle, text } from "./svg";

// Shared pieces for ID-1 cards (85.60 x 53.98 mm, ISO/IEC 7810).

export const CARD = { width: 85.6, height: 53.98, radius: 3.18 } as const;

export const SPECIMEN_RED = "#a3232b";

const SIGNATURE_INK = "#1d2340";

/** A rendered document face: its <defs> and the body drawn in document units. */
export interface CardArt {
  readonly defs: string;
  readonly body: string;
}

export function signature(
  character: Character,
  x: number,
  y: number,
  width: number,
): string {
  const content = signatureText(character);
  const { font } = character.signature;
  const scale = SIGNATURE_FONT_SCALE[font];
  return text(x, y, content, {
    family: SIGNATURE_FONT_FAMILY[font],
    fill: SIGNATURE_INK,
    size: fitSize(
      content,
      width,
      4.6 * scale,
      SIGNATURE_FONT_ADVANCE[font] * scale,
    ),
  });
}

export function cardClip(id: string): string {
  return el(
    "clipPath",
    { id },
    el("rect", {
      width: CARD.width,
      height: CARD.height,
      rx: CARD.radius,
    }),
  );
}

export function paperGradient(id: string, palette: Palette): string {
  return el(
    "linearGradient",
    { id, x1: 0, y1: 0, x2: 1, y2: 1 },
    [
      el("stop", { offset: 0, "stop-color": palette.paper }),
      el("stop", { offset: 0.55, "stop-color": palette.paperShade }),
      el("stop", { offset: 1, "stop-color": palette.paper }),
    ].join(""),
  );
}

/**
 * The faint rainbow sheen of a holographic overlay laminate. Real cards carry
 * one; it is what makes a flat render read as plastic.
 */
export function laminateGradient(id: string): string {
  const stops: [number, string, number][] = [
    [0, "#ff9ad5", 0],
    [0.25, "#9ad5ff", 0.09],
    [0.45, "#b5ffcf", 0.05],
    [0.65, "#ffe39a", 0.08],
    [1, "#c39aff", 0],
  ];
  return el(
    "linearGradient",
    { id, x1: 0, y1: 0.2, x2: 1, y2: 0.8 },
    stops
      .map(([offset, color, opacity]) =>
        el("stop", { offset, "stop-color": color, "stop-opacity": opacity }),
      )
      .join(""),
  );
}

export function grayscaleFilter(id: string): string {
  return el(
    "filter",
    { id, "color-interpolation-filters": "sRGB" },
    el("feColorMatrix", { type: "saturate", values: 0 }),
  );
}

/** Paper grain: fixed-seed noise, so it is identical on every render. */
export function grainFilter(id: string, seed: number): string {
  return el(
    "filter",
    { id, x: 0, y: 0, width: 1, height: 1 },
    el("feTurbulence", {
      type: "fractalNoise",
      baseFrequency: 1.6,
      numOctaves: 2,
      seed,
    }) + el("feColorMatrix", { type: "saturate", values: 0 }),
  );
}

export interface FieldLabelStyle {
  readonly label: TextStyle;
  readonly value: TextStyle;
}

export function fieldStyles(palette: Palette): FieldLabelStyle {
  return {
    label: {
      family: FONT.sans,
      fill: palette.primary,
      size: 1.25,
      weight: 500,
    },
    value: { family: FONT.sans, fill: palette.ink, size: 2.05, weight: 600 },
  };
}

/** An AAMVA-style field: a small numbered label with its value beside it. */
export function inlineField(
  x: number,
  y: number,
  label: string,
  value: string,
  styles: FieldLabelStyle,
  valueStyle: Partial<TextStyle> = {},
): string {
  const labelWidth = label.length * styles.label.size * 0.5 + 0.6;
  return (
    text(x, y, label, styles.label) +
    text(x + labelWidth, y, value, { ...styles.value, ...valueStyle })
  );
}

export function specimenMark(cx: number, cy: number, size: number): string {
  return el(
    "g",
    { transform: `rotate(-17 ${num(cx)} ${num(cy)})` },
    text(cx, cy, "SPECIMEN", {
      anchor: "middle",
      family: FONT.sans,
      fill: SPECIMEN_RED,
      letterSpacing: size * 0.12,
      opacity: 0.17,
      size,
      weight: 700,
    }),
  );
}

/** A small deterministic PRNG for layout jitter that must not change. */
export function seededRandom(seed: string): () => number {
  let state = 2166136261;
  for (const character of seed) {
    state = Math.imul(state ^ character.charCodeAt(0), 16777619);
  }
  return () => {
    state = Math.imul(state ^ (state >>> 15), 2246822507);
    state = Math.imul(state ^ (state >>> 13), 3266489909);
    state ^= state >>> 16;
    return (state >>> 0) / 4294967296;
  };
}
