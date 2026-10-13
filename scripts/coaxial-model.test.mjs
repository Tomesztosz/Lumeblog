import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coaxialFrame as frame, coaxialState as reduce } from '../src/lib/coaxial-model.mjs';
import { renderCoaxialModel, coaxialModelScript, coaxialModelCSS } from '../src/lib/coaxial-view.mjs';
test('Manual stepping visits every phase and wraps to the next cycle',()=>{
 let s=reduce();assert(!s.running);
 for(let i=1;i<=16;i++){s=reduce(s,{type:'step'});assert.equal(frame(s.time).phase,i%8);assert(!s.running);}
 assert.equal(frame(s.time).cycle,2);
});
test('Both coaxial levels advance only during the two release windows',()=>{
 for(const [a,b] of [[.01,.19],[.29,.69],[.79,.99]])assert.equal(frame(a).wheel,frame(b).wheel);
 assert.equal(frame(.24).impulse,'indirect');assert.equal(frame(.74).impulse,'direct');
 assert.equal(frame(.49).wheel,-20);assert.equal(frame(.99).wheel,-40);assert.equal(frame(1.49).wheel,-60);
 assert(!frame(.24).locked);assert(!frame(.74).locked);assert(frame(.4).locked);
 for(let n=0;n<1000;n++)assert(frame((n+1)/100).wheel<=frame(n/100).wheel);
});
test('Balance moves during locking and crosses the engagement zone for each impulse',()=>{
 assert.notEqual(frame(.3).balance,frame(.4).balance);assert(Math.abs(frame(.24).balance)<1e-6);assert(Math.abs(frame(.74).balance)<1e-6);
 assert.equal(frame(.1).lock,'exit');assert.equal(frame(.5).lock,'entry');assert.equal(frame(.9).lock,'exit');
});
test('Pause, reset, speed and invalid inputs are safe',()=>{
 let s=reduce();assert.deepEqual(reduce(s,{type:'tick',seconds:1}),s);s=reduce(s,{type:'toggle'});
 s=reduce(s,{type:'tick',seconds:.1});assert(s.time>0);assert.equal(reduce(s,{type:'tick',seconds:NaN}).time,s.time);
 s=reduce(s,{type:'phase',value:6});assert(!s.running);assert.equal(frame(s.time).phase,6);
 assert.deepEqual(reduce(s,{type:'phase',value:8}),s);assert.equal(reduce(s,{type:'reset'}).time,0);
});
for(const lang of ['hu','en'])test(`${lang} standalone rendering is local, localized and safe`,()=>{
 const html=renderCoaxialModel(lang),js=coaxialModelScript(lang);new Function(js);
 assert.equal((html.match(/data-cx-phase=/g)||[]).length,8);assert(!/[\u2014]/.test(html+js));
 assert(!/fetch\(|localStorage|https?:\/\//.test(js));assert(js.includes('visibilitychange'));assert(js.includes('prefers-reduced-motion'));
 assert(!/#[0-9a-f]{3,8}\b/i.test(coaxialModelCSS));
});
