import type { creditCardFields } from "../canon/documentFields";
import { CARD, type CardArt } from "./card";
import { FONT } from "./fonts";
import { el, text } from "./svg";

type Fields = ReturnType<typeof creditCardFields>;
const label = { family: FONT.sans, size: 1.8, fill: "#e1eee8" };

function background(): string {
  return (
    el("rect", {
      width: CARD.width,
      height: CARD.height,
      rx: CARD.radius,
      fill: "#173f43",
    }) +
    el("path", {
      d: "M45 0Q95 20 48 54M55 0Q105 20 58 54M65 0Q115 20 68 54",
      fill: "none",
      stroke: "#709e8c",
      "stroke-width": 0.3,
    })
  );
}

export function creditCardFront(fields: Fields): CardArt {
  const month = `${fields.expirationDate.slice(5)}/${fields.expirationDate.slice(2, 4)}`;
  return {
    defs: "",
    body: [
      background(),
      text(6, 10, fields.issuer, { ...label, size: 4, weight: 600 }),
      text(6, 16, "SPECIMEN CREDIT CARD", {
        ...label,
        letterSpacing: 0.4,
      }),
      el("rect", {
        x: 7,
        y: 21,
        width: 11,
        height: 8,
        rx: 1,
        fill: "#d9c394",
        stroke: "#ad945e",
        "stroke-width": 0.3,
      }),
      el("path", {
        d: "M7 24H18M7 26H18M11 21V29M14 21V29",
        fill: "none",
        stroke: "#ad945e",
        "stroke-width": 0.2,
      }),
      text(6, 36, fields.cardNumber, {
        ...label,
        family: FONT.mono,
        size: 3.6,
      }),
      text(6, 43, "CARDHOLDER", { ...label, size: 1.5 }),
      text(6, 48, fields.nameOnCard.toUpperCase(), { ...label, size: 2.5 }),
      text(64, 43, "VALID THRU", { ...label, size: 1.5 }),
      text(64, 48, month, { ...label, family: FONT.mono, size: 2.6 }),
      text(27, 27, "SPECIMEN", {
        ...label,
        size: 6,
        weight: 600,
        opacity: 0.7,
      }),
    ].join(""),
  };
}

export function creditCardBack(fields: Fields): CardArt {
  return {
    defs: "",
    body: [
      background(),
      el("rect", { y: 7, width: CARD.width, height: 10, fill: "#101a1b" }),
      el("rect", { x: 6, y: 22, width: 73, height: 9, fill: "#f4f0df" }),
      text(9, 28, fields.nameOnCard, { ...label, fill: "#173f43", size: 2.6 }),
      text(69, 28, fields.cvvCode, {
        ...label,
        fill: "#173f43",
        family: FONT.mono,
        size: 2.5,
      }),
      text(6, 37, "SPECIMEN · NOT VALID FOR PAYMENT", {
        ...label,
        size: 2.5,
        weight: 600,
      }),
      text(
        6,
        43,
        "Fictional issuer and account · Demonstration use only",
        label,
      ),
      text(6, 48, "No payment account · No banking services", label),
      text(70, 5, "SPECIMEN", { ...label, fill: "#ffffff", size: 1.5 }),
    ].join(""),
  };
}
