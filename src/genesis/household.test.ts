import { afterEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { world } from "../../canon/world";
import { repoPath } from "../paths";
import { rasterize, toJpeg } from "../render/raster";
import { loadHouseholdPhotos } from "./household";

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});
const sourceBytes = readFileSync(repoPath("assets/household/drill.jpg"));
const sourceProvenance = JSON.parse(
  readFileSync(repoPath("assets/household/drill.json"), "utf8"),
);
const fixtureWorld = {
  ...world,
  device: {
    ...world.device,
    household: {
      ...world.device.household,
      photos: [],
      equipment: [
        {
          id: "drill",
          kind: "tool" as const,
          equipmentType: "drill",
          make: "Alderforge",
          model: "AF-D18",
          serialNumber: "AF26-D18-004217",
          photos: ["drill"],
        },
      ],
    },
  },
};
const digest = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");

function fixture(
  bytes: Uint8Array = sourceBytes,
  patch: Record<string, unknown> = {},
) {
  const root = mkdtempSync(join(tmpdir(), "household-assets-"));
  roots.push(root);
  mkdirSync(join(root, "household"));
  writeFileSync(join(root, "household/drill.jpg"), bytes);
  writeFileSync(
    join(root, "household/drill.json"),
    JSON.stringify({
      ...sourceProvenance,
      imageSha256: digest(bytes),
      ...patch,
    }),
  );
  return root;
}

test("household photo metadata comes from verified bytes", () => {
  const image = loadHouseholdPhotos(fixtureWorld, fixture()).get("drill");
  expect(image?.bytes).toEqual(sourceBytes);
  expect(image?.width).toBe(1536);
});

for (const [label, patch] of [
  ["image hash mismatch", { imageSha256: "0".repeat(64) }],
  ["prompt hash mismatch", { promptSha256: "0".repeat(64) }],
  ["missing prompt", { prompt: undefined }],
  ["missing model", { model: undefined }],
  ["invalid date", { generatedOn: "yesterday" }],
  ["invalid references", { references: null }],
] satisfies Array<[string, Record<string, unknown>]>) {
  test(`household photos reject ${label}`, () => {
    expect(() =>
      loadHouseholdPhotos(fixtureWorld, fixture(sourceBytes, patch)),
    ).toThrow("Unrecorded or edited");
  });
}

for (const file of ["drill.jpg", "drill.json"]) {
  test(`household photos require ${file}`, () => {
    const root = fixture();
    rmSync(join(root, "household", file));
    expect(() => loadHouseholdPhotos(fixtureWorld, root)).toThrow("ENOENT");
  });
}

const png = rasterize(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="white"/></svg>',
  600,
).png;
const tiny = toJpeg(
  rasterize(
    '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>',
    10,
  ),
  90,
);
for (const [label, bytes] of [
  ["PNG", png],
  ["undersized JPEG", tiny],
  [
    "oversized JPEG",
    Buffer.concat([sourceBytes, Buffer.alloc(3 * 1024 * 1024)]),
  ],
] as const) {
  test(`household photos reject ${label} even with a matching hash`, () => {
    expect(() => loadHouseholdPhotos(fixtureWorld, fixture(bytes))).toThrow(
      "Invalid household photo",
    );
  });
}

test("family photos reject missing or replaced portrait references", () => {
  const root = fixture();
  const familyWorld = {
    ...fixtureWorld,
    device: {
      ...fixtureWorld.device,
      household: {
        ...fixtureWorld.device.household,
        equipment: [],
        photos: [
          {
            id: "drill",
            fileName: "Family.jpg",
            characters: ["maya-reyes"],
            capturedAt: "2026-09-20T12:00:00Z",
          },
        ],
      },
    },
  };
  expect(() => loadHouseholdPhotos(familyWorld, root)).toThrow(
    "Missing portrait references",
  );
  mkdirSync(join(root, "portraits"));
  writeFileSync(join(root, "portraits/maya-reyes.jpg"), "new portrait");
  writeFileSync(
    join(root, "household/drill.json"),
    JSON.stringify({
      ...sourceProvenance,
      references: { "maya-reyes": "old-hash" },
    }),
  );
  expect(() => loadHouseholdPhotos(familyWorld, root)).toThrow(
    "Stale portrait reference",
  );
});

test("equipment detail photos reject replaced source images", () => {
  const root = fixture(sourceBytes, {
    sourceReferences: { drill: "0".repeat(64) },
  });
  expect(() => loadHouseholdPhotos(fixtureWorld, root)).toThrow(
    "Stale household reference",
  );
});

test("receipt photos reject a changed equipment serial", () => {
  const changed = world;
  const equipment = changed.device.household.equipment.map((item, index) =>
    index === 0 ? { ...item, serialNumber: "CHANGED" } : item,
  );
  expect(() =>
    loadHouseholdPhotos({
      ...changed,
      device: {
        ...changed.device,
        household: { ...changed.device.household, equipment },
      },
    }),
  ).toThrow("Stale receipt facts: drill-receipt");
});
