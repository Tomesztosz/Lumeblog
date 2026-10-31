// Lume kabalák: Ten-Ten, Dot, Tick, Madame Loupe.
// Minden figura egy paraméterezhető függvény, így ugyanaz a rajz később animálható.

const K = {
  ink: '#242722', ink2: '#1b1e19', brass: '#75613b', brassHi: '#dcc48e', brassMid: '#a8894f', brassLo: '#5b4a2b',
  lume: '#d7eb96', lumeDay: '#e9efcd', paper: '#f2f0e8', paperHi: '#fbfaf5', paperLo: '#e2ddcc',
  night: '#232921', nightHi: '#313a2e', leather: '#6e4b2e', leatherLo: '#4a3220', red: '#c0472e',
  blush: '#e4a08b', mauve: '#a98a97',
};

// ---------- apró segédek ----------
const A = o => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false)
  .map(([k, v]) => `${k}="${typeof v === 'number' ? +v.toFixed(2) : v}"`).join(' ');
const E = (t, o = {}, ...c) => c.length ? `<${t} ${A(o)}>${c.join('')}</${t}>` : `<${t} ${A(o)}/>`;
const G = (o, ...c) => E('g', o, ...c);
const rad = d => d * Math.PI / 180;
const P = (r, d) => [r * Math.sin(rad(d)), -r * Math.cos(rad(d))];
const T = (x, y, r = 0, s = 1) => `translate(${+x.toFixed(2)} ${+y.toFixed(2)}) rotate(${r}) scale(${s})`;
let uid = 0; const id = p => `${p}${++uid}`;
const txt = (x, y, str, o = {}) => E('text', { x, y, ...o }, str);

function defs() {
  return E('defs', {},
    `<linearGradient id="brassG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ead39d"/><stop offset=".45" stop-color="#b59554"/><stop offset="1" stop-color="#6c5630"/></linearGradient>`,
    `<linearGradient id="brassN" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a5a48"/><stop offset="1" stop-color="#34352c"/></linearGradient>`,
    `<radialGradient id="dialG" cx=".42" cy=".36" r=".75"><stop offset="0" stop-color="#fefdf8"/><stop offset="1" stop-color="#e5e0d0"/></radialGradient>`,
    `<radialGradient id="dialN" cx=".42" cy=".36" r=".75"><stop offset="0" stop-color="#3a4235"/><stop offset="1" stop-color="#2a3027"/></radialGradient>`,
    `<radialGradient id="dotD" cx=".38" cy=".34" r=".8"><stop offset="0" stop-color="#fbfdf0"/><stop offset="1" stop-color="#d3dea8"/></radialGradient>`,
    `<radialGradient id="dotN" cx=".4" cy=".36" r=".75"><stop offset="0" stop-color="#fbffe6"/><stop offset=".6" stop-color="#e2f2a6"/><stop offset="1" stop-color="#bcd76a"/></radialGradient>`,
    `<linearGradient id="redG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dc6346"/><stop offset="1" stop-color="#99341f"/></linearGradient>`,
    `<linearGradient id="redN" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5e3127"/><stop offset="1" stop-color="#3a221b"/></linearGradient>`,
    `<radialGradient id="glassG" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fbfcf8"/><stop offset=".7" stop-color="#e4ebe4"/><stop offset="1" stop-color="#c8d3cc"/></radialGradient>`,
    `<radialGradient id="irisG" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#d9b76d"/><stop offset=".6" stop-color="#9a7a3f"/><stop offset="1" stop-color="#5b4523"/></radialGradient>`,
    `<linearGradient id="gownG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1c1f1a"/><stop offset=".35" stop-color="#3b4036"/><stop offset=".55" stop-color="#2a2e27"/><stop offset="1" stop-color="#171915"/></linearGradient>`,
    `<linearGradient id="steelG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef0ea"/><stop offset=".5" stop-color="#c9cdc3"/><stop offset="1" stop-color="#9ea397"/></linearGradient>`,
    `<linearGradient id="velvetG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4d5a43"/><stop offset="1" stop-color="#2f3829"/></linearGradient>`,
    `<radialGradient id="haloL" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#d7eb96" stop-opacity=".55"/><stop offset=".4" stop-color="#d7eb96" stop-opacity=".16"/><stop offset="1" stop-color="#d7eb96" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="warmL" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".75"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>`,
    `<linearGradient id="coneL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0bd" stop-opacity=".95"/><stop offset="1" stop-color="#fff0bd" stop-opacity=".15"/></linearGradient>`,
    `<radialGradient id="vigD" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#242722" stop-opacity="0"/><stop offset="1" stop-color="#242722" stop-opacity=".16"/></radialGradient>`,
    `<radialGradient id="vigN" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#3a4436"/><stop offset="1" stop-color="#1a1f18"/></radialGradient>`,
    `<filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    `<filter id="glow2" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="14" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    `<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>`,
    `<filter id="blur30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>`,
    `<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .14  0 0 0 0 .15  0 0 0 0 .13  0 0 0 .55 0"/></filter>`,
  );
}

// ---------- kesztyű (rubber-hose stílus) ----------
function glove(x, y, rot, type = 'open', n = false, s = 1) {
  const fill = n ? '#363d33' : K.paperHi, st = n ? '#58614f' : K.ink;
  const sh = [];
  sh.push(E('rect', { x: -7, y: -12, width: 16, height: 24, rx: 6 }));
  if (type === 'open' || type === 'spread') {
    const sp = type === 'spread' ? 1.6 : 1;
    sh.push(E('circle', { cx: 26, cy: 0, r: 16 }));
    for (const [a, l] of [[-28 * sp, 17], [-8 * sp, 20], [12 * sp, 19], [30 * sp, 15]]) {
      const [dx, dy] = [Math.cos(rad(a)), Math.sin(rad(a))];
      sh.push(E('ellipse', { cx: 26 + dx * l, cy: dy * l, rx: 9, ry: 5.5, transform: `rotate(${a} ${26 + dx * l} ${dy * l})` }));
    }
    sh.push(E('ellipse', { cx: 20, cy: -17, rx: 6, ry: 10, transform: 'rotate(-40 20 -17)' }));
  } else if (type === 'point') {
    sh.push(E('circle', { cx: 24, cy: 2, r: 15 }));
    sh.push(E('rect', { x: 28, y: -14, width: 30, height: 11, rx: 5.5 }));
    sh.push(E('ellipse', { cx: 22, cy: -14, rx: 6, ry: 8, transform: 'rotate(-30 22 -14)' }));
  } else if (type === 'pinch') { // kisujj eltartva
    sh.push(E('circle', { cx: 24, cy: 0, r: 15 }));
    sh.push(E('ellipse', { cx: 38, cy: -6, rx: 8, ry: 6 }));
    sh.push(E('rect', { x: 26, y: 8, width: 26, height: 9, rx: 4.5, transform: 'rotate(28 26 8)' }));
  } else { // fist
    sh.push(E('circle', { cx: 24, cy: 0, r: 16 }));
    sh.push(E('ellipse', { cx: 36, cy: 0, rx: 9, ry: 15 }));
  }
  const body = sh.join('');
  const det = type === 'fist' ? E('path', { d: 'M36 -7 h6 M36 1 h6 M36 9 h5', stroke: st, 'stroke-width': 2.5, 'stroke-linecap': 'round', fill: 'none' }) : '';
  return G({ transform: T(x, y, rot, s) },
    G({ fill: st, stroke: st, 'stroke-width': 8, 'stroke-linejoin': 'round' }, body),
    G({ fill }, body),
    E('line', { x1: 9, y1: -10, x2: 9, y2: 10, stroke: st, 'stroke-width': 2.5, 'stroke-linecap': 'round' }), det);
}

function limb(pts, n, w = 11, col) {
  const [a, c, b] = pts;
  return E('path', { d: `M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`, fill: 'none', stroke: col || (n ? '#4f574a' : K.ink), 'stroke-width': w, 'stroke-linecap': 'round' });
}
// a kesztyű iránya a görbe végének érintője
const endAng = ([, c, b]) => Math.atan2(b[1] - c[1], b[0] - c[0]) * 180 / Math.PI;
function arm(spec, n, s = 1, w = 11, col) {
  if (!spec) return '';
  const { p, g = 'open', gr } = spec;
  return limb(p, n, w, col) + glove(p[2][0], p[2][1], gr ?? endAng(p), g, n, s);
}

