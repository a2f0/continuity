export interface FamilyPhoto {
  readonly id: string;
  readonly fileName: string;
  readonly characters: readonly string[];
  readonly capturedAt: string;
}

export interface Equipment {
  readonly id: string;
  readonly kind: "tool" | "appliance";
  readonly equipmentType: string;
  readonly make: string;
  readonly model: string;
  readonly serialNumber: string;
  readonly photos: readonly string[];
}

export interface Household {
  readonly photos: readonly FamilyPhoto[];
  readonly equipment: readonly Equipment[];
  readonly weight: readonly {
    readonly measuredAt: string;
    readonly weight: string;
    readonly unit: "kg" | "lb";
    readonly notes: string;
  }[];
  readonly bloodPressure: readonly {
    readonly measuredAt: string;
    readonly systolic: string;
    readonly diastolic: string;
    readonly pulse: string;
    readonly notes: string;
  }[];
}
