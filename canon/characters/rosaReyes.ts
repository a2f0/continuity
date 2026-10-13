import type { Character } from "../../src/canon/types";

export const rosaReyes: Character = {
  id: "rosa-reyes",
  name: { given: "Rosa", middle: "María", family: "Reyes" },
  sex: "F",
  pronouns: "she/her",
  birthDate: "1963-07-22",
  birthPlace: "Aurelia, Utopia",
  appearance: {
    heightCm: 157,
    weightKg: 66,
    eyes: "BRO",
    hair: "GRY",
    skinTone: "#c08a66",
    hairColor: "#8d8580",
    hairStyle: "bun",
    glasses: true,
    clothing: "#8c3b4a",
    description:
      "Latina woman with warm tan skin, dark hair streaked with silver pulled into a low bun, warm brown eyes with laugh lines, thin gold-rimmed glasses, a kind closed-mouth smile, wearing a deep red cardigan",
  },
  address: {
    street: "88 Juniper Lane",
    city: "Cedar Hollow",
    region: "CS",
    postalCode: "98432",
    country: "USA",
  },
  phones: [
    { label: "mobile", number: "(360) 555-0119" },
    { label: "home", number: "(360) 555-0120" },
  ],
  emails: [{ label: "personal", address: "rosa.reyes@inbox.example" }],
  bio: "Rosa emigrated from Aurelia, Utopia, in 1998 with her children Maya and Theo, and worked thirty years as a pediatric nurse at Cedar Hollow Community Hospital before retiring in 2024. She hosts Sunday dinner most weeks, still keeps a landline, and renews her Utopian passport so she can visit her sister in Aurelia.",
  signature: { font: "mrs-saint-delafield", text: "Rosa M. Reyes" },
  relationships: [
    { to: "maya-reyes", kind: "child" },
    { to: "theo-reyes", kind: "child" },
  ],
  documents: {
    driversLicense: {
      jurisdiction: "cascadia",
      number: "R205-9931-4472",
      class: "C",
      issued: "2023-07-10",
      restrictions: ["B"],
      documentDiscriminator: "2307106615CS2",
      donor: true,
    },
    passport: {
      issuer: "utopia",
      number: "UC1067354",
      issued: "2021-11-30",
    },
  },
};
