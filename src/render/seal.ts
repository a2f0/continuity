import { FONT } from "./fonts";
import { el, escapeXml, num } from "./svg";

// An issuing authority's seal: a lettered ring around a pictorial motif. Drawn
// from primitives so each fictional issuer gets an original emblem.

export type SealMotif = "forest" | "sun";

export interface SealOptions {
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
  readonly topText: string;
  readonly bottomText: string;
  readonly motif: SealMotif;
  readonly color: string;
  readonly opacity: number;
}

// Approximate advances (in em) for IBM Plex Sans Condensed SemiBold capitals.
// Glyphs are placed one by one rather than with <textPath>, whose spacing is
// uneven in resvg at seal sizes.
const NARROW = new Set(["I", "J", "1", ".", ",", "'"]);
const WIDE = new Set(["M", "W"]);
const ROUND = new Set(["C", "D", "G", "O", "Q"]);

function advance(character: string): number {
  if (character === " ") {
    return 0.26;
  }
  if (NARROW.has(character)) {
    return 0.27;
  }
  if (WIDE.has(character)) {
    return 0.7;
  }
  return ROUND.has(character) ? 0.58 : 0.52;
}

interface ArcText {
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
  readonly size: number;
  readonly side: "bottom" | "top";
  readonly content: string;
}

/** Letters centered on the top arc (reading clockwise) or bottom arc (upright). */
function arcText(options: ArcText): string {
  const { cx, cy, radius, size, side } = options;
  const characters = [...options.content];
  const tracking = size * 0.08;
  const widths = characters.map(
    (character) => advance(character) * size + tracking,
  );
  const total = widths.reduce((sum, width) => sum + width, 0);
  let cursor = -total / 2;
  return characters
    .map((character, index) => {
      const width = widths[index] ?? 0;
      const offset = (cursor + width / 2) / radius;
      cursor += width;
      // Clockwise over the top, counterclockwise along the bottom, so both
      // read left to right.
      const theta =
        side === "top" ? offset - Math.PI / 2 : Math.PI / 2 - offset;
      const x = cx + radius * Math.cos(theta);
      const y = cy + radius * Math.sin(theta);
      const rotation = ((side === "top" ? offset : -offset) * 180) / Math.PI;
      return el(
        "text",
        {
          x,
          y,
          "text-anchor": "middle",
          transform: `rotate(${num(rotation)} ${num(x)} ${num(y)})`,
        },
        escapeXml(character),
      );
    })
    .join("");
}

function tree(x: number, base: number, height: number): string {
  const w = height * 0.42;
  const tiers = [0, 0.3, 0.55].map((offset, index) => {
    const top = base - height + height * offset;
    const bottom = top + height * (0.5 - index * 0.06);
    const half = w * (1 - index * 0.22);
    return `M${num(x)} ${num(top)}L${num(x + half / 2)} ${num(bottom)}L${num(x - half / 2)} ${num(bottom)}Z`;
  });
  const trunk = `M${num(x - w * 0.06)} ${num(base - height * 0.06)}h${num(w * 0.12)}v${num(height * 0.08)}h${num(-w * 0.12)}Z`;
  return tiers.join("") + trunk;
}

