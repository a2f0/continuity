import {
  AVATAR_FRAMING,
  cropAroundFace,
  type Framing,
  ID_PHOTO_FRAMING,
  type Portrait,
  portraitImage,
} from "../render/portrait";
import { rasterize } from "../render/raster";
import { dataUri, el } from "../render/svg";

// A contact sheet for checking a portrait's framing: the source image under a
// grid in tenths, with the recorded face and the crops drawn on it, beside the
// ID photo and avatar that documents cut from it. Tune the sidecar's framing
// until the oval sits crown to chin and the crops read as real ID photos.

const HEIGHT = 720;
const GAP = 24;
const ID_WIDTH = HEIGHT * ID_PHOTO_FRAMING.aspect;
const AVATAR_SIZE = 360;

function cropOutline(
  portrait: Portrait,
  framing: Framing,
  color: string,
  stroke: number,
): string {
  const crop = cropAroundFace(portrait, framing);
  return el("rect", {
    ...crop,
    fill: "none",
    stroke: color,
    "stroke-width": stroke,
    "stroke-dasharray": `${stroke * 6} ${stroke * 4}`,
  });
}

function annotatedSource(portrait: Portrait, width: number): string {
  const { face, height } = portrait;
  // Draw in source pixels; this many source pixels make one sheet pixel.
  const unit = height / HEIGHT;
  const lines: string[] = [];
  const labels: string[] = [];
  for (let tenth = 1; tenth < 10; tenth += 1) {
    const x = (portrait.width * tenth) / 10;
    const y = (height * tenth) / 10;
    lines.push(`M${x} 0V${height}M0 ${y}H${portrait.width}`);
    labels.push(
      el("text", { x: x + 4 * unit, y: 16 * unit }, `0.${tenth}`),
      el("text", { x: 4 * unit, y: y - 4 * unit }, `0.${tenth}`),
    );
  }
  return el(
    "svg",
    {
      height: HEIGHT,
      viewBox: `0 0 ${portrait.width} ${height}`,
      width,
      x: 0,
      y: 0,
    },
    [
      el("image", {
        height,
        href: dataUri(portrait.mimeType, portrait.bytes),
        width: portrait.width,
      }),
      el("path", {
        d: lines.join(""),
        opacity: 0.6,
        stroke: "#ffffff",
        "stroke-width": unit,
      }),
      el(
        "g",
        { fill: "#ffffff", "font-size": 13 * unit, opacity: 0.85 },
        labels.join(""),
      ),
      cropOutline(portrait, ID_PHOTO_FRAMING, "#2f7de1", 2 * unit),
      cropOutline(portrait, AVATAR_FRAMING, "#2fa84f", 2 * unit),
      el("ellipse", {
        cx: face.cx,
        cy: face.cy,
        fill: "none",
        rx: face.height * 0.37,
        ry: face.height / 2,
        stroke: "#e5312f",
        "stroke-width": 3 * unit,
      }),
      el("path", {
        d: `M${face.cx - 12 * unit} ${face.cy}h${24 * unit}M${face.cx} ${face.cy - 12 * unit}v${24 * unit}`,
        stroke: "#e5312f",
        "stroke-width": 2 * unit,
      }),
    ].join(""),
  );
}

/** A PNG contact sheet of the portrait's framing and the crops cut from it. */
export function framingPreview(portrait: Portrait): Uint8Array {
  const sourceWidth = (HEIGHT * portrait.width) / portrait.height;
  const idX = sourceWidth + GAP;
  const avatarX = idX + ID_WIDTH + GAP;
  const width = Math.round(avatarX + AVATAR_SIZE);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${HEIGHT}" viewBox="0 0 ${width} ${HEIGHT}">${[
    el("rect", { fill: "#2b2f33", height: HEIGHT, width }),
    annotatedSource(portrait, sourceWidth),
    portraitImage(
      portrait,
      { height: HEIGHT, width: ID_WIDTH, x: idX, y: 0 },
      ID_PHOTO_FRAMING,
    ),
    portraitImage(
      portrait,
      { height: AVATAR_SIZE, width: AVATAR_SIZE, x: avatarX, y: 0 },
      AVATAR_FRAMING,
    ),
  ].join("")}</svg>`;
  return rasterize(svg, width).png;
}
