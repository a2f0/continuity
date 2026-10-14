import { createHash } from "node:crypto";
import { findCharacter } from "../canon/derive";
import type { World } from "../canon/types";
import { validateWorld } from "../canon/validate";
import { googleContactsCsv } from "../export/googleContactsCsv";
import {
  buildSeedExpectations,
  buildTearleadsSeed,
  TEARLEADS_FILES,
} from "../export/tearleadsSeed";
import { addressBookVcard } from "../export/vcard";
import { canonSnapshot } from "./canonSnapshot";
import { renderCharacters } from "./characters";
import { loadHouseholdPhotos } from "./household";

// Everything under genesis/, built in memory from canon. The same canon always
// yields the same bytes, which is what `bun run genesis:check` relies on.

export interface GenesisFile {
  readonly path: string;
  readonly bytes: Uint8Array;
}

const MANIFEST_PATH = "manifest.json";

function json(value: unknown): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(value, null, 2)}\n`);
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function copyTearleadsAttachments(
  world: World,
  files: Map<string, Uint8Array>,
): void {
  const owner = findCharacter(world, world.device.owner);
  const copy = (from: string, to: string) => {
    const bytes = files.get(from);
    if (bytes) {
      // Identical bytes share one Git blob, so these copies cost nothing.
      files.set(`tearleads/${to}`, bytes);
    }
  };
  copy(
    `documents/${owner.id}/drivers-license-front.jpg`,
    TEARLEADS_FILES.driversLicenseFront,
  );
  copy(
    `documents/${owner.id}/drivers-license-back.jpg`,
    TEARLEADS_FILES.driversLicenseBack,
  );
  copy(`documents/${owner.id}/passport.jpg`, TEARLEADS_FILES.passport);
  for (const name of [
    TEARLEADS_FILES.birthCertificate,
    TEARLEADS_FILES.creditCardFront,
    TEARLEADS_FILES.creditCardBack,
  ]) {
    copy(`documents/${owner.id}/${name}`, name);
  }
  for (const entry of world.device.addressBook) {
    copy(
      `avatars/${entry.character}.png`,
      TEARLEADS_FILES.avatar(entry.character),
    );
  }
}

export function buildGenesis(world: World): readonly GenesisFile[] {
  const problems = validateWorld(world);
  if (problems.length > 0) {
    throw new Error(
      `Canon is inconsistent:\n${problems.map((item) => `- ${item}`).join("\n")}`,
    );
  }
  const files = new Map<string, Uint8Array>();
  const { characterAssets, contactPhotos } = renderCharacters(world, files);
  files.set(
    "contacts/contacts.csv",
    new TextEncoder().encode(googleContactsCsv(world)),
  );
  files.set(
    "contacts/contacts.vcf",
    new TextEncoder().encode(addressBookVcard(world, contactPhotos)),
  );
  const photos = loadHouseholdPhotos(world);
  for (const [id, photo] of photos)
    files.set(`tearleads/household-${id}.jpg`, photo.bytes);
  const seed = buildTearleadsSeed(world, photos);
  files.set("tearleads/seed.json", json(seed));
  files.set("tearleads/expectations.json", json(buildSeedExpectations(seed)));
  copyTearleadsAttachments(world, files);
  files.set("canon.json", json(canonSnapshot(world, characterAssets)));

  const sorted = [...files.entries()].sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
  const manifest = {
    asOf: world.asOf,
    files: sorted.map(([path, bytes]) => ({
      bytes: bytes.length,
      path,
      sha256: sha256(bytes),
    })),
  };
  return [
    ...sorted.map(([path, bytes]) => ({ bytes, path })),
    { bytes: json(manifest), path: MANIFEST_PATH },
  ];
}