// ---------- TEN-TEN ----------
function eyeTT(cx, cy, e, side, n) {
  const r = e.r || 33;
  const ef = n ? '#141712' : K.ink2, st = n ? '#4f574a' : K.ink;
  const lidF = n ? '#2c3229' : '#f3f0e5';
  const shape = e.shape || 'open';
  let out = '';
  if (shape === 'open') {
    const cid = id('eye');
    const [lx, ly] = e.look || [0, 0];
    const hang = Math.atan2(lx, -ly || -0.001) * 180 / Math.PI;
    const ticks = [...Array(12)].map((_, i) => { const [a, b] = [P(r - 8, i * 30), P(r - 4, i * 30)];
      return E('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: n ? K.lume : '#fff', 'stroke-opacity': n ? .5 : .45, 'stroke-width': 1.4 }); }).join('');
    const hl = n ? K.lume : '#fff';
    const [hx, hy] = [lx * 7, ly * 7];
    let lid = '';
    if (e.lid) lid += G({ transform: `rotate(${(e.tilt || 0) * side})` },
      E('rect', { x: -r - 12, y: -r - 30, width: 2 * r + 24, height: 30 + e.lid * 2 * r, fill: lidF }),
      E('line', { x1: -r - 12, y1: -r + e.lid * 2 * r, x2: r + 12, y2: -r + e.lid * 2 * r, stroke: st, 'stroke-width': 4.5, 'stroke-linecap': 'round' }));
    if (e.lower) lid += G({ transform: `rotate(${-(e.ltilt || 0) * side})` },
      E('rect', { x: -r - 12, y: r - e.lower * 2 * r, width: 2 * r + 24, height: 40, fill: lidF }),
      E('line', { x1: -r - 12, y1: r - e.lower * 2 * r, x2: r + 12, y2: r - e.lower * 2 * r, stroke: st, 'stroke-width': 4, 'stroke-linecap': 'round' }));
    out = G({ transform: `translate(${cx} ${cy})` },
      E('clipPath', { id: cid }, E('circle', { r })),
      G({ 'clip-path': `url(#${cid})` },
        E('circle', { r, fill: ef }),
        E('circle', { r: r - 4, fill: 'none', stroke: n ? K.lume : '#fff', 'stroke-opacity': n ? .55 : .35, 'stroke-width': 1.2, filter: n ? 'url(#glow)' : null }),
        ticks,
        E('line', { x1: 0, y1: 0, x2: P(r * .66, hang)[0], y2: P(r * .66, hang)[1], stroke: hl, 'stroke-width': 2.6, 'stroke-linecap': 'round', filter: n ? 'url(#glow)' : null }),
        E('circle', { r: 3.2, fill: hl }),
        E('circle', { cx: -11 + hx, cy: -12 + hy, r: r * .24 * (e.spark || 1), fill: hl, filter: n ? 'url(#glow)' : null }),
        E('circle', { cx: 11 + hx, cy: 10 + hy, r: r * .1 * (e.spark || 1), fill: hl }),
        lid),
      E('circle', { r, fill: 'none', stroke: st, 'stroke-width': 4.5 }));
  } else {
    const d = {
      happy: `M${-r * .7} ${r * .2} Q0 ${-r * .75} ${r * .7} ${r * .2}`,
      closed: `M${-r * .7} ${-r * .05} Q0 ${r * .45} ${r * .7} ${-r * .05}`,
      squeeze: `M${r * .55 * side} ${-r * .5} L${-r * .45 * side} 0 L${r * .55 * side} ${r * .5}`,
      flat: `M${-r * .7} 0 L${r * .7} 0`,
    }[shape];
    out = G({ transform: `translate(${cx} ${cy})` },
      E('path', { d, fill: 'none', stroke: n ? K.lume : ef, 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: n ? 'url(#glow)' : null }));
  }
  if (e.brow) {
    const b = e.brow; // {raise, ang, curve}
    const by = cy - r - 14 - (b.raise || 0);
    out += G({ transform: `translate(${cx} ${by}) rotate(${(b.ang || 0) * side})` },
      E('path', { d: `M-22 0 Q0 ${-(b.curve ?? 6)} 22 0`, fill: 'none', stroke: n ? '#4f574a' : K.ink, 'stroke-width': 7.5, 'stroke-linecap': 'round' }));
  }
  return out;
}

function mouthTT(type, n) {
  const st = n ? '#4f574a' : K.ink, dark = n ? '#121510' : '#2a1d18', tongue = n ? '#3b2a25' : '#cf6f5c';
  const tooth = n ? '#3a4136' : '#fff';
  const W = { 'stroke-width': 4.5, stroke: st, 'stroke-linejoin': 'round' };
  if (type && typeof type === 'object') { // beszéd: o = nyitás, w = szélesség (magas hangoknál szélesebb száj)
    const o = type.o, w = type.w || 0;
    if (o < .1) return E('rect', { x: -19 - 4 * w, y: -6, width: 38 + 8 * w, height: 12, rx: 6, fill: dark, ...W });
    const ww = 32 + 22 * w, hh = 14 + 36 * o * (1 - .35 * w);
    return E('rect', { x: -ww / 2, y: -12, width: ww, height: hh, rx: Math.min(ww, hh) / 2.2, fill: dark, ...W }) +
      (hh > 22 ? E('rect', { x: -ww / 2 + 5, y: -9.5, width: ww - 10, height: 6, rx: 3, fill: tooth }) : '') +
      E('ellipse', { cx: 0, cy: -12 + hh - 6, rx: ww * .28, ry: 4 + 3 * o, fill: tongue });
  }
  if (typeof type === 'number') { // beszéd: a nyitás mértéke 0..1
    const v = type;
    if (v < .12) type = 'date';
    else return E('rect', { x: -19 - 5 * v, y: -14, width: 38 + 10 * v, height: 20 + 34 * v, rx: 8 + 6 * v, fill: dark, ...W }) +
      E('ellipse', { cx: 0, cy: 2 + 26 * v, rx: 9 + 5 * v, ry: 4 + 3 * v, fill: tongue });
  }
  switch (type) {
    case 'talk': return E('rect', { x: -20, y: -14, width: 40, height: 34, rx: 9, fill: dark, ...W }) + E('ellipse', { cx: 0, cy: 12, rx: 12, ry: 6, fill: tongue });
    case 'O': return E('rect', { x: -17, y: -20, width: 34, height: 50, rx: 17, fill: dark, ...W }) + E('ellipse', { cx: 0, cy: 18, rx: 10, ry: 6, fill: tongue });
    case 'yell': return E('path', { d: 'M-34 -16 L34 -16 Q36 34 0 36 Q-36 34 -34 -16 Z', fill: dark, ...W }) +
      E('rect', { x: -30, y: -13, width: 60, height: 11, fill: tooth }) + E('path', { d: 'M-10 -13 v11 M10 -13 v11', stroke: st, 'stroke-width': 2 }) +
      E('ellipse', { cx: 0, cy: 24, rx: 16, ry: 8, fill: tongue });
    case 'grin': return E('path', { d: 'M-32 -12 L32 -12 Q31 24 0 26 Q-31 24 -32 -12 Z', fill: dark, ...W }) +
      E('rect', { x: -28, y: -9, width: 56, height: 12, fill: tooth }) +
      txt(0, 1.5, '2 9 3 0', { 'font-family': 'Mono', 'font-weight': 500, 'font-size': 10, 'text-anchor': 'middle', fill: n ? '#58614f' : K.ink }) +
      E('ellipse', { cx: 0, cy: 16, rx: 13, ry: 5, fill: tongue });
    case 'smirk': return E('path', { d: 'M-20 2 Q2 10 22 -6', fill: 'none', stroke: st, 'stroke-width': 6, 'stroke-linecap': 'round' });
    case 'frown': return E('path', { d: 'M-18 8 Q0 -6 18 8', fill: 'none', stroke: st, 'stroke-width': 6, 'stroke-linecap': 'round' });
    case 'tongue': return E('rect', { x: -19, y: -13, width: 38, height: 26, rx: 4, fill: n ? '#1e221b' : '#fff', ...W }) +
      E('path', { d: 'M4 6 q12 0 12 14 q0 10 -8 10 q-8 0 -8 -10 z', fill: tongue, stroke: st, 'stroke-width': 3.5 });
    case 'snore': return E('ellipse', { cx: 0, cy: 2, rx: 9, ry: 11, fill: dark, ...W });
    default: return E('rect', { x: -19, y: -13, width: 38, height: 26, rx: 4, fill: n ? '#1e221b' : '#fff', ...W }) +
      txt(0, 6, '10', { 'font-family': 'Mono', 'font-weight': 500, 'font-size': 17, 'text-anchor': 'middle', fill: n ? '#4f574a' : K.ink });
  }
}

function tenten(o = {}) {
  const n = !!o.night;
  const st = n ? '#66705c' : K.ink;
  const caseF = n ? 'url(#brassN)' : 'url(#brassG)', dialF = n ? 'url(#dialN)' : 'url(#dialG)';
  const lumeF = n ? K.lume : K.lumeDay, glow = n ? 'url(#glow)' : null;
  const leather = n ? '#2d2822' : K.leather, leatherLo = n ? '#221e19' : K.leatherLo, stitch = n ? '#3f382f' : '#d2b07c';
  const R = 152;
  const parts = [];

  if (!o.headOnly) {
    if (!n && o.shadow !== false) parts.push(E('ellipse', { cx: 0, cy: 352, rx: 150, ry: 16, fill: K.ink, opacity: .16, filter: 'url(#blur)' }));
    const legs = o.legs || {};
    for (const side of [-1, 1]) {
      const L = legs[side < 0 ? 'L' : 'R'] || {};
      const hip = [side * 33, 150], end = L.end || [side * 60, 330], c = L.c || [side * 42, 250];
      const d = `M${hip[0]} ${hip[1]} Q${c[0]} ${c[1]} ${end[0]} ${end[1]}`;
      parts.push(E('path', { d, fill: 'none', stroke: st, 'stroke-width': 36, 'stroke-linecap': 'round' }));
      parts.push(E('path', { d, fill: 'none', stroke: leather, 'stroke-width': 27, 'stroke-linecap': 'round' }));
      parts.push(E('path', { d, fill: 'none', stroke: stitch, 'stroke-width': 2.4, 'stroke-dasharray': '6 7' }));
      const fr = L.foot ?? 0;
      const shoe = G({ transform: T(end[0], end[1] + 8, fr) },
        E('path', { d: `M${-side * 16} -14 Q${side * 40} -18 ${side * 46} 6 Q${side * 40} 18 0 18 Q${-side * 30} 18 ${-side * 26} 2 Q${-side * 26} -12 ${-side * 16} -14 Z`, fill: leatherLo, stroke: st, 'stroke-width': 4.5, 'stroke-linejoin': 'round' }),
        side < 0
          ? E('rect', { x: -2, y: -16, width: 22, height: 17, rx: 4, fill: 'none', stroke: n ? '#4a4a3c' : K.brassMid, 'stroke-width': 4.5 })
          : E('circle', { cx: 18, cy: -4, r: 3.4, fill: n ? '#141712' : K.ink2 }) + E('circle', { cx: 32, cy: -2, r: 3.4, fill: n ? '#141712' : K.ink2 }));
      parts.push(shoe);
    }
    // felső szíj: a „bóbita"
    const qa = o.quiff ?? 0;
    const qd = 'M0 -150 C0 -196 8 -222 46 -232';
    parts.push(G({ transform: `rotate(${qa} 0 -150)` },
      E('path', { d: qd, fill: 'none', stroke: st, 'stroke-width': 66, 'stroke-linecap': 'round' }),
      E('path', { d: qd, fill: 'none', stroke: leather, 'stroke-width': 57, 'stroke-linecap': 'round' }),
      E('path', { d: qd, fill: 'none', stroke: stitch, 'stroke-width': 2.4, 'stroke-dasharray': '6 7' }),
      E('circle', { cx: 20, cy: -214, r: 4.5, fill: n ? '#141712' : K.ink2 }), E('circle', { cx: 6, cy: -194, r: 4.5, fill: n ? '#141712' : K.ink2 })));
    for (const a of o.armsBack || []) parts.push(arm(a, n));
  }
  // fülek (szárak)
  for (const sy of [-1, 1]) for (const sx of [-1, 1]) {
    parts.push(E('path', { d: `M${sx * 28} ${sy * 138} L${sx * 46} ${sy * 138} L${sx * 44} ${sy * 176} Q${sx * 37} ${sy * 182} ${sx * 30} ${sy * 176} Z`, fill: caseF, stroke: st, 'stroke-width': 4.5, 'stroke-linejoin': 'round' }));
  }
  // korona és nyomógombok
  parts.push(E('rect', { x: 146, y: -8, width: 12, height: 16, fill: caseF, stroke: st, 'stroke-width': 3.5 }));
  parts.push(G({ transform: `rotate(${o.crownSpin || 0} 168 0)` },
    E('rect', { x: 154, y: -18, width: 26, height: 36, rx: 6, fill: caseF, stroke: st, 'stroke-width': 4.5 }),
    E('path', { d: 'M161 -15 v30 M167 -15 v30 M173 -15 v30', stroke: n ? '#22251f' : K.brassLo, 'stroke-width': 2 })));
  for (const a of [58, 122]) parts.push(G({ transform: `rotate(${a - 90})` },
    E('rect', { x: 146, y: -9, width: 18, height: 18, rx: 4, fill: caseF, stroke: st, 'stroke-width': 4 })));
  // tok, lünetta
  parts.push(E('circle', { r: R, fill: caseF, stroke: st, 'stroke-width': 5 }));
  for (let i = 0; i < 60; i++) {
    const [a, b] = [P(139, i * 6), P(i % 5 ? 145 : 148, i * 6)];
    parts.push(E('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: n ? '#22251f' : K.brassLo, 'stroke-width': i % 5 ? 1.4 : 2.6 }));
  }
  parts.push(E('circle', { r: 135, fill: dialF, stroke: st, 'stroke-width': 3.5 }));
  for (let i = 0; i < 60; i++) {
    const [a, b] = [P(127, i * 6), P(131, i * 6)];
    parts.push(E('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: n ? '#4f574a' : K.ink, 'stroke-opacity': .55, 'stroke-width': 1.3 }));
  }
  for (const h of [0, 3, 4, 5, 6, 7, 8, 9]) {
    const bar = x => E('rect', { x: x - 5, y: -125, width: 10, height: 19, rx: 2, fill: lumeF, stroke: st, 'stroke-width': 2.5 });
    parts.push(G({ transform: `rotate(${h * 30})`, filter: glow }, h === 0 ? bar(-7) + bar(7) : bar(0)));
  }
  if (!n) parts.push(txt(0, -92, 'Lume', { 'font-family': 'Fraunces', 'font-size': 17, 'font-weight': 500, 'text-anchor': 'middle', fill: K.ink, style: "font-variation-settings:'opsz' 24" }));
  if (o.blush && !n) for (const s of [-1, 1]) parts.push(E('ellipse', { cx: s * 92, cy: 30, rx: 15, ry: 8, fill: K.blush, opacity: .5 }));
  const ey = o.eyes || {};
  parts.push(eyeTT(-60, -48, { ...ey, ...(ey.L || {}) }, -1, n));
  parts.push(eyeTT(60, -48, { ...ey, ...(ey.R || {}) }, 1, n));
  // stopper másodpercmutató: az „antenna"
  const ca = o.chrono ?? 0, py = 30;
  parts.push(G({ transform: `translate(0 ${py}) rotate(${ca})` },
    E('line', { x1: 0, y1: 24, x2: 0, y2: -100, stroke: n ? '#5e3127' : K.red, 'stroke-width': 3, 'stroke-linecap': 'round' }),
    E('circle', { cy: 24, r: 6, fill: n ? '#5e3127' : K.red }),
    E('circle', { cy: -96, r: 3.4, fill: lumeF, filter: glow })));
  // bajusz: óra- és percmutató
  const [ha, ma] = o.hands || [305, 55];
  const hand = (a, L) => G({ transform: `translate(0 ${py}) rotate(${a})` },
    E('path', { d: `M0 ${-L} L8 0 L0 13 L-8 0 Z`, fill: n ? '#454536' : K.brassHi, stroke: st, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }),
    E('path', { d: `M0 ${-L + 10} L2.8 -9 L0 -5 L-2.8 -9 Z`, fill: lumeF, filter: glow }));
  parts.push(hand(ma, 66), hand(ha, 56));
  parts.push(E('circle', { cy: py, r: 10, fill: n ? '#454536' : K.brassHi, stroke: st, 'stroke-width': 3.5 }), E('circle', { cy: py, r: 3.5, fill: st }));
  parts.push(G({ transform: 'translate(0 84)' }, mouthTT(o.mouth, n)));
  // üvegcsillanás
  parts.push(E('path', { d: 'M-104 -50 A114 114 0 0 1 -52 -101', fill: 'none', stroke: '#fff', 'stroke-opacity': n ? .08 : .7, 'stroke-width': 9, 'stroke-linecap': 'round' }));
  parts.push(E('circle', { cx: -40, cy: -110, r: 4.5, fill: '#fff', 'fill-opacity': n ? .08 : .7 }));
  if (o.sweat && !n) parts.push(E('path', { d: 'M118 -96 q10 16 0 24 q-10 -8 0 -24 z', fill: '#bfe0e8', stroke: K.ink, 'stroke-width': 3 }));
  if (!o.headOnly) for (const a of o.arms || []) parts.push(arm(a, n));
  return G({ transform: T(o.x || 0, o.y || 0, o.rot || 0, o.s || 1) }, ...parts, o.extra || '');
}

// ---------- DOT ----------
function dot(o = {}) {
  const n = !!o.night, R = 64, st = K.ink;
  const limbC = n ? K.lume : K.ink;
  const p = [];
  if (n) p.push(E('circle', { r: R * 3.2, fill: 'url(#haloL)' }));
  else if (o.shadow !== false) p.push(E('ellipse', { cx: 0, cy: (o.shadowY ?? 150), rx: 70, ry: 10, fill: K.ink, opacity: .16, filter: 'url(#blur)' }));
  const lim = o.limbs || {};
  const L = (pts) => E('path', { d: `M${pts[0][0]} ${pts[0][1]} Q${pts[1][0]} ${pts[1][1]} ${pts[2][0]} ${pts[2][1]}`, fill: 'none', stroke: limbC, 'stroke-width': 7, 'stroke-linecap': 'round', filter: n ? 'url(#glow)' : null });
  const nub = (pt, rx = 9, ry = 9, r = 0) => E('ellipse', { cx: pt[0], cy: pt[1], rx, ry, transform: `rotate(${r} ${pt[0]} ${pt[1]})`, fill: n ? K.lume : K.paperHi, stroke: n ? 'none' : st, 'stroke-width': 4, filter: n ? 'url(#glow)' : null });
  const back = [], front = [];
  for (const k of ['legL', 'legR', 'armL', 'armR']) {
    const sp = lim[k] || {
      legL: [[-22, 56], [-26, 90], [-30, 118]], legR: [[22, 56], [26, 90], [30, 118]],
      armL: [[-58, 12], [-86, 30], [-92, 62]], armR: [[58, 12], [86, 30], [92, 62]],
    }[k];
    const isLeg = k.startsWith('leg');
    const tgt = (sp.front ? front : back);
    tgt.push(L(sp) + (isLeg ? nub(sp[2], 15, 8, sp.fr || 0) : nub(sp[2], 9, 9)));
  }
  p.push(...back);
  const sq = o.squash || [1, 1];
  p.push(G({ transform: `scale(${sq[0]} ${sq[1]})` },
    E('circle', { r: R, fill: n ? 'url(#dotN)' : 'url(#dotD)', stroke: n ? 'none' : st, 'stroke-width': 5, filter: n ? 'url(#glow2)' : null }),
    n ? '' : E('path', { d: `M${-R * .62} ${-R * .3} A${R * .7} ${R * .7} 0 0 1 ${-R * .15} ${-R * .68}`, fill: 'none', stroke: '#fff', 'stroke-width': 8, 'stroke-linecap': 'round', opacity: .9 })));
  const eyes = o.eyes || 'open', [lx, ly] = o.look || [0, 0];
  const eyeC = n ? '#2d3a12' : K.ink2;
  if (eyes === 'open' || eyes === 'wide') {
    const ry = eyes === 'wide' ? 15 : 12, rx = eyes === 'wide' ? 10 : 8;
    for (const s of [-1, 1]) p.push(E('ellipse', { cx: s * 21 + lx * 4, cy: -8 + ly * 4, rx, ry, fill: eyeC }),
      E('circle', { cx: s * 21 + lx * 4 - 3, cy: -13 + ly * 4, r: 3.8, fill: '#fff' }));
  } else if (eyes === 'happy') {
    for (const s of [-1, 1]) p.push(E('path', { d: `M${s * 21 - 10} -4 Q${s * 21} -20 ${s * 21 + 10} -4`, fill: 'none', stroke: eyeC, 'stroke-width': 6, 'stroke-linecap': 'round' }));
  } else if (eyes === 'sleepy') {
    for (const s of [-1, 1]) p.push(E('path', { d: `M${s * 21 - 10} -8 Q${s * 21} 0 ${s * 21 + 10} -8`, fill: 'none', stroke: eyeC, 'stroke-width': 5, 'stroke-linecap': 'round' }));
  } else if (eyes === 'shades') {
    p.push(E('path', { d: 'M-46 -20 L46 -20 L44 -6 Q40 6 26 6 Q12 6 8 -6 L4 -14 L-4 -14 L-8 -6 Q-12 6 -26 6 Q-40 6 -44 -6 Z', fill: K.ink2, stroke: st, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }),
      E('path', { d: 'M-36 -14 L-24 -14 M30 -14 L38 -14', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .8 }),
      E('path', { d: 'M-46 -18 L-62 -24 M46 -18 L62 -24', stroke: st, 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
  }
  if (!n || o.cheeks) for (const s of [-1, 1]) p.push(E('ellipse', { cx: s * 38, cy: 14, rx: 10, ry: 6, fill: n ? '#a9c75a' : K.blush, opacity: n ? .9 : .6 }));
  let m = o.mouth || 'smile';
  if (typeof m === 'number') {
    if (m < .12) m = 'smile';
    else { p.push(G({ transform: `translate(0 ${12}) scale(${.7 + .4 * m} ${.4 + .9 * m}) translate(0 -12)` },
      E('path', { d: 'M-16 12 L16 12 Q15 36 0 36 Q-15 36 -16 12 Z', fill: n ? '#2d3a12' : '#2a1d18', stroke: n ? 'none' : st, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }),
      E('ellipse', { cx: 0, cy: 29, rx: 8, ry: 4.5, fill: n ? '#7f9a3c' : '#cf6f5c' }))); m = 'none'; }
  }
  if (m === 'smile') p.push(E('path', { d: 'M-12 16 Q0 28 12 16', fill: 'none', stroke: eyeC, 'stroke-width': 5, 'stroke-linecap': 'round' }));
  else if (m === 'open') p.push(E('path', { d: 'M-16 12 L16 12 Q15 36 0 36 Q-15 36 -16 12 Z', fill: n ? '#2d3a12' : '#2a1d18', stroke: n ? 'none' : st, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }),
    E('ellipse', { cx: 0, cy: 29, rx: 8, ry: 4.5, fill: n ? '#7f9a3c' : '#cf6f5c' }));
  else if (m === 'o') p.push(E('ellipse', { cx: 0, cy: 22, rx: 7, ry: 9, fill: n ? '#2d3a12' : '#2a1d18' }));
  else if (m === 'smug') p.push(E('path', { d: 'M-12 20 Q4 26 14 12', fill: 'none', stroke: eyeC, 'stroke-width': 5, 'stroke-linecap': 'round' }));
  p.push(...front);
  return G({ transform: T(o.x || 0, o.y || 0, o.rot || 0, o.s || 1) }, ...p, o.extra || '');
}

// ---------- TICK ----------
function tick(o = {}) {
  const n = !!o.night, st = n ? '#58614f' : K.ink, rf = n ? 'url(#redN)' : 'url(#redG)';
  const p = [];
  const sq = o.squash ?? 1; // a talp összenyomódása ugráskor
  if (!n && o.shadow !== false) p.push(E('ellipse', { cx: 0, cy: 124 + (o.air || 0), rx: 40, ry: 7, fill: K.ink, opacity: .18, filter: 'url(#blur)' }));
  for (const a of o.armsBack || []) p.push(arm(a, n, .62, 6));
  // tű a csúcsig, ellensúly-rúd
  p.push(E('path', { d: 'M-7 0 L-2.5 -330 Q0 -336 2.5 -330 L7 0 Z', fill: rf, stroke: st, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }));
  p.push(E('circle', { cy: -326, r: 4.5, fill: n ? K.lume : K.lumeDay, stroke: st, 'stroke-width': 2, filter: n ? 'url(#glow)' : null }));
  p.push(E('rect', { x: -6, y: 0, width: 12, height: 74, fill: rf, stroke: st, 'stroke-width': 3.5 }));
  p.push(G({ transform: `translate(0 96) scale(${1 / Math.sqrt(sq)} ${sq})` },
    E('circle', { r: 26, fill: rf, stroke: st, 'stroke-width': 4 }), E('circle', { r: 14, fill: 'none', stroke: n ? '#2a1712' : '#8a2e1c', 'stroke-width': 3 }),
    E('path', { d: 'M-15 -14 A20 20 0 0 1 4 -22', fill: 'none', stroke: '#fff', 'stroke-opacity': n ? .1 : .55, 'stroke-width': 4, 'stroke-linecap': 'round' })));
  p.push(E('circle', { r: 13, fill: n ? '#454536' : K.brassHi, stroke: st, 'stroke-width': 3.5 }), E('circle', { r: 4, fill: st }));
  // fej: a nyalóka-korong
  const hy = -238;
  p.push(E('circle', { cy: hy, r: 44, fill: rf, stroke: st, 'stroke-width': 4.5 }));
  p.push(E('circle', { cy: hy, r: 35, fill: n ? K.lume : K.paperHi, stroke: n ? 'none' : st, 'stroke-width': 2.5, filter: n ? 'url(#glow2)' : null }));
  const eyes = o.eyes || 'wide', [lx, ly] = o.look || [0, 0];
  const ec = n ? '#2d3a12' : K.ink2;
  if (eyes === 'wide') for (const s of [-1, 1]) p.push(
    E('circle', { cx: s * 13, cy: hy - 8, r: 10.5, fill: '#fff', stroke: ec, 'stroke-width': 3 }),
    E('circle', { cx: s * 13 + lx * 4, cy: hy - 8 + ly * 4, r: 5.2, fill: ec }), E('circle', { cx: s * 13 + lx * 4 - 1.8, cy: hy - 10 + ly * 4, r: 1.8, fill: '#fff' }));
  else if (eyes === 'heart') for (const s of [-1, 1]) p.push(E('path', {
    d: `M${s * 13} ${hy - 1} C${s * 13 - 16} ${hy - 12} ${s * 13 - 8} ${hy - 22} ${s * 13} ${hy - 14} C${s * 13 + 8} ${hy - 22} ${s * 13 + 16} ${hy - 12} ${s * 13} ${hy - 1} Z`,
    fill: K.red, stroke: ec, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
  else if (eyes === 'spiral') for (const s of [-1, 1]) p.push(E('path', { d: `M${s * 13} ${hy - 8} m-2 0 a2 2 0 1 1 4 0 a4 4 0 1 1 -8 0 a6 6 0 1 1 12 0 a8 8 0 1 1 -16 0`, fill: 'none', stroke: ec, 'stroke-width': 2.4 }));
  else if (eyes === 'happy') for (const s of [-1, 1]) p.push(E('path', { d: `M${s * 13 - 8} ${hy - 6} Q${s * 13} ${hy - 18} ${s * 13 + 8} ${hy - 6}`, fill: 'none', stroke: ec, 'stroke-width': 4.5, 'stroke-linecap': 'round' }));
  if (o.brows) for (const s of [-1, 1]) p.push(E('path', { d: `M${s * 6} ${hy - 26 - (o.brows.raise || 0)} L${s * 22} ${hy - 30 - (o.brows.raise || 0) + (o.brows.ang || 0)}`, stroke: ec, 'stroke-width': 4, 'stroke-linecap': 'round' }));
  const m = o.mouth || 'grin';
  if (m === 'grin') p.push(E('path', { d: `M-17 ${hy + 9} L17 ${hy + 9} Q15 ${hy + 27} 0 ${hy + 27} Q-15 ${hy + 27} -17 ${hy + 9} Z`, fill: '#2a1d18', stroke: ec, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }),
    E('rect', { x: -14, y: hy + 10.5, width: 28, height: 5.5, fill: '#fff' }), E('ellipse', { cx: 0, cy: hy + 22, rx: 7, ry: 3.5, fill: '#cf6f5c' }));
  else if (m === 'open') p.push(E('ellipse', { cx: 0, cy: hy + 17, rx: 10, ry: 11, fill: '#2a1d18', stroke: ec, 'stroke-width': 2.5 }), E('ellipse', { cx: 0, cy: hy + 23, rx: 6, ry: 3.5, fill: '#cf6f5c' }));
  else if (m === 'swoon') p.push(E('path', { d: `M-12 ${hy + 13} Q0 ${hy + 24} 12 ${hy + 13}`, fill: 'none', stroke: ec, 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
  if (!n) for (const s of [-1, 1]) p.push(E('ellipse', { cx: s * 25, cy: hy + 8, rx: 6, ry: 3.5, fill: K.blush, opacity: .7 }));
  for (const a of o.arms || []) p.push(arm(a, n, .62, 6));
  return G({ transform: T(o.x || 0, o.y || 0, o.rot || 0, o.s || 1) }, ...p, o.extra || '');
}

// ---------- MADAME LOUPE ----------
function loupe(o = {}) {
  const st = K.ink, p = [];
  if (o.shadow !== false) p.push(E('ellipse', { cx: 0, cy: 338, rx: 150, ry: 14, fill: K.ink, opacity: .17, filter: 'url(#blur)' }));
  for (const a of o.armsBack || []) p.push(arm(a, false, .9, 8));
  // a ruha: recézett, kúpos tubus
  p.push(E('path', { d: 'M-72 92 L72 92 Q100 220 132 322 Q0 352 -132 322 Q-100 220 -72 92 Z', fill: 'url(#gownG)', stroke: st, 'stroke-width': 5, 'stroke-linejoin': 'round' }));
  for (const [y, w] of [[150, 86], [214, 106], [278, 124]]) p.push(E('path', { d: `M${-w} ${y} Q0 ${y + 18} ${w} ${y}`, fill: 'none', stroke: '#4b5145', 'stroke-width': 3 }));
  for (let i = -6; i <= 6; i++) p.push(E('path', { d: `M${i * 11} 100 L${i * 19.5} 330`, stroke: '#0f110e', 'stroke-opacity': .55, 'stroke-width': 2 }));
  p.push(E('path', { d: 'M-76 92 Q0 112 76 92 L80 112 Q0 132 -80 112 Z', fill: 'url(#brassG)', stroke: st, 'stroke-width': 4, 'stroke-linejoin': 'round' }));
  // gyöngysor
  for (let i = 0; i <= 12; i++) { const t = i / 12, x = -70 + 140 * t, y = 120 + Math.sin(Math.PI * t) * 34;
    p.push(E('circle', { cx: x, cy: y, r: 7.5, fill: K.paperHi, stroke: st, 'stroke-width': 2.5 }), E('circle', { cx: x - 2.5, cy: y - 2.5, r: 2, fill: '#fff' })); }
  // keret és lencse
  p.push(E('circle', { r: 118, fill: '#1f221d', stroke: st, 'stroke-width': 5 }));
  for (let i = 0; i < 72; i++) { const [a, b] = [P(105, i * 5), P(115, i * 5)];
    p.push(E('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: '#454b40', 'stroke-width': 2.6 })); }
  const cid = id('lens'), eid = id('eyeL');
  const e = o.eye || {}, [lx, ly] = e.look || [0, 0];
  const lid = e.lid ?? .18, tilt = e.tilt || 0;
  const ery = e.wide ? 66 : 58;
  const lashes = [...Array(6)].map((_, i) => { const t = (i + .5) / 6, x = -70 + 140 * t, yb = -ery + lid * 2 * ery + (tilt * (x / 70));
    const dx = (x / 70) * 22; return E('path', { d: `M${x} ${yb} q${dx * .5} -18 ${dx + (x < 0 ? -6 : 6)} -26`, fill: 'none', stroke: K.ink2, 'stroke-width': 5, 'stroke-linecap': 'round' }); }).join('');
  p.push(E('clipPath', { id: cid }, E('circle', { r: 101 })));
  p.push(E('clipPath', { id: eid }, E('ellipse', { cx: 0, cy: 6, rx: 82, ry: ery })));
  const lidY = -ery + 6 + lid * 2 * ery;
  p.push(G({ 'clip-path': `url(#${cid})` },
    E('circle', { r: 101, fill: 'url(#glassG)' }),
    E('ellipse', { cx: 0, cy: 6, rx: 82, ry: ery, fill: '#fdfcf6', stroke: st, 'stroke-width': 4.5 }),
    G({ 'clip-path': `url(#${eid})` },
      E('circle', { cx: lx * 30, cy: 6 + ly * 22, r: 40, fill: 'url(#irisG)', stroke: st, 'stroke-width': 3.5 }),
      ...[...Array(16)].map((_, i) => { const [a, b] = [P(20, i * 22.5), P(34, i * 22.5)];
        return E('line', { x1: lx * 30 + a[0], y1: 6 + ly * 22 + a[1], x2: lx * 30 + b[0], y2: 6 + ly * 22 + b[1], stroke: '#5b4523', 'stroke-opacity': .55, 'stroke-width': 2 }); }),
      E('circle', { cx: lx * 30, cy: 6 + ly * 22, r: e.pin ? 9 : 18, fill: K.ink2 }),
      E('circle', { cx: lx * 30 - 13, cy: ly * 22 - 8, r: 9, fill: '#fff' }), E('circle', { cx: lx * 30 + 12, cy: 18 + ly * 22, r: 4, fill: '#fff' }),
      E('path', { d: `M-90 -80 L90 -80 L90 ${lidY + tilt} L-90 ${lidY - tilt} Z`, fill: K.mauve }),
      E('path', { d: `M-90 ${lidY - tilt} L90 ${lidY + tilt}`, stroke: st, 'stroke-width': 5 }),
      e.lower ? E('path', { d: `M-90 ${6 + ery - e.lower * 2 * ery} L90 ${6 + ery - e.lower * 2 * ery} L90 90 L-90 90 Z`, fill: K.mauve, stroke: st, 'stroke-width': 4 }) : ''),
    E('ellipse', { cx: 0, cy: 6, rx: 82, ry: ery, fill: 'none', stroke: st, 'stroke-width': 4.5 }),
    G({ transform: `translate(0 6)` }, lashes),
    o.brow ? E('path', { d: `M-58 ${-ery - 4 - (o.brow.raise || 0)} Q${o.brow.peak ?? 10} ${-ery - 30 - (o.brow.raise || 0)} 62 ${-ery + 4 - (o.brow.raise || 0) + (o.brow.tilt || 0)}`, fill: 'none', stroke: K.ink2, 'stroke-width': 7, 'stroke-linecap': 'round' }) : '',
    E('path', { d: 'M-80 -36 A88 88 0 0 1 -30 -84', fill: 'none', stroke: '#fff', 'stroke-width': 12, 'stroke-linecap': 'round', opacity: .75 }),
    E('circle', { cx: -16, cy: -90, r: 5, fill: '#fff', opacity: .75 })));
  p.push(E('circle', { r: 101, fill: 'none', stroke: st, 'stroke-width': 4 }));
  p.push(txt(0, -106, '10×', { 'font-family': 'Mono', 'font-weight': 500, 'font-size': 11, 'text-anchor': 'middle', fill: K.brassHi, 'letter-spacing': 1 }));
  for (const a of o.arms || []) p.push(arm(a, false, .9, 8));
  return G({ transform: T(o.x || 0, o.y || 0, o.rot || 0, o.s || 1) }, ...p, o.extra || '');
}

// ---------- kellékek ----------
function gear(cx, cy, r, teeth, o = {}) {
  const tw = o.tw || 6, pts = [];
  for (let i = 0; i < teeth; i++) {
    const a0 = i * 360 / teeth, h = 360 / teeth;
    for (const [aa, rr] of [[a0, r - tw], [a0 + h * .15, r], [a0 + h * .45, r], [a0 + h * .6, r - tw]]) { const [x, y] = P(rr, aa + (o.rot || 0)); pts.push(`${cx + x},${cy + y}`); }
  }
  const spokes = o.spokes ?? 0;
  let inner = '';
  if (spokes) {
    inner += E('circle', { cx, cy, r: r * .62, fill: o.hole || '#8f8a76', stroke: K.ink, 'stroke-width': 2.5 });
    for (let i = 0; i < spokes; i++) { const [x, y] = P(r * .64, i * 360 / spokes + (o.rot || 0));
      inner += E('line', { x1: cx, y1: cy, x2: cx + x, y2: cy + y, stroke: o.fill || K.brassHi, 'stroke-width': r * .14 }); }
    inner += E('circle', { cx, cy, r: r * .62, fill: 'none', stroke: K.ink, 'stroke-width': 2.5 });
  }
  return E('polygon', { points: pts.join(' '), fill: o.fill || 'url(#brassG)', stroke: K.ink, 'stroke-width': o.sw || 3, 'stroke-linejoin': 'round' }) + inner +
    E('circle', { cx, cy, r: Math.max(5, r * .16), fill: o.fill || K.brassHi, stroke: K.ink, 'stroke-width': 2.5 }) + jewel(cx, cy, Math.max(3, r * .08));
}
const jewel = (x, y, r) => E('circle', { cx: x, cy: y, r, fill: '#b23a3c', stroke: '#5a1a1b', 'stroke-width': 1.5 }) + E('circle', { cx: x - r * .35, cy: y - r * .35, r: r * .35, fill: '#fff', opacity: .8 });

function speech(x, y, w, h, lines, o = {}) {
  const tx = o.tail || [x + w * .25, y + h + 40];
  const fs = o.fs || 38;
  const tb = o.tailBase ?? (x + w * .3);
  const bub = `M${x + 26} ${y} H${x + w - 26} Q${x + w} ${y} ${x + w} ${y + 26} V${y + h - 26} Q${x + w} ${y + h} ${x + w - 26} ${y + h} H${tb + 26} L${tx[0]} ${tx[1]} L${tb} ${y + h} H${x + 26} Q${x} ${y + h} ${x} ${y + h - 26} V${y + 26} Q${x} ${y} ${x + 26} ${y} Z`;
  const ts = lines.map((l, i) => txt(x + w / 2, y + h / 2 + (i - (lines.length - 1) / 2) * fs * 1.18 + fs * .35, l,
    { 'font-family': o.font || 'Hanken', 'font-weight': o.fw || 650, 'font-size': fs, 'text-anchor': 'middle', fill: K.ink, 'font-style': o.italic ? 'italic' : null })).join('');
  return G({ transform: o.rot ? `rotate(${o.rot} ${x + w / 2} ${y + h / 2})` : null },
    E('path', { d: bub, fill: K.paperHi, stroke: K.ink, 'stroke-width': 5, 'stroke-linejoin': 'round' }), ts);
}

function bgDay(w, h, floorY, o = {}) {
  return E('rect', { width: w, height: h, fill: o.wall || K.paper }) +
    (floorY ? E('rect', { y: floorY, width: w, height: h - floorY, fill: o.floor || '#e5e0cf' }) +
      E('line', { x1: 0, y1: floorY, x2: w, y2: floorY, stroke: K.ink, 'stroke-opacity': .18, 'stroke-width': 2 }) : '') +
    E('rect', { width: w, height: h, fill: 'url(#vigD)' });
}
const grain = (w, h, op = .35) => E('rect', { width: w, height: h, filter: 'url(#grain)', opacity: op });
const bgNight = (w, h) => E('rect', { width: w, height: h, fill: 'url(#vigN)' });

function label(name, sub, o = {}) {
  const n = o.night, c = n ? K.paper : K.ink;
  const x = o.x ?? 64, y = o.y ?? 108;
  return txt(x, y, name, { 'font-family': 'Fraunces', 'font-size': o.fs || 60, 'font-weight': 600, fill: c, style: "font-variation-settings:'opsz' 96, 'SOFT' 60", 'letter-spacing': -1 }) +
    txt(x + 2, y + 44, sub, { 'font-family': 'Mono', 'font-size': 21, 'font-weight': 500, fill: c, opacity: .62, 'letter-spacing': 3 });
}

function hangTag(x, y, rot, o = {}) {
  return G({ transform: T(x, y, rot) },
    E('path', { d: 'M0 -340 Q-6 -170 0 -8', fill: 'none', stroke: K.ink, 'stroke-width': 2.5 }),
    G({ transform: 'translate(0 0)' },
      E('path', { d: 'M-34 0 L34 0 L118 70 L118 330 Q118 344 104 344 L-104 344 Q-118 344 -118 330 L-118 70 Z', fill: '#fbf6e6', stroke: K.ink, 'stroke-width': 5, 'stroke-linejoin': 'round' }),
      E('circle', { cy: 30, r: 11, fill: K.paper, stroke: K.ink, 'stroke-width': 4 }),
      E('circle', { cy: 30, r: 17, fill: 'none', stroke: K.brassMid, 'stroke-width': 4 }),
      txt(0, 120, 'LIMITED', { 'font-family': 'Hanken', 'font-weight': 800, 'font-size': 40, 'text-anchor': 'middle', fill: K.ink, 'letter-spacing': 4 }),
      txt(0, 164, 'EDITION', { 'font-family': 'Hanken', 'font-weight': 800, 'font-size': 40, 'text-anchor': 'middle', fill: K.ink, 'letter-spacing': 4 }),
      E('line', { x1: -80, y1: 196, x2: 80, y2: 196, stroke: K.ink, 'stroke-width': 2 }),
      txt(0, 238, 'only', { 'font-family': 'Fraunces', 'font-style': 'italic', 'font-size': 30, 'text-anchor': 'middle', fill: K.ink }),
      txt(0, 286, '9,999', { 'font-family': 'Mono', 'font-weight': 500, 'font-size': 46, 'text-anchor': 'middle', fill: K.red }),
      txt(0, 318, 'PIECES WORLDWIDE', { 'font-family': 'Mono', 'font-size': 15, 'text-anchor': 'middle', fill: K.ink, 'letter-spacing': 2 })));
}

function deskLamp(x, y) {
  return G({ transform: `translate(${x} ${y})` },
    E('ellipse', { cx: 150, cy: 610, rx: 90, ry: 20, fill: K.ink }),
    E('path', { d: 'M150 600 L210 330 L60 120', fill: 'none', stroke: K.ink, 'stroke-width': 16, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    E('circle', { cx: 210, cy: 330, r: 16, fill: K.brassHi, stroke: K.ink, 'stroke-width': 5 }),
    E('circle', { cx: 60, cy: 120, r: 14, fill: K.brassHi, stroke: K.ink, 'stroke-width': 5 }),
    G({ transform: 'translate(60 120) rotate(28)' },
      E('path', { d: 'M-40 -30 L40 -30 L96 70 L-96 70 Z', fill: 'url(#brassG)', stroke: K.ink, 'stroke-width': 6, 'stroke-linejoin': 'round' }),
      E('ellipse', { cx: 0, cy: 70, rx: 96, ry: 18, fill: '#fff6d2', stroke: K.ink, 'stroke-width': 5 })));
}

function movement(cx, cy, r, o = {}) {
  const p = [];
  p.push(E('circle', { cx, cy, r: r + 14, fill: 'url(#steelG)', stroke: K.ink, 'stroke-width': 5 }));
  p.push(E('circle', { cx, cy, r, fill: '#d6d8cf', stroke: K.ink, 'stroke-width': 3 }));
  // perlázs
  for (let i = 0; i < 70; i++) { const a = i * 137.5, rr = Math.sqrt(i / 70) * r * .92; const [x, y] = P(rr, a);
    p.push(E('circle', { cx: cx + x, cy: cy + y, r: r * .07, fill: 'none', stroke: '#b8bbb0', 'stroke-width': 2 })); }
  // hidak
  p.push(E('path', { d: `M${cx - r * .9} ${cy - r * .1} Q${cx - r * .2} ${cy - r * .55} ${cx + r * .55} ${cy - r * .62} L${cx + r * .7} ${cy - r * .3} Q${cx} ${cy - r * .1} ${cx - r * .8} ${cy + r * .22} Z`, fill: 'url(#steelG)', stroke: K.ink, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }));
  for (let k = 0; k < 7; k++) p.push(E('path', { d: `M${cx - r * .85 + k * r * .2} ${cy - r * .05 - k * 0.07 * r} l${r * .12} ${-r * .12}`, stroke: '#fff', 'stroke-opacity': .5, 'stroke-width': 3 }));
  p.push(gear(cx + r * .1, cy + r * .38, r * .3, 40, { spokes: 4, fill: '#c9a45e' }));
  p.push(gear(cx - r * .45, cy + r * .45, r * .17, 24, { fill: '#c9a45e', tw: 4 }));
  p.push(gear(cx + r * .58, cy + r * .12, r * .14, 20, { fill: '#c9a45e', tw: 4 }));
  // balansz
  const bx = cx - r * .42, by = cy - r * .5;
  p.push(E('circle', { cx: bx, cy: by, r: r * .26, fill: 'none', stroke: K.ink, 'stroke-width': r * .07 }));
  p.push(E('circle', { cx: bx, cy: by, r: r * .26, fill: 'none', stroke: '#c9a45e', 'stroke-width': r * .045 }));
  for (let i = 0; i < 3; i++) { const [x, y] = P(r * .26, i * 120 + 20); p.push(E('line', { x1: bx, y1: by, x2: bx + x, y2: by + y, stroke: '#c9a45e', 'stroke-width': 6 })); }
  p.push(E('path', { d: `M${bx} ${by} m-2 0 a3 3 0 1 1 6 0 a7 7 0 1 1 -14 0 a11 11 0 1 1 22 0 a15 15 0 1 1 -30 0`, fill: 'none', stroke: '#3f6aa0', 'stroke-width': 1.6 }));
  p.push(jewel(bx, by, 6));
  for (const [dx, dy] of [[.62, -.42], [-.75, .12], [.3, -.15], [.78, .45]]) p.push(jewel(cx + r * dx, cy + r * dy, 7));
  for (const [dx, dy] of [[-.62, .02], [.5, -.5], [-.15, -.42]]) { p.push(E('circle', { cx: cx + r * dx, cy: cy + r * dy, r: 9, fill: '#3f6aa0', stroke: K.ink, 'stroke-width': 2.5 }),
    E('line', { x1: cx + r * dx - 6, y1: cy + r * dy, x2: cx + r * dx + 6, y2: cy + r * dy, stroke: K.ink, 'stroke-width': 2.5 })); }
  return G({}, ...p, o.extra || '');
}

function columnWheel(cx, cy, r) {
  const p = [gear(cx, cy, r, 7 * 4, { tw: 10, fill: 'url(#steelG)', sw: 3.5 })];
  p.push(E('circle', { cx, cy, r: r * .7, fill: '#aeb3a7', stroke: K.ink, 'stroke-width': 3 }));
  for (let i = 0; i < 7; i++) { const a = i * 360 / 7; const [x, y] = P(r * .5, a);
    p.push(G({ transform: `translate(${cx + x} ${cy + y}) rotate(${a})` }, E('rect', { x: -12, y: -16, width: 24, height: 32, rx: 4, fill: 'url(#steelG)', stroke: K.ink, 'stroke-width': 3 }))); }
  p.push(E('circle', { cx, cy, r: r * .26, fill: 'url(#steelG)', stroke: K.ink, 'stroke-width': 3 }), E('circle', { cx, cy, r: r * .1, fill: '#3f6aa0', stroke: K.ink, 'stroke-width': 2.5 }));
  return p.join('');
}

const heart = (x, y, s, rot = 0, c = K.red) => G({ transform: T(x, y, rot, s) },
  E('path', { d: 'M0 12 C-22 -2 -14 -22 0 -10 C14 -22 22 -2 0 12 Z', fill: c, stroke: K.ink, 'stroke-width': 3 / s, 'stroke-linejoin': 'round' }));
const sparkle = (x, y, s, c = K.lume, n = false) => G({ transform: T(x, y, 0, s), filter: n ? 'url(#glow)' : null },
  E('path', { d: 'M0 -16 Q2 -2 16 0 Q2 2 0 16 Q-2 2 -16 0 Q-2 -2 0 -16 Z', fill: c, stroke: n ? 'none' : K.ink, 'stroke-width': 2.5 }));
const zz = (x, y, s, c) => txt(x, y, 'z', { 'font-family': 'Fraunces', 'font-style': 'italic', 'font-weight': 700, 'font-size': 40 * s, fill: c || K.ink });

// ---------- jelenetek ----------
const W = 1080, H = 1350;
const SCENES = {};

SCENES['tenten-1-entrance'] = () => {
  const x = 500, y = 720, s = 1.45;
  const bead = [x + 190 * s, y - 228 * s];
  return [W, H, bgNight(W, H) +
    E('circle', { cx: 540, cy: 700, r: 640, fill: 'url(#haloL)', opacity: .55 }) +
    E('path', { d: `M${bead[0] + 4} 0 Q${bead[0] - 18} ${bead[1] * .6} ${bead[0]} ${bead[1]}`, fill: 'none', stroke: '#4f574a', 'stroke-width': 3 }) +
    E('circle', { cx: bead[0], cy: bead[1] + 4, r: 26, fill: 'url(#haloL)' }) +
    tenten({ night: true, x, y, s, rot: -3, hands: [305, 55], chrono: 12,
      eyes: { lid: .38, tilt: -6, look: [.5, -.1], L: { brow: { raise: 14, ang: -10, curve: 10 } }, R: { brow: { raise: 0, ang: 8 } } },
      mouth: 'smirk', quiff: -6,
      arms: [{ p: [[-123, 72], [-240, 140], [-150, 150]], g: 'fist', gr: 160 },
        { p: [[123, 72], [250, 30], [190, -196]], g: 'fist', gr: -95 }],
      legs: { L: { end: [-62, 330] }, R: { end: [76, 326], c: [70, 240], foot: -6 } } }) +
    E('circle', { cx: bead[0], cy: bead[1] + 6, r: 9, fill: K.lume, filter: 'url(#glow)' }) +
    sparkle(250, 470, 1.1, K.lume, true) + sparkle(880, 860, .7, K.lume, true) + sparkle(170, 900, .5, K.lume, true) + sparkle(920, 260, .55, K.lume, true) +
    txt(84, 300, 'click.', { 'font-family': 'Fraunces', 'font-style': 'italic', 'font-size': 150, 'font-weight': 400, fill: K.lume, filter: 'url(#glow)', style: "font-variation-settings:'opsz' 144, 'SOFT' 100, 'WONK' 1" }) +
    label('Ten-Ten', '01 · THE ENTRANCE', { night: true, y: 1220 }) + grain(W, H, .5)];
};

SCENES['tenten-2-sneeze'] = () => {
  const x = 430, y = 780, s = 1.18;
  const spray = [...Array(14)].map((_, i) => {
    const a = -28 + i * 5.2 + (i % 3) * 3, d = 120 + (i * 37) % 160;
    const px = x + 70 + Math.cos(rad(a)) * d, py = y - 10 + Math.sin(rad(a)) * d;
    return i % 3 === 0 ? sparkle(px, py, .55 + (i % 4) * .12) : G({ transform: T(px, py, a + 90 + i * 20) }, E('rect', { x: -4, y: -10, width: 8, height: 20, rx: 2, fill: K.lumeDay, stroke: K.ink, 'stroke-width': 2.5 }));
  }).join('');
  const lines = [...Array(6)].map((_, i) => { const a = -24 + i * 9; const r0 = 90, r1 = 170 + (i % 2) * 40;
    return E('line', { x1: x + 60 + Math.cos(rad(a)) * r0, y1: y - 20 + Math.sin(rad(a)) * r0 + 60, x2: x + 60 + Math.cos(rad(a)) * r1 + 160, y2: y - 20 + Math.sin(rad(a)) * r1 + 40, stroke: K.ink, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .5 }); }).join('');
  return [W, H, bgDay(W, H, 1110) +
    hangTag(850, 360, 24) +
    lines + spray +
    tenten({ x, y, s, rot: 9, hands: [262, 112], chrono: 28, quiff: 18, blush: true,
      eyes: { shape: 'squeeze', L: { brow: { raise: 6, ang: 18 } }, R: { brow: { raise: 6, ang: 18 } } },
      mouth: 'yell',
      armsBack: [{ p: [[-123, 72], [-250, 40], [-262, -110]], g: 'spread', gr: -120 }],
      arms: [{ p: [[123, 72], [210, 160], [262, 60]], g: 'spread', gr: -30 }],
      legs: { L: { end: [-96, 318], c: [-70, 240], foot: -4 }, R: { end: [96, 262], c: [80, 210], foot: -24 } } }) +
    txt(560, 240, 'ACHOO!', { 'font-family': 'Fraunces', 'font-weight': 800, 'font-style': 'italic', 'font-size': 128, 'text-anchor': 'middle', fill: K.ink, transform: 'rotate(-7 560 240)', style: "font-variation-settings:'opsz' 144, 'SOFT' 100, 'WONK' 1" }) +
    txt(560, 300, 'hype allergy, chronic', { 'font-family': 'Mono', 'font-size': 22, 'text-anchor': 'middle', fill: K.ink, opacity: .6, transform: 'rotate(-7 560 300)', 'letter-spacing': 2 }) +
    label('Ten-Ten', '02 · ALLERGIC TO HYPE', { y: 1220 }) + grain(W, H)];
};

SCENES['dot-1-charging'] = () => {
  const cx = 480, cy = 930;
  const bars = [...Array(5)].map((_, i) => E('rect', { x: 724 + i * 30, y: 1110, width: 22, height: 34, rx: 3, fill: i < 4 ? K.lume : 'none', stroke: K.ink, 'stroke-width': 3 })).join('');
  return [W, H, bgDay(W, H, 1000, { floor: '#ddd5bf' }) +
    E('path', { d: 'M602 247 L772 337 L860 1010 L120 1010 Z', fill: 'url(#coneL)', opacity: .9 }) +
    E('ellipse', { cx: 520, cy: 1000, rx: 380, ry: 44, fill: 'url(#warmL)' }) +
    deskLamp(660, 110) +
    // mikroszálas kendő
    E('path', { d: 'M230 980 L760 980 L800 1050 L190 1050 Z', fill: '#9fae8f', stroke: K.ink, 'stroke-width': 5, 'stroke-linejoin': 'round' }) +
    E('path', { d: 'M250 992 L770 992 M214 1036 L784 1036', stroke: '#fff', 'stroke-opacity': .45, 'stroke-width': 3, 'stroke-dasharray': '10 8' }) +
    // csipesz a padon
    G({ transform: 'translate(120 1180) rotate(-8)' }, E('path', { d: 'M0 0 L300 -10 L300 6 Z M0 12 L300 22 L300 6 Z', fill: 'url(#steelG)', stroke: K.ink, 'stroke-width': 4, 'stroke-linejoin': 'round' })) +
    dot({ x: cx, y: cy - 30, s: 1.55, rot: -6, eyes: 'shades', mouth: 'smug', squash: [1.06, .94], shadow: false,
      limbs: { armL: [[-50, -30], [-96, -80], [-30, -78]], armR: [[50, -30], [96, -80], [30, -78]],
        legL: [[-20, 52], [40, 60], [128, 40], ], legR: [[20, 50], [80, 72], [150, 60], { front: true }].slice(0, 3) } }) +
    sparkle(360, 760, .8) + sparkle(640, 720, .6) + sparkle(560, 640, .45) +
    txt(724, 1096, 'CHARGING', { 'font-family': 'Mono', 'font-weight': 500, 'font-size': 20, fill: K.ink, 'letter-spacing': 3 }) + bars +
    txt(882, 1137, '81%', { 'font-family': 'Mono', 'font-size': 22, fill: K.ink }) +
    speech(80, 380, 420, 150, ['Do not disturb.', 'Charging.'], { tail: [330, 700], tailBase: 260, fs: 40 }) +
    label('Dot', '01 · SUNBATHING UNDER THE BENCH LAMP', { y: 1240 }) + grain(W, H)];
};

SCENES['dot-2-lightsoff'] = () => {
  const rays = [...Array(16)].map((_, i) => { const a = i * 22.5 + 6; const [x1, y1] = P(150, a), [x2, y2] = P(260 + (i % 2) * 70, a);
    return E('line', { x1: 540 + x1, y1: 560 + y1, x2: 540 + x2, y2: 560 + y2, stroke: K.lume, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: .55, filter: 'url(#glow)' }); }).join('');
  return [W, H, bgNight(W, H) +
    tenten({ night: true, headOnly: true, x: 900, y: 1210, s: .9, rot: -14, hands: [300, 60], eyes: { look: [-.7, -.6], lid: .1 }, mouth: 'date' }) +
    tenten({ night: true, headOnly: true, x: 140, y: 1250, s: .7, rot: 18, hands: [240, 120], eyes: { look: [.6, -.7], shape: 'happy' }, mouth: 'talk' }) +
    rays +
    dot({ night: true, x: 540, y: 560, s: 1.9, rot: 4, eyes: 'happy', mouth: 'open', cheeks: true, squash: [.96, 1.05],
      limbs: { armL: [[-56, -10], [-96, -60], [-100, -118]], armR: [[56, -10], [96, -60], [104, -120]],
        legL: [[-22, 56], [-60, 82], [-80, 64], { fr: -30 }].slice(0, 3), legR: [[22, 56], [40, 100], [52, 132]] } }) +
    sparkle(220, 330, 1, K.lume, true) + sparkle(860, 380, .8, K.lume, true) + sparkle(300, 760, .55, K.lume, true) + sparkle(800, 720, .65, K.lume, true) +
    txt(540, 200, 'LIGHTS OFF!', { 'font-family': 'Hanken', 'font-weight': 850, 'font-size': 100, 'text-anchor': 'middle', fill: K.lume, filter: 'url(#glow)', 'letter-spacing': 2 }) +
    label('Dot', '02 · MY SHIFT STARTS NOW', { night: true, y: 990 }) + grain(W, H, .5)];
};

SCENES['tick-1-sprint'] = () => {
  const C = [540, 2250], RR = 1480;
  const pt = (a, dr = 0) => [C[0] + (RR + dr) * Math.sin(rad(a)), C[1] - (RR + dr) * Math.cos(rad(a))];
  let track = E('circle', { cx: C[0], cy: C[1], r: RR, fill: 'url(#dialG)', stroke: K.ink, 'stroke-width': 6 });
  track += E('circle', { cx: C[0], cy: C[1], r: RR - 70, fill: 'none', stroke: K.ink, 'stroke-width': 2.5 });
  for (let i = -60; i <= 60; i++) { const a = i * .6, [x1, y1] = pt(a, -14), [x2, y2] = pt(a, i % 5 ? -40 : -62);
    track += E('line', { x1, y1, x2, y2, stroke: K.ink, 'stroke-width': i % 5 ? 2 : 4.5 }); }
  for (const [a, t] of [[-15, '55'], [0, '60'], [15, '05']]) { const [x, y] = pt(a, -120);
    track += txt(x, y, t, { 'font-family': 'Fraunces', 'font-size': 62, 'font-weight': 500, 'text-anchor': 'middle', fill: K.ink, transform: `rotate(${a} ${x} ${y})`, style: "font-variation-settings:'opsz' 72" }); }
  const [bx, by] = pt(0, -330);
  
  // a beütések: nyolc ugrás másodpercenként
  const beats = [-19, -14.5, -10, -5.5, -1];
  let ghosts = '', hops = '';
  beats.forEach((a, i) => { const [x, y] = pt(a, -2), r = a + 9;
    ghosts += G({ opacity: .12 + i * .1 }, tick({ x, y: y - 118 * .82 - 26, s: .82, rot: a + 6, shadow: false, squash: 1, mouth: 'grin' }));
    const [x2, y2] = pt(a + 4.5, -2);
    hops += E('path', { d: `M${x} ${y - 8} Q${(x + x2) / 2} ${Math.min(y, y2) - 120} ${x2} ${y2 - 8}`, fill: 'none', stroke: K.ink, 'stroke-width': 3, 'stroke-dasharray': '3 10', 'stroke-linecap': 'round', opacity: .55 }); });
  const [mx, my] = pt(3.5, -2);
  return [W, H, bgDay(W, H, 0) + track + hops + ghosts +
    tick({ x: mx, y: my - 118 * 1.15 - 30, s: 1.15, rot: 14, air: 30, squash: 1.12, eyes: 'wide', look: [.8, -.2], mouth: 'open', brows: { raise: 4, ang: 0 },
      armsBack: [{ p: [[-4, -160], [-80, -140], [-110, -200]], g: 'fist' }],
      arms: [{ p: [[4, -160], [80, -170], [104, -110]], g: 'fist' }] }) +
    
    speech(64, 110, 440, 190, ['28,800 vph!', 'that is 8 hops', 'a second!!'], { tail: [560, 330], tailBase: 380, fs: 38 }) +
    label('Tick', '01 · NEVER STANDS STILL', { y: 1230 }) + grain(W, H)];
};

SCENES['tick-2-swoon'] = () => {
  const dc = [380, 760];
  return [W, H, bgDay(W, H, 1060, { wall: '#efe9dc' }) +
    E('circle', { cx: 380, cy: 720, r: 420, fill: 'url(#warmL)', opacity: .7 }) +
    // talapzat, párna, búra
    E('path', { d: 'M180 1040 L580 1040 L560 1140 L200 1140 Z', fill: '#3d4634', stroke: K.ink, 'stroke-width': 5, 'stroke-linejoin': 'round' }) +
    E('rect', { x: 160, y: 1010, width: 440, height: 36, rx: 8, fill: 'url(#brassG)', stroke: K.ink, 'stroke-width': 5 }) +
    E('path', { d: 'M215 1010 Q200 930 270 920 L490 920 Q560 930 545 1010 Z', fill: 'url(#velvetG)', stroke: K.ink, 'stroke-width': 5 }) +
    G({ transform: 'translate(380 820) scale(1 .42) translate(-380 -820)' }, columnWheel(380, 820, 150)) +
    E('path', { d: 'M180 1010 L180 600 Q180 360 380 360 Q580 360 580 600 L580 1010', fill: '#eef4f2', 'fill-opacity': .28, stroke: K.ink, 'stroke-width': 5 }) +
    E('path', { d: 'M230 960 L230 620 Q230 440 330 410', fill: 'none', stroke: '#fff', 'stroke-width': 14, 'stroke-linecap': 'round', opacity: .8 }) +
    E('circle', { cx: 380, cy: 352, r: 16, fill: 'url(#brassG)', stroke: K.ink, 'stroke-width': 4 }) +
    txt(380, 1104, 'EXHIBIT A · COLUMN WHEEL', { 'font-family': 'Mono', 'font-size': 18, 'font-weight': 500, 'text-anchor': 'middle', fill: K.paper, 'letter-spacing': 2 }) +
    heart(640, 420, 1.6, -12) + heart(940, 360, 1.1, 14) + heart(1000, 520, .8, 6) + heart(590, 330, .7, -20) +
    tick({ x: 800, y: 930, s: 1.3, rot: -22, eyes: 'heart', mouth: 'swoon', squash: 1,
      armsBack: [{ p: [[4, -160], [120, -200], [70, -258]], g: 'open', gr: -150 }],
      arms: [{ p: [[-4, -160], [-60, -110], [-130, -150]], g: 'spread', gr: 200 }] }) +
    speech(600, 140, 420, 120, ['COLUMN. WHEEL.'], { tail: [700, 470], tailBase: 680, fs: 42, fw: 850 }) +
    label('Tick', '02 · LOVE AT FIRST BEAT', { y: 1230, x: 640 }) + grain(W, H)];
};

SCENES['loupe-1-inspect'] = () => {
  const mx = 540, my = 1180, mr = 360;
  const sx = mx + 120, sy = my - 230;
  return [W, H, bgDay(W, H, 0, { wall: '#ece7d9' }) +
    movement(mx, my, mr) +
    E('path', { d: `M${sx - 26} ${sy + 10} L${sx + 30} ${sy - 12}`, stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round' }) +
    E('circle', { cx: sx + 2, cy: sy, r: 52, fill: 'none', stroke: K.red, 'stroke-width': 5, 'stroke-dasharray': '12 9' }) +
    txt(sx + 62, sy - 62, '0.02 mm', { 'font-family': 'Mono', 'font-weight': 500, 'font-size': 26, fill: K.red }) +
    loupe({ x: 470, y: 400, s: 1.12, rot: 14, shadow: false,
      eye: { look: [.55, .75], lid: 0, wide: true, pin: true }, brow: { raise: 18, peak: 0, tilt: -6 },
      armsBack: [{ p: [[78, 130], [170, 60], [120, -40]], g: 'open', gr: -110 }],
      arms: [{ p: [[-78, 130], [-120, 200], [-40, 175]], g: 'open', gr: 10 }] }) +
    speech(560, 90, 470, 150, ['Is that...', 'a SCRATCH?'], { tail: [600, 330], tailBase: 640, fs: 44, fw: 750 }) +
    label('Madame Loupe', '01 · NOTHING ESCAPES HER', { y: 108, x: 64, fs: 52 }) + grain(W, H)];
};

SCENES['loupe-2-gossip'] = () => {
  return [W, H, bgDay(W, H, 1020, { wall: '#efe7dd', floor: '#d8cdb8' }) +
    // kávézóasztal
    E('ellipse', { cx: 330, cy: 1020, rx: 260, ry: 34, fill: '#c9b48c', stroke: K.ink, 'stroke-width': 5 }) +
    E('path', { d: 'M318 1052 L318 1150 M240 1158 L396 1158', stroke: K.ink, 'stroke-width': 12, 'stroke-linecap': 'round' }) +
    E('ellipse', { cx: 250, cy: 1006, rx: 52, ry: 12, fill: K.paperHi, stroke: K.ink, 'stroke-width': 4 }) +
    E('rect', { x: 380, y: 984, width: 30, height: 26, rx: 4, fill: '#fff', stroke: K.ink, 'stroke-width': 3.5 }) +
    // a pletyka tárgya, a háttérben
    G({ opacity: .9 }, tenten({ x: 930, y: 1040, s: .55, rot: -4, hands: [240, 120], chrono: -20, eyes: { look: [.2, .3], lid: .25 }, mouth: 'frown', sweat: true,
      arms: [{ p: [[-123, 72], [-200, 140], [-150, 190]], g: 'fist' }, { p: [[123, 72], [200, 140], [150, 190]], g: 'fist' }] })) +
    loupe({ x: 470, y: 640, s: 1.12, rot: -6,
      eye: { look: [.85, .1], lid: .42, tilt: 6 }, brow: { raise: -4, peak: 30, tilt: -10 },
      arms: [{ p: [[78, 130], [170, 200], [170, 90]], g: 'pinch', gr: -70 }],
      armsBack: [{ p: [[-78, 130], [-150, 150], [-110, 60]], g: 'open', gr: -50 }],
      extra: G({ transform: 'translate(176 54)' },
        E('path', { d: 'M-26 -18 L26 -18 Q24 22 0 24 Q-24 22 -26 -18 Z', fill: K.paperHi, stroke: K.ink, 'stroke-width': 4 }),
        E('path', { d: 'M24 -10 q18 0 16 14 q-2 10 -18 8', fill: 'none', stroke: K.ink, 'stroke-width': 4 }),
        E('ellipse', { cx: 0, cy: 28, rx: 38, ry: 7, fill: K.paperHi, stroke: K.ink, 'stroke-width': 4 }),
        E('path', { d: 'M-8 -30 q-10 -16 0 -30 q10 -14 0 -28 M10 -30 q-10 -16 0 -30', fill: 'none', stroke: K.ink, 'stroke-width': 3, opacity: .45, 'stroke-linecap': 'round' })) }) +
    speech(90, 120, 640, 210, ['Darling. You would', 'NOT believe what I saw', 'under that bezel.'], { tail: [380, 420], tailBase: 330, fs: 40, fw: 600 }) +
    txt(930, 780, '...what?', { 'font-family': 'Fraunces', 'font-style': 'italic', 'font-size': 40, 'text-anchor': 'middle', fill: K.ink, opacity: .75 }) +
    label('Madame Loupe', '02 · THE GOSSIP', { y: 1250, x: 64, fs: 52 }) + grain(W, H)];
};

SCENES['cast-lineup'] = () => {
  const w = 2400, h = 1120;
  return [w, h, bgDay(w, h, 910) + G({ transform: 'translate(0 -120)' },
    tenten({ x: 600, y: 650, s: 1.08, hands: [305, 55], chrono: 0, blush: true, eyes: { look: [.3, .1], L: { brow: { raise: 6, ang: -4 } }, R: { brow: { raise: 6, ang: -4 } } }, mouth: 'grin',
      arms: [{ p: [[-123, 72], [-230, 150], [-150, 160]], g: 'fist', gr: 160 }, { p: [[123, 72], [230, 20], [250, -110]], g: 'open', gr: -80 }] }) +
    tick({ x: 1150, y: 880, s: 1.18, rot: 4, eyes: 'wide', look: [-.5, 0], mouth: 'grin',
      arms: [{ p: [[4, -160], [80, -150], [100, -90]], g: 'point', gr: -20 }], armsBack: [{ p: [[-4, -160], [-70, -170], [-90, -230]], g: 'open' }] }) +
    dot({ x: 1530, y: 880, s: 1.2, eyes: 'open', look: [-.4, -.4], mouth: 'open', shadowY: 128,
      limbs: { armL: [[-56, 0], [-96, -40], [-100, -96]], armR: [[56, 0], [96, -40], [104, -96]] } }) +
    loupe({ x: 1960, y: 690, s: 1.0, rot: -3, eye: { look: [-.6, .1], lid: .38, tilt: 4 }, brow: { raise: 0, peak: 20, tilt: -8 },
      arms: [{ p: [[78, 130], [160, 200], [110, 250]], g: 'open', gr: 120 }], armsBack: [{ p: [[-78, 130], [-150, 180], [-104, 236]], g: 'open', gr: 60 }] }) +
    [['Ten-Ten', 'the narrator', 600], ['Tick', 'the numbers', 1150], ['Dot', 'the spark', 1530], ['Madame Loupe', 'the critic', 1960]].map(([nm, r, x]) =>
      txt(x, 1130, nm, { 'font-family': 'Fraunces', 'font-size': 56, 'font-weight': 600, 'text-anchor': 'middle', fill: K.ink, style: "font-variation-settings:'opsz' 96, 'SOFT' 60" }) +
      txt(x, 1176, r.toUpperCase(), { 'font-family': 'Mono', 'font-size': 20, 'font-weight': 500, 'text-anchor': 'middle', fill: K.ink, opacity: .6, 'letter-spacing': 3 })).join('')) +
    txt(80, 130, 'The Lume cast', { 'font-family': 'Fraunces', 'font-size': 84, 'font-weight': 600, fill: K.ink, style: "font-variation-settings:'opsz' 144, 'SOFT' 60", 'letter-spacing': -2 }) +
    grain(w, h)];
};

// arckifejezés-sorok
function strip(items, draw, w, h, night) {
  const cw = w / items.length;
  return (night ? bgNight(w, h) : bgDay(w, h, 0)) + items.map(([label, o], i) =>
    draw({ ...o, x: cw * i + cw / 2 + (o.dx || 0), y: o.y }) +
    txt(cw * i + cw / 2, h - 40, label, { 'font-family': 'Mono', 'font-size': 22, 'font-weight': 500, 'text-anchor': 'middle', fill: night ? K.paper : K.ink, opacity: .7, 'letter-spacing': 2 })).join('') + grain(w, h, night ? .5 : .35);
}
SCENES['tenten-expressions'] = () => [2400, 620, strip([
  ['10:10 · SMUG', { y: 300, s: .95, headOnly: true, hands: [305, 55], eyes: { lid: .3, look: [.2, 0], L: { brow: { raise: 12, ang: -8 } }, R: { brow: { ang: 6 } } }, mouth: 'smirk' }],
  ['8:20 · CRUSHED', { y: 300, s: .95, headOnly: true, hands: [245, 115], chrono: 180, eyes: { look: [0, .6], lid: .3, tilt: 14, L: { brow: { ang: 20, raise: 6 } }, R: { brow: { ang: 20, raise: 6 } } }, mouth: 'frown' }],
  ['9:15 · SHOCKED', { y: 300, s: .95, headOnly: true, hands: [270, 90], chrono: 0, eyes: { spark: 1.3, L: { brow: { raise: 18, curve: 12 } }, R: { brow: { raise: 18, curve: 12 } } }, mouth: 'O' }],
  ['2:50 · FURIOUS', { y: 300, s: .95, headOnly: true, hands: [85, 300], chrono: 0, eyes: { lid: .32, tilt: -22, look: [0, .2], L: { brow: { ang: -26, raise: -6 } }, R: { brow: { ang: -26, raise: -6 } } }, mouth: 'yell' }],
  ['0% RESERVE', { y: 300, s: .95, headOnly: true, hands: [200, 160], chrono: 160, eyes: { shape: 'closed' }, mouth: 'snore', extra: zz(150, -150, 1.4) + zz(195, -205, 1) }],
  ['LIGHTS OFF', { y: 300, s: .95, headOnly: true, night: true, hands: [305, 55], eyes: { look: [.3, 0] }, mouth: 'grin' }],
], tenten, 2400, 620)];
SCENES['dot-expressions'] = () => [2400, 560, strip([
  ['UNCHARGED', { y: 250, s: 1.3, eyes: 'sleepy', mouth: 'o', squash: [1.06, .92], shadowY: 128 }],
  ['CURIOUS', { y: 250, s: 1.3, eyes: 'open', look: [.6, -.4], mouth: 'smile', shadowY: 128 }],
  ['THRILLED', { y: 250, s: 1.3, eyes: 'happy', mouth: 'open', shadowY: 128, limbs: { armL: [[-56, 0], [-96, -40], [-100, -96]], armR: [[56, 0], [96, -40], [104, -96]] } }],
  ['TOO COOL', { y: 250, s: 1.3, eyes: 'shades', mouth: 'smug', shadowY: 128 }],
  ['FULL GLOW', { y: 250, s: 1.3, night: true, eyes: 'happy', mouth: 'open', cheeks: true }],
], dot, 2400, 560)];
SCENES['tick-expressions'] = () => [2400, 760, strip([
  ['LISTEN LISTEN', { y: 520, s: .95, eyes: 'wide', look: [.4, 0], mouth: 'open', brows: { raise: 4 } }],
  ['IN LOVE', { y: 520, s: .95, eyes: 'heart', mouth: 'swoon', rot: -8 }],
  ['OVERWOUND', { y: 520, s: .95, eyes: 'spiral', mouth: 'open', rot: 10 }],
  ['PROUD', { y: 520, s: .95, eyes: 'happy', mouth: 'grin' }],
  ['NIGHT SHIFT', { y: 520, s: .95, night: true, eyes: 'wide', mouth: 'grin' }],
], tick, 2400, 760)];
SCENES['loupe-expressions'] = () => [2400, 640, strip([
  ['UNIMPRESSED', { y: 250, s: .78, shadow: false, eye: { look: [.3, .1], lid: .48 }, brow: { peak: 0, tilt: 0, raise: -8 } }],
  ['SIDE-EYE', { y: 250, s: .78, shadow: false, eye: { look: [.9, .1], lid: .4, tilt: 8 }, brow: { peak: 30, tilt: -12 } }],
  ['APPALLED', { y: 250, s: .78, shadow: false, eye: { look: [0, 0], lid: 0, wide: true, pin: true }, brow: { raise: 16, peak: 0 } }],
  ['SMITTEN', { y: 250, s: .78, shadow: false, eye: { look: [0, -.3], lid: .3, lower: .2 }, brow: { raise: 10, peak: 0, tilt: 4 } }],
  ['VERDICT', { y: 250, s: .78, shadow: false, eye: { look: [0, 0], lid: .55, tilt: -6 }, brow: { peak: 10, tilt: 8 } }],
], loupe, 2400, 640)];

window.SCENES_META = Object.keys(SCENES);
window.render = name => {
  uid = 0;
  const [w, h, body] = SCENES[name]();
  const s = document.getElementById('s');
  s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', `0 0 ${w} ${h}`);
  s.innerHTML = defs() + body;
  return [w, h];
};
document.fonts.load('40px Fraunces').then(() => Promise.all([document.fonts.load('italic 40px Fraunces'), document.fonts.load('40px Hanken'), document.fonts.load('500 20px Mono'), document.fonts.load('20px Mono')])).then(() => { window.READY = true; });
