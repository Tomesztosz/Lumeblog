// A tábla diái, vászonra rajzolva (1600×1130). Minden dia: (g, k, t) → rajzol; k = a beúszás 0..1.
const INK = '#2a2d27', RED = '#b8432c', BRASS = '#a8894f', PAPER = '#fbf8f0', LUME = '#d7eb96';
export const SW = 1600, SH = 1130;

const fr = (g, size, w = 600, it = false) => { g.font = `${it ? 'italic ' : ''}${w} ${size}px Fraunces`; };
const mono = (g, size) => { g.font = `500 ${size}px Mono`; };
function text(g, s, x, y, o = {}) { g.save(); g.fillStyle = o.color || INK; g.textAlign = o.align || 'left'; g.globalAlpha = o.alpha ?? 1;
  if (o.ls) g.letterSpacing = `${o.ls}px`; g.fillText(s, x, y); g.restore(); }
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function stroke(g, w = 6, c = INK) { g.lineWidth = w; g.strokeStyle = c; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }

function watch(g, x, y, r, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot || 0);
  rr(g, -r * .42, -r * 1.8, r * .84, r * 3.6, r * .2); g.fillStyle = o.strap || '#6e4b2e'; g.fill(); stroke(g, 6);
  g.beginPath();
  if (o.shape === 'square') rr(g, -r * .9, -r, r * 1.8, r * 2, r * .2); else if (o.shape === 'cushion') rr(g, -r, -r, 2 * r, 2 * r, r * .55); else g.arc(0, 0, r, 0, Math.PI * 2);
  const gr = g.createLinearGradient(-r, -r, r, r); gr.addColorStop(0, '#eef0ea'); gr.addColorStop(1, '#9ea397'); if (o.shape === 'cushion') { gr.addColorStop(0, '#ead39d'); gr.addColorStop(1, '#8a6c38'); }
  g.fillStyle = gr; g.fill(); stroke(g, 6);
  g.beginPath(); if (o.shape === 'square') rr(g, -r * .72, -r * .82, r * 1.44, r * 1.64, r * .1); else g.arc(0, 0, r * .78, 0, Math.PI * 2);
  g.fillStyle = o.dial || PAPER; g.fill(); stroke(g, 3);
  const tc = o.dial ? '#f2f0e8' : INK;
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.beginPath(); g.moveTo(Math.sin(a) * r * .6, -Math.cos(a) * r * .6); g.lineTo(Math.sin(a) * r * .72, -Math.cos(a) * r * .72); stroke(g, i % 3 ? 3 : 6, tc); }
  const hand = (a, l, w) => { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a) * l, -Math.cos(a) * l); stroke(g, w, tc); };
  hand(o.h ?? -1, r * .4, 7); hand(o.m ?? 1, r * .6, 5);
  g.beginPath(); g.arc(0, 0, 6, 0, Math.PI * 2); g.fillStyle = tc; g.fill();
  g.restore();
}
function tag(g, x, y, rot, label, sub = 'RETURN') {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.beginPath(); g.moveTo(0, -70); g.quadraticCurveTo(-6, -30, 0, 0); stroke(g, 3);
  g.beginPath(); g.moveTo(-26, 0); g.lineTo(26, 0); g.lineTo(76, 38); g.lineTo(76, 150); g.quadraticCurveTo(76, 160, 66, 160); g.lineTo(-66, 160); g.quadraticCurveTo(-76, 160, -76, 150); g.lineTo(-76, 38); g.closePath();
  g.fillStyle = '#fbf3d9'; g.fill(); stroke(g, 5);
  g.beginPath(); g.arc(0, 22, 8, 0, Math.PI * 2); g.fillStyle = '#e8e2d0'; g.fill(); stroke(g, 3);
  mono(g, 22); text(g, sub, 0, 84, { align: 'center', ls: 3 });
  fr(g, 38, 600, true); text(g, label, 0, 130, { align: 'center', color: RED });
  g.restore();
}

