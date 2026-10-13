import type { Character } from "../../src/canon/types";

export const theoReyes: Character = {
  id: "theo-reyes",
  name: {
    given: "Teodoro",
    middle: "Luis",
    family: "Reyes",
    preferred: "Theo",
  },
  sex: "M",
  pronouns: "he/him",
  birthDate: "1996-06-02",
  birthPlace: "Aurelia, Utopia",
  appearance: {
    heightCm: 178,
    weightKg: 76,
    eyes: "BRO",
    hair: "BLK",
    skinTone: "#c4906b",
    hairColor: "#1e1612",
    hairStyle: "fade",
    facialHair: "stubble",
    clothing: "#2f3b2f",
    description:
      "Latino man with light brown skin, short dark hair with a skin fade, light stubble, brown eyes, a small silver hoop earring in his left ear, an easygoing grin, wearing a dark olive work shirt",
  },
  address: {
    street: "512 Wharf Street",
    unit: "Unit 7",
    city: "Port Alder",
    region: "CS",
    postalCode: "98470",
    country: "USA",
  },
  phones: [{ label: "mobile", number: "(360) 555-0163" }],
  emails: [{ label: "personal", address: "theo.reyes@inbox.example" }],
  occupation: { title: "Sous Chef", organization: "Saltgrass Kitchen" },
  bio: "Theo was two when the family left Aurelia and remembers none of it, which Rosa finds unbearable. He goes by Theo everywhere except on documents, cooks at Saltgrass Kitchen on the Port Alder waterfront, and makes the arroz con pollo at Sunday dinner. His sister Maya still introduces him as her baby brother.",
  signature: { font: "homemade-apple", text: "Theo Reyes" },
  relationships: [
    { to: "rosa-reyes", kind: "parent" },
    { to: "maya-reyes", kind: "sibling" },
  ],
  documents: {
    driversLicense: {
      jurisdiction: "cascadia",
      number: "R861-0247-5593",
      class: "C",
      issued: "2022-05-23",
      documentDiscriminator: "2205239180CS4",
    },
  },
};
