import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Format an already generated, visually reviewed editorial illustration.
// No network, credentials, production assets or publication changes.
const root = fileURLToPath(new URL('../', import.meta.url));
const input = process.argv[2] && resolve(process.argv[2]);
if (!input) throw new Error('Pass the approved generated PNG path');
const out = join(root, 'output/article-review/ugro-masodperc');
const sources = join(out, 'sources');
await mkdir(sources, { recursive: true });
const names = ['seconde-morte-hero-original-v1.png', 'seconde-morte-hero-v1.webp', 'seconde-morte-card-v1.webp'];
for (const name of [...names.map(n => join(sources, n)), join(out, 'image-checks-v1.json')]) {
  const exists = await access(name).then(() => true, () => false);
  if (exists) throw new Error(`Version already exists; preserve it: ${name}`);
}
const css = await readFile(join(root, 'src/styles/lume-palette.css'), 'utf8');
const paper = css.match(/--paper:\s*(#[a-f\d]{6})/i)?.[1];
if (!paper) throw new Error('Approved palette missing');
await copyFile(input, join(sources, names[0]), constants.COPYFILE_EXCL);
await sharp(input).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 90 }).toFile(join(sources, names[1]));
// Keep the full editorial composition in the 4:3 card, without cutting off
// the balance wheel or pretending an enlarged fragment is another photo.
await sharp(input).resize(1200, 900, { fit: 'contain', background: paper }).webp({ quality: 90 }).toFile(join(sources, names[2]));
const files = [];
for (const name of names) {
  const bytes = await readFile(join(sources, name));
  const meta = await sharp(bytes).metadata();
  files.push({ name, width: meta.width, height: meta.height, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
const report = { version: 1, role: 'editorial conceptual hero, not a product photo or technical diagram', mode: 'built-in image_gen', input, cardMethod: 'contain, approved paper colour, no content cropping', files };
await writeFile(join(out, 'image-checks-v1.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(report, null, 2));
