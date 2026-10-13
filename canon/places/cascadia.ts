import type { Jurisdiction } from "../../src/canon/types";

// A fictional Pacific Northwest state. Its cards follow the AAMVA card design
// standard's field numbering and layout conventions, so they read as real
// licenses, but no real jurisdiction's design, seal, or numbering is copied.
export const cascadia: Jurisdiction = {
  id: "cascadia",
  name: "Cascadia",
  code: "CS",
  country: "USA",
  agency: "Cascadia Department of Licensing",
  motto: "Per Silvas Ad Mare",
  minimumAge: 16,
  renewalYears: 8,
  // Family-name initial, then eleven digits.
  licenseNumberPattern: "^[A-Z]\\d{3}-\\d{4}-\\d{4}$",
  classes: {
    A: "Combination vehicles over 26,000 lbs",
    B: "Single vehicles over 26,000 lbs",
    C: "Passenger vehicles and light trucks",
  },
  endorsements: {
    M: "Motorcycle",
    N: "Tank vehicle",
    P: "Passenger transport",
    T: "Double and triple trailers",
  },
  restrictions: {
    B: "Corrective lenses",
    C: "Mechanical aid",
    E: "Automatic transmission only",
    F: "Outside mirror",
    G: "Daylight driving only",
  },
  palette: {
    ink: "#1b2a30",
    primary: "#1f4e5a",
    secondary: "#3f7a5c",
    accent: "#b8862b",
    paper: "#eef4f1",
    paperShade: "#cfe0e2",
  },
};
