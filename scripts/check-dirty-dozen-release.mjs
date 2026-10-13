import assert from 'node:assert/strict';
import { readFile, access, mkdir, writeFile } from 'node:fs/promises';
import { publicationDate, dueToday } from './post-needs-build.mjs';
import { localSite, openBrowser } from './lib/browser-qa.mjs';
import sharp from 'sharp';

const published = process.argv.includes('--published');
const out = 'output/dirty-dozen-release-qa';
await mkdir(out, { recursive: true });
const routes = ['/eredet/dirty-dozen-katonai-orak/', '/en/origins/dirty-dozen-military-watches/'];
for (const lang of ['hu', 'en']) {
  const source = await readFile(`src/content/posts/${lang}/dirty-dozen.md`, 'utf8');
  assert.equal(publicationDate(source).toISOString(), '2026-10-13T23:00:00.000Z');
  assert.equal(dueToday(source, new Date('2026-10-13T22:59:59Z')), false);
  assert.equal(dueToday(source, new Date('2026-10-13T23:00:00Z')), true);
  assert.equal(dueToday(source, new Date('2026-10-14T03:00:00Z')), true);
  assert.equal(dueToday(source, new Date('2026-10-14T23:00:00Z')), false);
  assert(!source.includes('lume-review-image'));
  assert(!source.includes('reviewCover:'));
  assert(!source.includes('\u2014'));
  assert.equal((source.match(/!\[/g) || []).length, 7);
  for (const brand of ['Buren','Cyma','Eterna','Grana','IWC','Jaeger-LeCoultre','Lemania','Longines','Omega','Record','Timor','Vertex']) assert(source.includes(brand));
}
for (const brand of ['iwc','longines','grana','cyma']) {
  const image = sharp(`src/content/posts/_images/dirty-dozen-${brand}-cutout.webp`);
  assert((await image.metadata()).hasAlpha);
  assert(!(await image.stats()).isOpaque);
}
for (const route of routes) assert.equal(await access(`dist${route}index.html`).then(() => true, () => false), published, route);
for (const file of ['index.html', 'en/index.html', 'cikkek/index.html', 'en/articles/index.html', 'rss.xml', 'en/rss.xml', 'sitemap-0.xml']) {
  const html = await readFile(`dist/${file}`, 'utf8');
  assert.equal(html.includes('dirty-dozen-'), published, file);
}
const site = await localSite();
const browser = await openBrowser(out);
const checks = [];
try {
  const pages = [...(published ? routes : []), '/', '/en/', '/naptar/', '/en/calendar/'];
  for (const route of pages) for (const width of [1440, 390, 320]) {
    await browser.navigate(site.origin + route, width);
    await browser.evaluate(`(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode()}));return true})()`);
    const page = await browser.evaluate(`(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return {overflow:document.documentElement.scrollWidth>innerWidth+1,uniqueIds:new Set(ids).size===ids.length,images:document.images.length,hero:document.querySelector('[data-home-feature]')?.getAttribute('data-home-feature')}})()`);
    assert.equal(page.overflow, false, `${route} ${width}: overflow`);
    assert.equal(page.uniqueIds, true, `${route}: duplicate IDs`);
    if (published && (route === '/' || route === '/en/')) assert.equal(page.hero, 'dirty-dozen');
    if (routes.includes(route)) {
      assert(page.images >= 8, `${route}: article imagery`);
      if (route === routes[0]) {
        const paragraph = await browser.evaluate(`(()=>{const p=[...document.querySelectorAll('p')].find(p=>p.textContent.startsWith('1944. június'));if(!p)return null;const r=document.createRange();r.selectNodeContents(p);return {inList:!!p.closest('li'),lefts:[...r.getClientRects()].filter(x=>x.width).map(x=>x.left)}})()`);
        assert(paragraph && !paragraph.inList);
        assert(paragraph.lefts.every(x=>Math.abs(x-paragraph.lefts[0])<1));
      }
    }
    if (width === 390) await browser.screenshot(`${route.replaceAll('/','_')}-${published ? 'published' : 'scheduled'}.png`);
    checks.push({route,width,...page});
  }
  assert.equal(browser.events.filter(e=>e.method==='Runtime.exceptionThrown').length,0);
  const errors = browser.events.filter(e=>e.method==='Log.entryAdded' && e.params.entry.level==='error' && /content security|refused to execute|failed to load/i.test(e.params.entry.text));
  assert.deepEqual(errors, []);
  await writeFile(`${out}/${published ? 'published' : 'scheduled'}.json`, JSON.stringify({publication:'2026-10-14T01:00:00+02:00',published,checks}, null, 2));
  console.log(JSON.stringify({published,checks:checks.length,errors:0}));
} finally { await browser.close(); site.close(); }
