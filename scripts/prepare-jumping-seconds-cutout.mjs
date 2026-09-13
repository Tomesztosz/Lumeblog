import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';

const dir = resolve('output/article-review/ugro-masodperc');
const sources = join(dir, 'sources');
const generated = process.argv[2];
const maskPath = join(sources, 'lange-jumping-b10-imagegen-mask-v2.png');
if (generated) await copyFile(resolve(generated), maskPath);
const original = join(sources, 'lange-jumping-b10-photo-v1.webp');
const { data: rgb, info } = await sharp(original).removeAlpha().raw().toBuffer({ resolveWithObject: true });
assert((await sharp(maskPath).metadata()).hasAlpha);
const mask = await sharp(maskPath).resize(info.width, info.height, { fit: 'fill' }).extractChannel('alpha').raw().toBuffer();
// Restore opaque photographic surfaces without changing the soft contour.
for (let p = 0; p < mask.length; p++) mask[p] = mask[p] >= 245 ? 255 : mask[p] <= 10 ? 0 : mask[p];
const rgba = Buffer.alloc(info.width * info.height * 4);
let transparent = 0, opaque = 0;
for (let p = 0; p < mask.length; p++) {
  rgba[p * 4] = rgb[p * 3]; rgba[p * 4 + 1] = rgb[p * 3 + 1]; rgba[p * 4 + 2] = rgb[p * 3 + 2];
  rgba[p * 4 + 3] = mask[p];
  transparent += mask[p] === 0; opaque += mask[p] === 255;
}
assert(transparent > 100000 && opaque > 900000);
const output = join(sources, 'lange-jumping-b10-cutout-v2.png');
await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(output);
const actual = await sharp(output).ensureAlpha().raw().toBuffer();
let changedRGB = 0;
for (let p = 0; p < mask.length; p++) for (let c = 0; c < 3; c++) changedRGB += actual[p * 4 + c] !== rgb[p * 3 + c];
assert.equal(changedRGB, 0, 'Keep every original RGB sample, including under transparency');
for (const [name, background] of [['light', '#f2f0e8'], ['dark', '#121510']]) {
  await sharp(output).flatten({ background }).resize(1000).png().toFile(join(dir, `qa-b10-cutout-${name}.png`));
}
const hash = async path => createHash('sha256').update(await readFile(path)).digest('hex');
const report = { original, mask: maskPath, output, width: info.width, height: info.height, transparent, opaque, changedRGB, sourceSHA256: await hash(original), maskSHA256: await hash(maskPath), outputSHA256: await hash(output), method: 'Built-in imagegen background extraction. Only its alpha channel is used, proportionally aligned to the original canvas. Alpha values >=245 become opaque and <=10 transparent; intermediate edges remain antialiased. All original photograph RGB samples are retained. No image reconstruction or extension.' };
await writeFile(join(dir, 'cutout-checks-v2.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
