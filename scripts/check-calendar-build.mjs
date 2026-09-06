import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
const releases=JSON.parse(await readFile('src/data/releases.json','utf8'));
const announcements=JSON.parse(await readFile('src/data/announcements.json','utf8'));
for(const prefix of ['naptar','en/calendar']) {
  for(const entry of releases) {
    const raw=await readFile(`dist/${prefix}/${entry.id}.ics`,'utf8');
    const text=raw.replace(/\r\n[ \t]/g,'');
    assert(text.includes(`DTSTART;VALUE=DATE:${entry.date.replaceAll('-','')}`));
    const end=new Date(entry.dateEnd);end.setUTCDate(end.getUTCDate()+1);
    assert(text.includes(`DTEND;VALUE=DATE:${end.toISOString().slice(0,10).replaceAll('-','')}`));
    for(const line of raw.split('\r\n'))assert(Buffer.byteLength(line)<=75,`${entry.id}: unfolded long line`);
  }
  for(const entry of announcements) {
    let exists=true;
    try { await access(`dist/${prefix}/${entry.id}.ics`); } catch(error) { if(error.code!=='ENOENT')throw error;exists=false; }
    assert(!exists,`${entry.id}: undated announcement produced ICS`);
  }
}
console.log(`Calendar output OK: ${releases.length*2} valid bilingual ICS files; undated announcements have no fake events.`);
