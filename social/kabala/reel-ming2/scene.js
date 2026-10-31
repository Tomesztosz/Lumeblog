// Lume Reel: „The Borrower" — Ten-Ten előadja a MING-sztori meglepő tényét.
// window.frame(t) rajzol egy kockát; a hangok a hang/timeline.json-ból jönnek (setTL).

const RW = 1080, RH = 1920;
let TL = null, X = null; // X: a timeline-ból számolt időpontok

const BX = 100, BY = 250, BW = 880, BH = 650; // a tábla

function prepare(tl) {
  TL = tl;
  const ws = id => lineStart(TL, id), we = id => lineEnd(TL, id), wt = (id, w) => wordTime(TL, id, w);
  X = {
    walkEnd: 2.45,
    slides: [[0, 'title'], [ws('a1') - .1, 'design'], [ws('a2') + .2, 'salary'], [ws('a3') - .05, 'borrowed'], [ws('a5') - .1, 'chart'], [ws('a6') - .05, 'camera'], [ws('a7') + .1, 'calendar']],
    flash: wt('a4', 'photographed'),
    close: [ws('a5') + 1.75, we('a5') + .15],   // közeli a poénra
    click: wt('a8', 'off') + .05,
    end: TL.end,
  };
  X.blinksT = blinkTimes(7, X.end, [ws('a3') - .2, X.close[0] + .5]);
  X.blinksD = blinkTimes(21, X.end);
  // a besétálás: hely és fázis
  X.walkX = t => lerp(-300, 320, seg(t, 0, X.walkEnd, k => 1 - Math.pow(1 - k, 1.7)));
  X.phase = t => (X.walkX(Math.min(t, X.walkEnd)) + 300) / 200;
  X.steps = stepTimes(X.phase, 0, X.walkEnd - .05);
  window.EVENTS = { steps: X.steps, slides: X.slides.slice(1).map(s => s[0]), click: X.click, flash: X.flash, end: X.end };
}

