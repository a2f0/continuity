import { expect, test } from "bun:test";
import { world } from "../../canon/world";
import {
  driversLicenseExpiration,
  findCharacter,
  findJurisdiction,
  findPassportIssuer,
  passportExpiration,
} from "../canon/derive";
import {
  birthCertificateFields,
  creditCardFields,
} from "../canon/documentFields";
import { birthCertificatePage } from "./birthCertificate";
import { creditCardBack, creditCardFront } from "./creditCard";
import { driversLicenseBack } from "./drivers-license/back";
import { driversLicenseFront } from "./drivers-license/front";
import { passportDataPage } from "./passport/dataPage";
import { loadPortrait } from "./portrait";

test("every generated document face renders without visible specimen marks", () => {
  const character = findCharacter(world, world.device.owner);
  const { driversLicense, passport, birthCertificate, creditCard } =
    character.documents;
  if (!driversLicense || !passport || !birthCertificate || !creditCard)
    throw new Error("Missing document artwork fixtures");
  const portrait = loadPortrait(character);
  const jurisdiction = findJurisdiction(world, driversLicense.jurisdiction);
  const license = {
    character,
    portrait,
    jurisdiction,
    license: driversLicense,
    expires: driversLicenseExpiration(character, driversLicense, jurisdiction),
  };
  const card = creditCardFields(character, creditCard);
  const faces = [
    driversLicenseFront(license),
    driversLicenseBack(license),
    passportDataPage({
      character,
      portrait,
      passport,
      issuer: findPassportIssuer(world, passport.issuer),
      expires: passportExpiration(
        passport,
        findPassportIssuer(world, passport.issuer),
      ),
    }),
    birthCertificatePage(
      birthCertificateFields(world, character, birthCertificate),
    ),
    creditCardFront(card),
    creditCardBack(card),
  ];
  for (const face of faces) {
    expect(face.body).toContain("<text");
    expect(face.body).not.toContain("SPECIMEN");
  }
});
