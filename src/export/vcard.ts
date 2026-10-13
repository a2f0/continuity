import { createHash } from "node:crypto";
import type { Character, World } from "../canon/types";
import { addressBook } from "./addressBook";

// The address book as vCard 3.0 (RFC 2426), the version Apple Contacts and
// Google Contacts both import and export. Lines are CRLF-terminated and
// folded at 75 octets, as the format requires.

function escapeText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", ";");
}

function fold(line: string): string {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) {
    return line;
  }
  const parts: string[] = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Never split a multi-byte UTF-8 sequence.
    while (end < bytes.length && ((bytes[end] ?? 0) & 0xc0) === 0x80) {
      end -= 1;
    }
    parts.push(bytes.subarray(start, end).toString("utf8"));
    start = end;
    limit = 74; // Continuation lines spend one octet on the leading space.
  }
  return parts.join("\r\n ");
}

/** A stable UUID derived from the character ID, so re-imports deduplicate. */
function stableUid(character: Character): string {
  const hex = createHash("sha256")
    .update(`continuity:${character.id}`)
    .digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function card(
  character: Character,
  firstName: string,
  nickname: string | undefined,
  labels: readonly string[],
  photoJpeg: Uint8Array | undefined,
): string[] {
  const { name, address, occupation } = character;
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `UID:urn:uuid:${stableUid(character)}`,
    `FN:${escapeText(`${firstName} ${name.family}`)}`,
    `N:${[name.family, firstName, name.middle ?? "", "", ""].map(escapeText).join(";")}`,
    ...(nickname ? [`NICKNAME:${escapeText(nickname)}`] : []),
    `BDAY:${character.birthDate}`,
    ...character.phones.map(
      (phone) =>
        `TEL;TYPE=${{ home: "HOME", mobile: "CELL", work: "WORK" }[phone.label]}:${phone.number}`,
    ),
    ...character.emails.map(
      (email) =>
        `EMAIL;TYPE=INTERNET;TYPE=${email.label === "work" ? "WORK" : "HOME"}:${email.address}`,
    ),
    `ADR;TYPE=HOME:${["", address.unit ?? "", address.street, address.city, address.region, address.postalCode, address.country].map(escapeText).join(";")}`,
    ...(occupation
      ? [
          `ORG:${[occupation.organization, occupation.department ?? ""].map(escapeText).join(";")}`,
          `TITLE:${escapeText(occupation.title)}`,
        ]
      : []),
    ...(labels.length > 0
      ? [`CATEGORIES:${labels.map(escapeText).join(",")}`]
      : []),
    ...(photoJpeg
      ? [
          `PHOTO;ENCODING=b;TYPE=JPEG:${Buffer.from(photoJpeg).toString("base64")}`,
        ]
      : []),
    "END:VCARD",
  ];
  return lines.map(fold);
}

export function addressBookVcard(
  world: World,
  photos: ReadonlyMap<string, Uint8Array>,
): string {
  const cards = addressBook(world).flatMap(({ character, entry, firstName }) =>
    card(
      character,
      firstName,
      entry.nickname,
      entry.labels ?? [],
      photos.get(character.id),
    ),
  );
  return `${cards.join("\r\n")}\r\n`;
}
