import assert from 'node:assert/strict';
import { readFile, access, mkdir, writeFile } from 'node:fs/promises';
import { publicationDate, dueToday } from './post-needs-build.mjs';
import { localSite, openBrowser, pause } from './lib/browser-qa.mjs';
import sharp from 'sharp';
const published = process.argv.includes('--published');
const out = 'output/coaxial-release-qa';
await mkdir(out, {recursive:true});
const articles = ['/szerkezet/co-axial/', '/en/movement/co-axial/'];
const models = ['/muhely/co-axial/', '/en/workshop/co-axial/'];
for (const lang of ['hu','en']) {
  const source = await readFile(`src/content/posts/${lang}/co-axial.md`, 'utf8');
  assert.equal(publicationDate(source).toISOString(), '2026-10-15T23:00:00.000Z');
  assert.equal(dueToday(source, new Date('2026-10-15T22:59:59Z')), false);
  assert.equal(dueToday(source, new Date('2026-10-15T23:00:00Z')), true);
  assert.equal(dueToday(source, new Date('2026-10-16T03:00:00Z')), true);
  assert.equal(dueToday(source, new Date('2026-10-16T23:00:00Z')), false);
  assert(!source.includes('reviewCover:') && !source.includes('lume-review-image') && !source.includes('\u2014'));
  assert.equal((source.match(/!\[/g)||[]).length, 5);
}
for (const name of ['daniels-nautilus','omega-deville']) {
  const img=sharp(`src/content/posts/_images/co-axial-${name}-cutout.webp`);
  assert((await img.metadata()).hasAlpha && !(await img.stats()).isOpaque);
}
for (const route of [...articles,...models]) assert.equal(await access(`dist${route}index.html`).then(()=>true,()=>false),published,route);
for (const file of ['index.html','en/index.html','cikkek/index.html','en/articles/index.html','muhely/index.html','en/workshop/index.html','rss.xml','en/rss.xml','sitemap-0.xml']) {
  const html=await readFile(`dist/${file}`,'utf8');
  assert.equal(html.includes('/co-axial/'),published,file);
}
const site=await localSite(),browser=await openBrowser(out),checks=[];
try {
  const pages=[...(published?[...articles,...models]:[]),'/','/en/','/naptar/','/en/calendar/'];
  for(const route of pages) for(const width of [1440,390,320]) {
    await browser.navigate(site.origin+route,width);
    await browser.evaluate(`(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode()}))})()`);
    assert.equal(await browser.evaluate(`document.documentElement.scrollWidth>innerWidth+1`),false,`${route} ${width}`);
    if(published && (route==='/'||route==='/en/')) assert.equal(await browser.evaluate(`document.querySelector('[data-home-feature]')?.getAttribute('data-home-feature')`),'co-axial');
    if(articles.includes(route)||models.includes(route)) {
      assert.equal(await browser.evaluate(`document.querySelectorAll('[data-coaxial-model]').length`),1);
      assert.equal(await browser.evaluate(`document.querySelector('[data-coaxial-model]').dataset.ready`),'true');
      assert.equal(await browser.evaluate(`document.querySelector('[data-coaxial-model]').dataset.running`),'false');
      await browser.evaluate(`document.documentElement.style.scrollBehavior='auto';document.querySelector('[data-coaxial-model]').scrollIntoView({behavior:'instant'})`);
      await pause(100);
      for(let phase=0;phase<8;phase++) {
        await browser.evaluate(`document.querySelector('[data-cx-phase="${phase}"]').click()`);
        assert.equal(await browser.evaluate(`document.querySelector('[data-coaxial-model]').dataset.phase`),String(phase));
      }
      await browser.evaluate(`document.querySelector('[data-cx-action="toggle"]').click()`);await pause(120);
      assert.equal(await browser.evaluate(`document.querySelector('[data-coaxial-model]').dataset.running`),'true');
      await browser.evaluate(`document.querySelector('[data-cx-action="toggle"]').click()`);
      assert.equal(await browser.evaluate(`document.querySelector('[data-coaxial-model]').dataset.running`),'false');
      if(width===390)await browser.screenshot(route.replaceAll('/','_')+'model.png');
    }
    checks.push({route,width,overflow:false});
  }
  assert.equal(browser.events.filter(e=>e.method==='Runtime.exceptionThrown').length,0);
  assert.deepEqual(browser.events.filter(e=>e.method==='Log.entryAdded'&&e.params.entry.level==='error'&&/content security|refused to execute|failed to load/i.test(e.params.entry.text)),[]);
  await writeFile(`${out}/${published?'published':'scheduled'}.json`,JSON.stringify({publication:'2026-10-16T01:00:00+02:00',published,checks},null,2));
  console.log(JSON.stringify({published,checks:checks.length,errors:0}));
} finally {await browser.close();site.close();}
