// Machine readable zone for TD3 (passport) documents, per ICAO Doc 9303 part 4.

const LINE_LENGTH = 44;
const WEIGHTS = [7, 3, 1] as const;

function characterValue(character: string): number {
  if (character === "<") {
    return 0;
  }
  if (character >= "0" && character <= "9") {
    return character.charCodeAt(0) - 48;
  }
  if (character >= "A" && character <= "Z") {
    return character.charCodeAt(0) - 55;
  }
  throw new Error(`Character ${character} is not allowed in an MRZ`);
}

export function checkDigit(field: string): string {
  let sum = 0;
  [...field].forEach((character, index) => {
    sum += characterValue(character) * (WEIGHTS[index % 3] ?? 1);
  });
  return String(sum % 10);
}

/** Uppercase, strip diacritics, and turn separators into fillers. */
export function transliterate(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .replace(/[\s'-]+/g, "<")
    .replace(/[^A-Z0-9<]/g, "");
}

function pad(value: string, length: number): string {
  return value.slice(0, length).padEnd(length, "<");
}

export interface MrzInput {
  readonly issuingState: string;
  readonly surname: string;
  readonly givenNames: string;
  readonly documentNumber: string;
  readonly nationality: string;
  /** YYMMDD. */
  readonly birthDate: string;
  readonly sex: "F" | "M" | "X";
  /** YYMMDD. */
  readonly expiryDate: string;
  readonly personalNumber?: string;
}

export function passportMrz(input: MrzInput): readonly [string, string] {
  const names = `${transliterate(input.surname)}<<${transliterate(input.givenNames)}`;
  const line1 = pad(`P<${input.issuingState}${names}`, LINE_LENGTH);

  const number = pad(input.documentNumber, 9);
  const personal = pad(transliterate(input.personalNumber ?? ""), 14);
  // An all-filler personal number may carry "<" as its check digit.
  const personalCheck = /^<+$/.test(personal) ? "<" : checkDigit(personal);
  const numberField = number + checkDigit(number);
  const birthField = input.birthDate + checkDigit(input.birthDate);
  const expiryField = input.expiryDate + checkDigit(input.expiryDate);
  const composite = checkDigit(
    numberField + birthField + expiryField + personal + personalCheck,
  );
  const sex = input.sex === "X" ? "<" : input.sex;
  const line2 = `${numberField}${input.nationality}${birthField}${sex}${expiryField}${personal}${personalCheck}${composite}`;
  return [line1, line2];
}
