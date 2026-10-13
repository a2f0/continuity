import type { Appearance, HairStyle } from "../canon/types";
import { el } from "./svg";

// A flat illustrated bust drawn from canon appearance. It stands in for a
// character's photo until `bun run portraits` generates one, so documents
// still carry a face with the right skin tone, hair, and glasses.

const WIDTH = 800;
const HEIGHT = 1000;
const HEAD = { cx: 400, cy: 420, rx: 138, ry: 176 } as const;

/** Mix a #rrggbb color toward black (negative) or white (positive). */
function shade(hex: string, amount: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map(
    (channel) => {
      const target = amount < 0 ? 0 : 255;
      return Math.round(channel + (target - channel) * Math.abs(amount));
    },
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function backHair(style: HairStyle, color: string): string {
  switch (style) {
    case "long":
      return el("path", {
        d: "M248 380C236 520 250 690 230 800C320 830 480 830 570 800C550 690 564 520 552 380C540 240 260 240 248 380Z",
        fill: color,
      });
    case "bob":
      return el("path", {
        d: "M246 390C238 480 244 560 262 620C330 650 470 650 538 620C556 560 562 480 554 390C540 250 260 250 246 390Z",
        fill: color,
      });
    case "curly":
      return el("ellipse", { cx: 400, cy: 380, rx: 230, ry: 240, fill: color });
    case "bun":
      return el("circle", { cx: 400, cy: 222, r: 70, fill: color });
    default:
      return "";
  }
}

function frontHair(style: HairStyle, color: string): string {
  const cap =
    "M262 400C250 270 320 214 400 214C480 214 550 270 538 400C520 330 470 300 400 298C330 300 280 330 262 400Z";
  switch (style) {
    case "bald":
      return "";
    case "buzz":
    case "fade":
      return el("path", {
        d: "M266 372C262 282 328 242 400 242C472 242 538 282 534 372C518 318 468 292 400 290C332 292 282 318 266 372Z",
        fill: color,
      });
    case "twists": {
      const twists: string[] = [];
      for (let row = 0; row < 3; row += 1) {
        for (let index = 0; index < 9; index += 1) {
          const x = 290 + index * 27.5 + (row % 2) * 13;
          const y = 248 + row * 26 + Math.abs(index - 4) * 6;
          twists.push(el("circle", { cx: x, cy: y, r: 20, fill: color }));
        }
      }
      return el("path", { d: cap, fill: color }) + twists.join("");
    }
    case "long":
    case "bob":
      return el("path", {
        d: "M258 410C246 268 318 206 400 206C482 206 554 268 542 410C520 320 450 286 360 300C310 310 276 350 258 410Z",
        fill: color,
      });
    default:
      return el("path", { d: cap, fill: color });
  }
}

function face(appearance: Appearance): string {
  const skin = appearance.skinTone;
  const feature = shade(appearance.hairColor, 0.1);
  const eyes = [340, 460]
    .map((x) =>
      [
        el("ellipse", { cx: x, cy: 438, rx: 22, ry: 11, fill: "#f7f3ee" }),
        el("circle", { cx: x, cy: 438, r: 10, fill: "#3b2a20" }),
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

function mouth(appearance: Appearance): string {
  return el("path", {
    d: "M356 568Q400 594 444 568",
    fill: "none",
    stroke: shade(appearance.skinTone, -0.38),
    "stroke-width": 9,
    "stroke-linecap": "round",
  });
}

function facialHair(appearance: Appearance): string {
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

function glasses(appearance: Appearance): string {
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
