import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {inspectHtml,attribute,textOf,elementsOf} from './lib/seo-html.mjs';
import {graph,rankRelated} from '../src/lib/content-graph.mjs';
import {orderedPublishedPosts} from '../src/lib/published-feed.mjs';
import {hydrateEvents,classifyCalendarEvent} from '../src/lib/calendar-events.mjs';
import {readPosts,sourceUrlOf} from './lib/content-inventory.mjs';
const posts=await readPosts(),now=new Date(),published=orderedPublishedPosts(posts,now),out='output/seo-p2-p3';
const baselineIndex=process.argv.indexOf('--baseline'),baseline=baselineIndex>=0?resolve(process.argv[baselineIndex+1]):null;
const cls=(node,value)=>(attribute(node,'class')??'').split(/\s+/).includes(value),clean=node=>textOf(node).replace(/\s+/g,' ').trim();
const results=[],pages=new Map();
async function walk(dir) {const files=[];for(const e of await readdir(dir,{withFileTypes:true})){const path=join(dir,e.name);if(e.isDirectory())files.push(...await walk(path));else files.push(path);}return files;}
const files=await walk('dist');
assert(!files.some(f=>/[\\/]\.seo-private[\\/]|[\\/]design[\\/]collections[\\/]/.test(f)),'Private measurement or draft collection leaked into build');
for(const post of published) {
  const path=sourceUrlOf(post),html=await readFile(`dist${path}index.html`,'utf8'),page=inspectHtml(html);pages.set(path,page);
  const section=page.elements.find(n=>cls(n,'journal-related'));
  const actual=[...new Set(elementsOf(section).filter(n=>n.tagName==='a').map(n=>attribute(n,'href')).filter(href=>href?.startsWith('/')&&!href.startsWith('//')))];
  const expected=rankRelated(post,posts,{now}).map(r=>sourceUrlOf(r.post));
  assert.deepEqual(actual,expected,`${path}: initial HTML recommendations differ from ranking`);
  assert.equal(elementsOf(section).filter(n=>attribute(n,'data-related-reason')!==undefined).length,expected.length,`${path}: missing explanation`);
  const connections=page.elements.find(n=>attribute(n,'data-content-connections')!==undefined);
  for(const a of elementsOf(connections).filter(n=>n.tagName==='a')) {
    const href=attribute(a,'href'),url=new URL(href,'https://lumejournal.com');
    assert.equal(url.pathname.startsWith('/en/'),post.data.lang==='en','Cross-language content link');
    const target=inspectHtml(await readFile(`dist${url.pathname}index.html`,'utf8'));
    if(url.hash)assert(target.elements.some(n=>attribute(n,'id')===url.hash.slice(1)),`Missing anchor: ${href}`);
  }
  if(baseline) {
    const before=inspectHtml(await readFile(join(baseline,path,'index.html'),'utf8'));
    assert.equal(clean(page.elements.find(n=>cls(n,'article-body'))),clean(before.elements.find(n=>cls(n,'article-body'))),`${path}: article body changed`);
    assert.deepEqual(page.titles,before.titles,`${path}: title changed`);assert.deepEqual(page.canonical,before.canonical);assert.deepEqual(page.alternates,before.alternates);
    assert.deepEqual(page.meta('article:published_time'),before.meta('article:published_time'));assert.deepEqual(page.meta('article:modified_time'),before.meta('article:modified_time'));
  }
  results.push({path,related:expected.length,contextLinks:elementsOf(connections).filter(n=>n.tagName==='a').length,articleUnchanged:baseline?true:null});
}
let modelCount=0,calendarLinks=0;
for(const file of files.filter(f=>f.endsWith('.html'))) {
  const html=await readFile(file,'utf8');if(!html.includes('data-shared-model-page')&&!html.includes('data-calendar-story'))continue;
  const page=inspectHtml(html);
  if(page.elements.some(n=>attribute(n,'data-shared-model-page')!==undefined)) {
    assert.equal(page.elements.filter(n=>attribute(n,'data-model-reading-guide')!==undefined).length,1,`${file}: missing unique initial-HTML model guide`);modelCount++;
  }
  calendarLinks+=page.elements.filter(n=>attribute(n,'data-calendar-story')!==undefined).length;
}
const expectedModels=published.filter(p=>p.data.column==='movement'&&(p.data.model||['co-axial','rattrapante','ugro-masodperc','tourbillon','constant-escapement'].some(key=>p.data.translationKey===key&&p.body.includes(`<!-- lume-model ${key} -->`)))).length;
const rawEvents=[...JSON.parse(await readFile('src/data/releases.json','utf8')),...JSON.parse(await readFile('src/data/announcements.json','utf8'))];
const currentEvents=hydrateEvents(rawEvents,JSON.parse(await readFile('src/data/calendar-events.json','utf8')));
const expectedCalendarLinks=graph.calendar.reduce((count,link)=>count+(currentEvents.some(e=>e.id===link.event&&classifyCalendarEvent(e,now).public)?published.filter(p=>p.data.translationKey===link.article).length:0),0);
assert.equal(modelCount,expectedModels,'All current model guides need both languages');assert.equal(calendarLinks,expectedCalendarLinks,'Exact calendar links missing or inferred');
if(baseline) {
  for(const f of ['rss.xml','en/rss.xml','robots.txt','sitemap-0.xml','sitemap-index.xml'])assert.equal(await readFile(`dist/${f}`,'utf8'),await readFile(join(baseline,f),'utf8'),`Publication/URL artifact changed: ${f}`);
  for(const file of files.filter(f=>f.endsWith('.ics')))assert.equal(await readFile(file,'utf8'),await readFile(join(baseline,file.slice(5)),'utf8'),'ICS changed');
}
await mkdir(out,{recursive:true});await writeFile(`${out}/build-validation.json`,JSON.stringify({generatedAt:now.toISOString(),articleVariants:published.length,modelGuides:modelCount,calendarStoryLinks:calendarLinks,baseline,results,errors:[]},null,2));
console.log(`Content build: ${published.length} articles, ${modelCount} model guides, ${calendarLinks} exact calendar links; ${baseline?'baseline bodies and publication artifacts unchanged':'no draft collection or private data exposed'}.`);
