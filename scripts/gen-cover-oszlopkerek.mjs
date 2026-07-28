/* A Szerkezet-cikk nyitóképe a saját SVG-ábrából.
   Futtatás: node scripts/gen-cover-oszlopkerek.mjs
   Kimenet:  src/content/posts/_images/oszlopkerek-nyitokep.jpg

   Az ábra 1600x840-es (1,90), a cikkfej viszont 16:7-et vár, a listakártyák
   pedig 4:3-ban, középre vágnak. Az eredetin a szerkezet jobbra ül, így a
   kártyán levágódna a jobb széle. Ezért a rajzot bitképre rendereljük, a
   szerkezetet megmérjük, és a napló sötét alapjára tesszük — vízszintesen
   középre, hogy minden vágást túléljen. */
import sharp from 'sharp';

const SRC = 'articles/pictures/oszlopkerek-hero.svg';
const OUT = 'src/content/posts/_images/oszlopkerek-nyitokep.jpg';

const W = 1600;
const H = 700;
const DISC_H = 610; // a szerkezet magassága a kész képen

/* 1) Nagy felbontású render, hogy a kicsinyítés után is éles maradjon. */
const RENDER_W = 2600;
const render = await sharp(SRC, { density: 300 })
  .resize({ width: RENDER_W })
  .png()
  .toBuffer();

/* 2) A szerkezet befoglalója: a sötét háttértől elváló, világosabb képpontok. */
const { data, info } = await sharp(render).greyscale().raw().toBuffer({ resolveWithObject: true });
let minX = info.width, maxX = -1, minY = info.height, maxY = -1;
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    if (data[y * info.width + x] > 64) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
}
const bw = maxX - minX + 1;
const bh = maxY - minY + 1;
console.log(`szerkezet a renderen: ${bw}x${bh} @ (${minX}, ${minY})`);

/* 3) A szerkezet kivágva, és a téglalap sarkai lágyan elfogyasztva.
      A rajz saját háttere sötétebb árnyalat, mint a mi alapunk, ezért a
      kivágás négy sarka éles élként látszana. Egy lágy szélű körmaszk ezt
      eltünteti: a korong benne marad, a sarkokban lévő háttér elhalványul. */
/* Előbb átlátszó kerettel bővítjük a kivágást. Enélkül a lágyítás magába a
   sárgaréz gyűrűbe harapna bele, hiszen az pont a befoglaló szélén van. */
const PAD = 60;
const cropped = await sharp(render)
  .extract({ left: minX, top: minY, width: bw, height: bh })
  .resize({ height: DISC_H })
  .extend({
    top: PAD, bottom: PAD, left: PAD, right: PAD,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();
const cm = await sharp(cropped).metadata();

/* A maszk maga is átlátszósággal készül, és `dest-in` keveréssel megy rá:
   a joinChannel ezen a láncon nem érvényesült, a kép végig átlátszatlan maradt. */
const feather = await sharp(
  Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${cm.width}" height="${cm.height}">
  <defs>
    <radialGradient id="soft" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="88%"  stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="98%"  stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${cm.width}" height="${cm.height}" fill="url(#soft)"/>
</svg>`)
)
  .png()
  .toBuffer();

const disc = await sharp(cropped)
  .composite([{ input: feather, blend: 'dest-in' }])
  .png()
  .toBuffer();
const dm = cm;

/* 4) A napló sötét alapja, ugyanazzal a meleg derengéssel, mint az ábrán —
      így a rajz széle nem válik el a háttértől. */
const base = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="34%" r="86%">
      <stop offset="0%"   stop-color="#1e180e"/>
      <stop offset="52%"  stop-color="#130e07"/>
      <stop offset="100%" stop-color="#060402"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="46%" r="46%">
      <stop offset="0%"   stop-color="#8F6E31" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#8F6E31" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
</svg>`);

await sharp(base)
  .composite([
    {
      /* A kibovitett kep magasabb a vaszonnal; a felesleg atlatszo, ezert
         egyszeruen a fuggoleges kozeppontra igazitjuk. */
      input: await sharp(disc)
        .extract({ left: 0, top: Math.round((dm.height - H) / 2), width: dm.width, height: H })
        .png()
        .toBuffer(),
      top: 0,
      left: Math.round(W / 2 - dm.width / 2),
    },
  ])
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(OUT);

console.log('kész:', OUT, `${W}x${H}`);
