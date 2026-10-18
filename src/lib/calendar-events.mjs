// Dependency-free domain logic shared by build, browser and source worker.
export const SITE_ZONE = 'Europe/Budapest';
export const EVENT_TYPES = ['presentation', 'sales', 'preorder-open', 'preorder-close', 'shipping', 'restock', 'order-window'];
export function validDay(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function validInstant(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(value)) return false;
  return validDay(value.slice(0,10)) && Number.isFinite(Date.parse(value)) && +value.slice(11,13) < 24 && +value.slice(14,16) < 60;
}
function parts(ms, timeZone) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone, year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23' }).formatToParts(new Date(ms)).filter(p=>p.type!=='literal').map(p=>[p.type,+p.value]));
}
export function localMidnight(day, zone = SITE_ZONE) {
  if (!validDay(day)) throw Error('Invalid calendar day');
  const target = Date.parse(`${day}T00:00:00Z`);
  let result = target;
  for (let i=0;i<5;i++) {
    const p = parts(result, zone);
    const delta = target - Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);
    if (!delta) return result;
    result += delta;
  }
  throw Error('Unresolvable local midnight');
}
export function nextDay(day) {
  if (!validDay(day)) throw Error('Invalid day');
  const date = new Date(`${day}T00:00:00Z`); date.setUTCDate(date.getUTCDate()+1);
  return date.toISOString().slice(0,10);
}
const monthEnd = (year,month) => new Date(Date.UTC(year,month,0)).toISOString().slice(0,10);
export function dateWindow(schedule, config = {}) {
  const s = schedule;
  if (!s || s.precision === 'unknown') return null;
  const zone = s.timeZone || config.timeZone || SITE_ZONE;
  // Validate IANA zone even for instants, which must also carry an explicit offset.
  parts(0,zone);
  if (s.precision === 'instant' || s.precision === 'duration') {
    if (!validInstant(s.value) || !s.timeZone) throw Error('Exact time requires an offset and source time zone');
    const start = Date.parse(s.value);
    const p=parts(start,zone);
    if (p.year!==+s.value.slice(0,4)||p.month!==+s.value.slice(5,7)||p.day!==+s.value.slice(8,10)||p.hour!==+s.value.slice(11,13)||p.minute!==+s.value.slice(14,16)) throw Error('Offset disagrees with source zone');
    const end = s.precision === 'duration' ? Date.parse(s.end) : start;
    if (s.precision==='duration' && (!validInstant(s.end)||end<=start)) throw Error('Invalid duration');
    return { start,end,zone,precision:s.precision,kind:s.precision==='duration'?'duration':'instant' };
  }
  let startDay, endDay;
  if (s.precision==='day') { startDay=s.value;endDay=s.value; }
  else if (s.precision==='month') {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(s.value)) throw Error('Invalid month');
    startDay=`${s.value}-01`;endDay=monthEnd(+s.value.slice(0,4),+s.value.slice(5));
  } else if (s.precision==='quarter') {
    if (!/^\d{4}-Q[1-4]$/.test(s.value)) throw Error('Invalid quarter');
    const month=(+s.value.at(-1)-1)*3+1;
    startDay=`${s.value.slice(0,4)}-${String(month).padStart(2,'0')}-01`;endDay=monthEnd(+s.value.slice(0,4),month+2);
  } else if(s.precision==='range') { startDay=s.value;endDay=s.end; }
  else throw Error('Unsupported date precision');
  if (!validDay(startDay)||!validDay(endDay)||endDay<startDay) throw Error('Invalid calendar window');
  return {start:localMidnight(startDay,zone),end:localMidnight(nextDay(endDay),zone),startDay,endDay,zone,precision:s.precision,kind:s.kind||'uncertainty'};
}
export function eventIdentity(identity) {
  if (!identity || !EVENT_TYPES.includes(identity.type) || !identity.brand || !identity.model || !identity.market || !identity.round) return null;
  return JSON.stringify([identity.brand,identity.model,[...(identity.references||[])].sort(),identity.type,identity.market,identity.edition||'',identity.round]);
}
export function legacyLifecycle(entry) {
  const type=entry.eventType==='delivery'?'shipping':entry.eventType==='preorder'?'preorder-open':entry.date?'sales':'presentation';
  return {
    editorial:'approved', identity:{brand:entry.brandKey,model:entry.family||entry.model,references:[entry.reference],type,market:'unspecified',round:`legacy:${entry.id}`},
    identityVerified:false, sourceStatus:'planned', schedule:entry.date?{precision:entry.precision||'range',value:entry.precision==='month'?entry.date.slice(0,7):entry.date,...((entry.precision!=='month'&&entry.dateEnd!==entry.date)?{precision:'range',end:entry.dateEnd}:{}),certainty:entry.confirmed?'confirmed':'estimated',originalText:null,legacyLabels:{hu:entry.copy?.hu?.dateLabel,en:entry.copy?.en?.dateLabel}}:{precision:'unknown'},
    verification:entry.status==='introduced'||entry.completedOn?{issue:'legacy-completion-unverified',reason:'The original record has no event-specific completion evidence.'}:null,
    evidence:[],history:[],revision:0,editorialReviewedAt:entry.sourceChecked,
  };
}
export function hydrateEvents(entries, store = {events:{}}) {
  return entries.map(entry=>({...entry,lifecycle:store.events?.[entry.id] || entry.lifecycle || legacyLifecycle(entry)}));
}
function proof(entry, claim) {
  const e=entry.lifecycle;
  return (e.evidence||[]).filter(p=>p.accepted===true && p.eventId===entry.id && p.eventType===e.identity.type && p.claim===claim && p.quote?.trim() && /^https:\/\//.test(p.url) && validInstant(p.checkedAt));
}
export function classifyCalendarEvent(entry, now, config = {}) {
  const time = +new Date(now);
  if (!Number.isFinite(time)) throw Error('A valid explicit clock is required');
  const e=entry.lifecycle||legacyLifecycle(entry);
  const event={...entry,lifecycle:e};
  const result=(state,reason=null,window=null)=>({state,reason,window,active:['future','current'].includes(state),public:e.editorial==='approved',nextTransition:window?(time<window.start?window.start:time<window.end?window.end:null):null});
  if(e.editorial!=='approved') return result('private');
  const completed=proof(event,'occurred'), cancelled=proof(event,'cancelled');
  if(completed.length&&cancelled.length) return result('review','conflicting-outcomes');
  if(completed.length) return result('occurred');
  if(cancelled.length) return result('cancelled');
  if(e.verification?.issue) return result('review',e.verification.issue);
  if(['occurred','cancelled'].includes(e.sourceStatus)) return result('review','missing-outcome-evidence');
  if(e.sourceStatus==='postponed') return proof(event,'postponed').length?result('awaiting'):result('review','missing-postponement-evidence');
  let window;
  try { window=dateWindow(e.schedule,config); } catch(error) { return result('review',error.message); }
  if(!window) return result('awaiting');
  return result(time<window.start?'future':time<window.end?'current':'expired',null,window);
}
export function eventDateLabel(entry, lang, copy) {
  const e=entry.lifecycle||legacyLifecycle(entry), s=e.schedule;
  if(e.sourceStatus==='postponed'||!s||s.precision==='unknown') return copy.announced;
  if(s.legacyLabels?.[lang] && !['instant','duration'].includes(s.precision)) return s.legacyLabels[lang];
  let w;
  try {w=dateWindow(s);}catch{return copy.statusReview;}
  const locale=lang==='hu'?'hu-HU':'en-GB';
  const format=(ms,options)=>new Intl.DateTimeFormat(locale,{timeZone:SITE_ZONE,...options}).format(new Date(ms));
  let label;
  if(['instant','duration'].includes(s.precision)) label=format(w.start,{dateStyle:'long',timeStyle:'short'})+` (${SITE_ZONE})`+(s.precision==='duration'?` / ${format(w.end,{dateStyle:'long',timeStyle:'short'})}`:'');
  else if(s.precision==='month') label=format(Date.parse(`${s.value}-15T12:00:00Z`),{year:'numeric',month:'long'});
  else if(s.precision==='quarter') label=s.value;
  else label=s.value+(s.precision==='range'?` / ${s.end}`:'');
  return [label,s.qualifier?copy[`qualifier_${s.qualifier}`]:null,s.certainty==='estimated'?copy.estimated:null].filter(Boolean).join(', ');
}
export function nextTransition(entries, now) {
  const times=entries.map(e=>classifyCalendarEvent(e,now).nextTransition).filter(t=>t!=null);
  return times.length?Math.min(...times):null;
}
