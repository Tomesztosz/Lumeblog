import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {openBrowser,localSite} from './lib/browser-qa.mjs';
const production=process.argv.includes('--production'),out=`output/seo-p2-p3/${production?'production-browser':'browser'}`;
const browser=await openBrowser(out),server=production?null:await localSite(),origin=production?'https://lumejournal.com':server.origin,results=[];
try {
  for(const path of ['/szerkezet/co-axial/','/en/movement/co-axial/','/kezben/lorier-ket-tanar-egy-ora/','/muhely/co-axial/','/en/workshop/rattrapante/','/naptar/','/en/calendar/']) {
    await browser.navigate(origin+path,390);
    const actual=await browser.evaluate(`({h1:document.querySelector('h1')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth,context:document.querySelectorAll('[data-content-connections] a').length,guide:document.querySelectorAll('[data-model-reading-guide]').length,calendarLinks:document.querySelectorAll('[data-calendar-story]').length,reasons:document.querySelectorAll('[data-related-reason]').length})`);
    assert(actual.h1,'Missing H1');assert(!actual.overflow,`${path}: mobile overflow`);
    if(path.includes('/muhely/')||path.includes('/workshop/'))assert.equal(actual.guide,1);
    else if(path.includes('/calendar/')||path.includes('/naptar/'))assert.equal(actual.calendarLinks,3);
    else {assert(actual.context>0);assert(actual.reasons>0);}
    if(path==='/muhely/co-axial/') {
      await browser.evaluate(`document.querySelector('[data-cx-phase="1"]').focus()`);
      await browser.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13,text:'\r'});
      await browser.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
      assert(await browser.evaluate(`document.querySelector('[data-cx-phase="1"]').getAttribute('aria-pressed')==='true'`));actual.keyboardControl=true;
      await browser.evaluate(`document.querySelector('[data-model-reading-guide]').scrollIntoView({behavior:'instant',block:'start'})`);
    }
    if(path==='/szerkezet/co-axial/'||path==='/muhely/co-axial/')await browser.screenshot(path.replaceAll('/','-')+'mobile.png');
    results.push({path,...actual});
  }
  // A real same-origin calendar deep link must reveal the selected pending card.
  await browser.navigate(origin+'/naptar/?status=announced#omega-james-bond-spectre-2026',390);
  assert(await browser.evaluate(`!document.getElementById('omega-james-bond-spectre-2026').hidden`));
  results.push({calendarDeepLink:true});
  await browser.send('Emulation.setScriptExecutionDisabled',{value:true});
  await browser.navigate(origin+'/muhely/co-axial/',390);
  assert(await browser.evaluate(`document.querySelector('[data-model-reading-guide]').textContent.includes('impulzus')`));
  results.push({noJavaScriptGuide:true});
  await mkdir(out,{recursive:true});await writeFile(`${out}/report.json`,JSON.stringify({production,results,errors:[]},null,2));
  console.log(`Content browser: ${results.length} checks passed.`);
} finally {await browser.close();server?.close();}
