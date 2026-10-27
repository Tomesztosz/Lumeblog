import {CONSTANT_LESSON} from '../i18n/constant-escapement.ts';
import {BUCKLING_LIMIT,bladeDemoForce,bladePotential,bladeGradient,bladeState,bladeStep,bladePoint,meterState,meterStep,modelProject} from './constant-escapement-model.mjs';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderConstantEscapementModel(lang,{standalone=false,referenceSrc='',openHref=lang==='hu'?'muhely.html':'workshop.html'}={}){
 const t=CONSTANT_LESSON[lang],first=t.chapters[0];
 return `<section class="ce-model" data-constant-model aria-label="${esc(t.title)}"><header class="ce-head"><span class="ce-kicker">${esc(t.eyebrow)}</span><h3>${esc(t.title)}</h3><p>${esc(t.intro)}</p>${standalone?'':`<a href="${esc(openHref)}">${esc(t.open)} ↗</a>`}</header>
 ${referenceSrc?`<details class="ce-reference"><summary>${esc(t.referenceTitle)}</summary><figure><img src="${esc(referenceSrc)}" width="1340" height="700" loading="lazy" alt="${esc(t.referenceAlt)}"><figcaption>${esc(t.referenceCredit)}</figcaption></figure><p>${esc(t.referenceText)}</p></details>`:''}
 <nav class="ce-tabs" aria-label="${esc(t.guide)}">${t.chapters.map((c,i)=>`<button type="button" data-ce-chapter="${i}" aria-current="${i===0?'step':'false'}"><span>0${i+1}</span>${esc(c.tab)}</button>`).join('')}</nav>
 <div class="ce-lesson"><span class="ce-kicker" data-ce-progress>01 / 05</span><h4 data-ce-title tabindex="-1">${esc(first.title)}</h4><p data-ce-intro>${esc(first.text)}</p></div>
 <div class="ce-workbench"><div class="ce-drawing"><canvas width="880" height="550" data-ce-canvas role="img" aria-label="${esc(first.title)}"></canvas><p class="ce-drag">${esc(t.drag)}</p>
 <div class="ce-readouts"><div><span>${esc(t.shape)}</span><output data-ce-shape>+1.00</output></div><div><span data-ce-value-label>${esc(t.energy)}</span><output data-ce-value>0.00</output></div><div><span data-ce-result-label>${esc(t.fold)}</span><output data-ce-result>±0.385</output></div></div>
 <div class="ce-controls"><button type="button" data-ce-play aria-pressed="false">${esc(t.play)}</button><button type="button" data-ce-step>${esc(t.step)}</button><button type="button" data-ce-reset>${esc(t.reset)}</button><button type="button" data-ce-flip>${esc(t.flip)}</button><button type="button" data-ce-snap hidden>${esc(t.snap)}</button></div>
 <div class="ce-run-state"><strong data-ce-status role="status" aria-live="polite">${esc(t.ready)}</strong><span>${esc(t.time)} <output data-ce-time>0.00</output></span></div><p class="ce-run-help" data-ce-help>${esc(t.demoHelp)}</p>
 <label class="ce-demo" data-ce-demo-wrap><input type="checkbox" data-ce-demo checked>${esc(t.demo)}</label>
 <div class="ce-sliders"><label data-ce-force-wrap>${esc(t.force)} <output data-ce-force-label>0.000</output><input data-ce-force type="range" min="-0.55" max="0.55" step="0.005" value="0"/></label><label data-ce-drive-wrap hidden>${esc(t.drive)} <output data-ce-drive-label>1.00</output><input data-ce-drive type="range" min="0.05" max="1.4" step="0.05" value="1"/></label><label>${esc(t.speed)}<select data-ce-speed><option value="0.3">0.3</option><option value="0.7" selected>0.7</option><option value="1">1.0</option></select></label><label>${esc(t.camera)}<select data-ce-view><option value="space">${esc(t.views[0])}</option><option value="top">${esc(t.views[1])}</option></select></label></div>
 <section class="ce-graph" data-ce-graph><h5>${esc(t.energy)}</h5><svg viewBox="0 0 640 220" role="img" aria-label="${esc(t.energy)}"><path class="ce-grid" d="M35 15V185H620M320 15V185"/><path data-ce-curve class="ce-curve"/><circle data-ce-dot class="ce-dot" r="7"/><text x="36" y="210">−1.6</text><text x="310" y="210">0</text><text x="586" y="210">+1.6</text></svg><p>${esc(t.xaxis)} · ${esc(t.axis)}</p></section>
 <section class="ce-pulse" data-ce-pulse hidden><h5>${esc(t.pulse)}</h5><div data-ce-bars aria-label="${esc(t.pulse)}"></div><p>${esc(t.pulseNote)}</p><div class="ce-path">${t.energyPath.map((p,i)=>`<span data-ce-station="${i}">${esc(p)}</span>`).join('')}</div><p data-ce-phase role="status">${esc(t.phase[0])}</p></section>
 </div><aside class="ce-notes"><div class="ce-task"><span class="ce-kicker">${esc(t.observe)}</span><p data-ce-task>${esc(first.task)}</p></div><h5>${esc(t.partsTitle)}</h5><div class="ce-parts">${t.parts.map((name,i)=>`<button type="button" data-ce-part="${i}" aria-pressed="${i===0}"><span>${i+1}</span>${esc(name)}</button>`).join('')}</div><p data-ce-part-text>${esc(t.partText[0])}</p></aside></div>
 <p class="ce-limit">${esc(t.relative)}</p><details class="ce-details"><summary>${esc(t.limits)}</summary><p>${esc(t.limitsText)}</p><p>${esc(t.equation)}</p></details><noscript><p>${esc(t.noJS)}</p></noscript></section>`;
}
export const constantEscapementCSS=`
.ce-run-state{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:10px 12px;background:var(--paper);border-left:3px solid var(--brass);font:11px/1.5 var(--font-mono)}.ce-run-state strong{font-weight:500}.ce-model[data-running=true] [data-ce-status]::before{content:'● ';color:var(--brass)}.ce-model .ce-run-help{font:12px/1.5 var(--font-sans);color:var(--muted);margin:10px 0 14px;text-indent:0}.ce-demo{display:flex;gap:10px;align-items:center;min-height:44px;margin-bottom:12px;font:12px/1.4 var(--font-sans)}.ce-demo input{width:18px;height:18px;accent-color:var(--brass)}
.ce-model p{text-indent:0!important}.ce-reference{padding:18px 28px;border-bottom:1px solid var(--line);font-size:14px;line-height:1.6}.ce-reference summary{cursor:pointer;font:500 12px var(--font-mono);padding:8px 0}.ce-reference figure{margin:18px 0}.ce-reference img{display:block;width:100%;height:auto;max-width:100%}.ce-reference figcaption{font:10px/1.5 var(--font-mono);color:var(--muted);margin-top:12px}.ce-reference p{font-size:14px!important;line-height:1.6!important}
.ce-model{container-type:inline-size;max-width:100%;margin:42px 0;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-family:var(--font-sans);overflow:hidden}.ce-model *{box-sizing:border-box}.ce-model [hidden]{display:none!important}.ce-head,.ce-lesson{padding:26px 28px}.ce-head{border-bottom:1px solid var(--line)}.ce-kicker{font:500 10px/1.5 var(--font-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}.ce-model .ce-head h3{font:440 clamp(30px,4vw,48px)/1.06 var(--font-serif);letter-spacing:-.04em;margin:14px 0}.ce-model .ce-head p,.ce-model .ce-lesson p{font-size:16px;line-height:1.55;margin:12px 0;max-width:72ch}.ce-head a{font:500 12px var(--font-mono);text-decoration:underline;text-underline-offset:4px}.ce-tabs{display:flex;border-bottom:1px solid var(--line);overflow-x:auto}.ce-model button{font:500 12px/1.35 var(--font-sans);cursor:pointer;color:var(--ink);border:1px solid var(--line);background:var(--paper);padding:11px 13px;min-height:44px;border-radius:0}.ce-model button:hover{border-color:var(--ink)}.ce-model button:focus-visible,.ce-model select:focus-visible,.ce-model input:focus-visible{outline:2px solid var(--brass);outline-offset:3px}.ce-tabs button{min-width:128px;flex:1;border:0;border-right:1px solid var(--line);text-align:left;white-space:nowrap}.ce-tabs button span{display:block;font:10px var(--font-mono);margin-bottom:5px}.ce-tabs [aria-current=step]{background:var(--ink);color:var(--paper)}.ce-model .ce-lesson h4{font:450 28px/1.15 var(--font-serif);margin:12px 0}.ce-workbench{padding:0 28px 28px;display:grid;grid-template-columns:minmax(0,1.9fr) minmax(210px,1fr);gap:24px}.ce-drawing,.ce-notes{min-width:0}.ce-drawing canvas{display:block;width:100%;height:auto;background:var(--paper);border:1px solid var(--line);touch-action:pan-y;cursor:grab}.ce-drag,.ce-limit,.ce-model .ce-graph p,.ce-model .ce-pulse p{font:11px/1.5 var(--font-mono);color:var(--muted);margin:9px 0}.ce-readouts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-bottom:1px solid var(--line);gap:10px;padding:16px 0}.ce-readouts span{display:block;font:10px/1.4 var(--font-mono);color:var(--muted)}.ce-readouts output{display:block;font:500 25px/1.3 var(--font-mono);margin-top:8px}.ce-controls{display:flex;flex-wrap:wrap;gap:8px;padding:16px 0}.ce-controls [data-ce-play]{background:var(--ink);color:var(--paper)}.ce-sliders{display:grid;grid-template-columns:2fr 1fr 1fr;align-items:end;gap:14px}.ce-sliders label{font:11px/1.5 var(--font-mono);min-width:0}.ce-sliders output{float:right}.ce-sliders input{display:block;width:100%;margin:14px 0;accent-color:var(--brass)}.ce-sliders select{display:block;width:100%;min-height:44px;padding:8px;background:var(--paper);color:var(--ink);border:1px solid var(--line);font:12px var(--font-mono)}.ce-graph{border-top:1px solid var(--line);margin-top:22px;padding-top:16px}.ce-model h5{font:500 12px/1.3 var(--font-mono);margin:0 0 14px}.ce-graph svg{display:block;width:100%;height:auto;overflow:visible}.ce-grid{stroke:var(--line);fill:none}.ce-curve{stroke:var(--brass);stroke-width:3;fill:none}.ce-dot{fill:var(--ink);stroke:var(--surface);stroke-width:2}.ce-graph text{fill:var(--muted);font:16px var(--font-mono)}.ce-task{padding:18px;background:var(--paper);border-top:3px solid var(--brass);margin-bottom:24px}.ce-model .ce-task p,.ce-model [data-ce-part-text]{font-size:14px;line-height:1.55;margin:12px 0 0}.ce-parts{display:grid;gap:7px}.ce-parts button{text-align:left;display:flex;gap:10px;align-items:center}.ce-parts button span{font:10px var(--font-mono);opacity:.65}.ce-parts [aria-pressed=true]{border-color:var(--ink);box-shadow:inset 3px 0 var(--brass)}.ce-limit{padding:0 28px 14px!important}.ce-details{border-top:1px solid var(--line);padding:18px 28px;font-size:13px;line-height:1.6}.ce-details summary{cursor:pointer;font:500 12px/1.5 var(--font-mono)}.ce-model .ce-details p{font-size:13px;line-height:1.6;margin:14px 0}.ce-pulse{padding-top:22px;border-top:1px solid var(--line)}.ce-pulse [data-ce-bars]{display:flex;height:92px;align-items:end;gap:6px;margin-top:20px}.ce-pulse [data-ce-bars] span{flex:1;max-width:32px;min-width:8px;height:80px;background:var(--brass);font:10px var(--font-mono);color:var(--paper);padding:5px;text-align:center}.ce-pulse [data-ce-bars] span[data-empty]{height:16px;background:var(--line);color:var(--ink)}.ce-path{display:flex;gap:5px;flex-wrap:wrap;margin:18px 0}.ce-path span{border:1px solid var(--line);font:10px var(--font-mono);padding:8px}.ce-path [data-active=true]{background:var(--ink);color:var(--paper)}.ce-model noscript p{padding:20px;font-size:14px}
@container(max-width:850px){.ce-workbench{grid-template-columns:1fr}.ce-notes{display:grid;grid-template-columns:1fr 1fr;gap:16px}.ce-notes h5{grid-column:2;grid-row:1;align-self:end}.ce-task{grid-row:1/4;margin:0}.ce-parts{grid-column:2}.ce-notes [data-ce-part-text]{grid-column:1/-1}.ce-head,.ce-lesson{padding:22px}.ce-workbench{padding:0 22px 22px}}
@container(max-width:470px){.ce-notes{display:block}.ce-task{margin-bottom:20px}.ce-head,.ce-lesson{padding:18px}.ce-workbench{padding:0 12px 18px;gap:20px}.ce-sliders{grid-template-columns:1fr 1fr}.ce-sliders label:first-child,.ce-sliders [data-ce-drive-wrap]{grid-column:1/-1}.ce-readouts output{font-size:20px}.ce-model .ce-lesson h4{font-size:25px}.ce-details{padding:18px}.ce-limit{padding:0 18px 12px!important}.ce-parts{grid-template-columns:1fr 1fr}.ce-parts button{padding:8px;font-size:11px}.ce-model .ce-head h3{font-size:32px}}
`;
function mountConstant(t){
 for(const root of document.querySelectorAll('[data-constant-model]')){
  if(root.dataset.initialized)continue;root.dataset.initialized='true';
  const el=n=>root.querySelector('[data-ce-'+n+']'),canvas=el('canvas'),ctx=canvas.getContext('2d');
  let chapter=0,part=0,s=bladeState(),m=meterState(),force=0,drive=1,running=false,speed=.7,last=0,acc=0,visible=true,yaw=-.22,pitch=.55,raf=0,automatic=true,demoTime=0,demoSide=1;
  const theme=()=>{const style=getComputedStyle(root);return {paper:style.getPropertyValue('--paper').trim(),ink:style.getPropertyValue('--ink').trim(),muted:style.getPropertyValue('--muted').trim(),line:style.getPropertyValue('--line').trim(),brass:style.getPropertyValue('--brass').trim(),accent:style.getPropertyValue('--accent').trim()};};
  const meter=()=>chapter>=3;
  function ensureFrame(){if(!raf&&running&&visible&&!document.hidden)raf=requestAnimationFrame(tick);}
  function status(){el('status').textContent=running?t.running:(s.time||m.time)?t.paused:t.ready;el('help').textContent=meter()?t.meterHelp:automatic?t.demoHelp:t.manualHelp;root.dataset.running=String(running);root.dataset.automatic=String(automatic);}
  function run(on){running=on;el('play').textContent=on?t.pause:t.play;el('play').setAttribute('aria-pressed',String(on));last=0;if(!on){cancelAnimationFrame(raf);raf=0;}status();ensureFrame();}
  function reset(){s=bladeState();m=meterState();acc=0;demoTime=0;demoSide=1;force=0;el('force').value='0';el('force-label').textContent='0.000';draw();status();}
  function setAutomatic(on){automatic=on;el('demo').checked=on;if(on){demoTime=0;demoSide=Math.sign(s.q)||1;force=0;}status();}
  function advance(dt){if(meter())m=meterStep(m,drive,dt);else{if(automatic){demoTime+=dt;force=bladeDemoForce(demoTime,demoSide);}s=bladeStep(s,force,dt);}}
  function path3(points,color,width=2,fill=false){ctx.beginPath();points.forEach((p,i)=>{const [x,y]=modelProject(p,yaw,pitch);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});if(fill){ctx.closePath();ctx.fillStyle=color;ctx.fill();}else{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}}
  function ring(x,y,z,r,color,width=3,angle=0,spokes=0){path3(Array.from({length:65},(_,i)=>[x+r*Math.cos(i*Math.PI/32),y+r*Math.sin(i*Math.PI/32),z]),color,width);for(let i=0;i<spokes;i++){const a=angle+i*Math.PI*2/spokes;path3([[x,y,z],[x+r*Math.cos(a),y+r*Math.sin(a),z]],color,width);}}
  function marker(x,y,z,n,color){const [a,b]=modelProject([x,y,z],yaw,pitch);ctx.beginPath();ctx.arc(a,b,18,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.fillStyle=theme().paper;ctx.font='500 23px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(n),a,b);}
  function draw(){
   const p=theme(),isMeter=meter(),pulse=isMeter&&m.time-m.lastPulse<.30;
   const transition=isMeter?Math.min(1,(m.time-m.lastPulse)/.30):0;
   const bow=isMeter?m.side*(transition<1?-Math.cos(Math.PI*transition):1):s.q;
   ctx.clearRect(0,0,880,550);ctx.lineJoin='round';ctx.lineCap='round';
   // Base reference plane, kept distinct from the displaced elastic ribbon.
   path3([[-2.8,-1.3,-.25],[2.8,-1.3,-.25],[2.8,1.35,-.25],[-2.8,1.35,-.25]],p.line,1,true);
   for(let x=-2;x<=2;x+=.5)path3([[x,-1.2,-.24],[x,1.25,-.24]],p.paper,1);
   for(const x of [-2,2]){
    path3([[x-.18,-.35,0],[x+.18,-.35,0],[x+.18,.35,0],[x-.18,.35,0]],part===0?p.brass:p.muted,1,true);
    path3([[x-.18,-.35,0],[x-.18,-.35,-.3],[x+.18,-.35,-.3],[x+.18,-.35,0]],p.ink,1,true);
    ring(x,0,.015,.08,p.paper,4);
   }
   // A ribbon surface, original mechanics coordinate plus enlarged width.
   for(let i=0;i<100;i++){
    const a=bladePoint(i/100,bow),b=bladePoint((i+1)/100,bow);
    path3([[a[0],a[1]-.025,a[2]-.04],[b[0],b[1]-.025,b[2]-.04],[b[0],b[1]+.025,b[2]+.04],[a[0],a[1]+.025,a[2]+.04]],part===1||pulse?p.brass:p.ink,1,true);
   }
   path3(Array.from({length:101},(_,i)=>bladePoint(i/100,bow)),p.brass,3);
   path3([[-2,0,0],[2,0,0]],p.muted,1);
   if(!isMeter){
    const y=.52*bow,sign=force>=0?1:-1;
    if(Math.abs(force)>.0001){path3([[0,y-sign*.9,.13],[0,y-sign*.15,.13]],p.brass,5);
    path3([[-.09,y-sign*.28,.13],[0,y-sign*.15,.13],[.09,y-sign*.28,.13]],p.brass,4);}
    marker(-2.4,-.45,0,1,part===0?p.brass:p.ink);marker(.5,.8,.13,2,part===1?p.brass:p.ink);marker(.2,y-sign*.9,.3,3,part===2?p.brass:p.ink);
   }else{
    const angle=m.delivered*Math.PI/3;
    for(const [x,index]of [[-1.25,0],[1.25,1]]){ring(x,-1.15,.12,.43,part===3?p.brass:p.ink,5,angle+index*.4,3);}
    path3([[0,.52*bow,.13],[0,.65,.15],[0,1.12,.15]],pulse||part===4?p.brass:p.ink,8);
    const a=Math.cos(m.time*Math.PI/2)*1.9;
    ring(0,1.6,0,.66,pulse||part===5?p.brass:p.ink,5,a,3);
    path3(Array.from({length:160},(_,i)=>{const u=i/159,r=.06+u*.43,theta=u*Math.PI*8+a*(1-u);return [r*Math.cos(theta),1.6+r*Math.sin(theta),.02];}),p.brass,2);
    marker(-1.8,-1.05,.5,4,part===3?p.brass:p.ink);marker(.45,.6,.5,5,part===4?p.brass:p.ink);marker(1.1,1.6,.2,6,part===5?p.brass:p.ink);
   }
   el('shape').value=(bow>=0?'+':'')+bow.toFixed(2);
   el('time').value=(isMeter?m.time:s.time).toFixed(2);
   if(!isMeter){el('force').value=String(force);el('force-label').textContent=force.toFixed(3);}
   el('value-label').textContent=isMeter?t.stored:t.elastic;
   el('value').value=(isMeter?m.stored:bladePotential(s.q)).toFixed(2);
   el('result-label').textContent=isMeter?t.delivered+' / '+t.missed:t.fold;
   el('result').value=isMeter?m.delivered+' / '+m.missed:'±'+BUCKLING_LIMIT.toFixed(3);
   if(!isMeter){
    const y=q=>bladePotential(q)-force*q;
    const coords=q=>[35+(q+1.6)/3.2*585,175-(y(q)+.7)/2*150];
    el('curve').setAttribute('d',Array.from({length:201},(_,i)=>{const [x,z]=coords(-1.6+i*3.2/200);return (i?'L':'M')+x.toFixed(2)+','+z.toFixed(2);}).join(' '));
    const [x,z]=coords(s.q);el('dot').setAttribute('cx',x);el('dot').setAttribute('cy',z);
   }else{
    el('bars').innerHTML=m.history.map(n=>'<span'+(n?'':' data-empty')+'>'+n+'</span>').join('');
    el('phase').textContent=t.phase[pulse?2:m.stored>=1-1e-9?1:m.missed&&m.time%2<.4?3:0];
    root.querySelectorAll('[data-ce-station]').forEach((node,i)=>node.dataset.active=String(pulse?i>=3:i<3));
   }
   root.dataset.chapter=String(chapter);root.dataset.q=String(bow);root.dataset.force=String(force);root.dataset.pulses=String(m.delivered);root.dataset.missed=String(m.missed);root.dataset.modelTime=String(isMeter?m.time:s.time);
  }
  function choose(n){run(false);chapter=n;part=n>=3?3:0;automatic=true;el('demo').checked=true;reset();const c=t.chapters[n];el('title').textContent=c.title;el('intro').textContent=c.text;el('task').textContent=c.task;el('progress').textContent='0'+(n+1)+' / 05';canvas.setAttribute('aria-label',c.title);el('force-wrap').hidden=meter();el('demo-wrap').hidden=meter();el('drive-wrap').hidden=!meter();el('flip').hidden=n!==0;el('snap').hidden=n!==2;el('graph').hidden=meter();el('pulse').hidden=!meter();root.querySelectorAll('[data-ce-chapter]').forEach((b,i)=>b.setAttribute('aria-current',i===n?'step':'false'));root.querySelectorAll('[data-ce-part]').forEach((b,i)=>b.hidden=meter()?i===2:i>2);selectPart(part);draw();}
  function selectPart(n){part=n;el('part-text').textContent=t.partText[n];root.querySelectorAll('[data-ce-part]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===n)));draw();}
  root.querySelectorAll('[data-ce-chapter]').forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.ceChapter))));
  root.querySelectorAll('[data-ce-part]').forEach(b=>b.addEventListener('click',()=>selectPart(Number(b.dataset.cePart))));
  el('play').addEventListener('click',()=>run(!running));el('step').addEventListener('click',()=>{run(false);for(let i=0;i<60;i++)advance(1/240);draw();});
  el('reset').addEventListener('click',()=>{run(false);setAutomatic(true);reset();});
  el('flip').addEventListener('click',()=>{run(false);s=bladeState(-Math.sign(s.q||1));demoTime=0;demoSide=Math.sign(s.q);force=0;draw();status();});
  el('snap').addEventListener('click',()=>{setAutomatic(false);force=-Math.sign(s.q||1)*.48;el('force').value=String(force);el('force-label').textContent=force.toFixed(3);run(true);draw();});
  el('force').addEventListener('input',()=>{setAutomatic(false);force=Number(el('force').value);el('force-label').textContent=force.toFixed(3);run(true);draw();});
  el('demo').addEventListener('change',()=>{setAutomatic(el('demo').checked);draw();});
  el('drive').addEventListener('input',()=>{drive=Number(el('drive').value);el('drive-label').textContent=drive.toFixed(2);draw();});
  el('speed').addEventListener('change',()=>speed=Number(el('speed').value));
  el('view').addEventListener('change',()=>{yaw=el('view').value==='top'?0:-.22;pitch=el('view').value==='top'?0:.55;draw();});
  let drag=null;canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;drag={x:e.clientX,y:e.clientY,yaw,pitch};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw=drag.yaw+(e.clientX-drag.x)/260;pitch=Math.max(-1.1,Math.min(1.1,drag.pitch+(e.clientY-drag.y)/260));draw();});canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
  function tick(now){raf=0;if(running&&visible&&!document.hidden&&last){acc+=Math.min((now-last)/1000,.05)*speed;while(acc>=1/240){advance(1/240);acc-=1/240;}draw();}last=now;ensureFrame();}
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;last=0;if(!visible){cancelAnimationFrame(raf);raf=0;}ensureFrame();},{rootMargin:'200px'}).observe(root);
  new MutationObserver(draw).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  document.addEventListener('visibilitychange',()=>{last=0;ensureFrame();});window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);raf=0;last=0;});window.addEventListener('pageshow',()=>{last=0;ensureFrame();});
  choose(0);
 }
}
export function constantEscapementScript(lang){return `(()=>{const BUCKLING_LIMIT=${BUCKLING_LIMIT};${[bladeDemoForce,bladePotential,bladeGradient,bladeState,bladeStep,bladePoint,meterState,meterStep,modelProject].map(f=>f.toString()).join('\n')}(${mountConstant.toString()})(${JSON.stringify(CONSTANT_LESSON[lang]).replaceAll('<','\\u003c')});})();`;}
