import { createHash } from "node:crypto";
import { ageAsOf } from "../canon/derive";
import type { Character, World } from "../canon/types";

// The portrait prompt is derived from canon, so a changed description, or a
// character aging past a decade boundary, marks the portrait stale.

function ageBand(age: number): string {
  const decade = Math.floor(age / 10) * 10;
  const third = age % 10 < 4 ? "early" : age % 10 < 7 ? "mid" : "late";
  return `${third} ${decade}s`;
}

export function portraitPrompt(world: World, character: Character): string {
  const { appearance } = character;
  return [
    `Photorealistic passport-style portrait photograph of a fictional person in their ${ageBand(ageAsOf(world, character))}: ${appearance.description}.`,
    appearance.glasses ? "Wearing glasses." : "No glasses.",
    "Head and shoulders, centered, facing the camera straight on, eyes open and looking into the lens.",
    "Even, soft studio lighting with no harsh shadows, plain light gray-blue backdrop, sharp focus, natural skin texture, true-to-life color.",
    "No text, logos, watermarks, borders, or props.",
  ].join(" ");
}

export function promptDigest(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex");
}
