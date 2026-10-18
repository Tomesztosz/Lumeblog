import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createMarkdownProcessor} from '@astrojs/markdown-remark';
import {buildDirectory,categoryOf,directoryUrl} from '../src/lib/llms.ts';
import {directorySummary,directoryPlainText} from '../src/lib/llms-description.ts';
import {LLMS_COPY} from '../src/i18n/ui.ts';
import {readFile} from 'node:fs/promises';
import {inspectHtml,attribute,textOf} from './lib/seo-html.mjs';
import {readDirectory,findDirectoryEntries} from './lib/llms-reader.mjs';
const config=JSON.parse(await readFile(new URL('../src/data/llms-directory.json',import.meta.url),'utf8'));
const site='https://lumejournal.com/',now=new Date('2026-10-18T10:00:00Z');
const candidate=(id='one',extra={})=>({id:`hu/${id}`,contentId:id,lang:'hu',kind:'article',column:'movement',date:'2026-10-01T01:00:00+02:00',title:`Óra ${id}`,description:'Az óra működésének tényszerű magyarázata.',url:`${site}szerkezet/${id}/`,...extra});
const build=(candidates,extra={})=>buildDirectory({candidates,config,copy:LLMS_COPY,site,now,...extra});
const markdown=await createMarkdownProcessor({syntaxHighlight:false,smartypants:false});
test('v2: H1, bilingual summary, H2 lists, UTF-8 and exact Markdown links',async()=>{
  const r=await build([candidate()]);assert(r.main.startsWith('# Lume Journal\n\n> '));assert(!r.main.includes('\u2014'));
  const p=inspectHtml((await markdown.render(r.main)).code);
  assert.equal(p.elements.filter(e=>e.tagName==='h1').length,1);assert(p.elements.some(e=>e.tagName==='blockquote'));
  assert.deepEqual(p.elements.filter(e=>e.tagName==='a').map(e=>attribute(e,'href')),[site+'szerkezet/one/']);
  assert.equal(new TextDecoder('utf-8',{fatal:true}).decode(new TextEncoder().encode(r.main)),r.main);assert(r.main.includes('Óra'));
});
test('publication boundary is strict, including drafts, future/invalid dates and dated models',async()=>{
  const exact=candidate('boundary',{date:now}),future=candidate('future',{date:'2026-10-18T10:00:01Z'});
  const r=await build([exact,future,candidate('draft',{draft:true}),candidate('invalid',{date:'invalid'}),candidate('hidden',{noindex:true}),candidate('future-model',{kind:'model',date:'2030-01-01'})]);
  assert.deepEqual(r.entries.map(e=>e.contentId),['boundary']);
  assert.equal((await build([exact],{launched:false})).entries.length,0);
});
test('HU/EN real slugs stay adjacent; absent translations are never invented',async()=>{
  const hu=candidate('pair',{url:site+'szerkezet/magyar-valodi/'}),en=candidate('english-real',{id:'en/english-real',contentId:'pair',lang:'en',url:site+'en/movement/different-english-slug/',title:'Actual English title',description:'A factual explanation in English.'});
  const r=await build([en,candidate('only-hu'),hu]);
  const lines=r.main.split('\n').filter(l=>l.startsWith('- '));assert(lines.findIndex(l=>l.includes('HU: Óra pair'))+1===lines.findIndex(l=>l.includes('EN: Actual English title')));
  assert.equal(r.entries.length,3);assert(!r.main.includes('/en/szerkezet/'));assert.equal((await build([en])).entries.length,1);
});
test('category rules use sections and curated entities, not brand strings',()=>{
  assert.equal(categoryOf(candidate('x',{column:'in-hand',title:'Any Manufacturer'}),config),'hands-on');
  assert.equal(categoryOf(candidate('x',{column:'in-hand',entities:['topic:independents']}),config),'independents');
  assert.equal(categoryOf(candidate('x',{column:'origins'}),config),'heritage');
  const extended={...config,categories:[{id:'new-theme',kind:'article',requiredEntity:'topic:new'},...config.categories]};
  assert.equal(categoryOf(candidate('x',{entities:['topic:new']}),extended),'new-theme');
});
test('summary priority does not rewrite approved metadata or infer facts',async()=>{
  const source={llmsSummary:'Az **ST1901** kézi felhúzású szerkezet.',seoDescription:'Másik ellenőrzött leírás.',description:'Felvezető.',body:'Bevezető mondat.'};
  assert.deepEqual(await directorySummary(source),{text:'Az ST1901 kézi felhúzású szerkezet.',source:'llmsSummary',warnings:[]});
  delete source.llmsSummary;assert.equal((await directorySummary(source)).source,'seoDescription');delete source.seoDescription;assert.equal((await directorySummary(source)).source,'description');
  delete source.description;assert.equal((await directorySummary(source)).source,'intro');
  assert(!JSON.stringify(await directorySummary(source)).includes('price'));
});
test('intro fallback uses complete prose, not headings, images, code or components',async()=>{
  const summary=await directorySummary({body:'## Cím\n\n![Kép](x.png)\n\n```js\nfake()\n```\n\n<div>Nem bevezető</div>\n\nAz ST1901 kézi felhúzású. Az áráról ez nem állít semmit.'});
  assert.equal(summary.source,'intro');assert.equal(summary.text,'Az ST1901 kézi felhúzású. Az áráról ez nem állít semmit.');
  const missing=await directorySummary({body:'## Cím\n\nBefejezetlen gondolat'});assert.equal(missing.source,'none');assert(missing.warnings.length);
});
test('markup normalises safely and technical values remain exact',async()=>{
  assert.equal(await directoryPlainText('A **38 mm** tok és az `ST1901` [szerkezet](/x/) &amp; <span>mutató</span>.'),'A 38 mm tok és az ST1901 szerkezet & mutató.');
  assert.equal(await directoryPlainText('<script>fake fact</script>'),'');
  assert.equal(await directoryPlainText('<div>component text</div>'),'');
  assert.equal((await directorySummary({llmsSummary:'<iframe>unsafe</iframe>',description:'Valós mondat.'})).source,'description');
});
test('metadata cannot inject headings, links or executable HTML into the directory',async()=>{
  const c=candidate('safe',{title:'Óra [hamis](https://evil.example/) <script>x()</script> *részlet*',description:'Valós mondat.\n\n## Hamis szakasz\n\n[Másik link](https://evil.example/)'});
  const r=await build([c]),p=inspectHtml((await markdown.render(r.main)).code);
  assert.equal(p.elements.filter(e=>e.tagName==='h1').length,1);assert.equal(p.elements.filter(e=>e.tagName==='h2').length,1);
  assert.deepEqual(p.elements.filter(e=>e.tagName==='a').map(e=>attribute(e,'href')),[c.url]);assert(!p.elements.some(e=>e.tagName==='script'));
  assert(!textOf(p.elements.find(e=>e.tagName==='li')).includes('x()'));
});
test('invalid/foreign/noncanonical targets are rejected, not silently repaired',async()=>{
  for(const url of ['http://lumejournal.com/a/','https://foreign.example/a/',site+'a/?x=1',site+'a/#x',site+'a',site+'a/index.html','https://user:pass@lumejournal.com/a/'])assert.throws(()=>directoryUrl(url,site));
  await assert.rejects(build([candidate('bad',{url:site+'en/movement/bad/'})]),/language mismatch/);
});
test('identical records deduplicate; conflicting records and translation keys fail',async()=>{
  const c=candidate();assert.equal((await build([c,c])).entries.length,1);
  await assert.rejects(build([c,{...c,title:'Conflicting'}]),/Conflicting/);
  await assert.rejects(build([c,candidate('other',{contentId:c.contentId})]),/Ambiguous translation/);
});
test('publish, edit and withdrawal update output without changing stable URLs',async()=>{
  const a=candidate('a'),b=candidate('b');const first=await build([a]),added=await build([a,b]),edited=await build([{...a,description:'Az átdolgozott, jóváhagyott leírás.'},b]),removed=await build([b]);
  assert(!first.main.includes(b.url));assert(added.main.includes(b.url));assert(edited.main.includes('átdolgozott'));assert.equal(edited.entries.filter(e=>e.url===a.url).length,1);assert(!removed.main.includes(a.url));
});
test('unchanged input is byte-identical regardless of enumeration order, with no build timestamp',async()=>{
  const candidates=[candidate('b'),candidate('a')];assert.equal((await build(candidates)).main,(await build(candidates.toReversed())).main);
  assert.equal((await build(candidates,{now:new Date('2026-10-19T10:00:00Z')})).main,(await build(candidates)).main);
});
test('no arbitrary 10/20 cap; a small directory has no redundant full file',async()=>{
  const r=await build(Array.from({length:30},(_,i)=>candidate(`article-${i}`)));assert.equal(r.entries.length,30);assert.equal(r.mainEntries.length,30);assert.equal(r.full,undefined);assert(!r.main.includes('/llms-full.txt'));
});
test('growing catalogues respect UTF-8 budget, preserve language groups and category coverage',async()=>{
  const candidates=[];for(let i=0;i<150;i++)for(const lang of ['hu','en'])candidates.push(candidate(`topic-${i}`,{id:`${lang}/${i}`,lang,url:lang==='hu'?`${site}szerkezet/topic-${i}/`:`${site}en/movement/topic-${i}/`,column:['movement','origins','in-hand'][i%3],description:'Egy forrásból származó, ellenőrzött technikai leírás a cikk valódi témájáról.'}));
  const r=await build(candidates,{config:{...config,maxMainBytes:6500}});assert(r.full);assert(r.mainBytes<=6500);assert.equal(r.entries.length,300);assert(r.main.includes('/llms-full.txt'));assert(r.main.includes('\n## Optional\n'));
  for(const entry of r.mainEntries)assert.equal(r.mainEntries.filter(e=>e.contentId===entry.contentId).length,2);
  assert.equal(new Set(r.mainEntries.map(e=>e.category)).size,3);
  assert.equal(r.main,(await build(candidates.toReversed(),{config:{...config,maxMainBytes:6500}})).main);
});
test('configuration mistakes fail closed instead of dropping content silently',async()=>{
  await assert.rejects(build([candidate()],{config:{...config,maxMainBytes:10}}),/configuration/);
  await assert.rejects(build([candidate('bad',{column:'unknown'})]),/No configured/);
  await assert.rejects(build([candidate()],{config:{...config,categories:[...config.categories,config.categories[0]]}}),/category labels/);
});

