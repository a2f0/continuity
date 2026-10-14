import { createHash } from "node:crypto";
import type { Equipment } from "../canon/householdTypes";

function hash(fields: readonly (string | number)[]): string {
  return createHash("sha256").update(JSON.stringify(fields)).digest("hex");
}

function equipmentFacts(item: Equipment): readonly string[] {
  return [item.equipmentType, item.make, item.model, item.serialNumber];
}

export function equipmentFactsHash(item: Equipment): string {
  return hash(equipmentFacts(item));
}

export function receiptFactsHash(item: Equipment): string {
  const receipt = item.receipt;
  if (!receipt) throw new Error(`Missing receipt: ${item.id}`);
  return hash([
    ...equipmentFacts(item),
    receipt.merchant,
    receipt.purchasedAt,
    receipt.number,
    receipt.subtotalCents,
    receipt.taxCents,
  ]);
}
