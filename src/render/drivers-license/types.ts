import type {
  Character,
  DriversLicense,
  IsoDate,
  Jurisdiction,
} from "../../canon/types";
import type { Portrait } from "../portrait";

// AAMVA-numbered fields on an original design supplied by a fictional issuer.
export interface LicenseInput {
  readonly character: Character;
  readonly license: DriversLicense;
  readonly jurisdiction: Jurisdiction;
  readonly expires: IsoDate;
  readonly portrait: Portrait;
}
