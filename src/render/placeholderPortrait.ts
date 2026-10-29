import type { Appearance } from "../canon/types";
import { face, facialHair, glasses, mouth } from "./placeholderFace";
import { backHair, frontHair } from "./placeholderHair";
import { shade } from "./shade";
import { el } from "./svg";

// A flat illustrated bust drawn from canon appearance. It stands in for a
// character's photo until `bun run portraits` generates one, so documents
// still carry a face with the right skin tone, hair, and glasses.

const WIDTH = 800;
const HEIGHT = 1000;
const HEAD = { cx: 400, cy: 420, rx: 138, ry: 176 } as const;

export function placeholderPortraitSvg(appearance: Appearance): string {
  const skin = appearance.skinTone;
  const shadow = shade(skin, -0.18);
  const body = [
    el(
      "defs",
      {},
      [
        el(
          "linearGradient",
          { id: "backdrop", x1: 0, y1: 0, x2: 0, y2: 1 },
          el("stop", { offset: 0, "stop-color": "#e4eaef" }) +
            el("stop", { offset: 1, "stop-color": "#c3ced8" }),
        ),
        el(
          "radialGradient",
          { id: "faceLight", cx: 0.42, cy: 0.38, r: 0.7 },
          el("stop", {
            offset: 0,
            "stop-color": "#ffffff",
            "stop-opacity": 0.22,
          }) +
            el("stop", {
              offset: 1,
              "stop-color": "#000000",
              "stop-opacity": 0.12,
            }),
        ),
      ].join(""),
    ),
    el("rect", { width: WIDTH, height: HEIGHT, fill: "url(#backdrop)" }),
    backHair(appearance.hairStyle, appearance.hairColor),
    el("path", {
      d: "M120 1000C130 860 220 780 330 760L400 800L470 760C580 780 670 860 680 1000Z",
      fill: appearance.clothing,
    }),
    el("path", {
      d: "M340 640L340 780Q400 830 460 780L460 640Z",
      fill: shadow,
    }),
    el("path", {
      d: "M330 760L400 860L470 760L452 752L400 812L348 752Z",
      fill: shade(appearance.clothing, -0.25),
    }),
    el("ellipse", { cx: 262, cy: 452, rx: 26, ry: 42, fill: shadow }),
    el("ellipse", { cx: 538, cy: 452, rx: 26, ry: 42, fill: shadow }),
    el("ellipse", { ...HEAD, fill: skin }),
    el("ellipse", { ...HEAD, fill: "url(#faceLight)" }),
    face(appearance),
    facialHair(appearance),
    mouth(appearance),
    frontHair(appearance.hairStyle, appearance.hairColor),
    glasses(appearance),
  ].join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">${body}</svg>`;
}
