import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {classifyCalendarEvent as classify,dateWindow,hydrateEvents,eventIdentity,nextTransition,eventDateLabel,localMidnight} from '../src/lib/calendar-events.mjs';
import {matchesCalendar,calendarCounts,focusGroup,sortCalendar,statusLabel,calendarBoundaryChanged} from '../src/lib/calendar-state.mjs';
import {buildEventIcs,exportableEvent,downloadableEvent} from '../src/lib/calendar-ics.mjs';
import {applyObservation,commitObservation,atomicJson,extractBoundEvent,sourceDue,DEFAULT_REFRESH,refreshHours,flagEventReview} from './calendar-update-core.mjs';
import {fetchOfficial} from './calendar-http.mjs';
const url='https://brand.example/product/watch';
const now=new Date('2026-10-18T12:00:00Z');
const event=(schedule={precision:'month',value:'2026-10',certainty:'estimated'})=>({id:'one',brand:'Brand',brandKey:'brand',model:'Watch',family:'Family',reference:'123',sourceUrl:url,sourceChecked:'2026-10-01',copy:{hu:{summary:'HU'},en:{summary:'EN'}},lifecycle:{editorial:'approved',identity:{brand:'brand',model:'watch',type:'shipping',market:'global',round:'first',references:['123']},identityVerified:true,allowedSources:[url],sourceStatus:'planned',schedule,evidence:[],history:[],revision:0,verification:null}});
const state=(e,time=now)=>classify(e,new Date(time)).state;
const proof=(e,claim)=>({eventId:e.id,eventType:e.lifecycle.identity.type,claim,url,quote:'Official event-specific evidence',checkedAt:now.toISOString(),publishedAt:'2026-10-18T10:00:00Z',accepted:true});
const observed=(e,patch={})=>({eventId:e.id,identity:e.lifecycle.identity,baseRevision:e.lifecycle.revision,requestedAt:now.toISOString(),sourceStatus:'planned',schedule:{precision:'month',value:'2026-11',certainty:'estimated'},supersedesRevision:e.lifecycle.revision,evidence:proof(e,'planned'),...patch});
test('Exact instant expires at the instant, without claiming occurrence',()=>{
  const e=event({precision:'instant',value:'2026-10-18T14:00:00+02:00',timeZone:'Europe/Budapest'});
  assert.equal(state(e,'2026-10-18T11:59:59Z'),'future');assert.equal(state(e,now),'expired');
  assert.equal(nextTransition([e],new Date('2026-10-18T11:59:59Z')),+now);
});
test('Local calendar days respect both DST changes, not fixed 24-hour addition',()=>{
  for(const [day,hours]of [['2026-03-29',23],['2026-10-25',25]]){
    const e=event({precision:'day',value:day}),w=dateWindow(e.lifecycle.schedule);
    assert.equal((w.end-w.start)/3600000,hours);assert.equal(state(e,w.end-1),'current');assert.equal(state(e,w.end),'expired');
  }
  assert.equal(localMidnight('2026-10-18','America/New_York'),Date.parse('2026-10-18T04:00:00Z'));
});
test('Month, late estimate, quarter and range retain their actual precision',()=>{
  const e=event({precision:'month',value:'2026-12',qualifier:'late',certainty:'estimated'});
  assert.equal(state(e,'2026-12-15'),'current');assert.equal(state(e,'2026-12-31T23:00:00Z'),'expired');
  const label=eventDateLabel(e,'en',{qualifier_late:'late',estimated:'estimated'});
  assert(label.includes('December 2026')&&label.includes('late')&&label.includes('estimated'));assert(!label.includes('31'));
  assert.equal(dateWindow({precision:'quarter',value:'2026-Q4'}).end,Date.parse('2026-12-31T23:00:00Z'));
  assert.equal(dateWindow({precision:'range',value:'2026-10-18',end:'2026-11-04'}).endDay,'2026-11-04');
});
test('Invalid or missing values cannot become dates; timezone mismatch is rejected',()=>{
  for(const schedule of [{precision:'day',value:'2026-02-30'},{precision:'month',value:'December'},{precision:'instant',value:'2026-10-18T10:00:00'},{precision:'instant',value:'2026-10-18T10:00:00Z',timeZone:'Europe/Budapest'}])assert.equal(state(event(schedule)),'review');
  assert.equal(state(event({precision:'unknown'})),'awaiting');
  const e=event();e.lifecycle.verification={issue:'date-conflict'};assert.equal(state(e),'review');assert(!matchesCalendar(e,{},now));
});
test('Private candidates never appear, even in all or no-JS inputs',()=>{
  const e=event();e.lifecycle.editorial='review';assert.equal(state(e),'private');assert(!matchesCalendar(e,{status:'all'},now));
});
test('Outcomes require event-specific accepted evidence; stock never closes shipping',()=>{
  const e=event();e.stock='Out of Stock';assert.equal(state(e),'current');
  e.lifecycle.sourceStatus='occurred';assert.equal(state(e),'review');
  e.lifecycle.evidence=[{...proof(e,'occurred'),eventType:'presentation'}];assert.equal(state(e),'review');
  e.lifecycle.evidence=[proof(e,'occurred')];assert.equal(state(e),'occurred');
  e.lifecycle.evidence.push(proof(e,'cancelled'));assert.equal(state(e),'review');
});
test('Preorder completion leaves later delivery active; indefinite delay clears old date',()=>{
  const e=event(),p=event();p.id='order';p.lifecycle.identity.type='preorder-open';p.lifecycle.sourceStatus='occurred';p.lifecycle.evidence=[proof(p,'occurred')];
  assert.equal(state(p),'occurred');assert.equal(state(e),'current');
  e.lifecycle.sourceStatus='postponed';e.lifecycle.evidence=[proof(e,'postponed')];assert.equal(state(e),'awaiting');assert(!downloadableEvent(e,now));
  e.lifecycle.sourceStatus='cancelled';e.lifecycle.evidence=[proof(e,'cancelled')];assert.equal(state(e),'cancelled');
});
test('Rescheduling is idempotent, preserves ID/history, rejects stale and ambiguous changes',()=>{
  const e=event(),store={schemaVersion:1,version:0,events:{one:e.lifecycle}},o=observed(e);
  const r=applyObservation(store,o);assert(r.changed);assert.equal(r.store.events.one.history[0].schedule.value,'2026-10');assert.equal(Object.keys(r.store.events).length,1);
  assert(!applyObservation(r.store,o).changed);
  assert.equal(applyObservation(store,{...o,evidence:{...o.evidence,publishedAt:undefined}}).reason,'dated-correction-review');
  assert.equal(applyObservation(r.store,{...o,baseRevision:1,requestedAt:'2026-10-17T10:00:00Z'}).reason,'stale-response');
  const changedRound=structuredClone(o);changedRound.identity.round='second';assert.equal(applyObservation(store,changedRound).reason,'identity-review');
  assert.equal(eventIdentity(e.lifecycle.identity),eventIdentity({...e.lifecycle.identity,date:'2099-01-01'}));
});
test('Network/parser failures preserve accepted data and do not prevent expiry',()=>{
  const e=event({precision:'day',value:'2026-10-18'}),store={version:0,events:{one:e.lifecycle}};
  for(const error of ['timeout','404','blocked','empty','parser'])assert.equal(applyObservation(store,{eventId:'one',error}).store,store);
  assert.equal(state(e,'2026-10-18T22:00:00Z'),'expired');
});
test('Overlapping windows, filters, counts, labels and highlight use one clock in both languages',()=>{
  const a=event(),b=event({precision:'day',value:'2026-10-20'});b.id='two';b.brandKey='other';
  assert.deepEqual(focusGroup([b,a],now).map(e=>e.id),['one']); // current beats future
  const later=new Date('2026-10-20T12:00:00Z');assert.equal(focusGroup([b,a],later).length,2);
  for(const lang of ['hu','en']){
    const filters={brand:'other'},visible=[a,b].filter(e=>matchesCalendar(e,filters,later));
    assert.equal(calendarCounts([a,b],later,filters).active,visible.length);assert.deepEqual(focusGroup([a,b],later,filters),visible);
    assert.equal(statusLabel(a,{statusCurrent:lang},later),lang);
  }
  assert.equal(focusGroup([a,b],later,{status:'archived'}).length,0);
  assert.deepEqual(sortCalendar([b,a],later).map(e=>e.id),sortCalendar([a,b],later).map(e=>e.id));
});
test('ICS exports uncertainty as full tentative window, no fabricated release day',()=>{
  const e=event(),copy={'event_shipping':'Shipping',estimated:'estimated',icsUncertain:'Window, not a release day',icsPlanned:'Plan'};
  const raw=buildEventIcs(e,'en',copy);assert(raw.includes('STATUS:TENTATIVE'));assert(raw.includes('DTSTART;VALUE=DATE:20261001'));assert(raw.includes('DTEND;VALUE=DATE:20261101'));assert(raw.includes('SEQUENCE:0'));
  e.lifecycle.schedule={precision:'unknown'};assert(!exportableEvent(e));assert.throws(()=>buildEventIcs(e,'en',copy));
});
test('Conditional HTTP, failed responses and unregistered redirects',async()=>{
  let headers;
  const fetcher=async(u,options)=>{headers=options.headers;return new Response(null,{status:304});};
  assert((await fetchOfficial(url,new Set(['brand.example']),{etag:'version1'},fetcher)).notModified);assert.equal(headers['If-None-Match'],'version1');
  for(const status of [403,404,500])await assert.rejects(fetchOfficial(url,new Set(['brand.example']),{},async()=>new Response(null,{status})));
  await assert.rejects(fetchOfficial(url,new Set(['brand.example']),{},async()=>new Response(null,{status:302,headers:{Location:'https://evil.example/'}})));
});
test('Source parsing fixtures: explicit year, duplicate same claim, conflict, no stock inference',async()=>{
  const fixture=JSON.parse(await readFile('scripts/fixtures/calendar-sources.json','utf8'));
  const e=event(),binding={url,requiredText:['WATCH','First round'],pattern:'Ships (?:(?<qualifier>late) )?(?<month>October|November) (?<year>20[0-9]{2})',certainty:'estimated'};
  const parse=text=>extractBoundEvent(text,binding,e,now.toISOString(),now.toISOString());
  assert.equal(parse(fixture.valid).schedule.value,'2026-10');assert.equal(parse(fixture.valid).sourceStatus,'planned');
  assert.equal(parse(fixture.missingYear).error,'field-not-found');assert.equal(parse(fixture.conflict).error,'conflicting-date-claims');
  assert.equal(parse(fixture.wrongRound).error,'identity-anchor-missing');
});
test('Concurrent writers and out-of-order replies cannot duplicate history',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'lume-calendar-')),path=join(dir,'store.json'),e=event();
  await atomicJson(path,{schemaVersion:1,version:0,events:{one:e.lifecycle}});
  const results=await Promise.allSettled([commitObservation(path,observed(e)),commitObservation(path,observed(e))]);
  assert(results.some(r=>r.status==='fulfilled'));
  const store=JSON.parse(await readFile(path,'utf8'));assert.equal(store.events.one.history.length,1);assert.equal(store.version,1);
});
test('Configurable urgency and error backoff are independent of public classification',()=>{
  const e=event({precision:'instant',value:'2026-10-18T15:00:00+02:00',timeZone:'Europe/Budapest'});
  assert.equal(refreshHours(e,now),1);
  assert(!sourceDue({lastAttemptAt:now.toISOString(),failures:4},[e],new Date(+now+2*3600000),DEFAULT_REFRESH));
  assert.equal(state(e,+now+2*3600000),'expired');
  assert(calendarBoundaryChanged([e],new Date(+now+2*3600000),now));
});
test('Migration preserves source records and does not fabricate completion evidence',async()=>{
  const read=async name=>JSON.parse(await readFile(`src/data/${name}.json`,'utf8'));
  const legacy=[...await read('releases'),...await read('announcements')];
  // Exercise migration itself, not the later, independently reviewed source store.
  const entries=hydrateEvents(legacy);assert.equal(entries.length,legacy.length);
  for(let i=0;i<entries.length;i++){assert.equal(entries[i].id,legacy[i].id);assert.deepEqual(entries[i].copy,legacy[i].copy);assert(!entries[i].lifecycle.evidence.some(e=>e.claim==='occurred'));}
});

