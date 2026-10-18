import { readFile, writeFile, access } from 'node:fs/promises';
import { legacyLifecycle } from '../src/lib/calendar-events.mjs';
const target='src/data/calendar-events.json';
try {await access(target);console.log('Already migrated; no overwrite.');process.exit(0);}catch(e){if(e.code!=='ENOENT')throw e;}
const entries=[...JSON.parse(await readFile('src/data/releases.json','utf8')),...JSON.parse(await readFile('src/data/announcements.json','utf8'))];
const events=Object.fromEntries(entries.map(entry=>[entry.id,legacyLifecycle(entry)]));
// Explicit, reviewed interpretations of existing bilingual records. No new source claims.
const lorier=events['lorier-astra-october-preorder-2026'];
lorier.schedule={...lorier.schedule,precision:'instant',value:'2026-10-05T13:00:00-04:00',timeZone:'America/New_York'};
const december=events['lorier-astra-december-delivery-2026'];
Object.assign(december.schedule,{qualifier:'late',certainty:'estimated'});
const mantis=events['studio-underd0g-mantis-2026'];
mantis.identity.type='order-window';
mantis.schedule={...mantis.schedule,precision:'duration',value:'2026-09-01T15:00:00+01:00',end:'2026-09-02T00:00:00+01:00',timeZone:'Europe/London',kind:'duration'};
events['zenith-chronomaster-original-paris-boutiques'].identity.market='Paris boutiques';
events['rath-droma-gmt-founder-series'].verification={issue:'date-conflict',reason:'Existing reviewed copy records October in the summary and late September in the description.',recordedAt:'2026-10-13',sourceUrl:'https://rathwatches.com/products/rath-droma-gmt'};
const store={schemaVersion:1,version:0,events};
// Additive migration: source arrays, IDs, copy, decisions and old precision remain intact.
await writeFile(target,JSON.stringify(store,null,2)+'\n',{flag:'wx'});
console.log(`Migrated ${entries.length} events, without asserting occurrence or re-verifying sources.`);
