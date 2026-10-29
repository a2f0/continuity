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
      get: () => setting !== "none",
    });
    Object.defineProperty(Navigator.prototype, "doNotTrack", {
      get: () => (setting === "dnt" ? "1" : null),
    });
    if (setting === "saved") localStorage.setItem("ct:opt-out", "1");
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
      body:
        url.pathname === "/" && privacy === "extension"
          ? (await file.text()).replace(
              '<html lang="en">',
              '<html lang="en" data-ct-disabled>',
            )
          : Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
      headers,
    });
  });
  const page = await context.newPage();
  await page.clock.install();
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

test("download, navigation, and external links omit text and destinations", async () => {
  const { context, page, batches } = await openGallery("gpc");
  try {
    // Keep trusted link clicks on the page so they can flush together.
    await page.evaluate(() =>
      document.addEventListener("click", (event) => event.preventDefault()),
    );
    await page.locator("#files a[download]").first().click();
    await page.locator('nav a[href="#cast"]').click();
    await page
      .locator('footer a[href="https://github.com/a2f0/continuity"]')
      .click();
    await page.locator("a.portrait").first().click();
    await page.locator('.document a[aria-label^="Open "]').first().click();
    await page.locator(".document a[download][aria-label]").first().click();
    const sent = page.waitForResponse(endpoint);
    await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
    await sent;
    expect(batches).toHaveLength(1);
    expect(Object.keys(batches[0] ?? {}).sort()).toEqual([
      "environment",
      "events",
      "site",
    ]);
    expect(batches[0]?.events).toHaveLength(6);
    for (const event of batches[0]?.events ?? []) {
      expect(event).toMatchObject({
        app: "gallery",
        page: "/",
        target: "a",
        label: null,
      });
      expect(Object.keys(event).sort()).toEqual([
        "app",
        "id",
        "label",
        "page",
        "target",
        "timestamp",
      ]);
    }
    for (const value of [
      "genesis/",
      "#cast",
      "github.com",
      "Source on GitHub",
      "Download manifest",
      "Maya",
      "Reyes",
      "portrait",
      "Driver’s license",
    ]) {
      expect(JSON.stringify(batches)).not.toContain(value);
    }
  } finally {
    await context.close();
  }
}, 15_000);

// Each case clicks and leaves the page; none may send a batch.
const inertCases: readonly {
  readonly name: string;
  readonly privacy: Privacy;
  readonly site?: string;
}[] = [
  ...(["dnt", "extension", "saved", "automation"] as const).map((privacy) => ({
    name: `${privacy} prevents collection despite the GPC override`,
    privacy,
  })),
  ...["http://localhost:8787", "https://preview.example.com"].map((site) => ({
    name: `the production bundle stays inert at ${site}`,
    privacy: "none" as const,
    site,
  })),
];

for (const { name, privacy, site } of inertCases) {
  test(name, async () => {
    const { context, page, batches } = await openGallery(privacy, site);
    try {
      await page.locator("h1").click();
      await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
      await page.clock.runFor(6_000);
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
    await page.clock.runFor(6_000);
    await page.waitForTimeout(200);
    expect(batches).toEqual([]);
  } finally {
    await context.close();
  }
}, 15_000);

test("default preview builds are inert even on the production host", async () => {
  const { context, page, batches } = await openGallery("none", origin, preview);
  try {
    expect(await page.locator("script").count()).toBe(0);
    expect(await page.locator("#privacy").count()).toBe(0);
    await page.locator("h1").click();
    await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
    await page.clock.runFor(6_000);
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
