/* Lume hero és cikkképek a Rolex Day-Date történetéhez.
   Minden óraelem eredeti Rolex-fotó. A script csak vág, hátteret választ le,
   méretez és tipográfiát helyez el, generált óraalkatrészt nem készít. */
import sharp from 'sharp';

const DIR = 'src/content/posts/_images/';
const WATCH = DIR + 'rolex-day-date-current-original-v2.png';
const FIRST = DIR + 'rolex-day-date-1956-original.jpg';
const AD = DIR + 'rolex-presidents-watch-ad-1967-original.jpg';

const PAPER = '#E6DAC1';
const INK = '#2A231D';
const BRASS = '#8F6E31';
const QUIET = '#6A5E50';

const texture = (width, height) => Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <filter id="paper" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="2" seed="18"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="table" tableValues="0 0.075"/></feComponentTransfer>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="${PAPER}"/>
  <rect width="100%" height="100%" filter="url(#paper)" opacity="0.42"/>
</svg>`);

function artwork(width, height, card = false) {
  const titleX = card ? 86 : 180;
  const labelY = card ? 250 : 330;
  const titleY = card ? 405 : 515;
  const titleSize = card ? 88 : 126;
  const lineY = card ? 610 : 760;
  return Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <g fill="none" stroke="${BRASS}" stroke-width="2" opacity="0.18">
      <circle cx="${card ? 290 : 560}" cy="${card ? 430 : 540}" r="${card ? 265 : 390}"/>
      <circle cx="${card ? 290 : 560}" cy="${card ? 430 : 540}" r="${card ? 190 : 280}"/>
      <circle cx="${card ? 290 : 560}" cy="${card ? 430 : 540}" r="${card ? 78 : 120}"/>
      <path d="M ${card ? 25 : 70} ${card ? 740 : 930} C ${card ? 235 : 460} ${card ? 590 : 710}, ${card ? 420 : 880} ${card ? 840 : 970}, ${card ? 650 : 1380} ${card ? 675 : 850}"/>
    </g>
    <text x="${titleX}" y="${labelY}" fill="${QUIET}" font-family="IBM Plex Mono, monospace" font-size="${card ? 24 : 31}" letter-spacing="10">EREDET • ORIGINS</text>
    <text x="${titleX}" y="${titleY}" fill="${INK}" font-family="Fraunces, Georgia, serif" font-size="${titleSize}" letter-spacing="5">ROLEX</text>
    <text x="${titleX}" y="${titleY + titleSize * 0.95}" fill="${INK}" font-family="Fraunces, Georgia, serif" font-size="${Math.round(titleSize * 0.78)}" letter-spacing="3">DAY-DATE</text>
    <line x1="${titleX}" y1="${lineY}" x2="${card ? 560 : 1180}" y2="${lineY}" stroke="${BRASS}" stroke-width="2"/>
    <circle cx="${card ? 325 : 680}" cy="${lineY}" r="7" fill="${BRASS}"/>
    <text x="${titleX}" y="${lineY + (card ? 66 : 76)}" fill="${QUIET}" font-family="IBM Plex Mono, monospace" font-size="${card ? 23 : 29}" letter-spacing="9">1956 • GENEVA</text>
  </svg>`);
}

async function trimmedWatch(height) {
  return sharp(WATCH).trim({ threshold: 1 }).resize({ height }).png().toBuffer();
}

async function makeCover(out, width, height, card = false) {
  const watchHeight = card ? 835 : 1020;
  const watch = await trimmedWatch(watchHeight);
  const meta = await sharp(watch).metadata();
  const left = card ? width - meta.width - 25 : width - meta.width - 120;
  const top = Math.round((height - meta.height) / 2);
  await sharp(texture(width, height))
    .composite([
      { input: artwork(width, height, card), left: 0, top: 0 },
      { input: watch, left, top },
    ])
    .webp({ quality: 92, smartSubsample: true })
    .toFile(out);
}

await makeCover(DIR + 'rolex-president-hero-v1.webp', 2400, 1080, false);
await makeCover(DIR + 'rolex-president-card-v1.webp', 1200, 900, true);

// Az első Day-Date archív fotóján a nagy üres fekete mezőből csak annyi marad,
// amennyi keretet ad az órának. Maga a fotó változatlan.
await sharp(FIRST)
  .extract({ left: 0, top: 920, width: 1560, height: 2180 })
  .webp({ quality: 92, smartSubsample: true })
  .toFile(DIR + 'rolex-day-date-1956-detail-v1.webp');

// A korabeli reklám teljes szövege és kompozíciója látható marad.
await sharp(AD)
  .resize({ width: 1800 })
  .webp({ quality: 92, smartSubsample: true })
  .toFile(DIR + 'rolex-presidents-watch-ad-1967-v1.webp');

// A mai Day-Date gyárilag átlátszó termékképéből levesszük az üres margót.
await sharp(WATCH)
  .trim({ threshold: 1 })
  .resize({ height: 1700 })
  .extend({ top: 70, bottom: 70, left: 90, right: 90, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(DIR + 'rolex-day-date-current-transparent-v1.png');

console.log('Kész: Rolex Day-Date hero, kártyakép és három cikkkép.');
