import { existsSync, readFileSync } from "node:fs";
import type { Character } from "../canon/types";
import { repoPath } from "../paths";
import { imageSize } from "./imageSize";
import { placeholderPortraitSvg } from "./placeholderPortrait";
import { rasterize } from "./raster";
import { dataUri, el, num } from "./svg";

// A character's canonical face. Every document and avatar is cut from this one
// image, which is what keeps a character recognizable across artifacts.

/** Where the face sits in the source image, in source pixels. */
export interface FaceBox {
  readonly cx: number;
  readonly cy: number;
  /** Chin to crown. */
  readonly height: number;
}

export interface Portrait {
  readonly bytes: Uint8Array;
  readonly mimeType: "image/jpeg" | "image/png";
  readonly width: number;
  readonly height: number;
  readonly face: FaceBox;
  readonly source: "photo" | "placeholder";
}

/** Framing a portrait sidecar may record, as fractions of the image size. */
export interface PortraitFraming {
  readonly cx: number;
  readonly cy: number;
  readonly height: number;
}

// A typical generated 2:3 head-and-shoulders portrait, absent a recorded
// framing; head size varies by about a fifth either way, so frame each one.
const DEFAULT_PHOTO_FRAMING: PortraitFraming = {
  cx: 0.5,
  cy: 0.38,
  height: 0.5,
};
const PLACEHOLDER_FACE: FaceBox = { cx: 400, cy: 405, height: 400 };
const PORTRAIT_EXTENSIONS = ["jpg", "png"] as const;

export function portraitPath(characterId: string, extension = "jpg"): string {
  return repoPath("assets", "portraits", `${characterId}.${extension}`);
}

export function portraitSidecarPath(characterId: string): string {
  return repoPath("assets", "portraits", `${characterId}.json`);
}

function readFraming(characterId: string): PortraitFraming {
  const path = portraitSidecarPath(characterId);
  if (!existsSync(path)) {
    return DEFAULT_PHOTO_FRAMING;
  }
  const sidecar = JSON.parse(readFileSync(path, "utf8")) as {
    readonly framing?: PortraitFraming;
  };
  return sidecar.framing ?? DEFAULT_PHOTO_FRAMING;
}

function readPhoto(characterId: string): Portrait | undefined {
  for (const extension of PORTRAIT_EXTENSIONS) {
    const path = portraitPath(characterId, extension);
    if (existsSync(path)) {
      const bytes = new Uint8Array(readFileSync(path));
      const size = imageSize(bytes);
      const framing = readFraming(characterId);
      return {
        bytes,
        ...size,
        face: {
          cx: framing.cx * size.width,
          cy: framing.cy * size.height,
          height: framing.height * size.height,
        },
        source: "photo",
      };
    }
  }
  return undefined;
}

export function loadPortrait(character: Character): Portrait {
  return (
    readPhoto(character.id) ?? {
      bytes: rasterize(placeholderPortraitSvg(character.appearance), 800).png,
      face: PLACEHOLDER_FACE,
      height: 1000,
      mimeType: "image/png",
      source: "placeholder",
      width: 800,
    }
  );
}

export interface Crop {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface Framing {
  /** Width over height of the target box. */
  readonly aspect: number;
  /** Face height as a fraction of the crop height. */
  readonly faceFraction: number;
  /** Where the face center sits, as a fraction of the crop height. */
  readonly faceY: number;
}

export const ID_PHOTO_FRAMING: Framing = {
  aspect: 0.8,
  faceFraction: 0.56,
  faceY: 0.46,
};
export const AVATAR_FRAMING: Framing = {
  aspect: 1,
  faceFraction: 0.6,
  faceY: 0.47,
};

/** A crop around the face, shifted (and if need be shrunk) to stay inside the image. */
export function cropAroundFace(portrait: Portrait, framing: Framing): Crop {
  let height = portrait.face.height / framing.faceFraction;
  let width = height * framing.aspect;
  const scale = Math.min(1, portrait.width / width, portrait.height / height);
  height *= scale;
  width *= scale;
  const clamp = (value: number, max: number) =>
    Math.min(Math.max(value, 0), max);
  return {
    height,
    width,
    x: clamp(portrait.face.cx - width / 2, portrait.width - width),
    y: clamp(
      portrait.face.cy - height * framing.faceY,
      portrait.height - height,
    ),
  };
}

interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** The portrait cropped into a box, as a nested SVG viewport. */
export function portraitImage(
  portrait: Portrait,
  box: Box,
  framing: Framing,
): string {
  const crop = cropAroundFace(portrait, framing);
  return el(
    "svg",
    {
      ...box,
      viewBox: [crop.x, crop.y, crop.width, crop.height].map(num).join(" "),
      preserveAspectRatio: "xMidYMid slice",
    },
    el("image", {
      width: portrait.width,
      height: portrait.height,
      href: dataUri(portrait.mimeType, portrait.bytes),
    }),
  );
}
