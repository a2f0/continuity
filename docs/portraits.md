# Portraits

Each character has one canonical portrait. The license photo, its ghost image,
the passport photo, and the contact avatar are all cut from it, which is what
keeps a face consistent across every artifact.

## Status

`bun run portraits` prints each character's status:

| Status | Meaning |
| --- | --- |
| `placeholder` | No photo yet; documents use an illustration drawn from canon |
| `current` | The photo was made from the prompt canon derives today |
| `stale` | Canon's description or age band changed since the photo was made |
| `edited` | The image no longer matches the hash its sidecar recorded |
| `unrecorded` | A photo with no sidecar |

`bun run canon:check` reports every portrait that is not `current`. None of
these fail CI: a placeholder renders correctly, just less realistically.

## Prompts

`src/portraits/prompt.ts` builds the prompt from canon: an age band from the
birth date and story date, `appearance.description`, glasses, and fixed
direction for an unretouched passport photo (a vertical 2:3 head and
shoulders shot facing the camera, even studio light, a plain gray-blue
backdrop, real skin and hair texture, and explicitly not an illustration,
render, or airbrushed image). Keep ages out of descriptions; the age band
covers it and keeps the prompt current as the story date moves.

## Generating

The `portrait-fidelity` skill, in `.agents/skills` for Codex and
`.claude/skills` for Claude Code, is the full procedure: generate, review
against canon, import, frame, and re-render. It picks the first available
route:

- With `OPENAI_API_KEY`, `bun run portraits generate` calls the Images API.
- In Codex, the built-in `image_gen` tool makes the image with no API key.
- Claude Code delegates that tool call to `codex exec`.

```sh
export OPENAI_API_KEY=...
bun run portraits generate            # every placeholder
bun run portraits generate maya-reyes # one character
bun run portraits generate --stale    # placeholders and stale portraits
bun run portraits generate theo-reyes --force
bun run genesis
```

The API's default model is `gpt-image-2` at 1024x1536; override it with
`CONTINUITY_IMAGE_MODEL`. Review each image before committing it: it becomes
part of every document that character holds.

## Importing

To adopt an image made elsewhere, such as by Codex or in ChatGPT, print the
prompt, make the image, and import it:

```sh
bun run portraits prompt rosa-reyes
bun run portraits import rosa-reyes ~/Downloads/rosa.png --model chatgpt
bun run genesis
```

Portraits are stored as JPEG: generating or importing one transcodes a PNG and
scales the long edge down to 1536 px, which keeps a portrait near 400 KB.

Use a real-looking person who does not exist. Never import a photo of a real
person.

## Sidecars and framing

`assets/portraits/<id>.json` records the model, prompt and its hash, the
image's hash, and the date it was made. It also carries hand-tuned framing,
as fractions of the image size:

```json
{
  "framing": { "cx": 0.5, "cy": 0.38, "height": 0.47 }
}
```

`height` runs from the chin to the top of the hair, and `cx` and `cy` locate
its center. Without framing, documents assume a typical generated portrait
(`DEFAULT_PHOTO_FRAMING` in `src/render/portrait.ts`), which rarely fits
exactly, so frame every new portrait.
`bun run portraits preview [<id>...]` writes a contact sheet per character:
the source under a grid in tenths with the recorded face and crops drawn on
it, beside the ID photo and avatar documents cut from it. Regenerating keeps
existing framing, so check it against the new image.

## Household photo dependencies

Family photos in `assets/household/` record hashes of the portraits used as
references. After replacing a portrait, `bun run genesis` stops with
`Stale portrait reference` for affected photos. Equipment detail photos may
likewise record `sourceReferences` to other household images.

1. Find affected sidecars by searching `assets/household/*.json` for the
   changed character or equipment photo ID.
2. Read each sidecar's `prompt`, then regenerate or edit its image using the
   updated portrait or equipment photo as a reference. Review the result
   against canon and the updated source; do not merely refresh old hashes.
3. Convert the accepted result with `portraitJpeg` from
   `src/portraits/jpeg.ts` and save `assets/household/<id>.jpg`. This limits
   the long edge to 1536 pixels. Keep both dimensions at least 512 pixels and
   the file below 3 MiB.
4. Record the exact final tool prompt, model, ISO `generatedOn` date,
   `imageSha256` of the saved JPEG, and `promptSha256` of its UTF-8 prompt.
   In `references`, map each canonical character ID to the SHA-256 of its
   current `assets/portraits/<id>.jpg`. For equipment references, use
   `sourceReferences` with household image IDs and JPEG hashes. For edits,
   retain the prior prompt, model, and image hash in `previousGeneration`.
5. Run `bun run genesis` and `bun run check`. Commit source photos, sidecars,
   any canon edits, and the regenerated output together.

There is currently no household import CLI. The sidecar procedure above is
explicit so generation remains a reviewed source change, never a network
operation hidden inside `genesis`.
