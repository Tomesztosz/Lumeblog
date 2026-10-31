// Ten-Ten 3D: puha, egyszerű kabala-változat. Az alapforma egy lekerekített óratok,
// a számlap az arca. makeTenTen() egy riget ad vissza, amit az animáció mozgat.
import * as THREE from 'three';
import { EffectComposer } from './vendor/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './vendor/jsm/postprocessing/OutputPass.js';

export const PAL = {
  champagne: '#e9cf98', cream: '#f3e9d6', brass: '#c49a52', dial: '#fdfbf5', ink: '#2a2d27',
  lume: '#d7eb96', leather: '#8a5d3b', blush: '#f0a894', night: '#232921',
};

function puckGeometry(R = 1, h = .36, seg = 96) {
  // lekerekített korong: elöl-hátul lapos, oldalt teljesen kerek
  const pts = [new THREE.Vector2(0.0001, -h)];
  const cR = R - h;
  for (let i = 0; i <= 32; i++) { const a = -Math.PI / 2 + Math.PI * i / 32; pts.push(new THREE.Vector2(cR + Math.cos(a) * h, Math.sin(a) * h)); }
  pts.push(new THREE.Vector2(0.0001, h));
  const g = new THREE.LatheGeometry(pts, seg);
  g.rotateX(Math.PI / 2); // a tengely a kamera felé néz
  return g;
}

function handShape(L, w) {
  const s = new THREE.Shape();
  s.moveTo(0, -w * .9);
  s.quadraticCurveTo(w, -w * .2, w * .55, L * .55);
  s.quadraticCurveTo(w * .25, L * .95, 0, L);
  s.quadraticCurveTo(-w * .25, L * .95, -w * .55, L * .55);
  s.quadraticCurveTo(-w, -w * .2, 0, -w * .9);
  const g = new THREE.ExtrudeGeometry(s, { depth: .02, bevelEnabled: true, bevelThickness: .012, bevelSize: .012, bevelSegments: 4, curveSegments: 24 });
  return g;
}

