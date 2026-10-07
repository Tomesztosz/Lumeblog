import { RATTRAPANTE_MODEL } from '../i18n/ui.ts';
import { rattrapanteState } from './rattrapante-model.mjs';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function renderRattrapanteModel(lang) {
  const t = RATTRAPANTE_MODEL[lang];
  const ticks = Array.from({length:60}, (_,i) => `<line x1="180" y1="${i%5===0?31:36}" x2="180" y2="${i%5===0?45:42}" transform="rotate(${i*6} 180 180)" class="rs-tick"/>`).join('');
  const nums = Array.from({length:12}, (_,i) => { const a=i*Math.PI/6; return `<text x="${180+119*Math.sin(a)}" y="${185-119*Math.cos(a)}" text-anchor="middle">${i?i*5:60}</text>`; }).join('');
  return `<section class="rs-model" data-rattrapante-model aria-label="${esc(t.title)}">
  <header class="rs-heading"><span class="rs-eyebrow">LUME / ${esc(t.workshop)}</span><h3>${esc(t.title)}</h3><p>${esc(t.intro)}</p></header>
  <div class="rs-scenes">
    <div class="rs-scene"><p class="rs-scene-title">01 / ${esc(t.dial)}</p>
      <svg viewBox="0 0 360 360" aria-hidden="true" focusable="false">
        <circle cx="180" cy="180" r="163" class="rs-dial"/><circle cx="180" cy="180" r="155" class="rs-hairline"/>${ticks}${nums}
        <path data-gap class="rs-gap" d=""/>
        <text x="180" y="120" text-anchor="middle" class="rs-wordmark">LUME</text>
        <text x="180" y="254" text-anchor="middle" class="rs-micro">RATTRAPANTE</text>
        <g data-main-hand><path d="M176 207 L178 57 L182 57 L184 207Z" class="rs-main-hand"/></g>
        <g data-split-hand><path d="M180 215V55" class="rs-split-hand"/><path d="M180 50L186 60L180 70L174 60Z" class="rs-split-tip"/></g>
        <circle cx="180" cy="180" r="7" class="rs-hub"/><circle cx="180" cy="180" r="2" class="rs-pin"/>
      </svg>
      <div class="rs-key"><span class="rs-main-key">${esc(t.main)}</span><span class="rs-split-key">${esc(t.splitHand)}</span></div>
    </div>
    <div class="rs-scene"><p class="rs-scene-title">02 / ${esc(t.mechanism)}</p>
      <svg viewBox="0 0 360 360" aria-hidden="true" focusable="false">
        <circle cx="180" cy="180" r="151" class="rs-plate"/>
        <path d="M180 28V332M28 180H332" class="rs-axis"/>
        <g data-split-wheel><circle cx="180" cy="180" r="93" class="rs-wheel"/><circle cx="180" cy="180" r="82" class="rs-hairline"/>
          ${[0,60,120,180,240,300].map(a=>`<path d="M180 97V139" transform="rotate(${a} 180 180)" class="rs-spoke"/>`).join('')}
          <circle cx="180" cy="92" r="3" class="rs-pin"/>
        </g>
        <g data-heart><path d="M180 147 C202 115 245 129 243 171 C241 201 204 224 180 242 C156 224 119 201 117 171 C115 129 158 115 180 147Z" class="rs-heart"/>
          <circle cx="180" cy="180" r="14" class="rs-hub"/>
        </g>
        <g data-carrier><path d="M219 120L220 144L180 144" class="rs-follower" data-follower/>
          <circle cx="219" cy="120" r="5" class="rs-hub"/>
          <circle cx="180" cy="141" r="6" class="rs-roller" data-roller/>
          <path d="M244 117L241 109L235 117L229 109L223 117" class="rs-spring"/>
        </g>
        <g data-clamp-left><path d="M102 78Q47 161 85 222" class="rs-clamp"/><circle cx="102" cy="78" r="7" class="rs-hub"/></g>
        <g data-clamp-right><path d="M258 78Q313 161 275 222" class="rs-clamp"/><circle cx="258" cy="78" r="7" class="rs-hub"/></g>
        <text x="180" y="318" text-anchor="middle" class="rs-micro">${esc(t.schematic)}</text>
      </svg>
      <div class="rs-key"><span>${esc(t.cam)}</span><span>${esc(t.clamp)}</span></div>
    </div>
  </div>
  <div class="rs-readouts"><div><span>${esc(t.total)}</span><output data-total>0.0 s</output></div><div><span>${esc(t.retained)}</span><output data-held>0.0 s</output></div><div><span>${esc(t.gap)}</span><output data-difference>0.0 s</output></div></div>
  <div class="rs-controls"><button type="button" data-action="toggle" aria-pressed="false">${esc(t.start)}</button><button type="button" data-action="split" aria-pressed="false" disabled>${esc(t.freeze)}</button><button type="button" data-action="reset">${esc(t.reset)}</button><button type="button" data-action="step">${esc(t.step)}</button><label>${esc(t.speed)} <select data-speed><option value="0.25">0.25×</option><option value="1" selected>1×</option><option value="4">4×</option></select></label></div>
  <div class="rs-status"><span class="rs-indicator" aria-hidden="true"></span><p role="status" data-status>${esc(t.ready)}</p></div>
  <div class="rs-example"><button type="button" data-action="example">${esc(t.example)}</button><p>${esc(t.exampleNote)}</p></div>
  <details class="rs-explanation"><summary>${esc(t.how)}</summary><ol><li>${esc(t.explainFollow)}</li><li>${esc(t.explainHold)}</li><li>${esc(t.explainCatch)}</li></ol></details>
  <p class="rs-limits">${esc(t.limits)}</p><noscript><p>${esc(t.noScript)}</p></noscript>
  </section>`;
}

