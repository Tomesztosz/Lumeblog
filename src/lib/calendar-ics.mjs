import { dateWindow, legacyLifecycle, classifyCalendarEvent, eventDateLabel } from './calendar-events.mjs';
import { foldIcsLine } from './ical-lines.mjs';
export function exportableEvent(entry) {
  const e=entry.lifecycle||legacyLifecycle(entry);
  if(e.editorial!=='approved'||e.verification||e.sourceStatus==='postponed')return false;
  try{return !!dateWindow(e.schedule);}catch{return false;}
}
export function downloadableEvent(entry,now) {
  return exportableEvent(entry)&&classifyCalendarEvent(entry,now).active;
}
const escape=value=>String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const stamp=value=>new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z');
export function buildEventIcs(entry,lang,copy) {
  if(!exportableEvent(entry))throw Error('No trustworthy export window');
  const e=entry.lifecycle||legacyLifecycle(entry),w=dateWindow(e.schedule);
  const dateLines=['instant','duration'].includes(w.precision)?[`DTSTART:${stamp(w.start)}`,...(w.kind==='duration'?[`DTEND:${stamp(w.end)}`]:[])]:[`DTSTART;VALUE=DATE:${w.startDay.replaceAll('-','')}`,`DTEND;VALUE=DATE:${new Date(Date.parse(w.endDay+'T00:00:00Z')+86400000).toISOString().slice(0,10).replaceAll('-','')}`];
  const checked=e.semanticVerifiedAt||`${entry.sourceChecked}T00:00:00Z`;
  const uncertain=!['instant','day','duration'].includes(w.precision)||e.schedule.certainty==='estimated';
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Lume Journal//Release Calendar//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',`UID:${entry.id}@lumejournal.com`,`DTSTAMP:${stamp(checked)}`,`LAST-MODIFIED:${stamp(checked)}`,`SEQUENCE:${e.revision||0}`,...dateLines,
    `SUMMARY:${escape(`${copy['event_'+e.identity.type]}: ${entry.brand} ${entry.model}`)}`,
    `DESCRIPTION:${escape(`${eventDateLabel(entry,lang,copy)}\n${uncertain?copy.icsUncertain:copy.icsPlanned}\n${entry.sourceUrl}`)}`,
    `URL:${entry.sourceUrl}`,'TRANSP:TRANSPARENT',`STATUS:${e.sourceStatus==='cancelled'?'CANCELLED':uncertain?'TENTATIVE':'CONFIRMED'}`,
    `X-LUME-PRECISION:${e.schedule.precision}`,`X-LUME-SOURCE-STATUS:${e.sourceStatus}`,'END:VEVENT','END:VCALENDAR',''].map(foldIcsLine).join('\r\n');
}
