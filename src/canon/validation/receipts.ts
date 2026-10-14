import { isIsoDate } from "../dates";
import type { Equipment } from "../householdTypes";

export function checkReceipts(
  equipment: readonly Equipment[],
  asOf: string,
): string[] {
  const problems: string[] = [];
  const numbers = new Set<string>();
  const images = new Set<string>();
  for (const item of equipment) {
    const receipt = item.receipt;
    if (!receipt) continue;
    if (
      !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(receipt.image) ||
      images.has(receipt.image) ||
      equipment.some((equipment) => equipment.photos.includes(receipt.image)) ||
      !receipt.merchant.trim() ||
      !receipt.number.trim() ||
      numbers.has(receipt.number) ||
      !isIsoDate(receipt.purchasedAt) ||
      receipt.purchasedAt > asOf ||
      !Number.isSafeInteger(receipt.subtotalCents) ||
      receipt.subtotalCents <= 0 ||
      !Number.isSafeInteger(receipt.taxCents) ||
      receipt.taxCents < 0 ||
      !Number.isSafeInteger(receipt.subtotalCents + receipt.taxCents)
    )
      problems.push(`household: invalid receipt ${item.id}`);
    numbers.add(receipt.number);
    images.add(receipt.image);
  }
  return problems;
}
