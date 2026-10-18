import { readFile, mkdir, appendFile } from 'node:fs/promises';
import { hydrateEvents } from '../src/lib/calendar-events.mjs';
import { atomicJson, withStoreLock, sourceDue, extractBoundEvent, applyObservation, flagEventReview } from './calendar-update-core.mjs';
import { fetchOfficial } from './calendar-http.mjs';
import { extractSource } from './radar-core.mjs';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const dir='.calendar-radar', path='src/data/calendar-events.json';
await mkdir(dir,{recursive:true});
await withStoreLock(path,async()=>{
  let store=await json(path);
  const initialVersion=store.version;
  const config=await json('src/data/calendar-refresh.json'), brands=await json('src/data/brand-radar.json');
  const entries=hydrateEvents([...await json('src/data/releases.json'),...await json('src/data/announcements.json')],store);
  let cache={sources:{},reviews:{},events:{}};
  try{cache=await json(`${dir}/event-state.json`);}catch(e){if(e.code!=='ENOENT')throw e;}
  cache.events ||= {};
  const now=new Date(), force=process.argv.includes('--force'), dry=process.argv.includes('--dry-run');
  const report={at:now.toISOString(),results:[],accepted:0};
  const byUrl=new Map();
  for(const entry of entries){const list=byUrl.get(entry.sourceUrl)||[];list.push(entry);byUrl.set(entry.sourceUrl,list);}
  const hostRequests=new Map();
  for(const [url,events] of byUrl){
    const before=cache.sources[url]||{};
    if(!force&&!sourceDue(before,events,now,config))continue;
    const requestedAt=new Date().toISOString(), host=new URL(url).hostname;
    const wait=config.minHostDelayMs-(Date.now()-(hostRequests.get(host)||0));
    if(wait>0)await new Promise(resolve=>setTimeout(resolve,wait));
    hostRequests.set(host,Date.now());
    const state={...before,lastAttemptAt:requestedAt};
    try {
      const brand=brands.find(b=>b.key===events[0].brandKey);
      const hosts=new Set([brand.sourceUrl,...(brand.additionalSources||[])].map(u=>new URL(u).hostname));
      let fetched=await fetchOfficial(url,hosts,before);
      if(fetched.notModified&&!before.text)fetched=await fetchOfficial(url,hosts,{});
      state.lastSuccessfulFetchAt=new Date().toISOString();state.failures=0;
      const extracted=fetched.notModified?{text:before.text,hash:before.hash,characters:before.text.length,status:'readable'}:extractSource(fetched.html,fetched.url);
      if(extracted.status==='blocked'||extracted.characters<300)throw Error('Blocked or incomplete source');
      Object.assign(state,{etag:fetched.etag||before.etag,lastModified:fetched.lastModified||before.lastModified,hash:extracted.hash,text:extracted.text});
      for(const entry of events){
        const binding=config.bindings.find(b=>b.eventId===entry.id&&b.url===url);
        const observation=extractBoundEvent(extracted.text,binding,entry,requestedAt,state.lastSuccessfulFetchAt);
        const result=applyObservation(store,observation);
        if(result.changed){store=result.store;report.accepted++;}
        const reason=observation.error||result.reason;
        if(['conflicting-date-claims','conflicting-outcome-claims','dated-correction-review'].includes(reason))store=flagEventReview(store,entry,observation,reason);
        if(['unchanged','verified-unchanged','accepted'].includes(reason)){
          cache.events[entry.id]={semanticVerifiedAt:state.lastSuccessfulFetchAt,hash:extracted.hash,evidence:observation.evidence};delete cache.reviews[entry.id];
        }else cache.reviews[entry.id]={eventId:entry.id,url,reason,hash:extracted.hash,firstSeen:cache.reviews[entry.id]?.firstSeen||requestedAt,lastSeen:requestedAt,proposal:observation};
        report.results.push({eventId:entry.id,url,result:reason});
      }
    }catch(error){
      state.failures=(before.failures||0)+1;state.error=error.message;
      report.results.push({url,result:'fetch-or-parser-failure',error:error.message});
      for(const entry of events) cache.reviews[entry.id]={...cache.reviews[entry.id],eventId:entry.id,url,reason:'fetch-or-parser-failure',error:error.message,firstSeen:cache.reviews[entry.id]?.firstSeen||requestedAt,lastSeen:requestedAt};
    }
    cache.sources[url]=state;
  }
  if(!dry){if(store.version!==initialVersion)await atomicJson(path,store);await atomicJson(`${dir}/event-state.json`,cache);}
  report.reviews=Object.values(cache.reviews);
  await atomicJson(`${dir}/event-report.json`,report);
  if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,`\nCalendar events: ${report.results.length} checks, ${report.accepted} accepted corrections, ${report.reviews.length} review tasks. See event-report.json.\n`);
  console.log(JSON.stringify({checks:report.results.length,accepted:report.accepted,review:report.reviews.length,dryRun:dry}));
});
