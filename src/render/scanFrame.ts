import type { CardArt } from "./card";
import { el, num, svgDocument } from "./svg";

// Presents a document the way a phone scan or flatbed capture does: slightly
// rotated on a dark surface, with a soft shadow and a little glare. This is
// the difference between a template and something that looks photographed.

export interface FrameSize {
  readonly width: number;
  readonly height: number;
  readonly radius: number;
}

export interface FrameOptions {
  /** The clip path the art already defines for its own outline. */
  readonly clipId: string;
  readonly margin: number;
  readonly rotation: number;
  readonly glareAngle: number;
}

function frameDefs(options: FrameOptions): string {
  return [
    el(
      "radialGradient",
      { id: "frame-surface", cx: 0.45, cy: 0.4, r: 0.85 },
      el("stop", { offset: 0, "stop-color": "#4a5058" }) +
        el("stop", { offset: 1, "stop-color": "#1f2327" }),
    ),
    el(
      "filter",
      { id: "frame-shadow", x: -0.2, y: -0.2, width: 1.4, height: 1.4 },
      el("feGaussianBlur", { stdDeviation: 1.1 }),
    ),
    el(
      "filter",
      { id: "frame-grain", x: 0, y: 0, width: 1, height: 1 },
      el("feTurbulence", {
        type: "fractalNoise",
        baseFrequency: 0.9,
        numOctaves: 3,
        seed: 5,
      }) + el("feColorMatrix", { type: "saturate", values: 0 }),
    ),
    el(
      "linearGradient",
      {
        id: "frame-glare",
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 1,
        gradientTransform: `rotate(${num(options.glareAngle)} 0.5 0.5)`,
      },
      [
        el("stop", { offset: 0.2, "stop-color": "#ffffff", "stop-opacity": 0 }),
        el("stop", {
          offset: 0.42,
          "stop-color": "#ffffff",
          "stop-opacity": 0.13,
        }),
        el("stop", {
          offset: 0.5,
          "stop-color": "#ffffff",
          "stop-opacity": 0.04,
        }),
        el("stop", {
          offset: 0.75,
          "stop-color": "#ffffff",
          "stop-opacity": 0,
        }),
      ].join(""),
    ),
  ].join("");
}

export function framedDocumentSvg(
  art: CardArt,
  size: FrameSize,
  options: FrameOptions,
): string {
  const width = size.width + options.margin * 2;
  const height = size.height + options.margin * 2;
  const cx = size.width / 2;
  const cy = size.height / 2;
  const placement = `translate(${num(options.margin)} ${num(options.margin)}) rotate(${num(options.rotation)} ${num(cx)} ${num(cy)})`;
  const outline = { width: size.width, height: size.height, rx: size.radius };
  const body = [
    el("defs", {}, art.defs + frameDefs(options)),
    el("rect", { width, height, fill: "url(#frame-surface)" }),
    el("rect", { width, height, filter: "url(#frame-grain)", opacity: 0.07 }),
    el(
      "g",
      { transform: `${placement} translate(0.35 0.9)` },
      el("rect", {
        ...outline,
        fill: "#000000",
        opacity: 0.6,
        filter: "url(#frame-shadow)",
      }),
    ),
    el(
      "g",
      { transform: placement },
      [
        art.body,
        el("rect", {
          ...outline,
          fill: "url(#frame-glare)",
          "clip-path": `url(#${options.clipId})`,
        }),
        el("rect", {
          ...outline,
          fill: "none",
          stroke: "#ffffff",
          "stroke-opacity": 0.35,
          "stroke-width": 0.12,
        }),
      ].join(""),
    ),
  ].join("");
  return svgDocument(width, height, body);
}
