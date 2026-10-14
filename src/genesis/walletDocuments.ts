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
import { framedDocumentSvg } from "../render/scanFrame";
import { el } from "../render/svg";

export function renderWalletDocuments(world: World, character: Character) {
  const { birthCertificate, creditCard } = character.documents;
  const render = (
    art: CardArt,
    size: typeof CARD | typeof CERTIFICATE_PAGE,
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
            rotation: -0.6,
            glareAngle: 20,
          },
        ),
        width,
      ),
      88,
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
            2000,
          ),
        }
      : {}),
    ...(creditCard
      ? {
          creditCardFront: render(
            creditCardFront(creditCardFields(character, creditCard)),
            CARD,
            "credit-front",
            1600,
          ),
          creditCardBack: render(
            creditCardBack(creditCardFields(character, creditCard)),
            CARD,
            "credit-back",
            1600,
          ),
        }
      : {}),
  };
}
