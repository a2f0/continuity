import type {
  Character,
  IsoDate,
  Passport,
  PassportIssuer,
} from "../../canon/types";
import type { Portrait } from "../portrait";

export const DATA_PAGE = { width: 125, height: 88, radius: 2.5 } as const;

export interface PassportInput {
  readonly character: Character;
  readonly passport: Passport;
  readonly issuer: PassportIssuer;
  readonly expires: IsoDate;
  readonly portrait: Portrait;
}
