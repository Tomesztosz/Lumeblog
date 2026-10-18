import type { ColumnKey, Lang } from '../i18n/ui';

export type JsonLd = Record<string, unknown>;
export interface SocialImage { src: string; width: number; height: number; alt: string }
export interface SeoHeadProps {
  lang: Lang;
  title?: string;
  description?: string;
  altUrl: string;
  active?: ColumnKey | 'about' | 'workshop' | 'calendar';
  /** A language-switch fallback is not evidence that a translation exists. */
  hasTranslation?: boolean;
  noindex?: boolean;
  ogType?: 'website' | 'article';
  socialImage?: SocialImage;
}
export interface ResolvedSeo {
  title: string;
  description: string;
  canonical: string;
  indexable: boolean;
  robots: string;
  alternates: { lang: string; url: string }[];
  image: SocialImage;
}

function siteOrigin(site: URL | string): string {
  const url = new URL(site);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash)
    throw new Error('SEO site must be an absolute HTTPS origin');
  return url.origin;
}

/** Known public document paths only; never guess a translated slug. */
export function canonicalUrl(path: string, site: URL | string): string {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\'))
    throw new Error('Canonical must use a local absolute document path');
  const url = new URL(path, siteOrigin(site));
  url.search = ''; url.hash = '';
  url.pathname = url.pathname.replace(/\/index\.html$/, '/');
  if (!url.pathname.endsWith('/') && !/\.[a-z0-9]+$/i.test(url.pathname)) url.pathname += '/';
  return url.href;
}

/** Idempotent branding, without shortening or rewriting the editorial title. */
export function seoTitle(title: string | undefined, fallback: string): string {
  const chosen = title?.trim() || fallback.trim();
  if (!chosen) throw new Error('Missing SEO title');
  const base = chosen.replace(/(?:\s*\|\s*Lume)+\s*$/i, '').trim() || 'Lume';
  return /\blume\b/i.test(base) ? base : `${base} | Lume`;
}

