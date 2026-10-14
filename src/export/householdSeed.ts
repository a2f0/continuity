import { findCharacter, firstName } from "../canon/derive";
import type { World } from "../canon/types";
import type { SeedFile } from "./tearleadsSeed";

export function householdFiles(world: World): SeedFile[] {
  const { household } = world.device;
  const name = firstName(findCharacter(world, world.device.owner));
  return [
    ...household.photos.map((photo) => ({
      kind: "image",
      fields: {
        fileName: photo.fileName,
        mimeType: "image/jpeg",
        sourceLastModified: String(Date.parse(photo.capturedAt)),
      },
      attachments: [{ file: `${photo.id}.jpg`, mimeType: "image/jpeg" }],
    })),
    ...household.equipment.map(
      ({ kind, equipmentType, make, model, serialNumber, photos }) => ({
        kind,
        fields: { equipmentType, make, model, serialNumber },
        attachments: photos.map((id) => ({
          file: `${id}.jpg`,
          mimeType: "image/jpeg",
          slot: "equipment-photos",
        })),
      }),
    ),
    {
      kind: "weight",
      fields: { trackerName: `${name}'s Weight`, unit: "kg" },
      rows: household.weight,
      attachments: [],
    },
    {
      kind: "blood_pressure",
      fields: { trackerName: `${name}'s Blood Pressure` },
      rows: household.bloodPressure,
      attachments: [],
    },
  ];
}

export function householdExpectations(files: readonly SeedFile[]) {
  const details = (kind: string) =>
    files
      .filter((file) => file.kind === kind)
      .map((file) => {
        const { fileName, equipmentType, make, model } = file.fields;
        const typeLabel = equipmentType
          ?.split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");
        return {
          title:
            kind === "image" ? fileName : [typeLabel, make, model].join(" "),
          imageCount: file.attachments.length,
          fields: file.fields,
        };
      });
  const tracker = (kind: string) => {
    const file = files.find((file) => file.kind === kind);
    if (!file?.rows?.length)
      throw new Error(`Missing seeded readings for ${kind}`);
    const { trackerName } = file.fields;
    return { title: trackerName, rowCount: file.rows.length, rows: file.rows };
  };
  return {
    photos: details("image"),
    tools: details("tool"),
    appliances: details("appliance"),
    weight: tracker("weight"),
    bloodPressure: tracker("blood_pressure"),
  };
}