test('plain metadata preserves paragraph boundaries and literal entity-like text round-trips',async()=>{
  assert.equal(await directoryPlainText('Első mondat.\n\nMásodik mondat.'),'Első mondat. Második mondat.');
  const result=await build([candidate('entity',{description:'A szó szerinti `&copy;` jel és a **38 mm** tok.'})]);
  const parsed=await readDirectory(result.main);
  assert.equal(parsed.entries[0].description,'A szó szerinti &copy; jel és a 38 mm tok.');
});

test('independent Markdown client finds real topics without fabricating factual filters',async()=>{
  const result=await build([candidate('coax',{title:'Koaxiális gátlómű',description:'George Daniels és a közvetlen impulzus.'}),candidate('spring',{title:'Rugóház',description:'A felhúzás energiájának tárolása.'})]);
  const {entries}=await readDirectory(result.main);
  assert.equal(findDirectoryEntries(entries,'George Daniels')[0].url,site+'szerkezet/coax/');
  assert.equal(findDirectoryEntries(entries,'koaxialis')[0].url,site+'szerkezet/coax/');
  assert.deepEqual(findDirectoryEntries(entries,'500 EUR'),[]);
  assert.deepEqual(findDirectoryEntries(entries,''),[]);
  await assert.rejects(readDirectory('## Hamis\n\n- [A](/a/) és [B](/b/)'),/exactly one link/);
});
