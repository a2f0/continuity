import type { Character } from "../../src/canon/types";

export const marcusBell: Character = {
  id: "marcus-bell",
  name: { given: "Marcus", middle: "Anthony", family: "Bell" },
  sex: "M",
  pronouns: "he/him",
  birthDate: "1994-08-27",
  birthPlace: "Atlanta, Georgia",
  appearance: {
    heightCm: 175,
    weightKg: 72,
    eyes: "BRO",
    hair: "BLK",
    skinTone: "#5a3a2a",
    hairColor: "#120d0b",
    hairStyle: "twists",
    clothing: "#c46a2b",
    description:
      "Black man with dark brown skin, short two-strand twists, clean-shaven, dark brown eyes, a lean athletic build, a bright open smile, wearing a burnt orange quarter-zip pullover",
  },
  address: {
    street: "3305 Cormorant Way",
    city: "Port Alder",
    region: "CS",
    postalCode: "98472",
    country: "USA",
  },
  phones: [{ label: "mobile", number: "(360) 555-0198" }],
  emails: [
    { label: "personal", address: "marcus.bell@inbox.example" },
    { label: "work", address: "mbell@tidewater.example" },
  ],
  occupation: {
    title: "Software Engineer",
    organization: "Tidewater Systems",
  },
  bio: "Marcus moved from Atlanta to Port Alder in 2023 for an engineering job at Tidewater Systems and swapped his Georgia license for a Cascadia one that August. He met Maya Reyes on a Saturday group ride, now leads it, and keeps telling everyone to go tubeless.",
  signature: { font: "herr-von-muellerhoff" },
  relationships: [
    { to: "maya-reyes", kind: "friend" },
    { to: "daniel-okafor", kind: "friend" },
  ],
  documents: {
    driversLicense: {
      jurisdiction: "cascadia",
      number: "B590-8814-2265",
      class: "C",
      issued: "2023-08-14",
      documentDiscriminator: "2308149936CS1",
    },
  },
};
