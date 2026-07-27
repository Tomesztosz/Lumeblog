/* A Zenith El Primero 400-as kalibere a Szerkezet-cikkhez, háttér nélkül,
   az oszlopkerék megjelölésével.
   Futtatás: node scripts/gen-elprimero-kep.mjs
   Kimenet:  src/content/posts/_images/el-primero-400-<nyelv>.png

   A kiemelés a szerkesztőségé, nem az eredeti fotón van rajta — ezt a
   képaláírás is kimondja. A karika sárgaréz és kitöltetlen, hogy ne takarja
   el azt, amit meg akar mutatni. */
import sharp from 'sharp';
import { cutout } from './_cut.mjs';

const SRC = 'articles/pictures/Zenith oszlopkerék el primero.jpg';
const OUT = 'src/content/posts/_images/';

const BRASS = '#8F6E31';
const STRIP = 86; // hely a feliratnak a kép alatt

const cut = await cutout(SRC, 26, [255, 255, 255]);

/* Tartalom kivágása, hogy a koordináták kiszámíthatók legyenek. */
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
const bw = maxX - minX + 1;
const bh = maxY - minY + 1;
const pad = Math.round(Math.max(bw, bh) * 0.04);
const W = bw + 2 * pad;
const H = bh + 2 * pad;

const base = await sharp(cut)
  .extract({ left: minX, top: minY, width: bw, height: bh })
  .extend({
    top: pad, bottom: pad + STRIP, left: pad, right: pad,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

/* Az oszlopkerék helye az EREDETI fotón, átszámolva a kivágott képre:
   a pillérek gyűrűje a rögzítő csavar körül, ahol a kapcsolókar felfekszik. */
const ORIG = { x: 366, y: 346, r: 28 };
const cx = ORIG.x - minX + pad;
const cy = ORIG.y - minY + pad;
const r = ORIG.r;

const LABELS = { hu: 'OSZLOPKERÉK', en: 'COLUMN WHEEL' };

for (const [lang, text] of Object.entries(LABELS)) {
  /* A jelölővonal a karika bal alsó pereméről indul, és a kép alatti sávba
     fut, hogy ne takarjon el semmit a szerkezetből. */
  const startX = cx - r * 0.72;
  const startY = cy + r * 0.72;
  const endX = 40;
  const endY = H + 30;

  const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + STRIP}">
    <circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="none" stroke="#FFFFFF" stroke-width="5" opacity="0.35"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${BRASS}" stroke-width="3"/>
    <polyline points="${startX},${startY} ${endX + 34},${endY} ${endX},${endY}"
              fill="none" stroke="${BRASS}" stroke-width="2"/>
    <text x="${endX}" y="${endY + 30}" font-family="Consolas, monospace" font-size="22"
          font-weight="600" letter-spacing="2.5" fill="${BRASS}">${text}</text>
  </svg>`);

  await sharp(base)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}el-primero-400-${lang}.png`);
}

console.log(`kész: el-primero-400-hu.png / -en.png (${W}x${H + STRIP}), karika: (${cx}, ${cy}) r=${r}`);
