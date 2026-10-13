// Read pixel dimensions from PNG and JPEG headers without decoding.

export interface ImageSize {
  readonly width: number;
  readonly height: number;
  readonly mimeType: "image/jpeg" | "image/png";
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function isPng(bytes: Uint8Array): boolean {
  return PNG_SIGNATURE.every((value, index) => bytes[index] === value);
}

function jpegSize(bytes: Uint8Array): ImageSize {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1] ?? 0;
    // SOF0-SOF15 carry dimensions, except DHT (C4), JPG (C8), and DAC (CC).
    const isFrame =
      marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isFrame) {
      return {
        height: view.getUint16(offset + 5),
        mimeType: "image/jpeg",
        width: view.getUint16(offset + 7),
      };
    }
    offset += 2 + view.getUint16(offset + 2);
  }
  throw new Error("JPEG has no frame header");
}

export function imageSize(bytes: Uint8Array): ImageSize {
  if (isPng(bytes)) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return {
      height: view.getUint32(20),
      mimeType: "image/png",
      width: view.getUint32(16),
    };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return jpegSize(bytes);
  }
  throw new Error("Unsupported image format; expected PNG or JPEG");
}
