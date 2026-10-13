import { COAXIAL_MODEL } from '../i18n/ui.ts';
import { coaxialFrame, coaxialState } from './coaxial-model.mjs';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function renderCoaxialModel(lang) {
  const t = COAXIAL_MODEL[lang];
  const teeth = (r, small = false) => Array.from({length:9},(_,i)=>`<path d="M${270-r} 282 Q${270-r-5} 260 ${270-r-3} 245 L${270-r-15} 244 L${270-r+8} 267 Z" transform="rotate(${i*40} 270 282)" class="${small?'cx-small':'cx-wheel'}"/>`).join('');
  const spring = Array.from({length:160},(_,i)=>{const a=i/159*Math.PI*8,r=5+i*.21;return `${i?'L':'M'}${135+Math.cos(a)*r} ${130+Math.sin(a)*r}`;}).join(' ');
  return `<section class="cx-model" data-coaxial-model data-part="0" aria-label="${esc(t.title)}">
    <header class="cx-heading"><span class="cx-kicker">LUME / ${esc(t.workshop)}</span><h3>${esc(t.title)}</h3><p>${esc(t.intro)}</p></header>
    <div class="cx-stage">
      <div class="cx-drawing"><svg viewBox="0 0 460 455" aria-hidden="true" focusable="false">
        <path d="M135 35V235M40 130H440M140 282H420M270 90V420" class="cx-axis"/>
        <g data-component="wheels"><g data-cx-wheel>
          <circle cx="270" cy="282" r="109" class="cx-wheel"/><circle cx="270" cy="282" r="86" class="cx-hole"/>
          ${teeth(110)}${[0,120,240].map(a=>`<path d="M270 282V180" transform="rotate(${a} 270 282)" class="cx-spoke"/>`).join('')}
          <circle cx="270" cy="282" r="72" class="cx-small"/><circle cx="270" cy="282" r="57" class="cx-hole"/>${teeth(70,true)}
          ${[60,180,300].map(a=>`<path d="M270 282V215" transform="rotate(${a} 270 282)" class="cx-small-spoke"/>`).join('')}
        </g><circle cx="270" cy="282" r="12" class="cx-hub"/><circle cx="270" cy="282" r="4" class="cx-dot"/></g>
        <g data-component="balance"><circle cx="135" cy="130" r="86" class="cx-rim"/><g data-cx-balance>
          <circle cx="135" cy="130" r="74" class="cx-hairline"/><path d="M59 130H211M135 54V206" class="cx-balance-spoke"/>
          <circle cx="135" cy="130" r="47" class="cx-roller"/>
          <path d="M170 179L188 191L180 201L162 186Z" class="cx-jewel" data-jewel="D"/>
          <rect x="203" y="123" width="10" height="14" rx="3" class="cx-jewel" data-jewel="E"/>
        </g><path d="${spring}" class="cx-spring"/><circle cx="135" cy="130" r="8" class="cx-hub"/></g>
        <g data-component="lever" data-cx-lever>
          <path d="M210 112Q220 108 228 119L266 115L278 120L349 115L355 135L286 145L281 166L262 165L255 143L226 141Q215 151 207 143L218 136L226 132L217 124Z" class="cx-lever"/>
          <path d="M224 142L233 153L239 141Z" class="cx-jewel" data-jewel="A"/>
          <path d="M334 132L345 141L341 151Z" class="cx-jewel" data-jewel="B"/>
          <path d="M263 161L277 161L277 211L266 204Z" class="cx-jewel" data-jewel="C"/>
          <circle cx="270" cy="130" r="9" class="cx-hub"/>
        </g>
        <g class="cx-energy" data-energy="indirect" hidden><path d="M271 233L272 187L270 151L229 132L196 132"/><path d="M202 125L192 132L202 139"/></g>
        <g class="cx-energy" data-energy="direct" hidden><path d="M223 225L187 196L166 174"/><path d="M168 186L163 172L177 175"/></g>
        <g class="cx-labels"><text x="337" y="395">1</text><text x="298" y="339">2</text><text x="370" y="130">3</text><text x="56" y="45">4</text>
          <text x="226" y="174">A</text><text x="352" y="166">B</text><text x="290" y="187">C</text><text x="177" y="229">D</text><text x="219" y="101">E</text>
        </g>
        <text x="230" y="441" text-anchor="middle" class="cx-svg-note">${esc(t.schematic)}</text>
      </svg><div class="cx-wheel-status"><span>${esc(t.wheelLabel)}</span><output data-cx-lock>${esc(t.locked)}</output><span class="cx-counter" data-cx-count>01 / 08</span></div></div>
      <div class="cx-narrative"><span class="cx-kicker">${esc(t.phaseLabel)}</span><h4 data-cx-title>${esc(t.states[0])}</h4><p data-cx-description>${esc(t.descriptions[0])}</p><div class="cx-path"><span class="cx-kicker">${esc(t.pathLabel)}</span><p data-cx-path>${esc(t.paths.none)}</p></div></div>
    </div>
    <div class="cx-controls"><button type="button" data-cx-action="toggle" aria-pressed="false">${esc(t.play)}</button><button type="button" data-cx-action="step">${esc(t.step)}</button><button type="button" data-cx-action="reset">${esc(t.reset)}</button><label>${esc(t.speed)} <select data-cx-speed><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div>
    <div class="cx-phases" role="group" aria-label="${esc(t.phaseLabel)}">${t.states.map((s,i)=>`<button type="button" data-cx-phase="${i}" aria-pressed="${i===0}" aria-label="${i+1}. ${esc(s)}">${String(i+1).padStart(2,'0')}</button>`).join('')}</div>
    <div class="cx-inspector"><label>${esc(t.partsLabel)} <select data-cx-part>${t.parts.map((s,i)=>`<option value="${i}">${esc(s)}</option>`).join('')}</select></label><p data-cx-part-note>${esc(t.partNotes[0])}</p></div>
    <details class="cx-explain"><summary>${esc(t.compareTitle)}</summary><p>${esc(t.compare)}</p></details>
    <p class="cx-limits">${esc(t.limits)}</p><p class="cx-sr" role="status" data-cx-status>${esc(t.states[0])}</p><noscript><p>${esc(t.noScript)}</p></noscript>
  </section>`;
}

