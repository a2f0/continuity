import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type Browser, chromium } from "playwright";
import { buildSite } from "./build";

const origin = "https://continuity.tearleads.com";
const endpoint = "https://ct.a2f0.net/v1/clicks";
const root = mkdtempSync(join(tmpdir(), "continuity-browser-"));
const output = join(root, "production");
const preview = join(root, "preview");
let browser: Browser;
let headers: Record<string, string>;

beforeAll(async () => {
  await buildSite(output, true);
  await buildSite(preview);
  headers = Object.fromEntries(
    readFileSync(join(output, "_headers"), "utf8")
      .split("\n")
      .filter((line) => line.startsWith("  "))
      .map((line) => {
        const colon = line.indexOf(":");
        return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()];
      }),
  );
  browser = await chromium.launch();
}, 30_000);
afterAll(async () => {
  await browser?.close();
  rmSync(root, { recursive: true, force: true });
});

type Privacy = "none" | "gpc" | "dnt" | "extension" | "saved" | "automation";
interface Batch {
  site: string;
  environment: string;
  events: { app: string; page: string; target: string; label: string | null }[];
}

async function openGallery(
  privacy: Privacy = "none",
  site = origin,
  directory = output,
  javaScriptEnabled = true,
) {
  const context = await browser.newContext({ javaScriptEnabled });
  const batches: Batch[] = [];
  await context.addInitScript((setting: Privacy) => {
    Object.defineProperty(Navigator.prototype, "webdriver", {
      get: () => setting === "automation",
    });
    Object.defineProperty(Navigator.prototype, "globalPrivacyControl", {
      get: () => setting === "gpc",
    });
    Object.defineProperty(Navigator.prototype, "doNotTrack", {
      get: () => (setting === "dnt" ? "1" : null),
    });
    if (setting === "saved") localStorage.setItem("ct:opt-out", "1");
    if (setting === "extension") {
      document.addEventListener("DOMContentLoaded", () => {
        document.documentElement.setAttribute("data-ct-disabled", "");
        document.dispatchEvent(new Event("ct:opt-out-change"));
      });
    }
  }, privacy);
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.url() === endpoint) {
      batches.push(request.postDataJSON() as Batch);
      await route.fulfill({
        status: 204,
        headers: { "Access-Control-Allow-Origin": site },
      });
      return;
    }
    if (url.origin !== site) {
      await route.abort();
      return;
    }
    const file = Bun.file(
      join(directory, url.pathname === "/" ? "index.html" : url.pathname),
    );
    if (!(await file.exists())) {
      await route.fulfill({ status: 404 });
      return;
    }
    await route.fulfill({
      body: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
      headers,
    });
  });
  const page = await context.newPage();
  await page.goto(`${site}/?private=secret#sensitive`, { waitUntil: "load" });
  return { context, page, batches };
}

test("trusted clicks flush with gallery attribution and GPC override", async () => {
  const { context, page, batches } = await openGallery("gpc");
  try {
    await page.locator("h1 em").click();
    const sent = page.waitForResponse(endpoint);
    await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
    await sent;
    expect(batches).toHaveLength(1);
    expect(batches[0]).toMatchObject({
      site: "continuity",
      environment: "production",
      events: [{ app: "gallery", page: "/", target: "em", label: null }],
    });
    const serialized = JSON.stringify(batches);
    for (const privateValue of [
      "secret",
      "sensitive",
      "One cast",
      "private",
      "href",
    ]) {
      expect(serialized).not.toContain(privateValue);
    }
  } finally {
    await context.close();
  }
}, 15_000);

for (const privacy of ["dnt", "extension", "saved", "automation"] as const) {
  test(`${privacy} prevents collection despite the GPC override`, async () => {
    const { context, page, batches } = await openGallery(privacy);
    try {
      await page.locator("h1").click();
      await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
      await page.waitForTimeout(200);
      expect(batches).toEqual([]);
    } finally {
      await context.close();
    }
  }, 15_000);
}

test("the extension clears clicks queued before opting out", async () => {
  const { context, page, batches } = await openGallery();
  try {
    await page.locator("h1").click();
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-ct-disabled", "");
      document.dispatchEvent(new Event("ct:opt-out-change"));
      window.dispatchEvent(new Event("pagehide"));
    });
    await page.waitForTimeout(200);
    expect(batches).toEqual([]);
  } finally {
    await context.close();
  }
}, 15_000);

for (const site of ["http://localhost:8787", "https://preview.example.com"]) {
  test(`the production bundle stays inert at ${site}`, async () => {
    const { context, page, batches } = await openGallery("none", site);
    try {
      await page.locator("h1").click();
      await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
      await page.waitForTimeout(200);
      expect(batches).toEqual([]);
    } finally {
      await context.close();
    }
  }, 15_000);
}

test("default preview builds are inert even on the production host", async () => {
  const { context, page, batches } = await openGallery("none", origin, preview);
  try {
    expect(await page.locator("script").count()).toBe(0);
    await page.locator("h1").click();
    await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
    await page.waitForTimeout(200);
    expect(batches).toEqual([]);
  } finally {
    await context.close();
  }
}, 15_000);

test("all gallery content and downloads work with JavaScript disabled", async () => {
  const { context, page, batches } = await openGallery(
    "none",
    origin,
    output,
    false,
  );
  try {
    expect(await page.locator(".person").count()).toBe(8);
    expect(await page.locator("#files a[download]").count()).toBeGreaterThan(
      50,
    );
    expect(await page.locator("#privacy").isVisible()).toBe(true);
    expect(batches).toEqual([]);
  } finally {
    await context.close();
  }
}, 15_000);
