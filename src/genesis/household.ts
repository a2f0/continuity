import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { World } from "../canon/types";
import type { SeedSpec } from "../export/tearleadsSeed";
import { repoPath } from "../paths";
import { imageSize } from "../render/imageSize";

export function copyHouseholdPhotos(
  world: World,
  files: Map<string, Uint8Array>,
  seed: SeedSpec,
): SeedSpec {
  const imageFields = new Map<string, Record<string, string>>();
  const { photos, equipment } = world.device.household;
  const ids = new Set([
    ...photos.map((photo) => photo.id),
    ...equipment.flatMap((item) => item.photos),
  ]);
  for (const id of ids) {
    const bytes = readFileSync(repoPath("assets", "household", `${id}.jpg`));
    const provenance = JSON.parse(
      readFileSync(repoPath("assets", "household", `${id}.json`), "utf8"),
    ) as { sha256: string; prompt: string; model: string };
    if (
      !provenance.prompt ||
      !provenance.model ||
      provenance.sha256 !== createHash("sha256").update(bytes).digest("hex")
    )
      throw new Error(`Unrecorded or edited household photo: ${id}`);
    const dimensions = imageSize(bytes);
    if (
      dimensions.mimeType !== "image/jpeg" ||
      Math.min(dimensions.width, dimensions.height) < 512 ||
      bytes.length > 3 * 1024 * 1024
    )
      throw new Error(`Invalid household photo: ${id}`);
    files.set(`tearleads/${id}.jpg`, bytes);
    imageFields.set(`${id}.jpg`, {
      width: String(dimensions.width),
      height: String(dimensions.height),
      byteLength: String(bytes.length),
    });
  }
  return {
    ...seed,
    files: seed.files.map((file) =>
      file.kind === "image"
        ? {
            ...file,
            fields: {
              ...file.fields,
              ...imageFields.get(file.attachments[0]?.file ?? ""),
            },
          }
        : file,
    ),
  };
}
