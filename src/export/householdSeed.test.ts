import { expect, test } from "bun:test";
import { world } from "../../canon/world";
import { validateWorld } from "../canon/validate";
import { loadHouseholdPhotos } from "../genesis/household";
import { buildSeedExpectations, buildTearleadsSeed } from "./tearleadsSeed";

test("household seed supplies photos, two makes, equipment identifiers, and dated tracker rows", () => {
  const assets = loadHouseholdPhotos(world);
  const seed = buildTearleadsSeed(world, assets);
  const expected = buildSeedExpectations(seed);
  expect(seed.schemaVersion).toBe(2);
  expect(assets.size).toBe(7);
  expect(expected.photos).toHaveLength(2);
  expect(expected.tools).toHaveLength(2);
  expect(expected.appliances).toHaveLength(2);
  expect(expected.tools[0]).toMatchObject({
    title: "Drill Alderforge AF-D18",
    imageCount: 2,
    fields: { serialNumber: "AF26-D18-004217" },
  });
  for (const photo of seed.files.filter((file) => file.kind === "image")) {
    const { width, byteLength } = photo.fields;
    expect(Number(width)).toBe(1536);
    expect(Number(byteLength)).toBeGreaterThan(0);
  }
  for (const tracker of [expected.weight, expected.bloodPressure]) {
    expect(tracker.rowCount).toBe(6);
    expect(new Set(tracker.rows.map(({ measuredAt }) => measuredAt)).size).toBe(
      6,
    );
  }
  expect(expected.weight.rows.every(({ unit }) => unit === "kg")).toBe(true);
  expect(validateWorld(world)).toEqual([]);
});

test("image metadata is required and tracker defaults follow recorded units", () => {
  expect(() => buildTearleadsSeed(world, new Map())).toThrow(
    "Missing image metadata",
  );
  const changed = {
    ...world,
    device: {
      ...world.device,
      household: {
        ...world.device.household,
        weight: world.device.household.weight.map((row) => ({
          ...row,
          unit: "lb" as const,
        })),
      },
    },
  };
  expect(
    buildTearleadsSeed(changed, loadHouseholdPhotos(world)).files.find(
      (file) => file.kind === "weight",
    )?.fields,
  ).toMatchObject({ unit: "lb" });
});
