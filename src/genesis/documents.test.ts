import { describe, expect, test } from "bun:test";
import { world } from "../../canon/world";
import { findCharacter } from "../canon/derive";
import { imageSize } from "../render/imageSize";
import { loadPortrait } from "../render/portrait";
import { renderDocuments } from "./documents";

// Full-size renders take seconds on CI runners.
const RENDER_TIMEOUT_MS = 60_000;

describe("document rendering", () => {
  const maya = findCharacter(world, "maya-reyes");
  const priya = findCharacter(world, "priya-natarajan");

  test(
    "renders the same bytes every time",
    () => {
      // Priya holds only a license, so this compares two cards, not three.
      const first = renderDocuments(world, priya, loadPortrait(priya));
      const second = renderDocuments(world, priya, loadPortrait(priya));
      expect(first.driversLicenseFront).toBeDefined();
      expect(first.passport).toBeUndefined();
      expect(
        Buffer.from(first.driversLicenseFront ?? []).equals(
          Buffer.from(second.driversLicenseFront ?? []),
        ),
      ).toBe(true);
    },
    RENDER_TIMEOUT_MS,
  );

  test(
    "renders photographed JPEGs of each document",
    () => {
      const documents = renderDocuments(world, maya, loadPortrait(maya));
      for (const bytes of [
        documents.driversLicenseFront,
        documents.driversLicenseBack,
        documents.passport,
        documents.birthCertificate,
        documents.creditCardFront,
        documents.creditCardBack,
      ]) {
        const size = imageSize(bytes ?? new Uint8Array());
        expect(size.mimeType).toBe("image/jpeg");
        expect(size.width).toBeGreaterThanOrEqual(1600);
      }
    },
    RENDER_TIMEOUT_MS,
  );
});
