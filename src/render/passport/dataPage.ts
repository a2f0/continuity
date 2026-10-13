import {
  type CardArt,
  grainFilter,
  grayscaleFilter,
  laminateGradient,
  paperGradient,
  specimenMark,
} from "../card";
import { el } from "../svg";
import { background, header, portraitBlocks } from "./artwork";
import { dataFields, machineReadableZone, signatureBlock } from "./fields";
import { DATA_PAGE, type PassportInput } from "./types";

export function passportDataPage(input: PassportInput): CardArt {
  const defs = [
    el(
      "clipPath",
      { id: "p-page" },
      el("rect", {
        width: DATA_PAGE.width,
        height: DATA_PAGE.height,
        rx: DATA_PAGE.radius,
      }),
    ),
    paperGradient("p-paper", input.issuer.palette),
    laminateGradient("p-laminate"),
    grayscaleFilter("p-gray"),
    grainFilter("p-grain", 31),
    el(
      "clipPath",
      { id: "p-photo-clip" },
      el("rect", { x: 6, y: 16.4, width: 32, height: 40, rx: 0.8 }),
    ),
    el(
      "clipPath",
      { id: "p-ghost-clip" },
      el("ellipse", { cx: 113.5, cy: 35.9, rx: 6, ry: 7.5 }),
    ),
    el(
      "clipPath",
      { id: "p-signature-clip" },
      el("rect", { x: 79, y: 58, width: 40, height: 8.6 }),
    ),
  ].join("");
  const body = el(
    "g",
    { "clip-path": "url(#p-page)" },
    [
      background(input),
      header(input),
      portraitBlocks(input),
      dataFields(input),
      signatureBlock(input),
      machineReadableZone(input),
      specimenMark(64, 42, 13),
      el("rect", {
        width: DATA_PAGE.width,
        height: DATA_PAGE.height,
        fill: "url(#p-laminate)",
      }),
    ].join(""),
  );
  return { body, defs };
}
