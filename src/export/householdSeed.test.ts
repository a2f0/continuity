import { expect, test } from "bun:test";
import { world } from "../../canon/world";
import { validateWorld } from "../canon/validate";
import { copyHouseholdPhotos } from "../genesis/household";
import { buildSeedExpectations, buildTearleadsSeed } from "./tearleadsSeed";

test("household seed supplies photos, two makes, equipment identifiers, and dated tracker rows", () => {
  const assets = new Map<string, Uint8Array>();
  const seed = copyHouseholdPhotos(world, assets, buildTearleadsSeed(world));
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

test("canon rejects household drift before generating fixtures", () => {
  const household = world.device.household;
  const invalid = {
    ...world,
    device: {
      ...world.device,
      household: {
        ...household,
        photos: [
          {
            id: "../escape",
            fileName: "photo.jpg",
            characters: ["missing"],
            capturedAt: "2099-01-01T12:00:00Z",
          },
        ],
        equipment: [...household.equipment, ...household.equipment],
        weight: [
          {
            measuredAt: "2026-02-30T07:30:00Z",
            weight: "NaN",
            unit: "kg" as const,
            notes: "",
          },
        ],
        bloodPressure: [
          {
            measuredAt: "2026-09-30T08:00:00Z",
            systolic: "60",
            diastolic: "80",
            pulse: "abc",
            notes: "",
          },
        ],
      },
    },
  };
  const problems = validateWorld(invalid).join("\n");
  for (const message of [
    "duplicate id",
    "invalid family photo",
    "future timestamp",
    "duplicate serial",
    "invalid weight",
    "invalid blood pressure",
  ])
    expect(problems).toContain(message);
});
