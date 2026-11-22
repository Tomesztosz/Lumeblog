import { fetchOfficial } from './scripts/calendar-http.mjs';
import { extractSource } from './scripts/radar-core.mjs';
const url='https://press.omegawatches.com/omega-introduces-the-seamaster-diver-300m-james-bond-and-spectre-collection/';
const texts=[];
for(let i=0;i<2;i++){
  const f=await fetchOfficial(url,new Set(['press.omegawatches.com']),{});
  const e=extractSource(f.html,f.url);texts.push(e.text);console.log(i,e.hash.slice(0,16),e.characters);
  await new Promise(r=>setTimeout(r,2000));
}
const a=texts[0].split(' '),b=texts[1].split(' ');
for(let i=0;i<Math.max(a.length,b.length);i++) if(a[i]!==b[i]) console.log('DIFF @'+i,JSON.stringify(a.slice(Math.max(0,i-12),i+12).join(' ')),'||',JSON.stringify(b.slice(Math.max(0,i-12),i+12).join(' ')));