export function articleDescription(seo: string | undefined, description: string | undefined, body = ''): string {
  if (seo?.trim()) return seo.trim();
  if (description?.trim()) return description.trim();
  // A conservative last resort, not a generated summary or keyword template.
  const plain = body.replace(/<!--[\s\S]*?-->/g, '').replace(/```[\s\S]*?```/g, '')
    .split(/\r?\n\s*\r?\n/).find(p => p.trim() && !/^\s*(?:#|<|>|!\[|\||[-*+]\s|\d+\.\s)/.test(p)
      && !/^\s*(?:[-*_]\s*){3,}$/.test(p));
  const lead = plain?.replace(/!?\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/<[^>]*>/g, '')
    .replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
  if (!lead) throw new Error('Missing description and usable article introduction');
  return lead;
}

export function resolveSeo(input: SeoHeadProps & {
  path: string; site: URL | string; launched: boolean;
  fallbackTitle: string; fallbackDescription: string; fallbackAlt: string;
}): ResolvedSeo {
  if (!['hu', 'en'].includes(input.lang)) throw new Error('Unsupported SEO language');
  const canonical = canonicalUrl(input.path, input.site);
  const indexable = input.launched && !input.noindex;
  if (indexable && new URL(canonical).pathname.startsWith('/en/') !== (input.lang === 'en'))
    throw new Error('Document path and SEO language disagree');
  const alternates: ResolvedSeo['alternates'] = [];
  if (indexable && input.hasTranslation !== false) {
    const alternate = canonicalUrl(input.altUrl, input.site);
    if (alternate === canonical || new URL(alternate).pathname.startsWith('/en/') === (input.lang === 'en'))
      throw new Error('Translation must be a distinct public path in the other language');
    alternates.push({lang: input.lang, url: canonical}, {lang: input.lang === 'hu' ? 'en' : 'hu', url: alternate},
      // Hungarian is the site's real default for visitors without a supported language.
      {lang: 'x-default', url: input.lang === 'hu' ? canonical : alternate});
  }
  const image = input.socialImage ?? {src:'/og-image.png',width:1200,height:630,alt:input.fallbackAlt};
  const imageUrl = new URL(image.src, siteOrigin(input.site));
  if (imageUrl.origin !== siteOrigin(input.site) || imageUrl.protocol !== 'https:' || !image.alt.trim() ||
    !Number.isInteger(image.width) || image.width <= 0 || !Number.isInteger(image.height) || image.height <= 0)
    throw new Error('Invalid local social image');
  return {title:seoTitle(input.title,input.fallbackTitle),description:articleDescription(input.description,input.fallbackDescription),
    canonical,indexable,robots:indexable?'index, follow, max-image-preview:large':'noindex, follow',alternates,
    image:{...image,src:imageUrl.href}};
}

export function articleDates(published: Date, updated?: Date, now = new Date()) {
  if (!Number.isFinite(+published) || (updated && (!Number.isFinite(+updated) || updated < published || updated > now)))
    throw new Error('Invalid editorial publication/update date');
  return {published:published.toISOString(),modified:updated?.toISOString()};
}

export function websiteSchema(site: URL | string, description: string, sameAs: string[] = []): JsonLd {
  const origin = siteOrigin(site),organizationId = `${origin}/#organization`;
  return {'@context':'https://schema.org','@graph':[
    {'@type':'Organization','@id':organizationId,name:'Lume',url:`${origin}/`,description,
      logo:{'@type':'ImageObject',url:`${origin}/apple-touch-icon.png`,width:180,height:180},
      ...(sameAs.length ? {sameAs:sameAs.filter(url=>new URL(url).protocol==='https:')} : {})},
    {'@type':'WebSite','@id':`${origin}/#website`,name:'Lume',alternateName:'Lume Journal',url:`${origin}/`,
      inLanguage:['hu-HU','en-GB'],publisher:{'@id':organizationId}},
  ]};
}

export function breadcrumbSchema(canonical: string, items: {name:string;url:string}[]): JsonLd {
  return {'@type':'BreadcrumbList','@id':`${canonical}#breadcrumb`,itemListElement:items.map((item,index)=>({
    '@type':'ListItem',position:index+1,name:item.name,item:item.url,
  }))};
}

export function articleSchema(input: {
  site: URL | string; lang: Lang; canonical: string; title: string; description: string;
  section: string; sectionUrl: string; published: string; modified?: string; image?: SocialImage;
}): JsonLd {
  const root=siteOrigin(input.site),organizationId=`${root}/#organization`;
  return {'@context':'https://schema.org','@graph':[
    {'@type':'BlogPosting','@id':`${input.canonical}#article`,headline:input.title,description:input.description,
      datePublished:input.published,...(input.modified?{dateModified:input.modified}:{}),
      author:{'@type':'Organization','@id':organizationId,name:'Lume',url:`${root}/`},publisher:{'@id':organizationId},
      isAccessibleForFree:true,inLanguage:input.lang==='hu'?'hu-HU':'en-GB',articleSection:input.section,
      mainEntityOfPage:{'@type':'WebPage','@id':input.canonical},isPartOf:{'@id':`${root}/#website`},
      ...(input.image?{image:{'@type':'ImageObject',url:new URL(input.image.src,root).href,
        width:input.image.width,height:input.image.height,caption:input.image.alt}}:{})},
    breadcrumbSchema(input.canonical,[{name:'Lume',url:`${root}${input.lang==='hu'?'/':'/en/'}`},
      {name:input.section,url:input.sectionUrl},{name:input.title,url:input.canonical}]),
  ]};
}

export function collectionSchema(input: {
  site: URL | string; lang: Lang; canonical: string; title: string; description: string;
  items: {name:string;url:string;description?:string;image?:string}[];
}): JsonLd {
  return {'@context':'https://schema.org','@type':'CollectionPage','@id':`${input.canonical}#collection`,
    name:input.title,description:input.description,url:input.canonical,inLanguage:input.lang==='hu'?'hu-HU':'en-GB',
    isPartOf:{'@id':`${siteOrigin(input.site)}/#website`},mainEntity:{'@type':'ItemList',numberOfItems:input.items.length,
      itemListElement:input.items.map((item,index)=>({'@type':'ListItem',position:index+1,...item}))}};
}

export function modelSchema(input: {
  site: URL | string; lang: Lang; canonical: string; title:string;description:string;articleUrl:string;workshopTitle:string;workshopUrl:string;
}): JsonLd {
  const root=siteOrigin(input.site);
  return {'@context':'https://schema.org','@graph':[
    {'@type':'WebPage','@id':input.canonical,url:input.canonical,name:input.title,description:input.description,
      inLanguage:input.lang==='hu'?'hu-HU':'en-GB',isAccessibleForFree:true,isPartOf:{'@id':`${root}/#website`},relatedLink:input.articleUrl},
    breadcrumbSchema(input.canonical,[{name:'Lume',url:`${root}${input.lang==='hu'?'/':'/en/'}`},
      {name:input.workshopTitle,url:input.workshopUrl},{name:input.title,url:input.canonical}]),
  ]};
}
