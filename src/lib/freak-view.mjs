import {FREAK_LESSON} from '../i18n/freak.ts';
import {FREAK_TAU,FREAK_PHASES,freakDisplay,freakEscapeFrame,freakNextPhase,freakRotate,freakHairspringPoint,freakProject,freakGearPoints} from './freak-model.mjs';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderFreakModel(lang,{standalone=false,openHref=lang==='hu'?'muhely.html':'workshop.html'}={}){
 const t=FREAK_LESSON[lang],c=t.chapters[0];
 return `<section class="fr-model" data-freak-model aria-label="${esc(t.title)}"><header class="fr-head"><span class="fr-kicker">${esc(t.eyebrow)}</span><h3>${esc(t.title)}</h3><p>${esc(t.intro)}</p>${standalone?'':`<a href="${esc(openHref)}">${esc(t.open)} ↗</a>`}</header><nav class="fr-tabs" aria-label="${esc(t.guide)}">${t.chapters.map((c,i)=>`<button type="button" data-fr-chapter="${i}" aria-current="${i===0?'step':'false'}"><span>0${i+1}</span>${esc(c.tab)}</button>`).join('')}</nav>
 <div class="fr-lesson"><span class="fr-kicker" data-fr-progress>01 / 05</span><h4 data-fr-title>${esc(c.title)}</h4><p data-fr-intro>${esc(c.text)}</p></div><div class="fr-bench"><div class="fr-stage"><p class="fr-caption" data-fr-caption>${esc(t.overviewCaption)}</p><canvas width="960" height="680" data-fr-canvas tabindex="0" role="img" aria-label="${esc(t.drag)}"></canvas><p class="fr-hint">${esc(t.drag)}</p><div class="fr-readouts"><div><span data-fr-value-label>${esc(t.clock)}</span><output data-fr-value>10:10</output></div><div><span data-fr-detail-label>${esc(t.orbit)}</span><output data-fr-detail>60°</output></div></div><p class="fr-phase" data-fr-phase role="status">${esc(t.overviewCaption)}</p>
 <div class="fr-controls"><button type="button" data-fr-play aria-pressed="false">${esc(t.play)}</button><button type="button" data-fr-step>${esc(t.step)}</button><button type="button" data-fr-hour>${esc(t.hourStep)}</button><button type="button" data-fr-reset>${esc(t.reset)}</button><span data-fr-status role="status" aria-live="polite">${esc(t.ready)}</span></div>
 <div class="fr-sliders"><label data-fr-clock-wrap>${esc(t.time)}<input type="range" data-fr-clock min="0" max="719" step="1" value="610"></label><label>${esc(t.explode)}<input type="range" data-fr-explode min="0" max="1" step="0.01" value="0"></label><label><span data-fr-speed-label>${esc(t.speed)}</span><select data-fr-speed><option value="1">${esc(t.speedOptions[0])}</option><option value="60">${esc(t.speedOptions[1])}</option><option value="300" selected>${esc(t.speedOptions[2])}</option></select><select data-fr-escape-speed hidden><option value="0.1">${esc(t.escapeOptions[0])}</option><option value="0.25" selected>${esc(t.escapeOptions[1])}</option><option value="0.5">${esc(t.escapeOptions[2])}</option></select></label><label>${esc(t.view)}<select data-fr-view><option value="space">${esc(t.views[0])}</option><option value="top">${esc(t.views[1])}</option><option value="side">${esc(t.views[2])}</option></select></label></div></div>
 <aside class="fr-notes"><div class="fr-task"><span class="fr-kicker">${esc(t.observe)}</span><p data-fr-task>${esc(c.task)}</p></div><h5>${esc(t.partsTitle)}</h5><div class="fr-parts">${t.parts.map((p,i)=>`<button type="button" data-fr-part="${i}" aria-pressed="false"><span>${i+1}</span>${esc(p)}</button>`).join('')}</div><p data-fr-part-text>${esc(t.partText[2])}</p><p class="fr-hint">${esc(t.legend)}</p></aside></div><p class="fr-separate">${esc(t.separate)}</p><details class="fr-limits"><summary>${esc(t.limits)}</summary><p>${esc(t.limitsText)}</p><p>${esc(t.reference)}</p></details><noscript><p>${esc(t.noJS)}</p></noscript></section>`;
}
export const freakCSS=`
.fr-model{container-type:inline-size;margin:42px 0;max-width:100%;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-family:var(--font-sans)}.fr-model *{box-sizing:border-box}.fr-model p{text-indent:0!important}.fr-model [hidden]{display:none!important}.fr-head,.fr-lesson{padding:25px 28px}.fr-head{border-bottom:1px solid var(--line)}.fr-kicker{font:500 10px/1.5 var(--font-mono);letter-spacing:.12em;color:var(--muted);text-transform:uppercase}.fr-model .fr-head h3{font:450 clamp(30px,4vw,46px)/1.07 var(--font-serif);margin:14px 0;letter-spacing:-.035em}.fr-model .fr-head p,.fr-model .fr-lesson p{font-size:16px;line-height:1.6;margin:12px 0;max-width:75ch}.fr-head a{font:12px var(--font-mono);text-decoration:underline;text-underline-offset:4px}.fr-tabs{display:flex;overflow-x:auto;border-bottom:1px solid var(--line)}.fr-model button,.fr-model select{min-height:44px;color:var(--ink);background:var(--paper);border:1px solid var(--line);font:500 12px/1.4 var(--font-sans);padding:10px 12px;cursor:pointer;border-radius:0}.fr-model button:focus-visible,.fr-model select:focus-visible,.fr-model input:focus-visible,.fr-model canvas:focus-visible{outline:2px solid var(--brass);outline-offset:3px}.fr-model button:hover{border-color:var(--ink)}.fr-tabs button{min-width:150px;flex:1;text-align:left;border:0;border-right:1px solid var(--line);white-space:nowrap}.fr-tabs button span{display:block;font:10px var(--font-mono);margin-bottom:6px}.fr-tabs [aria-current=step]{background:var(--ink);color:var(--paper)}.fr-model .fr-lesson h4{font:450 28px/1.15 var(--font-serif);margin:13px 0}.fr-bench{display:grid;grid-template-columns:minmax(0,2fr) minmax(210px,1fr);gap:26px;padding:0 28px 28px}.fr-stage,.fr-notes{min-width:0}.fr-model .fr-caption{font:11px/1.5 var(--font-mono);margin:0;padding:12px;background:var(--paper);border:1px solid var(--line);border-bottom:0}.fr-stage canvas{display:block;width:100%;height:auto;background:var(--paper);border:1px solid var(--line);cursor:grab;touch-action:pan-y}.fr-model .fr-hint{font:11px/1.5 var(--font-mono);color:var(--muted);margin:10px 0}.fr-readouts{display:grid;grid-template-columns:1fr 1fr;gap:18px;border-bottom:1px solid var(--line);padding:12px 0}.fr-readouts span{font:10px/1.5 var(--font-mono);color:var(--muted);display:block}.fr-readouts output{font:500 25px/1.4 var(--font-mono);display:block;margin-top:5px}.fr-model .fr-phase{font:12px/1.6 var(--font-sans);min-height:38px;margin:12px 0}.fr-controls{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:12px 0}.fr-controls [data-fr-play]{background:var(--ink);color:var(--paper)}.fr-controls [data-fr-status]{font:10px/1.5 var(--font-mono);color:var(--muted);padding:5px}.fr-model[data-running=true] [data-fr-status]::before{content:'● ';color:var(--brass)}.fr-sliders{display:grid;grid-template-columns:1fr 1fr;gap:15px}.fr-sliders label{font:11px/1.5 var(--font-mono);min-width:0}.fr-sliders input{display:block;width:100%;margin:14px 0;accent-color:var(--brass)}.fr-sliders select{display:block;width:100%;font:11px var(--font-mono);margin-top:8px}.fr-task{background:var(--paper);padding:18px;border-top:3px solid var(--brass);margin-bottom:24px}.fr-model .fr-task p,.fr-model [data-fr-part-text]{font:14px/1.6 var(--font-sans);margin:12px 0}.fr-model h5{font:500 12px/1.5 var(--font-mono);margin:0 0 14px}.fr-parts{display:grid;gap:7px}.fr-parts button{text-align:left;display:flex;align-items:center;gap:10px}.fr-parts button span{font:11px var(--font-mono)}.fr-parts [aria-pressed=true]{border-color:var(--ink);box-shadow:inset 3px 0 var(--brass)}.fr-model .fr-separate{padding:0 28px 18px;margin:0;font:11px/1.6 var(--font-mono);color:var(--muted)}.fr-limits{padding:18px 28px;border-top:1px solid var(--line)}.fr-limits summary{font:12px/1.5 var(--font-mono);cursor:pointer}.fr-model .fr-limits p{font:13px/1.65 var(--font-sans);margin:14px 0}.fr-model noscript p{padding:20px;font-size:14px}
@container(max-width:850px){.fr-bench{grid-template-columns:1fr}.fr-notes{display:grid;grid-template-columns:1fr 1fr;gap:16px}.fr-task{grid-column:1;grid-row:1/4;margin:0}.fr-notes h5,.fr-parts{grid-column:2}.fr-notes [data-fr-part-text],.fr-notes>.fr-hint{grid-column:1/-1}.fr-notes h5{margin:0}.fr-head,.fr-lesson{padding:22px}.fr-bench{padding:0 22px 22px}}
@container(max-width:470px){.fr-head,.fr-lesson{padding:18px}.fr-bench{padding:0 10px 18px}.fr-notes{display:block}.fr-task{margin-bottom:20px}.fr-model .fr-lesson h4{font-size:24px}.fr-readouts output{font-size:20px}.fr-controls{gap:6px}.fr-controls button{font-size:11px;padding:9px}.fr-model .fr-separate,.fr-limits{padding:16px}.fr-parts{grid-template-columns:1fr 1fr}.fr-parts button{font-size:11px;padding:8px}.fr-sliders{gap:12px}}
`;
function mountFreak(t){
 for(const root of document.querySelectorAll('[data-freak-model]')){
  if(root.dataset.initialized)continue;root.dataset.initialized='true';
  const el=n=>root.querySelector('[data-fr-'+n+']'),canvas=el('canvas'),ctx=canvas.getContext('2d');
  let chapter=0,part=-1,seconds=36600,cycles=0,running=false,visible=true,raf=0,last=0,speed=300,escapeSpeed=.25,explode=0,yaw=-.22,pitch=.57,drag=null;
  const closeup=()=>chapter>=3;
  const colors=()=>{const s=getComputedStyle(root),get=n=>s.getPropertyValue('--'+n).trim();return {paper:get('paper'),surface:get('surface'),ink:get('ink'),muted:get('muted'),line:get('line'),brass:get('brass'),accent:get('accent'),mono:get('font-mono')};};
  let faces=[],lines=[],labels=[],p=colors();
  function status(){root.dataset.running=String(running);el('status').textContent=running?t.running:(cycles||seconds!==36600)?t.paused:t.ready;el('play').textContent=running?t.pause:t.play;el('play').setAttribute('aria-pressed',String(running));}
  function ensure(){if(!raf&&running&&visible&&!document.hidden)raf=requestAnimationFrame(tick);}
  function run(on){running=on;last=0;if(!on){cancelAnimationFrame(raf);raf=0;}status();ensure();}
  // Separate horizontal component planes before sorting their individual faces.
  // A large lower plate must never paint over a small upper component simply
  // because its average projected centre is nearer the camera.
  const depth=points=>points.reduce((a,v)=>a+v[2]*100+(v[0]*Math.sin(yaw)+v[1]*Math.cos(yaw))*.12,0)/points.length;
  function face(points,color,group,holes=[]){faces.push({points,color,group,holes,depth:depth(points)});}
  function line(points,color,width=2,group=-1){lines.push({points,color,width,group,depth:depth(points)+.01});}
  function circle(x,y,z,r,n=64){return Array.from({length:n},(_,i)=>[x+r*Math.cos(i*FREAK_TAU/n),y+r*Math.sin(i*FREAK_TAU/n),z]);}
  function solid(points,thickness,color,group,holes=[]){
   const lower=points.map(([x,y,z])=>[x,y,z-thickness]);
   for(let i=0;i<points.length;i++)face([lower[i],lower[(i+1)%points.length],points[(i+1)%points.length],points[i]],color,group);
   face(points,color,group,holes);line([...points,points[0]],p.ink,.9,group);
  }
  function annulus(x,y,z,outer,inner,color,group,n=80){
   const a=circle(x,y,z,outer,n),b=circle(x,y,z,inner,n);for(let i=0;i<n;i++)face([a[i],a[(i+1)%n],b[(i+1)%n],b[i]],color,group);
   line([...a,a[0]],p.ink,1,group);line([...b,b[0]],p.muted,1,group);
  }
  function transform(points,angle){return points.map(v=>freakRotate(v,angle));}
  function gear(x,y,z,r,teeth,angle,color,group,longEvery=0,orbit=0){
   const outer=transform(freakGearPoints(x,y,z,r,teeth,angle,longEvery),orbit),hole=transform(circle(x,y,z,r*.60,40),orbit);
   solid(outer,.07,color,group,[hole]);
   for(let i=0;i<5;i++){const a=angle+i*FREAK_TAU/5,c=Math.cos(a),s=Math.sin(a),q=.07*r;
    solid(transform([[x-q*s,y+q*c,z],[x+r*.76*c-q*s,y+r*.76*s+q*c,z],[x+r*.76*c+q*s,y+r*.76*s-q*c,z],[x+q*s,y-q*c,z]],orbit),.05,color,group);
   }
   solid(transform(circle(x,y,z+.02,r*.18,20),orbit),.05,p.muted,group);
  }
  function marker(point,text,group,color=p.ink){labels.push({point,text,group,color});}
  function arrow(a,b,color,group=-1){line([a,b],color,7,group);lines.at(-1).depth=1e6;const d=[b[0]-a[0],b[1]-a[1]],len=Math.hypot(...d)||1;line([[b[0]-.18*d[0]/len+.12*d[1]/len,b[1]-.18*d[1]/len-.12*d[0]/len,b[2]],b,[b[0]-.18*d[0]/len-.12*d[1]/len,b[1]-.18*d[1]/len+.12*d[0]/len,b[2]]],color,5,group);lines.at(-1).depth=1e6;}
  function balance(x,y,z,r,angle,orbit=0){
   const c=freakRotate([x,y,z],orbit);annulus(c[0],c[1],c[2],r,r*.88,p.brass,5,80);
   for(let i=0;i<3;i++){const a=angle+i*FREAK_TAU/3;line(transform([[x,y,z],[x+r*.9*Math.cos(a),y+r*.9*Math.sin(a),z]],orbit),p.brass,5,5);}
   const spiral=Array.from({length:171},(_,i)=>freakHairspringPoint(i/170,angle,x,y,z+.055,r));line(transform(spiral,orbit),p.ink,1.6,5);
   solid(transform(circle(x,y,z+.02,r*.10,18),orbit),.06,p.muted,5);
  }
  function drawClock(){
   const d=freakDisplay(seconds),a=d.minuteAngle,h=d.hourAngle,open=explode;
   solid(circle(0,0,-.35,3.62,90),.30,p.line,0);annulus(0,0,-.01,3.57,3.07,p.surface,0);solid(circle(0,0,-.10,3.05,80),.08,p.paper,0);
   for(let i=0;i<60;i++){const a=i*FREAK_TAU/60,r=i%5?3.25:3.17;line([[r*Math.sin(a),-r*Math.cos(a),.02],[3.43*Math.sin(a),-3.43*Math.cos(a),.02]],p.muted,i%5?1:2,0);}
   for(let i=1;i<=12;i++){const a=i*FREAK_TAU/12;labels.push({point:[2.87*Math.sin(a),-2.87*Math.cos(a),.02],text:String(i),group:0,color:p.ink,numeral:true});}
   const barrelZ=.07+open*.15;solid(circle(0,0,barrelZ,2.45,70),.15,p.surface,1);annulus(0,0,barrelZ+.01,2.24,2.16,p.line,1);
   solid(transform([[-.15,.4,barrelZ+.08],[-.15,-1.86,barrelZ+.08],[-.4,-1.86,barrelZ+.08],[0,-2.54,barrelZ+.08],[.4,-1.86,barrelZ+.08],[.15,-1.86,barrelZ+.08],[.15,.4,barrelZ+.08]],h),.08,p.accent,1);
   const z=.37+open*.65;
   gear(0,.36,z,.59,36,-a*4,p.line,3,0,a);gear(0,-.65,z+.10,.43,28,a*7,p.brass,3,0,a);
   // The two small escape wheels are context here. Their magnified sequence is separate.
   const f=freakEscapeFrame(cycles);gear(-.34,-1.48,z+.15,.34,25,f.wheelA,p.brass,4,5,a);gear(.34,-1.48,z+.15,.34,25,f.wheelB+Math.PI/25,p.muted,4,5,a);
   balance(0,-2.10,z+.38,.56,f.balance,a);
   const top=z+.48+open*.45;
   const bridge=[[-.19,1.35,top],[-.28,.7,top],[-.28,-1.1,top],[-.20,-1.56,top],[0,-2.82,top],[.20,-1.56,top],[.28,-1.1,top],[.28,.7,top],[.19,1.35,top]];
   // Open bridge: a real 3D strip around two windows, not a flat watch texture.
   const holes=[circle(0,.25,top,.18,18),circle(0,-.62,top,.17,18)].map(v=>transform(v,a));solid(transform(bridge,a),.10,p.brass,2,holes);
   solid(circle(0,0,top+.12,.16,25),.12,p.ink,2);line([[0,0,-.12],[0,0,top+.16]],p.ink,2,2);
   if(chapter===0){marker(freakRotate([.55,-2.55,top+.2],a),'3',2);marker(freakRotate([-.5,-2.28,barrelZ+.2],h),'2',1);}
   if(chapter===1||chapter===2){marker(freakRotate([.72,-2.14,z+.5],a),'6',5);marker(freakRotate([.74,-.60,z+.2],a),'4',3);marker(freakRotate([-.60,.65,top],a),'3',2);marker([-2.5,1.6,barrelZ],'2',1);}
   el('value').textContent=String(d.hour).padStart(2,'0')+':'+String(d.minute).padStart(2,'0');el('detail').textContent=(d.minuteAngle*180/Math.PI).toFixed(1)+'°';el('clock').value=String(Math.floor((seconds%43200)/60));
  }
  function drawEscape(){
   const f=freakEscapeFrame(cycles),z=.15+explode*.4;
   solid([[-2.65,-2.5,-.32],[2.65,-2.5,-.32],[2.65,2.1,-.32],[-2.65,2.1,-.32]],.16,p.surface,3);
   gear(-1.03,.30,z,1.03,25,f.wheelA,p.brass,4,5);gear(1.03,.30,z,1.03,25,f.wheelB+Math.PI/25,p.muted,4,5);
   // Separate impulse roller and locking member, as in the original patent.
   const rollerZ=z+.27+explode*.28;
   solid(circle(0,-1.10,rollerZ,.60,36),.10,p.paper,5);annulus(0,-1.10,rollerZ+.01,.60,.50,p.brass,5);
   for(const delta of [-.64,.64]){const a=f.balance+delta;solid(circle(.63*Math.sin(a),-1.10+.63*Math.cos(a),rollerZ+.02,.075,12),.08,p.ink,5);}
   const rock=f.rocker;
   const rocking=[[-.26,-.60,z+.13],[-.19,-.92,z+.13],[.19,-.92,z+.13],[.26,-.60,z+.13],[.16,-.34,z+.13],[-.16,-.34,z+.13]].map(([x,y,z])=>freakRotate([x,y+.63,z],rock)).map(([x,y,z])=>[x,y-.63,z]);
   solid(rocking,.10,p.ink,6);solid(circle(0,-.63,z+.24,.07,12),.04,p.paper,6);
   balance(0,-1.10,rollerZ+.38+explode*.42,1.13,f.balance);
   marker([-1.03,1.66,z],'A',4,p.brass);marker([1.03,1.66,z],'B',4,p.muted);marker([1.30,-1.8,rollerZ+.6],'6',5);marker([.83,-.57,z+.22],'7',6);line([[.72,-.57,z+.22],[0,-.61,z+.2]],p.ink,1.5,6);
   if(f.impulse){const side=f.impulse==='A'?-1:1;arrow([side*.67,-.27,rollerZ+.08],[side*.22,-.85,rollerZ+.08],p.brass,4);}
   if(f.locked){const side=f.lockWheel==='A'?-1:1;line([[side*.53,-.37,z+.21],[side*.18,-.55,z+.21]],p.ink,8,6);marker([side*1.88,.30,z+.2],'‖',4);}
   el('value').textContent=(Math.floor(cycles)+1).toString();el('detail').textContent=f.impulse?f.impulse:'0';el('phase').textContent=t.phases[f.phase];
   root.dataset.phase=String(f.phase);root.dataset.locked=String(f.locked);root.dataset.impulse=f.impulse||'none';root.dataset.wheelA=String(f.wheelA);root.dataset.wheelB=String(f.wheelB);
  }
  function draw(){
   p=colors();faces=[];lines=[];labels=[];ctx.clearRect(0,0,960,680);ctx.lineJoin='round';ctx.lineCap='round';
   closeup()?drawEscape():drawClock();const scale=closeup()?96:76;
   const project=v=>freakProject(v,yaw,pitch,scale,480,closeup()?350:326);
   function trace(points){points.forEach((v,i)=>{const [x,y]=project(v);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});}
   for(const f of [...faces,...lines].sort((a,b)=>a.depth-b.depth)){
    ctx.globalAlpha=part<0||part===f.group||f.group<0?1:.20;ctx.beginPath();trace(f.points);
    if(f.width){ctx.strokeStyle=f.color;ctx.lineWidth=f.width;ctx.stroke();continue;}
    ctx.closePath();for(const hole of f.holes){trace(hole);ctx.closePath();}ctx.fillStyle=f.color;ctx.fill('evenodd');
    ctx.globalAlpha*=.4;ctx.strokeStyle=p.ink;ctx.lineWidth=.45;ctx.stroke();
   }
   ctx.globalAlpha=1;ctx.textAlign='center';ctx.textBaseline='middle';
   for(const l of labels){const [x,y]=project(l.point);if(!l.numeral){ctx.beginPath();ctx.arc(x,y,21,0,FREAK_TAU);ctx.fillStyle=p.paper;ctx.fill();ctx.strokeStyle=l.color;ctx.lineWidth=2;ctx.stroke();}ctx.fillStyle=l.color;ctx.font=`500 ${l.numeral?24:29}px ${p.mono}`;ctx.fillText(l.text,x,y);}
   root.dataset.displaySeconds=String(seconds);root.dataset.cycles=String(cycles);root.dataset.chapter=String(chapter);root.dataset.yaw=String(yaw);root.dataset.explode=String(explode);
  }
  function choose(n){run(false);chapter=n;part=-1;seconds=36600;cycles=0;explode=0;el('explode').value='0';yaw=-.22;pitch=.57;el('view').value='space';
   const c=t.chapters[n];el('title').textContent=c.title;el('intro').textContent=c.text;el('task').textContent=c.task;el('progress').textContent='0'+(n+1)+' / 05';el('caption').textContent=closeup()?t.closeCaption:t.overviewCaption;
   el('step').textContent=closeup()?t.phaseStep:t.step;el('hour').hidden=closeup();el('clock-wrap').hidden=closeup();el('speed').hidden=closeup();el('escape-speed').hidden=!closeup();el('speed-label').textContent=closeup()?t.escapeSpeed:t.speed;el('value-label').textContent=closeup()?t.cycle:t.clock;el('detail-label').textContent=closeup()?t.impulse:t.orbit;el('phase').textContent=closeup()?t.phases[0]:t.overviewCaption;el('clock').value='610';
   root.querySelectorAll('[data-fr-chapter]').forEach((b,i)=>b.setAttribute('aria-current',i===n?'step':'false'));
   root.querySelectorAll('[data-fr-part]').forEach((b,i)=>{b.hidden=closeup()?i<3:i===6;b.setAttribute('aria-pressed','false');});el('part-text').textContent=t.partText[closeup()?4:2];draw();status();
  }
  root.querySelectorAll('[data-fr-chapter]').forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.frChapter))));
  root.querySelectorAll('[data-fr-part]').forEach(b=>b.addEventListener('click',()=>{const n=Number(b.dataset.frPart);part=part===n?-1:n;root.querySelectorAll('[data-fr-part]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===part)));el('part-text').textContent=t.partText[n];draw();}));
  el('play').addEventListener('click',()=>run(!running));el('step').addEventListener('click',()=>{run(false);if(closeup())cycles=freakNextPhase(cycles);else seconds+=300;draw();status();});
  el('hour').addEventListener('click',()=>{run(false);seconds+=3600;draw();status();});el('reset').addEventListener('click',()=>choose(chapter));
  el('clock').addEventListener('input',()=>{run(false);seconds=Number(el('clock').value)*60;draw();status();});el('explode').addEventListener('input',()=>{explode=Number(el('explode').value);draw();});
  el('speed').addEventListener('change',()=>speed=Number(el('speed').value));el('escape-speed').addEventListener('change',()=>escapeSpeed=Number(el('escape-speed').value));
  el('view').addEventListener('change',()=>{const v=el('view').value;yaw=v==='top'?0:-.22;pitch=v==='top'?0:v==='side'?1.10:.57;draw();});
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,yaw,pitch,id:e.pointerId};if(e.pointerType!=='touch')canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(e.pointerType==='touch'&&Math.abs(dy)>Math.abs(dx)+8){drag=null;return;}yaw=drag.yaw+dx/220;pitch=Math.max(0,Math.min(1.18,drag.pitch+dy/240));draw();});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>drag=null);
  canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();yaw+=e.key==='ArrowLeft'?-.12:e.key==='ArrowRight'?.12:0;pitch=Math.max(0,Math.min(1.18,pitch+(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0)));draw();});
  function tick(now){raf=0;if(running&&visible&&!document.hidden&&last){const dt=Math.min((now-last)/1000,.05);if(closeup())cycles+=dt*escapeSpeed;else{seconds+=dt*speed;cycles+=dt*.25;el('clock').value=String(Math.floor((seconds%43200)/60));}draw();}last=now;ensure();}
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;last=0;if(!visible){cancelAnimationFrame(raf);raf=0;}ensure();},{rootMargin:'150px'}).observe(root);
  new MutationObserver(draw).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;}ensure();});window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);raf=0;last=0;});window.addEventListener('pageshow',()=>{last=0;ensure();});choose(0);
 }
}
export function freakScript(lang){return `(()=>{const FREAK_TAU=${FREAK_TAU},FREAK_PHASES=${JSON.stringify(FREAK_PHASES)};${[freakDisplay,freakEscapeFrame,freakNextPhase,freakRotate,freakHairspringPoint,freakProject,freakGearPoints].map(f=>f.toString()).join('\n')}(${mountFreak.toString()})(${JSON.stringify(FREAK_LESSON[lang]).replaceAll('<','\\u003c')});})();`;}
