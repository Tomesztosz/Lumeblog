import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {openBrowser,localSite,pause} from './lib/browser-qa.mjs';
import {inspectHtml,attribute,textOf} from './lib/seo-html.mjs';
const production=process.argv.includes('--production');
const out=`output/seo-p0-p1/${production?'production-browser':'browser'}`;
const browser=await openBrowser(out),server=production?null:await localSite();
const origin=production?'https://lumejournal.com':server.origin;
const paths=['/','/en/','/kezben/','/en/in-hand/','/szerkezet/co-axial/','/en/movement/co-axial/',
 '/cikkek/','/en/articles/','/muhely/','/en/workshop/','/muhely/co-axial/','/en/workshop/co-axial/',
 '/muhely/rattrapante/','/muhely/rotor/','/naptar/','/en/calendar/','/rolam/','/en/about/'];
const results=[];
try{
 for(const path of paths){
  const initial=inspectHtml(await readFile(`dist${path}index.html`,'utf8'));
  await browser.navigate(origin+path);
  const actual=await browser.evaluate(`({title:document.title,lang:document.documentElement.lang,canonical:Array.from(document.head.querySelectorAll('link[rel=canonical]')).map(n=>n.href),alternates:Array.from(document.head.querySelectorAll('link[hreflang]')).map(n=>({lang:n.hreflang,url:n.href})),meta:Array.from(document.head.querySelectorAll('meta')).filter(n=>/^(robots|description|og:|twitter:|article:)/.test(n.name||n.getAttribute('property')||'')).map(n=>[n.name||n.getAttribute('property'),n.content]),schema:Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(n=>JSON.parse(n.textContent)),h1:document.querySelector('h1')?.textContent.replace(/\\s+/g,' ').trim()})`);
  assert.equal(actual.title,initial.titles[0],path+': title changed after JavaScript');assert.equal(actual.lang,initial.lang);
  assert.deepEqual(actual.canonical,initial.canonical);assert.deepEqual(actual.alternates,initial.alternates);
  for(const [name,value]of actual.meta)assert.equal(value,initial.meta(name)[0],path+': mutated '+name);
  assert.equal(actual.h1,textOf(initial.elements.find(n=>n.tagName==='h1')).replace(/\s+/g,' ').trim());
  const flatten=data=>Array.isArray(data)?data.flatMap(flatten):data['@graph']?flatten(data['@graph']):[data];
  assert.deepEqual(actual.schema.flatMap(flatten),initial.schemas,path+': schema changed after JavaScript');
  results.push(path+': initial HTML and rendered metadata agree');
  if(path.includes('/workshop/co-axial')||path==='/muhely/co-axial/'){
   await browser.evaluate(`document.querySelector('[data-cx-phase="1"]').click()`);
   assert(await browser.evaluate(`document.querySelector('[data-cx-phase="1"]').getAttribute('aria-pressed')==='true'`));
   results.push(path+': Co-Axial controls work');
  }
  if(path==='/muhely/rattrapante/'){
   await browser.evaluate(`document.querySelector('[data-action="toggle"]').click()`);await pause(150);
   assert(await browser.evaluate(`document.querySelector('[data-action="toggle"]').getAttribute('aria-pressed')==='true'`));
   await browser.evaluate(`document.querySelector('[data-action="split"]').click()`);
   assert(await browser.evaluate(`document.querySelector('[data-action="split"]').getAttribute('aria-pressed')==='true'`));
   results.push(path+': split-seconds controls work');
  }
 }
 for(const path of ['/szerkezet/co-axial/','/muhely/co-axial/','/naptar/','/en/calendar/']){
  await browser.navigate(origin+path,390);assert(await browser.evaluate('document.documentElement.scrollWidth<=innerWidth'));
  await browser.evaluate(`document.querySelector('[data-theme-toggle]').click()`);
  assert(await browser.evaluate(`document.documentElement.dataset.theme==='dark'`));
  await browser.screenshot(path.replaceAll('/','-')+'mobile.png');
  await browser.evaluate(`document.querySelector('[data-theme-toggle]').click()`);
  results.push(path+': mobile and theme controls work');
 }
 await browser.send('Emulation.setScriptExecutionDisabled',{value:true});
 await browser.navigate(origin+'/szerkezet/co-axial/');
 assert(await browser.evaluate(`Boolean(document.querySelector('article p')?.textContent.trim())`));
 await browser.navigate(origin+'/muhely/co-axial/');
 assert(await browser.evaluate(`Boolean(document.querySelector('.shared-model-page header p:not(.eyebrow)')?.textContent.trim())`));
 results.push('Article and model context readable without JavaScript');
 await browser.send('Emulation.setScriptExecutionDisabled',{value:false});
 const errors=browser.events.filter(e=>e.method==='Runtime.exceptionThrown'||(e.method==='Log.entryAdded'&&/content security|refused to|uncaught/i.test(e.params.entry.text)));
 assert.equal(errors.length,0,JSON.stringify(errors));
 results.push('No runtime/CSP errors');
}finally{
 await browser.close();server?.close();
 await writeFile(out+'/report.json',JSON.stringify({checkedAt:new Date().toISOString(),production,results},null,2)+'\n');
}
console.log(`SEO browser QA: ${results.length} checks passed.`);
