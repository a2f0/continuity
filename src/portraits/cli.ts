import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";
import { world } from "../../canon/world";
import { findCharacter } from "../canon/derive";
import type { Character } from "../canon/types";
import {
  loadPortrait,
  portraitPath,
  portraitSidecarPath,
} from "../render/portrait";
import { portraitJpeg } from "./jpeg";
import { generateImage } from "./openai";
import { framingPreview } from "./preview";
import { portraitPrompt, promptDigest } from "./prompt";
import {
  type PortraitSidecar,
  portraitStatus,
  readSidecar,
  sha256,
} from "./sidecar";

// Maintain character portraits.
//
//   bun run portraits                   status of every portrait
//   bun run portraits prompt <id>       print the prompt canon derives
//   bun run portraits generate [<id>...] [--stale] [--force]
//                                       generate missing (and with --stale,
//                                       outdated) portraits; needs OPENAI_API_KEY
//   bun run portraits import <id> <file> [--model <name>]
//                                       adopt an image made elsewhere, e.g. by
//                                       Codex's image_gen tool or ChatGPT
//   bun run portraits preview [<id>...] [--out <dir>]
//                                       write framing contact sheets to check
//                                       the face box and the crops cut from it
//
// Then run `bun run genesis` to re-render every artifact from the new faces.
// The portrait-fidelity skill walks through generating and reviewing faces.

const MODEL = process.env.CONTINUITY_IMAGE_MODEL ?? "gpt-image-2";
const SIZE = "1024x1536";
const QUALITY = "high";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function save(
  character: Character,
  original: Uint8Array,
  sidecar: Omit<PortraitSidecar, "imageSha256">,
): void {
  const bytes = portraitJpeg(original);
  const path = portraitPath(character.id, "jpg");
  // Git does not track the empty directory, so a fresh clone lacks it.
  mkdirSync(dirname(path), { recursive: true });
  rmSync(portraitPath(character.id, "png"), { force: true });
  writeFileSync(path, bytes);
  const previous = readSidecar(character.id);
  const record: PortraitSidecar = {
    ...sidecar,
    imageSha256: sha256(bytes),
    // Hand-tuned framing survives regeneration only if the face moved little;
    // keep it, and re-tune after reviewing the new image.
    ...(previous?.framing ? { framing: previous.framing } : {}),
  };
  writeFileSync(
    portraitSidecarPath(character.id),
    `${JSON.stringify(record, null, 2)}\n`,
  );
  console.log(`Wrote ${path}`);
}

function preview(ids: readonly string[], out: string): void {
  const targets =
    ids.length > 0
      ? ids.map((id) => findCharacter(world, id))
      : world.characters;
  mkdirSync(out, { recursive: true });
  for (const character of targets) {
    const path = join(out, `${character.id}.png`);
    writeFileSync(path, framingPreview(loadPortrait(character)));
    console.log(`Wrote ${path}`);
  }
}

function status(): void {
  for (const character of world.characters) {
    console.log(
      `${portraitStatus(world, character).padEnd(12)} ${character.id}`,
    );
  }
}

async function generate(
  ids: readonly string[],
  options: { stale: boolean; force: boolean },
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Set OPENAI_API_KEY, or make the image elsewhere and use `bun run portraits import`.",
    );
  }
  const targets =
    ids.length > 0
      ? ids.map((id) => findCharacter(world, id))
      : world.characters;
  for (const character of targets) {
    const current = portraitStatus(world, character);
    const wanted =
      options.force ||
      current === "placeholder" ||
      (options.stale && current === "stale");
    if (!wanted) {
      console.log(`Skipping ${character.id} (${current})`);
      continue;
    }
    const prompt = portraitPrompt(world, character);
    console.log(`Generating ${character.id} with ${MODEL}...`);
    const bytes = await generateImage(
      { model: MODEL, prompt, quality: QUALITY, size: SIZE },
      apiKey,
    );
    save(character, bytes, {
      character: character.id,
      generatedOn: today(),
      model: MODEL,
      prompt,
      promptSha256: promptDigest(prompt),
      quality: QUALITY,
      size: SIZE,
    });
  }
}

function importImage(id: string, file: string, model: string): void {
  const character = findCharacter(world, id);
  const bytes = new Uint8Array(readFileSync(file));
  const prompt = portraitPrompt(world, character);
  save(character, bytes, {
    character: character.id,
    generatedOn: today(),
    model,
    prompt,
    promptSha256: promptDigest(prompt),
  });
}

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    force: { type: "boolean", default: false },
    model: { type: "string", default: "manual" },
    out: {
      type: "string",
      default: join(tmpdir(), "continuity-portrait-previews"),
    },
    stale: { type: "boolean", default: false },
  },
});
const [command = "status", ...rest] = positionals;

switch (command) {
  case "status":
    status();
    break;
  case "prompt":
    for (const id of rest) {
      console.log(portraitPrompt(world, findCharacter(world, id)));
    }
    break;
  case "generate":
    await generate(rest, { force: values.force, stale: values.stale });
    break;
  case "preview":
    preview(rest, values.out);
    break;
  case "import": {
    const [id, file] = rest;
    if (!id || !file) {
      throw new Error(
        "Usage: bun run portraits import <character-id> <image-file>",
      );
    }
    importImage(id, file, values.model);
    break;
  }
  default:
    throw new Error(`Unknown command: ${command}`);
}
