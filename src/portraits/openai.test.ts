import { describe, expect, test } from "bun:test";
import { generateImage } from "./openai";

const request = {
  model: "gpt-image-2",
  prompt: "a portrait",
  quality: "high",
  size: "1024x1536",
};

describe("generateImage", () => {
  test("posts the request and decodes the returned image", async () => {
    let sent: { url: string; init: RequestInit } | undefined;
    const bytes = await generateImage(request, "sk-test", async (url, init) => {
      sent = { init, url };
      return Response.json({
        data: [{ b64_json: Buffer.from([0xff, 0xd8, 1]).toString("base64") }],
      });
    });
    expect([...bytes]).toEqual([0xff, 0xd8, 1]);
    expect(sent?.url).toBe("https://api.openai.com/v1/images/generations");
    expect(new Headers(sent?.init.headers).get("Authorization")).toBe(
      "Bearer sk-test",
    );
    expect(JSON.parse(String(sent?.init.body))).toMatchObject({
      model: "gpt-image-2",
      output_format: "jpeg",
      size: "1024x1536",
    });
  });

  test("surfaces the API's error message", async () => {
    const failing = generateImage(request, "sk-test", async () =>
      Response.json(
        { error: { message: "billing hard limit reached" } },
        { status: 400 },
      ),
    );
    await expect(failing).rejects.toThrow(
      "Image generation failed (400): billing hard limit reached",
    );
  });
});
