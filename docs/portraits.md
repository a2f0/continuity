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
passport-photo direction (head and shoulders, facing the camera, even light,
plain gray-blue backdrop). Keep ages out of descriptions; the age band covers
it and keeps the prompt current as the story date moves.

## Generating

```sh
export OPENAI_API_KEY=...
bun run portraits generate            # every placeholder
bun run portraits generate maya-reyes # one character
bun run portraits generate --stale    # placeholders and stale portraits
bun run portraits generate theo-reyes --force
bun run genesis
```

The default model is `gpt-image-2` at 1024x1536; override it with
`CONTINUITY_IMAGE_MODEL`. Review each image before committing it: it becomes
part of every document that character holds.

## Importing

To make a portrait elsewhere, for example in ChatGPT, print the prompt, make
the image, and adopt it:

```sh
bun run portraits prompt rosa-reyes
bun run portraits import rosa-reyes ~/Downloads/rosa.png --model chatgpt
bun run genesis
```

Use a real-looking person who does not exist. Never import a photo of a real
person.

## Sidecars and framing

`assets/portraits/<id>.json` records the model, prompt and its hash, the
image's hash, and the date it was made. It may also carry hand-tuned framing,
as fractions of the image size, for a face that is off center:

```json
{
  "framing": { "cx": 0.5, "cy": 0.34, "height": 0.36 }
}
```

`cx` and `cy` locate the face's center and `height` is chin to crown.
Regenerating keeps existing framing, so check it against the new image.
