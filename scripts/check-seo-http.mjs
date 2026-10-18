import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {inspectHtml} from './lib/seo-html.mjs';

const root=new URL('../dist/',import.meta.url),results=[],errors=[];
const homepage=inspectHtml(await readFile(new URL('index.html',root),'utf8'));
const origin=new URL(homepage.canonical[0]).origin;
const directory=new URL('../output/seo-p0-p1/',import.meta.url);
await mkdir(directory,{recursive:true});
async function walk(dir){let paths=[];for(const f of await readdir(dir,{withFileTypes:true})){const p=new URL(f.name+(f.isDirectory()?'/':''),dir);if(f.isDirectory()&&f.name!=='widgets')paths.push(...await walk(p));else if(f.name.endsWith('.html'))paths.push(p);}return paths;}
const pages=[];
for(const file of await walk(root)){
 const html=inspectHtml(await readFile(file,'utf8'));
 if(!html.noindex&&html.canonical.length===1)pages.push({url:html.canonical[0],html});
}
async function request(url){
 const response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(30000),cache:'no-store'});
 return {status:response.status,location:response.headers.get('location'),robots:response.headers.get('x-robots-tag'),
  type:response.headers.get('content-type'),body:await response.text()};
}
for(let i=0;i<pages.length;i+=4)await Promise.all(pages.slice(i,i+4).map(async expected=>{
 try{
  const r=await request(expected.url),actual=inspectHtml(r.body);
  assert.equal(r.status,200);assert(!/\bnoindex\b/i.test(r.robots||''));assert(!actual.noindex);
  assert.deepEqual(actual.canonical,expected.html.canonical);assert.deepEqual(actual.titles,expected.html.titles);
  assert.deepEqual(actual.alternates,expected.html.alternates);
  assert.deepEqual(actual.schemas,expected.html.schemas);
  for(const key of ['description','og:image','article:published_time','article:modified_time'])assert.deepEqual(actual.meta(key),expected.html.meta(key));
  results.push({url:expected.url,status:r.status,result:'matches-build'});
 }catch(error){errors.push({url:expected.url,error:error.message});}
}));
for(const path of ['/seo-check-missing-20261018/','/en/seo-check-missing-20261018/']){
 try{const r=await request(origin+path);assert.equal(r.status,404);assert(inspectHtml(r.body).noindex);results.push({url:origin+path,status:r.status,result:'real-404-noindex'});}catch(error){errors.push({url:origin+path,error:error.message});}
}
for(const path of ['/robots.txt','/sitemap-index.xml','/sitemap-0.xml','/rss.xml','/en/rss.xml']){
 try{const r=await request(origin+path);assert.equal(r.status,200);assert.equal(r.body.replace(/\r\n/g,'\n'),(await readFile(new URL('.'+path,root),'utf8')).replace(/\r\n/g,'\n'));results.push({url:origin+path,status:r.status,result:'matches-build'});}catch(error){errors.push({url:origin+path,error:error.message});}
}
for(const path of ['/naptar/?brand=seiko&month=2026-11','/en/calendar/?status=announced']){
 try{const r=await request(origin+path);assert.equal(r.status,200);assert.deepEqual(inspectHtml(r.body).canonical,[origin+path.split('?')[0]]);results.push({url:origin+path,status:r.status,result:'query-canonical-consolidated'});}catch(error){errors.push({url:origin+path,error:error.message});}
}
const article=pages.find(p=>p.html.meta('og:type')[0]==='article'),path=new URL(article.url).pathname;
for(const variant of [path.slice(0,-1),path+'index.html']){
 try{const r=await request(origin+variant);assert([301,302,307,308].includes(r.status));assert.equal(new URL(r.location,origin).href,article.url);results.push({url:origin+variant,status:r.status,result:'one-hop-canonical-redirect'});}catch(error){errors.push({url:origin+variant,error:error.message});}
}
{
 const url=origin+'/widgets/rotor.html';
 try{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});assert.equal(r.status,200);assert(/\bnoindex\b/i.test(r.headers.get('x-robots-tag')||''));await r.arrayBuffer();results.push({url,status:r.status,result:'standalone-widget-noindex'});}catch(error){errors.push({url,error:error.message});}
}
const imageUrls=[...new Set(pages.map(p=>p.html.meta('og:image')[0]))];
for(let i=0;i<imageUrls.length;i+=4)await Promise.all(imageUrls.slice(i,i+4).map(async url=>{
 try{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});assert.equal(r.status,200);assert(/^image\//.test(r.headers.get('content-type')));await r.arrayBuffer();results.push({url,status:r.status,result:'social-image-accessible'});}catch(error){errors.push({url,error:error.message});}
}));
await writeFile(new URL('http-production.json',directory),JSON.stringify({checkedAt:new Date().toISOString(),pages:pages.length,images:imageUrls.length,results,errors},null,2)+'\n');
console.log(JSON.stringify({pages:pages.length,images:imageUrls.length,checks:results.length,errors:errors.length}));
assert.equal(errors.length,0,JSON.stringify(errors));
