import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname,relative,isAbsolute} from 'node:path';
import {importMeasurement,measurementWindow,summarise,compatibleComparison,metricChanges,opportunity,publisherBrand,MEASUREMENT_POLICY} from './lib/seo-measurement.mjs';
import {inspectHtml} from './lib/seo-html.mjs';
const args=process.argv.slice(2),option=name=>args[args.indexOf(name)+1];
if(!args.includes('--manifest')) {console.log('Usage: npm run seo:measure -- --manifest <private manifest.json> [--baseline <private manifest.json>] [--window 28|3m|6m|90|180]\nNo account is connected and no measurement is fabricated. See docs/SEO_MEASUREMENT.md.');process.exit(0);}
const chosenWindow=args.includes('--window')?option('--window'):'28',window=chosenWindow?.endsWith('m')?chosenWindow:Number(chosenWindow),now=new Date();
async function htmlFiles(dir) {const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,e.name);if(e.isDirectory())out.push(...await htmlFiles(path));else if(e.name.endsWith('.html'))out.push(path);}return out;}
async function load(path) {
  const manifest=JSON.parse(await readFile(path,'utf8'));
  if(typeof manifest.file!=='string')throw new Error('Missing CSV file');
  const root=resolve(dirname(path)),file=resolve(root,manifest.file),rel=relative(root,file);
  if(rel.startsWith('..')||isAbsolute(rel))throw new Error('CSV must be inside its manifest directory');
  const csv=await readFile(file,'utf8');
  return measurementWindow(importMeasurement(csv,manifest,{now}),window);
}
const current=await load(option('--manifest')),baseline=args.includes('--baseline')?await load(option('--baseline')):null;
const comparison=baseline?compatibleComparison(current,baseline):null,inventory=new Map();
for(const file of await htmlFiles('dist')) {
  const page=inspectHtml(await readFile(file,'utf8'));if(page.noindex||page.canonical.length!==1)continue;
  const canonical=page.canonical[0],url=new URL(canonical),article=page.schemas.some(s=>s['@type']==='BlogPosting');
  const published=page.meta('article:published_time')[0];
  inventory.set(canonical,{language:page.lang,type:article?'article':/\/(muhely|workshop)\/.+/.test(url.pathname)?'model':/\/(naptar|calendar)\//.test(url.pathname)?'calendar':/\/(muhely|workshop)\/$/.test(url.pathname)?'workshop':'collection',published});
}
const byPage=dataset=>{
  const groups=new Map();for(const r of dataset.records){const list=groups.get(r.url)??[];list.push(r);groups.set(r.url,list);}
  return new Map([...groups].map(([url,rows])=>[url,summarise(rows,dataset.manifest.metrics)]));
};
const currentPages=byPage(current),previousPages=baseline?byPage(baseline):new Map();
const policy=JSON.parse(await readFile('docs/seo/measurement-policy.json','utf8'));
const pages=[...currentPages].map(([url,metrics])=>{
  const content=inventory.get(url),previous=previousPages.get(url)??null,editorial=policy.pages?.[new URL(url).pathname]??{};
  const newPublication=Boolean(content?.published&&baseline&&content.published.slice(0,10)>baseline.period.end);
  const scoringPrevious=previous&&baseline?{...previous,clicks:previous.clicks===null?null:previous.clicks/baseline.period.days*current.period.days}:null;
  return {url,content:content??null,metrics,previous,changes:previous?metricChanges(metrics,previous):null,newPublication,
    opportunity:newPublication?{score:null,reason:'New publication; no like-for-like previous exposure.'}:opportunity(metrics,scoringPrevious,{...policy.defaults,...editorial,known:Boolean(content)})};
}).sort((a,b)=>(b.opportunity.score??-1)-(a.opportunity.score??-1)||a.url.localeCompare(b.url));
const segmentGroups=new Map();for(const r of current.records){const content=inventory.get(r.url),key=JSON.stringify({language:content?.language??'unknown',type:content?.type??'unknown',publisherQuery:publisherBrand(r.query)});const list=segmentGroups.get(key)??[];list.push(r);segmentGroups.set(key,list);}
const segments=[...segmentGroups].map(([key,rows])=>({...JSON.parse(key),...summarise(rows,current.manifest.metrics)}));
const queryGroups=new Map();if(current.manifest.grain.includes('query'))for(const r of current.records){const list=queryGroups.get(r.query)??[];list.push(r);queryGroups.set(r.query,list);}
const queries=[...queryGroups].map(([query,rows])=>({query,publisherQuery:publisherBrand(query),...summarise(rows,current.manifest.metrics)}));
const rates=dataset=>Object.fromEntries(Object.entries(summarise(dataset.records,dataset.manifest.metrics)).filter(([key])=>['clicks','impressions','citations'].includes(key)).map(([key,value])=>[key,value===null?null:value/dataset.period.days]));
const report={generatedAt:now.toISOString(),status:current.manifest.synthetic?'Synthetic test fixture, NOT Lume traffic':'Imported snapshot, not live account access',source:current.manifest,sha256:current.sha256,
  period:current.period,metrics:summarise(current.records,current.manifest.metrics),baseline:baseline?{source:baseline.manifest,sha256:baseline.sha256,period:baseline.period,metrics:summarise(baseline.records,baseline.manifest.metrics)}:null,
  comparison,perDay:{current:rates(current),baseline:baseline?rates(baseline):null},segments,queries,pages,baselineOnlyPages:baseline?[...previousPages.keys()].filter(url=>!currentPages.has(url)).map(url=>({url,status:'Absent from current exported rows, not assumed zero.'})):[],
  warnings:[...new Set([...current.warnings,...(baseline?.warnings??[]),'Page/query rows are export coverage, not authoritative property totals. Missing rows and missing metrics are not zeros.'])],policy};
const output=resolve('.seo-private/reports');await mkdir(output,{recursive:true});const path=resolve(output,`measurement-${Date.now()}.json`);
await writeFile(path,JSON.stringify(report,null,2));console.log(`Private measurement snapshot: ${relative('.',path)}. ${current.records.length} exported rows; ${pages.length} page groups. No data sent or published.`);
