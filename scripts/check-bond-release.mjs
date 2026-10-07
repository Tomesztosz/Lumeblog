import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { localSite, openBrowser } from './lib/browser-qa.mjs';

const root = resolve(process.argv[2] || '.');
const output = resolve('output/article-review/omega-james-bond/release-qa');
const site = await localSite(join(root, 'dist'));
const browser = await openBrowser(output);
const articles = [
  ['hu', '/eredet/omega-james-bond-orak/'],
  ['en', '/en/origins/omega-james-bond-watches/'],
];
const results = [];
try {
  for (const [lang, path] of articles) {
    const html = await readFile(join(root, 'dist', path, 'index.html'), 'utf8');
    assert(!html.includes('lume-review-image'));
    assert(!html.includes('nem generált órák'));
    assert(!html.includes('not generated watches'));
    assert(!html.includes('&#x20;'));
    for (const width of [1440, 390]) {
      await browser.navigate(site.origin + path, width);
      await browser.evaluate(`Promise.all([...document.images].map(i => { i.loading = 'eager'; return i.decode(); }))`);
      await browser.evaluate('document.fonts.ready.then(() => true)');
      for (const theme of ['light', 'dark']) {
        await browser.evaluate(`document.documentElement.dataset.theme = '${theme}'`);
        const state = await browser.evaluate(`({
          lang: document.documentElement.lang,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          images: document.querySelectorAll('.article-body img').length,
          hero: document.querySelectorAll('.article-lead-media img').length,
          broken: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
          sources: document.querySelectorAll('.reader-sources a').length,
          bodyLinks: document.querySelectorAll('.article-body a[href^="http"]').length,
          canonical: document.querySelector('link[rel="canonical"]').href
        })`);
        assert.equal(state.lang, lang);
        assert.equal(state.overflow, false);
        assert.equal(state.images, 12);
        assert.equal(state.hero, 1);
        assert.deepEqual(state.broken, []);
        assert.equal(state.sources, 36);
        assert.equal(state.bodyLinks, 0);
        assert.equal(state.canonical, 'https://lumejournal.com' + path);
        await browser.screenshot(`${lang}-${width}-${theme}.png`);
        await browser.evaluate(`document.querySelector('.article-body img').scrollIntoView({block:'center', behavior:'instant'})`);
        await browser.screenshot(`${lang}-${width}-${theme}-cutout.png`);
        await browser.evaluate(`scrollTo({top:0, behavior:'instant'})`);
        results.push({path, width, theme, ...state});
      }
      await browser.evaluate(`document.querySelector('[data-text-size="large"]').click()`);
      assert(await browser.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'));
    }
    const prefix = lang === 'en' ? '/en/' : '/';
    await browser.navigate(site.origin + prefix);
    assert(await browser.evaluate(`!!document.querySelector('a[href="${path}"]')`));
    const rss = await readFile(join(root, 'dist', prefix, 'rss.xml'), 'utf8');
    assert(rss.includes(path));
  }
  for (const path of ['/naptar/', '/en/calendar/']) {
    for (const width of [1440, 390]) {
      await browser.navigate(site.origin + path, width);
      assert(await browser.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'));
      assert(await browser.evaluate(`document.body.textContent.includes('James Bond / Spectre')`));
      assert(await browser.evaluate(`!document.querySelector('a[href*="omega-james-bond-spectre-2026.ics"]')`));
      await browser.screenshot(`calendar-${path.startsWith('/en/')?'en':'hu'}-${width}.png`);
    }
  }
  const errors = browser.events.filter(e => e.method === 'Runtime.exceptionThrown');
  assert.equal(errors.length, 0, JSON.stringify(errors));
  await writeFile(join(output, 'result.json'), JSON.stringify({results, calendars:4, errors:0}, null, 2));
  console.log(JSON.stringify({articleCases:results.length, calendarCases:4, homepages:2, feeds:2, errors:0}));
} finally {
  await browser.close();
  site.close();
}
