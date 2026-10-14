import { createHash } from "node:crypto";
import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { SeedSpec } from "../export/tearleadsSeed";
import { repoPath } from "../paths";
import { imageSize } from "../render/imageSize";
import { galleryPage } from "./page";
import type { Asset, Gallery, Snapshot } from "./types";

export function readGallery(root: string): Gallery {
  const manifestBytes = readFileSync(join(root, "manifest.json"));
  const manifest = JSON.parse(manifestBytes.toString("utf8")) as {
    files: readonly (Asset & { sha256: string })[];
  };
  const assets = manifest.files.map((asset): Asset => {
    const bytes = readFileSync(join(root, asset.path));
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (bytes.length !== asset.bytes || digest !== asset.sha256) {
      throw new Error(
        `genesis/${asset.path} differs from its manifest. Run bun run genesis.`,
      );
    }
    return /\.(jpg|png)$/.test(asset.path)
      ? { ...asset, image: imageSize(bytes) }
      : asset;
  });
  const canon = JSON.parse(
    readFileSync(join(root, "canon.json"), "utf8"),
  ) as Snapshot;
  const seed = JSON.parse(
    readFileSync(join(root, "tearleads/seed.json"), "utf8"),
  ) as SeedSpec;
  return {
    canon,
    seedFiles: seed.files,
    notes: seed.notes,
    assets: [...assets, { path: "manifest.json", bytes: manifestBytes.length }],
  };
}

export function buildSite(output: string): Gallery {
  const root = repoPath("genesis");
  const gallery = readGallery(root);
  rmSync(output, { recursive: true, force: true });
  mkdirSync(output, { recursive: true });
  cpSync(repoPath("site"), output, { recursive: true });
  for (const asset of gallery.assets) {
    const destination = join(output, "genesis", asset.path);
    mkdirSync(join(destination, ".."), { recursive: true });
    cpSync(join(root, asset.path), destination);
  }
  for (const family of [
    "ibm-plex-sans-condensed",
    "ibm-plex-serif",
    "ibm-plex-mono",
  ]) {
    cpSync(repoPath("assets", "fonts", family), join(output, "fonts", family), {
      recursive: true,
    });
  }
  writeFileSync(join(output, "index.html"), galleryPage(gallery));
  return gallery;
}

if (import.meta.main) {
  const gallery = buildSite(repoPath("dist"));
  console.log(
    `Built dist/: ${gallery.canon.characters.length} characters, ${gallery.assets.length} downloadable assets.`,
  );
}
