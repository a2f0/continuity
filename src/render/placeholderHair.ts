import type { HairStyle } from "../canon/types";
import { el } from "./svg";

// Hair layers for the placeholder bust: back hair sits behind the head and
// front hair over the forehead.

export function backHair(style: HairStyle, color: string): string {
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

export function frontHair(style: HairStyle, color: string): string {
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
