import type { Household } from "../../src/canon/householdTypes";

// Fictional household inventory and readings, fixed to the story timeline.
export const household: Household = {
  photos: [
    {
      id: "family-dinner",
      fileName: "Sunday dinner at Mom's.jpg",
      characters: ["maya-reyes", "daniel-okafor", "rosa-reyes", "theo-reyes"],
      capturedAt: "2026-09-20T18:00:00-07:00",
    },
    {
      id: "family-walk",
      fileName: "Waterfront walk with Pepper.jpg",
      characters: ["maya-reyes", "daniel-okafor"],
      capturedAt: "2026-09-26T10:00:00-07:00",
    },
  ],
  equipment: [
    {
      id: "drill",
      kind: "tool",
      equipmentType: "drill",
      make: "Alderforge",
      model: "AF-D18",
      serialNumber: "AF26-D18-004217",
      photos: ["drill", "drill-detail"],
    },
    {
      id: "circular-saw",
      kind: "tool",
      equipmentType: "circular_saw",
      make: "Alderforge",
      model: "AF-CS165",
      serialNumber: "AF26-CS-001832",
      photos: ["circular-saw"],
    },
    {
      id: "washing-machine",
      kind: "appliance",
      equipmentType: "washing_machine",
      make: "Hearthmere",
      model: "HM-W8",
      serialNumber: "HM25-W8-008614",
      photos: ["washing-machine"],
    },
    {
      id: "refrigerator",
      kind: "appliance",
      equipmentType: "refrigerator",
      make: "Hearthmere",
      model: "HM-R320",
      serialNumber: "HM25-R3-006209",
      photos: ["refrigerator"],
    },
  ],
  weight: [
    {
      measuredAt: "2026-09-03T07:30:00-07:00",
      weight: "61.4",
      unit: "kg",
      notes: "Morning weigh-in",
    },
    {
      measuredAt: "2026-09-07T07:30:00-07:00",
      weight: "61.2",
      unit: "kg",
      notes: "Before breakfast",
    },
    {
      measuredAt: "2026-09-12T07:30:00-07:00",
      weight: "61.3",
      unit: "kg",
      notes: "Rest day",
    },
    {
      measuredAt: "2026-09-18T07:30:00-07:00",
      weight: "61.1",
      unit: "kg",
      notes: "Morning weigh-in",
    },
    {
      measuredAt: "2026-09-23T07:30:00-07:00",
      weight: "61.2",
      unit: "kg",
      notes: "Before breakfast",
    },
    {
      measuredAt: "2026-09-30T07:30:00-07:00",
      weight: "61",
      unit: "kg",
      notes: "Morning weigh-in",
    },
  ],
  bloodPressure: [
    {
      measuredAt: "2026-09-03T08:00:00-07:00",
      systolic: "118",
      diastolic: "76",
      pulse: "68",
      notes: "Seated, left arm",
    },
    {
      measuredAt: "2026-09-07T08:00:00-07:00",
      systolic: "121",
      diastolic: "78",
      pulse: "70",
      notes: "Before breakfast",
    },
    {
      measuredAt: "2026-09-12T08:00:00-07:00",
      systolic: "117",
      diastolic: "75",
      pulse: "66",
      notes: "Seated, left arm",
    },
    {
      measuredAt: "2026-09-18T08:00:00-07:00",
      systolic: "119",
      diastolic: "77",
      pulse: "69",
      notes: "After five minutes resting",
    },
    {
      measuredAt: "2026-09-23T08:00:00-07:00",
      systolic: "116",
      diastolic: "74",
      pulse: "65",
      notes: "Before breakfast",
    },
    {
      measuredAt: "2026-09-30T08:00:00-07:00",
      systolic: "118",
      diastolic: "76",
      pulse: "67",
      notes: "Seated, left arm",
    },
  ],
};
