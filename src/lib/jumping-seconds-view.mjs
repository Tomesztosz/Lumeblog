import { JUMPING_SECONDS_MODEL } from '../i18n/ui.ts';
import { jumpingSecondsState } from './jumping-seconds-model.mjs';

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ticks = Array.from({length:60}, (_, i) => `<path d="M100 ${i%5?27:20}V32" transform="rotate(${i*6} 100 100)"/>`).join('');
function dial(part) {
  return `<svg viewBox="0 0 200 200" aria-hidden="true"><circle class="jsm-face" cx="100" cy="100" r="82"/><g class="jsm-ticks">${ticks}</g><g class="jsm-numbers"><text x="100" y="49">0</text><text x="155" y="105">15</text><text x="100" y="160">30</text><text x="45" y="105">45</text></g><g data-part="${part}"><path class="jsm-hand" d="M100 117V29"/><circle class="jsm-pin" cx="100" cy="100" r="5"/></g></svg>`;
}
const balance = `<svg viewBox="0 0 200 200" aria-hidden="true"><g data-part="balance"><circle class="jsm-wheel" cx="100" cy="100" r="67"/><circle class="jsm-wheel" cx="100" cy="100" r="61"/><path class="jsm-spokes" d="M39 100H161M100 39V161"/><circle class="jsm-pin" cx="100" cy="100" r="6"/></g><path class="jsm-spring" d="M100 100c-8-12 12-24 22-8s-6 38-28 30-30-39-8-54 53 0 56 26-23 53-55 41-42-55-17-81 70-13 87 22"/></svg>`;
const starPoints = Array.from({length:10}, (_, i) => {const a=i*Math.PI/5-Math.PI/2,r=i%2?32:70;return `${100+Math.cos(a)*r},${100+Math.sin(a)*r}`;}).join(' ');
const star = `<svg viewBox="0 0 200 200" aria-hidden="true"><g data-part="star"><polygon class="jsm-star" points="${starPoints}"/><circle class="jsm-pin" cx="100" cy="100" r="7"/><circle class="jsm-mark" cx="100" cy="48" r="4"/></g></svg>`;
const flirt = `<svg viewBox="0 0 200 200" aria-hidden="true"><circle class="jsm-guide" cx="100" cy="100" r="67"/><g data-part="flirt"><path class="jsm-lever" d="M89 118L95 34Q100 25 105 34L111 118Z"/><circle class="jsm-pin" cx="100" cy="100" r="7"/></g></svg>`;

export function renderJumpingSecondsModel(lang) {
  const t=JUMPING_SECONDS_MODEL[lang];
  if (!t) throw new Error('Unsupported model language');
  const cell=(label,svg,note)=>`<div class="jsm-cell"><strong>${esc(label)}</strong>${svg}<span>${esc(note)}</span></div>`;
  return `<section class="jumping-model" id="jumping-model" data-jumping-model aria-labelledby="jsm-title">
<h3 id="jsm-title">${esc(t.title)}</h3><p class="jsm-intro">${esc(t.intro)}</p>
<div class="jsm-tabs"><button type="button" data-view="rhythm" aria-pressed="true">${esc(t.rhythm)}</button><button type="button" data-view="mechanism" aria-pressed="false">${esc(t.mechanism)}</button></div>
<div class="jsm-scenes"><div class="jsm-grid" data-scene="rhythm">${cell(t.balance,balance,t.balanceNote)}${cell(t.ordinary,dial('ordinary'),t.ordinaryNote)}${cell(t.jumping,dial('jumping'),t.jumpingNote)}</div><div class="jsm-grid" data-scene="mechanism" hidden>${cell(t.star,star,t.starNote)}${cell(t.flirt,flirt,t.flirtNote)}${cell(t.output,dial('output'),t.outputNote)}</div></div>
<dl class="jsm-readouts"><div><dt>${esc(t.time)}</dt><dd data-value="time">0.000 s</dd></div><div><dt>${esc(t.beats)}</dt><dd data-value="beats">0</dd></div><div><dt>${esc(t.jumps)}</dt><dd data-value="jumps">0</dd></div></dl>
<label class="jsm-scrub">${esc(t.scrub)}<input data-scrub type="range" min="0" max="5000" step="1" value="0"></label>
<div class="jsm-controls"><button type="button" data-play>${esc(t.play)}</button><button type="button" data-step>${esc(t.step)}</button><button type="button" data-reset>${esc(t.reset)}</button></div>
<div class="jsm-settings"><label>${esc(t.speed)}<select data-speed><option value="0.25">${esc(t.slow)}</option><option value="1">${esc(t.real)}</option></select></label><label>${esc(t.frequency)}<select data-frequency><option value="3">3 Hz</option><option value="4">4 Hz</option></select></label></div>
<p class="jsm-disclaimer">${esc(t.disclaimer)}</p><span class="jsm-status" role="status" data-status></span></section>`;
}

