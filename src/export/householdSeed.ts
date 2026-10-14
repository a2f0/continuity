import { findCharacter, firstName } from "../canon/derive";
import type { World } from "../canon/types";
import type { SeedFile } from "./tearleadsSeed";

export interface HouseholdPhotoMetadata {
  readonly width: number;
  readonly height: number;
  readonly byteLength: number;
}

export function householdFiles(
  world: World,
  photos: ReadonlyMap<string, HouseholdPhotoMetadata>,
): SeedFile[] {
  const { household } = world.device;
  const name = firstName(findCharacter(world, world.device.owner));
  return [
    ...household.photos.map((photo) => {
      const metadata = photos.get(photo.id);
      if (!metadata) throw new Error(`Missing image metadata: ${photo.id}`);
      return {
        kind: "image",
        fields: {
          fileName: photo.fileName,
          mimeType: "image/jpeg",
          sourceLastModified: String(Date.parse(photo.capturedAt)),
          width: String(metadata.width),
          height: String(metadata.height),
          byteLength: String(metadata.byteLength),
        },
        attachments: [
          { file: `household-${photo.id}.jpg`, mimeType: "image/jpeg" },
        ],
      };
    }),
    ...household.equipment.map(
      ({
        kind,
        equipmentType,
        make,
        model,
        serialNumber,
        photos,
        receipt,
      }) => ({
        kind,
        fields: { equipmentType, make, model, serialNumber },
        attachments: [
          ...photos.map((id) => ({
            file: `household-${id}.jpg`,
            mimeType: "image/jpeg",
            slot: "equipment-photos",
          })),
          ...(receipt
            ? [
                {
                  file: `household-${receipt.image}.jpg`,
                  mimeType: "image/jpeg",
                  slot: "receipt-image",
                },
              ]
            : []),
        ],
      }),
    ),
    {
      kind: "weight",
      fields: {
        trackerName: `${name}'s Weight`,
        unit: household.weight.at(-1)?.unit ?? "kg",
      },
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

interface ImageExpectation {
  readonly title: string;
  readonly imageCount: number;
  readonly fields: Readonly<Record<string, string>>;
}
interface TrackerExpectation {
  readonly title: string;
  readonly rowCount: number;
  readonly rows: readonly Readonly<Record<string, string>>[];
}
export interface HouseholdExpectations {
  readonly photos: readonly ImageExpectation[];
  readonly tools: readonly ImageExpectation[];
  readonly appliances: readonly ImageExpectation[];
  readonly weight: TrackerExpectation;
  readonly bloodPressure: TrackerExpectation;
}

export function householdExpectations(
  files: readonly SeedFile[],
): HouseholdExpectations {
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
          title: requiredTitle(
            kind === "image" ? fileName : [typeLabel, make, model].join(" "),
          ),
          imageCount: file.attachments.length,
          fields: file.fields,
        };
      });
  const tracker = (kind: string) => {
    const file = files.find((file) => file.kind === kind);
    if (!file?.rows?.length)
      throw new Error(`Missing seeded readings for ${kind}`);
    const { trackerName } = file.fields;
    return {
      title: requiredTitle(trackerName),
      rowCount: file.rows.length,
      rows: file.rows,
    };
  };
  return {
    photos: details("image"),
    tools: details("tool"),
    appliances: details("appliance"),
    weight: tracker("weight"),
    bloodPressure: tracker("blood_pressure"),
  };
}

function requiredTitle(title: string | undefined): string {
  if (!title?.trim()) throw new Error("Missing household document title");
  return title;
}
