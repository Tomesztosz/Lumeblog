import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';
import { createServer } from 'node:http';
import { secureHtml } from './lib/security-policy.mjs';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const out = resolve('output/article-review/ugro-masodperc');
const production = process.argv.includes('--production');
let server, origin;
if (production) {
  const root = join(out, 'future-build');
  server = createServer(async (request, response) => {
    try {
      let path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (path.endsWith('/')) path += 'index.html';
      const file = resolve(root, '.' + path);
      assert(file.startsWith(root + sep));
      let content = await readFile(file);
      const extension = extname(file);
      if (extension === '.html') content = secureHtml(content.toString('utf8'));
      response.setHeader('Content-Type', ({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'})[extension] ?? 'application/octet-stream');
      response.end(content);
    } catch { response.writeHead(404); response.end(); }
  });
  await new Promise(ok => server.listen(0, '127.0.0.1', ok));
  origin = `http://127.0.0.1:${server.address().port}`;
}
const profile = await mkdtemp(join(out, 'browser-profile-'));
const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--disable-extensions', '--disable-background-networking', '--remote-debugging-port=0',
  `--user-data-dir=${profile}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
let ws;
const pause = ms => new Promise(r => setTimeout(r, ms));
try {
  let port;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; }
    catch { await pause(100); }
  }
  assert(port, 'Chrome debugging port did not become available');
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
  await new Promise((ok, fail) => { ws.onopen = ok; ws.onerror = fail; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (!pending.has(message.id)) return;
    const { ok, fail, timer } = pending.get(message.id);
    pending.delete(message.id); clearTimeout(timer);
    if (message.error) fail(new Error(JSON.stringify(message.error))); else ok(message.result);
  };
  const send = (method, params = {}) => new Promise((ok, fail) => {
    const key = ++id;
    const timer = setTimeout(() => { pending.delete(key); fail(new Error(`Timeout: ${method}`)); }, 15000);
    pending.set(key, { ok, fail, timer }); ws.send(JSON.stringify({ id: key, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await send('Page.enable');
  const results = [];
  for (const [lang, filename] of [['hu', 'megnezes.html'], ['en', 'english.html']]) {
    for (const width of [1440, 390]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      const pageUrl = production ? `${origin}/${lang === 'hu' ? 'szerkezet' : 'en/movement'}/ugro-masodperc/` : pathToFileURL(join(out, filename)).href;
      await send('Page.navigate', { url: pageUrl });
      await pause(300);
      if (production) await evaluate(`(()=>{localStorage.clear();sessionStorage.clear();document.documentElement.dataset.theme='light';document.body.dataset.textSize='standard';return true})()`);
      await evaluate(`(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode()}));return true})()`);
      const checks = await evaluate(`(()=>{const diagram=document.querySelector('[data-jumping-seconds-diagram]');const r=diagram.getBoundingClientRect();return {lang:document.documentElement.lang,width:innerWidth,documentWidth:document.documentElement.scrollWidth,inlineLinks:document.querySelectorAll('.article-body a').length,sources:document.querySelectorAll('.reader-sources a').length,images:[...document.images].every(i=>i.complete&&i.naturalWidth>0),diagramFits:r.left>=0&&r.right<=innerWidth,svgCount:diagram.querySelectorAll('svg').length,twin:document.querySelector('${production ? `link[rel="alternate"][hreflang="${lang === 'hu' ? 'en' : 'hu'}"]` : '.review-actions a'}').getAttribute('href')}})()`);
      assert.equal(checks.lang, lang); assert(checks.documentWidth <= width);
      assert.equal(checks.inlineLinks, 0); assert.equal(checks.sources, 11);
      assert(checks.images && checks.diagramFits); assert.equal(checks.svgCount, 2);
      assert.equal(checks.twin, production ? `https://lumejournal.com/${lang === 'hu' ? 'en/movement' : 'szerkezet'}/ugro-masodperc/` : lang === 'hu' ? 'english.html' : 'megnezes.html');
      const screenshot = async name => {
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        await writeFile(join(out, production ? name.replace('qa-', 'qa-production-') : name), Buffer.from(shot.data, 'base64'));
      };
      await screenshot(`qa-${lang}-${width}-light.png`);
      const controls = await evaluate(`(()=>{document.documentElement.style.scrollBehavior='auto';document.querySelector('${production ? '[data-theme-toggle]' : '[data-review-theme]'}').click();document.querySelector('${production ? 'button[data-text-size="large"]' : '[data-review-size]'}').click();document.querySelector('[data-jumping-seconds-diagram]').scrollIntoView({behavior:'instant',block:'start'});return {theme:document.documentElement.dataset.theme,size:document.${production ? 'body' : 'documentElement'}.dataset.textSize,overflow:document.documentElement.scrollWidth>innerWidth}})()`);
      assert.deepEqual(controls, { theme: 'dark', size: 'large', overflow: false });
      await pause(100);
      assert(await evaluate(`Math.abs(document.querySelector('[data-jumping-seconds-diagram]').getBoundingClientRect().top)<2`), 'Diagram must be visible in screenshot');
      await screenshot(`qa-${lang}-${width}-dark-diagram.png`);
      const model = await evaluate(`(()=>{const m=document.querySelector('[data-jumping-model]');m.scrollIntoView({behavior:'instant',block:'start'});const q=s=>m.querySelector(s);const initial=m.dataset.playing;for(let n=0;n<6;n++)q('[data-step]').click();const six={beats:m.dataset.beats,jumps:m.dataset.jumps,time:m.dataset.time};q('[data-frequency]').value='4';q('[data-frequency]').dispatchEvent(new Event('change'));for(let n=0;n<8;n++)q('[data-step]').click();const eight={beats:m.dataset.beats,jumps:m.dataset.jumps};q('[data-view="mechanism"]').click();q('[data-scrub]').value='950';q('[data-scrub]').dispatchEvent(new Event('input'));return {initial,six,eight,starMode:q('[data-frequency]').disabled&&q('[data-scene="rhythm"]').hidden&&!q('[data-scene="mechanism"]').hidden,flirt:q('[data-part="flirt"]').getAttribute('transform'),overflow:document.documentElement.scrollWidth>innerWidth}})()`);
      assert.equal(model.initial,'false'); assert.deepEqual(model.six,{beats:'6',jumps:'1',time:'1'});
      assert.deepEqual(model.eight,{beats:'8',jumps:'1'}); assert(model.starMode&&!model.overflow);
      assert.equal(await evaluate(`document.querySelector('[data-jumping-model]').dataset.time`),'0.95','Scrubbing must retain the requested position');
      assert(!model.flirt.startsWith('rotate(0 '),'Scrubbed release must move the flirt');
      await screenshot(`qa-${lang}-${width}-dark-model.png`);
      await evaluate(`(()=>{const m=document.querySelector('[data-jumping-model]');m.querySelector('[data-view="rhythm"]').click();m.querySelector('[data-reset]').click();document.querySelector('${production ? '[data-theme-toggle]' : '[data-review-theme]'}').click();m.scrollIntoView({behavior:'instant',block:'start'});m.querySelector('[data-play]').click()})()`);
      await pause(600);
      assert(await evaluate(`Number(document.querySelector('[data-jumping-model]').dataset.time)>0`),'Play must advance visible model');
      await evaluate(`document.querySelector('[data-jumping-model] [data-play]').click()`);
      const pausedTime = await evaluate(`document.querySelector('[data-jumping-model]').dataset.time`);
      await pause(150);
      assert.equal(await evaluate(`document.querySelector('[data-jumping-model]').dataset.time`),pausedTime,'Paused model must remain still');
      await screenshot(`qa-${lang}-${width}-light-model.png`);
      await evaluate(`(()=>{const m=document.querySelector('[data-jumping-model]');m.querySelector('[data-play]').click();window.scrollTo({top:0,behavior:'instant'})})()`);
      await pause(150);
      assert.equal(await evaluate(`document.querySelector('[data-jumping-model]').dataset.playing`),'false','Offscreen model must stop');
      assert.equal(await evaluate(`document.querySelectorAll('.article-body img').length`),3);
      await evaluate(`document.querySelector('img[src*="lange-jumping-b10"]').scrollIntoView({behavior:'instant',block:'start'})`);
      await screenshot(`qa-${lang}-${width}-movement-photo.png`);
      results.push({ ...checks, controls, model, playPauseAndOffscreenStop:true });
    }
  }
  await writeFile(join(out, production ? 'browser-production-checks.json' : 'browser-checks.json'), JSON.stringify({ results, errors: 0, production, csp: production ? 'secureHtml, same policy as deployment' : 'offline review' }, null, 2) + '\n');
  console.log(JSON.stringify({ viewports: results.length, screenshots: 20, errors: 0 }));
  await send('Browser.close');
} finally {
  ws?.close();
  if (browser.exitCode === null) browser.kill();
  server?.close();
}
