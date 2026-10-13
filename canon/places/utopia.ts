import type { PassportIssuer } from "../../src/canon/types";

// Utopia (UTO) is the specimen state ICAO Doc 9303 uses in its own examples,
// so its passports are recognizably fictional while following the real data
// page layout and machine readable zone rules.
export const utopia: PassportIssuer = {
  id: "utopia",
  name: "Utopia",
  code: "UTO",
  nationality: "UTOPIAN",
  authority: "Ministry of Foreign Affairs",
  validityYears: 10,
  numberPattern: "^U[A-Z]\\d{7}$",
  palette: {
    ink: "#2a1a1f",
    primary: "#6b1f2e",
    secondary: "#3b4a7a",
    accent: "#a8873a",
    paper: "#f4efe4",
    paperShade: "#e2d6bf",
  },
};
