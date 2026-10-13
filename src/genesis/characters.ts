import type { World } from "../canon/types";
import { renderAvatar } from "../render/avatar";
import { loadPortrait, type Portrait } from "../render/portrait";
import { toJpeg } from "../render/raster";
import { type RenderedDocuments, renderDocuments } from "./documents";

export interface CharacterAssets {
  readonly files: { readonly avatar: string } & Readonly<
    Partial<Record<keyof RenderedDocuments, string>>
  >;
  readonly portrait: Portrait["source"];
}

export function renderCharacters(world: World, files: Map<string, Uint8Array>) {
  const characterAssets = new Map<string, CharacterAssets>();
  const contactPhotos = new Map<string, Uint8Array>();
  for (const character of world.characters) {
    const portrait = loadPortrait(character);
    const avatar = `avatars/${character.id}.png`;
    files.set(avatar, renderAvatar(portrait).png);
    contactPhotos.set(character.id, toJpeg(renderAvatar(portrait, 256), 85));
    const documents = renderDocuments(world, character, portrait);
    const entry: Partial<Record<keyof RenderedDocuments, string>> = {};
    for (const [key, bytes, name] of [
      [
        "driversLicenseFront",
        documents.driversLicenseFront,
        "drivers-license-front.jpg",
      ],
      [
        "driversLicenseBack",
        documents.driversLicenseBack,
        "drivers-license-back.jpg",
      ],
      ["passport", documents.passport, "passport.jpg"],
    ] as const) {
      if (bytes) {
        const path = `documents/${character.id}/${name}`;
        files.set(path, bytes);
        entry[key] = path;
      }
    }
    characterAssets.set(character.id, {
      files: { avatar, ...entry },
      portrait: portrait.source,
    });
  }
  return { characterAssets, contactPhotos };
}
