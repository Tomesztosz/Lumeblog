import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { calendarDay, phaseFor, matchesCalendar, daysAway, isRecent, sortCalendar, calendarCounts, focusEntry, needsSourceReview, statusLabel, calendarBoundaryChanged } from '../src/lib/calendar-state.mjs';
import { extractSource, extractNewsFeed, normalUrl, updateQueue, rankCandidates, reviewEntries, candidateKey } from './radar-core.mjs';
import { dailyCandidates, radarHtml } from './radar-report.mjs';
import { validateCalendar } from './calendar-validation.mjs';
import { foldIcsLine } from '../src/lib/ical-lines.mjs';
test('Calendar lines fold without corrupting Hungarian accents', () => {
  const input = 'DESCRIPTION:' + 'Árvíztűrő tükörfúrógép '.repeat(20);
  const folded = foldIcsLine(input);
  for (const line of folded.split('\r\n')) assert(Buffer.byteLength(line) <= 75);
  assert.equal(folded.replace(/\r\n /g,''),input);
});
const release = { id:'mantis',date: '2026-09-01', dateEnd: '2026-09-01', sourceChecked:'2026-09-01',brand:'Studio Underd0g',brandKey:'studio-underd0g', model:'Mantis', family:'02',reference:'02' };
test('Official JavaScript-backed news feeds yield links, never invented release dates', () => {
  const result = extractNewsFeed(JSON.stringify([{url:'/global-en/news/new-watch',title:'<b>New watch</b>',postedDate:'6 Sep 2026'}]),'https://www.seikowatches.com/v3/api/news');
  assert.equal(result.status,'readable'); assert.equal(result.links[0].title,'New watch');
  assert.equal(result.links[0].publishedAt,'2026-09-06');
  assert(!('date' in result.links[0]));
  assert.throws(()=>extractNewsFeed('{"error":"changed"}','https://www.seikowatches.com/v3/api/news'));
});












test('Source parser ignores scripts and navigation, strips tracking, rejects external candidates', () => {
  const html = `<header>noise</header><main><p>${'Watch news '.repeat(40)}</p><a href='/news/new-watch?utm_source=mail'>New watch</a><a href='/preferences-cookies'>Cookies</a><a href='https://evil.test/product/x'>bad</a><script>secret</script></main>`;
  const result = extractSource(html,'https://brand.example/news');
  assert.equal(result.status,'readable'); assert.equal(result.links.length,1);
  assert.equal(result.links[0].url,'https://brand.example/news/new-watch');
  assert.equal(result.hash,extractSource(html.replace('noise','different navigation'),'https://brand.example/news').hash);
  assert.equal(extractSource('<main>Loading</main>','https://brand.example/news').status,'partial');
  assert.equal(normalUrl('javascript:alert(1)','https://brand.example/'),null);
  for (const value of [undefined, null, '', ' ']) assert.equal(normalUrl(value,'https://press.brand.example/'),null);
});
test('Pending candidates survive an unchanged or failed follow-up scan until reviewed', () => {
  const pending=[{url:'https://brand.example/news/1'}];
  assert.deepEqual(updateQueue(pending,[],new Set()),pending);
  assert.equal(updateQueue(pending,pending,new Set()).length,1);
  assert.equal(updateQueue(pending,[],new Set([pending[0].url])).length,0);
});

test('Queue migration deduplicates tracking, trailing slash and syndicated news without resetting age', () => {
  const first={url:'https://www.seikowatches.com/global-en/news/2026/pr/20260909/',title:'Full announcement title',firstSeen:'2026-09-10',baseline:false};
  const updated={url:'https://www.seikowatches.com/us-en/news/2026/pr/20260909?utm_source=email',title:'Read more',firstSeen:'2026-09-14',publishedAt:'2026-09-09',baseline:true};
  const result=updateQueue([first],[updated],new Set());
  assert.equal(result.length,1);assert.equal(result[0].firstSeen,'2026-09-10');assert.equal(result[0].publishedAt,'2026-09-09');assert.equal(result[0].baseline,false);
  assert.equal(result[0].title,first.title);
  assert.equal(updateQueue(result,[],new Set([first.url])).length,0);
  assert.equal(candidateKey('https://brand.example/news/x/'),candidateKey('https://brand.example/news/x'));
});

