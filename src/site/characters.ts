import { assetUrl, escapeHtml as e } from "./html";
import type { Gallery, Person } from "./types";

function documentImage(
  person: Person,
  path: string,
  label: string,
  gallery: Gallery,
): string {
  const image = gallery.assets.find((asset) => asset.path === path)?.image;
  if (!image) throw new Error(`Missing image dimensions for ${path}`);
  return `<figure class="document">
    <a href="${assetUrl(path)}" aria-label="Open ${e(person.displayName)}: ${e(label)}">
      <img src="${assetUrl(path)}" alt="${e(person.displayName)} — ${e(label)}, fictional specimen" loading="lazy" decoding="async" width="${image.width}" height="${image.height}">
    </a>
    <figcaption class="document-caption"><span>${e(label)}</span><a href="${assetUrl(path)}" download>Download JPG <span aria-hidden="true">↗</span></a></figcaption>
  </figure>`;
}

function details(person: Person): string {
  const { address, documents } = person;
  const facts: [string, string][] = [
    ["Born", person.birthDate],
    ["Age", String(person.age)],
    ["Home", `${address.city}, ${address.region}`],
  ];
  if (documents.driversLicense)
    facts.push(["License", documents.driversLicense.number]);
  if (documents.passport) facts.push(["Passport", documents.passport.number]);
  return `<dl class="person-facts">${facts
    .map(
      ([label, value]) => `<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`,
    )
    .join("")}</dl>`;
}

function character(person: Person, index: number, gallery: Gallery): string {
  const owner = person.id === gallery.canon.owner;
  const documents = [
    [person.files.driversLicenseFront, "Driver’s license · front"],
    [person.files.driversLicenseBack, "Driver’s license · back"],
    [person.files.passport, "Passport · data page"],
  ] as const;
  const relationships = person.relationships
    .map((relationship) => {
      const other = gallery.canon.characters.find(
        (item) => item.id === relationship.to,
      );
      return other
        ? `<a href="#${e(other.id)}">${e(other.displayName)} <span>· ${e(relationship.kind)}</span></a>`
        : "";
    })
    .join("");
  return `<article class="person" id="${e(person.id)}">
    <div class="person-heading"><span class="section-number">${String(index + 1).padStart(2, "0")}</span>
      <div><p class="eyebrow">${owner ? "Device owner" : "The cast"} / ${e(person.pronouns)}</p>
      <h3>${e(person.legalName)}</h3><p class="occupation">${e(person.occupation?.title ?? "")}${person.occupation ? ` · ${e(person.occupation.organization)}` : ""}</p></div>
      <a class="portrait" href="${assetUrl(person.files.avatar)}" download aria-label="Download ${e(person.displayName)}’s portrait">
        <img src="${assetUrl(person.files.avatar)}" alt="${e(person.displayName)}" loading="lazy" width="128" height="128">
      </a>
    </div>
    <div class="person-story"><p>${e(person.bio)}</p>${details(person)}</div>
    <div class="documents">${documents.map(([path, label]) => (path ? documentImage(person, path, label, gallery) : "")).join("")}</div>
    <div class="relationships"><span class="eyebrow">Connected to</span>${relationships}</div>
  </article>`;
}

export function characterIndex(gallery: Gallery): string {
  return `<div class="cast-index">${gallery.canon.characters
    .map(
      (person, index) => `<a href="#${e(person.id)}">
    <span class="index-number">${String(index + 1).padStart(2, "0")}</span>
    <img src="${assetUrl(person.files.avatar)}" alt="" width="80" height="80">
    <span>${e(person.displayName)}</span><span class="index-arrow" aria-hidden="true">↗</span>
  </a>`,
    )
    .join("")}</div>`;
}

export function characters(gallery: Gallery): string {
  return gallery.canon.characters
    .map((person, index) => character(person, index, gallery))
    .join("");
}
