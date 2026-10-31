// „The Borrower" 3D Reel. window.frame(t) beállít és lerenderel egy kockát.
import * as THREE from 'three';
import { EffectComposer } from '/3d/vendor/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/3d/vendor/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '/3d/vendor/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '/3d/vendor/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from '/3d/vendor/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from '/3d/vendor/jsm/geometries/RoundedBoxGeometry.js';
import { makeTenTen, loadFonts } from '/3d/tenten.js';
import { makeDot } from '/3d/dot3d.js';
import { drawBoard, SW, SH } from './slides.js';

const Q = new URLSearchParams(location.search);
const W = +(Q.get('w') || 720), H = Math.round(W * 16 / 9);
const SHADOWS = Q.has('shadow');
const D2R = THREE.MathUtils.degToRad;
// a segédek (clamp, lerp, seg, track, blinkTimes…) az anim.js-ből jönnek, globálisan

await loadFonts('/3d/fonts/');
const TL = await (await fetch('timeline.json')).json();
const L = id => TL.lines.find(l => l.id === id);
const ls = id => L(id).start, le = id => L(id).start + L(id).dur;
const wt = (id, w) => { const x = L(id).words.find(q => q[0].toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(w.toLowerCase())); return x ? x[1] : ls(id); };

// ---------- kulcsidők ----------
const X = {
  click: le('l12') + .18,
  flash: wt('l06', 'photographed') + .15,
  chart: wt('l06', 'collection') - .1,
  thisOne: wt('l11', 'this'),
  explode: ls('l13') + .1,
  end: TL.end,
};
X.slides = [[0, 'title'], [ls('l04') - .1, 'salary'], [wt('l05', 'borrowed') - .15, 'borrowed'], [ls('l06') - .1, 'photo'], [X.chart, 'chart'], [ls('l09') - .1, 'hasselblad'], [ls('l11') - .1, 'y2017']];
X.blinkT = blinkTimes(11, X.end, [ls('l03') - .25, ls('l09') - .3, X.click + .6]);
X.blinkD = blinkTimes(29, X.end);
window.EVENTS = { click: X.click, flash: X.flash, slides: X.slides.slice(1).map(s => s[0]), end: X.end, dotIn: ls('l02') - .35, tagDrop: .05 };

// ---------- renderer ----------
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H, false); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = SHADOWS; renderer.shadowMap.type = Q.has('pcf') ? THREE.PCFSoftShadowMap : THREE.VSMShadowMap;
renderer.toneMapping = THREE.AgXToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const pm = new THREE.PMREMGenerator(renderer);
scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
const cam = new THREE.PerspectiveCamera(38, W / H, .1, 80);
const rt = new THREE.WebGLRenderTarget(W, H, { samples: Q.has('nomsaa') ? 0 : 4, type: THREE.HalfFloatType });
const composer = new EffectComposer(renderer, rt);
composer.addPass(new RenderPass(scene, cam));
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0, .55, .3); composer.addPass(bloom);
composer.addPass(new OutputPass());

// fények
const hemi = new THREE.HemisphereLight('#fff4e2', '#bfae8c', .55); scene.add(hemi);
const key = new THREE.DirectionalLight('#fff1dc', 1.6); key.position.set(-4, 7, 6); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 10; key.shadow.blurSamples = 16; key.shadow.bias = -.0005;
Object.assign(key.shadow.camera, { left: -5, right: 5, top: 7, bottom: -1, near: 1, far: 25 }); scene.add(key);
const rim = new THREE.DirectionalLight('#ffffff', .9); rim.position.set(3, 5, -4); scene.add(rim);
// lágy talajárnyékok (árnyéktérkép helyett, sokkal gyorsabb)
const blobTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(.55, 'rgba(0,0,0,.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
const blob = (w, d, op = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: op }));
  m.rotation.x = -Math.PI / 2; m.position.y = .004; m.renderOrder = 1; scene.add(m); return m; };
const lampLight = new THREE.SpotLight('#ffd9a0', 30, 12, D2R(42), .55, 1.4); lampLight.position.set(.6, 5.75, .45); lampLight.target.position.set(.2, 0, .6);
lampLight.castShadow = true; lampLight.shadow.mapSize.set(1024, 1024); lampLight.shadow.radius = 8; scene.add(lampLight, lampLight.target);

// ---------- díszlet ----------
const wallTex = (() => { const c = document.createElement('canvas'); c.width = 1024; c.height = 1024; const g = c.getContext('2d');
  g.fillStyle = '#ebe3d0'; g.fillRect(0, 0, 1024, 1024); g.fillStyle = '#ddd2ba'; for (let x = 0; x < 1024; x += 128) g.fillRect(x, 0, 5, 1024);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 1.5); return t; })();
