/* Ikonok és OG-kép generálása a public/ mappába.
   Futtatás: node scripts/gen-icons.mjs
   Csak akkor kell újra lefuttatni, ha a favicon.svg vagy a márkajel változik. */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const OUT = new URL('../public/', import.meta.url).pathname.replace(/^\//, '');

/* 1) apple-touch-icon — a favicon.svg 180x180-ban */
const favicon = readFileSync(`${OUT}favicon.svg`);
await sharp(favicon, { density: 400 }).resize(180, 180).png().toFile(`${OUT}apple-touch-icon.png`);

/* 2) OG-kép 1200x630 — sötét számlap, sárgaréz gyűrű, világító index-koszorú.
   A szöveg Georgiával megy: a sharp nem éri el a Fraunces-t, de a hangulat stimmel. */
const indices = Array.from({ length: 12 }, (_, i) => {
  const major = i % 3 === 0;
  const w = major ? 9 : 5;
  const h = major ? 26 : 18;
  return `<rect x="${200 - w / 2}" y="40" width="${w}" height="${h}" rx="${w / 2}"
            fill="#CDE9A0" opacity="${major ? 0.95 : 0.7}"
            transform="rotate(${i * 30} 200 200)"/>`;
}).join('\n');

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="warm" cx="72%" cy="18%" r="70%">
      <stop offset="0%" stop-color="#CDE9A0" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#13100B" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="lumeGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#CDE9A0" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#CDE9A0" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="#13100B"/>
  <rect width="1200" height="630" fill="url(#warm)"/>

  <g transform="translate(700, 115)">
    <circle cx="200" cy="200" r="250" fill="url(#lumeGlow)"/>
    <circle cx="200" cy="200" r="192" fill="none" stroke="#8A6C34" stroke-width="7"/>
    <circle cx="200" cy="200" r="180" fill="none" stroke="#6E5528" stroke-width="1.5" opacity="0.6"/>
    <circle cx="200" cy="200" r="176" fill="#0E0B07"/>
    ${indices}
    <rect x="196" y="112" width="8" height="98" rx="4" fill="#CDE9A0"
          transform="rotate(310 200 200)"/>
    <rect x="197.5" y="66" width="5" height="146" rx="2.5" fill="#CDE9A0"
          transform="rotate(50 200 200)"/>
    <circle cx="200" cy="200" r="7" fill="#8A6C34"/>
  </g>

  <g transform="translate(96, 236)">
    <circle cx="6" cy="-52" r="7" fill="#CDE9A0"/>
    <text x="30" y="-44" font-family="Georgia, serif" font-size="30"
          letter-spacing="9" fill="#CDE9A0">LUME</text>
    <text x="0" y="46" font-family="Georgia, serif" font-size="62" fill="#B6AB94">Tanulj meg</text>
    <text x="0" y="120" font-family="Georgia, serif" font-size="62" font-style="italic"
          fill="#CDE9A0">órát olvasni.</text>
    <text x="0" y="188" font-family="Helvetica, Arial, sans-serif" font-size="24"
          fill="#7E7461">Órás napló — magyarul és angolul.</text>
  </g>
</svg>`;

await sharp(Buffer.from(og)).png().toFile(`${OUT}og-image.png`);

console.log('kész: apple-touch-icon.png, og-image.png');
