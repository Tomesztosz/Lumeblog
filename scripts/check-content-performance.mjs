import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {openBrowser,localSite,pause} from './lib/browser-qa.mjs';
const index=process.argv.indexOf('--baseline');assert(index>=0,'Supply --baseline <previous dist directory>');
const out='output/seo-p2-p3/performance',browser=await openBrowser(out),before=await localSite(process.argv[index+1]),after=await localSite(),observations=[];
try {
  await browser.send('Network.enable');await browser.send('Network.setCacheDisabled',{cacheDisabled:true});
  await browser.send('Network.emulateNetworkConditions',{offline:false,latency:40,downloadThroughput:1_600_000/8,uploadThroughput:750_000/8});
  await browser.send('Emulation.setCPUThrottlingRate',{rate:4});
  await browser.send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__lumeLab={lcp:null,cls:0};new PerformanceObserver(list=>{for(const e of list.getEntries())window.__lumeLab.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__lumeLab.cls+=e.value;}).observe({type:'layout-shift',buffered:true});`});
  for(const width of [390,1440])for(const path of ['/','/szerkezet/co-axial/','/cikkek/','/muhely/co-axial/','/naptar/'])for(const sample of [1,2])for(const [variant,server]of [['before',before],['after',after]]) {
    await browser.navigate(server.origin+path,width);await browser.evaluate('document.fonts.ready.then(()=>true)');await pause(350);
    const data=await browser.evaluate(`({...window.__lumeLab,loadMs:performance.getEntriesByType('navigation')[0].loadEventEnd,resources:performance.getEntriesByType('resource').length,transferBytes:performance.getEntriesByType('resource').reduce((n,e)=>n+e.transferSize,0),overflow:document.documentElement.scrollWidth>innerWidth})`);
    assert(!data.overflow);observations.push({variant,path,width,sample,...data});
  }
  await mkdir(out,{recursive:true});await writeFile(`${out}/lab.json`,JSON.stringify({generatedAt:new Date().toISOString(),kind:'Local controlled lab observations, NOT CrUX/field p75 or INP',environment:{cache:'disabled',latencyMs:40,downloadBitsPerSecond:1600000,cpuSlowdown:4,viewports:[390,1440],viewportOnly:true,samplesPerRoute:2},limitations:['LCP and initial-load layout-shift sums are short lab observations, not field CWV pass/fail.','No INP is inferred from a page load. No production network/CDN conditions or user population are measured.','The sample is too small to infer SEO or real-user performance impact.'],observations},null,2));
  console.log(`Performance lab: ${observations.length} before/after observations. No field performance claim.`);
}finally{await browser.close();before.close();after.close();}