const wallM = new THREE.MeshStandardMaterial({ map: wallTex, roughness: .9 });
const wall = new THREE.Mesh(new THREE.PlaneGeometry(24, 14), wallM); wall.position.set(0, 6, -3.2); wall.receiveShadow = true; scene.add(wall);
const floorM = new THREE.MeshStandardMaterial({ color: '#cdbd9b', roughness: .75 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 20), floorM); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const base = new THREE.Mesh(new THREE.BoxGeometry(24, .28, .08), new THREE.MeshStandardMaterial({ color: '#b9a57c', roughness: .6 })); base.position.set(0, .14, -3.15); scene.add(base);

// tábla állványon
const board = new THREE.Group(); board.position.set(.15, 4.05, -1.7); board.rotation.x = -.04; scene.add(board);
const brass = new THREE.MeshPhysicalMaterial({ color: '#c9a35e', metalness: 1, roughness: .3 });
const wood = new THREE.MeshStandardMaterial({ color: '#7a5a3a', roughness: .6 });
const BWd = 3.5, BHt = BWd * SH / SW;
const boardFrame = new THREE.Mesh(new RoundedBoxGeometry(BWd + .2, BHt + .2, .1, 3, .04), brass); boardFrame.castShadow = true; board.add(boardFrame);
const slideCanvas = document.createElement('canvas'); slideCanvas.width = SW; slideCanvas.height = SH;
const slideG = slideCanvas.getContext('2d');
const slideTex = new THREE.CanvasTexture(slideCanvas); slideTex.colorSpace = THREE.SRGBColorSpace; slideTex.anisotropy = 8;
const screenM = new THREE.MeshStandardMaterial({ map: slideTex, roughness: .8, emissive: new THREE.Color('#ffffff'), emissiveMap: slideTex, emissiveIntensity: .12 });
const screen = new THREE.Mesh(new THREE.PlaneGeometry(BWd, BHt), screenM); screen.position.z = .055; board.add(screen);
for (const s of [-1, 1]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(.09, 4.4, .09), wood); leg.position.set(s * 1.15, -2.0, -.15); leg.rotation.z = s * .1; leg.castShadow = true; board.add(leg); }
const back = new THREE.Mesh(new THREE.BoxGeometry(.09, 4.6, .09), wood); back.position.set(0, -2.0, -.7); back.rotation.x = -.28; board.add(back);
const ledge = new THREE.Mesh(new RoundedBoxGeometry(BWd + .4, .08, .22, 2, .03), wood); ledge.position.set(0, -BHt / 2 - .14, .06); ledge.castShadow = true; board.add(ledge);

// függőlámpa húzózsinórral
const lamp = new THREE.Group(); lamp.position.set(.6, 5.9, .45); scene.add(lamp);
const shade = new THREE.Mesh(new THREE.SphereGeometry(.42, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: '#c49a52', metalness: 1, roughness: .25, side: THREE.DoubleSide }));
shade.castShadow = false; lamp.add(shade);
const bulbM = new THREE.MeshStandardMaterial({ color: '#fff3d6', emissive: new THREE.Color('#ffe2a8'), emissiveIntensity: 3 });
const bulb = new THREE.Mesh(new THREE.SphereGeometry(.12, 24, 16), bulbM); bulb.position.y = .02; lamp.add(bulb);
const lampCord = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 4, 8), new THREE.MeshStandardMaterial({ color: '#2a2a26' })); lampCord.position.y = 2.4; lamp.add(lampCord);
const chainM = new THREE.LineBasicMaterial({ color: '#4a4436' });
const chainGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
const chain = new THREE.Line(chainGeo, chainM); scene.add(chain);
const beadM = new THREE.MeshPhysicalMaterial({ color: '#c9a35e', metalness: 1, roughness: .25, emissive: new THREE.Color('#d7eb96'), emissiveIntensity: 0 });
const bead = new THREE.Mesh(new THREE.SphereGeometry(.05, 20, 14), beadM); bead.castShadow = true; scene.add(bead);

