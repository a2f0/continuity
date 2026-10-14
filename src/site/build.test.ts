import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { repoPath } from "../paths";
import { buildSite, readGallery } from "./build";
import { assetUrl } from "./html";
import { galleryPage } from "./page";
import type { Gallery } from "./types";

const root = mkdtempSync(join(tmpdir(), "continuity-site-"));
const output = join(root, "public");
let gallery: Gallery;
let html: string;

beforeAll(() => {
  gallery = buildSite(output);
  html = readFileSync(join(output, "index.html"), "utf8");
});
afterAll(() => rmSync(root, { recursive: true, force: true }));

describe("asset gallery", () => {
  test("previews family photos and every equipment photo", () => {
    expect(html).toContain('id="household"');
    for (const file of gallery.seedFiles.filter((file) =>
      ["image", "tool", "appliance"].includes(file.kind),
    )) {
      for (const attachment of file.attachments) {
        expect(html).toContain(
          `src="${assetUrl(`tearleads/${attachment.file}`)}"`,
        );
      }
    }
    expect(html).toContain("AF26-D18-004217");
    expect(html).toContain("Circular Saw Alderforge AF-CS165</h3>");
    expect(html).toContain("Washing Machine Hearthmere HM-W8</h3>");
  });
  test("counts every rendered document image", () => {
    const count = gallery.assets.filter((asset) =>
      asset.path.startsWith("documents/"),
    ).length;
    expect(html).toContain(`<dt>Document images</dt><dd>${count}</dd>`);
  });

  test("publishes every manifest asset unchanged with a download on the page", () => {
    for (const asset of gallery.assets) {
      expect(readFileSync(join(output, "genesis", asset.path))).toEqual(
        readFileSync(repoPath("genesis", asset.path)),
      );
      expect(html).toContain(`href="${assetUrl(asset.path)}" download`);
    }
  });

  test("shows every character and note without requiring navigation or scripts", () => {
    for (const person of gallery.canon.characters) {
      expect(html).toContain(`class="person" id="${person.id}"`);
      for (const path of Object.values(person.files)) {
        expect(html).toContain(`src="${assetUrl(path)}"`);
      }
    }
    expect(html.match(/class="note"/g)?.length).toBe(gallery.notes.length);
    expect(html).not.toContain("<script");
  });

  test("serves only existing local links and images", () => {
    for (const match of html.matchAll(/(?:href|src)="(\/[^"#]+)"/g)) {
      const path = match[1];
      if (!path) throw new Error("Missing link path");
      expect(
        readFileSync(join(output, decodeURIComponent(path))).length,
      ).toBeGreaterThan(0);
    }
    const stylesheet = readFileSync(join(output, "style.css"), "utf8");
    for (const match of stylesheet.matchAll(/url\("(\/[^"#]+)"\)/g)) {
      const path = match[1];
      if (!path) throw new Error("Missing stylesheet asset path");
      expect(
        readFileSync(join(output, decodeURIComponent(path))).length,
      ).toBeGreaterThan(0);
    }
  });

  test("reserves each document image's actual dimensions before it loads", () => {
    for (const asset of gallery.assets.filter((file) =>
      file.path.startsWith("documents/"),
    )) {
      if (!asset.image) throw new Error("Missing document dimensions");
      expect(html).toContain(
        `width="${asset.image.width}" height="${asset.image.height}"`,
      );
    }
  });

  test("opts the page and assets out of indexing", () => {
    expect(html).toContain(
      '<meta name="robots" content="noindex, nofollow, noarchive">',
    );
    expect(readFileSync(join(output, "_headers"), "utf8")).toContain(
      "/*\n  X-Robots-Tag: noindex, nofollow, noarchive",
    );
  });

  test("escapes note content rather than treating it as markup", () => {
    const page = galleryPage({
      ...gallery,
      notes: [{ text: '<script>alert("test")</script>\nA & B' }],
    });
    expect(page).toContain(
      "&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;",
    );
    expect(page).toContain("A &amp; B");
    expect(page).not.toContain("<script>");
  });

  test("refuses to package an asset that differs from the manifest", () => {
    writeFileSync(join(root, "asset.txt"), "changed");
    writeFileSync(
      join(root, "manifest.json"),
      JSON.stringify({
        files: [{ path: "asset.txt", bytes: 7, sha256: "wrong" }],
      }),
    );
    expect(() => readGallery(root)).toThrow(
      "genesis/asset.txt differs from its manifest",
    );
  });
});
