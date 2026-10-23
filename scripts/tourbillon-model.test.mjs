import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tourbillonRate,tourbillonSample,tourbillonMechanism,tourbillonSpring,tourbillonProject} from '../src/lib/tourbillon-model.mjs';
import {TOURBILLON_LESSON} from '../src/i18n/ui.ts';
import {renderTourbillonModel,tourbillonModelScript} from '../src/lib/tourbillon-view.mjs';
test('A full vertical turn averages the positional term, not the baseline',()=>{
 for(const seconds of [60,120,180]){const v=tourbillonSample('vertical',seconds);assert(Math.abs(v.rotatingMean-2)<1e-9);assert(Math.abs(v.fixedMean-10)<1e-9);}
 assert(tourbillonSample('vertical',15).rotatingMean>2);
 assert(tourbillonRate('vertical',30,true)<0);
});
test('Horizontal single-axis rotation cannot remove axial rate offset',()=>{
 for(const t of [0,10,60,150]){const v=tourbillonSample('horizontal',t);assert.equal(v.rotating,5);assert.equal(v.fixed,5);assert(Math.abs(v.rotatingMean-5)<1e-9);}
});
test('No positional variation: both regulators are identical in every scenario',()=>{
 for(const scenario of ['vertical','horizontal','wrist']){const v=tourbillonSample(scenario,72.3,-3,0);assert.equal(v.fixedMean,v.rotatingMean);}
});
test('Uneven wrist path is deterministic and does not guarantee zero rate',()=>{
 const a=tourbillonSample('wrist',180);assert.deepEqual(a,tourbillonSample('wrist',180));assert(Math.abs(a.rotatingMean)>1);assert.notEqual(a.rotatingMean,2);
});
test('Invalid times and parameters are bounded',()=>{
 assert.equal(tourbillonSample('vertical',Infinity).time,0);assert.equal(tourbillonSample('vertical',999).time,180);
 for(const n of [-5,NaN,0,55.75,180])assert(Object.values(tourbillonSample('wrist',n)).every(Number.isFinite));
});
test('Bilingual view and serialized browser program are safe to compile',()=>{
 for(const lang of ['hu','en']){const html=renderTourbillonModel(lang);assert(html.includes('data-tourbillon-model'));assert(html.includes('data-tb-controls'));assert(!html.includes(String.fromCharCode(0x2014)));new Function(tourbillonModelScript(lang));}
});

test('Public model links use language-specific routes; local review is explicit',()=>{
 for(const lang of ['hu','en']){
  const publicPath=lang==='hu'?'/muhely/tourbillon/':'/en/workshop/tourbillon/';
  assert(renderTourbillonModel(lang).includes(`href="${publicPath}"`));
  assert(renderTourbillonModel(lang,{review:true}).includes(`href="${lang==='hu'?'muhely.html':'workshop.html'}"`));
  assert(!renderTourbillonModel(lang,{standalone:true}).includes('class="tb-open"'));
 }
});

test('Four complete oscillations and eight half-beats occur per second',()=>{
 assert.equal(tourbillonMechanism(0).balance,220);
 assert.equal(tourbillonMechanism(.125).balance,-220);
 assert.equal(tourbillonMechanism(.25).balance,220);
 assert.equal(tourbillonMechanism(1).halfBeats,8);
 assert.equal(tourbillonMechanism(60).halfBeats,480);
 assert.equal(tourbillonMechanism(60).cage,360);
 assert.equal(tourbillonMechanism(60).turns,1);
 assert.equal(tourbillonMechanism(.125).cage,.75);
 for(const t of [-1,NaN,Infinity,999])assert(Object.values(tourbillonMechanism(t)).every(Number.isFinite));
});
test('The hairspring outer end is fixed while the inner end follows the balance',()=>{
 const points=a=>[...tourbillonSpring(a).matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].map(m=>[Number(m[1]),Number(m[2])]);
 const a=points(-220),b=points(220),c=points(0);
 assert.deepEqual(a.at(-1),b.at(-1));assert.deepEqual(a.at(-1),c.at(-1));
 assert.notDeepEqual(a[0],b[0]);assert.notDeepEqual(a[50],b[50]);assert.deepEqual(points(Infinity),c);
 assert.equal(a.length,161);
});
test('Spatial projection preserves a horizontal/vertical distinction and fixed-world gravity',()=>{
 const origin=tourbillonProject([0,0,0],0),axis=tourbillonProject([0,0,100],0);
 assert.equal(origin[0],axis[0]);assert(axis[1]<origin[1]);
 const verticalAxis=tourbillonProject([0,0,100],Math.PI/2);assert(verticalAxis[0]>origin[0]);
 for(const tilt of [0,.5,Math.PI/2])for(const azimuth of [0,.3,2])assert(tourbillonProject([100,20,2],tilt,azimuth).every(Number.isFinite));
});
test('Both languages have five matching chapters, six components and explained quiz answers',()=>{
 for(const lang of ['hu','en']){const t=TOURBILLON_LESSON[lang];assert.equal(t.chapters.length,5);assert.equal(t.parts.length,6);assert.equal(t.questions.length,3);
  for(const c of t.chapters)for(const k of ['tab','title','lead','task','takeaway','detail'])assert(c[k].length>0);
  for(const q of t.questions){assert(q.answers[q.correct]);assert(q.explanation.length>30);}
  assert(!JSON.stringify(t).includes(String.fromCharCode(0x2014)));
  const html=renderTourbillonModel(lang,{standalone:true});assert(!html.includes('class="tb-open"'));assert(html.includes('data-tb-feedback="2"'));
 }
});