// a főszereplő óra: névtelen számlap, a lume a zafírban
const hero = new THREE.Group(); hero.position.set(.78, 0, 1.25); scene.add(hero);
const pedM = new THREE.MeshStandardMaterial({ color: '#5a4632', roughness: .55 });
const ped = new THREE.Mesh(new THREE.CylinderGeometry(.3, .34, .92, 48), pedM); ped.position.y = .46; ped.castShadow = ped.receiveShadow = true; hero.add(ped);
const pedTop = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, .05, 48), brass); pedTop.position.y = .94; hero.add(pedTop);
const watch = new THREE.Group(); watch.position.set(0, 1.5, 0); hero.add(watch);
const steel = new THREE.MeshPhysicalMaterial({ color: '#d9dcd6', metalness: 1, roughness: .2, clearcoat: .4 });
const wr = .4;
const caseLathe = (() => { const pts = [new THREE.Vector2(.001, -.07)]; const e = .045;
  for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i / 10 * Math.PI / 2; pts.push(new THREE.Vector2(wr - e + Math.cos(a) * e, -.07 + e + Math.sin(a) * e)); }
  for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI / 2; pts.push(new THREE.Vector2(wr - e + Math.cos(a) * e, .05 - e + Math.sin(a) * e)); }
  pts.push(new THREE.Vector2(.001, .05)); const g = new THREE.LatheGeometry(pts, 96); g.rotateX(Math.PI / 2); return g; })();
const caseM = new THREE.Mesh(caseLathe, steel); caseM.castShadow = true; watch.add(caseM);
for (const sy of [-1, 1]) for (const sx of [-1, 1]) { const lg = new THREE.Mesh(new RoundedBoxGeometry(.07, .2, .1, 2, .02), steel); lg.position.set(sx * .17, sy * .42, -.01); watch.add(lg); }
const crownW = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .06, 24), steel); crownW.rotation.z = Math.PI / 2; crownW.position.x = wr + .02; watch.add(crownW);
{ const stand = new THREE.Mesh(new THREE.CylinderGeometry(.03, .05, .52, 16), brass); stand.position.set(0, -.3, -.12); hero.add(stand); stand.position.y = 1.2; }
// rétegek: számlap (lent), mutatók (középen), zafír a lume-csatornákkal (fent)
const dialL = new THREE.Group(), handsL = new THREE.Group(), glassL = new THREE.Group(); watch.add(dialL, handsL, glassL);
const dialM = new THREE.MeshPhysicalMaterial({ color: '#12161a', roughness: .45, clearcoat: .5, clearcoatRoughness: .2, envMapIntensity: .4 });
{ const d = new THREE.Mesh(new THREE.CircleGeometry(wr * .86, 96), dialM); d.position.z = .052; dialL.add(d); }
const blueL = new THREE.MeshStandardMaterial({ color: '#cfd5dc', metalness: .7, roughness: .25, emissive: new THREE.Color('#5aa0ff'), emissiveIntensity: 0 });
const mkHand = (len, w, ang) => { const p = new THREE.Group(); p.rotation.z = -ang; handsL.add(p);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, len, .006), blueL); m.position.y = len / 2 - .02; p.add(m); return p; };
mkHand(.2, .028, D2R(300)); mkHand(.29, .02, D2R(60));
{ const c = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .01, 20), steel); c.rotation.x = Math.PI / 2; handsL.add(c); }
handsL.position.z = .062;
const lumeW = new THREE.MeshStandardMaterial({ color: '#e9edf0', roughness: .4, emissive: new THREE.Color('#f2f6ff'), emissiveIntensity: 0 });
const sapM = new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0, roughness: .03, transparent: true, opacity: .14, envMapIntensity: 1.6, depthWrite: false });
glassL.add(new THREE.Mesh(new THREE.CylinderGeometry(wr * .9, wr * .9, .02, 96).rotateX(Math.PI / 2), sapM));
for (let i = 0; i < 60; i++) { const big = i % 5 === 0; if (!big && i % 1) continue;
  const a = i / 60 * Math.PI * 2, len = big ? .07 : .028;
  const b = new THREE.Mesh(new THREE.BoxGeometry(big ? .018 : .007, len, .006), lumeW);
  b.position.set(Math.sin(a) * (wr * .78 - len / 2), Math.cos(a) * (wr * .78 - len / 2), -.012); b.rotation.z = -a; glassL.add(b); }
glassL.position.z = .085;
// árcédula
const tagCanvas = document.createElement('canvas'); tagCanvas.width = 256; tagCanvas.height = 400;
{ const g = tagCanvas.getContext('2d'); g.fillStyle = '#fbf3d9'; g.beginPath(); g.moveTo(80, 0); g.lineTo(176, 0); g.lineTo(256, 70); g.lineTo(256, 400); g.lineTo(0, 400); g.lineTo(0, 70); g.closePath(); g.fill();
  g.lineWidth = 8; g.strokeStyle = '#2a2d27'; g.stroke(); g.beginPath(); g.arc(128, 48, 16, 0, Math.PI * 2); g.fillStyle = '#d9d2bf'; g.fill(); g.lineWidth = 5; g.stroke();
  g.fillStyle = '#2a2d27'; g.textAlign = 'center'; g.font = '500 34px Mono'; g.fillText('CHF', 128, 190); g.fillStyle = '#b8432c'; g.font = '600 76px Fraunces'; g.fillText('3,500', 128, 270);
  g.fillStyle = '#2a2d27'; g.font = '500 22px Mono'; g.fillText('NO NAME', 128, 340); }
