import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freakDisplay,freakEscapeFrame,freakNextPhase,freakRotate,freakHairspringPoint,freakProject,freakGearPoints,FREAK_TAU} from '../src/lib/freak-model.mjs';
import {renderFreakModel,freakScript} from '../src/lib/freak-view.mjs';
import {FREAK_LESSON} from '../src/i18n/freak.ts';
const near=(a,b)=>assert(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('One hour returns minute indication and advances hour by 30 degrees',()=>{
 const a=freakDisplay(36600),b=freakDisplay(40200);near(a.minuteAngle,b.minuteAngle);near(b.hourAngle-a.hourAngle,Math.PI/6);assert.equal(a.hour,10);assert.equal(a.minute,10);assert.equal(b.hour,11);
});
test('Twelve hours closes both indicating cycles without invalid time',()=>{
 const a=freakDisplay(36600),b=freakDisplay(36600+43200);near(a.minuteAngle,b.minuteAngle);near(a.hourAngle,b.hourAngle);assert.equal(freakDisplay(0).hour,12);assert.throws(()=>freakDisplay(NaN));assert.throws(()=>freakDisplay(-1));
});
test('Direct impulses alternate A, B with a free locked arc between them',()=>{
 const a=freakEscapeFrame(.05),b=freakEscapeFrame(.3),c=freakEscapeFrame(.55),d=freakEscapeFrame(.8);assert.equal(a.impulse,'A');assert.equal(c.impulse,'B');assert.equal(b.lockWheel,'B');assert.equal(d.lockWheel,'A');assert(!a.locked&&!c.locked&&b.locked&&d.locked);
});
test('Both meshing wheels remain still during lock while balance keeps moving',()=>{
 for(const pair of [[.16,.35],[.7,.9]]){const [a,b]=pair.map(freakEscapeFrame);near(a.wheelA,b.wheelA);near(a.wheelB,b.wheelB);assert.notEqual(a.balance,b.balance);}
});
test('Patent example advances 72 degrees per oscillation and wheels counterrotate',()=>{
 for(const n of [0,1,10,100]){const a=freakEscapeFrame(n),b=freakEscapeFrame(n+1);near(b.wheelA-a.wheelA,FREAK_TAU/5);near(a.wheelA,-a.wheelB);near(b.wheelA,-b.wheelB);}
});
test('Phase stepping visits the four states without getting stuck at boundaries',()=>{
 let v=0;const phases=[];for(let i=0;i<12;i++){phases.push(freakEscapeFrame(v).phase);v=freakNextPhase(v);}assert.deepEqual(phases,[0,1,2,3,0,1,2,3,0,1,2,3]);
 assert.throws(()=>freakNextPhase(NaN));assert.throws(()=>freakNextPhase(-1));
});
test('25-tooth illustration contains five long teeth, never NaN',()=>{
 const p=freakGearPoints(0,0,0,1,25,0,5);assert.equal(p.length,100);assert.equal(p.filter(v=>Math.hypot(v[0],v[1])>1.1).length,10);assert(p.flat().every(Number.isFinite));assert.throws(()=>freakGearPoints(0,0,0,1,0));
});
test('Rigid carrier rotation preserves radii and actual 3D projection separates heights',()=>{
 const a=[1,-2,.3],b=freakRotate(a,1.4);near(Math.hypot(...a.slice(0,2)),Math.hypot(...b.slice(0,2)));near(b[2],a[2]);assert.notDeepEqual(freakProject([0,0,0]),freakProject([0,0,1]));
});
test('Hairspring outer anchor stays fixed in the carrier while the inner end follows the balance',()=>{
 for(const angle of [-2,0,1,3]){assert.deepEqual(freakHairspringPoint(1,angle),freakHairspringPoint(1,0));const inner=freakHairspringPoint(0,angle);near(inner[0],.08*Math.cos(angle));near(inner[1],.08*Math.sin(angle));}
});
test('Bilingual lesson exposes all five chapters, controls and factual limitations',()=>{
 for(const lang of ['hu','en']){const html=renderFreakModel(lang);assert.equal((html.match(/data-fr-chapter=/g)||[]).length,5);assert(html.includes('data-fr-play')&&html.includes('data-fr-explode'));assert.equal(FREAK_LESSON[lang].parts.length,7);assert(FREAK_LESSON[lang].limitsText.includes('US6301981B1'));new Function(freakScript(lang));assert(!html.includes(String.fromCharCode(0x2014)));}
});
test('No network imports, automatic playback or credential dependency',()=>{
 const code=readFileSync('src/lib/freak-view.mjs','utf8');assert(!/fetch\(|XMLHttpRequest|https?:\/\/|localStorage|OPENAI|WebSocket/.test(code));assert(code.includes('running=false'));assert(code.includes('visibilitychange'));assert(code.includes('IntersectionObserver'));
});
test('Production model link is injected explicitly and escaped, private preview stays local',()=>{
 assert(renderFreakModel('hu').includes('href="muhely.html"'));
 assert(renderFreakModel('en').includes('href="workshop.html"'));
 assert(renderFreakModel('hu',{openHref:'/muhely/freak/'}).includes('href="/muhely/freak/"'));
 assert(renderFreakModel('en',{openHref:'/en/workshop/freak/'}).includes('href="/en/workshop/freak/"'));
 assert(!renderFreakModel('hu',{standalone:true,openHref:'/muhely/freak/'}).includes('href="/muhely/freak/"'));
 assert(renderFreakModel('hu',{openHref:'/x?y="&z=1'}).includes('&quot;&amp;z=1'));
});
