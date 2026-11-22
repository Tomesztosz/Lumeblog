import { writeFile } from 'node:fs/promises';
import { fetchOfficial } from './scripts/calendar-http.mjs';
import { extractSource } from './scripts/radar-core.mjs';
const out='C:/Users/tyler/AppData/Local/Temp/claude/C--Users-tyler-AppData-Local-Temp-tls-agent-Lumeblog-1795336228605/2b439012-36cd-450d-9a65-58cfe17662a9/scratchpad/sources';
const urls=['https://www.christopherward.com/int/atelier-watches/C1-Loco-Classic/C01-41H6D1-S00A0-VT.html','https://www.christopherward.com/int/trident-biscay.html','https://press.omegawatches.com/omega-introduces-the-seamaster-diver-300m-james-bond-and-spectre-collection/'];
for(const url of urls){
  const host=new URL(url).hostname;
  try{
    const f=await fetchOfficial(url,new Set([host]),{});
    const e=extractSource(f.html,f.url);
    const name=url.replace(/https:\/\//,'').replace(/[^a-z0-9]+/gi,'_').slice(0,90);
    await writeFile(`${out}/${name}.txt`,`URL: ${url}\nHASH: ${e.hash}\nSTATUS: ${e.status} CHARS: ${e.characters}\n\n${e.text}\n`);
    console.log('ok',url,e.hash,e.characters);
  }catch(err){console.log('ERR',url,err.message);}
  await new Promise(r=>setTimeout(r,1600));
}
