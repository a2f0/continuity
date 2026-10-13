import type { Character } from "../../src/canon/types";

export const priyaNatarajan: Character = {
  id: "priya-natarajan",
  name: { given: "Priya", family: "Natarajan" },
  sex: "F",
  pronouns: "she/her",
  birthDate: "1984-09-09",
  birthPlace: "Chennai, India",
  appearance: {
    heightCm: 160,
    weightKg: 55,
    eyes: "BRO",
    hair: "BLK",
    skinTone: "#a46e4f",
    hairColor: "#141011",
    hairStyle: "ponytail",
    clothing: "#5b3d7a",
    description:
      "South Indian woman with medium brown skin, long straight black hair in a sleek low ponytail, dark brown eyes, a small gold nose stud, a confident warm smile, wearing a plum blazer over a black top",
  },
  address: {
    street: "2210 Bayview Terrace",
    city: "Port Alder",
    region: "CS",
    postalCode: "98473",
    country: "USA",
  },
  phones: [
    { label: "mobile", number: "(360) 555-0175" },
    { label: "work", number: "(360) 555-0101" },
  ],
  emails: [
    { label: "work", address: "priya@harborlight.example" },
    { label: "personal", address: "priya.natarajan@inbox.example" },
  ],
  occupation: {
    title: "Design Director",
    organization: "Harborlight Studio",
    department: "Design",
  },
  bio: "Priya leads the design team at Harborlight Studio and hired Maya Reyes six years ago. She moved to Port Alder from the Bay Area in 2016, renewed her Cascadia license in 2025, and runs the Thursday design reviews that Maya's notes keep mentioning.",
  signature: { font: "mrs-saint-delafield" },
  relationships: [{ to: "maya-reyes", kind: "report" }],
  documents: {
    driversLicense: {
      jurisdiction: "cascadia",
      number: "N312-6658-0914",
      class: "C",
      issued: "2025-08-28",
      documentDiscriminator: "2508283057CS1",
    },
  },
};
