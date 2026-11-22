import { readFile, writeFile } from 'node:fs/promises';
import { fetchOfficial } from './scripts/calendar-http.mjs';
import { extractSource } from './scripts/radar-core.mjs';
const out='C:/Users/tyler/AppData/Local/Temp/claude/C--Users-tyler-AppData-Local-Temp-tls-agent-Lumeblog-1795336228605/2b439012-36cd-450d-9a65-58cfe17662a9/scratchpad/sources';
const report=JSON.parse(await readFile('.calendar-radar/report.json','utf8'));
const urls=[...new Set(report.reviews.map(r=>r.url))];
for(const url of urls){
  const host=new URL(url).hostname;
  try{
    const f=await fetchOfficial(url,new Set([host]),{});
    const e=extractSource(f.html,f.url);
    const name=url.replace(/https:\/\//,'').replace(/[^a-z0-9]+/gi,'_').slice(0,90);
    await writeFile(`${out}/${name}.txt`,`URL: ${url}\nHASH: ${e.hash}\nSTATUS: ${e.status} CHARS: ${e.characters}\n\n${e.text}\n`);
    console.log('ok',url,e.hash.slice(0,12),e.characters);
  }catch(err){console.log('ERR',url,err.message);}
  await new Promise(r=>setTimeout(r,1600));
}