test('October horizon refresh retains primary evidence, uncertain windows and review limits',async()=>{
  const read=async name=>JSON.parse(await readFile(`src/data/${name}.json`,'utf8'));
  const store=await read('calendar-events'),releases=await read('releases'),announcements=await read('announcements');
  const entries=hydrateEvents([...releases,...announcements],store);
  const ids=['citizen-attesa-ever-since-2026','citizen-series8-damascus-2026','citizen-washi-limited-2026','grand-seiko-hi-beat-2026','cw-c1-loco-classic-gold-2026','kurono-calendrier-sbr-delivery-2026','seiko-panda-collection2-2026','seiko-edo-purple-2026'];
  for(const id of ids){const e=entries.find(e=>e.id===id);assert(e);assert.equal(e.lifecycle.schedule.precision,'month');assert.equal(e.lifecycle.evidence[0].eventId,id);assert(e.lifecycle.evidence[0].quote);
    if(e.lifecycle.verification?.issue){assert.equal(state(e),'review');assert(!exportableEvent(e));}
    else assert(['current','future'].includes(state(e)));
  }
  for(const id of ['baltic-hermetique-rift-delivery','casio-mrg-d5000-sapphire-2026']){const e=entries.find(e=>e.id===id);assert.equal(state(e),'awaiting');assert(!exportableEvent(e));}
  const stratton=entries.find(e=>e.id==='farer-stratton-restock-late-2026');
  assert.equal(state(stratton),'review');assert(!exportableEvent(stratton));
  assert.equal(stratton.lifecycle.schedule.precision,'unknown');
  assert.equal(stratton.lifecycle.schedule.originalText,'RETURNS LATE 2026');
  assert.equal(stratton.lifecycle.verification.proposal.schedule.precision,'unknown');
  assert.equal(stratton.lifecycle.verification.proposal.evidence.quote,'PRE ORDER FROM 29TH OCTOBER');
  assert.equal(stratton.lifecycle.verification.proposal.evidence.accepted,false);
  assert(stratton.lifecycle.history.some(h=>h.schedule.originalText==='RETURNS LATE 2026'));
  for(const id of ['omega-james-bond-spectre-2026','christopher-ward-c60-trident-biscay','rolex-oyster-perpetual-41-2026','tudor-northflag-2026']){const e=entries.find(e=>e.id===id);assert.equal(state(e),'occurred');assert(e.lifecycle.history.some(h=>h.verification?.issue==='legacy-completion-unverified'));assert(!exportableEvent(e));}
  const meta=await read('calendar-meta');assert.equal(meta.lastReviewed,'2026-09-06');assert(/^\d{4}-\d{2}-\d{2}$/.test(meta.lastTargetedReview));assert(meta.lastTargetedReview>='2026-10-18'&&Date.parse(meta.lastTargetedReview)<=Date.now());assert.equal(meta.targetThrough,'2026-12-31');assert.equal(meta.targetedReviewStatus,'partial');
  assert.equal(entries.length,new Set(entries.map(e=>e.id)).size);
});
test('Daily unchanged verification updates freshness, not revision or history',()=>{
  const e=event(),store={version:0,events:{one:e.lifecycle}};
  const o=observed(e,{schedule:e.lifecycle.schedule});
  const first=applyObservation(store,o);assert.equal(first.reason,'verified-unchanged');
  assert.equal(first.store.events.one.revision,0);assert.equal(first.store.events.one.history.length,0);
  assert.equal(applyObservation(first.store,o).reason,'unchanged');
});
test('Contradictory extracted dates remove active visibility while preserving accepted plan',()=>{
  const e=event(),store={version:0,events:{one:e.lifecycle}};
  const next=flagEventReview(store,e,{checkedAt:now.toISOString(),quotes:['Ships October 2026','Ships November 2026']},'conflicting-date-claims');
  assert.equal(next.events.one.schedule.value,'2026-10');assert.equal(next.events.one.history.length,1);
  assert.equal(state({...e,lifecycle:next.events.one}),'review');
  assert.equal(flagEventReview(next,{...e,lifecycle:next.events.one},{},'conflicting-date-claims'),next);
});
test('Official dated cancellation and indefinite postponement save evidence and prior plan',()=>{
  for(const claim of ['cancelled','postponed']){
    const e=event(),store={version:0,events:{one:e.lifecycle}};
    const o=observed(e,{sourceStatus:claim,schedule:claim==='postponed'?{precision:'unknown'}:e.lifecycle.schedule,evidence:proof(e,claim)});
    const r=applyObservation(store,o);assert(r.changed);assert.equal(r.store.events.one.history[0].schedule.value,'2026-10');
    assert.equal(state({...e,lifecycle:r.store.events.one}),claim==='cancelled'?'cancelled':'awaiting');
  }
});
