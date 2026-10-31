// Ten-Ten 3D, 2. változat: felnőttesebb, részletesebb óraúriember.
// Panda-kronográf: a két segédszámlap a szeme, a 10:10-es mutatópár a bajusza,
// a dátumablak a szája, a piros stoppermutató az „antennája".
import * as THREE from 'three';
import { RoundedBoxGeometry } from './vendor/jsm/geometries/RoundedBoxGeometry.js';

const D2R = THREE.MathUtils.degToRad;
export const COL = { gold: '#d6b06a', dial: '#f4eee0', ink: '#1f221d', lume: '#d7eb96', leather: '#6a3f26', leatherDark: '#45281a', red: '#b8432c' };

export async function loadFonts() {
  for (const [fam, file, w] of [['Fraunces', 'fraunces-latin-full-normal.woff2', '100 900'], ['Mono', 'ibm-plex-mono-latin-500-normal.woff2', '500'], ['Hanken', 'hanken-grotesk-latin-wght-normal.woff2', '100 900']]) {
    const f = new FontFace(fam, `url(fonts/${file})`, { weight: w }); await f.load(); document.fonts.add(f);
  }
}

function canvasTex(size, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); draw(g, size);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

function dialTexture(night) {
  return canvasTex(2048, (g, S) => {
    const c = S / 2, r = S / 2;
    const grd = g.createRadialGradient(c * .8, c * .7, 0, c, c, r);
    grd.addColorStop(0, night ? '#2a3126' : '#fbf7ec'); grd.addColorStop(1, night ? '#1d221b' : '#e9e1cd');
    g.fillStyle = grd; g.fillRect(0, 0, S, S);
    // napsugár-csiszolás
    g.globalAlpha = night ? .05 : .07;
    for (let i = 0; i < 360; i++) { g.strokeStyle = i % 2 ? '#fff' : '#b9ab88'; g.lineWidth = 3; g.beginPath(); g.moveTo(c, c);
      g.lineTo(c + Math.sin(i * Math.PI / 180) * r, c - Math.cos(i * Math.PI / 180) * r); g.stroke(); }
    g.globalAlpha = 1;
    const ink = night ? '#4b5545' : '#2b2e28';
    // percskála
    for (let i = 0; i < 300; i++) { const a = i * Math.PI / 150, big = i % 25 === 0, mid = i % 5 === 0;
      const r1 = r * .955, r0 = r * (big ? .9 : mid ? .918 : .935);
      g.strokeStyle = ink; g.lineWidth = big ? 5 : mid ? 3 : 1.6;
      g.beginPath(); g.moveTo(c + Math.sin(a) * r0, c - Math.cos(a) * r0); g.lineTo(c + Math.sin(a) * r1, c - Math.cos(a) * r1); g.stroke(); }
    g.beginPath(); g.arc(c, c, r * .958, 0, Math.PI * 2); g.lineWidth = 3; g.stroke();
    g.beginPath(); g.arc(c, c, r * .885, 0, Math.PI * 2); g.lineWidth = 1.6; g.stroke();
    // felirat
    g.fillStyle = ink; g.textAlign = 'center';
    g.font = `500 ${S * .062}px Fraunces`; g.fillText('Lume', c, c - r * .5);
    g.font = `500 ${S * .019}px Mono`; g.fillText('CHRONOGRAPH  ·  1969', c, c - r * .43);
    g.font = `500 ${S * .016}px Mono`; g.fillStyle = night ? '#4b5545' : '#8a7f66'; g.fillText('SWISS-ISH  ·  VERY MADE', c, c + r * .82);
  });
}
function subdialTexture(night) {
  return canvasTex(512, (g, S) => {
    const c = S / 2, r = S / 2;
    g.fillStyle = night ? '#121510' : '#1d201b'; g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.fill();
    // csigavonalas guilloché
    g.strokeStyle = night ? '#1c2119' : '#2a2e27'; g.lineWidth = 2.2;
    for (let k = 1; k < 22; k++) { g.beginPath(); g.arc(c, c, r * k / 22, 0, Math.PI * 2); g.stroke(); }
    g.strokeStyle = night ? '#9fb26a' : '#e9e4d6'; g.lineWidth = 3;
    for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30, r0 = r * (i % 5 ? .84 : .76);
      g.globalAlpha = i % 5 ? .45 : .9; g.beginPath(); g.moveTo(c + Math.sin(a) * r0, c - Math.cos(a) * r0); g.lineTo(c + Math.sin(a) * r * .92, c - Math.cos(a) * r * .92); g.stroke(); }
    g.globalAlpha = 1; g.fillStyle = night ? '#9fb26a' : '#e9e4d6'; g.font = `500 ${S * .1}px Mono`; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const [n, a] of [['30', 0], ['10', 120], ['20', 240]]) { const rr = r * .58; g.fillText(n, c + Math.sin(a * Math.PI / 180) * rr, c - Math.cos(a * Math.PI / 180) * rr); }
  });
}
function leatherTexture(color) {
  return canvasTex(512, (g, S) => {
    g.fillStyle = color; g.fillRect(0, 0, S, S);
    const im = g.getImageData(0, 0, S, S);
    for (let i = 0; i < im.data.length; i += 4) { const n = (Math.random() - .5) * 18; im.data[i] += n; im.data[i + 1] += n; im.data[i + 2] += n; }
    g.putImageData(im, 0, 0);
    g.strokeStyle = '#d9b48a'; g.lineWidth = 6; g.setLineDash([22, 16]);
    for (const u of [.22, .78]) { g.beginPath(); g.moveTo(u * S, 0); g.lineTo(u * S, S); g.stroke(); }
  });
}