test('Ranking distinguishes fresh news, genuinely new links, baseline catalogue and historical archives', () => {
  const entries=[
    {url:'https://brand.example/news/2018/old',firstSeen:'2026-09-14'},
    {url:'https://brand.example/products/old',firstSeen:'2026-09-14',baseline:true},
    {url:'https://brand.example/news/fresh',firstSeen:'2026-09-14',publishedAt:'2026-09-13',baseline:true},
    {url:'https://brand.example/products/new',firstSeen:'2026-09-14',baseline:false},
    {url:'https://brand.example/collections/all-watches',firstSeen:'2026-09-14'},
  ];
  const ranked=rankCandidates(entries,new Date('2026-09-14'));
  assert.equal(ranked[0].url,entries[2].url);
  assert.equal(ranked[1].bucket,'review');
  assert.equal(ranked.find(item=>item.url===entries[0].url).bucket,'historical');
  assert.equal(ranked.find(item=>item.url===entries[1].url).bucket,'background');
  assert.equal(ranked.find(item=>item.url===entries[4].url).bucket,'navigation');
  assert(!ranked.some(item=>'date' in item));
  assert.equal(ranked.length,entries.length);
});

test('Changed published sources reopen review without a new link and persist until the exact hash is reviewed', () => {
  const entries=[{...release,sourceUrl:'https://brand.example/news/1',sourceChecked:'2026-09-13'}];
  const sources={'https://brand.example/news/1/':{hash:'a'.repeat(64),changedAt:'2026-09-14T10:00:00Z'}};
  assert.equal(reviewEntries(entries,sources,[],new Date('2026-09-14')).length,1);
  assert.equal(reviewEntries(entries,sources,[{url:entries[0].sourceUrl,hash:'a'.repeat(64)}],new Date('2026-09-14')).length,0);
  assert.equal(reviewEntries(entries,sources,[{url:entries[0].sourceUrl,hash:'b'.repeat(64)}],new Date('2026-09-14')).length,1);
  assert.equal(reviewEntries(entries,{},[],new Date('2026-09-29')).length,1);
});

test('Daily list is bounded and fair across brands; local HTML escapes source text', () => {
  const pending=Array.from({length:90},(_,i)=>({brand:`brand${Math.floor(i/10)}`,bucket:'review',title:'<script>alert(1)</script>',url:`https://brand.example/news/${i}`}));
  const daily=dailyCandidates(pending);
  assert.equal(daily.length,20);
  assert.equal(daily.filter(item=>item.brand==='brand0').length,3);
  const rendered=radarHtml({checkedAt:'2026-09-14',pending,sources:[],reviews:[]});
  assert(!rendered.includes('<script>'));assert(rendered.includes('&lt;script&gt;'));
});
test('Reject fabricated dates and invalid calendar content', async () => {
  const json = async name => JSON.parse(await readFile(`src/data/${name}.json`,'utf8'));
  const dated=await json('releases'), news=await json('announcements'), brands=await json('brand-radar');
  validateCalendar(dated,news,brands);
  assert.throws(()=>validateCalendar(dated,[{...news[0],date:'2026-09-06'}],brands));
  assert.throws(()=>validateCalendar([{...dated[0],date:'2026-02-30'}],news,brands));
  assert.throws(()=>validateCalendar(dated,[{...news[0],sourceUrl:'https://evil.test/watch'}],brands));
  assert.throws(()=>validateCalendar(dated,[{...news[0],copy:{hu:news[0].copy.hu}}],brands));
  assert.throws(()=>validateCalendar([{...dated[0],completedOn:'2027-01-01'}],news,brands));
  assert.throws(()=>validateCalendar([{...dated[0],eventType:'guessed'}],news,brands));
  assert.throws(()=>validateCalendar(dated,[{...news[0],completedOn:'2026-09-06'}],brands));
});
