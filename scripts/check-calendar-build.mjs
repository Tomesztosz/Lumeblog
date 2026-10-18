import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { hydrateEvents, dateWindow } from '../src/lib/calendar-events.mjs';
import { exportableEvent } from '../src/lib/calendar-ics.mjs';
const json=async name=>JSON.parse(await readFile(`src/data/${name}.json`,'utf8'));
const entries=hydrateEvents([...await json('releases'),...await json('announcements')],await json('calendar-events'));
let count=0;
for(const prefix of ['naptar','en/calendar']) {
  for(const entry of entries) {
    const path=`dist/${prefix}/${entry.id}.ics`;
    if(!exportableEvent(entry)){
      let exists=true;try{await access(path);}catch(e){if(e.code!=='ENOENT')throw e;exists=false;}
      assert(!exists,`${entry.id}: invalid or undated export`);continue;
    }
    const raw=await readFile(path,'utf8'),text=raw.replace(/\r\n[ \t]/g,'');
    const w=dateWindow(entry.lifecycle.schedule);
    assert(text.includes(`UID:${entry.id}@lumejournal.com`));
    assert(text.includes(`SEQUENCE:${entry.lifecycle.revision}`));
    if(w.startDay)assert(text.includes(`DTSTART;VALUE=DATE:${w.startDay.replaceAll('-','')}`));
    else assert(text.includes(`DTSTART:${new Date(w.start).toISOString().replace(/[-:]/g,'').replace('.000Z','Z')}`));
    if(['month','quarter','range'].includes(w.precision))assert(text.includes('STATUS:TENTATIVE')||text.includes('STATUS:CANCELLED'));
    for(const line of raw.split('\r\n'))assert(Buffer.byteLength(line)<=75,`${entry.id}: long line`);
    count++;
  }
}
console.log(`Calendar output OK: ${count} precision-aware bilingual ICS files.`);
