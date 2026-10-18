import graph from '../data/content-graph.json' with { type: 'json' };
import editorialGroups from '../data/article-relations.json' with { type: 'json' };
import { orderedPublishedPosts } from './published-feed.mjs';

export { graph };
// Internal reader-relevance parameters, not search-engine ranking factors.
export const RELEVANCE = Object.freeze({reference:24,model:20,family:16,movement:14,principle:10,complication:8,person:7,era:4,topic:1,brand:1,section:0,workshop:0,event:0});
export const entityKind = id => id.split(':')[0];
const keyOf = post => post.data.translationKey;
export function entitiesOf(post) {
  return [...(graph.articles[keyOf(post)]?.entities ?? []), `section:${post.data.column}`];
}
const fold = text => String(text).normalize('NFKC').toLocaleLowerCase('en').trim();
// Exact, type-scoped aliases only. Never scan prose for names or inherit a family as a reference.
export function resolveEntity(value, kind) {
  const matches = Object.entries(graph.entities).filter(([id,e]) => (!kind || entityKind(id) === kind) &&
    [id,e.hu,e.en,...e.aliases].some(alias => fold(alias) === fold(value)));
  return matches.length === 1 ? matches[0][0] : undefined;
}
export function relevance(source, candidate) {
  const sourceKey=keyOf(source), candidateKey=keyOf(candidate);
  const editorial=editorialGroups.some(group=>group.includes(sourceKey)&&group.includes(candidateKey));
  const pathway=graph.pathways.find(p=>p.keys.includes(sourceKey)&&p.keys.includes(candidateKey));
  const own=new Set(entitiesOf(source));
  const shared=entitiesOf(candidate).filter(id=>own.has(id));
  const kinds=shared.map(entityKind);
  const score=shared.reduce((sum,id)=>sum+(RELEVANCE[entityKind(id)]??0),0);
  const precise=kinds.some(kind=>['reference','model','family','movement','principle','complication'].includes(kind));
  return {editorial,pathway,shared,score,public:editorial||Boolean(pathway)||precise};
}
/**
 * @template {{id:string,data:{draft?:boolean,date:Date|string,translationKey?:string,lang:string,column:string}}} T
 * @param {T} source
 * @param {T[]} posts
 */
export function rankRelated(source, posts, {now=new Date(),limit=3,includeSuggestions=false}={}) {
  if (!orderedPublishedPosts([source],now).length) return [];
  const seen=new Set([source.id, keyOf(source)].filter(Boolean));
  return orderedPublishedPosts(posts,now).filter(p=>{
    if(p.data.lang!==source.data.lang||seen.has(p.id)||(keyOf(p)&&seen.has(keyOf(p)))) return false;
    seen.add(p.id);if(keyOf(p))seen.add(keyOf(p));return true;
  }).map(post=>({post,...relevance(source,post)})).filter(r=>r.public||(includeSuggestions&&r.score>0))
    .sort((a,b)=>Number(b.editorial)-Number(a.editorial)||Number(Boolean(b.pathway))-Number(Boolean(a.pathway))||
      b.score-a.score||new Date(b.post.data.date)-new Date(a.post.data.date)||a.post.id.localeCompare(b.post.id))
    .slice(0,Math.max(0,Math.min(limit,20)));
}
export function relatedReason(result, lang, editorialLabel) {
  if(result.pathway) return result.pathway[lang];
  if(result.editorial) return editorialLabel;
  const strongest=result.shared.toSorted((a,b)=>RELEVANCE[entityKind(b)]-RELEVANCE[entityKind(a)])[0];
  return graph.entities[strongest]?.[lang] ?? '';
}
export function collectionContent(collection, posts, lang, now=new Date()) {
  const published=orderedPublishedPosts(posts,now).filter(p=>p.data.lang===lang);
  return collection.articles.map(key=>published.find(p=>keyOf(p)===key)).filter(Boolean);
}
export function calendarArticles(eventId, posts, lang, now=new Date()) {
  const keys=graph.calendar.filter(link=>link.event===eventId).map(link=>link.article);
  return orderedPublishedPosts(posts,now).filter(p=>p.data.lang===lang&&keys.includes(keyOf(p)));
}
