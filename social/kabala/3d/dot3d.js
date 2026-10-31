// Dot 3D: egy lume-pötty, ami leesett egy indexről. Nappal halványzöld, sötétben világít.
import * as THREE from 'three';

export function makeDot() {
  const glow = new THREE.Color('#d7eb96');
  const M = {
    body: new THREE.MeshPhysicalMaterial({ color: '#e3ecbf', roughness: .35, clearcoat: .8, clearcoatRoughness: .2, sheen: .4, sheenColor: new THREE.Color('#ffffff'),
      emissive: glow, emissiveIntensity: .08 }),
    eye: new THREE.MeshPhysicalMaterial({ color: '#20241c', roughness: .15, clearcoat: 1 }),
    limb: new THREE.MeshStandardMaterial({ color: '#cbd89d', roughness: .5, emissive: glow, emissiveIntensity: .05 }),
    cheek: new THREE.MeshBasicMaterial({ color: '#f0a894', transparent: true, opacity: .5, depthWrite: false }),
    mouth: new THREE.MeshStandardMaterial({ color: '#3a2a20', roughness: .5 }),
  };
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);
  const R = .3;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 32), M.body); ball.castShadow = true; body.add(ball);
  const light = new THREE.PointLight('#d7eb96', 0, 3.5, 1.6); body.add(light);
  const face = new THREE.Group(); face.position.z = R * .92; body.add(face);
  const eyes = [];
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.CapsuleGeometry(.032, .035, 6, 16), M.eye); e.position.set(s * .1, .04, .02); e.scale.z = .6; face.add(e); eyes.push(e);
    const sp = new THREE.Mesh(new THREE.SphereGeometry(.011, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' })); sp.position.set(-.012, .03, .03); e.add(sp);
    const ch = new THREE.Mesh(new THREE.CircleGeometry(.04, 20), M.cheek); ch.scale.y = .6; ch.position.set(s * .17, -.04, -.005); ch.lookAt(ch.position.clone().multiplyScalar(3)); face.add(ch);
  }
  const mouth = new THREE.Group(); mouth.position.set(0, -.06, .02); face.add(mouth);
  const smile = new THREE.Mesh(new THREE.TorusGeometry(.03, .009, 8, 20, Math.PI), M.mouth); smile.rotation.z = Math.PI; mouth.add(smile);
  const open = new THREE.Mesh(new THREE.SphereGeometry(.035, 16, 12), M.mouth); open.scale.set(1, .2, .3); open.visible = false; mouth.add(open);
  const limbs = [];
  const mk = (x, y, len, rz) => { const g = new THREE.Group(); g.position.set(x, y, 0); g.rotation.z = rz; body.add(g);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(.03, len, 6, 12), M.limb); m.position.y = -len / 2 - .02; m.castShadow = true; g.add(m);
    const nub = new THREE.Mesh(new THREE.SphereGeometry(.05, 16, 12), M.limb); nub.position.y = -len - .06; g.add(nub); limbs.push(g); return g; };
  const armL = mk(-.27, -.02, .16, -.6), armR = mk(.27, -.02, .16, .6), legL = mk(-.11, -.26, .14, -.05), legR = mk(.11, -.26, .14, .05);
  const rig = { root, body, eyes, mouth, smile, open, armL, armR, legL, legR, light, M };
  rig.setGlow = k => { M.body.emissiveIntensity = .08 + 1.0 * k; M.limb.emissiveIntensity = .05 + .8 * k; light.intensity = 1.6 * k;
    M.cheek.opacity = .5 * (1 - k); };
  rig.blink = k => eyes.forEach(e => { e.scale.y = Math.max(.1, 1 - k); });
  rig.look = (x, y) => { face.rotation.set(-y * .25, x * .35, 0); };
  rig.talk = (o) => { const on = o > .08; smile.visible = !on; open.visible = on; open.scale.set(1, .25 + o * 1.2, .3); };
  rig.wide = k => eyes.forEach(e => e.scale.setScalar(1 + .35 * k));
  return rig;
}
