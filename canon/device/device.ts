import type { Device } from "../../src/canon/types";
import { folders } from "./folders";
import { household } from "./household";
import { notes } from "./notes";
import { passcodes } from "./passcodes";

// Maya's phone: what a fresh tearleads install is seeded with.
export const device: Device = {
  household,
  owner: "maya-reyes",
  tearleads: {
    // tearleads' screenshot run signs in with this phrase from the seed.
    identitySeedPhrase:
      "furnace very nurse royal tourist connect just slim furnace very nurse royal tourist connect just slim furnace very nurse royal tourist connect just spring",
    // Maya's mother, husband, and brother share a Family group.
    groups: ["Family"],
    folders,
  },
  addressBook: [
    { character: "rosa-reyes", nickname: "Mom", labels: ["Family"] },
    { character: "daniel-okafor", labels: ["Family"] },
    { character: "theo-reyes", labels: ["Family"] },
    { character: "priya-natarajan", labels: ["Work"] },
    { character: "sam-whitfield", labels: ["Friends"] },
    { character: "hana-kobayashi", labels: ["Neighbors"] },
    { character: "marcus-bell", labels: ["Friends"] },
  ],
  notes,
  passcodes,
  wallet: ["drivers_license", "passport", "birth_certificate", "credit_card"],
};
