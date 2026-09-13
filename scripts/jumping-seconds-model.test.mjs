import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jumpingSecondsState as state } from '../src/lib/jumping-seconds-model.mjs';
import { renderJumpingSecondsModel, jumpingSecondsModelScript } from './lib/jumping-seconds-review-model.mjs';

test('3 Hz advances six ordinary steps but only one whole-second jump',()=>{
  for(let beat=0;beat<=30;beat++){
    const s=state(beat/6);
    assert.equal(s.beats,beat);assert.equal(s.jumps,Math.floor(beat/6));
    assert.equal(s.ordinary,beat);assert.equal(s.jumping,Math.floor(beat/6)*6);
  }
});
test('4 Hz has eight half-oscillations, not four, in a second',()=>{
  for(let beat=0;beat<=40;beat++){
    const s=state(beat/8,4);assert.equal(s.beats,beat);assert.equal(s.ordinary,beat*.75);assert.equal(s.jumps,Math.floor(beat/8));
  }
});
test('Whole-second boundary, five-second star period and deliberately stretched release',()=>{
  assert.equal(state(.999).jumping,0);assert.equal(state(1).jumping,6);
  assert.equal(state(5).star,360);assert.equal(state(5).flirt,1800);
  assert.equal(state(.5).flirt,0);assert(state(.95).flirt>0&&state(.95).flirt<360);
  assert.equal(state(-1).time,0);assert.equal(state(10).time,5);assert.equal(state(NaN).time,0);
});
test('Both languages provide an inline, link-free model with no external code',()=>{
  for(const lang of ['hu','en']){
    const html=renderJumpingSecondsModel(lang),script=jumpingSecondsModelScript(lang);
    assert(!/<a\s|<iframe|<script|https?:/.test(html));
    assert(html.includes('data-play')&&html.includes('data-frequency')&&html.includes('data-scrub'));
    assert(!html.includes(String.fromCharCode(8212)));
    assert(script.includes('visibilitychange')&&script.includes('IntersectionObserver'));
  }
  assert.throws(()=>renderJumpingSecondsModel('invalid'));
});
