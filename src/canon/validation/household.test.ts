import { expect, test } from "bun:test";
import { world } from "../../../canon/world";
import type { Household } from "../householdTypes";
import { checkHousehold } from "./household";

const household = world.device.household;
const photo = household.photos[0];
const tool = household.equipment[0];
const weight = household.weight[0];
const pressure = household.bloodPressure[0];
if (!photo || !tool || !weight || !pressure)
  throw new Error("Missing household fixtures");

function check(patch: Partial<Household>): readonly string[] {
  return checkHousehold({
    ...world,
    device: { ...world.device, household: { ...household, ...patch } },
  });
}

test("household canon is valid", () => expect(check({})).toEqual([]));

for (const [label, patch, message] of [
  [
    "conflicting photo id",
    { photos: [{ ...photo, id: "drill-detail" }] },
    "conflicting photo id",
  ],
  [
    "duplicate person",
    { photos: [{ ...photo, characters: ["maya-reyes", "maya-reyes"] }] },
    "invalid family photo",
  ],
  ["invalid id", { photos: [{ ...photo, id: "../escape" }] }, "invalid id"],
  ["duplicate id", { photos: [photo, photo] }, "duplicate id"],
  [
    "unknown person",
    { photos: [{ ...photo, characters: ["missing-person"] }] },
    "invalid family photo",
  ],
  [
    "future date",
    { photos: [{ ...photo, capturedAt: "2099-01-01T12:00:00Z" }] },
    "future timestamp",
  ],
  [
    "invalid date",
    { photos: [{ ...photo, capturedAt: "2026-02-30T12:00:00Z" }] },
    "invalid timestamp",
  ],
  [
    "duplicate serial",
    {
      equipment: [
        tool,
        {
          ...tool,
          id: "second-drill",
          photos: ["second-drill-photo"],
          receipt: {
            image: "second-receipt",
            merchant: "Other",
            number: "OTHER-1",
            purchasedAt: "2026-01-01",
            subtotalCents: 100,
            taxCents: 8,
          },
        },
      ],
    },
    "duplicate serial",
  ],
  [
    "unsafe photo path",
    { equipment: [{ ...tool, photos: ["../escape"] }] },
    "invalid equipment photos",
  ],
  [
    "duplicate photo",
    { equipment: [{ ...tool, photos: ["drill", "drill"] }] },
    "invalid equipment photos",
  ],
  [
    "duplicate measurement",
    { weight: [weight, weight] },
    "duplicate measurement",
  ],
  [
    "invalid weight",
    { weight: [{ ...weight, weight: "NaN" }] },
    "invalid weight reading",
  ],
  [
    "invalid pressure",
    { bloodPressure: [{ ...pressure, systolic: "60" }] },
    "invalid blood pressure reading",
  ],
  [
    "invalid pulse",
    { bloodPressure: [{ ...pressure, pulse: "abc" }] },
    "invalid blood pressure reading",
  ],
  ["empty tracker", { weight: [] }, "tracker needs readings"],
] satisfies Array<[string, Partial<Household>, string]>) {
  test(`household rejects ${label} independently`, () => {
    expect(check(patch)).toHaveLength(1);
    expect(check(patch)[0]).toContain(message);
  });
}

test("equipment images cannot be shared by different inventory items", () => {
  const equipment = household.equipment.map((item, index) =>
    index === 1 ? { ...item, photos: ["drill"] } : item,
  );
  expect(check({ equipment })).toEqual([
    "household: invalid equipment photos circular-saw",
  ]);
});