function forestMotif(cx: number, cy: number, r: number): string {
  const mountain = `M${num(cx - r * 0.62)} ${num(cy + r * 0.28)}L${num(cx - r * 0.1)} ${num(cy - r * 0.42)}L${num(cx + r * 0.12)} ${num(cy - r * 0.14)}L${num(cx + r * 0.28)} ${num(cy - r * 0.3)}L${num(cx + r * 0.66)} ${num(cy + r * 0.28)}Z`;
  const snow = `M${num(cx - r * 0.23)} ${num(cy - r * 0.24)}L${num(cx - r * 0.1)} ${num(cy - r * 0.42)}L${num(cx + r * 0.02)} ${num(cy - r * 0.26)}L${num(cx - r * 0.06)} ${num(cy - r * 0.29)}L${num(cx - r * 0.12)} ${num(cy - r * 0.22)}Z`;
  const trees = [
    tree(cx - r * 0.42, cy + r * 0.34, r * 0.46),
    tree(cx - r * 0.24, cy + r * 0.36, r * 0.58),
    tree(cx + r * 0.38, cy + r * 0.35, r * 0.5),
  ].join("");
  const waves = [0.46, 0.58]
    .map((dy) => {
      const y = cy + r * dy;
      let d = `M${num(cx - r * 0.6)} ${num(y)}`;
      for (let index = 0; index < 6; index += 1) {
        d += `q${num(r * 0.05)} ${num(-r * 0.06)} ${num(r * 0.1)} 0t${num(r * 0.1)} 0`;
      }
      return d;
    })
    .join("");
  const star = `M${num(cx + r * 0.36)} ${num(cy - r * 0.58)}l${num(r * 0.035)} ${num(r * 0.075)}l${num(r * 0.08)} ${num(r * 0.01)}l${num(-r * 0.06)} ${num(r * 0.055)}l${num(r * 0.02)} ${num(r * 0.08)}l${num(-r * 0.075)} ${num(-r * 0.04)}l${num(-r * 0.075)} ${num(r * 0.04)}l${num(r * 0.02)} ${num(-r * 0.08)}l${num(-r * 0.06)} ${num(-r * 0.055)}l${num(r * 0.08)} ${num(-r * 0.01)}Z`;
  return [
    el("path", { d: mountain, "fill-opacity": 0.55 }),
    el("path", { d: snow, fill: "#ffffff", "fill-opacity": 0.6 }),
    el("path", { d: trees }),
    el("path", {
      d: waves,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": r * 0.035,
    }),
    el("path", { d: star }),
  ].join("");
}

function sunMotif(cx: number, cy: number, r: number): string {
  const rays: string[] = [];
  for (let index = 0; index < 24; index += 1) {
    const angle = (index / 24) * Math.PI * 2;
    const inner = r * 0.3;
    const outer = r * (index % 2 === 0 ? 0.62 : 0.5);
    const spread = Math.PI / 48;
    rays.push(
      `M${num(cx + inner * Math.cos(angle - spread))} ${num(cy + inner * Math.sin(angle - spread))}L${num(cx + outer * Math.cos(angle))} ${num(cy + outer * Math.sin(angle))}L${num(cx + inner * Math.cos(angle + spread))} ${num(cy + inner * Math.sin(angle + spread))}Z`,
    );
  }
  return [
    el("path", { d: rays.join("") }),
    el("circle", { cx, cy, r: r * 0.26 }),
    el("circle", {
      cx,
      cy,
      r: r * 0.18,
      fill: "#ffffff",
      "fill-opacity": 0.35,
    }),
  ].join("");
}

export function seal(options: SealOptions): string {
  const { cx, cy, radius: r, color } = options;
  const size = r * 0.16;
  const letters = el(
    "g",
    { "font-family": FONT.sans, "font-size": size, "font-weight": 600 },
    arcText({
      cx,
      cy,
      radius: r * 0.79,
      size,
      side: "top",
      content: options.topText,
    }) +
      // Bottom glyphs hang inward from their baseline; push it out to match.
      arcText({
        cx,
        cy,
        radius: r * 0.91,
        size,
        side: "bottom",
        content: options.bottomText,
      }),
  );
  const ring = [
    el("circle", {
      cx,
      cy,
      r,
      fill: "none",
      stroke: color,
      "stroke-width": r * 0.05,
    }),
    el("circle", {
      cx,
      cy,
      r: r * 0.68,
      fill: "none",
      stroke: color,
      "stroke-width": r * 0.025,
    }),
    letters,
    el("circle", { cx: cx - r * 0.84, cy, r: r * 0.035 }),
    el("circle", { cx: cx + r * 0.84, cy, r: r * 0.035 }),
  ].join("");
  const motif =
    options.motif === "forest"
      ? forestMotif(cx, cy, r * 0.62)
      : sunMotif(cx, cy, r * 0.62);
  return el(
    "g",
    { opacity: options.opacity, fill: color, color },
    ring + motif,
  );
}
