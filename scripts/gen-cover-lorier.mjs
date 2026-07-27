/* A Lorier-cikk nyitóképe: az alapítókról készült fotó + a márka wordmarkja.
   Futtatás: node scripts/gen-cover-lorier.mjs
   Kimenet:  src/content/posts/_images/lorier-alapitok-lockup.jpg

   Két döntés, amit érdemes tudni, ha valaki újra hozzányúl:

   1. A wordmark VÍZSZINTESEN KÖZÉPRE kerül. A listakártyák 4:3-ban, középre
      vágva mutatják ugyanezt a képet, és egy félbevágott wordmark hibának
      látszik, nem szándéknak. Ami középen van, az minden arányban bent marad.

   2. A chevron és a felirat a logó eredeti arányaival és térközével kerül
      egymás alá — csak a köré rakott üres margót hagyjuk el. A logófájl fekete
      rajz fehér alapon, alfa nélkül, ezért mindkét elemet a világosságából
      csinált maszkon keresztül festjük a napló papírszínére.
      A pixelpontos befoglaló dobozok mérve, nem becsülve. */
import sharp from 'sharp';

const SRC = 'articles/pictures/';
const PHOTO =
  SRC + 'lorier-watches-founders-lauren-lorenzo-ortega-interview-luxe-digital-2x1-1280.avif';
const LOGO = SRC + 'ad11a78a-a130-46c2-ab5d-97fdb75074ae-3591168409.webp';
const OUT = 'src/content/posts/_images/lorier-alapitok-lockup.jpg';

const W = 1600;
const H = 700; // 16:7 — ez a cikk élén lévő kép aránya

/* 1) A fotó a teljes vászonra, felülre igazítva, hogy a fejek biztosan bent
      legyenek. A telítettséget visszavesszük, hogy ne üsse a meleg palettát. */
const photo = await sharp(PHOTO)
  .resize(W, H, { fit: 'cover', position: 'top' })
  .modulate({ saturation: 0.72, brightness: 1.02 })
  .toBuffer();

/* 2) Meleg fátyol, lágy sarokelsötétítés, és egy alulról felúszó sáv a
      wordmarknak. A színek ugyanazok, mint a „lámpa le" nézetben. */
const overlay = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="foot" x1="0" y1="0" x2="0" y2="1">
      <stop offset="28%"  stop-color="#13100B" stop-opacity="0"/>
      <stop offset="52%"  stop-color="#13100B" stop-opacity="0.30"/>
      <stop offset="70%"  stop-color="#13100B" stop-opacity="0.68"/>
      <stop offset="86%"  stop-color="#13100B" stop-opacity="0.88"/>
      <stop offset="100%" stop-color="#13100B" stop-opacity="0.94"/>
    </linearGradient>
    <radialGradient id="corners" cx="50%" cy="42%" r="78%">
      <stop offset="55%"  stop-color="#13100B" stop-opacity="0"/>
      <stop offset="100%" stop-color="#13100B" stop-opacity="0.38"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#8F6E31" opacity="0.15"/>
  <rect width="${W}" height="${H}" fill="url(#corners)"/>
  <rect width="${W}" height="${H}" fill="url(#foot)"/>
</svg>`);

/* 3) A logó két eleme. Előbb megmérjük, hol vannak pontosan a sötét pixelek —
      a fájl körül van margó, és a chevron nem középen ül képpontra pontosan. */
async function darkBounds(fromRow, toRow) {
  const { data, info } = await sharp(LOGO).greyscale().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width,
    maxX = -1,
    minY = info.height,
    maxY = -1;
  for (let y = fromRow; y < toRow; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[y * info.width + x] < 128) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

const logoMeta = await sharp(LOGO).metadata();
const split = Math.round(logoMeta.height * 0.6);
const chevBox = await darkBounds(0, split);
const wordBox = await darkBounds(split, logoMeta.height);

/* A felirat szélessége adja a lockup léptékét; a chevron mérete és a köztük
   lévő térköz az eredeti logó arányaiból jön. */
const WORD_W = 260;
const scale = WORD_W / wordBox.width;
const WORD_H = Math.round(wordBox.height * scale);
const CHEV_W = Math.round(chevBox.width * scale);
const CHEV_H = Math.round(chevBox.height * scale);
const GAP = Math.round((wordBox.top - (chevBox.top + chevBox.height)) * scale);

async function paint(box, w, h) {
  const mask = await sharp(LOGO)
    .extract(box)
    .resize(w, h)
    .greyscale()
    .negate() // a fekete rajzból lesz a látható rész
    .linear(1.35, -22) // a szürke szélek tisztítása
    .toColourspace('b-w')
    .raw()
    .toBuffer();
  return sharp({ create: { width: w, height: h, channels: 3, background: '#E6DAC1' } })
    .joinChannel(mask, { raw: { width: w, height: h, channels: 1 } })
    .png()
    .toBuffer();
}

const chevron = await paint(chevBox, CHEV_W, CHEV_H);
const wordmark = await paint(wordBox, WORD_W, WORD_H);

const BOTTOM = 44;
const wordTop = H - BOTTOM - WORD_H;
const chevTop = wordTop - GAP - CHEV_H;

await sharp(photo)
  .composite([
    { input: overlay, top: 0, left: 0 },
    { input: chevron, top: chevTop, left: Math.round((W - CHEV_W) / 2) },
    { input: wordmark, top: wordTop, left: Math.round((W - WORD_W) / 2) },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(OUT);

console.log('kész:', OUT, `${W}x${H}`);
console.log(`lockup: chevron ${CHEV_W}x${CHEV_H}, térköz ${GAP}, felirat ${WORD_W}x${WORD_H}`);
