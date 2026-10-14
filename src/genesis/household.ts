import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isIsoDate } from "../canon/dates";
import type { World } from "../canon/types";
import { repoPath } from "../paths";
import { imageSize } from "../render/imageSize";
import { equipmentFactsHash, receiptFactsHash } from "./householdFacts";

function digest(bytes: string | Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateProvenance(
  value: unknown,
  id: string,
  bytes: Uint8Array,
  characters: readonly string[],
  root: string,
): void {
  if (!record(value))
    throw new Error(`Invalid household photo provenance: ${id}`);
  const {
    prompt,
    model,
    imageSha256,
    promptSha256,
    generatedOn,
    references,
    sourceReferences,
  } = value;
  if (
    typeof prompt !== "string" ||
    !prompt.trim() ||
    typeof model !== "string" ||
    !model.trim() ||
    typeof generatedOn !== "string" ||
    !isIsoDate(generatedOn) ||
    imageSha256 !== digest(bytes) ||
    promptSha256 !== digest(prompt) ||
    !record(references)
  )
    throw new Error(`Unrecorded or edited household photo: ${id}`);
  if (sourceReferences !== undefined) {
    if (!record(sourceReferences))
      throw new Error(`Invalid source references: ${id}`);
    for (const [source, hash] of Object.entries(sourceReferences)) {
      if (
        !/^[a-z][a-z0-9-]*$/u.test(source) ||
        hash !== digest(readFileSync(join(root, "household", `${source}.jpg`)))
      )
        throw new Error(`Stale household reference: ${id}`);
    }
  }
  if (Object.keys(references).length !== characters.length)
    throw new Error(`Missing portrait references: ${id}`);
  for (const character of characters) {
    if (
      !/^[a-z][a-z0-9-]*$/u.test(character) ||
      references[character] !==
        digest(readFileSync(join(root, "portraits", `${character}.jpg`)))
    )
      throw new Error(`Stale portrait reference in household photo: ${id}`);
  }
}

/** Read verified source assets before constructing the seed; no post-export edits. */
export function loadHouseholdPhotos(world: World, root = repoPath("assets")) {
  const { photos, equipment } = world.device.household;
  const ids = new Set([
    ...photos.map((photo) => photo.id),
    ...equipment.flatMap((item) => [
      ...item.photos,
      ...(item.receipt ? [item.receipt.image] : []),
    ]),
  ]);
  return new Map(
    [...ids].map((id) => {
      if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(id))
        throw new Error(`Invalid household photo id: ${id}`);
      const bytes = readFileSync(join(root, "household", `${id}.jpg`));
      const provenance: unknown = JSON.parse(
        readFileSync(join(root, "household", `${id}.json`), "utf8"),
      );
      const item = equipment.find((item) => item.photos.includes(id));
      const receiptItem = equipment.find((item) => item.receipt?.image === id);
      const { equipmentSha256, receiptSha256 } = record(provenance)
        ? provenance
        : {};
      if (item && equipmentSha256 !== equipmentFactsHash(item))
        throw new Error(`Stale equipment facts: ${id}`);
      if (receiptItem && receiptSha256 !== receiptFactsHash(receiptItem))
        throw new Error(`Stale receipt facts: ${id}`);
      validateProvenance(
        provenance,
        id,
        bytes,
        photos.find((photo) => photo.id === id)?.characters ?? [],
        root,
      );
      const dimensions = imageSize(bytes);
      if (
        dimensions.mimeType !== "image/jpeg" ||
        Math.min(dimensions.width, dimensions.height) < 512 ||
        bytes.length > 3 * 1024 * 1024
      )
        throw new Error(`Invalid household photo: ${id}`);
      return [id, { ...dimensions, byteLength: bytes.length, bytes }] as const;
    }),
  );
}
