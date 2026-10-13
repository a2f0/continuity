// Small helpers for building SVG markup as strings. Coordinates are rounded so
// output stays compact and byte-stable across platforms.

export function escapeXml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Round to three decimals and drop trailing zeros. */
export function num(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

type AttributeValue = number | string | undefined;

function attrs(values: Readonly<Record<string, AttributeValue>>): string {
  return Object.entries(values)
    .filter(
      (entry): entry is [string, number | string] => entry[1] !== undefined,
    )
    .map(([key, value]) =>
      typeof value === "number"
        ? `${key}="${num(value)}"`
        : `${key}="${escapeXml(value)}"`,
    )
    .join(" ");
}

export function el(
  name: string,
  values: Readonly<Record<string, AttributeValue>>,
  children?: string,
): string {
  const attributeText = attrs(values);
  const open = attributeText ? `<${name} ${attributeText}` : `<${name}`;
  return children === undefined ? `${open}/>` : `${open}>${children}</${name}>`;
}

export interface TextStyle {
  readonly family: string;
  readonly size: number;
  readonly weight?: number;
  readonly fill: string;
  readonly anchor?: "end" | "middle" | "start";
  readonly letterSpacing?: number;
  readonly opacity?: number;
}

export function text(
  x: number,
  y: number,
  content: string,
  style: TextStyle,
  extra: Readonly<Record<string, AttributeValue>> = {},
): string {
  return el(
    "text",
    {
      x,
      y,
      "font-family": style.family,
      "font-size": style.size,
      "font-weight": style.weight,
      fill: style.fill,
      "text-anchor": style.anchor,
      "letter-spacing": style.letterSpacing,
      opacity: style.opacity,
      ...extra,
    },
    escapeXml(content),
  );
}

/**
 * Shrink a font size until the text's estimated width fits. `em` is the
 * typical advance of one character as a fraction of the font size.
 */
export function fitSize(
  content: string,
  maxWidth: number,
  size: number,
  em: number,
  letterSpacing = 0,
): number {
  const width = content.length * (size * em + letterSpacing);
  return width <= maxWidth ? size : size * (maxWidth / width);
}

export function dataUri(mimeType: string, bytes: Uint8Array): string {
  return `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`;
}

/** Wrap a document body in an SVG root sized in millimeters. */
export function svgDocument(
  width: number,
  height: number,
  body: string,
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${num(width)}mm" height="${num(height)}mm" viewBox="0 0 ${num(width)} ${num(height)}">${body}</svg>`;
}

export function upper(value: string): string {
  return value.toLocaleUpperCase("en-US");
}
