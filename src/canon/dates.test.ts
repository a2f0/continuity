import { describe, expect, test } from "bun:test";
import {
  addYears,
  ageOn,
  birthdayIn,
  daysBetween,
  formatIcaoDate,
  formatMonthDay,
  formatMrzDate,
  formatUsDate,
  isIsoDate,
} from "./dates";

describe("calendar dates", () => {
  test("rejects impossible dates", () => {
    expect(isIsoDate("2024-02-29")).toBe(true);
    expect(isIsoDate("2023-02-29")).toBe(false);
    expect(isIsoDate("2024-13-01")).toBe(false);
    expect(isIsoDate("2024-1-01")).toBe(false);
  });

  test("counts whole years of age", () => {
    expect(ageOn("1991-03-14", "2026-03-13")).toBe(34);
    expect(ageOn("1991-03-14", "2026-03-14")).toBe(35);
  });

  test("moves leap-day anniversaries to February 28", () => {
    expect(addYears("2024-02-29", 1)).toBe("2025-02-28");
    expect(birthdayIn("2000-02-29", 2032)).toBe("2032-02-29");
  });

  test("measures days across month and year boundaries", () => {
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
    expect(daysBetween("2027-01-01", "2026-12-31")).toBe(-1);
  });

  test("formats dates for each document", () => {
    expect(formatUsDate("1991-03-14")).toBe("03/14/1991");
    expect(formatIcaoDate("2023-06-02")).toBe("02 JUN 2023");
    expect(formatMrzDate("2033-06-01")).toBe("330601");
    expect(formatMonthDay("1996-06-02")).toBe("June 2");
  });
});
