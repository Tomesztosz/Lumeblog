import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFY_TAU,DEFY_SPEC,defyFrame,defyHand,defyBeam,defyBeamSample,defyFlexPoint,defyProject} from '../src/lib/defy-lab-model.mjs';
import {DEFY_TEXT} from '../src/i18n/defy-lab.ts';
import {renderDefyModel,defyScript} from '../src/lib/defy-lab-view.mjs';
import * as defyMath from '../src/lib/defy-lab-model.mjs';
const close=(a,b,tol=1e-7)=>assert(Math.abs(a-b)<=tol*Math.max(Math.abs(a),Math.abs(b),1e-10),`${a} != ${b}`);
test('15 full oscillations and 30 half oscillations each physical second',()=>{close(defyFrame(1).cycles,15);close(defyFrame(1/15).angle,DEFY_SPEC.amplitude);close(defyFrame(1/60).angle,0,1e-4);assert.equal(defyHand(1,15).ticks,30);assert.equal(defyHand(1,4).ticks,8);close(defyHand(60,15).angle,DEFY_TAU);close(defyHand(60,4).angle,DEFY_TAU);});
test('A separate illustrative escape wheel stops during lock and advances monotonically',()=>{let prev=-1;for(let i=0;i<=1000;i++){const f=defyFrame(i/15000);assert(f.wheelAngle>=prev-1e-12);prev=f.wheelAngle;}close(defyFrame(.32/15).wheelAngle,defyFrame(.64/15).wheelAngle);assert.equal(defyFrame(.25/15).event,'A');assert.equal(defyFrame(.75/15).event,'B');close(defyFrame(1/15).wheelAngle,DEFY_TAU/24);});
test('The fixed anchor stays put and the moving flexure end follows the plate',()=>{const a=[2,3,.1],b=[12,1,.1];assert.deepEqual(defyFlexPoint(0,a,b,.1),a);const f=defyFlexPoint(1,a,b,.1);close(f[0],12*Math.cos(.1)-Math.sin(.1));close(f[1],12*Math.sin(.1)+Math.cos(.1));});
test('Assembled beam FE displacement agrees with the clamped-guided cubic solution',()=>{for(const elements of [1,2,6,12,24]){const b=defyBeam({elements});for(let i=0;i<=20;i++){const u=i/20,f=defyBeamSample(b,u);close(f.displacement,20e-6*(3*u*u-2*u**3),1e-6);}assert(b.freeResidual<1e-9);close(b.reactions.at(-2),12*b.E*b.I*20e-6/b.L**3,1e-6);close(b.energy,6*b.E*b.I*(20e-6)**2/b.L**3,1e-6);}});
test('Stress is computed from curvature, reverses sign and vanishes at the midspan',()=>{const a=defyBeam(),b=defyBeam({displacementUM:-20});close(defyBeamSample(a,0).stress,-defyBeamSample(a,1).stress);assert(Math.abs(defyBeamSample(a,.5).stress)<.001);close(defyBeamSample(a,.2).stress,-defyBeamSample(b,.2).stress);});
test('Double displacement doubles stress and quadruples strain energy',()=>{const a=defyBeam({displacementUM:10}),b=defyBeam({displacementUM:20});close(defyBeamSample(b,0).stress,2*defyBeamSample(a,0).stress);close(b.energy,4*a.energy);const c=defyBeam({displacementUM:0});close(c.energy,0);});
test('3D projection separates height and every invalid model input fails explicitly',()=>{assert.notDeepEqual(defyProject([1,1,0]),defyProject([1,1,2]));for(const fn of [()=>defyFrame(-1),()=>defyFrame(NaN),()=>defyHand(-1),()=>defyBeam({elements:0}),()=>defyBeam({youngGPA:0}),()=>defyBeam({displacementUM:1000}),()=>defyBeamSample(defyBeam(),2),()=>defyFlexPoint(-1,[0,0,0],[1,1,1])])assert.throws(fn,RangeError);});
test('Both languages expose all four lessons and a parseable self-contained offline client',()=>{assert.deepEqual(Object.keys(DEFY_TEXT.hu).sort(),Object.keys(DEFY_TEXT.en).sort());for(const lang of['hu','en']){assert.equal(DEFY_TEXT[lang].lessons.length,4);const html=renderDefyModel(lang),script=defyScript(lang);assert(html.includes('data-action="play"'));assert(!html.includes('undefined'));assert(!script.includes('fetch('));assert(!/https?:\/\//.test(script));assert(!script.includes(String.fromCharCode(0x2014)));assert.doesNotThrow(()=>new Function(script));}});
test('SSR-suffixed function declarations, cross-references and constants keep their browser bindings',()=>{
 const keys=['defyFrame','defyHand','defyProject','defyRotate','defyFlexPoint','defySolve','defyBeam','defyBeamSample'],restore=[];
 try{
  for(const key of keys){const fn=defyMath[key],source=fn.toString();restore.push([fn,Object.getOwnPropertyDescriptor(fn,'toString')]);fn.toString=()=>source.replace(/\b(DEFY_TAU|DEFY_SPEC|defyFrame|defyHand|defyProject|defyRotate|defyFlexPoint|defySolve|defyBeam|defyBeamSample)\b/g,m=>m+'$1');}
  const program=defyScript('en');assert(!/\b(?:defy\w+|DEFY_\w+)\$\d+/.test(program));
  const sandbox={};new Function('document','globalThis',program.replace(/\}\)\(\);$/,'globalThis.result=defyBeam().energy;})();'))({querySelectorAll:()=>[]},sandbox);assert(sandbox.result>0);
 }finally{for(const[fn,descriptor]of restore)if(descriptor)Object.defineProperty(fn,'toString',descriptor);else delete fn.toString;}
});
