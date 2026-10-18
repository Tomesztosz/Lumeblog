import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {inspectHtml,attribute,textOf} from './lib/seo-html.mjs';
import {readDirectory} from './lib/llms-reader.mjs';
import {readPosts,sourceUrlOf} from './lib/content-inventory.mjs';
import {orderedPublishedPosts} from '../src/lib/published-feed.mjs';
import {directorySummary} from '../src/lib/llms-description.ts';
import {directoryUrl} from '../src/lib/llms.ts';
import {pageContract} from './lib/design-release.mjs';
const production=process.argv.includes('--production'),baselineIndex=process.argv.indexOf('--baseline'),baseline=baselineIndex>=0?resolve(process.argv[baselineIndex+1]):null;
const manifest=JSON.parse(await readFile('output/llms/manifest.json','utf8')),site=new URL(manifest.site),out='output/llms';
const results=[],warnings=[...manifest.warnings];
async function fileText(name) {
  const bytes=await readFile(`dist/${name}`),text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
  assert(text.startsWith('# Lume Journal\n'),'Directory must start with the real site H1');assert(text.endsWith('\n'));assert(!text.includes('\u2014'));
  if(production) {
    const response=await fetch(new URL(name,site),{redirect:'manual'});
    assert.equal(response.status,200,`${name}: expected 200, no redirect/fallback`);
    assert(/^text\/plain\s*;\s*charset=utf-8$/i.test(response.headers.get('content-type')??''),`${name}: wrong MIME/encoding`);
    assert(/(?:max-age=0|no-cache)/.test(response.headers.get('cache-control')??''),`${name}: must revalidate after deployment`);
    const remote=new TextDecoder('utf-8',{fatal:true}).decode(await response.arrayBuffer());assert.equal(remote,text,`${name}: production bytes differ from the build`);
    const etag=response.headers.get('etag');
    if(etag){const conditional=await fetch(new URL(name,site),{redirect:'manual',headers:{'If-None-Match':etag}});assert([200,304].includes(conditional.status));if(conditional.status===200)assert.equal(await conditional.text(),text);}
    results.push({file:name,status:response.status,contentType:response.headers.get('content-type'),cacheControl:response.headers.get('cache-control'),bytes:bytes.length});
  }
  return text;
}
const main=await fileText('llms.txt');assert.equal(Buffer.byteLength(main),manifest.mainBytes);assert(Buffer.byteLength(main)<=manifest.maxMainBytes);
const mainParsed=await readDirectory(main),full=manifest.hasFull?await fileText('llms-full.txt'):null,parsed=full?await readDirectory(full):mainParsed;
assert.equal(parsed.page.elements.filter(n=>n.tagName==='h1').length,1);assert(parsed.page.elements.some(n=>n.tagName==='blockquote'));
assert(!parsed.page.elements.some(n=>['script','iframe','img'].includes(n.tagName)),'Unexpected generated HTML structure');
assert.equal(new Set(parsed.entries.map(e=>e.url)).size,parsed.entries.length,'Duplicate canonical URL');
assert.equal(parsed.entries.length,manifest.entries.length,'Directory coverage differs from collected eligible content');
assert.deepEqual(new Set(parsed.entries.map(e=>e.url)),new Set(manifest.entries.map(e=>e.url)));
const fullUrl=new URL('llms-full.txt',site).href;
assert.deepEqual(new Set(mainParsed.entries.filter(e=>e.url!==fullUrl).map(e=>e.url)),new Set(manifest.mainUrls));
assert.equal(mainParsed.entries.filter(e=>e.url===fullUrl).length,manifest.hasFull?1:0);
if(!full) {
  const generated=await readFile('dist/llms-full.txt').then(()=>true,()=>false);assert(!generated,'Unnecessary full directory generated');
  if(production)assert.equal((await fetch(fullUrl,{redirect:'manual'})).status,404);
}
const posts=await readPosts(),published=orderedPublishedPosts(posts,new Date());
const articleEntries=manifest.entries.filter(e=>e.kind==='article');
let eligibleArticles=0;
for(const post of posts) {
  // Astro can replace a file ID with frontmatter.slug. Compare independent
  // source URLs instead of assuming its internal IDs equal file paths.
  const expectedUrl=new URL(sourceUrlOf(post),site).href;
  const entry=articleEntries.find(e=>e.url===expectedUrl);
  if(!published.some(p=>p.id===post.id)||!manifest.launched){assert(!entry,`Unpublished article exposed: ${post.id}`);continue;}
  const sourcePage=inspectHtml(await readFile(`dist${new URL(expectedUrl).pathname}index.html`,'utf8'));
  if(sourcePage.noindex){assert(!entry,`Noindex article exposed: ${post.id}`);continue;}
  eligibleArticles++;
  assert(entry,`Missing article: ${post.id}`);assert.equal(entry.lang,post.data.lang);
  if(post.data.translationKey)assert.equal(entry.contentId,post.data.translationKey);
  assert.deepEqual(entry.summary,await directorySummary({...post.data,body:post.body}),`${post.id}: summary provenance changed`);
}
assert.equal(articleEntries.length,eligibleArticles,'Every published, indexable article variant must appear once');
const targetPages=new Map();
for(const item of parsed.entries) {
  const record=manifest.entries.find(e=>e.url===item.url);assert(record);
  directoryUrl(item.url,site);assert.equal(item.title,`${record.lang.toUpperCase()}: ${record.title}`);
  assert.equal(item.description,record.summary.text??'','Description differs from approved/source-derived summary');
  const path=decodeURIComponent(new URL(item.url).pathname),page=inspectHtml(await readFile(`dist${path}index.html`,'utf8'));targetPages.set(item.url,page);
  assert(!page.noindex,`Noindex directory target: ${item.url}`);assert.deepEqual(page.canonical,[item.url]);assert.equal(page.lang,record.lang);
  if(record.kind==='model')assert(page.elements.some(n=>attribute(n,'data-shared-model-page')!==undefined),'Raw widget is not a model landing page');
  if(baseline) {
    const before=await readFile(join(baseline,path,'index.html'),'utf8'),after=await readFile(`dist${path}index.html`,'utf8');
    assert.deepEqual(pageContract(after),pageContract(before),`SEO contract changed: ${item.url}`);
    const visible=p=>textOf(p.elements.find(n=>n.tagName==='main')).replace(/\s+/g,' ').trim();assert.equal(visible(page),visible(inspectHtml(before)),`Visible content changed: ${item.url}`);
  }
}
async function walk(directory) {const paths=[];for(const e of await readdir(directory,{withFileTypes:true})){const p=join(directory,e.name);if(e.isDirectory())paths.push(...await walk(p));else paths.push(p);}return paths;}
const files=await walk('dist');let describedPages=0;
for(const file of files.filter(p=>p.endsWith('.html'))) {
  const page=inspectHtml(await readFile(file,'utf8')),links=page.head.filter(n=>n.tagName==='link'&&(attribute(n,'rel')??'').split(/\s+/).includes('describedby'));
  // Standalone widget assets are excluded by the existing HTTP X-Robots-Tag.
  if(page.noindex||file.replace(/\\/g,'/').startsWith('dist/widgets/')){assert.equal(links.length,0,'No discovery link on technical/private/404 pages');continue;}
  assert.equal(links.length,1,`Missing/duplicate directory discovery: ${file}`);assert.equal(attribute(links[0],'href'),new URL('llms.txt',site).href);describedPages++;
}
if(baseline)for(const file of files.filter(f=>/\.ics$|(?:^|[\\/])(?:rss\.xml|robots\.txt|sitemap-(?:index|0)\.xml)$/.test(f)))assert.equal(await readFile(file,'utf8'),await readFile(join(baseline,file.slice(5)),'utf8'),`Protected publication artifact changed: ${file}`);
if(production)for(let i=0;i<parsed.entries.length;i+=6)await Promise.all(parsed.entries.slice(i,i+6).map(async item=>{
  const response=await fetch(item.url,{redirect:'manual'});assert.equal(response.status,200,`Directory link is not canonical HTTP 200: ${item.url}`);assert(!/\bnoindex\b/i.test(response.headers.get('x-robots-tag')??''));
  const page=inspectHtml(await response.text());assert(!page.noindex);assert.deepEqual(page.canonical,[item.url]);
  const links=page.head.filter(n=>n.tagName==='link'&&attribute(n,'rel')==='describedby');assert.equal(links.length,1);assert.equal(attribute(links[0],'href'),new URL('llms.txt',site).href);
}));
await mkdir(out,{recursive:true});const report={checkedAt:new Date().toISOString(),production,mainBytes:Buffer.byteLength(main),fullBytes:full?Buffer.byteLength(full):null,
  entries:parsed.entries.length,articles:articleEntries.length,models:manifest.entries.filter(e=>e.kind==='model').length,describedPages,baseline,
  warnings,results,errors:0};await writeFile(`${out}/${production?'production-validation':'validation'}.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
