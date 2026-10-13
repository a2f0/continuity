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
    `Unretouched passport photograph of a fictional person in their ${ageBand(ageAsOf(world, character))}: ${appearance.description}.`,
    appearance.glasses
      ? "Wearing glasses, with no glare on the lenses."
      : "No glasses.",
    "Vertical 2:3 frame: head and shoulders, centered, facing the camera straight on, eyes open and looking into the lens, with clear space above the head and the tops of both shoulders in frame.",
    "Shot on a full-frame camera with an 85mm lens at f/8 under even, soft studio light with no harsh shadows, against a plain light gray-blue backdrop, in sharp focus.",
    "Real skin with visible pores, fine lines, and small blemishes true to the person's age, individual strands of hair with a few flyaways, natural catchlights, slight natural asymmetry, and true-to-life color.",
    "It must read as an ordinary photo of a real person: not an illustration, painting, cartoon, 3D render, or CGI, and not airbrushed or beauty-filtered.",
    "No text, logos, watermarks, borders, or props.",
  ].join(" ");
}

export function promptDigest(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex");
}
