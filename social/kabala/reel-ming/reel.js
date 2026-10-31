// Lume Reel, 1. pilot: Ten-Ten és Dot a MING 37.02 lebegő indexeiről.
// window.frame(t) egy képkockát rajzol; az időzítés a hang/timeline.json-ból jön.

const RW = 1080, RH = 1920, FPS = 30, DUR = 18.6;
let TL = null;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const seg = (t, a, b) => ease(clamp((t - a) / (b - a)));
const pop = (t, a, d = .45) => { const k = clamp((t - a) / d); if (k <= 0) return 0; if (k >= 1) return 1;
  return 1 + 2.4 * Math.pow(k - 1, 3) + 1.4 * Math.pow(k - 1, 2); };
const mix = (A, B, k) => A.map((v, i) => lerp(v, B[i], k));

function speaking(t, who) {
  for (const l of TL.lines) if (l.who === who && t >= l.start && t < l.start + l.dur) {
    const i = Math.floor((t - l.start) * FPS); return l.env[Math.min(i, l.env.length - 1)] || 0;
  }
  return 0;
}
const blink = (t, at) => at.some(b => t >= b && t < b + .12);

// ---- a magyarázó számlap: lume-csatornák a zafírban, kék mutatók alatta, sötét lap legalul ----
const POLAR = '#f2f6ff', BLUE = '#7fb4ff';
function layerTicks(r, glow = 1) {
  let s = '';
  for (let i = 0; i < 60; i++) { const big = i % 5 === 0; const [a, b] = [P(r - (big ? 44 : 22), i * 6), P(r - 6, i * 6)];
    s += E('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: POLAR, 'stroke-width': big ? 9 : 4, 'stroke-linecap': 'round' }); }
  return G({ filter: 'url(#glow)', opacity: glow }, s);
}
function layerHands(r, glow = 1) {
  const h = (a, L, w) => G({ transform: `rotate(${a})` }, E('path', { d: `M0 ${-L} L${w} -10 L0 18 L${-w} -10 Z`, fill: BLUE }));
  return G({ filter: 'url(#glow)', opacity: glow }, h(305, r * .52, 16), h(60, r * .74, 13), E('circle', { r: 9, fill: BLUE }));
}
function diagram(t) {
  const appear = pop(t, 2.85, .55);
  if (appear <= 0) return '';
  const out = 1 - seg(t, 13.55, 14.05);
  if (out <= 0) return '';
  const r = 250, cx = 450, cy = 690;
  const iso = seg(t, 5.0, 5.9);          // laposból térbe
  const sep = seg(t, 5.6, 6.7);          // a rétegek szétválnak
  const sy = lerp(1, .38, iso);
  const wob = Math.sin(t * 2.1) * (1 - iso);  // lapos nézetben billeg: a lebegés
  const par = wob * 16;
  const gap = 175 * sep;
  const hi = seg(t, 8.3, 8.9) * (1 - seg(t, 13.4, 13.8));  // a zafír kiemelése
  const dimDial = seg(t, 6.5, 7.0);
  const flash = t > 12.3 && t < 13.5 ? .35 + .65 * Math.abs(Math.sin((t - 12.3) * 5)) : 1;
  const L = (dy, body) => G({ transform: `translate(${cx} ${cy + dy}) scale(1 ${sy}) rotate(${wob * 4})` }, body);
  const dial = E('circle', { r, fill: '#151913', stroke: '#3b4436', 'stroke-width': 6 }) +
    E('circle', { r: r * .97, fill: 'none', stroke: '#2a3027', 'stroke-width': 2 });
  const glass = E('circle', { r: r + 8, fill: '#cfe6ff', 'fill-opacity': .06 + .1 * hi, stroke: '#cfe6ff', 'stroke-opacity': .25 + .5 * hi, 'stroke-width': 4 }) +
    E('path', { d: `M${-r * .7} ${-r * .45} A${r * .85} ${r * .85} 0 0 1 ${-r * .2} ${-r * .8}`, fill: 'none', stroke: '#fff', 'stroke-opacity': .22, 'stroke-width': 10, 'stroke-linecap': 'round' });
  let s = '';
  s += E('ellipse', { cx, cy: cy + 40, rx: 520, ry: 420, fill: 'url(#haloL)', opacity: .5 + .3 * hi });
  // oldalsó vezetővonalak a térbeli nézetben
  if (sep > 0) for (const sx of [-1, 1]) s += E('line', { x1: cx + sx * (r + 8), y1: cy - gap, x2: cx + sx * r, y2: cy + gap, stroke: '#cfe6ff', 'stroke-opacity': .18 * sep, 'stroke-width': 2, 'stroke-dasharray': '6 10' });
  s += L(gap, G({ opacity: 1 - .45 * dimDial }, dial));
  s += L(0 + (1 - iso) * 0, G({ transform: `translate(${-par * .2} 0)` }, layerHands(r, 1 - .25 * hi)));
  s += L(-gap, G({ transform: `translate(${par} 0)` }, glass + layerTicks(r, flash * (1 + .0 * hi))));
  // címkék
  const lab = (y, txt1, txt2, k, col) => k <= 0 ? '' : G({ opacity: k, transform: `translate(${(1 - k) * 30} 0)` },
    E('line', { x1: cx + r + 18, y1: y, x2: cx + r + 52, y2: y, stroke: col, 'stroke-width': 3 }),
    txt(cx + r + 66, y + 10, txt1, { 'font-family': 'Mono', 'font-weight': 500, 'font-size': 34, fill: col, 'letter-spacing': 3 }),
    txt(cx + r + 66, y + 48, txt2, { 'font-family': 'Mono', 'font-size': 24, fill: col, opacity: .75 }));
  s += lab(cy - gap - 20, 'SAPPHIRE', 'lume cut in below', seg(t, 8.4, 8.9), POLAR);
  s += lab(cy - 10, 'HANDS', 'pass beneath', seg(t, 6.9, 7.3), BLUE);
  s += lab(cy + gap - 10, 'DIAL', 'nothing printed', seg(t, 6.6, 7.0), '#9aa592');
  return G({ opacity: out, transform: `translate(${cx} ${cy}) scale(${appear}) translate(${-cx} ${-cy})` }, s);
}

// ---- feliratok: a kimondott szavak teljes fényben, a többi halványan ----
function captions(t, night) {
  let line = null;
  for (const l of TL.lines) if (t >= l.start - .05 && t < l.start + l.dur + .35) line = l;
  if (!line) return '';
  // mondatonként mutatjuk
  const chunks = []; let cur = [];
  for (const w of line.words) { cur.push(w); if (/[.?!]$/.test(w[0])) { chunks.push(cur); cur = []; } }
  if (cur.length) chunks.push(cur);
  let ch = chunks[0];
  for (const c of chunks) if (t >= c[0][1] - .05) ch = c;
  const rows = []; let row = [], len = 0;
  for (const w of ch) { if (len + w[0].length > 22 && row.length) { rows.push(row); row = []; len = 0; } row.push(w); len += w[0].length + 1; }
  rows.push(row);
  const isDot = line.who === 'dot';
  const base = night ? (isDot ? K.lume : K.paper) : K.ink;
  const cy0 = t < TL.click ? 560 : t >= 13.8 ? 930 : 1170;
  const y0 = cy0 - (rows.length - 1) * 38;
  let s = '';
  rows.forEach((r, i) => {
    const tsp = r.map(([w, wt]) => E('tspan', { 'fill-opacity': t >= wt ? 1 : .32 }, w.replace(/&/g, '&amp;'))).join(' ');
    s += E('text', { x: RW / 2, y: y0 + i * 76, 'text-anchor': 'middle', 'font-family': 'Hanken', 'font-weight': 800, 'font-size': 64, fill: base,
      filter: night && isDot ? 'url(#glow)' : null, 'letter-spacing': -.5 }, tsp);
  });
  const k = clamp((t - line.start + .05) / .12);
  return G({ opacity: k }, s);
}

function frame(t) {
  uid = 0;
  const night = t >= TL.click;
  const pull = seg(t, 1.45, 1.8);
  let s = defs();
  if (!night) {
    s += bgDay(RW, RH, 1560);
  } else {
    s += E('rect', { width: RW, height: RH, fill: 'url(#vigN)' });
  }
  // zsinór a lámpakapcsolóhoz
  const ttPos0 = [520, 1400, 1.5];
  const ttPos1 = [300, 1590, 1.02];
  const ttPos2 = [540, 1420, 1.3];
  let tp = mix(ttPos0, ttPos1, seg(t, 2.55, 3.35));
  tp = mix(tp, ttPos2, seg(t, 13.6, 14.4));
  const bob = Math.sin(t * 5.2) * 3 + speaking(t, 'tenten') * 6;
  const [tx, ty, ts] = [tp[0], tp[1] - bob, tp[2]];
  const cordOn = 1 - seg(t, 2.2, 2.7);
  const handY = -200 + pull * 46;
  if (cordOn > 0) {
    const bx = tx + 196 * ts, by = ty + (handY - 4) * ts;
    s += G({ opacity: cordOn }, E('path', { d: `M${bx + 6} 0 Q${bx - 10} ${by * .55} ${bx} ${by}`, fill: 'none', stroke: night ? '#4f574a' : K.ink, 'stroke-width': 3 }),
      E('circle', { cx: bx, cy: by + 8, r: 13, fill: night ? K.lume : K.brassHi, stroke: night ? 'none' : K.ink, 'stroke-width': 3, filter: night ? 'url(#glow)' : null }));
  }
  s += diagram(t);

  // ---- Ten-Ten ----
  const sp = speaking(t, 'tenten');
  const explaining = t >= 4.9 && t < 11.5;
  const lookDot = t >= 11.8 && t < 13.7;
  const look = lookDot ? [.75, .2] : explaining ? [.55, -.75] : t < 2.5 ? [.25, 0] : [.1, 0];
  const isBlink = blink(t, [3.9, 7.6, 10.4, 15.6]);
  const smug = t >= 13.9 || (t >= 1.85 && t < 2.5);
  const eyes = isBlink ? { shape: 'closed' } : {
    look, lid: smug ? .34 : .12, tilt: smug ? -6 : 0,
    L: { brow: { raise: smug ? 14 : 6 + sp * 8, ang: smug ? -10 : -4, curve: 9 } },
    R: { brow: { raise: smug ? 0 : 6 + sp * 8, ang: smug ? 8 : -4 } },
  };
  let arms;
  const lowL = { p: [[-123, 72], [-240, 140], [-150, 150]], g: 'fist', gr: 160 };
  if (t < 2.3) arms = [lowL, { p: [[123, 72], [250, 30], [196, handY + 20]], g: 'fist', gr: -95 }];
  else if (explaining) arms = [lowL, { p: [[123, 72], [250, 40], [260, -150]], g: 'point', gr: -62 }];
  else if (t >= 13.9) arms = [lowL, { p: [[123, 72], [240, 120], [230, 20]], g: 'open', gr: -70 }];
  else arms = [lowL, { p: [[123, 72], [230, 150], [160, 160]], g: 'fist', gr: 200 }];
  const hands = t >= 6.4 && t < 7.4 ? [270, 90] : [305, 55];
  s += tenten({ night, x: tx, y: ty, s: ts, rot: Math.sin(t * 1.7) * 1.5, hands, chrono: Math.sin(t * 9) * 8 * sp,
    eyes, mouth: sp > 0 ? sp : (smug ? 'smirk' : 'date'), quiff: Math.sin(t * 3) * 4, arms, blush: !night });

  // ---- Dot ----
  const dIn = pop(t, 2.0, .5);
  if (dIn > 0) {
    let dp = [870, 1150, .95];
    dp = mix(dp, [880, 1600, .78], seg(t, 2.55, 3.35));
    dp = mix(dp, [800, 1440, 1.25], seg(t, 11.55, 11.95));
    dp = mix(dp, [860, 1600, .85], seg(t, 13.6, 14.4));
    const dsp = speaking(t, 'dot');
    const fl = Math.sin(t * 3.3) * 10 + (t > 11.55 && t < 11.95 ? -40 * Math.sin(Math.PI * (t - 11.55) / .4) : 0);
    s += dot({ night: true, x: dp[0], y: dp[1] + fl, s: dp[2] * dIn, rot: Math.sin(t * 2.2) * 6, cheeks: true,
      eyes: t >= 11.6 && t < 13.6 ? 'wide' : (blink(t, [5.2, 9.1, 16.4]) ? 'sleepy' : 'open'),
      look: t >= 13.6 ? [-.6, -.3] : t >= 4.9 && t < 11.5 ? [-.4, -.8] : [-.7, -.2],
      mouth: dsp > 0 ? dsp : (t >= 13.6 ? 'smile' : 'smile'),
      limbs: t >= 11.6 && t < 13.6 ? { armL: [[-56, -10], [-96, -60], [-100, -118]], armR: [[56, -10], [96, -60], [104, -120]] } : undefined });
  }

  // ---- zárókép ----
  const endK = seg(t, 14.0, 14.6);
  if (endK > 0) {
    s += G({ opacity: endK, transform: `translate(0 ${(1 - endK) * 30})` },
      txt(RW / 2, 470, 'MING.', { 'font-family': 'Fraunces', 'font-size': 150, 'font-weight': 600, 'text-anchor': 'middle', fill: K.paper, style: "font-variation-settings:'opsz' 144, 'SOFT' 60", 'letter-spacing': -3 }),
      txt(RW / 2, 560, 'When a photographer', { 'font-family': 'Fraunces', 'font-style': 'italic', 'font-size': 62, 'text-anchor': 'middle', fill: K.paper, style: "font-variation-settings:'opsz' 72" }),
      txt(RW / 2, 636, 'designs a watch', { 'font-family': 'Fraunces', 'font-style': 'italic', 'font-size': 62, 'text-anchor': 'middle', fill: K.paper, style: "font-variation-settings:'opsz' 72" }),
      txt(RW / 2, 760, 'LUMEJOURNAL.COM', { 'font-family': 'Mono', 'font-weight': 500, 'font-size': 32, 'text-anchor': 'middle', fill: K.lume, 'letter-spacing': 8, filter: 'url(#glow)' }));
  }
  s += captions(t, night);
  // a kattanás villanása
  const fl = t >= TL.click && t < TL.click + .2 ? 1 - (t - TL.click) / .2 : 0;
  if (fl > 0) s += E('rect', { width: RW, height: RH, fill: '#000', opacity: fl * .85 });
  s += grain(RW, RH, night ? .45 : .32);
  document.getElementById('s').innerHTML = s;
}

window.frame = frame;
window.DUR = DUR; window.FPS = FPS;
window.setTL = j => { TL = j; };
