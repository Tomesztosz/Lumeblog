import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {parseFrontmatter} from '@astrojs/markdown-remark';
import {localSite,openBrowser} from './lib/browser-qa.mjs';
const root=resolve(process.argv[2]||'.'),output=resolve('output/article-review/cartier-crash/release-qa');
const paths=[['hu','/eredet/cartier-crash-tortenete/'],['en','/en/origins/cartier-crash-history/']];
const site=await localSite(join(root,'dist')),browser=await openBrowser(output),checks=[];
try{
 for(const [lang,path]of paths){
  const {frontmatter:f,content}=parseFrontmatter(await readFile(join(root,'src/content/posts',lang,'cartier-crash.md'),'utf8'));
  assert.equal(f.draft,false);assert(f.cover&&!f.reviewCover);assert(new Date(f.date)<=new Date());assert(!content.includes('skeleton-detail'));assert(!content.includes(String.fromCharCode(0x2014)));
  const html=await readFile(join(root,'dist',path,'index.html'),'utf8');
  assert(!html.includes('lume-review-image'));assert(!html.includes('skeleton-detail'));assert(!/noindex/i.test(html));
  assert(html.includes('H. Grobe'));assert(html.includes('Sotheby'));assert(html.includes('https://creativecommons.org/licenses/by/3.0/'));
  for(const width of [1440,390,320]){
   await browser.navigate(site.origin+path,width);
   await browser.evaluate(`Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode()}))`);
   await browser.evaluate('document.fonts.ready.then(()=>true)');
   for(const theme of ['light','dark']){
    await browser.evaluate(`document.documentElement.dataset.theme='${theme}'`);
    const state=await browser.evaluate(`({lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth+1,images:document.querySelectorAll('.article-body img').length,hero:document.querySelectorAll('.article-lead-media img').length,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),sources:document.querySelectorAll('.reader-sources a').length,bodyLinks:document.querySelectorAll('.article-body a[href^="http"]').length,canonical:document.querySelector('link[rel="canonical"]').href})`);
    assert.equal(state.lang,lang);assert(!state.overflow);assert.equal(state.images,5);assert.equal(state.hero,1);assert.deepEqual(state.broken,[]);assert.equal(state.sources,11);assert.equal(state.bodyLinks,0);assert.equal(state.canonical,'https://lumejournal.com'+path);
    await browser.screenshot(`${lang}-${width}-${theme}.png`);
    await browser.evaluate(`document.querySelector('img[src*="skeleton-cutout"]').scrollIntoView({block:'center',behavior:'instant'})`);
    await browser.screenshot(`${lang}-${width}-${theme}-cutout.png`);
    await browser.evaluate(`scrollTo({top:0,behavior:'instant'})`);
    checks.push({path,width,theme,...state});
   }
   await browser.evaluate(`document.querySelector('[data-text-size="large"]').click()`);
   assert(await browser.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
  }
  const prefix=lang==='en'?'/en/':'/';await browser.navigate(site.origin+prefix);
  assert(await browser.evaluate(`!!document.querySelector('a[href="${path}"]')`));
  assert.equal(await browser.evaluate(`document.querySelector('[data-home-feature]').dataset.homeFeature`),'cartier-crash');
  const rss=await readFile(join(root,'dist',prefix,'rss.xml'),'utf8');assert(rss.includes(path));
 }
 for(const path of ['/naptar/','/en/calendar/'])for(const width of [1440,390]){
  await browser.navigate(site.origin+path,width);assert(await browser.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
  await browser.screenshot(`calendar-${path.startsWith('/en/')?'en':'hu'}-${width}.png`);
 }
 const errors=browser.events.filter(e=>e.method==='Runtime.exceptionThrown');assert.equal(errors.length,0);
 await writeFile(join(output,'result.json'),JSON.stringify({checks,calendarCases:4,homepages:2,feeds:2,errors:0},null,2));
 console.log(JSON.stringify({articleCases:checks.length,calendarCases:4,homepages:2,feeds:2,errors:0}));
}finally{await browser.close();site.close()}
