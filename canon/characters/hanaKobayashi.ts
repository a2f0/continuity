import type { Character } from "../../src/canon/types";

export const hanaKobayashi: Character = {
  id: "hana-kobayashi",
  name: { given: "Hana", family: "Kobayashi" },
  sex: "F",
  pronouns: "she/her",
  birthDate: "1977-04-03",
  birthPlace: "Sacramento, California",
  appearance: {
    heightCm: 162,
    weightKg: 57,
    eyes: "BRO",
    hair: "BLK",
    skinTone: "#e6c4a5",
    hairColor: "#1a1617",
    hairStyle: "bob",
    glasses: true,
    clothing: "#2f6b6b",
    description:
      "Japanese-American woman with light skin, a chin-length black bob with a few strands of gray, dark brown eyes, thin rimless glasses, a calm attentive expression with a slight smile, wearing a teal button-up shirt",
  },
  address: {
    street: "1427 Alder Crest Ave",
    unit: "Apt 3A",
    city: "Port Alder",
    region: "CS",
    postalCode: "98471",
    country: "USA",
  },
  phones: [
    { label: "mobile", number: "(360) 555-0154" },
    { label: "work", number: "(360) 555-0150" },
  ],
  emails: [
    { label: "personal", address: "hana.kobayashi@inbox.example" },
    { label: "work", address: "hkobayashi@aldercreekvet.example" },
  ],
  occupation: {
    title: "Veterinarian",
    organization: "Alder Creek Animal Hospital",
  },
  bio: "Hana is a veterinarian at Alder Creek Animal Hospital and lives across the hall from Maya and Daniel in apartment 3A. She treats Pepper, takes him for a weekend when Maya and Daniel travel, and has a standing invitation to their Friday pizza nights.",
  signature: { font: "la-belle-aurore" },
  relationships: [
    { to: "maya-reyes", kind: "neighbor" },
    { to: "daniel-okafor", kind: "neighbor" },
  ],
  documents: {
    driversLicense: {
      jurisdiction: "cascadia",
      number: "K148-5562-7031",
      class: "C",
      issued: "2022-03-15",
      restrictions: ["B"],
      documentDiscriminator: "2203152268CS3",
    },
  },
};
