import sharp from 'sharp';

/* Peremről induló kitöltés: csak az a világos pixel lesz átlátszó, ami a
   képszélről elérhető. Így a számlap és a karkötő világos részei megmaradnak. */
export async function cutout(path, tol = 26, bgColor = null, keepLargestOnly = false, keskenyites = 3, feherKuszob = 0) {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  /* Alapból a bal felső képpont a háttér. Ha a kép egy kivágás, és ott már a
     tárgy van, a hívó megadhatja a háttérszínt explicit módon. */
  const bg = bgColor ?? [data[0], data[1], data[2]];
  /* Háttér az, ami a megadott háttérszínhez elég közel van. Ha a hívó megad
     egy fehér-küszöböt, akkor a nagyon világos képpontok is annak számítanak —
     ez a sötét alapra rajzolt VILÁGOS MINTA eltávolítására kell. Mivel a
     kitöltés a kép széléről indul, a tárgy BELSEJÉBEN lévő világos részek
     (számlapindexek, fényes tokrészletek) nem érhetők el, tehát megmaradnak. */
  const isBg = (i) => {
    if (
      Math.abs(data[i] - bg[0]) < tol &&
      Math.abs(data[i + 1] - bg[1]) < tol &&
      Math.abs(data[i + 2] - bg[2]) < tol
    ) return true;
    if (feherKuszob > 0) {
      return data[i] >= feherKuszob && data[i + 1] >= feherKuszob && data[i + 2] >= feherKuszob;
    }
    return false;
  };

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

  /* Ha a háttéren minta van (pl. világos vonalak sötét alapon), a peremről
     induló kitöltés körbefolyja azokat, és külön szigetekként ottmaradnának.
     Ilyenkor csak a legnagyobb összefüggő alakzatot tartjuk meg — az a tárgy.
     A minta egyes darabkái viszont hozzáérhetnek a tárgyhoz, és így vele együtt
     bent maradnának. Ezért előbb SZŰKÍTÜNK: a vékony hidak elszakadnak, a
     foszlányok külön alakzattá válnak és kiesnek. A szűkített maradékból aztán
     visszaépítjük az eredeti formát, hogy a tárgy ne fogyjon el a széleinél. */
  if (keepLargestOnly) {
    const eredeti = out.slice(); // 1 = háttér, az eredeti kitöltés szerint

    /* Szűkítés: a háttér terjeszkedik befelé `keskenyites` képpontnyit. */
    let szukitett = out.slice();
    for (let i = 0; i < keskenyites; i++) {
      const kov = szukitett.slice();
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const p = y * W + x;
          if (szukitett[p]) continue;
          if (
            (x > 0 && szukitett[p - 1]) || (x < W - 1 && szukitett[p + 1]) ||
            (y > 0 && szukitett[p - W]) || (y < H - 1 && szukitett[p + W])
          ) kov[p] = 1;
        }
      }
      szukitett = kov;
    }

    /* A legnagyobb összefüggő alakzat a szűkített képen. */
    const label = new Int32Array(W * H).fill(-1);
    let best = -1, bestSize = 0, next = 0;
    const q = new Int32Array(W * H);
    for (let start = 0; start < W * H; start++) {
      if (szukitett[start] || label[start] !== -1) continue;
      const id = next++;
      let head = 0, tail = 0, size = 0;
      q[tail++] = start;
      label[start] = id;
      while (head < tail) {
        const p = q[head++];
        size++;
        const x = p % W, y = (p / W) | 0;
        if (x > 0 && !szukitett[p - 1] && label[p - 1] === -1) { label[p - 1] = id; q[tail++] = p - 1; }
        if (x < W - 1 && !szukitett[p + 1] && label[p + 1] === -1) { label[p + 1] = id; q[tail++] = p + 1; }
        if (y > 0 && !szukitett[p - W] && label[p - W] === -1) { label[p - W] = id; q[tail++] = p - W; }
        if (y < H - 1 && !szukitett[p + W] && label[p + W] === -1) { label[p + W] = id; q[tail++] = p + W; }
      }
      if (size > bestSize) { bestSize = size; best = id; }
    }

    /* Visszaépítés: a megtartott magból kinövünk, de csak oda, ahol az EREDETI
       kitöltés szerint is tárgy volt. Így a forma pontosan visszaáll, csak a
       leszakadt foszlányok maradnak ki. */
    out.fill(1);
    let head = 0, tail = 0;
    for (let p = 0; p < W * H; p++) {
      if (!szukitett[p] && label[p] === best) { out[p] = 0; q[tail++] = p; }
    }
    while (head < tail) {
      const p = q[head++];
      const x = p % W, y = (p / W) | 0;
      if (x > 0 && out[p - 1] && !eredeti[p - 1]) { out[p - 1] = 0; q[tail++] = p - 1; }
      if (x < W - 1 && out[p + 1] && !eredeti[p + 1]) { out[p + 1] = 0; q[tail++] = p + 1; }
      if (y > 0 && out[p - W] && !eredeti[p - W]) { out[p - W] = 0; q[tail++] = p - W; }
      if (y < H - 1 && out[p + W] && !eredeti[p + W]) { out[p + W] = 0; q[tail++] = p + W; }
    }
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