export const coaxialModelCSS = `
.cx-model{color:var(--ink);background:var(--surface);border:1px solid var(--line);margin:36px 0;container-type:inline-size;overflow:hidden;font-family:var(--font-sans)}
.cx-model *{box-sizing:border-box}.cx-model .cx-heading{padding:28px}.cx-model h3{font:400 clamp(29px,6cqi,43px)/1.1 var(--font-serif);margin:12px 0}.cx-model p{font:14px/1.7 var(--font-sans);margin:0;text-indent:0!important}.cx-model .cx-kicker{font:10px/1.6 var(--font-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.cx-model svg text{stroke:none;fill:var(--muted);font-weight:400}.cx-letter{font:12px var(--font-mono)}
.cx-stage{display:grid;grid-template-columns:1.3fr 1fr;border-block:1px solid var(--line)}.cx-drawing{background:var(--paper);min-width:0}.cx-drawing svg{display:block;width:100%;height:auto}.cx-axis{stroke:var(--line);stroke-dasharray:3 7;fill:none}.cx-wheel{fill:var(--brass);stroke:var(--ink);stroke-width:1}.cx-hole{fill:var(--paper);stroke:var(--ink);stroke-width:.8}.cx-small{fill:var(--surface);stroke:var(--ink);stroke-width:2}.cx-spoke{stroke:var(--brass);stroke-width:15}.cx-small-spoke{stroke:var(--muted);stroke-width:7}.cx-hub{fill:var(--surface);stroke:var(--ink);stroke-width:2}.cx-dot{fill:var(--ink)}.cx-rim{stroke:var(--brass);fill:none;stroke-width:8}.cx-hairline{stroke:var(--muted);fill:none;stroke-width:1}.cx-balance-spoke{stroke:var(--brass);stroke-width:4}.cx-roller{fill:var(--paper);stroke:var(--muted);stroke-width:1.5}.cx-spring{fill:none;stroke:var(--muted);stroke-width:1}.cx-lever{fill:var(--surface);stroke:var(--ink);stroke-width:2}.cx-jewel{fill:var(--brass);stroke:var(--ink);stroke-width:1.5}.cx-jewel[data-active=true]{fill:var(--accent);stroke:var(--ink);stroke-width:3}.cx-energy{fill:none;stroke:var(--accent-ink);stroke-width:4;filter:drop-shadow(0 0 3px var(--accent))}.cx-energy[hidden]{display:none}.cx-labels{fill:var(--muted);font:13px var(--font-mono)}.cx-svg-note{fill:var(--muted);font:10px var(--font-mono)}
.cx-narrative{padding:24px;border-left:1px solid var(--line);min-width:0}.cx-model h4{font:400 26px/1.2 var(--font-serif);margin:14px 0}.cx-path{margin-top:24px;padding-top:16px;border-top:1px solid var(--line)}.cx-path p{font:12px/1.8 var(--font-mono);margin-top:8px;overflow-wrap:anywhere}.cx-wheel-status{display:flex;gap:10px;padding:12px 18px;border-top:1px solid var(--line);font:11px var(--font-mono);flex-wrap:wrap}.cx-counter{margin-left:auto}.cx-wheel-status output{color:var(--brass)}
.cx-controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:20px 24px 12px}.cx-model button,.cx-model select{font:12px var(--font-mono);color:var(--ink);background:var(--paper);border:1px solid var(--line);padding:11px 13px;min-height:44px;border-radius:0;cursor:pointer;max-width:100%}.cx-model button:focus-visible,.cx-model select:focus-visible,.cx-model summary:focus-visible{outline:3px solid var(--brass);outline-offset:3px}.cx-model button[aria-pressed=true]{background:var(--accent);color:var(--accent-ink);border-color:var(--brass)}.cx-controls label{font:11px var(--font-mono);display:flex;align-items:center;gap:8px;flex-wrap:wrap}.cx-phases{display:grid;grid-template-columns:repeat(8,1fr);gap:4px;padding:0 24px 20px}.cx-phases button{padding:6px;min-width:0}.cx-inspector{border-block:1px solid var(--line);padding:20px 24px}.cx-inspector label{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font:11px var(--font-mono)}.cx-inspector p{margin-top:14px}.cx-explain{padding:20px 24px}.cx-explain summary{font:14px var(--font-sans);cursor:pointer}.cx-explain p{margin-top:12px}.cx-model .cx-limits{font:11px/1.7 var(--font-mono);color:var(--muted);padding:0 24px 24px}.cx-model[data-part="1"] [data-component=balance],.cx-model[data-part="1"] [data-component=lever],.cx-model[data-part="2"] [data-component=balance],.cx-model[data-part="2"] [data-component=wheels],.cx-model[data-part="3"] [data-component=lever],.cx-model[data-part="3"] [data-component=wheels]{opacity:.18}.cx-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
@container(max-width:580px){.cx-stage{grid-template-columns:1fr}.cx-drawing{padding:0 10px}.cx-drawing svg{max-width:440px;margin:auto}.cx-narrative{border-left:0;border-top:1px solid var(--line);padding:20px}.cx-model .cx-heading{padding:22px 20px}.cx-controls{padding:18px 16px 12px}.cx-phases{padding:0 16px 18px;grid-template-columns:repeat(4,1fr)}.cx-inspector,.cx-explain{padding:18px 20px}.cx-model .cx-limits{padding:0 20px 22px}}
@media(prefers-reduced-motion:reduce){.cx-model *{scroll-behavior:auto}}
`;

