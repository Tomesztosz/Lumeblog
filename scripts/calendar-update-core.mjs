import { createHash, randomUUID } from 'node:crypto';
import { readFile, writeFile, rename, unlink, open, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { dateWindow, eventIdentity, validInstant, classifyCalendarEvent } from '../src/lib/calendar-events.mjs';
export const digest=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const planKey=s=>JSON.stringify([s?.precision,s?.value,s?.end,s?.timeZone,s?.certainty,s?.qualifier,s?.kind]);
export const DEFAULT_REFRESH={dailyHours:24,nearHours:6,urgentHours:1,unresolvedDays:7,maxBackoffHours:168,minHostDelayMs:1500};
export function refreshHours(entry,now,config=DEFAULT_REFRESH) {
  const c=classifyCalendarEvent(entry,now), w=c.window;
  if(c.state==='expired')return +now-w.end<86400000?config.urgentHours:+now-w.end<config.unresolvedDays*86400000?config.nearHours:config.maxBackoffHours;
  if(c.state==='review')return config.maxBackoffHours;
  if(w&&['instant','day','duration'].includes(w.precision)) {
    const distance=w.start-+now;
    if(distance<=86400000)return config.urgentHours;
    if(distance<=7*86400000)return config.nearHours;
  }
  return config.dailyHours;
}
export function sourceDue(state,entries,now,config=DEFAULT_REFRESH) {
  const hours=Math.min(...entries.map(e=>refreshHours(e,now,config)),config.maxBackoffHours);
  const backoff=state?.failures?Math.min(config.maxBackoffHours,2**Math.min(state.failures,10)):0;
  return !state?.lastAttemptAt||+now-Date.parse(state.lastAttemptAt)>=Math.max(hours,backoff)*3600000;
}
export async function atomicJson(path,value) {
  await mkdir(dirname(path),{recursive:true});
  const temp=`${path}.${randomUUID()}.tmp`;
  try {
    const handle=await open(temp,'wx');
    try{await handle.writeFile(JSON.stringify(value,null,2)+'\n');await handle.sync();}finally{await handle.close();}
    await rename(temp,path);
  }finally{await unlink(temp).catch(e=>{if(e.code!=='ENOENT')throw e;});}
}
export async function withStoreLock(path,callback) {
  const lock=`${path}.lock`;
  await mkdir(dirname(path),{recursive:true});
  const handle=await open(lock,'wx'); // Fails closed. Never steal a possibly live lock.
  try {await handle.writeFile(JSON.stringify({pid:process.pid,startedAt:new Date().toISOString()}));return await callback();}
  finally {await handle.close();await unlink(lock);}
}
export async function commitObservation(path,observation) {
  return withStoreLock(path,async()=>{
    const before=JSON.parse(await readFile(path,'utf8'));
    const result=applyObservation(before,observation);
    if(result.changed)await atomicJson(path,result.store);
    return result;
  });
}
export function flagEventReview(store,entry,observation,reason) {
  const old=store.events[entry.id];
  if(!old?.identityVerified||old.override||old.editorial!=='approved'||old.revision!==entry.lifecycle.revision)return store;
  if(old.verification?.issue==='date-conflict')return store;
  const next=structuredClone(store),e=next.events[entry.id];
  e.history.push({revision:old.revision,sourceStatus:old.sourceStatus,schedule:old.schedule,evidence:old.evidence,verification:old.verification,changedAt:observation.evidence?.checkedAt||observation.checkedAt,reason});
  e.verification={issue:'date-conflict',reason,proposal:observation};e.revision++;next.version++;
  return next;
}
export function applyObservation(store,observation) {
  const old=store.events[observation.eventId];
  const unchanged=(reason)=>({store,changed:false,reason});
  if(!old)return unchanged('unknown-event-editorial-review');
  if(observation.error)return unchanged('fetch-or-parser-failure');
  if(!old.identityVerified||eventIdentity(old.identity)!==eventIdentity(observation.identity))return unchanged('identity-review');
  if(old.editorial!=='approved'||old.override)return unchanged('editorial-lock');
  if(!validInstant(observation.requestedAt)||!validInstant(observation.evidence?.checkedAt))return unchanged('invalid-observation-time');
  if(old.acceptedRequestAt&&observation.requestedAt<old.acceptedRequestAt)return unchanged('stale-response');
  if(observation.baseRevision!==old.revision)return unchanged('revision-conflict');
  const evidence=observation.evidence;
  if(evidence.publishedAt && (!validInstant(evidence.publishedAt)||Date.parse(evidence.publishedAt)>Date.parse(evidence.checkedAt)))return unchanged('invalid-publication-time');
  if(evidence.eventId!==observation.eventId||evidence.eventType!==old.identity.type||!evidence.quote?.trim()||!old.allowedSources?.includes(evidence.url))return unchanged('invalid-evidence');
  if(!['planned','occurred','cancelled','postponed'].includes(observation.sourceStatus))return unchanged('invalid-source-state');
  if(evidence.claim!==observation.sourceStatus)return unchanged('claim-mismatch');
  try {dateWindow(observation.schedule);}catch{return unchanged('invalid-date');}
  if(!observation.schedule)return unchanged('missing-schedule');
  if(observation.sourceStatus==='postponed'&&observation.schedule.precision!=='unknown')return unchanged('postponement-needs-new-plan');
  const equivalent=observation.sourceStatus===old.sourceStatus&&planKey(observation.schedule)===planKey(old.schedule);
  if(equivalent&&!old.verification){
    // Daily semantic freshness is metadata, not a reschedule or a new history
    // item. Hourly confirmations remain in the private worker cache.
    if((old.semanticVerifiedAt||'').slice(0,10)<evidence.checkedAt.slice(0,10)){
      const next=structuredClone(store),entry=next.events[observation.eventId];
      entry.semanticVerifiedAt=evidence.checkedAt;entry.acceptedRequestAt=observation.requestedAt;
      entry.evidence=[{...evidence,accepted:true}];next.version++;
      return {store:next,changed:true,reason:'verified-unchanged'};
    }
    return unchanged('unchanged');
  }
  const latest=(old.evidence||[]).filter(e=>e.accepted&&validInstant(e.publishedAt)).map(e=>Date.parse(e.publishedAt));
  // Retrieval order never proves publication order. Changed plans/outcomes require
  // a dated official correction, explicitly tied to the accepted revision.
  const newer=validInstant(evidence.publishedAt)&&(!latest.length||Date.parse(evidence.publishedAt)>Math.max(...latest));
  if(!equivalent&&(!newer||observation.supersedesRevision!==old.revision))return unchanged('dated-correction-review');
  const next=structuredClone(store),entry=next.events[observation.eventId];
  entry.history.push({revision:old.revision,sourceStatus:old.sourceStatus,schedule:old.schedule,evidence:old.evidence,verification:old.verification,changedAt:evidence.checkedAt,reason:'accepted-official-correction'});
  entry.revision++;
  entry.sourceStatus=observation.sourceStatus;entry.schedule=observation.schedule;
  entry.evidence=[{...evidence,accepted:true}];entry.verification=null;
  entry.semanticVerifiedAt=evidence.checkedAt;entry.acceptedRequestAt=observation.requestedAt;
  next.version++;
  return {store:next,changed:true,reason:'accepted'};
}
// Bindings are editorially approved, source-specific field contracts. No fuzzy
// title matching, generic stock detection or news-date -> release-date conversion.
export function extractBoundEvent(text,binding,entry,requestedAt,checkedAt) {
  const fail=reason=>({eventId:entry.id,error:reason});
  if(!binding||!entry.lifecycle?.identityVerified)return fail('missing-reviewed-binding');
  for(const anchor of binding.requiredText||[])if(!text.includes(anchor))return fail('identity-anchor-missing');
  const outcomeClaims=(binding.outcomes||[]).flatMap(rule=>[...text.matchAll(new RegExp(rule.pattern,'g'))].map(match=>({rule,match})));
  if(new Set(outcomeClaims.map(c=>c.rule.claim)).size>1)return {...fail('conflicting-outcome-claims'),checkedAt,quotes:outcomeClaims.map(c=>c.match[0])};
  if(outcomeClaims.length===1) {
    const {rule,match}=outcomeClaims[0],publishedAt=match.groups?.publishedAt;
    return {eventId:entry.id,identity:entry.lifecycle.identity,baseRevision:entry.lifecycle.revision,requestedAt,sourceStatus:rule.claim,schedule:rule.claim==='postponed'?{precision:'unknown'}:entry.lifecycle.schedule,...(validInstant(publishedAt)?{supersedesRevision:entry.lifecycle.revision}:{}),evidence:{eventId:entry.id,eventType:entry.lifecycle.identity.type,claim:rule.claim,url:binding.url,quote:match[0].slice(0,600),checkedAt,publishedAt}};
  }
  const matches=[...text.matchAll(new RegExp(binding.pattern,'g'))];
  if(!matches.length)return fail('field-not-found');
  const keys=new Set(matches.map(m=>`${m.groups?.year}/${m.groups?.month}`));
  if(keys.size!==1)return {...fail('conflicting-date-claims'),checkedAt,quotes:matches.map(m=>m[0].slice(0,200))};
  const match=matches.find(m=>m.groups?.qualifier)||matches[0], groups=match.groups||{};
  if(!groups.year||!groups.month)return fail('missing-explicit-year-or-month');
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const month=/^\d+$/.test(groups.month)?+groups.month:months.indexOf(groups.month)+1;
  if(month<1||month>12)return fail('invalid-month');
  const schedule={precision:'month',value:`${groups.year}-${String(month).padStart(2,'0')}`,certainty:binding.certainty,...(groups.qualifier?{qualifier:groups.qualifier}:{}),originalText:match[0]};
  try{dateWindow(schedule);}catch{return fail('invalid-date');}
  const correction=binding.correctionPattern?text.match(new RegExp(binding.correctionPattern)):null;
  const publishedAt=correction?.groups?.publishedAt;
  return {eventId:entry.id,identity:entry.lifecycle.identity,baseRevision:entry.lifecycle.revision,requestedAt,sourceStatus:'planned',schedule,...(validInstant(publishedAt)?{supersedesRevision:entry.lifecycle.revision}:{}),evidence:{eventId:entry.id,eventType:entry.lifecycle.identity.type,claim:'planned',url:binding.url,quote:match[0].slice(0,600),checkedAt,...(validInstant(publishedAt)?{publishedAt}: {})}};
}
