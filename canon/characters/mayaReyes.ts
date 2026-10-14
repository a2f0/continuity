import type { Character } from "../../src/canon/types";

export const mayaReyes: Character = {
  id: "maya-reyes",
  name: { given: "Maya", middle: "Elena", family: "Reyes" },
  sex: "F",
  pronouns: "she/her",
  birthDate: "1991-03-14",
  birthPlace: "Aurelia, Utopia",
  appearance: {
    heightCm: 165,
    weightKg: 61,
    eyes: "BRO",
    hair: "BLK",
    skinTone: "#c99773",
    hairColor: "#2b1d16",
    hairStyle: "long",
    clothing: "#3d5a80",
    description:
      "Latina woman with warm olive-tan skin, long dark brown wavy hair falling past her shoulders, brown eyes, thick dark eyebrows, small gold stud earrings, natural makeup, a gentle closed-mouth smile, wearing a slate blue blouse",
  },
  address: {
    street: "1427 Alder Crest Ave",
    unit: "Apt 3B",
    city: "Port Alder",
    region: "CS",
    postalCode: "98471",
    country: "USA",
  },
  phones: [{ label: "mobile", number: "(360) 555-0142" }],
  emails: [
    { label: "personal", address: "maya.reyes@inbox.example" },
    { label: "work", address: "maya@harborlight.example" },
  ],
  occupation: {
    title: "Senior Product Designer",
    organization: "Harborlight Studio",
    department: "Design",
  },
  bio: "Born in Aurelia, Utopia, Maya moved to Port Alder at seven with her mother Rosa and baby brother Theo, and keeps her Utopian passport alongside her Cascadia license. She studied design at Cascadia State University, where she met Sam Whitfield, and has spent six years at Harborlight Studio, now reporting to Priya Natarajan. She married Daniel Okafor in 2019; they share apartment 3B on Alder Crest Avenue with Pepper, a border collie mix whose vet, Hana Kobayashi, lives across the hall. Saturday mornings she rides with Marcus Bell. She wears contact lenses, so her license carries a corrective-lens restriction.",
  signature: { font: "la-belle-aurore", text: "Maya E. Reyes" },
  relationships: [
    { to: "daniel-okafor", kind: "spouse" },
    { to: "rosa-reyes", kind: "parent" },
    { to: "theo-reyes", kind: "sibling" },
    { to: "priya-natarajan", kind: "manager" },
    { to: "sam-whitfield", kind: "friend" },
    { to: "hana-kobayashi", kind: "neighbor" },
    { to: "marcus-bell", kind: "friend" },
  ],
  documents: {
    birthCertificate: {
      number: "UT-B-1991-0314-042",
      authority: "Aurelia Civil Registry, Utopia",
      issued: "1991-03-20",
    },
    creditCard: {
      issuer: "Alder Grove Bank",
      number: "0000000000004242",
      cvv: "000",
      issued: "2025-06-01",
      validityYears: 3,
    },
    driversLicense: {
      jurisdiction: "cascadia",
      number: "R620-4183-9147",
      class: "C",
      issued: "2024-02-20",
      restrictions: ["B"],
      documentDiscriminator: "2402200817CS3",
      donor: true,
    },
    passport: {
      issuer: "utopia",
      number: "UA4821937",
      issued: "2023-06-02",
    },
  },
};
