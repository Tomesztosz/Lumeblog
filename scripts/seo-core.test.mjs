import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {seoTitle,canonicalUrl,resolveSeo,articleDescription,articleDates,websiteSchema,articleSchema,collectionSchema,modelSchema} from '../src/lib/seo.ts';
import {inspectHtml} from './lib/seo-html.mjs';
import {validateStructuredPage} from './lib/seo-validation.mjs';
import {sitemapMetadata} from './lib/sitemap-metadata.mjs';
import {calendarSchema} from '../src/lib/calendar-seo.ts';
const site='https://lumejournal.com',now=new Date('2026-10-18T12:00:00Z');
const head=extra=>resolveSeo({lang:'hu',path:'/naptar/',site,launched:true,title:'Naptár',altUrl:'/en/calendar/',
  fallbackTitle:'Lume | Órás folyóirat',fallbackDescription:'Forrásolt órás történetek.',fallbackAlt:'Lume',...extra});

test('Titles brand once without truncating or changing an editorial heading',()=>{
 for(const input of ['Gátlómű','Gátlómű | Lume','Gátlómű | Lume | Lume'])assert.equal(seoTitle(input,'Lume'),'Gátlómű | Lume');
 assert.equal(seoTitle('Lume Műhely: működő modellek | Lume','Lume'),'Lume Műhely: működő modellek');
 assert.equal(seoTitle(undefined,'Lume | Watches'),'Lume | Watches');
 const long='Egy hosszú, valóban leíró cím '.repeat(12).trim();assert.equal(seoTitle(long,'Lume'),long+' | Lume');
});
test('Canonical URLs consolidate document variants, not unrelated languages or external hosts',()=>{
 for(const input of ['/kezben/bravur-orak','/kezben/bravur-orak/','/kezben/bravur-orak/index.html','/kezben/bravur-orak/?utm_source=x#ora'])
  assert.equal(canonicalUrl(input,site),site+'/kezben/bravur-orak/');
 for(const path of ['https://evil.test/','//evil.test/','/\\evil.test/'])assert.throws(()=>canonicalUrl(path,site));
 assert.throws(()=>canonicalUrl('/','http://lumejournal.com'));assert.throws(()=>head({path:'/en/calendar/'}));
});
test('Only verified translation pairs create reciprocal, language-correct alternates',()=>{
 const hu=head(),en=head({lang:'en',path:'/en/calendar/',altUrl:'/naptar/'});
 assert.deepEqual(hu.alternates.toSorted((a,b)=>a.lang.localeCompare(b.lang)),en.alternates.toSorted((a,b)=>a.lang.localeCompare(b.lang)));
 assert.equal(head({hasTranslation:false,altUrl:'/en/origins/'}).alternates.length,0);
 assert.throws(()=>head({altUrl:'/eredet/'}));assert.throws(()=>head({altUrl:'https://external.test/en/'}));
});
test('Unlaunched, error and preview pages do not emit indexing or hreflang signals',()=>{
 for(const extra of [{launched:false},{noindex:true}]){const h=head(extra);assert(!h.indexable);assert.equal(h.alternates.length,0);assert(h.robots.includes('noindex'));}
 assert.equal(head({path:'/naptar/?brand=seiko&month=2026-12'}).canonical,site+'/naptar/');
});
test('Quality descriptions are preserved; the fallback uses only an actual plain introduction',()=>{
 assert.equal(articleDescription('Pontos leírás.','Másik','Törzs'),'Pontos leírás.');
 assert.equal(articleDescription('','Meglévő felvezető.'),'Meglévő felvezető.');
 assert.equal(articleDescription(undefined,'','## Cím\n\n<!-- modell -->\n\nAz **óra** [szerkezete](/szerkezet/) megfigyelhető.'),'Az óra szerkezete megfigyelhető.');
 assert.throws(()=>articleDescription('','','![kép](/ora.png)'));
 assert.equal(articleDescription('','','---\n\n> Idézet\n\nValódi bevezető.'),'Valódi bevezető.');
});
test('Editorial dates are stable across rebuilds; invalid updates fail',()=>{
 const published=new Date('2026-10-09T01:00:00+02:00'),updated=new Date('2026-10-10T09:00:00Z');
 assert.deepEqual(articleDates(published,updated,now),articleDates(published,updated,new Date('2027-01-01')));
 assert.throws(()=>articleDates(published,new Date('2026-10-08'),now));assert.throws(()=>articleDates(published,new Date('2027-01-01'),now));
 assert.equal(articleDates(published,undefined,now).modified,undefined);
});
test('Schema factories describe a journal and visible collections, not invented commerce or events',()=>{
 const website=websiteSchema(site,'Órás folyóirat.',['https://www.instagram.com/lume_journal/']);
 assert.equal(website['@graph'][0]['@type'],'Organization');assert(!JSON.stringify(website).includes('SearchAction'));
 const collection=collectionSchema({site,lang:'hu',canonical:site+'/naptar/',title:'Naptár',description:'Megjelenések',items:[{name:'Rendelési ablak',url:site+'/naptar/#order'}]});
 for(const type of ['Product','Event','Offer','AggregateRating'])assert(!JSON.stringify(collection).includes('"'+type+'"'));
 const model=modelSchema({site,lang:'en',canonical:site+'/en/workshop/rotor/',title:'Rotor',description:'How it winds',articleUrl:site+'/en/movement/rotor/',workshopTitle:'Workshop',workshopUrl:site+'/en/workshop/'});
 assert.equal(model['@graph'][1].itemListElement[1].item,site+'/en/workshop/');
});
test('Social images need local HTTPS URLs, real dimensions and alt descriptions',()=>{
 assert.equal(head().image.src,site+'/og-image.png');
 for(const socialImage of [{src:'https://elsewhere.test/x.jpg',width:1200,height:630,alt:'Óra'},{src:'/x.jpg',width:0,height:630,alt:'Óra'},{src:'/x.jpg',width:1200,height:630,alt:''}])assert.throws(()=>head({socialImage}));
});
test('Calendar schema omits private candidates and never converts an order date into a launch',()=>{
 const entry={id:'order',brand:'Brand',brandKey:'brand',family:'Family',model:'Order window',reference:'REF',date:'2026-10-18',dateEnd:'2026-10-18',precision:'day',eventType:'preorder',image:'/img/calendar/watch.png',copy:{hu:{summary:'Rendelési ablak'},en:{summary:'Order window'}}};
 const hidden={...entry,id:'private',lifecycle:{editorial:'review'}};
 const expired={...entry,id:'old',date:'2026-09-01',dateEnd:'2026-09-01'};
 const schema=calendarSchema({site:new URL(site),lang:'hu',path:'/naptar/',title:'Naptár',description:'Megjelenések',entries:[entry,hidden,expired],now});
 assert.equal(schema.mainEntity.numberOfItems,1);assert.equal(schema.mainEntity.itemListElement[0].url,site+'/naptar/#order');
 assert(!JSON.stringify(schema).includes('releaseDate'));assert(!JSON.stringify(schema).includes('private'));
});
test('HTML inspection supports JSON-LD arrays and detects schema/meta/visible-date contradictions',()=>{
 const canonical=site+'/szerkezet/rotor/',published='2026-10-01T00:00:00.000Z';
 const schema=articleSchema({site,lang:'hu',canonical,title:'Rotor',description:'A rotor működése.',section:'Szerkezet',sectionUrl:site+'/szerkezet/',published});
 const html=`<html lang="hu"><head><meta property="article:published_time" content="${published}"><script type="application/ld+json">${JSON.stringify([websiteSchema(site,'Órák'),schema])}</script></head><body><article><h1>Rotor</h1><p>A rotor működése.</p><a rel="author">Írta: Lume</a><time datetime="${published}">Október 1.</time></article></body></html>`;
 const p=inspectHtml(html);assert.equal(p.schemas.length,4);assert.deepEqual(validateStructuredPage(p,canonical,now),[]);
 const bad=inspectHtml(html.replace('content="'+published+'"','content="2026-10-02"'));
 assert(validateStructuredPage(bad,canonical,now).some(e=>e.includes('publication schema/meta mismatch')));
 const fake=inspectHtml('<script type="application/ld+json">{"@type":"Event"}</script>');assert(validateStructuredPage(fake,canonical,now).length>0);
 assert(validateStructuredPage(fake,canonical,now).some(e=>e.includes('JSON-LD context')));
});
test('Sitemap reads real HTML translation pairs, excludes noindex and keeps lastmod stable',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'lume-seo-sitemap-')),out=pathToFileURL(directory+'/'),path=join(directory,'szerkezet','rotor');await mkdir(path,{recursive:true});
 const item={url:site+'/szerkezet/rotor/'};
 const html=`<meta name="robots" content="index,follow"><link rel="canonical" href="${item.url}"><link rel="alternate" hreflang="en" href="${site}/en/movement/rotor/"><meta property="article:modified_time" content="2026-10-02T00:00:00.000Z">`;
 await writeFile(join(path,'index.html'),html);
 const a=await sitemapMetadata(item,out),b=await sitemapMetadata(item,out);assert.deepEqual(a,b);assert.equal(a.lastmod,'2026-10-02T00:00:00.000Z');assert.equal(a.links[0].url,site+'/en/movement/rotor/');
 await writeFile(join(path,'index.html'),'<meta name="robots" content="noindex">');assert.equal(await sitemapMetadata(item,out),undefined);
 await writeFile(join(path,'index.html'),html.replace(item.url,site+'/another/'));await assert.rejects(()=>sitemapMetadata(item,out));
});