function dauphine(L, w) {
  const s = new THREE.Shape();
  s.moveTo(0, -w * 1.6); s.lineTo(w, 0); s.lineTo(0, L); s.lineTo(-w, 0); s.lineTo(0, -w * 1.6);
  const g = new THREE.ExtrudeGeometry(s, { depth: .012, bevelEnabled: true, bevelThickness: .01, bevelSize: .006, bevelSegments: 2 });
  return g;
}
function caseGeometry(R, h, e) {
  const pts = [new THREE.Vector2(0.0001, -h)];
  const arc = (cx, cy, a0, a1) => { for (let i = 0; i <= 12; i++) { const a = a0 + (a1 - a0) * i / 12; pts.push(new THREE.Vector2(cx + Math.cos(a) * e, cy + Math.sin(a) * e)); } };
  arc(R - e, -h + e, -Math.PI / 2, 0); arc(R - e, h - e, 0, Math.PI / 2);
  pts.push(new THREE.Vector2(0.0001, h));
  const g = new THREE.LatheGeometry(pts, 128); g.rotateX(Math.PI / 2); return g;
}
// körszelet a szemhéjhoz: a kör azon része, ami a (lefelé dönthető) vonal felett van
function lidGeometry(r, lid, tilt) {
  const y0 = r - 2 * r * lid, ca = Math.cos(tilt), sa = Math.sin(tilt);
  const pts = []; const N = 64;
  const inside = p => (-sa * p.x + ca * p.y) >= y0;
  for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, p = new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r), q = new THREE.Vector2(Math.cos((i + 1) / N * Math.PI * 2) * r, Math.sin((i + 1) / N * Math.PI * 2) * r);
    const ip = inside(p), iq = inside(q);
    if (ip) pts.push(p);
    if (ip !== iq) { const dp = -sa * p.x + ca * p.y - y0, dq = -sa * q.x + ca * q.y - y0, k = dp / (dp - dq); pts.push(new THREE.Vector2(p.x + (q.x - p.x) * k, p.y + (q.y - p.y) * k)); } }
  if (pts.length < 3) return null;
  return new THREE.ShapeGeometry(new THREE.Shape(pts));
}

