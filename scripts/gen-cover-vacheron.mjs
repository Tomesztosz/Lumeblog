/* A Vacheron 222-cikk nyitóképe: a tervező, az óra, és a márkanév.
   Futtatás: node scripts/gen-cover-vacheron.mjs
   Kimenet:  src/content/posts/_images/vacheron-222-nyitokep.jpg

   A cikk tétele az, hogy nem Genta, hanem Jörg Hysek tervezte a 222-t —
   ezért van a képen a tervező és az óra egyszerre. Hysek a háttérben,
   melegre hangolva és lesötétítve; az óra kivágva, elöl, a fény alatt.

   Az óra VÍZSZINTESEN KÖZÉPEN marad: a listakártyák 4:3-ban, középre vágva
   mutatják ugyanezt a képet, és ami kilóg a középső sávból, az ott elvész. */
import sharp from 'sharp';
import { cutout } from './_cut.mjs';
import { existsSync } from 'node:fs';

const SRC = 'articles/pictures/';
const WATCH = SRC + 'j_6kfPQ7SBG2PQ-Uw4_3pw.png.transform.vacdetailhd.avif';
const HYSEK = SRC + 'Jorg-Hysek-Watch-Designer.jpg';
/* A márkanév. Világos rajz fekete alapon, tehát a világosságából egyenesen
   maszk lesz — nem kell megfordítani, mint a Loriernél. */
const WORDMARK = SRC + 'Vacheron-Constantin-Logo-1101604455.jpg';

const OUT = 'src/content/posts/_images/vacheron-222-nyitokep.jpg';

const W = 1600;
const H = 700; // 16:7 — ez a cikk élén lévő kép aránya

/* 1) A tervező a háttérben.
      A méret és a hely a KÁRTYANÉZETHEZ van igazítva: a listákon ugyanez a kép
      4:3-ban, középre vágva jelenik meg, vagyis csak a 333–1266 közötti sáv
      látszik. Ha Hysek arca a sáv szélére esik, a kártyán egy félbevágott fej
      marad. Ezért a portré 0,8-szeresre kicsinyítve kerül fel, balra zárva —
      így az arca a 368–584 közötti sávban ül, jó ráhagyással a vágáson belül.
      A kép jobb széle a sötét alapba fut; ott a fátyol úgyis majdnem tömör.

      A meleg tónust nem befestéssel adjuk rá, hanem egy halvány sárgaréz
      réteggel: a tint tönkretenné a fekete-fehér portré tónusait. */
const BG_W = 1280;
const portrait = await sharp(HYSEK)
  .resize({ width: BG_W })
  .extract({ left: 0, top: 40, width: BG_W, height: H })
  .greyscale()
  .linear(1.06, -8)
  .png()
  .toBuffer();

/* A create:-ből induló képnek nincs bemeneti formátuma, ezért a formátumot
   itt ki kell mondani — különben nyers puffer jön ki, amit a sharp nem vesz be. */
const bg = await sharp({
  create: { width: W, height: H, channels: 3, background: '#13100B' },
})
  .composite([{ input: portrait, top: 0, left: 0 }])
  .png()
  .toBuffer();

/* 2) Sötétítés: balról jobbra egyre mélyebb, hogy az óra köré csend legyen.
      A bal oldal viszont marad annyira világos, hogy Hysek felismerhető. */
const veil = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="side" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#13100B" stop-opacity="0.26"/>
      <stop offset="30%"  stop-color="#13100B" stop-opacity="0.38"/>
      <stop offset="46%"  stop-color="#13100B" stop-opacity="0.80"/>
      <stop offset="70%"  stop-color="#13100B" stop-opacity="0.93"/>
      <stop offset="100%" stop-color="#13100B" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="foot" x1="0" y1="0" x2="0" y2="1">
      <stop offset="58%"  stop-color="#13100B" stop-opacity="0"/>
      <stop offset="100%" stop-color="#13100B" stop-opacity="0.80"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#8F6E31" opacity="0.22"/>
  <rect width="${W}" height="${H}" fill="url(#side)"/>
  <rect width="${W}" height="${H}" fill="url(#foot)"/>
</svg>`);

/* 3) Az óra kivágva a stúdió-fehérből. */
const cut = await cutout(WATCH, 26, [255, 255, 255]);
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
const WATCH_H = 500;
const watch = await sharp(cut)
  .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
  .resize({ height: WATCH_H })
  .toBuffer();
const wm = await sharp(watch).metadata();

/* Az óra pontosan a képközépen: a kártyák 4:3-as vágása is a középvonalra
   szimmetrikus, tehát ott az óra és alatta a márkanév középen marad. */
const WATCH_CX = W / 2;
const layers = [
  { input: veil, top: 0, left: 0 },
  { input: watch, top: Math.round((H - WATCH_H) / 2) - 48, left: Math.round(WATCH_CX - wm.width / 2) },
];

/* 4) A márkanév alul, középen, a napló papírszínében.
      Középre kell, mert a kártyák 4:3-ban középre vágnak, és egy félbevágott
      márkanév hibának látszik. A logófájl körül fekete margó van, ezért a
      világos képpontok befoglalóját megmérjük, nem a fájl méretét vesszük. */
if (existsSync(WORDMARK)) {
  const { data: g, info: gi } = await sharp(WORDMARK).greyscale().raw().toBuffer({ resolveWithObject: true });
  let mnX = gi.width, mxX = -1, mnY = gi.height, mxY = -1;
  for (let y = 0; y < gi.height; y++) {
    for (let x = 0; x < gi.width; x++) {
      if (g[y * gi.width + x] > 60) {
        if (x < mnX) mnX = x; if (x > mxX) mxX = x;
        if (y < mnY) mnY = y; if (y > mxY) mxY = y;
      }
    }
  }
  const box = { left: mnX, top: mnY, width: mxX - mnX + 1, height: mxY - mnY + 1 };

  const MARK_W = 290;
  const MARK_H = Math.round((box.height / box.width) * MARK_W);
  const mask = await sharp(WORDMARK)
    .extract(box)
    .resize(MARK_W, MARK_H)
    .greyscale()
    .linear(1.3, -18) // a tömörítés szürke szélei ne derengjenek
    .toColourspace('b-w')
    .raw()
    .toBuffer();
  const mark = await sharp({
    create: { width: MARK_W, height: MARK_H, channels: 3, background: '#E6DAC1' },
  })
    .joinChannel(mask, { raw: { width: MARK_W, height: MARK_H, channels: 1 } })
    .png()
    .toBuffer();
  layers.push({ input: mark, top: H - MARK_H - 30, left: Math.round((W - MARK_W) / 2) });
  console.log(`márkanév: ${MARK_W}x${MARK_H}`);
} else {
  console.log('(a márkanév fájl még nincs meg: ' + WORDMARK + ')');
}

await sharp(bg).composite(layers).jpeg({ quality: 88, mozjpeg: true }).toFile(OUT);
console.log('kész:', OUT, `${W}x${H}`);