export const jumpingSecondsModelCSS = `
.jumping-model{margin:36px 0;padding:clamp(16px,3vw,28px);border:1px solid var(--line);background:var(--surface);color:var(--ink)}
.article-body .jumping-model h3{font:500 clamp(25px,4vw,34px)/1.12 var(--font-serif);margin:0 0 12px;letter-spacing:-.035em}
.article-body .jumping-model p{font:400 15px/1.6 var(--font-sans);margin:0 0 20px}
.jsm-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.jsm-grid[hidden]{display:none}
.jsm-cell{min-width:0;text-align:center;padding:16px 8px;background:var(--paper);border:1px solid var(--line);display:flex;flex-direction:column;align-items:center}
.jsm-cell strong{font:500 13px/1.4 var(--font-sans);min-height:36px}.jsm-cell span{font:400 12px/1.45 var(--font-sans);color:var(--muted);max-width:22ch}
.jsm-cell svg{display:block;width:100%;max-width:220px;height:auto;margin:10px 0}
.jsm-face{fill:var(--surface);stroke:var(--line)}.jsm-ticks{fill:none;stroke:var(--ink);stroke-width:1}.jsm-numbers{fill:var(--muted);stroke:none;font:11px var(--font-mono);text-anchor:middle}
.jsm-hand{stroke:var(--ink);stroke-width:3;stroke-linecap:round}.jsm-pin{fill:var(--brass);stroke:var(--paper);stroke-width:2}
.jsm-wheel{fill:none;stroke:var(--brass);stroke-width:4}.jsm-spokes{fill:none;stroke:var(--brass);stroke-width:6}.jsm-spring{fill:none;stroke:var(--ink);stroke-width:1.5}
.jsm-star{fill:var(--brass);stroke:var(--ink)}.jsm-mark{fill:var(--paper)}.jsm-lever{fill:var(--ink);stroke:var(--brass);stroke-width:2}.jsm-guide{fill:none;stroke:var(--line);stroke-dasharray:3 5}
.jsm-tabs,.jsm-controls{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0}
.jumping-model button,.jumping-model select{min-height:44px;padding:10px 14px;border:1px solid var(--line);background:var(--paper);color:var(--ink);font:500 13px/1.3 var(--font-sans);cursor:pointer;border-radius:0}
.jumping-model button[aria-pressed="true"],.jumping-model [data-play]{background:var(--ink);color:var(--paper)}
.jumping-model :is(button,select,input):focus-visible{outline:2px solid var(--brass);outline-offset:3px}
.jsm-readouts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:20px 0;padding:16px 0;border-block:1px solid var(--line);gap:8px}
.jsm-readouts dt{font:12px/1.4 var(--font-sans);color:var(--muted)}.jsm-readouts dd{font:500 clamp(17px,3vw,23px)/1.5 var(--font-mono);margin:6px 0 0;font-variant-numeric:tabular-nums}
.jsm-scrub,.jsm-settings label{font:13px/1.5 var(--font-sans);display:block}.jsm-scrub input{display:block;width:100%;margin:12px 0;accent-color:var(--brass);min-height:32px}
.jsm-settings{display:flex;flex-wrap:wrap;gap:14px}.jsm-settings select{display:block;margin-top:5px;max-width:100%}
.article-body .jumping-model .jsm-disclaimer{font:12px/1.6 var(--font-sans);color:var(--muted);margin:22px 0 0}
.jsm-status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
@media(max-width:540px){.jsm-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.jsm-cell:first-child{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;text-align:left;gap:8px}.jsm-cell:first-child svg{grid-column:1;grid-row:1/3;max-width:140px;margin:0}.jsm-cell:first-child strong,.jsm-cell:first-child span{grid-column:2;min-height:0}.jsm-readouts dt{font-size:11px}.jsm-readouts dd{font-size:16px}}
`;

