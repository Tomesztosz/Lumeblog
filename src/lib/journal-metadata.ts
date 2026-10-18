import { getImage } from 'astro:assets';
import { COLUMNS, COLUMN_KEYS, UI, JOURNAL_META, archiveUrl, columnUrl, workshopUrl, aboutUrl, otherLang, type Lang, type ColumnKey } from '../i18n/ui';
import { urlOf, type Post } from './posts';
import type { DesignView } from './design';
import { CALENDAR_UI, calendarEntries, calendarUrl } from './releases';
import { sharedModel, publicModelPosts } from './shared-models';
import { articleDescription, articleDates, articleSchema, collectionSchema, modelSchema, type JsonLd, type SeoHeadProps, type SocialImage } from './seo';
import { calendarSchema } from './calendar-seo';

export interface JournalMetadata extends Omit<SeoHeadProps,'lang'> {
  published?:string;
  modified?:string;
  section?:string;
  structuredData?:JsonLd;
}

async function socialImageOf(post:Post,format:'png'|'webp'='webp'):Promise<SocialImage|undefined> {
  const cover=post.data.cover;
  if(!cover)return undefined;
  const image=await getImage({src:cover.src,width:Math.min(1200,cover.src.width),format});
  return {src:image.src,width:Number(image.attributes.width),height:Number(image.attributes.height),alt:cover.alt};
}

/** Shared by every public page; no editorial text, URL or publication date is rewritten. */
export async function journalMetadata({lang,view,column,post,posts,twin,site}: {
  lang:Lang;view:DesignView;column?:ColumnKey;post?:Post;posts:Post[];twin?:Post;site:URL;
}):Promise<JournalMetadata> {
  const t=UI[lang],other=otherLang(lang),absolute=(path:string)=>new URL(path,site).href;
  if(post&&twin&&(twin.data.lang===lang||!post.data.translationKey||twin.data.translationKey!==post.data.translationKey))
    throw new Error(`Unverified translation pair: ${post.id}`);
  if(view==='model'&&post){
    const model=sharedModel(post)!;
    return {title:model.title,description:model.description,
      altUrl:twin?sharedModel(twin)?.url??workshopUrl(other):workshopUrl(other),
      hasTranslation:Boolean(twin&&sharedModel(twin)),ogType:'website',socialImage:await socialImageOf(post,'png'),
      structuredData:modelSchema({site,lang,canonical:absolute(model.url),title:model.title,description:model.description,
        articleUrl:absolute(urlOf(post)),workshopTitle:t.workshop,workshopUrl:absolute(workshopUrl(lang))})};
  }
  if(view==='article'&&post){
    const section=COLUMNS[post.data.column][lang],description=articleDescription(post.data.seoDescription,post.data.description,post.body),
      dates=articleDates(post.data.date,post.data.updated),socialImage=await socialImageOf(post);
    return {title:post.data.seoTitle?.trim()||post.data.title,description,
      altUrl:twin?urlOf(twin):columnUrl(other,post.data.column),hasTranslation:Boolean(twin),ogType:'article',
      socialImage,...dates,section:section.name,
      structuredData:articleSchema({site,lang,canonical:absolute(urlOf(post)),title:post.data.heading??post.data.title,description,
        section:section.name,sectionUrl:absolute(columnUrl(lang,post.data.column)),...dates,image:socialImage})};
  }
  if(view==='column'&&column){
    const c=COLUMNS[column][lang];
    return {title:c.seoTitle,description:c.seoDescription,altUrl:columnUrl(other,column),
      structuredData:collectionSchema({site,lang,canonical:absolute(columnUrl(lang,column)),title:c.seoTitle,description:c.seoDescription,
        items:posts.filter(p=>p.data.column===column).map(p=>({name:p.data.title,url:absolute(urlOf(p))}))})};
  }
  if(view==='about')return {title:JOURNAL_META[lang].aboutTitle,description:JOURNAL_META[lang].aboutDescription,altUrl:aboutUrl(other)};
  if(view==='404')return {title:'404',description:JOURNAL_META[lang].notFoundDescription,altUrl:'/en/',noindex:true,hasTranslation:false};
  if(view==='archive')return {title:t.archiveSeoTitle,description:t.archiveDescription,altUrl:archiveUrl(other),
    structuredData:collectionSchema({site,lang,canonical:absolute(archiveUrl(lang)),title:t.archiveSeoTitle,description:t.archiveDescription,
      items:COLUMN_KEYS.flatMap(key=>posts.filter(p=>p.data.column===key)).map(p=>({name:p.data.title,url:absolute(urlOf(p))}))})};
  if(view==='workshop')return {title:t.workshopSeoTitle,description:t.workshopSeoDescription,altUrl:workshopUrl(other),
    structuredData:collectionSchema({site,lang,canonical:absolute(workshopUrl(lang)),title:t.workshopSeoTitle,description:t.workshopSeoDescription,
      items:publicModelPosts(posts).map(p=>({name:sharedModel(p)!.title,url:absolute(sharedModel(p)!.url)}))})};
  if(view==='calendar'){
    const c=CALENDAR_UI[lang];
    return {title:c.seoTitle,description:c.seoDescription,altUrl:calendarUrl(other),
      structuredData:calendarSchema({site,lang,path:calendarUrl(lang),title:c.seoTitle,description:c.seoDescription,entries:calendarEntries})};
  }
  return {altUrl:lang==='hu'?'/en/':'/'};
}
