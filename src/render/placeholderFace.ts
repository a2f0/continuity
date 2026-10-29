import type { Appearance, EyeColor } from "../canon/types";
import { shade } from "./shade";
import { el } from "./svg";

// Facial features for the placeholder bust, drawn over the head ellipse.

const IRIS: Readonly<Record<EyeColor, string>> = {
  BLK: "#1c1512",
  BLU: "#3f6f9f",
  BRO: "#3b2a20",
  DIC: "#4a5a3a",
  GRN: "#4d7a49",
  GRY: "#6e7a84",
  HAZ: "#7a5a32",
  MAR: "#5a2e1e",
  PNK: "#a86a6a",
};

export function face(appearance: Appearance): string {
  const skin = appearance.skinTone;
  const feature = shade(appearance.hairColor, 0.1);
  const eyes = [340, 460]
    .map((x) =>
      [
        el("ellipse", { cx: x, cy: 438, rx: 22, ry: 11, fill: "#f7f3ee" }),
        el("circle", { cx: x, cy: 438, r: 10, fill: IRIS[appearance.eyes] }),
        el("circle", {
          cx: x + 3,
          cy: 435,
          r: 3,
          fill: "#ffffff",
          opacity: 0.8,
        }),
      ].join(""),
    )
    .join("");
  const brows = el("path", {
    d: "M312 404Q340 390 370 402M430 402Q460 390 488 404",
    fill: "none",
    stroke: feature,
    "stroke-width": 9,
    "stroke-linecap": "round",
  });
  const nose = el("path", {
    d: "M402 450Q392 500 384 516Q400 528 418 516",
    fill: "none",
    stroke: shade(skin, -0.22),
    "stroke-width": 6,
    "stroke-linecap": "round",
  });
  return eyes + brows + nose;
}

export function mouth(appearance: Appearance): string {
  return el("path", {
    d: "M356 568Q400 594 444 568",
    fill: "none",
    stroke: shade(appearance.skinTone, -0.38),
    "stroke-width": 9,
    "stroke-linecap": "round",
  });
}

export function facialHair(appearance: Appearance): string {
  if (!appearance.facialHair) {
    return "";
  }
  const mustache = "M342 552Q400 526 458 552Q452 560 400 548Q348 560 342 552Z";
  const beard =
    "M268 470C270 600 330 654 400 656C470 654 530 600 532 470C522 540 492 584 462 590Q400 606 338 590C308 584 278 540 268 470Z";
  const d =
    appearance.facialHair === "mustache" ? mustache : `${beard}${mustache}`;
  return el("path", {
    d,
    fill: appearance.hairColor,
    opacity: appearance.facialHair === "stubble" ? 0.32 : 1,
  });
}

export function glasses(appearance: Appearance): string {
  if (!appearance.glasses) {
    return "";
  }
  const frame = shade(appearance.hairColor, -0.2);
  return el(
    "g",
    { fill: "none", stroke: frame, "stroke-width": 7 },
    [
      el("rect", { x: 292, y: 410, width: 96, height: 62, rx: 16 }),
      el("rect", { x: 412, y: 410, width: 96, height: 62, rx: 16 }),
      el("path", {
        d: "M388 432Q400 424 412 432M292 430L262 422M508 430L538 422",
      }),
    ].join(""),
  );
}
