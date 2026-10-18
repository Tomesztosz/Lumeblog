import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {graph,entityKind,rankRelated,collectionContent} from '../src/lib/content-graph.mjs';
import {MODEL_NAMES} from '../src/lib/design-models.mjs';
import {orderedPublishedPosts} from '../src/lib/published-feed.mjs';
import {readPosts,sourceUrlOf} from './lib/content-inventory.mjs';
import {MODEL_READING_GUIDES} from '../src/i18n/ui.ts';

const posts=await readPosts(),now=new Date(),kinds=new Set(['brand','family','model','reference','movement','complication','principle','era','person','topic','section','workshop','event']);
const events=[...JSON.parse(await readFile('src/data/releases.json','utf8')),...JSON.parse(await readFile('src/data/announcements.json','utf8'))];
const aliases=new Map(),fold=text=>text.normalize('NFKC').toLowerCase().trim();
for(const [id,entity] of Object.entries(graph.entities)) {
  assert(/^[a-z]+:[a-z0-9-]+$/.test(id)&&kinds.has(entityKind(id)),`Invalid entity ID: ${id}`);
  assert(entity.hu.trim()&&entity.en.trim()&&Array.isArray(entity.aliases),`Invalid labels: ${id}`);
  if(entity.parent) {assert(graph.entities[entity.parent],`Missing parent: ${id}`);const seen=new Set([id]);let p=entity.parent;while(p){assert(!seen.has(p),`Entity cycle: ${id}`);seen.add(p);p=graph.entities[p]?.parent;}}
  for(const name of new Set([id,entity.hu,entity.en,...entity.aliases].map(fold))) {
    const key=`${entityKind(id)}:${name}`;assert(!aliases.has(key)||aliases.get(key)===id,`Ambiguous alias: ${key}`);aliases.set(key,id);
  }
}
const keys=new Set(posts.map(p=>p.data.translationKey).filter(Boolean));
const models=[...MODEL_NAMES,'co-axial','rattrapante','ugro-masodperc'];
for(const model of models)assert(MODEL_READING_GUIDES[model]?.hu&&MODEL_READING_GUIDES[model]?.en,`Missing model guide: ${model}`);
for(const [key,assignment] of Object.entries(graph.articles)) {
  assert(keys.has(key),`Missing article: ${key}`);
  assert.equal(new Set(assignment.entities).size,assignment.entities.length,`Duplicate binding: ${key}`);
  assert(['brand-story','model-story','model-comparison','history','mechanism'].includes(assignment.intent),`Invalid intent: ${key}`);
  const pair=posts.filter(p=>p.data.translationKey===key);
  assert.equal(pair.filter(p=>p.data.lang==='hu').length,1,`Ambiguous HU pair: ${key}`);
  assert.equal(pair.filter(p=>p.data.lang==='en').length,1,`Ambiguous EN pair: ${key}`);
  assert(fold(pair.find(p=>p.data.lang==='hu').source).includes(fold(assignment.evidence)),`Missing source anchor: ${key}`);
  for(const id of assignment.entities) {
    assert(graph.entities[id],`Missing entity: ${key}/${id}`);
    if(entityKind(id)==='reference') for(const p of pair)assert(p.source.includes(graph.entities[id].en),`Reference absent from ${p.id}`);
    if(entityKind(id)==='workshop') {
      const name=id.split(':')[1];assert(models.includes(name),`Unknown model: ${id}`);
      for(const p of pair)assert(p.data.model?.src===`/widgets/${name}.html`||p.body.includes(`<!-- lume-model ${name} -->`),`Missing actual model: ${p.id}`);
    }
  }
}
const groups=JSON.parse(await readFile('src/data/article-relations.json','utf8'));
for(const keysOfGroup of [...groups,...graph.pathways.map(p=>p.keys)])for(const key of keysOfGroup)assert(keys.has(key),`Unknown editorial link: ${key}`);
const links=new Set();
for(const link of graph.calendar) {
  const entry=events.find(e=>e.id===link.event),assignment=graph.articles[link.article];
  assert(entry&&assignment,`Missing calendar binding: ${link.event}`);
  assert(graph.entities[`event:${link.event}`],`Missing stable event entity: ${link.event}`);
  assert(!links.has(link.event+link.article),'Duplicate calendar link');links.add(link.event+link.article);
  assert(['family','reference'].includes(link.level)&&link.entities.length,`Invalid calendar precision: ${link.event}`);
  for(const id of link.entities) {
    assert(assignment.entities.includes(id)&&entityKind(id)===link.level,`Incorrect match level: ${link.event}`);
    assert((link.level==='reference'?entry.reference:entry.family).includes(graph.entities[id].en),`No exact calendar evidence: ${link.event}`);
  }
}
const ids=new Set();
for(const collection of graph.collections) {
  assert(!ids.has(collection.id),'Duplicate collection');ids.add(collection.id);
  assert.equal(collection.status,'draft','Publication of collections requires a separate editorial release');
  assert(collection.hu.intro.trim()&&collection.en.intro.trim(),'Missing edited introduction');
  assert.equal(new Set(collection.articles).size,collection.articles.length,'Duplicate collection article');
  for(const key of collection.articles)assert(keys.has(key),`Missing collection member: ${key}`);
  for(const lang of ['hu','en'])assert(collectionContent(collection,posts,lang,now).every(p=>p.data.lang===lang&&new Date(p.data.date)<=now));
}
const published=orderedPublishedPosts(posts,now),coverage=published.map(post=>{
  const assignment=graph.articles[post.data.translationKey];
  const recommendations=rankRelated(post,posts,{now});
  const suggestions=rankRelated(post,posts,{now,limit:20,includeSuggestions:true}).filter(r=>!r.public);
  return {id:post.id,url:sourceUrlOf(post),language:post.data.lang,section:post.data.column,primaryIntent:assignment?.intent??null,
    primaryEntities:assignment?.entities.filter(id=>!['topic','workshop'].includes(entityKind(id)))??[],secondaryTopics:assignment?.entities.filter(id=>entityKind(id)==='topic')??[],
    evidence:assignment?{file:posts.find(p=>p.data.lang==='hu'&&p.data.translationKey===post.data.translationKey).file,anchor:assignment.evidence}:null,
    answers:post.body.split(/\r?\n/).filter(line=>line.startsWith('## ')).map(line=>line.slice(3)),
    recommendations:recommendations.map(r=>({url:sourceUrlOf(r.post),score:r.score,editorial:r.editorial,pathway:Boolean(r.pathway),shared:r.shared})),
    editorialSuggestions:suggestions.map(r=>({url:sourceUrlOf(r.post),shared:r.shared,public:false})),
    warnings:[...(!assignment?['No curated entity assignment; optional editorial review.']:[]),...(!recommendations.length?['No sufficiently justified related article. Do not fill with recency.']:[])]};
});
await mkdir('output/seo-p2-p3',{recursive:true});
await writeFile('output/seo-p2-p3/content-inventory.json',JSON.stringify({generatedAt:now.toISOString(),basis:'Repository content, not search demand. Headings are coverage clues, not verified answers to all search queries.',entities:Object.keys(graph.entities).length,articleVariants:coverage.length,collections:graph.collections,coverage},null,2));
console.log(`Content graph: ${Object.keys(graph.entities).length} entities, ${coverage.length} published variants, ${links.size} exact calendar bindings, ${graph.collections.length} draft collections. Valid.`);