function initialiseJumpingModel(stateAt, t) {
  const root=document.querySelector('[data-jumping-model]');
  if(!root)return;
  const q=s=>root.querySelector(s);
  let time=0,hz=3,speed=.25,playing=false,last=0,raf=0;
  function draw(){
    const s=stateAt(time,hz);
    q('#jsm-title').textContent=hz===4?t.title4:t.title;
    for(const part of ['balance','ordinary','jumping','star','flirt','output'])q(`[data-part="${part}"]`).setAttribute('transform',`rotate(${part==='output'?s.jumping:s[part]} 100 100)`);
    q('[data-value="time"]').textContent=s.time.toFixed(3)+' s';
    q('[data-value="beats"]').textContent=s.beats;q('[data-value="jumps"]').textContent=s.jumps;
    q('[data-scrub]').value=String(Math.round(time*1000));
    root.dataset.time=String(time);root.dataset.beats=String(s.beats);root.dataset.jumps=String(s.jumps);root.dataset.playing=String(playing);
  }
  function stop(message=t.stopped){playing=false;cancelAnimationFrame(raf);q('[data-play]').textContent=t.play;q('[data-status]').textContent=message;draw();}
  function tick(now){if(!playing)return;time=Math.min(5,time+Math.min((now-last)/1000,.1)*speed);last=now;draw();if(time>=5)stop(t.end);else raf=requestAnimationFrame(tick);}
  q('[data-play]').addEventListener('click',()=>{if(playing)return stop();if(time>=5)time=0;playing=true;last=performance.now();q('[data-play]').textContent=t.pause;q('[data-status]').textContent=t.running;draw();raf=requestAnimationFrame(tick);});
  q('[data-step]').addEventListener('click',()=>{stop();time=Math.min(5,(Math.floor(time*hz*2+1e-8)+1)/(hz*2));draw();});
  q('[data-reset]').addEventListener('click',()=>{stop();time=0;draw();});
  q('[data-scrub]').addEventListener('input',e=>{const next=Number(e.target.value)/1000;stop();time=next;draw();});
  q('[data-speed]').addEventListener('change',e=>{speed=Number(e.target.value);last=performance.now();});
  q('[data-frequency]').addEventListener('change',e=>{stop();hz=Number(e.target.value);time=0;draw();});
  root.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
    stop();const view=button.dataset.view;
    root.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    root.querySelectorAll('[data-scene]').forEach(s=>s.hidden=s.dataset.scene!==view);
    q('[data-frequency]').disabled=view==='mechanism';
    if(view==='mechanism'){hz=3;q('[data-frequency]').value='3';time=0;draw();}
  }));
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)stop();});
  new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&playing)stop();}).observe(root);
  draw();
}
export function jumpingSecondsModelScript(lang) {
  const strings=JSON.stringify(JUMPING_SECONDS_MODEL[lang]).replaceAll('<','\\u003c');
  return `(${initialiseJumpingModel.toString()})(${jumpingSecondsState.toString()},${strings});`;
}
