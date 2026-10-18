import {canonicalUrl} from './seo.ts';
import {orderedPublishedPosts} from './published-feed.mjs';
import {directoryPlainText,directorySummary,type SummaryInput,type DirectorySummary} from './llms-description.ts';
import type {Lang} from '../i18n/ui.ts';

export type DirectoryKind='article'|'model'|'calendar'|'navigation';
export interface DirectoryRule {id:string;kind:string;column?:string;requiredEntity?:string}
export interface DirectoryConfig {version:number;maxMainBytes:number;categories:DirectoryRule[]}
export interface DirectoryCopy {
  name:string;hu:{summary:string;detail:string;complete:string;completeNote:string};en:{summary:string;detail:string;complete:string;completeNote:string};
  categories:Record<string,{hu:string;en:string}>;
}
export interface DirectoryCandidate extends SummaryInput {
  id:string;contentId:string;lang:Lang;kind:DirectoryKind;title:string;url:string;
  column?:string;entities?:string[];noindex?:boolean;draft?:boolean;date?:Date|string;featured?:boolean;hasModel?:boolean;
}
export interface DirectoryEntry extends DirectoryCandidate {category:string;label:string;summary:DirectorySummary}
export interface DirectoryResult {main:string;full?:string;entries:DirectoryEntry[];mainEntries:DirectoryEntry[];warnings:string[];mainBytes:number}
export const markdownText=(text:string)=>text.replace(/\s+/g,' ').trim().replace(/[\\`*_{}\[\]()<>#+.!|~&]/g,'\\$&');
const byteLength=(text:string)=>new TextEncoder().encode(text).length;
export function categoryOf(entry:DirectoryCandidate,config:DirectoryConfig):string {
  const rule=config.categories.find(c=>c.kind===entry.kind&&(!c.column||c.column===entry.column)&&(!c.requiredEntity||entry.entities?.includes(c.requiredEntity)));
  if(!rule)throw new Error(`No configured directory category: ${entry.id}`);
  return rule.id;
}
/** Exact canonical targets only; never silently clean a query, redirect, or foreign URL. */
export function directoryUrl(value:string,site:URL|string):string {
  const origin=new URL(canonicalUrl('/',site)).origin,url=new URL(value);
  if(url.origin!==origin||url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.href!==value||canonicalUrl(url.pathname,site)!==value)
    throw new Error('Directory URL must be an exact canonical target on the configured site');
  return value;
}
function compare(a:DirectoryEntry,b:DirectoryEntry):number {
  return a.contentId<b.contentId?-1:a.contentId>b.contentId?1:a.lang===b.lang?0:a.lang==='hu'?-1:1;
}
function render(entries:DirectoryEntry[],config:DirectoryConfig,copy:DirectoryCopy,site:URL|string,compact=false):string {
  const text=[`# ${markdownText(copy.name)}`,'',`> ${markdownText(copy.en.summary)} ${markdownText(copy.hu.summary)}`,'',markdownText(copy.en.detail),'',markdownText(copy.hu.detail)];
  for(const category of config.categories) {
    const selected=entries.filter(e=>e.category===category.id).toSorted(compare);
    if(!selected.length&&!(compact&&category.id==='optional'))continue;
    const label=copy.categories[category.id];
    text.push('',category.id==='optional'?'## Optional':`## ${markdownText(label.en)} / ${markdownText(label.hu)}`,'');
    for(const entry of selected) {
      const url=entry.url.replace(/\(/g,'%28').replace(/\)/g,'%29');
      text.push(`- [${entry.lang.toUpperCase()}: ${markdownText(entry.label)}](${url})${entry.summary.text?`: ${markdownText(entry.summary.text)}`:''}`);
    }
    if(compact&&category.id==='optional')text.push(`- [${markdownText(copy.en.complete)} / ${markdownText(copy.hu.complete)}](${canonicalUrl('/llms-full.txt',site)}): ${markdownText(copy.en.completeNote)} ${markdownText(copy.hu.completeNote)}`);
  }
  return text.join('\n')+'\n';
}
export async function buildDirectory({candidates,config,copy,site,now=new Date(),launched=true}: {
  candidates:DirectoryCandidate[];config:DirectoryConfig;copy:DirectoryCopy;site:URL|string;now?:Date;launched?:boolean;
}):Promise<DirectoryResult> {
  canonicalUrl('/',site);
  if(config.version!==1||!Number.isSafeInteger(config.maxMainBytes)||config.maxMainBytes<1024)throw new Error('Invalid directory configuration');
  const categoryIds=config.categories.map(c=>c.id);
  if(new Set(categoryIds).size!==categoryIds.length||!categoryIds.includes('optional')||categoryIds.some(id=>!copy.categories[id]))throw new Error('Missing or duplicate directory category labels');
  const dated=(e:DirectoryCandidate)=>e.kind==='article'||e.kind==='model'||e.date!==undefined;
  const publishedIds=new Set(orderedPublishedPosts(candidates.filter(dated).map(e=>({id:e.id,data:{draft:e.draft,date:e.date??'invalid'}})),now).map(e=>e.id));
  const eligible=launched?candidates.filter(e=>!e.noindex&&!e.draft&&(!dated(e)||publishedIds.has(e.id))):[];
  const seenUrls=new Map<string,DirectoryCandidate>(),seenIdentity=new Map<string,string>(),warnings:string[]=[];
  const entries:DirectoryEntry[]=[];
  for(const candidate of eligible) {
    if(!['hu','en'].includes(candidate.lang)||!candidate.contentId||!candidate.id)throw new Error('Missing directory identity or language');
    const url=directoryUrl(candidate.url,site);
    if(new URL(url).pathname.startsWith('/en/')!==(candidate.lang==='en'))throw new Error(`Directory URL language mismatch: ${candidate.id}`);
    const identity=JSON.stringify([candidate.kind,candidate.contentId,candidate.lang]);
    const prior=seenUrls.get(url);
    if(prior) {
      if(JSON.stringify(prior)!==JSON.stringify(candidate))throw new Error('Conflicting directory records share a canonical URL');
      warnings.push(`Duplicate identical record omitted: ${candidate.id}`);continue;
    }
    if(seenIdentity.has(identity))throw new Error('Ambiguous translation identity in one language');
    seenIdentity.set(identity,url);seenUrls.set(url,candidate);
    const label=await directoryPlainText(candidate.title);
    if(!label)throw new Error(`No safe directory title: ${candidate.id}`);
    const summary=await directorySummary(candidate);
    warnings.push(...summary.warnings.map(w=>`${candidate.id}: ${w}`));
    entries.push({...candidate,url,label,summary,category:categoryOf(candidate,config)});
  }
  // Different translations may have different public slugs, never inferred counterparts.
  const full=render(entries,config,copy,site);
  const pairCategories=new Map<string,string>();
  for(const entry of entries) {
    const key=JSON.stringify([entry.kind,entry.contentId]),prior=pairCategories.get(key);
    if(prior&&prior!==entry.category)throw new Error('Translation pair has conflicting directory categories');
    pairCategories.set(key,entry.category);
  }
  if(byteLength(full)<=config.maxMainBytes)return {main:full,entries,mainEntries:entries,warnings,mainBytes:byteLength(full)};
  // Keep bilingual content groups intact; round-robin categories gives broad coverage.
  const groups=new Map<string,DirectoryEntry[]>();
  for(const e of entries.toSorted(compare)) {const key=JSON.stringify([e.kind,e.contentId]);groups.set(key,[...(groups.get(key)??[]),e]);}
  const queues=config.categories.map(category=>[...groups.values()].filter(group=>group[0].category===category.id)
    .sort((a,b)=>Number(Boolean(b[0].featured))-Number(Boolean(a[0].featured))||Number(Boolean(b[0].hasModel))-Number(Boolean(a[0].hasModel))||compare(a[0],b[0])));
  const chosen:DirectoryEntry[]=[];
  if(byteLength(render(chosen,config,copy,site,true))>config.maxMainBytes)throw new Error('Directory size budget cannot fit its introduction and full-directory link');
  while(queues.some(queue=>queue.length))for(const queue of queues) {
    const group=queue.shift();if(!group)continue;
    if(byteLength(render([...chosen,...group],config,copy,site,true))<=config.maxMainBytes)chosen.push(...group);
  }
  const main=render(chosen,config,copy,site,true);
  return {main,full,entries,mainEntries:chosen,warnings,mainBytes:byteLength(main)};
}
