import { expect, test } from "bun:test";
import { birthCertificatePage } from "./birthCertificate";
import { creditCardBack, creditCardFront } from "./creditCard";

test("certificate artwork uses the supplied registry without another jurisdiction", () => {
  const art = birthCertificatePage({
    fullName: "Example Person",
    certificateNumber: "BC-42",
    dateOfBirth: "1991-03-14",
    placeOfBirth: "Example Harbor",
    parentNames: "Example Parent",
    issuingAuthority: "Example Harbor Civil Registry",
    dateIssued: "1991-03-20",
  });
  expect(art.body).toContain("Example Harbor Civil Registry");
  expect(art.body).not.toContain("UTOPIA");
});

test("card artwork does not invent an issuer's contact details or product", () => {
  const fields = {
    issuer: "Example Bank",
    cardNumber: "0000 0000 0000 4242",
    cvvCode: "000",
    nameOnCard: "Example Person",
    expirationDate: "2028-06",
  };
  expect(creditCardFront(fields).body).toContain("Example Bank");
  expect(creditCardFront(fields).body).not.toContain("EVERYDAY");
  expect(creditCardBack(fields).body).not.toContain("aldergrove.example");
});
