import {mkdir,writeFile} from 'node:fs/promises';
import config from '../data/llms-directory.json';
import {LLMS_COPY,UI,COLUMN_KEYS,archiveUrl,aboutUrl,columnUrl,workshopUrl,otherLang,type Lang} from '../i18n/ui';
import {getPosts,getTranslation,urlOf,type Post} from './posts';
import {sharedModel} from './shared-models';
import {entitiesOf} from './content-graph.mjs';
import {orderedPublishedPosts} from './published-feed.mjs';
import {calendarUrl} from './releases';
import {journalMetadata} from './journal-metadata';
import type {DesignView} from './design';
import {canonicalUrl,resolveSeo} from './seo';
import {LAUNCHED} from '../site';
import {buildDirectory,type DirectoryCandidate,type DirectoryResult} from './llms';

/** Build-only adapter. Routes, publication, twins and metadata come from the existing journal. */
export async function collectDirectory(site:URL,now=new Date()):Promise<DirectoryResult> {
  const posts=orderedPublishedPosts((await Promise.all([getPosts('hu'),getPosts('en')])).flat(),now);
  const candidates:DirectoryCandidate[]=[];
  async function page(input:{lang:Lang;view:DesignView;path:string;id:string;contentId:string;kind:DirectoryCandidate['kind'];post?:Post;column?:(typeof COLUMN_KEYS)[number]}) {
    const {lang,post,view,path,column}=input,t=UI[lang];
    const translation=post?await getTranslation(post,otherLang(lang)):undefined;
    const twin=translation&&orderedPublishedPosts([translation],now)[0];
    const metadata=await journalMetadata({lang,view,column,post,posts:posts.filter(p=>p.data.lang===lang),twin,site});
    const seo=resolveSeo({...metadata,lang,path,site,launched:LAUNCHED,fallbackTitle:t.siteTitle,fallbackDescription:t.siteDescription,fallbackAlt:t.tagline});
    const model=post?sharedModel(post):undefined;
    candidates.push({id:input.id,contentId:input.contentId,lang,kind:input.kind,url:seo.canonical,noindex:!seo.indexable,
      title:post?(view==='model'?model!.title:post.data.heading??post.data.title):metadata.title??t.siteTitle,
      ...(post&&view==='article'?{llmsSummary:post.data.llmsSummary,seoDescription:post.data.seoDescription,description:post.data.description,body:post.body,
        column:post.data.column,entities:entitiesOf(post),date:post.data.date,draft:post.data.draft,hasModel:Boolean(model)}:
        {description:metadata.description??t.siteDescription,...(post?{date:post.data.date,draft:post.data.draft}:{})})});
  }
  for(const post of posts) {
    const key=post.data.translationKey??post.id;
    await page({lang:post.data.lang,view:'article',post,path:urlOf(post),id:`article:${post.id}`,contentId:key,kind:'article'});
    const model=sharedModel(post);
    if(model)await page({lang:post.data.lang,view:'model',post,path:model.url,id:`model:${post.id}`,contentId:model.key,kind:'model'});
  }
  for(const lang of ['hu','en'] as const) {
    for(const [view,path,kind] of [
      ['home',lang==='hu'?'/':'/en/','navigation'],['archive',archiveUrl(lang),'navigation'],
      ['about',aboutUrl(lang),'navigation'],['workshop',workshopUrl(lang),'navigation'],['calendar',calendarUrl(lang),'calendar'],
    ] as const)await page({lang,view,path,kind,id:`${view}:${lang}`,contentId:view});
    for(const column of COLUMN_KEYS)await page({lang,view:'column',column,path:columnUrl(lang,column),id:`column:${column}:${lang}`,contentId:`column:${column}`,kind:'navigation'});
  }
  const result=await buildDirectory({candidates,config,copy:LLMS_COPY,site,now,launched:LAUNCHED});
  await mkdir('output/llms',{recursive:true});
  await writeFile('output/llms/manifest.json',JSON.stringify({version:1,launched:LAUNCHED,site:canonicalUrl('/',site),maxMainBytes:config.maxMainBytes,mainBytes:result.mainBytes,
    hasFull:Boolean(result.full),warnings:result.warnings,entries:result.entries.map(e=>({id:e.id,contentId:e.contentId,lang:e.lang,kind:e.kind,category:e.category,url:e.url,title:e.label,summary:e.summary})),mainUrls:result.mainEntries.map(e=>e.url)},null,2));
  return result;
}
