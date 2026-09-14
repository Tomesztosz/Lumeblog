import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { openBrowser, localSite, pause } from './lib/browser-qa.mjs';
import { MODEL_NAMES } from '../src/lib/design-models.mjs';

// Fresh local Chrome profile, no user browser state, no real shares or clipboard writes.
const output = 'output/site-improvements-2026-09-14';
const server = await localSite();
const browser = await openBrowser(output);
const results = [];
const click = selector => browser.evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const noOverflow = async label => {
  const size = await browser.evaluate('({content:document.documentElement.scrollWidth, viewport:innerWidth})');
  assert(size.content <= size.viewport + 1, `${label}: overflow ${JSON.stringify(size)}`);
};
try {
  await browser.send('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.__shareMode = 'success'; window.__copyMode = 'success';
    Object.defineProperty(navigator, 'share', {configurable:true,value:async data => {
      if(window.__shareMode === 'cancel') throw new DOMException('Cancelled', 'AbortError');
      if(window.__shareMode === 'fail') throw new DOMException('Unavailable', 'NotAllowedError');
      window.__shared = data;
    }});
    Object.defineProperty(navigator, 'clipboard', {configurable:true,value:{writeText:async text => {
      if(window.__copyMode === 'fail') throw new DOMException('Unavailable', 'NotAllowedError');
      window.__copied = text;
    }}});
  ` });
  for (const lang of ['hu', 'en']) {
    for (const width of [1440, 390]) {
      await browser.navigate(server.origin + (lang === 'hu' ? '/' : '/en/'), width);
      await browser.evaluate('document.fonts.ready');
      await noOverflow(`home/${lang}/${width}`);
      assert.equal(await browser.evaluate('document.querySelector("[data-home-feature]").dataset.homeFeature'), 'seagull-1963');
      assert.equal(await browser.evaluate('document.querySelector("[data-home-feature] img").naturalWidth > 0'), true);
      await browser.screenshot(`home-${lang}-${width}.png`);
      results.push(`home ${lang} ${width}px: chronological lead, loaded image, no overflow`);
    }
    for (const key of MODEL_NAMES) {
      const path = lang === 'hu' ? `/muhely/${key}/` : `/en/workshop/${key}/`;
      console.log(`Checking ${path}`);
      await browser.navigate(server.origin + path, 390);
      assert.equal(await browser.evaluate('document.querySelector("[data-workshop-demo]").dataset.workshopBound'), 'true', `${path}: missing model event handlers`);
      assert.equal(await browser.evaluate('document.querySelectorAll("iframe").length'), 0);
      await noOverflow(path);
      await click('[data-model-copy]');
      assert.equal(await browser.evaluate('window.__copied'), 'https://lumejournal.com' + path);
      await click('[data-model-native-share]');
      assert.equal((await browser.evaluate('window.__shared')).url, 'https://lumejournal.com' + path);
      await click('[data-workshop-open]');
      await pause(650);
      const state = await browser.evaluate(`(() => { const f = document.querySelector('iframe'); const d = f.contentDocument; return { src:f.getAttribute('src'), body:d?.body?.dataset.designModel, ready:d?.readyState, drawing:!!d?.querySelector('svg, canvas, #stage, #machine'), frameHeight:f.clientHeight, pageWidth:d?.documentElement.scrollWidth, width:f.clientWidth }; })()`);
      assert.equal(new URL(state.src).pathname, `/widgets/${key}.html`);
      assert.equal(new URL(state.src).searchParams.get('lang'), lang === 'en' ? 'en' : null);
      assert.equal(state.body, key);
      assert.equal(state.ready, 'complete');
      assert(state.drawing, `${path}: missing model`);
      assert(state.pageWidth <= state.width + 1, `${path}: frame overflow ${JSON.stringify(state)}`);
      await noOverflow(path);
      if (key === 'rotor') {
        const before = await browser.evaluate('document.querySelector("iframe").contentDocument.querySelector("#rotor").style.transform');
        await browser.evaluate('document.querySelector("iframe").contentDocument.querySelector("#rightBtn").click()');
        await pause(200);
        assert.notEqual(await browser.evaluate('document.querySelector("iframe").contentDocument.querySelector("#rotor").style.transform'), before);
        await browser.evaluate('document.querySelector("[data-workshop-live]").scrollIntoView()');
        await browser.screenshot(`rotor-${lang}-390-open.png`);
      }
      await click('[data-workshop-close]');
      assert.equal(await browser.evaluate('document.querySelectorAll("iframe").length'), 0);
      results.push(`${path}: mobile, lazy load, bilingual model, share/copy stubs, close`);
    }
  }
  for (const width of [1440, 390]) {
    await browser.navigate(server.origin + '/muhely/rotor/', width);
    await browser.screenshot(`rotor-hu-${width}-landing.png`);
    await browser.evaluate("window.__copyMode = 'fail'");
    await click('[data-model-copy]');
    assert.equal(await browser.evaluate('document.querySelector("[data-model-share-fallback]").hidden'), false);
    assert.equal(await browser.evaluate('document.activeElement.value'), 'https://lumejournal.com/muhely/rotor/');
    await noOverflow('clipboard fallback');
    await browser.evaluate("window.__copyMode = 'success'");
    await click('[data-model-copy]');
    assert.equal(await browser.evaluate('document.querySelector("[data-model-share-fallback]").hidden'), true);
    await browser.evaluate("window.__shareMode = 'cancel'");
    await click('[data-model-native-share]');
    assert.equal(await browser.evaluate('document.querySelector("[data-model-share-status]").textContent === document.querySelector("[data-model-share]").dataset.cancelled'), true);
    await browser.evaluate("window.__shareMode = 'fail'");
    await click('[data-model-native-share]');
    assert.equal(await browser.evaluate('document.querySelector("[data-model-share-fallback]").hidden'), false);
    await click('[data-theme-toggle]');
    await browser.screenshot(`rotor-hu-${width}-dark.png`);
    await click('[data-workshop-open]');
    await pause(500);
    assert.equal(await browser.evaluate('document.querySelector("iframe").contentDocument.body.classList.contains("dark")'), true);
    await browser.evaluate('document.querySelector("[data-workshop-live]").scrollIntoView()');
    await browser.screenshot(`rotor-hu-${width}-dark-open.png`);
    await noOverflow('dark open model');
    // Return to light for the next case.
    await click('[data-theme-toggle]');
    results.push(`${width}px: clipboard-denied manual selection, copy recovery, share cancellation/failure, dark frame`);
  }
  // Browser without native share: only the clipboard control is offered.
  await browser.send('Page.addScriptToEvaluateOnNewDocument', { source: "Object.defineProperty(navigator, 'share', {configurable:true,value:undefined});" });
  await browser.navigate(server.origin + '/en/workshop/rotor/');
  assert.equal(await browser.evaluate('document.querySelector("[data-model-native-share]").hidden'), true);
  assert.equal(await browser.evaluate('document.querySelector("[data-model-copy]").hidden'), false);
  const exceptions = browser.events.filter(e => e.method === 'Runtime.exceptionThrown');
  assert.equal(exceptions.length, 0, JSON.stringify(exceptions));
  results.push('Unsupported native share: clipboard alternative visible; no runtime exceptions');
  await writeFile(output + '/qa.json', JSON.stringify({ results, errors: 0, simulatedNativeShare: true, simulatedClipboard: true }, null, 2));
  console.log(JSON.stringify({ checks: results.length, errors: 0, output }));
} finally { await browser.close(); server.close(); }
