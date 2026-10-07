import assert from 'node:assert/strict';
import { test } from 'node:test';
import { rattrapanteState as step } from '../src/lib/rattrapante-model.mjs';
import { renderRattrapanteModel, rattrapanteModelScript, rattrapanteModelCSS } from '../src/lib/rattrapante-view.mjs';
test('Starts paused; split at zero does not arm the clamp',()=>{
  const s=step(); assert.equal(s.running,false); assert.equal(step(s,{type:'split'}).held,null);
});
test('Split captures a time without stopping elapsed time; catch-up does not reset',()=>{
  let s=step(null,{type:'toggle'}); s=step(s,{type:'tick',seconds:12}); s=step(s,{type:'split'});
  s=step(s,{type:'tick',seconds:6}); assert.equal(s.elapsed,18);assert.equal(s.held,12);assert(s.running);
  s=step(s,{type:'split'}); assert.equal(s.held,null);assert.equal(s.elapsed,18);assert(s.running);
});
test('Pause/resume preserves a split; reset clears it; paused ticks do nothing',()=>{
  let s=step(null,{type:'example'});const original={...s};s=step(s,{type:'tick',seconds:5});assert.deepEqual(s,original);
  s=step(s,{type:'toggle'});s=step(s,{type:'tick',seconds:2});assert.equal(s.held,12);assert.equal(s.elapsed,20);
  s=step(s,{type:'pause'});assert.equal(s.running,false);assert.equal(s.held,12);
  assert.deepEqual(step(s,{type:'reset'}),step());assert.deepEqual(original,step(null,{type:'example'}));
});
test('Manual stepping, accelerated running, invalid input and demo limit',()=>{
  let s=step(null,{type:'step'});assert.equal(s.elapsed,1);s=step(s,{type:'speed',value:4});s=step(s,{type:'toggle'});
  assert.equal(step(s,{type:'step'}).elapsed,1);assert.equal(step(s,{type:'tick',seconds:NaN}).elapsed,1);
  s=step(s,{type:'tick',seconds:20});assert.equal(s.elapsed,60);assert.equal(s.running,false);
  assert.equal(step(s,{type:'toggle'}).running,false);assert.equal(step(s,{type:'speed',value:Infinity}).speed,4);
});
test('Repeated intermediate measurements preserve the common starting point',()=>{
  let s=step(null,{type:'toggle'});
  for(const elapsed of [10,20,30]){s=step(s,{type:'tick',seconds:10});s=step(s,{type:'split'});assert.equal(s.held,elapsed);s=step(s,{type:'split'});}
  assert.equal(s.elapsed,30);
});
for(const lang of ['hu','en']) test(`${lang}: safe offline rendering and localized controls`,()=>{
  const html=renderRattrapanteModel(lang),script=rattrapanteModelScript(lang);
  assert.equal((html.match(/<svg /g)||[]).length,2);assert(!html.includes('<h2'));
  assert(!/[\u2014]/.test(html+script));assert(!/fetch\(|localStorage|sessionStorage|https?:\/\//.test(script));
  assert(script.includes('visibilitychange')); assert(script.includes('IntersectionObserver'));
  assert(!/<script/i.test(html));new Function(script);
});
test('Model follows shared palette and avoids autonomous motion',()=>{
  assert(rattrapanteModelCSS.includes('var(--paper)'));assert(!/#[0-9a-f]{3,8}\b/i.test(rattrapanteModelCSS));
  assert(!/animation:/.test(rattrapanteModelCSS));
});
