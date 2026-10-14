import type { Device } from "../../src/canon/types";
import { notes } from "./notes";

// Maya's phone: what a fresh tearleads install is seeded with.
export const device: Device = {
  owner: "maya-reyes",
  tearleads: {
    // tearleads' screenshot run reads both values from the generated seed.
    backupPassword: "screenshot-seed",
    identitySeedPhrase:
      "furnace very nurse royal tourist connect just slim furnace very nurse royal tourist connect just slim furnace very nurse royal tourist connect just spring",
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
  wallet: ["drivers_license", "passport", "birth_certificate", "credit_card"],
};
