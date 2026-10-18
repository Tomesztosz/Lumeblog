import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {openBrowser,localSite,pause} from './lib/browser-qa.mjs';
import {hydrateEvents} from '../src/lib/calendar-events.mjs';
import {calendarCounts,sortCalendar,matchesCalendar,focusGroup} from '../src/lib/calendar-state.mjs';
const json=async name=>JSON.parse(await readFile(`src/data/${name}.json`,'utf8'));
const entries=hydrateEvents([...await json('releases'),...await json('announcements')],await json('calendar-events'));
const output='output/calendar-automation/qa',browser=await openBrowser(output),site=await localSite(),results=[];
const visible="Array.from(document.querySelectorAll('[data-release-card]')).filter(e=>!e.hidden).map(e=>e.id)";
const clock=async value=>{
 await browser.evaluate(`window.__RealDate ||= Date; window.__epoch = ${JSON.stringify(value)}; window.__tick=performance.now(); window.Date=class extends window.__RealDate {constructor(...args){super(...(args.length?args:[new window.__RealDate(window.__epoch).valueOf()+performance.now()-window.__tick]));} static now(){return new window.__RealDate(window.__epoch).valueOf()+performance.now()-window.__tick;} }; window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));`);
};
try{
 for(const [lang,path]of [['hu','/naptar/'],['en','/en/calendar/']]){
  await browser.navigate(site.origin+path);
  const now=new Date('2026-10-18T12:00:00Z');await clock(now.toISOString());
  const expected=sortCalendar(entries,now).filter(e=>matchesCalendar(e,{},now));
  assert.deepEqual(await browser.evaluate(visible),expected.map(e=>e.id));
  assert.equal(await browser.evaluate("document.querySelector('#calendarResultCount').textContent.trim()"),`${expected.length} ${lang==='hu'?'esemény':'events'}`);
  assert.equal(await browser.evaluate("document.querySelectorAll('[data-calendar-focus-group] li').length"),focusGroup(entries,now).length);
  results.push(lang+': coherent list/count/group');
  for(const view of ['announced','archived','review']){
   await browser.evaluate(`document.querySelector('[data-calendar-view="${view}"]').click()`);
   assert.equal((await browser.evaluate(visible)).length,calendarCounts(entries,now)[view]);
   assert(await browser.evaluate("document.querySelector('[data-calendar-focus-link]').hidden"));
  }
  results.push(lang+': historical, waiting and review tabs');
  await browser.navigate(site.origin+path+'?brand=lorier');await clock(now.toISOString());
  assert.deepEqual(await browser.evaluate(visible),['lorier-astra-december-delivery-2026']);
  assert((await browser.evaluate("document.querySelector('[data-calendar-focus-title]').textContent")).includes('Lorier'));
  await browser.evaluate("const q=document.querySelector('#releaseQuery');q.value='no-match-xyz';q.dispatchEvent(new Event('input'));");
  assert(await browser.evaluate("!document.querySelector('#calendarEmpty').hidden && !document.querySelector('[data-calendar-empty-help]').hidden"));
  assert(await browser.evaluate("document.querySelector('[data-calendar-focus-link]').hidden"));
  results.push(lang+': filters and useful empty state');
  await browser.navigate(site.origin+path+'#studio-underd0g-mantis-2026');await clock(now.toISOString());
  assert(await browser.evaluate("!document.getElementById('studio-underd0g-mantis-2026').hidden"));
  assert(await browser.evaluate("document.getElementById('studio-underd0g-mantis-2026').querySelector('[data-calendar-download]').hidden"));
  results.push(lang+': historical deep link and hidden expired export');
  await browser.navigate(site.origin+path,390);await clock(now.toISOString());
  assert(await browser.evaluate("document.documentElement.scrollWidth<=innerWidth"));
  assert(await browser.evaluate("Array.from(document.querySelectorAll('[data-calendar-view]')).every(e=>e.getBoundingClientRect().height>=44)"));
  await browser.screenshot(lang+'-mobile.png');
  results.push(lang+': mobile width and controls');
  await browser.navigate(site.origin+path,1440);await clock(now.toISOString());
  await browser.screenshot(lang+'-desktop.png');
  await browser.evaluate("document.documentElement.setAttribute('data-theme','dark')");
  await browser.screenshot(lang+'-dark.png');
  results.push(lang+': light and dark screenshots');
  // The page is a cached build from October 18, but its clock is just before
  // the October 5 instant. Advancing time alone must expire it without a fetch.
  await browser.evaluate("window.fetch=()=>Promise.reject(new Error('offline fixture'))");
  await clock('2026-10-05T16:59:59.600Z');
  assert((await browser.evaluate(visible)).includes('lorier-astra-october-preorder-2026'));
  await pause(800);
  assert(!(await browser.evaluate(visible)).includes('lorier-astra-october-preorder-2026'));
  results.push(lang+': exact boundary timer works offline');
  await clock('2027-01-01T12:00:00Z');
  await browser.evaluate("document.dispatchEvent(new Event('visibilitychange'))");
  assert.equal((await browser.evaluate(visible)).length,0);
  assert.equal(await browser.evaluate("document.querySelector('[data-calendar-count=active]').textContent"),'0');
  assert(await browser.evaluate("Array.from(document.querySelectorAll('[data-calendar-download]')).every(e=>e.hidden)"));
  assert(await browser.evaluate("Array.from(document.querySelectorAll('[data-radar-brand]')).every(e=>!e.classList.contains('active'))"));
  results.push(lang+': old cached page resumes offline with expired counts/radar/highlight');
 }
 await browser.send('Emulation.setScriptExecutionDisabled',{value:true});
 await browser.navigate(site.origin+'/naptar/');
 assert.equal(await browser.evaluate("Array.from(document.querySelectorAll('[data-release-card]')).filter(e=>getComputedStyle(e).display!=='none').length"),entries.length);
 await browser.send('Emulation.setScriptExecutionDisabled',{value:false});results.push('No-JS readable fallback');
 const errors=browser.events.filter(e=>e.method==='Runtime.exceptionThrown'||(e.method==='Log.entryAdded'&&/content security|refused to|uncaught/i.test(e.params.entry.text)));
 assert.equal(errors.length,0,JSON.stringify(errors));results.push('No runtime/CSP errors');
}finally{
 await browser.close();site.close();await writeFile(output+'/report.json',JSON.stringify({results},null,2)+'\n');
}
console.log(`Calendar browser QA: ${results.length} checks passed.`);
