/* A Lorier-cikk nyitóképe: az alapítókról készült fotó + a márka wordmarkja.
   Futtatás: node scripts/gen-cover-lorier.mjs
   Kimenet:  src/content/posts/_images/lorier-alapitok.jpg

   Két döntés, amit érdemes tudni, ha valaki újra hozzányúl:

   1. A wordmark VÍZSZINTESEN KÖZÉPRE kerül. A listakártyák 4:3-ban, középre
      vágva mutatják ugyanezt a képet, és egy félbevágott wordmark hibának
      látszik, nem szándéknak. Ami középen van, az minden arányban bent marad.

   2. Az álló logóból csak a feliratos rész kell. A teljes, chevronos lockup
      a képen a férfi mellkasára esne, és pólófeliratnak nézne ki; a keskeny
      wordmark egy alsó sávban viszont megül. */
import sharp from 'sharp';

const SRC = 'articles/pictures/';
const PHOTO =
  SRC + 'lorier-watches-founders-lauren-lorenzo-ortega-interview-luxe-digital-2x1-1280.avif';
const LOGO = SRC + 'ad11a78a-a130-46c2-ab5d-97fdb75074ae-3591168409.webp';
const OUT = 'src/content/posts/_images/lorier-alapitok.jpg';

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
      <stop offset="34%"  stop-color="#13100B" stop-opacity="0"/>
      <stop offset="62%"  stop-color="#13100B" stop-opacity="0.40"/>
      <stop offset="84%"  stop-color="#13100B" stop-opacity="0.78"/>
      <stop offset="100%" stop-color="#13100B" stop-opacity="0.90"/>
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

/* 3) A wordmark. A logó feketén, fehér alapon érkezik, alfa nélkül — ezért a
      világosságából csinálunk maszkot, és azon keresztül festjük be a napló
      papírszínére. */
const logoMeta = await sharp(LOGO).metadata();
const wordmark = await sharp(LOGO)
  .extract({
    left: 0,
    top: Math.round(logoMeta.height * 0.66),
    width: logoMeta.width,
    height: Math.round(logoMeta.height * 0.34),
  })
  .toBuffer();

const wmMeta = await sharp(wordmark).metadata();
const LW = 300;
const LH = Math.round((wmMeta.height / wmMeta.width) * LW);

const mask = await sharp(wordmark)
  .resize(LW, LH)
  .greyscale()
  .negate() // a fekete rajzból lesz a látható rész
  .linear(1.35, -22) // a szürke szélek tisztítása
  .toColourspace('b-w')
  .raw()
  .toBuffer();

const logo = await sharp({
  create: { width: LW, height: LH, channels: 3, background: '#E6DAC1' },
})
  .joinChannel(mask, { raw: { width: LW, height: LH, channels: 1 } })
  .png()
  .toBuffer();

await sharp(photo)
  .composite([
    { input: overlay, top: 0, left: 0 },
    { input: logo, top: H - LH - 46, left: Math.round((W - LW) / 2) },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(OUT);

console.log('kész:', OUT, `${W}x${H}`);
