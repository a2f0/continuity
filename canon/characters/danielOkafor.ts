import type { Character } from "../../src/canon/types";

export const danielOkafor: Character = {
  id: "daniel-okafor",
  name: { given: "Daniel", middle: "Chidi", family: "Okafor" },
  sex: "M",
  pronouns: "he/him",
  birthDate: "1989-11-02",
  birthPlace: "Port Alder, Cascadia",
  appearance: {
    heightCm: 185,
    weightKg: 84,
    eyes: "BRO",
    hair: "BLK",
    skinTone: "#6b4430",
    hairColor: "#151010",
    hairStyle: "buzz",
    facialHair: "beard",
    glasses: true,
    clothing: "#4a4e57",
    description:
      "Nigerian-American man with deep brown skin, close-cropped black hair, a neatly trimmed short black beard, rectangular dark tortoiseshell glasses, a warm easy smile, wearing a charcoal crewneck sweater over a collared shirt",
  },
  address: {
    street: "1427 Alder Crest Ave",
    unit: "Apt 3B",
    city: "Port Alder",
    region: "CS",
    postalCode: "98471",
    country: "USA",
  },
  phones: [
    { label: "mobile", number: "(360) 555-0187" },
    { label: "work", number: "(360) 555-0110" },
  ],
  emails: [
    { label: "personal", address: "daniel.okafor@inbox.example" },
    { label: "work", address: "dokafor@portalderschools.example" },
  ],
  occupation: {
    title: "Chemistry Teacher",
    organization: "Port Alder High School",
    department: "Science",
  },
  bio: "Daniel grew up in Port Alder and has taught chemistry at Port Alder High School for nine years. He married Maya Reyes in 2019. He climbs at the gym on Tuesdays with Sam Whitfield, rides occasionally with Marcus Bell, and is the one who walks Pepper before school. He has worn glasses since he was twelve.",
  signature: { font: "herr-von-muellerhoff" },
  relationships: [
    { to: "maya-reyes", kind: "spouse" },
    { to: "hana-kobayashi", kind: "neighbor" },
    { to: "sam-whitfield", kind: "friend" },
    { to: "marcus-bell", kind: "friend" },
  ],
  documents: {
    driversLicense: {
      jurisdiction: "cascadia",
      number: "O415-7720-3368",
      class: "C",
      issued: "2021-10-15",
      restrictions: ["B"],
      documentDiscriminator: "2110154402CS1",
    },
  },
};