const tagTex = new THREE.CanvasTexture(tagCanvas); tagTex.colorSpace = THREE.SRGBColorSpace;
const tagPivot = new THREE.Group(); tagPivot.position.set(-.36, -.2, .05); watch.add(tagPivot);
const tagMesh = new THREE.Mesh(new THREE.PlaneGeometry(.2, .3125), new THREE.MeshStandardMaterial({ map: tagTex, roughness: .8, side: THREE.DoubleSide, transparent: true, alphaTest: .5 }));
tagMesh.position.set(-.04, -.3, .02); tagMesh.castShadow = true; tagPivot.add(tagMesh);
const tagString = new THREE.Mesh(new THREE.CylinderGeometry(.004, .004, .16, 6), new THREE.MeshStandardMaterial({ color: '#2a2d27' })); tagString.position.set(.03, -.08, .02); tagString.rotation.z = .3; tagPivot.add(tagString);

// ---------- szereplők ----------
const ttDay = makeTenTen({ night: false }), ttNight = makeTenTen({ night: true });
for (const r of [ttDay, ttNight]) { r.root.position.set(-.38, 0, .2); scene.add(r.root); r.root.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const dot = makeDot(); scene.add(dot.root);
const ttBlob = blob(1.9, 1.0, .9), dotBlob = blob(.7, .45, .6), pedBlob = blob(1.1, .8, .9);
pedBlob.position.set(.78, .004, 1.25);
for (const s of [-1, 1]) { const b = blob(.5, .5, .7); b.position.set(.15 + s * 1.3, .004, -1.55); }
dot.light.visible = false;

// ---------- feliratréteg ----------
const cap = document.getElementById('cap'), endc = document.getElementById('endcard');
function captions(t, night) {
  let line = null; for (const l of TL.lines) if (t >= l.start - .05 && t < l.start + l.dur + .25) line = l;
  if (!line) { cap.innerHTML = ''; return; }
  const chunks = []; let cur = [];
  for (const w of line.words) { cur.push(w); if (/[.?!]$/.test(w[0])) { chunks.push(cur); cur = []; } }
  if (cur.length) chunks.push(cur);
  let ch = chunks[0]; for (const c of chunks) if (t >= c[0][1] - .05) ch = c;
  const isDot = line.who === 'dot';
  cap.className = (night ? 'night' : 'day') + (isDot ? ' dot' : '');
  cap.innerHTML = ch.map(([w, a, b, emp]) => `<span class="${t >= a ? 'on' : ''}${emp ? ' emp' : ''}">${w.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`).join(' ');
  cap.style.opacity = clamp((t - line.start + .05) / .12);
}

// ---------- beszéd adatai ----------
function speech(t, who) { for (const l of TL.lines) if (l.who === who && t >= l.start && t < l.start + l.dur) {
  const i = Math.min(Math.floor((t - l.start) * TL.fps), l.env.length - 1), f = (t - l.start) * TL.fps - Math.floor((t - l.start) * TL.fps);
  const o = lerp(l.env[i] || 0, l.env[Math.min(i + 1, l.env.length - 1)] || 0, f), w = lerp(l.wide[i] || 0, l.wide[Math.min(i + 1, l.wide.length - 1)] || 0, f);
  return { o, w }; } return null; }
function emph(t, who, decay = .5) { let v = 0; for (const l of TL.lines) if (l.who === who) for (const [, a, , e] of l.words) if (e) { const d = t - a; if (d > -.1 && d < decay) v = Math.max(v, d < 0 ? (d + .1) / .1 : Math.pow(1 - d / decay, 1.5)); } return v; }

// ---------- Ten-Ten koreográfia ----------
const P = { // kar-pózok: [bal, jobb]
  rest: [{ a: 14, f: 4, e: 18 }, { a: 14, f: 4, e: 18 }],
  hips: [{ a: 38, f: -8, e: 95, w: 20 }, { a: 38, f: -8, e: 95, w: 20 }],
  lean: [{ a: 22, f: 30, e: 40 }, { a: 30, f: 45, e: 50 }],
  showWatch: [{ a: 16, f: 6, e: 20 }, { a: 62, f: 30, e: 25, w: -10 }],
  shrug: [{ a: 62, f: 20, e: 70, w: -30 }, { a: 62, f: 20, e: 70, w: -30 }],
  pointBoard: [{ a: 14, f: 4, e: 18 }, { a: 125, f: 10, e: 10 }],
  finger: [{ a: 14, f: 4, e: 18 }, { a: 60, f: 40, e: 115 }],
  explain: [{ a: 30, f: 30, e: 60 }, { a: 48, f: 38, e: 55, w: -15 }],
  chin: [{ a: 20, f: 10, e: 40 }, { a: 30, f: 60, e: 140 }],
  pull: [{ a: 16, f: 4, e: 20 }, { a: 140, f: 18, e: 20 }],
  pulled: [{ a: 16, f: 4, e: 20 }, { a: 118, f: 18, e: 35 }],
  open: [{ a: 50, f: 25, e: 30, w: -20 }, { a: 50, f: 25, e: 30, w: -20 }],
  sigh: [{ a: 10, f: 0, e: 8 }, { a: 10, f: 0, e: 8 }],
};
const armTrack = (t, i) => track(t, [
  [0, P.lean[i]], [ls('l01') + 2.2, P.showWatch[i], .6], [ls('l02'), P.rest[i], .5],
  [ls('l03') + .1, P.hips[i], .5, easeBack],
  [ls('l04') + .2, P.pointBoard[i], .55], [wt('l04', 'way') - .25, P.shrug[i], .45, easeBack],
  [wt('l05', 'borrowed') - .3, P.finger[i], .4, easeBack], [wt('l05', 'from') - .1, P.explain[i], .5],
  [ls('l06') + .1, P.pointBoard[i], .5], [X.chart - .2, P.explain[i], .5], [wt('l06', 'very') - .4, P.chin[i], .5],
  [ls('l07'), P.hips[i], .5], [ls('l09') + .2, P.pointBoard[i], .6], [wt('l09', 'chief') - .3, P.explain[i], .5],
  [ls('l10'), P.hips[i], .5], [ls('l11') + .1, P.pointBoard[i], .6], [X.thisOne - .3, P.showWatch[i], .6],
  [ls('l12') - .35, P.pull[i], .45, easeBack], [X.click - .12, P.pulled[i], .12], [X.click + .5, P.rest[i], .7],
  [ls('l13') + .5, P.showWatch[i], .8], [ls('l14'), P.rest[i], .7], [ls('l16') - .1, P.sigh[i], .5], [le('l16') - .4, P.open[i], .6, easeBack],
]);
function ttPose(r, t, night) {
  const sp = speech(t, 'tenten'), em = emph(t, 'tenten');
  const lookTo = track(t, [[0, [.5, -.2]], [1.4, [0, 0], .12], [ls('l02') + .1, [.8, -.4], .1], [ls('l03'), [0, 0], .1],
    [ls('l04') + .2, [.55, .85], .1], [ls('l04') + 2.2, [0, 0], .1], [ls('l05') + .3, [.5, .85], .1], [ls('l05') + 1.8, [0, 0], .1],
    [ls('l06') + .2, [.5, .85], .1], [wt('l06', 'very') - .5, [0, 0], .1], [ls('l07'), [.8, .3], .1], [ls('l08'), [0, 0], .1],
    [ls('l09') + .2, [.5, .85], .1], [ls('l09') + 2.6, [0, 0], .1], [ls('l10'), [.8, .3], .1], [ls('l11'), [.5, .85], .1],
    [X.thisOne - .2, [.85, -.35], .12], [ls('l12') - .4, [0, 0], .12], [X.click + .3, [.85, -.3], .12], [ls('l14'), [0, 0], .12],
    [ls('l15'), [.8, .2], .1], [ls('l16'), [0, 0], .15]], .1);
  const sac = saccade(t, 5);
  const mood = track(t, [[0, 0], [ls('l03'), 1, .3], [ls('l04'), 0, .3], [wt('l06', 'collection') - .2, 1, .3], [ls('l07'), 0, .3],
    [ls('l08') - .1, 2, .15], [ls('l09'), 0, .3], [ls('l14'), 3, .5], [ls('l15') + .2, 2, .3], [ls('l16'), 4, .3], [le('l16') - .3, 1, .4]]);
  // mood: 0 mesél, 1 önelégült, 2 szkeptikus, 3 lágy, 4 sóhaj
  const mk = (m, k) => Math.max(0, 1 - Math.abs(mood - m)) * k;
  const bl = blinkAmount(t, X.blinkT);
  const lidBase = .1 + mk(1, .28) + mk(2, .22) + mk(3, .2) + mk(4, .45);
  r.setEyes({ look: [lookTo[0] + sac[0], lookTo[1] + sac[1] * .6], lid: Math.min(1, Math.max(bl, lidBase)), tilt: mk(1, -6) + mk(4, 10),
    brow: em * 1.1 + mk(3, .4) - mk(2, .2), browTilt: mk(4, 14),
    L: { brow: em * 1.1 + mk(1, .9) + mk(2, -.5), lid: Math.max(bl, lidBase + mk(2, .2)) }, R: { brow: em * 1.1 + mk(1, .0) + mk(2, 1.1) } });
  // bajusz: 10:10 önelégült, 9:15 meglepett, 8:20 lesújtott
  const hands = track(t, [[0, [292, 68]], [wt('l04', 'salary') - .3, [246, 114], .4, easeBack], [ls('l05'), [292, 68], .4, easeBack],
    [ls('l08') - .1, [270, 90], .2], [ls('l09'), [292, 68], .35], [ls('l16') - .2, [250, 110], .5], [le('l16') - .3, [300, 60], .5, easeBack]]);
  r.setTime(hands[0], hands[1]);
  r.setChrono(Math.sin(t * 8) * 7 * (sp ? sp.o : 0) + em * 9);
  r.talk(sp ? sp.o : 0, sp ? sp.w : 0);
  for (let i = 0; i < 2; i++) r.setArm(i, armTrack(t, i));
  // test: dőlés, légzés, beszéd közbeni billegés, a horognál előrehajol
  const leanIn = 1 - seg(t, ls('l01') + 2.0, ls('l01') + 3.2);
  const breath = Math.sin(t * Math.PI * 2 / 3.6);
  const talkBob = sp ? sp.o : 0;
  r.body.rotation.x = D2R(14 * leanIn + 2 * talkBob + em * 3);
  r.body.rotation.z = D2R(Math.sin(t * .9) * 1.6 + em * 2.5 * Math.sin(t * 2.7) + mk(2, 4) - mk(4, 3));
  r.body.rotation.y = D2R(lookTo[0] * 9);
  r.body.position.y = 1.62 + breath * .008 + talkBob * .012 - mk(4, .03);
  r.body.scale.set(1 + breath * .004, 1 - breath * .004, 1);
  r.root.rotation.y = D2R(14 + (t > X.thisOne - .3 && t < ls('l14') ? 10 : 0) * seg(t, X.thisOne - .3, X.thisOne + .5));
  r.top.rotation.x = -r.body.rotation.x * .6 + Math.sin(t * 2.1) * .03;
  r.top.rotation.z = .08 - r.body.rotation.z * 1.4;
}

// ---------- Dot koreográfia ----------
function dotPose(t, night) {
  const inK = pop(t, ls('l02') - .35, .55);
  // helyek: [x, y, z, skála]
  const p = track(t, [[0, [.3, -.6, 1.9, .9]], [ls('l02') - .35, [.32, 1.95, 1.9, .9], .55, easeBack], [ls('l03') + .3, [.6, 2.95, 1.0, .85], .8],
    [ls('l04'), [1.75, 5.62, -1.55, .8], 1.0], [ls('l07') - .5, [.45, 2.65, 1.3, .85], .7, easeBack], [ls('l08') + .4, [1.75, 5.62, -1.55, .8], .9],
    [ls('l10') - .4, [.5, 2.75, 1.3, .85], .6, easeBack], [ls('l10') + 1.6, [1.75, 5.62, -1.55, .8], .9],
    [ls('l13') + .3, [-.1, 2.75, .9, .8], 1.0], [ls('l15') - .4, [.55, 2.35, 1.6, .85], .7], [le('l16') + .2, [.6, 2.6, 1.5, .85], .8]], .6);
  const sp = speech(t, 'dot'), bob = Math.sin(t * 3.1) * .05;
  dot.root.position.set(p[0], p[1] + bob, p[2]);
  dot.root.scale.setScalar(p[3] * Math.max(.001, inK));
  dot.root.rotation.set(0, D2R(-15 + Math.sin(t * 1.4) * 10), D2R(Math.sin(t * 2.3) * 6));
  const excite = (sp ? 1 : 0) * .6 + (t > ls('l02') - .35 && t < ls('l02') + .6 ? 1 : 0);
  dot.armL.rotation.z = -.6 - excite * 1.6 + Math.sin(t * 9) * .15 * excite; dot.armR.rotation.z = .6 + excite * 1.6 - Math.sin(t * 9) * .15 * excite;
  dot.legL.rotation.z = -.05 + Math.sin(t * 3.1) * .15; dot.legR.rotation.z = .05 - Math.sin(t * 3.1 + 1) * .15;
  dot.talk(sp ? sp.o : 0);
  const b = blinkAmount(t, X.blinkD);
  const wide = (t > ls('l02') - .3 && t < le('l02')) || (t > ls('l10') - .2 && t < le('l10')) ? 1 : 0;
  dot.eyes.forEach(e => { e.scale.set(1 + .3 * wide, Math.max(.1, (1 + .3 * wide) * (1 - b)), .6); });
  const toTT = [-.7, -.2], toCam = [0, 0], toWatch = [.4, -.4];
  const lk = t > ls('l13') ? toWatch : sp ? toCam : toTT;
  dot.look(lk[0], lk[1]);
  dot.setGlow(night ? .4 + .6 * seg(t, X.click, X.click + .6) : 0);
}

// ---------- kamera ----------
const SHOT = {
  hook: [[.42, 1.78, 5.5], [.22, 1.58, .7]],
  hook2: [[.25, 1.95, 6.2], [.15, 1.75, .4]],
  wide: [[.15, 2.75, 11.2], [.15, 2.7, 0]],
  boardish: [[.15, 3.55, 8.4], [.15, 3.55, -1.0]],
  ttClose: [[-.3, 1.85, 4.6], [-.38, 1.7, .2]],
  two: [[.1, 2.1, 7.0], [.05, 2.0, .3]],
  watchCU: [[.95, 1.6, 3.6], [.78, 1.5, 1.25]],
  watchSide: [[2.55, 1.95, 2.55], [.8, 1.52, 1.3]],
  ttNight: [[-.3, 1.9, 5.2], [-.38, 1.72, .2]],
  final: [[.3, 1.95, 6.4], [.25, 1.75, .6]],
};
const camTrack = t => track(t, [
  [0, SHOT.hook], [ls('l01') + 2.4, SHOT.hook2, 2.2], [ls('l03') + .4, SHOT.wide, 1.1],
  [ls('l04') + .1, SHOT.boardish, 3.5], [ls('l05') + .2, SHOT.wide, 1.0], [ls('l06'), SHOT.boardish, 2.0],
  [wt('l06', 'very') - .35, SHOT.ttClose, .45, easeOut], [ls('l07') - .2, SHOT.two, .7], [ls('l09') - .1, SHOT.boardish, 1.2],
  [ls('l10') - .3, SHOT.two, .6], [ls('l11') + .1, SHOT.boardish, 1.0], [X.thisOne - .3, SHOT.watchCU, 1.2],
  [ls('l12') - .5, SHOT.two, .5], [X.click + .4, SHOT.watchCU, 1.0], [X.explode + .3, SHOT.watchSide, 2.6],
  [ls('l14') - .2, SHOT.ttNight, 1.0], [ls('l15') - .2, SHOT.two, .8], [ls('l16') + .6, SHOT.final, 2.0]], 1);

// ---------- egy kocka ----------
function frame(t) {
  const night = t >= X.click;
  const nk = night ? 1 : 0;
  // fények
  hemi.intensity = night ? .05 : .55; key.intensity = night ? .04 : 1.6; rim.intensity = night ? .25 : .9;
  lampLight.intensity = night ? 0 : 30; bulbM.emissiveIntensity = night ? 0 : 3;
  scene.environmentIntensity = night ? .05 : .9;
  wallM.color.set(night ? '#4a4d44' : '#ffffff'); floorM.color.set(night ? '#3a3a30' : '#cdbd9b');
  bloom.strength = .5; bloom.threshold = .5; bloom.radius = .35;
  renderer.toneMappingExposure = night ? 1.0 : 1.0;
  // tábla
  const ex = { flash: clamp(1 - Math.abs(t - X.flash) / .2), grow: seg(t, X.chart + .3, X.chart + 1.3, easeOut), grow2: seg(t, X.chart + 1.0, X.chart + 1.6, easeOut),
    tear: seg(t, ls('l11') + .9, ls('l11') + 1.7) };
  if (night) { slideG.fillStyle = '#121510'; slideG.fillRect(0, 0, SW, SH); } else drawBoard(slideG, X.slides, t, ex);
  slideTex.needsUpdate = true; screenM.emissiveIntensity = night ? 0 : .12 + ex.flash * 1.5;
  // óra: a lume világít, a rétegek szétnyílnak
  const glowK = night ? seg(t, X.click, X.click + .35) : 0;
  lumeW.emissiveIntensity = 1.7 * glowK; blueL.emissiveIntensity = 1.5 * glowK;
  dialM.color.set(night ? '#0a0c0e' : '#12161a');
  const exK = seg(t, X.explode, X.explode + 2.2);
  const closeK = seg(t, ls('l16'), ls('l16') + 1.6);
  const sepK = exK * (1 - closeK);
  dialL.position.z = -sepK * .06; handsL.position.z = .062 + sepK * .2; glassL.position.z = .085 + sepK * .46;
  watch.rotation.y = D2R(-18 + Math.sin(t * .5) * 4) + sepK * D2R(-8);
  watch.rotation.x = D2R(Math.sin(t * .7) * 2);
  watch.position.y = 1.5 + Math.sin(t * 1.3) * .012;
  // árcédula leng
  const drop = seg(t, 0, .35, easeOut);
  const sw = Math.exp(-t * .9) * Math.sin(t * 5.2) * .5 + Math.sin(t * 1.6) * .06;
  tagPivot.rotation.z = sw + (1 - drop) * 1.2; tagPivot.visible = t < ls('l12') + 2;
  // szereplők
  ttDay.root.visible = !night; ttNight.root.visible = night;
  ttPose(night ? ttNight : ttDay, t, night);
  dotPose(t, night);
  // húzózsinór: a gyöngy a jobb kéz felé, húzáskor lefelé
  const r = night ? ttNight : ttDay;
  r.root.updateMatrixWorld(true);
  const handW = new THREE.Vector3(); r.arms[1].hand.getWorldPosition(handW);
  const grab = seg(t, ls('l12') - .2, ls('l12') + .1) * (1 - seg(t, X.click + .25, X.click + .7));
  const rest = new THREE.Vector3(.72, 2.65, .42), hang = rest.clone();
  hang.lerp(handW.clone().add(new THREE.Vector3(0, -.05, .05)), grab);
  const swing = Math.sin(t * 2.2) * .02 * (1 - grab);
  bead.position.set(hang.x + swing, hang.y, hang.z);
  beadM.emissiveIntensity = night ? 1.5 : 0;
  chainGeo.setFromPoints([new THREE.Vector3(.6, 5.55, .45), bead.position.clone()]);
  // kamera, kézikamerás remegéssel
  const c = camTrack(t);
  const hx = Math.sin(t * .63) * .02 + Math.sin(t * 1.37) * .012, hy = Math.cos(t * .51) * .015 + Math.sin(t * 1.9) * .006;
  cam.position.set(c[0][0] + hx, c[0][1] + hy, c[0][2]);
  cam.lookAt(c[1][0] + hx * .5, c[1][1] + hy * .5, c[1][2]);
  ttBlob.position.set((night ? ttNight : ttDay).root.position.x + .05, .004, .25);
  dotBlob.position.set(dot.root.position.x, .004, dot.root.position.z); dotBlob.material.opacity = clamp(.7 - dot.root.position.y * .12, 0, .6) * (night ? .2 : 1);
  ttBlob.material.opacity = night ? .25 : .9;
  dot.light.visible = night; lampLight.visible = !night;
  if (night) composer.render(); else renderer.render(scene, cam);
  // feliratok és zárókép
  captions(t, night);
  const ek = seg(t, le('l16') - .2, le('l16') + .5);
  endc.style.opacity = ek; endc.style.transform = `translateY(${(1 - ek) * 20}px)`;
  document.getElementById('fade').style.opacity = 1 - clamp(t / .2);
}
window.frame = t => { frame(t); return true; };
window.prof = (t) => { const gl = renderer.getContext(); const px = new Uint8Array(4); const T = []; let a = performance.now();
  const mark = n => { gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const b = performance.now(); T.push(n + ' ' + (b - a).toFixed(0)); a = b; };
  mark('start'); frame(t); mark('frame');
  renderer.render(scene, cam); mark('render-only');
  const sm = renderer.shadowMap.autoUpdate; renderer.shadowMap.autoUpdate = false; renderer.render(scene, cam); mark('render-noshadowupdate'); renderer.shadowMap.autoUpdate = sm;
  drawBoard(slideG, X.slides, t, { flash: 0, grow: 1, grow2: 1, tear: 1 }); mark('board2d');
  slideTex.needsUpdate = true; renderer.render(scene, cam); mark('render+upload');
  return T.join(' | ') + ' | calls ' + renderer.info.render.calls + ' tris ' + renderer.info.render.triangles + ' progs ' + renderer.info.programs.length; };
window.READY = true;
