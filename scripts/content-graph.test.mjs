import {test} from 'node:test';
import assert from 'node:assert/strict';
import {rankRelated,relevance,resolveEntity,collectionContent,calendarArticles,graph} from '../src/lib/content-graph.mjs';
const now=new Date('2026-10-18T10:00:00Z');
const post=(key,extra={})=>({id:`hu/${key}`,data:{translationKey:key,lang:'hu',column:'movement',date:'2026-10-01',...extra}});
test('type-scoped exact aliases, no guessed reference or family inheritance',()=>{
  assert.equal(resolveEntity('Seagull','brand'),'brand:seagull');assert.equal(resolveEntity('Frédérique Constant','brand'),'brand:frederique-constant');
  assert.equal(resolveEntity('Seamaster','reference'),undefined);assert.equal(resolveEntity('some Omega watch','brand'),undefined);
});
test('brand or vague topic alone stays private',()=>{
  assert.equal(relevance(post('rolex-president'),post('todd-beamer-rolex')).public,false);
  assert.equal(relevance(post('kurono-tokyo'),post('otsuka-lotec')).public,false);
  assert.equal(rankRelated(post('rolex-president'),[post('todd-beamer-rolex')],{now}).length,0);
});
test('mechanism beats shared brand; editorial relation beats score',()=>{
  const source=post('co-axial'),sameBrand=post('omega-james-bond'),mechanism=post('gatlomu');
  assert.deepEqual(rankRelated(source,[sameBrand,mechanism],{now}).map(r=>r.post.data.translationKey),['gatlomu','omega-james-bond']);
  assert(rankRelated(post('seagull-1963'),[post('baltic'),post('rattrapante')],{now})[0].editorial);
});
test('no self, twin, duplicate, draft, future or malformed date, including dev inputs',()=>{
  const source=post('co-axial'),target=post('gatlomu');
  const candidates=[source,{...source,id:'hu/duplicate'},post('gatlomu',{lang:'en'}),target,target,post('spring-drive',{draft:true}),post('rattrapante',{date:'2030-01-01'}),post('oszlopkerek',{date:'broken'})];
  assert.deepEqual(rankRelated(source,candidates,{now}).map(r=>r.post.id),['hu/gatlomu']);
  assert.equal(rankRelated(post('co-axial',{date:'2030-01-01'}),[target],{now}).length,0);
});
test('ties deterministic regardless of input order; source array not mutated',()=>{
  const source=post('oszlopkerek'),a=post('speedmaster'),b=post('brew'),input=[a,b];
  assert.deepEqual(rankRelated(source,input,{now}),rankRelated(source,[b,a],{now}));assert.deepEqual(input,[a,b]);
});
test('unknown optional metadata gives no bogus recency suggestions',()=>{
  assert.equal(rankRelated(post('unknown'),[post('co-axial')],{now}).length,0);
});
test('related limit and explicit editorial suggestions',()=>{
  assert.equal(rankRelated(post('rolex-president'),[post('todd-beamer-rolex')],{now,includeSuggestions:true})[0].public,false);
  assert.equal(rankRelated(post('co-axial'),[post('gatlomu')],{now,limit:0}).length,0);
});
test('draft collection and calendar filter language and publication',()=>{
  const c=graph.collections[0],all=[post('co-axial'),post('gatlomu',{draft:true}),post('spring-drive',{lang:'en'})];
  assert.deepEqual(collectionContent(c,all,'hu',now).map(p=>p.id),['hu/co-axial']);
  assert.equal(calendarArticles('omega-james-bond-spectre-2026',[post('omega-james-bond',{date:'2030-01-01'})],'hu',now).length,0);
  assert.equal(calendarArticles('rolex-oyster-perpetual-41-2026',[post('rolex-president')],'hu',now).length,0);
});
