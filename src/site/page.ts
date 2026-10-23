import { characterIndex, characters } from "./characters";
import { householdGallery } from "./household";
import { assetUrl, escapeHtml as e, fileSize } from "./html";
import type { Gallery } from "./types";

function notes(gallery: Gallery): string {
  return gallery.notes
    .map((note, index) => {
      const [title = "", ...lines] = note.text.split("\n");
      return `<article class="note"><span class="eyebrow">Note ${String(index + 1).padStart(2, "0")}</span><h3>${e(title)}</h3><p>${e(lines.join("\n"))}</p></article>`;
    })
    .join("");
}

function downloads(gallery: Gallery): string {
  return gallery.assets
    .map(
      (asset) =>
        `<li><a href="${assetUrl(asset.path)}" download><span>${e(asset.path)}</span><span class="file-size">${fileSize(asset.bytes)} <span aria-hidden="true">↓</span></span></a></li>`,
    )
    .join("");
}

export function galleryPage(gallery: Gallery, tracking = false): string {
  const { canon } = gallery;
  const owner = canon.characters.find((person) => person.id === canon.owner);
  const documentCount = gallery.assets.filter((asset) =>
    asset.path.startsWith("documents/"),
  ).length;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta name="description" content="Continuity: the fictional cast, specimen documents, and seed data behind tearleads.">
  <meta name="color-scheme" content="light">
  <title>Continuity — tearleads</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/style.css">
  ${tracking ? '<script type="module" src="/click-tracking.js"></script>' : ""}
</head>
<body id="top">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><a class="wordmark" href="#top">continuity<span>/ tearleads</span></a>
    <nav aria-label="Page sections"><a href="#cast">Cast</a><a href="#household">Family and home</a><a href="#notes">Notes</a><a href="#files">Files <span aria-hidden="true">↓</span></a></nav>
  </header>
  <main id="main">
    <section class="intro" aria-labelledby="intro-title"><div><p class="eyebrow">The tearleads specimen collection</p>
      <h1 id="intro-title">One cast.<br><em>Every detail.</em></h1>
      <p class="lede">Fictional people, consistent everywhere. The portraits, documents, and everyday details behind tearleads.</p>
      <a class="text-link" href="#cast">Meet the cast <span aria-hidden="true">↓</span></a></div>
      <aside class="collection-info" aria-label="Collection details"><span class="specimen-stamp">SPECIMEN</span><p>Built for screenshots,<br>demos, and import testing.</p>
        <dl><div><dt>People</dt><dd>${canon.characters.length}</dd></div><div><dt>Document images</dt><dd>${documentCount}</dd></div><div><dt>Story date</dt><dd><time datetime="${e(canon.asOf)}">${e(canon.asOf)}</time></dd></div></dl>
        <p class="fine-print">Every person and document in this collection is fictional.</p></aside>
    </section>
    <section id="cast" aria-labelledby="cast-title"><div class="section-heading"><h2 id="cast-title">The cast</h2><p>One connected world, down to the last detail.</p></div>
      ${characterIndex(gallery)}${characters(gallery)}
    </section>
    ${householdGallery(gallery)}
    <section id="notes" class="notes-section" aria-labelledby="notes-title"><div class="section-heading"><h2 id="notes-title">Life between the lines.</h2><p>The notes on ${e(owner?.displayName ?? "the owner")}’s device.</p></div><div class="notes-grid">${notes(gallery)}</div></section>
    <section id="files" class="files-section" aria-labelledby="files-title"><div class="section-heading"><h2 id="files-title">The complete collection.</h2><p>${gallery.assets.length} files, ready to use.</p></div>
      <div class="download-intro"><p>Portraits, specimen documents, contact exports, and the tearleads seed. Open an image above to inspect it, or download any original below.</p><a class="text-link" href="${assetUrl("manifest.json")}" download>Download manifest <span aria-hidden="true">↓</span></a></div>
      <ul class="file-list">${downloads(gallery)}</ul>
    </section>
    ${
      tracking
        ? `<section id="privacy" aria-labelledby="privacy-title"><h2 id="privacy-title">Click analytics</h2>
      <p>This gallery uses CT, operated by Tearleads, LLC, to understand clicks. CT records the time, element type, gallery name, and production environment. It does not record page text, form values, link destinations, query strings, or fragments. The page is always recorded as <code>/</code>.</p>
      <p>The collector receives your IP address and approximate country, region, and city from Cloudflare. Click records are kept for 90 days and are available only through an authenticated dashboard.</p>
      <p>This gallery overrides Global Privacy Control. Do Not Track, the saved CT opt-out, and the <a href="https://github.com/a2f0/ct/tree/main/packages/extension">CT browser extension</a> still stop collection. Automated browsers are excluded. See <a href="https://github.com/a2f0/ct/blob/main/docs/privacy.md">CT privacy and opt-out instructions</a>.</p>
    </section>`
        : ""
    }
  </main>
  <footer><a class="wordmark" href="#top">continuity<span>/ tearleads</span></a><p class="footer-caption">Fictional by design. Consistent by construction.</p>${tracking ? '<a href="#privacy">Click analytics</a>' : ""}<a href="https://github.com/a2f0/continuity">Source on GitHub <span aria-hidden="true">↗</span></a></footer>
</body>
</html>
`;
}
