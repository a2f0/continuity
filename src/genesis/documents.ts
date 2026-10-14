import {
  driversLicenseExpiration,
  findJurisdiction,
  findPassportIssuer,
  passportExpiration,
} from "../canon/derive";
import type { Character, World } from "../canon/types";
import { CARD, type CardArt } from "../render/card";
import { driversLicenseBack } from "../render/drivers-license/back";
import { driversLicenseFront } from "../render/drivers-license/front";
import { passportDataPage } from "../render/passport/dataPage";
import { DATA_PAGE } from "../render/passport/types";
import type { Portrait } from "../render/portrait";
import { rasterize, toJpeg } from "../render/raster";
import { framedDocumentSvg } from "../render/scanFrame";
import {
  CARD_WIDTH_PX,
  capture,
  JPEG_QUALITY,
  PAGE_WIDTH_PX,
} from "./documentCapture";
import { renderWalletDocuments } from "./walletDocuments";

// Renders a character's identity documents as photographed JPEGs.

export interface RenderedDocuments {
  readonly driversLicenseFront?: Uint8Array;
  readonly driversLicenseBack?: Uint8Array;
  readonly passport?: Uint8Array;
  readonly birthCertificate?: Uint8Array;
  readonly creditCardFront?: Uint8Array;
  readonly creditCardBack?: Uint8Array;
}

function renderLicense(
  world: World,
  character: Character,
  portrait: Portrait,
): RenderedDocuments {
  const license = character.documents.driversLicense;
  if (!license) {
    return {};
  }
  const jurisdiction = findJurisdiction(world, license.jurisdiction);
  const input = {
    character,
    expires: driversLicenseExpiration(character, license, jurisdiction),
    jurisdiction,
    license,
    portrait,
  };
  const render = (art: CardArt, clipId: string, side: string) =>
    toJpeg(
      rasterize(
        framedDocumentSvg(art, CARD, {
          clipId,
          margin: 5,
          ...capture(`${character.id}:${side}`),
        }),
        CARD_WIDTH_PX,
      ),
      JPEG_QUALITY,
    );
  return {
    driversLicenseBack: render(driversLicenseBack(input), "b-card", "back"),
    driversLicenseFront: render(driversLicenseFront(input), "f-card", "front"),
  };
}

function renderPassport(
  world: World,
  character: Character,
  portrait: Portrait,
): RenderedDocuments {
  const passport = character.documents.passport;
  if (!passport) {
    return {};
  }
  const issuer = findPassportIssuer(world, passport.issuer);
  const art = passportDataPage({
    character,
    expires: passportExpiration(passport, issuer),
    issuer,
    passport,
    portrait,
  });
  const svg = framedDocumentSvg(art, DATA_PAGE, {
    clipId: "p-page",
    margin: 6,
    ...capture(`${character.id}:passport`),
  });
  return { passport: toJpeg(rasterize(svg, PAGE_WIDTH_PX), JPEG_QUALITY) };
}

export function renderDocuments(
  world: World,
  character: Character,
  portrait: Portrait,
): RenderedDocuments {
  return {
    ...renderLicense(world, character, portrait),
    ...renderPassport(world, character, portrait),
    ...renderWalletDocuments(world, character),
  };
}
