import type { canonSnapshot } from "../genesis/canonSnapshot";

export type Snapshot = ReturnType<typeof canonSnapshot>;
export type Person = Snapshot["characters"][number];

export interface Asset {
  readonly path: string;
  readonly bytes: number;
  readonly image?: { readonly width: number; readonly height: number };
}

export interface Gallery {
  readonly canon: Snapshot;
  readonly notes: readonly { readonly text: string }[];
  readonly assets: readonly Asset[];
}
