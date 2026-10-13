import type { World } from "../src/canon/types";
import { danielOkafor } from "./characters/danielOkafor";
import { hanaKobayashi } from "./characters/hanaKobayashi";
import { marcusBell } from "./characters/marcusBell";
import { mayaReyes } from "./characters/mayaReyes";
import { priyaNatarajan } from "./characters/priyaNatarajan";
import { rosaReyes } from "./characters/rosaReyes";
import { samWhitfield } from "./characters/samWhitfield";
import { theoReyes } from "./characters/theoReyes";
import { device } from "./device/device";
import { cascadia } from "./places/cascadia";
import { utopia } from "./places/utopia";

export const world: World = {
  asOf: "2026-10-01",
  characters: [
    mayaReyes,
    danielOkafor,
    rosaReyes,
    theoReyes,
    priyaNatarajan,
    samWhitfield,
    hanaKobayashi,
    marcusBell,
  ],
  jurisdictions: [cascadia],
  passportIssuers: [utopia],
  device,
};
