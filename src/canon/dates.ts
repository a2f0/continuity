import type { IsoDate } from "./types";

// Calendar-date helpers. Canon dates are plain YYYY-MM-DD strings with no time
// zone, so everything here works on {year, month, day} triples and never
// constructs a local-time Date.

interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isIsoDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return (
    month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month)
  );
}

function parse(date: IsoDate): CalendarDate {
  if (!isIsoDate(date)) {
    throw new Error(`Invalid calendar date: ${date}`);
  }
  const [year = 0, month = 0, day = 0] = date.split("-").map(Number);
  return { day, month, year };
}

function format({ year, month, day }: CalendarDate): IsoDate {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

export function compareDates(left: IsoDate, right: IsoDate): number {
  // Zero-padded ISO dates sort lexicographically.
  parse(left);
  parse(right);
  return left < right ? -1 : left > right ? 1 : 0;
}

/** Days from `from` to `to`; negative when `to` is earlier. */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  const a = parse(from);
  const b = parse(to);
  const ms =
    Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day);
  return Math.round(ms / 86_400_000);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const { year, month, day } = parse(date);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return format({
    day: shifted.getUTCDate(),
    month: shifted.getUTCMonth() + 1,
    year: shifted.getUTCFullYear(),
  });
}

/**
 * The same month and day `years` later. February 29 falls back to February 28
 * in common years, which is how licensing agencies treat leap-day birthdays.
 */
export function addYears(date: IsoDate, years: number): IsoDate {
  const { year, month, day } = parse(date);
  const targetYear = year + years;
  return format({
    day: Math.min(day, daysInMonth(targetYear, month)),
    month,
    year: targetYear,
  });
}

/** Whole years elapsed from `birthDate` to `on`. */
export function ageOn(birthDate: IsoDate, on: IsoDate): number {
  const birth = parse(birthDate);
  const at = parse(on);
  const hadBirthday =
    at.month > birth.month || (at.month === birth.month && at.day >= birth.day);
  return at.year - birth.year - (hadBirthday ? 0 : 1);
}

/** The holder's birthday in the given year. */
export function birthdayIn(birthDate: IsoDate, year: number): IsoDate {
  const { year: birthYear } = parse(birthDate);
  return addYears(birthDate, year - birthYear);
}

export function yearOf(date: IsoDate): number {
  return parse(date).year;
}

/** MM/DD/YYYY, as printed on US-style driver's licenses. */
export function formatUsDate(date: IsoDate): string {
  const { year, month, day } = parse(date);
  return `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}/${year}`;
}

/** DD MMM YYYY, as printed in a passport's visual inspection zone. */
export function formatIcaoDate(date: IsoDate): string {
  const { year, month, day } = parse(date);
  return `${String(day).padStart(2, "0")} ${MONTH_NAMES[month - 1]?.slice(0, 3).toUpperCase()} ${year}`;
}

/** YYMMDD, as encoded in a machine readable zone. */
export function formatMrzDate(date: IsoDate): string {
  const { year, month, day } = parse(date);
  return `${String(year % 100).padStart(2, "0")}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
}

/** "June 2", for prose. */
export function formatMonthDay(date: IsoDate): string {
  const { month, day } = parse(date);
  return `${MONTH_NAMES[month - 1]} ${day}`;
}
