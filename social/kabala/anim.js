// Animációs segédek a Lume-figurákhoz: kulcskockák, járásciklus, pislogás, szemmozgás.
// A cast.js után töltődik be.

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeBack = k => { const c = 1.70158 * 1.2; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const seg = (t, a, b, ez = ease) => ez(clamp((t - a) / (b - a)));
const pop = (t, a, d = .45) => { const k = clamp((t - a) / d); return k <= 0 ? 0 : k >= 1 ? 1 : easeBack(k); };

// determinisztikus „véletlen"
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// értékek keverése: szám, tömb, objektum (pl. kar-póz)
function mixV(a, b, k) {
  if (typeof a === 'number') return lerp(a, b, k);
  if (Array.isArray(a)) return a.map((v, i) => mixV(v, b[i], k));
  if (a && typeof a === 'object') { const o = {}; for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const va = a[key], vb = b[key];
    o[key] = (va === undefined) ? vb : (vb === undefined) ? va : (typeof va === 'string' || typeof va === 'boolean') ? (k < .5 ? va : vb) : mixV(va, vb, k); } return o; }
  return k < .5 ? a : b;
}
// kulcskocka-sáv: [[idő, érték, (átmenet mp), (easing)], ...]
function track(t, keys, dur = .3, ez = ease) {
  let i = -1;
  for (let j = 0; j < keys.length; j++) if (t >= keys[j][0]) i = j;
  if (i <= 0) return keys[0][1];
  const [t1, v1, d1, e1] = keys[i];
  const k = (e1 || ez)(clamp((t - t1) / (d1 ?? dur)));
  return mixV(keys[i - 1][1], v1, k);
}

// pislogás: 2,2-4,6 mp-enként, néha dupla
function blinkTimes(seed, dur, extra = []) {
  const r = rng(seed), out = [...extra]; let t = 1.2 + r() * 1.5;
  while (t < dur) { out.push(t); if (r() < .18) out.push(t + .28); t += 2.2 + r() * 2.4; }
  return out.sort((a, b) => a - b);
}
function blinkAmount(t, times) {
  let v = 0;
  for (const b of times) { const d = t - b; if (d < 0 || d > .2) continue;
    v = Math.max(v, d < .05 ? d / .05 : d < .08 ? 1 : 1 - (d - .08) / .12); }
  return v;
}
// apró szemrebbenések egy célirány körül
function saccade(t, seed) {
  const r = rng(seed + Math.floor(t / .7)); return [(r() - .5) * .16, (r() - .5) * .12];
}

// Ten-Ten járásciklusa: fázis (0..1 egy teljes, kétlépéses ciklus), amp 0..1
function ttWalk(phase, amp, s) {
  const a2 = phase * Math.PI * 2;
  const bob = -9 * (1 - Math.abs(Math.sin(a2))) * amp;
  const leg = side => {
    const ph = a2 + (side > 0 ? Math.PI : 0);
    const lift = Math.max(0, Math.cos(ph)) * 34 * amp;
    const ex = side * 58 + 48 * Math.sin(ph) * amp;
    const ey = 330 - lift - bob / s;
    const hx = side * 33;
    return { end: [ex, ey], c: [(hx + ex) / 2 + 12 * amp, 245 - lift * .55 - bob / s], foot: -16 * Math.max(0, Math.cos(ph)) * amp + 4 * Math.sin(ph) * amp };
  };
  return { bob, legs: { L: leg(-1), R: leg(1) }, swing: Math.sin(a2) * amp, rot: (3.5 + 2 * Math.sin(2 * a2)) * amp };
}
// lépések pillanatai (talp leér): amikor sin(2πφ) = ±1
function stepTimes(phaseAt, t0, t1, dt = 1 / 120) {
  const out = []; let prev = null;
  for (let t = t0; t <= t1; t += dt) { const v = Math.sin(phaseAt(t) * Math.PI * 2); const sgn = Math.sign(Math.abs(v) - .995);
    if (prev !== null && sgn > 0 && prev <= 0) out.push(+t.toFixed(3)); prev = sgn; }
  return out;
}

// a beszéd adatai a timeline-ból
function speechAt(TL, t, who) {
  for (const l of TL.lines) if (l.who === who && t >= l.start && t < l.start + l.dur) {
    const i = Math.min(Math.floor((t - l.start) * TL.fps), l.env.length - 1);
    return { o: l.env[i] || 0, w: l.wide[i] || 0, line: l };
  }
  return null;
}
// hangsúlyos szó után lecsengő impulzus
function emphasis(TL, t, who, decay = .45) {
  let v = 0;
  for (const l of TL.lines) if (l.who === who) for (const [, wt, emp] of l.words) if (emp) { const d = t - wt;
    if (d >= -.08 && d < decay) v = Math.max(v, d < 0 ? (d + .08) / .08 : 1 - d / decay); }
  return v;
}
const wordTime = (TL, id, word) => { const l = TL.lines.find(x => x.id === id); const w = l.words.find(x => x[0].toLowerCase().startsWith(word.toLowerCase())); return w ? w[1] : l.start; };
const lineStart = (TL, id) => TL.lines.find(x => x.id === id).start;
const lineEnd = (TL, id) => { const l = TL.lines.find(x => x.id === id); return l.start + l.dur; };
