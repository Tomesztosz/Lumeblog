import {createMarkdownProcessor} from '@astrojs/markdown-remark';
import {parseFragment, type DefaultTreeAdapterMap} from 'parse5';
import {articleDescription} from './seo.ts';

type Node=DefaultTreeAdapterMap['node'];
type Element=DefaultTreeAdapterMap['element'];
const renderer=createMarkdownProcessor({syntaxHighlight:false,smartypants:false});
const normalize=(text:string)=>text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'')
  .replace(/\s*\u2014\s*/g,', ').replace(/\s+/g,' ').trim();
const inline=new Set(['p','a','span','em','strong','b','i','code','del','s','sup','sub','br']);
function plain(node:Node):string {
  if(node.nodeName==='#text')return (node as DefaultTreeAdapterMap['textNode']).value;
  if('tagName' in node) {
    const element=node as Element;
    if(!inline.has(element.tagName)||element.attrs.some(a=>a.name==='hidden'||(a.name==='aria-hidden'&&a.value==='true')))return '';
    if(element.tagName==='br')return ' ';
  }
  const text='childNodes' in node?node.childNodes.map(plain).join(''):'';
  return 'tagName' in node&&node.tagName==='p'?text+' ':text;
}
/** Reuse Astro's Markdown renderer, not scraping, AI or a parallel article parser. */
export async function directoryPlainText(value:string):Promise<string> {
  const rendered=await (await renderer).render(value);
  return normalize(plain(parseFragment(rendered.code)));
}
export interface SummaryInput {llmsSummary?:string;seoDescription?:string;description?:string;body?:string}
export interface DirectorySummary {text?:string;source:'llmsSummary'|'seoDescription'|'description'|'intro'|'none';warnings:string[]}
export async function directorySummary(input:SummaryInput):Promise<DirectorySummary> {
  const warnings:string[]=[];
  for(const field of ['llmsSummary','seoDescription','description'] as const) {
    if(!input[field]?.trim())continue;
    const text=await directoryPlainText(input[field]!);
    if(text)return {text,source:field,warnings};
    warnings.push(`${field}: no safe prose; review the editorial description.`);
  }
  try {
    // Existing shared SEO fallback selects an actual prose paragraph, never a heading/image/code block.
    const text=await directoryPlainText(articleDescription(undefined,undefined,input.body??''));
    if(text&&/[.!?…]["'»”’)]?$/.test(text))return {text,source:'intro',warnings};
  } catch { /* An absent safe paragraph is not permission to invent a description. */ }
  return {source:'none',warnings:[...warnings,'No complete, safe description; exact title and URL only.']};
}
