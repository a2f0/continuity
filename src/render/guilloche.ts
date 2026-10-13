import { el, escapeXml, num } from "./svg";

// Guilloché: the fine interlaced line work printed on banknotes and identity
// documents. Every pattern is pure math, so it is deterministic and costs no
// binary assets.

function polyline(points: readonly (readonly [number, number])[]): string {
  return points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${num(x)} ${num(y)}`)
    .join("");
}

interface StrokeStyle {
  readonly stroke: string;
  readonly strokeWidth: number;
  readonly opacity: number;
}

function strokePath(d: string, style: StrokeStyle): string {
  return el("path", {
    d,
    fill: "none",
    stroke: style.stroke,
    "stroke-width": style.strokeWidth,
    opacity: style.opacity,
  });
}

export interface RosetteOptions extends StrokeStyle {
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
  /** Radial swing of each loop, as a fraction of the radius. */
  readonly depth: number;
  readonly petals: number;
  readonly strands: number;
  readonly samples?: number;
}

/**
 * A woven ring: strands r(t) = R(1 - d + d sin(k t + phase)) with phases spread
 * over a full turn, so neighboring strands cross and braid.
 */
export function rosette(options: RosetteOptions): string {
  const samples = options.samples ?? 720;
  const paths: string[] = [];
  for (let strand = 0; strand < options.strands; strand += 1) {
    const phase = (strand / options.strands) * Math.PI * 2;
    const points: [number, number][] = [];
    for (let index = 0; index <= samples; index += 1) {
      const t = (index / samples) * Math.PI * 2;
      const r =
        options.radius *
        (1 -
          options.depth +
          options.depth * Math.sin(options.petals * t + phase));
      points.push([options.cx + r * Math.cos(t), options.cy + r * Math.sin(t)]);
    }
    paths.push(polyline(points));
  }
  return strokePath(paths.join(""), options);
}

export interface SpirographOptions extends StrokeStyle {
  readonly cx: number;
  readonly cy: number;
  /** Fixed circle, rolling circle, and pen distance (hypotrochoid). */
  readonly fixed: number;
  readonly rolling: number;
  readonly pen: number;
  readonly turns: number;
  readonly samples?: number;
}

export function spirograph(options: SpirographOptions): string {
  const samples = options.samples ?? 4000;
  const { fixed, rolling, pen } = options;
  const points: [number, number][] = [];
  for (let index = 0; index <= samples; index += 1) {
    const t = (index / samples) * Math.PI * 2 * options.turns;
    const ratio = (fixed - rolling) / rolling;
    points.push([
      options.cx + (fixed - rolling) * Math.cos(t) + pen * Math.cos(ratio * t),
      options.cy + (fixed - rolling) * Math.sin(t) - pen * Math.sin(ratio * t),
    ]);
  }
  return strokePath(polyline(points), options);
}

export interface WaveFieldOptions extends StrokeStyle {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly lines: number;
  readonly amplitude: number;
  readonly wavelength: number;
  /** Phase advance between neighboring lines, in radians. */
  readonly phaseStep: number;
  /** A slower second wave that makes neighboring lines braid. */
  readonly modulation?: number;
}

export function waveField(options: WaveFieldOptions): string {
  const step = options.wavelength / 24;
  const paths: string[] = [];
  for (let line = 0; line < options.lines; line += 1) {
    const baseY =
      options.y + (options.height * line) / Math.max(1, options.lines - 1);
    const phase = line * options.phaseStep;
    const points: [number, number][] = [];
    for (let x = options.x; x <= options.x + options.width + step; x += step) {
      const primary = Math.sin(
        ((x - options.x) / options.wavelength) * Math.PI * 2 + phase,
      );
      const secondary = options.modulation
        ? Math.sin(
            ((x - options.x) / (options.wavelength * 3.7)) * Math.PI * 2 -
              phase / 2,
          ) * options.modulation
        : 0;
      points.push([x, baseY + options.amplitude * (primary + secondary)]);
    }
    paths.push(polyline(points));
  }
  return strokePath(paths.join(""), options);
}

/** A run of tiny repeated text: microprinting that blurs into a line. */
export function microtext(
  x: number,
  y: number,
  width: number,
  phrase: string,
  options: {
    readonly size: number;
    readonly fill: string;
    readonly family: string;
  },
): string {
  const approximateAdvance = options.size * 0.55;
  const repeats = Math.ceil(width / (phrase.length * approximateAdvance)) + 1;
  const content = phrase.repeat(repeats);
  return el(
    "text",
    {
      x,
      y,
      "font-family": options.family,
      "font-size": options.size,
      "font-weight": 500,
      fill: options.fill,
      textLength: width,
      lengthAdjust: "spacingAndGlyphs",
    },
    escapeXml(content.slice(0, Math.floor(width / approximateAdvance))),
  );
}
