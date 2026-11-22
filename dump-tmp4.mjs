import { fetchOfficial } from './scripts/calendar-http.mjs';
import { extractSource } from './scripts/radar-core.mjs';
const urls=['https://www.seikowatches.com/us-en/products/5sports/hdb010','https://www.lorierwatches.com/products/watch-astra-white-nodate-bracelet-278081','https://www.christopherward.com/int/atelier-watches/C1-Loco-Classic/C01-41H6D1-S00A0-VT.html','https://farer.com/products/stratton','https://rathwatches.com/products/rath-droma-gmt','https://baltic-watches.com/en/products/hermetique-the-rift','https://underd0g.com/','https://pressroom.zenith-watches.com/paris-on-the-horizon-zenith-unveils-the-chronomaster-original-paris-edition/?lang=eng','https://press.iwc.com/','https://press.jaeger-lecoultre.com/'];
for(const url of urls){
  const host=new URL(url).hostname;const h=[];
  for(let i=0;i<2;i++){
    try{const f=await fetchOfficial(url,new Set([host]),{});const e=extractSource(f.html,f.url);h.push(e.hash.slice(0,12)+'/'+e.characters);}catch(err){h.push('ERR:'+err.message);}
    await new Promise(r=>setTimeout(r,1700));
  }
  console.log((h[0]===h[1]?'STABLE  ':'VOLATILE'),url,h.join('  '));
}
