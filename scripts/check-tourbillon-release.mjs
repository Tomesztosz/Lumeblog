import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import sharp from 'sharp';
import {parseFrontmatter} from '@astrojs/markdown-remark';
import {localSite,openBrowser,pause} from './lib/browser-qa.mjs';
const out=resolve('output/article-review/tourbillon/release-qa');await mkdir(out,{recursive:true});
const production=process.argv.includes('--production');
const paths={hu:['/szerkezet/tourbillon-paradoxon/','/muhely/tourbillon/'],en:['/en/movement/tourbillon-paradox/','/en/workshop/tourbillon/']};
if(!production){
 for(const lang of ['hu','en']){
  const raw=await readFile(`src/content/posts/${lang}/tourbillon.md`,'utf8'),{frontmatter:f,content}=parseFrontmatter(raw);
  assert.equal(f.draft,false);assert(f.cover&&f.cover.cardSrc&&!f.reviewCover);assert(!raw.includes('lume-review-'));assert(content.includes('<!-- lume-model tourbillon -->'));
  assert.equal((content.match(/!\[/g)||[]).length,7);assert(!raw.includes(String.fromCharCode(0x2014)));assert(!/\]\(https?:\/\//.test(content));
 }
 const alpha=await sharp('src/content/posts/_images/tourbillon-classique-cutout.webp').stats();assert(!alpha.isOpaque);assert.equal(alpha.channels[3].min,0);
 for(const file of ['sitemap-0.xml','rss.xml','en/rss.xml','llms.txt'])assert((await readFile('dist/'+file,'utf8')).includes('tourbillon'));
}
const site=production?{origin:'https://lumejournal.com',close(){}}:await localSite('dist');
const browser=await openBrowser(out),checks=[];
const click=s=>browser.evaluate(`document.querySelector(${JSON.stringify(s)}).click()`);
const value=k=>browser.evaluate(`document.querySelector('[data-tb-${k}]').textContent`);
const chapter=n=>click(`[data-tb-chapter="${n}"]`);
try{
 for(const lang of ['hu','en'])for(const [index,path]of paths[lang].entries())for(const width of production?[390]:[1440,390,320]){
  await browser.navigate(site.origin+path,width);
  const head=await browser.evaluate(`({lang:document.documentElement.lang,ready:document.querySelector('[data-tourbillon-model]')?.dataset.initialized,chapters:document.querySelectorAll('[data-tb-chapter]').length,canonical:document.querySelector('link[rel=canonical]').href,noindex:document.querySelector('meta[name=robots]')?.content||'',csp:!!document.querySelector('meta[http-equiv="Content-Security-Policy"]')})`);
  assert.equal(head.lang,lang);assert.equal(head.ready,'true');assert.equal(head.chapters,5);assert.equal(head.canonical,'https://lumejournal.com'+path);assert(!head.noindex.includes('noindex'));assert(head.csp);
  assert.equal(await browser.evaluate(`document.querySelector('[data-tb-play]').getAttribute('aria-pressed')`),'false');
  if(index===0){
   assert.equal(await browser.evaluate(`document.querySelector('.tb-open').getAttribute('href')`),paths[lang][1]);
   const images=await browser.evaluate(`Promise.all([...document.querySelectorAll('.article-body img,.article-hero img')].map(async i=>{i.loading='eager';await i.decode();return i.naturalWidth>0}))`);assert(images.length>=7&&images.every(Boolean));
  }else{assert.equal(await browser.evaluate(`document.querySelectorAll('[data-model-share]').length`),1);assert.equal(await browser.evaluate(`document.querySelectorAll('.tb-open').length`),0);}
  await click('[data-tb-beat]');assert.equal(await value('clock'),'0.125 s');
  await click('[data-tb-part-button="1"]');assert.equal(await browser.evaluate(`document.querySelector('[data-tourbillon-model]').dataset.focus`),'1');
  for(let n=0;n<5;n++){
   await chapter(n);assert.equal(await browser.evaluate(`document.querySelector('[data-tourbillon-model]').dataset.lesson`),String(n));
   assert(!await browser.evaluate('document.documentElement.scrollWidth>innerWidth'),path+' horizontal overflow');
  }
  await chapter(3);for(let n=0;n<4;n++)await click('[data-tb-step]');assert.equal(await value('rotatingMean'),'+2.00');assert.equal(await value('fixedMean'),'+10.00');
  await chapter(4);await browser.evaluate(`{const e=document.querySelector('[data-tb-scenario]');e.value='horizontal';e.dispatchEvent(new Event('change'));}`);
  await click('[data-tb-step]');assert.equal(await value('rotatingMean'),'+5.00');assert.equal(await value('fixedMean'),'+5.00');
  await browser.evaluate(`document.querySelector('[data-tb-world]').scrollIntoView({block:'start',behavior:'instant'})`);await browser.screenshot(`${production?'live':'built'}-${lang}-${index}-${width}-world.png`);
  await browser.evaluate(`document.querySelector('[data-tb-quiz]').open=true`);await click('[data-tb-answer="0:1"]');assert((await value('feedback="0"')).length>20);
  await browser.evaluate(`document.body.classList.add('dark');document.querySelector('[data-tb-mechanism]').scrollIntoView({block:'start',behavior:'instant'})`);await chapter(1);
  await browser.screenshot(`${production?'live':'built'}-${lang}-${index}-${width}-dark.png`);
  await browser.evaluate(`document.querySelector('[data-tb-play]').scrollIntoView({block:'center',behavior:'instant'})`);await click('[data-tb-play]');await pause(100);
  await browser.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await pause(80);assert.equal(await browser.evaluate(`document.querySelector('[data-tb-play]').getAttribute('aria-pressed')`),'false');await browser.send('Emulation.setEmulatedMedia',{features:[]});
  checks.push({path,width,lang,chapters:5,csp:true,passed:true});
 }
 for(const path of ['/','/en/']){await browser.navigate(site.origin+path,390);assert.equal(await browser.evaluate(`document.querySelector('[data-home-feature]').getAttribute('data-home-feature')`),'tourbillon');}
 assert.equal(browser.events.filter(e=>e.method==='Runtime.exceptionThrown').length,0,JSON.stringify(browser.events.filter(e=>e.method==='Runtime.exceptionThrown')));
 const result={production,checks,errors:0};await writeFile(out+`/${production?'live':'build'}-checks.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();site.close();}
