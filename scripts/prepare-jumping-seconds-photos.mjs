import { readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const out = resolve('output/article-review/ugro-masodperc');
const sourcePage = 'https://press.alange-soehne.com/richard-lange-jumping-seconds-2025/';
const licensePage = 'https://press.alange-soehne.com/media-library/';
const files = [
  ['b09', 'c709ead1-a5dd-4379-aa1a-dfc2b5c78830', 'jpg'],
  ['b10', 'dda30134-21dc-49c8-9270-66b1465f2e31', 'jpg'],
  ['b11', '22ab82a7-89d8-49d7-afde-3b5e4278bf0f', 'jpg'],
];
const manifest = [];
for (const [id, folder, extension] of files) {
  const url = `https://content.presspage.com/uploads/2741/${folder}/als_252_056_${id}_richard_lange_js_2025.${extension}?10000`;
  const original = `lange-jumping-${id}-original.${extension}`;
  let bytes;
  try { bytes = await readFile(join(out, 'sources', original)); }
  catch {
    const result = await fetch(url);
    if (!result.ok) throw new Error(`Download ${result.status}: ${id}`);
    bytes = Buffer.from(await result.arrayBuffer());
    await writeFile(join(out, 'sources', original), bytes, { flag: 'wx' });
  }
  const metadata = await sharp(bytes).metadata();
  // Only proportional web delivery conversion, no crop, retouching or AI.
  const web = `lange-jumping-${id}-photo-v1.webp`;
  await sharp(bytes).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 90 }).toFile(join(out, 'sources', web));
  manifest.push({ id, original, web, url, sourcePage, licensePage, credit: 'Lange Uhren GmbH', width: metadata.width, height: metadata.height, hasAlpha: metadata.hasAlpha, sha256: createHash('sha256').update(bytes).digest('hex'), changes: 'Proportional downscale and WebP conversion only' });
}
await writeFile(join(out, 'photo-sources-v1.json'), JSON.stringify({ checked: '2026-09-13', use: 'Editorial publication under the official press-library terms, not a Creative Commons licence or a separate personal permission. Lume owner accepted the post-publication proof-copy obligation on 2026-09-13. Credit: Lange Uhren GmbH. B10 v1 remains the private photographic source; publish only its v2 transparent cutout, documented in cutout-checks-v2.json.', manifest }, null, 2) + '\n');
console.log(JSON.stringify(manifest.map(({ id, width, height }) => ({ id, width, height }))));
