import type {
  Character,
  DriversLicense,
  IsoDate,
  Jurisdiction,
} from "../../canon/types";
import type { Portrait } from "../portrait";

export interface LicenseInput {
  readonly character: Character;
  readonly license: DriversLicense;
  readonly jurisdiction: Jurisdiction;
  readonly expires: IsoDate;
  readonly portrait: Portrait;
}
