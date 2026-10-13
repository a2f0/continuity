import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import type { Character, World } from "../canon/types";
import {
  type PortraitFraming,
  portraitPath,
  portraitSidecarPath,
} from "../render/portrait";
import { portraitPrompt, promptDigest } from "./prompt";

// Each portrait image has a JSON sidecar recording how it was made. Canon is
// the source of truth for the prompt; the sidecar records which prompt the
// image on disk actually came from.

export interface PortraitSidecar {
  readonly character: string;
  readonly model: string;
  readonly size?: string;
  readonly quality?: string;
  readonly prompt: string;
  readonly promptSha256: string;
  readonly imageSha256: string;
  readonly generatedOn: string;
  readonly framing?: PortraitFraming;
}

export type PortraitStatus =
  | "current"
  | "edited"
  | "placeholder"
  | "stale"
  | "unrecorded";

export function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function readSidecar(characterId: string): PortraitSidecar | undefined {
  const path = portraitSidecarPath(characterId);
  return existsSync(path)
    ? (JSON.parse(readFileSync(path, "utf8")) as PortraitSidecar)
    : undefined;
}

function imageBytes(characterId: string): Uint8Array | undefined {
  for (const extension of ["jpg", "png"]) {
    const path = portraitPath(characterId, extension);
    if (existsSync(path)) {
      return new Uint8Array(readFileSync(path));
    }
  }
  return undefined;
}

/**
 * - placeholder: no photo yet
 * - unrecorded: a photo without a sidecar
 * - edited: the photo no longer matches the sidecar's hash
 * - stale: canon's prompt changed since the photo was made
 */
export function portraitStatus(
  world: World,
  character: Character,
): PortraitStatus {
  const bytes = imageBytes(character.id);
  if (!bytes) {
    return "placeholder";
  }
  const sidecar = readSidecar(character.id);
  if (!sidecar) {
    return "unrecorded";
  }
  if (sidecar.imageSha256 !== sha256(bytes)) {
    return "edited";
  }
  return sidecar.promptSha256 === promptDigest(portraitPrompt(world, character))
    ? "current"
    : "stale";
}
