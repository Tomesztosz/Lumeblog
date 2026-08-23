/* A Baltic-cikk képeinek webre optimalizált változatai.
   Futtatás: node scripts/gen-baltic-kepek.mjs */
import sharp from 'sharp';

const SRC = 'articles/pictures/';
const OUT = 'src/content/posts/_images/';
const MAX_W_PHOTO = 1600;
const MAX_W_ALPHA = 900;

const JOBS = [
  { in: 'baltic-fathers-journal_forras_baltic-watches.com.jpg', out: 'baltic-fathers-journal.jpg', mode: 'photo' },
  { in: 'etienne-malec_forras_the-smalltalk.com.jpg', out: 'baltic-etienne-malec.jpg', mode: 'photo' },
  { in: 'baltic-bicompax-001-transparent_forras_baltic-watches.com_AI.png', out: 'baltic-bicompax-001-transparent.png', mode: 'alpha' },
  { in: 'baltic-aquascaphe-mk2-transparent_forras_baltic-watches.com.png', out: 'baltic-aquascaphe-mk2-transparent.png', mode: 'alpha' },
  { in: 'baltic-only-watch-2021_forras_baltic-watches.com.jpg', out: 'baltic-only-watch-2021.jpg', mode: 'photo' },
  { in: 'baltic-mr01-transparent_forras_baltic-watches.com.png', out: 'baltic-mr01-transparent.png', mode: 'alpha' },
  { in: 'baltic-mr01-back_forras_baltic-watches.com.jpg', out: 'baltic-mr01-back.jpg', mode: 'photo' },
];

async function alphaBox(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let maxX = -1;
  let minY = info.height;
  let maxY = -1;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) throw new Error('No visible pixels found');
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function writeAlpha(source, target) {
  const input = await sharp(source).png().toBuffer();
  const box = await alphaBox(input);
  const pad = Math.round(Math.max(box.width, box.height) * 0.04);
  const padded = await sharp(input)
    .extract(box)
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp(padded)
    .resize({ width: MAX_W_ALPHA, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(target);
}

for (const job of JOBS) {
  const source = SRC + job.in;
  const target = OUT + job.out;

  if (job.mode === 'alpha') {
    await writeAlpha(source, target);
  } else {
    const metadata = await sharp(source).metadata();
    const width = Math.min(metadata.width, MAX_W_PHOTO);
    await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(target);
  }

  const result = await sharp(target).metadata();
  console.log(`${job.out}: ${result.width}x${result.height}`);
}