export const rattrapanteModelCSS = `
.rs-model{margin:32px 0;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-family:var(--font-sans);container-type:inline-size;overflow:hidden}
.rs-model *{box-sizing:border-box}.rs-model .rs-heading{padding:26px 24px 18px}.rs-eyebrow,.rs-scene-title{font:10px/1.5 var(--font-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.rs-model h3{font:400 clamp(26px,5cqi,38px)/1.1 var(--font-serif);margin:12px 0}.rs-model p{font:14px/1.65 var(--font-sans);margin:0}.rs-model .rs-eyebrow{font:10px var(--font-mono)}
.rs-scenes{display:grid;grid-template-columns:1fr 1fr;border-block:1px solid var(--line)}.rs-scene{min-width:0;padding:16px 14px}.rs-scene+.rs-scene{border-left:1px solid var(--line)}.rs-model .rs-scene-title{font:10px/1.5 var(--font-mono)}
.rs-scene svg{display:block;width:100%;height:auto;max-width:400px;margin:auto;stroke:none;fill:none}.rs-scene svg text{fill:var(--muted);font:13px var(--font-mono)}.rs-scene svg .rs-wordmark{fill:var(--ink);font:19px var(--font-serif);letter-spacing:3px}.rs-scene svg .rs-micro{font:8px var(--font-mono);letter-spacing:2px}
.rs-dial{fill:var(--dial-face);stroke:var(--line)}.rs-hairline{fill:none;stroke:var(--line);stroke-width:1}.rs-tick{stroke:var(--muted);stroke-width:1}.rs-main-hand,.rs-hub{fill:var(--ink)}.rs-pin{fill:var(--paper)}.rs-split-hand{fill:none;stroke:var(--brass);stroke-width:2}.rs-split-tip{fill:var(--dial-face);stroke:var(--brass);stroke-width:2}.rs-gap{fill:none;stroke:var(--brass);stroke-width:4;opacity:.4}
.rs-plate{fill:var(--paper);stroke:var(--line)}.rs-axis{stroke:var(--line);stroke-dasharray:3 6}.rs-wheel{fill:none;stroke:var(--brass);stroke-width:6;stroke-dasharray:2 2}.rs-spoke{stroke:var(--brass);stroke-width:5}.rs-heart{fill:var(--surface);stroke:var(--ink);stroke-width:2}.rs-follower{fill:none;stroke:var(--brass);stroke-width:5;stroke-linejoin:round}.rs-roller{fill:var(--brass);stroke:var(--paper);stroke-width:1}.rs-spring{fill:none;stroke:var(--muted);stroke-width:2}.rs-clamp{fill:none;stroke:var(--muted);stroke-width:9;stroke-linecap:round}.rs-model[data-held="true"] .rs-clamp{stroke:var(--brass)}
.rs-key{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 14px;font:10px/1.6 var(--font-mono);color:var(--muted)}.rs-main-key:before,.rs-split-key:before{content:'';display:inline-block;vertical-align:middle;width:17px;margin-right:6px;border-top:3px solid var(--ink)}.rs-split-key:before{border-color:var(--brass);border-top-style:dashed}
.rs-readouts{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid var(--line)}.rs-readouts>div{padding:14px 16px;min-width:0}.rs-readouts>div+div{border-left:1px solid var(--line)}.rs-readouts span{display:block;font:10px/1.5 var(--font-mono);color:var(--muted)}.rs-readouts output{display:block;font:400 clamp(19px,4cqi,29px)/1.5 var(--font-mono);white-space:nowrap}
.rs-controls{display:flex;flex-wrap:wrap;gap:8px;padding:18px 20px}.rs-model button,.rs-model select{font:12px/1.4 var(--font-sans);background:var(--paper);border:1px solid var(--line);color:var(--ink);padding:11px 13px;min-height:44px;cursor:pointer;border-radius:0}.rs-model button:first-child{background:var(--ink);color:var(--paper)}.rs-model button:disabled{opacity:.45;cursor:default}.rs-model button:focus-visible,.rs-model select:focus-visible,.rs-model summary:focus-visible{outline:2px solid var(--brass);outline-offset:3px}.rs-model button[aria-pressed=true]{border-color:var(--brass)}.rs-controls label{display:flex;align-items:center;gap:8px;font-size:12px;margin-left:auto}
.rs-status{display:flex;gap:10px;align-items:baseline;padding:0 20px 18px;min-height:75px}.rs-indicator{width:6px;height:6px;flex:0 0 6px;background:var(--muted);border-radius:50%}.rs-model[data-running=true] .rs-indicator{background:var(--brass)}.rs-model .rs-status p{font-size:13px}.rs-example{padding:18px 20px;border-top:1px solid var(--line)}.rs-model .rs-example p{font-size:12px;color:var(--muted);margin-top:10px}.rs-explanation{padding:14px 20px;border-top:1px solid var(--line);font-size:13px}.rs-explanation summary{cursor:pointer}.rs-explanation ol{padding-left:20px;line-height:1.7}.rs-explanation li+li{margin-top:8px}.rs-model .rs-limits{padding:12px 20px 20px;color:var(--muted);font-size:11px}.rs-model noscript p{padding:20px}
@container(max-width:490px){.rs-scenes{grid-template-columns:1fr}.rs-scene+.rs-scene{border-left:0;border-top:1px solid var(--line)}.rs-scene svg{max-width:310px}.rs-controls label{margin-left:0}.rs-readouts>div{padding:12px 9px}.rs-readouts span{font-size:9px}.rs-model .rs-heading{padding:20px}}
`;

