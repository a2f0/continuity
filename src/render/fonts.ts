import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { SignatureFont } from "../canon/types";
import { repoPath } from "../paths";

// Fonts are vendored under assets/fonts with their licenses, and the renderer
// never loads system fonts, so output is identical on every machine.

export const FONT = {
  display: "Cinzel",
  mono: "IBM Plex Mono",
  sans: "IBM Plex Sans Condensed",
  serif: "IBM Plex Serif",
} as const;

export const SIGNATURE_FONT_FAMILY: Readonly<Record<SignatureFont, string>> = {
  "dawning-of-a-new-day": "Dawning of a New Day",
  "herr-von-muellerhoff": "Herr Von Muellerhoff",
  "homemade-apple": "Homemade Apple",
  "la-belle-aurore": "La Belle Aurore",
  "mrs-saint-delafield": "Mrs Saint Delafield",
};

/** Signature glyphs differ wildly in size; these keep them visually even. */
export const SIGNATURE_FONT_SCALE: Readonly<Record<SignatureFont, number>> = {
  "dawning-of-a-new-day": 1.05,
  "herr-von-muellerhoff": 1.25,
  "homemade-apple": 0.72,
  "la-belle-aurore": 0.95,
  "mrs-saint-delafield": 1.3,
};

/** Average advance per character, in em, used to fit a signature to its box. */
export const SIGNATURE_FONT_ADVANCE: Readonly<Record<SignatureFont, number>> = {
  "dawning-of-a-new-day": 0.42,
  "herr-von-muellerhoff": 0.36,
  "homemade-apple": 0.62,
  "la-belle-aurore": 0.5,
  "mrs-saint-delafield": 0.36,
};

let cachedFontFiles: readonly string[] | undefined;

export function fontFiles(): readonly string[] {
  if (!cachedFontFiles) {
    const root = repoPath("assets", "fonts");
    cachedFontFiles = readdirSync(root, { recursive: true, encoding: "utf8" })
      .filter((file) => file.endsWith(".ttf"))
      .sort()
      .map((file) => join(root, file));
  }
  return cachedFontFiles;
}
