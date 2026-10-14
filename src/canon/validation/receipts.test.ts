import { expect, test } from "bun:test";
import { world } from "../../../canon/world";
import type { Equipment } from "../householdTypes";
import { checkReceipts } from "./receipts";

const item = world.device.household.equipment[0];
if (!item?.receipt) throw new Error("Missing receipt fixture");
const receipt = item.receipt;

test("receipts match valid fictional purchase metadata", () => {
  expect(checkReceipts(world.device.household.equipment, world.asOf)).toEqual(
    [],
  );
});

for (const [label, patch] of [
  ["unsafe image", { image: "../escape" }],
  ["product image collision", { image: "drill-detail" }],
  ["future date", { purchasedAt: "2099-01-01" }],
  ["invalid date", { purchasedAt: "2026-02-30" }],
  ["fractional cents", { subtotalCents: 14900.5 }],
  ["negative tax", { taxCents: -1 }],
] satisfies Array<[string, Partial<NonNullable<Equipment["receipt"]>>]>) {
  test(`receipts reject ${label}`, () => {
    expect(
      checkReceipts(
        [{ ...item, receipt: { ...receipt, ...patch } }],
        world.asOf,
      ),
    ).toEqual(["household: invalid receipt drill"]);
  });
}

test("receipts reject duplicate numbers without duplicate photo IDs", () => {
  expect(
    checkReceipts(
      [
        item,
        {
          ...item,
          id: "second-drill",
          receipt: { ...receipt, image: "second-receipt" },
        },
      ],
      world.asOf,
    ),
  ).toEqual(["household: invalid receipt second-drill"]);
});
