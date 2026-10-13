import type { canonSnapshot } from "../genesis/canonSnapshot";

export type Snapshot = ReturnType<typeof canonSnapshot>;
export type Person = Snapshot["characters"][number];

export interface Asset {
  readonly path: string;
  readonly bytes: number;
}

export interface Gallery {
  readonly canon: Snapshot;
  readonly notes: readonly { readonly text: string }[];
  readonly assets: readonly Asset[];
}
