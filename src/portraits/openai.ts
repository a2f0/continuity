// A minimal client for OpenAI's image generation endpoint.

export interface ImageRequest {
  readonly model: string;
  readonly prompt: string;
  readonly size: string;
  readonly quality: string;
}

type Fetch = (input: string, init: RequestInit) => Promise<Response>;

interface ImagesResponse {
  readonly data?: readonly { readonly b64_json?: string }[];
  readonly error?: { readonly message?: string };
}

const ENDPOINT = "https://api.openai.com/v1/images/generations";

export async function generateImage(
  request: ImageRequest,
  apiKey: string,
  fetchImpl: Fetch = fetch,
): Promise<Uint8Array> {
  const response = await fetchImpl(ENDPOINT, {
    body: JSON.stringify({
      model: request.model,
      n: 1,
      output_format: "jpeg",
      prompt: request.prompt,
      quality: request.quality,
      size: request.size,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const body = (await response.json().catch(() => ({}))) as ImagesResponse;
  if (!response.ok) {
    throw new Error(
      `Image generation failed (${response.status}): ${body.error?.message ?? response.statusText}`,
    );
  }
  const encoded = body.data?.[0]?.b64_json;
  if (!encoded) {
    throw new Error("Image generation returned no image data.");
  }
  return new Uint8Array(Buffer.from(encoded, "base64"));
}
