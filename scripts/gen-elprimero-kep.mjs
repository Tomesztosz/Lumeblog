/* A Zenith El Primero 400-as kalibere a Szerkezet-cikkhez, háttér nélkül.
   Futtatás: node scripts/gen-elprimero-kep.mjs */
import sharp from 'sharp';
import { cutout } from './_cut.mjs';

const SRC = 'articles/pictures/Zenith oszlopkerék el primero.jpg';
const OUT = 'src/content/posts/_images/el-primero-400.png';

const cut = await cutout(SRC, 26, [255, 255, 255]);
const { data, info } = await sharp(cut).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let minX = info.width, maxX = -1, minY = info.height, maxY = -1;
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 24) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
}
const bw = maxX - minX + 1, bh = maxY - minY + 1;
const pad = Math.round(Math.max(bw, bh) * 0.04);
await sharp(cut)
  .extract({ left: minX, top: minY, width: bw, height: bh })
  .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(OUT);
console.log('kész:', OUT, `${bw + 2 * pad}x${bh + 2 * pad}`);
