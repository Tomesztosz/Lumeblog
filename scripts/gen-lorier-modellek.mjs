/* A négy Lorier-modell képe a cikkhez, háttér nélkül, a kép alján az árral.
   Futtatás: node scripts/gen-lorier-modellek.mjs
   Kimenet:  src/content/posts/_images/lorier-<modell>-<nyelv>.png

   Amit tudni érdemes, ha valaki hozzányúl:

   - A kép ÁTLÁTSZÓ. Így a napló papírszíne látszik mögötte nappal, és a
     „lámpa le" sötétje éjjel — az óra mindkettőben megül. Ezért nincs kerete
     sem: egy szabadon álló tárgy köré rajzolt téglalap hazugság lenne.
   - Az ár emiatt SÁRGARÉZ színű: ez az egyetlen tokenünk, ami világos papíron
     és sötét háttéren is olvasható marad.
   - A betű Consolas. A napló technikai adatait IBM Plex Mono szedi, de azt a
     képgenerálás nem éri el; a Consolas a legközelebbi, amit rendereni tud.
   - Az ár BELE VAN ÉGETVE a képbe. Ha a Lorier árat változtat, ezt a scriptet
     újra kell futtatni — a forintos érték ráadásul árfolyamfüggő. */
import sharp from 'sharp';
import { cutout } from './_cut.mjs';

const OUT = 'src/content/posts/_images/';

/* Árak a gyártó oldaláról (lorierwatches.com), 2026-07-27-i lekérdezés.
   A forintos érték az MNB 2026-07-24-i középárfolyamán: 1 USD = 318,63 Ft.
   Kerekítve ezresre, ezért áll előtte a ≈ jel. */
const USD_HUF = 318.63;
const MODELS = [
  { file: 'Neptune', slug: 'neptune', usd: 699 },
  { file: 'Astra', slug: 'astra', usd: 699 },
  { file: 'Falcon', slug: 'falcon', usd: 699 },
  { file: 'Hyperion', slug: 'hyperion', usd: 799 },
];

const W = 900;
const H = 700;
const WATCH_H = 520; // minden modell azonos magasságban, hogy egy sorozatnak lássék
const BRASS = '#8F6E31';

function huf(usd) {
  const raw = usd * USD_HUF;
  const rounded = Math.round(raw / 1000) * 1000;
  return '≈ ' + rounded.toLocaleString('hu-HU').replace(/ /g, ' ') + ' Ft';
}

for (const m of MODELS) {
  const cut = await cutout(`articles/pictures/${m.file}.webp`);

  /* Tartalom kivágása az alfából, hogy minden óra azonos magasságra álljon. */
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

  const watch = await sharp(cut)
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .resize({ height: WATCH_H })
    .png()
    .toBuffer();
  const wm = await sharp(watch).metadata();

  for (const [lang, price] of [
    ['hu', huf(m.usd)],
    ['en', `$${m.usd}`],
  ]) {
    const label = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="90">
  <text x="${W / 2}" y="52" text-anchor="middle"
        font-family="Consolas, monospace" font-size="36" font-weight="600"
        letter-spacing="3" fill="${BRASS}">${price}</text>
</svg>`);

    await sharp({
      create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([
        { input: watch, top: 40, left: Math.round((W - wm.width) / 2) },
        { input: label, top: H - 110, left: 0 },
      ])
      .png({ compressionLevel: 9 })
      .toFile(`${OUT}lorier-${m.slug}-${lang}.png`);
  }

  console.log(`${m.slug}: $${m.usd} / ${huf(m.usd)}`);
}