// ---------- kis rajzok a diákhoz ----------
const INK = K.ink;
function watchIcon(x, y, r, o = {}) {
  const shape = o.shape || 'round';
  let caseS;
  if (shape === 'cushion') caseS = E('rect', { x: -r, y: -r, width: 2 * r, height: 2 * r, rx: r * .55, fill: 'url(#brassG)', stroke: INK, 'stroke-width': 4 });
  else if (shape === 'square') caseS = E('rect', { x: -r * .9, y: -r, width: 1.8 * r, height: 2 * r, rx: r * .18, fill: 'url(#steelG)', stroke: INK, 'stroke-width': 4 });
  else caseS = E('circle', { r, fill: 'url(#steelG)', stroke: INK, 'stroke-width': 4 });
  const strap = E('rect', { x: -r * .42, y: -r * 1.75, width: r * .84, height: r * 3.5, rx: r * .2, fill: o.strap || '#6e4b2e', stroke: INK, 'stroke-width': 4 });
  const dialR = shape === 'square' ? r * .74 : r * .78;
  const dial = shape === 'square' ? E('rect', { x: -dialR, y: -dialR * 1.1, width: 2 * dialR, height: 2.2 * dialR, rx: r * .1, fill: o.dial || K.paperHi, stroke: INK, 'stroke-width': 2.5 })
    : E('circle', { r: dialR, fill: o.dial || K.paperHi, stroke: INK, 'stroke-width': 2.5 });
  let ticks = '';
  for (let i = 0; i < 12; i++) { const [a, b] = [P(dialR * .78, i * 30), P(dialR * .92, i * 30)];
    ticks += E('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: o.dial ? K.paper : INK, 'stroke-width': i % 3 ? 2 : 3.5 }); }
  const hands = E('line', { x1: 0, y1: 0, x2: P(dialR * .5, o.h ?? 300)[0], y2: P(dialR * .5, o.h ?? 300)[1], stroke: o.dial ? K.paper : INK, 'stroke-width': 4, 'stroke-linecap': 'round' }) +
    E('line', { x1: 0, y1: 0, x2: P(dialR * .72, o.m ?? 60)[0], y2: P(dialR * .72, o.m ?? 60)[1], stroke: o.dial ? K.paper : INK, 'stroke-width': 3, 'stroke-linecap': 'round' }) +
    E('circle', { r: 3.5, fill: o.dial ? K.paper : INK });
  return G({ transform: T(x, y, o.rot || 0, o.s || 1) }, strap, caseS, dial, ticks, hands,
    E('rect', { x: r * .92, y: -r * .14, width: r * .2, height: r * .28, rx: 3, fill: 'url(#brassG)', stroke: INK, 'stroke-width': 2.5 }));
}
const H1 = (x, y, s, fs = 76, o = {}) => txt(x, y, s, { 'font-family': 'Fraunces', 'font-size': fs, 'font-weight': 600, fill: INK, style: "font-variation-settings:'opsz' 144, 'SOFT' 60", 'letter-spacing': -1.5, ...o });
const MONO = (x, y, s, fs = 24, o = {}) => txt(x, y, s, { 'font-family': 'Mono', 'font-weight': 500, 'font-size': fs, fill: INK, 'letter-spacing': 3, ...o });
function tag(x, y, rot, label, k = 1) {
  return G({ transform: T(x, y, rot) },
    E('path', { d: 'M0 -46 Q-4 -20 0 0', fill: 'none', stroke: INK, 'stroke-width': 2 }),
    E('path', { d: 'M-18 0 L18 0 L52 26 L52 92 Q52 98 46 98 L-46 98 Q-52 98 -52 92 L-52 26 Z', fill: '#fbf3d9', stroke: INK, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }),
    E('circle', { cy: 14, r: 5, fill: K.paper, stroke: INK, 'stroke-width': 2.5 }),
    MONO(0, 52, 'RETURN', 14, { 'text-anchor': 'middle' }), txt(0, 82, label, { 'font-family': 'Fraunces', 'font-style': 'italic', 'font-weight': 600, 'font-size': 24, 'text-anchor': 'middle', fill: K.red }));
}

const SLIDES = {
  title: (k) => G({},
    MONO(440, 200, 'A LUME STORY', 24, { 'text-anchor': 'middle', opacity: .6 }),
    H1(440, 340, 'The Borrower', 118, { 'text-anchor': 'middle' }),
    E('line', { x1: 330, y1: 400, x2: 550, y2: 400, stroke: K.brassMid, 'stroke-width': 4 }),
    txt(440, 470, 'how a photographer ended up making watches', { 'font-family': 'Fraunces', 'font-style': 'italic', 'font-size': 32, 'text-anchor': 'middle', fill: INK, opacity: .8 })),
  design: (k, t) => {
    const d = seg(t, X.slides[1][0], X.slides[1][0] + 1.4);
    const C = 2 * Math.PI * 190;
    return G({},
      E('line', { x1: 70, y1: 330, x2: 530, y2: 330, stroke: '#7d9cb6', 'stroke-width': 2, 'stroke-dasharray': '10 8' }),
      E('line', { x1: 300, y1: 100, x2: 300, y2: 570, stroke: '#7d9cb6', 'stroke-width': 2, 'stroke-dasharray': '10 8' }),
      E('circle', { cx: 300, cy: 330, r: 190, fill: 'none', stroke: INK, 'stroke-width': 4, 'stroke-dasharray': `${C * d} ${C}`, transform: 'rotate(-90 300 330)' }),
      E('circle', { cx: 300, cy: 330, r: 150, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: d }),
      ...[...Array(12)].map((_, i) => { const [a, b] = [P(128, i * 30), P(148, i * 30)];
        return E('line', { x1: 300 + a[0], y1: 330 + a[1], x2: 300 + b[0], y2: 330 + b[1], stroke: INK, 'stroke-width': 3, opacity: clamp(d * 12 - i) }); }),
      E('path', { d: 'M232 136 L222 96 L378 96 L368 136 M232 524 L222 564 L378 564 L368 524', fill: 'none', stroke: INK, 'stroke-width': 3, opacity: d }),
      // körző
      G({ transform: `rotate(${-30 + 60 * d} 300 330)` }, E('path', { d: 'M300 330 L300 150', stroke: K.brassMid, 'stroke-width': 7, 'stroke-linecap': 'round' }),
        E('circle', { cx: 300, cy: 150, r: 12, fill: K.brassHi, stroke: INK, 'stroke-width': 3 })),
      H1(610, 300, 'He', 84), H1(610, 390, 'designs', 84), H1(610, 480, 'watches.', 84),
      MONO(612, 540, 'MING THEIN', 22, { opacity: .55 }));
  },
  salary: (k, t) => {
    const m = (t - X.slides[2][0]);
    const mx = 690 + Math.sin(m * 3) * 40 + m * 18, my = 210 - m * 22 + Math.sin(m * 7) * 10;
    return G({},
      watchIcon(230, 330, 120, { h: 305, m: 55 }),
      G({ transform: 'translate(330 190) rotate(12)' }, E('path', { d: 'M-20 0 L20 0 L66 34 L66 200 Q66 210 56 210 L-56 210 Q-66 210 -66 200 L-66 34 Z', fill: '#fbf3d9', stroke: INK, 'stroke-width': 4 }),
        E('circle', { cy: 18, r: 7, fill: K.paper, stroke: INK, 'stroke-width': 3 }), txt(0, 120, '£££££', { 'font-family': 'Mono', 'font-weight': 500, 'font-size': 30, 'text-anchor': 'middle', fill: K.red }),
        txt(0, 160, '££££', { 'font-family': 'Mono', 'font-weight': 500, 'font-size': 30, 'text-anchor': 'middle', fill: K.red })),
      // pénztárca és a kirepülő moly
      G({ transform: 'translate(660 400)' },
        E('path', { d: 'M-120 -40 L120 -40 L120 90 Q120 100 110 100 L-110 100 Q-120 100 -120 90 Z', fill: '#7a5534', stroke: INK, 'stroke-width': 4.5 }),
        E('path', { d: 'M-120 -40 L0 -110 L120 -40', fill: '#8c6440', stroke: INK, 'stroke-width': 4.5, 'stroke-linejoin': 'round' }),
        E('path', { d: 'M-104 -26 L104 -26', stroke: '#c9a677', 'stroke-width': 2.5, 'stroke-dasharray': '6 6' }),
        MONO(0, 160, "AN INTERN'S SALARY", 22, { 'text-anchor': 'middle', opacity: .7 })),
      G({ transform: T(mx, my, Math.sin(m * 9) * 10) },
        E('ellipse', { cx: -14, cy: -6, rx: 18, ry: 11 * Math.abs(Math.sin(m * 14)) + 3, fill: '#b9ad94', stroke: INK, 'stroke-width': 2.5 }),
        E('ellipse', { cx: 14, cy: -6, rx: 18, ry: 11 * Math.abs(Math.sin(m * 14)) + 3, fill: '#b9ad94', stroke: INK, 'stroke-width': 2.5 }),
        E('ellipse', { rx: 6, ry: 13, fill: '#8f8470', stroke: INK, 'stroke-width': 2.5 }),
        E('path', { d: 'M-2 -12 q-6 -10 -12 -12 M2 -12 q6 -10 12 -12', fill: 'none', stroke: INK, 'stroke-width': 2 })));
  },
  borrowed: (k, t) => {
    const fl = clamp(1 - Math.abs(t - X.flash - .05) / .18);
    const sw = s => Math.sin((t - X.slides[3][0]) * 2.2 + s) * 5;
    return G({},
      H1(440, 110, 'Borrowed.', 80, { 'text-anchor': 'middle' }),
      watchIcon(170, 330, 82, { shape: 'round', rot: sw(0) * .4, h: 290, m: 70 }), tag(170, 470, sw(1), 'Friday'),
      watchIcon(440, 330, 82, { shape: 'cushion', rot: sw(2) * .4, dial: '#2f3a4a', h: 320, m: 90 }), tag(440, 470, sw(3), 'Monday'),
      watchIcon(710, 330, 82, { shape: 'square', rot: sw(4) * .4, strap: '#2f2f2f', h: 10, m: 150 }), tag(710, 470, sw(5), 'ASAP!'),
      fl > 0 ? E('rect', { width: BW, height: BH, fill: '#fff', opacity: fl * .9 }) : '');
  },
  chart: (k, t) => {
    const g = seg(t, X.slides[4][0] + .3, X.slides[4][0] + 1.3, easeOut);
    const g2 = seg(t, X.slides[4][0] + 1.0, X.slides[4][0] + 1.6, easeOut);
    return G({},
      H1(70, 110, 'Cost of a collection', 60),
      E('line', { x1: 90, y1: 560, x2: 800, y2: 560, stroke: INK, 'stroke-width': 4 }),
      E('rect', { x: 170, y: 560 - 350 * g, width: 200, height: 350 * g, fill: K.red, stroke: INK, 'stroke-width': 4 }),
      MONO(270, 600, 'BUYING', 24, { 'text-anchor': 'middle' }),
      txt(270, 545 - 350 * g, '£££££££', { 'font-family': 'Mono', 'font-weight': 500, 'font-size': 26, 'text-anchor': 'middle', fill: K.red, opacity: g }),
      E('rect', { x: 520, y: 556 - 4 * g2, width: 200, height: 4 * g2 + 4, fill: K.lume, stroke: INK, 'stroke-width': 4 }),
      MONO(620, 600, 'BORROWING', 24, { 'text-anchor': 'middle' }),
      txt(620, 520, '£0*', { 'font-family': 'Fraunces', 'font-weight': 700, 'font-size': 64, 'text-anchor': 'middle', fill: INK, opacity: g2 }),
      MONO(800, 630, '*RETURNS REQUIRED', 16, { 'text-anchor': 'end', opacity: .6 * g2 }));
  },
  camera: (k, t) => G({},
    G({ transform: 'translate(270 330)' },
      E('rect', { x: -150, y: -110, width: 300, height: 230, rx: 18, fill: '#2b2e28', stroke: INK, 'stroke-width': 5 }),
      E('rect', { x: -130, y: -170, width: 260, height: 64, rx: 8, fill: '#3a3e36', stroke: INK, 'stroke-width': 5 }),
      E('path', { d: 'M-110 -170 L-90 -230 L90 -230 L110 -170', fill: '#454a40', stroke: INK, 'stroke-width': 5, 'stroke-linejoin': 'round' }),
      E('circle', { cy: 10, r: 92, fill: '#1c1f1a', stroke: INK, 'stroke-width': 5 }),
      E('circle', { cy: 10, r: 70, fill: '#33434f', stroke: '#c9ccc4', 'stroke-width': 6 }),
      E('circle', { cy: 10, r: 42, fill: '#1a2530' }),
      E('path', { d: 'M-34 -14 A44 44 0 0 1 4 -36', fill: 'none', stroke: '#fff', 'stroke-width': 8, opacity: .5, 'stroke-linecap': 'round' }),
      E('rect', { x: 110, y: -150, width: 30, height: 18, rx: 4, fill: K.brassHi, stroke: INK, 'stroke-width': 3 })),
    MONO(520, 230, 'CHIEF OF STRATEGY', 26, { opacity: .7 }),
    H1(520, 330, 'Hasselblad', 86),
    E('line', { x1: 522, y1: 370, x2: 760, y2: 370, stroke: K.brassMid, 'stroke-width': 4 }),
    txt(522, 430, 'and an adviser to', { 'font-family': 'Fraunces', 'font-style': 'italic', 'font-size': 32, fill: INK, opacity: .8 }),
    txt(522, 472, "DJI's board", { 'font-family': 'Fraunces', 'font-style': 'italic', 'font-size': 32, fill: INK, opacity: .8 })),
  calendar: (k, t) => {
    const tear = seg(t, X.slides[6][0] + .5, X.slides[6][0] + 1.3);
    return G({},
      G({ transform: 'translate(250 330)' },
        E('rect', { x: -150, y: -190, width: 300, height: 380, rx: 14, fill: K.paperHi, stroke: INK, 'stroke-width': 5 }),
        E('rect', { x: -150, y: -190, width: 300, height: 90, rx: 14, fill: K.red, stroke: INK, 'stroke-width': 5 }),
        MONO(0, -132, 'AUGUST', 34, { 'text-anchor': 'middle', fill: K.paperHi }),
        H1(0, 90, '8', 220, { 'text-anchor': 'middle' }),
        MONO(0, 160, '2017', 30, { 'text-anchor': 'middle', opacity: .7 }),
        tear < 1 ? G({ transform: `translate(${tear * 260} ${-tear * 120}) rotate(${tear * 40})`, opacity: 1 - tear },
          E('rect', { x: -150, y: -100, width: 300, height: 290, fill: K.paperHi, stroke: INK, 'stroke-width': 4 }),
          H1(0, 90, '7', 220, { 'text-anchor': 'middle', opacity: .35 })) : ''),
      MONO(472, 210, 'FIRST WATCH', 26, { opacity: .7 }),
      H1(470, 320, 'MING 17.01', 74),
      E('line', { x1: 472, y1: 360, x2: 800, y2: 360, stroke: K.brassMid, 'stroke-width': 4 }),
      txt(472, 420, 'two dial colours', { 'font-family': 'Fraunces', 'font-style': 'italic', 'font-size': 34, fill: INK, opacity: .8 }),
      txt(472, 466, '150 planned of each', { 'font-family': 'Fraunces', 'font-style': 'italic', 'font-size': 34, fill: INK, opacity: .8 }));
  },
};

function board(t, night) {
  // állvány a tábla mögött
  let s = G({},
    E('path', { d: `M${BX + 200} ${BY + BH} L${BX + 120} 1660 M${BX + BW - 200} ${BY + BH} L${BX + BW - 120} 1660`, stroke: night ? '#2a2f27' : '#7a5c3a', 'stroke-width': 22, 'stroke-linecap': 'round' }),
    E('rect', { x: BX - 20, y: BY + BH + 2, width: BW + 40, height: 22, rx: 6, fill: night ? '#2f342c' : 'url(#brassG)', stroke: night ? '#454d40' : INK, 'stroke-width': 4 }));
  s += E('rect', { x: BX - 16, y: BY - 16, width: BW + 32, height: BH + 32, rx: 12, fill: night ? '#30352d' : 'url(#brassG)', stroke: night ? '#454d40' : INK, 'stroke-width': 5 });
  const cid = id('board');
  let inner = E('rect', { width: BW, height: BH, fill: night ? '#181c16' : K.paperHi });
  if (!night) {
    // a diák közötti váltás: az új balról tolja ki a régit
    let cur = 0;
    for (let i = 0; i < X.slides.length; i++) if (t >= X.slides[i][0]) cur = i;
    const t0 = X.slides[cur][0], k = cur === 0 ? 1 : seg(t, t0, t0 + .42, easeOut);
    if (k < 1 && cur > 0) inner += G({ transform: `translate(${-k * BW} 0)` }, SLIDES[X.slides[cur - 1][1]](1, t));
    inner += G({ transform: `translate(${(1 - k) * BW} 0)` }, SLIDES[X.slides[cur][1]](k, t));
    inner += MONO(BW - 26, BH - 22, `${String(cur).padStart(2, '0')} / 06`, 16, { 'text-anchor': 'end', opacity: cur ? .45 : 0 });
  } else {
    const g = seg(t, X.click + .25, X.click + .9);
    inner += G({ opacity: g, filter: 'url(#glow)' },
      H1(BW / 2, 250, 'MING.', 130, { 'text-anchor': 'middle', fill: K.lume }),
      txt(BW / 2, 340, 'When a photographer designs a watch', { 'font-family': 'Fraunces', 'font-style': 'italic', 'font-size': 40, 'text-anchor': 'middle', fill: K.lume }),
      MONO(BW / 2, 470, 'LUMEJOURNAL.COM', 34, { 'text-anchor': 'middle', fill: K.lume, 'letter-spacing': 8 }));
  }
  s += E('clipPath', { id: cid }, E('rect', { width: BW, height: BH, rx: 4 }));
  s += G({ transform: `translate(${BX} ${BY})`, 'clip-path': `url(#${cid})` }, inner);
  if (!night) s += E('path', { d: `M${BX + 30} ${BY + 40} L${BX + 230} ${BY + 40}`, stroke: '#fff', 'stroke-width': 0 });
  return s;
}

function stage(night) {
  if (night) return E('rect', { x: -400, y: -400, width: RW + 800, height: RH + 800, fill: '#1f251d' }) + E('rect', { width: RW, height: RH, fill: 'url(#vigN)' });
  let s = E('rect', { x: -400, y: -400, width: RW + 800, height: RH + 800, fill: '#ebe4d2' });
  for (let x = -300; x < RW + 400; x += 120) s += E('line', { x1: x, y1: 0, x2: x, y2: 1640, stroke: '#d9d0ba', 'stroke-width': 3 });
  s += E('ellipse', { cx: 540, cy: 620, rx: 700, ry: 640, fill: 'url(#warmL)', opacity: .55 });
  s += E('rect', { x: -400, y: 1640, width: RW + 800, height: RH - 1240, fill: '#cbbd9e' }) + E('rect', { x: -400, y: 1620, width: RW + 800, height: 24, fill: '#b9a77f', stroke: INK, 'stroke-opacity': .25, 'stroke-width': 2 });
  return s;
}

function wallSwitch(t, night) {
  const on = t < X.click;
  return G({ transform: 'translate(118 1340)' },
    E('rect', { x: -34, y: -54, width: 68, height: 108, rx: 10, fill: night ? '#2c3229' : K.paperHi, stroke: night ? '#4f574a' : INK, 'stroke-width': 4 }),
    E('rect', { x: -10, y: on ? -32 : 2, width: 20, height: 30, rx: 5, fill: night ? K.lume : K.brassHi, stroke: night ? 'none' : INK, 'stroke-width': 3, filter: night ? 'url(#glow)' : null }));
}

// ---------- feliratok ----------
function captions(t, night, cy) {
  let line = null;
  for (const l of TL.lines) if (t >= l.start - .05 && t < l.start + l.dur + .3) line = l;
  if (!line) return '';
  const chunks = []; let cur = [];
  for (const w of line.words) { cur.push(w); if (/[.?!]$/.test(w[0])) { chunks.push(cur); cur = []; } }
  if (cur.length) chunks.push(cur);
  let ch = chunks[0];
  for (const c of chunks) if (t >= c[0][1] - .05) ch = c;
  const rows = []; let row = [], len = 0;
  for (const w of ch) { if (len + w[0].length > 26 && row.length) { rows.push(row); row = []; len = 0; } row.push(w); len += w[0].length + 1; }
  rows.push(row);
  const isDot = line.who === 'dot';
  const base = night ? K.paper : INK;
  const empC = night ? K.lume : K.red;
  const y0 = cy - (rows.length - 1) * 36;
  let s = '';
  rows.forEach((r, i) => {
    const tsp = r.map(([w, wt, emp]) => E('tspan', { 'fill-opacity': t >= wt ? 1 : .3, fill: emp ? empC : (isDot ? (night ? K.lume : '#5f7a1e') : base) }, w.replace(/&/g, '&amp;'))).join(' ');
    s += E('text', { x: RW / 2, y: y0 + i * 68, 'text-anchor': 'middle', 'font-family': 'Hanken', 'font-weight': 800, 'font-size': 56, 'letter-spacing': -.5,
      stroke: night ? '#141812' : '#f4efe2', 'stroke-width': 10, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }, tsp);
  });
  return G({ opacity: clamp((t - line.start + .05) / .1) }, s);
}

// ---------- Ten-Ten koreográfia ----------
const ARM = {
  restL: { p: [[-123, 72], [-205, 160], [-150, 186]], g: 'fist', gr: 150 },
  restR: { p: [[123, 72], [205, 160], [150, 186]], g: 'fist', gr: 30 },
  hipL: { p: [[-123, 72], [-245, 130], [-150, 140]], g: 'fist', gr: 165 },
  hipR: { p: [[123, 72], [245, 130], [150, 140]], g: 'fist', gr: 15 },
  presentR: { p: [[123, 72], [245, 70], [300, -40]], g: 'open', gr: -42 },
  pointUpR: { p: [[123, 72], [250, 40], [250, -150]], g: 'point', gr: -75 },
  fingerR: { p: [[123, 72], [210, 30], [190, -100]], g: 'point', gr: -95 },
  shrugL: { p: [[-123, 72], [-250, 70], [-255, -30]], g: 'open', gr: -150 },
  shrugR: { p: [[123, 72], [250, 70], [255, -30]], g: 'open', gr: -30 },
  tadaL: { p: [[-123, 72], [-250, 0], [-270, -150]], g: 'spread', gr: -115 },
  tadaR: { p: [[123, 72], [250, 0], [270, -150]], g: 'spread', gr: -65 },
  chinR: { p: [[123, 72], [180, 170], [70, 112]], g: 'fist', gr: 200 },
  switchL: { p: [[-123, 72], [-200, -10], [-178, -132]], g: 'point', gr: -110 },
};
function ttState(t) {
  const ws = id => lineStart(TL, id), wt = (id, w) => wordTime(TL, id, w);
  const walking = t < X.walkEnd + .1;
  const amp = 1 - seg(t, X.walkEnd - .35, X.walkEnd + .05);
  const wk = ttWalk(X.phase(Math.min(t, X.walkEnd)), amp, 1.05);
  // a megállás utáni visszalengés
  const settle = t > X.walkEnd - .05 ? Math.exp(-(t - X.walkEnd) * 5) * Math.sin((t - X.walkEnd) * 12) * -5 : 0;
  // kar-sávok
  const R = track(t, [[0, ARM.restR], [ws('a1') + .2, ARM.presentR, .4, easeBack], [wt('a2', 'way') - .15, ARM.shrugR, .35, easeBack], [ws('b1'), ARM.restR, .4],
    [wt('a3', 'borrowed') - .2, ARM.fingerR, .3, easeBack], [ws('a4') + .3, ARM.presentR, .45], [ws('a5') + .2, ARM.chinR, .45], [ws('a6') + .3, ARM.pointUpR, .4, easeBack],
    [wt('a7', 'own') - .25, ARM.tadaR, .35, easeBack], [ws('b2') + .1, ARM.hipR, .45], [ws('a9') - .2, ARM.presentR, .4, easeBack]]);
  const L = track(t, [[0, ARM.restL], [wt('a2', 'way') - .15, ARM.shrugL, .35, easeBack], [ws('b1'), ARM.hipL, .4], [ws('a6'), ARM.restL, .4],
    [wt('a7', 'own') - .25, ARM.tadaL, .35, easeBack], [ws('b2') + .1, ARM.hipL, .45], [X.click - .45, ARM.switchL, .35, easeBack], [X.click + .5, ARM.hipL, .5]]);
  // járás közben lendülő karok
  const sw = wk.swing * 26;
  const swing = (a, d) => ({ ...a, p: [a.p[0], [a.p[1][0] + d * .5, a.p[1][1]], [a.p[2][0] + d, a.p[2][1] - Math.abs(d) * .3]] });
  // bajusz (óra:perc): 10:10 önelégült, 8:20 lesújtott, 9:15 meglepett
  const hands = track(t, [[0, [305, 55]], [wt('a2', 'salary') - .4, [245, 115], .35, easeBack], [ws('b1') + .3, [270, 90], .25, easeBack], [wt('a3', 'borrowed') - .2, [305, 55], .3, easeBack],
    [ws('b2') + .3, [248, 112], .35, easeBack], [ws('a8') - .2, [305, 55], .3, easeBack]]);
  // tekintet
  const toBoard = [.6, -.75], toCam = [.05, 0], toDot = [.75, -.8];
  const look = track(t, [[0, [.85, 0]], [X.walkEnd, toCam, .1], [ws('a1') + .3, toBoard, .08], [ws('a1') + 1.4, toCam, .08], [ws('b1') - .1, toDot, .08], [ws('a3'), toCam, .08],
    [ws('a4') + .2, toBoard, .08], [ws('a4') + 2.6, toCam, .08], [ws('a5'), toBoard, .08], [X.close[0] - .1, toCam, .08], [ws('a6') + .2, toBoard, .08], [ws('a6') + 2.6, toCam, .08],
    [ws('a7') + .3, toBoard, .08], [ws('a7') + 3.2, toCam, .08], [ws('b2'), toDot, .08], [ws('a8') - .3, toCam, .08], [X.click - .4, [-.8, .2], .08], [X.click + .3, toCam, .1]], .08);
  const sac = saccade(t, 3);
  const mood = track(t, [[0, 0], [X.close[0], 1, .3], [X.close[1], 0, .4], [ws('b2') + .3, 2, .3], [ws('a8'), 1, .3]]); // 1 = önelégült, 2 = szkeptikus
  return { wk, settle, R: walking ? swing(R, sw) : R, L: walking ? swing(L, -sw) : L, hands, look: [look[0] + sac[0], look[1] + sac[1]], mood };
}

function drawTenTen(t, night) {
  const st = ttState(t);
  const sp = speechAt(TL, t, 'tenten');
  const emp = emphasis(TL, t, 'tenten');
  const x = X.walkX(Math.min(t, X.walkEnd)), y0 = 1500;
  const breath = Math.sin(t * 2 * Math.PI / 3.4);
  const y = y0 + st.wk.bob - (sp ? sp.o * 4 : 0) + emp * 5;
  const rot = st.wk.rot + st.settle + Math.sin(t * 1.1) * 1.1 + emp * 2.2 * Math.sin(t * 3);
  const bl = blinkAmount(t, X.blinksT);
  const smug = st.mood > .5 && st.mood < 1.5 ? 1 : 0, skept = st.mood > 1.5 ? 1 : 0;
  const lid = Math.max(bl, .1 + .26 * smug + .2 * skept);
  const raise = 4 + emp * 14;
  const eyes = { look: st.look, lid, tilt: smug ? -6 : skept ? 8 : 0,
    L: { brow: { raise: smug ? 16 : skept ? -2 : raise, ang: smug ? -10 : skept ? 14 : -4, curve: 8 } },
    R: { brow: { raise: smug ? 0 : skept ? 12 : raise, ang: smug ? 8 : skept ? -6 : -4, curve: 8 } } };
  const mouth = sp ? { o: sp.o, w: sp.w } : smug ? 'smirk' : skept ? 'flat' : t < X.walkEnd ? 'smirk' : 'date';
  // a bóbita késve követi a dőlést
  const quiff = -st.wk.rot * 2.2 + -st.settle * 2 + Math.sin(t * 2.3) * 3 + Math.sin((t - .15) * 6.3) * 6 * st.wk.swing;
  return E('g', { transform: `translate(${x} ${y}) scale(1 ${1 + breath * .006}) translate(${-x} ${-y})` },
    tenten({ night, x, y, s: 1.05, rot, hands: st.hands, chrono: Math.sin(t * 7) * 6 * (sp ? sp.o : 0) + emp * 10, quiff,
      eyes, mouth: mouth === 'flat' ? 'smirk' : mouth, arms: [st.L, st.R], legs: st.wk.legs, blush: !night && smug }));
}

// ---------- Dot ----------
function drawDot(t, night) {
  const ws = id => lineStart(TL, id);
  const sp = speechAt(TL, t, 'dot');
  // diaváltáskor felugrik és rácsap a keretre
  let hop = 0;
  for (const s of X.slides.slice(1)) { const d = t - (s[0] - .25); if (d > 0 && d < .45) hop = Math.max(hop, Math.sin(Math.PI * d / .45)); }
  const big = (t >= ws('b1') - .15 && t < ws('b1') + .9) ? Math.sin(Math.PI * clamp((t - ws('b1') + .15) / 1.05)) : 0;
  const laugh = (t > X.close[1] - 1.4 && t < X.close[1] + .6) ? Math.abs(Math.sin(t * 16)) : 0;
  const lean = seg(t, ws('b2') - .2, ws('b2') + .2) * (1 - seg(t, ws('b2') + 1.4, ws('b2') + 1.8));
  const glow = night ? seg(t, X.click, X.click + .5) : 0;
  const x = 860 - lean * 70, base = BY - 16 - 50;
  const y = base - hop * 60 - big * 110 - laugh * 10 + lean * 30 + Math.sin(t * 2.4) * 2;
  const swingL = Math.sin(t * 3.1) * 14, swingR = Math.sin(t * 3.1 + 1.2) * 14;
  const sitting = hop < .2 && big < .2;
  const limbs = sitting ? {
    legL: [[-20, 56], [-30 + swingL * .3, 90], [-30 + swingL, 118]], legR: [[20, 56], [30 + swingR * .3, 90], [30 + swingR, 118]],
    armL: lean ? [[-56, 0], [-80, 40], [-50, 70]] : [[-58, 12], [-90, 40], [-96, 66]],
    armR: lean ? [[56, 0], [80, 40], [50, 70]] : [[58, 12], [90, 40], [96, 66]],
  } : { armL: [[-56, -10], [-96, -60], [-100, -118]], armR: [[56, -10], [96, -60], [104, -120]], legL: [[-22, 56], [-40, 92], [-50, 124]], legR: [[22, 56], [40, 92], [50, 124]] };
  const bl = blinkAmount(t, X.blinksD) > .5;
  const lookAt = t >= X.walkEnd && t < ws('b1') - .1 ? [-.6, .6] : t >= ws('b1') - .1 && t < ws('a3') + .5 ? [-.8, .5] : (t >= X.close[0] && t < X.close[1]) ? [-.7, .7] : [-.3, .5];
  return dot({ night: night && glow > 0, x, y, s: .8 + big * .15, rot: Math.sin(t * 1.9) * 5 - lean * 12, shadow: false, cheeks: true,
    eyes: laugh ? 'happy' : big || lean ? 'wide' : bl ? 'sleepy' : 'open', look: lookAt,
    mouth: sp ? sp.o : laugh ? 'open' : lean ? 'o' : 'smile', limbs, squash: [1 + hop * .06 - big * .04, 1 - hop * .06 + big * .06] });
}

// ---------- kamera ----------
function camera(t) {
  // [nagyítás, fókusz x, fókusz y]
  const c = track(t, [[0, [1.04, 560, 960]], [X.walkEnd, [1, 540, 960], 1.6], [X.close[0], [1.75, 335, 1330], .35, easeOut], [X.close[1], [1, 540, 960], .45],
    [lineStart(TL, 'b2'), [1.08, 640, 900], .6], [X.click - .2, [1, 540, 960], .4]]);
  const dx = Math.sin(t * .7) * 3 + Math.sin(t * 1.3) * 2, dy = Math.cos(t * .6) * 3;
  return { z: c[0], tf: `translate(${RW / 2 + dx} ${RH / 2 + dy}) scale(${c[0]}) translate(${-c[1]} ${-c[2]})` };
}

function frame(t) {
  uid = 0;
  const night = t >= X.click;
  const cam = camera(t);
  let world = stage(night) + board(t, night) + wallSwitch(t, night) + drawTenTen(t, night) + drawDot(t, night);
  let s = defs() + G({ transform: cam.tf }, world);
  if (!night) s += E('rect', { width: RW, height: RH, fill: 'url(#vigD)' });
  const capY = cam.z > 1.3 ? 1640 : 1075;
  s += captions(t, night, capY);
  const fl = t >= X.click && t < X.click + .16 ? 1 - (t - X.click) / .16 : 0;
  if (fl > 0) s += E('rect', { width: RW, height: RH, fill: '#000', opacity: fl * .85 });
  const fadeIn = clamp(t / .25);
  if (fadeIn < 1) s += E('rect', { width: RW, height: RH, fill: '#000', opacity: 1 - fadeIn });
  s += grain(RW, RH, night ? .45 : .3);
  document.getElementById('s').innerHTML = s;
}

window.frame = frame;
window.setTL = j => { prepare(j); return window.EVENTS; };
