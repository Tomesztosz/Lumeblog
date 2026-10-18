import {attribute,textOf} from './seo-html.mjs';
const normalized=value=>String(value??'').replace(/\s+/g,' ').trim();
const types=node=>Array.isArray(node?.['@type'])?node['@type']:[node?.['@type']];
export function schemaObjects(value){
  if(Array.isArray(value))return value.flatMap(schemaObjects);
  if(!value||typeof value!=='object')return [];
  return [value,...Object.values(value).flatMap(schemaObjects)];
}

/** Project regression checks, not a claim of Google rich-result eligibility. */
export function validateStructuredPage(page,url,now=new Date()){
  const errors=[],check=(condition,message)=>{if(!condition)errors.push(`${url}: ${message}`);};
  const documents=(page.schemaDocuments||[]).flat(Infinity);
  check(documents.length>0,'missing JSON-LD');
  for(const document of documents)check(document?.['@context']==='https://schema.org','missing/unsupported JSON-LD context');
  const objects=page.schemas.flatMap(schemaObjects),ids=new Set();
  for(const node of page.schemas){
    check(Boolean(node&&typeof node==='object'&&!Array.isArray(node)&&node['@type']),'untyped JSON-LD root');
    if(node?.['@id']){check(!ids.has(node['@id']),'duplicate JSON-LD definition');ids.add(node['@id']);}
  }
  for(const node of objects){
    if(types(node).some(t=>['Product','Event','Review','AggregateRating','FAQPage','SearchAction'].includes(t)))
      check(false,`unsupported editorial schema: ${types(node).join(',')}`);
    if(types(node).includes('BreadcrumbList')){
      check(Array.isArray(node.itemListElement)&&node.itemListElement.length>=2,'incomplete breadcrumb');
      for(const [i,item]of (node.itemListElement||[]).entries()){
        check(item.position===i+1&&Boolean(item.name),'invalid breadcrumb position/name');
        check(typeof item.item==='string'&&item.item.startsWith(new URL(url).origin+'/'),'breadcrumb must use a local absolute URL');
      }
    }
    if(types(node).includes('ItemList')){
      const items=node.itemListElement||[];
      check(Array.isArray(items),'invalid ItemList');
      if(node.numberOfItems!==undefined)check(node.numberOfItems===items.length,'ItemList count differs');
      const urls=new Set();
      for(const [i,item]of items.entries()){
        check(item.position===i+1&&Boolean(item.name),'invalid list position/name');
        check(typeof item.url==='string'&&item.url.startsWith(new URL(url).origin+'/'),'collection item must link to Lume content');
        check(!urls.has(item.url),'duplicate collection item');urls.add(item.url);
      }
    }
  }
  const article=page.schemas.find(s=>types(s).some(t=>['Article','BlogPosting','NewsArticle'].includes(t)));
  if(article){
    const pub=article.datePublished,modified=article.dateModified;
    check(Number.isFinite(Date.parse(pub))&&new Date(pub)<=now,'invalid/future datePublished');
    check(page.meta('article:published_time')[0]===pub,'publication schema/meta mismatch');
    check(modified?Number.isFinite(Date.parse(modified))&&new Date(modified)>=new Date(pub)&&new Date(modified)<=now:true,'invalid dateModified');
    check((page.meta('article:modified_time')[0]||undefined)===modified,'modification schema/meta mismatch');
    check(page.elements.some(n=>n.tagName==='time'&&attribute(n,'datetime')===pub),'publication date missing from initial HTML');
    if(modified)check(page.elements.some(n=>n.tagName==='time'&&attribute(n,'datetime')===modified),'update date missing from initial HTML');
    const author=page.elements.find(n=>(attribute(n,'rel')||'').split(/\s+/).includes('author'));
    check(normalized(textOf(author)).includes(article.author?.name),'schema author differs from visible byline');
    check(article.inLanguage?.split('-')[0]===page.lang,'article schema language mismatch');
    check(page.schemas.some(n=>types(n).includes('Organization')&&n['@id']===article.publisher?.['@id']),'unresolved publisher');
    const content=page.elements.find(n=>n.tagName==='article');
    check(Boolean(content)&&page.elements.some(n=>n.tagName==='p'&&normalized(textOf(n))),'article text missing from initial HTML');
  }
  for(const node of page.schemas.filter(n=>types(n).some(t=>['WebPage','CollectionPage'].includes(t)))){
    check(node.url===url,'page schema URL differs from canonical');
    check(node.inLanguage?.split('-')[0]===page.lang,'page schema language mismatch');
  }
  return errors;
}