export const SLIDES = {
  title(g) {
    mono(g, 34); text(g, 'A LUME STORY', SW / 2, 420, { align: 'center', alpha: .55, ls: 8 });
    fr(g, 170); text(g, 'The Borrower', SW / 2, 610, { align: 'center' });
    g.beginPath(); g.moveTo(SW / 2 - 170, 680); g.lineTo(SW / 2 + 170, 680); stroke(g, 6, BRASS);
  },
  salary(g, k, t) {
    watch(g, 430, 560, 190, { h: -1.05, m: 1.05 });
    tag(g, 590, 330, .2, '£££££', 'PRICE');
    // pénztárca és a moly
    g.save(); g.translate(1130, 640);
    rr(g, -230, -80, 460, 260, 18); g.fillStyle = '#7a5534'; g.fill(); stroke(g, 7);
    g.beginPath(); g.moveTo(-230, -80); g.lineTo(0, -220); g.lineTo(230, -80); g.fillStyle = '#8c6440'; g.fill(); stroke(g, 7);
    g.setLineDash([16, 14]); g.beginPath(); g.moveTo(-200, -50); g.lineTo(200, -50); stroke(g, 4, '#d1ae7e'); g.setLineDash([]);
    mono(g, 36); text(g, "AN INTERN'S SALARY", 0, 300, { align: 'center', alpha: .7, ls: 3 });
    g.restore();
    const m = t, mx = 1130 + Math.sin(m * 2.6) * 120 + 40, my = 360 - ((m * 60) % 260) + Math.sin(m * 7) * 14, f = Math.abs(Math.sin(m * 16));
    g.save(); g.translate(mx, my); g.rotate(Math.sin(m * 6) * .2);
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 26, -10, 32, 8 + 16 * f, 0, 0, Math.PI * 2); g.fillStyle = '#b9ad94'; g.fill(); stroke(g, 4); }
    g.beginPath(); g.ellipse(0, 0, 10, 24, 0, 0, Math.PI * 2); g.fillStyle = '#8f8470'; g.fill(); stroke(g, 4);
    g.restore();
  },
  borrowed(g, k, t) {
    fr(g, 120); text(g, 'Borrowed.', SW / 2, 190, { align: 'center' });
    const sw = s => Math.sin(t * 2.2 + s) * .08;
    watch(g, 330, 520, 130, { rot: sw(0) * .4, h: -1.4, m: 1.2 }); tag(g, 330, 760, sw(1), 'Friday');
    watch(g, 800, 520, 130, { shape: 'cushion', dial: '#2f3a4a', rot: sw(2) * .4, h: -.6, m: 1.6 }); tag(g, 800, 760, sw(3), 'Monday');
    watch(g, 1270, 520, 130, { shape: 'square', strap: '#2f2f2f', rot: sw(4) * .4, h: .2, m: 2.6 }); tag(g, 1270, 760, sw(5), 'ASAP!');
  },
  photo(g, k, t, ex) {
    // kereső: sarokjelek egy óra körül, a vaku pillanatában villan
    watch(g, SW / 2, 560, 230, { h: -1.05, m: 1.05 });
    for (const [x, y, dx, dy] of [[380, 180, 1, 1], [1220, 180, -1, 1], [380, 960, 1, -1], [1220, 960, -1, -1]]) {
      g.beginPath(); g.moveTo(x, y + dy * 90); g.lineTo(x, y); g.lineTo(x + dx * 90, y); stroke(g, 10); }
    g.beginPath(); g.arc(SW / 2, 570, 22, 0, Math.PI * 2); stroke(g, 4, RED);
    mono(g, 32); text(g, 'PHOTOGRAPHED · STUDIED · RETURNED', SW / 2, 1070, { align: 'center', alpha: .6, ls: 4 });
    const fl = ex.flash;
    if (fl > 0) { g.fillStyle = `rgba(255,255,255,${fl})`; g.fillRect(0, 0, SW, SH); }
  },
  chart(g, k, t, ex) {
    fr(g, 96); text(g, 'Cost of a collection', 110, 170);
    const a = ex.grow, b = ex.grow2;
    g.beginPath(); g.moveTo(140, 920); g.lineTo(1460, 920); stroke(g, 7);
    g.beginPath(); rr(g, 290, 920 - 600 * a, 340, 600 * a, 6); g.fillStyle = RED; g.fill(); stroke(g, 6);
    mono(g, 40); text(g, 'BUYING', 460, 990, { align: 'center', ls: 4 });
    mono(g, 44); text(g, '£££££££', 460, 890 - 600 * a, { align: 'center', color: RED, alpha: a });
    g.beginPath(); rr(g, 970, 912 - 6 * b, 340, 8 + 6 * b, 4); g.fillStyle = LUME; g.fill(); stroke(g, 6);
    mono(g, 40); text(g, 'BORROWING', 1140, 990, { align: 'center', ls: 4 });
    fr(g, 120, 700); text(g, '£0*', 1140, 840, { align: 'center', alpha: b });
    mono(g, 28); text(g, '*RETURNS REQUIRED', 1460, 1070, { align: 'right', alpha: .6 * b, ls: 3 });
  },
  hasselblad(g) {
    g.save(); g.translate(440, 600);
    rr(g, -260, -180, 520, 390, 30); g.fillStyle = '#2b2e28'; g.fill(); stroke(g, 8);
    rr(g, -220, -290, 440, 110, 14); g.fillStyle = '#3a3e36'; g.fill(); stroke(g, 8);
    g.beginPath(); g.arc(0, 20, 160, 0, Math.PI * 2); g.fillStyle = '#1c1f1a'; g.fill(); stroke(g, 8);
    g.beginPath(); g.arc(0, 20, 120, 0, Math.PI * 2); g.fillStyle = '#33434f'; g.fill(); stroke(g, 10, '#c9ccc4');
    g.beginPath(); g.arc(0, 20, 70, 0, Math.PI * 2); g.fillStyle = '#1a2530'; g.fill();
    g.beginPath(); g.arc(0, 20, 76, Math.PI * 1.1, Math.PI * 1.45); stroke(g, 14, 'rgba(255,255,255,.45)');
    g.restore();
    mono(g, 40); text(g, 'CHIEF OF STRATEGY', 860, 440, { alpha: .7, ls: 5 });
    fr(g, 150); text(g, 'Hasselblad', 850, 600);
    g.beginPath(); g.moveTo(860, 660); g.lineTo(1300, 660); stroke(g, 6, BRASS);
  },
  y2017(g, k, t, ex) {
    g.save(); g.translate(420, 570);
    rr(g, -250, -320, 500, 640, 24); g.fillStyle = PAPER; g.fill(); stroke(g, 8);
    rr(g, -250, -320, 500, 150, 24); g.fillStyle = RED; g.fill(); stroke(g, 8);
    mono(g, 58); text(g, 'AUGUST', 0, -222, { align: 'center', color: PAPER, ls: 6 });
    fr(g, 360, 600); text(g, '8', 0, 160, { align: 'center' });
    mono(g, 50); text(g, '2017', 0, 270, { align: 'center', alpha: .7 });
    const tr = ex.tear;
    if (tr < 1) { g.save(); g.globalAlpha = 1 - tr; g.translate(tr * 420, -tr * 200); g.rotate(tr * .7);
      g.fillStyle = PAPER; g.fillRect(-250, -170, 500, 490); g.lineWidth = 6; g.strokeStyle = INK; g.strokeRect(-250, -170, 500, 490);
      fr(g, 360, 600); text(g, '7', 0, 160, { align: 'center', alpha: .35 }); g.restore(); }
    g.restore();
    mono(g, 40); text(g, 'FIRST WATCH', 820, 400, { alpha: .7, ls: 5 });
    fr(g, 128); text(g, 'MING 17.01', 810, 550);
    g.beginPath(); g.moveTo(820, 610); g.lineTo(1400, 610); stroke(g, 6, BRASS);
    fr(g, 56, 400, true); text(g, 'two dial colours,', 820, 700, { alpha: .8 }); text(g, '150 planned of each', 820, 776, { alpha: .8 });
  },
};

export function drawBoard(g, list, t, ex) {
  // list: [[idő, név], ...]; az új dia jobbról tolja ki a régit
  g.fillStyle = PAPER; g.fillRect(0, 0, SW, SH);
  let cur = 0; for (let i = 0; i < list.length; i++) if (t >= list[i][0]) cur = i;
  const t0 = list[cur][0], k = cur === 0 ? 1 : Math.min(1, Math.max(0, (t - t0) / .5)), e = 1 - Math.pow(1 - k, 3);
  const paint = (name, dx) => { g.save(); g.translate(dx, 0); g.fillStyle = PAPER; g.fillRect(0, 0, SW, SH); SLIDES[name](g, 1, t - list[list.findIndex(x => x[1] === name)][0], ex); g.restore(); };
  if (k < 1 && cur > 0) paint(list[cur - 1][1], -e * SW);
  paint(list[cur][1], (1 - e) * SW);
  mono(g, 26); text(g, `${String(cur).padStart(2, '0')} / ${String(list.length - 1).padStart(2, '0')}`, SW - 40, SH - 34, { align: 'right', alpha: cur ? .4 : 0 });
}
