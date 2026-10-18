import {createMarkdownProcessor} from '@astrojs/markdown-remark';
import {inspectHtml,attribute,textOf,elementsOf} from './seo-html.mjs';
const renderer=createMarkdownProcessor({syntaxHighlight:false,smartypants:false});
export async function readDirectory(markdown) {
  const page=inspectHtml((await(await renderer).render(markdown)).code),entries=[];
  let category='';
  for(const element of page.elements) {
    if(element.tagName==='h2')category=textOf(element);
    if(element.tagName!=='li')continue;
    const links=elementsOf(element).filter(n=>n.tagName==='a');
    if(links.length!==1)throw new Error('Each directory item must contain exactly one link');
    const link=links[0],label=textOf(link),text=textOf(element);
    if(!category||!text.startsWith(label))throw new Error('Invalid directory list structure');
    const tail=text.slice(label.length);
    if(tail&&!tail.startsWith(': '))throw new Error('Invalid directory description delimiter');
    entries.push({category,title:label,url:attribute(link,'href'),description:tail.slice(2)});
  }
  return {page,entries};
}
const fold=value=>value.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
export function findDirectoryEntries(entries,query,limit=5) {
  const words=fold(query).trim().split(/\s+/).filter(Boolean);
  if(!words.length)return [];
  return entries.map(entry=>({entry,matches:words.filter(word=>fold(entry.title+' '+entry.description).includes(word)).length}))
    .filter(result=>result.matches>0).sort((a,b)=>b.matches-a.matches||a.entry.url.localeCompare(b.entry.url)).slice(0,limit).map(result=>result.entry);
}