function initialiseRattrapante(reduce, t) {
  document.querySelectorAll('[data-rattrapante-model]').forEach(root => {
    if (root.dataset.initialised) return;
    root.dataset.initialised = 'true';
    const q = s => root.querySelector(s);
    let state = reduce(), frame = 0, last = 0;
    const format = v => v.toFixed(1).replace('.', t.decimal) + ' s';
    const rot = (selector, angle) => q(selector).setAttribute('transform', `rotate(${angle} 180 180)`);
    function draw(announce = false) {
      const held = state.held !== null, split = held ? state.held : state.elapsed;
      root.dataset.running = String(state.running); root.dataset.held = String(held);
      root.dataset.elapsed = state.elapsed.toFixed(3);
      q('[data-speed]').value = String(state.speed);
      rot('[data-main-hand]', state.elapsed * 6); rot('[data-split-hand]', split * 6);
      rot('[data-heart]', state.elapsed * 6); rot('[data-split-wheel]', split * 6); rot('[data-carrier]', split * 6);
      // The follower is withdrawn when the split wheel is clamped. Geometry
      // is an explanatory displacement, not the Lange disengagement train.
      q('[data-follower]').setAttribute('d', held ? 'M219 120L216 114L180 111' : 'M219 120L220 144L180 144');
      q('[data-roller]').setAttribute('cy', held ? '108' : '141');
      q('[data-clamp-left]').setAttribute('transform', `rotate(${held ? -8 : 0} 102 78)`);
      q('[data-clamp-right]').setAttribute('transform', `rotate(${held ? 8 : 0} 258 78)`);
      const a=split*Math.PI/30, b=state.elapsed*Math.PI/30, delta=state.elapsed-split, r=99;
      q('[data-gap]').setAttribute('d', delta>0 && delta<60 ? `M${180+r*Math.sin(a)} ${180-r*Math.cos(a)} A${r} ${r} 0 ${delta>30?1:0} 1 ${180+r*Math.sin(b)} ${180-r*Math.cos(b)}` : '');
      q('[data-total]').textContent = format(state.elapsed);
      q('[data-held]').textContent = format(split);
      q('[data-difference]').textContent = format(delta);
      q('[data-action=toggle]').textContent = state.running ? t.stop : state.elapsed ? t.resume : t.start;
      q('[data-action=toggle]').disabled = state.elapsed >= 60;
      q('[data-action=toggle]').setAttribute('aria-pressed', String(state.running));
      q('[data-action=split]').disabled = state.elapsed <= 0;
      q('[data-action=split]').textContent = held ? t.catch : t.freeze;
      q('[data-action=split]').setAttribute('aria-pressed', String(held));
      q('[data-action=step]').disabled = state.running || state.elapsed >= 60;
      if (announce) q('[data-status]').textContent = state.elapsed>=60 ? t.end : held ? (state.running ? t.holding : t.stoppedHeld) : state.running ? t.following : state.elapsed ? t.stopped : t.ready;
    }
    function account(now) {
      if (state.running && last) state = reduce(state, {type:'tick',seconds:Math.max(0,(now-last)/1000)});
      last = now;
    }
    function tick(now) {
      const wasRunning = state.running; account(now); draw(wasRunning && !state.running);
      frame = state.running ? requestAnimationFrame(tick) : 0;
    }
    function act(action) {
      account(performance.now()); state = reduce(state, action);
      cancelAnimationFrame(frame); frame=0; last=performance.now(); draw(true);
      if (state.running) frame=requestAnimationFrame(tick);
    }
    root.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>act({type:button.dataset.action})));
    q('[data-speed]').addEventListener('change',event=>act({type:'speed',value:Number(event.target.value)}));
    document.addEventListener('visibilitychange',()=>{if(document.hidden && state.running) act({type:'pause'});});
    window.addEventListener('pagehide',()=>{if(state.running)act({type:'pause'});});
    if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{if(!entries[0].isIntersecting && state.running)act({type:'pause'});}).observe(root);
    draw(true);
  });
}
export function rattrapanteModelScript(lang) {
  const strings=JSON.stringify(RATTRAPANTE_MODEL[lang]).replaceAll('<','\\u003c');
  return `(${initialiseRattrapante.toString()})(${rattrapanteState.toString()},${strings});`;
}
