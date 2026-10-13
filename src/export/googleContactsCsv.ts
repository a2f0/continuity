import type { Email, Phone, World } from "../canon/types";
import { addressBook, formattedAddress } from "./addressBook";

// The address book as a Google Contacts CSV export: the same 38 columns, in
// the same order, as a real export, so it exercises the same import paths.

const COLUMNS = [
  "First Name",
  "Middle Name",
  "Last Name",
  "Phonetic First Name",
  "Phonetic Middle Name",
  "Phonetic Last Name",
  "Name Prefix",
  "Name Suffix",
  "Nickname",
  "File As",
  "Organization Name",
  "Organization Title",
  "Organization Department",
  "Birthday",
  "Notes",
  "Photo",
  "Labels",
  "E-mail 1 - Label",
  "E-mail 1 - Value",
  "E-mail 2 - Label",
  "E-mail 2 - Value",
  "Phone 1 - Label",
  "Phone 1 - Value",
  "Phone 2 - Label",
  "Phone 2 - Value",
  "Phone 3 - Label",
  "Phone 3 - Value",
  "Address 1 - Label",
  "Address 1 - Formatted",
  "Address 1 - Street",
  "Address 1 - City",
  "Address 1 - PO Box",
  "Address 1 - Region",
  "Address 1 - Postal Code",
  "Address 1 - Country",
  "Address 1 - Extended Address",
  "Website 1 - Label",
  "Website 1 - Value",
] as const;

type Column = (typeof COLUMNS)[number];

const EMAIL_LABELS: Readonly<Record<Email["label"], string>> = {
  personal: "Home",
  work: "Work",
};

const PHONE_LABELS: Readonly<Record<Phone["label"], string>> = {
  home: "Home",
  mobile: "Mobile",
  work: "Work",
};

function quote(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function numbered<T>(
  items: readonly T[],
  count: number,
  prefix: string,
  describe: (item: T) => [string, string],
): Partial<Record<Column, string>> {
  const row: Partial<Record<string, string>> = {};
  items.slice(0, count).forEach((item, index) => {
    const [label, value] = describe(item);
    // Google marks the first entry of each kind as primary with "* ".
    row[`${prefix} ${index + 1} - Label`] = index === 0 ? `* ${label}` : label;
    row[`${prefix} ${index + 1} - Value`] = value;
  });
  return row as Partial<Record<Column, string>>;
}

export function googleContactsCsv(world: World): string {
  const rows = addressBook(world).map(({ character, entry, firstName }) => {
    const { address, occupation } = character;
    const row: Partial<Record<Column, string>> = {
      "Address 1 - City": address.city,
      "Address 1 - Country": address.country,
      "Address 1 - Extended Address": address.unit ?? "",
      "Address 1 - Formatted": formattedAddress(character),
      "Address 1 - Label": "Home",
      "Address 1 - Postal Code": address.postalCode,
      "Address 1 - Region": address.region,
      "Address 1 - Street": address.street,
      Birthday: character.birthDate,
      "First Name": firstName,
      Labels: ["* myContacts", ...(entry.labels ?? [])].join(" ::: "),
      "Last Name": character.name.family,
      "Middle Name": character.name.middle ?? "",
      Nickname: entry.nickname ?? "",
      "Organization Department": occupation?.department ?? "",
      "Organization Name": occupation?.organization ?? "",
      "Organization Title": occupation?.title ?? "",
      ...numbered(character.emails, 2, "E-mail", (email) => [
        EMAIL_LABELS[email.label],
        email.address,
      ]),
      ...numbered(character.phones, 3, "Phone", (phone) => [
        PHONE_LABELS[phone.label],
        phone.number,
      ]),
    };
    return COLUMNS.map((column) => quote(row[column] ?? "")).join(",");
  });
  return `${[COLUMNS.join(","), ...rows].join("\n")}\n`;
}