export function makeTenTen(o = {}) {
  const night = !!o.night;
  const env = o.envMap || null;
  const M = {
    gold: new THREE.MeshPhysicalMaterial({ color: night ? '#6c6a52' : COL.gold, metalness: 1, roughness: .32, envMapIntensity: night ? .15 : 1, clearcoat: .3 }),
    polish: new THREE.MeshPhysicalMaterial({ color: night ? '#77735a' : '#e2c47e', metalness: 1, roughness: .14, envMapIntensity: night ? .2 : 1.2 }),
    dial: new THREE.MeshPhysicalMaterial({ map: dialTexture(night), roughness: .55, clearcoat: .6, clearcoatRoughness: .2 }),
    sub: new THREE.MeshPhysicalMaterial({ map: subdialTexture(night), roughness: .35, clearcoat: 1, clearcoatRoughness: .08, emissive: new THREE.Color(COL.lume), emissiveIntensity: 0 }),
    lid: new THREE.MeshStandardMaterial({ color: night ? '#262c23' : '#f2ebdb', roughness: .6, side: THREE.DoubleSide }),
    lash: new THREE.MeshStandardMaterial({ color: night ? '#3f4739' : COL.ink, roughness: .5 }),
    lume: new THREE.MeshStandardMaterial({ color: night ? COL.lume : '#e4ecc0', roughness: .5, emissive: new THREE.Color(COL.lume), emissiveIntensity: night ? 1.6 : .04 }),
    red: new THREE.MeshStandardMaterial({ color: night ? '#4a2a22' : COL.red, roughness: .4, metalness: .2 }),
    leather: new THREE.MeshPhysicalMaterial({ map: leatherTexture(night ? '#2c1d14' : COL.leather), roughness: .62, sheen: .5, sheenColor: new THREE.Color('#e8c7a0'), sheenRoughness: .5 }),
    shoe: new THREE.MeshPhysicalMaterial({ color: night ? '#1d1410' : COL.leatherDark, roughness: .3, clearcoat: .8, clearcoatRoughness: .15 }),
    glove: new THREE.MeshPhysicalMaterial({ color: night ? '#2a201a' : '#5a3a26', roughness: .55, sheen: .5, sheenColor: new THREE.Color('#d8b490') }),
    window: new THREE.MeshStandardMaterial({ color: night ? '#1e231c' : '#fffdf6', roughness: .5 }),
    mouth: new THREE.MeshStandardMaterial({ color: '#241614', roughness: .5 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0, roughness: .02, transparent: true, opacity: night ? .05 : .12, envMapIntensity: 1.4, depthWrite: false }),
  };
  if (env) for (const m of Object.values(M)) if ('envMap' in m && !m.envMap) m.envMap = env;
  const S = (m, g) => { const x = new THREE.Mesh(g, m); x.castShadow = x.receiveShadow = true; return x; };

  const root = new THREE.Group();
  const body = new THREE.Group(); body.position.y = 1.62; root.add(body);
  const R = 1, h = .26;
  body.add(S(M.gold, caseGeometry(R, h, .1)));
  // recézett lünetta
  const bez = S(M.polish, new THREE.TorusGeometry(.9, .07, 24, 160)); bez.scale.z = .7; bez.position.z = h - .005; body.add(bez);
  const knurl = new THREE.InstancedMesh(new THREE.BoxGeometry(.014, .05, .05), M.gold, 120); const dm = new THREE.Object3D();
  for (let i = 0; i < 120; i++) { const a = i / 120 * Math.PI * 2; dm.position.set(Math.sin(a) * .975, Math.cos(a) * .975, h - .01); dm.rotation.set(0, 0, -a); dm.updateMatrix(); knurl.setMatrixAt(i, dm.matrix); }
  body.add(knurl);
  const dial = S(M.dial, new THREE.CircleGeometry(.84, 128)); dial.position.z = h + .002; body.add(dial);
  const glass = new THREE.Mesh(new THREE.SphereGeometry(2.2, 64, 16, 0, Math.PI * 2, 0, Math.asin(.86 / 2.2)), M.glass);
  glass.rotation.x = Math.PI / 2; glass.position.z = h + .045 - 2.2; body.add(glass);
  const face = new THREE.Group(); face.position.z = h + .004; body.add(face);
  // szárak
  for (const sy of [-1, 1]) for (const sx of [-1, 1]) {
    const lug = S(M.gold, new RoundedBoxGeometry(.13, .3, .3, 3, .04)); lug.position.set(sx * .33, sy * 1.0, -.02); lug.rotation.z = sx * sy * -.12; body.add(lug);
  }
  // korona, nyomógombok
  const crown = new THREE.Group(); crown.position.set(R + .02, 0, 0); body.add(crown);
  const cr = S(M.gold, new THREE.CylinderGeometry(.12, .12, .13, 48)); cr.rotation.z = Math.PI / 2; cr.position.x = .07; crown.add(cr);
  const flutes = new THREE.InstancedMesh(new THREE.BoxGeometry(.13, .02, .02), M.polish, 24);
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; dm.position.set(.07, Math.cos(a) * .12, Math.sin(a) * .12); dm.rotation.set(a, 0, 0); dm.updateMatrix(); flutes.setMatrixAt(i, dm.matrix); }
  crown.add(flutes);
  for (const a of [58, 122]) { const p = new THREE.Group(); p.rotation.z = D2R(90 - a); body.add(p);
    const pu = S(M.polish, new THREE.CylinderGeometry(.06, .06, .14, 32)); pu.rotation.z = Math.PI / 2; pu.position.x = R + .04; p.add(pu); }
  // alkalmazott indexek lume-betéttel (a szemek helyén nincs)
  for (let i = 0; i < 12; i++) {
    if ([2, 4, 8, 10].includes(i)) continue;
    const a = i * Math.PI / 6;
    const g = new THREE.Group(); g.position.set(Math.sin(a) * .66, Math.cos(a) * .66, .01); g.rotation.z = -a; face.add(g);
    for (const dx of i === 0 ? [-.035, .035] : [0]) {
      const b = S(M.polish, new RoundedBoxGeometry(.05, .15, .03, 2, .012)); b.position.x = dx; g.add(b);
      const l = new THREE.Mesh(new RoundedBoxGeometry(.026, .12, .02, 2, .008), M.lume); l.position.set(dx, 0, .009); g.add(l);
    }
  }
  // szemek: segédszámlapok, fémkerettel, mutatóval, szemhéjjal
  const eyes = [];
  for (const s of [-1, 1]) {
    const e = new THREE.Group(); e.position.set(s * .34, .08, 0); face.add(e);
    const rim = S(M.polish, new THREE.TorusGeometry(.2, .018, 12, 64)); rim.position.z = .012; e.add(rim);
    const sd = new THREE.Mesh(new THREE.CircleGeometry(.2, 64), M.sub); sd.position.z = .004; e.add(sd);
    const hand = new THREE.Group(); hand.position.z = .016; e.add(hand);
    const hm = new THREE.Mesh(new THREE.BoxGeometry(.012, .13, .006), M.lume); hm.position.y = .055; hand.add(hm);
    const hc = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .012, 20), M.polish); hc.rotation.x = Math.PI / 2; hand.add(hc);
    const spark = new THREE.Mesh(new THREE.CircleGeometry(.032, 24), new THREE.MeshBasicMaterial({ color: night ? COL.lume : '#ffffff', transparent: true, opacity: night ? .8 : .85 }));
    spark.position.set(-.07, .08, .02); e.add(spark);
    const lid = new THREE.Mesh(undefined, M.lid); lid.position.z = .024; e.add(lid);
    const lash = new THREE.Mesh(new THREE.BoxGeometry(.44, .022, .012), M.lash); lash.position.z = .028; e.add(lash);
    const brow = new THREE.Group(); brow.position.set(0, .3, .02); e.add(brow);
    const bm = S(M.lash, new THREE.TorusGeometry(.2, .022, 10, 40, 1.3)); bm.rotation.z = Math.PI / 2 - .65; bm.position.y = -.17; bm.scale.z = .5; brow.add(bm);
    eyes.push({ g: e, hand, lid, lash, brow, spark, side: s });
  }
  // stoppermutató
  const chrono = new THREE.Group(); chrono.position.set(0, -.2, .05); face.add(chrono);
  const cn = new THREE.Mesh(new THREE.BoxGeometry(.012, .86, .008), M.red); cn.position.y = .34; chrono.add(cn);
  const cw = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, .01, 24), M.red); cw.rotation.x = Math.PI / 2; cw.position.y = -.12; chrono.add(cw);
  const ct = new THREE.Mesh(new THREE.SphereGeometry(.018, 12, 8), M.lume); ct.position.y = .76; chrono.add(ct);
  // bajusz
  const hands = new THREE.Group(); hands.position.set(0, -.2, .03); face.add(hands);
  const mk = (L, w) => { const p = new THREE.Group(); const m = S(M.polish, dauphine(L, w)); p.add(m);
    const lm = new THREE.Mesh(dauphine(L * .78, w * .35), M.lume); lm.position.set(0, L * .1, .022); p.add(lm); hands.add(p); return p; };
  const hourP = mk(.23, .045), minP = mk(.28, .04); minP.position.z = .03;
  const cap = S(M.polish, new THREE.CylinderGeometry(.04, .04, .03, 32)); cap.rotation.x = Math.PI / 2; cap.position.z = .075; hands.add(cap);
  // száj: dátumablak
  const mouth = new THREE.Group(); mouth.position.set(0, -.5, .006); face.add(mouth);
  const frame = S(M.polish, new RoundedBoxGeometry(.2, .13, .02, 2, .01)); mouth.add(frame);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(.16, .09), M.window); win.position.z = .012; mouth.add(win);
  const numTex = canvasTex(256, (g, Sz) => { g.fillStyle = night ? '#1e231c' : '#fffdf6'; g.fillRect(0, 0, Sz, Sz); g.fillStyle = night ? '#4b5545' : '#2b2e28'; g.font = `500 ${Sz * .55}px Mono`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('10', Sz / 2, Sz / 2 + 6); });
  win.material = new THREE.MeshStandardMaterial({ map: numTex, roughness: .5 });
  const open = new THREE.Mesh(new RoundedBoxGeometry(.15, .09, .01, 2, .04), M.mouth); open.position.z = .014; open.visible = false; mouth.add(open);
  // felső szíj: hátrahajló csonk, rajta egy bújtató
  const top = new THREE.Group(); top.position.set(0, 1.12, -.05); body.add(top);
  const xs = new THREE.Shape(); const sw = .23, sth = .04, sr = .03;
  xs.moveTo(-sw + sr, -sth); xs.lineTo(sw - sr, -sth); xs.quadraticCurveTo(sw, -sth, sw, 0); xs.quadraticCurveTo(sw, sth, sw - sr, sth);
  xs.lineTo(-sw + sr, sth); xs.quadraticCurveTo(-sw, sth, -sw, 0); xs.quadraticCurveTo(-sw, -sth, -sw + sr, -sth);
  const path = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -.12, 0), new THREE.Vector3(0, .12, -.01), new THREE.Vector3(0, .34, -.08), new THREE.Vector3(0, .46, -.26), new THREE.Vector3(0, .44, -.46)]);
  const strapG = new THREE.ExtrudeGeometry(xs, { steps: 48, extrudePath: path, bevelEnabled: false });
  const ts = S(M.leather, strapG); top.add(ts);
  const keeper = S(M.leather, new THREE.TorusGeometry(.26, .03, 8, 32)); keeper.scale.set(1, .25, 1); keeper.position.set(0, .3, -.06); keeper.rotation.x = Math.PI / 2 - .6; top.add(keeper);
  top.rotation.z = .08;
  // karok
  const arms = [];
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * .9, -.4, -.04); body.add(sh);
    const up = S(M.gold, new THREE.CapsuleGeometry(.065, .38, 8, 24)); up.position.y = -.25; sh.add(up);
    const hand = new THREE.Group(); hand.position.y = -.52; sh.add(hand);
    const palm = S(M.glove, new THREE.SphereGeometry(.11, 32, 20)); palm.scale.set(1, 1.1, .75); palm.position.y = -.06; hand.add(palm);
    for (let f = 0; f < 3; f++) { const fi = S(M.glove, new THREE.CapsuleGeometry(.032, .07, 6, 12)); fi.position.set((f - 1) * .055, -.17, .01); hand.add(fi); }
    const th = S(M.glove, new THREE.CapsuleGeometry(.03, .06, 6, 12)); th.position.set(-s * .1, -.07, .03); th.rotation.z = s * .9; hand.add(th);
    const cuff = S(M.glove, new THREE.CylinderGeometry(.085, .095, .06, 24)); cuff.position.y = .02; hand.add(cuff);
    sh.rotation.z = s * .22; arms.push({ sh, hand });
  }
  // lábak: szíjvégek, cipővel
  const legs = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(s * .25, .74, -.03); root.add(hip);
    const l = S(M.leather, new THREE.CapsuleGeometry(.1, .42, 8, 24)); l.position.y = -.3; hip.add(l);
    const foot = new THREE.Group(); foot.position.y = -.6; hip.add(foot);
    const shoe = S(M.shoe, new THREE.CapsuleGeometry(.12, .2, 8, 24)); shoe.rotation.x = Math.PI / 2; shoe.scale.set(1.05, 1, .75); shoe.position.set(0, -.04, .09); foot.add(shoe);
    if (s < 0) { const b = S(M.polish, new THREE.TorusGeometry(.055, .014, 8, 24)); b.position.set(0, .03, .14); b.rotation.x = -.6; foot.add(b); }
    legs.push({ hip, foot });
  }
  const rig = { root, body, face, eyes, hands, hourP, minP, chrono, mouth, open, win, frame, arms, legs, top, crown, M };
  rig.setTime = (hd, md) => { hourP.rotation.z = -D2R(hd); minP.rotation.z = -D2R(md); };
  rig.setChrono = d => { chrono.rotation.z = -D2R(d); };
  rig.setEyes = ({ look = [0, 0], lid = .15, tilt = 0, brow = 0, browTilt = 0, L = {}, R = {} } = {}) => {
    for (const e of eyes) {
      const sd = e.side < 0 ? L : R;
      const ld = sd.lid ?? lid, tl = (sd.tilt ?? tilt) * e.side, br = sd.brow ?? brow, bt = (sd.browTilt ?? browTilt) * e.side;
      const ang = Math.atan2(look[0], look[1] || .0001); e.hand.rotation.z = -ang;
      e.spark.position.set(-.07 + look[0] * .04, .08 + look[1] * .03, .02);
      if (e.lid.geometry) e.lid.geometry.dispose();
      const lg = ld > .01 ? lidGeometry(.205, Math.min(ld, 1), D2R(tl)) : null;
      e.lid.visible = !!lg; if (lg) e.lid.geometry = lg;
      const y0 = .205 - .41 * Math.min(ld, 1);
      e.lash.visible = ld > .02; e.lash.position.set(-Math.sin(D2R(tl)) * y0, Math.cos(D2R(tl)) * y0, .028); e.lash.rotation.z = D2R(tl);
      e.lash.scale.x = Math.max(.15, Math.sqrt(Math.max(0, .205 ** 2 - y0 ** 2)) / .205) * 1.05;
      e.brow.position.y = .3 + br * .06; e.brow.rotation.z = D2R(bt);
    }
  };
  rig.talk = (o2, w = 0) => { const on = o2 > .08; open.visible = on; win.visible = !on;
    if (on) { frame.scale.set(1 + w * .2, 1 + o2 * .8, 1); open.scale.set(1 + w * .2, .55 + o2 * 1.1, 1); } else frame.scale.set(1, 1, 1); };
  rig.setTime(292, 68); rig.setChrono(0); rig.setEyes({});
  return rig;
}
