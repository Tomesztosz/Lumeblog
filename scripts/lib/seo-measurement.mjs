import {createHash} from 'node:crypto';

const DAY=86400000;
export const MEASUREMENT_POLICY=Object.freeze({minimumImpressions:100,declineWeight:1});
const SEARCH_SURFACES=['web','image','multimodal','discover'];
export function csvRows(text, delimiter=',') {
  if(![',',';','\t'].includes(delimiter))throw new Error('Unsupported delimiter');
  const rows=[];let row=[],value='',quoted=false,closed=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(quoted){if(c==='"'){if(text[i+1]==='"'){value+='"';i++;}else{quoted=false;closed=true;}}else value+=c;continue;}
    if(c==='"'){if(value||closed)throw new Error('Invalid CSV quoting');quoted=true;continue;}
    if(c===delimiter||c==='\n'||c==='\r') {
      row.push(value);value='';closed=false;
      if(c!==delimiter){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(cell=>cell!==''))rows.push(row);row=[];}
      continue;
    }
    if(closed)throw new Error('Unexpected character after CSV quote');
    value+=c;
  }
  if(quoted)throw new Error('Unclosed CSV quote');
  if(value||closed||row.length){row.push(value);if(row.some(cell=>cell!==''))rows.push(row);}
  if(rows.length<1)throw new Error('Empty CSV');
  const header=rows.shift();if(new Set(header).size!==header.length)throw new Error('Duplicate CSV header');
  if(rows.some(row=>row.length!==header.length))throw new Error('CSV row width mismatch');
  return {header,rows};
}
export function isoDay(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)throw new Error('Invalid calendar date');
  return value;
}
function count(value, optional=false) {
  if(value===''&&optional)return null;
  if(typeof value!=='string'||!/^\d+(?:\.\d+)?$/.test(value))throw new Error('Missing or non-numeric metric; use unformatted dot-decimal values');
  const n=Number(value);if(!Number.isFinite(n)||n<0)throw new Error('Invalid metric');return n;
}
export function validateManifest(m, now=new Date()) {
  if(m.version!==1||!['google-search-console','bing-webmaster-tools'].includes(m.source))throw new Error('Unsupported measurement manifest');
  const ai=['google-ai-search','google-ai-discover','bing-ai'].includes(m.surface);
  if(!SEARCH_SURFACES.includes(m.surface)&&!ai)throw new Error('Unsupported search surface');
  if((m.surface.startsWith('google-')&&m.source!=='google-search-console')||(m.surface==='bing-ai'&&m.source!=='bing-webmaster-tools'))throw new Error('Surface and source disagree');
  if(m.source==='bing-webmaster-tools'&&!['web','image','bing-ai'].includes(m.surface))throw new Error('Unsupported Bing surface');
  if(!m.property||new URL(m.property).origin!=='https://lumejournal.com')throw new Error('Wrong property origin; ownership must be verified separately');
  if(!m.timezone||!m.filters||typeof m.filters!=='object'||Array.isArray(m.filters))throw new Error('Missing timezone or exact export filters');
  try{new Intl.DateTimeFormat('en',{timeZone:m.timezone});}catch{throw new Error('Invalid reporting timezone');}
  isoDay(m.start);isoDay(m.end);
  const reportingDay=date=>new Intl.DateTimeFormat('en-CA',{timeZone:m.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
  if(m.start>m.end||m.end>=reportingDay(now))throw new Error('Invalid or incomplete measurement period');
  if(!Number.isFinite(Date.parse(m.exportedAt))||Date.parse(m.exportedAt)>+now||Date.parse(m.exportedAt)<Date.parse(m.end))throw new Error('Invalid export timestamp');
  if(reportingDay(new Date(m.exportedAt))<=m.end)throw new Error('Export predates the close of its declared reporting period');
  if(!Array.isArray(m.grain)||!m.grain.includes('url')||m.grain.some(k=>!['date','url','query','device','country'].includes(k))||new Set(m.grain).size!==m.grain.length)throw new Error('Declare exact row grain, including url');
  if(!m.columns||typeof m.columns!=='object'||Array.isArray(m.columns)||Object.values(m.columns).some(v=>typeof v!=='string'||!v))throw new Error('Missing column mapping');
  if(m.coverage!=='reported-rows')throw new Error('Only explicit reported-rows coverage is supported; no full-site total assumed');
  const required=m.surface==='bing-ai'?['citations']:ai?['impressions']:['clicks','impressions'];
  if(!Array.isArray(m.metrics)||new Set(m.metrics).size!==m.metrics.length||required.some(k=>!m.metrics.includes(k))||m.metrics.some(k=>![...required,...(!ai?['position']:[])].includes(k)))throw new Error('Metrics not supported by this report; AI citations are not clicks or rank');
  if([...m.grain,...m.metrics].some(k=>!m.columns[k]))throw new Error('Unmapped dimension or metric');
  if(new Set(Object.values(m.columns)).size!==Object.values(m.columns).length)throw new Error('Ambiguous column mapping');
  return m;
}
export function importMeasurement(csv, manifest, {now=new Date()}={}) {
  const m=validateManifest(manifest,now),{header,rows}=csvRows(csv,m.delimiter??',');
  const fields=[...m.grain,...m.metrics];
  if(fields.some(k=>!header.includes(m.columns[k])))throw new Error('Export headers do not match manifest');
  const used=new Set(),warnings=new Set(['Only reported rows are counted. Query anonymisation, export limits and selected filters may omit data.']);
  const records=rows.map((row,index)=>{
    const r=Object.fromEntries(fields.map(k=>[k,row[header.indexOf(m.columns[k])]]));
    let url;try{url=new URL(r.url);}catch{throw new Error(`Invalid page URL at row ${index+2}`);}
    if(url.origin!=='https://lumejournal.com'||url.username||url.password||url.search||url.hash||!url.pathname.endsWith('/'))throw new Error(`Expected a canonical Lume page URL at row ${index+2}`);
    if(m.grain.includes('date')&&(isoDay(r.date)<m.start||r.date>m.end))throw new Error('Row outside declared period');
    const key=JSON.stringify(m.grain.map(k=>r[k]));if(used.has(key))throw new Error(`Duplicate grain at row ${index+2}; do not combine overlapping exports`);used.add(key);
    for(const k of m.metrics)r[k]=count(r[k],k==='position');
    for(const k of ['clicks','impressions','citations'])if(r[k]!=null&&!Number.isSafeInteger(r[k]))throw new Error('Counts must be safe integers');
    if(r.clicks!=null&&r.clicks>r.impressions)throw new Error('Clicks exceed impressions');
    if(r.position!=null&&r.position<1)throw new Error('Invalid average position');
    if(m.metrics.includes('position')&&r.impressions>0&&r.position===null)warnings.add('Some impressions have no average position. Position coverage is partial.');
    return r;
  });
  if(!records.length)warnings.add('No rows were supplied; this is not evidence of zero visibility.');
  if(m.surface.startsWith('google-ai'))warnings.add('AI impressions are a dedicated view included in overall performance. Never add them to web/Discover totals.');
  if(m.surface==='multimodal')warnings.add('Multimodal is a report filter, not automatically an independent traffic total.');
  if(m.surface==='bing-ai')warnings.add('Citations are not visits, ranking or authority. Topics Portfolio ranges need separate qualitative review.');
  if((+now-Date.parse(m.exportedAt))/DAY>7)warnings.add('The export is more than seven days old. This is a snapshot, not a live measurement.');
  return {manifest:m,records,warnings:[...warnings],sha256:createHash('sha256').update(csv).digest('hex')};
}
export function measurementWindow(dataset,window=28) {
  if(![28,90,180,'3m','6m'].includes(window))throw new Error('Window must be 28, 90, 180, 3m or 6m');
  const {manifest:m}=dataset;
  let start,days;
  if(typeof window==='number'){days=window;start=new Date(Date.parse(m.end)-(days-1)*DAY).toISOString().slice(0,10);}
  else {
    const shifted=new Date(Date.parse(m.end)+DAY),day=shifted.getUTCDate();shifted.setUTCDate(1);shifted.setUTCMonth(shifted.getUTCMonth()-parseInt(window));
    const last=new Date(Date.UTC(shifted.getUTCFullYear(),shifted.getUTCMonth()+1,0)).getUTCDate();shifted.setUTCDate(Math.min(day,last));
    start=shifted.toISOString().slice(0,10);days=(Date.parse(m.end)-Date.parse(start))/DAY+1;
  }
  if(m.start>start)throw new Error('Insufficient period coverage for requested window');
  if(!m.grain.includes('date')&&m.start!==start)throw new Error('Period-level export must exactly match the requested window');
  return {...dataset,period:{start,end:m.end,days,window},records:dataset.records.filter(r=>!r.date||r.date>=start)};
}
export function summarise(records,metrics) {
  if(!records.length)return {rows:0,clicks:null,impressions:null,ctr:null,position:null,citations:null,positionImpressions:null};
  const sum=key=>metrics.includes(key)?records.reduce((n,r)=>n+r[key],0):null;
  const clicks=sum('clicks'),impressions=sum('impressions'),citations=sum('citations');
  const positioned=records.filter(r=>r.position!==null&&r.position!==undefined&&r.impressions>0);
  const positionImpressions=metrics.includes('position')?positioned.reduce((n,r)=>n+r.impressions,0):null;
  return {rows:records.length,clicks,impressions,citations,ctr:clicks!==null&&impressions>0?clicks/impressions:null,
    position:positionImpressions>0?positioned.reduce((n,r)=>n+r.position*r.impressions,0)/positionImpressions:null,positionImpressions};
}
export function compatibleComparison(current,baseline) {
  for(const key of ['source','surface','property','timezone','coverage'])if(current.manifest[key]!==baseline.manifest[key])throw new Error(`Incompatible comparison: ${key}`);
  for(const key of ['grain','metrics'])if(JSON.stringify([...current.manifest[key]].sort())!==JSON.stringify([...baseline.manifest[key]].sort()))throw new Error(`Incompatible comparison: ${key}`);
  const ordered=value=>Array.isArray(value)?value.map(ordered):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,ordered(value[k])])):value;
  if(JSON.stringify(ordered(current.manifest.filters))!==JSON.stringify(ordered(baseline.manifest.filters)))throw new Error('Incompatible comparison: filters');
  if(current.period.window!==baseline.period.window||baseline.period.end>=current.period.start)throw new Error('Compare matching, non-overlapping windows');
  return {gapDays:(Date.parse(current.period.start)-Date.parse(baseline.period.end))/DAY-1,
    unequalDays:current.period.days!==baseline.period.days,
    caveats:['Association only, not an SEO causal effect. Check seasonality, new publications, indexing delays and algorithm changes.',
      ...(current.period.days!==baseline.period.days?['Calendar windows differ in length; inspect per-day rates as well as period totals.']:[])]};
}
export function metricChanges(current,baseline) {
  return Object.fromEntries(['clicks','impressions','ctr','position','citations'].map(key=>[key,
    current[key]==null||baseline[key]==null?null:{absolute:current[key]-baseline[key],relative:baseline[key]===0?null:(current[key]-baseline[key])/baseline[key]}]));
}
export function opportunity(current,previous,{known=false,effort=1,fit=1,minimumImpressions=MEASUREMENT_POLICY.minimumImpressions,declineWeight=MEASUREMENT_POLICY.declineWeight}={}) {
  if(!Number.isFinite(effort)||effort<=0||!Number.isFinite(fit)||fit<0||fit>1||!Number.isFinite(minimumImpressions)||minimumImpressions<1||!Number.isFinite(declineWeight)||declineWeight<0)throw new Error('Invalid editorial opportunity policy');
  if(!known||current.impressions===null||current.ctr===null||current.impressions<minimumImpressions)return {score:null,reason:!known?'No current canonical content match.':'Insufficient comparable search data; no opportunity score.'};
  const decline=previous?.clicks>0?Math.max(0,(previous.clicks-current.clicks)/previous.clicks):0;
  return {score:Math.log1p(current.impressions)*(1-current.ctr)*(1+declineWeight*decline)*fit/effort,
    reason:'Editorial triage only; impressions are observed visibility, not total demand or forecast growth.'};
}
export function publisherBrand(query) {
  if(query==null||query==='')return 'unavailable';
  if(/(?:^|\s)lume\s+journal(?:\s|$)|lumejournal\.com/i.test(query))return 'publisher-branded';
  // "Lume" is also a horological material; never silently label it site-branded.
  return /(?:^|\s)lume(?:\s|$)/i.test(query)?'ambiguous-lume':'not-publisher-branded';
}
