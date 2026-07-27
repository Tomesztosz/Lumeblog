import sharp from 'sharp';

/* Peremről induló kitöltés: csak az a világos pixel lesz átlátszó, ami a
   képszélről elérhető. Így a számlap és a karkötő világos részei megmaradnak. */
export async function cutout(path, tol = 26, bgColor = null) {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  /* Alapból a bal felső képpont a háttér. Ha a kép egy kivágás, és ott már a
     tárgy van, a hívó megadhatja a háttérszínt explicit módon. */
  const bg = bgColor ?? [data[0], data[1], data[2]];
  const isBg = (i) =>
    Math.abs(data[i] - bg[0]) < tol &&
    Math.abs(data[i + 1] - bg[1]) < tol &&
    Math.abs(data[i + 2] - bg[2]) < tol;

  const out = new Uint8Array(W * H); // 1 = háttér
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const p = y * W + x;
    if (out[p]) return;
    if (!isBg(p * C)) return;
    out[p] = 1;
    stack.push(x, y);
  };
  for (let x = 0; x < W; x++) {
    push(x, 0);
    push(x, H - 1);
  }
  for (let y = 0; y < H; y++) {
    push(0, y);
    push(W - 1, y);
  }
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  const alpha = Buffer.alloc(W * H);
  for (let p = 0; p < W * H; p++) alpha[p] = out[p] ? 0 : 255;

  /* Lágyítás, hogy ne legyen fűrészes a perem.
     Az elmosás sRGB-be emelné a maszkot, ezért vissza kell kényszeríteni
     egy csatornára — különben háromszor akkora puffert kapnánk, és
     egycsatornásként visszaolvasva kevert szemét lenne az alfa. */
  const { data: soft, info: softInfo } = await sharp(alpha, {
    raw: { width: W, height: H, channels: 1 },
  })
    .blur(0.7)
    .toColourspace('b-w')
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (softInfo.channels !== 1) throw new Error('a maszk nem egycsatornás: ' + softInfo.channels);

  const rgb = Buffer.alloc(W * H * 3);
  for (let p = 0; p < W * H; p++) {
    rgb[p * 3] = data[p * C];
    rgb[p * 3 + 1] = data[p * C + 1];
    rgb[p * 3 + 2] = data[p * C + 2];
  }

  return sharp(rgb, { raw: { width: W, height: H, channels: 3 } })
    .joinChannel(soft, { raw: { width: W, height: H, channels: 1 } })
    .png()
    .toBuffer();
}

/* Diagnosztika: mekkora a tényleges tartalom mind a négy képen */
if (process.argv[1]?.endsWith('_cut.mjs')) {
  for (const n of ['Neptune', 'Astra', 'Falcon', 'Hyperion']) {
    const buf = await cutout(`articles/pictures/${n}.webp`);
    const t = await sharp(buf).trim({ threshold: 1 }).toBuffer();
    const m = await sharp(t).metadata();
    await sharp(t).toFile(`articles/pictures/_cut-${n}.png`);
    console.log(n, '→ tartalom', m.width + 'x' + m.height, 'arány', (m.width / m.height).toFixed(2));
  }
}