export function makeTenTen(o = {}) {
  const style = o.style || 'vinyl'; // vinyl | plush | night
  const night = style === 'night';
  const bodyCol = o.body || (style === 'plush' ? PAL.cream : PAL.champagne);
  const mat = {
    body: new THREE.MeshPhysicalMaterial({ color: bodyCol, roughness: style === 'plush' ? .95 : .48, metalness: 0,
      sheen: style === 'plush' ? 1 : .35, sheenRoughness: .7, sheenColor: new THREE.Color('#fff8e8'), clearcoat: style === 'plush' ? 0 : .35, clearcoatRoughness: .4 }),
    dial: new THREE.MeshPhysicalMaterial({ color: night ? '#20261e' : PAL.dial, roughness: .8, emissive: new THREE.Color('#ffffff'), emissiveIntensity: night ? 0 : .12 }),
    eye: new THREE.MeshPhysicalMaterial({ color: night ? PAL.lume : '#1d1f1b', roughness: .18, clearcoat: 1, clearcoatRoughness: .05, emissive: new THREE.Color(PAL.lume), emissiveIntensity: night ? 1.4 : 0 }),
    lume: new THREE.MeshStandardMaterial({ color: night ? PAL.lume : '#dfe9b4', roughness: .6, emissive: new THREE.Color(PAL.lume), emissiveIntensity: night ? 1.6 : .05 }),
    brass: new THREE.MeshPhysicalMaterial({ color: night ? '#5a5a46' : PAL.brass, roughness: .28, metalness: .65, clearcoat: .5,
      emissive: new THREE.Color(PAL.lume), emissiveIntensity: night ? .9 : 0 }),
    leather: new THREE.MeshPhysicalMaterial({ color: PAL.leather, roughness: .7, sheen: .4, sheenColor: new THREE.Color('#e9c8a0') }),
    blush: new THREE.MeshBasicMaterial({ color: PAL.blush, transparent: true, opacity: night ? 0 : .55, depthWrite: false }),
    mouth: new THREE.MeshPhysicalMaterial({ color: '#3a2420', roughness: .4 }),
  };
  const root = new THREE.Group();     // a talajon áll, ezt mozgatja a járás
  const body = new THREE.Group();     // dőlés, légzés
  body.position.y = 1.32;
  root.add(body);

  const R = 1, h = .36;
  const caseM = new THREE.Mesh(puckGeometry(R, h), mat.body); caseM.castShadow = caseM.receiveShadow = true; body.add(caseM);
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(.84, .075, 32, 128), mat.body); bezel.position.z = h - .01; bezel.castShadow = true; body.add(bezel);
  const dial = new THREE.Mesh(new THREE.CircleGeometry(.84, 96), mat.dial); dial.position.z = h + .004; dial.receiveShadow = true; body.add(dial);
  const face = new THREE.Group(); face.position.z = h + .006; body.add(face);

  // lume-pöttyök
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6, big = i % 3 === 0;
    const d = new THREE.Mesh(big ? new THREE.CapsuleGeometry(.03, .06, 6, 16) : new THREE.SphereGeometry(.034, 20, 12), mat.lume);
    d.scale.z = .5; d.rotation.z = -a; d.position.set(Math.sin(a) * .69, Math.cos(a) * .69, .005); face.add(d);
  }
  // szemek
  const eyes = [];
  for (const s of [-1, 1]) {
    const piv = new THREE.Group(); piv.position.set(s * .23, .04, .02);
    const e = new THREE.Mesh(new THREE.CapsuleGeometry(.068, .07, 8, 24), mat.eye); e.scale.z = .55; piv.add(e);
    face.add(piv); eyes.push(piv);
  }
  // pirosság
  for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.CircleGeometry(.11, 32), mat.blush); b.scale.y = .6; b.position.set(s * .42, -.13, .006); face.add(b); }
  // bajusz: óra- és percmutató, középen a tengely
  const hands = new THREE.Group(); hands.position.set(0, -.06, .03); face.add(hands);
  const hourH = new THREE.Mesh(handShape(.25, .055), mat.brass), minH = new THREE.Mesh(handShape(.31, .05), mat.brass);
  hourH.castShadow = minH.castShadow = true;
  const hourP = new THREE.Group(), minP = new THREE.Group(); hourP.add(hourH); minP.add(minH); minH.position.z = .028;
  hands.add(hourP, minP);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(.04, 24, 16), mat.brass); cap.scale.z = .6; cap.position.z = .06; hands.add(cap);
  const faceType = o.face || 'mustache';
  if (faceType === 'minimal') hands.visible = false;
  if (faceType === 'mustache') { hands.position.set(0, -.105, .03); hourH.scale.setScalar(.62); minH.scale.setScalar(.62); }
  if (faceType === 'brows') { hands.position.set(0, .26, .03); hourH.scale.setScalar(.7); minH.scale.setScalar(.7); cap.visible = false; }
  if (faceType === 'top') { hands.position.set(0, .44, .03); hourH.scale.setScalar(.75); minH.scale.setScalar(.75); }
  // száj
  const mouth = new THREE.Group(); mouth.position.set(0, -.19, .02); face.add(mouth);
  const smile = new THREE.Mesh(new THREE.TorusGeometry(.06, .016, 12, 32, Math.PI), mat.mouth); smile.rotation.z = Math.PI; mouth.add(smile);
  const open = new THREE.Mesh(new THREE.SphereGeometry(.07, 24, 16), mat.mouth); open.scale.set(1, .1, .3); open.visible = false; mouth.add(open);
  // korona: fül
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .14, 32), mat.body);
  crown.rotation.z = Math.PI / 2; crown.position.set(R + .04, 0, 0); crown.castShadow = true; body.add(crown);
  const crownCap = new THREE.Mesh(new THREE.SphereGeometry(.11, 24, 16), mat.body); crownCap.scale.x = .45; crownCap.position.set(R + .11, 0, 0); body.add(crownCap);
  // a felső szíjcsonk: egy kis bóbita
  const tuft = new THREE.Group(); tuft.position.set(0, R - .02, 0); body.add(tuft);
  const tm = new THREE.Mesh(new THREE.CapsuleGeometry(.15, .12, 8, 24), mat.leather); tm.scale.z = .55; tm.position.y = .14; tm.rotation.z = -.35; tm.castShadow = true; tuft.add(tm);
  // karok
  const arms = [];
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * .86, -.42, 0); body.add(sh);
    const a = new THREE.Mesh(new THREE.CapsuleGeometry(.1, .2, 8, 24), mat.body); a.position.y = -.17; a.castShadow = true; sh.add(a);
    sh.rotation.z = s * .5; arms.push(sh);
  }
  // lábak: a szíj két rövid csonkja
  const legs = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(s * .3, .48, 0); root.add(hip);
    const l = new THREE.Mesh(new THREE.CapsuleGeometry(.15, .2, 8, 24), mat.leather); l.position.y = -.24; l.scale.z = .8; l.castShadow = true; hip.add(l);
    legs.push(hip);
  }
  const rig = { root, body, face, eyes, hands, hourP, minP, mouth, smile, open, arms, legs, tuft, mat };
  rig.setTime = (hDeg, mDeg) => { hourP.rotation.z = -THREE.MathUtils.degToRad(hDeg); minP.rotation.z = -THREE.MathUtils.degToRad(mDeg); };
  rig.faceType = faceType;
  rig.setTime(...(faceType === 'brows' ? [280, 80] : faceType === 'top' ? [305, 55] : [295, 65]));
  rig.blink = k => eyes.forEach(e => { e.scale.y = Math.max(.08, 1 - k); });
  rig.look = (x, y) => eyes.forEach(e => { e.children[0].position.set(x * .03, y * .03, 0); });
  rig.talk = (o2, w = 0) => { const on = o2 > .08; smile.visible = !on; open.visible = on; open.scale.set(1 + w * .5, .25 + o2 * 1.1, .3); };
  return rig;
}

export function makeStage(canvas, w, h, o = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.AgXToneMapping; renderer.toneMappingExposure = o.exposure ?? 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(o.bg || '#efe9dc');
  const cam = new THREE.PerspectiveCamera(o.fov || 28, w / h, .1, 100);
  const hemi = new THREE.HemisphereLight('#fff6e6', '#cbbd9e', 1.1); scene.add(hemi);
  const key = new THREE.DirectionalLight('#fff3df', 2.4); key.position.set(-3, 5, 4); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 14; key.shadow.blurSamples = 20; key.shadow.bias = -.0004;
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -2, near: .5, far: 20 }); scene.add(key);
  const fill = new THREE.DirectionalLight('#e8f0ff', .7); fill.position.set(4, 2, 3); scene.add(fill);
  const rim = new THREE.DirectionalLight('#ffffff', 1.4); rim.position.set(1, 3, -4); scene.add(rim);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: .22 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), .0, .6, .85); composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const render = () => { if (bloom.strength > 0) composer.render(); else renderer.render(scene, cam); };
  return { renderer, scene, cam, lights: { hemi, key, fill, rim }, ground, bloom, render };
}
export { THREE };
