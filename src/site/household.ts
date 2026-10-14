import { assetUrl, escapeHtml as e } from "./html";
import type { Gallery } from "./types";

export function householdGallery(gallery: Gallery): string {
  const cards = gallery.seedFiles
    .filter((file) => ["image", "tool", "appliance"].includes(file.kind))
    .map((file) => {
      const { fileName, make, model, serialNumber, equipmentType } =
        file.fields;
      const title = fileName ?? `${make} ${model} ${equipmentType}`;
      const images = file.attachments
        .map((attachment, index) => {
          const path = `tearleads/${attachment.file}`;
          const asset = gallery.assets.find((asset) => asset.path === path);
          if (!asset?.image)
            throw new Error(`Missing household gallery image ${path}`);
          return `<a href="${assetUrl(path)}"><img src="${assetUrl(path)}" alt="${e(title)} — photo ${index + 1}" width="${asset.image.width}" height="${asset.image.height}" loading="lazy"></a>`;
        })
        .join("");
      return `<article class="household-item"><h3>${e(title)}</h3>${serialNumber ? `<p>Serial: ${e(serialNumber)}</p>` : ""}${images}</article>`;
    })
    .join("");
  return `<section id="household" aria-labelledby="household-title"><div class="section-heading"><h2 id="household-title">Family and home.</h2><p>Fictional family photos and household inventory.</p></div><div class="household-grid">${cards}</div></section>`;
}
