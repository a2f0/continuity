import {
  birthCertificateFields,
  creditCardFields,
} from "../canon/documentFields";
import type { Character, World } from "../canon/types";
import {
  birthCertificatePage,
  CERTIFICATE_PAGE,
} from "../render/birthCertificate";
import { CARD, type CardArt } from "../render/card";
import { creditCardBack, creditCardFront } from "../render/creditCard";
import { rasterize, toJpeg } from "../render/raster";
import { type FrameSize, framedDocumentSvg } from "../render/scanFrame";
import { el } from "../render/svg";
import {
  CARD_WIDTH_PX,
  capture,
  JPEG_QUALITY,
  PAGE_WIDTH_PX,
} from "./documentCapture";

export function renderWalletDocuments(world: World, character: Character) {
  const { birthCertificate, creditCard } = character.documents;
  const render = (
    art: CardArt,
    size: FrameSize,
    clipId: string,
    width: number,
  ) =>
    toJpeg(
      rasterize(
        framedDocumentSvg(
          {
            defs:
              art.defs +
              el(
                "clipPath",
                { id: clipId },
                el("rect", {
                  width: size.width,
                  height: size.height,
                  rx: size.radius,
                }),
              ),
            body: el("g", { "clip-path": `url(#${clipId})` }, art.body),
          },
          size,
          {
            clipId,
            margin: 5,
            ...capture(`${character.id}:${clipId}`),
          },
        ),
        width,
      ),
      JPEG_QUALITY,
    );
  return {
    ...(birthCertificate
      ? {
          birthCertificate: render(
            birthCertificatePage(
              birthCertificateFields(world, character, birthCertificate),
            ),
            CERTIFICATE_PAGE,
            "birth-certificate",
            PAGE_WIDTH_PX,
          ),
        }
      : {}),
    ...(creditCard
      ? {
          creditCardFront: render(
            creditCardFront(creditCardFields(character, creditCard)),
            CARD,
            "credit-front",
            CARD_WIDTH_PX,
          ),
          creditCardBack: render(
            creditCardBack(creditCardFields(character, creditCard)),
            CARD,
            "credit-back",
            CARD_WIDTH_PX,
          ),
        }
      : {}),
  };
}
