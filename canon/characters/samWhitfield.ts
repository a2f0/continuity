import type { Character } from "../../src/canon/types";

export const samWhitfield: Character = {
  id: "sam-whitfield",
  name: {
    given: "Samuel",
    middle: "James",
    family: "Whitfield",
    preferred: "Sam",
  },
  sex: "M",
  pronouns: "he/him",
  birthDate: "1990-12-19",
  birthPlace: "Fernwood, Cascadia",
  appearance: {
    heightCm: 190,
    weightKg: 95,
    eyes: "BLU",
    hair: "RED",
    skinTone: "#e8c3a8",
    hairColor: "#8a3f1d",
    hairStyle: "short",
    facialHair: "beard",
    clothing: "#6b4f36",
    description:
      "White man with fair freckled skin, short tousled auburn hair, a full reddish-brown beard, blue eyes, broad shoulders, a friendly lopsided smile, wearing a brown and cream flannel shirt",
  },
  address: {
    street: "47 Mill Road",
    city: "Fernwood",
    region: "CS",
    postalCode: "98455",
    country: "USA",
  },
  phones: [
    { label: "mobile", number: "(360) 555-0131" },
    { label: "work", number: "(360) 555-0132" },
  ],
  emails: [{ label: "work", address: "sam@whitfieldwoodworks.example" }],
  occupation: { title: "Owner", organization: "Whitfield Woodworks" },
  bio: "Sam roomed down the hall from Maya Reyes at Cascadia State University, dropped out of architecture, and now runs Whitfield Woodworks from a converted barn in Fernwood. He climbs with Daniel Okafor on Tuesdays, rides a 1978 motorcycle he rebuilt himself, and is always about to fix Rosa's porch railing.",
  signature: { font: "dawning-of-a-new-day", text: "Sam Whitfield" },
  relationships: [
    { to: "maya-reyes", kind: "friend" },
    { to: "daniel-okafor", kind: "friend" },
  ],
  documents: {
    driversLicense: {
      jurisdiction: "cascadia",
      number: "W775-3109-8826",
      class: "C",
      issued: "2020-12-01",
      endorsements: ["M"],
      documentDiscriminator: "2012017741CS2",
      donor: true,
    },
  },
};
