import { classifyCalendarEvent, legacyLifecycle, SITE_ZONE } from './calendar-events.mjs';
export { classifyCalendarEvent, nextTransition, eventDateLabel } from './calendar-events.mjs';
export const RECENT_DAYS=14, SOURCE_RECHECK_DAYS=14;
export function calendarDay(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA',{timeZone:SITE_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
const age=(day,now)=>typeof day==='string'?(Date.parse(calendarDay(now))-Date.parse(day.slice(0,10)))/86400000:Infinity;
export function phaseFor(entry,now=new Date()) {
  return ({future:'upcoming',current:'current',awaiting:'announced',review:'review',private:'private'})[classifyCalendarEvent(entry,now).state]||'archived';
}
export function daysAway(entry,now=new Date()) {
  const c=classifyCalendarEvent(entry,now);
  return c.window?.precision==='day'?Math.max(0,-age(c.window.startDay,now)):null;
}
export function isRecent(entry,now=new Date()) {
  const c=classifyCalendarEvent(entry,now);
  if(!['expired','occurred','cancelled'].includes(c.state)) return false;
  const stamp=c.state==='expired'?c.window.end:(entry.lifecycle?.evidence||[]).find(e=>e.accepted&&e.claim===c.state)?.checkedAt;
  const elapsed=+now-+new Date(stamp);
  return elapsed>=0&&elapsed<RECENT_DAYS*86400000;
}
export function needsSourceReview(entry,now=new Date()) {
  return classifyCalendarEvent(entry,now).state==='review'||age(entry.lifecycle?.semanticVerifiedAt||entry.sourceChecked,now)>SOURCE_RECHECK_DAYS;
}
export function matchesCalendar(entry,filters={},now=new Date()) {
  const c=classifyCalendarEvent(entry,now),status=filters.status||'active';
  if(!c.public) return false;
  const match=status==='all'||(['active','overview'].includes(status)&&c.active)||(status==='announced'&&c.state==='awaiting')||(status==='review'&&c.state==='review')||(status==='archived'&&['expired','occurred','cancelled'].includes(c.state))||(['recent','introduced'].includes(status)&&isRecent(entry,now));
  const month=filters.month||'all', fold=s=>String(s).normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
  const search=fold(`${entry.brand} ${entry.family} ${entry.model} ${entry.reference}`);
  const monthMatch=month==='all'||(month==='undated'?!c.window:c.window?.startDay?c.window.startDay.slice(0,7)<=month&&c.window.endDay.slice(0,7)>=month:entry.lifecycle?.schedule?.value?.slice(0,7)===month);
  return match&&monthMatch&&(!filters.brand||filters.brand==='all'||entry.brandKey===filters.brand)&&fold(filters.query||'').trim().split(/\s+/).every(word=>search.includes(word));
}
export function sortCalendar(entries,now=new Date()) {
  const classified=new Map(entries.map(e=>[e,classifyCalendarEvent(e,now)]));
  const rank={current:0,future:1,awaiting:2,review:3,expired:4,occurred:4,cancelled:4,private:5};
  return [...entries].sort((a,b)=>{
    const x=classified.get(a),y=classified.get(b);
    return rank[x.state]-rank[y.state]||(x.window?.start||0)-(y.window?.start||0)||String(a.id).localeCompare(String(b.id));
  });
}
export function calendarCounts(entries,now=new Date(),filters={}) {
  return Object.fromEntries(['active','recent','announced','archived','review','all'].map(status=>[status,entries.filter(e=>matchesCalendar(e,{...filters,status},now)).length]));
}
export function focusGroup(entries,now=new Date(),filters={}) {
  const candidates=sortCalendar(entries.filter(e=>matchesCalendar(e,filters,now)&&classifyCalendarEvent(e,now).active),now);
  if(!candidates.length) return [];
  const first=classifyCalendarEvent(candidates[0],now);
  let end=first.window.end;
  const group=[candidates[0]];
  for(const e of candidates.slice(1)) {
    const c=classifyCalendarEvent(e,now);
    if(c.state!==first.state||(c.window.start>=end&&c.window.start!==first.window.start)) break;
    group.push(e);end=Math.max(end,c.window.end);
  }
  return group;
}
export function focusEntry(entries,now=new Date()) {return focusGroup(entries,now)[0]||null;}
export function calendarBoundaryChanged(entries,now,previous) {
  return entries.some(e=>classifyCalendarEvent(e,now).state!==classifyCalendarEvent(e,previous).state||needsSourceReview(e,now)!==needsSourceReview(e,previous)||isRecent(e,now)!==isRecent(e,previous));
}
export function statusLabel(entry,copy,now=new Date()) {
  const c=classifyCalendarEvent(entry,now),e=entry.lifecycle||legacyLifecycle(entry);
  if(c.state==='review')return copy.statusReview;
  if(c.state==='awaiting')return copy.announced;
  if(c.state==='cancelled')return copy.statusCancelled;
  if(c.state==='occurred')return copy[`completed_${e.identity.type}`];
  if(c.state==='expired')return copy.statusArchived;
  if(c.state==='current')return c.window.kind==='duration'?copy.statusOrderWindow:copy.statusCurrent;
  if(c.state==='future')return copy.statusUpcoming;
  return '';
}
