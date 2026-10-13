import { toSVG } from "bwip-js/generic";
import { el, num } from "./svg";

// Barcodes rendered as vector paths and nested into card SVGs.

interface BarcodeBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly color: string;
}

function nest(svg: string, box: BarcodeBox): string {
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1];
  const inner = svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  if (!viewBox) {
    throw new Error("Barcode SVG has no viewBox");
  }
  const colored = inner.replaceAll("#000000", box.color);
  return `<svg x="${num(box.x)}" y="${num(box.y)}" width="${num(box.width)}" height="${num(box.height)}" viewBox="${viewBox}" preserveAspectRatio="none" fill="${box.color}">${colored}</svg>`;
}

/**
 * A PDF417 symbol. Callers pass a plain-text payload: card backs here never
 * encode the AAMVA data format, so no scanner reads them as a license.
 */
export function pdf417(payload: string, box: BarcodeBox): string {
  // Symbology options pass through to BWIPP; bwip-js does not type them.
  const options: Parameters<typeof toSVG>[0] & {
    readonly columns: number;
    readonly eclevel: number;
    readonly rowmult: number;
  } = { bcid: "pdf417", columns: 12, eclevel: 5, rowmult: 2, text: payload };
  return nest(toSVG(options), box);
}

export function code128(payload: string, box: BarcodeBox): string {
  const svg = toSVG({ bcid: "code128", height: 8, text: payload });
  return nest(svg, box);
}

export function quietZone(
  box: Omit<BarcodeBox, "color">,
  fill: string,
): string {
  return el("rect", { ...box, rx: 0.6, fill });
}
