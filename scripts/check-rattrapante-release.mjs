import assert from 'node:assert/strict';
import { readFile, access, mkdir, writeFile } from 'node:fs/promises';
import { publicationDate, dueToday } from './post-needs-build.mjs';
import { localSite, openBrowser } from './lib/browser-qa.mjs';

const published = process.argv.includes('--published');
const out = 'output/rattrapante-release-qa';
await mkdir(out, { recursive: true });
const routes = ['/szerkezet/rattrapante/', '/en/movement/rattrapante/', '/muhely/rattrapante/', '/en/workshop/rattrapante/'];
for (const lang of ['hu', 'en']) {
  const source = await readFile(`src/content/posts/${lang}/rattrapante.md`, 'utf8');
  assert.equal(publicationDate(source).toISOString(), '2026-10-08T23:00:00.000Z');
  assert.equal(dueToday(source, new Date('2026-10-08T22:59:59Z')), false);
  assert.equal(dueToday(source, new Date('2026-10-08T23:00:00Z')), true);
  assert.equal(dueToday(source, new Date('2026-10-09T03:00:00Z')), true);
  assert.equal(dueToday(source, new Date('2026-10-09T23:00:00Z')), false);
  assert(!source.includes('lume-review-image'));
  assert(!source.includes('reviewCover:'));
  assert(!source.includes('\u2014'));
}
for (const route of routes) {
  const exists = await access(`dist${route}index.html`).then(() => true, () => false);
  assert.equal(exists, published, `${route}: publication gate`);
}
for (const file of ['index.html', 'en/index.html', 'rss.xml', 'en/rss.xml', 'sitemap-0.xml', 'muhely/index.html', 'en/workshop/index.html']) {
  const text = await readFile(`dist/${file}`, 'utf8');
  assert.equal(/(?:\/rattrapante\/|data-home-feature="rattrapante")/.test(text), published, file);
}
const site = await localSite();
const browser = await openBrowser(out);
const checks = [];
try {
  const pages = [...(published ? [...routes, '/muhely/', '/en/workshop/'] : []), '/naptar/', '/en/calendar/'];
  for (const route of pages) for (const width of [1440, 390, 320]) {
    await browser.navigate(site.origin + route, width);
    await browser.evaluate(`(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode()}));return true})()`);
    const page = await browser.evaluate(`(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return {overflow:document.documentElement.scrollWidth>innerWidth+1,uniqueIds:new Set(ids).size===ids.length,models:document.querySelectorAll('[data-rattrapante-model]').length}})()`);
    assert.equal(page.overflow, false, `${route} ${width}: overflow`);
    assert.equal(page.uniqueIds, true, `${route}: duplicate IDs`);
    if (!route.includes('calendar') && !route.includes('naptar')) {
      assert.equal(page.models, 1, route);
      await browser.evaluate(`document.querySelector('[data-rattrapante-model]').scrollIntoView({behavior:'instant',block:'center'})`);
      const model = await browser.evaluate(`(()=>{const m=document.querySelector('[data-rattrapante-model]');const autoplay=m.dataset.running;m.querySelector('[data-action=example]').click();return {initialized:m.dataset.initialised,autoplay,values:[...m.querySelectorAll('output')].map(e=>e.textContent)}})()`);
      assert.equal(model.initialized, 'true'); assert.equal(model.autoplay, 'false');
      assert.deepEqual(model.values, route.startsWith('/en/') ? ['18.0 s','12.0 s','6.0 s'] : ['18,0 s','12,0 s','6,0 s']);
      await browser.screenshot(`${route.replaceAll('/','_')}-${width}.png`);
    }
    checks.push({route,width,...page});
  }
  assert.equal(browser.events.filter(e => e.method === 'Runtime.exceptionThrown').length, 0);
  const errors = browser.events.filter(e => e.method === 'Log.entryAdded' && e.params.entry.level === 'error' && /content security|refused to execute|failed to load/i.test(e.params.entry.text));
  assert.deepEqual(errors, []);
  await writeFile(`${out}/${published ? 'published' : 'scheduled'}.json`, JSON.stringify({publication:'2026-10-09T01:00:00+02:00',published,checks}, null, 2));
  console.log(JSON.stringify({published,publication:'2026-10-09T01:00:00+02:00',pages:pages.length,checks:checks.length,errors:0}));
} finally { await browser.close(); site.close(); }