function initialiseCoaxial(reduce, frameAt, t) {
  document.querySelectorAll('[data-coaxial-model]').forEach(root=>{
    if(root.dataset.ready)return; root.dataset.ready='true';
    const q=s=>root.querySelector(s); let state=reduce(), raf=0, last=0, previous=-1;
    function draw(announce=false) {
      const f=frameAt(state.time); root.dataset.phase=String(f.phase);root.dataset.running=String(state.running);
      q('[data-cx-wheel]').setAttribute('transform',`rotate(${f.wheel} 270 282)`);
      q('[data-cx-balance]').setAttribute('transform',`rotate(${f.balance} 135 130)`);
      q('[data-cx-lever]').setAttribute('transform',`rotate(${f.lever} 270 130)`);
      q('[data-cx-action=toggle]').textContent=state.running?t.pause:t.play;
      q('[data-cx-action=toggle]').setAttribute('aria-pressed',String(state.running));
      q('[data-cx-lock]').textContent=f.locked?t.locked:t.released;
      if(f.phase!==previous){
        q('[data-cx-title]').textContent=t.states[f.phase];q('[data-cx-description]').textContent=t.descriptions[f.phase];
        q('[data-cx-path]').textContent=t.paths[f.impulse];q('[data-cx-count]').textContent=`${String(f.phase+1).padStart(2,'0')} / 08`;
        root.querySelectorAll('[data-cx-phase]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.cxPhase)===f.phase)));
        root.querySelectorAll('[data-energy]').forEach(e=>{e.toggleAttribute('hidden',e.dataset.energy!==f.impulse);});
        root.querySelectorAll('[data-jewel]').forEach(e=>e.dataset.active=String(e.dataset.jewel===(f.impulse==='direct'?'D':f.impulse==='indirect'?'C':f.lock==='entry'?'B':f.lock==='exit'?'A':'')));
        previous=f.phase;
      }
      if(announce)q('[data-cx-status]').textContent=t.states[f.phase]+'. '+t.descriptions[f.phase];
    }
    function tick(now){if(last)state=reduce(state,{type:'tick',seconds:(now-last)/1000});last=now;draw();raf=state.running?requestAnimationFrame(tick):0;}
    function act(a){state=reduce(state,a);cancelAnimationFrame(raf);raf=0;last=0;draw(true);if(state.running)raf=requestAnimationFrame(tick);}
    root.querySelectorAll('[data-cx-action]').forEach(b=>b.addEventListener('click',()=>act({type:b.dataset.cxAction})));
    root.querySelectorAll('[data-cx-phase]').forEach(b=>b.addEventListener('click',()=>act({type:'phase',value:Number(b.dataset.cxPhase)})));
    q('[data-cx-speed]').addEventListener('change',e=>act({type:'speed',value:Number(e.target.value)}));
    q('[data-cx-part]').addEventListener('change',e=>{root.dataset.part=e.target.value;q('[data-cx-part-note]').textContent=t.partNotes[Number(e.target.value)];act({type:'pause'});});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)act({type:'pause'});});
    window.addEventListener('pagehide',()=>act({type:'pause'}));
    if('IntersectionObserver' in window)new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&state.running)act({type:'pause'});}).observe(root);
    const motion=matchMedia('(prefers-reduced-motion: reduce)');motion.addEventListener('change',()=>{if(motion.matches)act({type:'pause'});});
    draw();
  });
}
export function coaxialModelScript(lang){return `(${initialiseCoaxial.toString()})(${coaxialState.toString()},${coaxialFrame.toString()},${JSON.stringify(COAXIAL_MODEL[lang]).replaceAll('<','\\u003c')});`;}
