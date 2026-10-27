import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BUCKLING_LIMIT,bladeDemoForce,bladePotential,bladeGradient,bladeState,bladeStep,bladePoint,meterState,meterStep,modelProject} from '../src/lib/constant-escapement-model.mjs';
import {renderConstantEscapementModel,constantEscapementScript} from '../src/lib/constant-escapement-view.mjs';
const close=(a,b,tol=1e-8)=>assert(Math.abs(a-b)<tol,`${a} != ${b}`);
const evolve=(state,force,time,damping=.45,dt=1/240)=>{for(let i=0;i<Math.round(time/dt);i++)state=bladeStep(state,force,dt,damping);return state;};
test('Two stable minima, barrier and analytical static folds',()=>{
 for(const q of [-1,1]){close(bladePotential(q),0);close(bladeGradient(q),0);close(evolve(bladeState(q),0,20).q,q);}
 close(bladePotential(0),.25);close(Math.abs(bladeGradient(1/Math.sqrt(3))),BUCKLING_LIMIT);
});
test('Start-demo external load deforms the resting blade and crosses both sides',()=>{
 close(bladeDemoForce(0),0);close(bladeDemoForce(1.5),-.5);close(bladeDemoForce(7.5),.5);
 let s=bladeState(),low=1,high=-1;
 for(let i=1;i<=240*12;i++){
  const time=i/240,f=bladeDemoForce(time);assert(Math.abs(f)<=.5);close(f,-bladeDemoForce(time,-1));
  s=bladeStep(s,f);if(i===480)assert(s.q<.9);if(i>960)low=Math.min(low,s.q);if(i>1920)high=Math.max(high,s.q);
 }
 assert(low<-.9&&high>.9);assert.throws(()=>bladeDemoForce(NaN));assert.throws(()=>bladeDemoForce(-1));
});
test('Subcritical loading retains the side, supercritical force causes a snap',()=>{
 assert(evolve(bladeState(),-.2,40).q>0);
 const left=evolve(bladeState(),-.48,40);assert(left.q<-1);assert(evolve(left,.48,40).q>1);
 const perturbed=evolve(bladeState(1.08),0,50);close(perturbed.q,1,1e-4);
});
test('RK4 conserves undamped energy and accounts for dissipated work',()=>{
 const initial=bladeState(.75,.2),start=bladePotential(initial.q)+initial.v**2/2;
 const free=evolve(initial,0,50,0);close(bladePotential(free.q)+free.v**2/2,start,1e-7);
 const driven=evolve(initial,-.48,30);close(bladePotential(driven.q)+driven.v**2/2+driven.loss-start,driven.work,1e-7);
 const coarse=evolve(initial,-.48,20,.45,1/120),fine=evolve(initial,-.48,20);close(coarse.q,fine.q,1e-6);
});
test('Trial shape fixes both clamps and is visible in both views',()=>{
 for(const q of [-1,1]){close(bladePoint(0,q)[1],0);close(bladePoint(1,q)[1],0);close(bladePoint(.5,q)[1],q*.52);}
 for(const pitch of [0,.55])assert(Math.abs(modelProject(bladePoint(.5,1),0,pitch)[1]-modelProject(bladePoint(.5,-1),0,pitch)[1])>80);
});
test('Metering is a separate model with fixed unit doses and a closed energy ledger',()=>{
 for(const drive of [.05,.2,.5,1,1.4]){
  let s=meterState();for(let i=0;i<240*40;i++)s=meterStep(s,drive);
  close(s.incoming,s.stored+s.delivered+s.unused,1e-8);assert(s.history.every(n=>n===0||n===1));assert(s.stored>=0&&s.stored<=1);assert.equal(s.beats,20);
  if(drive===.2){assert(s.missed>0);assert(s.delivered>0);}if(drive===1)assert.equal(s.missed,0);
 }
});
test('Invalid values fail explicitly instead of corrupting the simulation',()=>{
 assert.throws(()=>bladeStep(bladeState(),NaN));assert.throws(()=>bladeStep(bladeState(),0,1));assert.throws(()=>meterStep(meterState(),-1));assert.throws(()=>meterStep(meterState(),Infinity));
});
test('Both languages include five lessons, control labels and explicit limitations',()=>{
 for(const lang of ['hu','en']){
  const html=renderConstantEscapementModel(lang);assert.equal((html.match(/data-ce-chapter=/g)||[]).length,5);assert.equal((html.match(/data-ce-part=/g)||[]).length,6);assert(html.includes('<noscript>'));assert(!html.includes(String.fromCharCode(0x2014)));new Function(constantEscapementScript(lang));
 }
});
test('Production link is explicit and escaped; offline defaults stay local',()=>{
 for(const [lang,local,path] of [['hu','muhely.html','/muhely/constant-escapement/'],['en','workshop.html','/en/workshop/constant-escapement/']]){
  assert(renderConstantEscapementModel(lang).includes('href="'+local+'"'));
  const html=renderConstantEscapementModel(lang,{openHref:path,referenceSrc:'/_astro/detail.png'});
  assert(html.includes('href="'+path+'"'));assert(!html.includes(local));assert(html.includes('src="/_astro/detail.png"'));
  assert(!renderConstantEscapementModel(lang,{standalone:true,openHref:path}).includes('href="'+path+'"'));
 }
 assert(renderConstantEscapementModel('hu',{openHref:'/x?a=1&b="2"'}).includes('href="/x?a=1&amp;b=&quot;2&quot;"'));
});
