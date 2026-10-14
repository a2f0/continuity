import { isIsoDate } from "../dates";
import type { Household } from "../householdTypes";
import type { World } from "../types";

export function checkHousehold(world: World): string[] {
  const { photos, equipment, weight, bloodPressure } = world.device.household;
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const item of [...photos, ...equipment]) {
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(item.id) || ids.has(item.id))
      problems.push(`household: invalid or duplicate id ${item.id}`);
    ids.add(item.id);
  }
  for (const photo of photos) {
    checkDate(photo.capturedAt, world.asOf, problems);
    if (
      !photo.fileName.trim() ||
      !photo.characters.length ||
      photo.characters.some(
        (id) => !world.characters.some((person) => person.id === id),
      )
    )
      problems.push(`household: invalid family photo ${photo.id}`);
  }
  problems.push(...checkEquipment(equipment));
  for (const rows of [weight, bloodPressure]) {
    const times = new Set<string>();
    for (const row of rows) {
      checkDate(row.measuredAt, world.asOf, problems);
      if (times.has(row.measuredAt))
        problems.push(`household: duplicate measurement ${row.measuredAt}`);
      times.add(row.measuredAt);
    }
    if (!rows.length) problems.push("household: tracker needs readings");
  }
  return [...problems, ...checkMeasurements(world.device.household)];
}

function checkMeasurements({ weight, bloodPressure }: Household): string[] {
  const problems: string[] = [];
  for (const row of weight) {
    if (
      !/^\d+(?:\.\d{1,2})?$/u.test(row.weight) ||
      Number(row.weight) < 1 ||
      Number(row.weight) > 1500 ||
      !["kg", "lb"].includes(row.unit)
    )
      problems.push("household: invalid weight reading");
  }
  for (const row of bloodPressure) {
    if (
      ![row.systolic, row.diastolic, row.pulse].every(
        (value) =>
          /^\d+$/u.test(value) && Number(value) >= 1 && Number(value) <= 400,
      ) ||
      Number(row.systolic) <= Number(row.diastolic)
    )
      problems.push("household: invalid blood pressure reading");
  }
  return problems;
}

function checkDate(value: string, asOf: string, problems: string[]): void {
  if (
    !isIsoDate(value.slice(0, 10)) ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/u.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    value.slice(0, 10) > asOf
  )
    problems.push(`household: invalid or future timestamp ${value}`);
}

function checkEquipment(equipment: Household["equipment"]): string[] {
  const problems: string[] = [];
  const serials = new Set<string>();
  for (const item of equipment) {
    if (
      ![item.make, item.model, item.serialNumber, item.equipmentType].every(
        (value) => value.trim(),
      ) ||
      serials.has(item.serialNumber)
    )
      problems.push(
        `household: incomplete equipment or duplicate serial ${item.id}`,
      );
    serials.add(item.serialNumber);
    if (
      !item.photos.length ||
      new Set(item.photos).size !== item.photos.length ||
      item.photos.some((id) => !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(id))
    )
      problems.push(`household: invalid equipment photos ${item.id}`);
  }
  return problems;
}
