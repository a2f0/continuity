import { describe, expect, test } from "bun:test";
import { checkDigit, passportMrz, transliterate } from "./mrz";

describe("passportMrz", () => {
  test("reproduces the ICAO Doc 9303 TD3 specimen", () => {
    const [line1, line2] = passportMrz({
      birthDate: "740812",
      documentNumber: "L898902C3",
      expiryDate: "120415",
      givenNames: "Anna Maria",
      issuingState: "UTO",
      nationality: "UTO",
      personalNumber: "ZE184226B",
      sex: "F",
      surname: "Eriksson",
    });
    expect(line1).toBe("P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<");
    expect(line2).toBe("L898902C36UTO7408122F1204159ZE184226B<<<<<10");
  });

  test("keeps both lines exactly 44 characters", () => {
    const lines = passportMrz({
      birthDate: "910314",
      documentNumber: "UA4821937",
      expiryDate: "330601",
      givenNames: "Maya Elena",
      issuingState: "UTO",
      nationality: "UTO",
      sex: "F",
      surname: "Reyes",
    });
    expect(lines.map((line) => line.length)).toEqual([44, 44]);
    expect(lines[1]).toMatch(/^[A-Z0-9<]{44}$/);
  });
});

describe("checkDigit", () => {
  test("weights characters 7-3-1 and treats fillers as zero", () => {
    expect(checkDigit("L898902C3")).toBe("6");
    expect(checkDigit("740812")).toBe("2");
    expect(checkDigit("<<<")).toBe("0");
  });
});

describe("transliterate", () => {
  test("strips diacritics and joins names with fillers", () => {
    expect(transliterate("Rosa María")).toBe("ROSA<MARIA");
    expect(transliterate("O'Neil-Smith")).toBe("O<NEIL<SMITH");
  });
});
