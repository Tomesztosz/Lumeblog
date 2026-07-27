/* A Vacheron 222-cikk képei, háttér nélkül.
   Futtatás: node scripts/gen-vacheron-kepek.mjs
   Kimenet:  src/content/posts/_images/vacheron-*.png

   Ugyanaz a kezelés, mint a Lorier-modelleknél: a stúdió-fehér hátteret a
   képszélről induló kitöltés viszi le, így az óra a napló papírszínén és a
   „lámpa le" sötétjén is megül, keret nélkül.

   A máltai keresztes makrónál a bal felső képpont már maga a tok, ezért ott
   explicit meg kell adni, hogy a fehér a háttér — különben a kitöltés a
   fém színét kezdené eltávolítani. */
import sharp from 'sharp';
import { cutout } from './_cut.mjs';

const OUT = 'src/content/posts/_images/';
const PAD = 0.05; // a tartalom köré tett levegő, a hosszabbik oldal arányában

const JOBS = [
  { src: 'VC 222.webp', out: 'vacheron-222-jumbo.png', tol: 26, bg: null },
  { src: 'VC 222 cross.avif', out: 'vacheron-222-maltai-kereszt.png', tol: 34, bg: [255, 255, 255] },
  { src: 'VC 222 gold.jpg', out: 'vacheron-historiques-222.png', tol: 26, bg: null },
];

for (const job of JOBS) {
  const cut = await cutout(`articles/pictures/${job.src}`, job.tol, job.bg);

  const { data, info } = await sharp(cut).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width,
    maxX = -1,
    minY = info.height,
    maxY = -1;
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
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const pad = Math.round(Math.max(bw, bh) * PAD);

  await sharp(cut)
    .extract({ left: minX, top: minY, width: bw, height: bh })
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(OUT + job.out);

  console.log(`${job.out}: ${bw + 2 * pad}x${bh + 2 * pad}`);
}
