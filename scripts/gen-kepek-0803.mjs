/* A 2026.08.03-i cikkek képei.
   Futtatás: node scripts/gen-kepek-0803.mjs

   Háromféle kezelés, a forrás állapota szerint:

   - `alpha`: a fájl már kivágott, átlátszó háttérrel érkezett. Csak a
     tartalomra vágjuk és teszünk köré egy kis levegőt.
   - `cutout`: stúdió-fehér vagy világosszürke háttér, amit a képszélről
     induló kitöltés visz le — ugyanaz, mint a korábbi termékfotóknál.
   - `photo`: valódi fénykép (Hold, portré, tárlós felvétel). Ezt nem
     vágjuk ki, csak méretre hozzuk; a háttér a kép része. */
import sharp from 'sharp';
import { cutout } from './_cut.mjs';

const SRC = 'articles/pictures/';
const OUT = 'src/content/posts/_images/';
/* A cikk oszlopa 647 képpont, az álló képek magassága 620-ban van maximálva —
   egy portré kép tehát kb. 415 képpont szélesen jelenik meg. A duplázott,
   retina-méret 900 körül van; ennél nagyobb PNG-t hordozni felesleges, és a
   repót is hizlalja. A fényképek maradhatnak nagyobbak, mert JPEG-ként
   töredék helyet foglalnak. */
const MAX_W_PHOTO = 1600;
const MAX_W_ALPHA = 900;

const JOBS = [
  // Furlan Marri
  { in: 'mr.grey_forrás_gphg.org.jpg', out: 'furlan-marri-mr-grey.png', mode: 'cutout', tol: 65 },
  { in: 'disco_volante_forrás_furlanmarri.com', out: 'furlan-marri-disco-volante.png', mode: 'alpha' },
  { in: 'secular_calendar_forrás_furlanmarri.com', out: 'furlan-marri-secular-perpetual.png', mode: 'alpha' },
  { in: 'Area_51_forrás_everywatch.com', out: 'furlan-marri-area51-tantal.jpg', mode: 'photo' },

  // Omega Speedmaster
  { in: '1957_omega speedmaster;_forrás_ fratellowatches.com', out: 'speedmaster-ck2915.jpg', mode: 'photo' },
  { in: 'buzz_aldrin_forrás_nasa.gov.webp', out: 'apollo11-aldrin.jpg', mode: 'photo' },
  { in: 'snoopy_forrás_chrono_24.jpg', out: 'speedmaster-snoopy.jpg', mode: 'photo' },
  { in: 'omega_speedmaster_today_forrás_omegawatches.com', out: 'speedmaster-moonwatch-ma.png', mode: 'alpha' },
  { in: 'moonswatch_forrás_timeandtidewatches.com', out: 'moonswatch.jpg', mode: 'photo' },

  // Grand Seiko Spring Drive
  { in: 'Yoshikazu-Akahane_forrás_grandseikogs9club.com', out: 'akahane.jpg', mode: 'photo' },
  { in: 'grand_seiko_9R_Spring_drive_forrás_grand-seiko.com.png', out: 'spring-drive-9r.png', mode: 'alpha' },
  { in: 'grand_seiko_snowflake_forrás_arlingtonwatchworks.com', out: 'grand-seiko-snowflake.jpg', mode: 'photo' },
];

/** A látható tartalom befoglalója egy átlátszó hátterű képen. */
async function alphaBox(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width, maxX = -1, minY = info.height, maxY = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 24) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function trimAndPad(buf, outPath) {
  const box = await alphaBox(buf);
  const pad = Math.round(Math.max(box.width, box.height) * 0.04);
  let img = sharp(buf).extract(box).extend({
    top: pad, bottom: pad, left: pad, right: pad,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });
  const w = box.width + 2 * pad;
  if (w > MAX_W_ALPHA) img = img.resize({ width: MAX_W_ALPHA });
  await img.png({ compressionLevel: 9 }).toFile(outPath);
  const fw = Math.min(w, MAX_W_ALPHA);
  return `${fw}x${Math.round(fw * (box.height + 2 * pad) / w)}`;
}

for (const job of JOBS) {
  const path = SRC + job.in;
  const target = OUT + job.out;

  if (job.mode === 'alpha') {
    const size = await trimAndPad(await sharp(path).png().toBuffer(), target);
    console.log(`${job.out.padEnd(38)} átlátszó, vágva  ${size}`);
  } else if (job.mode === 'cutout') {
    const cut = await cutout(path, job.tol);
    const size = await trimAndPad(cut, target);
    console.log(`${job.out.padEnd(38)} háttér levágva   ${size}`);
  } else {
    const m = await sharp(path).metadata();
    const w = Math.min(m.width, MAX_W_PHOTO);
    await sharp(path).resize({ width: w }).jpeg({ quality: 88, mozjpeg: true }).toFile(target);
    console.log(`${job.out.padEnd(38)} fénykép          ${w}x${Math.round(w * m.height / m.width)}`);
  }
}
