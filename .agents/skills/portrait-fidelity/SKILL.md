---
name: portrait-fidelity
description: Replace illustrated placeholder or low-fidelity character portraits with photorealistic photos of fictional people, review them against canon, tune their framing, and re-render genesis. Use when faces on genesis documents or avatars look cartoonish, illustrated, airbrushed, or off-canon, or when `bun run portraits` reports a portrait that is not current.
---

# Portrait fidelity

Every license photo, ghost image, passport photo, and contact avatar is cut
from one portrait per character in `assets/portraits/`. A character without
one gets the flat SVG illustration in `src/render/placeholderPortrait.ts`,
which reads as a cartoon. This skill replaces those faces with photographs of
people who do not exist and holds each one to canon. `docs/portraits.md`
documents the commands; this skill is the procedure and the review bar.

## Ground rules

- Fictional people only. Never import a photo of a real person, and never
  name or use a real person as a reference.
- Canon owns the face. Pass the prompt from `bun run portraits prompt <id>`
  verbatim. To change a face, edit the character's `appearance.description`
  in `canon/` (keep ages out of it); to change the direction every portrait
  shares, edit `src/portraits/prompt.ts`. Either marks portraits stale, so
  regenerate them in the same change.
- Never edit `genesis/` by hand. Commit `assets/portraits/`, any canon or
  prompt change, and the re-rendered `genesis/` together.
- Each new portrait adds about half a megabyte to history and changes every
  document its character holds. Replace a portrait only to fix a real
  problem.

## 1. Pick targets

Run `bun run portraits`. Target the characters the user named; otherwise every
portrait that is `placeholder`, `stale`, `edited`, or `unrecorded`, plus any
`current` portrait that fails the review in step 3.

## 2. Generate

Generate one image per target, using the first route available:

- **`OPENAI_API_KEY` is set:** `bun run portraits generate <id>... --force`
  calls the Images API with the canon prompt and imports the result, so skip
  step 4.
- **Codex:** call the built-in `image_gen` tool once per character with the
  prompt verbatim, then take the file from `$CODEX_HOME/generated_images/`.
  If the tool is unavailable, say so rather than switching to another path.
- **Claude Code, or any harness with the Codex CLI on `PATH`:** delegate the
  tool call to Codex, which needs no API key when signed in to ChatGPT. Each
  run takes about a minute, and several can run in parallel:

  ```sh
  id=maya-reyes
  out="$(mktemp -d)"
  prompt="$(bun run --silent portraits prompt "$id")"
  codex exec --skip-git-repo-check --sandbox workspace-write \
    -c model_reasoning_effort='"low"' -C "$out" \
    "Call your built-in image_gen tool once with the prompt below, verbatim. Copy the generated image from \$CODEX_HOME/generated_images into the current directory as $id.png and print its absolute path. Do nothing else.

  Prompt:
  $prompt" >"$out/codex.log" 2>&1
  ls "$out"
  ```

  `$out/codex.log` explains a missing image.
- **None of these:** print the prompt, ask the user to make the image in
  ChatGPT, and import the file they provide.

## 3. Review

Look at every candidate at full size: `Read` it in Claude Code, `view_image`
it in Codex. Reject it for any of the following.

Realism, the point of this skill:

- It looks illustrated, painted, 3D-rendered, waxy, or airbrushed, with
  uniformly smooth skin or a glossy synthetic sheen.
- It lacks real detail: pores, fine lines fitting the age band, separate
  strands of hair, and a catchlight in each eye.
- It has a generation defect: mismatched eyes, warped ears or teeth, glasses
  whose two sides differ, melted jewelry, a seam in the hairline, or a garbled
  collar.

Canon:

- The apparent age fits the age band in the prompt.
- Skin tone, hair color, length, and style, eye color, facial hair, glasses,
  jewelry, expression, and clothing all match `appearance`. Documents print
  the `eyes` and `hair` codes, so those must agree with the photo.
- Relatives in `relationships` (`parent`, `child`, `sibling`) look plausibly
  related, and no two characters look alike.

ID photo use:

- The person faces the camera with eyes open, the whole head and the tops of
  both shoulders in frame, in even light, against a plain light gray-blue
  backdrop, with no text, watermark, props, or hands.
- The person does not resemble anyone recognizable.

Regenerate a rejected image. If the same problem comes back twice, fix its
cause in canon or the prompt instead of rerolling. After four failed attempts
on one character, stop and report the problem rather than accept a weak face.

## 4. Import

```sh
bun run portraits import <id> <file> --model codex-image-gen
```

Set `--model` to whatever made the image, such as `codex-image-gen` or
`chatgpt`. The import stores a JPEG, transcoding a PNG and scaling the long
edge down to 1536 px, and records the prompt and image hashes in
`assets/portraits/<id>.json`. It keeps any existing framing, so re-check it.

## 5. Frame

Generated compositions vary, and without a recorded framing documents assume
a typical one that rarely fits exactly. Frame every new image:

1. Run `bun run portraits preview <id>...` and open each contact sheet it
   prints. On the left, the source sits under a grid in tenths, with the
   recorded face as a red oval, the ID photo crop dashed in blue, and the
   avatar crop dashed in green. On the right are the ID photo and avatar as
   documents will cut them.
2. Set `framing` in `assets/portraits/<id>.json`, as fractions of the image
   width and height: `height` runs from the chin to the top of the hair, the
   way passport rules measure a head; `cx` and `cy` are its center.

   ```json
   "framing": { "cx": 0.5, "cy": 0.33, "height": 0.52 }
   ```

3. Re-run the preview until the oval spans chin to top of hair, centered on
   the nose. The ID photo should show the whole head with a little space
   above it and the tops of the shoulders; the avatar is a tight head and
   shoulders crop that cuts off neither the hair nor the chin.

## 6. Re-render and check

1. Run `bun run genesis`.
2. View each target's `genesis/avatars/<id>.png` and the documents under
   `genesis/documents/<id>/`. The photo should fit its box and the grayscale
   ghost should still read as the same person.
3. Run `bun run portraits` and confirm every target is `current`.
4. Run `bun run check`.

## 7. Report

List each changed character with the route and model used, any rejected
attempts and why, any canon or prompt change, and every portrait still not
`current`.
